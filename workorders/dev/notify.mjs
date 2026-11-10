// End-to-end test of alerts: web push (real encryption + VAPID check), SMS webhook, notices, reminders, scheduler.
// Usage: node dev/notify.mjs http://localhost:8788 <password> dev/local.db
import http from 'node:http';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
const [BASE, PW, DBF] = process.argv.slice(2);
const db = new DatabaseSync(DBF);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const b64u = (b) => Buffer.from(b).toString('base64url');
async function login(email) {
  const r = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PW }) });
  const ck = r.headers.get('set-cookie').split(';')[0];
  const call = async (method, p, body, extra) => { const res = await fetch(BASE + '/api' + p, { method, headers: { cookie: ck, 'content-type': 'application/json', ...(extra || {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: res.status, data: await res.json().catch(() => ({})) }; };
  return { get: (p) => call('GET', p), post: (p, b, h) => call('POST', p, b || {}, h) };
}
/* ---- fake push service: decrypts RFC 8291 and verifies the VAPID JWT ---- */
const inbox = {}; // endpoint id -> [payload]
const devices = {};
function newDevice(id) {
  const ecdh = crypto.createECDH('prime256v1'); ecdh.generateKeys();
  const auth = crypto.randomBytes(16);
  devices[id] = { ecdh, auth }; inbox[id] = [];
  return { endpoint: `http://localhost:8799/push/${id}`, keys: { p256dh: b64u(ecdh.getPublicKey()), auth: b64u(auth) } };
}
const hk = (salt, ikm, info, len) => Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info, len));
let vapidPub = null, badJwt = 0;
function verifyVapid(h, endpoint) {
  const m = /^vapid t=([^,]+), k=(.+)$/.exec(h || ''); if (!m) return false;
  const [hd, cl, sig] = m[1].split('.');
  if (vapidPub && m[2] !== vapidPub) return false;
  const pub = Buffer.from(m[2], 'base64url');
  const key = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) }, format: 'jwk' });
  const good = crypto.verify('sha256', Buffer.from(hd + '.' + cl), { key, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url'));
  const c = JSON.parse(Buffer.from(cl, 'base64url'));
  return good && c.aud === new URL(endpoint).origin && c.exp > Date.now() / 1000 && /^mailto:/.test(c.sub);
}
function decrypt(id, body) {
  const { ecdh, auth } = devices[id];
  const salt = body.subarray(0, 16), idlen = body[20], asPub = body.subarray(21, 21 + idlen), ct = body.subarray(21 + idlen);
  const secret = ecdh.computeSecret(asPub);
  const ikm = hk(auth, secret, Buffer.concat([Buffer.from('WebPush: info\0'), ecdh.getPublicKey(), asPub]), 32);
  const cek = hk(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16), nonce = hk(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12);
  const d = crypto.createDecipheriv('aes-128-gcm', cek, nonce); d.setAuthTag(ct.subarray(ct.length - 16));
  const pt = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  if (pt[pt.length - 1] !== 2) throw new Error('bad padding delimiter');
  return JSON.parse(pt.subarray(0, -1).toString());
}
const sms = [];
const srv = http.createServer((req, res) => {
  const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => {
    const body = Buffer.concat(chunks);
    if (req.url.startsWith('/sms')) { sms.push({ auth: req.headers.authorization, ...JSON.parse(body) }); res.writeHead(200); return res.end('{}'); }
    const id = req.url.split('/').pop();
    if (id === 'gone') { res.writeHead(410); return res.end(); }
    if (!verifyVapid(req.headers.authorization, 'http://localhost:8799' + req.url) || req.headers['content-encoding'] !== 'aes128gcm') { badJwt++; res.writeHead(403); return res.end(); }
    try { inbox[id].push(decrypt(id, body)); res.writeHead(201); } catch (e) { console.log('decrypt error', e.message); res.writeHead(400); }
    res.end();
  });
});
await new Promise((r) => srv.listen(8799, r));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const mgr = await login('manager@meazim.com'), fe = await login('foreman.electrical@meazim.com');
const kuda = await login('tech.kuda@meazim.com'), tendai = await login('tech.tendai@meazim.com'), cs = await login('client.shamva@meazim.com');
const ids = Object.fromEntries(db.prepare('SELECT email, id FROM users').all().map((u) => [u.email.split('@')[0], u.id]));

// secrets never leave the server
const me = (await mgr.get('/me')).data.settings;
ok(!('sms_token' in me) && !('vapid_private' in me) && !('cron_key' in me), 'secrets are not sent to the browser');
const key = (await kuda.get('/push/key')).data.key; vapidPub = key;
ok(/^[A-Za-z0-9_-]{87}$/.test(key), 'VAPID public key generated (65 bytes)');
ok((await kuda.get('/push/key')).data.key === key, 'VAPID key is stable');
// subscribe devices
ok((await kuda.post('/push/subscribe', newDevice('kuda'))).status === 200, 'technician subscribes phone');
ok((await tendai.post('/push/subscribe', newDevice('tendai'))).status === 200, 'second technician subscribes');
ok((await mgr.post('/push/subscribe', newDevice('mgr'))).status === 200, 'manager subscribes');
ok((await cs.post('/push/subscribe', newDevice('client'))).status === 200, 'client subscribes');
ok((await kuda.post('/push/subscribe', { endpoint: 'http://localhost:8799/push/x', keys: { p256dh: 'short', auth: 'x' } })).status === 400, 'bad subscription rejected');
let r = await kuda.post('/push/test');
await wait(200);
ok(r.data.sent === 1 && inbox.kuda.length === 1 && /working/i.test(inbox.kuda[0].title), 'test push decrypted on device: ' + (inbox.kuda[0] || {}).title);
ok(badJwt === 0, 'VAPID signature verified by push service');

// job alert becomes a push
const fid = ids['foreman.electrical'];
r = await fe.post('/wo', { title: 'Urgent: MCC-2 incomer tripping', discipline: 'Electrical', type: 'Breakdown', priority: 'Urgent', asset_id: 1, lead_id: ids['tech.kuda'], scheduled_date: new Date().toISOString().slice(0, 10) });
await wait(200);
const jp = inbox.kuda.find((p) => /lead technician/.test(p.body));
ok(r.status === 201 && jp && jp.url === '/#/job/' + r.data.wo.id && jp.urgent && /WO-/.test(jp.title), 'job assignment arrives as urgent push with link: ' + (jp && jp.title));
const woId = r.data.wo.id;

// SMS through webhook gateway
db.prepare("INSERT INTO settings (key,value) VALUES ('sms_provider','webhook'),('sms_user','http://localhost:8799/sms'),('sms_token','tok123') ON CONFLICT(key) DO UPDATE SET value=excluded.value").run();
db.prepare("UPDATE users SET phone='0772 123 456' WHERE email='manager@meazim.com'").run();
db.prepare("UPDATE users SET phone='+263 77 999 0001' WHERE email='tech.kuda@meazim.com'").run();
ok((await mgr.get('/me')).data.settings.sms_on === true, 'SMS shows as on');
r = await mgr.post('/sms/test');
ok(r.status === 200 && sms.length === 1 && sms[0].to[0] === '+263772123456' && sms[0].auth === 'Bearer tok123', 'test SMS sent, local number converted to +263: ' + (sms[0] && sms[0].to));
ok((await kuda.post('/sms/test')).status === 403, 'only managers can send SMS tests');

// notice board
ok((await kuda.post('/notices', { title: 'x', to: 'staff' })).status === 403, 'technician cannot post notices');
const before = inbox.kuda.length, smsBefore = sms.length;
r = await mgr.post('/notices', { title: 'New LOTO procedure from Monday', body: 'Read the attached steps.\nToolbox talk at 7:00.', to: 'trade', trade: 'Electrical', priority: 'Urgent', ack: true, pinned: true, sms: true });
await wait(200);
const annId = r.data.id;
const elec = db.prepare("SELECT COUNT(*) n FROM users WHERE status='active' AND role IN ('tech','foreman') AND trade='Electrical'").get().n;
ok(r.status === 201 && r.data.recipients === elec, `notice to Electrical team reaches ${r.data.recipients} people`);
const np = inbox.kuda.slice(before).find((p) => /LOTO/.test(p.title));
ok(np && np.url === '/#/notices' && np.urgent, 'notice arrives as push: ' + (np && np.title));
ok(sms.length > smsBefore && sms[sms.length - 1].message.includes('URGENT'), 'urgent notice also sent by SMS to ' + (sms[sms.length - 1] || {}).to);
ok(!inbox.client.some((p) => /LOTO/.test(p.title || '')), 'client does not get staff notice');
let nl = (await kuda.get('/notices')).data.items;
let n = nl.find((a) => a.id === annId);
ok(n && n.recipient && !n.read_at && n.pinned && n.audience_label === 'Electrical team', 'technician sees the notice as new');
ok((await kuda.get('/notifications')).data.notices >= 1, 'unread notice count for badge');
ok(!(await cs.get('/notices')).data.items.some((a) => a.id === annId), 'client cannot see it');
await kuda.post('/notices/' + annId, { read: 1 });
await kuda.post('/notices/' + annId, { ack: 1 });
ok((await kuda.post('/notices/' + annId, { delete: 1 })).status === 403, 'technician cannot delete notice');
let rc = (await mgr.get('/notices/' + annId + '/receipts')).data.items;
ok(rc.find((x) => x.name === 'Kudakwashe Moyo' || x.ack_at) && rc.filter((x) => x.ack_at).length === 1, 'receipts show 1 acknowledged');
const tb = inbox.tendai.length;
r = await mgr.post('/notices/' + annId, { remind: 1 });
await wait(200);
ok(r.data.reminded === elec - 1 && inbox.tendai.length === tb + (db.prepare("SELECT trade FROM users WHERE email='tech.tendai@meazim.com'").get().trade === 'Electrical' ? 1 : 0), `remind the rest reaches ${r.data.reminded}, not the one who acknowledged`);
r = await mgr.post('/notices', { title: 'Plant shutdown 20 Dec', to: 'client', client_id: 1, priority: 'Important' });
await wait(200);
ok(r.status === 201 && inbox.client.some((p) => /shutdown/.test(p.title)), 'notice to one client reaches the client phone');

// reminders
ok((await kuda.post('/reminders', { title: 'x', to: 'staff', date: '2030-01-01', time: '07:00' })).status === 403, 'technician cannot remind groups');
ok((await kuda.post('/reminders', { title: 'x', to: 'me', date: '2020-01-01', time: '07:00' })).status === 400, 'reminder in the past rejected');
r = await kuda.post('/reminders', { title: 'Calibrate insulation tester', to: 'me', date: '2030-01-01', time: '07:30', repeat: 'none' });
ok(r.status === 200 && r.data.next_at === '2030-01-01T05:30:00Z', 'reminder stored in UTC from Harare time: ' + r.data.next_at);
r = await mgr.post('/reminders', { title: 'Submit weekly timesheets', body: 'Before 16:00', to: 'tech', date: '2030-01-04', time: '14:00', repeat: 'weekly', sms: true });
ok(r.status === 200, 'manager sets a weekly reminder for all technicians');
const rems = (await mgr.get('/reminders')).data.items;
ok(rems.length >= 2 && rems.some((x) => x.audience_label === 'All technicians'), 'manager sees reminders');
ok(!(await tendai.get('/reminders')).data.items.some((x) => /Calibrate/.test(x.title)), 'technicians only see their own reminders');
// make them due and run the scheduler with the cron key
db.prepare("UPDATE reminders SET next_at='2026-01-01T05:00:00Z'").run();
const ck = crypto.randomBytes(24).toString('hex');
db.prepare("INSERT INTO settings (key,value) VALUES ('cron_key',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(ck);
ok((await fetch(BASE + '/api/cron', { method: 'POST', headers: { 'content-type': 'application/json', 'x-cron-key': 'wrong-key-wrong-key-wrong' }, body: '{}' })).status === 403, 'scheduler refuses a wrong key');
const kb = inbox.kuda.length, sb = sms.length;
db.prepare("DELETE FROM auto_sent").run();
db.prepare("INSERT INTO settings (key,value) VALUES ('reminder_hour','0') ON CONFLICT(key) DO UPDATE SET value=excluded.value").run();
let cr = await fetch(BASE + '/api/cron', { method: 'POST', headers: { 'content-type': 'application/json', 'x-cron-key': ck }, body: '{}' }).then((x) => x.json());
await wait(300);
ok(cr.reminders === 2, 'scheduler sent 2 due reminders');
ok(cr.daily === true, 'scheduler ran the daily job reminders');
const kp = inbox.kuda.slice(kb);
ok(kp.some((p) => /Calibrate/.test(p.title)) && kp.some((p) => /timesheets/.test(p.title)), 'technician phone got both reminders');
ok(kp.some((p) => /on your schedule today/.test(p.body)), 'daily: today\'s job reminder sent to the lead: ' + (kp.find((p) => /schedule today/.test(p.body)) || {}).body);
ok(sms.length > sb, 'SMS reminder sent');
const after = db.prepare('SELECT * FROM reminders ORDER BY id').all();
ok(after[0].active === 0 && after[1].active === 1 && after[1].next_at > new Date().toISOString() && new Date(after[1].next_at).getUTCDay() === 4, 'one-off finished, weekly moved to next week: ' + after[1].next_at);
cr = await fetch(BASE + '/api/cron', { method: 'POST', headers: { 'content-type': 'application/json', 'x-cron-key': ck }, body: '{}' }).then((x) => x.json());
ok(cr.reminders === 0 && cr.daily === false, 'running again sends nothing twice');
// overdue + review waiting
db.prepare("UPDATE work_orders SET due_date='2026-01-05' WHERE id=?").run(woId);
db.prepare("DELETE FROM auto_sent").run();
const fb = db.prepare('SELECT COUNT(*) n FROM notifications WHERE user_id=?').get(fid).n;
await fetch(BASE + '/api/cron', { method: 'POST', headers: { 'content-type': 'application/json', 'x-cron-key': ck }, body: '{}' });
ok(db.prepare("SELECT COUNT(*) n FROM notifications WHERE user_id=? AND text LIKE '%overdue%'").get(fid).n >= 1 && db.prepare('SELECT COUNT(*) n FROM notifications WHERE user_id=?').get(fid).n > fb, 'overdue job alerts the foreman');
// stale subscription cleanup and opt-out
db.prepare("INSERT INTO push_subs (user_id, endpoint, p256dh, auth) VALUES (?, 'http://localhost:8799/push/gone', ?, ?)").run(ids['tech.kuda'], newDevice('g').keys.p256dh, newDevice('g2').keys.auth);
await kuda.post('/push/test'); await wait(200);
ok(!db.prepare("SELECT 1 FROM push_subs WHERE endpoint LIKE '%gone'").get(), 'expired phone subscription removed');
await kuda.post('/me/prefs', { notify_push: false, notify_sms: false });
const k2 = inbox.kuda.length;
await mgr.post('/notices', { title: 'Opt-out check', to: 'tech' }); await wait(200);
ok(inbox.kuda.length === k2 && (await kuda.get('/notices')).data.items.some((a) => a.title === 'Opt-out check'), 'opted-out user gets in-app notice but no push');
await kuda.post('/me/prefs', { notify_push: true, notify_sms: true });
const all = (await kuda.get('/notifications/all')).data.items;
ok(all.length >= 5 && all.some((x) => x.kind === 'reminder') && all.some((x) => x.kind === 'notice'), 'alert history keeps job, notice and reminder alerts');
srv.close();
console.log(fails ? fails + ' FAILED' : 'all notification checks passed');
process.exit(fails ? 1 : 0);
