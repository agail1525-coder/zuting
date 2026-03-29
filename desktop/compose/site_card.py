"""
修行桌面助手 v3.0 — 圣地弹窗合成
"""

from datetime import datetime
from PIL import Image, ImageEnhance, ImageDraw

import config
from religions import RELIGION_STYLES
from compose.base import (
    font, draw_text_multi, draw_wrapped, load_bg, base_overlay, find_image,
)


def compose_site(site_name, religion, country, poem_orig, poem_src, poem_cn,
                 category, message, wisdom, count, chant_info, travel, site_info=None):
    w, h = config.get("popup_width"), config.get("popup_height")
    style = RELIGION_STYLES.get(religion, {"symbol": "◎", "color": (200, 200, 200), "color2": (150, 150, 150)})
    duration = config.get("popup_duration_sec")

    bg = load_bg(find_image(site_name, [config.BG_DIR]), w, h)
    bg = ImageEnhance.Brightness(bg).enhance(0.42)
    bg = bg.convert("RGBA")

    has_geo = site_info is not None

    # 自适应布局比例
    scale = h / 600

    def draw_cards(d, rc):
        if has_geo:
            d.rounded_rectangle([30, 48, w - 30, 80], radius=8, fill=(0, 0, 0, 170))
        d.rounded_rectangle([30, 90, w - 30, int(90 + 220 * scale)], radius=14, fill=(0, 0, 0, 155))
        d.rounded_rectangle([30, int(90 + 235 * scale), w - 30, int(90 + 355 * scale)], radius=14, fill=(0, 0, 0, 135))
        if travel:
            d.rounded_rectangle([30, int(90 + 370 * scale), w - 30, int(90 + 440 * scale)], radius=14, fill=(0, 0, 0, 120))
        d.rectangle([0, h - 65, w, h], fill=(0, 0, 0, 185))
        d.rounded_rectangle([w // 2 - 120, h - 55, w // 2 + 120, h - 15], radius=8,
                            fill=(rc[0], rc[1], rc[2], 220))

    ov = base_overlay(w, h, style, draw_cards)
    bg = Image.alpha_composite(bg, ov).convert("RGB")
    draw = ImageDraw.Draw(bg)

    f11, f13, f15, f17, f20, f24 = font(11), font(13), font(15), font(17), font(20), font(24, True)

    # 顶栏
    header = f"{style['symbol']}  {religion}  ·  {site_name}  ·  {country}"
    draw_text_multi(draw, (20, 14), header, (255, 255, 255), 20)
    tt = f"[圣地] 第{count}次  {datetime.now().strftime('%H:%M')}"
    bb = draw.textbbox((0, 0), tt, font=f13)
    draw.text((w - 20 - (bb[2] - bb[0]), 18), tt, fill=(200, 200, 200), font=f13)

    if has_geo:
        geo_parts = [f"⊙ {site_info['coord_str']}"]
        geo_parts.append(f"◷ 当地{site_info['local_time']}({site_info['utc_label']})")
        if site_info['weather']:
            geo_parts.append(site_info['weather'])
        draw_text_multi(draw, (45, 56), "  |  ".join(geo_parts), (160, 220, 255), 11)

    cx = 55
    draw_wrapped(draw, poem_orig, cx, 108, w - 60 - cx, font(20), (255, 255, 255))
    draw_text_multi(draw, (cx, int(108 + 67 * scale)), f"— {poem_src}", style["color"], 15)
    draw_wrapped(draw, poem_cn, cx, int(108 + 92 * scale), w - 60 - cx, f17, (220, 220, 200))
    if chant_info:
        draw_text_multi(draw, (cx, int(108 + 162 * scale)), f"♫ {chant_info['name']}: {chant_info['text'][:25]}...", (180, 220, 180), 13)
    draw_text_multi(draw, (cx, int(108 + 182 * scale)), f"{style['symbol']}  {religion}经典", (180, 180, 180), 13)

    # 健康提醒区
    y2 = int(90 + 250 * scale)
    draw.text((cx, y2), category, fill=style["color"], font=f24)
    draw_wrapped(draw, message, cx, y2 + 38, w - 60 - cx, f17, (255, 255, 255))

    # 旅游攻略区
    if travel:
        y3 = int(90 + 383 * scale)
        draw.text((cx, y3), f"✈ 最佳: {travel['season']}  |  交通: {travel['transport'][:30]}", fill=(180, 200, 220), font=f13)
        draw.text((cx, y3 + 20), f"   门票: {travel['ticket']}  |  贴士: {travel['tips'][:28]}", fill=(160, 180, 200), font=f13)

    # 底部
    draw.text((20, h - 82), f"  {wisdom}", fill=(200, 200, 200), font=f13)
    # 平台链接
    link_text = f"查看详情 → joinus.com/holy-sites"
    draw.text((20, h - 100), link_text, fill=(100, 160, 255), font=f11)
    bt = "知道了，马上动！"
    bb = draw.textbbox((0, 0), bt, font=f20)
    draw.text(((w - (bb[2] - bb[0])) // 2, h - 48), bt, fill=(30, 30, 46), font=font(18, True))
    draw.text((w - 50, h - 48), f"{duration}s", fill=(150, 150, 150), font=f13)

    return bg
