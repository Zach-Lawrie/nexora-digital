/* MEA portals — shared helpers */
(function () {
  const MEA = (window.MEA = {});
  MEA.$ = (s, r = document) => r.querySelector(s);
  MEA.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  MEA.esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  MEA.money = (n) => (n == null || n === '' ? 'On request' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  MEA.date = (iso, time) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + (time ? ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
  };
  MEA.label = (s) => String(s || '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const TONE = { unpaid: 'warn', void: 'grey', present: 'ok', late: 'warn', absent: 'bad', excused: 'grey', marked: 'ok', submitted: '', Harare: '', Online: '', active: 'ok', completed: 'ok', paid: 'ok', won: 'ok', dispatched: 'ok', OK: 'ok', pending: 'warn', awaiting_payment: 'warn', new: 'warn', packed: '', in_progress: '', quoted: '', Reorder: 'bad', disabled: 'bad', cancelled: 'grey', withdrawn: 'grey', rejected: 'grey', closed: 'grey' };
  MEA.pill = (s) => `<span class="pill ${TONE[s] ?? ''}">${MEA.esc(MEA.label(s))}</span>`;
  MEA.DEPTS = { admin: 'Administration', training: 'Training academy', store: 'Store', maintenance: 'Maintenance', engineering: 'Engineering' };

  MEA.api = async (path, body, method) => {
    const opt = { method: method || (body ? 'POST' : 'GET'), headers: {}, credentials: 'same-origin' };
    if (body) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
    let res, data;
    try { res = await fetch('/api' + path, opt); data = await res.json(); }
    catch (e) { throw new Error('Could not reach MEA. Check your connection and try again.'); }
    if (!res.ok) { const err = new Error(data && data.error ? data.error : 'Something went wrong.'); err.status = res.status; throw err; }
    return data;
  };
  let tt;
  MEA.toast = (msg, bad) => {
    let t = MEA.$('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(() => (t.hidden = true), 3200);
  };
  MEA.dialog = (html, onReady) => {
    const d = document.createElement('dialog');
    d.innerHTML = `<div class="dlg">${html}</div>`;
    document.body.append(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    MEA.$$('[data-close]', d).forEach((b) => b.addEventListener('click', () => d.close()));
    d.showModal();
    if (onReady) onReady(d);
    return d;
  };
  MEA.formData = (form) => {
    const o = {};
    MEA.$$('input,select,textarea', form).forEach((el) => { if (!el.name) return; o[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
    return o;
  };
  // Runs an API action from a form/button, shows errors inline or as a toast.
  MEA.submit = async (btn, fn, errEl) => {
    if (btn) btn.disabled = true;
    if (errEl) errEl.textContent = '';
    try { return await fn(); }
    catch (e) { if (errEl) errEl.textContent = e.message; else MEA.toast(e.message, true); return null; }
    finally { if (btn) btn.disabled = false; }
  };
  MEA.table = (cols, rows, emptyMsg) => {
    if (!rows.length) return `<div class="tablewrap"><p class="empty">${MEA.esc(emptyMsg || 'Nothing here yet.')}</p></div>`;
    return `<div class="tablewrap"><table><thead><tr>${cols.map((c) => `<th class="${c.num ? 'num' : ''}">${MEA.esc(c.h)}</th>`).join('')}</tr></thead><tbody>${rows
      .map((r) => `<tr>${cols.map((c) => `<td class="${c.num ? 'num' : ''}">${c.f ? c.f(r) : MEA.esc(r[c.k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  };
  MEA.csv = (columns, rows) => {
    const q = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return [columns.map(q).join(','), ...rows.map((r) => columns.map((c) => q(r[c])).join(','))].join('\r\n');
  };
  MEA.download = (name, text, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/csv;charset=utf-8' }));
    a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };


  /* file upload in 1 MB parts (files are stored in the MEA database) */
  MEA.upload = async (file, purpose, onProgress) => {
    if (!file) throw new Error('Choose a file first.');
    if (file.size > 15e6) throw new Error('Files can be up to 15 MB. For videos, paste a YouTube (unlisted), Vimeo or Google Drive link instead.');
    const st = await MEA.api('/files/start', { name: file.name, mime: file.type || 'application/octet-stream', size: file.size, purpose });
    const parts = Math.ceil(file.size / st.chunk);
    for (let n = 0; n < parts; n++) {
      const body = await file.slice(n * st.chunk, (n + 1) * st.chunk).arrayBuffer();
      const res = await fetch(`/api/files/${st.id}/chunk?n=${n}`, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/octet-stream' }, body });
      if (!res.ok) { let m = 'Upload failed.'; try { m = (await res.json()).error || m; } catch (e) {} throw new Error(m); }
      if (onProgress) onProgress(Math.round(((n + 1) * 100) / parts));
    }
    return (await MEA.api(`/files/${st.id}/finish`, {})).file;
  };
  MEA.size = (b) => (b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB');
  // Turns a YouTube / Vimeo / Google Drive link into an embeddable player URL (null if unknown).
  MEA.embed = (url) => {
    try {
      const u = new URL(url);
      const h = u.hostname.replace(/^www\.|^m\./, '');
      if (h === 'youtu.be') return 'https://www.youtube-nocookie.com/embed/' + u.pathname.slice(1) + '?rel=0';
      if (h === 'youtube.com') {
        const id = u.searchParams.get('v') || (u.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/) || [])[2];
        return id ? 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0' : null;
      }
      if (h === 'vimeo.com') { const m = u.pathname.match(/\/(\d+)(?:\/([a-z0-9]+))?/); return m ? 'https://player.vimeo.com/video/' + m[1] + (m[2] ? '?h=' + m[2] : '') : null; }
      if (h === 'player.vimeo.com') return url;
      if (h === 'drive.google.com') { const m = u.pathname.match(/\/file\/d\/([^/]+)/) || [null, u.searchParams.get('id')]; return m[1] ? 'https://drive.google.com/file/d/' + m[1] + '/preview' : null; }
    } catch (e) {}
    return null;
  };
  MEA.when = (iso) => { const d = new Date(iso); return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
  MEA.localInput = (iso) => { if (!iso) return ''; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  MEA.paras = (t) => String(t || '').split(/\n\s*\n/).map((p) => `<p>${MEA.esc(p).replace(/\n/g, '<br>')}</p>`).join('');

  /* sign-in shared by portal and admin */
  MEA.signOut = async () => { try { await MEA.api('/auth/logout', {}); } catch (e) {} location.href = '/portal'; };
  MEA.changePasswordView = (root, user, done) => {
    root.innerHTML = `<div class="authbox"><div class="card stack">
      <h1>Set your own password</h1>
      <p class="muted">${user.must_change ? 'You signed in with a temporary password from MEA admin. Choose your own password to continue.' : 'Choose a new password.'}</p>
      <form class="form" id="pwForm">
        <label>Current password<input name="current" type="password" autocomplete="current-password" required></label>
        <label>New password (8 or more characters)<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
        <label>Type it again<input name="again" type="password" autocomplete="new-password" minlength="8" required></label>
        <p class="err" id="pwErr"></p>
        <button class="btn" type="submit">Save password</button>
      </form></div></div>`;
    MEA.$('#pwForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = MEA.formData(e.target);
      if (f.password !== f.again) { MEA.$('#pwErr').textContent = 'The two new passwords do not match.'; return; }
      MEA.submit(e.submitter, async () => { await MEA.api('/me/password', { current: f.current, password: f.password }); MEA.toast('Password saved'); done(); }, MEA.$('#pwErr'));
    });
  };
  MEA.header = (user, active) => {
    const links = [];
    links.push(`<a href="/">Website</a>`, `<a href="/store">Store</a>`);
    if (user) {
      links.push(`<a href="/portal"${active === 'portal' ? ' aria-current="page"' : ''}>My portal</a>`);
      if (user.role === 'admin') links.push(`<a href="/admin"${active === 'admin' ? ' aria-current="page"' : ''}>Admin</a>`);
      links.push(`<span class="who">${MEA.esc(user.name)}</span><button type="button" id="signOut">Sign out</button>`);
    } else links.push(`<a href="/portal">Sign in</a>`);
    MEA.$('#topnav').innerHTML = links.join('');
    const so = MEA.$('#signOut'); if (so) so.addEventListener('click', MEA.signOut);
  };
})();
