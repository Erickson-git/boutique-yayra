/* Badge « EN DIRECT » réel : s'affiche UNIQUEMENT quand la boutique a démarré
   un vrai live. L'état est lu en temps réel depuis Firebase (flux SSE de la
   Realtime Database). Aucune simulation : sans live actif, rien ne s'affiche. */
(function(){
  function livePath(){
    const p = location.pathname;
    return (p.indexOf('/client/') > -1 || p.indexOf('/admin/') > -1) ? '../live.html' : 'live.html';
  }
  function onLivePage(){ return /live\.html$/.test(location.pathname); }

  function setLive(on){
    let el = document.getElementById('liveFlag');
    if(on && !onLivePage()){
      if(!el){
        el = document.createElement('a');
        el.id = 'liveFlag';
        el.className = 'live-flag';
        el.href = livePath();
        el.setAttribute('aria-label', 'La boutique est en direct');
        el.innerHTML = '<span class="lf-dot"></span> EN DIRECT <span class="lf-go">Voir</span>';
        document.body.appendChild(el);
      }
    } else if(el){ el.remove(); }
  }

  function start(){
    if(!window.FIREBASE_READY){ setLive(false); return; }
    const base = window.FIREBASE_CONFIG.databaseURL.replace(/\/$/, '');
    const url = base + '/live/active.json';
    try{
      const es = new EventSource(url);
      const handle = (e)=>{
        try{ const d = JSON.parse(e.data); setLive(d && (d.data === true)); }
        catch(_){ /* ignore keep-alive */ }
      };
      es.addEventListener('put', handle);
      es.addEventListener('patch', handle);
      es.onerror = ()=>{ /* reconnexion auto par le navigateur */ };
    }catch(e){
      // Repli : lecture unique
      fetch(url).then(r=>r.json()).then(v=> setLive(v === true)).catch(()=>{});
    }
  }

  if(document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
