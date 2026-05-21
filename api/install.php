<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
salon_cors();

$key = $_GET['key'] ?? '';
if (!defined('SALON_INSTALL_KEY') || $key === '' || !hash_equals(SALON_INSTALL_KEY, $key)) {
    salon_json_out(['ok' => false, 'error' => 'Unauthorized'], 401);
}

try {
    $pdo = salon_pdo();
    $schema = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('schema.sql niet gevonden');
    }

    foreach (array_filter(array_map('trim', explode(';', $schema))) as $statement) {
        if ($statement !== '') {
            $pdo->exec($statement);
        }
    }

    salon_json_out([
        'ok' => true,
        'message' => 'Database-tabellen aangemaakt. Bezoek seed-import.php om klanten in te laden.',
        'revision' => salon_get_revision($pdo),
    ]);
} catch (Throwable $e) {
    salon_json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
