# Phase E 高级特性路线图 — 差异化护城河

> 创建时间: 2026-03-29
> 状态: 🚀 执行中
> 前置: Phase A(核心)+B(体验)+C(商业)+D(生态) 全部完成

---

## 战略目标

Phase E = JOINUS.COM 从"全球TOP10功能集合"走向"差异化护城河"。
不再是追赶竞��，而是创造竞品没有的独特体验。

核心交付:
1. **实时消息系统** — WebSocket私信+商家咨询+在线状态 (对标Booking/Airbnb消息)
2. **多媒体导览** — 视频导览+360°全景+音频讲解 (对标TripAdvisor/Google Arts)
3. **成就证书系统** — 朝圣证书+成就勋章+NFT铸造 (JOINUS独有)

---

## Sprint E1: 实时消息系统

### 目标
用户��用户、用户与商家、用户与导游之间的实时通讯。

### 技术方案
- NestJS WebSocket Gateway (@nestjs/websockets + socket.io)
- Redis PubSub 跨实例消息同步
- 消息持久化到PostgreSQL
- 在线状态管理 (Redis SET)

### 交付清单
- Prisma: ChatRoom, ChatMessage, ChatParticipant模型
- API: WebSocket Gateway + REST端点 (房间���表/历史消息/已读标记)
- Web: 消息中心页 + 聊天窗口组件
- Mobile: 消息列表屏 + 聊天屏
- Miniprogram: 消息页 + 聊天页
- Admin: 消息监控面板

---

## Sprint E2: 多媒体导览

### 目标
为圣地/祖庭提供沉浸式多媒体体验。

### 技术方案
- 视频播放: HTML5 Video + HLS流 (圣地宣��片/导览视频)
- 360°全景: Pannellum.js (Web) / react-native-panorama (Mobile)
- 音频讲解: HTML5 Audio + 播��控制

### 交付清单
- Prisma: MediaContent模型 (type: VIDEO/PANORAMA/AUDIO)
- API: MediaContent CRUD + 关联圣地/祖庭
- Web: 视频播放器组件 + 全景查看器 + 音频播放条
- Mobile: 视频/音频播放 + 全景查看
- Admin: 多媒体内容管理

---

## Sprint E3: 成就证书系统

### 目标
为完成朝圣旅程的用户颁发数字证书和成就勋章。

### 技术方案
- 证书生成: Canvas/SVG动态渲染
- 成就系统: 条件触发 + 勋章解锁
- NFT: 可选区块链铸造 (Polygon/Base L2)

### 交付清单
- Prisma: Achievement, UserAchievement, Certificate模型
- API: 成就检查+解锁 + 证书生成 + NFT铸造
- Web: 成就墙页面 + 证书����� + 分享
- Mobile: 成就展示 + 证书查看
- Admin: 成就管理 + 证书模板

---

## 验收标准
- [ ] 实时消息延迟 < 200ms
- [ ] 视频加载 < 3s, 360°全景流畅旋转
- [ ] 成就解锁即时��知
- [ ] 证书可下载PNG/PDF + 可分享
- [ ] tsc全��0错误
