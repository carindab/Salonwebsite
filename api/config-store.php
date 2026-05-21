<?php

declare(strict_types=1);

/**
 * Config-bestand buiten Git deploy (Hostinger: map boven public_html blijft staan).
 */
function salon_persistent_config_dir(): ?string
{
    $siteRoot = dirname(__DIR__);
    if (basename($siteRoot) !== 'public_html') {
        return null;
    }
    $domainDir = dirname($siteRoot);
    if (!is_dir($domainDir)) {
        return null;
    }
    if (is_writable($domainDir) || is_file($domainDir . '/.salon-config.php')) {
        return $domainDir;
    }
    return null;
}

/** Zoekvolgorde: persistent (boven public_html) → site-root → api/config.php */
function salon_config_paths(): array
{
    $paths = [];
    $persist = salon_persistent_config_dir();
    if ($persist !== null) {
        $paths[] = $persist . '/.salon-config.php';
    }
    $paths[] = dirname(__DIR__) . '/salon-config.php';
    $paths[] = __DIR__ . '/config.php';
    return array_values(array_unique($paths));
}

function salon_find_config_file(): ?string
{
    foreach (salon_config_paths() as $file) {
        if (is_file($file)) {
            return $file;
        }
    }
    return null;
}

function salon_write_config(string $php): bool
{
    foreach (salon_config_paths() as $path) {
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

function salon_read_existing_api_key(): string
{
    $file = salon_find_config_file();
    if ($file !== null) {
        require_once $file;
        if (defined('SALON_API_KEY') && SALON_API_KEY !== '' && SALON_API_KEY !== 'wijzig-dit-naar-een-lang-willekeurig-wachtwoord') {
            return SALON_API_KEY;
        }
    }
    return bin2hex(random_bytes(24));
}

function salon_setup_url(): string
{
    return '/api/setup.php?key=' . urlencode('tijdelijk-installatie-wachtwoord');
}

function salon_build_config_php(string $dbName, string $dbUser, string $dbPass, string $apiKey): string
{
    $dbNameEsc = addslashes($dbName);
    $dbUserEsc = addslashes($dbUser);
    $dbPassEsc = addslashes($dbPass);
    $apiKeyEsc = addslashes($apiKey);

    return <<<PHP
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', '{$dbNameEsc}');
define('DB_USER', '{$dbUserEsc}');
define('DB_PASS', '{$dbPassEsc}');
define('SALON_API_KEY', '{$apiKeyEsc}');
define('SALON_INSTALL_KEY', 'tijdelijk-installatie-wachtwoord');
if (basename(\$_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

PHP;
}
