/* Michael Anderson Light Painting — small enhancements. Content works without this file. */
(function(){
  // current page in the menu (qikEdit strips hard-coded active classes)
  var here=location.pathname.replace(/\/$/,'/index.html').replace(/\.html$/,'');
  if(here==='/') here='/index';
  document.querySelectorAll('.main-menu a').forEach(function(a){
    var p=a.getAttribute('href').split('#')[0].replace(/\.html$/,'');
    if(p&&p!=='/index'&&(here===p||here.indexOf(p+'/')===0||(p==='/stories'&&here.indexOf('/stories/')===0)))a.classList.add('is-current');
  });
  // mobile menu
  var t=document.querySelector('.menu-toggle'),n=document.getElementById('site-nav');
  if(t&&n)t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o)});
  // footer year
  document.querySelectorAll('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
  // Inside the qikEdit editor (the page is framed) or with ?edit in the address, skip the
  // interactive extras so the editor can click every tagged photo and field.
  var inEditor=false;
  try{inEditor=window.self!==window.top}catch(e){inEditor=true}
  if(/[?&]edit/.test(location.search))inEditor=true;
  if(inEditor)document.documentElement.classList.add('in-editor');
  // before/after sliders
  function wire(c){
    var r=c.querySelector('.compare-range');
    if(!r)return;
    var set=function(v){c.style.setProperty('--pos',v+'%')};
    r.addEventListener('input',function(){set(r.value)});
    return {range:r,set:set};
  }
  if(!inEditor)document.querySelectorAll('[data-compare]').forEach(wire);
  // hero: one slow sweep on load to show the slider can be dragged
  var hero=document.querySelector('.hero [data-compare]');
  if(!inEditor&&hero&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var r=hero.querySelector('.compare-range'),t0=null,dur=2600,stopped=false;
    ['pointerdown','keydown','input'].forEach(function(e){r.addEventListener(e,function(){stopped=true})});
    function step(t){ if(stopped)return; if(t0===null)t0=t; var p=Math.min((t-t0)/dur,1);
      var v=50+Math.sin(p*Math.PI*2)*-32*(1-p*0.15); if(p>=1)v=50;
      hero.style.setProperty('--pos',v+'%'); r.value=v; if(p<1)requestAnimationFrame(step); }
    setTimeout(function(){requestAnimationFrame(step)},700);
  }
  // gallery cards: slider when there is a setup photo, lightbox, expandable captions
  function lightbox(src,alt,back){
    var lb=document.createElement('div');lb.className='lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
    lb.innerHTML='<img alt=""><button type="button">Close</button>';lb.querySelector('img').src=src;lb.querySelector('img').alt=alt;
    function close(){lb.remove();document.removeEventListener('keydown',k);if(back)back.focus()}
    function k(e){if(e.key==='Escape')close()}
    lb.addEventListener('click',close);document.addEventListener('keydown',k);document.body.appendChild(lb);lb.querySelector('button').focus();
  }
  if(!inEditor)document.querySelectorAll('.portfolio-item').forEach(function(item){
    var frame=item.querySelector('.frame'),img=frame&&frame.querySelector('img'),setup=item.getAttribute('data-setup');
    if(!img)return;
    if(setup){
      frame.classList.add('compare');frame.style.setProperty('--pos','50%');
      var b=document.createElement('div');b.className='compare-before';
      var bi=document.createElement('img');bi.src=setup;bi.alt='The same scene before light painting';bi.loading='lazy';b.appendChild(bi);
      var r=document.createElement('input');r.type='range';r.min=0;r.max=100;r.value=50;r.className='compare-range';
      r.setAttribute('aria-label','Drag to compare the setup photo with the light painting: '+(img.alt||''));
      var t1=document.createElement('span');t1.className='compare-tag before-tag';t1.textContent='Before';
      var t2=document.createElement('span');t2.className='compare-tag after-tag';t2.textContent='After';
      frame.appendChild(b);frame.appendChild(r);frame.appendChild(t1);frame.appendChild(t2);
      wire(frame);
    }
    if(document.body.classList.contains('gallery')){
      var z=document.createElement('button');z.type='button';z.className='frame-expand';z.textContent='View larger';
      z.setAttribute('aria-label','View larger: '+(img.alt||''));
      z.addEventListener('click',function(e){e.stopPropagation();lightbox(img.src,img.alt,z)});
      frame.appendChild(z);
      var p=item.querySelector('p');
      if(p&&p.scrollHeight>p.clientHeight+4){
        var mb=document.createElement('button');mb.type='button';mb.className='more';mb.textContent='Read more';mb.setAttribute('aria-expanded','false');
        mb.addEventListener('click',function(){var o=p.classList.toggle('open');mb.textContent=o?'Show less':'Read more';mb.setAttribute('aria-expanded',o)});
        p.insertAdjacentElement('afterend',mb);
      }
    }
  });
})();
