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

  // Variantes DISTINCTIVES (teintes/finitions) : chaque produit est unique, avec
  // une image web différente. Évite que le même produit semble répété.
  const QUAL = ['Rouge Passion','Rose Poudré','Nude Beige','Corail','Bordeaux','Bleu Nuit','Vert Émeraude','Violet Améthyste','Doré','Argenté','Noir Intense','Blanc Pur','Pêche','Prune','Turquoise'];

  // bases : [nom, prix_min, prix_max] en FCFA (prix marché)
  const GROUPS = [
    { slug:'ongles', prefix:'ONG', count:500, imgs:['net-nailart-amber','net-nailart-red','nails-art','nails-fall','gel-nail-kit','manicure-kit','net-hands-luxe'], bases:[
      ['Vernis Gel',2500,4000],['Vernis Semi-Permanent',3000,4500],['Top Coat',2500,3500],['Base Coat',2500,3500],['Gel UV Couleur',3000,5500],
      ['Gel Constructeur',4000,7000],['Kit Capsules',3500,6500],['Capsules French',2500,4000],['Faux Ongles',2000,3500],['Tips Box 500',3000,6000],
      ['Lime Professionnelle',1000,2000],['Bloc Polissoir',1000,2000],['Strass Nail Art',1500,3000],['Stickers Ongles',1000,2000],['Paillettes Ongles',1500,3000],
      ['Foil Transfert',1500,3500],['Tampon Stamping',2000,4000],['Plaque Stamping',2000,4500],['Pinceau Nail Art',1500,3500],['Stylo Nail Art',1500,3000],
      ['Poudre Acrylique',4000,9000],['Liquide Acrylique',4000,9000],['Colle à Ongles',1000,2500],['Dissolvant Doux',1500,2500],['Huile Cuticules',2000,4000],
      ['Repousse-Cuticules',1500,3000],['Coupe-Ongles Pro',1500,3500],['Râpe Pieds',1500,3500],['Set Manucure',6000,13000],['Kit Pédicure',7000,13000],
      ['Séparateurs Orteils',800,1800],['Brosse Nettoyante',1000,2500],
      ['Vernis Mat',2500,4000],['Vernis Chrome',3000,5000],['Vernis Magnétique',3000,5500],['Vernis Pailleté',3000,5000],['Vernis Thermo',3000,5500],
      ['Top Coat Mat',2500,3500],['Gel Builder',4000,7500],['Gel Camouflage',4000,7000],['Gel Fibre de Verre',4500,8000],['Capsules Amande',2500,4500],
      ['Capsules Ballerine',2500,4500],['Capsules Stiletto',2500,4500],['Tips Colorés',2500,4500],['Poudre Dip',4000,8000],['Kit Poudre Dip',7000,14000],
      ['Primer Ongles',1500,3000],['Déshydratant Ongles',1500,3000],['Sticker French',1000,2200] ] },
    { slug:'kits', prefix:'COS', count:240, imgs:['net-makeup-brushes','net-makeup-palette','net-makeup-marble','net-makeup-model','net-gold-brush','makeup-kit-allinone','beauty-flatlay'], bases:[
      ['Palette Maquillage',8000,18000],['Palette Fards',6000,14000],['Fond de Teint',5000,12000],['BB Crème',4500,9000],['Poudre Compacte',4000,8500],
      ['Poudre Libre',4000,8500],['Anticernes',3500,7000],['Correcteur',3000,6500],['Blush Poudre',3500,7000],['Blush Crème',3500,7000],
      ['Highlighter',4000,8000],['Bronzer',4000,8000],['Terre de Soleil',4000,8500],['Mascara Volume',4000,8000],['Mascara Allongeant',4000,8000],
      ['Eyeliner Liquide',2500,5000],['Crayon Yeux',1500,3500],['Crayon Sourcils',2000,4000],['Gel Sourcils',2500,5000],['Rouge à Lèvres',3000,7000],
      ['Rouge à Lèvres Mat',3500,7500],['Gloss Brillant',2500,5000],['Crayon Lèvres',1500,3500],['Baume Lèvres',1500,3500],['Set de Pinceaux',7000,16000],
      ['Éponge Beauté',1500,3500],['Spray Fixateur',5000,9500],['Base de Teint',4000,8000],['Démaquillant Doux',3000,6000],['Lingettes Démaquillantes',1500,3500],
      ['Faux Cils',1500,3500],['Colle Faux Cils',1000,2500],['Coffret Maquillage',15000,32000],['Trousse Maquillage',4000,9000],['Miroir LED',8000,22000] ] },
    { slug:'visage', prefix:'VIS', count:180, imgs:['net-serums-luxe','net-skincare-flatlay','net-skincare-bottle','net-skincare-natural','net-facial-oil','net-lotion-linen','net-facemask','serum-glow','glowing-skin','skincare-product','skincare-men','vitamin-c-kit'], bases:[
      ['Sérum Éclat',8000,18000],['Sérum Vitamine C',8000,18000],['Sérum Acide Hyaluronique',9000,20000],['Sérum Rétinol',9000,22000],['Crème Hydratante',6000,15000],
      ['Crème de Nuit',7000,16000],['Crème Anti-Âge',10000,26000],['Crème Éclaircissante',7000,16000],['Gel Nettoyant',4000,8000],['Mousse Nettoyante',4000,8000],
      ['Eau Micellaire',3500,7500],['Tonique',4000,8000],['Lotion Apaisante',4000,8000],['Masque Tissu',1500,4000],['Masque Argile',4000,9000],
      ['Masque Peel-off',3500,7500],['Gommage Visage',4500,9000],['Exfoliant Doux',4500,9000],['Huile Visage',6000,14000],['Contour des Yeux',7000,15000],
      ['Patchs Yeux',3000,6000],['Brume Hydratante',3500,7000],['Crème Solaire SPF50',5000,11000],['Stick Lèvres',1500,3500],['Rouleau de Jade',3000,7000],
      ['Gua Sha',3000,7000],['Baume Réparateur',4000,9000] ] },
    { slug:'capillaire', prefix:'CAP', count:140, imgs:['haircare-malibu','net-hairmask','hair-styling','hair-strands'], bases:[
      ['Shampoing Doux',3000,7000],['Shampoing Antipelliculaire',3500,7500],['Shampoing Sec',3500,7000],['Après-Shampoing',3000,7000],['Masque Capillaire',4500,10000],
      ['Soin Sans Rinçage',3500,8000],['Huile Cheveux',3500,8000],['Huile de Ricin',2500,6000],['Sérum Pousse',5000,12000],['Spray Coiffant',3000,6500],
      ['Mousse Coiffante',3000,6500],['Gel Fixation',2500,5500],['Crème Boucles',4000,8500],['Beurre de Karité',2500,6000],['Lait Capillaire',3000,7000],
      ['Lotion Anti-Chute',5000,12000],['Teinture Cheveux',2500,6000],['Bonnet Satin',2000,4500],['Foulard Satin',2000,4500],['Peigne Pro',1000,2500],
      ['Brosse Démêlante',1500,4000],['Gelée Coiffante',3000,6500] ] },
    { slug:'meubles', prefix:'MOB', count:120, imgs:['nail-desk-pro','net-salon','nail-master'], bases:[
      ['Table de Manucure',45000,120000],['Table avec Aspirateur',70000,160000],['Fauteuil Pédicure',150000,450000],['Fauteuil Spa',200000,600000],['Cabine UV',80000,200000],
      ['Tabouret Réglable',15000,35000],['Tabouret Roulant',18000,40000],['Chariot de Soin',25000,60000],['Chariot 3 Tiroirs',30000,70000],['Lampe Loupe',20000,45000],
      ['Lampe sur Pied',25000,55000],['Meuble de Rangement',40000,90000],['Étagère à Vernis',18000,40000],['Présentoir Vernis',20000,48000],['Repose-Pieds',12000,30000],
      ['Bureau Nail Tech',55000,130000],['Comptoir d\'Accueil',90000,250000],['Banc d\'Attente',45000,110000],['Porte-Manteau',12000,28000],['Bac à Shampoing',120000,320000] ] },
    { slug:'machines', prefix:'MAC', count:100, imgs:['nail-master','net-salon','nail-desk-pro'], bases:[
      ['Ponceuse Ongles',12000,35000],['Lampe UV/LED 48W',10000,25000],['Lampe LED 96W',18000,40000],['Collecteur de Poussière',25000,60000],['Aspirateur Manucure',20000,45000],
      ['Stérilisateur UV',20000,55000],['Stérilisateur à Billes',8000,20000],['Autoclave',60000,150000],['Chauffe-Cire',8000,20000],['Chauffe-Serviettes',25000,60000],
      ['Vapozone Facial',35000,80000],['Appareil Hydrafacial',150000,500000],['Dermapen',25000,70000],['Appareil Cavitation',60000,180000],['Luminothérapie LED',45000,140000],
      ['Nettoyeur Ultrasons',20000,55000],['Sèche-Ongles',6000,16000],['Mini Ventilateur Ongles',3000,8000] ] },
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
      const baseIdx = i % g.bases.length;
      const stock = 3 + ((i * 13) % 28);
      products.push({
        id,
        category_slug: g.slug,
        sku: 'YAY-' + g.prefix + '-' + String(i+1).padStart(3,'0'),
        name: b[0] + ' ' + qual,
        description: b[0] + ' ' + qual + ' — sélection YAYRA Nail Shop, qualité professionnelle.',
        price_fcfa: price,
        // Une image par TYPE de produit (assets/images/p/) : chaque type apparaît
        // ~6-7 fois => aucune image ne dépasse 10 répétitions. Remplaçable par une
        // vraie photo de la boutique (même nom de fichier).
        image_url: 'assets/images/p/' + g.slug + '-' + baseIdx + '.jpg',
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
