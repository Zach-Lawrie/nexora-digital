import { esc } from "/js/nx-util.js";
import { fetchCollections, fetchProjects } from "/js/wix/portfolio.js";
import { imgSrc } from "/js/wix/media.js";
var root=document.getElementById("wx-work"),st=document.getElementById("wx-work-status");
var max=Number(root.dataset.max||0);
st.textContent="Loading our work…";
Promise.all([fetchCollections({limit:50}),fetchProjects({limit:50})]).then(function(r){
  var names={};r[0].forEach(function(c){names[c.id]=c.title;});
  var list=max?r[1].slice(0,max):r[1];
  root.innerHTML=list.map(function(p){
    var kind=(p.collectionIds||[]).map(function(id){return names[id];}).filter(Boolean).join(" · ");
    return '<a class="wx-card" href="/project.html?slug='+encodeURIComponent(p.slug)+'"><div class="img" style="background-image:url(\''+(p.imageUrl?esc(imgSrc(p.imageUrl,800,500)):"")+'\')"></div>'+
      '<div class="body">'+(kind?'<span class="kind">'+esc(kind)+'</span>':'')+'<h3>'+esc(p.title)+'</h3><p>'+esc(p.description)+'</p><span class="go">See the project →</span></div></a>';
  }).join("");
  st.textContent=list.length?"":"New projects coming soon.";
}).catch(function(){st.textContent="Our work could not load right now. Please refresh.";});
