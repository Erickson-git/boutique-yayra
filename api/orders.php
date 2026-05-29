<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
$action = (string)($_GET['action'] ?? 'create');

if ($method !== 'POST' && $method !== 'GET') {
  json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
  exit;
}

$pdo = db();

if ($action === 'create') {
  if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }

  $user = require_auth_user();

  $body = read_json_body();
  $fullName = trim((string)($body['full_name'] ?? ''));
  $phone = trim((string)($body['phone'] ?? ''));
  $address = trim((string)($body['address'] ?? ''));
  $items = $body['items'] ?? [];

  if ($fullName === '' || $phone === '' || $address === '' || !is_array($items) || !$items) {
    json_response(['ok' => false, 'error' => 'Champs requis'], 422);
    exit;
  }

  $total_fcfa = (int)($body['total_fcfa'] ?? 0);
  if ($total_fcfa <= 0) {
    // compute server-side as a safety measure
    $total = 0;
    foreach ($items as $it) {
      $pid = (int)($it['product_id'] ?? 0);
      $qty = (int)($it['qty'] ?? 0);
      if ($pid <= 0 || $qty <= 0) continue;
      $st = $pdo->prepare('SELECT price_fcfa FROM products WHERE id = :id');
      $st->execute([':id' => $pid]);
      $price = (int)($st->fetch()['price_fcfa'] ?? 0);
      $total += $price * $qty;
    }
    $total_fcfa = $total;
  }

  $items_json = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

  $ins = $pdo->prepare('INSERT INTO orders(user_id, full_name, phone, address, items_json, total_fcfa, status, created_at) VALUES(:uid,:fn,:ph,:ad,:items,:t,:st,datetime("now"))');
  $ins->execute([
    ':uid' => (int)$user['id'],
    ':fn' => $fullName,
    ':ph' => $phone,
    ':ad' => $address,
    ':items' => $items_json,
    ':t' => $total_fcfa,
    ':st' => 'pending',
  ]);

  $id = (int)$pdo->lastInsertId();

  json_response(['ok' => true, 'order_id' => $id]);
  exit;
}

if ($action === 'list') {
  $user = require_auth_user();
  $st = $pdo->prepare('SELECT id, full_name, phone, address, items_json, total_fcfa, status, created_at FROM orders WHERE user_id = :uid ORDER BY id DESC');
  $st->execute([':uid' => (int)$user['id']]);
  json_response(['ok' => true, 'orders' => $st->fetchAll()]);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);

