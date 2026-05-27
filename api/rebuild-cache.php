<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';

salon_cors();
salon_require_auth();
salon_prepare_api_runtime();

try {
    $pdo = salon_pdo();
    salon_refresh_load_cache($pdo);
    salon_json_out([
        'ok' => true,
        'message' => 'Load-cache opgebouwd',
        'revision' => salon_get_revision($pdo),
        'counts' => salon_counts($pdo),
    ]);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
