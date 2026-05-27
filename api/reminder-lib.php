<?php

declare(strict_types=1);

require_once __DIR__ . '/mail-store.php';
require_once __DIR__ . '/smtp-mail.php';

function salon_reminder_log_ensure(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS salon_reminder_log (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          appointment_id VARCHAR(80) NOT NULL,
          client_id VARCHAR(80) DEFAULT NULL,
          reminder_type VARCHAR(32) NOT NULL DEFAULT \'24h\',
          sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          recipient VARCHAR(255) NOT NULL,
          UNIQUE KEY uq_appt_type (appointment_id, reminder_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function salon_reminder_already_sent(PDO $pdo, string $appointmentId, string $type): bool
{
    $stmt = $pdo->prepare(
        'SELECT 1 FROM salon_reminder_log WHERE appointment_id = ? AND reminder_type = ? LIMIT 1'
    );
    $stmt->execute([$appointmentId, $type]);
    return (bool) $stmt->fetchColumn();
}

function salon_reminder_log_sent(PDO $pdo, string $appointmentId, ?string $clientId, string $type, string $recipient): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO salon_reminder_log (appointment_id, client_id, reminder_type, recipient)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sent_at = CURRENT_TIMESTAMP, recipient = VALUES(recipient)'
    );
    $stmt->execute([$appointmentId, $clientId, $type, $recipient]);
}

function salon_load_clients_index(PDO $pdo): array
{
    $index = [];
    $stmt = $pdo->query('SELECT id, data FROM salon_clients');
    foreach ($stmt as $row) {
        $decoded = json_decode($row['data'], true);
        if (is_array($decoded)) {
            $index[$row['id']] = $decoded;
        }
    }
    return $index;
}

function salon_load_upcoming_appointments(PDO $pdo, string $fromDate, string $toDate): array
{
    $stmt = $pdo->prepare(
        'SELECT data FROM salon_appointments
         WHERE appt_date >= ? AND appt_date <= ?
         ORDER BY appt_date ASC, appt_time ASC'
    );
    $stmt->execute([$fromDate, $toDate]);
    $items = [];
    foreach ($stmt as $row) {
        $decoded = json_decode($row['data'], true);
        if (is_array($decoded)) {
            $items[] = salon_patch_single_order_total($decoded);
        }
    }
    return $items;
}

function salon_patch_single_order_total(array $a): array
{
    static $map = null;
    if ($map === null) {
        $map = salon_order_totals_map();
    }
    $key = salon_appointment_order_key($a);
    if ($key !== null && array_key_exists($key, $map)) {
        $a['orderTotal'] = (float) $map[$key];
    }
    return $a;
}

function salon_appointment_datetime(array $a): ?DateTimeImmutable
{
    $date = (string) ($a['date'] ?? '');
    $time = (string) ($a['time'] ?? '10:00');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return null;
    }
    if (!preg_match('/^\d{2}:\d{2}/', $time)) {
        $time = '10:00';
    }
    try {
        return new DateTimeImmutable($date . ' ' . substr($time, 0, 5), new DateTimeZone('Europe/Amsterdam'));
    } catch (Throwable $e) {
        return null;
    }
}

function salon_client_reminder_hours(array $settings, ?array $client): int
{
    $hours = $client['reminderHours'] ?? 'standaard';
    if ($hours === 'geen') {
        return 0;
    }
    if ($hours === 'standaard' || $hours === '') {
        $hours = (string) ($settings['defaultReminderHours'] ?? 24);
    }
    $n = (int) $hours;
    return $n > 0 ? $n : 24;
}

function salon_fill_tokens(string $text, array $settings, ?array $client, ?array $appointment): string
{
    $salon = (string) ($settings['salonName'] ?? 'Elim Instituut');
    $voornaam = (string) ($client['firstName'] ?? '');
    $achternaam = (string) ($client['lastName'] ?? '');
    $volledige = trim($voornaam . ' ' . $achternaam) ?: '?';
    $datum = '';
    $tijd = '';
    $behandeling = '';
    if ($appointment) {
        $parts = explode('-', (string) ($appointment['date'] ?? ''));
        if (count($parts) === 3) {
            $datum = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
        }
        $tijd = (string) ($appointment['time'] ?? '');
        $names = [];
        foreach ($appointment['items'] ?? [] as $it) {
            if (!is_array($it)) {
                continue;
            }
            $names[] = (string) ($it['savedName'] ?? $it['name'] ?? 'Behandeling');
        }
        $behandeling = implode(', ', $names);
    }
    $tokens = [
        'salon' => $salon,
        'salon_adres' => (string) ($settings['address'] ?? ''),
        'salon_postcode' => (string) ($settings['postal'] ?? ''),
        'salon_plaats' => (string) ($settings['city'] ?? ''),
        'salon_telefoon' => (string) ($settings['phone'] ?? ''),
        'salon_email' => (string) ($settings['email'] ?? ''),
        'website' => (string) ($settings['website'] ?? ''),
        'voornaam' => $voornaam,
        'achternaam' => $achternaam,
        'volledige_naam' => $volledige,
        'email' => (string) ($client['email'] ?? ''),
        'datum' => $datum,
        'tijd' => $tijd,
        'behandeling' => $behandeling,
    ];
    return preg_replace_callback('/\{([a-z_]+)\}/', static function ($m) use ($tokens) {
        $k = $m[1];
        return array_key_exists($k, $tokens) ? $tokens[$k] : $m[0];
    }, $text);
}

function salon_get_message_template(array $meta, string $key): ?array
{
    $templates = $meta['messageTemplates'] ?? [];
    if (!is_array($templates)) {
        return null;
    }
    foreach ($templates as $t) {
        if (is_array($t) && ($t['key'] ?? '') === $key) {
            return $t;
        }
    }
    return null;
}

function salon_default_reminder_template(): array
{
    return [
        'subject' => 'Herinnering aan uw afspraak bij {salon}',
        'body' => "Beste {voornaam},\n\nDit is een vriendelijke herinnering aan uw afspraak op {datum} om {tijd}: {behandeling}.\n\nWij zien u graag!\n\nMet vriendelijke groet,\n{salon}",
    ];
}

/**
 * @return array{sent:int, skipped:int, errors:array<int,string>, candidates:int}
 */
function salon_process_reminders(PDO $pdo, bool $dryRun = false): array
{
    salon_reminder_log_ensure($pdo);
    $meta = salon_load_meta($pdo);
    $settings = is_array($meta['settings'] ?? null) ? $meta['settings'] : [];
    if (($settings['remindersAutoEnabled'] ?? true) === false) {
        return ['sent' => 0, 'skipped' => 0, 'errors' => ['Automatische herinneringen staan uit in instellingen.'], 'candidates' => 0];
    }
    if (!salon_mail_configured()) {
        return ['sent' => 0, 'skipped' => 0, 'errors' => ['Gmail/SMTP nog niet gekoppeld — vul setup-mail in.'], 'candidates' => 0];
    }

    $tz = new DateTimeZone('Europe/Amsterdam');
    $now = new DateTimeImmutable('now', $tz);
    $from = $now->format('Y-m-d');
    $to = $now->modify('+4 days')->format('Y-m-d');

    $clients = salon_load_clients_index($pdo);
    $appointments = salon_load_upcoming_appointments($pdo, $from, $to);
    $tpl = salon_get_message_template($meta, 'appt_reminder') ?? salon_default_reminder_template();

    $sent = 0;
    $skipped = 0;
    $errors = [];
    $candidates = 0;

    foreach ($appointments as $a) {
        $status = (string) ($a['status'] ?? '');
        if ($status !== 'gepland') {
            continue;
        }
        $apptId = (string) ($a['id'] ?? '');
        if ($apptId === '') {
            continue;
        }
        $clientId = (string) ($a['clientId'] ?? '');
        $client = $clients[$clientId] ?? null;
        if (!$client) {
            $skipped++;
            continue;
        }
        $email = trim((string) ($client['email'] ?? ''));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $skipped++;
            continue;
        }

        $hoursBefore = salon_client_reminder_hours($settings, $client);
        if ($hoursBefore <= 0) {
            $skipped++;
            continue;
        }

        $apptDt = salon_appointment_datetime($a);
        if (!$apptDt) {
            $skipped++;
            continue;
        }

        $diffSec = $apptDt->getTimestamp() - $now->getTimestamp();
        $hoursUntil = $diffSec / 3600;
        $window = max(2, min(4, (int) round($hoursBefore * 0.12)));
        $minH = $hoursBefore - $window;
        $maxH = $hoursBefore + $window;
        if ($hoursUntil < $minH || $hoursUntil > $maxH) {
            continue;
        }

        $candidates++;
        $type = $hoursBefore . 'h';
        if (salon_reminder_already_sent($pdo, $apptId, $type)) {
            $skipped++;
            continue;
        }

        $subject = salon_fill_tokens((string) ($tpl['subject'] ?? ''), $settings, $client, $a);
        $body = salon_fill_tokens((string) ($tpl['body'] ?? ''), $settings, $client, $a);
        $bcc = !empty($settings['bccCopy']) && !empty($settings['email']) ? (string) $settings['email'] : null;

        if ($dryRun) {
            $sent++;
            continue;
        }

        $result = salon_smtp_send($email, $subject, $body, $bcc);
        if (!$result['ok']) {
            $errors[] = $apptId . ': ' . ($result['error'] ?? 'onbekend');
            continue;
        }
        salon_reminder_log_sent($pdo, $apptId, $clientId, $type, $email);
        $sent++;
    }

    return ['sent' => $sent, 'skipped' => $skipped, 'errors' => $errors, 'candidates' => $candidates];
}

function salon_require_cron_key(): void
{
    salon_load_mail_config();
    $expected = defined('SALON_CRON_KEY') ? SALON_CRON_KEY : '';
    if ($expected === '') {
        salon_json_out(['ok' => false, 'error' => 'CRON_KEY niet ingesteld — setup-mail.php'], 503);
    }
    $key = (string) ($_GET['key'] ?? $_SERVER['HTTP_X_CRON_KEY'] ?? '');
    if ($key === '' || !hash_equals($expected, $key)) {
        salon_json_out(['ok' => false, 'error' => 'Unauthorized'], 401);
    }
}
