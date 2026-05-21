<?php
/**
 * Setup stap 1: Hostinger MySQL koppelen.
 * Opnieuw instellen: ?key=...&fix=1
 */
declare(strict_types=1);

require_once __DIR__ . '/config-store.php';

$defaultInstallKey = 'tijdelijk-installatie-wachtwoord';
$key = (string) ($_GET['key'] ?? $_POST['key'] ?? '');
$fix = isset($_GET['fix']) || isset($_POST['fix']);
$configPath = salon_find_config_file();

if ($key === '' || !hash_equals($defaultInstallKey, $key)) {
    http_response_code(403);
    exit('Unauthorized — gebruik: /api/configure.php?key=tijdelijk-installatie-wachtwoord');
}

if ($configPath !== null && !$fix) {
    header('Location: setup-user.php?key=' . urlencode($key));
    exit;
}

$error = '';
$prefill = ['db_name' => '', 'db_user' => ''];

if ($configPath !== null) {
    require_once $configPath;
    $prefill['db_name'] = defined('DB_NAME') ? DB_NAME : '';
    $prefill['db_user'] = defined('DB_USER') ? DB_USER : '';
}

function configure_test_pdo(string $host, string $name, string $user, string $pass): ?string
{
    try {
        $pdo = new PDO(
            'mysql:host=' . $host . ';dbname=' . $name . ';charset=utf8mb4',
            $user,
            $pass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $pdo->query('SELECT 1');
        return null;
    } catch (PDOException $e) {
        return $e->getMessage();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbName = trim((string) ($_POST['db_name'] ?? ''));
    $dbUser = trim((string) ($_POST['db_user'] ?? ''));
    $dbPass = (string) ($_POST['db_pass'] ?? '');
    $dbHost = 'localhost';

    if ($dbUser === '') {
        $dbUser = $dbName;
    }

    if ($dbName === '') {
        $error = 'Vul de database-naam in uit Hostinger.';
    } elseif ($dbPass === '') {
        $error = 'Vul het database-wachtwoord in.';
    } else {
        $connErr = configure_test_pdo($dbHost, $dbName, $dbUser, $dbPass);
        if ($connErr !== null) {
            $error = 'Kan niet verbinden met MySQL. Controleer gebruiker, wachtwoord en of de gebruiker aan de database is gekoppeld in Hostinger.';
            if (str_contains($connErr, '1045')) {
                $error = 'Wachtwoord of gebruikersnaam klopt niet. In Hostinger: Databases → MySQL → controleer MySQL-gebruiker en wachtwoord (of reset wachtwoord).';
            }
        } else {
            $apiKey = salon_read_existing_api_key();
            $php = salon_build_config_php($dbName, $dbUser, $dbPass, $apiKey);

            if (!salon_write_config($php)) {
                $error = 'Kon config niet schrijven.';
            } else {
                header('Location: setup.php?key=' . urlencode($defaultInstallKey));
                exit;
            }
        }
    }
    $prefill['db_name'] = $dbName;
    $prefill['db_user'] = $dbUser;
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
  <title>Salon — database</title>
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
    <h1><?= $fix ? 'Database opnieuw instellen' : 'Technische koppeling (1×)' ?></h1>
    <?php if ($fix): ?>
      <p class="note">De vorige gegevens werkten niet (verkeerd wachtwoord of gebruiker). Vul opnieuw in uit Hostinger hPanel.</p>
    <?php else: ?>
      <p class="note"><strong>Dit is nog niet jouw inlog.</strong> Daarna alleen <strong>naam + e-mail + wachtwoord</strong>.</p>
    <?php endif; ?>
    <p>In Hostinger hPanel → <strong>Databases → MySQL</strong>:</p>
    <ol>
      <li>Tab <strong>MySQL-databases</strong> → kopieer <strong>database naam</strong></li>
      <li>Tab <strong>MySQL-gebruikers</strong> → kopieer <strong>gebruikersnaam</strong></li>
      <li>Gebruik het <strong>wachtwoord</strong> dat je bij aanmaken koos (of reset het in Hostinger)</li>
    </ol>
    <?php if ($error): ?><p class="err"><?= h($error) ?></p><?php endif; ?>
    <form method="post">
      <input type="hidden" name="key" value="<?= h($key) ?>" />
      <?php if ($fix): ?><input type="hidden" name="fix" value="1" /><?php endif; ?>
      <label>Database naam</label>
      <input name="db_name" value="<?= h($_POST['db_name'] ?? $prefill['db_name']) ?>" placeholder="u123456789_elim" required autocapitalize="off" />
      <label>MySQL-gebruiker</label>
      <input name="db_user" value="<?= h($_POST['db_user'] ?? $prefill['db_user']) ?>" placeholder="meestal hetzelfde als database naam" autocapitalize="off" />
      <p class="hint">Laat leeg als gebruiker = database naam (vaak zo bij Hostinger)</p>
      <label>MySQL-wachtwoord</label>
      <input type="password" name="db_pass" autocomplete="new-password" required />
      <button type="submit">Test verbinding &amp; verder →</button>
    </form>
  </div>
</body>
</html>
