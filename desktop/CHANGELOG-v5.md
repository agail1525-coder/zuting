# 修行桌面助手 CHANGELOG

## v5.0 — 2026-05-06

### 启动器升级 (E:\桌面整理\全球祖庭之旅.bat)
- chcp 65001 前置, 解决中文显示乱码
- 横幅文案: "全球祖庭之旅 v5.0 — 修行桌面助手", 三行卖点 (12信仰/300圣地/AI小鸿)
- 启动前检查 zuting_app.py 是否存在 → 错误提示
- 启动前检查 python 是否在 PATH → 错误提示 + 下载链接
- 启动后捕获 errorlevel, 非 0 输出 3 项常见排查指引 (依赖/端口/配置)
- 正常退出后 3 秒自动关闭窗口

### 版本号统一 (8 文件)
- config.py            v4.0 → v5.0
- zuting_app.py        v4.0 → v5.0 (顶部 docstring)
- ui/popup.py          v3.0 → v5.0 (docstring)
- ui/tray.py           v3.0 → v5.0 (docstring)
- ui/panel.py          v4.0 → v5.0 (docstring)
- compose/base.py      v3.0 → v5.0 (docstring + UA: ZutingDesktop/3.0 → /5.0)
- compose/seal_card.py     v3.0 → v5.0
- compose/patriarch_card.py v3.0 → v5.0
- compose/site_card.py     v3.0 → v5.0
- compose/temple_card.py   v3.0 → v5.0
- compose/tour_card.py     v3.0 → v5.0

### 设计决策
- **不重塑品牌**: CEO 明确"这个是修行版,可以保留所有修行术语,不需要提佳绩"
  → 保留"全球祖庭之旅 / 修行桌面助手"主标识
  → 保留"修行/信仰/祖庭/愿命印修"核心词汇
  → 桌面端定位为"修行版", 与 Web/API/Admin/Mobile/小程序 (F4 已切佳绩品牌) 区隔
- **仅纯技术升级**: 启动器健壮性 + 版本号一致性, 不动数据/功能/UI 主体

### 不在范围 (out of scope)
- 不改 12 大宗教内部键名/数据 (912+ 处引用)
- 不改 religions.py / data_*.py 业务数据
- 不改 ui/panel.py UI 文案 (修行统计/连续修行/修行伙伴 等保留)
- 不动 ZUTING_Master.bat (平台级启动器, 非桌面专属)

### 启动验收
- 双击 `E:\桌面整理\全球祖庭之旅.bat` → 横幅显示"全球祖庭之旅 v5.0 — 修行桌面助手"
- 缺 python 时弹出明确错误指引
- 缺依赖触发崩溃时显示 `pip install` 命令清单
