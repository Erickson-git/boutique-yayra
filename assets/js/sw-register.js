/* Enregistre le service worker et applique automatiquement les mises à jour
   (nouvelle version installée → activée → page rechargée une fois). */
(function(){
  if(!('serviceWorker' in navigator)) return;
  var base = (location.hostname.indexOf('github.io') > -1) ? '/boutique-yayra/' : '/';

  window.addEventListener('load', function(){
    navigator.serviceWorker.register(base + 'sw.js', { scope: base }).then(function(reg){
      // Recherche périodique de mise à jour (toutes les heures + au focus)
      setInterval(function(){ reg.update().catch(function(){}); }, 60 * 60 * 1000);
      document.addEventListener('visibilitychange', function(){ if(!document.hidden) reg.update().catch(function(){}); });
      reg.addEventListener('updatefound', function(){
        var nw = reg.installing; if(!nw) return;
        nw.addEventListener('statechange', function(){
          if(nw.state === 'installed' && navigator.serviceWorker.controller){ nw.postMessage('skipWaiting'); }
        });
      });
    }).catch(function(){});

    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      if(refreshing) return; refreshing = true; window.location.reload();
    });
  });
})();
