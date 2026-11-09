/* Nexora Digital: AI chat assistant + voice receptionist ("Nora") */
(()=>{
/* ================= styles ================= */
const css = `
.nx-launch{position:fixed;z-index:31;left:20px;bottom:20px;display:inline-flex;align-items:center;gap:10px;background:#1D2B3A;color:#fff;border:0;border-radius:999px;padding:9px 18px 9px 9px;font:700 15px "Figtree",system-ui,sans-serif;cursor:pointer;box-shadow:0 12px 26px -10px rgba(0,0,0,.5)}
.nx-launch .orb{width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#B6EE3A,#1E9BE9 60%,#1584CC);display:grid;place-items:center;flex:none}
.nx-launch .orb svg{width:19px;height:19px;color:#fff}
.nx-launch[aria-expanded="true"]{display:none}
@media (max-width:560px){.nx-launch .long{display:none}}
.nx{position:fixed;z-index:32;left:20px;bottom:20px;width:min(400px,calc(100vw - 40px));height:min(620px,calc(100dvh - 110px));background:#fff;color:#1D2B3A;border:1px solid #E2E8EF;border-radius:22px;box-shadow:0 24px 60px -18px rgba(29,43,58,.45);display:flex;flex-direction:column;overflow:hidden;font:400 15px/1.5 "Figtree",system-ui,sans-serif}
.nx[hidden]{display:none!important}
@media (max-width:560px){.nx{left:0;right:0;bottom:0;width:100%;height:min(88dvh,640px);border-radius:22px 22px 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}}
.nx-head{background:#1D2B3A;color:#fff;padding:14px 12px 14px 16px;display:flex;align-items:center;gap:11px}
.nx-head .orb{width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#B6EE3A,#1E9BE9 60%,#1584CC);flex:none;position:relative}
.nx-head .orb.live::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:2px solid #B6EE3A;animation:nxPulse 1.2s ease-out infinite}
@keyframes nxPulse{from{transform:scale(.9);opacity:1}to{transform:scale(1.35);opacity:0}}
.nx-head .who{flex:1;min-width:0}
.nx-head .who b{display:block;font:800 18px/1.1 "Bricolage Grotesque",sans-serif}
.nx-head .who span{font-size:12px;color:#B6EE3A;font-weight:600}
.nx-ic{background:none;border:1px solid #ffffff33;color:#fff;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;cursor:pointer;flex:none}
.nx-ic svg{width:17px;height:17px}
.nx-ic[aria-pressed="false"] .on,.nx-ic[aria-pressed="true"] .off{display:none}
.nx-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px;background:#F5F8FA;border-bottom:1px solid #E2E8EF}
.nx-tabs button{background:none;border:0;padding:8px;border-radius:999px;font:700 13px "Figtree",sans-serif;color:#55657A;cursor:pointer}
.nx-tabs button[aria-selected="true"]{background:#fff;color:#1D2B3A;box-shadow:0 1px 4px rgba(29,43,58,.12)}
.nx-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain;background:#F5F8FA}
.nx-m{max-width:86%;padding:10px 13px;border-radius:16px;word-wrap:break-word}
.nx-m.bot{background:#fff;border:1px solid #E2E8EF;align-self:flex-start;border-bottom-left-radius:5px}
.nx-m.me{background:#1E9BE9;color:#fff;align-self:flex-end;border-bottom-right-radius:5px}
.nx-m ul{margin:6px 0 0;padding-left:18px}
.nx-m a{color:#1584CC;font-weight:700}
.nx-m .wa{display:inline-flex;margin-top:8px;background:#1FAF5A;color:#fff;text-decoration:none;padding:8px 14px;border-radius:999px;font-weight:700}
.nx-m pre{white-space:pre-wrap;font:12px/1.5 ui-monospace,Menlo,monospace;background:#F5F8FA;border:1px dashed #E2E8EF;border-radius:10px;padding:8px;margin:8px 0 0}
.nx-typing{display:inline-flex;gap:4px}.nx-typing i{width:6px;height:6px;border-radius:50%;background:#55657A;animation:nxDot 1s infinite}
.nx-typing i:nth-child(2){animation-delay:.15s}.nx-typing i:nth-child(3){animation-delay:.3s}
@keyframes nxDot{0%,60%,100%{opacity:.25}30%{opacity:1}}
.nx-chips{display:flex;gap:6px;flex-wrap:wrap;padding:8px 14px 10px;background:#F5F8FA}
.nx-chips button{background:#EDFBD0;border:1px solid #D7EFA6;color:#1D2B3A;font:600 13px "Figtree",sans-serif;padding:6px 11px;border-radius:999px;cursor:pointer}
.nx-in{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #E2E8EF;background:#fff;align-items:center}
.nx-in input{flex:1;min-width:0;font:16px "Figtree",sans-serif;background:#F5F8FA;color:#1D2B3A;border:1px solid #E2E8EF;padding:10px 14px;border-radius:999px}
.nx-btn{width:42px;height:42px;border-radius:50%;border:0;display:grid;place-items:center;cursor:pointer;flex:none;background:#1E9BE9;color:#fff}
.nx-btn.mic{background:#1D2B3A}.nx-btn.mic.rec{background:#D93025}
.nx-btn svg{width:18px;height:18px}
.nx-voice{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:22px;text-align:center;background:#F5F8FA}
.nx-voice[hidden]{display:none}
.nx-vorb{width:150px;height:150px;border-radius:50%;border:0;cursor:pointer;background:radial-gradient(circle at 35% 30%,#B6EE3A,#1E9BE9 60%,#1584CC);box-shadow:0 14px 40px -8px #1E9BE988;display:grid;place-items:center;color:#fff;position:relative}
.nx-vorb svg{width:46px;height:46px}
.nx-vorb.listening{animation:nxBreath 1.4s ease-in-out infinite}
.nx-vorb.speaking::before,.nx-vorb.listening::before{content:"";position:absolute;inset:-10px;border-radius:50%;border:3px solid #1E9BE9;animation:nxPulse 1.3s ease-out infinite}
.nx-vorb.thinking{opacity:.75}
@keyframes nxBreath{50%{transform:scale(1.06)}}
.nx-vstate{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#1584CC}
.nx-vsaid{color:#55657A;min-height:2.9em;max-width:32ch}
.nx-vreply{font-size:17px;font-weight:600;max-width:34ch}
.nx-vnote{font-size:13px;color:#55657A;max-width:34ch}
.nx-vend{background:#fff;border:2px solid #1D2B3A;color:#1D2B3A;font:700 14px "Figtree",sans-serif;padding:8px 18px;border-radius:999px;cursor:pointer}
.nx-foot{font-size:11px;color:#55657A;text-align:center;padding:6px 10px 8px;background:#fff}
@media (prefers-reduced-motion:reduce){.nx-vorb,.nx-vorb::before,.nx-head .orb::after{animation:none!important}}`;
const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

const MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/></svg>';
const wrap=document.createElement("div");
wrap.innerHTML=`
<button class="nx-launch" id="nxLaunch" type="button" aria-expanded="false" aria-controls="nxPanel"><span class="orb">${MIC}</span><span>Ask Nora<span class="long"> · chat or talk</span></span></button>
<div class="nx" id="nxPanel" hidden role="dialog" aria-label="Nexora assistant">
  <div class="nx-head">
    <div class="orb" id="nxOrb"></div>
    <div class="who"><b>Nora · Nexora</b><span>Virtual receptionist · online now</span></div>
    <button class="nx-ic" id="nxSpeak" type="button" aria-pressed="false" aria-label="Read replies aloud" title="Read replies aloud">
      <svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
      <svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/></svg>
    </button>
    <button class="nx-ic" id="nxClose" type="button" aria-label="Close assistant"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  </div>
  <div class="nx-tabs" role="tablist"><button type="button" role="tab" id="nxTabChat" aria-selected="true">Chat</button><button type="button" role="tab" id="nxTabVoice" aria-selected="false">Voice receptionist</button></div>
  <div id="nxChat" style="flex:1;display:flex;flex-direction:column;min-height:0">
    <div class="nx-log" id="nxLog" aria-live="polite"></div>
    <div class="nx-chips" id="nxChips"></div>
    <form class="nx-in" id="nxForm">
      <input id="nxText" placeholder="Ask about websites, hosting, prices…" autocomplete="off" aria-label="Your message">
      <button class="nx-btn mic" id="nxMic" type="button" aria-label="Speak your message">${MIC}</button>
      <button class="nx-btn" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form>
  </div>
  <div class="nx-voice" id="nxVoice" hidden>
    <div class="nx-vstate" id="nxVState">Tap to talk</div>
    <button class="nx-vorb" id="nxVOrb" type="button" aria-label="Start talking to the receptionist">${MIC}</button>
    <div class="nx-vsaid" id="nxVSaid">Ask about websites, hosting or domains, or get your free sample started. Speak naturally, I'll answer out loud.</div>
    <div class="nx-vreply" id="nxVReply"></div>
    <div class="nx-vnote" id="nxVNote" hidden></div>
    <button class="nx-vend" id="nxVEnd" type="button" hidden>End call</button>
  </div>
  <div class="nx-foot">Virtual assistant · a real person replies to every enquiry</div>
</div>`;
document.body.appendChild(wrap);

/* ================= knowledge ================= */
const WA_NUM="61433427505";
const BIZ={name:"Nexora Digital",whatsapp:"+61 433 427 505",email:"lorensomumba@gmail.com",currency:"USD",
  parent:"A SENATOR INVST company, led by Lawrence Mumba",
  sample:"Every client gets a free sample website first and only pays when happy.",
  timing:"Most samples are ready within a few days. Starter sites go live in about 5 days, Business about 10 days, Pro about 2 weeks.",
  noLogo:"No logo or good photos is fine: phone photos work, and we can help make a simple logo.",
  stopHosting:"If hosting stops, the site goes offline, but we keep a copy and can bring it back.",
  domains:"We register .co.zw, .org.zw, .ac.zw, .com, .org, .net and .africa domains in your business name. Domains are priced at cost and quoted on WhatsApp with today's yearly price. You can also keep a domain you already own.",
  email:"Business email like sales@yourbusiness.co.zw comes with Standard (5 addresses) and Managed (15 addresses) hosting, forwarded to your existing inbox.",
  zim:"Pricing in USD, pages light on Econet and NetOne data, help on WhatsApp, .co.zw domains.",
  custom:"Online shops, booking systems and school portals are quoted individually before any work starts.",
  systems:"Beyond websites, Nexora builds complete business systems for schools, shops, clinics, hospitals, lodges, lenders, farms, fleets, transport and money services. Every system includes logins for every role, one live database, reports with PDF and Excel export, alerts, and works on phones. Systems are quoted individually, and there are 36 live demos to try on the Systems page.",
};
const WEB=[
  {name:"Starter",price:80,pts:["One-page website","WhatsApp and call buttons","Contact details and Google Map","1 round of changes","Ready in about 5 days"]},
  {name:"Business",price:180,pts:["Up to 5 pages","Photo gallery","Contact form to WhatsApp or email","Set up to show on Google","2 rounds of changes","Ready in about 10 days"],pop:true},
  {name:"Pro",price:300,pts:["Up to 10 pages","Product catalogue or booking page","News or blog section","Google Business Profile setup","3 rounds of changes","Ready in about 2 weeks"]},
];
const HOST=[
  {name:"Basic",price:7,pts:["1 website","Secure HTTPS","Weekly backups","WhatsApp help"]},
  {name:"Standard",price:15,pts:["5 business email addresses","Up to 3 updates a month","Daily backups"],pop:true},
  {name:"Managed",price:30,pts:["15 business email addresses","Up to 10 updates a month","Priority WhatsApp help","Monthly visitor report"]},
];
const MOVE={price:40,pts:["We check your site and say what needs fixing","Moved without breaking your email","Tested before switching over"]};
const PARTNER={web:"30% of every website sold",host:"20% of hosting every month while the client stays",terms:"Paid once the client pays. No upfront cost and no targets."};

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const waLink=t=>`https://wa.me/${WA_NUM}?text=${encodeURIComponent(t)}`;
const has=(t,...w)=>w.some(x=>t.includes(x));
const DEFAULT_CHIPS=["Website prices","Hosting plans","Business systems","Get my free sample","Talk to a person"];

function listReply(intro,items,unit,say){
  return {html:`${intro}<ul>${items.map(p=>`<li><b>${p.name}</b> · $${p.price}${unit}${p.pop?" (most popular)":""}: ${p.pts.slice(0,3).join(", ").toLowerCase()}</li>`).join("")}</ul>`,say};
}

/* ================= free-sample enquiry flow ================= */
let lead=null;
const STEPS=[
  {k:"biz",q:"What's the name of your business?"},
  {k:"what",q:"What does the business do or sell?"},
  {k:"town",q:"Which town or city are you in?"},
  {k:"plan",q:"Which package interests you: Starter at 80 dollars, Business at 180, Pro at 300, or not sure yet?"},
  {k:"name",q:"Great. What's your name?"},
  {k:"phone",q:"And your WhatsApp number, so we can send your sample?"},
];
function startLead(pre){
  lead={step:0,data:{}};
  if(pre){ lead.data.plan=pre; }
  const q=STEPS[0].q;
  return {html:`Lovely, let's get your free sample started. I'll take a few details for the team.<br><br>${q}`,say:"Lovely, let's get your free sample started. "+q,chips:["Cancel"]};
}
function nextStep(){ while(lead.step<STEPS.length && lead.data[STEPS[lead.step].k]) lead.step++; }
function leadStep(t,raw){
  if(has(t,"cancel","never mind","nevermind"," stop ")){ lead=null; return {html:"No problem, cancelled. Anything else I can help with?",say:"No problem, cancelled. Anything else I can help with?",chips:DEFAULT_CHIPS}; }
  lead.data[STEPS[lead.step].k]=raw.trim(); lead.step++; nextStep();
  if(lead.step<STEPS.length){ const q=STEPS[lead.step].q; const chips=STEPS[lead.step].k==="plan"?["Starter","Business","Pro","Not sure yet"]:["Cancel"]; return {html:esc(q),say:q,chips}; }
  const d=lead.data; lead=null;
  const msg=["Hi Nexora, I'd like a free sample website (via the website assistant).","","Name: "+d.name,"WhatsApp: "+d.phone,"Business: "+d.biz,"What we do: "+d.what,"Town: "+d.town,"Package: "+d.plan].join("\n");
  try{ const f=n=>document.getElementById(n); if(f("f-name")) f("f-name").value=d.name; if(f("f-biz")) f("f-biz").value=d.biz; if(f("f-msg")&&!f("f-msg").value) f("f-msg").value=d.what+", "+d.town; }catch(_){}
  return {html:`Thanks ${esc(d.name)}! Here's your request. Tap to send it on WhatsApp and the team will start your free sample.<pre>${esc(msg)}</pre><a class="wa" href="${waLink(msg)}" target="_blank" rel="noopener">Send on WhatsApp</a>`,
    say:`Thanks ${d.name}. Your request is ready. Tap send on WhatsApp and the team will start your free sample.`,chips:["Hosting plans","Domains"]};
}

/* ================= rule brain ================= */
function ruleReply(raw){
  const t=" "+raw.toLowerCase().replace(/[^a-z0-9$ ]/g," ")+" ";
  if(lead) return leadStep(t,raw);
  if(has(t,"free sample","sample","get started","start my","sign up","i want a website","need a website","quote","order")){
    const pre=has(t,"starter")?"Starter":has(t,"business")?"Business":has(t," pro ")?"Pro":null; return startLead(pre); }
  if(has(t," hi "," hello"," hey","good morning","good afternoon","good evening","mhoro","makadii","salibonani")&&t.trim().split(" ").length<5)
    return {html:"Hi! I'm Nora, Nexora's virtual receptionist. I can explain our websites, hosting and domains, or get your free sample started. What does your business do?",say:"Hi! I'm Nora, Nexora's virtual receptionist. I can explain our websites, hosting and domains, or get your free sample started. What does your business do?",chips:DEFAULT_CHIPS};
  if(has(t,"person","human","lawrence","someone","real person","manager","call you","phone number","contact"))
    return {html:`Of course. Message the team on <a href="https://wa.me/${WA_NUM}" target="_blank" rel="noopener">WhatsApp (${BIZ.whatsapp})</a> or email ${BIZ.email}. You'll get a real reply.`,say:"Of course. Message the team on WhatsApp, the button is right on the page, or email us. You'll get a real reply."};
  if(has(t,"become a partner")) return {html:`<a class="wa" href="${waLink("Hi Nexora, I'd like to become a sales partner")}" target="_blank" rel="noopener">Message us to join</a>`,say:"Tap the button to message the team and join."};
  if(has(t,"partner","sell with","commission","earn","sales agent","agent","refer"))
    return {html:`Sales partners earn <b>${PARTNER.web}</b> and <b>${PARTNER.host}</b>. ${PARTNER.terms} <a href="partners.html">See how it works</a>.`,say:`Sales partners earn 30 percent of every website sold, and 20 percent of hosting every month while the client stays. ${PARTNER.terms}`,chips:["Become a partner","Website prices"]};
  if(has(t,"move","transfer","already have a website","existing website","take over","wordpress","wix","old website"))
    return {html:`Yes, we can take over your existing site. Moving it starts from <b>$${MOVE.price}</b> once: ${MOVE.pts.join(", ").toLowerCase()}. Then any hosting plan from $7 a month. <a href="websites.html#move">Details</a>`,say:`Yes, we can take over your existing website. Moving it starts from ${MOVE.price} dollars once, and we make sure your email keeps working. Then hosting starts from 7 dollars a month.`};
  if(has(t,"system","hospital","clinic","school","inventory","stock","pos","payroll","hr ","fleet","lodge","farm","bureau","demo"))
    return {html:`${BIZ.systems} <a href="systems.html">Try the demos</a><br><a class="wa" href="${waLink("Hi Nexora, I'd like a quote for a business system")}" target="_blank" rel="noopener">Ask for a quote</a>`,say:BIZ.systems.replace("36","thirty six")+" Tap the button to ask for a quote.",chips:["Website prices","Talk to a person"]};
  if(has(t,"shop","ecommerce","e commerce","booking","portal"," app ","custom"))
    return {html:`${BIZ.custom} <a class="wa" href="${waLink("Hi Nexora, I'd like a quote for a custom website or system")}" target="_blank" rel="noopener">Ask for a quote</a>`,say:BIZ.custom+" Tap the button to ask for a quote."};
  if(has(t,"domain",".co.zw","co zw",".com"," com ","web address","name for my"))
    return {html:BIZ.domains+` <a href="domains.html">Check a domain</a>`,say:BIZ.domains};
  if(has(t,"email","gmail","mailbox"))
    return {html:BIZ.email,say:BIZ.email};
  if(has(t,"hosting","host","monthly","per month","a month","online","server","backup"))
    return {...listReply("Hosting keeps your site online. Plans, paid monthly in USD:",HOST,"/month","Hosting keeps your site online. Basic is 7 dollars a month, Standard 15 dollars with business email and updates, and Managed 30 dollars where we look after everything."),chips:["Get my free sample","Domains"]};
  if(has(t,"starter","business package","pro package","package","website price","website cost","how much","price","cost","cheap","afford","website"))
    return {...listReply("Website packages, paid once in USD. Every one starts with a free sample:",WEB,"",'Websites are paid once. Starter is 80 dollars for a one page site, Business is 180 for up to 5 pages with a gallery, and Pro is 300 for bigger businesses. Every one starts with a free sample. Hosting is extra, from 7 dollars a month.'),chips:["Get my free sample","Hosting plans","Which is right for me?"]};
  if(has(t,"which","right for me","recommend","choose","best"))
    return {html:"Quick guide: <b>Starter</b> if you just need to be found and contacted, <b>Business</b> if you want to show your work with photos and a few pages, <b>Pro</b> if you have products, bookings or news. Tell me what your business does and I'll suggest one.",say:"Starter if you just need to be found and contacted. Business if you want to show your work with photos and a few pages. Pro if you have products, bookings or news. Tell me what your business does and I'll suggest one."};
  if(has(t,"how long","when","days","weeks","fast","quick","ready"))
    return {html:BIZ.timing,say:BIZ.timing};
  if(has(t,"logo","photos","pictures","design"))
    return {html:BIZ.noLogo,say:BIZ.noLogo};
  if(has(t,"pay","payment","ecocash","usd","dollar","zig","bond","deposit"))
    return {html:`Prices are in ${BIZ.currency}. ${BIZ.sample} Payment options are agreed with you on WhatsApp.`,say:`Prices are in US dollars. ${BIZ.sample} Payment options are agreed with you on WhatsApp.`};
  if(has(t,"stop paying","cancel hosting","offline"))
    return {html:BIZ.stopHosting,say:BIZ.stopHosting};
  if(has(t,"google","seo","found","maps"))
    return {html:"Business and Pro sites are set up so Google can find them, and we link them to your Google Maps listing. Pro also includes Google Business Profile setup.",say:"Business and Pro sites are set up so Google can find them and linked to Google Maps. Pro also includes Google Business Profile setup."};
  if(has(t," who ","about","nexora","work","portfolio","example"))
    return {html:`Nexora Digital builds websites and apps for Zimbabwe businesses. ${BIZ.parent}. Our work includes 3rd World Lens, RWENDO bus booking and GUSTA food delivery. <a href="about.html#work">See our work</a>`,say:"Nexora Digital builds websites and apps for Zimbabwe businesses, led by Lawrence Mumba. Our work includes 3rd World Lens, RWENDO bus booking and GUSTA food delivery."};
  if(has(t,"thank","thanks","bye","ndatenda","siyabonga"))
    return {html:"You're welcome! Let's get your business online. 🚀",say:"You're welcome! Let's get your business online."};
  return {html:`I'm not sure about that one, but the team can help on <a href="https://wa.me/${WA_NUM}" target="_blank" rel="noopener">WhatsApp</a>. You can also ask me about websites, hosting, domains or your free sample.`,say:"I'm not sure about that one, but the team can help on WhatsApp. You can also ask me about websites, hosting, domains or your free sample.",chips:DEFAULT_CHIPS};
}

/* ================= AI brain (Claude, when the viewer allows it) ================= */
let sample=null, aiOff=false;
try{ window.claude && claude.use("sample").then(s=>{sample=s;}).catch(()=>{}); }catch(_){}
const SYS=`You are Nora, the friendly virtual receptionist for Nexora Digital, which builds, hosts and looks after websites, and builds business systems, for businesses in Zimbabwe. Prices are USD.
Facts (the ONLY facts you may use): ${JSON.stringify({business:BIZ,websites:WEB,hosting:HOST,moveExistingSite:MOVE,salesPartners:PARTNER})}
Rules: reply in 1-3 short sentences, warm, simple English (clients may use mobile data and be new to websites), plain text with no markdown. Never invent prices, timelines or features not in the facts. Domain prices are quoted on WhatsApp. To start, suggest they say "get my free sample". If asked something unrelated to Nexora, gently steer back.`;
const history=[];
async function think(raw){
  if(lead||/\b(sample|quote|sign up|get started)\b/i.test(raw)||!sample||aiOff){ const r=ruleReply(raw); history.push({role:"user",content:raw},{role:"assistant",content:r.say}); return r; }
  try{
    history.push({role:"user",content:raw});
    const out=await sample([{role:"user",content:SYS+"\n\nGreet the client."},{role:"assistant",content:"Hi! I'm Nora from Nexora. How can I help?"},...history.slice(-12)],{modelTier:"quick",cache:false});
    const text=(out.text||"").trim(); if(!text) throw 0;
    history.push({role:"assistant",content:text});
    return {html:esc(text),say:text,chips:ruleReply(raw).chips};
  }catch(e){
    history.pop(); if(e&&(e.code==="not_granted"||e.code==="rate_limited")) aiOff=true;
    const r=ruleReply(raw); history.push({role:"user",content:raw},{role:"assistant",content:r.say}); return r;
  }
}

/* ================= speech ================= */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition, synth=window.speechSynthesis;
let voice=null;
function pickVoice(){ if(!synth) return; const vs=synth.getVoices(); if(!vs.length) return;
  voice=vs.find(v=>/en-ZA/i.test(v.lang))||vs.find(v=>/en-GB/i.test(v.lang)&&/female|libby|sonia|serena|kate/i.test(v.name))||vs.find(v=>/en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null; }
if(synth){ pickVoice(); synth.onvoiceschanged=pickVoice; }
const $=id=>document.getElementById(id);
const orb=on=>$("nxOrb").classList.toggle("live",on);
function speak(text,onEnd){
  if(!synth){ onEnd&&onEnd(); return; }
  synth.cancel(); const u=new SpeechSynthesisUtterance(text.replace(/[🚀]/g,""));
  if(voice) u.voice=voice; u.lang=voice?voice.lang:"en-GB"; u.rate=1; u.pitch=1.05;
  let done=false; const fin=()=>{ if(done) return; done=true; orb(false); onEnd&&onEnd(); };
  u.onend=fin; u.onerror=fin; orb(true); synth.speak(u);
  setTimeout(()=>{ if(!synth.speaking) fin(); },Math.max(4000,text.length*90));
}
function listen(onText,onState){
  if(!SR){ onState("unsupported"); return null; }
  const r=new SR(); r.lang="en-ZA"; r.interimResults=true; r.continuous=false;
  let final="",got=false;
  r.onresult=e=>{ let s=""; for(const res of e.results){ s+=res[0].transcript; if(res.isFinal) final=s; } onState("hearing",s); got=true; };
  r.onerror=e=>onState(e.error==="not-allowed"||e.error==="service-not-allowed"?"blocked":e.error==="no-speech"?"silence":"error");
  r.onend=()=>{ if(final.trim()) onText(final.trim()); else if(got) onState("silence"); onState("ended"); };
  try{ r.start(); onState("listening"); }catch(_){ onState("error"); return null; }
  return r;
}

/* ================= chat UI ================= */
const panel=$("nxPanel"),launch=$("nxLaunch"),log=$("nxLog"),chipsEl=$("nxChips"),input=$("nxText");
let readAloud=false,opened=false;
function add(who,html){ const d=document.createElement("div"); d.className="nx-m "+who; d.innerHTML=html; log.appendChild(d); log.scrollTop=log.scrollHeight; return d; }
function chips(l){ chipsEl.innerHTML=(l||[]).map(c=>`<button type="button">${esc(c)}</button>`).join(""); }
chipsEl.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b) send(b.textContent); });
async function send(text){
  text=(text||"").trim(); if(!text) return;
  add("me",esc(text)); input.value=""; chips([]);
  const t=add("bot",'<span class="nx-typing" aria-label="typing"><i></i><i></i><i></i></span>');
  const r=await think(text); t.innerHTML=r.html; log.scrollTop=log.scrollHeight; chips(r.chips);
  if(readAloud) speak(r.say);
}
$("nxForm").addEventListener("submit",e=>{ e.preventDefault(); send(input.value); });
function open(){
  panel.hidden=false; launch.setAttribute("aria-expanded","true");
  if(!opened){ opened=true; add("bot","Hi, I'm <b>Nora</b>, Nexora's virtual receptionist 👋 Ask me about websites, hosting, domains and business systems, or I can get your <b>free sample</b> started. Type, tap the mic, or switch to <b>Voice receptionist</b> to talk."); chips(DEFAULT_CHIPS); }
  setTimeout(()=>input.focus({preventScroll:true}),50);
}
function close(){ panel.hidden=true; launch.setAttribute("aria-expanded","false"); endCall(); synth&&synth.cancel(); launch.focus(); }
launch.onclick=open; $("nxClose").onclick=close;
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!panel.hidden) close(); });
$("nxSpeak").onclick=()=>{ readAloud=!readAloud; $("nxSpeak").setAttribute("aria-pressed",readAloud); if(!readAloud&&synth) synth.cancel(); };

let chatRec=null;
$("nxMic").onclick=()=>{
  if(chatRec){ chatRec.stop(); return; }
  chatRec=listen(txt=>{ readAloud=true; $("nxSpeak").setAttribute("aria-pressed","true"); send(txt); },(s,txt)=>{
    const m=$("nxMic");
    if(s==="listening"){ m.classList.add("rec"); input.placeholder="Listening…"; }
    if(s==="hearing") input.value=txt;
    if(s==="ended"){ m.classList.remove("rec"); input.placeholder="Ask about websites, hosting, prices…"; chatRec=null; }
    if(s==="blocked"||s==="unsupported"){ add("bot","Voice input isn't available in this browser or the microphone is blocked. You can still type, and tap the speaker to hear replies."); m.classList.remove("rec"); chatRec=null; }
  });
};
function mode(v){
  $("nxTabChat").setAttribute("aria-selected",v==="chat"); $("nxTabVoice").setAttribute("aria-selected",v==="voice");
  $("nxChat").style.display=v==="chat"?"flex":"none"; $("nxVoice").hidden=v!=="voice";
  if(v==="chat") endCall();
}
$("nxTabChat").onclick=()=>mode("chat"); $("nxTabVoice").onclick=()=>mode("voice");

/* ================= voice receptionist loop ================= */
let inCall=false,rec=null,quiet=0;
const vOrb=$("nxVOrb"),vState=$("nxVState"),vSaid=$("nxVSaid"),vReply=$("nxVReply"),vNote=$("nxVNote");
const vset=(c,l)=>{ vOrb.className="nx-vorb "+(c||""); vState.textContent=l; };
const note=t=>{ vNote.hidden=!t; vNote.textContent=t||""; };
function startCall(){
  if(!SR){ note("Your browser can't take voice input. Try Chrome or Safari, or use the Chat tab."); return; }
  inCall=true; quiet=0; $("nxVEnd").hidden=false; note("");
  const hello="Hi, you've reached Nexora Digital. I'm Nora, the virtual receptionist. How can I help your business today?";
  vReply.textContent=hello; vSaid.textContent=""; vset("speaking","Speaking"); speak(hello,turn);
}
function turn(){
  if(!inCall) return;
  rec=listen(async txt=>{
    if(!inCall) return;
    quiet=0; vSaid.textContent="“"+txt+"”"; vset("thinking","Thinking"); add("me",esc(txt));
    const r=await think(txt); add("bot",r.html); if(!inCall) return;
    vReply.textContent=r.say;
    if(/\b(bye|goodbye|that's all|thats all|no thanks)\b/i.test(txt)){ vset("speaking","Speaking"); speak("Thanks for calling Nexora Digital. Goodbye!",endCall); return; }
    vset("speaking","Speaking"); speak(r.say,turn);
  },(s,txt)=>{
    if(!inCall) return;
    if(s==="listening") vset("listening","Listening");
    if(s==="hearing") vSaid.textContent=txt;
    if(s==="blocked"){ note("The microphone is blocked. Allow microphone access in your browser, or use the Chat tab."); endCall(); }
    if(s==="silence") quiet++;
    if(s==="ended"&&inCall&&vState.textContent==="Listening"){
      if(quiet>=2){ vset("speaking","Speaking"); speak("I'll be here when you need me. Tap the button to talk again.",endCall); }
      else setTimeout(turn,250);
    }
  });
}
function endCall(){ inCall=false; try{ rec&&rec.abort(); }catch(_){} rec=null; if(synth) synth.cancel(); vset("","Tap to talk"); $("nxVEnd").hidden=true; orb(false); }
vOrb.onclick=()=>{ if(!inCall) startCall(); else if(vState.textContent==="Speaking") synth&&synth.cancel(); };
$("nxVEnd").onclick=endCall;
if(!SR) note("Voice input needs Chrome, Edge or Safari. Replies can still be read aloud in the Chat tab.");
})();
