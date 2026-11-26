import { esc } from "/js/mea-util.js";
import { fetchCollections, fetchProjects } from "/js/wix/portfolio.js";
import { imgSrc } from "/js/wix/media.js";
var chips=document.getElementById("mea-cols"),grid=document.getElementById("mea-proj"),st=document.getElementById("mea-proj-status");
var cols=[],projs=[],active="";
function render(){
  var names={};cols.forEach(function(c){names[c.id]=c.title;});
  if(!projs.length){
    chips.innerHTML="";
    grid.innerHTML=cols.map(function(c){return '<div class="wx-tile" style="background-image:url(\''+(c.imageUrl?esc(imgSrc(c.imageUrl,700,525)):"")+'\')"><span>'+esc(c.title)+'<small>'+esc(c.description||"")+'</small></span></div>';}).join("");
    st.textContent="Photos and write-ups of real MEA jobs are being added. Ask us for references in the meantime.";
    return;
  }
  chips.innerHTML='<button class="wx-chip" data-c="" aria-pressed="'+(!active)+'">All</button>'+cols.map(function(c){return '<button class="wx-chip" data-c="'+esc(c.id)+'" aria-pressed="'+(active===c.id)+'">'+esc(c.title)+'</button>';}).join("");
  var list=projs.filter(function(p){return !active||(p.collectionIds||[]).indexOf(active)>=0;});
  grid.innerHTML=list.map(function(p){
    var kind=(p.collectionIds||[]).map(function(id){return names[id];}).filter(Boolean).join(" · ");
    return '<a class="wx-card" href="/project.html?slug='+encodeURIComponent(p.slug)+'"><div class="img" style="background-image:url(\''+(p.imageUrl?esc(imgSrc(p.imageUrl,800,500)):"")+'\')"></div><div class="body">'+(kind?'<span class="kind">'+esc(kind)+'</span>':'')+'<h3>'+esc(p.title)+'</h3><p>'+esc(p.description)+'</p><span class="go">See the project →</span></div></a>';
  }).join("");
  st.textContent=list.length?"":"No projects in this category yet.";
}
chips.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;active=b.dataset.c;render();});
st.textContent="Loading projects…";
Promise.all([fetchCollections({limit:50}),fetchProjects({limit:60})]).then(function(r){cols=r[0];projs=r[1];render();}).catch(function(){st.textContent="Projects could not load right now. Please refresh.";});
