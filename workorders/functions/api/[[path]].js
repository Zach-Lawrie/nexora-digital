// Basa work orders: Cloudflare Pages Function API. Routes under /api/. D1 bound as env.DB.
const SESSION_DAYS = 14;
const COOKIE = 'basa_s';
const ROLES = ['admin', 'manager', 'foreman', 'tech', 'client'];
const STAFF = ['admin', 'manager', 'foreman', 'tech'];
const BOSS = ['admin', 'manager'];
const SUPERVISE = ['admin', 'manager', 'foreman'];
const DISCIPLINES = ['Electrical', 'Mechanical', 'Automation', 'Instrumentation'];
const TYPES = ['Preventive maintenance', 'Corrective maintenance', 'Breakdown', 'Installation', 'Inspection', 'Testing & commissioning', 'Calibration'];
const PRIORITIES = ['Urgent', 'High', 'Normal', 'Low'];
const STATUSES = ['requested', 'open', 'assigned', 'in_progress', 'on_hold', 'completed', 'reviewed', 'approved', 'sent', 'closed', 'cancelled'];
const LABEL = { requested: 'Requested', open: 'Open', assigned: 'Assigned', in_progress: 'In progress', on_hold: 'On hold', completed: 'Completed', reviewed: 'Reviewed', approved: 'Approved', sent: 'Sent to client', closed: 'Closed', cancelled: 'Cancelled' };
const WORKING = ['assigned', 'in_progress', 'on_hold'];
const DEFAULT_SETTINGS = {
  company: 'MEA · Mechanical, Electrical & Automation', short: 'MEA', tagline: 'Engineering services and maintenance',
  address: 'Harare, Zimbabwe', phone: '', email: 'manager@meazim.com', website: 'meazim.com',
  logo: '', color: '#d9822b', currency: 'USD', labour_rate: '35', vat: '15', report_costs: '1',
  report_footer: 'Thank you for choosing MEA. Please contact us about any of the recommendations in this report.'
};

/* ---------- checklist templates ---------- */
const SAFETY = ['Job hazard assessment (JHA) done and signed', 'Permit to work issued', 'Isolation and lock-out / tag-out (LOTO) applied', 'Zero energy verified (test before touch)', 'Correct PPE worn and checked', 'Work area barricaded and signed'];
const HANDOVER = ['Area cleaned, tools and waste removed', 'Isolations removed and equipment returned to service', 'Client or operator told what was done'];
const T = {
  Electrical: {
    insp: ['Visual check of switchboard and enclosures', 'Cable condition, glands and supports', 'Terminations tight (torque check)', 'Insulation resistance test (MΩ)', 'Earth continuity / earth resistance (Ω)', 'RCD trip time test (ms)', 'Thermal scan of connections', 'Labels and circuit schedule up to date'],
    maint: ['Clean and inspect equipment', 'Tighten terminations', 'Check contactors, relays and breakers', 'Measure voltage and current (V / A)', 'Insulation resistance test (MΩ)', 'Functional test after work'],
    inst: ['Materials checked against drawing', 'Cable route and supports installed', 'Cables terminated and labelled', 'Earthing and bonding installed', 'Insulation resistance test (MΩ)', 'Polarity and phase rotation verified', 'Energised and functional test', 'As-built drawing marked up'],
  },
  Mechanical: {
    insp: ['Visual check for leaks, cracks and wear', 'Vibration reading (mm/s)', 'Bearing temperature (°C)', 'Noise check', 'Guards and covers in place', 'Lubrication level and condition', 'Belt / coupling condition', 'Fasteners and foundation bolts'],
    maint: ['Lubricate as per schedule', 'Check and adjust belt tension', 'Shaft alignment check (mm)', 'Replace worn parts', 'Vibration reading after work (mm/s)', 'Run test and leak check'],
    inst: ['Foundation and level checked', 'Equipment set and secured', 'Alignment within tolerance (mm)', 'Piping / ducting connected', 'Guards fitted', 'Lubricated before first run', 'Commissioning run test'],
  },
  Automation: {
    insp: ['PLC status and fault log checked', 'PLC program backed up', 'I/O status check', 'HMI alarms reviewed', 'Network and comms check', 'Instrument loops verified (4–20 mA)', 'Panel cooling and filters', 'UPS / power supply check'],
    maint: ['PLC program backed up before changes', 'Fault found and corrected', 'Loop test (4–20 mA)', 'Interlocks and trips tested', 'Alarms and HMI checked', 'Program change documented'],
    inst: ['Panel installed and earthed', 'Field devices installed and tagged', 'Loop checks completed', 'I/O point-to-point check', 'PLC program downloaded and backed up', 'Interlocks and E-stops tested', 'Operator handover / training'],
  },
};
T.Instrumentation = T.Automation;
const CAL = ['Reference instrument certificate valid', 'As-found reading', 'Adjustment made', 'As-left reading', 'Result within tolerance', 'Calibration sticker fitted'];
function templateFor(discipline, type) {
  const d = T[discipline] || T.Electrical;
  let main, name;
  if (type === 'Inspection') { main = d.insp; name = 'Inspection'; }
  else if (type === 'Installation' || type === 'Testing & commissioning') { main = d.inst; name = type === 'Installation' ? 'Installation' : 'Testing & commissioning'; }
  else if (type === 'Calibration') { main = CAL; name = 'Calibration'; }
  else { main = d.maint; name = 'Work'; }
  return [['Safety before work', SAFETY], [name + ' checks', main], ['Handover', HANDOVER]];
}

/* ---------- helpers ---------- */
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const str = (v, max = 500) => (v == null ? '' : String(v)).trim().slice(0, max);
const numOr = (v, d = null) => { if (v === '' || v == null) return d; const n = Number(v); return Number.isFinite(n) ? n : d; };
const dateOr = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null);
const oneOf = (v, list, d) => (list.includes(v) ? v : d);
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
function tempPassword() {
  const w = ['Volt', 'Relay', 'Drive', 'Sensor', 'Panel', 'Motor', 'Cable', 'Pump', 'Valve', 'Gear'];
  return w[crypto.getRandomValues(new Uint8Array(1))[0] % w.length] + '-' + randHex(3).toUpperCase() + '-' + (100 + (crypto.getRandomValues(new Uint16Array(1))[0] % 900));
}
function passwordRule(p) { if (typeof p !== 'string' || p.length < 8) fail(400, 'Use a password of at least 8 characters.'); if (p.length > 128) fail(400, 'That password is too long.'); }
function getCookie(req, name) { const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')); return m ? m[1] : null; }
const cookie = (token, maxAge, secure) => `${COOKIE}=${token}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`;
const all = async (db, sql, ...b) => (await db.prepare(sql).bind(...b).all()).results || [];
const one = (db, sql, ...b) => db.prepare(sql).bind(...b).first();
const run = (db, sql, ...b) => db.prepare(sql).bind(...b).run();
async function audit(env, user, action, detail) { try { await run(env.DB, 'INSERT INTO audit (user_id, who, action, detail) VALUES (?,?,?,?)', user ? user.id : null, user ? user.email : 'public', action, detail ? String(detail).slice(0, 400) : null); } catch (e) { /* never block */ } }
const publicUser = (u) => u && ({ id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role, trade: u.trade, client_id: u.client_id, must_change: !!u.must_change });
async function currentUser(env, req) {
  const t = getCookie(req, COOKIE);
  if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  return (await one(env.DB, `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ? AND u.status = 'active'`, t, now())) || null;
}
function need(user, ...roles) {
  if (!user) fail(401, 'Please sign in.');
  if (user.must_change) fail(403, 'Change your temporary password first.');
  if (roles.length && !roles.includes(user.role)) fail(403, 'Your account cannot do that.');
}
async function settings(env) {
  const rows = await all(env.DB, 'SELECT key, value FROM settings');
  const s = { ...DEFAULT_SETTINGS };
  rows.forEach((r) => { s[r.key] = r.value; });
  return s;
}
async function notify(env, userIds, woId, text) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return;
  await env.DB.batch(ids.map((id) => env.DB.prepare('INSERT INTO notifications (user_id, wo_id, text) VALUES (?,?,?)').bind(id, woId, text.slice(0, 300))));
}
const roleIds = async (env, ...roles) => (await all(env.DB, `SELECT id FROM users WHERE status='active' AND role IN (${roles.map(() => '?').join(',')})`, ...roles)).map((r) => r.id);
const clientIds = async (env, clientId) => clientId ? (await all(env.DB, `SELECT id FROM users WHERE status='active' AND role='client' AND client_id=?`, clientId)).map((r) => r.id) : [];
async function log(env, wo, user, kind, text) {
  await run(env.DB, 'INSERT INTO activity (wo_id, user_id, who, kind, text) VALUES (?,?,?,?,?)', wo.id, user ? user.id : null, user ? user.name : 'System', kind, String(text).slice(0, 1000));
  await run(env.DB, 'UPDATE work_orders SET updated_at=? WHERE id=?', now(), wo.id);
}

/* ---------- access ---------- */
async function onTeam(env, wo, user) {
  if (wo.lead_id === user.id) return true;
  return !!(await one(env.DB, 'SELECT id FROM wo_team WHERE wo_id=? AND user_id=?', wo.id, user.id));
}
async function loadWO(env, id, user) {
  const wo = await one(env.DB, 'SELECT * FROM work_orders WHERE id=?', Number(id) || 0);
  if (!wo) fail(404, 'Work order not found.');
  if (user.role === 'client' && wo.client_id !== user.client_id) fail(404, 'Work order not found.');
  if (user.role === 'tech' && !(await onTeam(env, wo, user))) fail(404, 'Work order not found.');
  return wo;
}
// Who may change the job record (checklist, time, materials, photos, notes)
async function canWork(env, wo, user) {
  if (BOSS.includes(user.role)) return !['sent', 'closed', 'cancelled'].includes(wo.status);
  if (user.role === 'foreman') return !['approved', 'sent', 'closed', 'cancelled'].includes(wo.status);
  if (user.role === 'tech') return WORKING.includes(wo.status) && (await onTeam(env, wo, user));
  return false;
}
async function needWork(env, wo, user) { if (!(await canWork(env, wo, user))) fail(403, wo.status === 'completed' ? 'This job has been submitted. Ask your foreman to send it back if something must change.' : 'You cannot change this job now.'); }

const WO_LIST_SQL = `SELECT w.id, w.number, w.title, w.status, w.priority, w.discipline, w.type, w.due_date, w.scheduled_date, w.created_at, w.updated_at, w.completed_at, w.client_id, w.lead_id, w.foreman_id,
  c.name AS client, s.name AS site, a.tag AS asset_tag, a.name AS asset, l.name AS lead, f.name AS foreman,
  (SELECT COUNT(*) FROM wo_team t WHERE t.wo_id=w.id) AS team_count,
  (SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id) AS hours,
  (SELECT COUNT(*) FROM checklist k WHERE k.wo_id=w.id) AS ck_total,
  (SELECT COUNT(*) FROM checklist k WHERE k.wo_id=w.id AND k.result<>'') AS ck_done
  FROM work_orders w LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN assets a ON a.id=w.asset_id
  LEFT JOIN users l ON l.id=w.lead_id LEFT JOIN users f ON f.id=w.foreman_id`;
function scopeSql(user) {
  if (user.role === 'client') return [' WHERE w.client_id = ?', [user.client_id || -1]];
  if (user.role === 'tech') return [' WHERE (w.lead_id = ? OR EXISTS (SELECT 1 FROM wo_team t WHERE t.wo_id=w.id AND t.user_id=?))', [user.id, user.id]];
  return [' WHERE 1=1', []];
}
async function nextNumber(env) {
  const ym = new Date().toISOString().slice(2, 7).replace('-', '');
  const r = await one(env.DB, `SELECT number FROM work_orders WHERE number LIKE ? ORDER BY number DESC LIMIT 1`, `WO-${ym}-%`);
  const n = r ? parseInt(r.number.split('-')[2], 10) + 1 : 1;
  return `WO-${ym}-${String(n).padStart(3, '0')}`;
}
async function createWO(env, user, d) {
  let number = await nextNumber(env), r;
  for (let i = 0; i < 4; i++) {
    try {
      r = await run(env.DB, `INSERT INTO work_orders (number, client_id, site_id, asset_id, discipline, type, priority, title, description, status, requested_by, foreman_id, lead_id, due_date, scheduled_date, est_hours, quote, client_ref, pm_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, number, d.client_id, d.site_id, d.asset_id, d.discipline, d.type, d.priority, d.title, d.description, d.status, user.id, d.foreman_id, d.lead_id, d.due_date, d.scheduled_date, d.est_hours, d.quote, d.client_ref || null, d.pm_id || null);
      break;
    } catch (e) { if (!/UNIQUE/i.test(String(e.message))) throw e; number = number.replace(/\d+$/, (x) => String(+x + 1).padStart(3, '0')); }
  }
  const id = r.meta.last_row_id;
  const stmts = []; let sort = 0;
  for (const [section, items] of templateFor(d.discipline, d.type)) for (const item of items) stmts.push(env.DB.prepare('INSERT INTO checklist (wo_id, section, item, sort) VALUES (?,?,?,?)').bind(id, section, item, sort++));
  await env.DB.batch(stmts);
  return one(env.DB, 'SELECT * FROM work_orders WHERE id=?', id);
}
async function cleanRefs(env, d) {
  if (d.asset_id) { const a = await one(env.DB, 'SELECT a.*, s.client_id FROM assets a JOIN sites s ON s.id=a.site_id WHERE a.id=?', d.asset_id); if (!a) d.asset_id = null; else { d.site_id = a.site_id; d.client_id = a.client_id; } }
  if (d.site_id && !d.asset_id) { const s = await one(env.DB, 'SELECT * FROM sites WHERE id=?', d.site_id); if (!s) d.site_id = null; else d.client_id = s.client_id; }
  if (d.client_id && !(await one(env.DB, 'SELECT id FROM clients WHERE id=?', d.client_id))) d.client_id = null;
  for (const k of ['lead_id', 'foreman_id']) if (d[k]) { const u = await one(env.DB, `SELECT role FROM users WHERE id=? AND status='active'`, d[k]); if (!u || (k === 'lead_id' && !['tech', 'foreman'].includes(u.role)) || (k === 'foreman_id' && !['foreman', 'manager', 'admin'].includes(u.role))) d[k] = null; }
  return d;
}
async function generatePM(env, user) {
  const plans = await all(env.DB, `SELECT p.*, a.site_id, s.client_id, a.tag, a.name AS asset FROM pm_plans p JOIN assets a ON a.id=p.asset_id JOIN sites s ON s.id=a.site_id
    WHERE p.active=1 AND p.next_due <= ? AND NOT EXISTS (SELECT 1 FROM work_orders w WHERE w.pm_id=p.id AND w.status NOT IN ('closed','cancelled','sent','approved'))`, addDays(today(), 7));
  const made = [];
  for (const p of plans) {
    const wo = await createWO(env, user, { client_id: p.client_id, site_id: p.site_id, asset_id: p.asset_id, discipline: p.discipline, type: p.type, priority: 'Normal', title: `${p.title} · ${p.tag}`, description: `Planned maintenance from schedule (every ${p.every_days} days).`, status: 'open', foreman_id: p.foreman_id, lead_id: null, due_date: p.next_due, scheduled_date: null, est_hours: p.est_hours, quote: null, pm_id: p.id });
    await run(env.DB, 'UPDATE pm_plans SET next_due=? WHERE id=?', addDays(p.next_due, p.every_days), p.id);
    await log(env, wo, null, 'created', 'Created automatically from the maintenance schedule.');
    await notify(env, p.foreman_id ? [p.foreman_id] : await roleIds(env, 'foreman'), wo.id, `${wo.number}: planned job due ${p.next_due} needs a technician`);
    made.push(wo.number);
  }
  return made;
}

/* ---------- routes ---------- */
const routes = [];
const on = (method, pattern, handler) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler });

/* auth */
on('POST', '/auth/login', async ({ env, body, secure }) => {
  const email = str(body.email, 200).toLowerCase(), password = String(body.password || '');
  const u = await one(env.DB, 'SELECT * FROM users WHERE email = ?', email);
  if (u && u.locked_until && u.locked_until > now()) fail(429, 'Too many wrong attempts. Try again in 15 minutes.');
  const ok = u && u.status === 'active' && safeEqual((await hashPassword(password, u.pass_salt)).hash, u.pass_hash);
  if (!ok) {
    if (u) { const f = u.failed + 1; await run(env.DB, 'UPDATE users SET failed=?, locked_until=? WHERE id=?', f >= 8 ? 0 : f, f >= 8 ? new Date(Date.now() + 15 * 60e3).toISOString() : null, u.id); }
    fail(401, u && u.status !== 'active' ? 'This account is switched off. Contact your manager.' : 'Email or password is wrong.');
  }
  const token = randHex(32);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now()),
    env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)').bind(token, u.id, new Date(Date.now() + SESSION_DAYS * 864e5).toISOString()),
    env.DB.prepare('UPDATE users SET failed=0, locked_until=NULL, last_login=? WHERE id=?').bind(now(), u.id),
  ]);
  await audit(env, u, 'login', null);
  return json({ user: publicUser(u) }, 200, { 'set-cookie': cookie(token, SESSION_DAYS * 86400, secure) });
});
on('POST', '/auth/logout', async ({ env, req, secure }) => {
  const t = getCookie(req, COOKIE);
  if (t) await run(env.DB, 'DELETE FROM sessions WHERE token=?', t);
  return json({ ok: true }, 200, { 'set-cookie': cookie('x', 0, secure) });
});
on('GET', '/me', async ({ env, user }) => json({ user: publicUser(user), settings: await settings(env) }));
on('POST', '/me/password', async ({ env, user, body }) => {
  if (!user) fail(401, 'Please sign in.');
  if (!safeEqual((await hashPassword(String(body.current || ''), user.pass_salt)).hash, user.pass_hash)) fail(400, 'Your current password is wrong.');
  passwordRule(body.password);
  if (body.password === body.current) fail(400, 'Choose a new password that is different from the old one.');
  const { hash, salt } = await hashPassword(body.password);
  await run(env.DB, 'UPDATE users SET pass_hash=?, pass_salt=?, must_change=0 WHERE id=?', hash, salt, user.id);
  await audit(env, user, 'changed password', null);
  return json({ ok: true });
});
on('POST', '/me/profile', async ({ env, user, body }) => {
  need(user);
  await run(env.DB, 'UPDATE users SET name=?, phone=? WHERE id=?', str(body.name, 100) || user.name, str(body.phone, 40), user.id);
  return json({ ok: true });
});

/* lookups for forms */
on('GET', '/lookups', async ({ env, user }) => {
  need(user);
  const out = { disciplines: DISCIPLINES, types: TYPES, priorities: PRIORITIES, statuses: STATUSES, labels: LABEL };
  if (user.role === 'client') {
    out.clients = await all(env.DB, 'SELECT id, name FROM clients WHERE id=?', user.client_id || -1);
    out.sites = await all(env.DB, 'SELECT id, client_id, name, address FROM sites WHERE client_id=? ORDER BY name', user.client_id || -1);
    out.assets = await all(env.DB, 'SELECT a.id, a.site_id, a.tag, a.name, a.discipline FROM assets a JOIN sites s ON s.id=a.site_id WHERE s.client_id=? ORDER BY a.tag', user.client_id || -1);
    out.staff = [];
  } else {
    out.clients = await all(env.DB, 'SELECT id, name FROM clients ORDER BY name');
    out.sites = await all(env.DB, 'SELECT id, client_id, name, address FROM sites ORDER BY name');
    out.assets = await all(env.DB, 'SELECT id, site_id, tag, name, discipline FROM assets ORDER BY tag');
    out.staff = await all(env.DB, `SELECT u.id, u.name, u.role, u.trade, u.phone,
      (SELECT COUNT(*) FROM work_orders w WHERE (w.lead_id=u.id OR EXISTS (SELECT 1 FROM wo_team t WHERE t.wo_id=w.id AND t.user_id=u.id)) AND w.status IN ('assigned','in_progress','on_hold')) AS active_jobs
      FROM users u WHERE u.status='active' AND u.role IN ('tech','foreman','manager','admin') ORDER BY u.role DESC, u.name`);
  }
  return json(out);
});

/* dashboard */
on('GET', '/dashboard', async ({ env, user }) => {
  need(user);
  let made = [];
  if (SUPERVISE.includes(user.role)) made = await generatePM(env, user);
  const [w, b] = scopeSql(user);
  const rows = await all(env.DB, WO_LIST_SQL + w + ' ORDER BY w.updated_at DESC, w.id DESC', ...b);
  const t = today();
  const month = t.slice(0, 8) + '01';
  const hoursSql = user.role === 'tech' ? ['SELECT COALESCE(SUM(hours),0) h FROM time_logs WHERE user_id=? AND date>=?', user.id, month] : ['SELECT COALESCE(SUM(hours),0) h FROM time_logs WHERE date>=?', month];
  const hours = (await one(env.DB, ...hoursSql)).h;
  const out = { pm_created: made, wo: rows, hours_month: hours, today: t };
  if (SUPERVISE.includes(user.role)) {
    out.workload = await all(env.DB, `SELECT u.id, u.name, u.trade,
      (SELECT COUNT(*) FROM work_orders w WHERE (w.lead_id=u.id OR EXISTS (SELECT 1 FROM wo_team t WHERE t.wo_id=w.id AND t.user_id=u.id)) AND w.status IN ('assigned','in_progress','on_hold')) AS jobs,
      (SELECT COALESCE(SUM(hours),0) FROM time_logs l WHERE l.user_id=u.id AND l.date>=?) AS hours
      FROM users u WHERE u.status='active' AND u.role='tech' ORDER BY jobs DESC, u.name`, month);
    out.pm_due = await all(env.DB, `SELECT p.id, p.title, p.next_due, p.every_days, a.tag, a.name AS asset FROM pm_plans p JOIN assets a ON a.id=p.asset_id WHERE p.active=1 ORDER BY p.next_due LIMIT 8`);
    const s = await settings(env);
    out.value_month = (await one(env.DB, `SELECT COALESCE(SUM(l.hours),0)*? + COALESCE((SELECT SUM(m.qty*m.unit_cost) FROM materials m WHERE m.created_at>=?),0) v FROM time_logs l WHERE l.date>=?`, Number(s.labour_rate) || 0, month, month)).v;
  }
  return json(out);
});

/* notifications */
on('GET', '/notifications', async ({ env, user }) => { need(user); return json({ items: await all(env.DB, 'SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 30', user.id), unread: (await one(env.DB, 'SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read=0', user.id)).n }); });
on('POST', '/notifications/read', async ({ env, user }) => { need(user); await run(env.DB, 'UPDATE notifications SET read=1 WHERE user_id=?', user.id); return json({ ok: true }); });

/* work orders */
on('GET', '/wo', async ({ env, user, url }) => {
  need(user);
  let [w, b] = scopeSql(user);
  const st = url.searchParams.get('status'), q = str(url.searchParams.get('q'), 80), disc = url.searchParams.get('discipline');
  if (st === 'active') w += ` AND w.status NOT IN ('closed','cancelled')`;
  else if (STATUSES.includes(st)) { w += ' AND w.status=?'; b.push(st); }
  if (DISCIPLINES.includes(disc)) { w += ' AND w.discipline=?'; b.push(disc); }
  if (url.searchParams.get('asset')) { w += ' AND w.asset_id=?'; b.push(Number(url.searchParams.get('asset')) || 0); }
  if (q) { w += ' AND (w.number LIKE ? OR w.title LIKE ? OR c.name LIKE ? OR a.tag LIKE ? OR s.name LIKE ?)'; const l = '%' + q + '%'; b.push(l, l, l, l, l); }
  return json({ items: await all(env.DB, WO_LIST_SQL + w + ' ORDER BY w.id DESC LIMIT 500', ...b) });
});
on('POST', '/wo', async ({ env, user, body }) => {
  need(user, 'admin', 'manager', 'foreman', 'client');
  const isClient = user.role === 'client';
  const d = {
    client_id: isClient ? user.client_id : numOr(body.client_id), site_id: numOr(body.site_id), asset_id: numOr(body.asset_id),
    discipline: oneOf(body.discipline, DISCIPLINES, null), type: oneOf(body.type, TYPES, null), priority: oneOf(body.priority, PRIORITIES, 'Normal'),
    title: str(body.title, 160), description: str(body.description, 4000), due_date: dateOr(body.due_date), scheduled_date: isClient ? null : dateOr(body.scheduled_date),
    est_hours: isClient ? null : numOr(body.est_hours), quote: isClient ? null : numOr(body.quote), client_ref: str(body.client_ref, 80),
    foreman_id: isClient ? null : numOr(body.foreman_id), lead_id: isClient ? null : numOr(body.lead_id),
  };
  if (!d.title) fail(400, 'Give the job a short title.');
  if (!d.discipline) fail(400, 'Choose the discipline: electrical, mechanical, automation or instrumentation.');
  if (!d.type) fail(400, 'Choose the type of work.');
  await cleanRefs(env, d);
  if (isClient) { if (d.client_id !== user.client_id) { d.client_id = user.client_id; d.site_id = null; d.asset_id = null; } }
  if (!d.client_id) fail(400, 'Choose the client.');
  if (user.role === 'foreman' && !d.foreman_id) d.foreman_id = user.id;
  d.status = isClient ? 'requested' : d.lead_id ? 'assigned' : 'open';
  const wo = await createWO(env, user, d);
  await log(env, wo, user, 'created', isClient ? 'Job requested by the client.' : 'Work order created.');
  if (isClient) await notify(env, await roleIds(env, 'manager', 'admin', 'foreman'), wo.id, `${wo.number}: new request from ${user.name}: ${d.title}`);
  if (d.lead_id) { await log(env, wo, user, 'assigned', 'Assigned to ' + (await one(env.DB, 'SELECT name FROM users WHERE id=?', d.lead_id)).name); await notify(env, [d.lead_id], wo.id, `${wo.number}: you are the lead technician on "${d.title}"`); }
  if (d.foreman_id && d.foreman_id !== user.id) await notify(env, [d.foreman_id], wo.id, `${wo.number}: new job for your team: ${d.title}`);
  await audit(env, user, 'created work order', wo.number);
  return json({ wo }, 201);
});
async function fullWO(env, wo, user, pub) {
  const det = await one(env.DB, `SELECT w.*, c.name AS client, c.contact AS client_contact, c.email AS client_email, c.phone AS client_phone, c.address AS client_address,
    s.name AS site, s.address AS site_address, a.tag AS asset_tag, a.name AS asset, a.make AS asset_make, a.model AS asset_model, a.serial AS asset_serial, a.rating AS asset_rating,
    l.name AS lead, l.phone AS lead_phone, l.trade AS lead_trade, f.name AS foreman, r.name AS requester, r.role AS requester_role, ap.name AS approver
    FROM work_orders w LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN assets a ON a.id=w.asset_id
    LEFT JOIN users l ON l.id=w.lead_id LEFT JOIN users f ON f.id=w.foreman_id LEFT JOIN users r ON r.id=w.requested_by LEFT JOIN users ap ON ap.id=w.approved_by WHERE w.id=?`, wo.id);
  const out = {
    wo: det,
    team: await all(env.DB, 'SELECT t.*, u.trade, u.phone FROM wo_team t LEFT JOIN users u ON u.id=t.user_id WHERE t.wo_id=? ORDER BY t.id', wo.id),
    checklist: await all(env.DB, 'SELECT * FROM checklist WHERE wo_id=? ORDER BY sort, id', wo.id),
    time: await all(env.DB, 'SELECT * FROM time_logs WHERE wo_id=? ORDER BY date, id', wo.id),
    materials: await all(env.DB, 'SELECT * FROM materials WHERE wo_id=? ORDER BY id', wo.id),
    photos: await all(env.DB, 'SELECT id, caption, stage, user_id, created_at FROM photos WHERE wo_id=? ORDER BY id', wo.id),
  };
  if (!pub) {
    out.activity = await all(env.DB, 'SELECT * FROM activity WHERE wo_id=? ORDER BY id DESC', wo.id);
    if (user.role === 'client') { out.activity = out.activity.filter((a) => ['created', 'comment', 'status', 'sent', 'signoff'].includes(a.kind)); if (!['sent', 'closed'].includes(wo.status)) { out.time = []; out.materials = []; } }
    out.can = {
      work: await canWork(env, wo, user),
      lead: wo.lead_id === user.id || SUPERVISE.includes(user.role),
      supervise: SUPERVISE.includes(user.role),
      boss: BOSS.includes(user.role),
    };
  } else { delete det.tech_sign; }
  return out;
}
on('GET', '/wo/:id', async ({ env, user, params }) => { need(user); const wo = await loadWO(env, params.id, user); const out = await fullWO(env, wo, user); if (!BOSS.includes(user.role)) delete out.wo.report_token; return json(out); });
on('POST', '/wo/:id/update', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  const changes = [];
  if (SUPERVISE.includes(user.role) && !['sent', 'closed', 'cancelled'].includes(wo.status)) {
    const d = { client_id: numOr(body.client_id, wo.client_id), site_id: numOr(body.site_id, wo.site_id), asset_id: 'asset_id' in body ? numOr(body.asset_id) : wo.asset_id };
    await cleanRefs(env, d);
    const f = {
      title: str(body.title ?? wo.title, 160) || wo.title, description: str(body.description ?? wo.description, 4000), priority: oneOf(body.priority, PRIORITIES, wo.priority),
      discipline: oneOf(body.discipline, DISCIPLINES, wo.discipline), type: oneOf(body.type, TYPES, wo.type), due_date: 'due_date' in body ? dateOr(body.due_date) : wo.due_date,
      scheduled_date: 'scheduled_date' in body ? dateOr(body.scheduled_date) : wo.scheduled_date, est_hours: 'est_hours' in body ? numOr(body.est_hours) : wo.est_hours,
      quote: 'quote' in body ? numOr(body.quote) : wo.quote, client_ref: 'client_ref' in body ? str(body.client_ref, 80) : wo.client_ref,
      client_id: d.client_id, site_id: d.site_id, asset_id: d.asset_id,
    };
    for (const k of Object.keys(f)) if (f[k] !== wo[k] && !(f[k] == null && wo[k] == null)) changes.push(k.replace('_id', '').replace('_', ' '));
    await run(env.DB, `UPDATE work_orders SET title=?, description=?, priority=?, discipline=?, type=?, due_date=?, scheduled_date=?, est_hours=?, quote=?, client_ref=?, client_id=?, site_id=?, asset_id=? WHERE id=?`,
      f.title, f.description, f.priority, f.discipline, f.type, f.due_date, f.scheduled_date, f.est_hours, f.quote, f.client_ref, f.client_id, f.site_id, f.asset_id, wo.id);
  }
  if (['findings', 'work_done', 'recommendations'].some((k) => k in body)) {
    await needWork(env, wo, user);
    const g = { findings: 'findings' in body ? str(body.findings, 6000) : wo.findings, work_done: 'work_done' in body ? str(body.work_done, 6000) : wo.work_done, recommendations: 'recommendations' in body ? str(body.recommendations, 4000) : wo.recommendations };
    for (const k of Object.keys(g)) if ((g[k] || '') !== (wo[k] || '')) changes.push(k.replace('_', ' '));
    await run(env.DB, 'UPDATE work_orders SET findings=?, work_done=?, recommendations=? WHERE id=?', g.findings, g.work_done, g.recommendations, wo.id);
  }
  if (changes.length) await log(env, wo, user, 'edit', 'Updated ' + [...new Set(changes)].join(', ') + '.');
  return json({ ok: true });
});
on('POST', '/wo/:id/assign', async ({ env, user, params, body }) => {
  need(user, ...SUPERVISE);
  const wo = await loadWO(env, params.id, user);
  if (['completed', 'reviewed', 'approved', 'sent', 'closed', 'cancelled'].includes(wo.status)) fail(400, 'This job is past the assigning stage.');
  const d = await cleanRefs(env, { lead_id: numOr(body.lead_id), foreman_id: numOr(body.foreman_id, wo.foreman_id || (user.role === 'foreman' ? user.id : null)) });
  if (!d.lead_id) fail(400, 'Choose the lead technician.');
  const sched = dateOr(body.scheduled_date) || wo.scheduled_date;
  const status = ['requested', 'open'].includes(wo.status) ? 'assigned' : wo.status;
  await run(env.DB, 'UPDATE work_orders SET lead_id=?, foreman_id=?, scheduled_date=?, status=? WHERE id=?', d.lead_id, d.foreman_id, sched, status, wo.id);
  const lead = await one(env.DB, 'SELECT name FROM users WHERE id=?', d.lead_id);
  await run(env.DB, 'DELETE FROM wo_team WHERE wo_id=? AND user_id=?', wo.id, d.lead_id);
  await log(env, wo, user, 'assigned', `Lead technician: ${lead.name}${sched ? ', scheduled for ' + sched : ''}.${str(body.note, 500) ? ' Note: ' + str(body.note, 500) : ''}`);
  if (d.lead_id !== wo.lead_id) await notify(env, [d.lead_id], wo.id, `${wo.number}: you are the lead technician on "${wo.title}"${sched ? ' (' + sched + ')' : ''}`);
  if (wo.status === 'requested') await notify(env, await clientIds(env, wo.client_id), wo.id, `${wo.number}: your request was accepted and a technician has been assigned`);
  return json({ ok: true });
});
on('POST', '/wo/:id/team', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  if (!(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'Only the lead technician or the foreman can change the team.');
  if (['approved', 'sent', 'closed', 'cancelled'].includes(wo.status)) fail(400, 'This job is closed for changes.');
  if (body.remove) {
    const t = await one(env.DB, 'SELECT * FROM wo_team WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id);
    if (t) { await run(env.DB, 'DELETE FROM wo_team WHERE id=?', t.id); await log(env, wo, user, 'team', `Removed ${t.name} from the team.`); }
    return json({ ok: true });
  }
  const uid = numOr(body.user_id), role = str(body.role_text, 60) || 'Technician';
  let name = str(body.name, 100);
  if (uid) {
    const u = await one(env.DB, `SELECT * FROM users WHERE id=? AND status='active' AND role IN ('tech','foreman')`, uid);
    if (!u) fail(400, 'That person was not found.');
    if (u.id === wo.lead_id || await one(env.DB, 'SELECT id FROM wo_team WHERE wo_id=? AND user_id=?', wo.id, u.id)) fail(400, `${u.name} is already on this job.`);
    name = u.name;
  } else if (!name) fail(400, 'Choose a team member or type a helper\'s name.');
  await run(env.DB, 'INSERT INTO wo_team (wo_id, user_id, name, role_text, added_by) VALUES (?,?,?,?,?)', wo.id, uid, name, role, user.id);
  await log(env, wo, user, 'team', `Added ${name} (${role}) to the team.`);
  if (uid) await notify(env, [uid], wo.id, `${wo.number}: ${user.name} added you to the team for "${wo.title}"`);
  return json({ ok: true });
});
// status machine
const RULES = {
  open: { from: ['requested'], who: SUPERVISE },
  in_progress: { from: ['assigned', 'on_hold', 'completed', 'reviewed'], who: [...SUPERVISE, 'tech'] },
  on_hold: { from: ['in_progress', 'assigned'], who: [...SUPERVISE, 'tech'], note: true },
  completed: { from: ['in_progress'], who: [...SUPERVISE, 'tech'] },
  reviewed: { from: ['completed'], who: SUPERVISE },
  approved: { from: ['completed', 'reviewed'], who: BOSS },
  closed: { from: ['approved', 'sent'], who: BOSS },
  cancelled: { from: ['requested', 'open', 'assigned', 'on_hold', 'in_progress'], who: [...SUPERVISE, 'client'], note: true },
};
on('POST', '/wo/:id/status', async ({ env, user, params, body }) => {
  need(user);
  const wo = await loadWO(env, params.id, user);
  const to = body.to, rule = RULES[to], note = str(body.note, 1000);
  if (!rule) fail(400, 'Unknown status.');
  if (!rule.who.includes(user.role)) fail(403, 'Your account cannot do that.');
  if (!rule.from.includes(wo.status)) fail(400, `A job that is "${LABEL[wo.status]}" cannot move to "${LABEL[to]}".`);
  if (rule.note && !note) fail(400, 'Please add a short reason.');
  if (user.role === 'tech' && to === 'completed' && wo.lead_id !== user.id) fail(403, 'Only the lead technician can submit the job.');
  if (user.role === 'tech' && !(await onTeam(env, wo, user))) fail(403, 'You are not on this job.');
  if (user.role === 'tech' && ['completed', 'reviewed'].includes(wo.status)) fail(403, 'Only the foreman can send a job back.');
  if (user.role === 'client' && wo.status !== 'requested') fail(400, 'This job is already being worked on. Contact the manager to cancel it.');
  const set = { status: to };
  if (to === 'in_progress' && ['assigned', 'on_hold'].includes(wo.status)) {
    const open = await one(env.DB, `SELECT COUNT(*) n FROM checklist WHERE wo_id=? AND section LIKE 'Safety%' AND result NOT IN ('Pass','N/A')`, wo.id);
    if (open.n) fail(400, `Complete the safety checks before starting (${open.n} still open). Every item must be Pass or N/A.`);
    if (!wo.started_at) set.started_at = now();
  }
  if (to === 'in_progress' && ['completed', 'reviewed'].includes(wo.status) && !note) fail(400, 'Tell the technician what needs to be fixed.');
  if (to === 'completed') {
    const blank = await one(env.DB, `SELECT COUNT(*) n FROM checklist WHERE wo_id=? AND result=''`, wo.id);
    if (blank.n) fail(400, `Answer every checklist item first (${blank.n} left). Use N/A where it does not apply.`);
    const fails = await one(env.DB, `SELECT COUNT(*) n FROM checklist WHERE wo_id=? AND result='Fail' AND COALESCE(note,'')=''`, wo.id);
    if (fails.n) fail(400, 'Add a note to every failed checklist item explaining what was found.');
    if (!str(wo.work_done)) fail(400, 'Write what work was done before submitting.');
    if (!(await one(env.DB, 'SELECT id FROM time_logs WHERE wo_id=?', wo.id))) fail(400, 'Log the hours worked before submitting.');
    const sign = String(body.sign || '');
    if (!/^data:image\/png;base64,[A-Za-z0-9+/=]{200,}$/.test(sign) || sign.length > 300000) fail(400, 'Sign the job card to submit it.');
    set.tech_sign = sign; set.tech_sign_name = str(body.sign_name, 100) || user.name; set.completed_at = now();
  }
  if (to === 'reviewed') set.reviewed_at = now();
  if (to === 'approved') { set.approved_at = now(); set.approved_by = user.id; }
  const keys = Object.keys(set);
  await run(env.DB, `UPDATE work_orders SET ${keys.map((k) => k + '=?').join(', ')} WHERE id=?`, ...keys.map((k) => set[k]), wo.id);
  const back = to === 'in_progress' && ['completed', 'reviewed'].includes(wo.status);
  await log(env, wo, user, 'status', (back ? 'Sent back for rework' : `Status changed to ${LABEL[to]}`) + (note ? `: ${note}` : '.'));
  const lead = wo.lead_id ? [wo.lead_id] : [];
  const sup = wo.foreman_id ? [wo.foreman_id] : await roleIds(env, 'foreman');
  if (to === 'completed') await notify(env, sup, wo.id, `${wo.number}: "${wo.title}" was completed by ${user.name}. Please review.`);
  if (to === 'reviewed') await notify(env, await roleIds(env, 'manager', 'admin'), wo.id, `${wo.number}: reviewed by ${user.name}, ready for your approval`);
  if (to === 'on_hold') await notify(env, sup.filter((x) => x !== user.id), wo.id, `${wo.number}: on hold: ${note}`);
  if (back) await notify(env, lead, wo.id, `${wo.number}: sent back for rework: ${note}`);
  if (to === 'open') await notify(env, await clientIds(env, wo.client_id), wo.id, `${wo.number}: your request was accepted`);
  if (to === 'cancelled') await notify(env, [...lead, ...(user.role === 'client' ? await roleIds(env, 'manager') : await clientIds(env, wo.client_id))], wo.id, `${wo.number}: cancelled: ${note}`);
  await audit(env, user, 'status ' + to, wo.number);
  return json({ ok: true });
});
on('POST', '/wo/:id/release', async ({ env, user, params }) => {
  need(user, ...BOSS);
  const wo = await loadWO(env, params.id, user);
  if (!['approved', 'sent'].includes(wo.status)) fail(400, 'Approve the job before sending the report.');
  const token = wo.report_token || randHex(20);
  await run(env.DB, `UPDATE work_orders SET status='sent', report_token=?, released_at=COALESCE(released_at, ?) WHERE id=?`, token, now(), wo.id);
  if (wo.status !== 'sent') {
    await log(env, wo, user, 'sent', 'Report sent to the client.');
    await notify(env, await clientIds(env, wo.client_id), wo.id, `${wo.number}: your job report for "${wo.title}" is ready`);
  }
  return json({ token });
});
on('POST', '/wo/:id/signoff', async ({ env, user, params, body }) => {
  need(user, 'client');
  const wo = await loadWO(env, params.id, user);
  if (wo.status !== 'sent') fail(400, 'This report is not ready for sign-off.');
  const sign = String(body.sign || '');
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]{200,}$/.test(sign) || sign.length > 300000) fail(400, 'Please sign in the box.');
  const name = str(body.name, 100) || user.name, comment = str(body.comment, 1000);
  await run(env.DB, `UPDATE work_orders SET status='closed', client_sign=?, client_sign_name=?, signed_at=? WHERE id=?`, sign, name, now(), wo.id);
  await log(env, wo, user, 'signoff', `Signed off by ${name}.${comment ? ' Comment: ' + comment : ''}`);
  await notify(env, [...await roleIds(env, 'manager', 'admin'), wo.foreman_id], wo.id, `${wo.number}: ${name} signed off the job${comment ? ': ' + comment : ''}`);
  return json({ ok: true });
});
on('POST', '/wo/:id/comment', async ({ env, user, params, body }) => {
  need(user);
  const wo = await loadWO(env, params.id, user);
  const text = str(body.text, 1000);
  if (!text) fail(400, 'Type a message.');
  await log(env, wo, user, 'comment', text);
  const others = user.role === 'client' ? [wo.lead_id, wo.foreman_id, ...(await roleIds(env, 'manager'))] : [wo.lead_id, wo.foreman_id, ...(await all(env.DB, 'SELECT user_id FROM wo_team WHERE wo_id=?', wo.id)).map((r) => r.user_id)];
  if (user.role !== 'client' && body.to_client) others.push(...await clientIds(env, wo.client_id));
  await notify(env, others.filter((x) => x && x !== user.id), wo.id, `${wo.number}: ${user.name}: ${text}`);
  return json({ ok: true });
});
on('POST', '/wo/:id/checklist', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.add) {
    const item = str(body.add.item, 200), section = str(body.add.section, 80) || 'Extra checks';
    if (!item) fail(400, 'Type the check to add.');
    const mx = await one(env.DB, 'SELECT COALESCE(MAX(sort),0) m FROM checklist WHERE wo_id=? AND section NOT LIKE ?', wo.id, 'Handover%');
    await run(env.DB, 'INSERT INTO checklist (wo_id, section, item, sort) VALUES (?,?,?,?)', wo.id, section, item, mx.m + 0.5);
    await log(env, wo, user, 'checklist', `Added check: ${item}`);
    return json({ ok: true });
  }
  const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
  const stmts = items.map((i) => env.DB.prepare('UPDATE checklist SET result=?, reading=?, note=?, done_by=? WHERE id=? AND wo_id=?').bind(oneOf(i.result, ['', 'Pass', 'Fail', 'N/A'], ''), str(i.reading, 80), str(i.note, 500), user.id, Number(i.id) || 0, wo.id));
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
});
on('POST', '/wo/:id/time', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.remove) {
    const t = await one(env.DB, 'SELECT * FROM time_logs WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id);
    if (t && (t.added_by === user.id || SUPERVISE.includes(user.role) || wo.lead_id === user.id)) await run(env.DB, 'DELETE FROM time_logs WHERE id=?', t.id);
    return json({ ok: true });
  }
  const hours = numOr(body.hours);
  if (!(hours > 0 && hours <= 24)) fail(400, 'Enter hours between 0.25 and 24.');
  const date = dateOr(body.date) || today();
  let uid = numOr(body.user_id), worker;
  if (body.team_id) { const t = await one(env.DB, 'SELECT * FROM wo_team WHERE id=? AND wo_id=?', Number(body.team_id), wo.id); if (!t) fail(400, 'Team member not found.'); uid = t.user_id; worker = t.name; }
  if (!worker) {
    if (uid && uid !== user.id) {
      if (!(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'You can only log your own hours.');
      const u = await one(env.DB, 'SELECT name FROM users WHERE id=?', uid); if (!u) fail(400, 'Person not found.'); worker = u.name;
    } else { uid = user.id; worker = user.name; }
  } else if (uid !== user.id && !(wo.lead_id === user.id || SUPERVISE.includes(user.role))) fail(403, 'You can only log your own hours.');
  await run(env.DB, 'INSERT INTO time_logs (wo_id, user_id, worker, date, hours, note, added_by) VALUES (?,?,?,?,?,?,?)', wo.id, uid, worker, date, hours, str(body.note, 300), user.id);
  await log(env, wo, user, 'time', `${hours} h logged for ${worker} on ${date}.`);
  return json({ ok: true });
});
on('POST', '/wo/:id/material', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.remove) { await run(env.DB, 'DELETE FROM materials WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id); return json({ ok: true }); }
  const item = str(body.item, 200), qty = numOr(body.qty);
  if (!item) fail(400, 'Type the material or part.');
  if (!(qty > 0)) fail(400, 'Enter the quantity used.');
  await run(env.DB, 'INSERT INTO materials (wo_id, item, qty, unit, unit_cost, added_by) VALUES (?,?,?,?,?,?)', wo.id, item, qty, str(body.unit, 20) || 'each', Math.max(0, numOr(body.unit_cost, 0)), user.id);
  await log(env, wo, user, 'material', `Used ${qty} ${str(body.unit, 20) || 'each'} ${item}.`);
  return json({ ok: true });
});
on('POST', '/wo/:id/photo', async ({ env, user, params, body }) => {
  need(user, ...STAFF);
  const wo = await loadWO(env, params.id, user);
  await needWork(env, wo, user);
  if (body.remove) { const p = await one(env.DB, 'SELECT * FROM photos WHERE id=? AND wo_id=?', Number(body.remove) || 0, wo.id); if (p && (p.user_id === user.id || SUPERVISE.includes(user.role))) await run(env.DB, 'DELETE FROM photos WHERE id=?', p.id); return json({ ok: true }); }
  const data = String(body.data || '');
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data)) fail(400, 'That photo could not be read. Try another one.');
  if (data.length > 900000) fail(400, 'That photo is too big. Try again; the app shrinks photos before upload.');
  const cnt = await one(env.DB, 'SELECT COUNT(*) n FROM photos WHERE wo_id=?', wo.id);
  if (cnt.n >= 30) fail(400, 'This job already has 30 photos.');
  await run(env.DB, 'INSERT INTO photos (wo_id, user_id, caption, stage, data) VALUES (?,?,?,?,?)', wo.id, user.id, str(body.caption, 200), oneOf(body.stage, ['Before', 'During', 'After', 'Defect'], 'During'), data);
  await log(env, wo, user, 'photo', `Added a photo${str(body.caption, 200) ? ': ' + str(body.caption, 200) : ''}.`);
  return json({ ok: true });
});
function photoResponse(p) {
  const m = p.data.match(/^data:(image\/\w+);base64,(.*)$/);
  const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  return new Response(bin, { headers: { 'content-type': m[1], 'cache-control': 'private, max-age=86400' } });
}
on('GET', '/photo/:id', async ({ env, user, params, url }) => {
  const p = await one(env.DB, 'SELECT * FROM photos WHERE id=?', Number(params.id) || 0);
  if (!p) fail(404, 'Photo not found.');
  const t = url.searchParams.get('t');
  if (t) { const wo = await one(env.DB, `SELECT id FROM work_orders WHERE id=? AND report_token=? AND status IN ('sent','closed')`, p.wo_id, t); if (!wo) fail(404, 'Photo not found.'); return photoResponse(p); }
  need(user); await loadWO(env, p.wo_id, user);
  return photoResponse(p);
});
/* reports */
on('GET', '/report/:id', async ({ env, user, params }) => {
  need(user);
  const wo = await loadWO(env, params.id, user);
  if (user.role === 'client' && !['sent', 'closed'].includes(wo.status)) fail(403, 'The report will be available once the manager sends it.');
  const out = await fullWO(env, wo, user, true);
  out.settings = await settings(env);
  out.draft = !['approved', 'sent', 'closed'].includes(wo.status);
  out.wo.tech_sign = wo.tech_sign;
  return json(out);
});
on('GET', '/public/report/:token', async ({ env, params }) => {
  if (!/^[a-f0-9]{40}$/.test(params.token)) fail(404, 'Report not found.');
  const wo = await one(env.DB, `SELECT * FROM work_orders WHERE report_token=? AND status IN ('sent','closed')`, params.token);
  if (!wo) fail(404, 'Report not found or no longer shared.');
  const out = await fullWO(env, wo, null, true);
  out.settings = await settings(env);
  out.wo.tech_sign = wo.tech_sign;
  out.token = params.token;
  return json(out);
});

/* admin: users */
on('GET', '/users', async ({ env, user }) => { need(user, ...BOSS); return json({ items: await all(env.DB, `SELECT u.id, u.email, u.name, u.phone, u.role, u.trade, u.client_id, u.status, u.last_login, u.must_change, c.name AS client FROM users u LEFT JOIN clients c ON c.id=u.client_id ORDER BY u.status, u.role, u.name`) }); });
on('POST', '/users', async ({ env, user, body }) => {
  need(user, ...BOSS);
  const email = str(body.email, 200).toLowerCase(), name = str(body.name, 100), role = oneOf(body.role, ROLES, null);
  if (!name) fail(400, 'Enter the person\'s name.');
  if (!emailOk(email)) fail(400, 'Enter a valid email address.');
  if (!role) fail(400, 'Choose a role.');
  if (role === 'admin' && user.role !== 'admin') fail(403, 'Only an admin can create another admin.');
  const clientId = role === 'client' ? numOr(body.client_id) : null;
  if (role === 'client' && !(clientId && await one(env.DB, 'SELECT id FROM clients WHERE id=?', clientId))) fail(400, 'Choose which client company this person belongs to.');
  if (await one(env.DB, 'SELECT id FROM users WHERE email=?', email)) fail(409, 'That email already has an account.');
  const pw = tempPassword(); const { hash, salt } = await hashPassword(pw);
  await run(env.DB, 'INSERT INTO users (email, name, phone, role, trade, client_id, pass_hash, pass_salt, must_change) VALUES (?,?,?,?,?,?,?,?,1)', email, name, str(body.phone, 40), role, role === 'client' ? null : str(body.trade, 40), clientId, hash, salt);
  await audit(env, user, 'created user', `${email} (${role})`);
  return json({ password: pw }, 201);
});
on('POST', '/users/:id', async ({ env, user, params, body }) => {
  need(user, ...BOSS);
  const u = await one(env.DB, 'SELECT * FROM users WHERE id=?', Number(params.id) || 0);
  if (!u) fail(404, 'User not found.');
  if (u.role === 'admin' && user.role !== 'admin') fail(403, 'Only an admin can change an admin.');
  if (body.reset) {
    const pw = tempPassword(); const { hash, salt } = await hashPassword(pw);
    await run(env.DB, 'UPDATE users SET pass_hash=?, pass_salt=?, must_change=1, failed=0, locked_until=NULL WHERE id=?', hash, salt, u.id);
    await run(env.DB, 'DELETE FROM sessions WHERE user_id=?', u.id);
    await audit(env, user, 'reset password', u.email);
    return json({ password: pw });
  }
  const role = oneOf(body.role, ROLES, u.role);
  if (role === 'admin' && user.role !== 'admin') fail(403, 'Only an admin can make someone an admin.');
  const status = oneOf(body.status, ['active', 'disabled'], u.status);
  if (u.id === user.id && (status !== 'active' || role !== u.role)) fail(400, 'You cannot switch off or change your own role.');
  await run(env.DB, 'UPDATE users SET name=?, phone=?, role=?, trade=?, client_id=?, status=? WHERE id=?', str(body.name, 100) || u.name, str(body.phone ?? u.phone, 40), role, role === 'client' ? null : str(body.trade ?? u.trade, 40), role === 'client' ? numOr(body.client_id, u.client_id) : null, status, u.id);
  if (status !== 'active') await run(env.DB, 'DELETE FROM sessions WHERE user_id=?', u.id);
  await audit(env, user, 'updated user', u.email);
  return json({ ok: true });
});

/* admin: clients, sites, assets, PM plans */
on('GET', '/clients', async ({ env, user }) => {
  need(user, ...SUPERVISE);
  return json({
    items: await all(env.DB, `SELECT c.*, (SELECT COUNT(*) FROM sites s WHERE s.client_id=c.id) AS sites, (SELECT COUNT(*) FROM work_orders w WHERE w.client_id=c.id AND w.status NOT IN ('closed','cancelled')) AS open_jobs,
      (SELECT COUNT(*) FROM users u WHERE u.client_id=c.id) AS logins FROM clients c ORDER BY c.name`),
    sites: await all(env.DB, `SELECT s.*, (SELECT COUNT(*) FROM assets a WHERE a.site_id=s.id) AS assets FROM sites s ORDER BY s.name`),
  });
});
on('POST', '/clients', async ({ env, user, body }) => {
  need(user, ...BOSS);
  const f = [str(body.name, 120), str(body.contact, 100), str(body.email, 200), str(body.phone, 40), str(body.address, 300), str(body.notes, 1000)];
  if (!f[0]) fail(400, 'Enter the client company name.');
  if (body.id) await run(env.DB, 'UPDATE clients SET name=?, contact=?, email=?, phone=?, address=?, notes=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO clients (name, contact, email, phone, address, notes) VALUES (?,?,?,?,?,?)', ...f);
  return json({ ok: true });
});
on('POST', '/sites', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const name = str(body.name, 120), cid = numOr(body.client_id);
  if (!name) fail(400, 'Enter the site name.');
  if (!cid || !(await one(env.DB, 'SELECT id FROM clients WHERE id=?', cid))) fail(400, 'Choose the client.');
  if (body.id) await run(env.DB, 'UPDATE sites SET name=?, address=?, client_id=? WHERE id=?', name, str(body.address, 300), cid, Number(body.id));
  else await run(env.DB, 'INSERT INTO sites (client_id, name, address) VALUES (?,?,?)', cid, name, str(body.address, 300));
  return json({ ok: true });
});
on('GET', '/assets', async ({ env, user }) => {
  need(user);
  const where = user.role === 'client' ? ' WHERE s.client_id=?' : '';
  const b = user.role === 'client' ? [user.client_id || -1] : [];
  return json({ items: await all(env.DB, `SELECT a.*, s.name AS site, c.name AS client, c.id AS client_id,
    (SELECT COUNT(*) FROM work_orders w WHERE w.asset_id=a.id) AS jobs, (SELECT MAX(substr(completed_at,1,10)) FROM work_orders w WHERE w.asset_id=a.id) AS last_job,
    (SELECT MIN(next_due) FROM pm_plans p WHERE p.asset_id=a.id AND p.active=1) AS next_pm
    FROM assets a JOIN sites s ON s.id=a.site_id JOIN clients c ON c.id=s.client_id${where} ORDER BY c.name, a.tag`, ...b) });
});
on('POST', '/assets', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  const tag = str(body.tag, 40), name = str(body.name, 120), sid = numOr(body.site_id);
  if (!tag || !name) fail(400, 'Enter the asset tag and name.');
  if (!sid || !(await one(env.DB, 'SELECT id FROM sites WHERE id=?', sid))) fail(400, 'Choose the site.');
  const f = [sid, tag, name, oneOf(body.discipline, DISCIPLINES, 'Electrical'), str(body.make, 80), str(body.model, 80), str(body.serial, 80), str(body.rating, 80), oneOf(body.criticality, ['A', 'B', 'C'], 'B'), str(body.notes, 500)];
  if (body.id) await run(env.DB, 'UPDATE assets SET site_id=?, tag=?, name=?, discipline=?, make=?, model=?, serial=?, rating=?, criticality=?, notes=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO assets (site_id, tag, name, discipline, make, model, serial, rating, criticality, notes) VALUES (?,?,?,?,?,?,?,?,?,?)', ...f);
  return json({ ok: true });
});
on('GET', '/pm', async ({ env, user }) => { need(user, ...SUPERVISE); return json({ items: await all(env.DB, `SELECT p.*, a.tag, a.name AS asset, s.name AS site, c.name AS client, f.name AS foreman FROM pm_plans p JOIN assets a ON a.id=p.asset_id JOIN sites s ON s.id=a.site_id JOIN clients c ON c.id=s.client_id LEFT JOIN users f ON f.id=p.foreman_id ORDER BY p.active DESC, p.next_due`) }); });
on('POST', '/pm', async ({ env, user, body }) => {
  need(user, ...SUPERVISE);
  if (body.generate) return json({ created: await generatePM(env, user) });
  const aid = numOr(body.asset_id), every = Math.round(numOr(body.every_days, 0)), title = str(body.title, 120), next = dateOr(body.next_due);
  if (!aid || !(await one(env.DB, 'SELECT id FROM assets WHERE id=?', aid))) fail(400, 'Choose the asset.');
  if (!title) fail(400, 'Enter what the planned job is, for example "Monthly motor inspection".');
  if (!(every >= 1 && every <= 3650)) fail(400, 'Enter how often in days (for example 30).');
  if (!next) fail(400, 'Choose when it is next due.');
  const f = [aid, title, oneOf(body.discipline, DISCIPLINES, 'Electrical'), oneOf(body.type, TYPES, 'Preventive maintenance'), every, next, numOr(body.foreman_id), numOr(body.est_hours), body.active === false || body.active === 0 ? 0 : 1];
  if (body.id) await run(env.DB, 'UPDATE pm_plans SET asset_id=?, title=?, discipline=?, type=?, every_days=?, next_due=?, foreman_id=?, est_hours=?, active=? WHERE id=?', ...f, Number(body.id));
  else await run(env.DB, 'INSERT INTO pm_plans (asset_id, title, discipline, type, every_days, next_due, foreman_id, est_hours, active) VALUES (?,?,?,?,?,?,?,?,?)', ...f);
  return json({ ok: true });
});
/* settings */
on('POST', '/settings', async ({ env, user, body }) => {
  need(user, ...BOSS);
  const stmts = [];
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in body) {
    let v = str(body[k], k === 'logo' ? 400000 : 600);
    if (k === 'logo' && v && !/^data:image\/(png|jpeg|webp);base64,/.test(v) && !/^https:\/\//.test(v) && !/^\/[\w/.-]+$/.test(v)) fail(400, 'The logo must be an uploaded image or a link.');
    if (k === 'color' && !/^#[0-9a-fA-F]{6}$/.test(v)) v = DEFAULT_SETTINGS.color;
    stmts.push(env.DB.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, v));
  }
  if (stmts.length) await env.DB.batch(stmts);
  await audit(env, user, 'changed settings', null);
  return json({ ok: true });
});
/* exports */
const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? '"' + (/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""') + '"' : s; };
on('GET', '/export/:kind', async ({ env, user, params, url }) => {
  need(user, ...SUPERVISE);
  const from = dateOr(url.searchParams.get('from')) || '2000-01-01', to = dateOr(url.searchParams.get('to')) || '2999-12-31';
  const s = await settings(env); const rate = Number(s.labour_rate) || 0;
  const Q = {
    workorders: [`SELECT w.number AS "Work order", substr(w.created_at,1,10) AS "Created", w.status AS "Status", w.priority AS "Priority", w.discipline AS "Discipline", w.type AS "Type", w.title AS "Title",
      c.name AS "Client", s.name AS "Site", a.tag AS "Asset", f.name AS "Foreman", l.name AS "Lead technician", w.due_date AS "Due", w.scheduled_date AS "Scheduled", substr(w.completed_at,1,10) AS "Completed",
      (SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id) AS "Hours", (SELECT ROUND(COALESCE(SUM(qty*unit_cost),0),2) FROM materials m WHERE m.wo_id=w.id) AS "Materials cost",
      ROUND((SELECT COALESCE(SUM(hours),0) FROM time_logs t WHERE t.wo_id=w.id)*${rate} + (SELECT COALESCE(SUM(qty*unit_cost),0) FROM materials m WHERE m.wo_id=w.id),2) AS "Job value (ex VAT)"
      FROM work_orders w LEFT JOIN clients c ON c.id=w.client_id LEFT JOIN sites s ON s.id=w.site_id LEFT JOIN assets a ON a.id=w.asset_id LEFT JOIN users f ON f.id=w.foreman_id LEFT JOIN users l ON l.id=w.lead_id
      WHERE substr(w.created_at,1,10) BETWEEN ? AND ? ORDER BY w.id DESC`],
    timesheets: [`SELECT t.date AS "Date", t.worker AS "Worker", t.hours AS "Hours", w.number AS "Work order", w.title AS "Job", c.name AS "Client", t.note AS "Note"
      FROM time_logs t JOIN work_orders w ON w.id=t.wo_id LEFT JOIN clients c ON c.id=w.client_id WHERE t.date BETWEEN ? AND ? ORDER BY t.date, t.worker`],
    materials: [`SELECT substr(m.created_at,1,10) AS "Date", w.number AS "Work order", c.name AS "Client", m.item AS "Item", m.qty AS "Qty", m.unit AS "Unit", m.unit_cost AS "Unit cost", ROUND(m.qty*m.unit_cost,2) AS "Total"
      FROM materials m JOIN work_orders w ON w.id=m.wo_id LEFT JOIN clients c ON c.id=w.client_id WHERE substr(m.created_at,1,10) BETWEEN ? AND ? ORDER BY m.id`],
  }[params.kind];
  if (!Q) fail(404, 'Unknown export.');
  const rows = await all(env.DB, Q[0], from, to);
  const head = [...Q[0].matchAll(/ AS "([^"]+)"/g)].map((m) => m[1]);
  const csv = [head.map(csvCell).join(','), ...rows.map((r) => head.map((h) => csvCell(r[h])).join(','))].join('\r\n');
  return new Response('﻿' + csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${params.kind}-${from}-to-${to}.csv"`, 'cache-control': 'no-store' } });
});
on('GET', '/audit', async ({ env, user }) => { need(user, ...BOSS); return json({ items: await all(env.DB, 'SELECT * FROM audit ORDER BY id DESC LIMIT 200') }); });

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
      return await r.handler({ env, req: request, url, body, user, params: m.groups || {}, secure });
    }
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
  }
}
