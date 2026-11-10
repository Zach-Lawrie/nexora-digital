// Farm management tests. Start the dev server with WEATHER_URL=http://localhost:8798/v1/forecast MOCK_AI=1
// Usage: node dev/farm_test.mjs http://localhost:8790 dev/local.db
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
const [BASE, DBF] = process.argv.slice(2);
const db = new DatabaseSync(DBF);
let fails = 0;
const ok = (c, m, x) => { if (!c) { fails++; console.log('FAIL', m, x !== undefined ? JSON.stringify(x).slice(0, 400) : ''); } else console.log('ok  ', m); };
const day = (n) => { const d = new Date(Date.now() + 2 * 3600e3); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// fake Open-Meteo: wet, cool, humid days (late blight weather) and frost on day +1
let weatherCalls = 0;
http.createServer((req, res) => {
  weatherCalls++;
  const dates = Array.from({ length: 21 }, (_, i) => day(i - 14));
  const n = dates.length, fill = (f) => dates.map((_, i) => f(i - 14));
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ current: { temperature_2m: 14, relative_humidity_2m: 92, wind_speed_10m: 8, precipitation: 2, weather_code: 61 },
    daily: { time: dates, temperature_2m_max: fill((d) => (d === 2 ? 36 : 21)), temperature_2m_min: fill((d) => (d === 1 ? 1 : 12)), temperature_2m_mean: fill(() => 17), precipitation_sum: fill((d) => (d >= -3 && d <= 1 ? 6 : 0)),
      precipitation_probability_max: fill(() => 60), wind_speed_10m_max: fill(() => 10), relative_humidity_2m_mean: fill(() => 90), et0_fao_evapotranspiration: fill(() => 4), weather_code: fill(() => 61) } }));
}).listen(8798);
function client() {
  let ck = '';
  const call = async (method, p, body, headers) => {
    const r = await fetch(BASE + '/api' + p, { method, headers: { 'content-type': 'application/json', ...(ck ? { cookie: ck } : {}), ...(headers || {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc) ck = sc.split(';')[0];
    const t = r.headers.get('content-type') || '';
    return { status: r.status, data: t.includes('json') ? await r.json() : await r.text() };
  };
  return { get: (p) => call('GET', p), post: (p, b, h) => call('POST', p, b || {}, h), raw: call };
}
const PNG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
const fa = client();
await fa.post('/auth/signup', { role: 'farmer', name: 'Tapiwa Moyo', phone: '0773 900 100', password: 'tapiwa123', region: 'Mashonaland East', town: 'Marondera', business: 'Moyo Farm' });
ok((await fa.get('/farm/overview')).status === 404, 'no farm until set up');
let r = await fa.post('/farm', { name: 'Moyo Farm', size_ha: 12, region: 'Mashonaland East', town: 'Marondera' });
ok(r.status === 201, 'farm created');
ok((await fa.get('/farm')).data.farm.lat === -18.19, 'location defaults to province centre');
r = await fa.post('/farm/fields', { name: 'Block A', size_ha: 2, irrigation: 'Drip', soil: 'sandy loam' });
const FIELD = r.data.id;
await fa.post('/farm/fields', { name: 'Block B', size_ha: 3 });
ok((await fa.post('/farm/fields', { name: 'Block C' })).status === 402, 'free plan limited to 2 fields');
r = await fa.post('/farm/plantings', { crop: 'Tomatoes', variety: 'Star 9037', field_id: FIELD, planted: day(-30) });
const TOM = r.data.id;
ok(r.status === 201 && r.data.tasks >= 5, `tomatoes added with ${r.data.tasks} calendar tasks`);
r = await fa.get('/farm/plantings/' + TOM);
ok(r.data.item.st.stage === 'Vegetative growth' && r.data.item.area_ha === 2 && r.data.item.expected_yield === 4000 && r.data.item.expected_harvest === day(80), `stage ${r.data.item.st.stage}, yield ${r.data.item.expected_yield}, harvest ${r.data.item.expected_harvest}`, r.data.item);
ok(r.data.tasks.every((t) => t.due >= day(-3)) && r.data.tasks.some((t) => t.input === 'Crop chemicals'), 'old tasks skipped, input suggestions attached');
await fa.post('/farm/plantings', { crop: 'Maize', field_id: FIELD + 1, planted: day(-10), area_ha: 3 });
r = await fa.post('/farm/plantings', { crop: 'Broilers', planted: day(-5), count: 500 });
ok(r.status === 201, 'broiler batch added');
const BRO = r.data.id;
ok((await fa.get('/farm/plantings/' + BRO)).data.item.kind === 'livestock', 'broilers tracked as livestock');
ok((await fa.post('/farm/plantings', { crop: 'Cabbage', planted: day(0) })).status === 402, 'free plan limited to 3 active crops');
ok((await fa.post('/farm/plantings/' + BRO + '/log', { kind: 'mortality', qty: 4, notes: 'heat' })).status === 201 && (await fa.get('/farm/plantings/' + BRO)).data.item.count === 496, 'mortality reduces bird count');

// weather + digest
r = await fa.get('/farm/overview');
const titles = r.data.alerts.map((a) => a.title).join(' | ');
ok(/Frost/.test(titles) && /Heat/.test(titles) && /Late blight/.test(titles), 'weather alerts: ' + titles);
ok(r.data.weather && r.data.weather.next.length === 7, '7-day forecast');
ok(r.data.advice.some((a) => /spraying/i.test(a)) && r.data.advice.some((a) => /irrigation|Rain has covered/i.test(a)), 'spray window and irrigation advice');
ok(r.data.suggestions.length >= 3, `${r.data.suggestions.length} suggestions: ` + r.data.suggestions.map((s) => s.icon).join(''));
const notes = (await fa.get('/notifications')).data.items.map((n) => n.text);
ok(notes.some((t) => /Frost/.test(t)) && notes.some((t) => /Farm today/.test(t)), 'farmer alerted (frost + daily summary)');
const wc = weatherCalls; await fa.get('/farm/overview'); ok(weatherCalls === wc, 'weather cached');

// tasks
const tasks = (await fa.get('/farm/tasks')).data.items;
r = await fa.post('/farm/tasks', { title: 'Check irrigation lines', due: day(0), repeat_days: 7 });
ok((await fa.post('/farm/tasks', { id: r.data.id, done: 1 })).status === 200 && (await fa.get('/farm/tasks')).data.items.some((t) => t.title === 'Check irrigation lines' && t.due === day(7)), 'repeating task comes back in 7 days');

// workers + payroll
const w1 = (await fa.post('/farm/workers', { name: 'John Banda', role: 'General hand', pay_type: 'daily', rate: 6 })).data.id;
const w2 = (await fa.post('/farm/workers', { name: 'Mary Phiri', role: 'Picker', pay_type: 'piece', rate: 0.5 })).data.id;
const w3 = (await fa.post('/farm/workers', { name: 'Peter Gora', role: 'Supervisor', pay_type: 'monthly', rate: 200 })).data.id;
ok((await fa.post('/farm/workers', { name: 'Extra', rate: 1 })).status === 402, 'free plan limited to 3 workers');
for (const d of [-2, -1, 0]) await fa.post('/farm/attendance', { date: day(d), items: [{ worker_id: w1, status: d === -1 ? 'half' : 'present' }, { worker_id: w2, status: 'present', piece_qty: 40 }, { worker_id: w3, status: 'present' }] });
ok((await fa.post('/farm/attendance', { date: day(1), items: [] })).status === 400, 'no attendance in the future');
await fa.post('/farm/advances', { worker_id: w1, amount: 5, note: 'transport money' });
r = await fa.post('/farm/payroll', { from: day(-2), to: day(0) });
ok(r.status === 201, 'pay run created');
const RUN = r.data.id;
r = await fa.get('/farm/payroll/' + RUN);
const john = r.data.items.find((i) => i.name === 'John Banda'), mary = r.data.items.find((i) => i.name === 'Mary Phiri'), pete = r.data.items.find((i) => i.name === 'Peter Gora');
ok(john.days === 2.5 && john.gross === 15 && john.advances === 5 && john.net === 10, `John: 2.5 days × 6 = 15, less advance 5 = ${john.net}`);
ok(mary.units === 120 && mary.gross === 60, `Mary: 120 units × 0.5 = ${mary.gross}`);
ok(pete.gross === 20, `Peter: monthly 200 prorated 3/30 days = ${pete.gross}`);
ok((await fa.post('/farm/payroll', { from: day(-1), to: day(0) })).status === 409, 'overlapping pay run blocked');
await fa.post('/farm/payroll', { id: RUN, items: [{ id: mary.id, bonus: 5, deductions: 0 }] });
r = await fa.post('/farm/payroll', { id: RUN, pay: 1 });
ok(r.data.total === 100, 'paid: total labour 15+65+20 = ' + r.data.total);
ok((await fa.get('/farm/workers/' + w1)).data.advances[0].run_id === RUN, 'advance cleared by payroll');

// inventory + withholding + low stock
r = await fa.post('/farm/inventory', { name: 'Mancozeb', category: 'Crop chemicals', unit: 'kg', reorder: 9, withholding_days: 7, qty: 10, cost: 50, book: true });
const MAN = r.data.id;
await fa.post('/farm/stock', { item_id: MAN, kind: 'use', qty: 2, planting_id: TOM });
r = await fa.get('/farm/inventory');
const man = r.data.items.find((i) => i.id === MAN);
ok(man.qty === 8 && man.unit_cost === 5 && man.low, 'stock used: 8 kg left at $5/kg, flagged low');
ok((await fa.get('/notifications')).data.items.some((n) => /Mancozeb is running low/.test(n.text)), 'low-stock alert sent');
ok((await fa.post('/farm/stock', { item_id: MAN, kind: 'use', qty: 50 })).status === 400, 'cannot use more than in stock');
r = await fa.get('/farm/plantings/' + TOM);
ok(r.data.safe && r.data.safe.date === day(7) && r.data.logs.some((g) => g.kind === 'spray'), 'spray logged, safe to harvest from ' + (r.data.safe || {}).date);
r = await fa.post('/listings', { planting_id: TOM, crop: 'Tomatoes', unit: 'crate', qty: 50, price: 6, best_before: day(10) });
ok(r.status === 409 && /withholding/i.test(r.data.error), 'listing blocked during withholding period');
r = await fa.post('/listings', { planting_id: TOM, crop: 'Tomatoes', unit: 'crate', qty: 50, price: 6, best_before: day(10), confirm_withholding: true });
const LIST = r.data.id;
ok(r.status === 201, 'listing allowed after farmer confirms');
await fa.post('/farm/inventory', { name: 'Broiler starter', category: 'Animal feed', unit: '50kg bag', qty: 10, cost: 300, book: true });

// money
await fa.post('/farm/accounts', { kind: 'expense', category: 'Fuel', amount: 40, note: 'Diesel for pump' });
r = await fa.get('/farm/accounts');
const cats = Object.fromEntries(r.data.cats.map((c) => [c.category, c.total]));
ok(cats.Labour === 100 && cats.Inputs === 50 && cats.Feed === 300 && cats.Fuel === 40, 'books: labour, inputs, feed, fuel recorded', cats);
ok((await fa.post('/farm/accounts', { id: r.data.items.find((a) => a.auto_ref).id, delete: 1 })).status === 400, 'automatic entries are protected');
ok(/date,kind,category,amount/.test((await fa.get('/farm/export/accounts')).data), 'accounts CSV for the accountant');

// a real sale books income against the crop; inputs bought on FreeFarm book as expense
const buyer = client();
await buyer.post('/auth/signup', { role: 'buyer', buyer_type: 'Retailer / shop', name: 'Ruth Shop', phone: '0712 900 200', password: 'ruthshop1', region: 'Harare' });
r = await buyer.post('/orders', { listing_id: LIST, qty: 10 });
await fa.post('/orders/' + r.data.id + '/status', { to: 'accepted' });
await buyer.post('/orders/' + r.data.id + '/status', { to: 'completed' });
r = await fa.get('/farm/plantings/' + TOM);
ok(r.data.money.some((m) => m.category === 'Produce sales' && m.amount === 60), 'sale booked to the tomato crop ($60)');
const sup = client();
r = await sup.post('/auth/signup', { role: 'supplier', name: 'Agro Dealer', business: 'Marondera Agro', phone: '0774 900 300', password: 'agrodeal1', region: 'Mashonaland East' });
ok(r.status === 201 && r.data.user.role === 'supplier', 'supplier signs up');
r = await sup.post('/listings', { crop: 'Fertiliser', variety: 'Compound D 50kg', unit: 'each', qty: 100, price: 38 });
ok(r.status === 201, 'supplier lists fertiliser');
const FERT = r.data.id;
ok((await client().get('/listings?category=Farm%20inputs')).data.items.some((l) => l.id === FERT), 'inputs store shows it');
r = await fa.post('/orders', { listing_id: FERT, qty: 2 });
ok(r.status === 201, 'farmer orders fertiliser');
await sup.post('/orders/' + r.data.id + '/status', { to: 'accepted' });
await fa.post('/orders/' + r.data.id + '/status', { to: 'completed' });
ok((await fa.get('/farm/accounts')).data.items.some((a) => a.category === 'Inputs' && a.amount === 76), 'fertiliser purchase booked as an input expense');
ok((await fa.get('/orders')).data.items.length === 2, 'farmer sees both sales and purchases');

// AI plant doctor + outbreak alerts
r = await fa.post('/farm/scan', { photo: PNG, planting_id: TOM, notes: 'spots after rain' });
ok(r.status === 201 && r.data.result.problem === 'Late blight' && r.data.result.act_now.length === 3, 'AI scan: ' + r.data.result.problem);
ok((await fa.get('/farm/tasks')).data.items.some((t) => /Treat Late blight/.test(t.title)), 'treatment task created');
ok((await fa.get('/farm/photo/scan/' + r.data.id)).status === 200, 'scan photo stored');
const others = [];
for (const [n, ph] of [['Grace', '0773 900 401'], ['Simba', '0773 900 402']]) {
  const c = client();
  await c.post('/auth/signup', { role: 'farmer', name: n + ' Dube', phone: ph, password: 'farmer123', region: 'Mashonaland East' });
  await c.post('/farm', { name: n + "'s plot", region: 'Mashonaland East' });
  await c.post('/farm/plantings', { crop: 'Tomatoes', planted: day(-40), area_ha: 1 });
  others.push(c);
}
const watcher = client();
await watcher.post('/auth/signup', { role: 'farmer', name: 'Watcher', phone: '0773 900 403', password: 'farmer123', region: 'Mashonaland East' });
await watcher.post('/farm', { name: 'Watch farm', region: 'Mashonaland East' });
await watcher.post('/farm/plantings', { crop: 'Tomatoes', planted: day(-20), area_ha: 1 });
await others[0].post('/farm/scan', { photo: PNG, crop: 'Tomatoes' });
await others[1].post('/farm/scan', { photo: PNG, crop: 'Tomatoes' });
ok((await watcher.get('/notifications')).data.items.some((n) => /Outbreak alert: Late blight/.test(n.text)), 'nearby tomato farmer gets outbreak alert after 3 farms report it');
ok((await watcher.get('/farm/overview')).data.outbreaks.length === 1, 'outbreak shown on overview');
for (let i = 0; i < 2; i++) await fa.post('/farm/scan', { photo: PNG, crop: 'Tomatoes' });
ok((await fa.post('/farm/scan', { photo: PNG, crop: 'Tomatoes' })).status === 402, 'free plan: 3 scans a month');

// advisor
r = await fa.post('/farm/ask', { q: 'When do I top-dress my maize?' });
ok(r.status === 200 && /AN/.test(r.data.a), 'advisor answers');
await fa.post('/farm/ask', { q: 'question two' }); await fa.post('/farm/ask', { q: 'question three' });
ok((await fa.post('/farm/ask', { q: 'question four' })).status === 402, 'free plan: 3 advisor questions a month');

// sensors + automations need Farm Manager
ok((await fa.post('/farm/sensors', { name: 'Soil A', metric: 'soil_moisture' })).status === 402, 'sensors need Farm Manager');
r = await fa.post('/farm/rules', { source: 'weather', metric: 'tmin', op: '<', value: 3, action: 'task', message: 'Cover the nursery tonight' });
ok(r.status === 201, 'weather rule allowed on free plan');
db.prepare("UPDATE users SET plan='farm', plan_until=? WHERE phone='+263773900100'").run(day(30));
ok((await fa.post('/farm/plantings', { crop: 'Cabbage', planted: day(0) })).status === 201, 'Farm Manager: no crop limit');
r = await fa.post('/farm/sensors', { name: 'Soil A', metric: 'soil_moisture', field_id: FIELD });
const SEN = r.data.id;
await fa.post('/farm/rules', { source: 'sensor:' + SEN, op: '<', value: 20, action: 'alert', message: 'Block A is dry: start drip' });
const key = (await fa.get('/farm/sensors')).data.key;
ok(/^[a-f0-9]{40}$/.test(key), 'device key issued');
ok((await client().post('/farm/data', { key: 'f'.repeat(40), readings: [] })).status === 401, 'wrong device key rejected');
r = await client().post('/farm/data', { readings: [{ sensor: 'Soil A', value: 15 }] }, { 'x-farm-key': key });
ok(r.data.saved === 1 && r.data.fired === 1, 'sensor reading saved and rule fired');
ok((await fa.get('/notifications')).data.items.some((n) => /Block A is dry/.test(n.text)), 'farmer alerted by sensor automation');
r = await client().post('/farm/data', { key, readings: [{ sensor: 'Soil A', value: 14 }] });
ok(r.data.fired === 0, 'automation does not spam (6 h cool-down)');
db.prepare("DELETE FROM farm_sent WHERE k LIKE 'digest:%'").run();
await fa.get('/farm/overview');
ok((await fa.get('/farm/tasks')).data.items.some((t) => t.title === 'Cover the nursery tonight'), 'weather rule created a task (frost forecast)');
// harvest into store
r = await fa.post('/farm/plantings/' + TOM + '/log', { kind: 'harvest', qty: 30, to_store: true });
ok(r.status === 201 && (await fa.get('/farm/plantings/' + TOM)).data.item.harvested_qty === 30 && (await fa.get('/farm/inventory')).data.items.some((i) => i.name === 'Tomatoes (harvest)' && i.qty === 30), 'harvest recorded and put in store');
ok((await buyer.get('/farm/overview')).status === 403, 'buyers have no farm section');
console.log(fails ? fails + ' FAILED' : 'ALL FARM CHECKS OK');
process.exit(fails ? 1 : 0);
