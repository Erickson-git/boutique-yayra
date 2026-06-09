/* Pastille « éditeur du site » XOFIX International : petite icône logo dans un
   coin, qui ouvre une fenêtre de présentation + lien WhatsApp direct. */
(function(){
  function assetBase(){
    const p = location.pathname;
    return (p.indexOf('/client/') > -1 || p.indexOf('/admin/') > -1) ? '../assets/images/' : 'assets/images/';
  }
  const WA = 'https://wa.me/22896966676?text=' + encodeURIComponent('Bonjour XOFIX International !');
  const INFO = "XOFIX International est une entreprise spécialisée en cybersécurité et ingénierie logicielle, basée à Lomé, au Togo. Nous concevons des solutions digitales sur mesure — applications web et mobiles, systèmes de sécurité informatique, et logiciels métiers — pour accompagner particuliers, entreprises et organisations dans leur transformation numérique. Que vous ayez un projet from scratch ou un système existant à sécuriser et améliorer, nos experts sont là pour transformer vos idées en réalités technologiques robustes et performantes. Faites confiance à XOFIX : votre ambition digitale mérite une équipe à la hauteur.";

  function init(){
    const logo = assetBase() + 'xofix-logo.png';

    const badge = document.createElement('button');
    badge.className = 'xofix-badge';
    badge.setAttribute('aria-label', 'XOFIX International — éditeur du site');
    badge.title = 'Réalisé par XOFIX International';
    badge.innerHTML = '<img src="' + logo + '" alt="XOFIX International" />';

    const modal = document.createElement('div');
    modal.className = 'xofix-modal';
    modal.innerHTML =
      '<div class="xofix-card" role="dialog" aria-modal="true">'
      + '<button class="xofix-close" aria-label="Fermer"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
      + '<img class="xofix-logo" src="' + logo + '" alt="XOFIX International" />'
      + '<h3>XOFIX International</h3>'
      + '<p class="xofix-tag">Cybersécurité &amp; Ingénierie logicielle · Lomé</p>'
      + '<p>' + INFO + '</p>'
      + '<a class="btn-wa" href="' + WA + '" target="_blank" rel="noopener"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3.5 20l1.1-4.2a8.5 8.5 0 1 1 15.9-4.3Z"/><path d="M8.5 8.8c0 4 2.7 6.7 6.7 6.7"/></svg> WhatsApp : +228 96 96 66 76</a>'
      + '</div>';

    document.body.appendChild(badge);
    document.body.appendChild(modal);

    function open(){ modal.classList.add('open'); }
    function close(){ modal.classList.remove('open'); }
    badge.addEventListener('click', open);
    modal.querySelector('.xofix-close').addEventListener('click', close);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
  }

  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
