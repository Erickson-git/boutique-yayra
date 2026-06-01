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

function clamp_str(string $s, int $max): string {
  $s = trim($s);
  if (mb_strlen($s) > $max) $s = mb_substr($s, 0, $max);
  return $s;
}

function json_response(array $data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

if ($action === 'create_demo_payment') {
  require_post();
  // Optional auth (demo)
  $body = read_json_body();

  $order_id = isset($body['order_id']) ? (int)$body['order_id'] : 0;
  $method_in = clamp_str((string)($body['method'] ?? 'online'), 40);

  if ($order_id <= 0) {
    json_response(['ok' => false, 'error' => 'order_id requis'], 422);
    exit;
  }

  $st = $pdo->prepare('SELECT id, status, total_fcfa FROM orders WHERE id = :id LIMIT 1');
  $st->execute([':id' => $order_id]);
  $o = $st->fetch();
  if (!$o) {
    json_response(['ok' => false, 'error' => 'Commande introuvable'], 404);
    exit;
  }

  $pdo->exec('CREATE TABLE IF NOT EXISTS demo_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT "created",
    provider_ref TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
  )');

  // Create a fake provider ref
  $providerRef = 'DEMO_' . bin2hex(random_bytes(8));

  $ins = $pdo->prepare('INSERT INTO demo_payments(order_id, provider, method, status, provider_ref, created_at)
    VALUES(:oid, :prov, :m, "created", :ref, datetime("now"))');
  $ins->execute([
    ':oid' => $order_id,
    ':prov' => 'demo_provider',
    ':m' => $method_in,
    ':ref' => $providerRef,
  ]);

  // In a real flow, we would redirect to provider. Here we return a status.
  json_response([
    'ok' => true,
    'payment' => [
      'order_id' => $order_id,
      'provider' => 'demo_provider',
      'provider_ref' => $providerRef,
      'status' => 'created',
      'message' => 'Paiement en ligne (démo) créé. Appel simulate_pay_success pour valider.'
    ],
  ]);
  exit;
}

if ($action === 'simulate_pay_success') {
  require_post();
  $body = read_json_body();

  $order_id = isset($body['order_id']) ? (int)$body['order_id'] : 0;
  if ($order_id <= 0) {
    json_response(['ok' => false, 'error' => 'order_id requis'], 422);
    exit;
  }

  $pdo->exec('CREATE TABLE IF NOT EXISTS demo_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT "created",
    provider_ref TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
  )');

  $pdo->beginTransaction();
  try {
    $upd = $pdo->prepare('UPDATE demo_payments SET status = "paid" WHERE order_id = :oid AND status = "created"');
    $upd->execute([':oid' => $order_id]);

    $upd2 = $pdo->prepare('UPDATE orders SET status = "paid" WHERE id = :oid');
    $upd2->execute([':oid' => $order_id]);

    $pdo->commit();
  } catch (Throwable $e) {
    $pdo->rollBack();
    json_response(['ok' => false, 'error' => 'db_error', 'details' => $e->getMessage()], 500);
    exit;
  }

  json_response(['ok' => true, 'message' => 'Paiement (démo) validé.']);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);
exit;

