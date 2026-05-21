<?php

declare(strict_types=1);

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'error' => 'config.php ontbreekt — kopieer config.example.php naar config.php',
    ], JSON_UNESCAPED_UNICODE);
    exit;
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
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Salon-Key');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function salon_require_auth(): void
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
