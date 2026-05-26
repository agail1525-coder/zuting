#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${FINANCE_DASHBOARD_HOST:-127.0.0.1}"
PORT="${FINANCE_DASHBOARD_PORT:-47837}"
CONFIG_PATH="${FINANCE_DASHBOARD_CONFIG:-$ROOT_DIR/config/finance-dashboard.json}"
REPORT_PATH="${FINANCE_REPORT_PATH:-/home/mark/Desktop/业务六部4月毛利表.xls}"
LOG_DIR="${ROOT_DIR}/.shortcut-center-env/data/finance-dashboard"
LOG_PATH="${LOG_DIR}/server.log"

mkdir -p "$LOG_DIR"

BASE_PATH="$(
python3 - "$CONFIG_PATH" <<'PY'
import json
import sys
from pathlib import Path

config_path = Path(sys.argv[1])
if not config_path.exists():
    print("")
    raise SystemExit(0)
try:
    config = json.loads(config_path.read_text(encoding="utf-8"))
except Exception:
    print("")
    raise SystemExit(0)
value = str(config.get("base_path", "") or "").strip()
if not value or value == "/":
    print("")
    raise SystemExit(0)
if not value.startswith("/"):
    value = f"/{value}"
print(value.rstrip("/"))
PY
)"
SERVER_URL="http://${HOST}:${PORT}${BASE_PATH}"
API_URL="${SERVER_URL}/api/dashboard"

if ! python3 - <<PY >/dev/null 2>&1
import sys
from urllib import request
try:
    request.urlopen("${API_URL}", timeout=1)
except Exception:
    sys.exit(1)
PY
then
  nohup python3 "$ROOT_DIR/finance_dashboard.py" serve \
    --host "$HOST" \
    --port "$PORT" \
    --config "$CONFIG_PATH" \
    --report-file "$REPORT_PATH" >> "$LOG_PATH" 2>&1 &
  sleep 1
fi

xdg-open "$SERVER_URL" >/dev/null 2>&1 || true
