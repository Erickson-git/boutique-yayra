/* Cœur du live : init Firebase + configuration WebRTC (STUN/TURN) + helpers.
   Aucune simulation. Si Firebase n'est pas configuré, ready = false. */
window.LIVE = (function(){
  // Serveurs ICE : STUN Google + TURN gratuit (Open Relay) pour traverser les NAT.
  const ICE = {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302','stun:stun.cloudflare.com:3478'] },
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turns:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
    ],
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceCandidatePoolSize: 4
  };
  // Débit/résolution recommandés pour un réseau mobile (réduit la latence et les coupures)
  const VIDEO_CONSTRAINTS = { width: { ideal: 640, max: 854 }, height: { ideal: 480, max: 480 }, frameRate: { ideal: 24, max: 30 } };
  const MAX_BITRATE = 450 * 1000; // ~450 kbps par spectateur
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

  return { ICE, VIDEO_CONSTRAINTS, MAX_BITRATE, init, ref, now, get db(){ return db; }, get ready(){ return ready; } };
})();
