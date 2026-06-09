/* Spectateur du live (WebRTC réel via Firebase). Aucune simulation :
   - regarde le vrai flux caméra de la boutique,
   - vrai chat partagé en temps réel,
   - vrais cœurs / compteur de spectateurs. */
(function(){
  const remoteVideo = document.getElementById('remoteVideo');
  const empty = document.getElementById('lvEmpty');
  const top = document.getElementById('lvTop');
  const actions = document.getElementById('lvActions');
  const compose = document.getElementById('lvCompose');
  const unmute = document.getElementById('lvUnmute');
  const chatBox = document.getElementById('lvChat');
  const heartsHost = document.getElementById('hearts');

  const HEART = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.6-9.3-8.5C1.2 8.6 2.6 5 6.2 5c2 0 3.2 1.2 3.8 2.2C10.6 6.2 11.8 5 13.8 5c3.6 0 5 3.6 3.5 6.5C19 15.4 12 20 12 20Z"/></svg>';
  const fmtK = (n)=> n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'k' : String(n);

  let pc = null, viewerId = null, sigRef = null, commonOn = false, lastLikes = 0;

  function showEmpty(title, text){
    empty.style.display = 'flex';
    if(title) document.getElementById('lvEmptyTitle').textContent = title;
    if(text) document.getElementById('lvEmptyText').textContent = text;
    top.style.display = actions.style.display = compose.style.display = 'none';
  }
  function showLive(){
    empty.style.display = 'none';
    top.style.display = 'flex';
    actions.style.display = compose.style.display = 'flex';
  }

  function spawnHeart(){
    if(!heartsHost) return;
    const h = document.createElement('div');
    h.className = 'heart';
    h.style.setProperty('--dx', (((heartsHost.children.length*53)%80) - 40) + 'px');
    h.innerHTML = HEART;
    heartsHost.appendChild(h);
    setTimeout(()=> h.remove(), 2400);
  }

  function tryPlay(){
    remoteVideo.muted = true;
    const p = remoteVideo.play();
    if(p) p.catch(()=>{});
    unmute.style.display = 'flex';
  }
  unmute.addEventListener('click', ()=>{
    remoteVideo.muted = false;
    remoteVideo.play().catch(()=>{});
    unmute.style.display = 'none';
  });

  function appendMsg(name, text){
    const el = document.createElement('div');
    el.className = 'lv-msg';
    el.innerHTML = '<b>' + escapeHtml(name) + '</b> ' + escapeHtml(text);
    chatBox.appendChild(el);
    while(chatBox.children.length > 14) chatBox.removeChild(chatBox.firstChild);
  }
  function escapeHtml(s){ return String(s||'').replace(/[<>&"]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }

  function myName(){
    let n = localStorage.getItem('yayra_live_name');
    if(!n){ n = (prompt('Votre prénom pour le chat :') || 'Invité').slice(0,20).trim() || 'Invité'; localStorage.setItem('yayra_live_name', n); }
    return n;
  }

  function startCommon(){
    if(commonOn) return; commonOn = true;

    // Spectateurs
    LIVE.ref('live/signals').on('value', (s)=>{
      let c = 0; s.forEach(ch=>{ if(ch.child('active').val() === true) c++; });
      document.getElementById('lvCount').textContent = c;
    });

    // Chat temps réel
    LIVE.ref('live/chat').limitToLast(40).on('child_added', (s)=>{
      const m = s.val(); if(m) appendMsg(m.n, m.t);
    });
    compose.addEventListener('submit', (e)=>{
      e.preventDefault();
      const input = document.getElementById('lvInput');
      const text = input.value.trim(); if(!text) return;
      LIVE.ref('live/chat').push({ n: myName(), t: text, ts: LIVE.now() });
      input.value = '';
    });

    // Likes / cœurs réels
    const likesRef = LIVE.ref('live/likes');
    likesRef.on('value', (s)=>{
      const v = s.val() || 0;
      if(v > lastLikes){ for(let i=0;i<Math.min(4, v-lastLikes);i++) spawnHeart(); }
      lastLikes = v;
      document.getElementById('likeCount').textContent = fmtK(v);
    });
    document.getElementById('likeBtn').addEventListener('click', ()=>{
      likesRef.transaction(x => (x||0) + 1);
      document.getElementById('likeBtn').classList.add('liked');
    });

    // Partage réel
    document.getElementById('shareBtn').addEventListener('click', async ()=>{
      const data = { title:'Live YAYRA Nail Shop', text:'La boutique est en direct ! Rejoins le live.', url: location.href };
      if(navigator.share){ try{ await navigator.share(data); return; }catch(e){ return; } }
      try{ await navigator.clipboard.writeText(location.href); alert('Lien copié !'); }
      catch(e){ window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + location.href), '_blank'); }
    });
  }

  function join(){
    if(pc) return;
    const signals = LIVE.ref('live/signals');
    viewerId = signals.push().key;
    sigRef = signals.child(viewerId);
    sigRef.child('active').set(true);
    sigRef.onDisconnect().remove();

    pc = new RTCPeerConnection(LIVE.ICE);
    pc.ontrack = (e)=>{ if(e.streams && e.streams[0]){ remoteVideo.srcObject = e.streams[0]; tryPlay(); } };
    pc.onicecandidate = (e)=>{ if(e.candidate) sigRef.child('viewerCandidates').push(e.candidate.toJSON()); };

    sigRef.child('offer').on('value', async (snap)=>{
      const offer = snap.val();
      if(!offer || (pc.currentRemoteDescription && pc.currentRemoteDescription.sdp)) return;
      try{
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sigRef.child('answer').set({ type: answer.type, sdp: answer.sdp });
      }catch(err){}
    });
    sigRef.child('hostCandidates').on('child_added', (snap)=>{
      const c = snap.val(); if(c) pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{});
    });
  }
  function leave(){
    if(sigRef){ sigRef.off(); sigRef.remove(); sigRef = null; }
    if(pc){ try{ pc.close(); }catch(e){} pc = null; }
    if(remoteVideo) remoteVideo.srcObject = null;
  }
  window.addEventListener('beforeunload', leave);

  // ---- Démarrage ----
  if(!window.FIREBASE_READY){
    showEmpty('Live bientôt disponible', "Le live n'est pas encore configuré. Reviens très vite : la boutique pourra diffuser en direct depuis sa caméra.");
    return;
  }
  if(!LIVE.init()){
    showEmpty('Live indisponible', 'Impossible de se connecter au service de live pour le moment.');
    return;
  }
  showEmpty();
  LIVE.ref('live/active').on('value', (snap)=>{
    if(snap.val() === true){ showLive(); startCommon(); join(); }
    else { showEmpty('Aucun live en cours'); leave(); }
  });
})();
