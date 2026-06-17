/* Comptes clientes (inscription / connexion). Stockés sur Firebase (valables sur
   TOUS les appareils) + cache localStorage de secours. Mot de passe haché
   (SHA-256) — jamais en clair. Si le backend PHP est déployé il reste prioritaire
   côté pages ; ici on assure une persistance partagée sans backend. */
window.YAYRA_CLIENTS = (function(){
  const KEY = 'yayra_clients_v1';
  function db(){ return (window.FIREBASE_CONFIG && FIREBASE_CONFIG.databaseURL) ? FIREBASE_CONFIG.databaseURL.replace(/\/$/, '') : ''; }
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; } }
  function save(a){ try{ localStorage.setItem(KEY, JSON.stringify(a)); }catch(e){} }
  const norm = (e)=> String(e||'').trim().toLowerCase();
  const ekey = (e)=> norm(e).replace(/[.#$\[\]\/@]/g, '_');
  function cacheLocal(rec){ const a = load(); const i = a.findIndex(x=> x.email===rec.email); if(i>-1) a[i]=rec; else a.push(rec); save(a); }
  async function hash(p){
    try{
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('yayra:' + p));
      return Array.from(new Uint8Array(buf)).map(x=> x.toString(16).padStart(2,'0')).join('');
    }catch(e){ return 'p:' + p; } // repli si SubtleCrypto indisponible (http non sécurisé)
  }

  return {
    async add(c){
      const email = norm(c.email), password = c.password || '';
      if(!email || !password) return { error: 'Email et mot de passe requis.' };
      if(password.length < 4) return { error: 'Mot de passe trop court (4 caractères min).' };
      const DB = db();
      // déjà existant ? (Firebase puis local)
      if(DB){ try{ const r = await fetch(DB + '/clients/' + ekey(email) + '.json'); const ex = await r.json(); if(ex) return { error: 'Un compte existe déjà avec cet email.' }; }catch(e){} }
      if(load().some(x=> x.email === email)) return { error: 'Un compte existe déjà avec cet email.' };
      const rec = { id: 'C' + Date.now(), name: (c.name||'').trim(), email, pass: await hash(password), created: Date.now() };
      if(DB){ try{ await fetch(DB + '/clients/' + ekey(email) + '.json', { method:'PUT', body: JSON.stringify(rec) }); }catch(e){} }
      cacheLocal(rec);
      return { ok: true, client: rec };
    },
    async auth(email, password){
      const e = norm(email), h = await hash(password), DB = db();
      // 1) Firebase (multi-appareils)
      if(DB){
        try{
          const r = await fetch(DB + '/clients/' + ekey(e) + '.json');
          const rec = await r.json();
          if(rec && (rec.pass === h || rec.password === password)){ const cp = Object.assign({}, rec); cacheLocal(cp); return cp; }
        }catch(err){}
      }
      // 2) Cache local (compatibilité anciens comptes en clair)
      const c = load().find(x=> x.email === e && (x.pass === h || x.password === password));
      return c ? Object.assign({}, c) : null;
    },
    setSession(c){ try{ localStorage.setItem('yayra_client_session', JSON.stringify({ name:c.name, email:c.email })); }catch(e){} },
    session(){ try{ return JSON.parse(localStorage.getItem('yayra_client_session') || 'null'); }catch(e){ return null; } },
    clearSession(){ localStorage.removeItem('yayra_client_session'); }
  };
})();
