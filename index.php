<?php
/**
 * PHP entrypoint — injecteert actuele versie (mobiel cache-proof).
 */
declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$versionFile = __DIR__ . '/VERSION';
$release = is_file($versionFile) ? trim((string) file_get_contents($versionFile)) : 'dev';
$release = preg_replace('/[^a-zA-Z0-9._-]/', '', $release) ?: 'dev';

$html = file_get_contents(__DIR__ . '/index.html');
if ($html === false) {
    http_response_code(500);
    exit('index.html niet gevonden');
}

echo str_replace('{{RELEASE}}', $release, $html);
