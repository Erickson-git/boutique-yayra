<?php
declare(strict_types=1);

// Common security headers for API responses
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer-when-downgrade');
header('Permissions-Policy: interest-cohort=()');
// Note: If you run behind HTTPS, consider enabling HSTS in your webserver configuration.

function db_path(): string {
  // api/db.php is in /api; DB lives in /data/yayra.sqlite
  $base = dirname(__DIR__);
  $dataDir = $base . DIRECTORY_SEPARATOR . 'data';
  if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
  }
  return $dataDir . DIRECTORY_SEPARATOR . 'yayra.sqlite';
}

function db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;

  $dsn = 'sqlite:' . db_path();
  $pdo = new PDO($dsn);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  return $pdo;
}

function json_response(array $data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $decoded = json_decode($raw, true);
  return is_array($decoded) ? $decoded : [];
}

function require_method(array $methods): void {
  $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
  if (!in_array($m, $methods, true)) {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    exit;
  }
}

function require_auth_user(): array {
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

  $pdo = db();
  $stmt = $pdo->prepare('SELECT id, email, role FROM users WHERE token = :t AND token_expires_at > datetime("now")');
  $stmt->execute([':t' => $token]);
  $user = $stmt->fetch();

  if (!$user) {
    json_response(['ok' => false, 'error' => 'Unauthorized'], 401);
    exit;
  }
  return $user;
}

function require_auth_admin(): array {
  $user = require_auth_user();
  if (($user['role'] ?? '') !== 'admin') {
    json_response(['ok' => false, 'error' => 'Admin only'], 403);
    exit;
  }
  return $user;
}

