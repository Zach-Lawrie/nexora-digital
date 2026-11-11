// v4 checks: stores department. Stores and department logins, requests to stores from jobs and departments,
// approval, picking and issuing, shortages to purchase orders, suppliers, receiving, usage by department.
// Usage: node dev/v4.mjs http://localhost:8788 <password> [--quiet]   (after v3-demo.sql is loaded)
const BASE = process.argv[2], PW = process.argv[3], quiet = process.argv.includes('--quiet');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else if (!quiet) console.log('ok  ', m); };
async function login(email, pw = PW) {
  const r = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
  if (r.status !== 200) throw new Error('login failed ' + email);
  const ck = r.headers.get('set-cookie').split(';')[0];
  const call = async (method, p, body) => { const res = await fetch(BASE + '/api' + p, { method, headers: { cookie: ck, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const ct = res.headers.get('content-type') || ''; return { status: res.status, data: ct.includes('json') ? await res.json() : await res.text() }; };
  return { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b || {}) };
}
const admin = await login('admin@meazim.com'), mgr = await login('manager@meazim.com'), fe = await login('foreman.electrical@meazim.com'), kuda = await login('tech.kuda@meazim.com'), cs = await login('client.shamva@meazim.com');
await admin.post('/settings', { stores_control: '1', req_approval: '1', po_limit: '1000' });
// logins
async function newUser(email, name, role, trade) {
  let r = await admin.post('/users', { email, name, role, trade });
  if (r.status === 409) return login(email, 'Stores-Test-123');
  const u = await login(email, r.data.password);
  await u.post('/me/password', { current: r.data.password, password: 'Stores-Test-123' });
  return login(email, 'Stores-Test-123');
}
const st = await newUser('stores.test@meazim.com', 'Stores Test', 'stores', 'Stores');
const dp = await newUser('safety.test@meazim.com', 'Safety Officer Test', 'dept', 'Safety & PPE');
ok((await st.get('/stores/home')).status === 200, 'stores login opens the stores home');
ok((await dp.get('/stores')).status === 200, 'department login can look up parts');
ok((await dp.get('/wo')).data.items.length === 0, 'department login sees no work orders');
ok((await dp.post('/stock', { part_id: 1, store_id: 1, qty: 5, kind: 'receive' })).status === 403, 'department cannot change stock');
ok((await kuda.post('/stock', { part_id: 1, store_id: 1, qty: 5, kind: 'receive' })).status === 403, 'tech cannot change stock');
// job request
const L = (await mgr.get('/lookups')).data, uid = (n) => L.staff.find((s) => s.name === n).id;
let r = await fe.post('/wo', { title: 'Replace MCC-02 incomer fuses', discipline: 'Electrical', type: 'Corrective maintenance', asset_id: 4, lead_id: uid('Kudakwashe Rusike') });
const wo = r.data.wo.id;
ok((await st.get('/wo/' + wo)).status === 200, 'stores can read a job');
ok((await st.post('/wo/' + wo + '/status', { to: 'in_progress' })).status === 403, 'stores cannot work jobs');
ok((await kuda.post('/wo/' + wo + '/issue', { part_id: 7, store_id: 1, qty: 3 })).status === 403, 'tech cannot self-issue when the stores controls stock');
r = await kuda.post('/requisitions', { wo_id: wo, lines: [{ part_id: 7, qty: 3 }, { part_id: 5, qty: 2 }, { item: 'Cable ties 300 mm', qty: 1 }], priority: 'Urgent' });
ok(r.status === 201 && r.data.status === 'requested', 'job request goes straight to stores: ' + r.data.number);
const rq = r.data.id;
ok((await st.get('/notifications')).data.items.some((n) => /URGENT stores request/.test(n.text)), 'stores alerted');
let d = (await st.get('/requisitions/' + rq)).data.item;
ok(d.lines.length === 3 && d.lines[0].free === 4, 'request shows free stock per line');
ok((await st.post('/requisitions/' + rq, { action: 'ready' })).status === 200, 'stores marks it ready');
ok((await kuda.get('/notifications')).data.items.some((n) => /ready to collect/.test(n.text)), 'tech told it is ready');
r = await st.post('/requisitions/' + rq, { action: 'issue', collected_by: 'Kuda', lines: [{ id: d.lines[0].id, qty: 3 }, { id: d.lines[1].id, qty: 2 }] });
ok(r.status === 400 && /only 1/.test(r.data.error), 'cannot issue more than is free: ' + r.data.error);
r = await st.post('/requisitions/' + rq, { action: 'issue', collected_by: 'Kuda', lines: [{ id: d.lines[0].id, qty: 3 }, { id: d.lines[1].id, qty: 1 }] });
ok(r.status === 200 && r.data.status === 'part_issued', 'part issue ' + JSON.stringify(r.data));
const job = (await kuda.get('/wo/' + wo)).data;
ok(job.materials.filter((m) => m.part_id).length === 2, 'issued parts land on the job as costed materials');
d = (await st.get('/requisitions/' + rq)).data.item;
// contactor: asked 2, issued 1, free 0 -> short 1
r = await st.post('/requisitions/' + rq, { action: 'link', line_id: d.lines[2].id, part_id: 6 });
ok(r.status === 200, 'free-text line linked to a catalogue part');
// make contactor short: free is 0 now
r = await st.post('/requisitions/' + rq, { action: 'purchase' });
ok(r.status === 200 && r.data.ordered >= 1, 'shortage raised as purchase request: ' + JSON.stringify(r.data));
// suppliers + PO
ok((await st.post('/suppliers', { name: 'ABB Zimbabwe', contact: 'Sales desk', phone: '+263 242 000 000', lead_days: 5 })).status === 200, 'supplier added');
const sup = (await st.get('/suppliers')).data.items.find((s) => s.name === 'ABB Zimbabwe');
const prs = (await st.get('/stores')).data.requests.filter((p) => p.status === 'requested');
r = await st.post('/po', { supplier_id: sup.id, from_requests: prs.map((p) => p.id) });
ok(r.status === 201 && r.data.total > 0, 'purchase order from requests: ' + r.data.number + ' ' + r.data.total);
const po = r.data.id;
r = await st.post('/po/' + po, { action: 'send' });
ok(r.data.status === (r.data.status === 'approval' ? 'approval' : 'ordered'), 'send: ' + r.data.status);
if (r.data.status === 'approval') ok((await mgr.post('/po/' + po, { action: 'approve' })).data.status === 'ordered', 'manager approves big order');
// big order needs approval
const big = await st.post('/po', { supplier_id: sup.id, lines: [{ part_id: 5, qty: 3, unit_cost: 640 }] });
ok((await st.post('/po/' + big.data.id, { action: 'send' })).data.status === 'approval', 'order over the limit waits for a manager');
ok((await st.post('/po/' + big.data.id, { action: 'approve' })).status === 403, 'stores cannot approve its own big order');
ok((await mgr.post('/po/' + big.data.id, { action: 'approve' })).data.status === 'ordered', 'manager approves');
let pd = (await st.get('/po/' + po)).data.item;
r = await st.post('/po/' + po, { action: 'receive', ref: 'DN-551', lines: pd.lines.map((l) => ({ id: l.id, qty: l.qty })) });
ok(r.data.status === 'received', 'delivery received in full');
ok((await kuda.get('/notifications')).data.items.some((n) => /missing items have arrived/.test(n.text)), 'requester told the missing items arrived');
d = (await st.get('/requisitions/' + rq)).data.item;
r = await st.post('/requisitions/' + rq, { action: 'issue', collected_by: 'Kuda' });
ok(r.status === 200 && r.data.status === 'issued', 'rest issued, request complete');
// department request needs approval
r = await dp.post('/requisitions', { department: 'Safety & PPE', lines: [{ part_id: 8, qty: 4 }], note: 'Grease for the workshop' });
ok(r.data.status === 'awaiting_approval', 'department request waits for approval');
const dq = r.data.id;
ok((await st.post('/requisitions/' + dq, { action: 'issue' })).status === 400, 'stores cannot issue before approval');
ok((await dp.post('/requisitions/' + dq, { action: 'approve' })).status === 403, 'requester cannot approve');
ok((await mgr.post('/requisitions/' + dq, { action: 'approve' })).status === 200, 'manager approves');
ok((await st.post('/requisitions/' + dq, { action: 'issue', collected_by: 'Safety officer' })).data.status === 'issued', 'issued to the department');
ok((await dp.get('/requisitions')).data.items.every((x) => x.requested_by), 'department sees its own requests');
r = await dp.post('/requisitions', { lines: [{ part_id: 1, qty: 1 }] });
ok((await mgr.post('/requisitions/' + r.data.id, { action: 'reject' })).status === 400 && (await mgr.post('/requisitions/' + r.data.id, { action: 'reject', note: 'Use the old one' })).status === 200, 'reject needs a reason');
r = (await st.get('/stores/usage')).data;
ok(r.by_dept.some((x) => x.dept === 'Safety & PPE' && x.value > 0) && r.by_dept.some((x) => x.dept === 'Electrical'), 'issues by department: ' + r.by_dept.map((x) => x.dept + ' ' + x.value).join(', '));
ok((await cs.get('/stores')).status === 403, 'clients cannot see stores');
ok((await st.get('/stores/home')).data.po_open >= 0, 'stores home counts');
console.log(fails ? fails + ' FAILED' : 'ALL V4 CHECKS OK');
process.exit(fails ? 1 : 0);
