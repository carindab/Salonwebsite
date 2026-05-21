<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
salon_cors();

try {
    $pdo = salon_pdo();
    $counts = salon_counts($pdo);
    salon_json_out([
        'ok' => true,
        'service' => 'salon-api',
        'database' => true,
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
