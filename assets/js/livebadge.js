/* Badge « EN DIRECT » flottant : visible sur tout le site quand la boutique
   est en live. Le propriétaire active/désactive depuis son espace.
   État stocké dans localStorage ('yayra_live_on'). Actif par défaut. */
(function(){
  function isOn(){ return localStorage.getItem('yayra_live_on') !== '0'; }
  function livePath(){
    const p = location.pathname;
    return (p.indexOf('/client/') > -1 || p.indexOf('/admin/') > -1) ? '../live.html' : 'live.html';
  }
  function onLivePage(){ return /live\.html$/.test(location.pathname); }

  function render(){
    let el = document.getElementById('liveFlag');
    if(isOn() && !onLivePage()){
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

  window.YAYRA_LIVE = {
    isOn,
    on(){ localStorage.setItem('yayra_live_on','1'); render(); },
    off(){ localStorage.setItem('yayra_live_on','0'); render(); },
    toggle(){ localStorage.setItem('yayra_live_on', isOn() ? '0' : '1'); render(); return isOn(); }
  };

  if(document.readyState !== 'loading') render();
  else document.addEventListener('DOMContentLoaded', render);
})();
