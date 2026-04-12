---
name: M40-PRD-管理后台终极升级
version: v1.0
date: 2026-04-12
type: PRD
module: admin
author: 项目++ (PJ)
status: DRAFT
关联PRD: M09-PRD-管理后台 (基线), M01~M39 全量
关联协议: SCP-02/SCP-03/SCP-04, 02-API契约, 05-安全规范, 10-AI智能体协作
对标: Strapi v5 / Sanity Studio / Directus / Ghost Admin / Notion / Linear / Retool / Booking Extranet
---

# M40-PRD 管理后台终极升级（佳绩之旅 Admin Cockpit）

> **目标**：把 28 页"够用型"后台升级为覆盖全部 46 个 API 模块、支持任意字段/图片粒度直编、AI 全程介入的"运营驾驶舱"。
>
> **铁律**：[PJ-01] 本 PRD 先行，后续 DOC + 施工图 + 验收清单依次跟进。无 PRD 不动代码。

---

## 1. 背景与问题

### 1.1 现状盘点
- **API 模块**：46 个（religion/holy-site/temple/patriarch/teaching/seal/trip/order/route/booking/package/coupon/promotion/membership/referral/points-mall/price/merchant/review/community/guide/question/journal/collection/search/recommendation/notification/share/chat/media/upload/payment/user/auth/moderation/analytics/ai-config/xiaohong/ai-community/faith-assessment/family-harmony/personal-growth/team-culture/cultivation/redis/health）
- **Admin 页面**：30 个（含 Login/Dashboard）
- **覆盖率**：~65%；详情编辑覆盖率 <30%；图片粒度管理覆盖率 ~10%；AI 介入面 <5%（仅 AI 配置 + 聊天监控）

### 1.2 三大痛点
1. **缺口模块无后台**：M34 个人圆满 / M35 家庭幸福 / M36 信仰力评估 / M38 经论大系统 / M39 修行大系统 / AI 社区 / 积分商城 / 套餐 / 分销 / 推荐 / 通知 / 收藏 / 游记 / 问答 等 **16 个模块零后台**。
2. **详情粒度不够**：现有列表页只能改基础字段，无法管理多图画廊、富文本经文、关联实体、多语言、SEO meta、坐标地图、视频/全景/音频源等。
3. **AI 不在场**：所有内容创建/翻译/审核/运营都靠人工堆字段，违反 CEO 反复强调的"AI 主导 UX · 觉门方便法门"（feedback_ai_lead_ux）。

---

## 2. 目标与非目标

### 2.1 目标
- **G1 全模块覆盖**：46/46 模块都有专属管理页（含 list + detail + AI 助手区）。
- **G2 详情粒度直编**：任意字段（含图片、画廊、经文段、GPS、视频源、富文本、JSON 配置）后台可改并即时生效。
- **G3 图片资产中枢**：统一 Media Library，支持上传/裁剪/AI 生成/AI 替换建议/多端图源同步。
- **G4 AI 全程介入**：每个详情页都有 AI 助手抽屉（生成/润色/翻译/SEO/审核/异常诊断），全局 Cmd+K AI 命令栏。
- **G5 运营驾驶舱**：Dashboard 升级为多 KPI + AI 洞察 + 待办工作流。
- **G6 安全可审计**：所有写操作落审计日志，AI 操作可追溯。

### 2.2 非目标
- 不重写底层 API（除少量补齐 PATCH/媒体接口）
- 不替换 Ant Design / Vite 技术栈
- 不实现移动版 admin（仅响应式可读）

---

## 3. 用户与场景

| 角色 | 典型任务 | 痛点 | 升级后 |
|------|---------|------|--------|
| **内容运营** | 新增圣地 + 上传 12 张图 + 7 语言介绍 + 经文 | 现状只能传 1 张主图，无翻译 | AI 一键生成 7 语言文案 + 媒体库批量上图 + 画廊排序 |
| **AI 训练师** | 调小鸿提示词 + 看异常对话 + 微调 12 智能体人格 | 散落多处，无诊断面板 | 统一 AI 实验台：Prompt/温度/Trace/对比/回归 |
| **审核员** | 审 UGC 评论 + 游记 + 问答 + 图片 | 多入口、无 AI 预筛 | 一站式 Moderation Inbox，AI 标签预排序 |
| **商务运营** | 配优惠券/促销/会员等级/积分商品 | 缺等级、商品、规则编辑器 | 商业中心：规则可视化 + AI 文案 + 模拟器 |
| **数据分析** | 看转化漏斗 + 异常告警 | Dashboard 卡片堆砌 | AI 洞察：自然语言提问 + 自动归因 |
| **IT/CTO** | 翻译/缓存/迁移/变更回滚 | 命令行 | 系统中心：Redis 浏览/迁移/审计回放 |

---

## 4. 功能矩阵（46 模块 × 操作清单）

> 表内 **D** = 详情编辑、**G** = 画廊/媒体、**i18n** = 7 语言、**AI** = AI 助手区、**Aud** = 审计日志

| # | 模块 | 主要管理对象 | D | G | i18n | AI | Aud | 状态 |
|---|------|------|---|---|------|----|----|------|
| 1 | religion | 12 文化传统：颜色/符号/起源/大事记/圣典 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 2 | holy-site | 300 文化圣地：GPS/UTC/经文/画廊/音频/全景 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 3 | temple | 27 祖庭：传承/坐标/历代住持 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 4 | patriarch | 28 祖师：传记/水墨头像/弟子谱系 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 5 | teaching | 39 祖训：原文/翻译/出处 | ✅ | — | ✅ | ✅ | ✅ | 升级 |
| 6 | seal | 30 印：系列色/口诀/适用场景 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 7 | route | 路线：站点列表/价格/封面/日程 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 8 | booking | 路线预订：状态机/退款 | ✅ | — | — | ✅ | ✅ | 升级 |
| 9 | trip | 用户行程：12 状态机面板 | ✅ | — | — | ✅ | ✅ | 升级 |
| 10 | order | 订单/支付：导出/对账/退款 | ✅ | — | — | ✅ | ✅ | 升级 |
| 11 | package | 套餐打包：组件/价格/有效期 | ✅ | ✅ | ✅ | ✅ | ✅ | **新建** |
| 12 | coupon | 优惠券：规则/批量发放 | ✅ | — | ✅ | ✅ | ✅ | 升级 |
| 13 | promotion | 促销活动：限时/闪购 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 14 | membership | 会员等级/权益/签到/积分规则 | ✅ | — | ✅ | ✅ | ✅ | 升级 |
| 15 | referral | 分销：邀请码/佣金/关系链 | ✅ | — | ✅ | ✅ | ✅ | **新建** |
| 16 | points-mall | 积分商城：商品/库存/兑换记录 | ✅ | ✅ | ✅ | ✅ | ✅ | **新建** |
| 17 | price | 价格规则/历史/提醒 | ✅ | — | — | ✅ | ✅ | 升级 |
| 18 | merchant | 商家入驻：审核/合同/佣金 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 19 | review | UGC 评价：评分/图片/回复 | ✅ | ✅ | — | ✅ | ✅ | 升级 |
| 20 | community | 社区帖子/排行榜/照片墙 | ✅ | ✅ | — | ✅ | ✅ | 升级 |
| 21 | guide | 游记攻略：编辑器/精选 | ✅ | ✅ | — | ✅ | ✅ | **新建** |
| 22 | question | 问答：标签/精华/置顶 | ✅ | ✅ | — | ✅ | ✅ | **新建** |
| 23 | journal | 文化之旅日志：公开/私密 | ✅ | ✅ | — | ✅ | ✅ | 升级 |
| 24 | collection | 收藏夹：分组/分享 | ✅ | — | — | ✅ | ✅ | **新建** |
| 25 | search | 全站搜索：词典/同义词/热词 | ✅ | — | ✅ | ✅ | ✅ | 升级 |
| 26 | recommendation | 推荐引擎：召回/排序/AB | ✅ | — | — | ✅ | ✅ | **新建** |
| 27 | notification | 通知模板/推送任务/订阅 | ✅ | — | ✅ | ✅ | ✅ | **新建** |
| 28 | share | 分享物料/海报/追踪码 | ✅ | ✅ | ✅ | ✅ | ✅ | **新建** |
| 29 | chat | 私信/商家咨询/会话 | ✅ | — | — | ✅ | ✅ | 升级 |
| 30 | media | 多媒体导览：视频/全景/音频 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 31 | upload | **媒体库**：资产中枢 | ✅ | ✅ | — | ✅ | ✅ | **新建** |
| 32 | payment | 支付通道/对账/异常 | ✅ | — | — | ✅ | ✅ | **新建** |
| 33 | user | 用户管理：角色/封禁/积分 | ✅ | — | — | ✅ | ✅ | 升级 |
| 34 | auth | 角色/权限/Token | ✅ | — | — | ✅ | ✅ | **新建** |
| 35 | moderation | 审核 Inbox：UGC/图片/聊天 | ✅ | ✅ | — | ✅ | ✅ | 升级 |
| 36 | analytics | 数据驾驶舱：KPI/漏斗/AI 洞察 | ✅ | — | — | ✅ | ✅ | 升级 |
| 37 | ai-config | 小鸿配置：Prompt/参数/推荐问 | ✅ | — | ✅ | ✅ | ✅ | 升级 |
| 38 | xiaohong | 聊天日志/Trace/评分 | ✅ | — | — | ✅ | ✅ | 升级 |
| 39 | ai-community | 12 智能体：人格/CRON/产出 | ✅ | ✅ | ✅ | ✅ | ✅ | **新建** |
| 40 | faith-assessment | 信仰力评估：题库/统计 | ✅ | — | ✅ | ✅ | ✅ | **新建** |
| 41 | family-harmony | 家庭幸福主题包 | ✅ | ✅ | ✅ | ✅ | ✅ | **新建** |
| 42 | personal-growth | 个人圆满主题包 | ✅ | ✅ | ✅ | ✅ | ✅ | **新建** |
| 43 | team-culture | 团队文化主题包 | ✅ | ✅ | ✅ | ✅ | ✅ | 升级 |
| 44 | cultivation | 修行大系统：印/任务/进度 | ✅ | ✅ | — | ✅ | ✅ | 升级 |
| 45 | scripture | 经论大系统（M38）：经/论/译本 | ✅ | ✅ | ✅ | ✅ | ✅ | **新建** |
| 46 | system (redis/health) | 缓存浏览/健康/审计回放 | ✅ | — | — | ✅ | ✅ | **新建** |

**统计**：升级 26 个 + 新建 20 个 = 共 46 个详情编辑页 + 46 个 AI 助手抽屉。

---

## 5. 信息架构（左侧导航 7 大类）

```
仪表盘  Dashboard
  └ 运营总览 / AI 洞察 / 我的待办

内容中心  Content
  ├ 文化传统 (religion)
  ├ 文化圣地 (holy-site)        ← 详情含画廊+经文+音频+全景
  ├ 祖庭 (temple)
  ├ 祖师 (patriarch)
  ├ 祖训 (teaching)
  ├ 印 (seal)
  ├ 经论大系统 (scripture)      ← 新建 M38
  └ 媒体库 (upload)              ← 新建·全局资产中枢

行程商业  Commerce
  ├ 路线 (route)
  ├ 套餐 (package)               ← 新建
  ├ 路线预订 (booking)
  ├ 用户行程 (trip)
  ├ 订单 (order)
  ├ 支付 (payment)               ← 新建
  ├ 优惠券 (coupon)
  ├ 促销活动 (promotion)
  ├ 价格工具 (price)
  ├ 会员体系 (membership)
  ├ 分销推荐 (referral)          ← 新建
  ├ 积分商城 (points-mall)       ← 新建
  └ 商家入驻 (merchant)

社区 UGC  Community
  ├ 评价 (review)
  ├ 游记攻略 (guide)             ← 新建
  ├ 问答 (question)              ← 新建
  ├ 文化之旅日志 (journal)
  ├ 社区/排行榜/照片墙 (community)
  ├ 收藏夹 (collection)          ← 新建
  └ 审核 Inbox (moderation)      ← 升级·一站式

修行体验  Cultivation
  ├ 修行大系统 (cultivation)
  ├ 信仰力评估 (faith-assessment) ← 新建
  ├ 个人圆满 (personal-growth)    ← 新建
  ├ 家庭幸福 (family-harmony)     ← 新建
  └ 团队文化 (team-culture)

AI 中心  AI Hub
  ├ 小鸿配置 (ai-config)
  ├ 小鸿对话监控 (xiaohong)
  ├ 12 智能体社区 (ai-community) ← 新建
  ├ AI 实验台 (Prompt 沙盒)       ← 新建
  ├ AI 翻译批处理                 ← 新建
  ├ AI 审核策略                   ← 新建
  └ AI 洞察日志                   ← 新建

运营增长  Growth
  ├ 数据驾驶舱 (analytics)
  ├ 搜索词典 (search)
  ├ 推荐引擎 (recommendation)     ← 新建
  ├ 通知模板 (notification)       ← 新建
  ├ 分享物料 (share)              ← 新建
  ├ 多语言中心 (i18n)
  └ 私信咨询 (chat)

系统  System
  ├ 用户与角色 (user + auth)
  ├ 审计日志 (audit)              ← 新建
  ├ 缓存与健康 (redis/health)     ← 新建
  └ 设置 (settings)
```

---

## 6. 关键页面设计（详情粒度示例）

### 6.1 圣地详情编辑器（HolySite Detail Studio）
> 对标 Sanity Studio + Booking Extranet 房源编辑器

**布局**：左侧字段表单（80%）+ 右侧 AI 助手抽屉（20%，可折叠）

**Tab 结构**：
1. **基础**：name / slug / religionId / city / country / GPS 经纬度（地图取点）/ UTC offset / 优先级 / 上下线开关
2. **画廊** ★：封面 banner + 主图 hero + 缩略图 thumbnail + 多张 gallery（拖拽排序、单图 EXIF/版权/AI 描述、AI 一键替换建议）
3. **多媒体**：视频源（多分辨率）+ 360° 全景 URL + 音频导览（多语言 TTS 一键生成）
4. **文案 i18n**：标题/副标题/简介/详细介绍/经文段（7 语言切换 Tab，AI 一键翻译/润色/SEO meta）
5. **关联实体**：所属祖庭、相关祖师、相关印、所属路线（穿梭框）
6. **运营数据**：浏览/收藏/评价 mini 图表
7. **变更历史**：时间线，含 diff，可一键回滚
8. **AI 助手区**：
   - 生成介绍（按风格：禅意/学术/导游）
   - 检查事实（GPS/历史人物校验）
   - SEO meta 自动写
   - 异常告警（图片失效/翻译缺失/坐标偏移）
   - 自然语言操作（"把所有日文翻译再润色一遍"）

### 6.2 媒体库（Media Library）★ 新建
> 对标 Cloudinary / Sanity Asset / Strapi Media Library

- 网格 + 列表 双视图，按"模块/分类/标签/上传者/AI 描述"过滤
- 单图详情：替换、裁剪、加水印、AI 描边、AI alt-text、AI 同款搜索
- 批量动作：转 WebP、批量加水印、批量打 AI 标签、迁移到 OSS
- 关联追踪：每张图被哪些实体引用（含跨端 web/mobile/mini）
- 上传：拖拽 + 文件夹 + 远程 URL + AI 文生图 + AI 图生图

### 6.3 AI 实验台（Prompt Lab）★ 新建
> 对标 OpenAI Playground + LangSmith

- 左侧：Prompt 编辑（含变量插槽 + few-shot）+ 模型选择（Qwen3.5-35B / Claude 4.6 / 自定义）+ 参数（temperature/top_p/max_tokens/思考模式开关——遵守 Qwen 须禁 thinking）
- 中间：执行结果 + Trace（token 数 / 延迟 / 成本）
- 右侧：版本对比、A/B 评分、回归数据集
- 一键发布到 ai-config / 12 智能体 / 任意详情页 AI 助手

### 6.4 全局 AI 命令栏（Cmd+K）★ 新建
- 自然语言操作："把广州六榕寺的封面换成 AI 生成的禅意水墨"
- 解析为 API 调用 + 高危操作二次确认
- 命令历史 / 收藏 / 团队共享

### 6.5 审核 Inbox（Moderation Inbox）升级
- 统一队列：评价 + 游记 + 问答 + 评论 + 聊天举报 + 图片
- AI 预筛标签：违规风险/语种/情感/重复
- 键盘流：J/K 上下、Y 通过、N 拒绝、E 编辑、S 跳过
- 处理 SLA 看板

### 6.6 数据驾驶舱 升级
- KPI 总览（GMV / DAU / 行程 / 评分 / AI 用量）
- AI 洞察对话框："上周哪个圣地转化率掉了？为什么？"
- 自动归因报告（每日/周/月）
- 异常告警 + 一键派单

---

## 7. AI 介入点清单（贯穿全后台）

| 介入点 | 调用模型 | 触发位置 | 目标 |
|--------|---------|---------|------|
| AI 文案生成 | Qwen3.5-35B | 任意富文本字段 | 一键生成/润色 |
| AI 7 语言翻译 | Qwen / Claude | i18n Tab | 批量/单条 |
| AI SEO meta | Claude Haiku | 详情页底部 | title/desc/keywords |
| AI 文生图 | SD/SDXL/DALL·E | 媒体库 | 替换/补充图源 |
| AI alt-text | 多模态 | 媒体库单图 | 无障碍 |
| AI 事实校验 | Claude | 圣地/祖师 | GPS/年代/人物 |
| AI 内容审核 | 自训分类 | UGC 写入前 | 预筛 |
| AI 异常诊断 | 自然语言 → SQL | Dashboard | 归因 |
| AI 推荐冷启动 | 召回模型 | recommendation | 标签生成 |
| AI 命令栏 | Function Calling | 全局 Cmd+K | NL → API |
| AI 工单助手 | Claude | 浮窗 | 后台用户问答 |
| AI 12 智能体 | Qwen | ai-community | CRON 自动发帖 |
| AI Prompt 实验 | 多模型 | AI 实验台 | 调参/对比 |

**数据安全**：所有 AI 输出 → 审计日志 + 人工"已批准"标记 → 才落库。

---

## 8. 数据模型新增（精简，详见 DOC §2）

```prisma
// 审计日志（全后台写操作）
model AdminAuditLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String   // CREATE/UPDATE/DELETE/PUBLISH/AI_GEN
  resource  String   // holy-site/route/...
  resourceId String?
  diff      Json?
  aiTraceId String?
  ip        String?
  ua        String?
  createdAt DateTime @default(now())
  @@index([resource, resourceId])
  @@index([adminId, createdAt])
}

// 媒体资产（媒体库统一表）
model MediaAsset {
  id          String   @id @default(cuid())
  url         String
  type        MediaType // IMAGE/VIDEO/AUDIO/PANO360
  width       Int?
  height      Int?
  size        Int?
  hash        String?  @unique
  altText     String?  // AI 生成
  description String?  // AI 描述
  tags        String[] // AI 打标
  aiGenerated Boolean  @default(false)
  uploadedBy  String
  references  Json?    // 被哪些实体引用
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([type, createdAt])
}

// AI 操作 Trace
model AiOperationTrace {
  id        String   @id @default(cuid())
  scenario  String   // PROMPT_LAB/CONTENT_GEN/TRANSLATE/...
  model     String
  prompt    String
  output    String?
  tokensIn  Int?
  tokensOut Int?
  latencyMs Int?
  cost      Decimal? @db.Decimal(10, 6)
  approved  Boolean  @default(false)
  approvedBy String?
  adminId   String
  createdAt DateTime @default(now())
  @@index([scenario, createdAt])
}

// 角色权限（升级）
model AdminRole {
  id          String   @id @default(cuid())
  name        String   @unique
  permissions String[] // 资源:动作 形式
  description String?
}
```

> Schema 最终字段以 M40-DOC §2 为准（须 grep schema.prisma 后定稿，[PJ-02]）。

---

## 9. API 契约新增（精简，详见 DOC §3）

| Method | Path | 模块 | 说明 |
|--------|------|------|------|
| GET | /admin/audit-logs | audit | 审计日志查询 |
| POST | /admin/media | upload | 媒体上传 |
| GET | /admin/media | upload | 媒体库列表 |
| PATCH | /admin/media/:id | upload | 更新元数据 |
| POST | /admin/media/:id/ai-describe | upload | AI 生成描述/alt |
| POST | /admin/media/ai-generate | upload | 文生图 |
| POST | /admin/ai/translate | ai | 7 语言批译 |
| POST | /admin/ai/content/generate | ai | 字段文案生成 |
| POST | /admin/ai/seo | ai | SEO meta |
| POST | /admin/ai/moderate | ai | 内容审核 |
| POST | /admin/ai/insight | ai | NL 数据洞察 |
| POST | /admin/ai/command | ai | Cmd+K 命令解析 |
| POST | /admin/ai/prompt-lab/run | ai | Prompt 实验执行 |
| GET | /admin/ai/traces | ai | AI 操作历史 |
| 各模块 | PATCH /admin/{resource}/:id | * | 字段级 PATCH（缺则补） |
| 各模块 | POST /admin/{resource}/:id/media | * | 关联媒体 |

---

## 10. 安全与权限

- **角色**：SUPER_ADMIN / CONTENT_ADMIN / OPS_ADMIN / FINANCE_ADMIN / MODERATOR / VIEWER
- **粒度**：资源:动作（如 `holy-site:update`、`order:refund`、`ai:command`）
- **AI 高危**：所有 AI 写操作 → 二次确认 + 审计 Trace
- **审计**：[R-09] 状态变更必须写审计；[HE-01] 人工修改保护
- **IDOR**：所有 admin endpoint 走 RolesGuard + 资源归属校验

---

## 11. 用户故事（节选）

- **US-1** 作为内容运营，我打开"广州六榕寺"详情页，能拖拽 12 张图重排，单击"AI 改写日文版介绍"，1 秒内拿到稿子，确认后发布。
- **US-2** 作为审核员，我打开 Moderation Inbox，AI 已按风险排序，我用键盘 J/K/Y/N 5 分钟处理 80 条 UGC。
- **US-3** 作为运营总监，我在 Dashboard 问 AI："上周泰国圣地转化率为什么掉了？"，AI 30 秒后给出归因报告 + 行动建议 + 一键派单。
- **US-4** 作为 AI 训练师，我在 Prompt Lab 同时跑 Qwen / Claude 两版 prompt，对比 50 条回归集，一键发布到 12 智能体配置。
- **US-5** 作为商务运营，我在 promotion 编辑器拖拽规则块（满减/折扣/赠品），右侧实时模拟器算出 GMV 影响，AI 帮我写活动文案。
- **US-6** 作为 CTO，我在审计日志搜索"昨晚的所有 DELETE 操作"，一键回放，发现误删 → 一键回滚。

---

## 12. 验收标准（高阶，详见 M40-CHECK）

- **AC-1** 46 模块全部有详情编辑页，字段覆盖率 ≥95%（按 schema.prisma 比对）
- **AC-2** 任意图片可在后台 1 分钟内替换并立即在 Web/Mobile/Mini 全端可见
- **AC-3** 每个详情页有 AI 助手抽屉，至少含 生成/翻译/SEO/审核 4 项动作
- **AC-4** 所有写操作落 AdminAuditLog，可追溯
- **AC-5** AI 操作 100% 写 AiOperationTrace 且需 approved 才落库
- **AC-6** Cmd+K AI 命令栏可解析 ≥30 个常用运营指令
- **AC-7** Moderation Inbox 单人 SLA 提升 ≥3×（基线 vs 升级后）
- **AC-8** Dashboard AI 洞察可回答 ≥10 类业务问题
- **AC-9** 五端一致性 [FF]：admin 改图 → web/mobile/mini 全部同步
- **AC-10** 全审++ 通过：V1-V5 + D6-D11 ≥4.0/5

---

## 13. 实施波次（5 Wave，对齐 feedback_wave_pattern）

| Wave | 内容 | 模块数 | 预估 |
|------|------|--------|------|
| **W1 基座** | 媒体库 + 审计日志 + 角色权限 + AI 网关 + Cmd+K + Layout 重构 | — | 1 周 |
| **W2 内容中心** | religion/holy-site/temple/patriarch/teaching/seal/scripture 详情 Studio | 7 | 1 周 |
| **W3 商业** | route/package/booking/trip/order/payment/coupon/promotion/price/membership/referral/points-mall/merchant | 13 | 1.5 周 |
| **W4 社区+修行** | review/guide/question/journal/community/collection/moderation/cultivation/faith-assessment/personal-growth/family-harmony/team-culture | 12 | 1.5 周 |
| **W5 AI+运营** | ai-config/xiaohong/ai-community/Prompt Lab/翻译批处理/recommendation/notification/share/analytics/search/chat/i18n/system | 14 | 1.5 周 |

总：6.5 周（与 CEO 全速并行可压缩）。

---

## 14. 风险与对标

| 风险 | 影响 | 缓解 |
|------|------|------|
| AI 生成幻觉 | 内容错误 | approved 机制 + 事实校验 + 审计回滚 |
| 媒体迁移 | 图断链 | 引用追踪 + 旧 URL 兼容期 |
| 权限误配 | 越权 | 角色矩阵评审 + 灰度 |
| Cmd+K 误执行 | 数据损坏 | 高危二次确认 + 审计回放 |

**对标深度**（[PJ-06]）：
- **Sanity Studio**：字段级 Live Edit + 引用追踪 + 历史回滚 → 引入到详情 Studio 与媒体库
- **Strapi v5 Media Library**：拖拽/文件夹/批量 → 引入媒体库
- **Notion**：左侧 7 大类导航 + 数据库视图 → 引入 IA
- **Linear**：Cmd+K + 键盘流审核 → 引入 Cmd+K + Inbox
- **Retool**：表单生成器 + 规则可视化 → 引入 promotion/coupon 编辑器
- **Booking Extranet**：房源多 Tab 字段 + 多语言 → 引入到圣地/路线 Studio
- **Ghost Admin**：Dashboard AI 洞察 → 引入 analytics

---

## 15. 后续文档

- `M40-DOC-管理后台终极升级-施工图.md`（按管线++ 格式）
- `M40-CHECK-管理后台终极升级-验收清单.md`（D1-D8 矩阵）

---

> **铁律遵守**：
> - [SCP-03] PRD 先行 ✓ — 本文件即 PRD
> - [PJ-01]~[PJ-10] ✓ — DOC 与 CHECK 紧随其后
> - [HH-V01] 垂直切片 ✓ — 每个模块覆盖页面→组件→API→Service→Schema
> - [feedback_ai_lead_ux] AI 主导 ✓ — 每个详情都有 AI 助手抽屉
