<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
salon_cors();
salon_require_auth();

set_time_limit(300);
ini_set('memory_limit', '512M');

try {
    $seedPath = dirname(__DIR__) . '/salon-seed.json';
    if (!is_file($seedPath)) {
        salon_json_out(['ok' => false, 'error' => 'salon-seed.json niet gevonden in de website-root'], 404);
    }

    $raw = file_get_contents($seedPath);
    $seed = json_decode($raw ?: '', true);
    if (!is_array($seed) || !isset($seed['clients'], $seed['appointments'])) {
        salon_json_out(['ok' => false, 'error' => 'Ongeldig salon-seed.json'], 400);
    }

    $pdo = salon_pdo();
    $pdo->beginTransaction();
    salon_replace_clients($pdo, $seed['clients']);
    salon_replace_appointments($pdo, $seed['appointments']);
    $revision = salon_bump_revision($pdo);
    $pdo->commit();

    salon_json_out([
        'ok' => true,
        'message' => 'Seed geïmporteerd',
        'revision' => $revision,
        'counts' => [
            'clients' => count($seed['clients']),
            'appointments' => count($seed['appointments']),
        ],
        'seedVersion' => $seed['v'] ?? null,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
