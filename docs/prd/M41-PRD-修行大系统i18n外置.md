# M41-PRD — 修行大系统 i18n 文案外置

> **状态**: v1.0 / 待执行 | **负责人**: CEO++ | **日期**: 2026-04-12
> **前置**: M39 (FR-07 延期项) | **i18n 基座**: I18nProvider 已就绪 (7 locale)
> **触发**: 修行大系统核心文案 (十牛图/境界/传统名) 硬编码中文,无法切换语言

## §0 元数据

| 字段 | 值 |
|------|-----|
| PRD 编号 | M41 |
| 主题 | 修行大系统文案抽取到 i18n json |
| 范围 | apps/web/src/app/trips/cultivation/** + src/lib/i18n/{zh-CN,en}.json |
| 预计工期 | 2-3 天 (3 Wave) |
| 依赖 | 现有 `useTranslation()` 扁平 key 查找 |
| 风险 | 低 — 纯文本替换,tsc 保证不漏 |

## §1 背景与目标

### 1.1 背景
修行大系统硬编码常量:
- `OX_STAGE_NAMES` 在 `ox-path/page.tsx:18` — 寻牛/见迹/...入廛垂手 (10 个)
- `REALM_LABEL` 在 `cultivation/page.tsx:22` — 初觉/明心/.../布施 (7 个)
- `TRADITION_LABEL` 在 `cultivation/page.tsx:32` — 禅宗/佛教/... (13 个)
- `OX_STAGE_DESC` 在 bhumi-path/ox-path 各页面的内联描述
- `BHUMI_LABELS` 第一地/第二地/.../第十地 (10 个)

i18n 基座 (I18nProvider) 已就绪,但 `zh-CN.json` 4200+ 行无 cultivation 命名空间。

### 1.2 目标
- 抽取**枚举/标签类**文案到 `zh-CN.json` 的 `cultivation.*` 扁平 key
- `en.json` 同步添加英文基线 (机翻可接受,翻译组后续精修)
- 页面改用 `t("cultivation.oxStages.1")` 等调用
- 后端 service 返回 enum key 原样 (如 `AWAKENING`),前端负责展示翻译

### 1.3 不做什么
- ❌ 不动后端 service (继续返回 enum key)
- ❌ 不做 ja/ko/ar/hi/th 的翻译 (留给翻译组,用 zh-CN 兜底)
- ❌ 不抽描述性长文 (如 `OX_STAGE_DESC` 的段落体,Wave 2 再说)
- ❌ 不动 cultivation 子模块 (daily-practice/wisdom 等,M42 处理)

## §2 作用域

### Wave 1 — 核心枚举 (本次)
- **i18n key 表**:
  - `cultivation.oxStages.1..10` — 寻牛/见迹/见牛/得牛/牧牛/骑牛归家/忘牛存人/人牛俱忘/返本还源/入廛垂手
  - `cultivation.realms.AWAKENING..GIVING_BACK` — 初觉/明心/见性/证道/融通/归源/布施
  - `cultivation.traditions.ZEN..INDIGENOUS` — 13 个文化传统
- **改动文件**:
  - `apps/web/src/lib/i18n/zh-CN.json` (+30 keys)
  - `apps/web/src/lib/i18n/en.json` (+30 keys)
  - `apps/web/src/app/trips/cultivation/page.tsx` — 删 REALM_LABEL/TRADITION_LABEL,用 t()
  - `apps/web/src/app/trips/cultivation/ox-path/page.tsx` — 删 OX_STAGE_NAMES,用 t()

### Wave 2 — 扩散
- 菩萨十地标签 `cultivation.bhumis.1..10`
- 十牛图描述 `cultivation.oxStages.desc.1..10`
- 每日功课/智慧融通页面硬编码

### Wave 3 — 多语言
- ja/ko 补齐 (翻译组协作)
- 清理废弃常量

## §3 验收

| # | 验收项 | 通过条件 |
|---|--------|----------|
| AC-01 | key 完整 | zh-CN.json 含 cultivation.oxStages.1..10 + realms.* + traditions.* |
| AC-02 | 英文基线 | en.json 含同名 key (可为英文词) |
| AC-03 | 删除常量 | grep `OX_STAGE_NAMES` cultivation/ 返回 0 处 |
| AC-04 | 页面渲染 | /trips/cultivation + /ox-path 中文渲染不变 |
| AC-05 | 切换语言 | 顶部语言切换到 en,十牛图/境界/传统标签显示英文 |
| AC-06 | tsc | `tsc --noEmit` 全绿 |

## §4 风险
- 风险:删 `OX_STAGE_NAMES` 后漏替换某处 → tsc 报错 (安全)
- 风险:json key 冲突既有扁平命名 → 用 `cultivation.` 前缀规避
- 回滚:revert 单 commit

---

**签批即执行**。
