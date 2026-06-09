/* Comptes clientes (inscription / connexion) côté navigateur, pour que ça
   fonctionne même sans backend PHP (site statique). Si le backend est déployé,
   il est utilisé en priorité ; sinon on stocke localement. */
window.YAYRA_CLIENTS = (function(){
  const KEY = 'yayra_clients_v1';
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; } }
  function save(a){ localStorage.setItem(KEY, JSON.stringify(a)); }
  const norm = (e)=> String(e||'').trim().toLowerCase();

  return {
    add(c){
      const email = norm(c.email);
      const password = c.password || '';
      if(!email || !password) return { error: 'Email et mot de passe requis.' };
      if(password.length < 4) return { error: 'Mot de passe trop court (4 caractères min).' };
      const a = load();
      if(a.some(x=> x.email === email)) return { error: 'Un compte existe déjà avec cet email.' };
      const rec = { id: 'C' + (Date.now()), name: (c.name||'').trim(), email, password, created: Date.now() };
      a.push(rec); save(a);
      return { ok: true, client: rec };
    },
    auth(email, password){
      const e = norm(email);
      const c = load().find(x=> x.email === e && x.password === password);
      return c ? Object.assign({}, c) : null;
    },
    setSession(c){ try{ localStorage.setItem('yayra_client_session', JSON.stringify({ name:c.name, email:c.email })); }catch(e){} },
    session(){ try{ return JSON.parse(localStorage.getItem('yayra_client_session') || 'null'); }catch(e){ return null; } },
    clearSession(){ localStorage.removeItem('yayra_client_session'); }
  };
})();
