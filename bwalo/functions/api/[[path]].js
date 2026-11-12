// Bwalo API: accounts, sessions, two-step sign-in, and a document store where every write is checked
// against the signed-in person's role. Runs as a Cloudflare Pages Function with a D1 database bound as DB.

const COLS = ['leagues', 'teams', 'matches', 'transfers', 'news', 'requests', 'audit', 'config'];
const DEFPLANS = [
  { id: 'free', name: 'Free', price: '', maxTeams: 8, news: true, staff: false, stats: false },
  { id: 'pro', name: 'Pro', price: '', maxTeams: 24, news: true, staff: true, stats: true },
  { id: 'ent', name: 'Enterprise', price: '', maxTeams: 0, news: true, staff: true, stats: true },
];
const OPEN = { id: '', name: 'Unrestricted', maxTeams: 0, news: true, staff: true, stats: true };
const SESSION_DAYS = 30;
const MAX_DOC = 700000;

const J = (d, s = 200, h = {}) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...h } });
const fail = (s, m) => { const e = new Error(m); e.status = s; return e; };
const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const rnd = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
async function pbk(pw, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, k, 256));
}
const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

// ---- two-step sign-in (TOTP, RFC 6238) ----
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const b32enc = (bytes) => { let bits = '', o = ''; for (const b of bytes) bits += b.toString(2).padStart(8, '0'); for (let i = 0; i < bits.length; i += 5) o += B32[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)]; return o; };
const b32dec = (s) => { let bits = ''; for (const c of String(s).toUpperCase()) { const v = B32.indexOf(c); if (v >= 0) bits += v.toString(2).padStart(5, '0'); } const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return new Uint8Array(out); };
export async function totp(secret, step) {
  const key = await crypto.subtle.importKey('raw', b32dec(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const buf = new ArrayBuffer(8); new DataView(buf).setUint32(4, step);
  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf)); const o = h[19] & 15;
  const n = (((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1000000;
  return String(n).padStart(6, '0');
}
async function totpOk(secret, code) {
  const c = String(code || '').replace(/\s/g, ''); if (!/^\d{6}$/.test(c)) return false;
  const t = Math.floor(Date.now() / 30000);
  for (const d of [0, -1, 1]) if (same(await totp(secret, t + d), c)) return true;
  return false;
}

// ---- documents ----
const getDoc = async (env, col, id) => { if (!id) return null; const r = await env.DB.prepare('SELECT data FROM docs WHERE col=? AND id=? AND deleted=0').bind(col, id).first(); return r ? JSON.parse(r.data) : null; };
const nextSeq = async (env) => { const r = await env.DB.prepare("UPDATE meta SET v=CAST(v AS INTEGER)+1 WHERE k='seq' RETURNING v").first(); return Number(r.v); };
async function putDoc(env, col, id, data) {
  const seq = await nextSeq(env);
  const lid = col === 'leagues' || col === 'audit' ? id : (data.lid || null);
  await env.DB.prepare('INSERT INTO docs(col,id,lid,data,seq,deleted) VALUES(?,?,?,?,?,0) ON CONFLICT(col,id) DO UPDATE SET lid=excluded.lid,data=excluded.data,seq=excluded.seq,deleted=0').bind(col, id, lid, JSON.stringify(data), seq).run();
  return seq;
}
async function delDoc(env, col, id) { const seq = await nextSeq(env); await env.DB.prepare("UPDATE docs SET deleted=1,data='{}',seq=? WHERE col=? AND id=?").bind(seq, col, id).run(); }
async function audit(env, lid, uid, text) {
  const cur = (await getDoc(env, 'audit', lid)) || { items: [] };
  await putDoc(env, 'audit', lid, { items: [{ at: new Date().toISOString(), by: uid, text: String(text).slice(0, 160) }, ...cur.items].slice(0, 60) });
}
const planOf = async (env, l) => { const c = await getDoc(env, 'config', 'plans'); return ((c && c.items) || DEFPLANS).find((p) => p.id === (l && l.plan)) || OPEN; };
const rights = (u, l) => {
  const own = !!u && u.role === 'owner', r = u && l ? (l.roles || {})[u.id] : null;
  const adm = own || (!!u && !!l && (l.createdBy === u.id || r === 'admin'));
  return { adm, score: adm || r === 'scorer', news: adm || r === 'media' };
};
const manages = async (env, u, lid) => {
  const rows = await env.DB.prepare("SELECT data FROM docs WHERE col='teams' AND lid=? AND deleted=0").bind(lid).all();
  return rows.results.some((r) => (JSON.parse(r.data).managers || []).includes(u.id));
};

// Decides whether this person may make this write, and returns the data that will actually be stored.
async function authorize(env, u, col, id, old, data, del) {
  const own = u.role === 'owner';
  if (col === 'config') { if (!own) throw fail(403, 'Only the platform owner can change this.'); return data; }
  if (col === 'audit') throw fail(403, 'The audit log is written by the server.');
  if (col === 'leagues') {
    if (!old) { if (del) throw fail(404, 'Not found.'); data.createdBy = u.id; data.roles = {}; data.history = []; if (!own) { data.plan = 'free'; delete data.example; } return data; }
    if (!rights(u, old).adm) throw fail(403, 'Only the organiser or a league administrator can change this competition.');
    if (del) return null;
    data.createdBy = old.createdBy ?? null;
    if (!own) { if (old.plan === undefined) delete data.plan; else data.plan = old.plan; if (old.example) data.example = true; else delete data.example; }
    return data;
  }
  const lid = (old || data).lid, l = await getDoc(env, 'leagues', lid);
  if (!l) throw fail(400, 'That competition no longer exists.');
  const r = rights(u, l), plan = await planOf(env, l);
  if (!old && del) throw fail(404, 'Not found.');
  if (!del) data.lid = lid;
  if (col === 'teams') {
    if (r.adm) {
      if (!old && plan.maxTeams) { const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM docs WHERE col='teams' AND lid=? AND deleted=0").bind(lid).first(); if (n.n >= plan.maxTeams) throw fail(403, `The ${plan.name} package allows ${plan.maxTeams} teams.`); }
      return data;
    }
    if (old && !del && (old.managers || []).includes(u.id)) { data.managers = old.managers; if (old.group !== undefined) data.group = old.group; return data; }
    throw fail(403, 'Only this team\'s manager or the league staff can change it.');
  }
  if (col === 'matches') {
    if (r.adm) return data;
    if (old && !del && r.score) { if (!plan.stats && data.box) { if (old.box) data.box = old.box; else delete data.box; } return data; }
    if (old && !del) {
      const merged = { ...old, lineups: { ...(old.lineups || {}) } }; let mine = 0;
      for (const tid of [old.home, old.away]) { const t = await getDoc(env, 'teams', tid); if (t && (t.managers || []).includes(u.id)) { mine++; if (data.lineups && data.lineups[tid]) merged.lineups[tid] = data.lineups[tid]; } }
      if (mine) return merged;
    }
    throw fail(403, 'Only league staff and scorekeepers can change fixtures and results.');
  }
  if (col === 'transfers') {
    if (r.adm) return data;
    if (del) { if (r.news && old.type === 'rumour') return null; throw fail(403, 'You cannot remove this record.'); }
    if (!old && data.type === 'rumour' && r.news) return data;
    if (!old && ['signed', 'released'].includes(data.type) && await manages(env, u, lid)) return data;
    throw fail(403, 'Only team managers and league staff can record transfers.');
  }
  if (col === 'news') {
    if (!r.news) throw fail(403, 'Only media officers and league staff can publish news.');
    if (!plan.news && !del) throw fail(403, `The ${plan.name} package does not include the newsroom.`);
    if (!del) data.by = old ? (old.by || '') : u.id;
    return data;
  }
  if (col === 'requests') {
    if (del) { if (old.uid === u.id || r.adm) return null; throw fail(403, 'You cannot remove this request.'); }
    if (old) throw fail(403, 'Requests cannot be edited.');
    if (!plan.staff) throw fail(403, `The ${plan.name} package does not include staff roles.`);
    if (!['admin', 'scorer', 'media', 'manager'].includes(data.role)) throw fail(400, 'Unknown role.');
    data.uid = u.id; data.at = new Date().toISOString(); return data;
  }
  throw fail(400, 'Unknown collection.');
}

// ---- sessions ----
const cookieOf = (req) => { const m = /(?:^|;\s*)bw_s=([a-f0-9]{64})/.exec(req.headers.get('cookie') || ''); return m ? m[1] : null; };
const setCookie = (tok, age) => ({ 'set-cookie': `bw_s=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}` });
async function userOf(env, req) {
  const tok = cookieOf(req); if (!tok) return null;
  return env.DB.prepare("SELECT u.id,u.email,u.name,u.role,u.totp,u.prefs FROM sessions s JOIN users u ON u.id=s.uid WHERE s.token=? AND s.expires>? AND u.status='active'").bind(await sha(tok), Date.now()).first();
}
async function newSession(env, uid) {
  const tok = rnd(32); await env.DB.prepare('INSERT INTO sessions(token,uid,expires) VALUES(?,?,?)').bind(await sha(tok), uid, Date.now() + SESSION_DAYS * 864e5).run();
  return setCookie(tok, SESSION_DAYS * 86400);
}
const pub = (u) => u && { id: u.id, name: u.name, email: u.email, role: u.role, twofa: !!u.totp && !u.totp.startsWith('pending:') };
async function throttle(env, key, max, mins) {
  const since = Date.now() - mins * 6e4;
  await env.DB.prepare('DELETE FROM attempts WHERE at<?').bind(Date.now() - 864e5).run();
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM attempts WHERE k=? AND at>?').bind(key, since).first();
  if (n.n >= max) throw fail(429, 'Too many attempts. Wait a few minutes and try again.');
}
const strike = (env, key) => env.DB.prepare('INSERT INTO attempts(k,at) VALUES(?,?)').bind(key, Date.now()).run();

export async function onRequest({ request, env }) {
  try { return await handle(request, env); } catch (e) {
    if (e.status) return J({ error: e.message, ...(e.extra || {}) }, e.status);
    console.error(e); return J({ error: 'Something went wrong on the server.' }, 500);
  }
}

async function handle(request, env) {
  const url = new URL(request.url), seg = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean), m = request.method;
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  if (m !== 'GET') { const o = request.headers.get('origin'); if (o && new URL(o).host !== url.host) throw fail(403, 'Cross-site request refused.'); }
  let b = {}; if (m !== 'GET' && m !== 'DELETE') { const t = await request.text(); if (t.length > MAX_DOC + 2000) throw fail(413, 'That is too large to save. Use a smaller photo.'); try { b = t ? JSON.parse(t) : {}; } catch (e) { throw fail(400, 'Bad request.'); } }
  const u = await userOf(env, request);
  const need = () => { if (!u) throw fail(401, 'Sign in first.'); return u; };
  const a = seg[0];

  if (a === 'me' && m === 'GET') return J({ user: pub(u), prefs: u && u.prefs ? JSON.parse(u.prefs) : null });

  if (a === 'register' && m === 'POST') {
    await throttle(env, 'reg:' + ip, 6, 60);
    const email = String(b.email || '').trim().toLowerCase(), name = String(b.name || '').trim().slice(0, 40), pw = String(b.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) throw fail(400, 'Enter a valid email address.');
    if (name.length < 2) throw fail(400, 'Enter your name.');
    if (pw.length < 8) throw fail(400, 'Use a password of at least 8 characters.');
    if (await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first()) throw fail(409, 'That email already has an account. Sign in instead.');
    let role = 'user';
    if (b.code) {
      const hasOwner = await env.DB.prepare("SELECT id FROM users WHERE role='owner'").first();
      if (!env.OWNER_CODE || hasOwner || !same(String(b.code).trim(), env.OWNER_CODE)) { await strike(env, 'reg:' + ip); throw fail(403, 'That setup code is not valid.'); }
      role = 'owner';
    }
    const id = 'u_' + rnd(8), salt = rnd(16);
    await env.DB.prepare('INSERT INTO users(id,email,name,pass,salt,role,created) VALUES(?,?,?,?,?,?,?)').bind(id, email, name, await pbk(pw, salt), salt, role, new Date().toISOString()).run();
    await strike(env, 'reg:' + ip);
    return J({ user: pub({ id, email, name, role }) }, 200, await newSession(env, id));
  }

  if (a === 'login' && m === 'POST') {
    const email = String(b.email || '').trim().toLowerCase(), key = 'login:' + email + ':' + ip;
    await throttle(env, key, 8, 15);
    const row = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
    if (!row || !same(await pbk(String(b.password || ''), row.salt), row.pass)) { await strike(env, key); throw fail(401, 'Email or password is not right.'); }
    if (row.status !== 'active') throw fail(403, 'This account is suspended.');
    if (row.totp && !row.totp.startsWith('pending:')) {
      if (!b.code) { const e = fail(401, 'Enter the 6-digit code from your authenticator app.'); e.extra = { need2fa: true }; throw e; }
      if (!(await totpOk(row.totp, b.code))) { await strike(env, key); const e = fail(401, 'That code is not right. Try the newest one.'); e.extra = { need2fa: true }; throw e; }
    }
    return J({ user: pub(row), prefs: row.prefs ? JSON.parse(row.prefs) : null }, 200, await newSession(env, row.id));
  }

  if (a === 'logout' && m === 'POST') { const tok = cookieOf(request); if (tok) await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(await sha(tok)).run(); return J({ ok: true }, 200, setCookie('x', 0)); }

  if (a === 'password' && m === 'POST') {
    need(); const row = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(u.id).first();
    if (!same(await pbk(String(b.old || ''), row.salt), row.pass)) throw fail(401, 'Your current password is not right.');
    if (String(b.new || '').length < 8) throw fail(400, 'Use a password of at least 8 characters.');
    const salt = rnd(16); await env.DB.prepare('UPDATE users SET pass=?,salt=? WHERE id=?').bind(await pbk(String(b.new), salt), salt, u.id).run();
    return J({ ok: true });
  }

  if (a === '2fa' && m === 'POST') {
    need();
    if (seg[1] === 'setup') { const secret = b32enc(crypto.getRandomValues(new Uint8Array(20))); await env.DB.prepare('UPDATE users SET totp=? WHERE id=?').bind('pending:' + secret, u.id).run(); return J({ secret, uri: `otpauth://totp/Bwalo:${encodeURIComponent(u.email)}?secret=${secret}&issuer=Bwalo` }); }
    if (seg[1] === 'enable') { if (!u.totp || !u.totp.startsWith('pending:')) throw fail(400, 'Start the setup again.'); const secret = u.totp.slice(8); if (!(await totpOk(secret, b.code))) throw fail(400, 'That code is not right. Check the time on your phone and try the newest code.'); await env.DB.prepare('UPDATE users SET totp=? WHERE id=?').bind(secret, u.id).run(); return J({ ok: true }); }
    if (seg[1] === 'disable') { const row = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(u.id).first(); if (!same(await pbk(String(b.password || ''), row.salt), row.pass)) throw fail(401, 'Your password is not right.'); await env.DB.prepare('UPDATE users SET totp=NULL WHERE id=?').bind(u.id).run(); return J({ ok: true }); }
  }

  if (a === 'prefs' && m === 'PUT') { need(); const s = JSON.stringify(b || {}); if (s.length > 20000) throw fail(413, 'Too many favourites.'); await env.DB.prepare('UPDATE users SET prefs=? WHERE id=?').bind(s, u.id).run(); return J({ ok: true }); }

  if (a === 'names' && m === 'POST') {
    const ids = [...new Set((b.ids || []).filter((x) => typeof x === 'string'))].slice(0, 100); if (!ids.length) return J({ names: {} });
    const rows = await env.DB.prepare(`SELECT id,name FROM users WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all();
    return J({ names: Object.fromEntries(rows.results.map((r) => [r.id, r.name])) });
  }

  if (a === 'sync' && m === 'GET') {
    const since = Number(url.searchParams.get('since')) || 0;
    const seq = Number((await env.DB.prepare("SELECT v FROM meta WHERE k='seq'").first()).v);
    const rows = since ? await env.DB.prepare('SELECT col,id,lid,data,deleted FROM docs WHERE seq>? AND seq<=?').bind(since, seq).all() : await env.DB.prepare('SELECT col,id,lid,data,deleted FROM docs WHERE deleted=0').all();
    const need3 = rows.results.some((r) => !r.deleted && ['news', 'requests', 'audit'].includes(r.col)), L = {};
    if (need3) for (const r of (await env.DB.prepare("SELECT id,data FROM docs WHERE col='leagues' AND deleted=0").all()).results) L[r.id] = JSON.parse(r.data);
    const out = [];
    for (const r of rows.results) {
      if (r.deleted) { out.push(`[${JSON.stringify(r.col)},${JSON.stringify(r.id)},null]`); continue; }
      if (r.col === 'news') { const d = JSON.parse(r.data); if (!d.pub && !rights(u, L[r.lid]).news) continue; }
      else if (r.col === 'requests') { const d = JSON.parse(r.data); if (!(u && (d.uid === u.id || rights(u, L[r.lid]).adm))) continue; }
      else if (r.col === 'audit') { if (!rights(u, L[r.lid]).adm) continue; }
      out.push(`[${JSON.stringify(r.col)},${JSON.stringify(r.id)},${r.data}]`);
    }
    return new Response(`{"seq":${seq},"full":${since ? 'false' : 'true'},"docs":[${out.join(',')}]}`, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }

  if (a === 'doc' && (m === 'PUT' || m === 'DELETE')) {
    need(); const col = seg[1], id = seg[2];
    if (!COLS.includes(col) || !/^[A-Za-z0-9_-]{1,40}$/.test(id || '')) throw fail(400, 'Bad address.');
    const old = await getDoc(env, col, id), del = m === 'DELETE';
    if (!del && (typeof b.data !== 'object' || !b.data || Array.isArray(b.data))) throw fail(400, 'Bad data.');
    const data = await authorize(env, u, col, id, old, del ? null : b.data, del);
    if (del) {
      if (col === 'leagues') { const seq = await nextSeq(env); await env.DB.prepare("UPDATE docs SET deleted=1,data='{}',seq=? WHERE lid=? AND deleted=0").bind(seq, id).run(); }
      else await delDoc(env, col, id);
      return J({ ok: true });
    }
    if (JSON.stringify(data).length > MAX_DOC) throw fail(413, 'That is too large to save. Use a smaller photo.');
    await putDoc(env, col, id, data);
    return J({ ok: true, data });
  }

  if (a === 'log' && m === 'POST') {
    need(); const l = await getDoc(env, 'leagues', b.lid); if (!l) return J({ ok: true });
    const r = rights(u, l); if (!(r.adm || r.score || r.news || await manages(env, u, b.lid))) throw fail(403, 'Not allowed.');
    await audit(env, b.lid, u.id, b.text || ''); return J({ ok: true });
  }

  if (a === 'transfer' && m === 'POST') {
    need(); const t = await getDoc(env, 'teams', b.tid), d = await getDoc(env, 'teams', b.to);
    if (!t || !d || t.lid !== d.lid || b.tid === b.to) throw fail(400, 'Pick two teams in the same competition.');
    const l = await getDoc(env, 'leagues', t.lid);
    if (!(rights(u, l).adm || (t.managers || []).includes(u.id))) throw fail(403, 'Only the selling team\'s manager or league staff can transfer this player.');
    const p = (t.players || []).find((x) => x.id === b.pid); if (!p) throw fail(400, 'That player is no longer in the squad.');
    const type = b.type === 'loan' ? 'loan' : 'transfer';
    await putDoc(env, 'teams', b.tid, { ...t, players: t.players.filter((x) => x.id !== p.id) });
    await putDoc(env, 'teams', b.to, { ...d, players: [...(d.players || []), p] });
    await putDoc(env, 'transfers', rnd(8), { lid: t.lid, pid: p.id, player: p.name, type, fee: String(b.fee || '').slice(0, 60), from: t.name, to: d.name, at: new Date().toISOString() });
    await audit(env, t.lid, u.id, `${type === 'loan' ? 'Loaned' : 'Transferred'} ${p.name} from ${t.name} to ${d.name}`);
    return J({ ok: true });
  }

  if (a === 'approve' && m === 'POST') {
    need(); const q = await getDoc(env, 'requests', b.id); if (!q) throw fail(404, 'That request is gone.');
    const l = await getDoc(env, 'leagues', q.lid); if (!rights(u, l).adm) throw fail(403, 'Only the organiser or a league administrator can approve staff.');
    if (q.role === 'manager') { const t = await getDoc(env, 'teams', q.tid); if (!t || t.lid !== q.lid) throw fail(400, 'That team is gone.'); await putDoc(env, 'teams', q.tid, { ...t, managers: [...new Set([...(t.managers || []), q.uid])] }); }
    else await putDoc(env, 'leagues', q.lid, { ...l, roles: { ...(l.roles || {}), [q.uid]: q.role } });
    await delDoc(env, 'requests', b.id); await audit(env, q.lid, u.id, 'Approved a ' + q.role + ' request');
    return J({ ok: true });
  }

  if (a === 'users') {
    need(); if (u.role !== 'owner') throw fail(403, 'Only the platform owner can manage accounts.');
    if (m === 'GET') return J({ users: (await env.DB.prepare('SELECT id,name,email,role,status,created,totp IS NOT NULL AS twofa FROM users ORDER BY created DESC LIMIT 500').all()).results });
    if (m === 'POST' && seg[1]) {
      if (seg[1] === u.id) throw fail(400, 'You cannot change your own account here.');
      if (b.action === 'suspend' || b.action === 'activate') { await env.DB.prepare('UPDATE users SET status=? WHERE id=?').bind(b.action === 'suspend' ? 'suspended' : 'active', seg[1]).run(); if (b.action === 'suspend') await env.DB.prepare('DELETE FROM sessions WHERE uid=?').bind(seg[1]).run(); return J({ ok: true }); }
      if (b.action === 'reset') { const pw = rnd(5), salt = rnd(16); await env.DB.prepare('UPDATE users SET pass=?,salt=?,totp=NULL WHERE id=?').bind(await pbk(pw, salt), salt, seg[1]).run(); await env.DB.prepare('DELETE FROM sessions WHERE uid=?').bind(seg[1]).run(); return J({ ok: true, password: pw }); }
    }
  }
  throw fail(404, 'Not found.');
}
