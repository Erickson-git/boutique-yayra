# Déployer sur Replit (très simple)

1) Crée un compte sur https://replit.com et connecte‑toi.

2) Nouvelle Repl → choisir "Import from GitHub" si tu as un repo, ou "Create" puis upload des fichiers :
   - Si tu importes depuis GitHub : push ton projet sur GitHub, puis coller l'URL du repo.
   - Si tu n'as pas GitHub : crée une Repl vide (language: "HTML, CSS, JS") puis glisse‑dépose tous les fichiers du dossier `BOUTIQUE YAYRA`.

3) Replit détectera le fichier `.replit` et utilisera la commande :
```
php -S 0.0.0.0:8000 -t .
```
4) Clique `Run` → attends que Replit démarre, tu obtiendras une URL publique (https) en haut à droite.

Notes :
- SQLite (`data/yayra.sqlite`) fonctionne localement sur Replit.
- Si tu utilises des API externes ou modification CORS, pense à adapter les URLs.
- Pour partager, copie l'URL publique fournie par Replit.

Si tu veux, je peux :
- t'aider à pousser sur GitHub depuis ton poste (je te fournis les commandes), ou
- générer un ZIP prêt à téléverser (je peux te montrer la commande PowerShell à exécuter localement).
