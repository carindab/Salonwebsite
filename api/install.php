<?php

declare(strict_types=1);

$key = $_GET['key'] ?? '';
$installKey = 'tijdelijk-installatie-wachtwoord';

function install_html(string $title, string $body, bool $ok = true): void
{
    $color = $ok ? '#2e7d32' : '#c0392b';
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . htmlspecialchars($title) . '</title></head><body style="font-family:system-ui,sans-serif;background:#eef5f0;min-height:100vh;display:grid;place-items:center;padding:16px">'
        . '<div style="background:#fff;padding:28px;border-radius:14px;max-width:480px;box-shadow:0 12px 40px rgba(0,0,0,.08)">'
        . '<h1 style="color:#2d5a3d;margin:0 0 12px">' . htmlspecialchars($title) . '</h1>'
        . '<div style="color:' . $color . ';font-size:15px;line-height:1.5">' . $body . '</div></div></body></html>';
    exit;
}

if ($key === '' || !hash_equals($installKey, $key)) {
    install_html('Geen toegang', 'Unauthorized.', false);
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    install_html(
        'Config ontbreekt',
        '<p>Ga eerst naar <a href="configure.php?key=' . htmlspecialchars($key) . '">configure.php</a> om de database in te stellen.</p>',
        false
    );
}

require_once __DIR__ . '/bootstrap.php';

try {
    $pdo = salon_pdo();
    $schema = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('schema.sql niet gevonden');
    }

    foreach (array_filter(array_map('trim', explode(';', $schema))) as $statement) {
        if ($statement !== '') {
            $pdo->exec($statement);
        }
    }

    $next = 'setup-user.php?key=' . urlencode($key);
    install_html(
        'Database klaar ✓',
        '<p>Tabellen zijn aangemaakt.</p><p><a href="' . htmlspecialchars($next) . '" style="display:inline-block;margin-top:12px;padding:12px 20px;background:#5fa463;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">→ Jouw login aanmaken</a></p>',
        true
    );
} catch (Throwable $e) {
    $msg = $e->getMessage();
    $fix = 'configure.php?key=' . urlencode($key) . '&fix=1';
    $hint = str_contains($msg, '1045')
        ? '<p><strong>Wachtwoord of gebruikersnaam klopt niet.</strong></p>'
        : '<p><strong>Database-fout:</strong> ' . htmlspecialchars($msg) . '</p>';
    install_html(
        'Database verbinding mislukt',
        $hint . '<p><a href="' . htmlspecialchars($fix) . '">→ Database-gegevens opnieuw invullen</a></p>',
        false
    );
}
