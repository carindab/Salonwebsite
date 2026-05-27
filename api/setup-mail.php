<?php
/**
 * Gmail koppelen voor automatische herinneringen (24 uur van tevoren).
 * https://agenda.eliminstituut.nl/api/setup-mail.php?key=tijdelijk-installatie-wachtwoord
 */
declare(strict_types=1);

require_once __DIR__ . '/config-store.php';
require_once __DIR__ . '/mail-store.php';
require_once __DIR__ . '/smtp-mail.php';

$installKey = 'tijdelijk-installatie-wachtwoord';
$key = (string) ($_GET['key'] ?? $_POST['key'] ?? '');

if ($key === '' || !hash_equals($installKey, $key)) {
    http_response_code(403);
    exit('Unauthorized');
}

function mail_setup_html(string $title, string $body): void
{
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . htmlspecialchars($title) . '</title>'
        . '<style>body{font-family:system-ui,sans-serif;background:#eef5f0;margin:0;min-height:100vh;display:grid;place-items:center;padding:16px}'
        . '.box{background:#fff;padding:28px;border-radius:14px;width:min(520px,100%);box-shadow:0 12px 40px rgba(0,0,0,.08)}'
        . 'h1{margin:0 0 12px;color:#2d5a3d;font-size:22px}p,li{color:#555;font-size:14px;line-height:1.55}'
        . 'label{display:block;margin:14px 0 6px;font-size:13px;font-weight:600}'
        . 'input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #ccc;border-radius:8px;font-size:16px}'
        . 'button{margin-top:14px;padding:13px 20px;border:0;border-radius:8px;background:#5fa463;color:#fff;font-size:16px;font-weight:600;cursor:pointer}'
        . '.err{background:#fdecea;color:#c0392b;padding:10px 12px;border-radius:8px;margin-bottom:12px;font-size:14px}'
        . '.ok{background:#e8f5e9;color:#2e7d32;padding:10px 12px;border-radius:8px;margin-bottom:12px;font-size:14px}'
        . '.note{background:#fff8e6;border:1px solid #f0dfa0;padding:10px 12px;border-radius:8px;font-size:13px;margin-bottom:12px}</style></head><body>'
        . '<div class="box"><h1>' . htmlspecialchars($title) . '</h1>' . $body . '</div></body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? 'save');
    $gmail = trim((string) ($_POST['gmail'] ?? 'eliminstituut@gmail.com'));
    $appPass = salon_normalize_app_password((string) ($_POST['app_pass'] ?? ''));
    $fromName = trim((string) ($_POST['from_name'] ?? 'Elim Instituut'));

    if ($action === 'test') {
        require_once __DIR__ . '/bootstrap.php';
        if ($appPass === '') {
            mail_setup_html(
                'Test mislukt',
                '<p class="err">Vul het Gmail app-wachtwoord opnieuw in (16 tekens). Zonder wachtwoord kan de test niet.</p>'
                . mail_setup_form($key)
            );
        }
        $cronKey = salon_read_cron_key();
        salon_write_mail_config(salon_build_mail_config_php($gmail, $appPass, $gmail, $fromName, $cronKey));
        salon_load_mail_config();
        $testTo = $gmail;
        $res = salon_smtp_send($testTo, 'Test — Elim Instituut agenda', "Dit is een testmail van je salon-agenda.\n\nAutomatische herinneringen werken als Hostinger cron is ingesteld.");
        if ($res['ok']) {
            mail_setup_html('Gmail test gelukt', '<p class="ok">Testmail verstuurd naar ' . htmlspecialchars($gmail) . '.</p>' . mail_setup_form($key));
        }
        $diagLink = 'mail-diagnose.php?key=' . urlencode($key);
        mail_setup_html(
            'Test mislukt',
            '<p class="err">' . htmlspecialchars($res['error'] ?? 'onbekend') . '</p>'
            . '<p class="note">Tip: maak een <strong>nieuw</strong> app-wachtwoord aan bij Google (Beveiliging → App-wachtwoorden). Plak de 16 tekens zonder spaties.</p>'
            . '<p><a href="' . htmlspecialchars($diagLink) . '">Technische diagnose openen</a></p>'
            . mail_setup_form($key)
        );
    }

    if ($appPass === '') {
        mail_setup_html('Gmail koppelen', '<p class="err">Vul het Gmail app-wachtwoord in.</p>' . mail_setup_form($key));
    }

    $cronKey = salon_read_cron_key();
    $ok = salon_write_mail_config(salon_build_mail_config_php($gmail, $appPass, $gmail, $fromName, $cronKey));
    if (!$ok) {
        mail_setup_html('Opslaan mislukt', '<p class="err">Kon mail-config niet wegschrijven.</p>' . mail_setup_form($key));
    }

    $cronUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'agenda.eliminstituut.nl') . '/api/send-reminders.php?key=' . urlencode($cronKey);
    mail_setup_html(
        'Gmail gekoppeld',
        '<p class="ok">E-mail is opgeslagen. Herinneringen worden ~24 uur van tevoren verstuurd.</p>'
        . '<p><strong>Laatste stap — cron in Hostinger:</strong></p>'
        . '<ol><li>hPanel → Geavanceerd → Cron Jobs</li>'
        . '<li>Elk uur: <code>0 * * * *</code></li>'
        . '<li>Commando:<br><code style="word-break:break-all;font-size:12px">curl -s "' . htmlspecialchars($cronUrl) . '"</code></li></ol>'
        . '<p class="note">Bewaar deze URL — niet delen (bevat geheime sleutel).</p>'
        . '<p><a href="/">← Terug naar agenda</a></p>'
    );
}

function mail_setup_form(string $key): string
{
    $configured = salon_mail_configured();
    $status = $configured ? '<p class="ok">Gmail is al gekoppeld. Vul opnieuw in om te wijzigen.</p>' : '';
    return $status
        . '<p class="note"><strong>Gmail app-wachtwoord:</strong> Google-account → Beveiliging → 2-stapsverificatie aan → App-wachtwoorden → “Mail” / “Salon”.</p>'
        . '<form method="post">'
        . '<input type="hidden" name="key" value="' . htmlspecialchars($key) . '">'
        . '<label>Gmail-adres</label><input type="email" name="gmail" value="eliminstituut@gmail.com" required>'
        . '<label>App-wachtwoord (16 tekens, zonder spaties)</label><input type="password" name="app_pass" autocomplete="new-password" placeholder="abcdefghijklmnop">'
        . '<label>Naam afzender</label><input type="text" name="from_name" value="Elim Instituut">'
        . '<button type="submit" name="action" value="save">Opslaan</button> '
        . '<button type="submit" name="action" value="test" style="background:#8b7355;margin-left:8px">Testmail sturen</button>'
        . '</form>';
}

mail_setup_html('Gmail koppelen — automatische herinneringen', mail_setup_form($key));
