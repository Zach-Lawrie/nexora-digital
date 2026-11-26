// MEA API — Cloudflare Pages Function. All routes live under /api/.
// Database: D1 bound as env.DB. Sessions: HttpOnly cookie "mea_s".

const STAFF_DOMAINS = ['@meazim.com', '@mea.co.zw'];
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
const publicUser = (u) => u && ({ id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role, dept: u.dept, must_change: !!u.must_change, company_id: u.company_id || null, company_manager: !!u.company_manager });

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
      ce.cert_no, ce.issued_at, i.name AS intake, i.venue, i.start_date FROM enrolments e JOIN courses c ON c.id = e.course_id LEFT JOIN users t ON t.id = c.teacher_id
      LEFT JOIN certificates ce ON ce.enrolment_id = e.id LEFT JOIN intakes i ON i.id = e.intake_id WHERE e.student_id = ? ORDER BY e.created_at DESC`, user.id);
  const results = await all(env.DB, `SELECT r.enrolment_id, r.assessment, r.score, r.max_score, r.created_at FROM results r JOIN enrolments e ON e.id = r.enrolment_id WHERE e.student_id = ? ORDER BY r.created_at`, user.id);
  return json({ enrolments, results });
});
on('POST', '/student/enrol', async ({ env, user, body }) => {
  need(user, 'student');
  const c = await one(env.DB, 'SELECT * FROM courses WHERE id = ? AND active = 1', parseInt(body.course_id, 10));
  if (!c) fail(404, 'That course is not open for enrolment.');
  const ex = await one(env.DB, 'SELECT * FROM enrolments WHERE student_id = ? AND course_id = ?', user.id, c.id);
  if (ex && !['withdrawn', 'rejected'].includes(ex.status)) fail(409, 'You have already applied for this course.');
  const intakeId = await checkIntake(env, body.intake_id, c.id);
  if (ex) await run(env.DB, `UPDATE enrolments SET status = 'pending', progress = 0, intake_id = ?, company_id = ?, updated_at = ? WHERE id = ?`, intakeId, user.company_id || null, now(), ex.id);
  else await run(env.DB, 'INSERT INTO enrolments (student_id, course_id, intake_id, company_id) VALUES (?,?,?,?)', user.id, c.id, intakeId, user.company_id || null);
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
  const enrolments = await all(env.DB, `SELECT e.id, e.status, e.progress, e.created_at, e.course_id, e.intake_id, i.name AS intake, i.venue, co.name AS company, c.code, s.name AS student, s.email, s.phone, ce.cert_no,
      (SELECT ROUND(AVG(r.score * 100.0 / r.max_score)) FROM results r WHERE r.enrolment_id = e.id) AS avg_pct
      FROM enrolments e JOIN courses c ON c.id = e.course_id JOIN users s ON s.id = e.student_id LEFT JOIN certificates ce ON ce.enrolment_id = e.id LEFT JOIN intakes i ON i.id = e.intake_id LEFT JOIN companies co ON co.id = e.company_id
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
  const fees = await c(`SELECT COALESCE(SUM(CASE WHEN status='unpaid' THEN amount END),0) AS owing, SUM(status='unpaid') AS unpaid, SUM(status='unpaid' AND due_date < ?) AS overdue, COALESCE(SUM(CASE WHEN status='paid' AND paid_at >= ? THEN amount END),0) AS month_paid FROM invoices`, now().slice(0, 10), monthStart);
  const school = await c(`SELECT (SELECT COUNT(*) FROM intakes WHERE active=1) AS intakes, (SELECT COUNT(*) FROM submissions WHERE marked_at IS NULL) AS to_mark, (SELECT COUNT(*) FROM companies) AS companies, (SELECT COUNT(*) FROM class_sessions WHERE starts_at BETWEEN ? AND ?) AS classes_week`, now(), new Date(Date.now() + 7 * 864e5).toISOString());
  const activity = await all(env.DB, 'SELECT who, action, detail, at FROM audit ORDER BY id DESC LIMIT 25');
  return json({ people, training, store, enquiries: enq, staffByDept, lowStock, activity, monthStart, fees, school });
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
  invoices: { title: 'Fees and invoices', money: 'Amount (USD)', paidStatuses: true,
    sql: `SELECT i.created_at AS "Date", i.number AS "Invoice", COALESCE(co.name, s.name) AS "Billed to", i.description AS "For", i.due_date AS "Due", i.status AS "Status", i.paid_at AS "Paid on", i.method AS "Method", i.amount AS "Amount (USD)" FROM invoices i LEFT JOIN users s ON s.id=i.student_id LEFT JOIN companies co ON co.id=i.company_id WHERE i.created_at BETWEEN ? AND ? ORDER BY i.created_at DESC` },
  attendance: { title: 'Attendance',
    sql: `SELECT cs.starts_at AS "Class", c.code AS "Course", it.name AS "Intake", it.venue AS "Venue", s.name AS "Student", a.status AS "Status" FROM attendance a JOIN class_sessions cs ON cs.id=a.session_id JOIN intakes it ON it.id=cs.intake_id JOIN courses c ON c.id=it.course_id JOIN enrolments e ON e.id=a.enrolment_id JOIN users s ON s.id=e.student_id WHERE cs.starts_at BETWEEN ? AND ? ORDER BY cs.starts_at DESC, s.name` },
  intakes: { title: 'Intakes and pass rates', undated: true,
    sql: `SELECT c.code AS "Course", it.name AS "Intake", it.venue AS "Venue", it.start_date AS "Starts", it.capacity AS "Capacity", (SELECT COUNT(*) FROM enrolments e WHERE e.intake_id=it.id AND e.status IN ('pending','active','completed')) AS "Students", (SELECT COUNT(*) FROM enrolments e WHERE e.intake_id=it.id AND e.status='completed') AS "Completed", (SELECT ROUND(AVG(r.score*100.0/r.max_score)) FROM results r JOIN enrolments e ON e.id=r.enrolment_id WHERE e.intake_id=it.id) AS "Average %" FROM intakes it JOIN courses c ON c.id=it.course_id ORDER BY it.start_date DESC` },
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
  if (r.money) summary.total = Math.round(rows.filter((x) => (r.paidStatuses ? x.Status === 'paid' : !['cancelled', 'awaiting_payment'].includes(x.Status))).reduce((s, x) => s + (x[r.money] || 0), 0) * 100) / 100;
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
  ['Invoices', `SELECT i.number AS "Invoice", substr(i.created_at,1,10) AS "Date", COALESCE(co.name, s.name) AS "Billed to", i.description AS "For", i.amount AS "Amount (USD)", i.due_date AS "Due", i.status AS "Status", substr(i.paid_at,1,10) AS "Paid on", i.method AS "Method", i.reference AS "Reference"
     FROM invoices i LEFT JOIN users s ON s.id=i.student_id LEFT JOIN companies co ON co.id=i.company_id ORDER BY i.created_at DESC`],
  ['Intakes', `SELECT c.code AS "Course", it.name AS "Intake", it.venue AS "Venue", it.start_date AS "Starts", it.end_date AS "Ends", it.capacity AS "Capacity", (SELECT COUNT(*) FROM enrolments e WHERE e.intake_id=it.id AND e.status IN ('pending','active','completed')) AS "Students" FROM intakes it JOIN courses c ON c.id=it.course_id ORDER BY it.start_date DESC`],
  ['Attendance', `SELECT substr(cs.starts_at,1,16) AS "Class", c.code AS "Course", it.name AS "Intake", s.name AS "Student", a.status AS "Status" FROM attendance a JOIN class_sessions cs ON cs.id=a.session_id JOIN intakes it ON it.id=cs.intake_id JOIN courses c ON c.id=it.course_id JOIN enrolments e ON e.id=a.enrolment_id JOIN users s ON s.id=e.student_id ORDER BY cs.starts_at DESC`],
  ['Companies', `SELECT co.name AS "Company", co.contact_name AS "Contact", co.email AS "Email", co.phone AS "Phone", (SELECT COUNT(*) FROM users u WHERE u.company_id=co.id) AS "People", (SELECT COALESCE(SUM(amount),0) FROM invoices i WHERE i.company_id=co.id AND i.status='unpaid') AS "Owing (USD)" FROM companies co ORDER BY co.name`],
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

/* ================= SCHOOL: intakes, lessons, assessments, timetable, fees, companies, lab, resources ================= */
const VENUES = ['Harare', 'Online'];
const LESSON_KINDS = ['video', 'reading', 'file', 'link'];
const ATT = ['present', 'late', 'absent', 'excused'];
const CHUNK = 1000000;            // bytes per stored chunk
const MAX_FILE = 15 * 1000000;    // 15 MB per file
const intOr = (v, d = null) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
const isoOk = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z?)?$/.test(s);
const toIso = (s) => { const d = new Date(s); return isNaN(d) ? null : d.toISOString().replace(/\.\d+Z$/, 'Z'); };
const isManager = (u) => u && u.role === 'student' && u.company_manager && u.company_id;

async function courseOf(env, id) {
  const c = await one(env.DB, 'SELECT * FROM courses WHERE id = ?', intOr(id, 0));
  if (!c) fail(404, 'Course not found.');
  return c;
}
async function teacherCourse(env, user, courseId) {
  need(user, 'teacher', 'admin');
  const c = await courseOf(env, courseId);
  if (user.role !== 'admin' && c.teacher_id !== user.id) fail(403, 'You do not teach this course.');
  return c;
}
// The enrolment a learner may open: the student's own (active or completed), or any for the course teacher / admin.
async function learnerEnrolment(env, user, enrolmentId, { write = false } = {}) {
  if (!user) fail(401, 'Please sign in.');
  if (user.must_change) fail(403, 'Change your temporary password first.');
  const e = await one(env.DB, `SELECT e.*, c.teacher_id, c.code, c.title, c.level, c.weeks, c.description AS course_description, s.name AS student, s.email AS student_email
    FROM enrolments e JOIN courses c ON c.id = e.course_id JOIN users s ON s.id = e.student_id WHERE e.id = ?`, intOr(enrolmentId, 0));
  if (!e) fail(404, 'Course not found.');
  const own = e.student_id === user.id;
  const staff = user.role === 'admin' || (user.role === 'teacher' && e.teacher_id === user.id);
  if (!own && !staff) fail(403, 'This course is not yours.');
  if (own && !['active', 'completed'].includes(e.status)) fail(403, e.status === 'pending' ? 'MEA has not confirmed your place yet. Your course opens when it does.' : 'This course is closed for you.');
  if (write && own && e.status !== 'active') fail(400, 'This course is finished. You can still read it.');
  return { e, own, staff };
}
async function recomputeProgress(env, e) {
  const t = await one(env.DB, 'SELECT COUNT(*) AS n FROM lessons WHERE course_id = ? AND published = 1', e.course_id);
  if (!t.n) return e.progress;
  const d = await one(env.DB, 'SELECT COUNT(*) AS n FROM lesson_done ld JOIN lessons l ON l.id = ld.lesson_id WHERE ld.enrolment_id = ? AND l.published = 1', e.id);
  const p = e.status === 'completed' ? 100 : Math.min(99, Math.round((d.n * 100) / t.n));
  await run(env.DB, 'UPDATE enrolments SET progress = ?, updated_at = ? WHERE id = ?', p, now(), e.id);
  return p;
}
const publicQuiz = (q, attempts) => {
  const qs = JSON.parse(q.questions || '[]');
  return { id: q.id, title: q.title, pass_pct: q.pass_pct, attempts: q.attempts, count: qs.length, used: attempts.length,
    best: attempts.reduce((b, a) => Math.max(b, Math.round((a.score * 100) / a.max_score)), -1),
    questions: qs.map((x) => ({ q: x.q, options: x.options })) };
};
async function nextInvoiceNo(env) {
  const y = new Date().getUTCFullYear();
  const n = (await one(env.DB, 'SELECT COUNT(*) AS n FROM invoices WHERE number LIKE ?', `INV-${y}-%`)).n + 1;
  return `INV-${y}-${String(n).padStart(4, '0')}`;
}

/* ---------- public ---------- */
on('GET', '/articles', async ({ env }) => {
  const rows = await all(env.DB, 'SELECT slug, title, cat, mins, sum, data, published, sort, updated_at FROM articles ORDER BY sort, updated_at DESC');
  return json({ articles: rows.map((r) => { let d = {}; try { d = JSON.parse(r.data || '{}'); } catch (e) {} return { id: r.slug, title: r.title, cat: r.cat, mins: r.mins, sum: r.sum, body: d.body || [], img: d.img || '', alt: d.alt || '', hidden: !r.published }; }) });
});
on('GET', '/verify/:no', async ({ env, params }) => {
  const c = await one(env.DB, `SELECT ce.cert_no, ce.issued_at, s.name AS student, c.code, c.title, i.venue FROM certificates ce JOIN enrolments e ON e.id = ce.enrolment_id
    JOIN users s ON s.id = e.student_id JOIN courses c ON c.id = e.course_id LEFT JOIN intakes i ON i.id = e.intake_id WHERE ce.cert_no = ?`, str(params.no, 40).toUpperCase());
  if (!c) fail(404, 'No MEA certificate has that number.');
  return json({ certificate: c });
});
on('GET', '/intakes', async ({ env, url }) => {
  const cid = intOr(url.searchParams.get('course_id'), 0);
  const rows = await all(env.DB, `SELECT i.id, i.course_id, i.name, i.venue, i.start_date, i.end_date, i.capacity, i.schedule,
    (SELECT COUNT(*) FROM enrolments e WHERE e.intake_id = i.id AND e.status IN ('pending','active')) AS taken
    FROM intakes i WHERE i.active = 1 AND (? = 0 OR i.course_id = ?) AND (i.end_date IS NULL OR i.end_date >= ?) ORDER BY i.start_date`, cid, cid, now().slice(0, 10));
  return json({ intakes: rows });
});

/* ---------- files (stored in the database in 1 MB chunks) ---------- */
on('POST', '/files/start', async ({ env, user, body }) => {
  need(user);
  const name = str(body.name, 160).replace(/[\\/]/g, '_') || 'file', mime = str(body.mime, 100) || 'application/octet-stream', size = intOr(body.size, 0);
  const purpose = ['lesson', 'submission', 'article'].includes(body.purpose) ? body.purpose : '';
  if (!purpose) fail(400, 'Unknown file purpose.');
  if (purpose !== 'submission' && !['teacher', 'admin'].includes(user.role)) fail(403, 'Only teachers and admin can upload course files.');
  if (!(size > 0)) fail(400, 'That file is empty.');
  if (size > MAX_FILE) fail(413, 'Files can be up to 15 MB. For videos, paste a YouTube (unlisted), Vimeo or Google Drive link instead.');
  const r = await run(env.DB, 'INSERT INTO files (name, mime, size, chunks, owner_id, purpose) VALUES (?,?,?,?,?,?)', name, mime, size, Math.ceil(size / CHUNK), user.id, purpose);
  return json({ id: r.meta.last_row_id, chunk: CHUNK }, 201);
});
on('POST', '/files/:id/chunk', async ({ env, user, params, url, raw }) => {
  need(user);
  const f = await one(env.DB, 'SELECT * FROM files WHERE id = ?', intOr(params.id, 0));
  if (!f || f.owner_id !== user.id) fail(404, 'Upload not found.');
  if (f.complete) fail(400, 'This upload is already finished.');
  const n = intOr(url.searchParams.get('n'), -1);
  if (!(n >= 0 && n < f.chunks)) fail(400, 'Wrong chunk number.');
  if (!raw || !raw.byteLength || raw.byteLength > CHUNK) fail(400, 'Each part must be 1 MB or less.');
  await run(env.DB, 'INSERT OR REPLACE INTO file_chunks (file_id, n, data) VALUES (?,?,?)', f.id, n, raw);
  return json({ ok: true });
});
on('POST', '/files/:id/finish', async ({ env, user, params }) => {
  need(user);
  const f = await one(env.DB, 'SELECT * FROM files WHERE id = ?', intOr(params.id, 0));
  if (!f || f.owner_id !== user.id) fail(404, 'Upload not found.');
  const c = await one(env.DB, 'SELECT COUNT(*) AS n, SUM(LENGTH(data)) AS bytes FROM file_chunks WHERE file_id = ?', f.id);
  if (c.n !== f.chunks || c.bytes !== f.size) fail(400, 'The upload is incomplete. Please try again.');
  await run(env.DB, 'UPDATE files SET complete = 1 WHERE id = ?', f.id);
  return json({ ok: true, file: { id: f.id, name: f.name, size: f.size, mime: f.mime } });
});
async function canReadFile(env, user, f) {
  if (f.purpose === 'article') return true;
  if (!user) return false;
  if (user.role === 'admin' || f.owner_id === user.id) return true;
  if (f.purpose === 'lesson') {
    const l = await one(env.DB, 'SELECT l.course_id, c.teacher_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.file_id = ? LIMIT 1', f.id);
    if (!l) return false;
    if (l.teacher_id === user.id) return true;
    return !!(await one(env.DB, `SELECT id FROM enrolments WHERE student_id = ? AND course_id = ? AND status IN ('active','completed')`, user.id, l.course_id));
  }
  if (f.purpose === 'submission') {
    const s = await one(env.DB, `SELECT c.teacher_id FROM submissions sb JOIN enrolments e ON e.id = sb.enrolment_id JOIN courses c ON c.id = e.course_id WHERE sb.file_id = ? LIMIT 1`, f.id);
    return !!(s && s.teacher_id === user.id);
  }
  return false;
}
on('GET', '/files/:id', async ({ env, user, params }) => {
  const f = await one(env.DB, 'SELECT * FROM files WHERE id = ? AND complete = 1', intOr(params.id, 0));
  if (!f || !(await canReadFile(env, user, f))) fail(404, 'File not found or not available to you.');
  let n = 0;
  const stream = new ReadableStream({
    async pull(ctl) {
      if (n >= f.chunks) return ctl.close();
      const c = await one(env.DB, 'SELECT data FROM file_chunks WHERE file_id = ? AND n = ?', f.id, n++);
      if (!c) return ctl.close();
      ctl.enqueue(new Uint8Array(c.data));
    },
  });
  const inline = /^(application\/pdf|image\/|text\/plain)/.test(f.mime);
  return new Response(stream, { headers: { 'content-type': f.mime, 'content-length': String(f.size), 'cache-control': f.purpose === 'article' ? 'public, max-age=86400' : 'private, no-store',
    'content-disposition': `${inline ? 'inline' : 'attachment'}; filename="${f.name.replace(/"/g, '')}"`, 'x-content-type-options': 'nosniff' } });
});

/* ---------- student: dashboard, course player, assessments ---------- */
on('GET', '/student/home', async ({ env, user }) => {
  need(user, 'student');
  const ens = await all(env.DB, `SELECT e.id, e.status, e.progress, e.course_id, e.intake_id, c.code, c.title, i.name AS intake, i.venue, i.start_date
    FROM enrolments e JOIN courses c ON c.id = e.course_id LEFT JOIN intakes i ON i.id = e.intake_id WHERE e.student_id = ? AND e.status IN ('pending','active','completed') ORDER BY e.created_at DESC`, user.id);
  const live = ens.filter((e) => e.status !== 'pending');
  const courseIds = live.map((e) => e.course_id), intakeIds = live.map((e) => e.intake_id).filter(Boolean), enIds = live.map((e) => e.id);
  const inList = (a) => (a.length ? a.map(Number).join(',') : '0');
  const notices = await all(env.DB, `SELECT n.id, n.title, n.body, n.created_at, c.code, u.name AS author FROM notices n LEFT JOIN courses c ON c.id = n.course_id LEFT JOIN users u ON u.id = n.created_by
    WHERE (n.course_id IS NULL AND n.intake_id IS NULL) OR n.course_id IN (${inList(courseIds)}) OR n.intake_id IN (${inList(intakeIds)}) ORDER BY n.created_at DESC LIMIT 10`);
  const sessions = await all(env.DB, `SELECT s.id, s.title, s.starts_at, s.ends_at, s.place, s.link, i.name AS intake, i.venue, c.code FROM class_sessions s JOIN intakes i ON i.id = s.intake_id JOIN courses c ON c.id = i.course_id
    WHERE s.intake_id IN (${inList(intakeIds)}) AND s.ends_at >= ? ORDER BY s.starts_at LIMIT 6`, now());
  const invoices = await all(env.DB, `SELECT number, description, amount, due_date, status FROM invoices WHERE student_id = ? AND status = 'unpaid' ORDER BY due_date`, user.id);
  const lab = await all(env.DB, `SELECT l.id, l.station, l.starts_at, l.ends_at, l.access FROM lab_slots l WHERE l.enrolment_id IN (${inList(enIds)}) AND l.ends_at >= ? ORDER BY l.starts_at`, now());
  const unread = await one(env.DB, `SELECT COUNT(*) AS n FROM messages m WHERE m.enrolment_id IN (${inList(enIds)}) AND m.from_id != ? AND m.read_at IS NULL`, user.id);
  const due = await all(env.DB, `SELECT a.id, a.title, a.due_date, c.code, e.id AS enrolment_id FROM assignments a JOIN enrolments e ON e.course_id = a.course_id JOIN courses c ON c.id = a.course_id
    LEFT JOIN submissions sb ON sb.assignment_id = a.id AND sb.enrolment_id = e.id WHERE e.id IN (${inList(enIds)}) AND e.status = 'active' AND a.published = 1 AND sb.id IS NULL ORDER BY a.due_date IS NULL, a.due_date LIMIT 8`);
  return json({ enrolments: ens, notices, sessions, invoices, lab, unread: unread.n, due, company: user.company_id ? await one(env.DB, 'SELECT id, name FROM companies WHERE id = ?', user.company_id) : null });
});

on('GET', '/learn/:id', async ({ env, user, params }) => {
  const { e, own } = await learnerEnrolment(env, user, params.id);
  const showAll = !own; // teachers previewing see unpublished items too
  const modules = await all(env.DB, 'SELECT id, title, sort FROM modules WHERE course_id = ? ORDER BY sort, id', e.course_id);
  const lessons = await all(env.DB, `SELECT l.id, l.module_id, l.title, l.kind, l.body, l.url, l.file_id, l.sort, l.published, f.name AS file_name, f.size AS file_size, f.mime AS file_mime
    FROM lessons l LEFT JOIN files f ON f.id = l.file_id WHERE l.course_id = ? ${showAll ? '' : 'AND l.published = 1'} ORDER BY l.sort, l.id`, e.course_id);
  const done = (await all(env.DB, 'SELECT lesson_id FROM lesson_done WHERE enrolment_id = ?', e.id)).map((r) => r.lesson_id);
  const assignments = await all(env.DB, `SELECT a.id, a.title, a.instructions, a.due_date, a.max_score, sb.id AS sub_id, sb.text AS sub_text, sb.submitted_at, sb.score, sb.feedback, sb.marked_at, f.id AS sub_file, f.name AS sub_file_name
    FROM assignments a LEFT JOIN submissions sb ON sb.assignment_id = a.id AND sb.enrolment_id = ? LEFT JOIN files f ON f.id = sb.file_id WHERE a.course_id = ? ${showAll ? '' : 'AND a.published = 1'} ORDER BY a.due_date IS NULL, a.due_date, a.id`, e.id, e.course_id);
  const quizRows = await all(env.DB, `SELECT * FROM quizzes WHERE course_id = ? ${showAll ? '' : 'AND published = 1'} ORDER BY id`, e.course_id);
  const attempts = await all(env.DB, 'SELECT quiz_id, score, max_score, created_at FROM quiz_attempts WHERE enrolment_id = ? ORDER BY created_at', e.id);
  const quizzes = quizRows.map((q) => publicQuiz(q, attempts.filter((a) => a.quiz_id === q.id)));
  const results = await all(env.DB, 'SELECT assessment, score, max_score, created_at FROM results WHERE enrolment_id = ? ORDER BY created_at', e.id);
  const kit = await all(env.DB, `SELECT p.id, p.sku, p.name, p.price, p.stock, k.qty, k.required FROM course_kit k JOIN products p ON p.id = k.product_id WHERE k.course_id = ? AND p.active = 1 ORDER BY k.required DESC, p.name`, e.course_id);
  const sessions = e.intake_id ? await all(env.DB, `SELECT s.id, s.title, s.starts_at, s.ends_at, s.place, s.link, a.status AS attendance FROM class_sessions s LEFT JOIN attendance a ON a.session_id = s.id AND a.enrolment_id = ? WHERE s.intake_id = ? ORDER BY s.starts_at`, e.id, e.intake_id) : [];
  const intake = e.intake_id ? await one(env.DB, 'SELECT id, name, venue, start_date, end_date, schedule FROM intakes WHERE id = ?', e.intake_id) : null;
  const cert = await one(env.DB, 'SELECT cert_no, issued_at FROM certificates WHERE enrolment_id = ?', e.id);
  const teacher = e.teacher_id ? await one(env.DB, 'SELECT name, email FROM users WHERE id = ?', e.teacher_id) : null;
  return json({ enrolment: { id: e.id, status: e.status, progress: e.progress, code: e.code, title: e.title, level: e.level, weeks: e.weeks, description: e.course_description, student: e.student, course_id: e.course_id },
    intake, teacher, modules, lessons, done, assignments, quizzes, results, kit, sessions, certificate: cert });
});
on('POST', '/learn/:id/done', async ({ env, user, params, body }) => {
  const { e, own } = await learnerEnrolment(env, user, params.id, { write: true });
  if (!own) fail(403, 'Only the student can tick off lessons.');
  const l = await one(env.DB, 'SELECT id FROM lessons WHERE id = ? AND course_id = ? AND published = 1', intOr(body.lesson_id, 0), e.course_id);
  if (!l) fail(404, 'Lesson not found.');
  if (body.done) await run(env.DB, 'INSERT OR IGNORE INTO lesson_done (enrolment_id, lesson_id) VALUES (?,?)', e.id, l.id);
  else await run(env.DB, 'DELETE FROM lesson_done WHERE enrolment_id = ? AND lesson_id = ?', e.id, l.id);
  return json({ ok: true, progress: await recomputeProgress(env, e) });
});
on('POST', '/learn/:id/submit', async ({ env, user, params, body }) => {
  const { e, own } = await learnerEnrolment(env, user, params.id, { write: true });
  if (!own) fail(403, 'Only the student can hand in work.');
  const a = await one(env.DB, 'SELECT * FROM assignments WHERE id = ? AND course_id = ? AND published = 1', intOr(body.assignment_id, 0), e.course_id);
  if (!a) fail(404, 'Assignment not found.');
  const text = str(body.text, 8000), fileId = intOr(body.file_id, null);
  if (!text && !fileId) fail(400, 'Write an answer or attach a file.');
  if (fileId && !(await one(env.DB, `SELECT id FROM files WHERE id = ? AND owner_id = ? AND purpose = 'submission' AND complete = 1`, fileId, user.id))) fail(400, 'Attach the file again.');
  const ex = await one(env.DB, 'SELECT * FROM submissions WHERE assignment_id = ? AND enrolment_id = ?', a.id, e.id);
  if (ex && ex.marked_at) fail(400, 'This work has been marked. Ask your teacher if you need to resubmit.');
  if (ex) await run(env.DB, 'UPDATE submissions SET text = ?, file_id = ?, submitted_at = ? WHERE id = ?', text, fileId || ex.file_id, now(), ex.id);
  else await run(env.DB, 'INSERT INTO submissions (assignment_id, enrolment_id, text, file_id) VALUES (?,?,?,?)', a.id, e.id, text, fileId);
  await audit(env, user, 'assignment submitted', `${e.code} ${a.title}`);
  return json({ ok: true }, 201);
});
on('POST', '/learn/:id/quiz', async ({ env, user, params, body }) => {
  const { e, own } = await learnerEnrolment(env, user, params.id, { write: true });
  if (!own) fail(403, 'Only the student can take the test.');
  const q = await one(env.DB, 'SELECT * FROM quizzes WHERE id = ? AND course_id = ? AND published = 1', intOr(body.quiz_id, 0), e.course_id);
  if (!q) fail(404, 'Test not found.');
  const used = (await one(env.DB, 'SELECT COUNT(*) AS n FROM quiz_attempts WHERE quiz_id = ? AND enrolment_id = ?', q.id, e.id)).n;
  if (used >= q.attempts) fail(400, 'You have used all your attempts for this test.');
  const qs = JSON.parse(q.questions || '[]');
  if (!qs.length) fail(400, 'This test has no questions yet.');
  const ans = Array.isArray(body.answers) ? body.answers.slice(0, qs.length).map((x) => intOr(x, -1)) : [];
  const score = qs.reduce((s, x, i) => s + (ans[i] === x.answer ? 1 : 0), 0);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO quiz_attempts (quiz_id, enrolment_id, answers, score, max_score) VALUES (?,?,?,?,?)').bind(q.id, e.id, JSON.stringify(ans), score, qs.length),
    env.DB.prepare('INSERT INTO results (enrolment_id, assessment, score, max_score, recorded_by) VALUES (?,?,?,?,NULL)').bind(e.id, `Test: ${q.title}${used ? ` (attempt ${used + 1})` : ''}`, score, qs.length),
  ]);
  const pct = Math.round((score * 100) / qs.length);
  await audit(env, user, 'test taken', `${e.code} ${q.title} ${score}/${qs.length}`);
  return json({ score, max: qs.length, pct, passed: pct >= q.pass_pct, left: q.attempts - used - 1, review: qs.map((x, i) => ({ correct: x.answer, chosen: ans[i] })) });
});

/* ---------- messages (one thread per student per course) ---------- */
on('GET', '/messages/:id', async ({ env, user, params }) => {
  const { e } = await learnerEnrolment(env, user, params.id);
  await run(env.DB, 'UPDATE messages SET read_at = ? WHERE enrolment_id = ? AND from_id != ? AND read_at IS NULL', now(), e.id, user.id);
  const rows = await all(env.DB, 'SELECT m.id, m.body, m.created_at, m.from_id, u.name, u.role FROM messages m JOIN users u ON u.id = m.from_id WHERE m.enrolment_id = ? ORDER BY m.created_at', e.id);
  return json({ thread: { enrolment_id: e.id, code: e.code, title: e.title, student: e.student }, messages: rows });
});
on('POST', '/messages/:id', async ({ env, user, params, body }) => {
  const { e } = await learnerEnrolment(env, user, params.id);
  const text = str(body.body, 3000);
  if (!text) fail(400, 'Write a message.');
  await run(env.DB, 'INSERT INTO messages (enrolment_id, from_id, body) VALUES (?,?,?)', e.id, user.id, text);
  return json({ ok: true }, 201);
});
on('GET', '/inbox', async ({ env, user }) => {
  need(user);
  const where = user.role === 'student' ? 'e.student_id = ' + Number(user.id) : user.role === 'admin' ? '1=1' : user.role === 'teacher' ? 'c.teacher_id = ' + Number(user.id) : '0';
  const rows = await all(env.DB, `SELECT e.id AS enrolment_id, c.code, c.title, s.name AS student,
      (SELECT body FROM messages m WHERE m.enrolment_id = e.id ORDER BY m.created_at DESC LIMIT 1) AS last,
      (SELECT created_at FROM messages m WHERE m.enrolment_id = e.id ORDER BY m.created_at DESC LIMIT 1) AS last_at,
      (SELECT COUNT(*) FROM messages m WHERE m.enrolment_id = e.id AND m.from_id != ? AND m.read_at IS NULL) AS unread
    FROM enrolments e JOIN courses c ON c.id = e.course_id JOIN users s ON s.id = e.student_id
    WHERE ${where} AND e.status IN ('active','completed') ORDER BY last_at IS NULL, last_at DESC, c.code LIMIT 300`, user.id);
  return json({ threads: user.role === 'student' ? rows : rows.filter((r) => r.last) , all: rows });
});

/* ---------- timetable and lab ---------- */
on('GET', '/timetable', async ({ env, user, url }) => {
  need(user);
  const from = toIso(url.searchParams.get('from') || new Date(Date.now() - 7 * 864e5).toISOString());
  let where;
  if (user.role === 'student') where = `s.intake_id IN (SELECT intake_id FROM enrolments WHERE student_id = ${Number(user.id)} AND status IN ('active','completed') AND intake_id IS NOT NULL)`;
  else if (user.role === 'teacher') where = `c.teacher_id = ${Number(user.id)}`;
  else if (user.role === 'admin') where = '1=1';
  else fail(403, 'Your account has no timetable.');
  const rows = await all(env.DB, `SELECT s.id, s.title, s.starts_at, s.ends_at, s.place, s.link, s.intake_id, i.name AS intake, i.venue, c.code, c.title AS course
    ${user.role === 'student' ? `, (SELECT a.status FROM attendance a JOIN enrolments e ON e.id = a.enrolment_id WHERE a.session_id = s.id AND e.student_id = ${Number(user.id)}) AS attendance` : ', (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.id) AS marked'}
    FROM class_sessions s JOIN intakes i ON i.id = s.intake_id JOIN courses c ON c.id = i.course_id WHERE ${where} AND s.ends_at >= ? ORDER BY s.starts_at LIMIT 300`, from);
  return json({ sessions: rows });
});
on('GET', '/lab', async ({ env, user }) => {
  need(user);
  if (user.role === 'student') {
    const ens = await all(env.DB, `SELECT e.id, e.course_id, c.code FROM enrolments e JOIN courses c ON c.id = e.course_id WHERE e.student_id = ? AND e.status = 'active'`, user.id);
    const ids = ens.map((e) => e.id), cids = ens.map((e) => e.course_id);
    const list = (a) => (a.length ? a.map(Number).join(',') : '0');
    const slots = await all(env.DB, `SELECT l.id, l.station, l.starts_at, l.ends_at, l.course_id, c.code, l.enrolment_id, CASE WHEN l.enrolment_id IN (${list(ids)}) THEN l.access END AS access
      FROM lab_slots l LEFT JOIN courses c ON c.id = l.course_id WHERE l.ends_at >= ? AND (l.course_id IS NULL OR l.course_id IN (${list(cids)}))
      AND (l.enrolment_id IS NULL OR l.enrolment_id IN (${list(ids)})) ORDER BY l.starts_at LIMIT 200`, now());
    return json({ slots: slots.map((s) => ({ ...s, mine: ids.includes(s.enrolment_id), enrolment_id: undefined })), enrolments: ens });
  }
  need(user, 'teacher', 'admin');
  const slots = await all(env.DB, `SELECT l.*, c.code, s.name AS student FROM lab_slots l LEFT JOIN courses c ON c.id = l.course_id LEFT JOIN enrolments e ON e.id = l.enrolment_id LEFT JOIN users s ON s.id = e.student_id
    WHERE l.ends_at >= ? ${user.role === 'admin' ? '' : 'AND (l.created_by = ' + Number(user.id) + ' OR c.teacher_id = ' + Number(user.id) + ')'} ORDER BY l.starts_at LIMIT 300`, new Date(Date.now() - 864e5).toISOString());
  return json({ slots });
});
on('POST', '/lab/:id/book', async ({ env, user, params, body }) => {
  need(user, 'student');
  const l = await one(env.DB, 'SELECT * FROM lab_slots WHERE id = ?', intOr(params.id, 0));
  if (!l || l.ends_at < now()) fail(404, 'That lab slot is no longer available.');
  if (l.enrolment_id) fail(409, 'Someone has just booked that slot. Pick another.');
  const e = await one(env.DB, `SELECT * FROM enrolments WHERE id = ? AND student_id = ? AND status = 'active'`, intOr(body.enrolment_id, 0), user.id);
  if (!e) fail(400, 'Choose which of your courses this lab time is for.');
  if (l.course_id && l.course_id !== e.course_id) fail(400, 'This slot is reserved for another course.');
  const mine = (await one(env.DB, `SELECT COUNT(*) AS n FROM lab_slots WHERE enrolment_id IN (SELECT id FROM enrolments WHERE student_id = ?) AND starts_at >= ?`, user.id, now())).n;
  if (mine >= 3) fail(400, 'You can hold up to 3 future lab bookings. Cancel one to book another.');
  const r = await run(env.DB, 'UPDATE lab_slots SET enrolment_id = ? WHERE id = ? AND enrolment_id IS NULL', e.id, l.id);
  if (!r.meta.changes) fail(409, 'Someone has just booked that slot. Pick another.');
  await audit(env, user, 'lab booked', `${l.station} ${l.starts_at}`);
  return json({ ok: true });
});
on('POST', '/lab/:id/cancel', async ({ env, user, params }) => {
  need(user);
  const l = await one(env.DB, `SELECT l.*, e.student_id, c.teacher_id FROM lab_slots l LEFT JOIN enrolments e ON e.id = l.enrolment_id LEFT JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, intOr(params.id, 0));
  if (!l || !l.enrolment_id) fail(404, 'Booking not found.');
  if (!(l.student_id === user.id || user.role === 'admin' || l.created_by === user.id || l.teacher_id === user.id)) fail(403, 'This booking is not yours.');
  await run(env.DB, 'UPDATE lab_slots SET enrolment_id = NULL WHERE id = ?', l.id);
  return json({ ok: true });
});
on('POST', '/lab/slot', async ({ env, user, body }) => {
  need(user, 'teacher', 'admin');
  const id = intOr(body.id, 0);
  if (id) {
    const ex = await one(env.DB, 'SELECT * FROM lab_slots WHERE id = ?', id);
    if (!ex) fail(404, 'Slot not found.');
    if (user.role !== 'admin' && ex.created_by !== user.id) fail(403, 'Only the teacher who created this slot can change it.');
    if (body.delete) { await run(env.DB, 'DELETE FROM lab_slots WHERE id = ?', id); return json({ ok: true }); }
    await run(env.DB, 'UPDATE lab_slots SET access = ? WHERE id = ?', str(body.access, 500), id);
    return json({ ok: true });
  }
  const station = str(body.station, 60), start = toIso(body.starts_at), mins = intOr(body.minutes, 60), count = Math.min(40, Math.max(1, intOr(body.repeat, 1)));
  if (!station || !start) fail(400, 'Enter the station name and a start time.');
  if (!(mins >= 15 && mins <= 480)) fail(400, 'Slots can be 15 minutes to 8 hours long.');
  const courseId = intOr(body.course_id, null);
  if (courseId) await teacherCourse(env, user, courseId);
  const stmts = [];
  for (let i = 0; i < count; i++) {
    const s = new Date(new Date(start).getTime() + i * mins * 60e3);
    stmts.push(env.DB.prepare('INSERT INTO lab_slots (station, starts_at, ends_at, course_id, access, created_by) VALUES (?,?,?,?,?,?)')
      .bind(station, toIso(s), toIso(new Date(s.getTime() + mins * 60e3)), courseId, str(body.access, 500), user.id));
  }
  await env.DB.batch(stmts);
  await audit(env, user, 'lab slots added', `${station} × ${count}`);
  return json({ ok: true, added: count }, 201);
});

/* ---------- teacher: course builder ---------- */
on('GET', '/teach/content/:id', async ({ env, user, params }) => {
  const c = await teacherCourse(env, user, params.id);
  const [modules, lessons, assignments, quizzes, kit, intakes, products] = await Promise.all([
    all(env.DB, 'SELECT * FROM modules WHERE course_id = ? ORDER BY sort, id', c.id),
    all(env.DB, 'SELECT l.*, f.name AS file_name, f.size AS file_size FROM lessons l LEFT JOIN files f ON f.id = l.file_id WHERE l.course_id = ? ORDER BY l.sort, l.id', c.id),
    all(env.DB, `SELECT a.*, (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) AS handed_in, (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id AND s.marked_at IS NULL) AS to_mark FROM assignments a WHERE a.course_id = ? ORDER BY a.id`, c.id),
    all(env.DB, `SELECT q.*, (SELECT COUNT(*) FROM quiz_attempts t WHERE t.quiz_id = q.id) AS taken FROM quizzes q WHERE q.course_id = ? ORDER BY q.id`, c.id),
    all(env.DB, 'SELECT k.*, p.sku, p.name, p.price, p.stock FROM course_kit k JOIN products p ON p.id = k.product_id WHERE k.course_id = ?', c.id),
    all(env.DB, `SELECT i.*, (SELECT COUNT(*) FROM enrolments e WHERE e.intake_id = i.id AND e.status IN ('pending','active')) AS taken FROM intakes i WHERE i.course_id = ? ORDER BY i.start_date DESC`, c.id),
    all(env.DB, 'SELECT id, sku, name, price FROM products WHERE active = 1 ORDER BY name'),
  ]);
  return json({ course: c, modules, lessons, assignments, quizzes: quizzes.map((q) => ({ ...q, questions: JSON.parse(q.questions || '[]') })), kit, intakes, products });
});
on('POST', '/teach/module', async ({ env, user, body }) => {
  const c = await teacherCourse(env, user, body.course_id);
  const id = intOr(body.id, 0);
  if (id && body.delete) { await run(env.DB, 'DELETE FROM modules WHERE id = ? AND course_id = ?', id, c.id); return json({ ok: true }); }
  const title = str(body.title, 140); if (!title) fail(400, 'Name the module.');
  if (id) await run(env.DB, 'UPDATE modules SET title = ?, sort = ? WHERE id = ? AND course_id = ?', title, intOr(body.sort, 0), id, c.id);
  else await run(env.DB, 'INSERT INTO modules (course_id, title, sort) VALUES (?,?,?)', c.id, title, intOr(body.sort, 0));
  return json({ ok: true });
});
on('POST', '/teach/lesson', async ({ env, user, body }) => {
  const c = await teacherCourse(env, user, body.course_id);
  const id = intOr(body.id, 0);
  if (id && body.delete) { await run(env.DB, 'DELETE FROM lessons WHERE id = ? AND course_id = ?', id, c.id); return json({ ok: true }); }
  const l = { title: str(body.title, 160), kind: LESSON_KINDS.includes(body.kind) ? body.kind : 'reading', body: str(body.body, 20000), url: str(body.url, 600), file_id: intOr(body.file_id, null), module_id: intOr(body.module_id, null), sort: intOr(body.sort, 0), published: body.published ? 1 : 0 };
  if (!l.title) fail(400, 'Give the lesson a title.');
  if ((l.kind === 'video' || l.kind === 'link') && !/^https:\/\//.test(l.url)) fail(400, 'Paste a link that starts with https:// (YouTube unlisted, Vimeo or Google Drive).');
  if (l.kind === 'file' && !l.file_id) fail(400, 'Upload the file for this lesson.');
  if (l.file_id && !(await one(env.DB, `SELECT id FROM files WHERE id = ? AND purpose = 'lesson' AND complete = 1`, l.file_id))) fail(400, 'Upload the file again.');
  if (l.module_id && !(await one(env.DB, 'SELECT id FROM modules WHERE id = ? AND course_id = ?', l.module_id, c.id))) l.module_id = null;
  if (id) await run(env.DB, 'UPDATE lessons SET title=?, kind=?, body=?, url=?, file_id=?, module_id=?, sort=?, published=? WHERE id=? AND course_id=?', l.title, l.kind, l.body, l.url, l.file_id, l.module_id, l.sort, l.published, id, c.id);
  else await run(env.DB, 'INSERT INTO lessons (course_id, module_id, title, kind, body, url, file_id, sort, published) VALUES (?,?,?,?,?,?,?,?,?)', c.id, l.module_id, l.title, l.kind, l.body, l.url, l.file_id, l.sort, l.published);
  await audit(env, user, id ? 'lesson updated' : 'lesson added', `${c.code} ${l.title}`);
  return json({ ok: true });
});
on('POST', '/teach/assignment', async ({ env, user, body }) => {
  const c = await teacherCourse(env, user, body.course_id);
  const id = intOr(body.id, 0);
  if (id && body.delete) { await run(env.DB, 'DELETE FROM assignments WHERE id = ? AND course_id = ?', id, c.id); return json({ ok: true }); }
  const a = { title: str(body.title, 160), instructions: str(body.instructions, 8000), due_date: isoOk(body.due_date) ? body.due_date : null, max_score: num(body.max_score) > 0 ? num(body.max_score) : 100, published: body.published ? 1 : 0 };
  if (!a.title) fail(400, 'Give the assignment a title.');
  if (id) await run(env.DB, 'UPDATE assignments SET title=?, instructions=?, due_date=?, max_score=?, published=? WHERE id=? AND course_id=?', a.title, a.instructions, a.due_date, a.max_score, a.published, id, c.id);
  else await run(env.DB, 'INSERT INTO assignments (course_id, title, instructions, due_date, max_score, published) VALUES (?,?,?,?,?,?)', c.id, a.title, a.instructions, a.due_date, a.max_score, a.published);
  return json({ ok: true });
});
on('POST', '/teach/quiz', async ({ env, user, body }) => {
  const c = await teacherCourse(env, user, body.course_id);
  const id = intOr(body.id, 0);
  if (id && body.delete) { await run(env.DB, 'DELETE FROM quizzes WHERE id = ? AND course_id = ?', id, c.id); return json({ ok: true }); }
  const title = str(body.title, 160); if (!title) fail(400, 'Give the test a title.');
  const qs = (Array.isArray(body.questions) ? body.questions : []).slice(0, 60).map((x) => ({ q: str(x.q, 600), options: (Array.isArray(x.options) ? x.options : []).map((o) => str(o, 300)).filter(Boolean).slice(0, 6), answer: intOr(x.answer, 0) }))
    .filter((x) => x.q && x.options.length >= 2);
  qs.forEach((x, i) => { if (x.answer < 0 || x.answer >= x.options.length) fail(400, `Question ${i + 1}: choose which option is correct.`); });
  const pass = Math.min(100, Math.max(1, intOr(body.pass_pct, 60))), attempts = Math.min(10, Math.max(1, intOr(body.attempts, 2)));
  if (id) await run(env.DB, 'UPDATE quizzes SET title=?, pass_pct=?, attempts=?, questions=?, published=? WHERE id=? AND course_id=?', title, pass, attempts, JSON.stringify(qs), body.published ? 1 : 0, id, c.id);
  else await run(env.DB, 'INSERT INTO quizzes (course_id, title, pass_pct, attempts, questions, published) VALUES (?,?,?,?,?,?)', c.id, title, pass, attempts, JSON.stringify(qs), body.published ? 1 : 0);
  return json({ ok: true, questions: qs.length });
});
on('POST', '/teach/kit', async ({ env, user, body }) => {
  const c = await teacherCourse(env, user, body.course_id);
  const pid = intOr(body.product_id, 0);
  if (body.remove) { await run(env.DB, 'DELETE FROM course_kit WHERE course_id = ? AND product_id = ?', c.id, pid); return json({ ok: true }); }
  if (!(await one(env.DB, 'SELECT id FROM products WHERE id = ?', pid))) fail(400, 'Pick a product from the store.');
  await run(env.DB, 'INSERT OR REPLACE INTO course_kit (course_id, product_id, qty, required) VALUES (?,?,?,?)', c.id, pid, Math.max(1, intOr(body.qty, 1)), body.required ? 1 : 0);
  return json({ ok: true });
});
on('GET', '/teach/marking', async ({ env, user }) => {
  need(user, 'teacher', 'admin');
  const mine = user.role === 'admin' ? '1=1' : 'c.teacher_id = ' + Number(user.id);
  const rows = await all(env.DB, `SELECT sb.id, sb.text, sb.submitted_at, sb.score, sb.feedback, sb.marked_at, sb.file_id, f.name AS file_name, a.title, a.max_score, a.due_date, c.code, s.name AS student, e.id AS enrolment_id
    FROM submissions sb JOIN assignments a ON a.id = sb.assignment_id JOIN enrolments e ON e.id = sb.enrolment_id JOIN courses c ON c.id = e.course_id JOIN users s ON s.id = e.student_id LEFT JOIN files f ON f.id = sb.file_id
    WHERE ${mine} ORDER BY sb.marked_at IS NOT NULL, sb.submitted_at DESC LIMIT 300`);
  return json({ submissions: rows });
});
on('POST', '/teach/submission/:id', async ({ env, user, params, body }) => {
  need(user, 'teacher', 'admin');
  const sb = await one(env.DB, `SELECT sb.*, a.title, a.max_score, c.teacher_id, c.code, s.name AS student FROM submissions sb JOIN assignments a ON a.id = sb.assignment_id JOIN enrolments e ON e.id = sb.enrolment_id
    JOIN courses c ON c.id = e.course_id JOIN users s ON s.id = e.student_id WHERE sb.id = ?`, intOr(params.id, 0));
  if (!sb) fail(404, 'Submission not found.');
  if (user.role !== 'admin' && sb.teacher_id !== user.id) fail(403, 'This student is not in one of your courses.');
  if (body.reopen) { await run(env.DB, 'UPDATE submissions SET marked_at = NULL WHERE id = ?', sb.id); return json({ ok: true }); }
  const score = num(body.score);
  if (!(score >= 0 && score <= sb.max_score)) fail(400, `Score must be between 0 and ${sb.max_score}.`);
  const stmts = [env.DB.prepare('UPDATE submissions SET score=?, feedback=?, marked_by=?, marked_at=? WHERE id=?').bind(score, str(body.feedback, 4000), user.id, now(), sb.id)];
  if (!sb.marked_at) stmts.push(env.DB.prepare('INSERT INTO results (enrolment_id, assessment, score, max_score, recorded_by) VALUES (?,?,?,?,?)').bind(sb.enrolment_id, 'Assignment: ' + sb.title, score, sb.max_score, user.id));
  else stmts.push(env.DB.prepare('UPDATE results SET score = ? WHERE enrolment_id = ? AND assessment = ?').bind(score, sb.enrolment_id, 'Assignment: ' + sb.title));
  await env.DB.batch(stmts);
  await audit(env, user, 'assignment marked', `${sb.student} ${sb.code} ${sb.title} ${score}/${sb.max_score}`);
  return json({ ok: true });
});

/* ---------- intakes, class sessions, attendance ---------- */
on('POST', '/intake', async ({ env, user, body }) => {
  const c = await teacherCourse(env, user, body.course_id);
  const id = intOr(body.id, 0);
  const i = { name: str(body.name, 100), venue: VENUES.includes(body.venue) ? body.venue : '', start_date: isoOk(body.start_date) ? body.start_date.slice(0, 10) : null, end_date: isoOk(body.end_date) ? body.end_date.slice(0, 10) : null, capacity: intOr(body.capacity, null), schedule: str(body.schedule, 300), active: body.active ? 1 : 0 };
  if (!i.name) fail(400, 'Name the intake, for example "Feb 2027 evening class".');
  if (!i.venue) fail(400, 'Choose Harare or Online.');
  if (i.start_date && i.end_date && i.end_date < i.start_date) fail(400, 'The end date is before the start date.');
  if (id) {
    const ex = await one(env.DB, 'SELECT id FROM intakes WHERE id = ? AND course_id = ?', id, c.id); if (!ex) fail(404, 'Intake not found.');
    await run(env.DB, 'UPDATE intakes SET name=?, venue=?, start_date=?, end_date=?, capacity=?, schedule=?, active=? WHERE id=?', i.name, i.venue, i.start_date, i.end_date, i.capacity, i.schedule, i.active, id);
  } else await run(env.DB, 'INSERT INTO intakes (course_id, name, venue, start_date, end_date, capacity, schedule, active) VALUES (?,?,?,?,?,?,?,?)', c.id, i.name, i.venue, i.start_date, i.end_date, i.capacity, i.schedule, i.active);
  await audit(env, user, id ? 'intake updated' : 'intake added', `${c.code} ${i.name} (${i.venue})`);
  return json({ ok: true });
});
on('POST', '/session', async ({ env, user, body }) => {
  need(user, 'teacher', 'admin');
  const id = intOr(body.id, 0);
  if (id) {
    const s = await one(env.DB, 'SELECT s.*, i.course_id FROM class_sessions s JOIN intakes i ON i.id = s.intake_id WHERE s.id = ?', id);
    if (!s) fail(404, 'Class not found.');
    await teacherCourse(env, user, s.course_id);
    if (body.delete) { await run(env.DB, 'DELETE FROM class_sessions WHERE id = ?', id); return json({ ok: true }); }
  }
  const intake = await one(env.DB, 'SELECT * FROM intakes WHERE id = ?', intOr(body.intake_id, 0));
  if (!intake) fail(400, 'Choose the intake this class is for.');
  await teacherCourse(env, user, intake.course_id);
  const title = str(body.title, 140) || 'Class', start = toIso(body.starts_at), mins = intOr(body.minutes, 120), weeks = Math.min(30, Math.max(1, intOr(body.weeks, 1)));
  if (!start) fail(400, 'Choose the date and start time.');
  if (!(mins >= 15 && mins <= 600)) fail(400, 'Classes can be 15 minutes to 10 hours long.');
  const place = str(body.place, 200) || (intake.venue === 'Harare' ? 'MEA training room, Bloomingdale, Harare' : 'Online'), link = str(body.link, 500);
  if (id) {
    await run(env.DB, 'UPDATE class_sessions SET title=?, starts_at=?, ends_at=?, place=?, link=?, intake_id=? WHERE id=?', title, start, toIso(new Date(new Date(start).getTime() + mins * 60e3)), place, link, intake.id, id);
    return json({ ok: true });
  }
  const stmts = [];
  for (let w = 0; w < weeks; w++) {
    const s = new Date(new Date(start).getTime() + w * 7 * 864e5);
    stmts.push(env.DB.prepare('INSERT INTO class_sessions (intake_id, title, starts_at, ends_at, place, link) VALUES (?,?,?,?,?,?)').bind(intake.id, weeks > 1 ? `${title} · week ${w + 1}` : title, toIso(s), toIso(new Date(s.getTime() + mins * 60e3)), place, link));
  }
  await env.DB.batch(stmts);
  await audit(env, user, 'classes scheduled', `${intake.name} × ${weeks}`);
  return json({ ok: true, added: weeks }, 201);
});
on('GET', '/session/:id/roll', async ({ env, user, params }) => {
  const s = await one(env.DB, 'SELECT s.*, i.course_id, i.name AS intake FROM class_sessions s JOIN intakes i ON i.id = s.intake_id WHERE s.id = ?', intOr(params.id, 0));
  if (!s) fail(404, 'Class not found.');
  await teacherCourse(env, user, s.course_id);
  const roll = await all(env.DB, `SELECT e.id AS enrolment_id, u.name, u.email, a.status FROM enrolments e JOIN users u ON u.id = e.student_id LEFT JOIN attendance a ON a.session_id = ? AND a.enrolment_id = e.id
    WHERE e.intake_id = ? AND e.status IN ('active','completed') ORDER BY u.name`, s.id, s.intake_id);
  return json({ session: s, roll });
});
on('POST', '/session/:id/roll', async ({ env, user, params, body }) => {
  const s = await one(env.DB, 'SELECT s.*, i.course_id FROM class_sessions s JOIN intakes i ON i.id = s.intake_id WHERE s.id = ?', intOr(params.id, 0));
  if (!s) fail(404, 'Class not found.');
  await teacherCourse(env, user, s.course_id);
  const marks = (Array.isArray(body.marks) ? body.marks : []).filter((m) => ATT.includes(m.status));
  const valid = new Set((await all(env.DB, 'SELECT id FROM enrolments WHERE intake_id = ?', s.intake_id)).map((r) => r.id));
  const stmts = marks.filter((m) => valid.has(intOr(m.enrolment_id, 0))).map((m) => env.DB.prepare('INSERT OR REPLACE INTO attendance (session_id, enrolment_id, status, marked_by) VALUES (?,?,?,?)').bind(s.id, intOr(m.enrolment_id, 0), m.status, user.id));
  if (stmts.length) await env.DB.batch(stmts);
  await audit(env, user, 'attendance marked', `${s.title} (${stmts.length})`);
  return json({ ok: true, saved: stmts.length });
});

/* ---------- notices ---------- */
on('GET', '/notices', async ({ env, user }) => {
  need(user, 'teacher', 'admin');
  const rows = await all(env.DB, `SELECT n.*, c.code, i.name AS intake, u.name AS author FROM notices n LEFT JOIN courses c ON c.id = n.course_id LEFT JOIN intakes i ON i.id = n.intake_id LEFT JOIN users u ON u.id = n.created_by
    ${user.role === 'admin' ? '' : 'WHERE n.created_by = ' + Number(user.id) + ' OR c.teacher_id = ' + Number(user.id)} ORDER BY n.created_at DESC LIMIT 100`);
  return json({ notices: rows });
});
on('POST', '/notices', async ({ env, user, body }) => {
  need(user, 'teacher', 'admin');
  const id = intOr(body.id, 0);
  if (id && body.delete) {
    const n = await one(env.DB, 'SELECT * FROM notices WHERE id = ?', id);
    if (!n) fail(404, 'Notice not found.');
    if (user.role !== 'admin' && n.created_by !== user.id) fail(403, 'Only the author can remove this notice.');
    await run(env.DB, 'DELETE FROM notices WHERE id = ?', id); return json({ ok: true });
  }
  const title = str(body.title, 140), text = str(body.body, 4000);
  if (!title || !text) fail(400, 'Add a title and the message.');
  let courseId = intOr(body.course_id, null), intakeId = intOr(body.intake_id, null);
  if (intakeId) { const i = await one(env.DB, 'SELECT * FROM intakes WHERE id = ?', intakeId); if (!i) fail(400, 'Intake not found.'); courseId = i.course_id; }
  if (courseId) await teacherCourse(env, user, courseId);
  else if (user.role !== 'admin') fail(403, 'Only admin can send a notice to every student.');
  await run(env.DB, 'INSERT INTO notices (course_id, intake_id, title, body, created_by) VALUES (?,?,?,?,?)', intakeId ? null : courseId, intakeId, title, text, user.id);
  await audit(env, user, 'notice posted', title);
  return json({ ok: true }, 201);
});

/* ---------- companies (corporate training) ---------- */
on('GET', '/company/overview', async ({ env, user }) => {
  need(user, 'student');
  if (!isManager(user)) fail(403, 'Only company training managers can open this.');
  const company = await one(env.DB, 'SELECT * FROM companies WHERE id = ?', user.company_id);
  const staff = await all(env.DB, `SELECT u.id, u.name, u.email, u.phone, u.company_manager, u.last_login FROM users u WHERE u.company_id = ? AND u.role = 'student' ORDER BY u.name`, company.id);
  const enrolments = await all(env.DB, `SELECT e.id, e.student_id, e.status, e.progress, c.code, c.title, i.name AS intake, i.venue, ce.cert_no,
      (SELECT ROUND(AVG(r.score*100.0/r.max_score)) FROM results r WHERE r.enrolment_id = e.id) AS avg_pct,
      (SELECT COUNT(*) FROM attendance a WHERE a.enrolment_id = e.id AND a.status IN ('present','late')) AS attended,
      (SELECT COUNT(*) FROM attendance a WHERE a.enrolment_id = e.id) AS marked
    FROM enrolments e JOIN courses c ON c.id = e.course_id LEFT JOIN intakes i ON i.id = e.intake_id LEFT JOIN certificates ce ON ce.enrolment_id = e.id
    WHERE e.student_id IN (SELECT id FROM users WHERE company_id = ?) AND e.status NOT IN ('withdrawn','rejected') ORDER BY e.created_at DESC`, company.id);
  const invoices = await all(env.DB, 'SELECT number, description, amount, due_date, status, paid_at FROM invoices WHERE company_id = ? ORDER BY created_at DESC', company.id);
  return json({ company, staff, enrolments, invoices });
});
on('POST', '/company/staff', async ({ env, user, body }) => {
  need(user, 'student');
  if (!isManager(user)) fail(403, 'Only company training managers can add staff.');
  const name = str(body.name, 100), email = str(body.email, 200).toLowerCase();
  if (!name || !emailOk(email)) fail(400, 'Enter the person\'s name and a valid email.');
  if (isStaffEmail(email)) fail(400, 'That is an MEA staff email.');
  if (await one(env.DB, 'SELECT id FROM users WHERE email = ?', email)) fail(409, 'That email already has an MEA account. Ask MEA admin to link it to your company.');
  const temp = tempPassword(); const { hash, salt } = await hashPassword(temp);
  await run(env.DB, `INSERT INTO users (email, name, phone, role, dept, pass_hash, pass_salt, must_change, company_id) VALUES (?,?,?,'student','training',?,?,1,?)`, email, name, str(body.phone, 40), hash, salt, user.company_id);
  await audit(env, user, 'company staff added', `${email}`);
  return json({ ok: true, temp_password: temp }, 201);
});
on('POST', '/company/enrol', async ({ env, user, body }) => {
  need(user, 'student');
  if (!isManager(user)) fail(403, 'Only company training managers can enrol staff.');
  const s = await one(env.DB, `SELECT * FROM users WHERE id = ? AND company_id = ? AND role = 'student'`, intOr(body.user_id, 0), user.company_id);
  if (!s) fail(400, 'Choose someone from your company.');
  const c = await one(env.DB, 'SELECT * FROM courses WHERE id = ? AND active = 1', intOr(body.course_id, 0));
  if (!c) fail(400, 'Choose an open course.');
  const intakeId = await checkIntake(env, body.intake_id, c.id);
  const ex = await one(env.DB, 'SELECT * FROM enrolments WHERE student_id = ? AND course_id = ?', s.id, c.id);
  if (ex && !['withdrawn', 'rejected'].includes(ex.status)) fail(409, `${s.name} is already on this course.`);
  if (ex) await run(env.DB, `UPDATE enrolments SET status='pending', progress=0, intake_id=?, company_id=?, updated_at=? WHERE id=?`, intakeId, user.company_id, now(), ex.id);
  else await run(env.DB, 'INSERT INTO enrolments (student_id, course_id, intake_id, company_id) VALUES (?,?,?,?)', s.id, c.id, intakeId, user.company_id);
  await audit(env, user, 'company enrolment', `${s.name} → ${c.code}`);
  return json({ ok: true }, 201);
});
async function checkIntake(env, intakeId, courseId) {
  const id = intOr(intakeId, null);
  if (!id) {
    const open = await one(env.DB, `SELECT COUNT(*) AS n FROM intakes WHERE course_id = ? AND active = 1 AND (end_date IS NULL OR end_date >= ?)`, courseId, now().slice(0, 10));
    if (open.n) fail(400, 'Choose an intake: Harare or Online, and the start date.');
    return null;
  }
  const i = await one(env.DB, `SELECT i.*, (SELECT COUNT(*) FROM enrolments e WHERE e.intake_id = i.id AND e.status IN ('pending','active')) AS taken FROM intakes i WHERE i.id = ? AND i.course_id = ? AND i.active = 1`, id, courseId);
  if (!i) fail(400, 'That intake is not open.');
  if (i.capacity && i.taken >= i.capacity) fail(409, `${i.name} is full. Pick another intake.`);
  return i.id;
}

/* ---------- admin: companies, invoices, resources ---------- */
on('GET', '/admin/companies', async ({ env, user }) => {
  need(user, 'admin');
  const companies = await all(env.DB, `SELECT co.*, (SELECT COUNT(*) FROM users u WHERE u.company_id = co.id) AS people,
    (SELECT COALESCE(SUM(amount),0) FROM invoices i WHERE i.company_id = co.id AND i.status = 'unpaid') AS owing FROM companies co ORDER BY co.name`);
  const people = await all(env.DB, `SELECT id, name, email, company_id, company_manager FROM users WHERE role = 'student' ORDER BY name`);
  return json({ companies, people });
});
on('POST', '/admin/company', async ({ env, user, body }) => {
  need(user, 'admin');
  const id = intOr(body.id, 0);
  const c = { name: str(body.name, 140), contact_name: str(body.contact_name, 100), email: str(body.email, 200), phone: str(body.phone, 40), address: str(body.address, 400), notes: str(body.notes, 1000) };
  if (!c.name) fail(400, 'Enter the company name.');
  if (await one(env.DB, 'SELECT id FROM companies WHERE name = ? AND id != ?', c.name, id)) fail(409, 'A company with that name already exists.');
  if (id) await run(env.DB, 'UPDATE companies SET name=?, contact_name=?, email=?, phone=?, address=?, notes=? WHERE id=?', c.name, c.contact_name, c.email, c.phone, c.address, c.notes, id);
  else await run(env.DB, 'INSERT INTO companies (name, contact_name, email, phone, address, notes) VALUES (?,?,?,?,?,?)', c.name, c.contact_name, c.email, c.phone, c.address, c.notes);
  await audit(env, user, id ? 'company updated' : 'company added', c.name);
  return json({ ok: true });
});
on('POST', '/admin/company-member', async ({ env, user, body }) => {
  need(user, 'admin');
  const u = await one(env.DB, `SELECT * FROM users WHERE id = ? AND role = 'student'`, intOr(body.user_id, 0));
  if (!u) fail(400, 'Choose a student account.');
  const cid = intOr(body.company_id, null);
  if (cid && !(await one(env.DB, 'SELECT id FROM companies WHERE id = ?', cid))) fail(400, 'Company not found.');
  await run(env.DB, 'UPDATE users SET company_id = ?, company_manager = ? WHERE id = ?', cid, cid && body.manager ? 1 : 0, u.id);
  await audit(env, user, 'company member set', `${u.email} → ${cid || 'none'}${body.manager ? ' (manager)' : ''}`);
  return json({ ok: true });
});
on('GET', '/admin/invoices', async ({ env, user }) => {
  need(user, 'admin');
  const invoices = await all(env.DB, `SELECT i.*, s.name AS student, s.email AS student_email, co.name AS company FROM invoices i LEFT JOIN users s ON s.id = i.student_id LEFT JOIN companies co ON co.id = i.company_id ORDER BY i.created_at DESC LIMIT 500`);
  const people = await all(env.DB, `SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name`);
  const companies = await all(env.DB, 'SELECT id, name FROM companies ORDER BY name');
  const unbilled = await all(env.DB, `SELECT e.id, s.id AS student_id, s.name AS student, e.company_id, co.name AS company, c.code, c.title, c.fee FROM enrolments e JOIN users s ON s.id = e.student_id JOIN courses c ON c.id = e.course_id LEFT JOIN companies co ON co.id = e.company_id
    WHERE e.status IN ('pending','active') AND c.fee > 0 AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.enrolment_id = e.id AND i.status != 'void') ORDER BY e.created_at DESC`);
  return json({ invoices, people, companies, unbilled });
});
on('POST', '/admin/invoice', async ({ env, user, body }) => {
  need(user, 'admin');
  const sid = intOr(body.student_id, null), cid = intOr(body.company_id, null), eid = intOr(body.enrolment_id, null);
  if (!sid && !cid) fail(400, 'Bill a student or a company.');
  const amount = num(body.amount), description = str(body.description, 400);
  if (!description) fail(400, 'Describe what the invoice is for.');
  if (!(amount >= 0)) fail(400, 'Enter the amount in USD.');
  const number = await nextInvoiceNo(env);
  await run(env.DB, 'INSERT INTO invoices (number, student_id, company_id, enrolment_id, description, amount, due_date, created_by) VALUES (?,?,?,?,?,?,?,?)', number, sid, cid, eid, description, amount, isoOk(body.due_date) ? body.due_date.slice(0, 10) : null, user.id);
  await audit(env, user, 'invoice created', `${number} $${amount}`);
  return json({ ok: true, number }, 201);
});
on('POST', '/admin/invoice/:id', async ({ env, user, params, body }) => {
  need(user, 'admin');
  const i = await one(env.DB, 'SELECT * FROM invoices WHERE id = ?', intOr(params.id, 0));
  if (!i) fail(404, 'Invoice not found.');
  if (body.action === 'paid') await run(env.DB, `UPDATE invoices SET status='paid', paid_at=?, method=?, reference=? WHERE id=?`, now(), str(body.method, 40) || 'Other', str(body.reference, 100), i.id);
  else if (body.action === 'unpaid') await run(env.DB, `UPDATE invoices SET status='unpaid', paid_at=NULL, method=NULL, reference=NULL WHERE id=?`, i.id);
  else if (body.action === 'void') await run(env.DB, `UPDATE invoices SET status='void' WHERE id=?`, i.id);
  else fail(400, 'Unknown action.');
  await audit(env, user, 'invoice ' + body.action, i.number);
  return json({ ok: true });
});
on('GET', '/invoices/mine', async ({ env, user }) => {
  need(user, 'student');
  const rows = await all(env.DB, `SELECT i.id, i.number, i.description, i.amount, i.due_date, i.status, i.paid_at, i.method, i.reference, i.created_at, co.name AS company FROM invoices i LEFT JOIN companies co ON co.id = i.company_id
    WHERE i.student_id = ? ${isManager(user) ? 'OR i.company_id = ' + Number(user.company_id) : ''} ORDER BY i.created_at DESC`, user.id);
  return json({ invoices: rows, student: { name: user.name, email: user.email } });
});
const canEditArticles = (u) => u && (u.role === 'admin' || u.role === 'teacher');
on('GET', '/admin/articles', async ({ env, user }) => {
  need(user); if (!canEditArticles(user)) fail(403, 'Only admin and teachers can edit Resources.');
  const rows = await all(env.DB, 'SELECT a.id, a.slug, a.title, a.cat, a.mins, a.sum, a.data, a.published, a.sort, a.updated_at, u.name AS editor FROM articles a LEFT JOIN users u ON u.id = a.updated_by ORDER BY a.sort, a.updated_at DESC');
  return json({ articles: rows.map((r) => { let d = {}; try { d = JSON.parse(r.data); } catch (e) {} return { ...r, data: undefined, body: d.body || [], img: d.img || '', alt: d.alt || '' }; }) });
});
on('POST', '/admin/article', async ({ env, user, body }) => {
  need(user); if (!canEditArticles(user)) fail(403, 'Only admin and teachers can edit Resources.');
  const id = intOr(body.id, 0);
  if (id && body.delete) { await run(env.DB, 'DELETE FROM articles WHERE id = ?', id); await audit(env, user, 'article deleted', String(id)); return json({ ok: true }); }
  const title = str(body.title, 160); if (!title) fail(400, 'Give the article a title.');
  const slug = (str(body.slug, 80) || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
  const paras = (Array.isArray(body.body) ? body.body : String(body.body || '').split(/\n\s*\n/)).map((p) => str(p, 4000)).filter(Boolean).slice(0, 80);
  if (!paras.length) fail(400, 'Write the article text.');
  const img = str(body.img, 400000);
  if (img && !/^(data:image\/(png|jpeg|webp|svg\+xml);base64,|\/api\/files\/\d+$)/.test(img)) fail(400, 'The picture must be an uploaded image.');
  const data = JSON.stringify({ body: paras, img, alt: str(body.alt, 200) });
  if (await one(env.DB, 'SELECT id FROM articles WHERE slug = ? AND id != ?', slug, id)) fail(409, 'Another article already uses that web address.');
  const vals = [slug, title, str(body.cat, 40) || 'Automation', Math.max(1, intOr(body.mins, 3)), str(body.sum, 400), data, body.published ? 1 : 0, intOr(body.sort, 0), user.id, now()];
  if (id) await run(env.DB, 'UPDATE articles SET slug=?, title=?, cat=?, mins=?, sum=?, data=?, published=?, sort=?, updated_by=?, updated_at=? WHERE id=?', ...vals, id);
  else await run(env.DB, 'INSERT INTO articles (slug, title, cat, mins, sum, data, published, sort, updated_by, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)', ...vals);
  await audit(env, user, id ? 'article updated' : 'article added', title);
  return json({ ok: true, slug });
});

/* ---------------- entry ---------------- */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method.toUpperCase();
  try {
    if (!env.DB) fail(503, 'The database is not connected yet.');
    const isUpload = method === 'POST' && /^\/files\/\d+\/chunk$/.test(path);
    if (method !== 'GET' && method !== 'HEAD') {
      // Only same-site JSON requests may change data (blocks cross-site form posts). File parts are raw bytes.
      const ct = request.headers.get('content-type') || '';
      if (isUpload ? !ct.includes('application/octet-stream') : !ct.includes('application/json')) fail(415, isUpload ? 'Send the file part as bytes.' : 'Send JSON.');
      const origin = request.headers.get('origin');
      if (origin && new URL(origin).host !== url.host) fail(403, 'Cross-site request blocked.');
    }
    for (const r of routes) {
      if (r.method !== method) continue;
      const m = path.match(r.re);
      if (!m) continue;
      let body = {}, raw = null;
      if (isUpload) raw = await request.arrayBuffer();
      else if (method === 'POST') { try { body = await request.json(); } catch { body = {}; } if (!body || typeof body !== 'object') body = {}; }
      const user = await currentUser(env, request);
      return await r.handler({ env, req: request, url, body, raw, user, params: m.groups || {} });
    }
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  }
}
