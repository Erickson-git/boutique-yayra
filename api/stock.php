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

function clamp_str(string $s, int $max): string {
  $s = trim($s);
  if (mb_strlen($s) > $max) $s = mb_substr($s, 0, $max);
  return $s;
}

function require_post(): void {
  $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
  if ($m !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }
}

function get_optional_user_id(): ?int {
  // token optional for this endpoint
  try {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    if (!is_string($auth) || !str_starts_with($auth, 'Bearer ')) return null;
    $token = trim(substr($auth, 7));
    if ($token === '') return null;
    $stmt = db()->prepare('SELECT id FROM users WHERE token = :t AND token_expires_at > datetime("now") LIMIT 1');
    $stmt->execute([':t' => $token]);
    $u = $stmt->fetch();
    if (!$u) return null;
    return (int)$u['id'];
  } catch (Throwable $e) {
    return null;
  }
}

if ($action === 'notify') {
  require_post();
  $body = read_json_body();

  $product_id = isset($body['product_id']) ? (int)$body['product_id'] : 0;
  $full_name = clamp_str((string)($body['full_name'] ?? ''), 160);
  $email = clamp_str((string)($body['email'] ?? ''), 200);
  $phone = clamp_str((string)($body['phone'] ?? ''), 30);

  $position_label = clamp_str((string)($body['position_label'] ?? ''), 200); // city/area free text
  $lat = isset($body['lat']) ? (float)$body['lat'] : null;
  $lng = isset($body['lng']) ? (float)$body['lng'] : null;

  if ($product_id <= 0) {
    json_response(['ok' => false, 'error' => 'product_id requis'], 422);
    exit;
  }

  if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['ok' => false, 'error' => 'email invalide'], 422);
    exit;
  }

  if ($full_name === '') {
    json_response(['ok' => false, 'error' => 'full_name requis'], 422);
    exit;
  }

  // Check product availability
  $st = $pdo->prepare('SELECT id, stock_qty, is_available, name FROM products WHERE id = :id LIMIT 1');
  $st->execute([':id' => $product_id]);
  $p = $st->fetch();
  if (!$p) {
    json_response(['ok' => false, 'error' => 'Produit introuvable'], 404);
    exit;
  }

  $stockQty = (int)($p['stock_qty'] ?? 0);
  $isAvail = (int)($p['is_available'] ?? 0);

  if ($isAvail === 1 && $stockQty > 0) {
    json_response(['ok' => false, 'error' => 'Produit déjà disponible'], 409);
    exit;
  }

  $userId = get_optional_user_id();

  // Create table if missing (safe for first run)
  $pdo->exec('CREATE TABLE IF NOT EXISTS stock_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position_label TEXT,
    lat REAL,
    lng REAL,
    status TEXT NOT NULL DEFAULT "pending",
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  )');

  $ins = $pdo->prepare('INSERT INTO stock_notifications(user_id, product_id, full_name, email, phone, position_label, lat, lng, status, created_at) VALUES(:uid,:pid,:fn,:em,:ph,:pl,:lat,:lng, "pending", datetime("now"))');

  $ins->execute([
    ':uid' => $userId,
    ':pid' => $product_id,
    ':fn' => $full_name,
    ':em' => $email,
    ':ph' => $phone,
    ':pl' => $position_label !== '' ? $position_label : null,
    ':lat' => ($lat === null ? null : $lat),
    ':lng' => ($lng === null ? null : $lng),
  ]);

  json_response(['ok' => true, 'message' => 'Demande enregistrée. Nous vous contacterons dès que disponible.']);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);
exit;

