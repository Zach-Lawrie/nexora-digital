/* CarePoint Admin: one page per hospital department, listed in the menu.
   Departments come from Settings, so the administrator can add, rename or remove them. */
'use strict';
const DEPT_ALL = ['admin', 'nic', 'records', 'accounts', 'store'];
const canSeeDept = (name) => DEPT_ALL.includes(APP.me.role) || (APP.me.role === 'dept' && APP.me.dept === name);
const deptList = () => LOOK.dept().filter(canSeeDept);
const deptHref = (name) => '#/dept/' + encodeURIComponent(name);
function deptIcon(n) {
  const s = n.toLowerCase();
  return /out ?patient|opd/.test(s) ? '⚕' : /casualty|emergency/.test(s) ? '✚' : /pharm/.test(s) ? '℞' : /physio/.test(s) ? '⚘' : /dental/.test(s) ? '◡' : /lab/.test(s) ? '⚗' : /radio|x-?ray|scan/.test(s) ? '◉' : /ortho/.test(s) ? '⌇' : /matern|labour/.test(s) ? '✿' : /theatre/.test(s) ? '✂' : /ward/.test(s) ? '▭' : /kitchen/.test(s) ? '☕' : /admin/.test(s) ? '▣' : '▸';
}
const currentDept = () => { const m = /^#\/dept\/([^/?]+)/.exec(location.hash); try { return m ? decodeURIComponent(m[1]) : ''; } catch (e) { return ''; } };

function deptPage(el) {
  const name = currentDept();
  if (!name || !LOOK.dept().includes(name)) { el.innerHTML = `<div class="empty">This department is not in the list. ${APP.me.role === 'admin' ? 'Add it under <a href="#/settings">Settings → Departments</a>.' : ''}</div>`; return; }
  if (!canSeeDept(name)) { el.innerHTML = '<div class="empty">You can only open your own department.</div>'; return; }
  $('#title').textContent = name;
  const st = PS('dept:' + name, { month: thisMonth() }), mo = st.month, t = today();
  const pats = APP.can('patients') ? APP.all('patients').filter((p) => p.dept === name && monthOf(p.date) === mo) : null;
  const outs = APP.can('moves') ? APP.all('moves').filter((m) => m.type === 'out' && m.dept === name && monthOf(m.date) === mo) : null;
  const reqs = APP.can('requests') ? APP.all('requests').filter((r) => r.dept === name).sort((a, b) => (b.date || '').localeCompare(a.date || '')) : null;
  const waiting = reqs ? reqs.filter((r) => ['pending', 'approved'].includes(r.status)) : [];
  const reps = APP.can('repairs') ? APP.all('repairs').filter((r) => r.location === name && r.status !== 'Fixed') : null;
  const staff = APP.can('employees') ? APP.all('employees').filter((e) => e.dept === name && e.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')) : null;
  const ids = new Set((staff || []).map((e) => e.id));
  const onDuty = staff ? APP.all('attendance').filter((a) => a.date === t && ids.has(a.emp)) : [];
  const onLeave = staff && APP.can('leave') ? APP.all('leave').filter((l) => ids.has(l.emp) && l.from <= t && l.to >= t) : [];
  const births = /matern|labour/i.test(name) && APP.can('births') ? APP.all('births').filter((b) => monthOf(b.date) === mo) : null;
  const assets = APP.can('assets') ? APP.all('assets').filter((a) => a.location === name || a.dept === name) : null;

  const tally = (rows, key) => { const m = {}; rows.forEach((r) => { const k = typeof key === 'function' ? key(r) : r[key]; if (k) m[k] = (m[k] || 0) + (typeof key === 'function' ? num(r.qty) || 1 : 1); }); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 10); };
  const card = (h, body) => `<div class="card"><h3>${h}</h3>${body}</div>`;
  const acts = [
    APP.can('patients', true) && ['dP', 'Record patient seen'],
    APP.can('patients', true) && /matern|antenatal/i.test(name) && ['dB', 'Record antenatal booking'],
    APP.can('requests', true) && ['dR', 'Request stock'],
    APP.can('deptuse', true) && ['dU', 'Record sundries used'],
    APP.can('repairs', true) && ['dF', 'Report a fault'],
  ].filter(Boolean);

  el.innerHTML = `<div class="bar"><input type="month" id="dM" value="${mo}"><span class="sp"></span>${acts.map(([id, l], i) => `<button class="btn ${i ? 'ghost' : ''}" id="${id}">${l}</button>`).join('')}</div>
    ${stats([
      pats && [fnum(pats.length), 'patients seen · ' + monthName(mo)],
      pats && /matern|antenatal/i.test(name) && [fnum(pats.filter((p) => p.visit === 'Antenatal booking (1st visit)').length), 'antenatal bookings'],
      births && [fnum(births.length), 'deliveries · ' + monthName(mo)],
      outs && [fnum(outs.length), 'stock issues · ' + monthName(mo)],
      reqs && [fnum(waiting.length), 'requests waiting', waiting.length ? 'warn' : ''],
      reps && [fnum(reps.length), 'faults still open', reps.some(repairLate) ? 'alert' : ''],
      staff && [`${onDuty.length}/${staff.length}`, 'staff on duty today'],
      onLeave.length && [fnum(onLeave.length), 'on leave today'],
    ])}
    <div class="grid2">
      ${pats ? card('Main diagnoses · ' + monthName(mo), barChart(tally(pats, 'diagnosis'), { title: 'Diagnoses' })) : ''}
      ${outs ? card('Stock used · ' + monthName(mo), barChart(tally(outs, (m) => m.item_name), { title: 'Stock used', tone: 'alt' })) : ''}
    </div>
    ${reqs ? card('Stock requests', table([{ h: 'Date', f: (r) => fdate(r.date) }, { h: 'Items', f: (r) => esc((r.lines || []).map((l) => `${(APP.get('items', l.item) || {}).name || 'item'} × ${fnum(l.qty)}`).join(', ')) }, { h: 'Status', f: (r) => pill(r.status, r.status === 'pending' ? 'warn' : r.status === 'issued' ? 'ok' : r.status === 'rejected' ? 'bad' : 'info') }, { h: 'By', k: 'by_name' }], reqs.slice(0, 15), { empty: 'No requests from this department yet.', click: () => go('requests') })) : ''}
    ${reps ? card('Faults and repairs still open', table([{ h: 'Reported', f: (r) => fdate(r.reported) }, { h: 'What', f: (r) => esc(r.what) + (r.urgent ? ' ' + pill('Urgent', 'bad') : '') }, { h: 'Status', f: (r) => pill(r.status, repairLate(r) ? 'bad' : '') }, { h: 'Days', num: true, f: (r) => fnum(repairAge(r)) }], reps, { empty: 'No open faults. Use “Report a fault” when something breaks.', click: (r) => editDoc(REPAIRS, r) })) : ''}
    ${staff ? card('Staff', table([{ h: 'Name', k: 'name' }, { h: 'Position', k: 'position' }, { h: 'Phone', k: 'phone' }, { h: 'Today', f: (e) => { const a = onDuty.find((x) => x.emp === e.id); return onLeave.some((l) => l.emp === e.id) ? pill('On leave', 'info') : a ? pill('In ' + a.in + (a.out ? ' · out ' + a.out : ''), 'ok') : pill('Not signed in', ''); } }], staff, { empty: 'No staff linked to this department. Set the department on each employee record.', click: (e) => editDoc(EMPLOYEES, e) })) : ''}
    ${assets && assets.length ? card('Equipment here', table([{ h: 'Tag', k: 'tag' }, { h: 'Item', k: 'name' }, { h: 'Condition', f: (a) => pill(a.condition || '', /poor|broken|bad/i.test(a.condition || '') ? 'bad' : '') }], assets, { click: (a) => editDoc(ASSETS, a) })) : ''}
    ${pats ? card('Patients seen · ' + monthName(mo), table([{ h: 'Date', f: (p) => fdate(p.date) }, { h: 'File no.', k: 'file_no' }, { h: 'Age / sex', f: (p) => `${fnum(p.age)} ${p.age_unit && p.age_unit !== 'years' ? p.age_unit : ''} ${esc(p.sex || '')}` }, { h: 'Diagnosis', k: 'diagnosis' }, { h: 'Outcome', k: 'outcome' }], pats.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')), { limit: 50, empty: 'No patients recorded for this month.', click: (p) => editDoc(PATIENTS, p) })) : ''}`;

  $('#dM').onchange = (e) => { st.month = e.target.value || thisMonth(); rerender(); };
  const withDef = (c, extra) => ({ ...c, defaults: () => ({ ...(c.defaults ? c.defaults() : {}), ...extra }) });
  if ($('#dP')) $('#dP').onclick = () => editDoc(withDef(PATIENTS, { dept: name, visit: visitDefault(name) }), null);
  if ($('#dB')) $('#dB').onclick = () => editDoc(withDef(PATIENTS, { dept: name, visit: 'Antenatal booking (1st visit)', sex: 'Female', pregnant: true, outcome: 'Treated & discharged' }), null);
  if ($('#dF')) $('#dF').onclick = () => editDoc(withDef(REPAIRS, { location: name }), null);
  if ($('#dR')) $('#dR').onclick = () => { requestForm(null); setTimeout(() => { const s = document.querySelector('#sheet [name="dept"]'); if (s) s.value = name; }, 50); };
  if ($('#dU')) $('#dU').onclick = () => { PS('deptuse', { month: thisMonth(), dept: '' }).dept = name; go('deptuse'); };
}

/* ---------------- Departments overview: totals for any period ---------------- */
const isMat = (n) => /matern|antenatal|labour/i.test(n || '');
const isCas = (n) => /casualty|emergency/i.test(n || '');
function periodOf(st) {
  const t = today(), d = new Date(t + 'T12:00:00'), dow = (d.getDay() + 6) % 7;
  switch (st.p) {
    case 'today': return [t, t, 'Today'];
    case 'yesterday': { const y = addDays(t, -1); return [y, y, 'Yesterday']; }
    case 'week': return [addDays(t, -dow), t, 'This week'];
    case 'lastmonth': { const s = addDays(t.slice(0, 8) + '01', -1).slice(0, 8) + '01'; return [s, addDays(t.slice(0, 8) + '01', -1), monthName(s.slice(0, 7))]; }
    case 'year': return [t.slice(0, 4) + '-01-01', t, 'This year'];
    case 'custom': return [st.from || t, st.to || t, fdate(st.from || t) + ' to ' + fdate(st.to || t)];
    default: return [t.slice(0, 8) + '01', t, monthName(t.slice(0, 7))];
  }
}
function overviewData(from, to) {
  const inP = (x) => x.date >= from && x.date <= to;
  const pats = APP.all('patients').filter(inP), births = APP.can('births') ? APP.all('births').filter(inP) : [];
  const theatre = APP.can('theatres') ? APP.all('theatres').filter(inP) : [];
  const names = [...new Set([...LOOK.dept(), ...pats.map((p) => p.dept).filter(Boolean)])];
  const rows = names.map((n) => {
    const ps = pats.filter((p) => p.dept === n);
    return { dept: n, total: ps.length, fresh: ps.filter((p) => p.case === 'New').length, follow: ps.filter((p) => p.case === 'Follow-up').length, adm: ps.filter((p) => p.outcome === 'Admitted').length, ref: ps.filter((p) => p.outcome === 'Referred').length, died: ps.filter((p) => p.outcome === 'Died').length, aid: ps.filter((p) => p.payer && p.payer !== 'Cash').length, f: ps.filter((p) => p.sex === 'Female').length, m: ps.filter((p) => p.sex === 'Male').length, kids: ps.filter((p) => ageYears(p) < 5).length, inList: LOOK.dept().includes(n) };
  });
  const v = (k) => pats.filter((p) => (p.visit || 'Consultation') === k).length;
  const bb = births.flatMap((b) => b.babies || []);
  const mat = { bookings: v('Antenatal booking (1st visit)'), revisits: v('Antenatal revisit'), postnatal: v('Postnatal check'), fp: v('Family planning'), deliveries: births.length, cs: births.filter((b) => /caesarean/i.test(b.mode || '')).length, live: bb.filter((b) => b.outcome === 'Live birth').length, still: bb.filter((b) => /still/i.test(b.outcome || '')).length };
  const casP = pats.filter((p) => isCas(p.dept) || p.visit === 'Emergency');
  const cas = { att: casP.length, adm: casP.filter((p) => p.outcome === 'Admitted').length, ref: casP.filter((p) => p.outcome === 'Referred').length, died: casP.filter((p) => p.outcome === 'Died').length, inj: casP.filter((p) => /injur|trauma|accident|burn|fracture|wound/i.test((p.diagnosis || '') + ' ' + (p.diagnosis2 || ''))).length };
  const visits = VISITS.map((k) => [k, v(k)]).filter((x) => x[1]);
  return { pats, rows, mat, cas, visits, theatre: theatre.length, births };
}
function overviewPage(el) {
  const st = PS('overview', { p: 'month', from: '', to: '' }), [from, to, label] = periodOf(st);
  const D = overviewData(from, to), tot = (k) => sum(D.rows, k);
  const shown = D.rows.filter((r) => r.inList || r.total);
  const P = [['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'This week'], ['month', 'This month'], ['lastmonth', 'Last month'], ['year', 'This year'], ['custom', 'Pick dates']];
  const days = Math.max(1, daysBetween(from, to) + 1);
  el.innerHTML = `<div class="bar"><select id="oP">${P.map(([k, l]) => `<option value="${k}" ${st.p === k ? 'selected' : ''}>${l}</option>`).join('')}</select>${st.p === 'custom' ? `<input type="date" id="oF" value="${from}"><span>to</span><input type="date" id="oT" value="${to}">` : ''}<span class="sp"></span><button class="btn ghost" id="oPr">Print / PDF</button><button class="btn ghost" id="oX">Excel</button></div>
  <div id="oBody"><h2 style="margin:4px 0 12px">${esc(label)} <span class="muted sm">${fdate(from)}${from !== to ? ' – ' + fdate(to) : ''}</span></h2>
  ${stats([[fnum(D.pats.length), 'patients served, all departments'], [fnum(D.mat.bookings), 'maternity bookings (antenatal 1st visits)'], [fnum(D.mat.deliveries), 'deliveries'], [fnum(D.cas.att), 'casualty attendances'], [fnum(tot('adm')), 'admitted'], [fnum(tot('died')), 'deaths', tot('died') ? 'alert' : ''], D.theatre && [fnum(D.theatre), 'theatre cases'], days > 1 && [fnum(D.pats.length / days, 1), 'patients a day on average']])}
  <div class="card"><h3>Patients served by department</h3>${table([{ h: 'Department', f: (r) => `<b>${esc(r.dept)}</b>` }, { h: 'Patients', num: true, f: (r) => `<b>${fnum(r.total)}</b>` }, { h: 'New', num: true, f: (r) => fnum(r.fresh) }, { h: 'Follow-up', num: true, f: (r) => fnum(r.follow) }, { h: 'Female', num: true, f: (r) => fnum(r.f) }, { h: 'Male', num: true, f: (r) => fnum(r.m) }, { h: 'Under 5', num: true, f: (r) => fnum(r.kids) }, { h: 'Admitted', num: true, f: (r) => fnum(r.adm) }, { h: 'Referred', num: true, f: (r) => fnum(r.ref) }, { h: 'Died', num: true, f: (r) => (r.died ? `<b class="bad">${fnum(r.died)}</b>` : '0') }, { h: 'Medical aid', num: true, f: (r) => fnum(r.aid) }], [...shown, { dept: 'All departments', total: D.pats.length, fresh: tot('fresh'), follow: tot('follow'), f: tot('f'), m: tot('m'), kids: tot('kids'), adm: tot('adm'), ref: tot('ref'), died: tot('died'), aid: tot('aid'), all: 1 }], { rowCls: (r) => (r.all ? 'tot' : ''), click: (r) => !r.all && LOOK.dept().includes(r.dept) && (location.hash = deptHref(r.dept)) })}</div>
  <div class="grid2">
    <div class="card"><h3>Maternity</h3>${stats([[fnum(D.mat.bookings), 'antenatal bookings'], [fnum(D.mat.revisits), 'antenatal revisits'], [fnum(D.mat.deliveries), 'deliveries'], [fnum(D.mat.cs), 'C-sections'], [fnum(D.mat.live), 'live births'], [fnum(D.mat.still), 'stillbirths', D.mat.still ? 'alert' : ''], [fnum(D.mat.postnatal), 'postnatal checks'], [fnum(D.mat.fp), 'family planning']])}</div>
    <div class="card"><h3>Casualty</h3>${stats([[fnum(D.cas.att), 'attendances'], [fnum(D.cas.inj), 'injuries / trauma'], [fnum(D.cas.adm), 'admitted'], [fnum(D.cas.ref), 'referred'], [fnum(D.cas.died), 'died', D.cas.died ? 'alert' : '']])}<p class="muted sm">Counts everyone seen in Casualty, plus any visit marked “Emergency” in another department.</p></div>
  </div>
  <div class="grid2">
    <div class="card"><h3>Patients by department</h3>${barChart(shown.filter((r) => r.total).map((r) => [r.dept, r.total]), { title: 'Patients by department' })}</div>
    <div class="card"><h3>Type of visit</h3>${barChart(D.visits, { title: 'Type of visit', tone: 'alt' })}</div>
  </div></div>`;
  $('#oP').onchange = (e) => { st.p = e.target.value; if (st.p === 'custom' && !st.from) { st.from = addDays(today(), -6); st.to = today(); } rerender(); };
  if ($('#oF')) { $('#oF').onchange = (e) => { st.from = e.target.value; rerender(); }; $('#oT').onchange = (e) => { st.to = e.target.value; rerender(); }; }
  $('#oPr').onclick = () => printArea('Departments overview · ' + label, $('#oBody').innerHTML);
  $('#oX').onclick = () => downloadXlsx('Departments overview ' + from + ' to ' + to, [
    ['By department', [['Department', 'Patients', 'New', 'Follow-up', 'Female', 'Male', 'Under 5', 'Admitted', 'Referred', 'Died', 'Medical aid'], ...shown.map((r) => [r.dept, r.total, r.fresh, r.follow, r.f, r.m, r.kids, r.adm, r.ref, r.died, r.aid]), ['All departments', D.pats.length, tot('fresh'), tot('follow'), tot('f'), tot('m'), tot('kids'), tot('adm'), tot('ref'), tot('died'), tot('aid')]]],
    ['Maternity', [['Measure', 'Count'], ['Antenatal bookings (1st visit)', D.mat.bookings], ['Antenatal revisits', D.mat.revisits], ['Deliveries', D.mat.deliveries], ['C-sections', D.mat.cs], ['Live births', D.mat.live], ['Stillbirths', D.mat.still], ['Postnatal checks', D.mat.postnatal], ['Family planning', D.mat.fp]]],
    ['Casualty', [['Measure', 'Count'], ['Attendances', D.cas.att], ['Injuries / trauma', D.cas.inj], ['Admitted', D.cas.adm], ['Referred', D.cas.ref], ['Died', D.cas.died]]],
    ['Type of visit', [['Visit', 'Count'], ...D.visits]],
    ['Period', [['From', from], ['To', to], ['Hospital', APP.settings().hospital], ['Printed by', APP.me.name]]],
  ]);
}
