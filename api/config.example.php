<?php
/**
 * Kopieer dit bestand naar config.php en vul je Hostinger-gegevens in.
 * config.php staat in .gitignore — commit nooit je wachtwoorden.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_salon');
define('DB_USER', 'u123456789_salon');
define('DB_PASS', 'VUL_HIER_JE_DATABASE_WACHTWOORD_IN');

/** API-sleutel: lang willekeurig wachtwoord (zelfde invoeren in de app onder Instellingen → Data) */
define('SALON_API_KEY', 'wijzig-dit-naar-een-lang-willekeurig-wachtwoord');

/** Alleen voor install.php — verwijder of wijzig na eerste installatie */
define('SALON_INSTALL_KEY', 'tijdelijk-installatie-wachtwoord');

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}
