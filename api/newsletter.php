<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

require_method(['POST']);

// Basic input validation
$email = trim((string)($_POST['email'] ?? ''));
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_response(['ok' => false, 'error' => 'Email invalide'], 422);
  exit;
}

try {
  $pdo = db();
  // Check duplicate
  $chk = $pdo->prepare('SELECT id FROM newsletter_subscribers WHERE email = :e LIMIT 1');
  $chk->execute([':e' => $email]);
  if ($chk->fetch()) {
    json_response(['ok' => false, 'error' => 'Email déjà inscrit'], 409);
    exit;
  }

  $stmt = $pdo->prepare('INSERT INTO newsletter_subscribers(email, created_at) VALUES(:e, datetime("now"))');
  $stmt->execute([':e' => $email]);

  json_response(['ok' => true, 'message' => 'Inscription confirmée. Merci !']);
} catch (Throwable $e) {
  // Do not leak exception details
  json_response(['ok' => false, 'error' => 'Impossible d’enregistrer.'], 500);
}

