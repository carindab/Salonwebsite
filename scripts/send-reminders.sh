#!/bin/sh
# Hostinger cron — elk uur herinneringen (~24u van tevoren)
# Cron: 0 * * * * /bin/sh /home/u721044854/domains/agenda.eliminstituut.nl/public_html/scripts/send-reminders.sh
#
# Aanbevolen (betrouwbaarder): gebruik send-reminders-cli.php direct in Hostinger cron.

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="${BASE_DIR}/cron-logs/send-reminders.log"
CLI="${BASE_DIR}/scripts/send-reminders-cli.php"

mkdir -p "$(dirname "$LOG_FILE")"

if [ -f "$CLI" ]; then
  /usr/bin/php "$CLI" >> "$LOG_FILE" 2>&1
  exit $?
fi

# Fallback: oude curl-methode (key moet in mail-config staan)
CRON_KEY=""
MAIL_CFG=""
for f in "${BASE_DIR}/.salon-mail.php" "${BASE_DIR}/salon-mail.php" "${BASE_DIR}/api/mail-config.php"; do
  if [ -f "$f" ]; then MAIL_CFG="$f"; break; fi
done
if [ -n "$MAIL_CFG" ]; then
  CRON_KEY=$(grep "SALON_CRON_KEY" "$MAIL_CFG" | sed "s/.*'\\([^']*\\)'.*/\\1/" | head -1)
fi
if [ -z "$CRON_KEY" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] FOUT: geen cron-sleutel gevonden — koppel Gmail via setup-mail.php" >> "$LOG_FILE"
  exit 1
fi

API_URL="https://agenda.eliminstituut.nl/api/send-reminders.php?key=${CRON_KEY}"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cron gestart (curl)" >> "$LOG_FILE"
RESPONSE=$(curl -sS "$API_URL" 2>&1)
STATUS=$?
if [ $STATUS -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Succes: $RESPONSE" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fout ($STATUS): $RESPONSE" >> "$LOG_FILE"
fi
exit $STATUS
