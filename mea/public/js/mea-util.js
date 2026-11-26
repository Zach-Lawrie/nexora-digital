export const WA = "https://wa.me/61433427505";
export function esc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
export function q(name){return new URLSearchParams(location.search).get(name)||"";}
export function setMeta(title,desc,brand){document.title=title+" | "+(brand||"MEA");var m=document.querySelector('meta[name="description"]');if(m&&desc)m.setAttribute("content",String(desc).replace(/<[^>]+>/g,"").slice(0,155));}
export function priceLine(s){
  if(!s.price) return "";
  return '<span class="price">'+(s.priceFrom?"From ":"")+esc(s.price)+'</span>'+(s.basePrice&&s.basePrice!==s.price?' <s>'+esc(s.basePrice)+'</s>':'');
}
