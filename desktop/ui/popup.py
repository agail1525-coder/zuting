"""
修行桌面助手 v3.0 — 弹窗显示
"""

import tkinter as tk
import threading
import random
import time
import logging
from datetime import datetime

from PIL import ImageTk

import config
from religions import (
    HEALTH_REMINDERS, UNIVERSAL_WISDOM, CHANT_SOUNDS, RELIGION_QUOTES,
    MINDFUL_REMINDERS,
)
from core.state import (
    st, current_mode, next_site, get_current_seal,
    get_patriarch_for_religion, get_temple_for_religion,
    get_teaching_for_religion, get_travel_guide,
    load_progress, save_progress,
)
from audio.player import play_chant, play_seal_chant, stop_all
from audio.tts import play_voice
from compose.base import get_site_info
from compose.site_card import compose_site
from compose.patriarch_card import compose_patriarch
from compose.temple_card import compose_temple
from compose.seal_card import compose_seal
from compose.tour_card import compose_tour
from xiaohong_agent import log_practice

log = logging.getLogger(__name__)


def show_popup():
    try:
        from PIL import Image
    except ImportError:
        return

    st.count += 1
    mode = current_mode()
    st.mode_idx += 1

    # 基础数据
    site = next_site()
    site_name, religion, country, ambient_sound = site[0], site[1], site[2], site[3]
    quotes_pool = RELIGION_QUOTES.get(religion, [])
    if quotes_pool:
        poem_orig, poem_src, poem_cn = random.choice(quotes_pool)
    else:
        poem_orig, poem_src, poem_cn = site[5], site[6], site[7]

    cat = random.choice(list(HEALTH_REMINDERS.keys()))
    msg = random.choice(HEALTH_REMINDERS[cat])
    wisdom = random.choice(UNIVERSAL_WISDOM)
    chant_info = CHANT_SOUNDS.get(religion)
    teaching = get_teaching_for_religion(religion)

    # 背景音乐
    if mode == config.MODE_SEAL:
        seal_preview = get_current_seal()
        play_seal_chant(seal_preview["series"])
    else:
        play_chant(religion)

    # 延迟语音
    def dv():
        time.sleep(3.5)
        if mode == config.MODE_SEAL:
            seal = get_current_seal()
            poem_text = seal["poem"].replace("\n", "，")
            play_voice(f"第{seal['id']}印，{seal['name']}。{poem_text}", religion="佛教")
        elif mode == config.MODE_SITE or mode == config.MODE_TOUR:
            play_voice(f"{site_name}。{poem_cn}。{msg}", religion=religion)
        elif mode == config.MODE_PATRIARCH:
            patriarch = get_patriarch_for_religion(religion)
            if patriarch:
                play_voice(f"{religion}祖师{patriarch[0]}。{patriarch[5][:30]}。{msg}", religion=religion)
            else:
                play_voice(f"{site_name}。{poem_cn}。{msg}", religion=religion)
        elif mode == config.MODE_TEMPLE:
            temple = get_temple_for_religion(religion)
            if temple:
                play_voice(f"{religion}祖庭{temple[0]}。{temple[4][:30]}。{msg}", religion=religion)
            else:
                play_voice(f"{site_name}。{poem_cn}。{msg}", religion=religion)
    threading.Thread(target=dv, daemon=True).start()

    site_info = get_site_info(site_name)

    # 合成弹窗图片
    try:
        if mode == config.MODE_TOUR:
            # 多媒体导览模式
            import data_provider
            media = data_provider.get_random_media_for_site(site_name)
            if media:
                pil = compose_tour(site_name, religion, country, media, wisdom, st.count, site_info)
            else:
                # 无媒体内容，回退到圣地模式
                travel = get_travel_guide(site_name)
                pil = compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                                   cat, msg, wisdom, st.count, chant_info, travel, site_info)
        elif mode == config.MODE_SEAL:
            seal = get_current_seal()
            health_key = random.choice(list(MINDFUL_REMINDERS.keys()))
            mindful_text = MINDFUL_REMINDERS[health_key]
            pil = compose_seal(seal, health_key, msg, mindful_text, wisdom, st.count)
            prog = load_progress()
            prog["show_count"] = prog.get("show_count", 0) + 1
            if not prog.get("started_at"):
                prog["started_at"] = datetime.now().strftime("%Y-%m-%d")
            save_progress(prog)
            log_practice(seal["id"], f"印修弹窗 · {seal['name']}")
            # 云端同步
            try:
                import api_client
                api_client.post_journal(seal["id"], f"印修弹窗 · {seal['name']}")
            except Exception:
                pass
        elif mode == config.MODE_SITE:
            travel = get_travel_guide(site_name)
            pil = compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                               cat, msg, wisdom, st.count, chant_info, travel, site_info)
        elif mode == config.MODE_PATRIARCH:
            patriarch = get_patriarch_for_religion(religion)
            if patriarch:
                pil = compose_patriarch(patriarch, teaching, religion, cat, msg, wisdom, st.count, chant_info, site_info)
            else:
                travel = get_travel_guide(site_name)
                pil = compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                                   cat, msg, wisdom, st.count, chant_info, travel, site_info)
        elif mode == config.MODE_TEMPLE:
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
        log.error(f"弹窗合成错误: {e}", exc_info=True)
        stop_all()
        return

    # 创建弹窗窗口
    W = config.get("popup_width")
    H = config.get("popup_height")
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

    duration = config.get("popup_duration_sec")
    sec = [duration]
    cd = canvas.create_text(W - 35, H - 38, text=f"{sec[0]}s",
                            font=("Microsoft YaHei UI", 10), fill="#999999")

    def close_it():
        stop_all()
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
