(async function(){
  const S=window.__STAGES, N=S.length;
  const sec=document.querySelector('.jb'); if(!sec)return;
  const svg=d3.select('#globe');
  const W=720,H=720,R=300;
  const proj=d3.geoOrthographic().scale(R).translate([W/2,H/2]).clipAngle(90).precision(.3);
  const path=d3.geoPath(proj);
  const grat=d3.geoGraticule10();
  let land=null;
  try{const topo=await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')).json();land=topojson.feature(topo,topo.objects.land)}catch(e){}
  const gBase=svg.append('g');
  gBase.append('circle').attr('class','sph').attr('cx',W/2).attr('cy',H/2).attr('r',R);
  const pGrat=gBase.append('path').attr('class','grat');
  const pLand=gBase.append('path').attr('class','land');
  const pGhost=svg.append('path').attr('class','routeghost');
  const pRoute=svg.append('path').attr('class','route');
  const gPts=svg.append('g');
  const plane=svg.append('g').attr('class','plane');
  plane.append('path').attr('d','M0,-12 L2.8,-3.4 L12,2.2 L12,4.6 L2.8,2.6 L1.7,8.6 L5.2,11 L5.2,12.6 L0,11.2 L-5.2,12.6 L-5.2,11 L-1.7,8.6 L-2.8,2.6 L-12,4.6 L-12,2.2 L-2.8,-3.4 Z');
  const pts=S.map(s=>[s.lon,s.lat]);
  const ticks=document.querySelectorAll('.jb .tick');
  const $=q=>document.querySelector(q);
  const el={roman:$('#h-roman'),coord:$('#h-coord'),city:$('#h-city'),cityEn:$('#h-cityen'),title:$('#c-title'),desc:$('#c-desc'),prog:$('#h-prog')};
  const media=[...document.querySelectorAll('.jb .media .m')];
  let cur=-1,lastAng=-30;
  const fmt=(v,p,n)=>Math.abs(v).toFixed(2)+' '+(v>=0?p:n);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const arc=(a,b)=>{const g=d3.geoInterpolate(a,b);const l=[];for(let s=0;s<=24;s++)l.push(g(s/24));return l};

  function render(p){
    const t=clamp(p,0,1)*(N-1);const i=Math.min(N-2,Math.floor(t));const f=ease(t-i);
    const a=pts[i],b=pts[i+1];
    const g=d3.geoInterpolate(a,b);const c=g(f);
    proj.rotate([-c[0],-c[1]]);
    pGrat.datum(grat).attr('d',path);
    if(land)pLand.datum(land).attr('d',path);
    const done={type:'MultiLineString',coordinates:[]};
    for(let k=0;k<i;k++)done.coordinates.push(arc(pts[k],pts[k+1]));
    const sub=[];for(let s=0;s<=24;s++)sub.push(g(f*s/24));done.coordinates.push(sub);
    pRoute.datum(done).attr('d',path);
    const ghost={type:'MultiLineString',coordinates:[]};
    for(let k=0;k<N-1;k++)ghost.coordinates.push(arc(pts[k],pts[k+1]));
    pGhost.datum(ghost).attr('d',path);
    const idx=Math.round(t);
    const sel=gPts.selectAll('circle').data(pts);
    sel.enter().append('circle').attr('class','pt').attr('r',4).merge(sel).each(function(d,k){
      const v=proj(d);const front=d3.geoDistance(d,c)<Math.PI/2;
      d3.select(this).attr('cx',v[0]).attr('cy',v[1]).style('display',front?null:'none').classed('on',k<=idx);
    });
    // 비행기: 경로 진행 방향으로 회전
    const cp=proj(c);
    const f2=f<.96?f+.04:f-.04;const c2=g(f2);const q=proj(c2);
    let dx=q[0]-cp[0],dy=q[1]-cp[1];if(f>=.96){dx=-dx;dy=-dy}
    if(Math.hypot(dx,dy)>.4)lastAng=Math.atan2(dy,dx)*180/Math.PI+90;
    plane.attr('transform','translate('+cp[0]+','+cp[1]+') rotate('+lastAng+') scale(1.15)');
    el.coord.innerHTML='<b>'+fmt(c[1],'N','S')+'</b> · <b>'+fmt(c[0],'E','W')+'</b>';
    el.prog.textContent=String(Math.round(clamp(p,0,1)*100)).padStart(3,'0')+' / 100';
    if(idx!==cur){cur=idx;const s=S[idx];
      el.roman.innerHTML='STAGE <b>'+s.roman+'</b> / VI';
      el.city.textContent=s.cityEn;el.cityEn.textContent=s.cityKo;
      el.title.textContent=s.title;el.desc.textContent=s.text;
      media.forEach((m,k)=>{m.classList.toggle('on',k===idx);const v=m.querySelector('video');if(v){if(k===idx){v.play&&v.play().catch(()=>{})}else{v.pause&&v.pause()}}});
      ticks.forEach((c3,k)=>{c3.classList.toggle('on',k===idx);c3.classList.toggle('done',k<idx)});
    }
  }
  const prog=()=>{const r=sec.getBoundingClientRect();return clamp(-r.top/(sec.offsetHeight-innerHeight),0,1)};
  let lenis=null;
  if(window.Lenis){lenis=new Lenis({lerp:.09});const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
    if(!window.__introDone)lenis.stop();addEventListener('introdone',()=>lenis.start());
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t,{offset:-70})}}));}
  let shown=prog();
  const loop=()=>{shown+=(prog()-shown)*.14;render(shown);requestAnimationFrame(loop)};
  requestAnimationFrame(loop);
})();
