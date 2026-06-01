YAYRA Nail Shop — Comment retrouver le site sur un autre Internet

Cas 1 (simple) : partager en Local Network (même Wi‑Fi)
1) Lancer le serveur PHP depuis le dossier du projet :
   php -S 0.0.0.0:8000
2) Ouvrir l’URL depuis un autre appareil du même réseau :
   http://IP_DU_PC:8000

Trouver l’IP_DU_PC (Windows)
- Ouvrir “Invite de commandes” (cmd)
- Taper : ipconfig
- Chercher : Adresse IPv4

Cas 2 : accès depuis Internet (besoin de redirection)
- Il faut exposer le port 8000 de ta box (port forwarding) vers l’IP de ton PC.
- Ensuite utiliser :
  http://IP_PUBLIQUE:8000

Remarques
- Utiliser un nom de domaine (optionnel) améliore la navigation.
- En HTTP (pas HTTPS), certains navigateurs peuvent bloquer certaines requêtes.

Cas 3 : tunnel type ngrok (le plus simple sans config box)
1) Installer ngrok
2) Lancer :
   ngrok http 8000
3) Ngrok donne une URL publique (https) que tu peux partager.

Fin.

