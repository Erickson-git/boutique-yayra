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
  $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
  if ($m !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }
}

function require_auth_admin(PDO $pdo): void {
  $headers = getallheaders();
  $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? '');

  if (!is_string($auth) || !str_starts_with($auth, 'Bearer ')) {
    json_response(['ok' => false, 'error' => 'Missing token'], 401);
    exit;
  }

  $token = trim(substr($auth, 7));
  if ($token === '') {
    json_response(['ok' => false, 'error' => 'Invalid token'], 401);
    exit;
  }

  $st = $pdo->prepare('SELECT id, email, role FROM users WHERE token = :t AND token_expires_at > datetime("now") LIMIT 1');
  $st->execute([':t' => $token]);
  $user = $st->fetch();

  if (!$user) {
    json_response(['ok' => false, 'error' => 'Unauthorized'], 401);
    exit;
  }

  if (($user['role'] ?? '') !== 'admin') {
    json_response(['ok' => false, 'error' => 'Admin only'], 403);
    exit;
  }
}

function ai_kits_decode_json(string $s): array {
  $s = trim($s);
  if ($s === '') return [];
  $j = json_decode($s, true);
  return is_array($j) ? $j : [];
}

if ($action === 'list_ai_kits') {
  if ($method !== 'GET') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }

  require_auth_admin($pdo);

  $pdo->exec('CREATE TABLE IF NOT EXISTS ai_kits_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL DEFAULT "pending",
    proposed_json TEXT NOT NULL,
    admin_validated_at TEXT,
    created_at TEXT NOT NULL
  )');

  $stmt = $pdo->query('SELECT id, status, proposed_json, created_at, admin_validated_at FROM ai_kits_suggestions ORDER BY id DESC LIMIT 100');
  json_response(['ok' => true, 'suggestions' => $stmt->fetchAll()]);
  exit;
}

if ($action === 'validate_ai_kit') {
  require_post();
  require_auth_admin($pdo);

  $body = read_json_body();
  $suggestion_id = isset($body['suggestion_id']) ? (int)$body['suggestion_id'] : 0;

  if ($suggestion_id <= 0) {
    json_response(['ok' => false, 'error' => 'suggestion_id requis'], 422);
    exit;
  }

  $pdo->exec('CREATE TABLE IF NOT EXISTS ai_kits_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL DEFAULT "pending",
    proposed_json TEXT NOT NULL,
    admin_validated_at TEXT,
    created_at TEXT NOT NULL
  )');

  $st = $pdo->prepare('SELECT id, status, proposed_json FROM ai_kits_suggestions WHERE id = :id LIMIT 1');
  $st->execute([':id' => $suggestion_id]);
  $s = $st->fetch();

  if (!$s) {
    json_response(['ok' => false, 'error' => 'Suggestion introuvable'], 404);
    exit;
  }

if (($s['status'] ?? '') !== 'pending') {
    json_response(['ok' => false, 'error' => 'Suggestion déjà traitée'], 409);
    exit;
  }


  $decoded = ai_kits_decode_json((string)($s['proposed_json'] ?? ''));

  // Minimal transformation:
  // - parse kits[].products[].id
  // - set products.is_featured = 1
  // - set products.is_available = 1 iff stock_qty > 0
  $kits = $decoded['kits'] ?? [];
  $productIds = [];
  foreach ($kits as $kit) {
    foreach (($kit['products'] ?? []) as $prod) {
      $pid = isset($prod['id']) ? (int)$prod['id'] : 0;
      if ($pid > 0) $productIds[$pid] = true;
    }
  }

  $productIdsList = array_keys($productIds);

  $updated = 0;

  if ($productIdsList) {
    try { $pdo->exec('ALTER TABLE products ADD COLUMN stock_qty INTEGER NOT NULL DEFAULT 0'); } catch (Throwable $e) {}
    try { $pdo->exec('ALTER TABLE products ADD COLUMN is_available INTEGER NOT NULL DEFAULT 0'); } catch (Throwable $e) {}
    try { $pdo->exec('ALTER TABLE products ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0'); } catch (Throwable $e) {}

    $in = implode(',', array_fill(0, count($productIdsList), '?'));
    $stmt = $pdo->prepare("SELECT id, stock_qty FROM products WHERE id IN ($in)");
    $stmt->execute($productIdsList);
    $rows = $stmt->fetchAll();

    $pdo->beginTransaction();
    try {
      foreach ($rows as $r) {
        $pid = (int)$r['id'];
        $stockQty = (int)($r['stock_qty'] ?? 0);
        $isAvail = $stockQty > 0 ? 1 : 0;

        $up = $pdo->prepare('UPDATE products SET is_featured = 1, is_available = :av WHERE id = :id');
        $up->execute([':av' => $isAvail, ':id' => $pid]);
        $updated++;
      }

      $updS = $pdo->prepare('UPDATE ai_kits_suggestions SET status = "validated", admin_validated_at = datetime("now") WHERE id = :id');
      $updS->execute([':id' => $suggestion_id]);

      $pdo->commit();
    } catch (Throwable $e) {
      $pdo->rollBack();
      json_response(['ok' => false, 'error' => 'db_error', 'details' => $e->getMessage()], 500);
      exit;
    }
  } else {
    $pdo->exec('UPDATE ai_kits_suggestions SET status = "validated", admin_validated_at = datetime("now") WHERE id = ' . (int)$suggestion_id);
  }

  json_response(['ok' => true, 'suggestion_id' => $suggestion_id, 'updated_products' => $updated]);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);
exit;




