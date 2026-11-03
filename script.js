document.documentElement.classList.add('js');
var R=document.documentElement,$=function(s){return document.querySelector(s)};
/* day/night theme: auto by local time, toggle overrides */
function auto(){var h=new Date().getHours();return h>=6&&h<18?'light':'dark'}
var saved=null;try{saved=localStorage.getItem('th')}catch(e){}
function setT(t){R.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m)}m.content=t=='light'?'#f4faff':'#050507';col()}
$('#th').onclick=function(){var t=R.dataset.theme=='dark'?'light':'dark';setT(t);try{localStorage.setItem('th',t)}catch(e){}};
$('#mb').onclick=function(){$('#nv').classList.toggle('o')};
document.querySelectorAll('#nv a').forEach(function(a){a.onclick=function(){$('#nv').classList.remove('o')}});
/* marquee */
var sk='Java,Spring Boot,React,Next.js,Python,MySQL,FastAPI,Gemini API,InsightFace,scikit-learn,Hibernate,TypeScript'.split(',');
var mh='';for(var k=0;k<2;k++)sk.forEach(function(s,i){mh+=(i%2?'<em>'+s+'</em>':s)+'<span>✦</span>'});$('#mq').innerHTML=mh;
/* loader */
var n=0,ld=$('#ld'),nn=$('#n'),iv=setInterval(function(){n+=Math.ceil(Math.random()*9);if(n>=100){n=100;clearInterval(iv);setTimeout(function(){ld.classList.add('out');document.body.classList.add('ready');R.classList.add('ready')},250)}nn.textContent=(n<10?'0':'')+n},40);
/* reveal + scrollspy + progress */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('.rv').forEach(function(e){io.observe(e)});
var links=document.querySelectorAll('#side a'),secs=['top','profile','projects','resume'];
addEventListener('scroll',function(){var h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight);$('#bar').style.width=p*100+'%';
 var cur=0;secs.forEach(function(s,i){if($('#'+s).getBoundingClientRect().top<innerHeight*.5)cur=i});links.forEach(function(a,i){a.classList.toggle('on',i==cur)})},{passive:true});
/* cursor */
var cu=$('#cur'),cx=0,cy=0,tx=0,ty=0;addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;mx=e.clientX;my=e.clientY});
document.querySelectorAll('a,button,summary,.hob span').forEach(function(e){e.addEventListener('mouseenter',function(){cu.style.width=cu.style.height='54px'});e.addEventListener('mouseleave',function(){cu.style.width=cu.style.height='14px'})});
/* hero canvas: drifting light orbs that follow the pointer */
var cv=$('#cv'),c=cv.getContext('2d'),W,H,mx=0,my=0,orbs=[],rgb=[[124,245,208],[108,123,255]];
function col(){var l=R.dataset.theme=='light';rgb=l?[[10,125,99],[59,79,224]]:[[124,245,208],[108,123,255]]}
function rs(){var d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;c.setTransform(d,0,0,d,0,0)}
addEventListener('resize',rs);rs();mx=W*.7;my=H*.4;
for(var i=0;i<5;i++)orbs.push({x:Math.random()*W,y:Math.random()*H,r:180+Math.random()*220,a:Math.random()*6.28,s:.0006+Math.random()*.0008,k:i%2});
(function f(t){cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;cu.style.transform='translate('+(cx-cu.offsetWidth/2)+'px,'+(cy-cu.offsetHeight/2)+'px)';
 c.clearRect(0,0,W,H);var L=R.dataset.theme=='light';
 orbs.forEach(function(o,i){var px=o.x+Math.cos(t*o.s+o.a)*120+(mx-W/2)*.08*(i+1)/3,py=o.y+Math.sin(t*o.s*1.3+o.a)*90+(my-H/2)*.08*(i+1)/3,q=rgb[o.k];
  var g=c.createRadialGradient(px,py,0,px,py,o.r);g.addColorStop(0,'rgba('+q+','+(L?.22:.28)+')');g.addColorStop(1,'rgba('+q+',0)');c.fillStyle=g;c.fillRect(px-o.r,py-o.r,o.r*2,o.r*2)});
 /* fine grid */
 c.strokeStyle=L?'rgba(10,13,20,.05)':'rgba(255,255,255,.05)';c.lineWidth=1;c.beginPath();for(var x=0;x<W;x+=80){c.moveTo(x,0);c.lineTo(x,H)}for(var y=0;y<H;y+=80){c.moveTo(0,y);c.lineTo(W,y)}c.stroke();
 requestAnimationFrame(f)})(0);
setT(saved||auto());
