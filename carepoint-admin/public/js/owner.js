/* CarePoint owner console: Nexora Digital adds and manages hospitals. Each hospital has its own database tables. */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function api(path, data) {
  const r = await fetch('/api/owner/' + path, { method: data ? 'POST' : 'GET', credentials: 'same-origin', headers: data ? { 'content-type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok) { const e = new Error(j.error || 'Could not reach the server.'); e.status = r.status; throw e; }
  return j;
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2600); }
const linkFor = (code) => location.origin + (code === 'main' ? '/' : '/?h=' + code);
const when = (s) => (s ? new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'never');
const CROSS = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#0f5c5c"/><path d="M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z" fill="#fff"/></svg>');
const slug = (s) => String(s || '').toLowerCase().replace(/hospital|clinic|medical|centre|center|the\b/g, '').replace(/[^a-z0-9]/g, '').slice(0, 20) || '';

function sheet(title, html) {
  closeSheet();
  const d = document.createElement('div'); d.className = 'drop'; d.id = 'drop';
  d.innerHTML = `<div class="sheet" role="dialog" aria-label="${esc(title)}"><button class="x" aria-label="Close" data-close>×</button><h2>${esc(title)}</h2>${html}</div>`;
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) closeSheet(); });
  document.body.appendChild(d); return d;
}
function closeSheet() { const d = $('#drop'); if (d) d.remove(); }

// shrink a picked logo to at most 256 px so it loads fast on phones
function readLogo(file) {
  return new Promise((res, rej) => {
    if (!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.type)) return rej(new Error('Pick a picture (PNG or JPG).'));
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 256 / Math.max(img.width, img.height)), w = Math.max(1, Math.round(img.width * k)), h = Math.max(1, Math.round(img.height * k));
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      let out = c.toDataURL('image/png'); if (out.length > 300000) out = c.toDataURL('image/jpeg', 0.85);
      res(out);
    };
    img.onerror = () => rej(new Error('That picture could not be opened.'));
    img.src = url;
  });
}
function logoPicker(form, current) {
  const box = $('.pick', form), img = $('img', box), inp = $('input[type=file]', box);
  form._logo = current === undefined ? undefined : current;
  inp.onchange = async () => { const f = inp.files[0]; if (!f) return; try { form._logo = await readLogo(f); img.src = form._logo; } catch (e) { $('.err', form).textContent = e.message; } };
  const rm = $('[data-rmlogo]', box); if (rm) rm.onclick = () => { form._logo = ''; img.src = CROSS; };
}
const pickHtml = (logo) => `<div class="full"><label>Logo</label><div class="pick"><img src="${esc(logo || CROSS)}" alt=""><div class="row"><label class="btn ghost sm" style="margin:0">Choose picture<input type="file" accept="image/*" hidden></label>${logo !== undefined ? '<button type="button" class="btn ghost sm" data-rmlogo>Remove</button>' : ''}</div></div><p class="muted sm">PNG or JPG. Square logos look best.</p></div>`;

function credsHtml(h, username, password, isNew) {
  const msg = `Hello. Your CarePoint Admin system for ${h.name} is ready.\n\nOpen: ${linkFor(h.code)}\nHospital code: ${h.code}\nUsername: ${username}\nTemporary password: ${password}\n\nYou will be asked to choose your own password when you first sign in. You can install it as an app from the sign-in page.\n\nNexora Digital`;
  return `<p>${isNew ? 'The hospital is set up with its own separate database.' : 'New temporary password made.'} Send these details to the administrator. The password is shown only once.</p>
    <div class="secret"><div>Link: <span class="link">${esc(linkFor(h.code))}</span></div><div class="mt">Hospital code: <b>${esc(h.code)}</b></div><div>Username: <b>${esc(username)}</b></div><div>Temporary password: <b>${esc(password)}</b></div></div>
    <div class="row"><button class="btn" id="cpM">Copy message</button><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">Send on WhatsApp</a></div>
    <textarea id="msgT" hidden>${esc(msg)}</textarea>`;
}
function wireCopy(d) { const b = $('#cpM', d); if (b) b.onclick = async () => { try { await navigator.clipboard.writeText($('#msgT', d).value); toast('Message copied'); } catch (e) { toast('Copy did not work. Select the details and copy them.'); } }; }

/* ---------------- screens ---------------- */
async function start() {
  const app = $('#app'); $('#hdr').innerHTML = '';
  let st; try { st = await api('state'); } catch (e) { app.innerHTML = `<div class="card auth"><h1>No connection</h1><p>${esc(e.message)}</p><button class="btn" onclick="location.reload()">Try again</button></div>`; return; }
  if (st.setup) return setupView(app);
  if (!st.signed) return loginView(app);
  $('#hdr').innerHTML = '<button class="btn light sm" id="pwB">Password</button> <button class="btn light sm" id="outB">Sign out</button>';
  $('#outB').onclick = async () => { await api('logout', {}); start(); };
  $('#pwB').onclick = passwordSheet;
  list(app);
}
function setupView(app) {
  app.innerHTML = `<div class="card auth"><h1>Set up the owner console</h1><p class="muted">This is where Nexora Digital adds hospitals. Enter the setup code and choose a strong owner password.</p>
  <form id="sf"><label>Setup code</label><input name="code" required><label class="mt">Owner password (10+ characters)</label><input type="password" name="password" minlength="10" autocomplete="new-password" required><p class="err"></p><button class="btn" style="width:100%">Create owner password</button></form></div>`;
  $('#sf').onsubmit = async (e) => { e.preventDefault(); const f = e.target; try { await api('setup', { code: f.elements.code.value.trim(), password: f.elements.password.value }); await api('login', { password: f.elements.password.value }); start(); } catch (x) { $('.err', f).textContent = x.message; } };
}
function loginView(app) {
  app.innerHTML = `<div class="card auth"><h1>Owner sign in</h1><p class="muted">Nexora Digital only. Hospital staff sign in on the hospital link.</p>
  <form id="lf"><label>Owner password</label><input type="password" name="password" autocomplete="current-password" required><p class="err"></p><button class="btn" style="width:100%">Sign in</button></form></div>`;
  $('#lf').onsubmit = async (e) => { e.preventDefault(); const f = e.target; try { await api('login', { password: f.elements.password.value }); start(); } catch (x) { $('.err', f).textContent = x.message; } };
}
function passwordSheet() {
  const d = sheet('Change owner password', `<form id="pf"><label>Current password</label><input type="password" name="old" required><label class="mt">New password (10+)</label><input type="password" name="password" minlength="10" required><p class="err"></p><button class="btn">Save</button></form>`);
  $('#pf', d).onsubmit = async (e) => { e.preventDefault(); const f = e.target; try { await api('password', { old: f.elements.old.value, password: f.elements.password.value }); closeSheet(); toast('Password changed'); } catch (x) { $('.err', f).textContent = x.message; } };
}

let HOSP = [];
async function list(app) {
  try { HOSP = (await api('hospitals')).hospitals; } catch (e) { if (e.status === 401) return start(); app.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  app.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:14px"><div><h1>Hospitals</h1><p class="muted sm" style="margin:0">${HOSP.length} hospital${HOSP.length === 1 ? '' : 's'}. Each one has its own separate database, users and sign-in link.</p></div><button class="btn" id="addB">+ Add hospital</button></div>
  ${HOSP.map((h) => `<div class="card hosp"><img class="logo" src="${esc(h.logo || CROSS)}" alt=""><div class="body">
    <h3>${esc(h.name)}<span class="tag ${h.active ? '' : 'off'}">${h.active ? 'Active' : 'Paused'}</span></h3>
    <div class="stats"><span>Code: <b>${esc(h.code)}</b></span><span>${h.users} active user${h.users === 1 ? '' : 's'}</span><span>${h.records} records</span><span>${h.files} files</span><span>Last change: ${esc(when(h.last))}</span></div>
    <div class="link">${esc(linkFor(h.code))}</div>
    <ul class="admins">${h.admins.map((a) => `<li>Admin: <b>${esc(a.name)}</b> (${esc(a.username)}) · last sign-in ${esc(when(a.last_login))} <button class="btn ghost sm" data-reset="${esc(h.code)}" data-user="${esc(a.id)}">Reset password</button></li>`).join('') || '<li class="muted">No administrator yet</li>'}</ul>
    <div class="row mt"><button class="btn ghost sm" data-edit="${esc(h.code)}">Edit name / logo</button><button class="btn ghost sm" data-admin="${esc(h.code)}">Add administrator</button><button class="btn ghost sm" data-copy="${esc(h.code)}">Copy link</button><a class="btn ghost sm" href="${esc(linkFor(h.code))}" target="_blank" rel="noopener">Open</a><button class="btn ${h.active ? 'danger' : ''} sm" data-pause="${esc(h.code)}">${h.active ? 'Pause' : 'Resume'}</button></div>
  </div></div>`).join('')}`;
  $('#addB').onclick = addSheet;
  app.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const h = HOSP.find((x) => x.code === (b.dataset.edit || b.dataset.reset || b.dataset.pause || b.dataset.copy || b.dataset.admin));
    if (!h) return;
    if (b.dataset.edit) return editSheet(h);
    if (b.dataset.admin) return adminSheet(h);
    if (b.dataset.copy) { try { await navigator.clipboard.writeText(linkFor(h.code)); toast('Link copied'); } catch (x) { toast(linkFor(h.code)); } return; }
    if (b.dataset.reset) {
      if (!confirm('Make a new temporary password for this administrator? Their old password stops working.')) return;
      try { const r = await api('hospitals', { action: 'reset', code: h.code, user: b.dataset.user }); wireCopy(sheet('New password', credsHtml(h, r.username, r.password))); } catch (x) { toast(x.message); }
      return;
    }
    if (b.dataset.pause) {
      const pause = h.active; if (pause && !confirm(`Pause ${h.name}? Everyone there is signed out and cannot sign in until you resume it. No data is deleted.`)) return;
      try { await api('hospitals', { action: pause ? 'pause' : 'resume', code: h.code }); toast(pause ? 'Paused' : 'Resumed'); list(app); } catch (x) { toast(x.message); }
    }
  };
}
function addSheet() {
  const d = sheet('Add a hospital', `<form id="af" class="grid">
    <div class="full"><label>Hospital name</label><input name="name" placeholder="for example: Avenues Clinic" required></div>
    <div class="full"><label>Hospital code (used in the sign-in link)</label><input name="code" placeholder="avenues" pattern="[a-z][a-z0-9]{1,19}" required><p class="muted sm" id="cH">Small letters and numbers only. It cannot be changed later.</p></div>
    ${pickHtml()}
    <div class="full"><h3 style="margin:6px 0 0;font-size:15px">First administrator</h3></div>
    <div><label>Full name</label><input name="admin_name" required></div>
    <div><label>Username</label><input name="admin_username" autocapitalize="none" pattern="[a-z0-9._-]{3,40}" required></div>
    <div class="full"><p class="err"></p><button class="btn">Create hospital</button></div></form>`);
  const f = $('#af', d); let codeTouched = false;
  logoPicker(f);
  f.elements.name.oninput = () => { if (!codeTouched) f.elements.code.value = slug(f.elements.name.value); upd(); };
  f.elements.code.oninput = () => { codeTouched = true; f.elements.code.value = f.elements.code.value.toLowerCase().replace(/[^a-z0-9]/g, ''); upd(); };
  const upd = () => { $('#cH', d).textContent = f.elements.code.value ? 'Link: ' + linkFor(f.elements.code.value) : 'Small letters and numbers only. It cannot be changed later.'; };
  f.elements.admin_username.oninput = () => { f.elements.admin_username.value = f.elements.admin_username.value.toLowerCase().replace(/\s/g, ''); };
  f.onsubmit = async (e) => {
    e.preventDefault(); const btn = $('button.btn:not(.ghost)', f); btn.disabled = true; btn.textContent = 'Creating…';
    try {
      const r = await api('hospitals', { action: 'create', name: f.elements.name.value.trim(), code: f.elements.code.value, logo: f._logo || '', admin_name: f.elements.admin_name.value.trim(), admin_username: f.elements.admin_username.value.trim() });
      const h = { code: r.code, name: f.elements.name.value.trim() };
      wireCopy(sheet('Hospital created', credsHtml(h, r.username, r.password, true)));
      list($('#app'));
    } catch (x) { $('.err', f).textContent = x.message; btn.disabled = false; btn.textContent = 'Create hospital'; }
  };
}
function editSheet(h) {
  const d = sheet('Edit ' + h.name, `<form id="ef" class="grid"><div class="full"><label>Hospital name</label><input name="name" value="${esc(h.name)}" required></div>${pickHtml(h.logo || '')}<div class="full"><p class="muted sm">Code <b>${esc(h.code)}</b> stays the same, so the link does not change. Staff see the new name and logo the next time the app opens.</p><p class="err"></p><button class="btn">Save</button></div></form>`);
  const f = $('#ef', d); logoPicker(f, h.logo || '');
  f.onsubmit = async (e) => { e.preventDefault(); try { await api('hospitals', { action: 'edit', code: h.code, name: f.elements.name.value.trim(), logo: f._logo }); closeSheet(); toast('Saved'); list($('#app')); } catch (x) { $('.err', f).textContent = x.message; } };
}
function adminSheet(h) {
  const d = sheet('Add administrator · ' + h.name, `<form id="mf" class="grid"><div><label>Full name</label><input name="admin_name" required></div><div><label>Username</label><input name="admin_username" autocapitalize="none" required></div><div class="full"><p class="muted sm">The hospital’s own administrator can add other staff from inside CarePoint.</p><p class="err"></p><button class="btn">Add</button></div></form>`);
  const f = $('#mf', d);
  f.onsubmit = async (e) => { e.preventDefault(); try { const r = await api('hospitals', { action: 'add_admin', code: h.code, admin_name: f.elements.admin_name.value.trim(), admin_username: f.elements.admin_username.value.trim().toLowerCase() }); wireCopy(sheet('Administrator added', credsHtml(h, r.username, r.password, false))); list($('#app')); } catch (x) { $('.err', f).textContent = x.message; } };
}
start();
