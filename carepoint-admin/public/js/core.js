/* CarePoint Admin core: offline store + sync, helpers, forms, tables, charts, exports. */
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p) => (p || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => { d = d ? new Date(d) : new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const today = () => ymd();
const monthOf = (s) => String(s || '').slice(0, 7);
const thisMonth = () => today().slice(0, 7);
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return ymd(d); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const prevMonth = (m) => { const d = new Date(m + '-15T12:00:00'); d.setMonth(d.getMonth() - 1); return ymd(d).slice(0, 7); };
const monthName = (m) => new Date(m + '-15T12:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const fdate = (s) => (s ? new Date(String(s).length <= 10 ? s + 'T12:00:00' : s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const ftime = (s) => (s ? new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const fnum = (v, d = 0) => num(v).toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
const money = (v) => (APP.settings().currency_symbol || '$') + fnum(v, 2);
const sum = (arr, f) => arr.reduce((s, x) => s + num(typeof f === 'function' ? f(x) : x[f]), 0);
const groupBy = (arr, f) => arr.reduce((m, x) => { const k = typeof f === 'function' ? f(x) : x[f]; (m[k] = m[k] || []).push(x); return m; }, {});
const pct = (a, b) => (b ? Math.round((a * 100) / b) : 0);
const label = (s) => String(s || '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/* ---------------- API ---------------- */
async function api(path, data, method) {
  const r = await fetch('/api/' + path, { method: method || (data ? 'POST' : 'GET'), credentials: 'same-origin', headers: data ? { 'content-type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok) { const e = new Error(j.error || 'Could not reach the server.'); e.status = r.status; throw e; }
  return j;
}

/* ---------------- offline store (IndexedDB) ---------------- */
const IDB = {
  db: null,
  open(name) {
    return new Promise((res, rej) => {
      const q = indexedDB.open(name, 1);
      q.onupgradeneeded = () => q.result.createObjectStore('kv');
      q.onsuccess = () => { IDB.db = q.result; res(); };
      q.onerror = () => rej(q.error);
    });
  },
  get(k) { return new Promise((res) => { const q = IDB.db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); },
  set(k, v) { return new Promise((res) => { const t = IDB.db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = res; }); },
};

const APP = {
  me: null, roles: {}, perms: {}, moneyOK: false, costOK: false,
  data: {}, last: 0, outbox: [], syncing: false, online: navigator.onLine, lastSync: null, errors: [],
  listeners: [],
  can(col, w) { const p = this.perms[col]; return !!p && (w ? p.w : p.r).includes(this.me.role); },
  all(col) { return Object.values(this.data[col] || {}).filter((d) => !d._deleted); },
  get(col, id) { const d = (this.data[col] || {})[id]; return d && !d._deleted ? d : null; },
  settings() { return Object.assign({}, DEFAULT_SETTINGS, this.get('settings', 'main') || {}); },
  async persist() { await IDB.set('data', this.data); await IDB.set('meta', { last: this.last, outbox: this.outbox, lastSync: this.lastSync }); },
  save(col, doc, note) {
    if (!this.can(col, true)) throw new Error('Your login is not allowed to change this.');
    doc = { ...doc }; if (!doc.id) doc.id = uid(col.slice(0, 2));
    const old = this.get(col, doc.id);
    if (!old) { doc.by = this.me.id; doc.by_name = this.me.name; doc.at = doc.at || new Date().toISOString(); }
    (this.data[col] = this.data[col] || {})[doc.id] = doc;
    this.outbox = this.outbox.filter((o) => !(o.col === col && o.id === doc.id));
    this.outbox.push({ col, id: doc.id, data: doc, note });
    if (typeof CACHE !== 'undefined') CACHE = {};
    if (!this._bulk) { this.persist(); this.changed(); this.sync(); }
    return doc;
  },
  del(col, id) {
    const d = this.get(col, id); if (!d) return;
    this.data[col][id] = { ...d, _deleted: true };
    this.outbox = this.outbox.filter((o) => !(o.col === col && o.id === id));
    this.outbox.push({ col, id, deleted: true });
    if (typeof CACHE !== 'undefined') CACHE = {};
    if (!this._bulk) { this.persist(); this.changed(); this.sync(); }
  },
  bulk(fn) { this._bulk = true; try { fn(); } finally { this._bulk = false; this.persist(); this.changed(); this.sync(); } },
  changed() { clearTimeout(this._ct); this._ct = setTimeout(() => this.listeners.forEach((f) => f()), 30); },
  async sync() {
    if (this.syncing) { this._again = true; return; }
    this.syncing = true; this._again = false; syncBadge();
    try {
      while (this.outbox.length) {
        const batch = this.outbox.slice(0, 200);
        const r = await api('sync', { ops: batch });
        const done = new Set();
        for (const x of r.results) {
          done.add(x.col + '|' + x.id);
          if (!x.ok) { this.errors.unshift({ at: new Date().toISOString(), msg: x.error, col: x.col, id: x.id }); toast(x.error, true); delete (this.data[x.col] || {})[x.id]; }
        }
        this.outbox = this.outbox.filter((o) => !done.has(o.col + '|' + o.id));
        await this.persist();
      }
      let more = true;
      while (more) {
        const r = await api('sync?since=' + this.last);
        for (const d of r.docs) {
          const c = (this.data[d.col] = this.data[d.col] || {});
          if (this.outbox.some((o) => o.col === d.col && o.id === d.id)) continue;
          if (d.deleted) delete c[d.id]; else c[d.id] = d.data;
        }
        this.last = r.last; more = r.more;
        if (r.docs.length) this.changed();
      }
      this.online = true; this.lastSync = new Date().toISOString();
      await this.persist();
    } catch (e) {
      if (e.status === 401) { location.reload(); return; }
      this.online = false;
    } finally { this.syncing = false; syncBadge(); if (this._again) this.sync(); }
  },
};
addEventListener('online', () => { APP.online = true; APP.sync(); });
addEventListener('offline', () => { APP.online = false; syncBadge(); });
setInterval(() => { if (APP.me && !document.hidden) APP.sync(); }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && APP.me) APP.sync(); });
function syncBadge() {
  const b = $('#sync'); if (!b) return;
  const n = APP.outbox.length;
  b.className = 'sync ' + (APP.syncing ? 'busy' : !APP.online ? 'off' : n ? 'wait' : 'ok');
  b.innerHTML = APP.syncing ? '<i></i>Saving…' : !APP.online ? `<i></i>Offline${n ? ` · ${n} to send` : ''}` : n ? `<i></i>${n} waiting` : '<i></i>Saved';
  b.title = APP.lastSync ? 'Last synced ' + new Date(APP.lastSync).toLocaleString() : '';
}

/* ---------------- defaults ---------------- */
const DEFAULT_SETTINGS = {
  hospital: 'Our Hospital', currency_symbol: '$',
  departments: ['OPD', 'Theatre', 'Maternity Ward', 'Male Ward', 'Female Ward', 'Paediatric Ward', 'Casualty', 'Pharmacy', 'Administration', 'Kitchen'],
  aids: ['CIMAS', 'First Mutual Health', 'PSMAS', 'Alliance Health', 'Bonvie', 'CellMed', 'Generation Health', 'Fidelity Life', 'Other'],
  diagnoses: ['Malaria', 'Hypertension', 'Diabetes', 'Pneumonia', 'Upper respiratory tract infection', 'Diarrhoea', 'Wound infection', 'Urinary tract infection', 'Pre-eclampsia', 'Eclampsia', 'Asthma', 'HIV related illness', 'Tuberculosis', 'Skin infection', 'Injury / trauma', 'Gastritis', 'Anaemia', 'Normal delivery', 'Caesarean section', 'Other'],
  areas: [], disciplines: ['General surgery', 'Obstetrics (C-section)', 'Gynaecology', 'Orthopaedics', 'ENT', 'Urology', 'Minor procedure', 'Other'],
  claim_errors: ['Missing authorisation number', 'Wrong member number', 'Membership expired / suspended', 'Wrong tariff / procedure code', 'Missing signature or stamp', 'Missing diagnosis / ICD code', 'Duplicate claim', 'Over the benefit limit', 'Other'],
  repair_days_urgent: 2, repair_days_normal: 7, expiry_warn_days: 90, vehicle_warn_days: 30, service_warn_days: 14,
  kiosk_reasons: ['Sold', 'Managers meeting', 'Theatre refreshments', 'Staff / other meeting', 'Given to staff / visitor'],
};

/* ---------------- UI primitives ---------------- */
function toast(msg, bad) {
  const t = $('#toast'); t.textContent = msg; t.className = 'toast on' + (bad ? ' bad' : '');
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.className = 'toast'), bad ? 6000 : 3200);
}
function pill(text, tone) { return `<span class="pill ${tone || ''}">${esc(text)}</span>`; }
function sheet(title, html, opts) {
  opts = opts || {};
  const s = $('#sheet');
  s.innerHTML = `<div class="sh ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h2>${esc(title)}</h2><button class="x" data-close aria-label="Close">×</button></header><div class="sb">${html}</div></div>`;
  s.classList.add('on'); document.body.classList.add('noscroll');
  $$('[data-close]', s).forEach((b) => (b.onclick = closeSheet));
  setTimeout(() => { const f = $('input:not([type=hidden]):not([readonly]),select,textarea', s); if (f && !opts.nofocus && matchMedia('(min-width:700px)').matches) f.focus(); }, 30);
  return $('.sh', s);
}
function closeSheet() { $('#sheet').classList.remove('on'); $('#sheet').innerHTML = ''; document.body.classList.remove('noscroll'); }
addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#sheet').classList.contains('on')) closeSheet(); });
$('#sheet') && ($('#sheet').onclick = (e) => { if (e.target.id === 'sheet') closeSheet(); });
function confirmBox(msg, yes, cb) {
  const s = sheet('Please confirm', `<p>${msg}</p><div class="actions"><button class="btn ghost" data-close>Cancel</button><button class="btn danger" id="cfY">${esc(yes || 'Yes')}</button></div>`);
  $('#cfY', s).onclick = () => { closeSheet(); cb(); };
}

/* lookups used by forms */
const LOOK = {
  dept: () => APP.settings().departments,
  aid: () => APP.settings().aids,
  diagnosis: () => APP.settings().diagnoses,
  discipline: () => APP.settings().disciplines,
  claimerr: () => APP.settings().claim_errors,
  employee: () => APP.all('employees').filter((e) => e.active !== false).sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((e) => [e.id, e.name + (e.position ? ' · ' + e.position : '')]),
  vehicle: () => APP.all('vehicles').map((v) => [v.id, (v.reg || '') + ' · ' + (v.type || '')]),
  supplier: () => APP.all('suppliers').sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((s) => [s.id, s.name]),
  asset: () => APP.all('assets').map((a) => [a.id, (a.tag ? a.tag + ' · ' : '') + a.name]),
};
const nameOf = (col, id) => { const d = APP.get(col, id); return d ? d.name || d.reg || d.title || '' : ''; };

/* ---------------- form engine ----------------
 field: {k, label, type: text|number|money|date|time|select|textarea|check|item|lines|rows|datalist, opts, req, half, help, show:(d)=>bool, cats, sub:[...], min, step} */
function optList(o) { const a = typeof o === 'function' ? o() : o || []; return a.map((x) => (Array.isArray(x) ? x : [x, x])); }
function itemOpts(cats) { return APP.all('items').filter((i) => !cats || cats.includes(i.cat)).sort((a, b) => a.name.localeCompare(b.name)).map((i) => [i.id, i.name + (i.unit ? ' (' + i.unit + ')' : '')]); }
function fieldHtml(f, v, prefix) {
  const n = (prefix || '') + f.k, id = 'f_' + n.replace(/\W/g, '_');
  const req = f.req ? 'required' : '';
  const lab = `<label for="${id}">${esc(f.label)}${f.req ? ' <b class="req">*</b>' : ''}</label>`;
  let inp;
  switch (f.type) {
    case 'textarea': inp = `<textarea id="${id}" name="${n}" rows="${f.rows || 3}" ${req}>${esc(v)}</textarea>`; break;
    case 'select': inp = `<select id="${id}" name="${n}" ${req}>${f.blank !== false ? `<option value="">${esc(f.placeholder || 'Choose…')}</option>` : ''}${optList(f.opts).map(([k, t]) => `<option value="${esc(k)}" ${String(k) === String(v ?? f.def ?? '') ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`; break;
    case 'item': inp = `<select id="${id}" name="${n}" ${req}><option value="">Choose item…</option>${itemOpts(f.cats).map(([k, t]) => `<option value="${esc(k)}" ${k === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`; break;
    case 'datalist': inp = `<input id="${id}" name="${n}" value="${esc(v)}" list="${id}_l" ${req} autocomplete="off"><datalist id="${id}_l">${optList(f.opts).map(([k]) => `<option value="${esc(k)}">`).join('')}</datalist>`; break;
    case 'check': return `<label class="check ${f.half ? 'half' : ''}"><input type="checkbox" name="${n}" ${v ? 'checked' : ''}> ${esc(f.label)}</label>`;
    case 'number': case 'money': inp = `<input id="${id}" name="${n}" type="number" inputmode="decimal" step="${f.step || (f.type === 'money' ? '0.01' : 'any')}" ${f.min != null ? `min="${f.min}"` : ''} value="${esc(v)}" ${req}>`; break;
    case 'date': inp = `<input id="${id}" name="${n}" type="date" value="${esc(v)}" ${req}>`; break;
    case 'time': inp = `<input id="${id}" name="${n}" type="time" value="${esc(v)}" ${req}>`; break;
    case 'lines': case 'rows': return `<div class="fld full rowsf" data-rows="${f.k}"><label>${esc(f.label)}</label><div class="rowsbox"></div><button type="button" class="btn sm ghost" data-addrow>+ Add ${esc(f.one || 'row')}</button></div>`;
    default: inp = `<input id="${id}" name="${n}" value="${esc(v)}" ${req} ${f.ph ? `placeholder="${esc(f.ph)}"` : ''} ${f.ro ? 'readonly' : ''}>`;
  }
  return `<div class="fld ${f.half ? 'half' : f.third ? 'third' : 'full'}" data-k="${f.k}">${lab}${inp}${f.help ? `<small>${esc(f.help)}</small>` : ''}</div>`;
}
// opens a form; resolves cb(data) on save
function formSheet(title, fields, doc, onSave, opts) {
  opts = opts || {}; doc = doc || {};
  const vis = fields.filter((f) => !f.hide);
  const s = sheet(title, `<form class="form" novalidate>${vis.map((f) => fieldHtml(f, doc[f.k] ?? (typeof f.def === 'function' ? f.def() : f.def))).join('')}
    ${opts.extra || ''}<p class="err" id="ferr"></p>
    <div class="actions">${opts.del ? '<button type="button" class="btn danger ghost" id="fdel">Delete</button>' : ''}<span class="sp"></span><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">${esc(opts.saveText || 'Save')}</button></div></form>`, { wide: opts.wide });
  const form = $('form', s);
  // repeating rows
  vis.filter((f) => f.type === 'lines' || f.type === 'rows').forEach((f) => {
    const box = $(`[data-rows="${f.k}"] .rowsbox`, form), sub = f.sub;
    const add = (r) => {
      const d = document.createElement('div'); d.className = 'rowline';
      d.innerHTML = sub.map((x) => fieldHtml({ ...x, half: false, third: false }, r ? r[x.k] : x.def, f.k + '.')).join('') + '<button type="button" class="btn sm ghost rm" aria-label="Remove row">×</button>';
      $('.rm', d).onclick = () => { d.remove(); form.dispatchEvent(new Event('input')); };
      box.append(d);
    };
    (doc[f.k] && doc[f.k].length ? doc[f.k] : f.start === 0 ? [] : [null]).forEach(add);
    $(`[data-rows="${f.k}"] [data-addrow]`, form).onclick = () => add(null);
  });
  const read = () => {
    const out = {};
    vis.forEach((f) => {
      if (f.type === 'lines' || f.type === 'rows') {
        out[f.k] = $$(`[data-rows="${f.k}"] .rowline`, form).map((row) => {
          const o = {}; f.sub.forEach((x) => { const el = $(`[name="${f.k}.${x.k}"]`, row); if (!el) return; o[x.k] = x.type === 'check' ? el.checked : ['number', 'money'].includes(x.type) ? (el.value === '' ? '' : num(el.value)) : el.value.trim(); });
          return o;
        }).filter((o) => Object.values(o).some((v) => v !== '' && v !== false));
        return;
      }
      const el = form.querySelector(`[name="${f.k}"]`); if (!el) return;
      out[f.k] = f.type === 'check' ? el.checked : ['number', 'money'].includes(f.type) ? (el.value === '' ? '' : num(el.value)) : el.value.trim();
    });
    return out;
  };
  const showHide = () => { const d = read(); vis.forEach((f) => { if (!f.show) return; const el = $(`[data-k="${f.k}"]`, form) || $(`[data-rows="${f.k}"]`, form); if (el) el.hidden = !f.show(d); }); if (opts.live) opts.live(d, form); };
  form.addEventListener('input', showHide); form.addEventListener('change', showHide); showHide();
  form.onsubmit = (e) => {
    e.preventDefault(); const err = $('#ferr', form); err.textContent = '';
    const d = read();
    for (const f of vis) {
      if (f.show && !f.show(d)) { delete d[f.k]; continue; }
      if (f.req && (d[f.k] === '' || d[f.k] == null || (Array.isArray(d[f.k]) && !d[f.k].length))) { err.textContent = `Please fill in “${f.label}”.`; return; }
    }
    try { const r = onSave({ ...doc, ...d }, d); if (r !== false) closeSheet(); } catch (x) { err.textContent = x.message; }
  };
  if (opts.del) $('#fdel', form).onclick = () => confirmBox('Delete this record? This cannot be undone.', 'Delete', opts.del);
  return { form, sheet: s, read };
}

/* ---------------- tables ---------------- */
// cols: [{h, k, f:(row)=>html, num, sort:(row)=>value, cls}]
function table(cols, rows, opts) {
  opts = opts || {};
  if (!rows.length) return `<div class="empty">${opts.empty || 'Nothing here yet.'}</div>`;
  const id = 't' + Math.random().toString(36).slice(2, 7);
  const lim = opts.limit || 300, more = rows.length > lim;
  setTimeout(() => {
    const t = document.getElementById(id); if (!t) return;
    $$('th[data-i]', t).forEach((th) => (th.onclick = () => {
      const c = cols[th.dataset.i], dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
      const key = c.sort || ((r) => (c.k ? r[c.k] : ''));
      const sorted = rows.slice().sort((a, b) => { const x = key(a), y = key(b); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true })) * (dir === 'asc' ? 1 : -1); });
      t.outerHTML = table(cols, sorted, opts); const nt = document.getElementById(id); if (nt) { const h = $(`th[data-i="${th.dataset.i}"]`, nt); if (h) h.dataset.dir = dir; }
      if (opts.after) opts.after();
    }));
    if (opts.click) $$('tbody tr', t).forEach((tr) => (tr.onclick = (e) => { if (e.target.closest('button,a,input,select')) return; opts.click(rows[tr.dataset.r]); }));
  });
  return `<div class="tw"><table id="${id}" class="${opts.click ? 'clk' : ''}"><thead><tr>${cols.map((c, i) => `<th data-i="${i}" class="${c.num ? 'n' : ''}">${esc(c.h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, lim).map((r, ri) => `<tr data-r="${ri}" class="${opts.rowCls ? opts.rowCls(r) : ''}">${cols.map((c) => `<td class="${c.num ? 'n' : ''} ${c.cls || ''}" data-h="${esc(c.h)}">${c.f ? c.f(r) : esc(r[c.k])}</td>`).join('')}</tr>`).join('')}</tbody>${opts.foot ? `<tfoot><tr>${opts.foot.map((f, i) => `<td class="${cols[i] && cols[i].num ? 'n' : ''}">${f}</td>`).join('')}</tr></tfoot>` : ''}</table>${more ? `<p class="muted sm">Showing the first ${lim} of ${rows.length}. Narrow the dates or search to see the rest.</p>` : ''}</div>`;
}
function stats(list) { return `<div class="stats">${list.filter(Boolean).map(([v, l, tone]) => `<div class="stat ${tone || ''}"><b>${v}</b><span>${esc(l)}</span></div>`).join('')}</div>`; }

/* ---------------- charts (SVG) ---------------- */
function barChart(data, opts) { // data: [[label, value]]
  opts = opts || {}; if (!data.length) return '<div class="empty">No data for this period.</div>';
  const max = Math.max(1, ...data.map((d) => d[1])), H = 22, gap = 6, W = 640, lw = opts.lw || 180;
  return `<svg class="chart" viewBox="0 0 ${W} ${data.length * (H + gap)}" role="img" aria-label="${esc(opts.title || 'Chart')}">${data.map(([l, v], i) => {
    const w = Math.max(2, ((W - lw - 60) * v) / max), y = i * (H + gap);
    return `<text x="${lw - 8}" y="${y + 15}" text-anchor="end" class="cl">${esc(String(l).slice(0, 28))}</text><rect x="${lw}" y="${y}" width="${w}" height="${H}" rx="4" class="cb ${opts.tone || ''}"/><text x="${lw + w + 6}" y="${y + 15}" class="cv">${opts.money ? money(v) : fnum(v)}</text>`;
  }).join('')}</svg>`;
}
function lineChart(series, labels, opts) { // series: [{name, values, tone}]
  opts = opts || {}; const W = 640, H = 220, P = 34;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const x = (i) => P + (i * (W - P * 2)) / Math.max(1, labels.length - 1), y = (v) => H - P - ((H - P * 2) * v) / max;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.title || 'Trend')}">
    ${[0, 0.5, 1].map((t) => `<line x1="${P}" x2="${W - P}" y1="${y(max * t)}" y2="${y(max * t)}" class="grid"/><text x="4" y="${y(max * t) + 4}" class="cv">${fnum(max * t)}</text>`).join('')}
    ${labels.map((l, i) => (labels.length <= 12 || i % 2 === 0 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="cl">${esc(l)}</text>` : '')).join('')}
    ${series.map((s, k) => `<polyline fill="none" class="ln s${k}" points="${s.values.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/>${s.values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" class="dt s${k}"><title>${esc(s.name)} ${esc(labels[i])}: ${v}</title></circle>`).join('')}`).join('')}
  </svg>${series.length > 1 ? `<div class="legend">${series.map((s, k) => `<span><i class="s${k}"></i>${esc(s.name)}</span>`).join('')}</div>` : ''}`;
}

/* ---------------- export ---------------- */
function rowsFor(cols, rows) { // plain values for Excel/CSV
  return [cols.map((c) => c.h), ...rows.map((r) => cols.map((c) => { const v = c.x ? c.x(r) : c.k ? r[c.k] : c.f ? c.f(r).replace(/<[^>]+>/g, '') : ''; return typeof v === 'string' ? v.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : v ?? ''; }))];
}
function downloadXlsx(name, sheets) { // sheets: [[sheetName, aoa]]
  if (!window.XLSX) return toast('Excel export is still loading. Try again in a moment.', true);
  const wb = XLSX.utils.book_new();
  sheets.forEach(([n, aoa]) => { const ws = XLSX.utils.aoa_to_sheet(aoa); ws['!cols'] = (aoa[0] || []).map((_, i) => ({ wch: Math.min(40, Math.max(8, ...aoa.slice(0, 200).map((r) => String(r[i] ?? '').length))) })); XLSX.utils.book_append_sheet(wb, ws, String(n).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)); });
  XLSX.writeFile(wb, name.replace(/[^\w.-]+/g, '-') + '.xlsx');
}
function downloadFile(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'application/json' })); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function printArea(title, html) {
  const w = $('#print'); w.innerHTML = `<div class="phead"><b>${esc(APP.settings().hospital)}</b><span>${esc(title)} · printed ${new Date().toLocaleString('en-GB')} by ${esc(APP.me.name)}</span></div>${html}`;
  document.body.classList.add('printing'); setTimeout(() => { window.print(); document.body.classList.remove('printing'); }, 60);
}
