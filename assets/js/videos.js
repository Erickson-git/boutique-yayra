/* Fil de vidéos de la boutique (style réseaux social). Affiché quand aucun
   direct n'est en cours. En tête : les vraies vidéos de la boutique YAYRA
   (fichiers locaux). Ensuite : une sélection de vidéos d'inspiration (YouTube),
   en conservant TOUTES les vidéos de Jackie Aina. + vidéos publiées par
   l'admin (Firebase). */
window.YAYRA_VIDEOS = (function(){
  const DEFAULTS = [
    {"src":"assets/videos/yayra-boutique-1.mp4","cap":"Bienvenue chez YAYRA Nail Shop ✨ Lomé","tag":"Boutique","link":"shop.html"},
    {"src":"assets/videos/yayra-boutique-2.mp4","cap":"Nos nouveautés onglerie & cosmétiques 💅","tag":"Boutique","link":"shop.html?cat=ongles"},
    {"src":"assets/videos/yayra-boutique-3.mp4","cap":"L'ambiance de la boutique YAYRA 🌸","tag":"Boutique","link":"shop.html"},
    {"src":"assets/videos/yayra-boutique-4.mp4","cap":"Cosmétiques de prestige — sélection YAYRA 💖","tag":"Boutique","link":"shop.html?cat=kits"},
    {"src":"assets/videos/yayra-boutique-5.mp4","cap":"Onglerie d'exception à Lomé 💅","tag":"Boutique","link":"shop.html?cat=ongles"},
    {"src":"assets/videos/yayra-boutique-6.mp4","cap":"Soins & beauté au quotidien chez YAYRA","tag":"Boutique","link":"shop.html?cat=visage"},
    {"src":"assets/videos/yayra-boutique-7.mp4","cap":"Mobilier & équipement professionnel","tag":"Boutique","link":"shop.html?cat=meubles"},
    {"src":"assets/videos/yayra-boutique-8.mp4","cap":"Passez nous voir ! Boutiques Atiégou & Agoè 📍","tag":"Boutique","link":"locations.html"},
    {"src":"https://youtu.be/QPZE3FOOK9Q","cap":"3D textured nails 🩷🧡💛 #3D #nailart #ombrenails #gelxnails #gelnails","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/Ha5r0EeTmf0","cap":"inspo from that.jazz.effect | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/wrwG21QRXtw","cap":"Trying a Moroccan Lip Stain/Lipstick?! 🫢❤️","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/Hk8_O3_mAYw","cap":"Which was your favorite?! | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/3kOi29BmOB4","cap":"Colorful Summer Nails ☀️ | Easy Beginner friendly | Gel X Nails | At home Tutorial","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/pP9RxjqYXKw","cap":"reset with me! | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/2Y2sBUxOLUg","cap":"trying GLOWING makeup?! 🦋💡✨","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/Yp8RNeuprBU","cap":"Hair refresh Pt. 2 | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/JGupFo3atJQ","cap":"Oops… I Can’t Believe I Did That!","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/WjL_qstYoDE","cap":"Hair refresh! Pt. 1 | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/2XodIjkjIkQ","cap":"is this the BEST nose contour hack?? 😱👀","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/kn90hEBJUX0","cap":"let's do some pinky glam! | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/djDmVmOXhlg","cap":"These Cuticles Are a Mess… Here’s Why","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/2BbWB_uLdhM","cap":"The best thing I think Kai Collective has launched to date... | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/xjzONuy3x4I","cap":"the UGLIEST drugstore lipstick ever? 😖","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/ROplj6kJsJs","cap":"R&B and House | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/xqeNZBS_9qo","cap":"Do Your French Nail Look Cheap or Expensive?","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/saFYkof1A84","cap":"Bring back hobbies! | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/FYxJ5ibmkTE","cap":"My Secret to Natural Glowy Skin Makeup | PatrickStarrr","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/RmxzXRBB8II","cap":"New shoe haul! | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/bIb2KOlE_lE","cap":"Speed vs. Quality: Can You Actually Have Both?","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/v80LNWs7pD4","cap":"thank ya | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/7ljQz7q0930","cap":"My brother's skin is looking real FRESH & CLEAN ✨😌 #esthetician #facial #skincare #skin …","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/ozqyBKB3PrI","cap":"no further questions your honor | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/roRZp4sWn34","cap":"The Mystery Foam Nail Techs Use for Clean Cuticles","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/TTN0RX-QXhU","cap":"MAC I'm sorry | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/tK4bhCfbCbU","cap":"Tried #tinnedfish the Toi Bravo way ✨🐟 love you queen! #fishwife #sardines #snack #mukbang","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/ZDM4l0K6OKo","cap":"If you don't own NDA for the Summer, what are you doing | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/cgT6GwafCG8","cap":"Why Gel Looks Like Swiss Cheese on the Nail","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/wIyY0PL-PgU","cap":"it's peony season! | Jackie Aina","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/DaNxqXJjoR0","cap":"The #OilSuckerSpray by ONE/SIZE Beauty is out NOW! Get it at Sephora or OneSizeBeauty.co…","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/Z2Oigu3l3QQ","cap":"How to Prep Ridged Nails Without Thinning the Nail Plate","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/KoKzCEh0jHU","cap":"ELF duped GIVENCHY?! this is not a drill","tag":"Cosmétiques","link":"shop.html?cat=kits"},
    {"src":"https://youtu.be/y-IuYRXhT-4","cap":"Need to raise your prices? intro.co/elizabethmorris #nailtechtips #professionalnailtech …","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/SqBlfDEMzlQ","cap":"Let them have florals 🌺🏵️🌷🌼 #nailart #nail #flowernails","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/298Tn-7nsKA","cap":"Blue French & Floral Nail Art for Spring | Indigo Nails","tag":"Onglerie","link":"shop.html?cat=ongles"},
    {"src":"https://youtu.be/gVdXeg3G498","cap":"Happy Valentine's Day 💙 #valentinesday #nailart #nails","tag":"Onglerie","link":"shop.html?cat=ongles"}
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
