#!/usr/bin/env python3
import argparse
import base64
import hashlib
import hmac
import html
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from collections import defaultdict
from datetime import datetime
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib import error, parse, request


PROJECT_ROOT = Path(__file__).resolve().parent
HTML_PAGE = PROJECT_ROOT / "finance_dashboard_ui.html"
HTML_TEMPLATE = HTML_PAGE.read_text(encoding="utf-8")
COMPARE_PAGE = PROJECT_ROOT / "finance_dashboard_compare.html"
COMPARE_TEMPLATE = COMPARE_PAGE.read_text(encoding="utf-8") if COMPARE_PAGE.exists() else ""
VENDOR_DIR = PROJECT_ROOT / ".vendor-finance"
DEFAULT_CONFIG_PATH = PROJECT_ROOT / "config" / "finance-dashboard.json"
DEFAULT_REPORT_PATH = Path.home() / "Desktop" / "业务6部 5月份毛利表.xls"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 47837
HEADER_ROW_INDEX = 2
DATA_ROW_START_INDEX = 3
ROLE_FIELDS = ["接团计调", "操作计调", "报名计调", "外联", "导游"]
TOTAL_ROW_MARKER = "合计"
AI_CACHE_SECONDS = 300
AI_ROUTE_CACHE_SECONDS = 300
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
BACKUP_DIR = PROJECT_ROOT / ".shortcut-center-env" / "data" / "finance-dashboard" / "backups"
DEFAULT_SQLITE_PATH = PROJECT_ROOT / ".shortcut-center-env" / "data" / "finance-dashboard" / "finance-dashboard.db"
DEFAULT_STORAGE_MODE = "excel"
DEFAULT_AI_ROUTE_TASK_TYPES = ["FINANCE_ANALYSIS", "MARKET_ANALYSIS"]
AUTH_COOKIE_NAME = "gen_dashboard_auth"
AUTH_COOKIE_TTL_SECONDS = 43200
ZUOYELANG_AI_CACHE_LOCK = threading.Lock()
ZUOYELANG_AI_CACHE: dict[str, Any] = {}
LOGIN_PAGE_TEMPLATE = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>经营战报访问验证</title>
  <style>
    :root {
      color-scheme: light;
      --bg: linear-gradient(135deg, #08111f 0%, #102748 48%, #1f5b74 100%);
      --card: rgba(255, 255, 255, 0.96);
      --text: #122033;
      --muted: #63748a;
      --accent: #0d8c78;
      --danger: #b42318;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    .card {
      width: min(100%, 420px);
      padding: 32px 28px;
      border-radius: 24px;
      background: var(--card);
      box-shadow: 0 28px 60px rgba(8, 17, 31, 0.28);
    }
    .eyebrow {
      display: inline-block;
      margin-bottom: 12px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(13, 140, 120, 0.12);
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 28px;
      line-height: 1.15;
    }
    p {
      margin: 0 0 22px;
      color: var(--muted);
      line-height: 1.6;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    input {
      width: 100%;
      padding: 14px 16px;
      border: 1px solid #ced6e0;
      border-radius: 14px;
      font-size: 16px;
      outline: none;
    }
    input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(13, 140, 120, 0.12);
    }
    button {
      width: 100%;
      margin-top: 18px;
      padding: 14px 16px;
      border: 0;
      border-radius: 14px;
      background: linear-gradient(135deg, #0d8c78 0%, #0eae90 100%);
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
    }
    .error {
      margin-bottom: 16px;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(180, 35, 24, 0.08);
      color: var(--danger);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="eyebrow">ZUTING / GEN</div>
    <h1>经营战报访问验证</h1>
    <p>该页面已启用访问密码。请输入密码后进入战报看板。</p>
    __ERROR_BLOCK__
    <form method="post" action="__LOGIN_ACTION__">
      <input type="hidden" name="next" value="__NEXT_VALUE__">
      <label for="password">访问密码</label>
      <input id="password" name="password" type="password" inputmode="numeric" autocomplete="current-password" placeholder="请输入访问密码" required autofocus>
      <button type="submit">进入战报</button>
    </form>
  </main>
</body>
</html>
"""
STANDARD_HEADERS = [
    "序号",
    "团号",
    "业务分类",
    "组号",
    "部门",
    "发团",
    "散团",
    "客户",
    "联系人",
    "客源地",
    "线路",
    "目的地",
    "成人",
    "老人",
    "儿童",
    "全陪",
    "客人",
    "组团社团号",
    "导游",
    "接团计调",
    "操作计调",
    "报名计调",
    "外联",
    "收入",
    "成本",
    "单团利润",
    "人均利润",
    "利润率",
    "合计收入",
    "合计成本",
    "合计利润",
    "合计人均利润",
    "合计利润率",
]
COUNT_COLUMNS = {"序号", "成人", "老人", "儿童", "全陪"}
MONEY_COLUMNS = {"收入", "成本", "单团利润", "人均利润", "合计收入", "合计成本", "合计利润", "合计人均利润"}
PERCENT_COLUMNS = {"利润率", "合计利润率"}
CENTER_COLUMNS = {"序号", "业务分类", "部门", "发团", "散团", "目的地", "导游", "接团计调", "操作计调", "报名计调", "外联"}
COLUMN_WIDTHS = {
    "序号": 1800,
    "团号": 3800,
    "业务分类": 3800,
    "组号": 2600,
    "部门": 3200,
    "发团": 3600,
    "散团": 3600,
    "客户": 7600,
    "联系人": 3600,
    "客源地": 5200,
    "线路": 9800,
    "目的地": 3200,
    "成人": 2200,
    "老人": 2200,
    "儿童": 2200,
    "全陪": 2200,
    "客人": 3800,
    "组团社团号": 4200,
    "导游": 3200,
    "接团计调": 3600,
    "操作计调": 3600,
    "报名计调": 3600,
    "外联": 3200,
    "收入": 3600,
    "成本": 3600,
    "单团利润": 3600,
    "人均利润": 3600,
    "利润率": 3200,
    "合计收入": 3600,
    "合计成本": 3600,
    "合计利润": 3600,
    "合计人均利润": 3600,
    "合计利润率": 3200,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Travel finance morale dashboard")
    subparsers = parser.add_subparsers(dest="command", required=True)

    serve = subparsers.add_parser("serve", help="Run the local dashboard")
    serve.add_argument("--host", default=DEFAULT_HOST)
    serve.add_argument("--port", type=int, default=DEFAULT_PORT)
    serve.add_argument("--config", default=str(DEFAULT_CONFIG_PATH))
    serve.add_argument("--report-file", default=str(DEFAULT_REPORT_PATH))
    serve.add_argument("--open-browser", action="store_true")

    show = subparsers.add_parser("print", help="Print current dashboard JSON")
    show.add_argument("--config", default=str(DEFAULT_CONFIG_PATH))
    show.add_argument("--report-file", default=str(DEFAULT_REPORT_PATH))

    seed = subparsers.add_parser("seed-sqlite", help="Seed a standalone SQLite database from an Excel report")
    seed.add_argument("--config", default=str(DEFAULT_CONFIG_PATH))
    seed.add_argument("--report-file", default=str(DEFAULT_REPORT_PATH))
    seed.add_argument("--sqlite-path", default=str(DEFAULT_SQLITE_PATH))

    return parser.parse_args()


def merge_dicts(left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
    merged = dict(left)
    for key, value in right.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = merge_dicts(merged[key], value)
        else:
            merged[key] = value
    return merged


def load_config(config_path: Path) -> dict[str, Any]:
    defaults: dict[str, Any] = {
        "storage": DEFAULT_STORAGE_MODE,
        "report_path": str(DEFAULT_REPORT_PATH),
        "sqlite_path": str(DEFAULT_SQLITE_PATH),
        "base_path": "",
        "access_password": "",
        "report_title": "旅游经营利润战报",
        "refresh_seconds": 15,
        "ai": {
            "source": "auto",
            "provider": "",
            "base_url": "",
            "api_key_env": "AI_API_KEY",
            "model": "",
            "route_task_types": list(DEFAULT_AI_ROUTE_TASK_TYPES),
            "temperature": 0.8,
            "enabled": False,
            "zuoyelang": {
                "env_paths": ["/opt/zuoyelang/.env", "/opt/zuting/api/.env"],
                "db_container": "zuoyelang-postgres",
                "db_name": "zuoyelang",
                "db_user": "zuoyelang",
            },
        },
    }
    if not config_path.exists():
        return defaults
    loaded = json.loads(config_path.read_text(encoding="utf-8"))
    return merge_dicts(defaults, loaded)


def normalize_base_path(value: Any) -> str:
    text = clean_text(value)
    if not text or text == "/":
        return ""
    if not text.startswith("/"):
        text = f"/{text}"
    return text.rstrip("/")


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def parse_bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    text = clean_text(value).lower()
    if not text:
        return default
    if text in {"1", "true", "yes", "on", "y", "t"}:
        return True
    if text in {"0", "false", "no", "off", "n", "f"}:
        return False
    return default


def parse_text_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [clean_text(item) for item in value if clean_text(item)]
    text = clean_text(value)
    if not text:
        return []
    return [part for part in [clean_text(item) for item in re.split(r"[,|\n]+", text)] if part]


def to_number(value: Any) -> float:
    if value in (None, ""):
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    text = clean_text(value).replace(",", "").replace("，", "")
    if not text:
        return 0.0
    try:
        return float(text)
    except ValueError:
        return 0.0


def to_percent(value: Any) -> float:
    if value in (None, ""):
        return 0.0
    if isinstance(value, (int, float)):
        numeric = float(value)
        return numeric / 100.0 if numeric > 1 else numeric
    text = clean_text(value)
    if not text:
        return 0.0
    if text.endswith("%"):
        return to_number(text[:-1]) / 100.0
    numeric = to_number(text)
    return numeric / 100.0 if numeric > 1 else numeric


def to_isoish_date(value: Any) -> str:
    text = clean_text(value)
    if not text:
        return ""
    match = re.search(r"(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})", text)
    if not match:
        return text
    year, month, day = match.groups()
    return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"


def require_iso_date(value: Any, label: str) -> str:
    text = to_isoish_date(value)
    if not DATE_RE.fullmatch(text):
        raise ValueError(f"{label}格式不正确，请使用 YYYY-MM-DD")
    return text


def require_text(value: Any, label: str) -> str:
    text = clean_text(value)
    if not text:
        raise ValueError(f"{label}不能为空")
    return text


def require_non_negative_number(value: Any, label: str) -> float:
    number = to_number(value)
    if number < 0:
        raise ValueError(f"{label}不能小于 0")
    return round(number, 2)


def parse_non_negative_count(value: Any, label: str) -> int:
    text = clean_text(value)
    if not text:
        return 0
    number = to_number(text)
    if number < 0 or not float(number).is_integer():
        raise ValueError(f"{label}必须是大于等于 0 的整数")
    return int(number)


def month_label(date_text: str) -> str:
    if not date_text:
        return "本期"
    match = re.match(r"(\d{4})-(\d{2})", date_text)
    if not match:
        return date_text
    return f"{match.group(1)}年{int(match.group(2))}月"


def detect_export_time(raw_text: str) -> str:
    if "导出时间" not in raw_text:
        return ""
    parts = re.split(r"[：:]", raw_text, maxsplit=1)
    return parts[1].strip() if len(parts) == 2 else ""


def detect_period(raw_text: str) -> tuple[str, str]:
    dates = re.findall(r"\d{4}-\d{2}-\d{2}", raw_text)
    if len(dates) >= 2:
        return dates[0], dates[1]
    return "", ""


def human_wan(value: float) -> str:
    return f"{value / 10000:.2f}万"


def short_date(value: str) -> str:
    match = re.match(r"\d{4}-(\d{2})-(\d{2})", value)
    if not match:
        return value
    return f"{int(match.group(1))}月{int(match.group(2))}日"


def derive_primary_owner(row: dict[str, Any]) -> str:
    for field in ROLE_FIELDS:
        text = clean_text(row.get(field))
        if text:
            return text
    return "团队协同"


def ensure_vendor_path() -> None:
    if VENDOR_DIR.exists():
        vendor_path = str(VENDOR_DIR)
        if vendor_path not in sys.path:
            sys.path.insert(0, vendor_path)


def load_xlrd() -> Any:
    ensure_vendor_path()
    try:
        import xlrd  # type: ignore
    except ImportError as exc:  # pragma: no cover - environment guard
        raise RuntimeError(
            f"缺少 xlrd 依赖，请执行：python3 -m pip install --target {VENDOR_DIR} xlrd"
        ) from exc
    return xlrd


def load_xlwt() -> Any:
    ensure_vendor_path()
    try:
        import xlwt  # type: ignore
    except ImportError as exc:  # pragma: no cover - environment guard
        raise RuntimeError(
            f"缺少 xlwt 依赖，请执行：python3 -m pip install --target {VENDOR_DIR} xlwt"
        ) from exc
    return xlwt


def first_non_empty(records: list[dict[str, Any]], key: str, fallback: str = "") -> str:
    for record in records:
        text = clean_text(record.get(key))
        if text:
            return text
    return fallback


def format_margin_text(margin: float) -> str:
    numeric = f"{margin * 100:.2f}".rstrip("0").rstrip(".")
    return f"{numeric}%"


def normalize_record(raw_row: dict[str, Any]) -> dict[str, Any]:
    revenue = to_number(raw_row.get("收入") or raw_row.get("合计收入"))
    cost = to_number(raw_row.get("成本") or raw_row.get("合计成本"))
    profit = round(to_number(raw_row.get("单团利润") or raw_row.get("合计利润")), 2)
    adults = to_number(raw_row.get("成人"))
    elders = to_number(raw_row.get("老人"))
    children = to_number(raw_row.get("儿童"))
    full_escort = to_number(raw_row.get("全陪"))
    travellers = adults + elders + children
    margin = profit / revenue if revenue else to_percent(raw_row.get("利润率") or raw_row.get("合计利润率"))
    per_capita_profit = to_number(raw_row.get("人均利润") or raw_row.get("合计人均利润"))
    return {
        "sequence": clean_text(raw_row.get("序号")),
        "tour_no": clean_text(raw_row.get("团号")),
        "business_type": clean_text(raw_row.get("业务分类")),
        "group_no": clean_text(raw_row.get("组号")),
        "department": clean_text(raw_row.get("部门")),
        "start_date": to_isoish_date(raw_row.get("发团")),
        "end_date": to_isoish_date(raw_row.get("散团")),
        "customer": clean_text(raw_row.get("客户")),
        "contact": clean_text(raw_row.get("联系人")),
        "source_region": clean_text(raw_row.get("客源地")),
        "line": clean_text(raw_row.get("线路")),
        "destination": clean_text(raw_row.get("目的地")),
        "adults": adults,
        "elders": elders,
        "children": children,
        "full_escort": full_escort,
        "travellers": travellers,
        "guest_note": clean_text(raw_row.get("客人")),
        "agency_tour_no": clean_text(raw_row.get("组团社团号")),
        "guide": clean_text(raw_row.get("导游")),
        "receiving_coordinator": clean_text(raw_row.get("接团计调")),
        "operations_coordinator": clean_text(raw_row.get("操作计调")),
        "signup_coordinator": clean_text(raw_row.get("报名计调")),
        "outreach": clean_text(raw_row.get("外联")),
        "primary_owner": derive_primary_owner(raw_row),
        "revenue": revenue,
        "cost": cost,
        "profit": profit,
        "per_capita_profit": per_capita_profit,
        "margin": margin,
        "raw_row": dict(raw_row),
    }


def parse_report(report_path: Path) -> dict[str, Any]:
    if not report_path.exists():
        raise FileNotFoundError(f"报表不存在: {report_path}")

    xlrd = load_xlrd()
    workbook = xlrd.open_workbook(str(report_path))
    sheet = workbook.sheet_by_index(0)
    headers = [clean_text(sheet.cell_value(HEADER_ROW_INDEX, index)) for index in range(sheet.ncols)]

    report_title = clean_text(sheet.cell_value(0, 0))
    period_text = clean_text(sheet.cell_value(1, 0))
    period_start, period_end = detect_period(period_text)
    export_time = ""
    records: list[dict[str, Any]] = []
    total_row: dict[str, Any] | None = None

    for row_index in range(DATA_ROW_START_INDEX, sheet.nrows):
        row_values = [sheet.cell_value(row_index, col_index) for col_index in range(sheet.ncols)]
        first_value = clean_text(row_values[0]) if row_values else ""
        if not any(clean_text(value) for value in row_values):
            continue
        if first_value == TOTAL_ROW_MARKER:
            total_row = {header: row_values[index] for index, header in enumerate(headers)}
            continue
        if "导出时间" in first_value:
            export_time = detect_export_time(first_value)
            continue

        raw_row = {header: row_values[index] for index, header in enumerate(headers)}
        records.append(normalize_record(raw_row))

    return {
        "title": report_title or "旅游经营利润战报",
        "period_text": period_text,
        "period_start": period_start,
        "period_end": period_end,
        "export_time": export_time,
        "headers": headers or list(STANDARD_HEADERS),
        "records": records,
        "total_row": total_row or {},
    }


def storage_mode_from_config(raw_config: dict[str, Any]) -> str:
    mode = clean_text(raw_config.get("storage")).lower()
    return mode if mode in {"excel", "sqlite"} else DEFAULT_STORAGE_MODE


def resolve_configured_path(config_path: Path | None, value: str, default_path: Path) -> Path:
    if not value:
        return default_path.expanduser()
    candidate = Path(value).expanduser()
    if candidate.is_absolute() or config_path is None:
        return candidate
    return (config_path.parent / candidate).resolve()


def sqlite_path_from_config(raw_config: dict[str, Any], config_path: Path | None = None) -> Path:
    configured = clean_text(raw_config.get("sqlite_path")) or str(DEFAULT_SQLITE_PATH)
    return resolve_configured_path(config_path, configured, DEFAULT_SQLITE_PATH)


def report_path_from_config(raw_config: dict[str, Any], report_path: Path, config_path: Path | None = None) -> Path:
    configured = clean_text(raw_config.get("report_path"))
    candidate = report_path.expanduser()
    if candidate != DEFAULT_REPORT_PATH.expanduser():
        return candidate
    if configured:
        return resolve_configured_path(config_path, configured, DEFAULT_REPORT_PATH)
    return candidate


def sqlite_connection(sqlite_path: Path) -> sqlite3.Connection:
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(sqlite_path)
    connection.row_factory = sqlite3.Row
    return connection


def ensure_sqlite_schema(sqlite_path: Path) -> None:
    with sqlite_connection(sqlite_path) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS app_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS report_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sequence INTEGER NOT NULL,
                tour_no TEXT NOT NULL,
                business_type TEXT NOT NULL,
                group_no TEXT NOT NULL DEFAULT '',
                department TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                customer TEXT NOT NULL,
                contact TEXT NOT NULL DEFAULT '',
                source_region TEXT NOT NULL DEFAULT '',
                line TEXT NOT NULL,
                destination TEXT NOT NULL DEFAULT '',
                adults INTEGER NOT NULL DEFAULT 0,
                elders INTEGER NOT NULL DEFAULT 0,
                children INTEGER NOT NULL DEFAULT 0,
                full_escort INTEGER NOT NULL DEFAULT 0,
                guest_note TEXT NOT NULL DEFAULT '',
                agency_tour_no TEXT NOT NULL DEFAULT '',
                guide TEXT NOT NULL DEFAULT '',
                receiving_coordinator TEXT NOT NULL DEFAULT '',
                operations_coordinator TEXT NOT NULL DEFAULT '',
                signup_coordinator TEXT NOT NULL DEFAULT '',
                outreach TEXT NOT NULL DEFAULT '',
                revenue REAL NOT NULL DEFAULT 0,
                cost REAL NOT NULL DEFAULT 0,
                profit REAL NOT NULL DEFAULT 0,
                per_capita_profit REAL NOT NULL DEFAULT 0,
                margin REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )


def sqlite_set_meta(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        "INSERT INTO app_meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        (key, value),
    )


def sqlite_get_meta(conn: sqlite3.Connection, key: str, default: str = "") -> str:
    row = conn.execute("SELECT value FROM app_meta WHERE key = ?", (key,)).fetchone()
    return clean_text(row["value"]) if row else default


def sqlite_record_dict(record: dict[str, Any], sequence: int) -> dict[str, Any]:
    return {
        "sequence": sequence,
        "tour_no": clean_text(record.get("tour_no")),
        "business_type": clean_text(record.get("business_type")),
        "group_no": clean_text(record.get("group_no")),
        "department": clean_text(record.get("department")),
        "start_date": clean_text(record.get("start_date")),
        "end_date": clean_text(record.get("end_date")),
        "customer": clean_text(record.get("customer")),
        "contact": clean_text(record.get("contact")),
        "source_region": clean_text(record.get("source_region")),
        "line": clean_text(record.get("line")),
        "destination": clean_text(record.get("destination")),
        "adults": int(round(float(record.get("adults", 0.0)))),
        "elders": int(round(float(record.get("elders", 0.0)))),
        "children": int(round(float(record.get("children", 0.0)))),
        "full_escort": int(round(float(record.get("full_escort", 0.0)))),
        "guest_note": clean_text(record.get("guest_note")),
        "agency_tour_no": clean_text(record.get("agency_tour_no")),
        "guide": clean_text(record.get("guide")),
        "receiving_coordinator": clean_text(record.get("receiving_coordinator")),
        "operations_coordinator": clean_text(record.get("operations_coordinator")),
        "signup_coordinator": clean_text(record.get("signup_coordinator")),
        "outreach": clean_text(record.get("outreach")),
        "revenue": round(float(record.get("revenue", 0.0)), 2),
        "cost": round(float(record.get("cost", 0.0)), 2),
        "profit": round(float(record.get("profit", 0.0)), 2),
        "per_capita_profit": round(float(record.get("per_capita_profit", 0.0)), 2),
        "margin": float(record.get("margin", 0.0)),
    }


def replace_sqlite_records(sqlite_path: Path, report_title: str, records: list[dict[str, Any]]) -> None:
    ensure_sqlite_schema(sqlite_path)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with sqlite_connection(sqlite_path) as conn:
        conn.execute("DELETE FROM report_records")
        for index, record in enumerate(records, start=1):
            row = sqlite_record_dict(record, index)
            conn.execute(
                """
                INSERT INTO report_records(
                    sequence, tour_no, business_type, group_no, department, start_date, end_date, customer, contact,
                    source_region, line, destination, adults, elders, children, full_escort, guest_note, agency_tour_no,
                    guide, receiving_coordinator, operations_coordinator, signup_coordinator, outreach, revenue, cost,
                    profit, per_capita_profit, margin, created_at, updated_at
                ) VALUES(
                    :sequence, :tour_no, :business_type, :group_no, :department, :start_date, :end_date, :customer, :contact,
                    :source_region, :line, :destination, :adults, :elders, :children, :full_escort, :guest_note, :agency_tour_no,
                    :guide, :receiving_coordinator, :operations_coordinator, :signup_coordinator, :outreach, :revenue, :cost,
                    :profit, :per_capita_profit, :margin, :created_at, :updated_at
                )
                """,
                row | {"created_at": now, "updated_at": now},
            )
        sqlite_set_meta(conn, "report_title", report_title or "旅游经营利润战报")
        sqlite_set_meta(conn, "updated_at", now)
        sqlite_set_meta(conn, "storage", "sqlite")
        conn.commit()


def seed_sqlite_from_report(report_path: Path, sqlite_path: Path) -> dict[str, Any]:
    parsed = parse_report(report_path)
    replace_sqlite_records(sqlite_path, parsed["title"], parsed["records"])
    return {
        "ok": True,
        "sqlite_path": str(sqlite_path),
        "records": len(parsed["records"]),
        "title": parsed["title"],
    }


def load_report_from_sqlite(sqlite_path: Path, report_title: str) -> dict[str, Any]:
    ensure_sqlite_schema(sqlite_path)
    with sqlite_connection(sqlite_path) as conn:
        rows = conn.execute(
            """
            SELECT sequence, tour_no, business_type, group_no, department, start_date, end_date, customer, contact,
                   source_region, line, destination, adults, elders, children, full_escort, guest_note, agency_tour_no,
                   guide, receiving_coordinator, operations_coordinator, signup_coordinator, outreach, revenue, cost,
                   profit, per_capita_profit, margin
            FROM report_records
            ORDER BY start_date, sequence, id
            """
        ).fetchall()
        title = sqlite_get_meta(conn, "report_title", report_title or "旅游经营利润战报")
        export_time = sqlite_get_meta(conn, "updated_at", "")

    records: list[dict[str, Any]] = []
    for row in rows:
        records.append(
            {
                "sequence": clean_text(row["sequence"]),
                "tour_no": clean_text(row["tour_no"]),
                "business_type": clean_text(row["business_type"]),
                "group_no": clean_text(row["group_no"]),
                "department": clean_text(row["department"]),
                "start_date": clean_text(row["start_date"]),
                "end_date": clean_text(row["end_date"]),
                "customer": clean_text(row["customer"]),
                "contact": clean_text(row["contact"]),
                "source_region": clean_text(row["source_region"]),
                "line": clean_text(row["line"]),
                "destination": clean_text(row["destination"]),
                "adults": float(row["adults"]),
                "elders": float(row["elders"]),
                "children": float(row["children"]),
                "full_escort": float(row["full_escort"]),
                "travellers": float(row["adults"]) + float(row["elders"]) + float(row["children"]),
                "guest_note": clean_text(row["guest_note"]),
                "agency_tour_no": clean_text(row["agency_tour_no"]),
                "guide": clean_text(row["guide"]),
                "receiving_coordinator": clean_text(row["receiving_coordinator"]),
                "operations_coordinator": clean_text(row["operations_coordinator"]),
                "signup_coordinator": clean_text(row["signup_coordinator"]),
                "outreach": clean_text(row["outreach"]),
                "primary_owner": derive_primary_owner(
                    {
                        "接团计调": row["receiving_coordinator"],
                        "操作计调": row["operations_coordinator"],
                        "报名计调": row["signup_coordinator"],
                        "外联": row["outreach"],
                        "导游": row["guide"],
                    }
                ),
                "revenue": float(row["revenue"]),
                "cost": float(row["cost"]),
                "profit": float(row["profit"]),
                "per_capita_profit": float(row["per_capita_profit"]),
                "margin": float(row["margin"]),
            }
        )

    period_text = build_period_text(records)
    period_start, period_end = detect_period(period_text)
    return {
        "title": title,
        "period_text": period_text,
        "period_start": period_start,
        "period_end": period_end,
        "export_time": export_time,
        "headers": list(STANDARD_HEADERS),
        "records": records,
        "total_row": build_total_row(records, list(STANDARD_HEADERS)) if records else {},
    }


def append_record_to_sqlite(sqlite_path: Path, payload: dict[str, Any], report_title: str) -> dict[str, Any]:
    parsed_report = load_report_from_sqlite(sqlite_path, report_title)
    new_record = build_record_from_form_input(payload, parsed_report)
    records = parsed_report["records"] + [new_record]
    replace_sqlite_records(sqlite_path, parsed_report["title"], records)
    return {
        "record": {
            "tour_no": new_record["tour_no"],
            "customer": new_record["customer"],
            "line": new_record["line"],
            "revenue": new_record["revenue"],
            "cost": new_record["cost"],
            "profit": new_record["profit"],
        },
        "backup_dir": "",
    }


def build_period_text(records: list[dict[str, Any]]) -> str:
    dates: list[str] = []
    for record in records:
        start_date = clean_text(record.get("start_date"))
        end_date = clean_text(record.get("end_date"))
        if DATE_RE.fullmatch(start_date):
            dates.append(start_date)
        if DATE_RE.fullmatch(end_date):
            dates.append(end_date)
    if not dates:
        return ""
    return f"日期：{min(dates)}到{max(dates)}"


def record_month_key(record: dict[str, Any]) -> str:
    for field in ("start_date", "end_date"):
        text = clean_text(record.get(field))
        if DATE_RE.fullmatch(text):
            return text[:7]
    return ""


def month_label_from_key(month_key: str) -> str:
    if not re.fullmatch(r"\d{4}-\d{2}", month_key):
        return month_key
    year, month = month_key.split("-", 1)
    return f"{year}年{int(month)}月"


def build_month_options(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, Any]] = {}
    for record in records:
        month_key = record_month_key(record)
        if not month_key:
            continue
        if month_key not in buckets:
            buckets[month_key] = {
                "value": month_key,
                "label": month_label_from_key(month_key),
                "groups": 0,
                "revenue": 0.0,
                "profit": 0.0,
            }
        bucket = buckets[month_key]
        bucket["groups"] += 1
        bucket["revenue"] += float(record.get("revenue", 0.0))
        bucket["profit"] += float(record.get("profit", 0.0))
    return [buckets[key] for key in sorted(buckets)]


def select_month_records(records: list[dict[str, Any]], requested_month: str = "") -> tuple[list[dict[str, Any]], dict[str, Any]]:
    options = build_month_options(records)
    option_keys = [item["value"] for item in options]
    requested = clean_text(requested_month)
    if requested == "all":
        return records, {
            "selected_month": "all",
            "selected_month_label": "全部月份",
            "available_months": options,
        }
    selected = requested if requested in option_keys else (option_keys[-1] if option_keys else "")
    if not selected:
        return records, {
            "selected_month": "",
            "selected_month_label": "",
            "available_months": options,
        }
    filtered = [record for record in records if record_month_key(record) == selected]
    return filtered, {
        "selected_month": selected,
        "selected_month_label": month_label_from_key(selected),
        "available_months": options,
    }


def aggregate_dimension(records: list[dict[str, Any]], key: str, limit: int = 5) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, Any]] = {}
    for record in records:
        label = clean_text(record.get(key)) or "未标注"
        if label not in buckets:
            buckets[label] = {
                "label": label,
                "groups": 0,
                "travellers": 0.0,
                "revenue": 0.0,
                "cost": 0.0,
                "profit": 0.0,
            }
        bucket = buckets[label]
        bucket["groups"] += 1
        bucket["travellers"] += float(record.get("travellers", 0.0))
        bucket["revenue"] += float(record.get("revenue", 0.0))
        bucket["cost"] += float(record.get("cost", 0.0))
        bucket["profit"] += float(record.get("profit", 0.0))

    board = list(buckets.values())
    for item in board:
        item["margin"] = item["profit"] / item["revenue"] if item["revenue"] else 0.0
    board.sort(key=lambda item: (item["profit"], item["revenue"]), reverse=True)
    return board[:limit]


def summarize_records(records: list[dict[str, Any]]) -> dict[str, Any]:
    revenue = sum(float(item.get("revenue", 0.0)) for item in records)
    cost = sum(float(item.get("cost", 0.0)) for item in records)
    profit = sum(float(item.get("profit", 0.0)) for item in records)
    travellers = sum(float(item.get("travellers", 0.0)) for item in records)
    group_count = len(records)
    return {
        "groups": group_count,
        "travellers": travellers,
        "revenue": revenue,
        "cost": cost,
        "profit": profit,
        "margin": profit / revenue if revenue else 0.0,
        "cost_rate": cost / revenue if revenue else 0.0,
        "average_profit": profit / group_count if group_count else 0.0,
        "average_revenue": revenue / group_count if group_count else 0.0,
        "average_revenue_per_traveller": revenue / travellers if travellers else 0.0,
        "average_profit_per_traveller": profit / travellers if travellers else 0.0,
    }


def build_month_records_map(records: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        month_key = record_month_key(record)
        if month_key:
            buckets[month_key].append(record)
    return dict(buckets)


def metric_delta(current: float, previous: float) -> dict[str, float]:
    delta = current - previous
    return {
        "current": current,
        "previous": previous,
        "delta": delta,
        "delta_rate": delta / previous if previous else 0.0,
    }


def build_monthly_series(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    month_map = build_month_records_map(records)
    series = []
    for month_key in sorted(month_map):
        summary = summarize_records(month_map[month_key])
        series.append(
            {
                "month": month_key,
                "label": month_label_from_key(month_key),
                **summary,
            }
        )
    return series


def compare_dimensions(current_records: list[dict[str, Any]], previous_records: list[dict[str, Any]], key: str, limit: int = 5) -> list[dict[str, Any]]:
    current_board = {item["label"]: item for item in aggregate_dimension(current_records, key, limit=999)}
    previous_board = {item["label"]: item for item in aggregate_dimension(previous_records, key, limit=999)}
    labels = sorted(set(current_board) | set(previous_board))
    rows: list[dict[str, Any]] = []
    for label in labels:
        current = current_board.get(label, {"label": label, "groups": 0, "travellers": 0.0, "revenue": 0.0, "cost": 0.0, "profit": 0.0, "margin": 0.0})
        previous = previous_board.get(label, {"label": label, "groups": 0, "travellers": 0.0, "revenue": 0.0, "cost": 0.0, "profit": 0.0, "margin": 0.0})
        rows.append(
            {
                "label": label,
                "current": current,
                "previous": previous,
                "delta_profit": current["profit"] - previous["profit"],
                "delta_revenue": current["revenue"] - previous["revenue"],
                "delta_margin": current["margin"] - previous["margin"],
            }
        )
    rows.sort(key=lambda item: (abs(item["delta_profit"]), item["current"]["profit"], item["current"]["revenue"]), reverse=True)
    return rows[:limit]


def build_comparison_cards(current_summary: dict[str, Any], previous_summary: dict[str, Any]) -> list[dict[str, Any]]:
    cards = [
        ("创收", "revenue", "money"),
        ("利润", "profit", "money"),
        ("利润率", "margin", "percent"),
        ("成本率", "cost_rate", "percent_inverse"),
        ("出团量", "groups", "count"),
        ("人均利润", "average_profit_per_traveller", "money"),
    ]
    result = []
    for label, key, value_type in cards:
        delta = metric_delta(float(current_summary.get(key, 0.0)), float(previous_summary.get(key, 0.0)))
        is_positive = delta["delta"] >= 0
        if value_type == "percent_inverse":
            is_positive = delta["delta"] <= 0
        result.append({"label": label, "key": key, "type": value_type, **delta, "positive": is_positive})
    return result


def build_coaching_notes(
    current_month: str,
    previous_month: str,
    current_summary: dict[str, Any],
    previous_summary: dict[str, Any],
    dimensions: dict[str, list[dict[str, Any]]],
) -> dict[str, Any]:
    revenue_delta = current_summary["revenue"] - previous_summary["revenue"]
    profit_delta = current_summary["profit"] - previous_summary["profit"]
    margin_delta = current_summary["margin"] - previous_summary["margin"]
    top_line = next((item for item in dimensions["lines"] if item["current"]["profit"] > 0), None)
    weak_line = next((item for item in reversed(dimensions["lines"]) if item["current"]["margin"] < current_summary["margin"]), None)
    top_region = next((item for item in dimensions["regions"] if item["current"]["profit"] > 0), None)
    top_owner = next((item for item in dimensions["owners"] if item["current"]["profit"] > 0), None)

    headline = (
        f"{month_label_from_key(current_month)}较{month_label_from_key(previous_month)}"
        f"创收{'增加' if revenue_delta >= 0 else '减少'}{human_money(abs(revenue_delta))}，"
        f"利润{'增加' if profit_delta >= 0 else '减少'}{human_money(abs(profit_delta))}，"
        f"利润率{'提升' if margin_delta >= 0 else '下降'}{abs(margin_delta) * 100:.2f}个百分点。"
    )
    wins = []
    losses = []
    actions = []
    if profit_delta >= 0:
        wins.append(build_insight_item("利润质量提升", f"本月利润较上月增加{human_money(abs(profit_delta))}，说明报价、控本或线路结构至少有一项已经改善。"))
    else:
        losses.append(build_insight_item("利润规模回落", f"本月利润较上月减少{human_money(abs(profit_delta))}，需要先区分是团量不足、客单价下降，还是成本率抬升。"))
    if margin_delta >= 0:
        wins.append(build_insight_item("毛利线抬高", f"利润率提升{abs(margin_delta) * 100:.2f}个百分点，应把本月高毛利团的报价结构固化为模板。"))
    else:
        losses.append(build_insight_item("毛利被摊薄", f"利润率下降{abs(margin_delta) * 100:.2f}个百分点，低毛利团必须进入报价复核。"))
    if top_line:
        wins.append(build_insight_item(f"复制线路 {top_line['label']}", f"本月贡献利润{human_money(top_line['current']['profit'])}，较上月变化{human_money(top_line['delta_profit'])}，适合沉淀成主推线路。"))
        actions.append(build_insight_item("把冠军线路做成标准产品包", f"围绕“{top_line['label']}”拆出标准报价、升级项和销售话术，先复制已经赚钱的线路。"))
    if weak_line:
        losses.append(build_insight_item(f"复盘低效线路 {weak_line['label']}", f"当前利润率{weak_line['current']['margin'] * 100:.2f}%，低于本月整体利润率，继续放量前先查报价和采购。"))
    if top_region:
        actions.append(build_insight_item(f"深挖客源地 {top_region['label']}", f"该客源地本月带来利润{human_money(top_region['current']['profit'])}，优先做老客转介绍和案例投放。"))
    if top_owner:
        actions.append(build_insight_item(f"让 {top_owner['label']} 输出打法", f"主战席本月贡献利润{human_money(top_owner['current']['profit'])}，应复盘其报价、沟通和控本动作给全员复用。"))
    actions.append(build_insight_item("下月设置三条硬线", "每团报价前必须看目标利润率、采购成本上限和可加价项；低于目标毛利线的团先复核再成交。"))

    return {
        "headline": headline,
        "wins": wins[:4],
        "losses": losses[:4],
        "actions": actions[:5],
    }


def build_analytics_context(all_records: list[dict[str, Any]], selected_records: list[dict[str, Any]], month_meta: dict[str, Any]) -> dict[str, Any]:
    monthly_series = build_monthly_series(all_records)
    month_keys = [item["month"] for item in monthly_series]
    selected_month = clean_text(month_meta.get("selected_month"))
    if selected_month in ("", "all"):
        current_month = month_keys[-1] if month_keys else ""
    else:
        current_month = selected_month
    current_index = month_keys.index(current_month) if current_month in month_keys else -1
    previous_month = month_keys[current_index - 1] if current_index > 0 else ""
    month_map = build_month_records_map(all_records)
    current_records = month_map.get(current_month, selected_records)
    previous_records = month_map.get(previous_month, [])
    current_summary = summarize_records(current_records)
    previous_summary = summarize_records(previous_records)
    dimensions = {
        "lines": compare_dimensions(current_records, previous_records, "line"),
        "regions": compare_dimensions([item for item in current_records if clean_text(item.get("source_region"))], [item for item in previous_records if clean_text(item.get("source_region"))], "source_region"),
        "owners": compare_dimensions(current_records, previous_records, "primary_owner"),
        "destinations": compare_dimensions(current_records, previous_records, "destination"),
    }
    return {
        "monthly_series": monthly_series,
        "comparison": {
            "current_month": current_month,
            "current_label": month_label_from_key(current_month) if current_month else "",
            "previous_month": previous_month,
            "previous_label": month_label_from_key(previous_month) if previous_month else "",
            "cards": build_comparison_cards(current_summary, previous_summary) if previous_month else [],
            "current_summary": current_summary,
            "previous_summary": previous_summary,
        },
        "dimension_comparison": dimensions,
        "coaching": build_coaching_notes(current_month, previous_month, current_summary, previous_summary, dimensions) if previous_month else {
            "headline": "当前只有一个可对比月份，先积累更多月份后再看环比得失。",
            "wins": [],
            "losses": [],
            "actions": [build_insight_item("先建立月度复盘节奏", "每月固定看创收、利润、利润率、成本率、线路和客源地，避免只看流水。")],
        },
    }


def aggregate_daily(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"date": "", "groups": 0, "travellers": 0.0, "revenue": 0.0, "cost": 0.0, "profit": 0.0}
    )
    for record in records:
        day = clean_text(record.get("start_date")) or "未标注"
        bucket = buckets[day]
        bucket["date"] = day
        bucket["groups"] += 1
        bucket["travellers"] += float(record.get("travellers", 0.0))
        bucket["revenue"] += float(record.get("revenue", 0.0))
        bucket["cost"] += float(record.get("cost", 0.0))
        bucket["profit"] += float(record.get("profit", 0.0))
    trend = list(buckets.values())
    for item in trend:
        item["margin"] = item["profit"] / item["revenue"] if item["revenue"] else 0.0
    trend.sort(key=lambda item: item["date"])
    return trend


def rank_groups(records: list[dict[str, Any]], key: str, limit: int = 5, reverse: bool = True) -> list[dict[str, Any]]:
    sorted_records = sorted(records, key=lambda item: (float(item.get(key, 0.0)), float(item.get("revenue", 0.0))), reverse=reverse)
    return [
        {
            "tour_no": item["tour_no"],
            "customer": item["customer"],
            "line": item["line"],
            "destination": item["destination"],
            "owner": item["primary_owner"],
            "travellers": item["travellers"],
            "revenue": item["revenue"],
            "cost": item["cost"],
            "profit": item["profit"],
            "margin": item["margin"],
            "start_date": item["start_date"],
        }
        for item in sorted_records[:limit]
    ]


def human_money(value: float) -> str:
    if abs(value) >= 10000:
        return f"{value / 10000:.2f}万"
    return f"{value:,.0f}元"


def build_insight_item(title: str, detail: str) -> dict[str, str]:
    return {"title": clean_text(title), "detail": clean_text(detail)}


def named_dimension_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [item for item in items if clean_text(item.get("label")) and clean_text(item.get("label")) != "未标注"]


def build_fallback_analysis(payload: dict[str, Any]) -> dict[str, Any]:
    summary = payload["summary"]
    leaderboards = payload["leaderboards"]
    spotlight = payload["spotlight"]
    line_board = named_dimension_items(leaderboards.get("line_board", []))
    source_region_board = named_dimension_items(leaderboards.get("source_region_board", []))
    destination_board = named_dimension_items(leaderboards.get("destination_board", []))
    top_margin_groups = leaderboards.get("top_margin_groups", [])
    guard_groups = leaderboards.get("guard_groups", [])
    best_day = spotlight["best_day"]
    champion = spotlight["best_profit_group"]
    champion_name = champion["line"] or champion["tour_no"] or "冠军团"
    top_line_name = line_board[0]["label"] if line_board else champion_name
    top_region_name = source_region_board[0]["label"] if source_region_board else ""

    summary_text = (
        f"{summary['department']}当前累计创收{human_wan(summary['revenue'])}、利润{human_wan(summary['profit'])}，"
        f"整体利润率{summary['margin'] * 100:.2f}%。建议继续放大“{top_line_name}”这类高毛利线路，"
        f"{f'优先深挖{top_region_name}客源，' if top_region_name else ''}"
        f"同时盯紧低毛利团的报价与采购，把增收和提利一起推进。"
    )

    route_focus = [
        build_insight_item(
            f"主推 {item['label']}",
            f"当前已带来创收{human_money(item['revenue'])}、利润{human_money(item['profit'])}，利润率{item['margin'] * 100:.2f}%，适合做成周推爆款和复购拳头产品。",
        )
        for item in line_board[:3]
    ]
    if not route_focus:
        route_focus = [
            build_insight_item(
                f"复制 {champion_name} 打法",
                f"冠军团单团利润达到{human_money(champion['profit'])}，优先拆解报价结构、成团逻辑和客户画像，形成标准销售话术。",
            )
        ]

    customer_regions: list[dict[str, str]] = []
    for item in source_region_board[:3]:
        customer_regions.append(
            build_insight_item(
                f"深挖 {item['label']} 客源",
                f"该客源地已贡献创收{human_money(item['revenue'])}、利润{human_money(item['profit'])}，建议先用老客转介绍、私域社群和朋友圈案例投放打透。",
            )
        )
    if not customer_regions:
        for item in destination_board[:3]:
            customer_regions.append(
                build_insight_item(
                    f"围绕 {item['label']} 做兴趣获客",
                    f"{item['label']}相关线路已经跑出利润{human_money(item['profit'])}，可在短视频、图文种草和主题社群里主打目的地故事与成团案例。",
                )
            )
    if not customer_regions:
        customer_regions = [
            build_insight_item(
                "优先做老客裂变",
                "报表暂未沉淀稳定客源地字段，先把高利润团的老客名单、转介绍奖励和复购线路包整理出来，最快形成新增线索。",
            )
        ]

    revenue_actions = [
        build_insight_item(
            f"把 {top_line_name} 做成固定周推",
            "用冠军线路做统一海报、报价模板和短视频样板，每周固定推一次，先放大已经验证过的创收能力。",
        ),
        build_insight_item(
            f"复制 {best_day['date'] or '冠军日'} 的出团节奏",
            f"利润峰值日单日贡献{human_money(best_day['profit'])}，建议复盘当日线路组合、客户来源和成交时点，把相似打法复制到后续排期。",
        ),
        build_insight_item(
            f"让 {spotlight['primary_owner']['label'] or '主战席'} 输出成交话术",
            f"主战席当前已累计贡献利润{human_money(spotlight['primary_owner'].get('profit', 0.0))}，应沉淀报价逻辑、异议处理和加购脚本，供全员复用。",
        ),
        build_insight_item(
            "把高意向客户分层报价",
            f"当前人均利润{human_money(summary['average_profit_per_traveller'])}，建议把同线路拆成标准版、升级版和高端版，提升客单价而不只靠多出团。",
        ),
    ]

    lowest_margin = guard_groups[0] if guard_groups else None
    highest_margin = top_margin_groups[0] if top_margin_groups else None
    profit_actions = [
        build_insight_item(
            f"为新单守住 {max(summary['margin'] * 100, 12):.1f}% 毛利线",
            "报价前先校验交通、酒店、导服和地接四项成本，低于毛利线的单子必须复核，不再用忙碌掩盖低利润。",
        ),
        build_insight_item(
            f"重点复盘 {lowest_margin['line'] or lowest_margin['tour_no']}" if lowest_margin else "先处理低毛利团",
            f"该团当前利润率仅{lowest_margin['margin'] * 100:.2f}%，优先检查让利、采购、赠送项和临时补贴。"
            if lowest_margin
            else "优先把利润率最低的团单拆解出报价和采购问题，先止损再扩量。",
        ),
        build_insight_item(
            f"复制 {highest_margin['line'] or highest_margin['tour_no']} 的利润结构" if highest_margin else "复制高毛利报价模型",
            f"高毛利样板当前利润率{highest_margin['margin'] * 100:.2f}%，可把其产品组合、加价项和控本动作沉淀为标准模板。"
            if highest_margin
            else "把高利润线路的价格锚点、加购项和采购边界模板化，降低团队发挥波动。",
        ),
        build_insight_item(
            "团前锁采购，团后复盘偏差",
            f"当前成本率为{summary['cost_rate'] * 100:.2f}%，建议每团都记录预算成本和实际成本差值，持续把偏差压缩到可控区间。",
        ),
    ]

    risk_alerts = [
        build_insight_item(
            f"关注低毛利团 {item['line'] or item['tour_no']}",
            f"当前利润率{item['margin'] * 100:.2f}%，客户为{item['customer'] or '未标注'}，继续放量前要先修正报价和成本结构。",
        )
        for item in guard_groups[:2]
    ]
    if not risk_alerts:
        risk_alerts = [
            build_insight_item(
                "警惕创收增长但利润变薄",
                f"当前整体成本率已到{summary['cost_rate'] * 100:.2f}%，后续新增订单要同步检查采购价和赠送项，避免只冲流水不留利润。",
            )
        ]

    return {
        "summary": summary_text,
        "route_focus": route_focus[:3],
        "customer_regions": customer_regions[:3],
        "revenue_actions": revenue_actions[:4],
        "profit_actions": profit_actions[:4],
        "risk_alerts": risk_alerts[:2],
    }


def build_fallback_briefing(payload: dict[str, Any]) -> str:
    return build_fallback_analysis(payload)["summary"]


def build_entry_defaults(records: list[dict[str, Any]], summary_department: str) -> dict[str, str]:
    return {
        "business_type": first_non_empty(records, "business_type", "业务部款项"),
        "department": summary_department,
        "receiving_coordinator": first_non_empty(records, "receiving_coordinator"),
        "operations_coordinator": first_non_empty(records, "operations_coordinator"),
        "signup_coordinator": first_non_empty(records, "signup_coordinator"),
        "outreach": first_non_empty(records, "outreach"),
        "guide": first_non_empty(records, "guide"),
    }


def build_dashboard_payload_from_records(
    records: list[dict[str, Any]],
    report_meta: dict[str, Any],
    source_info: dict[str, Any],
    refresh_seconds: int,
    ai_meta: dict[str, Any],
    analytics_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not records:
        raise ValueError("报表中没有可用数据")

    revenue = sum(item["revenue"] for item in records)
    cost = sum(item["cost"] for item in records)
    profit = sum(item["profit"] for item in records)
    travellers = sum(item["travellers"] for item in records)
    group_count = len(records)
    margin = profit / revenue if revenue else 0.0
    average_profit = profit / group_count if group_count else 0.0
    average_revenue = revenue / group_count if group_count else 0.0
    average_revenue_per_traveller = revenue / travellers if travellers else 0.0
    average_profit_per_traveller = profit / travellers if travellers else 0.0
    cost_rate = cost / revenue if revenue else 0.0
    department = next((item["department"] for item in records if item["department"]), "旅游业务团队")
    trend = aggregate_daily(records)
    top_profit_groups = rank_groups(records, "profit", limit=5, reverse=True)
    top_margin_groups = rank_groups([item for item in records if item["revenue"] > 0], "margin", limit=5, reverse=True)
    guard_groups = rank_groups([item for item in records if item["revenue"] > 0], "margin", limit=3, reverse=False)
    owner_board = aggregate_dimension(records, "primary_owner", limit=5)
    line_board = aggregate_dimension(records, "line", limit=5)
    destination_board = aggregate_dimension(records, "destination", limit=5)
    source_region_board = aggregate_dimension([item for item in records if clean_text(item.get("source_region"))], "source_region", limit=5)
    best_day = max(trend, key=lambda item: item["profit"])
    best_profit_group = max(records, key=lambda item: item["profit"])
    best_margin_group = max(records, key=lambda item: item["margin"])
    primary_owner = owner_board[0] if owner_board else {"label": "团队协同", "profit": 0.0}
    morale_index = min(99, int(35 + margin * 160 + group_count * 1.3 + min(profit / 1500, 18)))

    payload = {
        "report": {
            "title": report_meta["title"],
            "period_text": report_meta["period_text"],
            "period_label": month_label(report_meta["period_start"] or report_meta["period_end"]),
            "period_start": report_meta["period_start"],
            "period_end": report_meta["period_end"],
            "export_time": report_meta["export_time"],
            "selected_month": report_meta.get("selected_month", ""),
            "selected_month_label": report_meta.get("selected_month_label", ""),
            "available_months": report_meta.get("available_months", []),
        },
        "summary": {
            "department": department,
            "groups": group_count,
            "travellers": travellers,
            "revenue": revenue,
            "cost": cost,
            "profit": profit,
            "margin": margin,
            "average_profit": average_profit,
            "average_revenue": average_revenue,
            "average_revenue_per_traveller": average_revenue_per_traveller,
            "average_profit_per_traveller": average_profit_per_traveller,
            "cost_rate": cost_rate,
            "morale_index": morale_index,
        },
        "spotlight": {
            "best_day": best_day,
            "best_profit_group": {
                "tour_no": best_profit_group["tour_no"],
                "line": best_profit_group["line"],
                "profit": best_profit_group["profit"],
                "margin": best_profit_group["margin"],
                "customer": best_profit_group["customer"],
            },
            "best_margin_group": {
                "tour_no": best_margin_group["tour_no"],
                "line": best_margin_group["line"],
                "profit": best_margin_group["profit"],
                "margin": best_margin_group["margin"],
                "customer": best_margin_group["customer"],
            },
            "primary_owner": primary_owner,
        },
        "leaderboards": {
            "daily_trend": trend,
            "top_profit_groups": top_profit_groups,
            "top_margin_groups": top_margin_groups,
            "guard_groups": guard_groups,
            "owner_board": owner_board,
            "line_board": line_board,
            "destination_board": destination_board,
            "source_region_board": source_region_board,
        },
        "status": {
            "source_file": source_info["path"],
            "source_name": source_info["name"],
            "source_mtime": source_info["mtime"],
            "generated_at": source_info["generated_at"],
            "refresh_seconds": refresh_seconds,
        },
        "ai": ai_meta,
        "analytics": analytics_context or {},
        "entry_defaults": build_entry_defaults(records, department),
    }
    fallback_analysis = build_fallback_analysis(payload)
    payload["briefing"] = {
        "fallback_text": fallback_analysis["summary"],
        "fallback_analysis": fallback_analysis,
        "ai_configured": bool(ai_meta.get("configured")),
    }
    return payload


def resolve_ai_meta(config: dict[str, Any]) -> dict[str, Any]:
    configured = bool(config["enabled"] and config["provider"] and config["base_url"] and config["api_key"] and config["model"])
    return {
        "configured": configured,
        "provider": clean_text(config.get("provider")) or "未配置",
        "model": clean_text(config.get("model")) or "未配置",
        "base_url": clean_text(config.get("base_url")),
        "source": clean_text(config.get("source")) or "direct",
        "task_type": clean_text(config.get("task_type")),
    }


def empty_ai_config(source: str = "direct") -> dict[str, Any]:
    return {
        "provider": "",
        "base_url": "",
        "model": "",
        "api_key_env": "AI_API_KEY",
        "api_key": "",
        "enabled": False,
        "temperature": 0.8,
        "max_tokens": 1600,
        "source": source,
        "task_type": "",
        "system_prompt": "",
        "json_mode": False,
    }


def resolve_direct_ai_config(ai_cfg: dict[str, Any], enabled: bool) -> dict[str, Any]:
    provider = os.getenv("PROVIDER") or os.getenv("FINANCE_AI_PROVIDER") or clean_text(ai_cfg.get("provider"))
    base_url = os.getenv("AI_BASE_URL") or os.getenv("OPENAI_BASE_URL") or clean_text(ai_cfg.get("base_url"))
    model = os.getenv("AI_MODEL") or os.getenv("OPENAI_MODEL") or clean_text(ai_cfg.get("model"))
    api_key_env = clean_text(ai_cfg.get("api_key_env") or "AI_API_KEY")
    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv(api_key_env) or ""
    temperature = ai_cfg.get("temperature", 0.8)
    try:
        temperature_value = float(temperature)
    except (TypeError, ValueError):
        temperature_value = 0.8
    config = empty_ai_config("direct")
    config.update(
        {
            "provider": provider,
            "base_url": base_url,
            "model": model,
            "api_key_env": api_key_env,
            "api_key": api_key,
            "enabled": enabled or bool(provider and base_url and api_key and model),
            "temperature": temperature_value,
        }
    )
    return config


def load_env_map(paths: list[str]) -> dict[str, str]:
    merged: dict[str, str] = {}
    for raw_path in paths:
        path = Path(raw_path).expanduser()
        if not path.exists():
            continue
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            merged[key.strip()] = value.strip().strip('"').strip("'")
    return merged


def run_command_capture(args: list[str]) -> str:
    try:
        completed = subprocess.run(args, capture_output=True, text=True, check=False)
    except FileNotFoundError as exc:
        raise RuntimeError(f"命令不可用: {args[0]}") from exc
    if completed.returncode != 0:
        raise RuntimeError((completed.stderr or completed.stdout or "命令执行失败").strip())
    return completed.stdout


def query_zuoyelang_sql(container: str, database: str, user: str, sql: str) -> list[str]:
    output = run_command_capture(
        [
            "docker",
            "exec",
            "-i",
            container,
            "psql",
            "-U",
            user,
            "-d",
            database,
            "-At",
            "-F",
            "\t",
            "-c",
            sql,
        ]
    )
    return [line.rstrip() for line in output.splitlines() if line.strip()]


def decrypt_zuoyelang_api_key(encrypted_value: str, iv_value: str, secret: str) -> str:
    encrypted_text = clean_text(encrypted_value)
    iv_text = clean_text(iv_value)
    secret_text = clean_text(secret)
    if not encrypted_text:
        return ""
    if encrypted_text.startswith("sk-"):
        return encrypted_text
    if "." not in encrypted_text or not iv_text or not secret_text:
        raise ValueError("AI Provider 密钥信息不完整")
    ciphertext_b64, tag_b64 = encrypted_text.split(".", 1)
    key = hashlib.sha256(secret_text.encode("utf-8")).digest()
    nonce = base64.b64decode(iv_text)
    ciphertext = base64.b64decode(ciphertext_b64) + base64.b64decode(tag_b64)
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    return AESGCM(key).decrypt(nonce, ciphertext, None).decode("utf-8")


def load_zuoyelang_ai_snapshot(ai_cfg: dict[str, Any]) -> dict[str, Any]:
    z_cfg = ai_cfg.get("zuoyelang", {}) if isinstance(ai_cfg.get("zuoyelang"), dict) else {}
    env_paths = parse_text_list(z_cfg.get("env_paths") or ["/opt/zuoyelang/.env", "/opt/zuting/api/.env"])
    env_map = load_env_map(env_paths)
    secret = clean_text(env_map.get("AI_KEY_ENCRYPTION_SECRET"))
    if not secret:
        return {"providers": [], "routes": [], "secret": "", "env_map": env_map}

    container = clean_text(z_cfg.get("db_container")) or "zuoyelang-postgres"
    database = clean_text(z_cfg.get("db_name")) or "zuoyelang"
    user = clean_text(z_cfg.get("db_user")) or "zuoyelang"
    cache_key = json.dumps(
        {
            "env_paths": env_paths,
            "container": container,
            "database": database,
            "user": user,
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    now = time.time()
    with ZUOYELANG_AI_CACHE_LOCK:
        cached = ZUOYELANG_AI_CACHE.get(cache_key)
        if cached and now - float(cached.get("timestamp", 0)) < AI_ROUTE_CACHE_SECONDS:
            return cached["snapshot"]

    provider_rows = query_zuoyelang_sql(
        container,
        database,
        user,
        """
        SELECT "id", "name", "displayName", "providerType", "baseUrl", "apiKeyEncrypted", "apiKeyIv",
               "defaultModel", "priority", "status", "isDefault"
        FROM ai_provider_configs
        ORDER BY "priority" ASC, "createdAt" ASC
        """,
    )
    route_rows = query_zuoyelang_sql(
        container,
        database,
        user,
        """
        SELECT "taskType", "providerId", "priority", COALESCE("modelOverride", ''),
               COALESCE("temperature"::text, ''), COALESCE("maxTokens"::text, ''),
               REGEXP_REPLACE(COALESCE("systemPrompt", ''), E'[\\n\\r\\t]+', ' ', 'g'),
               COALESCE("jsonMode"::text, 'false'), COALESCE("isActive"::text, 'false')
        FROM ai_route_configs
        ORDER BY "priority" ASC, "createdAt" ASC
        """,
    )

    providers: list[dict[str, Any]] = []
    for line in provider_rows:
        parts = line.split("\t")
        if len(parts) != 11:
            continue
        providers.append(
            {
                "id": clean_text(parts[0]),
                "name": clean_text(parts[1]),
                "display_name": clean_text(parts[2]),
                "provider_type": clean_text(parts[3]),
                "base_url": clean_text(parts[4]),
                "api_key_encrypted": clean_text(parts[5]),
                "api_key_iv": clean_text(parts[6]),
                "default_model": clean_text(parts[7]),
                "priority": int(to_number(parts[8])),
                "status": clean_text(parts[9]).upper(),
                "is_default": parse_bool(parts[10]),
            }
        )

    routes: list[dict[str, Any]] = []
    for line in route_rows:
        parts = line.split("\t")
        if len(parts) != 9:
            continue
        routes.append(
            {
                "task_type": clean_text(parts[0]).upper(),
                "provider_id": clean_text(parts[1]),
                "priority": int(to_number(parts[2])),
                "model_override": clean_text(parts[3]),
                "temperature": float(parts[4]) if clean_text(parts[4]) else None,
                "max_tokens": int(to_number(parts[5])) if clean_text(parts[5]) else None,
                "system_prompt": clean_text(parts[6]),
                "json_mode": parse_bool(parts[7]),
                "is_active": parse_bool(parts[8]),
            }
        )

    snapshot = {"providers": providers, "routes": routes, "secret": secret, "env_map": env_map}
    with ZUOYELANG_AI_CACHE_LOCK:
        ZUOYELANG_AI_CACHE[cache_key] = {"timestamp": now, "snapshot": snapshot}
    return snapshot


def resolve_zuoyelang_route_ai_config(ai_cfg: dict[str, Any], enabled: bool) -> dict[str, Any]:
    config = empty_ai_config("zuoyelang_route")
    task_types = [
        item.upper()
        for item in (
            parse_text_list(os.getenv("FINANCE_AI_TASK_TYPES"))
            or parse_text_list(ai_cfg.get("route_task_types"))
            or list(DEFAULT_AI_ROUTE_TASK_TYPES)
        )
    ]
    try:
        snapshot = load_zuoyelang_ai_snapshot(ai_cfg)
    except Exception:
        return config
    providers = [item for item in snapshot.get("providers", []) if clean_text(item.get("status")).upper() == "ACTIVE"]
    provider_by_id = {item["id"]: item for item in providers}
    routes = [item for item in snapshot.get("routes", []) if item.get("is_active")]
    selected_route: dict[str, Any] | None = None
    for task_type in task_types:
        candidates = [item for item in routes if item["task_type"] == task_type and item["provider_id"] in provider_by_id]
        if candidates:
            selected_route = sorted(candidates, key=lambda item: item["priority"])[0]
            break
    if selected_route is None:
        fallback_routes = [item for item in routes if item["provider_id"] in provider_by_id]
        if fallback_routes:
            selected_route = sorted(fallback_routes, key=lambda item: item["priority"])[0]
    if selected_route is None:
        return config

    provider = provider_by_id.get(selected_route["provider_id"])
    if not provider:
        return config
    try:
        api_key = decrypt_zuoyelang_api_key(
            provider.get("api_key_encrypted", ""),
            provider.get("api_key_iv", ""),
            snapshot.get("secret", ""),
        )
    except Exception:
        api_key = ""

    try:
        temperature_value = (
            float(selected_route["temperature"])
            if selected_route.get("temperature") is not None
            else float(ai_cfg.get("temperature", 0.8))
        )
    except (TypeError, ValueError):
        temperature_value = 0.8

    config.update(
        {
            "provider": provider.get("display_name") or provider.get("name") or "Zuoyelang Route AI",
            "base_url": provider.get("base_url", ""),
            "model": selected_route.get("model_override") or provider.get("default_model", ""),
            "api_key_env": "ZUOYELANG_ROUTE_CONFIG",
            "api_key": api_key,
            "enabled": enabled and bool(provider.get("base_url") and api_key and (selected_route.get("model_override") or provider.get("default_model"))),
            "temperature": temperature_value,
            "max_tokens": selected_route.get("max_tokens") or 1800,
            "task_type": selected_route.get("task_type", ""),
            "system_prompt": selected_route.get("system_prompt", ""),
            "json_mode": bool(selected_route.get("json_mode")),
        }
    )
    return config


def resolve_ai_config(raw_config: dict[str, Any]) -> dict[str, Any]:
    ai_cfg = raw_config.get("ai", {})
    raw_enabled = os.getenv("AI_ENABLED")
    enabled = parse_bool(raw_enabled, parse_bool(ai_cfg.get("enabled"), False)) if raw_enabled is not None else parse_bool(ai_cfg.get("enabled"), False)
    source = clean_text(os.getenv("FINANCE_AI_SOURCE") or ai_cfg.get("source") or "auto").lower()
    route_config = resolve_zuoyelang_route_ai_config(ai_cfg, enabled)
    direct_config = resolve_direct_ai_config(ai_cfg, enabled)
    if source == "zuoyelang_route":
        return route_config if route_config["enabled"] else direct_config
    if source == "direct":
        return direct_config
    if route_config["enabled"]:
        return route_config
    return direct_config


def load_dashboard_payload(report_path: Path, config_path: Path, month: str = "") -> dict[str, Any]:
    raw_config = load_config(config_path)
    storage_mode = storage_mode_from_config(raw_config)
    final_report_path = report_path_from_config(raw_config, report_path, config_path)
    final_sqlite_path = sqlite_path_from_config(raw_config, config_path)
    refresh_seconds = int(raw_config.get("refresh_seconds", 15) or 15)
    report_title = clean_text(raw_config.get("report_title")) or "旅游经营利润战报"
    if storage_mode == "sqlite":
        parsed = load_report_from_sqlite(final_sqlite_path, report_title)
        source_path = final_sqlite_path
    else:
        parsed = parse_report(final_report_path)
        source_path = final_report_path
    selected_records, month_meta = select_month_records(parsed["records"], month)
    period_text = build_period_text(selected_records)
    period_start, period_end = detect_period(period_text)
    display_period_text = period_text or parsed["period_text"]
    if month_meta.get("selected_month") not in ("", "all"):
        display_period_text = f"月份：{month_meta.get('selected_month_label')}"
    analytics_context = build_analytics_context(parsed["records"], selected_records, month_meta)
    ai_config = resolve_ai_config(raw_config)
    source_stat = source_path.stat()
    return build_dashboard_payload_from_records(
        selected_records,
        {
            "title": parsed["title"],
            "period_text": display_period_text,
            "period_start": period_start or parsed["period_start"],
            "period_end": period_end or parsed["period_end"],
            "export_time": parsed["export_time"],
            **month_meta,
        },
        {
            "path": str(source_path),
            "name": source_path.name,
            "mtime": datetime.fromtimestamp(source_stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        },
        refresh_seconds,
        resolve_ai_meta(ai_config),
        analytics_context,
    )


def chat_completion_url(base_url: str) -> str:
    trimmed = base_url.rstrip("/")
    if trimmed.endswith("/chat/completions"):
        return trimmed
    return f"{trimmed}/chat/completions"


def strip_thinking_prefix(text: str) -> str:
    return re.sub(r"<think>[\s\S]*?</think>\s*", "", clean_text(text)).strip()


def extract_message_text(payload: dict[str, Any]) -> str:
    choices = payload.get("choices") or []
    if not choices:
        raise ValueError("AI 返回结果缺少 choices")
    message = choices[0].get("message") or {}
    content = message.get("content", "")
    if isinstance(content, list):
        parts = [item.get("text", "") for item in content if isinstance(item, dict)]
        return strip_thinking_prefix("".join(parts))
    return strip_thinking_prefix(clean_text(content))


def build_ai_prompt_payload(payload: dict[str, Any]) -> dict[str, Any]:
    summary = payload["summary"]
    spotlight = payload["spotlight"]
    leaderboards = payload["leaderboards"]
    return {
        "department": summary["department"],
        "period": payload["report"]["period_text"] or payload["report"]["period_label"],
        "summary": {
            "groups": summary["groups"],
            "travellers": round(summary["travellers"], 2),
            "revenue": round(summary["revenue"], 2),
            "cost": round(summary["cost"], 2),
            "profit": round(summary["profit"], 2),
            "margin_pct": round(summary["margin"] * 100, 2),
            "avg_group_revenue": round(summary["average_revenue"], 2),
            "avg_group_profit": round(summary["average_profit"], 2),
            "avg_traveller_profit": round(summary["average_profit_per_traveller"], 2),
            "cost_rate_pct": round(summary["cost_rate"] * 100, 2),
        },
        "spotlight": {
            "best_day": spotlight["best_day"],
            "best_profit_group": spotlight["best_profit_group"],
            "best_margin_group": spotlight["best_margin_group"],
            "primary_owner": spotlight["primary_owner"],
        },
        "top_lines": leaderboards.get("line_board", [])[:5],
        "top_destinations": leaderboards.get("destination_board", [])[:5],
        "top_source_regions": leaderboards.get("source_region_board", [])[:5],
        "top_profit_groups": leaderboards.get("top_profit_groups", [])[:5],
        "top_margin_groups": leaderboards.get("top_margin_groups", [])[:5],
        "low_margin_groups": leaderboards.get("guard_groups", [])[:3],
        "daily_trend": leaderboards.get("daily_trend", [])[-10:],
    }


def extract_json_object(raw_text: str) -> dict[str, Any]:
    cleaned = strip_thinking_prefix(raw_text).strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("AI 未返回有效 JSON")
    return json.loads(cleaned[start : end + 1])


def normalize_insight_items(raw_items: Any, fallback_items: list[dict[str, str]], limit: int) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    if isinstance(raw_items, list):
        for item in raw_items:
            if isinstance(item, dict):
                title = clean_text(item.get("title") or item.get("name") or item.get("label"))
                detail = clean_text(item.get("detail") or item.get("reason") or item.get("description") or item.get("action"))
            else:
                title = clean_text(item)
                detail = ""
            if title:
                normalized.append({"title": title, "detail": detail})
            if len(normalized) >= limit:
                break
    return normalized if normalized else fallback_items[:limit]


def normalize_ai_analysis(raw_analysis: dict[str, Any], fallback_analysis: dict[str, Any]) -> dict[str, Any]:
    summary = clean_text(raw_analysis.get("summary") or raw_analysis.get("overview") or raw_analysis.get("text")) or fallback_analysis["summary"]
    return {
        "summary": summary,
        "route_focus": normalize_insight_items(raw_analysis.get("route_focus"), fallback_analysis["route_focus"], 3),
        "customer_regions": normalize_insight_items(raw_analysis.get("customer_regions"), fallback_analysis["customer_regions"], 3),
        "revenue_actions": normalize_insight_items(raw_analysis.get("revenue_actions"), fallback_analysis["revenue_actions"], 4),
        "profit_actions": normalize_insight_items(raw_analysis.get("profit_actions"), fallback_analysis["profit_actions"], 4),
        "risk_alerts": normalize_insight_items(raw_analysis.get("risk_alerts"), fallback_analysis["risk_alerts"], 2),
    }


def generate_ai_insight(payload: dict[str, Any], ai_config: dict[str, Any]) -> dict[str, Any]:
    fallback_analysis = payload["briefing"]["fallback_analysis"]
    prompt_payload = build_ai_prompt_payload(payload)
    system_prompt = (
        "你是旅游公司经营分析顾问，要根据经营战报输出可执行的营销、获客、创收和提利建议。"
        "请只返回 JSON，不要 Markdown，不要额外解释。"
        "JSON schema 必须为："
        "{"
        "\"summary\":\"80到140字的中文总结\","
        "\"route_focus\":[{\"title\":\"\",\"detail\":\"\"}],"
        "\"customer_regions\":[{\"title\":\"\",\"detail\":\"\"}],"
        "\"revenue_actions\":[{\"title\":\"\",\"detail\":\"\"}],"
        "\"profit_actions\":[{\"title\":\"\",\"detail\":\"\"}],"
        "\"risk_alerts\":[{\"title\":\"\",\"detail\":\"\"}]"
        "}。"
        "要求：route_focus 和 customer_regions 各 3 条，revenue_actions 和 profit_actions 各 4 条，risk_alerts 2 条；"
        "必须引用输入中的真实线路、客源地、目的地、利润率或冠军团信息，不要写空话。"
    )
    if clean_text(ai_config.get("system_prompt")):
        system_prompt = f"{clean_text(ai_config['system_prompt'])}\n\n{system_prompt}"
    request_body = {
        "model": ai_config["model"],
        "temperature": ai_config["temperature"],
        "max_tokens": int(ai_config.get("max_tokens") or 1800),
        "stream": False,
        "chat_template_kwargs": {"enable_thinking": False},
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": json.dumps(prompt_payload, ensure_ascii=False),
            },
        ],
    }
    body = json.dumps(request_body, ensure_ascii=False).encode("utf-8")
    req = request.Request(
        chat_completion_url(ai_config["base_url"]),
        data=body,
        headers={
            "Authorization": f"Bearer {ai_config['api_key']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with request.urlopen(req, timeout=25) as response:
        raw = response.read().decode("utf-8")
    parsed = json.loads(raw)
    text = extract_message_text(parsed)
    if not text:
        raise ValueError("AI 返回内容为空")
    return normalize_ai_analysis(extract_json_object(text), fallback_analysis)


def generate_tour_no(start_date: str, records: list[dict[str, Any]]) -> str:
    prefix = datetime.strptime(start_date, "%Y-%m-%d").strftime("%y%m%d")
    existing = {clean_text(record.get("tour_no")) for record in records}
    counter = 1
    while True:
        candidate = f"{prefix}-{counter}A"
        if candidate not in existing:
            return candidate
        counter += 1


def build_record_from_form_input(payload: dict[str, Any], parsed_report: dict[str, Any]) -> dict[str, Any]:
    records = parsed_report.get("records", [])
    start_date = require_iso_date(payload.get("start_date"), "发团日期")
    end_date_input = clean_text(payload.get("end_date"))
    end_date = require_iso_date(end_date_input, "散团日期") if end_date_input else start_date
    business_type = clean_text(payload.get("business_type")) or first_non_empty(records, "business_type", "业务部款项")
    department = clean_text(payload.get("department")) or first_non_empty(records, "department", "旅游业务团队")
    adults = parse_non_negative_count(payload.get("adults"), "成人")
    elders = parse_non_negative_count(payload.get("elders"), "老人")
    children = parse_non_negative_count(payload.get("children"), "儿童")
    full_escort = parse_non_negative_count(payload.get("full_escort"), "全陪")
    revenue = require_non_negative_number(payload.get("revenue"), "收入")
    cost = require_non_negative_number(payload.get("cost"), "成本")
    profit = round(revenue - cost, 2)
    travellers = adults + elders + children
    per_capita_profit = round(profit / travellers, 2) if travellers else 0.0
    margin = round(profit / revenue, 8) if revenue else 0.0
    tour_no = clean_text(payload.get("tour_no")) or generate_tour_no(start_date, records)

    base_raw = {header: "" for header in parsed_report.get("headers", STANDARD_HEADERS)}
    record = {
        "sequence": str(len(records) + 1),
        "tour_no": tour_no,
        "business_type": business_type,
        "group_no": clean_text(payload.get("group_no")),
        "department": department,
        "start_date": start_date,
        "end_date": end_date,
        "customer": require_text(payload.get("customer"), "客户"),
        "contact": clean_text(payload.get("contact")),
        "source_region": clean_text(payload.get("source_region")),
        "line": require_text(payload.get("line"), "线路"),
        "destination": clean_text(payload.get("destination")),
        "adults": adults,
        "elders": elders,
        "children": children,
        "full_escort": full_escort,
        "travellers": travellers,
        "guest_note": clean_text(payload.get("guest_note")),
        "agency_tour_no": clean_text(payload.get("agency_tour_no")),
        "guide": clean_text(payload.get("guide")),
        "receiving_coordinator": clean_text(payload.get("receiving_coordinator")),
        "operations_coordinator": clean_text(payload.get("operations_coordinator")),
        "signup_coordinator": clean_text(payload.get("signup_coordinator")),
        "outreach": clean_text(payload.get("outreach")),
        "primary_owner": "",
        "revenue": revenue,
        "cost": cost,
        "profit": profit,
        "per_capita_profit": per_capita_profit,
        "margin": margin,
        "raw_row": base_raw,
    }
    record["primary_owner"] = derive_primary_owner(
        {
            "接团计调": record["receiving_coordinator"],
            "操作计调": record["operations_coordinator"],
            "报名计调": record["signup_coordinator"],
            "外联": record["outreach"],
            "导游": record["guide"],
        }
    )
    return record


def build_data_row_dict(record: dict[str, Any], sequence: int, headers: list[str]) -> dict[str, Any]:
    row = {header: "" for header in headers}
    row.update(record.get("raw_row") or {})
    row["序号"] = sequence
    row["团号"] = clean_text(record.get("tour_no"))
    row["业务分类"] = clean_text(record.get("business_type"))
    row["组号"] = clean_text(record.get("group_no"))
    row["部门"] = clean_text(record.get("department"))
    row["发团"] = clean_text(record.get("start_date"))
    row["散团"] = clean_text(record.get("end_date"))
    row["客户"] = clean_text(record.get("customer"))
    row["联系人"] = clean_text(record.get("contact"))
    row["客源地"] = clean_text(record.get("source_region"))
    row["线路"] = clean_text(record.get("line"))
    row["目的地"] = clean_text(record.get("destination"))
    row["成人"] = int(round(float(record.get("adults", 0.0))))
    row["老人"] = int(round(float(record.get("elders", 0.0))))
    row["儿童"] = int(round(float(record.get("children", 0.0))))
    row["全陪"] = int(round(float(record.get("full_escort", 0.0))))
    row["客人"] = clean_text(record.get("guest_note"))
    row["组团社团号"] = clean_text(record.get("agency_tour_no"))
    row["导游"] = clean_text(record.get("guide"))
    row["接团计调"] = clean_text(record.get("receiving_coordinator"))
    row["操作计调"] = clean_text(record.get("operations_coordinator"))
    row["报名计调"] = clean_text(record.get("signup_coordinator"))
    row["外联"] = clean_text(record.get("outreach"))
    row["收入"] = round(float(record.get("revenue", 0.0)), 2)
    row["成本"] = round(float(record.get("cost", 0.0)), 2)
    row["单团利润"] = round(float(record.get("profit", 0.0)), 2)
    row["人均利润"] = round(float(record.get("per_capita_profit", 0.0)), 2)
    row["利润率"] = format_margin_text(float(record.get("margin", 0.0)))
    row["合计收入"] = row["收入"]
    row["合计成本"] = row["成本"]
    row["合计利润"] = row["单团利润"]
    row["合计人均利润"] = row["人均利润"]
    row["合计利润率"] = row["利润率"]
    return row


def build_total_row(records: list[dict[str, Any]], headers: list[str]) -> dict[str, Any]:
    row = {header: "" for header in headers}
    adults = sum(float(record.get("adults", 0.0)) for record in records)
    elders = sum(float(record.get("elders", 0.0)) for record in records)
    children = sum(float(record.get("children", 0.0)) for record in records)
    full_escort = sum(float(record.get("full_escort", 0.0)) for record in records)
    travellers = sum(float(record.get("travellers", 0.0)) for record in records)
    revenue = round(sum(float(record.get("revenue", 0.0)) for record in records), 2)
    cost = round(sum(float(record.get("cost", 0.0)) for record in records), 2)
    profit = round(sum(float(record.get("profit", 0.0)) for record in records), 2)
    per_capita_profit = round(profit / travellers, 2) if travellers else 0.0
    margin = profit / revenue if revenue else 0.0
    row["序号"] = TOTAL_ROW_MARKER
    row["成人"] = int(round(adults))
    row["老人"] = int(round(elders))
    row["儿童"] = int(round(children))
    row["全陪"] = int(round(full_escort))
    row["收入"] = revenue
    row["成本"] = cost
    row["单团利润"] = profit
    row["人均利润"] = per_capita_profit
    row["利润率"] = format_margin_text(margin)
    row["合计收入"] = revenue
    row["合计成本"] = cost
    row["合计利润"] = profit
    row["合计人均利润"] = per_capita_profit
    row["合计利润率"] = row["利润率"]
    return row


def build_export_row(headers: list[str]) -> dict[str, Any]:
    row = {header: "" for header in headers}
    row[headers[0]] = f"导出时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}"
    return row


def normalize_sheet_value(header: str, value: Any) -> Any:
    if value in (None, ""):
        return ""
    if header in COUNT_COLUMNS:
        text = clean_text(value)
        if text and not re.fullmatch(r"-?\d+(?:\.\d+)?", text):
            return text
        number = to_number(value)
        return int(number) if float(number).is_integer() else number
    if header in MONEY_COLUMNS:
        number = round(to_number(value), 2)
        return int(number) if float(number).is_integer() else number
    if header in PERCENT_COLUMNS:
        return clean_text(value)
    return value


def build_xlwt_styles(xlwt: Any) -> dict[str, Any]:
    return {
        "title": xlwt.easyxf(
            "font: bold on, height 360; align: horiz center, vert center;"
            "pattern: pattern solid, fore_colour ice_blue; borders: left thin, right thin, top thin, bottom thin;"
        ),
        "subtitle": xlwt.easyxf(
            "font: bold on, height 240; align: horiz left, vert center;"
            "pattern: pattern solid, fore_colour pale_blue; borders: left thin, right thin, top thin, bottom thin;"
        ),
        "header": xlwt.easyxf(
            "font: bold on, colour white; align: horiz center, vert center, wrap on;"
            "pattern: pattern solid, fore_colour teal; borders: left thin, right thin, top thin, bottom thin;"
        ),
        "text": xlwt.easyxf("align: horiz left, vert center, wrap on; borders: left thin, right thin, top thin, bottom thin;"),
        "center": xlwt.easyxf("align: horiz center, vert center, wrap on; borders: left thin, right thin, top thin, bottom thin;"),
        "count": xlwt.easyxf("align: horiz center, vert center; borders: left thin, right thin, top thin, bottom thin;", num_format_str="0"),
        "money": xlwt.easyxf("align: horiz right, vert center; borders: left thin, right thin, top thin, bottom thin;", num_format_str="#,##0.00"),
        "total_text": xlwt.easyxf(
            "font: bold on; align: horiz center, vert center, wrap on;"
            "pattern: pattern solid, fore_colour light_yellow; borders: left thin, right thin, top thin, bottom thin;"
        ),
        "total_center": xlwt.easyxf(
            "font: bold on; align: horiz center, vert center, wrap on;"
            "pattern: pattern solid, fore_colour light_yellow; borders: left thin, right thin, top thin, bottom thin;"
        ),
        "total_count": xlwt.easyxf(
            "font: bold on; align: horiz center, vert center;"
            "pattern: pattern solid, fore_colour light_yellow; borders: left thin, right thin, top thin, bottom thin;",
            num_format_str="0",
        ),
        "total_money": xlwt.easyxf(
            "font: bold on; align: horiz right, vert center;"
            "pattern: pattern solid, fore_colour light_yellow; borders: left thin, right thin, top thin, bottom thin;",
            num_format_str="#,##0.00",
        ),
        "export": xlwt.easyxf(
            "font: italic on; align: horiz left, vert center;"
            "pattern: pattern solid, fore_colour gray25; borders: left thin, right thin, top thin, bottom thin;"
        ),
    }


def style_for_cell(header: str, row_kind: str, styles: dict[str, Any]) -> Any:
    if row_kind == "export":
        return styles["export"]
    if row_kind == "total":
        if header in COUNT_COLUMNS:
            return styles["total_count"]
        if header in MONEY_COLUMNS:
            return styles["total_money"]
        if header in CENTER_COLUMNS or header in PERCENT_COLUMNS or header == "序号":
            return styles["total_center"]
        return styles["total_text"]
    if header in COUNT_COLUMNS:
        return styles["count"]
    if header in MONEY_COLUMNS:
        return styles["money"]
    if header in CENTER_COLUMNS or header in PERCENT_COLUMNS:
        return styles["center"]
    return styles["text"]


def write_row(sheet: Any, row_index: int, headers: list[str], row: dict[str, Any], row_kind: str, styles: dict[str, Any]) -> None:
    for col_index, header in enumerate(headers):
        value = normalize_sheet_value(header, row.get(header, ""))
        sheet.write(row_index, col_index, value, style_for_cell(header, row_kind, styles))


def write_report_file(report_path: Path, report_title: str, records: list[dict[str, Any]], headers: list[str]) -> None:
    if not records:
        raise ValueError("至少需要一条记录才能写入报表")

    xlwt = load_xlwt()
    workbook = xlwt.Workbook(encoding="utf-8")
    sheet = workbook.add_sheet("Sheet0", cell_overwrite_ok=True)
    styles = build_xlwt_styles(xlwt)
    last_column = max(len(headers) - 1, 0)

    for col_index, header in enumerate(headers):
        sheet.col(col_index).width = COLUMN_WIDTHS.get(header, 3600)

    sheet.panes_frozen = True
    sheet.horz_split_pos = 3
    sheet.remove_splits = True

    sheet.write_merge(0, 0, 0, last_column, report_title or "旅游经营利润战报", styles["title"])
    sheet.write_merge(1, 1, 0, last_column, build_period_text(records) or "日期：未标注", styles["subtitle"])

    for col_index, header in enumerate(headers):
        sheet.write(HEADER_ROW_INDEX, col_index, header, styles["header"])

    sheet.row(0).height_mismatch = True
    sheet.row(0).height = 520
    sheet.row(1).height_mismatch = True
    sheet.row(1).height = 420
    sheet.row(HEADER_ROW_INDEX).height_mismatch = True
    sheet.row(HEADER_ROW_INDEX).height = 460

    data_rows = [build_data_row_dict(record, index + 1, headers) for index, record in enumerate(records)]
    current_row = DATA_ROW_START_INDEX
    for data_row in data_rows:
        write_row(sheet, current_row, headers, data_row, "data", styles)
        current_row += 1

    total_row = build_total_row(records, headers)
    export_row = build_export_row(headers)
    write_row(sheet, current_row, headers, total_row, "total", styles)
    current_row += 1
    write_row(sheet, current_row, headers, export_row, "export", styles)

    if report_path.exists():
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        backup_path = BACKUP_DIR / f"{report_path.stem}-{datetime.now().strftime('%Y%m%d-%H%M%S')}{report_path.suffix}"
        shutil.copy2(report_path, backup_path)

    report_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(delete=False, dir=str(report_path.parent), suffix=report_path.suffix) as handle:
        temp_path = Path(handle.name)
    try:
        workbook.save(str(temp_path))
        os.replace(temp_path, report_path)
    finally:
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)


def append_record_to_report(report_path: Path, payload: dict[str, Any]) -> dict[str, Any]:
    parsed_report = parse_report(report_path)
    new_record = build_record_from_form_input(payload, parsed_report)
    all_records = parsed_report["records"] + [new_record]
    headers = parsed_report.get("headers") or list(STANDARD_HEADERS)
    write_report_file(report_path, parsed_report["title"], all_records, headers)
    return {
        "record": {
            "tour_no": new_record["tour_no"],
            "customer": new_record["customer"],
            "line": new_record["line"],
            "revenue": new_record["revenue"],
            "cost": new_record["cost"],
            "profit": new_record["profit"],
        },
        "backup_dir": str(BACKUP_DIR),
    }


class FinanceDashboardHandler(BaseHTTPRequestHandler):
    app: "FinanceDashboardApp"

    def do_GET(self) -> None:
        parsed_url = parse.urlparse(self.path)
        path = parsed_url.path
        if self.app.matches_route(path, "/login"):
            if self.app.is_authenticated(self.headers.get("Cookie", "")):
                self.respond_redirect(self.app.root_path())
                return
            params = parse.parse_qs(parsed_url.query, keep_blank_values=True)
            error_text = clean_text((params.get("error") or [""])[-1])
            next_path = clean_text((params.get("next") or [""])[-1])
            self.respond_html(self.app.render_login(error_text, next_path))
            return
        if self.app.matches_route(path, "/logout"):
            self.respond_redirect(
                self.app.login_location(),
                extra_headers=[("Set-Cookie", self.app.clear_auth_cookie_header())],
            )
            return
        if not self.ensure_authorized(path):
            return
        if self.app.matches_route(path, "/"):
            self.respond_html(self.app.render_html())
            return
        if self.app.matches_route(path, "/compare"):
            self.respond_html(self.app.render_compare_html())
            return
        if self.app.matches_route(path, "/api/dashboard"):
            try:
                params = parse.parse_qs(parsed_url.query, keep_blank_values=True)
                self.respond_json(self.app.dashboard((params.get("month") or [""])[-1]))
            except Exception as exc:  # pragma: no cover - defensive path
                self.respond_json({"error": str(exc)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return
        self.respond_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        parsed_url = parse.urlparse(self.path)
        path = parsed_url.path
        if self.app.matches_route(path, "/login"):
            form = self.read_form_body()
            next_path = self.app.normalize_redirect_target(form.get("next", ""))
            if self.app.verify_password(form.get("password", "")):
                self.respond_redirect(
                    next_path,
                    extra_headers=[("Set-Cookie", self.app.auth_cookie_header())],
                )
                return
            self.respond_html(
                self.app.render_login("密码不正确，请重新输入。", next_path),
                status=HTTPStatus.UNAUTHORIZED,
            )
            return
        if not self.ensure_authorized(path):
            return
        if self.app.matches_route(path, "/api/ai-briefing"):
            try:
                params = parse.parse_qs(parsed_url.query, keep_blank_values=True)
                self.respond_json(self.app.ai_briefing((params.get("month") or [""])[-1]))
            except Exception as exc:  # pragma: no cover - defensive path
                self.respond_json({"error": str(exc)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return
        if self.app.matches_route(path, "/api/records"):
            try:
                params = parse.parse_qs(parsed_url.query, keep_blank_values=True)
                self.respond_json(self.app.add_record(self.read_json_body(), (params.get("month") or [""])[-1]))
            except ValueError as exc:
                self.respond_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
            except Exception as exc:  # pragma: no cover - defensive path
                self.respond_json({"error": str(exc)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return
        self.respond_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length) if length else b"{}"
        parsed_body = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        if not isinstance(parsed_body, dict):
            raise ValueError("请求体必须是 JSON 对象")
        return parsed_body

    def read_form_body(self) -> dict[str, str]:
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length).decode("utf-8") if length else ""
        parsed_form = parse.parse_qs(raw_body, keep_blank_values=True)
        return {key: clean_text(values[-1] if values else "") for key, values in parsed_form.items()}

    def ensure_authorized(self, path: str) -> bool:
        if not self.app.auth_required():
            return True
        if self.app.is_authenticated(self.headers.get("Cookie", "")):
            return True
        if self.app.is_api_route(path):
            self.respond_json(
                {"error": "Unauthorized", "login_required": True},
                status=HTTPStatus.UNAUTHORIZED,
            )
            return False
        self.respond_redirect(self.app.login_location(self.path))
        return False

    def log_message(self, format: str, *args: Any) -> None:
        return

    def respond_html(self, payload: str, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = payload.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def respond_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def respond_redirect(
        self,
        location: str,
        status: HTTPStatus = HTTPStatus.FOUND,
        extra_headers: list[tuple[str, str]] | None = None,
    ) -> None:
        self.send_response(status)
        self.send_header("Location", location)
        for key, value in extra_headers or []:
            self.send_header(key, value)
        self.end_headers()


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


class FinanceDashboardApp:
    def __init__(self, report_path: Path, config_path: Path) -> None:
        self.report_path = report_path
        self.config_path = config_path
        self.raw_config = load_config(config_path)
        self.storage_mode = storage_mode_from_config(self.raw_config)
        self.sqlite_path = sqlite_path_from_config(self.raw_config, config_path)
        self.base_path = normalize_base_path(self.raw_config.get("base_path"))
        self.access_password = clean_text(os.getenv("FINANCE_DASHBOARD_PASSWORD") or self.raw_config.get("access_password"))
        self.cookie_name = AUTH_COOKIE_NAME
        self.report_title = clean_text(self.raw_config.get("report_title")) or "旅游经营利润战报"
        self._lock = threading.Lock()
        self._ai_cache: dict[str, Any] = {}

    def matches_route(self, request_path: str, suffix: str) -> bool:
        if suffix == "/":
            candidates = {"/"}
            if self.base_path:
                candidates.add(self.base_path)
                candidates.add(f"{self.base_path}/")
            return request_path in candidates
        expected = f"{self.base_path}{suffix}" if self.base_path else suffix
        return request_path == expected

    def root_path(self) -> str:
        return self.base_path or "/"

    def login_path(self) -> str:
        return f"{self.base_path}/login" if self.base_path else "/login"

    def is_api_route(self, request_path: str) -> bool:
        api_prefix = f"{self.base_path}/api/" if self.base_path else "/api/"
        return request_path.startswith(api_prefix) or self.matches_route(request_path, "/api/dashboard")

    def auth_required(self) -> bool:
        return bool(self.access_password)

    def verify_password(self, candidate: str) -> bool:
        if not self.auth_required():
            return True
        return hmac.compare_digest(clean_text(candidate), self.access_password)

    def auth_token(self) -> str:
        secret = hashlib.sha256(
            f"{self.access_password}|{self.base_path}|finance-dashboard".encode("utf-8")
        ).digest()
        signature = hmac.new(secret, b"authorized", hashlib.sha256).hexdigest()
        return f"v1.{signature}"

    def is_authenticated(self, cookie_header: str) -> bool:
        if not self.auth_required():
            return True
        if not cookie_header:
            return False
        try:
            cookie = SimpleCookie()
            cookie.load(cookie_header)
        except Exception:
            return False
        morsel = cookie.get(self.cookie_name)
        if not morsel:
            return False
        return hmac.compare_digest(morsel.value, self.auth_token())

    def auth_cookie_header(self) -> str:
        cookie_path = self.base_path or "/"
        return (
            f"{self.cookie_name}={self.auth_token()}; "
            f"Max-Age={AUTH_COOKIE_TTL_SECONDS}; Path={cookie_path}; HttpOnly; SameSite=Lax"
        )

    def clear_auth_cookie_header(self) -> str:
        cookie_path = self.base_path or "/"
        return (
            f"{self.cookie_name}=; Max-Age=0; Path={cookie_path}; HttpOnly; SameSite=Lax"
        )

    def normalize_redirect_target(self, raw_target: str) -> str:
        target = clean_text(raw_target)
        if not target:
            return self.root_path()
        parsed_target = parse.urlparse(target)
        if parsed_target.scheme or parsed_target.netloc:
            return self.root_path()
        path = parsed_target.path or self.root_path()
        if self.base_path:
            if path != self.base_path and not path.startswith(f"{self.base_path}/"):
                return self.root_path()
        elif not path.startswith("/"):
            return self.root_path()
        query = f"?{parsed_target.query}" if parsed_target.query else ""
        return f"{path}{query}"

    def login_location(self, next_path: str = "", error_text: str = "") -> str:
        params: dict[str, str] = {}
        next_value = self.normalize_redirect_target(next_path)
        if next_value and next_value != self.login_path():
            params["next"] = next_value
        if error_text:
            params["error"] = error_text
        query = parse.urlencode(params)
        return f"{self.login_path()}?{query}" if query else self.login_path()

    def render_login(self, error_text: str = "", next_path: str = "") -> str:
        safe_next = self.normalize_redirect_target(next_path)
        if safe_next == self.login_path():
            safe_next = self.root_path()
        error_block = ""
        if error_text:
            error_block = f'<div class="error">{html.escape(error_text)}</div>'
        return (
            LOGIN_PAGE_TEMPLATE
            .replace("__ERROR_BLOCK__", error_block)
            .replace("__LOGIN_ACTION__", html.escape(self.login_path()))
            .replace("__NEXT_VALUE__", html.escape(safe_next))
        )

    def render_html(self) -> str:
        return HTML_TEMPLATE.replace("__BASE_PATH__", self.base_path)

    def render_compare_html(self) -> str:
        return COMPARE_TEMPLATE.replace("__BASE_PATH__", self.base_path)

    def dashboard(self, month: str = "") -> dict[str, Any]:
        with self._lock:
            return load_dashboard_payload(self.report_path, self.config_path, month)

    def ai_briefing(self, month: str = "") -> dict[str, Any]:
        payload = self.dashboard(month)
        raw_config = load_config(self.config_path)
        ai_config = resolve_ai_config(raw_config)
        ai_meta = payload["ai"]
        if not ai_meta["configured"]:
            return {
                "ok": True,
                "used_ai": False,
                "text": payload["briefing"]["fallback_text"],
                "analysis": payload["briefing"]["fallback_analysis"],
                "provider": ai_meta["provider"],
                "model": ai_meta["model"],
                "task_type": ai_meta.get("task_type", ""),
                "reason": "AI 未就绪，已返回本地经营洞察。",
            }

        signature = (
            payload["status"]["source_mtime"],
            ai_meta["provider"],
            ai_meta["model"],
            ai_meta.get("task_type", ""),
        )
        now = time.time()
        with self._lock:
            if (
                self._ai_cache
                and self._ai_cache.get("signature") == signature
                and now - float(self._ai_cache.get("timestamp", 0)) < AI_CACHE_SECONDS
            ):
                return self._ai_cache["payload"]

        try:
            analysis = generate_ai_insight(payload, ai_config)
            response_payload = {
                "ok": True,
                "used_ai": True,
                "text": analysis["summary"],
                "analysis": analysis,
                "provider": ai_meta["provider"],
                "model": ai_meta["model"],
                "task_type": ai_meta.get("task_type", ""),
            }
        except (ValueError, error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            response_payload = {
                "ok": True,
                "used_ai": False,
                "text": payload["briefing"]["fallback_text"],
                "analysis": payload["briefing"]["fallback_analysis"],
                "provider": ai_meta["provider"],
                "model": ai_meta["model"],
                "task_type": ai_meta.get("task_type", ""),
                "reason": f"AI 经营洞察失败，已回退为本地经营洞察：{exc}",
            }

        with self._lock:
            self._ai_cache = {
                "signature": signature,
                "timestamp": now,
                "payload": response_payload,
            }
        return response_payload

    def add_record(self, payload: dict[str, Any], month: str = "") -> dict[str, Any]:
        with self._lock:
            if self.storage_mode == "sqlite":
                result = append_record_to_sqlite(self.sqlite_path, payload, self.report_title)
                message = "已写入独立数据库并刷新战报。"
            else:
                result = append_record_to_report(self.report_path, payload)
                message = "已写入 Excel 并刷新战报。"
            self._ai_cache = {}
            dashboard = load_dashboard_payload(self.report_path, self.config_path, month)
            return {
                "ok": True,
                "message": message,
                "record": result["record"],
                "backup_dir": result["backup_dir"],
                "dashboard": dashboard,
            }


def build_handler(app: FinanceDashboardApp) -> type[FinanceDashboardHandler]:
    class BoundHandler(FinanceDashboardHandler):
        pass

    BoundHandler.app = app
    return BoundHandler


def serve_app(args: argparse.Namespace) -> None:
    config_path = Path(args.config).expanduser()
    app = FinanceDashboardApp(Path(args.report_file).expanduser(), config_path)
    server = ReusableThreadingHTTPServer((args.host, args.port), build_handler(app))
    address = f"http://{args.host}:{args.port}"
    browser_address = f"{address}{app.base_path}" if app.base_path else address
    print(f"Finance dashboard listening on {address} (entry: {browser_address or address})")
    if args.open_browser:
        webbrowser.open(browser_address or address)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()


def main() -> None:
    args = parse_args()
    if args.command == "serve":
        serve_app(args)
        return
    if args.command == "print":
        payload = load_dashboard_payload(Path(args.report_file).expanduser(), Path(args.config).expanduser())
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return
    if args.command == "seed-sqlite":
        config_path = Path(args.config).expanduser()
        raw_config = load_config(config_path)
        report_path = report_path_from_config(raw_config, Path(args.report_file).expanduser(), config_path)
        sqlite_path = Path(args.sqlite_path).expanduser()
        if sqlite_path == DEFAULT_SQLITE_PATH.expanduser():
            sqlite_path = sqlite_path_from_config(raw_config, config_path)
        result = seed_sqlite_from_report(report_path, sqlite_path)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    raise ValueError(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    main()
