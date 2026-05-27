<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/session.php';

salon_cors();
salon_require_auth();

$map = salon_order_totals_map();
salon_json_out([
    'ok' => true,
    'count' => count($map),
    'map' => $map,
]);
