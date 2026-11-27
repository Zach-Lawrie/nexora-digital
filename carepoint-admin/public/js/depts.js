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
    APP.can('requests', true) && ['dR', 'Request stock'],
    APP.can('deptuse', true) && ['dU', 'Record sundries used'],
    APP.can('repairs', true) && ['dF', 'Report a fault'],
  ].filter(Boolean);

  el.innerHTML = `<div class="bar"><input type="month" id="dM" value="${mo}"><span class="sp"></span>${acts.map(([id, l], i) => `<button class="btn ${i ? 'ghost' : ''}" id="${id}">${l}</button>`).join('')}</div>
    ${stats([
      pats && [fnum(pats.length), 'patients seen · ' + monthName(mo)],
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
  if ($('#dP')) $('#dP').onclick = () => editDoc(withDef(PATIENTS, { dept: name }), null);
  if ($('#dF')) $('#dF').onclick = () => editDoc(withDef(REPAIRS, { location: name }), null);
  if ($('#dR')) $('#dR').onclick = () => { requestForm(null); setTimeout(() => { const s = document.querySelector('#sheet [name="dept"]'); if (s) s.value = name; }, 50); };
  if ($('#dU')) $('#dU').onclick = () => { PS('deptuse', { month: thisMonth(), dept: '' }).dept = name; go('deptuse'); };
}
