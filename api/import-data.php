<?php

declare(strict_types=1);

/**
 * Eenmalig: laadt alle klanten + afspraken uit salon-seed.json in MySQL.
 * https://agenda.eliminstituut.nl/api/import-data.php?key=tijdelijk-installatie-wachtwoord
 */
$key = $_GET['key'] ?? '';
$installKey = 'tijdelijk-installatie-wachtwoord';

function import_html(string $title, string $body, bool $ok = true): void
{
    $color = $ok ? '#2e7d32' : '#c0392b';
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . htmlspecialchars($title) . '</title></head><body style="font-family:system-ui,sans-serif;background:#eef5f0;min-height:100vh;display:grid;place-items:center;padding:16px">'
        . '<div style="background:#fff;padding:28px;border-radius:14px;max-width:520px;box-shadow:0 12px 40px rgba(0,0,0,.08)">'
        . '<h1 style="color:#2d5a3d;margin:0 0 12px">' . htmlspecialchars($title) . '</h1>'
        . '<div style="color:' . $color . ';font-size:15px;line-height:1.6">' . $body . '</div></div></body></html>';
    exit;
}

if ($key === '' || !hash_equals($installKey, $key)) {
    import_html('Geen toegang', 'Unauthorized.', false);
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    import_html('Config ontbreekt', '<p>Open de <a href="setup.php?key=' . htmlspecialchars($key) . '">alles-in-één setup</a>.</p>', false);
}

require_once __DIR__ . '/bootstrap.php';

set_time_limit(300);
ini_set('memory_limit', '512M');

try {
    $pdo = salon_pdo();
    $result = salon_import_seed($pdo);
    $home = '/';
    import_html(
        'Klanten geladen ✓',
        '<p><strong>' . (int) $result['clients'] . ' klanten</strong> · '
        . '<strong>' . (int) $result['appointments'] . ' afspraken</strong> staan nu in je Hostinger-database.</p>'
        . '<p>Log in op je agenda:</p>'
        . '<p><a href="' . htmlspecialchars($home) . '" style="display:inline-block;margin-top:8px;padding:12px 20px;background:#5fa463;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">→ Naar agenda.eliminstituut.nl</a></p>',
        true
    );
} catch (Throwable $e) {
    import_html('Import mislukt', '<p>' . htmlspecialchars($e->getMessage()) . '</p>', false);
}
