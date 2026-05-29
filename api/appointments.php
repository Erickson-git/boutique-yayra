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
  $service = trim((string)($body['service'] ?? ''));
  $appointmentTime = trim((string)($body['appointment_time'] ?? ''));
  $notes = trim((string)($body['notes'] ?? ''));

  if ($fullName === '' || $phone === '' || $service === '' || $appointmentTime === '') {
    json_response(['ok' => false, 'error' => 'Champs requis'], 422);
    exit;
  }

  $ins = $pdo->prepare('INSERT INTO appointments(user_id, full_name, phone, service, appointment_time, notes, status, created_at)
    VALUES(:uid,:fn,:ph,:sv,:t,:n,:st,datetime("now"))');
  $ins->execute([
    ':uid' => (int)$user['id'],
    ':fn' => $fullName,
    ':ph' => $phone,
    ':sv' => $service,
    ':t' => $appointmentTime,
    ':n' => $notes,
    ':st' => 'scheduled',
  ]);

  $id = (int)$pdo->lastInsertId();
  json_response(['ok' => true, 'appointment_id' => $id]);
  exit;
}

if ($action === 'list') {
  $user = require_auth_user();

  $st = $pdo->prepare('SELECT id, full_name, phone, service, appointment_time, notes, status, created_at
    FROM appointments WHERE user_id = :uid ORDER BY id DESC');
  $st->execute([':uid' => (int)$user['id']]);
  json_response(['ok' => true, 'appointments' => $st->fetchAll()]);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);

