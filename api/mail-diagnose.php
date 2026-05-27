<?php
/**
 * SMTP-diagnose (alleen met installatiesleutel).
 * https://agenda.eliminstituut.nl/api/mail-diagnose.php?key=tijdelijk-installatie-wachtwoord
 */
declare(strict_types=1);

require_once __DIR__ . '/mail-store.php';
require_once __DIR__ . '/smtp-mail.php';

$installKey = 'tijdelijk-installatie-wachtwoord';
$key = (string) ($_GET['key'] ?? $_POST['key'] ?? '');

if ($key === '' || !hash_equals($installKey, $key)) {
    http_response_code(403);
    exit('Unauthorized');
}

$user = trim((string) ($_POST['gmail'] ?? ''));
$pass = salon_normalize_app_password((string) ($_POST['app_pass'] ?? ''));

if ($user === '') {
    salon_load_mail_config();
    $user = defined('SALON_SMTP_USER') ? SALON_SMTP_USER : 'eliminstituut@gmail.com';
}

$diag = salon_smtp_diagnose($user, $pass !== '' ? $pass : null);

header('Content-Type: text/html; charset=utf-8');
echo '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
echo '<title>Mail diagnose</title>';
echo '<style>body{font-family:system-ui,sans-serif;background:#eef5f0;margin:0;padding:16px}'
    . 'pre{background:#fff;padding:16px;border-radius:10px;overflow:auto;font-size:13px}'
    . 'input{padding:10px;width:100%;max-width:400px;margin:6px 0 12px}'
    . 'button{padding:10px 16px;background:#5fa463;color:#fff;border:0;border-radius:8px;font-weight:600}</style></head><body>';
echo '<h1>Mail diagnose</h1>';
echo '<form method="post"><input type="hidden" name="key" value="' . htmlspecialchars($key) . '">';
echo '<label>Gmail</label><br><input type="email" name="gmail" value="' . htmlspecialchars($user) . '"><br>';
echo '<label>App-wachtwoord (optioneel — voor send-test)</label><br><input type="password" name="app_pass" autocomplete="new-password"><br>';
echo '<button type="submit">Diagnose uitvoeren</button></form>';
echo '<pre>' . htmlspecialchars(json_encode($diag, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre>';
echo '<p><a href="setup-mail.php?key=' . urlencode($key) . '">← Terug naar Gmail koppelen</a></p>';
echo '</body></html>';
