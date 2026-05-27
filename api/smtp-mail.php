<?php

declare(strict_types=1);

/** Gmail SMTP — probeert eerst SSL :465 (Hostinger), daarna STARTTLS :587. */
function salon_smtp_send(string $to, string $subject, string $bodyPlain, ?string $bcc = null): array
{
    salon_load_mail_config();
    if (!defined('SALON_SMTP_USER') || !defined('SALON_SMTP_PASS') || SALON_SMTP_USER === '') {
        return ['ok' => false, 'error' => 'E-mail niet geconfigureerd'];
    }

    $host = defined('SALON_SMTP_HOST') ? SALON_SMTP_HOST : 'smtp.gmail.com';
    $user = SALON_SMTP_USER;
    $pass = SALON_SMTP_PASS;
    $from = defined('SALON_SMTP_FROM') && SALON_SMTP_FROM !== '' ? SALON_SMTP_FROM : $user;
    $fromName = defined('SALON_SMTP_FROM_NAME') ? SALON_SMTP_FROM_NAME : 'Elim Instituut';

    $to = trim($to);
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Ongeldig e-mailadres'];
    }

    $port = defined('SALON_SMTP_PORT') ? (int) SALON_SMTP_PORT : 465;
    $errors = [];

    if ($port === 587) {
        $r = salon_smtp_send_starttls($host, 587, $user, $pass, $from, $fromName, $to, $subject, $bodyPlain, $bcc);
        if ($r['ok']) {
            return $r;
        }
        $errors[] = '587: ' . ($r['error'] ?? '?');
        $r = salon_smtp_send_ssl($host, 465, $user, $pass, $from, $fromName, $to, $subject, $bodyPlain, $bcc);
        if ($r['ok']) {
            return $r;
        }
        $errors[] = '465: ' . ($r['error'] ?? '?');
    } else {
        $r = salon_smtp_send_ssl($host, 465, $user, $pass, $from, $fromName, $to, $subject, $bodyPlain, $bcc);
        if ($r['ok']) {
            return $r;
        }
        $errors[] = '465: ' . ($r['error'] ?? '?');
        $r = salon_smtp_send_starttls($host, 587, $user, $pass, $from, $fromName, $to, $subject, $bodyPlain, $bcc);
        if ($r['ok']) {
            return $r;
        }
        $errors[] = '587: ' . ($r['error'] ?? '?');
    }

    return ['ok' => false, 'error' => implode(' · ', $errors)];
}

function salon_smtp_ssl_context()
{
    return stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
            'SNI_enabled' => true,
            'peer_name' => 'smtp.gmail.com',
        ],
    ]);
}

function salon_smtp_tls_crypto_method(): int
{
    $methods = STREAM_CRYPTO_METHOD_TLS_CLIENT;
    if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
        $methods |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
    }
    if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
        $methods |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
    }
    return $methods;
}

function salon_smtp_send_ssl(
    string $host,
    int $port,
    string $user,
    string $pass,
    string $from,
    string $fromName,
    string $to,
    string $subject,
    string $bodyPlain,
    ?string $bcc
): array {
    $errno = 0;
    $errstr = '';
    $fp = @stream_socket_client(
        'ssl://' . $host . ':' . $port,
        $errno,
        $errstr,
        30,
        STREAM_CLIENT_CONNECT,
        salon_smtp_ssl_context()
    );
    if (!$fp) {
        return ['ok' => false, 'error' => 'SSL-verbinding mislukt: ' . ($errstr ?: (string) $errno)];
    }
    stream_set_timeout($fp, 30);

    try {
        salon_smtp_session($fp, $user, $pass, $from, $fromName, $to, $subject, $bodyPlain, $bcc, false);
    } catch (Throwable $e) {
        @fclose($fp);
        return ['ok' => false, 'error' => $e->getMessage()];
    }

    fclose($fp);
    return ['ok' => true];
}

function salon_smtp_send_starttls(
    string $host,
    int $port,
    string $user,
    string $pass,
    string $from,
    string $fromName,
    string $to,
    string $subject,
    string $bodyPlain,
    ?string $bcc
): array {
    $errno = 0;
    $errstr = '';
    $fp = @stream_socket_client(
        'tcp://' . $host . ':' . $port,
        $errno,
        $errstr,
        30,
        STREAM_CLIENT_CONNECT
    );
    if (!$fp) {
        return ['ok' => false, 'error' => 'TCP-verbinding mislukt: ' . ($errstr ?: (string) $errno)];
    }
    stream_set_timeout($fp, 30);

    try {
        salon_smtp_expect($fp, [220]);
        salon_smtp_cmd($fp, 'EHLO agenda.eliminstituut.nl', [250]);
        salon_smtp_cmd($fp, 'STARTTLS', [220]);
        if (!@stream_socket_enable_crypto($fp, true, salon_smtp_tls_crypto_method())) {
            throw new RuntimeException('STARTTLS encryptie mislukt');
        }
        salon_smtp_session($fp, $user, $pass, $from, $fromName, $to, $subject, $bodyPlain, $bcc, true);
    } catch (Throwable $e) {
        @fclose($fp);
        return ['ok' => false, 'error' => $e->getMessage()];
    }

    fclose($fp);
    return ['ok' => true];
}

function salon_smtp_session(
    $fp,
    string $user,
    string $pass,
    string $from,
    string $fromName,
    string $to,
    string $subject,
    string $bodyPlain,
    ?string $bcc,
    bool $ehloAfterTls
): void {
    if (!$ehloAfterTls) {
        salon_smtp_expect($fp, [220]);
    }
    salon_smtp_cmd($fp, 'EHLO agenda.eliminstituut.nl', [250]);
    salon_smtp_cmd($fp, 'AUTH LOGIN', [334]);
    salon_smtp_cmd($fp, base64_encode($user), [334]);
    salon_smtp_cmd($fp, base64_encode($pass), [235]);
    salon_smtp_cmd($fp, 'MAIL FROM:<' . $from . '>', [250]);
    salon_smtp_cmd($fp, 'RCPT TO:<' . $to . '>', [250, 251]);
    if ($bcc && filter_var($bcc, FILTER_VALIDATE_EMAIL)) {
        salon_smtp_cmd($fp, 'RCPT TO:<' . $bcc . '>', [250, 251]);
    }
    salon_smtp_cmd($fp, 'DATA', [354]);

    $encodedSubject = salon_mime_encode_header($subject);
    $encodedFrom = salon_mime_encode_header($fromName) . ' <' . $from . '>';
    $headers = [
        'From: ' . $encodedFrom,
        'To: ' . $to,
        'Subject: ' . $encodedSubject,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'Date: ' . date('r'),
    ];
    if ($bcc && filter_var($bcc, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Bcc: ' . $bcc;
    }
    $body = str_replace(["\r\n", "\r"], "\n", $bodyPlain);
    $body = str_replace("\n.", "\n..", $body);
    $message = implode("\r\n", $headers) . "\r\n\r\n" . $body;
    fwrite($fp, $message . "\r\n.\r\n");
    salon_smtp_expect($fp, [250]);
    salon_smtp_cmd($fp, 'QUIT', [221]);
}

function salon_smtp_cmd($fp, string $cmd, array $okCodes): void
{
    fwrite($fp, $cmd . "\r\n");
    salon_smtp_expect($fp, $okCodes);
}

function salon_smtp_expect($fp, array $okCodes): string
{
    $line = '';
    while ($str = fgets($fp, 8192)) {
        $line = $str;
        if (strlen($str) >= 4 && $str[3] === ' ') {
            break;
        }
    }
    if ($line === '') {
        throw new RuntimeException('SMTP: geen antwoord van server');
    }
    $code = (int) substr($line, 0, 3);
    if (!in_array($code, $okCodes, true)) {
        throw new RuntimeException('SMTP: ' . trim($line));
    }
    return $line;
}

function salon_mime_encode_header(string $text): string
{
    if (preg_match('/^[\x20-\x7E]*$/', $text)) {
        return $text;
    }
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

function salon_normalize_app_password(string $pass): string
{
    return str_replace(' ', '', trim($pass));
}
