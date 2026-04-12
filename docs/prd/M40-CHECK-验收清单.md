---
name: M40-CHECK-管理后台终极升级-验收清单
version: v1.0
date: 2026-04-12
type: CHECK (闭环++)
关联PRD: M40-PRD-管理后台终极升级
关联DOC: M40-DOC-施工图
---

# M40-CHECK 管理后台终极升级 · 验收清单

> **格式**：D1-D8 维度矩阵 + 每条标注验收方法 (A=自动 / M=手动)

---

## D1 — Schema 一致性（自动）

| ID | 检查项 | 方法 | 通过条件 |
|----|--------|------|---------|
| D1-01 | AdminAuditLog 模型存在 | A | `grep "model AdminAuditLog" schema.prisma` |
| D1-02 | MediaAsset 模型存在 + hash 唯一索引 | A | grep + `@unique` |
| D1-03 | AiOperationTrace 模型存在 | A | grep |
| D1-04 | AdminRole 模型存在 + name 唯一 | A | grep |
| D1-05 | MediaType / AdminAction enum 已加 | A | grep |
| D1-06 | HolySite 加 gallery/panoUrl/audioGuides | A | grep |
| D1-07 | Route 加 coverGallery/dailyPlan | A | grep |
| D1-08 | Patriarch/Temple 加 gallery | A | grep |
| D1-09 | 全实体加 lastEditedBy/version | A | grep × N |
| D1-10 | `pnpm db:push` 成功无破坏 | A | exit 0 |
| D1-11 | seed 全部成功 | A | seed.ts + 子 seed 全绿 |
| D1-12 | tsc 全绿（services/api） | A | `pnpm --filter @zuting/api typecheck` |

---

## D2 — API 端点（自动 + Swagger）

| ID | 检查项 | 方法 |
|----|--------|------|
| D2-01 | /admin/media 5 端点全部 200 | A curl |
| D2-02 | /admin/ai/* 9 端点全部 200 | A curl |
| D2-03 | /admin/audit-logs 3 端点 | A curl |
| D2-04 | /admin/roles 4 端点 | A curl |
| D2-05 | 46 模块 PATCH 端点全部存在 | A grep Controller |
| D2-06 | 全部端点出现在 /api/docs Swagger | M 浏览 |
| D2-07 | 列表端点全部 `@Max(100)` | A grep |
| D2-08 | 全部端点 JwtAuth + Roles | A grep `@UseGuards` |
| D2-09 | DTO class-validator 装饰器齐全 | A grep |
| D2-10 | curl 真实响应格式校验（[FE-01]）| M |

---

## D3 — 前端组件（自动 + 手动）

| ID | 检查项 |
|----|--------|
| D3-01 | AdminCockpitLayout 渲染 7 大类导航 |
| D3-02 | CommandPalette 在 Cmd+K 打开 |
| D3-03 | AiAssistantDrawer 在每个 Studio 页可打开 |
| D3-04 | MediaLibraryDialog 支持网格/列表/筛选/上传/AI 生成 |
| D3-05 | GalleryEditor 支持拖拽排序 + 单图 EXIF/AI 描述 |
| D3-06 | AuditTimeline 显示 diff + 一键回滚 |
| D3-07 | I18nFieldTabs 7 语言可切换 |
| D3-08 | MapPicker 取点写回 GPS 字段 |
| D3-09 | RichTextEditor 富文本基础功能 |
| D3-10 | JsonRuleEditor 用于 promotion/coupon |
| D3-11 | 46 个 Studio 页全部存在路由 |
| D3-12 | 20 个新建页 + 26 个升级页全部 lazy 加载 |
| D3-13 | tsc 全绿（apps/admin） |

---

## D4 — 数据流闭环（手动主导）

| ID | 检查项 | 方法 |
|----|--------|------|
| D4-01 | 圣地详情 → 改图 → Web 列表立即可见 | M |
| D4-02 | 路线详情 → 改 dailyPlan → Mobile 行程页同步 | M |
| D4-03 | 优惠券规则 → 创建 → Web 结账可领取 | M |
| D4-04 | 评论审核通过 → Web 详情立即出现 | M |
| D4-05 | AI 翻译 → 7 语言字段写入 → 切语言可见 | M |
| D4-06 | AI 命令栏 "把 X 上下线" → 状态切换 → 端可见 | M |
| D4-07 | 12 智能体 CRON 触发 → 社区出现新帖 | M |
| D4-08 | 媒体库删除 → 引用追踪阻止 | M |
| D4-09 | 审计日志回滚 → 实体回到上一版本 | M |
| D4-10 | 全部写操作出现在 AdminAuditLog | A select |

---

## D5 — 安全（自动 + 手动）

| ID | 检查项 |
|----|--------|
| D5-01 | 全部 admin 端点 JwtAuthGuard + RolesGuard |
| D5-02 | IDOR：CONTENT_ADMIN 不能改财务 |
| D5-03 | AI 高危操作二次确认（DELETE/批量 PUBLISH）|
| D5-04 | AI 操作 100% 写 AiOperationTrace |
| D5-05 | AI 输出 approved=false 时不落库 |
| D5-06 | 文件上传校验 mime + 大小 |
| D5-07 | 富文本 sanitize 防 XSS |
| D5-08 | 媒体生成 prompt 过滤敏感词 |
| D5-09 | helmet + CORS 白名单生效 |
| D5-10 | 审计日志含 ip/ua/diff |

---

## D6 — i18n（自动 + 手动）

| ID | 检查项 |
|----|--------|
| D6-01 | I18nFieldTabs 支持 7 语言（zh/en/ja/ko/th/hi/ar）|
| D6-02 | RTL（ar）布局正常 |
| D6-03 | AI 翻译批处理覆盖 6 个目标语言 |
| D6-04 | 翻译落库到对应字段 |
| D6-05 | i18n 中心可批量导出/导入 JSON |

---

## D7 — 跨端一致（五全++）

| ID | 检查项 |
|----|--------|
| D7-01 | admin 改图 → web 同步 |
| D7-02 | admin 改图 → mobile 同步 |
| D7-03 | admin 改图 → miniprogram 同步 |
| D7-04 | API 字段一致（admin/web/mobile/mini 共用 @zuting/shared-types）|
| D7-05 | 枚举一致（[R-02]）|
| D7-06 | 分页格式一致（[R-05]）|
| D7-07 | 价格单位一致 |

---

## D8 — PRD 用户故事（手动）

| ID | 用户故事 | 验收 |
|----|---------|------|
| D8-01 | US-1 圣地多图重排 + 日文 AI 翻译发布 | M 演示 |
| D8-02 | US-2 Inbox 键盘流 5 分钟处理 80 条 | M 计时 |
| D8-03 | US-3 Dashboard AI 归因 30 秒回复 | M 演示 |
| D8-04 | US-4 Prompt Lab 双模型对比发布 | M 演示 |
| D8-05 | US-5 Promotion 规则可视化 + 模拟器 | M 演示 |
| D8-06 | US-6 审计日志回放 + 一键回滚 | M 演示 |

---

## D9 — 全审++ 评分（最后总闸）

| 维度 | 通过分数 |
|------|----------|
| V1 代码质量 | ≥4.0 |
| V2 功能完整 | ≥4.0 |
| V3 用户体验 | ≥4.0 |
| V4 安全 | ≥4.0 |
| V5 性能 | ≥4.0 |
| D6 IDOR 渗透 | ≥4.0 |
| D7 契约漂移 | ≥4.0 |
| D8 韧性 | ≥4.0 |
| D9 安全深度 | ≥4.0 |
| D10 状态机 | ≥4.0 |
| D11 数据完整 | ≥4.0 |

---

## 验收流程

```
Wave 完成 → RRR 3 分钟自检 → 全审++ 多维评分 → 修复 P0/P1 → CHECK D1-D9 → 通过 → 进入下一 Wave
```

---

## 高阶 KPI

| KPI | 基线 | 目标 |
|-----|------|------|
| 模块覆盖率 | 65% | 100% (46/46) |
| 详情字段覆盖率 | <30% | ≥95% |
| 图片粒度可改 | <10% | 100% |
| AI 介入面 | <5% | 100% 详情页 |
| 单次 UGC 处理时长 | 基线 | ↓3× |
| 内容创建到发布耗时 | 基线 | ↓5× |
| 翻译批量耗时 | 基线 | ↓10× |

---

> **签收**：W1-W5 全部通过 D1-D9 + KPI 达标 → M40 关闭 → 写入 CLAUDE.md Phase G 收尾。
