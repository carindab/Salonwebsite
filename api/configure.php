<?php
/**
 * Eenmalige setup stap 1: koppelt Hostinger MySQL (2 velden).
 * Daarna: setup-user.php voor jouw e-mail + wachtwoord.
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbName = trim((string) ($_POST['db_name'] ?? ''));
    $dbPass = (string) ($_POST['db_pass'] ?? '');
    $dbHost = 'localhost';
    $dbUser = $dbName;
    $apiKey = bin2hex(random_bytes(24));
    $installKey = $defaultInstallKey;

    if ($dbName === '') {
        $error = 'Vul de database-naam in uit Hostinger.';
    } elseif ($dbPass === '') {
        $error = 'Vul het database-wachtwoord in.';
    } elseif (!preg_match('/^u\d+_/i', $dbName)) {
        $error = 'Database-naam lijkt niet op Hostinger (meestal begint met u123456789_…). Kopieer exact uit hPanel → Databases.';
    } else {
        $apiKeyEsc = addslashes($apiKey);
        $dbNameEsc = addslashes($dbName);
        $dbPassEsc = addslashes($dbPass);

        $php = <<<PHP
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', '{$dbNameEsc}');
define('DB_USER', '{$dbNameEsc}');
define('DB_PASS', '{$dbPassEsc}');
define('SALON_API_KEY', '{$apiKeyEsc}');
define('SALON_INSTALL_KEY', 'tijdelijk-installatie-wachtwoord');
if (basename(\$_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

PHP;

        if (@file_put_contents($configPath, $php) === false) {
            $error = 'Kon config.php niet schrijven. Probeer via Hostinger Bestandsbeheer.';
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
  <title>Salon — installatie</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #eef5f0; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; }
    .box { background: #fff; padding: 28px; border-radius: 14px; width: min(480px, 100%); box-shadow: 0 12px 40px rgba(0,0,0,.08); }
    h1 { margin: 0 0 8px; font-size: 22px; color: #2d5a3d; }
    .steps { display: flex; gap: 8px; margin-bottom: 16px; font-size: 13px; }
    .steps span { padding: 4px 10px; border-radius: 999px; background: #e8f2ea; color: #2d5a3d; }
    .steps span.now { background: #5fa463; color: #fff; font-weight: 600; }
    .steps span.later { opacity: .55; }
    p, li { color: #555; font-size: 14px; line-height: 1.5; }
    label { display: block; margin: 14px 0 6px; font-size: 13px; font-weight: 600; }
    input { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; }
    button { margin-top: 18px; width: 100%; padding: 13px; border: 0; border-radius: 8px; background: #5fa463; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; }
    .err { background: #fdecea; color: #c0392b; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; }
    .hint { font-size: 12px; color: #888; margin-top: 4px; }
    .note { background: #fff8e6; border: 1px solid #f0dfa0; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="steps">
      <span class="now">1. Database</span>
      <span class="later">2. Jouw login</span>
    </div>
    <h1>Technische koppeling (1×)</h1>
    <p class="note"><strong>Dit is nog niet jouw inlog.</strong> Hier koppel je Hostinger aan de agenda. Daarna vul je alleen <strong>naam + e-mail + wachtwoord</strong> in.</p>
    <p>In Hostinger hPanel → <strong>Databases → MySQL</strong> → kopieer:</p>
    <ol>
      <li><strong>Database naam</strong> (bijv. <code>u123456789_elim</code>)</li>
      <li><strong>Wachtwoord</strong> van die database</li>
    </ol>
    <p class="hint">Gebruik <em>niet</em> “Elim” of “Carinda” — het moet exact de naam uit Hostinger zijn.</p>
    <?php if ($error): ?><p class="err"><?= h($error) ?></p><?php endif; ?>
    <form method="post">
      <input type="hidden" name="key" value="<?= h($key) ?>" />
      <label>Database naam (uit Hostinger)</label>
      <input name="db_name" value="<?= h($_POST['db_name'] ?? '') ?>" placeholder="u123456789_elim" required autocapitalize="off" autocorrect="off" />
      <label>Database wachtwoord</label>
      <input type="password" name="db_pass" autocomplete="new-password" required />
      <button type="submit">Volgende stap →</button>
    </form>
  </div>
</body>
</html>
