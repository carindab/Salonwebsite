<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';

salon_cors();

$action = $_GET['action'] ?? '';

try {
    if ($action === 'me') {
        salon_try_remember_login();
        $user = salon_current_user();
        if ($user) {
            salon_json_out(['ok' => true, 'user' => $user]);
        }
        try {
            if (salon_users_count(salon_pdo()) === 0) {
                salon_json_out(['ok' => false, 'loginRequired' => true, 'setupRequired' => true], 401);
            }
        } catch (Throwable $e) {
            /* tabel ontbreekt nog */
        }
        salon_json_out(['ok' => false, 'loginRequired' => true], 401);
    }

    if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = salon_read_body();
        $email = (string) ($body['email'] ?? '');
        $password = (string) ($body['password'] ?? '');
        $remember = !empty($body['remember']);
        $result = salon_login($email, $password, $remember);
        salon_json_out($result, $result['ok'] ? 200 : 401);
    }

    if ($action === 'logout') {
        salon_logout();
        salon_json_out(['ok' => true]);
    }

    if ($action === 'setup' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $key = (string) ($_GET['key'] ?? '');
        if (!defined('SALON_INSTALL_KEY') || $key === '' || !hash_equals(SALON_INSTALL_KEY, $key)) {
            salon_json_out(['ok' => false, 'error' => 'Unauthorized'], 401);
        }
        $pdo = salon_pdo();
        if (salon_users_count($pdo) > 0) {
            salon_json_out(['ok' => false, 'error' => 'Er bestaat al een gebruiker — setup is gesloten'], 403);
        }
        $body = salon_read_body();
        $result = salon_create_user(
            $pdo,
            (string) ($body['email'] ?? ''),
            (string) ($body['password'] ?? ''),
            (string) ($body['name'] ?? 'Carinda')
        );
        salon_json_out($result, $result['ok'] ? 200 : 400);
    }

    salon_json_out(['ok' => false, 'error' => 'Unknown action'], 400);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
