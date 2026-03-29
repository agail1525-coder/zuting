"""
修行桌面助手 v3.0 — 多媒体导览弹窗合成
第5种弹窗模式: 从 Media API 获取圣地音频/视频导览
"""

from datetime import datetime
from PIL import Image, ImageDraw, ImageEnhance

import config
from religions import RELIGION_STYLES
from compose.base import (
    font, draw_text_multi, draw_wrapped, load_bg, base_overlay, find_image,
)


def compose_tour(site_name, religion, country, media_item, wisdom, count, site_info=None):
    """合成多媒体导览弹窗"""
    w, h = config.get("popup_width"), config.get("popup_height")
    style = RELIGION_STYLES.get(religion, {"symbol": "◎", "color": (200, 200, 200), "color2": (150, 150, 150)})
    duration = config.get("popup_duration_sec")

    bg = load_bg(find_image(site_name, [config.BG_DIR]), w, h)
    bg = ImageEnhance.Brightness(bg).enhance(0.35)
    bg = bg.convert("RGBA")

    has_geo = site_info is not None
    media_type = media_item.get("mediaType", "AUDIO")
    media_title = media_item.get("title", "导览")
    media_desc = media_item.get("description", "")
    media_duration = media_item.get("duration", 0)

    type_label = {"AUDIO": "🎧 音频导览", "VIDEO": "🎬 视频导览", "PANORAMA": "🌐 全景导览"}.get(media_type, "📱 导览")

    def draw_cards(d, rc):
        if has_geo:
            d.rounded_rectangle([30, 48, w - 30, 80], radius=8, fill=(0, 0, 0, 170))
        # 主卡: 导览信息
        d.rounded_rectangle([30, 90, w - 30, int(h * 0.65)], radius=14, fill=(0, 0, 0, 165))
        # 播放控制区
        d.rounded_rectangle([30, int(h * 0.67), w - 30, int(h * 0.82)], radius=14, fill=(0, 0, 0, 140))
        d.rectangle([0, h - 65, w, h], fill=(0, 0, 0, 185))
        d.rounded_rectangle([w // 2 - 120, h - 55, w // 2 + 120, h - 15], radius=8,
                            fill=(rc[0], rc[1], rc[2], 220))

    ov = base_overlay(w, h, style, draw_cards)
    bg = Image.alpha_composite(bg, ov).convert("RGB")
    draw = ImageDraw.Draw(bg)

    f11, f13, f15, f17, f20, f24 = font(11), font(13), font(15), font(17), font(20), font(24, True)

    # 顶栏
    header = f"{style['symbol']}  {religion}  ·  {site_name}  ·  多媒体导览"
    draw_text_multi(draw, (20, 14), header, (255, 255, 255), 20)
    tt = f"[导览] 第{count}次  {datetime.now().strftime('%H:%M')}"
    bb = draw.textbbox((0, 0), tt, font=f13)
    draw.text((w - 20 - (bb[2] - bb[0]), 18), tt, fill=(200, 200, 200), font=f13)

    if has_geo:
        geo_parts = [f"⊙ {site_info['coord_str']}"]
        geo_parts.append(f"◷ 当地{site_info['local_time']}({site_info['utc_label']})")
        if site_info['weather']:
            geo_parts.append(site_info['weather'])
        draw_text_multi(draw, (45, 56), "  |  ".join(geo_parts), (160, 220, 255), 11)

    cx = 55
    # 导览类型标签
    draw_text_multi(draw, (cx, 108), type_label, style["color"], 20, bold=True)

    # 导览标题
    draw.text((cx, 145), media_title, fill=(255, 255, 255), font=f24)

    # 时长
    if media_duration:
        mins = media_duration // 60
        secs = media_duration % 60
        dur_text = f"时长: {mins}:{secs:02d}"
        draw.text((cx, 185), dur_text, fill=(180, 200, 220), font=f15)

    # 导览描述
    if media_desc:
        draw_wrapped(draw, media_desc, cx, 215, w - 60 - cx, f17, (220, 220, 200))

    # 播放控制区
    ctrl_y = int(h * 0.69)
    # 播放进度条
    bar_x = cx
    bar_w = w - cx - 55
    bar_y = ctrl_y + 15
    draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + 8], radius=4, fill=(60, 60, 80))
    # 模拟进度 (静态)
    draw.rounded_rectangle([bar_x, bar_y, bar_x + int(bar_w * 0.3), bar_y + 8], radius=4, fill=style["color"])
    # 播放按钮 (大圆)
    btn_cx = w // 2
    btn_cy = ctrl_y + 50
    draw.ellipse([btn_cx - 25, btn_cy - 25, btn_cx + 25, btn_cy + 25], fill=style["color"])
    # 三角形播放符号
    draw.polygon([(btn_cx - 8, btn_cy - 15), (btn_cx - 8, btn_cy + 15), (btn_cx + 15, btn_cy)],
                 fill=(30, 30, 46))

    draw.text((cx, ctrl_y + 80), f"{country}  ·  正在播放", fill=(180, 180, 200), font=f13)

    # 底部
    draw.text((20, h - 82), f"  {wisdom}", fill=(200, 200, 200), font=f13)
    link_text = f"在线导览 → joinus.com/holy-sites"
    draw.text((20, h - 100), link_text, fill=(100, 160, 255), font=f11)
    bt = "知道了，继续探索！"
    bb = draw.textbbox((0, 0), bt, font=f20)
    draw.text(((w - (bb[2] - bb[0])) // 2, h - 48), bt, fill=(30, 30, 46), font=font(18, True))
    draw.text((w - 50, h - 48), f"{duration}s", fill=(150, 150, 150), font=f13)

    return bg
