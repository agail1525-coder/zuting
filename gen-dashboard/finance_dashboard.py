#!/usr/bin/env python3
import argparse
import hashlib
import hmac
import html
import json
import os
import re
import shutil
import sqlite3
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
VENDOR_DIR = PROJECT_ROOT / ".vendor-finance"
DEFAULT_CONFIG_PATH = PROJECT_ROOT / "config" / "finance-dashboard.json"
DEFAULT_REPORT_PATH = Path.home() / "Desktop" / "业务六部4月毛利表.xls"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 47837
HEADER_ROW_INDEX = 2
DATA_ROW_START_INDEX = 3
ROLE_FIELDS = ["接团计调", "操作计调", "报名计调", "外联", "导游"]
TOTAL_ROW_MARKER = "合计"
AI_CACHE_SECONDS = 300
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
BACKUP_DIR = PROJECT_ROOT / ".shortcut-center-env" / "data" / "finance-dashboard" / "backups"
DEFAULT_SQLITE_PATH = PROJECT_ROOT / ".shortcut-center-env" / "data" / "finance-dashboard" / "finance-dashboard.db"
DEFAULT_STORAGE_MODE = "excel"
AUTH_COOKIE_NAME = "gen_dashboard_auth"
AUTH_COOKIE_TTL_SECONDS = 43200
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
            "provider": "",
            "base_url": "",
            "api_key_env": "AI_API_KEY",
            "model": "",
            "temperature": 0.8,
            "enabled": False,
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


def build_fallback_briefing(payload: dict[str, Any]) -> str:
    summary = payload["summary"]
    spotlight = payload["spotlight"]
    best_day = spotlight["best_day"]
    champion = spotlight["best_profit_group"]
    return (
        f"{summary['department']}在{payload['report']['period_label']}累计创收{human_wan(summary['revenue'])}，"
        f"累计利润{human_wan(summary['profit'])}，利润率达到{summary['margin'] * 100:.2f}%。"
        f"利润峰值出现在{short_date(best_day['date'])}，单日贡献{best_day['profit']:,.0f}元；"
        f"冠军团为“{champion['line'] or champion['tour_no']}”，继续保持高毛利打法，把好利润做成团队士气。"
    )


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
    department = next((item["department"] for item in records if item["department"]), "旅游业务团队")
    trend = aggregate_daily(records)
    top_profit_groups = rank_groups(records, "profit", limit=5, reverse=True)
    top_margin_groups = rank_groups([item for item in records if item["revenue"] > 0], "margin", limit=5, reverse=True)
    guard_groups = rank_groups([item for item in records if item["revenue"] > 0], "margin", limit=3, reverse=False)
    owner_board = aggregate_dimension(records, "primary_owner", limit=5)
    line_board = aggregate_dimension(records, "line", limit=5)
    destination_board = aggregate_dimension(records, "destination", limit=5)
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
        },
        "status": {
            "source_file": source_info["path"],
            "source_name": source_info["name"],
            "source_mtime": source_info["mtime"],
            "generated_at": source_info["generated_at"],
            "refresh_seconds": refresh_seconds,
        },
        "ai": ai_meta,
        "entry_defaults": build_entry_defaults(records, department),
    }
    payload["briefing"] = {
        "fallback_text": build_fallback_briefing(payload),
        "ai_configured": bool(ai_meta.get("configured")),
    }
    return payload


def resolve_ai_meta(config: dict[str, Any]) -> dict[str, Any]:
    configured = bool(config["enabled"] and config["provider"] and config["base_url"] and config["api_key"] and config["model"])
    return {
        "configured": configured,
        "provider": config["provider"] or "未配置",
        "model": config["model"] or "未配置",
        "base_url": config["base_url"],
    }


def resolve_ai_config(raw_config: dict[str, Any]) -> dict[str, Any]:
    ai_cfg = raw_config.get("ai", {})
    provider = os.getenv("PROVIDER") or os.getenv("FINANCE_AI_PROVIDER") or clean_text(ai_cfg.get("provider"))
    base_url = os.getenv("AI_BASE_URL") or os.getenv("OPENAI_BASE_URL") or clean_text(ai_cfg.get("base_url"))
    model = os.getenv("AI_MODEL") or os.getenv("OPENAI_MODEL") or clean_text(ai_cfg.get("model"))
    api_key_env = clean_text(ai_cfg.get("api_key_env") or "AI_API_KEY")
    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv(api_key_env) or ""
    raw_enabled = os.getenv("AI_ENABLED")
    if raw_enabled is None:
        enabled = bool(ai_cfg.get("enabled", False))
    else:
        enabled = raw_enabled.lower() in {"1", "true", "yes", "on"}
    temperature = ai_cfg.get("temperature", 0.8)
    try:
        temperature_value = float(temperature)
    except (TypeError, ValueError):
        temperature_value = 0.8
    return {
        "provider": provider,
        "base_url": base_url,
        "model": model,
        "api_key_env": api_key_env,
        "api_key": api_key,
        "enabled": enabled or bool(provider and base_url and api_key and model),
        "temperature": temperature_value,
    }


def load_dashboard_payload(report_path: Path, config_path: Path) -> dict[str, Any]:
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
    ai_config = resolve_ai_config(raw_config)
    source_stat = source_path.stat()
    return build_dashboard_payload_from_records(
        parsed["records"],
        {
            "title": parsed["title"],
            "period_text": parsed["period_text"],
            "period_start": parsed["period_start"],
            "period_end": parsed["period_end"],
            "export_time": parsed["export_time"],
        },
        {
            "path": str(source_path),
            "name": source_path.name,
            "mtime": datetime.fromtimestamp(source_stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        },
        refresh_seconds,
        resolve_ai_meta(ai_config),
    )


def chat_completion_url(base_url: str) -> str:
    trimmed = base_url.rstrip("/")
    if trimmed.endswith("/chat/completions"):
        return trimmed
    return f"{trimmed}/chat/completions"


def extract_message_text(payload: dict[str, Any]) -> str:
    choices = payload.get("choices") or []
    if not choices:
        raise ValueError("AI 返回结果缺少 choices")
    message = choices[0].get("message") or {}
    content = message.get("content", "")
    if isinstance(content, list):
        parts = [item.get("text", "") for item in content if isinstance(item, dict)]
        return "".join(parts).strip()
    return clean_text(content)


def generate_ai_briefing(payload: dict[str, Any], ai_config: dict[str, Any]) -> str:
    summary = payload["summary"]
    spotlight = payload["spotlight"]
    top_lines = payload["leaderboards"]["line_board"][:3]
    prompt_payload = {
        "部门": summary["department"],
        "周期": payload["report"]["period_text"],
        "累计创收": round(summary["revenue"], 2),
        "累计利润": round(summary["profit"], 2),
        "利润率": round(summary["margin"] * 100, 2),
        "冠军日": spotlight["best_day"]["date"],
        "冠军日利润": round(spotlight["best_day"]["profit"], 2),
        "冠军团": spotlight["best_profit_group"]["line"] or spotlight["best_profit_group"]["tour_no"],
        "冠军团利润": round(spotlight["best_profit_group"]["profit"], 2),
        "主战计调": spotlight["primary_owner"]["label"],
        "高毛利线路": [item["label"] for item in top_lines],
    }
    request_body = {
        "model": ai_config["model"],
        "temperature": ai_config["temperature"],
        "messages": [
            {
                "role": "system",
                "content": (
                    "你是旅游公司经营战报助手。请用80到140字中文输出一段鼓舞士气的晨会播报，"
                    "必须自然包含创收、利润、利润率、冠军团或冠军线路、以及一句带动团队冲刺的话。"
                    "不要使用项目符号，不要写标题。"
                ),
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
    return text


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
        if self.app.matches_route(path, "/api/dashboard"):
            try:
                self.respond_json(self.app.dashboard())
            except Exception as exc:  # pragma: no cover - defensive path
                self.respond_json({"error": str(exc)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return
        self.respond_json({"error": "Not found"}, status=HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        path = parse.urlparse(self.path).path
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
                self.respond_json(self.app.ai_briefing())
            except Exception as exc:  # pragma: no cover - defensive path
                self.respond_json({"error": str(exc)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return
        if self.app.matches_route(path, "/api/records"):
            try:
                self.respond_json(self.app.add_record(self.read_json_body()))
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

    def dashboard(self) -> dict[str, Any]:
        with self._lock:
            return load_dashboard_payload(self.report_path, self.config_path)

    def ai_briefing(self) -> dict[str, Any]:
        payload = self.dashboard()
        raw_config = load_config(self.config_path)
        ai_config = resolve_ai_config(raw_config)
        ai_meta = payload["ai"]
        if not ai_meta["configured"]:
            return {
                "ok": True,
                "used_ai": False,
                "text": payload["briefing"]["fallback_text"],
                "provider": ai_meta["provider"],
                "model": ai_meta["model"],
                "reason": "AI 未配置，已返回本地士气播报。",
            }

        signature = (
            payload["status"]["source_mtime"],
            ai_meta["provider"],
            ai_meta["model"],
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
            text = generate_ai_briefing(payload, ai_config)
            response_payload = {
                "ok": True,
                "used_ai": True,
                "text": text,
                "provider": ai_meta["provider"],
                "model": ai_meta["model"],
            }
        except (ValueError, error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            response_payload = {
                "ok": True,
                "used_ai": False,
                "text": payload["briefing"]["fallback_text"],
                "provider": ai_meta["provider"],
                "model": ai_meta["model"],
                "reason": f"AI 播报失败，已回退为本地播报：{exc}",
            }

        with self._lock:
            self._ai_cache = {
                "signature": signature,
                "timestamp": now,
                "payload": response_payload,
            }
        return response_payload

    def add_record(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            if self.storage_mode == "sqlite":
                result = append_record_to_sqlite(self.sqlite_path, payload, self.report_title)
                message = "已写入独立数据库并刷新战报。"
            else:
                result = append_record_to_report(self.report_path, payload)
                message = "已写入 Excel 并刷新战报。"
            self._ai_cache = {}
            dashboard = load_dashboard_payload(self.report_path, self.config_path)
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
