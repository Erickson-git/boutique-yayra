(function(){
  function fallback(){
    return (window.YAYRA_CATALOG ? window.YAYRA_CATALOG.featured(8) : []);
  }
  async function fetchFeatured(){
    try{
      const res = await fetch('api/products.php?action=featured&limit=8');
      const data = await res.json();
      if(!data.ok || !data.products || !data.products.length) return fallback();
      return data.products;
    }catch(e){ return fallback(); }
  }

  const currencyFCFA = (n)=> (parseInt(n,10)||0).toLocaleString('fr-FR') + ' FCFA';

  function render(){
    const grid = document.getElementById('featured-products');
    if(!grid) return;
    fetchFeatured().then(products => {
      grid.innerHTML = '';
      (products || []).slice().sort((a,b)=> String(a.name||'').localeCompare(String(b.name||''), 'fr', {sensitivity:'base', numeric:true})).forEach(p => {
        const img = (window.YAYRA_PRODIMG ? window.YAYRA_PRODIMG.url(p) : (p.image_url || 'assets/images/net-makeup-marble.jpg')).replace(/'/g,'');
        const inStock = p.is_available && p.stock_qty > 0;
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.innerHTML = `
          <div class="product-thumb"><img src="${img}" alt="${(p.name||'Produit').replace(/"/g,'')}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/net-makeup-marble.jpg'" /></div>
          <div class="product-info">
            <h4>${p.name}</h4>
            <p>${p.description || ''}</p>
            <div class="price">${currencyFCFA(p.price_fcfa)}</div>
            <div class="product-actions">
              ${inStock
                ? `<button class="small-btn" data-add-to-cart data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price_fcfa}" data-qty="1">Ajouter au panier</button>`
                : `<a href="shop.html#panier" class="small-btn">Voir en boutique</a>`}
              <a href="shop.html?cat=${p.category_slug||''}" class="small-btn">Détails</a>
            </div>
          </div>`;
        grid.appendChild(card);
        // Image web spécifique au produit (lien direct depuis le net) si elle charge
        if(window.YAYRA_PRODIMG && YAYRA_PRODIMG.netUrl){
          const im = card.querySelector('img'); const net = YAYRA_PRODIMG.netUrl(p);
          if(im){ const nim = new Image(); nim.onload = ()=>{ im.src = net; }; nim.src = net; }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
