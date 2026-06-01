(function(){
  const loader = document.getElementById('loader');
  window.addEventListener('load', ()=>{ if(loader) loader.classList.add('hidden'); });

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');
  if(menuToggle && navLinks){
    menuToggle.addEventListener('click', ()=>{
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '60px';
      navLinks.style.right = '18px';
      navLinks.style.background = 'var(--glass)';
      navLinks.style.border = '1px solid rgba(17,18,23,.08)';
      navLinks.style.padding = '12px';
      navLinks.style.borderRadius = '16px';
      navLinks.style.width = '220px';
      navLinks.style.gap = '10px';
      navLinks.style.zIndex = '60';
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if(newsletterForm){
    newsletterForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const msg = document.getElementById('newsletterMsg');
      const fd = new FormData(newsletterForm);
      try{
        const res = await fetch('api/newsletter.php', {method:'POST', body:fd});
        const data = await res.json();
        if(msg) msg.textContent = data.message || 'Merci !';
        newsletterForm.reset();
      }catch(err){
        if(msg) msg.textContent = 'Erreur réseau.';
      }
    });
  }
  
  // Cart micro-interactions: delegate add-to-cart buttons, bump counter
  const cartCountEl = document.getElementById('cart-count');
  if(cartCountEl){
    cartCountEl.setAttribute('aria-live','polite');
  }

  function bumpCart(delta = 1){
    if(!cartCountEl) return;
    const current = parseInt(cartCountEl.textContent, 10) || 0;
    const next = current + delta;
    cartCountEl.textContent = next;
    cartCountEl.classList.add('bump');
    setTimeout(()=> cartCountEl.classList.remove('bump'), 420);
  }

  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add-to-cart]');
    if(!btn) return;
    // optimistic UI: bump counter and animate button
    const qty = parseInt(btn.getAttribute('data-qty')||'1', 10);
    bumpCart(qty);
    btn.disabled = true;
    btn.classList.add('added');
    setTimeout(()=>{ btn.disabled = false; btn.classList.remove('added'); }, 700);

    // Fire a background request to add to server-side cart (best-effort)
    try{
      const payload = new FormData();
      payload.append('id', btn.dataset.productId || '');
      payload.append('qty', qty);
      fetch('api/cart.php', {method:'POST', body:payload}).catch(()=>{});
    }catch(_){ /* ignore */ }
  });
})();

