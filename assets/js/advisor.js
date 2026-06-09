/* Conseiller automatique YAYRA — analyse un produit, donne des conseils
   d'usage et recherche des produits complémentaires dans le catalogue.
   Fonctionne sans backend ni clé API (idéal pour la démo). */
(function(){
  const KB = {
    ongles: {
      use: "Préparez l'ongle (repoussez les cuticules, limez la surface), appliquez une base, deux fines couches de couleur puis un top coat. Pour le gel, catalysez 60 secondes par couche sous lampe UV/LED.",
      who: "Idéal pour une manucure qui tient 1 à 2 semaines, à domicile comme en institut.",
      tip: "Astuce tenue : dégraissez l'ongle à l'alcool avant la base et scellez toujours le bord libre.",
      related: ['ongles','machines']
    },
    kits: {
      use: "Préparez la peau avec un soin hydratant, appliquez le teint en couches fines au pinceau ou à l'éponge, puis fixez avec une poudre libre ou un spray fixateur.",
      who: "Parfait pour un maquillage du quotidien comme pour les grandes occasions.",
      tip: "Astuce teinte : choisissez votre fond de teint à la lumière du jour, au niveau de la mâchoire.",
      related: ['kits','visage']
    },
    visage: {
      use: "Matin : nettoyant, sérum, hydratant et protection solaire. Soir : nettoyant, sérum traitant puis crème de nuit.",
      who: "Adaptez la routine à votre type de peau : sèche, mixte, grasse ou sensible.",
      tip: "Astuce : introduisez les actifs forts (rétinol, acides) progressivement, 2 à 3 fois par semaine.",
      related: ['visage','kits']
    },
    capillaire: {
      use: "Lavez avec un shampoing doux, appliquez l'après-shampoing sur les longueurs, et un masque une fois par semaine. Terminez par quelques gouttes d'huile.",
      who: "Convient à toutes les textures ; intensifiez les soins sur cheveux secs ou bouclés.",
      tip: "Astuce brillance : rincez à l'eau tiède puis froide pour refermer les écailles.",
      related: ['capillaire']
    },
    meubles: {
      use: "Installez sur une surface plane et stable, à proximité des prises. Nettoyez et désinfectez après chaque cliente.",
      who: "Pensé pour les professionnelles et instituts qui veulent un poste de travail durable.",
      tip: "Astuce confort : associez une lampe loupe et un tabouret réglable pour plus de précision.",
      related: ['meubles','machines']
    },
    machines: {
      use: "Respectez les temps de catalyse ou de stérilisation indiqués et désinfectez les embouts entre chaque utilisation.",
      who: "Indispensable pour une hygiène professionnelle irréprochable en cabine.",
      tip: "Astuce normes : combinez un stérilisateur et un collecteur de poussière pour une cabine aux normes.",
      related: ['machines','meubles']
    }
  };
  const CATNAMES = { ongles:'Onglerie', kits:'Cosmétiques', visage:'Soins Visage', capillaire:'Capillaire', meubles:'Mobilier', machines:'Machines & Accessoires' };
  const fmt = (n)=> (parseInt(n,10)||0).toLocaleString('fr-FR') + ' FCFA';
  const baseName = (name)=> String(name||'').split(' ').slice(0,2).join(' ').toLowerCase();

  function complements(product){
    const cat = (window.YAYRA_CATALOG && window.YAYRA_CATALOG.products) ? window.YAYRA_CATALOG.products : [];
    const kb = KB[product.category_slug] || KB.kits;
    const seen = new Set([baseName(product.name)]);
    const out = [];
    for(const p of cat){
      if(p.id === product.id) continue;
      if(!kb.related.includes(p.category_slug)) continue;
      const b = baseName(p.name);
      if(seen.has(b)) continue;
      seen.add(b); out.push(p);
      if(out.length >= 3) break;
    }
    return out;
  }

  function advise(product){
    const kb = KB[product.category_slug] || KB.kits;
    let html = '';
    html += '<p style="margin:0 0 8px;"><strong>' + (product.name||'Ce produit') + '</strong> — analyse automatique (' + (CATNAMES[product.category_slug]||'Beauté') + ') :</p>';
    html += '<p style="margin:0 0 8px;">' + kb.use + '</p>';
    html += '<p style="margin:0 0 8px;">' + kb.who + ' ' + kb.tip + '</p>';
    const c = complements(product);
    if(c.length){
      html += '<p style="margin:8px 0 6px;"><strong>À associer pour de meilleurs résultats :</strong></p><ul style="margin:0 0 8px; padding-left:18px;">';
      c.forEach(p=>{ html += '<li>' + p.name + ' — <span style="color:var(--gold)">' + fmt(p.price_fcfa) + '</span></li>'; });
      html += '</ul>';
    }
    html += '<p class="muted" style="margin:6px 0 0; font-size:13px;">Conseil généré automatiquement. Pour un avis personnalisé, écrivez-nous sur <a href="https://wa.me/22897498685?text=Bonjour+YAYRA+!+J%27ai+une+question." style="color:var(--gold)" target="_blank" rel="noopener">WhatsApp</a>.</p>';
    return html;
  }

  window.YAYRA_ADVISOR = { advise, complements };
})();
