/* Comptes du personnel (multi-employés). L'admin suprême (propriétaire) crée et
   gère les comptes. Stockage local pour la démo ; un backend (table users +
   api/auth.php) pourra prendre le relais pour une vraie persistance partagée. */
window.YAYRA_STAFF = (function(){
  const KEY = 'yayra_staff_v1';
  // Compte propriétaire (admin suprême) — non supprimable
  const SUPREME = { id:'supreme', name:'Propriétaire', username:'komi', password:'saxo2180', role:'admin', supreme:true };
  const ROLES = {
    admin:   { label:'Administrateur', desc:'Accès total, gestion des comptes' },
    manager: { label:'Gérant',         desc:'Tout sauf la gestion des comptes' },
    vendeur: { label:'Vendeur',        desc:'Produits, commandes et rendez-vous' }
  };

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; } }
  function save(a){ localStorage.setItem(KEY, JSON.stringify(a)); }
  function uid(){ return 'E' + (window.performance && performance.now ? Math.floor(performance.now()*1000) : (load().length+1)); }

  return {
    ROLES, SUPREME,
    roleLabel(r){ return (ROLES[r] && ROLES[r].label) || r; },
    employees(){ return load(); },
    all(){ return [SUPREME].concat(load()); },
    add(emp){
      const a = load();
      if(a.some(e=> e.username === emp.username) || emp.username === SUPREME.username) return { error:'Identifiant déjà utilisé' };
      const rec = { id: uid(), name: emp.name||'Employé', username: emp.username, password: emp.password, role: emp.role||'vendeur', created: emp.created||'' };
      a.push(rec); save(a); return { ok:true, emp: rec };
    },
    update(id, patch){ save(load().map(e=> e.id===id ? Object.assign({}, e, patch) : e)); },
    remove(id){ save(load().filter(e=> e.id !== id)); },
    auth(username, password){
      // Insensible à la casse + espaces (le clavier mobile met souvent une
      // majuscule au 1er caractère -> "Komi" doit marcher comme "komi").
      const u = String(username||'').trim().toLowerCase();
      const p = String(password||'').trim();
      if(u === SUPREME.username.toLowerCase() && p === SUPREME.password) return Object.assign({}, SUPREME);
      const e = load().find(e=> String(e.username||'').trim().toLowerCase() === u && String(e.password||'').trim() === p);
      return e ? Object.assign({}, e) : null;
    },
    // Session courante (après connexion en mode démo)
    setSession(s){ localStorage.setItem('yayra_staff_session', JSON.stringify({ name:s.name, username:s.username, role:s.role, supreme:!!s.supreme })); },
    session(){ try{ return JSON.parse(localStorage.getItem('yayra_staff_session') || 'null'); }catch(e){ return null; } },
    clearSession(){ localStorage.removeItem('yayra_staff_session'); },
    canManageStaff(){ const s = this.session(); return !!(s && s.role === 'admin'); }
  };
})();
