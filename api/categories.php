<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = db();

header('Content-Type: application/json; charset=utf-8');

$action = (string)($_GET['action'] ?? 'list');

if ($action === 'list') {
  $stmt = $pdo->query('SELECT id, slug, name FROM categories ORDER BY name ASC');
  json_response(['ok' => true, 'categories' => $stmt->fetchAll()]);
  exit;
}

json_response(['ok' => false, 'error' => 'Action inconnue'], 400);

