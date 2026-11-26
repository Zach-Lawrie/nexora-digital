/* ALL add-ons: web addresses for every screen, live African scores, photo news, sharing, calendars, welcome, install. */
(function () {
  'use strict';
  const ORIGIN = location.origin;
  const KEEP = ['x', 'tab', 'side', 'rk', 'c'];

  /* ---------- web addresses: every screen has a link, and the phone's back button works ---------- */
  const enc = (v) => {
    let h = '#/' + v.page + (v.id ? '/' + encodeURIComponent(v.id) : '');
    const q = KEEP.filter((k) => v[k] && !(k === 'side' && v[k] === 'home')).map((k) => k + '=' + encodeURIComponent(v[k]));
    return h + (q.length ? '?' + q.join('&') : '');
  };
  const dec = (h) => {
    const m = /^#\/([a-z-]+)(?:\/([^?]*))?(?:\?(.*))?$/.exec(h || ''); if (!m || !V[m[1]]) return null;
    const v = { page: m[1] }; if (m[2]) v.id = decodeURIComponent(m[2]);
    new URLSearchParams(m[3] || '').forEach((val, k) => { if (KEEP.includes(k)) v[k] = val; });
    if (v.page === 'match' && !v.side) v.side = 'home';
    return v;
  };
  const baseRender = render, baseGo = go, baseRoot = root, baseUpd = upd;
  let routed = false;
  render = function () {
    baseRender.apply(this, arguments);
    try { decorate(); } catch (e) { console.error(e); }
    const h = enc(S.view);
    if (routed && location.hash !== h) history.replaceState(null, '', h);
  };
  go = function (v) { if (routed) history.pushState(null, '', enc(v)); baseGo(v); };
  root = function (p) { baseRoot(p); };
  upd = function (p) { baseUpd(p); };
  A.back = function () { if (S.stack.length) history.back(); };
  window.addEventListener('popstate', () => {
    if (sheet) closeSheet();
    const v = dec(location.hash) || { page: 'home' };
    if (S.stack.length) S.view = S.stack.pop(); else S.view = v;
    if (enc(S.view) !== enc(v)) { S.stack = []; S.view = v; }
    baseRender(); try { decorate(); } catch (e) {}
    const el = document.getElementById('view'); if (el) el.scrollTop = 0;
  });
  // Open the screen in the address once the data has arrived.
  const wait = setInterval(() => {
    if (S.mode === 'loading') return;
    clearInterval(wait); routed = true;
    const v = dec(location.hash);
    if (v && enc(v) !== enc(S.view)) { S.stack = v.page === 'home' ? [] : [{ page: 'home' }]; S.view = v; }
    history.replaceState(null, '', enc(S.view)); render();
    welcome();
  }, 150);

  /* ---------- live scores and results from professional competitions across Africa ---------- */
  S.pro = []; S.proComps = []; S.proAt = 0;
  const loadPro = () => fetch('/api/scores', { credentials: 'same-origin' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (!d) return; S.pro = d.items || []; S.proComps = d.comps || []; S.proAt = d.at || Date.now();
    if (!sheet && ['home', 'live', 'africa'].includes(S.view.page)) render();
  }).catch(() => {});
  loadPro(); setInterval(() => { if (!document.hidden) loadPro(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - S.proAt > 60000) loadPro(); });

  const tm = (d) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const dayKey = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return +x; };
  const dayName = (d) => { const k = dayKey(d), t = dayKey(Date.now()); return k === t ? 'Today' : k === t + 864e5 ? 'Tomorrow' : k === t - 864e5 ? 'Yesterday' : new Date(d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }); };
  const logo = (s, n) => s.logo ? `<img class="plogo" src="${esc(s.logo)}" alt="" width="${n}" height="${n}" loading="lazy" referrerpolicy="no-referrer">` : `<span class="plogo ph" style="width:${n}px;height:${n}px">${esc((s.short || s.name || '?').slice(0, 3))}</span>`;
  const proState = (x) => x.state === 'in' ? `<span class="chip live">${esc(x.detail || 'Live')}</span>` : x.state === 'post' ? `<span class="chip">${esc(/postp|cancel|abandon/i.test(x.detail) ? x.detail : 'FT')}</span>` : `<span class="chip gold">${esc(dayKey(x.date) === dayKey(Date.now()) ? tm(x.date) : new Date(x.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) + ' ' + tm(x.date))}</span>`;
  const proScore = (x) => x.state === 'pre' ? 'VS' : `${esc(x.home.score ?? 0)} – ${esc(x.away.score ?? 0)}`;
  const proCard = (x, wide) => `<button class="card pcard ${wide ? '' : 'mini'} ${x.state === 'in' ? 'is-live' : ''}" data-act="pro" data-id="${esc(x.id)}">
    <div class="pc-top"><span class="pc-comp">${esc(x.comp)}</span>${proState(x)}</div>
    <div class="pc-row ${x.home.win ? 'w' : ''}">${logo(x.home, 22)}<span class="pc-n">${esc(x.home.name)}</span><b>${x.state === 'pre' ? '' : esc(x.home.score ?? 0)}</b></div>
    <div class="pc-row ${x.away.win ? 'w' : ''}">${logo(x.away, 22)}<span class="pc-n">${esc(x.away.name)}</span><b>${x.state === 'pre' ? '' : esc(x.away.score ?? 0)}</b></div></button>`;
  const order = (arr) => {
    const now = Date.now();
    const live = arr.filter((x) => x.state === 'in');
    const off = (x) => /postp|cancel|abandon|suspend|delay/i.test(x.detail);
    const next = arr.filter((x) => (x.state === 'pre' && new Date(x.date) > now - 3 * 36e5) || (off(x) && new Date(x.date) > now - 864e5)).sort((a, b) => a.date.localeCompare(b.date));
    const done = arr.filter((x) => x.state === 'post' && !off(x)).sort((a, b) => b.date.localeCompare(a.date));
    return { live, next, done };
  };
  function africaStrip() {
    if (!S.pro.length) return '';
    const o = order(S.pro), pick = [...o.live, ...o.done.slice(0, 6), ...o.next.slice(0, 6)].slice(0, 14);
    return `<section class="africa">${sec(`<span class="ttl-ic">🌍</span> Across Africa${o.live.length ? ` <span class="chip live">${o.live.length} live</span>` : ''}`, `<button class="btn sm ghost" ${goBtn('africa', '')}>All scores</button>`)}
      <div class="scroller pscroll" data-keep="africa">${pick.map((x) => proCard(x)).join('')}</div>
      <p class="pp src-note">Professional results update every minute · data ESPN</p></section>`;
  }
  function newsStrip(n) {
    const hs = S.heads.filter((h) => h.img).slice(0, n || 6); if (hs.length < 2) return '';
    return `<section>${sec('Africa sports news', `<button class="btn sm ghost" ${goBtn('news', '')}>All news</button>`)}
      <div class="ngrid">${hs.map((h, i) => `<a class="ncard ${i === 0 ? 'lead' : ''}" href="${esc(h.link)}" target="_blank" rel="noopener noreferrer"><img src="${esc(h.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"><span class="nc-body"><span class="src">${esc(h.src)}</span><span class="nc-t">${esc(h.title)}</span>${i === 0 && h.sum ? `<span class="nc-s">${esc(h.sum)}</span>` : ''}<span class="pp">${esc(h.at ? shortDate(h.at) : '')} · Read ↗</span></span></a>`).join('')}</div></section>`;
  }
  V.africa = (v) => {
    const comps = S.proComps.filter((c) => S.pro.some((x) => x.code === c.code));
    const c = comps.some((x) => x.code === v.c) ? v.c : '';
    const items = S.pro.filter((x) => !c || x.code === c), o = order(items);
    const seg = ['live', 'fixtures', 'results'].includes(v.x) ? v.x : o.live.length ? 'live' : 'results';
    let h = banner(null, `<div class="row"><span class="chip gold">Professional football and rugby</span></div><h1>Across Africa</h1><p class="sub">Live scores, fixtures and results from ${comps.length || 'the'} top competitions on the continent, updated every minute.</p>`, '');
    h += `<div class="row chips">${[['', 'All']].concat(comps.map((x) => [x.code, x.name])).map(([k, t]) => `<button class="btn ghost sm" data-act="c" data-id="${esc(k)}" aria-pressed="${k === c}">${esc(t)}</button>`).join('')}</div>`;
    h += `<div class="seg">${[['live', `Live (${o.live.length})`], ['fixtures', 'Fixtures'], ['results', 'Results']].map(([k, t]) => `<button data-act="x" data-id="${k}" aria-pressed="${seg === k}">${t}</button>`).join('')}</div>`;
    const arr = seg === 'live' ? o.live : seg === 'fixtures' ? o.next : o.done;
    if (!S.pro.length) return h + `<div class="empty">Loading scores from across Africa…</div>`;
    if (!arr.length) return h + `<div class="empty">${seg === 'live' ? 'No professional games are being played right now. Check Fixtures for the next kick-off.' : 'Nothing listed here yet.'}</div>`;
    const days = []; arr.forEach((x) => { const k = dayKey(x.date); let d = days.find((y) => y.k === k); if (!d) days.push(d = { k, n: dayName(x.date), xs: [] }); d.xs.push(x); });
    return h + days.map((d) => `<h3 class="dayh">${esc(d.n)}</h3><div class="pgrid">${d.xs.map((x) => proCard(x, 1)).join('')}</div>`).join('') + `<p class="pp src-note">Scores from ESPN. Tap a game for details and sharing.</p>`;
  };
  A.c = (id) => upd({ c: id });
  A.pro = (id) => {
    const x = S.pro.find((p) => p.id === id); if (!x) return;
    const text = x.state === 'pre' ? `${x.home.name} vs ${x.away.name} · ${x.comp} · ${new Date(x.date).toLocaleString()}` : `${x.home.name} ${x.home.score ?? 0}–${x.away.score ?? 0} ${x.away.name} (${x.detail}) · ${x.comp}`;
    sheet = { kind: 'html', title: x.comp, html: `<div class="psheet"><div class="row" style="justify-content:center">${proState(x)}<span class="chip">${esc(x.sport)}</span><span class="chip">${esc(x.country)}</span></div>
      <div class="vs"><div class="side">${logo(x.home, 64)}<div class="tn">${esc(x.home.name)}</div></div><div class="score ${x.state === 'pre' ? 'sm' : ''}">${proScore(x)}</div><div class="side">${logo(x.away, 64)}<div class="tn">${esc(x.away.name)}</div></div></div>
      <p class="sub" style="text-align:center">${esc(new Date(x.date).toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }))}${x.venue ? '<br>' + esc(x.venue) : ''}</p>
      <div class="row" style="justify-content:center">${shareBtns(text + ' — follow African sport on ALL', ORIGIN + '/#/africa')}${x.state === 'pre' ? `<button class="btn ghost sm" data-act="ics-pro" data-id="${esc(x.id)}">Add to calendar</button>` : ''}${x.link ? `<a class="btn sm" href="${esc(x.link)}" target="_blank" rel="noopener noreferrer">Full match centre ↗</a>` : ''}</div></div>` };
    renderSheet();
  };

  /* ---------- sharing ---------- */
  function shareBtns(text, url) {
    const t = esc(text), u = esc(url);
    return `<button class="btn sm share-wa" data-act="sh-wa" data-t="${t}" data-u="${u}"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg>WhatsApp</button><button class="btn ghost sm" data-act="sh-any" data-t="${t}" data-u="${u}">Share</button>`;
  }
  A['sh-wa'] = (id, el) => window.open('https://wa.me/?text=' + encodeURIComponent(el.dataset.t + '\n' + el.dataset.u), '_blank', 'noopener');
  A['sh-any'] = async (id, el) => {
    const d = { title: 'ALL · Africa Local Leagues', text: el.dataset.t, url: el.dataset.u };
    if (navigator.share) { try { await navigator.share(d); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(d.text + '\n' + d.url); toast('Link copied. Paste it anywhere.'); } catch (e) { prompt('Copy this link', d.url); }
  };
  function shareBar(kind, id, text, extra) {
    return `<div class="sharebar">${shareBtns(text, ORIGIN + '/s/' + kind + '/' + encodeURIComponent(id))}${extra || ''}</div>`;
  }
  const insertAfterBanner = (h, add) => { const i = h.indexOf('</section>'); return i >= 0 ? h.slice(0, i + 10) + add + h.slice(i + 10) : add + h; };
  const wrap = (k, fn) => { const o = V[k]; V[k] = (v) => fn(o(v), v); };
  wrap('comp', (h, v) => { const l = Lg(v.id); if (!l) return h; const up = matchesOf(l.id).filter((m) => m.status === 'scheduled' && dOf(m) > Date.now());
    return insertAfterBanner(h, shareBar('comp', l.id, `${l.name} (${l.sport}) — fixtures, results and table`, up.length ? `<button class="btn ghost sm" data-act="ics" data-id="comp:${esc(l.id)}">Fixtures to calendar</button>` : '')); });
  wrap('team', (h, v) => { const t = Tm(v.id); if (!t) return h; const up = S.matches.filter((m) => (m.home === t.id || m.away === t.id) && m.status === 'scheduled' && dOf(m) > Date.now());
    return insertAfterBanner(h, shareBar('team', t.id, `${t.name} on ALL — squad, fixtures and results`, up.length ? `<button class="btn ghost sm" data-act="ics" data-id="team:${esc(t.id)}">Fixtures to calendar</button>` : '')); });
  wrap('match', (h, v) => { const m = Mt(v.id), l = m && Lg(m.lid); if (!m || !l) return h;
    const t = m.name || `${nm(Tm(m.home))} ${m.status === 'scheduled' ? 'vs' : (+m.hs || 0) + '–' + (+m.as || 0)} ${nm(Tm(m.away))}`;
    return insertAfterBanner(h, shareBar('match', m.id, `${t} · ${l.name}${isLive(m) ? ' · LIVE now' : ''}`, m.status === 'scheduled' && dOf(m) ? `<button class="btn ghost sm" data-act="ics" data-id="match:${esc(m.id)}">Add to calendar</button>` : '')); });
  wrap('article', (h, v) => { const n = S.news.find((x) => x.id === v.id); if (!n || !n.pub) return h; return h.replace('</h1>', '</h1>' + shareBar('article', n.id, n.title)); });

  /* ---------- calendars (.ics) ---------- */
  const icsT = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const icsE = (s) => String(s || '').replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  function icsFile(name, evs) {
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ALL Africa Local Leagues//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    evs.forEach((e) => L.push('BEGIN:VEVENT', 'UID:' + e.uid + '@afrolocalsports.com', 'DTSTAMP:' + icsT(Date.now()), 'DTSTART:' + icsT(e.start), 'DTEND:' + icsT(+new Date(e.start) + 2 * 36e5),
      'SUMMARY:' + icsE(e.title), 'DESCRIPTION:' + icsE(e.desc), ...(e.where ? ['LOCATION:' + icsE(e.where)] : []), 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsE(e.title), 'END:VALARM', 'END:VEVENT'));
    L.push('END:VCALENDAR');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L.join('\r\n')], { type: 'text/calendar' }));
    a.download = name.replace(/[^\w-]+/g, '-').slice(0, 60) + '.ics'; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    toast(evs.length + ' fixture' + (evs.length > 1 ? 's' : '') + ' added. Open the file to save to your calendar.');
  }
  const mEv = (m) => { const l = Lg(m.lid); const t = m.name || nm(Tm(m.home)) + ' vs ' + nm(Tm(m.away)); return { uid: m.id, start: dOf(m), title: t, desc: (l ? l.name : '') + '\n' + ORIGIN + '/s/match/' + m.id, where: m.venue }; };
  A.ics = (id) => {
    const [k, x] = id.split(':'); let ms = [];
    if (k === 'match') ms = [Mt(x)]; else if (k === 'team') ms = S.matches.filter((m) => m.home === x || m.away === x); else ms = matchesOf(x);
    ms = ms.filter((m) => m && m.status === 'scheduled' && dOf(m) && dOf(m) > Date.now());
    if (!ms.length) return toast('No upcoming fixtures to add.');
    icsFile(k === 'match' ? mEv(ms[0]).title : ((Tm(x) || Lg(x) || {}).name || 'fixtures'), ms.map(mEv));
  };
  A['ics-pro'] = (id) => { const x = S.pro.find((p) => p.id === id); if (x) icsFile(x.home.name + ' vs ' + x.away.name, [{ uid: x.id.replace(/\W/g, '-'), start: x.date, title: `${x.home.name} vs ${x.away.name}`, desc: x.comp + (x.link ? '\n' + x.link : ''), where: x.venue }]); };

  /* ---------- home and live screens ---------- */
  wrap('home', (h) => {
    if (S.mode === 'loading') return h;
    const add = africaStrip() + newsStrip(5);
    const i = h.indexOf('</section>', h.indexOf('class="banner'));
    return i >= 0 ? h.slice(0, i + 10) + add + h.slice(i + 10) : add + h;
  });
  wrap('live', (h) => { const o = order(S.pro); if (!S.pro.length) return h;
    const add = `${sec('Across Africa', `<button class="btn sm ghost" ${goBtn('africa', '')}>All scores</button>`)}<div class="pgrid">${[...o.live, ...o.next.filter((x) => dayKey(x.date) <= dayKey(Date.now()) + 864e5)].slice(0, 12).map((x) => proCard(x, 1)).join('') || '<div class="empty">No professional games live right now.</div>'}</div>${sec('Our leagues')}`;
    return h.replace('</h1>', '</h1>' + add); });
  wrap('news', (h) => h.replace(/<h1>[^<]*<\/h1>/, (m) => m + newsStrip(9)));

  /* ---------- welcome: pick sports and country once, on the first visit ---------- */
  const TOP = ['Football', 'Basketball', 'Netball', 'Rugby Union', 'Cricket', 'Athletics', 'Volleyball', 'Boxing', 'Tennis', 'Swimming', 'Cycling', 'Futsal'];
  function welcome() {
    let seen = false; try { seen = !!localStorage.getItem('all_welcome'); } catch (e) { seen = true; }
    const p = S.prefs; if (seen || S.me || (p.sports || []).length || (p.leagues || []).length || (p.teams || []).length) return;
    const pick = new Set();
    sheet = { kind: 'html', title: 'Welcome to ALL', html: `<p class="sub">Live scores, fixtures, tables and news for every sport across Africa, from street leagues to the Champions League. Choose what you follow and we will put it first.</p>
      <h3 style="margin:14px 0 8px">Your sports</h3><div class="row wl">${TOP.map((s) => `<button class="btn ghost sm" type="button" data-act="wl-s" data-id="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join('')}</div>
      <label class="f" style="margin-top:14px">Your country<select id="wl-c"><option value="">All of Africa</option>${COUNTRIES.map(([n]) => `<option ${n === 'Zimbabwe' ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
      <div class="row" style="margin-top:16px"><button class="btn blue" data-act="wl-go">Show me my sports</button><button class="btn ghost" data-act="wl-skip">Skip</button></div>` };
    A['wl-s'] = (id, el) => { pick.has(id) ? pick.delete(id) : pick.add(id); el.setAttribute('aria-pressed', pick.has(id)); };
    A['wl-go'] = () => { const c = (document.getElementById('wl-c') || {}).value;
      S.prefs = { ...S.prefs, sports: [...new Set([...(S.prefs.sports || []), ...pick])], countries: c ? [...new Set([...(S.prefs.countries || []), c])] : S.prefs.countries || [] };
      done(); savePrefs(); toast('Saved. Find them any time under Favourites.'); };
    A['wl-skip'] = () => done();
    const done = () => { try { localStorage.setItem('all_welcome', '1'); } catch (e) {} closeSheet(); render(); };
    renderSheet();
  }

  /* ---------- install as an app ---------- */
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (S.view.page === 'profile') render(); });
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  wrap('profile', (h) => {
    if (standalone()) return h;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (!installEvt && !ios) return h;
    return `<div class="note install"><b>Get ALL on your phone.</b> ${installEvt ? 'Install it like an app: it opens full screen from your home screen.' : 'In Safari, tap Share, then <b>Add to Home Screen</b>.'}${installEvt ? '<div class="row"><button class="btn" data-act="install">Install the app</button></div>' : ''}</div>` + h;
  });
  A.install = async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; render(); };
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});

  /* ---------- finishing touches after each screen is drawn ---------- */
  function decorate() {
    document.querySelectorAll('#main .tile[data-p="sport"]:not(.ph)').forEach((t) => {
      const n = t.dataset.id, f = PHOTO[n]; if (!f) return;
      t.classList.add('ph'); t.style.backgroundImage = `linear-gradient(180deg,rgba(6,10,24,.15),rgba(6,10,24,.92)),url(/img/${f}.jpg)`;
    });
    document.body.classList.toggle('wide', innerWidth >= 1000);
  }
  addEventListener('resize', () => document.body.classList.toggle('wide', innerWidth >= 1000));
  render();
})();
