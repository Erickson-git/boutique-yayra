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
})();
