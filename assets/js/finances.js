/* =====================================================================
   YAYRA — Gestion financière (recettes / dépenses / reste, par boutique)
   App PWA réservée à l'admin. Stockage localStorage (fonctionne hors-ligne /
   sans configuration) + synchronisation Firebase REST si configurée.
   Une saisie par JOUR et par BOUTIQUE (recettes séparées par boutique).
   ===================================================================== */
window.YAYRA_FINANCES = (function(){
  const LKEY = 'yayra_finances_v1';
  const BOUTIQUES = [
    { slug:'atiegou', name:'Atiégou' },
    { slug:'agoe',    name:'Agoè' }
  ];

  function db(){ return (window.FIREBASE_CONFIG && FIREBASE_CONFIG.databaseURL) ? FIREBASE_CONFIG.databaseURL.replace(/\/$/, '') : ''; }
  function loadLocal(){ try{ return JSON.parse(localStorage.getItem(LKEY) || '[]'); }catch(e){ return []; } }
  function saveLocal(a){ try{ localStorage.setItem(LKEY, JSON.stringify(a)); }catch(e){} }

  const fcfa = (n)=> (parseInt(n,10)||0).toLocaleString('fr-FR') + ' FCFA';
  const p2 = (n)=> String(n).padStart(2,'0');
  function todayStr(){ const d = new Date(); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()); }
  function frDate(s){ if(!s) return ''; const a = String(s).split('-'); return a.length===3 ? (a[2]+'/'+a[1]+'/'+a[0]) : s; }
  function stampStr(ts){ const d = new Date(ts); return p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear()+' à '+p2(d.getHours())+'h'+p2(d.getMinutes()); }
  function boutiqueName(slug){ const b = BOUTIQUES.find(x=> x.slug===slug); return b ? b.name : slug; }
  function entryId(boutique, date){ return 'F_'+boutique+'_'+date; }

  // Enregistre (ou met à jour) la saisie d'un jour pour une boutique.
  async function saveDay(data){
    const date = data.date || todayStr();
    const boutique = data.boutique;
    const recette = Math.max(0, parseInt(data.recette,10)||0);
    const depense = Math.max(0, parseInt(data.depense,10)||0);
    const ventes  = Math.max(0, parseInt(data.ventes,10)||0);
    const id = entryId(boutique, date);
    const now = Date.now();
    const e = {
      id, date, boutique,
      recette, depense, ventes,
      reste: recette - depense,
      comment: (data.comment||'').trim(),
      updated: now, updatedStr: stampStr(now)
    };
    const a = loadLocal();
    const i = a.findIndex(x=> x.id === id);
    if(i > -1){ e.created = a[i].created || now; a[i] = e; } else { e.created = now; a.push(e); }
    saveLocal(a);
    const DB = db();
    if(DB){ try{ await fetch(DB + '/finances/' + id + '.json', { method:'PUT', body: JSON.stringify(e) }); }catch(_){} }
    return e;
  }

  async function remove(id){
    saveLocal(loadLocal().filter(x=> x.id !== id));
    const DB = db();
    if(DB){ try{ await fetch(DB + '/finances/' + id + '.json', { method:'DELETE' }); }catch(_){} }
  }

  // Récupère aussi les saisies distantes (autres appareils) si Firebase est prêt.
  async function sync(){
    const DB = db(); if(!DB) return loadLocal();
    try{
      const r = await fetch(DB + '/finances.json'); const v = await r.json();
      if(v && typeof v === 'object'){
        const map = {};
        loadLocal().forEach(e=> { if(e&&e.id) map[e.id]=e; });
        Object.keys(v).forEach(k=> { const e=v[k]; if(e&&e.id) map[e.id]=e; });
        const merged = Object.keys(map).map(k=> map[k]);
        saveLocal(merged);
        return merged;
      }
    }catch(_){}
    return loadLocal();
  }

  function list(){ return loadLocal().slice().sort((a,b)=> a.date < b.date ? 1 : (a.date > b.date ? -1 : 0)); }
  function getDay(boutique, date){ return loadLocal().find(x=> x.id === entryId(boutique, date)) || null; }
  function missingToday(boutique){ return !getDay(boutique, todayStr()); }

  function filterEntries(opts){
    opts = opts || {};
    let a = loadLocal();
    if(opts.boutique) a = a.filter(x=> x.boutique === opts.boutique);
    if(opts.from) a = a.filter(x=> x.date >= opts.from);
    if(opts.to)   a = a.filter(x=> x.date <= opts.to);
    return a.sort((x,y)=> x.date < y.date ? -1 : 1);
  }

  // Totaux automatiques sur une période.
  function totals(opts){
    const a = filterEntries(opts);
    let r=0, d=0, v=0;
    a.forEach(e=> { r += e.recette||0; d += e.depense||0; v += e.ventes||0; });
    return { recette:r, depense:d, reste:r-d, ventes:v, jours:a.length, moyenne: a.length ? Math.round(r/a.length) : 0 };
  }

  // Série chronologique pour le graphe (recettes/dépenses cumulées par date).
  function series(opts){
    const a = filterEntries(opts);
    const map = {};
    a.forEach(e=> { if(!map[e.date]) map[e.date] = { date:e.date, recette:0, depense:0 }; map[e.date].recette += e.recette||0; map[e.date].depense += e.depense||0; });
    return Object.keys(map).sort().map(k=> map[k]);
  }

  function monthStart(){ const d = new Date(); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-01'; }
  function daysAgoStr(n){ const d = new Date(Date.now() - n*86400000); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()); }

  return {
    BOUTIQUES, boutiqueName,
    saveDay, remove, sync, list, getDay, missingToday,
    filterEntries, totals, series,
    todayStr, frDate, fcfa, monthStart, daysAgoStr
  };
})();
