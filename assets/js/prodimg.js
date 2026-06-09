/* Générateur d'images produit (SVG) : chaque produit reçoit une image propre
   avec une icône correspondant à son type, la couleur de sa catégorie et son nom.
   Garantit que chaque image correspond au produit / à la section. */
window.YAYRA_PRODIMG = (function(){
  // [fond clair 1, fond clair 2, accent] par catégorie
  const THEME = {
    ongles:    ['#f6e7ec','#efd6de','#bb6f8a'],
    kits:      ['#f3e9d8','#ecdcc2','#b1813a'],
    visage:    ['#e7f1ec','#d8ebe0','#4f9c79'],
    capillaire:['#efe6d8','#e6d6c0','#9a6b3f'],
    meubles:   ['#eae4d9','#ddd3c2','#6b5640'],
    machines:  ['#e6ecf1','#d6e0e8','#48637a']
  };

  // Icônes (viewBox 0 0 24 24) — tracées en lignes, faciles à reconnaître
  const ICONS = {
    bottle:  '<path d="M10 2h4v2l1 2v13a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6l1-2z"/><path d="M10 4h4"/>',
    jar:     '<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M4 5h16v3H4z"/>',
    tube:    '<path d="M9 3h6l-1 4v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7z"/><path d="M10 20h4"/>',
    lipstick:'<path d="M8 10h8v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="M9 10l1-6h4l1 6"/>',
    brush:   '<path d="M12 2v10"/><path d="M9 12h6v4a3 3 0 0 1-6 0z"/>',
    palette: '<rect x="3" y="5" width="18" height="11" rx="2"/><circle cx="7" cy="10.5" r="1.2"/><circle cx="11" cy="10.5" r="1.2"/><circle cx="15" cy="10.5" r="1.2"/>',
    droplet: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
    lamp:    '<path d="M8 3h8l2 6H6z"/><path d="M12 9v9"/><path d="M8 21h8"/>',
    chair:   '<path d="M6 11h12v6H6z"/><path d="M6 11V5h12v6"/><path d="M7 17v3M17 17v3"/>',
    table:   '<path d="M3 8h18"/><path d="M5 8v10M19 8v10"/><path d="M3 8l3-4h12l3 4"/>',
    device:  '<rect x="5" y="4" width="14" height="16" rx="2"/><rect x="8" y="7" width="8" height="6" rx="1"/><circle cx="12" cy="17" r="1.2"/>',
    tool:    '<path d="M5 19L17 7"/><path d="M14 4l6 6"/><path d="M5 19l-1 1"/>',
    sparkle: '<path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/><path d="M19 15l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z"/>',
    mirror:  '<circle cx="12" cy="9" r="6"/><path d="M12 15v5M9 20h6"/>',
    comb:    '<path d="M4 8h16"/><path d="M6 8v8M10 8v8M14 8v8M18 8v8"/>'
  };

  function keyFor(name){
    const n = (name||'').toLowerCase();
    if(/lampe|loupe/.test(n)) return 'lamp';
    if(/fauteuil|tabouret|banc/.test(n)) return 'chair';
    if(/table|bureau|meuble|étag|comptoir|présentoir|porte-manteau|repose|bac à/.test(n)) return 'table';
    if(/ponceuse|machine|stéril|autoclave|collecteur|aspirateur|vapozone|hydra|dermapen|cavitation|led|ultrason|sèche|ventilateur|chauffe|appareil|cabine/.test(n)) return 'device';
    if(/rouge à lèvres|gloss|baume lèvres|crayon lèvres/.test(n)) return 'lipstick';
    if(/palette|fards|coffret|trousse/.test(n)) return 'palette';
    if(/mascara|eyeliner|crayon|stylo|pinceau|sourcils/.test(n)) return 'brush';
    if(/poudre|blush|highlighter|bronzer|terre|anticernes|correcteur|compacte/.test(n)) return 'jar';
    if(/miroir/.test(n)) return 'mirror';
    if(/peigne|brosse|lime|polissoir|râpe|coupe-ongles|repousse|séparateur|gua sha|rouleau/.test(n)) return 'comb';
    if(/strass|paillettes|stickers|foil|stamping|cils/.test(n)) return 'sparkle';
    if(/crème|beurre|masque argile|gel construct|poudre acryl/.test(n)) return 'jar';
    if(/sérum|huile|gouttes/.test(n)) return 'droplet';
    if(/gel |gel nettoyant|mousse|nettoyant|gommage|exfoliant|bb crème|dentifrice|dissolvant|colle/.test(n)) return 'tube';
    if(/vernis|top coat|base coat|tonique|eau micellaire|lotion|shampoing|après-shampoing|spray|fond de teint|brume|fixateur|démaquillant|teinture|lait|sans rinçage|leave-in|fortifiant|soin/.test(n)) return 'bottle';
    if(/kit|set|capsules|faux ongles|tips|pédicure|manucure/.test(n)) return 'palette';
    if(/bonnet|foulard|satin/.test(n)) return 'jar';
    return 'sparkle';
  }

  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function wrap(name){
    const words = String(name||'').split(' '); const lines=[]; let cur='';
    words.forEach(w=>{ if((cur+' '+w).trim().length>16){ if(cur) lines.push(cur); cur=w; } else { cur=(cur+' '+w).trim(); } });
    if(cur) lines.push(cur);
    return lines.slice(0,2);
  }

  function url(p){
    const cat = (p && p.category_slug) || 'kits';
    const th = THEME[cat] || THEME.kits;
    const icon = ICONS[keyFor(p && p.name)] || ICONS.sparkle;
    const lines = wrap(p && p.name);
    const ty = lines.length>1 ? 372 : 384;
    const texts = lines.map((l,i)=> '<text x="200" y="'+(ty + i*30)+'" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#251b11">'+esc(l)+'</text>').join('');
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">'
      + '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+th[0]+'"/><stop offset="1" stop-color="'+th[1]+'"/></linearGradient></defs>'
      + '<rect width="400" height="500" fill="url(#g)"/>'
      + '<circle cx="200" cy="190" r="120" fill="#ffffff" opacity="0.55"/>'
      + '<g transform="translate(120,110) scale(6.7)" fill="none" stroke="'+th[2]+'" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'+icon+'</g>'
      + texts
      + '<text x="200" y="470" text-anchor="middle" font-family="Jost,Arial,sans-serif" font-size="13" letter-spacing="2" fill="'+th[2]+'">YAYRA NAIL SHOP</text>'
      + '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  return { url, keyFor };
})();
