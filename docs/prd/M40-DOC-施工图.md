---
name: M40-DOC-管理后台终极升级-施工图
version: v1.0
date: 2026-04-12
type: DOC (管线++)
关联PRD: M40-PRD-管理后台终极升级
状态: DRAFT
---

# M40-DOC 管理后台终极升级 · 施工图

> **遵循**：[PJ-02] 字段名以 `services/api/prisma/schema.prisma` 为准，本文件标注的字段为待 grep 验证的草案。
> **铁律**：[PJ-09] 本文件不修改代码；只列变更清单 + 顺序 + 风险。

---

## §1 Schema 变更清单

### 1.1 新增 Model（4 张）

| Model | 用途 | 关键字段 | 索引 |
|-------|------|---------|------|
| `AdminAuditLog` | 全后台写操作审计 | adminId / action / resource / resourceId / diff(Json) / aiTraceId / ip / ua / createdAt | (resource,resourceId) / (adminId,createdAt) |
| `MediaAsset` | 统一媒体资产中枢 | url / type(MediaType) / width / height / size / hash(unique) / altText / description / tags(String[]) / aiGenerated / uploadedBy / references(Json) | (type,createdAt) / hash unique |
| `AiOperationTrace` | AI 操作审计 | scenario / model / prompt / output / tokensIn / tokensOut / latencyMs / cost / approved / approvedBy / adminId / createdAt | (scenario,createdAt) |
| `AdminRole` | 角色权限 | name(unique) / permissions(String[]) / description | name unique |

### 1.2 新增 Enum（2 个）

```prisma
enum MediaType {
  IMAGE
  VIDEO
  AUDIO
  PANO360
}

enum AdminAction {
  CREATE
  UPDATE
  DELETE
  PUBLISH
  UNPUBLISH
  AI_GENERATE
  AI_TRANSLATE
  AI_MODERATE
  ROLLBACK
}
```

### 1.3 修改既有 Model（仅扩展，不破坏）

| Model | 字段变更 | 说明 |
|-------|---------|------|
| `User` | + `adminRoleId String?` | 关联 AdminRole（仅 admin 用户）|
| `HolySite` | + `gallery Json?` / `panoUrl String?` / `audioGuides Json?` | 多图画廊 / 全景 / 多语音频 |
| `Route` | + `coverGallery Json?` / `dailyPlan Json?` | 路线封面集 / 日程 |
| `Patriarch` | + `gallery Json?` / `lineage Json?` | 多图 / 弟子谱系 |
| `Temple` | + `gallery Json?` / `historicalAbbots Json?` | 多图 / 历代住持 |
| 全实体 | + `lastEditedBy String?` / `version Int @default(1)` | 审计支持 |

> **风险**：[R-32] 新增字段必须默认值或 null —— 全部用 `String?` / `Json?` / `@default`。
> **执行**：`pnpm db:push`（开发阶段）。

---

## §2 新增 API 端点清单

### 2.1 媒体库 (upload 模块扩展)

| Method | Path | DTO | Guard |
|--------|------|-----|-------|
| GET | /admin/media | ListMediaQueryDto (type/tag/q/page/pageSize @Max(100)) | JwtAuth + Roles(CONTENT_ADMIN+) |
| POST | /admin/media | CreateMediaDto (multipart) | 同上 |
| PATCH | /admin/media/:id | UpdateMediaDto (altText/description/tags) | 同上 |
| DELETE | /admin/media/:id | — | Roles(SUPER_ADMIN) |
| POST | /admin/media/:id/ai-describe | — | 同上 |
| POST | /admin/media/ai-generate | AiGenImageDto (prompt/style/size) | Roles(CONTENT_ADMIN+) |
| GET | /admin/media/:id/references | — | 查引用追踪 |

### 2.2 AI 网关 (ai 新模块)

| Method | Path | DTO | 说明 |
|--------|------|-----|------|
| POST | /admin/ai/translate | TranslateDto (text, sourceLang, targetLangs[]) | 7 语言批译 |
| POST | /admin/ai/content/generate | ContentGenDto (resource, fieldName, context, style) | 字段文案 |
| POST | /admin/ai/seo | SeoDto (resource, id) | SEO meta |
| POST | /admin/ai/moderate | ModerateDto (text/imageUrl) | 审核 |
| POST | /admin/ai/insight | InsightDto (question) | NL 数据洞察 |
| POST | /admin/ai/command | CommandDto (utterance) | Cmd+K 解析 |
| POST | /admin/ai/prompt-lab/run | PromptLabDto (prompt/model/params) | Prompt 实验 |
| GET | /admin/ai/traces | TraceQueryDto | 操作历史 |
| POST | /admin/ai/traces/:id/approve | — | 标记通过 |

### 2.3 审计日志 (audit 新模块)

| Method | Path |
|--------|------|
| GET | /admin/audit-logs |
| GET | /admin/audit-logs/:resource/:id |
| POST | /admin/audit-logs/:id/rollback |

### 2.4 角色权限 (auth 扩展)

| Method | Path |
|--------|------|
| GET | /admin/roles |
| POST | /admin/roles |
| PATCH | /admin/roles/:id |
| DELETE | /admin/roles/:id |
| GET | /admin/permissions |

### 2.5 模块 PATCH 补齐（46 模块逐一审视）

> 现有模块多以 PUT 全量更新；本次为支持字段级直编，全部补 PATCH `/{resource}/:id`：

```
holy-site / temple / patriarch / teaching / seal / religion / scripture
route / package / booking / coupon / promotion / membership / referral /
points-mall / merchant / review / community / guide / question / journal /
collection / notification / share / chat / media / ai-config / xiaohong /
ai-community / faith-assessment / personal-growth / family-harmony /
team-culture / cultivation / recommendation
```

每个 PATCH：
- DTO：`Partial<{Resource}Dto>` + class-validator
- Service：`update(id, data)` 走 `prisma.{model}.update`
- 写 AdminAuditLog
- 触发 Redis 缓存失效

### 2.6 状态约定
- 全部走 NestJS 标准响应 + Swagger
- 列表 `{ items, total, page, pageSize }`
- `@Max(100)` 强制
- `JwtAuthGuard + RolesGuard` 强制
- 资源归属校验（IDOR 防护）

---

## §3 新增前端组件清单 (apps/admin/src/)

### 3.1 基座层（W1）

| 组件 | 路径 | 作用 |
|------|------|------|
| `AdminCockpitLayout` | layouts/AdminCockpitLayout.tsx | 7 大类左导航 + 顶部 Cmd+K + 通知 + AI 助手按钮 |
| `CommandPalette` | components/command/CommandPalette.tsx | 全局 Cmd+K AI 命令栏 |
| `AiAssistantDrawer` | components/ai/AiAssistantDrawer.tsx | 详情页右侧 AI 抽屉（生成/翻译/SEO/审核/异常）|
| `MediaLibraryDialog` | components/media/MediaLibraryDialog.tsx | 选图弹窗（网格/筛选/上传/AI 生成）|
| `MediaPicker` | components/media/MediaPicker.tsx | 单图/多图字段选择器 |
| `GalleryEditor` | components/media/GalleryEditor.tsx | 拖拽排序画廊 |
| `AuditTimeline` | components/audit/AuditTimeline.tsx | 详情页变更历史 |
| `RoleGate` | components/auth/RoleGate.tsx | 权限守卫包装 |
| `I18nFieldTabs` | components/i18n/I18nFieldTabs.tsx | 7 语言 Tab 字段 |
| `MapPicker` | components/map/MapPicker.tsx | GPS 取点（Leaflet）|
| `RichTextEditor` | components/editor/RichTextEditor.tsx | 富文本（TipTap）|
| `JsonRuleEditor` | components/editor/JsonRuleEditor.tsx | 促销/优惠券规则可视化 |
| `apiClient.admin` | lib/api/admin.ts | 全后台 API 封装 |
| `useAdminAi` | hooks/useAdminAi.ts | AI 调用 Hook |

### 3.2 内容中心（W2）

| 页面 | 路径 |
|------|------|
| `ReligionStudioPage` | pages/content/ReligionStudioPage.tsx |
| `HolySiteStudioPage` | pages/content/HolySiteStudioPage.tsx ★ |
| `TempleStudioPage` | pages/content/TempleStudioPage.tsx |
| `PatriarchStudioPage` | pages/content/PatriarchStudioPage.tsx |
| `TeachingStudioPage` | pages/content/TeachingStudioPage.tsx |
| `SealStudioPage` | pages/content/SealStudioPage.tsx |
| `ScriptureStudioPage` | pages/content/ScriptureStudioPage.tsx ★ 新建 |
| `MediaLibraryPage` | pages/content/MediaLibraryPage.tsx ★ 新建 |

### 3.3 商业（W3）

| 页面 | 路径 |
|------|------|
| `RouteStudioPage` / `PackageStudioPage` ★ / `BookingPage` / `TripPage` / `OrderPage` / `PaymentPage` ★ / `CouponStudioPage` / `PromotionStudioPage` / `PriceRulePage` / `MembershipStudioPage` / `ReferralPage` ★ / `PointsMallPage` ★ / `MerchantStudioPage` | pages/commerce/* |

### 3.4 社区+修行（W4）

| 页面 |
|------|
| `ReviewModerationPage` / `GuidePage` ★ / `QuestionPage` ★ / `JournalPage` / `CommunityHubPage` / `CollectionPage` ★ / `ModerationInboxPage`（升级）/ `CultivationPage` / `FaithAssessmentPage` ★ / `PersonalGrowthPage` ★ / `FamilyHarmonyPage` ★ / `TeamCulturePage`（已有，升级）|

### 3.5 AI 中心 + 运营 + 系统（W5）

| 页面 |
|------|
| `AiConfigPage`（升级）/ `XiaohongMonitorPage`（升级）/ `AiCommunityPage` ★ / `PromptLabPage` ★ / `AiTranslateBatchPage` ★ / `AiModerationPolicyPage` ★ / `AiInsightLogPage` ★ |
| `AnalyticsCockpitPage`（升级）/ `SearchDictionaryPage` / `RecommendationPage` ★ / `NotificationTemplatePage` ★ / `SharePosterPage` ★ / `I18nCenterPage`（升级）/ `ChatModerationPage` |
| `UserRolePage`（升级）/ `AuditLogPage` ★ / `RedisHealthPage` ★ / `SettingsPage` |

★ = 新建。共 **20 新建 + 26 升级 = 46 个 Studio 页**。

---

## §4 实施顺序（按依赖链）

```
Phase 1 — Schema & 基座 (W1)
  1.1 Schema 新增 4 Model + 2 Enum + 既有扩展 → db push
  1.2 后端 audit / ai / upload(扩展) / auth(扩展) 4 模块
  1.3 前端 AdminCockpitLayout + CommandPalette + AiAssistantDrawer
       + MediaLibraryDialog + MediaPicker + GalleryEditor + AuditTimeline
       + RoleGate + I18nFieldTabs + MapPicker + RichTextEditor + JsonRuleEditor
  1.4 lib/api/admin.ts + useAdminAi
  1.5 路由：旧 28 页保留 → 增量挂载新页

Phase 2 — 内容中心 (W2，依赖 Phase 1)
  2.1 7 个 Studio 页 + Scripture 新建
  2.2 媒体库主页

Phase 3 — 商业 (W3，依赖 Phase 1)
  3.1 13 个商业 Studio 页（其中 4 新建）

Phase 4 — 社区 + 修行 (W4，依赖 Phase 1)
  4.1 12 个社区/修行页（其中 6 新建）
  4.2 Moderation Inbox 重构（统一队列）

Phase 5 — AI + 运营 + 系统 (W5)
  5.1 AI 中心 7 页
  5.2 运营增长 7 页
  5.3 系统 4 页

Phase 6 — 全审 + 加固
  6.1 全审++ V1-V5 + D6-D11
  6.2 五全++ 跨端一致
  6.3 飞轮++ 闭环检查
  6.4 验收（M40-CHECK）
```

---

## §5 风险与缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| Schema 迁移破坏 seed | 高 | 全部字段可空 + seed 不依赖新字段 |
| 媒体迁移导致旧 URL 失效 | 中 | MediaAsset 兼容旧 URL；hash 去重 |
| AI 接口超时 | 中 | 走小鸿网关 180s/300s（已知）+ 队列 |
| Cmd+K 误执行 | 高 | 高危二次确认 + 审计回放 |
| 角色权限误配 | 高 | 默认 deny + 角色矩阵评审 |
| 大批量翻译成本 | 中 | 缓存 + 批量队列 + 成本预警 |
| 旧页面与新 Studio 并存 | 低 | 渐进迁移；导航分组隔离 |

---

## §6 部署与依赖

- 数据库：PostgreSQL 16，`pnpm db:push`（dev）/ migrate（prod）
- Redis：缓存失效 keys 已知集合 + 新增 `media:*` / `audit:*` / `ai-trace:*`
- 环境变量：`AI_GATEWAY_URL` / `AI_GATEWAY_KEY` / `OBJECT_STORAGE_*` / `IMAGE_GEN_PROVIDER`
- 兼容：[OPS-01] 生产 `NODE_NO_COMPILE_CACHE=1`
- Seed：[OPS-07] 新模块独立 seed 文件

---

## §7 交叉引用

- M09-PRD-管理后台（基线）
- M01~M39 全部业务 PRD
- 02-API契约规范 / 04-数据模型规范 / 05-安全规范 / 10-AI智能体协作规范
- F37.03-PRD-AI融通问答Prompt工程（AI 架构对齐）

---

> 下一步：消费本施工图执行 W1 基座，并按 M40-CHECK 验收。
