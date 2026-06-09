/* Catalogue de repli (statique) — utilisé quand l'API PHP n'est pas disponible
   (ex. hébergement statique GitHub Pages). Reflète scripts/init_db.php. */
(function(){
  const categories = [
    { slug:'ongles', name:'Onglerie' },
    { slug:'kits', name:'Cosmétiques' },
    { slug:'visage', name:'Soins Visage' },
    { slug:'capillaire', name:'Capillaire' },
    { slug:'meubles', name:'Mobilier & Cabines' },
    { slug:'machines', name:'Machines & Accessoires' },
  ];
  const P = (id, category_slug, name, description, price_fcfa, image_url, is_featured, stock_qty)=>(
    { id, category_slug, name, description, price_fcfa, image_url, is_featured, stock_qty, is_available: stock_qty>0?1:0 }
  );
  const products = [
    P(1,'ongles','Nail Art Prestige','Design élégant et finitions premium réalisés à la main.',3500,'assets/images/net-nailart-amber.jpg',1,25),
    P(2,'ongles','Kit Ongles Gel Luxe','Kit complet gel UV pour un rendu salon à domicile.',12000,'assets/images/gel-nail-kit.jpg',1,14),
    P(3,'ongles','Kit Manucure & Pédicure Pro','L\'essentiel professionnel pour des mains et pieds impeccables.',9500,'assets/images/manicure-kit.jpg',0,18),
    P(4,'ongles','Mains Sublimées','Soin et pose pour des mains élégantes et soignées.',4000,'assets/images/net-hands-luxe.jpg',0,12),
    P(5,'kits','Kit Beauté Éclat Vitamine C','Routine soin complète pour une peau radieuse et unifiée.',15000,'assets/images/net-skincare-flatlay.jpg',1,10),
    P(6,'kits','Kit Maquillage All-in-One','Pinceaux et indispensables pour un look complet, partout.',18000,'assets/images/net-makeup-brushes.jpg',1,8),
    P(7,'kits','Coffret Maquillage Prestige','Palette et teint, une sélection de nos best-sellers.',11000,'assets/images/net-makeup-palette.jpg',1,9),
    P(8,'visage','Sérum Quartz Glow','Sérum hydratant et effet éclat progressif.',9000,'assets/images/net-serums-luxe.jpg',1,16),
    P(9,'visage','Émulsion Corps Délicate','Texture riche pour nourrir et sublimer la peau.',13000,'assets/images/net-lotion-linen.jpg',0,7),
    P(10,'visage','Rituel Peau Éclatante','Le rituel signature pour une peau visiblement lumineuse.',14500,'assets/images/glowing-skin.jpg',0,6),
    P(11,'visage','Soin Homme FERRO','Soin visage essentiel pensé pour les hommes.',10000,'assets/images/skincare-men.jpg',0,8),
    P(12,'capillaire','Soin Cheveux No Stress','Après-shampoing et soin pour des cheveux doux et faciles à coiffer.',8000,'assets/images/haircare-malibu.jpg',0,11),
    P(13,'capillaire','Coiffure & Style','Produits coiffants pour une mise en forme tenue.',7000,'assets/images/hair-styling.jpg',0,9),
    P(14,'capillaire','Fortifiant Cheveux','Soin fortifiant à utiliser au quotidien pour renforcer les longueurs.',8500,'assets/images/hair-strands.jpg',0,10),
    P(15,'meubles','Table de Manucure Luxe','Meuble professionnel avec collecteur de poussière intégré.',65000,'assets/images/nail-desk-pro.jpg',1,4),
    P(16,'machines','Poste Pro Nail Master','Espace de travail complet pour technicienne ongulaire.',42000,'assets/images/nail-master.jpg',0,5),
  ];

  window.YAYRA_CATALOG = {
    categories,
    products,
    featured(limit){
      return products.filter(p=>p.is_featured).sort((a,b)=>b.id-a.id).slice(0, limit||8);
    },
    filter(opts){
      opts = opts || {};
      const cat = (opts.category||'').trim();
      const q = (opts.q||'').trim().toLowerCase();
      return products.filter(p=>{
        if(cat && p.category_slug !== cat) return false;
        if(q && !((p.name+' '+(p.description||'')).toLowerCase().includes(q))) return false;
        return true;
      }).sort((a,b)=>b.id-a.id);
    }
  };
})();
