<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = db();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

require_method(['POST']);

// SECURITY: never expose any API keys to the client.
// The AI key is stored ONLY on this server file.
$AI_API_KEY = 'AQ.Ab8RN6KBRvW7FmCM3JldWyhwUXCq9IHoFMZdNc6FA1gxLvG9bA';

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

$action = (string)($_GET['action'] ?? '');
$body = read_json_body();
$action = $action ?: (string)($body['action'] ?? 'info');

function clamp_str(string $s, int $max = 12000): string {
  $s = trim($s);
  if (mb_strlen($s) > $max) $s = mb_substr($s, 0, $max);
  return $s;
}

function require_json_field(array $arr, string $key, int $maxLen = 20000): string {
  $v = (string)($arr[$key] ?? '');
  $v = clamp_str($v, $maxLen);
  if ($v === '') {
    json_response(['ok' => false, 'error' => "Champ requis: $key"], 422);
    exit;
  }
  return $v;
}

function safe_int($v, int $min = 0, int $max = 1000000): int {
  $n = (int)$v;
  if ($n < $min) $n = $min;
  if ($n > $max) $n = $max;
  return $n;
}

function ai_http_post(string $url, array $headers, array $payload): array {
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_TIMEOUT => 20,
    CURLOPT_CONNECTTIMEOUT => 8,
  ]);

  $raw = curl_exec($ch);
  if ($raw === false) {
    $err = curl_error($ch);
    curl_close($ch);
    return ['ok' => false, 'error' => 'curl_error', 'details' => $err];
  }
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  $decoded = json_decode((string)$raw, true);
  if (!is_array($decoded)) {
    return ['ok' => false, 'error' => 'bad_json', 'http_code' => $code, 'raw' => $raw];
  }
  return ['ok' => true, 'http_code' => $code, 'data' => $decoded];
}

function extract_ai_text(array $aiResponse): string {
  // We support multiple possible response shapes.
  // Try common fields.
  $candidates = [
    $aiResponse['text'] ?? null,
    $aiResponse['output'] ?? null,
    $aiResponse['result'] ?? null,
    $aiResponse['message']['content'] ?? null,
    $aiResponse['choices'][0]['message']['content'] ?? null,
    $aiResponse['choices'][0]['text'] ?? null,
  ];
  foreach ($candidates as $t) {
    if (is_string($t) && trim($t) !== '') {
      return trim($t);
    }
  }
  return '';
}

$question = clamp_str((string)($body['question'] ?? ''), 6000);
$product_id = isset($body['product_id']) ? safe_int($body['product_id'], 0, 1000000000) : 0;

// Basic rate limiting for this endpoint (server-side only).
// Implemented via a simple file counter to avoid extra tables.
$rateFile = __DIR__ . '/../data/ai_rate_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', (string)$ip);
$rateNow = time();
$window = 60; // 60s
$limit = 30;

if (!is_dir(__DIR__ . '/../data')) {
  @mkdir(__DIR__ . '/../data', 0775, true);
}

$bucket = ['t' => $rateNow, 'c' => 0];
if (file_exists($rateFile)) {
  $raw = @file_get_contents($rateFile);
  $decoded = json_decode((string)$raw, true);
  if (is_array($decoded) && isset($decoded['t'], $decoded['c'])) {
    $bucket = $decoded;
  }
}

if ((int)$bucket['t'] < ($rateNow - $window)) {
  $bucket = ['t' => $rateNow, 'c' => 1];
} else {
  $bucket['c'] = (int)$bucket['c'] + 1;
  if ((int)$bucket['c'] > $limit) {
    json_response(['ok' => false, 'error' => 'Trop de requêtes. Réessayez plus tard.'], 429);
    exit;
  }
}

@file_put_contents($rateFile, json_encode($bucket));

// Load products for context (optional, limited).
function load_products_for_context(PDO $pdo, int $limit = 30): array {
  $limit = max(1, min(100, $limit));
  $stmt = $pdo->prepare('SELECT id, name, description, price_fcfa, image_url, sku FROM products ORDER BY id DESC LIMIT :l');
  $stmt->bindValue(':l', $limit, PDO::PARAM_INT);
  $stmt->execute();
  return $stmt->fetchAll();
}

$productsContext = load_products_for_context($pdo, 18);

if ($action === 'info_product') {
  if ($product_id <= 0) {
    json_response(['ok' => false, 'error' => 'product_id requis'], 422);
    exit;
  }

  $st = $pdo->prepare('SELECT id, name, description, price_fcfa, image_url, sku FROM products WHERE id = :id LIMIT 1');
  $st->execute([':id' => $product_id]);
  $p = $st->fetch();
  if (!$p) {
    json_response(['ok' => false, 'error' => 'Produit introuvable'], 404);
    exit;
  }

  $prompt = "Tu es un conseiller beauté haut de gamme pour une boutique de luxe. "
    ."Expliquer en FRANÇAIS, de façon élégante et claire: l'utilité du produit, pour quel type de cliente, comment l'utiliser (étapes), et 2-3 conseils pro. "
    ."Produit: {$p['name']} (SKU: {$p['sku']}). Description: {$p['description']}. Prix: {$p['price_fcfa']} FCFA. "
    ."Réponds en format court (paragraphes) + une liste à puces.";

  $payload = [
    'model' => 'gpt-4o-mini',
    'messages' => [
      ['role' => 'system', 'content' => 'Réponses en FR, ton luxe, sans inventer de faits médicaux.'],
      ['role' => 'user', 'content' => $prompt],
    ],
    'temperature' => 0.4,
  ];

  $res = ai_http_post(
    'https://api.aiserial.example/v1/chat/completions',
    [
      'Authorization: Bearer ' . $AI_API_KEY,
      'Content-Type: application/json',
    ],
    $payload
  );

  if (!$res['ok']) {
    json_response(['ok' => false, 'error' => 'AI request failed', 'details' => $res], 500);
    exit;
  }

  $text = extract_ai_text($res['data'] ?? []);
  if ($text === '') $text = 'Aucune réponse IA disponible pour le moment.';

  // Store suggestion (optional for audit)
  $ins = $pdo->prepare('CREATE TABLE IF NOT EXISTS ai_infos_log (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, question TEXT, answer TEXT, ip TEXT, ua TEXT, created_at TEXT NOT NULL)');
  try { $ins->execute(); } catch (Throwable $e) {}

  try {
    $stmt = $pdo->prepare('INSERT INTO ai_infos_log(product_id, question, answer, ip, ua, created_at) VALUES(:pid,:q,:a,:ip,:ua,datetime("now"))');
    $stmt->execute([':pid' => $product_id, ':q' => $question, ':a' => $text, ':ip' => $ip, ':ua' => $ua]);
  } catch (Throwable $e) {}

  json_response(['ok' => true, 'product_id' => $product_id, 'answer' => $text]);
  exit;
}

if ($action === 'suggest_kits') {
  $q = $question;
  if ($q === '') {
    json_response(['ok' => false, 'error' => 'question requis'], 422);
    exit;
  }

  $ctx = json_encode($productsContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

  $prompt = "Tu es un assistant pour une boutique de luxe. "
    ."Objectif: proposer 3 kits (ensembles cohérents) à partir des produits disponibles. "
    ."Chaque kit doit inclure: titre, description, liste produits (id, name, qty recommandée), et justification (utilité). "
    ."Réponds strictement en JSON (sans texte autour) avec la forme: "
    ."{\"kits\":[{\"title\":string,\"description\":string,\"products\":[{\"id\":int,\"qty\":int}],\"why\":string}],\"note\":string}. "
    ."Question cliente: {$q}. "
    ."Produits (contexte): {$ctx}";

  $payload = [
    'model' => 'gpt-4o-mini',
    'messages' => [
      ['role' => 'system', 'content' => 'Répondre en JSON strict, sans explication.'],
      ['role' => 'user', 'content' => $prompt],
    ],
    'temperature' => 0.35,
  ];

  $res = ai_http_post(
    'https://api.aiserial.example/v1/chat/completions',
    [
      'Authorization: Bearer ' . $AI_API_KEY,
      'Content-Type: application/json',
    ],
    $payload
  );

  if (!$res['ok']) {
    json_response(['ok' => false, 'error' => 'AI request failed', 'details' => $res], 500);
    exit;
  }

  $text = extract_ai_text($res['data'] ?? []);

  // Try decode JSON
  $json = json_decode($text, true);
  if (!is_array($json)) {
    json_response(['ok' => false, 'error' => 'AI JSON invalide', 'raw' => $text], 500);
    exit;
  }

  // Save suggestion
  $pdo->exec('CREATE TABLE IF NOT EXISTS ai_kits_suggestions (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT NOT NULL DEFAULT "pending", proposed_json TEXT NOT NULL, admin_validated_at TEXT, created_at TEXT NOT NULL)');
  $stmt = $pdo->prepare('INSERT INTO ai_kits_suggestions(status, proposed_json, created_at) VALUES("pending", :j, datetime("now"))');
  $stmt->execute([':j' => json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
  $id = (int)$pdo->lastInsertId();

  json_response(['ok' => true, 'suggestion_id' => $id, 'kits' => $json['kits'] ?? [], 'note' => $json['note'] ?? '']);
  exit;
}

// Default action: generic answer about products.
if ($action === 'answer') {
  $q = require_json_field($body, 'question', 6000);

  $ctx = json_encode($productsContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

  $prompt = "Tu es un conseiller beauté et cosmétique haut de gamme pour une boutique locale. "
    ."Réponds en FR, ton luxe. Utilise les produits fournis uniquement quand pertinent. "
    ."Si le client demande un article précis, mentionne comment l'utiliser. "
    ."Produits disponibles: {$ctx}. "
    ."Question: {$q}";

  $payload = [
    'model' => 'gpt-4o-mini',
    'messages' => [
      ['role' => 'system', 'content' => 'Réponses FR, claires et élégantes. Pas de promesses médicales.'],
      ['role' => 'user', 'content' => $prompt],
    ],
    'temperature' => 0.6,
  ];

  $res = ai_http_post(
    'https://api.aiserial.example/v1/chat/completions',
    [
      'Authorization: Bearer ' . $AI_API_KEY,
      'Content-Type: application/json',
    ],
    $payload
  );

  if (!$res['ok']) {
    json_response(['ok' => false, 'error' => 'AI request failed', 'details' => $res], 500);
    exit;
  }

  $text = extract_ai_text($res['data'] ?? []);
  if ($text === '') $text = 'Aucune réponse IA disponible pour le moment.';

  json_response(['ok' => true, 'answer' => $text]);
  exit;
}

json_response(['ok' => false, 'error' => 'Action IA inconnue'], 400);
exit;


