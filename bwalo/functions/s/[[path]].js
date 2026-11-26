// Share links: /s/<kind>/<id>. Gives WhatsApp, Facebook and X a proper preview card, then opens the page in the app.
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KINDS = { match: 'matches', comp: 'leagues', team: 'teams', article: 'news' };
const PHOTO = { Football: 'football', Futsal: 'street', Basketball: 'basketball', Athletics: 'athletics', Cycling: 'cycling', Swimming: 'swimming', Cricket: 'cricket', Tennis: 'tennis', 'Table Tennis': 'tennis', Volleyball: 'volleyball', 'Beach Volleyball': 'volleyball' };

async function doc(env, col, id) {
  if (!id || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return null;
  const r = await env.DB.prepare('SELECT data FROM docs WHERE col=? AND id=? AND deleted=0').bind(col, id).first();
  return r ? JSON.parse(r.data) : null;
}

export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url), [kind, id] = [].concat(params.path || []);
  const target = KINDS[kind] ? `/#/${kind}/${encodeURIComponent(id || '')}` : '/';
  let title = 'ALL · Africa Local Leagues', desc = 'Live scores, fixtures, tables and news for every sport across Africa.', img = '/img/hero.jpg';
  try {
    const d = KINDS[kind] ? await doc(env, KINDS[kind], id) : null;
    if (d) {
      const l = kind === 'comp' ? d : await doc(env, 'leagues', d.lid);
      const sport = (l && l.sport) || '';
      img = '/img/' + (PHOTO[sport] || 'hero') + '.jpg';
      if (kind === 'match') {
        const [h, a] = await Promise.all([doc(env, 'teams', d.home), doc(env, 'teams', d.away)]);
        const hn = (h && h.name) || d.name || 'Match', an = (a && a.name) || '';
        const score = d.status === 'scheduled' || d.hs == null ? 'vs' : `${d.hs} – ${d.as}`;
        title = an ? `${hn} ${score} ${an}` : hn;
        const when = d.date ? new Date(d.date).toUTCString().slice(0, 22) : '';
        desc = [l && l.name, d.status === 'live' ? 'LIVE now' : d.status === 'final' ? 'Full time' : when, d.venue].filter(Boolean).join(' · ');
      } else if (kind === 'comp') {
        title = d.name || title; desc = [d.sport, d.country, d.season].filter(Boolean).join(' · ') + ' — fixtures, results and table on ALL.';
      } else if (kind === 'team') {
        title = d.name || title; desc = [l && l.name, d.ground].filter(Boolean).join(' · ') + ' — squad, fixtures and results on ALL.';
      } else if (kind === 'article') {
        if (!d.pub) throw 0;
        title = d.title || title; desc = String(d.body || '').replace(/\s+/g, ' ').slice(0, 180) || (l && l.name) || desc;
      }
    }
  } catch (e) {}
  const abs = new URL(img, url).href;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ALL · Africa Local Leagues">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(abs)}"><meta property="og:url" content="${esc(url.href)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${esc(target)}"><link rel="canonical" href="${esc(new URL(target, url).href)}">
</head><body style="background:#060a18;color:#fff;font-family:system-ui;padding:24px"><p>Opening <a style="color:#f5b833" href="${esc(target)}">${esc(title)}</a> on ALL…</p>
<script>location.replace(${JSON.stringify(target)})</script></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
}
