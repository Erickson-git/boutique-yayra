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
  $seed = [
    // Ongles
    ['ongles', 'YAY-NAIL-001', 'Nail Art Prestige', 'Design élégant, finitions premium.', 3500, 'assets/images/Manicure and Pedicure Kits for Professionals.jpg', 1, 10, 1],
    ['ongles', 'YAY-NAIL-002', 'Kit Ongles Luxe', 'Kit complet pour un rendu pro à domicile.', 12000, 'assets/images/Kit de Unha Gel.jpg', 0, 0, 0],


    // Kits beauté
    ['kits', 'YAY-KIT-001', 'Kit Beauté Éclat', 'Routine soin complète pour une peau radieuse.', 15000, 'assets/images/Procure Produtos com Vitamina C.jpg', 1, 7, 1],

    // Visage
    ['visage', 'YAY-VISO-001', 'Sérum Quartz Glow', 'Sérum hydratant & effet éclat progressif.', 9000, 'assets/images/Product shoot for @deluxuryskinbyzee….jpg', 0, 3, 1],

    // Capillaire
    ['capillaire', 'YAY-CAP-001', 'Soin Cheveux No Stress', 'Après-shampoing & soin pour cheveux doux.', 8000, 'assets/images/Malibu – Malibuu.jpg', 0, 0, 0],


    // Meubles & Machines (catégories ajoutées plus bas)
    ['meubles', 'YAY-MBL-001', 'Table de Manucure Luxe', 'Meuble professionnel pour un espace propre et organisé.', 65000, 'assets/images/Hokku Designs Bureau à clou pour Nail Tech avec collecteur de poussière électrique, table de manucure roulante avec roues verrouillables, tiroirs de r.jpg', 1],
    ['machines', 'YAY-MCH-001', 'Collecteur de Poussière Électrique', 'Accessoire indispensable pour une hygiène irréprochable en cabine.', 42000, 'assets/images/fall nails.jpg', 0],
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

