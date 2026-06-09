<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = db();

header('Content-Type: application/json; charset=utf-8');

$action = (string)($_GET['action'] ?? 'list');

if ($action === 'featured') {
  $limit = (int)($_GET['limit'] ?? 6);
  $limit = max(1, min(50, $limit));

  $stmt = $pdo->prepare('SELECT p.id, p.name, p.description, p.price_fcfa, p.image_url, c.slug AS category_slug, p.is_featured, p.stock_qty, p.is_available
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_featured = 1
    ORDER BY p.id DESC
    LIMIT :l');
  $stmt->bindValue(':l', $limit, PDO::PARAM_INT);
  $stmt->execute();
  json_response(['ok' => true, 'products' => $stmt->fetchAll()]);
  exit;
}

$category = (string)($_GET['category'] ?? '');
$q = trim((string)($_GET['q'] ?? ''));

$where = [];
$params = [];

if ($category !== '') {
  $where[] = 'c.slug = :cat';
  $params[':cat'] = $category;
}


if ($q !== '') {
  $where[] = '(p.name LIKE :q OR p.description LIKE :q)';
  $params[':q'] = '%' . $q . '%';
}

$sql = 'SELECT p.id, p.name, p.description, p.price_fcfa, p.image_url, c.slug AS category_slug, p.is_featured, p.stock_qty, p.is_available
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id';

if ($where) {
  $sql .= ' WHERE ' . implode(' AND ', $where);
}

$sql .= ' ORDER BY p.id DESC LIMIT 500';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

json_response(['ok' => true, 'products' => $stmt->fetchAll()]);

