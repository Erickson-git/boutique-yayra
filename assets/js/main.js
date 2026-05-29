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
      navLinks.style.background = 'rgba(9,9,16,.92)';
      navLinks.style.border = '1px solid rgba(255,255,255,.12)';
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
})();

