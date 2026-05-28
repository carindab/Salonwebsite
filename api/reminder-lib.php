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
    $hours = null;
    if (is_array($client)) {
        if (array_key_exists('reminderHours', $client) && $client['reminderHours'] !== '') {
            $hours = $client['reminderHours'];
        } elseif (isset($client['dossier']['reminderHours']) && $client['dossier']['reminderHours'] !== '') {
            $hours = $client['dossier']['reminderHours'];
        }
    }
    if ($hours === null || $hours === '' || $hours === 'standaard') {
        $hours = (string) ($settings['defaultReminderHours'] ?? 24);
    }
    if ($hours === 'geen') {
        $remType = strtolower(trim((string) ($client['dossier']['reminderType'] ?? 'standaard')));
        if ($remType !== 'geen') {
            $hours = (string) ($settings['defaultReminderHours'] ?? 24);
        } else {
            return 0;
        }
    }
    $n = (int) $hours;
    return $n > 0 ? $n : 24;
}

function salon_appointment_end_time(array $appointment, array $treatments): string
{
    $time = (string) ($appointment['time'] ?? '10:00');
    $parts = explode(':', $time);
    $h = (int) ($parts[0] ?? 10);
    $m = (int) ($parts[1] ?? 0);
    $totalMin = $h * 60 + $m;
    $added = 0;
    $index = [];
    foreach ($treatments as $t) {
        if (is_array($t) && !empty($t['id'])) {
            $index[(string) $t['id']] = $t;
        }
    }
    foreach ($appointment['items'] ?? [] as $it) {
        if (!is_array($it) || ($it['kind'] ?? '') !== 'treatment') {
            continue;
        }
        $refId = (string) ($it['refId'] ?? '');
        if ($refId !== '' && isset($index[$refId])) {
            $dur = (int) ($index[$refId]['duration'] ?? 0);
            $totalMin += $dur;
            $added += $dur;
        }
    }
    if ($added === 0) {
        $totalMin += 5;
    }
    $eH = intdiv($totalMin, 60) % 24;
    $eM = $totalMin % 60;
    return sprintf('%02d:%02d', $eH, $eM);
}

function salon_client_mail_greeting_name(?array $client): string
{
    if (!$client) {
        return '';
    }
    $voor = trim((string) ($client['dossier']['tussenvoegsel'] ?? ''));
    $parts = array_values(array_filter([
        trim((string) ($client['firstName'] ?? '')),
        $voor,
        trim((string) ($client['lastName'] ?? '')),
    ], static fn ($p) => $p !== ''));
    return implode(' ', $parts);
}

function salon_fill_tokens(string $text, array $settings, ?array $client, ?array $appointment, array $treatments = []): string
{
    $salon = (string) ($settings['salonName'] ?? 'Elim Instituut');
    $voornaam = (string) ($client['firstName'] ?? '');
    $voorvoegsel = trim((string) ($client['dossier']['tussenvoegsel'] ?? ''));
    $achternaam = (string) ($client['lastName'] ?? '');
    $volledige = salon_client_mail_greeting_name($client) ?: '?';
    $datum = '';
    $tijd = '';
    $tijdTot = '';
    $behandeling = '';
    if ($appointment) {
        $parts = explode('-', (string) ($appointment['date'] ?? ''));
        if (count($parts) === 3) {
            $datum = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
        }
        $tijd = (string) ($appointment['time'] ?? '');
        $tijdTot = salon_appointment_end_time($appointment, $treatments);
        $names = [];
        foreach ($appointment['items'] ?? [] as $it) {
            if (!is_array($it)) {
                continue;
            }
            $names[] = (string) ($it['savedName'] ?? $it['name'] ?? 'Behandeling');
        }
        $behandeling = implode(', ', $names);
    }
    $website = (string) ($settings['website'] ?? '');
    $websiteKort = preg_replace('#^https?://#i', '', $website);
    $websiteKort = rtrim((string) $websiteKort, '/');
    $tokens = [
        'salon' => $salon,
        'company_name' => $salon,
        'salon_adres' => (string) ($settings['address'] ?? ''),
        'salon_postcode' => (string) ($settings['postal'] ?? ''),
        'salon_plaats' => (string) ($settings['city'] ?? ''),
        'salon_telefoon' => (string) ($settings['phone'] ?? ''),
        'salon_mobiel' => (string) ($settings['salonMobile'] ?? ''),
        'salon_contact_naam' => (string) ($settings['contactName'] ?? 'Carinda Brand'),
        'salon_email' => (string) ($settings['email'] ?? ''),
        'website' => $website,
        'website_kort' => $websiteKort,
        'voornaam' => $voornaam,
        'voorvoegsel' => $voorvoegsel,
        'achternaam' => $achternaam,
        'klant_aanhef' => $volledige,
        'volledige_naam' => $volledige,
        'email' => (string) ($client['email'] ?? ''),
        'datum' => $datum,
        'tijd' => $tijd,
        'vantijd' => $tijd,
        'tijd_tot' => $tijdTot,
        'tottijd' => $tijdTot,
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

function salon_get_reminder_template(array $meta): ?array
{
    $tpl = salon_get_message_template($meta, 'appt_reminder');
    if ($tpl === null) {
        return salon_default_reminder_template();
    }
    $body = (string) ($tpl['body'] ?? '');
    $oldMarkers = ['Dit is een vriendelijke herinnering', 'Wij zien u graag!', 'Met vriendelijke groet,\n{salon}'];
    foreach ($oldMarkers as $marker) {
        if (str_contains($body, $marker)) {
            return salon_default_reminder_template();
        }
    }
    return $tpl;
}

function salon_default_reminder_template(): array
{
    return [
        'subject' => 'Herinnering aan uw afspraak bij {salon}',
        'body' => "Beste {klant_aanhef},\n\nVia deze e-mail willen wij u attenderen op de volgende afspraak:\n\nDatum:\t{datum}\nVan:\t{vantijd}\nTot:\t{tottijd}\n\n\nVriendelijke groet,\n\n{salon_contact_naam}\n{salon}\n{salon_adres}\n{salon_postcode} {salon_plaats}\nTel: {salon_telefoon}\nMobiel: {salon_mobiel}\n{website_kort}",
    ];
}

function salon_cron_log_ensure(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS salon_cron_log (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          run_type VARCHAR(32) NOT NULL DEFAULT \'auto\',
          sent INT NOT NULL DEFAULT 0,
          skipped INT NOT NULL DEFAULT 0,
          candidates INT NOT NULL DEFAULT 0,
          errors_json TEXT,
          ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function salon_cron_log_run(PDO $pdo, string $runType, array $result): void
{
    salon_cron_log_ensure($pdo);
    $stmt = $pdo->prepare(
        'INSERT INTO salon_cron_log (run_type, sent, skipped, candidates, errors_json)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $runType,
        (int) ($result['sent'] ?? 0),
        (int) ($result['skipped'] ?? 0),
        (int) ($result['candidates'] ?? 0),
        json_encode($result['errors'] ?? [], JSON_UNESCAPED_UNICODE),
    ]);
}

function salon_cron_log_recent(PDO $pdo, int $limit = 5): array
{
    salon_cron_log_ensure($pdo);
    $stmt = $pdo->prepare(
        'SELECT run_type, sent, skipped, candidates, errors_json, ran_at
         FROM salon_cron_log ORDER BY id DESC LIMIT ?'
    );
    $stmt->bindValue(1, max(1, $limit), PDO::PARAM_INT);
    $stmt->execute();
    $rows = [];
    foreach ($stmt as $row) {
        $rows[] = [
            'runType' => (string) $row['run_type'],
            'sent' => (int) $row['sent'],
            'skipped' => (int) $row['skipped'],
            'candidates' => (int) $row['candidates'],
            'errors' => json_decode((string) ($row['errors_json'] ?? '[]'), true) ?: [],
            'ranAt' => (string) $row['ran_at'],
        ];
    }
    return $rows;
}

function salon_reminder_log_recent(PDO $pdo, int $limit = 10): array
{
    salon_reminder_log_ensure($pdo);
    $stmt = $pdo->prepare(
        'SELECT appointment_id, client_id, reminder_type, recipient, sent_at
         FROM salon_reminder_log ORDER BY id DESC LIMIT ?'
    );
    $stmt->bindValue(1, max(1, $limit), PDO::PARAM_INT);
    $stmt->execute();
    $rows = [];
    foreach ($stmt as $row) {
        $rows[] = [
            'appointmentId' => (string) $row['appointment_id'],
            'clientId' => (string) ($row['client_id'] ?? ''),
            'type' => (string) $row['reminder_type'],
            'recipient' => (string) $row['recipient'],
            'sentAt' => (string) $row['sent_at'],
        ];
    }
    return $rows;
}

function salon_reminders_auto_enabled(PDO $pdo): bool
{
    $meta = salon_load_meta($pdo);
    $settings = is_array($meta['settings'] ?? null) ? $meta['settings'] : [];
    return ($settings['remindersAutoEnabled'] ?? true) !== false;
}

function salon_reminder_skip_reason(array $settings, ?array $client, array $a, DateTimeImmutable $now, bool $force): ?string
{
    $status = (string) ($a['status'] ?? '');
    if ($status !== 'gepland') {
        return 'status niet gepland';
    }
    if (!$client) {
        return 'geen klant';
    }
    $email = trim((string) ($client['email'] ?? ''));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return 'geen geldig e-mailadres';
    }
    $hoursBefore = salon_client_reminder_hours($settings, $client);
    if ($hoursBefore <= 0) {
        return 'herinnering uit bij klant';
    }
    $apptDt = salon_appointment_datetime($a);
    if (!$apptDt) {
        return 'ongeldige datum/tijd';
    }
    $hoursUntil = ($apptDt->getTimestamp() - $now->getTimestamp()) / 3600;
    if ($hoursUntil <= 0) {
        return 'afspraak al geweest';
    }
    if (!$force) {
        $window = max(2, min(4, (int) round($hoursBefore * 0.12)));
        $minH = $hoursBefore - $window;
        $maxH = $hoursBefore + $window;
        if ($hoursUntil < $minH || $hoursUntil > $maxH) {
            return sprintf('nog niet in venster (~%dh van tevoren, nu %.1fh)', $hoursBefore, $hoursUntil);
        }
    } elseif ($hoursUntil > 96) {
        return 'meer dan 96 uur vooruit';
    }
    return null;
}

function salon_preview_reminders(PDO $pdo): array
{
    salon_reminder_log_ensure($pdo);
    $meta = salon_load_meta($pdo);
    $settings = is_array($meta['settings'] ?? null) ? $meta['settings'] : [];
    $tz = new DateTimeZone('Europe/Amsterdam');
    $now = new DateTimeImmutable('now', $tz);
    $from = $now->format('Y-m-d');
    $to = $now->modify('+4 days')->format('Y-m-d');
    $clients = salon_load_clients_index($pdo);
    $appointments = salon_load_upcoming_appointments($pdo, $from, $to);
    $items = [];
    foreach ($appointments as $a) {
        $clientId = (string) ($a['clientId'] ?? '');
        $client = $clients[$clientId] ?? null;
        $apptId = (string) ($a['id'] ?? '');
        $hoursBefore = salon_client_reminder_hours($settings, $client);
        $type = $hoursBefore . 'h';
        $already = $apptId !== '' && salon_reminder_already_sent($pdo, $apptId, $type);
        $reason = salon_reminder_skip_reason($settings, $client, $a, $now, false);
        $forceReason = salon_reminder_skip_reason($settings, $client, $a, $now, true);
        $name = salon_client_mail_greeting_name($client) ?: '(geen klant)';
        $items[] = [
            'appointmentId' => $apptId,
            'date' => (string) ($a['date'] ?? ''),
            'time' => (string) ($a['time'] ?? ''),
            'clientName' => $name,
            'email' => trim((string) ($client['email'] ?? '')),
            'readyNow' => $reason === null && !$already,
            'readyForce' => $forceReason === null && !$already,
            'alreadySent' => $already,
            'reason' => $already ? 'al verstuurd' : ($reason ?? 'klaar voor verzending'),
        ];
    }
    return $items;
}

/**
 * @param array{force?:bool} $options
 * @return array{sent:int, skipped:int, errors:array<int,string>, candidates:int}
 */
function salon_process_reminders(PDO $pdo, bool $dryRun = false, array $options = []): array
{
    $force = !empty($options['force']);
    salon_reminder_log_ensure($pdo);
    $meta = salon_load_meta($pdo);
    $settings = is_array($meta['settings'] ?? null) ? $meta['settings'] : [];
    if (($settings['remindersAutoEnabled'] ?? true) === false && !$force) {
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
    $tpl = salon_get_reminder_template($meta);
    $treatments = is_array($meta['treatments'] ?? null) ? $meta['treatments'] : [];

    $sent = 0;
    $skipped = 0;
    $errors = [];
    $candidates = 0;

    foreach ($appointments as $a) {
        $apptId = (string) ($a['id'] ?? '');
        if ($apptId === '') {
            continue;
        }
        $clientId = (string) ($a['clientId'] ?? '');
        $client = $clients[$clientId] ?? null;

        $skipReason = salon_reminder_skip_reason($settings, $client, $a, $now, $force);
        if ($skipReason !== null) {
            $skipped++;
            continue;
        }

        $hoursBefore = salon_client_reminder_hours($settings, $client);
        $candidates++;
        $type = $hoursBefore . 'h';
        if (salon_reminder_already_sent($pdo, $apptId, $type)) {
            $skipped++;
            continue;
        }

        $email = trim((string) ($client['email'] ?? ''));
        $subject = salon_fill_tokens((string) ($tpl['subject'] ?? ''), $settings, $client, $a, $treatments);
        $body = salon_fill_tokens((string) ($tpl['body'] ?? ''), $settings, $client, $a, $treatments);
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
