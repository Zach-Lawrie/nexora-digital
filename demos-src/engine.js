/* Nexora Digital demo engine: one config-driven app for every system demo. */
(function () {
  'use strict';
  const ALL = window.__SYS || [];
  const C = ALL.find((s) => s.id === window.SYS_ID) || ALL[0];
  const ICONS = window.ICONS;
  const ENGINE_V = 4;

  /* ---------- small helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n] || ICONS.grid}"/></svg>`;
  const split1 = (s, ch) => { const i = String(s).indexOf(ch); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; };
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const todayS = iso(TODAY);
  const parseD = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const addDays = (n, base) => { const d = base ? parseD(base) : new Date(TODAY); d.setDate(d.getDate() + n); return iso(d); };
  const rel = (v) => { if (typeof v === 'string') { const m = v.match(/^d([+-]?\d+)$/); if (m) return addDays(+m[1]); } return v; };
  const days = (a, b) => Math.round((parseD(b || todayS) - parseD(a)) / 864e5);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dfmt = (s) => { if (!s || !/^\d{4}-\d\d/.test(s)) return esc(s); const d = parseD(s); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
  const CUR = C.currency || '$';
  const money = (v) => (Number(v) < 0 ? '-' : '') + CUR + Math.abs(Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const moneyS = (v) => { const n = Number(v) || 0; return Math.abs(n) >= 100 || Number.isInteger(n) ? (n < 0 ? '-' : '') + CUR + Math.round(Math.abs(n)).toLocaleString('en-US') : money(n); };
  const num = (v) => (Number(v) || 0).toLocaleString('en-US', { maximumFractionDigits: 1 });
  const fmtV = (v, k) => k === 'money' ? moneyS(v) : k === 'pct' ? Math.round(v || 0) + '%' : k === 'days' ? num(v) + ' days' : k === 'raw' ? esc(v) : num(v);
  const initials = (n) => String(n).replace(/^(Dr|Mr|Mrs|Ms|Pastor|Rev|Eng)\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const nowT = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };

  /* ---------- logo ---------- */
  function logo(size) {
    const id = 'lg' + Math.random().toString(36).slice(2, 7);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.color}"/><stop offset="1" stop-color="${C.color2}"/></linearGradient></defs><rect width="40" height="40" rx="11" fill="url(#${id})"/><path d="M0 28 Q20 18 40 26 V40 H0Z" fill="#fff" opacity=".1"/><g transform="translate(8 8)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[C.icon]}"/></g></svg>`;
  }

  /* ---------- tables ---------- */
  function parseFields(s) {
    return s.split('|').map((p) => {
      const [k0, label, type0 = 'text', opts = ''] = p.split(':');
      const hide = k0[0] === '-', k = hide ? k0.slice(1) : k0;
      let type = type0, calc = false;
      if (type[0] === '=') { calc = true; type = type.slice(1) || 'text'; }
      const o = opts ? opts.split(',').map((x) => { const [v, tone] = x.split('~'); return { v: v.trim(), tone: tone || '' }; }) : [];
      return { k, label, type, opts: o, hide, calc };
    });
  }
  const T = {};
  Object.entries(C.tables).forEach(([name, t]) => {
    t.name = name;
    t.fields = parseFields(t.fields);
    t.calc = t.calc || {};
    t.statusF = t.fields.find((f) => f.type === 'status');
    t.dateF = t.fields.find((f) => f.k === t.dateKey) || t.fields.find((f) => f.type === 'date');
    t.titleF = t.fields.find((f) => f.k === t.title) || t.fields.find((f) => ['text', 'ref', 'sel'].includes(f.type) && !f.hide && !f.calc) || t.fields[0];
    t.icon = t.icon || 'list';
    t.one = t.one || t.label.replace(/s$/, '').toLowerCase();
    T[name] = t;
  });
  const F = (t, k) => t.fields.find((f) => f.k === k);
  const isNum = (f) => ['money', 'num', 'pct'].includes(f.type);
  const makeId = (t, n) => t.code ? `${t.code}-${1000 + n}` : String(n);

  /* ---------- storage ---------- */
  const KEY = 'nexora-demo-' + C.id;
  const VER = ENGINE_V + '.' + (C.v || 1);
  let S;
  function seedDB() {
    const db = {}, seq = {};
    Object.values(T).forEach((t) => {
      const stored = t.fields.filter((f) => !f.calc);
      db[t.name] = (t.rows || []).map((r, i) => {
        const o = { id: makeId(t, i + 1) };
        stored.forEach((f, j) => { o[f.k] = r[j] === undefined ? '' : rel(r[j]); });
        return o;
      });
      seq[t.name] = (t.rows || []).length;
    });
    return { db, seq };
  }
  function freshState(keep) { const { db, seq } = seedDB(); return { v: VER, day: todayS, touched: false, db, seq, role: keep ? keep.role : null, theme: keep ? keep.theme : null }; }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.v === VER && s.db) { S = (s.day !== todayS && !s.touched) ? freshState(s) : s; return; }
    } catch (e) { /* storage blocked */ }
    S = freshState();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  const touch = () => { S.touched = true; save(); };

  /* ---------- values, filters, aggregates ---------- */
  let role = null;
  const H = {
    get db() { return S.db; }, today: todayS, days, addDays, money, moneyS, num,
    me: () => (role ? role.person : ''),
    where: (tn, e) => where(tn, e),
    sum: (tn, fk, e) => agg(`sum:${tn}.${fk}${e ? '?' + e : ''}`),
    count: (tn, e) => agg(`count:${tn}${e ? '?' + e : ''}`),
    find: (tn, k, v) => S.db[tn].find((r) => r[k] == v),
    val: (tn, r, k) => val(T[tn], r, k)
  };
  function val(t, r, f) {
    if (typeof f === 'string') f = F(t, f) || { k: f };
    if (f.calc) { try { return t.calc[f.k](r, H); } catch (e) { return ''; } }
    return r[f.k];
  }
  function resolve(v, t, r) {
    v = String(v).trim();
    if (v === 'today') return todayS;
    if (v === 'me') return H.me();
    const m = v.match(/^d([+-]?\d+)$/); if (m) return addDays(+m[1]);
    if (v[0] === '@') return val(t, r, v.slice(1));
    return v;
  }
  function cond(t, r, c) {
    const m = c.match(/^([\w]+)\s*(<=|>=|!=|=|<|>|~)\s*(.*)$/);
    if (!m) return true;
    const [, k, op] = m;
    const a = k === 'id' ? r.id : val(t, r, k);
    const b = resolve(m[3], t, r);
    const blankA = a == null || a === '';
    if ((op === '=' || op === '!=') && String(b).includes(',')) { const inSet = String(b).split(',').includes(String(a)); return op === '=' ? inSet : !inSet; }
    if (op === '=') return blankA ? b === '' : String(a) === String(b);
    if (op === '!=') return blankA ? b !== '' : String(a) !== String(b);
    if (op === '~') return String(a || '').toLowerCase().includes(String(b).toLowerCase());
    if (blankA || b === '') return false;
    const na = Number(a), nb = Number(b);
    const n = !isNaN(na) && !isNaN(nb);
    const x = n ? na : String(a), y = n ? nb : String(b);
    return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
  }
  const matchExpr = (t, r, e) => !e || (typeof e === 'function' ? e(r, H) : e.split('&').every((c) => cond(t, r, c.trim())));
  const rowsOf = (tn) => { const sc = role && role.scope && role.scope[tn]; return sc ? S.db[tn].filter((r) => matchExpr(T[tn], r, sc)) : S.db[tn]; };
  const where = (tn, e) => rowsOf(tn).filter((r) => matchExpr(T[tn], r, e));
  function agg(spec) {
    if (typeof spec === 'function') return spec(H);
    const [kind, rest] = split1(spec, ':');
    const [path, e] = split1(rest, '?');
    const [tn, fk] = path.split('.');
    const rows = where(tn, e), t = T[tn];
    if (kind === 'count') return rows.length;
    const vals = rows.map((r) => Number(val(t, r, fk)) || 0);
    const s = vals.reduce((a, b) => a + b, 0);
    if (kind === 'sum') return s;
    if (kind === 'avg') return vals.length ? s / vals.length : 0;
    if (kind === 'max') return vals.length ? Math.max(...vals) : 0;
    if (kind === 'min') return vals.length ? Math.min(...vals) : 0;
    return 0;
  }
  function series(spec) {
    const [kind, rest] = split1(spec, ':');
    const [path, e] = split1(rest, '?');
    const p = path.split('.'), t = T[p[0]], rows = where(p[0], e);
    if (kind === 'month') {
      const out = [];
      for (let i = 5; i >= 0; i--) { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - i, 1); out.push([`${d.getFullYear()}-${pad(d.getMonth() + 1)}`, MON[d.getMonth()], 0]); }
      rows.forEach((r) => { const ym = String(val(t, r, p[1]) || '').slice(0, 7); const o = out.find((x) => x[0] === ym); if (o) o[2] += p[2] ? Number(val(t, r, p[2])) || 0 : 1; });
      return out.map((x) => [x[1], x[2]]);
    }
    const gf = F(t, p[1]); const map = new Map();
    const pre = gf && gf.opts.length && gf.type !== 'ref';
    if (pre) gf.opts.forEach((o) => map.set(o.v, 0));
    rows.forEach((r) => { const g = val(t, r, p[1]) || 'Other'; map.set(g, (map.get(g) || 0) + (kind === 'sum' ? Number(val(t, r, p[2])) || 0 : 1)); });
    let arr = [...map.entries()];
    if (!pre) arr.sort((a, b) => b[1] - a[1]);
    return arr.slice(0, 8);
  }

  /* ---------- formatting ---------- */
  const OK = /\b(paid|active|done|complete|completed|approved|in stock|delivered|available|closed|resolved|passed|present|won|ready|served|checked out|cleared|current|valid|fit|returned|hired|confirmed|attended|settled|good|operational|signed|in service|received|issued|on track|live|healthy|repaid|fulfilled|vacant|in date|compliant|reconciled|sold|harvested|dispatched|checked in|in use|placed)\b/i;
  const BAD = /\b(overdue|late|failed|fail|cancelled|canceled|rejected|lost|arrears|critical|absent|expired|out of stock|defaulted|urgent|high|breached|lapsed|blocked|faulty|stolen|missing|no show|declined|suspended|dead|written off|offline|damaged|severe)\b/i;
  const WARN = /\b(pending|due|draft|in progress|open|waiting|on leave|booked|partial|review|scheduled|low|awaiting|sent|quoted|new|preparing|in transit|under repair|maintenance|medium|follow up|interview|shortlisted|probation|occupied|grace|reserved|planned|ordered|on hold|expiring|renewal|serviced soon|negotiation|proposal)\b/i;
  function toneOf(f, v) {
    const o = f && f.opts.find((x) => x.v === v);
    if (o && o.tone) return o.tone;
    const s = String(v);
    return BAD.test(s) ? 'bad' : OK.test(s) ? 'ok' : WARN.test(s) ? 'warn' : 'info';
  }
  const pill = (v, tone) => `<span class="pill ${tone || 'info'}">${esc(v)}</span>`;
  function cell(t, r, f) {
    const v = val(t, r, f);
    if (v === '' || v == null) return '<span class="dim">—</span>';
    switch (f.type) {
      case 'money': return money(v);
      case 'num': return num(v);
      case 'pct': return Math.round(v) + '%';
      case 'date': return dfmt(v);
      case 'status': return pill(v, toneOf(f, v));
      case 'tag': return `<span class="tag">${esc(v)}</span>`;
      case 'stars': return '<span class="stars">' + '★'.repeat(+v) + '<i>' + '★'.repeat(Math.max(0, 5 - v)) + '</i></span>';
      case 'bar': return `<span class="mbar"><i style="width:${Math.max(0, Math.min(100, +v))}%"></i></span><span class="small">${Math.round(v)}%</span>`;
      default: return esc(v);
    }
  }

  /* ---------- roles & modules ---------- */
  C.roles = C.roles.map((x) => Array.isArray(x) ? { id: x[0], title: x[1], person: x[2], desc: x[3], scope: x[5] || null, mods: x[4].map((m) => { const [k, ro] = m.split(':'); return { k, ro: ro === 'r' }; }) } : x);
  function modMeta(k) {
    if (k === 'dash') return { k, type: 'dash', label: (C.dash && C.dash.label) || 'Dashboard', icon: 'home' };
    if (k === 'reports') return { k, type: 'reports', label: 'Reports', icon: 'chart' };
    if (C.modules && C.modules[k]) return Object.assign({ k }, C.modules[k]);
    if (T[k]) return { k, type: 'table', label: T[k].label, icon: T[k].icon, table: k };
    return null;
  }
  const myMods = () => role.mods.map((m) => Object.assign(modMeta(m.k) || {}, { ro: m.ro })).filter((m) => m.type);
  const canSee = (k) => role && role.mods.some((m) => m.k === k);

  /* ---------- ui state ---------- */
  let curMod = null;
  const ui = { q: {}, status: {}, filter: null, view: {}, sort: {}, cart: {}, ag: 0, rep: { table: null, range: 'month' } };
  const contactHref = '../contact.html?plan=' + encodeURIComponent(C.name + ' (' + C.tag + ') system');

  /* ---------- dialogs & toast ---------- */
  function dlg(html, wire, cls) {
    const d = document.createElement('dialog');
    d.className = cls || '';
    d.innerHTML = `<div class="dlg">${html}</div>`;
    document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    if (wire) wire(d);
    d.showModal();
    return d;
  }
  function toast(msg, bad) {
    const el = document.createElement('div');
    el.className = 'toast' + (bad ? ' bad' : '');
    el.setAttribute('role', 'status');
    el.innerHTML = ic(bad ? 'alert' : 'check', 16) + esc(msg);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    const r = document.documentElement;
    r.style.setProperty('--brand', C.color);
    r.style.setProperty('--brand2', C.color2);
    if (S.theme) r.dataset.theme = S.theme; else delete r.dataset.theme;
  }
  const isDark = () => S.theme ? S.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  function setFavicon() {
    let l = $('link[rel="icon"]');
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = 'data:image/svg+xml,' + encodeURIComponent(logo(64));
  }

  /* ---------- login ---------- */
  function login() {
    role = null;
    document.title = `${C.name} · ${C.tag} | Live demo by Nexora Digital`;
    $('#app').innerHTML = `<div class="login">
      <section class="login-brand">
        <div class="lb-in">
          <div class="lb-logo">${logo(58)}<div><b>${esc(C.name)}</b><span>${esc(C.tag)}</span></div></div>
          <h1>${esc(C.headline || C.blurb)}</h1>
          <ul class="ticks">${(C.features || []).map((f) => `<li>${ic('check', 16)}${esc(f)}</li>`).join('')}</ul>
          <p class="lb-org">${ic('building', 16)}<span>Sample organisation: <b>${esc(C.org.name)}</b>, ${esc(C.org.place)}</span></p>
        </div>
        <p class="lb-foot">Built by <a href="../index.html">Nexora Digital</a> · Harare, Zimbabwe</p>
      </section>
      <section class="login-pick"><div class="pick-in">
        <span class="demo-tag">${ic('zap', 14)} Live demo</span>
        <h2>Sign in as…</h2>
        <p class="muted">Each role sees its own screens and permissions. This demo runs on sample data in your browser, so try anything.</p>
        <div class="roles">${C.roles.map((r) => `<button class="role" data-role="${r.id}">
          <span class="av">${initials(r.person)}</span>
          <span class="rt"><b>${esc(r.title)}</b><small>${esc(r.person)}</small><em>${esc(r.desc)}</em></span>${ic('arrow', 18)}</button>`).join('')}</div>
        <div class="pick-cta"><a class="btn" href="${contactHref}">${ic('zap', 16)} Get this system for your business</a><a class="btn ghost" href="./">See all demos</a></div>
      </div></section></div>`;
    $$('[data-role]').forEach((b) => b.addEventListener('click', () => {
      role = C.roles.find((r) => r.id === b.dataset.role);
      S.role = role.id; save();
      shell(); go(role.mods[0].k);
    }));
  }

  /* ---------- app shell ---------- */
  function alertsList() {
    return ((C.dash && C.dash.alerts) || []).map((a) => {
      const [path, e] = split1(a[0], '?');
      const n = where(path, e).length;
      return { table: path, expr: e, n, text: a[1].replace('{n}', n).replace('{s}', n === 1 ? '' : 's'), tone: a[2] || 'warn' };
    }).filter((a) => a.n > 0);
  }
  function shell() {
    document.title = `${C.name} · ${C.org.name}`;
    $('#app').innerHTML = `<div class="app">
      <aside class="side">
        <div class="side-brand">${logo(36)}<div><b>${esc(C.name)}</b><span>${esc(C.org.name)}</span></div></div>
        <nav class="nav" aria-label="Main">${myMods().map((m) => `<button data-go="${m.k}">${ic(m.icon)}<span>${esc(m.label)}</span></button>`).join('')}</nav>
        <div class="side-foot">
          <div class="me"><span class="av">${initials(role.person)}</span><div><b>${esc(role.person)}</b><small>${esc(role.title)}</small></div></div>
          <button class="sf" data-switch>${ic('logout', 16)} Switch role</button>
          <button class="sf" data-reset>${ic('refresh', 16)} Reset demo data</button>
          <a class="sf credit" href="../index.html">Built by <b>Nexora Digital</b></a>
        </div>
      </aside>
      <div class="main">
        <header class="bar">
          <div class="bar-t"><span class="crumb"><span class="co">${esc(C.org.name)} ·</span> <span class="demo-pill">Demo</span></span><h1 id="title"></h1></div>
          <div class="bar-r">
            <button class="iconbtn" data-bell aria-label="Alerts">${ic('bell')}<i id="bellN" hidden></i></button>
            <button class="iconbtn" data-theme aria-label="Switch light or dark">${ic(isDark() ? 'sun' : 'moon')}</button>
            <button class="iconbtn mob" data-switch aria-label="Switch role">${ic('logout')}</button>
            <a class="btn cta" href="${contactHref}">${ic('zap', 16)}<span>Get this system</span></a>
          </div>
        </header>
        <main id="view" tabindex="-1"></main>
        <div id="printdoc" class="print-only"></div>
      </div></div>`;
    $$('[data-go]').forEach((b) => b.addEventListener('click', () => { ui.filter = null; go(b.dataset.go); }));
    $$('[data-switch]').forEach((b) => b.addEventListener('click', () => { S.role = null; save(); history.replaceState(null, '', location.pathname); login(); }));
    $('[data-reset]').addEventListener('click', () => dlg(`<div class="dh"><h2>Reset demo data?</h2><button class="x" data-close aria-label="Close">${ic('x')}</button></div><p class="muted">Every change you made goes back to the original sample data.</p><div class="dact"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="doReset">Reset data</button></div>`,
      (d) => $('#doReset', d).addEventListener('click', () => { const keep = S; S = freshState(keep); save(); d.close(); toast('Sample data restored'); render(); })));
    $('[data-theme]').addEventListener('click', (e) => { S.theme = isDark() ? 'light' : 'dark'; save(); applyTheme(); e.currentTarget.innerHTML = ic(isDark() ? 'sun' : 'moon'); });
    $('[data-bell]').addEventListener('click', () => { if (canSee('dash')) go('dash'); else toast(alertsList().length ? alertsList().map((a) => a.text).join(' · ') : 'No alerts right now'); });
  }
  function go(k) {
    if (!canSee(k)) k = role.mods[0].k;
    curMod = k;
    if (location.hash.slice(1) !== k) history.replaceState(null, '', '#' + k);
    $$('[data-go]').forEach((b) => b.setAttribute('aria-current', b.dataset.go === k ? 'page' : 'false'));
    const a = $(`[data-go="${k}"]`); if (a && a.scrollIntoView && innerWidth < 900) a.scrollIntoView({ inline: 'center', block: 'nearest' });
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    const m = myMods().find((x) => x.k === curMod);
    $('#title').textContent = m.label;
    const n = alertsList().length, bn = $('#bellN');
    bn.hidden = !n; bn.textContent = n;
    const v = $('#view');
    if (m.type === 'dash') viewDash(v);
    else if (m.type === 'table') viewTable(v, m);
    else if (m.type === 'pos') viewPOS(v, m);
    else if (m.type === 'agenda') viewAgenda(v, m);
    else if (m.type === 'reports') viewReports(v);
  }

  /* ---------- dashboard ---------- */
  function chartHTML(c) {
    const [title, spec, kind] = c;
    const s = series(spec), max = Math.max(1, ...s.map((x) => Math.abs(x[1])));
    if (spec.startsWith('month:')) {
      return `<div class="card chart"><h3>${esc(title)}</h3><div class="cols">${s.map(([l, v], i) => `<div class="col${i === s.length - 1 ? ' now' : ''}"><span class="cv">${fmtV(v, kind)}</span><div class="cb"><i style="height:${Math.max(2, (v / max) * 100)}%"></i></div><span class="cl">${esc(l)}</span></div>`).join('')}</div></div>`;
    }
    return `<div class="card chart"><h3>${esc(title)}</h3><div class="bars">${s.map(([l, v]) => `<div class="brow"><span class="bl">${esc(l)}</span><span class="bt"><i style="width:${Math.max(1.5, (v / max) * 100)}%"></i></span><span class="bv">${fmtV(v, kind)}</span></div>`).join('') || '<p class="muted small">No data yet</p>'}</div></div>`;
  }
  function miniTable(t, rows, cols) {
    const fs = (cols ? cols.map((k) => F(t, k)) : t.fields.filter((f) => !f.hide).slice(0, 4)).filter(Boolean);
    if (!rows.length) return '<p class="muted small empty-s">Nothing to show yet.</p>';
    return `<div class="tw mini"><table><thead><tr>${fs.map((f) => `<th class="${isNum(f) ? 'n' : ''}">${esc(f.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr data-open="${t.name}" data-id="${esc(r.id)}" tabindex="0">${fs.map((f) => `<td class="${isNum(f) ? 'n' : ''}" data-label="${esc(f.label)}">${cell(t, r, f)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function viewDash(v) {
    const d = C.dash || {};
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const first = role.person.replace(/^(Dr|Mr|Mrs|Ms|Pastor|Rev|Eng)\.?\s+/i, '').split(' ')[0];
    const al = alertsList();
    v.innerHTML = `<div class="hello"><div><h2>${greet}, ${esc(first)}</h2><p class="muted">${WD[TODAY.getDay()]} ${dfmt(todayS)} · here is how ${esc(C.org.name)} is doing today.</p></div>
        ${d.quick ? `<div class="quick">${d.quick.filter((q) => canSee(q[1])).map((q) => `<button class="btn ${q[2] ? '' : 'ghost'}" data-quick="${q[1]}">${ic('plus', 16)}${esc(q[0])}</button>`).join('')}</div>` : ''}</div>
      <div class="kpis">${(d.kpis || []).map(([label, spec, kind, sub]) => `<div class="kpi"><span>${esc(label)}</span><b>${fmtV(agg(spec), kind)}</b>${sub ? `<small>${esc(typeof sub === 'function' ? sub(H) : sub)}</small>` : ''}</div>`).join('')}</div>
      ${al.length ? `<div class="card alerts"><h3>${ic('bell', 16)} Needs attention</h3>${al.map((a) => `<button class="al ${a.tone}" data-al="${esc(a.table)}" data-ex="${esc(a.expr)}" data-tx="${esc(a.text)}"><span class="dot ${a.tone}"></span><span>${esc(a.text)}</span>${canSee(a.table) ? ic('chevR', 16) : ''}</button>`).join('')}</div>` : `<div class="card alerts calm">${ic('check', 18)} All clear. Nothing needs attention right now.</div>`}
      <div class="charts">${(d.charts || []).map(chartHTML).join('')}</div>
      ${(d.recent || []).filter((x) => canSee(x[0])).map(([tn, title, n, cols]) => { const t = T[tn]; const rows = sorted(t, rowsOf(tn).slice()).slice(0, n || 5); return `<div class="card"><div class="cardhead"><h3>${esc(title)}</h3><button class="link" data-go2="${tn}">View all ${ic('chevR', 14)}</button></div>${miniTable(t, rows, cols)}</div>`; }).join('')}`;
    $$('[data-al]', v).forEach((b) => b.addEventListener('click', () => { if (!canSee(b.dataset.al)) return; ui.filter = { table: b.dataset.al, expr: b.dataset.ex, text: b.dataset.tx }; ui.status[b.dataset.al] = 'All'; ui.view[b.dataset.al] = 'list'; go(b.dataset.al); }));
    $$('[data-go2]', v).forEach((b) => b.addEventListener('click', () => go(b.dataset.go2)));
    $$('[data-quick]', v).forEach((b) => b.addEventListener('click', () => { const m = modMeta(b.dataset.quick); if (m.type === 'table') form(T[m.table], null); else go(m.k); }));
    wireOpen(v);
  }
  function wireOpen(root) {
    $$('[data-open]', root).forEach((tr) => {
      const open = () => { const t = T[tr.dataset.open]; const r = S.db[t.name].find((x) => String(x.id) === tr.dataset.id); if (r) detail(t, r, !canEdit(t.name)); };
      tr.addEventListener('click', open);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    });
  }
  const canEdit = (tn) => role.mods.some((m) => m.k === tn && !m.ro) || Object.values(C.modules || {}).some((m) => (m.table === tn || m.sales === tn) && role.mods.some((x) => C.modules[x.k] === m && !x.ro));

  /* ---------- table module ---------- */
  function sorted(t, rows) {
    const s = ui.sort[t.name];
    const k = s ? s.k : t.dateF ? t.dateF.k : null;
    const dir = s ? s.dir : -1;
    if (!k) return rows;
    const f = F(t, k) || { k };
    return rows.sort((a, b) => {
      let x = k === 'id' ? a.id : val(t, a, f), y = k === 'id' ? b.id : val(t, b, f);
      const nx = Number(x), ny = Number(y);
      if (x !== '' && y !== '' && !isNaN(nx) && !isNaN(ny)) return (nx - ny) * dir;
      return String(x || '').localeCompare(String(y || '')) * dir;
    });
  }
  function rowsFor(t) {
    let rows = rowsOf(t.name).slice();
    if (ui.filter && ui.filter.table === t.name) rows = rows.filter((r) => matchExpr(t, r, ui.filter.expr));
    const st = ui.status[t.name];
    if (st && st !== 'All' && t.statusF && ui.view[t.name] !== 'board') rows = rows.filter((r) => val(t, r, t.statusF) === st);
    const q = (ui.q[t.name] || '').toLowerCase().trim();
    if (q) rows = rows.filter((r) => String(r.id).toLowerCase().includes(q) || t.fields.some((f) => String(val(t, r, f) == null ? '' : val(t, r, f)).toLowerCase().includes(q)));
    return sorted(t, rows);
  }
  function viewTable(v, m) {
    const t = T[m.table];
    const ro = m.ro;
    const view = ui.view[t.name] || (t.board === 'default' ? 'board' : 'list');
    ui.view[t.name] = view;
    const st = ui.status[t.name] || 'All';
    v.innerHTML = `<div class="phead"><div><p class="muted">${esc(t.desc || '')}</p></div>
        <div class="acts">
          ${t.board ? `<div class="seg" role="group" aria-label="View"><button data-view="list" aria-pressed="${view === 'list'}">${ic('list', 16)} List</button><button data-view="board" aria-pressed="${view === 'board'}">${ic('kanban', 16)} Board</button></div>` : ''}
          <button class="btn ghost" data-csv>${ic('download', 16)}<span>CSV</span></button>
          ${ro ? '<span class="pill grey">View only</span>' : `<button class="btn" data-add>${ic('plus', 16)} ${esc(t.addLabel || 'Add ' + t.one)}</button>`}
        </div></div>
      ${t.stats ? `<div class="kpis sm">${t.stats.map(([l, s, k]) => `<div class="kpi"><span>${esc(l)}</span><b>${fmtV(agg(s), k)}</b></div>`).join('')}</div>` : ''}
      <div class="toolbar">
        <label class="search">${ic('search', 16)}<input type="search" placeholder="Search ${esc(t.label.toLowerCase())}" value="${esc(ui.q[t.name] || '')}" aria-label="Search"></label>
        ${t.statusF && view === 'list' ? `<div class="chips">${['All', ...t.statusF.opts.map((o) => o.v)].map((o) => `<button class="chip" data-st="${esc(o)}" aria-pressed="${o === st}">${esc(o)}<i>${o === 'All' ? rowsOf(t.name).length : rowsOf(t.name).filter((r) => val(t, r, t.statusF) === o).length}</i></button>`).join('')}</div>` : ''}
      </div>
      ${ui.filter && ui.filter.table === t.name ? `<div class="filterbar">${ic('bell', 14)} Showing: <b>${esc(ui.filter.text)}</b><button class="link" data-clear>Show everything</button></div>` : ''}
      <div id="rows"></div>`;
    const draw = () => {
      const rows = rowsFor(t);
      $('#rows', v).innerHTML = view === 'board' ? boardHTML(t, rows, ro) : listHTML(t, rows);
      wireOpen($('#rows', v));
      $$('[data-sort]', v).forEach((th) => th.addEventListener('click', () => { const k = th.dataset.sort; const s = ui.sort[t.name]; ui.sort[t.name] = { k, dir: s && s.k === k ? -s.dir : (t.fields.find((f) => f.k === k) && isNum(F(t, k)) ? -1 : 1) }; draw(); }));
      $$('[data-next]', v).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const r = S.db[t.name].find((x) => String(x.id) === b.dataset.next); r[t.statusF.k] = b.dataset.to; if (t.onStatus) t.onStatus(r, H); touch(); toast(`${val(t, r, t.titleF)} moved to ${b.dataset.to}`); draw(); }));
    };
    draw();
    $('.search input', v).addEventListener('input', (e) => { ui.q[t.name] = e.target.value; draw(); });
    $$('[data-st]', v).forEach((b) => b.addEventListener('click', () => { ui.status[t.name] = b.dataset.st; viewTable(v, m); }));
    $$('[data-view]', v).forEach((b) => b.addEventListener('click', () => { ui.view[t.name] = b.dataset.view; viewTable(v, m); }));
    const clr = $('[data-clear]', v); if (clr) clr.addEventListener('click', () => { ui.filter = null; viewTable(v, m); });
    const add = $('[data-add]', v); if (add) add.addEventListener('click', () => form(t, null));
    $('[data-csv]', v).addEventListener('click', () => csv(t, rowsFor(t)));
  }
  function listHTML(t, rows) {
    const cols = t.fields.filter((f) => !f.hide);
    if (!rows.length) return `<div class="card empty">${ic('search', 28)}<p>No ${esc(t.label.toLowerCase())} match. Try another search or filter.</p></div>`;
    const sum = cols.map((f) => f.type === 'money' && !t.noTotal ? rows.reduce((a, r) => a + (Number(val(t, r, f)) || 0), 0) : null);
    const s = ui.sort[t.name];
    const arrow = (k) => s && s.k === k ? (s.dir > 0 ? ' ↑' : ' ↓') : '';
    return `<div class="tw"><table class="rt"><thead><tr>${t.code ? `<th data-sort="id">Ref${arrow('id')}</th>` : ''}${cols.map((f) => `<th class="${isNum(f) ? 'n' : ''}" data-sort="${f.k}">${esc(f.label)}${arrow(f.k)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr data-open="${t.name}" data-id="${esc(r.id)}" tabindex="0">${t.code ? `<td class="ref" data-label="Ref">${esc(r.id)}</td>` : ''}${cols.map((f, i) => `<td class="${isNum(f) ? 'n' : ''}${f === t.titleF ? ' tt' : ''}" data-label="${esc(f.label)}">${cell(t, r, f)}</td>`).join('')}</tr>`).join('')}</tbody>
      ${sum.some((x) => x !== null) ? `<tfoot><tr>${t.code ? '<td></td>' : ''}${cols.map((f, i) => `<td class="${isNum(f) ? 'n' : ''}">${i === 0 && sum[0] === null ? `<b>${rows.length} total</b>` : sum[i] !== null ? `<b>${money(sum[i])}</b>` : ''}</td>`).join('')}</tr></tfoot>` : ''}
      </table></div><p class="muted small count">${rows.length} of ${rowsOf(t.name).length} ${esc(t.label.toLowerCase())}</p>`;
  }
  function boardHTML(t, rows, ro) {
    const opts = t.statusF.opts;
    const cardF = (t.card || t.fields.filter((f) => !f.hide && f !== t.titleF && f !== t.statusF).slice(0, 3).map((f) => f.k)).map((k) => F(t, k)).filter(Boolean);
    return `<div class="board">${opts.map((o, i) => {
      const rs = rows.filter((r) => val(t, r, t.statusF) === o.v);
      const nx = opts[i + 1];
      return `<section class="lane"><div class="lane-h"><span class="dot ${o.tone || toneOf(t.statusF, o.v)}"></span>${esc(o.v)}<b>${rs.length}</b></div>
        ${rs.map((r) => `<article class="bcard" data-open="${t.name}" data-id="${esc(r.id)}" tabindex="0">
          ${t.code ? `<span class="ref">${esc(r.id)}</span>` : ''}<b>${esc(val(t, r, t.titleF))}</b>
          ${cardF.map((f) => { const x = val(t, r, f); return x === '' || x == null ? '' : `<span class="bf">${esc(f.label)}: ${cell(t, r, f)}</span>`; }).join('')}
          ${!ro && nx ? `<button class="next" data-next="${esc(r.id)}" data-to="${esc(nx.v)}">${esc(nx.v)} ${ic('arrow', 14)}</button>` : ''}
        </article>`).join('') || '<p class="lane-empty">Nothing here</p>'}
      </section>`;
    }).join('')}</div>`;
  }

  /* ---------- record detail ---------- */
  function detail(t, r, ro) {
    const acts = (t.actions || []).filter((a) => !ro && matchExpr(t, r, a[2]));
    const rel2 = (t.related || []).map(([tn, fk, title, cols]) => {
      const rt = T[tn]; const key = val(t, r, t.titleF);
      const rows = sorted(rt, rowsOf(tn).filter((x) => x[fk] === key || x[fk] === r.id)).slice(0, 8);
      return `<div class="rel"><h3>${esc(title)} <span class="muted small">(${rows.length})</span></h3>${miniTable(rt, rows, cols)}</div>`;
    }).join('');
    dlg(`<div class="dh"><div><span class="ref">${t.code ? esc(r.id) : esc(t.label)}</span><h2>${esc(val(t, r, t.titleF))}</h2></div>
        <div class="inline">${t.statusF ? pill(val(t, r, t.statusF), toneOf(t.statusF, val(t, r, t.statusF))) : ''}<button class="x" data-close aria-label="Close">${ic('x')}</button></div></div>
      <dl class="dl">${t.fields.filter((f) => f !== t.titleF).map((f) => `<div class="${f.type === 'area' ? 'wide' : ''}"><dt>${esc(f.label)}</dt><dd>${cell(t, r, f)}</dd></div>`).join('')}</dl>
      ${rel2}
      <div class="dact">${acts.map((a, i) => `<button class="btn" data-act="${i}">${esc(a[0])}</button>`).join('')}
        ${t.print ? `<button class="btn ghost" data-print>${ic('printer', 16)} ${esc(t.print)}</button>` : ''}
        ${!ro ? `<button class="btn ghost" data-edit>Edit</button><button class="btn ghost danger" data-del>Delete</button>` : ''}</div>`,
    (d) => {
      $$('[data-act]', d).forEach((b) => b.addEventListener('click', () => {
        const a = acts[+b.dataset.act];
        if (typeof a[1] === 'function') a[1](r, H);
        else a[1].split('&').forEach((p) => { const [k, x] = split1(p, '='); const rv = resolve(x, t, r); const f = F(t, k); r[k] = f && isNum(f) ? Number(rv) || 0 : rv; });
        if (t.onStatus) t.onStatus(r, H);
        touch(); d.close(); toast(a[3] || `${a[0]}: done`); render();
      }));
      const p = $('[data-print]', d); if (p) p.addEventListener('click', () => printRecord(t, r));
      const e = $('[data-edit]', d); if (e) e.addEventListener('click', () => { d.close(); form(t, r); });
      const del = $('[data-del]', d);
      if (del) del.addEventListener('click', () => {
        if (del.dataset.sure) { S.db[t.name] = S.db[t.name].filter((x) => x !== r); touch(); d.close(); toast(`${t.one[0].toUpperCase() + t.one.slice(1)} deleted`); render(); return; }
        del.dataset.sure = '1'; del.textContent = 'Tap again to delete'; del.classList.add('sure');
      });
      wireOpen(d);
    }, 'wide');
  }

  /* ---------- add / edit form ---------- */
  function optionsFor(f) {
    if (f.type === 'ref') { const [tn, fk] = f.opts[0].v.split('.'); return S.db[tn].map((r) => val(T[tn], r, fk || T[tn].titleF.k)); }
    return f.opts.map((o) => o.v);
  }
  function input(f, v, req) {
    const n = `name="${f.k}"`, rq = req ? ' required' : '';
    const vv = esc(v == null ? '' : v);
    let el;
    if (['sel', 'status', 'ref'].includes(f.type)) el = `<select ${n}${rq}>${f.type === 'ref' && !req ? '<option value=""></option>' : ''}${optionsFor(f).map((o) => `<option${String(o) === String(v) ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    else if (f.type === 'area') el = `<textarea ${n} rows="3"${rq}>${vv}</textarea>`;
    else if (f.type === 'money' || f.type === 'num' || f.type === 'pct' || f.type === 'bar') el = `<input ${n} type="number" step="any" inputmode="decimal" value="${vv}"${rq}>`;
    else if (f.type === 'stars') el = `<select ${n}>${[5, 4, 3, 2, 1].map((x) => `<option value="${x}"${+v === x ? ' selected' : ''}>${'★'.repeat(x)}</option>`).join('')}</select>`;
    else el = `<input ${n} type="${{ date: 'date', time: 'time', email: 'email', tel: 'tel' }[f.type] || 'text'}" value="${vv}"${rq}${f.type === 'tel' ? ' inputmode="tel"' : ''}>`;
    return `<label class="${f.type === 'area' ? 'wide' : ''}"><span>${esc(f.label)}</span>${el}</label>`;
  }
  function dflt(t, f) {
    const d = t.defaults && t.defaults[f.k];
    if (d !== undefined) return resolve(d, t, {});
    if (f.type === 'status' || f.type === 'sel' || f.type === 'stars') return f.type === 'stars' ? 5 : (f.opts[0] || {}).v;
    if (f.type === 'ref') return optionsFor(f)[0];
    if (f === t.dateF) return todayS;
    return '';
  }
  function form(t, r) {
    const isNew = !r;
    const fs = t.fields.filter((f) => !f.calc && !(t.noForm || []).includes(f.k));
    dlg(`<form class="frm" novalidate><div class="dh"><h2>${isNew ? esc(t.addLabel || 'Add ' + t.one) : 'Edit ' + esc(t.one)}</h2><button type="button" class="x" data-close aria-label="Close">${ic('x')}</button></div>
      <div class="fgrid">${fs.map((f, i) => input(f, r ? r[f.k] : dflt(t, f), i === 0)).join('')}</div>
      <p class="err" hidden></p>
      <div class="dact"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">${isNew ? 'Save' : 'Save changes'}</button></div></form>`,
    (d) => $('form', d).addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), vals = {};
      fs.forEach((f) => { const x = fd.get(f.k); vals[f.k] = isNum(f) || f.type === 'stars' ? (x === '' || x == null ? '' : Number(x)) : (x == null ? '' : String(x).trim()); });
      if (vals[fs[0].k] === '') { const er = $('.err', d); er.hidden = false; er.textContent = `${fs[0].label} is needed.`; return; }
      if (isNew) {
        S.seq[t.name] = (S.seq[t.name] || 0) + 1;
        const o = Object.assign({ id: makeId(t, S.seq[t.name]) }, vals);
        S.db[t.name].unshift(o);
        if (t.onAdd) t.onAdd(o, H);
      } else { Object.assign(r, vals); if (t.onStatus) t.onStatus(r, H); }
      touch(); d.close();
      toast(isNew ? `${t.one[0].toUpperCase() + t.one.slice(1)} saved` : 'Changes saved');
      render();
    }), 'wide');
  }

  /* ---------- printing & CSV ---------- */
  const printHead = (title) => `<div class="ph">${logo(44)}<div><b>${esc(C.org.name)}</b><span>${esc(C.org.place)}${C.org.phone ? ' · ' + esc(C.org.phone) : ''}</span></div><h2>${esc(title)}</h2></div>`;
  const printFoot = () => `<p class="pf">Printed ${dfmt(todayS)} from ${esc(C.name)} · Built by Nexora Digital · nexoradigitalzim.com</p>`;
  function doPrint(html) {
    const p = $('#printdoc'); p.innerHTML = html;
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); p.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => { window.print(); setTimeout(done, 500); }, 50);
  }
  function printRecord(t, r) {
    doPrint(`${printHead(t.print.replace(/^Print\s+/i, ''))}<div class="pmeta"><span>Ref <b>${esc(r.id)}</b></span><span>Date <b>${dfmt(t.dateF ? val(t, r, t.dateF) : todayS)}</b></span></div>
      <table class="ptab"><tbody>${t.fields.map((f) => `<tr><th>${esc(f.label)}</th><td>${cell(t, r, f)}</td></tr>`).join('')}</tbody></table>${printFoot()}`);
  }
  function csv(t, rows) {
    const fs = t.fields;
    const q = (x) => `"${String(x == null ? '' : x).replace(/"/g, '""')}"`;
    const lines = [['Ref', ...fs.map((f) => f.label)].map(q).join(','), ...rows.map((r) => [r.id, ...fs.map((f) => val(t, r, f))].map(q).join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${C.id}-${t.name}-${todayS}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    toast(`${rows.length} rows downloaded`);
  }

  /* ---------- point of sale ---------- */
  function viewPOS(v, m) {
    const t = T[m.items], st = T[m.sales];
    const cart = ui.cart[m.k] = ui.cart[m.k] || {};
    const cats = m.cat ? ['All', ...new Set(S.db[t.name].map((r) => r[m.cat]))] : null;
    const cat = ui.cart[m.k + ':cat'] || 'All';
    v.innerHTML = `<div class="pos"><section>
        <div class="toolbar"><label class="search">${ic('search', 16)}<input type="search" placeholder="Search or scan a code" aria-label="Search products" value="${esc(ui.q[m.k] || '')}"></label>
        ${cats ? `<div class="chips">${cats.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join('')}</div>` : ''}</div>
        <div class="pgrid" id="pgrid"></div></section>
      <aside class="card cart" id="cart"></aside></div>`;
    const drawGrid = () => {
      const q = (ui.q[m.k] || '').toLowerCase();
      const items = S.db[t.name].filter((r) => (cat === 'All' || r[m.cat] === cat) && (!q || JSON.stringify(r).toLowerCase().includes(q)));
      $('#pgrid', v).innerHTML = items.map((r) => {
        const stock = m.stock ? Number(r[m.stock]) : Infinity;
        const low = m.reorder ? stock <= Number(r[m.reorder]) : stock <= 5;
        return `<button class="pitem" data-pi="${esc(r.id)}" ${stock <= 0 ? 'disabled' : ''}>
          <span class="pcat">${esc(m.cat ? r[m.cat] : '')}</span><b>${esc(r[m.name])}</b>
          <span class="pp">${money(r[m.price])}</span>
          ${m.stock ? `<span class="ps ${stock <= 0 ? 'bad' : low ? 'warn' : ''}">${stock <= 0 ? 'Out of stock' : num(stock) + ' in stock'}</span>` : ''}</button>`;
      }).join('') || '<p class="muted">Nothing matches.</p>';
      $$('[data-pi]', v).forEach((b) => b.addEventListener('click', () => {
        const r = S.db[t.name].find((x) => String(x.id) === b.dataset.pi);
        const q2 = (cart[r.id] || 0) + 1;
        if (m.stock && q2 > Number(r[m.stock])) return toast(`Only ${r[m.stock]} in stock`, true);
        cart[r.id] = q2; drawCart();
      }));
    };
    const lines = () => Object.entries(cart).map(([id, q]) => ({ r: S.db[t.name].find((x) => String(x.id) === id), q })).filter((l) => l.r);
    const drawCart = () => {
      const ls = lines(); const total = ls.reduce((a, l) => a + l.q * Number(l.r[m.price]), 0);
      $('#cart', v).innerHTML = `<div class="cardhead"><h3>${esc(m.cartTitle || 'Current sale')}</h3>${ls.length ? '<button class="link" data-clr>Clear</button>' : ''}</div>
        ${ls.length ? ls.map((l) => `<div class="cline"><div><b>${esc(l.r[m.name])}</b><small>${money(l.r[m.price])} each</small></div>
          <div class="qty"><button data-dq="${esc(l.r.id)}" aria-label="One less">−</button><b>${l.q}</b><button data-iq="${esc(l.r.id)}" aria-label="One more">+</button></div><span class="lt">${money(l.q * l.r[m.price])}</span></div>`).join('') : `<div class="cart-empty">${ic('cart', 30)}<p>Tap items to add them</p></div>`}
        <div class="ctotal"><span>Total</span><b>${money(total)}</b></div>
        ${m.extra ? `<label><span>${esc(m.extra.label)}</span><select id="pxtra">${m.extra.opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>` : ''}
        <label><span>Customer (optional)</span><input id="pcust" placeholder="Name or phone"></label>
        <div class="methods" role="radiogroup" aria-label="Payment method">${(m.methods || ['Cash', 'EcoCash', 'Card']).map((x, i) => `<label class="mth"><input type="radio" name="pm" value="${esc(x)}" ${i ? '' : 'checked'}><span>${esc(x)}</span></label>`).join('')}</div>
        <button class="btn big" data-pay ${ls.length ? '' : 'disabled'}>${ic('check', 18)} ${esc(m.payLabel || 'Complete sale')} · ${money(total)}</button>`;
      const c = $('#cart', v);
      $$('[data-iq]', c).forEach((b) => b.addEventListener('click', () => { const r = S.db[t.name].find((x) => String(x.id) === b.dataset.iq); if (m.stock && cart[r.id] + 1 > Number(r[m.stock])) return toast(`Only ${r[m.stock]} in stock`, true); cart[r.id]++; drawCart(); }));
      $$('[data-dq]', c).forEach((b) => b.addEventListener('click', () => { cart[b.dataset.dq]--; if (cart[b.dataset.dq] <= 0) delete cart[b.dataset.dq]; drawCart(); }));
      const clr = $('[data-clr]', c); if (clr) clr.addEventListener('click', () => { Object.keys(cart).forEach((k) => delete cart[k]); drawCart(); });
      const pay = $('[data-pay]', c);
      pay.addEventListener('click', () => {
        const method = ($('input[name="pm"]:checked', c) || {}).value;
        const cust = $('#pcust', c).value.trim();
        const extra = m.extra ? $('#pxtra', c).value : '';
        S.seq[st.name] = (S.seq[st.name] || 0) + 1;
        const row = { id: makeId(st, S.seq[st.name]) };
        const data = { date: todayS, time: nowT(), items: ls.map((l) => `${l.q}× ${l.r[m.name]}`).join(', '), qty: ls.reduce((a, l) => a + l.q, 0), total, method, cashier: role.person, customer: cust || 'Walk-in' };
        if (m.extra) data[m.extra.k] = extra;
        st.fields.forEach((f) => { if (!f.calc) row[f.k] = f.k in data ? data[f.k] : f.type === 'status' ? (m.saleStatus || f.opts[0].v) : ''; });
        S.db[st.name].unshift(row);
        if (m.stock) ls.forEach((l) => { l.r[m.stock] = Number(l.r[m.stock]) - l.q; });
        touch();
        Object.keys(cart).forEach((k) => delete cart[k]);
        drawGrid(); drawCart(); render2Bell();
        dlg(`<div class="receipt"><div class="rc-h">${logo(40)}<b>${esc(C.org.name)}</b><small>${esc(C.org.place)}</small></div>
          <p class="rc-m"><span>${esc(row.id)}</span><span>${dfmt(todayS)} ${data.time}</span></p>
          ${ls.map((l) => `<p class="rc-l"><span>${l.q} × ${esc(l.r[m.name])}</span><span>${money(l.q * l.r[m.price])}</span></p>`).join('')}
          <p class="rc-t"><span>Total</span><span>${money(total)}</span></p><p class="rc-m"><span>Paid by ${esc(method)}</span><span>${esc(role.person)}</span></p>
          ${m.extra ? `<p class="rc-m"><span>${esc(m.extra.label)}</span><span>${esc(extra)}</span></p>` : ''}
          <p class="rc-f">Thank you! · Powered by ${esc(C.name)}</p></div>
          <div class="dact"><button class="btn ghost" data-rp>${ic('printer', 16)} Print receipt</button><button class="btn" data-close>New sale</button></div>`,
        (d) => $('[data-rp]', d).addEventListener('click', () => doPrint($('.receipt', d).outerHTML)), 'narrow');
      });
    };
    drawGrid(); drawCart();
    $('.search input', v).addEventListener('input', (e) => { ui.q[m.k] = e.target.value; drawGrid(); });
    $$('[data-cat]', v).forEach((b) => b.addEventListener('click', () => { ui.cart[m.k + ':cat'] = b.dataset.cat; viewPOS(v, m); }));
  }
  function render2Bell() { const n = alertsList().length, bn = $('#bellN'); if (bn) { bn.hidden = !n; bn.textContent = n; } }

  /* ---------- agenda ---------- */
  function viewAgenda(v, m) {
    const t = T[m.table], n = m.days || 7;
    const ds = Array.from({ length: n }, (_, i) => addDays(i + ui.ag));
    const ro = m.ro;
    v.innerHTML = `<div class="phead"><div class="inline"><button class="iconbtn" data-ag="-${n}" aria-label="Earlier">${ic('chevL')}</button><b>${dfmt(ds[0])} – ${dfmt(ds[n - 1])}</b><button class="iconbtn" data-ag="${n}" aria-label="Later">${ic('chevR')}</button>${ui.ag ? '<button class="link" data-ag="0">Today</button>' : ''}</div>
      ${ro ? '' : `<button class="btn" data-add>${ic('plus', 16)} ${esc(t.addLabel || 'Add ' + t.one)}</button>`}</div>
      <div class="agenda">${ds.map((d) => {
        const items = rowsOf(t.name).filter((r) => r[m.date] === d).sort((a, b) => String(a[m.time] || '').localeCompare(String(b[m.time] || '')));
        const dd = parseD(d);
        return `<section class="day${d === todayS ? ' today' : ''}"><h3><span>${WD[dd.getDay()]}</span><b>${dd.getDate()}</b><small>${MON[dd.getMonth()]}</small>${items.length ? `<i>${items.length}</i>` : ''}</h3>
          ${items.map((r) => `<article class="ev" data-open="${t.name}" data-id="${esc(r.id)}" tabindex="0"><span class="et">${esc(r[m.time] || '')}</span><b>${esc(val(t, r, m.title))}</b><small>${esc(m.sub ? val(t, r, m.sub) : '')}</small>${t.statusF ? pill(val(t, r, t.statusF), toneOf(t.statusF, val(t, r, t.statusF))) : ''}</article>`).join('') || '<p class="lane-empty">Free</p>'}</section>`;
      }).join('')}</div>`;
    $$('[data-ag]', v).forEach((b) => b.addEventListener('click', () => { const x = +b.dataset.ag; ui.ag = x === 0 ? 0 : ui.ag + x; viewAgenda(v, m); }));
    const add = $('[data-add]', v); if (add) add.addEventListener('click', () => form(t, null));
    wireOpen(v);
  }

  /* ---------- reports ---------- */
  function viewReports(v) {
    const tabs = role.mods.map((x) => T[x.k] || (C.modules && C.modules[x.k] && T[C.modules[x.k].table || C.modules[x.k].sales])).filter(Boolean).filter((t, i, a) => a.indexOf(t) === i);
    if (!tabs.length) { v.innerHTML = '<p class="muted">No reports for this role.</p>'; return; }
    if (!ui.rep.table || !tabs.some((t) => t.name === ui.rep.table)) ui.rep.table = (tabs.find((t) => t.dateF) || tabs[0]).name;
    const t = T[ui.rep.table];
    const R = { month: ['This month', todayS.slice(0, 8) + '01'], d30: ['Last 30 days', addDays(-30)], quarter: ['Last 90 days', addDays(-90)], year: ['This year', todayS.slice(0, 5) + '01-01'], all: ['All time', ''] };
    const from = R[ui.rep.range][1];
    const rows = sorted(t, rowsOf(t.name).filter((r) => !t.dateF || !from || String(val(t, r, t.dateF) || '') >= from));
    const moneyF = t.fields.filter((f) => f.type === 'money');
    const groupF = [t.statusF, ...t.fields.filter((f) => (f.type === 'sel' || f.type === 'ref' || f.type === 'tag') && f !== t.statusF)].filter(Boolean).slice(0, 2);
    const breakdown = (gf) => { const mp = new Map(); rows.forEach((r) => { const g = val(t, r, gf) || '—'; const o = mp.get(g) || { n: 0, s: 0 }; o.n++; if (moneyF[0]) o.s += Number(val(t, r, moneyF[0])) || 0; mp.set(g, o); }); return [...mp.entries()].sort((a, b) => b[1].n - a[1].n); };
    const cols = t.fields.filter((f) => !f.hide).slice(0, 7);
    v.innerHTML = `<div class="phead noprint"><div class="rsel">
        <label><span>Report on</span><select id="rt">${tabs.map((x) => `<option value="${x.name}"${x === t ? ' selected' : ''}>${esc(x.label)}</option>`).join('')}</select></label>
        <label><span>Period</span><select id="rr">${Object.entries(R).map(([k, x]) => `<option value="${k}"${k === ui.rep.range ? ' selected' : ''}>${x[0]}</option>`).join('')}</select></label></div>
        <div class="acts"><button class="btn ghost" data-csv>${ic('download', 16)} CSV</button><button class="btn" data-pr>${ic('printer', 16)} Print or save PDF</button></div></div>
      <div id="report"><div class="print-only">${printHead(t.label + ' report')}</div>
      <p class="muted rmeta">${esc(t.label)} · ${R[ui.rep.range][0]}${t.dateF ? ` (by ${esc(t.dateF.label.toLowerCase())})` : ''} · generated ${dfmt(todayS)} by ${esc(role.person)}</p>
      <div class="kpis sm"><div class="kpi"><span>Records</span><b>${rows.length}</b></div>${moneyF.slice(0, 3).map((f) => `<div class="kpi"><span>Total ${esc(f.label.toLowerCase())}</span><b>${moneyS(rows.reduce((a, r) => a + (Number(val(t, r, f)) || 0), 0))}</b></div>`).join('')}</div>
      <div class="charts">${groupF.map((gf) => { const b = breakdown(gf); const mx = Math.max(1, ...b.map((x) => x[1].n)); return `<div class="card chart"><h3>By ${esc(gf.label.toLowerCase())}</h3><div class="bars">${b.slice(0, 8).map(([g, o]) => `<div class="brow"><span class="bl">${esc(g)}</span><span class="bt"><i style="width:${(o.n / mx) * 100}%"></i></span><span class="bv">${o.n}${moneyF[0] ? ' · ' + moneyS(o.s) : ''}</span></div>`).join('')}</div></div>`; }).join('')}</div>
      <div class="card"><h3>Detail</h3>${rows.length ? `<div class="tw mini"><table><thead><tr>${t.code ? '<th>Ref</th>' : ''}${cols.map((f) => `<th class="${isNum(f) ? 'n' : ''}">${esc(f.label)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, 200).map((r) => `<tr>${t.code ? `<td class="ref" data-label="Ref">${esc(r.id)}</td>` : ''}${cols.map((f) => `<td class="${isNum(f) ? 'n' : ''}" data-label="${esc(f.label)}">${cell(t, r, f)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted">No records in this period.</p>'}</div>
      <div class="print-only">${printFoot()}</div></div>`;
    $('#rt', v).addEventListener('change', (e) => { ui.rep.table = e.target.value; viewReports(v); });
    $('#rr', v).addEventListener('change', (e) => { ui.rep.range = e.target.value; viewReports(v); });
    $('[data-csv]', v).addEventListener('click', () => csv(t, rows));
    $('[data-pr]', v).addEventListener('click', () => doPrint($('#report', v).innerHTML.replace(/class="print-only"/g, 'class=""')));
  }

  /* ---------- boot ---------- */
  load();
  applyTheme();
  setFavicon();
  role = C.roles.find((r) => r.id === S.role) || null;
  if (role) { shell(); go(location.hash.slice(1) || role.mods[0].k); } else login();
  window.addEventListener('hashchange', () => { if (role && location.hash.slice(1) !== curMod) go(location.hash.slice(1)); });
})();
