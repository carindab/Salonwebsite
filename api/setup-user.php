<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';

$key = (string) ($_GET['key'] ?? '');
if (!defined('SALON_INSTALL_KEY') || $key === '' || !hash_equals(SALON_INSTALL_KEY, $key)) {
    http_response_code(403);
    exit('Unauthorized');
}

$pdo = salon_pdo();
$schema = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
if ($schema !== false) {
    foreach (array_filter(array_map('trim', explode(';', $schema))) as $statement) {
        if ($statement !== '') {
            $pdo->exec($statement);
        }
    }
}

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $result = salon_create_user(
        $pdo,
        (string) ($_POST['email'] ?? ''),
        (string) ($_POST['password'] ?? ''),
        (string) ($_POST['name'] ?? '')
    );
    if ($result['ok']) {
        $message = 'Account aangemaakt voor ' . htmlspecialchars($result['user']['email']) . '. Je kunt nu inloggen op de agenda.';
    } else {
        $error = $result['error'];
    }
}

$userCount = salon_users_count($pdo);
?>
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Salon login aanmaken</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f4f7f4; margin: 0; min-height: 100vh; display: grid; place-items: center; }
    .box { background: #fff; padding: 28px; border-radius: 12px; width: min(420px, calc(100% - 32px)); box-shadow: 0 8px 30px rgba(0,0,0,.08); }
    h1 { margin: 0 0 8px; font-size: 22px; color: #2d5a3d; }
    p { color: #666; font-size: 14px; }
    label { display: block; margin: 14px 0 6px; font-size: 13px; font-weight: 600; }
    input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; }
    button { margin-top: 18px; width: 100%; padding: 12px; border: 0; border-radius: 8px; background: #5fa463; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; }
    .ok { background: #e8f5e9; color: #2e7d32; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
    .err { background: #fdecea; color: #c0392b; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Stap 2 — Jouw login</h1>
    <p class="steps-hint" style="color:#888;font-size:13px;margin:0 0 12px;">Alleen voor jou: e-mail + wachtwoord om in te loggen op telefoon en computer.</p>
    <?php if ($userCount > 0 && !$message): ?>
      <p class="ok">Er is al een account. Ga naar <a href="/">agenda.eliminstituut.nl</a> om in te loggen.</p>
    <?php else: ?>
      <p>Maak je persoonlijke e-mail + wachtwoord aan. Daarmee log je in op telefoon en computer.</p>
      <?php if ($message): ?><p class="ok"><?= $message ?></p><?php endif; ?>
      <?php if ($error): ?><p class="err"><?= htmlspecialchars($error) ?></p><?php endif; ?>
      <?php if (!$message): ?>
      <form method="post">
        <label>Naam</label>
        <input name="name" value="Carinda" required />
        <label>E-mail</label>
        <input type="email" name="email" required autocomplete="username" />
        <label>Wachtwoord (min. 8 tekens)</label>
        <input type="password" name="password" minlength="8" required autocomplete="new-password" />
        <button type="submit">Account aanmaken</button>
      </form>
      <?php endif; ?>
    <?php endif; ?>
  </div>
</body>
</html>
