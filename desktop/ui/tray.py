"""
修行桌面助手 v3.0 — 系统托盘
"""

import threading
import logging

from PIL import Image, ImageDraw, ImageFont

import config
from core.state import st, load_progress, get_current_seal
from audio.player import stop_all

log = logging.getLogger(__name__)


def create_tray(show_popup_fn):
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
            seal = get_current_seal()
            return f"🪷 第{seal['id']}印 · {seal['name']} ({seal['series']})"

        menu = pystray.Menu(
            pystray.MenuItem("立即提醒", lambda i, it: st.root.after(0, show_popup_fn)),
            pystray.MenuItem(lambda it: "继续" if st.paused else "暂停",
                             lambda i, it: setattr(st, 'paused', not st.paused)),
            pystray.MenuItem(_seal_status, enabled=False, action=lambda i, it: None),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("退出", lambda i, it: (
                setattr(st, 'running', False), stop_all(), i.stop(), st.root.after(0, st.root.quit))),
        )
        st.tray = pystray.Icon("zuting", img, f"{config.APP_TITLE} — {config.APP_SUBTITLE}", menu)
        threading.Thread(target=st.tray.run, daemon=True).start()
    except Exception:
        log.debug("创建系统托盘失败", exc_info=True)
