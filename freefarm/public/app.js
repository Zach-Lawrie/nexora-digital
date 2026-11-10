/* FreeFarm: farm-to-market app */
(() => {
  'use strict';
  const P = {
    home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z', shop: 'M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v8h14v-8', box: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
    truck: 'M1 4h14v12H1zM15 9h4l3 4v3h-7M5.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4', hand: 'M9 11V5a2 2 0 0 1 4 0v6M13 10V4a2 2 0 0 1 4 0v7M17 9a2 2 0 0 1 4 0v5a8 8 0 0 1-8 8h-1a8 8 0 0 1-6.6-3.5L2 13a2 2 0 0 1 3.3-2.2L9 15V7a2 2 0 0 0-4 0',
    chart: 'M3 3v18h18M7 15v2M11 11v6M15 7v10M19 12v5', users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0', plus: 'M12 5v14M5 12h14',
    pin: 'M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5', clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2', x: 'M18 6 6 18M6 6l12 12', check: 'M20 6 9 17l-5-5',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3', alert: 'M12 3 2 21h20zM12 10v4M12 18h.01', send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z', more: 'M4 6h16M4 12h16M4 18h16', wallet: 'M3 7h18v13H3zM3 7l3-4h12l3 4M16 14h.01',
    phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', out: 'M9 21H5V3h4M16 17l5-5-5-5M21 12H9', snow: 'M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9', download: 'M12 3v12M7 10l5 5 5-5M5 21h14', gear: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    sprout: 'M7 20h10M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z',
    leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6',
  };
  const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n] || P.box}"/></svg>`;
  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#166534"/><path d="M8 27c5-1 9-1 12 0s7 1 12 0v4c-5 1-9 1-12 0s-7-1-12 0z" fill="#f59e0b"/><path d="M20 26c0-6 0-10 0-14" stroke="#e7f6ec" stroke-width="2.4" stroke-linecap="round"/><path d="M20 17c-4 0-7-2.5-7.5-7 4.5 0 7.5 2.5 7.5 7z" fill="#4ade80"/><path d="M20 14c3.5 0 6.5-2.3 7-6.5-4.3 0-7 2.4-7 6.5z" fill="#86efac"/></svg>`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = (s) => { if (!s) return ''; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return `${d} ${MON[m - 1]} ${y}`; };
  const today = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); // same calendar day as the server (Central Africa Time)
  const ago = (s) => { const m = Math.round((Date.now() - new Date(s).getTime()) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : fdate(s); };
  const initials = (n) => String(n || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const qn = (n) => { const x = Number(n); return Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''); };
  let ME = null, LK = null, BAL = 0, FOLLOWS = [], NOTE = { items: [], unread: 0 };
  const money = (v) => ((Number(v) || 0) < 0 ? '−' : '') + (LK && LK.currency !== 'USD' ? LK.currency + ' ' : '$') + Math.abs(Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const EMO = { Tomatoes: '🍅', Onions: '🧅', Cabbage: '🥬', Potatoes: '🥔', 'Sweet potatoes': '🍠', Butternut: '🎃', Pumpkins: '🎃', Carrots: '🥕', 'Covo / rape': '🥬', Spinach: '🥬', Lettuce: '🥬', 'Green peppers': '🫑', Chillies: '🌶️', 'Green beans': '🫛', Peas: '🫛', Cucumbers: '🥒', Garlic: '🧄', 'Green maize': '🌽', Maize: '🌽', Oranges: '🍊', Lemons: '🍋', Bananas: '🍌', Avocados: '🥑', Mangoes: '🥭', Apples: '🍎', Peaches: '🍑', Watermelons: '🍉', Pineapples: '🍍', Strawberries: '🍓', Blueberries: '🫐', Papaya: '🥭', Macadamia: '🌰', Groundnuts: '🥜', 'Sugar beans': '🫘', 'Soya beans': '🫘', Cowpeas: '🫘', 'Round nuts': '🥜', Wheat: '🌾', Sorghum: '🌾', Millet: '🌾', Rice: '🍚', Broilers: '🐔', 'Road-runner chickens': '🐓', Turkeys: '🦃', Goats: '🐐', Cattle: '🐄', Pigs: '🐖', Sheep: '🐑', Rabbits: '🐇', 'Fresh milk': '🥛', 'Sour milk (lacto)': '🥛', Eggs: '🥚', Cheese: '🧀', Kapenta: '🐟', 'Bream / tilapia': '🐟', Catfish: '🐟', Honey: '🍯', Mushrooms: '🍄', Herbs: '🌿', 'Sugar cane': '🎋', Tea: '🍵', Coffee: '☕', Cotton: '☁️', Tobacco: '🍂' };
  const emo = (c) => EMO[c] || '🌱';
  const ROLE = { farmer: 'Farmer', buyer: 'Buyer', transporter: 'Transporter', admin: 'Admin' };
  const OST = { placed: ['New', 'amber'], accepted: ['Accepted', 'blue'], ready: ['Ready', 'blue'], on_the_way: ['On the way', 'blue'], delivered: ['Delivered', 'green'], completed: ['Completed', 'green'], declined: ['Declined', 'red'], cancelled: ['Cancelled', 'red'], disputed: ['Problem reported', 'red'] };
  const JST = { open: ['Waiting for prices', 'amber'], assigned: ['Transporter booked', 'blue'], picked: ['Picked up', 'blue'], delivered: ['Delivered', 'green'], cancelled: ['Cancelled', 'red'] };
  const pill = (t, c) => `<span class="pill ${c || ''}">${esc(t)}</span>`;
  const op = (s) => pill(...(OST[s] || [s, '']));
  const jp = (s) => pill(...(JST[s] || [s, '']));
  const stars = (r) => r ? `<span class="stars">★ ${qn(r)}</span>` : '';

  /* ---------- api, toast, dialog ---------- */
  async function api(path, body, method) {
    const opt = { method: method || (body ? 'POST' : 'GET'), credentials: 'same-origin', headers: {} };
    if (body) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
    let r;
    try { r = await fetch('/api' + path, opt); } catch (e) { throw new Error('No connection. Check your internet and try again.'); }
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && ME) { ME = null; render(); }
    if (!r.ok) { const e = new Error(data.error || 'Something went wrong.'); e.status = r.status; throw e; }
    return data;
  }
  function toast(msg, bad) {
    const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.setAttribute('role', 'status');
    t.innerHTML = ic(bad ? 'alert' : 'check', 16) + esc(msg); document.body.appendChild(t); setTimeout(() => t.remove(), 3600);
  }
  function dlg(html, wire) {
    if (document.querySelector('dialog[open]')) return null;
    const d = document.createElement('dialog');
    d.innerHTML = `<div class="dlg">${html}</div>`; document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.showModal(); if (wire) wire(d); return d;
  }
  const head = (t, sub) => `<div class="head"><div><h2>${t}</h2>${sub ? `<p class="muted small" style="margin-top:4px">${sub}</p>` : ''}</div><button class="x" type="button" data-close aria-label="Close">${ic('x')}</button></div>`;
  async function busy(btn, fn, errEl) {
    if (btn) btn.disabled = true; if (errEl) errEl.textContent = '';
    try { return await fn(); } catch (e) { if (e.status === 402) payNudge(e.message); else if (errEl) errEl.textContent = e.message; else toast(e.message, true); } finally { if (btn) btn.disabled = false; }
  }
  function payNudge(msg) { dlg(`${head('Upgrade or settle up')}<p>${esc(msg)}</p><div class="row"><a class="btn" href="#/billing" data-close>${ic('wallet', 16)} Plan & billing</a><button class="btn ghost" data-close>Not now</button></div>`); }
  const formData = (f) => Object.fromEntries(new FormData(f).entries());
  const opt = (list, sel, blank) => (blank != null ? `<option value="">${esc(blank)}</option>` : '') + list.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(v) === String(sel ?? '') ? ' selected' : ''}>${esc(l)}</option>`; }).join('');
  const cropOpts = (sel, blank) => (blank != null ? `<option value="">${esc(blank)}</option>` : '') + Object.entries(LK.crops).map(([g, l]) => `<optgroup label="${esc(g)}">${l.map((c) => `<option${c === sel ? ' selected' : ''}>${esc(c)}</option>`).join('')}</optgroup>`).join('');
  const regionField = (country, val, name = 'region') => `<input name="${name}" list="rg" value="${esc(val || '')}" placeholder="${country === 'Zimbabwe' || !country ? 'Province' : 'Region'}" autocomplete="off"><datalist id="rg">${(LK.regions.Zimbabwe || []).map((r) => `<option>${esc(r)}</option>`).join('')}</datalist>`;
  const wa = (phone, text) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  function resizeImage(file, max) {
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        let q = 0.8, d = c.toDataURL('image/jpeg', q);
        while (d.length > 380000 && q > 0.3) { q -= 0.1; d = c.toDataURL('image/jpeg', q); }
        res(d);
      };
      img.onerror = () => rej(new Error('That file is not a photo we can read.'));
      img.src = url;
    });
  }
  const setTitle = (t) => { document.title = t ? `${t} · FreeFarm` : 'FreeFarm · Farm to market, nothing wasted'; };

  /* ---------- shell ---------- */
  function navFor() {
    if (!ME) return { top: [['#/market', 'Market'], ['#/requests', 'Buyers want'], ['#/prices', 'Prices'], ['#/loads', 'Transport'], ['#/directory', 'Directory'], ['#/pricing', 'Plans']], tab: [['#/', 'home', 'Home'], ['#/market', 'shop', 'Market'], ['#/requests', 'hand', 'Wanted'], ['#/prices', 'chart', 'Prices'], ['#/join', 'user', 'Join']] };
    const r = ME.role;
    if (r === 'farmer') return { top: [['#/', 'Home'], ['#/farm', 'My farm'], ['#/sell', 'My produce'], ['#/orders', 'Orders'], ['#/requests', 'Buyers want'], ['#/market?category=Farm%20inputs', 'Inputs store'], ['#/loads', 'Transport'], ['#/prices', 'Prices']], tab: [['#/', 'home', 'Home'], ['#/farm', 'sprout', 'My farm'], ['#/sell', 'leaf', 'Sell'], ['#/orders', 'box', 'Orders'], ['#/more', 'more', 'More']] };
    if (r === 'supplier') return { top: [['#/', 'Home'], ['#/sell', 'My products'], ['#/orders', 'Orders'], ['#/market?category=Farm%20inputs', 'Inputs store'], ['#/market', 'Market'], ['#/directory?role=farmer', 'Farmers']], tab: [['#/', 'home', 'Home'], ['#/sell', 'box', 'Products'], ['#/orders', 'wallet', 'Orders'], ['#/market?category=Farm%20inputs', 'shop', 'Store'], ['#/more', 'more', 'More']] };
    if (r === 'buyer') return { top: [['#/', 'Home'], ['#/market', 'Market'], ['#/orders', 'My orders'], ['#/requests', 'Requests'], ['#/loads', 'Transport'], ['#/prices', 'Prices'], ['#/directory', 'Directory']], tab: [['#/', 'home', 'Home'], ['#/market', 'shop', 'Market'], ['#/orders', 'box', 'Orders'], ['#/requests', 'hand', 'Requests'], ['#/more', 'more', 'More']] };
    if (r === 'transporter') return { top: [['#/', 'Home'], ['#/loads', 'Loads'], ['#/orders', 'My trips'], ['#/market', 'Market'], ['#/directory', 'Directory']], tab: [['#/', 'home', 'Home'], ['#/loads', 'truck', 'Loads'], ['#/orders', 'box', 'Trips'], ['#/billing', 'wallet', 'Billing'], ['#/more', 'more', 'More']] };
    return { top: [['#/admin', 'Admin'], ['#/admin/users', 'People'], ['#/admin/payments', 'Payments'], ['#/orders', 'Orders'], ['#/market', 'Market'], ['#/admin/settings', 'Settings']], tab: [['#/admin', 'chart', 'Admin'], ['#/admin/users', 'users', 'People'], ['#/admin/payments', 'wallet', 'Payments'], ['#/market', 'shop', 'Market'], ['#/more', 'more', 'More']] };
  }
  function shell() {
    const n = navFor();
    document.body.innerHTML = `<header class="top"><div class="wrap"><a class="logo" href="#/">${LOGO}<span>Free<b>Farm</b></span></a>
      <nav class="topnav" aria-label="Main">${n.top.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
      <div class="topright">${ME ? `<button class="iconbtn" id="bell" aria-label="Alerts">${ic('bell')}<span class="dotn" id="bn" hidden></span></button><a class="avatar" href="#/account" aria-label="My account">${esc(initials(ME.name))}</a><div class="menu" id="nm" hidden></div>`
        : `<a class="btn ghost sm" href="#/login">Sign in</a><a class="btn sm" href="#/join">Join free</a>`}</div></div></header>
      <main id="v" tabindex="-1"></main>
      <nav class="tabbar" aria-label="Main">${n.tab.map(([h, i, l]) => `<a href="${h}">${ic(i, 21)}<span>${l}</span></a>`).join('')}</nav>`;
    if (ME) { $('#bell').onclick = toggleNotes; document.addEventListener('click', (e) => { const m = $('#nm'); if (m && !m.hidden && !e.target.closest('#nm,#bell')) m.hidden = true; }); pollNotes(); }
  }
  function markNav() {
    const h = (location.hash || '#/').split('?')[0];
    $$('.topnav a, .tabbar a').forEach((a) => { const x = a.getAttribute('href'); const cur = x === '#/' ? h === '#/' || h === '#' || h === '' : h === x || (h.startsWith(x + '/') && x !== '#/admin') || (x === '#/admin' && h === '#/admin'); a.setAttribute('aria-current', cur ? 'page' : 'false'); });
  }
  async function pollNotes() {
    if (!ME) return;
    try { NOTE = await api('/notifications'); const b = $('#bn'); if (b) { b.hidden = !NOTE.unread; b.textContent = NOTE.unread > 9 ? '9+' : NOTE.unread; } } catch (e) { /* offline */ }
    clearTimeout(pollNotes.t); pollNotes.t = setTimeout(pollNotes, document.hidden ? 120000 : 45000);
  }
  async function toggleNotes() {
    const m = $('#nm'); if (!m.hidden) { m.hidden = true; return; }
    await pollNotes();
    m.innerHTML = NOTE.items.length ? NOTE.items.map((n) => `<a href="${esc(n.link || '#/')}" class="${n.read ? '' : 'unread'}">${esc(n.text)}<small>${ago(n.created_at)}</small></a>`).join('') : '<p class="empty">No alerts yet. We tell you here about new orders, offers, loads and payments.</p>';
    m.hidden = false;
    if (NOTE.unread) api('/notifications/read', {}).then(() => { $('#bn').hidden = true; }).catch(() => {});
    $$('a', m).forEach((a) => a.addEventListener('click', () => { m.hidden = true; }));
  }
  const page = (inner) => `<div class="wrap page">${inner}</div>`;
  const ph = (t, sub, right) => `<div class="ph"><div><h1>${t}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${right ? `<div class="row">${right}</div>` : ''}</div>`;

  /* ---------- router ---------- */
  async function route() {
    const raw = (location.hash || '#/').slice(1);
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const Q = new URLSearchParams(qs || '');
    markNav();
    const v = $('#v'); if (!v) return;
    v.innerHTML = '<p class="loading">Loading…</p>';
    window.scrollTo(0, 0);
    const k = parts[0] || '';
    const needLogin = ['sell', 'orders', 'order', 'billing', 'account', 'admin', 'more', 'load', 'farm'].includes(k) || (k === 'loads' && Q.get('mine'));
    if (needLogin && !ME) { location.hash = '#/login?next=' + encodeURIComponent(raw); return; }
    try {
      if (!k) await (ME ? (ME.role === 'admin' ? admin(v) : home(v)) : landing(v));
      else if (k === 'welcome') await landing(v);
      else if (k === 'market') await market(v, Q);
      else if (k === 'listing') await listing(v, parts[1]);
      else if (k === 'requests') await requests(v, Q);
      else if (k === 'request') await requestView(v, parts[1]);
      else if (k === 'prices') await prices(v, Q);
      else if (k === 'directory') await directory(v, Q);
      else if (k === 'pricing') await pricing(v);
      else if (k === 'join') join(v, Q);
      else if (k === 'login') login(v, Q);
      else if (k === 'sell') await (parts[1] ? sellForm(v, parts[1]) : sell(v));
      else if (k === 'orders') await orders(v, Q);
      else if (k === 'order') await orderView(v, parts[1]);
      else if (k === 'loads') await loads(v, Q);
      else if (k === 'load') await loadView(v, parts[1]);
      else if (k === 'billing') await billing(v);
      else if (k === 'account') await account(v);
      else if (k === 'more') more(v);
      else if (k === 'farm') await farm(v, parts[1] || '', parts[2], Q);
      else if (k === 'admin') { if (ME.role !== 'admin') throw new Error('Admins only.'); await (parts[1] === 'users' ? adminUsers(v) : parts[1] === 'payments' ? adminPayments(v) : parts[1] === 'settings' ? adminSettings(v) : admin(v)); }
      else v.innerHTML = page('<p class="empty">Page not found. <a href="#/">Go home</a></p>');
    } catch (e) { v.innerHTML = page(`<div class="banner bad">${ic('alert')}<span>${esc(e.message)}</span></div>`); }
  }
  async function render() { shell(); await route(); }

  /* ---------- listing cards ---------- */
  function photo(l, big) {
    const tags = [l.demo ? '<span class="pill example">Example</span>' : '', l.rescue ? `<span class="pill red">Rescue −${l.rescue_pct}%</span>` : '', l.kind === 'preharvest' ? `<span class="pill blue">Pre-harvest · ${fdate(l.available_from)}</span>` : '', l.export_ready ? '<span class="pill dark">Export grade</span>' : '', l.organic ? '<span class="pill green">Organic</span>' : ''].join('');
    return `<div class="ph-img">${l.has_photo ? `<img src="/api/photo/${l.id}" alt="${esc(l.crop)}" loading="lazy">` : `<span class="emo" aria-hidden="true">${emo(l.crop)}</span>`}<div class="tags">${tags}</div></div>`;
  }
  const priceTag = (l) => `<span class="price">${l.rescue ? `<s>${money(l.price)}</s>` : ''}${money(l.eff_price)}<small> /${esc(l.unit)}</small></span>`;
  function lcard(l) {
    return `<a class="lc" href="#/listing/${l.id}">${photo(l)}<div class="body"><div class="t"><b>${esc(l.crop)}${l.variety ? ` <span class="muted" style="font:500 13px var(--font)">${esc(l.variety)}</span>` : ''}</b>${priceTag(l)}</div>
      <div class="meta"><span>${ic('box', 14)}${qn(l.qty)} ${esc(l.unit)} left</span><span>${ic('pin', 14)}${esc(l.town || l.region || l.country)}</span>${l.days_left != null && l.days_left <= 5 && l.kind === 'now' ? `<span style="color:var(--red);font-weight:700">${ic('clock', 14)}${l.days_left <= 0 ? 'Last day' : l.days_left + ' day' + (l.days_left > 1 ? 's' : '') + ' left'}</span>` : ''}</div>
      <div class="who">${l.verified ? `<span style="color:var(--green)">${ic('shield', 14)}</span>` : ''}${esc(l.farm || l.farmer)} ${stars(l.rating)}${l.pro ? '<span class="pill green" style="margin-left:auto">Pro</span>' : ''}</div></div></a>`;
  }
  const grid = (items, empty) => items.length ? `<div class="grid-l">${items.map(lcard).join('')}</div>` : `<p class="empty">${empty}</p>`;
  function reqCard(r) {
    return `<a class="item" href="#/request/${r.id}"><span class="em">${emo(r.crop)}</span><span><b>${esc(r.crop)}: ${qn(r.qty)} ${esc(r.unit)}${r.repeat !== 'once' ? ` <span class="pill blue">${r.repeat}</span>` : ''}${r.demo ? ' <span class="pill example">Example</span>' : ''}</b>
      <small>${esc(r.buyer)}${r.buyer_type ? ' · ' + esc(r.buyer_type) : ''} · ${esc(r.town || r.region || r.country)}${r.needed_by ? ' · by ' + fdate(r.needed_by) : ''}</small></span>
      <span class="r">${r.max_price ? `<b class="price">≤ ${money(r.max_price)}<small> /${esc(r.unit)}</small></b>` : '<span class="muted small">Open to offers</span>'}<span class="muted small">${r.offers} offer${r.offers === 1 ? '' : 's'}${r.status !== 'open' ? ' · closed' : ''}</span></span></a>`;
  }

  /* ---------- landing ---------- */
  async function landing(v) {
    setTitle('');
    const [st, ls, rq] = await Promise.all([api('/stats'), api('/listings'), api('/requests')]);
    const pl = LK.plans;
    const rescue = ls.items.filter((l) => l.rescue), fresh = ls.items.slice(0, 8);
    const ticker = [...rescue, ...ls.items.filter((l) => !l.rescue)].slice(0, 5);
    v.innerHTML = `<section class="hero"><div class="wrap"><div>
        <span class="kicker">${ic('leaf', 15)} Farm to market across Africa</span>
        <h1>Grow it. Sell it.<br><em>Nothing wasted.</em></h1>
        <p class="lead">Too much good food rots on farms because the buyer and the truck are too far away. FreeFarm puts farmers, households, shops, hotels, processors, exporters and transporters on one market, so produce is sold before it spoils.</p>
        <div class="row"><a class="btn" href="#/join?role=farmer">${ic('leaf', 17)} I'm a farmer: start selling</a><a class="btn amber" href="#/market">${ic('shop', 17)} I'm buying: see the market</a></div>
        <p class="muted small" style="margin-top:14px">Free to join · ${money(LK.fee)} per completed sale · ${ic('truck', 14)} <a href="#/join?role=transporter">Transporters: find loads</a></p>
      </div>
      <div class="board"><div class="bh"><span><i class="live"></i>Live on the market</span><a href="#/market" style="color:#fcd34d;font-size:13px">See all</a></div>
        ${ticker.length ? ticker.map((l) => `<a class="tick" href="#/listing/${l.id}"><span class="e">${emo(l.crop)}</span><span><b>${esc(l.crop)} · ${qn(l.qty)} ${esc(l.unit)}</b><small>${esc(l.town || l.region || '')}${l.rescue ? ' · Rescue −' + l.rescue_pct + '%' : l.kind === 'preharvest' ? ' · Pre-harvest' : ''}${l.demo ? ' · Example' : ''}</small></span><span class="p">${money(l.eff_price)}<small>per ${esc(l.unit)}</small></span></a>`).join('') : '<p style="color:#cbbfae;padding:14px">The first farmers are joining now. List your produce and be first on the board.</p>'}
        <div class="bh" style="margin-top:4px"><span>${rq.items.length} buyer request${rq.items.length === 1 ? '' : 's'} open</span><a href="#/requests" style="color:#fcd34d;font-size:13px">Send an offer</a></div></div>
    </div></section>
    <section class="sec alt"><div class="wrap"><div class="ph"><div><h2>One market for everyone in the food chain</h2><p>Each side finds the other, agrees a price and moves the food the same week.</p></div></div>
      <div class="roles">
        <div class="role f"><h3>🧑🏾‍🌾 Farmers</h3><ol><li>List what you have, with a photo and price.</li><li>Get orders and offers from buyers who need it now.</li><li>Close to the sell-by date? Turn on a rescue discount.</li><li>Sell your next harvest before you harvest it.</li></ol><a class="btn sm" href="#/join?role=farmer">Start selling</a></div>
        <div class="role b"><h3>🛒 Buyers</h3><ol><li>Households, shops, hotels, schools, processors and exporters.</li><li>Buy direct from the farm at farm prices.</li><li>Post what you need and let farmers send offers.</li><li>Choose collect, farmer delivery or a transporter.</li></ol><a class="btn sm amber" href="#/join?role=buyer">Start buying</a></div>
        <div class="role t"><h3>🚚 Transporters</h3><ol><li>See loads going your way, including cold loads.</li><li>Send your price, get chosen, get paid by the customer.</li><li>Fill empty return trips.</li><li>Build your rating with every delivery.</li></ol><a class="btn sm ghost" href="#/join?role=transporter">Find loads</a></div>
      </div></div></section>
    <section class="sec"><div class="wrap"><div class="ph"><div><h2>Built to stop food going to waste</h2></div></div>
      <div class="feats">
        <div class="feat"><span class="fi">⏳</span><h3>Rescue deals</h3><p class="muted">Produce near its sell-by date drops in price automatically and buyers who follow that crop get an alert. Sold, not dumped.</p></div>
        <div class="feat"><span class="fi">🌱</span><h3>Sell before harvest</h3><p class="muted">List next month's crop now. Retailers, processors and exporters reserve it, so you plant and harvest for a buyer you already have.</p></div>
        <div class="feat"><span class="fi">🙋🏾</span><h3>Buyer requests</h3><p class="muted">Buyers post what they need, how much and by when. Every farmer growing that crop is alerted and can send an offer.</p></div>
        <div class="feat"><span class="fi">🚚</span><h3>Transport on demand</h3><p class="muted">Every order can book a truck. Local transporters, including refrigerated trucks, send prices and you choose.</p></div>
        <div class="feat"><span class="fi">📈</span><h3>Fair market prices</h3><p class="muted">See average prices per kg by crop and province from real listings and sales, so nobody sells too cheap or buys too dear.</p></div>
        <div class="feat"><span class="fi">⭐</span><h3>Trust built in</h3><p class="muted">Ratings after every sale and delivery, verified farmers and businesses, and in-app chat on every order.</p></div>
      </div></div></section>
    <section class="sec alt"><div class="wrap"><div class="ph"><div><h2>Run your whole farm from your phone</h2><p>Free for every farmer, with no limits on the Farm Manager plan.</p></div><a class="btn" href="#/join?role=farmer">Start free</a></div>
      <div class="feats">
        <div class="feat"><span class="fi">📅</span><h3>Crop and livestock calendars</h3><p class="muted">Add a crop or a broiler batch and get every task: planting, fertiliser, spraying, vaccination and harvest, with growth stages and harvest dates.</p></div>
        <div class="feat"><span class="fi">🩺</span><h3>AI plant doctor</h3><p class="muted">Photograph a sick leaf. The AI names the likely disease, pest or deficiency and tells you what to do today, with low-cost options.</p></div>
        <div class="feat"><span class="fi">🌦️</span><h3>Weather and outbreak alerts</h3><p class="muted">Frost, heat, heavy rain and dry-spell warnings for your farm, disease risk for your crops, and alerts when farms near you report an outbreak.</p></div>
        <div class="feat"><span class="fi">👩🏾‍🌾</span><h3>Workers and payroll</h3><p class="muted">Daily attendance, piece work, advances and payslips worked out for you.</p></div>
        <div class="feat"><span class="fi">📦</span><h3>Store and inputs</h3><p class="muted">Track seed, fertiliser, chemicals and feed. Get warned before you run out or harvest inside a chemical's withholding period, and buy from suppliers here.</p></div>
        <div class="feat"><span class="fi">📒</span><h3>Farm accounts</h3><p class="muted">Money in and out, profit per crop, and a file for your accountant. Sales, wages and purchases are recorded automatically.</p></div>
      </div></div></section>
    <section class="sec"><div class="wrap"><div class="ph"><div><h2>On the market now</h2><p>${ls.items.length} listings${rescue.length ? `, ${rescue.length} rescue deal${rescue.length > 1 ? 's' : ''}` : ''}</p></div><a class="btn ghost" href="#/market">Open the market</a></div>
      ${grid(fresh, 'No produce listed yet. <a href="#/join?role=farmer">Be the first farmer on FreeFarm.</a>')}
      ${rq.items.length ? `<h2 style="margin:32px 0 12px">Buyers are looking for</h2><div class="list">${rq.items.slice(0, 4).map(reqCard).join('')}</div>` : ''}
    </div></section>
    <section class="sec"${st.orders ? '' : ' hidden'}><div class="wrap"><div class="ph"><div><h2>Our impact so far</h2><p>Counted from completed sales between real members.</p></div></div>
      <div class="impact"><div><b>${Math.round(st.kg).toLocaleString()} kg</b><span>food moved from farm to buyer</span></div><div><b>${Math.round(st.rescued).toLocaleString()} kg</b><span>rescued before it spoiled</span></div><div><b>${(st.users.farmer || 0).toLocaleString()}</b><span>farmers selling</span></div><div><b>${(st.orders || 0).toLocaleString()}</b><span>completed orders</span></div></div></div></section>
    <section class="sec alt" id="plans"><div class="wrap"><div class="ph"><div><h2>Simple pricing</h2><p>Join free. FreeFarm earns ${money(LK.fee)} on each completed sale${LK.transport_fee ? ` and ${money(LK.transport_fee)} on each completed delivery` : ''}. Nothing on cancelled orders. Paid plans start with a ${LK.trial_days}-day free trial.</p></div></div>
      ${planGrid('farmer', pl.farmer)}${planGrid('buyer', pl.buyer)}${planGrid('transporter', pl.transporter)}</div></section>
    <section class="sec"><div class="wrap"><div class="cta"><div><h2>Have produce, or need it?</h2><p style="opacity:.85;margin-top:6px">Join in two minutes with your phone number.</p></div><div class="row"><a class="btn amber" href="#/join">Join FreeFarm</a><a class="btn ghost" href="#/market">Browse first</a></div></div></div></section>
    ${footer()}`;
  }
  const footer = () => `<footer class="foot"><div class="wrap"><span>© ${new Date().getFullYear()} FreeFarm · Farm to market, nothing wasted${LK.support_whatsapp ? ` · <a href="${wa(LK.support_whatsapp, 'Hi FreeFarm')}" target="_blank" rel="noopener">WhatsApp support</a>` : ''}</span><span>Built by Nexora Digital · a SENATOR INVST company</span></div></footer>`;
  function planGrid(role, plans, current, onPick) {
    const t = { farmer: 'For farmers', buyer: 'For buyers', transporter: 'For transporters' }[role];
    return `<h3 style="margin:22px 0 10px">${t}</h3><div class="plans">${plans.map((p) => `<div class="plan${current === p.id ? ' pick' : ''}">${current === p.id ? '<span class="pill green badge">Your plan</span>' : ''}<h3>${esc(p.name)}</h3><div class="amt">${p.price ? money(p.price) : 'Free'}${p.price ? '<small> /month</small>' : ''}</div><ul>${p.perks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${onPick && p.price ? `<button class="btn${current === p.id ? ' ghost' : ''}" data-plan="${p.id}">${current === p.id ? 'Renew' : 'Choose ' + esc(p.name)}</button>` : !onPick && !ME ? `<a class="btn ${p.price ? '' : 'ghost'}" href="#/join?role=${role}&plan=${p.id}">${p.price ? 'Start free trial' : 'Join free'}</a>` : ''}</div>`).join('')}</div>`;
  }
  async function pricing(v) {
    setTitle('Plans');
    v.innerHTML = page(ph('Plans and fees', `Join free. FreeFarm earns ${money(LK.fee)} per completed sale${LK.transport_fee ? ' and ' + money(LK.transport_fee) + ' per completed delivery' : ''}. Paid plans start with a ${LK.trial_days}-day free trial. Pay yearly and get 2 months free.`) + planGrid('farmer', LK.plans.farmer) + planGrid('buyer', LK.plans.buyer) + planGrid('transporter', LK.plans.transporter));
  }

  /* ---------- market ---------- */
  async function market(v, Q) {
    setTitle('Market');
    const st = { q: Q.get('q') || '', category: Q.get('category') || '', region: Q.get('region') || '', country: Q.get('country') || (ME ? ME.country : ''), kind: Q.get('kind') || '', sort: Q.get('sort') || '', farmer: Q.get('farmer') || '' };
    v.innerHTML = page(ph('Market', 'Buy straight from farmers. Rescue deals are produce that must sell in the next few days.', ME && ME.role === 'farmer' ? `<a class="btn" href="#/sell/new">${ic('plus', 16)} List produce</a>` : '') + `
      <div class="filters"><label class="search">${ic('search', 17)}<input type="search" id="q" placeholder="Tomatoes, avocados, Marondera…" value="${esc(st.q)}" aria-label="Search"></label>
        <select id="cat" aria-label="Category">${opt(Object.keys(LK.crops), st.category, 'All produce')}</select>
        <select id="co" aria-label="Country">${opt(LK.countries, st.country, 'All countries')}</select>
        <select id="so" aria-label="Sort">${opt([['', 'Best match'], ['price', 'Cheapest per kg'], ['soon', 'Must sell soonest']], st.sort)}</select></div>
      <div class="chips" style="margin-bottom:16px">${[['', 'Everything'], ['rescue', '⏳ Rescue deals'], ['now', 'Ready now'], ['preharvest', '🌱 Pre-harvest']].map(([k, l]) => `<button class="chip" data-k="${k}" aria-pressed="${st.kind === k}">${l}</button>`).join('')}<button class="chip" data-x="export" aria-pressed="${!!Q.get('export')}">Export grade</button><button class="chip" data-x="organic" aria-pressed="${!!Q.get('organic')}">Organic</button></div>
      <div id="res"><p class="loading">Loading…</p></div>`);
    const flags = { export: !!Q.get('export'), organic: !!Q.get('organic') };
    const load = async () => {
      const p = new URLSearchParams(); Object.entries(st).forEach(([k, x]) => x && p.set(k, x)); Object.entries(flags).forEach(([k, x]) => x && p.set(k, 1));
      history.replaceState(null, '', '#/market' + (p.toString() ? '?' + p : ''));
      const { items } = await api('/listings?' + p);
      $('#res', v).innerHTML = `<p class="muted small" style="margin-bottom:10px">${items.length} result${items.length === 1 ? '' : 's'}${st.farmer && items[0] ? ' from ' + esc(items[0].farm || items[0].farmer) : ''}</p>` + grid(items, `Nothing matches yet. ${ME && ME.role === 'buyer' ? '<a href="#/requests?new=1">Post a request</a> and farmers will send you offers.' : 'Try fewer filters.'}`);
    };
    let t; $('#q', v).oninput = (e) => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value.trim(); load(); }, 300); };
    $('#cat', v).onchange = (e) => { st.category = e.target.value; load(); };
    $('#co', v).onchange = (e) => { st.country = e.target.value; load(); };
    $('#so', v).onchange = (e) => { st.sort = e.target.value; load(); };
    $$('[data-k]', v).forEach((b) => b.onclick = () => { st.kind = b.dataset.k; $$('[data-k]', v).forEach((x) => x.setAttribute('aria-pressed', x === b)); load(); });
    $$('[data-x]', v).forEach((b) => b.onclick = () => { flags[b.dataset.x] = !flags[b.dataset.x]; b.setAttribute('aria-pressed', flags[b.dataset.x]); load(); });
    await load();
  }
  async function listing(v, id) {
    const { item: l, reviews } = await api('/listings/' + id);
    setTitle(l.crop);
    const mine = ME && (ME.id === l.farmer_id || ME.role === 'admin');
    const canBuy = !ME || ME.role === 'buyer';
    const live = l.status === 'active';
    v.innerHTML = page(`<p style="margin-bottom:12px"><a href="#/market">← Market</a></p><div class="detail"><div class="stack">${photo(l, true)}
        <div class="card stack"><div class="between"><h1 style="font-size:clamp(26px,4vw,36px)">${emo(l.crop)} ${esc(l.crop)}</h1>${priceTag(l)}</div>
          ${l.variety ? `<p class="muted">${esc(l.variety)}</p>` : ''}
          ${l.rescue ? `<div class="banner warn">${ic('clock')}<span>Rescue deal: ${l.rescue_pct}% off because it must sell within ${l.days_left <= 0 ? 'today' : l.days_left + ' day' + (l.days_left > 1 ? 's' : '')}. You help stop it going to waste.</span></div>` : ''}
          ${l.kind === 'preharvest' ? `<div class="banner info">${ic('leaf')}<span>Pre-harvest: expected from ${fdate(l.available_from)}. Order now to reserve your share.</span></div>` : ''}
          ${!live ? `<div class="banner bad">${ic('alert')}<span>This listing is ${esc(l.status)}.</span></div>` : ''}
          <div class="facts"><div><span>Available</span><b>${qn(l.qty)} ${esc(l.unit)}</b></div><div><span>Minimum order</span><b>${qn(l.min_order)} ${esc(l.unit)}</b></div>
            <div><span>Per kg</span><b>${money(l.eff_price / l.unit_kg)} <span class="muted small">(1 ${esc(l.unit)} ≈ ${qn(l.unit_kg)} kg)</span></b></div><div><span>Grade</span><b>${esc(l.grade || 'Not graded')}</b></div>
            <div><span>Location</span><b>${esc([l.town, l.region, l.country].filter(Boolean).join(', '))}</b></div><div><span>Delivery</span><b>${{ pickup: 'Collect from farm', farmer: 'Farmer delivers', both: 'Collect or farmer delivers' }[l.delivery]}</b></div>
            ${l.best_before ? `<div><span>Sell by</span><b>${fdate(l.best_before)}</b></div>` : ''}<div><span>Listed</span><b>${ago(l.created_at)} · ${l.views} views</b></div></div>
          ${l.notes ? `<p style="white-space:pre-wrap">${esc(l.notes)}</p>` : ''}</div>
        <div class="card stack"><div class="row"><span class="avatar" style="background:var(--leaf)">${esc(initials(l.farm || l.farmer))}</span><div><b>${esc(l.farm || l.farmer)}</b> ${l.verified ? `<span class="pill green">${ic('shield', 12)} Verified</span>` : ''} ${l.demo ? '<span class="pill example">Example</span>' : ''}<br><span class="muted small">${l.farm ? esc(l.farmer) + ' · ' : ''}${stars(l.rating)} ${l.sales} completed sale${l.sales === 1 ? '' : 's'} · member since ${fdate(l.farmer_since)}</span></div></div>
          ${l.farmer_bio ? `<p class="muted">${esc(l.farmer_bio)}</p>` : ''}<a href="#/market?farmer=${l.farmer_id}">More from this farmer</a>
          ${reviews.length ? `<div class="stack" style="gap:8px">${reviews.map((r) => `<div style="border-top:1px solid var(--line2);padding-top:8px"><span class="stars">${'★'.repeat(r.rating)}</span> <b>${esc(r.name)}</b> <span class="muted small">${fdate(r.completed_at)}</span>${r.review ? `<p class="small">${esc(r.review)}</p>` : ''}</div>`).join('')}</div>` : ''}</div></div>
      <div class="sticky"><div class="card stack" id="buy"></div></div></div>`);
    const box = $('#buy', v);
    if (mine) { box.innerHTML = `<h2>Your listing</h2><p class="muted">Buyers see this page. Keep the quantity and sell-by date up to date.</p><a class="btn" href="#/sell/${l.id}">Edit listing</a><a class="btn ghost" href="#/orders">See orders</a>`; return; }
    if (!canBuy) { box.innerHTML = `<h2>Buying</h2><p class="muted">Sign in with a buyer account to order produce.</p>`; return; }
    if (!live) { box.innerHTML = `<h2>Not available</h2><a class="btn ghost" href="#/market?crop=${encodeURIComponent(l.crop)}">Find other ${esc(l.crop)}</a>`; return; }
    const min = l.min_order, step = l.unit_kg >= 100 ? 0.5 : 1;
    box.innerHTML = `<h2>Order</h2>${!ME ? `<div class="banner info">${ic('user')}<span>Sign in or join free to order. It takes two minutes.</span></div>` : ''}
      <form class="stack" id="of"><label class="f">How many ${esc(l.unit)}?<div class="qty"><button type="button" data-d="-1" aria-label="Less">−</button><input name="qty" type="number" step="any" min="${min}" max="${l.qty}" value="${qn(Math.max(min, Math.min(l.qty, min)))}" inputmode="decimal"><button type="button" data-d="1" aria-label="More">+</button></div><span class="hint">${qn(min)} to ${qn(l.qty)} ${esc(l.unit)}</span></label>
        <fieldset class="radios" style="border:0;padding:0;margin:0"><legend class="f" style="font-weight:600;font-size:14px;margin-bottom:6px">How do you get it?</legend>
          <label class="radio"><input type="radio" name="delivery" value="pickup" checked><span><b>I collect from the farm</b><small>${esc(l.town || l.region || '')}</small></span></label>
          ${l.delivery !== 'pickup' ? '<label class="radio"><input type="radio" name="delivery" value="farmer"><span><b>The farmer delivers</b><small>Agree the delivery cost in the chat</small></span></label>' : ''}
          <label class="radio"><input type="radio" name="delivery" value="transport"><span><b>Book a transporter</b><small>Transporters send prices, you choose</small></span></label></fieldset>
        <label class="f" id="adr" hidden>Deliver to<input name="address" placeholder="Shop name, street, town" value="${ME ? esc([ME.business, ME.town, ME.region].filter(Boolean).join(', ')) : ''}"></label>
        <div class="grid2"><label class="f">Needed by<input type="date" name="needed_by" min="${l.kind === 'preharvest' ? l.available_from : today()}" value="${l.kind === 'preharvest' ? l.available_from : ''}"></label><label class="f">Pay with<select name="payment">${opt([['cash', 'Cash'], ['ecocash', 'EcoCash / mobile money'], ['bank', 'Bank transfer'], ['other', 'Other']], 'cash')}</select></label></div>
        <label class="f">Note to farmer (optional)<input name="note" maxlength="300" placeholder="e.g. Grade A only, call on arrival"></label>
        <div class="total"><span>Total to pay the farmer</span><b id="tot"></b></div>
        <p class="hint">You pay the farmer directly. Transport, if booked, is paid to the transporter.</p>
        <p class="err" id="oe"></p><button class="btn wide">${ME ? 'Place order' : 'Sign in to order'}</button></form>`;
    const f = $('#of', box), qi = f.elements.qty;
    const upd = () => { const q = Number(qi.value) || 0; $('#tot', box).textContent = money(q * l.eff_price); $('#adr', box).hidden = f.elements.delivery.value === 'pickup'; };
    $$('[data-d]', f).forEach((b) => b.onclick = () => { qi.value = qn(Math.min(l.qty, Math.max(min, (Number(qi.value) || 0) + Number(b.dataset.d) * step))); upd(); });
    f.addEventListener('input', upd); f.addEventListener('change', upd); upd();
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ME) { location.hash = '#/login?next=' + encodeURIComponent('listing/' + l.id); return; }
      const x = formData(f); x.listing_id = l.id;
      busy(e.submitter, async () => { const r = await api('/orders', x); toast(`Order ${r.number} sent to the farmer`); location.hash = '#/order/' + r.id; }, $('#oe', box));
    });
  }

  /* ---------- requests ---------- */
  async function requests(v, Q) {
    setTitle('Buyers want');
    const isBuyer = ME && ME.role === 'buyer', mine = isBuyer && Q.get('mine') !== '0' && Q.get('tab') !== 'all' && Q.get('mine') !== null;
    v.innerHTML = page(ph(isBuyer ? 'Buy requests' : 'Buyers want', isBuyer ? 'Tell farmers what you need. Everyone growing it gets an alert and can send you an offer.' : 'Open requests from shops, hotels, processors, exporters and households. Send an offer.', isBuyer ? `<button class="btn" id="nr">${ic('plus', 16)} Post a request</button>` : '') +
      (isBuyer ? `<nav class="tabs"><a href="#/requests?mine=1" aria-current="${mine}">My requests</a><a href="#/requests?tab=all" aria-current="${!mine}">All requests</a></nav>` : '') +
      `<div class="filters" style="grid-template-columns:repeat(2,minmax(0,1fr))"><select id="cat" aria-label="Category">${opt(Object.keys(LK.crops), Q.get('category'), 'All produce')}</select><select id="co" aria-label="Country">${opt(LK.countries, Q.get('country') || (ME ? ME.country : ''), 'All countries')}</select></div><div id="res" class="list"></div>`);
    const load = async () => {
      const p = new URLSearchParams(); if (mine) p.set('mine', 1); const c = $('#cat', v).value, co = $('#co', v).value; if (c) p.set('category', c); if (co) p.set('country', co);
      const { items } = await api('/requests?' + p);
      $('#res', v).innerHTML = items.length ? items.map(reqCard).join('') : `<p class="empty">${mine ? 'You have no requests yet. Post one and farmers will come to you.' : 'No open requests here yet.'}</p>`;
    };
    $('#cat', v).onchange = load; $('#co', v).onchange = load;
    if ($('#nr', v)) $('#nr', v).onclick = () => requestDlg({}, () => { location.hash = '#/requests?mine=1'; route(); });
    if (Q.get('new') && isBuyer) requestDlg({ crop: Q.get('crop') || '' }, () => { location.hash = '#/requests?mine=1'; });
    await load();
  }
  function requestDlg(r, done) {
    dlg(`${head(r.id ? 'Edit request' : 'What do you need?', 'Farmers who grow it get an alert straight away.')}<form class="stack" id="rf">
      <label class="f">Produce<select name="crop" required>${cropOpts(r.crop, 'Choose…')}</select></label>
      <div class="grid3"><label class="f">Quantity<input name="qty" type="number" step="any" min="0" required value="${esc(r.qty || '')}"></label><label class="f">Unit<select name="unit">${opt(Object.keys(LK.units), r.unit || 'kg')}</select></label><label class="f">Max price per unit<input name="max_price" type="number" step="any" min="0" value="${esc(r.max_price || '')}" placeholder="Optional"></label></div>
      <div class="grid2"><label class="f">Needed by<input type="date" name="needed_by" min="${today()}" value="${esc(r.needed_by || '')}"></label><label class="f">How often<select name="repeat">${opt([['once', 'Once'], ['weekly', 'Every week'], ['monthly', 'Every month']], r.repeat || 'once')}</select></label></div>
      <div class="grid2"><label class="f">Country<select name="country">${opt(LK.countries, r.country || ME.country)}</select></label><label class="f">Province / region${regionField(ME.country, r.region || ME.region)}</label></div>
      <label class="f">Details for farmers<textarea name="notes" rows="3" maxlength="600" placeholder="Grade, size, packaging, where to deliver">${esc(r.notes || '')}</textarea></label>
      <p class="err" id="re"></p><div class="row"><button class="btn">${ic('send', 16)} ${r.id ? 'Save' : 'Post request'}</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      $('#rf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); if (r.id) x.id = r.id; x.town = ME.town; busy(e.submitter, async () => { const res = await api('/requests', x); d.close(); toast(res.matched ? `Posted. ${res.matched} farmer${res.matched > 1 ? 's were' : ' was'} alerted.` : 'Posted. Farmers will see it on the board.'); done(); }, $('#re', d)); });
    });
  }
  async function requestView(v, id) {
    if (!ME) { location.hash = '#/login?next=' + encodeURIComponent('request/' + id); return; }
    const { item: r, offers, mine } = await api('/requests/' + id);
    setTitle(r.crop + ' wanted');
    const isFarmer = ME.role === 'farmer';
    const myOffer = offers.find((o) => o.farmer_id === ME.id && o.status === 'pending');
    v.innerHTML = page(`<p style="margin-bottom:12px"><a href="#/requests${mine ? '?mine=1' : ''}">← Requests</a></p><div class="detail"><div class="card stack">
      <div class="between"><h1 style="font-size:clamp(24px,4vw,34px)">${emo(r.crop)} ${esc(r.crop)} wanted</h1>${pill(r.status === 'open' ? 'Open' : 'Closed', r.status === 'open' ? 'green' : '')}</div>
      <div class="facts"><div><span>Quantity</span><b>${qn(r.qty)} ${esc(r.unit)}${r.repeat !== 'once' ? ' ' + r.repeat : ''}</b></div><div><span>Max price</span><b>${r.max_price ? money(r.max_price) + ' / ' + esc(r.unit) : 'Open to offers'}</b></div>
        <div><span>Buyer</span><b>${esc(r.buyer)}${r.buyer_type ? ' · ' + esc(r.buyer_type) : ''}</b></div><div><span>Where</span><b>${esc([r.town, r.region, r.country].filter(Boolean).join(', '))}</b></div>
        <div><span>Needed by</span><b>${r.needed_by ? fdate(r.needed_by) : 'Flexible'}</b></div><div><span>Posted</span><b>${ago(r.created_at)}</b></div></div>
      ${r.notes ? `<p style="white-space:pre-wrap">${esc(r.notes)}</p>` : ''}
      ${mine && r.status === 'open' ? `<div class="row"><button class="btn ghost sm" id="ed">Edit</button><button class="btn ghost sm" id="cl">Close request</button></div>` : ''}</div>
      <div class="stack"><div class="card stack" id="side"></div></div></div>`);
    const side = $('#side', v);
    if (mine) {
      side.innerHTML = `<h2>Offers (${offers.length})</h2>${offers.length ? offers.map((o) => `<div class="card flat stack" style="padding:14px"><div class="between"><b>${esc(o.farm || o.farmer)} ${o.verified ? `<span style="color:var(--green)">${ic('shield', 14)}</span>` : ''} ${stars(o.rating)}</b><span class="price">${money(o.price)}<small> /${esc(r.unit)}</small></span></div>
        <span class="muted small">${qn(o.qty)} ${esc(r.unit)} · ${esc(o.region || '')}${o.available_from ? ' · from ' + fdate(o.available_from) : ''} · total ${money(o.qty * o.price)}</span>${o.note ? `<p class="small">${esc(o.note)}</p>` : ''}
        ${o.status === 'pending' && r.status === 'open' ? `<div class="row"><button class="btn sm" data-acc="${o.id}">Accept</button><button class="btn ghost sm" data-dec="${o.id}">Decline</button></div>` : `<span>${pill(o.status, o.status === 'accepted' ? 'green' : '')}${o.order_id ? ` <a href="#/order/${o.order_id}">Open order</a>` : ''}</span>`}</div>`).join('') : '<p class="muted">No offers yet. Farmers growing ' + esc(r.crop) + ' have been alerted.</p>'}`;
      $$('[data-acc]', side).forEach((b) => b.onclick = () => acceptOffer(offers.find((o) => String(o.id) === b.dataset.acc), r));
      $$('[data-dec]', side).forEach((b) => b.onclick = () => busy(b, async () => { await api('/offers/' + b.dataset.dec, { decline: 1 }); route(); }));
      if ($('#cl', v)) $('#cl', v).onclick = (e) => busy(e.currentTarget, async () => { await api('/requests', { id: r.id, close: 1 }); toast('Request closed'); route(); });
      if ($('#ed', v)) $('#ed', v).onclick = () => requestDlg(r, route);
    } else if (isFarmer) {
      if (myOffer) side.innerHTML = `<h2>Your offer</h2><p>${qn(myOffer.qty)} ${esc(r.unit)} at ${money(myOffer.price)} / ${esc(r.unit)}</p><p class="muted small">Waiting for the buyer. We'll alert you.</p><button class="btn ghost" id="wd">Withdraw offer</button>`;
      else if (r.status !== 'open') side.innerHTML = '<h2>Closed</h2><p class="muted">This request is no longer taking offers.</p>';
      else side.innerHTML = `<h2>Send an offer</h2><form class="stack" id="ff"><div class="grid2"><label class="f">Quantity (${esc(r.unit)})<input name="qty" type="number" step="any" min="0" required value="${qn(r.qty)}"></label><label class="f">Your price per ${esc(r.unit)}<input name="price" type="number" step="any" min="0" required value="${r.max_price || ''}"></label></div>
        <label class="f">Available from<input type="date" name="available_from" min="${today()}"></label><label class="f">Message<input name="note" maxlength="300" placeholder="Grade, packaging, can you deliver?"></label><p class="err" id="fe"></p><button class="btn">${ic('send', 16)} Send offer</button></form>`;
      if ($('#wd', side)) $('#wd', side).onclick = (e) => busy(e.currentTarget, async () => { await api('/offers/' + myOffer.id, { withdraw: 1 }); route(); });
      if ($('#ff', side)) $('#ff', side).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/requests/' + r.id + '/offer', formData(e.target)); toast('Offer sent. The buyer has been alerted.'); route(); }, $('#fe', side)); });
    } else side.innerHTML = '<h2>Offers</h2><p class="muted">Farmers send offers on requests. Buyers see them and choose.</p>';
  }
  function acceptOffer(o, r) {
    dlg(`${head('Accept this offer', `${qn(o.qty)} ${esc(r.unit)} of ${esc(r.crop)} from ${esc(o.farm || o.farmer)} · total ${money(o.qty * o.price)}`)}<form class="stack" id="af">
      <fieldset class="radios" style="border:0;padding:0;margin:0"><label class="radio"><input type="radio" name="delivery" value="farmer" checked><span><b>The farmer delivers</b></span></label><label class="radio"><input type="radio" name="delivery" value="pickup"><span><b>I collect</b></span></label><label class="radio"><input type="radio" name="delivery" value="transport"><span><b>Book a transporter</b></span></label></fieldset>
      <label class="f">Deliver to<input name="address" value="${esc([ME.business, ME.town, ME.region].filter(Boolean).join(', '))}"></label><label class="f">Pay with<select name="payment">${opt([['cash', 'Cash'], ['ecocash', 'EcoCash / mobile money'], ['bank', 'Bank transfer']], 'cash')}</select></label>
      <p class="err" id="ae"></p><div class="row"><button class="btn">${ic('check', 16)} Accept and create order</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      $('#af', d).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const res = await api('/offers/' + o.id, formData(e.target)); d.close(); toast('Order ' + res.number + ' created'); location.hash = '#/order/' + res.order_id; }, $('#ae', d)); });
    });
  }

  /* ---------- prices & directory ---------- */
  async function prices(v, Q) {
    setTitle('Market prices');
    const country = Q.get('country') || (ME ? ME.country : 'Zimbabwe'), region = Q.get('region') || '';
    const { items } = await api(`/prices?country=${encodeURIComponent(country)}&region=${encodeURIComponent(region)}`);
    v.innerHTML = page(ph('Market prices', 'Average price per kg from FreeFarm listings and completed sales in the last 60 days. Use it to price fairly.') +
      `<div class="filters" style="grid-template-columns:repeat(2,minmax(0,1fr))"><select id="co" aria-label="Country">${opt(LK.countries.filter((c) => c !== 'Other'), country)}</select><select id="rg" aria-label="Province">${opt(LK.regions[country] || [], region, 'All provinces')}</select></div>
      ${items.length ? `<div class="tw"><table class="t"><thead><tr><th>Produce</th><th>Average per kg</th><th>Range per kg</th><th>Based on</th><th></th></tr></thead><tbody>${items.map((x) => `<tr><td><b>${emo(x.crop)} ${esc(x.crop)}</b><br><span class="muted tiny">${esc(x.category)}</span></td><td><b class="price">${money(x.avg)}</b></td><td>${money(x.low)} – ${money(x.high)}</td><td class="muted small">${x.n} price${x.n > 1 ? 's' : ''}${x.sales ? `, ${x.sales} sale${x.sales > 1 ? 's' : ''}` : ''}</td><td><a href="#/market?q=${encodeURIComponent(x.crop)}">Buy</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No prices here yet. They appear as farmers list and sell.</p>'}`);
    const go = () => { location.hash = `#/prices?country=${encodeURIComponent($('#co', v).value)}&region=${encodeURIComponent($('#rg', v).value)}`; };
    $('#co', v).onchange = () => { $('#rg', v).value = ''; go(); }; $('#rg', v).onchange = go;
  }
  async function directory(v, Q) {
    setTitle('Directory');
    const role = Q.get('role') || 'farmer';
    v.innerHTML = page(ph('Directory', 'Find farmers, buying businesses and transporters. Contact details are shared once you trade, so everyone is protected.') +
      `<nav class="tabs">${[['farmer', 'Farmers'], ['buyer', 'Buyers'], ['transporter', 'Transporters']].map(([k, l]) => `<a href="#/directory?role=${k}" aria-current="${k === role}">${l}</a>`).join('')}</nav>
      <div class="filters" style="grid-template-columns:2fr 1fr"><label class="search">${ic('search', 17)}<input type="search" id="q" placeholder="Name, crop, town" aria-label="Search"></label><select id="co" aria-label="Country">${opt(LK.countries, ME ? ME.country : '', 'All countries')}</select></div><div id="res" class="list"></div>`);
    const load = async () => {
      const { items } = await api(`/directory?role=${role}&q=${encodeURIComponent($('#q', v).value)}&country=${encodeURIComponent($('#co', v).value)}`);
      $('#res', v).innerHTML = items.length ? items.map((u) => `<${role === 'farmer' ? `a href="#/market?farmer=${u.id}"` : 'div'} class="item"><span class="em">${role === 'farmer' ? '🧑🏾‍🌾' : role === 'buyer' ? '🏪' : '🚚'}</span><span><b>${esc(u.business || u.name)} ${u.verified ? `<span style="color:var(--green)">${ic('shield', 14)}</span>` : ''}${u.demo ? ' <span class="pill example">Example</span>' : ''}</b>
        <small>${esc([u.town, u.region, u.country].filter(Boolean).join(', '))}${u.buyer_type ? ' · ' + esc(u.buyer_type) : ''}${u.vehicle ? ' · ' + esc(u.vehicle) + (u.cold ? ' (refrigerated)' : '') : ''}</small>${u.crops ? `<small>${role === 'buyer' ? 'Buys: ' : 'Grows: '}${esc(u.crops)}</small>` : ''}${u.routes ? `<small>Routes: ${esc(u.routes)}</small>` : ''}</span>
        <span class="r">${u.pro ? '<span class="pill green">Pro</span>' : ''}${stars(u.rating || u.t_rating)}<span class="muted small">${role === 'farmer' ? u.live + ' live listing' + (u.live === 1 ? '' : 's') : u.deals + ' deal' + (u.deals === 1 ? '' : 's')}</span></span></${role === 'farmer' ? 'a' : 'div'}>`).join('') : '<p class="empty">Nobody listed here yet.</p>';
    };
    let t; $('#q', v).oninput = () => { clearTimeout(t); t = setTimeout(load, 300); }; $('#co', v).onchange = load;
    await load();
  }

  /* ---------- auth ---------- */
  function join(v, Q) {
    if (ME) { location.hash = '#/'; return; }
    setTitle('Join');
    const role = Q.get('role') || 'farmer', plan = Q.get('plan') || 'free';
    v.innerHTML = page(`<div class="auth stack"><div class="ph" style="margin:0"><div><h1>Join FreeFarm</h1><p>Free to join. Use the mobile number people can reach you on.</p></div></div>
      <form class="card stack" id="jf" novalidate><div class="rolepick" role="radiogroup" aria-label="I want to">${[['farmer', '🧑🏾‍🌾', 'Sell produce', 'Farmer or grower'], ['buyer', '🛒', 'Buy produce', 'Home, shop, hotel, factory, exporter'], ['transporter', '🚚', 'Move produce', 'Truck or bakkie owner'], ['supplier', '🧪', 'Sell farm inputs', 'Seed, fertiliser, chemicals, feed, equipment']].map(([k, e, t, s]) => `<label><input type="radio" name="role" value="${k}" ${k === role ? 'checked' : ''}><span class="e">${e}</span><b>${t}</b><span class="muted small">${s}</span></label>`).join('')}</div>
        <div class="grid2"><label class="f">Your name<input name="name" autocomplete="name" required></label><label class="f">Mobile number<input name="phone" type="tel" autocomplete="tel" placeholder="077 123 4567" required></label></div>
        <label class="f"><span id="bl">Farm or business name (optional)</span><input name="business" autocomplete="organization"></label>
        <label class="f" id="bt">Type of buyer<select name="buyer_type">${opt(LK.buyer_types, 'Household')}</select></label>
        <div class="grid3"><label class="f">Country<select name="country">${opt(LK.countries, 'Zimbabwe')}</select></label><label class="f">Province / region${regionField('Zimbabwe', '')}</label><label class="f">Town<input name="town"></label></div>
        <label class="f" id="cr"><span id="crl">What do you grow?</span><input name="crops" placeholder="e.g. Tomatoes, maize, broilers"></label>
        <div class="grid2" id="tv"><label class="f">Vehicle<input name="vehicle" placeholder="e.g. 5-tonne truck"></label><label class="f">Load capacity (kg)<input name="capacity_kg" type="number" min="0"></label><label class="check"><input type="checkbox" name="cold"> Refrigerated</label></div>
        <label class="f">Email (optional)<input name="email" type="email" autocomplete="email"></label>
        <label class="f">Password<input name="password" type="password" autocomplete="new-password" minlength="8" required><span class="hint">8 or more characters</span></label>
        <div id="pl"></div>
        <p class="err" id="je" role="alert"></p><button class="btn wide">Create my account</button>
        <p class="muted small">Already a member? <a href="#/login">Sign in</a>. By joining you agree to trade honestly and pay FreeFarm's ${money(LK.fee)} fee per completed sale${LK.transport_fee ? ' or delivery' : ''}.</p></form></div>`);
    const f = $('#jf', v);
    const upd = () => {
      const r = f.elements.role.value;
      $('#bt', f).hidden = r !== 'buyer'; $('#tv', f).hidden = r !== 'transporter'; $('#cr', f).hidden = r === 'transporter';
      $('#crl', f).textContent = r === 'buyer' ? 'What do you usually buy?' : r === 'supplier' ? 'What do you sell?' : 'What do you grow?';
      $('#bl', f).textContent = r === 'farmer' ? 'Farm name (optional)' : r === 'buyer' ? 'Business name (optional for households)' : r === 'supplier' ? 'Shop or company name' : 'Company name (optional)';
      const pls = LK.plans[r];
      const cur = f.dataset.plan && pls.some((p) => p.id === f.dataset.plan) ? f.dataset.plan : (pls.some((p) => p.id === plan) ? plan : 'free');
      $('#pl', f).innerHTML = `<fieldset class="radios" style="border:0;padding:0;margin:0"><legend style="font-weight:600;font-size:14px;margin-bottom:6px">Plan</legend>${pls.map((p) => `<label class="radio"><input type="radio" name="plan" value="${p.id}" ${p.id === cur ? 'checked' : ''}><span><b>${esc(p.name)} · ${p.price ? money(p.price) + '/month' : 'Free'}</b><small>${esc(p.perks.slice(0, 2).join(' · '))}${p.price ? ` · first ${LK.trial_days} days free` : ''}</small></span></label>`).join('')}</fieldset>`;
    };
    f.addEventListener('change', (e) => { if (e.target.name === 'plan') f.dataset.plan = e.target.value; if (e.target.name === 'role') upd(); });
    upd();
    f.addEventListener('submit', (e) => { e.preventDefault(); const x = formData(f); x.cold = !!x.cold; busy(e.submitter, async () => { const r = await api('/auth/signup', x); ME = r.user; await afterLogin('Welcome to FreeFarm, ' + ME.name.split(' ')[0] + '!'); }, $('#je', v)); });
  }
  function login(v, Q) {
    if (ME) { location.hash = '#/'; return; }
    setTitle('Sign in');
    v.innerHTML = page(`<div class="auth stack" style="max-width:440px"><div class="ph" style="margin:0"><div><h1>Sign in</h1><p>Use your mobile number or email.</p></div></div>
      <form class="card stack" id="lf" novalidate><label class="f">Mobile number or email<input name="login" autocomplete="username" required></label><label class="f">Password<input name="password" type="password" autocomplete="current-password" required></label>
      <p class="err" id="le" role="alert"></p><button class="btn wide">Sign in</button><p class="muted small">New here? <a href="#/join">Join free</a>. Forgot your password? ${LK.support_whatsapp ? `<a href="${wa(LK.support_whatsapp, 'Hi FreeFarm, I forgot my password. My number is ')}" target="_blank" rel="noopener">Message FreeFarm support</a>` : 'Contact FreeFarm support'} to reset it.</p></form></div>`);
    $('#lf', v).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const r = await api('/auth/login', formData(e.target)); ME = r.user; await afterLogin(null, Q.get('next')); }, $('#le', v)); });
  }
  async function afterLogin(msg, next) {
    const me = await api('/me'); ME = me.user; BAL = me.balance; FOLLOWS = me.follows || [];
    if (msg) toast(msg);
    if (ME.must_change) return mustChange();
    shell(); location.hash = next ? '#/' + next : '#/'; route();
  }
  function mustChange() {
    shell();
    $('#v').innerHTML = page(`<div class="auth stack" style="max-width:440px"><div class="ph" style="margin:0"><div><h1>Choose your password</h1><p>You signed in with a temporary password. Pick one only you know.</p></div></div>
      <form class="card stack" id="pf"><label class="f">Temporary password<input name="current" type="password" autocomplete="current-password" required></label><label class="f">New password<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><p class="err" id="pe"></p><button class="btn wide">Save and continue</button></form></div>`);
    $('#pf').addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/me/password', formData(e.target)); ME.must_change = false; toast('Password saved'); render(); }, $('#pe')); });
  }
  async function logout() { try { await api('/auth/logout', {}); } catch (e) { /* ignore */ } ME = null; location.hash = '#/'; render(); }

  /* ---------- home dashboards ---------- */
  async function home(v) {
    setTitle('Home');
    const hi = `${new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, ${esc(ME.name.split(' ')[0])}`;
    const owe = BAL > 0 ? `<div class="banner ${BAL > LK.fee_limit ? 'bad' : 'warn'}" style="margin-bottom:14px">${ic('wallet')}<span style="flex:1">You owe ${money(BAL)} in FreeFarm fees.${BAL > LK.fee_limit ? ' Your account is paused for new sales until it is paid.' : ''}</span><a class="btn sm" href="#/billing">Pay now</a></div>` : '';
    const trial = ME.plan !== 'free' && ME.plan_until && ME.plan_until <= new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) ? `<div class="banner info" style="margin-bottom:14px">${ic('clock')}<span style="flex:1">Your plan ends on ${fdate(ME.plan_until)}.</span><a class="btn sm" href="#/billing">Renew</a></div>` : '';
    if (ME.role === 'supplier') {
      const [o, ls] = await Promise.all([api('/orders'), api('/listings?mine=1')]);
      const todo = o.items.filter((x) => ['placed', 'accepted', 'ready'].includes(x.status) && x.farmer_id === ME.id);
      v.innerHTML = page(owe + trial + ph(hi, 'Sell seed, fertiliser, chemicals, feed and equipment to farmers.', `<a class="btn" href="#/sell/new">${ic('plus', 16)} List a product</a>`) + `<div class="kpis"><a class="kpi ${todo.some((x) => x.status === 'placed') ? 'hot' : ''}" href="#/orders"><span>New orders</span><b>${todo.filter((x) => x.status === 'placed').length}</b></a><a class="kpi" href="#/sell"><span>Live products</span><b>${ls.items.filter((l) => l.status === 'active').length}</b></a><a class="kpi" href="#/orders"><span>Completed sales</span><b>${o.items.filter((x) => x.status === 'completed' && x.farmer_id === ME.id).length}</b></a><a class="kpi" href="#/billing"><span>Plan</span><b style="font-size:20px">${ME.plan === 'free' ? 'Starter' : 'Supplier Pro'}</b></a></div>
        <div class="card stack" style="margin-top:18px"><div class="between"><h2>Orders to handle</h2><a href="#/orders">All orders</a></div>${todo.length ? `<div class="list">${todo.map(orderItem).join('')}</div>` : '<p class="muted">No orders waiting. Farmers are pointed to your products when their crops need inputs.</p>'}</div>`);
      return;
    }
    if (ME.role === 'farmer') {
      const [o, ls, rq] = await Promise.all([api('/orders'), api('/listings?mine=1'), api('/requests?country=' + encodeURIComponent(ME.country))]);
      const todo = o.items.filter((x) => ['placed', 'accepted', 'ready'].includes(x.status));
      const live = ls.items.filter((l) => l.status === 'active');
      const soon = live.filter((l) => l.kind === 'now' && l.days_left != null && l.days_left <= 3);
      const month = new Date().toISOString().slice(0, 7);
      const earned = o.items.filter((x) => x.status === 'completed' && (x.completed_at || '').startsWith(month)).reduce((a, x) => a + x.total, 0);
      const mycrops = new Set(ls.items.map((l) => l.crop));
      const wanted = rq.items.filter((r) => mycrops.has(r.crop) || (ME.crops || '').toLowerCase().includes(r.crop.toLowerCase().split(' ')[0]));
      v.innerHTML = page(owe + trial + ph(hi, 'Here is what needs you today.', `<a class="btn" href="#/sell/new">${ic('plus', 16)} List produce</a>`) + `
        <div class="kpis"><a class="kpi ${o.items.some((x) => x.status === 'placed') ? 'hot' : ''}" href="#/orders"><span>New orders</span><b>${o.items.filter((x) => x.status === 'placed').length}</b><small>Waiting for you to accept</small></a><a class="kpi" href="#/sell"><span>Live listings</span><b>${live.length}</b><small>${ME.plan === 'free' ? 'of 3 on Starter' : 'Farmer Pro'}</small></a><a class="kpi" href="#/orders"><span>Sold this month</span><b>${money(earned)}</b><small>Completed orders</small></a><a class="kpi ${wanted.length ? 'hot' : ''}" href="#/requests"><span>Buyers want your crops</span><b>${wanted.length}</b><small>Open requests</small></a></div>
        ${soon.length ? `<div class="banner warn" style="margin-top:16px">${ic('clock')}<span style="flex:1">${soon.length} listing${soon.length > 1 ? 's' : ''} must sell within 3 days. ${soon.some((l) => !l.rescue_pct) ? 'Add a rescue discount so buyers grab it before it spoils.' : 'Your rescue discount is showing to buyers.'}</span><a class="btn sm" href="#/sell/${soon[0].id}">Update</a></div>` : ''}
        <div class="grid2" style="margin-top:18px"><div class="card stack"><div class="between"><h2>Orders to handle</h2><a href="#/orders">All orders</a></div>${todo.length ? `<div class="list">${todo.slice(0, 6).map(orderItem).join('')}</div>` : '<p class="muted">No orders waiting. Keep your listings fresh and answer buyer requests to get more.</p>'}</div>
        <div class="card stack"><div class="between"><h2>Buyers looking for your crops</h2><a href="#/requests">All requests</a></div>${wanted.length ? `<div class="list">${wanted.slice(0, 5).map(reqCard).join('')}</div>` : `<p class="muted">Nothing matching right now. We alert you as soon as a buyer posts.</p><a class="btn ghost sm" href="#/account">Choose crops to be alerted about</a>`}</div></div>`);
    } else if (ME.role === 'buyer') {
      const [o, rescue, rq] = await Promise.all([api('/orders'), api('/listings?kind=rescue&country=' + encodeURIComponent(ME.country)), api('/requests?mine=1')]);
      const active = o.items.filter((x) => !['completed', 'cancelled', 'declined'].includes(x.status));
      const confirm = o.items.filter((x) => x.status === 'delivered');
      v.innerHTML = page(owe + trial + ph(hi, 'Fresh from the farm, at farm prices.', `<a class="btn" href="#/market">${ic('shop', 16)} Shop the market</a><button class="btn ghost" id="nr">${ic('plus', 16)} Post a request</button>`) + `
        ${confirm.length ? `<div class="banner info" style="margin-bottom:14px">${ic('box')}<span style="flex:1">${confirm.length} order${confirm.length > 1 ? 's were' : ' was'} delivered. Please confirm you received ${confirm.length > 1 ? 'them' : 'it'}.</span><a class="btn sm" href="#/order/${confirm[0].id}">Confirm</a></div>` : ''}
        <div class="kpis"><a class="kpi" href="#/orders"><span>Active orders</span><b>${active.length}</b></a><a class="kpi" href="#/requests?mine=1"><span>Open requests</span><b>${rq.items.filter((r) => r.status === 'open').length}</b></a><a class="kpi ${rq.items.some((r) => r.offers) ? 'hot' : ''}" href="#/requests?mine=1"><span>Offers received</span><b>${rq.items.reduce((a, r) => a + r.offers, 0)}</b></a><a class="kpi ${rescue.items.length ? 'hot' : ''}" href="#/market?kind=rescue"><span>Rescue deals near you</span><b>${rescue.items.length}</b></a></div>
        <h2 style="margin:22px 0 12px">⏳ Rescue deals: help stop food waste</h2>${grid(rescue.items.slice(0, 8), 'No rescue deals right now. Follow crops in your account to be alerted.')}
        <div class="card stack" style="margin-top:20px"><div class="between"><h2>Your orders</h2><a href="#/orders">All orders</a></div>${active.length ? `<div class="list">${active.slice(0, 6).map(orderItem).join('')}</div>` : '<p class="muted">No active orders. <a href="#/market">Browse the market</a>.</p>'}</div>`);
      $('#nr', v).onclick = () => requestDlg({}, () => { location.hash = '#/requests?mine=1'; });
    } else {
      const [open, mine] = await Promise.all([api('/jobs?scope=open&country=' + encodeURIComponent(ME.country)), api('/jobs')]);
      const trips = mine.items.filter((j) => j.transporter_id === ME.id && ['assigned', 'picked'].includes(j.status));
      const near = open.items.filter((j) => !ME.region || [j.from_region, j.to_region].includes(ME.region) || (ME.routes || '').includes(j.from_region || '#'));
      v.innerHTML = page(owe + trial + ph(hi, 'Loads waiting for a truck.', `<a class="btn" href="#/loads">${ic('truck', 16)} See all loads</a>`) + `
        <div class="kpis"><a class="kpi hot" href="#/loads"><span>Open loads</span><b>${open.items.length}</b></a><a class="kpi" href="#/loads"><span>On your routes</span><b>${near.length}</b></a><a class="kpi" href="#/orders"><span>Trips to do</span><b>${trips.length}</b></a><a class="kpi" href="#/billing"><span>Plan</span><b style="font-size:20px">${ME.plan === 'free' ? 'Starter' : 'Pro'}</b><small>${ME.plan === 'free' ? '3 bids a month' : 'Unlimited bids'}</small></a></div>
        <div class="grid2" style="margin-top:18px"><div class="card stack"><h2>Trips to do</h2>${trips.length ? `<div class="list">${trips.map(jobItem).join('')}</div>` : '<p class="muted">No trips booked yet. Send prices on open loads.</p>'}</div>
        <div class="card stack"><div class="between"><h2>Loads on your routes</h2><a href="#/loads">All loads</a></div>${near.length ? `<div class="list">${near.slice(0, 6).map(jobItem).join('')}</div>` : '<p class="muted">Nothing on your routes right now. Add your routes in your account so we match you.</p>'}</div></div>`);
    }
  }
  function more(v) {
    setTitle('More');
    const n = navFor().top.filter(([h]) => !navFor().tab.some(([t]) => t === h));
    const extra = [...n, ...(ME.role !== 'admin' ? [['#/billing', 'Plan & billing']] : []), ['#/account', 'My account'], ['#/prices', 'Market prices'], ['#/directory', 'Directory'], ['#/pricing', 'Plans and fees']].filter((x, i, a) => a.findIndex((y) => y[0] === x[0]) === i);
    v.innerHTML = page(`<h1 style="margin-bottom:14px">More</h1><div class="list">${extra.map(([h, l]) => `<a class="item" href="${h}"><span class="em">${ic('box', 20)}</span><b>${l}</b><span></span></a>`).join('')}<button class="btn ghost" id="lo">${ic('out', 16)} Sign out</button></div>`);
    $('#lo', v).onclick = logout;
  }

  /* ---------- farmer: my produce ---------- */
  async function sell(v) {
    if (!['farmer', 'supplier', 'admin'].includes(ME.role)) throw new Error('Only farmers and suppliers list products.');
    setTitle('My produce');
    const { items } = await api('/listings?mine=1');
    const by = (s) => items.filter((l) => s.includes(l.status));
    const row = (l) => `<div class="item"><span class="em">${emo(l.crop)}</span><span><b>${esc(l.crop)}${l.variety ? ' · ' + esc(l.variety) : ''} ${l.kind === 'preharvest' ? pill('Pre-harvest', 'blue') : ''} ${l.rescue ? pill('Rescue −' + l.rescue_pct + '%', 'red') : ''}</b>
      <small>${qn(l.qty)} ${esc(l.unit)} at ${money(l.price)} · ${l.views} views${l.best_before ? ' · sell by ' + fdate(l.best_before) : ''}</small></span>
      <span class="r">${pill({ active: 'Live', paused: 'Hidden', sold: 'Sold out', expired: 'Expired' }[l.status] || l.status, l.status === 'active' ? 'green' : '')}<span class="row" style="gap:6px"><a class="btn ghost sm" href="#/sell/${l.id}">Edit</a>${l.status === 'active' ? `<button class="btn ghost sm" data-st="paused" data-id="${l.id}">Hide</button>` : `<button class="btn ghost sm" data-st="active" data-id="${l.id}">Show</button>`}<a class="btn ghost sm" href="#/listing/${l.id}">View</a></span></span></div>`;
    v.innerHTML = page(ph('My produce', ME.plan === 'free' ? `Starter: up to 3 live listings. <a href="#/billing">Farmer Pro</a> gives unlimited listings and pre-harvest sales.` : 'Keep quantities and sell-by dates up to date so buyers trust what they see.', `<a class="btn" href="#/sell/new">${ic('plus', 16)} List produce</a>`) +
      `<h2 style="margin-bottom:10px">Live (${by(['active']).length})</h2><div class="list">${by(['active']).map(row).join('') || '<p class="empty">Nothing live. <a href="#/sell/new">List your first produce.</a></p>'}</div>
      ${by(['paused', 'sold', 'expired']).length ? `<h2 style="margin:24px 0 10px">Not showing</h2><div class="list">${by(['paused', 'sold', 'expired']).map(row).join('')}</div>` : ''}`);
    $$('[data-st]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/listings/${b.dataset.id}/status`, { to: b.dataset.st }); route(); }));
  }
  async function sellForm(v, id) {
    const HQ = new URLSearchParams((location.hash.split('?')[1]) || '');
    let l = id === 'new' ? { kind: 'now', unit: 'kg', delivery: 'pickup', country: ME.country, region: ME.region, town: ME.town, min_order: 1, rescue_pct: 0 } : (await api('/listings/' + id)).item;
    const fromPl = id === 'new' && HQ.get('planting') ? (await api('/farm/plantings/' + HQ.get('planting')).catch(() => null)) : null;
    if (fromPl) { const p = fromPl.item; const ready = p.st.days_left > 3; l = { ...l, crop: p.crop, variety: p.variety, kind: ready && ME.plan !== 'free' ? 'preharvest' : 'now', available_from: ready ? p.expected_harvest : null, qty: Math.max(1, (p.expected_yield || 0) - (p.harvested_qty || 0)) || '', unit: p.yield_unit && LK.units[p.yield_unit] ? p.yield_unit : 'kg', unit_kg: LK.units[p.yield_unit] || 1, planting_id: p.id }; }
    setTitle(id === 'new' ? 'List produce' : 'Edit ' + l.crop);
    const pro = (ME.plan !== 'free' || ME.role === 'admin') && ME.role !== 'supplier';
    v.innerHTML = page(`<p style="margin-bottom:12px"><a href="#/sell">← My produce</a></p>` + ph(id === 'new' ? 'List produce' : 'Edit listing', 'Good photos and honest grades sell faster.') + `
      <form class="card stack" id="sf" style="max-width:860px">
        <div class="radios" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label class="radio"><input type="radio" name="kind" value="now" ${l.kind === 'now' ? 'checked' : ''}><span><b>Ready now</b><small>Harvested or ready to harvest</small></span></label><label class="radio"><input type="radio" name="kind" value="preharvest" ${l.kind === 'preharvest' ? 'checked' : ''} ${pro ? '' : 'disabled'}><span><b>Pre-harvest ${pro ? '' : '· Pro'}</b><small>Sell before you harvest</small></span></label></div>
        <div class="grid3"><label class="f">Produce<select name="crop" required>${(ME.role === 'supplier' ? `<option value="">Choose…</option><optgroup label="Farm inputs">${LK.crops['Farm inputs'].map((c) => `<option${c === l.crop ? ' selected' : ''}>${esc(c)}</option>`).join('')}</optgroup>` : cropOpts(l.crop, 'Choose…'))}</select></label><label class="f">${ME.role === 'supplier' ? 'Product name / brand' : 'Variety (optional)'}<input name="variety" value="${esc(l.variety || '')}" placeholder="e.g. Hass, Star 9037"></label><label class="f">Grade<select name="grade">${opt(['A', 'B', 'C', 'Mixed'], l.grade, 'Not graded')}</select></label></div>
        <div class="grid3"><label class="f">Quantity available<input name="qty" type="number" step="any" min="0" required value="${esc(l.qty ?? '')}"></label><label class="f">Sold per<select name="unit" id="un">${opt(Object.keys(LK.units), l.unit)}</select></label><label class="f">Weight of 1 unit (kg)<input name="unit_kg" type="number" step="any" min="0" value="${esc(l.unit_kg || LK.units[l.unit] || 1)}"><span class="hint">Used for price per kg</span></label></div>
        <div class="grid3"><label class="f">Price per unit (${esc(LK.currency)})<input name="price" type="number" step="any" min="0" required value="${esc(l.price ?? '')}"><span class="hint" id="ps"></span></label><label class="f">Minimum order (units)<input name="min_order" type="number" step="any" min="0" value="${esc(l.min_order)}"></label><label class="f">Delivery<select name="delivery">${opt([['pickup', 'Buyer collects'], ['farmer', 'I deliver'], ['both', 'Either']], l.delivery)}</select></label></div>
        <div class="grid3"><label class="f" id="hf">Expected harvest date<input name="available_from" type="date" value="${esc(l.available_from || '')}" min="${today()}"></label><label class="f" id="bbf">Sell by (best before)<input name="best_before" type="date" value="${esc(l.best_before || '')}" min="${today()}"><span class="hint">When it starts to spoil</span></label><label class="f" id="rsf">Rescue discount<select name="rescue_pct">${opt([[0, 'None'], [10, '10% off'], [20, '20% off'], [30, '30% off'], [40, '40% off'], [50, '50% off']], l.rescue_pct)}</select><span class="hint">Applies automatically in the last 3 days</span></label></div>
        <div class="grid3"><label class="f">Country<select name="country">${opt(LK.countries, l.country)}</select></label><label class="f">Province / region${regionField(l.country, l.region)}</label><label class="f">Town / area<input name="town" value="${esc(l.town || '')}"></label></div>
        <div class="row"><label class="check"><input type="checkbox" name="organic" ${l.organic ? 'checked' : ''}> Organic / no chemicals</label><label class="check"><input type="checkbox" name="export_ready" ${l.export_ready ? 'checked' : ''}> Export grade (graded, packed, certified)</label></div>
        <label class="f">Description<textarea name="notes" rows="3" maxlength="800" placeholder="Size, freshness, packaging, harvest day">${esc(l.notes || '')}</textarea></label>
        <label class="f">Photo<input type="file" id="pi" accept="image/*"><span class="hint">A real photo of your produce. Listings with photos sell faster.</span></label><div id="pp">${l.has_photo ? `<img src="/api/photo/${l.id}" alt="" style="max-height:140px;border-radius:12px">` : ''}</div>
        <p class="err" id="se"></p><div class="row"><button class="btn">${ic('check', 16)} ${id === 'new' ? 'Publish listing' : 'Save changes'}</button>${id !== 'new' ? `<button class="btn ghost" type="button" id="rm">Remove listing</button>` : ''}</div></form>`);
    const f = $('#sf', v);
    let ph64;
    const kind = () => { const k = f.elements.kind.value; $('#hf', f).hidden = k !== 'preharvest'; $('#rsf', f).hidden = k === 'preharvest'; };
    f.addEventListener('change', (e) => { if (e.target.name === 'kind') kind(); if (e.target.id === 'un') f.elements.unit_kg.value = LK.units[e.target.value] || 1; if (['crop', 'unit', 'unit_kg', 'country', 'region'].includes(e.target.name) || e.target.id === 'un') hint(); });
    kind();
    const hint = async () => {
      const crop = f.elements.crop.value; if (!crop) return;
      try { const { items } = await api(`/prices?country=${encodeURIComponent(f.elements.country.value)}`); const p = items.find((x) => x.crop === crop); const kg = Number(f.elements.unit_kg.value) || 1; $('#ps', f).textContent = p ? `Market average ${money(p.avg * kg)} per ${f.elements.unit.value} (${money(p.avg)}/kg)` : ''; } catch (e) { /* optional */ }
    };
    hint();
    $('#pi', f).onchange = async (e) => { const file = e.target.files[0]; if (!file) return; try { ph64 = await resizeImage(file, 1000); $('#pp', f).innerHTML = `<img src="${ph64}" alt="" style="max-height:140px;border-radius:12px">`; } catch (er) { toast(er.message, true); } };
    if ($('#rm', f)) $('#rm', f).onclick = (e) => busy(e.currentTarget, async () => { await api(`/listings/${id}/status`, { to: 'removed' }); toast('Listing removed'); location.hash = '#/sell'; });
    f.addEventListener('submit', (e) => {
      e.preventDefault(); const x = formData(f); x.organic = !!x.organic; x.export_ready = !!x.export_ready; if (id !== 'new') x.id = Number(id); if (ph64) x.photo = ph64; if (l.planting_id) x.planting_id = l.planting_id;
      if (x.kind === 'preharvest') x.best_before = '';
      busy(e.submitter, async () => {
        let r;
        try { r = await api('/listings', x); } catch (er) {
          if (er.status !== 409) throw er;
          if (!confirm(er.message + '\n\nOnly list it as ready now if the produce will not be harvested before that date. Continue?')) return;
          r = await api('/listings', { ...x, confirm_withholding: true });
        }
        toast(id === 'new' ? (r.matched ? `Published. ${r.matched} interested buyer${r.matched > 1 ? 's were' : ' was'} alerted.` : 'Published on the market') : 'Saved'); location.hash = '#/listing/' + r.id; }, $('#se', v));
    });
  }

  /* ---------- orders ---------- */
  function orderItem(o) {
    const other = ME.id === o.farmer_id ? (o.buyer_business || o.buyer) : (o.farm || o.farmer);
    return `<a class="item" href="#/order/${o.id}"><span class="em">${emo(o.crop)}</span><span><b>${esc(o.crop)} · ${qn(o.qty)} ${esc(o.unit)}</b><small>${esc(o.number)} · ${ME.id === o.farmer_id ? 'to' : 'from'} ${esc(other)} · ${ago(o.created_at)}</small></span><span class="r">${op(o.status)}<b>${money(o.total)}</b></span></a>`;
  }
  function jobItem(j) {
    return `<a class="item" href="#/load/${j.id}"><span class="em">${j.cold ? '❄️' : '🚚'}</span><span><b>${esc(j.load)}</b><small>${esc(j.from_place)} → ${esc(j.to_place)}${j.weight_kg ? ' · ' + qn(j.weight_kg) + ' kg' : ''}${j.pickup_date ? ' · ' + fdate(j.pickup_date) : ''}${j.demo ? ' · Example' : ''}</small></span><span class="r">${jp(j.status)}<span class="muted small">${j.price ? money(j.price) : j.my_bid ? 'Your price ' + money(j.my_bid) : j.bids ? j.bids + ' price' + (j.bids > 1 ? 's' : '') + (j.best ? ', from ' + money(j.best) : '') : j.budget ? 'Budget ' + money(j.budget) : 'No prices yet'}</span></span></a>`;
  }
  async function orders(v, Q) {
    setTitle(ME.role === 'transporter' ? 'My trips' : 'Orders');
    if (ME.role === 'transporter') {
      const { items } = await api('/jobs');
      const mine = items.filter((j) => j.transporter_id === ME.id), bids = items.filter((j) => j.transporter_id !== ME.id);
      v.innerHTML = page(ph('My trips', 'Loads you won and prices you sent.') + `<h2 style="margin-bottom:10px">Trips</h2><div class="list">${mine.map(jobItem).join('') || '<p class="empty">No trips yet. <a href="#/loads">Find loads</a>.</p>'}</div><h2 style="margin:22px 0 10px">Prices sent</h2><div class="list">${bids.map(jobItem).join('') || '<p class="muted">None.</p>'}</div>`);
      return;
    }
    const { items } = await api('/orders');
    const tab = Q.get('tab') || 'active';
    const act = items.filter((o) => ['placed', 'accepted', 'ready', 'on_the_way', 'delivered', 'disputed'].includes(o.status));
    const list = tab === 'active' ? act : items.filter((o) => !act.includes(o));
    v.innerHTML = page(ph(ME.role === 'farmer' ? 'Orders' : ME.role === 'admin' ? 'All orders' : 'My orders', ME.role === 'farmer' ? 'Accept new orders quickly. Buyers choose farmers who answer fast.' : '') +
      `<nav class="tabs"><a href="#/orders?tab=active" aria-current="${tab === 'active'}">Active (${act.length})</a><a href="#/orders?tab=done" aria-current="${tab !== 'active'}">Finished (${items.length - act.length})</a></nav><div class="list">${list.map(orderItem).join('') || `<p class="empty">No orders here. ${ME.role === 'buyer' ? '<a href="#/market">Shop the market</a>.' : ''}</p>`}</div>`);
  }
  async function orderView(v, id) {
    const { item: o, messages } = await api('/orders/' + id);
    setTitle(o.number);
    const as = ME.role === 'admin' ? 'admin' : ME.id === o.farmer_id ? 'farmer' : ME.id === o.buyer_id ? 'buyer' : 'transporter';
    const flow = ['placed', 'accepted', 'ready', 'on_the_way', 'delivered', 'completed'];
    const at = flow.indexOf(o.status);
    const steps = at >= 0 ? `<div class="steps">${flow.map((s, i) => `<div class="${i < at || o.status === 'completed' ? 'done' : ''} ${i === at ? 'now done' : ''}">${OST[s][0]}</div>`).join('')}</div>` : `<div class="banner bad">${ic('alert')}<span>${OST[o.status][0]}${o.cancel_reason ? ': ' + esc(o.cancel_reason) : ''}</span></div>`;
    const acts = [];
    const A = (to, label, cls, ask) => acts.push(`<button class="btn ${cls || ''}" data-to="${to}" ${ask ? 'data-ask="1"' : ''}>${label}</button>`);
    if (as === 'farmer') {
      if (o.status === 'placed') { A('accepted', `${ic('check', 16)} Accept order`); A('declined', 'Decline', 'ghost', 1); }
      if (o.status === 'accepted') A('ready', 'Packed and ready');
      if (['accepted', 'ready'].includes(o.status) && o.delivery !== 'transport') A('on_the_way', o.delivery === 'pickup' ? 'Buyer collected' : 'On the way', 'ghost');
      if (['accepted', 'ready', 'on_the_way'].includes(o.status) && o.delivery !== 'transport') A('delivered', 'Delivered', 'ghost');
      if (['accepted', 'ready'].includes(o.status)) A('cancelled', 'Cancel', 'ghost', 1);
    }
    if (as === 'buyer') {
      if (['accepted', 'ready', 'on_the_way', 'delivered'].includes(o.status)) A('completed', `${ic('check', 16)} I received it`);
      if (o.status === 'placed' || ['accepted', 'ready'].includes(o.status)) A('cancelled', 'Cancel order', 'ghost', 1);
      if (['delivered', 'completed'].includes(o.status)) A('disputed', 'Report a problem', 'ghost', 1);
    }
    if (as === 'admin' && o.status === 'disputed') { A('completed', 'Resolve: complete'); A('cancelled', 'Resolve: cancel', 'ghost', 1); }
    const other = as === 'farmer' ? { n: o.buyer_business || o.buyer, p: o.buyer_phone, r: 'Buyer' } : { n: o.farm || o.farmer, p: o.farmer_phone, r: 'Farmer' };
    v.innerHTML = page(`<p style="margin-bottom:12px"><a href="#/orders">← Orders</a></p><div class="detail"><div class="stack">
      <div class="card stack"><div class="between"><div><span class="muted small">${esc(o.number)} · ${fdate(o.created_at)}</span><h1 style="font-size:clamp(24px,4vw,32px)">${emo(o.crop)} ${qn(o.qty)} ${esc(o.unit)} ${esc(o.crop)}</h1></div>${op(o.status)}</div>${steps}
        <div class="facts"><div><span>Price</span><b>${money(o.price)} / ${esc(o.unit)}${o.rescue ? ' ' + pill('Rescue', 'red') : ''}</b></div><div><span>Total to farmer</span><b>${money(o.total)} ${o.paid ? pill('Paid', 'green') : ''}</b></div>
          <div><span>Delivery</span><b>${{ pickup: 'Buyer collects', farmer: 'Farmer delivers', transport: 'Transporter' }[o.delivery]}</b></div><div><span>Pay with</span><b>${esc(o.payment)}</b></div>
          ${o.address ? `<div><span>Deliver to</span><b>${esc(o.address)}</b></div>` : ''}<div><span>Collect from</span><b>${esc([o.farm_town, o.farm_region].filter(Boolean).join(', '))}</b></div>
          ${o.needed_by ? `<div><span>Needed by</span><b>${fdate(o.needed_by)}</b></div>` : ''}<div><span>${as === 'farmer' ? 'Buyer' : 'Farmer'}</span><b>${esc(other.n)}</b></div></div>
        ${o.note ? `<p class="muted">Note: ${esc(o.note)}</p>` : ''}
        ${acts.length ? `<div class="row">${acts.join('')}</div>` : ''}
        ${as === 'farmer' && !o.paid && !['placed', 'declined', 'cancelled'].includes(o.status) ? `<button class="link" id="pd">Mark payment received</button>` : ''}
        ${as === 'farmer' && o.status === 'placed' ? `<p class="hint">FreeFarm's fee of ${money(LK.fee)} applies only when the buyer confirms they received the order.</p>` : ''}</div>
      ${o.delivery === 'transport' ? `<div class="card stack"><h2>${ic('truck')} Transport</h2>${o.job_id ? `<p>${jp(o.job_status)} ${o.transporter ? 'with <b>' + esc(o.transporter) + '</b>' : ''}${o.job_price ? ' · ' + money(o.job_price) : ''}</p><a class="btn ghost" href="#/load/${o.job_id}">${as === 'buyer' && o.job_status === 'open' ? 'See prices and choose a transporter' : 'Open transport'}</a>` : '<p class="muted">A transport load is created when the farmer accepts.</p>'}</div>` : ''}
      ${as === 'buyer' && o.status === 'completed' && !o.rating ? `<div class="card stack"><h2>Rate ${esc(o.farm || o.farmer)}</h2><form class="stack" id="rt"><div class="row" role="radiogroup" aria-label="Stars">${[1, 2, 3, 4, 5].map((n) => `<label class="chip"><input type="radio" name="rating" value="${n}" style="position:absolute;opacity:0" ${n === 5 ? 'checked' : ''}>${'★'.repeat(n)}</label>`).join('')}</div><input name="review" maxlength="400" placeholder="How was the produce and service?"><button class="btn">Send rating</button></form></div>` : ''}
      ${o.rating ? `<div class="card"><span class="stars">${'★'.repeat(o.rating)}</span> ${o.review ? esc(o.review) : ''}</div>` : ''}</div>
      <div class="sticky stack"><div class="card stack"><h2>Contact</h2>${other.p ? `<div class="contact"><a class="btn ghost sm" href="tel:${esc(other.p)}">${ic('phone', 15)} Call ${esc(other.r.toLowerCase())}</a><a class="btn ghost sm" href="${wa(other.p, `Hi, about FreeFarm order ${o.number} (${o.crop})`)}" target="_blank" rel="noopener">WhatsApp</a></div><p class="muted small">${esc(other.n)} · ${esc(other.p)}</p>` : '<p class="muted small">Phone numbers are shared once the farmer accepts. Use the chat below until then.</p>'}
        ${o.transporter_phone && as !== 'transporter' ? `<div class="contact"><a class="btn ghost sm" href="tel:${esc(o.transporter_phone)}">${ic('truck', 15)} Call transporter</a></div>` : ''}</div>
        <div class="card stack"><h2>Messages</h2><div class="chat" id="ch">${messages.length ? messages.map((m) => `<div class="msg ${m.user_id === ME.id ? 'me' : ''}">${esc(m.text)}<small>${m.user_id === ME.id ? 'You' : esc(m.name.split(' ')[0]) + ' · ' + ROLE[m.role]} · ${ago(m.created_at)}</small></div>`).join('') : '<p class="muted small">No messages yet.</p>'}</div>
        <form class="row" id="mf" style="flex-wrap:nowrap"><input name="text" maxlength="1000" placeholder="Type a message" aria-label="Message" autocomplete="off"><button class="btn" aria-label="Send">${ic('send', 16)}</button></form></div></div></div>`);
    const ch = $('#ch', v); ch.scrollTop = ch.scrollHeight;
    $$('[data-to]', v).forEach((b) => b.onclick = () => {
      const to = b.dataset.to;
      if (b.dataset.ask) return dlg(`${head({ declined: 'Decline order', cancelled: 'Cancel order', disputed: 'Report a problem' }[to] || 'Reason')}<form class="stack" id="rf"><label class="f">Reason<textarea name="reason" rows="3" required maxlength="300"></textarea></label><p class="err" id="ree"></p><div class="row"><button class="btn red">Confirm</button><button class="btn ghost" type="button" data-close>Back</button></div></form>`, (d) => {
        $('#rf', d).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/orders/${o.id}/status`, { to, reason: e.target.elements.reason.value }); d.close(); toast('Done'); route(); }, $('#ree', d)); });
      });
      busy(b, async () => { await api(`/orders/${o.id}/status`, { to }); toast({ accepted: 'Order accepted. The buyer has been told.', completed: 'Thank you! Order completed.' }[to] || 'Updated'); route(); });
    });
    if ($('#pd', v)) $('#pd', v).onclick = (e) => busy(e.currentTarget, async () => { await api(`/orders/${o.id}/paid`, {}); route(); });
    if ($('#rt', v)) $('#rt', v).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/orders/${o.id}/rate`, formData(e.target)); toast('Thanks for rating'); route(); }); });
    $('#mf', v).addEventListener('submit', (e) => { e.preventDefault(); const t = e.target.elements.text.value.trim(); if (!t) return; busy(e.submitter, async () => { await api(`/orders/${o.id}/message`, { text: t }); route(); }); });
  }

  /* ---------- transport ---------- */
  async function loads(v, Q) {
    setTitle('Transport');
    const isT = ME && ME.role === 'transporter';
    if (!ME) {
      v.innerHTML = page(ph('Transport', 'Every order on FreeFarm can book a truck. Transporters see loads, send a price and get chosen.') + `<div class="grid2"><div class="card stack"><h2>🚚 Own a truck or bakkie?</h2><p class="muted">Get loads from farms near you, including refrigerated loads, and fill your return trips.</p><a class="btn" href="#/join?role=transporter">Join as a transporter</a></div><div class="card stack"><h2>Need something moved?</h2><p class="muted">Farmers and buyers book transport on any order, or post a load on its own.</p><a class="btn ghost" href="#/join">Join free</a></div></div>`);
      return;
    }
    if (isT) {
      const region = Q.get('region') || '', cold = Q.get('cold');
      const { items } = await api(`/jobs?scope=open&country=${encodeURIComponent(ME.country)}${region ? '&region=' + encodeURIComponent(region) : ''}`);
      const list = cold ? items.filter((j) => j.cold) : items;
      v.innerHTML = page(ph('Loads', 'Open loads waiting for a price. The customer picks the transporter; your rating and price both count.') +
        `<div class="filters" style="grid-template-columns:repeat(2,minmax(0,1fr))"><select id="rg" aria-label="Province">${opt(LK.regions[ME.country] || [], region, 'All provinces')}</select><label class="check" style="align-self:center"><input type="checkbox" id="cd" ${cold ? 'checked' : ''}> Refrigerated loads only</label></div><div class="list">${list.map(jobItem).join('') || '<p class="empty">No open loads right now. We alert you when one is posted.</p>'}</div>`);
      $('#rg', v).onchange = (e) => { location.hash = '#/loads?region=' + encodeURIComponent(e.target.value) + (cold ? '&cold=1' : ''); };
      $('#cd', v).onchange = (e) => { location.hash = '#/loads?region=' + encodeURIComponent(region) + (e.target.checked ? '&cold=1' : ''); };
      return;
    }
    const { items } = await api('/jobs');
    v.innerHTML = page(ph('Transport', 'Your transport bookings. Loads for orders are created automatically when you choose "Book a transporter".', ME.role !== 'admin' ? `<button class="btn" id="nj">${ic('plus', 16)} Book transport</button>` : '') + `<div class="list">${items.map(jobItem).join('') || '<p class="empty">No transport booked yet.</p>'}</div>`);
    if ($('#nj', v)) $('#nj', v).onclick = () => dlg(`${head('Book transport', 'Transporters on the route get an alert and send prices.')}<form class="stack" id="jf">
      <label class="f">What needs moving<input name="load" required maxlength="160" placeholder="e.g. 2 tonnes butternut in pockets"></label>
      <div class="grid2"><label class="f">Weight (kg)<input name="weight_kg" type="number" min="0" step="any"></label><label class="f">Pickup date<input name="pickup_date" type="date" min="${today()}"></label></div>
      <div class="grid2"><label class="f">From<input name="from_place" required value="${esc([ME.town, ME.region].filter(Boolean).join(', '))}"></label><label class="f">From province${regionField(ME.country, ME.region, 'from_region')}</label></div>
      <div class="grid2"><label class="f">To<input name="to_place" required placeholder="e.g. Mbare Musika, Harare"></label><label class="f">To province<input name="to_region" list="rg"></label></div>
      <div class="grid2"><label class="f">Budget (optional)<input name="budget" type="number" min="0" step="any"></label><label class="check" style="align-self:end"><input type="checkbox" name="cold"> Needs a refrigerated truck</label></div>
      <p class="err" id="je"></p><div class="row"><button class="btn">${ic('send', 16)} Post load</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      $('#jf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.cold = !!x.cold; x.country = ME.country; busy(e.submitter, async () => { const r = await api('/jobs', x); d.close(); toast('Load posted. Transporters have been alerted.'); location.hash = '#/load/' + r.id; }, $('#je', d)); });
    });
  }
  async function loadView(v, id) {
    const { item: j, bids, party, assigned, messages } = await api('/jobs/' + id);
    setTitle('Load');
    const isT = ME.role === 'transporter';
    const myBid = bids.find((b) => b.transporter_id === ME.id && b.status === 'pending');
    v.innerHTML = page(`<p style="margin-bottom:12px"><a href="${isT ? '#/loads' : '#/loads?mine=1'}">← Transport</a></p><div class="detail"><div class="stack"><div class="card stack">
      <div class="between"><h1 style="font-size:clamp(22px,3.6vw,30px)">${j.cold ? '❄️' : '🚚'} ${esc(j.load)}</h1>${jp(j.status)}</div>
      <div class="facts"><div><span>From</span><b>${esc(j.from_place)}</b></div><div><span>To</span><b>${esc(j.to_place)}</b></div><div><span>Weight</span><b>${j.weight_kg ? qn(j.weight_kg) + ' kg' : 'Not given'}</b></div><div><span>Pickup</span><b>${j.pickup_date ? fdate(j.pickup_date) : 'Flexible'}</b></div>
        <div><span>Truck</span><b>${j.cold ? 'Refrigerated needed' : 'Any'}</b></div><div><span>${j.price ? 'Agreed price' : 'Budget'}</span><b>${j.price ? money(j.price) : j.budget ? money(j.budget) : 'Open'}</b></div>
        <div><span>Customer</span><b>${esc(j.business || j.customer)}</b></div>${j.order_number ? `<div><span>Order</span><b>${party ? `<a href="#/order/${j.order_id}">${esc(j.order_number)}</a>` : esc(j.order_number)}</b></div>` : ''}</div>
      ${assigned && j.customer_phone ? `<div class="contact"><a class="btn ghost sm" href="tel:${esc(j.customer_phone)}">${ic('phone', 15)} Call customer</a><a class="btn ghost sm" href="${wa(j.customer_phone, 'Hi, FreeFarm transporter here about: ' + j.load)}" target="_blank" rel="noopener">WhatsApp</a></div>` : ''}
      ${party && j.transporter_phone ? `<div class="contact"><a class="btn ghost sm" href="tel:${esc(j.transporter_phone)}">${ic('phone', 15)} Call ${esc(j.transporter)}</a><a class="btn ghost sm" href="${wa(j.transporter_phone, 'Hi, about the FreeFarm load: ' + j.load)}" target="_blank" rel="noopener">WhatsApp</a></div>` : ''}
      <div class="row" id="ja"></div></div>
      ${j.transporter_id && (party || assigned) ? `<div class="card stack"><h2>Messages</h2><div class="chat" id="ch">${messages.map((m) => `<div class="msg ${m.user_id === ME.id ? 'me' : ''}">${esc(m.text)}<small>${m.user_id === ME.id ? 'You' : esc(m.name.split(' ')[0])} · ${ago(m.created_at)}</small></div>`).join('') || '<p class="muted small">No messages yet.</p>'}</div><form class="row" id="mf" style="flex-wrap:nowrap"><input name="text" maxlength="1000" placeholder="Type a message" aria-label="Message" autocomplete="off"><button class="btn" aria-label="Send">${ic('send', 16)}</button></form></div>` : ''}</div>
      <div class="sticky"><div class="card stack" id="bx"></div></div></div>`);
    const bx = $('#bx', v), ja = $('#ja', v);
    if (party) {
      bx.innerHTML = `<h2>Prices from transporters (${bids.filter((b) => b.status === 'pending').length})</h2>${bids.length ? bids.map((b) => `<div class="card flat stack" style="padding:14px"><div class="between"><b>${esc(b.name)} ${b.verified ? `<span style="color:var(--green)">${ic('shield', 14)}</span>` : ''} ${stars(b.rating)}</b><span class="price">${money(b.price)}</span></div><span class="muted small">${esc(b.vehicle || 'Vehicle not given')}${b.cold ? ' · refrigerated' : ''} · ${b.trips} trip${b.trips === 1 ? '' : 's'}</span>${b.note ? `<p class="small">${esc(b.note)}</p>` : ''}${j.status === 'open' && b.status === 'pending' && ME.id === j.created_by ? `<button class="btn sm" data-bid="${b.id}">Choose ${esc(b.name.split(' ')[0])}</button>` : pill(b.status, b.status === 'accepted' ? 'green' : '')}</div>`).join('') : '<p class="muted">Waiting for transporters to send prices. They have been alerted.</p>'}`;
      $$('[data-bid]', bx).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/jobs/${j.id}/accept`, { bid_id: Number(b.dataset.bid) }); toast('Transporter booked'); route(); }));
      if (['open', 'assigned'].includes(j.status) && ME.id === j.created_by) ja.innerHTML = `<button class="btn ghost sm" id="jc">Cancel load</button>`;
      if (j.status === 'delivered' && !j.rating && ME.id === j.created_by) ja.innerHTML = `<span class="muted small">Rate the transporter:</span>${[1, 2, 3, 4, 5].map((n) => `<button class="chip" data-rate="${n}">${'★'.repeat(n)}</button>`).join('')}`;
    } else if (isT) {
      if (assigned) {
        bx.innerHTML = `<h2>Your trip</h2><p>Agreed price <b>${money(j.price)}</b>, paid by the customer.</p><p class="hint">FreeFarm's fee of ${money(LK.transport_fee)} applies when you mark it delivered.</p>`;
        if (j.status === 'assigned') ja.innerHTML = `<button class="btn" data-js="picked">${ic('truck', 16)} Picked up</button><button class="btn ghost" data-js="delivered">Delivered</button><button class="btn ghost sm" id="jc">Drop this trip</button>`;
        if (j.status === 'picked') ja.innerHTML = `<button class="btn" data-js="delivered">${ic('check', 16)} Delivered</button>`;
      } else if (j.status === 'open') {
        bx.innerHTML = `<h2>${myBid ? 'Update your price' : 'Send your price'}</h2>${myBid ? `<p class="muted small">Your price: ${money(myBid.price)}. Sending again replaces it.</p>` : ''}<form class="stack" id="bf"><label class="f">Price for the trip (${esc(LK.currency)})<input name="price" type="number" min="0" step="any" required></label><label class="f">Note<input name="note" maxlength="300" placeholder="When you can collect, vehicle"></label><p class="err" id="be"></p><button class="btn">${ic('send', 16)} Send price</button></form>`;
        $('#bf', bx).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api(`/jobs/${j.id}/bid`, formData(e.target)); toast('Price sent. We will tell you if you are chosen.'); route(); }, $('#be', bx)); });
      } else bx.innerHTML = `<h2>Taken</h2><p class="muted">Another transporter got this load.</p>`;
    } else bx.innerHTML = '<p class="muted">Only the customer and transporters see prices.</p>';
    $$('[data-js]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/jobs/${j.id}/status`, { to: b.dataset.js }); toast('Updated'); route(); }));
    if ($('#jc', v)) $('#jc', v).onclick = (e) => busy(e.currentTarget, async () => { await api(`/jobs/${j.id}/status`, { to: 'cancelled' }); toast('Done'); route(); });
    $$('[data-rate]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api(`/jobs/${j.id}/rate`, { rating: Number(b.dataset.rate) }); toast('Thanks for rating'); route(); }));
    if ($('#mf', v)) { const ch = $('#ch', v); ch.scrollTop = ch.scrollHeight; $('#mf', v).addEventListener('submit', (e) => { e.preventDefault(); const t = e.target.elements.text.value.trim(); if (!t) return; busy(e.submitter, async () => { await api(`/jobs/${j.id}/message`, { text: t }); route(); }); }); }
  }

  /* ---------- billing & account ---------- */
  async function billing(v) {
    setTitle('Plan & billing');
    const b = await api('/billing'); BAL = b.balance;
    const cur = b.plan;
    v.innerHTML = page(ph('Plan & billing', `FreeFarm earns ${money(b.fee)} per completed sale${ME.role === 'transporter' ? ` and ${money(b.transport_fee)} per completed delivery` : ''}. Fees add up here; pay them when it suits you, before they pass ${money(b.fee_limit)}.`) + `
      <div class="grid2"><div class="card stack"><h2>Fees owed</h2><div class="amt" style="font:800 34px var(--display);color:${b.balance > 0 ? 'var(--red)' : 'var(--green)'}">${money(Math.max(0, b.balance))}</div>
        <p class="muted small">${b.balance > b.fee_limit ? 'Your account is paused for new sales until this is paid.' : b.balance > 0 ? `Pay before it passes ${money(b.fee_limit)} to keep selling.` : 'All paid up. Thank you!'}</p>${b.balance > 0 ? `<button class="btn" id="pf">${ic('wallet', 16)} Pay ${money(b.balance)}</button>` : ''}</div>
      <div class="card stack"><h2>How to pay</h2>${b.pay.ecocash ? `<p><b>EcoCash:</b> ${esc(b.pay.ecocash)} (${esc(b.pay.name)})</p>` : ''}${b.pay.bank ? `<p style="white-space:pre-wrap"><b>Bank:</b> ${esc(b.pay.bank)}</p>` : ''}${!b.pay.ecocash && !b.pay.bank ? '<p class="muted">Payment details are being set up. Contact FreeFarm support.</p>' : ''}
        <p class="small">Use reference <b class="pill dark">${esc(b.pay.ref)}</b>, then enter the transaction ID from your SMS here. We confirm within a day.</p>${b.pay.whatsapp ? `<a href="${wa(b.pay.whatsapp, 'Hi FreeFarm, I paid. My reference is ' + b.pay.ref)}" target="_blank" rel="noopener">WhatsApp FreeFarm</a>` : ''}</div></div>
      ${ME.role !== 'admin' ? `<div style="margin-top:8px">${planGrid(ME.role, b.plans, cur, true)}</div><p class="muted small" style="margin-top:8px">${cur !== 'free' ? `Your plan is active until ${fdate(b.plan_until)}.` : b.plan_chosen !== 'free' && b.plan_until ? `Your ${esc(b.plan_chosen)} plan ended on ${fdate(b.plan_until)}.` : ''} Pay for 12 months and get 2 months free.</p>` : ''}
      <div class="grid2" style="margin-top:18px"><div class="card stack"><h2>Payments sent</h2>${b.payments.length ? `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>For</th><th>Amount</th><th>Ref</th><th>Status</th></tr></thead><tbody>${b.payments.map((p) => `<tr><td>${fdate(p.created_at)}</td><td>${p.purpose === 'plan' ? esc(p.plan) + ' · ' + p.months + ' mo' : 'Fees'}</td><td>${money(p.amount)}</td><td class="small">${esc(p.reference)}</td><td>${pill(p.status, p.status === 'confirmed' ? 'green' : p.status === 'rejected' ? 'red' : 'amber')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">None yet.</p>'}</div>
      <div class="card stack"><h2>Fee history</h2>${b.ledger.length ? `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>What</th><th>Amount</th></tr></thead><tbody>${b.ledger.map((l) => `<tr><td>${fdate(l.created_at)}</td><td>${esc(l.note || l.kind)}<br><span class="muted tiny">${esc(l.ref || '')}</span></td><td style="color:${l.amount > 0 ? 'var(--red)' : 'var(--green)'}">${l.amount > 0 ? '' : '−'}${money(Math.abs(l.amount))}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No fees yet. They appear when a sale or delivery is completed.</p>'}</div></div>`);
    const pay = (purpose, plan) => {
      const p = plan && b.plans.find((x) => x.id === plan);
      dlg(`${head(purpose === 'plan' ? 'Pay for ' + esc(p.name) : 'Pay FreeFarm fees', `Send the money first, then enter the transaction ID. Reference: ${esc(b.pay.ref)}`)}<form class="stack" id="yf">
        ${purpose === 'plan' ? `<label class="f">How long<select name="months" id="mo">${opt([[1, '1 month'], [3, '3 months'], [6, '6 months'], [12, '12 months (2 months free)']], 1)}</select></label><p>Amount: <b id="am"></b></p>` : `<label class="f">Amount paid<input name="amount" type="number" step="any" min="0" value="${b.balance.toFixed(2)}" required></label>`}
        ${b.pay.ecocash ? `<p class="small">EcoCash to <b>${esc(b.pay.ecocash)}</b> (${esc(b.pay.name)})</p>` : ''}
        <div class="grid2"><label class="f">Paid with<select name="method">${opt([['ecocash', 'EcoCash'], ['bank', 'Bank transfer'], ['cash', 'Cash to agent'], ['other', 'Other']], 'ecocash')}</select></label><label class="f">Transaction ID<input name="reference" required minlength="4" maxlength="60" placeholder="From your SMS"></label></div>
        <p class="err" id="ye"></p><div class="row"><button class="btn">${ic('check', 16)} Submit payment</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
        const am = () => { if (!p) return; const m = Number($('#mo', d).value); $('#am', d).textContent = money(p.price * m * (m === 12 ? 10 / 12 : 1)); };
        if (p) { $('#mo', d).onchange = am; am(); }
        $('#yf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.purpose = purpose; if (plan) x.plan = plan; busy(e.submitter, async () => { await api('/billing/pay', x); d.close(); toast('Payment sent for checking. We will confirm shortly.'); route(); }, $('#ye', d)); });
      });
    };
    if ($('#pf', v)) $('#pf', v).onclick = () => pay('fees');
    $$('[data-plan]', v).forEach((x) => x.onclick = () => pay('plan', x.dataset.plan));
  }
  async function account(v) {
    setTitle('My account');
    const me = await api('/me'); ME = me.user; FOLLOWS = me.follows || [];
    const r = ME.role;
    v.innerHTML = page(ph('My account', `${ROLE[r]} · ${esc(ME.phone)}${ME.verified ? ' · Verified' : ''}`, `<button class="btn ghost" id="lo">${ic('out', 16)} Sign out</button>`) + `<div class="grid2">
      <form class="card stack" id="pf"><h2>Profile</h2><div class="grid2"><label class="f">Name<input name="name" value="${esc(ME.name)}" required></label><label class="f">${r === 'farmer' ? 'Farm name' : 'Business name'}<input name="business" value="${esc(ME.business || '')}"></label></div>
        ${r === 'buyer' ? `<label class="f">Type of buyer<select name="buyer_type">${opt(LK.buyer_types, ME.buyer_type)}</select></label>` : ''}
        <div class="grid3"><label class="f">Country<select name="country">${opt(LK.countries, ME.country)}</select></label><label class="f">Province${regionField(ME.country, ME.region)}</label><label class="f">Town<input name="town" value="${esc(ME.town || '')}"></label></div>
        ${r !== 'transporter' ? `<label class="f">${r === 'buyer' ? 'What you usually buy' : 'What you grow'}<input name="crops" value="${esc(ME.crops || '')}"></label>` : `<div class="grid2"><label class="f">Vehicle<input name="vehicle" value="${esc(ME.vehicle || '')}"></label><label class="f">Capacity (kg)<input name="capacity_kg" type="number" value="${esc(ME.capacity_kg || '')}"></label></div><label class="check"><input type="checkbox" name="cold" ${ME.cold ? 'checked' : ''}> Refrigerated</label><label class="f">Routes you drive<input name="routes" value="${esc(ME.routes || '')}" placeholder="e.g. Harare, Mutare, Masvingo"></label>`}
        <label class="f">About you<textarea name="bio" rows="3" maxlength="600">${esc(ME.bio || '')}</textarea></label><label class="f">Email<input name="email" type="email" value="${esc(ME.email || '')}"></label>
        <p class="err" id="pe"></p><button class="btn">Save profile</button></form>
      <div class="stack"><form class="card stack" id="ff"><h2>Alert me about</h2><p class="muted small">${r === 'farmer' ? 'Get an alert when a buyer posts a request for these crops.' : 'Get an alert when these are listed or become rescue deals near you.'}</p>
        <div class="chips" style="flex-wrap:wrap">${Object.values(LK.crops).flat().map((c) => `<label class="chip"><input type="checkbox" name="c" value="${esc(c)}" ${FOLLOWS.includes(c) ? 'checked' : ''} style="accent-color:var(--green)">${emo(c)} ${esc(c)}</label>`).join('')}</div><button class="btn ghost">Save alerts</button></form>
      <form class="card stack" id="cf"><h2>Change password</h2><label class="f">Current password<input name="current" type="password" autocomplete="current-password" required></label><label class="f">New password<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><p class="err" id="ce"></p><button class="btn ghost">Change password</button></form>
      ${r !== 'admin' ? `<a class="card" href="#/billing" style="text-decoration:none;color:inherit"><h2>Plan & billing</h2><p class="muted">${ME.plan === 'free' ? 'Starter (free)' : esc(ME.plan) + ' until ' + fdate(ME.plan_until)}${BAL > 0 ? ' · fees owed ' + money(BAL) : ''}</p></a>` : ''}</div></div>`);
    $('#lo', v).onclick = logout;
    $('#pf', v).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.cold = !!x.cold; busy(e.submitter, async () => { await api('/me/profile', x); toast('Profile saved'); const m = await api('/me'); ME = m.user; }, $('#pe', v)); });
    $('#ff', v).addEventListener('submit', (e) => { e.preventDefault(); const crops = $$('input[name=c]:checked', e.target).map((x) => x.value); busy(e.submitter, async () => { await api('/me/follows', { crops }); FOLLOWS = crops; toast(`Alerts on for ${crops.length} crop${crops.length === 1 ? '' : 's'}`); }); });
    $('#cf', v).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/me/password', formData(e.target)); e.target.reset(); toast('Password changed'); }, $('#ce', v)); });
  }

  /* ---------- admin ---------- */
  async function admin(v) {
    setTitle('Admin');
    const d = await api('/admin/overview');
    const by = Object.fromEntries(d.users.map((u) => [u.role, u]));
    const ost = Object.fromEntries(d.orders.map((o) => [o.status, o]));
    v.innerHTML = page(ph('FreeFarm admin', 'Your earnings, members and anything that needs you.', `<a class="btn ghost" href="/api/admin/export/ledger">${ic('download', 16)} Fees CSV</a><a class="btn ghost" href="/api/admin/export/orders">${ic('download', 16)} Orders CSV</a>`) + `
      ${d.pending ? `<div class="banner warn" style="margin-bottom:14px">${ic('wallet')}<span style="flex:1">${d.pending} payment${d.pending > 1 ? 's' : ''} waiting for you to check.</span><a class="btn sm" href="#/admin/payments">Check payments</a></div>` : ''}
      ${d.disputes.length ? `<div class="banner bad" style="margin-bottom:14px">${ic('alert')}<span style="flex:1">${d.disputes.length} order${d.disputes.length > 1 ? 's have' : ' has'} a reported problem.</span><a class="btn sm red" href="#/order/${d.disputes[0].id}">Open</a></div>` : ''}
      <h2 style="margin-bottom:10px">Your income</h2><div class="kpis"><div class="kpi"><span>Commission this month</span><b>${money(d.fees_month)}</b><small>${money(d.fees_total)} all time</small></div><div class="kpi"><span>Subscriptions this month</span><b>${money(d.subs_month)}</b><small>${money(d.subs_total)} all time</small></div><div class="kpi"><span>Fees collected</span><b>${money(d.collected)}</b><small>Paid by members</small></div><div class="kpi ${d.owed > 0 ? 'hot' : ''}"><span>Fees still owed</span><b>${money(d.owed)}</b><small>Across all members</small></div></div>
      <h2 style="margin:22px 0 10px">Market</h2><div class="kpis"><a class="kpi" href="#/admin/users"><span>Farmers</span><b>${by.farmer ? by.farmer.n : 0}</b><small>${by.farmer ? by.farmer.paid : 0} on Pro</small></a><a class="kpi" href="#/admin/users"><span>Buyers</span><b>${by.buyer ? by.buyer.n : 0}</b><small>${by.buyer ? by.buyer.paid : 0} paying</small></a><a class="kpi" href="#/admin/users"><span>Transporters</span><b>${by.transporter ? by.transporter.n : 0}</b><small>${by.transporter ? by.transporter.paid : 0} on Pro</small></a><a class="kpi" href="#/orders"><span>Completed orders</span><b>${ost.completed ? ost.completed.n : 0}</b><small>${d.orders_month} this month · ${money(ost.completed ? ost.completed.v : 0)} traded</small></a></div>
      <div class="kpis" style="margin-top:12px"><div class="kpi"><span>Food moved</span><b>${d.kg.toLocaleString()} kg</b></div><div class="kpi"><span>Rescued from waste</span><b>${d.rescued.toLocaleString()} kg</b></div><a class="kpi" href="#/orders"><span>Orders in progress</span><b>${['placed', 'accepted', 'ready', 'on_the_way', 'delivered'].reduce((a, s) => a + (ost[s] ? ost[s].n : 0), 0)}</b></a><div class="kpi"><span>Cancelled / declined</span><b>${(ost.cancelled ? ost.cancelled.n : 0) + (ost.declined ? ost.declined.n : 0)}</b></div></div>
      <div class="grid2" style="margin-top:18px"><div class="card stack"><h2>Members who owe the most</h2>${d.top_debtors.length ? `<div class="tw"><table class="t"><tbody>${d.top_debtors.map((u) => `<tr><td><b>${esc(u.business || u.name)}</b><br><span class="muted tiny">${ROLE[u.role]} · ${esc(u.phone)}</span></td><td style="color:var(--red);font-weight:700">${money(u.b)}</td><td><a href="${wa(u.phone, 'Hi ' + u.name.split(' ')[0] + ', a friendly reminder from FreeFarm: your fees are ' + money(u.b) + '. Thank you!')}" target="_blank" rel="noopener">Remind</a></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nobody owes anything.</p>'}</div>
      <div class="card stack"><h2>Example data</h2><p class="muted small">Example farmers, buyers and transporters show visitors how FreeFarm works. They are labelled "Example" and cannot be ordered from. Remove them once real members are trading.</p>${d.has_demo ? '<button class="btn ghost" id="rx">Remove all example data</button>' : '<p class="pill green">No example data</p>'}</div></div>`);
    if ($('#rx', v)) $('#rx', v).onclick = (e) => { const b = e.currentTarget; if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to remove everything labelled Example'; return; } busy(b, async () => { const r = await api('/admin/remove-examples', {}); toast(`Removed ${r.removed} example accounts`); route(); }); };
  }
  async function adminUsers(v) {
    setTitle('People');
    v.innerHTML = page(ph('People', 'Verify farmers and businesses you have checked, switch off bad actors, set plans and reset passwords.', `<a class="btn ghost" href="/api/admin/export/users">${ic('download', 16)} CSV</a>`) + `<label class="search" style="margin-bottom:12px">${ic('search', 17)}<input type="search" id="q" placeholder="Name, phone, business" aria-label="Search"></label><div id="res"></div>`);
    const load = async () => {
      const { items } = await api('/admin/users?q=' + encodeURIComponent($('#q', v).value));
      $('#res', v).innerHTML = `<div class="tw"><table class="t"><thead><tr><th>Member</th><th>Role</th><th>Where</th><th>Plan</th><th>Owes</th><th>Joined</th><th></th></tr></thead><tbody>${items.map((u) => `<tr><td><b>${esc(u.business || u.name)}</b> ${u.verified ? pill('Verified', 'green') : ''} ${u.demo ? pill('Example', 'example') : ''} ${u.status === 'off' ? pill('Off', 'red') : ''}<br><span class="muted tiny">${esc(u.name)} · ${esc(u.phone)}${u.email ? ' · ' + esc(u.email) : ''}</span></td>
        <td>${ROLE[u.role]}${u.buyer_type ? '<br><span class="muted tiny">' + esc(u.buyer_type) + '</span>' : ''}</td><td class="small">${esc([u.town, u.region].filter(Boolean).join(', '))}</td><td class="small">${u.plan === 'free' ? 'Free' : esc(u.plan) + '<br><span class="muted tiny">to ' + fdate(u.plan_until) + '</span>'}</td>
        <td style="color:${u.balance > 0 ? 'var(--red)' : 'inherit'}">${u.balance > 0 ? money(u.balance) : '—'}</td><td class="small">${fdate(u.created_at)}</td><td>${u.role !== 'admin' ? `<button class="btn ghost sm" data-u="${u.id}">Manage</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
      $$('[data-u]', v).forEach((b) => b.onclick = () => manage(items.find((u) => String(u.id) === b.dataset.u), load));
    };
    let t; $('#q', v).oninput = () => { clearTimeout(t); t = setTimeout(load, 300); };
    await load();
  }
  function manage(u, done) {
    const plans = LK.plans[u.role] || [];
    dlg(`${head(esc(u.business || u.name), `${ROLE[u.role]} · ${esc(u.phone)}`)}<div class="stack">
      <div class="row"><button class="btn ${u.verified ? 'ghost' : ''}" id="vf">${u.verified ? 'Remove verified badge' : `${ic('shield', 16)} Mark verified`}</button><a class="btn ghost" href="${wa(u.phone, 'Hi ' + u.name.split(' ')[0] + ', this is FreeFarm.')}" target="_blank" rel="noopener">WhatsApp</a></div>
      <form class="grid3" id="plf" style="align-items:end"><label class="f">Plan<select name="plan">${opt(plans.map((p) => [p.id, p.name]), u.plan_chosen || 'free')}</select></label><label class="f">Until<input type="date" name="plan_until" value="${esc(u.plan_until || '')}"></label><button class="btn ghost">Set plan</button></form>
      ${u.balance > 0 ? `<button class="btn ghost" id="wv">Waive ${money(u.balance)} owed</button>` : ''}
      <div class="row"><button class="btn ghost" id="rs">Reset password</button><button class="btn ${u.status === 'off' ? '' : 'red'}" id="of">${u.status === 'off' ? 'Switch account back on' : 'Switch account off'}</button></div><p id="pw"></p></div>`, (d) => {
      const go = (b, body, msg) => busy(b, async () => { const r = await api('/admin/users/' + u.id, body); if (r.password) { $('#pw', d).innerHTML = `New temporary password: <b class="pill dark" style="font-size:15px">${esc(r.password)}</b><br><span class="muted small">Send it to them. They choose their own at next sign-in.</span>`; return; } toast(msg); d.close(); done(); });
      $('#vf', d).onclick = (e) => go(e.currentTarget, { verified: !u.verified }, 'Updated');
      $('#plf', d).addEventListener('submit', (e) => { e.preventDefault(); go(e.submitter, formData(e.target), 'Plan set'); });
      if ($('#wv', d)) $('#wv', d).onclick = (e) => go(e.currentTarget, { waive: 1 }, 'Fees waived');
      $('#rs', d).onclick = (e) => go(e.currentTarget, { reset: 1 });
      $('#of', d).onclick = (e) => go(e.currentTarget, { status: u.status === 'off' ? 'active' : 'off' }, 'Updated');
    });
  }
  async function adminPayments(v) {
    setTitle('Payments');
    const { items } = await api('/admin/payments');
    v.innerHTML = page(ph('Payments', 'Check each reference against your EcoCash or bank statement, then confirm. Confirming a plan payment switches the plan on.') + (items.length ? `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Member</th><th>For</th><th>Amount</th><th>Method & reference</th><th></th></tr></thead><tbody>${items.map((p) => `<tr><td class="small">${fdate(p.created_at)}<br>${ago(p.created_at)}</td><td><b>${esc(p.business || p.name)}</b><br><span class="muted tiny">${ROLE[p.role]} · ${esc(p.phone)}</span></td><td>${p.purpose === 'plan' ? esc(p.plan) + ' plan, ' + p.months + ' mo' : 'Fees'}</td><td><b>${money(p.amount)}</b></td><td class="small">${esc(p.method)}<br><b>${esc(p.reference)}</b></td>
      <td>${p.status === 'pending' ? `<div class="row" style="gap:6px"><button class="btn sm" data-ok="${p.id}">Confirm</button><button class="btn ghost sm" data-no="${p.id}">Reject</button></div>` : pill(p.status, p.status === 'confirmed' ? 'green' : 'red')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No payments yet.</p>'));
    $$('[data-ok]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api('/admin/payments/' + b.dataset.ok, { confirm: true }); toast('Confirmed'); route(); }));
    $$('[data-no]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api('/admin/payments/' + b.dataset.no, { confirm: false, note: 'Please check the transaction ID and send it again.' }); toast('Rejected, member told'); route(); }));
  }
  async function adminSettings(v) {
    setTitle('Settings');
    const { settings: s } = await api('/admin/settings');
    v.innerHTML = page(ph('Settings', 'Fees, plan prices and how members pay you.') + `<form class="card stack" id="sf" style="max-width:860px">
      <h2>Your commission</h2><div class="grid3"><label class="f">Fee per completed sale<input name="fee" type="number" step="0.01" min="0" value="${esc(s.fee)}"></label><label class="f">Who pays it<select name="fee_payer">${opt([['seller', 'Farmer (seller)'], ['buyer', 'Buyer'], ['split', 'Split 50/50']], s.fee_payer)}</select></label><label class="f">Fee per completed delivery<input name="transport_fee" type="number" step="0.01" min="0" value="${esc(s.transport_fee)}"><span class="hint">Paid by the transporter</span></label></div>
      <div class="grid3"><label class="f">Pause selling when owed more than<input name="fee_limit" type="number" step="0.5" min="0" value="${esc(s.fee_limit)}"></label><label class="f">Currency<input name="currency" value="${esc(s.currency)}" maxlength="6"></label><label class="f">Auto-complete delivered orders after (hours)<input name="auto_complete_hours" type="number" min="1" value="${esc(s.auto_complete_hours)}"></label></div>
      <h2>Plan prices per month</h2><div class="grid2"><label class="f">Farmer Pro<input name="price_farmer_pro" type="number" step="0.5" min="0" value="${esc(s.price_farmer_pro)}"></label><label class="f">Transporter Pro<input name="price_transport_pro" type="number" step="0.5" min="0" value="${esc(s.price_transport_pro)}"></label><label class="f">Business buyer<input name="price_buyer_business" type="number" step="0.5" min="0" value="${esc(s.price_buyer_business)}"></label><label class="f">Exporter & processor<input name="price_buyer_export" type="number" step="0.5" min="0" value="${esc(s.price_buyer_export)}"></label></div>
      <label class="f">Free trial for new paid plans (days)<input name="trial_days" type="number" min="0" max="365" value="${esc(s.trial_days)}"></label>
      <h2>How members pay you</h2><div class="grid2"><label class="f">EcoCash merchant or number<input name="pay_ecocash" value="${esc(s.pay_ecocash)}" placeholder="e.g. merchant code or 077…"></label><label class="f">Account name<input name="pay_name" value="${esc(s.pay_name)}"></label></div>
      <label class="f">Bank details<textarea name="pay_bank" rows="3">${esc(s.pay_bank)}</textarea></label><label class="f">Support WhatsApp number<input name="support_whatsapp" value="${esc(s.support_whatsapp)}" placeholder="+263…"><span class="hint">Shown on the site for help and password resets</span></label>
      <p class="err" id="se"></p><button class="btn">Save settings</button></form>`);
    $('#sf', v).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/admin/settings', formData(e.target)); LK = await api('/lookups'); toast('Settings saved'); }, $('#se', v)); });
  }

  /* =================== MY FARM =================== */
  const FT = [['', 'sprout', 'Overview'], ['crops', 'leaf', 'Crops & animals'], ['tasks', 'check', 'Tasks'], ['workers', 'users', 'Workers & pay'], ['store', 'box', 'Store'], ['money', 'wallet', 'Money'], ['weather', 'clock', 'Weather'], ['doctor', 'search', 'Plant doctor'], ['advisor', 'hand', 'Advisor'], ['sensors', 'gear', 'Automations']];
  const ftabs = (cur) => `<nav class="chips ftabs" aria-label="Farm sections" style="margin-bottom:18px">${FT.map(([k, i, l]) => `<a class="chip" href="#/farm${k ? '/' + k : ''}" aria-pressed="${k === cur}">${ic(i, 15)} ${l}</a>`).join('')}</nav>`;
  const lvl = (l) => l === 'high' ? 'bad' : 'warn';
  const WMO = (c) => c == null ? '' : c === 0 ? '☀️' : c <= 3 ? '⛅' : c <= 48 ? '🌫️' : c <= 67 ? '🌧️' : c <= 77 ? '🌨️' : c <= 82 ? '🌦️' : '⛈️';
  const upsell = (what) => `<div class="banner info" style="margin-bottom:14px">${ic('leaf')}<span style="flex:1">${what} <b>Farm Manager</b> unlocks everything with no limits.</span><a class="btn sm" href="#/billing">See plans</a></div>`;
  let FARM = null;
  async function farm(v, tab, id, Q) {
    if (!['farmer', 'admin'].includes(ME.role)) throw new Error('My farm is for farmers.');
    setTitle('My farm');
    const st = await api('/farm');
    FARM = st.farm; FARM_FULL = st.full;
    if (!FARM || tab === 'setup') return farmSetup(v, st);
    const fn = { '': farmOverview, crops: farmCrops, crop: farmCrop, tasks: farmTasks, workers: farmWorkers, worker: farmWorker, pay: farmPay, store: farmStore, money: farmMoney, weather: farmWeather, doctor: farmDoctor, advisor: farmAdvisor, sensors: farmSensors }[tab];
    if (!fn) throw new Error('Page not found.');
    await fn(v, id, Q);
  }
  let FARM_FULL = false;
  function farmSetup(v, st) {
    const f = st.farm || { name: ME.business || '', country: ME.country, region: ME.region, town: ME.town };
    v.innerHTML = page(ph(st.farm ? 'Farm details' : 'Set up your farm', 'Your location gives you local weather, frost and disease alerts and outbreak warnings from farms near you.') + `<form class="card stack" id="fs" style="max-width:720px">
      <div class="grid2"><label class="f">Farm name<input name="name" value="${esc(f.name)}" required></label><label class="f">Size (hectares)<input name="size_ha" type="number" step="any" min="0" value="${esc(f.size_ha || '')}"></label></div>
      <div class="grid3"><label class="f">Country<select name="country">${opt(LK.countries, f.country)}</select></label><label class="f">Province / region${regionField(f.country, f.region)}</label><label class="f">Nearest town<input name="town" value="${esc(f.town || '')}"></label></div>
      <div class="grid2"><label class="f">Latitude<input name="lat" id="lat" value="${esc(f.lat ?? '')}" inputmode="decimal"></label><label class="f">Longitude<input name="lng" id="lng" value="${esc(f.lng ?? '')}" inputmode="decimal"></label></div>
      <div class="row"><button class="btn ghost sm" type="button" id="gps">${ic('pin', 15)} Use my location (stand on the farm)</button><span class="hint" id="gh">Or leave blank and we use the centre of your province.</span></div>
      <p class="err" id="fe"></p><div class="row"><button class="btn">${ic('check', 16)} ${st.farm ? 'Save' : 'Create my farm'}</button>${st.farm ? '<a class="btn ghost" href="#/farm">Back</a>' : ''}</div></form>`);
    $('#gps', v).onclick = () => { if (!navigator.geolocation) return toast('This phone cannot share location.', true); $('#gh', v).textContent = 'Finding you…'; navigator.geolocation.getCurrentPosition((p) => { $('#lat', v).value = p.coords.latitude.toFixed(5); $('#lng', v).value = p.coords.longitude.toFixed(5); $('#gh', v).textContent = 'Location set (±' + Math.round(p.coords.accuracy) + ' m).'; }, () => { $('#gh', v).textContent = 'Could not get your location. Allow location, or leave blank.'; }, { enableHighAccuracy: true, timeout: 15000 }); };
    $('#fs', v).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/farm', formData(e.target)); toast('Farm saved'); location.hash = '#/farm'; route(); }, $('#fe', v)); });
  }
  async function farmOverview(v) {
    const d = await api('/farm/overview');
    const f = d.farm, w = d.weather;
    const todayTasks = d.tasks.filter((t) => t.due <= today());
    v.innerHTML = page(ph(esc(f.name), `${esc([f.town, f.region, f.country].filter(Boolean).join(', '))}${f.size_ha ? ' · ' + qn(f.size_ha) + ' ha' : ''} · <a href="#/farm/setup">Edit</a>`, `<a class="btn" href="#/farm/crops?new=1">${ic('plus', 16)} Add crop or batch</a><a class="btn ghost" href="#/farm/doctor">${ic('search', 16)} Scan a plant</a>`) + ftabs('') + `
      ${d.alerts.filter((a) => a.level === 'high').map((a) => `<div class="banner bad" style="margin-bottom:10px">${ic('alert')}<span><b>${esc(a.title)}.</b> ${esc(a.text)}</span></div>`).join('')}
      ${d.outbreaks.map((o) => `<div class="banner warn" style="margin-bottom:10px">🦠<span><b>Outbreak near you:</b> ${esc(o.problem)} on ${esc(o.crop.toLowerCase())} at ${o.farms} farms in ${esc(f.region)} (last 2 weeks). <a href="#/farm/doctor">Scan your plants</a></span></div>`).join('')}
      <div class="kpis"><a class="kpi ${todayTasks.length ? 'hot' : ''}" href="#/farm/tasks"><span>Tasks today</span><b>${todayTasks.length}</b><small>${d.tasks.filter((t) => t.due < today()).length} overdue</small></a>
        <a class="kpi" href="#/farm/crops"><span>Growing now</span><b>${d.plantings.length}</b><small>crops and batches</small></a>
        <a class="kpi" href="#/farm/workers"><span>Workers here today</span><b>${d.workers.here}/${d.workers.n}</b><small>Tap to mark attendance</small></a>
        <a class="kpi" href="#/farm/money"><span>This month</span><b style="color:${d.money.income - d.money.expense >= 0 ? 'var(--green)' : 'var(--red)'}">${money(d.money.income - d.money.expense)}</b><small>${money(d.money.income)} in · ${money(d.money.expense)} out</small></a></div>
      <div class="detail" style="margin-top:18px"><div class="stack">
        <div class="card stack"><h2>💡 Suggestions for you</h2>${d.suggestions.length ? `<div class="list">${d.suggestions.map((s) => `<a class="item" href="${esc(s.link)}"><span class="em">${s.icon}</span><span>${esc(s.text)}</span><span></span></a>`).join('')}</div>` : '<p class="muted">All good for now.</p>'}</div>
        <div class="card stack"><div class="between"><h2>Crops & animals</h2><a href="#/farm/crops">All</a></div>${d.plantings.length ? `<div class="list">${d.plantings.map(plantItem).join('')}</div>` : '<p class="muted">Nothing added yet. Add a crop or a livestock batch to get a full calendar of tasks, input reminders and harvest planning.</p>'}</div>
        <div class="card stack"><div class="between"><h2>This week's tasks</h2><a href="#/farm/tasks">All tasks</a></div>${d.tasks.length ? `<div class="list">${d.tasks.slice(0, 8).map(taskItem).join('')}</div>` : '<p class="muted">No tasks this week.</p>'}</div></div>
      <div class="stack">
        <a class="card stack" href="#/farm/weather" style="text-decoration:none;color:inherit"><div class="between"><h2>Weather</h2><span class="muted small">${w ? 'updated ' + ago(w.at) : ''}</span></div>${w ? `${w.current ? `<div class="row"><span style="font-size:40px">${WMO(w.current.weather_code)}</span><div><b style="font:800 30px var(--display)">${Math.round(w.current.temperature_2m)}°C</b><br><span class="muted small">Humidity ${w.current.relative_humidity_2m}% · wind ${Math.round(w.current.wind_speed_10m)} km/h</span></div></div>` : ''}<div class="wx">${w.next.slice(0, 5).map((x) => `<div><small>${x.date === today() ? 'Today' : new Date(x.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short' })}</small><span>${WMO(x.code)}</span><b>${Math.round(x.tmax)}°</b><small>${Math.round(x.tmin)}° · ${Math.round(x.rain)}mm</small></div>`).join('')}</div>${d.alerts.filter((a) => a.level !== 'high').slice(0, 2).map((a) => `<p class="small" style="color:var(--amber-ink)">⚠ ${esc(a.title)}</p>`).join('')}` : '<p class="muted">Weather is not available yet. Check your farm location.</p>'}</a>
        ${d.low.length ? `<div class="card stack"><h2>📦 Running low</h2>${d.low.map((i) => `<p class="between"><span>${esc(i.name)}</span><b style="color:var(--red)">${qn(i.qty)} ${esc(i.unit)}</b></p>`).join('')}<a class="btn ghost sm" href="#/market?category=Farm%20inputs">Buy in the inputs store</a></div>` : ''}
        <div class="card stack"><div class="between"><h2>Plant doctor</h2><a href="#/farm/doctor">Scan</a></div>${d.scans.length ? d.scans.map((s) => `<p class="between small"><span>${emo(s.crop)} ${esc(s.crop)}: <b>${esc(s.problem)}</b></span>${s.healthy ? pill('Healthy', 'green') : pill(s.confidence + ' confidence', 'amber')}</p>`).join('') : '<p class="muted small">Take a photo of a sick leaf and the AI tells you what it is and what to do.</p>'}</div>
        ${d.full ? '' : `<div class="card stack"><h2>Farm Manager plan</h2><p class="muted small">Your plan includes 2 fields, 3 active crops, 3 workers, 3 AI scans and 3 advisor questions a month. Farm Manager removes the limits and adds sensors.</p><a class="btn sm" href="#/billing">Upgrade</a></div>`}</div></div>`);
  }
  function plantItem(p) {
    const s = p.st;
    return `<a class="item" href="#/farm/crop/${p.id}"><span class="em">${emo(p.crop)}</span><span><b>${esc(p.crop)}${p.variety ? ' · ' + esc(p.variety) : ''}</b><small>${p.kind === 'livestock' ? (p.count || '?') + ' animals' : (p.area_ha ? qn(p.area_ha) + ' ha' : '')}${p.field ? ' · ' + esc(p.field) : ''} · day ${Math.max(0, s.age)} · ${esc(s.stage)}</small><span class="bar"><i style="width:${s.pct}%"></i></span></span><span class="r">${p.status !== 'growing' ? pill(p.status, p.status === 'harvested' ? 'green' : 'red') : s.days_left <= 0 ? pill('Ready', 'green') : `<span class="muted small">${s.days_left} days to go</span>`}${p.due ? pill(p.due + ' task' + (p.due > 1 ? 's' : ''), 'amber') : ''}</span></a>`;
  }
  function taskItem(t) {
    const late = t.due < today();
    return `<div class="item task" data-t="${t.id}"><button class="tick-btn" data-done="${t.id}" aria-label="Mark done">${ic('check', 16)}</button><span><b>${esc(t.title)}</b><small>${t.crop ? emo(t.crop) + ' ' + esc(t.crop) + ' · ' : ''}${t.worker ? esc(t.worker) + ' · ' : ''}${t.repeat_days ? 'every ' + t.repeat_days + ' days · ' : ''}<span style="${late ? 'color:var(--red);font-weight:700' : ''}">${t.due === today() ? 'Today' : late ? 'Overdue since ' + fdate(t.due) : fdate(t.due)}</span></small>${t.details ? `<small class="det">${esc(t.details)}</small>` : ''}</span><span class="r">${t.input ? `<a class="btn ghost sm" href="#/market?category=Farm%20inputs&q=${encodeURIComponent(t.input)}">Buy ${esc(t.input.toLowerCase())}</a>` : ''}</span></div>`;
  }
  function wireTasks(root, redraw) {
    $$('[data-done]', root).forEach((b) => b.onclick = (e) => { e.preventDefault(); busy(b, async () => { await api('/farm/tasks', { id: Number(b.dataset.done), done: 1 }); toast('Done'); redraw(); }); });
  }
  async function farmCrops(v, id, Q) {
    const st = Q.get('status') || 'growing';
    const [{ items }, fl] = await Promise.all([api('/farm/plantings?status=' + st), api('/farm/fields')]);
    v.innerHTML = page(ph('Crops & animals', 'Each crop or batch gets a calendar of tasks, growth stages, inputs used, costs and profit.', `<button class="btn" id="np">${ic('plus', 16)} Add crop or batch</button>`) + ftabs('crops') + `
      <div class="detail"><div class="stack"><nav class="tabs" style="margin:0">${[['growing', 'Growing'], ['harvested', 'Harvested'], ['all', 'All']].map(([k, l]) => `<a href="#/farm/crops?status=${k}" aria-current="${k === st}">${l}</a>`).join('')}</nav>
        <div class="list">${items.map(plantItem).join('') || '<p class="empty">Nothing here yet.</p>'}</div>
        ${st !== 'growing' && items.length ? `<div class="card stack"><h2>Profit by crop</h2><div class="tw"><table class="t"><thead><tr><th>Crop</th><th>Planted</th><th>Harvested</th><th>Profit so far</th></tr></thead><tbody>${items.map((p) => `<tr><td>${emo(p.crop)} ${esc(p.crop)}</td><td>${fdate(p.planted)}</td><td>${qn(p.harvested_qty)} ${esc(p.yield_unit || '')}</td><td style="color:${p.margin >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:700">${money(p.margin)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}</div>
      <div class="card stack"><div class="between"><h2>Fields</h2><button class="btn ghost sm" id="nf">${ic('plus', 15)} Add field</button></div>${fl.items.length ? fl.items.map((x) => `<div class="between" style="border-top:1px solid var(--line2);padding-top:8px"><span><b>${esc(x.name)}</b><br><span class="muted small">${x.size_ha ? qn(x.size_ha) + ' ha · ' : ''}${esc(x.irrigation || '')}${x.soil ? ' · ' + esc(x.soil) : ''}${x.growing ? ' · ' + esc(x.growing) : ' · empty'}</span></span><button class="link" data-fe="${x.id}">Edit</button></div>`).join('') : '<p class="muted small">Add your fields, blocks, gardens or fowl runs.</p>'}</div></div>`);
    const fieldDlg = (x) => dlg(`${head(x.id ? 'Edit field' : 'Add a field')}<form class="stack" id="ff"><label class="f">Name<input name="name" required value="${esc(x.name || '')}" placeholder="e.g. Block A, Garden by the dam"></label><div class="grid2"><label class="f">Size (ha)<input name="size_ha" type="number" step="any" min="0" value="${esc(x.size_ha || '')}"></label><label class="f">Water<select name="irrigation">${opt(['Rain-fed', 'Drip', 'Sprinkler', 'Centre pivot', 'Furrow / flood', 'Bucket / hand'], x.irrigation)}</select></label></div><label class="f">Soil<input name="soil" value="${esc(x.soil || '')}" placeholder="e.g. sandy loam, red clay"></label><p class="err" id="fe"></p><div class="row"><button class="btn">Save</button>${x.id ? '<button class="btn ghost" type="button" id="rm">Remove</button>' : ''}</div></form>`, (d) => {
      $('#ff', d).addEventListener('submit', (e) => { e.preventDefault(); const y = formData(e.target); if (x.id) y.id = x.id; busy(e.submitter, async () => { await api('/farm/fields', y); d.close(); route(); }, $('#fe', d)); });
      if ($('#rm', d)) $('#rm', d).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/fields', { id: x.id, remove: 1, name: x.name }); d.close(); route(); });
    });
    $('#nf', v).onclick = () => fieldDlg({});
    $$('[data-fe]', v).forEach((b) => b.onclick = () => fieldDlg(fl.items.find((x) => String(x.id) === b.dataset.fe)));
    $('#np', v).onclick = () => plantDlg(fl.items);
    if (Q.get('new')) plantDlg(fl.items);
  }
  function plantDlg(fields, p = {}) {
    const all = Object.entries(LK.crops).filter(([g]) => g !== 'Farm inputs');
    dlg(`${head(p.id ? 'Edit' : 'Add a crop or livestock batch', 'We build your calendar of tasks, input reminders and harvest date from this.')}<form class="stack" id="pf">
      <label class="f">What<select name="crop" required><option value="">Choose…</option>${all.map(([g, l]) => `<optgroup label="${esc(g)}">${l.map((c) => `<option${c === p.crop ? ' selected' : ''}>${esc(c)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <div class="grid2"><label class="f">Variety / breed<input name="variety" value="${esc(p.variety || '')}"></label><label class="f">Field<select name="field_id">${opt(fields.map((x) => [x.id, x.name]), p.field_id, 'No field')}</select></label></div>
      <div class="grid3"><label class="f">Planted / started<input type="date" name="planted" required value="${esc(p.planted || today())}"></label><label class="f" id="ar">Area (ha)<input name="area_ha" type="number" step="any" min="0" value="${esc(p.area_ha || '')}"></label><label class="f" id="ct">Number of animals<input name="count" type="number" min="0" value="${esc(p.count || '')}"></label></div>
      <div class="grid2"><label class="f">Expected harvest / sale<input type="date" name="expected_harvest" value="${esc(p.expected_harvest || '')}"><span class="hint">Leave blank to use the usual season length</span></label><label class="f">Expected yield<input name="expected_yield" type="number" step="any" min="0" value="${esc(p.expected_yield || '')}"><span class="hint">Leave blank for a typical estimate</span></label></div>
      ${p.id ? '' : '<label class="check"><input type="checkbox" name="auto_tasks" checked> Create the season\'s tasks for me (planting, fertiliser, spraying, vaccination, harvest)</label>'}
      <p class="err" id="pe"></p><div class="row"><button class="btn">${ic('check', 16)} Save</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      const f = $('#pf', d);
      const kind = () => { const live = ['Livestock & poultry', 'Fish'].includes(Object.entries(LK.crops).find(([, l]) => l.includes(f.elements.crop.value))?.[0]) || f.elements.crop.value === 'Eggs'; $('#ar', f).hidden = live; $('#ct', f).hidden = !live; };
      f.elements.crop.onchange = kind; kind();
      f.addEventListener('submit', (e) => { e.preventDefault(); const x = formData(f); x.auto_tasks = !!x.auto_tasks || !!p.id; if (p.id) x.id = p.id; busy(e.submitter, async () => { const r = await api('/farm/plantings', x); d.close(); toast(r.tasks ? `Added with ${r.tasks} tasks on your calendar` : 'Saved'); location.hash = '#/farm/crop/' + (p.id || r.id); route(); }, $('#pe', d)); });
    });
  }
  async function farmCrop(v, id) {
    const [d, fl, inv] = await Promise.all([api('/farm/plantings/' + id), api('/farm/fields'), api('/farm/inventory')]);
    const p = d.item, s = p.st;
    const cost = d.money.filter((m) => m.kind === 'expense').reduce((a, m) => a + m.amount, 0) + d.inputs.reduce((a, m) => a + (-m.qty) * (m.unit_cost || 0), 0);
    const inc = d.money.filter((m) => m.kind === 'income').reduce((a, m) => a + m.amount, 0);
    v.innerHTML = page(`<p style="margin-bottom:12px"><a href="#/farm/crops">← Crops & animals</a></p>` + ph(`${emo(p.crop)} ${esc(p.crop)}${p.variety ? ' · ' + esc(p.variety) : ''}`, `${p.kind === 'livestock' ? (p.count || '?') + ' animals' : (p.area_ha ? qn(p.area_ha) + ' ha' : '')}${p.field ? ' · ' + esc(p.field.name) : ''} · started ${fdate(p.planted)}`, `<button class="btn" id="lg">${ic('plus', 16)} Record</button><a class="btn ghost" href="#/farm/doctor?planting=${p.id}">${ic('search', 16)} Scan</a><a class="btn ghost" href="#/sell/new?planting=${p.id}">${ic('shop', 16)} Sell</a>`) + `
      ${d.safe && d.safe.date > today() ? `<div class="banner bad" style="margin-bottom:12px">${ic('alert')}<span>Withholding period: ${esc(d.safe.item)} applied on ${fdate(d.safe.applied)}. Do not harvest or sell before <b>${fdate(d.safe.date)}</b>.</span></div>` : ''}
      <div class="card stack"><div class="between"><b>${esc(s.stage)} · day ${Math.max(0, s.age)}</b><span class="muted small">${s.days_left > 0 ? `${s.days_left} days to ${p.kind === 'livestock' ? 'sale' : 'harvest'} (${fdate(p.expected_harvest)})` : 'Ready'}</span></div><div class="bar" style="height:10px"><i style="width:${s.pct}%"></i></div>
        <div class="facts"><div><span>Expected yield</span><b>${p.expected_yield ? qn(p.expected_yield) + ' ' + esc(p.yield_unit || '') : '—'}</b></div><div><span>Harvested so far</span><b>${qn(p.harvested_qty)} ${esc(p.yield_unit || '')}</b></div><div><span>Costs so far</span><b>${money(cost)}</b></div><div><span>Sales</span><b>${money(inc)}</b></div><div><span>Profit so far</span><b style="color:${inc - cost >= 0 ? 'var(--green)' : 'var(--red)'}">${money(inc - cost)}</b></div><div><span>Status</span><b>${esc(p.status)}</b></div></div>
        <div class="row">${p.status === 'growing' ? `<button class="btn ghost sm" id="hv">Record harvest${p.kind === 'livestock' ? ' / sale' : ''}</button><button class="btn ghost sm" id="ed">Edit</button><button class="btn ghost sm" id="fl">Mark as failed</button>` : `<button class="btn ghost sm" id="re">Back to growing</button>`}</div></div>
      <div class="grid2" style="margin-top:16px"><div class="card stack"><div class="between"><h2>Tasks</h2><button class="btn ghost sm" id="nt">${ic('plus', 15)} Task</button></div><div class="list" id="tl">${d.tasks.filter((t) => t.status === 'open').map(taskItem).join('') || '<p class="muted small">No open tasks.</p>'}</div>${d.tasks.filter((t) => t.status !== 'open').length ? `<details><summary class="muted small">${d.tasks.filter((t) => t.status !== 'open').length} done</summary>${d.tasks.filter((t) => t.status !== 'open').map((t) => `<p class="small">✓ ${esc(t.title)} <span class="muted">${fdate((t.done_at || '').slice(0, 10))}</span></p>`).join('')}</details>` : ''}</div>
      <div class="card stack"><h2>Diary</h2>${d.logs.length ? d.logs.map((g) => `<div style="border-top:1px solid var(--line2);padding-top:8px"><span class="muted small">${fdate(g.date)} · ${esc(g.kind)}${g.health ? ' · ' + esc(g.health) : ''}${g.height_cm ? ' · ' + qn(g.height_cm) + ' cm' : ''}${g.qty ? ' · ' + qn(g.qty) : ''}</span>${g.notes ? `<p class="small">${esc(g.notes)}</p>` : ''}${g.has_photo ? `<img src="/api/farm/photo/log/${g.id}" alt="" loading="lazy" style="max-height:160px;border-radius:10px;margin-top:6px">` : ''}</div>`).join('') : '<p class="muted small">Record growth, problems, sprays and harvests with photos to track how this crop is doing.</p>'}</div></div>
      <div class="card stack" style="margin-top:16px"><div class="between"><h2>Inputs used</h2><button class="btn ghost sm" id="use">${ic('plus', 15)} Use from store</button></div>${d.inputs.length ? `<div class="tw"><table class="t"><tbody>${d.inputs.map((m) => `<tr><td>${fdate(m.date)}</td><td>${esc(m.name)}</td><td>${qn(-m.qty)} ${esc(m.unit)}</td><td>${m.unit_cost ? money(-m.qty * m.unit_cost) : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Seed, fertiliser, chemicals and feed you use from your store show here with their cost.</p>'}</div>`);
    const redraw = () => route();
    wireTasks(v, redraw);
    $('#lg', v).onclick = () => logDlg(p, 'growth');
    if ($('#hv', v)) $('#hv', v).onclick = () => logDlg(p, 'harvest');
    if ($('#ed', v)) $('#ed', v).onclick = () => plantDlg(fl.items, { ...p, field_id: p.field_id });
    if ($('#fl', v)) $('#fl', v).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/plantings', { id: p.id, status: 'failed' }); route(); });
    if ($('#re', v)) $('#re', v).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/plantings', { id: p.id, status: 'growing' }); route(); });
    $('#nt', v).onclick = () => taskDlg({ planting_id: p.id });
    $('#use', v).onclick = () => stockDlg(inv.items, { kind: 'use', planting_id: p.id });
  }
  function logDlg(p, kind) {
    dlg(`${head(kind === 'harvest' ? (p.kind === 'livestock' ? 'Record sale / slaughter' : 'Record harvest') : 'Add to diary', esc(p.crop))}<form class="stack" id="lf">
      <div class="grid2"><label class="f">What<select name="kind">${opt(kind === 'harvest' ? [['harvest', p.kind === 'livestock' ? 'Sold / slaughtered' : 'Harvest']] : [['growth', 'Growth check'], ['note', 'Note'], ['problem', 'Problem seen'], ...(p.kind === 'livestock' ? [['mortality', 'Deaths'], ['weight', 'Weight check']] : [])], kind)}</select></label><label class="f">Date<input type="date" name="date" value="${today()}" max="${today()}"></label></div>
      <div class="grid3"><label class="f">Health<select name="health">${opt(['Good', 'Fair', 'Poor'], 'Good', '—')}</select></label><label class="f">Height / weight<input name="height_cm" type="number" step="any" placeholder="cm or kg"></label><label class="f">${kind === 'harvest' ? 'Quantity (' + esc(p.yield_unit || 'units') + ')' : 'Quantity'}<input name="qty" type="number" step="any" min="0" ${kind === 'harvest' ? 'required' : ''}></label></div>
      <label class="f">Notes<textarea name="notes" rows="2" maxlength="800"></textarea></label>
      <label class="f">Photo<input type="file" id="ph" accept="image/*" capture="environment"></label>
      ${kind === 'harvest' ? '<label class="check"><input type="checkbox" name="to_store" checked> Add to my store (so I can track what is still unsold)</label><label class="check"><input type="checkbox" name="final"> This was the last harvest</label>' : ''}
      <p class="err" id="le"></p><div class="row"><button class="btn">Save</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      let photo; $('#ph', d).onchange = async (e) => { try { photo = await resizeImage(e.target.files[0], 900); toast('Photo added'); } catch (er) { toast(er.message, true); } };
      $('#lf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.to_store = !!x.to_store; x.final = !!x.final; if (photo) x.photo = photo; busy(e.submitter, async () => { await api(`/farm/plantings/${p.id}/log`, x); d.close(); toast('Saved'); route(); }, $('#le', d)); });
    });
  }
  async function taskDlg(t = {}) {
    const [w, p] = await Promise.all([api('/farm/workers'), api('/farm/plantings')]);
    dlg(`${head(t.id ? 'Edit task' : 'New task')}<form class="stack" id="tf"><label class="f">Task<input name="title" required maxlength="120" value="${esc(t.title || '')}" placeholder="e.g. Spray tomatoes, fix the fence"></label>
      <label class="f">Details<textarea name="details" rows="2">${esc(t.details || '')}</textarea></label>
      <div class="grid3"><label class="f">Due<input type="date" name="due" value="${esc(t.due || today())}"></label><label class="f">Who<select name="worker_id">${opt(w.items.filter((x) => x.status === 'active').map((x) => [x.id, x.name]), t.worker_id, 'Me / anyone')}</select></label><label class="f">Repeat every (days)<input name="repeat_days" type="number" min="0" value="${esc(t.repeat_days || '')}" placeholder="No repeat"></label></div>
      <label class="f">Crop / batch<select name="planting_id">${opt(p.items.map((x) => [x.id, x.crop + (x.variety ? ' · ' + x.variety : '')]), t.planting_id, 'Whole farm')}</select></label>
      <p class="err" id="te"></p><div class="row"><button class="btn">Save task</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`, (d) => {
      $('#tf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); if (t.id) x.id = t.id; busy(e.submitter, async () => { await api('/farm/tasks', x); d.close(); toast('Task saved'); route(); }, $('#te', d)); });
    });
  }
  async function farmTasks(v, id, Q) {
    const st = Q.get('status') || 'open';
    const { items } = await api('/farm/tasks?status=' + st);
    const groups = st === 'open' ? [['Overdue', items.filter((t) => t.due < today())], ['Today', items.filter((t) => t.due === today())], ['Next 7 days', items.filter((t) => t.due > today() && t.due <= addD(7))], ['Later', items.filter((t) => t.due > addD(7))]] : [['Done', items]];
    v.innerHTML = page(ph('Tasks', 'Your crop calendars fill this automatically. Tick tasks off as you go; repeating tasks come back by themselves.', `<button class="btn" id="nt">${ic('plus', 16)} New task</button>`) + ftabs('tasks') + `<nav class="tabs">${[['open', 'To do'], ['done', 'Done']].map(([k, l]) => `<a href="#/farm/tasks?status=${k}" aria-current="${k === st}">${l}</a>`).join('')}</nav>` +
      groups.filter(([, l]) => l.length).map(([g, l]) => `<h3 style="margin:16px 0 8px">${g} (${l.length})</h3><div class="list">${st === 'open' ? l.map(taskItem).join('') : l.map((t) => `<div class="item"><span class="em">✓</span><span><b>${esc(t.title)}</b><small>${t.crop ? esc(t.crop) + ' · ' : ''}${t.status} ${fdate((t.done_at || '').slice(0, 10))}</small></span><button class="link" data-re="${t.id}">Undo</button></div>`).join('')}</div>`).join('') + (items.length ? '' : '<p class="empty">Nothing here.</p>'));
    wireTasks(v, route);
    $$('[data-re]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api('/farm/tasks', { id: Number(b.dataset.re), reopen: 1 }); route(); }));
    $('#nt', v).onclick = () => taskDlg();
  }
  const addD = (n) => { const d = new Date(today() + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  async function farmWorkers(v, id, Q) {
    const date = Q.get('date') || today();
    const [{ items }, pr] = await Promise.all([api('/farm/workers?date=' + date), api('/farm/payroll')]);
    const act = items.filter((w) => w.status === 'active');
    v.innerHTML = page(ph('Workers & pay', 'Mark attendance each day. Payroll adds up days, piece work and advances for you.', `<button class="btn" id="nw">${ic('plus', 16)} Add worker</button><button class="btn ghost" id="pr">${ic('wallet', 16)} Run payroll</button>`) + ftabs('workers') + `
      <div class="card stack"><div class="between"><h2>Attendance</h2><input type="date" id="ad" value="${date}" max="${today()}" style="max-width:180px" aria-label="Date"></div>
        ${act.length ? `<form id="af" class="list">${act.map((w) => `<div class="item" style="grid-template-columns:minmax(0,1fr) auto"><span><b><a href="#/farm/worker/${w.id}">${esc(w.name)}</a></b><small>${esc(w.role || '')} · ${w.pay_type === 'daily' ? money(w.rate) + '/day' : w.pay_type === 'piece' ? money(w.rate) + '/unit' : money(w.rate) + '/month'} · ${qn(w.days_month)} days this month${w.owed ? ' · advances ' + money(w.owed) : ''}</small></span>
          <span class="row" style="gap:6px"><select name="s${w.id}" aria-label="Attendance for ${esc(w.name)}" style="width:auto">${opt([['present', 'Present'], ['half', 'Half day'], ['absent', 'Absent'], ['leave', 'Paid leave'], ['sick', 'Sick']], w.today || 'present')}</select>${w.pay_type === 'piece' ? `<input name="q${w.id}" type="number" step="any" min="0" placeholder="Units" value="${esc(w.piece_qty ?? '')}" style="width:90px">` : ''}</span></div>`).join('')}
          <div class="row"><button class="btn">${ic('check', 16)} Save attendance for ${date === today() ? 'today' : fdate(date)}</button>${items.some((w) => w.today) ? pill('Saved', 'green') : ''}</div></form>` : '<p class="muted">Add your workers to track attendance and pay.</p>'}</div>
      <div class="grid2" style="margin-top:16px"><div class="card stack"><h2>Pay runs</h2>${pr.items.length ? pr.items.map((r) => `<a class="item" href="#/farm/pay/${r.id}"><span class="em">💵</span><span><b>${fdate(r.period_from)} – ${fdate(r.period_to)}</b><small>${r.people} workers</small></span><span class="r">${pill(r.status === 'paid' ? 'Paid' : 'Draft', r.status === 'paid' ? 'green' : 'amber')}<b>${money(r.total)}</b></span></a>`).join('') : '<p class="muted small">No pay runs yet.</p>'}</div>
      <div class="card stack"><h2>Former workers</h2>${items.filter((w) => w.status !== 'active').map((w) => `<p><a href="#/farm/worker/${w.id}">${esc(w.name)}</a></p>`).join('') || '<p class="muted small">None.</p>'}<a class="btn ghost sm" href="/api/farm/export/attendance">${ic('download', 15)} Attendance CSV</a></div></div>`);
    $('#ad', v).onchange = (e) => { location.hash = '#/farm/workers?date=' + e.target.value; };
    if ($('#af', v)) $('#af', v).addEventListener('submit', (e) => { e.preventDefault(); const fd = formData(e.target); busy(e.submitter, async () => { const r = await api('/farm/attendance', { date, items: act.map((w) => ({ worker_id: w.id, status: fd['s' + w.id], piece_qty: fd['q' + w.id] })) }); toast(`Attendance saved for ${r.saved}`); route(); }); });
    $('#nw', v).onclick = () => workerDlg();
    $('#pr', v).onclick = () => dlg(`${head('Run payroll', 'We add up attendance, piece work and unpaid advances. You can add bonuses and deductions before paying.')}<form class="stack" id="rf"><div class="grid2"><label class="f">From<input type="date" name="from" required value="${today().slice(0, 8)}01"></label><label class="f">To<input type="date" name="to" required value="${today()}"></label></div><p class="err" id="re"></p><button class="btn">Work out pay</button></form>`, (d) => {
      $('#rf', d).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { const r = await api('/farm/payroll', formData(e.target)); d.close(); location.hash = '#/farm/pay/' + r.id; }, $('#re', d)); });
    });
  }
  function workerDlg(w = {}) {
    dlg(`${head(w.id ? 'Edit worker' : 'Add a worker')}<form class="stack" id="wf"><div class="grid2"><label class="f">Name<input name="name" required value="${esc(w.name || '')}"></label><label class="f">Phone<input name="phone" type="tel" value="${esc(w.phone || '')}"></label></div>
      <div class="grid3"><label class="f">Job<input name="role" value="${esc(w.role || '')}" placeholder="e.g. General hand, supervisor"></label><label class="f">Paid<select name="pay_type">${opt([['daily', 'Per day'], ['monthly', 'Per month'], ['piece', 'Per unit (piece work)']], w.pay_type)}</select></label><label class="f">Rate (${esc(LK.currency)})<input name="rate" type="number" step="any" min="0" value="${esc(w.rate ?? '')}" required></label></div>
      <div class="grid2"><label class="f">Started<input type="date" name="start" value="${esc(w.start || today())}"></label><label class="f">Notes<input name="notes" value="${esc(w.notes || '')}"></label></div>
      <p class="err" id="we"></p><div class="row"><button class="btn">Save</button>${w.id ? `<button class="btn ghost" type="button" id="lv">${w.status === 'active' ? 'Mark as left' : 'Mark as working again'}</button>` : ''}</div></form>`, (d) => {
      $('#wf', d).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); if (w.id) x.id = w.id; busy(e.submitter, async () => { await api('/farm/workers', x); d.close(); toast('Saved'); route(); }, $('#we', d)); });
      if ($('#lv', d)) $('#lv', d).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/workers', { id: w.id, name: w.name, status: w.status === 'active' ? 'left' : 'active' }); d.close(); route(); });
    });
  }
  async function farmWorker(v, id) {
    const d = await api('/farm/workers/' + id), w = d.item;
    v.innerHTML = page(`<p style="margin-bottom:12px"><a href="#/farm/workers">← Workers</a></p>` + ph(esc(w.name), `${esc(w.role || '')} · ${w.pay_type === 'daily' ? money(w.rate) + ' per day' : w.pay_type === 'piece' ? money(w.rate) + ' per unit' : money(w.rate) + ' per month'} · since ${fdate(w.start)}`, `<button class="btn ghost" id="ed">Edit</button><button class="btn ghost" id="av">Give advance</button>${w.phone ? `<a class="btn ghost" href="${wa(w.phone)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}`) + `
      <div class="grid2"><div class="card stack"><h2>Attendance</h2>${d.attendance.length ? `<div class="tw"><table class="t"><tbody>${d.attendance.map((a) => `<tr><td>${fdate(a.date)}</td><td>${pill(a.status, a.status === 'present' ? 'green' : a.status === 'absent' ? 'red' : 'amber')}</td><td>${a.piece_qty ? qn(a.piece_qty) + ' units' : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">No attendance yet.</p>'}</div>
      <div class="stack"><div class="card stack"><h2>Advances</h2>${d.advances.map((a) => `<p class="between small"><span>${fdate(a.date)} ${esc(a.note || '')}</span><b>${money(a.amount)} ${a.run_id ? pill('Repaid', 'green') : ''}</b></p>`).join('') || '<p class="muted small">None.</p>'}</div>
      <div class="card stack"><h2>Payslips</h2>${d.pay.map((p) => `<a class="between small" href="#/farm/pay/${p.run_id}"><span>${fdate(p.period_from)} – ${fdate(p.period_to)}</span><b>${money(p.net)}</b></a>`).join('') || '<p class="muted small">None yet.</p>'}</div>
      <div class="card stack"><h2>Open tasks</h2>${d.tasks.map((t) => `<p class="small">${esc(t.title)} · ${fdate(t.due)}</p>`).join('') || '<p class="muted small">None.</p>'}</div></div></div>`);
    $('#ed', v).onclick = () => workerDlg(w);
    $('#av', v).onclick = () => dlg(`${head('Advance to ' + esc(w.name), 'It comes off their next pay automatically.')}<form class="stack" id="vf"><div class="grid2"><label class="f">Amount<input name="amount" type="number" step="any" min="0" required></label><label class="f">Date<input type="date" name="date" value="${today()}"></label></div><label class="f">Note<input name="note"></label><p class="err" id="ve"></p><button class="btn">Save advance</button></form>`, (dd) => {
      $('#vf', dd).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.worker_id = w.id; busy(e.submitter, async () => { await api('/farm/advances', x); dd.close(); toast('Advance recorded'); route(); }, $('#ve', dd)); });
    });
  }
  async function farmPay(v, id) {
    const d = await api('/farm/payroll/' + id), r = d.item, paid = r.status === 'paid';
    v.innerHTML = page(`<p style="margin-bottom:12px" class="noprint"><a href="#/farm/workers">← Workers & pay</a></p>` + ph(`Pay run ${fdate(r.period_from)} – ${fdate(r.period_to)}`, `${esc(d.farm.name)} · ${paid ? 'Paid ' + fdate((r.paid_at || '').slice(0, 10)) : 'Draft: check, adjust, then pay'}`, `<button class="btn ghost noprint" id="pt">${ic('download', 16)} Print payslips</button>`) + `
      <form id="pf" class="tw"><table class="t"><thead><tr><th>Worker</th><th>Days / units</th><th>Gross</th><th>Bonus</th><th>Advances</th><th>Deductions</th><th>Net pay</th></tr></thead><tbody>${d.items.map((i) => `<tr><td><b>${esc(i.name)}</b><br><span class="muted tiny">${esc(i.role || '')}</span></td><td>${i.pay_type === 'piece' ? qn(i.units) + ' units' : i.pay_type === 'monthly' ? 'Monthly' : qn(i.days) + ' days'}</td><td>${money(i.gross)}</td>
        <td>${paid ? money(i.bonus) : `<input name="b${i.id}" type="number" step="any" min="0" value="${i.bonus}" style="width:90px">`}</td><td>${money(i.advances)}</td><td>${paid ? money(i.deductions) : `<input name="d${i.id}" type="number" step="any" min="0" value="${i.deductions}" style="width:90px">`}</td><td><b>${money(i.net)}</b></td></tr>`).join('')}
        <tr><td colspan="6"><b>Total to pay out now</b></td><td><b>${money(d.items.reduce((a, i) => a + i.net, 0))}</b></td></tr></tbody></table></form>
      ${paid ? '' : `<div class="row noprint" style="margin-top:14px"><button class="btn ghost" id="sv">Save changes</button><button class="btn" id="pd">${ic('check', 16)} Mark as paid</button><button class="btn ghost" id="dl">Delete draft</button></div><p class="hint noprint">Marking as paid records the wages in your farm accounts and clears the advances.</p>`}
      <div class="slips">${d.items.map((i) => `<div class="slip"><b>${esc(d.farm.name)} · Payslip</b><p>${esc(i.name)}${i.role ? ', ' + esc(i.role) : ''}<br>Period ${fdate(r.period_from)} – ${fdate(r.period_to)}</p><p>${i.pay_type === 'piece' ? qn(i.units) + ' units × ' + money(i.rate) : i.pay_type === 'monthly' ? 'Monthly ' + money(i.rate) : qn(i.days) + ' days × ' + money(i.rate)} = ${money(i.gross)}<br>Bonus ${money(i.bonus)} · Advances −${money(i.advances)} · Deductions −${money(i.deductions)}</p><p><b>Net pay ${money(i.net)}</b></p><p class="tiny">Received by: ____________________</p></div>`).join('')}</div>`);
    const items = () => { const fd = formData($('#pf', v)); return d.items.map((i) => ({ id: i.id, bonus: fd['b' + i.id], deductions: fd['d' + i.id] })); };
    $('#pt', v).onclick = () => window.print();
    if (!paid) {
      $('#sv', v).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/payroll', { id: r.id, items: items() }); toast('Saved'); route(); });
      $('#pd', v).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/payroll', { id: r.id, items: items() }); const x = await api('/farm/payroll', { id: r.id, pay: 1 }); toast(`Paid: ${money(x.total)} recorded under Labour`); route(); });
      $('#dl', v).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/payroll', { id: r.id, delete: 1 }); location.hash = '#/farm/workers'; });
    }
  }
  function stockDlg(items, pre = {}) {
    api('/farm/plantings').then((p) => dlg(`${head({ purchase: 'Stock in', use: 'Use on a crop', sale: 'Sold (outside FreeFarm)', loss: 'Loss / spoilt' }[pre.kind] || 'Stock movement')}<form class="stack" id="sf">
      <div class="grid2"><label class="f">Item<select name="item_id" required>${opt(items.map((i) => [i.id, `${i.name} (${qn(i.qty)} ${i.unit})`]), pre.item_id, 'Choose…')}</select></label><label class="f">What happened<select name="kind">${opt([['purchase', 'Bought / received'], ['use', 'Used on a crop or animals'], ['sale', 'Sold'], ['loss', 'Lost / spoilt'], ['adjust', 'Count correction (+/−)']], pre.kind)}</select></label></div>
      <div class="grid3"><label class="f">Quantity<input name="qty" type="number" step="any" required></label><label class="f" id="cst">Total cost<input name="cost" type="number" step="any" min="0"></label><label class="f" id="amt">Sold for<input name="amount" type="number" step="any" min="0"></label><label class="f">Date<input type="date" name="date" value="${today()}"></label></div>
      <label class="f" id="pl">Crop / batch<select name="planting_id">${opt(p.items.map((x) => [x.id, x.crop + (x.variety ? ' · ' + x.variety : '')]), pre.planting_id, 'None')}</select></label>
      <label class="f">Note<input name="note"></label><p class="err" id="se"></p><button class="btn">Save</button></form>`, (d) => {
      const f = $('#sf', d), k = () => { const x = f.elements.kind.value; $('#cst', f).hidden = x !== 'purchase'; $('#amt', f).hidden = x !== 'sale'; $('#pl', f).hidden = !['use', 'sale'].includes(x); };
      f.elements.kind.onchange = k; k();
      f.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/farm/stock', formData(f)); d.close(); toast('Store updated'); route(); }, $('#se', d)); });
    }));
  }
  async function farmStore(v) {
    const d = await api('/farm/inventory');
    const val = d.items.reduce((a, i) => a + i.value, 0);
    v.innerHTML = page(ph('Store', `Seed, fertiliser, chemicals, feed, fuel and harvested produce. Stock value about ${money(val)}.`, `<button class="btn" id="ni">${ic('plus', 16)} New item</button><button class="btn ghost" id="mv">Stock in / out</button>`) + ftabs('store') + `
      ${d.items.filter((i) => i.low).length ? `<div class="banner warn" style="margin-bottom:12px">${ic('box')}<span style="flex:1">${d.items.filter((i) => i.low).map((i) => esc(i.name)).join(', ')} running low.</span><a class="btn sm" href="#/market?category=Farm%20inputs">Inputs store</a></div>` : ''}
      ${d.items.length ? `<div class="tw"><table class="t"><thead><tr><th>Item</th><th>In stock</th><th>Reorder at</th><th>Unit cost</th><th>Value</th><th></th></tr></thead><tbody>${d.items.map((i) => `<tr><td><b>${esc(i.name)}</b><br><span class="muted tiny">${esc(i.category)}${i.withholding_days ? ' · withholding ' + i.withholding_days + ' days' : ''}</span></td><td style="${i.low ? 'color:var(--red);font-weight:700' : ''}">${qn(i.qty)} ${esc(i.unit)}</td><td>${i.reorder != null ? qn(i.reorder) : '—'}</td><td>${i.unit_cost ? money(i.unit_cost) : '—'}</td><td>${money(i.value)}</td><td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn ghost sm" data-in="${i.id}">+ In</button><button class="btn ghost sm" data-out="${i.id}">− Use</button><button class="link" data-ed="${i.id}">Edit</button></div></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Your store is empty. Add what you have so FreeFarm can warn you before you run out.</p>'}
      <div class="card stack" style="margin-top:16px"><div class="between"><h2>Recent movements</h2><a class="btn ghost sm" href="/api/farm/export/stock">${ic('download', 15)} CSV</a></div>${d.moves.length ? `<div class="tw"><table class="t"><tbody>${d.moves.map((m) => `<tr><td>${fdate(m.date)}</td><td>${esc(m.name)}</td><td>${esc(m.kind)}</td><td style="color:${m.qty < 0 ? 'var(--red)' : 'var(--green)'}">${m.qty > 0 ? '+' : ''}${qn(m.qty)} ${esc(m.unit)}</td><td class="small">${m.crop ? esc(m.crop) : ''} ${esc(m.note || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">No movements yet.</p>'}</div>`);
    const itemDlg = (i = {}) => dlg(`${head(i.id ? 'Edit item' : 'New store item')}<form class="stack" id="if"><div class="grid2"><label class="f">Name<input name="name" required value="${esc(i.name || '')}" placeholder="e.g. Compound D, Mancozeb, Broiler starter"></label><label class="f">Type<select name="category">${opt(d.categories, i.category || 'Fertiliser')}</select></label></div>
      <div class="grid3"><label class="f">Unit<input name="unit" value="${esc(i.unit || 'kg')}" placeholder="kg, 50kg bag, litre"></label><label class="f">Warn me at<input name="reorder" type="number" step="any" min="0" value="${esc(i.reorder ?? '')}"></label><label class="f">Withholding days<input name="withholding_days" type="number" min="0" value="${esc(i.withholding_days ?? '')}"><span class="hint">For chemicals: days before harvest</span></label></div>
      ${i.id ? '' : '<div class="grid2"><label class="f">Quantity now<input name="qty" type="number" step="any" min="0"></label><label class="f">What it cost (total)<input name="cost" type="number" step="any" min="0"></label></div><label class="check"><input type="checkbox" name="book"> Record that cost as an expense now</label>'}
      <p class="err" id="ie"></p><div class="row"><button class="btn">Save</button>${i.id ? '<button class="btn ghost" type="button" id="rm">Remove</button>' : ''}</div></form>`, (dd) => {
      $('#if', dd).addEventListener('submit', (e) => { e.preventDefault(); const x = formData(e.target); x.book = !!x.book; if (i.id) x.id = i.id; busy(e.submitter, async () => { await api('/farm/inventory', x); dd.close(); toast('Saved'); route(); }, $('#ie', dd)); });
      if ($('#rm', dd)) $('#rm', dd).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/inventory', { id: i.id, name: i.name, remove: 1 }); dd.close(); route(); });
    });
    $('#ni', v).onclick = () => itemDlg();
    $('#mv', v).onclick = () => d.items.length ? stockDlg(d.items, { kind: 'purchase' }) : toast('Add an item first', true);
    $$('[data-in]', v).forEach((b) => b.onclick = () => stockDlg(d.items, { kind: 'purchase', item_id: Number(b.dataset.in) }));
    $$('[data-out]', v).forEach((b) => b.onclick = () => stockDlg(d.items, { kind: 'use', item_id: Number(b.dataset.out) }));
    $$('[data-ed]', v).forEach((b) => b.onclick = () => itemDlg(d.items.find((i) => String(i.id) === b.dataset.ed)));
  }
  async function farmMoney(v, id, Q) {
    const from = Q.get('from') || today().slice(0, 5) + '01-01', to = Q.get('to') || today();
    const d = await api(`/farm/accounts?from=${from}&to=${to}`);
    const inc = d.months.reduce((a, m) => a + m.income, 0), exp = d.months.reduce((a, m) => a + m.expense, 0), mx = Math.max(1, ...d.months.map((m) => Math.max(m.income, m.expense)));
    v.innerHTML = page(ph('Money', 'Your farm books. FreeFarm sales, wages and stock purchases are recorded automatically.', `<button class="btn" id="ne">${ic('plus', 16)} Add income or expense</button><a class="btn ghost" href="/api/farm/export/accounts">${ic('download', 16)} CSV for your accountant</a>`) + ftabs('money') + `
      <div class="card row" style="margin-bottom:14px"><label class="f">From<input type="date" id="fr" value="${from}"></label><label class="f">To<input type="date" id="to" value="${to}"></label></div>
      <div class="kpis"><div class="kpi"><span>Money in</span><b style="color:var(--green)">${money(inc)}</b></div><div class="kpi"><span>Money out</span><b style="color:var(--red)">${money(exp)}</b></div><div class="kpi ${inc - exp < 0 ? 'hot' : ''}"><span>Profit</span><b>${money(inc - exp)}</b></div><div class="kpi"><span>Stock on hand</span><b>${money(d.stock_value)}</b><small>${d.wages_due ? 'Wages due ' + money(d.wages_due) : 'No wages waiting'}</small></div></div>
      <div class="grid2" style="margin-top:16px"><div class="card stack"><h2>By month</h2>${d.months.length ? `<div class="bars">${d.months.map((m) => `<div><span class="muted small">${MON[Number(m.m.slice(5)) - 1]}</span><i class="in" style="width:${(m.income / mx) * 100}%" title="In ${money(m.income)}"></i><i class="out" style="width:${(m.expense / mx) * 100}%" title="Out ${money(m.expense)}"></i><small>${money(m.income - m.expense)}</small></div>`).join('')}</div><p class="tiny muted"><span style="color:var(--leaf)">■</span> in <span style="color:var(--red)">■</span> out</p>` : '<p class="muted small">No entries yet.</p>'}</div>
      <div class="card stack"><h2>Where the money goes</h2>${d.cats.length ? d.cats.map((c) => `<p class="between small"><span>${c.kind === 'income' ? '⬆' : '⬇'} ${esc(c.category)}</span><b style="color:${c.kind === 'income' ? 'var(--green)' : 'var(--red)'}">${money(c.total)}</b></p>`).join('') : '<p class="muted small">Nothing yet.</p>'}</div></div>
      <div class="card stack" style="margin-top:16px"><h2>Entries</h2>${d.items.length ? `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>What</th><th>Crop</th><th>Amount</th><th></th></tr></thead><tbody>${d.items.map((a) => `<tr><td>${fdate(a.date)}</td><td><b>${esc(a.category)}</b><br><span class="muted tiny">${esc(a.note || '')} ${esc(a.ref || '')}${a.auto_ref ? ' · automatic' : ''}</span></td><td>${a.crop ? esc(a.crop) : ''}</td><td style="color:${a.kind === 'income' ? 'var(--green)' : 'var(--red)'};font-weight:700">${a.kind === 'income' ? '+' : '−'}${money(a.amount)}</td><td>${a.auto_ref ? '' : `<button class="link" data-del="${a.id}">Delete</button>`}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">No entries in these dates.</p>'}</div>`);
    const go = () => { location.hash = `#/farm/money?from=${$('#fr', v).value}&to=${$('#to', v).value}`; };
    $('#fr', v).onchange = go; $('#to', v).onchange = go;
    $$('[data-del]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api('/farm/accounts', { id: Number(b.dataset.del), delete: 1 }); route(); }));
    $('#ne', v).onclick = async () => { const p = await api('/farm/plantings?status=all'); dlg(`${head('Add income or expense')}<form class="stack" id="af"><div class="radios" style="grid-template-columns:1fr 1fr"><label class="radio"><input type="radio" name="kind" value="expense" checked><span><b>Money out</b></span></label><label class="radio"><input type="radio" name="kind" value="income"><span><b>Money in</b></span></label></div>
      <div class="grid3"><label class="f">Category<select name="category" id="ac"></select></label><label class="f">Amount<input name="amount" type="number" step="any" min="0" required></label><label class="f">Date<input type="date" name="date" value="${today()}"></label></div>
      <label class="f">For which crop / batch (optional)<select name="planting_id">${opt(p.items.map((x) => [x.id, x.crop + ' · ' + fdate(x.planted)]), '', 'Whole farm')}</select></label><label class="f">Note<input name="note" placeholder="e.g. Diesel for pump, tractor hire"></label><p class="err" id="ae"></p><button class="btn">Save</button></form>`, (dd) => {
      const f = $('#af', dd), fill = () => { $('#ac', f).innerHTML = opt(d.categories[f.elements.kind.value], ''); };
      f.addEventListener('change', (e) => { if (e.target.name === 'kind') fill(); }); fill();
      f.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/farm/accounts', formData(f)); dd.close(); toast('Saved'); route(); }, $('#ae', dd)); });
    }); };
  }
  async function farmWeather(v, id, Q) {
    const d = await api('/farm/weather' + (Q.get('refresh') ? '?refresh=1' : ''));
    v.innerHTML = page(ph('Weather & climate', d.at ? `For your farm location · updated ${ago(d.at)} · <a href="#/farm/weather?refresh=1">refresh</a>` : '', '') + ftabs('weather') + (!d.located ? `<div class="banner warn">${ic('pin')}<span>Set your farm location to get weather. <a href="#/farm/setup">Farm details</a></span></div>` : !d.ok ? `<div class="banner warn">${ic('alert')}<span>Weather is not available right now. Try again later.</span></div>` : `
      ${d.alerts.map((a) => `<div class="banner ${lvl(a.level)}" style="margin-bottom:10px">${ic('alert')}<span><b>${esc(a.title)}.</b> ${esc(a.text)}</span></div>`).join('') || `<div class="banner ok" style="margin-bottom:10px">${ic('check')}<span>No weather warnings or disease risks for your crops right now.</span></div>`}
      <div class="card stack"><h2>Next 7 days</h2><div class="wx wide">${d.next.map((x) => `<div><small>${x.date === today() ? 'Today' : new Date(x.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}</small><span>${WMO(x.code)}</span><b>${Math.round(x.tmax)}°</b><small>${Math.round(x.tmin)}°</small><small>💧 ${Math.round(x.rain)} mm${x.pop != null ? ' · ' + x.pop + '%' : ''}</small><small>💨 ${Math.round(x.wind)}</small></div>`).join('')}</div></div>
      <div class="grid2" style="margin-top:16px"><div class="card stack"><h2>Advice</h2>${d.advice.map((a) => `<p>• ${esc(a)}</p>`).join('')}</div>
      <div class="card stack"><h2>Last 14 days</h2><p class="small">Rain: <b>${Math.round(d.past.reduce((a, x) => a + x.rain, 0))} mm</b> · Hottest ${Math.round(Math.max(...d.past.map((x) => x.tmax)))}°C · Coldest ${Math.round(Math.min(...d.past.map((x) => x.tmin)))}°C</p><div class="rainbars">${d.past.map((x) => `<i style="height:${Math.min(100, x.rain * 3)}%" title="${x.date}: ${Math.round(x.rain)} mm"></i>`).join('')}</div><p class="tiny muted">Daily rain, oldest on the left. Weather data: Open-Meteo.</p></div></div>
      <p class="hint" style="margin-top:12px">Disease and pest risks are worked out from temperature, humidity and rain for the crops you are growing. They are early warnings: scout your crops to confirm.</p>`));
  }
  async function farmDoctor(v, id, Q) {
    const [{ items }, p] = await Promise.all([api('/farm/scans'), api('/farm/plantings').catch(() => ({ items: [] }))]);
    const pre = Q.get('planting') ? p.items.find((x) => String(x.id) === Q.get('planting')) : null;
    v.innerHTML = page(ph('Plant doctor', 'Take a clear photo of the sick leaf, fruit, stem or animal sign. The AI tells you what it is likely to be and what to do.') + ftabs('doctor') + `
      <div class="detail"><form class="card stack" id="sf"><label class="f">Crop<select name="planting" id="pl">${opt(p.items.map((x) => [x.id, x.crop + (x.variety ? ' · ' + x.variety : '')]), pre && pre.id, 'Other / not on my farm')}</select></label>
        <label class="f" id="oc">Which crop<select name="crop">${cropOpts(pre ? pre.crop : '', 'Choose…')}</select></label>
        <label class="f">Photo<input type="file" id="ph" accept="image/*" capture="environment" required></label><div id="pv"></div>
        <label class="f">What have you noticed? (optional)<input name="notes" maxlength="300" placeholder="e.g. spots started after rain, spreading fast"></label>
        <p class="err" id="se"></p><button class="btn">${ic('search', 16)} Check my plant</button><p class="hint">AI advice can be wrong. For serious or spreading problems, confirm with your extension officer (AGRITEX in Zimbabwe) or an agro-dealer. Always follow the product label.</p></form>
      <div class="stack"><div class="card stack" id="res" hidden></div><div class="card stack"><h2>Past scans</h2>${items.length ? items.map((s) => `<details style="border-top:1px solid var(--line2);padding-top:8px"><summary><b>${emo(s.crop)} ${esc(s.crop)}: ${esc(s.problem)}</b> <span class="muted small">${ago(s.created_at)}</span></summary>${resultHTML(s.result, s.id)}</details>`).join('') : '<p class="muted small">No scans yet.</p>'}</div></div></div>`);
    let photo;
    const sync = () => { $('#oc', v).hidden = !!$('#pl', v).value; };
    $('#pl', v).onchange = sync; sync();
    $('#ph', v).onchange = async (e) => { try { photo = await resizeImage(e.target.files[0], 1000); $('#pv', v).innerHTML = `<img src="${photo}" alt="" style="max-height:200px;border-radius:12px">`; } catch (er) { toast(er.message, true); } };
    $('#sf', v).addEventListener('submit', (e) => {
      e.preventDefault(); if (!photo) { $('#se', v).textContent = 'Add a photo first.'; return; }
      const x = formData(e.target), pl = p.items.find((y) => String(y.id) === x.planting);
      busy(e.submitter, async () => {
        e.submitter.textContent = 'Checking… (about 10 seconds)';
        try {
          const r = await api('/farm/scan', { photo, planting_id: pl ? pl.id : null, crop: pl ? pl.crop : x.crop, notes: x.notes });
          const box = $('#res', v); box.hidden = false; box.innerHTML = `<h2>${r.result.healthy ? '✅' : '🩺'} ${esc(r.result.problem)}</h2>` + resultHTML(r.result, r.id) + (pl && !r.result.healthy ? '<p class="small">A treatment task was added to your calendar.</p>' : '');
          box.scrollIntoView({ behavior: 'smooth' });
        } finally { e.submitter.innerHTML = `${ic('search', 16)} Check my plant`; }
      }, $('#se', v));
    });
  }
  function resultHTML(r, id) {
    if (!r) return '';
    const L = (t, x) => x ? `<p class="small"><b>${t}:</b> ${esc(x)}</p>` : '';
    return `<div class="stack" style="gap:6px;margin-top:6px">${id ? `<img src="/api/farm/photo/scan/${id}" alt="" loading="lazy" style="max-height:150px;border-radius:10px">` : ''}<div class="row">${pill((r.confidence || 'low') + ' confidence', r.confidence === 'high' ? 'green' : 'amber')}${r.type && r.type !== 'none' ? pill(r.type, 'blue') : ''}${r.spread_risk ? pill('spread risk ' + r.spread_risk, r.spread_risk === 'high' ? 'red' : '') : ''}</div>
      ${L('What we see', r.signs)}${L('Cause', r.cause)}${Array.isArray(r.act_now) && r.act_now.length ? `<p class="small"><b>Do now:</b></p><ol class="small" style="margin:0;padding-left:20px">${r.act_now.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}${L('Low-cost / organic option', r.organic)}${L('Product type', r.chemical)}${L('Prevent next time', r.prevent)}
      ${r.see_expert ? `<div class="banner warn">${ic('alert')}<span>Show this to an extension officer or vet to confirm.</span></div>` : ''}${r.chemical || r.type === 'nutrient' ? `<a class="btn ghost sm" href="#/market?category=Farm%20inputs&q=${encodeURIComponent(r.type === 'nutrient' ? 'Fertiliser' : 'Crop chemicals')}">Find it in the inputs store</a>` : ''}</div>`;
  }
  async function farmAdvisor(v) {
    const { items } = await api('/farm/ask');
    v.innerHTML = page(ph('Farm advisor', 'Ask anything about your crops, animals, inputs, weather or selling. The advisor knows your farm, crops, stages, weather and store.') + ftabs('advisor') + `
      <div class="card stack" style="max-width:860px"><div class="chat" id="ch" style="max-height:520px">${items.slice().reverse().map((x) => `<div class="msg me">${esc(x.q)}</div><div class="msg">${esc(x.a)}<small>FreeFarm advisor · ${ago(x.created_at)}</small></div>`).join('') || '<p class="muted small">Try: "When should I top-dress my maize?", "How do I stop tomato blight this week?", "What should I plant next season on Block A?", "How much feed do 500 broilers need?"</p>'}</div>
        <form class="row" id="qf" style="flex-wrap:nowrap"><input name="q" maxlength="800" placeholder="Ask the advisor" aria-label="Question" autocomplete="off"><button class="btn" aria-label="Ask">${ic('send', 16)}</button></form><p class="err" id="qe"></p><p class="hint">AI advice is a guide. Follow product labels and check with your extension officer for serious problems.</p></div>`);
    const ch = $('#ch', v); ch.scrollTop = ch.scrollHeight;
    $('#qf', v).addEventListener('submit', (e) => { e.preventDefault(); const q = e.target.elements.q.value.trim(); if (!q) return; ch.insertAdjacentHTML('beforeend', `<div class="msg me">${esc(q)}</div><div class="msg" id="wait">Thinking…</div>`); ch.scrollTop = ch.scrollHeight; e.target.reset();
      busy(e.submitter, async () => { try { const r = await api('/farm/ask', { q }); $('#wait', v).outerHTML = `<div class="msg">${esc(r.a)}<small>FreeFarm advisor · just now</small></div>`; ch.scrollTop = ch.scrollHeight; } catch (er) { $('#wait', v).remove(); throw er; } }, $('#qe', v)); });
  }
  async function farmSensors(v) {
    const [d, fl] = await Promise.all([api('/farm/sensors'), api('/farm/fields')]);
    const MET = { tmin: 'Lowest temperature (next 3 days)', tmax: 'Highest temperature (next 3 days)', rain: 'Rain in a day (mm)', wind: 'Wind (km/h)' };
    v.innerHTML = page(ph('Automations', 'Rules that watch the weather and your sensors and act for you: send an alert or put a task on the calendar.', `<button class="btn" id="nr">${ic('plus', 16)} New rule</button>`) + ftabs('sensors') + `
      <div class="card stack"><h2>Built in (always on)</h2><div class="list">${[['🌱', 'Crop calendars create planting, fertiliser, spray, vaccination and harvest tasks'], ['🌦️', 'Frost, heat, heavy rain, wind and dry-spell warnings for your location'], ['🦠', 'Disease and pest risk from the weather, and outbreak alerts from farms near you'], ['📦', 'Low-stock warnings and input suggestions before tasks need them'], ['🧪', 'Chemical withholding periods: warnings before you harvest or sell'], ['💵', 'Month-end payroll reminder and daily farm summary'], ['🛒', 'Reminder to list produce before harvest so it sells, not rots']].map(([e, t]) => `<div class="item" style="grid-template-columns:auto 1fr"><span class="em">${e}</span><span>${t}</span></div>`).join('')}</div></div>
      <div class="card stack" style="margin-top:16px"><h2>Your rules</h2>${d.rules.length ? d.rules.map((r) => { const s = d.sensors.find((x) => 'sensor:' + x.id === r.source); return `<div class="between" style="border-top:1px solid var(--line2);padding-top:8px"><span><b>If ${r.source === 'weather' ? esc(MET[r.metric]) : esc(s ? s.name : 'sensor')} ${r.op === '<' ? 'below' : 'above'} ${qn(r.value)}</b><br><span class="muted small">then ${r.action === 'task' ? 'add a task' : 'alert me'}${r.message ? ': ' + esc(r.message) : ''}${r.last_fired ? ' · last ' + ago(r.last_fired) : ''}</span></span><span class="row" style="gap:6px"><button class="chip" data-tg="${r.id}" data-a="${r.active ? 0 : 1}" aria-pressed="${!!r.active}">${r.active ? 'On' : 'Off'}</button><button class="link" data-rm="${r.id}">Delete</button></span></div>`; }).join('') : '<p class="muted small">No rules yet. Example: "If the lowest temperature is below 3°C, alert me: cover the nursery".</p>'}</div>
      <div class="card stack" style="margin-top:16px"><div class="between"><h2>Sensors</h2>${d.full ? `<button class="btn ghost sm" id="ns">${ic('plus', 15)} Add sensor</button>` : ''}</div>
        ${d.full ? (d.sensors.length ? d.sensors.map((s) => `<div class="between" style="border-top:1px solid var(--line2);padding-top:8px"><span><b>${esc(s.name)}</b><br><span class="muted small">${esc(s.metric.replace('_', ' '))}${s.field ? ' · ' + esc(s.field) : ''} · ${s.last_at ? 'last ' + ago(s.last_at) : 'no data yet'}</span></span><b style="font:800 22px var(--display)">${s.last_value != null ? qn(s.last_value) + esc(s.unit || '') : '—'}</b></div>`).join('') : '<p class="muted small">Connect soil moisture probes, weather stations, tank level sensors or any device that can send data over the internet.</p>') +
          `<details><summary class="small"><b>How to connect a device</b></summary><p class="small">Send readings to <code>https://${location.host}/api/farm/data</code> with method POST, header <code>content-type: application/json</code>, and body:</p><pre class="code">{ "key": "${esc(d.key || 'your-farm-key')}", "readings": [ { "sensor": "Block A soil", "value": 23.5 } ] }</pre><p class="small">Use the exact sensor name. Keep the key private. <button class="link" id="nk">Make a new key</button></p></details>` : upsell('Sensors (soil moisture, tank levels, weather stations) and sensor automations are part of Farm Manager.')}</div>`);
    $('#nr', v).onclick = () => dlg(`${head('New automation rule')}<form class="stack" id="rf"><label class="f">Watch<select name="source">${opt([['weather', 'Weather forecast'], ...d.sensors.map((s) => ['sensor:' + s.id, 'Sensor: ' + s.name])], 'weather')}</select></label>
      <div class="grid3"><label class="f" id="wm">Measure<select name="metric">${opt(Object.entries(MET), 'tmin')}</select></label><label class="f">When it is<select name="op">${opt([['<', 'below'], ['>', 'above']], '<')}</select></label><label class="f">Value<input name="value" type="number" step="any" required></label></div>
      <label class="f">Then<select name="action">${opt([['alert', 'Send me an alert'], ['task', 'Add a task for today and alert me']], 'alert')}</select></label><label class="f">Message<input name="message" maxlength="160" placeholder="e.g. Frost coming: cover the nursery tonight"></label><p class="err" id="re"></p><button class="btn">Save rule</button></form>`, (dd) => {
      const f = $('#rf', dd); f.elements.source.onchange = () => { $('#wm', f).hidden = f.elements.source.value !== 'weather'; };
      f.addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/farm/rules', formData(f)); dd.close(); toast('Rule saved'); route(); }, $('#re', dd)); });
    });
    $$('[data-tg]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api('/farm/rules', { id: Number(b.dataset.tg), active: b.dataset.a === '1' }); route(); }));
    $$('[data-rm]', v).forEach((b) => b.onclick = () => busy(b, async () => { await api('/farm/rules', { id: Number(b.dataset.rm), remove: 1 }); route(); }));
    if ($('#ns', v)) $('#ns', v).onclick = () => dlg(`${head('Add a sensor')}<form class="stack" id="sf"><label class="f">Name<input name="name" required placeholder="e.g. Block A soil"></label><div class="grid2"><label class="f">Measures<select name="metric">${opt([['soil_moisture', 'Soil moisture %'], ['soil_temp', 'Soil temperature'], ['air_temp', 'Air temperature'], ['humidity', 'Humidity'], ['water_level', 'Water level'], ['tank_level', 'Tank level %'], ['rain', 'Rain gauge'], ['other', 'Other']], 'soil_moisture')}</select></label><label class="f">Field<select name="field_id">${opt(fl.items.map((x) => [x.id, x.name]), '', 'None')}</select></label></div><p class="err" id="se"></p><button class="btn">Add</button></form>`, (dd) => {
      $('#sf', dd).addEventListener('submit', (e) => { e.preventDefault(); busy(e.submitter, async () => { await api('/farm/sensors', formData(e.target)); dd.close(); route(); }, $('#se', dd)); });
    });
    if ($('#nk', v)) $('#nk', v).onclick = (e) => busy(e.currentTarget, async () => { await api('/farm/sensors', { new_key: 1 }); toast('New key made. Update your devices.'); route(); });
  }

  /* ---------- start ---------- */
  async function start() {
    const [lk, me] = await Promise.all([api('/lookups'), api('/me')]);
    LK = lk; ME = me.user; BAL = me.balance || 0; FOLLOWS = me.follows || [];
    if (ME && ME.must_change) return mustChange();
    await render();
  }
  window.addEventListener('hashchange', () => { if (ME && ME.must_change) return; route(); });
  start().catch((e) => { document.body.innerHTML = `<p style="padding:30px;font-family:system-ui">Could not load FreeFarm: ${esc(e.message)}</p>`; });
})();
