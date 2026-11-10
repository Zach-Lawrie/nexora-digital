// API flow tests. Usage: node dev/flow.mjs http://localhost:8790 dev/local.db
import { DatabaseSync } from 'node:sqlite';
const [BASE, DBF] = process.argv.slice(2);
const db = new DatabaseSync(DBF);
let fails = 0;
const ok = (c, m, x) => { if (!c) { fails++; console.log('FAIL', m, x !== undefined ? JSON.stringify(x).slice(0, 300) : ''); } else console.log('ok  ', m); };
function client() {
  let ck = '';
  const call = async (method, p, body) => {
    const r = await fetch(BASE + '/api' + p, { method, headers: { 'content-type': 'application/json', ...(ck ? { cookie: ck } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc) ck = sc.split(';')[0];
    const t = r.headers.get('content-type') || '';
    return { status: r.status, data: t.includes('json') ? await r.json() : await r.text() };
  };
  return { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b || {}) };
}
const day = (n) => { const d = new Date(Date.now() + 2 * 3600e3); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const pub = client();
let r = await pub.get('/lookups');
ok(r.status === 200 && r.data.plans.farmer[1].price === 3 && r.data.fee === 0.3, 'lookups with plans and $0.30 fee');
r = await pub.get('/listings');
ok(r.data.items.length === 16 && r.data.items.every((l) => l.demo), 'public market shows 16 example listings');
ok(r.data.items.some((l) => l.rescue) && r.data.items.find((l) => l.rescue).eff_price < r.data.items.find((l) => l.rescue).price, 'rescue deals discounted');
ok((await pub.get('/listings?kind=preharvest')).data.items.length === 2, 'pre-harvest filter');
ok((await pub.get('/listings?q=Kariba')).data.items.length === 2, 'search by town');
ok((await pub.post('/orders', { listing_id: 1, qty: 1 })).status === 401, 'must sign in to buy');

// sign up real users
const farmer = client(), buyer = client(), driver = client(), admin = client();
r = await farmer.post('/auth/signup', { role: 'farmer', name: 'Joseph Marime', phone: '0773 111 222', password: 'farmpass1', country: 'Zimbabwe', region: 'Mashonaland East', town: 'Bindura', business: 'Marime Gardens' });
ok(r.status === 201 && r.data.user.phone === '+263773111222' && r.data.user.plan === 'free', 'farmer signs up, phone normalised', r.data);
ok((await client().post('/auth/signup', { role: 'farmer', name: 'Dup', phone: '+263773111222', password: 'farmpass1' })).status === 409, 'duplicate phone blocked');
r = await buyer.post('/auth/signup', { role: 'buyer', buyer_type: 'Supermarket', name: 'Agnes Tembo', business: 'Tembo Supermarket', phone: '0782 333 444', email: 'agnes@tembo.test', password: 'buypass12', region: 'Harare', town: 'Borrowdale', plan: 'business' });
ok(r.status === 201 && r.data.user.plan === 'business' && r.data.user.plan_until === day(30), 'business buyer gets 30-day trial', r.data);
r = await driver.post('/auth/signup', { role: 'transporter', name: 'Peter Sibanda', phone: '0712 555 666', password: 'drivepass', region: 'Harare', vehicle: '5-tonne truck', capacity_kg: 5000 });
ok(r.status === 201, 'transporter signs up');
db.prepare("UPDATE users SET must_change=0 WHERE role='admin'").run();
ok((await admin.post('/auth/login', { login: 'admin@freefarm.test', password: 'Admin-Pass-123' })).status === 200, 'admin signs in with email');
ok((await client().post('/auth/login', { login: '0773111222', password: 'farmpass1' })).status === 200, 'farmer signs in with phone 077…');
ok((await buyer.post('/orders', { listing_id: 1, qty: 5 })).status === 400, 'example listings cannot be ordered by real buyers');

// listings + limits
const mk = (o) => farmer.post('/listings', { crop: 'Tomatoes', unit: 'crate', qty: 50, price: 6, min_order: 2, best_before: day(6), region: 'Mashonaland East', town: 'Bindura', delivery: 'both', ...o });
r = await mk({ rescue_pct: 30 });
const L1 = r.data.id;
ok(r.status === 201 && r.data.matched >= 0, 'farmer lists tomatoes', r.data);
ok((await mk({ kind: 'preharvest', available_from: day(40) })).status === 402, 'pre-harvest needs Farmer Pro');
await mk({ crop: 'Onions', unit: '10kg pocket' }); await mk({ crop: 'Cabbage', unit: 'head', price: 0.5, qty: 300, min_order: 20 });
ok((await mk({ crop: 'Carrots', unit: 'kg' })).status === 402, 'starter limited to 3 live listings');
ok((await farmer.post('/listings', { crop: 'Not a crop', unit: 'kg', qty: 1, price: 1 })).status === 400, 'unknown crop rejected');
ok((await buyer.post('/listings', { crop: 'Tomatoes', unit: 'kg', qty: 1, price: 1 })).status === 403, 'buyer cannot list produce');
r = await pub.get('/listings/' + L1);
ok(r.data.item.rescue === false && r.data.item.days_left === 6, 'rescue discount not active yet (6 days left)');

// order flow
r = await buyer.post('/orders', { listing_id: L1, qty: 1 });
ok(r.status === 400, 'minimum order enforced');
ok((await buyer.post('/orders', { listing_id: L1, qty: 60 })).status === 400, 'cannot order more than stock');
r = await buyer.post('/orders', { listing_id: L1, qty: 10, delivery: 'transport', address: 'Tembo Supermarket, Borrowdale', payment: 'ecocash', note: 'Grade A please' });
const O1 = r.data.id;
ok(r.status === 201 && /^FF-\d{4}-0001$/.test(r.data.number), 'buyer orders 10 crates: ' + r.data.number, r.data);
ok((await pub.get('/listings/' + L1)).data.item.qty === 40, 'stock reserved');
r = await buyer.get('/orders/' + O1);
ok(r.data.item.farmer_phone === null && r.data.item.total === 60, 'phones hidden until accepted, total 60');
ok((await buyer.post('/orders/' + O1 + '/status', { to: 'accepted' })).status === 403, 'buyer cannot accept own order');
ok((await driver.get('/orders/' + O1)).status === 404, 'transporter cannot see order before booking');
r = await farmer.post('/orders/' + O1 + '/status', { to: 'accepted' });
ok(r.status === 200, 'farmer accepts');
r = await buyer.get('/orders/' + O1);
ok(r.data.item.farmer_phone === '+263773111222' && r.data.item.job_id, 'phones shared after accept, transport load created');
const J1 = r.data.item.job_id;
r = await driver.get('/jobs?scope=open');
ok(r.data.items.some((j) => j.id === J1 && /Tomatoes/.test(j.load)) && r.data.items.find((j) => j.id === J1).weight_kg === 250, 'load on transport board with 250 kg');
ok((await driver.get('/notifications')).data.items.some((n) => /New load/.test(n.text)), 'transporter alerted about the load');
ok((await driver.post('/jobs/' + J1 + '/bid', { price: 45, note: 'Tomorrow 7am' })).status === 200, 'transporter sends price');
r = await buyer.get('/jobs/' + J1);
ok(r.data.bids.length === 1 && r.data.bids[0].price === 45, 'buyer sees the price');
ok((await buyer.post('/jobs/' + J1 + '/accept', { bid_id: r.data.bids[0].id })).status === 200, 'buyer picks transporter');
ok((await driver.get('/orders/' + O1)).status === 200, 'transporter can now see order');
ok((await buyer.post('/orders/' + O1 + '/message', { text: 'Please call when 10 min away' })).status === 200, 'buyer messages');
ok((await driver.post('/jobs/' + J1 + '/status', { to: 'picked' })).status === 200, 'transporter picks up');
ok((await buyer.get('/orders/' + O1)).data.item.status === 'on_the_way', 'order on the way');
ok((await driver.post('/jobs/' + J1 + '/status', { to: 'delivered' })).status === 200, 'transporter delivers');
ok((await buyer.get('/orders/' + O1)).data.item.status === 'delivered', 'order delivered');
ok((await buyer.post('/orders/' + O1 + '/status', { to: 'completed' })).status === 200, 'buyer confirms receipt');
ok((await buyer.post('/orders/' + O1 + '/rate', { rating: 5, review: 'Excellent tomatoes' })).status === 200, 'buyer rates 5 stars');
ok((await buyer.post('/jobs/' + J1 + '/rate', { rating: 4 })).status === 200, 'buyer rates transporter');
r = await farmer.get('/billing');
ok(r.data.balance === 0.3 && r.data.ledger[0].kind === 'fee' && r.data.ledger[0].ref.startsWith('FF-'), 'farmer owes $0.30 commission');
ok((await driver.get('/billing')).data.balance === 0.3, 'transporter owes $0.30 on delivery');
ok((await buyer.get('/billing')).data.balance === 0, 'buyer pays no fee (seller pays)');
ok((await farmer.post('/orders/' + O1 + '/paid')).status === 200, 'farmer marks payment received');

// buy request + offer
ok((await buyer.post('/requests', { crop: 'Onions', qty: 30, unit: '10kg pocket', max_price: 8, repeat: 'weekly', region: 'Harare' })).status === 201, 'business buyer posts weekly request');
const REQ = (await buyer.get('/requests?mine=1')).data.items[0].id;
ok((await farmer.get('/notifications')).data.items.some((n) => /Buyer wants 30/.test(n.text)), 'onion farmer alerted');
ok((await farmer.post('/requests/' + REQ + '/offer', { qty: 30, price: 7.5, available_from: day(2) })).status === 201, 'farmer sends offer');
ok((await farmer.post('/requests/' + REQ + '/offer', { qty: 30, price: 7 })).status === 409, 'one pending offer per farmer');
r = await buyer.get('/requests/' + REQ);
ok(r.data.offers.length === 1 && r.data.mine, 'buyer sees offer');
r = await buyer.post('/offers/' + r.data.offers[0].id, { delivery: 'farmer', address: 'Borrowdale', payment: 'cash' });
ok(r.status === 201, 'buyer accepts offer, order created ' + r.data.number);
const O2 = r.data.order_id;
ok((await buyer.get('/requests?mine=1')).data.items[0].status === 'open', 'weekly request stays open');
ok((await farmer.post('/orders/' + O2 + '/status', { to: 'delivered' })).status === 200, 'farmer delivers own order');
ok((await buyer.post('/orders/' + O2 + '/status', { to: 'disputed' })).status === 400, 'dispute needs reason');
ok((await buyer.post('/orders/' + O2 + '/status', { to: 'disputed', reason: '3 pockets were rotten' })).status === 200, 'buyer reports problem');
ok((await admin.get('/admin/overview')).data.disputes.length === 1, 'admin sees dispute');
ok((await admin.post('/orders/' + O2 + '/status', { to: 'completed' })).status === 200, 'admin resolves dispute');
// cancel restores stock
r = await buyer.post('/orders', { listing_id: L1, qty: 4 });
ok((await buyer.post('/orders/' + r.data.id + '/status', { to: 'cancelled' })).status === 400, 'cancel needs reason');
ok((await buyer.post('/orders/' + r.data.id + '/status', { to: 'cancelled', reason: 'Ordered twice' })).status === 200, 'buyer cancels');
ok((await pub.get('/listings/' + L1)).data.item.qty === 40, 'stock returned after cancel');

// fees block + payment
db.prepare("INSERT INTO ledger (user_id, kind, amount, ref, note) SELECT id, 'fee', 6, 'test', 'test' FROM users WHERE phone='+263773111222'").run();
ok((await mk({ crop: 'Garlic', unit: 'kg' })).status === 402, 'farmer owing more than $5 is paused');
r = await farmer.post('/billing/pay', { purpose: 'fees', amount: 6.6, method: 'ecocash', reference: 'MP261111.1234.A00001' });
ok(r.status === 201, 'farmer submits EcoCash reference');
ok((await farmer.post('/billing/pay', { purpose: 'fees', amount: 6.6, reference: 'MP261111.1234.A00001' })).status === 409, 'same reference rejected');
r = await farmer.post('/billing/pay', { purpose: 'plan', plan: 'pro', months: 12, reference: 'MP261111.1234.A00002' });
ok(r.status === 201 && r.data.amount === 30, 'Farmer Pro yearly = 10 months price ($30)', r.data);
const pays = (await admin.get('/admin/payments')).data.items;
for (const p of pays.filter((x) => x.status === 'pending')) ok((await admin.post('/admin/payments/' + p.id, { confirm: true })).status === 200, 'admin confirms ' + p.purpose);
r = await farmer.get('/billing');
ok(r.data.balance === 0 && r.data.plan === 'pro', 'fees cleared and Farmer Pro active until ' + r.data.plan_until, r.data);
ok((await mk({ kind: 'preharvest', crop: 'Potatoes', unit: '10kg pocket', available_from: day(60), best_before: null })).status === 201, 'Pro farmer posts pre-harvest');
r = await admin.get('/admin/overview');
ok(r.data.fees_total >= 6.9 && r.data.subs_total === 30 && r.data.collected === 6.6, `admin revenue: fees ${r.data.fees_total}, subs ${r.data.subs_total}, collected ${r.data.collected}`, r.data);
ok((await farmer.get('/admin/overview')).status === 403, 'non-admin blocked from admin');
r = await admin.post('/admin/users/' + db.prepare("SELECT id FROM users WHERE phone='+263773111222'").get().id, { reset: true });
ok(r.status === 200 && r.data.password, 'admin resets password');
ok((await admin.post('/admin/settings', { fee: '0.5', fee_payer: 'split' })).status === 200, 'admin changes fee');
ok((await pub.get('/lookups')).data.fee === 0.5, 'new fee published');
await admin.post('/admin/settings', { fee: '0.30', fee_payer: 'seller' });
r = await admin.get('/admin/export/ledger');
ok(r.status === 200 && /kind,amount/.test(r.data), 'ledger CSV export');
// public pages
r = await pub.get('/prices?country=Zimbabwe');
ok(r.data.items.some((x) => x.crop === 'Tomatoes' && x.avg > 0), 'market prices per kg');
r = await pub.get('/stats');
ok(r.data.orders >= 2 && r.data.kg >= 250, `impact: ${r.data.orders} orders, ${r.data.kg} kg moved`);
ok((await pub.get('/directory?role=buyer')).data.items.some((u) => u.business === 'Tembo Supermarket'), 'buyer directory lists businesses');
ok(!(await pub.get('/directory?role=buyer')).data.items.some((u) => u.buyer_type === 'Household'), 'households not listed publicly');
ok(JSON.stringify((await pub.get('/directory?role=farmer')).data).indexOf('+263') === -1, 'directory hides phone numbers');
// examples removable
r = await admin.post('/admin/remove-examples');
ok(r.data.removed === 14 && (await pub.get('/listings')).data.items.every((l) => !l.demo), 'admin removes all example data (' + r.data.removed + ' accounts)');
console.log(fails ? fails + ' FAILED' : 'ALL OK');
