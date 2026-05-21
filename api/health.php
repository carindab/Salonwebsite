<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';

salon_cors();

try {
    salon_try_remember_login();
    $pdo = salon_pdo();
    $loggedIn = salon_current_user() !== null;
    $counts = $loggedIn ? salon_counts($pdo) : ['clients' => 0, 'appointments' => 0];
    salon_json_out([
        'ok' => true,
        'service' => 'salon-api',
        'database' => true,
        'auth' => $loggedIn,
        'revision' => salon_get_revision($pdo),
        'counts' => $counts,
        'configured' => is_file(__DIR__ . '/config.php'),
    ]);
} catch (Throwable $e) {
    salon_json_out([
        'ok' => false,
        'service' => 'salon-api',
        'database' => false,
        'error' => $e->getMessage(),
    ], 503);
}
