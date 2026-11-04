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
  // home: setup vs light painting slider
  document.querySelectorAll('[data-compare]').forEach(function(c){
    var r=c.querySelector('.compare-range');
    r.addEventListener('input',function(){c.style.setProperty('--pos',r.value+'%')});
  });
  // gallery cards: Before toggle, expand caption, lightbox
  document.querySelectorAll('.portfolio-item').forEach(function(item){
    var frame=item.querySelector('.frame'),img=frame&&frame.querySelector('img'),setup=item.getAttribute('data-setup');
    if(!img)return;
    var after=img.getAttribute('src');
    if(setup){
      var b=document.createElement('button');b.type='button';b.className='toggle-before';b.textContent='Before';b.setAttribute('aria-pressed','false');
      b.addEventListener('click',function(e){e.stopPropagation();var on=b.getAttribute('aria-pressed')!=='true';
        b.setAttribute('aria-pressed',on);img.src=on?setup:after;b.textContent=on?'After':'Before'});
      frame.appendChild(b);
    }
    if(document.body.classList.contains('gallery')){
      var z=document.createElement('button');z.type='button';z.className='zoom';z.setAttribute('aria-label','View larger: '+(img.alt||''));
      z.addEventListener('click',function(){
        var lb=document.createElement('div');lb.className='lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
        lb.innerHTML='<img alt=""><button type="button">Close</button>';lb.querySelector('img').src=img.src;lb.querySelector('img').alt=img.alt;
        function close(){lb.remove();document.removeEventListener('keydown',k);z.focus()}
        function k(e){if(e.key==='Escape')close()}
        lb.addEventListener('click',close);document.addEventListener('keydown',k);document.body.appendChild(lb);lb.querySelector('button').focus();
      });
      frame.insertBefore(z,frame.firstChild);
      var p=item.querySelector('p');if(p)p.addEventListener('click',function(){p.classList.toggle('open')});
    }
  });
})();
