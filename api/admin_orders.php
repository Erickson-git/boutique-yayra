<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
$action = (string)($_GET['action'] ?? '');

if ($action === '') {
  json_response(['ok' => false, 'error' => 'Action requise'], 400);
  exit;
}

$pdo = db();

if ($action === 'list') {
  if ($method !== 'GET') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }
  require_auth_admin();

  $stmt = $pdo->query('SELECT id, full_name, phone, address, items_json, total_fcfa, status, created_at FROM orders ORDER BY id DESC LIMIT 500');
  $orders = $stmt->fetchAll();

  // Optionally decode items_json for better display
  foreach ($orders as &$o) {
    $o['items_count'] = count(json_decode($o['items_json'], true) ?? []);
  }

  json_response(['ok' => true, 'orders' => $orders]);
  exit;
}

if ($action === 'update_status') {
  if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }
  require_auth_admin();

  $body = read_json_body();
  $id = (int)($body['id'] ?? 0);
  $status = trim((string)($body['status'] ?? ''));

  if ($id <= 0 || $status === '') {
    json_response(['ok' => false, 'error' => 'id et status requis'], 422);
    exit;
  }

  $allowed_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!in_array($status, $allowed_statuses, true)) {
    json_response(['ok' => false, 'error' => 'Statut invalide'], 422);
    exit;
  }

  $stmt = $pdo->prepare('UPDATE orders SET status = :s WHERE id = :id');
  $stmt->execute([':s' => $status, ':id' => $id]);

  json_response(['ok' => true]);
  exit;
}

if ($action === 'detail') {
  if ($method !== 'GET') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }
  require_auth_admin();

  $id = (int)($_GET['id'] ?? 0);
  if ($id <= 0) {
    json_response(['ok' => false, 'error' => 'id requis'], 422);
    exit;
  }

  $stmt = $pdo->prepare('SELECT id, full_name, phone, address, items_json, total_fcfa, status, created_at FROM orders WHERE id = :id');
  $stmt->execute([':id' => $id]);
  $order = $stmt->fetch();

  if (!$order) {
    json_response(['ok' => false, 'error' => 'Commande non trouvée'], 404);
    exit;
  }

  // Decode items with product info
  $items_data = json_decode($order['items_json'], true) ?? [];
  $order['items'] = $items_data;

  json_response(['ok' => true, 'order' => $order]);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);
