"""
修行桌面助手 v3.0 — customtkinter 现代化主面板
4 标签页: 仪表盘 / AI聊天 / 设置 / 关于
"""

import threading
import time
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

import customtkinter as ctk

import config
from religions import (
    HOLY_SITES, ANCESTRAL_TEMPLES, PATRIARCHS, ANCESTRAL_TEACHINGS,
    TRAVEL_GUIDES, CAOXI_SEALS, SEAL_SERIES_COLORS,
)
from core.state import st, current_mode, load_progress, get_current_seal

log = logging.getLogger(__name__)

# 深色主题
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")


def create_panel(show_popup_fn):
    """创建 customtkinter 主面板"""
    root = ctk.CTk()
    root.title(config.APP_TITLE)
    root.geometry("620x520")
    root.resizable(False, False)
    st.root = root

    # ── 顶部标题 ──
    title_frame = ctk.CTkFrame(root, fg_color="transparent")
    title_frame.pack(fill="x", padx=20, pady=(12, 0))

    ctk.CTkLabel(title_frame, text=config.APP_TITLE,
                 font=ctk.CTkFont(size=20, weight="bold"),
                 text_color="#43e97b").pack(side="left")

    status_var = ctk.StringVar(value="● 运行中")
    status_label = ctk.CTkLabel(title_frame, textvariable=status_var,
                                font=ctk.CTkFont(size=13),
                                text_color="#43e97b")
    status_label.pack(side="right")

    ctk.CTkLabel(root, text=config.APP_SUBTITLE,
                 font=ctk.CTkFont(size=12),
                 text_color="#D4A855").pack(pady=(0, 8))

    # ── Tabview ──
    tabview = ctk.CTkTabview(root, width=580, height=360)
    tabview.pack(fill="both", expand=True, padx=15, pady=(0, 5))

    tab_dash = tabview.add("仪表盘")
    tab_chat = tabview.add("AI 小鸿")
    tab_settings = tabview.add("设置")
    tab_about = tabview.add("关于")

    # ═══════════════════════════════════════════════
    #  TAB 1: 仪表盘
    # ═══════════════════════════════════════════════

    _build_dashboard(tab_dash)

    # ═══════════════════════════════════════════════
    #  TAB 2: AI 小鸿
    # ═══════════════════════════════════════════════

    _build_chat(tab_chat)

    # ═══════════════════════════════════════════════
    #  TAB 3: 设置
    # ═══════════════════════════════════════════════

    _build_settings(tab_settings)

    # ═══════════════════════════════════════════════
    #  TAB 4: 关于
    # ═══════════════════════════════════════════════

    _build_about(tab_about)

    # ── 底部控制栏 ──
    bottom = ctk.CTkFrame(root, fg_color="transparent")
    bottom.pack(fill="x", padx=20, pady=(0, 10))

    countdown_var = ctk.StringVar()
    ctk.CTkLabel(bottom, textvariable=countdown_var,
                 font=ctk.CTkFont(size=12),
                 text_color="#667eea").pack(side="left")

    ctk.CTkButton(bottom, text="立即提醒", width=100,
                  fg_color="#43e97b", text_color="#1a1a2e",
                  hover_color="#38d974",
                  command=show_popup_fn).pack(side="right", padx=(5, 0))

    def toggle_pause():
        st.paused = not st.paused
        if st.paused:
            status_var.set("● 已暂停")
            status_label.configure(text_color="#ffa500")
            pause_btn.configure(text="继续")
        else:
            status_var.set("● 运行中")
            status_label.configure(text_color="#43e97b")
            pause_btn.configure(text="暂停")

    pause_btn = ctk.CTkButton(bottom, text="暂停", width=80,
                              fg_color="#ffa500", text_color="#1a1a2e",
                              hover_color="#e69500",
                              command=toggle_pause)
    pause_btn.pack(side="right")

    # ── 倒计时更新 ──
    def tick():
        if not st.running:
            return
        if st.next_time and not st.paused:
            r = max(0, st.next_time - time.time())
            mode = current_mode()
            mode_cn = {
                "site": "圣地", "patriarch": "祖师", "temple": "祖庭",
                "seal": "印修", "tour": "导览"
            }.get(mode, "圣地")
            countdown_var.set(f"下次: {int(r // 60):02d}:{int(r % 60):02d}  [{mode_cn}]")
        elif st.paused:
            countdown_var.set("已暂停")
        root.after(1000, tick)
    root.after(1000, tick)

    return root


# ═══════════════════════════════════════════════════════
#  仪表盘
# ═══════════════════════════════════════════════════════

def _build_dashboard(parent):
    # 修行统计
    stats_frame = ctk.CTkFrame(parent)
    stats_frame.pack(fill="x", padx=10, pady=(10, 5))

    prog = load_progress()
    seal = get_current_seal()
    show_count = prog.get("show_count", 0)
    streak = _get_streak()

    # 第一行: 核心指标
    row1 = ctk.CTkFrame(stats_frame, fg_color="transparent")
    row1.pack(fill="x", padx=10, pady=8)

    _stat_card(row1, "🔥 连续修行", f"{streak} 天", "#ff6b6b").pack(side="left", expand=True, fill="x", padx=5)
    _stat_card(row1, "🪷 当前印", f"第{seal['id']}印 · {seal['name']}", "#D4A855").pack(side="left", expand=True, fill="x", padx=5)
    _stat_card(row1, "📊 累计弹窗", f"{show_count} 次", "#667eea").pack(side="left", expand=True, fill="x", padx=5)

    # 第二行: 印修进度条
    prog_frame = ctk.CTkFrame(parent)
    prog_frame.pack(fill="x", padx=10, pady=5)

    ctk.CTkLabel(prog_frame, text=f"印修进度: {seal['series']} — 第{seal['id']}/30印",
                 font=ctk.CTkFont(size=13, weight="bold"),
                 text_color="#D4A855").pack(padx=10, pady=(8, 2), anchor="w")

    series_color = SEAL_SERIES_COLORS.get(seal["series"], ("#D4A017", "暖金"))
    progress_bar = ctk.CTkProgressBar(prog_frame, width=400, height=12,
                                       progress_color=series_color[0])
    progress_bar.set(seal["id"] / 30)
    progress_bar.pack(padx=10, pady=(0, 8), fill="x")

    # 第三行: 数据统计
    data_frame = ctk.CTkFrame(parent)
    data_frame.pack(fill="x", padx=10, pady=5)

    n_img = sum(1 for d in [config.BG_DIR, config.TEMPLES_DIR, config.PATRIARCHS_DIR] if d.exists()
                for _ in list(d.glob("*.jpg")) + list(d.glob("*.png")))
    n_snd = len(list(config.SOUNDS_DIR.glob("*.wav"))) + len(list(config.SOUNDS_DIR.glob("*.mp3"))) if config.SOUNDS_DIR.exists() else 0
    rels = len(set(s[1] for s in HOLY_SITES))

    info_text = (f"{len(HOLY_SITES)} 圣地  |  {len(ANCESTRAL_TEMPLES)} 祖庭  |  "
                 f"{len(PATRIARCHS)} 祖师  |  {len(ANCESTRAL_TEACHINGS)} 祖训\n"
                 f"{rels} 大信仰  |  {n_img} 图  |  {n_snd} 音效  |  "
                 f"五模式轮播: 圣地→祖师→祖庭→印修→导览")
    ctk.CTkLabel(data_frame, text=info_text,
                 font=ctk.CTkFont(size=11),
                 text_color="#888", justify="left").pack(padx=10, pady=8)

    # API 状态
    api_frame = ctk.CTkFrame(parent)
    api_frame.pack(fill="x", padx=10, pady=5)

    api_status = ctk.StringVar(value="API: 检测中...")
    ctk.CTkLabel(api_frame, textvariable=api_status,
                 font=ctk.CTkFont(size=11),
                 text_color="#888").pack(padx=10, pady=5, anchor="w")

    def check_api():
        try:
            import api_client
            online = api_client.check_api()
            st.api_online = online
            if online:
                api_status.set(f"API: ● 已连接 ({config.get('api_url')})")
            else:
                api_status.set(f"API: ○ 离线模式 (使用本地数据)")
        except Exception:
            api_status.set("API: ○ 离线模式")
    threading.Thread(target=check_api, daemon=True).start()


def _stat_card(parent, label, value, color):
    frame = ctk.CTkFrame(parent)
    ctk.CTkLabel(frame, text=label, font=ctk.CTkFont(size=10),
                 text_color="#888").pack(pady=(5, 0))
    ctk.CTkLabel(frame, text=value, font=ctk.CTkFont(size=13, weight="bold"),
                 text_color=color).pack(pady=(0, 5))
    return frame


def _get_streak():
    try:
        if not config.JOURNAL_FILE.exists():
            return 0
        journal = json.loads(config.JOURNAL_FILE.read_text(encoding="utf-8"))
        if not journal:
            return 0
        dates = sorted(set(e["date"][:10] for e in journal), reverse=True)
        streak = 0
        check_date = datetime.now()
        for _ in range(365):
            ds = check_date.strftime("%Y-%m-%d")
            if ds in dates:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        return streak
    except Exception:
        return 0


# ═══════════════════════════════════════════════════════
#  AI 小鸿聊天
# ═══════════════════════════════════════════════════════

def _build_chat(parent):
    ctk.CTkLabel(parent, text="🪷 小鸿 — 你的修行伙伴",
                 font=ctk.CTkFont(size=14, weight="bold"),
                 text_color="#D4A855").pack(pady=(10, 5))

    # 聊天记录区
    chat_box = ctk.CTkTextbox(parent, width=520, height=220,
                               font=ctk.CTkFont(size=12),
                               state="disabled")
    chat_box.pack(padx=10, pady=5, fill="both", expand=True)

    # 添加欢迎消息
    chat_box.configure(state="normal")
    chat_box.insert("end", "小鸿: 愿力不退，精进不止。有什么修行上的疑惑？\n\n")
    chat_box.configure(state="disabled")

    # 输入区
    input_frame = ctk.CTkFrame(parent, fg_color="transparent")
    input_frame.pack(fill="x", padx=10, pady=(0, 10))

    input_var = ctk.StringVar()
    entry = ctk.CTkEntry(input_frame, textvariable=input_var, width=420,
                         placeholder_text="问小鸿修行问题...",
                         font=ctk.CTkFont(size=12))
    entry.pack(side="left", fill="x", expand=True, padx=(0, 5))

    def send_message():
        msg = input_var.get().strip()
        if not msg:
            return
        input_var.set("")

        chat_box.configure(state="normal")
        chat_box.insert("end", f"你: {msg}\n")
        chat_box.insert("end", "小鸿: ")
        chat_box.see("end")
        chat_box.configure(state="disabled")

        # 尝试 API SSE 流
        def on_token(token):
            if st.root:
                st.root.after(0, lambda: _append_token(chat_box, token))

        def on_done(full_text):
            if st.root:
                st.root.after(0, lambda: _finish_reply(chat_box, full_text))

        try:
            import api_client
            if st.api_online:
                api_client.stream_xiaohong_chat(msg, on_token=on_token, on_done=on_done)
                return
        except Exception:
            pass

        # 离线回退: 使用本地小鸿
        from xiaohong_agent import get_greeting, get_cross_insight, get_zuting_vision
        seal = get_current_seal()
        reply = "[离线模式] " + get_greeting() + "\n" + get_cross_insight(seal["series"])
        chat_box.configure(state="normal")
        chat_box.insert("end", f"{reply}\n\n")
        chat_box.see("end")
        chat_box.configure(state="disabled")

    send_btn = ctk.CTkButton(input_frame, text="发送", width=80,
                             fg_color="#D4A855", text_color="#1a1a2e",
                             hover_color="#c49a4a",
                             command=send_message)
    send_btn.pack(side="right")

    entry.bind("<Return>", lambda e: send_message())


def _append_token(chat_box, token):
    chat_box.configure(state="normal")
    chat_box.insert("end", token)
    chat_box.see("end")
    chat_box.configure(state="disabled")


def _finish_reply(chat_box, full_text):
    chat_box.configure(state="normal")
    if full_text is None:
        chat_box.insert("end", "(AI 连接失败，已回退离线模式)\n")
        # 离线回退
        from xiaohong_agent import get_greeting, get_cross_insight
        from core.state import get_current_seal
        seal = get_current_seal()
        fallback = get_greeting() + "\n" + get_cross_insight(seal["series"])
        chat_box.insert("end", f"小鸿: [离线] {fallback}")
    chat_box.insert("end", "\n\n")
    chat_box.see("end")
    chat_box.configure(state="disabled")


# ═══════════════════════════════════════════════════════
#  设置
# ═══════════════════════════════════════════════════════

def _build_settings(parent):
    scroll = ctk.CTkScrollableFrame(parent, width=520, height=280)
    scroll.pack(fill="both", expand=True, padx=5, pady=5)

    # 弹窗间隔
    ctk.CTkLabel(scroll, text="弹窗间隔 (分钟)",
                 font=ctk.CTkFont(size=12, weight="bold")).pack(anchor="w", padx=10, pady=(10, 2))

    interval_var = ctk.IntVar(value=config.get("interval_minutes"))
    interval_label = ctk.CTkLabel(scroll, text=f"{interval_var.get()} 分钟",
                                  font=ctk.CTkFont(size=11))
    interval_label.pack(anchor="w", padx=10)

    def on_interval(val):
        v = int(float(val))
        interval_var.set(v)
        interval_label.configure(text=f"{v} 分钟")
        config.set_val("interval_minutes", v)

    ctk.CTkSlider(scroll, from_=5, to=60, number_of_steps=11,
                  variable=interval_var, command=on_interval,
                  width=400).pack(padx=10, pady=(0, 10))

    # 弹窗持续时间
    ctk.CTkLabel(scroll, text="弹窗持续时间 (秒)",
                 font=ctk.CTkFont(size=12, weight="bold")).pack(anchor="w", padx=10, pady=(5, 2))

    dur_var = ctk.IntVar(value=config.get("popup_duration_sec"))
    dur_label = ctk.CTkLabel(scroll, text=f"{dur_var.get()} 秒",
                             font=ctk.CTkFont(size=11))
    dur_label.pack(anchor="w", padx=10)

    def on_dur(val):
        v = int(float(val))
        dur_var.set(v)
        dur_label.configure(text=f"{v} 秒")
        config.set_val("popup_duration_sec", v)

    ctk.CTkSlider(scroll, from_=10, to=120, number_of_steps=22,
                  variable=dur_var, command=on_dur,
                  width=400).pack(padx=10, pady=(0, 10))

    # 语音开关
    voice_var = ctk.BooleanVar(value=config.get("voice_enabled"))

    def on_voice():
        config.set_val("voice_enabled", voice_var.get())

    ctk.CTkCheckBox(scroll, text="启用语音播报",
                    variable=voice_var, command=on_voice,
                    font=ctk.CTkFont(size=12)).pack(anchor="w", padx=10, pady=5)

    # 弹窗尺寸
    ctk.CTkLabel(scroll, text="弹窗尺寸",
                 font=ctk.CTkFont(size=12, weight="bold")).pack(anchor="w", padx=10, pady=(10, 2))

    size_var = ctk.StringVar(value=f"{config.get('popup_width')}x{config.get('popup_height')}")

    def on_size(choice):
        w, h = choice.split("x")
        config.set_val("popup_width", int(w))
        config.set_val("popup_height", int(h))

    ctk.CTkOptionMenu(scroll, values=["800x600", "1000x700", "1200x800"],
                      variable=size_var, command=on_size,
                      width=200).pack(anchor="w", padx=10, pady=(0, 10))

    # API 地址
    ctk.CTkLabel(scroll, text="API 地址",
                 font=ctk.CTkFont(size=12, weight="bold")).pack(anchor="w", padx=10, pady=(5, 2))

    api_var = ctk.StringVar(value=config.get("api_url"))

    def on_api_change(*args):
        config.set_val("api_url", api_var.get())

    api_entry = ctk.CTkEntry(scroll, textvariable=api_var, width=400,
                             font=ctk.CTkFont(size=11))
    api_entry.pack(anchor="w", padx=10, pady=(0, 10))
    api_var.trace_add("write", on_api_change)


# ═══════════════════════════════════════════════════════
#  关于
# ═══════════════════════════════════════════════════════

def _build_about(parent):
    ctk.CTkLabel(parent, text=f"🌍 {config.APP_TITLE}",
                 font=ctk.CTkFont(size=18, weight="bold"),
                 text_color="#43e97b").pack(pady=(15, 2))

    ctk.CTkLabel(parent, text=config.APP_SUBTITLE,
                 font=ctk.CTkFont(size=13),
                 text_color="#D4A855").pack()

    about_text = """
12大信仰 × 200+圣地 × 260+祖庭 × 290+祖师 × 190+祖训
× 370+经典语录 × 曹溪愿命三十印修炼体系
× 旅游攻略 × GPS坐标 × 实时天气 × 多语言吟诵
× AI 小鸿修行智能体 × 多媒体导览

五模式轮播: 圣地 → 祖师 → 祖庭 → 愿命印修 → 多媒体导览

大愿: 帮助100万人走祖庭，建立全球宗教文化和平使者网络
"""
    ctk.CTkLabel(parent, text=about_text,
                 font=ctk.CTkFont(size=11),
                 text_color="#aaa", justify="center").pack(pady=5)

    ctk.CTkLabel(parent, text=f"版本 {config.VERSION}  |  设备ID: {config.get('device_id')[:8]}...",
                 font=ctk.CTkFont(size=10),
                 text_color="#666").pack(pady=(10, 0))

    ctk.CTkLabel(parent, text="JOINUS.COM — 加入我们，探索世界",
                 font=ctk.CTkFont(size=12, weight="bold"),
                 text_color="#667eea").pack(pady=(5, 0))
