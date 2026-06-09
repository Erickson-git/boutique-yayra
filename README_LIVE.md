# Activer le LIVE en direct (gratuit, ~3 min)

Le live de YAYRA Nail Shop est **réel** (caméra en temps réel + chat + cœurs,
diffusé via WebRTC). Il a besoin d'un petit service gratuit pour la
signalisation et l'état « en direct » partagé : **Firebase Realtime Database**.

## Étapes (une seule fois)

1. Va sur https://console.firebase.google.com → **Ajouter un projet** (nom : `yayra-live`).
2. Dans le menu, ouvre **Realtime Database** → **Créer une base** → choisis une
   région → **Mode test** (lecture/écriture ouvertes pour démarrer).
3. Roue dentée (⚙) → **Paramètres du projet** → section **Vos applications** →
   icône **Web `</>`** → donne un surnom → **Enregistrer l'application**.
4. Copie l'objet `firebaseConfig` affiché, puis ouvre le fichier
   **`assets/js/firebase-config.js`** du projet et colle les valeurs
   (surtout **`databaseURL`**, du type `https://yayra-live-default-rtdb.firebaseio.com`).
5. Enregistre, `git commit` + `git push`. C'est tout.

## Utilisation

- **Côté boutique** : connecte-toi (komi / saxo2180) → tableau de bord →
  **Ouvrir le studio** → **Passer en direct** (autorise la caméra + le micro).
  Dès cet instant, le badge **EN DIRECT** apparaît sur tout le site pour
  **tous les visiteurs**, et la page **/live.html** diffuse ta caméra en réel.
- **Côté cliente** : ouvre le site → clique sur le badge **EN DIRECT** (ou le
  menu **Live**) → regarde en direct, commente, aime. Tout est réel et partagé.
- Pour terminer : **Arrêter le live** (le badge disparaît partout).

## Notes

- Tant que `firebase-config.js` n'est pas rempli : la page Live affiche
  « Aucun live en cours » et **aucun** badge ne s'affiche (zéro simulation).
- Le transport vidéo utilise des serveurs STUN/TURN gratuits (Open Relay) pour
  fonctionner derrière la plupart des réseaux mobiles.
- Modèle « un diffuseur → plusieurs spectateurs » en direct du navigateur :
  parfait pour un public restreint à moyen. Pour de très grandes audiences,
  on pourra brancher un service pro (Mux/LiveKit/Agora) plus tard.
- Pense à restreindre les règles de la Realtime Database après les tests
  (limiter l'écriture de `live/active` au compte propriétaire).

## ⚠️ IMPORTANT — Règles Firebase à ne pas oublier (sinon le live casse)

Le « mode test » de la Realtime Database **expire automatiquement** (par défaut au
bout de 30 jours, ici le 9 juillet 2026). **À cette date, le live, le badge, les
vidéos, les contacts et l'historique cesseront de fonctionner** tant que les règles
ne sont pas mises à jour.

Pour éviter ça, va dans **Firebase → Realtime Database → Règles**, remplace tout par
ceci (règles permanentes, sans date d'expiration), puis **Publier** :

```json
{
  "rules": {
    "live":         { ".read": true, ".write": true },
    "videos":       { ".read": true, ".write": true },
    "contacts":     { ".read": true, ".write": true },
    "live_history": { ".read": true, ".write": true }
  }
}
```

Ces règles n'expirent jamais et le site continue de fonctionner. Pour une sécurité
renforcée plus tard (empêcher n'importe qui d'écrire), on ajoutera l'authentification
Firebase et on restreindra l'écriture de `live/active`, `videos`, `contacts` et
`live_history` au compte propriétaire — dis-le-moi quand tu voudras passer à cette étape.

