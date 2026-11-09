// Builds every demo into ../demos/<id>.html plus a gallery at ../demos/index.html
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = __dirname, OUT = path.join(__dirname, '..', 'demos');
const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');
const css = read('engine.css'), engine = read('engine.js'), icons = read('icons.js');
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(icons, ctx);
const ICONS = ctx.window.ICONS;
const groups = fs.readdirSync(path.join(SRC, 'configs')).filter((f) => f.endsWith('.js')).sort();
const all = [];
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const logo = (s, size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="g-${s.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${s.color}"/><stop offset="1" stop-color="${s.color2}"/></linearGradient></defs><rect width="40" height="40" rx="11" fill="url(#g-${s.id})"/><path d="M0 28 Q20 18 40 26 V40 H0Z" fill="#fff" opacity=".1"/><g transform="translate(8 8)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[s.icon]}"/></g></svg>`;
const FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">';

for (const g of groups) {
  const src = read('configs/' + g);
  const c2 = { window: { __SYS: [] } }; vm.createContext(c2); vm.runInContext(src, c2);
  for (const s of c2.window.__SYS) {
    if (!ICONS[s.icon]) throw new Error('missing icon ' + s.icon + ' in ' + s.id);
    all.push({ id: s.id, name: s.name, tag: s.tag, group: s.group, color: s.color, color2: s.color2, icon: s.icon, blurb: s.blurb, roles: s.roles.length, mods: Object.keys(s.tables).length, file: g });
    const fav = 'data:image/svg+xml,' + encodeURIComponent(logo(s, 64));
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(s.name)} · ${esc(s.tag)} | Live demo by Nexora Digital</title>
<meta name="description" content="${esc(s.blurb)} Try the live demo of ${esc(s.name)}, built by Nexora Digital in Zimbabwe.">
<meta name="theme-color" content="${s.color}">
<link rel="icon" href="${fav}">
${FONT}
<style>${css}</style>
</head>
<body>
<div id="app"><p style="padding:40px;font-family:system-ui">Loading ${esc(s.name)} demo…</p></div>
<noscript><p style="padding:20px">This demo needs JavaScript switched on.</p></noscript>
<script>window.SYS_ID=${JSON.stringify(s.id)};window.__SYS=[];</script>
<script>${icons}</script>
<script>${src}</script>
<script>${engine}</script>
</body>
</html>
`;
    fs.writeFileSync(path.join(OUT, s.id + '.html'), html);
  }
}

// gallery
const ORDER = ['Departments in any business', 'Education & community', 'Shops, food & hospitality', 'Health & care', 'Money & finance', 'Property, farming & transport', 'Trades, industry & services'];
const byGroup = ORDER.map((g) => [g, all.filter((s) => s.group === g)]).filter(([, l]) => l.length);
const stray = all.filter((s) => !ORDER.includes(s.group));
if (stray.length) throw new Error('unknown group: ' + stray.map((s) => s.id + ':' + s.group).join(', '));
fs.writeFileSync(path.join(OUT, 'catalogue.json'), JSON.stringify(byGroup.map(([g, l]) => ({ group: g, systems: l.map(({ file, ...x }) => x) })), null, 1));
const card = (s) => `<a class="sc" href="${s.id}.html" style="--c:${s.color};--c2:${s.color2}">${logo(s, 46)}<span class="st"><b>${esc(s.name)}</b><em>${esc(s.tag)}</em></span><span class="sb">${esc(s.blurb)}</span><span class="sm">${s.roles} roles · ${s.mods} modules<span class="go">Open demo →</span></span></a>`;
const gallery = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>System demos | Nexora Digital</title>
<meta name="description" content="Try ${all.length} live business system demos by Nexora Digital: school, shop, clinic, payroll, rentals, loans, fleet, CRM and more, built for Zimbabwe.">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
${FONT}
<style>
:root{--bg:#f6f4ef;--surface:#fff;--ink:#16140f;--muted:#5f5a50;--line:#e6e1d6;--accent:#16140f;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#121110;--surface:#1b1a18;--ink:#efece6;--muted:#aaa397;--line:#2e2b27;--accent:#efece6;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 "Plus Jakarta Sans",system-ui,sans-serif}
.wrap{max-width:1200px;margin:0 auto;padding:0 max(16px,env(safe-area-inset-left,0px))}
header.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 0;flex-wrap:wrap}
header.top a{color:var(--ink);text-decoration:none;font-weight:700}
.back{font-size:14px;opacity:.8}
.hero{padding:30px 0 10px;display:grid;gap:14px;max-width:760px}
.hero h1{margin:0;font-size:clamp(30px,5vw,50px);line-height:1.05;letter-spacing:-.03em;font-weight:800;text-wrap:balance}
.hero p{margin:0;color:var(--muted);font-size:17px;max-width:62ch}
.pills{display:flex;gap:8px;flex-wrap:wrap}
.pills span{font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;background:var(--surface);border:1px solid var(--line)}
nav.jump{display:flex;gap:8px;overflow-x:auto;padding:18px 0 4px;scrollbar-width:none;position:sticky;top:0;background:var(--bg);z-index:5}
nav.jump a{flex:none;font-size:13.5px;font-weight:700;color:var(--ink);text-decoration:none;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface)}
section.g{padding:26px 0 6px}
section.g h2{font-size:22px;margin:0 0 14px;letter-spacing:-.02em}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,270px),1fr));gap:14px}
.sc{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr auto;gap:12px 14px;padding:18px;border-radius:18px;background:var(--surface);border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:transform .15s,border-color .15s,box-shadow .15s;position:relative;overflow:hidden}
.sc::before{content:"";position:absolute;inset:0 0 auto 0;height:4px;background:linear-gradient(90deg,var(--c),var(--c2))}
.sc:hover{transform:translateY(-2px);border-color:var(--c);box-shadow:0 14px 30px -16px rgba(0,0,0,.35)}
.sc svg{border-radius:12px}
.st{display:grid;align-content:center}.st b{font-size:17px;font-weight:800;letter-spacing:-.01em}.st em{font-style:normal;color:var(--muted);font-size:13px;font-weight:600}
.sb{grid-column:1/-1;color:var(--muted);font-size:14px}
.sm{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);font-weight:600;padding-top:10px;border-top:1px solid var(--line)}
.go{color:var(--ink);font-weight:800}
.cta{margin:40px 0 60px;padding:28px;border-radius:22px;background:#16140f;color:#f6f4ef;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}
.cta h2{margin:0 0 6px;font-size:24px}.cta p{margin:0;opacity:.8;max-width:60ch}
.cta a{background:#f6c445;color:#16140f;font-weight:800;text-decoration:none;padding:13px 20px;border-radius:12px;white-space:nowrap}
footer{padding:0 0 30px;color:var(--muted);font-size:13px}
</style>
</head>
<body>
<div class="wrap">
<header class="top"><a href="../index.html">Nexora Digital</a><a class="back" href="../systems.html">← Business systems</a></header>
<section class="hero">
<h1>Try ${all.length} business systems before you buy</h1>
<p>Every demo is a working system with real screens: sign in as the owner, the manager or the front desk, add records, print receipts and pull reports. We set the one you pick up for your business, with your name, logo, prices and staff.</p>
<div class="pills"><span>Works on phone and computer</span><span>Role-based logins</span><span>Reports, CSV and PDF</span><span>EcoCash, cash and bank</span></div>
</section>
<nav class="jump" aria-label="Jump to a category">${byGroup.map(([g]) => `<a href="#${g.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(g)}</a>`).join('')}</nav>
${byGroup.map(([g, l]) => `<section class="g" id="${g.toLowerCase().replace(/[^a-z]+/g, '-')}"><h2>${esc(g)}</h2><div class="grid">${l.map(card).join('')}</div></section>`).join('\n')}
<section class="cta"><div><h2>Don't see your business here?</h2><p>We build custom systems too. Tell us how your team works today, on paper, in Excel or on WhatsApp, and we'll turn it into a system.</p></div><a href="../contact.html?plan=Business%20system%20quote">Get a system quote</a></section>
<footer>Demos run on sample data in your browser. Nothing you type is sent anywhere. © Nexora Digital, Harare.</footer>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), gallery);
console.log('built', all.length, 'demos:', all.map((s) => s.id).join(' '));

// Systems page catalogue (between <!--DEMOS--> markers)
const sysPath = path.join(__dirname, '..', 'systems.html');
let sys = fs.readFileSync(sysPath, 'utf8');
const mini = (s) => `<a class="demo-card" href="demos/${s.id}.html">${logo(s, 42)}<span><b>${esc(s.name)}</b><em>${esc(s.tag)}</em></span><span class="demo-go" aria-hidden="true">→</span></a>`;
const block = `<!--DEMOS-->
<section id="demos" class="tight">
  <div class="wrap">
    <div class="head"><h2>Try a live demo: ${all.length} ready-made systems</h2><p>Every one is a working system you can click through now. Sign in as the owner, a manager or the front desk, add records and print reports. We set up the one you choose with your name, logo, prices and staff.</p></div>
    ${byGroup.map(([g, l]) => `<h3 class="demo-group">${esc(g)}</h3>\n    <div class="demo-grid">${l.map(mini).join('')}</div>`).join('\n    ')}
    <p class="demo-more"><a class="btn btn-main" href="demos/">Open the demo gallery</a> <a class="btn btn-ghost" href="contact.html?plan=Business%20system%20quote">Need something different? Ask for a quote</a></p>
  </div>
</section>
<!--/DEMOS-->`;
sys = sys.replace(/<!--DEMOS-->[\s\S]*?<!--\/DEMOS-->/, block);
fs.writeFileSync(sysPath, sys);
console.log('systems.html catalogue updated');
