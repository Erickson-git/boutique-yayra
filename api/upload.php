<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
if ($method !== 'POST') {
  json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
  exit;
}

// Require admin auth
require_auth_admin();

// Ensure upload dir exists
$uploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
  json_response(['ok' => false, 'error' => 'Fichier requis et sans erreur'], 422);
  exit;
}

$file = $_FILES['image'];

// Validation
$maxSize = 5 * 1024 * 1024; // 5 MB
if ($file['size'] > $maxSize) {
  json_response(['ok' => false, 'error' => 'Fichier trop volumineux (max 5 MB)'], 422);
  exit;
}

$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($file['type'], $allowed, true)) {
  json_response(['ok' => false, 'error' => 'Type de fichier non autorisé'], 422);
  exit;
}

// Generate safe filename
$ext = match($file['type']) {
  'image/jpeg' => 'jpg',
  'image/png' => 'png',
  'image/webp' => 'webp',
  'image/gif' => 'gif',
  default => 'jpg',
};

$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$filepath = $uploadDir . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
  json_response(['ok' => false, 'error' => 'Erreur lors du déplacement du fichier'], 500);
  exit;
}

// Return relative path for use in image_url field
$relativePath = '/assets/images/uploads/' . $filename;

json_response(['ok' => true, 'image_url' => $relativePath, 'filename' => $filename]);
