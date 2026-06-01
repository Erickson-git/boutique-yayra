YAYRA Nail Shop — Mise en ligne gratuite via Render (choix recommandé)

Render peut exécuter une app “web” en lançant un serveur. Ici le backend est en PHP + SQLite.

Important :
- Render n’expose pas directement un dossier local en “statique + PHP”. Il faut donc une config d’hébergement qui exécute PHP.
- Le plus simple est de préparer une app avec PHP-FPM/Apache. Cependant, selon ton plan Render et la stack autorisée, la méthode peut varier.

Option A (la plus fiable) — Conteneur/Blueprint Render + PHP
1) Utiliser une config “Web Service” qui lance PHP.
2) S’assurer que le fichier SQLite est persisté (sinon il sera régénéré à chaque restart).

Option B — Transformer en front statique + API externalisée
- Si tu ne veux pas gérer PHP sur Render, tu peux publier uniquement le front statique et fournir l’API ailleurs (mais ce n’est pas “sans coût” forcément).

Ce que je te fournis ici (gratuit) :
1) Comment préparer le repo pour Render
2) Quelles URLs tester

Préparation du projet
- Vérifie que `api/*.php` et `scripts/init_db.php` sont bien dans le repo.
- Le script `scripts/init_db.php` crée `data/yayra.sqlite`.

Pour Render, il faut lancer une commande équivalente à :
- php -S 0.0.0.0:$PORT

Réglage “PORT”
Sur Render, ton app reçoit une variable d’environnement PORT (par ex. 10000).

Commande cible (pseudo) :
- php -S 0.0.0.0:$PORT

Mais : Render doit savoir quel fichier/cible sert les endpoints PHP (ex: /api/*.php).

Test local (avant Render)
1) Lancer :
   php -S 0.0.0.0:8000
2) Ouvrir :
   http://localhost:8000/api/newsletter.php
   (ou via les pages HTML)

Ensuite
- Tu mets en ligne via Render en copiant la commande ci-dessus dans la config du Web Service.
- Selon l’interface Render, tu choisis un environnement qui exécute PHP.

Persistant SQLite
- Idéalement, Render doit monter un volume persistant pour le dossier `data/`.
- Sinon, à chaque redémarrage, ré-exécuter `php scripts/init_db.php`.

Aide rapide
- Si tu me dis quelle option Render tu vois (Web Service / Static Site + Functions / Docker), je te donne les fichiers exacts à ajouter (ex: Dockerfile, render.yaml) et les étapes exactes.

Fin.

