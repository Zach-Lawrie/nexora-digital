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
  const ROLE = { admin: 'Administrator', manager: 'Manager', foreman: 'Foreman', tech: 'Technician', client: 'Client' };
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
    try { r = await fetch('/api' + path, opt); } catch (e) { throw new Error('No connection. Check your internet and try again.'); }
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
    document.documentElement.style.setProperty('--brand', /^#[0-9a-f]{6}$/i.test(SET.color || '') ? SET.color : '#d9822b');
    document.title = (SET.short || 'Basa') + ' · Work orders';
  }
  const logoHTML = (cls) => SET.logo ? `<img src="${esc(SET.logo)}" alt="${esc(SET.short || '')} logo" class="${cls || ''}">` : `<span class="mark">${esc(initials(SET.short || 'B'))}</span>`;

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
  async function logout() { try { await api('/auth/logout', {}); } catch (e) { /* ignore */ } ME = null; location.hash = ''; login(); }

  /* ---------- shell ---------- */
  function navItems() {
    const r = ME.role;
    if (r === 'client') return [['#/', 'home', 'My jobs'], ['#/new', 'plus', 'Request work'], ['#/assets', 'tag', 'Equipment'], ['#/register', 'shield', 'Tagged items'], ['#/account', 'user', 'Account']];
    if (r === 'tech') return [['#/', 'home', 'My jobs'], ['#/jobs', 'list', 'Job history'], ['#/register', 'shield', 'Test & tag'], ['#/account', 'user', 'Account']];
    const n = [['#/', 'home', 'Dashboard'], ['#/jobs', 'list', 'Work orders'], ['#/board', 'board', 'Board'], ['#/new', 'plus', 'New work order'], ['#/assets', 'tag', 'Assets'], ['#/pm', 'cal', 'Maintenance plans'], ['#/register', 'shield', 'Test & tag register'], ['#/clients', 'building', 'Clients & sites'], ['#/reports', 'chart', 'Reports']];
    if (BOSS()) n.push(['#/users', 'users', 'People & logins'], ['#/settings', 'gear', 'Settings']);
    n.push(['#/account', 'user', 'My account']);
    return n;
  }
  function shell() {
    const items = navItems();
    const tab = ME.role === 'client' ? [items[0], items[1], items[2], items[3], items[4]] : ME.role === 'tech' ? items : [items[0], items[1], items[3], items[4], ['#/more', 'gear', 'More']];
    document.body.innerHTML = `<div class="app">
      <aside class="side"><div class="brand">${logoHTML()}<div><b>${esc(SET.short || 'Basa')}</b><span>Work orders</span></div></div>
        <nav class="nav" aria-label="Main">${items.map(([h, i, l]) => `<a href="${h}">${ic(i)}<span>${l}</span></a>`).join('')}</nav>
        <div class="me"><div class="who"><span class="av">${esc(initials(ME.name))}</span><div><b>${esc(ME.name)}</b><small>${ROLE[ME.role]}${ME.trade && ME.trade !== 'Multi' ? ' · ' + esc(ME.trade) : ''}</small></div></div>
        <button id="so">${ic('out', 16)} Sign out</button><p class="credit">Basa by Nexora Digital</p></div></aside>
      <div class="main"><header class="topbar"><div><div class="crumb">${esc(SET.short || 'Basa')} work orders</div><h1 id="ttl"></h1></div>
        <div class="row" style="position:relative"><button class="iconbtn" id="bell" aria-label="Notifications">${ic('bell')}<span class="dotn" id="bn" hidden></span></button>
        <button class="iconbtn mobile-only" id="so2" aria-label="Sign out">${ic('out')}</button><div class="menu" id="nm" hidden></div></div></header>
        <main class="view" id="v" tabindex="-1"></main></div>
      <nav class="tabbar" aria-label="Main">${tab.map(([h, i, l]) => `<a href="${h}">${ic(i, 20)}<span>${l}</span></a>`).join('')}</nav></div>`;
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
  async function pollNotes() {
    try { NOTE = await api('/notifications'); const b = $('#bn'); if (b) { b.hidden = !NOTE.unread; b.textContent = NOTE.unread > 9 ? '9+' : NOTE.unread; } } catch (e) { /* offline */ }
    clearTimeout(pollNotes.t); pollNotes.t = setTimeout(pollNotes, 60000);
  }
  async function toggleNotes() {
    const m = $('#nm'); if (!m.hidden) { m.hidden = true; return; }
    await pollNotes();
    m.innerHTML = NOTE.items.length ? NOTE.items.map((n) => `<a href="#/job/${n.wo_id}" class="${n.read ? '' : 'unread'}">${esc(n.text)}<small>${ago(n.created_at)}</small></a>`).join('') : '<p class="empty">No notifications yet.</p>';
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
    const v = $('#v'); if (!v) return;
    v.innerHTML = '<p class="loading">Loading…</p>';
    window.scrollTo(0, 0);
    try {
      if (!parts.length) await (ME.role === 'client' ? clientHome(v) : ME.role === 'tech' ? techHome(v) : dashboard(v));
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
      else if (parts[0] === 'more') more(v);
      else v.innerHTML = '<p class="empty">Page not found.</p>';
    } catch (e) { v.innerHTML = `<div class="banner bad">${ic('alert')}<span>${esc(e.message)}</span></div>`; }
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
        <div class="kpi"><span>Hours this month</span><b>${Number(d.hours_month).toLocaleString()}</b><small>Logged by the team</small></div>
        <div class="kpi"><span>Work value this month</span><b>${money(d.value_month).replace(/\.00$/, '')}</b><small>Labour + materials, ex VAT</small></div>
      </div>
      <div class="cols2"><div class="stack">
        ${act.length ? act.map(([l, list]) => `<div class="card"><div class="card-h"><h2>${l} <span class="muted">(${list.length})</span></h2></div>${jobList(list.slice(0, 6))}</div>`).join('') : `<div class="banner ok">${ic('check')}<span>Nothing is waiting for you right now.</span></div>`}
        <div class="card"><div class="card-h"><h2>Recently updated</h2><a class="link" href="#/jobs">All work orders</a></div>${jobList(W.slice(0, 5))}</div>
      </div><div class="stack">
        <div class="card"><div class="card-h"><h2>Technician workload</h2></div><div class="workload">${d.workload.map((x) => `<div class="wl"><span><b>${esc(x.name)}</b><br><span class="tiny muted">${esc(x.trade || '')} · ${x.hours} h this month</span></span><span class="bt"><i style="width:${(x.jobs / wmx) * 100}%"></i></span><b>${x.jobs}</b></div>`).join('') || '<p class="muted">No technicians yet.</p>'}</div></div>
        <div class="card"><div class="card-h"><h2>Active jobs by discipline</h2></div><div class="workload">${disc.map(([l, n]) => `<div class="wl"><span>${dp(l)}</span><span class="bt"><i style="width:${(n / mx) * 100}%"></i></span><b>${n}</b></div>`).join('')}</div></div>
        <div class="card"><div class="card-h"><h2>Planned maintenance</h2><a class="link" href="#/pm">Plans</a></div>${d.pm_due.length ? `<div class="tw" style="box-shadow:none"><table><tbody>${d.pm_due.map((p) => `<tr><td><b>${esc(p.title)}</b><br><span class="tiny muted">${esc(p.tag)} · every ${p.every_days} days</span></td><td class="n" style="${p.next_due < t ? 'color:var(--bad);font-weight:700' : ''}">${fdate(p.next_due)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No plans yet.</p>'}</div>
      </div></div>`;
  }
  async function techHome(v) {
    setTitle('My jobs');
    const d = await api('/dashboard'); const W = d.wo;
    const now = W.filter((w) => ['in_progress', 'assigned', 'on_hold'].includes(w.status)).sort((a, b) => (a.status === 'in_progress' ? -1 : 0) - (b.status === 'in_progress' ? -1 : 0) || String(a.scheduled_date || '9').localeCompare(String(b.scheduled_date || '9')));
    const sub = W.filter((w) => ['completed', 'reviewed'].includes(w.status));
    v.innerHTML = `<div><h2>Hi ${esc(ME.name.split(' ')[0])}</h2><p class="muted">${fdate(d.today)} · ${Number(d.hours_month)} hours logged this month</p></div>
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
      <label class="f">Describe the problem or the work<textarea name="description" rows="4" placeholder="What is happening, where, since when, any error codes, access or safety notes"></textarea></label>
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
    $('#nf', v).addEventListener('submit', (e) => {
      e.preventDefault();
      const d = formData(e.target);
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
        if (BOSS() && ['completed', 'reviewed'].includes(st)) A.push(['approved', 'Approve job', 'ok']);
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
    if (ME.role === 'client' && st === 'sent') banner = `<div class="banner info">${ic('file')}<span>Your report is ready. Read it, then sign off to confirm the work.</span></div>`;
    v.innerHTML = `<div class="jobhead"><a class="link" href="#/${ME.role === 'tech' || ME.role === 'client' ? '' : 'jobs'}">${ic('back', 14)} Back</a>
        <div class="between" style="align-items:flex-start"><div><span class="mono muted">${esc(w.number)}</span><h1>${esc(w.title)}</h1>
        <div class="row" style="margin-top:6px">${sp(st)}${pp(w.priority)}${dp(w.discipline)}<span class="pill">${esc(w.type)}</span></div></div></div>
        ${stepper(w)}${banner}
        <div class="actions">${A.map(([k, l, c]) => `<button class="btn ${c}" data-a="${k}">${l}</button>`).join('')}</div></div>
      <nav class="tabs">${tabs.map(([k, l]) => `<a href="#/job/${w.id}/${k}" aria-current="${k === tab ? 'page' : 'false'}">${l}</a>`).join('')}</nav>
      <div id="tab"></div>`;
    $$('[data-a]', v).forEach((b) => b.onclick = () => action(b.dataset.a, d, b));
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
        ${w.approver ? `<div><dt>Approved by</dt><dd>${esc(w.approver)} · ${fdate(w.approved_at)}</dd></div>` : ''}
      </dl></div>
      ${ME.role !== 'client' ? `<div class="card"><h3>Team</h3><p>${esc([w.lead, ...d.team.map((t) => t.name)].filter(Boolean).join(', ') || 'No one yet')}</p></div>` : ''}
      </div></div>`;
    const f = $('#wf', T);
    if (f) f.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const x = formData(f); await api(`/wo/${w.id}/update`, x); Object.assign(w, x); $('#ws', T).textContent = 'Saved ' + new Date().toLocaleTimeString().slice(0, 5); toast('Notes saved'); }); });
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
      </div></div>
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
  function tabMaterials(T, d, can, reload, total) {
    const w = d.wo;
    T.innerHTML = `<div class="card"><div class="card-h"><h2>Materials and parts used</h2><b>${money(total)}</b></div>
      ${d.materials.length ? `<div class="tw" style="box-shadow:none"><table><thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Unit cost</th><th class="n">Total</th><th></th></tr></thead><tbody>${d.materials.map((m) => `<tr><td>${esc(m.item)}</td><td class="n">${m.qty} ${esc(m.unit || '')}</td><td class="n">${money(m.unit_cost)}</td><td class="n">${money(m.qty * m.unit_cost)}</td><td class="n">${can.work ? `<button class="link" data-rmm="${m.id}" aria-label="Remove">${ic('trash', 16)}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nothing recorded yet.</p>'}
      ${can.work ? `<form class="stack" id="mf" style="margin-top:14px"><label class="f">Item or part<input name="item" required placeholder="e.g. Contactor 40 A 230 V coil"></label><div class="grid3"><label class="f">Quantity<input name="qty" type="number" step="any" min="0" required></label><label class="f">Unit<select name="unit">${opt(['each', 'm', 'kg', 'L', 'box', 'set', 'roll'])}</select></label><label class="f">Unit cost <span class="hint">(${esc(SET.currency || 'USD')})</span><input name="unit_cost" type="number" step="any" min="0"></label></div><button class="btn ghost">${ic('box', 16)} Add material</button><p class="err" id="me"></p></form>` : ''}</div>`;
    const mf = $('#mf', T);
    if (mf) mf.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/wo/${w.id}/material`, formData(mf)); toast('Material added'); reload(); }, $('#me', T)); });
    $$('[data-rmm]', T).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/wo/${w.id}/material`, { remove: b.dataset.rmm }); reload(); }));
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
    if (k === 'hold') return reasonDlg('Put on hold', 'The foreman will be notified.', 'Why? (e.g. waiting for parts, no access, shutdown needed)', 'on_hold', 'Job put on hold');
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
        <div class="grid2"><label class="f">Quote<input name="quote" type="number" step="any" value="${esc(w.quote ?? '')}"></label><label class="f">Client ref.<input name="client_ref" value="${esc(w.client_ref || '')}"></label></div>
        <p class="err" id="ee"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
      (dl) => $('#ef', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/wo/${id}/update`, formData(e.target)); dl.close(); toast('Saved'); reload(); }, $('#ee', dl)); }), 'wide');
    }
    if (k === 'submit') {
      const blank = d.checklist.filter((c) => !c.result).length, failNoNote = d.checklist.filter((c) => c.result === 'Fail' && !c.note).length;
      const emptySheets = d.sheets.filter((k) => !d.tests.some((t) => t.sheet === k)).map((k) => `Test sheet "${d.sheet_defs[k].title}" has no results`); const failNoRemark = d.tests.filter((t) => t.result === 'Fail' && !t.remarks).length;
      const issues = [...emptySheets, failNoRemark && `${failNoRemark} failed test line${failNoRemark > 1 ? 's' : ''} without a remark`, blank && `${blank} checklist item${blank > 1 ? 's' : ''} not answered`, failNoNote && `${failNoNote} failed check${failNoNote > 1 ? 's' : ''} without a note`, !d.time.length && 'No hours logged', !(w.work_done || '').trim() && '"Work done" is empty (Details tab)'].filter(Boolean);
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
      dlg(`${head(esc(a.tag + ' · ' + a.name), esc(a.client + ' · ' + a.site))}<dl class="dl"><div><dt>Discipline</dt><dd>${esc(a.discipline)}</dd></div><div><dt>Make / model</dt><dd>${esc([a.make, a.model].filter(Boolean).join(' ') || '—')}</dd></div><div><dt>Serial</dt><dd>${esc(a.serial || '—')}</dd></div><div><dt>Rating</dt><dd>${esc(a.rating || '—')}</dd></div><div><dt>Criticality</dt><dd>${esc(a.criticality)}</dd></div><div><dt>Next planned job</dt><dd>${fdate(a.next_pm) || '—'}</dd></div></dl>
        <h3>Job history (${hist.length})</h3>${jobList(hist.slice(0, 10), 'No jobs on this equipment yet.')}
        <div class="acts">${SUP() ? '<button class="btn ghost" id="ed">Edit</button>' : ''}<a class="btn" href="#/new/${a.id}">${ic('plus', 16)} ${ME.role === 'client' ? 'Request work' : 'New work order'}</a></div>`,
      (dl) => { $$('a', dl).forEach((x) => x.addEventListener('click', () => dl.close())); const e = $('#ed', dl); if (e) e.onclick = () => { dl.close(); assetForm(a); }; }, 'wide');
    }
    function assetForm(a) {
      a = a || {};
      dlg(`${head(a.id ? 'Edit asset' : 'Add asset')}<form class="stack" id="af"><div class="grid2"><label class="f">Tag<input name="tag" value="${esc(a.tag || '')}" required placeholder="e.g. PMP-04"></label><label class="f">Name<input name="name" value="${esc(a.name || '')}" required></label></div>
        <label class="f">Site<select name="site_id" required>${opt(LK.sites.map((s) => [s.id, `${(LK.clients.find((c) => c.id === s.client_id) || {}).name} · ${s.name}`]), a.site_id, 'Choose…')}</select></label>
        <div class="grid3"><label class="f">Discipline<select name="discipline">${opt(LK.disciplines, a.discipline || 'Electrical')}</select></label><label class="f">Criticality<select name="criticality">${opt([['A', 'A · stops production'], ['B', 'B · slows production'], ['C', 'C · can wait']], a.criticality || 'B')}</select></label><label class="f">Rating<input name="rating" value="${esc(a.rating || '')}" placeholder="kW, V, A, range"></label></div>
        <div class="grid3"><label class="f">Make<input name="make" value="${esc(a.make || '')}"></label><label class="f">Model<input name="model" value="${esc(a.model || '')}"></label><label class="f">Serial no.<input name="serial" value="${esc(a.serial || '')}"></label></div>
        <label class="f">Notes<input name="notes" value="${esc(a.notes || '')}"></label><p class="err" id="ae"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`,
      (dl) => $('#af', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/assets', { ...formData(e.target), id: a.id }); dl.close(); toast('Saved'); route(); }, $('#ae', dl)); }), 'wide');
    }
  }

  /* ---------- PM plans ---------- */
  async function pm(v) {
    setTitle('Maintenance plans');
    await refreshLK();
    const items = (await api('/pm')).items; const t = today();
    v.innerHTML = `<div class="between"><p class="muted" style="max-width:70ch">Planned jobs are created automatically up to 7 days before they are due, assigned to the plan's foreman, and the next date moves on.</p><div class="row"><button class="btn ghost" id="gen">${ic('refresh', 16)} Create due jobs now</button><button class="btn" id="add">${ic('plus', 16)} Add plan</button></div></div>
      ${items.length ? `<div class="tw"><table><thead><tr><th>Plan</th><th>Asset</th><th>Type</th><th class="n">Every</th><th>Next due</th><th>Foreman</th><th></th></tr></thead><tbody>${items.map((p) => `<tr class="click" data-id="${p.id}"><td><b>${esc(p.title)}</b><br>${dp(p.discipline)}</td><td>${esc(p.tag)} · ${esc(p.asset)}<br><span class="tiny muted">${esc(p.client)} · ${esc(p.site)}</span></td><td>${esc(p.type)}</td><td class="n">${p.every_days} days</td><td style="${p.next_due < t ? 'color:var(--bad);font-weight:700' : ''}">${fdate(p.next_due)}</td><td>${esc(p.foreman || '—')}</td><td>${p.active ? '<span class="pill s-approved">Active</span>' : '<span class="pill">Paused</span>'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No maintenance plans yet.</p>'}`;
    $('#gen', v).onclick = (e) => busy(e.currentTarget, async () => { const r = await api('/pm', { generate: true }); toast(r.created.length ? `${r.created.length} job${r.created.length > 1 ? 's' : ''} created: ${r.created.join(', ')}` : 'Nothing is due in the next 7 days'); route(); });
    $('#add', v).onclick = () => form(null);
    $$('tr[data-id]', v).forEach((tr) => tr.onclick = () => form(items.find((p) => String(p.id) === tr.dataset.id)));
    function form(p) {
      p = p || { active: 1 };
      const foremen = LK.staff.filter((s) => ['foreman', 'manager', 'admin'].includes(s.role));
      dlg(`${head(p.id ? 'Edit plan' : 'Add maintenance plan')}<form class="stack" id="pf"><label class="f">What is the planned job?<input name="title" value="${esc(p.title || '')}" required placeholder="e.g. Monthly motor inspection"></label>
        <label class="f">Asset<select name="asset_id" required>${opt(LK.assets.map((a) => [a.id, a.tag + ' · ' + a.name]), p.asset_id, 'Choose…')}</select></label>
        <div class="grid2"><label class="f">Discipline<select name="discipline">${opt(LK.disciplines, p.discipline || 'Electrical')}</select></label><label class="f">Type<select name="type">${typeOpts(p.type || 'Preventive maintenance')}</select></label></div>
        <div class="grid3"><label class="f">Every (days)<input name="every_days" type="number" min="1" value="${esc(p.every_days || 30)}" required></label><label class="f">Next due<input name="next_due" type="date" value="${esc(p.next_due || today())}" required></label><label class="f">Est. hours<input name="est_hours" type="number" step="0.5" value="${esc(p.est_hours ?? '')}"></label></div>
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
      <div class="stack">${d.items.map((c) => `<div class="card"><div class="card-h"><div><h2>${esc(c.name)}</h2><p class="muted small">${esc([c.contact, c.phone, c.email].filter(Boolean).join(' · '))}</p></div><div class="row"><span class="pill">${c.open_jobs} open job${c.open_jobs === 1 ? '' : 's'}</span><span class="pill">${c.logins} login${c.logins === 1 ? '' : 's'}</span>${BOSS() ? `<button class="btn ghost sm" data-ec="${c.id}">Edit</button>` : ''}<button class="btn ghost sm" data-as="${c.id}">${ic('plus', 14)} Site</button></div></div>
        ${d.sites.filter((s) => s.client_id === c.id).map((s) => `<div class="between" style="padding:8px 0;border-top:1px solid var(--line2)"><span>${ic('pin', 14)} <b>${esc(s.name)}</b> <span class="muted small">${esc(s.address || '')}</span></span><span class="row"><span class="tiny muted">${s.assets} assets</span><button class="link" data-es="${s.id}">Edit</button></span></div>`).join('') || '<p class="muted small">No sites yet.</p>'}</div>`).join('') || '<p class="empty">No clients yet.</p>'}</div>`;
    const cform = (c) => { c = c || {}; dlg(`${head(c.id ? 'Edit client' : 'Add client')}<form class="stack" id="cf"><label class="f">Company name<input name="name" value="${esc(c.name || '')}" required></label><div class="grid2"><label class="f">Contact person<input name="contact" value="${esc(c.contact || '')}"></label><label class="f">Phone<input name="phone" value="${esc(c.phone || '')}"></label></div><label class="f">Email<input name="email" type="email" value="${esc(c.email || '')}"></label><label class="f">Address<input name="address" value="${esc(c.address || '')}"></label><label class="f">Notes<textarea name="notes" rows="2">${esc(c.notes || '')}</textarea></label><p class="err" id="ce"></p><div class="acts"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">Save</button></div></form>`, (dl) => $('#cf', dl).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/clients', { ...formData(e.target), id: c.id }); dl.close(); toast('Saved'); route(); }, $('#ce', dl)); })); };
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
        <div class="grid3"><label class="f">Role<select name="role" id="rl">${opt(Object.entries(ROLE).filter(([k]) => k !== 'admin' || ME.role === 'admin'), u.role)}</select></label><label class="f" id="tr">Trade<select name="trade">${opt(['Electrical', 'Mechanical', 'Automation', 'Instrumentation', 'Multi'], u.trade || 'Electrical')}</select></label><label class="f" id="cl">Client company<select name="client_id">${opt(LK.clients.map((c) => [c.id, c.name]), u.client_id, 'Choose…')}</select></label><label class="f">Phone<input name="phone" value="${esc(u.phone || '')}"></label></div>
        ${isNew ? '' : `<label class="f">Status<select name="status">${opt([['active', 'Active'], ['disabled', 'Switched off']], u.status)}</select></label>`}
        <p class="err" id="ue"></p><div class="acts">${isNew ? '' : '<button class="btn ghost" type="button" id="rs">Reset password</button>'}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn">${isNew ? 'Create login' : 'Save'}</button></div></form>`,
      (dl) => {
        const sync = () => { const c = $('#rl', dl).value === 'client'; $('#tr', dl).hidden = c; $('#cl', dl).hidden = !c; }; $('#rl', dl).onchange = sync; sync();
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
        <div class="card"><h2>Download for Excel</h2><p class="muted small" style="margin:4px 0 12px">CSV files open in Excel and Google Sheets. Use them for invoicing, payroll and monthly client reports.</p><div class="row"><a class="btn ghost" href="/api/export/workorders?${q}">${ic('download', 16)} Work orders with value</a><a class="btn ghost" href="/api/export/timesheets?${q}">${ic('download', 16)} Timesheets</a><a class="btn ghost" href="/api/export/materials?${q}">${ic('download', 16)} Materials used</a><a class="btn ghost" href="/api/export/tests?${q}">${ic('download', 16)} Test results</a></div></div>
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
      <p class="err" id="se"></p><div class="row"><button class="btn">Save settings</button></div></form>`;
    let logo = null;
    $('#lg', v).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { logo = await resizeImage(f, 500, 'image/png'); toast('Logo ready. Press Save.'); } catch (er) { toast(er.message, true); } };
    $('#sf', v).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.report_costs = x.report_costs ? '1' : '0'; if (logo) x.logo = logo; busy(e.submitter, async () => { await api('/settings', x); SET = (await api('/me')).settings; brand(); toast('Settings saved'); shell(); route(); }, $('#se', v)); });
  }
  async function account(v) {
    setTitle('My account');
    v.innerHTML = `<div class="grid2" style="max-width:900px"><form class="card stack" id="pf"><h2>Profile</h2><label class="f">Name<input name="name" value="${esc(ME.name)}"></label><label class="f">Phone<input name="phone" value="${esc(ME.phone || '')}"></label><p class="muted small">${esc(ME.email)} · ${ROLE[ME.role]}</p><button class="btn ghost">Save</button></form>
      <form class="card stack" id="cf"><h2>Change password</h2><label class="f">Current password<input name="current" type="password" autocomplete="current-password" required></label><label class="f">New password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><p class="err" id="ce"></p><button class="btn ghost">Change password</button></form></div>`;
    $('#pf', v).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); busy(e.submitter, async () => { await api('/me/profile', x); ME.name = x.name; ME.phone = x.phone; toast('Saved'); }); });
    $('#cf', v).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/me/password', formData(e.target)); e.target.reset(); toast('Password changed'); }, $('#ce', v)); });
  }

  /* ---------- start ---------- */
  async function start() {
    const r = await api('/me');
    SET = r.settings; ME = r.user; brand();
    if (!ME) return login();
    if (ME.must_change) return mustChange();
    await refreshLK();
    shell();
    route();
  }
  window.addEventListener('hashchange', route);
  start().catch((e) => { document.body.innerHTML = `<p style="padding:30px;font-family:system-ui">Could not load: ${esc(e.message)}</p>`; });
})();
