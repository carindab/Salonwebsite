<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/phpmailer/Exception.php';
require_once __DIR__ . '/lib/phpmailer/SMTP.php';
require_once __DIR__ . '/lib/phpmailer/PHPMailer.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

/** @param array<int, array{content:string, filename:string, mime?:string}> $attachments */
function salon_smtp_send(string $to, string $subject, string $bodyPlain, ?string $bcc = null, array $attachments = []): array
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

    $errors = [];
    $attempts = [
        ['port' => 465, 'secure' => PHPMailer::ENCRYPTION_SMTPS, 'label' => '465 SSL'],
        ['port' => 587, 'secure' => PHPMailer::ENCRYPTION_STARTTLS, 'label' => '587 STARTTLS'],
    ];

    foreach ($attempts as $attempt) {
        $r = salon_smtp_send_phpmailer(
            $host,
            (int) $attempt['port'],
            (string) $attempt['secure'],
            $user,
            $pass,
            $from,
            $fromName,
            $to,
            $subject,
            $bodyPlain,
            $bcc,
            $attachments
        );
        if ($r['ok']) {
            return $r;
        }
        $errors[] = $attempt['label'] . ': ' . ($r['error'] ?? '?');
    }

    return ['ok' => false, 'error' => implode(' · ', $errors)];
}

function salon_smtp_ssl_options(): array
{
    return [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ],
    ];
}

function salon_smtp_send_phpmailer(
    string $host,
    int $port,
    string $secure,
    string $user,
    string $pass,
    string $from,
    string $fromName,
    string $to,
    string $subject,
    string $bodyPlain,
    ?string $bcc,
    array $attachments = []
): array {
    $mail = new PHPMailer(true);
    try {
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = $port;
        $mail->SMTPAuth = true;
        $mail->Username = $user;
        $mail->Password = $pass;
        $mail->SMTPSecure = $secure;
        $mail->Timeout = 30;
        $mail->SMTPOptions = salon_smtp_ssl_options();
        $mail->setFrom($from, $fromName);
        $mail->addAddress($to);
        if ($bcc && filter_var($bcc, FILTER_VALIDATE_EMAIL)) {
            $mail->addBCC($bcc);
        }
        foreach ($attachments as $att) {
            $content = (string) ($att['content'] ?? '');
            $filename = (string) ($att['filename'] ?? 'bijlage');
            if ($content === '') {
                continue;
            }
            $mime = (string) ($att['mime'] ?? 'application/octet-stream');
            $mail->addStringAttachment($content, $filename, PHPMailer::ENCODING_BASE64, $mime);
        }
        $mail->Subject = $subject;
        $mail->Body = $bodyPlain;
        $mail->isHTML(false);
        $mail->send();
        return ['ok' => true];
    } catch (MailException $e) {
        return ['ok' => false, 'error' => salon_smtp_short_error($mail->ErrorInfo ?: $e->getMessage())];
    } catch (Throwable $e) {
        return ['ok' => false, 'error' => salon_smtp_short_error($e->getMessage())];
    }
}

function salon_smtp_short_error(string $msg): string
{
    $msg = trim(preg_replace('/\s+/', ' ', $msg) ?? $msg);
    if (stripos($msg, 'Could not connect') !== false || stripos($msg, 'Failed to connect') !== false) {
        return 'Geen verbinding met Gmail (poort geblokkeerd?)';
    }
    if (stripos($msg, 'SMTP connect() failed') !== false) {
        return 'SMTP-verbinding mislukt';
    }
    if (stripos($msg, '535') !== false || stripos($msg, 'authentication') !== false || stripos($msg, 'Username and Password not accepted') !== false) {
        return 'Inloggen mislukt — controleer app-wachtwoord (16 tekens, nieuw aanmaken)';
    }
    if (strlen($msg) > 180) {
        return substr($msg, 0, 177) . '...';
    }
    return $msg;
}

function salon_normalize_app_password(string $pass): string
{
    return str_replace(' ', '', trim($pass));
}

/** Diagnose: test poorten en SMTP zonder mail te sturen. */
function salon_smtp_diagnose(?string $user = null, ?string $pass = null): array
{
    salon_load_mail_config();
    $host = 'smtp.gmail.com';
    $user = $user ?? (defined('SALON_SMTP_USER') ? SALON_SMTP_USER : '');
    $pass = $pass ?? (defined('SALON_SMTP_PASS') ? SALON_SMTP_PASS : '');
    $configuredPort = defined('SALON_SMTP_PORT') ? (int) SALON_SMTP_PORT : 0;

    $out = [
        'php' => PHP_VERSION,
        'openssl' => extension_loaded('openssl'),
        'configured_port' => $configuredPort,
        'user' => $user !== '' ? $user : '(leeg)',
        'pass_len' => strlen($pass),
        'ports' => [],
        'send_test' => null,
    ];

    foreach ([465, 587] as $port) {
        $errno = 0;
        $errstr = '';
        $target = $port === 465 ? 'ssl://' . $host . ':' . $port : 'tcp://' . $host . ':' . $port;
        $ctx = $port === 465 ? stream_context_create(['ssl' => salon_smtp_ssl_options()['ssl']]) : null;
        $fp = @stream_socket_client($target, $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $ctx);
        $out['ports'][$port] = $fp ? 'open' : ('blocked: ' . ($errstr ?: (string) $errno));
        if ($fp) {
            fclose($fp);
        }
    }

    if ($user !== '' && $pass !== '') {
        $out['send_test'] = salon_smtp_send_phpmailer(
            $host,
            465,
            PHPMailer::ENCRYPTION_SMTPS,
            $user,
            $pass,
            $user,
            'Elim Instituut',
            $user,
            'Diagnose — Elim Instituut',
            "SMTP-diagnose " . date('Y-m-d H:i') . "\nAls u dit leest werkt Gmail.",
            null
        );
        if (!$out['send_test']['ok']) {
            $out['send_test_587'] = salon_smtp_send_phpmailer(
                $host,
                587,
                PHPMailer::ENCRYPTION_STARTTLS,
                $user,
                $pass,
                $user,
                'Elim Instituut',
                $user,
                'Diagnose — Elim Instituut',
                "SMTP-diagnose 587 " . date('Y-m-d H:i'),
                null
            );
        }
    }

    return $out;
}
