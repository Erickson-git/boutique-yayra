/* =====================================================================
   YAYRA — Base de connaissances produits
   Pour chaque TYPE de produit : son utilité, son usage et son bénéfice
   métier (comment il aide la professionnelle dans son travail).
   Utilisée par le composeur de kit "par budget" (kits.js) pour proposer
   un kit PERTINENT et conseiller la cliente.
   La clé correspond au début du nom du produit (ex. "Vernis Gel ...").
   ===================================================================== */
(function(){
  // utilite = à quoi ça sert · usage = comment l'utiliser · aide = bénéfice métier
  const KB = {
    /* ---------------- ONGLERIE ---------------- */
    'Base Coat': { utilite:'Couche de base qui protège l’ongle naturel et fait adhérer la couleur.', usage:'1ʳᵉ couche sur l’ongle nu, avant le vernis ou le gel.', aide:'Empêche l’ongle de jaunir et double la tenue de la pose.' },
    'Top Coat Mat': { utilite:'Finition mate qui scelle et protège la couleur.', usage:'Dernière couche, séchée sous lampe pour un rendu mat.', aide:'Donne un fini tendance et professionnel sans brillance.' },
    'Top Coat': { utilite:'Vernis de finition brillant qui scelle la pose.', usage:'Dernière couche par-dessus la couleur, sous lampe UV/LED.', aide:'Apporte une brillance "verre" durable et anti-rayures.' },
    'Vernis Semi-Permanent': { utilite:'Vernis longue tenue qui dure 2 à 3 semaines.', usage:'Base + 2 couches + top, chaque couche séchée sous lampe.', aide:'Tenue longue = clientes fidélisées et moins de retouches.' },
    'Vernis Gel': { utilite:'Vernis gel qui sèche sous lampe pour une tenue impeccable.', usage:'S’applique en fines couches catalysées sous lampe UV/LED.', aide:'Rendu lisse et durable : la signature d’une pose pro.' },
    'Vernis Mat': { utilite:'Couleur à finition mate, très demandée.', usage:'Couleur appliquée puis scellée avec un top coat mat.', aide:'Élargit votre carte de finitions pour séduire plus de clientes.' },
    'Vernis Chrome': { utilite:'Effet miroir métallisé haut de gamme.', usage:'Poudre/vernis chrome frotté sur un top coat, puis scellé.', aide:'Prestation premium facturée plus cher.' },
    'Vernis Magnétique': { utilite:'Effet "cat eye" magnétique 3D.', usage:'Aimant approché du gel encore humide pour créer le reflet.', aide:'Effet spectaculaire qui justifie un supplément.' },
    'Vernis Pailleté': { utilite:'Couleur pailletée festive.', usage:'En couche seule ou en accent sur un ou deux ongles.', aide:'Parfait pour les occasions et la nail art.' },
    'Vernis Thermo': { utilite:'Couleur qui change selon la température.', usage:'Appliqué comme un vernis classique, réagit au chaud/froid.', aide:'Effet original qui fait parler de votre salon.' },
    'Gel UV Couleur': { utilite:'Gel de couleur catalysé sous lampe, ultra-résistant.', usage:'Fines couches sur base, séchées sous lampe UV/LED.', aide:'Tenue et pigmentation supérieures au vernis classique.' },
    'Gel Constructeur': { utilite:'Gel pour rallonger et renforcer l’ongle.', usage:'Modelé sur capsule ou chablon, limé puis recouvert.', aide:'Permet les extensions, prestation la plus rentable.' },
    'Gel Builder': { utilite:'Gel de construction pour structurer l’ongle.', usage:'Déposé en goutte et étiré pour bomber l’ongle, puis catalysé.', aide:'Renforce les ongles fragiles et sculpte la forme.' },
    'Gel Camouflage': { utilite:'Gel teinté nude pour une base naturelle.', usage:'En couche de construction pour un effet "ongle parfait".', aide:'Idéal pour la French moderne et la babyboomer.' },
    'Gel Fibre de Verre': { utilite:'Gel renforcé de fibres pour une solidité maximale.', usage:'Appliqué comme un builder, pour ongles très sollicités.', aide:'Réduit les casses et les retours clientes.' },
    'Primer Ongles': { utilite:'Apprêt qui prépare l’ongle à recevoir le gel.', usage:'Fine touche sur l’ongle déshydraté avant la base.', aide:'Évite les décollements : pose qui tient sans accroc.' },
    'Déshydratant Ongles': { utilite:'Assèche l’ongle pour une accroche parfaite.', usage:'Passé avant le primer pour retirer huiles et humidité.', aide:'Élimine la cause n°1 du décollement du gel.' },
    'Dissolvant Doux': { utilite:'Retire le vernis sans agresser l’ongle.', usage:'Imbibé sur coton, posé quelques secondes.', aide:'Préserve l’ongle des clientes entre deux poses.' },
    'Huile Cuticules': { utilite:'Nourrit et assouplit les cuticules.', usage:'Quelques gouttes massées en fin de prestation.', aide:'Finition soignée et conseil de soin à revendre.' },
    'Repousse-Cuticules': { utilite:'Repousse proprement les cuticules.', usage:'Sur cuticules ramollies, avant la pose.', aide:'Base nette = pose plus belle et plus durable.' },
    'Lime Professionnelle': { utilite:'Met en forme l’ongle et la longueur.', usage:'Lime de bord à bord selon la forme voulue.', aide:'Outil de base indispensable à chaque manucure.' },
    'Bloc Polissoir': { utilite:'Lisse et fait briller la surface de l’ongle.', usage:'Passé délicatement sur l’ongle naturel.', aide:'Surface lisse = meilleure accroche du produit.' },
    'Strass Nail Art': { utilite:'Décor de cristaux pour la nail art.', usage:'Posés sur gel humide puis scellés au top coat.', aide:'Décor premium facturé en supplément.' },
    'Stickers Ongles': { utilite:'Motifs prêts à poser.', usage:'Appliqués sur la couleur sèche, scellés au top.', aide:'Nail art rapide, sans pinceau.' },
    'Paillettes Ongles': { utilite:'Paillettes libres pour effets brillants.', usage:'Saupoudrées sur gel humide, puis top coat.', aide:'Effets festifs très demandés.' },
    'Foil Transfert': { utilite:'Feuilles métalliques à transférer.', usage:'Posées avec une colle spéciale sur la couleur.', aide:'Effet doré/argenté tendance et rapide.' },
    'Tampon Stamping': { utilite:'Transfère un motif gravé sur l’ongle.', usage:'Motif pris sur la plaque puis tamponné sur l’ongle.', aide:'Nail art précise et répétable en quelques secondes.' },
    'Plaque Stamping': { utilite:'Plaque gravée de motifs pour stamping.', usage:'Encrée puis raclée avant le tampon.', aide:'Multiplie vos motifs sans savoir dessiner.' },
    'Pinceau Nail Art': { utilite:'Pinceau fin pour dessins et détails.', usage:'Trempé dans le gel/vernis pour tracer lignes et fleurs.', aide:'Ouvre la prestation nail art, à forte marge.' },
    'Stylo Nail Art': { utilite:'Stylo pour points et lignes faciles.', usage:'Pressé directement sur l’ongle.', aide:'Décors rapides pour débuter la nail art.' },
    'Poudre Acrylique': { utilite:'Poudre pour ongles en acrylique (résine).', usage:'Trempée dans le liquide puis modelée à la longueur.', aide:'Extensions très solides, technique recherchée.' },
    'Liquide Acrylique': { utilite:'Monomère qui active la poudre acrylique.', usage:'Le pinceau humidifié prend la poudre pour modeler.', aide:'Indispensable au système acrylique.' },
    'Poudre Dip': { utilite:'Poudre "dip" sans lampe, très résistante.', usage:'Ongle trempé dans la poudre après une base dip.', aide:'Pose rapide et solide, sans odeur d’acrylique.' },
    'Kit Poudre Dip': { utilite:'Set complet pour le système dip.', usage:'Base, poudres et activateur réunis.', aide:'Démarrez une nouvelle technique clé en main.' },
    'Colle à Ongles': { utilite:'Colle les capsules et réparations.', usage:'Une goutte sous la capsule, pressée quelques secondes.', aide:'Pose de capsules express et durable.' },
    'Capsules French': { utilite:'Capsules à bord blanc pour French.', usage:'Collées puis limées à la bonne longueur.', aide:'French instantanée, gain de temps.' },
    'Capsules Amande': { utilite:'Capsules forme amande.', usage:'Collées et habillées de gel/vernis.', aide:'Forme élégante très demandée.' },
    'Capsules Ballerine': { utilite:'Capsules forme ballerine (cercueil).', usage:'Collées puis recouvertes de couleur.', aide:'Forme moderne phare des réseaux.' },
    'Capsules Stiletto': { utilite:'Capsules pointues effet griffe.', usage:'Collées et sculptées en pointe.', aide:'Pose statement pour clientes audacieuses.' },
    'Faux Ongles': { utilite:'Capsules prêtes à poser.', usage:'Collées sur l’ongle naturel préparé.', aide:'Solution rapide pour un résultat immédiat.' },
    'Tips Box 500': { utilite:'Grande boîte de capsules assorties.', usage:'Réserve de tailles pour toutes les clientes.', aide:'Stock pro qui évite les ruptures.' },
    'Tips Colorés': { utilite:'Capsules déjà colorées.', usage:'Collées telles quelles, sans vernir.', aide:'Pose ultra-rapide aux couleurs vives.' },
    'Kit Capsules': { utilite:'Ensemble capsules + colle.', usage:'Tout-en-un pour la pose de capsules.', aide:'Parfait pour débuter les extensions.' },
    'Coupe-Ongles Pro': { utilite:'Coupe et raccourcit l’ongle.', usage:'Avant le limage, pour ajuster la longueur.', aide:'Outil d’hygiène de base du poste.' },
    'Râpe Pieds': { utilite:'Élimine les callosités des pieds.', usage:'Sur peau sèche ou humide pendant la pédicure.', aide:'Complète la prestation pédicure.' },
    'Set Manucure': { utilite:'Trousse d’outils de manucure.', usage:'Coupe, repousse, lime réunis.', aide:'Poste équipé d’un coup, prêt à travailler.' },
    'Kit Pédicure': { utilite:'Set complet pour la pédicure.', usage:'Outils de soin et de ponçage des pieds.', aide:'Lance la prestation pieds, très rentable.' },
    'Séparateurs Orteils': { utilite:'Écarte les orteils pendant la pose.', usage:'Glissés entre les orteils avant de vernir.', aide:'Pose nette sans bavures, gain de temps.' },
    'Brosse Nettoyante': { utilite:'Retire la poussière de limage.', usage:'Balayée sur l’ongle entre les étapes.', aide:'Surface propre = pose sans imperfection.' },
    'Sticker French': { utilite:'Guides adhésifs pour French parfaite.', usage:'Collés pour tracer un sourire net.', aide:'French régulière même à main levée.' },

    /* ---------------- MACHINES & ACCESSOIRES ---------------- */
    'Lampe UV/LED 48W': { utilite:'Catalyse (sèche) le gel et le semi-permanent.', usage:'Main placée sous la lampe après chaque couche.', aide:'Indispensable au gel : sans elle, pas de pose durable.' },
    'Lampe LED 96W': { utilite:'Lampe puissante pour un séchage rapide.', usage:'Séchage en 30-60 s par couche, mains entières.', aide:'Gagne du temps sur chaque cliente.' },
    'Ponceuse Ongles': { utilite:'Ponce, lime et retire le gel mécaniquement.', usage:'Embouts rotatifs pour préparer et déposer.', aide:'Divise le temps de dépose et soigne les finitions.' },
    'Collecteur de Poussière': { utilite:'Aspire la poussière de ponçage.', usage:'Posé sous la main pendant le limage.', aide:'Protège votre santé et garde le poste propre.' },
    'Aspirateur Manucure': { utilite:'Capte poussières et particules à la source.', usage:'Activé pendant le ponçage du gel.', aide:'Confort de travail et image pro.' },
    'Stérilisateur UV': { utilite:'Désinfecte les outils par UV.', usage:'Outils placés dans l’enceinte entre clientes.', aide:'Hygiène irréprochable = confiance des clientes.' },
    'Stérilisateur à Billes': { utilite:'Stérilise les petits outils par chaleur.', usage:'Pointes plongées dans les billes chaudes.', aide:'Hygiène rapide entre deux poses.' },
    'Autoclave': { utilite:'Stérilisation poussée à la vapeur.', usage:'Cycle vapeur sous pression pour l’instrumentation.', aide:'Niveau d’hygiène médical, argument fort.' },
    'Chauffe-Cire': { utilite:'Fait fondre la cire d’épilation.', usage:'Cire chauffée puis appliquée à la spatule.', aide:'Ajoute l’épilation à vos services.' },
    'Sèche-Ongles': { utilite:'Sèche le vernis classique.', usage:'Mains placées sous le flux d’air/UV.', aide:'Évite les traces sur le vernis traditionnel.' },
    'Mini Ventilateur Ongles': { utilite:'Sèche rapidement le vernis à l’air.', usage:'Posé devant les ongles fraîchement vernis.', aide:'Petite touche de confort appréciée.' },

    /* ---------------- COSMÉTIQUES / MAQUILLAGE ---------------- */
    'Base de Teint': { utilite:'Lisse la peau et fait tenir le maquillage.', usage:'Appliquée avant le fond de teint.', aide:'Teint qui tient toute la journée.' },
    'Fond de Teint': { utilite:'Unifie le teint.', usage:'Étalé à l’éponge ou au pinceau.', aide:'Base d’un maquillage pro impeccable.' },
    'BB Crème': { utilite:'Teint léger et soin en un produit.', usage:'Appliquée comme une crème teintée.', aide:'Option "nude" rapide pour vos clientes.' },
    'Anticernes': { utilite:'Camoufle cernes et imperfections.', usage:'Tapoté sous les yeux et sur les rougeurs.', aide:'Regard reposé, finition soignée.' },
    'Correcteur': { utilite:'Neutralise les colorations de la peau.', usage:'Touches ciblées avant le fond de teint.', aide:'Corrige boutons et taches efficacement.' },
    'Poudre Compacte': { utilite:'Matifie et fixe le teint.', usage:'Tapotée par-dessus le fond de teint.', aide:'Fini mat longue tenue.' },
    'Poudre Libre': { utilite:'Fixe le maquillage en finesse.', usage:'Au pinceau ou en "baking" sous les yeux.', aide:'Tenue impeccable sans effet plâtre.' },
    'Palette Fards': { utilite:'Fards à paupières assortis.', usage:'Appliqués et fondus au pinceau.', aide:'Crée tous les regards du nude au smoky.' },
    'Palette Maquillage': { utilite:'Palette complète multi-zones.', usage:'Yeux, joues, contouring réunis.', aide:'Maquillage complet avec un seul produit.' },
    'Blush Poudre': { utilite:'Donne bonne mine aux joues.', usage:'Estompé sur les pommettes.', aide:'Touche de fraîcheur indispensable.' },
    'Blush Crème': { utilite:'Effet bonne mine naturel et glowy.', usage:'Tapoté aux doigts sur les pommettes.', aide:'Rendu "peau" très tendance.' },
    'Highlighter': { utilite:'Illumine les points hauts du visage.', usage:'Posé sur pommettes, arête du nez, arcade.', aide:'Effet lumineux qui sublime la photo.' },
    'Bronzer': { utilite:'Réchauffe et structure le visage.', usage:'Appliqué dans les creux et le contour.', aide:'Donne du relief au teint.' },
    'Mascara Volume': { utilite:'Épaissit et intensifie les cils.', usage:'Brossé de la racine à la pointe.', aide:'Regard intense, finition d’un make-up.' },
    'Mascara Allongeant': { utilite:'Allonge et recourbe les cils.', usage:'Appliqué en zigzag sur les cils.', aide:'Ouvre le regard naturellement.' },
    'Eyeliner Liquide': { utilite:'Trace un trait net sur la paupière.', usage:'Ligne tirée au ras des cils.', aide:'Regard graphique, prestation soignée.' },
    'Crayon Yeux': { utilite:'Souligne et intensifie le regard.', usage:'Tracé au ras ou en intérieur de l’œil.', aide:'Base du maquillage des yeux.' },
    'Crayon Sourcils': { utilite:'Redessine et comble les sourcils.', usage:'Petits traits poil par poil.', aide:'Sourcils structurés qui encadrent le visage.' },
    'Gel Sourcils': { utilite:'Fixe et discipline les sourcils.', usage:'Brossé pour coiffer et fixer.', aide:'Sourcils nets toute la journée.' },
    'Rouge à Lèvres Mat': { utilite:'Couleur lèvres longue tenue mate.', usage:'Appliqué en une ou deux couches.', aide:'Tenue parfaite pour événements.' },
    'Rouge à Lèvres': { utilite:'Habille et colore les lèvres.', usage:'Appliqué directement ou au pinceau.', aide:'Touche finale d’un maquillage abouti.' },
    'Gloss Brillant': { utilite:'Brillance et volume aux lèvres.', usage:'Déposé seul ou sur un rouge.', aide:'Effet lèvres pulpeuses très apprécié.' },
    'Crayon Lèvres': { utilite:'Redessine le contour des lèvres.', usage:'Tracé puis estompé avant le rouge.', aide:'Tenue du rouge et lèvres bien dessinées.' },
    'Set de Pinceaux': { utilite:'Pinceaux pour chaque zone du visage.', usage:'Teint, yeux, contouring selon la forme.', aide:'Application pro et fondus impeccables.' },
    'Éponge Beauté': { utilite:'Estompe le teint sans démarcation.', usage:'Humidifiée puis tapotée sur la peau.', aide:'Fini "seconde peau" naturel.' },
    'Spray Fixateur': { utilite:'Fixe le maquillage longue durée.', usage:'Vaporisé en fin de mise en beauté.', aide:'Maquillage qui tient des heures.' },
    'Démaquillant Doux': { utilite:'Retire le maquillage en douceur.', usage:'Sur coton avant le nettoyage.', aide:'Préserve la peau, conseil à revendre.' },
    'Lingettes Démaquillantes': { utilite:'Démaquillage express.', usage:'Passées sur le visage.', aide:'Pratique pour un nettoyage rapide.' },
    'Faux Cils': { utilite:'Volume et longueur immédiats.', usage:'Collés au ras des cils.', aide:'Effet glamour pour les occasions.' },
    'Colle Faux Cils': { utilite:'Fixe les faux cils.', usage:'Fine ligne sur la bande, posée après séchage léger.', aide:'Tenue sûre des cils toute la soirée.' },
    'Coffret Maquillage': { utilite:'Set maquillage complet.', usage:'Tout le nécessaire réuni.', aide:'Idéal revente ou kit débutante.' },
    'Trousse Maquillage': { utilite:'Range et transporte le matériel.', usage:'Organise pinceaux et produits.', aide:'Poste mobile et ordonné.' },
    'Miroir LED': { utilite:'Éclairage parfait pour le maquillage.', usage:'Lumière réglable pendant la mise en beauté.', aide:'Précision et confort de travail.' },

    /* ---------------- SOINS VISAGE ---------------- */
    'Gel Nettoyant': { utilite:'Nettoie la peau en profondeur.', usage:'Massé sur peau humide puis rincé.', aide:'1ʳᵉ étape d’un soin visage réussi.' },
    'Mousse Nettoyante': { utilite:'Nettoie en douceur sans dessécher.', usage:'Moussée sur le visage puis rincée.', aide:'Convient aux peaux sensibles.' },
    'Eau Micellaire': { utilite:'Nettoie et démaquille sans rinçage.', usage:'Sur coton, matin et soir.', aide:'Préparation rapide avant le soin.' },
    'Tonique': { utilite:'Resserre les pores et rééquilibre la peau.', usage:'Tapoté après le nettoyage.', aide:'Peau prête à recevoir les soins.' },
    'Lotion Apaisante': { utilite:'Calme les rougeurs et apaise.', usage:'Appliquée après nettoyage.', aide:'Idéale après épilation ou soin.' },
    'Sérum Vitamine C': { utilite:'Illumine et unifie le teint.', usage:'Quelques gouttes le matin avant la crème.', aide:'Éclat visible, soin "anti-terne".' },
    'Sérum Acide Hyaluronique': { utilite:'Hydrate intensément et repulpe.', usage:'Sur peau légèrement humide, avant la crème.', aide:'Peau rebondie, effet bonne mine.' },
    'Sérum Rétinol': { utilite:'Lisse rides et grain de peau.', usage:'Le soir, en petite quantité.', aide:'Soin anti-âge premium recherché.' },
    'Sérum Éclat': { utilite:'Ravive l’éclat du teint.', usage:'Appliqué avant la crème.', aide:'Coup d’éclat immédiat avant événement.' },
    'Crème Hydratante': { utilite:'Hydrate et protège la peau.', usage:'Matin et soir sur visage propre.', aide:'Base de toute routine, à recommander.' },
    'Crème de Nuit': { utilite:'Nourrit et régénère pendant le sommeil.', usage:'Le soir en couche généreuse.', aide:'Peau reposée au réveil.' },
    'Crème Anti-Âge': { utilite:'Cible rides et fermeté.', usage:'Massée matin et/ou soir.', aide:'Soin haut de gamme à forte valeur.' },
    'Crème Éclaircissante': { utilite:'Unifie et atténue les taches.', usage:'Appliquée régulièrement sur zones ciblées.', aide:'Réponse à une demande locale forte.' },
    'Contour des Yeux': { utilite:'Soigne cernes, poches et ridules.', usage:'Tapoté autour de l’œil du bout du doigt.', aide:'Regard reposé, finition d’expert.' },
    'Patchs Yeux': { utilite:'Décongestionnent le regard.', usage:'Posés sous les yeux 15 min.', aide:'Effet "coup de frais" avant maquillage.' },
    'Masque Argile': { utilite:'Purifie et resserre les pores.', usage:'Posé 10 min puis rincé.', aide:'Soin purifiant pour peaux mixtes/grasses.' },
    'Masque Tissu': { utilite:'Hydrate intensément en une pose.', usage:'Appliqué 15 min, sérum massé ensuite.', aide:'Soin express très apprécié.' },
    'Masque Peel-off': { utilite:'Nettoie et resserre en se retirant.', usage:'Posé puis retiré d’un seul tenant.', aide:'Effet satisfaisant qui fidélise.' },
    'Gommage Visage': { utilite:'Élimine les cellules mortes.', usage:'Massé en mouvements circulaires puis rincé.', aide:'Peau lisse, étape clé avant les soins.' },
    'Exfoliant Doux': { utilite:'Affine le grain de peau en douceur.', usage:'1 à 2 fois par semaine.', aide:'Teint plus lumineux et net.' },
    'Huile Visage': { utilite:'Nourrit et protège le film cutané.', usage:'Quelques gouttes en fin de routine.', aide:'Confort et éclat des peaux sèches.' },
    'Brume Hydratante': { utilite:'Rafraîchit et hydrate à tout moment.', usage:'Vaporisée sur le visage.', aide:'Touche de fraîcheur, fixe le maquillage.' },
    'Crème Solaire SPF50': { utilite:'Protège des UV et des taches.', usage:'En dernier le matin, à renouveler.', aide:'Soin prévention essentiel à conseiller.' },
    'Rouleau de Jade': { utilite:'Masse et décongestionne le visage.', usage:'Roulé du centre vers l’extérieur.', aide:'Geste bien-être qui valorise le soin.' },
    'Gua Sha': { utilite:'Sculpte et draine les traits.', usage:'Glissé sur la peau huilée.', aide:'Effet "lifting" naturel apprécié.' },
    'Baume Réparateur': { utilite:'Répare les zones sèches et abîmées.', usage:'Appliqué localement.', aide:'Solution SOS multi-usage.' },

    /* ---------------- CAPILLAIRE ---------------- */
    'Shampoing Doux': { utilite:'Lave sans agresser le cuir chevelu.', usage:'Massé puis rincé.', aide:'Base de tout soin capillaire.' },
    'Shampoing Antipelliculaire': { utilite:'Lutte contre les pellicules.', usage:'Laissé poser quelques minutes avant rinçage.', aide:'Réponse ciblée à une demande fréquente.' },
    'Shampoing Sec': { utilite:'Rafraîchit sans eau.', usage:'Vaporisé aux racines puis brossé.', aide:'Dépannage rapide entre deux lavages.' },
    'Après-Shampoing': { utilite:'Démêle et adoucit la fibre.', usage:'Sur longueurs après le shampoing, puis rincé.', aide:'Cheveux faciles à coiffer.' },
    'Masque Capillaire': { utilite:'Nourrit en profondeur.', usage:'Posé 5-10 min sur longueurs puis rincé.', aide:'Soin intensif qui répare les cheveux abîmés.' },
    'Soin Sans Rinçage': { utilite:'Protège et démêle sans rincer.', usage:'Vaporisé/appliqué sur cheveux essorés.', aide:'Protection thermique et brillance.' },
    'Huile Cheveux': { utilite:'Nourrit, gaine et fait briller.', usage:'Quelques gouttes sur les pointes.', aide:'Finition brillante anti-frisottis.' },
    'Huile de Ricin': { utilite:'Fortifie et stimule la pousse.', usage:'Massée sur cuir chevelu et longueurs.', aide:'Soin naturel très demandé localement.' },
    'Sérum Pousse': { utilite:'Active la croissance des cheveux.', usage:'Appliqué sur le cuir chevelu régulièrement.', aide:'Réponse à la demande de longueur.' },
    'Lotion Anti-Chute': { utilite:'Limite la chute des cheveux.', usage:'Massée sur le cuir chevelu en cure.', aide:'Soin ciblé à fort intérêt client.' },
    'Crème Boucles': { utilite:'Définit et hydrate les boucles.', usage:'Travaillée sur cheveux humides.', aide:'Boucles nettes, indispensable cheveux texturés.' },
    'Beurre de Karité': { utilite:'Nourrit intensément cheveux et peau.', usage:'Appliqué en faible quantité.', aide:'Produit naturel polyvalent apprécié.' },
    'Lait Capillaire': { utilite:'Hydrate et assouplit au quotidien.', usage:'Vaporisé/appliqué sans rinçage.', aide:'Entretien quotidien des cheveux secs.' },
    'Gelée Coiffante': { utilite:'Fixe et discipline la coiffure.', usage:'Travaillée sur cheveux humides.', aide:'Contrôle les baby hairs et finitions.' },
    'Gel Fixation': { utilite:'Tient la coiffure en place.', usage:'Appliqué pour structurer.', aide:'Finitions nettes et durables.' },
    'Spray Coiffant': { utilite:'Fixe et donne de la tenue.', usage:'Vaporisé sur la coiffure finie.', aide:'Coiffure qui dure toute la journée.' },
    'Mousse Coiffante': { utilite:'Apporte volume et tenue.', usage:'Répartie sur cheveux humides.', aide:'Volume durable au coiffage.' },
    'Teinture Cheveux': { utilite:'Colore les cheveux.', usage:'Préparée puis appliquée mèche par mèche.', aide:'Prestation coloration à forte valeur.' },
    'Bonnet Satin': { utilite:'Protège les cheveux la nuit.', usage:'Porté pour dormir.', aide:'Accessoire revente apprécié.' },
    'Foulard Satin': { utilite:'Préserve coiffure et hydratation.', usage:'Noué autour des cheveux.', aide:'Complément de revente facile.' },
    'Peigne Pro': { utilite:'Démêle et sépare les mèches.', usage:'Utilisé pour les sections et le coiffage.', aide:'Outil de base du coiffage.' },
    'Brosse Démêlante': { utilite:'Démêle sans casser.', usage:'Sur cheveux humides ou secs.', aide:'Confort et préservation de la fibre.' },

    /* ---------------- MOBILIER & CABINES ---------------- */
    'Table de Manucure': { utilite:'Poste de travail dédié à la manucure.', usage:'Plan de travail avec repose-mains.', aide:'Confort, image pro et productivité.' },
    'Table avec Aspirateur': { utilite:'Table intégrant l’aspiration de poussière.', usage:'Aspiration directe pendant le limage.', aide:'Hygiène et confort réunis en un meuble.' },
    'Fauteuil Pédicure': { utilite:'Siège dédié aux soins des pieds.', usage:'Cliente installée pour la pédicure.', aide:'Prestation pédicure confortable et premium.' },
    'Fauteuil Spa': { utilite:'Fauteuil de soin tout confort.', usage:'Pour soins prolongés.', aide:'Expérience haut de gamme fidélisante.' },
    'Cabine UV': { utilite:'Espace de soin/séchage dédié.', usage:'Installation fixe du salon.', aide:'Structure votre espace professionnel.' },
    'Tabouret Réglable': { utilite:'Assise ergonomique pour la praticienne.', usage:'Hauteur ajustée au poste.', aide:'Préserve votre dos sur la durée.' },
    'Tabouret Roulant': { utilite:'Tabouret mobile à roulettes.', usage:'Déplacement facile autour du poste.', aide:'Gain de mobilité et de confort.' },
    'Chariot de Soin': { utilite:'Range et déplace le matériel.', usage:'Outils à portée pendant la prestation.', aide:'Poste organisé = travail plus rapide.' },
    'Chariot 3 Tiroirs': { utilite:'Rangement mobile à tiroirs.', usage:'Produits classés et accessibles.', aide:'Ordre et efficacité au quotidien.' },
    'Lampe Loupe': { utilite:'Éclaire et grossit la zone de travail.', usage:'Positionnée au-dessus des mains.', aide:'Précision maximale sur les détails.' },
    'Lampe sur Pied': { utilite:'Éclairage d’appoint orientable.', usage:'Dirigée sur le poste de travail.', aide:'Bonne lumière = travail soigné.' },
    'Repose-Pieds': { utilite:'Soutient le pied pendant la pédicure.', usage:'Pied posé pour le soin.', aide:'Confort cliente et praticienne.' }
  };

  // Repli par catégorie quand le type précis n'est pas connu.
  const CAT_FALLBACK = {
    ongles:     { utilite:'Produit d’onglerie professionnel.', usage:'À intégrer dans votre routine de pose.', aide:'Complète votre prestation ongles.' },
    kits:       { utilite:'Cosmétique de maquillage.', usage:'À utiliser lors de la mise en beauté.', aide:'Enrichit votre offre maquillage.' },
    visage:     { utilite:'Soin du visage.', usage:'À intégrer à la routine soin.', aide:'Renforce vos prestations de soin.' },
    capillaire: { utilite:'Soin capillaire.', usage:'À appliquer selon le type de cheveux.', aide:'Complète votre offre capillaire.' },
    meubles:    { utilite:'Équipement de salon.', usage:'Installé dans votre espace de travail.', aide:'Améliore le confort et l’image du salon.' },
    machines:   { utilite:'Appareil professionnel.', usage:'Utilisé pendant la prestation.', aide:'Gagne en efficacité et en qualité.' }
  };

  // Recettes de kits COHÉRENTS, par priorité métier (1 = le plus essentiel).
  // Chaque entrée est un début de nom de produit (type). Le composeur prend le
  // meilleur produit disponible de chaque type, dans l'ordre, selon le budget.
  const RECIPES = {
    ongles:     ['Base Coat','Gel UV Couleur','Top Coat','Primer Ongles','Lime Professionnelle','Huile Cuticules','Dissolvant Doux','Pinceau Nail Art','Capsules French','Strass Nail Art'],
    kits:       ['Base de Teint','Fond de Teint','Anticernes','Poudre Compacte','Palette Fards','Mascara Volume','Blush Poudre','Rouge à Lèvres','Set de Pinceaux','Spray Fixateur'],
    visage:     ['Gel Nettoyant','Eau Micellaire','Tonique','Sérum Vitamine C','Crème Hydratante','Contour des Yeux','Masque Argile','Crème Solaire SPF50'],
    capillaire: ['Shampoing Doux','Après-Shampoing','Masque Capillaire','Soin Sans Rinçage','Huile Cheveux','Sérum Pousse'],
    machines:   ['Lampe UV/LED 48W','Ponceuse Ongles','Aspirateur Manucure','Stérilisateur UV','Sèche-Ongles'],
    meubles:    ['Table de Manucure','Tabouret Roulant','Lampe Loupe','Chariot de Soin','Repose-Pieds'],
    // Toutes catégories : kit "technicienne ongles" prêt à travailler (cross-catégorie).
    _default:   ['Base Coat','Gel UV Couleur','Top Coat','Lampe UV/LED 48W','Ponceuse Ongles','Lime Professionnelle','Huile Cuticules','Pinceau Nail Art','Dissolvant Doux']
  };

  // Trie les clés par longueur décroissante pour matcher le type le plus précis.
  const KEYS = Object.keys(KB).sort((a,b)=> b.length - a.length);

  function typeOf(name){
    const n = String(name||'');
    for(const k of KEYS){ if(n === k || n.indexOf(k + ' ') === 0) return k; }
    return null;
  }

  window.YAYRA_KIT_KB = {
    RECIPES,
    typeOf,
    // Renvoie {type, utilite, usage, aide} pour un produit (nom + slug catégorie).
    info(name, categorySlug){
      const t = typeOf(name);
      if(t) return Object.assign({ type:t }, KB[t]);
      const f = CAT_FALLBACK[categorySlug] || CAT_FALLBACK.ongles;
      return Object.assign({ type:null }, f);
    },
    recipe(categorySlug){
      return RECIPES[categorySlug] || RECIPES._default;
    }
  };
})();
