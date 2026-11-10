// FreeFarm API: farm-to-market platform (Cloudflare Pages Function + D1)
// Farmers sell, buyers (households, shops, processors, exporters) buy or post requests,
// transporters move the produce. The platform earns a fixed fee per completed sale and delivery
// plus monthly plan subscriptions.

/* ---------- reference data ---------- */
const COUNTRIES = ['Zimbabwe', 'Zambia', 'Mozambique', 'Malawi', 'South Africa', 'Botswana', 'Namibia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Nigeria', 'Ghana', 'Other'];
const REGIONS = { Zimbabwe: ['Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central', 'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'] };
const CROPS = {
  Vegetables: ['Tomatoes', 'Onions', 'Cabbage', 'Potatoes', 'Sweet potatoes', 'Butternut', 'Carrots', 'Covo / rape', 'Spinach', 'Green peppers', 'Chillies', 'Green beans', 'Peas', 'Cucumbers', 'Okra', 'Lettuce', 'Garlic', 'Pumpkins', 'Green maize'],
  Fruit: ['Oranges', 'Lemons', 'Bananas', 'Avocados', 'Mangoes', 'Apples', 'Peaches', 'Watermelons', 'Pineapples', 'Guavas', 'Papaya', 'Strawberries', 'Blueberries', 'Macadamia', 'Baobab'],
  'Grains & legumes': ['Maize', 'Sugar beans', 'Groundnuts', 'Soya beans', 'Sorghum', 'Millet', 'Wheat', 'Rice', 'Cowpeas', 'Round nuts'],
  'Livestock & poultry': ['Broilers', 'Road-runner chickens', 'Goats', 'Cattle', 'Pigs', 'Sheep', 'Rabbits', 'Turkeys'],
  'Dairy & eggs': ['Fresh milk', 'Eggs', 'Sour milk (lacto)', 'Cheese'],
  Fish: ['Kapenta', 'Bream / tilapia', 'Catfish'],
  Other: ['Honey', 'Mushrooms', 'Herbs', 'Mopane worms', 'Sugar cane', 'Cotton', 'Tobacco', 'Tea', 'Coffee', 'Other produce'],
  'Farm inputs': ['Fertiliser', 'Seed', 'Seedlings', 'Crop chemicals', 'Animal feed', 'Vet medicines', 'Day-old chicks', 'Irrigation equipment', 'Tools & equipment', 'Packaging', 'Other inputs'],
};
const CATEGORY_OF = Object.fromEntries(Object.entries(CROPS).flatMap(([c, l]) => l.map((x) => [x, c])));
const UNITS = { kg: 1, tonne: 1000, '50kg bag': 50, '20kg pocket': 20, '10kg pocket': 10, crate: 25, box: 15, bucket: 20, bunch: 1, head: 1.5, 'tray (30)': 1.8, litre: 1, bird: 2, animal: 1, each: 1 };
const BUYER_TYPES = ['Household', 'Retailer / shop', 'Supermarket', 'Restaurant / hotel', 'School / hospital / institution', 'Processor / factory', 'Exporter', 'Wholesaler / market trader'];
const DELIVERY = ['pickup', 'farmer', 'transport'];
const PAYMENTS = ['cash', 'ecocash', 'bank', 'other'];
const PLANS = {
  farmer: [
    { id: 'free', name: 'Starter', price: 0, perks: ['Up to 3 live produce listings', 'Sell to households, shops, processors and exporters', 'Answer buyer requests', 'Book transport'] },
    { id: 'pro', name: 'Farmer Pro', key: 'price_farmer_pro', perks: ['Unlimited listings', 'Pre-harvest listings: sell before you harvest', 'Shown first in the market', 'Market price insights'] },
    { id: 'farm', name: 'Farm Manager', key: 'price_farmer_farm', perks: ['Everything in Farmer Pro', 'Unlimited fields, crops, livestock and workers', 'Payroll, inventory and farm accounts', 'Unlimited AI plant scans and AI farm advisor', 'Sensors and automations'] },
  ],
  supplier: [
    { id: 'free', name: 'Starter', price: 0, perks: ['Up to 5 live input listings', 'Sell seed, fertiliser, chemicals, feed and equipment to farmers'] },
    { id: 'pro', name: 'Supplier Pro', key: 'price_supplier_pro', perks: ['Unlimited listings', 'Shown first in the inputs store', 'Your products suggested to farmers at the right crop stage'] },
  ],
  buyer: [
    { id: 'free', name: 'Household', price: 0, perks: ['Buy straight from farmers', 'Rescue deals on surplus produce', '1 open buy request'] },
    { id: 'business', name: 'Business buyer', key: 'price_buyer_business', perks: ['Unlimited buy requests', 'Weekly and monthly repeat requests', 'Farmers send you offers'] },
    { id: 'export', name: 'Exporter & processor', key: 'price_buyer_export', perks: ['Everything in Business', 'Bulk and export-ready lots', 'Shown first to farmers'] },
  ],
  transporter: [
    { id: 'free', name: 'Starter', price: 0, perks: ['3 bids a month on loads', 'Get paid directly by the customer'] },
    { id: 'pro', name: 'Transporter Pro', key: 'price_transport_pro', perks: ['Unlimited bids', 'Return-load alerts on your routes', 'Shown first to farmers and buyers'] },
  ],
};
const DEFAULT_SETTINGS = {
  fee: '0.30', fee_payer: 'seller', transport_fee: '0.30', fee_limit: '5', currency: 'USD', trial_days: '30',
  price_farmer_pro: '3', price_farmer_farm: '10', price_supplier_pro: '5', price_buyer_business: '5', price_buyer_export: '15', price_transport_pro: '3',
  pay_ecocash: '', pay_name: 'FreeFarm', pay_bank: '', support_whatsapp: '', auto_complete_hours: '72',
};
const COOKIE = 'ff_s';
const ROLES = ['farmer', 'buyer', 'transporter', 'supplier'];
const SELLERS = ['farmer', 'supplier'];

/* ---------- helpers ---------- */
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const today = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); // Central Africa Time (UTC+2) calendar day
const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5);
const str = (v, max = 500) => (v == null ? '' : String(v)).trim().slice(0, max);
const num = (v, d = null) => { if (v === '' || v == null) return d; const n = Number(v); return Number.isFinite(n) ? n : d; };
const pos = (v, msg) => { const n = num(v); if (n == null || n <= 0) fail(400, msg); return n; };
const dateOr = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null);
const oneOf = (v, list, d) => (list.includes(v) ? v : d);
const r2 = (n) => Math.round(n * 100) / 100;
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const randHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
async function hashPassword(password, saltHex) {
  const salt = saltHex ? new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return { hash: hex(bits), salt: hex(salt) };
}
function safeEqual(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
function passwordRule(p) { if (typeof p !== 'string' || p.length < 8) fail(400, 'Use a password of at least 8 characters.'); if (p.length > 128) fail(400, 'That password is too long.'); }
const tempPassword = () => ['Maize', 'Tomato', 'Mango', 'Harvest', 'Garden', 'Field'][crypto.getRandomValues(new Uint8Array(1))[0] % 6] + '-' + randHex(3).toUpperCase() + '-' + (100 + (crypto.getRandomValues(new Uint16Array(1))[0] % 900));
const DIAL = { Zimbabwe: '263', Zambia: '260', Mozambique: '258', Malawi: '265', 'South Africa': '27', Botswana: '267', Namibia: '264', Kenya: '254', Tanzania: '255', Uganda: '256', Rwanda: '250', Nigeria: '234', Ghana: '233' };
function normPhone(p, country) {
  let d = String(p || '').replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = '+' + d.slice(2);
  if (d.startsWith('0')) d = '+' + (DIAL[country] || '263') + d.slice(1);
  if (!d.startsWith('+')) d = '+' + d;
  return /^\+\d{9,15}$/.test(d) ? d : '';
}
function getCookie(req, name) { const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')); return m ? m[1] : null; }
const cookie = (token, maxAge, secure) => `${COOKIE}=${token}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`;
const all = async (db, sql, ...b) => (await db.prepare(sql).bind(...b).all()).results || [];
const one = (db, sql, ...b) => db.prepare(sql).bind(...b).first();
const run = (db, sql, ...b) => db.prepare(sql).bind(...b).run();
async function audit(env, user, action, detail) { try { await run(env.DB, 'INSERT INTO audit (user_id, who, action, detail) VALUES (?,?,?,?)', user ? user.id : null, user ? user.phone : 'public', action, detail ? String(detail).slice(0, 400) : null); } catch (e) { /* never block */ } }
async function settings(env) {
  const rows = await all(env.DB, 'SELECT key, value FROM settings');
  const s = { ...DEFAULT_SETTINGS };
  for (const r of rows) s[r.key] = r.value;
  return s;
}
const planActive = (u) => u.plan !== 'free' && u.plan_until && u.plan_until >= today();
const planOf = (u) => (planActive(u) ? u.plan : 'free');
function plansFor(role, s) { return (PLANS[role] || []).map((p) => ({ ...p, price: p.key ? Number(s[p.key]) || 0 : 0, key: undefined })); }
const publicUser = (u) => u && ({ id: u.id, phone: u.phone, email: u.email, name: u.name, role: u.role, buyer_type: u.buyer_type, business: u.business, country: u.country, region: u.region, town: u.town, bio: u.bio, crops: u.crops, vehicle: u.vehicle, capacity_kg: u.capacity_kg, cold: !!u.cold, routes: u.routes, plan: planOf(u), plan_chosen: u.plan, plan_until: u.plan_until, verified: !!u.verified, must_change: !!u.must_change, demo: !!u.demo });
async function currentUser(env, req) {
  const t = getCookie(req, COOKIE);
  if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  const u = await one(env.DB, `SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at > ? AND u.status='active'`, t, now());
  return u || null;
}
function need(user, ...roles) {
  if (!user) fail(401, 'Please sign in.');
  if (roles.length && !roles.includes(user.role)) fail(403, 'Your account cannot do that.');
}
async function notify(env, ids, text, link) {
  const list = [...new Set(ids.filter(Boolean))];
  if (list.length) await env.DB.batch(list.map((id) => env.DB.prepare('INSERT INTO notifications (user_id, text, link) VALUES (?,?,?)').bind(id, String(text).slice(0, 300), link || null)));
}
const balance = async (env, uid) => r2((await one(env.DB, 'SELECT COALESCE(SUM(amount),0) b FROM ledger WHERE user_id=?', uid)).b);
async function notBlocked(env, user) {
  if (user.role === 'admin') return;
  const s = await settings(env), b = await balance(env, user.id);
  if (b > (Number(s.fee_limit) || 5)) fail(402, `You owe ${s.currency} ${b.toFixed(2)} in FreeFarm fees. Pay under Plan & billing to continue.`);
}
const adminIds = async (env) => (await all(env.DB, `SELECT id FROM users WHERE role='admin' AND status='active'`)).map((r) => r.id);
function effPrice(l) {
  const left = l.best_before ? daysBetween(today(), l.best_before) : 99;
  const rescue = l.kind === 'now' && l.rescue_pct > 0 && left <= 3;
  return { eff_price: rescue ? r2(l.price * (1 - l.rescue_pct / 100)) : l.price, rescue, days_left: l.best_before ? left : null };
}
const LISTING_COLS = `l.id, l.farmer_id, l.kind, l.crop, l.category, l.variety, l.grade, l.qty, l.unit, l.unit_kg, l.price, l.min_order, l.rescue_pct, l.available_from, l.best_before,
  l.country, l.region, l.town, l.delivery, l.organic, l.export_ready, l.notes, l.status, l.views, l.created_at, l.updated_at, (l.photo IS NOT NULL) AS has_photo,
  u.name AS farmer, u.business AS farm, u.verified, u.demo, u.plan AS f_plan, u.plan_until AS f_until,
  (SELECT ROUND(AVG(rating),1) FROM orders o WHERE o.farmer_id=u.id AND o.rating IS NOT NULL) AS rating,
  (SELECT COUNT(*) FROM orders o WHERE o.farmer_id=u.id AND o.status='completed') AS sales`;
const shapeListing = (l) => ({ ...l, ...effPrice(l), pro: l.f_plan !== 'free' && l.f_until >= today(), f_plan: undefined, f_until: undefined, organic: !!l.organic, export_ready: !!l.export_ready, has_photo: !!l.has_photo, verified: !!l.verified, demo: !!l.demo });
async function nextNumber(env) {
  const p = 'FF-' + today().slice(2, 4) + today().slice(5, 7) + '-';
  const last = await one(env.DB, 'SELECT number FROM orders WHERE number LIKE ? ORDER BY id DESC LIMIT 1', p + '%');
  return p + String((last ? parseInt(last.number.slice(p.length), 10) : 0) + 1).padStart(4, '0');
}

/* ---------- money: fixed fee per completed transaction ---------- */
async function chargeOrderFee(env, o) {
  const s = await settings(env), fee = Number(s.fee) || 0;
  if (!fee || o.fee) return;
  const rows = s.fee_payer === 'buyer' ? [[o.buyer_id, fee]] : s.fee_payer === 'split' ? [[o.farmer_id, r2(fee / 2)], [o.buyer_id, r2(fee / 2)]] : [[o.farmer_id, fee]];
  await env.DB.batch([
    ...rows.map(([u, a]) => env.DB.prepare('INSERT INTO ledger (user_id, kind, amount, ref, note) VALUES (?,?,?,?,?)').bind(u, 'fee', a, o.number, `FreeFarm fee: ${o.crop}`)),
    env.DB.prepare('UPDATE orders SET fee=? WHERE id=?').bind(fee, o.id),
  ]);
}
async function chargeJobFee(env, j) {
  const s = await settings(env), fee = Number(s.transport_fee) || 0;
  if (!fee || j.fee || !j.transporter_id) return;
  await env.DB.batch([
    env.DB.prepare('INSERT INTO ledger (user_id, kind, amount, ref, note) VALUES (?,?,?,?,?)').bind(j.transporter_id, 'fee', fee, 'LOAD-' + j.id, 'FreeFarm fee: delivery'),
    env.DB.prepare('UPDATE jobs SET fee=? WHERE id=?').bind(fee, j.id),
  ]);
}

/* ---------- housekeeping (runs at most every 10 minutes, triggered by app use) ---------- */
async function tick(env) {
  const last = await one(env.DB, `SELECT value FROM settings WHERE key='last_tick'`);
  if (last && Date.now() - new Date(last.value).getTime() < 10 * 60000) return;
  await run(env.DB, `INSERT INTO settings (key, value) VALUES ('last_tick', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, now());
  const t = today();
  // warn farmers 2 days before produce goes off, suggesting a rescue deal
  for (const l of await all(env.DB, `SELECT * FROM listings WHERE status='active' AND kind='now' AND warned=0 AND best_before IS NOT NULL AND best_before <= ?`, addDays(t, 2))) {
    await run(env.DB, 'UPDATE listings SET warned=1 WHERE id=?', l.id);
    await notify(env, [l.farmer_id], `${l.crop}: only ${daysBetween(t, l.best_before)} day(s) left. ${l.rescue_pct ? 'Your rescue discount is now showing to buyers.' : 'Add a rescue discount so buyers grab it before it spoils.'}`, '#/listing/' + l.id);
    const fans = (await all(env.DB, 'SELECT user_id FROM follows WHERE crop=?', l.crop)).map((r) => r.user_id).filter((x) => x !== l.farmer_id);
    if (l.rescue_pct) await notify(env, fans, `Rescue deal: ${l.crop} ${l.rescue_pct}% off in ${l.region || l.country}. Buy before it goes to waste.`, '#/listing/' + l.id);
  }
  await run(env.DB, `UPDATE listings SET status='expired' WHERE status='active' AND best_before IS NOT NULL AND best_before < ?`, t);
  await run(env.DB, `UPDATE requests SET status='closed' WHERE status='open' AND repeat='once' AND needed_by IS NOT NULL AND needed_by < ?`, addDays(t, -7));
  // buyer forgot to confirm: complete automatically after the set hours
  const s = await settings(env);
  const cutoff = new Date(Date.now() - (Number(s.auto_complete_hours) || 72) * 3600e3).toISOString();
  for (const o of await all(env.DB, `SELECT * FROM orders WHERE status='delivered' AND delivered_at < ?`, cutoff)) {
    await run(env.DB, `UPDATE orders SET status='completed', completed_at=?, updated_at=? WHERE id=? AND status='delivered'`, now(), now(), o.id);
    await chargeOrderFee(env, o); await bookOrder(env, o);
    await notify(env, [o.buyer_id, o.farmer_id], `${o.number}: marked as received automatically.`, '#/order/' + o.id);
  }
  try { await farmDigests(env, 15); } catch (e) { console.error('farm digests', e); }
  // plan ending soon
  for (const u of await all(env.DB, `SELECT id, plan, plan_until FROM users WHERE plan<>'free' AND plan_until = ?`, addDays(t, 3)))
    await notify(env, [u.id], 'Your FreeFarm plan ends in 3 days. Renew under Plan & billing to keep your benefits.', '#/billing');
}

/* ---------- routes ---------- */
const routes = [];
const on = (method, pattern, handler) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler });

on('GET', '/lookups', async ({ env }) => {
  const s = await settings(env);
  return json({
    countries: COUNTRIES, regions: REGIONS, crops: CROPS, units: UNITS, buyer_types: BUYER_TYPES,
    plans: { farmer: plansFor('farmer', s), buyer: plansFor('buyer', s), transporter: plansFor('transporter', s), supplier: plansFor('supplier', s) },
    fee: Number(s.fee), transport_fee: Number(s.transport_fee), fee_payer: s.fee_payer, fee_limit: Number(s.fee_limit), currency: s.currency, trial_days: Number(s.trial_days), support_whatsapp: s.support_whatsapp,
  });
});

/* auth */
on('POST', '/auth/signup', async ({ env, body, secure }) => {
  const role = oneOf(body.role, ROLES, null);
  if (!role) fail(400, 'Choose what you want to do on FreeFarm.');
  const name = str(body.name, 80), country = oneOf(body.country, COUNTRIES, 'Zimbabwe');
  if (name.length < 2) fail(400, 'Enter your name.');
  const phone = normPhone(body.phone, country);
  if (!phone) fail(400, 'Enter a valid mobile number, for example 0772 123 456.');
  const email = str(body.email, 120).toLowerCase() || null;
  if (email && !emailOk(email)) fail(400, 'That email address does not look right.');
  passwordRule(body.password);
  if (await one(env.DB, 'SELECT id FROM users WHERE phone=? OR (email IS NOT NULL AND email=?)', phone, email || '-')) fail(409, 'An account with that phone number or email already exists. Sign in instead.');
  const s = await settings(env);
  const plan = plansFor(role, s).some((p) => p.id === body.plan) ? body.plan : 'free';
  const until = plan !== 'free' ? addDays(today(), Number(s.trial_days) || 0) : null;
  const { hash, salt } = await hashPassword(body.password);
  const r = await run(env.DB, `INSERT INTO users (phone, email, name, role, buyer_type, business, country, region, town, crops, vehicle, capacity_kg, cold, plan, plan_until, pass_hash, pass_salt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, phone, email, name, role, role === 'buyer' ? oneOf(body.buyer_type, BUYER_TYPES, 'Household') : null, str(body.business, 100) || null, country,
    str(body.region, 60) || null, str(body.town, 60) || null, str(body.crops, 300) || null, role === 'transporter' ? str(body.vehicle, 80) : null, role === 'transporter' ? num(body.capacity_kg) : null, body.cold ? 1 : 0, plan, until, hash, salt);
  const id = r.meta.last_row_id, token = randHex(32);
  await run(env.DB, 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)', token, id, new Date(Date.now() + 30 * 864e5).toISOString());
  await notify(env, await adminIds(env), `New ${role}: ${name}${str(body.business, 100) ? ' (' + str(body.business, 100) + ')' : ''}, ${str(body.region, 60) || country}${plan !== 'free' ? ' · chose ' + plan + ' plan (trial)' : ''}`, '#/admin/users');
  await audit(env, { id, phone }, 'signed up', role + ' ' + plan);
  const u = await one(env.DB, 'SELECT * FROM users WHERE id=?', id);
  return json({ user: publicUser(u) }, 201, { 'set-cookie': cookie(token, 30 * 86400, secure) });
});
on('POST', '/auth/login', async ({ env, body, secure }) => {
  const login = str(body.login, 120).toLowerCase();
  const phone = normPhone(login, 'Zimbabwe');
  const u = await one(env.DB, 'SELECT * FROM users WHERE (email IS NOT NULL AND email=?) OR phone=?', login, phone || '-');
  if (u && u.locked_until && u.locked_until > now()) fail(429, 'Too many wrong attempts. Try again in 15 minutes.');
  const ok = u && u.status === 'active' && safeEqual((await hashPassword(String(body.password || ''), u.pass_salt)).hash, u.pass_hash);
  if (!ok) {
    if (u) { const f = u.failed + 1; await run(env.DB, 'UPDATE users SET failed=?, locked_until=? WHERE id=?', f >= 8 ? 0 : f, f >= 8 ? new Date(Date.now() + 15 * 60e3).toISOString() : null, u.id); }
    fail(401, u && u.status !== 'active' ? 'This account is switched off. Contact FreeFarm support.' : 'Phone/email or password is wrong.');
  }
  const token = randHex(32);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),
    env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)').bind(token, u.id, new Date(Date.now() + 30 * 864e5).toISOString()),
    env.DB.prepare('UPDATE users SET failed=0, locked_until=NULL, last_login=? WHERE id=?').bind(now(), u.id),
  ]);
  return json({ user: publicUser(u) }, 200, { 'set-cookie': cookie(token, 30 * 86400, secure) });
});
on('POST', '/auth/logout', async ({ env, req, secure }) => {
  const t = getCookie(req, COOKIE); if (t) await run(env.DB, 'DELETE FROM sessions WHERE token=?', t);
  return json({ ok: true }, 200, { 'set-cookie': cookie('', 0, secure) });
});
on('GET', '/me', async ({ env, user }) => {
  if (!user) return json({ user: null });
  return json({ user: publicUser(user), balance: await balance(env, user.id), follows: (await all(env.DB, 'SELECT crop FROM follows WHERE user_id=?', user.id)).map((r) => r.crop) });
});
on('POST', '/me/profile', async ({ env, user, body }) => {
  need(user);
  const name = str(body.name, 80); if (name.length < 2) fail(400, 'Enter your name.');
  const email = str(body.email, 120).toLowerCase() || null;
  if (email && !emailOk(email)) fail(400, 'That email address does not look right.');
  if (email && await one(env.DB, 'SELECT id FROM users WHERE email=? AND id<>?', email, user.id)) fail(409, 'Another account uses that email.');
  await run(env.DB, `UPDATE users SET name=?, email=?, business=?, country=?, region=?, town=?, bio=?, crops=?, buyer_type=?, vehicle=?, capacity_kg=?, cold=?, routes=? WHERE id=?`,
    name, email, str(body.business, 100) || null, oneOf(body.country, COUNTRIES, user.country), str(body.region, 60) || null, str(body.town, 60) || null, str(body.bio, 600) || null, str(body.crops, 300) || null,
    user.role === 'buyer' ? oneOf(body.buyer_type, BUYER_TYPES, user.buyer_type || 'Household') : user.buyer_type, str(body.vehicle, 80) || null, num(body.capacity_kg), body.cold ? 1 : 0, str(body.routes, 300) || null, user.id);
  return json({ ok: true });
});
on('POST', '/me/password', async ({ env, user, body }) => {
  need(user);
  if (!safeEqual((await hashPassword(String(body.current || ''), user.pass_salt)).hash, user.pass_hash)) fail(400, 'Your current password is wrong.');
  passwordRule(body.password);
  const { hash, salt } = await hashPassword(body.password);
  await run(env.DB, 'UPDATE users SET pass_hash=?, pass_salt=?, must_change=0 WHERE id=?', hash, salt, user.id);
  return json({ ok: true });
});
on('POST', '/me/follows', async ({ env, user, body }) => {
  need(user);
  const crops = (Array.isArray(body.crops) ? body.crops : []).filter((c) => CATEGORY_OF[c]).slice(0, 30);
  await env.DB.batch([env.DB.prepare('DELETE FROM follows WHERE user_id=?').bind(user.id), ...crops.map((c) => env.DB.prepare('INSERT OR IGNORE INTO follows (user_id, crop) VALUES (?,?)').bind(user.id, c))]);
  return json({ ok: true });
});

/* notifications */
on('GET', '/notifications', async ({ env, user }) => {
  need(user);
  try { await tick(env); } catch (e) { console.error('tick', e); }
  return json({ items: await all(env.DB, 'SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 40', user.id), unread: (await one(env.DB, 'SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read=0', user.id)).n });
});
on('POST', '/notifications/read', async ({ env, user }) => { need(user); await run(env.DB, 'UPDATE notifications SET read=1 WHERE user_id=?', user.id); return json({ ok: true }); });

/* public numbers: impact and market prices */
on('GET', '/stats', async ({ env }) => {
  const c = async (sql, ...b) => (await one(env.DB, sql, ...b)) || {};
  const users = await all(env.DB, `SELECT role, COUNT(*) n FROM users WHERE status='active' AND role<>'admin' AND demo=0 GROUP BY role`);
  const moved = await c(`SELECT COALESCE(SUM(qty*unit_kg),0) kg, COALESCE(SUM(CASE WHEN rescue=1 THEN qty*unit_kg ELSE 0 END),0) rescued, COALESCE(SUM(total),0) value, COUNT(*) n FROM orders o JOIN users u ON u.id=o.farmer_id WHERE o.status='completed' AND u.demo=0`);
  const live = await c(`SELECT COUNT(*) n FROM listings l JOIN users u ON u.id=l.farmer_id WHERE l.status='active'`);
  const wanted = await c(`SELECT COUNT(*) n FROM requests WHERE status='open'`);
  const loads = await c(`SELECT COUNT(*) n FROM jobs WHERE status='delivered'`);
  return json({ users: Object.fromEntries(users.map((r) => [r.role, r.n])), kg: Math.round(moved.kg), rescued: Math.round(moved.rescued), value: r2(moved.value), orders: moved.n, listings: live.n, requests: wanted.n, loads: loads.n });
}, true);
on('GET', '/prices', async ({ env, url }) => {
  const country = oneOf(url.searchParams.get('country'), COUNTRIES, 'Zimbabwe'), region = str(url.searchParams.get('region'), 60);
  const since = addDays(today(), -60);
  const rows = await all(env.DB, `SELECT crop, category, price / unit_kg AS pkg, region, 'listing' AS src FROM listings WHERE country=? AND created_at >= ? AND (? = '' OR region=?) AND unit_kg > 0
    UNION ALL SELECT o.crop, '' AS category, o.price / o.unit_kg AS pkg, b.region, 'sale' AS src FROM orders o JOIN users b ON b.id=o.farmer_id WHERE o.status='completed' AND b.country=? AND o.created_at >= ? AND (? = '' OR b.region=?) AND o.unit_kg > 0`,
  country, since, region, region, country, since, region, region);
  const by = {};
  for (const r of rows) { const g = by[r.crop] || (by[r.crop] = { crop: r.crop, category: CATEGORY_OF[r.crop] || 'Other', list: [], sales: 0 }); g.list.push(r.pkg); if (r.src === 'sale') g.sales++; }
  const out = Object.values(by).map((g) => { const l = g.list.sort((a, b) => a - b); return { crop: g.crop, category: g.category, n: l.length, sales: g.sales, avg: r2(l.reduce((a, b) => a + b, 0) / l.length), low: r2(l[0]), high: r2(l[l.length - 1]) }; });
  return json({ country, region, items: out.sort((a, b) => b.n - a.n) });
});

/* market listings */
on('GET', '/listings', async ({ env, url, user }) => {
  const q = url.searchParams, w = [`l.status='active'`, `u.status='active'`], b = [];
  if (q.get('mine') && user) { w.length = 0; w.push('l.farmer_id=?', `l.status<>'removed'`); b.push(user.id); }
  if (q.get('farmer')) { w.push('l.farmer_id=?'); b.push(Number(q.get('farmer')) || 0); }
  if (q.get('country')) { w.push('l.country=?'); b.push(q.get('country')); }
  if (q.get('region')) { w.push('l.region=?'); b.push(q.get('region')); }
  if (q.get('category')) { w.push('l.category=?'); b.push(q.get('category')); }
  if (q.get('crop')) { w.push('l.crop=?'); b.push(q.get('crop')); }
  if (q.get('kind') === 'preharvest') w.push(`l.kind='preharvest'`);
  if (q.get('kind') === 'now') w.push(`l.kind='now'`);
  if (q.get('kind') === 'rescue') { w.push(`l.kind='now' AND l.rescue_pct>0 AND l.best_before <= ?`); b.push(addDays(today(), 3)); }
  if (q.get('export')) w.push('l.export_ready=1');
  if (q.get('organic')) w.push('l.organic=1');
  if (q.get('q')) { w.push('(l.crop LIKE ? OR l.variety LIKE ? OR l.town LIKE ? OR l.region LIKE ? OR u.business LIKE ?)'); const k = '%' + str(q.get('q'), 60) + '%'; b.push(k, k, k, k, k); }
  const sort = q.get('sort') === 'price' ? 'l.price/l.unit_kg ASC' : q.get('sort') === 'soon' ? "COALESCE(l.best_before, '9999-12-31') ASC" : `(u.plan<>'free' AND u.plan_until >= '${today()}') DESC, l.id DESC`;
  const rows = await all(env.DB, `SELECT ${LISTING_COLS} FROM listings l JOIN users u ON u.id=l.farmer_id WHERE ${w.join(' AND ')} ORDER BY ${sort} LIMIT 120`, ...b);
  return json({ items: rows.map(shapeListing) });
});
on('GET', '/listings/:id', async ({ env, params, user }) => {
  const l = await one(env.DB, `SELECT ${LISTING_COLS}, u.bio AS farmer_bio, u.created_at AS farmer_since FROM listings l JOIN users u ON u.id=l.farmer_id WHERE l.id=?`, Number(params.id) || 0);
  if (!l || (l.status === 'removed' && (!user || (user.id !== l.farmer_id && user.role !== 'admin')))) fail(404, 'This produce is no longer listed.');
  if (!user || user.id !== l.farmer_id) await run(env.DB, 'UPDATE listings SET views=views+1 WHERE id=?', l.id);
  const reviews = await all(env.DB, `SELECT o.rating, o.review, o.completed_at, b.name FROM orders o JOIN users b ON b.id=o.buyer_id WHERE o.farmer_id=? AND o.rating IS NOT NULL ORDER BY o.id DESC LIMIT 5`, l.farmer_id);
  return json({ item: shapeListing(l), reviews: reviews.map((r) => ({ ...r, name: r.name.split(' ')[0] })) });
});
on('GET', '/photo/:id', async ({ env, params }) => {
  const l = await one(env.DB, 'SELECT photo FROM listings WHERE id=?', Number(params.id) || 0);
  if (!l || !l.photo) return new Response('', { status: 404 });
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(l.photo);
  if (!m) return new Response('', { status: 404 });
  return new Response(Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0)), { headers: { 'content-type': m[1], 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' } });
});
function cleanListing(body, user) {
  const crop = str(body.crop, 60);
  if (!CATEGORY_OF[crop]) fail(400, 'Choose what you are selling from the list.');
  const unit = oneOf(body.unit, Object.keys(UNITS), null); if (!unit) fail(400, 'Choose a unit.');
  const kind = oneOf(body.kind, ['now', 'preharvest'], 'now');
  const d = {
    kind, crop, category: CATEGORY_OF[crop], variety: str(body.variety, 60) || null, grade: oneOf(body.grade, ['A', 'B', 'C', 'Mixed'], null),
    qty: pos(body.qty, 'How much do you have?'), unit, unit_kg: num(body.unit_kg) > 0 ? num(body.unit_kg) : UNITS[unit], price: pos(body.price, 'Set your price per unit.'),
    min_order: Math.max(num(body.min_order, 1) || 1, 0.1), rescue_pct: Math.min(70, Math.max(0, Math.round(num(body.rescue_pct, 0) || 0))),
    available_from: dateOr(body.available_from), best_before: dateOr(body.best_before), country: oneOf(body.country, COUNTRIES, user.country || 'Zimbabwe'),
    region: str(body.region, 60) || user.region || null, town: str(body.town, 60) || user.town || null, delivery: oneOf(body.delivery, ['pickup', 'farmer', 'both'], 'pickup'),
    organic: body.organic ? 1 : 0, export_ready: body.export_ready ? 1 : 0, notes: str(body.notes, 800) || null,
  };
  if (kind === 'preharvest' && (!d.available_from || d.available_from <= today())) fail(400, 'For a pre-harvest listing, set the expected harvest date (in the future).');
  if (d.best_before && d.best_before < today()) fail(400, 'The "sell by" date has already passed.');
  if (d.min_order > d.qty) fail(400, 'Minimum order cannot be more than what you have.');
  return d;
}
function cleanPhoto(p) {
  if (p === undefined) return undefined;
  if (!p) return null;
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) || p.length > 400000) fail(400, 'The photo is too large or not a picture.');
  return p;
}
on('POST', '/listings', async ({ env, user, body }) => {
  need(user, 'farmer', 'supplier', 'admin');
  await notBlocked(env, user);
  const d = cleanListing(body, user), photo = cleanPhoto(body.photo);
  const s = await settings(env);
  if (body.id) {
    const l = await one(env.DB, 'SELECT * FROM listings WHERE id=?', Number(body.id));
    if (!l || (l.farmer_id !== user.id && user.role !== 'admin')) fail(404, 'Listing not found.');
    if (d.kind === 'preharvest' && l.kind !== 'preharvest' && planOf(user) === 'free' && user.role !== 'admin') fail(402, 'Pre-harvest listings are part of Farmer Pro.');
    await run(env.DB, `UPDATE listings SET kind=?, crop=?, category=?, variety=?, grade=?, qty=?, unit=?, unit_kg=?, price=?, min_order=?, rescue_pct=?, available_from=?, best_before=?, country=?, region=?, town=?, delivery=?, organic=?, export_ready=?, notes=?,
      status=CASE WHEN status IN ('sold','expired','paused') AND ? > 0 AND COALESCE(?, '9999') >= ? THEN 'active' ELSE status END, warned=CASE WHEN COALESCE(best_before,'')<>COALESCE(?, '') THEN 0 ELSE warned END, updated_at=? WHERE id=?`,
    ...Object.values(d), d.qty, d.best_before, today(), d.best_before, now(), l.id);
    if (photo !== undefined) await run(env.DB, 'UPDATE listings SET photo=? WHERE id=?', photo, l.id);
    return json({ id: l.id });
  }
  if (user.role !== 'admin' && planOf(user) === 'free') {
    if (d.kind === 'preharvest') fail(402, user.role === 'supplier' ? 'Pre-harvest listings are for farmers.' : 'Pre-harvest listings are part of Farmer Pro. Upgrade under Plan & billing.');
    const live = (await one(env.DB, `SELECT COUNT(*) n FROM listings WHERE farmer_id=? AND status='active'`, user.id)).n;
    const cap = user.role === 'supplier' ? 5 : 3;
    if (live >= cap) fail(402, `Starter accounts can have ${cap} live listings. Upgrade for unlimited listings.`);
  }
  let pid = null;
  if (body.planting_id) {
    const pl = await one(env.DB, 'SELECT p.* FROM plantings p JOIN farms f ON f.id=p.farm_id WHERE p.id=? AND f.owner_id=?', Number(body.planting_id), user.id);
    if (pl) {
      pid = pl.id;
      const safe = await safeHarvest(env, pl.id);
      if (safe && safe.date > today() && d.kind === 'now' && !body.confirm_withholding) fail(409, `Chemical withholding period: ${safe.item} was applied on ${safe.applied}. It is only safe to harvest and sell from ${safe.date}.`);
    }
  }
  const r = await run(env.DB, `INSERT INTO listings (farmer_id, kind, crop, category, variety, grade, qty, unit, unit_kg, price, min_order, rescue_pct, available_from, best_before, country, region, town, delivery, organic, export_ready, notes, photo, planting_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, user.id, ...Object.values(d), photo || null, pid);
  const id = r.meta.last_row_id;
  // match demand: buyers with open requests for this crop and people following it
  const wants = await all(env.DB, `SELECT DISTINCT buyer_id FROM requests WHERE status='open' AND crop=? AND country=?`, d.crop, d.country);
  const fans = await all(env.DB, `SELECT f.user_id FROM follows f JOIN users u ON u.id=f.user_id WHERE f.crop=? AND u.country=?`, d.crop, d.country);
  const who = [...wants.map((x) => x.buyer_id), ...fans.map((x) => x.user_id)].filter((x) => x !== user.id);
  await notify(env, who, `New ${d.kind === 'preharvest' ? 'pre-harvest ' : ''}${d.crop}: ${d.qty} ${d.unit} at ${s.currency} ${d.price}/${d.unit} in ${d.region || d.country}.`, '#/listing/' + id);
  return json({ id, matched: who.length }, 201);
});
on('POST', '/listings/:id/status', async ({ env, user, params, body }) => {
  need(user);
  const l = await one(env.DB, 'SELECT * FROM listings WHERE id=?', Number(params.id) || 0);
  if (!l || (l.farmer_id !== user.id && user.role !== 'admin')) fail(404, 'Listing not found.');
  const to = oneOf(body.to, ['active', 'paused', 'sold', 'removed'], null); if (!to) fail(400, 'Unknown status.');
  if (to === 'active') { await notBlocked(env, user); if (l.qty <= 0) fail(400, 'Add stock before showing it again.'); if (l.best_before && l.best_before < today()) fail(400, 'Update the sell-by date first.'); }
  await run(env.DB, 'UPDATE listings SET status=?, updated_at=? WHERE id=?', to, now(), l.id);
  return json({ ok: true });
});

/* buy requests and offers */
on('GET', '/requests', async ({ env, url, user }) => {
  const q = url.searchParams, w = [`r.status='open'`], b = [];
  if (q.get('mine') && user) { w.length = 0; w.push('r.buyer_id=?'); b.push(user.id); }
  if (q.get('country')) { w.push('r.country=?'); b.push(q.get('country')); }
  if (q.get('crop')) { w.push('r.crop=?'); b.push(q.get('crop')); }
  if (q.get('category')) { w.push('r.category=?'); b.push(q.get('category')); }
  const rows = await all(env.DB, `SELECT r.*, u.name AS buyer, u.business, u.buyer_type, u.verified, u.demo, u.plan AS b_plan, u.plan_until AS b_until,
    (SELECT COUNT(*) FROM offers o WHERE o.request_id=r.id) AS offers, (SELECT COUNT(*) FROM offers o WHERE o.request_id=r.id AND o.farmer_id=?) AS my_offers
    FROM requests r JOIN users u ON u.id=r.buyer_id WHERE ${w.join(' AND ')} ORDER BY (u.plan='export' AND u.plan_until >= '${today()}') DESC, r.id DESC LIMIT 100`, user ? user.id : 0, ...b);
  return json({ items: rows.map((r) => ({ ...r, buyer: r.business || (r.buyer || '').split(' ')[0], b_plan: undefined, b_until: undefined, verified: !!r.verified, demo: !!r.demo })) });
});
on('GET', '/requests/:id', async ({ env, user, params }) => {
  need(user);
  const r = await one(env.DB, `SELECT r.*, u.name AS buyer, u.business, u.buyer_type FROM requests r JOIN users u ON u.id=r.buyer_id WHERE r.id=?`, Number(params.id) || 0);
  if (!r) fail(404, 'Request not found.');
  const mine = r.buyer_id === user.id || user.role === 'admin';
  const offers = await all(env.DB, `SELECT o.*, u.name AS farmer, u.business AS farm, u.region, u.verified,
    (SELECT ROUND(AVG(rating),1) FROM orders x WHERE x.farmer_id=u.id AND x.rating IS NOT NULL) AS rating FROM offers o JOIN users u ON u.id=o.farmer_id WHERE o.request_id=? ${mine ? '' : 'AND o.farmer_id=' + Number(user.id)} ORDER BY o.price`, r.id);
  return json({ item: { ...r, buyer: r.business || r.buyer.split(' ')[0] }, offers, mine });
});
on('POST', '/requests', async ({ env, user, body }) => {
  need(user, 'buyer', 'admin');
  if (body.id) {
    const r = await one(env.DB, 'SELECT * FROM requests WHERE id=?', Number(body.id));
    if (!r || (r.buyer_id !== user.id && user.role !== 'admin')) fail(404, 'Request not found.');
    if (body.close) { await run(env.DB, `UPDATE requests SET status='closed' WHERE id=?`, r.id); return json({ ok: true }); }
  }
  const crop = str(body.crop, 60); if (!CATEGORY_OF[crop]) fail(400, 'Choose what you want to buy.');
  const unit = oneOf(body.unit, Object.keys(UNITS), 'kg');
  const repeat = oneOf(body.repeat, ['once', 'weekly', 'monthly'], 'once');
  if (user.role !== 'admin' && planOf(user) === 'free') {
    if (repeat !== 'once') fail(402, 'Repeat requests are part of the Business buyer plan.');
    const open = (await one(env.DB, `SELECT COUNT(*) n FROM requests WHERE buyer_id=? AND status='open'`, user.id)).n;
    if (open >= 1 && !body.id) fail(402, 'Household accounts can have 1 open request. Close it, or upgrade to Business buyer for unlimited requests.');
  }
  const d = [crop, CATEGORY_OF[crop], pos(body.qty, 'How much do you need?'), unit, num(body.max_price), dateOr(body.needed_by), repeat, oneOf(body.country, COUNTRIES, user.country), str(body.region, 60) || user.region || null, str(body.town, 60) || user.town || null, str(body.notes, 600) || null];
  if (body.id) { await run(env.DB, 'UPDATE requests SET crop=?, category=?, qty=?, unit=?, max_price=?, needed_by=?, repeat=?, country=?, region=?, town=?, notes=? WHERE id=?', ...d, Number(body.id)); return json({ id: Number(body.id) }); }
  const r = await run(env.DB, 'INSERT INTO requests (crop, category, qty, unit, max_price, needed_by, repeat, country, region, town, notes, buyer_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', ...d, user.id);
  const growers = await all(env.DB, `SELECT DISTINCT farmer_id FROM listings WHERE crop=? AND country=? AND status IN ('active','sold','paused')`, crop, d[7]);
  const fans = await all(env.DB, `SELECT f.user_id FROM follows f JOIN users u ON u.id=f.user_id WHERE f.crop=? AND u.role='farmer' AND u.country=?`, crop, d[7]);
  const who = [...growers.map((x) => x.farmer_id), ...fans.map((x) => x.user_id)];
  await notify(env, who, `Buyer wants ${d[2]} ${unit} of ${crop}${d[5] ? ' by ' + d[5] : ''} in ${d[8] || d[7]}. Send an offer.`, '#/request/' + r.meta.last_row_id);
  return json({ id: r.meta.last_row_id, matched: new Set(who).size }, 201);
});
on('POST', '/requests/:id/offer', async ({ env, user, params, body }) => {
  need(user, 'farmer');
  await notBlocked(env, user);
  const r = await one(env.DB, `SELECT r.*, u.demo FROM requests r JOIN users u ON u.id=r.buyer_id WHERE r.id=? AND r.status='open'`, Number(params.id) || 0);
  if (!r) fail(404, 'This request is closed.');
  if (r.demo && !user.demo) fail(400, 'This is an example request to show how FreeFarm works.');
  if (await one(env.DB, `SELECT id FROM offers WHERE request_id=? AND farmer_id=? AND status='pending'`, r.id, user.id)) fail(409, 'You already sent an offer. Wait for the buyer to answer.');
  const qty = pos(body.qty, 'How much can you supply?'), price = pos(body.price, 'Set your price per ' + r.unit + '.');
  const o = await run(env.DB, 'INSERT INTO offers (request_id, farmer_id, qty, price, available_from, note) VALUES (?,?,?,?,?,?)', r.id, user.id, qty, price, dateOr(body.available_from), str(body.note, 400) || null);
  await notify(env, [r.buyer_id], `New offer for your ${r.crop} request: ${qty} ${r.unit} at ${price}/${r.unit}.`, '#/request/' + r.id);
  return json({ id: o.meta.last_row_id }, 201);
});
on('POST', '/offers/:id', async ({ env, user, params, body }) => {
  need(user);
  const o = await one(env.DB, `SELECT o.*, r.buyer_id, r.crop, r.unit, r.country, r.town, r.region, r.status AS rstatus, r.repeat FROM offers o JOIN requests r ON r.id=o.request_id WHERE o.id=?`, Number(params.id) || 0);
  if (!o) fail(404, 'Offer not found.');
  if (body.withdraw) { if (o.farmer_id !== user.id || o.status !== 'pending') fail(400, 'You cannot withdraw this offer.'); await run(env.DB, `UPDATE offers SET status='withdrawn' WHERE id=?`, o.id); return json({ ok: true }); }
  if (o.buyer_id !== user.id) fail(403, 'Only the buyer can answer an offer.');
  if (o.status !== 'pending') fail(400, 'This offer was already answered.');
  if (body.decline) { await run(env.DB, `UPDATE offers SET status='declined' WHERE id=?`, o.id); await notify(env, [o.farmer_id], `Your ${o.crop} offer was not taken this time.`, '#/request/' + o.request_id); return json({ ok: true }); }
  await notBlocked(env, user);
  const number = await nextNumber(env);
  const delivery = oneOf(body.delivery, DELIVERY, 'farmer');
  const r = await run(env.DB, `INSERT INTO orders (number, offer_id, buyer_id, farmer_id, crop, qty, unit, unit_kg, price, total, delivery, address, needed_by, payment, note, status, accepted_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'accepted',?)`, number, o.id, user.id, o.farmer_id, o.crop, o.qty, o.unit, UNITS[o.unit] || 1, o.price, r2(o.qty * o.price), delivery,
  str(body.address, 200) || [o.town, o.region].filter(Boolean).join(', ') || null, o.available_from, oneOf(body.payment, PAYMENTS, 'cash'), str(body.note, 400) || null, now());
  await run(env.DB, `UPDATE offers SET status='accepted', order_id=? WHERE id=?`, r.meta.last_row_id, o.id);
  if (o.repeat === 'once') await run(env.DB, `UPDATE requests SET status='closed' WHERE id=?`, o.request_id);
  const order = await one(env.DB, 'SELECT * FROM orders WHERE id=?', r.meta.last_row_id);
  if (delivery === 'transport') await makeJob(env, order);
  await notify(env, [o.farmer_id], `${number}: your offer was accepted. ${o.qty} ${o.unit} of ${o.crop}. Get it ready.`, '#/order/' + order.id);
  return json({ order_id: order.id, number }, 201);
});

/* orders */
const ORDER_SQL = `SELECT o.*, b.name AS buyer, b.business AS buyer_business, b.phone AS buyer_phone, b.buyer_type, f.name AS farmer, f.business AS farm, f.phone AS farmer_phone, f.region AS farm_region, f.town AS farm_town, f.country AS farm_country,
  j.id AS job_id, j.status AS job_status, j.price AS job_price, t.name AS transporter, t.phone AS transporter_phone
  FROM orders o JOIN users b ON b.id=o.buyer_id JOIN users f ON f.id=o.farmer_id LEFT JOIN jobs j ON j.order_id=o.id AND j.status<>'cancelled' LEFT JOIN users t ON t.id=j.transporter_id`;
async function loadOrder(env, id, user) {
  const o = await one(env.DB, ORDER_SQL + ' WHERE o.id=?', Number(id) || 0);
  if (!o) fail(404, 'Order not found.');
  const tid = o.job_id ? (await one(env.DB, 'SELECT transporter_id FROM jobs WHERE id=?', o.job_id)).transporter_id : null;
  if (user.role !== 'admin' && ![o.buyer_id, o.farmer_id, tid].includes(user.id)) fail(404, 'Order not found.');
  o.transporter_id = tid;
  return o;
}
async function makeJob(env, o) {
  if (await one(env.DB, `SELECT id FROM jobs WHERE order_id=? AND status<>'cancelled'`, o.id)) return;
  const f = await one(env.DB, 'SELECT * FROM users WHERE id=?', o.farmer_id), b = await one(env.DB, 'SELECT * FROM users WHERE id=?', o.buyer_id);
  const cold = /milk|fish|kapenta|bream|catfish|cheese|lacto|strawberr|blueberr|mushroom/i.test(o.crop) ? 1 : 0;
  const r = await run(env.DB, `INSERT INTO jobs (order_id, created_by, load, weight_kg, cold, from_place, from_region, to_place, to_region, country, pickup_date) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    o.id, o.buyer_id, `${o.qty} ${o.unit} ${o.crop} (${o.number})`, r2(o.qty * o.unit_kg), cold, [f.town, f.region].filter(Boolean).join(', ') || f.country, f.region, o.address || [b.town, b.region].filter(Boolean).join(', ') || b.country, b.region, f.country, o.needed_by);
  const drivers = await all(env.DB, `SELECT id FROM users WHERE role='transporter' AND status='active' AND country=? AND (region IS NULL OR region=? OR region=? OR routes LIKE ? OR routes LIKE ?)`, f.country, f.region || '', b.region || '', '%' + (f.region || '#') + '%', '%' + (b.region || '#') + '%');
  await notify(env, drivers.map((d) => d.id), `New load: ${r2(o.qty * o.unit_kg)} kg ${o.crop} from ${f.region || f.country} to ${b.region || b.country}. Send a price.`, '#/load/' + r.meta.last_row_id);
  return r.meta.last_row_id;
}
on('GET', '/orders', async ({ env, user, url }) => {
  need(user);
  const scope = url.searchParams.get('as');
  let w = '1=1', b = [];
  if (user.role !== 'admin' || scope) {
    if (SELLERS.includes(user.role) || scope === 'farmer') { w = '(o.farmer_id=? OR o.buyer_id=?)'; b = [user.id, user.id]; }
    else if (user.role === 'transporter') { w = 'j.transporter_id=?'; b = [user.id]; }
    else { w = 'o.buyer_id=?'; b = [user.id]; }
  }
  const rows = await all(env.DB, ORDER_SQL + ` WHERE ${w} ORDER BY o.id DESC LIMIT 300`, ...b);
  return json({ items: rows.map((o) => ({ ...o, buyer_phone: undefined, farmer_phone: undefined, transporter_phone: undefined })) });
});
on('POST', '/orders', async ({ env, user, body }) => {
  need(user, 'buyer', 'farmer', 'transporter', 'supplier');
  await notBlocked(env, user);
  const l = await one(env.DB, `SELECT l.*, u.status AS ustatus, u.demo FROM listings l JOIN users u ON u.id=l.farmer_id WHERE l.id=?`, Number(body.listing_id) || 0);
  if (!l || l.status !== 'active' || l.ustatus !== 'active') fail(404, 'Sorry, this produce is no longer available.');
  if (l.demo && !user.demo) fail(400, 'This is an example listing to show how FreeFarm works. Real farmers\' produce appears in the market as they join.');
  const qty = pos(body.qty, 'How much do you want?');
  if (l.farmer_id === user.id) fail(400, 'You cannot order your own produce.');
  if (qty < l.min_order) fail(400, `The farmer's minimum order is ${l.min_order} ${l.unit}.`);
  if (qty > l.qty) fail(400, `Only ${l.qty} ${l.unit} left.`);
  const delivery = oneOf(body.delivery, DELIVERY, 'pickup');
  if (delivery === 'farmer' && l.delivery === 'pickup') fail(400, 'This farmer does not deliver. Choose collect, or book transport.');
  if (delivery !== 'pickup' && !str(body.address, 200)) fail(400, 'Where should it be delivered?');
  const { eff_price, rescue } = effPrice(l);
  const number = await nextNumber(env);
  const take = await run(env.DB, `UPDATE listings SET qty=qty-?, status=CASE WHEN qty-? <= 0 THEN 'sold' ELSE status END, updated_at=? WHERE id=? AND qty >= ? AND status='active'`, qty, qty, now(), l.id, qty);
  if (!take.meta.changes) fail(409, 'Someone just bought this. Please refresh.');
  const r = await run(env.DB, `INSERT INTO orders (number, listing_id, buyer_id, farmer_id, crop, qty, unit, unit_kg, price, total, rescue, delivery, address, needed_by, payment, note)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, number, l.id, user.id, l.farmer_id, l.crop, qty, l.unit, l.unit_kg, eff_price, r2(qty * eff_price), rescue ? 1 : 0, delivery,
  str(body.address, 200) || null, dateOr(body.needed_by) || (l.kind === 'preharvest' ? l.available_from : null), oneOf(body.payment, PAYMENTS, 'cash'), str(body.note, 400) || null);
  await notify(env, [l.farmer_id], `${number}: new order for ${qty} ${l.unit} of ${l.crop} from ${user.business || user.name}. Accept it in Orders.`, '#/order/' + r.meta.last_row_id);
  return json({ id: r.meta.last_row_id, number }, 201);
});
on('GET', '/orders/:id', async ({ env, user, params }) => {
  need(user);
  const o = await loadOrder(env, params.id, user);
  const msgs = await all(env.DB, `SELECT m.*, u.name, u.role FROM messages m JOIN users u ON u.id=m.user_id WHERE m.thread=? ORDER BY m.id`, 'o:' + o.id);
  // phone numbers are shared once the farmer accepts, so both sides can arrange collection
  const share = !['placed', 'declined', 'cancelled'].includes(o.status);
  if (!share) { o.buyer_phone = null; o.farmer_phone = null; }
  return json({ item: o, messages: msgs });
});
const ORDER_RULES = {
  accepted: { from: ['placed'], who: ['farmer'] },
  declined: { from: ['placed'], who: ['farmer'] },
  ready: { from: ['accepted'], who: ['farmer'] },
  on_the_way: { from: ['accepted', 'ready'], who: ['farmer', 'transporter'] },
  delivered: { from: ['accepted', 'ready', 'on_the_way'], who: ['farmer', 'transporter'] },
  completed: { from: ['accepted', 'ready', 'on_the_way', 'delivered'], who: ['buyer'] },
  cancelled: { from: ['placed', 'accepted', 'ready'], who: ['buyer', 'farmer'] },
  disputed: { from: ['delivered', 'completed'], who: ['buyer'] },
};
on('POST', '/orders/:id/status', async ({ env, user, params, body }) => {
  need(user);
  const o = await loadOrder(env, params.id, user);
  const to = body.to, rule = ORDER_RULES[to];
  if (!rule && !(user.role === 'admin' && ['completed', 'cancelled'].includes(to))) fail(400, 'Unknown step.');
  const as = user.role === 'admin' ? 'admin' : user.id === o.farmer_id ? 'farmer' : user.id === o.buyer_id ? 'buyer' : user.id === o.transporter_id ? 'transporter' : '';
  if (as !== 'admin') {
    if (!rule.who.includes(as)) fail(403, 'You cannot do that on this order.');
    if (!rule.from.includes(o.status)) fail(400, `This order is ${o.status.replace('_', ' ')}, so that step is not possible.`);
    if (to === 'disputed' && o.status === 'completed' && o.completed_at < new Date(Date.now() - 7 * 864e5).toISOString()) fail(400, 'Problems must be reported within 7 days.');
  }
  if (to === 'accepted') await notBlocked(env, user);
  const reason = str(body.reason, 300);
  if (['declined', 'cancelled', 'disputed'].includes(to) && !reason) fail(400, 'Please give a short reason.');
  const stamp = { accepted: 'accepted_at', delivered: 'delivered_at', completed: 'completed_at' }[to];
  await run(env.DB, `UPDATE orders SET status=?, ${stamp ? stamp + '=?,' : ''} cancel_reason=COALESCE(?, cancel_reason), updated_at=? WHERE id=?`, ...[to, ...(stamp ? [now()] : []), reason || null, now(), o.id]);
  if (['declined', 'cancelled'].includes(to) && o.listing_id) {
    await run(env.DB, `UPDATE listings SET qty=qty+?, status=CASE WHEN status='sold' THEN 'active' ELSE status END WHERE id=? AND (best_before IS NULL OR best_before >= ?)`, o.qty, o.listing_id, today());
    await run(env.DB, `UPDATE jobs SET status='cancelled' WHERE order_id=? AND status IN ('open','assigned')`, o.id);
  }
  if (to === 'accepted' && o.delivery === 'transport') await makeJob(env, o);
  if (to === 'completed') { await chargeOrderFee(env, o); await bookOrder(env, o); }
  const msg = {
    accepted: `${o.number}: the farmer accepted your order${o.delivery === 'transport' ? '. Transporters are now sending prices for the delivery.' : '.'}`, declined: `${o.number}: the farmer could not take your order: ${reason}`,
    ready: `${o.number}: your ${o.crop} is packed and ready${o.delivery === 'pickup' ? ' for collection' : ''}.`, on_the_way: `${o.number}: your ${o.crop} is on the way.`,
    delivered: `${o.number}: marked as delivered. Please confirm you received it.`, completed: `${o.number}: the buyer confirmed receipt. Thank you!`,
    cancelled: `${o.number} was cancelled: ${reason}`, disputed: `${o.number}: the buyer reported a problem: ${reason}`,
  }[to] || `${o.number}: ${to}`;
  const others = [o.buyer_id, o.farmer_id, o.transporter_id].filter((x) => x && x !== user.id);
  await notify(env, others, msg, '#/order/' + o.id);
  if (to === 'disputed') await notify(env, await adminIds(env), `Dispute on ${o.number}: ${reason}`, '#/order/' + o.id);
  return json({ ok: true });
});
on('POST', '/orders/:id/paid', async ({ env, user, params }) => {
  need(user);
  const o = await loadOrder(env, params.id, user);
  if (o.farmer_id !== user.id && user.role !== 'admin') fail(403, 'Only the farmer confirms payment.');
  await run(env.DB, 'UPDATE orders SET paid=1, updated_at=? WHERE id=?', now(), o.id);
  await notify(env, [o.buyer_id], `${o.number}: the farmer confirmed your payment.`, '#/order/' + o.id);
  return json({ ok: true });
});
on('POST', '/orders/:id/rate', async ({ env, user, params, body }) => {
  need(user);
  const o = await loadOrder(env, params.id, user);
  if (o.buyer_id !== user.id) fail(403, 'Only the buyer rates the farmer.');
  if (o.status !== 'completed') fail(400, 'Rate after you confirm you received it.');
  if (o.rating) fail(400, 'You already rated this order.');
  const rating = Math.round(num(body.rating, 0)); if (rating < 1 || rating > 5) fail(400, 'Choose 1 to 5 stars.');
  await run(env.DB, 'UPDATE orders SET rating=?, review=? WHERE id=?', rating, str(body.review, 400) || null, o.id);
  await notify(env, [o.farmer_id], `${o.number}: you got ${rating} star${rating > 1 ? 's' : ''}${body.review ? ': "' + str(body.review, 80) + '"' : ''}.`, '#/order/' + o.id);
  return json({ ok: true });
});
on('POST', '/orders/:id/message', async ({ env, user, params, body }) => {
  need(user);
  const o = await loadOrder(env, params.id, user);
  const text = str(body.text, 1000); if (!text) fail(400, 'Type a message.');
  await run(env.DB, 'INSERT INTO messages (thread, user_id, text) VALUES (?,?,?)', 'o:' + o.id, user.id, text);
  await notify(env, [o.buyer_id, o.farmer_id, o.transporter_id].filter((x) => x && x !== user.id), `${o.number}: message from ${user.name.split(' ')[0]}: ${text.slice(0, 90)}`, '#/order/' + o.id);
  return json({ ok: true });
});

/* transport loads and bids */
on('GET', '/jobs', async ({ env, user, url }) => {
  need(user);
  const q = url.searchParams, w = [], b = [];
  if (q.get('scope') === 'open') { w.push(`j.status='open'`); if (q.get('region')) { w.push('(j.from_region=? OR j.to_region=?)'); b.push(q.get('region'), q.get('region')); } if (q.get('country')) { w.push('j.country=?'); b.push(q.get('country')); } }
  else if (user.role === 'transporter') { w.push('(j.transporter_id=? OR EXISTS (SELECT 1 FROM bids x WHERE x.job_id=j.id AND x.transporter_id=?))'); b.push(user.id, user.id); }
  else if (user.role !== 'admin') { w.push('j.created_by=?'); b.push(user.id); }
  if (!w.length) w.push('1=1');
  const rows = await all(env.DB, `SELECT j.*, c.demo, c.name AS customer, c.business, t.name AS transporter, (SELECT COUNT(*) FROM bids x WHERE x.job_id=j.id AND x.status='pending') AS bids,
    (SELECT MIN(price) FROM bids x WHERE x.job_id=j.id AND x.status='pending') AS best, (SELECT price FROM bids x WHERE x.job_id=j.id AND x.transporter_id=? ORDER BY x.id DESC LIMIT 1) AS my_bid
    FROM jobs j JOIN users c ON c.id=j.created_by LEFT JOIN users t ON t.id=j.transporter_id WHERE ${w.join(' AND ')} ORDER BY j.id DESC LIMIT 200`, user.id, ...b);
  return json({ items: rows });
});
on('POST', '/jobs', async ({ env, user, body }) => {
  need(user, 'farmer', 'buyer', 'admin');
  const load = str(body.load, 160), from = str(body.from_place, 120), to = str(body.to_place, 120);
  if (!load || !from || !to) fail(400, 'Say what to move, from where and to where.');
  const r = await run(env.DB, `INSERT INTO jobs (created_by, load, weight_kg, cold, from_place, from_region, to_place, to_region, country, pickup_date, budget) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    user.id, load, num(body.weight_kg), body.cold ? 1 : 0, from, str(body.from_region, 60) || null, to, str(body.to_region, 60) || null, oneOf(body.country, COUNTRIES, user.country), dateOr(body.pickup_date), num(body.budget));
  const drivers = await all(env.DB, `SELECT id FROM users WHERE role='transporter' AND status='active' AND country=? ${body.cold ? 'AND cold=1' : ''}`, oneOf(body.country, COUNTRIES, user.country));
  await notify(env, drivers.map((d) => d.id), `New load: ${load} from ${from} to ${to}. Send a price.`, '#/load/' + r.meta.last_row_id);
  return json({ id: r.meta.last_row_id }, 201);
});
async function loadJob(env, id) {
  const j = await one(env.DB, `SELECT j.*, c.demo, c.name AS customer, c.business, c.phone AS customer_phone, t.name AS transporter, t.phone AS transporter_phone, t.vehicle FROM jobs j JOIN users c ON c.id=j.created_by LEFT JOIN users t ON t.id=j.transporter_id WHERE j.id=?`, Number(id) || 0);
  if (!j) fail(404, 'Load not found.');
  return j;
}
on('GET', '/jobs/:id', async ({ env, user, params }) => {
  need(user);
  const j = await loadJob(env, params.id);
  const order = j.order_id ? await one(env.DB, 'SELECT id, number, buyer_id, farmer_id, status FROM orders WHERE id=?', j.order_id) : null;
  const party = user.role === 'admin' || j.created_by === user.id || (order && [order.buyer_id, order.farmer_id].includes(user.id));
  if (!party && user.role !== 'transporter') fail(404, 'Load not found.');
  const bids = await all(env.DB, `SELECT b.*, u.name, u.vehicle, u.capacity_kg, u.cold, u.verified, (SELECT ROUND(AVG(rating),1) FROM jobs x WHERE x.transporter_id=u.id AND x.rating IS NOT NULL) AS rating,
    (SELECT COUNT(*) FROM jobs x WHERE x.transporter_id=u.id AND x.status='delivered') AS trips FROM bids b JOIN users u ON u.id=b.transporter_id WHERE b.job_id=? ${party ? '' : 'AND b.transporter_id=' + Number(user.id)} ORDER BY b.price`, j.id);
  const assigned = j.transporter_id === user.id;
  if (!party && !assigned) { j.customer_phone = null; j.transporter_phone = null; }
  if (party && !j.transporter_id) j.transporter_phone = null;
  const msgs = (party || assigned) && j.transporter_id ? await all(env.DB, `SELECT m.*, u.name, u.role FROM messages m JOIN users u ON u.id=m.user_id WHERE m.thread=? ORDER BY m.id`, 'j:' + j.id) : [];
  return json({ item: { ...j, order_number: order && order.number, order_status: order && order.status }, bids, party, assigned, messages: msgs });
});
on('POST', '/jobs/:id/bid', async ({ env, user, params, body }) => {
  need(user, 'transporter');
  await notBlocked(env, user);
  const j = await loadJob(env, params.id);
  if (j.status !== 'open') fail(400, 'This load is already taken.');
  if (j.demo && !user.demo) fail(400, 'This is an example load to show how FreeFarm works.');
  if (planOf(user) === 'free') {
    const n = (await one(env.DB, 'SELECT COUNT(*) n FROM bids WHERE transporter_id=? AND created_at >= ?', user.id, today().slice(0, 8) + '01')).n;
    if (n >= 3) fail(402, 'Starter accounts can send 3 prices a month. Upgrade to Transporter Pro for unlimited bids.');
  }
  const price = pos(body.price, 'Enter your price for this trip.');
  await run(env.DB, `UPDATE bids SET status='replaced' WHERE job_id=? AND transporter_id=? AND status='pending'`, j.id, user.id);
  await run(env.DB, 'INSERT INTO bids (job_id, transporter_id, price, note) VALUES (?,?,?,?)', j.id, user.id, price, str(body.note, 300) || null);
  await notify(env, [j.created_by], `Transport price for "${j.load}": ${price} from ${user.name.split(' ')[0]}${user.vehicle ? ' (' + user.vehicle + ')' : ''}. Choose a transporter.`, '#/load/' + j.id);
  return json({ ok: true });
});
on('POST', '/jobs/:id/accept', async ({ env, user, params, body }) => {
  need(user);
  const j = await loadJob(env, params.id);
  if (j.created_by !== user.id && user.role !== 'admin') fail(403, 'Only the person who booked can choose.');
  if (j.status !== 'open') fail(400, 'A transporter is already chosen.');
  const b = await one(env.DB, `SELECT * FROM bids WHERE id=? AND job_id=? AND status='pending'`, Number(body.bid_id) || 0, j.id);
  if (!b) fail(404, 'That price is no longer available.');
  await env.DB.batch([
    env.DB.prepare(`UPDATE jobs SET status='assigned', transporter_id=?, price=?, updated_at=? WHERE id=?`).bind(b.transporter_id, b.price, now(), j.id),
    env.DB.prepare(`UPDATE bids SET status=CASE WHEN id=? THEN 'accepted' ELSE 'declined' END WHERE job_id=? AND status='pending'`).bind(b.id, j.id),
  ]);
  const losers = (await all(env.DB, `SELECT DISTINCT transporter_id FROM bids WHERE job_id=? AND status='declined'`, j.id)).map((x) => x.transporter_id);
  await notify(env, [b.transporter_id], `You got the load "${j.load}" for ${b.price}. Pick up from ${j.from_place}.`, '#/load/' + j.id);
  await notify(env, losers, `The load "${j.load}" went to another transporter.`, '#/loads');
  if (j.order_id) { const o = await one(env.DB, 'SELECT farmer_id, number FROM orders WHERE id=?', j.order_id); await notify(env, [o.farmer_id], `${o.number}: transporter booked, pickup from you soon.`, '#/order/' + j.order_id); }
  return json({ ok: true });
});
on('POST', '/jobs/:id/status', async ({ env, user, params, body }) => {
  need(user);
  const j = await loadJob(env, params.id), to = body.to;
  if (to === 'cancelled') {
    if (j.created_by !== user.id && user.role !== 'admin' && j.transporter_id !== user.id) fail(403, 'You cannot cancel this load.');
    if (!['open', 'assigned'].includes(j.status)) fail(400, 'This load is already moving.');
    if (j.transporter_id === user.id) { await run(env.DB, `UPDATE jobs SET status='open', transporter_id=NULL, price=NULL, updated_at=? WHERE id=?`, now(), j.id); await notify(env, [j.created_by], `Your transporter dropped "${j.load}". It is open for new prices again.`, '#/load/' + j.id); return json({ ok: true }); }
    await run(env.DB, `UPDATE jobs SET status='cancelled', updated_at=? WHERE id=?`, now(), j.id);
    await run(env.DB, `UPDATE bids SET status='declined' WHERE job_id=? AND status='pending'`, j.id);
    if (j.transporter_id) await notify(env, [j.transporter_id], `The load "${j.load}" was cancelled by the customer.`, '#/load/' + j.id);
    return json({ ok: true });
  }
  if (j.transporter_id !== user.id && user.role !== 'admin') fail(403, 'Only the transporter updates the trip.');
  const flow = { picked: ['assigned'], delivered: ['picked', 'assigned'] };
  if (!flow[to] || !flow[to].includes(j.status)) fail(400, 'That step is not possible now.');
  await run(env.DB, 'UPDATE jobs SET status=?, updated_at=? WHERE id=?', to, now(), j.id);
  if (j.order_id) {
    const o = await one(env.DB, 'SELECT * FROM orders WHERE id=?', j.order_id);
    if (to === 'picked' && ['accepted', 'ready'].includes(o.status)) await run(env.DB, `UPDATE orders SET status='on_the_way', updated_at=? WHERE id=?`, now(), o.id);
    if (to === 'delivered' && ['accepted', 'ready', 'on_the_way'].includes(o.status)) await run(env.DB, `UPDATE orders SET status='delivered', delivered_at=?, updated_at=? WHERE id=?`, now(), now(), o.id);
    await notify(env, [o.buyer_id, o.farmer_id], `${o.number}: ${to === 'picked' ? 'picked up by the transporter, on the way' : 'delivered by the transporter. Buyer, please confirm you received it.'}`, '#/order/' + o.id);
  } else await notify(env, [j.created_by], `"${j.load}": ${to === 'picked' ? 'picked up' : 'delivered'}.`, '#/load/' + j.id);
  if (to === 'delivered') await chargeJobFee(env, j);
  return json({ ok: true });
});
on('POST', '/jobs/:id/rate', async ({ env, user, params, body }) => {
  need(user);
  const j = await loadJob(env, params.id);
  if (j.created_by !== user.id) fail(403, 'Only the customer rates the transporter.');
  if (j.status !== 'delivered' || j.rating) fail(400, 'You can rate once, after delivery.');
  const rating = Math.round(num(body.rating, 0)); if (rating < 1 || rating > 5) fail(400, 'Choose 1 to 5 stars.');
  await run(env.DB, 'UPDATE jobs SET rating=? WHERE id=?', rating, j.id);
  return json({ ok: true });
});
on('POST', '/jobs/:id/message', async ({ env, user, params, body }) => {
  need(user);
  const j = await loadJob(env, params.id);
  const order = j.order_id ? await one(env.DB, 'SELECT buyer_id, farmer_id FROM orders WHERE id=?', j.order_id) : null;
  const people = [j.created_by, j.transporter_id, order && order.farmer_id].filter(Boolean);
  if (!people.includes(user.id) || !j.transporter_id) fail(403, 'Messages open once a transporter is chosen.');
  const text = str(body.text, 1000); if (!text) fail(400, 'Type a message.');
  await run(env.DB, 'INSERT INTO messages (thread, user_id, text) VALUES (?,?,?)', 'j:' + j.id, user.id, text);
  await notify(env, people.filter((x) => x !== user.id), `Load "${j.load.slice(0, 40)}": ${user.name.split(' ')[0]}: ${text.slice(0, 80)}`, '#/load/' + j.id);
  return json({ ok: true });
});

/* public directory and profiles */
on('GET', '/directory', async ({ env, url }) => {
  const q = url.searchParams, role = oneOf(q.get('role'), ['farmer', 'buyer', 'transporter', 'supplier'], 'farmer'), w = [`u.role=?`, `u.status='active'`], b = [role];
  if (role === 'buyer') w.push(`u.buyer_type<>'Household'`);
  if (q.get('country')) { w.push('u.country=?'); b.push(q.get('country')); }
  if (q.get('region')) { w.push('u.region=?'); b.push(q.get('region')); }
  if (q.get('q')) { w.push('(u.name LIKE ? OR u.business LIKE ? OR u.crops LIKE ? OR u.town LIKE ?)'); const k = '%' + str(q.get('q'), 60) + '%'; b.push(k, k, k, k); }
  const rows = await all(env.DB, `SELECT u.id, u.name, u.business, u.role, u.buyer_type, u.country, u.region, u.town, u.crops, u.bio, u.vehicle, u.capacity_kg, u.cold, u.routes, u.verified, u.demo, u.created_at,
    (u.plan<>'free' AND u.plan_until >= ?) AS pro,
    (SELECT ROUND(AVG(rating),1) FROM orders o WHERE o.farmer_id=u.id AND o.rating IS NOT NULL) AS rating,
    (SELECT ROUND(AVG(rating),1) FROM jobs x WHERE x.transporter_id=u.id AND x.rating IS NOT NULL) AS t_rating,
    (SELECT COUNT(*) FROM orders o WHERE (o.farmer_id=u.id OR o.buyer_id=u.id) AND o.status='completed') AS deals,
    (SELECT COUNT(*) FROM listings l WHERE l.farmer_id=u.id AND l.status='active') AS live
    FROM users u WHERE ${w.join(' AND ')} ORDER BY pro DESC, u.verified DESC, deals DESC, u.id DESC LIMIT 200`, today(), ...b);
  return json({ items: rows.map((u) => ({ ...u, name: u.business ? u.name.split(' ')[0] : u.name, pro: !!u.pro, verified: !!u.verified, cold: !!u.cold, demo: !!u.demo })) });
});

/* plans, fees and payments */
on('GET', '/billing', async ({ env, user }) => {
  need(user);
  const s = await settings(env);
  return json({
    plans: plansFor(user.role === 'admin' ? 'farmer' : user.role, s), plan: planOf(user), plan_chosen: user.plan, plan_until: user.plan_until, balance: await balance(env, user.id),
    ledger: await all(env.DB, 'SELECT * FROM ledger WHERE user_id=? ORDER BY id DESC LIMIT 100', user.id),
    payments: await all(env.DB, 'SELECT * FROM payments WHERE user_id=? ORDER BY id DESC LIMIT 50', user.id),
    pay: { ecocash: s.pay_ecocash, name: s.pay_name, bank: s.pay_bank, whatsapp: s.support_whatsapp, ref: 'FF' + String(user.id).padStart(5, '0') },
    fee: Number(s.fee), transport_fee: Number(s.transport_fee), fee_payer: s.fee_payer, fee_limit: Number(s.fee_limit), currency: s.currency,
  });
});
on('POST', '/billing/pay', async ({ env, user, body }) => {
  need(user);
  if (user.role === 'admin') fail(400, 'Admins do not pay.');
  const s = await settings(env);
  const purpose = oneOf(body.purpose, ['fees', 'plan'], null); if (!purpose) fail(400, 'What is this payment for?');
  const reference = str(body.reference, 60); if (reference.length < 4) fail(400, 'Enter the transaction reference from your EcoCash or bank SMS.');
  if (await one(env.DB, `SELECT id FROM payments WHERE reference=? AND status<>'rejected'`, reference)) fail(409, 'That reference was already submitted.');
  let amount, plan = null, months = null;
  if (purpose === 'plan') {
    const p = plansFor(user.role, s).find((x) => x.id === body.plan && x.price > 0); if (!p) fail(400, 'Choose a paid plan.');
    months = oneOf(Number(body.months), [1, 3, 6, 12], 1); plan = p.id; amount = r2(p.price * months * (months === 12 ? 10 / 12 : 1));
  } else { amount = num(body.amount); if (!amount || amount <= 0) fail(400, 'Enter the amount you paid.'); }
  await run(env.DB, 'INSERT INTO payments (user_id, purpose, plan, months, amount, method, reference) VALUES (?,?,?,?,?,?,?)', user.id, purpose, plan, months, amount, oneOf(body.method, ['ecocash', 'bank', 'cash', 'other'], 'ecocash'), reference);
  await notify(env, await adminIds(env), `Payment to check: ${s.currency} ${amount} from ${user.name} (${purpose === 'plan' ? plan + ' plan, ' + months + ' month' + (months > 1 ? 's' : '') : 'fees'}), ref ${reference}`, '#/admin/payments');
  return json({ ok: true, amount }, 201);
});

/* admin */
on('GET', '/admin/overview', async ({ env, user }) => {
  need(user, 'admin');
  const c = async (sql, ...b) => (await one(env.DB, sql, ...b)) || {};
  const m = today().slice(0, 8) + '01';
  return json({
    users: await all(env.DB, `SELECT role, COUNT(*) n, SUM(CASE WHEN plan<>'free' AND plan_until >= ? THEN 1 ELSE 0 END) paid FROM users WHERE role<>'admin' AND status='active' GROUP BY role`, today()),
    fees_total: r2((await c(`SELECT COALESCE(SUM(amount),0) v FROM ledger WHERE kind='fee'`)).v), fees_month: r2((await c(`SELECT COALESCE(SUM(amount),0) v FROM ledger WHERE kind='fee' AND created_at >= ?`, m)).v),
    subs_total: r2((await c(`SELECT COALESCE(SUM(amount),0) v FROM payments WHERE purpose='plan' AND status='confirmed'`)).v), subs_month: r2((await c(`SELECT COALESCE(SUM(amount),0) v FROM payments WHERE purpose='plan' AND status='confirmed' AND decided_at >= ?`, m)).v),
    collected: r2(-(await c(`SELECT COALESCE(SUM(amount),0) v FROM ledger WHERE kind='payment' AND ref='fees'`)).v), owed: r2((await c(`SELECT COALESCE(SUM(b),0) v FROM (SELECT SUM(amount) b FROM ledger GROUP BY user_id HAVING SUM(amount) > 0)`)).v),
    pending: (await c(`SELECT COUNT(*) n FROM payments WHERE status='pending'`)).n,
    orders: await all(env.DB, `SELECT status, COUNT(*) n, COALESCE(SUM(total),0) v FROM orders GROUP BY status`),
    orders_month: (await c(`SELECT COUNT(*) n FROM orders WHERE status='completed' AND completed_at >= ?`, m)).n,
    kg: Math.round((await c(`SELECT COALESCE(SUM(qty*unit_kg),0) v FROM orders WHERE status='completed'`)).v), rescued: Math.round((await c(`SELECT COALESCE(SUM(qty*unit_kg),0) v FROM orders WHERE status='completed' AND rescue=1`)).v),
    disputes: await all(env.DB, ORDER_SQL + ` WHERE o.status='disputed' ORDER BY o.id DESC`),
    top_debtors: await all(env.DB, `SELECT u.id, u.name, u.business, u.role, u.phone, SUM(l.amount) b FROM ledger l JOIN users u ON u.id=l.user_id GROUP BY u.id HAVING SUM(l.amount) > 0 ORDER BY b DESC LIMIT 10`),
    has_demo: !!(await c(`SELECT id FROM users WHERE demo=1 LIMIT 1`)).id,
  });
});
on('GET', '/admin/users', async ({ env, user, url }) => {
  need(user, 'admin');
  const q = str(url.searchParams.get('q'), 60), k = '%' + q + '%';
  const rows = await all(env.DB, `SELECT u.*, (SELECT COALESCE(SUM(amount),0) FROM ledger l WHERE l.user_id=u.id) AS balance FROM users u WHERE (? = '' OR u.name LIKE ? OR u.phone LIKE ? OR u.business LIKE ? OR u.email LIKE ?) ORDER BY u.id DESC LIMIT 500`, q, k, k, k, k);
  return json({ items: rows.map((u) => ({ ...publicUser(u), status: u.status, balance: r2(u.balance), created_at: u.created_at, last_login: u.last_login })) });
});
on('POST', '/admin/users/:id', async ({ env, user, params, body }) => {
  need(user, 'admin');
  const u = await one(env.DB, 'SELECT * FROM users WHERE id=?', Number(params.id) || 0);
  if (!u) fail(404, 'User not found.');
  if ('verified' in body) await run(env.DB, 'UPDATE users SET verified=? WHERE id=?', body.verified ? 1 : 0, u.id);
  if ('status' in body) { if (u.id === user.id) fail(400, 'You cannot switch off your own account.'); await run(env.DB, 'UPDATE users SET status=? WHERE id=?', body.status === 'off' ? 'off' : 'active', u.id); if (body.status === 'off') await run(env.DB, 'DELETE FROM sessions WHERE user_id=?', u.id); }
  if ('plan' in body) await run(env.DB, 'UPDATE users SET plan=?, plan_until=? WHERE id=?', str(body.plan, 20) || 'free', dateOr(body.plan_until), u.id);
  if (body.waive) { const b = await balance(env, u.id); if (b > 0) await run(env.DB, 'INSERT INTO ledger (user_id, kind, amount, ref, note) VALUES (?,?,?,?,?)', u.id, 'credit', -b, 'waived', str(body.waive_note, 200) || 'Waived by admin'); }
  if (body.reset) {
    const pw = tempPassword(), { hash, salt } = await hashPassword(pw);
    await run(env.DB, 'UPDATE users SET pass_hash=?, pass_salt=?, must_change=1, failed=0, locked_until=NULL WHERE id=?', hash, salt, u.id);
    await run(env.DB, 'DELETE FROM sessions WHERE user_id=?', u.id);
    await audit(env, user, 'reset password', u.phone);
    return json({ password: pw });
  }
  await audit(env, user, 'changed user', u.phone + ' ' + JSON.stringify(body).slice(0, 200));
  return json({ ok: true });
});
on('GET', '/admin/payments', async ({ env, user }) => {
  need(user, 'admin');
  return json({ items: await all(env.DB, `SELECT p.*, u.name, u.business, u.role, u.phone FROM payments p JOIN users u ON u.id=p.user_id ORDER BY p.status='pending' DESC, p.id DESC LIMIT 300`) });
});
on('POST', '/admin/payments/:id', async ({ env, user, params, body }) => {
  need(user, 'admin');
  const p = await one(env.DB, 'SELECT * FROM payments WHERE id=?', Number(params.id) || 0);
  if (!p || p.status !== 'pending') fail(400, 'This payment was already handled.');
  const ok = !!body.confirm;
  const claim = await run(env.DB, `UPDATE payments SET status=?, decided_by=?, decided_at=? WHERE id=? AND status='pending'`, ok ? 'confirmed' : 'rejected', user.id, now(), p.id);
  if (!claim.meta.changes) fail(409, 'Already handled.');
  const u = await one(env.DB, 'SELECT * FROM users WHERE id=?', p.user_id);
  if (ok && p.purpose === 'plan') {
    const start = planActive(u) && u.plan === p.plan ? u.plan_until : today();
    const d = new Date(start + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + p.months);
    const until = d.toISOString().slice(0, 10);
    await env.DB.batch([
      env.DB.prepare('UPDATE users SET plan=?, plan_until=? WHERE id=?').bind(p.plan, until, u.id),
      env.DB.prepare('INSERT INTO ledger (user_id, kind, amount, ref, note) VALUES (?,?,?,?,?)').bind(u.id, 'subscription', p.amount, 'plan', `${p.plan} plan, ${p.months} month(s)`),
      env.DB.prepare('INSERT INTO ledger (user_id, kind, amount, ref, note) VALUES (?,?,?,?,?)').bind(u.id, 'payment', -p.amount, 'plan', 'Paid ' + p.reference),
    ]);
    await notify(env, [u.id], `Payment received. Your ${p.plan} plan is active until ${until}.`, '#/billing');
  } else if (ok) {
    await run(env.DB, 'INSERT INTO ledger (user_id, kind, amount, ref, note) VALUES (?,?,?,?,?)', u.id, 'payment', -p.amount, 'fees', 'Paid ' + p.reference);
    await notify(env, [u.id], `Payment of ${p.amount} received. Thank you!`, '#/billing');
  } else await notify(env, [u.id], `We could not match your payment ref ${p.reference}. ${str(body.note, 150) || 'Please check the reference and send it again.'}`, '#/billing');
  await audit(env, user, ok ? 'confirmed payment' : 'rejected payment', `${p.id} ${p.amount}`);
  return json({ ok: true });
});
on('POST', '/admin/settings', async ({ env, user, body }) => {
  need(user, 'admin');
  const st = [];
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in body) {
    let v = str(body[k], 300);
    if (['fee', 'transport_fee', 'fee_limit', 'price_farmer_pro', 'price_farmer_farm', 'price_supplier_pro', 'price_buyer_business', 'price_buyer_export', 'price_transport_pro'].includes(k)) { const n = num(v); if (n == null || n < 0 || n > 10000) fail(400, 'Check the amounts.'); v = String(n); }
    if (k === 'trial_days' || k === 'auto_complete_hours') v = String(Math.max(0, Math.min(k === 'trial_days' ? 365 : 720, Math.round(num(v, 0)))));
    if (k === 'fee_payer') v = oneOf(v, ['seller', 'buyer', 'split'], 'seller');
    st.push(env.DB.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, v));
  }
  if (st.length) await env.DB.batch(st);
  await audit(env, user, 'settings', Object.keys(body).join(','));
  return json({ settings: await settings(env) });
});
on('GET', '/admin/settings', async ({ env, user }) => { need(user, 'admin'); const s = await settings(env); delete s.last_tick; return json({ settings: s }); });
on('POST', '/admin/remove-examples', async ({ env, user }) => {
  need(user, 'admin');
  const ids = (await all(env.DB, 'SELECT id FROM users WHERE demo=1')).map((r) => r.id);
  if (!ids.length) return json({ removed: 0 });
  const IN = `(${ids.join(',')})`; // integers from our own table
  await env.DB.batch([
    `DELETE FROM messages WHERE user_id IN ${IN}`, `DELETE FROM bids WHERE transporter_id IN ${IN} OR job_id IN (SELECT id FROM jobs WHERE created_by IN ${IN})`,
    `DELETE FROM jobs WHERE created_by IN ${IN} OR transporter_id IN ${IN}`, `DELETE FROM offers WHERE farmer_id IN ${IN} OR request_id IN (SELECT id FROM requests WHERE buyer_id IN ${IN})`,
    `DELETE FROM orders WHERE buyer_id IN ${IN} OR farmer_id IN ${IN}`, `DELETE FROM requests WHERE buyer_id IN ${IN}`, `DELETE FROM listings WHERE farmer_id IN ${IN}`,
    `DELETE FROM ledger WHERE user_id IN ${IN}`, `DELETE FROM payments WHERE user_id IN ${IN}`, `DELETE FROM follows WHERE user_id IN ${IN}`, `DELETE FROM notifications WHERE user_id IN ${IN}`,
    `DELETE FROM sessions WHERE user_id IN ${IN}`, `DELETE FROM scans WHERE user_id IN ${IN}`, `DELETE FROM farms WHERE owner_id IN ${IN}`, `DELETE FROM users WHERE id IN ${IN}`,
  ].map((q) => env.DB.prepare(q)));
  await audit(env, user, 'removed example data', ids.length + ' accounts');
  return json({ removed: ids.length });
});
const csv = (rows, cols) => '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => { const v = r[c] == null ? '' : String(r[c]); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','))].join('\n');
on('GET', '/admin/export/:kind', async ({ env, user, params }) => {
  need(user, 'admin');
  let rows, cols;
  if (params.kind === 'orders') { rows = await all(env.DB, ORDER_SQL + ' ORDER BY o.id'); cols = ['number', 'created_at', 'status', 'crop', 'qty', 'unit', 'price', 'total', 'rescue', 'delivery', 'payment', 'paid', 'fee', 'farmer', 'farm', 'buyer', 'buyer_business', 'completed_at', 'rating']; }
  else if (params.kind === 'ledger') { rows = await all(env.DB, 'SELECT l.*, u.name, u.phone, u.role FROM ledger l JOIN users u ON u.id=l.user_id ORDER BY l.id'); cols = ['created_at', 'name', 'phone', 'role', 'kind', 'amount', 'ref', 'note']; }
  else if (params.kind === 'users') { rows = await all(env.DB, 'SELECT * FROM users ORDER BY id'); cols = ['id', 'name', 'business', 'role', 'buyer_type', 'phone', 'email', 'country', 'region', 'town', 'plan', 'plan_until', 'verified', 'status', 'created_at', 'last_login']; }
  else fail(404, 'Unknown export.');
  return new Response(csv(rows, cols), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="freefarm-${params.kind}-${today()}.csv"`, 'cache-control': 'no-store' } });
});

/* =====================================================================
   FARM MANAGEMENT: fields, crops & livestock, calendar tasks, workers,
   payroll, inventory, accounts, weather & disease risk, AI plant doctor,
   AI advisor, sensors & automations, regional outbreak alerts.
   ===================================================================== */
const ZIM_CENTRES = { Harare: [-17.83, 31.05], Bulawayo: [-20.15, 28.58], Manicaland: [-18.97, 32.67], 'Mashonaland Central': [-17.30, 31.33], 'Mashonaland East': [-18.19, 31.55], 'Mashonaland West': [-17.36, 30.20], Masvingo: [-20.07, 30.83], 'Matabeleland North': [-18.93, 27.81], 'Matabeleland South': [-20.94, 29.01], Midlands: [-19.45, 29.82] };
const INPUT_NOTE = 'Guide rates only: follow your soil test, the product label and your local extension officer.';
// Crop calendars: days to harvest, growth stages (% of season) and tasks (day, title, details, input to buy)
const STAGES = { crop: [['Establishment', 10], ['Vegetative growth', 45], ['Flowering', 65], ['Fruit / grain fill', 90], ['Ready to harvest', 100]], livestock: [['Brooding', 20], ['Growing', 60], ['Finishing', 90], ['Ready for sale', 100]] };
const CAL = {
  Tomatoes: { days: 110, unit: 'crate', yield: 2000, tasks: [[0, 'Transplant and apply basal fertiliser', 'Basal e.g. Compound C or D, about 600-1000 kg/ha worked into planting rows. Water in well.', 'Fertiliser'], [7, 'Check stand and replace dead seedlings', ''], [14, 'Weed and scout for pests', 'Look for whitefly, red spider mite and Tuta absoluta. Set pheromone traps.'], [21, 'Top-dress and stake', 'Top-dress e.g. AN about 100 kg/ha. Put in stakes or trellis.', 'Fertiliser'], [28, 'Start blight spray programme', 'Preventive fungicide every 7-10 days in wet weather, rotate active ingredients.', 'Crop chemicals'], [40, 'Second top-dressing', 'e.g. potassium nitrate or AN about 100 kg/ha as fruit sets.', 'Fertiliser'], [45, 'Prune side shoots and check traps', ''], [70, 'Harvesting starts', 'Pick at breaker stage for long trips. List on FreeFarm a week before.'], [110, 'Final harvest and clear field', '']] },
  'Green peppers': { days: 120, unit: 'box', yield: 1500, tasks: [[0, 'Transplant and apply basal fertiliser', 'Basal e.g. Compound C or D, about 600-800 kg/ha.', 'Fertiliser'], [21, 'Top-dress', 'e.g. AN about 100 kg/ha.', 'Fertiliser'], [30, 'Scout for aphids and thrips weekly', '', 'Crop chemicals'], [75, 'Harvesting starts', ''], [120, 'Final harvest', '']] },
  Maize: { days: 140, unit: 'tonne', yield: 5, tasks: [[0, 'Plant and apply basal fertiliser', 'Basal e.g. Compound D about 300-400 kg/ha in the planting furrow.', 'Fertiliser'], [10, 'Gap fill', 'Replant missing stations within 2 weeks.'], [21, 'First weeding and fall armyworm scouting', 'Check 20 plants in a W pattern every week until tasseling.', 'Crop chemicals'], [35, 'Top-dress', 'e.g. AN about 150-250 kg/ha when the soil is moist.', 'Fertiliser'], [50, 'Second weeding', ''], [65, 'Tasseling: keep moisture up', 'This is the most water-sensitive stage.'], [140, 'Harvest and dry to safe moisture', 'Store grain below about 12.5% moisture; treat against weevils.', 'Crop chemicals']] },
  Cabbage: { days: 90, unit: 'head', yield: 30000, tasks: [[0, 'Transplant and apply basal fertiliser', 'Basal e.g. Compound D about 500-600 kg/ha.', 'Fertiliser'], [14, 'Scout for aphids and diamondback moth weekly', '', 'Crop chemicals'], [21, 'Top-dress', 'e.g. AN about 150 kg/ha.', 'Fertiliser'], [42, 'Second top-dressing', 'e.g. AN about 100 kg/ha.', 'Fertiliser'], [85, 'Harvest firm heads', '']] },
  'Covo / rape': { days: 60, unit: 'bunch', yield: 20000, tasks: [[0, 'Transplant and apply basal fertiliser', 'Basal e.g. Compound D about 500 kg/ha.', 'Fertiliser'], [14, 'Top-dress', 'e.g. AN about 100 kg/ha, repeat after each heavy picking.', 'Fertiliser'], [35, 'Start picking leaves weekly', '']] },
  Onions: { days: 140, unit: '10kg pocket', yield: 3000, tasks: [[0, 'Transplant and apply basal fertiliser', 'Basal e.g. Compound D about 500 kg/ha.', 'Fertiliser'], [30, 'Top-dress', 'e.g. AN about 100 kg/ha.', 'Fertiliser'], [45, 'Scout for thrips and downy mildew', '', 'Crop chemicals'], [60, 'Second top-dressing', '', 'Fertiliser'], [120, 'Stop irrigating', 'Stop 2 weeks before harvest so bulbs cure.'], [140, 'Lift, cure and store', '']] },
  Potatoes: { days: 110, unit: '10kg pocket', yield: 2500, tasks: [[0, 'Plant seed tubers and apply basal fertiliser', 'Basal e.g. Compound C or S about 1000 kg/ha.', 'Fertiliser'], [30, 'Earth up and top-dress', 'e.g. AN about 150 kg/ha.', 'Fertiliser'], [35, 'Blight sprays every 7 days in wet weather', '', 'Crop chemicals'], [100, 'Kill the haulms', 'Skins set in 10-14 days.'], [110, 'Harvest and store in the dark', '']] },
  'Sugar beans': { days: 90, unit: '50kg bag', yield: 30, tasks: [[0, 'Plant and apply basal fertiliser', 'Basal e.g. Compound D about 300 kg/ha.', 'Fertiliser'], [14, 'Weed', ''], [21, 'Scout for rust, aphids and bean stem maggot', '', 'Crop chemicals'], [45, 'Flowering: avoid water stress', ''], [90, 'Harvest when pods are dry', '']] },
  'Soya beans': { days: 130, unit: 'tonne', yield: 2.5, tasks: [[0, 'Inoculate seed, plant and apply basal', 'Use rhizobium inoculant; basal e.g. Compound L or D about 200-300 kg/ha.', 'Seed'], [21, 'Weed', ''], [60, 'Flowering: scout for rust', '', 'Crop chemicals'], [130, 'Harvest when 95% of pods are brown', '']] },
  Groundnuts: { days: 130, unit: '50kg bag', yield: 40, tasks: [[0, 'Plant', 'Basal e.g. Compound L about 200 kg/ha.', 'Fertiliser'], [40, 'Apply gypsum at flowering', 'e.g. gypsum about 200-400 kg/ha on the row.', 'Fertiliser'], [130, 'Lift and dry', '']] },
  Butternut: { days: 100, unit: 'tonne', yield: 15, tasks: [[0, 'Plant and apply basal fertiliser', 'Basal e.g. Compound D about 400 kg/ha.', 'Fertiliser'], [30, 'Top-dress', 'e.g. AN about 100 kg/ha.', 'Fertiliser'], [45, 'Scout for powdery mildew and fruit fly', '', 'Crop chemicals'], [100, 'Harvest mature fruit, cure in shade', '']] },
  Carrots: { days: 90, unit: '10kg pocket', yield: 2500, tasks: [[0, 'Sow and apply basal fertiliser', 'Basal e.g. Compound D about 500 kg/ha.', 'Fertiliser'], [30, 'Thin and weed', ''], [90, 'Harvest', '']] },
  Wheat: { days: 120, unit: 'tonne', yield: 5, tasks: [[0, 'Plant and apply basal fertiliser', 'Basal e.g. Compound D about 400 kg/ha.', 'Fertiliser'], [28, 'Top-dress', 'e.g. AN about 200 kg/ha.', 'Fertiliser'], [60, 'Scout for aphids and rust', '', 'Crop chemicals'], [120, 'Harvest', '']] },
  Broilers: { days: 42, unit: 'bird', livestock: true, tasks: [[-1, 'Prepare brooder', 'Clean, disinfect, litter down, heat to about 32°C before chicks arrive.', 'Animal feed'], [0, 'Chicks arrive: starter feed and clean water', '', 'Animal feed'], [7, 'Newcastle vaccination', 'Follow your vet and the vaccine label.', 'Vet medicines'], [14, 'Gumboro vaccination', '', 'Vet medicines'], [14, 'Switch to grower feed', '', 'Animal feed'], [21, 'Newcastle booster', '', 'Vet medicines'], [28, 'Switch to finisher feed', '', 'Animal feed'], [35, 'Book buyers and list on FreeFarm', 'Weigh a sample of 10 birds.'], [42, 'Sell or slaughter', '']] },
  'Road-runner chickens': { days: 120, unit: 'bird', livestock: true, tasks: [[0, 'Start the batch', '', 'Animal feed'], [7, 'Newcastle vaccination', '', 'Vet medicines'], [30, 'Deworm', '', 'Vet medicines'], [120, 'Ready for sale', '']] },
  Eggs: { days: 365, unit: 'tray (30)', livestock: true, tasks: [[0, 'Start the layer flock record', '', 'Animal feed'], [30, 'Deworm and check vaccination plan', '', 'Vet medicines']] },
};
const DEFAULT_DAYS = { Vegetables: 90, Fruit: 365, 'Grains & legumes': 130, 'Livestock & poultry': 180, 'Dairy & eggs': 365, Fish: 180, Other: 120 };
const calFor = (crop) => CAL[crop] || { days: DEFAULT_DAYS[CATEGORY_OF[crop]] || 100, unit: 'kg', livestock: ['Livestock & poultry', 'Fish'].includes(CATEGORY_OF[crop]), tasks: [[0, 'Planting / start', ''], [14, 'Weed and scout for pests', ''], [30, 'Feed / top-dress', '', CATEGORY_OF[crop] === 'Livestock & poultry' ? 'Animal feed' : 'Fertiliser']] };
function stageOf(p) {
  const c = calFor(p.crop), total = Math.max(1, p.expected_harvest ? daysBetween(p.planted, p.expected_harvest) : c.days);
  const age = daysBetween(p.planted, today()), pct = Math.max(0, Math.min(100, Math.round((age / total) * 100)));
  const list = STAGES[p.kind === 'livestock' ? 'livestock' : 'crop'];
  const st = age < 0 ? 'Not started' : (list.find(([, until]) => pct <= until) || list[list.length - 1])[0];
  return { age, pct, stage: st, days_left: total - age };
}
const DISEASE_RULES = [
  { name: 'Late blight', crops: ['Tomatoes', 'Potatoes'], test: (d) => d.rh >= 85 && d.tmean >= 10 && d.tmean <= 25 && d.rain >= 1, need: 2, tip: 'Spray a preventive fungicide before the wet spell, avoid overhead irrigation, remove infected leaves.' },
  { name: 'Early blight', crops: ['Tomatoes', 'Potatoes'], test: (d) => d.rh >= 80 && d.tmean >= 24 && d.tmean <= 30, need: 3, tip: 'Keep lower leaves off the soil, mulch, and keep the spray programme going.' },
  { name: 'Downy mildew', crops: ['Onions', 'Cabbage', 'Cucumbers', 'Butternut', 'Pumpkins'], test: (d) => d.rh >= 85 && d.tmean >= 10 && d.tmean <= 22, need: 2, tip: 'Improve airflow, water in the morning, use a protective fungicide.' },
  { name: 'Bean rust', crops: ['Sugar beans', 'Soya beans', 'Green beans'], test: (d) => d.rh >= 80 && d.tmean >= 17 && d.tmean <= 27, need: 3, tip: 'Scout the undersides of leaves for orange pustules and spray early if found.' },
  { name: 'Black rot', crops: ['Cabbage', 'Covo / rape'], test: (d) => d.rain >= 5 && d.tmean >= 25, need: 2, tip: 'Avoid working in wet fields, remove infected plants, rotate away from brassicas.' },
  { name: 'Powdery mildew', crops: ['Butternut', 'Pumpkins', 'Cucumbers', 'Peas', 'Wheat'], test: (d) => d.rh >= 50 && d.rh <= 80 && d.tmean >= 20 && d.tmean <= 30 && d.rain < 1, need: 4, tip: 'Use a sulphur-based or recommended fungicide at first signs.' },
  { name: 'Fall armyworm', crops: ['Maize', 'Sorghum', 'Millet', 'Green maize'], test: (d) => d.tmean >= 22 && d.rain < 3, need: 4, tip: 'Scout 20 plants weekly; spray into the funnel early morning or late afternoon if over 10% of plants are damaged.' },
  { name: 'Heat stress in birds', crops: ['Broilers', 'Road-runner chickens', 'Eggs', 'Turkeys'], test: (d) => d.tmax >= 33, need: 1, tip: 'Open curtains, give cool water, feed in cooler hours, reduce stocking density.' },
];
async function getWeather(env, farm, force) {
  if (farm.lat == null || farm.lng == null) return null;
  const c = await one(env.DB, 'SELECT * FROM weather WHERE farm_id=?', farm.id);
  if (c && !force && Date.now() - new Date(c.at).getTime() < 3 * 3600e3) return JSON.parse(c.data);
  const base = env.WEATHER_URL || 'https://api.open-meteo.com/v1/forecast';
  const url = `${base}?latitude=${farm.lat}&longitude=${farm.lng}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean,et0_fao_evapotranspiration,weather_code&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&past_days=14&forecast_days=7&timezone=auto`;
  try {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('weather ' + r.status);
    const w = await r.json();
    const d = w.daily, days = d.time.map((t, i) => ({ date: t, tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i], tmean: d.temperature_2m_mean ? d.temperature_2m_mean[i] : (d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2, rain: d.precipitation_sum[i] || 0, pop: d.precipitation_probability_max ? d.precipitation_probability_max[i] : null, wind: d.wind_speed_10m_max[i], rh: d.relative_humidity_2m_mean ? d.relative_humidity_2m_mean[i] : null, et0: d.et0_fao_evapotranspiration ? d.et0_fao_evapotranspiration[i] : null, code: d.weather_code ? d.weather_code[i] : null }));
    const out = { current: w.current || null, days, at: now() };
    await run(env.DB, 'INSERT INTO weather (farm_id, data, at) VALUES (?,?,?) ON CONFLICT(farm_id) DO UPDATE SET data=excluded.data, at=excluded.at', farm.id, JSON.stringify(out), now());
    return out;
  } catch (e) { return c ? JSON.parse(c.data) : null; }
}
const dayName = (d) => d === today() ? 'today' : d === addDays(today(), 1) ? 'tomorrow' : 'on ' + new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
function analyseWeather(w, plantings) {
  if (!w) return { alerts: [], advice: [], past: [], next: [] };
  const t = today(), past = w.days.filter((d) => d.date < t), next = w.days.filter((d) => d.date >= t);
  const crops = new Set(plantings.map((p) => p.crop));
  const alerts = [], advice = [];
  const A = (level, title, text, key) => alerts.push({ level, title, text, key });
  const n3 = next.slice(0, 3);
  const frost = n3.find((d) => d.tmin != null && d.tmin <= 2);
  if (frost) A('high', `Frost risk ${frost.date === t ? 'tonight' : dayName(frost.date)}`, `Minimum about ${Math.round(frost.tmin)}°C. Cover seedlings, irrigate the evening before, protect young crops and animals.`, 'frost:' + frost.date);
  const heat = n3.find((d) => d.tmax >= 35);
  if (heat) A('high', `Heat wave ${dayName(heat.date)}`, `Up to ${Math.round(heat.tmax)}°C. Irrigate early morning, shade nurseries, give animals extra water and shade.`, 'heat:' + heat.date);
  const storm = n3.find((d) => d.rain >= 40);
  if (storm) A('high', `Heavy rain ${dayName(storm.date)}`, `About ${Math.round(storm.rain)} mm expected. Clear drains, delay fertiliser and spraying, harvest ripe produce first.`, 'rain:' + storm.date);
  const wind = n3.find((d) => d.wind >= 45);
  if (wind) A('medium', `Strong wind ${dayName(wind.date)}`, `Gusts around ${Math.round(wind.wind)} km/h. Secure tunnels, shade net and stakes.`, 'wind:' + wind.date);
  const lastRain = [...past].reverse().findIndex((d) => d.rain >= 2);
  const dry = lastRain === -1 ? past.length : lastRain;
  const rainNext = next.slice(0, 5).reduce((a, d) => a + d.rain, 0);
  if (dry >= 10 && rainNext < 5 && plantings.some((p) => p.kind === 'crop')) A('medium', `Dry spell: ${dry} days without real rain`, 'Little rain in the forecast. Irrigate where you can, mulch, and prioritise crops at flowering.', 'dry:' + t.slice(0, 7) + ':' + Math.floor(dry / 7));
  // disease and pest risk from recent + coming weather
  const window = [...past.slice(-4), ...next.slice(0, 3)].filter((d) => d.rh != null);
  for (const r of DISEASE_RULES) {
    const hit = r.crops.filter((c) => crops.has(c));
    if (!hit.length) continue;
    const n = window.filter(r.test).length;
    if (n >= r.need) A(n >= r.need + 2 ? 'high' : 'medium', `${r.name} risk for your ${hit.join(', ').toLowerCase()}`, `The weather favours ${r.name.toLowerCase()} (${n} of the last/next ${window.length} days). ${r.tip}`, 'dz:' + r.name + ':' + t);
  }
  // spray window and irrigation advice
  const tm = next[1] || next[0];
  if (tm) {
    const ok = tm.wind < 15 && (tm.pop == null || tm.pop < 40) && tm.rain < 1;
    advice.push(ok ? `Good spraying day tomorrow: light wind (${Math.round(tm.wind)} km/h) and little chance of rain.` : `Not a good spraying day tomorrow (${tm.wind >= 15 ? 'wind ' + Math.round(tm.wind) + ' km/h' : 'rain likely'}). Spray when wind is under 15 km/h and no rain for 24 hours.`);
  }
  const wk = past.slice(-7), et = wk.reduce((a, d) => a + (d.et0 || 0), 0), rn = wk.reduce((a, d) => a + d.rain, 0);
  if (et > 0) { const deficit = Math.round(et - rn); advice.push(deficit > 5 ? `Your crops lost about ${Math.round(et)} mm of water to heat and wind in the last 7 days and got ${Math.round(rn)} mm of rain. Plan roughly ${deficit} mm of irrigation (about ${(deficit * 10).toLocaleString()} litres per hectare), adjusted for crop stage.` : `Rain has covered your crops' water use over the last 7 days (${Math.round(rn)} mm rain, ${Math.round(et)} mm used).`); }
  return { alerts, advice, past, next };
}
async function myFarm(env, user, needIt = true) {
  const f = await one(env.DB, 'SELECT * FROM farms WHERE owner_id=?', user.id);
  if (!f && needIt) fail(404, 'Set up your farm first.');
  return f;
}
const fullFarm = (u) => u.role === 'admin' || (planActive(u) && u.plan === 'farm');
async function farmLimit(env, user, what) {
  if (fullFarm(user)) return;
  const f = await myFarm(env, user);
  const caps = { fields: [`SELECT COUNT(*) n FROM fields WHERE farm_id=? AND active=1`, 2, 'fields'], plantings: [`SELECT COUNT(*) n FROM plantings WHERE farm_id=? AND status='growing'`, 3, 'active crops or batches'], workers: [`SELECT COUNT(*) n FROM workers WHERE farm_id=? AND status='active'`, 3, 'workers'], scans: [`SELECT COUNT(*) n FROM scans WHERE user_id=? AND created_at >= ?`, 3, 'AI plant scans this month'], ask: [`SELECT COUNT(*) n FROM advice WHERE farm_id=? AND created_at >= ?`, 3, 'advisor questions this month'], sensors: [`SELECT COUNT(*) n FROM sensors WHERE farm_id=?`, 0, 'sensors'] }[what];
  const n = (await one(env.DB, caps[0], what === 'scans' ? user.id : f.id, ...(['scans', 'ask'].includes(what) ? [today().slice(0, 8) + '01'] : []))).n;
  if (n >= caps[1]) fail(402, caps[1] ? `Your plan includes ${caps[1]} ${caps[2]}. Upgrade to Farm Manager for unlimited.` : 'Sensors and automations are part of the Farm Manager plan.');
}
async function own(env, user, table, id) {
  const f = await myFarm(env, user);
  const row = await one(env.DB, `SELECT * FROM ${table} WHERE id=? AND farm_id=?`, Number(id) || 0, f.id);
  if (!row) fail(404, 'Not found.');
  return { f, row };
}
async function ownWorker(env, user, id) {
  const f = await myFarm(env, user);
  const w = await one(env.DB, 'SELECT * FROM workers WHERE id=? AND farm_id=?', Number(id) || 0, f.id);
  if (!w) fail(404, 'Worker not found.');
  return { f, w };
}
async function book(env, farmId, e) {
  // e: { date, kind income|expense, category, amount, planting_id, ref, note, auto_ref }
  if (!e.amount) return;
  await run(env.DB, 'INSERT OR IGNORE INTO accounts (farm_id, date, kind, category, amount, planting_id, ref, note, auto_ref) VALUES (?,?,?,?,?,?,?,?,?)', farmId, e.date || today(), e.kind, e.category, r2(e.amount), e.planting_id || null, e.ref || null, e.note || null, e.auto_ref || null);
}
async function bookOrder(env, o) {
  const sellerFarm = await one(env.DB, 'SELECT id FROM farms WHERE owner_id=?', o.farmer_id);
  const l = o.listing_id ? await one(env.DB, 'SELECT planting_id FROM listings WHERE id=?', o.listing_id) : null;
  if (sellerFarm) await book(env, sellerFarm.id, { kind: 'income', category: 'Produce sales', amount: o.total, planting_id: l && l.planting_id, ref: o.number, note: `${o.qty} ${o.unit} ${o.crop}`, auto_ref: 'sale:' + o.id });
  const buyerFarm = await one(env.DB, 'SELECT id FROM farms WHERE owner_id=?', o.buyer_id);
  if (buyerFarm) await book(env, buyerFarm.id, { kind: 'expense', category: CATEGORY_OF[o.crop] === 'Farm inputs' ? 'Inputs' : 'Purchases', amount: o.total, ref: o.number, note: `${o.qty} ${o.unit} ${o.crop}`, auto_ref: 'buy:' + o.id });
  const s = await settings(env);
  if (sellerFarm && s.fee_payer !== 'buyer') await book(env, sellerFarm.id, { kind: 'expense', category: 'FreeFarm fees', amount: s.fee_payer === 'split' ? Number(s.fee) / 2 : Number(s.fee), ref: o.number, auto_ref: 'fee:' + o.id });
}
async function safeHarvest(env, plantingId) {
  const rows = await all(env.DB, `SELECT m.date, i.name, i.withholding_days FROM stock_moves m JOIN inventory i ON i.id=m.item_id WHERE m.planting_id=? AND m.kind='use' AND i.withholding_days > 0`, plantingId);
  let best = null;
  for (const r of rows) { const d = addDays(r.date, r.withholding_days); if (!best || d > best.date) best = { date: d, item: r.name, applied: r.date }; }
  return best;
}
function makeTasks(farmId, p) {
  const c = calFor(p.crop), out = [];
  for (const [day, title, details, input] of c.tasks) out.push([farmId, p.id, p.field_id || null, title, (details || '') + (input ? ' ' + INPUT_NOTE : ''), addDays(p.planted, day), 1, input || null]);
  return out;
}
async function farmDigest(env, f, force) {
  const key = 'digest:' + f.id + ':' + today();
  if (!force && !((await run(env.DB, 'INSERT OR IGNORE INTO farm_sent (k) VALUES (?)', key)).meta || {}).changes) return null;
  const plantings = await all(env.DB, `SELECT * FROM plantings WHERE farm_id=? AND status='growing'`, f.id);
  const w = await getWeather(env, f);
  const an = analyseWeather(w, plantings);
  const bits = [];
  for (const a of an.alerts) if (((await run(env.DB, 'INSERT OR IGNORE INTO farm_sent (k) VALUES (?)', 'w:' + f.id + ':' + a.key)).meta || {}).changes) await notify(env, [f.owner_id], `${a.level === 'high' ? '⚠️ ' : ''}${a.title}. ${a.text}`, '#/farm/weather');
  const due = await one(env.DB, `SELECT COUNT(*) n, SUM(CASE WHEN due < ? THEN 1 ELSE 0 END) late FROM tasks WHERE farm_id=? AND status='open' AND due <= ?`, today(), f.id, today());
  if (due.n) bits.push(`${due.n} task${due.n > 1 ? 's' : ''} due${due.late ? ` (${due.late} overdue)` : ''}`);
  const low = await all(env.DB, `SELECT * FROM inventory WHERE farm_id=? AND active=1 AND reorder IS NOT NULL AND qty <= reorder`, f.id);
  if (low.length) bits.push(`low stock: ${low.slice(0, 3).map((i) => i.name).join(', ')}`);
  const near = plantings.filter((p) => { const s = stageOf(p); return s.days_left <= 10 && s.days_left >= 0; });
  if (near.length) bits.push(`${near.map((p) => p.crop).join(', ')} ready within 10 days: list it on FreeFarm`);
  // regional outbreaks from AI scans
  const cropList = [...new Set(plantings.map((p) => p.crop))];
  if (cropList.length && f.region) {
    const ob = await all(env.DB, `SELECT problem, crop, COUNT(DISTINCT COALESCE(farm_id, user_id)) farms FROM scans WHERE healthy=0 AND country=? AND region=? AND created_at >= ? AND crop IN (${cropList.map(() => '?').join(',')}) AND COALESCE(farm_id,0)<>? GROUP BY lower(problem), crop HAVING farms >= 2`, f.country, f.region, addDays(today(), -14), ...cropList, f.id);
    for (const o of ob) if (((await run(env.DB, 'INSERT OR IGNORE INTO farm_sent (k) VALUES (?)', `ob:${f.id}:${o.problem}:${o.crop}:${today().slice(0, 8)}`)).meta || {}).changes) await notify(env, [f.owner_id], `🦠 Outbreak alert: ${o.problem} found on ${o.crop.toLowerCase()} at ${o.farms} farms in ${f.region} in the last 2 weeks. Scout your ${o.crop.toLowerCase()} today.`, '#/farm/doctor');
  }
  // weather automation rules
  for (const r of await all(env.DB, `SELECT * FROM rules WHERE farm_id=? AND active=1 AND source='weather'`, f.id)) {
    const n3 = an.next.slice(0, 3); if (!n3.length) continue;
    const v = { tmin: Math.min(...n3.map((d) => d.tmin)), tmax: Math.max(...n3.map((d) => d.tmax)), rain: Math.max(...n3.map((d) => d.rain)), wind: Math.max(...n3.map((d) => d.wind)) }[r.metric];
    if (v != null && (r.op === '<' ? v < r.value : v > r.value)) await fireRule(env, f, r, v);
  }
  // payroll reminder at month end, attendance reminder
  const dom = Number(today().slice(8, 10));
  const workers = (await one(env.DB, `SELECT COUNT(*) n FROM workers WHERE farm_id=? AND status='active'`, f.id)).n;
  if (workers && dom >= 25 && !(await one(env.DB, `SELECT id FROM pay_runs WHERE farm_id=? AND period_to >= ?`, f.id, today().slice(0, 8) + '20'))) bits.push('month end: run payroll');
  if (bits.length) await notify(env, [f.owner_id], `Farm today: ${bits.join(' · ')}.`, '#/farm');
  return { alerts: an.alerts.length, bits };
}
async function farmDigests(env, max) {
  const farms = await all(env.DB, `SELECT f.* FROM farms f WHERE NOT EXISTS (SELECT 1 FROM farm_sent s WHERE s.k = 'digest:' || f.id || ':' || ?) LIMIT ?`, today(), max);
  for (const f of farms) { try { await farmDigest(env, f); } catch (e) { console.error('digest', f.id, e); } }
}
async function fireRule(env, f, r, v) {
  if (r.last_fired && Date.now() - new Date(r.last_fired).getTime() < 6 * 3600e3) return false;
  await run(env.DB, 'UPDATE rules SET last_fired=? WHERE id=?', now(), r.id);
  const label = r.message || `${r.metric} is ${v} (${r.op} ${r.value})`;
  await notify(env, [f.owner_id], `🤖 Automation: ${label}`, '#/farm/sensors');
  if (r.action === 'task') await run(env.DB, 'INSERT INTO tasks (farm_id, title, details, due, auto) VALUES (?,?,?,?,1)', f.id, r.message || 'Check ' + r.metric, `Created by automation: ${r.metric} ${v} ${r.op} ${r.value}`, today());
  return true;
}
function suggestions(env, ctx) {
  const out = [];
  const { tasks, plantings, low, an, prices, stockCats, money } = ctx;
  const late = tasks.filter((t) => t.due < today());
  if (late.length) out.push({ icon: '⏰', text: `${late.length} task${late.length > 1 ? 's are' : ' is'} overdue. Start with "${late[0].title}".`, link: '#/farm/tasks' });
  for (const p of plantings) {
    const s = p.st;
    const price = prices[p.crop];
    if (s.days_left <= 21 && s.days_left >= -7 && !p.listed) out.push({ icon: '🛒', text: `Your ${p.crop.toLowerCase()} is ${s.days_left > 0 ? 'ready in about ' + s.days_left + ' days' : 'ready now'}. List it now so buyers reserve it before harvest${price ? ` (market average ${price.toFixed(2)}/kg)` : ''}.`, link: `#/sell/new?planting=${p.id}` });
  }
  const soon = tasks.filter((t) => t.input && t.due <= addDays(today(), 10));
  const need = [...new Set(soon.map((t) => t.input))].filter((c) => !stockCats.has(c));
  for (const c of need.slice(0, 2)) out.push({ icon: '🧪', text: `${c} needed soon for "${soon.find((t) => t.input === c).title}" and none is in your store.`, link: `#/market?category=Farm%20inputs&q=${encodeURIComponent(c)}` });
  for (const i of low.slice(0, 2)) out.push({ icon: '📦', text: `${i.name} is low (${i.qty} ${i.unit} left). Reorder before you run out.`, link: `#/market?category=Farm%20inputs&q=${encodeURIComponent(i.category)}` });
  for (const a of an.alerts.slice(0, 3)) out.push({ icon: a.level === 'high' ? '⚠️' : '🌦️', text: `${a.title}. ${a.text}`, link: '#/farm/weather' });
  for (const a of an.advice.slice(0, 1)) out.push({ icon: '💧', text: a, link: '#/farm/weather' });
  if (money && money.expense > money.income && money.income > 0) out.push({ icon: '📉', text: `This month you spent more than you earned. Check the biggest costs in Money.`, link: '#/farm/money' });
  if (!plantings.length) out.push({ icon: '🌱', text: 'Add your crops or livestock batches to get a calendar, reminders and advice.', link: '#/farm/crops' });
  return out;
}

on('GET', '/farm', async ({ env, user }) => {
  need(user, 'farmer', 'admin');
  const f = await myFarm(env, user, false);
  return json({ farm: f ? { ...f, sensor_key: undefined } : null, full: fullFarm(user), centres: ZIM_CENTRES });
});
on('POST', '/farm', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin');
  const name = str(body.name, 100) || (user.business || user.name.split(' ')[0] + "'s farm");
  const region = str(body.region, 60) || user.region || null;
  let lat = num(body.lat), lng = num(body.lng);
  if ((lat == null || lng == null) && ZIM_CENTRES[region]) [lat, lng] = ZIM_CENTRES[region];
  if (lat != null && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) fail(400, 'Location is not valid.');
  const f = await myFarm(env, user, false);
  const vals = [name, lat, lng, num(body.size_ha), oneOf(body.country, COUNTRIES, user.country), region, str(body.town, 60) || user.town || null];
  if (f) { await run(env.DB, 'UPDATE farms SET name=?, lat=?, lng=?, size_ha=?, country=?, region=?, town=? WHERE id=?', ...vals, f.id); if (f.lat !== lat || f.lng !== lng) await run(env.DB, 'DELETE FROM weather WHERE farm_id=?', f.id); return json({ id: f.id }); }
  const r = await run(env.DB, 'INSERT INTO farms (name, lat, lng, size_ha, country, region, town, owner_id) VALUES (?,?,?,?,?,?,?,?)', ...vals, user.id);
  return json({ id: r.meta.last_row_id }, 201);
});
on('GET', '/farm/overview', async ({ env, user }) => {
  need(user, 'farmer', 'admin');
  const f = await myFarm(env, user);
  try { await farmDigest(env, f); } catch (e) { console.error(e); }
  const plantings = (await all(env.DB, `SELECT p.*, fl.name AS field, (SELECT COUNT(*) FROM listings l WHERE l.planting_id=p.id AND l.status='active') AS listed FROM plantings p LEFT JOIN fields fl ON fl.id=p.field_id WHERE p.farm_id=? AND p.status='growing' ORDER BY p.planted`, f.id)).map((p) => ({ ...p, st: stageOf(p) }));
  const tasks = await all(env.DB, `SELECT t.*, w.name AS worker, p.crop FROM tasks t LEFT JOIN workers w ON w.id=t.worker_id LEFT JOIN plantings p ON p.id=t.planting_id WHERE t.farm_id=? AND t.status='open' AND t.due <= ? ORDER BY t.due LIMIT 60`, f.id, addDays(today(), 7));
  const low = await all(env.DB, `SELECT * FROM inventory WHERE farm_id=? AND active=1 AND reorder IS NOT NULL AND qty <= reorder`, f.id);
  const stockCats = new Set((await all(env.DB, `SELECT DISTINCT category FROM inventory WHERE farm_id=? AND active=1 AND qty > 0`, f.id)).map((r) => r.category));
  const w = await getWeather(env, f);
  const an = analyseWeather(w, plantings);
  const m = today().slice(0, 8) + '01';
  const money = await one(env.DB, `SELECT COALESCE(SUM(CASE WHEN kind='income' THEN amount END),0) income, COALESCE(SUM(CASE WHEN kind='expense' THEN amount END),0) expense FROM accounts WHERE farm_id=? AND date >= ?`, f.id, m);
  const workers = await one(env.DB, `SELECT COUNT(*) n, (SELECT COUNT(*) FROM attendance a JOIN workers x ON x.id=a.worker_id WHERE x.farm_id=? AND a.date=? AND a.status<>'absent') here FROM workers WHERE farm_id=? AND status='active'`, f.id, today(), f.id);
  const pr = await all(env.DB, `SELECT crop, AVG(price / unit_kg) pkg FROM listings WHERE country=? AND created_at >= ? AND unit_kg > 0 GROUP BY crop`, f.country || 'Zimbabwe', addDays(today(), -60));
  const prices = Object.fromEntries(pr.map((r) => [r.crop, r.pkg]));
  const scans = await all(env.DB, `SELECT id, crop, healthy, problem, confidence, created_at FROM scans WHERE user_id=? ORDER BY id DESC LIMIT 4`, user.id);
  const outbreaks = f.region ? await all(env.DB, `SELECT problem, crop, COUNT(DISTINCT COALESCE(farm_id, user_id)) farms, MAX(created_at) last FROM scans WHERE healthy=0 AND country=? AND region=? AND created_at >= ? GROUP BY lower(problem), crop HAVING farms >= 2 ORDER BY farms DESC LIMIT 5`, f.country, f.region, addDays(today(), -14)) : [];
  return json({ farm: { ...f, sensor_key: undefined }, plantings, tasks, low, weather: w ? { current: w.current, next: an.next, at: w.at } : null, alerts: an.alerts, advice: an.advice, money, workers, scans, outbreaks, full: fullFarm(user),
    suggestions: suggestions(env, { tasks, plantings, low, an, prices, stockCats, money }) });
});
on('GET', '/farm/weather', async ({ env, user, url }) => {
  need(user, 'farmer', 'admin');
  const f = await myFarm(env, user);
  const w = await getWeather(env, f, url.searchParams.get('refresh') === '1');
  const plantings = await all(env.DB, `SELECT * FROM plantings WHERE farm_id=? AND status='growing'`, f.id);
  const an = analyseWeather(w, plantings);
  return json({ ok: !!w, located: f.lat != null, ...an, current: w && w.current, at: w && w.at });
});

/* fields */
on('GET', '/farm/fields', async ({ env, user }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  return json({ items: await all(env.DB, `SELECT fl.*, (SELECT GROUP_CONCAT(crop, ', ') FROM plantings p WHERE p.field_id=fl.id AND p.status='growing') AS growing FROM fields fl WHERE fl.farm_id=? AND fl.active=1 ORDER BY fl.name`, f.id) });
});
on('POST', '/farm/fields', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const name = str(body.name, 60); if (!name) fail(400, 'Name the field, e.g. "Block A" or "Garden by the dam".');
  const v = [name, num(body.size_ha), str(body.soil, 40) || null, oneOf(body.irrigation, ['Rain-fed', 'Drip', 'Sprinkler', 'Centre pivot', 'Furrow / flood', 'Bucket / hand'], 'Rain-fed'), str(body.notes, 300) || null];
  if (body.id) { const { row } = await own(env, user, 'fields', body.id); if (body.remove) { await run(env.DB, 'UPDATE fields SET active=0 WHERE id=?', row.id); return json({ ok: true }); } await run(env.DB, 'UPDATE fields SET name=?, size_ha=?, soil=?, irrigation=?, notes=? WHERE id=?', ...v, row.id); return json({ id: row.id }); }
  await farmLimit(env, user, 'fields');
  const r = await run(env.DB, 'INSERT INTO fields (name, size_ha, soil, irrigation, notes, farm_id) VALUES (?,?,?,?,?,?)', ...v, f.id);
  return json({ id: r.meta.last_row_id }, 201);
});

/* crops and livestock batches */
on('GET', '/farm/plantings', async ({ env, user, url }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const st = oneOf(url.searchParams.get('status'), ['growing', 'harvested', 'failed', 'all'], 'growing');
  const rows = await all(env.DB, `SELECT p.*, fl.name AS field,
    (SELECT COALESCE(SUM(CASE WHEN kind='income' THEN amount ELSE -amount END),0) FROM accounts a WHERE a.planting_id=p.id) AS margin_direct,
    (SELECT COALESCE(SUM(-m.qty * COALESCE(i.unit_cost,0)),0) FROM stock_moves m JOIN inventory i ON i.id=m.item_id WHERE m.planting_id=p.id AND m.kind='use') AS inputs_used,
    (SELECT COUNT(*) FROM tasks t WHERE t.planting_id=p.id AND t.status='open' AND t.due <= ?) AS due
    FROM plantings p LEFT JOIN fields fl ON fl.id=p.field_id WHERE p.farm_id=? ${st === 'all' ? '' : 'AND p.status=?'} ORDER BY p.status='growing' DESC, p.planted DESC`, today(), f.id, ...(st === 'all' ? [] : [st]));
  return json({ items: rows.map((p) => ({ ...p, st: stageOf(p), margin: r2(p.margin_direct - p.inputs_used) })) });
});
on('GET', '/farm/plantings/:id', async ({ env, user, params }) => {
  need(user, 'farmer', 'admin');
  const { row: p } = await own(env, user, 'plantings', params.id);
  const field = p.field_id ? await one(env.DB, 'SELECT name, size_ha, irrigation FROM fields WHERE id=?', p.field_id) : null;
  const logs = await all(env.DB, `SELECT id, date, kind, health, height_cm, qty, notes, (photo IS NOT NULL) AS has_photo FROM growth_logs WHERE planting_id=? ORDER BY date DESC, id DESC`, p.id);
  const tasks = await all(env.DB, `SELECT t.*, w.name AS worker FROM tasks t LEFT JOIN workers w ON w.id=t.worker_id WHERE t.planting_id=? ORDER BY t.due`, p.id);
  const inputs = await all(env.DB, `SELECT m.*, i.name, i.unit, i.unit_cost FROM stock_moves m JOIN inventory i ON i.id=m.item_id WHERE m.planting_id=? ORDER BY m.date DESC`, p.id);
  const money = await all(env.DB, 'SELECT * FROM accounts WHERE planting_id=? ORDER BY date DESC', p.id);
  const scans = await all(env.DB, 'SELECT id, healthy, problem, confidence, created_at FROM scans WHERE planting_id=? ORDER BY id DESC', p.id);
  const listings = await all(env.DB, 'SELECT id, kind, qty, unit, price, status FROM listings WHERE planting_id=? ORDER BY id DESC', p.id);
  const c = calFor(p.crop);
  return json({ item: { ...p, st: stageOf(p), field }, logs, tasks, inputs, money, scans, listings, safe: await safeHarvest(env, p.id), cal: { unit: c.unit, yield_per_ha: c.yield || null } });
});
on('POST', '/farm/plantings', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const crop = str(body.crop, 60); if (!CATEGORY_OF[crop] || CATEGORY_OF[crop] === 'Farm inputs') fail(400, 'Choose the crop or animal.');
  const planted = dateOr(body.planted); if (!planted) fail(400, 'When was it planted or started?');
  const c = calFor(crop), kind = c.livestock ? 'livestock' : 'crop';
  const field = body.field_id ? (await own(env, user, 'fields', body.field_id)).row : null;
  const area = num(body.area_ha) || (field && field.size_ha) || null;
  const exp = dateOr(body.expected_harvest) || addDays(planted, c.days);
  const yieldEst = num(body.expected_yield) || (c.yield && area && kind === 'crop' ? Math.round(c.yield * area) : null);
  const v = [field ? field.id : null, kind, crop, str(body.variety, 60) || null, area, kind === 'livestock' ? Math.round(num(body.count, 0)) || null : null, planted, exp, yieldEst, str(body.yield_unit, 20) || c.unit, str(body.notes, 500) || null];
  if (body.id) {
    const { row } = await own(env, user, 'plantings', body.id);
    if (body.status) { const s = oneOf(body.status, ['growing', 'harvested', 'failed'], row.status); await run(env.DB, 'UPDATE plantings SET status=? WHERE id=?', s, row.id); if (s !== 'growing') await run(env.DB, `UPDATE tasks SET status='skipped' WHERE planting_id=? AND status='open'`, row.id); return json({ ok: true }); }
    await run(env.DB, 'UPDATE plantings SET field_id=?, kind=?, crop=?, variety=?, area_ha=?, count=?, planted=?, expected_harvest=?, expected_yield=?, yield_unit=?, notes=? WHERE id=?', ...v, row.id);
    return json({ id: row.id });
  }
  await farmLimit(env, user, 'plantings');
  const r = await run(env.DB, 'INSERT INTO plantings (field_id, kind, crop, variety, area_ha, count, planted, expected_harvest, expected_yield, yield_unit, notes, farm_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', ...v, f.id);
  const p = await one(env.DB, 'SELECT * FROM plantings WHERE id=?', r.meta.last_row_id);
  let made = 0;
  if (body.auto_tasks !== false) {
    const list = makeTasks(f.id, p).filter((t) => t[5] >= addDays(today(), -3));
    if (list.length) await env.DB.batch(list.map((t) => env.DB.prepare('INSERT INTO tasks (farm_id, planting_id, field_id, title, details, due, auto, input) VALUES (?,?,?,?,?,?,?,?)').bind(...t)));
    made = list.length;
  }
  return json({ id: p.id, tasks: made }, 201);
});
on('POST', '/farm/plantings/:id/log', async ({ env, user, params, body }) => {
  need(user, 'farmer', 'admin');
  const { f, row: p } = await own(env, user, 'plantings', params.id);
  const kind = oneOf(body.kind, ['note', 'growth', 'harvest', 'mortality', 'weight', 'problem'], 'note');
  const photo = cleanPhoto(body.photo);
  const date = dateOr(body.date) || today(), qty = num(body.qty);
  if (['harvest', 'mortality'].includes(kind) && !(qty > 0)) fail(400, 'Enter how many.');
  await run(env.DB, 'INSERT INTO growth_logs (planting_id, date, kind, health, height_cm, qty, notes, photo) VALUES (?,?,?,?,?,?,?,?)', p.id, date, kind, oneOf(body.health, ['Good', 'Fair', 'Poor'], null), num(body.height_cm), qty, str(body.notes, 800) || null, photo || null);
  if (kind === 'harvest') {
    await run(env.DB, 'UPDATE plantings SET harvested_qty=harvested_qty+?, status=CASE WHEN ? THEN \'harvested\' ELSE status END WHERE id=?', qty, body.final ? 1 : 0, p.id);
    if (body.to_store) {
      const name = `${p.crop} (harvest)`;
      let it = await one(env.DB, `SELECT * FROM inventory WHERE farm_id=? AND name=? AND active=1`, f.id, name);
      if (!it) { const r = await run(env.DB, 'INSERT INTO inventory (farm_id, name, category, unit, qty) VALUES (?,?,?,?,0)', f.id, name, 'Harvested produce', p.yield_unit || 'kg'); it = { id: r.meta.last_row_id }; }
      await run(env.DB, 'UPDATE inventory SET qty=qty+? WHERE id=?', qty, it.id);
      await run(env.DB, 'INSERT INTO stock_moves (item_id, date, qty, kind, planting_id, note) VALUES (?,?,?,?,?,?)', it.id, date, qty, 'harvest', p.id, 'From ' + p.crop);
    }
    if (body.final) await run(env.DB, `UPDATE tasks SET status='skipped' WHERE planting_id=? AND status='open'`, p.id);
  }
  if (kind === 'mortality' && p.count) await run(env.DB, 'UPDATE plantings SET count=MAX(0, count-?) WHERE id=?', Math.round(qty), p.id);
  return json({ ok: true }, 201);
});
on('GET', '/farm/photo/:kind/:id', async ({ env, user, params }) => {
  need(user);
  const f = user.role === 'admin' ? null : await myFarm(env, user);
  const row = params.kind === 'scan' ? await one(env.DB, 'SELECT photo, user_id FROM scans WHERE id=?', Number(params.id) || 0)
    : await one(env.DB, 'SELECT g.photo, p.farm_id FROM growth_logs g JOIN plantings p ON p.id=g.planting_id WHERE g.id=?', Number(params.id) || 0);
  if (!row || !row.photo || (f && (params.kind === 'scan' ? row.user_id !== user.id : row.farm_id !== f.id))) return new Response('', { status: 404 });
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(row.photo);
  if (!m) return new Response('', { status: 404 });
  return new Response(Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0)), { headers: { 'content-type': m[1], 'cache-control': 'private, max-age=86400' } });
});

/* tasks */
on('GET', '/farm/tasks', async ({ env, user, url }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const st = oneOf(url.searchParams.get('status'), ['open', 'done', 'all'], 'open');
  return json({ items: await all(env.DB, `SELECT t.*, w.name AS worker, p.crop, fl.name AS field FROM tasks t LEFT JOIN workers w ON w.id=t.worker_id LEFT JOIN plantings p ON p.id=t.planting_id LEFT JOIN fields fl ON fl.id=COALESCE(t.field_id, p.field_id)
    WHERE t.farm_id=? ${st === 'all' ? '' : st === 'open' ? `AND t.status='open'` : `AND t.status IN ('done','skipped')`} ORDER BY ${st === 'open' ? 't.due' : 't.done_at DESC'} LIMIT 300`, f.id) });
});
on('POST', '/farm/tasks', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  if (body.id) {
    const { row: t } = await own(env, user, 'tasks', body.id);
    if (body.done || body.skip) {
      await run(env.DB, 'UPDATE tasks SET status=?, done_at=? WHERE id=?', body.skip ? 'skipped' : 'done', now(), t.id);
      if (t.repeat_days && !body.stop) await run(env.DB, 'INSERT INTO tasks (farm_id, planting_id, field_id, title, details, due, worker_id, repeat_days, auto, input) VALUES (?,?,?,?,?,?,?,?,?,?)', f.id, t.planting_id, t.field_id, t.title, t.details, addDays(t.due > today() ? t.due : today(), t.repeat_days), t.worker_id, t.repeat_days, t.auto, t.input);
      return json({ ok: true });
    }
    if (body.reopen) { await run(env.DB, `UPDATE tasks SET status='open', done_at=NULL WHERE id=?`, t.id); return json({ ok: true }); }
  }
  const title = str(body.title, 120); if (!title) fail(400, 'What needs doing?');
  const due = dateOr(body.due) || today();
  let worker = null; if (body.worker_id) worker = (await ownWorker(env, user, body.worker_id)).w.id;
  let pl = null; if (body.planting_id) pl = (await own(env, user, 'plantings', body.planting_id)).row.id;
  const v = [title, str(body.details, 600) || null, due, worker, pl, num(body.repeat_days) > 0 ? Math.round(num(body.repeat_days)) : null];
  if (body.id) { await run(env.DB, 'UPDATE tasks SET title=?, details=?, due=?, worker_id=?, planting_id=?, repeat_days=? WHERE id=?', ...v, Number(body.id)); return json({ id: Number(body.id) }); }
  const r = await run(env.DB, 'INSERT INTO tasks (title, details, due, worker_id, planting_id, repeat_days, farm_id) VALUES (?,?,?,?,?,?,?)', ...v, f.id);
  return json({ id: r.meta.last_row_id }, 201);
});

/* workers, attendance, advances, payroll */
on('GET', '/farm/workers', async ({ env, user, url }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const d = dateOr(url.searchParams.get('date')) || today();
  const items = await all(env.DB, `SELECT w.*, a.status AS today, a.hours, a.piece_qty,
    (SELECT COALESCE(SUM(CASE a2.status WHEN 'present' THEN 1 WHEN 'half' THEN 0.5 ELSE 0 END),0) FROM attendance a2 WHERE a2.worker_id=w.id AND a2.date >= ?) AS days_month,
    (SELECT COALESCE(SUM(amount),0) FROM advances v WHERE v.worker_id=w.id AND v.run_id IS NULL) AS owed
    FROM workers w LEFT JOIN attendance a ON a.worker_id=w.id AND a.date=? WHERE w.farm_id=? ORDER BY w.status='active' DESC, w.name`, d.slice(0, 8) + '01', d, f.id);
  return json({ items, date: d });
});
on('POST', '/farm/workers', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const name = str(body.name, 80); if (!name) fail(400, "Enter the worker's name.");
  const v = [name, str(body.phone, 30) || null, str(body.role, 60) || null, oneOf(body.pay_type, ['daily', 'monthly', 'piece'], 'daily'), num(body.rate, 0) || 0, dateOr(body.start) || today(), str(body.notes, 300) || null];
  if (body.id) { const { w } = await ownWorker(env, user, body.id); if ('status' in body) { await run(env.DB, 'UPDATE workers SET status=? WHERE id=?', body.status === 'left' ? 'left' : 'active', w.id); return json({ ok: true }); } await run(env.DB, 'UPDATE workers SET name=?, phone=?, role=?, pay_type=?, rate=?, start=?, notes=? WHERE id=?', ...v, w.id); return json({ id: w.id }); }
  await farmLimit(env, user, 'workers');
  const r = await run(env.DB, 'INSERT INTO workers (name, phone, role, pay_type, rate, start, notes, farm_id) VALUES (?,?,?,?,?,?,?,?)', ...v, f.id);
  return json({ id: r.meta.last_row_id }, 201);
});
on('POST', '/farm/attendance', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const date = dateOr(body.date) || today();
  if (date > today()) fail(400, 'You cannot mark attendance for the future.');
  const list = Array.isArray(body.items) ? body.items.slice(0, 300) : [];
  const ids = new Set((await all(env.DB, 'SELECT id FROM workers WHERE farm_id=?', f.id)).map((r) => r.id));
  const st = list.filter((x) => ids.has(Number(x.worker_id))).map((x) => env.DB.prepare('INSERT INTO attendance (worker_id, date, status, hours, piece_qty, note) VALUES (?,?,?,?,?,?) ON CONFLICT(worker_id, date) DO UPDATE SET status=excluded.status, hours=excluded.hours, piece_qty=excluded.piece_qty, note=excluded.note')
    .bind(Number(x.worker_id), date, oneOf(x.status, ['present', 'half', 'absent', 'leave', 'sick'], 'present'), num(x.hours), num(x.piece_qty), str(x.note, 200) || null));
  if (st.length) await env.DB.batch(st);
  return json({ saved: st.length });
});
on('POST', '/farm/advances', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin');
  const { w } = await ownWorker(env, user, body.worker_id);
  const amount = pos(body.amount, 'Enter the amount.');
  await run(env.DB, 'INSERT INTO advances (worker_id, date, amount, note) VALUES (?,?,?,?)', w.id, dateOr(body.date) || today(), amount, str(body.note, 200) || null);
  return json({ ok: true }, 201);
});
on('GET', '/farm/workers/:id', async ({ env, user, params }) => {
  need(user, 'farmer', 'admin');
  const { w } = await ownWorker(env, user, params.id);
  return json({ item: w, attendance: await all(env.DB, 'SELECT * FROM attendance WHERE worker_id=? ORDER BY date DESC LIMIT 62', w.id), advances: await all(env.DB, 'SELECT * FROM advances WHERE worker_id=? ORDER BY date DESC', w.id),
    pay: await all(env.DB, 'SELECT i.*, r.period_from, r.period_to, r.status FROM pay_items i JOIN pay_runs r ON r.id=i.run_id WHERE i.worker_id=? ORDER BY r.period_to DESC', w.id), tasks: await all(env.DB, `SELECT * FROM tasks WHERE worker_id=? AND status='open' ORDER BY due`, w.id) });
});
on('GET', '/farm/payroll', async ({ env, user }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  return json({ items: await all(env.DB, 'SELECT r.*, (SELECT COUNT(*) FROM pay_items i WHERE i.run_id=r.id) AS people FROM pay_runs r WHERE r.farm_id=? ORDER BY r.period_to DESC', f.id) });
});
on('GET', '/farm/payroll/:id', async ({ env, user, params }) => {
  need(user, 'farmer', 'admin');
  const { f, row } = await own(env, user, 'pay_runs', params.id);
  return json({ item: row, farm: { name: f.name, town: f.town, region: f.region }, items: await all(env.DB, 'SELECT i.*, w.name, w.role, w.pay_type, w.rate, w.phone FROM pay_items i JOIN workers w ON w.id=i.worker_id WHERE i.run_id=? ORDER BY w.name', row.id) });
});
on('POST', '/farm/payroll', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  if (body.id) {
    const { row: run_ } = await own(env, user, 'pay_runs', body.id);
    if (run_.status === 'paid') fail(400, 'This pay run is already paid.');
    if (body.delete) { await env.DB.batch([env.DB.prepare('DELETE FROM pay_items WHERE run_id=?').bind(run_.id), env.DB.prepare('DELETE FROM pay_runs WHERE id=?').bind(run_.id)]); return json({ ok: true }); }
    if (Array.isArray(body.items)) {
      for (const x of body.items) {
        const it = await one(env.DB, 'SELECT * FROM pay_items WHERE id=? AND run_id=?', Number(x.id) || 0, run_.id); if (!it) continue;
        const bonus = num(x.bonus, 0) || 0, ded = num(x.deductions, 0) || 0;
        await run(env.DB, 'UPDATE pay_items SET bonus=?, deductions=?, net=?, note=? WHERE id=?', bonus, ded, r2(it.gross + bonus - it.advances - ded), str(x.note, 200) || null, it.id);
      }
    }
    if (body.pay) {
      const items = await all(env.DB, 'SELECT * FROM pay_items WHERE run_id=?', run_.id);
      const total = r2(items.reduce((a, i) => a + i.net + i.advances, 0));
      await env.DB.batch([
        env.DB.prepare(`UPDATE pay_runs SET status='paid', paid_at=?, total=? WHERE id=?`).bind(now(), total, run_.id),
        env.DB.prepare(`UPDATE advances SET run_id=? WHERE run_id IS NULL AND date <= ? AND worker_id IN (SELECT worker_id FROM pay_items WHERE run_id=?)`).bind(run_.id, run_.period_to, run_.id),
      ]);
      // advances were already cash out of pocket: book them now as wages so the books show the full labour cost
      await book(env, f.id, { date: today(), kind: 'expense', category: 'Labour', amount: total, ref: 'PAY-' + run_.id, note: `Wages ${run_.period_from} to ${run_.period_to}`, auto_ref: 'pay:' + run_.id });
      return json({ ok: true, total });
    }
    const tot = (await one(env.DB, 'SELECT COALESCE(SUM(net),0) t FROM pay_items WHERE run_id=?', run_.id)).t;
    await run(env.DB, 'UPDATE pay_runs SET total=? WHERE id=?', r2(tot), run_.id);
    return json({ ok: true });
  }
  const from = dateOr(body.from), to = dateOr(body.to);
  if (!from || !to || from > to) fail(400, 'Choose the pay period.');
  if (await one(env.DB, `SELECT id FROM pay_runs WHERE farm_id=? AND NOT (period_to < ? OR period_from > ?)`, f.id, from, to)) fail(409, 'A pay run already covers part of these dates.');
  const workers = await all(env.DB, `SELECT * FROM workers WHERE farm_id=? AND status='active'`, f.id);
  if (!workers.length) fail(400, 'Add workers first.');
  const r = await run(env.DB, 'INSERT INTO pay_runs (farm_id, period_from, period_to) VALUES (?,?,?)', f.id, from, to);
  const id = r.meta.last_row_id, span = daysBetween(from, to) + 1;
  let total = 0;
  for (const w of workers) {
    const a = await one(env.DB, `SELECT COALESCE(SUM(CASE status WHEN 'present' THEN 1 WHEN 'half' THEN 0.5 WHEN 'leave' THEN 1 ELSE 0 END),0) days, COALESCE(SUM(piece_qty),0) units FROM attendance WHERE worker_id=? AND date BETWEEN ? AND ?`, w.id, from, to);
    const gross = r2(w.pay_type === 'daily' ? a.days * w.rate : w.pay_type === 'piece' ? a.units * w.rate : w.rate * Math.min(1, span / 30));
    const adv = r2((await one(env.DB, 'SELECT COALESCE(SUM(amount),0) s FROM advances WHERE worker_id=? AND run_id IS NULL AND date <= ?', w.id, to)).s);
    const net = r2(gross - adv); total += net;
    await run(env.DB, 'INSERT INTO pay_items (run_id, worker_id, days, units, gross, advances, net) VALUES (?,?,?,?,?,?,?)', id, w.id, a.days, a.units, gross, adv, net);
  }
  await run(env.DB, 'UPDATE pay_runs SET total=? WHERE id=?', r2(total), id);
  return json({ id }, 201);
});

/* inventory */
const INV_CATS = ['Seed', 'Seedlings', 'Fertiliser', 'Crop chemicals', 'Animal feed', 'Vet medicines', 'Fuel', 'Packaging', 'Tools & equipment', 'Harvested produce', 'Other'];
on('GET', '/farm/inventory', async ({ env, user }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const items = await all(env.DB, 'SELECT * FROM inventory WHERE farm_id=? AND active=1 ORDER BY category, name', f.id);
  const moves = await all(env.DB, `SELECT m.*, i.name, i.unit, p.crop FROM stock_moves m JOIN inventory i ON i.id=m.item_id LEFT JOIN plantings p ON p.id=m.planting_id WHERE i.farm_id=? ORDER BY m.id DESC LIMIT 60`, f.id);
  return json({ items: items.map((i) => ({ ...i, value: r2(i.qty * (i.unit_cost || 0)), low: i.reorder != null && i.qty <= i.reorder })), moves, categories: INV_CATS });
});
on('POST', '/farm/inventory', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const name = str(body.name, 80); if (!name) fail(400, 'Name the item.');
  const v = [name, oneOf(body.category, INV_CATS, 'Other'), str(body.unit, 20) || 'kg', num(body.reorder), num(body.withholding_days) > 0 ? Math.round(num(body.withholding_days)) : null, str(body.notes, 300) || null];
  if (body.id) { const { row } = await own(env, user, 'inventory', body.id); if (body.remove) { await run(env.DB, 'UPDATE inventory SET active=0 WHERE id=?', row.id); return json({ ok: true }); } await run(env.DB, 'UPDATE inventory SET name=?, category=?, unit=?, reorder=?, withholding_days=?, notes=? WHERE id=?', ...v, row.id); return json({ id: row.id }); }
  const r = await run(env.DB, 'INSERT INTO inventory (name, category, unit, reorder, withholding_days, notes, farm_id) VALUES (?,?,?,?,?,?,?)', ...v, f.id);
  const qty = num(body.qty, 0) || 0;
  if (qty > 0) await stockMove(env, f, r.meta.last_row_id, { kind: 'purchase', qty, cost: num(body.cost), date: today(), note: 'Opening stock', book: !!body.book });
  return json({ id: r.meta.last_row_id }, 201);
});
async function stockMove(env, f, itemId, m) {
  const it = await one(env.DB, 'SELECT * FROM inventory WHERE id=? AND farm_id=?', itemId, f.id);
  if (!it) fail(404, 'Item not found.');
  const sign = ['use', 'sale', 'loss'].includes(m.kind) ? -1 : 1;
  const q = Math.abs(m.qty) * (m.kind === 'adjust' ? Math.sign(m.qty) || 1 : sign);
  if (q < 0 && it.qty + q < -1e-9) fail(400, `Only ${it.qty} ${it.unit} of ${it.name} in stock.`);
  let unitCost = it.unit_cost;
  if (m.kind === 'purchase' && m.cost > 0) unitCost = Math.round((((Math.max(0, it.qty) * (it.unit_cost || 0)) + m.cost) / (Math.max(0, it.qty) + q)) * 10000) / 10000;
  const newQty = it.qty + q;
  await run(env.DB, 'UPDATE inventory SET qty=?, unit_cost=?, alerted=CASE WHEN reorder IS NOT NULL AND ? > reorder THEN 0 ELSE alerted END WHERE id=?', newQty, unitCost, newQty, it.id);
  const r = await run(env.DB, 'INSERT INTO stock_moves (item_id, date, qty, kind, planting_id, cost, note) VALUES (?,?,?,?,?,?,?)', it.id, m.date || today(), q, m.kind, m.planting_id || null, m.cost || null, m.note || null);
  if (m.kind === 'purchase' && m.cost > 0 && m.book !== false) await book(env, f.id, { date: m.date, kind: 'expense', category: { 'Animal feed': 'Feed', Fuel: 'Fuel', 'Vet medicines': 'Vet', 'Tools & equipment': 'Equipment' }[it.category] || 'Inputs', amount: m.cost, note: `${Math.abs(q)} ${it.unit} ${it.name}`, auto_ref: 'stock:' + r.meta.last_row_id });
  if (m.kind === 'sale' && m.amount > 0) await book(env, f.id, { date: m.date, kind: 'income', category: 'Produce sales', amount: m.amount, planting_id: m.planting_id, note: `${Math.abs(q)} ${it.unit} ${it.name} (off FreeFarm)`, auto_ref: 'stocksale:' + r.meta.last_row_id });
  if (m.kind === 'use' && m.planting_id) await run(env.DB, 'INSERT INTO growth_logs (planting_id, date, kind, qty, notes) VALUES (?,?,?,?,?)', m.planting_id, m.date || today(), it.category === 'Crop chemicals' ? 'spray' : 'input', Math.abs(q), `${Math.abs(q)} ${it.unit} ${it.name}${it.withholding_days ? ` · withholding ${it.withholding_days} days, safe to harvest from ${addDays(m.date || today(), it.withholding_days)}` : ''}`);
  const after = await one(env.DB, 'SELECT * FROM inventory WHERE id=?', it.id);
  if (after.reorder != null && after.qty <= after.reorder && !after.alerted) {
    await run(env.DB, 'UPDATE inventory SET alerted=1 WHERE id=?', it.id);
    await notify(env, [f.owner_id], `📦 ${after.name} is running low: ${after.qty} ${after.unit} left (reorder level ${after.reorder}).`, '#/farm/store');
  }
}
on('POST', '/farm/stock', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const kind = oneOf(body.kind, ['purchase', 'use', 'sale', 'loss', 'adjust'], null); if (!kind) fail(400, 'What happened to the stock?');
  const qty = num(body.qty); if (!qty) fail(400, 'Enter the quantity.');
  let pl = null; if (body.planting_id) pl = (await own(env, user, 'plantings', body.planting_id)).row.id;
  await stockMove(env, f, Number(body.item_id) || 0, { kind, qty, cost: num(body.cost), amount: num(body.amount), date: dateOr(body.date) || today(), planting_id: pl, note: str(body.note, 200) || null });
  return json({ ok: true });
});

/* accounts */
const AC_CATS = { income: ['Produce sales', 'Livestock sales', 'Contract / services', 'Grants & support', 'Other income'], expense: ['Inputs', 'Seed', 'Feed', 'Vet', 'Labour', 'Fuel', 'Transport', 'Equipment', 'Repairs', 'Rent & land', 'Water & power', 'FreeFarm fees', 'Purchases', 'Loan repayment', 'Other expense'] };
on('GET', '/farm/accounts', async ({ env, user, url }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const from = dateOr(url.searchParams.get('from')) || today().slice(0, 5) + '01-01', to = dateOr(url.searchParams.get('to')) || today();
  const rows = await all(env.DB, `SELECT a.*, p.crop FROM accounts a LEFT JOIN plantings p ON p.id=a.planting_id WHERE a.farm_id=? AND a.date BETWEEN ? AND ? ORDER BY a.date DESC, a.id DESC LIMIT 1000`, f.id, from, to);
  const months = await all(env.DB, `SELECT substr(date,1,7) m, SUM(CASE WHEN kind='income' THEN amount ELSE 0 END) income, SUM(CASE WHEN kind='expense' THEN amount ELSE 0 END) expense FROM accounts WHERE farm_id=? AND date BETWEEN ? AND ? GROUP BY m ORDER BY m`, f.id, from, to);
  const cats = await all(env.DB, `SELECT kind, category, SUM(amount) total FROM accounts WHERE farm_id=? AND date BETWEEN ? AND ? GROUP BY kind, category ORDER BY total DESC`, f.id, from, to);
  const stock = (await one(env.DB, 'SELECT COALESCE(SUM(qty * COALESCE(unit_cost,0)),0) v FROM inventory WHERE farm_id=? AND active=1', f.id)).v;
  const wages = (await one(env.DB, `SELECT COALESCE(SUM(i.net),0) v FROM pay_items i JOIN pay_runs r ON r.id=i.run_id WHERE r.farm_id=? AND r.status='draft'`, f.id)).v;
  return json({ items: rows, months, cats, from, to, categories: AC_CATS, stock_value: r2(stock), wages_due: r2(wages) });
});
on('POST', '/farm/accounts', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  if (body.id && body.delete) { const { row } = await own(env, user, 'accounts', body.id); if (row.auto_ref) fail(400, 'Automatic entries come from sales, payroll and stock. Change those instead.'); await run(env.DB, 'DELETE FROM accounts WHERE id=?', row.id); return json({ ok: true }); }
  const kind = oneOf(body.kind, ['income', 'expense'], null); if (!kind) fail(400, 'Money in or money out?');
  let pl = null; if (body.planting_id) pl = (await own(env, user, 'plantings', body.planting_id)).row.id;
  await book(env, f.id, { date: dateOr(body.date) || today(), kind, category: oneOf(body.category, AC_CATS[kind], kind === 'income' ? 'Other income' : 'Other expense'), amount: pos(body.amount, 'Enter the amount.'), planting_id: pl, ref: str(body.ref, 60) || null, note: str(body.note, 300) || null });
  return json({ ok: true }, 201);
});
on('GET', '/farm/export/:kind', async ({ env, user, params }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  let rows, cols;
  if (params.kind === 'accounts') { rows = await all(env.DB, 'SELECT a.*, p.crop FROM accounts a LEFT JOIN plantings p ON p.id=a.planting_id WHERE a.farm_id=? ORDER BY a.date', f.id); cols = ['date', 'kind', 'category', 'amount', 'crop', 'ref', 'note']; }
  else if (params.kind === 'attendance') { rows = await all(env.DB, 'SELECT a.*, w.name FROM attendance a JOIN workers w ON w.id=a.worker_id WHERE w.farm_id=? ORDER BY a.date, w.name', f.id); cols = ['date', 'name', 'status', 'hours', 'piece_qty', 'note']; }
  else if (params.kind === 'stock') { rows = await all(env.DB, 'SELECT m.*, i.name, i.unit FROM stock_moves m JOIN inventory i ON i.id=m.item_id WHERE i.farm_id=? ORDER BY m.date', f.id); cols = ['date', 'name', 'kind', 'qty', 'unit', 'cost', 'note']; }
  else fail(404, 'Unknown export.');
  return new Response(csv(rows, cols), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="farm-${params.kind}-${today()}.csv"`, 'cache-control': 'no-store' } });
});

/* AI plant doctor and advisor (Cloudflare Workers AI) */
const VISION = '@cf/meta/llama-3.2-11b-vision-instruct', TEXT = '@cf/meta/llama-3.1-8b-instruct';
const aiText = (out) => out && (out.response !== undefined ? out.response : out.choices && out.choices[0] && out.choices[0].message ? out.choices[0].message.content : out.result);
function parseJSON(t) { const m = String(t || '').match(/\{[\s\S]*\}/); if (!m) return null; try { return JSON.parse(m[0]); } catch (e) { return null; } }
on('POST', '/farm/scan', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin');
  const f = await myFarm(env, user, false);
  if (f) await farmLimit(env, user, 'scans');
  else if (!fullFarm(user) && (await one(env.DB, 'SELECT COUNT(*) n FROM scans WHERE user_id=? AND created_at >= ?', user.id, today().slice(0, 8) + '01')).n >= 3) fail(402, 'Your plan includes 3 AI plant scans a month. Upgrade to Farm Manager for unlimited.');
  if (!env.AI) fail(503, 'The AI plant doctor is not switched on yet. Try again later.');
  const photo = cleanPhoto(body.photo); if (!photo) fail(400, 'Take or choose a clear photo of the leaf, fruit or plant.');
  let pl = null; if (body.planting_id && f) pl = (await own(env, user, 'plantings', body.planting_id)).row;
  const crop = (pl && pl.crop) || str(body.crop, 60) || 'unknown crop';
  const prompt = `You are an experienced African agronomist and plant pathologist. Look at this photo of ${crop}${pl ? ` (${stageOf(pl).stage.toLowerCase()}, planted ${pl.planted})` : ''} from a farm in ${f ? (f.region || '') + ', ' + (f.country || '') : user.country}. ${str(body.notes, 300) ? 'The farmer says: ' + str(body.notes, 300) + '.' : ''}
Identify any disease, pest, nutrient deficiency or other problem. Reply with ONLY a JSON object, no other text:
{"healthy": true|false, "problem": "short name or 'Healthy'", "type": "disease|pest|nutrient|water|other|none", "confidence": "low|medium|high", "signs": "what you see in the photo", "cause": "what causes it", "act_now": ["step 1", "step 2", "step 3"], "organic": "a low-cost or organic option", "chemical": "type of product to use (active ingredient class, not a brand), or empty", "prevent": "how to prevent it next time", "spread_risk": "low|medium|high", "see_expert": true|false}
If the photo is not a plant or is too unclear, set problem to "Unclear photo" and confidence to "low".`;
  let res;
  const ask = () => env.AI.run(VISION, { messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: photo } }] }], max_tokens: 900, temperature: 0.2 });
  try {
    let out;
    try { out = await ask(); } catch (e) {
      if (!/agree|licen[cs]e/i.test(String(e && e.message))) throw e;
      await env.AI.run(VISION, { prompt: 'agree' }); // one-time acceptance of the Llama 3.2 community licence for this account
      out = await ask();
    }
    const resp = aiText(out);
    res = resp && typeof resp === 'object' ? resp : parseJSON(resp);
  } catch (e) { console.error('scan', e); fail(502, 'The plant doctor could not read that photo. Try a closer, brighter photo.'); }
  if (!res) fail(502, 'The plant doctor could not read that photo. Try a closer, brighter photo.');
  const healthy = res.healthy === true || /healthy/i.test(res.problem || '') ? 1 : 0;
  const problem = str(res.problem, 80) || (healthy ? 'Healthy' : 'Unknown problem');
  const r = await run(env.DB, 'INSERT INTO scans (farm_id, user_id, planting_id, crop, photo, healthy, problem, confidence, result, country, region) VALUES (?,?,?,?,?,?,?,?,?,?,?)', f ? f.id : null, user.id, pl ? pl.id : null, crop, photo, healthy, problem, oneOf(res.confidence, ['low', 'medium', 'high'], 'low'), JSON.stringify(res).slice(0, 4000), f ? f.country : user.country, f ? f.region : user.region);
  if (pl) await run(env.DB, 'INSERT INTO growth_logs (planting_id, date, kind, health, notes) VALUES (?,?,?,?,?)', pl.id, today(), healthy ? 'note' : 'problem', healthy ? 'Good' : 'Poor', 'AI scan: ' + problem);
  if (!healthy && f && res.confidence !== 'low' && !/unclear/i.test(problem)) {
    if (pl && Array.isArray(res.act_now) && res.act_now.length) await run(env.DB, 'INSERT INTO tasks (farm_id, planting_id, title, details, due, auto, input) VALUES (?,?,?,?,?,1,?)', f.id, pl.id, `Treat ${problem} on ${crop.toLowerCase()}`, res.act_now.join(' · ').slice(0, 600), today(), res.type === 'nutrient' ? 'Fertiliser' : 'Crop chemicals');
    // regional outbreak: tell nearby farms growing this crop once 2+ other farms report the same problem
    const same = await one(env.DB, `SELECT COUNT(DISTINCT COALESCE(farm_id, user_id)) n FROM scans WHERE healthy=0 AND lower(problem)=lower(?) AND crop=? AND country=? AND region=? AND created_at >= ?`, problem, crop, f.country, f.region, addDays(today(), -14));
    if (same.n >= 3) {
      const near = await all(env.DB, `SELECT DISTINCT fa.owner_id FROM plantings p JOIN farms fa ON fa.id=p.farm_id WHERE p.crop=? AND p.status='growing' AND fa.country=? AND fa.region=? AND fa.id<>?`, crop, f.country, f.region, f.id);
      for (const n of near) if (((await run(env.DB, 'INSERT OR IGNORE INTO farm_sent (k) VALUES (?)', `ob:${n.owner_id}:${problem}:${crop}:${today().slice(0, 8)}`)).meta || {}).changes) await notify(env, [n.owner_id], `🦠 Outbreak alert: ${problem} reported on ${crop.toLowerCase()} at ${same.n} farms in ${f.region}. Scout your ${crop.toLowerCase()} today.`, '#/farm/doctor');
    }
  }
  return json({ id: r.meta.last_row_id, result: { ...res, problem, healthy: !!healthy } }, 201);
});
on('GET', '/farm/scans', async ({ env, user }) => {
  need(user, 'farmer', 'admin');
  return json({ items: (await all(env.DB, 'SELECT id, planting_id, crop, healthy, problem, confidence, result, created_at FROM scans WHERE user_id=? ORDER BY id DESC LIMIT 60', user.id)).map((s) => ({ ...s, result: JSON.parse(s.result || '{}') })) });
});
on('POST', '/farm/ask', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin');
  const f = await myFarm(env, user);
  await farmLimit(env, user, 'ask');
  if (!env.AI) fail(503, 'The AI advisor is not switched on yet. Try again later.');
  const q = str(body.q, 800); if (q.length < 3) fail(400, 'Type your question.');
  const plantings = await all(env.DB, `SELECT * FROM plantings WHERE farm_id=? AND status='growing'`, f.id);
  const w = await getWeather(env, f); const an = analyseWeather(w, plantings);
  const stock = await all(env.DB, 'SELECT name, qty, unit FROM inventory WHERE farm_id=? AND active=1 LIMIT 30', f.id);
  const money = await one(env.DB, `SELECT COALESCE(SUM(CASE WHEN kind='income' THEN amount END),0) i, COALESCE(SUM(CASE WHEN kind='expense' THEN amount END),0) e FROM accounts WHERE farm_id=? AND date >= ?`, f.id, today().slice(0, 5) + '01-01');
  const ctx = `Farm: ${f.name}, ${f.size_ha || '?'} ha, ${[f.town, f.region, f.country].filter(Boolean).join(', ')}. Today ${today()}.
Crops and animals: ${plantings.map((p) => { const s = stageOf(p); return `${p.crop}${p.variety ? ' ' + p.variety : ''} (${p.kind === 'livestock' ? (p.count || '?') + ' animals' : (p.area_ha || '?') + ' ha'}, day ${s.age}, ${s.stage}, harvest in ${s.days_left} days)`; }).join('; ') || 'none recorded'}.
Weather next days: ${an.next.slice(0, 5).map((d) => `${d.date} ${Math.round(d.tmin)}-${Math.round(d.tmax)}°C rain ${Math.round(d.rain)}mm`).join('; ') || 'unknown'}. Alerts: ${an.alerts.map((a) => a.title).join('; ') || 'none'}.
Store: ${stock.map((s) => `${s.name} ${s.qty} ${s.unit}`).join(', ') || 'empty'}. This year income ${r2(money.i)}, expenses ${r2(money.e)}.`;
  const recent = await all(env.DB, 'SELECT q, a FROM advice WHERE farm_id=? ORDER BY id DESC LIMIT 2', f.id);
  const msgs = [{ role: 'system', content: `You are FreeFarm's farm advisor for small and commercial farmers in Africa. Give practical, low-cost, step-by-step advice in simple English (short paragraphs or bullets, under 250 words). Use the farm details. Give fertiliser and chemical advice as product types and guide rates, and remind the farmer to follow labels and local extension officers (e.g. AGRITEX in Zimbabwe). Suggest selling surplus on FreeFarm when it helps avoid waste. Never invent prices; say when the farmer should check locally.\n\n${ctx}` },
    ...recent.reverse().flatMap((r) => [{ role: 'user', content: r.q }, { role: 'assistant', content: r.a }]), { role: 'user', content: q }];
  let a;
  try { const out = await env.AI.run(TEXT, { messages: msgs, max_tokens: 600, temperature: 0.4 }); const t = aiText(out); a = str(typeof t === 'string' ? t : JSON.stringify(t || ''), 4000); } catch (e) { console.error('ask', e); }
  if (!a) fail(502, 'The advisor could not answer right now. Please try again.');
  await run(env.DB, 'INSERT INTO advice (farm_id, q, a) VALUES (?,?,?)', f.id, q, a);
  return json({ a });
});
on('GET', '/farm/ask', async ({ env, user }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  return json({ items: await all(env.DB, 'SELECT * FROM advice WHERE farm_id=? ORDER BY id DESC LIMIT 30', f.id) });
});

/* sensors and automations */
on('GET', '/farm/sensors', async ({ env, user }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  const sensors = await all(env.DB, 'SELECT s.*, fl.name AS field FROM sensors s LEFT JOIN fields fl ON fl.id=s.field_id WHERE s.farm_id=? ORDER BY s.name', f.id);
  for (const s of sensors) s.history = await all(env.DB, 'SELECT value, at FROM readings WHERE sensor_id=? ORDER BY id DESC LIMIT 48', s.id);
  return json({ sensors, rules: await all(env.DB, 'SELECT * FROM rules WHERE farm_id=? ORDER BY id', f.id), key: fullFarm(user) ? f.sensor_key : null, full: fullFarm(user) });
});
on('POST', '/farm/sensors', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  if (body.new_key) { if (!fullFarm(user)) fail(402, 'Sensors and automations are part of the Farm Manager plan.'); const k = randHex(20); await run(env.DB, 'UPDATE farms SET sensor_key=? WHERE id=?', k, f.id); return json({ key: k }); }
  if (body.id && body.remove) { const { row } = await own(env, user, 'sensors', body.id); await env.DB.batch([env.DB.prepare('DELETE FROM readings WHERE sensor_id=?').bind(row.id), env.DB.prepare('DELETE FROM sensors WHERE id=?').bind(row.id)]); return json({ ok: true }); }
  await farmLimit(env, user, 'sensors');
  const name = str(body.name, 60); if (!name) fail(400, 'Name the sensor, e.g. "Block A soil".');
  const metric = oneOf(body.metric, ['soil_moisture', 'soil_temp', 'air_temp', 'humidity', 'water_level', 'rain', 'tank_level', 'other'], 'other');
  const units = { soil_moisture: '%', soil_temp: '°C', air_temp: '°C', humidity: '%', water_level: 'cm', rain: 'mm', tank_level: '%' };
  const r = await run(env.DB, 'INSERT INTO sensors (farm_id, name, field_id, metric, unit) VALUES (?,?,?,?,?)', f.id, name, num(body.field_id), metric, str(body.unit, 10) || units[metric] || '');
  if (!f.sensor_key) await run(env.DB, 'UPDATE farms SET sensor_key=? WHERE id=?', randHex(20), f.id);
  return json({ id: r.meta.last_row_id }, 201);
});
on('POST', '/farm/rules', async ({ env, user, body }) => {
  need(user, 'farmer', 'admin'); const f = await myFarm(env, user);
  if (body.id) { const { row } = await own(env, user, 'rules', body.id); if (body.remove) await run(env.DB, 'DELETE FROM rules WHERE id=?', row.id); else await run(env.DB, 'UPDATE rules SET active=? WHERE id=?', body.active ? 1 : 0, row.id); return json({ ok: true }); }
  const source = String(body.source || '');
  if (source !== 'weather' && !/^sensor:\d+$/.test(source)) fail(400, 'Choose what to watch.');
  if (source !== 'weather' && !fullFarm(user)) fail(402, 'Sensor automations are part of the Farm Manager plan.');
  if (source.startsWith('sensor:')) await own(env, user, 'sensors', source.split(':')[1]);
  const metric = source === 'weather' ? oneOf(body.metric, ['tmin', 'tmax', 'rain', 'wind'], null) : 'value';
  if (!metric) fail(400, 'Choose the weather measure.');
  const value = num(body.value); if (value == null) fail(400, 'Enter the limit.');
  const r = await run(env.DB, 'INSERT INTO rules (farm_id, source, metric, op, value, action, message) VALUES (?,?,?,?,?,?,?)', f.id, source, metric, body.op === '<' ? '<' : '>', value, body.action === 'task' ? 'task' : 'alert', str(body.message, 160) || null);
  return json({ id: r.meta.last_row_id }, 201);
});
// device endpoint: POST /api/farm/data  { key, readings: [{ sensor: "Block A soil", value: 23.5 }] }  (header x-farm-key also accepted)
on('POST', '/farm/data', async ({ env, req, body }) => {
  const key = req.headers.get('x-farm-key') || str(body.key, 64);
  if (!/^[a-f0-9]{40}$/.test(key)) fail(401, 'Missing or wrong farm key.');
  const f = await one(env.DB, 'SELECT * FROM farms WHERE sensor_key=?', key);
  if (!f) fail(401, 'Missing or wrong farm key.');
  const owner = await one(env.DB, 'SELECT * FROM users WHERE id=?', f.owner_id);
  if (!owner || !fullFarm(owner)) fail(402, 'Sensors need the Farm Manager plan.');
  const list = (Array.isArray(body.readings) ? body.readings : []).slice(0, 50);
  let saved = 0, fired = 0;
  for (const x of list) {
    const s = await one(env.DB, 'SELECT * FROM sensors WHERE farm_id=? AND (id=? OR name=?)', f.id, Number(x.sensor) || 0, str(x.sensor, 60));
    const v = num(x.value); if (!s || v == null) continue;
    await run(env.DB, 'INSERT INTO readings (sensor_id, value, at) VALUES (?,?,?)', s.id, v, now());
    await run(env.DB, 'UPDATE sensors SET last_value=?, last_at=? WHERE id=?', v, now(), s.id);
    saved++;
    for (const r of await all(env.DB, `SELECT * FROM rules WHERE farm_id=? AND active=1 AND source=?`, f.id, 'sensor:' + s.id))
      if ((r.op === '<' ? v < r.value : v > r.value) && await fireRule(env, f, { ...r, message: r.message || `${s.name}: ${v}${s.unit || ''}` }, v)) fired++;
  }
  return json({ saved, fired });
});

/* ---------- entry ---------- */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method.toUpperCase();
  const secure = url.protocol === 'https:';
  try {
    if (!env.DB) fail(503, 'The database is not connected yet.');
    if (method !== 'GET' && method !== 'HEAD') {
      if (!(request.headers.get('content-type') || '').includes('application/json')) fail(415, 'Send JSON.');
      const origin = request.headers.get('origin');
      if (origin && new URL(origin).host !== url.host) fail(403, 'Cross-site request blocked.');
    }
    for (const r of routes) {
      if (r.method !== method) continue;
      const m = path.match(r.re);
      if (!m) continue;
      let body = {};
      if (method === 'POST') { try { body = await request.json(); } catch { body = {}; } if (!body || typeof body !== 'object') body = {}; }
      const user = await currentUser(env, request);
      if (user && user.must_change && !['/me', '/me/password', '/auth/logout', '/lookups'].includes(path)) fail(403, 'Please choose a new password first.');
      return await r.handler({ env, req: request, url, body, user, params: m.groups || {}, secure });
    }
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  }
}
