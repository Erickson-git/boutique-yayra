/* Chat client + AGENT automatique.
   Le visiteur écrit à la boutique. Si la boutique (admin) ne répond pas dans les
   5 minutes, un agent répond automatiquement (base de connaissances : livraison,
   prix, paiement, commande, adresses…). Messages stockés dans Firebase (REST)
   pour que l'admin les voie et réponde. Fonctionne sur toutes les pages client. */
(function(){
  if(/\/admin\//.test(location.pathname)) return;            // pas de widget en admin
  const DB = (window.FIREBASE_CONFIG && FIREBASE_CONFIG.databaseURL) ? FIREBASE_CONFIG.databaseURL.replace(/\/$/, '') : '';
  const WA = 'https://wa.me/22897498685?text=' + encodeURIComponent('Bonjour YAYRA !');
  const DELAY = 2 * 60 * 1000;                                 // 2 minutes

  function norm(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
  function botReply(text){
    const t = norm(text);
    if(/bonjour|bonsoir|salut|cc|hello|coucou/.test(t)) return "Bonjour et bienvenue chez YAYRA Nail Shop ! Comment puis-je vous aider ? (livraison, prix, commande, adresses…)";
    if(/livr|deliver|delai|recevoir|24h|domicile/.test(t)) return "Nous livrons à Lomé sous 24h, paiement à la livraison. Indiquez-nous votre quartier et le produit souhaité, on s'occupe du reste !";
    if(/prix|cout|coute|combien|tarif|fcfa/.test(t)) return "Les prix sont affichés sur chaque produit dans la boutique (en FCFA, livrés à Lomé). Dites-moi quel article vous intéresse, je vous donne le prix.";
    if(/paie|payer|paiement|espece|cash|mobile money|momo|flooz|tmoney/.test(t)) return "Le paiement se fait à la livraison : espèces ou mobile money (Flooz / T-Money). Vous ne payez qu'à la réception. 👍";
    if(/heure|horaire|ouvert|ferme|ouvre|dispo/.test(t)) return "Vous pouvez commander à tout moment sur le site ; nous vous rappelons rapidement pour confirmer la livraison.";
    if(/adresse|ou ete|ou etes|localis|boutique|magasin|trouver|situe/.test(t)) return "Nous sommes à Lomé (Togo) — voir la page « Adresses ». Nous livrons aussi à domicile partout à Lomé.";
    if(/command|acheter|comment|panier|reserver/.test(t)) return "Pour commander : ajoutez vos produits au panier puis validez (paiement à la livraison). Nous vous rappelons pour confirmer. Besoin d'aide pour un produit ?";
    if(/direct|live|video|promo|nouveau/.test(t)) return "Retrouvez nos directs, vidéos et nouveautés sur la page « Live » ! De belles promos vous y attendent. ✨";
    if(/ongle|vernis|manucure|gel|capsule/.test(t)) return "Côté onglerie nous avons vernis, gels, capsules, kits et accessoires. Quel type de produit cherchez-vous ?";
    if(/merci|super|parfait|ok|d'accord|dacord/.test(t)) return "Avec plaisir ! 💖 N'hésitez pas si vous avez d'autres questions.";
    return "Merci pour votre message ! 💖 Un conseiller YAYRA vous répond dès que possible. Pour une réponse immédiate, écrivez-nous sur WhatsApp.";
  }

  let tid = localStorage.getItem('yayra_chat_id');
  if(!tid){ tid = 'C' + Date.now() + Math.floor((window.performance && performance.now ? performance.now()*1000 : Math.floor(Date.now()%99999)) % 100000); localStorage.setItem('yayra_chat_id', tid); }
  let cname = localStorage.getItem('yayra_chat_name') || '';
  let msgs = {}, botTimer = null, pollTimer = null, open = false, greeted = false;

  function vals(){ return Object.keys(msgs).map(k=> msgs[k]).filter(Boolean).sort((a,b)=> (a.ts||0)-(b.ts||0)); }
  function lastClientTs(){ let t=0; vals().forEach(m=>{ if(m.from==='client' && (m.ts||0)>t) t=m.ts; }); return t; }
  function lastClientMsg(){ let m=null; vals().forEach(x=>{ if(x.from==='client'){ if(!m || x.ts>m.ts) m=x; } }); return m; }
  function hasReplyAfter(ts){ return vals().some(m=> (m.from==='shop'||m.from==='bot') && (m.ts||0) > ts); }

  function post(msg){
    if(!DB){ const id='l'+msg.ts; msgs[id]=msg; render(); return Promise.resolve(); }
    return fetch(DB + '/chats/' + tid + '/messages.json', { method:'POST', body: JSON.stringify(msg) })
      .then(()=> fetch(DB + '/chats/' + tid + '/meta.json', { method:'PATCH', body: JSON.stringify({ name: cname||'Visiteur', lastTs: msg.ts, lastText: String(msg.text).slice(0,90), lastFrom: msg.from }) }))
      .catch(()=>{});
  }
  function load(){
    if(!DB){ render(); checkBot(); return Promise.resolve(); }
    return fetch(DB + '/chats/' + tid + '/messages.json').then(r=>r.json()).then(v=>{ msgs = v || {}; render(); checkBot(); }).catch(()=>{});
  }

  function checkBot(){
    const lc = lastClientTs();
    clearTimeout(botTimer);
    if(!lc || hasReplyAfter(lc)) return;
    const wait = Math.max(0, DELAY - (Date.now() - lc));
    botTimer = setTimeout(fireBot, wait);
  }
  function fireBot(){
    const go = ()=>{ const lc = lastClientTs(); if(lc && !hasReplyAfter(lc)){ const m = lastClientMsg(); post({ from:'bot', text: botReply(m ? m.text : ''), ts: Date.now() }).then(load); } };
    if(DB){ fetch(DB + '/chats/' + tid + '/messages.json').then(r=>r.json()).then(v=>{ msgs = v || {}; go(); }).catch(go); }
    else go();
  }

  function send(text){
    text = String(text||'').trim(); if(!text) return;
    if(!cname){ cname = (prompt('Votre prénom (pour vous recontacter) :')||'').trim() || 'Visiteur'; localStorage.setItem('yayra_chat_name', cname); }
    post({ from:'client', text: text, name: cname, ts: Date.now() }).then(load);
    msgs['t'+Date.now()] = { from:'client', text: text, ts: Date.now() }; render(); // affichage immédiat
    checkBot();
  }

  /* ---------------- UI ---------------- */
  function style(){
    if(document.getElementById('ya-chat-css')) return;
    const s = document.createElement('style'); s.id='ya-chat-css';
    s.textContent = `
.ya-chat-btn{position:fixed; right:22px; bottom:90px; z-index:1400; width:56px; height:56px; border-radius:50%; border:0; cursor:pointer;
  background:linear-gradient(135deg,#d9b25a,#b8893a); color:#1a1208; box-shadow:0 10px 28px rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center}
.ya-chat-btn svg{width:26px; height:26px; stroke:currentColor; fill:none; stroke-width:1.8}
.ya-chat-btn .ya-chat-dot{position:absolute; top:-2px; right:-2px; width:16px; height:16px; border-radius:50%; background:#e23744; border:2px solid #fff}
.ya-chat-panel{position:fixed; right:18px; bottom:158px; z-index:1401; width:340px; max-width:calc(100vw - 28px); height:460px; max-height:calc(100vh - 190px);
  background:#fff; border-radius:18px; box-shadow:0 24px 70px rgba(0,0,0,.4); display:none; flex-direction:column; overflow:hidden; font-family:var(--sans,system-ui)}
.ya-chat-panel.open{display:flex}
.ya-chat-head{background:linear-gradient(135deg,#1c140b,#2a1f12); color:#f3ead9; padding:14px 16px; display:flex; align-items:center; gap:10px}
.ya-chat-head .ya-ava{width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#d9b25a,#b8893a); color:#1a1208; display:flex; align-items:center; justify-content:center; font-weight:700; font-family:var(--serif,serif)}
.ya-chat-head b{font-size:15px; display:block}
.ya-chat-head span{font-size:11.5px; opacity:.7}
.ya-chat-x{margin-left:auto; background:transparent; border:0; color:inherit; font-size:22px; cursor:pointer; opacity:.8}
.ya-chat-body{flex:1; overflow-y:auto; padding:14px; background:#f7f2ea; display:flex; flex-direction:column; gap:8px}
.ya-msg{max-width:82%; padding:9px 13px; border-radius:14px; font-size:14px; line-height:1.45; white-space:pre-wrap; word-wrap:break-word}
.ya-msg.client{align-self:flex-end; background:linear-gradient(135deg,#d9b25a,#b8893a); color:#1a1208; border-bottom-right-radius:4px}
.ya-msg.shop,.ya-msg.bot{align-self:flex-start; background:#fff; color:#241a10; border:1px solid #ece3d4; border-bottom-left-radius:4px}
.ya-msg .ya-who{display:block; font-size:10.5px; opacity:.6; margin-bottom:2px}
.ya-chat-foot{display:flex; gap:8px; padding:10px; border-top:1px solid #ece3d4; background:#fff}
.ya-chat-foot input{flex:1; border:1px solid #e2d6c2; border-radius:999px; padding:10px 14px; font-size:14px; outline:none; color:#241a10}
.ya-chat-foot button{border:0; background:linear-gradient(135deg,#d9b25a,#b8893a); color:#1a1208; border-radius:50%; width:40px; height:40px; cursor:pointer; flex:0 0 auto; display:flex; align-items:center; justify-content:center}
.ya-chat-foot button svg{width:20px; height:20px; stroke:currentColor; fill:none; stroke-width:1.8}
.ya-chat-wa{display:block; text-align:center; font-size:12px; color:#1a7f4b; padding:6px; text-decoration:none; background:#eafaf0}
@media(max-width:520px){ .ya-chat-panel{right:10px; left:10px; width:auto; bottom:150px} .ya-chat-btn{right:16px; bottom:84px} }
`;
    document.head.appendChild(s);
  }

  let elBody=null, elBtn=null, elPanel=null, elDot=null;
  function render(){
    if(!elBody) return;
    const list = vals();
    elBody.innerHTML = '';
    if(!list.length){
      const w = document.createElement('div'); w.className='ya-msg bot';
      w.innerHTML = '<span class="ya-who">YAYRA Nail Shop</span>Bonjour 👋 Bienvenue ! Posez votre question (livraison, prix, commande…). Notre équipe vous répond, et en moins de 2 min un assistant vous aide automatiquement.';
      elBody.appendChild(w);
    }
    list.forEach(m=>{
      const d = document.createElement('div'); d.className = 'ya-msg ' + (m.from||'shop');
      const who = m.from==='client' ? '' : (m.from==='bot' ? 'Assistant YAYRA' : 'YAYRA Nail Shop');
      d.innerHTML = (who ? '<span class="ya-who">'+who+'</span>' : '') + esc(m.text);
      elBody.appendChild(d);
    });
    elBody.scrollTop = elBody.scrollHeight;
    // pastille « non lu » sur le bouton si réponse boutique/bot et panneau fermé
    const lc = lastClientTs();
    if(elDot) elDot.style.display = (!open && hasReplyAfter(lc) && list.length) ? '' : 'none';
  }
  function esc(s){ return String(s||'').replace(/[<>&]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }

  function openPanel(){ open=true; elPanel.classList.add('open'); if(elDot) elDot.style.display='none'; load(); startPoll(); }
  function closePanel(){ open=false; elPanel.classList.remove('open'); stopPoll(); }
  function startPoll(){ stopPoll(); if(DB) pollTimer = setInterval(load, 4000); }
  function stopPoll(){ if(pollTimer){ clearInterval(pollTimer); pollTimer=null; } }

  function init(){
    style();
    elBtn = document.createElement('button'); elBtn.className='ya-chat-btn'; elBtn.setAttribute('aria-label','Discuter');
    elBtn.innerHTML = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z"/></svg><span class="ya-chat-dot" style="display:none"></span>';
    elDot = elBtn.querySelector('.ya-chat-dot');

    elPanel = document.createElement('div'); elPanel.className='ya-chat-panel';
    elPanel.innerHTML =
      '<div class="ya-chat-head"><span class="ya-ava">Y</span><div><b>YAYRA Nail Shop</b><span>Réponse rapide · assistant 24/7</span></div><button class="ya-chat-x" aria-label="Fermer">&times;</button></div>'
      + '<div class="ya-chat-body"></div>'
      + '<a class="ya-chat-wa" href="'+WA+'" target="_blank" rel="noopener">Répondre plus vite sur WhatsApp</a>'
      + '<form class="ya-chat-foot"><input type="text" placeholder="Écrivez votre message…" autocomplete="off" /><button type="submit" aria-label="Envoyer"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg></button></form>';
    document.body.appendChild(elBtn); document.body.appendChild(elPanel);
    elBody = elPanel.querySelector('.ya-chat-body');

    elBtn.addEventListener('click', ()=>{ open ? closePanel() : openPanel(); });
    elPanel.querySelector('.ya-chat-x').addEventListener('click', closePanel);
    elPanel.querySelector('form').addEventListener('submit', (e)=>{ e.preventDefault(); const i=elPanel.querySelector('input'); send(i.value); i.value=''; });

    load(); // charge l'historique + (re)programme l'agent même panneau fermé
  }
  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
