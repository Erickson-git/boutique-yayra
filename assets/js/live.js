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
  const reactionsBar = document.getElementById('lvReactions');
  const title = document.getElementById('lvTitle');

  const HEART = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.6-9.3-8.5C1.2 8.6 2.6 5 6.2 5c2 0 3.2 1.2 3.8 2.2C10.6 6.2 11.8 5 13.8 5c3.6 0 5 3.6 3.5 6.5C19 15.4 12 20 12 20Z"/></svg>';
  const PLAY = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>';
  const CHAT = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z"/></svg>';
  const BAG = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>';
  const fmtK = (n)=> n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'k' : String(n);
  const esc = (s)=> String(s||'').replace(/[<>&"]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));

  let pc=null, viewerId=null, sigRef=null, commonOn=false, lastLikes=0, feedBuilt=false, mode='', discTimer=null, joinTimer=null, gotStream=false, audioArmed=true, kicked=false;
  let coPc=null, coStream=null;
  function viewerName(){ return (localStorage.getItem('yayra_live_name')||'').trim() || 'Invité'; }

  /* L'invité accepté publie SA caméra/micro vers l'animateur (qui compose la mosaïque) */
  async function startCohost(){
    if(coPc || !(window.LIVE && LIVE.ready) || !viewerId) return;
    try{
      coStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ideal:480}, height:{ideal:640} }, audio:{ echoCancellation:true, noiseSuppression:true, autoGainControl:true } });
    }catch(e){ try{ alert("Pour monter dans le direct, autorisez la caméra et le micro."); }catch(_){} return; }
    // On coupe le retour son du direct pour cet invité (évite l'écho de sa propre voix)
    audioArmed = false; if(remoteVideo) remoteVideo.muted = true; reflectMute();
    coPc = new RTCPeerConnection(LIVE.ICE);
    coStream.getTracks().forEach(t=> coPc.addTrack(t, coStream));
    const cref = LIVE.ref('live/cohostSignals/' + viewerId);
    coPc.onicecandidate = (e)=>{ if(e.candidate) cref.child('pubCandidates').push(e.candidate.toJSON()); };
    const pend=[]; let answered=false;
    cref.child('answer').on('value', async (s)=>{
      const a=s.val(); if(a && !(coPc.currentRemoteDescription && coPc.currentRemoteDescription.sdp)){
        try{ await coPc.setRemoteDescription(new RTCSessionDescription(a)); answered=true; while(pend.length) coPc.addIceCandidate(new RTCIceCandidate(pend.shift())).catch(()=>{}); }catch(e){}
      }
    });
    cref.child('subCandidates').on('child_added', (s)=>{ const c=s.val(); if(!c) return; if(answered && coPc.remoteDescription) coPc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{}); else pend.push(c); });
    try{ const offer = await coPc.createOffer(); await coPc.setLocalDescription(offer); cref.child('offer').set({ type:offer.type, sdp:offer.sdp }); }catch(e){}
    const jl=document.getElementById('joinLbl'); if(jl) jl.textContent = "À l'écran ✓";
  }
  function stopCohost(){
    if(coPc){ try{ coPc.close(); }catch(e){} coPc=null; }
    if(coStream){ coStream.getTracks().forEach(t=> t.stop()); coStream=null; }
    if(viewerId){ const cref=LIVE.ref('live/cohostSignals/'+viewerId); cref.off(); cref.remove(); }
  }

  function hideAllLive(){ remoteVideo.style.display='none'; liveInfo.style.display='none'; actions.style.display='none'; compose.style.display='none'; unmute.style.display='none'; chatBox.style.display='none'; if(reactionsBar) reactionsBar.style.display='none'; const sc=document.querySelector('.feed-soundcta'); if(sc) sc.style.display='none'; }

  function spawnHeart(host){
    host = host || heartsHost; if(!host) return;
    const h = document.createElement('div'); h.className='heart';
    h.style.setProperty('--dx', (((host.children.length*53)%80)-40)+'px');
    h.innerHTML = HEART; host.appendChild(h); setTimeout(()=>h.remove(), 2400);
  }
  function floatReaction(emoji){
    if(!heartsHost) return;
    const el = document.createElement('div'); el.className='reaction';
    el.textContent = emoji;
    el.style.setProperty('--dx', (((heartsHost.children.length*61)%120)-60)+'px');
    heartsHost.appendChild(el); setTimeout(()=> el.remove(), 2600);
  }
  function sendReaction(emoji){ if(window.LIVE && LIVE.ready) LIVE.ref('live/reactions').push({ e: emoji, ts: LIVE.now() }); else floatReaction(emoji); }
  async function doShare(){
    const data = { title:'YAYRA Nail Shop', text:'Découvre les vidéos de YAYRA Nail Shop', url: location.href };
    if(navigator.share){ try{ await navigator.share(data); return; }catch(e){ return; } }
    try{ await navigator.clipboard.writeText(location.href); alert('Lien copié !'); }
    catch(e){ window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + location.href), '_blank'); }
  }

  /* ---------------- FIL DE VIDÉOS / PHOTOS (pas de direct) ---------------- */
  const SND_ON  = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M16 9a4 4 0 0 1 0 6M19 7a8 8 0 0 1 0 10"/></svg>';
  const SND_OFF = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
  function isImageItem(v){ return v && (v.kind === 'image' || /\.(jpe?g|png|gif|webp)$/i.test(v.src||'') || /^data:image\//.test(v.src||'')); }
  // Lien hébergeur -> lecteur intégré (YouTube / Vimeo / Google Drive)
  function embedSrc(u){
    u = u || ''; let m;
    if((m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/)))
      return 'https://www.youtube.com/embed/' + m[1] + '?enablejsapi=1&autoplay=0&mute=1&loop=1&playlist=' + m[1] + '&controls=1&playsinline=1&rel=0&origin=' + encodeURIComponent(location.origin);
    if((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return 'https://player.vimeo.com/video/' + m[1] + '?autoplay=0&muted=1&loop=1';
    if((m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/)))
      return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    return null;
  }
  function feedItem(v, i){
    const img = isImageItem(v);
    const emb = (!img && !v.blob) ? embedSrc(v.src) : null;
    let media;
    if(img) media = '<img src="'+v.src+'" alt="'+esc(v.cap||'')+'" loading="lazy" />';
    else if(emb) media = '<iframe class="feed-embed" data-embed="'+emb+'" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    else if(v.blob) media = '<video data-blobid="'+(v._id||'')+'" muted loop playsinline preload="none"></video>';
    else media = '<video src="'+v.src+'" muted loop playsinline preload="metadata"></video>';
    const soundBtn = (img || emb) ? ''
      : '<button class="fa-btn" data-sound><span class="fa-ic">'+SND_OFF+'</span><span class="snd-lbl">Son</span></button>';
    return '<article class="feed-item">'
      + media
      + '<div class="feed-grad"></div>'
      + '<div class="hearts" data-hearts></div>'
      + '<div class="feed-overlay"><div class="feed-info">'
      +   '<div class="feed-handle"><span class="feed-ava">Y</span><span>YAYRA Nail Shop'+(v.tag?' <span style="opacity:.6">· '+esc(v.tag)+'</span>':'')+'</span></div>'
      +   '<div class="feed-caption">'+esc(v.cap||'')+'</div>'
      +   (v.link?'<a class="feed-cta" href="'+v.link+'">Voir</a>':'')
      + '</div><div class="feed-actions">'
      +   '<button class="fa-btn" data-like><span class="fa-ic">'+HEART+'</span><span class="like-count">'+(60+i*37%400)+'</span></button>'
      +   soundBtn
      +   '<button class="fa-btn" data-comment><span class="fa-ic">'+CHAT+'</span>Commenter</button>'
      +   '<button class="fa-btn" data-share><span class="fa-ic">'+PLAY+'</span>Partager</button>'
      +   '<a class="fa-btn" href="shop.html"><span class="fa-ic">'+BAG+'</span>Boutique</a>'
      + '</div></div></article>';
  }
  async function buildFeed(){
    const vids = (window.YAYRA_VIDEOS) ? await YAYRA_VIDEOS.all() : [];
    if(!vids.length){ showEmpty(); return false; }
    feed.innerHTML = vids.map(feedItem).join('');
    // Charge à la demande les petits clips importés (stockés à part pour ne pas alourdir le fil)
    function loadBlob(v){
      const bid = v.getAttribute && v.getAttribute('data-blobid');
      if(!bid || v.src || !(window.LIVE && LIVE.ready)) return Promise.resolve(false);
      return LIVE.ref('videoBlobs/'+bid).once('value').then(s=>{ const d=s.val(); if(d){ v.src = d; return true; } return false; }).catch(()=> false);
    }
    function playVid(v){ if(!v) return; const bid=v.getAttribute('data-blobid'); if(bid && !v.src){ loadBlob(v).then(ok=>{ if(ok) v.play().catch(()=>{}); }); } else v.play().catch(()=>{}); }

    /* Fenêtre glissante : on précharge la vidéo courante ± WINDOW (≈10 voisines)
       pour un défilement fluide, et on pilote lecture/son via l'API YouTube
       (postMessage) — sans recharger l'iframe. */
    const items = Array.from(feed.querySelectorAll('.feed-item'));
    const WINDOW = 5;
    let soundOn = false, current = -1;
    function ytCmd(f, func, args){ if(!f || !f.src || !f.contentWindow) return; try{ f.contentWindow.postMessage(JSON.stringify({ event:'command', func:func, args:args||[] }), '*'); }catch(e){} }
    function loadFrame(f){ if(f && !f.src){ const s=f.getAttribute('data-embed'); if(s) f.src=s; } }
    function unloadFrame(f){ if(f && f.src){ f.removeAttribute('src'); try{ f.src=''; }catch(e){} } }
    function applyWindow(idx){
      items.forEach((it, i)=>{ const f = it.querySelector('iframe[data-embed]'); if(!f) return; (Math.abs(i-idx) <= WINDOW) ? loadFrame(f) : unloadFrame(f); });
    }
    function setCurrent(idx){
      if(idx < 0 || idx >= items.length || idx === current) return;
      current = idx;
      applyWindow(idx);
      items.forEach((it, i)=>{
        const f = it.querySelector('iframe[data-embed]'); const v = it.querySelector('video');
        if(i === idx){
          if(f){ ytCmd(f,'playVideo'); ytCmd(f, soundOn?'unMute':'mute'); }
          if(v){ playVid(v); v.muted = !soundOn; }
        } else {
          if(f){ ytCmd(f,'pauseVideo'); ytCmd(f,'mute'); }
          if(v){ v.pause(); v.muted = true; }
        }
      });
      // Le lecteur peut ne pas être prêt tout de suite : on renvoie la commande
      [350,900,1800].forEach(d=> setTimeout(()=>{ if(current!==idx) return; const f=items[idx].querySelector('iframe[data-embed]'); if(f){ ytCmd(f,'playVideo'); ytCmd(f, soundOn?'unMute':'mute'); } }, d));
    }
    function applySound(){
      // le son suit la vidéo courante ; les autres restent muettes
      items.forEach((it, i)=>{
        const f = it.querySelector('iframe[data-embed]'); const v = it.querySelector('video');
        const on = soundOn && i === current;
        if(f){ ytCmd(f, on?'unMute':'mute'); if(on) ytCmd(f,'setVolume',[100]); }
        if(v){ v.muted = !on; if(on) v.play().catch(()=>{}); }
      });
    }
    function enableSound(){ if(soundOn) return; soundOn = true; hideSndCta(); applySound(); }
    // Bouton visible « activer le son » : un geste sur la PAGE est requis (les touches
    // sur la vidéo vont dans le lecteur YouTube et n'autorisent pas le son).
    let sndCta = null;
    function hideSndCta(){ if(sndCta){ sndCta.remove(); sndCta = null; } }
    function showSndCta(){
      if(soundOn || sndCta) return;
      sndCta = document.createElement('button');
      sndCta.className = 'feed-soundcta';
      sndCta.innerHTML = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M16 9a4 4 0 0 1 0 6M19 7a8 8 0 0 1 0 10"/></svg> Touchez pour le son';
      sndCta.addEventListener('click', (e)=>{ e.stopPropagation(); enableSound(); });
      document.body.appendChild(sndCta);
    }
    ['pointerdown','touchstart','click','keydown'].forEach(ev=> document.addEventListener(ev, enableSound, { passive:true }));
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ if(e.isIntersecting && e.intersectionRatio > 0.6){ const idx = items.indexOf(e.target); if(idx > -1) setCurrent(idx); } });
      }, {threshold:[0,0.6,1]});
      items.forEach(it=> io.observe(it));
    }
    setCurrent(0);
    if(feed.querySelector('iframe[data-embed], video')) showSndCta();
    // interactions
    feed.querySelectorAll('.feed-item').forEach(it=>{
      const v = it.querySelector('video');
      it.addEventListener('click', (ev)=>{ if(ev.target.closest('a,button')) return; if(!v) return; if(v.paused) v.play().catch(()=>{}); else v.pause(); });
    });
    feed.addEventListener('click', (e)=>{
      const like = e.target.closest('[data-like]');
      if(like){ like.classList.toggle('liked'); const c=like.querySelector('.like-count'); if(c) c.textContent=(parseInt(c.textContent,10)||0)+(like.classList.contains('liked')?1:-1); spawnHeart(like.closest('.feed-item').querySelector('[data-hearts]')); return; }
      const snd = e.target.closest('[data-sound]');
      if(snd){
        const item = snd.closest('.feed-item'); const vid = item.querySelector('video'); if(!vid) return;
        const turnOn = vid.muted;
        if(turnOn){ // couper le son des autres : une seule vidéo sonore à la fois
          feed.querySelectorAll('.feed-item video').forEach(o=>{ if(o!==vid) o.muted=true; });
          feed.querySelectorAll('[data-sound]').forEach(b=>{ if(b!==snd){ b.querySelector('.fa-ic').innerHTML=SND_OFF; const l=b.querySelector('.snd-lbl'); if(l) l.textContent='Son'; } });
        }
        vid.muted = !turnOn;
        if(!vid.muted) vid.play().catch(()=>{});
        snd.querySelector('.fa-ic').innerHTML = vid.muted ? SND_OFF : SND_ON;
        const lbl = snd.querySelector('.snd-lbl'); if(lbl) lbl.textContent = vid.muted ? 'Son' : 'Couper';
        return;
      }
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
    const sc=document.querySelector('.feed-soundcta'); if(sc) sc.style.display='';
    leaveLive();
  }
  function showEmpty(){ mode='empty'; hideAllLive(); feed.style.display='none'; empty.style.display='flex'; }

  /* ---------------- DIRECT RÉEL (WebRTC) ---------------- */
  function reflectMute(){
    const icon = document.getElementById('muteIcon'); const lbl = document.getElementById('muteLbl');
    if(!icon || !lbl) return;
    const m = remoteVideo.muted;
    lbl.textContent = m ? 'Activer' : 'Couper';
    icon.innerHTML = m
      ? '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/>'
      : '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M16 9a4 4 0 0 1 0 6M19 7a8 8 0 0 1 0 10"/>';
  }
  function tryPlay(){ audioArmed=true; remoteVideo.muted=true; const p=remoteVideo.play(); if(p) p.catch(()=>{}); unmute.style.display='flex'; reflectMute(); }
  unmute.addEventListener('click', ()=>{ audioArmed=false; remoteVideo.muted=false; remoteVideo.play().catch(()=>{}); unmute.style.display='none'; reflectMute(); });

  function appendMsg(name, text){ const el=document.createElement('div'); el.className='lv-msg'; el.innerHTML='<b>'+esc(name)+'</b> '+esc(text); chatBox.appendChild(el); while(chatBox.children.length>14) chatBox.removeChild(chatBox.firstChild); }
  function myName(){ let n=localStorage.getItem('yayra_live_name'); if(!n){ n=(prompt('Votre prénom pour le chat :')||'Invité').slice(0,20).trim()||'Invité'; localStorage.setItem('yayra_live_name', n); } return n; }

  function startCommon(){
    if(commonOn) return; commonOn=true;
    // Nombre de spectateurs affiché aux clientes : factice et toujours croissant
    let vStart=Date.now(), vBoost=0, vReal=0, vShown=0;
    function recountFake(){ const g=Math.floor((Date.now()-vStart)/7000); let v=vBoost+vReal+g; if(v<vShown) v=vShown; vShown=v; document.getElementById('lvCount').textContent=v.toLocaleString('fr-FR'); }
    LIVE.ref('live/startedAt').on('value', (s)=>{ const t=Number(s.val()); if(t) vStart=t; recountFake(); });
    LIVE.ref('live/boost').on('value', (s)=>{ vBoost=parseInt(s.val(),10)||0; recountFake(); });
    LIVE.ref('live/signals').on('value', (s)=>{ let c=0; s.forEach(ch=>{ if(ch.child('active').val()===true) c++; }); vReal=c; recountFake(); });
    setInterval(recountFake, 5000);
    LIVE.ref('live/chat').limitToLast(40).on('child_added', (s)=>{ const m=s.val(); if(m) appendMsg(m.n,m.t); });
    compose.addEventListener('submit', (e)=>{ e.preventDefault(); const i=document.getElementById('lvInput'); const t=i.value.trim(); if(!t) return; LIVE.ref('live/chat').push({n:myName(),t,ts:LIVE.now()}); i.value=''; });
    const likesRef = LIVE.ref('live/likes');
    likesRef.on('value', (s)=>{ lastLikes=s.val()||0; document.getElementById('likeCount').textContent=fmtK(lastLikes); });
    document.getElementById('likeBtn').addEventListener('click', ()=>{ likesRef.transaction(x=>(x||0)+1); document.getElementById('likeBtn').classList.add('liked'); sendReaction('❤️'); });
    document.getElementById('shareBtn').addEventListener('click', doShare);

    // Réactions emojis en temps réel (cœurs + emojis qui s'envolent pour tous)
    const joinTs = Date.now();
    LIVE.ref('live/reactions').limitToLast(20).on('child_added', (s)=>{
      const r = s.val(); if(r && r.e && (Number(r.ts)||0) >= joinTs - 6000) floatReaction(r.e);
    });
    reactionsBar.querySelectorAll('[data-emoji]').forEach(b=> b.addEventListener('click', ()=> sendReaction(b.getAttribute('data-emoji'))));

    // Couper / activer le son (côté spectateur)
    document.getElementById('muteBtn').addEventListener('click', ()=>{
      audioArmed = false; // l'utilisateur gère le son lui-même à partir d'ici
      remoteVideo.muted = !remoteVideo.muted;
      if(!remoteVideo.muted){ remoteVideo.play().catch(()=>{}); unmute.style.display='none'; }
      reflectMute();
    });

    // Le son s'active automatiquement au PREMIER contact n'importe où sur l'écran
    // (les navigateurs interdisent le son tant qu'il n'y a pas eu d'interaction).
    const unlockEvents = ['pointerdown','touchstart','click','keydown'];
    function unlockAudio(){
      if(!audioArmed) return;
      if(remoteVideo && remoteVideo.srcObject && remoteVideo.muted){
        remoteVideo.muted = false;
        remoteVideo.play().catch(()=>{});
        unmute.style.display = 'none';
        reflectMute();
        audioArmed = false;
      }
    }
    unlockEvents.forEach(ev=> document.addEventListener(ev, unlockAudio, { passive:true }));

    // Demander à monter dans le direct (l'animateur peut accepter jusqu'à 7 invités)
    const joinBtn = document.getElementById('joinBtn'); const joinLbl = document.getElementById('joinLbl');
    if(joinBtn) joinBtn.addEventListener('click', ()=>{
      if(!(window.LIVE && LIVE.ready) || !viewerId){ return; }
      const nm = myName();
      LIVE.ref('live/requests/'+viewerId).set({ name: nm, ts: LIVE.now() });
      joinBtn.classList.add('liked'); if(joinLbl) joinLbl.textContent = 'Demande envoyée';
    });
    reflectMute();
  }
  function onKicked(){
    if(kicked) return; kicked = true;
    stopCohost();
    leaveLive();
    try{ alert("Vous avez été retiré du direct par l'animateur."); }catch(e){}
    const jl = document.getElementById('joinLbl'); if(jl) jl.textContent = 'Rejoindre';
    showFeed();
  }
  function joinLive(){
    if(pc || kicked) return;
    const signals = LIVE.ref('live/signals');
    viewerId = signals.push().key; sigRef = signals.child(viewerId);
    sigRef.child('active').set(true); sigRef.child('name').set(viewerName()); sigRef.onDisconnect().remove();
    // L'animateur peut exclure ce participant, ou l'inviter à monter
    LIVE.ref('live/kick/'+viewerId).on('value', (s)=>{ if(s.val()) onKicked(); });
    LIVE.ref('live/cohosts/'+viewerId).on('value', (s)=>{
      const jl=document.getElementById('joinLbl'); const jb=document.getElementById('joinBtn');
      if(s.val()){ if(jb) jb.classList.add('liked'); startCohost(); }
      else { stopCohost(); if(jl) jl.textContent='Rejoindre'; if(jb) jb.classList.remove('liked'); }
    });
    pc = new RTCPeerConnection(LIVE.ICE);
    gotStream = false; title.textContent = 'Connexion au direct…';
    clearTimeout(joinTimer);
    joinTimer = setTimeout(()=>{ if(!gotStream && mode === 'live') rejoinLive(); }, 18000);
    pc.ontrack = (e)=>{ if(e.streams&&e.streams[0]){ gotStream=true; clearTimeout(joinTimer); title.textContent='Live'; remoteVideo.srcObject=e.streams[0]; tryPlay(); } };
    pc.onicecandidate = (e)=>{ if(e.candidate) sigRef.child('viewerCandidates').push(e.candidate.toJSON()); };
    pc.onconnectionstatechange = ()=>{
      const st = pc ? pc.connectionState : '';
      if(st === 'connected'){ clearTimeout(discTimer); title.textContent='Live'; }
      else if(st === 'failed'){ rejoinLive(); }
      else if(st === 'disconnected'){ title.textContent='Reconnexion…'; clearTimeout(discTimer); discTimer = setTimeout(()=>{ if(pc && pc.connectionState !== 'connected') rejoinLive(); }, 5000); }
    };
    const pending = []; let remoteReady = false;
    sigRef.child('offer').on('value', async (snap)=>{
      const offer = snap.val();
      if(!offer || (pc.currentRemoteDescription && pc.currentRemoteDescription.sdp)) return;
      try{
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        remoteReady = true;
        while(pending.length){ pc.addIceCandidate(new RTCIceCandidate(pending.shift())).catch(()=>{}); }
        const a = await pc.createAnswer(); await pc.setLocalDescription(a);
        sigRef.child('answer').set({ type:a.type, sdp:a.sdp });
      }catch(e){}
    });
    sigRef.child('hostCandidates').on('child_added', (snap)=>{
      const c = snap.val(); if(!c) return;
      if(remoteReady && pc.remoteDescription){ pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{}); }
      else { pending.push(c); }
    });
  }
  function rejoinLive(){
    if(mode !== 'live') return;
    title.textContent = 'Reconnexion…';
    leaveLive();
    setTimeout(()=>{ if(mode === 'live') joinLive(); }, 1000);
  }
  function leaveLive(){ clearTimeout(discTimer); clearTimeout(joinTimer); if(sigRef){ sigRef.off(); sigRef.remove(); sigRef=null; } if(pc){ try{pc.close();}catch(e){} pc=null; } if(remoteVideo) remoteVideo.srcObject=null; }
  function showLive(){
    if(kicked){ showFeed(); return; }
    if(mode==='live') return; mode='live';
    feed.style.display='none'; empty.style.display='none';
    remoteVideo.style.display='block'; liveInfo.style.display='inline-flex'; actions.style.display='flex'; compose.style.display='flex'; chatBox.style.display='flex'; reactionsBar.style.display='flex';
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
