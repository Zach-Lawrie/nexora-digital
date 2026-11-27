/* Stock: items, ledger (moves), counts, requests, department use, procurement, kiosk, misuse checks. */
'use strict';
const CATS = { drug: 'Drugs', sundry: 'Surgical sundries', stationery: 'Stationery', register: 'Books, cards & registers', grocery_staff: 'Groceries for staff', grocery_patient: 'Groceries for patients', kiosk: 'Kiosk refreshments' };
const STOCK_GROUPS = {
  medical: { title: 'Drugs & sundries', cats: ['drug', 'sundry'] },
  stationery: { title: 'Stationery', cats: ['stationery'] },
  registers: { title: 'Books, cards & registers', cats: ['register'] },
  groceries: { title: 'Groceries', cats: ['grocery_staff', 'grocery_patient'] },
};
let CACHE = {};
APP.listeners.push(() => (CACHE = {}));
const SIGN = { in: 1, out: -1, loss: -1, adjust: 1 };
function moves() { return CACHE.moves || (CACHE.moves = APP.all('moves').filter((m) => m.item).sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.at || '').localeCompare(b.at || ''))); }
function movesOf(item) { const g = CACHE.byItem || (CACHE.byItem = groupBy(moves(), 'item')); return g[item] || []; }
function bal(item, upto) { return sum(movesOf(item).filter((m) => !upto || m.date <= upto), (m) => (SIGN[m.type] || 0) * num(m.qty)); }
function balances() { if (CACHE.bals) return CACHE.bals; const b = {}; APP.all('items').forEach((i) => (b[i.id] = bal(i.id))); return (CACHE.bals = b); }
function itemName(id) { const i = APP.get('items', id); return i ? i.name : '(deleted item)'; }
function itemUnit(id) { const i = APP.get('items', id); return i && i.unit ? i.unit : ''; }
function stockState(i) { const b = balances()[i.id] || 0; if (b <= 0) return ['Out of stock', 'bad']; if (num(i.min) && b <= num(i.min)) return ['Low', 'warn']; if (num(i.max) && b > num(i.max)) return ['Over max', 'info']; return ['OK', 'ok']; }
function lowItems(cats) { return APP.all('items').filter((i) => i.active !== false && (!cats || cats.includes(i.cat)) && num(i.min) > 0 && (balances()[i.id] || 0) <= num(i.min)); }
function lastCost(item) { const ins = movesOf(item).filter((m) => m.type === 'in' && num(m.unit_price)); return ins.length ? num(ins[ins.length - 1].unit_price) : num((APP.get('items', item) || {}).cost); }
function expiring(days) {
  const lim = addDays(today(), days == null ? APP.settings().expiry_warn_days : days);
  const out = [];
  APP.all('items').forEach((i) => {
    if (!(balances()[i.id] > 0)) return;
    movesOf(i.id).filter((m) => m.type === 'in' && m.expiry && m.expiry <= lim).forEach((m) => out.push({ item: i, m, expired: m.expiry < today() }));
  });
  // keep only batches that could still be on the shelf (received qty not yet used up by later issues, FEFO estimate)
  return out.sort((a, b) => a.m.expiry.localeCompare(b.m.expiry));
}

/* ---------- forms ---------- */
const itemFields = (cats) => [
  { k: 'name', label: 'Item name', req: true },
  { k: 'cat', label: 'Category', type: 'select', opts: (cats || Object.keys(CATS)).map((c) => [c, CATS[c]]), req: true, def: (cats || [])[0], half: true },
  { k: 'unit', label: 'Unit', type: 'datalist', opts: ['each', 'box', 'pack', 'vial', 'ampoule', 'bottle', 'tablet', 'roll', 'pair', 'ream', 'book', 'card', 'kg', 'litre', 'crate', 'can'], half: true, ph: 'e.g. box, vial, pair' },
  { k: 'min', label: 'Minimum level (alert at)', type: 'number', min: 0, half: true },
  { k: 'max', label: 'Maximum level', type: 'number', min: 0, half: true },
  { k: 'price', label: 'Selling price', type: 'money', half: true, show: (d) => d.cat === 'kiosk', hide: !APP.costOK },
  { k: 'cost', label: 'Usual cost price', type: 'money', half: true, hide: !APP.costOK },
  { k: 'code', label: 'Code (optional)', half: true },
  { k: 'location', label: 'Shelf / location', half: true },
  { k: 'track', label: 'Track each use on a patient (misuse check)', type: 'check', show: (d) => ['drug', 'sundry'].includes(d.cat), help: 'Tick for items like gloves, cord clamps, Cosmopore. Departments must then record each patient they use it on.' },
  { k: 'active', label: 'In use (untick to hide)', type: 'check', def: true },
];
function editItem(item, cats) {
  const isNew = !item;
  formSheet(isNew ? 'Add item' : 'Edit ' + item.name, itemFields(cats), item || { active: true, cat: (cats || [])[0], track: (cats || [])[0] === 'sundry' }, (d) => {
    if (APP.all('items').some((x) => x.id !== d.id && x.name.toLowerCase() === d.name.toLowerCase() && x.cat === d.cat)) throw new Error('An item with that name is already in this category.');
    APP.save('items', d); toast(isNew ? 'Item added' : 'Item saved');
  }, { del: !isNew && APP.me.role === 'admin' && !movesOf(item.id).length ? () => { APP.del('items', item.id); toast('Item deleted'); } : null });
}
function stockIn(opts) {
  opts = opts || {}; const cats = opts.cats;
  const fields = [
    { k: 'date', label: 'Date received', type: 'date', req: true, def: today(), half: true },
    { k: 'item', label: 'Item', type: 'item', cats, req: true, half: true },
    { k: 'supplier', label: 'Supplier', type: 'select', opts: LOOK.supplier, half: true, placeholder: 'Choose or add in Suppliers' },
    { k: 'invoice', label: 'Invoice / delivery note no.', half: true },
    { k: 'qty', label: 'Quantity received', type: 'number', min: 0, req: true, third: true },
    { k: 'unit_price', label: 'Unit price', type: 'money', third: true, hide: !APP.costOK },
    { k: 'total', label: 'Total cost', type: 'money', third: true, hide: !APP.costOK, help: 'Fills itself' },
    { k: 'batch', label: 'Batch number', half: true, show: () => !cats || cats.some((c) => ['drug', 'sundry'].includes(c)) },
    { k: 'expiry', label: 'Expiry date', type: 'date', half: true, show: () => !cats || cats.some((c) => ['drug', 'sundry', 'grocery_staff', 'grocery_patient', 'kiosk'].includes(c)) },
    { k: 'received_by', label: 'Received by', def: APP.me.name, half: true },
    { k: 'note', label: 'Note', half: true },
  ];
  formSheet('Stock in (received)', fields, { ...(opts.doc || {}) }, (d) => {
    if (!(num(d.qty) > 0)) throw new Error('Quantity must be more than 0.');
    const it = APP.get('items', d.item);
    APP.save('moves', { ...d, type: 'in', cat: it.cat, item_name: it.name, total: d.total || (d.unit_price ? +(num(d.unit_price) * num(d.qty)).toFixed(2) : '') }, it.name);
    toast(`${fnum(d.qty)} ${it.unit || ''} ${it.name} added. Balance ${fnum(bal(it.id))}`);
  }, { live: (d, f) => { if (f.elements.total && d.unit_price && d.qty && !f.elements.total.dataset.touched) f.elements.total.value = (num(d.unit_price) * num(d.qty)).toFixed(2); if (f.elements.total) f.elements.total.oninput = () => (f.elements.total.dataset.touched = 1); } });
}
function stockOut(opts) {
  opts = opts || {}; const cats = opts.cats, grocery = cats && cats.every((c) => c.startsWith('grocery'));
  const fields = [
    { k: 'date', label: 'Date issued', type: 'date', req: true, def: today(), half: true },
    { k: 'item', label: 'Item', type: 'item', cats, req: true, half: true },
    { k: 'qty', label: 'Quantity', type: 'number', min: 0, req: true, half: true },
    { k: 'dept', label: grocery ? 'For' : 'Department', type: grocery ? 'select' : 'select', opts: grocery ? ['Staff', 'Patients', 'Kitchen'] : LOOK.dept, req: !grocery, half: true },
    { k: 'taken_by', label: 'Who took it', req: true, half: true, type: 'datalist', opts: () => LOOK.employee().map((e) => e[1].split(' · ')[0]) },
    { k: 'patient', label: 'Patient name / file no. (if for a patient)', half: true, show: () => !grocery },
    { k: 'purpose', label: 'Purpose', half: true, type: 'datalist', opts: ['Ward stock', 'Patient use', 'Procedure', 'Theatre case', 'Delivery', 'Cleaning', 'Meals', 'Tea break', 'Other'] },
    { k: 'note', label: 'Note', half: true },
  ];
  formSheet('Stock out (issued)', fields, { ...(opts.doc || {}) }, (d) => {
    const it = APP.get('items', d.item), b = bal(d.item);
    if (!(num(d.qty) > 0)) throw new Error('Quantity must be more than 0.');
    if (num(d.qty) > b) throw new Error(`Only ${fnum(b)} ${it.unit || ''} in stock. Check the count or record the stock received first.`);
    APP.save('moves', { ...d, type: 'out', cat: it.cat, item_name: it.name }, it.name);
    const nb = b - num(d.qty);
    toast(`Issued. ${it.name} balance ${fnum(nb)}${num(it.min) && nb <= num(it.min) ? ' · LOW, reorder' : ''}`, num(it.min) && nb <= num(it.min));
  });
}
function lossForm(opts) {
  formSheet('Expired or damaged stock', [
    { k: 'date', label: 'Date', type: 'date', req: true, def: today(), half: true },
    { k: 'item', label: 'Item', type: 'item', cats: opts && opts.cats, req: true, half: true },
    { k: 'qty', label: 'Quantity', type: 'number', min: 0, req: true, half: true },
    { k: 'reason', label: 'Reason', type: 'select', opts: ['Expired', 'Damaged', 'Broken', 'Spoiled', 'Recalled'], req: true, half: true },
    { k: 'batch', label: 'Batch (if known)', half: true },
    { k: 'note', label: 'Note', half: true },
  ], {}, (d) => {
    const it = APP.get('items', d.item); if (num(d.qty) > bal(d.item)) throw new Error('That is more than the balance.');
    APP.save('moves', { ...d, type: 'loss', cat: it.cat, item_name: it.name }, it.name); toast('Recorded as ' + d.reason.toLowerCase());
  });
}
// physical count -> stores count + difference; optional adjustment of system balance
function countForm(opts) {
  opts = opts || {}; const cats = opts.cats;
  const items = APP.all('items').filter((i) => i.active !== false && (!cats || cats.includes(i.cat))).sort((a, b) => a.name.localeCompare(b.name));
  const s = sheet('Physical count', `<form class="form"><div class="fld half"><label>Count date</label><input type="date" name="date" value="${today()}" required></div>
    <div class="fld half"><label>Counted by</label><input name="by" value="${esc(APP.me.name)}"></div>
    <p class="muted full">Enter what is physically on the shelf. Leave blank for items you did not count. The difference is saved for the misuse report.</p>
    <div class="full">${table([{ h: 'Item', f: (i) => `<b>${esc(i.name)}</b> <span class="muted">${esc(i.unit || '')}</span>` }, { h: 'System', num: true, f: (i) => fnum(balances()[i.id]) }, { h: 'Counted', f: (i) => `<input type="number" min="0" step="any" name="c_${i.id}" class="cnt" inputmode="decimal">` }, { h: 'Difference', num: true, f: (i) => `<span id="d_${i.id}"></span>` }], items, { limit: 2000 })}</div>
    <label class="check full"><input type="checkbox" name="adjust" checked> Correct the system balance to the counted figure</label>
    <p class="err" id="ferr"></p><div class="actions"><span class="sp"></span><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">Save count</button></div></form>`, { wide: true });
  const f = $('form', s);
  f.oninput = () => items.forEach((i) => { const v = f.elements['c_' + i.id].value; const d = v === '' ? '' : num(v) - (balances()[i.id] || 0); $('#d_' + i.id, s).innerHTML = v === '' ? '' : d === 0 ? pill('Matches', 'ok') : pill((d > 0 ? '+' : '') + fnum(d), d < 0 ? 'bad' : 'info'); });
  f.onsubmit = (e) => {
    e.preventDefault(); const date = f.elements.date.value, adj = f.elements.adjust.checked; let n = 0, short = 0;
    items.forEach((i) => {
      const v = f.elements['c_' + i.id].value; if (v === '') return;
      const sys = bal(i.id, date), diff = num(v) - sys; n++;
      if (diff < 0) short++;
      APP.save('counts', { date, month: monthOf(date), item: i.id, item_name: i.name, cat: i.cat, system: sys, physical: num(v), diff, counted_by: f.elements.by.value, dept: '' });
      if (adj && diff !== 0) APP.save('moves', { date, item: i.id, item_name: i.name, cat: i.cat, type: 'adjust', qty: diff, note: 'Count correction (' + (diff < 0 ? 'missing' : 'extra') + ')', taken_by: f.elements.by.value });
    });
    closeSheet(); toast(`${n} items counted${short ? `, ${short} short. See Misuse check.` : ', all matched.'}`, short > 0);
  };
}
function itemDetail(i) {
  const ms = movesOf(i.id).slice().reverse(); let run = bal(i.id);
  const rows = ms.map((m) => { const r = { ...m, run }; run -= (SIGN[m.type] || 0) * num(m.qty); return r; });
  const s = sheet(i.name, `${stats([[fnum(balances()[i.id]), 'balance ' + (i.unit || '')], [fnum(i.min || 0), 'minimum'], [fnum(i.max || 0), 'maximum'], APP.costOK ? [money(lastCost(i.id) * (balances()[i.id] || 0)), 'stock value'] : null])}
    <div class="row gap">${APP.can('moves', true) ? `<button class="btn sm" id="iIn">Stock in</button><button class="btn sm ghost" id="iOut">Stock out</button>` : ''}${APP.can('items', true) ? '<button class="btn sm ghost" id="iEd">Edit item</button>' : ''}<button class="btn sm ghost" id="iX">Excel</button></div>
    ${table([{ h: 'Date', f: (m) => fdate(m.date) }, { h: 'Type', f: (m) => pill(m.type === 'in' ? 'In' : m.type === 'out' ? (m.reason || 'Out') : m.type === 'loss' ? m.reason || 'Loss' : 'Count fix', m.type === 'in' ? 'ok' : m.type === 'adjust' ? 'info' : m.type === 'loss' ? 'bad' : '') },
      { h: 'Qty', num: true, f: (m) => ((SIGN[m.type] || 0) * num(m.qty) > 0 ? '+' : '') + fnum((SIGN[m.type] || 0) * num(m.qty)) }, { h: 'Balance', num: true, f: (m) => fnum(m.run) },
      { h: 'Details', f: (m) => esc([m.type === 'in' ? nameOf('suppliers', m.supplier) : m.dept, m.taken_by || m.received_by, m.patient, m.purpose, m.invoice && 'Inv ' + m.invoice, m.batch && 'Batch ' + m.batch, m.expiry && 'Exp ' + fdate(m.expiry), m.note].filter(Boolean).join(' · ')) }, { h: 'Entered by', f: (m) => esc(m.by_name || '') }], rows, { empty: 'No movements yet.' })}`, { wide: true });
  const c = { cats: [i.cat] };
  if ($('#iIn', s)) { $('#iIn', s).onclick = () => stockIn({ ...c, doc: { item: i.id } }); $('#iOut', s).onclick = () => stockOut({ ...c, doc: { item: i.id } }); }
  if ($('#iEd', s)) $('#iEd', s).onclick = () => editItem(i);
  $('#iX', s).onclick = () => downloadXlsx(i.name + ' ledger', [[i.name, [['Date', 'Type', 'Qty', 'Balance', 'Supplier/Dept', 'Who', 'Patient', 'Purpose', 'Invoice', 'Batch', 'Expiry', 'Unit price', 'Entered by'], ...rows.map((m) => [m.date, m.type, (SIGN[m.type] || 0) * num(m.qty), m.run, m.type === 'in' ? nameOf('suppliers', m.supplier) : m.dept, m.taken_by || m.received_by, m.patient, m.purpose, m.invoice, m.batch, m.expiry, m.unit_price, m.by_name])]]]);
}

/* ---------- stock pages ---------- */
function stockPage(el, key) {
  const g = STOCK_GROUPS[key], st = PS(key, { q: '', cat: '', show: 'all' });
  let items = APP.all('items').filter((i) => g.cats.includes(i.cat) && (st.cat ? i.cat === st.cat : true) && (i.active !== false || st.show === 'hidden'));
  if (st.q) items = items.filter((i) => (i.name + ' ' + (i.code || '')).toLowerCase().includes(st.q.toLowerCase()));
  if (st.show === 'low') items = items.filter((i) => stockState(i)[1] !== 'ok' && stockState(i)[1] !== 'info');
  items.sort((a, b) => a.name.localeCompare(b.name));
  const all = APP.all('items').filter((i) => g.cats.includes(i.cat) && i.active !== false), low = lowItems(g.cats);
  const mOut = moves().filter((m) => g.cats.includes(m.cat) && m.type === 'out' && monthOf(m.date) === thisMonth());
  const exp = key === 'medical' ? expiring().filter((x) => g.cats.includes(x.item.cat)) : [];
  el.innerHTML = `${stats([[all.length, 'items'], [low.length, 'at or below minimum', low.length ? 'alert' : ''], [fnum(sum(mOut, 'qty')), 'units issued this month'], key === 'medical' ? [exp.length, 'batches expiring soon', exp.length ? 'warn' : ''] : null, APP.costOK ? [money(sum(all, (i) => lastCost(i.id) * Math.max(0, balances()[i.id] || 0))), 'stock value'] : null])}
    <div class="bar">
      <input type="search" placeholder="Search items" value="${esc(st.q)}" id="sq">
      ${g.cats.length > 1 ? `<select id="scat"><option value="">All</option>${g.cats.map((c) => `<option value="${c}" ${st.cat === c ? 'selected' : ''}>${CATS[c]}</option>`).join('')}</select>` : ''}
      <select id="sshow"><option value="all">All items</option><option value="low" ${st.show === 'low' ? 'selected' : ''}>Low or out only</option><option value="hidden" ${st.show === 'hidden' ? 'selected' : ''}>Include hidden</option></select>
      <span class="sp"></span>
      ${APP.can('moves', true) ? `<button class="btn" id="bIn">Stock in</button><button class="btn" id="bOut">Stock out</button><button class="btn ghost" id="bCount">Count</button><button class="btn ghost" id="bLoss">Expired / damaged</button>` : ''}
      ${APP.can('items', true) ? '<button class="btn ghost" id="bAdd">+ Item</button>' : ''}
      ${low.length && APP.can('orders', true) ? '<button class="btn ghost" id="bOrd">Order low items</button>' : ''}
      <button class="btn ghost" id="bX">Excel</button>
    </div>
    ${table([{ h: 'Item', f: (i) => `<b>${esc(i.name)}</b>${i.code ? ` <span class="muted">${esc(i.code)}</span>` : ''}${g.cats.length > 1 ? `<br><span class="muted sm">${CATS[i.cat]}</span>` : ''}` },
      { h: 'Balance', num: true, sort: (i) => balances()[i.id] || 0, f: (i) => `<b>${fnum(balances()[i.id])}</b> <span class="muted sm">${esc(i.unit || '')}</span>` },
      { h: 'Min', num: true, k: 'min' }, { h: 'Max', num: true, k: 'max' },
      { h: 'Status', sort: (i) => stockState(i)[0], f: (i) => pill(...stockState(i)) },
      { h: 'Used this month', num: true, sort: (i) => sum(mOut.filter((m) => m.item === i.id), 'qty'), f: (i) => fnum(sum(mOut.filter((m) => m.item === i.id), 'qty')) },
      { h: 'Last received', f: (i) => { const l = movesOf(i.id).filter((m) => m.type === 'in').pop(); return l ? fdate(l.date) : '<span class="muted">—</span>'; } }],
      items, { click: (i) => itemDetail(i), empty: 'No items yet. Add your first item with “+ Item”.', limit: 1000 })}
    ${exp.length ? `<h3 class="mt">Expiring or expired batches</h3>${table([{ h: 'Item', f: (x) => esc(x.item.name) }, { h: 'Batch', f: (x) => esc(x.m.batch || '') }, { h: 'Received', f: (x) => fdate(x.m.date) }, { h: 'Qty received', num: true, f: (x) => fnum(x.m.qty) }, { h: 'Expiry', f: (x) => fdate(x.m.expiry) + ' ' + (x.expired ? pill('Expired', 'bad') : pill(daysBetween(today(), x.m.expiry) + ' days', 'warn')) }], exp)}<p class="muted sm">Use these first. When stock expires, record it with “Expired / damaged” so the balance stays correct.</p>` : ''}`;
  $('#sq').oninput = (e) => { st.q = e.target.value; rerender(); };
  if ($('#scat')) $('#scat').onchange = (e) => { st.cat = e.target.value; rerender(); };
  $('#sshow').onchange = (e) => { st.show = e.target.value; rerender(); };
  const c = { cats: st.cat ? [st.cat] : g.cats };
  if ($('#bIn')) { $('#bIn').onclick = () => stockIn(c); $('#bOut').onclick = () => stockOut(c); $('#bCount').onclick = () => countForm(c); $('#bLoss').onclick = () => lossForm(c); }
  if ($('#bAdd')) $('#bAdd').onclick = () => editItem(null, c.cats);
  if ($('#bOrd')) $('#bOrd').onclick = () => newOrderFromLow(g.cats);
  $('#bX').onclick = () => downloadXlsx(g.title + ' ' + today(), [[g.title, rowsFor([{ h: 'Item', k: 'name' }, { h: 'Category', x: (i) => CATS[i.cat] }, { h: 'Unit', k: 'unit' }, { h: 'Balance', x: (i) => balances()[i.id] || 0 }, { h: 'Min', k: 'min' }, { h: 'Max', k: 'max' }, { h: 'Status', x: (i) => stockState(i)[0] }, ...(APP.costOK ? [{ h: 'Unit cost', x: (i) => lastCost(i.id) }] : [])], items)]]);
}

/* ---------- monthly closing balance ---------- */
function closingRows(month, cats) {
  const start = month + '-01', end = addDays(ymd(new Date(new Date(start + 'T12:00:00').getFullYear(), new Date(start + 'T12:00:00').getMonth() + 1, 1)), -1);
  const counts = APP.all('counts').filter((c) => c.month === month && !c.dept);
  return APP.all('items').filter((i) => (!cats || cats.includes(i.cat)) && (i.active !== false || movesOf(i.id).some((m) => monthOf(m.date) === month))).sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name)).map((i) => {
    const ms = movesOf(i.id).filter((m) => m.date >= start && m.date <= end);
    const open = bal(i.id, addDays(start, -1));
    const rec = sum(ms.filter((m) => m.type === 'in'), 'qty'), iss = sum(ms.filter((m) => m.type === 'out'), 'qty'), loss = sum(ms.filter((m) => m.type === 'loss'), 'qty'), adj = sum(ms.filter((m) => m.type === 'adjust'), 'qty');
    const close = open + rec - iss - loss; // before count corrections
    const cnt = counts.filter((c) => c.item === i.id).sort((a, b) => (a.date || '').localeCompare(b.date || '')).pop();
    return { i, open, rec, iss, loss, close, physical: cnt ? cnt.physical : null, diff: cnt ? cnt.physical - (open + sum(ms.filter((m) => m.date <= cnt.date && m.type !== 'adjust'), (m) => (SIGN[m.type] || 0) * num(m.qty))) : null, adj, value: lastCost(i.id) * (cnt ? cnt.physical : close) };
  });
}
function closingPage(el) {
  const st = PS('closing', { month: thisMonth(), cats: '' }), cats = st.cats ? [st.cats] : null;
  const rows = closingRows(st.month, cats);
  const cols = [{ h: 'Item', f: (r) => `<b>${esc(r.i.name)}</b><br><span class="muted sm">${CATS[r.i.cat]}</span>`, x: (r) => r.i.name }, { h: 'Opening', num: true, k: 'open', f: (r) => fnum(r.open), x: (r) => r.open }, { h: 'Received', num: true, f: (r) => fnum(r.rec), x: (r) => r.rec }, { h: 'Issued', num: true, f: (r) => fnum(r.iss), x: (r) => r.iss }, { h: 'Expired / damaged', num: true, f: (r) => fnum(r.loss), x: (r) => r.loss }, { h: 'Closing (system)', num: true, f: (r) => `<b>${fnum(r.close)}</b>`, x: (r) => r.close }, { h: 'Physical count', num: true, f: (r) => (r.physical == null ? '<span class="muted">not counted</span>' : fnum(r.physical)), x: (r) => r.physical ?? '' }, { h: 'Difference', num: true, f: (r) => (r.diff == null ? '' : r.diff === 0 ? pill('0', 'ok') : pill((r.diff > 0 ? '+' : '') + fnum(r.diff), r.diff < 0 ? 'bad' : 'info')), x: (r) => r.diff ?? '' }, ...(APP.costOK ? [{ h: 'Value', num: true, f: (r) => money(r.value), x: (r) => +r.value.toFixed(2) }] : [])];
  const short = rows.filter((r) => r.diff < 0);
  el.innerHTML = `${stats([[rows.length, 'items'], [rows.filter((r) => r.physical != null).length, 'counted this month'], [short.length, 'items short on count', short.length ? 'alert' : ''], APP.costOK ? [money(sum(short, (r) => -r.diff * lastCost(r.i.id))), 'value of shortages', short.length ? 'alert' : ''] : null])}
    <div class="bar"><input type="month" id="cm" value="${st.month}"><select id="cc"><option value="">All stock</option>${Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${st.cats === k ? 'selected' : ''}>${v}</option>`).join('')}</select><span class="sp"></span>${APP.can('counts', true) ? '<button class="btn" id="cCount">Enter physical count</button>' : ''}<button class="btn ghost" id="cP">Print</button><button class="btn ghost" id="cX">Excel</button></div>
    ${table(cols, rows, { rowCls: (r) => (r.diff < 0 ? 'hl-bad' : ''), limit: 2000, foot: APP.costOK ? ['Total', '', '', '', '', '', '', '', money(sum(rows, 'value'))] : null })}
    <p class="muted sm">Closing = opening + received − issued − expired/damaged. Enter a physical count and the difference shows here. Shortages mean stock left without being recorded.</p>`;
  $('#cm').onchange = (e) => { st.month = e.target.value; rerender(); };
  $('#cc').onchange = (e) => { st.cats = e.target.value; rerender(); };
  if ($('#cCount')) $('#cCount').onclick = () => countForm({ cats });
  $('#cP').onclick = () => printArea('Closing balance ' + monthName(st.month), table(cols, rows, { limit: 5000 }));
  $('#cX').onclick = () => downloadXlsx('Closing balance ' + st.month, [['Closing ' + st.month, rowsFor(cols, rows)]]);
}

/* ---------- requests from departments ---------- */
function requestForm(doc) {
  const isDept = APP.me.role === 'dept';
  formSheet(doc ? 'Request' : 'New stock request', [
    { k: 'dept', label: 'Department', type: 'select', opts: LOOK.dept, req: true, def: APP.me.dept || '', half: true },
    { k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true },
    { k: 'lines', label: 'Items needed', type: 'lines', one: 'item', req: true, sub: [{ k: 'item', label: 'Item', type: 'item', cats: ['drug', 'sundry', 'stationery', 'register'] }, { k: 'qty', label: 'Qty', type: 'number', min: 0 }] },
    { k: 'purpose', label: 'Reason / purpose', type: 'textarea', rows: 2 },
  ], doc || { dept: APP.me.dept }, (d) => {
    if (isDept && d.dept !== APP.me.dept) throw new Error('You can only request for ' + APP.me.dept + '.');
    if (!d.lines.every((l) => l.item && num(l.qty) > 0)) throw new Error('Each line needs an item and a quantity.');
    APP.save('requests', { ...d, status: d.status || 'pending', requested_by: d.requested_by || APP.me.name }, d.dept + ' request');
    toast('Request sent for approval');
  });
}
function approveRequest(r) {
  const can = ['admin', 'nic', 'store'].includes(APP.me.role), issue = ['admin', 'store'].includes(APP.me.role);
  const s = sheet(`${r.dept} request · ${fdate(r.date)}`, `<p>Requested by <b>${esc(r.requested_by || r.by_name)}</b>${r.purpose ? ' · ' + esc(r.purpose) : ''} ${pill(label(r.status), { pending: 'warn', approved: 'info', issued: 'ok', rejected: 'bad' }[r.status])}</p>
    <form class="form">${table([{ h: 'Item', f: (l) => esc(itemName(l.item)) }, { h: 'Asked', num: true, f: (l) => fnum(l.qty) }, { h: 'In store', num: true, f: (l) => fnum(balances()[l.item]) }, { h: 'Approve qty', f: (l, i) => (can && ['pending', 'approved'].includes(r.status) ? `<input type="number" min="0" step="any" name="q_${l.item}" value="${l.approved ?? Math.min(num(l.qty), Math.max(0, balances()[l.item] || 0))}">` : fnum(l.approved ?? '')) }], r.lines, { limit: 500 })}
    ${can && ['pending', 'approved'].includes(r.status) ? `<div class="fld full"><label>Note to department</label><input name="note" value="${esc(r.note || '')}"></div><div class="fld half"><label>Collected by</label><input name="taken_by" value="${esc(r.taken_by || '')}" placeholder="Name of person collecting"></div>
    <p class="err" id="ferr"></p><div class="actions"><button type="button" class="btn danger ghost" id="rRej">Reject</button><span class="sp"></span>${r.status === 'pending' ? '<button type="button" class="btn ghost" id="rApp">Approve only</button>' : ''}${issue ? '<button class="btn" id="rIss">Approve & issue now</button>' : ''}</div>` : ''}</form>`, { wide: true });
  const f = $('form', s); if (!f || !can) return;
  const qtys = () => r.lines.map((l) => ({ ...l, approved: f.elements['q_' + l.item] ? num(f.elements['q_' + l.item].value) : num(l.qty) }));
  if ($('#rApp', s)) $('#rApp', s).onclick = () => { APP.save('requests', { ...r, lines: qtys(), status: 'approved', approved_by: APP.me.name, approved_at: new Date().toISOString(), note: f.elements.note.value }); closeSheet(); toast('Approved. The storekeeper can now issue it.'); };
  $('#rRej', s).onclick = () => { APP.save('requests', { ...r, status: 'rejected', approved_by: APP.me.name, note: f.elements.note.value }); closeSheet(); toast('Request rejected'); };
  if ($('#rIss', s)) f.onsubmit = (e) => {
    e.preventDefault(); const lines = qtys();
    const bad = lines.find((l) => l.approved > (balances()[l.item] || 0)); if (bad) { $('#ferr', s).textContent = `Not enough ${itemName(bad.item)} in store.`; return; }
    if (!f.elements.taken_by.value.trim()) { $('#ferr', s).textContent = 'Enter who collected the stock.'; return; }
    lines.filter((l) => l.approved > 0).forEach((l) => { const it = APP.get('items', l.item); APP.save('moves', { date: today(), item: l.item, item_name: it.name, cat: it.cat, type: 'out', qty: l.approved, dept: r.dept, taken_by: f.elements.taken_by.value.trim(), purpose: 'Department request', request: r.id }); });
    APP.save('requests', { ...r, lines, status: 'issued', approved_by: r.approved_by || APP.me.name, issued_by: APP.me.name, issued_at: new Date().toISOString(), taken_by: f.elements.taken_by.value.trim(), note: f.elements.note.value });
    closeSheet(); toast('Issued to ' + r.dept);
  };
}
function requestsPage(el) {
  const st = PS('requests', { status: 'open' });
  let rs = APP.all('requests').sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.at || '').localeCompare(a.at || ''));
  const open = rs.filter((r) => ['pending', 'approved'].includes(r.status));
  if (st.status === 'open') rs = open; else if (st.status) rs = rs.filter((r) => r.status === st.status);
  el.innerHTML = `${stats([[open.filter((r) => r.status === 'pending').length, 'waiting for approval', open.length ? 'alert' : ''], [open.filter((r) => r.status === 'approved').length, 'approved, not issued yet'], [APP.all('requests').filter((r) => r.status === 'issued' && monthOf(r.date) === thisMonth()).length, 'issued this month']])}
    <div class="bar"><select id="rs"><option value="open">Open requests</option><option value="" ${st.status === '' ? 'selected' : ''}>All</option>${['pending', 'approved', 'issued', 'rejected'].map((s) => `<option value="${s}" ${st.status === s ? 'selected' : ''}>${label(s)}</option>`).join('')}</select><span class="sp"></span>${APP.can('requests', true) ? '<button class="btn" id="rNew">New request</button>' : ''}</div>
    ${table([{ h: 'Date', f: (r) => fdate(r.date) }, { h: 'Department', k: 'dept' }, { h: 'Items', f: (r) => esc(r.lines.map((l) => `${itemName(l.item)} × ${fnum(l.approved ?? l.qty)}`).join(', ')) }, { h: 'Requested by', f: (r) => esc(r.requested_by || r.by_name) }, { h: 'Status', f: (r) => pill(label(r.status), { pending: 'warn', approved: 'info', issued: 'ok', rejected: 'bad' }[r.status]) }], rs, { click: approveRequest, empty: 'No requests here.' })}`;
  $('#rs').onchange = (e) => { st.status = e.target.value; rerender(); };
  if ($('#rNew')) $('#rNew').onclick = () => requestForm();
}

/* ---------- department usage ---------- */
function deptUsePage(el) {
  const st = PS('deptuse', { month: thisMonth(), dept: APP.me.role === 'dept' ? APP.me.dept : '' });
  const depts = APP.settings().departments.filter((d) => !st.dept || d === st.dept);
  const issued = moves().filter((m) => m.type === 'out' && monthOf(m.date) === st.month && m.dept && ['drug', 'sundry', 'stationery', 'register'].includes(m.cat));
  const used = APP.all('deptuse').filter((u) => monthOf(u.date) === st.month);
  const itemsUsed = [...new Set(issued.map((m) => m.item))].sort((a, b) => itemName(a).localeCompare(itemName(b)));
  const q = (d, it) => sum(issued.filter((m) => m.dept === d && m.item === it), 'qty');
  const cols = [{ h: 'Item', f: (it) => `<b>${esc(itemName(it))}</b>`, x: (it) => itemName(it) }, ...depts.map((d) => ({ h: d, num: true, f: (it) => (q(d, it) ? fnum(q(d, it)) : '<span class="muted">·</span>'), x: (it) => q(d, it) })), { h: 'Total', num: true, f: (it) => `<b>${fnum(sum(issued.filter((m) => m.item === it && depts.includes(m.dept)), 'qty'))}</b>`, x: (it) => sum(issued.filter((m) => m.item === it && depts.includes(m.dept)), 'qty') }];
  const byDept = depts.map((d) => [d, sum(issued.filter((m) => m.dept === d), 'qty')]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]);
  const valByDept = APP.costOK ? depts.map((d) => [d, sum(issued.filter((m) => m.dept === d), (m) => num(m.qty) * lastCost(m.item))]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]) : [];
  el.innerHTML = `<div class="bar"><input type="month" id="um" value="${st.month}"><select id="ud" ${APP.me.role === 'dept' ? 'disabled' : ''}><option value="">All departments</option>${APP.settings().departments.map((d) => `<option ${st.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select><span class="sp"></span>${APP.can('deptuse', true) ? '<button class="btn" id="uRec">Record use on a patient</button>' : ''}<button class="btn ghost" id="uX">Excel</button></div>
    <div class="grid2"><div class="card"><h3>Units issued by department</h3>${barChart(byDept)}</div>${APP.costOK ? `<div class="card"><h3>Value issued by department</h3>${barChart(valByDept, { money: true, tone: 'b' })}</div>` : `<div class="card"><h3>Recorded on patients</h3>${barChart(Object.entries(groupBy(used, 'dept')).map(([d, a]) => [d, sum(a, 'qty')]))}</div>`}</div>
    <h3 class="mt">What each department used, ${monthName(st.month)}</h3>
    ${table(cols, itemsUsed, { empty: 'No stock was issued to departments this month.', limit: 1000 })}`;
  $('#um').onchange = (e) => { st.month = e.target.value; rerender(); };
  $('#ud').onchange = (e) => { st.dept = e.target.value; rerender(); };
  if ($('#uRec')) $('#uRec').onclick = deptUseForm;
  $('#uX').onclick = () => downloadXlsx('Department usage ' + st.month, [['Usage ' + st.month, rowsFor(cols, itemsUsed)], ['Issues detail', rowsFor([{ h: 'Date', k: 'date' }, { h: 'Department', k: 'dept' }, { h: 'Item', k: 'item_name' }, { h: 'Qty', k: 'qty' }, { h: 'Taken by', k: 'taken_by' }, { h: 'Patient', k: 'patient' }, { h: 'Purpose', k: 'purpose' }, { h: 'Entered by', k: 'by_name' }], issued)]]);
}
function deptUseForm() {
  formSheet('Record stock used on a patient', [
    { k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true },
    { k: 'dept', label: 'Department', type: 'select', opts: LOOK.dept, def: APP.me.dept || '', req: true, half: true },
    { k: 'item', label: 'Item used', type: 'item', cats: ['drug', 'sundry'], req: true, half: true },
    { k: 'qty', label: 'Quantity', type: 'number', min: 0, req: true, half: true },
    { k: 'patient', label: 'Patient name / file no.', req: true, half: true },
    { k: 'purpose', label: 'Procedure / purpose', half: true, type: 'datalist', opts: ['Delivery', 'Suturing', 'Dressing', 'IV line', 'Catheterisation', 'Theatre case', 'Injection', 'Other'] },
    { k: 'used_by', label: 'Used by (staff)', def: APP.me.name, half: true },
  ], { dept: APP.me.dept }, (d) => {
    if (APP.me.role === 'dept' && d.dept !== APP.me.dept) throw new Error('You can only record for ' + APP.me.dept + '.');
    APP.save('deptuse', { ...d, item_name: itemName(d.item) }); toast('Use recorded');
  });
}

/* ---------- misuse check ---------- */
function misusePage(el) {
  const st = PS('misuse', { month: thisMonth() }), m = st.month;
  const counts = APP.all('counts').filter((c) => c.month === m && num(c.diff) !== 0 && !c.dept);
  const kioskC = counts.filter((c) => c.cat === 'kiosk'), storeC = counts.filter((c) => c.cat !== 'kiosk');
  const issued = moves().filter((x) => x.type === 'out' && monthOf(x.date) === m && x.dept && (APP.get('items', x.item) || {}).track);
  const used = APP.all('deptuse').filter((u) => monthOf(u.date) === m);
  const deptRows = [];
  Object.entries(groupBy(issued, (x) => x.dept + '|' + x.item)).forEach(([k, arr]) => {
    const [dept, item] = k.split('|'), iss = sum(arr, 'qty'), u = sum(used.filter((x) => x.dept === dept && x.item === item), 'qty');
    deptRows.push({ dept, item, iss, used: u, gap: iss - u });
  });
  deptRows.sort((a, b) => b.gap - a.gap);
  const noDetail = moves().filter((x) => x.type === 'out' && monthOf(x.date) === m && ['drug', 'sundry'].includes(x.cat) && !x.patient && !x.request && (!x.purpose || /^other$/i.test(x.purpose)));
  const people = Object.entries(groupBy(moves().filter((x) => x.type === 'out' && monthOf(x.date) === m && x.taken_by), (x) => x.taken_by)).map(([p, a]) => ({ p, n: a.length, qty: sum(a, 'qty'), val: sum(a, (x) => num(x.qty) * lastCost(x.item)), items: Object.entries(groupBy(a, 'item')).map(([i, b]) => itemName(i) + ' ' + fnum(sum(b, 'qty'))).slice(0, 6).join(', ') })).sort((a, b) => b.qty - a.qty);
  const losses = moves().filter((x) => x.type === 'loss' && monthOf(x.date) === m);
  el.innerHTML = `<div class="bar"><input type="month" id="mm" value="${m}"><span class="sp"></span><button class="btn ghost" id="mP">Print</button></div>
    ${stats([[storeC.filter((c) => c.diff < 0).length, 'store items short on count', storeC.some((c) => c.diff < 0) ? 'alert' : ''], [kioskC.filter((c) => c.diff < 0).length, 'kiosk items short', kioskC.some((c) => c.diff < 0) ? 'alert' : ''], [deptRows.filter((r) => r.gap > 0).length, 'department items not accounted for', deptRows.some((r) => r.gap > 0) ? 'warn' : ''], [noDetail.length, 'issues with no patient or purpose', noDetail.length ? 'warn' : ''], [losses.length, 'expired / damaged entries']])}
    <div id="mBody">
    <h3 class="mt">1. Physical count shortages (stock that left without a record)</h3>
    ${table([{ h: 'Date', f: (c) => fdate(c.date) }, { h: 'Item', k: 'item_name' }, { h: 'System said', num: true, f: (c) => fnum(c.system) }, { h: 'Counted', num: true, f: (c) => fnum(c.physical) }, { h: 'Difference', num: true, f: (c) => pill((c.diff > 0 ? '+' : '') + fnum(c.diff), c.diff < 0 ? 'bad' : 'info') }, ...(APP.costOK ? [{ h: 'Value', num: true, f: (c) => money(Math.abs(c.diff) * lastCost(c.item)) }] : []), { h: 'Counted by', k: 'counted_by' }], counts.sort((a, b) => a.diff - b.diff), { empty: 'No differences found in counts this month. Do a physical count to check.' })}
    <h3 class="mt">2. Issued to departments but not recorded on patients</h3>
    <p class="muted sm">For items marked “track each use on a patient” (gloves, cord clamps, Cosmopore and similar). Departments record each patient under Department usage → “Record use on a patient”. A big gap means items were taken but not accounted for.</p>
    ${table([{ h: 'Department', k: 'dept' }, { h: 'Item', f: (r) => esc(itemName(r.item)) }, { h: 'Issued', num: true, f: (r) => fnum(r.iss) }, { h: 'Recorded used', num: true, f: (r) => fnum(r.used) }, { h: 'Not accounted for', num: true, f: (r) => (r.gap > 0 ? pill(fnum(r.gap), r.gap > r.iss * 0.2 ? 'bad' : 'warn') : pill('0', 'ok')) }], deptRows, { empty: 'No stock was issued to departments this month.' })}
    <h3 class="mt">3. Issues with no patient, request or purpose</h3>
    ${table([{ h: 'Date', f: (x) => fdate(x.date) }, { h: 'Item', k: 'item_name' }, { h: 'Qty', num: true, f: (x) => fnum(x.qty) }, { h: 'Department', k: 'dept' }, { h: 'Taken by', k: 'taken_by' }, { h: 'Entered by', k: 'by_name' }], noDetail, { empty: 'Every issue this month has a patient, request or purpose.' })}
    <h3 class="mt">4. Who took what</h3>
    ${table([{ h: 'Person', f: (r) => `<b>${esc(r.p)}</b>` }, { h: 'Times', num: true, k: 'n' }, { h: 'Units', num: true, f: (r) => fnum(r.qty) }, ...(APP.costOK ? [{ h: 'Value', num: true, f: (r) => money(r.val) }] : []), { h: 'Main items', f: (r) => esc(r.items) }], people, { empty: 'No issues recorded this month.' })}
    <h3 class="mt">5. Expired and damaged</h3>
    ${table([{ h: 'Date', f: (x) => fdate(x.date) }, { h: 'Item', k: 'item_name' }, { h: 'Qty', num: true, f: (x) => fnum(x.qty) }, { h: 'Reason', k: 'reason' }, ...(APP.costOK ? [{ h: 'Value', num: true, f: (x) => money(num(x.qty) * lastCost(x.item)) }] : []), { h: 'Entered by', k: 'by_name' }], losses, { empty: 'None this month.' })}
    </div>`;
  $('#mm').onchange = (e) => { st.month = e.target.value; rerender(); };
  $('#mP').onclick = () => printArea('Misuse check ' + monthName(m), $('#mBody').innerHTML);
}

/* ---------- procurement ---------- */
function orderLines(o) {
  const rec = moves().filter((x) => x.type === 'in' && x.order === o.id);
  return (o.lines || []).map((l) => { const r = sum(rec.filter((x) => x.item === l.item), 'qty'); return { ...l, received: r, outstanding: Math.max(0, num(l.qty) - r) }; });
}
function orderStatus(o) {
  const ls = orderLines(o), out = sum(ls, 'outstanding'), recd = sum(ls, 'received');
  if (o.status === 'cancelled') return ['Cancelled', ''];
  if (!out) return ['Complete', 'ok'];
  if (o.status === 'closed') return ['Closed short', 'bad'];
  if (recd) return ['Part received', 'warn'];
  if (o.expected && o.expected < today()) return ['Late', 'bad'];
  return ['Waiting', 'info'];
}
function newOrderFromLow(cats) {
  const low = lowItems(cats);
  orderForm({ date: today(), lines: low.map((i) => ({ item: i.id, qty: Math.max(1, num(i.max || i.min * 2) - (balances()[i.id] || 0)), price: lastCost(i.id) || '' })) });
}
function orderForm(o) {
  const isNew = !o || !o.id;
  formSheet(isNew ? 'New order' : 'Order ' + (o.number || ''), [
    { k: 'supplier', label: 'Supplier', type: 'select', opts: LOOK.supplier, req: true, half: true },
    { k: 'date', label: 'Date ordered', type: 'date', def: today(), req: true, half: true },
    { k: 'expected', label: 'Expected delivery', type: 'date', half: true },
    { k: 'number', label: 'Order / LPO number', half: true, def: () => 'PO-' + today().replace(/-/g, '').slice(2) + '-' + (APP.all('orders').length + 1) },
    { k: 'lines', label: 'Items ordered', type: 'lines', one: 'item', req: true, sub: [{ k: 'item', label: 'Item', type: 'item' }, { k: 'qty', label: 'Qty', type: 'number', min: 0 }, ...(APP.costOK ? [{ k: 'price', label: 'Unit price', type: 'money' }] : [])] },
    { k: 'note', label: 'Note', type: 'textarea', rows: 2 },
  ], o || {}, (d) => {
    if (!d.lines.every((l) => l.item && num(l.qty) > 0)) throw new Error('Each line needs an item and quantity.');
    APP.save('orders', { ...d, status: d.status || 'open', supplier_name: nameOf('suppliers', d.supplier) }, d.number); toast('Order saved');
  }, { wide: true, del: !isNew && APP.me.role === 'admin' && !orderLines(o).some((l) => l.received) ? () => APP.del('orders', o.id) : null });
}
function receiveOrder(o) {
  const ls = orderLines(o);
  const s = sheet('Receive delivery · ' + (o.number || ''), `<p>${esc(nameOf('suppliers', o.supplier))} · ordered ${fdate(o.date)} ${pill(...orderStatus(o))}</p>
    <form class="form"><div class="fld half"><label>Date received</label><input type="date" name="date" value="${today()}"></div><div class="fld half"><label>Invoice / delivery note no.</label><input name="invoice"></div>
    <div class="full">${table([{ h: 'Item', f: (l) => `<b>${esc(itemName(l.item))}</b>` }, { h: 'Ordered', num: true, f: (l) => fnum(l.qty) }, { h: 'Already in', num: true, f: (l) => fnum(l.received) }, { h: 'Outstanding', num: true, f: (l) => (l.outstanding ? pill(fnum(l.outstanding), 'warn') : pill('0', 'ok')) }, { h: 'Received now', f: (l) => (l.outstanding ? `<input type="number" min="0" step="any" name="r_${l.item}" value="${l.outstanding}">` : '') }, { h: 'Batch', f: (l) => (l.outstanding ? `<input name="b_${l.item}" size="8">` : '') }, { h: 'Expiry', f: (l) => (l.outstanding ? `<input type="date" name="e_${l.item}">` : '') }], ls, { limit: 500 })}</div>
    <p class="err" id="ferr"></p><div class="actions">${o.status !== 'closed' && sum(ls, 'outstanding') ? '<button type="button" class="btn ghost danger" id="oClose">Close order, rest not coming</button>' : ''}<span class="sp"></span><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">Tick off received</button></div></form>`, { wide: true });
  const f = $('form', s);
  if ($('#oClose', s)) $('#oClose', s).onclick = () => { APP.save('orders', { ...o, status: 'closed', closed_at: today() }); closeSheet(); toast('Order closed. Missing items stay on the supplier’s record.', true); };
  f.onsubmit = (e) => {
    e.preventDefault(); let n = 0, short = [];
    ls.forEach((l) => {
      const el = f.elements['r_' + l.item]; if (!el) return; const q = num(el.value);
      if (q > 0) { const it = APP.get('items', l.item); APP.save('moves', { date: f.elements.date.value, type: 'in', item: l.item, item_name: it.name, cat: it.cat, qty: q, supplier: o.supplier, invoice: f.elements.invoice.value, order: o.id, unit_price: l.price || '', total: l.price ? +(num(l.price) * q).toFixed(2) : '', batch: f.elements['b_' + l.item].value, expiry: f.elements['e_' + l.item].value, received_by: APP.me.name }, it.name); n++; }
      if (q < l.outstanding) short.push(`${fnum(l.outstanding - q)} ${itemName(l.item)}`);
    });
    closeSheet();
    toast(short.length ? `Received ${n} items. Still missing: ${short.join(', ')}` : 'Everything on this order has been received.', short.length > 0);
  };
}
function ordersPage(el) {
  const st = PS('orders', { view: 'open' });
  const os = APP.all('orders').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const open = os.filter((o) => !['Complete', 'Cancelled', 'Closed short'].includes(orderStatus(o)[0]));
  const missing = os.flatMap((o) => orderLines(o).filter((l) => l.outstanding && (o.status === 'closed' || (o.expected && o.expected < today()))).map((l) => ({ o, l })));
  const sup = Object.entries(groupBy(os.filter((o) => o.status !== 'cancelled'), 'supplier')).map(([s, arr]) => { const ls = arr.flatMap(orderLines); const ord = sum(ls, 'qty'), rec = sum(ls, 'received'); return { s, orders: arr.length, short: arr.filter((o) => orderLines(o).some((l) => l.outstanding) && (o.status === 'closed' || (o.expected && o.expected < today()))).length, ord, rec, fill: pct(rec, ord), missingItems: [...new Set(ls.filter((l) => l.outstanding).map((l) => itemName(l.item)))].slice(0, 5).join(', ') }; }).sort((a, b) => a.fill - b.fill);
  el.innerHTML = `${stats([[open.length, 'open orders'], [missing.length, 'items missing / late', missing.length ? 'alert' : ''], [lowItems().length, 'items below minimum', lowItems().length ? 'warn' : '']])}
    <div class="bar"><div class="seg">${[['open', 'Open orders'], ['all', 'All orders'], ['missing', 'Missing items'], ['suppliers', 'Supplier record']].map(([k, t]) => `<button data-v="${k}" aria-pressed="${st.view === k}">${t}</button>`).join('')}</div><span class="sp"></span>${APP.can('orders', true) ? `<button class="btn" id="oNew">New order</button>${lowItems().length ? '<button class="btn ghost" id="oLow">Order from low stock</button>' : ''}` : ''}</div>
    ${st.view === 'missing' ? table([{ h: 'Order', f: (x) => esc(x.o.number || '') + '<br><span class="muted sm">' + fdate(x.o.date) + '</span>' }, { h: 'Supplier', f: (x) => esc(nameOf('suppliers', x.o.supplier)) }, { h: 'Item', f: (x) => `<b>${esc(itemName(x.l.item))}</b>` }, { h: 'Ordered', num: true, f: (x) => fnum(x.l.qty) }, { h: 'Received', num: true, f: (x) => fnum(x.l.received) }, { h: 'Missing', num: true, f: (x) => pill(fnum(x.l.outstanding), 'bad') }, { h: 'Message', f: (x) => `<span class="sm">You ordered ${fnum(x.l.qty)} ${esc(itemName(x.l.item))}, only ${fnum(x.l.received)} received, ${fnum(x.l.outstanding)} missing.</span>` }], missing, { empty: 'Nothing missing. Every closed or late order was delivered in full.' })
    : st.view === 'suppliers' ? table([{ h: 'Supplier', f: (r) => `<b>${esc(nameOf('suppliers', r.s))}</b>` }, { h: 'Orders', num: true, k: 'orders' }, { h: 'Short / late orders', num: true, f: (r) => (r.short ? pill(r.short, 'bad') : '0') }, { h: 'Units ordered', num: true, f: (r) => fnum(r.ord) }, { h: 'Units received', num: true, f: (r) => fnum(r.rec) }, { h: 'Delivered in full', num: true, f: (r) => pill(r.fill + '%', r.fill >= 95 ? 'ok' : r.fill >= 80 ? 'warn' : 'bad') }, { h: 'Items they often miss', f: (r) => esc(r.missingItems) }], sup, { empty: 'No orders yet.' })
    : table([{ h: 'Order', f: (o) => `<b>${esc(o.number || '')}</b><br><span class="muted sm">${fdate(o.date)}</span>` }, { h: 'Supplier', f: (o) => esc(nameOf('suppliers', o.supplier)) }, { h: 'Items', f: (o) => esc(orderLines(o).map((l) => `${itemName(l.item)} ${fnum(l.received)}/${fnum(l.qty)}`).join(', ')) }, ...(APP.costOK ? [{ h: 'Value', num: true, f: (o) => money(sum(o.lines, (l) => num(l.qty) * num(l.price))) }] : []), { h: 'Expected', f: (o) => fdate(o.expected) }, { h: 'Status', f: (o) => pill(...orderStatus(o)) }, { h: '', f: (o) => (APP.can('moves', true) && orderLines(o).some((l) => l.outstanding) && !['closed', 'cancelled'].includes(o.status) ? `<button class="btn sm" data-rec="${o.id}">Receive</button>` : '') }], st.view === 'open' ? open : os, { click: (o) => APP.can('orders', true) && orderForm(o), empty: st.view === 'open' ? 'No open orders.' : 'No orders yet.' })}`;
  $$('[data-v]', el).forEach((b) => (b.onclick = () => { st.view = b.dataset.v; rerender(); }));
  $$('[data-rec]', el).forEach((b) => (b.onclick = () => receiveOrder(APP.get('orders', b.dataset.rec))));
  if ($('#oNew')) $('#oNew').onclick = () => orderForm();
  if ($('#oLow')) $('#oLow').onclick = () => newOrderFromLow();
}

/* ---------- kiosk ---------- */
function kioskPage(el) {
  const st = PS('kiosk', { view: 'today', date: today(), month: thisMonth() });
  const items = APP.all('items').filter((i) => i.cat === 'kiosk' && i.active !== false).sort((a, b) => a.name.localeCompare(b.name));
  const km = APP.all('moves').filter((m) => m.cat === 'kiosk');
  const inRange = (m) => (st.view === 'month' ? monthOf(m.date) === st.month : m.date === st.date);
  const period = km.filter(inRange);
  const sold = period.filter((m) => m.type === 'out' && m.reason === 'Sold'), free = period.filter((m) => m.type === 'out' && m.reason !== 'Sold');
  const collected = sum(sold, 'amount'), handed = sum(period.filter((m) => m.type === 'handover'), 'amount');
  const allCollected = sum(km.filter((m) => m.type === 'out' && m.reason === 'Sold'), 'amount'), allHanded = sum(km.filter((m) => m.type === 'handover'), 'amount');
  const start = st.view === 'month' ? st.month + '-01' : st.date, end = st.view === 'month' ? addDays(ymd(new Date(new Date(start + 'T12:00:00').getFullYear(), new Date(start + 'T12:00:00').getMonth() + 1, 1)), -1) : st.date;
  const rows = items.map((i) => {
    const ms = movesOf(i.id).filter((m) => m.date >= start && m.date <= end);
    const open = bal(i.id, addDays(start, -1)), bought = sum(ms.filter((m) => m.type === 'in'), 'qty');
    const sd = sum(ms.filter((m) => m.type === 'out' && m.reason === 'Sold'), 'qty'), gv = sum(ms.filter((m) => m.type === 'out' && m.reason !== 'Sold'), 'qty'), ls = sum(ms.filter((m) => m.type === 'loss'), 'qty');
    const expected = open + bought - sd - gv - ls;
    const cnt = APP.all('counts').filter((c) => c.item === i.id && c.date >= start && c.date <= end).sort((a, b) => (a.date || '').localeCompare(b.date || '')).pop();
    return { i, open, bought, sd, gv, ls, expected, counted: cnt ? cnt.physical : null, missing: cnt ? expected - cnt.physical : null, money: sum(ms.filter((m) => m.reason === 'Sold'), 'amount') };
  });
  const missing = rows.filter((r) => r.missing > 0);
  const canSell = APP.can('moves', true);
  el.innerHTML = `${stats([[money(collected), 'money collected'], [fnum(sum(sold, 'qty')), 'items sold'], [fnum(sum(free, 'qty')), 'given free'], [money(allCollected - allHanded), 'cash still at kiosk', allCollected - allHanded > 0 ? 'warn' : ''], [missing.length ? fnum(sum(missing, 'missing')) : '0', 'items missing on count', missing.length ? 'alert' : '']])}
    <div class="bar"><div class="seg"><button data-v="today" aria-pressed="${st.view === 'today'}">Day</button><button data-v="month" aria-pressed="${st.view === 'month'}">Month</button></div>
      ${st.view === 'month' ? `<input type="month" id="kmo" value="${st.month}">` : `<input type="date" id="kd" value="${st.date}">`}
      <span class="sp"></span>${canSell ? '<button class="btn" id="kIn">Stock bought</button><button class="btn ghost" id="kCount">Count stock</button><button class="btn ghost" id="kHand">Hand over cash</button>' : ''}${APP.can('items', true) ? '<button class="btn ghost" id="kAdd">+ Refreshment</button>' : ''}<button class="btn ghost" id="kX">Excel</button></div>
    ${canSell && items.length ? `<div class="card"><h3>Quick record</h3><div class="kgrid">${items.map((i) => `<div class="kt"><b>${esc(i.name)}</b><span class="muted sm">${fnum(balances()[i.id])} left · ${money(i.price || 0)}</span><div class="row gap"><button class="btn sm" data-sell="${i.id}">Sell</button><button class="btn sm ghost" data-give="${i.id}">Give free</button></div></div>`).join('')}</div></div>` : ''}
    <h3 class="mt">${st.view === 'month' ? monthName(st.month) : fdate(st.date)}: stock check</h3>
    ${table([{ h: 'Refreshment', f: (r) => `<b>${esc(r.i.name)}</b>` }, { h: 'Opening', num: true, f: (r) => fnum(r.open) }, { h: 'Bought', num: true, f: (r) => fnum(r.bought) }, { h: 'Sold', num: true, f: (r) => fnum(r.sd) }, { h: 'Given free', num: true, f: (r) => fnum(r.gv) }, { h: 'Should be left', num: true, f: (r) => `<b>${fnum(r.expected)}</b>` }, { h: 'Counted', num: true, f: (r) => (r.counted == null ? '<span class="muted">not counted</span>' : fnum(r.counted)) }, { h: 'Missing', num: true, f: (r) => (r.missing == null ? '' : r.missing > 0 ? pill(fnum(r.missing) + ' missing', 'bad') : r.missing < 0 ? pill(fnum(-r.missing) + ' extra', 'info') : pill('All there', 'ok')) }, { h: 'Money', num: true, f: (r) => money(r.money) }], rows, { empty: 'Add your refreshments first with “+ Refreshment” (e.g. Minute Maid Orange Top, Water).', rowCls: (r) => (r.missing > 0 ? 'hl-bad' : '') })}
    ${missing.length ? `<div class="note bad">${missing.map((r) => `We had ${fnum(r.open + r.bought)} ${esc(r.i.name)}, sold ${fnum(r.sd)}, gave ${fnum(r.gv)} free${r.ls ? `, ${fnum(r.ls)} spoiled` : ''}, so ${fnum(r.expected)} should be left. Only ${fnum(r.counted)} were counted: <b>${fnum(r.missing)} missing</b>.`).join('<br>')}</div>` : ''}
    <div class="grid2 mt"><div class="card"><h3>Given free, by reason</h3>${barChart(Object.entries(groupBy(free, 'reason')).map(([k, a]) => [k, sum(a, 'qty')]))}</div>
    <div class="card"><h3>Money</h3>${table([{ h: '', k: 'k' }, { h: 'Amount', num: true, f: (r) => money(r.v) }], [{ k: 'Collected from sales', v: collected }, { k: 'Handed to accounts', v: handed }, { k: 'Difference this period', v: collected - handed }, { k: 'Cash at kiosk (all time)', v: allCollected - allHanded }])}</div></div>
    <h3 class="mt">All kiosk entries</h3>
    ${table([{ h: 'Date', f: (m) => fdate(m.date) + '<br><span class="muted sm">' + ftime(m.at) + '</span>' }, { h: 'What', f: (m) => (m.type === 'handover' ? '<b>Cash handed over</b>' : esc(m.item_name)) }, { h: 'Type', f: (m) => pill(m.type === 'in' ? 'Bought' : m.type === 'handover' ? 'Handover' : m.type === 'loss' ? m.reason : m.reason === 'Sold' ? 'Sold' : 'Free: ' + m.reason, m.type === 'in' ? 'ok' : m.reason === 'Sold' ? 'info' : m.type === 'handover' ? '' : 'warn') }, { h: 'Qty', num: true, f: (m) => (m.qty ? fnum(m.qty) : '') }, { h: 'Money', num: true, f: (m) => (m.amount ? money(m.amount) : m.total ? money(m.total) : '') }, { h: 'Who / for', f: (m) => esc([m.taken_by, m.received_to, nameOf('suppliers', m.supplier), m.note].filter(Boolean).join(' · ')) }, { h: 'Entered by', k: 'by_name' }], period.slice().sort((a, b) => (b.at || '').localeCompare(a.at || '')), { empty: 'Nothing recorded for this period.' })}`;
  $$('[data-v]', el).forEach((b) => (b.onclick = () => { st.view = b.dataset.v; rerender(); }));
  if ($('#kd')) $('#kd').onchange = (e) => { st.date = e.target.value; rerender(); };
  if ($('#kmo')) $('#kmo').onchange = (e) => { st.month = e.target.value; rerender(); };
  if ($('#kAdd')) $('#kAdd').onclick = () => editItem(null, ['kiosk']);
  if ($('#kIn')) { $('#kIn').onclick = () => stockIn({ cats: ['kiosk'] }); $('#kCount').onclick = () => countForm({ cats: ['kiosk'] }); $('#kHand').onclick = handoverForm; }
  $$('[data-sell]', el).forEach((b) => (b.onclick = () => kioskOut(b.dataset.sell, true)));
  $$('[data-give]', el).forEach((b) => (b.onclick = () => kioskOut(b.dataset.give, false)));
  $('#kX').onclick = () => downloadXlsx('Kiosk ' + (st.view === 'month' ? st.month : st.date), [['Stock check', rowsFor([{ h: 'Refreshment', x: (r) => r.i.name }, { h: 'Opening', k: 'open' }, { h: 'Bought', k: 'bought' }, { h: 'Sold', k: 'sd' }, { h: 'Given free', k: 'gv' }, { h: 'Should be left', k: 'expected' }, { h: 'Counted', x: (r) => r.counted ?? '' }, { h: 'Missing', x: (r) => r.missing ?? '' }, { h: 'Money', k: 'money' }], rows)], ['Entries', rowsFor([{ h: 'Date', k: 'date' }, { h: 'Item', k: 'item_name' }, { h: 'Type', x: (m) => m.type }, { h: 'Reason', k: 'reason' }, { h: 'Qty', k: 'qty' }, { h: 'Amount', k: 'amount' }, { h: 'Who', k: 'taken_by' }, { h: 'Entered by', k: 'by_name' }], period)]]);
}
function kioskOut(itemId, sell) {
  const it = APP.get('items', itemId);
  formSheet((sell ? 'Sell ' : 'Give out ') + it.name, [
    { k: 'qty', label: 'How many', type: 'number', min: 1, step: 1, def: 1, req: true, half: true },
    sell ? { k: 'amount', label: 'Money received', type: 'money', req: true, half: true, def: num(it.price) } : { k: 'reason', label: 'Reason', type: 'select', opts: APP.settings().kiosk_reasons.filter((r) => r !== 'Sold'), req: true, half: true },
    { k: 'taken_by', label: sell ? 'Bought by (optional)' : 'Given to / taken by', req: !sell, half: true },
    { k: 'date', label: 'Date', type: 'date', def: today(), half: true },
    { k: 'note', label: 'Note', half: true },
  ], {}, (d) => {
    if (num(d.qty) > bal(itemId)) throw new Error(`Only ${fnum(bal(itemId))} left. Record the stock bought first.`);
    APP.save('moves', { ...d, item: itemId, item_name: it.name, cat: 'kiosk', type: 'out', reason: sell ? 'Sold' : d.reason }, it.name);
    toast(sell ? `Sold ${d.qty} · ${money(d.amount)}` : `${d.qty} given out (${d.reason})`);
  }, { live: (d, f) => { if (sell && f.elements.amount && !f.elements.amount.dataset.t) { f.elements.amount.value = (num(d.qty) * num(it.price)).toFixed(2); } if (f.elements.amount) f.elements.amount.onkeydown = () => (f.elements.amount.dataset.t = 1); } });
}
function handoverForm() {
  formSheet('Hand over kiosk cash', [{ k: 'date', label: 'Date', type: 'date', def: today(), req: true, half: true }, { k: 'amount', label: 'Amount handed over', type: 'money', req: true, half: true }, { k: 'received_to', label: 'Received by (accounts)', req: true, half: true }, { k: 'note', label: 'Note', half: true }], {}, (d) => {
    APP.save('moves', { ...d, type: 'handover', cat: 'kiosk', item: '' }); toast('Handover recorded');
  });
}
