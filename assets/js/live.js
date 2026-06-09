/* Flux vidéo plein écran « Live » (style TikTok) : lecture au scroll,
   like + cœurs, partage (Web Share API), commentaires en direct simulés. */
(function(){
  const ACTIONS = `
    <button class="fa-btn" data-like><span class="fa-ic"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.6-9.3-8.5C1.2 8.6 2.6 5 6.2 5c2 0 3.2 1.2 3.8 2.2C10.6 6.2 11.8 5 13.8 5c3.6 0 5 3.6 3.5 6.5C19 15.4 12 20 12 20Z"/></svg></span><span class="like-count">0</span></button>
    <button class="fa-btn" data-comment><span class="fa-ic"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z"/></svg></span>Commenter</button>
    <button class="fa-btn" data-share data-title="YAYRA Nail Shop"><span class="fa-ic"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg></span>Partager</button>
    <a class="fa-btn" href="shop.html"><span class="fa-ic"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg></span>Boutique</a>`;

  const HEART_SVG = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.6-9.3-8.5C1.2 8.6 2.6 5 6.2 5c2 0 3.2 1.2 3.8 2.2C10.6 6.2 11.8 5 13.8 5c3.6 0 5 3.6 3.5 6.5C19 15.4 12 20 12 20Z"/></svg>';

  function init(){
    // Remplir les colonnes d'actions des items non-live
    document.querySelectorAll('[data-actions]').forEach(el=>{ el.innerHTML = ACTIONS; });

    // Compteurs de likes aléatoires-déterministes
    document.querySelectorAll('.feed-item:not([data-live]) .like-count').forEach((el,i)=>{ el.textContent = (60 + i*37 % 400); });

    // Lecture du bon item au scroll
    const items = Array.from(document.querySelectorAll('.feed-item'));
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          const v = e.target.querySelector('video');
          if(!v) return;
          if(e.isIntersecting && e.intersectionRatio > 0.6){ v.play().catch(()=>{}); }
          else { v.pause(); }
        });
      }, {threshold:[0,0.6,1]});
      items.forEach(it=> io.observe(it));
    }
    // Démarre la 1re vidéo
    const first = items[0] && items[0].querySelector('video');
    if(first) first.play().catch(()=>{});

    // Tap sur la vidéo : play/pause
    items.forEach(it=>{
      const v = it.querySelector('video');
      it.addEventListener('click', (ev)=>{
        if(ev.target.closest('.feed-actions') || ev.target.closest('.feed-cta') || ev.target.closest('a,button')) return;
        if(v.paused) v.play().catch(()=>{}); else v.pause();
      });
    });

    // Like + cœurs
    document.addEventListener('click', (e)=>{
      const like = e.target.closest('[data-like]');
      if(like){
        like.classList.toggle('liked');
        const c = like.querySelector('.like-count');
        if(c && !/k/.test(c.textContent)){ c.textContent = (parseInt(c.textContent,10)||0) + (like.classList.contains('liked')?1:-1); }
        const item = like.closest('.feed-item');
        spawnHeart(item);
        return;
      }
      const comment = e.target.closest('[data-comment]');
      if(comment){ window.open('https://wa.me/22897498685?text=Bonjour+YAYRA+!+Je+regarde+vos+vid%C3%A9os.', '_blank'); return; }
      const share = e.target.closest('[data-share]');
      if(share){ doShare(share.getAttribute('data-title') || 'YAYRA Nail Shop'); return; }
    });

    startLive();
  }

  function spawnHeart(item){
    const host = (item && item.querySelector('.hearts')) || document.getElementById('hearts');
    if(!host) return;
    const h = document.createElement('div');
    h.className = 'heart';
    h.style.setProperty('--dx', (Math.round((item ? 1 : 1) * (( (host.children.length*53)%80) - 40)) ) + 'px');
    h.innerHTML = HEART_SVG;
    host.appendChild(h);
    setTimeout(()=> h.remove(), 2400);
  }

  async function doShare(title){
    const url = location.href;
    const text = 'Découvrez YAYRA Nail Shop — cosmétiques, onglerie & mobilier pro à Lomé.';
    if(navigator.share){
      try{ await navigator.share({ title, text, url }); return; }catch(e){ /* annulé */ return; }
    }
    // Repli : copier le lien, sinon WhatsApp
    try{
      await navigator.clipboard.writeText(url);
      alert('Lien copié ! Partagez-le où vous voulez.');
    }catch(e){
      window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank');
    }
  }

  // Simulation du direct : commentaires + spectateurs + cœurs
  function startLive(){
    const box = document.getElementById('liveComments');
    const viewers = document.getElementById('viewers');
    const heartsHost = document.getElementById('hearts');
    if(!box) return;
    const NAMES = ['Akossiwa','Fatou','Edem','Dovi','Aminata','Sandra','Inès','Kafui','Mariam','Bella','Sylvie','Grace'];
    const MSGS = ['Magnifique !','Le prix svp ?','J’adore cette couleur','Vous livrez à Agoè ?','Trop belle la table','Je commande demain','Superbe travail','Disponible en stock ?','Vous êtes les meilleurs','C’est combien le kit ?','Waouh 😍 oups… très joli !','Bonsoir YAYRA'];
    let i = 0;
    function addComment(){
      const n = NAMES[(i*7) % NAMES.length];
      const m = MSGS[(i*5) % MSGS.length].replace('😍','');
      const c = document.createElement('div');
      c.className = 'live-c';
      c.innerHTML = '<b>' + n + '</b> ' + m;
      box.appendChild(c);
      while(box.children.length > 4) box.removeChild(box.firstChild);
      i++;
    }
    addComment(); addComment();
    setInterval(addComment, 2600);

    if(viewers){
      let base = 1248;
      setInterval(()=>{ base += ((Date.now()/1000|0) % 7) - 3; if(base < 800) base = 900; viewers.textContent = base.toLocaleString('fr-FR'); }, 3000);
    }
    if(heartsHost){
      const liveItem = document.querySelector('.feed-item[data-live]');
      setInterval(()=>{ spawnHeart(liveItem); }, 1400);
    }
  }

  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
