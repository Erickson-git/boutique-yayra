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
    ['slug'=>'ongles','prefix'=>'ONG','count'=>220,'imgs'=>['net-nailart-amber','net-nailart-red','nails-art','nails-fall','gel-nail-kit','manicure-kit','net-hands-luxe'],'bases'=>[
      ['Vernis Gel',2500,4000],['Vernis Semi-Permanent',3000,4500],['Top Coat',2500,3500],['Base Coat',2500,3500],['Gel UV Couleur',3000,5500],
      ['Gel Constructeur',4000,7000],['Kit Capsules',3500,6500],['Capsules French',2500,4000],['Faux Ongles',2000,3500],['Tips Box 500',3000,6000],
      ['Lime Professionnelle',1000,2000],['Bloc Polissoir',1000,2000],['Strass Nail Art',1500,3000],['Stickers Ongles',1000,2000],['Paillettes Ongles',1500,3000],
      ['Foil Transfert',1500,3500],['Tampon Stamping',2000,4000],['Plaque Stamping',2000,4500],['Pinceau Nail Art',1500,3500],['Stylo Nail Art',1500,3000],
      ['Poudre Acrylique',4000,9000],['Liquide Acrylique',4000,9000],['Colle à Ongles',1000,2500],['Dissolvant Doux',1500,2500],['Huile Cuticules',2000,4000],
      ['Repousse-Cuticules',1500,3000],['Coupe-Ongles Pro',1500,3500],['Râpe Pieds',1500,3500],['Set Manucure',6000,13000],['Kit Pédicure',7000,13000],
      ['Séparateurs Orteils',800,1800],['Brosse Nettoyante',1000,2500]]],
    ['slug'=>'kits','prefix'=>'COS','count'=>240,'imgs'=>['net-makeup-brushes','net-makeup-palette','net-makeup-marble','net-makeup-model','net-gold-brush','makeup-kit-allinone','beauty-flatlay'],'bases'=>[
      ['Palette Maquillage',8000,18000],['Palette Fards',6000,14000],['Fond de Teint',5000,12000],['BB Crème',4500,9000],['Poudre Compacte',4000,8500],
      ['Poudre Libre',4000,8500],['Anticernes',3500,7000],['Correcteur',3000,6500],['Blush Poudre',3500,7000],['Blush Crème',3500,7000],
      ['Highlighter',4000,8000],['Bronzer',4000,8000],['Terre de Soleil',4000,8500],['Mascara Volume',4000,8000],['Mascara Allongeant',4000,8000],
      ['Eyeliner Liquide',2500,5000],['Crayon Yeux',1500,3500],['Crayon Sourcils',2000,4000],['Gel Sourcils',2500,5000],['Rouge à Lèvres',3000,7000],
      ['Rouge à Lèvres Mat',3500,7500],['Gloss Brillant',2500,5000],['Crayon Lèvres',1500,3500],['Baume Lèvres',1500,3500],['Set de Pinceaux',7000,16000],
      ['Éponge Beauté',1500,3500],['Spray Fixateur',5000,9500],['Base de Teint',4000,8000],['Démaquillant Doux',3000,6000],['Lingettes Démaquillantes',1500,3500],
      ['Faux Cils',1500,3500],['Colle Faux Cils',1000,2500],['Coffret Maquillage',15000,32000],['Trousse Maquillage',4000,9000],['Miroir LED',8000,22000]]],
    ['slug'=>'visage','prefix'=>'VIS','count'=>180,'imgs'=>['net-serums-luxe','net-skincare-flatlay','net-skincare-bottle','net-skincare-natural','net-facial-oil','net-lotion-linen','net-facemask','serum-glow','glowing-skin','skincare-product','skincare-men','vitamin-c-kit'],'bases'=>[
      ['Sérum Éclat',8000,18000],['Sérum Vitamine C',8000,18000],['Sérum Acide Hyaluronique',9000,20000],['Sérum Rétinol',9000,22000],['Crème Hydratante',6000,15000],
      ['Crème de Nuit',7000,16000],['Crème Anti-Âge',10000,26000],['Crème Éclaircissante',7000,16000],['Gel Nettoyant',4000,8000],['Mousse Nettoyante',4000,8000],
      ['Eau Micellaire',3500,7500],['Tonique',4000,8000],['Lotion Apaisante',4000,8000],['Masque Tissu',1500,4000],['Masque Argile',4000,9000],
      ['Masque Peel-off',3500,7500],['Gommage Visage',4500,9000],['Exfoliant Doux',4500,9000],['Huile Visage',6000,14000],['Contour des Yeux',7000,15000],
      ['Patchs Yeux',3000,6000],['Brume Hydratante',3500,7000],['Crème Solaire SPF50',5000,11000],['Stick Lèvres',1500,3500],['Rouleau de Jade',3000,7000],
      ['Gua Sha',3000,7000],['Baume Réparateur',4000,9000]]],
    ['slug'=>'capillaire','prefix'=>'CAP','count'=>140,'imgs'=>['haircare-malibu','net-hairmask','hair-styling','hair-strands'],'bases'=>[
      ['Shampoing Doux',3000,7000],['Shampoing Antipelliculaire',3500,7500],['Shampoing Sec',3500,7000],['Après-Shampoing',3000,7000],['Masque Capillaire',4500,10000],
      ['Soin Sans Rinçage',3500,8000],['Huile Cheveux',3500,8000],['Huile de Ricin',2500,6000],['Sérum Pousse',5000,12000],['Spray Coiffant',3000,6500],
      ['Mousse Coiffante',3000,6500],['Gel Fixation',2500,5500],['Crème Boucles',4000,8500],['Beurre de Karité',2500,6000],['Lait Capillaire',3000,7000],
      ['Lotion Anti-Chute',5000,12000],['Teinture Cheveux',2500,6000],['Bonnet Satin',2000,4500],['Foulard Satin',2000,4500],['Peigne Pro',1000,2500],
      ['Brosse Démêlante',1500,4000],['Gelée Coiffante',3000,6500]]],
    ['slug'=>'meubles','prefix'=>'MOB','count'=>120,'imgs'=>['nail-desk-pro','net-salon','nail-master'],'bases'=>[
      ['Table de Manucure',45000,120000],['Table avec Aspirateur',70000,160000],['Fauteuil Pédicure',150000,450000],['Fauteuil Spa',200000,600000],['Cabine UV',80000,200000],
      ['Tabouret Réglable',15000,35000],['Tabouret Roulant',18000,40000],['Chariot de Soin',25000,60000],['Chariot 3 Tiroirs',30000,70000],['Lampe Loupe',20000,45000],
      ['Lampe sur Pied',25000,55000],['Meuble de Rangement',40000,90000],['Étagère à Vernis',18000,40000],['Présentoir Vernis',20000,48000],['Repose-Pieds',12000,30000],
      ['Bureau Nail Tech',55000,130000],['Comptoir d\'Accueil',90000,250000],['Banc d\'Attente',45000,110000],['Porte-Manteau',12000,28000],['Bac à Shampoing',120000,320000]]],
    ['slug'=>'machines','prefix'=>'MAC','count'=>100,'imgs'=>['nail-master','net-salon','nail-desk-pro'],'bases'=>[
      ['Ponceuse Ongles',12000,35000],['Lampe UV/LED 48W',10000,25000],['Lampe LED 96W',18000,40000],['Collecteur de Poussière',25000,60000],['Aspirateur Manucure',20000,45000],
      ['Stérilisateur UV',20000,55000],['Stérilisateur à Billes',8000,20000],['Autoclave',60000,150000],['Chauffe-Cire',8000,20000],['Chauffe-Serviettes',25000,60000],
      ['Vapozone Facial',35000,80000],['Appareil Hydrafacial',150000,500000],['Dermapen',25000,70000],['Appareil Cavitation',60000,180000],['Luminothérapie LED',45000,140000],
      ['Nettoyeur Ultrasons',20000,55000],['Sèche-Ongles',6000,16000],['Mini Ventilateur Ongles',3000,8000]]],
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

