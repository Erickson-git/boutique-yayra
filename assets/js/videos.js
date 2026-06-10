/* Fil de vidéos de la boutique (style réseaux social). Affiché quand aucun
   direct n'est en cours. Vidéos par défaut (incluses) + vidéos publiées par
   l'admin (via Firebase, visibles par tous les appareils). */
window.YAYRA_VIDEOS = (function(){
  const DEFAULTS = [
    { src:'assets/images/video-01.mp4', cap:'Nail art prestige fait main', tag:'Onglerie', link:'shop.html?cat=ongles' },
    { src:'assets/images/video-05.mp4', cap:'Bienvenue dans la boutique', tag:'Boutique', link:'shop.html' },
    { src:'assets/images/video-03.mp4', cap:'Routine soin visage éclat', tag:'Soins', link:'shop.html?cat=visage' },
    { src:'assets/images/video-08.mp4', cap:'Nos coups de cœur beauté', tag:'Cosmétiques', link:'shop.html?cat=kits' },
    { src:'assets/images/video-09.mp4', cap:'Manucure en institut', tag:'Onglerie', link:'shop.html?cat=ongles' },
    { src:'assets/images/video-11.mp4', cap:'Mobilier & équipement pro', tag:'Mobilier', link:'shop.html?cat=meubles' },
    { src:'assets/images/video-02.mp4', cap:'L\'ambiance YAYRA', tag:'Ambiance', link:'shop.html' },
    { src:'assets/images/video-06.mp4', cap:'Dans les coulisses', tag:'Coulisses', link:'shop.html' },
    { src:'assets/images/video-04.mp4', cap:'Tendances du moment', tag:'Tendance', link:'shop.html' },
    { src:'assets/images/video-10.mp4', cap:'Style & finitions', tag:'Style', link:'shop.html?cat=ongles' }
  ];

  async function published(){
    if(!(window.LIVE && LIVE.ready)) return [];
    try{
      const snap = await LIVE.ref('videos').once('value');
      const v = snap.val() || {};
      return Object.keys(v).map(k=> Object.assign({ _id:k }, v[k]))
        .filter(x=> x && (x.src || x.blob))
        .sort((a,b)=> (b.ts||0) - (a.ts||0));
    }catch(e){ return []; }
  }

  return {
    defaults(){ return DEFAULTS.slice(); },
    published,
    async all(){ const p = await published(); return p.concat(DEFAULTS); }
  };
})();
