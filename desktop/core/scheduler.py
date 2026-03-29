"""
修行桌面助手 v3.0 — 定时调度器
"""

import time
import config


def loop(st, show_popup_fn):
    """主循环: 每隔 interval 分钟触发弹窗"""
    while st.running:
        sec = config.get("interval_minutes") * 60
        st.next_time = time.time() + sec
        target = st.next_time
        while st.running and time.time() < target:
            time.sleep(1)
            if st.paused:
                target = time.time() + (target - time.time())
                while st.paused and st.running:
                    time.sleep(0.5)
        if st.running and not st.paused and st.root:
            st.root.after(0, show_popup_fn)
