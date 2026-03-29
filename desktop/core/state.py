"""
修行桌面助手 v3.0 — 全局状态管理
"""

import json
import random
import logging
from datetime import datetime

from religions import (
    HOLY_SITES, ANCESTRAL_TEMPLES, PATRIARCHS, ANCESTRAL_TEACHINGS,
    TRAVEL_GUIDES, SITE_COORDS, CAOXI_SEALS,
)
import config

log = logging.getLogger(__name__)


class State:
    running = True
    paused = False
    count = 0
    next_time = None
    root = None
    tray = None
    order = []
    idx = 0
    mode_idx = 0
    api_online = False


st = State()


def current_mode():
    modes = config.MODES
    mode = modes[st.mode_idx % len(modes)]
    # 多媒体导览模式在离线时跳过
    if mode == config.MODE_TOUR and not st.api_online:
        st.mode_idx += 1
        mode = modes[st.mode_idx % len(modes)]
    return mode


def load_progress():
    try:
        if config.PROGRESS_FILE.exists():
            return json.loads(config.PROGRESS_FILE.read_text(encoding="utf-8"))
    except Exception:
        log.debug("无法加载进度文件", exc_info=True)
    return {"current_seal": 0, "started_at": "", "show_count": 0}


def save_progress(prog):
    try:
        config.PROGRESS_FILE.write_text(
            json.dumps(prog, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    except Exception:
        log.warning("无法保存进度文件", exc_info=True)


def get_current_seal():
    prog = load_progress()
    show_count = prog.get("show_count", 0)
    seal_idx = (show_count // 1) % len(CAOXI_SEALS)
    return CAOXI_SEALS[seal_idx]


def init_order():
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
    matches = [p for p in PATRIARCHS if p[1] == religion]
    return random.choice(matches) if matches else None


def get_temple_for_religion(religion):
    matches = [t for t in ANCESTRAL_TEMPLES if t[1] == religion]
    return random.choice(matches) if matches else None


def get_teaching_for_religion(religion):
    matches = [t for t in ANCESTRAL_TEACHINGS if t[1] == religion]
    return random.choice(matches) if matches else None


def get_travel_guide(site_name):
    return TRAVEL_GUIDES.get(site_name, None)


def get_coords(site_name):
    return SITE_COORDS.get(site_name, None)
