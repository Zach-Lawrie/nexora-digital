// v3 checks: stores and spares, clock on/off, booked vs actual, approval separation, failure codes,
// analysis, condition monitoring, runtime PM, TPM public page, OEE, projects, client branding.
// Usage: node dev/v3.mjs http://localhost:8788 <password> [--quiet]   (run after migrations/v3-demo.sql is loaded)
import fs from 'node:fs';
const BASE = process.argv[2], PW = process.argv[3], quiet = process.argv.includes('--quiet');
const SIGN = 'data:image/png;base64,' + fs.readFileSync(new URL('./sign.png', import.meta.url)).toString('base64');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else if (!quiet) console.log('ok  ', m); };
async function login(email) {
  const r = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PW }) });
  if (r.status !== 200) throw new Error('login failed ' + email);
  const ck = r.headers.get('set-cookie').split(';')[0];
  const call = async (method, p, body) => { const res = await fetch(BASE + '/api' + p, { method, headers: { cookie: ck, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const ct = res.headers.get('content-type') || ''; return { status: res.status, data: ct.includes('json') ? await res.json() : await res.text() }; };
  return { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b || {}) };
}
const pub = async (method, p, body) => { const res = await fetch(BASE + '/api' + p, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { status: res.status, data: await res.json() }; };
const admin = await login('admin@meazim.com'), mgr = await login('manager@meazim.com'), fe = await login('foreman.electrical@meazim.com');
const kuda = await login('tech.kuda@meazim.com'), ruth = await login('tech.ruth@meazim.com'), cs = await login('client.shamva@meazim.com');
await admin.post('/settings', { stores_control: '0' }); // v3 checks techs issuing directly; v4.mjs covers the stores department
const L = (await mgr.get('/lookups')).data;
const uid = (n) => L.staff.find((s) => s.name === n).id;
ok(L.stores.length >= 2 && L.parts.length >= 10 && L.fail.component.length > 5, 'lookups carry stores, parts and failure lists');

// --- stores ---
let st = (await mgr.get('/stores')).data;
ok(st.parts.some((p) => p.low), 'low stock parts flagged');
const brg = st.parts.find((p) => p.part_no === 'BRG-6316-C3');
ok(brg.total === 8, 'stock across stores: ' + brg.total);
ok((await kuda.get('/stores')).status === 200 && (await cs.get('/stores')).status === 403, 'staff see stores, clients do not');
let r = await mgr.post('/parts', { part_no: 'TEST-001', name: 'Test fuse 10 A', unit: 'each', cost: 2, min_qty: 5, store_id: 1, qty: 10, bin: 'Z-1' });
ok(r.status === 201, 'add part with opening stock');
const tp = r.data.id;
ok((await mgr.post('/parts', { part_no: 'TEST-001', name: 'dup' })).status === 409, 'duplicate part number blocked');
ok((await kuda.post('/parts', { part_no: 'X', name: 'Y' })).status === 403, 'tech cannot edit catalogue');
ok((await mgr.post('/stock', { part_id: tp, store_id: 1, qty: 20, kind: 'receive', unit_cost: 3, ref: 'INV-1' })).status === 200, 'receive delivery');
r = (await mgr.get('/stores/part/' + tp)).data;
ok(r.part.cost === 2.67 && r.stock[0].qty === 30, 'weighted average cost ' + r.part.cost);
ok((await mgr.post('/stock', { part_id: tp, store_id: 1, to_store_id: 2, qty: 5, kind: 'transfer' })).status === 200, 'transfer between stores');
r = await mgr.post('/stock', { part_id: tp, store_id: 1, qty: 24, kind: 'count' });
ok(r.status === 200 && r.data.diff === -1, 'stock count adjusts difference');
ok((await mgr.post('/stock', { part_id: tp, store_id: 2, qty: -50, kind: 'adjust' })).status === 400, 'cannot go below zero');

// --- job with spares, clock, booked vs actual ---
r = await fe.post('/wo', { title: 'Replace ball mill motor bearings', discipline: 'Electrical', type: 'Corrective maintenance', priority: 'High', asset_id: 1, lead_id: uid('Kudakwashe Rusike'), est_hours: 2 });
const id = r.data.wo.id;
await kuda.post('/wo/' + id + '/team', { user_id: uid('Ruth Gora'), role_text: 'Technician' });
let d = (await kuda.get('/wo/' + id)).data;
ok(d.spares.length >= 2 && d.spares.some((s) => s.part_no === 'BRG-6316-C3'), 'job shows the asset spares list');
ok((await kuda.post('/wo/' + id + '/clock', { action: 'start', kind: 'work' })).status === 400, 'cannot clock on to work before starting the job');
ok((await kuda.post('/wo/' + id + '/clock', { action: 'start', kind: 'travel' })).status === 200, 'clock on travel before start');
await kuda.post('/wo/' + id + '/checklist', { items: d.checklist.filter((c) => c.section.startsWith('Safety')).map((c) => ({ id: c.id, result: 'Pass' })) });
ok((await kuda.post('/wo/' + id + '/status', { to: 'in_progress' })).status === 200, 'start job');
d = (await kuda.get('/wo/' + id)).data;
ok(d.clock.mine && d.clock.mine.kind === 'work', 'start job clocks the tech on to work automatically');
ok(d.clock.rows.some((x) => x.kind === 'travel' && x.end_at), 'travel clock closed when work starts');
ok((await kuda.post('/wo/' + id + '/clock', { action: 'start', kind: 'work', user_id: uid('Ruth Gora') })).status === 200, 'lead clocks a team member on');
ok((await ruth.post('/wo/' + id + '/clock', { action: 'start', kind: 'work', user_id: uid('Kudakwashe Rusike') })).status === 403, 'team member cannot clock others');
// issue parts
r = await kuda.post('/wo/' + id + '/issue', { part_id: brg.id, store_id: 1, qty: 2 });
ok(r.status === 200 && r.data.left === 4, 'issue bearings to job, 4 left in store');
ok((await kuda.post('/wo/' + id + '/issue', { part_id: brg.id, store_id: 2, qty: 5 })).status === 400, 'cannot issue more than in the store');
d = (await kuda.get('/wo/' + id)).data;
const line = d.materials.find((m) => m.part_id === brg.id);
ok(line && line.unit_cost === 145 && line.qty === 2, 'issued part becomes a costed material line');
ok((await kuda.post('/wo/' + id + '/return', { material_id: line.id, qty: 1 })).status === 200, 'return one bearing');
ok((await mgr.get('/stores/part/' + brg.id)).data.stock.find((s) => s.store_id === 1).qty === 5, 'stock back to 5 after return');
ok((await kuda.post('/purchase', { part_id: brg.id, qty: 4, wo_id: id, note: 'Running low' })).status === 201, 'tech raises purchase request');
const pr = (await mgr.get('/stores')).data.requests.find((x) => x.part_id === brg.id);
ok((await mgr.post('/purchase', { id: pr.id, status: 'ordered', supplier: 'Bearing Man' })).status === 200, 'manager orders');
ok((await mgr.post('/purchase', { id: pr.id, status: 'received', store_id: 1 })).status === 200, 'delivery received into store');
ok((await kuda.get('/notifications')).data.items.some((n) => /arrived/.test(n.text)), 'requester told parts arrived');
// on hold waiting for parts
ok((await kuda.post('/wo/' + id + '/status', { to: 'on_hold', note: 'Waiting for seals', wait: 'wait_parts' })).status === 200, 'hold: waiting for parts');
d = (await kuda.get('/wo/' + id)).data;
ok(d.clock.mine && d.clock.mine.kind === 'wait_parts' && !d.clock.rows.some((x) => x.kind === 'work' && !x.end_at), 'hold stops work clocks and starts waiting time');
await kuda.post('/wo/' + id + '/status', { to: 'in_progress' });
await kuda.post('/wo/' + id + '/time', { hours: 6, note: 'Bearing change' });
d = (await kuda.get('/wo/' + id)).data;
ok(d.labour.flag && d.labour.booked === 6, 'booked 6 h vs a few minutes on the clock is flagged');
await kuda.post('/wo/' + id + '/checklist', { items: d.checklist.map((c) => ({ id: c.id, result: 'Pass' })) });
await kuda.post('/wo/' + id + '/update', { work_done: 'Replaced DE bearing.' });
r = await kuda.post('/wo/' + id + '/status', { to: 'completed', sign: SIGN });
ok(r.status === 400 && /failure details/.test(r.data.error), 'corrective job needs failure codes');
ok((await kuda.post('/wo/' + id + '/update', { fail_component: 'Bearing', fail_mode: 'Vibration / noise', fail_cause: 'Lack of lubrication', fail_action: 'Replaced' })).status === 200, 'tech records failure codes');
ok((await kuda.post('/wo/' + id + '/status', { to: 'completed', sign: SIGN })).status === 200, 'submit job');
ok(!(await kuda.get('/wo/' + id)).data.clock.rows.some((x) => !x.end_at), 'submit stops every clock');
// approval separation
ok((await mgr.post('/wo/' + id + '/status', { to: 'approved' })).status === 400, 'cannot approve before review');
ok((await mgr.post('/wo/' + id + '/status', { to: 'reviewed' })).status === 200, 'manager reviews');
r = await mgr.post('/wo/' + id + '/status', { to: 'approved' });
ok(r.status === 403 && /reviewed this job/.test(r.data.error), 'reviewer cannot approve the same job');
ok((await fe.post('/wo/' + id + '/status', { to: 'approved' })).status === 403, 'foreman cannot approve with no limit');
await admin.post('/settings', { approval_limit: '200' });
r = await fe.post('/wo/' + id + '/status', { to: 'approved' });
ok(r.status === 403 && /above your approval limit/.test(r.data.error), 'foreman blocked above limit');
ok((await admin.post('/wo/' + id + '/status', { to: 'approved' })).status === 200, 'a different manager approves');
ok((await admin.get('/wo/' + id)).data.wo.reviewer === 'Lawrence Mumba', 'reviewer stored');
await admin.post('/settings', { approval_limit: '0' });

// --- breakdown with downtime, analysis ---
r = await fe.post('/wo', { title: 'Slurry pump seized', discipline: 'Mechanical', type: 'Breakdown', priority: 'Urgent', asset_id: 2, lead_id: uid('Kudakwashe Rusike'), downtime_start: new Date(Date.now() - 5 * 3600e3).toISOString() });
const bd = r.data.wo.id;
ok(r.data.wo.downtime_start, 'breakdown has downtime start');
r = (await mgr.get('/analysis')).data;
ok(r.summary.jobs >= 2 && r.labour.length >= 4 && Array.isArray(r.bad_actors) && r.summary.stock_value > 0, 'analysis returns summary, labour, bad actors, stock value');
ok(r.pareto.component.some((x) => x[0] === 'Bearing'), 'failure pareto includes bearing');
ok(r.booked_vs_actual.some((x) => x.flag), 'booked vs actual list flags the job');
ok((await kuda.get('/analysis')).status === 403, 'tech cannot open company analysis');
r = (await kuda.get('/labour')).data;
ok(r.people.length === 1 && r.people[0].name === 'Kudakwashe Rusike', 'tech sees only own labour figures');
ok((await mgr.get('/labour')).data.people.length >= 4, 'manager sees everyone');

// --- condition monitoring ---
let cm = (await kuda.get('/cm')).data;
ok(cm.items.length >= 5 && cm.items[0].history.length > 2, 'condition points with trend history');
const vib = cm.items.find((p) => p.name === 'Motor DE bearing vibration');
r = await kuda.post('/cm/readings', { point_id: vib.id, value: 5.2 });
ok(r.data.status === 'warn' && !r.data.job, 'warning reading, no job');
r = await kuda.post('/cm/readings', { point_id: vib.id, value: 7.6, note: 'Rumbling noise' });
ok(r.data.status === 'alarm' && /^WO-/.test(r.data.job), 'alarm reading creates a job ' + r.data.job);
r = await kuda.post('/cm/readings', { point_id: vib.id, value: 7.9 });
ok(r.data.status === 'alarm' && !r.data.job, 'no duplicate job while one is open');
ok((await kuda.post('/cm/points', { asset_id: 1, kind: 'oil' })).status === 403, 'tech cannot add points');
ok((await mgr.post('/cm/points', { asset_id: 7, kind: 'temperature', name: 'Gearbox oil temperature', warn: 80, alarm: 95 })).status === 200, 'manager adds point');
// runtime PM
const hrs = cm.items.find((p) => p.kind === 'hours');
await kuda.post('/cm/readings', { point_id: hrs.id, value: 1255 });
r = (await mgr.get('/dashboard')).data;
const genJob = (await mgr.get('/wo')).data.items.find((w) => /250-hour/.test(w.title));
ok(genJob, 'running hours reached: generator service job created');
if (genJob) { d = (await mgr.get('/wo/' + genJob.id)).data; ok(d.reservations.length >= 2, 'PM job reserved its spares: ' + d.reservations.length); }

// --- TPM ---
r = await mgr.post('/tpm', { asset_id: 7, qr: true });
const tok = r.data.token;
ok(/^[a-f0-9]{24}$/.test(tok), 'machine QR token');
ok((await pub('GET', '/public/tpm/ffffffffffffffffffffffff')).status === 404, 'bad token rejected');
r = await pub('GET', '/public/tpm/' + tok);
ok(r.status === 200 && r.data.items.length >= 4 && r.data.asset.tag === 'CV-03', 'public operator page loads without login');
const items = r.data.items;
ok((await pub('POST', '/public/tpm/' + tok, { operator: 'Farai', results: [] })).status === 400, 'every check must be answered');
r = await pub('POST', '/public/tpm/' + tok, { operator: 'Farai', shift: 'Day', hour_meter: 14350, results: items.map((i, n) => ({ id: i.id, ok: n !== 1, note: n === 1 ? 'Oil low' : '' })) });
ok(r.status === 201 && /^WO-/.test(r.data.fault), 'check with a problem creates a fault tag job');
r = await pub('POST', '/public/oee/' + tok, { operator: 'Farai', planned_min: 480, downtime_min: 30, ideal_rate: 12, total_units: 5000, good_units: 4900 });
ok(r.status === 201 && r.data.oee > 80 && r.data.oee < 90, 'OEE calculated ' + r.data.oee + '%');
ok((await mgr.get('/tpm')).data.logs.length >= 1, 'TPM log visible to managers');

// --- projects ---
r = (await mgr.get('/projects')).data;
ok(r.items.length >= 1 && r.items[0].progress > 0 && r.items[0].spent > 0, 'project list with progress and spend');
const prj = r.items[0].id;
ok((await mgr.post('/wo/' + id + '/update', { project_id: prj })).status === 200, 'link job to project');
r = (await mgr.get('/projects/' + prj)).data.item;
ok(r.wos.length >= 1 && r.labour > 0 && r.parts > 0 && r.budget_pct > 0, 'project budget vs actual includes labour, parts and subcontractors');
const ms = r.milestones.find((m) => !m.done_at);
ok((await mgr.post('/projects/' + prj + '/milestone', { id: ms.id, done: true })).status === 200, 'tick milestone');
ok((await cs.get('/notifications')).data.items.some((n) => /milestone/.test(n.text)), 'client told about milestone');
r = (await cs.get('/projects/' + prj)).data.item;
ok(r && r.budget === undefined && r.spent === undefined, 'client sees progress but not budget');
ok((await cs.get('/projects')).data.items.every((p) => p.client_id === 1), 'client sees only own projects');
// branding
ok((await mgr.post('/clients', { id: 1, name: 'Shamva Gold Processing', color: '#1f6f43', white_label: true })).status === 200, 'client branding saved');
ok((await mgr.get('/wo/' + id)).data.wo.client_color === '#1f6f43', 'job carries client brand colour');
ok((await mgr.get('/export/stock')).status === 200, 'stock export');
console.log(fails ? fails + ' FAILED' : 'ALL V3 CHECKS OK');
process.exit(fails ? 1 : 0);
