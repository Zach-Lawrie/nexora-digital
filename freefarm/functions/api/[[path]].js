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
  price_farmer_pro: '3', price_buyer_business: '5', price_buyer_export: '15', price_transport_pro: '3',
  pay_ecocash: '', pay_name: 'FreeFarm', pay_bank: '', support_whatsapp: '', auto_complete_hours: '72',
};
const COOKIE = 'ff_s';
const ROLES = ['farmer', 'buyer', 'transporter'];

/* ---------- helpers ---------- */
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const today = () => new Date().toISOString().slice(0, 10);
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
    await chargeOrderFee(env, o);
    await notify(env, [o.buyer_id, o.farmer_id], `${o.number}: marked as received automatically.`, '#/order/' + o.id);
  }
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
    plans: { farmer: plansFor('farmer', s), buyer: plansFor('buyer', s), transporter: plansFor('transporter', s) },
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
  need(user, 'farmer', 'admin');
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
    if (d.kind === 'preharvest') fail(402, 'Pre-harvest listings are part of Farmer Pro. Upgrade under Plan & billing.');
    const live = (await one(env.DB, `SELECT COUNT(*) n FROM listings WHERE farmer_id=? AND status='active'`, user.id)).n;
    if (live >= 3) fail(402, 'Starter accounts can have 3 live listings. Upgrade to Farmer Pro for unlimited listings.');
  }
  const r = await run(env.DB, `INSERT INTO listings (farmer_id, kind, crop, category, variety, grade, qty, unit, unit_kg, price, min_order, rescue_pct, available_from, best_before, country, region, town, delivery, organic, export_ready, notes, photo)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, user.id, ...Object.values(d), photo || null);
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
    if (user.role === 'farmer' || scope === 'farmer') { w = 'o.farmer_id=?'; b = [user.id]; }
    else if (user.role === 'transporter') { w = 'j.transporter_id=?'; b = [user.id]; }
    else { w = 'o.buyer_id=?'; b = [user.id]; }
  }
  const rows = await all(env.DB, ORDER_SQL + ` WHERE ${w} ORDER BY o.id DESC LIMIT 300`, ...b);
  return json({ items: rows.map((o) => ({ ...o, buyer_phone: undefined, farmer_phone: undefined, transporter_phone: undefined })) });
});
on('POST', '/orders', async ({ env, user, body }) => {
  need(user, 'buyer');
  await notBlocked(env, user);
  const l = await one(env.DB, `SELECT l.*, u.status AS ustatus, u.demo FROM listings l JOIN users u ON u.id=l.farmer_id WHERE l.id=?`, Number(body.listing_id) || 0);
  if (!l || l.status !== 'active' || l.ustatus !== 'active') fail(404, 'Sorry, this produce is no longer available.');
  if (l.demo && !user.demo) fail(400, 'This is an example listing to show how FreeFarm works. Real farmers\' produce appears in the market as they join.');
  const qty = pos(body.qty, 'How much do you want?');
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
  if (to === 'completed') await chargeOrderFee(env, o);
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
  const q = url.searchParams, role = oneOf(q.get('role'), ['farmer', 'buyer', 'transporter'], 'farmer'), w = [`u.role=?`, `u.status='active'`], b = [role];
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
    if (['fee', 'transport_fee', 'fee_limit', 'price_farmer_pro', 'price_buyer_business', 'price_buyer_export', 'price_transport_pro'].includes(k)) { const n = num(v); if (n == null || n < 0 || n > 10000) fail(400, 'Check the amounts.'); v = String(n); }
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
    `DELETE FROM sessions WHERE user_id IN ${IN}`, `DELETE FROM users WHERE id IN ${IN}`,
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
