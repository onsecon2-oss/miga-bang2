// 첫 방문 세션 1회: 움직이는 영상에서 클릭하면 입장
(function(){
  var d=document,root=d.documentElement;
  var intro=d.querySelector('.intro');
  window.__introDone=!intro;
  if(!intro)return;
  var seen=false;try{seen=sessionStorage.getItem('mb-intro')==='1'}catch(e){}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var v=intro.querySelector('video');
  if(seen||reduce){window.__introDone=true;return}
  root.classList.add('js-intro');d.body.classList.add('lock');
  if(v){var p=v.play();if(p&&p.catch)p.catch(function(){})}
  var done=false;
  function close(e){if(done)return;done=true;if(e&&e.stopPropagation)e.stopPropagation();
    intro.classList.add('out');try{sessionStorage.setItem('mb-intro','1')}catch(x){}
    setTimeout(function(){root.classList.remove('js-intro');d.body.classList.remove('lock');if(v)v.pause();window.__introDone=true;window.dispatchEvent(new Event('introdone'))},850)}
  intro.addEventListener('click',close);
  var sk=intro.querySelector('.skip');if(sk)sk.addEventListener('click',close);
  addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '||e.key==='Escape')close(e)});
})();
