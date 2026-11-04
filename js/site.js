/* Michael Anderson Light Painting — small enhancements. Content works without this file. */
(function(){
  document.documentElement.classList.add('js'); // js-flag
  // current page in the menu (qikEdit strips hard-coded active classes)
  var here=location.pathname.replace(/\/$/,'/index.html').replace(/\.html$/,'');
  if(here==='/') here='/index';
  document.querySelectorAll('.main-menu a').forEach(function(a){
    var h=a.getAttribute('href');if(h.indexOf('#')>-1)return;var p=h.replace(/\.html$/,'');
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
    setTimeout(function(){requestAnimationFrame(step)},1900);
  }

  // paint it yourself: reveal the light painting under a glowing brush
  if(!inEditor)document.querySelectorAll('[data-paint]').forEach(function(stage){
    var after=stage.querySelector('.paint-after img'),before=stage.querySelector('.paint-before img');
    if(!after||!before)return;
    var view=document.createElement('canvas'),trail=document.createElement('canvas'),mask=document.createElement('canvas');
    var cur=document.createElement('span');cur.className='paint-cursor';
    stage.insertBefore(view,stage.querySelector('.paint-hint'));stage.insertBefore(trail,stage.querySelector('.paint-hint'));stage.appendChild(cur);
    var vx=view.getContext('2d'),tx=trail.getContext('2d'),mx=mask.getContext('2d'),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2),last=null,raf=null,all=false;
    var img=new Image();img.src=after.currentSrc||after.src;
    function size(){var r=stage.getBoundingClientRect();var nw=Math.round(r.width*dpr),nh=Math.round(r.height*dpr);if(nw===W&&nh===H)return;
      var old=null;if(W&&H){old=document.createElement('canvas');old.width=W;old.height=H;old.getContext('2d').drawImage(mask,0,0)}
      W=nw;H=nh;[view,trail,mask].forEach(function(c){c.width=W;c.height=H});if(old)mx.drawImage(old,0,0,W,H);render()}
    function render(){if(!img.complete||!W)return;vx.clearRect(0,0,W,H);vx.globalCompositeOperation='source-over';vx.drawImage(mask,0,0);vx.globalCompositeOperation='source-in';vx.drawImage(img,0,0,W,H);vx.globalCompositeOperation='source-over'}
    function brush(x,y){var r=Math.max(W,H)*0.055;var g=mx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(.6,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');mx.fillStyle=g;mx.beginPath();mx.arc(x,y,r,0,Math.PI*2);mx.fill()}
    function stroke(a,b){var d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/(W*0.012)));for(var i=1;i<=n;i++)brush(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n);
      tx.save();tx.strokeStyle='rgba(255,214,150,.95)';tx.lineWidth=3*dpr;tx.lineCap='round';tx.shadowColor='rgba(240,180,92,1)';tx.shadowBlur=18*dpr;tx.beginPath();tx.moveTo(a.x,a.y);tx.lineTo(b.x,b.y);tx.stroke();tx.restore();render();loop()}
    var lastT=0;
    function loop(){lastT=performance.now();if(raf)return;raf=requestAnimationFrame(function f(){raf=null;tx.save();tx.globalCompositeOperation='destination-out';tx.fillStyle='rgba(0,0,0,.08)';tx.fillRect(0,0,W,H);tx.restore();
      if(performance.now()-lastT<1600)raf=requestAnimationFrame(f);else tx.clearRect(0,0,W,H)})}
    function pt(e){var r=stage.getBoundingClientRect();cur.style.left=(e.clientX-r.left)+'px';cur.style.top=(e.clientY-r.top)+'px';return{x:(e.clientX-r.left)*dpr,y:(e.clientY-r.top)*dpr}}
    var down=false;
    stage.addEventListener('pointerdown',function(e){down=true;stage.classList.add('painting','started');stage.setPointerCapture(e.pointerId);last=pt(e);stroke(last,last)});
    stage.addEventListener('pointermove',function(e){var p=pt(e);if(e.pointerType==='mouse'&&!down){stage.classList.add('started');}if(down||e.pointerType==='mouse'){if(last)stroke(last,p);last=p}});
    stage.addEventListener('pointerleave',function(){last=null});
    ['pointerup','pointercancel'].forEach(function(t){stage.addEventListener(t,function(){down=false;last=null;stage.classList.remove('painting')})});
    var sec=stage.closest('section');
    var rb=sec&&sec.querySelector('[data-paint-reset]'),ab=sec&&sec.querySelector('[data-paint-all]');
    if(rb)rb.addEventListener('click',function(){mx.clearRect(0,0,W,H);tx.clearRect(0,0,W,H);stage.classList.remove('started');render()});
    if(ab)ab.addEventListener('click',function(){var t0=null;stage.classList.add('started');(function f(t){if(t0===null)t0=t;var p=Math.min((t-t0)/900,1);mx.fillStyle='rgba(0,0,0,'+(0.12)+')';mx.fillRect(0,0,W,H);render();if(p<1)requestAnimationFrame(f)})(performance.now())});
    img.onload=function(){size()};if(img.complete)size();
    window.addEventListener('resize',size);
  });
  // gallery cards: slider when there is a setup photo, lightbox, expandable captions
  function lightbox(list,start,back){
    var i=start||0;
    var lb=document.createElement('div');lb.className='lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
    lb.innerHTML='<img alt=""><button type="button" class="lb-close">Close</button>'+(list.length>1?'<button type="button" class="lb-prev" aria-label="Previous photo">&#8249;</button><button type="button" class="lb-next" aria-label="Next photo">&#8250;</button><span class="lb-count"></span>':'');
    var im=lb.querySelector('img'),ct=lb.querySelector('.lb-count');
    function show(){im.src=list[i].src;im.alt=list[i].alt||'';if(ct)ct.textContent=(i+1)+' / '+list.length}
    function go(d){i=(i+d+list.length)%list.length;show()}
    function close(){lb.remove();document.removeEventListener('keydown',k);if(back)back.focus()}
    function k(e){if(e.key==='Escape')close();else if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)}
    lb.addEventListener('click',function(e){if(e.target.classList.contains('lb-prev')){go(-1)}else if(e.target.classList.contains('lb-next')){go(1)}else if(e.target!==im)close()});
    var x0=null;lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(dx<0?1:-1);x0=null});
    document.addEventListener('keydown',k);document.body.appendChild(lb);show();lb.querySelector('.lb-close').focus();
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
      var list=[{src:img.getAttribute('src'),alt:img.alt}];
      (item.getAttribute('data-more')||'').split(',').map(function(s){return s.trim()}).filter(Boolean).forEach(function(s){list.push({src:s,alt:(item.querySelector('h3')||{}).textContent||''})});
      var z=document.createElement('button');z.type='button';z.className='frame-expand';z.textContent=list.length>1?('View all '+list.length):'View larger';
      z.setAttribute('aria-label','View larger: '+(img.alt||''));
      z.addEventListener('click',function(e){e.stopPropagation();lightbox(list,0,z)});
      frame.appendChild(z);
      if(list.length>1){
        var strip=document.createElement('div');strip.className='more-strip';
        list.slice(1,5).forEach(function(it,n){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Photo '+(n+2)+' of '+list.length);
          var t=document.createElement('img');t.src=it.src;t.alt='';t.loading='lazy';b.appendChild(t);
          if(n===3&&list.length>5){var c=document.createElement('span');c.textContent='+'+(list.length-5);b.appendChild(c)}
          b.addEventListener('click',function(){lightbox(list,n+1,b)});strip.appendChild(b)});
        frame.insertAdjacentElement('afterend',strip);
      }
      var p=item.querySelector('p');
      if(p&&p.scrollHeight>p.clientHeight+4){
        var mb=document.createElement('button');mb.type='button';mb.className='more';mb.textContent='Read more';mb.setAttribute('aria-expanded','false');
        mb.addEventListener('click',function(){var o=p.classList.toggle('open');mb.textContent=o?'Show less':'Read more';mb.setAttribute('aria-expanded',o)});
        p.insertAdjacentElement('afterend',mb);
      }
    }
  });
})();
