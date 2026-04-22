# M24-v3 PRD · 价格工具页三段式控制台重构

> **版本**: v3.0 | **状态**: ✅ 已交付 (2026-04-22) | **前序**: M24-v2 (数据对齐 Wave A)
> **发起人**: CEO | **负责**: 价格++ 协议 v1.1 | **竞品对标**: Skyscanner / Kayak / Google Flights / Hopper
> **定位**: 将 /prices 首页从 14 段杂货铺重构为 3 段式价格控制台,展示 PRC 自愈能力

---

## 1. 背景与动机

M24-v2 Wave A 交付了 3003 条 PriceSnapshot baseline + 3 CRON 自愈 + PriceSourceBadge,但 /prices 首页 UI 仍沿用 v1 时代堆砌式结构 (14 段),导致:

- **自愈能力不可见**: 用户打开页面看不到"3003 条基线 · 3 CRON 自愈"的系统脉搏
- **信息密度低**: 14 段平铺让用户找不到任何一条关键数据
- **无竞争壁垒呈现**: 对比 Skyscanner 的 PricePulse / Kayak 的 Hacker Fares / Hopper 的 Predict 首屏即能力
- **预算乘数内联**: PriceBudgetEstimator 硬编码 STYLE_MULTIPLIERS/DAILY_BASE 常量, A/B 测试无法落点

## 2. 目标用户与场景

| 角色 | 首屏期望 | v3 交付 |
|------|---------|---------|
| 首次访客 | 一秒判断"这价格可信吗" | PulseBar · Live indicator + 基线数量 + CRON |
| 比价用户 | 快速看到最新低价/涨跌 | TodayLow + TopMovers 左栏榜单 |
| 规划用户 | 快速跳价格工具 (日历/比价/提醒/趋势) | ToolsGrid 4 卡浮层 |
| 预算用户 | 根据天数/风格估算花费 | 右栏 BudgetEstimator (config 驱动) |
| 怀疑用户 | 想知道数据怎么来的 | 段三 Methodology 4-Q FAQ |

## 3. 最终信息架构

```
段一 · 控制台 (Control Panel) — 首屏即能力
  ├─ PricePulseBar   Live indicator · 基线/路线/天数 · source 分布 · CRON
  ├─ PriceHeroSearch 搜索收敛为唯一 CTA
  └─ PriceToolsGrid  4 卡浮层 (-mt-8 翘起) → 日历/比价/提醒/趋势

段二 · 洞察 (Insights) — 动态数据替代静态 Tips
  ├─ 左 2/3
  │   ├─ PriceTodayLow    今日最低 Top-5 · 24h 变化
  │   ├─ PriceTopMovers   涨跌榜 Top-5 · window 可选 24h/7d/30d
  │   └─ Popular routes   保留 v2 榜单 + 渐进色价格条
  └─ 右 1/3
      ├─ PriceFlashDeal      闪购促销卡
      ├─ PriceAlertInline    告警订阅 (无跳页)
      ├─ PriceBudgetEstimator 预算估算 (config 驱动)
      └─ Packages strip      v2 套餐条简化版

段三 · 支撑 (Context) — 可信度建设
  ├─ PriceMethodology 4-Q accordion (FAQ)
  └─ Bottom CTA
```

## 4. 技术交付

### 4.1 9 新组件 (apps/web/src/components/)
`Price{PulseBar, HeroSearch, ToolsGrid, TodayLow, TopMovers, FlashDeal, AlertInline, BudgetEstimator, Methodology}.tsx`
(+ v2 已有的 PriceSourceBadge)

### 4.2 3 新 API 端点 (services/api/src/modules/price/)
| 方法 | 路径 | 返回 | 缓存 |
|------|------|------|------|
| GET | `/api/prices/system-status` | baselineCount/routeCount/dayCount/sourceBreakdown/cronSchedules/asOf | 无 |
| GET | `/api/prices/today-low?limit=5` | items[{routeId,slug,title,priceFen,date,changePercent24h}] | 无 |
| GET | `/api/prices/top-movers?limit=5&window=24h\|7d\|30d` | items[{routeId,slug,title,currentPriceFen,previousPriceFen,changePercent,changeDirection}] | 无 |

三端点 `@Public()` 免登录 · Route findMany in-memory join 避免 N+1 · limit/window 均有上限 (Max 20)。

### 4.3 Config 下沉
新建 `packages/config/src/price-defaults.ts`:
- `DAILY_BASE_YUAN = { hotel: 280, meals: 120, transport: 80, misc: 60 }`
- `STYLE_MULTIPLIERS = { eco: 1.0, comfort: 1.5, lux: 2.5 }`
- `type BudgetStyle` + `BUDGET_STYLE_LABELS`
- `PRICE_DEFAULTS_VERSION = 1`

`apps/web` package.json 加 `@zuting/config: workspace:*` 依赖。

### 4.4 i18n 首批
zh-CN + en 14 新键 (`prices.v3.pulse.*` + `prices.v3.insights.*`),其他 5 语言走 `DEFAULT_LOCALE=zh-CN` 回退。

## 5. 设计原则

| 原则 | 说明 | 竞品印证 |
|------|------|---------|
| P1 · 首屏即主功能 | PulseBar 秒内告诉用户"系统在线 · 3003 条基线 · CRON 自愈" | Skyscanner PricePulse |
| P2 · 数据自信 | 真实 snapshot 显数字,不再 mock/hardcode | Kayak Price Forecast |
| P3 · 单 CTA | Hero 只留搜索,其它 CTA 散列进洞察卡 | Google Flights |
| P4 · Insights > Tips | 动态"今日低价/涨跌榜"替换静态"省钱 Tips" | Hopper Predict |

## 6. 验收清单

- ✅ `/prices` 页面 HTTP 200,三段结构齐全
- ✅ PulseBar Live indicator 打绿 (api 正常) / 琥珀 (fallback)
- ✅ 3 新端点 curl 200,返回结构与 Swagger 一致
- ✅ BudgetEstimator 滑条触发时乘数来自 `@zuting/config`
- ✅ 移动端 (iPhone SE 375px) PulseBar 折行不溢出,CRON 标签 `hidden md:flex`
- ✅ i18n zh-CN 默认 + en 切换正确,其他语言回退
- ✅ tsc 0 error,web/api build 绿
- ✅ 协议 v1.0→v1.1 (PRC-31~33 沉淀)
- ✅ memory `project_price_tool_v3_ui.md` + MEMORY.md 索引

## 7. 关键 Commits

```
56aa139  W3.0.1  feat(prices): v3 架构重排 段一控制台就位
f38e031  W3.0.2  feat(api):    价格工具页 v3 控制台 3 新端点
85691df  W3.0.3  refactor:     预算测算乘数下沉 @zuting/config
5f1f229  W3.0.4  feat(i18n):   价格工具页 v3 i18n 首批 (zh-CN/en)
954f25d  W3.0.5  feat(web):    价格工具页 v3 移动端适配
df1df53  W3.0.6  docs:         价格++ v1.0→v1.1 (PRC-31~33)
```

## 8. 后续波次

- v3.1 · 7 语言全量 i18n 补齐 (ja/ko/th/hi/ar)
- v3.2 · Admin PriceConfig 表,让 DAILY_BASE_YUAN 可配,UI 读管理端
- v3.3 · sourceBreakdown crawler/official 实际数据源 (PriceSnapshot 加 `source` 字段)
- v3.4 · PulseBar lastCronRun 接 SystemEventLog 真实时间戳 (当前为空)

## 附录 · 沉淀的 PRC 铁律

```
[PRC-31] /prices 必须三段式控制台 (控制台/洞察/支撑),禁止段堆砌
[PRC-32] PriceSnapshot 新维度必须全链路贯通到 system-status + PulseBar
[PRC-33] 预算/测算常量必须下沉 @zuting/config,禁止内联 magic number
```
