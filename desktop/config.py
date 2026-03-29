"""
修行桌面助手 v4.0 — 全局配置
"""

import sys
import json
import uuid
from pathlib import Path

# ── 版本 ──
VERSION = "4.0"
APP_TITLE = f"全球祖庭之旅 v{VERSION}"
APP_SUBTITLE = "修行桌面助手 · JOINUS.COM · 小鸿陪你走祖庭"

# ── 路径 (支持 PyInstaller frozen) ──
if getattr(sys, 'frozen', False):
    APP_DIR = Path(sys.executable).parent
else:
    APP_DIR = Path(__file__).parent

# ── 平台 URL ──
PLATFORM_URLS = {
    "website": "https://joinus.com",
    "holy_sites": "https://joinus.com/holy-sites",
    "temples": "https://joinus.com/temples",
    "patriarchs": "https://joinus.com/patriarchs",
    "community": "https://joinus.com/community",
    "messages": "https://joinus.com/messages",
    "trips": "https://joinus.com/trips",
    "points_mall": "https://joinus.com/points-mall",
    "profile": "https://joinus.com/profile",
    "app_android": "https://joinus.com/download/android",
    "app_ios": "https://joinus.com/download/ios",
    "seals": "https://joinus.com/seals",
}
BG_DIR = APP_DIR / "backgrounds"
TEMPLES_DIR = BG_DIR / "temples"
PATRIARCHS_DIR = BG_DIR / "patriarchs"
SOUNDS_DIR = APP_DIR / "sounds"
PROGRESS_FILE = APP_DIR / "progress.json"
JOURNAL_FILE = APP_DIR / "xiaohong_journal.json"
SETTINGS_FILE = APP_DIR / "settings.json"
CACHE_DIR = APP_DIR / ".cache"
CACHE_DIR.mkdir(exist_ok=True)

# ── 默认设置 ──
DEFAULTS = {
    "interval_minutes": 15,
    "popup_duration_sec": 40,
    "voice_enabled": True,
    "popup_width": 1000,
    "popup_height": 700,
    "api_url": "http://localhost:3002/api",
    "language": "zh-CN",
    "device_id": "",
    "voice_volume": 0.85,
    "ambient_volume": 0.15,
    "chant_volume": 0.55,
}

# ── TTS 声音 ──
VOICE_FEMALE = "zh-CN-XiaoxiaoNeural"
VOICE_MALE = "zh-CN-YunjianNeural"

LOCAL_VOICES = {
    "佛教":     ("zh-CN-YunjianNeural",  "中文"),
    "道教":     ("zh-CN-YunjianNeural",  "中文"),
    "基督教":   ("en-US-AndrewNeural",   "English"),
    "伊斯兰教": ("ar-SA-HamedNeural",    "العربية"),
    "印度教":   ("hi-IN-MadhurNeural",   "हिन्दी"),
    "犹太教":   ("he-IL-AvriNeural",     "עברית"),
    "儒教":     ("zh-CN-YunjianNeural",  "中文"),
    "锡克教":   ("hi-IN-SwaraNeural",    "ਪੰਜਾਬੀ"),
    "神道教":   ("ja-JP-KeitaNeural",    "日本語"),
    "藏传佛教": ("zh-CN-YunjianNeural",  "中文"),
    "原住民灵性":("en-AU-WilliamNeural", "English"),
    "巴哈伊教": ("en-US-EmmaNeural",     "English"),
}

# ── 弹窗模式 ──
MODE_SITE = "site"
MODE_PATRIARCH = "patriarch"
MODE_TEMPLE = "temple"
MODE_SEAL = "seal"
MODE_TOUR = "tour"
MODES = [MODE_SITE, MODE_PATRIARCH, MODE_TEMPLE, MODE_SEAL, MODE_TOUR]

# ── 五系修炼吟诵 MP3 ──
SEAL_SERIES_CHANTS = {
    "初印系": "seal_chant_chuyin",
    "中印系": "seal_chant_zhongyin",
    "印果印": "seal_chant_yinguoyin",
    "成道印": "seal_chant_chengdaoyin",
    "归源印": "seal_chant_guiyuanyin",
}


def _load_settings():
    """加载 settings.json"""
    try:
        if SETTINGS_FILE.exists():
            data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
            # 合并默认值
            merged = {**DEFAULTS, **data}
            return merged
    except Exception:
        pass
    return dict(DEFAULTS)


def _save_settings(settings):
    """保存 settings.json"""
    try:
        SETTINGS_FILE.write_text(
            json.dumps(settings, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
    except Exception:
        pass


# 全局设置单例
_settings = _load_settings()
if not _settings.get("device_id"):
    _settings["device_id"] = str(uuid.uuid4())
    _save_settings(_settings)


def get(key, default=None):
    """获取配置值"""
    return _settings.get(key, DEFAULTS.get(key, default))


def set_val(key, value):
    """设置配置值并持久化"""
    _settings[key] = value
    _save_settings(_settings)


def get_all():
    """获取所有配置"""
    return dict(_settings)
