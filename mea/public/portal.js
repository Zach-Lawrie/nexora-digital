/* MEA Portal: students, teachers, company managers, departments and admin. */
(function () {
  const { $, $$, esc, api, toast, dialog, formData, submit, table, pill, money, date, label, DEPTS } = MEA;
  const root = $('#root');
  let me = null, tab = null;
  const go = (t, extra) => { tab = t; Object.assign(state, extra || {}); render(); window.scrollTo(0, 0); };
  const state = { course: null, builder: null, shopTab: 'orders' };
  const ATT = ['present', 'late', 'absent', 'excused'];
  const METHODS = ['EcoCash', 'InnBucks', 'Bank transfer', 'Cash', 'PayID', 'Other'];
  const CATS = ['Automation', 'Electrical', 'Instrumentation', 'Safety', 'Networks', 'Maintenance'];
  const empty = (msg, btn) => `<div class="card stack"><p class="muted">${msg}</p>${btn || ''}</div>`;
  const dt = (iso) => (iso ? MEA.when(iso) : '—');

  async function boot() {
    try { me = (await api('/me')).user; } catch (e) { me = null; }
    MEA.header(me, 'portal');
    if (!me) return authView();
    if (me.must_change) return MEA.changePasswordView(root, me, boot);
    const h = location.hash.slice(1);
    if (h && tabsFor(me).some((t) => t[0] === h)) tab = h;
    render();
  }

  /* ---------- sign in / sign up ---------- */
  function authView(mode) {
    mode = mode || (location.hash === '#signup' ? 'signup' : 'signin');
    root.innerHTML = `<div class="authbox"><div class="card stack">
      <div class="tabs" role="tablist">
        <button type="button" role="tab" data-m="signin" aria-selected="${mode === 'signin'}">Sign in</button>
        <button type="button" role="tab" data-m="signup" aria-selected="${mode === 'signup'}">New student</button>
      </div>
      ${mode === 'signin' ? `
      <h1>Sign in</h1>
      <p class="muted">Students, company training managers, teachers and MEA staff all sign in here.</p>
      <form class="form" id="authForm">
        <label>Email<input name="email" type="email" autocomplete="username" required></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
        <p class="err" id="authErr"></p>
        <button class="btn" type="submit">Sign in</button>
        <p class="small muted">Forgot your password? Staff: ask MEA admin to reset it. Students: contact MEA on +263 783 017 505 or 0433 427 505.</p>
      </form>` : `
      <h1>Create a student account</h1>
      <p class="muted">Sign up to join MEA Automation Academy courses in Harare or online, follow your lessons and collect your certificates.</p>
      <form class="form" id="authForm">
        <label>Full name<input name="name" autocomplete="name" required></label>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Phone (WhatsApp)<input name="phone" type="tel" autocomplete="tel"></label>
        <label>Password (8 or more characters)<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
        <p class="err" id="authErr"></p>
        <button class="btn" type="submit">Create account</button>
      </form>`}
    </div></div>`;
    $$('[data-m]').forEach((b) => b.addEventListener('click', () => authView(b.dataset.m)));
    $('#authForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submit(e.submitter, async () => {
        const r = await api(mode === 'signin' ? '/auth/login' : '/auth/signup', formData(e.target));
        me = r.user; if (location.hash === '#signup') history.replaceState(null, '', '/portal');
        boot();
      }, $('#authErr'));
    });
  }

  /* ---------- role routing ---------- */
  function tabsFor(u) {
    if (u.role === 'student') return [['home', 'Home'], ['learn', 'My courses'], ['timetable', 'Timetable'], ['lab', 'Lab booking'], ['inbox', 'Messages'], ['fees', 'Fees'], ['browse', 'Find a course'],
      ...(u.company_manager ? [['company', 'My company']] : []), ['account', 'Account']];
    if (u.role === 'teacher') return [['teach', 'My students'], ['builder', 'Course builder'], ['marking', 'Marking'], ['timetable', 'Timetable'], ['notices', 'Notices'], ['inbox', 'Messages'], ['lab', 'Lab'], ['resources', 'Resources'], ['enq', 'Training enquiries'], ['account', 'Account']];
    if (u.role === 'admin') return [['teach', 'Academy'], ['builder', 'Courses & intakes'], ['marking', 'Marking'], ['timetable', 'Timetable'], ['fees', 'Fees'], ['companies', 'Companies'], ['notices', 'Notices'], ['inbox', 'Messages'], ['lab', 'Lab'], ['resources', 'Resources'], ['shop', 'Store'], ['enq', 'All enquiries'], ['account', 'Account']];
    if (u.dept === 'store') return [['shop', 'Store'], ['enq', 'Store enquiries'], ['account', 'Account']];
    return [['enq', (DEPTS[u.dept] || 'Department') + ' jobs'], ['account', 'Account']];
  }
  function render() {
    const tabs = tabsFor(me);
    if (!tab || !tabs.some((t) => t[0] === tab)) tab = tabs[0][0];
    if (location.hash.slice(1) !== tab) history.replaceState(null, '', '#' + tab);
    const roleText = me.role === 'student' ? (me.company_manager ? 'Company training manager' : 'Student') : me.role === 'teacher' ? 'Teacher · Training academy' : me.role === 'admin' ? 'Administrator' : 'Staff · ' + (DEPTS[me.dept] || me.dept);
    root.innerHTML = `<div class="pagehead"><div><h1>Hi ${esc(me.name.split(' ')[0])}</h1><p class="muted">${esc(roleText)} · ${esc(me.email)}</p></div>
      ${me.role === 'admin' ? '<a class="btn" href="/admin">Open admin dashboard</a>' : ''}</div>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button type="button" role="tab" data-t="${k}" aria-selected="${k === tab}">${esc(n)}</button>`).join('')}</div>
      <section id="view"><p class="muted">Loading…</p></section>`;
    $$('[data-t]').forEach((b) => b.addEventListener('click', () => go(b.dataset.t, { course: null })));
    const v = $('#view');
    const views = { home: homeView, learn: learnView, browse: browseView, timetable: timetableView, lab: labView, inbox: inboxView, fees: me.role === 'admin' ? adminFeesView : feesView, company: companyView,
      teach: teachView, builder: builderView, marking: markingView, notices: noticesView, resources: resourcesView, companies: companiesView, shop: shopView, enq: enqView, account: accountView };
    views[tab](v).catch((e) => { v.innerHTML = `<p class="err">${esc(e.message)}</p>`; if (e.status === 401) boot(); });
  }

  /* =================== STUDENT =================== */
  async function homeView(v) {
    const h = await api('/student/home');
    const live = h.enrolments.filter((e) => e.status !== 'pending');
    v.innerHTML = `<div class="stack">
      <div class="stats">
        <div class="stat"><b>${live.filter((e) => e.status === 'active').length}</b><span>courses in progress</span></div>
        <div class="stat ${h.due.length ? 'alert' : ''}"><b>${h.due.length}</b><span>assignments to hand in</span></div>
        <div class="stat ${h.unread ? 'alert' : ''}"><b>${h.unread}</b><span>unread messages</span></div>
        <div class="stat ${h.invoices.length ? 'alert' : ''}"><b>${money(h.invoices.reduce((s, i) => s + i.amount, 0))}</b><span>fees owing</span></div>
      </div>
      ${h.company ? `<p class="small muted">Training sponsored by <b>${esc(h.company.name)}</b></p>` : ''}
      <div class="split">
        <div class="card stack"><div class="cardhead" style="margin:0"><h2>My courses</h2><button class="btn ghost sm" data-go="learn">Open</button></div>
          ${h.enrolments.length ? h.enrolments.map((e) => `<div class="stack" style="gap:6px;border-top:1px solid var(--line);padding-top:10px">
            <div class="row" style="display:flex;justify-content:space-between;gap:8px"><b>${esc(e.code)} · ${esc(e.title)}</b>${pill(e.status)}</div>
            <span class="small muted">${e.intake ? esc(e.intake) + ' · ' + esc(e.venue) : 'Intake to be confirmed'}</span>
            ${e.status !== 'pending' ? `<div style="display:flex;gap:8px;align-items:center"><div class="bar" style="flex:1"><i style="width:${e.progress}%"></i></div><b class="num small">${e.progress}%</b><button class="btn sm" data-open="${e.id}">Continue</button></div>` : '<span class="small">Waiting for MEA to confirm your place.</span>'}
          </div>`).join('') : `<p class="muted">You have not joined a course yet.</p><div><button class="btn" data-go="browse">Find a course</button></div>`}
        </div>
        <div class="card stack"><div class="cardhead" style="margin:0"><h2>Next classes</h2><button class="btn ghost sm" data-go="timetable">Timetable</button></div>
          ${h.sessions.length ? h.sessions.map((s) => `<div style="border-top:1px solid var(--line);padding-top:8px"><b>${dt(s.starts_at)}</b> · ${esc(s.code)}<br><span class="small muted">${esc(s.title)} · ${esc(s.place || s.venue)}</span>
            ${s.link ? `<br><a class="small" href="${esc(s.link)}" target="_blank" rel="noopener">Join online class</a>` : ''}</div>`).join('') : '<p class="muted small">No classes scheduled yet.</p>'}
          ${h.lab.length ? `<h3 style="margin-top:8px">Your lab bookings</h3>${h.lab.map((l) => `<p class="small">${dt(l.starts_at)} · ${esc(l.station)}</p>`).join('')}` : ''}
        </div>
      </div>
      ${h.due.length ? `<div class="card stack"><h2>Work to hand in</h2>${h.due.map((a) => `<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid var(--line);padding-top:8px"><span><b>${esc(a.title)}</b><br><span class="small muted">${esc(a.code)}${a.due_date ? ' · due ' + date(a.due_date) : ''}</span></span><button class="btn sm ghost" data-open="${a.enrolment_id}">Open</button></div>`).join('')}</div>` : ''}
      <div class="card stack"><h2>Notices</h2>${h.notices.length ? h.notices.map((n) => `<div style="border-top:1px solid var(--line);padding-top:8px"><b>${esc(n.title)}</b> <span class="small muted">${n.code ? esc(n.code) + ' · ' : 'MEA · '}${date(n.created_at)}${n.author ? ' · ' + esc(n.author) : ''}</span><div class="small">${MEA.paras(n.body)}</div></div>`).join('') : '<p class="muted small">No notices yet.</p>'}</div>
    </div>`;
    $$('[data-go]', v).forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
    $$('[data-open]', v).forEach((b) => b.addEventListener('click', () => go('learn', { course: Number(b.dataset.open) })));
  }

  async function learnView(v) {
    if (state.course) return coursePlayer(v, state.course);
    const { enrolments, results } = await api('/student/overview');
    const list = enrolments.filter((e) => !['withdrawn', 'rejected'].includes(e.status));
    if (!list.length) { v.innerHTML = empty('You have not applied for a course yet. Pick a course and MEA will confirm your place, dates and fees.', '<div><button class="btn" id="goB">Find a course</button></div>'); $('#goB').onclick = () => go('browse'); return; }
    v.innerHTML = `<div class="grid">${list.map((e) => {
      const rs = results.filter((r) => r.enrolment_id === e.id);
      return `<div class="card enrol">
        <div class="row"><span class="small muted">${esc(e.code)} · ${esc(e.level)}</span>${pill(e.status)}</div>
        <h3>${esc(e.title)}</h3>
        <p class="small muted">${e.intake ? esc(e.intake) + ' · ' + esc(e.venue) + (e.start_date ? ' · starts ' + date(e.start_date) : '') : 'Intake to be confirmed'}<br>${e.teacher ? 'Teacher: ' + esc(e.teacher) : 'Teacher to be confirmed'}</p>
        ${e.status === 'pending' ? '<p class="small">Waiting for MEA to confirm your place. Your lessons open when it does.</p>' : `<div class="row"><div class="bar" style="flex:1"><i style="width:${e.progress}%"></i></div><b class="num">${e.progress}%</b></div>`}
        ${rs.length ? `<p class="small muted">${rs.length} result${rs.length > 1 ? 's' : ''} recorded</p>` : ''}
        ${e.status !== 'pending' ? `<div><button class="btn sm" data-open="${e.id}">${e.status === 'completed' ? 'Review course' : 'Open course'}</button></div>` : ''}
      </div>`;
    }).join('')}</div>`;
    $$('[data-open]', v).forEach((b) => b.addEventListener('click', () => go('learn', { course: Number(b.dataset.open) })));
  }

  async function coursePlayer(v, id) {
    const d = await api('/learn/' + id);
    const E = d.enrolment, done = new Set(d.done), own = me.role === 'student';
    const mods = [...d.modules, { id: null, title: d.modules.length ? 'More lessons' : 'Lessons' }];
    const lessonHtml = (l) => {
      const emb = l.kind === 'video' ? MEA.embed(l.url) : null;
      return `<details class="lesson" ${done.has(l.id) ? '' : ''}><summary><span class="lk">${{ video: '▶', reading: '📖', file: '📎', link: '🔗' }[l.kind]}</span> <b>${esc(l.title)}</b>${!l.published ? ' <span class="pill grey">Hidden</span>' : ''}
          ${own ? `<label class="check" style="margin-left:auto" onclick="event.stopPropagation()"><input type="checkbox" data-done="${l.id}" ${done.has(l.id) ? 'checked' : ''} ${E.status !== 'active' ? 'disabled' : ''}> Done</label>` : ''}</summary>
        <div class="stack" style="padding:10px 0 6px">
          ${l.kind === 'video' ? (emb ? `<div class="vid"><iframe src="${esc(emb)}" title="${esc(l.title)}" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>` : `<p><a class="btn sm" href="${esc(l.url)}" target="_blank" rel="noopener">Watch the video</a></p>`) : ''}
          ${l.body ? `<div class="prose">${MEA.paras(l.body)}</div>` : ''}
          ${l.file_id ? `<p><a class="btn sm ghost" href="/api/files/${l.file_id}" target="_blank" rel="noopener">Download ${esc(l.file_name || 'file')}</a> <span class="small muted">${MEA.size(l.file_size || 0)}</span></p>` : ''}
          ${l.kind === 'link' ? `<p><a class="btn sm ghost" href="${esc(l.url)}" target="_blank" rel="noopener">Open resource</a></p>` : ''}
        </div></details>`;
    };
    const attended = d.sessions.filter((s) => ['present', 'late'].includes(s.attendance)).length, marked = d.sessions.filter((s) => s.attendance).length;
    v.innerHTML = `<div class="stack">
      <div><button class="btn ghost sm" id="back">← ${me.role === 'student' ? 'My courses' : 'Back'}</button></div>
      <div class="card stack">
        <div class="cardhead" style="margin:0"><div><span class="small muted">${esc(E.code)} · ${esc(E.level)}${d.intake ? ' · ' + esc(d.intake.name) + ' · ' + esc(d.intake.venue) : ''}</span><h2>${esc(E.title)}</h2></div>${pill(E.status)}</div>
        ${!own ? `<p class="small muted">Viewing as teacher: ${esc(E.student)}</p>` : ''}
        <div style="display:flex;gap:10px;align-items:center"><div class="bar" style="flex:1"><i style="width:${E.progress}%" id="pbar"></i></div><b class="num" id="ptext">${E.progress}%</b></div>
        ${E.description ? `<p class="small muted">${esc(E.description)}</p>` : ''}
        <div class="inline">${d.teacher ? `<span class="small">Teacher: <b>${esc(d.teacher.name)}</b></span>` : ''}<button class="btn sm ghost" id="msgT">${own ? 'Message your teacher' : 'Message student'}</button>
          ${d.certificate ? `<button class="btn sm" id="certB">Certificate ${esc(d.certificate.cert_no)}</button>` : ''}</div>
      </div>
      <div class="card stack"><h2>Lessons</h2>${d.lessons.length ? mods.map((m) => { const ls = d.lessons.filter((l) => (l.module_id || null) === m.id); return ls.length ? `<div class="stack" style="gap:6px"><h3>${esc(m.title)}</h3>${ls.map(lessonHtml).join('')}</div>` : ''; }).join('') : '<p class="muted small">Your teacher has not added lessons yet.</p>'}</div>
      <div class="card stack"><h2>Assignments</h2>${d.assignments.length ? d.assignments.map((a) => `<div class="stack" style="border-top:1px solid var(--line);padding-top:10px;gap:6px">
          <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>${esc(a.title)}</b><span>${a.marked_at ? pill('marked') : a.sub_id ? pill('submitted') : a.due_date && a.due_date < new Date().toISOString().slice(0, 10) ? '<span class="pill bad">Late</span>' : '<span class="pill warn">To do</span>'}</span></div>
          <span class="small muted">${a.due_date ? 'Due ' + date(a.due_date) + ' · ' : ''}Marked out of ${a.max_score}</span>
          ${a.instructions ? `<div class="small">${MEA.paras(a.instructions)}</div>` : ''}
          ${a.sub_id ? `<p class="small">Handed in ${date(a.submitted_at, 1)}${a.sub_file ? ` · <a href="/api/files/${a.sub_file}" target="_blank" rel="noopener">${esc(a.sub_file_name)}</a>` : ''}</p>` : ''}
          ${a.marked_at ? `<p><b>${a.score} / ${a.max_score}</b>${a.feedback ? ` · <span class="small">${esc(a.feedback)}</span>` : ''}</p>` : own && E.status === 'active' ? `<div><button class="btn sm ${a.sub_id ? 'ghost' : ''}" data-sub="${a.id}">${a.sub_id ? 'Change my answer' : 'Hand in work'}</button></div>` : ''}
        </div>`).join('') : '<p class="muted small">No assignments yet.</p>'}</div>
      <div class="card stack"><h2>Tests</h2>${d.quizzes.length ? d.quizzes.map((q) => `<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:10px">
          <span><b>${esc(q.title)}</b><br><span class="small muted">${q.count} questions · pass mark ${q.pass_pct}% · attempt ${Math.min(q.used, q.attempts)} of ${q.attempts}${q.best >= 0 ? ' · best ' + q.best + '%' : ''}</span></span>
          ${own && E.status === 'active' && q.used < q.attempts && q.count ? `<button class="btn sm" data-quiz="${q.id}">${q.used ? 'Try again' : 'Start test'}</button>` : q.best >= 0 ? (q.best >= q.pass_pct ? pill('passed') : '<span class="pill bad">Not passed</span>') : ''}</div>`).join('') : '<p class="muted small">No tests yet.</p>'}</div>
      ${d.sessions.length ? `<div class="card stack"><div class="cardhead" style="margin:0"><h2>Classes</h2><span class="small muted">${marked ? `Attendance ${attended} of ${marked}` : ''}</span></div>${table([
        { h: 'When', f: (s) => dt(s.starts_at) }, { h: 'Class', f: (s) => esc(s.title) + (s.link ? `<br><a class="small" href="${esc(s.link)}" target="_blank" rel="noopener">Join online</a>` : '') },
        { h: 'Where', f: (s) => esc(s.place || '') }, { h: 'Attendance', f: (s) => (s.attendance ? pill(s.attendance) : '<span class="small muted">—</span>') }], d.sessions)}</div>` : ''}
      <div class="card stack"><h2>Results</h2>${d.results.length ? `<div class="results">${d.results.map((r) => `<div><span>${esc(r.assessment)} <span class="small muted">${date(r.created_at)}</span></span><span class="num">${r.score} / ${r.max_score} (${Math.round((r.score * 100) / r.max_score)}%)</span></div>`).join('')}</div>` : '<p class="muted small">No results yet.</p>'}</div>
      ${d.kit.length ? `<div class="card stack"><h2>Course kit</h2><p class="small muted">Equipment for this course from the MEA Store.</p>${table([
        { h: 'Item', f: (k) => `<b>${esc(k.name)}</b><br><span class="small muted">${esc(k.sku)}</span>` }, { h: 'Qty', num: true, k: 'qty' }, { h: 'Price', num: true, f: (k) => money(k.price) },
        { h: '', f: (k) => (k.required ? '<span class="pill warn">Required</span>' : '<span class="pill grey">Optional</span>') }], d.kit)}
        <div><a class="btn sm" href="/store?add=${d.kit.filter((k) => k.required).map((k) => k.id + ':' + k.qty).join(',')}">Order the required kit</a></div></div>` : ''}
    </div>`;
    $('#back').onclick = () => go(me.role === 'student' ? 'learn' : 'teach', { course: null });
    $('#msgT').onclick = () => openThread(E.id);
    if ($('#certB')) $('#certB').onclick = () => showCertificate({ name: E.student, title: E.title, code: E.code, cert_no: d.certificate.cert_no, issued_at: d.certificate.issued_at });
    $$('[data-done]', v).forEach((c) => c.addEventListener('change', () => submit(null, async () => {
      const r = await api(`/learn/${E.id}/done`, { lesson_id: Number(c.dataset.done), done: c.checked });
      $('#pbar').style.width = r.progress + '%'; $('#ptext').textContent = r.progress + '%';
    })));
    $$('[data-sub]', v).forEach((b) => b.addEventListener('click', () => submitWork(E, d.assignments.find((a) => a.id == b.dataset.sub), v)));
    $$('[data-quiz]', v).forEach((b) => b.addEventListener('click', () => takeQuiz(E, d.quizzes.find((q) => q.id == b.dataset.quiz), v)));
  }
  function submitWork(E, a, v) {
    dialog(`<h2>${esc(a.title)}</h2>${a.instructions ? `<div class="small muted">${MEA.paras(a.instructions)}</div>` : ''}
      <form class="form" id="wForm"><label>Your answer or notes<textarea name="text" rows="6">${esc(a.sub_text || '')}</textarea></label>
        <label>Attach your work (PDF, Word, PLC project zip, photo; up to 15 MB)<input type="file" name="f"></label>
        <p class="small muted" id="upP"></p><p class="err" id="wErr"></p>
        <div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Hand in</button></div></form>`,
      (d) => $('#wForm', d).addEventListener('submit', (ev) => {
        ev.preventDefault();
        submit(ev.submitter, async () => {
          const f = $('input[type=file]', d).files[0]; let file_id = null;
          if (f) file_id = (await MEA.upload(f, 'submission', (p) => ($('#upP', d).textContent = `Uploading ${p}%`))).id;
          await api(`/learn/${E.id}/submit`, { assignment_id: a.id, text: $('textarea', d).value, file_id });
          d.close(); toast('Work handed in'); coursePlayer(v, E.id);
        }, $('#wErr', d));
      }));
  }
  function takeQuiz(E, q, v) {
    dialog(`<h2>${esc(q.title)}</h2><p class="small muted">${q.count} questions · pass mark ${q.pass_pct}% · attempt ${q.used + 1} of ${q.attempts}. Answer every question, then submit.</p>
      <form class="form" id="qForm">${q.questions.map((x, i) => `<fieldset class="q"><legend><b>${i + 1}.</b> ${esc(x.q)}</legend>${x.options.map((o, j) => `<label class="check"><input type="radio" name="q${i}" value="${j}" required> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}
        <p class="err" id="qErr"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Submit answers</button></div></form>`,
      (d) => $('#qForm', d).addEventListener('submit', (ev) => {
        ev.preventDefault();
        const answers = q.questions.map((x, i) => Number((($(`input[name=q${i}]:checked`, d) || {}).value) ?? -1));
        submit(ev.submitter, async () => {
          const r = await api(`/learn/${E.id}/quiz`, { quiz_id: q.id, answers });
          $('.dlg', d).innerHTML = `<h2>${r.passed ? 'Passed' : 'Not passed this time'}</h2><p style="font-size:28px"><b>${r.score} / ${r.max}</b> (${r.pct}%)</p>
            <div class="stack small">${q.questions.map((x, i) => `<div>${r.review[i].chosen === r.review[i].correct ? '✅' : '❌'} ${esc(x.q)}${r.review[i].chosen !== r.review[i].correct ? `<br><span class="muted">Correct answer: ${esc(x.options[r.review[i].correct])}</span>` : ''}</div>`).join('')}</div>
            <p class="small muted">${r.left > 0 ? `${r.left} attempt${r.left > 1 ? 's' : ''} left.` : 'No attempts left.'} Your result is saved.</p><div class="actions"><button class="btn" id="qDone">Done</button></div>`;
          $('#qDone', d).onclick = () => { d.close(); coursePlayer(v, E.id); };
        }, $('#qErr', d));
      }));
  }
  function showCertificate(c) {
    const url = location.origin + '/verify?no=' + encodeURIComponent(c.cert_no);
    dialog(`<div class="cert"><img src="/logo-full.png" alt="MEA"><small>MEA Automation Academy</small><h2>Certificate of Completion</h2>
        <p>This certifies that</p><div class="name">${esc(c.name)}</div>
        <p>has successfully completed</p><h3>${esc(c.title)} (${esc(c.code)})</h3>
        <div class="qr" id="qrBox"></div>
        <p><small>Issued ${date(c.issued_at)} · Certificate no. ${esc(c.cert_no)}<br>Check this certificate at ${esc(url.replace(/^https?:\/\//, ''))}</small></p></div>
      <div class="actions"><button class="btn ghost" data-close>Close</button><button class="btn" id="printCert">Print or save as PDF</button></div>`,
      (d) => {
        try { const qr = qrcode(0, 'M'); qr.addData(url); qr.make(); $('#qrBox', d).innerHTML = qr.createSvgTag({ cellSize: 3, margin: 0 }); } catch (e) {}
        $('#printCert', d).onclick = () => { document.body.classList.add('pc'); window.print(); document.body.classList.remove('pc'); };
      });
  }

  async function browseView(v) {
    const [{ courses }, mine, { intakes }] = await Promise.all([api('/courses'), api('/student/overview'), api('/intakes')]);
    const taken = {}; mine.enrolments.forEach((e) => { if (!['withdrawn', 'rejected'].includes(e.status)) taken[e.course_id] = e.status; });
    v.innerHTML = courses.length ? `<div class="grid">${courses.map((c) => { const its = intakes.filter((i) => i.course_id === c.id); return `<div class="card course">
      <div class="meta"><span>${esc(c.code)}</span><span>·</span><span>${esc(c.level)}</span>${c.weeks ? `<span>·</span><span>${c.weeks} weeks</span>` : ''}</div>
      <h3>${esc(c.title)}</h3><p class="small muted">${esc(c.description || '')}</p>
      <p class="small">Fee: <b>${money(c.fee)}</b>${c.teacher ? ' · ' + esc(c.teacher) : ''}</p>
      ${its.length ? `<p class="small">${its.map((i) => `${pill(i.venue)} ${esc(i.name)}${i.start_date ? ' · ' + date(i.start_date) : ''}${i.capacity ? ` · ${Math.max(0, i.capacity - i.taken)} places left` : ''}`).join('<br>')}</p>` : '<p class="small muted">Next intake to be announced. Apply and MEA will contact you.</p>'}
      ${taken[c.id] ? `<p>${pill(taken[c.id])}</p>` : `<div><button class="btn sm" data-enrol="${c.id}">Apply for this course</button></div>`}
    </div>`; }).join('')}</div>` : empty('No courses are open right now. Check back soon.');
    $$('[data-enrol]', v).forEach((b) => b.addEventListener('click', () => {
      const c = courses.find((x) => x.id == b.dataset.enrol), its = intakes.filter((i) => i.course_id === c.id);
      if (!its.length) return submit(b, async () => { await api('/student/enrol', { course_id: c.id }); toast('Application sent. MEA will confirm your place.'); render(); });
      dialog(`<h2>Apply for ${esc(c.title)}</h2><form class="form" id="eForm"><p class="muted small">Choose where and when you want to study.</p>
        ${its.map((i, k) => `<label class="opt"><input type="radio" name="intake" value="${i.id}" ${k === 0 ? 'checked' : ''} ${i.capacity && i.taken >= i.capacity ? 'disabled' : ''}><span><b>${esc(i.venue)} · ${esc(i.name)}</b><br><span class="small muted">${i.start_date ? 'Starts ' + date(i.start_date) : 'Start date to be confirmed'}${i.schedule ? ' · ' + esc(i.schedule) : ''}${i.capacity ? ` · ${Math.max(0, i.capacity - i.taken)} places left` : ''}</span></span></label>`).join('')}
        <p class="err" id="eErr"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Send application</button></div></form>`,
        (d) => $('#eForm', d).addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { await api('/student/enrol', { course_id: c.id, intake_id: Number($('input[name=intake]:checked', d).value) }); d.close(); toast('Application sent. MEA will confirm your place.'); render(); }, $('#eErr', d)); }));
    }));
  }

  async function feesView(v) {
    const { invoices, student } = await api('/invoices/mine');
    const owing = invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0);
    v.innerHTML = `<div class="stack"><div class="stats"><div class="stat ${owing ? 'alert' : ''}"><b>${money(owing)}</b><span>owing</span></div><div class="stat"><b>${invoices.filter((i) => i.status === 'paid').length}</b><span>paid invoices</span></div></div>
      <div class="card">${table([{ h: 'Invoice', f: (i) => `<b>${esc(i.number)}</b><br><span class="small muted">${date(i.created_at)}${i.company ? ' · ' + esc(i.company) : ''}</span>` }, { h: 'For', k: 'description' },
        { h: 'Due', f: (i) => (i.due_date ? date(i.due_date) : '—') }, { h: 'Amount', num: true, f: (i) => `<b>${money(i.amount)}</b>` }, { h: 'Status', f: (i) => pill(i.status) },
        { h: '', f: (i) => `<button class="btn sm ghost" data-inv="${i.id}">${i.status === 'paid' ? 'Receipt' : 'View'}</button>` }], invoices, 'No invoices yet. MEA sends your fees invoice when your place is confirmed.')}</div>
      <p class="small muted">Pay using the invoice number as your reference. MEA marks it paid once the money arrives.</p></div>`;
    $$('[data-inv]', v).forEach((b) => b.addEventListener('click', () => printInvoice(invoices.find((i) => i.id == b.dataset.inv), i_billTo(student, invoices.find((i) => i.id == b.dataset.inv)))));
  }
  const i_billTo = (student, i) => (i.company ? i.company : student.name + '\n' + student.email);
  function printInvoice(i, billTo) {
    dialog(`<div class="cert" style="text-align:left;border-width:2px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><img src="/logo-full.png" alt="MEA" style="margin:0;height:60px"><div style="text-align:right"><h2>${i.status === 'paid' ? 'Receipt' : 'Invoice'}</h2><b>${esc(i.number)}</b><br><small>${date(i.created_at)}</small></div></div>
      <p><small>Billed to</small><br><b style="white-space:pre-line">${esc(billTo)}</b></p>
      <table style="width:100%;border-collapse:collapse"><tr><th style="text-align:left;border-bottom:1px solid #999">Description</th><th style="text-align:right;border-bottom:1px solid #999">Amount (USD)</th></tr>
      <tr><td style="padding:8px 0">${esc(i.description)}</td><td style="text-align:right">${money(i.amount)}</td></tr><tr><td style="text-align:right;padding-top:8px"><b>Total</b></td><td style="text-align:right;padding-top:8px"><b>${money(i.amount)}</b></td></tr></table>
      <p><small>${i.status === 'paid' ? `Paid ${date(i.paid_at)}${i.method ? ' by ' + esc(i.method) : ''}${i.reference ? ' · ref ' + esc(i.reference) : ''}. Thank you.` : `${i.due_date ? 'Due ' + date(i.due_date) + '. ' : ''}Please pay using invoice number ${esc(i.number)} as your reference.`}</small></p>
      <p><small>MEA · Mechanical, Electrical &amp; Automation · Harare, Zimbabwe · +263 783 017 505 · MumbaL@mea.co.zw</small></p></div>
      <div class="actions"><button class="btn ghost" data-close>Close</button><button class="btn" id="pInv">Print or save as PDF</button></div>`,
      (d) => ($('#pInv', d).onclick = () => { document.body.classList.add('pc'); window.print(); document.body.classList.remove('pc'); }));
  }

  /* ---------- company training manager ---------- */
  async function companyView(v) {
    const [co, { courses }, { intakes }] = await Promise.all([api('/company/overview'), api('/courses'), api('/intakes')]);
    const owing = co.invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0);
    v.innerHTML = `<div class="stack">
      <div class="stats"><div class="stat"><b>${co.staff.length}</b><span>people</span></div><div class="stat"><b>${co.enrolments.filter((e) => e.status === 'active').length}</b><span>in training</span></div>
        <div class="stat"><b>${co.enrolments.filter((e) => e.status === 'completed').length}</b><span>certified</span></div><div class="stat ${owing ? 'alert' : ''}"><b>${money(owing)}</b><span>owing</span></div></div>
      <div class="card"><div class="cardhead"><h2>${esc(co.company.name)} · training</h2><div class="inline"><button class="btn sm" id="enrolB">Enrol someone</button><button class="btn sm ghost" id="addS">Add a person</button></div></div>
        ${table([{ h: 'Person', f: (e) => esc((co.staff.find((s) => s.id === e.student_id) || {}).name || '') }, { h: 'Course', f: (e) => `${esc(e.code)}<br><span class="small muted">${esc(e.intake || '')}${e.venue ? ' · ' + esc(e.venue) : ''}</span>` },
          { h: 'Status', f: (e) => pill(e.status) }, { h: 'Progress', num: true, f: (e) => e.progress + '%' }, { h: 'Average', num: true, f: (e) => (e.avg_pct == null ? '—' : e.avg_pct + '%') },
          { h: 'Attendance', num: true, f: (e) => (e.marked ? `${e.attended}/${e.marked}` : '—') }, { h: 'Certificate', f: (e) => esc(e.cert_no || '') }], co.enrolments, 'Nobody from your company is enrolled yet.')}</div>
      <div class="card"><div class="cardhead"><h2>People</h2></div>${table([{ h: 'Name', f: (s) => `<b>${esc(s.name)}</b>${s.company_manager ? ' <span class="pill">Manager</span>' : ''}` }, { h: 'Email', k: 'email' }, { h: 'Last sign-in', f: (s) => date(s.last_login) }], co.staff)}</div>
      <div class="card"><div class="cardhead"><h2>Company invoices</h2></div>${table([{ h: 'Invoice', k: 'number' }, { h: 'For', k: 'description' }, { h: 'Due', f: (i) => (i.due_date ? date(i.due_date) : '—') }, { h: 'Amount', num: true, f: (i) => money(i.amount) }, { h: 'Status', f: (i) => pill(i.status) },
        { h: '', f: (i, k) => `<button class="btn sm ghost" data-ci="${i.number}">View</button>` }], co.invoices, 'No invoices yet.')}</div></div>`;
    $$('[data-ci]', v).forEach((b) => b.addEventListener('click', () => printInvoice(co.invoices.find((i) => i.number === b.dataset.ci), co.company.name + (co.company.address ? '\n' + co.company.address : ''))));
    $('#addS').onclick = () => dialog(`<h2>Add a person</h2><form class="form" id="sForm"><label>Full name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Phone<input name="phone" type="tel"></label>
      <p class="err" id="sErr"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Create account</button></div></form>`,
      (d) => $('#sForm', d).addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { const r = await api('/company/staff', formData(ev.target));
        $('.dlg', d).innerHTML = `<h2>Account created</h2><p>Give them this temporary password. They choose their own when they first sign in at <b>${location.host}/portal</b>.</p><p class="secret">${esc(r.temp_password)}</p><div class="actions"><button class="btn" data-close>Done</button></div>`;
        $('[data-close]', d).onclick = () => { d.close(); companyView(v); }; }, $('#sErr', d)); }));
    $('#enrolB').onclick = () => dialog(`<h2>Enrol someone</h2><form class="form" id="ceForm">
      <label>Person<select name="user_id" required>${co.staff.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
      <label>Course<select name="course_id" id="ceC" required>${courses.map((c) => `<option value="${c.id}">${esc(c.code)} · ${esc(c.title)}</option>`).join('')}</select></label>
      <label>Intake<select name="intake_id" id="ceI"></select></label><p class="err" id="ceErr"></p>
      <div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Enrol</button></div></form>`, (d) => {
      const fill = () => { const its = intakes.filter((i) => i.course_id == $('#ceC', d).value); $('#ceI', d).innerHTML = its.length ? its.map((i) => `<option value="${i.id}">${esc(i.venue)} · ${esc(i.name)}${i.start_date ? ' · ' + date(i.start_date) : ''}</option>`).join('') : '<option value="">Next intake to be announced</option>'; };
      $('#ceC', d).onchange = fill; fill();
      $('#ceForm', d).addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { await api('/company/enrol', formData(ev.target)); d.close(); toast('Enrolment sent. MEA will confirm.'); companyView(v); }, $('#ceErr', d)); });
    });
  }

  /* =================== SHARED: timetable, lab, messages =================== */
  async function timetableView(v) {
    const { sessions } = await api('/timetable');
    const staff = me.role !== 'student';
    const byDay = {}; sessions.forEach((s) => { const k = s.starts_at.slice(0, 10); (byDay[k] = byDay[k] || []).push(s); });
    v.innerHTML = `<div class="stack">${staff ? '<div class="inline"><button class="btn sm" id="addCls">Schedule classes</button></div>' : ''}
      ${Object.keys(byDay).length ? Object.entries(byDay).map(([day, ss]) => `<div class="card stack"><h3>${new Date(day + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
        ${ss.map((s) => `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:8px">
          <span><b>${new Date(s.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–${new Date(s.ends_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</b> · ${esc(s.code)} · ${esc(s.title)}<br>
          <span class="small muted">${esc(s.intake)} · ${pill(s.venue)} ${esc(s.place || '')}</span>${s.link ? ` · <a class="small" href="${esc(s.link)}" target="_blank" rel="noopener">Online link</a>` : ''}</span>
          <span class="inline">${staff ? `<button class="btn sm" data-roll="${s.id}">${s.marked ? 'Attendance ✓' : 'Take attendance'}</button><button class="btn sm ghost" data-del="${s.id}">Remove</button>` : s.attendance ? pill(s.attendance) : ''}</span></div>`).join('')}</div>`).join('')
      : empty(staff ? 'No classes scheduled. Add an intake in the Course builder, then schedule its classes here.' : 'No classes on your timetable yet. They appear once MEA schedules your intake.')}</div>`;
    if (!staff) return;
    $('#addCls').onclick = async () => {
      const { courses } = await api('/teach/overview');
      const all = (await Promise.all(courses.map((c) => api('/teach/content/' + c.id)))).flatMap((x) => x.intakes.map((i) => ({ ...i, code: x.course.code })));
      if (!all.length) return toast('Create an intake first in the Course builder.', true);
      dialog(`<h2>Schedule classes</h2><form class="form" id="clForm">
        <label>Intake<select name="intake_id">${all.map((i) => `<option value="${i.id}">${esc(i.code)} · ${esc(i.name)} (${esc(i.venue)})</option>`).join('')}</select></label>
        <label>Class title<input name="title" value="Class" required></label>
        <div class="two"><label>First class starts<input name="start" type="datetime-local" required></label><label>Length (minutes)<input name="minutes" type="number" value="120" min="15" max="600"></label></div>
        <div class="two"><label>Repeat weekly for (weeks)<input name="weeks" type="number" value="1" min="1" max="30"></label><label>Place (blank = intake venue)<input name="place"></label></div>
        <label>Online class link (Zoom, Teams, Meet)<input name="link" type="url" placeholder="https://"></label>
        <p class="err" id="clErr"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Add to timetable</button></div></form>`,
        (d) => $('#clForm', d).addEventListener('submit', (ev) => { ev.preventDefault(); const f = formData(ev.target);
          submit(ev.submitter, async () => { const r = await api('/session', { ...f, starts_at: new Date(f.start).toISOString() }); d.close(); toast(r.added + ' class' + (r.added > 1 ? 'es' : '') + ' added'); timetableView(v); }, $('#clErr', d)); }));
    };
    $$('[data-del]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api('/session', { id: Number(b.dataset.del), delete: true }); toast('Class removed'); timetableView(v); })));
    $$('[data-roll]', v).forEach((b) => b.addEventListener('click', async () => {
      const r = await api(`/session/${b.dataset.roll}/roll`);
      dialog(`<h2>Attendance</h2><p class="small muted">${esc(r.session.title)} · ${dt(r.session.starts_at)} · ${esc(r.session.intake)}</p>
        ${r.roll.length ? `<form class="form" id="rForm">${r.roll.map((x) => `<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:6px"><b>${esc(x.name)}</b><span class="inline">${ATT.map((s) => `<label class="check"><input type="radio" name="e${x.enrolment_id}" value="${s}" ${(x.status || 'present') === s ? 'checked' : ''}> ${label(s)}</label>`).join('')}</span></div>`).join('')}
          <p class="err" id="rErr"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save attendance</button></div></form>` : '<p class="muted">No approved students in this intake yet.</p><div class="actions"><button class="btn" data-close>Close</button></div>'}`,
        (d) => { const f = $('#rForm', d); if (f) f.addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => {
          await api(`/session/${b.dataset.roll}/roll`, { marks: r.roll.map((x) => ({ enrolment_id: x.enrolment_id, status: $(`input[name=e${x.enrolment_id}]:checked`, d).value })) }); d.close(); toast('Attendance saved'); timetableView(v); }, $('#rErr', d)); }); });
    }));
  }

  async function labView(v) {
    const r = await api('/lab');
    if (me.role === 'student') {
      const mine = r.slots.filter((s) => s.mine), open = r.slots.filter((s) => !s.mine);
      v.innerHTML = `<div class="stack"><div class="card stack"><h2>Remote PLC lab</h2><p class="small muted">Book time on a real PLC rig. You can hold up to 3 future bookings. Connection details appear here once booked.</p></div>
        <div class="card stack"><h2>My bookings</h2>${mine.length ? mine.map((s) => `<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:8px"><span><b>${dt(s.starts_at)}</b> · ${esc(s.station)}${s.code ? ' · ' + esc(s.code) : ''}<br><span class="small">${esc(s.access || 'Your teacher will send the connection details.')}</span></span><button class="btn sm ghost" data-cancel="${s.id}">Cancel</button></div>`).join('') : '<p class="muted small">No bookings yet.</p>'}</div>
        <div class="card stack"><h2>Available times</h2>${!r.enrolments.length ? '<p class="muted small">Lab booking opens when you have an active course.</p>' : open.length ? open.map((s) => `<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:8px"><span><b>${dt(s.starts_at)}</b> · ${esc(s.station)}${s.code ? ' · ' + esc(s.code) + ' only' : ''}</span><button class="btn sm" data-book="${s.id}">Book</button></div>`).join('') : '<p class="muted small">No free lab times right now. Check back soon.</p>'}</div></div>`;
      $$('[data-cancel]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api(`/lab/${b.dataset.cancel}/cancel`, {}); toast('Booking cancelled'); labView(v); })));
      $$('[data-book]', v).forEach((b) => b.addEventListener('click', () => {
        const s = open.find((x) => x.id == b.dataset.book), ens = r.enrolments.filter((e) => !s.course_id || e.course_id === s.course_id);
        const book = (eid, btn) => submit(btn, async () => { await api(`/lab/${s.id}/book`, { enrolment_id: eid }); toast('Lab time booked'); labView(v); });
        if (ens.length === 1) return book(ens[0].id, b);
        dialog(`<h2>Which course is this for?</h2><div class="stack">${ens.map((e) => `<button class="btn ghost" data-e="${e.id}">${esc(e.code)}</button>`).join('')}</div>`, (d) => $$('[data-e]', d).forEach((x) => (x.onclick = () => { d.close(); book(Number(x.dataset.e), b); })));
      }));
      return;
    }
    const { courses } = await api('/teach/overview');
    v.innerHTML = `<div class="stack"><div class="inline"><button class="btn sm" id="addLab">Add lab times</button></div>
      <div class="card">${table([{ h: 'When', f: (s) => dt(s.starts_at) }, { h: 'Station', k: 'station' }, { h: 'Course', f: (s) => esc(s.code || 'Any') }, { h: 'Booked by', f: (s) => (s.student ? `<b>${esc(s.student)}</b>` : '<span class="muted small">Free</span>') },
        { h: 'Connection details', f: (s) => `<span class="small">${esc(s.access || '')}</span>` }, { h: '', f: (s) => `<span class="inline">${s.student ? `<button class="btn sm ghost" data-free="${s.id}">Free up</button>` : ''}<button class="btn sm ghost" data-rm="${s.id}">Remove</button></span>` }], r.slots, 'No lab times yet. Add times students can book on your PLC rigs.')}</div></div>`;
    $$('[data-free]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api(`/lab/${b.dataset.free}/cancel`, {}); toast('Slot freed'); labView(v); })));
    $$('[data-rm]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api('/lab/slot', { id: Number(b.dataset.rm), delete: true }); toast('Slot removed'); labView(v); })));
    $('#addLab').onclick = () => dialog(`<h2>Add lab times</h2><form class="form" id="lForm">
      <label>Station or rig<input name="station" placeholder="e.g. S7-1200 rig 1" required></label>
      <div class="two"><label>First slot starts<input name="start" type="datetime-local" required></label><label>Slot length (minutes)<input name="minutes" type="number" value="60" min="15" max="480"></label></div>
      <div class="two"><label>Back-to-back slots<input name="repeat" type="number" value="4" min="1" max="40"></label><label>Course (optional)<select name="course_id"><option value="">Any of my students</option>${courses.map((c) => `<option value="${c.id}">${esc(c.code)}</option>`).join('')}</select></label></div>
      <label>Connection details shown after booking<input name="access" placeholder="e.g. AnyDesk 123 456 789 · password sent on WhatsApp"></label>
      <p class="err" id="lErr"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Add</button></div></form>`,
      (d) => $('#lForm', d).addEventListener('submit', (ev) => { ev.preventDefault(); const f = formData(ev.target); submit(ev.submitter, async () => { const x = await api('/lab/slot', { ...f, starts_at: new Date(f.start).toISOString() }); d.close(); toast(x.added + ' slots added'); labView(v); }, $('#lErr', d)); }));
  }

  async function inboxView(v) {
    const r = await api('/inbox');
    const list = me.role === 'student' ? r.all : r.threads;
    v.innerHTML = `<div class="stack">${me.role !== 'student' && r.all.length ? `<div class="inline"><label>Message a student <select id="newT"><option value="">Choose…</option>${r.all.map((t) => `<option value="${t.enrolment_id}">${esc(t.student)} · ${esc(t.code)}</option>`).join('')}</select></label></div>` : ''}
      ${list.length ? `<div class="card">${table([{ h: me.role === 'student' ? 'Course' : 'Student', f: (t) => `<b>${esc(me.role === 'student' ? t.code + ' · ' + t.title : t.student)}</b>${me.role !== 'student' ? `<br><span class="small muted">${esc(t.code)}</span>` : ''}` },
        { h: 'Last message', f: (t) => `<span class="small">${esc((t.last || 'No messages yet').slice(0, 90))}</span>` }, { h: '', f: (t) => (t.unread ? `<span class="pill warn">${t.unread} new</span>` : '') }, { h: '', f: (t) => `<button class="btn sm" data-th="${t.enrolment_id}">Open</button>` }], list)}</div>`
      : empty(me.role === 'student' ? 'Messages with your teachers appear here once your course is confirmed.' : 'No messages yet. Students can message you from their course page.')}</div>`;
    $$('[data-th]', v).forEach((b) => b.addEventListener('click', () => openThread(Number(b.dataset.th), () => inboxView(v))));
    const n = $('#newT'); if (n) n.onchange = () => n.value && openThread(Number(n.value), () => inboxView(v));
  }
  async function openThread(id, after) {
    const r = await api('/messages/' + id);
    const d = dialog(`<h2>${esc(r.thread.code)} · ${esc(me.role === 'student' ? r.thread.title : r.thread.student)}</h2>
      <div class="thread" id="thr">${r.messages.length ? r.messages.map((m) => `<div class="msg ${m.from_id === me.id ? 'mine' : ''}"><div>${MEA.paras(m.body)}</div><small>${esc(m.name)} · ${date(m.created_at, 1)}</small></div>`).join('') : '<p class="muted small">No messages yet. Say hello.</p>'}</div>
      <form class="form" id="mForm"><textarea name="body" rows="3" placeholder="Write a message" required></textarea><p class="err" id="mErr"></p>
        <div class="actions"><button class="btn ghost" type="button" data-close>Close</button><button class="btn" type="submit">Send</button></div></form>`,
      (dd) => { const t = $('#thr', dd); t.scrollTop = t.scrollHeight;
        $('#mForm', dd).addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { await api('/messages/' + id, formData(ev.target)); dd.close(); toast('Message sent'); openThread(id, after); }, $('#mErr', dd)); }); });
    if (after) d.addEventListener('close', after);
  }

  /* =================== TEACHER / ADMIN =================== */
  async function teachView(v) {
    if (state.course) return coursePlayer(v, state.course);
    const { courses, enrolments, results } = await api('/teach/overview');
    const pending = enrolments.filter((e) => e.status === 'pending');
    const current = enrolments.filter((e) => e.status !== 'pending');
    v.innerHTML = `<div class="stack">
      <div class="stats">
        <div class="stat ${pending.length ? 'alert' : ''}"><b>${pending.length}</b><span>applications waiting</span></div>
        <div class="stat"><b>${current.filter((e) => e.status === 'active').length}</b><span>active students</span></div>
        <div class="stat"><b>${current.filter((e) => e.status === 'completed').length}</b><span>completed</span></div>
        <div class="stat"><b>${courses.length}</b><span>${me.role === 'admin' ? 'courses' : 'courses you teach'}</span></div>
      </div>
      ${me.role !== 'admin' && !courses.length ? '<div class="card"><p class="muted">MEA admin has not assigned a course to you yet. Once they do, your students appear here.</p></div>' : ''}
      ${pending.length ? `<div class="card"><div class="cardhead"><h2>Applications</h2></div>${table([
        { h: 'Student', f: (e) => `<b>${esc(e.student)}</b><br><span class="small muted">${esc(e.email)} ${esc(e.phone || '')}</span>${e.company ? `<br><span class="small">${esc(e.company)}</span>` : ''}` },
        { h: 'Course', f: (e) => `${esc(e.code)}<br><span class="small muted">${e.intake ? esc(e.intake) + ' · ' + esc(e.venue) : 'No intake chosen'}</span>` }, { h: 'Applied', f: (e) => date(e.created_at) },
        { h: '', f: (e) => `<div class="inline"><button class="btn sm" data-a="approve" data-id="${e.id}">Approve</button><button class="btn sm ghost" data-a="reject" data-id="${e.id}">Decline</button></div>` }], pending)}</div>` : ''}
      <div class="card"><div class="cardhead"><h2>Students</h2><span class="small muted">Progress updates by itself as students finish lessons. You can still set it by hand.</span></div>${table([
        { h: 'Student', f: (e) => `<b>${esc(e.student)}</b><br><span class="small muted">${esc(e.email)}</span>${e.company ? `<br><span class="small">${esc(e.company)}</span>` : ''}` },
        { h: 'Course', f: (e) => `${esc(e.code)}<br><span class="small muted">${e.intake ? esc(e.intake) : ''}</span>` }, { h: 'Status', f: (e) => pill(e.status) },
        { h: 'Progress', f: (e) => e.status === 'active' ? `<div class="inline"><input type="range" min="0" max="100" step="5" value="${e.progress}" aria-label="Progress" data-p="${e.id}"><b class="num" id="pv${e.id}">${e.progress}%</b><button class="btn sm ghost" data-a="progress" data-id="${e.id}">Save</button></div>` : `<b class="num">${e.progress}%</b>` },
        { h: 'Average', num: true, f: (e) => (e.avg_pct == null ? '—' : e.avg_pct + '%') },
        { h: '', f: (e) => `<div class="inline"><button class="btn sm ghost" data-view="${e.id}">Open</button>${['active', 'completed'].includes(e.status) ? `<button class="btn sm ghost" data-res="${e.id}">Results (${results.filter((r) => r.enrolment_id === e.id).length})</button>` : ''}${e.status === 'active' ? `<button class="btn sm" data-a="complete" data-id="${e.id}">Complete + certificate</button>` : ''}${e.cert_no ? `<span class="small">${esc(e.cert_no)}</span>` : ''}</div>` }], current, 'No approved students yet.')}</div>
    </div>`;
    $$('[data-p]', v).forEach((r) => r.addEventListener('input', () => ($('#pv' + r.dataset.p).textContent = r.value + '%')));
    $$('[data-view]', v).forEach((b) => b.addEventListener('click', () => go('teach', { course: Number(b.dataset.view) })));
    $$('[data-a]', v).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.id, a = b.dataset.a;
      const run = () => submit(b, async () => {
        const body = { action: a }; if (a === 'progress') body.progress = $(`[data-p="${id}"]`).value;
        const r = await api('/teach/enrolment/' + id, body);
        toast(a === 'complete' ? 'Certificate ' + r.cert_no + ' issued' : a === 'progress' ? 'Progress saved' : a === 'approve' ? 'Student approved' : 'Application declined'); render();
      });
      if (a === 'complete') { const e = enrolments.find((x) => x.id == id); dialog(`<h2>Complete ${esc(e.student)}?</h2><p class="muted">This marks ${esc(e.code)} as finished at 100% and issues a numbered MEA certificate with a QR check code.</p><div class="actions"><button class="btn ghost" data-close>Cancel</button><button class="btn" id="yes">Complete and issue certificate</button></div>`, (d) => ($('#yes', d).onclick = () => { d.close(); run(); })); }
      else run();
    }));
    $$('[data-res]', v).forEach((b) => b.addEventListener('click', () => {
      const e = enrolments.find((x) => x.id == b.dataset.res), rs = results.filter((r) => r.enrolment_id === e.id);
      dialog(`<h2>${esc(e.student)} · ${esc(e.code)}</h2>${rs.length ? `<div class="results">${rs.map((r) => `<div><span>${esc(r.assessment)} <span class="small muted">${date(r.created_at)}</span></span><span class="num">${r.score} / ${r.max_score}</span></div>`).join('')}</div>` : '<p class="muted">No results recorded yet.</p>'}
        <form class="form" id="resForm"><h3>Add a result</h3><label>Assessment<input name="assessment" placeholder="e.g. Practical 1: motor start/stop" required></label>
          <div class="two"><label>Score<input name="score" type="number" step="0.5" min="0" required></label><label>Out of<input name="max_score" type="number" step="0.5" min="1" value="100" required></label></div>
          <p class="err" id="resErr"></p><div class="actions"><button class="btn ghost" type="button" data-close>Close</button><button class="btn" type="submit">Save result</button></div></form>`,
        (d) => $('#resForm', d).addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { await api('/teach/result', { enrolment_id: e.id, ...formData(ev.target) }); d.close(); toast('Result saved'); render(); }, $('#resErr', d)); }));
    }));
  }

  /* ---------- course builder ---------- */
  async function builderView(v) {
    const { courses } = me.role === 'admin' ? await api('/admin/courses') : await api('/teach/overview');
    if (!courses.length) { v.innerHTML = empty(me.role === 'admin' ? 'No courses yet. Add courses in the admin dashboard.' : 'MEA admin has not assigned a course to you yet.'); return; }
    if (!state.builder || !courses.some((c) => c.id === state.builder)) state.builder = courses[0].id;
    const d = await api('/teach/content/' + state.builder), C = d.course;
    const modName = (id) => (d.modules.find((m) => m.id === id) || {}).title || 'No module';
    v.innerHTML = `<div class="stack">
      <div class="inline"><label>Course <select id="pickC">${courses.map((c) => `<option value="${c.id}" ${c.id === C.id ? 'selected' : ''}>${esc(c.code)} · ${esc(c.title)}</option>`).join('')}</select></label></div>
      <div class="card stack"><div class="cardhead" style="margin:0"><h2>${esc(C.title)}</h2><span class="small muted">${esc(C.code)} · ${esc(C.level)}${C.fee != null ? ' · ' + money(C.fee) : ''}</span></div>
        <label>Description shown to students<textarea id="cDesc" rows="3">${esc(C.description || '')}</textarea></label><div><button class="btn sm ghost" id="saveDesc">Save description</button></div></div>
      <div class="card"><div class="cardhead"><h2>Intakes</h2><button class="btn sm" data-new="intake">Add intake</button></div>${table([
        { h: 'Intake', f: (i) => `<b>${esc(i.name)}</b><br><span class="small muted">${esc(i.schedule || '')}</span>` }, { h: 'Venue', f: (i) => pill(i.venue) }, { h: 'Dates', f: (i) => `${i.start_date ? date(i.start_date) : 'TBC'}${i.end_date ? ' – ' + date(i.end_date) : ''}` },
        { h: 'Places', num: true, f: (i) => `${i.taken}${i.capacity ? ' / ' + i.capacity : ''}` }, { h: 'Shown', f: (i) => (i.active ? pill('active') : pill('Hidden')) }, { h: '', f: (i) => `<button class="btn sm ghost" data-ed="intake:${i.id}">Edit</button>` }], d.intakes, 'No intakes yet. Add a Harare or Online intake so students can apply.')}</div>
      <div class="card"><div class="cardhead"><h2>Lessons</h2><div class="inline"><button class="btn sm ghost" data-new="module">Add module</button><button class="btn sm" data-new="lesson">Add lesson</button></div></div>
        ${d.modules.length ? `<p class="small muted" style="margin-bottom:8px">Modules: ${d.modules.map((m) => `<button class="btn sm ghost" data-ed="module:${m.id}">${esc(m.title)}</button>`).join(' ')}</p>` : ''}
        ${table([{ h: '#', num: true, k: 'sort' }, { h: 'Lesson', f: (l) => `<b>${esc(l.title)}</b><br><span class="small muted">${esc(modName(l.module_id))}</span>` }, { h: 'Type', f: (l) => label(l.kind) + (l.file_name ? `<br><span class="small muted">${esc(l.file_name)}</span>` : '') },
          { h: 'Shown', f: (l) => (l.published ? pill('active') : pill('Hidden')) }, { h: '', f: (l) => `<button class="btn sm ghost" data-ed="lesson:${l.id}">Edit</button>` }], d.lessons, 'No lessons yet. Add videos (YouTube unlisted, Vimeo or Google Drive links), readings, PDFs and PLC files.')}</div>
      <div class="card"><div class="cardhead"><h2>Assignments</h2><button class="btn sm" data-new="assignment">Add assignment</button></div>${table([
        { h: 'Assignment', f: (a) => `<b>${esc(a.title)}</b>` }, { h: 'Due', f: (a) => (a.due_date ? date(a.due_date) : '—') }, { h: 'Out of', num: true, k: 'max_score' }, { h: 'Handed in', num: true, f: (a) => `${a.handed_in}${a.to_mark ? ` <span class="pill warn">${a.to_mark} to mark</span>` : ''}` },
        { h: 'Shown', f: (a) => (a.published ? pill('active') : pill('Hidden')) }, { h: '', f: (a) => `<button class="btn sm ghost" data-ed="assignment:${a.id}">Edit</button>` }], d.assignments, 'No assignments yet.')}</div>
      <div class="card"><div class="cardhead"><h2>Tests</h2><button class="btn sm" data-new="quiz">Add test</button></div>${table([
        { h: 'Test', f: (q) => `<b>${esc(q.title)}</b>` }, { h: 'Questions', num: true, f: (q) => q.questions.length }, { h: 'Pass', num: true, f: (q) => q.pass_pct + '%' }, { h: 'Attempts', num: true, k: 'attempts' }, { h: 'Taken', num: true, k: 'taken' },
        { h: 'Shown', f: (q) => (q.published ? pill('active') : pill('Hidden')) }, { h: '', f: (q) => `<button class="btn sm ghost" data-ed="quiz:${q.id}">Edit</button>` }], d.quizzes, 'No tests yet. Tests mark themselves and save the result.')}</div>
      <div class="card"><div class="cardhead"><h2>Course kit from the store</h2></div>
        <form class="inline" id="kitForm" style="margin-bottom:10px"><select name="product_id" required><option value="">Choose a product…</option>${d.products.map((p) => `<option value="${p.id}">${esc(p.name)} (${esc(p.sku)}) · ${money(p.price)}</option>`).join('')}</select>
          <input name="qty" type="number" min="1" value="1" style="width:70px" aria-label="Quantity"><label class="check"><input type="checkbox" name="required" checked> Required</label><button class="btn sm" type="submit">Add to kit</button></form>
        ${table([{ h: 'Item', f: (k) => `<b>${esc(k.name)}</b><br><span class="small muted">${esc(k.sku)}</span>` }, { h: 'Qty', num: true, k: 'qty' }, { h: 'Price', num: true, f: (k) => money(k.price) }, { h: 'In stock', num: true, k: 'stock' },
          { h: '', f: (k) => (k.required ? 'Required' : 'Optional') }, { h: '', f: (k) => `<button class="btn sm ghost" data-kitrm="${k.product_id}">Remove</button>` }], d.kit, 'No kit linked. Students see linked kit on their course page and can order it from the store.')}</div>
    </div>`;
    const reload = () => builderView(v);
    $('#pickC').onchange = (e) => { state.builder = Number(e.target.value); reload(); };
    $('#saveDesc').onclick = (e) => submit(e.target, async () => { await api('/teach/course/' + C.id, { description: $('#cDesc').value }); toast('Description saved'); });
    $('#kitForm').addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { await api('/teach/kit', { course_id: C.id, ...formData(ev.target) }); toast('Kit updated'); reload(); }); });
    $$('[data-kitrm]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api('/teach/kit', { course_id: C.id, product_id: Number(b.dataset.kitrm), remove: true }); reload(); })));
    const editors = { intake: intakeForm, module: moduleForm, lesson: lessonForm, assignment: assignmentForm, quiz: quizForm };
    const pools = { intake: d.intakes, module: d.modules, lesson: d.lessons, assignment: d.assignments, quiz: d.quizzes };
    $$('[data-new]', v).forEach((b) => b.addEventListener('click', () => editors[b.dataset.new](C, null, d, reload)));
    $$('[data-ed]', v).forEach((b) => b.addEventListener('click', () => { const [k, id] = b.dataset.ed.split(':'); editors[k](C, pools[k].find((x) => x.id == id), d, reload); }));
  }
  const delBtn = (x) => (x ? '<button class="btn danger" type="button" id="del">Delete</button>' : '');
  function wireForm(d, sel, path, body, done, errSel) {
    $(sel, d).addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { await api(path, await body(formData(ev.target))); d.close(); toast('Saved'); done(); }, $(errSel, d)); });
  }
  function confirmDelete(d, what, path, body, done) {
    const b = $('#del', d); if (!b) return;
    b.onclick = () => { if (b.dataset.sure) submit(b, async () => { await api(path, body); d.close(); toast(what + ' deleted'); done(); }); else { b.dataset.sure = 1; b.textContent = 'Press again to delete'; } };
  }
  function intakeForm(C, i, d0, done) {
    i = i || { venue: 'Harare', active: 1 };
    const d = dialog(`<h2>${i.id ? 'Edit intake' : 'Add intake'}</h2><form class="form" id="f">
      <label>Name<input name="name" value="${esc(i.name || '')}" placeholder="e.g. Feb 2027 evening class" required></label>
      <div class="two"><label>Venue<select name="venue">${['Harare', 'Online'].map((x) => `<option ${x === i.venue ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label>Places (blank = no limit)<input name="capacity" type="number" min="1" value="${i.capacity ?? ''}"></label></div>
      <div class="two"><label>Start date<input name="start_date" type="date" value="${esc(i.start_date || '')}"></label><label>End date<input name="end_date" type="date" value="${esc(i.end_date || '')}"></label></div>
      <label>Schedule shown to students<input name="schedule" value="${esc(i.schedule || '')}" placeholder="e.g. Tue & Thu 17:30–20:30, Bloomingdale"></label>
      <label class="check"><input type="checkbox" name="active" ${i.active ? 'checked' : ''}> Open for applications</label>
      <p class="err" id="e"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save</button></div></form>`);
    wireForm(d, '#f', '/intake', (f) => ({ ...f, id: i.id, course_id: C.id }), done, '#e');
  }
  function moduleForm(C, m, d0, done) {
    m = m || { sort: d0.modules.length + 1 };
    const d = dialog(`<h2>${m.id ? 'Edit module' : 'Add module'}</h2><form class="form" id="f"><label>Module title<input name="title" value="${esc(m.title || '')}" placeholder="e.g. Week 1: Inputs and outputs" required></label>
      <label>Order<input name="sort" type="number" value="${m.sort ?? 0}"></label><p class="err" id="e"></p><div class="actions">${delBtn(m.id)}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save</button></div></form>`);
    wireForm(d, '#f', '/teach/module', (f) => ({ ...f, id: m.id, course_id: C.id }), done, '#e');
    confirmDelete(d, 'Module', '/teach/module', { id: m.id, course_id: C.id, delete: true }, done);
  }
  function lessonForm(C, l, d0, done) {
    l = l || { kind: 'video', published: 1, sort: d0.lessons.length + 1 };
    const d = dialog(`<h2>${l.id ? 'Edit lesson' : 'Add lesson'}</h2><form class="form" id="f">
      <label>Lesson title<input name="title" value="${esc(l.title || '')}" required></label>
      <div class="two"><label>Module<select name="module_id"><option value="">No module</option>${d0.modules.map((m) => `<option value="${m.id}" ${m.id === l.module_id ? 'selected' : ''}>${esc(m.title)}</option>`).join('')}</select></label>
        <label>Type<select name="kind" id="kind">${[['video', 'Video'], ['reading', 'Reading'], ['file', 'File (PDF, PLC project…)'], ['link', 'Web link']].map(([k, n]) => `<option value="${k}" ${k === l.kind ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <label data-k="video link">Link<input name="url" type="url" value="${esc(l.url || '')}" placeholder="YouTube (unlisted), Vimeo or Google Drive link"></label>
      <p class="small muted" data-k="video">Upload the video to YouTube as <b>Unlisted</b> (or share from Google Drive), then paste the link. Only students on this course can see it here.</p>
      <div data-k="file"><label>File (up to 15 MB)<input type="file" id="lf"></label><p class="small muted" id="fileNote">${l.file_name ? 'Current file: ' + esc(l.file_name) : ''}</p></div>
      <label>Notes or reading text<textarea name="body" rows="6">${esc(l.body || '')}</textarea></label>
      <div class="two"><label>Order<input name="sort" type="number" value="${l.sort ?? 0}"></label><label class="check" style="align-self:end"><input type="checkbox" name="published" ${l.published ? 'checked' : ''}> Show to students</label></div>
      <p class="err" id="e"></p><div class="actions">${delBtn(l.id)}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save lesson</button></div></form>`);
    const sync = () => $$('[data-k]', d).forEach((el) => (el.hidden = !el.dataset.k.split(' ').includes($('#kind', d).value)));
    $('#kind', d).onchange = sync; sync();
    wireForm(d, '#f', '/teach/lesson', async (f) => {
      let file_id = l.file_id || null; const file = $('#lf', d).files[0];
      if (file) file_id = (await MEA.upload(file, 'lesson', (p) => ($('#fileNote', d).textContent = 'Uploading ' + p + '%'))).id;
      return { ...f, id: l.id, course_id: C.id, file_id };
    }, done, '#e');
    confirmDelete(d, 'Lesson', '/teach/lesson', { id: l.id, course_id: C.id, delete: true }, done);
  }
  function assignmentForm(C, a, d0, done) {
    a = a || { max_score: 100, published: 1 };
    const d = dialog(`<h2>${a.id ? 'Edit assignment' : 'Add assignment'}</h2><form class="form" id="f">
      <label>Title<input name="title" value="${esc(a.title || '')}" required></label><label>Instructions<textarea name="instructions" rows="6">${esc(a.instructions || '')}</textarea></label>
      <div class="two"><label>Due date<input name="due_date" type="date" value="${esc(a.due_date || '')}"></label><label>Marked out of<input name="max_score" type="number" min="1" step="0.5" value="${a.max_score}"></label></div>
      <label class="check"><input type="checkbox" name="published" ${a.published ? 'checked' : ''}> Show to students</label>
      <p class="err" id="e"></p><div class="actions">${delBtn(a.id)}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save</button></div></form>`);
    wireForm(d, '#f', '/teach/assignment', (f) => ({ ...f, id: a.id, course_id: C.id }), done, '#e');
    confirmDelete(d, 'Assignment', '/teach/assignment', { id: a.id, course_id: C.id, delete: true }, done);
  }
  function quizForm(C, q, d0, done) {
    q = q || { pass_pct: 60, attempts: 2, published: 1, questions: [{ q: '', options: ['', ''], answer: 0 }] };
    const qs = JSON.parse(JSON.stringify(q.questions.length ? q.questions : [{ q: '', options: ['', ''], answer: 0 }]));
    const d = dialog(`<h2>${q.id ? 'Edit test' : 'Add test'}</h2><form class="form" id="f">
      <label>Title<input name="title" value="${esc(q.title || '')}" required></label>
      <div class="three"><label>Pass mark %<input name="pass_pct" type="number" min="1" max="100" value="${q.pass_pct}"></label><label>Attempts allowed<input name="attempts" type="number" min="1" max="10" value="${q.attempts}"></label><label class="check" style="align-self:end"><input type="checkbox" name="published" ${q.published ? 'checked' : ''}> Show to students</label></div>
      <div id="qs" class="stack"></div><div><button class="btn sm ghost" type="button" id="addQ">Add question</button></div>
      <p class="err" id="e"></p><div class="actions">${delBtn(q.id)}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save test</button></div></form>`);
    const box = $('#qs', d);
    const paint = () => {
      box.innerHTML = qs.map((x, i) => `<fieldset class="q"><legend>Question ${i + 1} <button type="button" class="btn sm ghost" data-rq="${i}">Remove</button></legend>
        <input data-q="${i}" value="${esc(x.q)}" placeholder="Question" required>
        ${x.options.map((o, j) => `<div class="inline"><label class="check" title="Correct answer"><input type="radio" name="ans${i}" value="${j}" ${x.answer === j ? 'checked' : ''}> correct</label><input data-o="${i}:${j}" value="${esc(o)}" placeholder="Option ${j + 1}" style="flex:1"></div>`).join('')}
        ${x.options.length < 6 ? `<button type="button" class="btn sm ghost" data-ao="${i}">Add option</button>` : ''}</fieldset>`).join('');
      $$('[data-q]', box).forEach((el) => (el.oninput = () => (qs[el.dataset.q].q = el.value)));
      $$('[data-o]', box).forEach((el) => (el.oninput = () => { const [i, j] = el.dataset.o.split(':'); qs[i].options[j] = el.value; }));
      $$('input[type=radio]', box).forEach((el) => (el.onchange = () => (qs[el.name.slice(3)].answer = Number(el.value))));
      $$('[data-ao]', box).forEach((el) => (el.onclick = () => { qs[el.dataset.ao].options.push(''); paint(); }));
      $$('[data-rq]', box).forEach((el) => (el.onclick = () => { qs.splice(Number(el.dataset.rq), 1); paint(); }));
    };
    paint();
    $('#addQ', d).onclick = () => { qs.push({ q: '', options: ['', ''], answer: 0 }); paint(); };
    wireForm(d, '#f', '/teach/quiz', (f) => ({ title: f.title, pass_pct: f.pass_pct, attempts: f.attempts, published: f.published, id: q.id, course_id: C.id,
      questions: qs.map((x) => { const keep = x.options.map((o, j) => [o.trim(), j]).filter(([o]) => o); return { q: x.q, options: keep.map(([o]) => o), answer: Math.max(0, keep.findIndex(([, j]) => j === x.answer)) }; }) }), done, '#e');
    confirmDelete(d, 'Test', '/teach/quiz', { id: q.id, course_id: C.id, delete: true }, done);
  }

  async function markingView(v) {
    const { submissions } = await api('/teach/marking');
    const todo = submissions.filter((s) => !s.marked_at);
    v.innerHTML = `<div class="stack"><div class="stats"><div class="stat ${todo.length ? 'alert' : ''}"><b>${todo.length}</b><span>to mark</span></div><div class="stat"><b>${submissions.length - todo.length}</b><span>marked</span></div></div>
      <div class="card">${table([{ h: 'Student', f: (s) => `<b>${esc(s.student)}</b><br><span class="small muted">${esc(s.code)}</span>` }, { h: 'Assignment', f: (s) => esc(s.title) }, { h: 'Handed in', f: (s) => date(s.submitted_at, 1) + (s.due_date && s.submitted_at.slice(0, 10) > s.due_date ? ' <span class="pill bad">Late</span>' : '') },
        { h: 'Mark', f: (s) => (s.marked_at ? `<b>${s.score} / ${s.max_score}</b>` : pill('pending')) }, { h: '', f: (s) => `<button class="btn sm ${s.marked_at ? 'ghost' : ''}" data-mk="${s.id}">${s.marked_at ? 'Review' : 'Mark'}</button>` }], submissions, 'Nothing handed in yet.')}</div></div>`;
    $$('[data-mk]', v).forEach((b) => b.addEventListener('click', () => {
      const s = submissions.find((x) => x.id == b.dataset.mk);
      const d = dialog(`<h2>${esc(s.title)}</h2><p class="small muted">${esc(s.student)} · ${esc(s.code)} · handed in ${date(s.submitted_at, 1)}</p>
        ${s.text ? `<div class="card small">${MEA.paras(s.text)}</div>` : ''}${s.file_id ? `<p><a class="btn sm ghost" href="/api/files/${s.file_id}" target="_blank" rel="noopener">Open ${esc(s.file_name)}</a></p>` : ''}
        <form class="form" id="f"><label>Score out of ${s.max_score}<input name="score" type="number" min="0" max="${s.max_score}" step="0.5" value="${s.score ?? ''}" required></label>
          <label>Feedback for the student<textarea name="feedback" rows="4">${esc(s.feedback || '')}</textarea></label>
          <p class="err" id="e"></p><div class="actions">${s.marked_at ? '<button class="btn ghost" type="button" id="reopen">Let student resubmit</button>' : ''}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save mark</button></div></form>`);
      wireForm(d, '#f', '/teach/submission/' + s.id, (f) => f, () => markingView(v), '#e');
      const ro = $('#reopen', d); if (ro) ro.onclick = () => submit(ro, async () => { await api('/teach/submission/' + s.id, { reopen: true }); d.close(); toast('Student can resubmit'); markingView(v); });
    }));
  }

  async function noticesView(v) {
    const [{ notices }, { courses }] = await Promise.all([api('/notices'), me.role === 'admin' ? api('/admin/courses') : api('/teach/overview')]);
    const intakes = (await Promise.all(courses.map((c) => api('/teach/content/' + c.id)))).flatMap((x) => x.intakes.map((i) => ({ ...i, code: x.course.code })));
    v.innerHTML = `<div class="split"><div class="card stack"><h2>Post a notice</h2><form class="form" id="nForm">
        <label>Send to<select name="target">${me.role === 'admin' ? '<option value="all">Every student</option>' : ''}${courses.map((c) => `<option value="c${c.id}">All students on ${esc(c.code)}</option>`).join('')}${intakes.map((i) => `<option value="i${i.id}">${esc(i.code)} · ${esc(i.name)} (${esc(i.venue)})</option>`).join('')}</select></label>
        <label>Title<input name="title" required></label><label>Message<textarea name="body" rows="5" required></textarea></label>
        <p class="err" id="nErr"></p><button class="btn" type="submit">Post notice</button></form></div>
      <div class="stack">${notices.length ? notices.map((n) => `<div class="card stack" style="gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(n.title)}</b><button class="btn sm ghost" data-nd="${n.id}">Remove</button></div>
        <span class="small muted">${n.intake ? esc(n.code || '') + ' · ' + esc(n.intake) : n.code ? 'All on ' + esc(n.code) : 'Every student'} · ${date(n.created_at, 1)} · ${esc(n.author || '')}</span><div class="small">${MEA.paras(n.body)}</div></div>`).join('') : empty('No notices yet. Students see notices on their Home page.')}</div></div>`;
    $('#nForm').addEventListener('submit', (ev) => { ev.preventDefault(); const f = formData(ev.target); const t = f.target;
      submit(ev.submitter, async () => { await api('/notices', { title: f.title, body: f.body, course_id: t[0] === 'c' ? Number(t.slice(1)) : null, intake_id: t[0] === 'i' ? Number(t.slice(1)) : null }); toast('Notice posted'); noticesView(v); }, $('#nErr')); });
    $$('[data-nd]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api('/notices', { id: Number(b.dataset.nd), delete: true }); noticesView(v); })));
  }

  /* ---------- resources (website articles) ---------- */
  async function resourcesView(v) {
    const { articles } = await api('/admin/articles');
    let seed = [];
    try { const html = await (await fetch('/', { credentials: 'same-origin' })).text(); const m = html.match(/<script[^>]*id="seed"[^>]*>([\s\S]*?)<\/script>/); if (m) seed = (JSON.parse(m[1]).articles || []).filter((a) => !articles.some((x) => x.slug === a.id)); } catch (e) {}
    v.innerHTML = `<div class="stack">${seed.length ? `<div class="card stack"><p><b>${seed.length} website articles are not in the editor yet.</b> Load them once so you can edit or hide them here.</p><div><button class="btn sm" id="seedA">Load the website articles</button> <span class="small muted" id="seedP"></span></div></div>` : ''}<div class="inline"><button class="btn sm" id="newA">Write an article</button><a class="btn sm ghost" href="/#resources" target="_blank" rel="noopener">See Resources on the website</a></div>
      <div class="card">${table([{ h: 'Article', f: (a) => `<b>${esc(a.title)}</b><br><span class="small muted">${esc(a.sum || '')}</span>` }, { h: 'Category', k: 'cat' }, { h: 'Read', num: true, f: (a) => a.mins + ' min' },
        { h: 'Shown', f: (a) => (a.published ? pill('active') : pill('Hidden')) }, { h: 'Updated', f: (a) => `${date(a.updated_at)}${a.editor ? '<br><span class="small muted">' + esc(a.editor) + '</span>' : ''}` },
        { h: '', f: (a) => `<button class="btn sm ghost" data-ea="${a.id}">Edit</button>` }], articles, 'No articles yet.')}</div></div>`;
    const reload = () => resourcesView(v);
    $('#newA').onclick = () => articleForm(null, reload);
    if ($('#seedA')) $('#seedA').onclick = (e) => submit(e.target, async () => {
      for (let i = 0; i < seed.length; i++) { const a = seed[i]; $('#seedP').textContent = `${i + 1} of ${seed.length}`; await api('/admin/article', { slug: a.id, title: a.title, cat: a.cat, mins: a.mins, sum: a.sum, body: a.body, img: a.img || '', alt: a.alt || '', published: true, sort: i + 1 }); }
      toast('Website articles loaded'); reload();
    });
    $$('[data-ea]', v).forEach((b) => b.addEventListener('click', () => articleForm(articles.find((a) => a.id == b.dataset.ea), reload)));
  }
  function articleForm(a, done) {
    a = a || { cat: 'Automation', mins: 3, published: 1, body: [], img: '' };
    let img = a.img || '';
    const d = dialog(`<h2>${a.id ? 'Edit article' : 'New article'}</h2><form class="form" id="f">
      <label>Title<input name="title" value="${esc(a.title || '')}" required></label>
      <div class="three"><label>Category<select name="cat">${CATS.map((c) => `<option ${c === a.cat ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label>Minutes to read<input name="mins" type="number" min="1" value="${a.mins}"></label><label>Order<input name="sort" type="number" value="${a.sort ?? 0}"></label></div>
      <label>Short summary<input name="sum" value="${esc(a.sum || '')}"></label>
      <label>Article text (leave an empty line between paragraphs)<textarea name="body" rows="12">${esc((a.body || []).join('\n\n'))}</textarea></label>
      <div class="inline"><div id="pv">${img ? `<img src="${esc(img)}" alt="" style="max-height:90px;border-radius:8px">` : '<span class="small muted">No picture</span>'}</div><label>Picture or diagram<input type="file" accept="image/*" id="pic"></label></div>
      <label>Picture description (for screen readers)<input name="alt" value="${esc(a.alt || '')}"></label>
      <label class="check"><input type="checkbox" name="published" ${a.published ? 'checked' : ''}> Show on the website</label>
      <p class="err" id="e"></p><div class="actions">${delBtn(a.id)}<button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save article</button></div></form>`);
    $('#pic', d).onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (f.type === 'image/svg+xml' && f.size < 250000) img = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
      else img = await shrink(f, 1200, 0.82);
      $('#pv', d).innerHTML = `<img src="${img}" alt="" style="max-height:90px;border-radius:8px">`;
    };
    wireForm(d, '#f', '/admin/article', (f) => ({ ...f, id: a.id, slug: a.slug, img }), done, '#e');
    confirmDelete(d, 'Article', '/admin/article', { id: a.id, delete: true }, done);
  }
  function shrink(file, max, q) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q)); URL.revokeObjectURL(im.src); }; im.onerror = () => rej(new Error('That picture could not be read.')); im.src = URL.createObjectURL(file); });
  }

  /* ---------- admin: fees and companies ---------- */
  async function adminFeesView(v) {
    const r = await api('/admin/invoices');
    const owing = r.invoices.filter((i) => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0);
    const today = new Date().toISOString().slice(0, 10);
    v.innerHTML = `<div class="stack">
      <div class="stats"><div class="stat ${owing ? 'alert' : ''}"><b>${money(owing)}</b><span>owing</span></div><div class="stat"><b>${r.invoices.filter((i) => i.status === 'unpaid' && i.due_date && i.due_date < today).length}</b><span>overdue</span></div>
        <div class="stat"><b>${r.unbilled.length}</b><span>enrolments not invoiced</span></div><div class="stat"><b>${money(r.invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0))}</b><span>paid to date</span></div></div>
      ${r.unbilled.length ? `<div class="card"><div class="cardhead"><h2>Not invoiced yet</h2><span class="small muted">Course fee from the course settings</span></div>${table([{ h: 'Student', f: (e) => `<b>${esc(e.student)}</b>${e.company ? '<br><span class="small">' + esc(e.company) + '</span>' : ''}` }, { h: 'Course', f: (e) => esc(e.code) }, { h: 'Fee', num: true, f: (e) => money(e.fee) },
        { h: '', f: (e) => `<button class="btn sm" data-bill="${e.id}">Invoice ${e.company ? 'company' : 'student'}</button>` }], r.unbilled)}</div>` : ''}
      <div class="card"><div class="cardhead"><h2>Invoices</h2><div class="inline"><button class="btn sm" id="newI">New invoice</button><button class="btn sm ghost" id="csvI">Download CSV</button></div></div>${table([
        { h: 'Invoice', f: (i) => `<b>${esc(i.number)}</b><br><span class="small muted">${date(i.created_at)}</span>` }, { h: 'Billed to', f: (i) => esc(i.company || i.student || '') }, { h: 'For', k: 'description' },
        { h: 'Due', f: (i) => (i.due_date ? date(i.due_date) + (i.status === 'unpaid' && i.due_date < today ? ' <span class="pill bad">Overdue</span>' : '') : '—') }, { h: 'Amount', num: true, f: (i) => `<b>${money(i.amount)}</b>` },
        { h: 'Status', f: (i) => pill(i.status) + (i.status === 'paid' ? `<br><span class="small muted">${esc(i.method || '')} ${date(i.paid_at)}</span>` : '') },
        { h: '', f: (i) => `<span class="inline">${i.status === 'unpaid' ? `<button class="btn sm" data-pay="${i.id}">Mark paid</button><button class="btn sm ghost" data-void="${i.id}">Void</button>` : i.status === 'paid' ? `<button class="btn sm ghost" data-undo="${i.id}">Undo</button>` : ''}<button class="btn sm ghost" data-pi="${i.id}">Print</button></span>` }], r.invoices, 'No invoices yet.')}</div></div>`;
    const reload = () => adminFeesView(v);
    $$('[data-bill]', v).forEach((b) => b.addEventListener('click', () => { const e = r.unbilled.find((x) => x.id == b.dataset.bill); invoiceForm(r, { student_id: e.company_id ? null : e.student_id, company_id: e.company_id, enrolment_id: e.id, amount: e.fee, description: `${e.code} ${e.title} course fee${e.company_id ? ' · ' + e.student : ''}` }, reload); }));
    $('#newI').onclick = () => invoiceForm(r, {}, reload);
    $('#csvI').onclick = () => MEA.download('mea-invoices.csv', MEA.csv(['number', 'created_at', 'student', 'company', 'description', 'amount', 'due_date', 'status', 'paid_at', 'method', 'reference'], r.invoices));
    $$('[data-void]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api('/admin/invoice/' + b.dataset.void, { action: 'void' }); toast('Invoice voided'); reload(); })));
    $$('[data-undo]', v).forEach((b) => b.addEventListener('click', () => submit(b, async () => { await api('/admin/invoice/' + b.dataset.undo, { action: 'unpaid' }); toast('Set back to unpaid'); reload(); })));
    $$('[data-pi]', v).forEach((b) => b.addEventListener('click', () => { const i = r.invoices.find((x) => x.id == b.dataset.pi); printInvoice(i, i.company || `${i.student || ''}\n${i.student_email || ''}`); }));
    $$('[data-pay]', v).forEach((b) => b.addEventListener('click', () => { const i = r.invoices.find((x) => x.id == b.dataset.pay);
      const d = dialog(`<h2>Mark ${esc(i.number)} paid</h2><p class="muted">${money(i.amount)} from ${esc(i.company || i.student)}</p><form class="form" id="f"><label>Paid by<select name="method">${METHODS.map((m) => `<option>${m}</option>`).join('')}</select></label>
        <label>Reference (optional)<input name="reference" placeholder="e.g. EcoCash ref or bank ref"></label><p class="err" id="e"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Mark paid</button></div></form>`);
      wireForm(d, '#f', '/admin/invoice/' + i.id, (f) => ({ ...f, action: 'paid' }), reload, '#e'); }));
  }
  function invoiceForm(r, x, done) {
    const d = dialog(`<h2>New invoice</h2><form class="form" id="f">
      <label>Bill<select id="who"><option value="s" ${!x.company_id ? 'selected' : ''}>A student</option><option value="c" ${x.company_id ? 'selected' : ''}>A company</option></select></label>
      <label data-w="s">Student<select name="student_id"><option value="">Choose…</option>${r.people.map((p) => `<option value="${p.id}" ${p.id === x.student_id ? 'selected' : ''}>${esc(p.name)} · ${esc(p.email)}</option>`).join('')}</select></label>
      <label data-w="c">Company<select name="company_id"><option value="">Choose…</option>${r.companies.map((c) => `<option value="${c.id}" ${c.id === x.company_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <label>Description<input name="description" value="${esc(x.description || '')}" required></label>
      <div class="two"><label>Amount (USD)<input name="amount" type="number" min="0" step="0.01" value="${x.amount ?? ''}" required></label><label>Due date<input name="due_date" type="date" value="${new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10)}"></label></div>
      <p class="err" id="e"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Create invoice</button></div></form>`);
    const sync = () => $$('[data-w]', d).forEach((el) => (el.hidden = el.dataset.w !== $('#who', d).value)); $('#who', d).onchange = sync; sync();
    wireForm(d, '#f', '/admin/invoice', (f) => ({ ...f, enrolment_id: x.enrolment_id, student_id: $('#who', d).value === 's' ? f.student_id : null, company_id: $('#who', d).value === 'c' ? f.company_id : null }), done, '#e');
  }
  async function companiesView(v) {
    const r = await api('/admin/companies');
    v.innerHTML = `<div class="stack"><div class="inline"><button class="btn sm" id="newC">Add company</button></div>
      <div class="card">${table([{ h: 'Company', f: (c) => `<b>${esc(c.name)}</b><br><span class="small muted">${esc(c.contact_name || '')} ${esc(c.email || '')} ${esc(c.phone || '')}</span>` }, { h: 'People', num: true, k: 'people' }, { h: 'Owing', num: true, f: (c) => money(c.owing) },
        { h: '', f: (c) => `<button class="btn sm ghost" data-ec="${c.id}">Edit</button>` }], r.companies, 'No companies yet. Add a company to train its staff on one invoice.')}</div>
      <div class="card stack"><h2>Link a student account to a company</h2><p class="small muted">Make one person the company's training manager: they can add their staff, enrol them, follow progress and see company invoices in their portal.</p>
        <form class="inline" id="mForm"><select name="user_id" required><option value="">Student account…</option>${r.people.map((p) => `<option value="${p.id}">${esc(p.name)} · ${esc(p.email)}${p.company_id ? ' (' + esc((r.companies.find((c) => c.id === p.company_id) || {}).name || '') + ')' : ''}</option>`).join('')}</select>
          <select name="company_id"><option value="">No company</option>${r.companies.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><label class="check"><input type="checkbox" name="manager"> Training manager</label><button class="btn sm" type="submit">Save</button></form></div></div>`;
    const reload = () => companiesView(v);
    const form = (c) => { c = c || {}; const d = dialog(`<h2>${c.id ? 'Edit company' : 'Add company'}</h2><form class="form" id="f"><label>Company name<input name="name" value="${esc(c.name || '')}" required></label>
      <div class="two"><label>Contact person<input name="contact_name" value="${esc(c.contact_name || '')}"></label><label>Phone<input name="phone" value="${esc(c.phone || '')}"></label></div><label>Email<input name="email" type="email" value="${esc(c.email || '')}"></label>
      <label>Billing address<textarea name="address" rows="2">${esc(c.address || '')}</textarea></label><label>Notes<textarea name="notes" rows="2">${esc(c.notes || '')}</textarea></label>
      <p class="err" id="e"></p><div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save</button></div></form>`);
      wireForm(d, '#f', '/admin/company', (f) => ({ ...f, id: c.id }), reload, '#e'); };
    $('#newC').onclick = () => form();
    $$('[data-ec]', v).forEach((b) => b.addEventListener('click', () => form(r.companies.find((c) => c.id == b.dataset.ec))));
    $('#mForm').addEventListener('submit', (ev) => { ev.preventDefault(); submit(ev.submitter, async () => { await api('/admin/company-member', formData(ev.target)); toast('Saved'); reload(); }); });
  }

  /* =================== STORE DEPARTMENT (unchanged behaviour) =================== */
  const OSTAT = ['awaiting_payment', 'paid', 'packed', 'dispatched', 'completed', 'cancelled'];
  async function shopView(v) {
    const { products, orders } = await api('/shop/overview');
    const open = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
    const low = products.filter((p) => p.active && p.stock <= p.low_stock);
    v.innerHTML = `<div class="stack">
      <div class="stats">
        <div class="stat ${orders.some((o) => o.status === 'awaiting_payment') ? 'alert' : ''}"><b>${orders.filter((o) => o.status === 'awaiting_payment').length}</b><span>awaiting payment</span></div>
        <div class="stat"><b>${orders.filter((o) => ['paid', 'packed'].includes(o.status)).length}</b><span>to pack or send</span></div>
        <div class="stat"><b>${products.filter((p) => p.active).length}</b><span>products on sale</span></div>
        <div class="stat ${low.length ? 'alert' : ''}"><b>${low.length}</b><span>low on stock</span></div>
      </div>
      <div class="inline"><button class="btn ${state.shopTab === 'orders' ? '' : 'ghost'} sm" data-st="orders">Orders (${open.length} open)</button><button class="btn ${state.shopTab === 'products' ? '' : 'ghost'} sm" data-st="products">Products and stock</button><a class="btn ghost sm" href="/store" target="_blank" rel="noopener">View the shop</a></div>
      <div id="shopBody"></div></div>`;
    $$('[data-st]', v).forEach((b) => b.addEventListener('click', () => { state.shopTab = b.dataset.st; shopView(v); }));
    const body = $('#shopBody');
    if (state.shopTab === 'orders') {
      body.innerHTML = `<div class="card"><div class="cardhead"><h2>Orders</h2><button class="btn ghost sm" id="ordCsv">Download CSV</button></div>${table([
        { h: 'Order', f: (o) => `<b>${esc(o.number)}</b><br><span class="small muted">${date(o.created_at, 1)}</span>` },
        { h: 'Customer', f: (o) => `${esc(o.name)}<br><span class="small muted">${esc(o.phone)} · ${esc(o.email)}</span>` },
        { h: 'Items', f: (o) => `<span class="small">${esc(o.items || '')}</span>` },
        { h: 'Delivery', f: (o) => (o.delivery === 'deliver' ? `Deliver<br><span class="small muted">${esc(o.address || '')}</span>` : 'Collect') },
        { h: 'Total', num: true, f: (o) => `<b class="num">${money(o.total)}</b>` },
        { h: 'Status', f: (o) => (o.status === 'cancelled' ? pill('cancelled') : `<select data-os="${o.id}" aria-label="Order status">${OSTAT.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${label(s)}</option>`).join('')}</select>`) }], orders, 'No orders yet. They appear here when customers check out in the shop.')}</div>`;
      $$('[data-os]', body).forEach((s) => s.addEventListener('change', () => {
        const o = orders.find((x) => x.id == s.dataset.os);
        const run = () => submit(s, async () => { await api('/shop/order/' + o.id, { status: s.value }); toast(o.number + ' set to ' + label(s.value)); shopView(v); });
        if (s.value === 'cancelled') dialog(`<h2>Cancel ${esc(o.number)}?</h2><p class="muted">The items go back into stock. A cancelled order cannot be reopened.</p><div class="actions"><button class="btn ghost" data-close>Keep order</button><button class="btn danger" id="yes">Cancel order</button></div>`,
          (d) => { $('#yes', d).onclick = () => { d.close(); run(); }; d.addEventListener('close', () => { if (s.value === 'cancelled') s.value = o.status; }); });
        else run();
      }));
      $('#ordCsv').onclick = () => MEA.download('mea-orders.csv', MEA.csv(['number', 'created_at', 'name', 'email', 'phone', 'country', 'delivery', 'address', 'items', 'total', 'status'], orders));
    } else {
      body.innerHTML = `<div class="card"><div class="cardhead"><h2>Products and stock</h2><button class="btn sm" id="addP">Add product</button></div>${table([
        { h: 'SKU', k: 'sku' }, { h: 'Product', f: (p) => `<b>${esc(p.name)}</b><br><span class="small muted">${esc(p.category)}${p.brand ? ' · ' + esc(p.brand) : ''}</span>` },
        { h: 'Price', num: true, f: (p) => money(p.price) }, { h: 'Stock', num: true, f: (p) => `<b class="num">${p.stock}</b>` },
        { h: 'Status', f: (p) => (!p.active ? pill('Hidden') : p.stock <= p.low_stock ? pill('Reorder') : pill('OK')) },
        { h: '', f: (p) => `<button class="btn ghost sm" data-ep="${p.id}">Edit</button>` }], products, 'No products yet. Add your first product and it appears in the shop straight away.')}</div>`;
      $('#addP').onclick = () => productForm({ active: 1, low_stock: 2, stock: 0 }, v);
      $$('[data-ep]', body).forEach((b) => b.addEventListener('click', () => productForm(products.find((p) => p.id == b.dataset.ep), v)));
    }
  }
  function productForm(p, v) {
    const cats = ['PLC & Automation', 'Instrumentation', 'Motor control', 'Electrical', 'Tools', 'Training equipment', 'Spare parts'];
    dialog(`<h2>${p.id ? 'Edit product' : 'Add product'}</h2>
      <form class="form" id="pForm">
        <div class="two"><label>SKU / part number<input name="sku" value="${esc(p.sku || '')}" required></label><label>Brand<input name="brand" value="${esc(p.brand || '')}"></label></div>
        <label>Product name<input name="name" value="${esc(p.name || '')}" required></label>
        <label>Category<input name="category" list="cats" value="${esc(p.category || '')}" required><datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
        <div class="three"><label>Price (USD)<input name="price" type="number" step="0.01" min="0" value="${p.price ?? ''}" required></label><label>In stock<input name="stock" type="number" step="1" min="0" value="${p.stock ?? 0}" required></label><label>Reorder at<input name="low_stock" type="number" step="1" min="0" value="${p.low_stock ?? 2}"></label></div>
        <label>Description<textarea name="description" rows="3">${esc(p.description || '')}</textarea></label>
        <label class="check"><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Show in the shop</label>
        <p class="err" id="pErr"></p>
        <div class="actions"><button class="btn ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save product</button></div>
      </form>`, (d) => $('#pForm', d).addEventListener('submit', (e) => {
      e.preventDefault();
      submit(e.submitter, async () => { await api('/shop/product', { id: p.id, ...formData(e.target) }); d.close(); toast('Product saved'); shopView(v); }, $('#pErr', d));
    }));
  }

  /* ---------- department enquiries ---------- */
  async function enqView(v) {
    const { enquiries } = await api('/dept/enquiries');
    const S = ['new', 'in_progress', 'quoted', 'won', 'closed'];
    v.innerHTML = `<div class="stack"><div class="stats">${S.map((s) => `<div class="stat ${s === 'new' && enquiries.some((q) => q.status === 'new') ? 'alert' : ''}"><b>${enquiries.filter((q) => q.status === s).length}</b><span>${label(s)}</span></div>`).join('')}</div>
      ${enquiries.length ? enquiries.map((q) => `<div class="card stack">
        <div class="cardhead" style="margin:0"><div><h3>${esc(q.type || 'Enquiry')} · ${esc(q.project || '')}</h3><p class="small muted">#${q.id} · ${date(q.created_at, 1)}${me.role === 'admin' ? ' · ' + esc(DEPTS[q.dept] || q.dept) : ''}</p></div>${pill(q.status)}</div>
        <p><b>${esc(q.name)}</b>${q.company ? ' · ' + esc(q.company) : ''}${q.country ? ' · ' + esc(q.country) : ''}<br><span class="small">${esc(q.email || '')} ${esc(q.phone || '')}</span></p>
        <p style="white-space:pre-wrap">${esc(q.description || '')}</p>
        ${q.budget || q.needed_by ? `<p class="small muted">${q.budget ? 'Budget: ' + esc(q.budget) : ''} ${q.needed_by ? ' · Needed by ' + esc(q.needed_by) : ''}</p>` : ''}
        <div class="${me.role === 'admin' ? 'three' : 'two'}">
          <label>Status<select data-qs="${q.id}">${S.map((s) => `<option value="${s}" ${s === q.status ? 'selected' : ''}>${label(s)}</option>`).join('')}</select></label>
          ${me.role === 'admin' ? `<label>Department<select data-qd="${q.id}">${Object.keys(DEPTS).map((d) => `<option value="${d}" ${d === q.dept ? 'selected' : ''}>${DEPTS[d]}</option>`).join('')}</select></label>` : ''}
          <label>Internal note<input data-qn="${q.id}" value="${esc(q.note || '')}" placeholder="e.g. Quoted $1,200, site visit Tuesday"></label>
        </div>
        <div><button class="btn sm" data-qsave="${q.id}">Save</button></div>
      </div>`).join('') : '<div class="card"><p class="muted">No enquiries for your department yet. Website enquiries are sent here automatically.</p></div>'}</div>`;
    $$('[data-qsave]', v).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.qsave, dd = $(`[data-qd="${id}"]`);
      submit(b, async () => { await api('/dept/enquiry/' + id, { status: $(`[data-qs="${id}"]`).value, note: $(`[data-qn="${id}"]`).value, dept: dd ? dd.value : undefined }); toast('Enquiry updated'); render(); });
    }));
  }

  async function accountView(v) {
    v.innerHTML = `<div class="split"><div class="card stack"><h2>Your details</h2>
      <p><b>${esc(me.name)}</b><br>${esc(me.email)}${me.phone ? '<br>' + esc(me.phone) : ''}</p>
      <p class="small muted">To change your name or email, contact MEA admin.</p>
      <p class="small muted">Tip: on your phone, use "Add to Home Screen" to install the MEA Portal like an app.</p></div><div id="pw"></div></div>`;
    MEA.changePasswordView($('#pw'), me, () => render());
    $('#pw h1').outerHTML = '<h2>Change password</h2>';
    $('#pw .authbox').style.margin = '0';
  }

  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (me && h && h !== tab && tabsFor(me).some((t) => t[0] === h)) go(h, { course: null }); });
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  boot();
})();
