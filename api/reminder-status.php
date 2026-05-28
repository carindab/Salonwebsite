<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/reminder-lib.php';

salon_cors();
salon_require_auth();

try {
    $pdo = salon_pdo();
    salon_reminder_log_ensure($pdo);
    salon_cron_log_ensure($pdo);

    $preview = salon_preview_reminders($pdo);
    $lastRuns = salon_cron_log_recent($pdo, 5);
    $lastSent = salon_reminder_log_recent($pdo, 10);

    salon_load_mail_config();

    salon_json_out([
        'ok' => true,
        'mailConfigured' => salon_mail_configured(),
        'remindersAutoEnabled' => salon_reminders_auto_enabled($pdo),
        'lastCronRuns' => $lastRuns,
        'lastSentReminders' => $lastSent,
        'preview' => $preview,
        'cronCliHint' => '0 * * * * /usr/bin/php ' . dirname(__DIR__) . '/scripts/send-reminders-cli.php',
        'at' => date('c'),
    ]);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
