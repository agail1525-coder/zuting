# 修行桌面助手 v3.0 — 深度升级计划

## Context

当前桌面助手 v2.0 是一个 1284 行的 tkinter 单体应用，所有数据硬编码在 ~13K 行的 Python 文件中。XiaoHong 是随机语录生成器而非真正 AI。平台已有完整的 NestJS API (34+ 端点 + Qwen AI + 多媒体导览 + 实时聊天)，桌面端完全未接入。

**目标**: 将桌面助手从"离线弹窗工具"升级为"API 驱动的智能修行伙伴"。

---

## 七阶段实施计划

### Phase 1: 模块化拆分 (纯重构，零行为变更)

将 `zuting_app.py` 单体拆分为包结构：

```
desktop/
├── zuting_app.py              # 入口 (~80行)
├── config.py                  # 常量 + 配置管理 (settings.json读写)
├── api_client.py              # httpx API客户端 + SSE解析
├── data_provider.py           # 统一数据接口 (API优先 → 离线回退)
├── core/
│   ├── __init__.py
│   ├── state.py               # State类 + 进度管理
│   └── scheduler.py           # 定时轮换逻辑
├── ui/
│   ├── __init__.py
│   ├── panel.py               # customtkinter主面板 (4标签页)
│   ├── popup.py               # 弹窗显示 + 淡入淡出 + 拖拽
│   └── tray.py                # 系统托盘
├── audio/
│   ├── __init__.py
│   ├── player.py              # pygame播放 (环境音+吟诵+TTS)
│   └── tts.py                 # edge-tts语音生成
├── compose/
│   ├── __init__.py
│   ├── base.py                # 通用渲染工具 (_font, _draw_wrapped, _load_bg, _base_overlay)
│   ├── site_card.py           # compose_site
│   ├── patriarch_card.py      # compose_patriarch
│   ├── temple_card.py         # compose_temple
│   ├── seal_card.py           # compose_seal
│   └── tour_card.py           # [新] compose_tour (多媒体导览)
├── xiaohong_agent.py          # 保留，作为离线回退
├── religions.py               # 保留，离线数据
├── data_*.py / travel_*.py    # 保留，离线数据
├── scripture_quotes.py        # 保留，离线数据
├── backgrounds/               # 保留
├── sounds/                    # 保留
├── progress.json              # 保留
└── xiaohong_journal.json      # 保留
```

**关键文件变更**:
- `zuting_app.py` — 从 1284 行精简到 ~80 行入口
- 新建 `config.py`, `core/state.py`, `core/scheduler.py`, `ui/panel.py`, `ui/popup.py`, `ui/tray.py`
- 新建 `audio/player.py`, `audio/tts.py`
- 新建 `compose/base.py`, `compose/site_card.py` 等 5 个合成器

### Phase 2: API 客户端 + 数据提供者

**`api_client.py`** — httpx 异步客户端:
- 连接 `http://localhost:3002/api` (开发) 或生产 URL
- 5秒超时，30分钟数据缓存
- 端点映射:
  - `GET /api/holy-sites` → 圣地列表
  - `GET /api/temples` → 祖庭列表
  - `GET /api/patriarchs` → 祖师列表
  - `GET /api/teachings` → 祖训列表
  - `GET /api/media?entityType=X&entityId=Y` → 多媒体内容
  - `GET /api/xiaohong/chat/stream?message=X` → AI SSE 流
  - `POST /api/journals` → 修行日志同步
- SSE 流解析器 (for XiaoHong AI)

**`data_provider.py`** — 统一数据接口:
- `get_holy_sites()` → 先 API → 超时/失败 → 离线 `religions.HOLY_SITES`
- `get_patriarchs()` → 先 API → 超时/失败 → 离线 `religions.PATRIARCHS`
- 数据格式转换: API JSON → 统一 dict → compose 函数接收 dict (替代现有 tuple 索引)
- 内存缓存 + 磁盘缓存 (JSON文件)

### Phase 3: 现代化 UI (customtkinter)

**`ui/panel.py`** — 从 480x380 tkinter → 600x500 customtkinter:
- **Dashboard 标签**: 修行统计仪表盘
  - 连续修行天数 (火焰图标)
  - 当前印进度条 (0→30，五系颜色)
  - 今日弹窗次数 / 累计修行次数
  - 最近 7 天修行热力图
- **AI 聊天标签**: [Phase 4 实现]
- **设置标签**:
  - 弹窗间隔滑块 (5-60 分钟)
  - 语音开关 / 音量调节
  - API 地址输入框
  - 语言选择 (中/英/日/韩/泰/印/阿)
  - 弹窗尺寸选择 (标准 800x600 / 大号 1000x700)
- **关于标签**: 版本信息 + 统计数据 + 大愿

**弹窗升级**:
- 默认 1000x700 (可配置回 800x600)
- 五模式轮播: 圣地 → 祖师 → 祖庭 → 印修 → **多媒体导览 [新]**
- 更精细的卡片布局利用更大空间

### Phase 4: 真正的 AI 小鸿

**`ui/panel.py` AI 聊天标签**:
- CTkTextbox 聊天记录区 (滚动)
- CTkEntry 输入框 + 发送按钮
- SSE 打字机效果 (逐字显示 AI 回复)
- API: `GET /api/xiaohong/chat/stream?message={用户输入}`
- 对话历史保存到本地 JSON
- **离线回退**: 使用 `xiaohong_agent.py` 的规则引擎

### Phase 5: 多媒体导览模式

**`compose/tour_card.py`** — 第5种弹窗模式:
- 从 `GET /api/media?entityType=HOLY_SITE&entityId=X&mediaType=AUDIO` 获取音频导览
- 弹窗展示: 圣地名 + 导览标题 + 描述 + 播放进度条
- pygame 播放导览音频 (下载到临时目录)
- 无多媒体内容时跳过，回退到普通圣地模式
- 支持 VIDEO 类型时显示缩略图 + "在浏览器打开" 链接

### Phase 6: 云端同步

- 修行进度双写: 本地 JSON + API `POST /api/journals`
- 通知轮询: 每 5 分钟 `GET /api/chat/rooms` 获取未读消息数
- 系统托盘显示未读数角标
- 设备 UUID 标识 (首次运行生成，存入 settings.json)

### Phase 7: 收尾打磨

- **修复 libpng 警告**: `_load_bg()` 中加载图片后 `img.info.pop('icc_profile', None)`
- **日志系统**: 替换所有 `except: pass` 为 `logging.debug/warning`
- **启动优化**: 延迟导入 pygame/edge-tts，加 splash 屏
- **新依赖安装**: `pip install customtkinter httpx` (requirements.txt)

---

## 新增依赖

```
customtkinter>=5.2    # 现代化 UI
httpx>=0.27           # HTTP客户端 + SSE
```

## 执行顺序与验证

| Phase | 验证方式 |
|-------|---------|
| 1 | `python zuting_app.py` 启动成功，4 模式弹窗正常，音频正常 |
| 2 | API 连通时获取真实数据，断网时自动回退离线数据 |
| 3 | customtkinter 面板 4 标签页可交互，弹窗 1000x700 |
| 4 | AI 聊天标签输入问题 → SSE 流式回复显示 |
| 5 | 多媒体导览弹窗出现，音频播放正常 |
| 6 | 修行日志同步到 API，托盘显示未读数 |
| 7 | 无 libpng 警告，启动 <3 秒 |

## 风险与回退

- **API 不可用**: 每个 API 调用都有离线回退路径，确保桌面端独立可运行
- **customtkinter 兼容性**: 与 tkinter Toplevel 弹窗兼容 (customtkinter 是 tkinter 的包装层)
- **SSE 解析**: httpx 原生支持流式响应，逐行解析 `data:` 事件
