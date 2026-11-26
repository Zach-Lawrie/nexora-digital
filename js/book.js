import { esc, priceLine } from "/js/nx-util.js";
import { createServicesStore } from "/js/wix/services-store.js";
var list=document.getElementById("list"),st=document.getElementById("status"),chips=document.getElementById("chips"),more=document.getElementById("more");
var page=document.body.dataset.book||"/book-call.html";
var store=createServicesStore();
more.addEventListener("click",function(){store.loadMore();});
chips.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;store.setActiveCategoryId(b.dataset.cat||undefined);});
function card(s){
  return '<a class="wx-card" href="'+page+'?slug='+encodeURIComponent(s.slug)+'">'+(s.imageUrl?'<div class="img" style="background-image:url(\''+esc(s.imageUrl)+'\')"></div>':'')+
    '<div class="body">'+(s.categoryName?'<span class="kind">'+esc(s.categoryName)+'</span>':'')+'<h3>'+esc(s.name)+'</h3>'+(s.tagLine?'<p>'+esc(s.tagLine)+'</p>':'')+
    '<div class="meta"><span>'+esc(s.durationLabel||"")+'</span>'+(priceLine(s)||'<span class="go">Book</span>')+'</div></div></a>';
}
function render(s){
  more.hidden=!s.hasMore;more.disabled=!!s.loadingMore;
  var cats=s.categories||[];
  chips.innerHTML=cats.length>1?'<button class="wx-chip" data-cat="" aria-pressed="'+(!s.activeCategoryId)+'">All</button>'+cats.map(function(c){return '<button class="wx-chip" data-cat="'+esc(c.id)+'" aria-pressed="'+(s.activeCategoryId===c.id)+'">'+esc(c.name)+'</button>';}).join(""):"";
  if(s.services===null){st.textContent="Loading…";return;}
  list.innerHTML=s.services.map(card).join("");
  st.textContent=s.error||(s.services.length?"":"Nothing to book right now. Message us on WhatsApp.");
}
store.subscribe(render);render(store.getState());store.start();
