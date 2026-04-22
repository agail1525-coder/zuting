# M24-v2 · 价格工具数据对齐重构 PRD

> 版本 v2.0 · 2026-04-22 · 状态: 待评审
>
> 前置: M24-PRD-价格工具.md v1 (已批准,UI/UX 完备) / P23-PRD-比价面板页.md
> 触发: CEO 指令 —— "价格工具页面深度思考,数据源校正对齐,GitHub 最佳实践,拉起 plan 重构"

---

## §0 元数据

| 项 | 值 |
|---|---|
| 对应模块 | `services/api/src/modules/price/` + `apps/web/src/app/prices/` |
| 竞品对标 | Skyscanner / Kayak / Google Flights / Hopper / 携程比价 |
| 关联 PRD | M21 套餐打包 / M19 促销引擎 / 爬虫++ (CW) PRICE 域 |
| 数据模型 | PriceSnapshot / PriceAlert / PackagePriceAlert / DestinationPackage / Route / TravelPackage |
| 依赖 | @nestjs/schedule / (可选) Amadeus/Kiwi/Expedia/携程 API |

---

## §1 问题现状

### 1.1 五大"假数据"证据

1. **PriceSnapshot 表为空** → `/prices/calendar` `/prices/compare` `/prices/trend` 真实调 API 但返回 null
2. **Sparkline 种子随机** (`apps/web/src/app/prices/page.tsx:75-81`): `getSparklineData(seed, base)` 按 slug 哈希乘 0.85–1.15 伪造 8 点趋势
3. **预算计算器硬编码乘数** (L137-146): eco=1x / comfort=1.5x / lux=2.5x × (酒店 280 / 餐 120 / 交通 80 / 杂 60) 无任何数据支撑
4. **"Best-time-to-book" 月份硬编码** (L203-207): `LOW_MONTHS = [1, 5, 10]` 写死
5. **无"数据来源"/更新时间标注** → 用户无法判断数据是否真实

### 1.2 三层数据漂移风险

| 层 | 漂移点 | 触发症状 |
|---|---|---|
| Route vs DestinationPackage | `Route.priceFrom` 与 `DestinationPackage.priceMin` 各自维护 | 列表起价和配套页不一致 |
| 源货币 vs 呈现货币 | seed-v3 海外 USD 折合,但 PriceSnapshot 全部标 CNY | 海外路线价格虚标 |
| 时区 | `priceAsOf` / `date` 无时区标记 | 日历/趋势分桶错位 |

### 1.3 基础设施空档

- **爬虫++ PRICE 域**(CW-50)枚举完备,但 **无 adapter 实装** → 爬取 0 产能
- **PriceAlert** 接口完整,但 **无 Cron 触发器** → 用户设置的告警永远不会触发
- **PackagePriceAlert** 表就绪,但 **无检测逻辑** → 爬虫产生的价格波动无人消费

---

## §2 目标

**短期(本期,Wave A)**
- 消灭前端 mock,把"假数据"换成真实(即便是基线)数据
- 填充 PriceSnapshot 基线,让日历/比价/趋势端点立即返回有效数据
- PriceAlert 告警闭环 —— 用户目标价达成即自动触发通知
- 每个价格页加"数据来源 + 最后更新时间"透明标注
- PRD + PLAN 文档沉淀

**中期(下期,Wave B)**
- PRICE domain adapter 实装(官网 + OTA 双通道)
- Amadeus / Kiwi / Expedia Rapid / 携程开放平台四源接入评估
- 汇率快照同步 (ECB / 人行中间价 日 09:00)
- 三轨告警触发 (阈值 / 跌幅 / 邻日)

---

## §3 竞品对标(Wave A 聚焦)

| 维度 | Skyscanner | Kayak | Google Flights | JOINUS Wave A |
|---|---|---|---|---|
| 数据透明 | "价格由 Skyscanner 合作伙伴提供,xx 分钟前更新" | Price Forecast 带置信度 | "预计价格" 标签 | **数据来源徽章 + 更新时间 + 样本数** |
| 基线填充 | 全量实时 | 全量实时 | 全量实时 | **SimulatedBaseline 带显著标注** |
| 告警触发 | 邮件+APP 推送 | Price Alert 邮件 | Track Price | **站内信 + 邮件(复用通知系统)** |

---

## §4 架构方案

### 4.1 数据流

```
┌───────────────┐    ┌──────────────────────┐    ┌──────────────┐
│ Route / DPkg  │──▶ │ PriceReconcileService │──▶ │ PriceSnapshot│
│  (source)     │    │  (日 CRON 04:00)      │    │   (sink)     │
└───────────────┘    └──────────────────────┘    └──────┬───────┘
                                                         │
┌───────────────┐    ┌──────────────────────┐            │
│ PRICE Crawler │──▶ │ CrawlerPriceIngest   │────────────┘
│  (B 期)       │    │  (Wave B)            │
└───────────────┘    └──────────────────────┘
                                                         ▼
┌──────────────┐    ┌──────────────────────┐    ┌─────────────┐
│ PriceAlert   │◀── │ PriceAlertCronService │──▶│ Notification│
│  (user)      │    │  (小时 CRON)          │    │  (站内信)    │
└──────────────┘    └──────────────────────┘    └─────────────┘
```

### 4.2 新增/修改文件

| 文件 | 动作 | 说明 |
|---|---|---|
| `services/api/prisma/seed-price-snapshots-v1.ts` | 新建 | Route 基线 90 天快照生成 (60 past + 30 future) |
| `services/api/src/modules/price/price-alert-cron.service.ts` | 新建 | `@Cron('0 0 * * * *')` 小时扫描活动告警 |
| `services/api/src/modules/price/price-reconcile.service.ts` | 新建 | `@Cron('0 10 4 * * *')` 日度 Route.priceFrom ↔ DestinationPackage.priceMin 对齐 |
| `services/api/src/modules/price/price.module.ts` | 修改 | 注册两个 Cron 服务,imports `ScheduleModule`, `NotificationModule` |
| `apps/web/src/components/PriceSourceBadge.tsx` | 新建 | 数据来源+更新时间透明标注组件 |
| `apps/web/src/app/prices/page.tsx` | 修改 | 删除 sparkline mock + 预算硬编码 + best-time 月份;改为调 `/api/prices/trend` 真实数据;底部挂 PriceSourceBadge |
| `apps/web/src/app/prices/calendar/page.tsx` | 修改 | 挂 PriceSourceBadge |
| `apps/web/src/app/prices/compare/page.tsx` | 修改 | 挂 PriceSourceBadge |
| `apps/web/src/app/prices/trend/page.tsx` | 修改 | 挂 PriceSourceBadge |
| `E:/ZUTING-APP/PLAN/M24-价格工具数据对齐-plan-v1.md` | 新建 | 落地计划 |

### 4.3 种子算法(SimulatedBaseline)

```
对每条 Route(priceFrom > 0):
  base = route.priceFrom * 100  // 分
  for d in [-60, +30]:
    date = today + d
    # 季节波形: 近节假日上浮,淡季下探
    seasonal = 1 + 0.10 * sin(2π * dayOfYear / 365)
    # 周末上浮: 周五/周六 +5%
    weekend = 1 + (weekday in [5,6] ? 0.05 : 0)
    # 确定性伪随机(哈希 route.id + date),防止重跑漂移
    noise = 1 + 0.05 * hashNoise(route.id, date)
    price = round(base * seasonal * weekend * noise)
    upsert PriceSnapshot (entityType=ROUTE, entityId=route.id, date, price, currency=CNY)
```

特点: **确定性** (重跑数据不变) + **有"数据来源=simulated_baseline" tag** (透明)

### 4.4 Cron 规则

| Cron | 频率 | 动作 |
|---|---|---|
| `PriceAlertCronService.scanAndTrigger` | `0 0 * * * *` 每小时 | 扫 `PriceAlert.isActive & !isTriggered`;若 `currentPrice <= targetPrice` → `isTriggered=true` + 推站内信 |
| `PriceReconcileService.reconcileRoutes` | `0 10 4 * * *` 日 04:10 | 每条 Route: 取其 DestinationPackage (tier!=LUXURY) 的 min(priceMin) 与 route.priceFrom 对比,偏差 >15% 写 `PackagePriceAlert` |
| `PriceReconcileService.extendSnapshots` | `0 20 4 * * *` 日 04:20 | 滚动 +1 天 PriceSnapshot,删 >180 天老数据 |

---

## §5 验收标准

| 项 | 验证方式 |
|---|---|
| PriceSnapshot 非空 | `SELECT count(*) FROM "PriceSnapshot"` > 500 |
| /prices/calendar 返回真实数据 | `curl /api/prices/calendar?entityType=ROUTE&entityId=<routeId>&startDate=&endDate=` 返回 calendar map 非空 |
| /prices/trend 返回真实数据 | 同上,trend 数组长度 ≥7 |
| PriceAlert 闭环 | 创建一条 targetPrice 低于 snapshot 的 alert,等 1 小时,检查 `isTriggered=true` 且站内信到达 |
| 数据来源标注 | 四个 /prices 页面底部均显示 `PriceSourceBadge`,含 "基线模拟数据 · YYYY-MM-DD HH:MM 更新" |
| Mock 全清 | `getSparklineData` / `STYLE_MULTIPLIERS` / `LOW_MONTHS` 硬编码全部移除 |
| Cron 注册成功 | API 启动日志含 `[ScheduleRegistry] registered cron: price-alert-scan`、`price-reconcile-routes`、`price-snapshot-extend` |

---

## §6 Wave B 展望(本 PRD 暂不实装)

- **Amadeus SDK 接入**: 机票 self-service tier 2000 调用/月免费
- **Kiwi Tequila API**: 低成本票覆盖最佳
- **Expedia Rapid**: 酒店 sandbox 免费
- **携程开放平台**: 国内必备,需企业资质
- **汇率快照**: 日 09:00 同步 ECB 中间价,历史查询用下单时点汇率
- **三轨告警**: 绝对阈值 / 30 日 median 跌 ≥15% / 邻日 ±3 天差 ≥20%
- **PRICE 域 adapter**: 官网 + OTA 爬取 → CrawlerItem → DestinationPackage.priceMin 回填
- **Hopper 式预测**: LSTM 未来 7 日趋势

参考链接:
- developers.amadeus.com / duffel.com/docs / tequila.kiwi.com
- partners.expediagroup.com/rapid
- github.com/amadeus4dev/amadeus-python
- github.com/duffelhq/duffel-api-python
- github.com/travelgatex (hotel-X schema)

---

## §7 铁律沉淀

- **PRC-01** 任何价格数字在前端显示时必须伴随"数据来源标识",禁止裸数字
- **PRC-02** SimulatedBaseline 必须在响应/UI 上可区分于真实采集数据,`source` 字段标注
- **PRC-03** PriceAlert 触发必须幂等,`isTriggered=true` 后不再重复推送
- **PRC-04** 货币规范化只能入口处做,DB 存源币+CNY 双列,出口取对应时点
- **PRC-05** Cron 任务必须带显式 name(便于 ScheduleRegistry 追踪)和错误捕获(单条失败不阻塞整批)
