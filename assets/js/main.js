(function(){
  // Loader
  const loader = document.getElementById('loader');
  window.addEventListener('load', ()=>{ if(loader) loader.classList.add('hidden'); });
  // Filet de sécurité si 'load' tarde
  setTimeout(()=>{ if(loader) loader.classList.add('hidden'); }, 2600);

  // Menu mobile
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');
  if(menuToggle && navLinks){
    menuToggle.addEventListener('click', (e)=>{ e.stopPropagation(); navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> navLinks.classList.remove('open')));
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (e)=>{
      if(!navLinks.classList.contains('open')) return;
      if(e.target.closest('.nav-links') || e.target.closest('#menuToggle')) return;
      navLinks.classList.remove('open');
    });
  }

  // Navbar : ombre légère au scroll
  const navbar = document.getElementById('navbar');
  if(navbar){
    const onScroll = ()=>{ navbar.style.boxShadow = window.scrollY > 20 ? '0 10px 30px -18px rgba(60,40,15,.4)' : 'none'; };
    onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
  }

  // Révélation au scroll
  const reveals = document.querySelectorAll('[data-reveal]');
  if(reveals.length && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(el=> io.observe(el));
  } else {
    reveals.forEach(el=> el.classList.add('in'));
  }

  // Newsletter
  const newsletterForm = document.getElementById('newsletterForm');
  if(newsletterForm){
    newsletterForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const msg = document.getElementById('newsletterMsg');
      const fd = new FormData(newsletterForm);
      try{
        const res = await fetch('api/newsletter.php', {method:'POST', body:fd});
        const data = await res.json();
        if(msg) msg.textContent = data.message || 'Merci, vous êtes inscrite.';
        newsletterForm.reset();
      }catch(err){ if(msg) msg.textContent = 'Erreur réseau, réessayez.'; }
    });
  }

  // Compteur panier + animation d'ajout
  const cartCountEl = document.getElementById('cart-count');
  if(cartCountEl) cartCountEl.setAttribute('aria-live','polite');
  function bumpCart(delta = 1){
    if(!cartCountEl) return;
    const next = (parseInt(cartCountEl.textContent, 10) || 0) + delta;
    cartCountEl.textContent = next;
    cartCountEl.classList.add('bump');
    setTimeout(()=> cartCountEl.classList.remove('bump'), 440);
  }
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add-to-cart]');
    if(!btn) return;
    const qty = parseInt(btn.getAttribute('data-qty')||'1', 10);
    bumpCart(qty);
    btn.disabled = true; btn.classList.add('added');
    setTimeout(()=>{ btn.disabled = false; btn.classList.remove('added'); }, 800);
    try{
      const payload = new FormData();
      payload.append('id', btn.dataset.productId || '');
      payload.append('qty', qty);
      fetch('api/cart.php', {method:'POST', body:payload}).catch(()=>{});
    }catch(_){}
  });

  // Présentation vidéo (montage rapide de la boutique)
  const introBtn = document.getElementById('introBtn');
  const introLb = document.getElementById('introLb');
  if(introBtn && introLb){
    const v = document.getElementById('introVideo');
    const PLAYLIST = ['assets/images/video-05.mp4','assets/images/video-03.mp4','assets/images/video-09.mp4','assets/images/video-01.mp4'];
    let idx = 0;
    function playIdx(i){ idx = i; v.src = PLAYLIST[i % PLAYLIST.length]; v.currentTime = 0; v.play().catch(()=>{}); }
    function openIntro(){ introLb.classList.add('open'); document.body.style.overflow='hidden'; v.muted = false; playIdx(0); }
    function closeIntro(){ introLb.classList.remove('open'); document.body.style.overflow=''; try{ v.pause(); v.removeAttribute('src'); v.load(); }catch(e){} }
    introBtn.addEventListener('click', openIntro);
    document.getElementById('introClose').addEventListener('click', closeIntro);
    document.getElementById('introSkip').addEventListener('click', closeIntro);
    introLb.addEventListener('click', (e)=>{ if(e.target === introLb) closeIntro(); });
    v.addEventListener('ended', ()=>{ if(idx < PLAYLIST.length - 1) playIdx(idx + 1); else closeIntro(); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && introLb.classList.contains('open')) closeIntro(); });
  }

  /* Diaporama de l'image d'entête (accueil) : fondu enchaîné automatique. */
  (function(){
    var media = document.querySelector('.hero-media');
    if(!media) return;
    var slides = Array.prototype.slice.call(media.querySelectorAll('.hero-slide'));
    if(slides.length < 2) return;
    // Précharge les images suivantes (différées) pour une transition fluide.
    slides.forEach(function(img){ var ds = img.getAttribute('data-src'); if(ds){ var pre = new Image(); pre.src = ds; } });
    var i = 0;
    function show(n){
      slides[i].classList.remove('active');
      i = (n + slides.length) % slides.length;
      var img = slides[i];
      var ds = img.getAttribute('data-src');
      if(ds){ img.src = ds; img.removeAttribute('data-src'); }
      img.classList.add('active');
    }
    setInterval(function(){ show(i + 1); }, 10000);
  })();

  /* Bouton flottant pour descendre / remonter la page facilement.
     En haut de page : flèche bas -> descend. Après défilement : flèche haut -> remonte.
     Placé en bas à gauche (le bouton WhatsApp est en bas à droite). */
  (function(){
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'scroll-fab';
    btn.setAttribute('aria-label', 'Descendre la page');
    btn.innerHTML = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></svg>';
    function add(){
      if(!document.body) return;
      document.body.appendChild(btn);
      var goingUp = false;
      function maxScroll(){ var d = document.documentElement, b = document.body; return Math.max(d.scrollHeight, b.scrollHeight) - window.innerHeight; }
      function update(){
        var max = maxScroll();
        if(max < 120){ btn.classList.remove('show'); return; }
        btn.classList.add('show');
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        goingUp = y > window.innerHeight * 0.6;
        btn.classList.toggle('up', goingUp);
        btn.setAttribute('aria-label', goingUp ? 'Remonter en haut' : 'Descendre la page');
      }
      btn.addEventListener('click', function(){ window.scrollTo({ top: goingUp ? 0 : maxScroll(), behavior: 'smooth' }); });
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
    if(document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  })();
})();
