<?php

declare(strict_types=1);

require_once __DIR__ . '/config-store.php';

function salon_mail_config_paths(): array
{
    $paths = [];
    $persist = salon_persistent_config_dir();
    if ($persist !== null) {
        $paths[] = $persist . '/.salon-mail.php';
    }
    $paths[] = dirname(__DIR__) . '/salon-mail.php';
    $paths[] = __DIR__ . '/mail-config.php';
    return array_values(array_unique($paths));
}

function salon_find_mail_config_file(): ?string
{
    foreach (salon_mail_config_paths() as $file) {
        if (is_file($file)) {
            return $file;
        }
    }
    return null;
}

function salon_build_mail_config_php(
    string $smtpUser,
    string $smtpPass,
    string $fromEmail,
    string $fromName,
    string $cronKey
): string {
    $host = 'smtp.gmail.com';
    $port = 465;
    $userEsc = addslashes($smtpUser);
    $passEsc = addslashes($smtpPass);
    $fromEsc = addslashes($fromEmail);
    $nameEsc = addslashes($fromName);
    $cronEsc = addslashes($cronKey);

    return <<<PHP
<?php
define('SALON_SMTP_HOST', '{$host}');
define('SALON_SMTP_PORT', {$port});
define('SALON_SMTP_USER', '{$userEsc}');
define('SALON_SMTP_PASS', '{$passEsc}');
define('SALON_SMTP_FROM', '{$fromEsc}');
define('SALON_SMTP_FROM_NAME', '{$nameEsc}');
define('SALON_CRON_KEY', '{$cronEsc}');
if (basename(\$_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

PHP;
}

function salon_write_mail_config(string $php): bool
{
    foreach (salon_mail_config_paths() as $path) {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            continue;
        }
        if (!is_writable($dir) && !is_file($path)) {
            continue;
        }
        if (@file_put_contents($path, $php) === false) {
            continue;
        }
        @chmod($path, 0600);
        return true;
    }
    return false;
}

function salon_read_cron_key(): string
{
    $file = salon_find_mail_config_file();
    if ($file !== null) {
        require_once $file;
        if (defined('SALON_CRON_KEY') && SALON_CRON_KEY !== '') {
            return SALON_CRON_KEY;
        }
    }
    return bin2hex(random_bytes(16));
}

function salon_mail_configured(): bool
{
    $file = salon_find_mail_config_file();
    if ($file === null) {
        return false;
    }
    require_once $file;
    return defined('SALON_SMTP_USER')
        && defined('SALON_SMTP_PASS')
        && SALON_SMTP_USER !== ''
        && SALON_SMTP_PASS !== '';
}

function salon_load_mail_config(): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $file = salon_find_mail_config_file();
    if ($file !== null) {
        require_once $file;
    }
    $loaded = true;
}
