<?php
/**
 * Alles-in-één setup voor Hostinger.
 * https://agenda.eliminstituut.nl/api/setup.php?key=tijdelijk-installatie-wachtwoord
 */
declare(strict_types=1);

$installKey = 'tijdelijk-installatie-wachtwoord';
$key = (string) ($_GET['key'] ?? $_POST['key'] ?? '');

if ($key === '' || !hash_equals($installKey, $key)) {
    http_response_code(403);
    exit('Unauthorized');
}

function setup_find_config(): ?string
{
    foreach ([__DIR__ . '/config.php', dirname(__DIR__) . '/salon-config.php'] as $file) {
        if (is_file($file)) {
            return $file;
        }
    }
    return null;
}

function setup_html(string $title, string $body): void
{
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . htmlspecialchars($title) . '</title>'
        . '<style>body{font-family:system-ui,sans-serif;background:#eef5f0;margin:0;min-height:100vh;display:grid;place-items:center;padding:16px}'
        . '.box{background:#fff;padding:28px;border-radius:14px;width:min(520px,100%);box-shadow:0 12px 40px rgba(0,0,0,.08)}'
        . 'h1{margin:0 0 12px;color:#2d5a3d;font-size:22px}p,li{color:#555;font-size:14px;line-height:1.55}'
        . 'label{display:block;margin:14px 0 6px;font-size:13px;font-weight:600}'
        . 'input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #ccc;border-radius:8px;font-size:16px}'
        . 'button,.btn{display:inline-block;margin-top:14px;padding:13px 20px;border:0;border-radius:8px;background:#5fa463;color:#fff;font-size:16px;font-weight:600;cursor:pointer;text-decoration:none}'
        . '.err{background:#fdecea;color:#c0392b;padding:10px 12px;border-radius:8px;margin-bottom:12px;font-size:14px}'
        . '.ok{background:#e8f5e9;color:#2e7d32;padding:10px 12px;border-radius:8px;margin-bottom:12px;font-size:14px}'
        . '.note{background:#fff8e6;border:1px solid #f0dfa0;padding:10px 12px;border-radius:8px;font-size:13px;margin-bottom:12px}</style></head><body>'
        . '<div class="box"><h1>' . htmlspecialchars($title) . '</h1>' . $body . '</div></body></html>';
    exit;
}

function setup_save_config(string $dbName, string $dbUser, string $dbPass, string $apiKey): bool
{
    $dbNameEsc = addslashes($dbName);
    $dbUserEsc = addslashes($dbUser);
    $dbPassEsc = addslashes($dbPass);
    $apiKeyEsc = addslashes($apiKey);

    $php = <<<PHP
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', '{$dbNameEsc}');
define('DB_USER', '{$dbUserEsc}');
define('DB_PASS', '{$dbPassEsc}');
define('SALON_API_KEY', '{$apiKeyEsc}');
define('SALON_INSTALL_KEY', 'tijdelijk-installatie-wachtwoord');
if (basename(\$_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

PHP;

    $paths = [
        __DIR__ . '/config.php',
        dirname(__DIR__) . '/salon-config.php',
    ];
    $ok = false;
    foreach ($paths as $path) {
        if (@file_put_contents($path, $php) !== false) {
            @chmod($path, 0600);
            $ok = true;
        }
    }
    return $ok;
}

function setup_test_pdo(string $dbName, string $dbUser, string $dbPass): ?string
{
    try {
        $pdo = new PDO(
            'mysql:host=localhost;dbname=' . $dbName . ';charset=utf8mb4',
            $dbUser,
            $dbPass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $pdo->query('SELECT 1');
        return null;
    } catch (PDOException $e) {
        return $e->getMessage();
    }
}

function setup_run_schema(PDO $pdo): void
{
    $schema = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('schema.sql niet gevonden');
    }
    foreach (array_filter(array_map('trim', explode(';', $schema))) as $statement) {
        if ($statement !== '') {
            $pdo->exec($statement);
        }
    }
}

// --- POST: database + auto import ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbName = trim((string) ($_POST['db_name'] ?? ''));
    $dbUser = trim((string) ($_POST['db_user'] ?? ''));
    $dbPass = (string) ($_POST['db_pass'] ?? '');
    if ($dbUser === '') {
        $dbUser = $dbName;
    }

    if ($dbName === '' || $dbPass === '') {
        setup_html('Setup', '<p class="err">Vul database-naam en wachtwoord in.</p>' . setup_form($key));
    }

    $err = setup_test_pdo($dbName, $dbUser, $dbPass);
    if ($err !== null) {
        $msg = str_contains($err, '1045')
            ? 'Wachtwoord of gebruikersnaam klopt niet.'
            : htmlspecialchars($err);
        setup_html('Setup', '<p class="err">' . $msg . '</p>' . setup_form($key, $dbName, $dbUser));
    }

    if (!setup_save_config($dbName, $dbUser, $dbPass, bin2hex(random_bytes(24)))) {
        setup_html('Setup', '<p class="err">Kon config niet opslaan. Controleer schrijfrechten op de server.</p>');
    }

    require_once __DIR__ . '/bootstrap.php';

    try {
        set_time_limit(300);
        ini_set('memory_limit', '512M');
        $pdo = salon_pdo();
        setup_run_schema($pdo);
        $counts = salon_counts($pdo);
        if ($counts['clients'] < 50) {
            $result = salon_import_seed($pdo);
            $counts = ['clients' => $result['clients'], 'appointments' => $result['appointments']];
        }
        require_once __DIR__ . '/session.php';
        $users = salon_users_count($pdo);

        $body = '<p class="ok"><strong>' . (int) $counts['clients'] . ' klanten</strong> · '
            . '<strong>' . (int) $counts['appointments'] . ' afspraken</strong> in database.</p>';

        if ($users === 0) {
            $body .= '<p>Maak nu je login aan (e-mail + wachtwoord):</p>'
                . '<a class="btn" href="setup-user.php?key=' . urlencode($key) . '">→ Login aanmaken</a>';
        } else {
            $body .= '<p>Alles klaar! Log in op de agenda:</p>'
                . '<a class="btn" href="/">→ Naar agenda</a>';
        }
        setup_html('Gelukt ✓', $body);
    } catch (Throwable $e) {
        setup_html('Fout', '<p class="err">' . htmlspecialchars($e->getMessage()) . '</p>');
    }
}

// --- GET: status ---
$configExists = setup_find_config() !== null;

if ($configExists) {
    require_once __DIR__ . '/bootstrap.php';
    try {
        set_time_limit(300);
        ini_set('memory_limit', '512M');
        $pdo = salon_pdo();
        setup_run_schema($pdo);
        $counts = salon_counts($pdo);
        if ($counts['clients'] < 50) {
            $result = salon_import_seed($pdo);
            $counts = ['clients' => $result['clients'], 'appointments' => $result['appointments']];
        }
        require_once __DIR__ . '/session.php';
        $users = salon_users_count($pdo);

        $body = '<p class="ok">Database gekoppeld.</p>'
            . '<p><strong>' . (int) $counts['clients'] . ' klanten</strong> · '
            . '<strong>' . (int) $counts['appointments'] . ' afspraken</strong>.</p>';

        if ($users === 0) {
            $body .= '<a class="btn" href="setup-user.php?key=' . urlencode($key) . '">→ Login aanmaken</a>';
        } else {
            $body .= '<a class="btn" href="/">→ Naar agenda</a>';
        }
        setup_html('Agenda status', $body);
    } catch (Throwable $e) {
        setup_html(
            'Database opnieuw koppelen',
            '<p class="err">Verbinding mislukt: ' . htmlspecialchars($e->getMessage()) . '</p>'
            . '<p class="note">Vul je MySQL-gegevens opnieuw in (bijv. na Git redeploy).</p>'
            . setup_form($key)
        );
    }
}

setup_html(
    'Agenda instellen',
    '<p class="note">Eén pagina: database koppelen + alle klanten laden.</p>'
    . '<p>Heb je al een database in Hostinger? Vul hieronder de gegevens in.</p>'
    . setup_form($key)
);

function setup_form(string $key, string $dbName = '', string $dbUser = ''): string
{
    return '<form method="post">'
        . '<input type="hidden" name="key" value="' . htmlspecialchars($key) . '" />'
        . '<label>Database naam (uit Hostinger)</label>'
        . '<input name="db_name" value="' . htmlspecialchars($dbName) . '" placeholder="u123456789_elim" required />'
        . '<label>MySQL-gebruiker (meestal hetzelfde)</label>'
        . '<input name="db_user" value="' . htmlspecialchars($dbUser) . '" placeholder="optioneel" />'
        . '<label>MySQL-wachtwoord</label>'
        . '<input type="password" name="db_pass" required />'
        . '<button type="submit">Koppelen &amp; klanten laden</button>'
        . '</form>';
}
