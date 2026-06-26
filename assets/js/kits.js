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
    removePublished(id){ save(PUBLISHED, load(PUBLISHED).filter(x=> x.id !== id)); },

    // ---- IA : génération automatique de kits ----
    _pool(category){
      const cat = (window.YAYRA_CATALOG ? window.YAYRA_CATALOG.products : []);
      let pool = cat.filter(p=> p.is_available && p.stock_qty > 0);
      if(category) pool = pool.filter(p=> p.category_slug === category);
      return pool;
    },
    _base(name){ return String(name||'').split(' ').slice(0,2).join(' ').toLowerCase(); },

    // Kits thématiques suggérés automatiquement (à valider par l'admin)
    suggest(){
      const self = this;
      function pick(cats, n){
        const seen = new Set(); const out = [];
        for(const p of self._pool()){
          if(cats.indexOf(p.category_slug) < 0) continue;
          const b = self._base(p.name); if(seen.has(b)) continue;
          seen.add(b); out.push(p); if(out.length >= n) break;
        }
        return out;
      }
      const THEMES = [
        { name:'Kit Onglerie Essentiel', cats:['ongles'], n:4 },
        { name:'Coffret Maquillage Complet', cats:['kits'], n:4 },
        { name:'Routine Visage Éclat', cats:['visage'], n:4 },
        { name:'Kit Capillaire Soin', cats:['capillaire'], n:3 },
        { name:'Kit Beauté Découverte', cats:['kits','visage'], n:4 },
        { name:'Pack Pro Onglerie', cats:['ongles','machines'], n:3 }
      ];
      return THEMES.map(t=>{
        const items = pick(t.cats, t.n).map(p=>({ id:p.id, name:p.name, price_fcfa:p.price_fcfa, qty:1 }));
        const pr = price(items);
        return { name:t.name, items, sub:pr.sub, total:pr.total };
      }).filter(k=> k.items.length >= 2);
    },

    // Meilleur kit COHÉRENT selon un budget (client). category facultative.
    // Construit le kit par PRIORITÉ MÉTIER (recette), explique l'utilité de chaque
    // produit, et propose un upsell ("ajoutez X FCFA pour aussi…").
    byBudget(budget, category){
      budget = parseInt(budget,10) || 0;
      const self = this;
      const KB = window.YAYRA_KIT_KB;
      const pool = this._pool(category).slice().sort((a,b)=> a.price_fcfa - b.price_fcfa);
      const cap = budget / (1 - DISCOUNT); // le total final (-5%) doit tenir dans le budget

      // Renvoie le produit le moins cher d'un TYPE donné qui tient dans le reste.
      function cheapestOfType(type, maxPrice, usedIds){
        let best = null;
        for(const p of pool){
          if(usedIds.has(p.id)) continue;
          const t = KB ? KB.typeOf(p.name) : null;
          const match = t ? (t === type) : (p.name.indexOf(type + ' ') === 0);
          if(!match) continue;
          if(p.price_fcfa > maxPrice) continue;
          if(!best || p.price_fcfa < best.price_fcfa) best = p;
        }
        return best;
      }
      function withInfo(p){
        const info = KB ? KB.info(p.name, p.category_slug) : null;
        return { id:p.id, name:p.name, price_fcfa:p.price_fcfa, qty:1,
                 why: info ? { utilite:info.utilite, usage:info.usage, aide:info.aide } : null };
      }

      const MAX_ITEMS = 10;
      const recipe = KB ? KB.recipe(category) : [];
      const items = []; const usedIds = new Set(); const usedTypes = new Set(); let sub = 0;

      // 1) Remplir selon la recette, par ordre de priorité métier.
      for(const type of recipe){
        const p = cheapestOfType(type, cap - sub, usedIds);
        if(p){ items.push(withInfo(p)); usedIds.add(p.id); usedTypes.add(type); sub += p.price_fcfa; }
        if(items.length >= MAX_ITEMS) break;
      }

      // 2) Exploiter au mieux le budget restant avec d'autres produits utiles et
      //    distincts (on vise le meilleur kit possible pour la somme indiquée).
      if(items.length < MAX_ITEMS){
        const seenBase = new Set(items.map(i=> self._base(i.name)));
        for(const p of pool){
          if(items.length >= MAX_ITEMS) break;
          if(usedIds.has(p.id)) continue;
          const b = self._base(p.name); if(seenBase.has(b)) continue;
          if(sub + p.price_fcfa > cap) continue;
          items.push(withInfo(p)); usedIds.add(p.id); seenBase.add(b); sub += p.price_fcfa;
        }
      }

      // 3) Garantir au moins un produit.
      if(!items.length && pool.length){ const p = pool[0]; items.push(withInfo(p)); usedIds.add(p.id); sub += p.price_fcfa; }

      const pr = price(items);

      // 4) Upsell : prochains produits essentiels qui DÉPASSENT le budget — on
      //    indique combien ajouter pour les obtenir aussi.
      const upsell = [];
      const remainingTypes = recipe.filter(t=> !usedTypes.has(t));
      for(const type of remainingTypes){
        const p = cheapestOfType(type, Infinity, usedIds);
        if(!p) continue;
        const newSub = sub + p.price_fcfa;
        const newTotal = Math.round(newSub * (1 - DISCOUNT) / 100) * 100;
        const extra = newTotal - pr.total;
        if(extra <= 0) continue;            // n'ajoute rien au prix : ignoré
        if(newTotal <= budget) continue;    // tiendrait dans le budget : doit être DANS le kit, pas en upsell
        const info = KB ? KB.info(p.name, p.category_slug) : null;
        upsell.push({ id:p.id, name:p.name, price_fcfa:p.price_fcfa, extra,
                      why: info ? { utilite:info.utilite, usage:info.usage, aide:info.aide } : null });
        if(upsell.length >= 2) break;
      }

      return { name:'Kit ' + budget.toLocaleString('fr-FR') + ' FCFA', items,
               sub:pr.sub, total:pr.total, saved:pr.saved, upsell, budget };
    }
  };
})();
