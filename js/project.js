import { esc, q, setMeta } from "/js/nx-util.js";
import { createProjectDetailStore } from "/js/wix/project-detail-store.js";
import { mediaElement } from "/js/wix/portfolio-core.js";
var head=document.getElementById("head"),det=document.getElementById("details"),gal=document.getElementById("gallery"),st=document.getElementById("status");
function figureOf(item){
  var el=mediaElement(item);if(!el)return null;
  var m=document.createElement(el.tag);Object.keys(el.attrs).forEach(function(n){m.setAttribute(n,String(el.attrs[n]));});
  if(el.tag==="img"){m.setAttribute("loading","lazy");if(!m.getAttribute("alt"))m.setAttribute("alt",item.title||"Project image");}
  var f=document.createElement("figure");
  if(item.linkUrl){var a=document.createElement("a");a.href=item.linkUrl;if(item.linkTarget)a.target=item.linkTarget;a.append(m);f.append(a);}else f.append(m);
  if(item.title){var c=document.createElement("figcaption");c.textContent=item.title;f.append(c);}
  return f;
}
var store=createProjectDetailStore(q("slug"));
function render(s){
  if(s.notFound){head.innerHTML="<h1>Project not found</h1>";st.textContent="";return;}
  if(!s.project){st.textContent=s.error||"Loading…";return;}
  var p=s.project;setMeta(p.title,p.description,document.body.dataset.brand);
  head.innerHTML="<h1>"+esc(p.title)+"</h1>"+(p.description?'<p class="lede">'+esc(p.description)+"</p>":"");
  det.innerHTML=(p.details||[]).map(function(d){return "<div><span>"+esc(d.label)+"</span><b>"+(d.url?'<a href="'+esc(d.url)+'"'+(d.target?' target="'+esc(d.target)+'" rel="noopener"':"")+'>'+esc(d.text)+" ↗</a>":esc(d.text))+"</b></div>";}).join("");
  if(s.items===null){st.textContent="Loading…";return;}
  gal.replaceChildren.apply(gal,s.items.map(figureOf).filter(Boolean));
  st.textContent=s.error||(s.items.length?"":"Photos of this project are coming soon.");
}
store.subscribe(render);render(store.getState());store.start();
