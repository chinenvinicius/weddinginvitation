// ---- Card opening loader ----
const loader=document.getElementById('loader');
function openCard(){
  if(loader.classList.contains('open'))return;
  loader.classList.add('open');           // flap opens, then card rises
  setTimeout(()=>{loader.classList.add('hide')},2400);
  setTimeout(()=>{loader.style.display='none';runReveal()},3300);
}
loader.addEventListener('click',openCard);
// auto-open if the user doesn't tap
setTimeout(openCard,3500);

// ---- Scroll reveal ----
function runReveal(){
  const els=document.querySelectorAll('.reveal');
  const io=new IntersectionObserver((es)=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})
  },{threshold:.15});
  els.forEach(el=>io.observe(el));
}

// ---- navbar / mobile menu / back-to-top ----
var nav=document.getElementById('nav');
var navToggle=document.getElementById('navToggle');
var navLinks=document.getElementById('navLinks');
var toTop=document.getElementById('toTop');
navToggle.addEventListener('click',function(){nav.classList.toggle('open');});
navLinks.addEventListener('click',function(e){if(e.target.tagName==='A')nav.classList.remove('open');});
function onNavScroll(){
  var y=window.scrollY||document.documentElement.scrollTop;
  nav.classList.toggle('solid', y>40);
  toTop.classList.toggle('show', y>520);
}
window.addEventListener('scroll',onNavScroll,{passive:true}); onNavScroll();
toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
