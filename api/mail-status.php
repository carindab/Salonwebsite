<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/mail-store.php';

salon_cors();
salon_require_auth();

salon_load_mail_config();

salon_json_out([
    'ok' => true,
    'configured' => salon_mail_configured(),
    'from' => defined('SALON_SMTP_FROM') ? SALON_SMTP_FROM : (defined('SALON_SMTP_USER') ? SALON_SMTP_USER : null),
]);
