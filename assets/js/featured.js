(function(){
  async function fetchFeatured(){
    try{
      const res = await fetch('api/products.php?action=featured&limit=8');
      const data = await res.json();
      if(!data.ok) return [];
      return data.products || [];
    }catch(e){ return []; }
  }

  const currencyFCFA = (n)=> (parseInt(n,10)||0).toLocaleString('fr-FR') + ' FCFA';

  function render(){
    const grid = document.getElementById('featured-products');
    if(!grid) return;
    fetchFeatured().then(products => {
      grid.innerHTML = '';
      products.forEach(p => {
        const img = (p.image_url || 'assets/images/net-makeup-marble.jpg').replace(/'/g,'');
        const inStock = p.is_available && p.stock_qty > 0;
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.innerHTML = `
          <div class="product-thumb"><img src="${img}" alt="${(p.name||'Produit').replace(/"/g,'')}" loading="lazy" /></div>
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
      });
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
