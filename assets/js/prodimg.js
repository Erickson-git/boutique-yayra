/* Image produit : renvoie une VRAIE photo correspondant au TYPE du produit
   (vernis, rouge à lèvres, sérum, shampoing, fauteuil, machine…). Le choix est
   cloisonné par catégorie pour éviter les collisions de mots-clés
   (ex. « Gel » d'onglerie vs « Gel Nettoyant » visage). */
window.YAYRA_PRODIMG = (function(){
  function photoFor(name, cat){
    const n = (name||'').toLowerCase();
    cat = cat || '';
    switch(cat){
      case 'ongles':
        if(/strass|sticker|paillette|foil|stamping|pinceau|stylo|nail art/.test(n)) return 'net-nailart-red';
        if(/vernis|top coat|base coat|semi-perm/.test(n)) return 'nails-art';
        if(/gel|capsule|faux ongles|tips|acryl|french|poudre|liquide/.test(n)) return 'gel-nail-kit';
        if(/lime|polissoir|râpe|coupe-ongles|repousse|set manucure|kit pédicure|séparateur|dissolvant|cuticule|colle|brosse/.test(n)) return 'manicure-kit';
        return 'nails-art';
      case 'kits': // cosmétiques / maquillage
        if(/rouge à lèvres|gloss|lèvres/.test(n)) return 'net-lipstick';
        if(/mascara|eyeliner|yeux|sourcils|faux cils|colle/.test(n)) return 'net-makeup-dark';
        if(/palette|fards/.test(n)) return 'net-makeup-palette';
        if(/fond de teint|bb crème|base de teint/.test(n)) return 'net-makeup-marble';
        if(/poudre|blush|highlighter|bronzer|terre|anticerne|correcteur/.test(n)) return 'net-makeup-marble';
        if(/pinceau|éponge/.test(n)) return 'net-makeup-brushes';
        if(/coffret|trousse|miroir/.test(n)) return 'makeup-kit-allinone';
        if(/spray fixateur|démaquillant|lingette/.test(n)) return 'net-makeup-dark';
        return 'net-makeup-palette';
      case 'visage':
        if(/vitamine c/.test(n)) return 'vitamin-c-kit';
        if(/sérum/.test(n)) return 'net-serums-luxe';
        if(/masque|patch|gommage|exfoliant|argile|peel/.test(n)) return 'net-facemask';
        if(/nettoyant|nettoyante/.test(n)) return 'net-cleanser';
        if(/eau micellaire|tonique|lotion|brume/.test(n)) return 'net-skincare-natural';
        if(/huile/.test(n)) return 'net-facial-oil';
        if(/contour|rouleau|gua sha|patch/.test(n)) return 'glowing-skin';
        if(/crème|hydratant|anti-âge|nuit|éclaircissante|baume|solaire|stick/.test(n)) return 'net-lotion-linen';
        return 'net-serums-luxe';
      case 'capillaire':
        if(/shampoing|après-shampoing|antipell/.test(n)) return 'haircare-malibu';
        if(/masque|huile|ricin|pousse|anti-chute|sans rinçage|fortifiant/.test(n)) return 'net-hairmask';
        if(/bonnet|foulard|peigne|brosse/.test(n)) return 'hair-strands';
        if(/spray|mousse|gel|boucles|beurre|lait|gelée|teinture|coiffant|coiffante/.test(n)) return 'hair-styling';
        return 'haircare-malibu';
      case 'meubles':
        if(/fauteuil|spa|bac à shampoing|banc/.test(n)) return 'net-salon';
        return 'nail-desk-pro';
      case 'machines':
        return 'nail-master';
      default:
        return 'beauty-flatlay';
    }
  }

  function url(p){
    p = p || {};
    // Priorité à l'image par type (assets/images/p/...) fournie par le catalogue ;
    // repli sur une photo générique de la catégorie si absente.
    if(p.image_url && p.image_url.indexOf('assets/images/p/') === 0) return p.image_url;
    return 'assets/images/' + photoFor(p.name, p.category_slug) + '.jpg';
  }

  // Lien d'image DIRECT depuis le net, ciblé par le nom COMPLET du produit
  // (variante/teinte incluse) -> image web spécifique et différente par produit.
  const CATKW = { ongles:'manucure ongles', kits:'maquillage cosmétique', visage:'soin visage crème', capillaire:'cheveux soin', meubles:'mobilier salon beauté', machines:'appareil esthétique' };
  function netUrl(p){
    p = p || {};
    const n = (p.name || '').replace(/\s+/g, ' ').trim();
    const kw = CATKW[p.category_slug] || 'beauté produit';
    const q = encodeURIComponent((n + ' ' + kw).trim());
    return 'https://tse.mm.bing.net/th?q=' + q + '&w=600&h=600&c=7&dpr=1';
  }
  return { url, photoFor, netUrl };
})();
