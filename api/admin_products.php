<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = db();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
$action = (string)($_GET['action'] ?? '');

if ($action === '') {
  json_response(['ok' => false, 'error' => 'Action requise'], 400);
  exit;
}

function require_post(): void {
  $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
  if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }
}

function clamp_str(string $s, int $max): string {
  $s = trim($s);
  if (mb_strlen($s) > $max) $s = mb_substr($s, 0, $max);
  return $s;
}

function get_cat_id_by_slug(string $slug): ?int {
  $stmt = db()->prepare('SELECT id FROM categories WHERE slug = :s LIMIT 1');
  $stmt->execute([':s' => $slug]);
  $id = $stmt->fetch();
  if (!$id) return null;
  return (int)$id['id'];
}

function sanitize_image_url(string $u): string {
  $u = trim($u);
  if ($u === '') return '';
  // Very light check: allow http/https only
  if (!preg_match('/^https?:\/\//i', $u)) return '';
  return $u;
}

if ($action === 'list') {
  if ($method !== 'GET') { json_response(['ok' => false, 'error' => 'Method not allowed'], 405); exit; }
  require_auth_admin();

  $stmt = $pdo->query('SELECT p.id, p.sku, p.name, p.description, p.price_fcfa, p.image_url, p.is_featured, c.slug AS category_slug
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id DESC LIMIT 500');
  json_response(['ok' => true, 'products' => $stmt->fetchAll()]);
  exit;
}

if ($action === 'delete') {
  require_post();
  $user = require_auth_admin();
  $body = read_json_body();
  $id = (int)($body['id'] ?? 0);
  if ($id <= 0) { json_response(['ok' => false, 'error' => 'id requis'], 422); exit; }

  $st = $pdo->prepare('DELETE FROM products WHERE id = :id');
  $st->execute([':id' => $id]);
  json_response(['ok' => true]);
  exit;
}

if ($action === 'upsert') {
  require_post();
  $user = require_auth_admin();
  $body = read_json_body();

  $id = $body['id'] ?? null;
  $idInt = ($id === null || $id === '') ? null : (int)$id;

  $categorySlug = clamp_str((string)($body['category_slug'] ?? ''), 120);
  $sku = clamp_str((string)($body['sku'] ?? ''), 60);
  $name = clamp_str((string)($body['name'] ?? ''), 160);
  $description = clamp_str((string)($body['description'] ?? ''), 4000);
  $price = (int)($body['price_fcfa'] ?? 0);
  $image_url = sanitize_image_url((string)($body['image_url'] ?? ''));
  $is_featured = ((int)($body['is_featured'] ?? 0)) ? 1 : 0;

  if ($categorySlug === '' || $sku === '' || $name === '' || $description === '' || $price <= 0) {
    json_response(['ok' => false, 'error' => 'Champs requis invalides'], 422);
    exit;
  }

  $categoryId = get_cat_id_by_slug($categorySlug);
  if (!$categoryId) {
    json_response(['ok' => false, 'error' => 'Catégorie introuvable'], 404);
    exit;
  }

  if ($idInt !== null && $idInt > 0) {
    // update
    $up = $pdo->prepare('UPDATE products SET category_id=:cid, sku=:sku, name=:n, description=:d, price_fcfa=:p, image_url=:img, is_featured=:f WHERE id=:id');
    $up->execute([
      ':cid' => $categoryId,
      ':sku' => $sku,
      ':n' => $name,
      ':d' => $description,
      ':p' => $price,
      ':img' => $image_url,
      ':f' => $is_featured,
      ':id' => $idInt,
    ]);

    json_response(['ok' => true, 'id' => $idInt]);
    exit;
  }

  // insert
  $ins = $pdo->prepare('INSERT INTO products(category_id, sku, name, description, price_fcfa, image_url, is_featured, created_at)
    VALUES(:cid,:sku,:n,:d,:p,:img,:f,datetime("now"))');
  $ins->execute([
    ':cid' => $categoryId,
    ':sku' => $sku,
    ':n' => $name,
    ':d' => $description,
    ':p' => $price,
    ':img' => $image_url,
    ':f' => $is_featured,
  ]);

  $newId = (int)$pdo->lastInsertId();
  json_response(['ok' => true, 'id' => $newId]);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);
exit;


