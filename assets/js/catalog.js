/* Catalogue de repli (statique) — 300 articles générés par défaut, prix marché (FCFA).
   Utilisé quand l'API PHP n'est pas disponible (ex. GitHub Pages).
   Le même schéma est reproduit côté backend dans scripts/init_db.php. */
(function(){
  const categories = [
    { slug:'ongles', name:'Onglerie' },
    { slug:'kits', name:'Cosmétiques' },
    { slug:'visage', name:'Soins Visage' },
    { slug:'capillaire', name:'Capillaire' },
    { slug:'meubles', name:'Mobilier & Cabines' },
    { slug:'machines', name:'Machines & Accessoires' },
  ];

  const QUAL = ['Premium','Éclat','Pro','Luxe','Signature','Essentiel','Prestige','Classic','Édition Or','Confort','Nature','Intense','Élégance','Original','Velours'];

  // bases : [nom, prix_min, prix_max] en FCFA (prix marché)
  const GROUPS = [
    { slug:'ongles', prefix:'ONG', count:70, imgs:['net-nailart-amber','nails-art','nails-fall','gel-nail-kit','manicure-kit','net-hands-luxe'], bases:[
      ['Vernis Gel',2500,4000],['Kit Capsules',3500,6500],['Faux Ongles',2000,3500],['Top Coat',2500,3500],['Base Coat',2500,3500],
      ['Lime Professionnelle',1000,2000],['Strass Nail Art',1500,3000],['Dissolvant Doux',1500,2500],['Set Manucure',6000,13000],['Gel UV Couleur',3000,5500],
      ['Vernis Semi-Permanent',3000,4500],['Pinceau Nail Art',1500,3500],['Capsules French',2500,4000],['Stickers Ongles',1000,2000],['Kit Pédicure',7000,13000] ] },
    { slug:'kits', prefix:'COS', count:70, imgs:['net-makeup-brushes','net-makeup-palette','net-makeup-marble','net-makeup-model','net-gold-brush','makeup-kit-allinone','beauty-flatlay'], bases:[
      ['Palette Maquillage',8000,18000],['Fond de Teint',5000,12000],['Rouge à Lèvres',3000,7000],['Mascara Volume',4000,8000],['Set de Pinceaux',7000,16000],
      ['Highlighter',4000,8000],['Blush Poudre',3500,7000],['Eyeliner Précision',2500,5000],['Coffret Maquillage',15000,32000],['Poudre Libre',4000,8500],
      ['Gloss Brillant',2500,5000],['Crayon Sourcils',2000,4000],['Anticernes',3500,7000],['Spray Fixateur',5000,9500],['Démaquillant Doux',3000,6000] ] },
    { slug:'visage', prefix:'VIS', count:60, imgs:['net-serums-luxe','net-skincare-flatlay','net-lotion-linen','net-facemask','serum-glow','glowing-skin','skincare-product','skincare-men','vitamin-c-kit'], bases:[
      ['Sérum Éclat',8000,18000],['Crème Hydratante',6000,15000],['Masque Purifiant',4000,9000],['Nettoyant Visage',4000,8000],['Tonique Apaisant',4000,8000],
      ['Huile Précieuse',6000,14000],['Contour des Yeux',7000,15000],['Gommage Doux',4500,9000],['Soin Anti-Âge',10000,26000],['Brume Hydratante',3500,7000],
      ['Patchs Yeux',3000,6000],['Crème Solaire',5000,11000] ] },
    { slug:'capillaire', prefix:'CAP', count:40, imgs:['haircare-malibu','hair-styling','hair-strands'], bases:[
      ['Shampoing Doux',3000,7000],['Après-Shampoing',3000,7000],['Masque Capillaire',4500,10000],['Huile Cheveux',3500,8000],['Spray Coiffant',3000,6500],
      ['Crème Boucles',4000,8500],['Sérum Pousse',5000,12000],['Beurre de Karité',2500,6000],['Soin Leave-in',3500,7500],['Gelée Coiffante',3000,6500] ] },
    { slug:'meubles', prefix:'MOB', count:35, imgs:['nail-desk-pro','nail-master'], bases:[
      ['Table de Manucure',45000,120000],['Fauteuil Pédicure',150000,450000],['Cabine UV',80000,200000],['Tabouret Réglable',15000,35000],['Chariot de Soin',25000,60000],
      ['Lampe Loupe',20000,45000],['Meuble de Rangement',40000,90000],['Repose-Pieds',12000,30000],['Bureau Nail Tech',55000,130000],['Étagère à Vernis',18000,40000] ] },
    { slug:'machines', prefix:'MAC', count:25, imgs:['nail-master','nail-desk-pro'], bases:[
      ['Ponceuse Ongles',12000,35000],['Lampe UV/LED',10000,30000],['Collecteur de Poussière',25000,60000],['Stérilisateur',20000,55000],['Chauffe-Cire',8000,20000],
      ['Vapozone Facial',35000,80000],['Autoclave',60000,150000],['Aspirateur Manucure',20000,45000],['Appareil Soin Visage',30000,90000] ] },
  ];

  const products = [];
  let id = 0;
  GROUPS.forEach(g=>{
    const step = (g.slug === 'meubles' || g.slug === 'machines') ? 500 : 100;
    for(let i=0;i<g.count;i++){
      id++;
      const b = g.bases[i % g.bases.length];
      const qIdx = Math.floor(i / g.bases.length);
      const qual = QUAL[qIdx % QUAL.length];
      const span = b[2] - b[1];
      const raw = b[1] + (span > 0 ? ((qIdx * 137) % (span + 1)) : 0);
      const price = Math.round(raw / step) * step;
      const img = g.imgs[i % g.imgs.length];
      const stock = 3 + ((i * 13) % 28);
      products.push({
        id,
        category_slug: g.slug,
        sku: 'YAY-' + g.prefix + '-' + String(i+1).padStart(3,'0'),
        name: b[0] + ' ' + qual,
        description: b[0] + ' ' + qual + ' — sélection YAYRA Nail Shop, qualité professionnelle.',
        price_fcfa: price,
        image_url: 'assets/images/' + img + '.jpg',
        is_featured: (id % 23 === 0) ? 1 : 0,
        stock_qty: stock,
        is_available: 1
      });
    }
  });

  window.YAYRA_CATALOG = {
    categories,
    products,
    featured(limit){
      const f = products.filter(p=>p.is_featured);
      return (f.length ? f : products).slice(0, limit||8);
    },
    filter(opts){
      opts = opts || {};
      const cat = (opts.category||'').trim();
      const q = (opts.q||'').trim().toLowerCase();
      return products.filter(p=>{
        if(cat && p.category_slug !== cat) return false;
        if(q && !((p.name+' '+(p.description||'')).toLowerCase().includes(q))) return false;
        return true;
      });
    }
  };
})();
