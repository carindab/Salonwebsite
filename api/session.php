<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

const SALON_REMEMBER_COOKIE = 'salon_remember';
const SALON_REMEMBER_DAYS = 90;

function salon_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('salon_session');
    session_start();
}

function salon_is_api_key_valid(): bool
{
    if (!defined('SALON_API_KEY') || SALON_API_KEY === '' || SALON_API_KEY === 'wijzig-dit-naar-een-lang-willekeurig-wachtwoord') {
        return false;
    }
    $key = $_SERVER['HTTP_X_SALON_KEY'] ?? '';
    return $key !== '' && hash_equals(SALON_API_KEY, $key);
}

function salon_user_by_id(PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT id, email, name FROM salon_users WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function salon_user_by_email(PDO $pdo, string $email): ?array
{
    $stmt = $pdo->prepare('SELECT id, email, name, password_hash FROM salon_users WHERE email = ? LIMIT 1');
    $stmt->execute([strtolower(trim($email))]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function salon_set_logged_in_user(array $user): void
{
    salon_session_start();
    $_SESSION['salon_user_id'] = (int) $user['id'];
    $_SESSION['salon_user_email'] = (string) $user['email'];
}

function salon_current_user(): ?array
{
    salon_session_start();
    if (!empty($_SESSION['salon_user_id'])) {
        try {
            $user = salon_user_by_id(salon_pdo(), (int) $_SESSION['salon_user_id']);
            if ($user) {
                return $user;
            }
        } catch (Throwable $e) {
            return null;
        }
    }
    return null;
}

function salon_create_remember_token(PDO $pdo, int $userId): void
{
    $token = bin2hex(random_bytes(32));
    $hash = hash('sha256', $token);
    $expires = (new DateTimeImmutable('+' . SALON_REMEMBER_DAYS . ' days'))->format('Y-m-d H:i:s');
    $ua = substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 500);

    $stmt = $pdo->prepare(
        'INSERT INTO salon_remember_tokens (user_id, token_hash, expires_at, user_agent) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$userId, $hash, $expires, $ua]);

    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    setcookie(
        SALON_REMEMBER_COOKIE,
        $userId . ':' . $token,
        [
            'expires' => time() + (SALON_REMEMBER_DAYS * 86400),
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]
    );
}

function salon_clear_remember_cookie(): void
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    setcookie(SALON_REMEMBER_COOKIE, '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function salon_try_remember_login(): bool
{
    if (salon_current_user()) {
        return true;
    }
    $raw = $_COOKIE[SALON_REMEMBER_COOKIE] ?? '';
    if ($raw === '' || !str_contains($raw, ':')) {
        return false;
    }
    [$idPart, $token] = explode(':', $raw, 2);
    $userId = (int) $idPart;
    if ($userId < 1 || $token === '') {
        return false;
    }

    try {
        $pdo = salon_pdo();
        $hash = hash('sha256', $token);
        $stmt = $pdo->prepare(
            'SELECT user_id FROM salon_remember_tokens
             WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()
             LIMIT 1'
        );
        $stmt->execute([$userId, $hash]);
        $row = $stmt->fetch();
        if (!$row) {
            salon_clear_remember_cookie();
            return false;
        }
        $user = salon_user_by_id($pdo, $userId);
        if (!$user) {
            salon_clear_remember_cookie();
            return false;
        }
        salon_set_logged_in_user($user);
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function salon_login(string $email, string $password, bool $remember): array
{
    $pdo = salon_pdo();
    $user = salon_user_by_email($pdo, $email);
    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        return ['ok' => false, 'error' => 'Onjuist e-mailadres of wachtwoord'];
    }

    salon_set_logged_in_user($user);

    if ($remember) {
        salon_create_remember_token($pdo, (int) $user['id']);
    } else {
        salon_clear_remember_cookie();
    }

    unset($user['password_hash']);
    return ['ok' => true, 'user' => $user];
}

function salon_logout(): void
{
    salon_session_start();
    $userId = (int) ($_SESSION['salon_user_id'] ?? 0);

    if ($userId > 0) {
        try {
            $pdo = salon_pdo();
            $pdo->prepare('DELETE FROM salon_remember_tokens WHERE user_id = ?')->execute([$userId]);
        } catch (Throwable $e) {
            /* ignore */
        }
    }

    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    salon_clear_remember_cookie();
}

function salon_require_auth(): void
{
    salon_try_remember_login();
    if (salon_current_user()) {
        return;
    }
    if (salon_is_api_key_valid()) {
        return;
    }
    salon_json_out(['ok' => false, 'error' => 'Unauthorized', 'loginRequired' => true], 401);
}

function salon_users_count(PDO $pdo): int
{
    return (int) $pdo->query('SELECT COUNT(*) FROM salon_users')->fetchColumn();
}

function salon_create_user(PDO $pdo, string $email, string $password, string $name = ''): array
{
    $email = strtolower(trim($email));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Ongeldig e-mailadres'];
    }
    if (strlen($password) < 8) {
        return ['ok' => false, 'error' => 'Wachtwoord minimaal 8 tekens'];
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
        $stmt = $pdo->prepare('INSERT INTO salon_users (email, password_hash, name) VALUES (?, ?, ?)');
        $stmt->execute([$email, $hash, trim($name)]);
        $id = (int) $pdo->lastInsertId();
        return ['ok' => true, 'user' => ['id' => $id, 'email' => $email, 'name' => trim($name)]];
    } catch (PDOException $e) {
        if ((int) ($e->errorInfo[1] ?? 0) === 1062) {
            return ['ok' => false, 'error' => 'Dit e-mailadres bestaat al'];
        }
        throw $e;
    }
}
