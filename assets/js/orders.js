/* =====================================================================
   YAYRA — Commandes
   - Création d'une commande à partir du panier.
   - Envoi WhatsApp : fiche pro brandée (texte) vers la boutique.
   - Partage Firebase (REST) : la commande arrive AUTOMATIQUEMENT chez l'admin.
   - Validation du paiement par l'admin (statut "payé" + date).
   - Historique : visible côté admin ET côté client (avec date).
   Cache localStorage de secours (affichage instantané / hors-ligne).
   ===================================================================== */
window.YAYRA_ORDERS = (function(){
  const BOUTIQUE_WA = '22897498685';        // numéro WhatsApp de la boutique
  const LKEY = 'yayra_orders_v1';

  function db(){ return (window.FIREBASE_CONFIG && FIREBASE_CONFIG.databaseURL) ? FIREBASE_CONFIG.databaseURL.replace(/\/$/, '') : ''; }
  function loadLocal(){ try{ return JSON.parse(localStorage.getItem(LKEY) || '[]'); }catch(e){ return []; } }
  function saveLocal(a){ try{ localStorage.setItem(LKEY, JSON.stringify(a)); }catch(e){} }
  function upsertLocal(o){ const a = loadLocal(); const i = a.findIndex(x=> x.id === o.id); if(i > -1) a[i] = o; else a.unshift(o); saveLocal(a); }

  const fcfa = (n)=> (parseInt(n,10)||0).toLocaleString('fr-FR') + ' FCFA';
  const p2 = (n)=> String(n).padStart(2,'0');
  function dateStr(ts){ const d = new Date(ts); return p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear()+' à '+p2(d.getHours())+'h'+p2(d.getMinutes()); }
  function makeRef(ts){ const d = new Date(ts); return 'YAY-'+String(d.getFullYear()).slice(2)+p2(d.getMonth()+1)+p2(d.getDate())+'-'+p2(d.getHours())+p2(d.getMinutes())+p2(d.getSeconds()); }

  // Crée la commande : enregistrement local immédiat + push Firebase (admin).
  async function create(data){
    const now = Date.now();
    const id = 'O' + now;
    const order = {
      id,
      ref: makeRef(now),
      full_name: (data.full_name||'').trim(),
      phone: (data.phone||'').trim(),
      address: (data.address||'').trim(),
      clientEmail: String(data.clientEmail||'').trim().toLowerCase(),
      clientId: data.clientId || '',
      items: (data.items||[]).map(it=> ({ name: it.name||'', qty: parseInt(it.qty,10)||1, price_fcfa: parseInt(it.price_fcfa,10)||0 })),
      total_fcfa: parseInt(data.total_fcfa,10)||0,
      status: 'pending',
      created: now,
      createdStr: dateStr(now)
    };
    upsertLocal(order);
    const DB = db();
    if(DB){ try{ await fetch(DB + '/orders/' + id + '.json', { method:'PUT', body: JSON.stringify(order) }); }catch(e){} }
    return order;
  }

  // Fiche pro (texte brandé) pour WhatsApp.
  function waFiche(order){
    const L = [];
    L.push('🌸 *YAYRA Nail Shop* 🌸');
    L.push('_Maison de beauté · Lomé_');
    L.push('━━━━━━━━━━━━━━━━━');
    L.push('🧾 *NOUVELLE COMMANDE*');
    L.push('N° : *' + order.ref + '*');
    L.push('🗓 ' + order.createdStr);
    L.push('');
    L.push('👤 *Cliente*');
    if(order.full_name) L.push('• ' + order.full_name);
    if(order.phone)     L.push('• ' + order.phone);
    if(order.address)   L.push('• ' + order.address);
    L.push('');
    L.push('🛍 *Articles*');
    (order.items||[]).forEach(it=>{ L.push('• ' + it.name + '  ×' + it.qty + '  —  ' + fcfa((it.price_fcfa||0)*(it.qty||0))); });
    L.push('━━━━━━━━━━━━━━━━━');
    L.push('💰 *TOTAL : ' + fcfa(order.total_fcfa) + '*');
    L.push('');
    L.push('Merci de me confirmer le paiement et la livraison. 💖');
    return L.join('\n');
  }
  function waUrl(order, number){
    return 'https://wa.me/' + (number || BOUTIQUE_WA) + '?text=' + encodeURIComponent(waFiche(order));
  }

  // Toutes les commandes (admin) : Firebase + local fusionnés, triées récentes d'abord.
  async function listAll(){
    const DB = db(); let remote = [];
    if(DB){ try{ const r = await fetch(DB + '/orders.json'); const v = await r.json(); if(v && typeof v === 'object') remote = Object.keys(v).map(k=> v[k]); }catch(e){} }
    const map = {};
    loadLocal().forEach(o=> { if(o && o.id) map[o.id] = o; });
    remote.forEach(o=> { if(o && o.id) map[o.id] = o; });
    return Object.keys(map).map(k=> map[k]).sort((a,b)=> (b.created||0) - (a.created||0));
  }

  // Commandes d'un client donné (historique côté cliente).
  async function listForClient(email){
    const e = String(email||'').trim().toLowerCase();
    if(!e) return [];
    return (await listAll()).filter(o=> String(o.clientEmail||'').trim().toLowerCase() === e);
  }

  // Total effectif (après réduction éventuelle).
  function effectiveTotal(o){ return (o && o.discount_fcfa > 0) ? Math.max(0, (o.total_fcfa||0) - o.discount_fcfa) : (o ? o.total_fcfa||0 : 0); }
  // Téléphone -> chiffres internationaux pour wa.me (sans +, espaces, etc.).
  function intlDigits(phone){ return String(phone||'').replace(/[^0-9]/g, ''); }

  async function fetchOrder(id){
    const DB = db();
    let order = loadLocal().find(o=> o.id === id) || null;
    if(DB){ try{ const r = await fetch(DB + '/orders/' + id + '.json'); const v = await r.json(); if(v) order = v; }catch(e){} }
    return order;
  }
  async function persist(order){
    upsertLocal(order);
    const DB = db();
    if(DB){ try{ await fetch(DB + '/orders/' + order.id + '.json', { method:'PUT', body: JSON.stringify(order) }); }catch(e){} }
    return order;
  }

  // L'admin applique une réduction : nouveau total + notification pour la cliente.
  async function applyDiscount(id, amountFcfa){
    const amount = Math.max(0, parseInt(amountFcfa,10)||0);
    const order = await fetchOrder(id);
    if(!order) return null;
    const now = Date.now();
    order.discount_fcfa = amount;
    order.total_after = Math.max(0, (order.total_fcfa||0) - amount);
    order.discountAt = now;
    order.discountStr = dateStr(now);
    order.clientNotice = amount > 0 ? ('Bonne nouvelle : une réduction de ' + fcfa(amount) + ' a été appliquée à votre commande !') : '';
    return persist(order);
  }

  // Facture proforma (texte) à envoyer à la CLIENTE par WhatsApp.
  function waInvoice(order){
    const L = [];
    L.push('🌸 *YAYRA Nail Shop* 🌸');
    L.push('_Maison de beauté · Lomé_');
    L.push('━━━━━━━━━━━━━━━━━');
    L.push('🧾 *FACTURE PROFORMA*');
    L.push('N° : *' + order.ref + '*');
    L.push('🗓 ' + order.createdStr);
    if(order.full_name) L.push('Cliente : ' + order.full_name);
    L.push('');
    L.push('🛍 *Détail*');
    (order.items||[]).forEach(it=>{ L.push('• ' + it.name + '  ×' + it.qty + '  —  ' + fcfa((it.price_fcfa||0)*(it.qty||0))); });
    L.push('━━━━━━━━━━━━━━━━━');
    L.push('Sous-total : ' + fcfa(order.total_fcfa));
    if(order.discount_fcfa > 0){
      L.push('Réduction : - ' + fcfa(order.discount_fcfa));
      L.push('💰 *NET À PAYER : ' + fcfa(effectiveTotal(order)) + '*');
    } else {
      L.push('💰 *TOTAL : ' + fcfa(order.total_fcfa) + '*');
    }
    L.push('Statut : ' + statusLabel(order.status));
    L.push('');
    L.push('Merci de votre confiance. 💖');
    return L.join('\n');
  }
  function waInvoiceUrl(order){
    const num = intlDigits(order.phone);
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(waInvoice(order));
  }

  // L'admin confirme le paiement : statut "payé" + date, partout.
  async function confirmPaid(id){
    const now = Date.now();
    const DB = db();
    let order = loadLocal().find(o=> o.id === id) || null;
    if(DB){ try{ const r = await fetch(DB + '/orders/' + id + '.json'); const v = await r.json(); if(v) order = v; }catch(e){} }
    if(!order) return null;
    order.status = 'paid';
    order.paidAt = now;
    order.paidStr = dateStr(now);
    upsertLocal(order);
    if(DB){ try{ await fetch(DB + '/orders/' + id + '.json', { method:'PUT', body: JSON.stringify(order) }); }catch(e){} }
    return order;
  }

  function statusLabel(s){ return s === 'paid' ? 'Payé' : (s === 'cancelled' ? 'Annulé' : 'En attente de paiement'); }

  return { create, waFiche, waUrl, listAll, listForClient, confirmPaid, applyDiscount, effectiveTotal, waInvoice, waInvoiceUrl, intlDigits, fcfa, dateStr, statusLabel, BOUTIQUE_WA };
})();
