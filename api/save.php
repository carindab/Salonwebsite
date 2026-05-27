<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';

salon_cors();
salon_require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    salon_json_out(['ok' => false, 'error' => 'POST required'], 405);
}

set_time_limit(300);
ini_set('memory_limit', '512M');
salon_prepare_api_runtime();

try {
    $body = salon_read_body();
    $pdo = salon_pdo();
    $currentRevision = salon_get_revision($pdo);
    $clientRevision = isset($body['revision']) ? (int) $body['revision'] : null;

    if ($clientRevision !== null && $clientRevision > 0 && $clientRevision < $currentRevision) {
        salon_json_out([
            'ok' => false,
            'error' => 'conflict',
            'revision' => $currentRevision,
            'message' => 'Er is nieuwere data op de server. Herlaad eerst.',
        ], 409);
    }

    $meta = [];
    foreach (salon_meta_keys() as $key) {
        if (array_key_exists($key, $body)) {
            $meta[$key] = $body[$key];
        }
    }

    $clients = isset($body['clients']) && is_array($body['clients']) ? $body['clients'] : [];
    $appointments = isset($body['appointments']) && is_array($body['appointments']) ? $body['appointments'] : [];

    $pdo->beginTransaction();
    if ($meta) {
        salon_save_meta($pdo, $meta);
    }
    if (array_key_exists('clients', $body)) {
        salon_replace_clients($pdo, $clients);
    }
    if (array_key_exists('appointments', $body)) {
        salon_replace_appointments($pdo, $appointments);
    }
    $revision = salon_bump_revision($pdo);
    $pdo->commit();
    salon_refresh_load_cache($pdo);

    salon_json_out([
        'ok' => true,
        'revision' => $revision,
        'counts' => [
            'clients' => count($clients),
            'appointments' => count($appointments),
        ],
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
