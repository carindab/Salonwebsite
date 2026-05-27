<?php

declare(strict_types=1);

require_once __DIR__ . '/config-store.php';

function salon_config_missing_response(): void
{
    $setup = salon_setup_url();
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if (str_contains($accept, 'text/html') && !str_contains($_SERVER['SCRIPT_NAME'] ?? '', 'bootstrap.php')) {
        header('Content-Type: text/html; charset=utf-8');
        http_response_code(503);
        echo '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<title>Setup vereist</title></head><body style="font-family:system-ui,sans-serif;background:#eef5f0;min-height:100vh;display:grid;place-items:center;padding:16px">'
            . '<div style="background:#fff;padding:28px;border-radius:14px;max-width:480px">'
            . '<h1 style="color:#2d5a3d">Database opnieuw koppelen</h1>'
            . '<p>De koppeling met MySQL is weg na een update (Git redeploy). <strong>Je klanten en afspraken staan nog in de database</strong> — vul alleen je MySQL-gegevens opnieuw in.</p>'
            . '<p><a href="' . htmlspecialchars($setup) . '" style="display:inline-block;padding:12px 20px;background:#5fa463;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">→ Opnieuw koppelen</a></p>'
            . '</div></body></html>';
        exit;
    }
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'error' => 'Database-koppeling ontbreekt na update — klik opnieuw koppelen',
        'setupUrl' => $setup,
        'configMissing' => true,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$configFile = salon_find_config_file();
if ($configFile === null) {
    salon_config_missing_response();
}

require_once $configFile;

function salon_json_out(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function salon_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Salon-Key');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function salon_require_auth_legacy(): void
{
    if (!defined('SALON_API_KEY') || SALON_API_KEY === '' || SALON_API_KEY === 'wijzig-dit-naar-een-lang-willekeurig-wachtwoord') {
        salon_json_out(['ok' => false, 'error' => 'SALON_API_KEY niet ingesteld in config.php'], 503);
    }
    $key = $_SERVER['HTTP_X_SALON_KEY'] ?? '';
    if ($key === '' || !hash_equals(SALON_API_KEY, $key)) {
        salon_json_out(['ok' => false, 'error' => 'Unauthorized'], 401);
    }
}

function salon_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

function salon_read_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function salon_meta_keys(): array
{
    return [
        'settings',
        'messageTemplates',
        'intakeQuestions',
        'treatmentCategories',
        'treatments',
        'productCategories',
        'products',
        'packages',
        'cadeaubonnen',
        'autoFinalizeLog',
        'burcuAkcayDemo',
    ];
}

function salon_load_meta(PDO $pdo): array
{
    $meta = [];
    $stmt = $pdo->query('SELECT meta_key, meta_value FROM salon_meta');
    foreach ($stmt as $row) {
        $decoded = json_decode($row['meta_value'], true);
        $meta[$row['meta_key']] = $decoded;
    }
    return $meta;
}

function salon_get_revision(PDO $pdo): int
{
    $row = $pdo->query('SELECT revision FROM salon_sync WHERE id = 1')->fetch();
    return $row ? (int) $row['revision'] : 0;
}

function salon_bump_revision(PDO $pdo): int
{
    $pdo->exec('UPDATE salon_sync SET revision = revision + 1 WHERE id = 1');
    return salon_get_revision($pdo);
}

function salon_save_meta(PDO $pdo, array $meta): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO salon_meta (meta_key, meta_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)'
    );
    foreach (salon_meta_keys() as $key) {
        if (!array_key_exists($key, $meta)) {
            continue;
        }
        $stmt->execute([$key, json_encode($meta[$key], JSON_UNESCAPED_UNICODE)]);
    }
}

function salon_replace_clients(PDO $pdo, array $clients): void
{
    $pdo->exec('DELETE FROM salon_clients');
    if (!$clients) {
        return;
    }
    $stmt = $pdo->prepare('INSERT INTO salon_clients (id, data) VALUES (?, ?)');
    foreach ($clients as $client) {
        if (!is_array($client) || empty($client['id'])) {
            continue;
        }
        $stmt->execute([(string) $client['id'], json_encode($client, JSON_UNESCAPED_UNICODE)]);
    }
}

function salon_replace_appointments(PDO $pdo, array $appointments): void
{
    $pdo->exec('DELETE FROM salon_appointments');
    if (!$appointments) {
        return;
    }
    $stmt = $pdo->prepare(
        'INSERT INTO salon_appointments (id, client_id, appt_date, appt_time, status, data)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    foreach ($appointments as $appt) {
        if (!is_array($appt) || empty($appt['id'])) {
            continue;
        }
        $stmt->execute([
            (string) $appt['id'],
            isset($appt['clientId']) ? (string) $appt['clientId'] : null,
            isset($appt['date']) ? (string) $appt['date'] : null,
            isset($appt['time']) ? (string) $appt['time'] : null,
            isset($appt['status']) ? (string) $appt['status'] : null,
            json_encode($appt, JSON_UNESCAPED_UNICODE),
        ]);
    }
}

function salon_load_clients(PDO $pdo): array
{
    $clients = [];
    $stmt = $pdo->query('SELECT data FROM salon_clients');
    foreach ($stmt as $row) {
        $decoded = json_decode($row['data'], true);
        if (is_array($decoded)) {
            $clients[] = $decoded;
        }
    }
    return $clients;
}

function salon_load_appointments(PDO $pdo): array
{
    $appointments = [];
    $stmt = $pdo->query('SELECT data FROM salon_appointments ORDER BY appt_date ASC, appt_time ASC');
    foreach ($stmt as $row) {
        $decoded = json_decode($row['data'], true);
        if (is_array($decoded)) {
            $appointments[] = $decoded;
        }
    }
    return $appointments;
}

function salon_counts(PDO $pdo): array
{
    $clients = (int) $pdo->query('SELECT COUNT(*) FROM salon_clients')->fetchColumn();
    $appointments = (int) $pdo->query('SELECT COUNT(*) FROM salon_appointments')->fetchColumn();
    return ['clients' => $clients, 'appointments' => $appointments];
}

/** Importeert salon-seed.json (2404 klanten, 10613 afspraken) naar MySQL. */
function salon_import_seed(PDO $pdo): array
{
    $seedPath = dirname(__DIR__) . '/salon-seed.json';
    if (!is_file($seedPath)) {
        throw new RuntimeException('salon-seed.json niet gevonden');
    }
    $raw = file_get_contents($seedPath);
    $seed = json_decode($raw ?: '', true);
    if (!is_array($seed) || !isset($seed['clients'], $seed['appointments'])) {
        throw new RuntimeException('Ongeldig salon-seed.json');
    }
    $pdo->beginTransaction();
    salon_replace_clients($pdo, $seed['clients']);
    salon_replace_appointments($pdo, $seed['appointments']);
    $revision = salon_bump_revision($pdo);
    $pdo->commit();
    salon_refresh_load_cache($pdo);
    return [
        'clients' => count($seed['clients']),
        'appointments' => count($seed['appointments']),
        'revision' => $revision,
        'seedVersion' => $seed['v'] ?? null,
    ];
}

/** Snelle load-cache (gzip) — voorkomt 504 bij 10k+ afspraken. */
function salon_cache_dir(): string
{
    $persist = function_exists('salon_persistent_config_dir') ? salon_persistent_config_dir() : null;
    if ($persist !== null && is_writable($persist)) {
        $dir = $persist . '/.salon-cache';
    } else {
        $dir = dirname(__DIR__) . '/.salon-cache';
    }
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

function salon_load_cache_path(int $revision): string
{
    return salon_cache_dir() . '/load-r' . $revision . '.json.gz';
}

function salon_prepare_api_runtime(): void
{
    @set_time_limit(300);
    @ini_set('memory_limit', '512M');
}

function salon_build_load_payload(PDO $pdo): array
{
    $clients = salon_load_clients($pdo);
    $appointments = salon_load_appointments($pdo);
    return [
        'ok' => true,
        'revision' => salon_get_revision($pdo),
        'meta' => salon_load_meta($pdo),
        'clients' => $clients,
        'appointments' => $appointments,
        'counts' => [
            'clients' => count($clients),
            'appointments' => count($appointments),
        ],
    ];
}

function salon_write_load_cache(PDO $pdo, ?array $payload = null): bool
{
    $payload = $payload ?? salon_build_load_payload($pdo);
    $revision = (int) ($payload['revision'] ?? salon_get_revision($pdo));
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        return false;
    }
    $path = salon_load_cache_path($revision);
    $ok = @file_put_contents($path, gzencode($json, 6)) !== false;
    if ($ok) {
        @chmod($path, 0640);
        foreach (glob(salon_cache_dir() . '/load-r*.json.gz') ?: [] as $old) {
            if ($old !== $path && is_file($old)) {
                @unlink($old);
            }
        }
    }
    return $ok;
}

function salon_refresh_load_cache(PDO $pdo): void
{
    try {
        salon_write_load_cache($pdo);
    } catch (Throwable $e) {
        /* cache is optioneel */
    }
}

function salon_serve_load_cache(int $revision): bool
{
    $path = salon_load_cache_path($revision);
    if (!is_file($path) || filesize($path) < 32) {
        return false;
    }
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Encoding: gzip');
    header('Cache-Control: private, no-cache');
    header('X-Salon-Cache: hit');
    readfile($path);
    exit;
}

function salon_load_clients_chunk(PDO $pdo, int $offset, int $limit): array
{
    $stmt = $pdo->prepare('SELECT data FROM salon_clients ORDER BY id LIMIT ? OFFSET ?');
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $clients = [];
    foreach ($stmt as $row) {
        $decoded = json_decode($row['data'], true);
        if (is_array($decoded)) {
            $clients[] = $decoded;
        }
    }
    return $clients;
}

function salon_load_appointments_chunk(PDO $pdo, int $offset, int $limit): array
{
    $stmt = $pdo->prepare(
        'SELECT data FROM salon_appointments ORDER BY appt_date ASC, appt_time ASC, id LIMIT ? OFFSET ?'
    );
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $appointments = [];
    foreach ($stmt as $row) {
        $decoded = json_decode($row['data'], true);
        if (is_array($decoded)) {
            $appointments[] = $decoded;
        }
    }
    return $appointments;
}
