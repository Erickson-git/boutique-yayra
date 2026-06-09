/* Gestion des kits/coffrets : composer plusieurs produits, remise automatique
   de 5% sur le total, soumission puis publication après validation admin.
   Stockage local pour la démo (un backend pourrait persister via api/admin_kits.php). */
(function(){
  const PENDING = 'yayra_kits_pending';
  const PUBLISHED = 'yayra_kits_published';
  const DISCOUNT = 0.05;

  function load(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; } }
  function save(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }

  function price(items){
    const sub = items.reduce((s,i)=> s + ((parseInt(i.price_fcfa,10)||0) * (parseInt(i.qty,10)||1)), 0);
    const total = Math.round(sub * (1 - DISCOUNT) / 100) * 100;
    return { sub, total, saved: sub - total };
  }
  function uid(){ return 'K' + (window.performance && performance.now ? Math.floor(performance.now()*1000) : (1000 + load(PENDING).length + load(PUBLISHED).length)); }

  window.YAYRA_KITS = {
    DISCOUNT,
    pending(){ return load(PENDING); },
    published(){ return load(PUBLISHED); },
    price,
    submit(kit){
      const items = kit.items || [];
      const p = price(items);
      const rec = { id: uid(), name: kit.name || 'Kit YAYRA', items, sub: p.sub, total: p.total, status: 'pending', created: kit.created || '' };
      const arr = load(PENDING); arr.push(rec); save(PENDING, arr);
      return rec;
    },
    approve(id){
      let pend = load(PENDING);
      const k = pend.find(x=> x.id === id);
      if(!k) return;
      pend = pend.filter(x=> x.id !== id); save(PENDING, pend);
      k.status = 'published';
      const pub = load(PUBLISHED); pub.push(k); save(PUBLISHED, pub);
    },
    reject(id){ save(PENDING, load(PENDING).filter(x=> x.id !== id)); },
    removePublished(id){ save(PUBLISHED, load(PUBLISHED).filter(x=> x.id !== id)); }
  };
})();
