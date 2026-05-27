<?php

declare(strict_types=1);

/** Eenvoudige SMTP-client (Gmail STARTTLS). */
function salon_smtp_send(string $to, string $subject, string $bodyPlain, ?string $bcc = null): array
{
    salon_load_mail_config();
    if (!defined('SALON_SMTP_USER') || !defined('SALON_SMTP_PASS') || SALON_SMTP_USER === '') {
        return ['ok' => false, 'error' => 'E-mail niet geconfigureerd'];
    }

    $host = defined('SALON_SMTP_HOST') ? SALON_SMTP_HOST : 'smtp.gmail.com';
    $port = defined('SALON_SMTP_PORT') ? (int) SALON_SMTP_PORT : 587;
    $user = SALON_SMTP_USER;
    $pass = SALON_SMTP_PASS;
    $from = defined('SALON_SMTP_FROM') && SALON_SMTP_FROM !== '' ? SALON_SMTP_FROM : $user;
    $fromName = defined('SALON_SMTP_FROM_NAME') ? SALON_SMTP_FROM_NAME : 'Elim Instituut';

    $to = trim($to);
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Ongeldig e-mailadres'];
    }

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
        return ['ok' => false, 'error' => 'SMTP verbinding mislukt: ' . $errstr];
    }
    stream_set_timeout($fp, 30);

    try {
        salon_smtp_expect($fp, [220]);
        salon_smtp_cmd($fp, 'EHLO eliminstituut.nl', [250]);
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('STARTTLS mislukt');
        }
        salon_smtp_cmd($fp, 'EHLO eliminstituut.nl', [250]);
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
        $message = implode("\r\n", $headers) . "\r\n\r\n" . str_replace(["\r\n", "\r"], "\n", $bodyPlain);
        $message = str_replace("\n.", "\n..", $message);
        fwrite($fp, $message . "\r\n.\r\n");
        salon_smtp_expect($fp, [250]);
        salon_smtp_cmd($fp, 'QUIT', [221]);
    } catch (Throwable $e) {
        @fclose($fp);
        return ['ok' => false, 'error' => $e->getMessage()];
    }

    fclose($fp);
    return ['ok' => true];
}

function salon_smtp_cmd($fp, string $cmd, array $okCodes): void
{
    fwrite($fp, $cmd . "\r\n");
    salon_smtp_expect($fp, $okCodes);
}

function salon_smtp_expect($fp, array $okCodes): string
{
    $line = '';
    while ($str = fgets($fp, 515)) {
        $line = $str;
        if (isset($str[3]) && $str[3] === ' ') {
            break;
        }
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
