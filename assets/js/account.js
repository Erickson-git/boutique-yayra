/* Badge de profil global + installation de l'application.
   - Quand un compte est connecté : avatar (photo de profil) dans un coin en
     haut, menu déroulant (Mon espace, Changer la photo, Modifier le nom pour les
     clientes, Installer l'application, Se déconnecter).
   - Pour tout le monde : entrée « Installer l'application » dans le menu de
     navigation (PWA).
   Auto-injecté sur toutes les pages, sans dépendance (lit le localStorage). */
(function(){
  const ROLE_LABELS = { admin:'Administrateur', manager:'Gérant', vendeur:'Vendeur', client:'Cliente' };

  // ---- Installation PWA ---------------------------------------------------
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferredPrompt = e; maybeBanner(); });
  window.addEventListener('appinstalled', function(){ deferredPrompt = null; hideBanner(); });
  function isInstalled(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function isIOS(){
    const ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function iconPath(){ return paths().base + 'assets/icons/icon-192.png'; }

  // iOS ignore les icônes SVG et n'ouvre l'app en plein écran que si ces balises
  // sont présentes. On les injecte sur toutes les pages au chargement.
  function injectAppleMeta(){
    const base = paths().base;
    const metas = [
      ['meta', { name:'apple-mobile-web-app-capable', content:'yes' }],
      ['meta', { name:'mobile-web-app-capable', content:'yes' }],
      ['meta', { name:'apple-mobile-web-app-status-bar-style', content:'default' }],
      ['meta', { name:'apple-mobile-web-app-title', content:'YAYRA Nail Shop' }]
    ];
    metas.forEach(function(m){
      if(document.querySelector('meta[name="'+m[1].name+'"]')) return;
      const el = document.createElement('meta'); el.setAttribute('name', m[1].name); el.setAttribute('content', m[1].content);
      document.head.appendChild(el);
    });
    // Icône Apple en PNG (iOS ignore le SVG -> sinon icône blanche sur l'écran d'accueil)
    if(!document.querySelector('link[rel="apple-touch-icon"][href*=".png"]')){
      const l = document.createElement('link'); l.rel='apple-touch-icon'; l.setAttribute('sizes','180x180');
      l.href = base + 'assets/icons/apple-touch-icon.png'; document.head.appendChild(l);
    }
  }

  // Installation en un clic (Android/ordinateur) sinon fenêtre guidée (iOS)
  function installApp(){
    if(deferredPrompt){
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function(){ deferredPrompt = null; hideBanner(); });
      return;
    }
    openInstallModal();
  }

  function openInstallModal(){
    style();
    let m = document.getElementById('ya-im');
    if(m){ m.classList.add('open'); return; }
    m = document.createElement('div'); m.id = 'ya-im'; m.className = 'ya-im open';
    const ios = isIOS();
    const ua = navigator.userAgent || '';
    const iosNotSafari = ios && /(CriOS|FxiOS|EdgiOS|OPiOS|GSA)/.test(ua);
    const safariNote = iosNotSafari
      ? '<li style="color:#e8a13a;"><b>Important :</b> ouvrez d\'abord ce site dans <b>Safari</b> (l\'ajout à l\'écran d\'accueil n\'existe que dans Safari sur iPhone).</li>'
      : '';
    const steps = ios
      ? '<ol class="ya-im-steps">'
        + safariNote
        + '<li>Touchez le bouton <b>Partager</b> <span class="ya-im-ic"><svg viewBox="0 0 24 24"><path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg></span> en bas de Safari.</li>'
        + '<li>Faites défiler et choisissez <b>« Sur l\'écran d\'accueil »</b> <span class="ya-im-ic"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg></span>.</li>'
        + '<li>Touchez <b>Ajouter</b>. L\'application YAYRA apparaît sur votre écran d\'accueil.</li>'
        + '</ol>'
      : '<ol class="ya-im-steps">'
        + '<li>Ouvrez le menu <b>⋮</b> du navigateur (en haut à droite).</li>'
        + '<li>Touchez <b>« Installer l\'application »</b> ou <b>« Ajouter à l\'écran d\'accueil »</b>.</li>'
        + '<li>Confirmez. Sur ordinateur, utilisez l\'icône d\'installation dans la barre d\'adresse.</li>'
        + '</ol>';
    m.innerHTML =
      '<div class="ya-im-card" role="dialog" aria-modal="true">'
      + '<button class="ya-im-close" aria-label="Fermer">&times;</button>'
      + '<img class="ya-im-logo" src="'+ iconPath() +'" alt="YAYRA">'
      + '<h3>Installer l\'application YAYRA</h3>'
      + '<p class="ya-im-sub">Accès rapide depuis votre écran d\'accueil, même hors connexion.</p>'
      + (deferredPrompt ? '<button class="ya-im-go" data-go>Installer maintenant</button>' : '')
      + steps
      + '</div>';
    document.body.appendChild(m);
    function close(){ m.classList.remove('open'); }
    m.querySelector('.ya-im-close').addEventListener('click', close);
    m.addEventListener('click', function(e){ if(e.target === m) close(); });
    const go = m.querySelector('[data-go]');
    if(go) go.addEventListener('click', function(){ close(); installApp(); });
  }

  // Bannière d'invitation à installer (une seule fois, non intrusive)
  function maybeBanner(){
    if(isInstalled()) return;
    if(localStorage.getItem('yayra_install_dismiss') === '1') return;
    if(!deferredPrompt && !isIOS()) return; // rien à proposer sur ce navigateur
    if(document.getElementById('ya-ib')) return;
    style();
    const b = document.createElement('div'); b.id = 'ya-ib'; b.className = 'ya-ib';
    b.innerHTML =
      '<img src="'+ iconPath() +'" alt="">'
      + '<div class="ya-ib-txt"><b>Installer l\'application YAYRA</b><span>Un accès direct, comme une vraie appli.</span></div>'
      + '<button class="ya-ib-go" data-install>Installer</button>'
      + '<button class="ya-ib-x" aria-label="Fermer">&times;</button>';
    document.body.appendChild(b);
    requestAnimationFrame(function(){ b.classList.add('show'); });
    b.querySelector('[data-install]').addEventListener('click', installApp);
    b.querySelector('.ya-ib-x').addEventListener('click', function(){ localStorage.setItem('yayra_install_dismiss','1'); hideBanner(); });
  }
  function hideBanner(){ const b = document.getElementById('ya-ib'); if(b) b.remove(); }

  function paths(){
    const p = location.pathname;
    const sub = (p.indexOf('/client/') > -1 || p.indexOf('/admin/') > -1);
    const base = sub ? '../' : '';
    return { base, home: base + 'index.html', login: base + 'client/login.html' };
  }
  function readJSON(k){ try{ return JSON.parse(localStorage.getItem(k) || 'null'); }catch(e){ return null; } }

  function currentUser(){
    const token = localStorage.getItem('yayra_token');
    if(!token) return null;
    const role = localStorage.getItem('yayra_role') || 'client';
    const staff = readJSON('yayra_staff_session');
    const client = readJSON('yayra_client_session');
    const sess = staff || client || {};
    const space = ['admin','manager','vendeur'].indexOf(role) > -1
      ? paths().base + 'admin/index.html'
      : paths().base + 'client/dashboard.html';
    return {
      name: sess.name || sess.username || 'Mon compte',
      email: sess.email || '',
      role, roleLabel: ROLE_LABELS[role] || role,
      isClient: role === 'client',
      space,
      avatar: localStorage.getItem('yayra_avatar') || ''
    };
  }

  function initials(name){
    return (name||'?').trim().split(/\s+/).slice(0,2).map(w=> w[0]||'').join('').toUpperCase() || '?';
  }

  // Met à jour le nom de la cliente (session + enregistrement du compte)
  function renameClient(newName){
    newName = (newName||'').trim();
    if(!newName) return false;
    const sess = readJSON('yayra_client_session') || {};
    sess.name = newName;
    localStorage.setItem('yayra_client_session', JSON.stringify(sess));
    try{
      const KEY = 'yayra_clients_v1';
      const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      const i = arr.findIndex(function(c){ return c.email === sess.email; });
      if(i > -1){ arr[i].name = newName; localStorage.setItem(KEY, JSON.stringify(arr)); }
    }catch(e){}
    return true;
  }

  function logout(){
    ['yayra_token','yayra_role','yayra_avatar','yayra_staff_session','yayra_client_session','yayra_last_user']
      .forEach(function(k){ localStorage.removeItem(k); });
    if(window.YAYRA_STAFF && YAYRA_STAFF.clearSession) try{ YAYRA_STAFF.clearSession(); }catch(e){}
    if(window.YAYRA_CLIENTS && YAYRA_CLIENTS.clearSession) try{ YAYRA_CLIENTS.clearSession(); }catch(e){}
    window.location.href = paths().home;
  }

  // Réduit l'image choisie à 200px max et la stocke en dataURL (évite de saturer le localStorage)
  function setAvatarFromFile(file, onDone){
    const reader = new FileReader();
    reader.onload = function(){
      const img = new Image();
      img.onload = function(){
        const max = 200, scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width*scale), h = Math.round(img.height*scale);
        const c = document.createElement('canvas'); c.width=w; c.height=h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        try{ localStorage.setItem('yayra_avatar', c.toDataURL('image/jpeg', 0.85)); }catch(e){}
        onDone && onDone();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function style(){
    if(document.getElementById('ya-acc-style')) return;
    const s = document.createElement('style');
    s.id = 'ya-acc-style';
    s.textContent = `
.ya-acc{position:relative; z-index:60}
.ya-acc-av{width:40px; height:40px; border-radius:50%; border:2px solid var(--gold,#c9a24b); background:var(--bg-2,#241a10); color:var(--gold,#c9a24b);
  font:600 14px/1 var(--sans,system-ui); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; padding:0; flex:0 0 auto}
.ya-acc-av img{width:100%; height:100%; object-fit:cover; display:block}
.ya-acc-fixed{position:fixed; top:14px; right:16px; z-index:1200}
.ya-acc-menu{position:absolute; top:calc(100% + 10px); right:0; min-width:214px; background:var(--bg,#1c140b); color:var(--ink,#f3ead9);
  border:1px solid var(--line-2,rgba(201,162,75,.3)); border-radius:14px; box-shadow:0 18px 50px rgba(0,0,0,.45); padding:8px; display:none}
.ya-acc-menu.open{display:block}
.ya-acc-head{padding:10px 12px 12px; border-bottom:1px solid var(--line-2,rgba(201,162,75,.25)); margin-bottom:6px}
.ya-acc-head b{display:block; font-size:14.5px}
.ya-acc-head span{display:block; font-size:12px; opacity:.7; margin-top:2px}
.ya-acc-item{display:flex; align-items:center; gap:10px; width:100%; text-align:left; background:transparent; border:0; color:inherit;
  font:500 14px var(--sans,system-ui); padding:10px 12px; border-radius:9px; cursor:pointer; text-decoration:none}
.ya-acc-item:hover{background:var(--bg-2,rgba(201,162,75,.12))}
.ya-acc-item svg{width:17px; height:17px; flex:0 0 auto; stroke:currentColor; fill:none; stroke-width:1.7}
.ya-acc-item.danger{color:#e8717a}
.nav-install-link{display:inline-flex; align-items:center; gap:7px}
.nav-install-link svg{width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:1.7; vertical-align:middle}
.ya-im{position:fixed; inset:0; z-index:3000; display:none; align-items:center; justify-content:center; background:rgba(8,6,3,.86); backdrop-filter:blur(4px); padding:18px}
.ya-im.open{display:flex}
.ya-im-card{position:relative; width:100%; max-width:380px; background:var(--bg,#1c140b); color:var(--ink,#f3ead9); border:1px solid var(--line-2,rgba(201,162,75,.32)); border-radius:18px; padding:26px 22px; text-align:center; box-shadow:0 24px 70px rgba(0,0,0,.5)}
.ya-im-close{position:absolute; top:10px; right:12px; background:transparent; border:0; color:inherit; font-size:26px; line-height:1; cursor:pointer; opacity:.7}
.ya-im-logo{width:74px; height:74px; border-radius:18px; margin:0 auto 12px; display:block; box-shadow:0 8px 24px rgba(0,0,0,.4)}
.ya-im-card h3{margin:0 0 6px; font-family:var(--serif,serif); font-size:22px}
.ya-im-sub{margin:0 0 16px; font-size:13.5px; opacity:.8}
.ya-im-go{display:block; width:100%; background:linear-gradient(135deg,#d9b25a,#b8893a); color:#1a1208; border:0; border-radius:12px; padding:13px; font-weight:700; font-size:15px; cursor:pointer; margin-bottom:16px}
.ya-im-steps{text-align:left; margin:0; padding-left:20px; font-size:13.5px; line-height:1.7}
.ya-im-steps li{margin-bottom:8px}
.ya-im-ic{display:inline-flex; vertical-align:middle; width:22px; height:22px; border:1px solid var(--line-2,rgba(201,162,75,.4)); border-radius:6px; padding:2px; margin:0 2px}
.ya-im-ic svg{width:100%; height:100%; stroke:var(--gold,#c9a24b); fill:none; stroke-width:1.7}
.ya-ib{position:fixed; left:12px; right:12px; bottom:12px; z-index:1500; display:flex; align-items:center; gap:12px; background:var(--bg,#1c140b); color:var(--ink,#f3ead9); border:1px solid var(--line-2,rgba(201,162,75,.32)); border-radius:14px; padding:10px 12px; box-shadow:0 14px 44px rgba(0,0,0,.45); transform:translateY(140%); transition:transform .35s cubic-bezier(.2,.8,.2,1); max-width:460px; margin:0 auto}
.ya-ib.show{transform:translateY(0)}
.ya-ib img{width:42px; height:42px; border-radius:10px; flex:0 0 auto}
.ya-ib-txt{flex:1; min-width:0; line-height:1.3}
.ya-ib-txt b{display:block; font-size:14px}
.ya-ib-txt span{font-size:12px; opacity:.75}
.ya-ib-go{background:linear-gradient(135deg,#d9b25a,#b8893a); color:#1a1208; border:0; border-radius:9px; padding:9px 14px; font-weight:700; font-size:13px; cursor:pointer; flex:0 0 auto}
.ya-ib-x{background:transparent; border:0; color:inherit; font-size:22px; line-height:1; cursor:pointer; opacity:.6; flex:0 0 auto}
`;
    document.head.appendChild(s);
  }

  const ICON_INSTALL = '<svg viewBox="0 0 24 24"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M5 21h14"/></svg>';

  function buildMenu(u){
    const m = document.createElement('div');
    m.className = 'ya-acc-menu';
    let html =
      '<div class="ya-acc-head"><b>'+ u.name +'</b><span>'+ u.roleLabel + (u.email ? ' · '+u.email : '') +'</span></div>'
      + '<a class="ya-acc-item" href="'+ u.space +'"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg> Mon espace</a>'
      + '<button class="ya-acc-item" type="button" data-photo><svg viewBox="0 0 24 24"><path d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.2"/></svg> Changer la photo</button>';
    if(u.isClient){
      html += '<button class="ya-acc-item" type="button" data-rename><svg viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg> Modifier le nom</button>';
    }
    if(!isInstalled()){
      html += '<button class="ya-acc-item" type="button" data-install>'+ ICON_INSTALL +' Installer l\'application</button>';
    }
    html += '<button class="ya-acc-item danger" type="button" data-logout><svg viewBox="0 0 24 24"><path d="M15 12H4M9 7l-5 5 5 5"/><path d="M14 4h5v16h-5"/></svg> Se déconnecter</button>';
    m.innerHTML = html;
    return m;
  }

  function render(u){
    style();
    const wrap = document.createElement('div');
    wrap.className = 'ya-acc';

    const av = document.createElement('button');
    av.className = 'ya-acc-av';
    av.type = 'button';
    av.setAttribute('aria-label', 'Mon profil');
    av.title = u.name;
    av.innerHTML = u.avatar ? '<img src="'+u.avatar+'" alt="">' : initials(u.name);

    const menu = buildMenu(u);
    const file = document.createElement('input');
    file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';

    wrap.appendChild(av); wrap.appendChild(menu); wrap.appendChild(file);

    const actions = document.querySelector('.navbar .nav-actions');
    if(actions){ actions.insertBefore(wrap, actions.firstChild); }
    else { wrap.classList.add('ya-acc-fixed'); document.body.appendChild(wrap); }

    function close(){ menu.classList.remove('open'); }
    av.addEventListener('click', function(e){ e.stopPropagation(); menu.classList.toggle('open'); });
    document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });

    menu.querySelector('[data-logout]').addEventListener('click', logout);
    menu.querySelector('[data-photo]').addEventListener('click', function(){ file.click(); });
    const installBtn = menu.querySelector('[data-install]');
    if(installBtn) installBtn.addEventListener('click', function(){ close(); installApp(); });
    const renameBtn = menu.querySelector('[data-rename]');
    if(renameBtn) renameBtn.addEventListener('click', function(){
      const nv = prompt('Votre nom :', u.name === 'Mon compte' ? '' : u.name);
      if(nv && renameClient(nv)){
        u.name = nv.trim();
        av.title = nv.trim();
        if(!u.avatar) av.innerHTML = initials(u.name);
        const head = menu.querySelector('.ya-acc-head b'); if(head) head.textContent = u.name;
        close();
      }
    });
    file.addEventListener('change', function(){
      if(file.files && file.files[0]) setAvatarFromFile(file.files[0], function(){
        const a = localStorage.getItem('yayra_avatar');
        if(a) av.innerHTML = '<img src="'+a+'" alt="">';
        close();
      });
    });
  }

  // Entrée « Installer l'application » dans le menu de navigation (visible par tous)
  function addInstallNav(){
    if(isInstalled()) return;
    const links = document.querySelector('.navbar .nav-links');
    if(!links || links.querySelector('.nav-install-li')) return;
    const li = document.createElement('li');
    li.className = 'nav-install-li';
    const a = document.createElement('a');
    a.href = '#'; a.className = 'nav-install-link';
    a.innerHTML = ICON_INSTALL + ' Installer l\'app';
    a.addEventListener('click', function(e){ e.preventDefault(); installApp(); });
    li.appendChild(a); links.appendChild(li);
  }

  // Accessible globalement (ex. bouton « Installer » sur la page d'accueil)
  window.YAYRA_INSTALL = function(){ installApp(); };
  window.YAYRA_IS_INSTALLED = isInstalled;

  function wireInstallButtons(){
    // Tout élément marqué data-install-app déclenche l'installation ; caché si déjà installé
    document.querySelectorAll('[data-install-app]').forEach(function(el){
      if(isInstalled()){ el.style.display = 'none'; return; }
      if(el.__yaWired) return; el.__yaWired = true;
      el.addEventListener('click', function(e){ e.preventDefault(); installApp(); });
    });
  }

  function init(){
    injectAppleMeta();
    addInstallNav();
    wireInstallButtons();
    const u = currentUser();
    if(u) render(u);
    // Invite à installer (bannière) après un court délai, une seule fois
    setTimeout(maybeBanner, 1500);
  }
  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
