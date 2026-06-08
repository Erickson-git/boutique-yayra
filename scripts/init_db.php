<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/db.php';

$pdo = db();

$schemaSql = [
  'CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT "client",
    token TEXT,
    token_expires_at TEXT,
    created_at TEXT NOT NULL
  )',

  'CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  )',

  'CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )',

  'CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    sku TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price_fcfa INTEGER NOT NULL,
    image_url TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    is_available INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
  )',

  'CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    items_json TEXT NOT NULL,
    total_fcfa INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT "pending",
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  )',

  'CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT,
    phone TEXT,
    service TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT "scheduled",
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  )',
];

foreach ($schemaSql as $sql) {
  $pdo->exec($sql);
}

// Seed minimal data if empty
$hasAnyUsers = (int)$pdo->query('SELECT COUNT(*) AS c FROM users')->fetch()['c'];
if ($hasAnyUsers === 0) {
  $clientEmail = 'client@yayra.tg';
  $clientPass = password_hash('client123', PASSWORD_DEFAULT);
  $stmt = $pdo->prepare('INSERT INTO users(email, password_hash, role, created_at) VALUES(:e,:p,:r,datetime("now"))');
  $stmt->execute([':e' => $clientEmail, ':p' => $clientPass, ':r' => 'client']);

  $adminEmail = 'admin@yayra.tg';
  $adminPass = password_hash('admin123', PASSWORD_DEFAULT);
  $stmt->execute([':e' => $adminEmail, ':p' => $adminPass, ':r' => 'admin']);
}

$hasCategories = (int)$pdo->query('SELECT COUNT(*) AS c FROM categories')->fetch()['c'];

// Seed catégories (ajout des nouvelles même si DB déjà initialisée)
$cats = [
  ['ongles', 'Ongles'],
  ['kits', 'Kits Beauté'],
  ['visage', 'Soins Visage'],
  ['capillaire', 'Capillaire'],
  ['meubles', 'Meubles & Cabines'],
  ['machines', 'Machines & Accessoires'],
];

if ($hasCategories === 0) {


  $stmt = $pdo->prepare('INSERT INTO categories(slug, name, created_at) VALUES(:s,:n,datetime("now"))');
  foreach ($cats as $row) {
    [$slug, $name] = $row;
    $stmt->execute([':s' => $slug, ':n' => $name]);
  }
}

// Re-séeding products so images use local assets/images paths
$pdo->exec('DELETE FROM products');
// If DB already exists from previous version, columns might be missing.
// We run a quick migration using ALTER TABLE where possible.
try {
  $pdo->exec('ALTER TABLE products ADD COLUMN stock_qty INTEGER NOT NULL DEFAULT 0');
} catch (Throwable $e) {}
try {
  $pdo->exec('ALTER TABLE products ADD COLUMN is_available INTEGER NOT NULL DEFAULT 0');
} catch (Throwable $e) {}


$hasProducts = 0;
if ($hasProducts === 0) {

  $pdo->beginTransaction();

  $getCatId = $pdo->prepare('SELECT id FROM categories WHERE slug = :slug');
  $insert = $pdo->prepare('INSERT INTO products(category_id, sku, name, description, price_fcfa, image_url, is_featured, stock_qty, is_available, created_at) VALUES(:cid,:sku,:n,:d,:p,:img,:f,:sq,:av,datetime("now"))');

  // seed: produits + équipements (meubles/machines) via images locales
  // Colonnes : [slug, sku, nom, description, prix_fcfa, image, vedette, stock, dispo]
  $seed = [
    // Ongles
    ['ongles', 'YAY-NAIL-001', 'Nail Art Prestige', 'Design élégant et finitions premium réalisés à la main.', 3500, 'assets/images/nails-art.jpg', 1, 25, 1],
    ['ongles', 'YAY-NAIL-002', 'Kit Ongles Gel Luxe', 'Kit complet gel UV pour un rendu salon à domicile.', 12000, 'assets/images/gel-nail-kit.jpg', 1, 14, 1],
    ['ongles', 'YAY-NAIL-003', 'Kit Manucure & Pédicure Pro', 'L\'essentiel professionnel pour des mains et pieds impeccables.', 9500, 'assets/images/manicure-kit.jpg', 0, 18, 1],
    ['ongles', 'YAY-NAIL-004', 'Collection Nails Automne', 'Teintes chaudes tendance pour la saison.', 4000, 'assets/images/nails-fall.jpg', 0, 12, 1],

    // Kits beauté
    ['kits', 'YAY-KIT-001', 'Kit Beauté Éclat Vitamine C', 'Routine soin complète pour une peau radieuse et unifiée.', 15000, 'assets/images/vitamin-c-kit.jpg', 1, 10, 1],
    ['kits', 'YAY-KIT-002', 'Kit Maquillage All-in-One', 'Palette et accessoires pour un look complet, partout.', 18000, 'assets/images/makeup-kit-allinone.jpg', 1, 8, 1],
    ['kits', 'YAY-KIT-003', 'Coffret Découverte Beauté', 'Sélection de nos best-sellers en format découverte.', 11000, 'assets/images/beauty-flatlay.jpg', 0, 9, 1],

    // Visage
    ['visage', 'YAY-VISO-001', 'Sérum Quartz Glow', 'Sérum hydratant et effet éclat progressif.', 9000, 'assets/images/serum-glow.jpg', 1, 16, 1],
    ['visage', 'YAY-VISO-002', 'Soin Visage Deluxe', 'Texture riche pour nourrir et sublimer la peau.', 13000, 'assets/images/skincare-product.jpg', 0, 7, 1],
    ['visage', 'YAY-VISO-003', 'Rituel Peau Éclatante', 'Le rituel signature pour une peau visiblement lumineuse.', 14500, 'assets/images/glowing-skin.jpg', 0, 6, 1],
    ['visage', 'YAY-VISO-004', 'Soin Homme FERRO', 'Soin visage essentiel pensé pour les hommes.', 10000, 'assets/images/skincare-men.jpg', 0, 8, 1],

    // Capillaire
    ['capillaire', 'YAY-CAP-001', 'Soin Cheveux No Stress', 'Après-shampoing et soin pour des cheveux doux et faciles à coiffer.', 8000, 'assets/images/haircare-malibu.jpg', 0, 11, 1],
    ['capillaire', 'YAY-CAP-002', 'Coiffure & Style', 'Produits coiffants pour une mise en forme tenue.', 7000, 'assets/images/hair-styling.jpg', 0, 9, 1],
    ['capillaire', 'YAY-CAP-003', 'Fortifiant Cheveux', 'Soin fortifiant à utiliser au quotidien pour renforcer les longueurs.', 8500, 'assets/images/hair-strands.jpg', 0, 10, 1],

    // Meubles & Machines
    ['meubles', 'YAY-MBL-001', 'Table de Manucure Luxe', 'Meuble professionnel avec collecteur de poussière intégré.', 65000, 'assets/images/nail-desk-pro.jpg', 1, 4, 1],
    ['machines', 'YAY-MCH-001', 'Poste Pro Nail Master', 'Espace de travail complet pour technicienne ongulaire.', 42000, 'assets/images/nail-master.jpg', 0, 5, 1],
  ];



  foreach ($seed as $row) {
    $slug = $row[0];
    $sku = $row[1];
    $name = $row[2];
    $desc = $row[3];
    $price = $row[4];
    $img = $row[5];
    $featured = $row[6] ?? 0;
    $stockQty = $row[7] ?? 0;
    $isAvail = $row[8] ?? ($stockQty > 0 ? 1 : 0);

    $getCatId->execute([':slug' => $slug]);
    $cid = $getCatId->fetch()['id'] ?? null;
    if (!$cid) continue;


    $insert->execute([
      ':cid' => (int)$cid,
      ':sku' => $sku,
      ':n' => $name,
      ':d' => $desc,
      ':p' => (int)$price,
      ':img' => $img,
      ':f' => (int)$featured,
      ':sq' => (int)$stockQty,
      ':av' => (int)$isAvail,
    ]);
  }

  $pdo->commit();
}

echo "DB initialisée avec succès.\n";
echo 'Base: ' . (dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'yayra.sqlite') . "\n";

