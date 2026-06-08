/* Galerie vidéos « reels » : aperçu muet au survol + lightbox avec son. */
(function(){
  function init(){
    const reels = Array.from(document.querySelectorAll('.reel'));
    if(!reels.length) return;

    const lb = document.getElementById('reelLightbox');
    const lbVideo = lb ? lb.querySelector('video') : null;
    let current = -1;

    // Aperçu muet au survol (desktop) ; sur mobile, l'IntersectionObserver gère la lecture.
    reels.forEach((reel, i)=>{
      const v = reel.querySelector('video');
      if(!v) return;
      reel.addEventListener('mouseenter', ()=>{ v.play().then(()=>reel.classList.add('playing')).catch(()=>{}); });
      reel.addEventListener('mouseleave', ()=>{ v.pause(); v.currentTime = 0; reel.classList.remove('playing'); });
      reel.addEventListener('click', ()=> openLightbox(i));
    });

    // Lecture auto à l'apparition (utile sur mobile sans survol)
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          const v = e.target.querySelector('video');
          if(!v) return;
          if(e.isIntersecting && e.intersectionRatio > 0.6){ v.play().catch(()=>{}); }
          else { v.pause(); }
        });
      }, {threshold:[0,0.6,1]});
      reels.forEach(r=> io.observe(r));
    }

    function srcOf(i){
      const v = reels[i] && reels[i].querySelector('video');
      return v ? (v.currentSrc || v.querySelector('source')?.src || v.src) : '';
    }

    function openLightbox(i){
      if(!lb || !lbVideo) return;
      current = i;
      lbVideo.src = srcOf(i);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbVideo.muted = false;
      lbVideo.play().catch(()=>{});
    }
    function closeLightbox(){
      if(!lb) return;
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if(lbVideo){ lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); }
    }
    function step(dir){
      if(current < 0) return;
      let n = (current + dir + reels.length) % reels.length;
      openLightbox(n);
    }

    if(lb){
      lb.querySelector('.reel-close')?.addEventListener('click', closeLightbox);
      lb.querySelector('.reel-nav.prev')?.addEventListener('click', ()=>step(-1));
      lb.querySelector('.reel-nav.next')?.addEventListener('click', ()=>step(1));
      lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLightbox(); });
      document.addEventListener('keydown', (e)=>{
        if(!lb.classList.contains('open')) return;
        if(e.key === 'Escape') closeLightbox();
        if(e.key === 'ArrowLeft') step(-1);
        if(e.key === 'ArrowRight') step(1);
      });
    }
  }

  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
