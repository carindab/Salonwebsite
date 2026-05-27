<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';

salon_cors();
salon_require_auth();
salon_prepare_api_runtime();

try {
    $pdo = salon_pdo();
    $part = (string) ($_GET['part'] ?? 'meta');
    $offset = max(0, (int) ($_GET['offset'] ?? 0));
    $limit = min(1500, max(100, (int) ($_GET['limit'] ?? 600)));

    if ($part === 'meta') {
        salon_json_out([
            'ok' => true,
            'part' => 'meta',
            'revision' => salon_get_revision($pdo),
            'meta' => salon_load_meta($pdo),
            'counts' => salon_counts($pdo),
        ]);
    }

    if ($part === 'clients') {
        $items = salon_load_clients_chunk($pdo, $offset, $limit);
        salon_json_out([
            'ok' => true,
            'part' => 'clients',
            'offset' => $offset,
            'limit' => $limit,
            'items' => $items,
            'done' => count($items) < $limit,
        ]);
    }

    if ($part === 'appointments') {
        $items = salon_load_appointments_chunk($pdo, $offset, $limit);
        salon_json_out([
            'ok' => true,
            'part' => 'appointments',
            'offset' => $offset,
            'limit' => $limit,
            'items' => $items,
            'done' => count($items) < $limit,
        ]);
    }

    salon_json_out(['ok' => false, 'error' => 'Onbekend part'], 400);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
