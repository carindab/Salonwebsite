<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$versionFile = dirname(__DIR__) . '/VERSION';
$release = is_file($versionFile) ? trim((string) file_get_contents($versionFile)) : 'unknown';

echo json_encode([
    'ok' => true,
    'release' => $release,
    'sendInvoice' => is_file(__DIR__ . '/send-invoice.php'),
    'mailReminders' => is_file(__DIR__ . '/send-reminders.php'),
], JSON_UNESCAPED_UNICODE);
