<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
salon_cors();
salon_require_auth();

try {
    $pdo = salon_pdo();
    $meta = salon_load_meta($pdo);
    $clients = salon_load_clients($pdo);
    $appointments = salon_load_appointments($pdo);

    salon_json_out([
        'ok' => true,
        'revision' => salon_get_revision($pdo),
        'meta' => $meta,
        'clients' => $clients,
        'appointments' => $appointments,
        'counts' => [
            'clients' => count($clients),
            'appointments' => count($appointments),
        ],
    ]);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
