# TODO - Paiement démo + Admin login + Thème rose/blanc

## Étape 1 — Paiement démo
- [x] Vérifier `api/payments.php` : actions `create_demo_payment` et `simulate_pay_success` existent et mettent `orders.status=paid`.

## Étape 2 — Correction accès admin (login)
- [x] Corriger `client/login.html` : la requête fetch pointe vers `../api/auth.php?action=login` et envoie `{email,password}`.
- [x] Corriger `api/auth.php` : fallback si `action` est vide => mode `login`.

## Étape 3 — Thème rose/blanc + entête plus pro
- [x] Ajuster le fond global dans `assets/css/main.css`.
- [x] Injecter une couche rose/blanc sur la hero via l’image locale `assets/images/Make-up cosmetic product, beauty products and cosmetics swatch sample flatlay, various m.jpg`.

## Étape 4 — Validation
- [ ] Tester :
  - [ ] Login admin123 => redirection `admin/admin-orders.html`
  - [ ] Login client123 => redirection `client/dashboard.html`
  - [ ] Vérifier qu’une commande peut devenir `paid` via le flow paiement démo
  - [ ] Vérifier le rendu du thème rose/blanc sur `index.html` et cohérence visuelle sur autres pages

