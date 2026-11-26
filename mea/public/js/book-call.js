import { esc, q, setMeta, WA, priceLine } from "/js/mea-util.js";
import { fetchServiceBySlug } from "/js/wix/services.js";
import { createBookingFlowStore } from "/js/wix/booking-flow-store.js";
var root=document.getElementById("root");
var service=null;
try{service=await fetchServiceBySlug(q("slug"));}catch(e){root.innerHTML='<p class="status">We could not load this page. Please try again, or <a class="link" href="'+WA+'">message us on WhatsApp</a>.</p>';throw e;}
if(!service){root.innerHTML='<div style="padding:60px 0"><h1>Not found</h1><p><a class="link" href="'+(document.body.dataset.list||"/book.html")+'">See all</a></p></div>';}
else start();
function start(){
  setMeta(service.name,service.tagLine||service.description,document.body.dataset.brand);
  var staff=(service.staff||[]).length>1?'<div class="opt" id="staff"></div>':"";
  root.innerHTML='<div class="svc"><div>'+(service.imageUrl?'<img class="hero-img" src="'+esc(service.imageUrl)+'" alt="'+esc(service.name)+'">':'')+
   '<h1>'+esc(service.name)+'</h1>'+(service.tagLine?'<p class="lede">'+esc(service.tagLine)+'</p>':'')+
   '<p>'+esc(service.durationLabel||"")+(priceLine(service)?' · '+priceLine(service):'')+'</p>'+
   '<div class="desc">'+(service.description||"")+'</div>'+
   '<p class="note">Questions first? <a class="link" href="'+WA+'" target="_blank" rel="noopener">Chat on WhatsApp</a>'+(document.body.dataset.phone?' or call '+esc(document.body.dataset.phone):'')+'.</p></div>'+
   '<div><div class="panel" id="panel"><h3>Choose a date</h3>'+staff+
   '<div class="days" id="days"></div><p class="note" id="tz"></p><div class="slots" id="slots"></div><div id="next"></div>'+
   '<form id="form"><div class="form-grid" id="fields"></div><div class="opt" id="dep"></div><p class="err" id="err"></p>'+
   '<button class="btn btn-main" id="cta" type="submit" style="width:100%">Book</button>'+
   '<p class="note" id="cta-note"></p></form><div class="ok" id="done" hidden></div></div></div></div>';
  var store=createBookingFlowStore(service);
  var activeDay=null,fieldsDone=false;
  var $=function(id){return document.getElementById(id);};
  function slotByKey(s,k){var out=null;(s.days||[]).forEach(function(d){d.slots.forEach(function(x){if(x.key===k)out=x;});});return out;}
  var panel=$("panel");
  panel.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b||b.type==="submit")return;var d=b.dataset;
    if(d.day){activeDay=d.day;render(store.getState());}
    else if(d.week==="next")store.nextWeek();else if(d.week==="prev")store.prevWeek();
    else if(d.slot)store.setSelectedSlot(slotByKey(store.getState(),d.slot));
    else if(d.jump){activeDay=d.jump;store.jumpTo(d.jump);}
    else if(d.staff!==undefined)store.setStaffId(d.staff||undefined);
    else if(d.dep!==undefined)store.setPayDeposit(d.dep==="1");
  });
  panel.addEventListener("input",function(e){if(e.target.dataset.field)store.setValue(e.target.dataset.field,e.target.value);});
  $("form").addEventListener("submit",function(e){e.preventDefault();store.book().catch(function(){});});
  function render(s){
    var days=s.days||[];
    if(days.length&&!days.some(function(d){return d.dayKey===activeDay;})){var f=days.find(function(d){return d.slots.some(function(x){return x.bookable;});});activeDay=(f||days[0]).dayKey;}
    $("days").innerHTML=s.days===null?'<span class="note">Loading dates…</span>':'<button type="button" class="wk" data-week="prev" aria-label="Previous week">‹</button>'+days.map(function(d){var has=d.slots.some(function(x){return x.bookable;});return '<button type="button" class="day'+(has?"":" empty")+'" data-day="'+esc(d.dayKey)+'" aria-pressed="'+(d.dayKey===activeDay)+'">'+esc(d.dayLabel)+'</button>';}).join("")+'<button type="button" class="wk" data-week="next" aria-label="Next week">›</button>';
    $("tz").textContent=s.timeZoneLabel?"Times shown in "+s.timeZoneLabel:"";
    var day=days.find(function(d){return d.dayKey===activeDay;});
    var sl=day?day.slots:[];
    $("slots").innerHTML=s.days===null?"":(sl.length?sl.map(function(x){return '<button type="button" class="slot" data-slot="'+esc(x.key)+'"'+(x.bookable?"":" disabled")+' aria-pressed="'+(!!(s.selectedSlot&&s.selectedSlot.key===x.key))+'">'+esc(x.label)+'</button>';}).join(""):'<span class="note">No times on this day.</span>');
    $("next").innerHTML=s.nextAvailable&&s.nextAvailable.length&&!days.some(function(d){return d.slots.some(function(x){return x.bookable;});})?'<p class="note">Next available:</p><div class="slots">'+s.nextAvailable.slice(0,4).map(function(x){return '<button type="button" class="slot" data-jump="'+esc(x.dayKey)+'">'+esc(x.dayLabel||x.dayKey)+' '+esc(x.label||"")+'</button>';}).join("")+'</div>':"";
    if($("staff"))$("staff").innerHTML='<button type="button" class="ghost" data-staff="" aria-pressed="'+(!s.staffId)+'">Any</button>'+service.staff.map(function(m){return '<button type="button" class="ghost" data-staff="'+esc(m.id)+'" aria-pressed="'+(s.staffId===m.id)+'">'+esc(m.name)+'</button>';}).join("");
    if(!fieldsDone&&s.formFields&&s.formFields.length){fieldsDone=true;
      $("fields").innerHTML=s.formFields.map(function(f){var t={EMAIL:"email",PHONE:"tel",NUMBER:"number",URL:"url"}[f.type]||"text";
        var ctl=f.options&&f.options.length?'<select data-field="'+esc(f.target)+'"><option value=""></option>'+f.options.map(function(o){var v=o.value!=null?o.value:o;var l=o.label!=null?o.label:o;return '<option value="'+esc(v)+'">'+esc(l)+'</option>';}).join("")+'</select>':'<input type="'+t+'" data-field="'+esc(f.target)+'"'+(f.required?" required":"")+'>';
        return '<label>'+esc(f.label)+(f.required?" *":"")+ctl+'</label>';}).join("");}
    var dp=service.deposit;
    $("dep").innerHTML=dp&&dp.amount&&dp.fullUpfrontAllowed?'<button type="button" class="ghost" data-dep="1" aria-pressed="'+(!!s.payDeposit)+'">Pay deposit '+esc(dp.amount)+'</button><button type="button" class="ghost" data-dep="0" aria-pressed="'+(!s.payDeposit)+'">Pay in full</button>':(dp&&dp.amount?'<p class="note">Deposit to secure your date: '+esc(dp.amount)+'</p>':"");
    var cta=$("cta");cta.disabled=!s.canBook||!!s.booking;
    cta.textContent=s.booking?"Booking…":s.ctaState==="requestToBook"?"Request to book":"Book";
    $("cta-note").textContent=s.ctaState==="requestToBook"?"We confirm every request personally, usually within a day.":"";
    $("err").textContent=s.error||"";
    if(s.confirmed){$("form").hidden=true;$("done").hidden=false;$("done").innerHTML=s.ctaState==="requestToBook"?"<b>Request sent.</b> We will confirm your date shortly by email or WhatsApp.":"<b>You're booked!</b> A confirmation is on its way to your email.";}
  }
  store.subscribe(render);render(store.getState());store.start();
}
