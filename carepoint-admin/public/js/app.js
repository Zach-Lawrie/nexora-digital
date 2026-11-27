/* CarePoint Admin: shell, routing, sign-in, dashboard, search, reports, settings. */
'use strict';
const STOCKERS = () => ['admin', 'store', 'nic', 'accounts', 'dept'].includes(APP.me.role);
const NAV = [
  ['Overview', [['dashboard', 'Dashboard', '◧', () => true], ['search', 'Search', '⌕', () => true]]],
  ['Stock', [['medical', 'Drugs & sundries', '✚', STOCKERS], ['requests', 'Department requests', '⇄', () => APP.can('requests')], ['deptuse', 'Department usage', '▤', () => APP.can('deptuse')], ['misuse', 'Misuse check', '⚑', () => APP.can('counts') && APP.me.role !== 'kiosk'], ['closing', 'Monthly closing', '▥', () => APP.can('counts') && APP.me.role !== 'kiosk'], ['orders', 'Procurement', '⎘', () => APP.can('orders')], ['suppliers', 'Suppliers', '☏', () => APP.can('suppliers') && APP.me.role !== 'kiosk'], ['stationery', 'Stationery', '✎', STOCKERS], ['registers', 'Books, cards & registers', '▣', STOCKERS], ['groceries', 'Groceries', '◍', STOCKERS]]],
  ['Kiosk', [['kiosk', 'Kiosk refreshments', '☕', () => APP.can('moves') && ['admin', 'kiosk', 'accounts', 'store'].includes(APP.me.role)]]],
  ['Money', [['theatres', 'Theatres', '✂', () => APP.can('theatres')], ['claims', 'Claims', '⧉', () => APP.can('claims')], ['cash', 'Cash book', '$', () => APP.can('cash')]]],
  ['Operations', [['licences', 'Licences & compliance', '✓', () => APP.can('licences')], ['assets', 'Assets', '◫', () => APP.can('assets')], ['repairs', 'Maintenance & repairs', '⚒', () => APP.can('repairs')], ['vehicles', 'Vehicles', '⛟', () => APP.can('vehicles')]]],
  ['People', [['attendance', 'Attendance register', '◷', () => true], ['employees', 'Employees', '☺', () => APP.can('employees')], ['leave', 'Leave', '✈', () => APP.can('leave')]]],
  ['Management', [['meetings', 'Meetings & minutes', '❝', () => APP.can('meetings')], ['goals', 'Strategic plan', '◎', () => APP.can('goals')]]],
  ['Health data', [['patients', 'Patients seen', '♥', () => APP.can('patients')], ['births', 'Deliveries', '✿', () => APP.can('births')], ['epi', 'Disease patterns', '∿', () => APP.can('patients') && APP.me.role !== 'dept']]],
  ['Reports', [['reports', 'Monthly report', '▦', () => APP.me.role !== 'kiosk' && APP.me.role !== 'dept']]],
  ['Admin', [['settings', 'Settings', '⚙', () => APP.me.role === 'admin'], ['users', 'Users & logins', '⚿', () => APP.me.role === 'admin'], ['backup', 'Backup & restore', '⛁', () => APP.me.role === 'admin'], ['audit', 'Activity log', '☰', () => APP.me.role === 'admin']]],
];
const PAGES = {
  dashboard: { t: 'Dashboard', r: dashboard }, search: { t: 'Search', r: searchPage },
  medical: { t: 'Drugs & surgical sundries', r: (el) => stockPage(el, 'medical') }, stationery: { t: 'Stationery', r: (el) => stockPage(el, 'stationery') }, registers: { t: 'Books, cards & registers', r: (el) => stockPage(el, 'registers') }, groceries: { t: 'Groceries (staff and patients only)', r: (el) => stockPage(el, 'groceries') },
  requests: { t: 'Department requests', r: requestsPage }, deptuse: { t: 'Department usage', r: deptUsePage }, misuse: { t: 'Misuse & mistakes check', r: misusePage }, closing: { t: 'Monthly closing balance', r: closingPage },
  orders: { t: 'Procurement: ordered vs received', r: ordersPage }, suppliers: { t: 'Suppliers', r: (el) => crud(el, SUPPLIERS) }, kiosk: { t: 'Kiosk refreshments', r: kioskPage },
  theatres: { t: 'Theatres', r: (el) => crud(el, THEATRE) }, claims: { t: 'Daily claims by medical aid', r: (el) => crud(el, CLAIMS) }, cash: { t: 'Cash book', r: (el) => crud(el, CASH) },
  licences: { t: 'Licences & compliance', r: (el) => crud(el, LICENCES) }, assets: { t: 'Assets', r: (el) => crud(el, ASSETS) }, repairs: { t: 'Maintenance & repairs', r: (el) => crud(el, REPAIRS) }, vehicles: { t: 'Vehicles', r: (el) => crud(el, VEHICLES) },
  attendance: { t: 'Attendance register', r: attendancePage }, employees: { t: 'Employees', r: (el) => crud(el, EMPLOYEES) }, leave: { t: 'Leave', r: (el) => crud(el, LEAVE) },
  meetings: { t: 'Meetings & minutes', r: (el) => crud(el, MEETINGS) }, goals: { t: 'Strategic plan', r: (el) => crud(el, GOALS) },
  patients: { t: 'Patients seen / admitted', r: (el) => crud(el, PATIENTS) }, births: { t: 'Deliveries', r: (el) => crud(el, BIRTHS) }, epi: { t: 'Disease patterns', r: epiPage }, dept: { t: 'Department', r: deptPage },
  reports: { t: 'Monthly report', r: reportsPage }, settings: { t: 'Settings', r: settingsPage }, users: { t: 'Users & logins', r: usersPage }, backup: { t: 'Backup & restore', r: backupPage }, audit: { t: 'Activity log', r: auditPage }, account: { t: 'My account', r: accountPage },
};
let ROUTE = 'dashboard';
// the menu: fixed sections plus one link per department (from Settings)
function navHtml() {
  const ds = deptList();
  const depts = ds.length ? `<div class="ng"><span>Departments</span>${ds.map((n) => `<a href="${deptHref(n)}" data-k="dept/${esc(n)}"><i>${deptIcon(n)}</i>${esc(n)}<em data-badge="d:${esc(n)}"></em></a>`).join('')}</div>` : '';
  return NAV.map(([g, items], gi) => { const vis = items.filter((i) => i[3]()); return (vis.length ? `<div class="ng"><span>${esc(g)}</span>${vis.map(([k, t, ic]) => `<a href="#/${k}" data-k="${k}"><i>${ic}</i>${esc(t)}<em data-badge="${k}"></em></a>`).join('')}</div>` : '') + (gi === 0 ? depts : ''); }).join('');
}
let NAVSIG = '';
function allowed(k) { if (k === 'dept') return deptList().length > 0; for (const [, items] of NAV) for (const it of items) if (it[0] === k) return it[3](); return k === 'account'; }
function go(k) { location.hash = '#/' + k; }
function rerender() { const el = $('#main'); if (!el) return; const y = el.scrollTop; try { PAGES[ROUTE].r(el); } catch (e) { console.error(e); el.innerHTML = `<div class="empty">This page hit a problem: ${esc(e.message)}</div>`; } el.scrollTop = y; }
function route() {
  const k = (location.hash.match(/^#\/([a-z]+)/) || [])[1] || 'dashboard';
  ROUTE = PAGES[k] && allowed(k) ? k : 'dashboard';
  $('#title').textContent = PAGES[ROUTE].t;
  const cur = ROUTE === 'dept' ? 'dept/' + currentDept() : ROUTE;
  $$('#nav a').forEach((a) => a.setAttribute('aria-current', a.dataset.k === cur ? 'page' : 'false'));
  document.body.classList.remove('navopen');
  $('#main').scrollTop = 0; rerender();
}
addEventListener('hashchange', () => APP.me && route());

/* ---------------- shell ---------------- */
function shell() {
  const s = APP.settings();
  document.title = s.hospital + ' · CarePoint Admin';
  $('#app').innerHTML = `<aside id="side"><div class="brand">${brandMark()}<div><b>${esc(s.hospital)}</b><span>CarePoint Admin</span></div></div>
    <nav id="nav">${navHtml()}</nav>
    <div class="me-i">${installBtn('sm ghost light')}</div><div class="me"><a href="#/account"><b>${esc(APP.me.name)}</b><span>${esc(APP.roles[APP.me.role])}${APP.me.dept ? ' · ' + esc(APP.me.dept) : ''}</span></a><button class="btn sm ghost" id="logout">Sign out</button></div></aside>
    <div id="shade"></div>
    <section id="page"><header id="top"><button id="menu" aria-label="Menu">☰</button><h1 id="title"></h1><span class="sp"></span><input id="gsearch" type="search" placeholder="Search item, patient, vehicle, staff" aria-label="Search"><span id="sync" class="sync"></span></header><main id="main"></main></section>`;
  $('#menu').onclick = () => document.body.classList.toggle('navopen');
  $('#shade').onclick = () => document.body.classList.remove('navopen');
  $('#logout').onclick = async () => { if (APP.outbox.length && !confirm(APP.outbox.length + ' changes are not saved to the server yet. Sign out anyway? They will be lost.')) return; try { await api('logout', {}); } catch (e) {} indexedDB.deleteDatabase('cp-' + APP.me.id); location.reload(); };
  $('#gsearch').onkeydown = (e) => { if (e.key === 'Enter') { PS('search', {}).q = e.target.value; go('search'); if (ROUTE === 'search') rerender(); } };
  NAVSIG = JSON.stringify(deptList()); syncBadge(); route(); badges();
}
function badges() {
  const b = { requests: APP.can('requests') ? APP.all('requests').filter((r) => r.status === 'pending').length : 0, medical: APP.can('items') ? lowItems(['drug', 'sundry']).length : 0, repairs: APP.all('repairs').filter(repairLate).length, orders: APP.can('orders') ? APP.all('orders').filter((o) => ['Late', 'Closed short'].includes(orderStatus(o)[0])).length : 0, licences: APP.can('licences') ? APP.all('licences').filter(licDue).length : 0, meetings: APP.can('meetings') ? openActions().filter((a) => a.due && a.due < today()).length : 0 };
  if (APP.can('requests')) APP.all('requests').filter((r) => r.status === 'pending' && r.dept).forEach((r) => { b['d:' + r.dept] = (b['d:' + r.dept] || 0) + 1; });
  $$('[data-badge]').forEach((e) => { const n = b[e.dataset.badge]; e.textContent = n ? n : ''; e.hidden = !n; });
}
APP.listeners.push(() => { if (APP.me && $('#main')) { const sig = JSON.stringify(deptList()); if (sig !== NAVSIG) { NAVSIG = sig; $('#nav').innerHTML = navHtml(); const cur = ROUTE === 'dept' ? 'dept/' + currentDept() : ROUTE; $$('#nav a').forEach((x) => x.setAttribute('aria-current', x.dataset.k === cur ? 'page' : 'false')); } const h = APP.settings().hospital, b = $('#side .brand b'); if (b && b.textContent !== h) { b.textContent = h; document.title = h + ' · CarePoint Admin'; } rerender(); badges(); } });

/* ---------------- dashboard ---------------- */
function alertsList() {
  const A = [], s = APP.settings(), add = (tone, text, k) => A.push({ tone, text, k });
  if (['admin', 'store', 'nic', 'kiosk'].includes(APP.me.role)) lowItems(APP.me.role === 'kiosk' ? ['kiosk'] : null).forEach((i) => add((balances()[i.id] || 0) <= 0 ? 'bad' : 'warn', `${i.name}: ${fnum(balances()[i.id])} ${i.unit || ''} left (minimum ${fnum(i.min)})`, i.cat === 'kiosk' ? 'kiosk' : ['drug', 'sundry'].includes(i.cat) ? 'medical' : i.cat === 'stationery' ? 'stationery' : i.cat === 'register' ? 'registers' : 'groceries'));
  if (['admin', 'store', 'nic'].includes(APP.me.role)) expiring().slice(0, 8).forEach((x) => add(x.expired ? 'bad' : 'warn', `${x.item.name} batch ${x.m.batch || ''} ${x.expired ? 'EXPIRED' : 'expires'} ${fdate(x.m.expiry)}`, 'medical'));
  if (APP.can('licences')) APP.all('licences').filter(licDue).forEach((l) => { const d = licDays(l); add(d == null || d <= 30 ? 'bad' : 'warn', d == null ? `${l.name} (${l.body || ''}) has no expiry date recorded` : d < 0 ? `LICENCE EXPIRED: ${l.name} (${l.body || ''}) expired ${fdate(l.expiry)}. Renew now to avoid penalties or closure.` : `Licence ${l.status === 'Renewal in progress' ? 'being renewed' : 'expiring'}: ${l.name} (${l.body || ''}) expires in ${d} days, ${fdate(l.expiry)}${l.responsible ? ' · ' + l.responsible : ''}`, 'licences'); });
  if (APP.can('requests')) APP.all('requests').filter((r) => r.status === 'pending').forEach((r) => add('info', `${r.dept} is waiting for approval of ${r.lines.length} item${r.lines.length > 1 ? 's' : ''}`, 'requests'));
  if (APP.can('orders')) APP.all('orders').forEach((o) => { const st = orderStatus(o)[0]; if (['Late', 'Closed short'].includes(st)) orderLines(o).filter((l) => l.outstanding).forEach((l) => add('bad', `You ordered ${fnum(l.qty)} ${itemName(l.item)}, only ${fnum(l.received)} received, ${fnum(l.outstanding)} missing (${nameOf('suppliers', o.supplier)})`, 'orders')); });
  APP.all('repairs').filter(repairLate).forEach((r) => add('bad', `Repair taking too long: ${r.what} (${r.location}), ${repairAge(r)} days`, 'repairs'));
  if (APP.can('vehicles')) APP.all('vehicles').forEach((v) => vehicleAlerts(v).forEach(([t, tone]) => add(tone, `${v.reg}: ${t}`, 'vehicles')));
  if (APP.can('assets')) APP.all('assets').filter((a) => a.service_due && a.service_due <= addDays(today(), 14) && a.condition !== 'Disposed').forEach((a) => add('warn', `${a.name} service ${a.service_due < today() ? 'overdue' : 'due'} ${fdate(a.service_due)}`, 'assets'));
  if (APP.can('meetings')) openActions().filter((a) => a.due && a.due <= addDays(today(), 3)).forEach((a) => add(a.due < today() ? 'bad' : 'warn', `Action point ${a.due < today() ? 'overdue' : 'due ' + fdate(a.due)}: ${a.what} (${a.who || 'no one assigned'})`, 'meetings'));
  if (APP.can('goals')) APP.all('goals').forEach((g) => { const st = goalState(g)[0]; if (st === 'Delayed' || st === 'Deadline near') add(st === 'Delayed' ? 'bad' : 'warn', `Strategic goal ${st.toLowerCase()}: ${g.goal} (${g.owner})`, 'goals'); });
  if (APP.can('employees')) APP.all('employees').filter((e) => e.active !== false && e.contract_end && e.contract_end <= addDays(today(), 30)).forEach((e) => add('warn', `${e.name}'s contract ends ${fdate(e.contract_end)}`, 'employees'));
  if (APP.can('cash')) cashChecks(APP.all('cash').filter((c) => c.date >= addDays(today(), -7))).slice(0, 6).forEach((x) => add('bad', `Cash book ${fdate(x.c.date)}: ${x.why}`, 'cash'));
  if (APP.can('counts') && APP.me.role !== 'kiosk') { const sh = APP.all('counts').filter((c) => c.month === thisMonth() && num(c.diff) < 0); if (sh.length) add('bad', `${sh.length} item${sh.length > 1 ? 's' : ''} short on this month's physical counts`, 'misuse'); }
  if (APP.can('patients') && APP.me.role !== 'dept') outbreaks().forEach((o) => add('bad', `Possible outbreak: ${o.d}, ${o.now} cases this week (usually ${fnum(o.avg, 1)})`, 'epi'));
  return A.sort((a, b) => ({ bad: 0, warn: 1, info: 2 }[a.tone] - { bad: 0, warn: 1, info: 2 }[b.tone]));
}
function dashboard(el) {
  const t = today(), A = alertsList();
  const tiles = [];
  if (['admin', 'store', 'nic'].includes(APP.me.role)) tiles.push(['medical', lowItems().length, 'items low on stock', lowItems().length ? 'alert' : '']);
  if (APP.can('theatres')) tiles.push(['theatres', APP.all('theatres').filter((x) => x.date === t).length, "today's theatre cases"]);
  if (APP.can('claims')) { const c = APP.all('claims').filter((x) => x.date === t); tiles.push(['claims', c.length, `claims today · ${money(sum(c, 'amount'))}`]); }
  if (APP.can('licences')) { const ls = APP.all('licences'); tiles.push(['licences', ls.filter(licDue).length, ls.length ? 'licences expiring or expired' : 'licences: add yours', ls.some((l) => licDays(l) != null && licDays(l) <= 30 && l.status !== 'Not needed any more') ? 'alert' : '']); }
  tiles.push(['repairs', APP.all('repairs').filter((r) => r.status !== 'Fixed').length, 'repairs pending', APP.all('repairs').some(repairLate) ? 'alert' : '']);
  if (APP.can('vehicles')) tiles.push(['vehicles', APP.all('vehicles').filter((v) => vehicleAlerts(v).length).length, 'vehicles due for service / renewal']);
  if (APP.can('orders')) tiles.push(['orders', APP.all('orders').filter((o) => !['Complete', 'Cancelled', 'Closed short'].includes(orderStatus(o)[0])).length, 'outstanding orders']);
  if (APP.can('meetings')) tiles.push(['meetings', openActions().length, 'action points pending']);
  if (APP.can('moves') && ['admin', 'kiosk', 'accounts'].includes(APP.me.role)) { const km = APP.all('moves').filter((m) => m.cat === 'kiosk'); tiles.push(['kiosk', money(sum(km.filter((m) => m.reason === 'Sold' && m.date === t), 'amount')), `kiosk sales today · ${money(sum(km.filter((m) => m.reason === 'Sold'), 'amount') - sum(km.filter((m) => m.type === 'handover'), 'amount'))} at kiosk`]); }
  if (APP.can('cash')) { const c = APP.all('cash').filter((x) => x.date === t); tiles.push(['cash', money(sum(c, (x) => (x.kind === 'Income' ? 1 : -1) * num(x.amount))), 'net cash today']); }
  if (APP.can('requests')) tiles.push(['requests', APP.all('requests').filter((r) => r.status === 'pending').length, 'requests to approve']);
  if (APP.can('patients')) tiles.push(['patients', APP.all('patients').filter((p) => p.date === t).length, 'patients recorded today']);
  if (APP.can('births')) tiles.push(['births', APP.all('births').filter((b) => monthOf(b.date) === thisMonth()).length, 'deliveries this month']);
  const myAtt = APP.me.emp && APP.all('attendance').find((a) => a.emp === APP.me.emp && a.date === t);
  el.innerHTML = `<p class="hello">Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${esc(APP.me.name.split(' ')[0])}. ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.${APP.me.emp && !myAtt ? ' <a href="#/attendance">Sign in to the register</a>.' : ''}</p>
    <div class="tiles">${tiles.map(([k, v, l, tone]) => `<a class="tile ${tone || ''}" href="#/${k}"><b>${v}</b><span>${esc(l)}</span></a>`).join('')}</div>
    <div class="grid2"><div class="card"><h3>Alerts ${A.length ? `<span class="pill bad">${A.length}</span>` : ''}</h3>${A.length ? `<ul class="alerts">${A.slice(0, 40).map((a) => `<li class="${a.tone}"><a href="#/${a.k}">${esc(a.text)}</a></li>`).join('')}</ul>${A.length > 40 ? `<p class="muted sm">and ${A.length - 40} more</p>` : ''}` : '<div class="empty ok">All clear. Nothing needs your attention right now.</div>'}</div>
    <div class="card"><h3>Quick actions</h3><div class="qa">${[
      APP.can('moves', true) && APP.me.role !== 'kiosk' && ['Stock in', () => stockIn()], APP.can('moves', true) && APP.me.role !== 'kiosk' && ['Stock out', () => stockOut({ cats: ['drug', 'sundry', 'stationery', 'register'] })],
      APP.can('requests', true) && ['Request stock', () => requestForm()], APP.can('deptuse', true) && ['Record use on patient', deptUseForm],
      APP.can('patients', true) && ['Record patient', () => editDoc(PATIENTS, null)], APP.can('births', true) && ['Record delivery', () => editDoc(BIRTHS, null)],
      APP.can('theatres', true) && ['Theatre case', () => editDoc(THEATRE, null)], APP.can('claims', true) && ['Add claim', () => editDoc(CLAIMS, null)], APP.can('cash', true) && ['Cash book entry', () => editDoc(CASH, null)],
      ['Report a repair', () => editDoc(REPAIRS, null)], APP.can('trips', true) && ['Log a trip', () => editDoc(TRIPS, null)], APP.can('meetings', true) && ['Record a meeting', () => editDoc(MEETINGS, null)],
    ].filter(Boolean).map(([t], i) => `<button class="btn ghost" data-qa="${i}">${esc(t)}</button>`).join('')}</div></div></div>`;
  const qa = [APP.can('moves', true) && APP.me.role !== 'kiosk' && (() => stockIn()), APP.can('moves', true) && APP.me.role !== 'kiosk' && (() => stockOut({ cats: ['drug', 'sundry', 'stationery', 'register'] })), APP.can('requests', true) && (() => requestForm()), APP.can('deptuse', true) && deptUseForm, APP.can('patients', true) && (() => editDoc(PATIENTS, null)), APP.can('births', true) && (() => editDoc(BIRTHS, null)), APP.can('theatres', true) && (() => editDoc(THEATRE, null)), APP.can('claims', true) && (() => editDoc(CLAIMS, null)), APP.can('cash', true) && (() => editDoc(CASH, null)), () => editDoc(REPAIRS, null), APP.can('trips', true) && (() => editDoc(TRIPS, null)), APP.can('meetings', true) && (() => editDoc(MEETINGS, null))].filter(Boolean);
  $$('[data-qa]', el).forEach((b) => (b.onclick = () => qa[b.dataset.qa]()));
}

/* ---------------- search ---------------- */
function searchPage(el) {
  const st = PS('search', { q: '' }), q = st.q.trim().toLowerCase();
  const hit = (...v) => v.some((x) => String(x || '').toLowerCase().includes(q));
  const groups = q.length < 2 ? [] : [
    APP.can('items') && ['Stock items', APP.all('items').filter((i) => hit(i.name, i.code)), (i) => `<b>${esc(i.name)}</b> · ${CATS[i.cat]} · balance ${fnum(balances()[i.id])}`, (i) => itemDetail(i)],
    APP.can('theatres') && ['Theatre patients', APP.all('theatres').filter((t) => hit(t.patient, t.file_no)), (t) => `<b>${esc(t.patient)}</b> · ${esc(t.file_no || '')} · ${fdate(t.date)} · ${esc(t.discipline)}`, (t) => editDoc(THEATRE, t)],
    APP.can('claims') && ['Claims', APP.all('claims').filter((c) => hit(c.patient, c.file_no, c.member_no)), (c) => `<b>${esc(c.patient)}</b> · ${esc(c.aid)} · ${fdate(c.date)} · ${money(c.amount)}`, (c) => editDoc(CLAIMS, c)],
    APP.can('moves') && ['Stock issued to patients', APP.all('moves').filter((m) => m.patient && hit(m.patient)), (m) => `<b>${esc(m.patient)}</b> · ${esc(m.item_name)} × ${fnum(m.qty)} · ${fdate(m.date)} · ${esc(m.dept || '')}`, (m) => itemDetail(APP.get('items', m.item))],
    APP.can('vehicles') && ['Vehicles', APP.all('vehicles').filter((v) => hit(v.reg, v.type, v.driver, v.make)), (v) => `<b>${esc(v.reg)}</b> · ${esc(v.type)} · ${esc(v.driver || '')}`, (v) => editDoc(VEHICLES, v)],
    APP.can('employees') && ['Employees', APP.all('employees').filter((e) => hit(e.name, e.emp_no, e.phone, e.position)), (e) => `<b>${esc(e.name)}</b> · ${esc(e.position || '')} · ${esc(e.dept || '')}`, (e) => editDoc(EMPLOYEES, e)],
    APP.can('licences') && ['Licences', APP.all('licences').filter((l) => hit(l.name, l.body, l.number)), (l) => `<b>${esc(l.name)}</b> · ${esc(l.body || '')} · ${licState(l)[0]}`, (l) => LICENCES.open(l)],
    APP.can('assets') && ['Assets', APP.all('assets').filter((a) => hit(a.name, a.tag, a.serial)), (a) => `<b>${esc(a.name)}</b> · ${esc(a.tag || '')} · ${esc(a.location || '')}`, (a) => editDoc(ASSETS, a)],
    APP.can('suppliers') && ['Suppliers', APP.all('suppliers').filter((s) => hit(s.name, s.contact)), (s) => `<b>${esc(s.name)}</b>`, (s) => editDoc(SUPPLIERS, s)],
    ['Repairs', APP.all('repairs').filter((r) => hit(r.what, r.location)), (r) => `<b>${esc(r.what)}</b> · ${esc(r.location)} · ${esc(r.status)}`, (r) => editDoc(REPAIRS, r)],
    APP.can('patients') && ['Patient records (by file no.)', APP.all('patients').filter((p) => p.file_no && hit(p.file_no)), (p) => `<b>${esc(p.file_no)}</b> · ${esc(p.diagnosis)} · ${fdate(p.date)}`, (p) => editDoc(PATIENTS, p)],
  ].filter(Boolean);
  el.innerHTML = `<div class="bar"><input type="search" id="sQ" placeholder="Type an item, patient, file no., vehicle or staff name" value="${esc(st.q)}" style="flex:1"></div>
    ${q.length < 2 ? '<div class="empty">Type at least 2 letters.</div>' : groups.filter((g) => g[1].length).map(([t, rows, f], gi) => `<div class="card"><h3>${esc(t)} <span class="muted">(${rows.length})</span></h3><ul class="hits">${rows.slice(0, 30).map((r, i) => `<li><button class="link" data-h="${gi}|${i}">${f(r)}</button></li>`).join('')}</ul></div>`).join('') || '<div class="empty">Nothing found.</div>'}`;
  const inp = $('#sQ'); inp.oninput = (e) => { st.q = e.target.value; clearTimeout(searchPage._t); searchPage._t = setTimeout(() => { rerender(); const i = $('#sQ'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); };
  if (!st.q) inp.focus();
  const vis = groups.filter((g) => g[1].length);
  $$('[data-h]', el).forEach((b) => (b.onclick = () => { const [g, i] = b.dataset.h.split('|').map(Number); vis[g][3](vis[g][1][i]); }));
}

/* ---------------- monthly report ---------------- */
function reportData(m) {
  const S = [], inM = (d) => monthOf(d) === m;
  if (APP.can('items')) {
    const rows = closingRows(m);
    S.push({ t: 'Stock: closing balances', cols: [{ h: 'Item', x: (r) => r.i.name }, { h: 'Category', x: (r) => CATS[r.i.cat] }, { h: 'Opening', x: (r) => r.open }, { h: 'Received', x: (r) => r.rec }, { h: 'Issued', x: (r) => r.iss }, { h: 'Expired / damaged', x: (r) => r.loss }, { h: 'Closing', x: (r) => r.close }, { h: 'Physical', x: (r) => r.physical ?? '' }, { h: 'Difference', x: (r) => r.diff ?? '' }, ...(APP.costOK ? [{ h: 'Value', x: (r) => +r.value.toFixed(2) }] : [])], rows: rows.filter((r) => r.i.cat !== 'kiosk'), sum: `${rows.filter((r) => r.rec).length} items received, ${rows.filter((r) => r.iss).length} issued, ${rows.filter((r) => r.diff < 0).length} short on count.` });
    const iss = moves().filter((x) => x.type === 'out' && inM(x.date) && x.dept);
    S.push({ t: 'Usage by department', cols: [{ h: 'Department', x: (r) => r[0] }, { h: 'Issues', x: (r) => r[1].length }, { h: 'Units', x: (r) => sum(r[1], 'qty') }, ...(APP.costOK ? [{ h: 'Value', x: (r) => +sum(r[1], (x) => num(x.qty) * lastCost(x.item)).toFixed(2) }] : []), { h: 'Main items', x: (r) => Object.entries(groupBy(r[1], 'item_name')).sort((a, b) => sum(b[1], 'qty') - sum(a[1], 'qty')).slice(0, 5).map(([k, a]) => k + ' ' + sum(a, 'qty')).join(', ') }], rows: Object.entries(groupBy(iss, 'dept')) });
    const gro = moves().filter((x) => x.cat && x.cat.startsWith('grocery') && inM(x.date));
    S.push({ t: 'Groceries', cols: [{ h: 'For', x: (r) => CATS[r[0]] }, { h: 'Bought (units)', x: (r) => sum(r[1].filter((x) => x.type === 'in'), 'qty') }, ...(APP.costOK ? [{ h: 'Spent', x: (r) => sum(r[1].filter((x) => x.type === 'in'), 'total') }] : []), { h: 'Taken out (units)', x: (r) => sum(r[1].filter((x) => x.type === 'out'), 'qty') }], rows: Object.entries(groupBy(gro, 'cat')) });
  }
  if (APP.can('orders')) { const os = APP.all('orders').filter((o) => inM(o.date)); S.push({ t: 'Procurement', cols: [{ h: 'Order', x: (o) => o.number }, { h: 'Supplier', x: (o) => nameOf('suppliers', o.supplier) }, { h: 'Ordered units', x: (o) => sum(orderLines(o), 'qty') }, { h: 'Received', x: (o) => sum(orderLines(o), 'received') }, { h: 'Outstanding / missing', x: (o) => sum(orderLines(o), 'outstanding') }, { h: 'Status', x: (o) => orderStatus(o)[0] }], rows: os }); }
  if (APP.can('moves') && ['admin', 'accounts', 'kiosk'].includes(APP.me.role)) { const km = APP.all('moves').filter((x) => x.cat === 'kiosk' && inM(x.date)); S.push({ t: 'Kiosk', cols: [{ h: 'Refreshment', x: (r) => r[0] }, { h: 'Bought', x: (r) => sum(r[1].filter((x) => x.type === 'in'), 'qty') }, { h: 'Sold', x: (r) => sum(r[1].filter((x) => x.reason === 'Sold'), 'qty') }, { h: 'Given free', x: (r) => sum(r[1].filter((x) => x.type === 'out' && x.reason !== 'Sold'), 'qty') }, { h: 'Money collected', x: (r) => sum(r[1].filter((x) => x.reason === 'Sold'), 'amount') }], rows: Object.entries(groupBy(km.filter((x) => x.item), 'item_name')), sum: `Collected ${money(sum(km.filter((x) => x.reason === 'Sold'), 'amount'))}, handed over ${money(sum(km.filter((x) => x.type === 'handover'), 'amount'))}.` }); }
  if (APP.can('theatres')) { const th = APP.all('theatres').filter((x) => inM(x.date)); S.push({ t: 'Theatres', cols: [{ h: 'Discipline', x: (r) => r[0] }, { h: 'Cases', x: (r) => r[1].length }, { h: 'Cash', x: (r) => r[1].filter((t) => t.pay !== 'Medical aid').length }, { h: 'Medical aid', x: (r) => r[1].filter((t) => t.pay === 'Medical aid').length }, ...(APP.moneyOK ? [{ h: 'Billed', x: (r) => sum(r[1], 'admit_amount') }, { h: 'Received', x: (r) => sum(r[1], (t) => theatreTotals(t).pp + theatreTotals(t).aid) }, { h: 'Owed', x: (r) => sum(r[1], (t) => theatreTotals(t).owed) }] : [])], rows: Object.entries(groupBy(th, 'discipline')) }); }
  if (APP.can('claims')) { const cl = APP.all('claims').filter((x) => inM(x.date)); S.push({ t: 'Claims by medical aid', cols: [{ h: 'Medical aid', x: (r) => r[0] }, { h: 'Claims', x: (r) => r[1].length }, { h: 'Claimed', x: (r) => sum(r[1], 'amount') }, { h: 'Paid', x: (r) => sum(r[1], 'paid_amount') }, { h: 'With errors', x: (r) => r[1].filter((c) => c.error).length }, { h: 'Main errors', x: (r) => Object.entries(groupBy(r[1].filter((c) => c.error), 'error_type')).map(([k, a]) => k + ' ' + a.length).join(', ') }], rows: Object.entries(groupBy(cl, 'aid')) }); }
  if (APP.can('cash')) { const ca = APP.all('cash').filter((x) => inM(x.date)), chk = cashChecks(ca); S.push({ t: 'Cash book', cols: [{ h: 'Category', x: (r) => r[0] }, { h: 'Income', x: (r) => sum(r[1].filter((c) => c.kind === 'Income'), 'amount') }, { h: 'Expenses', x: (r) => sum(r[1].filter((c) => c.kind === 'Expense'), 'amount') }], rows: Object.entries(groupBy(ca, 'category')), sum: `Income ${money(sum(ca.filter((c) => c.kind === 'Income'), 'amount'))}, expenses ${money(sum(ca.filter((c) => c.kind === 'Expense'), 'amount'))}, ${chk.length} errors / discrepancies.` }); }
  if (APP.can('licences')) S.push({ t: 'Licences & compliance', cols: [{ h: 'Licence', x: (l) => l.name }, { h: 'Authority', x: (l) => l.body }, { h: 'Number', x: (l) => l.number || '' }, { h: 'Expiry', x: (l) => l.expiry || '' }, { h: 'Status', x: (l) => licState(l)[0] }, { h: 'Responsible', x: (l) => l.responsible || '' }], rows: APP.all('licences').filter((l) => l.status !== 'Not needed any more').sort((a, b) => (a.expiry || '').localeCompare(b.expiry || '')) });
  S.push({ t: 'Maintenance & repairs', cols: [{ h: 'Reported', x: (r) => r.reported }, { h: 'What', x: (r) => r.what }, { h: 'Where', x: (r) => r.location }, { h: 'Urgent', x: (r) => (r.urgent ? 'Yes' : '') }, { h: 'Status', x: (r) => r.status }, { h: 'Days', x: (r) => repairAge(r) }], rows: APP.all('repairs').filter((r) => inM(r.reported) || (r.status !== 'Fixed' && r.reported <= m + '-31') || inM(r.fixed)) });
  if (APP.can('vehicles')) S.push({ t: 'Vehicles', cols: [{ h: 'Vehicle', x: (v) => v.reg }, { h: 'Trips', x: (v) => APP.all('trips').filter((t) => t.vehicle === v.id && inM(t.date)).length }, { h: 'Km', x: (v) => sum(APP.all('trips').filter((t) => t.vehicle === v.id && inM(t.date)), (t) => Math.max(0, num(t.km_in) - num(t.km_out))) }, { h: 'Fuel (L)', x: (v) => sum(APP.all('fuel').filter((f) => f.vehicle === v.id && inM(f.date)), 'litres') }, { h: 'Fuel cost', x: (v) => sum(APP.all('fuel').filter((f) => f.vehicle === v.id && inM(f.date)), 'cost') }, { h: 'Alerts', x: (v) => vehicleAlerts(v).map((a) => a[0]).join('; ') }], rows: APP.all('vehicles') });
  if (APP.can('employees')) S.push({ t: 'Staff attendance & leave', cols: [{ h: 'Employee', x: (e) => e.name }, { h: 'Days present', x: (e) => APP.all('attendance').filter((a) => a.emp === e.id && inM(a.date)).length }, { h: 'Leave days this month', x: (e) => sum(APP.all('leave').filter((l) => l.emp === e.id && inM(l.from)), 'days') }, { h: 'Annual leave left', x: (e) => num(e.leave_days) - leaveTaken(e.id, 'Annual') }], rows: APP.all('employees').filter((e) => e.active !== false) });
  if (APP.can('meetings')) S.push({ t: 'Meetings & action points', cols: [{ h: 'Date', x: (r) => r.date }, { h: 'Meeting', x: (r) => r.title || r.type }, { h: 'Decisions', x: (r) => r.decisions }, { h: 'Open actions', x: (r) => (r.actions || []).filter((a) => !a.done).length }], rows: APP.all('meetings').filter((x) => inM(x.date)) });
  if (APP.can('goals')) S.push({ t: 'Strategic plan', cols: [{ h: 'Goal', x: (g) => g.goal }, { h: 'Responsible', x: (g) => g.owner }, { h: 'End', x: (g) => g.end }, { h: 'Progress %', x: (g) => num(g.progress) }, { h: 'Status', x: (g) => goalState(g)[0] }], rows: APP.all('goals') });
  if (APP.can('patients') && APP.me.role !== 'dept') { const E = epiData(m); S.push({ t: 'Top 10 diseases', cols: [{ h: 'Disease', x: (r) => r.d }, { h: 'Cases', x: (r) => r.n }, { h: 'Last month', x: (r) => r.prev }, { h: 'Male', x: (r) => r.m }, { h: 'Female', x: (r) => r.f }, { h: 'Under 5', x: (r) => r.u5 }], rows: E.top.slice(0, 10), sum: `${E.ps.length} patients, ${E.births.length} deliveries (${E.births.filter((b) => /Caesarean/.test(b.mode)).length} C-sections), ${E.bb.filter((b) => b.outcome === 'Live birth').length} live births, ${E.bb.filter((b) => /stillbirth/.test(b.outcome)).length} stillbirths, ${E.deaths.length} deaths.` }); }
  return S;
}
function reportsPage(el) {
  const st = PS('reports', { month: thisMonth() }), S = reportData(st.month);
  const html = S.map((s) => `<section class="rsec"><h3>${esc(s.t)}</h3>${s.sum ? `<p class="muted">${esc(s.sum)}</p>` : ''}${table(s.cols.map((c) => ({ h: c.h, num: false, f: (r) => { const v = c.x(r); return typeof v === 'number' ? fnum(v, v % 1 ? 2 : 0) : esc(v); } })), s.rows, { empty: 'Nothing recorded this month.', limit: 1000 })}</section>`).join('');
  el.innerHTML = `<div class="bar"><input type="month" id="rm" value="${st.month}"><span class="sp"></span><button class="btn" id="rP">Print / save as PDF</button><button class="btn ghost" id="rX">Download Excel</button></div><h2>${esc(APP.settings().hospital)}: monthly report, ${monthName(st.month)}</h2>${html}`;
  $('#rm').onchange = (e) => { st.month = e.target.value; rerender(); };
  $('#rP').onclick = () => printArea('Monthly report ' + monthName(st.month), html);
  $('#rX').onclick = () => downloadXlsx('Monthly report ' + st.month, [...S.map((s) => [s.t, [s.cols.map((c) => c.h), ...s.rows.map((r) => s.cols.map((c) => c.x(r)))]]), ...(APP.can('patients') && APP.me.role !== 'dept' ? epiSheets(st.month) : [])]);
}

/* ---------------- settings, users, backup, audit, account ---------------- */
function settingsPage(el) {
  const s = APP.settings();
  const list = (k, lab, help) => `<div class="fld full"><label>${lab}</label><textarea name="${k}" rows="4">${esc((s[k] || []).join('\n'))}</textarea><small>${help || 'One per line.'}</small></div>`;
  el.innerHTML = `<form class="form card" id="setF"><div class="fld half"><label>Hospital name and logo</label><div class="row gap" style="align-items:center">${brandMark()}<b>${esc(s.hospital)}</b></div><small class="muted">Set by Nexora Digital. Ask them to change the name or logo.</small></div><div class="fld half"><label>Currency symbol</label><input name="currency_symbol" value="${esc(s.currency_symbol)}"></div>
    ${list('departments', 'Departments')}${list('aids', 'Medical aid societies')}${list('diagnoses', 'Diagnosis list', 'One per line. Staff can still type others.')}${list('areas', 'Areas / villages / suburbs patients come from')}${list('disciplines', 'Theatre disciplines')}${list('claim_errors', 'Claim error types')}${list('kiosk_reasons', 'Kiosk reasons (keep “Sold” first)')}
    <div class="fld third"><label>Urgent repair too long after (days)</label><input type="number" name="repair_days_urgent" value="${s.repair_days_urgent}"></div><div class="fld third"><label>Normal repair too long after (days)</label><input type="number" name="repair_days_normal" value="${s.repair_days_normal}"></div><div class="fld third"><label>Warn about expiry (days before)</label><input type="number" name="expiry_warn_days" value="${s.expiry_warn_days}"></div>
    <div class="fld half"><label>Warn before licence / insurance expiry (days)</label><input type="number" name="vehicle_warn_days" value="${s.vehicle_warn_days}"></div><div class="fld half"><label>Warn before service (days)</label><input type="number" name="service_warn_days" value="${s.service_warn_days}"></div>
    <div class="actions"><span class="sp"></span><button class="btn">Save settings</button></div></form>`;
  $('#setF').onsubmit = (e) => {
    e.preventDefault(); const f = e.target, d = { id: 'main' };
    d.currency_symbol = f.elements.currency_symbol.value.trim();
    ['departments', 'aids', 'diagnoses', 'areas', 'disciplines', 'claim_errors', 'kiosk_reasons'].forEach((k) => (d[k] = f.elements[k].value.split('\n').map((x) => x.trim()).filter(Boolean)));
    ['repair_days_urgent', 'repair_days_normal', 'expiry_warn_days', 'vehicle_warn_days', 'service_warn_days'].forEach((k) => (d[k] = num(f.elements[k].value)));
    if (!d.kiosk_reasons.includes('Sold')) d.kiosk_reasons.unshift('Sold');
    APP.save('settings', { ...(APP.get('settings', 'main') || {}), ...d }); toast('Settings saved'); shell();
  };
}
async function usersPage(el) {
  el.innerHTML = '<div class="empty">Loading…</div>';
  let users = []; try { users = (await api('users')).users; } catch (e) { el.innerHTML = `<div class="empty">${esc(e.message)} Users can only be managed while online.</div>`; return; }
  el.innerHTML = `<div class="note">Each person gets their own login. The role decides what they can see. Only <b>Administrator</b> and <b>Accounts & claims</b> see money (cash book, claims, theatre payments). Department staff only see their own department.</div>
    <div class="bar"><span class="sp"></span><button class="btn" id="uAdd">+ New login</button></div>
    ${table([{ h: 'Name', f: (u) => `<b>${esc(u.name)}</b>${u.active ? '' : ' ' + pill('Disabled', 'bad')}<br><span class="muted sm">${esc(u.username)}</span>` }, { h: 'Role', f: (u) => esc(APP.roles[u.role]) + (u.dept ? `<br><span class="muted sm">${esc(u.dept)}</span>` : '') }, { h: 'Linked employee', f: (u) => esc(nameOf('employees', u.emp)) }, { h: 'Last sign-in', f: (u) => (u.last_login ? fdate(u.last_login) + ' ' + ftime(u.last_login) : pill(u.must_change ? 'Not signed in yet' : 'Never', 'warn')) }], users, { click: (u) => userForm(u) })}
    <h3 class="mt">What each role can do</h3>${table([{ h: 'Role', f: (r) => `<b>${esc(APP.roles[r])}</b>` }, { h: 'Can see', f: (r) => esc(Object.entries(APP.perms).filter(([c, p]) => p.r.includes(r) && c !== 'settings').map(([c]) => COLNAMES[c] || c).join(', ')) }], Object.keys(APP.roles))}`;
  $('#uAdd').onclick = () => userForm(null);
  function userForm(u) {
    formSheet(u ? u.name : 'New login', [{ k: 'name', label: 'Full name', req: true, half: true }, { k: 'username', label: 'Username (for signing in)', req: true, half: true, ro: !!u }, { k: 'role', label: 'Role', type: 'select', opts: Object.entries(APP.roles), req: true, half: true }, { k: 'dept', label: 'Department (for department staff)', type: 'select', opts: LOOK.dept, half: true }, { k: 'emp', label: 'Linked employee (for the attendance register)', type: 'select', opts: LOOK.employee, half: true }, ...(u ? [{ k: 'active', label: 'Login active', type: 'check', half: true }] : [{ k: 'password', label: 'Starting password (blank = make one)', half: true }])], u || { role: 'dept' }, (d) => {
      api('users', { ...d, id: u && u.id }).then((r) => { if (r.password) showPw(d.username, r.password); else toast('Saved'); usersPage(el); }).catch((e) => toast(e.message, true));
    }, { extra: u ? '<p><button type="button" class="btn sm ghost" id="uReset">Reset password</button></p>' : '' });
    if (u) $('#uReset').onclick = () => confirmBox(`Make a new password for ${esc(u.name)}? Their old one stops working.`, 'Reset', () => api('users', { id: u.id, reset: true }).then((r) => showPw(u.username, r.password)).catch((e) => toast(e.message, true)));
  }
  function showPw(user, pw) { sheet('Login details', `<p>Give these to the person. They must choose their own password the first time they sign in.</p><div class="pw"><span>Website</span><b>${esc(location.host)}</b><span>Username</span><b>${esc(user)}</b><span>Password</span><b>${esc(pw)}</b></div><div class="actions"><span class="sp"></span><button class="btn" data-close>Done</button></div>`); }
}
const COLNAMES = { licences: 'licences', items: 'stock items', moves: 'stock in/out', counts: 'stock counts', suppliers: 'suppliers', orders: 'procurement', requests: 'requests', deptuse: 'department use', theatres: 'theatres', claims: 'claims', cash: 'cash book', cashclose: 'cash counts', assets: 'assets', repairs: 'repairs', vehicles: 'vehicles', fuel: 'fuel', trips: 'logbook', employees: 'employees', leave: 'leave', attendance: 'attendance', meetings: 'meetings', goals: 'strategic plan', patients: 'patients', births: 'deliveries' };
function backupPage(el) {
  const n = Object.keys(APP.data).reduce((s, c) => s + APP.all(c).length, 0);
  el.innerHTML = `<div class="card"><h3>Your data is safe in three places</h3><ul class="list"><li><b>Online database:</b> every change is saved to the server as soon as there is network. The server keeps 30 days of history.</li><li><b>This device:</b> a full copy is kept on each phone or computer that signs in, so the system works with no network. Changes made offline are sent when the network returns.</li><li><b>Your own backup file:</b> download one below every week and keep it on a flash drive or in Google Drive.</li></ul>
    ${stats([[fnum(n), 'records on this device'], [APP.outbox.length, 'changes waiting to send', APP.outbox.length ? 'warn' : ''], [APP.lastSync ? ftime(APP.lastSync) : 'never', 'last saved to server']])}
    <div class="row gap"><button class="btn" id="bJ">Download full backup</button><button class="btn ghost" id="bX">Download everything as Excel</button></div></div>
    <div class="card"><h3>Restore from a backup file</h3><p class="muted">Puts back every record in the file. Records that exist now are replaced with the version in the file.</p><input type="file" id="bF" accept=".json,application/json"> <button class="btn ghost" id="bR">Restore</button></div>
    <div class="card"><h3>Sample data</h3><p class="muted">Load example items, patients, claims and more to try the system. Remove them before going live.</p><div class="row gap"><button class="btn ghost" id="sLoad">Load sample data</button><button class="btn ghost danger" id="sClear">Remove sample data</button></div></div>`;
  $('#bJ').onclick = async () => { try { const b = await api('backup'); downloadFile(`carepoint-backup-${today()}.json`, JSON.stringify(b)); toast('Backup downloaded'); } catch (e) { toast(e.message + ' (backups need network)', true); } };
  $('#bX').onclick = () => downloadXlsx('CarePoint all data ' + today(), Object.keys(COLNAMES).filter((c) => APP.can(c) && APP.all(c).length).map((c) => { const rows = APP.all(c), keys = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => !k.startsWith('_')); return [COLNAMES[c], [keys, ...rows.map((r) => keys.map((k) => (typeof r[k] === 'object' && r[k] ? JSON.stringify(r[k]) : r[k] ?? '')))]]; }));
  $('#bR').onclick = () => { const f = $('#bF').files[0]; if (!f) return toast('Choose a backup file first.', true); confirmBox('Restore this backup? Current records with the same ID are replaced.', 'Restore', async () => { try { const j = JSON.parse(await f.text()); const r = await api('restore', { docs: j.docs }); toast(r.restored + ' records restored'); APP.sync(); } catch (e) { toast(e.message, true); } }); };
  $('#sLoad').onclick = () => confirmBox('Load sample data? It is marked as sample so you can remove it later.', 'Load', () => { loadSample(); toast('Sample data loaded'); });
  $('#sClear').onclick = () => confirmBox('Remove all sample records?', 'Remove', () => { let n = 0; (APP.bulk(() => Object.keys(APP.data).forEach((c) => APP.all(c).filter((d) => d.sample).forEach((d) => { APP.del(c, d.id); n++; })))); toast(n + ' sample records removed'); });
}
async function auditPage(el) {
  const st = PS('audit', { q: '' });
  el.innerHTML = '<div class="empty">Loading…</div>';
  let rows = []; try { rows = (await api('audit' + (st.q ? '?q=' + encodeURIComponent(st.q) : ''))).audit; } catch (e) { el.innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }
  el.innerHTML = `<div class="bar"><input type="search" id="aq" placeholder="Search person, record, action" value="${esc(st.q)}"></div><p class="muted sm">Every sign-in, change and deletion is recorded here and cannot be edited.</p>${table([{ h: 'When', f: (a) => fdate(a.at) + ' ' + ftime(a.at) }, { h: 'Who', k: 'user_name' }, { h: 'Action', f: (a) => pill(a.action, a.action === 'delete' ? 'bad' : a.action === 'edit' ? 'warn' : '') }, { h: 'Record', f: (a) => esc((COLNAMES[a.col] || a.col || '') + (a.detail ? ': ' + a.detail : '')) }], rows, { empty: 'No activity found.' })}`;
  $('#aq').onkeydown = (e) => { if (e.key === 'Enter') { st.q = e.target.value; auditPage(el); } };
}
function accountPage(el) {
  el.innerHTML = `<div class="card"><h3>${esc(APP.me.name)}</h3><p>${esc(APP.roles[APP.me.role])}${APP.me.dept ? ' · ' + esc(APP.me.dept) : ''} · username <b>${esc(APP.me.username)}</b></p></div><div class="card" id="pwc"></div>
    <div class="card"><h3>Install on your phone or computer</h3><p class="muted">Chrome or Edge (Android, Windows, Mac): press Install below, or open the browser menu and choose <b>Install app</b> / <b>Add to Home screen</b>. iPhone: open in Safari, tap Share, then <b>Add to Home Screen</b>. It then opens like an app and works without network.</p>${installBtn('')}</div>`;
  passwordForm($('#pwc'), false);
}
function passwordForm(box, forced) {
  box.innerHTML = `<h3>${forced ? 'Choose your own password' : 'Change password'}</h3>${forced ? '<p>You signed in with a starting password. Choose your own to continue.</p>' : ''}<form class="form" id="pwF"><div class="fld full"><label>Current password</label><input type="password" name="old" autocomplete="current-password" required></div><div class="fld half"><label>New password (8+ characters)</label><input type="password" name="password" minlength="8" autocomplete="new-password" required></div><div class="fld half"><label>New password again</label><input type="password" name="again" autocomplete="new-password" required></div><p class="err"></p><div class="actions"><span class="sp"></span><button class="btn">Save password</button></div></form>`;
  $('#pwF', box).onsubmit = async (e) => {
    e.preventDefault(); const f = e.target, err = $('.err', f);
    if (f.elements.password.value !== f.elements.again.value) { err.textContent = 'The two new passwords are different.'; return; }
    try { await api('password', { old: f.elements.old.value, password: f.elements.password.value }); toast('Password changed'); if (forced) location.reload(); else f.reset(); } catch (x) { err.textContent = x.message; }
  };
}


/* ---------------- install as an app ---------------- */
let INSTALL = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); INSTALL = e; $$('[data-install]').forEach((b) => (b.hidden = false)); });
addEventListener('appinstalled', () => { INSTALL = null; $$('[data-install]').forEach((b) => (b.hidden = true)); toast('CarePoint Admin is installed. Open it from your home screen or apps.'); });
function installBtn(cls) { return isStandalone() ? '' : `<button type="button" class="btn ${cls || 'ghost'}" data-install ${INSTALL || /iphone|ipad|ipod/i.test(navigator.userAgent) ? '' : 'hidden'}>Install app</button>`; }
document.addEventListener('click', async (e) => {
  if (!e.target.closest('[data-install]')) return;
  if (INSTALL) { INSTALL.prompt(); try { await INSTALL.userChoice; } catch (x) {} INSTALL = null; return; }
  sheet('Install CarePoint Admin', '<ol class="list"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow).</li><li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol><p class="muted">It then opens full screen like an app and works without network.</p>');
});

/* ---------------- sign in and start ---------------- */
async function start() {
  const app = $('#app');
  const bk = 'cp_brand_' + HCODE;
  try { APP.brand = await api('brand'); localStorage.setItem(bk, JSON.stringify(APP.brand)); }
  catch (e) {
    if (e.status === 404) return codeView(app, 'We could not find a hospital with the code “' + HCODE + '”. Check the link you were given.');
    APP.brand = JSON.parse(localStorage.getItem(bk) || 'null') || { code: HCODE, name: 'CarePoint Admin', logo: '', active: true };
  }
  if (!APP.brand.active) return pausedView(app);
  let me;
  try { me = await api('me'); }
  catch (e) {
    if (e.status === 423) return pausedView(app);
    if (e.status === 401 || e.status === 403) {
      let setup = false; try { setup = (await api('setup')).needed; } catch (x) {}
      return setup ? setupView(app) : loginView(app);
    }
    // offline: use the last session cached on this device
    const cached = JSON.parse(localStorage.getItem('cp_me_' + HCODE) || 'null');
    if (!cached) { app.innerHTML = `<div class="auth"><div class="card"><h1>No network</h1><p>Connect once to sign in. After that the system works offline.</p><button class="btn" onclick="location.reload()">Try again</button></div></div>`; return; }
    me = cached; APP.online = false;
  }
  if (me.user.must_change) { app.innerHTML = '<div class="auth"><div class="card" id="pwc"></div></div>'; passwordForm($('#pwc'), true); return; }
  localStorage.setItem('cp_me_' + HCODE, JSON.stringify(me));
  if (me.hospital) { APP.brand = me.hospital; localStorage.setItem(bk, JSON.stringify(me.hospital)); }
  Object.assign(APP, { me: me.user, roles: me.roles, perms: me.perms, moneyOK: me.money, costOK: me.stockcost });
  await IDB.open('cp-' + APP.me.id);
  APP.data = (await IDB.get('data')) || {};
  const meta = (await IDB.get('meta')) || {};
  APP.last = meta.last || 0; APP.outbox = meta.outbox || []; APP.lastSync = meta.lastSync || null;
  shell();
  await APP.sync();
  if (APP.me.role === 'admin' && !APP.all('items').length && !APP.get('settings', 'main')) setTimeout(() => sheet('Welcome to CarePoint Admin', `<p>Start by setting your hospital name and lists under <b>Settings</b>, then add your stock items, employees and vehicles.</p><p>Want to look around first? Load sample data, and remove it later under Backup & restore.</p><div class="actions"><button class="btn ghost" data-close>Start empty</button><button class="btn" id="wS">Load sample data</button></div>`), 300) && setTimeout(() => { const b = $('#wS'); if (b) b.onclick = () => { loadSample(); closeSheet(); toast('Sample data loaded'); }; }, 400);
}
function loginView(app) {
  app.innerHTML = `<div class="auth"><div class="card"><div class="brand">${brandMark()}<div><b>${esc(APP.brand.name)}</b><span>CarePoint Admin</span></div></div>
    <form class="form" id="lf"><div class="fld full"><label>Username</label><input name="username" autocomplete="username" autocapitalize="none" required></div><div class="fld full"><label>Password</label><input type="password" name="password" autocomplete="current-password" required></div><p class="err"></p><button class="btn full">Sign in</button></form>
    <p class="muted sm">Forgot your password? Ask the administrator to reset it.</p><p class="muted sm">Not ${esc(APP.brand.name)}? <a href="#" id="chH">Change hospital</a></p><div class="row gap" style="margin-top:10px">${installBtn()}</div></div></div>`;
  $('#chH').onclick = (e) => { e.preventDefault(); codeView(app); };
  $('#lf').onsubmit = async (e) => { e.preventDefault(); const f = e.target; try { await api('login', { username: f.elements.username.value, password: f.elements.password.value }); location.reload(); } catch (x) { $('.err', f).textContent = x.message; } };
}
function codeView(app, msg) {
  app.innerHTML = `<div class="auth"><div class="card"><div class="brand">${CROSS}<div><b>CarePoint Admin</b><span>Hospital administration</span></div></div>${msg ? `<p class="err">${esc(msg)}</p>` : ''}<form class="form" id="hf"><div class="fld full"><label>Hospital code</label><input name="h" autocapitalize="none" placeholder="for example: parirenyatwa" value="${esc(HCODE === 'main' ? '' : HCODE)}" required></div><p class="muted sm">Your administrator or Nexora Digital gives you this code. It is also in your sign-in link.</p><button class="btn full">Continue</button></form></div></div>`;
  $('#hf').onsubmit = (e) => { e.preventDefault(); const v = e.target.elements.h.value.toLowerCase().replace(/[^a-z0-9]/g, ''); if (!v) return; try { localStorage.setItem('cp_h', v); } catch (x) {} location.href = '/?h=' + v; };
}
function pausedView(app) {
  app.innerHTML = `<div class="auth"><div class="card"><div class="brand">${brandMark()}<div><b>${esc(APP.brand.name)}</b><span>CarePoint Admin</span></div></div><h2>Account paused</h2><p>This hospital’s CarePoint account is paused. Please contact Nexora Digital.</p><p class="muted sm"><a href="#" id="chH">Use a different hospital</a></p></div></div>`;
  $('#chH').onclick = (e) => { e.preventDefault(); codeView(app); };
}
function setupView(app) {
  app.innerHTML = `<div class="auth"><div class="card"><h1>Set up CarePoint Admin</h1><p>Create the administrator login. You need the setup code from Nexora Digital.</p><form class="form" id="sf"><div class="fld full"><label>Setup code</label><input name="code" required></div><div class="fld full"><label>Your full name</label><input name="name" required></div><div class="fld half"><label>Username</label><input name="username" autocapitalize="none" required></div><div class="fld half"><label>Password (8+)</label><input type="password" name="password" minlength="8" required></div><p class="err"></p><button class="btn full">Create administrator</button></form></div></div>`;
  $('#sf').onsubmit = async (e) => { e.preventDefault(); const f = e.target; try { await api('setup', Object.fromEntries(new FormData(f))); await api('login', { username: f.elements.username.value, password: f.elements.password.value }); location.reload(); } catch (x) { $('.err', f).textContent = x.message; } };
}
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
start();
