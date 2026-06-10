/* Catalogue de repli (statique) — prix de DÉTAIL à Lomé (Togo) en FCFA.
   La boutique IMPORTE de l'étranger : les prix intègrent achat + fret + douane
   + marge boutique (estimation marché). Utilisé quand l'API PHP n'est pas
   disponible (ex. GitHub Pages). Schéma reproduit côté backend (init_db.php). */
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

  /* PRIX — boutique basée à Lomé (Togo), produits IMPORTÉS de l'étranger.
     Les fourchettes [min, max] FCFA reflètent le prix de vente au détail à Lomé :
     coût d'achat import + transport (fret) + douane/taxes + marge boutique.
     Estimation marché (cosmétiques/soins importés = catégorie premium ;
     consommables d'onglerie accessibles ; mobilier/machines = fret lourd). */
  const GROUPS = [
    { slug:'ongles', prefix:'ONG', count:500, imgs:['net-nailart-amber','net-nailart-red','nails-art','nails-fall','gel-nail-kit','manicure-kit','net-hands-luxe'], bases:[
      ['Vernis Gel',1500,3500],['Vernis Semi-Permanent',2000,4500],['Top Coat',1500,3000],['Base Coat',1500,3000],['Gel UV Couleur',2500,5000],
      ['Gel Constructeur',4000,8000],['Kit Capsules',3500,7000],['Capsules French',2000,4000],['Faux Ongles',1000,2500],['Tips Box 500',3000,6000],
      ['Lime Professionnelle',700,1800],['Bloc Polissoir',700,1800],['Strass Nail Art',1000,2500],['Stickers Ongles',700,2000],['Paillettes Ongles',1000,2500],
      ['Foil Transfert',1200,3000],['Tampon Stamping',2000,4000],['Plaque Stamping',2000,4000],['Pinceau Nail Art',1500,3500],['Stylo Nail Art',1200,3000],
      ['Poudre Acrylique',5000,11000],['Liquide Acrylique',5000,11000],['Colle à Ongles',800,2000],['Dissolvant Doux',1200,2800],['Huile Cuticules',1800,4000],
      ['Repousse-Cuticules',1200,3000],['Coupe-Ongles Pro',1500,3500],['Râpe Pieds',1200,3000],['Set Manucure',7000,16000],['Kit Pédicure',8000,17000],
      ['Séparateurs Orteils',500,1500],['Brosse Nettoyante',800,2200],
      ['Vernis Mat',1500,3500],['Vernis Chrome',2500,5000],['Vernis Magnétique',2500,5500],['Vernis Pailleté',2000,4500],['Vernis Thermo',2500,5500],
      ['Top Coat Mat',1500,3000],['Gel Builder',4500,9000],['Gel Camouflage',4000,8000],['Gel Fibre de Verre',5000,9500],['Capsules Amande',2000,4000],
      ['Capsules Ballerine',2000,4000],['Capsules Stiletto',2000,4000],['Tips Colorés',2500,4500],['Poudre Dip',5000,10000],['Kit Poudre Dip',9000,18000],
      ['Primer Ongles',1500,3500],['Déshydratant Ongles',1500,3500],['Sticker French',800,2000] ] },
    { slug:'kits', prefix:'COS', count:240, imgs:['net-makeup-brushes','net-makeup-palette','net-makeup-marble','net-makeup-model','net-gold-brush','makeup-kit-allinone','beauty-flatlay'], bases:[
      ['Palette Maquillage',7000,20000],['Palette Fards',5000,15000],['Fond de Teint',5000,14000],['BB Crème',4000,10000],['Poudre Compacte',4000,9000],
      ['Poudre Libre',4000,9000],['Anticernes',3000,7000],['Correcteur',3000,6500],['Blush Poudre',3500,7500],['Blush Crème',3500,7500],
      ['Highlighter',4000,9000],['Bronzer',4000,9000],['Terre de Soleil',4000,9000],['Mascara Volume',3500,8000],['Mascara Allongeant',3500,8000],
      ['Eyeliner Liquide',2500,5500],['Crayon Yeux',1500,3500],['Crayon Sourcils',2000,4500],['Gel Sourcils',2500,5500],['Rouge à Lèvres',3000,7500],
      ['Rouge à Lèvres Mat',3500,8000],['Gloss Brillant',2500,5500],['Crayon Lèvres',1500,3500],['Baume Lèvres',1500,3500],['Set de Pinceaux',6000,16000],
      ['Éponge Beauté',1200,3500],['Spray Fixateur',4500,10000],['Base de Teint',4000,9000],['Démaquillant Doux',3000,6500],['Lingettes Démaquillantes',1500,3500],
      ['Faux Cils',1200,3500],['Colle Faux Cils',800,2500],['Coffret Maquillage',14000,35000],['Trousse Maquillage',4000,10000],['Miroir LED',8000,25000] ] },
    { slug:'visage', prefix:'VIS', count:180, imgs:['net-serums-luxe','net-skincare-flatlay','net-skincare-bottle','net-skincare-natural','net-facial-oil','net-lotion-linen','net-facemask','serum-glow','glowing-skin','skincare-product','skincare-men','vitamin-c-kit'], bases:[
      ['Sérum Éclat',8000,20000],['Sérum Vitamine C',8000,20000],['Sérum Acide Hyaluronique',9000,22000],['Sérum Rétinol',10000,24000],['Crème Hydratante',6000,16000],
      ['Crème de Nuit',7000,18000],['Crème Anti-Âge',12000,30000],['Crème Éclaircissante',7000,18000],['Gel Nettoyant',4000,9000],['Mousse Nettoyante',4000,9000],
      ['Eau Micellaire',3500,8000],['Tonique',4000,9000],['Lotion Apaisante',4000,9000],['Masque Tissu',1500,4000],['Masque Argile',4000,9500],
      ['Masque Peel-off',3500,8000],['Gommage Visage',4500,9500],['Exfoliant Doux',4500,9500],['Huile Visage',6000,15000],['Contour des Yeux',7000,17000],
      ['Patchs Yeux',3000,6500],['Brume Hydratante',3500,7500],['Crème Solaire SPF50',5000,12000],['Stick Lèvres',1500,3500],['Rouleau de Jade',3000,7000],
      ['Gua Sha',3000,7000],['Baume Réparateur',4000,9500] ] },
    { slug:'capillaire', prefix:'CAP', count:140, imgs:['haircare-malibu','net-hairmask','hair-styling','hair-strands'], bases:[
      ['Shampoing Doux',3000,7500],['Shampoing Antipelliculaire',3500,8000],['Shampoing Sec',3500,7500],['Après-Shampoing',3000,7500],['Masque Capillaire',4500,11000],
      ['Soin Sans Rinçage',3500,8500],['Huile Cheveux',3500,8500],['Huile de Ricin',2500,6500],['Sérum Pousse',5000,13000],['Spray Coiffant',3000,7000],
      ['Mousse Coiffante',3000,7000],['Gel Fixation',2500,6000],['Crème Boucles',4000,9000],['Beurre de Karité',2500,6500],['Lait Capillaire',3000,7500],
      ['Lotion Anti-Chute',5000,13000],['Teinture Cheveux',2500,6500],['Bonnet Satin',1500,4500],['Foulard Satin',1500,4500],['Peigne Pro',800,2500],
      ['Brosse Démêlante',1500,4500],['Gelée Coiffante',3000,7000] ] },
    { slug:'meubles', prefix:'MOB', count:120, imgs:['nail-desk-pro','net-salon','nail-master'], bases:[
      ['Table de Manucure',50000,130000],['Table avec Aspirateur',80000,180000],['Fauteuil Pédicure',180000,500000],['Fauteuil Spa',250000,700000],['Cabine UV',90000,220000],
      ['Tabouret Réglable',15000,38000],['Tabouret Roulant',18000,42000],['Chariot de Soin',25000,65000],['Chariot 3 Tiroirs',30000,75000],['Lampe Loupe',20000,48000],
      ['Lampe sur Pied',25000,58000],['Meuble de Rangement',45000,100000],['Étagère à Vernis',18000,45000],['Présentoir Vernis',20000,50000],['Repose-Pieds',12000,32000],
      ['Bureau Nail Tech',60000,140000],['Comptoir d\'Accueil',100000,280000],['Banc d\'Attente',50000,120000],['Porte-Manteau',12000,30000],['Bac à Shampoing',130000,350000] ] },
    { slug:'machines', prefix:'MAC', count:100, imgs:['nail-master','net-salon','nail-desk-pro'], bases:[
      ['Ponceuse Ongles',12000,38000],['Lampe UV/LED 48W',9000,25000],['Lampe LED 96W',18000,42000],['Collecteur de Poussière',25000,65000],['Aspirateur Manucure',20000,48000],
      ['Stérilisateur UV',20000,58000],['Stérilisateur à Billes',8000,22000],['Autoclave',65000,160000],['Chauffe-Cire',8000,22000],['Chauffe-Serviettes',25000,65000],
      ['Vapozone Facial',35000,85000],['Appareil Hydrafacial',160000,550000],['Dermapen',25000,75000],['Appareil Cavitation',65000,190000],['Luminothérapie LED',45000,150000],
      ['Nettoyeur Ultrasons',20000,58000],['Sèche-Ongles',6000,18000],['Mini Ventilateur Ongles',3000,9000] ] },
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
