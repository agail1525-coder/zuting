"""
修行桌面助手 v3.0 — 通用渲染工具
字体缓存、多文字系统混排、自动换行、背景加载、遮罩叠加
"""

import random
import logging
import json
import urllib.request
import time
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from pathlib import Path

import config
from religions import RELIGION_STYLES

log = logging.getLogger(__name__)

# ── 字体缓存 ──
_FONT_CACHE = {}

_SCRIPT_FONTS = {
    'devanagari': ["Nirmala.ttc", "mangal.ttf"],
    'arabic':     ["segoeui.ttf", "arial.ttf"],
    'symbol':     ["seguisym.ttf", "segoeui.ttf"],
    'japanese':   ["yugothb.ttc", "msgothic.ttc", "msyh.ttc"],
}


def _script_of(ch):
    cp = ord(ch)
    if 0x0900 <= cp <= 0x097F or 0x0980 <= cp <= 0x09FF or 0xA800 <= cp <= 0xA82F:
        return 'devanagari'
    if (0x0600 <= cp <= 0x06FF or 0x0750 <= cp <= 0x077F
            or 0xFB50 <= cp <= 0xFDFF or 0xFE70 <= cp <= 0xFEFF):
        return 'arabic'
    if cp >= 0x1F000:
        return 'symbol'
    if 0x2600 <= cp <= 0x27BF or 0x2B50 <= cp <= 0x2B55:
        return 'symbol'
    return None


def font(sz, bold=False, script=None):
    key = (sz, bold, script)
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    candidates = []
    if script and script in _SCRIPT_FONTS:
        candidates = list(_SCRIPT_FONTS[script])
    candidates += (["msyhbd.ttc", "msyh.ttc"] if bold else ["msyh.ttc", "msyhbd.ttc"])
    for n in candidates:
        try:
            f = ImageFont.truetype(n, sz)
            _FONT_CACHE[key] = f
            return f
        except Exception:
            pass
    f = ImageFont.load_default()
    _FONT_CACHE[key] = f
    return f


def _split_runs(text):
    if not text:
        return []
    runs = []
    cur_script = _script_of(text[0])
    cur_seg = text[0]
    for ch in text[1:]:
        sc = _script_of(ch)
        if sc == cur_script:
            cur_seg += ch
        else:
            runs.append((cur_script, cur_seg))
            cur_script = sc
            cur_seg = ch
    runs.append((cur_script, cur_seg))
    return runs


def draw_text_multi(draw, xy, text, fill, sz, bold=False):
    x, y = xy
    for script, segment in _split_runs(text):
        fnt = font(sz, bold, script)
        draw.text((x, y), segment, fill=fill, font=fnt)
        bbox = draw.textbbox((0, 0), segment, font=fnt)
        x += bbox[2] - bbox[0]
    return x


def draw_wrapped(draw, text, x, y, max_w, fnt, fill):
    sz = fnt.size
    line = ""
    for ch in text:
        test = line + ch
        if draw.textbbox((0, 0), test, font=fnt)[2] > max_w:
            draw_text_multi(draw, (x, y), line, fill, sz)
            y += sz + 6
            line = ch
        else:
            line = test
    if line:
        draw_text_multi(draw, (x, y), line, fill, sz)
        y += sz + 6
    return y


def load_bg(img_path, w, h):
    if img_path:
        try:
            bg = Image.open(img_path).convert("RGB")
            # 修复 libpng iCCP 警告
            bg.info.pop('icc_profile', None)
            r = max(w / bg.width, h / bg.height)
            bg = bg.resize((int(bg.width * r), int(bg.height * r)), Image.LANCZOS)
            l = (bg.width - w) // 2
            t = (bg.height - h) // 2
            bg = bg.crop((l, t, l + w, t + h))
            return bg
        except Exception:
            log.debug(f"加载背景图失败: {img_path}", exc_info=True)
    return Image.new("RGB", (w, h), (25, 25, 50))


def base_overlay(w, h, style, draw_fn):
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    rc = style["color"]
    for y in range(55):
        a = int(200 * (1 - y / 55))
        d.line([(0, y), (w, y)], fill=(rc[0], rc[1], rc[2], a))
    draw_fn(d, rc)
    return ov


def find_image(name, search_dirs=None):
    if search_dirs is None:
        search_dirs = [config.BG_DIR, config.TEMPLES_DIR, config.PATRIARCHS_DIR]
    safe_name = name.replace("/", "_").replace("\\", "_").replace(" ", "_")
    for d in search_dirs:
        if not d.exists():
            continue
        for ext in [".jpg", ".jpeg", ".png"]:
            for try_name in [name, safe_name]:
                p = d / f"{try_name}{ext}"
                if p.exists():
                    return str(p)
    all_imgs = list(config.BG_DIR.glob("*.jpg")) + list(config.BG_DIR.glob("*.png"))
    if all_imgs:
        return str(random.choice(all_imgs))
    return None


# ── 坐标/天气/时间 ──

def format_coords(lat, lon):
    lat_d = "N" if lat >= 0 else "S"
    lon_d = "E" if lon >= 0 else "W"
    lat_deg = int(abs(lat))
    lat_min = (abs(lat) - lat_deg) * 60
    lon_deg = int(abs(lon))
    lon_min = (abs(lon) - lon_deg) * 60
    return f"{lat_deg}°{lat_min:.0f}'{lat_d}  {lon_deg}°{lon_min:.0f}'{lon_d}"


def get_local_time(utc_offset):
    utc_now = datetime.now(timezone.utc)
    local_dt = utc_now + timedelta(hours=utc_offset)
    return local_dt.strftime("%H:%M")


_WEATHER_CODES = {
    0: ("晴", "☀"), 1: ("大部晴", "🌤"), 2: ("多云", "⛅"), 3: ("阴", "☁"),
    45: ("雾", "🌫"), 48: ("霜雾", "🌫"),
    51: ("小毛雨", "🌦"), 53: ("毛雨", "🌦"), 55: ("密毛雨", "🌧"),
    61: ("小雨", "🌧"), 63: ("中雨", "🌧"), 65: ("大雨", "🌧"),
    71: ("小雪", "🌨"), 73: ("中雪", "🌨"), 75: ("大雪", "❄"),
    80: ("阵雨", "🌦"), 81: ("中阵雨", "🌧"), 82: ("暴雨", "⛈"),
    95: ("雷暴", "⛈"), 96: ("冰雹雷暴", "⛈"), 99: ("大冰雹", "⛈"),
}

_weather_cache = {}


def fetch_weather(lat, lon):
    key = (round(lat, 1), round(lon, 1))
    now = time.time()
    if key in _weather_cache and _weather_cache[key][0] > now:
        return _weather_cache[key][1]
    try:
        url = (f"https://api.open-meteo.com/v1/forecast?"
               f"latitude={lat}&longitude={lon}&current_weather=true&timezone=auto")
        req = urllib.request.Request(url, headers={"User-Agent": "ZutingDesktop/3.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
        cw = data["current_weather"]
        temp = cw["temperature"]
        code = cw["weathercode"]
        wind = cw["windspeed"]
        desc, emoji = _WEATHER_CODES.get(code, ("未知", "🌍"))
        result = f"{emoji} {desc} {temp:.0f}°C  风速{wind:.0f}km/h"
        _weather_cache[key] = (now + 1800, result)
        return result
    except Exception:
        return None


def get_site_info(site_name):
    from core.state import get_coords
    coords = get_coords(site_name)
    if not coords:
        return None
    lat, lon, utc_off = coords
    local_time = get_local_time(utc_off)
    coord_str = format_coords(lat, lon)
    weather = fetch_weather(lat, lon)
    utc_label = f"UTC{'+' if utc_off >= 0 else ''}{utc_off:g}"
    return {
        "lat": lat, "lon": lon, "utc_offset": utc_off,
        "coord_str": coord_str,
        "local_time": local_time,
        "utc_label": utc_label,
        "weather": weather,
    }
