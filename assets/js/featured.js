(function(){
  async function fetchFeatured(){
    try{
      const res = await fetch('api/products.php?action=featured&limit=6');
      const data = await res.json();
      if(!data.ok) return [];
      return data.products || [];
    }catch(e){
      return [];
    }
  }

  function currencyFCFA(n){
    const v = parseInt(n,10) || 0;
    return v.toLocaleString('fr-FR') + ' FCFA';
  }

  function render(){
    const grid = document.getElementById('featured-products');
    if(!grid) return;

    fetchFeatured().then(products => {
      grid.innerHTML = '';
      products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <div class="product-thumb" style="background-image:url('${p.image_url || ''}'); background-size:cover; background-position:center;"></div>
          <div class="product-info" style="flex:1;">
            <h4>${p.name}</h4>
            <p>${p.description || ''}</p>
            <div class="price">${currencyFCFA(p.price_fcfa)}</div>
            <div class="product-actions">
              <button class="small-btn" data-add-to-cart data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price_fcfa}" data-qty="1">Ajouter au panier</button>
              <a href="shop.html?product=${p.id}" class="small-btn" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">Détails</a>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();

