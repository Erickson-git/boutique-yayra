<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

require_method(['POST']);

$email = trim((string)($_POST['email'] ?? ''));
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_response(['ok' => false, 'error' => 'Email invalide'], 422);
  exit;
}

try {
  $pdo = db();
  $stmt = $pdo->prepare('INSERT INTO newsletter_subscribers(email, created_at) VALUES(:e, datetime("now"))');
  $stmt->execute([':e' => $email]);

  json_response(['ok' => true, 'message' => 'Inscription confirmée. Merci !']);
} catch (Throwable $e) {
  // duplicate or db not initialized
  json_response(['ok' => false, 'error' => 'Impossible d’enregistrer (DB non initialisée ou email déjà inscrit).'], 500);
}

