(function(){
  const KEY = 'yaya_cart_v1';

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : { items: [] };
    }catch(e){
      return { items: [] };
    }
  }

  function save(state){
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function findItem(items, productId){
    return items.find(x => String(x.product_id) === String(productId));
  }

  function add(product){
    const state = load();
    const items = state.items;
    const pid = product.id || product.product_id;
    const qtyToAdd = parseInt(product.qty || 1, 10);
    if(!pid || qtyToAdd <= 0) return;

    const existing = findItem(items, pid);
    if(existing){
      existing.qty += qtyToAdd;
    }else{
      items.push({
        product_id: pid,
        name: product.name || '',
        price_fcfa: product.price_fcfa || product.price || 0,
        qty: qtyToAdd
      });
    }
    save(state);
    syncCartCount();
  }

  function remove(productId){
    const state = load();
    state.items = state.items.filter(x => String(x.product_id) !== String(productId));
    save(state);
    syncCartCount();
  }

  function setQty(productId, qty){
    const state = load();
    qty = parseInt(qty, 10);
    state.items = state.items.map(x => {
      if(String(x.product_id) === String(productId)){
        return { ...x, qty: Math.max(0, qty) };
      }
      return x;
    }).filter(x => x.qty > 0);
    save(state);
    syncCartCount();
  }

  function total(){
    const state = load();
    let t = 0;
    for(const it of state.items){
      t += (parseInt(it.price_fcfa,10) || 0) * (parseInt(it.qty,10) || 0);
    }
    return t;
  }

  function syncCartCount(){
    const el = document.getElementById('cart-count');
    if(!el) return;
    const state = load();
    const count = state.items.reduce((a,b) => a + (parseInt(b.qty,10)||0), 0);
    el.textContent = String(count);
  }

  function attachButtons(){
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-add-to-cart]');
      if(!btn) return;
      e.preventDefault();

      const product = {
        id: btn.getAttribute('data-product-id'),
        name: btn.getAttribute('data-product-name') || '',
        price_fcfa: parseInt(btn.getAttribute('data-product-price') || '0', 10),
        qty: parseInt(btn.getAttribute('data-qty') || '1', 10),
      };

      add(product);
    });
  }

  window.YayaCart = {
    add,
    remove,
    setQty,
    load,
    total,
    syncCartCount,
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    syncCartCount();
    attachButtons();
  });
})();

