<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$action = (string)($_GET['action'] ?? '');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');

if ($method !== 'POST') {
  json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
  exit;
}

$body = read_json_body();
$email = trim((string)($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

$action = $action ?: (string)($body['action'] ?? '');

if ($action === 'login') {
  if ($email === '' || $password === '') {
    json_response(['ok' => false, 'error' => 'Email et mot de passe requis'], 422);
    exit;
  }

  $pdo = db();
  $stmt = $pdo->prepare('SELECT id, email, password_hash, role FROM users WHERE email = :e LIMIT 1');
  $stmt->execute([':e' => $email]);
  $user = $stmt->fetch();

  if (!$user || !password_verify($password, $user['password_hash'])) {
    json_response(['ok' => false, 'error' => 'Identifiants invalides'], 401);
    exit;
  }

  $token = bin2hex(random_bytes(24));
  $expires = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 7);

  $upd = $pdo->prepare('UPDATE users SET token = :t, token_expires_at = :x WHERE id = :id');
  $upd->execute([':t' => $token, ':x' => $expires, ':id' => (int)$user['id']]);

  json_response(['ok' => true, 'token' => $token, 'role' => $user['role']]);
  exit;
}

if ($action === 'register') {
  $fullName = trim((string)($body['full_name'] ?? ''));

  if ($email === '' || $password === '') {
    json_response(['ok' => false, 'error' => 'Email et mot de passe requis'], 422);
    exit;
  }

  $pdo = db();

  // password policy (simple)
  if (strlen($password) < 6) {
    json_response(['ok' => false, 'error' => 'Mot de passe trop court (min 6)'], 422);
    exit;
  }

  try {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO users(email, password_hash, role, created_at) VALUES(:e,:p,"client",datetime("now"))');
    $ins->execute([':e' => $email, ':p' => $hash]);

    json_response(['ok' => true, 'message' => 'Compte créé.']);
  } catch (Throwable $e) {
    json_response(['ok' => false, 'error' => 'Email déjà utilisé'], 409);
  }
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue (login/register)'], 400);

