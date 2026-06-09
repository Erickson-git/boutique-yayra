/* =====================================================================
   CONFIGURATION DU LIVE (Firebase Realtime Database) — À REMPLIR
   ---------------------------------------------------------------------
   Le live en temps réel (caméra + chat + badge EN DIRECT partagé entre
   tous les appareils) a besoin d'un petit service gratuit : Firebase.

   ÉTAPES (une seule fois, ~3 min) :
   1) Va sur https://console.firebase.google.com et crée un projet gratuit.
   2) Menu « Realtime Database » → « Créer une base » → mode TEST
      (règles ouvertes en lecture/écriture pour démarrer).
   3) Roue dentée → Paramètres du projet → « Vos applications » →
      icône Web (</>) → enregistre l'app → copie l'objet de config.
   4) Colle les valeurs ci-dessous (surtout databaseURL), puis enregistre
      ce fichier et pousse sur GitHub. Le live fonctionnera aussitôt.

   Tant que ce n'est pas rempli, la page Live affiche « Aucun live en cours »
   et aucun badge ne s'affiche (aucune simulation).
   ===================================================================== */
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",   // ex : https://yayra-live-default-rtdb.firebaseio.com
  projectId: "",
  appId: ""
};
window.FIREBASE_READY = !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.databaseURL && window.FIREBASE_CONFIG.databaseURL.indexOf('http') === 0);
