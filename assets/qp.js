/* Builds the page from content/site.json (edited in Pages CMS). */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id){return document.getElementById(id)}
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function src(p){return String(p||'').replace(/^\/+/,'')}
  function img(p,alt,lazy){var i=new Image();i.src=src(p);i.alt=alt||'';i.decoding='async';if(lazy)i.loading='lazy';return i}
  var io='IntersectionObserver' in window&&!reduce?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
  function rv(n){n.classList.add('rv');if(io)io.observe(n);else n.classList.add('in');return n}

  // viewer
  var LB=null,list=[],cur=0;
  function open(items,i){list=items;
    if(!LB){LB=el('div','lb');LB.setAttribute('role','dialog');LB.setAttribute('aria-modal','true');
      LB.innerHTML='<button class="x" aria-label="Close">✕</button><button class="nav p" aria-label="Previous">←</button><img alt=""><button class="nav n" aria-label="Next">→</button><p class="cap"></p>';
      document.body.appendChild(LB);
      LB.querySelector('.x').onclick=close;LB.querySelector('.p').onclick=function(){show(cur-1)};LB.querySelector('.n').onclick=function(){show(cur+1)};
      LB.onclick=function(e){if(e.target===LB)close()};
      var x0=null;LB.ontouchstart=function(e){x0=e.touches[0].clientX};LB.ontouchend=function(e){if(x0==null)return;var d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)show(cur+(d<0?1:-1));x0=null};
      document.addEventListener('keydown',function(e){if(!LB.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});}
    show(i);document.documentElement.style.overflow='hidden';LB.classList.add('on');LB.querySelector('.x').focus();}
  function show(i){cur=(i+list.length)%list.length;var p=list[cur],im=LB.querySelector('img');im.src=src(p.image);im.alt=p.alt||'';LB.querySelector('.cap').textContent=(cur+1)+' / '+list.length;}
  function close(){LB.classList.remove('on');document.documentElement.style.overflow='';}

  fetch('content/site.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(c){
    if(c.eyebrow)$('eyebrow').textContent=c.eyebrow;
    if(c.headline){var h=$('headline');h.textContent='';var w=c.headline.split(' ');var last=w.splice(-2).join(' ');h.appendChild(document.createTextNode(w.join(' ')+' '));h.appendChild(el('em',null,last));}
    $('intro').textContent=c.intro||'';
    var hf=$('heroFrames');(c.heroImages||[]).slice(0,3).forEach(function(p,i){var f=el('figure','f'+(i+1));f.appendChild(img(p,'',false));hf.appendChild(f)});
    if((c.heroImages||[]).length===3){var a=hf.children;hf.insertBefore(a[1],a[0]);a=hf.children;a[0].className='f1';a[1].className='f2';}
    var box=$('sections');
    (c.sections||[]).forEach(function(s){
      var sec=el('section','svc '+(s.id||''));sec.id=s.id||'';var inn=el('div','svc-in');sec.appendChild(inn);
      var hd=rv(el('div','svc-head'));var t=el('div');if(s.num)t.appendChild(el('span','svc-num',s.num+'.'));t.appendChild(el('h2',null,s.title));hd.appendChild(t);if(s.text)hd.appendChild(el('p',null,s.text));inn.appendChild(hd);
      var g=el('div','gal'),ph=(s.photos||[]).filter(function(p){return p.image}),FIRST=s.id==='events'?99:9;
      ph.forEach(function(p,i){var f=el('figure',i>=FIRST?'more':'');var im=img(p.image,p.alt,true);if(p.w&&p.h){im.width=p.w;im.height=p.h}f.appendChild(im);
        f.tabIndex=0;f.setAttribute('role','button');f.setAttribute('aria-label','View larger: '+(p.alt||s.title));
        var go=function(){open(ph,i)};f.onclick=go;f.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};
        g.appendChild(rv(f))});
      inn.appendChild(g);
      if(ph.length>FIRST){var b=el('button','gal-more','See all '+ph.length);b.type='button';b.onclick=function(){g.classList.add('open');b.remove()};inn.appendChild(b)}
      box.appendChild(sec);});
    $('pricingTitle').textContent=c.pricingTitle||'';$('pricingText').textContent=c.pricingText||'';
    var cards=$('cards');(c.prices||[]).forEach(function(p){var a=rv(el('a','card'));a.href='#book';
      a.appendChild(el('h3',null,p.title));a.appendChild(el('span','from',p.from||''));var pr=el('span','price',p.price);if(p.unit)pr.appendChild(el('small',null,p.unit));a.appendChild(pr);
      if(p.note)a.appendChild(el('span','note',p.note));a.appendChild(el('span','go','Book this →'));
      a.onclick=function(){var s=document.querySelector('#form select');Array.prototype.forEach.call(s.options,function(o){if(p.title.indexOf(o.value.split(' ')[0])===0)s.value=o.value})};
      cards.appendChild(a)});
    var fm=$('film');if(c.film&&c.film.video){var v=document.createElement('video');v.src=src(c.film.video);if(c.film.poster)v.poster=src(c.film.poster);v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('aria-label',c.film.alt||'Film');v.preload='metadata';fm.appendChild(v);
      if(!reduce&&'IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.3}).observe(v);}else fm.hidden=true;
    $('bookTitle').textContent=c.bookTitle||'';$('bookText').textContent=c.bookText||'';
    if(c.email){$('mailLink').textContent=c.email;$('mailLink').href='mailto:'+c.email;}
    $('footer').textContent=c.footer||'';if(c.commercialLink)$('commercial').href=c.commercialLink;
    window.__QP_EMAIL=c.email;
  }).catch(function(){});

  // booking form: sends to the email in content/site.json through FormSubmit
  var form=$('form'),msg=$('formMsg');
  form.addEventListener('submit',function(e){e.preventDefault();
    if(!form.checkValidity()){msg.className='form-msg err';msg.textContent='Please add your name, email and a short message.';form.reportValidity&&form.reportValidity();return}
    var d=new FormData(form);if(d.get('_honey'))return;
    var body={name:d.get('name'),email:d.get('email'),session:d.get('session'),date:d.get('date'),message:d.get('message'),_subject:'New booking inquiry: '+d.get('session')+' ('+d.get('name')+')',_replyto:d.get('email'),_template:'table',_captcha:'false'};
    var btn=form.querySelector('button');btn.disabled=true;msg.className='form-msg';msg.textContent='Sending…';
    fetch('https://formsubmit.co/ajax/'+(window.__QP_EMAIL||'volivaphoto@gmail.com'),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json()}).then(function(r){if(String(r.success)==='true'||r.success===true){msg.className='form-msg ok';msg.textContent='Thank you! I’ll be in touch soon.';form.reset()}else throw (r&&r.message)||0})
      .catch(function(why){var M=window.__QP_EMAIL||'volivaphoto@gmail.com';msg.className='form-msg err';if(why&&/activat/i.test(why)){msg.textContent='Almost set up: this form is waiting for activation. Please try again shortly, or email '+M+'.';return}msg.innerHTML=(typeof why==='string'&&why?why+' ':'Something went wrong. ')+'Please email <a href="mailto:'+(window.__QP_EMAIL||'volivaphoto@gmail.com')+'">'+(window.__QP_EMAIL||'volivaphoto@gmail.com')+'</a>.'})
      .then(function(){btn.disabled=false});
  });
})();
