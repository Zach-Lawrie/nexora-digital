// CarePoint Admin API: sign-in, role permissions, offline sync, users, backup.
// Data lives in one D1 table of documents. Each write bumps a sequence number so devices can pull only what changed.

const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const rid = (n = 16) => hex(crypto.getRandomValues(new Uint8Array(n)));
async function hashPw(pw, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, k, 256));
}
const J = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...h } });
const E = (msg, s = 400) => J({ error: msg }, s);
const now = () => new Date().toISOString();

/* ---------------- roles and permissions ---------------- */
const ROLES = {
  admin: 'Administrator', nic: 'Nurse in charge', store: 'Storekeeper', kiosk: 'Kiosk attendant',
  accounts: 'Accounts & claims', dept: 'Department staff', transport: 'Transport officer', records: 'Records clerk',
};
const ALL = Object.keys(ROLES);
const MONEY = ['admin', 'accounts'];
const STOCKCOST = ['admin', 'store', 'accounts', 'kiosk'];
const isKiosk = (d) => d && (d.cat === 'kiosk');
const ownDept = (d, u) => d && u.dept && d.dept === u.dept;
const ownEmp = (d, u) => d && u.emp && d.emp === u.emp;
// r/w: roles allowed. scope: per-role rule a document must pass. strip: field -> roles allowed to see it.
const COLS = {
  settings: { r: ALL, w: ['admin'] },
  items: { r: ALL, w: ['admin', 'store', 'kiosk'], wscope: { kiosk: isKiosk }, strip: { price: STOCKCOST, cost: STOCKCOST } },
  moves: { r: ['admin', 'store', 'nic', 'accounts', 'kiosk', 'dept'], w: ['admin', 'store', 'kiosk', 'nic'], scope: { kiosk: isKiosk }, wscope: { kiosk: isKiosk, nic: (d) => d.type === 'out' }, strip: { unit_price: STOCKCOST, total: STOCKCOST, amount: STOCKCOST, patient: ['admin', 'store', 'nic', 'accounts', 'kiosk'], taken_by: ['admin', 'store', 'nic', 'accounts', 'kiosk'], received_by: ['admin', 'store', 'nic', 'accounts', 'kiosk'], note: ['admin', 'store', 'nic', 'accounts', 'kiosk'], invoice: ['admin', 'store', 'nic', 'accounts', 'kiosk'], batch: ['admin', 'store', 'nic', 'accounts', 'kiosk'] } },
  counts: { r: ['admin', 'store', 'nic', 'accounts', 'kiosk'], w: ['admin', 'store', 'nic', 'kiosk'], scope: { kiosk: isKiosk }, wscope: { kiosk: isKiosk } },
  suppliers: { r: ['admin', 'store', 'accounts', 'kiosk'], w: ['admin', 'store'] },
  orders: { r: ['admin', 'store', 'accounts'], w: ['admin', 'store'] },
  requests: { r: ['admin', 'store', 'nic', 'dept'], w: ['admin', 'store', 'nic', 'dept'], scope: { dept: ownDept }, wscope: { dept: (d, u) => ownDept(d, u) && ['pending', 'cancelled'].includes(d.status) } },
  deptuse: { r: ['admin', 'store', 'nic', 'dept'], w: ['admin', 'nic', 'dept'], scope: { dept: ownDept }, wscope: { dept: ownDept } },
  theatres: { r: ['admin', 'accounts', 'nic', 'records'], w: ['admin', 'accounts', 'nic', 'records'], strip: { paid: MONEY, claimed: MONEY, aid_paid: MONEY, admit_amount: MONEY, payments: MONEY } },
  claims: { r: MONEY, w: MONEY },
  cash: { r: MONEY, w: MONEY },
  cashclose: { r: MONEY, w: MONEY },
  assets: { r: ['admin', 'store', 'nic', 'accounts', 'transport'], w: ['admin', 'store'], strip: { cost: MONEY } },
  repairs: { r: ALL, w: ALL },
  vehicles: { r: ['admin', 'transport', 'accounts'], w: ['admin', 'transport'] },
  fuel: { r: ['admin', 'transport', 'accounts'], w: ['admin', 'transport'] },
  trips: { r: ['admin', 'transport', 'accounts'], w: ['admin', 'transport'] },
  employees: { r: ['admin', 'nic'], w: ['admin'], strip: { id_number: ['admin'], nok_phone: ['admin', 'nic'], salary: ['admin'] } },
  leave: { r: ['admin', 'nic'], w: ['admin', 'nic'] },
  attendance: { r: ALL, w: ALL, scope: Object.fromEntries(ALL.filter((r) => !['admin', 'nic'].includes(r)).map((r) => [r, ownEmp])), wscope: Object.fromEntries(ALL.filter((r) => !['admin', 'nic'].includes(r)).map((r) => [r, ownEmp])) },
  meetings: { r: ['admin', 'nic', 'accounts', 'store'], w: ['admin', 'nic'] },
  goals: { r: ['admin', 'nic'], w: ['admin'] },
  patients: { r: ['admin', 'nic', 'records', 'accounts', 'dept'], w: ['admin', 'nic', 'records', 'dept'], scope: { dept: ownDept }, wscope: { dept: ownDept } },
  births: { r: ['admin', 'nic', 'records', 'dept'], w: ['admin', 'nic', 'records', 'dept'] },
  licences: { r: ['admin', 'nic', 'store', 'accounts'], w: ['admin'], strip: { cost: MONEY } },
};
const canR = (col, u, d) => { const c = COLS[col]; if (!c || !c.r.includes(u.role)) return false; const f = c.scope && c.scope[u.role]; return !f || !d || f(d, u); };
const canW = (col, u, d) => { const c = COLS[col]; if (!c || !c.w.includes(u.role)) return false; const f = (c.wscope && c.wscope[u.role]) || (c.scope && c.scope[u.role]); return !f || f(d, u); };
function strip(col, u, d) {
  const s = COLS[col].strip; if (!s || !d) return d;
  const o = { ...d }; for (const [k, roles] of Object.entries(s)) if (!roles.includes(u.role)) delete o[k];
  return o;
}
// keep hidden fields when a role that cannot see them saves the document
function keepHidden(col, u, oldD, newD) {
  const s = COLS[col].strip; if (!s || !oldD) return newD;
  for (const [k, roles] of Object.entries(s)) if (!roles.includes(u.role) && k in oldD) newD[k] = oldD[k];
  return newD;
}
const PERMS = Object.fromEntries(Object.entries(COLS).map(([k, c]) => [k, { r: c.r, w: c.w }]));

/* ---------------- helpers ---------------- */
async function nextSeq(env) {
  const r = await env.DB.prepare("INSERT INTO meta(k,v) VALUES('seq','1') ON CONFLICT(k) DO UPDATE SET v=CAST(v AS INTEGER)+1 RETURNING v").first();
  return Number(r.v);
}
async function audit(env, u, action, col, id, detail) {
  await env.DB.prepare('INSERT INTO audit(user_id,user_name,action,col,doc_id,detail) VALUES(?,?,?,?,?,?)').bind(u ? u.id : null, u ? u.name : null, action, col || null, id || null, detail ? String(detail).slice(0, 500) : null).run();
}
function cookie(token, maxAge) { return `cp_s=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`; }
const pubUser = (u) => ({ id: u.id, name: u.name, username: u.username, role: u.role, dept: u.dept || '', emp: u.emp || '', active: !!u.active, must_change: !!u.must_change, last_login: u.last_login, created_at: u.created_at });
async function currentUser(env, req) {
  const m = /(?:^|;\s*)cp_s=([a-f0-9]{64})/.exec(req.headers.get('cookie') || ''); if (!m) return null;
  const s = await env.DB.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1').bind(m[1], Date.now()).first();
  return s ? { ...s, token: m[1] } : null;
}
async function body(req) { try { const t = await req.text(); if (t.length > 4e6) throw 0; return t ? JSON.parse(t) : {}; } catch (e) { return null; } }
const clean = (s, n = 120) => String(s ?? '').trim().slice(0, n);
async function makeUser(env, b, by) {
  const username = clean(b.username, 40).toLowerCase(), name = clean(b.name, 80), role = b.role;
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) throw new Error('Username: 3 to 40 letters, numbers, dot or dash.');
  if (!name) throw new Error('Enter the person’s name.');
  if (!ROLES[role]) throw new Error('Choose a role.');
  if (role === 'dept' && !clean(b.dept)) throw new Error('Department staff need a department.');
  const pw = b.password || rid(4);
  if (pw.length < 8) throw new Error('Password must be at least 8 characters.');
  const salt = rid(8), id = 'u' + rid(6);
  await env.DB.prepare('INSERT INTO users(id,name,username,pass,salt,role,dept,emp,must_change) VALUES(?,?,?,?,?,?,?,?,1)')
    .bind(id, name, username, await hashPw(pw, salt), salt, role, clean(b.dept) || null, clean(b.emp, 40) || null).run();
  await audit(env, by, 'user.create', 'users', id, `${username} (${role})`);
  return { id, password: pw };
}

/* ---------------- routes ---------------- */
async function handle(req, env, H) {
  const url = new URL(req.url), p = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, ''), m = req.method;
  if (m !== 'GET' && m !== 'HEAD') {
    const o = req.headers.get('origin'); if (o && new URL(o).host !== url.host) return E('Cross-site request blocked.', 403);
    if (!/application\/json/.test(req.headers.get('content-type') || '')) return E('Send JSON.', 415);
  }

  if (p === 'setup' && m === 'GET') { const n = await env.DB.prepare('SELECT COUNT(*) n FROM users').first(); return J({ needed: !n.n }); }
  if (p === 'setup' && m === 'POST') {
    const n = await env.DB.prepare('SELECT COUNT(*) n FROM users').first(); if (n.n) return E('Already set up.', 409);
    const b = await body(req); if (!b) return E('Bad request.');
    if (!env.SETUP_CODE || b.code !== env.SETUP_CODE) return E('Wrong setup code.', 403);
    try { await makeUser(env, { ...b, role: 'admin' }, null); } catch (e) { return E(e.message); }
    await env.DB.prepare("UPDATE users SET must_change=0 WHERE role='admin'").run();
    return J({ ok: true });
  }
  if (p === 'login' && m === 'POST') {
    const b = await body(req); if (!b) return E('Bad request.');
    const username = clean(b.username, 40).toLowerCase(), fk = 'fail:' + username;
    const f = await env.DB.prepare('SELECT v FROM meta WHERE k=?').bind(fk).first();
    const fails = f ? JSON.parse(f.v) : { n: 0, t: 0 };
    if (fails.n >= 8 && Date.now() - fails.t < 15 * 60e3) return E('Too many wrong passwords. Wait 15 minutes, or ask the administrator to reset it.', 429);
    const u = await env.DB.prepare('SELECT * FROM users WHERE username=?').bind(username).first();
    if (!u || !u.active || (await hashPw(String(b.password || ''), u.salt)) !== u.pass) {
      await env.DB.prepare('INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(fk, JSON.stringify({ n: (Date.now() - fails.t < 15 * 60e3 ? fails.n : 0) + 1, t: Date.now() })).run();
      return E('Wrong username or password.', 401);
    }
    await env.DB.prepare('DELETE FROM meta WHERE k=?').bind(fk).run();
    const token = rid(32), days = 30;
    await env.DB.prepare('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)').bind(token, u.id, Date.now() + days * 864e5).run();
    await env.DB.prepare('UPDATE users SET last_login=? WHERE id=?').bind(now(), u.id).run();
    await env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(Date.now()).run();
    await audit(env, u, 'login');
    return J({ user: pubUser(u) }, 200, { 'set-cookie': cookie(token, days * 86400) });
  }

  const u = await currentUser(env, req);
  if (p === 'logout' && m === 'POST') { if (u) await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(u.token).run(); return J({ ok: true }, 200, { 'set-cookie': cookie('', 0) }); }
  if (!u) return E('Please sign in.', 401);

  if (p === 'me' && m === 'GET') return J({ hospital: H, user: pubUser(u), roles: ROLES, perms: PERMS, money: MONEY.includes(u.role), stockcost: STOCKCOST.includes(u.role), now: now() });
  if (p === 'password' && m === 'POST') {
    const b = await body(req); if (!b) return E('Bad request.');
    if ((await hashPw(String(b.old || ''), u.salt)) !== u.pass) return E('Your current password is wrong.', 403);
    if (String(b.password || '').length < 8) return E('New password must be at least 8 characters.');
    const salt = rid(8);
    await env.DB.prepare('UPDATE users SET pass=?, salt=?, must_change=0 WHERE id=?').bind(await hashPw(b.password, salt), salt, u.id).run();
    await env.DB.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?').bind(u.id, u.token).run();
    await audit(env, u, 'password.change'); return J({ ok: true });
  }
  if (u.must_change) return E('Change your password first.', 403);

  /* ---- sync: pull ---- */
  if (p === 'sync' && m === 'GET') {
    const since = Math.max(0, Number(url.searchParams.get('since')) || 0);
    const rows = (await env.DB.prepare('SELECT col,id,data,seq,deleted,updated_at,updated_by FROM docs WHERE seq>? ORDER BY seq LIMIT 3000').bind(since).all()).results;
    const out = []; let last = since;
    for (const r of rows) {
      last = r.seq; if (!COLS[r.col]) continue;
      const d = JSON.parse(r.data);
      if (!canR(r.col, u, d)) { if (COLS[r.col].r.includes(u.role)) out.push({ col: r.col, id: r.id, deleted: 1, seq: r.seq }); continue; }
      out.push({ col: r.col, id: r.id, data: r.deleted ? null : strip(r.col, u, d), deleted: r.deleted, at: r.updated_at, by: r.updated_by, seq: r.seq });
    }
    return J({ docs: out, last, more: rows.length === 3000, now: now() });
  }
  /* ---- sync: push ---- */
  if (p === 'sync' && m === 'POST') {
    const b = await body(req); if (!b || !Array.isArray(b.ops)) return E('Bad request.');
    const results = [];
    for (const op of b.ops.slice(0, 500)) {
      const col = String(op.col || ''), id = String(op.id || '');
      if (!COLS[col] || !/^[A-Za-z0-9_.:-]{1,64}$/.test(id)) { results.push({ id, ok: false, error: 'Unknown record type.' }); continue; }
      const old = await env.DB.prepare('SELECT data,deleted FROM docs WHERE col=? AND id=?').bind(col, id).first();
      const oldD = old ? JSON.parse(old.data) : null;
      if (oldD && !canW(col, u, oldD)) { results.push({ id, col, ok: false, error: 'You are not allowed to change this.' }); continue; }
      let data;
      if (op.deleted) {
        if (!old) { results.push({ id, col, ok: true }); continue; }
        if (!['admin'].includes(u.role) && !(oldD && oldD.by === u.id && Date.now() - new Date(oldD.at || 0) < 864e5)) { results.push({ id, col, ok: false, error: 'Only the administrator can delete records older than a day.' }); continue; }
        data = oldD;
      } else {
        data = op.data && typeof op.data === 'object' ? { ...op.data } : null;
        if (!data) { results.push({ id, col, ok: false, error: 'Empty record.' }); continue; }
        data = keepHidden(col, u, oldD, data);
        if (!oldD) { data.by = u.id; data.by_name = u.name; data.at = data.at || now(); }
        else { data.by = oldD.by; data.by_name = oldD.by_name; data.at = oldD.at; }
        data.edited_by = u.name; data.edited_at = now();
        if (!canW(col, u, data)) { results.push({ id, col, ok: false, error: 'You are not allowed to save this.' }); continue; }
        if (JSON.stringify(data).length > 200000) { results.push({ id, col, ok: false, error: 'Record too large.' }); continue; }
      }
      const seq = await nextSeq(env);
      await env.DB.prepare('INSERT INTO docs(col,id,data,seq,deleted,updated_at,updated_by) VALUES(?,?,?,?,?,?,?) ON CONFLICT(col,id) DO UPDATE SET data=excluded.data, seq=excluded.seq, deleted=excluded.deleted, updated_at=excluded.updated_at, updated_by=excluded.updated_by')
        .bind(col, id, JSON.stringify(data), seq, op.deleted ? 1 : 0, now(), u.name).run();
      await audit(env, u, op.deleted ? 'delete' : old ? 'edit' : 'create', col, id, op.note || data.name || data.title || data.item_name || '');
      results.push({ id, col, ok: true, seq, data: op.deleted ? null : strip(col, u, data) });
    }
    return J({ results });
  }


  /* ---- file attachments (scans and photos of licences), stored in D1 in pieces ---- */
  let fm;
  if (p === 'files/start' && m === 'POST') {
    const b = await body(req); if (!b) return E('Bad request.');
    const col = String(b.col || ''), docId = String(b.doc_id || '');
    if (!COLS[col]) return E('Unknown record type.');
    const d = await env.DB.prepare('SELECT data FROM docs WHERE col=? AND id=? AND deleted=0').bind(col, docId).first();
    if (!d) return E('Save the record first (it must reach the server before you attach files).', 409);
    if (!canW(col, u, JSON.parse(d.data))) return E('You are not allowed to attach files here.', 403);
    const size = Number(b.size) || 0; if (size <= 0 || size > 15 * 1048576) return E('Files must be smaller than 15 MB.');
    const id = 'f' + rid(8);
    await env.DB.prepare('INSERT INTO files(id,col,doc_id,name,mime,size,chunks,complete,by_name) VALUES(?,?,?,?,?,?,0,0,?)').bind(id, col, docId, clean(b.name, 140) || 'file', clean(b.mime, 80) || 'application/octet-stream', size, u.name).run();
    return J({ id });
  }
  if ((fm = /^files\/(f[a-f0-9]{16})\/(chunk|finish|delete)$/.exec(p)) && m === 'POST') {
    const fr = await env.DB.prepare('SELECT * FROM files WHERE id=?').bind(fm[1]).first(); if (!fr) return E('File not found.', 404);
    const d = await env.DB.prepare('SELECT data FROM docs WHERE col=? AND id=?').bind(fr.col, fr.doc_id).first();
    if (!d || !canW(fr.col, u, JSON.parse(d.data))) return E('Not allowed.', 403);
    if (fm[2] === 'chunk') {
      const b = await body(req); if (!b || typeof b.b64 !== 'string') return E('Bad request.');
      const n = Number(b.n); if (!(n >= 0 && n < 40)) return E('Bad piece number.');
      const bin = Uint8Array.from(atob(b.b64), (c) => c.charCodeAt(0)); if (bin.length > 800000) return E('Piece too large.');
      await env.DB.prepare('INSERT OR REPLACE INTO file_chunks(file_id,n,data) VALUES(?,?,?)').bind(fr.id, n, bin).run();
      return J({ ok: true });
    }
    if (fm[2] === 'finish') {
      const c = await env.DB.prepare('SELECT COUNT(*) n, COALESCE(SUM(LENGTH(data)),0) s FROM file_chunks WHERE file_id=?').bind(fr.id).first();
      if (c.s !== fr.size) return E('Upload incomplete. Try again.');
      await env.DB.prepare('UPDATE files SET chunks=?, complete=1 WHERE id=?').bind(c.n, fr.id).run();
      await audit(env, u, 'file.upload', fr.col, fr.doc_id, fr.name);
      return J({ ok: true, file: { id: fr.id, name: fr.name, mime: fr.mime, size: fr.size, at: fr.at, by: fr.by_name } });
    }
    await env.DB.prepare('DELETE FROM file_chunks WHERE file_id=?').bind(fr.id).run();
    await env.DB.prepare('DELETE FROM files WHERE id=?').bind(fr.id).run();
    await audit(env, u, 'file.delete', fr.col, fr.doc_id, fr.name); return J({ ok: true });
  }
  if ((fm = /^files\/(f[a-f0-9]{16})$/.exec(p)) && m === 'GET') {
    const fr = await env.DB.prepare('SELECT * FROM files WHERE id=? AND complete=1').bind(fm[1]).first(); if (!fr) return E('File not found.', 404);
    const d = await env.DB.prepare('SELECT data FROM docs WHERE col=? AND id=?').bind(fr.col, fr.doc_id).first();
    if (!d || !canR(fr.col, u, JSON.parse(d.data))) return E('File not found.', 404);
    const rows = (await env.DB.prepare('SELECT data FROM file_chunks WHERE file_id=? ORDER BY n').bind(fr.id).all()).results;
    const parts = rows.map((r) => new Uint8Array(r.data)); const out = new Uint8Array(parts.reduce((s, x) => s + x.length, 0)); let o = 0; parts.forEach((x) => { out.set(x, o); o += x.length; });
    const safe = /^(application\/pdf|image\/(jpeg|png|webp|gif))$/.test(fr.mime);
    return new Response(out, { headers: { 'content-type': safe ? fr.mime : 'application/octet-stream', 'content-disposition': `${safe ? 'inline' : 'attachment'}; filename="${fr.name.replace(/[^\w. ()-]/g, '_')}"`, 'cache-control': 'private, max-age=3600', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" } });
  }
  if (p === 'files' && m === 'GET') {
    const col = String(url.searchParams.get('col') || ''), docId = String(url.searchParams.get('doc') || '');
    if (!COLS[col] || !canR(col, u, null)) return E('Not allowed.', 403);
    const rows = (await env.DB.prepare('SELECT id,name,mime,size,at,by_name FROM files WHERE col=? AND doc_id=? AND complete=1 ORDER BY at').bind(col, docId).all()).results;
    return J({ files: rows });
  }

  /* ---- users (admin) ---- */
  if (p === 'users' && m === 'GET') {
    if (u.role !== 'admin') return E('Administrator only.', 403);
    const rows = (await env.DB.prepare('SELECT * FROM users ORDER BY name').all()).results;
    return J({ users: rows.map(pubUser) });
  }
  if (p === 'users' && m === 'POST') {
    if (u.role !== 'admin') return E('Administrator only.', 403);
    const b = await body(req); if (!b) return E('Bad request.');
    try {
      if (!b.id) { const r = await makeUser(env, b, u); return J({ ok: true, id: r.id, password: r.password }); }
      const t = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(b.id).first(); if (!t) return E('No such user.', 404);
      if (b.reset) {
        const pw = rid(4), salt = rid(8);
        await env.DB.prepare('UPDATE users SET pass=?, salt=?, must_change=1 WHERE id=?').bind(await hashPw(pw, salt), salt, t.id).run();
        await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(t.id).run();
        await audit(env, u, 'user.reset', 'users', t.id, t.username); return J({ ok: true, password: pw });
      }
      if (t.id === u.id && (b.active === false || (b.role && b.role !== 'admin'))) return E('You cannot remove your own administrator access.');
      const role = ROLES[b.role] ? b.role : t.role;
      await env.DB.prepare('UPDATE users SET name=?, role=?, dept=?, emp=?, active=? WHERE id=?')
        .bind(clean(b.name, 80) || t.name, role, clean(b.dept) || null, clean(b.emp, 40) || null, b.active === false ? 0 : 1, t.id).run();
      if (b.active === false) await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(t.id).run();
      await audit(env, u, 'user.edit', 'users', t.id, t.username); return J({ ok: true });
    } catch (e) { return E(/UNIQUE/.test(e.message) ? 'That username is taken.' : e.message); }
  }
  if (p === 'audit' && m === 'GET') {
    if (u.role !== 'admin') return E('Administrator only.', 403);
    const q = clean(url.searchParams.get('q'), 60);
    const rows = (await env.DB.prepare(`SELECT * FROM audit ${q ? "WHERE user_name LIKE ?1 OR col LIKE ?1 OR detail LIKE ?1 OR action LIKE ?1" : ''} ORDER BY id DESC LIMIT 400`).bind(...(q ? ['%' + q + '%'] : [])).all()).results;
    return J({ audit: rows });
  }
  /* ---- backup and restore (admin) ---- */
  if (p === 'backup' && m === 'GET') {
    if (u.role !== 'admin') return E('Administrator only.', 403);
    const docs = (await env.DB.prepare('SELECT col,id,data,deleted,updated_at,updated_by FROM docs WHERE deleted=0').all()).results.map((r) => ({ ...r, data: JSON.parse(r.data) }));
    const users = (await env.DB.prepare('SELECT * FROM users').all()).results.map(pubUser);
    await audit(env, u, 'backup.download', null, null, docs.length + ' records');
    return J({ app: 'CarePoint Admin', version: 1, at: now(), docs, users });
  }
  if (p === 'restore' && m === 'POST') {
    if (u.role !== 'admin') return E('Administrator only.', 403);
    const b = await body(req); if (!b || !Array.isArray(b.docs)) return E('That file is not a CarePoint backup.');
    let n = 0;
    for (const d of b.docs) {
      if (!COLS[d.col] || !/^[A-Za-z0-9_.:-]{1,64}$/.test(d.id || '') || !d.data) continue;
      const seq = await nextSeq(env);
      await env.DB.prepare('INSERT INTO docs(col,id,data,seq,deleted,updated_at,updated_by) VALUES(?,?,?,?,0,?,?) ON CONFLICT(col,id) DO UPDATE SET data=excluded.data, seq=excluded.seq, deleted=0, updated_at=excluded.updated_at, updated_by=excluded.updated_by')
        .bind(d.col, d.id, JSON.stringify(d.data), seq, now(), u.name + ' (restore)').run(); n++;
    }
    await audit(env, u, 'backup.restore', null, null, n + ' records'); return J({ ok: true, restored: n });
  }
  return E('Not found.', 404);
}

/* ================= many hospitals =================
   Each hospital has its own set of tables (h_<code>_users, h_<code>_docs, ...), so records never mix.
   The first hospital (code "main") keeps the original tables. The owner (Nexora Digital) manages hospitals. */
const TBL = /\b(users|sessions|docs|audit|meta|files|file_chunks|docs_seq|audit_at|files_doc)\b/g;
const scoped = (DB, prefix) => (prefix ? { prepare: (sql) => DB.prepare(sql.replace(TBL, prefix + '$1')) } : DB);
const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT NOT NULL UNIQUE COLLATE NOCASE, pass TEXT NOT NULL, salt TEXT NOT NULL, role TEXT NOT NULL, dept TEXT, emp TEXT, active INTEGER NOT NULL DEFAULT 1, must_change INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), last_login TEXT)",
  'CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS docs (col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, seq INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, updated_by TEXT, PRIMARY KEY (col, id))',
  'CREATE INDEX IF NOT EXISTS docs_seq ON docs(seq)',
  "CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), user_id TEXT, user_name TEXT, action TEXT NOT NULL, col TEXT, doc_id TEXT, detail TEXT)",
  'CREATE INDEX IF NOT EXISTS audit_at ON audit(at)',
  'CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)',
  "CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, col TEXT NOT NULL, doc_id TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, chunks INTEGER NOT NULL DEFAULT 0, complete INTEGER NOT NULL DEFAULT 0, by_name TEXT, at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')))",
  'CREATE INDEX IF NOT EXISTS files_doc ON files(col, doc_id)',
  'CREATE TABLE IF NOT EXISTS file_chunks (file_id TEXT NOT NULL, n INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (file_id, n))',
];
let READY = false;
async function ensureGlobal(DB) {
  if (READY) return;
  await DB.prepare("CREATE TABLE IF NOT EXISTS cp_tenants (code TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, prefix TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')))").run();
  await DB.prepare('CREATE TABLE IF NOT EXISTS cp_owner (id INTEGER PRIMARY KEY, pass TEXT NOT NULL, salt TEXT NOT NULL, fails INTEGER NOT NULL DEFAULT 0, fail_t INTEGER NOT NULL DEFAULT 0)').run();
  await DB.prepare('CREATE TABLE IF NOT EXISTS cp_osess (token TEXT PRIMARY KEY, expires INTEGER NOT NULL)').run();
  await DB.prepare("INSERT OR IGNORE INTO cp_tenants(code,name,prefix) VALUES('main','Main hospital','')").run();
  READY = true;
}
const brandOf = (t) => ({ code: t.code, name: t.name, logo: t.logo || '', active: !!t.active });
const getCookie = (req, k) => { const m = new RegExp('(?:^|;\\s*)' + k + '=([^;]+)').exec(req.headers.get('cookie') || ''); return m ? decodeURIComponent(m[1]) : ''; };
const validLogo = (l) => !l || (typeof l === 'string' && l.length < 400000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(l));

async function ownerHandle(req, env, p, m) {
  const DB = env.DB;
  const own = await DB.prepare('SELECT * FROM cp_owner WHERE id=1').first();
  const tok = getCookie(req, 'cp_o');
  const signed = !!(own && /^[a-f0-9]{64}$/.test(tok) && (await DB.prepare('SELECT 1 FROM cp_osess WHERE token=? AND expires>?').bind(tok, Date.now()).first()));
  const ocookie = (t, age) => `cp_o=${t}; Path=/api/owner; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
  if (p === 'owner/state') return J({ setup: !own, signed });
  if (p === 'owner/setup' && m === 'POST') {
    if (own) return E('Already set up.', 409);
    const b = await body(req); if (!b) return E('Bad request.');
    if (!env.SETUP_CODE || b.code !== env.SETUP_CODE) return E('Wrong setup code.', 403);
    if (String(b.password || '').length < 10) return E('Owner password must be at least 10 characters.');
    const salt = rid(8); await DB.prepare('INSERT INTO cp_owner(id,pass,salt) VALUES(1,?,?)').bind(await hashPw(b.password, salt), salt).run();
    return J({ ok: true });
  }
  if (p === 'owner/login' && m === 'POST') {
    if (!own) return E('Set up the owner password first.', 409);
    if (own.fails >= 6 && Date.now() - own.fail_t < 30 * 60e3) return E('Too many wrong passwords. Wait 30 minutes.', 429);
    const b = await body(req); if (!b) return E('Bad request.');
    if ((await hashPw(String(b.password || ''), own.salt)) !== own.pass) {
      await DB.prepare('UPDATE cp_owner SET fails=?, fail_t=? WHERE id=1').bind((Date.now() - own.fail_t < 30 * 60e3 ? own.fails : 0) + 1, Date.now()).run();
      return E('Wrong password.', 401);
    }
    await DB.prepare('UPDATE cp_owner SET fails=0 WHERE id=1').run();
    const t = rid(32); await DB.prepare('INSERT INTO cp_osess(token,expires) VALUES(?,?)').bind(t, Date.now() + 12 * 3600e3).run();
    await DB.prepare('DELETE FROM cp_osess WHERE expires<?').bind(Date.now()).run();
    return J({ ok: true }, 200, { 'set-cookie': ocookie(t, 12 * 3600) });
  }
  if (p === 'owner/logout' && m === 'POST') { if (tok) await DB.prepare('DELETE FROM cp_osess WHERE token=?').bind(tok).run(); return J({ ok: true }, 200, { 'set-cookie': ocookie('', 0) }); }
  if (!signed) return E('Please sign in as the owner.', 401);

  if (p === 'owner/password' && m === 'POST') {
    const b = await body(req); if (!b) return E('Bad request.');
    if ((await hashPw(String(b.old || ''), own.salt)) !== own.pass) return E('Current password is wrong.', 403);
    if (String(b.password || '').length < 10) return E('New password must be at least 10 characters.');
    const salt = rid(8); await DB.prepare('UPDATE cp_owner SET pass=?, salt=? WHERE id=1').bind(await hashPw(b.password, salt), salt).run();
    await DB.prepare('DELETE FROM cp_osess WHERE token<>?').bind(tok).run(); return J({ ok: true });
  }
  if (p === 'owner/hospitals' && m === 'GET') {
    const ts = (await DB.prepare('SELECT * FROM cp_tenants ORDER BY created_at').all()).results, out = [];
    for (const t of ts) {
      const d = scoped(DB, t.prefix);
      const c = await d.prepare('SELECT (SELECT COUNT(*) FROM users WHERE active=1) users, (SELECT COUNT(*) FROM docs WHERE deleted=0) records, (SELECT MAX(updated_at) FROM docs) last, (SELECT COUNT(*) FROM files) files').first();
      const admins = (await d.prepare("SELECT id,name,username,last_login FROM users WHERE role='admin' ORDER BY created_at").all()).results;
      out.push({ ...brandOf(t), created_at: t.created_at, ...c, admins });
    }
    return J({ hospitals: out });
  }
  if (p === 'owner/hospitals' && m === 'POST') {
    const b = await body(req); if (!b) return E('Bad request.');
    const code = clean(b.code, 24).toLowerCase();
    if (b.action === 'create') {
      if (!/^[a-z][a-z0-9]{1,19}$/.test(code)) return E('Hospital code: 2 to 20 letters and numbers, starting with a letter (for example "parirenyatwa").');
      if (await DB.prepare('SELECT 1 FROM cp_tenants WHERE code=?').bind(code).first()) return E('That hospital code is already used.');
      const name = clean(b.name, 90); if (!name) return E('Enter the hospital name.');
      if (!validLogo(b.logo)) return E('Logo must be a PNG, JPG or WebP picture.');
      const prefix = 'h_' + code + '_', d = scoped(DB, prefix);
      for (const q of SCHEMA) await d.prepare(q).run();
      let r; try { r = await makeUser({ DB: d }, { name: b.admin_name, username: b.admin_username, role: 'admin' }, null); }
      catch (e) { return E(/UNIQUE/.test(e.message) ? 'That username is taken.' : e.message); }
      await DB.prepare('INSERT INTO cp_tenants(code,name,logo,prefix) VALUES(?,?,?,?)').bind(code, name, b.logo || null, prefix).run();
      await audit({ DB: d }, null, 'hospital.create', null, null, `Created by Nexora Digital: ${name}`);
      return J({ ok: true, code, username: clean(b.admin_username, 40).toLowerCase(), password: r.password });
    }
    const t = await DB.prepare('SELECT * FROM cp_tenants WHERE code=?').bind(code).first(); if (!t) return E('No such hospital.', 404);
    const d = scoped(DB, t.prefix);
    if (b.action === 'edit') {
      const name = clean(b.name, 90) || t.name; if (!validLogo(b.logo)) return E('Logo must be a PNG, JPG or WebP picture.');
      await DB.prepare('UPDATE cp_tenants SET name=?, logo=? WHERE code=?').bind(name, b.logo === undefined ? t.logo : b.logo || null, code).run();
      return J({ ok: true });
    }
    if (b.action === 'pause' || b.action === 'resume') {
      await DB.prepare('UPDATE cp_tenants SET active=? WHERE code=?').bind(b.action === 'resume' ? 1 : 0, code).run();
      if (b.action === 'pause') await d.prepare('DELETE FROM sessions').run();
      return J({ ok: true });
    }
    if (b.action === 'reset') {
      const a = await d.prepare("SELECT * FROM users WHERE id=? AND role='admin'").bind(String(b.user || '')).first(); if (!a) return E('No such administrator.', 404);
      const pw = rid(4), salt = rid(8);
      await d.prepare('UPDATE users SET pass=?, salt=?, must_change=1, active=1 WHERE id=?').bind(await hashPw(pw, salt), salt, a.id).run();
      await d.prepare('DELETE FROM sessions WHERE user_id=?').bind(a.id).run();
      await d.prepare("DELETE FROM meta WHERE k=?").bind('fail:' + a.username).run();
      await audit({ DB: d }, null, 'user.reset', 'users', a.id, 'by Nexora Digital: ' + a.username);
      return J({ ok: true, username: a.username, password: pw });
    }
    if (b.action === 'add_admin') {
      try { const r = await makeUser({ DB: d }, { name: b.admin_name, username: b.admin_username, role: 'admin' }, null); return J({ ok: true, username: clean(b.admin_username, 40).toLowerCase(), password: r.password }); }
      catch (e) { return E(/UNIQUE/.test(e.message) ? 'That username is taken.' : e.message); }
    }
    return E('Unknown action.');
  }
  return E('Not found.', 404);
}

async function route(req, env) {
  const url = new URL(req.url), p = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, ''), m = req.method;
  if (m !== 'GET' && m !== 'HEAD') {
    const o = req.headers.get('origin'); if (o && new URL(o).host !== url.host) return E('Cross-site request blocked.', 403);
    if (!/application\/json/.test(req.headers.get('content-type') || '')) return E('Send JSON.', 415);
  }
  await ensureGlobal(env.DB);
  if (p.startsWith('owner/')) return ownerHandle(req, env, p, m);
  const code = (req.headers.get('x-cp-h') || url.searchParams.get('h') || getCookie(req, 'cp_h') || 'main').toLowerCase().slice(0, 24);
  const t = await env.DB.prepare('SELECT * FROM cp_tenants WHERE code=?').bind(code).first();
  if (p === 'brand') return t ? J(brandOf(t)) : E('No hospital with that code.', 404);
  if (!t) return E('No hospital with that code. Check the link you were given.', 404);
  if (!t.active) return E('This hospital’s CarePoint account is paused. Please contact Nexora Digital.', 423);
  const r = await handle(req, { ...env, DB: scoped(env.DB, t.prefix), SETUP_CODE: t.prefix ? '' : env.SETUP_CODE }, brandOf(t));
  if (p === 'login' && r.ok) { const r2 = new Response(r.body, r); r2.headers.append('set-cookie', `cp_h=${t.code}; Path=/; Secure; SameSite=Lax; Max-Age=${30 * 86400}`); return r2; }
  return r;
}

export async function onRequest({ request, env }) {
  try { return await route(request, env); }
  catch (e) { console.error(e); return E('Something went wrong on the server. Try again.', 500); }
}
