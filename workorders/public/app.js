/* Basa work orders: single-page app */
(() => {
  'use strict';
  const P = {
    home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z', list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', board: 'M3 3h18v18H3zM9 3v18M15 3v18',
    plus: 'M12 5v14M5 12h14', gear: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6', users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', building: 'M4 22V3h11v19M15 9h5v13M8 7h3M8 11h3M8 15h3M2 22h20', tag: 'M2 12V2h10l10 10-10 10zM7 7h.01',
    cal: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18', chart: 'M3 3v18h18M7 15v2M11 11v6M15 7v10M19 12v5', bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
    out: 'M9 21H5V3h4M16 17l5-5-5-5M21 12H9', x: 'M18 6 6 18M6 6l12 12', check: 'M20 6 9 17l-5-5', search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3',
    wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z',
    pin: 'M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5', clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2',
    file: 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6', camera: 'M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8', box: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
    alert: 'M12 3 2 21h20zM12 10v4M12 18h.01', shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', play: 'M6 4l14 8-14 8z', pause: 'M7 4h4v16H7zM13 4h4v16h-4z',
    send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z', share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
    download: 'M12 3v12M7 10l5 5 5-5M5 21h14', printer: 'M6 9V2h12v7M6 18H4v-7h16v7h-2M6 14h12v8H6z', back: 'M15 18l-6-6 6-6', msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    mega: 'M3 10v4h3l7 5V5L6 10zM16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13', pinf: 'M12 17v5M9 3h6l-1 6 4 4v2H6v-2l4-4z',
    pulse: 'M22 12h-4l-3 9L9 3l-3 9H2', qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2', flag: 'M4 22V4M4 4h13l-2 4 2 4H4', layers: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5', trash: 'M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15', phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
  };
  const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n] || P.list}"/></svg>`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = (s) => { if (!s) return ''; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return `${d} ${MON[m - 1]} ${y}`; };
  const fdt = (s) => s ? fdate(s) + ' ' + String(s).slice(11, 16) : '';
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const ago = (s) => { const m = Math.round((Date.now() - new Date(s).getTime()) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : fdate(s); };
  const initials = (n) => String(n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  let ME = null, SET = {}, LK = null, NOTE = { items: [], unread: 0 };
  const money = (v) => (SET.currency === 'USD' || !SET.currency ? '$' : SET.currency + ' ') + (Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const LABEL = { requested: 'Requested', open: 'Open', assigned: 'Assigned', in_progress: 'In progress', on_hold: 'On hold', completed: 'Completed', reviewed: 'Reviewed', approved: 'Approved', sent: 'Sent to client', closed: 'Closed', cancelled: 'Cancelled' };
  const ROLE = { admin: 'Administrator', manager: 'Manager', foreman: 'Foreman', tech: 'Technician', stores: 'Stores controller', dept: 'Department staff', client: 'Client' };
  const sp = (s) => `<span class="pill s-${s}">${esc(LABEL[s] || s)}</span>`;
  const pp = (p) => `<span class="pill p-${esc(p)}">${esc(p)}</span>`;
  const dp = (d) => `<span class="pill d-${esc(d)}">${esc(d)}</span>`;
  const SUP = () => ['admin', 'manager', 'foreman'].includes(ME.role);
  const BOSS = () => ['admin', 'manager'].includes(ME.role);

  /* ---------- api, toast, dialog ---------- */
  async function api(path, body, method) {
    const opt = { method: method || (body ? 'POST' : 'GET'), credentials: 'same-origin', headers: {} };
    if (body) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
    let r;
    try { r = await fetch('/api' + path, opt); } catch (e) {
      if (opt.method === 'POST' && QUEUEABLE.test(path) && 'indexedDB' in window) { await qAdd({ path, body, at: Date.now() }); offlineBadge(); toast('No signal: saved on this phone, will send when back online'); return { queued: true }; }
      throw new Error('No connection. Check your internet and try again.');
    }
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && ME) { ME = null; login(); }
    if (!r.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }
  function toast(msg, bad) {
    const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.setAttribute('role', 'status');
    t.innerHTML = ic(bad ? 'alert' : 'check', 16) + esc(msg); document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
  }
  function dlg(html, wire, cls) {
    const d = document.createElement('dialog'); d.className = cls || '';
    d.innerHTML = `<div class="dlg">${html}</div>`; document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.showModal(); if (wire) wire(d); return d;
  }
  const head = (t, sub) => `<div class="head"><div><h2>${t}</h2>${sub ? `<p class="muted small">${sub}</p>` : ''}</div><button class="x" type="button" data-close aria-label="Close">${ic('x')}</button></div>`;
  async function busy(btn, fn, errEl) {
    if (btn) btn.disabled = true; if (errEl) errEl.textContent = '';
    try { return await fn(); } catch (e) { if (errEl) errEl.textContent = e.message; else toast(e.message, true); } finally { if (btn) btn.disabled = false; }
  }
  const formData = (f) => Object.fromEntries(new FormData(f).entries());
  const typeOpts = (sel, blank) => (blank != null ? `<option value="">${esc(blank)}</option>` : '') + (LK.type_groups || [['Types', LK.types]]).map(([g, l]) => `<optgroup label="${esc(g)}">${l.map((t) => `<option${t === sel ? ' selected' : ''}>${esc(t)}</option>`).join('')}</optgroup>`).join('');
  const opt = (list, sel, blank) => (blank != null ? `<option value="">${esc(blank)}</option>` : '') + list.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(v) === String(sel ?? '') ? ' selected' : ''}>${esc(l)}</option>`; }).join('');

  /* ---------- signature pad ---------- */
  function sigPad(canvas) {
    const ctx = canvas.getContext('2d'); let drawing = false, drawn = false, last;
    const fit = () => { const r = canvas.getBoundingClientRect(); canvas.width = r.width * 2; canvas.height = r.height * 2; ctx.scale(2, 2); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111827'; };
    fit();
    const pt = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener('pointerdown', (e) => { drawing = true; last = pt(e); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pt(e); ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke(); last = p; drawn = true; });
    ['pointerup', 'pointercancel'].forEach((ev) => canvas.addEventListener(ev, () => { drawing = false; }));
    return { get: () => (drawn ? canvas.toDataURL('image/png') : ''), clear: () => { ctx.clearRect(0, 0, canvas.width, canvas.height); drawn = false; } };
  }
  /* ---------- image resize ---------- */
  function resizeImage(file, max, type) {
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d'); if (type !== 'image/png') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
        x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        let q = 0.78, d = c.toDataURL(type || 'image/jpeg', q);
        while (type !== 'image/png' && d.length > 850000 && q > 0.35) { q -= 0.1; d = c.toDataURL('image/jpeg', q); }
        res(d);
      };
      img.onerror = () => rej(new Error('That file is not a photo we can read.'));
      img.src = url;
    });
  }

  /* ---------- branding ---------- */
  function brand() {
    const cb = SET.client_brand || {};
    document.documentElement.style.setProperty('--brand', /^#[0-9a-f]{6}$/i.test(cb.color || '') ? cb.color : /^#[0-9a-f]{6}$/i.test(SET.color || '') ? SET.color : '#d9822b');
    document.title = (cb.name || SET.short || 'Basa') + ' · Work orders';
  }
  const logoHTML = (cls) => SET.client_brand && SET.client_brand.logo ? `<img src="${esc(SET.client_brand.logo)}" alt="${esc(SET.client_brand.name)} logo" class="${cls || ''}">` : SET.logo ? `<img src="${esc(SET.logo)}" alt="${esc(SET.short || '')} logo" class="${cls || ''}">` : `<span class="mark">${esc(initials(SET.short || 'B'))}</span>`;

  /* ---------- login & password ---------- */
  function login() {
    document.body.innerHTML = `<div class="login">
      <section class="login-brand">
        <div class="logo">${SET.logo ? `<img src="${esc(SET.logo)}" alt="">` : ''}<div><b>${esc(SET.short || 'Basa')} Work Orders</b><span>${esc(SET.tagline || 'Maintenance, installations and inspections')}</span></div></div>
        <div style="display:grid;gap:18px"><h1>Every job, from request to signed report.</h1>
        <ul><li>${ic('check')}Clients request work and track it live</li><li>${ic('check')}Foremen assign technicians, technicians build their team</li><li>${ic('check')}Safety checks, checklists, hours, parts and photos from the phone</li><li>${ic('check')}Managers approve and send a signed PDF report to the client</li></ul></div>
        <p class="foot">Electrical · Mechanical · Automation · Instrumentation<br>Powered by Basa · built by Nexora Digital</p>
      </section>
      <section class="login-form"><form id="lf" novalidate>
        <h2>Sign in</h2><p class="muted">Use the email and password your manager gave you.</p>
        <label class="f">Email<input name="email" type="email" autocomplete="username" required></label>
        <label class="f">Password<input name="password" type="password" autocomplete="current-password" required></label>
        <p class="err" id="le" role="alert"></p>
        <button class="btn wide" type="submit">Sign in</button>
        <p class="muted small">Forgot your password? Ask your manager to reset it.</p>
      </form></section></div>`;
    $('#lf').addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const r = await api('/auth/login', formData(e.target)); ME = r.user; await start(); }, $('#le')); });
  }
  function mustChange() {
    document.body.innerHTML = `<div class="login"><section class="login-brand"><div class="logo"><div><b>${esc(SET.short || 'Basa')} Work Orders</b></div></div><h1>Welcome, ${esc(ME.name.split(' ')[0])}.</h1><p class="foot">Choose your own password to continue.</p></section>
      <section class="login-form"><form id="pf" novalidate><h2>Choose a password</h2><p class="muted">You signed in with a temporary password. Pick a new one that only you know (8 or more characters).</p>
      <label class="f">Temporary password<input name="current" type="password" autocomplete="current-password" required></label>
      <label class="f">New password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
      <p class="err" id="pe" role="alert"></p><button class="btn wide">Save and continue</button><button class="link" type="button" id="lo">Sign out</button></form></section></div>`;
    $('#pf').addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/me/password', formData(e.target)); ME.must_change = false; toast('Password saved'); await start(); }, $('#pe')); });
    $('#lo').onclick = logout;
  }
  async function logout() { try { await api('/auth/logout', {}); } catch (e) { /* ignore */ } try { if (window.caches) await caches.delete('basa-api'); } catch (e) { /* ignore */ } ME = null; location.hash = ''; login(); }

  /* ---------- shell ---------- */
  function navItems() {
    const r = ME.role;
    if (r === 'client') return [['#/', 'home', 'My jobs'], ['#/new', 'plus', 'Request work'], ['#/notices', 'mega', 'Notices'], ['#/register', 'shield', 'Tagged items'], ['#/assets', 'tag', 'Equipment'], ['#/projects', 'layers', 'Projects'], ['#/account', 'user', 'Account']];
    if (r === 'stores') return [['#/', 'home', 'Stores home'], ['#/stores/req', 'list', 'Requests'], ['#/stores/parts', 'box', 'Parts & stock'], ['#/stores/requests', 'flag', 'To order'], ['#/stores/po', 'file', 'Purchase orders'], ['#/stores/suppliers', 'building', 'Suppliers'], ['#/stores/dept', 'chart', 'Issues by department'], ['#/notices', 'mega', 'Notices'], ['#/account', 'user', 'Account']];
    if (r === 'dept') return [['#/', 'home', 'My requests'], ['#/stores/new', 'plus', 'New request'], ['#/stores/parts', 'box', 'Parts catalogue'], ['#/notices', 'mega', 'Notices'], ['#/account', 'user', 'Account']];
    if (r === 'tech') return [['#/', 'home', 'My jobs'], ['#/jobs', 'list', 'Job history'], ['#/notices', 'mega', 'Notices'], ['#/labour', 'clock', 'My hours'], ['#/stores', 'box', 'Stores'], ['#/cm', 'pulse', 'Readings'], ['#/register', 'shield', 'Test & tag'], ['#/projects', 'layers', 'Projects'], ['#/account', 'user', 'Account']];
    const n = [['#/', 'home', 'Dashboard'], ['#/jobs', 'list', 'Work orders'], ['#/board', 'board', 'Board'], ['#/new', 'plus', 'New work order'], ['#/notices', 'mega', 'Notice board'], ['#/assets', 'tag', 'Assets'], ['#/pm', 'cal', 'Maintenance plans'], ['#/stores', 'box', 'Stores & spares'], ['#/cm', 'pulse', 'Condition monitoring'], ['#/tpm', 'qr', 'TPM & OEE'], ['#/projects', 'layers', 'Projects'], ['#/register', 'shield', 'Test & tag register'], ['#/clients', 'building', 'Clients & sites'], ['#/analysis', 'chart', 'Analysis'], ['#/labour', 'clock', 'Labour'], ['#/reports', 'file', 'Reports & exports']];
    if (BOSS()) n.push(['#/users', 'users', 'People & logins'], ['#/settings', 'gear', 'Settings']);
    n.push(['#/account', 'user', 'My account']);
    return n;
  }
  function shell() {
    const items = navItems();
    const pick = (hs) => hs.map((h) => items.find((x) => x[0] === h) || ['#/more', 'gear', 'More']);
    const tab = ME.role === 'stores' ? pick(['#/', '#/stores/req', '#/stores/parts', '#/stores/po', '#/more']) : ME.role === 'dept' ? pick(['#/', '#/stores/new', '#/stores/parts', '#/notices', '#/account']) : ME.role === 'client' ? pick(['#/', '#/new', '#/notices', '#/projects', '#/account']) : ME.role === 'tech' ? pick(['#/', '#/jobs', '#/notices', '#/labour', '#/more']) : [items[0], items[1], items[3], items[4], ['#/more', 'gear', 'More']];
    document.body.innerHTML = `<div class="app">
      <aside class="side"><div class="brand">${logoHTML()}<div><b>${esc(SET.short || 'Basa')}</b><span>Work orders</span></div></div>
        <nav class="nav" aria-label="Main">${items.map(([h, i, l]) => `<a href="${h}">${ic(i)}<span>${l}</span>${h === '#/notices' ? '<em class="nb" hidden></em>' : ''}</a>`).join('')}</nav>
        <div class="me"><div class="who"><span class="av">${esc(initials(ME.name))}</span><div><b>${esc(ME.name)}</b><small>${ROLE[ME.role]}${ME.trade && ME.trade !== 'Multi' ? ' · ' + esc(ME.trade) : ''}</small></div></div>
        <button id="so">${ic('out', 16)} Sign out</button><p class="credit">${SET.client_brand ? 'Powered by ' + esc(SET.short || 'Basa') : 'Basa by Nexora Digital'}</p></div></aside>
      <div class="main"><header class="topbar"><div><div class="crumb">${esc(SET.short || 'Basa')} work orders</div><h1 id="ttl"></h1></div>
        <div class="row" style="position:relative"><button class="iconbtn" id="bell" aria-label="Notifications">${ic('bell')}<span class="dotn" id="bn" hidden></span></button>
        <button class="iconbtn mobile-only" id="so2" aria-label="Sign out">${ic('out')}</button><div class="menu" id="nm" hidden></div></div></header>
        <main class="view" id="v" tabindex="-1"></main></div>
      <nav class="tabbar" aria-label="Main">${tab.map(([h, i, l]) => `<a href="${h}">${ic(i, 20)}<span>${l}</span>${h === '#/notices' || h === '#/more' ? '<em class="nb" hidden></em>' : ''}</a>`).join('')}</nav></div>`;
    $('#so').onclick = logout; $('#so2').onclick = logout;
    $('#bell').onclick = toggleNotes;
    document.addEventListener('click', (e) => { const m = $('#nm'); if (m && !m.hidden && !e.target.closest('#nm,#bell')) m.hidden = true; });
    pollNotes();
  }
  function setTitle(t) { const h = $('#ttl'); if (h) h.textContent = t; }
  function markNav() {
    const h = (location.hash || '#/').split('?')[0];
    $$('.nav a, .tabbar a').forEach((a) => { const x = a.getAttribute('href'); const cur = x === '#/' ? h === '#/' || h === '#' : h === x || h.startsWith(x + '/'); a.setAttribute('aria-current', cur ? 'page' : 'false'); });
  }
  const noteLink = (n) => n.wo_id ? '#/job/' + n.wo_id : n.kind === 'reminder' ? '#/notices/reminders' : n.kind === 'notice' ? '#/notices' : /tagged item/.test(n.text) ? '#/register' : '#/notices/alerts';
  let lastNote = null;
  async function pollNotes() {
    try {
      NOTE = await api('/notifications');
      const b = $('#bn'); if (b) { b.hidden = !NOTE.unread; b.textContent = NOTE.unread > 9 ? '9+' : NOTE.unread; }
      $$('.nb').forEach((e) => { e.hidden = !NOTE.notices; e.textContent = NOTE.notices > 9 ? '9+' : NOTE.notices; });
      const top = NOTE.items.length ? NOTE.items[0].id : 0;
      if (lastNote !== null) NOTE.items.filter((n) => n.id > lastNote && !n.read).slice(0, 3).reverse().forEach((n) => liveAlert({ body: n.text, url: noteLink(n), urgent: /URGENT|overdue/i.test(n.text) }));
      lastNote = Math.max(lastNote || 0, top);
    } catch (e) { /* offline */ }
    clearTimeout(pollNotes.t); pollNotes.t = setTimeout(pollNotes, document.hidden ? 120000 : 30000);
  }
  function liveAlert(d) {
    let box = $('#live'); if (!box) { box = document.createElement('div'); box.id = 'live'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const a = document.createElement('a'); a.className = 'live' + (d.urgent ? ' urgent' : ''); a.href = d.url || '#/';
    a.innerHTML = `${ic(d.urgent ? 'alert' : 'bell', 18)}<span>${d.title ? `<b>${esc(d.title)}</b>` : ''}${esc(d.body || '')}</span><button type="button" aria-label="Dismiss">${ic('x', 14)}</button>`;
    a.querySelector('button').onclick = (e) => { e.preventDefault(); a.remove(); };
    a.addEventListener('click', () => setTimeout(() => a.remove(), 50));
    box.prepend(a); while (box.children.length > 3) box.lastChild.remove();
    setTimeout(() => a.remove(), d.urgent ? 20000 : 9000);
  }
  async function toggleNotes() {
    const m = $('#nm'); if (!m.hidden) { m.hidden = true; return; }
    await pollNotes();
    m.innerHTML = (NOTE.items.length ? NOTE.items.map((n) => `<a href="${noteLink(n)}" class="${n.read ? '' : 'unread'}">${esc(n.text)}<small>${ago(n.created_at)}</small></a>`).join('') : '<p class="empty">No notifications yet.</p>') + `<a href="#/notices/alerts" class="all">All alerts and notices</a>`;
    m.hidden = false;
    if (NOTE.unread) { api('/notifications/read', {}).then(() => { NOTE.unread = 0; $('#bn').hidden = true; }).catch(() => {}); }
    $$('a', m).forEach((a) => a.addEventListener('click', () => { m.hidden = true; }));
  }

  /* ---------- router ---------- */
  async function route() {
    if (!ME) return;
    const h = (location.hash || '#/').slice(1).split('?')[0];
    const parts = h.split('/').filter(Boolean);
    markNav();
    $$('dialog[open]').forEach((d) => d.close());
    const v = $('#v'); if (!v) return;
    v.innerHTML = '<p class="loading">Loading…</p>';
    window.scrollTo(0, 0);
    try {
      if (!parts.length) await (ME.role === 'client' ? clientHome(v) : ME.role === 'tech' ? techHome(v) : ['stores', 'dept'].includes(ME.role) ? storesHome(v) : dashboard(v));
      else if (parts[0] === 'jobs') await jobs(v);
      else if (parts[0] === 'board') await board(v);
      else if (parts[0] === 'job') await job(v, parts[1], parts[2] || 'details');
      else if (parts[0] === 'new') await newJob(v, parts[1]);
      else if (parts[0] === 'assets') await assets(v);
      else if (parts[0] === 'pm') await pm(v);
      else if (parts[0] === 'register') await register(v);
      else if (parts[0] === 'clients') await clients(v);
      else if (parts[0] === 'users') await users(v);
      else if (parts[0] === 'reports') await reports(v);
      else if (parts[0] === 'settings') await settingsView(v);
      else if (parts[0] === 'account') await account(v);
      else if (parts[0] === 'notices') await notices(v, parts[1] || 'board');
      else if (parts[0] === 'more') more(v);
      else if (parts[0] === 'stores') await storesView(v, parts[1], parts[2]);
      else if (parts[0] === 'analysis') await analysis(v);
      else if (parts[0] === 'labour') await labourView(v);
      else if (parts[0] === 'cm') await cmView(v);
      else if (parts[0] === 'tpm') await tpmView(v);
      else if (parts[0] === 'projects') await projectsView(v, parts[1]);
      else v.innerHTML = '<p class="empty">Page not found.</p>';
    } catch (e) { v.innerHTML = `<div class="banner bad">${ic('alert')}<span>${esc(e.message)}</span></div>`; }
    if (!parts.length) pushNudge(v);
  }
  const refreshLK = async () => { LK = await api('/lookups'); };

  /* ---------- job cards ---------- */
  function jobCard(w) {
    const pct = w.ck_total ? Math.round((w.ck_done / w.ck_total) * 100) : 0;
    const late = w.due_date && w.due_date < today() && !['completed', 'reviewed', 'approved', 'sent', 'closed', 'cancelled'].includes(w.status);
    return `<a class="job" href="#/job/${w.id}"><div class="top"><div><span class="no">${esc(w.number)}</span><br><b>${esc(w.title)}</b></div>${sp(w.status)}</div>
      <div class="meta"><span>${dp(w.discipline)}</span>${w.priority !== 'Normal' ? `<span>${pp(w.priority)}</span>` : ''}<span>${ic('building', 14)}${esc(w.client || '—')}${w.site ? ' · ' + esc(w.site) : ''}</span>${w.asset_tag ? `<span>${ic('tag', 14)}${esc(w.asset_tag)}</span>` : ''}</div>
      <div class="meta">${w.lead ? `<span>${ic('user', 14)}${esc(w.lead)}${w.team_count ? ' +' + w.team_count : ''}</span>` : '<span>Not assigned</span>'}${w.scheduled_date ? `<span>${ic('cal', 14)}${fdate(w.scheduled_date)}</span>` : ''}${w.due_date ? `<span style="${late ? 'color:var(--bad);font-weight:700' : ''}">${ic('clock', 14)}Due ${fdate(w.due_date)}${late ? ' (late)' : ''}</span>` : ''}${w.hours ? `<span>${ic('clock', 14)}${w.hours} h</span>` : ''}</div>
      ${['in_progress', 'assigned', 'on_hold'].includes(w.status) && w.ck_total ? `<div class="bar" title="Checklist ${pct}%"><i style="width:${pct}%"></i></div>` : ''}</a>`;
  }
  const jobList = (list, empty) => list.length ? `<div class="jobs">${list.map(jobCard).join('')}</div>` : `<p class="empty">${empty || 'Nothing here.'}</p>`;

  /* ---------- dashboards ---------- */
  async function dashboard(v) {
    setTitle('Dashboard');
    const d = await api('/dashboard');
    if (d.pm_created.length) toast(`${d.pm_created.length} planned job${d.pm_created.length > 1 ? 's' : ''} created from the maintenance plans`);
    const W = d.wo, t = d.today;
    const by = (s) => W.filter((w) => s.includes(w.status));
    const late = W.filter((w) => w.due_date && w.due_date < t && !['completed', 'reviewed', 'approved', 'sent', 'closed', 'cancelled'].includes(w.status));
    const act = [
      ['Requests to accept', by(['requested']), 'requested'], ['Open, needs a technician', by(['open']), 'open'], ['Completed, waiting for review', by(['completed']), 'completed'],
      ...(BOSS() ? [['Reviewed, waiting for your approval', by(['reviewed']), 'reviewed'], ['Approved, report not sent yet', by(['approved']), 'approved']] : []), ['On hold', by(['on_hold']), 'on_hold'],
    ].filter((x) => x[1].length);
    const disc = ['Electrical', 'Mechanical', 'Automation', 'Instrumentation'].map((x) => [x, W.filter((w) => w.discipline === x && !['closed', 'cancelled'].includes(w.status)).length]);
    const mx = Math.max(1, ...disc.map((x) => x[1])), wmx = Math.max(1, ...d.workload.map((x) => x.jobs));
    v.innerHTML = `<div class="between"><div><h2>Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${esc(ME.name.split(' ')[0])}</h2><p class="muted">${fdate(t)} · ${esc(SET.company || '')}</p></div><a class="btn" href="#/new">${ic('plus', 16)} New work order</a></div>
      <div class="kpis">
        <a class="kpi" href="#/jobs?s=active"><span>Active jobs</span><b>${W.filter((w) => !['closed', 'cancelled'].includes(w.status)).length}</b><small>Not yet closed</small></a>
        <a class="kpi" href="#/jobs?s=in_progress"><span>In progress</span><b>${by(['in_progress']).length}</b><small>Technicians on site</small></a>
        <a class="kpi ${late.length ? 'alert' : ''}" href="#/jobs?s=late"><span>Overdue</span><b>${late.length}</b><small>Past the due date</small></a>
        <a class="kpi" href="#/jobs?s=completed"><span>To review</span><b>${by(['completed', 'reviewed']).length}</b><small>Submitted by technicians</small></a>
        ${d.tags_due ? `<a class="kpi alert" href="#/register"><span>Tagged items due</span><b>${d.tags_due}</b><small>Overdue or due in 30 days</small></a>` : ''}
        ${d.cm_alarms ? `<a class="kpi alert" href="#/cm"><span>Condition alarms</span><b>${d.cm_alarms}</b><small>Machines past the alarm limit</small></a>` : ''}
        ${d.low_parts ? `<a class="kpi alert" href="#/stores"><span>Low stock</span><b>${d.low_parts}</b><small>${d.open_prs} purchase request${d.open_prs === 1 ? '' : 's'} open</small></a>` : ''}
        <div class="kpi"><span>Hours this month</span><b>${Number(d.hours_month).toLocaleString()}</b><small>Logged by the team</small></div>
        <div class="kpi"><span>Work value this month</span><b>${money(d.value_month).replace(/\.00$/, '')}</b><small>Labour + materials, ex VAT</small></div>
      </div>
      <div class="cols2"><div class="stack">
        ${act.length ? act.map(([l, list]) => `<div class="card"><div class="card-h"><h2>${l} <span class="muted">(${list.length})</span></h2></div>${jobList(list.slice(0, 6))}</div>`).join('') : `<div class="banner ok">${ic('check')}<span>Nothing is waiting for you right now.</span></div>`}
        <div class="card"><div class="card-h"><h2>Recently updated</h2><a class="link" href="#/jobs">All work orders</a></div>${jobList(W.slice(0, 5))}</div>
      </div><div class="stack">
        <div class="card"><div class="card-h"><h2>On the clock now</h2><a class="link" href="#/labour">Labour</a></div>${(d.clocked_on || []).length ? d.clocked_on.map((c) => `<a class="between small" href="#/job/${c.wo_id}" style="padding:6px 0;border-top:1px solid var(--line2);text-decoration:none;color:inherit"><span><b>${esc(c.name)}</b> · ${esc((LK.clock_kinds || {})[c.kind] || c.kind)}</span><span class="muted">${esc(c.number)} · since ${hhmm(c.start_at)}</span></a>`).join('') : '<p class="muted small">Nobody is clocked on.</p>'}</div>
        <div class="card"><div class="card-h"><h2>Technician workload</h2></div><div class="workload">${d.workload.map((x) => `<div class="wl"><span><b>${esc(x.name)}</b><br><span class="tiny muted">${esc(x.trade || '')} · ${x.hours} h this month</span></span><span class="bt"><i style="width:${(x.jobs / wmx) * 100}%"></i></span><b>${x.jobs}</b></div>`).join('') || '<p class="muted">No technicians yet.</p>'}</div></div>
        <div class="card"><div class="card-h"><h2>Active jobs by discipline</h2></div><div class="workload">${disc.map(([l, n]) => `<div class="wl"><span>${dp(l)}</span><span class="bt"><i style="width:${(n / mx) * 100}%"></i></span><b>${n}</b></div>`).join('')}</div></div>
        <div class="card"><div class="card-h"><h2>Planned maintenance</h2><a class="link" href="#/pm">Plans</a></div>${d.pm_due.length ? `<div class="tw" style="box-shadow:none"><table><tbody>${d.pm_due.map((p) => `<tr><td><b>${esc(p.title)}</b><br><span class="tiny muted">${esc(p.tag)} · every ${p.every_days} days</span></td><td class="n" style="${p.next_due < t ? 'color:var(--bad);font-weight:700' : ''}">${fdate(p.next_due)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No plans yet.</p>'}</div>
      </div></div>`;
  }
  async function techHome(v) {
    setTitle('My jobs');
    const d = await api('/dashboard'); const W = d.wo; await refreshLK();
    const mc = LK.my_clock;
    const now = W.filter((w) => ['in_progress', 'assigned', 'on_hold'].includes(w.status)).sort((a, b) => (a.status === 'in_progress' ? -1 : 0) - (b.status === 'in_progress' ? -1 : 0) || String(a.scheduled_date || '9').localeCompare(String(b.scheduled_date || '9')));
    const sub = W.filter((w) => ['completed', 'reviewed'].includes(w.status));
    v.innerHTML = `<div><h2>Hi ${esc(ME.name.split(' ')[0])}</h2><p class="muted">${fdate(d.today)} · ${Number(d.hours_month)} hours logged this month</p></div>
      ${mc ? `<a class="banner info" href="#/job/${mc.wo_id}" style="text-decoration:none">${ic('clock')}<span>You are on the clock: <b>${esc((LK.clock_kinds || {})[mc.kind] || mc.kind)}</b> on ${esc(mc.number)} since ${hhmm(mc.start_at)}. Tap to open the job.</span></a>` : ''}
      <div class="kpis"><div class="kpi"><span>To do</span><b>${now.length}</b></div><div class="kpi"><span>Waiting for review</span><b>${sub.length}</b></div></div>
      <div class="card"><div class="card-h"><h2>To do</h2></div>${jobList(now, 'No jobs assigned to you right now.')}</div>
      ${sub.length ? `<div class="card"><div class="card-h"><h2>Submitted, waiting for the foreman</h2></div>${jobList(sub)}</div>` : ''}
      <div class="card"><div class="card-h"><h2>Recently finished</h2><a class="link" href="#/jobs">Job history</a></div>${jobList(W.filter((w) => ['approved', 'sent', 'closed'].includes(w.status)).slice(0, 5), 'Nothing finished yet.')}</div>`;
  }
  async function clientHome(v) {
    setTitle('My jobs');
    const d = await api('/dashboard'); const W = d.wo;
    const sign = W.filter((w) => w.status === 'sent');
    v.innerHTML = `<div class="between"><div><h2>Welcome, ${esc(ME.name.split(' ')[0])}</h2><p class="muted">Track your jobs with ${esc(SET.short || '')} and download signed reports.</p></div><a class="btn" href="#/new">${ic('plus', 16)} Request work</a></div>
      ${sign.length ? `<div class="banner info">${ic('file')}<span>${sign.length} report${sign.length > 1 ? 's are' : ' is'} ready. Open the job to read the report and sign it off.</span></div>` : ''}
      <div class="kpis"><div class="kpi"><span>Active jobs</span><b>${W.filter((w) => !['sent', 'closed', 'cancelled'].includes(w.status)).length}</b></div><div class="kpi"><span>Reports to sign</span><b>${sign.length}</b></div><div class="kpi"><span>Completed jobs</span><b>${W.filter((w) => w.status === 'closed').length}</b></div></div>
      ${sign.length ? `<div class="card"><div class="card-h"><h2>Reports ready for you</h2></div>${jobList(sign)}</div>` : ''}
      <div class="card"><div class="card-h"><h2>In progress</h2></div>${jobList(W.filter((w) => !['sent', 'closed', 'cancelled'].includes(w.status)), 'No active jobs. Tap "Request work" to log a new job.')}</div>
      <div class="card"><div class="card-h"><h2>Completed</h2></div>${jobList(W.filter((w) => w.status === 'closed').slice(0, 10), 'No completed jobs yet.')}</div>`;
  }
  function more(v) {
    setTitle('More');
    v.innerHTML = `<div class="jobs">${navItems().slice(1).map(([h, i, l]) => `<a class="job" href="${h}" style="grid-template-columns:auto 1fr;align-items:center;display:grid;gap:12px">${ic(i, 22)}<b>${l}</b></a>`).join('')}<button class="btn ghost" id="mo">${ic('out', 16)} Sign out</button></div>`;
    $('#mo').onclick = logout;
  }

  /* ---------- lists ---------- */
  async function jobs(v) {
    setTitle(ME.role === 'tech' ? 'Job history' : 'Work orders');
    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    let st = qs.get('s') || 'active', disc = '', q = '';
    const all = (await api('/wo?status=')).items;
    const tabs = [['active', 'Active'], ['late', 'Overdue'], ...Object.keys(LABEL).map((k) => [k, LABEL[k]]), ['all', 'All']];
    const count = (k) => k === 'all' ? all.length : k === 'active' ? all.filter((w) => !['closed', 'cancelled'].includes(w.status)).length : k === 'late' ? all.filter(lateF).length : all.filter((w) => w.status === k).length;
    function lateF(w) { return w.due_date && w.due_date < today() && !['completed', 'reviewed', 'approved', 'sent', 'closed', 'cancelled'].includes(w.status); }
    v.innerHTML = `<div class="between"><div class="toolbar" style="flex:1"><label class="search">${ic('search', 16)}<input type="search" id="q" placeholder="Search number, title, client, asset" aria-label="Search"></label>
        <select id="disc" style="max-width:190px" aria-label="Discipline">${opt(LK.disciplines, '', 'All disciplines')}</select></div>${SUP() ? `<div class="row"><a class="btn ghost" href="/api/export/workorders" download>${ic('download', 16)} CSV</a><a class="btn" href="#/new">${ic('plus', 16)} New</a></div>` : ''}</div>
      <div class="chips" id="tabs"></div><div id="list"></div>`;
    const draw = () => {
      $('#tabs', v).innerHTML = tabs.filter(([k]) => ['active', 'all'].includes(k) || count(k)).map(([k, l]) => `<button class="chip" data-s="${k}" aria-pressed="${k === st}">${l}<i>${count(k)}</i></button>`).join('');
      $$('[data-s]', v).forEach((b) => b.onclick = () => { st = b.dataset.s; draw(); });
      let list = all.filter((w) => st === 'all' ? true : st === 'active' ? !['closed', 'cancelled'].includes(w.status) : st === 'late' ? lateF(w) : w.status === st);
      if (disc) list = list.filter((w) => w.discipline === disc);
      if (q) { const s = q.toLowerCase(); list = list.filter((w) => [w.number, w.title, w.client, w.site, w.asset_tag, w.asset, w.lead].join(' ').toLowerCase().includes(s)); }
      const wide = innerWidth > 900;
      $('#list', v).innerHTML = !list.length ? '<p class="empty">No work orders match.</p>' : wide ? `<div class="tw"><table><thead><tr><th>No.</th><th>Job</th><th>Client / site</th><th>Discipline</th><th>Lead</th><th>Due</th><th>Status</th></tr></thead><tbody>${list.map((w) => `<tr class="click" data-id="${w.id}"><td class="mono">${esc(w.number)}</td><td><b>${esc(w.title)}</b><br><span class="tiny muted">${esc(w.type)}${w.asset_tag ? ' · ' + esc(w.asset_tag) : ''}${w.priority !== 'Normal' ? ' · ' + esc(w.priority) : ''}</span></td><td>${esc(w.client || '—')}<br><span class="tiny muted">${esc(w.site || '')}</span></td><td>${dp(w.discipline)}</td><td>${esc(w.lead || '—')}${w.team_count ? ` <span class="tiny muted">+${w.team_count}</span>` : ''}</td><td style="${lateF(w) ? 'color:var(--bad);font-weight:700' : ''}">${fdate(w.due_date)}</td><td>${sp(w.status)}</td></tr>`).join('')}</tbody></table></div>` : jobList(list);
      $$('tr[data-id]', v).forEach((tr) => tr.onclick = () => { location.hash = '#/job/' + tr.dataset.id; });
    };
    draw();
    $('#q', v).oninput = (e) => { q = e.target.value; draw(); };
    $('#disc', v).onchange = (e) => { disc = e.target.value; draw(); };
  }
  async function board(v) {
    setTitle('Board');
    const all = (await api('/wo?status=active')).items;
    const cols = ['requested', 'open', 'assigned', 'in_progress', 'on_hold', 'completed', 'reviewed', 'approved', 'sent'];
    v.innerHTML = `<p class="muted">Every active job by stage. Open a job to move it on.</p><div class="board">${cols.map((c) => { const l = all.filter((w) => w.status === c); return `<section class="lane"><h3>${sp(c)}<b>${l.length}</b></h3>${l.map(jobCard).join('') || '<p class="tiny muted" style="text-align:center;padding:10px">Empty</p>'}</section>`; }).join('')}</div>`;
  }

  /* ---------- new work order ---------- */
  async function newJob(v, assetPre) {
    setTitle(ME.role === 'client' ? 'Request work' : 'New work order');
    await refreshLK();
    const isC = ME.role === 'client';
    const techs = LK.staff.filter((s) => ['tech', 'foreman'].includes(s.role));
    const foremen = LK.staff.filter((s) => ['foreman', 'manager', 'admin'].includes(s.role));
    const pre = assetPre ? LK.assets.find((a) => String(a.id) === String(assetPre)) : null;
    const preSite = pre ? LK.sites.find((s) => s.id === pre.site_id) : null;
    v.innerHTML = `<form class="card stack" id="nf" novalidate style="max-width:860px">
      <div><h2>${isC ? 'What do you need done?' : 'Work order details'}</h2><p class="muted small">${isC ? `Your request goes straight to the ${esc(SET.short || '')} team. You'll be notified when a technician is assigned.` : 'A checklist with safety, task and handover checks is added automatically for the discipline and type.'}</p></div>
      <label class="f">Short title<input name="title" required maxlength="160" placeholder="For example: Conveyor motor overheating"></label>
      <div class="grid3">
        <label class="f">Discipline<select name="discipline" required>${opt(LK.disciplines, pre ? pre.discipline : '', 'Choose…')}</select></label>
        <label class="f">Type of work<select name="type" required>${typeOpts(isC ? 'Corrective maintenance' : '', 'Choose…')}</select></label>
        <label class="f">Priority<select name="priority">${opt(LK.priorities, 'Normal')}</select></label>
      </div>
      <div class="grid3">
        ${isC ? '' : `<label class="f">Client<select name="client_id" id="cl" required>${opt(LK.clients.map((c) => [c.id, c.name]), preSite ? preSite.client_id : '', 'Choose…')}</select></label>`}
        <label class="f">Site<select name="site_id" id="si"></select></label>
        <label class="f">Equipment / asset <span class="hint">(optional)</span><select name="asset_id" id="as"></select></label>
      </div>
      <label class="f" id="dtw" hidden>When did the machine stop?<input type="datetime-local" name="downtime_start" value="${toLocalInput(new Date().toISOString())}"><span class="hint">Downtime runs from here until the job records it back in service.</span></label>
      <label class="f">Describe the problem or the work<textarea name="description" rows="4" placeholder="What is happening, where, since when, any error codes, access or safety notes"></textarea></label>
      ${isC || !(LK.projects || []).length ? '' : `<label class="f">Part of a project <span class="hint">(optional)</span><select name="project_id">${opt(LK.projects.map((p) => [p.id, p.number + ' · ' + p.name]), new URLSearchParams(location.hash.split('?')[1] || '').get('project') || '', 'Not part of a project')}</select></label>`}
      <div class="grid3"><label class="f">Needed by<input type="date" name="due_date"></label>${isC ? '<label class="f">Your order / reference no. <span class="hint">(optional)</span><input name="client_ref"></label>' : `<label class="f">Client order no. <span class="hint">(optional)</span><input name="client_ref"></label><label class="f">Quoted amount <span class="hint">(optional)</span><input name="quote" type="number" step="any" min="0"></label>`}</div>
      ${isC ? '' : `<fieldset class="card" style="box-shadow:none;background:var(--brand-soft);border-color:var(--brand-mid)"><legend class="small" style="font-weight:700;padding:0 6px">Assign now (optional)</legend><div class="grid3">
        <label class="f">Lead technician<select name="lead_id">${opt(techs.map((s) => [s.id, `${s.name} · ${s.trade || s.role} · ${s.active_jobs} active`]), '', 'Assign later')}</select></label>
        <label class="f">Foreman<select name="foreman_id">${opt(foremen.map((s) => [s.id, s.name]), ME.role === 'foreman' ? ME.id : '', 'Choose…')}</select></label>
        <label class="f">Scheduled date<input type="date" name="scheduled_date"></label></div>
        <label class="f" style="margin-top:10px;max-width:220px">Estimated hours<input name="est_hours" type="number" step="0.5" min="0"></label></fieldset>`}
      <p class="err" id="ne" role="alert"></p>
      <div class="row"><button class="btn" type="submit">${ic('send', 16)} ${isC ? 'Send request' : 'Create work order'}</button><a class="btn ghost" href="#/">Cancel</a></div></form>`;
    const cl = $('#cl', v), si = $('#si', v), as = $('#as', v);
    const fillSites = () => { const cid = isC ? ME.client_id : Number(cl.value); const s = LK.sites.filter((x) => x.client_id === cid); si.innerHTML = opt(s.map((x) => [x.id, x.name]), preSite ? preSite.id : '', s.length ? 'All sites / not sure' : 'No sites yet'); fillAssets(); };
    const fillAssets = () => { const ids = si.value ? [Number(si.value)] : LK.sites.filter((x) => x.client_id === (isC ? ME.client_id : Number(cl && cl.value))).map((x) => x.id); const a = LK.assets.filter((x) => ids.includes(x.site_id)); as.innerHTML = opt(a.map((x) => [x.id, `${x.tag} · ${x.name}`]), pre ? pre.id : '', a.length ? 'Not linked to equipment' : 'No equipment listed'); };
    if (cl) cl.onchange = fillSites; si.onchange = fillAssets; fillSites();
    const ty = $('[name="type"]', v), dtw = $('#dtw', v); const syncT = () => { dtw.hidden = ty.value !== 'Breakdown'; }; ty.onchange = syncT; syncT();
    const prj = new URLSearchParams(location.hash.split('?')[1] || '').get('project'); if (prj && cl) { const P2 = (LK.projects || []).find((x) => String(x.id) === prj); if (P2) { cl.value = P2.client_id; fillSites(); ty.value = 'Project work'; } }
    $('#nf', v).addEventListener('submit', (e) => {
      e.preventDefault();
      const d = formData(e.target);
      if (d.type === 'Breakdown' && d.downtime_start) d.downtime_start = fromLocalInput(d.downtime_start); else delete d.downtime_start;
      busy(e.submitter, async () => { const r = await api('/wo', d); toast(isC ? 'Request sent' : 'Work order created: ' + r.wo.number); location.hash = '#/job/' + r.wo.id; }, $('#ne', v));
    });
  }

  /* ---------- job detail ---------- */
  const FLOW = ['requested', 'open', 'assigned', 'in_progress', 'completed', 'reviewed', 'approved', 'sent', 'closed'];
  function stepper(w) {
    const flow = w.status === 'requested' || (w.requester_role === 'client') ? FLOW : FLOW.slice(1);
    let cur = w.status === 'on_hold' ? 'in_progress' : w.status;
    const idx = flow.indexOf(cur);
    if (w.status === 'cancelled') return `<div class="banner bad">${ic('x')}<span>This job was cancelled.</span></div>`;
    return `<div class="steps" aria-label="Progress">${flow.map((s, i) => `<div class="step ${i < idx ? 'done' : i === idx ? 'now' : ''}"><i>${i < idx ? ic('check', 12) : ''}</i>${s === 'in_progress' && w.status === 'on_hold' ? 'On hold' : LABEL[s].replace('Sent to client', 'Sent')}</div>`).join('')}</div>`;
  }
  async function job(v, id, tab) {
    const d = await api('/wo/' + id);
    if (!LK) await refreshLK();
    const w = d.wo, can = d.can;
    setTitle(w.number);
    const isLead = w.lead_id === ME.id;
    const onTeamMe = isLead || d.team.some((t) => t.user_id === ME.id);
    const ckDone = d.checklist.filter((c) => c.result).length, safetyOpen = d.checklist.filter((c) => c.section.startsWith('Safety') && !['Pass', 'N/A'].includes(c.result)).length;
    const hours = d.time.reduce((a, t) => a + t.hours, 0), mat = d.materials.reduce((a, m) => a + m.qty * m.unit_cost, 0);
    // actions
    const A = [];
    const st = w.status;
    if (ME.role === 'client') {
      if (st === 'requested') A.push(['cancel', 'Cancel request', 'bad']);
      if (st === 'sent') A.push(['signoff', 'Read & sign off report', '']);
      if (['sent', 'closed'].includes(st)) A.push(['report', 'Report (PDF)', 'ghost']);
    } else {
      if (SUP()) {
        if (st === 'requested') A.push(['accept', 'Accept request', '']);
        if (['requested', 'open'].includes(st)) A.push(['assign', 'Assign technician', st === 'open' ? '' : 'ghost']);
        if (['assigned', 'in_progress', 'on_hold'].includes(st)) A.push(['assign', 'Reassign', 'ghost']);
        if (st === 'completed') A.push(['reviewed', 'Mark as reviewed', 'ok']);
        const ap = d.approval || {};
        if (can.approve && ['completed', 'reviewed'].includes(st) && !(ap.separate && (st !== 'reviewed' || w.reviewed_by === ME.id))) A.push(['approved', 'Approve job', 'ok']);
        if (['completed', 'reviewed'].includes(st)) A.push(['sendback', 'Send back for rework', 'bad']);
        if (BOSS() && st === 'approved') A.push(['release', 'Send report to client', '']);
        if (BOSS() && st === 'sent') A.push(['share', 'Share report again', 'ghost']);
        if (BOSS() && ['approved', 'sent'].includes(st)) A.push(['close', 'Close job', 'ghost']);
      }
      if (onTeamMe || SUP()) {
        if (st === 'assigned') A.push(['start', 'Start job', '']);
        if (st === 'on_hold') A.push(['start', 'Resume job', '']);
        if (['assigned', 'in_progress'].includes(st)) A.push(['hold', 'Put on hold', 'ghost']);
        if (st === 'in_progress' && (isLead || SUP())) A.push(['submit', 'Submit completed job', 'ok']);
      }
      if (SUP() && !['sent', 'closed', 'cancelled', 'approved'].includes(st)) A.push(['edit', 'Edit details', 'ghost']);
      if (SUP() && ['requested', 'open', 'assigned', 'on_hold', 'in_progress'].includes(st)) A.push(['cancel', 'Cancel job', 'bad']);
      A.push(['report', ['approved', 'sent', 'closed'].includes(st) ? 'Report (PDF)' : 'Preview report', 'ghost']);
    }
    const tabs = ME.role === 'client' ? [['details', 'Details'], ['activity', 'Messages']] : [['details', 'Details'], ['checklist', `Checklist<span class="n">${ckDone}/${d.checklist.length}</span>`], ['team', `Team & hours<span class="n">${hours}h</span>`], ['tests', `Tests<span class="n">${d.tests.length}</span>`], ['materials', `Materials<span class="n">${d.materials.length}</span>`], ['photos', `Photos<span class="n">${d.photos.length}</span>`], ['activity', 'Activity']];
    if (!tabs.some((t) => t[0] === tab)) tab = 'details';
    let banner = '';
    if (st === 'assigned' && onTeamMe && safetyOpen) banner = `<div class="banner warn">${ic('shield')}<span>Before you start: complete the ${safetyOpen} safety check${safetyOpen > 1 ? 's' : ''} in the Checklist tab (JHA, permit, LOTO, test before touch, PPE).</span></div>`;
    if (st === 'in_progress' && isLead) banner = `<div class="banner info">${ic('wrench')}<span>When the work is done: answer all checks, log hours, add photos, write what was done, then tap "Submit completed job" and sign.</span></div>`;
    if (st === 'on_hold') { const why = (d.activity || []).find((a) => /On hold/.test(a.text)); banner = `<div class="banner bad">${ic('pause')}<span>${esc(why ? why.text : 'On hold')}</span></div>`; }
    const sentBack = (d.activity || []).find((a) => a.kind === 'status');
    if (st === 'in_progress' && sentBack && /rework/.test(sentBack.text)) banner = `<div class="banner bad">${ic('alert')}<span>${esc(sentBack.text)} (${esc(sentBack.who)})</span></div>`;
    if (SUP() && d.approval && d.approval.separate && st === 'reviewed' && w.reviewed_by === ME.id) banner = `<div class="banner info">${ic('users')}<span>You reviewed this job, so another manager must approve it. Review and approval are kept separate (Settings).</span></div>`;
    if (ME.role === 'client' && st === 'sent') banner = `<div class="banner info">${ic('file')}<span>Your report is ready. Read it, then sign off to confirm the work.</span></div>`;
    v.innerHTML = `<div class="jobhead"><a class="link" href="#/${ME.role === 'tech' || ME.role === 'client' ? '' : 'jobs'}">${ic('back', 14)} Back</a>
        <div class="between" style="align-items:flex-start"><div><span class="mono muted">${esc(w.number)}</span><h1>${esc(w.title)}</h1>
        <div class="row" style="margin-top:6px">${sp(st)}${pp(w.priority)}${dp(w.discipline)}<span class="pill">${esc(w.type)}</span></div></div></div>
        ${stepper(w)}${banner}
        <div class="actions">${A.map(([k, l, c]) => `<button class="btn ${c}" data-a="${k}">${l}</button>`).join('')}</div>${ME.role !== 'client' ? clockBox(d) : ''}</div>
      <nav class="tabs">${tabs.map(([k, l]) => `<a href="#/job/${w.id}/${k}" aria-current="${k === tab ? 'page' : 'false'}">${l}</a>`).join('')}</nav>
      <div id="tab"></div>`;
    $$('[data-a]', v).forEach((b) => b.onclick = () => action(b.dataset.a, d, b));
    $$('[data-clk]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/clock`, b.dataset.clk === 'stop' ? { action: 'stop' } : { action: 'start', kind: b.dataset.clk }); toast(b.dataset.clk === 'stop' ? 'Clocked off' : 'Clocked on: ' + d.clock.kinds[b.dataset.clk]); job(v, id, tab); }));
    const T = $('#tab', v);
    const reload = () => job(v, id, tab);
    if (tab === 'details') tabDetails(T, d, can, reload);
    if (tab === 'checklist') tabChecklist(T, d, can, reload);
    if (tab === 'team') tabTeam(T, d, can, reload, hours);
    if (tab === 'tests') tabTests(T, d, can, reload);
    if (tab === 'materials') tabMaterials(T, d, can, reload, mat);
    if (tab === 'photos') tabPhotos(T, d, can, reload);
    if (tab === 'activity') tabActivity(T, d, reload);
  }
  function tabDetails(T, d, can, reload) {
    const w = d.wo;
    const editNotes = can.work && ME.role !== 'client';
    T.innerHTML = `<div class="cols2"><div class="stack">
      <div class="card"><h2 style="margin-bottom:10px">Job</h2><p class="textblock">${esc(w.description || 'No description.')}</p></div>
      ${editNotes ? `<form class="card stack" id="wf"><h2>Job report notes</h2><p class="muted small">These go on the client's report.</p>
        <label class="f">What was found<textarea name="findings" rows="3">${esc(w.findings || '')}</textarea></label>
        <label class="f">Work done<textarea name="work_done" rows="4">${esc(w.work_done || '')}</textarea></label>
        <label class="f">Recommendations<textarea name="recommendations" rows="3">${esc(w.recommendations || '')}</textarea></label>
        <div class="row"><button class="btn">Save notes</button><span class="muted small" id="ws"></span></div></form>`
      : (w.findings || w.work_done || w.recommendations) ? `<div class="card stack">${w.findings ? `<div><h3>What was found</h3><p class="textblock">${esc(w.findings)}</p></div>` : ''}${w.work_done ? `<div><h3>Work done</h3><p class="textblock">${esc(w.work_done)}</p></div>` : ''}${w.recommendations ? `<div><h3>Recommendations</h3><p class="textblock">${esc(w.recommendations)}</p></div>` : ''}</div>` : ''}
      ${ME.role !== 'client' ? failCard(d, can) : ''}
      ${w.tech_sign_name ? `<div class="card"><h3>Signed by technician</h3><p>${esc(w.tech_sign_name)} · ${fdt(w.completed_at)}</p></div>` : ''}
      ${w.client_sign_name ? `<div class="card"><h3>Signed off by client</h3><p>${esc(w.client_sign_name)} · ${fdt(w.signed_at)}</p></div>` : ''}
      </div><div class="stack">
      <div class="card"><dl class="dl">
        <div><dt>Client</dt><dd>${esc(w.client || '—')}</dd></div><div><dt>Site</dt><dd>${esc(w.site || '—')}${w.site_address ? `<br><span class="tiny muted">${esc(w.site_address)}</span>` : ''}</dd></div>
        <div><dt>Equipment</dt><dd>${w.asset_tag ? esc(w.asset_tag + ' · ' + w.asset) : '—'}${w.asset_make ? `<br><span class="tiny muted">${esc([w.asset_make, w.asset_model, w.asset_rating].filter(Boolean).join(' · '))}</span>` : ''}</dd></div>
        <div><dt>Lead technician</dt><dd>${esc(w.lead || 'Not assigned')}${w.lead_phone && ME.role !== 'client' ? `<br><a class="tiny" href="tel:${esc(w.lead_phone)}">${esc(w.lead_phone)}</a>` : ''}</dd></div>
        <div><dt>Foreman</dt><dd>${esc(w.foreman || '—')}</dd></div><div><dt>Requested by</dt><dd>${esc(w.requester || '—')}</dd></div>
        <div><dt>Created</dt><dd>${fdate(w.created_at)}</dd></div><div><dt>Scheduled</dt><dd>${fdate(w.scheduled_date) || '—'}</dd></div><div><dt>Due</dt><dd>${fdate(w.due_date) || '—'}</dd></div>
        ${ME.role !== 'client' ? `<div><dt>Estimated hours</dt><dd>${w.est_hours ?? '—'}</dd></div><div><dt>Quote</dt><dd>${w.quote != null ? money(w.quote) : '—'}</dd></div>` : ''}
        <div><dt>Client ref.</dt><dd>${esc(w.client_ref || '—')}</dd></div>
        ${d.project ? `<div><dt>Project</dt><dd><a href="#/projects/${d.project.id}">${esc(d.project.number)} · ${esc(d.project.name)}</a></dd></div>` : ''}
        ${w.reviewer ? `<div><dt>Reviewed by</dt><dd>${esc(w.reviewer)} · ${fdate(w.reviewed_at)}</dd></div>` : ''}
        ${w.approver ? `<div><dt>Approved by</dt><dd>${esc(w.approver)} · ${fdate(w.approved_at)}</dd></div>` : ''}
      </dl></div>
      ${ME.role !== 'client' ? labourCard(d) : ''}
      ${ME.role !== 'client' ? `<div class="card"><h3>Team</h3><p>${esc([w.lead, ...d.team.map((t) => t.name)].filter(Boolean).join(', ') || 'No one yet')}</p></div>` : ''}
      </div></div>`;
    const f = $('#wf', T);
    if (f) f.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const x = formData(f); await api(`/wo/${w.id}/update`, x); Object.assign(w, x); $('#ws', T).textContent = 'Saved ' + new Date().toLocaleTimeString().slice(0, 5); toast('Notes saved'); }); });
    const ff = $('#ff', T);
    if (ff) ff.addEventListener('submit', (e) => { e.preventDefault(); const x = formData(ff); x.downtime_start = fromLocalInput(x.downtime_start); x.downtime_end = fromLocalInput(x.downtime_end); busy(e.submitter, async () => { await api(`/wo/${w.id}/update`, x); Object.assign(w, x); toast('Failure details saved'); reload(); }); });
  }
  function tabChecklist(T, d, can, reload) {
    const w = d.wo, ro = !can.work;
    const secs = [...new Set(d.checklist.map((c) => c.section))];
    const done = d.checklist.filter((c) => c.result).length;
    T.innerHTML = `<div class="card"><div class="between"><div><b>${done} of ${d.checklist.length} checks answered</b><p class="muted small">${ro ? 'Read only.' : 'Tap Pass, Fail or N/A. Readings and notes save when you leave the box. A failed check needs a note.'}</p></div><span class="muted small" id="sv"></span></div><div class="bar" style="margin-top:10px"><i style="width:${d.checklist.length ? (done / d.checklist.length) * 100 : 0}%"></i></div></div>
      ${secs.map((s) => `<section class="ck-sec"><h3>${s.startsWith('Safety') ? ic('shield', 18) : s.startsWith('Handover') ? ic('check', 18) : ic('wrench', 18)} ${esc(s)}</h3>
        ${d.checklist.filter((c) => c.section === s).map((c) => `<div class="ck r-${c.result.replace('/', '')}" data-id="${c.id}"><span class="it">${esc(c.item)}</span>
          ${ro ? `<span>${c.result ? `<span class="pill ${c.result === 'Pass' ? 's-approved' : c.result === 'Fail' ? 's-on_hold' : ''}">${esc(c.result)}</span>` : '<span class="pill">Not done</span>'}</span>${c.reading || c.note ? `<span class="ro">${esc([c.reading, c.note].filter(Boolean).join(' · '))}</span>` : ''}`
          : `<span class="seg" role="group" aria-label="Result">${['Pass', 'Fail', 'N/A'].map((r) => `<button type="button" class="${r.replace('/', '')}" data-r="${r}" aria-pressed="${c.result === r}">${r}</button>`).join('')}</span>
          <div class="more"><input placeholder="Reading / value" value="${esc(c.reading || '')}" data-k="reading" aria-label="Reading"><input placeholder="${c.result === 'Fail' ? 'What was found? (needed)' : 'Note (optional)'}" value="${esc(c.note || '')}" data-k="note" aria-label="Note"></div>`}
        </div>`).join('')}</section>`).join('')}
      ${ro ? '' : `<form class="card row" id="addck"><input name="item" placeholder="Add an extra check, e.g. Thermal scan of terminal box" style="flex:1;min-width:200px"><button class="btn ghost">${ic('plus', 16)} Add check</button></form>`}`;
    if (ro) return;
    const save = async (el) => {
      const c = d.checklist.find((x) => String(x.id) === el.dataset.id);
      try { await api(`/wo/${w.id}/checklist`, { items: [{ id: c.id, result: c.result, reading: c.reading, note: c.note }] }); $('#sv', T).textContent = 'Saved'; } catch (e) { toast(e.message, true); }
    };
    $$('.ck', T).forEach((el) => {
      const c = d.checklist.find((x) => String(x.id) === el.dataset.id);
      $$('[data-r]', el).forEach((b) => b.onclick = () => {
        c.result = c.result === b.dataset.r ? '' : b.dataset.r;
        $$('[data-r]', el).forEach((x) => x.setAttribute('aria-pressed', x.dataset.r === c.result));
        el.className = 'ck r-' + c.result.replace('/', '');
        $('[data-k="note"]', el).placeholder = c.result === 'Fail' ? 'What was found? (needed)' : 'Note (optional)';
        if (c.result === 'Fail') $('[data-k="note"]', el).focus();
        save(el);
        const dn = d.checklist.filter((x) => x.result).length;
        $('.card b', T).textContent = `${dn} of ${d.checklist.length} checks answered`; $('.card .bar i', T).style.width = (dn / d.checklist.length) * 100 + '%';
      });
      $$('[data-k]', el).forEach((inp) => inp.onchange = () => { c[inp.dataset.k] = inp.value; save(el); });
    });
    $('#addck', T).addEventListener('submit', (e) => { e.preventDefault(); const item = e.target.item.value.trim(); if (!item) return; busy(e.submitter, async () => { await api(`/wo/${w.id}/checklist`, { add: { item } }); toast('Check added'); reload(); }); });
  }
  function tabTeam(T, d, can, reload, hours) {
    const w = d.wo, lead = w.lead_id === ME.id || SUP();
    const canTeam = lead && !['approved', 'sent', 'closed', 'cancelled'].includes(w.status) && ME.role !== 'client';
    const onJob = [w.lead_id, ...d.team.map((t) => t.user_id)];
    const avail = (LK.staff || []).filter((s) => ['tech', 'foreman'].includes(s.role) && !onJob.includes(s.id));
    const per = {}; d.time.forEach((t) => { per[t.worker] = (per[t.worker] || 0) + t.hours; });
    const workers = [['me', 'Me (' + ME.name + ')'], ...(lead ? [...(w.lead_id && w.lead_id !== ME.id ? [['u' + w.lead_id, w.lead + ' (lead)']] : []), ...d.team.filter((t) => t.user_id !== ME.id).map((t) => ['t' + t.id, t.name])] : [])];
    T.innerHTML = `<div class="cols2"><div class="stack">
      <div class="card"><div class="card-h"><h2>Team on this job</h2></div>
        <div class="tw" style="box-shadow:none"><table><tbody>
          <tr><td><b>${esc(w.lead || 'No lead yet')}</b><br><span class="tiny muted">Lead technician${w.lead_trade ? ' · ' + esc(w.lead_trade) : ''}</span></td><td class="n">${per[w.lead] || 0} h</td><td></td></tr>
          ${d.team.map((t) => `<tr><td><b>${esc(t.name)}</b><br><span class="tiny muted">${esc(t.role_text || '')}${t.user_id ? '' : ' · outside helper'}</span></td><td class="n">${per[t.name] || 0} h</td><td class="n">${canTeam ? `<button class="link" data-rm="${t.id}" aria-label="Remove ${esc(t.name)}">${ic('trash', 16)}</button>` : ''}</td></tr>`).join('')}
        </tbody></table></div>
        ${canTeam ? `<form class="stack" id="tf" style="margin-top:12px"><div class="grid2"><label class="f">Add a technician<select name="user_id">${opt(avail.map((s) => [s.id, `${s.name} · ${s.trade || ''} · ${s.active_jobs} active`]), '', 'Choose from the team…')}</select></label>
          <label class="f">…or a helper not in the system<input name="name" placeholder="Name"></label></div>
          <div class="row"><label class="f" style="flex:1;min-width:180px">Role on this job<input name="role_text" placeholder="e.g. Assistant, Rigger, Instrument tech"></label><button class="btn ghost" style="align-self:end">${ic('plus', 16)} Add to team</button></div><p class="err" id="te"></p></form>` : ''}
      </div>
      ${d.clock && d.clock.people.length ? `<div class="card"><div class="card-h"><h2>On the clock</h2><span class="tiny muted">Start / Stop times</span></div><div class="tw" style="box-shadow:none"><table><thead><tr><th>Who</th><th class="n">Work</th><th class="n">Travel / waiting</th><th></th></tr></thead><tbody>${d.clock.people.map((p) => `<tr><td><b>${esc(p.name)}</b>${p.open ? `<br><span class="pill s-in_progress">${esc(d.clock.kinds[p.open])}</span>` : ''}</td><td class="n">${dur(p.work)}</td><td class="n">${dur(p.other)}</td><td class="n">${lead && can.work && p.user_id !== ME.id && p.open ? `<button class="link small" data-cstop="${p.user_id}">Stop</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
      ${lead && can.work && w.status === 'in_progress' ? `<div class="card"><h3>Clock a team member on</h3><div class="row" style="margin-top:8px">${[...(w.lead_id && w.lead_id !== ME.id ? [[w.lead_id, w.lead]] : []), ...d.team.filter((t) => t.user_id && t.user_id !== ME.id).map((t) => [t.user_id, t.name])].map(([u, n]) => `<button class="btn sm ghost" data-cstart="${u}">${ic('play', 13)} ${esc(n)}</button>`).join('') || '<span class="muted small">Add technicians with a login to the team first. Outside helpers are booked by hours only.</span>'}</div></div>` : ''}
      </div>
      <div class="stack"><div class="card"><div class="card-h"><h2>Hours</h2><b>${hours} h</b></div>
        ${d.time.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Date</th><th>Who</th><th class="n">Hours</th><th></th></tr></thead><tbody>${d.time.map((t) => `<tr><td>${fdate(t.date)}</td><td>${esc(t.worker)}${t.note ? `<br><span class="tiny muted">${esc(t.note)}</span>` : ''}</td><td class="n">${t.hours}</td><td class="n">${can.work && (t.added_by === ME.id || lead) ? `<button class="link" data-rt="${t.id}" aria-label="Remove">${ic('trash', 16)}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No hours logged yet.</p>'}
        ${can.work ? `<form class="stack" id="hf" style="margin-top:12px"><div class="grid3"><label class="f">Who<select name="who">${opt(workers)}</select></label><label class="f">Date<input type="date" name="date" value="${today()}"></label><label class="f">Hours<input name="hours" type="number" step="0.25" min="0.25" max="24" required></label></div>
          <label class="f">What was done <span class="hint">(optional)</span><input name="note"></label><button class="btn ghost">${ic('clock', 16)} Log hours</button><p class="err" id="he"></p></form>` : ''}
      </div></div></div>`;
    const tf = $('#tf', T);
    if (tf) tf.addEventListener('submit', (e) => { e.preventDefault(); const x = formData(tf); busy(e.submitter, async () => { await api(`/wo/${w.id}/team`, { user_id: x.user_id || null, name: x.user_id ? '' : x.name, role_text: x.role_text }); toast('Added to the team'); reload(); }, $('#te', T)); });
    $$('[data-rm]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/team`, { remove: b.dataset.rm }); toast('Removed'); reload(); }));
    const hf = $('#hf', T);
    if (hf) hf.addEventListener('submit', (e) => { e.preventDefault(); const x = formData(hf); const body = { date: x.date, hours: x.hours, note: x.note }; if (x.who.startsWith('t')) body.team_id = x.who.slice(1); if (x.who.startsWith('u')) body.user_id = x.who.slice(1); busy(e.submitter, async () => { await api(`/wo/${w.id}/time`, body); toast('Hours logged'); reload(); }, $('#he', T)); });
    $$('[data-rt]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/time`, { remove: b.dataset.rt }); reload(); }));
    $$('[data-cstart]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/clock`, { action: 'start', kind: 'work', user_id: b.dataset.cstart }); toast('Clocked on'); reload(); }));
    $$('[data-cstop]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/clock`, { action: 'stop', user_id: b.dataset.cstop }); toast('Clocked off'); reload(); }));
  }
  function tabTests(T, d, can, reload) {
    const w = d.wo, defs = d.sheet_defs, ro = !can.work;
    const avail = Object.keys(defs).filter((k) => !d.sheets.includes(k));
    const rp = (r) => r ? `<span class="pill ${r === 'Pass' ? 's-approved' : r === 'Fail' ? 's-on_hold' : 's-in_progress'}">${esc(r)}</span>` : '<span class="muted tiny">—</span>';
    T.innerHTML = `<div class="card between"><div><h2>Test sheets</h2><p class="muted small">Results are checked against the limits automatically. Everything here goes on the client report.</p></div>
        ${ro ? '' : `<form class="row" id="as"><select name="sheet" aria-label="Test sheet" style="max-width:280px">${opt(avail.map((k) => [k, defs[k].title]), '', 'Add a test sheet…')}</select><button class="btn ghost">${ic('plus', 16)} Add</button></form>`}</div>
      ${d.sheets.length ? '' : '<p class="empty">No test sheets on this job. Add one above if you need to record test results.</p>'}
      ${d.sheets.map((k) => {
        const S = defs[k], rows = d.tests.filter((t) => t.sheet === k);
        const pass = rows.filter((r) => r.result === 'Pass').length, failN = rows.filter((r) => r.result === 'Fail').length;
        return `<section class="card stack" data-sheet="${k}"><div class="between"><div><h2>${esc(S.title)}</h2><p class="muted tiny">${esc(S.limits)}</p></div>
          <div class="row"><span class="pill">${rows.length} line${rows.length === 1 ? '' : 's'}</span>${pass ? `<span class="pill s-approved">${pass} pass</span>` : ''}${failN ? `<span class="pill s-on_hold">${failN} fail</span>` : ''}
          ${ro ? '' : `<button class="btn sm" data-addrow="${k}">${ic('plus', 14)} Add line</button>${rows.length ? '' : `<button class="link" data-rmsheet="${k}">Remove sheet</button>`}`}</div></div>
          ${rows.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>#</th>${S.cols.map((c) => `<th>${esc(c[1])}</th>`).join('')}<th>Result</th><th>Remarks</th>${S.due ? '<th>Next due</th>' : ''}</tr></thead><tbody>
            ${rows.map((r, i) => `<tr class="${ro ? '' : 'click'}" data-row="${r.id}"><td>${i + 1}</td>${S.cols.map((c) => `<td>${esc(r.data[c[0]] ?? '')}</td>`).join('')}<td>${rp(r.result)}</td><td>${esc(r.remarks || '')}</td>${S.due ? `<td>${fdate(r.next_due)}</td>` : ''}</tr>`).join('')}
          </tbody></table></div>` : '<p class="muted small">No lines yet.</p>'}</section>`;
      }).join('')}`;
    if (ro) return;
    $('#as', T).addEventListener('submit', (e) => { e.preventDefault(); const k = e.target.sheet.value; if (!k) return; busy(e.submitter, async () => { await api(`/wo/${w.id}/sheets`, { add: k }); toast('Sheet added'); reload(); }); });
    $$('[data-rmsheet]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/sheets`, { remove: b.dataset.rmsheet }); reload(); }));
    $$('[data-addrow]', T).forEach((b) => b.onclick = () => rowForm(b.dataset.addrow, null));
    $$('tr[data-row]', T).forEach((tr) => tr.onclick = () => { const r = d.tests.find((x) => String(x.id) === tr.dataset.row); rowForm(r.sheet, r); });
    function rowForm(k, row) {
      const S = defs[k]; let saved = false; const keep = ['location', 'volts', 'class', 'tag', 'interval', 'limit', 'tol', 'min', 'rating', 'machine', 'medium', 'energy', 'by', 'panel', 'range', 'size', 'spec'];
      const field = (c, v) => { const [key, label, t, opts] = c; const val = esc(v ?? ''); return `<label class="f">${esc(label)}${t === 'sel' ? `<select name="${key}">${opt(opts, v, '—')}</select>` : `<input name="${key}" value="${val}" ${t === 'num' ? 'type="number" step="any" inputmode="decimal"' : ''}>`}</label>`; };
      dlg(`${head(esc(S.title), esc(S.limits))}<form class="stack" id="rf"><div class="grid3"><label class="f">Test date<input type="date" name="__date" value="${esc(row ? row.test_date : today())}"></label>${S.cols.map((c) => field(c, row ? row.data[c[0]] : '')).join('')}</div>
        <label class="f">Remarks <span class="hint">(needed if it fails)</span><input name="__remarks" value="${esc(row ? row.remarks || '' : '')}"></label><p class="small" id="rr"></p><p class="err" id="re"></p>
        <div class="acts">${row ? '<button class="btn bad" type="button" id="del">Delete line</button>' : ''}<button class="btn ghost" type="button" data-close>Close</button>${row ? '' : '<button class="btn ghost" type="submit" value="next">Save & next</button>'}<button class="btn" type="submit" value="done">Save</button></div></form>`,
      (dl) => {
        dl.addEventListener('close', () => { if (saved) reload(); });
        const f = $('#rf', dl);
        f.addEventListener('submit', (e) => {
          e.preventDefault(); const x = formData(f), next = e.submitter && e.submitter.value === 'next';
          const data = {}; S.cols.forEach((c) => { data[c[0]] = x[c[0]] || ''; });
          busy(e.submitter, async () => {
            const r = await api(`/wo/${w.id}/test`, { sheet: k, id: row ? row.id : undefined, data, remarks: x.__remarks, test_date: x.__date }); saved = true;
            const msg = r.result ? `Saved: ${r.result}${r.next_due ? ', next test ' + fdate(r.next_due) : ''}` : 'Saved';
            if (next) { S.cols.forEach((c) => { if (!keep.includes(c[0])) { const el = f.querySelector(`[name="${c[0]}"]`); if (el) el.value = ''; } }); f.querySelector('[name="__remarks"]').value = ''; $('#rr', dl).innerHTML = (r.result === 'Fail' ? '<span class="pill s-on_hold">Last line: Fail</span> ' : r.result ? '<span class="pill s-approved">Last line: ' + esc(r.result) + '</span> ' : '') + 'Saved. Enter the next one.'; const first = f.querySelector('input:not([type=date]),select'); if (first) first.focus(); }
            else { dl.close(); toast(msg, r.result === 'Fail'); }
          }, $('#re', dl));
        });
        const del = $('#del', dl); if (del) del.onclick = () => busy(del, async () => { await api(`/wo/${w.id}/test`, { remove: row.id }); saved = true; dl.close(); toast('Line deleted'); });
      }, 'wide');
    }
  }
  function tabPhotos(T, d, can, reload) {
    const w = d.wo;
    T.innerHTML = `${can.work ? `<form class="card stack" id="pf"><h2>Add photos</h2><div class="grid3"><label class="f">Photo<input type="file" name="file" accept="image/*" capture="environment" multiple required></label><label class="f">Stage<select name="stage">${opt(['Before', 'During', 'After', 'Defect'], 'During')}</select></label><label class="f">Caption<input name="caption" placeholder="What does it show?"></label></div><button class="btn ghost">${ic('camera', 16)} Upload</button><p class="err" id="phe"></p></form>` : ''}
      <div class="photos">${d.photos.map((p) => `<figure class="photo" style="margin:0"><img src="/api/photo/${p.id}" alt="${esc(p.caption || 'Job photo')}" loading="lazy" data-cap="${esc((p.stage || '') + (p.caption ? ': ' + p.caption : ''))}"><div><span><span class="pill">${esc(p.stage || '')}</span> ${esc(p.caption || '')}</span>${can.work ? `<button class="link" data-rp="${p.id}" aria-label="Delete photo">${ic('trash', 15)}</button>` : ''}</div></figure>`).join('')}</div>
      ${d.photos.length ? '' : '<p class="empty">No photos yet.</p>'}`;
    const pf = $('#pf', T);
    if (pf) pf.addEventListener('submit', (e) => {
      e.preventDefault(); const files = [...pf.file.files]; if (!files.length) return;
      busy(e.submitter, async () => { for (const [i, f] of files.entries()) { $('#phe', T).textContent = `Uploading ${i + 1} of ${files.length}…`; const data = await resizeImage(f, 1400); await api(`/wo/${w.id}/photo`, { data, stage: pf.stage.value, caption: pf.caption.value }); } toast(files.length > 1 ? files.length + ' photos added' : 'Photo added'); reload(); }, $('#phe', T));
    });
    $$('[data-rp]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/photo`, { remove: b.dataset.rp }); reload(); }));
    $$('.photo img', T).forEach((img) => img.onclick = () => { const o = document.createElement('div'); o.className = 'viewer'; o.innerHTML = `<div><img src="${img.src}" alt=""><p>${img.dataset.cap}</p></div>`; o.onclick = () => o.remove(); document.body.appendChild(o); });
  }
  function tabActivity(T, d, reload) {
    const w = d.wo;
    T.innerHTML = `<form class="card stack" id="cf"><label class="f">${ME.role === 'client' ? 'Send a message to the team' : 'Add a note or message'}<textarea name="text" rows="2" required></textarea></label>
      <div class="row">${ME.role !== 'client' ? '<label class="check"><input type="checkbox" name="to_client"> Also notify the client</label>' : ''}<button class="btn">${ic('msg', 16)} Send</button></div></form>
      <div class="card"><div class="feed">${(d.activity || []).map((a) => `<div class="ev ${a.kind}"><span class="dot">${ic(a.kind === 'comment' ? 'msg' : a.kind === 'photo' ? 'camera' : a.kind === 'time' ? 'clock' : a.kind === 'team' ? 'users' : a.kind === 'material' ? 'box' : 'check', 14)}</span><div><b>${esc(a.who || 'System')}</b> <small>${ago(a.created_at)}</small><p>${esc(a.text)}</p></div></div>`).join('') || '<p class="muted">Nothing yet.</p>'}</div></div>`;
    $('#cf', T).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); busy(e.submitter, async () => { await api(`/wo/${w.id}/comment`, { text: x.text, to_client: !!x.to_client }); toast('Sent'); reload(); }); });
  }

  /* ---------- job actions ---------- */
  async function action(k, d, btn) {
    if (document.querySelector('dialog[open]')) return;
    const w = d.wo, id = w.id, reload = () => route();
    const status = (to, note, extra) => api(`/wo/${id}/status`, { to, note, ...(extra || {}) });
    if (k === 'report') { window.open('/report.html?id=' + id, '_blank'); return; }
    if (k === 'accept') return busy(btn, async () => { await status('open'); toast('Request accepted'); reload(); });
    if (k === 'reviewed') return busy(btn, async () => { await status('reviewed'); toast('Marked as reviewed. The manager has been notified.'); reload(); });
    if (k === 'approved') return busy(btn, async () => { await status('approved'); toast('Job approved'); reload(); });
    if (k === 'close') return busy(btn, async () => { await status('closed'); toast('Job closed'); reload(); });
    if (k === 'start') return busy(btn, async () => {
      try { await status('in_progress'); toast(w.status === 'on_hold' ? 'Job resumed' : 'Job started. Stay safe.'); reload(); }
      catch (e) { if (/safety/i.test(e.message)) { toast(e.message, true); location.hash = `#/job/${id}/checklist`; } else throw e; }
    });
    const reasonDlg = (title, sub, label, to, ok) => dlg(`${head(title, sub)}<form class="stack" id="rf"><label class="f">${label}<textarea name="note" rows="3" required></textarea></label><p class="err" id="re"></p><div class="acts"><button class="btn ghost" type="button" data-close>Back</button><button class="btn">${title}</button></div></form>`,
      (dl) => $('#rf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await status(to, e.target.note.value); dl.close(); toast(ok); reload(); }, $('#re', dl)); }));
    if (k === 'hold') return holdDlg(id, reload);
    if (k === 'cancel') return reasonDlg(ME.role === 'client' ? 'Cancel request' : 'Cancel job', '', 'Reason', 'cancelled', 'Cancelled');
    if (k === 'sendback') return reasonDlg('Send back for rework', 'The lead technician will see your note.', 'What needs to be fixed or added?', 'in_progress', 'Sent back to the technician');
    if (k === 'assign') {
      await refreshLK();
      const techs = LK.staff.filter((s) => ['tech', 'foreman'].includes(s.role));
      const foremen = LK.staff.filter((s) => ['foreman', 'manager', 'admin'].includes(s.role));
      return dlg(`${head('Assign technician', `${esc(w.number)} · ${esc(w.discipline)}`)}<form class="stack" id="af">
        <label class="f">Lead technician<select name="lead_id" required>${opt(techs.map((s) => [s.id, `${s.name} · ${s.trade || s.role} · ${s.active_jobs} active job${s.active_jobs === 1 ? '' : 's'}`]), w.lead_id, 'Choose…')}</select><span class="hint">Technicians with the same trade as the job are best placed. The lead can add their own team.</span></label>
        <div class="grid2"><label class="f">Foreman<select name="foreman_id">${opt(foremen.map((s) => [s.id, s.name]), w.foreman_id || (ME.role === 'foreman' ? ME.id : ''), 'Choose…')}</select></label><label class="f">Scheduled date<input type="date" name="scheduled_date" value="${esc(w.scheduled_date || '')}"></label></div>
        <label class="f">Note for the technician <span class="hint">(optional)</span><textarea name="note" rows="2"></textarea></label>
        <p class="err" id="ae"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Assign</button></div></form>`,
      (dl) => $('#af', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/wo/${id}/assign`, formData(e.target)); dl.close(); toast('Technician assigned and notified'); reload(); }, $('#ae', dl)); }));
    }
    if (k === 'edit') {
      await refreshLK();
      return dlg(`${head('Edit work order', esc(w.number))}<form class="stack" id="ef">
        <label class="f">Title<input name="title" value="${esc(w.title)}" required></label>
        <div class="grid3"><label class="f">Discipline<select name="discipline">${opt(LK.disciplines, w.discipline)}</select></label><label class="f">Type<select name="type">${typeOpts(w.type)}</select></label><label class="f">Priority<select name="priority">${opt(LK.priorities, w.priority)}</select></label></div>
        <div class="grid2"><label class="f">Site<select name="site_id">${opt(LK.sites.filter((s) => s.client_id === w.client_id).map((s) => [s.id, s.name]), w.site_id, '—')}</select></label><label class="f">Equipment<select name="asset_id">${opt(LK.assets.filter((a) => LK.sites.some((s) => s.id === a.site_id && s.client_id === w.client_id)).map((a) => [a.id, a.tag + ' · ' + a.name]), w.asset_id, '—')}</select></label></div>
        <label class="f">Description<textarea name="description" rows="4">${esc(w.description || '')}</textarea></label>
        <div class="grid3"><label class="f">Due<input type="date" name="due_date" value="${esc(w.due_date || '')}"></label><label class="f">Scheduled<input type="date" name="scheduled_date" value="${esc(w.scheduled_date || '')}"></label><label class="f">Estimated hours<input name="est_hours" type="number" step="0.5" value="${esc(w.est_hours ?? '')}"></label></div>
        <div class="grid3"><label class="f">Quote<input name="quote" type="number" step="any" value="${esc(w.quote ?? '')}"></label><label class="f">Client ref.<input name="client_ref" value="${esc(w.client_ref || '')}"></label><label class="f">Project<select name="project_id">${opt((LK.projects || []).filter((p) => p.client_id === w.client_id || p.id === w.project_id).map((p) => [p.id, p.number + ' · ' + p.name]), w.project_id, 'None')}</select></label></div>
        <p class="err" id="ee"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
      (dl) => $('#ef', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/wo/${id}/update`, formData(e.target)); dl.close(); toast('Saved'); reload(); }, $('#ee', dl)); }), 'wide');
    }
    if (k === 'submit') {
      const blank = d.checklist.filter((c) => !c.result).length, failNoNote = d.checklist.filter((c) => c.result === 'Fail' && !c.note).length;
      const emptySheets = d.sheets.filter((k) => !d.tests.some((t) => t.sheet === k)).map((k) => `Test sheet "${d.sheet_defs[k].title}" has no results`); const failNoRemark = d.tests.filter((t) => t.result === 'Fail' && !t.remarks).length;
      const issues = [...emptySheets, failNoRemark && `${failNoRemark} failed test line${failNoRemark > 1 ? 's' : ''} without a remark`, blank && `${blank} checklist item${blank > 1 ? 's' : ''} not answered`, failNoNote && `${failNoNote} failed check${failNoNote > 1 ? 's' : ''} without a note`, !d.time.length && 'No hours logged', !(w.work_done || '').trim() && '"Work done" is empty (Details tab)', d.unplanned && !(w.fail_component && w.fail_mode && w.fail_cause && w.fail_action) && 'Failure details are missing (Details tab)'].filter(Boolean);
      return dlg(`${head('Submit completed job', 'Your foreman will review it before the client gets the report.')}
        ${issues.length ? `<div class="banner warn">${ic('alert')}<span>Still to do:<br>${issues.map(esc).join('<br>')}</span></div>` : `<div class="banner ok">${ic('check')}<span>Checklist, hours and notes are complete. ${d.photos.length} photo${d.photos.length === 1 ? '' : 's'} attached.</span></div>`}
        <form class="stack" id="sf"><label class="f">Your name<input name="sign_name" value="${esc(ME.name)}"></label><div><p class="small" style="font-weight:700;color:var(--muted);margin-bottom:5px">Sign here</p><canvas class="sig" id="sig" aria-label="Signature pad"></canvas><button type="button" class="link" id="clr">Clear signature</button></div>
        <p class="small muted">By signing you confirm the work was done safely and the equipment was left in a safe condition.</p>
        <p class="err" id="se"></p><div class="acts"><button class="btn ghost" type="button" data-close>Back</button><button class="btn ok" ${issues.length ? 'disabled' : ''}>${ic('send', 16)} Sign and submit</button></div></form>`,
      (dl) => { const pad = sigPad($('#sig', dl)); $('#clr', dl).onclick = pad.clear; $('#sf', dl).addEventListener('submit', (e) => { e.preventDefault(); const sign = pad.get(); if (!sign) { $('#se', dl).textContent = 'Please sign in the box.'; return; } busy(e.submitter, async () => { await status('completed', '', { sign, sign_name: e.target.sign_name.value }); dl.close(); toast('Job submitted. Well done.'); reload(); }, $('#se', dl)); }); });
    }
    if (k === 'release' || k === 'share') {
      return busy(btn, async () => {
        const r = await api(`/wo/${id}/release`, {});
        const link = `${location.origin}/report.html?t=${r.token}`;
        const msg = `Hello${w.client_contact ? ' ' + w.client_contact.split(' (')[0] : ''}, the report for job ${w.number} (${w.title}) is ready: ${link}`;
        dlg(`${head('Report sent to the client', `${esc(w.client || '')} has been notified in their portal.`)}<p>You can also send the link directly. Anyone with the link can view and download the PDF.</p>
          <input readonly value="${esc(link)}" id="lk" aria-label="Report link">
          <div class="row"><button class="btn ghost" id="cp">${ic('file', 16)} Copy link</button><a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('msg', 16)} WhatsApp</a>
          <a class="btn ghost" href="mailto:${esc(w.client_email || '')}?subject=${encodeURIComponent('Job report ' + w.number + ': ' + w.title)}&body=${encodeURIComponent(msg)}">${ic('send', 16)} Email</a><a class="btn" href="${esc(link)}" target="_blank" rel="noopener">${ic('download', 16)} Open PDF report</a></div>
          <div class="acts"><button class="btn ghost" data-close>Done</button></div>`,
        (dl) => { $('#cp', dl).onclick = async () => { try { await navigator.clipboard.writeText(link); toast('Link copied'); } catch (e) { $('#lk', dl).select(); } }; dl.addEventListener('close', reload); });
      });
    }
    if (k === 'signoff') {
      return dlg(`${head('Sign off the job', `${esc(w.number)} · ${esc(w.title)}`)}<p>Please read the <a href="/report.html?id=${id}" target="_blank" rel="noopener">job report</a> first. Signing confirms the work was completed to your satisfaction.</p>
        <form class="stack" id="so"><label class="f">Your name<input name="name" value="${esc(ME.name)}" required></label><label class="f">Comment <span class="hint">(optional)</span><textarea name="comment" rows="2"></textarea></label>
        <div><canvas class="sig" id="sig" aria-label="Signature pad"></canvas><button type="button" class="link" id="clr">Clear signature</button></div><p class="err" id="soe"></p>
        <div class="acts"><button class="btn ghost" type="button" data-close>Back</button><button class="btn ok">Sign off</button></div></form>`,
      (dl) => { const pad = sigPad($('#sig', dl)); $('#clr', dl).onclick = pad.clear; $('#so', dl).addEventListener('submit', (e) => { e.preventDefault(); const sign = pad.get(); if (!sign) { $('#soe', dl).textContent = 'Please sign in the box.'; return; } busy(e.submitter, async () => { await api(`/wo/${id}/signoff`, { sign, name: e.target.name.value, comment: e.target.comment.value }); dl.close(); toast('Thank you. The job is signed off.'); reload(); }, $('#soe', dl)); }); });
    }
  }

  /* ---------- assets ---------- */
  async function assets(v) {
    setTitle(ME.role === 'client' ? 'Equipment' : 'Assets');
    await refreshLK();
    const items = (await api('/assets')).items;
    let q = '';
    v.innerHTML = `<div class="between"><label class="search">${ic('search', 16)}<input type="search" id="q" placeholder="Search tag, name, client, make" aria-label="Search"></label>${SUP() ? `<button class="btn" id="add">${ic('plus', 16)} Add asset</button>` : ''}</div><div id="list"></div>`;
    const draw = () => {
      const l = items.filter((a) => !q || [a.tag, a.name, a.client, a.site, a.make, a.model, a.serial].join(' ').toLowerCase().includes(q));
      $('#list', v).innerHTML = l.length ? `<div class="tw"><table><thead><tr><th>Tag</th><th>Equipment</th>${ME.role !== 'client' ? '<th>Client / site</th>' : '<th>Site</th>'}<th>Discipline</th><th>Crit.</th><th class="n">Jobs</th><th>Next planned</th></tr></thead><tbody>${l.map((a) => `<tr class="click" data-id="${a.id}"><td class="mono">${esc(a.tag)}</td><td><b>${esc(a.name)}</b><br><span class="tiny muted">${esc([a.make, a.model, a.rating].filter(Boolean).join(' · '))}</span></td><td>${ME.role !== 'client' ? esc(a.client) + '<br>' : ''}<span class="tiny muted">${esc(a.site)}</span></td><td>${dp(a.discipline)}</td><td>${esc(a.criticality)}</td><td class="n">${a.jobs}</td><td>${fdate(a.next_pm) || '—'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No equipment listed yet.</p>';
      $$('tr[data-id]', v).forEach((tr) => tr.onclick = () => assetDlg(items.find((a) => String(a.id) === tr.dataset.id)));
    };
    draw();
    $('#q', v).oninput = (e) => { q = e.target.value.toLowerCase(); draw(); };
    const add = $('#add', v); if (add) add.onclick = () => assetForm(null);
    async function assetDlg(a) {
      const hist = (await api('/wo?status=&asset=' + a.id)).items;
      dlg(`${head(esc(a.tag + ' · ' + a.name), esc(a.client + ' · ' + a.site))}<dl class="dl"><div><dt>Discipline</dt><dd>${esc(a.discipline)}</dd></div><div><dt>Make / model</dt><dd>${esc([a.make, a.model].filter(Boolean).join(' ') || '—')}</dd></div><div><dt>Serial</dt><dd>${esc(a.serial || '—')}</dd></div><div><dt>Rating</dt><dd>${esc(a.rating || '—')}</dd></div><div><dt>Criticality</dt><dd>${esc(a.criticality)}</dd></div><div><dt>Next planned job</dt><dd>${fdate(a.next_pm) || '—'}</dd></div>${a.run_hours != null ? `<div><dt>Running hours</dt><dd>${num(a.run_hours, 0)} h</dd></div>` : ''}</dl>
        ${ME.role !== 'client' ? `<div id="ax" class="stack"><p class="muted small">Loading spares and condition…</p></div>` : ''}
        <h3>Job history (${hist.length})</h3>${jobList(hist.slice(0, 10), 'No jobs on this equipment yet.')}
        <div class="acts">${SUP() ? '<button class="btn ghost" id="qrb">QR code</button><button class="btn ghost" id="ed">Edit</button>' : ''}<a class="btn" href="#/new/${a.id}">${ic('plus', 16)} ${ME.role === 'client' ? 'Request work' : 'New work order'}</a></div>`,
      (dl) => {
        $$('a', dl).forEach((x) => x.addEventListener('click', () => dl.close())); const e = $('#ed', dl); if (e) e.onclick = () => { dl.close(); assetForm(a); };
        const qb = $('#qrb', dl); if (qb) qb.onclick = () => { dl.close(); qrDlg(a); };
        const ax = $('#ax', dl);
        if (ax) (async () => {
          const [st, cm] = await Promise.all([api('/stores').catch(() => null), api('/cm').catch(() => null)]);
          const sp = st ? st.parts.filter((p) => (p.used_on || '').split(', ').includes(a.tag)) : [];
          const pts = cm ? cm.items.filter((p) => p.asset_id === a.id) : [];
          ax.innerHTML = `<div class="grid2"><div><h3>Spares</h3>${sp.length ? sp.map((p) => `<p class="small"><b>${esc(p.part_no)}</b> ${esc(p.name)} · <span class="${p.low ? 'bad' : 'muted'}">${num(p.total)} ${esc(p.unit)} in stock</span></p>`).join('') : '<p class="muted small">No spares linked.</p>'}${SUP() ? '<button class="link small" id="lnk">Link a spare part</button>' : ''}</div>
            <div><h3>Condition</h3>${pts.length ? pts.map((p) => `<div class="between small" style="gap:6px"><span>${esc(p.name)}<br>${cmPill(p.last_status)} <b>${p.last_value ?? '—'}</b> ${esc(p.unit || '')}</span>${spark(p.history.map((h) => h.value), { w: 110, h: 32, lines: [p.warn, p.alarm] })}</div>`).join('') : '<p class="muted small">No measurement points.</p>'}</div></div>`;
          const lk = $('#lnk', ax); if (lk) lk.onclick = () => { dl.close(); linkDlg(null, a.id, route); };
        })();
      }, 'wide');
    }
    function assetForm(a) {
      a = a || {};
      dlg(`${head(a.id ? 'Edit asset' : 'Add asset')}<form class="stack" id="af"><div class="grid2"><label class="f">Tag<input name="tag" value="${esc(a.tag || '')}" required placeholder="e.g. PMP-04"></label><label class="f">Name<input name="name" value="${esc(a.name || '')}" required></label></div>
        <label class="f">Site<select name="site_id" required>${opt(LK.sites.map((s) => [s.id, `${(LK.clients.find((c) => c.id === s.client_id) || {}).name} · ${s.name}`]), a.site_id, 'Choose…')}</select></label>
        <div class="grid3"><label class="f">Discipline<select name="discipline">${opt(LK.disciplines, a.discipline || 'Electrical')}</select></label><label class="f">Criticality<select name="criticality">${opt([['A', 'A · stops production'], ['B', 'B · slows production'], ['C', 'C · can wait']], a.criticality || 'B')}</select></label><label class="f">Rating<input name="rating" value="${esc(a.rating || '')}" placeholder="kW, V, A, range"></label></div>
        <div class="grid3"><label class="f">Make<input name="make" value="${esc(a.make || '')}"></label><label class="f">Model<input name="model" value="${esc(a.model || '')}"></label><label class="f">Serial no.<input name="serial" value="${esc(a.serial || '')}"></label></div>
        <div class="grid2"><label class="f">Notes<input name="notes" value="${esc(a.notes || '')}"></label><label class="f">Running hours (hour meter)<input name="run_hours" type="number" step="any" min="0" value="${esc(a.run_hours ?? '')}"></label></div><p class="err" id="ae"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
      (dl) => $('#af', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/assets', { ...formData(e.target), id: a.id }); dl.close(); toast('Saved'); route(); }, $('#ae', dl)); }), 'wide');
    }
  }

  /* ---------- PM plans ---------- */
  async function pm(v) {
    setTitle('Maintenance plans');
    await refreshLK();
    const items = (await api('/pm')).items; const t = today();
    v.innerHTML = `<div class="between"><p class="muted" style="max-width:70ch">Planned jobs are created automatically up to 7 days before they are due (or when the machine reaches its running hours), assigned to the plan's foreman, with the spares reserved in stores.</p><div class="row"><button class="btn ghost" id="gen">${ic('refresh', 16)} Create due jobs now</button><button class="btn" id="add">${ic('plus', 16)} Add plan</button></div></div>
      ${items.length ? `<div class="tw"><table><thead><tr><th>Plan</th><th>Asset</th><th>Type</th><th class="n">Every</th><th>Next due</th><th>Foreman</th><th></th></tr></thead><tbody>${items.map((p) => `<tr class="click" data-id="${p.id}"><td><b>${esc(p.title)}</b><br>${dp(p.discipline)}</td><td>${esc(p.tag)} · ${esc(p.asset)}<br><span class="tiny muted">${esc(p.client)} · ${esc(p.site)}</span></td><td>${esc(p.type)}</td><td class="n">${p.every_days < 3650 ? p.every_days + ' days' : ''}${p.every_hours ? `${p.every_days < 3650 ? '<br>' : ''}<span class="small">${num(p.every_hours, 0)} run h</span>` : ''}</td><td style="${p.next_due < t ? 'color:var(--bad);font-weight:700' : ''}">${fdate(p.next_due)}</td><td>${esc(p.foreman || '—')}</td><td>${p.active ? '<span class="pill s-approved">Active</span>' : '<span class="pill">Paused</span>'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No maintenance plans yet.</p>'}`;
    $('#gen', v).onclick = (e) => busy(e.currentTarget, async () => { const r = await api('/pm', { generate: true }); toast(r.created.length ? `${r.created.length} job${r.created.length > 1 ? 's' : ''} created: ${r.created.join(', ')}` : 'Nothing is due in the next 7 days'); route(); });
    $('#add', v).onclick = () => form(null);
    $$('tr[data-id]', v).forEach((tr) => tr.onclick = () => form(items.find((p) => String(p.id) === tr.dataset.id)));
    function form(p) {
      p = p || { active: 1 };
      const foremen = LK.staff.filter((s) => ['foreman', 'manager', 'admin'].includes(s.role));
      dlg(`${head(p.id ? 'Edit plan' : 'Add maintenance plan')}<form class="stack" id="pf"><label class="f">What is the planned job?<input name="title" value="${esc(p.title || '')}" required placeholder="e.g. Monthly motor inspection"></label>
        <label class="f">Asset<select name="asset_id" required>${opt(LK.assets.map((a) => [a.id, a.tag + ' · ' + a.name]), p.asset_id, 'Choose…')}</select></label>
        <div class="grid2"><label class="f">Discipline<select name="discipline">${opt(LK.disciplines, p.discipline || 'Electrical')}</select></label><label class="f">Type<select name="type">${typeOpts(p.type || 'Preventive maintenance')}</select></label></div>
        <div class="grid3"><label class="f">Every (days)<input name="every_days" type="number" min="1" value="${esc(p.every_days && p.every_days < 3650 ? p.every_days : p.id ? '' : 30)}"><span class="hint">Blank if it only goes by running hours</span></label><label class="f">…or every (running hours)<input name="every_hours" type="number" min="10" step="any" value="${esc(p.every_hours ?? '')}"><span class="hint">Whichever comes first. Needs an hour meter reading.</span></label><label class="f">Next due<input name="next_due" type="date" value="${esc(p.next_due || today())}"></label></div>
        <label class="f" style="max-width:200px">Est. hours<input name="est_hours" type="number" step="0.5" value="${esc(p.est_hours ?? '')}"></label>
        <label class="f">Foreman<select name="foreman_id">${opt(foremen.map((s) => [s.id, s.name]), p.foreman_id, 'Any foreman')}</select></label>
        <label class="check"><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Active</label><p class="err" id="pe"></p>
        <div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
      (dl) => $('#pf', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.active = !!x.active; busy(e.submitter, async () => { await api('/pm', { ...x, id: p.id }); dl.close(); toast('Saved'); route(); }, $('#pe', dl)); }), 'wide');
    }
  }

  /* ---------- test & tag register ---------- */
  async function register(v) {
    setTitle(ME.role === 'client' ? 'Tagged items' : 'Test & tag register');
    const d = await api('/register'); const t = d.today;
    const soon = (() => { const x = new Date(); x.setDate(x.getDate() + 30); return x.toISOString().slice(0, 10); })();
    const status = (r) => r.result === 'Fail' ? ['Failed, out of service', 's-on_hold'] : !r.next_due ? ['No due date', ''] : r.next_due < t ? ['Overdue', 's-on_hold'] : r.next_due <= soon ? ['Due within 30 days', 's-in_progress'] : ['In date', 's-approved'];
    let f = 'all', q = '';
    v.innerHTML = `<div class="between"><p class="muted" style="max-width:70ch">Every portable appliance and lifting item tested, its last result and when it is due again. Each line comes from a test sheet on a work order.</p>${SUP() ? `<a class="btn ghost" href="/api/export/tests">${ic('download', 16)} All test results (CSV)</a>` : ''}</div>
      <div class="kpis"><div class="kpi"><span>Items on register</span><b>${d.items.length}</b></div><div class="kpi alert"><span>Overdue</span><b>${d.items.filter((r) => r.result !== 'Fail' && r.next_due && r.next_due < t).length}</b></div><div class="kpi"><span>Due in 30 days</span><b>${d.items.filter((r) => r.next_due && r.next_due >= t && r.next_due <= soon).length}</b></div><div class="kpi alert"><span>Failed</span><b>${d.items.filter((r) => r.result === 'Fail').length}</b></div></div>
      <div class="toolbar"><label class="search">${ic('search', 16)}<input type="search" id="q" placeholder="Search tag, item, location, client" aria-label="Search"></label><div class="chips">${[['all', 'All'], ['due', 'Overdue or due soon'], ['fail', 'Failed']].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === f}">${l}</button>`).join('')}</div></div><div id="list"></div>`;
    const draw = () => {
      let l = d.items.filter((r) => f === 'all' || (f === 'fail' ? r.result === 'Fail' : r.result !== 'Fail' && r.next_due && r.next_due <= soon));
      if (q) l = l.filter((r) => [r.data.tag_no, r.data.item, r.data.location, r.client, r.site, r.number].join(' ').toLowerCase().includes(q));
      $('#list', v).innerHTML = l.length ? `<div class="tw"><table><thead><tr><th>Tag / ID</th><th>Item</th><th>Location</th>${ME.role !== 'client' ? '<th>Client</th>' : ''}<th>Tested</th><th>Tag</th><th>Next due</th><th>Status</th><th>Job</th></tr></thead><tbody>${l.map((r) => { const s2 = status(r); return `<tr><td class="mono">${esc(r.data.tag_no || '—')}</td><td><b>${esc(r.data.item || '')}</b><br><span class="tiny muted">${r.sheet === 'lift' ? 'Lifting equipment' + (r.data.swl ? ' · SWL ' + esc(r.data.swl) : '') : 'Class ' + esc(r.data.class || '?')}</span></td><td>${esc(r.data.location || '')}<br><span class="tiny muted">${esc(r.site || '')}</span></td>${ME.role !== 'client' ? `<td>${esc(r.client || '')}</td>` : ''}<td>${fdate(r.test_date)}<br><span class="tiny muted">${esc(r.tester || '')}</span></td><td>${esc(r.data.tag || '')}</td><td>${fdate(r.next_due) || '—'}</td><td><span class="pill ${s2[1]}">${s2[0]}</span></td><td><a class="mono" href="#/job/${r.wo_id}">${esc(r.number)}</a></td></tr>`; }).join('')}</tbody></table></div>` : '<p class="empty">Nothing on the register yet. Results appear here when a Test & tag or Lifting equipment sheet is filled in on a job.</p>';
    };
    draw();
    $('#q', v).oninput = (e) => { q = e.target.value.toLowerCase(); draw(); };
    $$('[data-f]', v).forEach((b) => b.onclick = () => { f = b.dataset.f; $$('[data-f]', v).forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); });
  }

  /* ---------- clients ---------- */
  async function clients(v) {
    setTitle('Clients & sites');
    const d = await api('/clients');
    v.innerHTML = `<div class="between"><p class="muted">Client companies, their sites and portal logins. Create client logins under People & logins.</p>${BOSS() ? `<button class="btn" id="add">${ic('plus', 16)} Add client</button>` : ''}</div>
      <div class="stack">${d.items.map((c) => `<div class="card"><div class="card-h"><div><h2>${esc(c.name)}</h2><p class="muted small">${esc([c.contact, c.phone, c.email].filter(Boolean).join(' · '))}</p></div><div class="row"><span class="pill">${c.open_jobs} open job${c.open_jobs === 1 ? '' : 's'}</span><span class="pill">${c.logins} login${c.logins === 1 ? '' : 's'}</span>${c.white_label ? '<span class="pill s-in_progress">White label</span>' : ''}${BOSS() ? `<button class="btn ghost sm" data-ec="${c.id}">Edit</button>` : ''}<button class="btn ghost sm" data-as="${c.id}">${ic('plus', 14)} Site</button></div></div>
        ${d.sites.filter((s) => s.client_id === c.id).map((s) => `<div class="between" style="padding:8px 0;border-top:1px solid var(--line2)"><span>${ic('pin', 14)} <b>${esc(s.name)}</b> <span class="muted small">${esc(s.address || '')}</span></span><span class="row"><span class="tiny muted">${s.assets} assets</span><button class="link" data-es="${s.id}">Edit</button></span></div>`).join('') || '<p class="muted small">No sites yet.</p>'}</div>`).join('') || '<p class="empty">No clients yet.</p>'}</div>`;
    const cform = (c) => { c = c || {}; dlg(`${head(c.id ? 'Edit client' : 'Add client')}<form class="stack" id="cf"><label class="f">Company name<input name="name" value="${esc(c.name || '')}" required></label><div class="grid2"><label class="f">Contact person<input name="contact" value="${esc(c.contact || '')}"></label><label class="f">Phone<input name="phone" value="${esc(c.phone || '')}"></label></div><label class="f">Email<input name="email" type="email" value="${esc(c.email || '')}"></label><label class="f">Address<input name="address" value="${esc(c.address || '')}"></label><label class="f">Notes<textarea name="notes" rows="2">${esc(c.notes || '')}</textarea></label>
      <fieldset class="card" style="box-shadow:none"><legend class="small" style="font-weight:700;padding:0 6px">Client branding</legend><div class="grid3"><label class="f">Client logo<input type="file" id="clg" accept="image/*"><span class="hint">Shown on their reports</span></label><div>${c.logo ? `<img src="${esc(c.logo)}" alt="" style="max-height:50px;max-width:150px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:4px"><br><label class="check tiny"><input type="checkbox" name="clear_logo"> Remove logo</label>` : '<span class="muted small">No logo</span>'}</div><label class="f">Colour<input type="color" name="color" value="${esc(c.color || '#1f5aa6')}" class="swatch"></label></div>
      <label class="check"><input type="checkbox" name="white_label" ${c.white_label ? 'checked' : ''}> White label: their staff see the client portal in their own logo and colour</label></fieldset><p class="err" id="ce"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`, (dl) => { let lg = null; $('#clg', dl).onchange = async (ev) => { const f = ev.target.files[0]; if (!f) return; try { lg = await resizeImage(f, 400, 'image/png'); toast('Logo ready. Press Save.'); } catch (er) { toast(er.message, true); } };
      $('#cf', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.white_label = !!x.white_label; x.logo = lg || (x.clear_logo ? '' : c.logo || ''); delete x.clear_logo; busy(e.submitter, async () => { await api('/clients', { ...x, id: c.id }); dl.close(); toast('Saved'); route(); }, $('#ce', dl)); }); }, 'wide'); };
    const sform = (s) => { dlg(`${head(s.id ? 'Edit site' : 'Add site')}<form class="stack" id="sf"><label class="f">Client<select name="client_id">${opt(d.items.map((c) => [c.id, c.name]), s.client_id)}</select></label><label class="f">Site name<input name="name" value="${esc(s.name || '')}" required></label><label class="f">Address / directions<input name="address" value="${esc(s.address || '')}"></label><p class="err" id="se"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`, (dl) => $('#sf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/sites', { ...formData(e.target), id: s.id }); dl.close(); toast('Saved'); route(); }, $('#se', dl)); })); };
    const add = $('#add', v); if (add) add.onclick = () => cform(null);
    $$('[data-ec]', v).forEach((b) => b.onclick = () => cform(d.items.find((c) => String(c.id) === b.dataset.ec)));
    $$('[data-as]', v).forEach((b) => b.onclick = () => sform({ client_id: Number(b.dataset.as) }));
    $$('[data-es]', v).forEach((b) => b.onclick = () => sform(d.sites.find((s) => String(s.id) === b.dataset.es)));
  }

  /* ---------- users ---------- */
  async function users(v) {
    setTitle('People & logins');
    await refreshLK();
    const items = (await api('/users')).items;
    v.innerHTML = `<div class="between"><p class="muted">Everyone who can sign in: staff and client logins. New people get a temporary password and choose their own when they first sign in.</p><button class="btn" id="add">${ic('plus', 16)} Add person</button></div>
      <div class="tw"><table><thead><tr><th>Name</th><th>Role</th><th>Trade / client</th><th>Last sign-in</th><th>Status</th></tr></thead><tbody>${items.map((u) => `<tr class="click" data-id="${u.id}"><td><b>${esc(u.name)}</b><br><span class="tiny muted">${esc(u.email)}</span></td><td>${ROLE[u.role]}</td><td>${esc(u.role === 'client' ? u.client || '' : u.trade || '')}</td><td>${u.last_login ? ago(u.last_login) : '<span class="muted">Never</span>'}</td><td>${u.status === 'active' ? (u.must_change ? '<span class="pill s-in_progress">Temp password</span>' : '<span class="pill s-approved">Active</span>') : '<span class="pill">Switched off</span>'}</td></tr>`).join('')}</tbody></table></div>`;
    const showPw = (email, pw) => dlg(`${head('Login details')}<p>Send these to <b>${esc(email)}</b>. They will choose their own password when they first sign in.</p><div class="secret">${esc(pw)}</div><p class="small muted">Sign-in page: ${esc(location.origin)}</p><div class="acts"><a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(`Your ${SET.short || ''} work orders login: ${location.origin}  Email: ${email}  Temporary password: ${pw}`)}" target="_blank" rel="noopener">${ic('msg', 16)} Send on WhatsApp</a><button class="btn" data-close>Done</button></div>`);
    const form = (u) => {
      const isNew = !u; u = u || { role: 'tech', status: 'active' };
      dlg(`${head(isNew ? 'Add person' : 'Edit ' + esc(u.name))}<form class="stack" id="uf"><div class="grid2"><label class="f">Full name<input name="name" value="${esc(u.name || '')}" required></label><label class="f">Email<input name="email" type="email" value="${esc(u.email || '')}" ${isNew ? 'required' : 'disabled'}></label></div>
        <div class="grid3"><label class="f">Role<select name="role" id="rl">${opt(Object.entries(ROLE).filter(([k]) => k !== 'admin' || ME.role === 'admin'), u.role)}</select></label><label class="f" id="tr"><span id="trl">Trade</span><select name="trade" id="trs">${opt(['Electrical', 'Mechanical', 'Automation', 'Instrumentation', 'Multi'], u.trade || 'Electrical')}</select></label><label class="f" id="cl">Client company<select name="client_id">${opt(LK.clients.map((c) => [c.id, c.name]), u.client_id, 'Choose…')}</select></label><label class="f">Phone<input name="phone" value="${esc(u.phone || '')}"></label></div>
        ${isNew ? '' : `<label class="f">Status<select name="status">${opt([['active', 'Active'], ['disabled', 'Switched off']], u.status)}</select></label>`}
        <p class="err" id="ue"></p><div class="acts">${isNew ? '' : '<button class="btn ghost" type="button" id="rs">Reset password</button>'}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">${isNew ? 'Create login' : 'Save'}</button></div></form>`,
      (dl) => {
        const sync = () => { const rv = $('#rl', dl).value, c = rv === 'client', dep = ['stores', 'dept'].includes(rv); $('#tr', dl).hidden = c; $('#cl', dl).hidden = !c; $('#trl', dl).textContent = dep ? 'Department' : 'Trade'; const cur = $('#trs', dl).value; const list = dep ? (LK.departments || []) : ['Electrical', 'Mechanical', 'Automation', 'Instrumentation', 'Multi']; $('#trs', dl).innerHTML = opt(list, list.includes(cur) ? cur : rv === 'stores' ? 'Stores' : list[0]); }; $('#rl', dl).onchange = sync; sync();
        $('#uf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const x = formData(e.target); if (isNew) { const r = await api('/users', x); dl.close(); showPw(x.email, r.password); } else { await api('/users/' + u.id, x); dl.close(); toast('Saved'); } route(); }, $('#ue', dl)); });
        const rs = $('#rs', dl); if (rs) rs.onclick = () => busy(rs, async () => { const r = await api('/users/' + u.id, { reset: true }); dl.close(); showPw(u.email, r.password); });
      }, 'wide');
    };
    $('#add', v).onclick = () => form(null);
    $$('tr[data-id]', v).forEach((tr) => tr.onclick = () => form(items.find((u) => String(u.id) === tr.dataset.id)));
  }

  /* ---------- reports ---------- */
  async function reports(v) {
    setTitle('Reports');
    const all = (await api('/wo?status=')).items;
    const t = today(); let from = t.slice(0, 8) + '01', to = t;
    v.innerHTML = `<div class="card row"><label class="f">From<input type="date" id="fr" value="${from}"></label><label class="f">To<input type="date" id="to" value="${to}"></label><div class="row" style="align-self:end">${[['This month', 0], ['Last 3 months', 90], ['This year', 365]].map(([l, n]) => `<button class="chip" data-p="${n}">${l}</button>`).join('')}</div></div><div id="rp"></div>`;
    const draw = () => {
      const inR = all.filter((w) => w.created_at.slice(0, 10) >= from && w.created_at.slice(0, 10) <= to);
      const done = all.filter((w) => w.completed_at && w.completed_at.slice(0, 10) >= from && w.completed_at.slice(0, 10) <= to);
      const grp = (list, k) => { const m = {}; list.forEach((w) => { m[w[k] || '—'] = (m[w[k] || '—'] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
      const box = (title, rows) => { const mx = Math.max(1, ...rows.map((r) => r[1])); return `<div class="card"><h2 style="margin-bottom:12px">${title}</h2><div class="workload">${rows.map(([l, n]) => `<div class="wl"><span>${esc(l)}</span><span class="bt"><i style="width:${(n / mx) * 100}%"></i></span><b>${n}</b></div>`).join('') || '<p class="muted">No data</p>'}</div></div>`; };
      const hrs = done.reduce((a, w) => a + w.hours, 0);
      const q = `from=${from}&to=${to}`;
      $('#rp', v).innerHTML = `<div class="kpis"><div class="kpi"><span>Jobs created</span><b>${inR.length}</b></div><div class="kpi"><span>Jobs completed</span><b>${done.length}</b></div><div class="kpi"><span>Hours on completed jobs</span><b>${hrs}</b></div><div class="kpi"><span>Breakdowns</span><b>${inR.filter((w) => w.type === 'Breakdown').length}</b></div></div>
        <div class="card"><h2>Download for Excel</h2><p class="muted small" style="margin:4px 0 12px">CSV files open in Excel and Google Sheets. Use them for invoicing, payroll and monthly client reports.</p><div class="row"><a class="btn ghost" href="/api/export/workorders?${q}">${ic('download', 16)} Work orders with value</a><a class="btn ghost" href="/api/export/timesheets?${q}">${ic('download', 16)} Timesheets</a><a class="btn ghost" href="/api/export/materials?${q}">${ic('download', 16)} Materials used</a><a class="btn ghost" href="/api/export/tests?${q}">${ic('download', 16)} Test results</a><a class="btn ghost" href="/api/export/moves?${q}">${ic('download', 16)} Stock movements</a><a class="btn ghost" href="/api/export/stock">${ic('download', 16)} Stock on hand</a></div><p class="small" style="margin-top:10px">${ic('chart', 14)} Reliability, labour utilisation and the monthly management PDF are under <a href="#/analysis">Analysis</a>.</p></div>
        <div class="grid2">${box('Jobs by client', grp(inR, 'client'))}${box('Jobs by type', grp(inR, 'type'))}${box('Jobs by discipline', grp(inR, 'discipline'))}${box('Completed by lead technician', grp(done, 'lead'))}</div>`;
    };
    draw();
    $('#fr', v).onchange = (e) => { from = e.target.value; draw(); }; $('#to', v).onchange = (e) => { to = e.target.value; draw(); };
    $$('[data-p]', v).forEach((b) => b.onclick = () => { const n = +b.dataset.p; to = t; from = n === 0 ? t.slice(0, 8) + '01' : n === 365 ? t.slice(0, 5) + '01-01' : (() => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); })(); $('#fr', v).value = from; $('#to', v).value = to; draw(); });
  }

  /* ---------- settings & account ---------- */
  async function settingsView(v) {
    setTitle('Settings');
    const s = SET;
    v.innerHTML = `<form class="card stack" id="sf" style="max-width:860px"><h2>Company and report</h2><p class="muted small">This appears on the sign-in page, the app and every PDF report.</p>
      <div class="grid2"><label class="f">Company name<input name="company" value="${esc(s.company)}"></label><label class="f">Short name<input name="short" value="${esc(s.short)}" maxlength="20"></label></div>
      <label class="f">Tagline<input name="tagline" value="${esc(s.tagline)}"></label>
      <div class="grid3"><label class="f">Phone<input name="phone" value="${esc(s.phone)}"></label><label class="f">Email<input name="email" value="${esc(s.email)}"></label><label class="f">Website<input name="website" value="${esc(s.website)}"></label></div>
      <label class="f">Address<input name="address" value="${esc(s.address)}"></label>
      <div class="grid3"><label class="f">Logo<input type="file" id="lg" accept="image/*"><span class="hint">PNG or JPG, shown on reports</span></label><div>${s.logo ? `<img src="${esc(s.logo)}" alt="Current logo" style="max-height:60px;max-width:180px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:4px">` : '<span class="muted small">No logo yet</span>'}</div><label class="f">Brand colour<input type="color" name="color" value="${esc(s.color)}" class="swatch"></label></div>
      <h2 style="margin-top:8px">Costing</h2><div class="grid3"><label class="f">Currency<input name="currency" value="${esc(s.currency)}" maxlength="6"></label><label class="f">Labour rate per hour<input name="labour_rate" type="number" step="any" value="${esc(s.labour_rate)}"></label><label class="f">VAT %<input name="vat" type="number" step="any" value="${esc(s.vat)}"></label></div>
      <label class="check"><input type="checkbox" name="report_costs" ${s.report_costs === '1' ? 'checked' : ''}> Show labour, materials and totals on client reports</label>
      <label class="f">Report footer<textarea name="report_footer" rows="2">${esc(s.report_footer)}</textarea></label>
      <h2 style="margin-top:8px">Approvals and labour</h2>
      <label class="check"><input type="checkbox" name="separate_approval" ${s.separate_approval !== '0' ? 'checked' : ''}> Review and approval must be done by different people</label>
      <div class="grid3"><label class="f">Foreman approval limit (${esc(s.currency || 'USD')})<input name="approval_limit" type="number" min="0" step="any" value="${esc(s.approval_limit || '0')}"><span class="hint">0 = only managers approve. Above 0, foremen may approve jobs up to this value.</span></label><label class="f">Shift length (hours)<input name="shift_hours" type="number" min="1" max="24" step="0.5" value="${esc(s.shift_hours || '8')}"></label><label class="f">Working days a week<input name="work_days" type="number" min="1" max="7" value="${esc(s.work_days || '5')}"><span class="hint">Used for labour utilisation and backlog weeks</span></label></div>
      <h2 style="margin-top:8px">Stores</h2>
      <label class="check"><input type="checkbox" name="stores_control" ${s.stores_control !== '0' ? 'checked' : ''}> Parts are issued by the stores only (technicians request them on the job)</label>
      <label class="check"><input type="checkbox" name="req_approval" ${s.req_approval !== '0' ? 'checked' : ''}> Department requests not for a job need a foreman or manager to approve</label>
      <label class="f" style="max-width:300px">Purchase orders above this need a manager (${esc(s.currency || 'USD')})<input name="po_limit" type="number" min="0" step="any" value="${esc(s.po_limit || '1000')}"><span class="hint">0 = the stores can send any order</span></label>
      <h2 style="margin-top:8px">Alerts, reminders and SMS</h2><p class="muted small">Phone alerts are free and need no setup: each person turns them on under My account. SMS text messages need an account with an SMS provider and are only sent for urgent jobs, urgent notices and reminders you mark for SMS.</p>
      <div class="grid3"><label class="f">Daily job reminders at<select name="reminder_hour">${opt(Array.from({ length: 24 }, (_, h) => [h, String(h).padStart(2, '0') + ':00']), s.reminder_hour || 6)}</select></label><label class="f">Time zone<select name="tz">${opt([[0, 'UTC / GMT'], [60, 'UTC+1 (Lagos, Kinshasa)'], [120, 'UTC+2 (Harare, Lusaka, Johannesburg)'], [180, 'UTC+3 (Nairobi, Dar es Salaam)'], [240, 'UTC+4 (Dubai)']], s.tz || 120)}</select></label><label class="f">Country code<input name="sms_country" value="${esc(s.sms_country || '263')}" maxlength="4" inputmode="numeric"><span class="hint">Used for numbers saved like 077…</span></label></div>
      <div class="grid2"><label class="f">SMS provider<select name="sms_provider" id="smp">${opt([['none', 'No SMS'], ['africastalking', "Africa's Talking"], ['twilio', 'Twilio'], ['webhook', 'Other (webhook)']], s.sms_provider || 'none')}</select></label><label class="f" id="smf">Sender name or number<input name="sms_from" value="${esc(s.sms_from || '')}" maxlength="20"></label></div>
      <div class="grid2" id="smx"><label class="f"><span id="smul">Username</span><input name="sms_user" value="${esc(s.sms_user || '')}" autocomplete="off"></label><label class="f"><span id="smtl">API key</span><input name="sms_token" type="password" autocomplete="new-password" placeholder="${s.sms_token_set ? 'Saved. Type to replace.' : ''}"></label></div>
      <div class="row" id="smt"><button class="btn ghost" type="button" id="smtest">${ic('phone', 16)} Send a test SMS to my phone</button><span class="hint">Save first. Goes to the number under My account.</span></div>
      <p class="err" id="se"></p><div class="row"><button class="btn">Save settings</button></div></form>`;
    let logo = null;
    const smp = $('#smp', v), smx = () => { const p = smp.value; $('#smx', v).hidden = $('#smf', v).hidden = $('#smt', v).hidden = p === 'none'; $('#smf', v).hidden = p === 'none' || p === 'webhook'; $('#smul', v).textContent = p === 'twilio' ? 'Account SID' : p === 'webhook' ? 'Webhook link (https)' : 'Username'; $('#smtl', v).textContent = p === 'twilio' ? 'Auth token' : p === 'webhook' ? 'Bearer token (optional)' : 'API key'; };
    smp.onchange = smx; smx();
    $('#smtest', v).onclick = (e) => busy(e.currentTarget, async () => { const r = await api('/sms/test', {}); toast(`Test SMS sent (${r.sent})`); });
    $('#lg', v).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { logo = await resizeImage(f, 500, 'image/png'); toast('Logo ready. Press Save.'); } catch (er) { toast(er.message, true); } };
    $('#sf', v).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.report_costs = x.report_costs ? '1' : '0'; x.separate_approval = x.separate_approval ? '1' : '0'; x.stores_control = x.stores_control ? '1' : '0'; x.req_approval = x.req_approval ? '1' : '0'; if (logo) x.logo = logo; busy(e.submitter, async () => { await api('/settings', x); SET = (await api('/me')).settings; brand(); toast('Settings saved'); shell(); route(); }, $('#se', v)); });
  }
  async function account(v) {
    setTitle('My account');
    v.innerHTML = `<div class="grid2" style="max-width:900px"><form class="card stack" id="pf"><h2>Profile</h2><label class="f">Name<input name="name" value="${esc(ME.name)}"></label><label class="f">Phone<input name="phone" value="${esc(ME.phone || '')}"></label><p class="muted small">${esc(ME.email)} · ${ROLE[ME.role]}</p><button class="btn ghost">Save</button></form>
      <section class="card stack" id="al"><h2>Alerts on this phone</h2><p class="muted small">Get job alerts, notices and reminders as phone notifications, even when the app is closed.</p><div id="pst" class="muted small">Checking…</div><div class="row" id="pbt"></div>
        <label class="check"><input type="checkbox" id="nsms" ${ME.notify_sms ? 'checked' : ''}> Send me SMS text messages for urgent jobs, urgent notices and reminders</label><p class="hint">SMS goes to the phone number in your profile.</p></section>
      <section class="card stack"><h2>Appearance</h2><p class="muted small">Dark mode is easier on the eyes at night and in dark plant rooms.</p><div class="chips" id="thm">${[['auto', 'Match my phone'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button class="chip" type="button" data-th="${k}" aria-pressed="${getTheme() === k}">${l}</button>`).join('')}</div></section>
      <form class="card stack" id="cf"><h2>Change password</h2><label class="f">Current password<input name="current" type="password" autocomplete="current-password" required></label><label class="f">New password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><p class="err" id="ce"></p><button class="btn ghost">Change password</button></form></div>`;
    $('#pf', v).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); busy(e.submitter, async () => { await api('/me/profile', x); ME.name = x.name; ME.phone = x.phone; toast('Saved'); }); });
    $('#cf', v).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/me/password', formData(e.target)); e.target.reset(); toast('Password changed'); }, $('#ce', v)); });
    $('#nsms', v).onchange = (e) => busy(null, async () => { await api('/me/prefs', { notify_push: ME.notify_push, notify_sms: e.target.checked }); ME.notify_sms = e.target.checked; toast(e.target.checked ? 'SMS alerts on' : 'SMS alerts off'); });
    $$('[data-th]', v).forEach((b) => b.onclick = () => { try { localStorage.setItem('basa-theme', b.dataset.th); } catch (e) { /* private mode */ } applyTheme(b.dataset.th); $$('[data-th]', v).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    pushPanel(v);
  }
  /* ---------- v3 helpers ---------- */
  const num = (v, d = 1) => (v == null || v === '' || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString('en-US', { maximumFractionDigits: d }));
  const pctTxt = (v) => (v == null ? '—' : v + '%');
  const dur = (h) => (h == null ? '—' : h < 1 ? Math.round(h * 60) + ' min' : Math.round(h * 10) / 10 + ' h');
  const hhmm = (iso) => (iso ? new Date(iso).toTimeString().slice(0, 5) : '');
  const toLocalInput = (iso) => { if (!iso) return ''; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
  const fromLocalInput = (s) => (s ? new Date(s).toISOString() : '');
  const dayShift = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  function spark(vals, o = {}) {
    if (!vals.length) return '<span class="tiny muted">No readings yet</span>';
    const w = o.w || 170, h = o.h || 44, all = [...vals, ...(o.lines || []).filter((x) => x != null)];
    const mn = Math.min(...all), mx = Math.max(...all), rg = mx - mn || 1;
    const X = (i) => (vals.length === 1 ? w / 2 : 4 + (i * (w - 8)) / (vals.length - 1)), Y = (v) => h - 5 - ((v - mn) / rg) * (h - 10);
    const lines = (o.lines || []).map((l, i) => (l == null ? '' : `<line x1="0" x2="${w}" y1="${Y(l).toFixed(1)}" y2="${Y(l).toFixed(1)}" stroke="var(${i ? '--bad' : '--warn'})" stroke-dasharray="4 3" stroke-width="1.2"/>`)).join('');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(o.label || 'Trend')}">${lines}<polyline fill="none" stroke="var(--brand)" stroke-width="2" stroke-linejoin="round" points="${vals.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ')}"/>${vals.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="2.6" fill="var(--brand)"><title>${v}</title></circle>`).join('')}</svg>`;
  }
  const bars = (rows, fmt) => { const mx = Math.max(1, ...rows.map((r) => Math.abs(r[1]))); return rows.length ? `<div class="workload">${rows.map(([l, n]) => `<div class="wl"><span>${esc(l)}</span><span class="bt"><i style="width:${(Math.abs(n) / mx) * 100}%"></i></span><b>${fmt ? fmt(n) : n}</b></div>`).join('')}</div>` : '<p class="muted small">No data in this period.</p>'; };
  const cmPill = (s) => (s === 'alarm' ? '<span class="pill s-on_hold">Alarm</span>' : s === 'warn' ? '<span class="pill s-in_progress">Warning</span>' : s ? '<span class="pill s-approved">OK</span>' : '<span class="pill">No reading</span>');
  const meter = (p, warnAt = 90) => `<div class="bar" style="height:8px"><i style="width:${Math.min(100, Math.max(0, p || 0))}%;${p > 100 ? 'background:var(--bad)' : p > warnAt ? 'background:var(--warn)' : ''}"></i></div>`;
  function printDoc(title, body) {
    const w = window.open('', '_blank');
    if (!w) { toast('Allow pop-ups for this site to print the report', true); return; }
    const color = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#d9822b';
    w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
      <style>:root{--brand:${color}}*{box-sizing:border-box}body{margin:0;background:#e9ebef;color:#15171b;font:12.5px/1.45 "DM Sans",system-ui,sans-serif}
      .tb{position:sticky;top:0;display:flex;justify-content:center;gap:8px;padding:10px;background:#1b1f26}.tb button{font:700 14px system-ui;padding:9px 16px;border-radius:10px;border:0;background:var(--brand);color:#fff;cursor:pointer}
      .page{width:210mm;max-width:100%;margin:18px auto 40px;background:#fff;padding:13mm;box-shadow:0 10px 40px -10px rgba(0,0,0,.3)}
      h1{font-size:20px;margin:0}h2{font-size:14px;margin:18px 0 6px;padding-bottom:4px;border-bottom:2px solid var(--brand)}h3{font-size:13px;margin:10px 0 4px}
      .hd{display:flex;justify-content:space-between;align-items:center;gap:14px;border-bottom:3px solid var(--brand);padding-bottom:10px}.hd img{max-height:50px;max-width:150px;object-fit:contain}
      .muted{color:#5b616c}table{width:100%;border-collapse:collapse;margin:4px 0}th,td{text-align:left;padding:5px 6px;border-bottom:1px solid #e3e6ea;vertical-align:top}th{background:#f4f5f7;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:#5b616c}.n{text-align:right;font-variant-numeric:tabular-nums}
      .k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.k div{border:1px solid #e3e6ea;border-radius:8px;padding:8px}.k span{display:block;font-size:10.5px;color:#5b616c;text-transform:uppercase;letter-spacing:.03em}.k b{font-size:18px}
      .bar{height:8px;background:#eceef2;border-radius:6px;overflow:hidden}.bar i{display:block;height:100%;background:var(--brand)}.ok{color:#137a46}.bad{color:#b42318}
      @media print{body{background:#fff}.tb{display:none}.page{margin:0;box-shadow:none;width:auto;padding:0}@page{size:A4;margin:12mm}h2{break-after:avoid}tr{break-inside:avoid}}</style></head>
      <body><div class="tb"><button onclick="print()">Print or save as PDF</button></div><div class="page">${body}</div></body></html>`);
    w.document.close();
  }
  const docHead = (title, sub) => `<div class="hd"><div style="display:flex;gap:12px;align-items:center">${SET.logo ? `<img src="${esc(SET.logo)}" alt="">` : ''}<div><b style="font-size:15px">${esc(SET.company || '')}</b><div class="muted">${esc([SET.phone, SET.email, SET.website].filter(Boolean).join(' · '))}</div></div></div><div style="text-align:right"><h1>${esc(title)}</h1><div class="muted">${sub}</div></div></div>`;

  /* ---------- job: clock, failure, labour ---------- */
  function clockBox(d) {
    const c = d.clock; if (!c) return '';
    const w = d.wo, st = w.status, m = c.mine, K = c.kinds, l = d.labour || {};
    const onJob = w.lead_id === ME.id || d.team.some((t) => t.user_id === ME.id);
    const line = `Booked ${dur(l.booked)} · on the clock ${dur(l.actual)}${w.est_hours ? ' · estimate ' + dur(w.est_hours) : ''}${l.flag ? ` <span class="pill s-on_hold">Check hours</span>` : ''}`;
    if (!onJob || !['assigned', 'in_progress', 'on_hold'].includes(st)) return c.rows.length || l.booked ? `<div class="clockbar"><span class="small">${ic('clock', 16)} ${line}</span></div>` : '';
    const kinds = Object.entries(K).filter(([k]) => k !== 'work' || st === 'in_progress');
    return `<div class="clockbar ${m ? 'on' : ''}"><div class="small">${ic('clock', 18)} ${m ? `<b>On the clock: ${esc(K[m.kind])}</b> since ${hhmm(m.start_at)}` : '<b>Not clocked on</b>'}<br><span class="tiny muted">${line}</span></div>
      <div class="row">${kinds.map(([k, lb]) => `<button class="chip" type="button" data-clk="${k}" aria-pressed="${!!(m && m.kind === k)}">${esc(lb)}</button>`).join('')}${m ? `<button class="btn sm ghost" type="button" data-clk="stop">${ic('pause', 14)} Stop</button>` : ''}</div></div>`;
  }
  function failCard(d, can) {
    const w = d.wo; if (!(d.unplanned || w.downtime_start || w.fail_component)) return '';
    const F = d.fail_lists || LK.fail || {}, edit = can.work && ME.role !== 'client';
    const sel = (k, lab) => `<label class="f">${lab}<select name="fail_${k}">${opt(F[k] || [], w['fail_' + k], 'Choose…')}</select></label>`;
    const down = w.downtime_start ? (new Date(w.downtime_end || Date.now()) - new Date(w.downtime_start)) / 3600e3 : null;
    if (!edit) return `<div class="card"><h2 style="margin-bottom:10px">Failure and downtime</h2><dl class="dl"><div><dt>Component</dt><dd>${esc(w.fail_component || '—')}</dd></div><div><dt>What happened</dt><dd>${esc(w.fail_mode || '—')}</dd></div><div><dt>Cause</dt><dd>${esc(w.fail_cause || '—')}</dd></div><div><dt>Action</dt><dd>${esc(w.fail_action || '—')}</dd></div>${w.downtime_start ? `<div><dt>Machine stopped</dt><dd>${fdt(toLocalInput(w.downtime_start).replace('T', ' '))}</dd></div><div><dt>Back in service</dt><dd>${w.downtime_end ? fdt(toLocalInput(w.downtime_end).replace('T', ' ')) : 'Still down'}</dd></div><div><dt>Downtime</dt><dd>${dur(down)}</dd></div>` : ''}</dl></div>`;
    return `<form class="card stack" id="ff"><div><h2>Failure and downtime</h2><p class="muted small">${d.unplanned ? 'Needed before you submit. This feeds the reliability analysis (MTBF, MTTR, bad actors).' : 'Optional.'}</p></div>
      <div class="grid2">${sel('component', 'Component that failed')}${sel('mode', 'What happened')}${sel('cause', 'Cause')}${sel('action', 'Action taken')}</div>
      <div class="grid2"><label class="f">Machine stopped<input type="datetime-local" name="downtime_start" value="${toLocalInput(w.downtime_start)}"></label><label class="f">Back in service <span class="hint">(blank = still down)</span><input type="datetime-local" name="downtime_end" value="${toLocalInput(w.downtime_end)}"></label></div>
      <div class="row"><button class="btn ghost">Save failure details</button>${down != null ? `<span class="muted small">Downtime so far: <b>${dur(down)}</b></span>` : ''}</div></form>`;
  }
  function labourCard(d) {
    const l = d.labour; if (!l) return '';
    return `<div class="card"><h3>Booked vs actual time</h3><dl class="dl" style="margin-top:8px"><div><dt>Estimate</dt><dd>${dur(d.wo.est_hours)}</dd></div><div><dt>Hours booked</dt><dd>${dur(l.booked)}</dd></div><div><dt>On the clock (work)</dt><dd>${dur(l.actual)}</dd></div>${Object.entries(d.clock.by).filter(([k]) => k !== 'work').map(([k, h]) => `<div><dt>${esc(d.clock.kinds[k])}</dt><dd>${dur(h)}</dd></div>`).join('')}</dl>
      ${l.note ? `<p class="small ${l.flag ? '' : 'muted'}" style="margin-top:8px">${l.flag ? ic('alert', 14) + ' ' : ''}${esc(l.note)}</p>` : ''}</div>`;
  }
  function holdDlg(id, done) {
    dlg(`${head('Put on hold', 'The foreman will be notified.')}<form class="stack" id="hf"><label class="f">Waiting for<select name="wait">${opt([['', 'Something else'], ['wait_parts', 'Parts'], ['wait_permit', 'Permit / isolation / access']], '')}</select><span class="hint">Parts and permit waiting time is tracked separately from work time.</span></label>
      <label class="f">Details<textarea name="note" rows="3" required placeholder="e.g. Seal kit ordered, ETA Friday"></textarea></label><p class="err" id="he"></p><div class="acts"><button class="btn ghost" type="button" data-close>Back</button><button class="btn">Put on hold</button></div></form>`,
    (dl) => $('#hf', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); busy(e.submitter, async () => { await api(`/wo/${id}/status`, { to: 'on_hold', note: x.note, wait: x.wait || undefined }); dl.close(); toast('Job put on hold'); done(); }, $('#he', dl)); }));
  }

  /* ---------- job: materials with stores ---------- */
  function tabMaterials(T, d, can, reload, total) {
    const w = d.wo, staff = ME.role !== 'client';
    const stores = LK.stores || [], parts = LK.parts || [], stock = LK.stock || [];
    const freeIn = (pid) => stock.filter((s) => s.part_id === pid && s.free > 0);
    const issued = d.materials.filter((m) => m.part_id);
    T.innerHTML = `<div class="cols2"><div class="stack"><div class="card"><div class="card-h"><h2>Materials and parts used</h2><b>${money(total)}</b></div>
      ${d.materials.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Unit cost</th><th class="n">Total</th><th></th></tr></thead><tbody>${d.materials.map((m) => `<tr><td>${esc(m.item)}${m.part_id ? `<br><span class="tiny muted">${ic('box', 12)} From stores</span>` : ''}</td><td class="n">${m.qty} ${esc(m.unit || '')}</td><td class="n">${money(m.unit_cost)}</td><td class="n">${money(m.qty * m.unit_cost)}</td><td class="n">${can.work ? (m.part_id ? `<button class="link small" data-ret="${m.id}">Return</button>` : `<button class="link" data-rmm="${m.id}" aria-label="Remove">${ic('trash', 16)}</button>`) : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nothing recorded yet.</p>'}
      ${can.work && staff && SET.stores_control === '1' ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line2)" class="stack"><h3>${ic('box', 16)} Parts from the stores</h3><p class="muted small">The stores pick your parts, tell you when they are ready, and issue them to this job so they are costed here.</p><button class="btn" type="button" id="rqb">${ic('send', 16)} Request from stores</button></div>` : ''}
      ${(d.requisitions || []).length ? `<div style="margin-top:14px" class="stack"><h3>Stores requests for this job</h3>${d.requisitions.map((r) => `<a class="between small" href="#/stores/req/${r.id}" style="padding:6px 0;border-top:1px solid var(--line2);text-decoration:none;color:inherit"><span><b class="mono">${esc(r.number)}</b> · ${esc((r.summary || '').slice(0, 60))}</span>${rqp(r.status)}</a>`).join('')}</div>` : ''}
      ${can.work && staff && (SET.stores_control !== '1' || BOSS()) ? `<form class="stack" id="if" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line2)"><h3>${ic('box', 16)} Issue from stores${SET.stores_control === '1' ? ' (manager)' : ''}</h3><div class="grid3"><label class="f" style="grid-column:span 2">Part<select name="part_id" id="ip" required>${opt(parts.map((p) => [p.id, `${p.part_no} · ${p.name}`]), '', 'Choose a part…')}</select></label><label class="f">Quantity<input name="qty" type="number" step="any" min="0" required value="1"></label></div>
        <label class="f">Store<select name="store_id" id="is" required><option value="">Choose the part first</option></select></label><button class="btn">${ic('box', 16)} Issue to this job</button><p class="err" id="ie"></p></form>
        <details style="margin-top:12px"><summary class="small" style="cursor:pointer;font-weight:700">Add something not kept in stores</summary><form class="stack" id="mf" style="margin-top:10px"><label class="f">Item<input name="item" required placeholder="e.g. Bought locally: cable ties"></label><div class="grid3"><label class="f">Quantity<input name="qty" type="number" step="any" min="0" required></label><label class="f">Unit<select name="unit">${opt(['each', 'm', 'kg', 'L', 'box', 'set', 'roll'])}</select></label><label class="f">Unit cost<input name="unit_cost" type="number" step="any" min="0"></label></div><button class="btn ghost">Add</button><p class="err" id="me"></p></form></details>` : can.work ? '' : ''}
      </div></div>
      ${staff ? `<div class="stack">
        ${d.spares && d.spares.length ? `<div class="card"><h2 style="margin-bottom:8px">Spares for ${esc(w.asset_tag || 'this machine')}</h2><div class="tw" style="box-shadow:none"><table><tbody>${d.spares.map((s) => `<tr><td><b>${esc(s.part_no)}</b><br><span class="tiny muted">${esc(s.name)} · uses ${s.qty}${s.on_pm ? ' · on PM' : ''}</span></td><td class="n ${s.in_stock < s.qty ? 'bad' : ''}">${num(s.in_stock)} ${esc(s.unit)}<br><span class="tiny muted">in stock</span></td><td class="n">${can.work ? `<button class="btn sm ghost" data-pick="${s.part_id}" data-q="${s.qty}">${SET.stores_control === '1' && !BOSS() ? 'Request' : 'Issue'}</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
        ${d.reservations && d.reservations.length ? `<div class="card"><h2 style="margin-bottom:8px">Held in stores for this job</h2>${d.reservations.map((r) => `<div class="between" style="padding:6px 0;border-top:1px solid var(--line2)"><span><b>${esc(r.part_no)}</b> ${esc(r.name)}<br><span class="tiny muted">${r.qty} ${esc(r.unit)} · ${esc(r.store)}</span></span>${(can.work || SUP()) && (SET.stores_control !== '1' || BOSS()) ? `<span class="row"><button class="btn sm" data-issue-res="${r.id}">Issue</button><button class="link small" data-rel="${r.id}">Release</button></span>` : ''}</div>`).join('')}</div>` : ''}
        <div class="card"><h3>Need a part that is not in stock?</h3><p class="muted small" style="margin:4px 0 10px">Raise a purchase request. The manager is notified and you are told when it arrives.</p><button class="btn ghost" id="prq">${ic('plus', 16)} Request a purchase</button>${issued.length ? `<p class="tiny muted" style="margin-top:10px">Unused parts: tap Return on the line to put them back in stores.</p>` : ''}</div>
      </div>` : ''}</div>`;
    const ip = $('#ip', T), is = $('#is', T);
    const fillStores = () => { const pid = Number(ip.value); const f = freeIn(pid); is.innerHTML = pid ? (f.length ? opt(f.map((s) => [s.store_id, `${(stores.find((x) => x.id === s.store_id) || {}).name} · ${num(s.free)} free`]), f[0].store_id) : '<option value="">None free in any store. Request a purchase.</option>') : '<option value="">Choose the part first</option>'; };
    if (ip) ip.onchange = fillStores;
    const iF = $('#if', T);
    if (iF) iF.addEventListener('submit', (e) => { e.preventDefault(); const x = formData(iF); busy(e.submitter, async () => { const r = await api(`/wo/${w.id}/issue`, x); toast(`Issued. ${num(r.left)} ${r.unit} left in ${r.store}`); await refreshLK(); reload(); }, $('#ie', T)); });
    $$('[data-pick]', T).forEach((b) => b.onclick = () => { if (!iF || (SET.stores_control === '1' && !BOSS())) return jobReqDlg(w, [{ part_id: Number(b.dataset.pick), qty: b.dataset.q }], reload); ip.value = b.dataset.pick; fillStores(); iF.qty.value = b.dataset.q; iF.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    const rqb = $('#rqb', T); if (rqb) rqb.onclick = () => jobReqDlg(w, (d.spares || []).length ? [] : [], reload);
    const mf = $('#mf', T);
    if (mf) mf.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/wo/${w.id}/material`, formData(mf)); toast('Material added'); reload(); }, $('#me', T)); });
    $$('[data-rmm]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/material`, { remove: b.dataset.rmm }); reload(); }));
    $$('[data-ret]', T).forEach((b) => b.onclick = () => { const m = d.materials.find((x) => String(x.id) === b.dataset.ret); dlg(`${head('Return to stores', esc(m.item))}<form class="stack" id="rf"><label class="f">How many are you returning?<input name="qty" type="number" step="any" min="0" max="${m.qty}" value="${m.qty}" required></label><p class="err" id="re"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Return</button></div></form>`, (dl) => $('#rf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/wo/${w.id}/return`, { material_id: m.id, qty: e.target.qty.value }); dl.close(); toast('Returned to stores'); await refreshLK(); reload(); }, $('#re', dl)); })); });
    $$('[data-rel]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/reserve`, { release: b.dataset.rel }); toast('Released back to stores'); reload(); }));
    $$('[data-issue-res]', T).forEach((b) => b.onclick = () => { const r = d.reservations.find((x) => String(x.id) === b.dataset.issueRes); busy(b, async () => { await api(`/wo/${w.id}/issue`, { part_id: r.part_id, store_id: r.store_id, qty: r.qty }); toast('Issued'); await refreshLK(); reload(); }); });
    const prq = $('#prq', T); if (prq) prq.onclick = () => purchaseDlg(null, w.id, reload);
  }
  function purchaseDlg(partId, woId, done) {
    dlg(`${head('Request a purchase', 'The manager is notified straight away.')}<form class="stack" id="pf"><label class="f">Part<select name="part_id" required>${opt((LK.parts || []).map((p) => [p.id, `${p.part_no} · ${p.name}`]), partId || '', 'Choose…')}</select><span class="hint">Not in the list? Ask the stores or a manager to add it to the catalogue first.</span></label>
      <div class="grid2"><label class="f">Quantity<input name="qty" type="number" step="any" min="0" required></label><label class="f">Deliver to store<select name="store_id">${opt((LK.stores || []).map((s) => [s.id, s.name]), (LK.stores || [])[0] ? LK.stores[0].id : '')}</select></label></div>
      <label class="f">Note<input name="note" placeholder="Why it is needed, how urgent"></label><p class="err" id="pe"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Send request</button></div></form>`,
    (dl) => $('#pf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/purchase', { ...formData(e.target), wo_id: woId || undefined }); dl.close(); toast('Purchase request sent'); if (done) done(); }, $('#pe', dl)); }));
  }

  /* ---------- stores & spares ---------- */
  async function storesView(v, sub, id) {
    setTitle('Stores & spares');
    await refreshLK();
    if (sub === 'req' && id) return reqView(v, id);
    if (sub === 'po' && id) return poView(v, id);
    if (sub === 'new') return newReqView(v);
    const d = await api('/stores');
    const TABS = [['parts', 'Parts'], ['req', 'Stores requests'], ...(KEEP() ? [['requests', 'To order']] : []), ...(KEEP() || ME.role === 'foreman' ? [['po', 'Purchase orders']] : []), ['suppliers', 'Suppliers'], ['stores', 'Stores'], ...(KEEP() ? [['usage', 'Most used and slow moving']] : []), ...(KEEP() || ME.role === 'foreman' ? [['dept', 'By department']] : [])];
    let tab = TABS.some((t) => t[0] === sub) ? sub : sub === 'part' ? 'parts' : ME.role === 'dept' ? 'parts' : 'parts', q = '', f = 'all';
    if (sub === 'part' && id) setTimeout(() => partDlg(Number(id)), 0);
    const value = d.stores.reduce((a, s) => a + s.value, 0);
    v.innerHTML = `<div class="between"><p class="muted" style="max-width:70ch">Every spare part, where it is and how many are left. Parts issued to a job are costed on the job and the stock goes down.</p>
        <div class="row">${KEEP() ? `<a class="btn ghost" href="/api/export/stock">${ic('download', 16)} Stock list</a><button class="btn ghost" id="ast">${ic('plus', 16)} Store</button><button class="btn ghost" id="apt">${ic('plus', 16)} Part</button>` : ''}<a class="btn" href="#/stores/new">${ic('send', 16)} Request from stores</a></div></div>
      <div class="kpis"><div class="kpi"><span>Parts in catalogue</span><b>${d.parts.length}</b></div>${KEEP() ? `<div class="kpi"><span>Stock value</span><b>${money(value).replace(/\.\d\d$/, '')}</b><small>${d.stores.length} store${d.stores.length === 1 ? '' : 's'}</small></div>` : ''}<button class="kpi ${d.parts.some((p) => p.low) ? 'alert' : ''}" data-f="low" type="button"><span>Low stock</span><b>${d.parts.filter((p) => p.low).length}</b><small>At or below minimum</small></button>${KEEP() ? `<button class="kpi" type="button" data-tab="requests"><span>To order</span><b>${d.requests.filter((r) => r.status === 'requested' && !r.po_id).length}</b><small>Purchase requests</small></button>` : ''}</div>
      <div class="chips" id="stabs">${TABS.map(([k, l]) => `<button class="chip" data-tab="${k}" aria-pressed="${k === tab}">${l}</button>`).join('')}</div><div id="sv"></div>`;
    const draw = () => {
      $$('#stabs [data-tab]', v).forEach((b) => b.setAttribute('aria-pressed', b.dataset.tab === tab));
      const box = $('#sv', v);
      if (tab === 'parts') {
        let l = d.parts.filter((p) => f === 'all' || (f === 'low' && p.low));
        if (q) l = l.filter((p) => [p.part_no, p.name, p.category, p.supplier, p.used_on].join(' ').toLowerCase().includes(q));
        box.innerHTML = `<div class="toolbar"><label class="search">${ic('search', 16)}<input type="search" id="q" value="${esc(q)}" placeholder="Search part no., description, machine" aria-label="Search parts"></label><div class="chips">${[['all', 'All'], ['low', 'Low stock']].map(([k, lb]) => `<button class="chip" data-f="${k}" aria-pressed="${k === f}">${lb}</button>`).join('')}</div></div>
          ${l.length ? `<div class="tw"><table><thead><tr><th>Part</th><th>Category</th><th class="n">In stock</th><th class="n">Held</th><th class="n">Min</th><th class="n">Used 90 days</th>${KEEP() ? '<th class="n">Value</th>' : ''}</tr></thead><tbody>${l.map((p) => `<tr class="click" data-pid="${p.id}"><td><b class="mono">${esc(p.part_no)}</b>${p.low ? ' <span class="pill s-on_hold">Low</span>' : ''}<br><span class="small">${esc(p.name)}</span>${p.used_on ? `<br><span class="tiny muted">${ic('tag', 12)} ${esc(p.used_on)}</span>` : ''}</td><td>${esc(p.category || '—')}</td><td class="n"><b>${num(p.total)}</b> ${esc(p.unit)}<br><span class="tiny muted">${p.stock.map((s) => `${esc((d.stores.find((x) => x.id === s.store_id) || {}).name || '').split(' (')[0]}: ${num(s.qty)}`).join(' · ')}</span></td><td class="n">${p.reserved ? num(p.reserved) : '—'}</td><td class="n">${p.min_qty ?? '—'}</td><td class="n">${num(p.used_90)}</td>${KEEP() ? `<td class="n">${money(p.total * p.cost)}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : '<p class="empty">No parts match.</p>'}`;
        const qi = $('#q', box); qi.oninput = (e) => { q = e.target.value.toLowerCase(); draw(); $('#q', v).focus(); const n = $('#q', v); n.setSelectionRange(n.value.length, n.value.length); };
        $$('[data-f]', box).forEach((b) => b.onclick = () => { f = b.dataset.f; draw(); });
        $$('tr[data-pid]', box).forEach((tr) => tr.onclick = () => partDlg(Number(tr.dataset.pid)));
      }
      if (tab === 'requests') {
        const toOrder = d.requests.filter((r) => r.status === 'requested' && !r.po_id);
        box.innerHTML = (toOrder.length && KEEP() ? `<div class="between" style="margin-bottom:10px"><p class="muted small">${toOrder.length} waiting to go on a purchase order.</p><button class="btn" id="mkpo">${ic('file', 16)} Put on a purchase order</button></div>` : '') + (d.requests.length ? `<div class="tw"><table><thead><tr><th>Request</th><th>Part</th><th class="n">Qty</th><th>Asked by</th><th>Status</th><th></th></tr></thead><tbody>${d.requests.map((r) => `<tr><td class="mono">PR-${r.id}<br><span class="tiny muted">${fdate(r.created_at)}</span></td><td><b>${esc(r.part_no)}</b> ${esc(r.name)}${r.note ? `<br><span class="tiny muted">${esc(r.note)}</span>` : ''}${r.number ? `<br><a class="tiny" href="#/job/${r.wo_id}">${esc(r.number)}</a>` : ''}</td><td class="n">${num(r.qty)} ${esc(r.unit)}</td><td>${esc(r.by_name || '—')}</td><td><span class="pill ${r.status === 'ordered' ? 's-in_progress' : 's-open'}">${r.status === 'ordered' ? 'Ordered' : 'Requested'}</span>${r.supplier ? `<br><span class="tiny muted">${esc(r.supplier)}</span>` : ''}</td><td class="n">${KEEP() ? `<div class="row" style="justify-content:flex-end">${r.status === 'requested' ? `<button class="btn sm ghost" data-pr="ordered" data-id="${r.id}">Ordered</button>` : ''}<button class="btn sm" data-pr="received" data-id="${r.id}">Received</button><button class="link small" data-pr="cancelled" data-id="${r.id}">Cancel</button></div>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No open purchase requests.</p>');
        const mk = $('#mkpo', box); if (mk) mk.onclick = () => poNewDlg(toOrder.map((r) => r.id));
        $$('[data-pr]', box).forEach((b) => b.onclick = () => {
          const r = d.requests.find((x) => String(x.id) === b.dataset.id), to = b.dataset.pr;
          if (to === 'received') return dlg(`${head('Receive delivery', `PR-${r.id} · ${esc(r.part_no)} ${esc(r.name)}`)}<form class="stack" id="rf"><div class="grid3"><label class="f">Quantity received<input name="qty" type="number" step="any" value="${r.qty}" required></label><label class="f">Unit cost<input name="unit_cost" type="number" step="any" value="${r.unit_cost ?? ''}"></label><label class="f">Into store<select name="store_id">${opt(d.stores.map((s) => [s.id, s.name]), r.store_id)}</select></label></div><label class="f">Delivery note / invoice no.<input name="ref"></label><p class="err" id="re"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Receive into stock</button></div></form>`,
            (dl) => $('#rf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/purchase', { id: r.id, status: 'received', ...formData(e.target) }); dl.close(); toast('Received into stock'); route(); }, $('#re', dl)); }));
          busy(b, async () => { await api('/purchase', { id: r.id, status: to }); toast(to === 'ordered' ? 'Marked as ordered' : 'Request cancelled'); route(); });
        });
      }
      if (tab === 'stores') {
        box.innerHTML = `<div class="grid2">${d.stores.map((s) => `<div class="card"><div class="card-h"><h2>${esc(s.name)}</h2>${KEEP() ? `<button class="link small" data-es="${s.id}">Edit</button>` : ''}</div><p class="muted small">${esc(s.site || 'Not at a client site')}${s.notes ? ' · ' + esc(s.notes) : ''}</p><p style="margin-top:8px">${d.parts.filter((p) => p.stock.some((x) => x.store_id === s.id && x.qty > 0)).length} parts${KEEP() ? ` · <b>${money(s.value)}</b>` : ''}</p>${KEEP() ? `<button class="btn sm ghost" style="margin-top:10px" data-count="${s.id}">${ic('check', 14)} Stock count</button>` : ''}</div>`).join('')}</div>`;
        $$('[data-es]', box).forEach((b) => b.onclick = () => storeDlg(d.stores.find((s) => String(s.id) === b.dataset.es)));
        $$('[data-count]', box).forEach((b) => b.onclick = () => countDlg(d, Number(b.dataset.count)));
      }
      if (tab === 'req') { box.innerHTML = '<p class="loading">Loading…</p>'; reqList(box); }
      if (tab === 'po') { box.innerHTML = '<p class="loading">Loading…</p>'; poList(box); }
      if (tab === 'suppliers') { box.innerHTML = '<p class="loading">Loading…</p>'; supplierList(box); }
      if (tab === 'dept') { box.innerHTML = '<p class="loading">Loading…</p>'; deptUsage(box); }
      if (tab === 'usage') {
        const used = [...d.parts].filter((p) => p.used_90 > 0).sort((a, b) => b.used_90 * b.cost - a.used_90 * a.cost).slice(0, 12);
        const slow = d.parts.filter((p) => p.total > 0 && !p.used_90).sort((a, b) => b.total * b.cost - a.total * a.cost);
        box.innerHTML = `<div class="grid2"><div class="card"><h2 style="margin-bottom:10px">Most used (last 90 days, by value)</h2>${bars(used.map((p) => [p.part_no + ' · ' + p.name, Math.round(p.used_90 * p.cost)]), (n) => money(n).replace(/\.\d\d$/, ''))}</div>
          <div class="card"><h2 style="margin-bottom:4px">Slow moving</h2><p class="muted small" style="margin-bottom:10px">In stock but not used in 90 days. ${money(slow.reduce((a, p) => a + p.total * p.cost, 0))} tied up.</p>${slow.length ? `<div class="tw" style="box-shadow:none"><table><tbody>${slow.map((p) => `<tr><td><b>${esc(p.part_no)}</b><br><span class="tiny muted">${esc(p.name)}</span></td><td class="n">${num(p.total)} ${esc(p.unit)}</td><td class="n">${money(p.total * p.cost)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Everything has moved recently.</p>'}</div></div>`;
      }
    };
    draw();
    $$('#stabs [data-tab], .kpis [data-tab]', v).forEach((b) => b.onclick = () => { tab = b.dataset.tab; history.replaceState(null, '', '#/stores/' + tab); markNav(); draw(); });
    $$('.kpis [data-f]', v).forEach((b) => b.onclick = () => { tab = 'parts'; f = 'low'; draw(); });
    const apt = $('#apt', v); if (apt) apt.onclick = () => partForm(null, d);
    const ast = $('#ast', v); if (ast) ast.onclick = () => storeDlg(null);
    const prq = $('#prq', v); if (prq) prq.onclick = () => purchaseDlg(null, null, route);
    function storeDlg(s) {
      s = s || {};
      dlg(`${head(s.id ? 'Edit store' : 'Add a store', 'A workshop store, a site container or a van.')}<form class="stack" id="sf"><label class="f">Name<input name="name" value="${esc(s.name || '')}" required placeholder="e.g. Kariba site container"></label><label class="f">At client site <span class="hint">(optional)</span><select name="site_id">${opt(LK.sites.map((x) => [x.id, `${(LK.clients.find((c) => c.id === x.client_id) || {}).name} · ${x.name}`]), s.site_id, 'Not at a client site')}</select></label><label class="f">Notes<input name="notes" value="${esc(s.notes || '')}"></label><p class="err" id="se"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
      (dl) => $('#sf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/stores', { ...formData(e.target), id: s.id }); dl.close(); toast('Saved'); route(); }, $('#se', dl)); }));
    }
  }
  function partForm(p, d) {
    p = p || {}; const stores = LK.stores || [];
    dlg(`${head(p.id ? 'Edit part' : 'Add a part to the catalogue')}<form class="stack" id="pf"><div class="grid3"><label class="f">Part number<input name="part_no" value="${esc(p.part_no || '')}" required></label><label class="f" style="grid-column:span 2">Description<input name="name" value="${esc(p.name || '')}" required></label></div>
      <div class="grid3"><label class="f">Category<input name="category" value="${esc(p.category || '')}" list="cats"><datalist id="cats">${[...new Set(((d && d.parts) || []).map((x) => x.category).filter(Boolean))].map((c) => `<option>${esc(c)}</option>`).join('')}</datalist></label><label class="f">Unit<input name="unit" value="${esc(p.unit || 'each')}"></label><label class="f">Unit cost<input name="cost" type="number" step="any" min="0" value="${esc(p.cost ?? '')}"></label></div>
      <div class="grid3"><label class="f">Minimum stock<input name="min_qty" type="number" step="any" min="0" value="${esc(p.min_qty ?? '')}"><span class="hint">Alert when stock falls to this</span></label><label class="f">Order quantity<input name="reorder_qty" type="number" step="any" min="0" value="${esc(p.reorder_qty ?? '')}"></label><label class="f">Supplier<input name="supplier" value="${esc(p.supplier || '')}"></label></div>
      ${p.id ? '' : `<fieldset class="card" style="box-shadow:none"><legend class="small" style="font-weight:700;padding:0 6px">Opening stock (optional)</legend><div class="grid3"><label class="f">Store<select name="store_id">${opt(stores.map((s) => [s.id, s.name]), stores[0] ? stores[0].id : '')}</select></label><label class="f">Quantity<input name="qty" type="number" step="any" min="0"></label><label class="f">Bin / shelf<input name="bin"></label></div></fieldset>`}
      <label class="f">Notes<input name="notes" value="${esc(p.notes || '')}"></label><p class="err" id="pe"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
    (dl) => $('#pf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/parts', { ...formData(e.target), id: p.id }); dl.close(); toast('Saved'); await refreshLK(); route(); }, $('#pe', dl)); }), 'wide');
  }
  async function partDlg(id) {
    const r = await api('/stores/part/' + id), p = r.part, stores = LK.stores || [];
    const total = r.stock.reduce((a, s) => a + s.qty, 0);
    const kindL = { receive: 'Received', issue: 'Issued to job', return: 'Returned', adjust: 'Adjusted', transfer: 'Moved', count: 'Counted' };
    dlg(`${head(esc(p.part_no + ' · ' + p.name), esc([p.category, p.supplier].filter(Boolean).join(' · ')))}
      <div class="kpis" style="margin:0"><div class="kpi"><span>In stock</span><b>${num(total)}</b><small>${esc(p.unit)}</small></div><div class="kpi"><span>Unit cost</span><b>${money(p.cost)}</b><small>Average</small></div><div class="kpi ${p.min_qty != null && total <= p.min_qty ? 'alert' : ''}"><span>Minimum</span><b>${p.min_qty ?? '—'}</b><small>Order ${p.reorder_qty ?? '—'}</small></div></div>
      <div class="grid2"><div><h3>Where it is</h3><div class="tw" style="box-shadow:none"><table><tbody>${r.stock.map((s) => `<tr><td>${esc(s.store)}${s.bin ? `<br><span class="tiny muted">Bin ${esc(s.bin)}</span>` : ''}</td><td class="n"><b>${num(s.qty)}</b>${s.reserved ? `<br><span class="tiny muted">${num(s.reserved)} held</span>` : ''}</td></tr>`).join('') || '<tr><td class="muted">Not in any store yet</td></tr>'}</tbody></table></div></div>
        <div><h3>Used on</h3>${r.assets.length ? r.assets.map((a) => `<p class="small">${ic('tag', 13)} <b>${esc(a.tag)}</b> ${esc(a.name)} · ${a.qty}${a.on_pm ? ' · reserved for PM' : ''}</p>`).join('') : '<p class="muted small">Not linked to a machine.</p>'}${r.reservations.length ? `<h3 style="margin-top:10px">Held for jobs</h3>${r.reservations.map((x) => `<p class="small"><a href="#/job/${x.wo_id}">${esc(x.number)}</a> · ${num(x.qty)} in ${esc(x.store)}</p>`).join('')}` : ''}</div></div>
      ${KEEP() ? `<form class="card stack" id="mv" style="box-shadow:none"><h3>Record stock</h3><div class="grid3"><label class="f">What happened<select name="kind" id="mk">${opt([['receive', 'Delivery received'], ['count', 'Stock count (set the quantity)'], ['adjust', 'Adjust (+/−)'], ['transfer', 'Move to another store']], 'receive')}</select></label><label class="f">Store<select name="store_id">${opt(stores.map((s) => [s.id, s.name]), r.stock[0] ? r.stock[0].store_id : stores[0] && stores[0].id)}</select></label><label class="f">Quantity<input name="qty" type="number" step="any" required></label></div>
        <div class="grid3"><label class="f" id="mto" hidden>To store<select name="to_store_id">${opt(stores.map((s) => [s.id, s.name]))}</select></label><label class="f" id="mcost">Unit cost<input name="unit_cost" type="number" step="any" min="0"></label><label class="f">Reference / note<input name="note"></label><label class="f">Bin / shelf<input name="bin"></label></div><p class="err" id="mve"></p><button class="btn ghost">Save</button></form>` : ''}
      <h3>History</h3><div class="tw" style="box-shadow:none;max-height:260px;overflow:auto"><table><tbody>${r.moves.map((m) => `<tr><td>${fdate(m.created_at)}<br><span class="tiny muted">${esc(m.by_name || 'System')}</span></td><td>${esc(kindL[m.kind] || m.kind)}${m.number ? ` <a href="#/job/${m.wo_id}" class="tiny">${esc(m.number)}</a>` : ''}<br><span class="tiny muted">${esc(m.store)}${m.note ? ' · ' + esc(m.note) : ''}${m.ref && !m.number ? ' · ' + esc(m.ref) : ''}</span></td><td class="n ${m.qty < 0 ? 'bad' : 'ok'}">${m.qty > 0 ? '+' : ''}${num(m.qty)}</td></tr>`).join('') || '<tr><td class="muted">No movements yet.</td></tr>'}</tbody></table></div>
      <div class="acts">${KEEP() ? '<button class="btn ghost" id="ed">Edit part</button><button class="btn ghost" id="ln">Link to a machine</button>' : ''}<button class="btn" id="pr">Request a purchase</button></div>`,
    (dl) => {
      $$('a', dl).forEach((a) => a.addEventListener('click', () => dl.close()));
      $('#pr', dl).onclick = () => { dl.close(); purchaseDlg(p.id, null, route); };
      const ed = $('#ed', dl); if (ed) ed.onclick = () => { dl.close(); partForm(p, null); };
      const ln = $('#ln', dl); if (ln) ln.onclick = () => { dl.close(); linkDlg(p); };
      const mv = $('#mv', dl);
      if (mv) {
        const mk = $('#mk', dl), sync = () => { $('#mto', dl).hidden = mk.value !== 'transfer'; $('#mcost', dl).hidden = mk.value !== 'receive'; }; mk.onchange = sync; sync();
        mv.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const x = formData(mv); const res = await api('/stock', { ...x, part_id: p.id }); toast(x.kind === 'count' ? `Counted. Difference ${res.diff > 0 ? '+' : ''}${res.diff}` : 'Saved'); dl.close(); await refreshLK(); partDlg(p.id); }, $('#mve', dl)); });
      }
    }, 'wide');
  }
  function linkDlg(p, assetId, done) {
    dlg(`${head('Link part to a machine', p ? esc(p.part_no + ' · ' + p.name) : 'Spares list')}<form class="stack" id="lf">${p ? '' : `<label class="f">Part<select name="part_id" required>${opt((LK.parts || []).map((x) => [x.id, x.part_no + ' · ' + x.name]), '', 'Choose…')}</select></label>`}
      ${assetId ? '' : `<label class="f">Machine<select name="asset_id" required>${opt(LK.assets.map((a) => [a.id, a.tag + ' · ' + a.name]), '', 'Choose…')}</select></label>`}
      <div class="grid2"><label class="f">Quantity per job<input name="qty" type="number" step="any" min="1" value="1"></label><label class="check" style="align-self:end"><input type="checkbox" name="on_pm"> Reserve automatically for planned jobs</label></div>
      <p class="err" id="le"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Link</button></div></form>`,
    (dl) => $('#lf', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); busy(e.submitter, async () => { await api('/parts', { link: { asset_id: assetId || x.asset_id, part_id: p ? p.id : x.part_id, qty: x.qty, on_pm: !!x.on_pm } }); dl.close(); toast('Linked'); if (done) done(); }, $('#le', dl)); }));
  }
  function countDlg(d, storeId) {
    const store = d.stores.find((s) => s.id === storeId);
    const lines = d.parts.filter((p) => p.stock.some((s) => s.store_id === storeId));
    dlg(`${head('Stock count', esc(store.name) + ' · enter what is on the shelf')}<form class="stack" id="cf"><div class="tw" style="box-shadow:none;max-height:55vh;overflow:auto"><table><thead><tr><th>Part</th><th class="n">System</th><th class="n">Counted</th></tr></thead><tbody>${lines.map((p) => { const s = p.stock.find((x) => x.store_id === storeId); return `<tr><td><b>${esc(p.part_no)}</b><br><span class="tiny muted">${esc(p.name)}${s.bin ? ' · bin ' + esc(s.bin) : ''}</span></td><td class="n">${num(s.qty)}</td><td class="n"><input name="p${p.id}" type="number" step="any" min="0" style="max-width:90px" placeholder="${num(s.qty)}" inputmode="decimal"></td></tr>`; }).join('')}</tbody></table></div>
      <p class="hint">Leave a line blank if you did not count it. Differences are saved as adjustments with a stock-count note.</p><p class="err" id="ce"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save count</button></div></form>`,
    (dl) => $('#cf', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); busy(e.submitter, async () => { let n = 0, diff = 0; for (const [k, val] of Object.entries(x)) { if (val === '') continue; const r = await api('/stock', { part_id: k.slice(1), store_id: storeId, qty: val, kind: 'count' }); n++; if (r.diff) diff++; } dl.close(); toast(`${n} line${n === 1 ? '' : 's'} counted, ${diff} adjusted`); await refreshLK(); route(); }, $('#ce', dl)); }), 'wide');
  }

  /* ---------- v4: stores department ---------- */
  const KEEP = () => ['admin', 'manager', 'stores'].includes(ME.role);
  const REQL = { awaiting_approval: 'Waiting for approval', requested: 'Requested', ready: 'Ready to collect', part_issued: 'Part issued', issued: 'Issued', rejected: 'Rejected', cancelled: 'Cancelled' };
  const POL = { draft: 'Draft', approval: 'Waiting for approval', ordered: 'Ordered', part_received: 'Part received', received: 'Received', cancelled: 'Cancelled' };
  const rqp = (s) => `<span class="pill ${s === 'ready' ? 's-approved' : s === 'issued' || s === 'received' ? 's-closed' : s === 'awaiting_approval' || s === 'approval' ? 's-reviewed' : s === 'rejected' || s === 'cancelled' ? 's-cancelled' : s === 'part_issued' || s === 'part_received' ? 's-on_hold' : 's-in_progress'}">${esc(REQL[s] || POL[s] || s)}</span>`;
  const partOpts = (sel) => opt((LK.parts || []).map((p) => [p.id, `${p.part_no} · ${p.name}`]), sel || '', 'Choose a part…');
  const freeTotal = (pid) => (LK.stock || []).filter((s) => s.part_id === pid).reduce((a, s) => a + Math.max(0, s.free), 0);

  // request form: used from a job, from the stores page and by department staff
  function reqForm(opts = {}) {
    const lines = opts.lines && opts.lines.length ? opts.lines : [{}];
    const isJob = !!opts.wo;
    return `<form class="stack" id="rqf">${isJob ? '' : `<div class="grid3"><label class="f">Department<select name="department">${opt(LK.departments || [], ME.role === 'dept' || ME.role === 'stores' ? ME.trade : (ME.trade && (LK.departments || []).includes(ME.trade) ? ME.trade : 'Workshop'))}</select></label>
        <label class="f">For a project <span class="hint">(optional)</span><select name="project_id">${opt((LK.projects || []).map((p) => [p.id, p.number + ' · ' + p.name]), '', 'No project')}</select></label><label class="f">Needed by<input type="date" name="needed_by"></label></div>`}
      <div id="rql" class="stack" style="gap:8px">${lines.map((l, i) => reqLine(l, i)).join('')}</div>
      <div class="row"><button class="btn ghost sm" type="button" id="rqa">${ic('plus', 14)} Another item</button><span class="hint">Not in the list? Type it under "Or describe it" and the stores will find it.</span></div>
      <div class="grid2"><label class="f">From store<select name="store_id">${opt((LK.stores || []).map((s) => [s.id, s.name]), (LK.stores || [])[0] ? LK.stores[0].id : '')}</select></label><label class="f">Priority<select name="priority">${opt([['Normal', 'Normal'], ['Urgent', 'Urgent: machine down or job stopped']], 'Normal')}</select></label></div>
      <label class="f">Note for the stores <span class="hint">(optional)</span><input name="note" placeholder="Where to deliver, who will collect"></label>
      ${!isJob && SET.req_approval !== '0' && !SUP() && !KEEP() ? '<p class="hint">Requests not for a job are approved by your foreman or a manager first.</p>' : ''}
      <p class="err" id="rqe" role="alert"></p><div class="acts">${opts.cancel ? '<button class="btn ghost" type="button" data-close>Cancel</button>' : ''}<button class="btn">${ic('send', 16)} Send to stores</button></div></form>`;
  }
  const reqLine = (l, i) => `<div class="rql grid3" data-i="${i}"><label class="f" style="grid-column:span 2">Part<select name="part_${i}">${partOpts(l.part_id)}</select><span class="hint free"></span></label><label class="f">Quantity<input name="qty_${i}" type="number" step="any" min="0" inputmode="decimal" value="${esc(l.qty || '')}"></label><label class="f" style="grid-column:1/-1">…or describe it<input name="item_${i}" placeholder="e.g. 16 mm² earth cable, 20 m"></label></div>`;
  function wireReqForm(root, opts, done) {
    const f = $('#rqf', root); let n = $$('.rql', root).length;
    const hint = (row) => { const sel = row.querySelector('select'); const h = row.querySelector('.free'); const pid = Number(sel.value); if (!pid) { h.textContent = ''; return; } const p = (LK.parts || []).find((x) => x.id === pid); const fr = freeTotal(pid); h.textContent = fr > 0 ? `${num(fr)} ${p ? p.unit : ''} free in stores` : 'Out of stock: the stores will order it'; h.className = 'hint free ' + (fr > 0 ? '' : 'bad'); };
    const wire = (row) => { row.querySelector('select').onchange = () => hint(row); hint(row); };
    $$('.rql', root).forEach(wire);
    $('#rqa', root).onclick = () => { const w = document.createElement('div'); w.innerHTML = reqLine({}, n++); const row = w.firstElementChild; $('#rql', root).appendChild(row); wire(row); row.querySelector('select').focus(); };
    f.addEventListener('submit', (e) => {
      e.preventDefault(); const x = formData(f);
      const lines = []; for (let i = 0; i < n; i++) { if (x['qty_' + i] && (x['part_' + i] || x['item_' + i])) lines.push({ part_id: x['part_' + i] || null, item: x['part_' + i] ? '' : x['item_' + i], qty: x['qty_' + i] }); }
      busy(e.submitter, async () => {
        if (!lines.length) throw new Error('Choose at least one item and how many.');
        const r = await api('/requisitions', { wo_id: opts.wo || undefined, department: x.department, project_id: x.project_id || undefined, needed_by: x.needed_by || undefined, store_id: x.store_id, priority: x.priority, note: x.note, lines });
        toast(r.status === 'awaiting_approval' ? `${r.number} sent for approval` : `${r.number} sent to the stores`); done(r);
      }, $('#rqe', root));
    });
  }
  function jobReqDlg(w, pre, reload) {
    dlg(`${head('Request from stores', `${esc(w.number)} · the stores pick it and tell you when it is ready`)}${reqForm({ wo: w.id, lines: pre, cancel: true })}`, (dl) => wireReqForm(dl, { wo: w.id }, () => { dl.close(); reload(); }), 'wide');
  }

  async function reqList(box, mineOnly) {
    let f = KEEP() ? 'open' : 'all';
    const draw = async () => {
      const d = await api('/requisitions?status=' + (f === 'all' ? '' : f));
      box.innerHTML = `<div class="between"><div class="chips">${[['open', 'Open'], ['awaiting_approval', 'Waiting for approval'], ['requested', 'To pick'], ['ready', 'Ready'], ['all', 'All']].map(([k, l]) => `<button class="chip" data-rf="${k}" aria-pressed="${k === f}">${l}</button>`).join('')}</div><a class="btn" href="#/stores/new">${ic('plus', 16)} New request</a></div>
        ${d.items.length ? `<div class="tw"><table><thead><tr><th>Request</th><th>For</th><th>Items</th><th>Asked by</th><th>Status</th>${KEEP() ? '<th class="n">Value issued</th>' : ''}</tr></thead><tbody>${d.items.map((r) => `<tr class="click" data-rq="${r.id}"><td class="mono">${esc(r.number)}${r.priority === 'Urgent' ? ' <span class="pill p-Urgent">Urgent</span>' : ''}<br><span class="tiny muted">${ago(r.created_at)}</span></td><td>${r.wo_number ? `<b>${esc(r.wo_number)}</b>` : esc(r.department || '')}${r.project_number ? `<br><span class="tiny muted">${esc(r.project_number)}</span>` : ''}${r.wo_number ? `<br><span class="tiny muted">${esc(r.department || '')}</span>` : ''}</td><td><span class="small">${esc((r.summary || '').slice(0, 70))}</span><br><span class="tiny muted">${r.lines} line${r.lines === 1 ? '' : 's'} · ${esc(r.store || '')}</span></td><td>${esc(r.requester || '')}</td><td>${rqp(r.status)}</td>${KEEP() ? `<td class="n">${r.value ? money(r.value) : '—'}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : '<p class="empty">No requests here.</p>'}`;
      $$('[data-rf]', box).forEach((b) => b.onclick = () => { f = b.dataset.rf; draw(); });
      $$('[data-rq]', box).forEach((tr) => tr.onclick = () => { location.hash = '#/stores/req/' + tr.dataset.rq; });
    };
    await draw();
  }
  async function reqView(v, id) {
    const d = await api('/requisitions/' + id), r = d.item, can = d.can;
    setTitle(r.number);
    const open = ['requested', 'ready', 'part_issued'].includes(r.status);
    const left = (l) => Math.max(0, Math.round((l.qty - (l.qty_issued || 0)) * 100) / 100);
    v.innerHTML = `<div class="jobhead"><a class="link" href="#/stores/req">${ic('back', 14)} Stores requests</a>
      <div class="between" style="align-items:flex-start"><div><span class="mono muted">${esc(r.number)}</span><h1>${r.wo_number ? `Parts for ${esc(r.wo_number)}` : esc(r.department || 'Stores request')}</h1><p class="muted small">Asked by ${esc(r.requester || '')} · ${fdt(toLocalInput(r.created_at).replace('T', ' '))}${r.needed_by ? ' · needed by ' + fdate(r.needed_by) : ''} · ${esc(r.store || '')}</p></div><div class="row">${r.priority === 'Urgent' ? pp('Urgent') : ''}${rqp(r.status)}</div></div>
      ${r.status === 'rejected' ? `<div class="banner bad">${ic('x')}<span>Rejected: ${esc(r.reject_note || '')}</span></div>` : ''}${r.status === 'ready' ? `<div class="banner ok">${ic('box')}<span>Ready to collect at ${esc(r.store)}.</span></div>` : ''}
      <div class="actions">${can.approve && r.status === 'awaiting_approval' ? '<button class="btn ok" data-ra="approve">Approve</button>' : ''}
        ${can.keep && ['requested', 'part_issued'].includes(r.status) ? '<button class="btn ghost" data-ra="ready">Mark ready to collect</button>' : ''}
        ${can.keep && open ? '<button class="btn" data-ra="issue">Issue items</button><button class="btn ghost" data-ra="purchase">Order what is short</button>' : ''}
        ${(can.keep || can.approve) && ['awaiting_approval', 'requested', 'ready'].includes(r.status) ? '<button class="btn bad" data-ra="reject">Reject</button>' : ''}
        ${r.requested_by === ME.id && ['awaiting_approval', 'requested', 'ready'].includes(r.status) && !r.lines.some((l) => l.qty_issued) ? '<button class="btn ghost" data-ra="cancel">Cancel request</button>' : ''}
        ${can.keep ? `<button class="btn ghost" data-ra="print">${ic('printer', 16)} Pick list</button>` : ''}</div></div>
      <div class="cols2"><div class="stack"><div class="card"><h2 style="margin-bottom:10px">Items</h2><div class="tw" style="box-shadow:none"><table><thead><tr><th>Item</th><th class="n">Asked</th><th class="n">Issued</th>${can.keep ? '<th class="n">Free now</th><th>Bin</th>' : ''}<th></th></tr></thead><tbody>${r.lines.map((l) => `<tr><td>${l.part_id ? `<b class="mono">${esc(l.part_no)}</b><br><span class="small">${esc(l.part_name)}</span>` : `<b>${esc(l.item)}</b><br><span class="tiny muted">Not a catalogue part</span>`}</td><td class="n">${num(l.qty)} ${esc(l.unit || '')}</td><td class="n">${l.qty_issued ? num(l.qty_issued) : '—'}</td>${can.keep ? `<td class="n ${l.free != null && l.free < left(l) ? 'bad' : ''}">${l.free == null ? '—' : num(l.free)}</td><td>${esc(l.bin || '')}</td>` : ''}<td class="n">${can.keep && !l.part_id && open ? `<button class="link small" data-link="${l.id}">Link part</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div></div>
      <div class="stack"><div class="card"><dl class="dl"><div><dt>Department</dt><dd>${esc(r.department || '—')}</dd></div><div><dt>Job</dt><dd>${r.wo_number ? `<a href="#/job/${r.wo_id}/materials">${esc(r.wo_number)}</a><br><span class="tiny muted">${esc(r.wo_title || '')}</span>` : '—'}</dd></div><div><dt>Project</dt><dd>${r.project_number ? esc(r.project_number + ' · ' + r.project_name) : '—'}</dd></div><div><dt>Approved by</dt><dd>${esc(r.approver || (r.status === 'awaiting_approval' ? 'Waiting' : 'Not needed'))}</dd></div>${r.issuer ? `<div><dt>Issued by</dt><dd>${esc(r.issuer)} · ${fdate(r.issued_at)}</dd></div><div><dt>Collected by</dt><dd>${esc(r.collected_by || '')}</dd></div>` : ''}${KEEP() && r.value ? `<div><dt>Value issued</dt><dd>${money(r.value)}</dd></div>` : ''}</dl>${r.note ? `<p class="textblock" style="margin-top:10px">${esc(r.note)}</p>` : ''}</div></div></div>`;
    const act = (body, msg) => api('/requisitions/' + r.id, body).then((x) => { toast(msg); refreshLK(); reqView(v, id); return x; });
    $$('[data-ra]', v).forEach((b) => b.onclick = () => {
      const k = b.dataset.ra;
      if (k === 'approve') return busy(b, () => act({ action: 'approve' }, 'Approved. The stores have been told.'));
      if (k === 'ready') return busy(b, () => act({ action: 'ready' }, 'Marked ready. The requester has been told.'));
      if (k === 'cancel') return busy(b, () => act({ action: 'cancel' }, 'Request cancelled'));
      if (k === 'purchase') return busy(b, async () => { const x = await api('/requisitions/' + r.id, { action: 'purchase' }); toast(`${x.ordered} purchase request${x.ordered > 1 ? 's' : ''} raised. Put them on a purchase order under "To order".`); reqView(v, id); });
      if (k === 'reject') return dlg(`${head('Reject request', esc(r.number))}<form class="stack" id="jf"><label class="f">Reason<textarea name="note" rows="2" required placeholder="e.g. Use the spare in the van first"></textarea></label><p class="err" id="je"></p><div class="acts"><button class="btn ghost" type="button" data-close>Back</button><button class="btn bad">Reject</button></div></form>`, (dl) => $('#jf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/requisitions/' + r.id, { action: 'reject', note: e.target.note.value }); dl.close(); toast('Rejected'); reqView(v, id); }, $('#je', dl)); }));
      if (k === 'print') return printDoc(r.number + ' pick list', `${docHead('Stores pick list', esc(r.number) + ' · ' + fdate(today()))}<p><b>${esc(r.department || '')}</b>${r.wo_number ? ' · Job ' + esc(r.wo_number) + ' ' + esc(r.wo_title || '') : ''}<br>Asked by ${esc(r.requester || '')} · ${esc(r.store || '')}${r.priority === 'Urgent' ? ' · <b class="bad">URGENT</b>' : ''}</p>
        <table><thead><tr><th>Bin</th><th>Part</th><th class="n">Qty</th><th class="n">Picked</th></tr></thead><tbody>${r.lines.filter((l) => left(l) > 0).map((l) => `<tr><td>${esc(l.bin || '')}</td><td>${l.part_id ? `<b>${esc(l.part_no)}</b> ${esc(l.part_name)}` : esc(l.item)}</td><td class="n">${num(left(l))} ${esc(l.unit || '')}</td><td class="n">______</td></tr>`).join('')}</tbody></table>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:40px"><div>Issued by: ____________________<br><br>Signature: ____________________</div><div>Collected by: ____________________<br><br>Signature: ____________________</div></div>`);
      if (k === 'issue') return dlg(`${head('Issue items', `${esc(r.number)} · from ${esc(r.store)}`)}<form class="stack" id="if"><div class="tw" style="box-shadow:none"><table><thead><tr><th>Item</th><th class="n">Still to issue</th><th class="n">Free</th><th class="n">Handing over</th></tr></thead><tbody>${r.lines.filter((l) => left(l) > 0).map((l) => `<tr><td>${l.part_id ? `<b>${esc(l.part_no)}</b><br><span class="tiny muted">${esc(l.part_name)}${l.bin ? ' · bin ' + esc(l.bin) : ''}</span>` : `${esc(l.item)}<br><span class="tiny bad">Link to a part first</span>`}</td><td class="n">${num(left(l))}</td><td class="n">${l.free == null ? '—' : num(l.free)}</td><td class="n">${l.part_id ? `<input name="l${l.id}" type="number" step="any" min="0" max="${left(l)}" value="${Math.min(left(l), l.free || 0)}" style="max-width:90px" inputmode="decimal">` : ''}</td></tr>`).join('')}</tbody></table></div>
        <label class="f">Collected by<input name="collected_by" value="${esc(r.requester || '')}" required></label><p class="hint">${r.wo_number ? 'Issued parts are costed on the job.' : r.project_number ? 'Issued parts are costed on the project.' : 'Issued parts are costed to ' + esc(r.department || 'the department') + '.'} Anything not handed over stays open on the request.</p><p class="err" id="ie"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Issue</button></div></form>`,
        (dl) => $('#if', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); const lines = Object.entries(x).filter(([k2]) => /^l\d+$/.test(k2)).map(([k2, q]) => ({ id: Number(k2.slice(1)), qty: Number(q) || 0 })).filter((l) => l.qty > 0); busy(e.submitter, async () => { if (!lines.length) throw new Error('Enter how many of each item you are handing over.'); const res = await api('/requisitions/' + r.id, { action: 'issue', lines, collected_by: x.collected_by }); dl.close(); toast(res.status === 'issued' ? `Issued (${money(res.value)})` : 'Part issued. The rest stays open.'); await refreshLK(); reqView(v, id); }, $('#ie', dl)); }), 'wide');
    });
    $$('[data-link]', v).forEach((b) => b.onclick = () => dlg(`${head('Link to a catalogue part')}<form class="stack" id="lf"><label class="f">Part<select name="part_id" required>${partOpts()}</select><span class="hint">Not in the catalogue? Add it under Stores · Parts first.</span></label><p class="err" id="le"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Link</button></div></form>`, (dl) => $('#lf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/requisitions/' + r.id, { action: 'link', line_id: b.dataset.link, part_id: e.target.part_id.value }); dl.close(); reqView(v, id); }, $('#le', dl)); })));
  }
  async function newReqView(v) {
    setTitle('Request from stores'); await refreshLK();
    v.innerHTML = `<div class="card" style="max-width:860px"><h2>What do you need from the stores?</h2><p class="muted small" style="margin:4px 0 14px">For parts on a job, open the job and use "Request from stores" on its Materials tab so the parts are costed to that job.</p>${reqForm({})}</div>`;
    wireReqForm(v, {}, (r) => { location.hash = '#/stores/req/' + r.id; });
  }

  async function poList(box) {
    const d = await api('/po');
    box.innerHTML = `<div class="between"><p class="muted small">Orders to suppliers. Orders over ${money(Number(SET.po_limit) || 0).replace(/\.00$/, '')} need a manager to approve them before they go out.</p>${KEEP() ? `<button class="btn" id="npo">${ic('plus', 16)} New purchase order</button>` : ''}</div>
      ${d.items.length ? `<div class="tw"><table><thead><tr><th>Order</th><th>Supplier</th><th class="n">Lines</th><th class="n">Total</th><th>Expected</th><th>Status</th></tr></thead><tbody>${d.items.map((o) => `<tr class="click" data-po="${o.id}"><td class="mono">${esc(o.number)}<br><span class="tiny muted">${fdate(o.created_at)}</span></td><td>${esc(o.supplier || '—')}</td><td class="n">${o.lines}</td><td class="n">${money(o.total)}</td><td style="${o.expected && o.expected < today() && ['ordered', 'part_received'].includes(o.status) ? 'color:var(--bad);font-weight:700' : ''}">${fdate(o.expected) || '—'}</td><td>${rqp(o.status)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No purchase orders yet.</p>'}`;
    $$('[data-po]', box).forEach((tr) => tr.onclick = () => { location.hash = '#/stores/po/' + tr.dataset.po; });
    const n = $('#npo', box); if (n) n.onclick = () => poNewDlg();
  }
  async function poNewDlg(preReq) {
    const [sup, st] = await Promise.all([api('/suppliers'), api('/stores')]);
    if (!sup.items.length) { toast('Add a supplier first (Suppliers tab)', true); return; }
    const reqs = st.requests.filter((r) => r.status === 'requested' && !r.po_id);
    dlg(`${head('New purchase order')}<form class="stack" id="pf"><div class="grid3"><label class="f">Supplier<select name="supplier_id" required>${opt(sup.items.map((s) => [s.id, s.name]), '', 'Choose…')}</select></label><label class="f">Deliver to<select name="store_id">${opt(st.stores.map((s) => [s.id, s.name]), st.stores[0] && st.stores[0].id)}</select></label><label class="f">Expected <span class="hint">(blank = supplier lead time)</span><input type="date" name="expected"></label></div>
      ${reqs.length ? `<fieldset class="card" style="box-shadow:none"><legend class="small" style="font-weight:700;padding:0 6px">Purchase requests waiting to be ordered</legend>${reqs.map((r) => `<label class="check"><input type="checkbox" name="r${r.id}" ${preReq && preReq.includes(r.id) ? 'checked' : ''}> PR-${r.id} · ${num(r.qty)} ${esc(r.unit)} <b>${esc(r.part_no)}</b> ${esc(r.name)}${r.supplier ? ` <span class="tiny muted">(${esc(r.supplier)})</span>` : ''}</label>`).join('')}</fieldset>` : ''}
      <div id="pol" class="stack" style="gap:8px"></div><button class="btn ghost sm" type="button" id="pla">${ic('plus', 14)} Add a part</button>
      <label class="f">Note to supplier<input name="note" placeholder="Delivery instructions, quote reference"></label><p class="err" id="pe"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Create draft order</button></div></form>`,
    (dl) => {
      let n = 0; const add = () => { const w = document.createElement('div'); w.className = 'grid3'; const i = n++; w.innerHTML = `<label class="f" style="grid-column:span 1">Part<select name="p${i}">${partOpts()}</select></label><label class="f">Quantity<input name="q${i}" type="number" step="any" min="0"></label><label class="f">Unit cost<input name="c${i}" type="number" step="any" min="0" placeholder="Catalogue cost"></label>`; $('#pol', dl).appendChild(w); };
      $('#pla', dl).onclick = add; if (!reqs.length) add();
      $('#pf', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); const lines = []; for (let i = 0; i < n; i++) if (x['p' + i] && Number(x['q' + i]) > 0) lines.push({ part_id: x['p' + i], qty: x['q' + i], unit_cost: x['c' + i] === '' ? undefined : x['c' + i] }); const from = Object.keys(x).filter((k) => /^r\d+$/.test(k)).map((k) => Number(k.slice(1)));
        busy(e.submitter, async () => { const r = await api('/po', { supplier_id: x.supplier_id, store_id: x.store_id, expected: x.expected, note: x.note, lines, from_requests: from }); dl.close(); toast(`${r.number} created`); location.hash = '#/stores/po/' + r.id; }, $('#pe', dl)); });
    }, 'wide');
  }
  async function poView(v, id) {
    const d = await api('/po/' + id), o = d.item;
    setTitle(o.number);
    const out = (l) => Math.max(0, Math.round((l.qty - l.qty_received) * 100) / 100);
    const draft = ['draft', 'approval'].includes(o.status);
    v.innerHTML = `<div class="jobhead"><a class="link" href="#/stores/po">${ic('back', 14)} Purchase orders</a><div class="between" style="align-items:flex-start"><div><span class="mono muted">${esc(o.number)}</span><h1>${esc(o.supplier || '')}</h1><p class="muted small">Raised by ${esc(o.created_name || '')} · ${fdate(o.created_at)}${o.expected ? ' · expected ' + fdate(o.expected) : ''} · deliver to ${esc(o.store || '')}</p></div><div class="row"><b style="font-size:20px">${money(o.total)}</b>${rqp(o.status)}</div></div>
      ${o.status === 'approval' ? `<div class="banner info">${ic('users')}<span>Over the ${money(Number(SET.po_limit) || 0)} limit: a manager must approve before it is sent.</span></div>` : ''}
      <div class="actions">${o.status === 'draft' && KEEP() ? '<button class="btn" data-pa="send">Approve and send</button>' : ''}${o.status === 'approval' && BOSS() ? '<button class="btn ok" data-pa="approve">Approve order</button>' : ''}
        ${['ordered', 'part_received'].includes(o.status) && KEEP() ? '<button class="btn" data-pa="receive">Receive delivery</button>' : ''}<button class="btn ghost" data-pa="print">${ic('printer', 16)} Print order</button>
        ${!['received', 'cancelled'].includes(o.status) && KEEP() && !o.lines.some((l) => l.qty_received) ? '<button class="btn bad" data-pa="cancel">Cancel order</button>' : ''}</div></div>
      <div class="cols2"><div class="card"><h2 style="margin-bottom:10px">Lines</h2><div class="tw" style="box-shadow:none"><table><thead><tr><th>Part</th><th class="n">Ordered</th><th class="n">Received</th><th class="n">Unit cost</th><th class="n">Total</th>${draft && KEEP() ? '<th></th>' : ''}</tr></thead><tbody>${o.lines.map((l) => `<tr><td><b class="mono">${esc(l.part_no)}</b><br><span class="small">${esc(l.part_name)}</span></td><td class="n">${draft && KEEP() ? `<input data-lq="${l.id}" type="number" step="any" min="0" value="${l.qty}" style="max-width:80px">` : num(l.qty) + ' ' + esc(l.unit)}</td><td class="n">${l.qty_received ? num(l.qty_received) : '—'}</td><td class="n">${draft && KEEP() ? `<input data-lc="${l.id}" type="number" step="any" min="0" value="${l.unit_cost}" style="max-width:90px">` : money(l.unit_cost)}</td><td class="n">${money(l.qty * l.unit_cost)}</td>${draft && KEEP() ? `<td class="n"><button class="link" data-lr="${l.id}" aria-label="Remove">${ic('trash', 15)}</button></td>` : ''}</tr>`).join('')}</tbody></table></div>${draft && KEEP() ? '<button class="btn ghost sm" id="sv" style="margin-top:10px">Save changes</button>' : ''}</div>
      <div class="stack"><div class="card"><h3>Supplier</h3><p class="small" style="margin-top:6px">${esc(o.supplier || '')}<br>${esc([o.supplier_contact, o.supplier_phone, o.supplier_email].filter(Boolean).join(' · '))}${o.supplier_terms ? '<br>Terms: ' + esc(o.supplier_terms) : ''}</p>${o.note ? `<p class="textblock small" style="margin-top:8px">${esc(o.note)}</p>` : ''}${o.approver ? `<p class="tiny muted" style="margin-top:8px">Approved by ${esc(o.approver)}</p>` : ''}${o.delivery_ref ? `<p class="tiny muted">Delivery note ${esc(o.delivery_ref)}</p>` : ''}</div>
        ${o.requests.length ? `<div class="card"><h3>Ordered for</h3>${o.requests.map((r) => `<p class="small">PR-${r.id} · ${num(r.qty)} ${esc(r.part_no)} · ${esc(r.by_name || '')}${r.number ? ' · ' + esc(r.number) : ''}</p>`).join('')}</div>` : ''}</div></div>`;
    const re = () => poView(v, id);
    const sv = $('#sv', v); if (sv) sv.onclick = () => busy(sv, async () => { const lines = o.lines.map((l) => ({ id: l.id, qty: $(`[data-lq="${l.id}"]`, v).value, unit_cost: $(`[data-lc="${l.id}"]`, v).value })); await api('/po/' + o.id, { action: 'lines', lines }); toast('Saved'); re(); });
    $$('[data-lr]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api('/po/' + o.id, { action: 'lines', lines: [{ id: b.dataset.lr, remove: true }] }); re(); }));
    $$('[data-pa]', v).forEach((b) => b.onclick = () => {
      const k = b.dataset.pa;
      if (k === 'send' || k === 'approve') return busy(b, async () => { const r = await api('/po/' + o.id, { action: k }); toast(r.status === 'approval' ? 'Sent to a manager for approval' : 'Order approved. Print it or send it to the supplier.'); re(); });
      if (k === 'cancel') return busy(b, async () => { await api('/po/' + o.id, { action: 'cancel' }); toast('Order cancelled'); re(); });
      if (k === 'print') { const S = d.settings; return printDoc(o.number, `${docHead('Purchase order', esc(o.number) + ' · ' + fdate(o.ordered_at || o.created_at))}<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:14px 0"><div><h3>Supplier</h3>${esc(o.supplier || '')}<br>${esc(o.supplier_contact || '')}<br>${esc(o.supplier_phone || '')} ${esc(o.supplier_email || '')}<br>${esc(o.supplier_address || '')}</div><div><h3>Deliver to</h3>${esc(S.company || '')}<br>${esc(o.store || '')}<br>${esc(S.address || '')}${o.expected ? '<br><b>Required by ' + fdate(o.expected) + '</b>' : ''}</div></div>
        <table><thead><tr><th>Part no.</th><th>Description</th><th class="n">Qty</th><th class="n">Unit price</th><th class="n">Total</th></tr></thead><tbody>${o.lines.map((l) => `<tr><td>${esc(l.part_no)}</td><td>${esc(l.part_name)}</td><td class="n">${num(l.qty)} ${esc(l.unit)}</td><td class="n">${money(l.unit_cost)}</td><td class="n">${money(l.qty * l.unit_cost)}</td></tr>`).join('')}<tr><td colspan="4" class="n"><b>Total excl. VAT</b></td><td class="n"><b>${money(o.total)}</b></td></tr></tbody></table>
        ${o.note ? `<p><b>Note:</b> ${esc(o.note)}</p>` : ''}${o.supplier_terms ? `<p class="muted">Terms: ${esc(o.supplier_terms)}</p>` : ''}<p style="margin-top:30px">Authorised: ${esc(o.approver || o.created_name || '')} ____________________</p><p class="muted">Please quote ${esc(o.number)} on your delivery note and invoice.</p>`); }
      if (k === 'receive') return dlg(`${head('Receive delivery', `${esc(o.number)} · ${esc(o.supplier || '')}`)}<form class="stack" id="rf"><div class="tw" style="box-shadow:none"><table><thead><tr><th>Part</th><th class="n">Outstanding</th><th class="n">Delivered now</th><th class="n">Unit cost</th></tr></thead><tbody>${o.lines.filter((l) => out(l) > 0).map((l) => `<tr><td><b>${esc(l.part_no)}</b><br><span class="tiny muted">${esc(l.part_name)}</span></td><td class="n">${num(out(l))}</td><td class="n"><input name="q${l.id}" type="number" step="any" min="0" max="${out(l)}" value="${out(l)}" style="max-width:80px"></td><td class="n"><input name="c${l.id}" type="number" step="any" min="0" value="${l.unit_cost}" style="max-width:90px"></td></tr>`).join('')}</tbody></table></div>
        <label class="f">Delivery note / invoice no.<input name="ref"></label><p class="err" id="re"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Receive into stock</button></div></form>`,
        (dl) => $('#rf', dl).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); const lines = o.lines.filter((l) => Number(x['q' + l.id]) > 0).map((l) => ({ id: l.id, qty: x['q' + l.id], unit_cost: x['c' + l.id] })); busy(e.submitter, async () => { const r = await api('/po/' + o.id, { action: 'receive', ref: x.ref, lines }); dl.close(); toast(r.status === 'received' ? 'Delivery received in full. Requesters told.' : 'Part delivery received'); await refreshLK(); re(); }, $('#re', dl)); }), 'wide');
    });
  }
  async function supplierList(box) {
    const d = await api('/suppliers');
    box.innerHTML = `<div class="between"><p class="muted small">Who you buy from, their lead time and terms.</p>${KEEP() ? `<button class="btn" id="nsp">${ic('plus', 16)} Supplier</button>` : ''}</div>
      ${d.items.length ? `<div class="tw"><table><thead><tr><th>Supplier</th><th>Contact</th><th class="n">Lead time</th><th>Terms</th><th class="n">Orders</th><th class="n">Spend</th></tr></thead><tbody>${d.items.map((s) => `<tr class="${KEEP() ? 'click' : ''}" data-sp="${s.id}"><td><b>${esc(s.name)}</b>${s.address ? `<br><span class="tiny muted">${esc(s.address)}</span>` : ''}</td><td>${esc(s.contact || '')}<br><span class="tiny muted">${esc([s.phone, s.email].filter(Boolean).join(' · '))}</span></td><td class="n">${s.lead_days != null ? s.lead_days + ' days' : '—'}</td><td>${esc(s.terms || '—')}</td><td class="n">${s.orders}</td><td class="n">${money(s.spend)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No suppliers yet.</p>'}`;
    const form = (s) => { s = s || {}; dlg(`${head(s.id ? 'Edit supplier' : 'Add supplier')}<form class="stack" id="sf"><label class="f">Company<input name="name" value="${esc(s.name || '')}" required></label><div class="grid3"><label class="f">Contact person<input name="contact" value="${esc(s.contact || '')}"></label><label class="f">Phone<input name="phone" value="${esc(s.phone || '')}"></label><label class="f">Email<input name="email" type="email" value="${esc(s.email || '')}"></label></div><label class="f">Address<input name="address" value="${esc(s.address || '')}"></label><div class="grid2"><label class="f">Lead time (days)<input name="lead_days" type="number" min="0" value="${esc(s.lead_days ?? '')}"></label><label class="f">Payment terms<input name="terms" value="${esc(s.terms || '')}" placeholder="e.g. 30 days, COD"></label></div><label class="f">Notes<input name="notes" value="${esc(s.notes || '')}"></label><p class="err" id="se"></p><div class="acts">${s.id ? '<button class="btn bad" type="button" id="rm">Remove</button>' : ''}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`, (dl) => { $('#sf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/suppliers', { ...formData(e.target), id: s.id }); dl.close(); toast('Saved'); supplierList(box); }, $('#se', dl)); }); const rm = $('#rm', dl); if (rm) rm.onclick = () => busy(rm, async () => { await api('/suppliers', { ...s, id: s.id, remove: true }); dl.close(); supplierList(box); }); }, 'wide'); };
    const n = $('#nsp', box); if (n) n.onclick = () => form(null);
    if (KEEP()) $$('[data-sp]', box).forEach((tr) => tr.onclick = () => form(d.items.find((s) => String(s.id) === tr.dataset.sp)));
  }
  async function deptUsage(box) {
    const t = today(); let from = t.slice(0, 8) + '01', to = t;
    const draw = async () => {
      const d = await api(`/stores/usage?from=${from}&to=${to}`);
      box.innerHTML = `<div class="card row"><label class="f">From<input type="date" id="uf" value="${from}"></label><label class="f">To<input type="date" id="ut" value="${to}"></label><a class="btn ghost" style="align-self:end" href="/api/export/moves?from=${from}&to=${to}">${ic('download', 16)} Movements (CSV)</a></div>
        <div class="kpis"><div class="kpi"><span>Issued</span><b>${money(d.by_dept.reduce((a, x) => a + x.value, 0)).replace(/\.\d\d$/, '')}</b></div><div class="kpi"><span>Received</span><b>${money(d.received).replace(/\.\d\d$/, '')}</b></div><div class="kpi"><span>Returned</span><b>${money(d.returns).replace(/\.\d\d$/, '')}</b></div><div class="kpi"><span>Request to issue</span><b>${d.turnaround_h == null ? '—' : dur(d.turnaround_h)}</b><small>Average over ${d.requests} requests</small></div></div>
        <div class="card"><h2 style="margin-bottom:10px">Stores issues by department</h2>${bars(d.by_dept.map((x) => [x.dept, Math.round(x.value)]), (n) => money(n).replace(/\.\d\d$/, ''))}</div>`;
      $('#uf', box).onchange = (e) => { from = e.target.value; draw(); }; $('#ut', box).onchange = (e) => { to = e.target.value; draw(); };
    };
    await draw();
  }
  async function storesHome(v) {
    setTitle(ME.role === 'stores' ? 'Stores' : 'My stores requests');
    const h = await api('/stores/home'); await refreshLK();
    if (ME.role === 'dept') {
      v.innerHTML = `<div class="between"><div><h2>Hi ${esc(ME.name.split(' ')[0])}</h2><p class="muted">${esc(ME.trade || '')} · ask the stores for what you need and track it here.</p></div><a class="btn" href="#/stores/new">${ic('plus', 16)} New request</a></div>
        <div class="kpis"><div class="kpi"><span>Waiting for approval</span><b>${h.req.awaiting_approval}</b></div><div class="kpi"><span>With the stores</span><b>${h.req.requested + h.req.part_issued}</b></div><div class="kpi ${h.req.ready ? 'alert' : ''}"><span>Ready to collect</span><b>${h.req.ready}</b></div></div><div id="rl"></div>`;
      return reqList($('#rl', v));
    }
    v.innerHTML = `<div class="between"><div><h2>Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${esc(ME.name.split(' ')[0])}</h2><p class="muted">${fdate(today())} · ${esc(SET.company || '')} stores</p></div><div class="row"><a class="btn ghost" href="#/stores/parts">${ic('box', 16)} Parts and stock</a><a class="btn" href="#/stores/new">${ic('plus', 16)} New request</a></div></div>
      <div class="kpis"><a class="kpi ${h.req.urgent ? 'alert' : ''}" href="#/stores/req"><span>To pick</span><b>${h.req.requested + h.req.part_issued}</b><small>${h.req.urgent ? h.req.urgent + ' urgent' : 'Requests waiting'}</small></a><a class="kpi" href="#/stores/req"><span>Ready to collect</span><b>${h.req.ready}</b></a><a class="kpi" href="#/stores/req"><span>Waiting for approval</span><b>${h.req.awaiting_approval}</b></a>
        <a class="kpi ${h.low ? 'alert' : ''}" href="#/stores/parts"><span>Low stock</span><b>${h.low}</b></a><a class="kpi" href="#/stores/requests"><span>To order</span><b>${h.pr_open}</b><small>Purchase requests</small></a><a class="kpi ${h.po_late ? 'alert' : ''}" href="#/stores/po"><span>On order</span><b>${h.po_open}</b><small>${h.po_late ? h.po_late + ' late' : h.po_approval ? h.po_approval + ' waiting approval' : 'Purchase orders'}</small></a>${h.value != null ? `<div class="kpi"><span>Stock value</span><b>${money(h.value).replace(/\.\d\d$/, '')}</b></div>` : ''}</div>
      <div class="cols2"><div class="stack"><div class="card"><div class="card-h"><h2>Requests</h2></div><div id="rl"></div></div></div>
      <div class="stack"><div class="card"><div class="card-h"><h2>Held for planned jobs</h2></div>${h.reserved.length ? h.reserved.map((r) => `<a class="between small" href="#/job/${r.wo_id}" style="padding:6px 0;border-top:1px solid var(--line2);text-decoration:none;color:inherit"><span><b>${esc(r.part_no)}</b> ${num(r.qty)} ${esc(r.unit)}<br><span class="tiny muted">${esc(r.store)}</span></span><span class="muted">${esc(r.number)}${r.due_date ? ' · due ' + fdate(r.due_date) : ''}</span></a>`).join('') : '<p class="muted small">Nothing held.</p>'}</div>
        ${h.moves_today.length ? `<div class="card"><div class="card-h"><h2>Today's movements</h2></div>${h.moves_today.map((m) => `<div class="between small" style="padding:5px 0;border-top:1px solid var(--line2)"><span><b>${esc(m.part_no)}</b> ${esc(m.kind)}<br><span class="tiny muted">${esc(m.store)} · ${esc(m.ref || '')} · ${esc(m.by_name || '')}</span></span><b class="${m.qty < 0 ? 'bad' : 'ok'}">${m.qty > 0 ? '+' : ''}${num(m.qty)}</b></div>`).join('')}</div>` : ''}</div></div>`;
    reqList($('#rl', v));
  }

  /* ---------- analysis ---------- */
  async function analysis(v) {
    setTitle('Analysis');
    const t = today(); let from = t.slice(0, 8) + '01', to = t, cid = '';
    v.innerHTML = `<div class="card row"><label class="f">From<input type="date" id="fr" value="${from}"></label><label class="f">To<input type="date" id="to" value="${to}"></label><label class="f">Client<select id="cl">${opt(LK.clients.map((c) => [c.id, c.name]), '', 'All clients')}</select></label>
      <div class="row" style="align-self:end">${[['This month', 0], ['Last month', -1], ['Last 3 months', 90], ['This year', 365]].map(([l, n]) => `<button class="chip" data-p="${n}">${l}</button>`).join('')}<button class="btn" id="pr">${ic('printer', 16)} Monthly report (PDF)</button></div></div><div id="an"><p class="loading">Working it out…</p></div>`;
    let D = null;
    const load = async () => {
      D = await api(`/analysis?from=${from}&to=${to}${cid ? '&client_id=' + cid : ''}`); const S = D.summary;
      const L = D.labour.filter((p) => p.available);
      $('#an', v).innerHTML = `<h2 class="sec">Reliability</h2><div class="kpis">
        <div class="kpi"><span>Breakdowns</span><b>${S.failures}</b><small>Unplanned jobs on machines</small></div><div class="kpi ${S.downtime > 24 ? 'alert' : ''}"><span>Downtime</span><b>${num(S.downtime)} h</b><small>Machines stopped</small></div>
        <div class="kpi"><span>MTBF</span><b>${S.mtbf == null ? '—' : num(S.mtbf, 0) + ' h'}</b><small>Mean time between failures</small></div><div class="kpi"><span>MTTR</span><b>${S.mttr == null ? '—' : num(S.mttr) + ' h'}</b><small>Mean time to repair</small></div>
        <div class="kpi"><span>Planned work</span><b>${pctTxt(S.planned_pct)}</b><small>${S.planned} planned · ${S.unplanned} unplanned</small></div><div class="kpi ${S.pm_compliance != null && S.pm_compliance < 80 ? 'alert' : ''}"><span>PM compliance</span><b>${pctTxt(S.pm_compliance)}</b><small>${S.pm_on_time} of ${S.pm_due} done on time</small></div>
        <div class="kpi ${S.backlog_weeks > 3 ? 'alert' : ''}"><span>Backlog</span><b>${num(S.backlog_weeks)} wk</b><small>${S.open_jobs} open jobs · ${num(S.backlog_hours, 0)} h</small></div>${S.oee != null ? `<div class="kpi"><span>OEE</span><b>${S.oee}%</b><small>Average of operator logs</small></div>` : ''}</div>
        <div class="cols2"><div class="stack">
          <div class="card"><div class="card-h"><h2>Bad actors</h2><span class="muted small">Machines costing the most downtime</span></div>${D.bad_actors.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Machine</th><th class="n">Failures</th><th class="n">Downtime</th><th class="n">MTBF</th><th class="n">MTTR</th><th class="n">Avail.</th><th class="n">Cost</th></tr></thead><tbody>${D.bad_actors.map((a) => `<tr><td><b>${esc(a.tag)}</b> <span class="tiny muted">${esc(a.criticality || '')}</span><br><span class="tiny muted">${esc(a.name)}</span></td><td class="n">${a.failures}</td><td class="n">${num(a.downtime)} h</td><td class="n">${a.mtbf == null ? '—' : num(a.mtbf, 0) + ' h'}</td><td class="n">${a.mttr == null ? '—' : num(a.mttr) + ' h'}</td><td class="n">${a.availability}%</td><td class="n">${money(a.cost).replace(/\.\d\d$/, '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No machine jobs in this period.</p>'}</div>
          <div class="card"><div class="card-h"><h2>Labour utilisation</h2><a class="link small" href="#/labour">Details</a></div><p class="muted small" style="margin-bottom:10px">Hours booked against hours available (${SET.shift_hours || 8} h × ${SET.work_days || 5} days a week). Wrench time = hands-on share of clocked time.</p>
            ${L.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Who</th><th class="n">Available</th><th class="n">Booked</th><th>Utilisation</th><th class="n">Wrench</th><th class="n">Overtime</th><th class="n">Estimates</th></tr></thead><tbody>${L.map((p) => `<tr><td><b>${esc(p.name)}</b><br><span class="tiny muted">${esc(p.trade || '')} · ${p.jobs_done} done</span></td><td class="n">${p.available} h</td><td class="n">${num(p.booked)} h</td><td style="min-width:110px">${meter(p.utilisation)}<span class="tiny">${pctTxt(p.utilisation)}</span></td><td class="n">${pctTxt(p.wrench)}</td><td class="n">${p.overtime ? num(p.overtime) + ' h' : '—'}</td><td class="n">${pctTxt(p.estimate_accuracy)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No working days in this period yet.</p>'}
            ${(() => { const g = {}; L.forEach((p) => { const k = p.trade || 'Other'; g[k] = g[k] || [0, 0]; g[k][0] += p.booked; g[k][1] += p.available; }); const rows = Object.entries(g).map(([k, [b, a]]) => [k, a ? Math.round((b / a) * 100) : 0]); return rows.length ? `<h3 style="margin:12px 0 8px">By trade</h3>${bars(rows, (n) => n + '%')}` : ''; })()}</div>
          <div class="card"><div class="card-h"><h2>Booked vs actual time</h2><span class="muted small">Completed jobs, biggest differences first</span></div>${D.booked_vs_actual.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Job</th><th class="n">Estimate</th><th class="n">Booked</th><th class="n">On the clock</th><th></th></tr></thead><tbody>${D.booked_vs_actual.slice(0, 12).map((j) => `<tr class="click" data-job="${j.id}"><td><span class="mono">${esc(j.number)}</span><br><span class="tiny muted">${esc(j.title)}</span></td><td class="n">${dur(j.est)}</td><td class="n">${dur(j.booked)}</td><td class="n">${dur(j.actual)}</td><td>${j.flag ? '<span class="pill s-on_hold">Check</span>' : j.actual == null ? '<span class="pill">No clock</span>' : '<span class="pill s-approved">OK</span>'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No completed jobs in this period.</p>'}</div>
        </div><div class="stack">
          <div class="card"><h2 style="margin-bottom:10px">Cost</h2><dl class="dl"><div><dt>Total (labour + parts)</dt><dd><b>${money(S.cost)}</b></dd></div><div><dt>Labour</dt><dd>${money(S.labour_cost)}</dd></div><div><dt>Parts and materials</dt><dd>${money(S.parts_cost)}</dd></div><div><dt>Stock on hand</dt><dd>${money(S.stock_value)}${S.low_parts ? ` · <a href="#/stores">${S.low_parts} low</a>` : ''}</dd></div></dl>
            <h3 style="margin:14px 0 8px">By month</h3>${bars(D.by_month.map(([m, n]) => [fdate(m + '-01').slice(2), n]), (n) => money(n).replace(/\.\d\d$/, ''))}<h3 style="margin:14px 0 8px">By client</h3>${bars(D.by_client, (n) => money(n).replace(/\.\d\d$/, ''))}</div>
          <div class="card"><h2 style="margin-bottom:10px">Why machines fail</h2><h3 style="margin-bottom:6px">Component</h3>${bars(D.pareto.component)}<h3 style="margin:12px 0 6px">Cause</h3>${bars(D.pareto.cause)}</div>
          <div class="card"><h2 style="margin-bottom:10px">Spares used</h2>${bars(D.spares.map((s) => [s.part_no + ' · ' + s.name, Math.round(s.value)]), (n) => money(n).replace(/\.\d\d$/, ''))}</div>
          <div class="card"><h2 style="margin-bottom:10px">Condition and TPM</h2><dl class="dl"><div><dt>Condition readings</dt><dd>${S.cm_readings} · <span class="bad">${S.cm_alarms} alarm</span> · ${S.cm_warns} warning</dd></div><div><dt>Operator checks</dt><dd>${S.tpm_checks} · ${S.tpm_issues || 0} problems found</dd></div><div><dt>OEE</dt><dd>${S.oee == null ? '—' : S.oee + '%'}</dd></div></dl></div>
          <div class="card"><h2 style="margin-bottom:10px">Jobs by type</h2>${bars(D.by_type)}</div>
        </div></div>`;
      $$('[data-job]', v).forEach((tr) => tr.onclick = () => { location.hash = '#/job/' + tr.dataset.job; });
    };
    const go = () => { $('#an', v).innerHTML = '<p class="loading">Working it out…</p>'; load().catch((e) => { $('#an', v).innerHTML = `<div class="banner bad">${esc(e.message)}</div>`; }); };
    go();
    $('#fr', v).onchange = (e) => { from = e.target.value; go(); }; $('#to', v).onchange = (e) => { to = e.target.value; go(); }; $('#cl', v).onchange = (e) => { cid = e.target.value; go(); };
    $$('[data-p]', v).forEach((b) => b.onclick = () => { const n = +b.dataset.p; to = t; if (n === 0) from = t.slice(0, 8) + '01'; else if (n === -1) { const d = new Date(t.slice(0, 8) + '01T00:00:00Z'); d.setUTCDate(0); to = d.toISOString().slice(0, 10); from = to.slice(0, 8) + '01'; } else if (n === 365) from = t.slice(0, 5) + '01-01'; else from = dayShift(-n); $('#fr', v).value = from; $('#to', v).value = to; go(); });
    $('#pr', v).onclick = () => { if (D) monthlyReport(D, cid ? (LK.clients.find((c) => String(c.id) === String(cid)) || {}).name : ''); };
  }
  function monthlyReport(D, client) {
    const S = D.summary, m = (n) => money(n).replace(/\.\d\d$/, '');
    const tbl = (head, rows) => `<table><thead><tr>${head.map((h, i) => `<th${i ? ' class="n"' : ''}>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${head.length}" class="muted">Nothing in this period.</td></tr>`}</tbody></table>`;
    printDoc(`Maintenance report ${D.from} to ${D.to}`, `${docHead('Maintenance management report', `${fdate(D.from)} to ${fdate(D.to)}${client ? ' · ' + esc(client) : ''}`)}
      <div class="k"><div><span>Jobs</span><b>${S.jobs}</b></div><div><span>Completed</span><b>${S.completed}</b></div><div><span>Planned work</span><b>${pctTxt(S.planned_pct)}</b></div><div><span>PM compliance</span><b>${pctTxt(S.pm_compliance)}</b></div>
      <div><span>Breakdowns</span><b>${S.failures}</b></div><div><span>Downtime</span><b>${num(S.downtime)} h</b></div><div><span>MTBF / MTTR</span><b>${S.mtbf == null ? '—' : num(S.mtbf, 0)} / ${S.mttr == null ? '—' : num(S.mttr)} h</b></div><div><span>Backlog</span><b>${num(S.backlog_weeks)} weeks</b></div>
      <div><span>Total cost</span><b>${m(S.cost)}</b></div><div><span>Labour</span><b>${m(S.labour_cost)}</b></div><div><span>Parts</span><b>${m(S.parts_cost)}</b></div><div><span>OEE</span><b>${S.oee == null ? '—' : S.oee + '%'}</b></div></div>
      <h2>Bad actors (most downtime)</h2>${tbl(['Machine', 'Failures', 'Downtime h', 'MTBF h', 'MTTR h', 'Availability', 'Cost'], D.bad_actors.map((a) => [`<b>${esc(a.tag)}</b> ${esc(a.name)}`, a.failures, num(a.downtime), a.mtbf == null ? '—' : num(a.mtbf, 0), a.mttr == null ? '—' : num(a.mttr), a.availability + '%', m(a.cost)]))}
      <h2>Why machines failed</h2>${tbl(['Component', 'Breakdowns'], D.pareto.component.map(([k, n]) => [esc(k), n]))}${tbl(['Cause', 'Breakdowns'], D.pareto.cause.map(([k, n]) => [esc(k), n]))}
      <h2>Labour utilisation</h2>${tbl(['Technician', 'Available h', 'Booked h', 'Utilisation', 'Wrench time', 'Overtime h'], D.labour.filter((p) => p.available).map((p) => [`${esc(p.name)} <span class="muted">${esc(p.trade || '')}</span>`, p.available, num(p.booked), pctTxt(p.utilisation), pctTxt(p.wrench), num(p.overtime)]))}
      <h2>Booked vs actual time</h2>${tbl(['Job', 'Estimate', 'Booked', 'On the clock', ''], D.booked_vs_actual.slice(0, 15).map((j) => [`${esc(j.number)} ${esc(j.title)}`, dur(j.est), dur(j.booked), dur(j.actual), j.flag ? '<b class="bad">Check</b>' : '']))}
      <h2>Cost by client</h2>${tbl(['Client', 'Cost'], D.by_client.map(([k, n]) => [esc(k), m(n)]))}
      <h2>Spares used</h2>${tbl(['Part', 'Qty', 'Value'], D.spares.map((s) => [`${esc(s.part_no)} ${esc(s.name)}`, num(s.qty) + ' ' + esc(s.unit), m(s.value)]))}
      <p class="muted" style="margin-top:18px">Generated ${fdate(today())} by ${esc(ME.name)} from the ${esc(SET.short || '')} work order system.</p>`);
  }
  async function labourView(v) {
    setTitle(SUP() ? 'Labour' : 'My hours');
    const t = today(); let from = t.slice(0, 8) + '01', to = t;
    v.innerHTML = `<div class="card row"><label class="f">From<input type="date" id="fr" value="${from}"></label><label class="f">To<input type="date" id="to" value="${to}"></label></div><div id="lb"></div>`;
    const draw = async () => {
      const d = await api(`/labour?from=${from}&to=${to}`);
      const me = d.people[0];
      $('#lb', v).innerHTML = `${!SUP() && me ? `<div class="kpis"><div class="kpi"><span>Hours booked</span><b>${num(me.booked)}</b><small>of ${me.available} h available</small></div><div class="kpi"><span>Utilisation</span><b>${pctTxt(me.utilisation)}</b></div><div class="kpi"><span>Wrench time</span><b>${pctTxt(me.wrench)}</b><small>Hands-on share of clocked time</small></div><div class="kpi"><span>Overtime</span><b>${num(me.overtime)} h</b></div><div class="kpi"><span>Travel / waiting</span><b>${num(me.travel)} / ${num(me.wait)} h</b></div><div class="kpi"><span>Estimates hit</span><b>${pctTxt(me.estimate_accuracy)}</b></div></div><p class="muted small">Only you and your managers see these figures.</p>` : ''}
        ${SUP() ? `<div class="tw"><table><thead><tr><th>Who</th><th class="n">Available</th><th class="n">Booked</th><th>Utilisation</th><th class="n">Hands-on</th><th class="n">Travel</th><th class="n">Waiting</th><th class="n">Wrench</th><th class="n">Overtime</th><th class="n">Estimates</th></tr></thead><tbody>${d.people.map((p) => `<tr><td><b>${esc(p.name)}</b><br><span class="tiny muted">${esc(p.trade || '')}</span></td><td class="n">${p.available}</td><td class="n">${num(p.booked)}</td><td style="min-width:110px">${meter(p.utilisation)}<span class="tiny">${pctTxt(p.utilisation)}</span></td><td class="n">${num(p.work)}</td><td class="n">${num(p.travel)}</td><td class="n">${num(p.wait)}</td><td class="n">${pctTxt(p.wrench)}</td><td class="n">${num(p.overtime)}</td><td class="n">${pctTxt(p.estimate_accuracy)}</td></tr>`).join('')}</tbody></table></div>` : ''}
        <div class="card"><div class="card-h"><h2>Jobs: booked vs on the clock</h2></div>${d.jobs.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Job</th><th class="n">Estimate</th><th class="n">Booked</th><th class="n">On the clock</th><th></th></tr></thead><tbody>${d.jobs.map((j) => `<tr class="click" data-job="${j.id}"><td><span class="mono">${esc(j.number)}</span><br><span class="tiny muted">${esc(j.title)}</span></td><td class="n">${dur(j.est)}</td><td class="n">${dur(j.booked)}</td><td class="n">${dur(j.actual)}</td><td>${j.flag ? '<span class="pill s-on_hold">Check</span>' : j.actual == null ? '<span class="pill">No clock</span>' : '<span class="pill s-approved">OK</span>'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No hours booked in this period.</p>'}<p class="muted small" style="margin-top:8px">Use Start / Stop on each job so the clock time is recorded. Big differences between booked and clocked hours are flagged for the foreman.</p></div>`;
      $$('[data-job]', v).forEach((tr) => tr.onclick = () => { location.hash = '#/job/' + tr.dataset.job; });
    };
    await draw();
    $('#fr', v).onchange = (e) => { from = e.target.value; draw(); }; $('#to', v).onchange = (e) => { to = e.target.value; draw(); };
  }

  /* ---------- condition monitoring ---------- */
  async function cmView(v) {
    setTitle('Condition monitoring');
    const d = await api('/cm'); const K = d.kinds;
    let f = 'all';
    v.innerHTML = `<div class="between"><p class="muted" style="max-width:72ch">Readings taken on the machines. A reading past the alarm limit creates a job automatically; a warning tells the foreman to watch the trend.</p>${SUP() ? `<button class="btn" id="add">${ic('plus', 16)} Measurement point</button>` : ''}</div>
      <div class="kpis"><div class="kpi alert"><span>In alarm</span><b>${d.items.filter((p) => p.last_status === 'alarm').length}</b></div><div class="kpi"><span>Warning</span><b>${d.items.filter((p) => p.last_status === 'warn').length}</b></div><div class="kpi"><span>Reading due</span><b>${d.items.filter((p) => p.overdue).length}</b></div><div class="kpi"><span>Points</span><b>${d.items.length}</b></div></div>
      <div class="chips">${[['all', 'All'], ['bad', 'Alarm and warning'], ['due', 'Reading due']].map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === f}">${l}</button>`).join('')}</div><div id="cl" class="cmgrid"></div>`;
    const draw = () => {
      const l = d.items.filter((p) => f === 'all' || (f === 'bad' ? ['alarm', 'warn'].includes(p.last_status) : p.overdue));
      $('#cl', v).innerHTML = l.map((p) => `<article class="card cm cm-${p.last_status || 'none'}"><div class="between" style="align-items:flex-start"><div><b>${esc(p.tag)}</b> <span class="muted small">${esc(p.asset)}</span><br><span class="small">${esc(p.name)}</span></div>${cmPill(p.last_status)}</div>
        <div class="between" style="align-items:flex-end;margin-top:8px"><div><b style="font-size:24px">${p.last_value != null ? num(p.last_value, 2) : '—'}</b> <span class="muted">${esc(p.unit || '')}</span><br><span class="tiny muted">${p.last_at ? ago(p.last_at) : 'Never read'}${p.warn != null || p.alarm != null ? ` · ${p.direction === 'low' ? 'low' : 'high'} limits ${p.warn ?? '—'} / ${p.alarm ?? '—'}` : ''}</span></div>${spark(p.history.map((h) => h.value), { lines: [p.warn, p.alarm], label: p.name + ' trend' })}</div>
        <form class="row" data-pt="${p.id}" style="margin-top:10px"><input name="value" type="number" step="any" inputmode="decimal" required placeholder="New reading (${esc(p.unit || '')})" style="flex:1;min-width:120px"><button class="btn sm">Save</button>${SUP() ? `<button class="link small" type="button" data-edit="${p.id}">Edit</button>` : ''}</form>
        ${p.due ? `<p class="tiny ${p.overdue ? 'bad' : 'muted'}" style="margin-top:6px">Next reading ${p.overdue ? 'due now' : 'due ' + fdate(p.due)} · every ${p.interval_days} days</p>` : ''}</article>`).join('') || '<p class="empty">Nothing here.</p>';
      $$('form[data-pt]', v).forEach((fm) => fm.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const r = await api('/cm/readings', { point_id: fm.dataset.pt, value: fm.value.value }); toast(r.job ? `ALARM: job ${r.job} created` : r.status === 'warn' ? 'Saved: warning, watch this one' : 'Reading saved', r.status !== 'ok'); route(); }); }));
      $$('[data-edit]', v).forEach((b) => b.onclick = () => pointDlg(d.items.find((p) => String(p.id) === b.dataset.edit)));
    };
    draw();
    $$('[data-f]', v).forEach((b) => b.onclick = () => { f = b.dataset.f; $$('[data-f]', v).forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); });
    const add = $('#add', v); if (add) add.onclick = () => pointDlg(null);
    function pointDlg(p) {
      p = p || { direction: 'high', kind: 'vibration' };
      dlg(`${head(p.id ? 'Edit measurement point' : 'Add a measurement point')}<form class="stack" id="pf"><label class="f">Machine<select name="asset_id" required>${opt(LK.assets.map((a) => [a.id, a.tag + ' · ' + a.name]), p.asset_id, 'Choose…')}</select></label>
        <div class="grid2"><label class="f">What is measured<select name="kind" id="pk">${opt(Object.entries(K).map(([k, x]) => [k, x[0]]), p.kind)}</select></label><label class="f">Name<input name="name" value="${esc(p.name || '')}" placeholder="e.g. Motor DE bearing vibration"></label></div>
        <div class="grid3"><label class="f">Unit<input name="unit" id="pu" value="${esc(p.unit || K[p.kind][1])}"></label><label class="f">Warning at<input name="warn" type="number" step="any" value="${esc(p.warn ?? '')}"></label><label class="f">Alarm at<input name="alarm" type="number" step="any" value="${esc(p.alarm ?? '')}"></label></div>
        <div class="grid2"><label class="f">Bad when the value is<select name="direction">${opt([['high', 'Too high (vibration, temperature, current)'], ['low', 'Too low (insulation, pressure)']], p.direction)}</select></label><label class="f">Read every (days)<input name="interval_days" type="number" min="1" value="${esc(p.interval_days ?? '')}"></label></div>
        <p class="hint">Run hours: choose "Run hours" so readings update the machine's hour meter and running-hour maintenance plans.</p><p class="err" id="pe"></p>
        <div class="acts">${p.id ? '<button class="btn bad" type="button" id="rm">Remove</button>' : ''}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
      (dl) => {
        $('#pk', dl).onchange = (e) => { $('#pu', dl).value = K[e.target.value][1]; };
        $('#pf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/cm/points', { ...formData(e.target), id: p.id }); dl.close(); toast('Saved'); route(); }, $('#pe', dl)); });
        const rm = $('#rm', dl); if (rm) rm.onclick = () => busy(rm, async () => { await api('/cm/points', { id: p.id, remove: true }); dl.close(); route(); });
      }, 'wide');
    }
  }

  /* ---------- TPM ---------- */
  let qrLib = null;
  const loadQR = () => qrLib || (qrLib = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; s.onload = () => res(window.QRCode); s.onerror = () => { qrLib = null; rej(new Error('Could not load the QR code maker. Check the connection.')); }; document.head.appendChild(s); }));
  async function qrDlg(a) {
    const r = await api('/tpm', { asset_id: a.id, qr: true });
    const link = `${location.origin}/tpm.html?t=${r.token}`;
    dlg(`${head('Machine QR code', esc(a.tag + ' · ' + a.name))}<div class="qrwrap"><div id="qr" class="qr"></div><div><p>Stick this on the machine. Operators scan it with their phone camera to do the daily checks, tag a fault or log production (OEE). No login needed.</p><input readonly value="${esc(link)}" aria-label="Link"><div class="row" style="margin-top:10px"><button class="btn" id="pq">${ic('printer', 16)} Print label</button><a class="btn ghost" href="${esc(link)}" target="_blank" rel="noopener">Open page</a><button class="link small" id="nw">New code (old one stops working)</button></div></div></div>`,
    async (dl) => {
      try { const Q = await loadQR(); new Q($('#qr', dl), { text: link, width: 200, height: 200, correctLevel: Q.CorrectLevel.M }); } catch (e) { $('#qr', dl).textContent = e.message; }
      $('#pq', dl).onclick = () => { const img = $('#qr img', dl) || $('#qr canvas', dl); const src = img ? (img.tagName === 'CANVAS' ? img.toDataURL() : img.src) : ''; printDoc('QR ' + a.tag, `<div style="border:2px solid #15171b;border-radius:14px;padding:18px;width:90mm;margin:0 auto;text-align:center"><b style="font-size:13px">${esc(SET.short || '')} · operator checks</b><img src="${src}" alt="" style="width:62mm;height:62mm;display:block;margin:10px auto"><div style="font:700 22px system-ui">${esc(a.tag)}</div><div>${esc(a.name)}</div><p class="muted" style="margin-top:8px">Scan with your phone camera: daily checks, fault tag, production log</p></div>`); };
      $('#nw', dl).onclick = () => busy($('#nw', dl), async () => { await api('/tpm', { asset_id: a.id, qr: true, renew: true }); dl.close(); toast('New code made. Print a new label.'); qrDlg(a); });
    }, 'wide');
  }
  async function tpmView(v) {
    setTitle('TPM & OEE');
    const d = await api('/tpm'); const t = today();
    v.innerHTML = `<p class="muted" style="max-width:75ch">Operators look after their own machines: they scan the QR code on the machine for the daily clean, inspect, lubricate and tighten checks, raise a fault tag (it becomes a work request) and log production for OEE.</p>
      <div class="kpis"><div class="kpi"><span>Checks this week</span><b>${d.assets.reduce((a, x) => a + x.checks_7, 0)}</b></div><div class="kpi"><span>Machines checked today</span><b>${d.assets.filter((a) => a.last_check === t).length}</b><small>of ${d.assets.length}</small></div><div class="kpi ${d.assets.some((a) => a.issues_30) ? 'alert' : ''}"><span>Problems found (30 days)</span><b>${d.assets.reduce((a, x) => a + x.issues_30, 0)}</b></div>
        <div class="kpi"><span>Latest OEE</span><b>${d.oee.length ? (() => { const o = d.oee[0]; const A = (o.planned_min - o.downtime_min) / o.planned_min, P = Math.min(1, o.total_units / Math.max(1e-9, (o.planned_min - o.downtime_min) * o.ideal_rate)), Q = o.total_units ? o.good_units / o.total_units : 0; return Math.round(A * P * Q * 1000) / 10 + '%'; })() : '—'}</b><small>${d.oee.length ? esc(d.oee[0].tag) + ' · ' + fdate(d.oee[0].date) : 'No logs yet'}</small></div></div>
      <div class="tw"><table><thead><tr><th>Machine</th><th>Client / site</th><th class="n">Checks (7 days)</th><th>Last check</th><th class="n">Problems (30 days)</th><th>Run hours</th><th></th></tr></thead><tbody>${d.assets.map((a) => `<tr><td><b>${esc(a.tag)}</b><br><span class="tiny muted">${esc(a.name)}</span></td><td>${esc(a.client)}<br><span class="tiny muted">${esc(a.site)}</span></td><td class="n">${a.checks_7}</td><td>${a.last_check ? (a.last_check === t ? '<span class="pill s-approved">Today</span>' : fdate(a.last_check)) : '<span class="muted">Never</span>'}</td><td class="n">${a.issues_30 || '—'}</td><td>${a.run_hours != null ? num(a.run_hours, 0) + ' h' : '—'}</td><td class="n"><div class="row" style="justify-content:flex-end"><button class="btn sm ghost" data-qr="${a.id}">${ic('tag', 14)} QR code</button><button class="link small" data-items="${a.id}">Checklist</button></div></td></tr>`).join('')}</tbody></table></div>
      <div class="grid2"><div class="card"><h2 style="margin-bottom:10px">Recent operator checks</h2>${d.logs.length ? d.logs.slice(0, 12).map((l) => `<div class="between" style="padding:7px 0;border-top:1px solid var(--line2)"><span><b>${esc(l.tag)}</b> · ${esc(l.operator)} <span class="tiny muted">${esc(l.shift || '')} · ${fdate(l.date)}</span>${l.issues ? `<br><span class="tiny bad">${l.results.filter((r) => !r.ok).map((r) => esc(r.item + (r.note ? ': ' + r.note : ''))).join('; ')}</span>` : ''}</span>${l.issues ? `<span class="pill s-on_hold">${l.issues} problem${l.issues > 1 ? 's' : ''}</span>` : '<span class="pill s-approved">All OK</span>'}</div>`).join('') : '<p class="muted">No checks yet. Print a QR code and stick it on a machine.</p>'}</div>
        <div class="card"><h2 style="margin-bottom:10px">OEE log</h2>${d.oee.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Date</th><th>Machine</th><th class="n">Avail.</th><th class="n">Perf.</th><th class="n">Quality</th><th class="n">OEE</th></tr></thead><tbody>${d.oee.slice(0, 14).map((o) => { const A = (o.planned_min - o.downtime_min) / o.planned_min, P = Math.min(1, o.total_units / Math.max(1e-9, (o.planned_min - o.downtime_min) * o.ideal_rate)), Q = o.total_units ? o.good_units / o.total_units : 0, r = (x) => Math.round(x * 1000) / 10 + '%'; return `<tr><td>${fdate(o.date)}<br><span class="tiny muted">${esc(o.shift || '')}</span></td><td>${esc(o.tag)}</td><td class="n">${r(A)}</td><td class="n">${r(P)}</td><td class="n">${r(Q)}</td><td class="n"><b>${r(A * P * Q)}</b></td></tr>`; }).join('')}</tbody></table></div><p class="tiny muted" style="margin-top:8px">OEE = availability × performance × quality. 85% is world class; 60% is typical.</p>` : '<p class="muted">No production logged yet.</p>'}</div></div>`;
    $$('[data-qr]', v).forEach((b) => b.onclick = () => busy(b, () => qrDlg(d.assets.find((a) => String(a.id) === b.dataset.qr))));
    $$('[data-items]', v).forEach((b) => b.onclick = async () => {
      const a = d.assets.find((x) => String(x.id) === b.dataset.items);
      const cur = a.own_items ? (await api('/public/tpm/' + (await api('/tpm', { asset_id: a.id, qr: true })).token)).items.map((i) => i.item) : (d.defaults[a.discipline] || d.defaults.Mechanical);
      dlg(`${head('Operator checklist', esc(a.tag + ' · ' + a.name))}<form class="stack" id="tf"><label class="f">One check per line<textarea name="items" rows="10">${esc(cur.join('\n'))}</textarea><span class="hint">${a.own_items ? 'Custom list for this machine.' : 'This is the standard list for ' + esc(a.discipline || 'Mechanical') + '. Change it to make a list for this machine.'}</span></label><p class="err" id="te"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save list</button></div></form>`,
      (dl) => $('#tf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const items = e.target.items.value.split('\n').map((x) => x.trim()).filter(Boolean); await api('/tpm', { asset_id: a.id, items }); dl.close(); toast('Checklist saved'); route(); }, $('#te', dl)); }), 'wide');
    });
  }

  /* ---------- projects ---------- */
  const PST = { planning: 'Planning', active: 'Active', on_hold: 'On hold', done: 'Done', cancelled: 'Cancelled' };
  const pst = (s) => `<span class="pill ${s === 'active' ? 's-in_progress' : s === 'done' ? 's-approved' : s === 'on_hold' ? 's-on_hold' : ''}">${PST[s] || s}</span>`;
  async function projectsView(v, id) {
    if (id) return projectView(v, id);
    setTitle('Projects');
    const d = await api('/projects');
    v.innerHTML = `<div class="between"><p class="muted" style="max-width:70ch">${ME.role === 'client' ? 'Your projects with us and how far they are.' : 'Installations, upgrades and shutdowns run as projects: milestones, linked work orders and budget against actual (labour, parts and subcontractors).'}</p>${SUP() ? `<button class="btn" id="add">${ic('plus', 16)} New project</button>` : ''}</div>
      <div class="grid2">${d.items.map((p) => `<a class="card prj" href="#/projects/${p.id}"><div class="between" style="align-items:flex-start"><div><span class="mono muted small">${esc(p.number)}</span><h2>${esc(p.name)}</h2><p class="muted small">${esc(p.client || '')}${p.site ? ' · ' + esc(p.site) : ''}</p></div>${pst(p.status)}</div>
        <div style="margin-top:12px"><div class="between small"><span>Progress</span><b>${p.progress}%</b></div>${meter(p.progress, 101)}</div>
        ${p.budget != null && p.spent != null ? `<div style="margin-top:10px"><div class="between small"><span>Budget used</span><b>${money(p.spent).replace(/\.\d\d$/, '')} of ${money(p.budget).replace(/\.\d\d$/, '')}</b></div>${meter(p.budget_pct, 90)}</div>` : ''}
        <p class="tiny muted" style="margin-top:10px">${p.jobs} job${p.jobs === 1 ? '' : 's'} · ${p.ms_done}/${p.ms_total} milestones${p.end_date ? ' · finish ' + fdate(p.end_date) : ''}</p></a>`).join('') || '<p class="empty">No projects yet.</p>'}</div>`;
    const add = $('#add', v); if (add) add.onclick = () => projectForm(null);
  }
  function projectForm(p) {
    p = p || { status: 'planning' };
    const mgrs = LK.staff.filter((s) => ['manager', 'admin', 'foreman'].includes(s.role));
    dlg(`${head(p.id ? 'Edit project' : 'New project')}<form class="stack" id="pf"><label class="f">Project name<input name="name" value="${esc(p.name || '')}" required placeholder="e.g. Line 3 conveyor installation"></label>
      <div class="grid3"><label class="f">Client<select name="client_id" id="pc" required>${opt(LK.clients.map((c) => [c.id, c.name]), p.client_id, 'Choose…')}</select></label><label class="f">Site<select name="site_id" id="ps"></select></label><label class="f">Project manager<select name="manager_id">${opt(mgrs.map((s) => [s.id, s.name]), p.manager_id || ME.id)}</select></label></div>
      <div class="grid3"><label class="f">Start<input type="date" name="start_date" value="${esc(p.start_date || today())}"></label><label class="f">Finish<input type="date" name="end_date" value="${esc(p.end_date || '')}"></label><label class="f">Budget (${esc(SET.currency || 'USD')})<input name="budget" type="number" step="any" min="0" value="${esc(p.budget ?? '')}"></label></div>
      <div class="grid2"><label class="f">Status<select name="status">${opt(Object.entries(PST), p.status)}</select></label><label class="f">Client order no.<input name="client_ref" value="${esc(p.client_ref || '')}"></label></div>
      <label class="f">Scope<textarea name="description" rows="3">${esc(p.description || '')}</textarea></label><p class="err" id="pe"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
    (dl) => {
      const pc = $('#pc', dl), ps = $('#ps', dl); const fill = () => { ps.innerHTML = opt(LK.sites.filter((s) => s.client_id === Number(pc.value)).map((s) => [s.id, s.name]), p.site_id, '—'); }; pc.onchange = fill; fill();
      $('#pf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const r = await api('/projects', { ...formData(e.target), id: p.id }); dl.close(); toast('Saved'); await refreshLK(); location.hash = '#/projects/' + r.id; route(); }, $('#pe', dl)); });
    }, 'wide');
  }
  async function projectView(v, id) {
    const r = await api('/projects/' + id), p = r.item, cl = ME.role === 'client';
    setTitle(p.number);
    const dates = [p.start_date, p.end_date, ...p.milestones.map((m) => m.due), ...p.wos.map((w) => w.scheduled_date || w.due_date)].filter(Boolean).sort();
    const t0 = dates[0] || today(), t1 = dates[dates.length - 1] || today();
    const span = Math.max(1, (new Date(t1) - new Date(t0)) / 864e5);
    const pos = (d) => Math.min(100, Math.max(0, ((new Date(d) - new Date(t0)) / 864e5 / span) * 100));
    const nowPos = pos(today());
    const timeline = `<div class="tl"><div class="tl-axis"><span>${fdate(t0)}</span><span>${fdate(t1)}</span></div><div class="tl-track">${p.start_date && p.end_date ? `<i class="tl-bar" style="left:${pos(p.start_date)}%;width:${pos(p.end_date) - pos(p.start_date)}%"></i>` : ''}<i class="tl-now" style="left:${nowPos}%" title="Today"></i>
      ${p.milestones.filter((m) => m.due).map((m) => `<span class="tl-ms ${m.done_at ? 'done' : m.due < today() ? 'late' : ''}" style="left:${pos(m.due)}%" title="${esc(m.name)} · ${fdate(m.due)}"></span>`).join('')}</div>
      ${p.wos.filter((w) => w.scheduled_date || w.due_date).map((w) => `<div class="tl-row"><span class="tiny">${esc(w.number)}</span><div class="tl-track sm"><span class="tl-job s-${w.status}" style="left:${pos(w.scheduled_date || w.due_date)}%" title="${esc(w.title)}"></span></div></div>`).join('')}</div>`;
    v.innerHTML = `<div class="jobhead"><a class="link" href="#/projects">${ic('back', 14)} Projects</a><div class="between" style="align-items:flex-start"><div><span class="mono muted">${esc(p.number)}</span><h1>${esc(p.name)}</h1><p class="muted small">${esc(p.client || '')}${p.site ? ' · ' + esc(p.site) : ''}${p.manager ? ' · Project manager ' + esc(p.manager) : ''}</p></div>${pst(p.status)}</div>
      <div class="actions">${SUP() ? `<button class="btn ghost" id="ed">Edit project</button><a class="btn ghost" href="#/new?project=${p.id}">${ic('plus', 16)} Work order</a>` : ''}<button class="btn" id="pr">${ic('printer', 16)} Progress report (PDF)</button></div></div>
      <div class="kpis"><div class="kpi"><span>Progress</span><b>${p.progress}%</b><small>${p.milestones.filter((m) => m.done_at).length}/${p.milestones.length} milestones</small></div><div class="kpi"><span>Work orders</span><b>${p.wos.length}</b><small>${p.wos.filter((w) => ['completed', 'reviewed', 'approved', 'sent', 'closed'].includes(w.status)).length} done</small></div><div class="kpi"><span>Finish</span><b style="font-size:20px">${fdate(p.end_date) || '—'}</b></div>
        ${cl ? '' : `<div class="kpi ${p.budget_pct > 100 ? 'alert' : ''}"><span>Spent</span><b>${money(p.spent).replace(/\.\d\d$/, '')}</b><small>${p.budget != null ? `${p.budget_pct}% of ${money(p.budget).replace(/\.\d\d$/, '')}` : 'No budget set'}</small></div>`}</div>
      <div class="cols2"><div class="stack">
        <div class="card"><h2 style="margin-bottom:10px">Timeline</h2>${timeline}</div>
        <div class="card"><div class="card-h"><h2>Milestones</h2></div>${p.milestones.map((m) => `<div class="ms ${m.done_at ? 'done' : ''}">${SUP() ? `<button class="tick" data-ms="${m.id}" aria-pressed="${!!m.done_at}" aria-label="Done">${m.done_at ? ic('check', 14) : ''}</button>` : `<span class="tick" aria-hidden="true">${m.done_at ? ic('check', 14) : ''}</span>`}<div><b>${esc(m.name)}</b><br><span class="tiny muted">${m.due ? 'Due ' + fdate(m.due) : 'No date'}${m.done_at ? ' · done ' + fdate(m.done_at) : m.due && m.due < today() ? ' · <span class="bad">late</span>' : ''} · weight ${m.weight}</span></div>${SUP() ? `<button class="link" data-rmms="${m.id}" aria-label="Remove">${ic('trash', 15)}</button>` : ''}</div>`).join('') || '<p class="muted small">No milestones yet.</p>'}
          ${SUP() ? `<form class="row" id="mf" style="margin-top:12px"><input name="name" placeholder="New milestone" required style="flex:2;min-width:160px"><input type="date" name="due" style="flex:1;min-width:140px" aria-label="Due"><input name="weight" type="number" min="1" value="1" style="width:70px" aria-label="Weight"><button class="btn ghost">${ic('plus', 16)} Add</button></form>` : ''}</div>
        <div class="card"><div class="card-h"><h2>Work orders</h2></div>${jobList(p.wos, 'No work orders linked yet.')}</div>
      </div><div class="stack">
        ${p.description ? `<div class="card"><h2 style="margin-bottom:8px">Scope</h2><p class="textblock">${esc(p.description)}</p></div>` : ''}
        ${cl ? '' : `<div class="card"><h2 style="margin-bottom:10px">Budget vs actual</h2>${p.budget != null ? `<div class="between small"><span>${money(p.spent)} spent</span><b>${p.budget_left >= 0 ? money(p.budget_left) + ' left' : '<span class="bad">' + money(-p.budget_left) + ' over</span>'}</b></div>${meter(p.budget_pct, 90)}` : ''}
          <dl class="dl" style="margin-top:12px"><div><dt>Labour (${num(p.hours)} h)</dt><dd>${money(p.labour)}</dd></div><div><dt>Parts and materials</dt><dd>${money(p.parts)}</dd></div><div><dt>Subcontractors and other</dt><dd>${money(p.other)}</dd></div><div><dt>Budget</dt><dd>${p.budget != null ? money(p.budget) : '—'}</dd></div></dl>
          <h3 style="margin:14px 0 6px">Other costs</h3>${p.costs.map((c) => `<div class="between small" style="padding:5px 0;border-top:1px solid var(--line2)"><span>${fdate(c.date)} · <b>${esc(c.kind)}</b><br><span class="tiny muted">${esc(c.note || '')}</span></span><span class="row"><b>${money(c.amount)}</b>${SUP() ? `<button class="link" data-rmc="${c.id}" aria-label="Remove">${ic('trash', 14)}</button>` : ''}</span></div>`).join('') || '<p class="muted small">None yet.</p>'}
          ${SUP() ? `<form class="stack" id="cf" style="margin-top:10px"><div class="grid3"><label class="f">Type<select name="kind">${opt(['Subcontractor', 'Equipment hire', 'Transport', 'Materials (bought direct)', 'Other'])}</select></label><label class="f">Amount<input name="amount" type="number" step="any" min="0" required></label><label class="f">Date<input type="date" name="date" value="${today()}"></label></div><label class="f">Note<input name="note" placeholder="Supplier, invoice no."></label><button class="btn ghost">${ic('plus', 16)} Add cost</button></form>` : ''}</div>`}
      </div></div>`;
    const re = () => projectView(v, id);
    const ed = $('#ed', v); if (ed) ed.onclick = () => projectForm(p);
    $$('[data-ms]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/projects/${p.id}/milestone`, { id: b.dataset.ms, done: b.getAttribute('aria-pressed') !== 'true' }); re(); }));
    $$('[data-rmms]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/projects/${p.id}/milestone`, { id: b.dataset.rmms, remove: true }); re(); }));
    $$('[data-rmc]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/projects/${p.id}/cost`, { remove: b.dataset.rmc }); re(); }));
    const mf = $('#mf', v); if (mf) mf.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/projects/${p.id}/milestone`, formData(mf)); re(); }); });
    const cf = $('#cf', v); if (cf) cf.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/projects/${p.id}/cost`, formData(cf)); toast('Cost added'); re(); }); });
    $('#pr', v).onclick = () => printDoc(`${p.number} progress report`, `${docHead('Project progress report', `${esc(p.number)} · ${fdate(today())}`)}
      <h2 style="border:0;font-size:17px;margin-top:14px">${esc(p.name)}</h2><p class="muted">${esc(p.client || '')}${p.site ? ' · ' + esc(p.site) : ''}${p.client_ref ? ' · Your ref. ' + esc(p.client_ref) : ''}</p>
      <div class="k"><div><span>Progress</span><b>${p.progress}%</b></div><div><span>Milestones</span><b>${p.milestones.filter((m) => m.done_at).length} / ${p.milestones.length}</b></div><div><span>Started</span><b style="font-size:14px">${fdate(p.start_date) || '—'}</b></div><div><span>Planned finish</span><b style="font-size:14px">${fdate(p.end_date) || '—'}</b></div></div>
      <div class="bar"><i style="width:${p.progress}%"></i></div>
      ${p.description ? `<h2>Scope</h2><p>${esc(p.description)}</p>` : ''}
      <h2>Milestones</h2><table><thead><tr><th>Milestone</th><th>Due</th><th>Status</th></tr></thead><tbody>${p.milestones.map((m) => `<tr><td>${esc(m.name)}</td><td>${fdate(m.due) || '—'}</td><td>${m.done_at ? `<b class="ok">Done ${fdate(m.done_at)}</b>` : m.due && m.due < today() ? '<b class="bad">Late</b>' : 'Planned'}</td></tr>`).join('')}</tbody></table>
      <h2>Work carried out</h2><table><thead><tr><th>Job</th><th>Title</th><th>Status</th><th>Date</th></tr></thead><tbody>${p.wos.map((w) => `<tr><td>${esc(w.number)}</td><td>${esc(w.title)}</td><td>${esc(LABEL[w.status] || w.status)}</td><td>${fdate(w.completed_at || w.scheduled_date || w.due_date) || '—'}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No jobs yet.</td></tr>'}</tbody></table>
      ${!cl && p.budget != null && BOSS() ? `<h2>Budget (internal)</h2><table><tbody><tr><td>Budget</td><td class="n">${money(p.budget)}</td></tr><tr><td>Labour</td><td class="n">${money(p.labour)}</td></tr><tr><td>Parts and materials</td><td class="n">${money(p.parts)}</td></tr><tr><td>Subcontractors and other</td><td class="n">${money(p.other)}</td></tr><tr><td><b>Spent</b></td><td class="n"><b>${money(p.spent)} (${p.budget_pct}%)</b></td></tr></tbody></table><p class="muted">Remove this page before sending to the client if costs are confidential.</p>` : ''}`);
  }

  /* ---------- offline: queue changes made with no signal ---------- */
  const OUTBOX = 'basa-outbox';
  const QUEUEABLE = /^\/wo\/\d+\/(checklist|time|material|photo|update|test|comment|clock)$/;
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open('basa', 1); r.onupgradeneeded = () => r.result.createObjectStore('q', { keyPath: 'id', autoIncrement: true }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function qAdd(item) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('q', 'readwrite'); tx.objectStore('q').add(item); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
  async function qAll() { const db = await idb(); return new Promise((res) => { const r = db.transaction('q').objectStore('q').getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); }); }
  async function qDel(id) { const db = await idb(); return new Promise((res) => { const tx = db.transaction('q', 'readwrite'); tx.objectStore('q').delete(id); tx.oncomplete = res; tx.onerror = res; }); }
  let flushing = false;
  async function flushOutbox(silent) {
    if (flushing || !navigator.onLine || !('indexedDB' in window)) return;
    flushing = true; let sent = 0, failed = 0;
    try {
      for (const it of await qAll()) {
        try {
          const r = await fetch('/api' + it.path, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(it.body) });
          if (r.ok) { sent++; await qDel(it.id); } else if (r.status >= 400 && r.status < 500 && r.status !== 401) { failed++; await qDel(it.id); const e = await r.json().catch(() => ({})); toast(`A change made offline was not accepted: ${e.error || r.status}`, true); } else break;
        } catch (e) { break; }
      }
    } finally { flushing = false; }
    if (sent && !silent) { toast(`Back online: ${sent} change${sent > 1 ? 's' : ''} sent`); route(); }
    offlineBadge();
  }
  async function offlineBadge() {
    let b = $('#offb'); const n = 'indexedDB' in window ? (await qAll()).length : 0;
    if (navigator.onLine && !n) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.id = 'offb'; b.className = 'offbar'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.innerHTML = `${ic('alert', 15)} ${navigator.onLine ? '' : 'Offline. '}${n ? `${n} change${n > 1 ? 's' : ''} waiting to send` : 'Changes you make on jobs are saved and sent when the signal is back.'}`;
  }
  window.addEventListener('online', () => flushOutbox());
  window.addEventListener('offline', offlineBadge);

  /* ---------- theme ---------- */
  const getTheme = () => { try { return localStorage.getItem('basa-theme') || 'auto'; } catch (e) { return 'auto'; } };
  function applyTheme(t) { const root = document.documentElement; if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t); }
  applyTheme(getTheme());

  /* ---------- push notifications ---------- */
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const pushOK = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const u8 = (b) => { const s = atob((b + '==='.slice((b.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };
  async function swReady() { if (!('serviceWorker' in navigator)) return null; try { await navigator.serviceWorker.register('/sw.js'); return await navigator.serviceWorker.ready; } catch (e) { return null; } }
  async function currentSub() { if (!pushOK()) return null; const r = await swReady(); return r ? r.pushManager.getSubscription() : null; }
  async function enablePush() {
    if (!pushOK()) throw new Error(isIOS() && !standalone() ? 'On iPhone: tap Share, then "Add to Home Screen". Open the app from your home screen and turn alerts on there.' : 'This browser cannot show notifications. Try Chrome, Edge, Firefox or Safari.');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Notifications are blocked for this site. Allow them in your browser or phone settings, then try again.');
    const reg = await swReady(); if (!reg) throw new Error('Could not start notifications in this browser.');
    const { key } = await api('/push/key');
    let sub = await reg.pushManager.getSubscription();
    try { if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8(key) }); }
    catch (e) { if (sub) await sub.unsubscribe(); sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8(key) }); }
    const j = sub.toJSON();
    await api('/push/subscribe', { endpoint: j.endpoint, keys: j.keys, ua: navigator.userAgent.slice(0, 200) });
    ME.notify_push = true;
  }
  async function disablePush() { const sub = await currentSub(); if (sub) { await api('/push/unsubscribe', { endpoint: sub.endpoint }); await sub.unsubscribe(); } }
  async function pushPanel(v) {
    const st = $('#pst', v), bt = $('#pbt', v); if (!st) return;
    const sub = await currentSub().catch(() => null);
    if (!pushOK()) { st.innerHTML = isIOS() && !standalone() ? `${ic('phone', 14)} On iPhone, phone alerts work once the app is on your home screen: tap <b>Share</b> then <b>Add to Home Screen</b>, open it from there and come back to this page.` : 'This browser does not support phone alerts. You will still see alerts inside the app.'; bt.innerHTML = ''; return; }
    if (Notification.permission === 'denied') { st.textContent = 'Notifications are blocked for this site. Allow them in your browser or phone settings.'; bt.innerHTML = ''; return; }
    st.innerHTML = sub ? `<span class="pill s-closed">On</span> Alerts are on for this device.` : 'Alerts are off on this device.';
    bt.innerHTML = sub ? `<button class="btn ghost" type="button" id="ptest">${ic('bell', 16)} Send a test alert</button><button class="link" type="button" id="poff">Turn off on this device</button>` : `<button class="btn" type="button" id="pon">${ic('bell', 16)} Turn on alerts</button>`;
    const on = $('#pon', v), test = $('#ptest', v), off = $('#poff', v);
    if (on) on.onclick = () => busy(on, async () => { await enablePush(); toast('Alerts are on'); pushPanel(v); });
    if (off) off.onclick = () => busy(off, async () => { await disablePush(); toast('Alerts turned off on this device'); pushPanel(v); });
    if (test) test.onclick = () => busy(test, async () => { const r = await api('/push/test', {}); toast(r.sent ? 'Test sent. It should arrive in a few seconds.' : 'The test could not be delivered. Turn alerts off and on again.', !r.sent); });
  }
  async function pushNudge(v) {
    try {
      if (!pushOK() && !(isIOS() && !standalone())) return;
      if (localStorage.getItem('basa_nopush') === '1') return;
      if (pushOK() && (Notification.permission === 'denied' || await currentSub())) return;
    } catch (e) { return; }
    if (!v.isConnected || $('#nudge', v)) return;
    const b = document.createElement('div'); b.className = 'banner info'; b.id = 'nudge'; b.style.marginBottom = '14px';
    b.innerHTML = `${ic('bell')}<span style="flex:1">${pushOK() ? 'Get job alerts, notices and reminders on this phone, even when the app is closed.' : 'On iPhone: tap Share, then "Add to Home Screen" to get job alerts on your phone.'}</span>${pushOK() ? '<button class="btn" type="button" id="nyes" style="padding:6px 12px">Turn on</button>' : ''}<button class="link" type="button" id="nno">Not now</button>`;
    v.prepend(b);
    const y = $('#nyes', b); if (y) y.onclick = () => busy(y, async () => { await enablePush(); b.remove(); toast('Alerts are on'); });
    $('#nno', b).onclick = () => { try { localStorage.setItem('basa_nopush', '1'); } catch (e) { /* private mode */ } b.remove(); };
  }

  /* ---------- notice board, reminders and alert history ---------- */
  const PRI = { Info: 's-sent', Important: 's-on_hold', Urgent: 'p-Urgent' };
  const REP = { none: 'Once', daily: 'Every day', weekdays: 'Every weekday', weekly: 'Every week', monthly: 'Every month' };
  const fwhen = (iso) => { const d = new Date(new Date(iso).getTime() + (Number(SET.tz ?? 120) || 0) * 60000); return isNaN(d) ? '' : d.toLocaleString('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }; // company time
  function audFields(a, own) {
    const sup = SUP();
    const tos = [['me', 'Just me'], ...(sup ? [['staff', 'All staff'], ['tech', 'All technicians'], ['foreman', 'Foremen'], ['manager', 'Managers'], ['stores', 'Stores team'], ['trade', 'One trade team'], ['everyone', 'Everyone (staff and clients)'], ['clients', 'All clients'], ['client', 'One client']] : [])].filter(([k]) => own || k !== 'me');
    return `<div class="grid2"><label class="f">Send to<select name="to" id="ato">${opt(tos, a.to || (own ? 'me' : 'staff'))}</select></label>
      <label class="f" id="atr" hidden>Trade<select name="trade">${opt(LK.disciplines, a.trade || 'Electrical')}</select></label>
      <label class="f" id="acl" hidden>Client<select name="client_id">${opt((LK.clients || []).map((c) => [c.id, c.name]), a.client_id || '')}</select></label></div>`;
  }
  const wireAud = (d) => { const s = $('#ato', d); const f = () => { $('#atr', d).hidden = s.value !== 'trade'; $('#acl', d).hidden = s.value !== 'client'; }; s.onchange = f; f(); };
  async function notices(v, tab) {
    setTitle(ME.role === 'client' ? 'Notices' : 'Notice board');
    const tabs = [['board', 'Notices'], ['reminders', 'Reminders'], ['alerts', 'My alerts']];
    v.innerHTML = `<div class="between"><nav class="tabs" style="flex:1">${tabs.map(([k, l]) => `<a href="#/notices${k === 'board' ? '' : '/' + k}" aria-current="${k === tab ? 'page' : 'false'}">${l}</a>`).join('')}</nav>
      <div class="row">${tab === 'board' && SUP() ? `<button class="btn" id="nn">${ic('mega', 16)} New notice</button>` : ''}${tab === 'reminders' ? `<button class="btn" id="nr">${ic('clock', 16)} New reminder</button>` : ''}</div></div><div id="nl" class="stack" style="margin-top:14px"><p class="loading">Loading…</p></div>`;
    const box = $('#nl', v);
    if (tab === 'alerts') {
      const { items } = await api('/notifications/all');
      box.innerHTML = items.length ? `<div class="card" style="padding:0">${items.map((n) => `<a class="arow" href="${noteLink(n)}">${ic(n.kind === 'notice' ? 'mega' : n.kind === 'reminder' ? 'clock' : n.kind === 'auto' ? 'cal' : 'wrench', 16)}<span>${esc(n.text)}<small>${ago(n.created_at)}</small></span></a>`).join('')}</div>` : '<p class="empty">No alerts yet.</p>';
      return;
    }
    if (tab === 'reminders') { $('#nr', v).onclick = () => reminderDlg({}, () => notices(v, tab)); return drawReminders(box, () => notices(v, tab)); }
    if ($('#nn', v)) $('#nn', v).onclick = () => noticeDlg(() => notices(v, tab));
    const { items } = await api('/notices');
    box.innerHTML = items.length ? items.map((a) => `<article class="card notice${a.priority === 'Urgent' ? ' urgent' : ''}${a.recipient && !a.read_at ? ' new' : ''}" data-id="${a.id}">
        <div class="between" style="align-items:flex-start"><div><div class="row" style="gap:6px;margin-bottom:6px">${a.pinned ? `<span class="pill s-assigned">${ic('pinf', 12)} Pinned</span>` : ''}<span class="pill ${PRI[a.priority]}">${esc(a.priority)}</span>${a.recipient && !a.read_at ? '<span class="pill s-open">New</span>' : ''}</div><h2>${esc(a.title)}</h2></div></div>
        ${a.body ? `<p class="nbody">${esc(a.body)}</p>` : ''}
        <p class="muted small">${esc(a.author || 'System')} · ${ago(a.created_at)} · To ${esc(a.audience_label)}${a.expires ? ' · Until ' + fdate(a.expires) : ''}</p>
        <div class="row">${a.recipient && a.ack_required ? (a.ack_at ? `<span class="pill s-closed">${ic('check', 12)} You acknowledged ${ago(a.ack_at)}</span>` : `<button class="btn" data-ack>${ic('check', 16)} I have read this</button>`) : ''}
        ${a.can_manage && SUP() ? `<button class="chip" data-rc>${a.reads}/${a.recipients} read${a.ack_required ? ` · ${a.acks} acknowledged` : ''}</button><button class="chip" data-pin>${a.pinned ? 'Unpin' : 'Pin to top'}</button>${(a.ack_required ? a.acks : a.reads) < a.recipients ? '<button class="chip" data-rm>Remind the rest</button>' : ''}<button class="chip" data-del>${ic('trash', 14)} Delete</button>` : ''}</div></article>`).join('') : `<p class="empty">No notices yet.${SUP() ? ' Post one to reach your whole team at once.' : ''}</p>`;
    const unread = items.filter((a) => a.recipient && !a.read_at);
    if (unread.length) Promise.all(unread.map((a) => api('/notices/' + a.id, { read: 1 }))).then(pollNotes).catch(() => {});
    $$('article.notice', box).forEach((c) => {
      const id = c.dataset.id, a = items.find((x) => String(x.id) === id), go = (b, body, msg) => busy(b, async () => { const r = await api('/notices/' + id, body); if (msg) toast(typeof msg === 'function' ? msg(r) : msg); notices(v, tab); });
      const q = (s) => $(s, c);
      if (q('[data-ack]')) q('[data-ack]').onclick = (e) => go(e.currentTarget, { ack: 1 }, 'Thank you. Acknowledged.');
      if (q('[data-pin]')) q('[data-pin]').onclick = (e) => go(e.currentTarget, { pinned: !a.pinned });
      if (q('[data-rm]')) q('[data-rm]').onclick = (e) => go(e.currentTarget, { remind: 1 }, (r) => `Reminder sent to ${r.reminded} ${r.reminded === 1 ? 'person' : 'people'}`);
      if (q('[data-del]')) q('[data-del]').onclick = (e) => { if (confirmDel(e.currentTarget)) go(e.currentTarget, { delete: 1 }, 'Notice deleted'); };
      if (q('[data-rc]')) q('[data-rc]').onclick = () => receipts(a);
    });
  }
  const confirmDel = (b) => { if (b.dataset.sure) return true; b.dataset.sure = '1'; b.innerHTML = 'Tap again to delete'; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.innerHTML = `${ic('trash', 14)} Delete`; } }, 4000); return false; };
  async function receipts(a) {
    const { items } = await api('/notices/' + a.id + '/receipts');
    dlg(`${head('Who has read it', esc(a.title))}<div class="stack" style="gap:0">${items.map((r) => `<div class="arow"><span class="av">${esc(initials(r.name))}</span><span><b>${esc(r.name)}</b><small>${ROLE[r.role] || ''}${r.trade ? ' · ' + esc(r.trade) : ''}</small></span>${r.ack_at ? `<span class="pill s-closed">Acknowledged ${ago(r.ack_at)}</span>` : r.read_at ? `<span class="pill s-sent">Read ${ago(r.read_at)}</span>` : '<span class="pill s-requested">Not read</span>'}</div>`).join('')}</div>`);
  }
  function noticeDlg(done) {
    dlg(`${head('New notice', 'Everyone you choose gets it in the app and as a phone alert.')}<form class="stack" id="nf">
      <label class="f">Title<input name="title" maxlength="120" required placeholder="e.g. Site induction on Monday 7:00"></label>
      <label class="f">Message<textarea name="body" rows="5" maxlength="3000" placeholder="Details, times, what people must do"></textarea></label>
      ${audFields({}, false)}
      <div class="grid2"><label class="f">Priority<select name="priority">${opt(['Info', 'Important', 'Urgent'], 'Info')}</select></label><label class="f">Show until (optional)<input type="date" name="expires" min="${today()}"></label></div>
      <label class="check"><input type="checkbox" name="ack"> Ask everyone to tap "I have read this" (for safety notices and new procedures)</label>
      <label class="check"><input type="checkbox" name="pinned"> Pin to the top of the board</label>
      ${SET.sms_on ? '<label class="check"><input type="checkbox" name="sms"> Also send as an SMS text message</label>' : ''}
      <p class="err" id="ne"></p><div class="row"><button class="btn">${ic('send', 16)} Post notice</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      wireAud(d);
      $('#nf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); ['ack', 'pinned', 'sms'].forEach((k) => { x[k] = !!x[k]; }); busy(e.submitter, async () => { const r = await api('/notices', x); d.close(); toast(`Notice sent to ${r.recipients} ${r.recipients === 1 ? 'person' : 'people'}`); done(); }, $('#ne', d)); });
    });
  }
  function localParts(iso, tz) { const d = new Date(new Date(iso).getTime() + (Number(tz) || 0) * 60000).toISOString(); return [d.slice(0, 10), d.slice(11, 16)]; }
  async function drawReminders(box, redraw) {
    const { items, tz } = await api('/reminders');
    box.innerHTML = `<p class="muted small">Reminders arrive as a phone alert and in the app at the time you set${SUP() ? ', for you or for a whole group' : ''}. Job reminders (scheduled today, due tomorrow, overdue, waiting for review or approval, reports not signed, tags due) are sent automatically every morning.</p>` +
      (items.length ? items.map((r) => `<article class="card rem${r.active ? '' : ' off'}" data-id="${r.id}"><div class="between" style="align-items:flex-start"><div><h2>${esc(r.title)}</h2>${r.body ? `<p class="nbody">${esc(r.body)}</p>` : ''}
        <p class="muted small">${ic('clock', 13)} ${r.active ? 'Next: ' + fwhen(r.next_at) : 'Finished' + (r.last_sent ? ', last sent ' + fwhen(r.last_sent) : '')} · ${REP[r.repeat]} · To ${esc(r.audience_label)}${r.sms ? ' · SMS too' : ''}${r.created_by !== ME.id ? ' · by ' + esc(r.author || '') : ''}</p></div></div>
        <div class="row"><button class="chip" data-ed>Edit</button>${r.repeat !== 'none' || r.active ? `<button class="chip" data-tg>${r.active ? 'Pause' : 'Resume'}</button>` : ''}<button class="chip" data-del>${ic('trash', 14)} Delete</button></div></article>`).join('') : '<p class="empty">No reminders yet.</p>');
    $$('article.rem', box).forEach((c) => {
      const r = items.find((x) => String(x.id) === c.dataset.id);
      $('[data-ed]', c).onclick = () => { const [date, time] = localParts(r.next_at, tz); reminderDlg({ ...r, ...JSON.parse(r.audience || '{}'), date, time }, redraw); };
      if ($('[data-tg]', c)) $('[data-tg]', c).onclick = (e) => busy(e.currentTarget, async () => { await api('/reminders', { id: r.id, active: !r.active }); redraw(); });
      $('[data-del]', c).onclick = (e) => { if (confirmDel(e.currentTarget)) busy(e.currentTarget, async () => { await api('/reminders', { id: r.id, delete: 1 }); toast('Reminder deleted'); redraw(); }); };
    });
  }
  function reminderDlg(r, done) {
    const t = new Date(Date.now() + 3600e3); const dd = r.date || today(), tt = r.time || `${String(t.getHours()).padStart(2, '0')}:00`;
    dlg(`${head(r.id ? 'Edit reminder' : 'New reminder', 'Times are in company time (' + esc(SET.tz_label || 'Harare') + ').')}<form class="stack" id="rf">
      <label class="f">Remind about<input name="title" maxlength="120" required value="${esc(r.title || '')}" placeholder="e.g. Submit weekly timesheets"></label>
      <label class="f">Details (optional)<textarea name="body" rows="3" maxlength="1000">${esc(r.body || '')}</textarea></label>
      <div class="grid3"><label class="f">Date<input type="date" name="date" required value="${dd}"></label><label class="f">Time<input type="time" name="time" required value="${tt}"></label><label class="f">Repeat<select name="repeat">${opt(Object.entries(REP), r.repeat || 'none')}</select></label></div>
      ${audFields(r, true)}
      ${SUP() && SET.sms_on ? `<label class="check"><input type="checkbox" name="sms" ${r.sms ? 'checked' : ''}> Also send as an SMS text message</label>` : ''}
      <p class="err" id="re"></p><div class="row"><button class="btn">${ic('check', 16)} Save reminder</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      wireAud(d);
      $('#rf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.sms = !!x.sms; if (r.id) x.id = r.id; busy(e.submitter, async () => { const res = await api('/reminders', x); d.close(); toast('Reminder set for ' + fwhen(res.next_at)); done(); }, $('#re', d)); });
    });
  }

  /* ---------- start ---------- */
  async function start() {
    const r = await api('/me');
    SET = r.settings; ME = r.user; brand();
    if (!ME) return login();
    if (ME.must_change) return mustChange();
    await refreshLK();
    shell();
    swReady();
    route();
    flushOutbox(true); offlineBadge();
  }
  window.addEventListener('hashchange', route);
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', (e) => {
    const m = e.data || {};
    if (m.type === 'go' && m.url) { const u = new URL(m.url); if (u.hash) location.hash = u.hash; }
    if (m.type === 'push' && ME) { liveAlert(m.d || {}); pollNotes(); }
  });
  start().catch((e) => { document.body.innerHTML = `<p style="padding:30px;font-family:system-ui">Could not load: ${esc(e.message)}</p>`; });
})();
