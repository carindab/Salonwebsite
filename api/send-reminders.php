<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/reminder-lib.php';

salon_prepare_api_runtime();
salon_require_cron_key();

try {
    $pdo = salon_pdo();
    $dryRun = isset($_GET['dry']) && $_GET['dry'] === '1';
    $result = salon_process_reminders($pdo, $dryRun);
    salon_json_out([
        'ok' => true,
        'dryRun' => $dryRun,
        'sent' => $result['sent'],
        'skipped' => $result['skipped'],
        'candidates' => $result['candidates'],
        'errors' => $result['errors'],
        'at' => date('c'),
    ]);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
