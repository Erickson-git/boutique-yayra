/* Garde d'accès : réserve l'administration et le Studio (lancer un direct) à
   l'équipe (propriétaire / employés). Les clientes ne peuvent que PARTICIPER
   au direct (page live), pas en lancer ni accéder au back-office. */
(function(){
  try{
    var inClient = location.pathname.indexOf('/client/') > -1;
    var loginUrl = inClient ? 'login.html' : '../client/login.html';
    var dashUrl  = inClient ? 'dashboard.html' : '../client/dashboard.html';
    var token = localStorage.getItem('yayra_token');
    var role  = localStorage.getItem('yayra_role') || '';
    if(!token){ location.replace(loginUrl); return; }
    if(['admin','manager','vendeur'].indexOf(role) < 0){ location.replace(dashUrl); return; }
  }catch(e){}
})();
