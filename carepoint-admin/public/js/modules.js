/* Modules built on the shared list + form engine: money, operations, people, management, health data. */
'use strict';
const PSTATE = {};
function PS(k, def) { return (PSTATE[k] = PSTATE[k] || { ...def }); }

/* date range bar shared by list pages */
function rangeBar(st) {
  return `<select data-rg><option value="month" ${st.rg === 'month' ? 'selected' : ''}>This month</option><option value="today" ${st.rg === 'today' ? 'selected' : ''}>Today</option><option value="last" ${st.rg === 'last' ? 'selected' : ''}>Last month</option><option value="year" ${st.rg === 'year' ? 'selected' : ''}>This year</option><option value="all" ${st.rg === 'all' ? 'selected' : ''}>All dates</option><option value="custom" ${st.rg === 'custom' ? 'selected' : ''}>Choose dates…</option></select>${st.rg === 'custom' ? `<input type="date" data-from value="${st.from || ''}"><input type="date" data-to value="${st.to || ''}">` : ''}`;
}
function inRange(st, d) {
  if (!d) return st.rg === 'all';
  d = String(d).slice(0, 10);
  switch (st.rg) {
    case 'today': return d === today();
    case 'month': return monthOf(d) === thisMonth();
    case 'last': return monthOf(d) === prevMonth(thisMonth());
    case 'year': return d.slice(0, 4) === today().slice(0, 4);
    case 'custom': return (!st.from || d >= st.from) && (!st.to || d <= st.to);
    default: return true;
  }
}
function wireRange(el, st) {
  const r = $('[data-rg]', el); if (r) r.onchange = (e) => { st.rg = e.target.value; rerender(); };
  const f = $('[data-from]', el), t = $('[data-to]', el);
  if (f) f.onchange = (e) => { st.from = e.target.value; rerender(); };
  if (t) t.onchange = (e) => { st.to = e.target.value; rerender(); };
}

/* generic list page */
const colsOf = (c) => (typeof c.cols === 'function' ? c.cols() : c.cols);
function crud(el, c) {
  const st = PS(c.key, { q: '', rg: c.range || 'all', f: {} });
  let rows = APP.all(c.col);
  if (c.filterBase) rows = rows.filter(c.filterBase);
  if (c.dateKey) rows = rows.filter((r) => inRange(st, r[c.dateKey]));
  (c.filters || []).forEach((f) => { const v = st.f[f.k]; if (v) rows = rows.filter((r) => (f.test ? f.test(r, v) : String(r[f.k]) === v)); });
  if (st.q) { const q = st.q.toLowerCase(); rows = rows.filter((r) => (c.search || ['name']).some((k) => String(typeof k === 'function' ? k(r) : r[k] || '').toLowerCase().includes(q))); }
  rows.sort(c.sort || ((a, b) => String(b[c.dateKey] || b.at || '').localeCompare(String(a[c.dateKey] || a.at || ''))));
  const canW = APP.can(c.col, true) && c.add !== false;
  el.innerHTML = `${c.top ? c.top(rows, st) : ''}
    <div class="bar"><input type="search" placeholder="${esc(c.ph || 'Search')}" value="${esc(st.q)}" data-q>${c.dateKey ? rangeBar(st) : ''}
      ${(c.filters || []).map((f) => `<select data-f="${f.k}"><option value="">${esc(f.label)}</option>${optList(f.opts).map(([k, t]) => `<option value="${esc(k)}" ${st.f[f.k] === String(k) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`).join('')}
      <span class="sp"></span>${(c.buttons || []).map((b, i) => `<button class="btn ${b.ghost ? 'ghost' : ''}" data-b="${i}">${esc(b.t)}</button>`).join('')}${canW ? `<button class="btn" data-add>${esc(c.addText || '+ Add')}</button>` : ''}<button class="btn ghost" data-x>Excel</button></div>
    ${table(colsOf(c), rows, { click: (r) => (c.open ? c.open(r) : editDoc(c, r)), empty: c.empty, rowCls: c.rowCls, foot: c.foot ? c.foot(rows) : null })}
    ${c.bottom ? c.bottom(rows, st) : ''}`;
  $('[data-q]', el).oninput = (e) => { st.q = e.target.value; rerender(); };
  wireRange(el, st);
  $$('[data-f]', el).forEach((s) => (s.onchange = () => { st.f[s.dataset.f] = s.value; rerender(); }));
  (c.buttons || []).forEach((b, i) => ($(`[data-b="${i}"]`, el).onclick = () => b.do(rows)));
  if ($('[data-add]', el)) $('[data-add]', el).onclick = () => editDoc(c, null);
  $('[data-x]', el).onclick = () => downloadXlsx(c.title + ' ' + today(), [[c.title, rowsFor(c.xcols || colsOf(c), rows)]]);
  if (c.after) c.after(el, rows, st);
}
function editDoc(c, r) {
  const isNew = !r, canW = APP.can(c.col, true);
  if (!canW && !isNew) return viewDoc(c, r);
  const fields = typeof c.fields === 'function' ? c.fields(r) : c.fields;
  formSheet(isNew ? c.newTitle || 'Add ' + (c.one || 'record') : (c.titleOf ? c.titleOf(r) : 'Edit ' + (c.one || 'record')), fields, r || (c.defaults ? c.defaults() : {}), (d) => {
    if (c.check) c.check(d);
    const saved = APP.save(c.col, c.prep ? c.prep(d) : d, c.noteOf ? c.noteOf(d) : '');
    toast(isNew ? (c.one ? label(c.one) + ' added' : 'Saved') : 'Saved');
    if (c.afterSave) c.afterSave(saved, isNew);
  }, { wide: c.wide, del: !isNew && (APP.me.role === 'admin' || (r.by === APP.me.id && Date.now() - new Date(r.at) < 864e5)) ? () => { APP.del(c.col, r.id); toast('Deleted'); } : null, extra: !isNew && c.extra ? c.extra(r) : '' });
}
function viewDoc(c, r) {
  const fields = (typeof c.fields === 'function' ? c.fields(r) : c.fields).filter((f) => !f.hide && r[f.k] !== undefined && r[f.k] !== '');
  sheet(c.titleOf ? c.titleOf(r) : label(c.one || 'record'), `<dl class="dl">${fields.map((f) => `<dt>${esc(f.label)}</dt><dd>${Array.isArray(r[f.k]) ? r[f.k].map((x) => esc(Object.values(x).join(' · '))).join('<br>') : esc(f.type === 'date' ? fdate(r[f.k]) : f.type === 'check' ? (r[f.k] ? 'Yes' : 'No') : f.opts && typeof optList(f.opts)[0]?.[0] !== 'undefined' && optList(f.opts).find((o) => String(o[0]) === String(r[f.k])) ? optList(f.opts).find((o) => String(o[0]) === String(r[f.k]))[1] : r[f.k])}</dd>`).join('')}</dl>${c.extra ? c.extra(r) : ''}`);
}

/* ---------------- THEATRES ---------------- */
const payOK = () => APP.moneyOK;
function theatreTotals(t) { const pp = sum(t.payments || [], 'amount') + num(t.paid); const bill = num(t.admit_amount); const aid = num(t.aid_paid); return { pp, aid, bill, owed: Math.max(0, bill - pp - aid), short: t.pay === 'Medical aid' ? Math.max(0, num(t.claimed) - aid) : 0 }; }
const THEATRE = {
  key: 'theatres', col: 'theatres', title: 'Theatres', one: 'theatre case', dateKey: 'date', range: 'month', ph: 'Search patient, file no.',
  search: ['patient', 'file_no', 'discipline', 'aid', 'surgeon'],
  filters: [{ k: 'pay', label: 'All payments', opts: ['Cash', 'Medical aid'] }, { k: 'discipline', label: 'All disciplines', opts: LOOK.discipline }],
  fields: () => [
    { k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true },
    { k: 'discipline', label: 'Type / discipline', type: 'select', opts: LOOK.discipline, req: true, half: true },
    { k: 'patient', label: 'Patient name', req: true, half: true }, { k: 'file_no', label: 'File number', req: true, half: true },
    { k: 'procedure', label: 'Procedure', half: true }, { k: 'surgeon', label: 'Surgeon', half: true },
    { k: 'pay', label: 'Form of payment', type: 'select', opts: ['Cash', 'Medical aid'], req: true, half: true },
    { k: 'aid', label: 'Medical aid', type: 'select', opts: LOOK.aid, half: true, show: (d) => d.pay === 'Medical aid' },
    { k: 'admit_amount', label: 'Amount admitted for (bill)', type: 'money', half: true, hide: !payOK() },
    { k: 'paid', label: 'Paid by patient at admission', type: 'money', half: true, hide: !payOK() },
    { k: 'claimed', label: 'Claimed from medical aid', type: 'money', half: true, show: (d) => d.pay === 'Medical aid', hide: !payOK() },
    { k: 'aid_paid', label: 'Actually paid by medical aid', type: 'money', half: true, show: (d) => d.pay === 'Medical aid', hide: !payOK() },
    { k: 'payments', label: 'Daily payments by patient', type: 'rows', one: 'payment', start: 0, hide: !payOK(), sub: [{ k: 'date', label: 'Date', type: 'date', def: today() }, { k: 'amount', label: 'Amount', type: 'money' }, { k: 'method', label: 'Method', type: 'select', opts: ['Cash', 'Bank', 'EcoCash', 'Swipe'], def: 'Cash' }, { k: 'receipt', label: 'Receipt no.' }] },
    { k: 'notes', label: 'Notes', type: 'textarea', rows: 2 },
  ],
  cols: () => [
    { h: 'Date', f: (t) => fdate(t.date), x: (t) => t.date }, { h: 'Patient', f: (t) => `<b>${esc(t.patient)}</b><br><span class="muted sm">${esc(t.file_no || '')}</span>`, x: (t) => t.patient }, { h: 'File no.', k: 'file_no', cls: 'hide-m' },
    { h: 'Discipline', k: 'discipline' }, { h: 'Payment', f: (t) => esc(t.pay === 'Medical aid' ? t.aid || 'Medical aid' : 'Cash'), x: (t) => (t.pay === 'Medical aid' ? t.aid : 'Cash') },
    ...(APP.moneyOK ? [{ h: 'Bill', num: true, f: (t) => money(t.admit_amount), x: (t) => num(t.admit_amount) }, { h: 'Patient paid', num: true, f: (t) => money(theatreTotals(t).pp), x: (t) => theatreTotals(t).pp }, { h: 'Claimed / aid paid', num: true, f: (t) => (t.pay === 'Medical aid' ? `${money(t.claimed)} / ${money(t.aid_paid)}${theatreTotals(t).short ? '<br>' + pill('short ' + money(theatreTotals(t).short), 'warn') : ''}` : ''), x: (t) => (t.pay === 'Medical aid' ? num(t.claimed) + ' / ' + num(t.aid_paid) : '') }, { h: 'Still owed', num: true, f: (t) => (theatreTotals(t).owed ? pill(money(theatreTotals(t).owed), 'bad') : pill('Paid', 'ok')), x: (t) => theatreTotals(t).owed }] : []),
  ],
  top: (rows) => stats([[rows.length, 'cases'], [rows.filter((t) => t.date === today()).length, 'today'], APP.moneyOK ? [money(sum(rows, (t) => theatreTotals(t).pp + theatreTotals(t).aid)), 'received'] : null, APP.moneyOK ? [money(sum(rows, (t) => theatreTotals(t).owed)), 'still owed', 'warn'] : null, APP.moneyOK ? [money(sum(rows, (t) => theatreTotals(t).short)), 'medical aid shortfall', 'warn'] : null]),
  bottom: (rows) => APP.moneyOK ? `<h3 class="mt">Payments received per day</h3>${table([{ h: 'Date', f: (r) => fdate(r[0]) }, { h: 'Payments', num: true, f: (r) => r[1].length }, { h: 'Amount', num: true, f: (r) => money(sum(r[1], 'amount')) }], Object.entries(groupBy(rows.flatMap((t) => [...(t.payments || []), ...(num(t.paid) ? [{ date: t.date, amount: t.paid }] : [])]), 'date')).sort((a, b) => b[0].localeCompare(a[0])), { empty: 'No payments in this period.' })}` : '',
  titleOf: (t) => t.patient + ' · ' + fdate(t.date), wide: true,
};

/* ---------------- CLAIMS ---------------- */
const CLAIMS = {
  key: 'claims', col: 'claims', title: 'Claims', one: 'claim', dateKey: 'date', range: 'today', ph: 'Search patient, member no.',
  search: ['patient', 'file_no', 'member_no', 'aid', 'error_type'],
  filters: [{ k: 'aid', label: 'All medical aids', opts: LOOK.aid }, { k: 'status', label: 'All statuses', opts: ['Submitted', 'Paid', 'Part paid', 'Rejected', 'Query'] }, { k: 'error', label: 'With / without errors', opts: [['yes', 'With errors'], ['no', 'No errors']], test: (r, v) => (v === 'yes' ? !!r.error : !r.error) }],
  fields: [
    { k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true }, { k: 'aid', label: 'Medical aid society', type: 'select', opts: LOOK.aid, req: true, half: true },
    { k: 'patient', label: 'Patient name', req: true, half: true }, { k: 'file_no', label: 'File number', half: true },
    { k: 'member_no', label: 'Member number', half: true }, { k: 'kind', label: 'Seen as', type: 'select', opts: ['OPD', 'Admitted', 'Theatre', 'Maternity', 'Other'], def: 'OPD', half: true },
    { k: 'amount', label: 'Amount claimed', type: 'money', req: true, half: true }, { k: 'status', label: 'Status', type: 'select', opts: ['Submitted', 'Paid', 'Part paid', 'Rejected', 'Query'], def: 'Submitted', half: true },
    { k: 'paid_amount', label: 'Amount paid by medical aid', type: 'money', half: true, show: (d) => ['Paid', 'Part paid'].includes(d.status) },
    { k: 'error', label: 'This claim had an error', type: 'check' },
    { k: 'error_type', label: 'What was the error', type: 'select', opts: LOOK.claimerr, half: true, show: (d) => d.error },
    { k: 'error_note', label: 'Error details / fix', half: true, show: (d) => d.error },
  ],
  cols: [{ h: 'Date', f: (c) => fdate(c.date), x: (c) => c.date }, { h: 'Medical aid', f: (c) => `<b>${esc(c.aid)}</b>`, x: (c) => c.aid }, { h: 'Patient', f: (c) => esc(c.patient) + (c.member_no ? `<br><span class="muted sm">${esc(c.member_no)}</span>` : ''), x: (c) => c.patient }, { h: 'Seen as', k: 'kind' }, { h: 'Amount', num: true, f: (c) => money(c.amount), x: (c) => num(c.amount) }, { h: 'Status', f: (c) => pill(c.status, { Paid: 'ok', Rejected: 'bad', Query: 'warn', 'Part paid': 'warn' }[c.status] || 'info'), x: (c) => c.status }, { h: 'Error', f: (c) => (c.error ? pill(c.error_type || 'Error', 'bad') : ''), x: (c) => (c.error ? c.error_type || 'Error' : '') }],
  top: (rows) => {
    const by = Object.entries(groupBy(rows, 'aid')).map(([a, arr]) => ({ a, n: arr.length, amt: sum(arr, 'amount'), err: arr.filter((c) => c.error).length })).sort((x, y) => y.n - x.n);
    const errs = Object.entries(groupBy(rows.filter((c) => c.error), (c) => c.error_type || 'Other')).map(([k, a]) => [k, a.length]).sort((a, b) => b[1] - a[1]);
    const seen = APP.all('patients').filter((p) => p.date === today() && p.payer && p.payer !== 'Cash');
    return `${stats([[rows.length, 'claims'], [money(sum(rows, 'amount')), 'total claimed'], [rows.filter((c) => c.error).length, 'with errors', rows.some((c) => c.error) ? 'alert' : ''], [money(sum(rows.filter((c) => ['Paid', 'Part paid'].includes(c.status)), 'paid_amount')), 'paid by medical aids']])}
      <div class="grid2"><div class="card"><h3>Per medical aid</h3>${table([{ h: 'Medical aid', f: (r) => `<b>${esc(r.a)}</b>` }, { h: 'Claims', num: true, k: 'n' }, { h: 'Amount', num: true, f: (r) => money(r.amt) }, { h: 'Errors', num: true, f: (r) => (r.err ? pill(r.err, 'bad') : '0') }], by, { empty: 'No claims in this period.' })}</div>
      <div class="card"><h3>Errors found</h3>${barChart(errs, { tone: 'r' })}<h3 class="mt">Medical aid patients seen today</h3>${seen.length ? table([{ h: 'Medical aid', f: (r) => esc(r[0]) }, { h: 'Patients', num: true, f: (r) => r[1].length }, { h: 'Admitted', num: true, f: (r) => r[1].filter((p) => p.outcome === 'Admitted').length }], Object.entries(groupBy(seen, 'payer'))) : '<p class="muted sm">Recorded in Health data → Patients seen (choose the medical aid under “Payment”).</p>'}</div></div>`;
  },
  titleOf: (c) => c.patient + ' · ' + c.aid,
};

/* ---------------- CASH BOOK ---------------- */
const INC = ['OPD fees', 'Theatre', 'Maternity', 'Admission / ward fees', 'Kiosk', 'Medical aid payment', 'Pharmacy', 'Other income'];
const EXP = ['Groceries', 'Fuel', 'Stationery', 'Repairs & maintenance', 'Drugs & sundries', 'Transport', 'Utilities', 'Salaries / wages', 'Bank charges', 'Other expense'];
function cashFor(date) { return APP.all('cash').filter((c) => c.date === date); }
function cashBalanceBefore(date) { return sum(APP.all('cash').filter((c) => c.date < date && c.method === 'Cash'), (c) => (c.kind === 'Income' ? 1 : -1) * num(c.amount)); }
function cashChecks(rows) {
  const out = [];
  rows.filter((c) => !c.ref).forEach((c) => out.push({ c, why: 'No receipt / voucher number' }));
  Object.values(groupBy(rows.filter((c) => c.ref), (c) => c.kind + '|' + c.ref)).filter((a) => a.length > 1).forEach((a) => a.forEach((c) => out.push({ c, why: 'Receipt number used ' + a.length + ' times' })));
  rows.filter((c) => num(c.amount) <= 0).forEach((c) => out.push({ c, why: 'Amount is zero or negative' }));
  rows.filter((c) => c.kind === 'Expense' && num(c.amount) >= 500 && !c.approved_by).forEach((c) => out.push({ c, why: 'Large expense with no approval name' }));
  const days = [...new Set(rows.map((c) => c.date))];
  days.forEach((d) => {
    const kioskSales = sum(APP.all('moves').filter((m) => m.cat === 'kiosk' && m.date === d && m.type === 'handover'), 'amount');
    const kioskCash = sum(APP.all('cash').filter((c) => c.date === d && c.category === 'Kiosk' && c.kind === 'Income'), 'amount');
    if (Math.abs(kioskSales - kioskCash) > 0.009) out.push({ c: { date: d, kind: 'Income', category: 'Kiosk', amount: kioskCash, description: `Kiosk handed over ${money(kioskSales)}, cash book shows ${money(kioskCash)}` }, why: 'Kiosk cash does not match' });
    const thCash = sum(APP.all('theatres').flatMap((t) => [...(t.payments || []).filter((p) => p.date === d && (p.method || 'Cash') === 'Cash'), ...(t.date === d && num(t.paid) ? [{ amount: t.paid }] : [])]), 'amount');
    const thBook = sum(APP.all('cash').filter((c) => c.date === d && c.category === 'Theatre' && c.kind === 'Income' && c.method === 'Cash'), 'amount');
    if (thCash && Math.abs(thCash - thBook) > 0.009) out.push({ c: { date: d, kind: 'Income', category: 'Theatre', amount: thBook, description: `Theatre payments ${money(thCash)}, cash book shows ${money(thBook)}` }, why: 'Theatre cash does not match' });
    const close = APP.all('cashclose').find((x) => x.date === d);
    if (close) { const exp = cashBalanceBefore(d) + sum(cashFor(d).filter((c) => c.method === 'Cash'), (c) => (c.kind === 'Income' ? 1 : -1) * num(c.amount)); if (Math.abs(exp - num(close.counted)) > 0.009) out.push({ c: { date: d, kind: 'Close', category: 'Cash count', amount: close.counted, description: `Counted ${money(close.counted)}, book says ${money(exp)}` }, why: (num(close.counted) < exp ? 'Cash SHORT ' : 'Cash OVER ') + money(Math.abs(exp - num(close.counted))) }); }
  });
  return out;
}
const CASH = {
  key: 'cash', col: 'cash', title: 'Cash book', one: 'entry', dateKey: 'date', range: 'today', ph: 'Search description, receipt',
  search: ['description', 'ref', 'category', 'payee'],
  filters: [{ k: 'kind', label: 'Income & expenses', opts: ['Income', 'Expense'] }, { k: 'method', label: 'All methods', opts: ['Cash', 'Bank', 'EcoCash', 'Swipe'] }],
  fields: [
    { k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true }, { k: 'kind', label: 'Income or expense', type: 'select', opts: ['Income', 'Expense'], def: 'Income', req: true, half: true },
    { k: 'category', label: 'Category', type: 'datalist', opts: [...INC, ...EXP], req: true, half: true }, { k: 'amount', label: 'Amount', type: 'money', req: true, half: true },
    { k: 'method', label: 'Method', type: 'select', opts: ['Cash', 'Bank', 'EcoCash', 'Swipe'], def: 'Cash', half: true }, { k: 'ref', label: 'Receipt / voucher no.', half: true },
    { k: 'payee', label: 'Received from / paid to', half: true }, { k: 'approved_by', label: 'Approved by', half: true, show: (d) => d.kind === 'Expense' },
    { k: 'description', label: 'Description', type: 'textarea', rows: 2 },
  ],
  cols: [{ h: 'Date', f: (c) => fdate(c.date), x: (c) => c.date }, { h: 'Receipt', k: 'ref' }, { h: 'Category', f: (c) => esc(c.category) + `<br><span class="muted sm">${esc(c.payee || '')}</span>`, x: (c) => c.category }, { h: 'Description', k: 'description', cls: 'hide-m' }, { h: 'Method', k: 'method' }, { h: 'Income', num: true, f: (c) => (c.kind === 'Income' ? money(c.amount) : ''), x: (c) => (c.kind === 'Income' ? num(c.amount) : '') }, { h: 'Expense', num: true, f: (c) => (c.kind === 'Expense' ? money(c.amount) : ''), x: (c) => (c.kind === 'Expense' ? num(c.amount) : '') }],
  foot: (rows) => ['Total', '', '', '', '', money(sum(rows.filter((c) => c.kind === 'Income'), 'amount')), money(sum(rows.filter((c) => c.kind === 'Expense'), 'amount'))],
  top: (rows, st) => {
    const inc = sum(rows.filter((c) => c.kind === 'Income'), 'amount'), exp = sum(rows.filter((c) => c.kind === 'Expense'), 'amount'), chk = cashChecks(rows);
    const cashNow = sum(APP.all('cash').filter((c) => c.method === 'Cash'), (c) => (c.kind === 'Income' ? 1 : -1) * num(c.amount));
    return `${stats([[money(inc), 'income'], [money(exp), 'expenses'], [money(inc - exp), 'balance for period', inc - exp < 0 ? 'alert' : ''], [money(cashNow), 'cash on hand (book)'], [chk.length, 'errors / discrepancies', chk.length ? 'alert' : '']])}
      ${chk.length ? `<div class="card bad"><h3>Errors and discrepancies to check</h3>${table([{ h: 'Date', f: (x) => fdate(x.c.date) }, { h: 'Problem', f: (x) => `<b>${esc(x.why)}</b>` }, { h: 'Entry', f: (x) => esc([x.c.kind, x.c.category, x.c.ref, x.c.description].filter(Boolean).join(' · ')) }, { h: 'Amount', num: true, f: (x) => money(x.c.amount) }], chk)}</div>` : ''}`;
  },
  buttons: [{ t: 'Close the day (count cash)', ghost: true, do: () => closeDayForm() }],
  bottom: (rows) => {
    const days = Object.entries(groupBy(rows, 'date')).sort((a, b) => b[0].localeCompare(a[0]));
    return `<h3 class="mt">Daily summary</h3>${table([{ h: 'Date', f: (r) => fdate(r[0]) }, { h: 'Income', num: true, f: (r) => money(sum(r[1].filter((c) => c.kind === 'Income'), 'amount')) }, { h: 'Expenses', num: true, f: (r) => money(sum(r[1].filter((c) => c.kind === 'Expense'), 'amount')) }, { h: 'Net', num: true, f: (r) => money(sum(r[1], (c) => (c.kind === 'Income' ? 1 : -1) * num(c.amount))) }, { h: 'Cash counted', num: true, f: (r) => { const c = APP.all('cashclose').find((x) => x.date === r[0]); if (!c) return '<span class="muted">not closed</span>'; const exp = cashBalanceBefore(r[0]) + sum(cashFor(r[0]).filter((x) => x.method === 'Cash'), (x) => (x.kind === 'Income' ? 1 : -1) * num(x.amount)); const d = num(c.counted) - exp; return money(c.counted) + ' ' + (Math.abs(d) < 0.01 ? pill('Balanced', 'ok') : pill((d < 0 ? 'Short ' : 'Over ') + money(Math.abs(d)), 'bad')); } }], days, { empty: '' })}`;
  },
};
function closeDayForm() {
  const d = today(), exp = cashBalanceBefore(d) + sum(cashFor(d).filter((c) => c.method === 'Cash'), (c) => (c.kind === 'Income' ? 1 : -1) * num(c.amount));
  const old = APP.all('cashclose').find((x) => x.date === d);
  formSheet('Close the day: count the cash', [{ k: 'date', label: 'Date', type: 'date', def: d, req: true, half: true }, { k: 'counted', label: 'Cash physically counted', type: 'money', req: true, half: true, help: 'The cash book says ' + money(exp) + ' should be on hand.' }, { k: 'counted_by', label: 'Counted by', def: APP.me.name, half: true }, { k: 'note', label: 'Note', half: true }], old || {}, (x) => {
    const e = cashBalanceBefore(x.date) + sum(cashFor(x.date).filter((c) => c.method === 'Cash'), (c) => (c.kind === 'Income' ? 1 : -1) * num(c.amount)), diff = num(x.counted) - e;
    APP.save('cashclose', { ...x, id: old && old.date === x.date ? old.id : undefined, expected: e, diff }); toast(Math.abs(diff) < 0.01 ? 'Cash balanced' : `Cash ${diff < 0 ? 'SHORT' : 'OVER'} by ${money(Math.abs(diff))}`, Math.abs(diff) >= 0.01);
  });
}

/* ---------------- ASSETS, REPAIRS ---------------- */
const ASSETS = {
  key: 'assets', col: 'assets', title: 'Assets', one: 'asset', ph: 'Search name, tag, serial, location',
  search: ['name', 'tag', 'serial', 'location', 'responsible', 'category'],
  filters: [{ k: 'category', label: 'All categories', opts: ['Medical equipment', 'Furniture', 'IT / computers', 'Electrical', 'Kitchen', 'Linen', 'Building', 'Other'] }, { k: 'condition', label: 'Any condition', opts: ['New', 'Good', 'Fair', 'Poor', 'Broken', 'Disposed'] }, { k: 'location', label: 'All locations', opts: LOOK.dept }],
  sort: (a, b) => (a.tag || '').localeCompare(b.tag || '', undefined, { numeric: true }),
  defaults: () => ({ tag: 'AS-' + String(APP.all('assets').length + 1).padStart(4, '0'), condition: 'Good', bought: today() }),
  fields: () => [
    { k: 'name', label: 'Asset name', req: true, half: true }, { k: 'tag', label: 'Asset tag no.', half: true },
    { k: 'category', label: 'Category', type: 'select', opts: ['Medical equipment', 'Furniture', 'IT / computers', 'Electrical', 'Kitchen', 'Linen', 'Building', 'Other'], req: true, half: true },
    { k: 'serial', label: 'Serial number', half: true }, { k: 'model', label: 'Make / model', half: true },
    { k: 'location', label: 'Where it is', type: 'datalist', opts: LOOK.dept, req: true, half: true }, { k: 'condition', label: 'Condition', type: 'select', opts: ['New', 'Good', 'Fair', 'Poor', 'Broken', 'Disposed'], req: true, half: true },
    { k: 'responsible', label: 'Person responsible', type: 'datalist', opts: () => LOOK.employee().map((e) => e[1].split(' · ')[0]), half: true },
    { k: 'bought', label: 'Date bought', type: 'date', half: true }, { k: 'cost', label: 'Cost', type: 'money', half: true, hide: !APP.moneyOK },
    { k: 'supplier', label: 'Bought from', half: true }, { k: 'warranty', label: 'Warranty until', type: 'date', half: true },
    { k: 'service_due', label: 'Next service / calibration', type: 'date', half: true }, { k: 'notes', label: 'Notes', type: 'textarea', rows: 2 },
  ],
  cols: [{ h: 'Tag', k: 'tag' }, { h: 'Asset', f: (a) => `<b>${esc(a.name)}</b><br><span class="muted sm">${esc([a.model, a.serial && 'S/N ' + a.serial].filter(Boolean).join(' · '))}</span>`, x: (a) => a.name }, { h: 'Serial', k: 'serial', cls: 'hide-m' }, { h: 'Location', k: 'location' }, { h: 'Responsible', k: 'responsible' }, { h: 'Condition', f: (a) => pill(a.condition, { New: 'ok', Good: 'ok', Fair: 'info', Poor: 'warn', Broken: 'bad', Disposed: '' }[a.condition]), x: (a) => a.condition }, { h: 'Service due', f: (a) => (a.service_due ? fdate(a.service_due) + (a.service_due <= addDays(today(), 14) ? ' ' + pill(a.service_due < today() ? 'Overdue' : 'Soon', 'warn') : '') : ''), x: (a) => a.service_due }],
  top: (rows) => stats([[rows.length, 'assets'], [rows.filter((a) => ['Poor', 'Broken'].includes(a.condition)).length, 'poor or broken', 'warn'], [rows.filter((a) => a.service_due && a.service_due <= addDays(today(), 14)).length, 'service due'], APP.moneyOK ? [money(sum(rows.filter((a) => a.condition !== 'Disposed'), 'cost')), 'value at cost'] : null]),
  extra: (a) => `<p class="mt"><button type="button" class="btn sm ghost" onclick="closeSheet();repairForm({asset:'${a.id}',what:${esc(JSON.stringify(a.name))},location:${esc(JSON.stringify(a.location || ''))}})">Report a repair for this asset</button></p>${(() => { const rs = APP.all('repairs').filter((r) => r.asset === a.id); return rs.length ? '<h3 class="mt">Repair history</h3>' + rs.map((r) => `<p class="sm">${fdate(r.reported)} · ${esc(r.what)} · ${esc(r.status)}</p>`).join('') : ''; })()}`,
  titleOf: (a) => a.name, wide: true,
};
function repairAge(r) { return daysBetween(r.reported || today(), r.status === 'Fixed' ? r.fixed || today() : today()); }
function repairLate(r) { const s = APP.settings(); return r.status !== 'Fixed' && repairAge(r) > (r.urgent ? s.repair_days_urgent : s.repair_days_normal); }
const REPAIRS = {
  key: 'repairs', col: 'repairs', title: 'Maintenance & repairs', one: 'repair', dateKey: 'reported', ph: 'Search what, where',
  search: ['what', 'location', 'reported_to', 'status'],
  filters: [{ k: 'status', label: 'Open or fixed', opts: [['open', 'Still open'], ['Fixed', 'Fixed']], test: (r, v) => (v === 'open' ? r.status !== 'Fixed' : r.status === v) }, { k: 'urgent', label: 'Urgency', opts: [['1', 'Urgent'], ['0', 'Not urgent']], test: (r, v) => !!r.urgent === (v === '1') }],
  defaults: () => ({ reported: today(), status: 'Reported' }),
  fields: () => [
    { k: 'what', label: 'What is broken', req: true }, { k: 'location', label: 'Where', type: 'datalist', opts: LOOK.dept, req: true, half: true },
    { k: 'reported', label: 'Date reported', type: 'date', def: today(), req: true, half: true }, { k: 'reported_to', label: 'Reported to', req: true, half: true },
    { k: 'urgent', label: 'Urgent', type: 'check', half: true },
    { k: 'status', label: 'Status', type: 'select', opts: ['Reported', 'In progress', 'Waiting for parts', 'Still waiting', 'Fixed'], req: true, half: true }, { k: 'fixed', label: 'Date fixed', type: 'date', half: true, show: (d) => d.status === 'Fixed' },
    { k: 'asset', label: 'Asset (optional)', type: 'select', opts: LOOK.asset, half: true }, { k: 'vehicle', label: 'Vehicle (optional)', type: 'select', opts: LOOK.vehicle, half: true },
    { k: 'cost', label: 'Repair cost', type: 'money', half: true, hide: !APP.moneyOK },
    { k: 'updates', label: 'Follow-ups', type: 'rows', one: 'follow-up', start: 0, sub: [{ k: 'date', label: 'Date', type: 'date', def: today() }, { k: 'note', label: 'What happened' }] },
  ],
  cols: [{ h: 'Reported', f: (r) => fdate(r.reported), x: (r) => r.reported }, { h: 'What', f: (r) => `<b>${esc(r.what)}</b>${r.urgent ? ' ' + pill('Urgent', 'bad') : ''}`, x: (r) => r.what }, { h: 'Where', k: 'location' }, { h: 'Reported to', k: 'reported_to' }, { h: 'Status', f: (r) => pill(r.status, r.status === 'Fixed' ? 'ok' : 'warn'), x: (r) => r.status }, { h: 'Days', num: true, f: (r) => (repairLate(r) ? pill(repairAge(r) + ' days, too long', 'bad') : repairAge(r)), x: (r) => repairAge(r) }],
  rowCls: (r) => (repairLate(r) ? 'hl-bad' : ''),
  sort: (a, b) => (a.status === 'Fixed') - (b.status === 'Fixed') || (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || (a.reported || '').localeCompare(b.reported || ''),
  top: (rows) => stats([[rows.filter((r) => r.status !== 'Fixed').length, 'open'], [rows.filter(repairLate).length, 'taking too long', rows.some(repairLate) ? 'alert' : ''], [rows.filter((r) => r.urgent && r.status !== 'Fixed').length, 'urgent open'], [rows.filter((r) => r.status === 'Fixed' && monthOf(r.fixed) === thisMonth()).length, 'fixed this month']]),
  titleOf: (r) => r.what, wide: true,
};
function repairForm(doc) { editDoc(REPAIRS, null); setTimeout(() => { const f = $('#sheet form'); if (!f || !doc) return; Object.entries(doc).forEach(([k, v]) => { if (f.elements[k]) f.elements[k].value = v; }); }, 40); }

/* ---------------- VEHICLES ---------------- */
function vehicleKm(v) { const t = APP.all('trips').filter((x) => x.vehicle === v.id), f = APP.all('fuel').filter((x) => x.vehicle === v.id); return Math.max(num(v.km), ...t.map((x) => num(x.km_in)), ...f.map((x) => num(x.km))); }
function vehicleAlerts(v) {
  const s = APP.settings(), out = [];
  const chk = (d, what, warn) => { if (!d) return; const n = daysBetween(today(), d); if (n < 0) out.push([what + ' EXPIRED ' + fdate(d), 'bad']); else if (n <= warn) out.push([what + ' due in ' + n + ' days', 'warn']); };
  chk(v.service_date, 'Service', s.service_warn_days); chk(v.licence, 'Vehicle licence (ZINARA)', s.vehicle_warn_days); chk(v.insurance, 'Vehicle insurance', s.vehicle_warn_days);
  if (num(v.service_km) && vehicleKm(v) >= num(v.service_km) - 500) out.push([`Service at ${fnum(v.service_km)} km (now ${fnum(vehicleKm(v))})`, vehicleKm(v) >= num(v.service_km) ? 'bad' : 'warn']);
  return out;
}
const VEHICLES = {
  key: 'vehicles', col: 'vehicles', title: 'Vehicles', one: 'vehicle', ph: 'Search registration, driver', search: ['reg', 'type', 'driver', 'make'],
  sort: (a, b) => (a.reg || '').localeCompare(b.reg || ''),
  fields: [{ k: 'reg', label: 'Registration number', req: true, half: true }, { k: 'type', label: 'Vehicle type', type: 'datalist', opts: ['Ambulance', 'Utility / pick-up', 'Sedan', 'Minibus', 'Truck', 'Motorbike'], req: true, half: true }, { k: 'make', label: 'Make / model', half: true }, { k: 'driver', label: 'Main driver', type: 'datalist', opts: () => LOOK.employee().map((e) => e[1].split(' · ')[0]), half: true }, { k: 'km', label: 'Current mileage (km)', type: 'number', half: true }, { k: 'service_date', label: 'Next service date', type: 'date', half: true }, { k: 'service_km', label: 'Next service at (km)', type: 'number', half: true }, { k: 'licence', label: 'Vehicle licence (ZINARA) expiry', type: 'date', half: true }, { k: 'insurance', label: 'Insurance expiry', type: 'date', half: true }, { k: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
  cols: [{ h: 'Registration', f: (v) => `<b>${esc(v.reg)}</b><br><span class="muted sm">${esc([v.type, v.make].filter(Boolean).join(' · '))}</span>`, x: (v) => v.reg }, { h: 'Driver', k: 'driver' }, { h: 'Mileage', num: true, f: (v) => fnum(vehicleKm(v)) + ' km', x: (v) => vehicleKm(v) }, { h: 'Fuel this month', num: true, f: (v) => fnum(sum(APP.all('fuel').filter((f) => f.vehicle === v.id && monthOf(f.date) === thisMonth()), 'litres'), 1) + ' L', x: (v) => sum(APP.all('fuel').filter((f) => f.vehicle === v.id && monthOf(f.date) === thisMonth()), 'litres') }, { h: 'Service', f: (v) => fdate(v.service_date), x: (v) => v.service_date }, { h: 'Licence', f: (v) => fdate(v.licence), x: (v) => v.licence }, { h: 'Insurance', f: (v) => fdate(v.insurance), x: (v) => v.insurance }, { h: 'Alerts', f: (v) => vehicleAlerts(v).map((a) => pill(...a)).join(' ') || pill('OK', 'ok'), x: (v) => vehicleAlerts(v).map((a) => a[0]).join('; ') }],
  buttons: [{ t: 'Log a trip', ghost: true, do: () => editDoc(TRIPS, null) }, { t: 'Add fuel', ghost: true, do: () => editDoc(FUEL, null) }],
  top: (rows) => stats([[rows.length, 'vehicles'], [rows.filter((v) => vehicleAlerts(v).length).length, 'need attention', rows.some((v) => vehicleAlerts(v).some((a) => a[1] === 'bad')) ? 'alert' : ''], [fnum(sum(APP.all('fuel').filter((f) => monthOf(f.date) === thisMonth()), 'litres'), 1) + ' L', 'fuel this month'], [fnum(sum(APP.all('trips').filter((t) => monthOf(t.date) === thisMonth()), (t) => Math.max(0, num(t.km_in) - num(t.km_out)))) + ' km', 'driven this month']]),
  bottom: () => {
    const vt = APP.all('trips').filter((t) => monthOf(t.date) === thisMonth()).sort((a, b) => b.date.localeCompare(a.date));
    return `<h3 class="mt">Logbook this month</h3>${table(TRIPS.cols, vt, { click: (r) => editDoc(TRIPS, r), empty: 'No trips logged this month.' })}<h3 class="mt">Fuel this month</h3>${table(FUEL.cols, APP.all('fuel').filter((f) => monthOf(f.date) === thisMonth()).sort((a, b) => b.date.localeCompare(a.date)), { click: (r) => editDoc(FUEL, r), empty: 'No fuel recorded this month.' })}`;
  },
  titleOf: (v) => v.reg, wide: true,
};
const TRIPS = { col: 'trips', one: 'trip', title: 'Logbook', fields: [{ k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true }, { k: 'vehicle', label: 'Vehicle', type: 'select', opts: LOOK.vehicle, req: true, half: true }, { k: 'driver', label: 'Who used it', req: true, half: true, type: 'datalist', opts: () => LOOK.employee().map((e) => e[1].split(' · ')[0]) }, { k: 'destination', label: 'Where it went', req: true, half: true }, { k: 'purpose', label: 'Purpose', half: true, type: 'datalist', opts: ['Patient transfer / referral', 'Collect supplies', 'Bank', 'Staff transport', 'Official meeting', 'Other'] }, { k: 'km_out', label: 'Mileage out', type: 'number', half: true }, { k: 'km_in', label: 'Mileage in', type: 'number', half: true }], check: (d) => { if (d.km_in && d.km_out && num(d.km_in) < num(d.km_out)) throw new Error('Mileage in must be more than mileage out.'); }, cols: [{ h: 'Date', f: (t) => fdate(t.date), x: (t) => t.date }, { h: 'Vehicle', f: (t) => esc(nameOf('vehicles', t.vehicle)), x: (t) => nameOf('vehicles', t.vehicle) }, { h: 'Driver', k: 'driver' }, { h: 'Where', k: 'destination' }, { h: 'Purpose', k: 'purpose' }, { h: 'Km', num: true, f: (t) => fnum(Math.max(0, num(t.km_in) - num(t.km_out))), x: (t) => Math.max(0, num(t.km_in) - num(t.km_out)) }] };
const FUEL = { col: 'fuel', one: 'fuel entry', title: 'Fuel', fields: [{ k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true }, { k: 'vehicle', label: 'Vehicle', type: 'select', opts: LOOK.vehicle, req: true, half: true }, { k: 'litres', label: 'Litres', type: 'number', req: true, half: true }, { k: 'cost', label: 'Cost', type: 'money', half: true }, { k: 'km', label: 'Mileage at fill', type: 'number', half: true }, { k: 'filled_by', label: 'Filled by', half: true, def: () => APP.me.name }, { k: 'receipt', label: 'Receipt no.', half: true }], cols: [{ h: 'Date', f: (t) => fdate(t.date), x: (t) => t.date }, { h: 'Vehicle', f: (t) => esc(nameOf('vehicles', t.vehicle)), x: (t) => nameOf('vehicles', t.vehicle) }, { h: 'Litres', num: true, f: (t) => fnum(t.litres, 1), x: (t) => num(t.litres) }, { h: 'Cost', num: true, f: (t) => money(t.cost), x: (t) => num(t.cost) }, { h: 'Mileage', num: true, f: (t) => fnum(t.km), x: (t) => num(t.km) }, { h: 'By', k: 'filled_by' }] };

/* ---------------- EMPLOYEES, ATTENDANCE, LEAVE ---------------- */
function leaveTaken(emp, type) { const y = today().slice(0, 4); return sum(APP.all('leave').filter((l) => l.emp === emp && (!type || l.type === type) && (l.from || '').slice(0, 4) === y), 'days'); }
function workDays(a, b) { if (!a || !b || b < a) return 0; let n = 0; for (let d = a; d <= b; d = addDays(d, 1)) { const w = new Date(d + 'T12:00:00').getDay(); if (w && w !== 6) n++; } return n; }
const EMPLOYEES = {
  key: 'employees', col: 'employees', title: 'Employees', one: 'employee', ph: 'Search name, position, phone', search: ['name', 'position', 'dept', 'phone', 'emp_no'],
  filters: [{ k: 'dept', label: 'All departments', opts: LOOK.dept }, { k: 'contract', label: 'All contracts', opts: ['Permanent', 'Fixed-term contract', 'Locum', 'Casual', 'Intern / student'] }, { k: 'active', label: 'Current staff', opts: [['yes', 'Current'], ['no', 'Left']], test: (r, v) => (v === 'yes' ? r.active !== false : r.active === false) }],
  sort: (a, b) => (a.name || '').localeCompare(b.name || ''), defaults: () => ({ active: true, leave_days: 22, start: today() }),
  fields: () => [{ k: 'name', label: 'Full name', req: true, half: true }, { k: 'emp_no', label: 'Employee no.', half: true }, { k: 'id_number', label: 'National ID number', half: true, hide: APP.me.role !== 'admin' }, { k: 'phone', label: 'Phone', half: true }, { k: 'position', label: 'Position', req: true, half: true, type: 'datalist', opts: ['Sister in charge', 'Registered nurse', 'Midwife', 'Nurse aide', 'Doctor', 'Pharmacist', 'Pharmacy technician', 'Lab scientist', 'Radiographer', 'Storekeeper', 'Accounts clerk', 'Receptionist', 'Driver', 'Cleaner', 'Cook', 'Security', 'Administrator'] }, { k: 'dept', label: 'Department', type: 'select', opts: LOOK.dept, req: true, half: true }, { k: 'start', label: 'Date started', type: 'date', half: true }, { k: 'contract', label: 'Contract type', type: 'select', opts: ['Permanent', 'Fixed-term contract', 'Locum', 'Casual', 'Intern / student'], half: true }, { k: 'contract_end', label: 'Contract ends', type: 'date', half: true, show: (d) => d.contract && d.contract !== 'Permanent' }, { k: 'nok', label: 'Next of kin', half: true }, { k: 'nok_phone', label: 'Next of kin phone', half: true }, { k: 'leave_days', label: 'Annual leave days per year', type: 'number', half: true }, { k: 'active', label: 'Currently employed', type: 'check', half: true }, { k: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
  cols: [{ h: 'Name', f: (e) => `<b>${esc(e.name)}</b>${e.active === false ? ' ' + pill('Left') : ''}<br><span class="muted sm">${esc(e.emp_no || '')}</span>`, x: (e) => e.name }, { h: 'Position', k: 'position' }, { h: 'Department', k: 'dept' }, { h: 'Phone', k: 'phone' }, { h: 'Contract', f: (e) => esc(e.contract || '') + (e.contract_end && e.contract_end <= addDays(today(), 30) ? ' ' + pill('ends ' + fdate(e.contract_end), 'warn') : ''), x: (e) => e.contract }, { h: 'Started', f: (e) => fdate(e.start), x: (e) => e.start }, { h: 'Leave taken / left', num: true, f: (e) => `${fnum(leaveTaken(e.id, 'Annual'))} / <b>${fnum(num(e.leave_days) - leaveTaken(e.id, 'Annual'))}</b>`, x: (e) => num(e.leave_days) - leaveTaken(e.id, 'Annual') }],
  top: (rows) => stats([[rows.filter((e) => e.active !== false).length, 'current staff'], [APP.all('attendance').filter((a) => a.date === today()).length, 'signed in today'], [APP.all('leave').filter((l) => l.from <= today() && l.to >= today()).length, 'on leave today'], [rows.filter((e) => e.contract_end && e.contract_end <= addDays(today(), 30) && e.active !== false).length, 'contracts ending soon']]),
  titleOf: (e) => e.name, wide: true,
};
const LEAVE = { key: 'leave', col: 'leave', title: 'Leave', one: 'leave', dateKey: 'from', ph: 'Search name', search: [(l) => nameOf('employees', l.emp), 'type'], filters: [{ k: 'type', label: 'All leave types', opts: ['Annual', 'Sick', 'Maternity', 'Compassionate', 'Study', 'Unpaid'] }], fields: [{ k: 'emp', label: 'Employee', type: 'select', opts: LOOK.employee, req: true }, { k: 'type', label: 'Leave type', type: 'select', opts: ['Annual', 'Sick', 'Maternity', 'Compassionate', 'Study', 'Unpaid'], req: true, half: true, def: 'Annual' }, { k: 'from', label: 'From', type: 'date', req: true, half: true }, { k: 'to', label: 'To', type: 'date', req: true, half: true }, { k: 'days', label: 'Working days', type: 'number', half: true, help: 'Fills itself (Mon to Fri)' }, { k: 'approved_by', label: 'Approved by', half: true, def: () => APP.me.name }, { k: 'note', label: 'Note', half: true }], prep: (d) => ({ ...d, days: d.days || workDays(d.from, d.to), emp_name: nameOf('employees', d.emp) }), check: (d) => { if (d.to < d.from) throw new Error('“To” is before “From”.'); }, cols: [{ h: 'Employee', f: (l) => `<b>${esc(nameOf('employees', l.emp))}</b>`, x: (l) => nameOf('employees', l.emp) }, { h: 'Type', k: 'type' }, { h: 'From', f: (l) => fdate(l.from), x: (l) => l.from }, { h: 'To', f: (l) => fdate(l.to), x: (l) => l.to }, { h: 'Days', num: true, k: 'days' }, { h: 'Annual days left', num: true, f: (l) => fnum(num((APP.get('employees', l.emp) || {}).leave_days) - leaveTaken(l.emp, 'Annual')), x: (l) => num((APP.get('employees', l.emp) || {}).leave_days) - leaveTaken(l.emp, 'Annual') }, { h: 'Now', f: (l) => (l.from <= today() && l.to >= today() ? pill('On leave', 'info') : ''), x: () => '' }] };
function attendancePage(el) {
  const st = PS('attendance', { date: today() }), d = st.date;
  const emps = APP.all('employees').filter((e) => e.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const att = APP.all('attendance').filter((a) => a.date === d), onLeave = APP.all('leave').filter((l) => l.from <= d && l.to >= d);
  const full = ['admin', 'nic'].includes(APP.me.role);
  const mine = APP.me.emp && att.find((a) => a.emp === APP.me.emp);
  const list = full ? emps : emps.filter((e) => e.id === APP.me.emp);
  el.innerHTML = `${APP.me.emp ? `<div class="card hi"><h3>${esc(APP.me.name)}</h3><p>${mine ? `Signed in at <b>${esc(mine.in)}</b>${mine.out ? `, out at <b>${esc(mine.out)}</b>` : ''}` : 'You have not signed in today.'}</p><div class="row gap">${!mine ? '<button class="btn" id="aIn">Sign in now</button>' : !mine.out ? '<button class="btn" id="aOut">Sign out now</button>' : ''}</div></div>` : !full ? '<div class="empty">Your login is not linked to an employee record yet. Ask the administrator to link it under Settings → Users.</div>' : ''}
    ${full ? `${stats([[att.length, 'came in'], [att.filter((a) => !a.out).length, 'still on duty'], [onLeave.length, 'on leave'], [Math.max(0, emps.length - att.length - onLeave.length), 'not signed in', 'warn']])}
    <div class="bar"><input type="date" id="ad" value="${d}"><span class="sp"></span><button class="btn ghost" id="aX">Excel (month)</button></div>
    ${table([{ h: 'Employee', f: (e) => `<b>${esc(e.name)}</b><br><span class="muted sm">${esc(e.position || '')} · ${esc(e.dept || '')}</span>` }, { h: 'Time in', f: (e) => { const a = att.find((x) => x.emp === e.id); return a ? `<b>${esc(a.in)}</b>` : onLeave.some((l) => l.emp === e.id) ? pill('On leave', 'info') : `<button class="btn sm" data-in="${e.id}">Mark in</button>`; } }, { h: 'Time out', f: (e) => { const a = att.find((x) => x.emp === e.id); return a ? (a.out ? esc(a.out) : `<button class="btn sm ghost" data-out="${a.id}">Mark out</button>`) : ''; } }, { h: 'Hours', num: true, f: (e) => { const a = att.find((x) => x.emp === e.id); if (!a || !a.out) return ''; const [h1, m1] = a.in.split(':').map(Number), [h2, m2] = a.out.split(':').map(Number); return fnum(((h2 * 60 + m2 - h1 * 60 - m1 + 1440) % 1440) / 60, 1); } }], list, { empty: 'Add employees first (People → Employees).', limit: 1000 })}` : ''}`;
  const nowT = () => new Date().toTimeString().slice(0, 5);
  if ($('#aIn')) $('#aIn').onclick = () => { APP.save('attendance', { emp: APP.me.emp, emp_name: APP.me.name, date: today(), in: nowT() }); toast('Signed in at ' + nowT()); };
  if ($('#aOut')) $('#aOut').onclick = () => { APP.save('attendance', { ...mine, out: nowT() }); toast('Signed out at ' + nowT()); };
  if ($('#ad')) $('#ad').onchange = (e) => { st.date = e.target.value; rerender(); };
  $$('[data-in]', el).forEach((b) => (b.onclick = () => { const e = APP.get('employees', b.dataset.in); APP.save('attendance', { emp: e.id, emp_name: e.name, date: d, in: d === today() ? nowT() : '07:30', marked_by: APP.me.name }); }));
  $$('[data-out]', el).forEach((b) => (b.onclick = () => { const a = APP.get('attendance', b.dataset.out); APP.save('attendance', { ...a, out: d === today() ? nowT() : '16:30' }); }));
  if ($('#aX')) $('#aX').onclick = () => { const m = monthOf(d), rows = APP.all('attendance').filter((a) => monthOf(a.date) === m).sort((a, b) => a.date.localeCompare(b.date)); downloadXlsx('Attendance ' + m, [['Attendance ' + m, [['Date', 'Employee', 'In', 'Out', 'Marked by'], ...rows.map((a) => [a.date, a.emp_name || nameOf('employees', a.emp), a.in, a.out || '', a.marked_by || a.by_name])]]]); };
}

/* ---------------- MEETINGS, STRATEGIC PLAN ---------------- */
const openActions = () => APP.all('meetings').flatMap((m) => (m.actions || []).map((a, i) => ({ ...a, m, i }))).filter((a) => !a.done);
const MEETINGS = {
  key: 'meetings', col: 'meetings', title: 'Meetings & minutes', one: 'meeting', dateKey: 'date', ph: 'Search title, decisions, people', search: ['title', 'type', 'attendees', 'discussion', 'decisions'],
  filters: [{ k: 'type', label: 'All meetings', opts: ['Management meeting', 'Staff meeting', 'Strategic meeting', 'Department meeting', 'Other'] }],
  fields: [{ k: 'type', label: 'Type', type: 'select', opts: ['Management meeting', 'Staff meeting', 'Strategic meeting', 'Department meeting', 'Other'], req: true, half: true }, { k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true }, { k: 'title', label: 'Title', half: true }, { k: 'chair', label: 'Chaired by', half: true }, { k: 'attendees', label: 'Who attended', type: 'textarea', rows: 2 }, { k: 'agenda', label: 'Agenda', type: 'textarea', rows: 3 }, { k: 'discussion', label: 'What was discussed', type: 'textarea', rows: 5 }, { k: 'decisions', label: 'Decisions', type: 'textarea', rows: 3 }, { k: 'actions', label: 'Action points', type: 'rows', one: 'action', start: 0, sub: [{ k: 'what', label: 'What must be done' }, { k: 'who', label: 'Who' }, { k: 'due', label: 'By when', type: 'date' }, { k: 'done', label: 'Done', type: 'check' }] }],
  cols: [{ h: 'Date', f: (m) => fdate(m.date), x: (m) => m.date }, { h: 'Meeting', f: (m) => `<b>${esc(m.title || m.type)}</b><br><span class="muted sm">${esc(m.type)}</span>`, x: (m) => m.title || m.type }, { h: 'Decisions', f: (m) => esc((m.decisions || '').slice(0, 120)), x: (m) => m.decisions }, { h: 'Actions open', num: true, f: (m) => { const o = (m.actions || []).filter((a) => !a.done); return o.length ? pill(o.length + ' open', o.some((a) => a.due && a.due < today()) ? 'bad' : 'warn') : (m.actions || []).length ? pill('All done', 'ok') : ''; }, x: (m) => (m.actions || []).filter((a) => !a.done).length }],
  top: () => { const oa = openActions(); return `${stats([[APP.all('meetings').filter((m) => monthOf(m.date) === thisMonth()).length, 'meetings this month'], [oa.length, 'action points not done'], [oa.filter((a) => a.due && a.due < today()).length, 'overdue', oa.some((a) => a.due && a.due < today()) ? 'alert' : '']])}${oa.length ? `<div class="card"><h3>Action points still to do</h3>${table([{ h: 'What', f: (a) => `<b>${esc(a.what)}</b>` }, { h: 'Who', k: 'who' }, { h: 'Due', f: (a) => (a.due ? fdate(a.due) + (a.due < today() ? ' ' + pill('Overdue', 'bad') : '') : '') }, { h: 'From', f: (a) => esc((a.m.title || a.m.type) + ' · ' + fdate(a.m.date)) }, { h: '', f: (a) => (APP.can('meetings', true) ? `<button class="btn sm ghost" data-done="${a.m.id}|${a.i}">Mark done</button>` : '') }], oa.sort((a, b) => (a.due || '9').localeCompare(b.due || '9')))}</div>` : ''}`; },
  after: (el) => $$('[data-done]', el).forEach((b) => (b.onclick = () => { const [id, i] = b.dataset.done.split('|'); const m = APP.get('meetings', id); const acts = m.actions.slice(); acts[i] = { ...acts[i], done: true, done_at: today() }; APP.save('meetings', { ...m, actions: acts }); toast('Action marked done'); })),
  extra: (m) => `<p class="mt"><button type="button" class="btn sm ghost" onclick="printMinutes('${m.id}')">Print / PDF minutes</button></p>`,
  titleOf: (m) => (m.title || m.type) + ' · ' + fdate(m.date), wide: true,
};
function printMinutes(id) {
  const m = APP.get('meetings', id); closeSheet();
  printArea('Minutes', `<h1>${esc(m.title || m.type)}</h1><p><b>${esc(m.type)}</b> · ${fdate(m.date)}${m.chair ? ' · Chaired by ' + esc(m.chair) : ''}</p>${[['Present', m.attendees], ['Agenda', m.agenda], ['Discussion', m.discussion], ['Decisions', m.decisions]].filter((x) => x[1]).map(([h, t]) => `<h3>${h}</h3><p style="white-space:pre-wrap">${esc(t)}</p>`).join('')}${(m.actions || []).length ? `<h3>Action points</h3>${table([{ h: 'Action', k: 'what' }, { h: 'Who', k: 'who' }, { h: 'By when', f: (a) => fdate(a.due) }, { h: 'Done', f: (a) => (a.done ? 'Yes' : 'No') }], m.actions)}` : ''}`);
}
function goalState(g) { if (g.status === 'Done' || num(g.progress) >= 100) return ['Done', 'ok']; if (g.end && g.end < today()) return ['Delayed', 'bad']; if (g.end && daysBetween(today(), g.end) <= 14) return ['Deadline near', 'warn']; return [g.status || 'In progress', g.status === 'Not started' ? '' : 'info']; }
const GOALS = {
  key: 'goals', col: 'goals', title: 'Strategic plan', one: 'goal', ph: 'Search goals', search: ['goal', 'owner', 'area'],
  filters: [{ k: 'status', label: 'All statuses', opts: ['Not started', 'In progress', 'Done', 'Delayed'] }],
  sort: (a, b) => (a.end || '9').localeCompare(b.end || '9'),
  fields: [{ k: 'goal', label: 'Goal', req: true }, { k: 'area', label: 'Area', type: 'datalist', opts: ['Patient care', 'Finance', 'Staff', 'Infrastructure', 'Equipment', 'Quality & safety', 'Community'], half: true }, { k: 'owner', label: 'Who is responsible', req: true, half: true }, { k: 'start', label: 'Start date', type: 'date', half: true }, { k: 'end', label: 'End date', type: 'date', req: true, half: true }, { k: 'status', label: 'Status', type: 'select', opts: ['Not started', 'In progress', 'Done', 'Delayed'], def: 'Not started', half: true }, { k: 'progress', label: 'Progress %', type: 'number', min: 0, half: true }, { k: 'notes', label: 'Progress notes', type: 'textarea', rows: 3 }],
  cols: [{ h: 'Goal', f: (g) => `<b>${esc(g.goal)}</b><br><span class="muted sm">${esc(g.area || '')}</span>`, x: (g) => g.goal }, { h: 'Responsible', k: 'owner' }, { h: 'Start', f: (g) => fdate(g.start), x: (g) => g.start }, { h: 'End', f: (g) => fdate(g.end), x: (g) => g.end }, { h: 'Progress', f: (g) => `<div class="prog"><i style="width:${Math.min(100, num(g.progress))}%"></i></div><span class="sm">${fnum(g.progress)}%</span>`, x: (g) => num(g.progress) }, { h: 'Status', f: (g) => pill(...goalState(g)), x: (g) => goalState(g)[0] }],
  top: (rows) => stats([[rows.length, 'goals'], [pct(sum(rows, (g) => Math.min(100, num(g.progress))), rows.length * 100) + '%', 'overall progress'], [rows.filter((g) => goalState(g)[0] === 'Delayed').length, 'delayed', rows.some((g) => goalState(g)[0] === 'Delayed') ? 'alert' : ''], [rows.filter((g) => goalState(g)[0] === 'Deadline near').length, 'deadline within 2 weeks']]),
  titleOf: (g) => g.goal,
};

/* ---------------- SUPPLIERS ---------------- */
const SUPPLIERS = { key: 'suppliers', col: 'suppliers', title: 'Suppliers', one: 'supplier', sort: (a, b) => (a.name || '').localeCompare(b.name || ''), search: ['name', 'contact', 'phone', 'supplies'], fields: [{ k: 'name', label: 'Supplier name', req: true }, { k: 'contact', label: 'Contact person', half: true }, { k: 'phone', label: 'Phone', half: true }, { k: 'email', label: 'Email', half: true }, { k: 'supplies', label: 'What they supply', half: true }, { k: 'address', label: 'Address', type: 'textarea', rows: 2 }], cols: [{ h: 'Supplier', f: (s) => `<b>${esc(s.name)}</b>`, x: (s) => s.name }, { h: 'Contact', f: (s) => esc([s.contact, s.phone].filter(Boolean).join(' · ')), x: (s) => s.contact }, { h: 'Supplies', k: 'supplies' }, { h: 'Orders', num: true, f: (s) => APP.all('orders').filter((o) => o.supplier === s.id).length, x: (s) => APP.all('orders').filter((o) => o.supplier === s.id).length }] };

/* ---------------- HEALTH DATA ---------------- */
// type of visit, so maternity bookings, casualty attendances and so on can be counted
const VISITS = ['Consultation', 'Emergency', 'Antenatal booking (1st visit)', 'Antenatal revisit', 'Postnatal check', 'Family planning', 'Immunisation', 'Test / investigation', 'Procedure / treatment', 'Review / follow-up', 'Other'];
const ROUTINE_VISITS = ['Antenatal booking (1st visit)', 'Antenatal revisit', 'Postnatal check', 'Family planning', 'Immunisation', 'Test / investigation'];
// disease figures leave out routine visits such as antenatal care, which are not illnesses
const sickVisits = () => APP.all('patients').filter((p) => !ROUTINE_VISITS.includes(p.visit));
const visitDefault = (dept) => (/casualty|emergency/i.test(dept || '') ? 'Emergency' : 'Consultation');
const OUTCOMES = ['Treated & discharged', 'Admitted', 'Referred', 'Died', 'Absconded'];
const PATIENTS = {
  key: 'patients', col: 'patients', title: 'Patients seen', one: 'patient record', dateKey: 'date', range: 'today', ph: 'Search diagnosis, area, file no.', search: ['diagnosis', 'area', 'file_no', 'dept'],
  filters: [{ k: 'dept', label: 'All departments', opts: LOOK.dept }, { k: 'visit', label: 'All visit types', opts: VISITS, test: (p, v) => (p.visit || 'Consultation') === v }, { k: 'diagnosis', label: 'All diagnoses', opts: LOOK.diagnosis }, { k: 'outcome', label: 'All outcomes', opts: OUTCOMES }],
  defaults: () => { const dept = APP.me.dept || LOOK.dept()[0] || ''; return { date: today(), dept, visit: visitDefault(dept), case: 'New', outcome: 'Treated & discharged', payer: 'Cash', sex: '' }; },
  check: (d) => { if (!d.visit) d.visit = visitDefault(d.dept); if (!String(d.diagnosis || '').trim()) { if (ROUTINE_VISITS.includes(d.visit)) d.diagnosis = d.visit; else throw new Error('Please fill in “Diagnosis”.'); } },
  fields: () => [{ k: 'date', label: 'Date seen / admitted', type: 'date', def: today(), req: true, half: true }, { k: 'dept', label: 'Department', type: 'select', opts: LOOK.dept, req: true, half: true }, { k: 'visit', label: 'Type of visit', type: 'select', opts: VISITS, blank: false, half: true }, { k: 'file_no', label: 'File no. (optional)', half: true }, { k: 'age', label: 'Age', type: 'number', min: 0, req: true, third: true }, { k: 'age_unit', label: 'Age in', type: 'select', opts: ['years', 'months', 'days'], def: 'years', blank: false, third: true }, { k: 'sex', label: 'Sex', type: 'select', opts: ['Female', 'Male'], req: true, third: true }, { k: 'area', label: 'Where from (area / village / suburb)', type: 'datalist', opts: () => [...new Set([...APP.settings().areas, ...APP.all('patients').map((p) => p.area).filter(Boolean)])], req: true, half: true }, { k: 'diagnosis', label: 'Diagnosis (not needed for antenatal, postnatal, family planning or immunisation visits)', type: 'datalist', opts: LOOK.diagnosis, half: true }, { k: 'diagnosis2', label: 'Second diagnosis (optional)', type: 'datalist', opts: LOOK.diagnosis, half: true }, { k: 'case', label: 'Case', type: 'select', opts: ['New', 'Follow-up'], req: true, half: true }, { k: 'outcome', label: 'Outcome', type: 'select', opts: OUTCOMES, req: true, half: true }, { k: 'death_cause', label: 'Cause of death', half: true, show: (d) => d.outcome === 'Died' }, { k: 'payer', label: 'Payment', type: 'select', opts: () => ['Cash', ...APP.settings().aids], def: 'Cash', half: true }, { k: 'pregnant', label: 'Pregnant', type: 'check', half: true, show: (d) => d.sex === 'Female' }],
  cols: [{ h: 'Date', f: (p) => fdate(p.date), x: (p) => p.date }, { h: 'Age / sex', f: (p) => `${fnum(p.age)}${p.age_unit && p.age_unit !== 'years' ? ' ' + p.age_unit.slice(0, 2) : ''} ${p.sex === 'Female' ? 'F' : 'M'}`, x: (p) => p.age + ' ' + p.sex }, { h: 'Diagnosis', f: (p) => `<b>${esc(p.diagnosis)}</b>${p.diagnosis2 ? `<br><span class="muted sm">${esc(p.diagnosis2)}</span>` : ''}`, x: (p) => p.diagnosis }, { h: 'Department', k: 'dept' }, { h: 'Visit', f: (p) => esc(p.visit || 'Consultation'), x: (p) => p.visit || 'Consultation' }, { h: 'Area', k: 'area' }, { h: 'Case', k: 'case' }, { h: 'Outcome', f: (p) => pill(p.outcome, { Died: 'bad', Referred: 'warn', Admitted: 'info' }[p.outcome] || 'ok'), x: (p) => p.outcome }, { h: 'Payment', k: 'payer' }],
  top: (rows) => stats([[rows.length, 'patients'], [rows.filter((p) => p.case === 'New').length, 'new cases'], [rows.filter((p) => p.outcome === 'Admitted').length, 'admitted'], [rows.filter((p) => p.outcome === 'Died').length, 'deaths', rows.some((p) => p.outcome === 'Died') ? 'alert' : ''], [rows.filter((p) => p.payer && p.payer !== 'Cash').length, 'on medical aid']]),
  buttons: [{ t: 'Add & next', ghost: true, do: () => quickPatient() }],
  addText: '+ Patient', titleOf: (p) => p.diagnosis + ' · ' + fdate(p.date), wide: true,
};
function quickPatient() { editDoc({ ...PATIENTS, afterSave: (s, isNew) => { if (isNew) setTimeout(quickPatient, 60); } }, null); }
function ageYears(p) { return p.age_unit === 'months' ? num(p.age) / 12 : p.age_unit === 'days' ? num(p.age) / 365 : num(p.age); }
const BIRTHS = {
  key: 'births', col: 'births', title: 'Deliveries', one: 'delivery', dateKey: 'date', range: 'month', search: ['file_no', 'mode', 'area'],
  defaults: () => ({ date: today(), mode: 'Normal (SVD)', hiv: 'Negative', babies: [{ outcome: 'Live birth', sex: '', weight: '' }] }),
  fields: [{ k: 'date', label: 'Date of delivery', type: 'date', def: today(), req: true, half: true }, { k: 'file_no', label: 'Mother file no.', half: true }, { k: 'mother_age', label: 'Mother age', type: 'number', half: true }, { k: 'area', label: 'Where from', half: true, type: 'datalist', opts: () => [...new Set(APP.all('patients').map((p) => p.area).filter(Boolean))] }, { k: 'mode', label: 'Mode of delivery', type: 'select', opts: ['Normal (SVD)', 'Assisted (vacuum / forceps)', 'Caesarean section', 'Breech'], req: true, half: true }, { k: 'gestation', label: 'Gestation (weeks)', type: 'number', half: true }, { k: 'babies', label: 'Baby / babies', type: 'rows', one: 'baby', req: true, sub: [{ k: 'outcome', label: 'Outcome', type: 'select', opts: ['Live birth', 'Fresh stillbirth', 'Macerated stillbirth'] }, { k: 'sex', label: 'Sex', type: 'select', opts: ['Girl', 'Boy'] }, { k: 'weight', label: 'Weight (kg)', type: 'number' }, { k: 'neonatal_death', label: 'Died within 28 days', type: 'check' }] }, { k: 'complications', label: 'Complications (comma separated)', type: 'datalist', opts: ['Postpartum haemorrhage', 'Pre-eclampsia', 'Eclampsia', 'Obstructed labour', 'Prolonged labour', 'Sepsis', 'Retained placenta', 'Ruptured uterus', 'Perineal tear', 'None'], half: true }, { k: 'hiv', label: 'Mother HIV status', type: 'select', opts: ['Negative', 'Positive', 'Unknown'], half: true }, { k: 'nvp', label: 'Baby given Nevirapine', type: 'check', half: true, show: (d) => d.hiv === 'Positive' }, { k: 'maternal_death', label: 'Mother died', type: 'check', half: true }, { k: 'death_cause', label: 'Cause of maternal death', half: true, show: (d) => d.maternal_death }],
  cols: [{ h: 'Date', f: (b) => fdate(b.date), x: (b) => b.date }, { h: 'Mode', k: 'mode' }, { h: 'Babies', f: (b) => (b.babies || []).map((x) => pill(`${x.sex || '?'} · ${x.outcome}${x.weight ? ' · ' + x.weight + 'kg' : ''}`, x.outcome === 'Live birth' ? 'ok' : 'bad')).join(' '), x: (b) => (b.babies || []).map((x) => x.sex + ' ' + x.outcome).join('; ') }, { h: 'Complications', k: 'complications' }, { h: 'HIV', f: (b) => esc(b.hiv || '') + (b.nvp ? ' · NVP' : ''), x: (b) => b.hiv }, { h: 'Mother', f: (b) => (b.maternal_death ? pill('Died', 'bad') : ''), x: (b) => (b.maternal_death ? 'Died' : '') }],
  top: (rows) => { const bb = rows.flatMap((r) => r.babies || []); return stats([[rows.length, 'deliveries'], [rows.filter((r) => /Caesarean/.test(r.mode)).length, 'C-sections'], [bb.filter((b) => b.outcome === 'Live birth').length, 'live births'], [bb.filter((b) => /stillbirth/.test(b.outcome)).length, 'stillbirths', bb.some((b) => /stillbirth/.test(b.outcome)) ? 'alert' : ''], [rows.filter((r) => r.maternal_death).length, 'maternal deaths', rows.some((r) => r.maternal_death) ? 'alert' : '']]); },
  titleOf: (b) => 'Delivery · ' + fdate(b.date), wide: true,
};
function ageBand(y) { return y < 1 ? 'Under 1' : y < 5 ? '1–4' : y < 15 ? '5–14' : y < 25 ? '15–24' : y < 45 ? '25–44' : y < 65 ? '45–64' : '65+'; }
const BANDS = ['Under 1', '1–4', '5–14', '15–24', '25–44', '45–64', '65+'];
function epiData(month) {
  const ps = sickVisits().filter((p) => monthOf(p.date) === month), prev = sickVisits().filter((p) => monthOf(p.date) === prevMonth(month));
  const dx = (arr) => arr.flatMap((p) => [p.diagnosis, p.diagnosis2].filter(Boolean).map((d) => ({ ...p, d })));
  const cases = dx(ps), pcases = dx(prev);
  const top = Object.entries(groupBy(cases, 'd')).map(([d, a]) => ({ d, n: a.length, m: a.filter((p) => p.sex === 'Male').length, f: a.filter((p) => p.sex === 'Female').length, u5: a.filter((p) => ageYears(p) < 5).length, prev: pcases.filter((p) => p.d === d).length, new: a.filter((p) => p.case === 'New').length, died: a.filter((p) => p.outcome === 'Died').length, topBand: Object.entries(groupBy(a, (p) => ageBand(ageYears(p)))).sort((x, y) => y[1].length - x[1].length)[0], topArea: Object.entries(groupBy(a, 'area')).sort((x, y) => y[1].length - x[1].length)[0] })).sort((a, b) => b.n - a.n);
  const births = APP.all('births').filter((b) => monthOf(b.date) === month), bb = births.flatMap((b) => b.babies || []);
  return { ps, cases, top, births, bb, deaths: ps.filter((p) => p.outcome === 'Died') };
}
function outbreaks() {
  const out = [], all = sickVisits(), wk = (n) => [addDays(today(), -7 * (n + 1) + 1), addDays(today(), -7 * n)];
  const diag = [...new Set(all.filter((p) => p.date >= addDays(today(), -6)).map((p) => p.diagnosis))];
  diag.forEach((d) => {
    const cnt = (n) => all.filter((p) => p.diagnosis === d && p.date >= wk(n)[0] && p.date <= wk(n)[1]).length;
    const now = cnt(0), avg = (cnt(1) + cnt(2) + cnt(3) + cnt(4)) / 4;
    if (now >= 5 && now >= 2 * Math.max(1, avg)) { const areas = Object.entries(groupBy(all.filter((p) => p.diagnosis === d && p.date >= wk(0)[0]), 'area')).sort((a, b) => b[1].length - a[1].length)[0]; out.push({ d, now, avg, area: areas ? areas[0] + ' (' + areas[1].length + ')' : '' }); }
  });
  return out;
}
function epiPage(el) {
  const st = PS('epi', { month: thisMonth(), disease: '' }), E = epiData(st.month);
  const weeks = []; for (let i = 11; i >= 0; i--) weeks.push(addDays(today(), -7 * i - 6));
  const dis = st.disease || (E.top[0] || {}).d || '';
  const series = dis ? [{ name: dis, values: weeks.map((w) => sickVisits().filter((p) => (p.diagnosis === dis || p.diagnosis2 === dis) && p.date >= w && p.date <= addDays(w, 6)).length) }] : [];
  const deptTop = Object.entries(groupBy(E.cases, 'dept')).map(([d, a]) => ({ d, n: a.length, top: Object.entries(groupBy(a, 'd')).sort((x, y) => y[1].length - x[1].length).slice(0, 3).map(([k, v]) => `${k} (${v.length})`).join(', ') })).sort((a, b) => b.n - a.n);
  const areas = Object.entries(groupBy(E.ps, 'area')).map(([a, arr]) => ({ a, n: arr.length, top: Object.entries(groupBy(arr, 'diagnosis')).sort((x, y) => y[1].length - x[1].length)[0] })).sort((a, b) => b.n - a.n);
  const ob = outbreaks();
  const bands = BANDS.map((b) => ({ b, m: E.ps.filter((p) => ageBand(ageYears(p)) === b && p.sex === 'Male').length, f: E.ps.filter((p) => ageBand(ageYears(p)) === b && p.sex === 'Female').length }));
  const comps = Object.entries(groupBy(E.births.flatMap((b) => String(b.complications || '').split(',').map((s) => s.trim()).filter((s) => s && s !== 'None')), (x) => x)).map(([k, a]) => [k, a.length]).sort((a, b) => b[1] - a[1]);
  el.innerHTML = `<div class="bar"><input type="month" id="em" value="${st.month}"><span class="sp"></span><button class="btn ghost" id="eP">Print report</button><button class="btn ghost" id="eX">Excel</button></div>
    ${ob.length ? `<div class="note bad"><b>Possible outbreak:</b> ${ob.map((o) => `${esc(o.d)}: ${o.now} cases in the last 7 days, usually about ${fnum(o.avg, 1)} a week${o.area ? '. Most from ' + esc(o.area) : ''}.`).join('<br>')}</div>` : ''}
    <div id="epiBody">
    ${stats([[E.ps.length, 'patients seen'], [E.ps.filter((p) => p.case === 'New').length, 'new cases'], [E.ps.filter((p) => p.outcome === 'Admitted').length, 'admitted'], [E.ps.filter((p) => p.outcome === 'Referred').length, 'referred'], [E.deaths.length + E.births.filter((b) => b.maternal_death).length, 'deaths', E.deaths.length ? 'alert' : '']])}
    <div class="grid2"><div class="card"><h3>Top 10 diseases, ${monthName(st.month)}</h3>${table([{ h: '#', f: (r) => E.top.indexOf(r) + 1 }, { h: 'Disease', f: (r) => `<b>${esc(r.d)}</b>` }, { h: 'Cases', num: true, k: 'n' }, { h: 'vs last month', num: true, f: (r) => (r.n > r.prev ? pill('▲ ' + (r.n - r.prev), 'bad') : r.n < r.prev ? pill('▼ ' + (r.prev - r.n), 'ok') : pill('same')) }, { h: 'Male / female', num: true, f: (r) => `${r.m} / ${r.f}` }, { h: 'Mostly', f: (r) => esc((r.topBand ? r.topBand[0] + ' yrs' : '') + (r.topArea ? ' · ' + r.topArea[0] : '')) }], E.top.slice(0, 10), { empty: 'No patients recorded this month. Add them under Patients seen.' })}</div>
    <div class="card"><h3>Weekly trend (last 12 weeks)</h3><select id="eD">${E.top.map((r) => `<option ${r.d === dis ? 'selected' : ''}>${esc(r.d)}</option>`).join('')}</select>${dis ? lineChart(series, weeks.map((w) => new Date(w + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))) : ''}</div></div>
    <div class="grid2"><div class="card"><h3>Age and sex</h3>${table([{ h: 'Age', k: 'b' }, { h: 'Male', num: true, k: 'm' }, { h: 'Female', num: true, k: 'f' }, { h: 'Total', num: true, f: (r) => `<b>${r.m + r.f}</b>` }], bands)}</div>
    <div class="card"><h3>By department</h3>${table([{ h: 'Department', f: (r) => `<b>${esc(r.d)}</b>` }, { h: 'Cases', num: true, k: 'n' }, { h: 'Most common', f: (r) => esc(r.top) }], deptTop, { empty: 'No data.' })}</div></div>
    <div class="grid2"><div class="card"><h3>Where patients come from</h3>${barChart(areas.slice(0, 12).map((a) => [a.a, a.n]), { tone: 'b' })}${areas.length ? `<p class="muted sm">${areas.slice(0, 3).map((a) => `${esc(a.a)}: mostly ${esc(a.top[0])} (${a.top[1].length})`).join(' · ')}</p>` : ''}</div>
    <div class="card"><h3>Maternal and baby data</h3>${table([{ h: '', k: 'k' }, { h: '', num: true, k: 'v' }], [{ k: 'Deliveries', v: E.births.length }, { k: 'Normal deliveries', v: E.births.filter((b) => /Normal|Breech/.test(b.mode)).length }, { k: 'Assisted', v: E.births.filter((b) => /Assisted/.test(b.mode)).length }, { k: 'C-sections', v: E.births.filter((b) => /Caesarean/.test(b.mode)).length }, { k: 'Live births', v: E.bb.filter((b) => b.outcome === 'Live birth').length }, { k: 'Stillbirths', v: E.bb.filter((b) => /stillbirth/.test(b.outcome)).length }, { k: 'Baby boys', v: E.bb.filter((b) => b.sex === 'Boy').length }, { k: 'Baby girls', v: E.bb.filter((b) => b.sex === 'Girl').length }, { k: 'Low birth weight (under 2.5 kg)', v: E.bb.filter((b) => b.weight && num(b.weight) < 2.5).length }, { k: 'Maternal deaths', v: E.births.filter((b) => b.maternal_death).length }, { k: 'Neonatal deaths', v: E.bb.filter((b) => b.neonatal_death).length }, { k: 'Mothers HIV positive', v: E.births.filter((b) => b.hiv === 'Positive').length }, { k: 'Babies given Nevirapine', v: E.births.filter((b) => b.nvp).length }])}${comps.length ? '<h3 class="mt">Common complications</h3>' + barChart(comps, { tone: 'r' }) : ''}</div></div>
    <div class="card"><h3>Deaths</h3>${table([{ h: 'Date', f: (p) => fdate(p.date) }, { h: 'Age / sex', f: (p) => `${fnum(p.age)} ${p.age_unit && p.age_unit !== 'years' ? p.age_unit : ''} ${p.sex}` }, { h: 'Department', k: 'dept' }, { h: 'Diagnosis', k: 'diagnosis' }, { h: 'Cause of death', k: 'death_cause' }], [...E.deaths, ...E.births.filter((b) => b.maternal_death).map((b) => ({ date: b.date, age: b.mother_age, sex: 'Female', dept: 'Maternity Ward', diagnosis: 'Maternal death', death_cause: b.death_cause }))], { empty: 'No deaths recorded this month.' })}</div>
    </div>`;
  $('#em').onchange = (e) => { st.month = e.target.value; st.disease = ''; rerender(); };
  if ($('#eD')) $('#eD').onchange = (e) => { st.disease = e.target.value; rerender(); };
  $('#eP').onclick = () => printArea('Epidemiological report ' + monthName(st.month), $('#epiBody').innerHTML);
  $('#eX').onclick = () => downloadXlsx('Epidemiology ' + st.month, epiSheets(st.month));
}
function epiSheets(month) {
  const E = epiData(month);
  return [['Top diseases', [['Rank', 'Disease', 'Cases', 'Last month', 'Male', 'Female', 'Under 5', 'New', 'Died'], ...E.top.map((r, i) => [i + 1, r.d, r.n, r.prev, r.m, r.f, r.u5, r.new, r.died])]],
    ['Age & sex', [['Age', 'Male', 'Female'], ...BANDS.map((b) => [b, E.ps.filter((p) => ageBand(ageYears(p)) === b && p.sex === 'Male').length, E.ps.filter((p) => ageBand(ageYears(p)) === b && p.sex === 'Female').length])]],
    ['By area', [['Area', 'Patients'], ...Object.entries(groupBy(E.ps, 'area')).map(([a, arr]) => [a, arr.length]).sort((a, b) => b[1] - a[1])]],
    ['Maternity', [['Measure', 'Number'], ['Deliveries', E.births.length], ['Normal', E.births.filter((b) => /Normal|Breech/.test(b.mode)).length], ['Assisted', E.births.filter((b) => /Assisted/.test(b.mode)).length], ['C-sections', E.births.filter((b) => /Caesarean/.test(b.mode)).length], ['Live births', E.bb.filter((b) => b.outcome === 'Live birth').length], ['Stillbirths', E.bb.filter((b) => /stillbirth/.test(b.outcome)).length], ['Boys', E.bb.filter((b) => b.sex === 'Boy').length], ['Girls', E.bb.filter((b) => b.sex === 'Girl').length], ['Maternal deaths', E.births.filter((b) => b.maternal_death).length], ['Neonatal deaths', E.bb.filter((b) => b.neonatal_death).length], ['Mothers HIV+', E.births.filter((b) => b.hiv === 'Positive').length], ['Nevirapine given', E.births.filter((b) => b.nvp).length]]],
    ['Patients', [['Date', 'Department', 'Age', 'Age unit', 'Sex', 'Area', 'Diagnosis', 'Second diagnosis', 'Case', 'Outcome', 'Payment'], ...E.ps.map((p) => [p.date, p.dept, p.age, p.age_unit || 'years', p.sex, p.area, p.diagnosis, p.diagnosis2 || '', p.case, p.outcome, p.payer])]]];
}

/* ---------------- LICENCES & COMPLIANCE ---------------- */
const LIC_COMMON = [
  ['Pharmacy premises licence', 'MCAZ (Medicines Control Authority of Zimbabwe)', 'Pharmacy'],
  ['Registration of health institution', 'HPA (Health Professions Authority)', 'Hospital'],
  ['Operating licence / registration', 'Ministry of Health and Child Care', 'Hospital'],
  ['Medical waste licence', 'EMA (Environmental Management Agency)', 'Hospital'],
  ['Effluent discharge licence', 'EMA (Environmental Management Agency)', 'Hospital'],
  ['Radiation / X-ray licence', 'RPAZ (Radiation Protection Authority of Zimbabwe)', 'X-ray'],
  ['Medical laboratory licence', 'MLCSCZ (Medical Laboratory & Clinical Scientists Council)', 'Laboratory'],
  ['Business / shop licence', 'City / town council', 'Hospital'],
  ['Fire certificate', 'City / town council fire department', 'Hospital'],
  ['Food handling / kitchen health certificate', 'City / town council health department', 'Kitchen'],
  ['Tax clearance (ITF263)', 'ZIMRA', 'Hospital'],
  ['NSSA registration / compliance certificate', 'NSSA', 'Hospital'],
  ['Medical aid service provider number', 'AHFoZ / medical aid societies', 'Hospital'],
  ['Practising certificate', 'Nurses Council of Zimbabwe', 'Staff member'],
  ['Practising certificate', 'Medical & Dental Practitioners Council (MDPCZ)', 'Staff member'],
  ['Practising certificate', 'Pharmacists Council of Zimbabwe', 'Staff member'],
];
function licDays(l) { return l.expiry ? daysBetween(today(), l.expiry) : null; }
function licState(l) {
  if (l.status === 'Not needed any more') return ['Not needed', ''];
  const d = licDays(l); if (d == null) return ['No expiry date', 'warn'];
  if (d < 0) return [`EXPIRED ${-d} day${d === -1 ? '' : 's'} ago`, 'bad'];
  if (l.status === 'Renewal in progress') return [`Renewing · ${d} days left`, 'info'];
  if (d <= 30) return [`Expires in ${d} day${d === 1 ? '' : 's'}`, 'bad'];
  if (d <= num(l.warn_days || 90)) return [`Expires in ${d} days`, 'warn'];
  return ['Valid', 'ok'];
}
const licDue = (l) => l.status !== 'Not needed any more' && (licDays(l) == null || licDays(l) <= num(l.warn_days || 90));
function licIcs(ls) {
  const evs = ls.filter((l) => l.expiry).map((l) => ({ uid: 'lic-' + l.id, start: l.expiry, title: `${l.name} expires (${l.body || ''})`, desc: `${l.name}${l.number ? ' no. ' + l.number : ''}\nIssued by ${l.body || ''}\nResponsible: ${l.responsible || ''}\nStart the renewal now.` }));
  if (!evs.length) return toast('No expiry dates to add.', true);
  const T = (d) => d.replace(/-/g, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CarePoint Admin//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  const ev = (s) => String(s || '').replace(/[\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  evs.forEach((e) => L.push('BEGIN:VEVENT', 'UID:' + e.uid + '@carepoint', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''), 'DTSTART;VALUE=DATE:' + T(e.start), 'DTEND;VALUE=DATE:' + T(addDays(e.start, 1)), 'SUMMARY:' + ev(e.title), 'DESCRIPTION:' + ev(e.desc),
    ...[90, 60, 30, 14, 7].flatMap((n) => ['BEGIN:VALARM', 'TRIGGER:-P' + n + 'D', 'ACTION:DISPLAY', 'DESCRIPTION:' + ev(e.title + ' in ' + n + ' days'), 'END:VALARM']), 'END:VEVENT'));
  L.push('END:VCALENDAR');
  downloadFile((evs.length === 1 ? ls[0].name : 'licence-expiry-dates').replace(/[^\w-]+/g, '-') + '.ics', L.join('\r\n'), 'text/calendar');
  toast('Open the file to add the expiry dates to your phone calendar. It reminds you 90, 60, 30, 14 and 7 days before.');
}
/* files: images are shrunk before upload; PDFs go as they are */
async function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 700000) return file;
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const s = Math.min(1, 2200 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}
async function uploadFile(col, docId, file, onp) {
  if (!navigator.onLine) throw new Error('Attaching files needs network. The licence details are saved; attach the scan when you are online.');
  if (APP.outbox.some((o) => o.col === col && o.id === docId)) { await APP.sync(); if (APP.outbox.some((o) => o.col === col && o.id === docId)) throw new Error('Still saving the record. Try again in a moment.'); }
  file = await shrinkImage(file);
  if (file.size > 15 * 1048576) throw new Error('That file is bigger than 15 MB. Scan it at a lower quality or as a photo.');
  const buf = new Uint8Array(await file.arrayBuffer()), CH = 700000;
  const { id } = await api('files/start', { col, doc_id: docId, name: file.name, mime: file.type || 'application/octet-stream', size: buf.length });
  for (let n = 0, o = 0; o < buf.length; n++, o += CH) {
    let bin = ''; const part = buf.subarray(o, o + CH); for (let i = 0; i < part.length; i += 8192) bin += String.fromCharCode.apply(null, part.subarray(i, i + 8192));
    await api(`files/${id}/chunk`, { n, b64: btoa(bin) }); if (onp) onp(Math.min(100, Math.round(((o + CH) * 100) / buf.length)));
  }
  return (await api(`files/${id}/finish`, {})).file;
}
async function filesBox(box, col, doc, canW) {
  box.innerHTML = '<p class="muted sm">Loading attachments…</p>';
  let files = [];
  try { files = (await api(`files?col=${col}&doc=${encodeURIComponent(doc.id)}`)).files; } catch (e) { box.innerHTML = `<p class="muted sm">${navigator.onLine ? esc(e.message) : 'Attachments show when you are online.'}</p>`; return; }
  box.innerHTML = `<h3>Scanned copies</h3>${files.length ? `<ul class="files">${files.map((f) => `<li><a href="/api/files/${f.id}" target="_blank" rel="noopener">${/^image\//.test(f.mime) ? '🖼' : '📄'} ${esc(f.name)}</a> <span class="muted sm">${fnum(f.size / 1024)} KB · ${fdate(f.at)} · ${esc(f.by_name || '')}</span>${canW && APP.me.role === 'admin' ? ` <button type="button" class="btn sm ghost danger" data-fdel="${f.id}">Remove</button>` : ''}</li>`).join('')}</ul>` : '<p class="muted sm">No copy attached yet.</p>'}
    ${canW ? `<label class="btn sm ghost upl">Attach scan or photo<input type="file" accept="application/pdf,image/*" capture="environment" hidden></label> <span class="muted sm" data-prog></span>` : ''}`;
  const inp = $('input[type=file]', box);
  if (inp) inp.onchange = async () => { const f = inp.files[0]; if (!f) return; const pr = $('[data-prog]', box); try { pr.textContent = 'Uploading…'; await uploadFile(col, doc.id, f, (p) => (pr.textContent = `Uploading ${p}%`)); toast('Copy attached'); APP.save(col, { ...APP.get(col, doc.id), files_n: files.length + 1 }); filesBox(box, col, doc, canW); } catch (e) { pr.textContent = ''; toast(e.message, true); } };
  $$('[data-fdel]', box).forEach((b) => (b.onclick = () => confirmBox('Remove this scanned copy?', 'Remove', async () => { try { await api(`files/${b.dataset.fdel}/delete`, {}); APP.save(col, { ...APP.get(col, doc.id), files_n: Math.max(0, files.length - 1) }); filesBox(box, col, doc, canW); } catch (e) { toast(e.message, true); } })));
}
const LICENCES = {
  key: 'licences', col: 'licences', title: 'Licences & compliance', one: 'licence', ph: 'Search licence, authority, number',
  search: ['name', 'body', 'number', 'covers', 'responsible', (l) => nameOf('employees', l.emp)],
  filters: [{ k: 'due', label: 'All licences', opts: [['due', 'Expiring or expired'], ['expired', 'Expired'], ['ok', 'Valid']], test: (l, v) => (v === 'due' ? licDue(l) : v === 'expired' ? licDays(l) != null && licDays(l) < 0 : !licDue(l)) }, { k: 'covers', label: 'All areas', opts: () => [...new Set(APP.all('licences').map((l) => l.covers).filter(Boolean))] }],
  sort: (a, b) => (a.expiry || '0000').localeCompare(b.expiry || '0000'),
  defaults: () => ({ warn_days: 90, status: 'Valid' }),
  fields: () => [
    { k: 'name', label: 'Licence / certificate', req: true, half: true, type: 'datalist', opts: () => [...new Set(LIC_COMMON.map((x) => x[0]))] },
    { k: 'body', label: 'Issued by (authority)', req: true, half: true, type: 'datalist', opts: () => [...new Set(LIC_COMMON.map((x) => x[1]))] },
    { k: 'covers', label: 'What it covers', type: 'datalist', opts: () => ['Hospital', 'Pharmacy', 'Theatre', 'Laboratory', 'X-ray', 'Kitchen', 'Maternity', 'Vehicles', 'Staff member', ...APP.settings().departments], half: true, req: true },
    { k: 'emp', label: 'Staff member', type: 'select', opts: LOOK.employee, half: true, show: (d) => d.covers === 'Staff member' },
    { k: 'number', label: 'Licence / certificate number', half: true },
    { k: 'issued', label: 'Date issued', type: 'date', half: true },
    { k: 'expiry', label: 'Expiry date', type: 'date', half: true, req: true },
    { k: 'warn_days', label: 'Start warning this many days before', type: 'number', min: 7, half: true, help: 'Renewals can take weeks. 90 days gives time to collect documents and pay.' },
    { k: 'responsible', label: 'Person responsible for renewal', half: true, type: 'datalist', opts: () => LOOK.employee().map((e) => e[1].split(' · ')[0]) },
    { k: 'status', label: 'Status', type: 'select', opts: ['Valid', 'Renewal in progress', 'Not needed any more'], half: true },
    { k: 'renewal_started', label: 'Renewal applied for on', type: 'date', half: true, show: (d) => d.status === 'Renewal in progress' },
    { k: 'cost', label: 'Renewal fee', type: 'money', half: true, hide: !APP.moneyOK },
    { k: 'requirements', label: 'What is needed to renew (documents, inspections)', type: 'textarea', rows: 3 },
    { k: 'notes', label: 'Notes', type: 'textarea', rows: 2 },
  ],
  prep: (d) => {
    const old = d.id && APP.get('licences', d.id);
    if (old && old.expiry && d.expiry && d.expiry !== old.expiry) { d.history = [...(old.history || []), { expiry: old.expiry, number: old.number || '', replaced: today(), by: APP.me.name }]; if (d.status === 'Renewal in progress' && d.expiry > today()) d.status = 'Valid'; }
    return d;
  },
  cols: () => [
    { h: 'Licence', f: (l) => `<b>${esc(l.name)}</b>${l.covers === 'Staff member' && l.emp ? ' · ' + esc(nameOf('employees', l.emp)) : ''}<br><span class="muted sm">${esc(l.body || '')}${l.number ? ' · no. ' + esc(l.number) : ''}</span>`, x: (l) => l.name },
    { h: 'Authority', k: 'body', cls: 'hide-m' }, { h: 'Covers', f: (l) => esc(l.covers === 'Staff member' ? nameOf('employees', l.emp) || 'Staff member' : l.covers || ''), x: (l) => l.covers },
    { h: 'Expiry', f: (l) => (l.expiry ? fdate(l.expiry) : '<span class="muted">not set</span>'), x: (l) => l.expiry },
    { h: 'Status', sort: (l) => licDays(l) ?? -9999, f: (l) => pill(...licState(l)), x: (l) => licState(l)[0] },
    { h: 'Responsible', k: 'responsible' }, { h: 'Copy', f: (l) => (num(l.files_n) ? '📄 ' + l.files_n : '<span class="muted sm">none</span>'), x: (l) => num(l.files_n) },
  ],
  rowCls: (l) => (licDays(l) != null && licDays(l) < 0 && l.status !== 'Not needed any more' ? 'hl-bad' : ''),
  top: (rows) => {
    const all = APP.all('licences').filter((l) => l.status !== 'Not needed any more'), exp = all.filter((l) => licDays(l) != null && licDays(l) < 0), soon = all.filter((l) => licDue(l) && !(licDays(l) < 0));
    return `${stats([[all.length, 'licences tracked'], [exp.length, 'expired', exp.length ? 'alert' : ''], [soon.length, 'expiring soon', soon.length ? 'warn' : ''], [all.filter((l) => !num(l.files_n)).length, 'with no scanned copy']])}
      ${exp.length ? `<div class="note bad"><b>Expired:</b> ${exp.map((l) => `${esc(l.name)} (${esc(l.body || '')}) expired ${fdate(l.expiry)}`).join('; ')}. Operating without these can mean penalties or closure. Renew now.</div>` : ''}
      ${!APP.all('licences').length ? `<div class="card hi"><h3>Start your licence list</h3><p>Add each licence or certificate the hospital must keep, with its expiry date and a scanned copy. You get warnings on the dashboard before anything expires, and can add the dates to your phone calendar.</p>${APP.can('licences', true) ? '<button class="btn" id="licCommon">Add from the common list</button>' : ''}</div>` : ''}`;
  },
  buttons: [{ t: 'Add expiry dates to my calendar', ghost: true, do: (rows) => licIcs(rows.filter((l) => l.status !== 'Not needed any more')) }],
  addText: '+ Licence', wide: true, titleOf: (l) => l.name,
  extra: (l) => `<div class="card mt" data-files></div>${(l.history || []).length ? `<h3 class="mt">Renewal history</h3>${table([{ h: 'Old expiry', f: (h) => fdate(h.expiry) }, { h: 'Number', k: 'number' }, { h: 'Renewed on', f: (h) => fdate(h.replaced) }, { h: 'By', k: 'by' }], l.history.slice().reverse())}` : ''}<p class="mt"><button type="button" class="btn sm ghost" data-lics>Add this expiry to my calendar</button></p>`,
  after: (el) => { const b = $('#licCommon', el); if (b) b.onclick = licCommonForm; },
  open: (l) => { editDoc(LICENCES, l); setTimeout(() => { const s = $('#sheet'); const fb = $('[data-files]', s); if (fb) filesBox(fb, 'licences', l, APP.can('licences', true)); const c = $('[data-lics]', s); if (c) c.onclick = () => licIcs([l]); }, 40); },
};
function licCommonForm() {
  const s = sheet('Common licences', `<p class="muted">Tick the ones your hospital holds, then fill in the expiry dates. This list is a starting point; check which apply to you, and add any others with “+ Licence”.</p>
    <form class="form">${LIC_COMMON.map(([n, b, c], i) => `<label class="check"><input type="checkbox" name="c${i}" ${c !== 'Staff member' ? 'checked' : ''}> <span><b>${esc(n)}</b> · ${esc(b)}${c === 'Staff member' ? ' (one per staff member)' : ''}</span></label>`).join('')}
    <div class="actions"><span class="sp"></span><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">Add ticked licences</button></div></form>`);
  $('form', s).onsubmit = (e) => { e.preventDefault(); let n = 0; APP.bulk(() => LIC_COMMON.forEach(([name, body, covers], i) => { if (e.target.elements['c' + i].checked) { APP.save('licences', { name, body, covers, warn_days: 90, status: 'Valid' }); n++; } })); closeSheet(); toast(n + ' licences added. Open each one to enter the expiry date and attach a scan.'); };
}
