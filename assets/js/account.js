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
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferredPrompt = e; });
  window.addEventListener('appinstalled', function(){ deferredPrompt = null; });
  function isInstalled(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function installApp(){
    if(deferredPrompt){
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function(){ deferredPrompt = null; });
      return;
    }
    // iOS / navigateurs sans prompt natif : instructions manuelles
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/i.test(ua);
    const msg = ios
      ? "Pour installer l'application :\n1. Touchez le bouton Partager (carré avec flèche)\n2. Choisissez « Sur l'écran d'accueil »"
      : "Pour installer l'application :\n• Sur Android : menu ⋮ du navigateur → « Installer l'application » / « Ajouter à l'écran d'accueil »\n• Sur ordinateur : icône d'installation dans la barre d'adresse.";
    alert(msg);
  }

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

  function init(){
    addInstallNav();
    const u = currentUser();
    if(u) render(u);
  }
  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
