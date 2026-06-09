/* Cœur du live : init Firebase + configuration WebRTC (STUN/TURN) + helpers.
   Aucune simulation. Si Firebase n'est pas configuré, ready = false. */
window.LIVE = (function(){
  // Serveurs ICE : STUN Google + TURN gratuit (Open Relay) pour traverser les NAT.
  const ICE = { iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
  ]};
  let db = null, ready = false;

  function init(){
    if(ready) return true;
    if(!window.FIREBASE_READY || typeof firebase === 'undefined') return false;
    try{
      if(!firebase.apps || !firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      db = firebase.database();
      ready = true;
    }catch(e){ ready = false; }
    return ready;
  }
  function ref(path){ return db ? db.ref(path) : null; }
  function now(){ return (firebase && firebase.database && firebase.database.ServerValue) ? firebase.database.ServerValue.TIMESTAMP : Date.now(); }

  return { ICE, init, ref, now, get db(){ return db; }, get ready(){ return ready; } };
})();
