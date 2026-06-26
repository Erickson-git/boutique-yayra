/* Service worker YAYRA Nail Shop.
   Stratégie : network-first pour HTML/CSS/JS (toujours la dernière version en
   ligne = mise à jour automatique), cache-first pour les images, secours hors-ligne.
   Bumper CACHE à chaque déploiement majeur pour nettoyer l'ancien cache. */
const CACHE = 'yayra-v8';
const SHELL = ['./','./index.html','./shop.html','./assets/css/main.css','./assets/favicon.svg','./manifest.webmanifest'];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  // {cache:'reload'} : on récupère la version RÉSEAU fraîche (contourne le cache HTTP du navigateur)
  e.waitUntil(caches.open(CACHE).then(c=> Promise.all(SHELL.map(u=>
    fetch(u, { cache:'reload' }).then(r=>{ if(r && r.ok) return c.put(u, r); }).catch(()=>{})
  ))));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=> k !== CACHE).map(k=> caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e)=>{ if(e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  let url;
  try{ url = new URL(req.url); }catch(_){ return; }
  if(url.origin !== location.origin) return;                 // cross-origin (fonts, firebase, unsplash) : laisser le navigateur
  if(/\.(mp4|webm)$/i.test(url.pathname)) return;            // vidéos : pas de cache (trop volumineux)
  if(url.pathname.indexOf('/api/') > -1) return;            // API : pas de cache

  const isAsset = /\.(jpg|jpeg|png|gif|webp|svg|ico|woff2?)$/i.test(url.pathname);
  if(isAsset){
    // cache-first, mais on ne met en cache QUE les réponses réussies (jamais un 404)
    e.respondWith(
      caches.match(req).then(c=> c || fetch(req).then(r=>{
        if(r && r.ok){ const cp = r.clone(); caches.open(CACHE).then(ca=> ca.put(req, cp)); }
        return r;
      }).catch(()=> c))
    );
    return;
  }
  // HTML / CSS / JS : network-first → toujours la dernière version, cache en secours hors-ligne
  e.respondWith(
    fetch(req).then(r=>{ if(r && r.ok){ const cp = r.clone(); caches.open(CACHE).then(ca=> ca.put(req, cp)); } return r; })
      .catch(()=> caches.match(req).then(c=> c || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
