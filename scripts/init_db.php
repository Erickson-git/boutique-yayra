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

  // Compte propriétaire (accès boutique + admin)
  $stmt->execute([':e' => 'komi', ':p' => password_hash('saxo2180', PASSWORD_DEFAULT), ':r' => 'admin']);
}

$hasCategories = (int)$pdo->query('SELECT COUNT(*) AS c FROM categories')->fetch()['c'];

// Seed catégories (ajout des nouvelles même si DB déjà initialisée)
$cats = [
  ['ongles', 'Onglerie'],
  ['kits', 'Cosmétiques'],
  ['visage', 'Soins Visage'],
  ['capillaire', 'Capillaire'],
  ['meubles', 'Mobilier & Cabines'],
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

  // Génération de 300 articles par défaut (prix marché FCFA).
  // Même schéma que assets/js/catalog.js (repli statique).
  $QUAL = ['Premium','Éclat','Pro','Luxe','Signature','Essentiel','Prestige','Classic','Édition Or','Confort','Nature','Intense','Élégance','Original','Velours'];

  // bases : [nom, prix_min, prix_max]
  $GROUPS = [
    ['slug'=>'ongles','prefix'=>'ONG','count'=>70,'imgs'=>['net-nailart-amber','net-nailart-red','nails-art','nails-fall','gel-nail-kit','manicure-kit','net-hands-luxe'],'bases'=>[
      ['Vernis Gel',2500,4000],['Kit Capsules',3500,6500],['Faux Ongles',2000,3500],['Top Coat',2500,3500],['Base Coat',2500,3500],
      ['Lime Professionnelle',1000,2000],['Strass Nail Art',1500,3000],['Dissolvant Doux',1500,2500],['Set Manucure',6000,13000],['Gel UV Couleur',3000,5500],
      ['Vernis Semi-Permanent',3000,4500],['Pinceau Nail Art',1500,3500],['Capsules French',2500,4000],['Stickers Ongles',1000,2000],['Kit Pédicure',7000,13000]]],
    ['slug'=>'kits','prefix'=>'COS','count'=>70,'imgs'=>['net-makeup-brushes','net-makeup-palette','net-makeup-marble','net-makeup-model','net-gold-brush','makeup-kit-allinone','beauty-flatlay'],'bases'=>[
      ['Palette Maquillage',8000,18000],['Fond de Teint',5000,12000],['Rouge à Lèvres',3000,7000],['Mascara Volume',4000,8000],['Set de Pinceaux',7000,16000],
      ['Highlighter',4000,8000],['Blush Poudre',3500,7000],['Eyeliner Précision',2500,5000],['Coffret Maquillage',15000,32000],['Poudre Libre',4000,8500],
      ['Gloss Brillant',2500,5000],['Crayon Sourcils',2000,4000],['Anticernes',3500,7000],['Spray Fixateur',5000,9500],['Démaquillant Doux',3000,6000]]],
    ['slug'=>'visage','prefix'=>'VIS','count'=>60,'imgs'=>['net-serums-luxe','net-skincare-flatlay','net-skincare-bottle','net-skincare-natural','net-facial-oil','net-lotion-linen','net-facemask','serum-glow','glowing-skin','skincare-product','skincare-men','vitamin-c-kit'],'bases'=>[
      ['Sérum Éclat',8000,18000],['Crème Hydratante',6000,15000],['Masque Purifiant',4000,9000],['Nettoyant Visage',4000,8000],['Tonique Apaisant',4000,8000],
      ['Huile Précieuse',6000,14000],['Contour des Yeux',7000,15000],['Gommage Doux',4500,9000],['Soin Anti-Âge',10000,26000],['Brume Hydratante',3500,7000],
      ['Patchs Yeux',3000,6000],['Crème Solaire',5000,11000]]],
    ['slug'=>'capillaire','prefix'=>'CAP','count'=>40,'imgs'=>['haircare-malibu','net-hairmask','hair-styling','hair-strands'],'bases'=>[
      ['Shampoing Doux',3000,7000],['Après-Shampoing',3000,7000],['Masque Capillaire',4500,10000],['Huile Cheveux',3500,8000],['Spray Coiffant',3000,6500],
      ['Crème Boucles',4000,8500],['Sérum Pousse',5000,12000],['Beurre de Karité',2500,6000],['Soin Leave-in',3500,7500],['Gelée Coiffante',3000,6500]]],
    ['slug'=>'meubles','prefix'=>'MOB','count'=>35,'imgs'=>['nail-desk-pro','net-salon','nail-master'],'bases'=>[
      ['Table de Manucure',45000,120000],['Fauteuil Pédicure',150000,450000],['Cabine UV',80000,200000],['Tabouret Réglable',15000,35000],['Chariot de Soin',25000,60000],
      ['Lampe Loupe',20000,45000],['Meuble de Rangement',40000,90000],['Repose-Pieds',12000,30000],['Bureau Nail Tech',55000,130000],['Étagère à Vernis',18000,40000]]],
    ['slug'=>'machines','prefix'=>'MAC','count'=>25,'imgs'=>['nail-master','net-salon','nail-desk-pro'],'bases'=>[
      ['Ponceuse Ongles',12000,35000],['Lampe UV/LED',10000,30000],['Collecteur de Poussière',25000,60000],['Stérilisateur',20000,55000],['Chauffe-Cire',8000,20000],
      ['Vapozone Facial',35000,80000],['Autoclave',60000,150000],['Aspirateur Manucure',20000,45000],['Appareil Soin Visage',30000,90000]]],
  ];

  $idCounter = 0;
  foreach ($GROUPS as $g) {
    $getCatId->execute([':slug' => $g['slug']]);
    $cid = $getCatId->fetch()['id'] ?? null;
    if (!$cid) continue;
    $step = ($g['slug'] === 'meubles' || $g['slug'] === 'machines') ? 500 : 100;
    $nb = count($g['bases']);
    for ($i = 0; $i < $g['count']; $i++) {
      $idCounter++;
      $b = $g['bases'][$i % $nb];
      $qIdx = intdiv($i, $nb);
      $qual = $QUAL[$qIdx % count($QUAL)];
      $span = $b[2] - $b[1];
      $raw = $b[1] + ($span > 0 ? (($qIdx * 137) % ($span + 1)) : 0);
      $price = (int)(round($raw / $step) * $step);
      $img = $g['imgs'][$i % count($g['imgs'])];
      $stock = 3 + (($i * 13) % 28);
      $name = $b[0] . ' ' . $qual;
      $insert->execute([
        ':cid' => (int)$cid,
        ':sku' => 'YAY-' . $g['prefix'] . '-' . str_pad((string)($i + 1), 3, '0', STR_PAD_LEFT),
        ':n' => $name,
        ':d' => $b[0] . ' ' . $qual . ' — sélection YAYRA Nail Shop, qualité professionnelle.',
        ':p' => $price,
        ':img' => 'assets/images/' . $img . '.jpg',
        ':f' => ($idCounter % 23 === 0) ? 1 : 0,
        ':sq' => (int)$stock,
        ':av' => 1,
      ]);
    }
  }

  $pdo->commit();
}

echo "DB initialisée avec succès.\n";
echo 'Base: ' . (dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'yayra.sqlite') . "\n";

