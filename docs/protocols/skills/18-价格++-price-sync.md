# 价格++ (Price Sync & Reconcile) v1.1

> **代号**: PRC | **版本**: v1.1 | **创建**: 2026-04-22 | **升级**: 2026-04-22 (v1.0→v1.1, +UI 控制台规范)
> **定位**: 全站旅行配套价格的单一事实源 — 采集 × 对齐 × 快照 × 告警 × 透明
> **愿景**: 让 JOINUS.COM 的每一个价格数字都可追溯、可校验、可信任 — 对标 Skyscanner/Kayak/Hopper 的价格透明与时效治理
> **触发**: `价格++` / `价格++ seed` / `价格++ reconcile` / `价格++ crawl {provider}` / `价格++ audit` / `价格++ upgrade v{N}`
> **核心**: 单一数据源 (PriceSnapshot) × 三条 CRON 自愈 × 三态透明标注 × 迭代升级 × 三段式控制台 UI

---

## §0 元数据

```yaml
name: price-sync-reconcile
code: PRC
version: 1.1
since: 2026-04-22
triggers:
  - 价格++                                    # 自动循环：选最旧/最缺快照的实体补采
  - 价格++ seed                               # 跑 seed-price-snapshots-v{N}.ts 全量铺底
  - 价格++ reconcile                          # 手动触发 Route↔Package 偏差对齐
  - 价格++ extend                             # 手动触发 +1 天快照滚动
  - 价格++ crawl {provider}                   # 拉指定渠道真价 (Wave B+)
  - 价格++ audit                              # 全站 mock 审计,找新增的虚构数据
  - 价格++ upgrade v{N}                       # 升级协议到下一版本,补 seed-price-snapshots-v{N}.ts
前置条件:
  - Prisma 表有 PriceSnapshot/PriceAlert/PackagePriceAlert/Route/DestinationPackage
  - ScheduleModule 已在 PriceModule 注册
  - NotificationService 可用
后置动作:
  - 生成/追加 seed-price-snapshots-v{N}.ts (N 递增,幂等 upsert)
  - 部署后挂载三条 CRON (见 §4.3)
  - 所有价格展示页必须挂 PriceSourceBadge 组件
联动技能: 爬虫++ (CW PRICE 域) / 旅游配套++ (TP) / 目的地++ (DST) / 全审++ (FA) / 天查++ (TC) / 项目++ (PJ)
核心铁律: PRC-01 ~ PRC-33 (见 §8,v1.0 首批 15 条 + v1.1 新增 UI 3 条 PRC-31~33,后续版本递增)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Baseliner** (铺底) | 确定性算法生成历史+未来快照,用于 Wave A 冷启动 | `seed` |
| **Reconciler** (对齐) | 比对 Route.priceFrom vs min(DestinationPackage.priceMin) 偏差 > 阈值则告警 | `reconcile` · 日 04:10 |
| **Extender** (滚动) | 每日补 +1 天快照 + 清 > 180 天老数据 | `extend` · 日 04:20 |
| **Scanner** (扫描) | 每小时扫描 PriceAlert, price ≤ target 则幂等触发 Notification | hourly |
| **Crawler** (采集) | 从 Amadeus/携程/爬虫++ PRICE 域拉真价 upsert 到 PriceSnapshot | Wave B+ |
| **Annotator** (标注) | 每个价格展示组件必须挂 PriceSourceBadge,表达数据来源与时效 | PR 审查 |
| **Auditor** (审计) | 定期巡检前端是否还有 hardcoded mock 数据 | `audit` · 每版本 |
| **Upgrader** (升级) | 新增 provider/新字段时,产出 v{N+1} 补丁 + 协议 bump | `upgrade v{N}` |

---

## §2 作用域

### 2.1 价格数据三态模型

> 所有价格必须归属其中一态,不允许第四态存在。

| state | source 字段 | 生成者 | 可见位置 | 典型误差 |
|-------|-------------|--------|---------|---------|
| `baseline` | 琥珀徽章 | `seed-price-snapshots-v{N}.ts` 确定性算法 | Route 冷启动/无真价时 | 单价带 ±15% (seasonal+weekend+hash) |
| `crawler` | 蓝色徽章 | 爬虫++ PRICE 域 (Booking/携程/小红书/马蜂窝) | 覆盖率提升后 | 视源而定, ≤ 5% |
| `official` | 翠色徽章 | Amadeus / 携程开放平台 / Duffel / Expedia Rapid | Wave B 凭证到位后 | < 1%,实时 |

**过渡规则**: baseline → crawler → official 单向升级,降级需 CEO 书面授权 (写入 `PriceSourceDowngradeLog`)。

### 2.2 价格覆盖矩阵 (逐版本推进)

| 版本 | 覆盖实体 | 数据源 | 样本规模 | 频率 |
|------|---------|-------|---------|------|
| v1.0 | Route (priceFrom > 0) | baseline 确定性 | 33 × 91d = 3003 | 日 +1 滚动 |
| v1.1 | + DestinationPackage | baseline (priceMin/priceMax 直映射) | +300 × 30d | 日 +1 |
| v1.2 | Route × TravelPackage.tier (4档) | baseline × tier 系数 | +33 × 4 × 30d | 日 +1 |
| v1.3 | + HolySite 门票 | baseline (固定 + 淡旺季系数) | +507 × 12mo | 月 +1 |
| v1.4 | + Hotel (TP HOTEL category) | crawler: Booking/携程 | +2538 × 7d | 日 |
| v1.5 | + Restaurant 套餐 | crawler: 大众点评 | +10129 × 7d | 周 |
| v1.6 | + Transport (航班/高铁/包车) | crawler/official: Amadeus/12306/滴滴 | +N × 90d | 小时 |
| v1.7 | + Experience (体验项目/门票) | crawler/official: Klook/KKday/美团 | +N × 30d | 日 |
| v1.8 | + Guide/GroundTeam 服务费 | 商家后台人工维护 | +500 | 按需 |
| v1.9 | + 保险/签证/接机 | official: 携程/平安/PICC | +N × 30d | 日 |
| v2.0 | 全站所有可报价实体 | 混合 | 1M+ | 分钟/小时/日/月 |

### 2.3 核心实体与字段

```
PriceSnapshot (单表单一事实源)
├─ entityType : 'ROUTE' | 'PACKAGE' | 'HOTEL' | 'RESTAURANT' | 'TRANSPORT' | 'EXPERIENCE' | 'HOLY_SITE' | 'GUIDE' | 'INSURANCE'
├─ entityId   : String (对应表的 cuid)
├─ date       : DateTime (UTC 00:00)
├─ price      : Int (分)
├─ currency   : 'CNY' (v1.x 只存 CNY)
├─ source     : 'baseline' | 'crawler' | 'official'   [v1.1 新增]
├─ provider   : String?                                [v1.4 新增, eg 'booking'/'amadeus']
├─ sampleRaw  : Json?                                  [v1.4 新增, 原始采集数据]
├─ confidence : Float @default(1.0)                    [v1.2 新增, 0-1 置信度]
└─ @@unique([entityType, entityId, date])
```

---

## §3 规则 (PRC-01 ~ PRC-15, v1.0 首批)

### 3.1 透明性 (PRC-01 ~ PRC-05)

```
[PRC-01] 价格数字必须伴随"数据来源标识"
         任何显示 ¥数字 的 UI 必须近距离挂 PriceSourceBadge
         违反者 Web build 不阻断但天查++会 FAIL

[PRC-02] SimulatedBaseline 产物的 currency 必须标 CNY
         不得与真实采集数据混表,不得假冒 official

[PRC-03] Alert 触发幂等 — isTriggered=true 后不再重复推送
         Notification 去重 key = `price-alert-${alertId}-${snapshotDate}`

[PRC-04] Route.priceFrom vs min(DestinationPackage.priceMin where tier!=LUXURY) 偏差 > 15% 必须告警
         写入 PackagePriceAlert,note 字段记录偏差百分比

[PRC-05] 通知文案只允许 template literal 插已校验 DB 字段
         禁止走 util.format/printf 动态拼接
         Semgrep CWE-134 对 template literal 的告警为假阳性,不做防御性重构
```

### 3.2 算法确定性 (PRC-06 ~ PRC-08)

```
[PRC-06] seed-price-snapshots-v{N}.ts 禁用 Math.random()
         必须用 hash(routeId + dateStr) 做噪声源,重跑幂等
         理由: 回归测试/数据对比需要稳定基准

[PRC-07] 季节/周末/节假日系数必须全局配置在 const 中
         禁止分散 magic number,升级走 v+1 协议 bump

[PRC-08] baseline 价格底线 = 100 分 (¥1),
         Math.max(100, ...) 兜底,防止负价或零价
```

### 3.3 CRON 治理 (PRC-09 ~ PRC-12)

```
[PRC-09] 三条 CRON 必须同时挂载,不允许只挂其一:
         - price-alert-scan      @Cron('0 0 * * * *')  每小时
         - price-reconcile-routes @Cron('0 10 4 * * *') 04:10 日
         - price-snapshot-extend  @Cron('0 20 4 * * *') 04:20 日

[PRC-10] CRON 执行内部必须 try/catch 单实体,
         单条失败不阻断全批,错误写 logger.error

[PRC-11] CRON 输出必须带 elapsed 毫秒 + 处理总数 + 成功/失败分解
         格式: `reconcile: routes=N aligned=A flagged=F elapsed=Xms`

[PRC-12] CRON 注册在 ScheduleModule.forRoot() 模块级,
         Nest 启动日志必须看到 `PriceModule dependencies initialized`
         验证命令: grep -E "PriceModule|ScheduleModule" /opt/zuting/api.log
```

### 3.4 部署与热补 (PRC-13 ~ PRC-15)

```
[PRC-13] seed-price-snapshots-v{N}.ts 是源码范畴,
         redeploy-api-guide.py 等热部署脚本不会带上
         新版本部署后必须 SFTP 单独上传 + tsx 执行

[PRC-14] 生产 seed 执行必须指定版本号:
         ./node_modules/.bin/tsx prisma/seed-price-snapshots-v{N}.ts
         禁止 seed 不加版本号 (防覆盖问题)

[PRC-15] 每次版本升级必须同步:
         - docs/protocols/skills/18-价格++-price-sync.md 版本号 bump
         - docs/prd/M24-v{X}-PRD-价格工具*.md 补丁
         - memory/project_price_tool_wave_{x}_done.md 更新
```

### 3.5 UI 控制台规范 (PRC-31 ~ PRC-33, v1.1 新增)

```
[PRC-31] 价格工具首页 /prices 必须三段式控制台结构
         段一·控制台: PulseBar (系统自愈能力展示) + HeroSearch + ToolsGrid
         段二·洞察: 左 2/3 榜单/热门 · 右 1/3 闪购/告警/预算
         段三·支撑: 方法论 FAQ + Bottom CTA
         理由: 对标 Skyscanner/Kayak/Google Flights/Hopper,首屏即能力展示
         禁止"14 段杂货铺"堆砌 (v1.0 教训),新模块必须归属其中一段或新建专属子页

[PRC-32] PriceSnapshot 新增维度必须同步升级 system-status + PulseBar
         新增 source/provider/confidence 等字段时:
         - /api/prices/system-status sourceBreakdown 必须镜像新 source 分布
         - PricePulseBar 必须相应追加条件渲染项 (baseline/crawler/official 三态)
         - 禁止"后端加字段前端不感知",全链路贯通
         理由: 自愈能力必须对用户可见,否则丧失产品差异化护城河

[PRC-33] 预算/测算/系数类常量必须下沉 @zuting/config
         - DAILY_BASE_YUAN / STYLE_MULTIPLIERS / SEASONAL_COEFFICIENTS 等
         - 禁止内联 magic number 或仅标注 "// 参考值"
         - 升级变动走 price-defaults.ts 版本 bump + PRICE_DEFAULTS_VERSION 递增
         - Admin 可配化路径: 未来 PriceConfig 表对冲硬编码
         理由: 乘数/系数散布 UI 层导致重复,A/B 测试无落点
```

---

## §4 流程 (标准执行序列)

### 4.1 冷启动 Seed (首次或版本升级)

```
Step 1 · 审计: 读 PriceSnapshot 当前总量,识别缺口
   └─ SELECT entityType, COUNT(*), MIN(date), MAX(date) GROUP BY entityType

Step 2 · 确定版本: 查 docs/protocols/skills/18-价格++-price-sync.md §2.2 下一版本
   └─ 例如当前 v1.0,目标 v1.1 = + DestinationPackage

Step 3 · 编写 seed: services/api/prisma/seed-price-snapshots-v{N}.ts
   └─ 必须 upsert,不 delete,保证可重跑

Step 4 · 本地执行: pnpm --filter @zuting/api exec tsx prisma/seed-price-snapshots-v{N}.ts
   └─ 核对日志输出的 wrote/skipped 数字

Step 5 · 部署并 SFTP: redeploy-api-hot.py + sftp.put(seed)

Step 6 · 生产执行: tsx prisma/seed-price-snapshots-v{N}.ts
   └─ 记录执行时长与写入行数

Step 7 · 验证: curl /api/prices/trend?entityType=ROUTE&entityId=X&days=90
         应返回 90 条 trend 数据
```

### 4.2 日常 Reconcile (CRON 自动)

```
每小时 · price-alert-scan:
   └─ PriceAlert(isActive, !isTriggered) → 查最新 PriceSnapshot
      → 若 price ≤ targetPrice: 事务更新 + 通知 + 标 isTriggered

每日 04:10 · price-reconcile-routes:
   └─ 遍历 Route(priceFrom > 0)
      → 拉 min(DestinationPackage.priceMin where tier != LUXURY)
      → 偏差 > 15% 写 PackagePriceAlert

每日 04:20 · price-snapshot-extend:
   └─ 每个 Route 补 +1 天快照 (deterministic)
      → 删除 > 180 天老快照
```

### 4.3 爬虫接入 (Wave A+)

```
触发: 价格++ crawl booking

Step 1 · CrawlerSource 表注册 provider='booking', type='PRICE'
Step 2 · 编写 BookingPriceAdapter (爬虫++ CW-ADAPTER 规范)
Step 3 · BaselineScorer 校验: 采集价格与 baseline 偏差 > 30% 标黄,> 50% 拒收
Step 4 · PriceSnapshot upsert (source='crawler', provider='booking')
Step 5 · PriceSourceBadge 自动升级显示为 "蓝色 · 爬虫采集"
```

### 4.4 官方 API 接入 (Wave B)

```
触发: 价格++ crawl amadeus  (需要凭证)

Step 1 · 凭证入 .env: AMADEUS_API_KEY=... AMADEUS_API_SECRET=...
Step 2 · OAuth2 token cache (15min)
Step 3 · 每 6h CRON 拉真价 → upsert (source='official', provider='amadeus')
Step 4 · 自动触发对应 Route 的 baseline → official 状态迁移日志
Step 5 · 首页 /prices 页 badge 升级为 "翠色 · 官方合作数据"
```

---

## §5 评分 (N维 × 5星)

| 维度 | 5星标准 | 4星 | 3星 | 2星 | 1星 |
|------|---------|-----|-----|-----|-----|
| **D1 透明度** | 所有价格 UI 挂 Badge + source/provider/updatedAt | 80%+ | 60%+ | 40%+ | 无 |
| **D2 覆盖率** | §2.2 当前版本目标 100% 实体有快照 | 80% | 60% | 40% | 20% |
| **D3 时效性** | 最新快照 ≤ 版本目标频率的 1.5× | 2× | 3× | 7× | > 7× |
| **D4 对齐度** | Route↔Package 偏差 ≤ 5% | ≤ 10% | ≤ 15% | ≤ 25% | > 25% |
| **D5 告警响应** | CRON 触发到通知 ≤ 60min | ≤ 2h | ≤ 6h | ≤ 24h | > 24h |
| **D6 可追溯** | 每快照有 sourceUrls + sampleRaw + confidence | 缺 1 | 缺 2 | 缺 3 | 无 |
| **D7 幂等性** | seed 重跑产生 0 diff | 极少 diff | 小规模 | 较多 | 无法重跑 |
| **D8 CRON 健康** | 三条全挂,错误率 < 1% | 1-3% | 3-5% | 5-10% | > 10% 或缺挂 |

**评级**: ≥ 4.0 ✅ PASS | 3.0-3.9 ⚠️ PARTIAL | < 3.0 ❌ FAIL
**v1.0 基线**: D1=4, D2=2 (仅 Route), D3=5, D4=3 (未校), D5=5, D6=2 (无 sampleRaw), D7=5, D8=5 → 平均 **3.875 ⚠️ PARTIAL**

---

## §6 工具 (配套脚本与组件)

| 工具 | 路径 | 职责 |
|------|------|------|
| seed-price-snapshots-v{N}.ts | services/api/prisma/ | 确定性 baseline 生成器 |
| PriceReconcileService | services/api/src/modules/price/ | 两条日 CRON (对齐 + 滚动) |
| PriceAlertCronService | services/api/src/modules/price/ | 每小时扫描触发 |
| PriceSourceBadge.tsx | apps/web/src/components/ | 三态徽章组件 |
| price.controller.ts | services/api/src/modules/price/ | /api/prices/{calendar,compare,trend,alerts} |
| redeploy-api-hot.py | scripts/ | API 热补 (seed 需单独 SFTP) |
| deploy-xiaoqing.py | scripts/ | 主部署 (带 prisma/ 全目录) |

**升级协议工具链** (v1.1+ 计划新增):
- `apps/admin/src/pages/PriceAuditPage.tsx` — 价格异常值管理后台
- `apps/mobile/src/components/PriceSourceBadge.tsx` — Mobile 镜像组件
- `scripts/audit-price-mocks.py` — 扫描前端 hardcoded 数字

---

## §7 生命周期 (版本升级路径)

```
v1.0 (2026-04-22) ✅
  ├─ Route baseline × 91d × 33 routes = 3003 snapshots
  ├─ 3 条 CRON 挂载
  └─ PriceSourceBadge baseline 态

v1.1 (2026-04-22) ✅ 当前 · /prices v3 UI 控制台重构
  ├─ 3 段式结构 (控制台/洞察/支撑) 替换 14 段杂货铺
  ├─ 9 新组件: PulseBar/HeroSearch/ToolsGrid/TodayLow/TopMovers/FlashDeal/AlertInline/BudgetEstimator/Methodology
  ├─ 3 新端点: /system-status /today-low /top-movers (@Public 免登录)
  ├─ 预算乘数下沉 @zuting/config/price-defaults.ts
  ├─ PRC-31~33 铁律入库
  └─ i18n zh-CN/en 首批,其余语言回退 DEFAULT_LOCALE

v1.2 · DestinationPackage 直映射 (目标 2026-05 上旬)
  ├─ seed-price-snapshots-v1.2.ts 加 PACKAGE entityType
  ├─ PriceSnapshot 加 source/provider 字段 (Prisma migration)
  └─ admin/PriceAuditPage 上线

v1.3 · tier 分档基线 (目标 2026-05 中旬)
  ├─ 4 档配套 × 30d 价格
  ├─ confidence 字段启用
  └─ 天查++ 新增价格维度审计

v1.4 · HolySite 门票接入 (目标 2026-06)
  ├─ 507 目的地 × 12 月门票快照
  └─ 冷热季节系数独立配置

v1.4 · 第一个真实爬虫接入 (Booking/携程, 2026-07)
  ├─ 依赖 爬虫++ CW PRICE 域
  ├─ BaselineScorer 校验采集值
  └─ PriceSourceBadge 升级为 crawler 态

v1.5-v1.9 · 餐饮/交通/体验/商家服务/保险分阶段接入

v2.0 · 全站 1M+ 实体覆盖 + 官方 API 混合 (目标 2027)
  ├─ Amadeus 航司
  ├─ 携程开放平台合作
  └─ PriceSourceBadge official 态成主流
```

### 版本升级流程

```
1. 修改 docs/protocols/skills/18-价格++-price-sync.md
   └─ version bump + §2.2 矩阵追加 + §3 新铁律 + §7 当前版本

2. 编写 services/api/prisma/seed-price-snapshots-v{N}.ts
   └─ 继承 v{N-1} 算法,增量 upsert 新实体

3. 如需新字段: services/api/prisma/schema.prisma 改 → prisma db push
   └─ 走 R-32 默认值/null 规则

4. 本地 tsc + build + 本地 seed 验证

5. git commit feat(price): 价格++ v{N} — {新增覆盖说明}

6. redeploy + SFTP seed + 生产 tsx 执行

7. 验证 curl /api/prices/trend 样本 + 徽章新态呈现

8. memory/project_price_tool_wave_{x}_done.md 更新

9. 全审++ hohoho 过一遍 5 维 + 新增 D6-D8
```

---

## §8 铁律汇总 (PRC-01 ~ PRC-33 已落地 / ~PRC-50 预留)

### 已落地 v1.0 (价格数据治理)

```
[PRC-01] 价格数字必须伴随"数据来源标识"
[PRC-02] SimulatedBaseline 产物 currency 标 CNY,不混入真实采集数据
[PRC-03] Alert 触发幂等 — isTriggered=true 后不再重复推送
[PRC-04] Route↔Package 偏差 >15% 必须告警
[PRC-05] 通知文案只用 template literal 插 DB 字段,不走 printf
[PRC-06] seed 禁 Math.random(),必须 hash 幂等
[PRC-07] 季节/周末系数必须全局 const,不分散
[PRC-08] baseline 底线 100 分兜底
[PRC-09] 三条 CRON 必须同时挂
[PRC-10] CRON 单实体 try/catch,失败不阻断全批
[PRC-11] CRON 输出必须带 elapsed + 处理总数
[PRC-12] CRON 注册后必须在 Nest 启动日志验证 Schedule 初始化
[PRC-13] seed-price-snapshots-v{N}.ts 热部署不带,需 SFTP
[PRC-14] 生产 seed 必须指定版本号
[PRC-15] 版本升级必须同步 protocol + PRD + memory
```

### 已落地 v1.1 (UI 控制台规范)

```
[PRC-31] /prices 必须三段式控制台 (控制台/洞察/支撑),禁止段堆砌
[PRC-32] PriceSnapshot 新增维度必须全链路贯通到 system-status + PulseBar
[PRC-33] 预算/测算常量必须下沉 @zuting/config,禁止内联 magic number
```

### 预留 (v1.2+ 落地后补上)

```
[PRC-16] crawler 价格必须与 baseline 交叉校验 (≤30% 偏差放行)  [v1.5]
[PRC-17] PriceSnapshot.sampleRaw 必须保存采集原文                 [v1.5]
[PRC-18] confidence 字段 < 0.6 的快照禁止展示                    [v1.3]
[PRC-19] provider 字段非空时 source 必须为 crawler 或 official    [v1.5]
[PRC-20] official 降级为 crawler/baseline 需 CEO 审批 + 日志      [v1.5]
[PRC-21] 多货币进入后必须显式 currency 字段展示 (前端)            [v1.7]
[PRC-22] 小时级/分钟级 CRON 必须有分布式锁防重                   [v1.7]
[PRC-23] 爬虫失败超 3 次降级回 baseline + 告警                    [v1.5]
[PRC-24] 价格变动 > 30% 必须走人工审核                           [v1.5]
[PRC-25] 凭证密钥只进 .env / Vault,禁入仓                        [v1.5]
[PRC-26] price 字段禁止负数/零 (历史 Math.max(100) 同理)         [v1.3]
[PRC-27] 过期价格 (> 90d 无更新) UI 显示"数据陈旧"灰度           [v1.4]
[PRC-28] 促销价必须独立 PromotionalPriceSnapshot 表,不污染主表   [v1.6]
[PRC-29] 多实体组合价 (套餐) 必须分子价 + 组合价双存             [v1.6]
[PRC-30] v2.0 冻结表结构,重大变更走 schema migration + 回滚计划    [v2.0]
```

---

## §9 联动

| 联动技能 | 触发点 | 协作方式 |
|---------|-------|---------|
| **爬虫++ (CW)** | 价格++ v1.4 起 | 价格++ 定义 source/provider 契约,爬虫++ 实现 PRICE 域 adapter |
| **旅游配套++ (TP)** | v1.4+ 接入 Hotel/Restaurant | TP 负责实体,PRC 负责价格字段与快照 |
| **目的地++ (DST)** | v1.3 门票接入 | DST 负责 HolySite 主数据,PRC 挂价格维度 |
| **全审++ (FA)** | 每个 PR | D6-D11 扩展维度包含契约漂移/数据完整性,PRC 有输入 |
| **天查++ (TC)** | 版本升级 | 价格透明度审计,验证 PriceSourceBadge 挂载率 |
| **项目++ (PJ)** | 每个版本 | 协议升级时生成 DOC-PRC-v{N} 标准文档 |
| **业务++ (BLG)** | 价格页面设计 | Q1-Q5 测试确保价格展示服务用户决策,不堆砌数字 |
| **飞轮++ (FW)** | Alert 触发闭环 | Alert → 推送 → 用户点击 → 下单的全链路验证 |

---

## 附录 A · v1.0 交付物清单

- ✅ Commit `c2c03c6` (2026-04-22)
- ✅ PRD: `docs/prd/M24-v2-PRD-价格工具数据对齐重构.md`
- ✅ Seed: `services/api/prisma/seed-price-snapshots-v1.ts`
- ✅ CRON: `price-reconcile.service.ts` + `price-alert-cron.service.ts`
- ✅ Module: `price.module.ts` + `ScheduleModule.forRoot()`
- ✅ Component: `apps/web/src/components/PriceSourceBadge.tsx`
- ✅ 4 页挂载: `/prices`, `/prices/calendar`, `/prices/compare`, `/prices/trend`
- ✅ 踩坑实录: `E:\ZUTING-APP\业务逻辑PRD\F-ZZ07-价格工具数据对齐重构流程与踩坑实录.md`
- ✅ 生产运行数据: 3003 snapshots · 3 CRONs 挂载 · 4 页面 HTTP 200

## 附录 A2 · v1.1 交付物清单 (UI 控制台)

- ✅ Commits: `56aa139` (架构) · `f38e031` (3 新 API) · `85691df` (config 下沉) · `5f1f229` (i18n) · `954f25d` (移动端)
- ✅ 9 新组件: `apps/web/src/components/Price{PulseBar,HeroSearch,ToolsGrid,TodayLow,TopMovers,FlashDeal,AlertInline,BudgetEstimator,Methodology}.tsx`
- ✅ 3 新端点: `/api/prices/system-status` · `/api/prices/today-low` · `/api/prices/top-movers` (全 @Public)
- ✅ Config 下沉: `packages/config/src/price-defaults.ts` (DAILY_BASE_YUAN/STYLE_MULTIPLIERS)
- ✅ i18n: zh-CN + en 14 新键 (`prices.v3.pulse.*` / `prices.v3.insights.*`)
- ✅ 页面: `/prices` 重构为三段式控制台 (867 行 → 220 行)
- ✅ Memory: `project_price_tool_v3_ui.md` (M24-v3 交付索引)

## 附录 B · 常用命令速查

```bash
# 本地: 跑 seed (幂等)
pnpm --filter @zuting/api exec tsx prisma/seed-price-snapshots-v1.ts

# 生产: SSH key + SFTP + tsx
ssh root@120.24.31.151 -i ~/.ssh/xiaoqing_deploy_ed25519 \
   "cd /opt/zuting/api && ./node_modules/.bin/tsx prisma/seed-price-snapshots-v1.ts"

# 查询快照量
psql -h 127.0.0.1 -p 5434 -U zuoyelang -d zuting -c \
   "SELECT \"entityType\", COUNT(*) FROM \"PriceSnapshot\" GROUP BY \"entityType\";"

# 验证 CRON 注册
grep -E "PriceModule|ScheduleModule" /opt/zuting/api.log | tail -5

# API 趋势端点
curl "https://zuting.fszyl.top/api/prices/trend?entityType=ROUTE&entityId={id}&days=90"
```
