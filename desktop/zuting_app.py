"""
全球祖庭之旅 v1.0 — 修行桌面助手
12大信仰 × 60圣地 × 36祖庭 × 40祖师 × 50祖训
× 曹溪祖师印偈三十篇 × 愿命三十印修炼体系
× 旅游攻略 × GPS坐标 × 当地天气/时间
× 12原语言吟诵MP3 × 5系修炼吟诵 × 男女交替播报 + 当地语言
× 小鸿修行Agent — 跨宗融合修行智能体
四种弹窗模式轮播: 圣地 → 祖师 → 祖庭 → 愿命印修
大愿: 帮助100万人走祖庭，建立全球宗教文化和平使者网络
"""

import tkinter as tk
import threading
import asyncio
import random
import time
import os
import sys
import json
import tempfile
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageTk
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

from religions import (
    HOLY_SITES, RELIGION_STYLES, HEALTH_REMINDERS, UNIVERSAL_WISDOM,
    ANCESTRAL_TEMPLES, PATRIARCHS, ANCESTRAL_TEACHINGS, TRAVEL_GUIDES,
    CHANT_SOUNDS, SITE_COORDS,
    CAOXI_SEALS, SEAL_SERIES_COLORS, CAOXI_POEMS, MINDFUL_REMINDERS,
    GOD_PERSPECTIVES,
)
from xiaohong_agent import compose_xiaohong_wisdom, get_daily_message, log_practice

# ── 配置 ──────────────────────────────────────────────
INTERVAL_MINUTES = 15
POPUP_DURATION_SEC = 40
VOICE_ENABLED = True
VOICE_FEMALE = "zh-CN-XiaoxiaoNeural"   # 中文女声
VOICE_MALE = "zh-CN-YunjianNeural"      # 中文男声
W, H = 800, 600

# 宗教→当地语言TTS声音 (voice_name, voice_label)
LOCAL_VOICES = {
    "佛教":     ("zh-CN-YunjianNeural",  "中文"),    # 中文诵经
    "道教":     ("zh-CN-YunjianNeural",  "中文"),    # 中文经文
    "基督教":   ("en-US-AndrewNeural",   "English"), # 英文
    "伊斯兰教": ("ar-SA-HamedNeural",    "العربية"), # 阿拉伯语
    "印度教":   ("hi-IN-MadhurNeural",   "हिन्दी"),  # 印地语
    "犹太教":   ("he-IL-AvriNeural",     "עברית"),   # 希伯来语
    "儒教":     ("zh-CN-YunjianNeural",  "中文"),    # 中文
    "锡克教":   ("hi-IN-SwaraNeural",    "ਪੰਜਾਬੀ"),  # 旁遮普(用印地语)
    "神道教":   ("ja-JP-KeitaNeural",    "日本語"),  # 日语
    "藏传佛教": ("zh-CN-YunjianNeural",  "中文"),    # 中文(藏语TTS不可用)
    "原住民灵性":("en-AU-WilliamNeural", "English"), # 英语(澳洲)
    "巴哈伊教": ("en-US-EmmaNeural",     "English"), # 英文
}

APP_DIR = Path(__file__).parent
BG_DIR = APP_DIR / "backgrounds"
TEMPLES_DIR = BG_DIR / "temples"
PATRIARCHS_DIR = BG_DIR / "patriarchs"
SOUNDS_DIR = APP_DIR / "sounds"
AUDIO_DIR = Path(tempfile.gettempdir()) / "health_reminder_audio"
AUDIO_DIR.mkdir(exist_ok=True)

# 四种弹窗模式 (V6.0: 新增愿命印修)
MODE_SITE = "site"          # 圣地模式
MODE_PATRIARCH = "patriarch" # 祖师模式
MODE_TEMPLE = "temple"      # 祖庭模式
MODE_SEAL = "seal"          # 愿命印修模式 (V6.0)
MODES = [MODE_SITE, MODE_PATRIARCH, MODE_TEMPLE, MODE_SEAL]

# 修炼进度文件
PROGRESS_FILE = APP_DIR / "progress.json"

# 五系修炼吟诵 → MP3 文件映射
SEAL_SERIES_CHANTS = {
    "初印系": "seal_chant_chuyin",
    "中印系": "seal_chant_zhongyin",
    "印果印": "seal_chant_yinguoyin",
    "成道印": "seal_chant_chengdaoyin",
    "归源印": "seal_chant_guiyuanyin",
}


def play_seal_chant(series):
    """播放对应系列的修炼吟诵 MP3 作为背景音乐"""
    global _chant_ch
    chant_name = SEAL_SERIES_CHANTS.get(series)
    if not chant_name:
        return
    f = SOUNDS_DIR / f"{chant_name}.mp3"
    if not f.exists():
        return
    try:
        import pygame
        if not pygame.mixer.get_init():
            pygame.mixer.init(44100, -16, 2, 2048)
        snd = pygame.mixer.Sound(str(f))
        snd.set_volume(0.45)
        _chant_ch = snd.play(loops=-1)
    except Exception:
        pass


def _load_progress():
    """加载修炼进度"""
    try:
        if PROGRESS_FILE.exists():
            return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {"current_seal": 0, "started_at": "", "show_count": 0}


def _save_progress(prog):
    """保存修炼进度"""
    try:
        PROGRESS_FILE.write_text(json.dumps(prog, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception:
        pass


# ── 状态 ──────────────────────────────────────────────
class State:
    running = True
    paused = False
    count = 0
    next_time = None
    root = None
    tray = None
    order = []
    idx = 0
    mode_idx = 0  # 轮播模式索引

st = State()


def current_mode():
    return MODES[st.mode_idx % len(MODES)]


def _get_current_seal():
    """获取当前修炼的印 (基于进度，每4次弹窗推进一印)"""
    prog = _load_progress()
    show_count = prog.get("show_count", 0)
    # 每4次弹窗(即每轮MODE_SEAL出现一次)推进一印，30印循环
    seal_idx = (show_count // 1) % len(CAOXI_SEALS)
    return CAOXI_SEALS[seal_idx]


def init_order():
    """均衡轮换：按宗教分组打乱，确保不连续出同一宗教"""
    by_rel = {}
    for i, site in enumerate(HOLY_SITES):
        rel = site[1]
        by_rel.setdefault(rel, []).append(i)
    for v in by_rel.values():
        random.shuffle(v)

    queues = list(by_rel.values())
    random.shuffle(queues)
    result = []
    while queues:
        for q in queues:
            if q:
                result.append(q.pop(0))
        queues = [q for q in queues if q]
    st.order = result


def next_site():
    if not st.order:
        init_order()
    i = st.order[st.idx % len(st.order)]
    st.idx += 1
    if st.idx >= len(st.order):
        st.idx = 0
        init_order()
    return HOLY_SITES[i]


def get_patriarch_for_religion(religion):
    """获取指定宗教的一位祖师"""
    matches = [p for p in PATRIARCHS if p[1] == religion]
    return random.choice(matches) if matches else None


def get_temple_for_religion(religion):
    """获取指定宗教的一座祖庭"""
    matches = [t for t in ANCESTRAL_TEMPLES if t[1] == religion]
    return random.choice(matches) if matches else None


def get_teaching_for_religion(religion):
    """获取指定宗教的一条祖训"""
    matches = [t for t in ANCESTRAL_TEACHINGS if t[1] == religion]
    return random.choice(matches) if matches else None


def get_travel_guide(site_name):
    """获取旅游攻略"""
    return TRAVEL_GUIDES.get(site_name, None)


def get_coords(site_name):
    """获取坐标 (lat, lon, utc_offset)"""
    return SITE_COORDS.get(site_name, None)


def format_coords(lat, lon):
    """格式化GPS坐标为度分格式"""
    lat_d = "N" if lat >= 0 else "S"
    lon_d = "E" if lon >= 0 else "W"
    lat_deg = int(abs(lat))
    lat_min = (abs(lat) - lat_deg) * 60
    lon_deg = int(abs(lon))
    lon_min = (abs(lon) - lon_deg) * 60
    return f"{lat_deg}°{lat_min:.0f}'{lat_d}  {lon_deg}°{lon_min:.0f}'{lon_d}"


def get_local_time(utc_offset):
    """根据UTC偏移计算当地时间"""
    utc_now = datetime.now(timezone.utc)
    local_dt = utc_now + timedelta(hours=utc_offset)
    return local_dt.strftime("%H:%M")


# 天气码→中文+emoji映射
_WEATHER_CODES = {
    0: ("晴", "☀"), 1: ("大部晴", "🌤"), 2: ("多云", "⛅"), 3: ("阴", "☁"),
    45: ("雾", "🌫"), 48: ("霜雾", "🌫"),
    51: ("小毛雨", "🌦"), 53: ("毛雨", "🌦"), 55: ("密毛雨", "🌧"),
    61: ("小雨", "🌧"), 63: ("中雨", "🌧"), 65: ("大雨", "🌧"),
    71: ("小雪", "🌨"), 73: ("中雪", "🌨"), 75: ("大雪", "❄"),
    80: ("阵雨", "🌦"), 81: ("中阵雨", "🌧"), 82: ("暴雨", "⛈"),
    95: ("雷暴", "⛈"), 96: ("冰雹雷暴", "⛈"), 99: ("大冰雹", "⛈"),
}

# 天气缓存 {(lat,lon): (expire_time, weather_str)}
_weather_cache = {}


def fetch_weather(lat, lon):
    """从Open-Meteo获取当前天气（免费无需API Key），带缓存"""
    key = (round(lat, 1), round(lon, 1))
    now = time.time()
    if key in _weather_cache and _weather_cache[key][0] > now:
        return _weather_cache[key][1]

    try:
        url = (f"https://api.open-meteo.com/v1/forecast?"
               f"latitude={lat}&longitude={lon}&current_weather=true&timezone=auto")
        req = urllib.request.Request(url, headers={"User-Agent": "HealthReminder/5.1"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
        cw = data["current_weather"]
        temp = cw["temperature"]
        code = cw["weathercode"]
        wind = cw["windspeed"]
        desc, emoji = _WEATHER_CODES.get(code, ("未知", "🌍"))
        result = f"{emoji} {desc} {temp:.0f}°C  风速{wind:.0f}km/h"
        _weather_cache[key] = (now + 1800, result)  # 缓存30分钟
        return result
    except Exception:
        return None


def get_site_info(site_name):
    """获取坐标+当地时间+天气的完整信息"""
    coords = get_coords(site_name)
    if not coords:
        return None
    lat, lon, utc_off = coords
    local_time = get_local_time(utc_off)
    coord_str = format_coords(lat, lon)
    # 天气在后台异步获取，先用缓存
    weather = fetch_weather(lat, lon)
    utc_label = f"UTC{'+' if utc_off >= 0 else ''}{utc_off:g}"
    return {
        "lat": lat, "lon": lon, "utc_offset": utc_off,
        "coord_str": coord_str,
        "local_time": local_time,
        "utc_label": utc_label,
        "weather": weather,
    }


# ══════════════════════════════════════════════════════
#  音频 (V5.0: 双Channel — 环境音 + 咒语叠加)
# ══════════════════════════════════════════════════════

_ambient_ch = None
_chant_ch = None


def play_ambient(name):
    global _ambient_ch
    f = SOUNDS_DIR / f"{name}.wav"
    if not f.exists():
        return
    try:
        import pygame
        if not pygame.mixer.get_init():
            pygame.mixer.init(44100, -16, 2, 2048)
        snd = pygame.mixer.Sound(str(f))
        snd.set_volume(0.15)  # 降低环境音，突出咒语
        _ambient_ch = snd.play(loops=-1)
    except Exception:
        pass


def play_chant(religion):
    """播放对应宗教的原语言吟诵 MP3 (突出音量, 循环)"""
    global _chant_ch
    chant_info = CHANT_SOUNDS.get(religion)
    if not chant_info:
        return
    # 优先 MP3, 降级 WAV
    f = SOUNDS_DIR / f"{chant_info['sound']}.mp3"
    if not f.exists():
        f = SOUNDS_DIR / f"{chant_info['sound']}.wav"
    if not f.exists():
        return
    try:
        import pygame
        if not pygame.mixer.get_init():
            pygame.mixer.init(44100, -16, 2, 2048)
        snd = pygame.mixer.Sound(str(f))
        snd.set_volume(0.55)  # 吟诵音量突出
        _chant_ch = snd.play(loops=-1)
    except Exception:
        pass


def stop_ambient():
    global _ambient_ch, _chant_ch
    for ch in [_ambient_ch, _chant_ch]:
        if ch:
            try:
                ch.fadeout(1500)
            except Exception:
                pass
    _ambient_ch = None
    _chant_ch = None


_voice_counter = 0  # 男女交替计数器


def _tts_generate(text, voice, rate="-5%", pitch="+0Hz"):
    """生成TTS音频文件，返回路径"""
    h = hash(f"{text}_{voice}") & 0xFFFFFFFF
    p = str(AUDIO_DIR / f"r_{h}.mp3")
    if not os.path.exists(p):
        try:
            import edge_tts
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(p))
            loop.close()
        except Exception:
            return None
    return p


def _play_sound_blocking(path, volume=0.85):
    """播放音频并等待播完"""
    try:
        import pygame
        if not pygame.mixer.get_init():
            pygame.mixer.init()
        snd = pygame.mixer.Sound(path)
        snd.set_volume(volume)
        ch = snd.play()
        while ch and ch.get_busy():
            time.sleep(0.1)
    except Exception:
        pass


def play_voice(text, religion=None):
    """播报语音: 男女交替中文 + 当地语言追加"""
    if not VOICE_ENABLED:
        return
    global _voice_counter

    def _w():
        global _voice_counter
        # 男女交替
        voice = VOICE_MALE if _voice_counter % 2 == 0 else VOICE_FEMALE
        pitch = "-2Hz" if voice == VOICE_MALE else "+5Hz"
        _voice_counter += 1

        # 1) 中文播报
        p = _tts_generate(text, voice, rate="-5%", pitch=pitch)
        if p:
            _play_sound_blocking(p)

        # 2) 当地语言追加 (非中文宗教)
        if religion and religion in LOCAL_VOICES:
            local_voice, label = LOCAL_VOICES[religion]
            # 跳过中文宗教 (佛/道/儒/藏传 已经是中文)
            if local_voice.startswith("zh-CN"):
                return
            # 取CHANT_SOUNDS中原语言经文作为当地语言内容
            chant = CHANT_SOUNDS.get(religion)
            if chant:
                local_text = chant.get("text", "")
                if local_text:
                    time.sleep(0.5)
                    p2 = _tts_generate(local_text, local_voice, rate="-10%", pitch="-1Hz")
                    if p2:
                        _play_sound_blocking(p2, volume=0.8)
    threading.Thread(target=_w, daemon=True).start()


# ══════════════════════════════════════════════════════
#  图片查找
# ══════════════════════════════════════════════════════

def find_image(name, search_dirs=None):
    """在多个目录中查找匹配的图片"""
    if search_dirs is None:
        search_dirs = [BG_DIR, TEMPLES_DIR, PATRIARCHS_DIR]
    safe_name = name.replace("/", "_").replace("\\", "_").replace(" ", "_")
    for d in search_dirs:
        if not d.exists():
            continue
        for ext in [".jpg", ".jpeg", ".png"]:
            for try_name in [name, safe_name]:
                p = d / f"{try_name}{ext}"
                if p.exists():
                    return str(p)
    # fallback: 随机圣地图
    all_imgs = list(BG_DIR.glob("*.jpg")) + list(BG_DIR.glob("*.png"))
    if all_imgs:
        return str(random.choice(all_imgs))
    return None


# ══════════════════════════════════════════════════════
#  通用渲染工具
# ══════════════════════════════════════════════════════

_FONT_CACHE = {}

# Windows 字体回退链 —— 按文字类别选择字体
_SCRIPT_FONTS = {
    'devanagari': ["Nirmala.ttc", "mangal.ttf"],
    'arabic':     ["segoeui.ttf", "arial.ttf"],
    'symbol':     ["seguisym.ttf", "segoeui.ttf"],
    'japanese':   ["yugothb.ttc", "msgothic.ttc", "msyh.ttc"],
}


def _script_of(ch):
    """检测字符所属文字系统"""
    cp = ord(ch)
    if 0x0900 <= cp <= 0x097F or 0x0980 <= cp <= 0x09FF or 0xA800 <= cp <= 0xA82F:
        return 'devanagari'
    if (0x0600 <= cp <= 0x06FF or 0x0750 <= cp <= 0x077F
            or 0xFB50 <= cp <= 0xFDFF or 0xFE70 <= cp <= 0xFEFF):
        return 'arabic'
    if cp >= 0x1F000:  # Emoji (SMP)
        return 'symbol'
    if 0x2600 <= cp <= 0x27BF or 0x2B50 <= cp <= 0x2B55:  # Misc symbols / Dingbats
        return 'symbol'
    return None  # 默认字体即可


def _font(sz, bold=False, script=None):
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
    """将文本按文字系统分段，返回 [(script, segment), ...]"""
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


def _draw_text_multi(draw, xy, text, fill, sz, bold=False):
    """绘制多文字系统混排文本（自动切换字体）"""
    x, y = xy
    for script, segment in _split_runs(text):
        fnt = _font(sz, bold, script)
        draw.text((x, y), segment, fill=fill, font=fnt)
        bbox = draw.textbbox((0, 0), segment, font=fnt)
        x += bbox[2] - bbox[0]
    return x


def _draw_wrapped(draw, text, x, y, max_w, fnt, fill):
    """自动换行绘制文字（支持多文字系统回退），返回结束y坐标"""
    sz = fnt.size
    line = ""
    for ch in text:
        test = line + ch
        if draw.textbbox((0, 0), test, font=fnt)[2] > max_w:
            _draw_text_multi(draw, (x, y), line, fill, sz)
            y += sz + 6
            line = ch
        else:
            line = test
    if line:
        _draw_text_multi(draw, (x, y), line, fill, sz)
        y += sz + 6
    return y


def _load_bg(img_path, w, h):
    """加载并裁剪背景图"""
    if img_path:
        try:
            bg = Image.open(img_path).convert("RGB")
            r = max(w / bg.width, h / bg.height)
            bg = bg.resize((int(bg.width * r), int(bg.height * r)), Image.LANCZOS)
            l = (bg.width - w) // 2
            t = (bg.height - h) // 2
            bg = bg.crop((l, t, l + w, t + h))
            return bg
        except Exception:
            pass
    return Image.new("RGB", (w, h), (25, 25, 50))


def _base_overlay(w, h, style, draw_fn):
    """创建基础遮罩并调用自定义绘制"""
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    rc = style["color"]
    # 顶部宗教色带
    for y in range(55):
        a = int(200 * (1 - y / 55))
        d.line([(0, y), (w, y)], fill=(rc[0], rc[1], rc[2], a))
    draw_fn(d, rc)
    return ov


# ══════════════════════════════════════════════════════
#  三种弹窗合成器
# ══════════════════════════════════════════════════════

def compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                 category, message, wisdom, count, chant_info, travel, site_info=None):
    """模式A — 圣地模式"""
    w, h = W, H
    style = RELIGION_STYLES.get(religion, {"symbol": "◎", "color": (200, 200, 200), "color2": (150, 150, 150)})

    bg = _load_bg(find_image(site_name, [BG_DIR]), w, h)
    bg = ImageEnhance.Brightness(bg).enhance(0.42)
    bg = bg.convert("RGBA")

    has_geo = site_info is not None

    def draw_cards(d, rc):
        # 坐标/天气条 (顶部色带下方)
        if has_geo:
            d.rounded_rectangle([30, 48, w - 30, 80], radius=8, fill=(0, 0, 0, 170))
        d.rounded_rectangle([30, 90, w - 30, 310], radius=14, fill=(0, 0, 0, 155))
        d.rounded_rectangle([30, 325, w - 30, 445], radius=14, fill=(0, 0, 0, 135))
        if travel:
            d.rounded_rectangle([30, 460, w - 30, 530], radius=14, fill=(0, 0, 0, 120))
        d.rectangle([0, h - 65, w, h], fill=(0, 0, 0, 185))
        d.rounded_rectangle([w // 2 - 120, h - 55, w // 2 + 120, h - 15], radius=8,
                            fill=(rc[0], rc[1], rc[2], 220))

    ov = _base_overlay(w, h, style, draw_cards)
    bg = Image.alpha_composite(bg, ov).convert("RGB")
    draw = ImageDraw.Draw(bg)

    f11, f13, f15, f17, f20, f24 = _font(11), _font(13), _font(15), _font(17), _font(20), _font(24, True)

    # 顶栏
    header = f"{style['symbol']}  {religion}  ·  {site_name}  ·  {country}"
    _draw_text_multi(draw, (20, 14), header, (255, 255, 255), 20)
    tt = f"[圣地] 第{count}次  {datetime.now().strftime('%H:%M')}"
    bb = draw.textbbox((0, 0), tt, font=f13)
    draw.text((w - 20 - (bb[2] - bb[0]), 18), tt, fill=(200, 200, 200), font=f13)

    # 坐标 + 当地时间 + 天气 (紧凑一行)
    if has_geo:
        geo_parts = [f"⊙ {site_info['coord_str']}"]
        geo_parts.append(f"◷ 当地{site_info['local_time']}({site_info['utc_label']})")
        if site_info['weather']:
            geo_parts.append(site_info['weather'])
        geo_line = "  |  ".join(geo_parts)
        _draw_text_multi(draw, (45, 56), geo_line, (160, 220, 255), 11)

    # 教义区
    cx = 55
    _draw_wrapped(draw, poem_orig, cx, 108, w - 60 - cx, f20, (255, 255, 255))
    _draw_text_multi(draw, (cx, 175), f"— {poem_src}", style["color"], 15)
    _draw_wrapped(draw, poem_cn, cx, 200, w - 60 - cx, f17, (220, 220, 200))
    if chant_info:
        _draw_text_multi(draw, (cx, 270), f"♫ {chant_info['name']}: {chant_info['text'][:25]}...", (180, 220, 180), 13)
    _draw_text_multi(draw, (cx, 290), f"{style['symbol']}  {religion}经典", (180, 180, 180), 13)

    # 健康提醒区
    draw.text((cx, 340), category, fill=style["color"], font=f24)
    _draw_wrapped(draw, message, cx, 378, w - 60 - cx, f17, (255, 255, 255))

    # 旅游攻略区
    if travel:
        draw.text((cx, 473), f"✈ 最佳: {travel['season']}  |  交通: {travel['transport'][:30]}", fill=(180, 200, 220), font=f13)
        draw.text((cx, 493), f"   门票: {travel['ticket']}  |  贴士: {travel['tips'][:28]}", fill=(160, 180, 200), font=f13)

    # 底部
    draw.text((20, h - 82), f"  {wisdom}", fill=(200, 200, 200), font=f13)
    bt = "知道了，马上动！"
    bb = draw.textbbox((0, 0), bt, font=f20)
    draw.text(((w - (bb[2] - bb[0])) // 2, h - 48), bt, fill=(30, 30, 46), font=_font(18, True))
    draw.text((w - 50, h - 48), f"{POPUP_DURATION_SEC}s", fill=(150, 150, 150), font=f13)

    return bg


def compose_patriarch(patriarch, teaching, religion, category, message, wisdom, count, chant_info, site_info=None):
    """模式B — 祖师模式"""
    w, h = W, H
    style = RELIGION_STYLES.get(religion, {"symbol": "◎", "color": (200, 200, 200), "color2": (150, 150, 150)})

    # 祖师名, 宗教, 时代, 尊号, 核心贡献, 名言, 搜索词
    p_name, _, p_era, p_title, p_contrib, p_quote = patriarch[0], patriarch[1], patriarch[2], patriarch[3], patriarch[4], patriarch[5]

    bg = _load_bg(find_image(p_name, [PATRIARCHS_DIR, BG_DIR]), w, h)
    bg = ImageEnhance.Brightness(bg).enhance(0.38)
    bg = bg.convert("RGBA")

    has_geo = site_info is not None

    def draw_cards(d, rc):
        if has_geo:
            d.rounded_rectangle([30, 48, w - 30, 80], radius=8, fill=(0, 0, 0, 170))
        d.rounded_rectangle([30, 90, w - 30, 345], radius=14, fill=(0, 0, 0, 160))
        d.rounded_rectangle([30, 360, w - 30, 475], radius=14, fill=(0, 0, 0, 135))
        d.rectangle([0, h - 65, w, h], fill=(0, 0, 0, 185))
        d.rounded_rectangle([w // 2 - 120, h - 55, w // 2 + 120, h - 15], radius=8,
                            fill=(rc[0], rc[1], rc[2], 220))

    ov = _base_overlay(w, h, style, draw_cards)
    bg = Image.alpha_composite(bg, ov).convert("RGB")
    draw = ImageDraw.Draw(bg)

    f11, f12, f13, f15, f17, f20, f24 = _font(11), _font(12), _font(13), _font(15), _font(17), _font(20), _font(24, True)

    # 顶栏
    header = f"{style['symbol']}  {religion}  ·  祖师传承"
    _draw_text_multi(draw, (20, 14), header, (255, 255, 255), 20)
    tt = f"[祖师] 第{count}次  {datetime.now().strftime('%H:%M')}"
    bb = draw.textbbox((0, 0), tt, font=f13)
    draw.text((w - 20 - (bb[2] - bb[0]), 18), tt, fill=(200, 200, 200), font=f13)

    # 坐标 + 当地时间 + 天气
    if has_geo:
        geo_parts = [f"⊙ {site_info['coord_str']}"]
        geo_parts.append(f"◷ 当地{site_info['local_time']}({site_info['utc_label']})")
        if site_info['weather']:
            geo_parts.append(site_info['weather'])
        _draw_text_multi(draw, (45, 56), "  |  ".join(geo_parts), (160, 220, 255), 11)

    # 祖师信息区
    cx = 55
    _draw_text_multi(draw, (cx, 108), f"◆ {p_name}", (255, 255, 255), 24, bold=True)
    _draw_text_multi(draw, (cx, 143), f"{p_title}  ·  {p_era}", style["color"], 15)
    _draw_wrapped(draw, p_contrib, cx, 170, w - 60 - cx, f17, (220, 220, 200))

    # 祖师名言 (大字)
    y = 215
    draw.text((cx, y), "「", fill=style["color"], font=_font(22, True))
    y = _draw_wrapped(draw, p_quote, cx + 22, y + 2, w - 80 - cx, f17, (255, 255, 220))
    draw.text((cx, y), "」", fill=style["color"], font=_font(22, True))

    # 祖训
    if teaching:
        t_name, _, t_patriarch, t_orig, t_explain = teaching
        draw.text((cx, y + 20), f"◈ 祖训·{t_name}", fill=style["color"], font=f15)
        _draw_wrapped(draw, t_explain, cx, y + 43, w - 60 - cx, f13, (200, 200, 200))

    # 咒语标签
    if chant_info:
        draw.text((cx, 320), f"♫ {chant_info['name']}: {chant_info['text'][:30]}...", fill=(180, 220, 180), font=f12)

    # 健康提醒区
    draw.text((cx, 375), category, fill=style["color"], font=f24)
    _draw_wrapped(draw, message, cx, 413, w - 60 - cx, f17, (255, 255, 255))

    # 底部
    draw.text((20, h - 82), f"  {wisdom}", fill=(200, 200, 200), font=f13)
    bt = "知道了，马上动！"
    bb = draw.textbbox((0, 0), bt, font=f20)
    draw.text(((w - (bb[2] - bb[0])) // 2, h - 48), bt, fill=(30, 30, 46), font=_font(18, True))
    draw.text((w - 50, h - 48), f"{POPUP_DURATION_SEC}s", fill=(150, 150, 150), font=f13)

    return bg


def compose_temple(temple, teaching, religion, category, message, wisdom, count, chant_info, travel, site_info=None):
    """模式C — 祖庭模式"""
    w, h = W, H
    style = RELIGION_STYLES.get(religion, {"symbol": "◎", "color": (200, 200, 200), "color2": (150, 150, 150)})

    # 祖庭名, 宗教, 国家, 创建年代, 历史意义, 搜索词
    t_name, _, t_country, t_year, t_significance = temple[0], temple[1], temple[2], temple[3], temple[4]

    bg = _load_bg(find_image(t_name, [TEMPLES_DIR, BG_DIR]), w, h)
    bg = ImageEnhance.Brightness(bg).enhance(0.40)
    bg = bg.convert("RGBA")

    has_geo = site_info is not None

    def draw_cards(d, rc):
        if has_geo:
            d.rounded_rectangle([30, 48, w - 30, 80], radius=8, fill=(0, 0, 0, 170))
        d.rounded_rectangle([30, 90, w - 30, 320], radius=14, fill=(0, 0, 0, 155))
        d.rounded_rectangle([30, 335, w - 30, 450], radius=14, fill=(0, 0, 0, 135))
        if travel:
            d.rounded_rectangle([30, 465, w - 30, 535], radius=14, fill=(0, 0, 0, 120))
        d.rectangle([0, h - 65, w, h], fill=(0, 0, 0, 185))
        d.rounded_rectangle([w // 2 - 120, h - 55, w // 2 + 120, h - 15], radius=8,
                            fill=(rc[0], rc[1], rc[2], 220))

    ov = _base_overlay(w, h, style, draw_cards)
    bg = Image.alpha_composite(bg, ov).convert("RGB")
    draw = ImageDraw.Draw(bg)

    f11, f12, f13, f15, f17, f20, f24 = _font(11), _font(12), _font(13), _font(15), _font(17), _font(20), _font(24, True)

    # 顶栏
    header = f"{style['symbol']}  {religion}  ·  祖庭巡礼  ·  {t_country}"
    _draw_text_multi(draw, (20, 14), header, (255, 255, 255), 20)
    tt = f"[祖庭] 第{count}次  {datetime.now().strftime('%H:%M')}"
    bb = draw.textbbox((0, 0), tt, font=f13)
    draw.text((w - 20 - (bb[2] - bb[0]), 18), tt, fill=(200, 200, 200), font=f13)

    # 坐标 + 当地时间 + 天气
    if has_geo:
        geo_parts = [f"⊙ {site_info['coord_str']}"]
        geo_parts.append(f"◷ 当地{site_info['local_time']}({site_info['utc_label']})")
        if site_info['weather']:
            geo_parts.append(site_info['weather'])
        _draw_text_multi(draw, (45, 56), "  |  ".join(geo_parts), (160, 220, 255), 11)

    # 祖庭信息区
    cx = 55
    _draw_text_multi(draw, (cx, 108), f"▣ {t_name}", (255, 255, 255), 24, bold=True)
    draw.text((cx, 143), f"创建: {t_year}", fill=style["color"], font=f15)
    _draw_wrapped(draw, t_significance, cx, 170, w - 60 - cx, f17, (220, 220, 200))

    # 祖训
    if teaching:
        t_teaching_name, _, t_patriarch, t_orig, t_explain = teaching
        draw.text((cx, 225), f"◈ 祖训·{t_teaching_name} ({t_patriarch})", fill=style["color"], font=f15)
        draw.text((cx, 250), f"「{t_orig[:40]}」", fill=(255, 255, 220), font=f17)
        _draw_wrapped(draw, t_explain, cx, 278, w - 60 - cx, f13, (200, 200, 200))

    # 咒语标签
    if chant_info:
        draw.text((cx, 300), f"♫ {chant_info['name']}: {chant_info['text'][:30]}...", fill=(180, 220, 180), font=f12)

    # 健康提醒区
    draw.text((cx, 350), category, fill=style["color"], font=f24)
    _draw_wrapped(draw, message, cx, 388, w - 60 - cx, f17, (255, 255, 255))

    # 旅游攻略
    if travel:
        draw.text((cx, 478), f"✈ 最佳: {travel['season']}  |  交通: {travel['transport'][:30]}", fill=(180, 200, 220), font=f13)
        draw.text((cx, 498), f"   门票: {travel['ticket']}  |  贴士: {travel['tips'][:28]}", fill=(160, 180, 200), font=f13)

    # 底部
    draw.text((20, h - 82), f"  {wisdom}", fill=(200, 200, 200), font=f13)
    bt = "知道了，马上动！"
    bb = draw.textbbox((0, 0), bt, font=f20)
    draw.text(((w - (bb[2] - bb[0])) // 2, h - 48), bt, fill=(30, 30, 46), font=_font(18, True))
    draw.text((w - 50, h - 48), f"{POPUP_DURATION_SEC}s", fill=(150, 150, 150), font=f13)

    return bg


# ══════════════════════════════════════════════════════
#  V6.0: 愿命印修弹窗合成
# ══════════════════════════════════════════════════════

def compose_seal(seal, health_key, health_val, mindful_text, wisdom, count):
    """合成愿命印修弹窗 — 深紫渐变 + 金色偈语 + 修行提醒"""
    w, h = W, H
    series = seal["series"]
    color_hex, color_name = SEAL_SERIES_COLORS.get(series, ("#D4A017", "暖金"))
    # Hex to RGB
    cr = int(color_hex[1:3], 16)
    cg = int(color_hex[3:5], 16)
    cb = int(color_hex[5:7], 16)
    sc = (cr, cg, cb)

    # 深色渐变背景 (深紫→深蓝)
    bg = Image.new("RGB", (w, h), (18, 10, 35))
    draw = ImageDraw.Draw(bg)
    # 渐变填充
    for y in range(h):
        r = int(18 + (25 - 18) * y / h)
        g = int(10 + (15 - 10) * y / h)
        b = int(35 + (55 - 35) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # 顶部系列色带
    for y in range(50):
        a_ratio = 1 - y / 50
        rr = int(cr * a_ratio + 18 * (1 - a_ratio))
        gg = int(cg * a_ratio + 10 * (1 - a_ratio))
        bb = int(cb * a_ratio + 35 * (1 - a_ratio))
        draw.line([(0, y), (w, y)], fill=(rr, gg, bb))

    f11 = _font(11)
    f13 = _font(13)
    f15 = _font(15)
    f17 = _font(17)
    f20 = _font(20, True)
    f22 = _font(22, True)
    f26 = _font(26, True)

    # ── 底部固定区域高度: 按钮行 45px ──
    BOTTOM_RESERVED = 50

    # 顶部: 系列名 + 印号
    _draw_text_multi(draw, (20, 12), f"❖ 曹溪愿命 · {series}", (255, 255, 255), 20, bold=True)
    draw.text((w - 180, 12), f"[印修] 第{count}次  {datetime.now().strftime('%H:%M')}", fill=(180, 180, 180), font=f13)

    # 印名 (大标题)
    seal_title = f"第{seal['id']}印 · {seal['name']}"
    draw.text((30, 58), seal_title, fill=sc, font=f26)

    # 偈语框 — 金色大字居中
    poem_lines = [pl.strip() for pl in seal["poem"].split("\n") if pl.strip()]
    poem_y = 95
    line_h = 34
    box_h = len(poem_lines) * line_h + 16
    draw.rectangle([(20, poem_y - 8), (w - 20, poem_y + box_h - 8)],
                   fill=(30, 20, 45), outline=sc)
    for pl in poem_lines:
        bb = draw.textbbox((0, 0), pl, font=f22)
        tw = bb[2] - bb[0]
        draw.text(((w - tw) // 2, poem_y), pl, fill=(255, 215, 80), font=f22)
        poem_y += line_h
    poem_y += 8  # box底部padding

    # ── 计算中间内容区可用空间 ──
    content_top = poem_y + 10
    content_bottom = h - BOTTOM_RESERVED
    avail = content_bottom - content_top

    # 根据可用空间决定截断长度
    essence_limit = 80 if avail < 280 else 100
    practice_limit = 60 if avail < 280 else 80
    show_vow = avail >= 240

    # 印义精要
    ey = content_top
    draw.text((30, ey), "◇ 印义：", fill=sc, font=f15)
    ey = _draw_wrapped(draw, seal["essence"][:essence_limit], 30, ey + 22, w - 60, f13, (200, 200, 210))

    # 今日修持
    ey += 6
    draw.text((30, ey), "◈ 今日修持：", fill=(255, 200, 150), font=f15)
    ey = _draw_wrapped(draw, seal["practice"][:practice_limit], 30, ey + 22, w - 60, f11, (180, 180, 190))

    # 发愿词 (节选, 空间足够时才显示)
    if seal["vow"] and show_vow:
        ey += 4
        vow_short = seal["vow"].replace("\n", " ")[:50] + "..."
        draw.text((30, ey), f"▸ {vow_short}", fill=(150, 170, 200), font=f11)
        ey += 18

    # 分隔线
    ey += 6
    draw.line([(20, ey), (w - 20, ey)], fill=(60, 50, 80))
    ey += 8

    # 健康提醒区 (修行化) — 仅在有空间时显示
    remaining = content_bottom - ey
    if remaining > 60:
        draw.text((30, ey), health_key, fill=sc, font=f17)
        ey += 26
        if remaining > 85:
            xh = compose_xiaohong_wisdom(seal)
            xiaohong_msg = xh.get("guidance", "")
            _draw_wrapped(draw, f"~ {mindful_text}", 30, ey, w - 60, f11, (180, 190, 200))
        ey += 18

    # 底部按钮
    bt = "知道了，继续修行！"
    bb = draw.textbbox((0, 0), bt, font=f17)
    draw.text(((w - (bb[2] - bb[0])) // 2, h - 40), bt, fill=sc, font=f17)
    draw.text((w - 50, h - 40), f"{POPUP_DURATION_SEC}s", fill=(150, 150, 150), font=f13)

    return bg


# ══════════════════════════════════════════════════════
#  弹窗
# ══════════════════════════════════════════════════════

def show_popup():
    if not HAS_PIL:
        return

    st.count += 1
    mode = current_mode()
    st.mode_idx += 1

    # 基础数据 (始终从圣地轮换中获取宗教)
    site = next_site()
    site_name, religion, country, ambient_sound = site[0], site[1], site[2], site[3]
    poem_orig, poem_src, poem_cn = site[5], site[6], site[7]

    cat = random.choice(list(HEALTH_REMINDERS.keys()))
    msg = random.choice(HEALTH_REMINDERS[cat])
    wisdom = random.choice(UNIVERSAL_WISDOM)
    chant_info = CHANT_SOUNDS.get(religion)
    teaching = get_teaching_for_religion(religion)

    # 播放宗教吟诵作为背景音乐
    if mode == MODE_SEAL:
        seal_preview = _get_current_seal()
        play_seal_chant(seal_preview["series"])  # 播放对应系列修炼吟诵
    else:
        play_chant(religion)

    # 延迟语音 (男女交替 + 当地语言追加)
    def dv():
        time.sleep(3.5)
        if mode == MODE_SEAL:
            # 印修模式: 低沉男声诵偈 + 柔和女声发愿词
            seal = _get_current_seal()
            poem_text = seal["poem"].replace("\n", "，")
            play_voice(f"第{seal['id']}印，{seal['name']}。{poem_text}", religion="佛教")
        elif mode == MODE_SITE:
            play_voice(f"{site_name}。{poem_cn}。{msg}", religion=religion)
        elif mode == MODE_PATRIARCH:
            patriarch = get_patriarch_for_religion(religion)
            if patriarch:
                play_voice(f"{religion}祖师{patriarch[0]}。{patriarch[5][:30]}。{msg}", religion=religion)
            else:
                play_voice(f"{site_name}。{poem_cn}。{msg}", religion=religion)
        elif mode == MODE_TEMPLE:
            temple = get_temple_for_religion(religion)
            if temple:
                play_voice(f"{religion}祖庭{temple[0]}。{temple[4][:30]}。{msg}", religion=religion)
            else:
                play_voice(f"{site_name}。{poem_cn}。{msg}", religion=religion)
    threading.Thread(target=dv, daemon=True).start()

    # 获取坐标/天气/时间信息 (后台获取天气，不阻塞)
    site_info = get_site_info(site_name)

    # 合成弹窗图片
    try:
        if mode == MODE_SEAL:
            seal = _get_current_seal()
            # 修行化健康提醒
            health_key = random.choice(list(MINDFUL_REMINDERS.keys()))
            mindful_text = MINDFUL_REMINDERS[health_key]
            pil = compose_seal(seal, health_key, msg, mindful_text, wisdom, st.count)
            # 推进修炼进度 + 记录小鸿修行日志
            prog = _load_progress()
            prog["show_count"] = prog.get("show_count", 0) + 1
            if not prog.get("started_at"):
                prog["started_at"] = datetime.now().strftime("%Y-%m-%d")
            _save_progress(prog)
            log_practice(seal["id"], f"印修弹窗 · {seal['name']}")
        elif mode == MODE_SITE:
            travel = get_travel_guide(site_name)
            pil = compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                               cat, msg, wisdom, st.count, chant_info, travel, site_info)
        elif mode == MODE_PATRIARCH:
            patriarch = get_patriarch_for_religion(religion)
            if patriarch:
                pil = compose_patriarch(patriarch, teaching, religion, cat, msg, wisdom, st.count, chant_info, site_info)
            else:
                travel = get_travel_guide(site_name)
                pil = compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                                   cat, msg, wisdom, st.count, chant_info, travel, site_info)
        elif mode == MODE_TEMPLE:
            temple = get_temple_for_religion(religion)
            if temple:
                travel = get_travel_guide(temple[0])
                temple_info = get_site_info(temple[0]) or site_info
                pil = compose_temple(temple, teaching, religion, cat, msg, wisdom, st.count, chant_info, travel, temple_info)
            else:
                travel = get_travel_guide(site_name)
                pil = compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                                   cat, msg, wisdom, st.count, chant_info, travel, site_info)
        else:
            travel = get_travel_guide(site_name)
            pil = compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                               cat, msg, wisdom, st.count, chant_info, travel, site_info)

        photo = ImageTk.PhotoImage(pil)
    except Exception as e:
        print(f"[弹窗错误] {e}")
        import traceback
        traceback.print_exc()
        stop_ambient()
        return

    popup = tk.Toplevel()
    popup.overrideredirect(True)
    popup.attributes("-topmost", True)
    popup.attributes("-alpha", 0.0)
    sw, sh = popup.winfo_screenwidth(), popup.winfo_screenheight()
    popup.geometry(f"{W}x{H}+{(sw - W) // 2}+{(sh - H) // 2}")

    canvas = tk.Canvas(popup, width=W, height=H, highlightthickness=0)
    canvas.pack()
    canvas.create_image(0, 0, image=photo, anchor="nw")
    canvas._photo = photo

    sec = [POPUP_DURATION_SEC]
    cd = canvas.create_text(W - 35, H - 38, text=f"{sec[0]}s",
                            font=("Microsoft YaHei UI", 10), fill="#999999")

    def close_it():
        stop_ambient()
        if not popup.winfo_exists():
            return
        try:
            a = float(popup.attributes("-alpha"))
        except Exception:
            a = 0.97
        a -= 0.1
        if a <= 0:
            popup.destroy()
        else:
            popup.attributes("-alpha", a)
            popup.after(15, close_it)

    def tick():
        if not popup.winfo_exists():
            return
        sec[0] -= 1
        if sec[0] <= 0:
            close_it()
        else:
            canvas.itemconfig(cd, text=f"{sec[0]}s")
            popup.after(1000, tick)
    popup.after(1000, tick)

    canvas.bind("<Button-1>", lambda e: close_it())

    def fadein(a=0.0):
        if not popup.winfo_exists():
            return
        a = min(a + 0.07, 0.97)
        popup.attributes("-alpha", a)
        if a < 0.97:
            popup.after(16, lambda: fadein(a))
    fadein()

    drag = {"x": 0, "y": 0}
    canvas.bind("<Button-3>", lambda e: drag.update(x=e.x, y=e.y))
    canvas.bind("<B3-Motion>", lambda e: popup.geometry(
        f"+{popup.winfo_x() + e.x - drag['x']}+{popup.winfo_y() + e.y - drag['y']}"))


# ══════════════════════════════════════════════════════
#  托盘 + 面板 + 循环
# ══════════════════════════════════════════════════════

def create_tray():
    try:
        import pystray
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.ellipse([4, 4, 60, 60], fill="#43e97b")
        try:
            f = ImageFont.truetype("msyh.ttc", 26)
            d.text((16, 14), "Om", fill="#fff", font=f)
        except Exception:
            pass
        def _seal_status(it):
            prog = _load_progress()
            seal = _get_current_seal()
            return f"🪷 第{seal['id']}印 · {seal['name']} ({seal['series']})"
        menu = pystray.Menu(
            pystray.MenuItem("立即提醒", lambda i, it: st.root.after(0, show_popup)),
            pystray.MenuItem(lambda it: "继续" if st.paused else "暂停",
                             lambda i, it: setattr(st, 'paused', not st.paused)),
            pystray.MenuItem(_seal_status, enabled=False, action=lambda i, it: None),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("退出", lambda i, it: (
                setattr(st, 'running', False), stop_ambient(), i.stop(), st.root.after(0, st.root.quit))),
        )
        st.tray = pystray.Icon("zuting", img, "全球祖庭之旅 v1.0 — 修行桌面助手", menu)
        threading.Thread(target=st.tray.run, daemon=True).start()
    except Exception:
        pass


def create_panel():
    root = tk.Tk()
    root.title("全球祖庭之旅 v1.0")
    root.geometry("480x380")
    root.configure(bg="#1a1a2e")
    root.resizable(False, False)
    st.root = root

    tk.Label(root, text="全球祖庭之旅 v1.0",
             font=("Microsoft YaHei UI", 16, "bold"),
             fg="#43e97b", bg="#1a1a2e").pack(pady=(16, 2))
    tk.Label(root, text="修行桌面助手 · 小鸿陪你走祖庭",
             font=("Microsoft YaHei UI", 11),
             fg="#ffd700", bg="#1a1a2e").pack()

    # 统计
    n_img = sum(1 for d in [BG_DIR, TEMPLES_DIR, PATRIARCHS_DIR] if d.exists()
                for _ in list(d.glob("*.jpg")) + list(d.glob("*.png")))
    n_snd = len(list(SOUNDS_DIR.glob("*.wav"))) if SOUNDS_DIR.exists() else 0
    rels = len(set(s[1] for s in HOLY_SITES))

    info = (f"{len(HOLY_SITES)}圣地 | {len(ANCESTRAL_TEMPLES)}祖庭 | "
            f"{len(PATRIARCHS)}祖师 | {len(ANCESTRAL_TEACHINGS)}祖训")
    tk.Label(root, text=info, font=("Microsoft YaHei UI", 9),
             fg="#667eea", bg="#1a1a2e").pack(pady=(4, 0))
    tk.Label(root, text=f"{rels}大信仰 | {n_img}图 | {n_snd}音效(含12咒语) | 旅游攻略{len(TRAVEL_GUIDES)}处",
             font=("Microsoft YaHei UI", 9), fg="#667eea", bg="#1a1a2e").pack(pady=(2, 0))
    tk.Label(root, text="四模式轮播: 圣地 → 祖师 → 祖庭 → 愿命印修",
             font=("Microsoft YaHei UI", 9), fg="#888", bg="#1a1a2e").pack(pady=(2, 0))

    sv = tk.StringVar(value="运行中")
    sl = tk.Label(root, textvariable=sv, font=("Microsoft YaHei UI", 13), fg="#43e97b", bg="#1a1a2e")
    sl.pack(pady=(10, 2))

    cv = tk.StringVar()
    tk.Label(root, textvariable=cv, font=("Microsoft YaHei UI", 11), fg="#667eea", bg="#1a1a2e").pack()

    bf = tk.Frame(root, bg="#1a1a2e")
    bf.pack(pady=12)

    def toggle():
        st.paused = not st.paused
        if st.paused:
            sv.set("已暂停"); sl.config(fg="#ffa500"); pb.config(text="继续")
        else:
            sv.set("运行中"); sl.config(fg="#43e97b"); pb.config(text="暂停")

    tk.Button(bf, text="立即提醒", font=("Microsoft YaHei UI", 11),
              fg="#1a1a2e", bg="#43e97b", relief="flat", padx=12, pady=4,
              command=show_popup).pack(side="left", padx=4)
    pb = tk.Button(bf, text="暂停", font=("Microsoft YaHei UI", 11),
                   fg="#1a1a2e", bg="#ffa500", relief="flat", padx=12, pady=4,
                   command=toggle)
    pb.pack(side="left", padx=4)

    tk.Label(root, text="每15分钟轮换 | 四模式自动切换 | 左键关闭 | 右键拖动 | 大愿: 帮助100万人走祖庭",
             font=("Microsoft YaHei UI", 8), fg="#555", bg="#1a1a2e").pack(side="bottom", pady=8)

    def tick():
        if not st.running:
            return
        if st.next_time and not st.paused:
            r = max(0, st.next_time - time.time())
            mode = current_mode()
            mode_cn = {"site": "圣地", "patriarch": "祖师", "temple": "祖庭", "seal": "印修"}.get(mode, "圣地")
            cv.set(f"下次提醒: {int(r // 60):02d}:{int(r % 60):02d}  [{mode_cn}模式]")
        elif st.paused:
            cv.set("已暂停")
        root.after(1000, tick)
    root.after(1000, tick)
    return root


def loop():
    sec = INTERVAL_MINUTES * 60
    while st.running:
        st.next_time = time.time() + sec
        target = st.next_time
        while st.running and time.time() < target:
            time.sleep(1)
            if st.paused:
                target = time.time() + (target - time.time())
                while st.paused and st.running:
                    time.sleep(0.5)
        if st.running and not st.paused and st.root:
            st.root.after(0, show_popup)


def main():
    print("全球祖庭之旅 v1.0 — 修行桌面助手 · 小鸿陪你走祖庭")

    miss = []
    for p, i in [("edge-tts", "edge_tts"), ("pygame", "pygame"), ("pystray", "pystray"), ("Pillow", "PIL")]:
        try:
            __import__(i)
        except ImportError:
            miss.append(p)
    if miss:
        print(f"缺少: {' '.join(miss)}\n运行: pip install {' '.join(miss)}")
        input("按回车退出...")
        return

    try:
        import pygame
        pygame.mixer.init(44100, -16, 2, 2048)
    except Exception:
        pass

    init_order()

    n_img = sum(1 for d in [BG_DIR, TEMPLES_DIR, PATRIARCHS_DIR] if d.exists()
                for _ in list(d.glob("*.jpg")) + list(d.glob("*.png")))
    n_snd = len(list(SOUNDS_DIR.glob("*.wav"))) if SOUNDS_DIR.exists() else 0
    rels = len(set(s[1] for s in HOLY_SITES))

    if n_img == 0:
        print("无图片，先运行: python download_images.py && python download_images_v5.py")
    if n_snd == 0:
        print("无音效，先运行: python generate_sounds.py")

    root = create_panel()
    create_tray()
    threading.Thread(target=loop, daemon=True).start()
    root.after(2000, show_popup)

    print(f"就绪！{len(HOLY_SITES)}圣地 | {len(ANCESTRAL_TEMPLES)}祖庭 | "
          f"{len(PATRIARCHS)}祖师 | {len(ANCESTRAL_TEACHINGS)}祖训 | "
          f"{rels}信仰 | {n_img}图 | {n_snd}音效")
    print("弹窗模式: 圣地 → 祖师 → 祖庭 三模式轮播")

    try:
        root.mainloop()
    except KeyboardInterrupt:
        pass
    finally:
        st.running = False
        stop_ambient()
        if st.tray:
            try:
                st.tray.stop()
            except Exception:
                pass
        print("已退出")


if __name__ == "__main__":
    main()
