#!/bin/sh
# Hostinger cron — elk uur herinneringen (~24u van tevoren)
# Cron: 0 * * * * /bin/sh /home/.../public_html/scripts/send-reminders.sh
#
# Vervang CRON_KEY door de sleutel uit setup-mail.php (na Gmail koppelen).

CRON_KEY="VUL_HIER_JOUW_CRON_KEY_IN"
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="${BASE_DIR}/cron-logs/send-reminders.log"
API_URL="https://agenda.eliminstituut.nl/api/send-reminders.php?key=${CRON_KEY}"

mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cron gestart" >> "$LOG_FILE"

RESPONSE=$(curl -sS "$API_URL" 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Succes: $RESPONSE" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fout ($STATUS): $RESPONSE" >> "$LOG_FILE"
fi
