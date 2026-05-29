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
if ($hasCategories === 0) {
  $cats = [
    ['ongles', 'Ongles'],
    ['kits', 'Kits Beauté'],
    ['visage', 'Soins Visage'],
    ['capillaire', 'Capillaire'],
  ];
  $stmt = $pdo->prepare('INSERT INTO categories(slug, name, created_at) VALUES(:s,:n,datetime("now"))');
  foreach ($cats as $row) {
    [$slug, $name] = $row;
    $stmt->execute([':s' => $slug, ':n' => $name]);
  }
}

$hasProducts = (int)$pdo->query('SELECT COUNT(*) AS c FROM products')->fetch()['c'];
if ($hasProducts === 0) {
  $pdo->beginTransaction();

  $getCatId = $pdo->prepare('SELECT id FROM categories WHERE slug = :slug');
  $insert = $pdo->prepare('INSERT INTO products(category_id, sku, name, description, price_fcfa, image_url, is_featured, created_at) VALUES(:cid,:sku,:n,:d,:p,:img,:f,datetime("now"))');

  $seed = [
    ['ongles', 'YAY-NAIL-001', 'Nail Art Prestige', 'Design élégant, finitions premium.', 3500, 'https://picsum.photos/seed/yayra-nail/300/300', 1],
    ['ongles', 'YAY-NAIL-002', 'Kit Ongles Luxe', 'Kit complet pour un rendu pro à domicile.', 12000, 'https://picsum.photos/seed/yayra-nail2/300/300', 0],
    ['kits', 'YAY-KIT-001', 'Kit Beauté Éclat', 'Routine soin complète pour une peau radieuse.', 15000, 'https://picsum.photos/seed/yayra-kit/300/300', 1],
    ['visage', 'YAY-VISO-001', 'Sérum Quartz Glow', 'Sérum hydratant & effet éclat progressif.', 9000, 'https://picsum.photos/seed/yayra-face/300/300', 0],
    ['capillaire', 'YAY-CAP-001', 'Soin Cheveux No Stress', 'Après-shampoing & soin pour cheveux doux.', 8000, 'https://picsum.photos/seed/yayra-hair/300/300', 0],
  ];

  foreach ($seed as $row) {
    [$slug, $sku, $name, $desc, $price, $img, $featured] = $row;
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
    ]);
  }

  $pdo->commit();
}

echo "DB initialisée avec succès.\n";
echo 'Base: ' . (dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'yayra.sqlite') . "\n";

