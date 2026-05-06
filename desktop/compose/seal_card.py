"""
修行桌面助手 v5.0 — 愿命印修弹窗合成
"""

from datetime import datetime
from PIL import Image, ImageDraw

import config
from religions import SEAL_SERIES_COLORS
from xiaohong_agent import compose_xiaohong_wisdom
from compose.base import font, draw_text_multi, draw_wrapped


def compose_seal(seal, health_key, health_val, mindful_text, wisdom, count):
    w, h = config.get("popup_width"), config.get("popup_height")
    duration = config.get("popup_duration_sec")
    series = seal["series"]
    color_hex, color_name = SEAL_SERIES_COLORS.get(series, ("#D4A017", "暖金"))
    cr = int(color_hex[1:3], 16)
    cg = int(color_hex[3:5], 16)
    cb = int(color_hex[5:7], 16)
    sc = (cr, cg, cb)

    bg = Image.new("RGB", (w, h), (18, 10, 35))
    draw = ImageDraw.Draw(bg)
    for y in range(h):
        r = int(18 + (25 - 18) * y / h)
        g = int(10 + (15 - 10) * y / h)
        b = int(35 + (55 - 35) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    for y in range(50):
        a_ratio = 1 - y / 50
        rr = int(cr * a_ratio + 18 * (1 - a_ratio))
        gg = int(cg * a_ratio + 10 * (1 - a_ratio))
        bb = int(cb * a_ratio + 35 * (1 - a_ratio))
        draw.line([(0, y), (w, y)], fill=(rr, gg, bb))

    f11 = font(11)
    f13 = font(13)
    f15 = font(15)
    f17 = font(17)
    f20 = font(20, True)
    f22 = font(22, True)
    f26 = font(26, True)

    BOTTOM_RESERVED = 50

    # 顶部
    draw_text_multi(draw, (20, 12), f"❖ 曹溪愿命 · {series}", (255, 255, 255), 20, bold=True)
    draw.text((w - 220, 12), f"[印修] 第{count}次  {datetime.now().strftime('%H:%M')}", fill=(180, 180, 180), font=f13)

    seal_title = f"第{seal['id']}印 · {seal['name']}"
    draw.text((30, 58), seal_title, fill=sc, font=f26)

    # 偈语框
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
    poem_y += 8

    content_top = poem_y + 10
    content_bottom = h - BOTTOM_RESERVED
    avail = content_bottom - content_top

    essence_limit = 80 if avail < 280 else 120
    practice_limit = 60 if avail < 280 else 100
    show_vow = avail >= 240

    ey = content_top
    draw.text((30, ey), "◇ 印义：", fill=sc, font=f15)
    ey = draw_wrapped(draw, seal["essence"][:essence_limit], 30, ey + 22, w - 60, f13, (200, 200, 210))

    ey += 6
    draw.text((30, ey), "◈ 今日修持：", fill=(255, 200, 150), font=f15)
    ey = draw_wrapped(draw, seal["practice"][:practice_limit], 30, ey + 22, w - 60, f11, (180, 180, 190))

    if seal["vow"] and show_vow:
        ey += 4
        vow_short = seal["vow"].replace("\n", " ")[:60] + "..."
        draw.text((30, ey), f"▸ {vow_short}", fill=(150, 170, 200), font=f11)
        ey += 18

    ey += 6
    draw.line([(20, ey), (w - 20, ey)], fill=(60, 50, 80))
    ey += 8

    remaining = content_bottom - ey
    if remaining > 60:
        draw.text((30, ey), health_key, fill=sc, font=f17)
        ey += 26
        if remaining > 85:
            xh = compose_xiaohong_wisdom(seal)
            draw_wrapped(draw, f"~ {mindful_text}", 30, ey, w - 60, f11, (180, 190, 200))
        ey += 18

    # 平台链接
    link_text = "更多修行功能 → joinus.com/seals"
    draw.text((30, h - 58), link_text, fill=(100, 160, 255), font=f11)
    bt = "知道了，继续修行！"
    bb = draw.textbbox((0, 0), bt, font=f17)
    draw.text(((w - (bb[2] - bb[0])) // 2, h - 40), bt, fill=sc, font=f17)
    draw.text((w - 50, h - 40), f"{duration}s", fill=(150, 150, 150), font=f13)

    return bg
