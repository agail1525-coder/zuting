"""
全球祖庭之旅 v3.0 — 修行桌面助手
12大信仰 × 200+圣地 × 260+祖庭 × 290+祖师 × 190+祖训 × 370+经典语录
× 曹溪愿命三十印修炼体系 × 旅游攻略 × GPS坐标 × 实时天气
× 12原语言吟诵MP3 × 5系修炼吟诵 × 男女交替播报 + 当地语言
× AI 小鸿修行智能体 (接入 Qwen AI) × 多媒体导览
五种弹窗模式轮播: 圣地 → 祖师 → 祖庭 → 愿命印修 → 多媒体导览
大愿: 帮助100万人走祖庭，建立全球宗教文化和平使者网络
"""

import sys
import logging
import threading

import config
from religions import HOLY_SITES, ANCESTRAL_TEMPLES, PATRIARCHS, ANCESTRAL_TEACHINGS

# 日志
logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(name)s: %(message)s"
)
log = logging.getLogger("zuting")


def main():
    print(f"{config.APP_TITLE} — {config.APP_SUBTITLE}")

    # 依赖检查
    miss = []
    for pkg, mod in [("edge-tts", "edge_tts"), ("pygame", "pygame"),
                     ("pystray", "pystray"), ("Pillow", "PIL"),
                     ("customtkinter", "customtkinter"), ("httpx", "httpx")]:
        try:
            __import__(mod)
        except ImportError:
            miss.append(pkg)
    if miss:
        print(f"缺少: {' '.join(miss)}\n运行: pip install {' '.join(miss)}")
        input("按回车退出...")
        return

    # 初始化 pygame mixer
    try:
        import pygame
        pygame.mixer.init(44100, -16, 2, 2048)
    except Exception:
        pass

    # 初始化圣地轮换
    from core.state import st, init_order
    init_order()

    # 资源统计
    n_img = sum(1 for d in [config.BG_DIR, config.TEMPLES_DIR, config.PATRIARCHS_DIR] if d.exists()
                for _ in list(d.glob("*.jpg")) + list(d.glob("*.png")))
    n_snd = (len(list(config.SOUNDS_DIR.glob("*.wav"))) + len(list(config.SOUNDS_DIR.glob("*.mp3")))
             if config.SOUNDS_DIR.exists() else 0)
    rels = len(set(s[1] for s in HOLY_SITES))

    if n_img == 0:
        print("无图片，先运行: python download_images.py && python download_images_v5.py")
    if n_snd == 0:
        print("无音效，先运行: python generate_sounds.py")

    # 创建 UI
    from ui.popup import show_popup
    from ui.panel import create_panel
    from ui.tray import create_tray
    from core.scheduler import loop

    root = create_panel(show_popup)
    create_tray(show_popup)
    threading.Thread(target=loop, args=(st, show_popup), daemon=True).start()
    root.after(2000, show_popup)

    print(f"就绪！{len(HOLY_SITES)}圣地 | {len(ANCESTRAL_TEMPLES)}祖庭 | "
          f"{len(PATRIARCHS)}祖师 | {len(ANCESTRAL_TEACHINGS)}祖训 | "
          f"{rels}信仰 | {n_img}图 | {n_snd}音效")
    print(f"五模式轮播: 圣地 → 祖师 → 祖庭 → 印修 → 导览")
    print(f"弹窗尺寸: {config.get('popup_width')}x{config.get('popup_height')} | 间隔: {config.get('interval_minutes')}分钟")

    try:
        root.mainloop()
    except KeyboardInterrupt:
        pass
    finally:
        st.running = False
        from audio.player import stop_all
        stop_all()
        if st.tray:
            try:
                st.tray.stop()
            except Exception:
                pass
        print("已退出")


if __name__ == "__main__":
    main()
