YAYRA Nail Shop — Guide d’utilisation (PHP + SQLite)

1) Pré-requis
- PHP installé (idéalement PHP 7.4+ ou PHP 8+)
- Un navigateur

2) Lancer le site en local
Depuis le dossier du projet (BOUTIQUE YAYRA), lance :

  php -S 127.0.0.1:8000

Puis ouvre dans ton navigateur :
- http://127.0.0.1:8000/index.html

3) Initialiser la base SQLite (données de démo)
Lance une seule fois (si la DB n’existe pas encore) :

  php scripts/init_db.php

La DB est créée dans :
- ./data/yayra.sqlite

4) Identifiants de démo
Après init DB :
- Client :
  - login: client123
  - password: client123
- Admin :
  - login: admin123
  - password: admin123

5) Routes principales
Pages publiques :
- /index.html
- /shop.html
- /services.html
- /ateliers.html
- /contact.html

Espace client :
- /client/login.html
- /client/register.html
- /client/dashboard.html
- /client/orders.html
- /client/appointments.html

Admin :
- /admin/admin-orders.html
  (lecture des commandes en mode admin)

6) Fonctionnement API (JSON)
Les appels API utilisent des endpoints dans /api/.
- Auth : token Bearer requis sur les endpoints protégés.
- Panier : stocké en localStorage via assets/js/cart.js
- Commandes : créées via api/orders.php?action=create
- Rendez-vous : créés via api/appointments.php?action=create

7) Dépannage rapide
- Si les requêtes API échouent :
  - vérifier que tu utilises bien le serveur PHP (php -S ...)
  - vérifier le chemin des endpoints (ex: api/orders.php)
- Si SQLite ne se crée pas :
  - vérifier permissions d’écriture sur le dossier ./data

Fin.

