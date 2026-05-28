<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/reminder-lib.php';

salon_cors();
salon_require_auth();

$force = isset($_GET['force']) && $_GET['force'] === '1';
$dryRun = isset($_GET['dry']) && $_GET['dry'] === '1';

try {
    $pdo = salon_pdo();
    $result = salon_process_reminders($pdo, $dryRun, ['force' => $force]);
    salon_cron_log_run($pdo, $force ? 'manual-force' : 'manual', $result);
    salon_json_out([
        'ok' => true,
        'dryRun' => $dryRun,
        'force' => $force,
        'sent' => $result['sent'],
        'skipped' => $result['skipped'],
        'candidates' => $result['candidates'],
        'errors' => $result['errors'],
        'at' => date('c'),
    ]);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
