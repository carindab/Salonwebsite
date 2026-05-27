<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/mail-store.php';
require_once __DIR__ . '/smtp-mail.php';

salon_cors();
salon_require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    salon_json_out(['ok' => false, 'error' => 'POST vereist'], 405);
}

if (!salon_mail_configured()) {
    salon_json_out(['ok' => false, 'error' => 'Gmail nog niet gekoppeld — setup-mail.php'], 503);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload)) {
    salon_json_out(['ok' => false, 'error' => 'Ongeldige JSON'], 400);
}

$to = trim((string) ($payload['to'] ?? ''));
$subject = trim((string) ($payload['subject'] ?? ''));
$body = (string) ($payload['body'] ?? '');
$attachmentHtml = (string) ($payload['attachmentHtml'] ?? '');
$filename = trim((string) ($payload['filename'] ?? 'Factuur.html'));
$bcc = trim((string) ($payload['bcc'] ?? ''));

if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    salon_json_out(['ok' => false, 'error' => 'Ongeldig e-mailadres'], 400);
}
if ($subject === '') {
    salon_json_out(['ok' => false, 'error' => 'Onderwerp ontbreekt'], 400);
}
if ($attachmentHtml === '') {
    salon_json_out(['ok' => false, 'error' => 'Factuur ontbreekt'], 400);
}
if (!preg_match('/\.html$/i', $filename)) {
    $filename .= '.html';
}
$filename = preg_replace('/[^\w\-. ]+/u', '_', $filename) ?: 'Factuur.html';

$attachments = [[
    'content' => $attachmentHtml,
    'filename' => $filename,
    'mime' => 'text/html',
]];

$result = salon_smtp_send($to, $subject, $body, $bcc !== '' ? $bcc : null, $attachments);
if (!$result['ok']) {
    salon_json_out(['ok' => false, 'error' => $result['error'] ?? 'Verzenden mislukt'], 502);
}

salon_json_out(['ok' => true, 'to' => $to, 'filename' => $filename]);
