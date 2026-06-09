/* Page Live : soit un VRAI direct (WebRTC via Firebase), soit — quand aucun
   direct n'est en cours — un FIL DE VIDÉOS vertical (style réseaux sociaux).
   Aucune simulation de direct. */
(function(){
  const remoteVideo = document.getElementById('remoteVideo');
  const empty = document.getElementById('lvEmpty');
  const feed = document.getElementById('lvFeed');
  const liveInfo = document.getElementById('lvLiveInfo');
  const actions = document.getElementById('lvActions');
  const compose = document.getElementById('lvCompose');
  const unmute = document.getElementById('lvUnmute');
  const chatBox = document.getElementById('lvChat');
  const heartsHost = document.getElementById('hearts');
  const title = document.getElementById('lvTitle');

  const HEART = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.6-9.3-8.5C1.2 8.6 2.6 5 6.2 5c2 0 3.2 1.2 3.8 2.2C10.6 6.2 11.8 5 13.8 5c3.6 0 5 3.6 3.5 6.5C19 15.4 12 20 12 20Z"/></svg>';
  const PLAY = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>';
  const CHAT = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z"/></svg>';
  const BAG = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>';
  const fmtK = (n)=> n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'k' : String(n);
  const esc = (s)=> String(s||'').replace(/[<>&"]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));

  let pc=null, viewerId=null, sigRef=null, commonOn=false, lastLikes=0, feedBuilt=false, mode='';

  function hideAllLive(){ remoteVideo.style.display='none'; liveInfo.style.display='none'; actions.style.display='none'; compose.style.display='none'; unmute.style.display='none'; chatBox.style.display='none'; }

  function spawnHeart(host){
    host = host || heartsHost; if(!host) return;
    const h = document.createElement('div'); h.className='heart';
    h.style.setProperty('--dx', (((host.children.length*53)%80)-40)+'px');
    h.innerHTML = HEART; host.appendChild(h); setTimeout(()=>h.remove(), 2400);
  }
  async function doShare(){
    const data = { title:'YAYRA Nail Shop', text:'Découvre les vidéos de YAYRA Nail Shop', url: location.href };
    if(navigator.share){ try{ await navigator.share(data); return; }catch(e){ return; } }
    try{ await navigator.clipboard.writeText(location.href); alert('Lien copié !'); }
    catch(e){ window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + location.href), '_blank'); }
  }

  /* ---------------- FIL DE VIDÉOS (pas de direct) ---------------- */
  function feedItem(v, i){
    return '<article class="feed-item">'
      + '<video src="'+v.src+'" muted loop playsinline preload="metadata"></video>'
      + '<div class="feed-grad"></div>'
      + '<div class="hearts" data-hearts></div>'
      + '<div class="feed-overlay"><div class="feed-info">'
      +   '<div class="feed-handle"><span class="feed-ava">Y</span><span>YAYRA Nail Shop'+(v.tag?' <span style="opacity:.6">· '+esc(v.tag)+'</span>':'')+'</span></div>'
      +   '<div class="feed-caption">'+esc(v.cap||'')+'</div>'
      +   (v.link?'<a class="feed-cta" href="'+v.link+'">Voir</a>':'')
      + '</div><div class="feed-actions">'
      +   '<button class="fa-btn" data-like><span class="fa-ic">'+HEART+'</span><span class="like-count">'+(60+i*37%400)+'</span></button>'
      +   '<button class="fa-btn" data-comment><span class="fa-ic">'+CHAT+'</span>Commenter</button>'
      +   '<button class="fa-btn" data-share><span class="fa-ic">'+PLAY+'</span>Partager</button>'
      +   '<a class="fa-btn" href="shop.html"><span class="fa-ic">'+BAG+'</span>Boutique</a>'
      + '</div></div></article>';
  }
  async function buildFeed(){
    const vids = (window.YAYRA_VIDEOS) ? await YAYRA_VIDEOS.all() : [];
    if(!vids.length){ showEmpty(); return false; }
    feed.innerHTML = vids.map(feedItem).join('');
    // lecture auto de l'élément visible
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ const v=e.target.querySelector('video'); if(!v) return; if(e.isIntersecting && e.intersectionRatio>0.6) v.play().catch(()=>{}); else v.pause(); });
      }, {threshold:[0,0.6,1]});
      feed.querySelectorAll('.feed-item').forEach(it=> io.observe(it));
    }
    const first = feed.querySelector('video'); if(first) first.play().catch(()=>{});
    // interactions
    feed.querySelectorAll('.feed-item').forEach(it=>{
      const v = it.querySelector('video');
      it.addEventListener('click', (ev)=>{ if(ev.target.closest('a,button')) return; if(v.paused) v.play().catch(()=>{}); else v.pause(); });
    });
    feed.addEventListener('click', (e)=>{
      const like = e.target.closest('[data-like]');
      if(like){ like.classList.toggle('liked'); const c=like.querySelector('.like-count'); if(c) c.textContent=(parseInt(c.textContent,10)||0)+(like.classList.contains('liked')?1:-1); spawnHeart(like.closest('.feed-item').querySelector('[data-hearts]')); return; }
      if(e.target.closest('[data-comment]')){ window.open('https://wa.me/22897498685?text=Bonjour+YAYRA+!+J%27ai+vu+vos+vid%C3%A9os.','_blank'); return; }
      if(e.target.closest('[data-share]')){ doShare(); return; }
    });
    return true;
  }
  async function showFeed(){
    if(mode==='feed') return; mode='feed';
    hideAllLive(); empty.style.display='none';
    title.textContent = 'Vidéos';
    if(!feedBuilt){ feedBuilt = await buildFeed(); }
    feed.style.display = 'block';
    leaveLive();
  }
  function showEmpty(){ mode='empty'; hideAllLive(); feed.style.display='none'; empty.style.display='flex'; }

  /* ---------------- DIRECT RÉEL (WebRTC) ---------------- */
  function tryPlay(){ remoteVideo.muted=true; const p=remoteVideo.play(); if(p) p.catch(()=>{}); unmute.style.display='flex'; }
  unmute.addEventListener('click', ()=>{ remoteVideo.muted=false; remoteVideo.play().catch(()=>{}); unmute.style.display='none'; });

  function appendMsg(name, text){ const el=document.createElement('div'); el.className='lv-msg'; el.innerHTML='<b>'+esc(name)+'</b> '+esc(text); chatBox.appendChild(el); while(chatBox.children.length>14) chatBox.removeChild(chatBox.firstChild); }
  function myName(){ let n=localStorage.getItem('yayra_live_name'); if(!n){ n=(prompt('Votre prénom pour le chat :')||'Invité').slice(0,20).trim()||'Invité'; localStorage.setItem('yayra_live_name', n); } return n; }

  function startCommon(){
    if(commonOn) return; commonOn=true;
    LIVE.ref('live/signals').on('value', (s)=>{ let c=0; s.forEach(ch=>{ if(ch.child('active').val()===true) c++; }); document.getElementById('lvCount').textContent=c; });
    LIVE.ref('live/chat').limitToLast(40).on('child_added', (s)=>{ const m=s.val(); if(m) appendMsg(m.n,m.t); });
    compose.addEventListener('submit', (e)=>{ e.preventDefault(); const i=document.getElementById('lvInput'); const t=i.value.trim(); if(!t) return; LIVE.ref('live/chat').push({n:myName(),t,ts:LIVE.now()}); i.value=''; });
    const likesRef = LIVE.ref('live/likes');
    likesRef.on('value', (s)=>{ const v=s.val()||0; if(v>lastLikes){ for(let i=0;i<Math.min(4,v-lastLikes);i++) spawnHeart(); } lastLikes=v; document.getElementById('likeCount').textContent=fmtK(v); });
    document.getElementById('likeBtn').addEventListener('click', ()=>{ likesRef.transaction(x=>(x||0)+1); document.getElementById('likeBtn').classList.add('liked'); });
    document.getElementById('shareBtn').addEventListener('click', doShare);
  }
  function joinLive(){
    if(pc) return;
    const signals = LIVE.ref('live/signals');
    viewerId = signals.push().key; sigRef = signals.child(viewerId);
    sigRef.child('active').set(true); sigRef.onDisconnect().remove();
    pc = new RTCPeerConnection(LIVE.ICE);
    pc.ontrack = (e)=>{ if(e.streams&&e.streams[0]){ remoteVideo.srcObject=e.streams[0]; tryPlay(); } };
    pc.onicecandidate = (e)=>{ if(e.candidate) sigRef.child('viewerCandidates').push(e.candidate.toJSON()); };
    sigRef.child('offer').on('value', async (snap)=>{ const offer=snap.val(); if(!offer||(pc.currentRemoteDescription&&pc.currentRemoteDescription.sdp)) return; try{ await pc.setRemoteDescription(new RTCSessionDescription(offer)); const a=await pc.createAnswer(); await pc.setLocalDescription(a); sigRef.child('answer').set({type:a.type,sdp:a.sdp}); }catch(e){} });
    sigRef.child('hostCandidates').on('child_added', (snap)=>{ const c=snap.val(); if(c) pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{}); });
  }
  function leaveLive(){ if(sigRef){ sigRef.off(); sigRef.remove(); sigRef=null; } if(pc){ try{pc.close();}catch(e){} pc=null; } remoteVideo.srcObject=null; }
  function showLive(){
    if(mode==='live') return; mode='live';
    feed.style.display='none'; empty.style.display='none';
    remoteVideo.style.display='block'; liveInfo.style.display='inline-flex'; actions.style.display='flex'; compose.style.display='flex'; chatBox.style.display='flex';
    title.textContent='Live';
    startCommon(); joinLive();
  }
  window.addEventListener('beforeunload', leaveLive);

  /* ---------------- Démarrage ---------------- */
  if(window.FIREBASE_READY && LIVE.init()){
    LIVE.ref('live/active').on('value', (snap)=>{ if(snap.val()===true){ showLive(); } else { showFeed(); } });
  } else {
    // Pas de direct possible sans config : on montre quand même le fil de vidéos.
    showFeed();
  }
})();
