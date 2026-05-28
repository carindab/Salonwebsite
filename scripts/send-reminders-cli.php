#!/usr/bin/env php
<?php
/**
 * Hostinger cron — elk uur herinneringen (~24u van tevoren).
 * Gebruikt de cron-sleutel uit salon-mail.php (geen handmatige key nodig).
 *
 * Cron in Hostinger (elk uur):
 * 0 * * * * /usr/bin/php /home/u721044854/domains/agenda.eliminstituut.nl/public_html/scripts/send-reminders-cli.php >> /home/u721044854/domains/agenda.eliminstituut.nl/public_html/cron-logs/send-reminders.log 2>&1
 */
declare(strict_types=1);

$baseDir = dirname(__DIR__);
chdir($baseDir);

require_once $baseDir . '/api/bootstrap.php';
require_once $baseDir . '/api/reminder-lib.php';

function salon_cli_log(string $message): void
{
    global $baseDir;
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $message;
    echo $line . PHP_EOL;
    $logDir = $baseDir . '/cron-logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }
    @file_put_contents($logDir . '/send-reminders.log', $line . PHP_EOL, FILE_APPEND | LOCK_EX);
}

salon_prepare_api_runtime();
salon_load_mail_config();

if (!salon_mail_configured()) {
    salon_cli_log('FOUT: Gmail/SMTP niet gekoppeld — open setup-mail.php');
    exit(1);
}

try {
    $pdo = salon_pdo();
    $result = salon_process_reminders($pdo, false);
    salon_cron_log_run($pdo, 'auto', $result);
    salon_cli_log('Klaar: ' . json_encode($result, JSON_UNESCAPED_UNICODE));
    exit(0);
} catch (Throwable $e) {
    salon_cli_log('FOUT: ' . $e->getMessage());
    exit(1);
}
