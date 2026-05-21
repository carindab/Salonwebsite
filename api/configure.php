<?php
/**
 * Eenmalige setup: maakt api/config.php aan op Hostinger.
 * Bezoek: /api/configure.php?key=tijdelijk-installatie-wachtwoord
 * (zelfde key als in config.example.php — wijzig later in config.php)
 */
declare(strict_types=1);

$defaultInstallKey = 'tijdelijk-installatie-wachtwoord';
$key = (string) ($_GET['key'] ?? $_POST['key'] ?? '');
$configPath = __DIR__ . '/config.php';

if ($key === '' || !hash_equals($defaultInstallKey, $key)) {
    http_response_code(403);
    exit('Unauthorized — gebruik: /api/configure.php?key=tijdelijk-installatie-wachtwoord');
}

if (is_file($configPath)) {
    header('Location: setup-user.php?key=' . urlencode($key));
    exit;
}

$error = '';
$done = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = trim((string) ($_POST['db_host'] ?? 'localhost'));
    $dbName = trim((string) ($_POST['db_name'] ?? ''));
    $dbUser = trim((string) ($_POST['db_user'] ?? ''));
    $dbPass = (string) ($_POST['db_pass'] ?? '');
    $apiKey = trim((string) ($_POST['api_key'] ?? ''));
    $installKey = trim((string) ($_POST['install_key'] ?? $defaultInstallKey));

    if ($dbName === '' || $dbUser === '') {
        $error = 'Database-naam en gebruikersnaam zijn verplicht.';
    } elseif (strlen($apiKey) < 12) {
        $error = 'Kies een API-sleutel van minimaal 12 tekens (lang willekeurig wachtwoord).';
    } else {
        $apiKeyEsc = addslashes($apiKey);
        $installKeyEsc = addslashes($installKey);
        $dbHostEsc = addslashes($dbHost);
        $dbNameEsc = addslashes($dbName);
        $dbUserEsc = addslashes($dbUser);
        $dbPassEsc = addslashes($dbPass);

        $php = <<<PHP
<?php
define('DB_HOST', '{$dbHostEsc}');
define('DB_NAME', '{$dbNameEsc}');
define('DB_USER', '{$dbUserEsc}');
define('DB_PASS', '{$dbPassEsc}');
define('SALON_API_KEY', '{$apiKeyEsc}');
define('SALON_INSTALL_KEY', '{$installKeyEsc}');
if (basename(\$_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

PHP;

        if (@file_put_contents($configPath, $php) === false) {
            $error = 'Kon config.php niet schrijven. Maak handmatig api/config.php aan via Hostinger Bestandsbeheer.';
        } else {
            @chmod($configPath, 0600);
            header('Location: install.php?key=' . urlencode($installKey));
            exit;
        }
    }
}

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Salon — database instellen</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #eef5f0; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; }
    .box { background: #fff; padding: 28px; border-radius: 14px; width: min(480px, 100%); box-shadow: 0 12px 40px rgba(0,0,0,.08); }
    h1 { margin: 0 0 8px; font-size: 22px; color: #2d5a3d; }
    p, li { color: #555; font-size: 14px; line-height: 1.5; }
    label { display: block; margin: 14px 0 6px; font-size: 13px; font-weight: 600; }
    input { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; }
    button { margin-top: 18px; width: 100%; padding: 13px; border: 0; border-radius: 8px; background: #5fa463; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; }
    .err { background: #fdecea; color: #c0392b; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; }
    .hint { font-size: 12px; color: #888; margin-top: 4px; }
    ol { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Stap 1 — Database koppelen</h1>
    <p>Hostinger heeft nog geen <code>config.php</code>. Vul hier je MySQL-gegevens in (uit hPanel).</p>
    <ol>
      <li>hPanel → <strong>Databases → MySQL</strong></li>
      <li>Maak database + gebruiker aan (of gebruik bestaande)</li>
      <li>Vul de gegevens hieronder in</li>
    </ol>
    <?php if ($error): ?><p class="err"><?= h($error) ?></p><?php endif; ?>
    <form method="post">
      <input type="hidden" name="key" value="<?= h($key) ?>" />
      <label>Database host</label>
      <input name="db_host" value="<?= h($_POST['db_host'] ?? 'localhost') ?>" required />
      <label>Database naam</label>
      <input name="db_name" placeholder="bijv. u123456789_salon" required />
      <label>Database gebruiker</label>
      <input name="db_user" placeholder="bijv. u123456789_salon" required />
      <label>Database wachtwoord</label>
      <input type="password" name="db_pass" autocomplete="new-password" />
      <label>API-sleutel (zelf bedenken, min. 12 tekens)</label>
      <input name="api_key" placeholder="lang willekeurig wachtwoord" minlength="12" required />
      <p class="hint">Noteer deze — optioneel voor geavanceerd gebruik; inloggen gaat via e-mail.</p>
      <label>Installatie-wachtwoord</label>
      <input name="install_key" value="<?= h($_POST['install_key'] ?? $defaultInstallKey) ?>" required />
      <button type="submit">Opslaan &amp; verder →</button>
    </form>
  </div>
</body>
</html>
