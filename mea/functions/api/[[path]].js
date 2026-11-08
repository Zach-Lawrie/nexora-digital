// MEA API — Cloudflare Pages Function. All routes live under /api/.
// Database: D1 bound as env.DB. Sessions: HttpOnly cookie "mea_s".

const STAFF_DOMAINS = ['@meazim.co.zw', '@mea.co.zw'];
const isStaffEmail = (e) => STAFF_DOMAINS.some((d) => String(e).toLowerCase().endsWith(d));
const DOMAIN_TEXT = STAFF_DOMAINS.join(' or ');
const DEPTS = ['admin', 'training', 'store', 'maintenance', 'engineering'];
const ROLES = ['admin', 'teacher', 'staff', 'student'];
const ORDER_STATUS = ['awaiting_payment', 'paid', 'packed', 'dispatched', 'completed', 'cancelled'];
const ENQ_STATUS = ['new', 'in_progress', 'quoted', 'won', 'closed'];
const SESSION_DAYS = 7;

/* ---------------- helpers ---------------- */
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const str = (v, max = 500) => (v == null ? '' : String(v)).trim().slice(0, max);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : NaN; };
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const randHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));

async function hashPassword(password, saltHex) {
  const salt = saltHex ? new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return { hash: hex(bits), salt: hex(salt) };
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function tempPassword() {
  const words = ['Gear', 'Volt', 'Relay', 'Drive', 'Sensor', 'Panel', 'Motor', 'Cable', 'Switch', 'Meter'];
  const w = words[crypto.getRandomValues(new Uint8Array(1))[0] % words.length];
  return w + '-' + randHex(3).toUpperCase() + '-' + (100 + (crypto.getRandomValues(new Uint16Array(1))[0] % 900));
}
function passwordRule(p) {
  if (typeof p !== 'string' || p.length < 8) fail(400, 'Use a password of at least 8 characters.');
  if (p.length > 128) fail(400, 'That password is too long.');
}
function getCookie(req, name) {
  const c = req.headers.get('cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}
const cookie = (token, maxAge) => `mea_s=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

const all = async (db, sql, ...b) => (await db.prepare(sql).bind(...b).all()).results || [];
const one = (db, sql, ...b) => db.prepare(sql).bind(...b).first();
const run = (db, sql, ...b) => db.prepare(sql).bind(...b).run();

async function audit(env, user, action, detail) {
  try { await run(env.DB, 'INSERT INTO audit (user_id, who, action, detail) VALUES (?,?,?,?)', user ? user.id : null, user ? user.email : 'public', action, detail ? String(detail).slice(0, 400) : null); } catch (e) { /* never block on audit */ }
}
const publicUser = (u) => u && ({ id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role, dept: u.dept, must_change: !!u.must_change });

async function currentUser(env, req) {
  const t = getCookie(req, 'mea_s');
  if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  const u = await one(env.DB, `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ? AND u.status = 'active'`, t, now());
  return u || null;
}
function need(user, ...roles) {
  if (!user) fail(401, 'Please sign in.');
  if (user.must_change) fail(403, 'Change your temporary password first.');
  if (roles.length && !roles.includes(user.role)) fail(403, 'Your account cannot do that.');
}
const isStore = (u) => u.role === 'admin' || (u.role === 'staff' && u.dept === 'store');
const deptFor = (type, project) => {
  if (/career/i.test(type)) return 'admin';
  if (/training/i.test(project)) return 'training';
  if (/equipment|spare/i.test(project)) return 'store';
  if (/maintenance/i.test(project) || /service/i.test(type)) return 'maintenance';
  if (/electrical|automation|instrument|mechanical/i.test(project)) return 'engineering';
  return 'admin';
};
function dayRange(url) {
  const from = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('from') || '') ? url.searchParams.get('from') : '2000-01-01';
  const to = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('to') || '') ? url.searchParams.get('to') : '2999-12-31';
  return [from + 'T00:00:00Z', to + 'T23:59:59Z'];
}

/* ---------------- routes ---------------- */
const routes = [];
const on = (method, pattern, handler) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler });

/* auth */
on('POST', '/auth/login', async ({ env, body }) => {
  const email = str(body.email, 200).toLowerCase(), password = String(body.password || '');
  const u = await one(env.DB, 'SELECT * FROM users WHERE email = ?', email);
  if (u && u.locked_until && u.locked_until > now()) fail(429, 'Too many wrong attempts. Try again in 15 minutes.');
  const ok = u && u.status === 'active' && safeEqual((await hashPassword(password, u.pass_salt)).hash, u.pass_hash);
  if (!ok) {
    if (u) {
      const f = u.failed + 1;
      await run(env.DB, 'UPDATE users SET failed = ?, locked_until = ? WHERE id = ?', f >= 8 ? 0 : f, f >= 8 ? new Date(Date.now() + 15 * 60e3).toISOString() : null, u.id);
    }
    fail(401, u && u.status === 'disabled' ? 'This account is switched off. Contact MEA admin.' : 'Email or password is wrong.');
  }
  const token = randHex(32);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),
    env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)').bind(token, u.id, new Date(Date.now() + SESSION_DAYS * 864e5).toISOString()),
    env.DB.prepare('UPDATE users SET failed = 0, locked_until = NULL, last_login = ? WHERE id = ?').bind(now(), u.id),
  ]);
  await audit(env, u, 'login', null);
  return json({ user: publicUser(u) }, 200, { 'set-cookie': cookie(token, SESSION_DAYS * 86400) });
});
on('POST', '/auth/logout', async ({ env, req }) => {
  const t = getCookie(req, 'mea_s');
  if (t) await run(env.DB, 'DELETE FROM sessions WHERE token = ?', t);
  return json({ ok: true }, 200, { 'set-cookie': cookie('x', 0) });
});
on('POST', '/auth/signup', async ({ env, body }) => {
  const name = str(body.name, 100), email = str(body.email, 200).toLowerCase(), phone = str(body.phone, 40);
  if (!name) fail(400, 'Enter your full name.');
  if (!emailOk(email)) fail(400, 'Enter a valid email address.');
  if (isStaffEmail(email)) fail(400, 'MEA staff accounts are created by the admin. Sign in with the password you were given.');
  passwordRule(body.password);
  if (await one(env.DB, 'SELECT id FROM users WHERE email = ?', email)) fail(409, 'An account with that email already exists. Sign in instead.');
  const { hash, salt } = await hashPassword(body.password);
  const r = await run(env.DB, `INSERT INTO users (email, name, phone, role, dept, pass_hash, pass_salt) VALUES (?,?,?,'student','training',?,?)`, email, name, phone, hash, salt);
  const u = await one(env.DB, 'SELECT * FROM users WHERE id = ?', r.meta.last_row_id);
  const token = randHex(32);
  await run(env.DB, 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)', token, u.id, new Date(Date.now() + SESSION_DAYS * 864e5).toISOString());
  await audit(env, u, 'student signed up', email);
  return json({ user: publicUser(u) }, 201, { 'set-cookie': cookie(token, SESSION_DAYS * 86400) });
});
on('GET', '/me', async ({ user }) => json({ user: publicUser(user) }));
on('POST', '/me/password', async ({ env, user, body }) => {
  if (!user) fail(401, 'Please sign in.');
  if (!safeEqual((await hashPassword(String(body.current || ''), user.pass_salt)).hash, user.pass_hash)) fail(400, 'Your current password is wrong.');
  passwordRule(body.password);
  if (body.password === body.current) fail(400, 'Choose a new password that is different from the old one.');
  const { hash, salt } = await hashPassword(body.password);
  await run(env.DB, 'UPDATE users SET pass_hash = ?, pass_salt = ?, must_change = 0 WHERE id = ?', hash, salt, user.id);
  await audit(env, user, 'changed password', null);
  return json({ ok: true });
});

/* public */
on('GET', '/courses', async ({ env }) =>
  json({ courses: await all(env.DB, `SELECT c.id, c.code, c.title, c.level, c.mode, c.weeks, c.fee, c.description, u.name AS teacher FROM courses c LEFT JOIN users u ON u.id = c.teacher_id WHERE c.active = 1 ORDER BY c.code`) }));
on('GET', '/products', async ({ env }) =>
  json({ products: await all(env.DB, `SELECT id, sku, name, category, brand, price, description, CASE WHEN stock > 0 THEN stock ELSE 0 END AS stock FROM products WHERE active = 1 ORDER BY category, name`) }));
on('POST', '/orders', async ({ env, body }) => {
  const name = str(body.name, 100), email = str(body.email, 200).toLowerCase(), phone = str(body.phone, 40);
  if (!name || !emailOk(email) || !phone) fail(400, 'Enter your name, a valid email and a phone number.');
  const delivery = body.delivery === 'deliver' ? 'deliver' : 'collect';
  const address = str(body.address, 400);
  if (delivery === 'deliver' && !address) fail(400, 'Enter the delivery address.');
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  if (!items.length) fail(400, 'Your cart is empty.');
  const lines = []; let total = 0;
  for (const it of items) {
    const id = parseInt(it.id, 10), qty = parseInt(it.qty, 10);
    if (!id || !(qty > 0) || qty > 999) fail(400, 'One of the quantities is not valid.');
    const p = await one(env.DB, 'SELECT * FROM products WHERE id = ? AND active = 1', id);
    if (!p) fail(400, 'One of the products is no longer available. Refresh the store.');
    if (p.stock < qty) fail(409, `Only ${Math.max(p.stock, 0)} of "${p.name}" left in stock.`);
    lines.push({ p, qty }); total += p.price * qty;
  }
  total = Math.round(total * 100) / 100;
  const number = 'MEA-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + randHex(2).toUpperCase();
  const r = await run(env.DB, `INSERT INTO orders (number, name, email, phone, country, delivery, address, notes, total) VALUES (?,?,?,?,?,?,?,?,?)`,
    number, name, email, phone, str(body.country, 40), delivery, address, str(body.notes, 600), total);
  const oid = r.meta.last_row_id;
  await env.DB.batch(lines.flatMap(({ p, qty }) => [
    env.DB.prepare('INSERT INTO order_items (order_id, product_id, sku, name, qty, price) VALUES (?,?,?,?,?,?)').bind(oid, p.id, p.sku, p.name, qty, p.price),
    env.DB.prepare('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?').bind(qty, now(), p.id),
  ]));
  await audit(env, null, 'store order placed', number + ' $' + total.toFixed(2));
  return json({ order: { number, total, status: 'awaiting_payment' } }, 201);
});
on('POST', '/orders/lookup', async ({ env, body }) => {
  const o = await one(env.DB, 'SELECT id, number, status, total, delivery, created_at FROM orders WHERE number = ? AND email = ?', str(body.number, 40).toUpperCase(), str(body.email, 200).toLowerCase());
  if (!o) fail(404, 'No order matches that number and email.');
  o.items = await all(env.DB, 'SELECT name, qty, price FROM order_items WHERE order_id = ?', o.id);
  delete o.id;
  return json({ order: o });
});
on('POST', '/enquiries', async ({ env, body }) => {
  const e = { type: str(body.type, 60), name: str(body.name, 100), company: str(body.company, 120), email: str(body.email, 200), phone: str(body.phone, 40), country: str(body.country, 40), project: str(body.project, 60), description: str(body.description, 3000), budget: str(body.budget, 60), needed_by: str(body.needed_by, 20) };
  if (!e.name || !e.description) fail(400, 'Add your name and a short description.');
  if (!e.email && !e.phone) fail(400, 'Add an email or phone number so MEA can reply.');
  const dept = deptFor(e.type, e.project);
  await run(env.DB, `INSERT INTO enquiries (type, name, company, email, phone, country, project, description, budget, needed_by, dept) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    e.type, e.name, e.company, e.email, e.phone, e.country, e.project, e.description, e.budget, e.needed_by, dept);
  await audit(env, null, 'enquiry received', `${e.type} from ${e.name} → ${dept}`);
  return json({ ok: true, dept }, 201);
});

/* student */
on('GET', '/student/overview', async ({ env, user }) => {
  need(user, 'student', 'admin', 'teacher', 'staff');
  const enrolments = await all(env.DB, `SELECT e.id, e.status, e.progress, e.created_at, c.id AS course_id, c.code, c.title, c.level, c.weeks, c.fee, t.name AS teacher,
      ce.cert_no, ce.issued_at FROM enrolments e JOIN courses c ON c.id = e.course_id LEFT JOIN users t ON t.id = c.teacher_id
      LEFT JOIN certificates ce ON ce.enrolment_id = e.id WHERE e.student_id = ? ORDER BY e.created_at DESC`, user.id);
  const results = await all(env.DB, `SELECT r.enrolment_id, r.assessment, r.score, r.max_score, r.created_at FROM results r JOIN enrolments e ON e.id = r.enrolment_id WHERE e.student_id = ? ORDER BY r.created_at`, user.id);
  return json({ enrolments, results });
});
on('POST', '/student/enrol', async ({ env, user, body }) => {
  need(user, 'student');
  const c = await one(env.DB, 'SELECT * FROM courses WHERE id = ? AND active = 1', parseInt(body.course_id, 10));
  if (!c) fail(404, 'That course is not open for enrolment.');
  const ex = await one(env.DB, 'SELECT * FROM enrolments WHERE student_id = ? AND course_id = ?', user.id, c.id);
  if (ex && !['withdrawn', 'rejected'].includes(ex.status)) fail(409, 'You have already applied for this course.');
  if (ex) await run(env.DB, `UPDATE enrolments SET status = 'pending', progress = 0, updated_at = ? WHERE id = ?`, now(), ex.id);
  else await run(env.DB, 'INSERT INTO enrolments (student_id, course_id) VALUES (?,?)', user.id, c.id);
  await audit(env, user, 'enrolment requested', c.code);
  return json({ ok: true }, 201);
});

/* teacher */
async function teachable(env, user, enrolmentId) {
  const e = await one(env.DB, `SELECT e.*, c.teacher_id, c.code, c.title, s.name AS student FROM enrolments e JOIN courses c ON c.id = e.course_id JOIN users s ON s.id = e.student_id WHERE e.id = ?`, enrolmentId);
  if (!e) fail(404, 'Enrolment not found.');
  if (user.role !== 'admin' && e.teacher_id !== user.id) fail(403, 'This student is not in one of your courses.');
  return e;
}
on('GET', '/teach/overview', async ({ env, user }) => {
  need(user, 'teacher', 'admin');
  const mine = user.role === 'admin' ? '1=1' : 'c.teacher_id = ' + Number(user.id);
  const courses = await all(env.DB, `SELECT c.*, u.name AS teacher, (SELECT COUNT(*) FROM enrolments e WHERE e.course_id = c.id AND e.status IN ('active','pending')) AS students FROM courses c LEFT JOIN users u ON u.id = c.teacher_id WHERE ${mine} ORDER BY c.code`);
  const enrolments = await all(env.DB, `SELECT e.id, e.status, e.progress, e.created_at, e.course_id, c.code, s.name AS student, s.email, s.phone, ce.cert_no,
      (SELECT ROUND(AVG(r.score * 100.0 / r.max_score)) FROM results r WHERE r.enrolment_id = e.id) AS avg_pct
      FROM enrolments e JOIN courses c ON c.id = e.course_id JOIN users s ON s.id = e.student_id LEFT JOIN certificates ce ON ce.enrolment_id = e.id
      WHERE ${mine} AND e.status NOT IN ('withdrawn','rejected') ORDER BY e.status = 'pending' DESC, c.code, s.name`);
  const results = await all(env.DB, `SELECT r.id, r.enrolment_id, r.assessment, r.score, r.max_score, r.created_at FROM results r JOIN enrolments e ON e.id = r.enrolment_id JOIN courses c ON c.id = e.course_id WHERE ${mine} ORDER BY r.created_at`);
  return json({ courses, enrolments, results });
});
on('POST', '/teach/enrolment/:id', async ({ env, user, body, params }) => {
  need(user, 'teacher', 'admin');
  const e = await teachable(env, user, parseInt(params.id, 10));
  const a = body.action;
  if (a === 'approve') { if (e.status !== 'pending') fail(400, 'Only pending applications can be approved.'); await run(env.DB, `UPDATE enrolments SET status='active', updated_at=? WHERE id=?`, now(), e.id); }
  else if (a === 'reject') { if (e.status !== 'pending') fail(400, 'Only pending applications can be declined.'); await run(env.DB, `UPDATE enrolments SET status='rejected', updated_at=? WHERE id=?`, now(), e.id); }
  else if (a === 'withdraw') await run(env.DB, `UPDATE enrolments SET status='withdrawn', updated_at=? WHERE id=?`, now(), e.id);
  else if (a === 'progress') {
    const p = Math.max(0, Math.min(100, parseInt(body.progress, 10) || 0));
    if (e.status !== 'active') fail(400, 'Approve the student before updating progress.');
    await run(env.DB, 'UPDATE enrolments SET progress=?, updated_at=? WHERE id=?', p, now(), e.id);
  } else if (a === 'complete') {
    if (e.status !== 'active') fail(400, 'Only active students can be completed.');
    const year = new Date().getUTCFullYear();
    const n = (await one(env.DB, `SELECT COUNT(*) AS n FROM certificates WHERE cert_no LIKE ?`, `MEA-${year}-%`)).n + 1;
    const certNo = `MEA-${year}-${String(n).padStart(4, '0')}`;
    await env.DB.batch([
      env.DB.prepare(`UPDATE enrolments SET status='completed', progress=100, updated_at=? WHERE id=?`).bind(now(), e.id),
      env.DB.prepare('INSERT INTO certificates (enrolment_id, cert_no, issued_by) VALUES (?,?,?)').bind(e.id, certNo, user.id),
    ]);
    await audit(env, user, 'certificate issued', `${certNo} ${e.student} ${e.code}`);
    return json({ ok: true, cert_no: certNo });
  } else fail(400, 'Unknown action.');
  await audit(env, user, 'enrolment ' + a, `${e.student} ${e.code}`);
  return json({ ok: true });
});
on('POST', '/teach/result', async ({ env, user, body }) => {
  need(user, 'teacher', 'admin');
  const e = await teachable(env, user, parseInt(body.enrolment_id, 10));
  if (!['active', 'completed'].includes(e.status)) fail(400, 'Results can only be recorded for approved students.');
  const assessment = str(body.assessment, 100), score = num(body.score), max = num(body.max_score);
  if (!assessment) fail(400, 'Name the assessment, for example "Practical 1".');
  if (!(max > 0) || !(score >= 0) || score > max) fail(400, 'Score must be between 0 and the maximum.');
  await run(env.DB, 'INSERT INTO results (enrolment_id, assessment, score, max_score, recorded_by) VALUES (?,?,?,?,?)', e.id, assessment, score, max, user.id);
  await audit(env, user, 'result recorded', `${e.student} ${e.code} ${assessment} ${score}/${max}`);
  return json({ ok: true }, 201);
});
on('POST', '/teach/course/:id', async ({ env, user, body, params }) => {
  need(user, 'teacher', 'admin');
  const c = await one(env.DB, 'SELECT * FROM courses WHERE id = ?', parseInt(params.id, 10));
  if (!c) fail(404, 'Course not found.');
  if (user.role !== 'admin' && c.teacher_id !== user.id) fail(403, 'You do not teach this course.');
  await run(env.DB, 'UPDATE courses SET description = ? WHERE id = ?', str(body.description, 2000), c.id);
  return json({ ok: true });
});

/* store department */
on('GET', '/shop/overview', async ({ env, user }) => {
  need(user, 'staff', 'admin'); if (!isStore(user)) fail(403, 'Only the store department can open this.');
  const products = await all(env.DB, 'SELECT * FROM products ORDER BY category, name');
  const orders = await all(env.DB, `SELECT o.*, (SELECT GROUP_CONCAT(qty || ' × ' || name, '; ') FROM order_items WHERE order_id = o.id) AS items FROM orders o ORDER BY o.created_at DESC LIMIT 200`);
  return json({ products, orders });
});
on('POST', '/shop/product', async ({ env, user, body }) => {
  need(user, 'staff', 'admin'); if (!isStore(user)) fail(403, 'Only the store department can change products.');
  const p = { sku: str(body.sku, 40).toUpperCase(), name: str(body.name, 140), category: str(body.category, 60), brand: str(body.brand, 60), price: num(body.price), stock: parseInt(body.stock, 10), low_stock: parseInt(body.low_stock, 10), description: str(body.description, 1500), active: body.active ? 1 : 0 };
  if (!p.sku || !p.name || !p.category) fail(400, 'SKU, name and category are required.');
  if (!(p.price >= 0)) fail(400, 'Enter a price of 0 or more.');
  if (!Number.isInteger(p.stock) || p.stock < 0) fail(400, 'Stock must be a whole number, 0 or more.');
  if (!Number.isInteger(p.low_stock) || p.low_stock < 0) p.low_stock = 2;
  const id = parseInt(body.id, 10);
  const clash = await one(env.DB, 'SELECT id FROM products WHERE sku = ? AND id != ?', p.sku, id || 0);
  if (clash) fail(409, 'Another product already uses that SKU.');
  if (id) {
    const r = await run(env.DB, 'UPDATE products SET sku=?, name=?, category=?, brand=?, price=?, stock=?, low_stock=?, description=?, active=?, updated_at=? WHERE id=?', p.sku, p.name, p.category, p.brand, p.price, p.stock, p.low_stock, p.description, p.active, now(), id);
    if (!r.meta.changes) fail(404, 'Product not found.');
  } else await run(env.DB, 'INSERT INTO products (sku, name, category, brand, price, stock, low_stock, description, active) VALUES (?,?,?,?,?,?,?,?,?)', p.sku, p.name, p.category, p.brand, p.price, p.stock, p.low_stock, p.description, p.active);
  await audit(env, user, id ? 'product updated' : 'product added', `${p.sku} ${p.name} stock ${p.stock}`);
  return json({ ok: true });
});
on('POST', '/shop/order/:id', async ({ env, user, body, params }) => {
  need(user, 'staff', 'admin'); if (!isStore(user)) fail(403, 'Only the store department can update orders.');
  const o = await one(env.DB, 'SELECT * FROM orders WHERE id = ?', parseInt(params.id, 10));
  if (!o) fail(404, 'Order not found.');
  const s = body.status;
  if (!ORDER_STATUS.includes(s)) fail(400, 'Unknown status.');
  if (o.status === 'cancelled') fail(400, 'This order is cancelled and cannot change.');
  const stmts = [env.DB.prepare('UPDATE orders SET status=?, updated_at=? WHERE id=?').bind(s, now(), o.id)];
  if (s === 'cancelled') {
    for (const it of await all(env.DB, 'SELECT product_id, qty FROM order_items WHERE order_id = ?', o.id))
      if (it.product_id) stmts.push(env.DB.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').bind(it.qty, it.product_id));
  }
  await env.DB.batch(stmts);
  await audit(env, user, 'order ' + s.replace('_', ' '), o.number);
  return json({ ok: true });
});

/* department enquiries (maintenance, engineering, store, training, admin) */
on('GET', '/dept/enquiries', async ({ env, user }) => {
  need(user, 'staff', 'teacher', 'admin');
  const rows = user.role === 'admin'
    ? await all(env.DB, 'SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 300')
    : await all(env.DB, 'SELECT * FROM enquiries WHERE dept = ? ORDER BY created_at DESC LIMIT 300', user.dept);
  return json({ enquiries: rows });
});
on('POST', '/dept/enquiry/:id', async ({ env, user, body, params }) => {
  need(user, 'staff', 'teacher', 'admin');
  const q = await one(env.DB, 'SELECT * FROM enquiries WHERE id = ?', parseInt(params.id, 10));
  if (!q) fail(404, 'Enquiry not found.');
  if (user.role !== 'admin' && q.dept !== user.dept) fail(403, 'This enquiry belongs to another department.');
  const status = ENQ_STATUS.includes(body.status) ? body.status : q.status;
  const dept = user.role === 'admin' && DEPTS.includes(body.dept) ? body.dept : q.dept;
  const note = body.note != null ? str(body.note, 1000) : q.note;
  await run(env.DB, 'UPDATE enquiries SET status=?, dept=?, note=?, updated_at=? WHERE id=?', status, dept, note, now(), q.id);
  await audit(env, user, 'enquiry updated', `#${q.id} ${q.name} → ${status}${dept !== q.dept ? ', moved to ' + dept : ''}`);
  return json({ ok: true });
});

/* admin */
on('GET', '/admin/dashboard', async ({ env, user }) => {
  need(user, 'admin');
  const c = async (sql, ...b) => (await one(env.DB, sql, ...b)) || {};
  const monthStart = new Date().toISOString().slice(0, 8) + '01T00:00:00Z';
  const [people, training, store, enq] = await Promise.all([
    c(`SELECT SUM(role='student') AS students, SUM(role='teacher') AS teachers, SUM(role='staff') AS staff, SUM(role='admin') AS admins, SUM(status='disabled') AS disabled FROM users`),
    c(`SELECT SUM(status='pending') AS pending, SUM(status='active') AS active, SUM(status='completed') AS completed, (SELECT COUNT(*) FROM certificates) AS certificates, (SELECT COUNT(*) FROM courses WHERE active=1) AS courses, (SELECT COUNT(*) FROM courses WHERE active=1 AND teacher_id IS NULL) AS no_teacher FROM enrolments`),
    c(`SELECT SUM(status='awaiting_payment') AS awaiting, SUM(status IN ('paid','packed')) AS to_send, (SELECT COALESCE(SUM(total),0) FROM orders WHERE status NOT IN ('cancelled','awaiting_payment') AND created_at >= ?) AS month_sales, (SELECT COUNT(*) FROM products WHERE active=1) AS products, (SELECT COUNT(*) FROM products WHERE active=1 AND stock <= low_stock) AS low_stock FROM orders`, monthStart),
    all(env.DB, `SELECT dept, SUM(status='new') AS new, SUM(status IN ('in_progress','quoted')) AS open, SUM(status='won') AS won, COUNT(*) AS total FROM enquiries GROUP BY dept`),
  ]);
  const staffByDept = await all(env.DB, `SELECT dept, COUNT(*) AS n FROM users WHERE role IN ('teacher','staff','admin') AND status='active' GROUP BY dept`);
  const lowStock = await all(env.DB, 'SELECT sku, name, stock, low_stock FROM products WHERE active=1 AND stock <= low_stock ORDER BY stock LIMIT 10');
  const activity = await all(env.DB, 'SELECT who, action, detail, at FROM audit ORDER BY id DESC LIMIT 25');
  return json({ people, training, store, enquiries: enq, staffByDept, lowStock, activity, monthStart });
});
on('GET', '/admin/users', async ({ env, user }) => {
  need(user, 'admin');
  return json({ users: await all(env.DB, 'SELECT id, email, name, phone, role, dept, status, must_change, created_at, last_login FROM users ORDER BY role, name') });
});
on('POST', '/admin/users', async ({ env, user, body }) => {
  need(user, 'admin');
  const email = str(body.email, 200).toLowerCase(), name = str(body.name, 100), role = body.role, dept = body.dept;
  if (!name) fail(400, 'Enter the person\'s name.');
  if (!isStaffEmail(email) || !emailOk(email)) fail(400, `Staff emails must end in ${DOMAIN_TEXT}.`);
  if (!['admin', 'teacher', 'staff'].includes(role)) fail(400, 'Choose admin, teacher or staff.');
  if (!DEPTS.includes(dept)) fail(400, 'Choose a department.');
  if (await one(env.DB, 'SELECT id FROM users WHERE email = ?', email)) fail(409, 'That email already has an account.');
  const temp = tempPassword(); const { hash, salt } = await hashPassword(temp);
  await run(env.DB, 'INSERT INTO users (email, name, phone, role, dept, pass_hash, pass_salt, must_change) VALUES (?,?,?,?,?,?,?,1)', email, name, str(body.phone, 40), role, role === 'teacher' ? 'training' : dept, hash, salt);
  await audit(env, user, 'staff account created', `${email} (${role}, ${dept})`);
  return json({ ok: true, temp_password: temp }, 201);
});
on('POST', '/admin/users/:id', async ({ env, user, body, params }) => {
  need(user, 'admin');
  const t = await one(env.DB, 'SELECT * FROM users WHERE id = ?', parseInt(params.id, 10));
  if (!t) fail(404, 'User not found.');
  const a = body.action;
  if (t.id === user.id && ['disable', 'update'].includes(a)) fail(400, 'You cannot switch off or change your own admin account here.');
  if (a === 'reset') {
    const temp = tempPassword(); const { hash, salt } = await hashPassword(temp);
    await env.DB.batch([
      env.DB.prepare('UPDATE users SET pass_hash=?, pass_salt=?, must_change=1, failed=0, locked_until=NULL WHERE id=?').bind(hash, salt, t.id),
      env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(t.id),
    ]);
    await audit(env, user, 'password reset', t.email);
    return json({ ok: true, temp_password: temp });
  }
  if (a === 'disable' || a === 'enable') {
    await run(env.DB, 'UPDATE users SET status=? WHERE id=?', a === 'disable' ? 'disabled' : 'active', t.id);
    if (a === 'disable') await run(env.DB, 'DELETE FROM sessions WHERE user_id = ?', t.id);
    await audit(env, user, 'account ' + a + 'd', t.email);
    return json({ ok: true });
  }
  if (a === 'update') {
    const role = ROLES.includes(body.role) ? body.role : t.role;
    if (role !== 'student' && !isStaffEmail(t.email)) fail(400, `Only ${DOMAIN_TEXT} accounts can be staff, teachers or admins.`);
    const dept = role === 'teacher' || role === 'student' ? 'training' : DEPTS.includes(body.dept) ? body.dept : t.dept;
    await run(env.DB, 'UPDATE users SET name=?, phone=?, role=?, dept=? WHERE id=?', str(body.name, 100) || t.name, str(body.phone, 40), role, dept, t.id);
    await audit(env, user, 'account updated', `${t.email} → ${role}, ${dept}`);
    return json({ ok: true });
  }
  fail(400, 'Unknown action.');
});
on('POST', '/admin/course', async ({ env, user, body }) => {
  need(user, 'admin');
  const c = { code: str(body.code, 20).toUpperCase(), title: str(body.title, 120), level: str(body.level, 40) || 'Fundamentals', mode: str(body.mode, 60) || 'Online or face to face', weeks: parseInt(body.weeks, 10) || null, fee: body.fee === '' || body.fee == null ? null : num(body.fee), description: str(body.description, 2000), teacher_id: parseInt(body.teacher_id, 10) || null, active: body.active ? 1 : 0 };
  if (!c.code || !c.title) fail(400, 'Course code and title are required.');
  if (c.fee != null && !(c.fee >= 0)) fail(400, 'Fee must be a number, or leave it empty for "on request".');
  if (c.teacher_id && !(await one(env.DB, `SELECT id FROM users WHERE id=? AND role IN ('teacher','admin') AND status='active'`, c.teacher_id))) fail(400, 'Pick an active teacher.');
  const id = parseInt(body.id, 10);
  if (await one(env.DB, 'SELECT id FROM courses WHERE code=? AND id != ?', c.code, id || 0)) fail(409, 'Another course already uses that code.');
  if (id) await run(env.DB, 'UPDATE courses SET code=?, title=?, level=?, mode=?, weeks=?, fee=?, description=?, teacher_id=?, active=? WHERE id=?', c.code, c.title, c.level, c.mode, c.weeks, c.fee, c.description, c.teacher_id, c.active, id);
  else await run(env.DB, 'INSERT INTO courses (code, title, level, mode, weeks, fee, description, teacher_id, active) VALUES (?,?,?,?,?,?,?,?,?)', c.code, c.title, c.level, c.mode, c.weeks, c.fee, c.description, c.teacher_id, c.active);
  await audit(env, user, id ? 'course updated' : 'course added', c.code + ' ' + c.title);
  return json({ ok: true });
});
on('GET', '/admin/courses', async ({ env, user }) => {
  need(user, 'admin');
  return json({ courses: await all(env.DB, `SELECT c.*, u.name AS teacher FROM courses c LEFT JOIN users u ON u.id = c.teacher_id ORDER BY c.code`) });
});

const REPORTS = {
  enrolments: { title: 'Enrolments', dated: 'e.created_at',
    sql: `SELECT e.created_at AS "Applied", s.name AS "Student", s.email AS "Email", c.code AS "Course", c.title AS "Course title", t.name AS "Teacher", e.status AS "Status", e.progress AS "Progress %" FROM enrolments e JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id LEFT JOIN users t ON t.id=c.teacher_id WHERE e.created_at BETWEEN ? AND ? ORDER BY e.created_at DESC` },
  results: { title: 'Assessment results',
    sql: `SELECT r.created_at AS "Date", s.name AS "Student", c.code AS "Course", r.assessment AS "Assessment", r.score AS "Score", r.max_score AS "Out of", ROUND(r.score*100.0/r.max_score) AS "%", u.name AS "Recorded by" FROM results r JOIN enrolments e ON e.id=r.enrolment_id JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id LEFT JOIN users u ON u.id=r.recorded_by WHERE r.created_at BETWEEN ? AND ? ORDER BY r.created_at DESC` },
  certificates: { title: 'Certificates issued',
    sql: `SELECT ce.issued_at AS "Issued", ce.cert_no AS "Certificate no.", s.name AS "Student", c.code AS "Course", c.title AS "Course title", u.name AS "Issued by" FROM certificates ce JOIN enrolments e ON e.id=ce.enrolment_id JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id LEFT JOIN users u ON u.id=ce.issued_by WHERE ce.issued_at BETWEEN ? AND ? ORDER BY ce.issued_at DESC` },
  sales: { title: 'Store orders', money: 'Total (USD)',
    sql: `SELECT o.created_at AS "Date", o.number AS "Order", o.name AS "Customer", o.phone AS "Phone", o.country AS "Country", o.delivery AS "Delivery", o.status AS "Status", (SELECT GROUP_CONCAT(qty || ' × ' || name, '; ') FROM order_items WHERE order_id=o.id) AS "Items", o.total AS "Total (USD)" FROM orders o WHERE o.created_at BETWEEN ? AND ? ORDER BY o.created_at DESC` },
  stock: { title: 'Stock levels', undated: true,
    sql: `SELECT sku AS "SKU", name AS "Product", category AS "Category", brand AS "Brand", price AS "Price (USD)", stock AS "In stock", low_stock AS "Reorder at", CASE WHEN stock <= low_stock THEN 'Reorder' ELSE 'OK' END AS "Status", CASE WHEN active=1 THEN 'On sale' ELSE 'Hidden' END AS "Shown" FROM products ORDER BY (stock <= low_stock) DESC, category, name` },
  enquiries: { title: 'Enquiries by department',
    sql: `SELECT created_at AS "Received", dept AS "Department", type AS "Type", project AS "Project", name AS "Name", company AS "Company", country AS "Country", status AS "Status", note AS "Note" FROM enquiries WHERE created_at BETWEEN ? AND ? ORDER BY dept, created_at DESC` },
  users: { title: 'User accounts', undated: true,
    sql: `SELECT name AS "Name", email AS "Email", role AS "Role", dept AS "Department", status AS "Status", created_at AS "Created", last_login AS "Last sign-in" FROM users ORDER BY role, dept, name` },
  activity: { title: 'Activity log',
    sql: `SELECT at AS "When", who AS "Who", action AS "Action", detail AS "Detail" FROM audit WHERE at BETWEEN ? AND ? ORDER BY id DESC LIMIT 2000` },
};
on('GET', '/admin/report', async ({ env, user, url }) => {
  need(user, 'admin');
  const r = REPORTS[url.searchParams.get('type')];
  if (!r) fail(400, 'Choose a report.');
  const [from, to] = dayRange(url);
  const rows = r.undated ? await all(env.DB, r.sql) : await all(env.DB, r.sql, from, to);
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const summary = { rows: rows.length };
  if (r.money) summary.total = Math.round(rows.filter((x) => !['cancelled', 'awaiting_payment'].includes(x.Status)).reduce((s, x) => s + (x[r.money] || 0), 0) * 100) / 100;
  if (rows.length && 'Status' in rows[0]) { summary.byStatus = {}; rows.forEach((x) => { summary.byStatus[x.Status] = (summary.byStatus[x.Status] || 0) + 1; }); }
  if (rows.length && 'Department' in rows[0] && url.searchParams.get('type') === 'enquiries') { summary.byDept = {}; rows.forEach((x) => { summary.byDept[x.Department] = (summary.byDept[x.Department] || 0) + 1; }); }
  await audit(env, user, 'report generated', r.title);
  return json({ title: r.title, from: r.undated ? null : from.slice(0, 10), to: r.undated ? null : to.slice(0, 10), columns, rows, summary, generated_at: now(), generated_by: user.name });
});

/* export for the Google Sheet (MEA Database). Needs the EXPORT_KEY secret. */
const EXPORTS = [
  ['Students', `SELECT u.id AS "ID", u.name AS "Name", u.email AS "Email", u.phone AS "Phone", u.status AS "Account", substr(u.created_at,1,10) AS "Joined", substr(u.last_login,1,16) AS "Last sign-in",
     (SELECT COUNT(*) FROM enrolments e WHERE e.student_id=u.id AND e.status='pending') AS "Applications waiting",
     (SELECT COUNT(*) FROM enrolments e WHERE e.student_id=u.id AND e.status='active') AS "Courses in progress",
     (SELECT COUNT(*) FROM enrolments e WHERE e.student_id=u.id AND e.status='completed') AS "Courses completed",
     (SELECT GROUP_CONCAT(c.code, ', ') FROM enrolments e JOIN courses c ON c.id=e.course_id WHERE e.student_id=u.id AND e.status IN ('pending','active','completed')) AS "Courses"
     FROM users u WHERE u.role='student' ORDER BY u.name`],
  ['Teachers & staff', `SELECT u.id AS "ID", u.name AS "Name", u.email AS "Email", u.phone AS "Phone", u.role AS "Role", u.dept AS "Department", u.status AS "Account", substr(u.created_at,1,10) AS "Created", substr(u.last_login,1,16) AS "Last sign-in",
     (SELECT GROUP_CONCAT(code, ', ') FROM courses WHERE teacher_id=u.id) AS "Courses taught"
     FROM users u WHERE u.role IN ('admin','teacher','staff') ORDER BY u.role, u.dept, u.name`],
  ['Courses', `SELECT c.code AS "Code", c.title AS "Course", c.level AS "Level", c.weeks AS "Weeks", c.fee AS "Fee (USD)", t.name AS "Teacher", CASE WHEN c.active=1 THEN 'Open' ELSE 'Hidden' END AS "Shown",
     (SELECT COUNT(*) FROM enrolments e WHERE e.course_id=c.id AND e.status='pending') AS "Waiting",
     (SELECT COUNT(*) FROM enrolments e WHERE e.course_id=c.id AND e.status='active') AS "In progress",
     (SELECT COUNT(*) FROM enrolments e WHERE e.course_id=c.id AND e.status='completed') AS "Completed"
     FROM courses c LEFT JOIN users t ON t.id=c.teacher_id ORDER BY c.code`],
  ['Enrolments', `SELECT e.id AS "ID", substr(e.created_at,1,10) AS "Applied", s.name AS "Student", s.email AS "Email", c.code AS "Course", t.name AS "Teacher", e.status AS "Status", e.progress AS "Progress %",
     (SELECT ROUND(AVG(r.score*100.0/r.max_score)) FROM results r WHERE r.enrolment_id=e.id) AS "Average %", ce.cert_no AS "Certificate"
     FROM enrolments e JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id LEFT JOIN users t ON t.id=c.teacher_id LEFT JOIN certificates ce ON ce.enrolment_id=e.id ORDER BY e.created_at DESC`],
  ['Results', `SELECT substr(r.created_at,1,10) AS "Date", s.name AS "Student", c.code AS "Course", r.assessment AS "Assessment", r.score AS "Score", r.max_score AS "Out of", ROUND(r.score*100.0/r.max_score) AS "%", u.name AS "Recorded by"
     FROM results r JOIN enrolments e ON e.id=r.enrolment_id JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id LEFT JOIN users u ON u.id=r.recorded_by ORDER BY r.created_at DESC`],
  ['Certificates', `SELECT ce.cert_no AS "Certificate no.", substr(ce.issued_at,1,10) AS "Issued", s.name AS "Student", s.email AS "Email", c.code AS "Course", c.title AS "Course title", u.name AS "Issued by"
     FROM certificates ce JOIN enrolments e ON e.id=ce.enrolment_id JOIN users s ON s.id=e.student_id JOIN courses c ON c.id=e.course_id LEFT JOIN users u ON u.id=ce.issued_by ORDER BY ce.issued_at DESC`],
  ['Inventory', `SELECT sku AS "SKU", name AS "Product", category AS "Category", brand AS "Brand", price AS "Price (USD)", stock AS "In stock", low_stock AS "Reorder at", ROUND(price*stock,2) AS "Stock value (USD)",
     CASE WHEN stock <= low_stock THEN 'Reorder' ELSE 'OK' END AS "Stock status", CASE WHEN active=1 THEN 'On sale' ELSE 'Hidden' END AS "Shown", substr(COALESCE(updated_at, created_at),1,10) AS "Last changed"
     FROM products ORDER BY category, name`],
  ['Orders', `SELECT substr(o.created_at,1,16) AS "Date", o.number AS "Order", o.name AS "Customer", o.email AS "Email", o.phone AS "Phone", o.country AS "Country", o.delivery AS "Delivery", o.address AS "Address",
     (SELECT GROUP_CONCAT(qty || ' x ' || name, '; ') FROM order_items WHERE order_id=o.id) AS "Items", o.total AS "Total (USD)", o.status AS "Status", o.notes AS "Notes"
     FROM orders o ORDER BY o.created_at DESC`],
  ['Enquiries', `SELECT substr(created_at,1,16) AS "Received", dept AS "Department", type AS "Type", project AS "Project", name AS "Name", company AS "Company", email AS "Email", phone AS "Phone", country AS "Country",
     description AS "Description", budget AS "Budget", needed_by AS "Needed by", status AS "Status", note AS "Note" FROM enquiries ORDER BY created_at DESC`],
];
on('GET', '/export', async ({ env, req, url }) => {
  const key = req.headers.get('x-export-key') || url.searchParams.get('key') || '';
  if (!env.EXPORT_KEY || key.length < 20 || !safeEqual(key, env.EXPORT_KEY)) fail(403, 'Wrong export key.');
  const sheets = {};
  for (const [name, sql] of EXPORTS) {
    const r = await env.DB.prepare(sql).raw({ columnNames: true });
    const head = [...sql.matchAll(/ AS "([^"]+)"/g)].map((m) => m[1]);
    sheets[name] = r.length ? r : [head.filter((h, i, all) => all.indexOf(h) === i)];
  }
  return json({ updated: now(), sheets });
});

/* ---------------- entry ---------------- */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method.toUpperCase();
  try {
    if (!env.DB) fail(503, 'The database is not connected yet.');
    if (method !== 'GET' && method !== 'HEAD') {
      // Only same-site JSON requests may change data (blocks cross-site form posts).
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
      return await r.handler({ env, req: request, url, body, user, params: m.groups || {} });
    }
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  }
}
