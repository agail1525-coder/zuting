# 旅游配套++ (Travel Package Enrichment) v1.0

> **代号**: TP | **版本**: v1.0 | **创建**: 2026-04-13
> **定位**: 全球目的地真实旅游配套持续充实引擎 — 四档配套 × 爬虫驱动 × 垂直专业
> **愿景**: JOINUS.COM 成为全球文化旅行配套 NO.1 — 每个目的地都有真实、分档、可预订的配套服务
> **触发**: `旅游配套++` / `旅游配套++ {destinationSlug}` / `旅游配套++ {tier}` / `旅游配套++ 爬虫`
> **核心**: 真实(禁编造) × 分档(4 tier) × 垂直(文化深度) × 自动化(每日爬虫)

---

## §0 元数据

```yaml
name: travel-package-enrichment
code: TP
version: 1.0
triggers:
  - 旅游配套++                              # 自动循环：选最弱目的地 × 最缺配套补
  - 旅游配套++ {holySiteSlug|routeSlug}     # 针对单个目的地补齐4档配套
  - 旅游配套++ {tier}                       # LUXURY/BUSINESS/STANDARD/BUDGET 四档专项
  - 旅游配套++ 爬虫                         # 执行/新增/诊断爬虫源
  - 旅游配套++ 爬虫 {sourceId}              # 单源手动执行
  - 旅游配套++ 寺院净化                     # 批量把"寺院提供..."改为"请咨询当地地接"
前置条件:
  - 目的地++ 已播种 (HolySite/Route 表有数据)
  - 数据库含 TravelPackage/CrawlerSource/CrawlerRun 表 (见§4)
  - 至少 2 个权威数据源可对照验证 (官网/Booking/TripAdvisor/当地旅游局)
后置动作:
  - 生成 seed-packages-v{N}.ts 补丁 (N递增,幂等upsert)
  - 本地 tsc → build → PUSH++ 部署
  - 生产SSH运行v{N}种子 + Redis缓存刷新 (package:*/crawler:*)
  - 首页/目的地详情页/路线详情页新增"配套分档"入口
联动技能: 目的地++ (DST) / 项目++ (PJ) / 页面++ (PQM) / 全审++ (FA) / 天查++ (TC)
核心铁律: TP-01 ~ TP-20 (见§8)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Scout** (侦察) | 从权威源/爬虫采集目的地原始配套数据 (酒店/餐饮/交通/向导/体验项目) | Step 1 |
| **Verifier** (核验) | ≥2 独立来源交叉核验 价格/营业状态/评级 | Step 2 |
| **Tierer** (分档) | 按价格带 + 评级 + 服务档次将配套归入 LUXURY/BUSINESS/STANDARD/BUDGET | Step 3 |
| **Curator** (策展) | 为每档组装完整配套包 (住+食+行+游+购+体验) | Step 4 |
| **Localizer** (落地) | 标注地接咨询联系方式/禁忌/季节/注意事项 | Step 5 |
| **PurityGuard** (净化) | 扫描"寺院提供..."等不当描述 → 替换为"请咨询当地地接服务团队" | Step 6 |
| **Seeder** (播种) | 生成幂等upsert补丁 seed-packages-v{N}.ts | Step 7 |
| **Crawler** (爬虫) | 维护每日定时爬虫 + 源管理后台 + 变更检测 | 持续 |
| **Auditor** (审核) | 抽样访问详情页验证可落地性和档次区分度 | Step 8 |

---

## §2 作用域

### 2.1 四档配套标准 (Tier System)

> 所有配套**必须**打上档次标签。用户在详情页一眼看到自己消费层级对应的服务。

| Tier Code | 中文名 | 目标客群 | 人均预算(CNY/天) | 住宿标准 | 餐饮标准 | 交通标准 | 向导标准 |
|-----------|--------|---------|----------------|---------|---------|---------|---------|
| `LUXURY` | 尊贵游 | 高净值/企业家/朝圣VIP | ¥3000+ | 五星/奢华庄园/寺院独院 | 米其林/文化宴/素宴大师 | 商务车/专车司机/私人飞机 | 学者型/双语/1对1 |
| `BUSINESS` | 商务游 | 高管/企业团建/家庭度假 | ¥1500-3000 | 四星精选/精品民宿 | 特色餐厅/文化主题餐 | 舒适中巴/商务车 | 资深持证/双语 |
| `STANDARD` | 标准游 | 大众文化游客/首次朝圣 | ¥600-1500 | 三星/品牌连锁 | 本地馆子/特色小吃 | 旅游大巴/公共交通 | 持证导游/中文 |
| `BUDGET` | 自助游 | 年轻背包客/自由行 | ¥200-600 | 青旅/客栈/民宿 | 自主/街边小吃 | 公交/地铁/步行 | 电子导览/APP |

### 2.2 单目的地配套完整度矩阵

| 配套维度 | LUXURY | BUSINESS | STANDARD | BUDGET | 必填字段 |
|---------|--------|----------|----------|--------|---------|
| **住** (Hotels) | ≥3 家 | ≥3 家 | ≥5 家 | ≥3 家 | name/priceRange/coords/bookingUrl |
| **食** (Restaurants) | ≥3 家 | ≥3 家 | ≥5 家 | ≥3 家 | name/cuisine/priceAvg/coords |
| **行** (Transport) | ≥2 方案 | ≥2 方案 | ≥3 方案 | ≥3 方案 | type/route/duration/price |
| **游** (Experiences) | ≥5 项 | ≥5 项 | ≥5 项 | ≥3 项 | name/duration/price/bookingUrl |
| **购** (Shopping) | ≥2 店 | ≥2 店 | ≥3 店 | ≥2 店 | name/specialty/coords |
| **向导** (Guides) | 必填 | 必填 | 必填 | 可选 | name/language/rating/contact |
| **地接团队** (Ground Team) | 必填 | 必填 | 必填 | 必填 | contactPhone/wechat/workingHours |
| **季节建议** | 必填 | 必填 | 必填 | 必填 | bestMonths/avoidMonths/reason |
| **文化禁忌** | 必填 | 必填 | 必填 | 必填 | list[] + 配图 |
| **预订窗口** | ≥30天 | ≥15天 | ≥7天 | ≥3天 | leadTime |

### 2.3 覆盖目标 (阶段推进)

| 阶段 | HolySite × 4Tier | Route × 4Tier | 覆盖率 | 预计版本 |
|------|-------------------|---------------|--------|---------|
| Phase 1 | Top 50 圣地 | Top 10 路线 | 17% | v1-v10 |
| Phase 2 | Top 150 圣地 | Top 30 路线 | 50% | v11-v30 |
| Phase 3 | 300 全圣地 | 80 全路线 | 100% | v31-v80 |
| Phase 4 | 扩充至 1000 圣地 | 200+ 跨国路线 | 全覆盖 | v81+ |

---

## §3 规则

### 3.1 真实性铁律 (TP-01 ~ TP-05)

```
[TP-01] 所有配套数据必须有 ≥2 个独立来源佐证
        合规源: 官网/Booking.com/TripAdvisor/Google Maps/当地旅游局/维基/XHS/马蜂窝
        禁止: LLM编造/AI想象/无来源填充
[TP-02] 每条记录必须有 sourceUrls: string[] (至少2个)
        爬虫源写入 sourceUrls + sourceLastSeenAt
[TP-03] 价格必须标 currency+priceMin+priceMax+priceUnit+priceAsOf
        禁止模糊价格如"约XXX"，必须具体数值+日期
[TP-04] GPS 必须来自 Google Maps/高德 API 或官网披露，精度 ≥5位小数
[TP-05] 联系方式 (电话/邮箱/微信) 必须验证可达。
        无法验证则留空并在 note 说明"建议预订前再次核实"
```

### 3.2 寺院服务净化 (TP-06 ~ TP-08)

```
[TP-06] 所有文本字段禁止出现以下模式:
        ❌ "寺院提供住宿/斋饭/向导/接送/禅修/讲法..."
        ❌ "寺庙安排..."
        ❌ "僧众会帮助..."
        ✅ "请咨询当地地接服务团队 (联系方式见下)"
        ✅ "由持证地接团队为您安排专业服务"
        ✅ "寺院为文化场所,餐食/住宿/向导等由地接团队提供"
[TP-07] 净化扫描范围: HolySite.description/tips/arrangements,
        Temple.description/services, Route.itinerary/included,
        TravelPackage.* 所有文本字段
[TP-08] 净化触发: `旅游配套++ 寺院净化` 生成 purify-v{N}.ts 幂等补丁
        每次新增配套前自动扫描,违反则阻断保存
```

### 3.3 分档铁律 (TP-09 ~ TP-12)

```
[TP-09] 每档配套必须完整闭环 (住+食+行+游+购+向导+地接),
        不允许只填部分字段
[TP-10] 档次价格带不得交叉:
        LUXURY minPrice > BUSINESS maxPrice > STANDARD maxPrice > BUDGET maxPrice
[TP-11] 档次升级路径: 用户可一键从STANDARD升级至BUSINESS/LUXURY,
        详情页必须提供 tier-switcher 组件
[TP-12] 档次标签颜色:
        LUXURY = #8B6914 (暖金)
        BUSINESS = #1E3A8A (深蓝)
        STANDARD = #059669 (翡翠)
        BUDGET = #D97706 (琥珀)
        全端统一,不得偏色
```

### 3.4 爬虫规范 (TP-13 ~ TP-16)

```
[TP-13] 爬虫源必须在 CrawlerSource 表注册:
        {id, name, baseUrl, type, schedule(cron), selector(JSON), enabled, lastRunAt, lastStatus}
[TP-14] 爬虫必须遵守 robots.txt 和 rate-limit:
        同域每秒 ≤1 请求, 带 User-Agent: "JoinusBot/1.0 (+https://joinus.com/crawler)"
[TP-15] 爬虫执行记录写入 CrawlerRun 表:
        {id, sourceId, startedAt, finishedAt, status, itemsFound, itemsUpdated, errorLog}
[TP-16] 爬虫抓取后必须 diff 检测:
        - 价格变动 >20% 写入预警
        - 营业状态变化 (关闭/迁址) 写入预警
        - 新增条目走人工审核队列,不自动发布
```

### 3.5 数据安全 (TP-17 ~ TP-20)

```
[TP-17] 爬虫 selector 白名单验证: 禁止执行任意 JS eval,只允许
        cheerio 选择器 + 正则抽取 + 预定义解析函数
[TP-18] 爬虫请求必须有超时 (10s connect + 30s read),
        失败重试上限 3 次,指数退避
[TP-19] 外部URL存储前必须 URL.canParse 验证,
        禁止存储 javascript:/data: 协议
[TP-20] 爬虫源管理后台只对 ADMIN 角色开放,
        修改/新增/删除爬虫源走审计日志 (AuditLog 表)
```

---

## §4 数据模型 (Prisma)

> 新增表 (v1.0 schema additions)，需走 `prisma db push` → `db:seed`。

```prisma
enum PackageTier {
  LUXURY       // 尊贵游
  BUSINESS     // 商务游
  STANDARD     // 标准游
  BUDGET       // 自助游
}

enum PackageCategory {
  HOTEL        // 住
  RESTAURANT   // 食
  TRANSPORT    // 行
  EXPERIENCE   // 游
  SHOPPING     // 购
  GUIDE        // 向导
  GROUND_TEAM  // 地接
}

model TravelPackage {
  id            String           @id @default(cuid())
  holySiteId    String?
  routeId       String?
  holySite      HolySite?        @relation(fields: [holySiteId], references: [id])
  route         Route?           @relation(fields: [routeId], references: [id])

  tier          PackageTier
  category      PackageCategory
  title         String
  titleEn       String?
  description   String           @db.Text
  coverImage    String?
  images        String[]

  priceMin      Int              // 分
  priceMax      Int              // 分
  currency      String           @default("CNY")
  priceUnit     String           // "人/天" | "间/晚" | "场"
  priceAsOf     DateTime

  // 地接联系方式
  groundTeamName    String?
  groundTeamPhone   String?
  groundTeamWechat  String?
  groundTeamHours   String?      // "09:00-21:00 GMT+8"
  groundTeamNote    String?      @db.Text

  // 溯源
  sourceUrls        String[]     // ≥2
  sourceLastSeenAt  DateTime
  crawlerSourceId   String?
  crawlerSource     CrawlerSource? @relation(fields: [crawlerSourceId], references: [id])

  // 元数据
  bestMonths    Int[]            // [3,4,5,9,10]
  avoidMonths   Int[]
  taboos        String[]         // 文化禁忌
  leadTimeDays  Int              @default(3)
  rating        Float?
  reviewCount   Int              @default(0)
  enabled       Boolean          @default(true)

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@index([holySiteId, tier])
  @@index([routeId, tier])
  @@index([tier, category])
}

model CrawlerSource {
  id           String           @id @default(cuid())
  name         String
  baseUrl      String
  type         String           // "HOTEL" | "RESTAURANT" | "EXPERIENCE" | "OFFICIAL"
  schedule     String           @default("0 3 * * *") // cron, 默认每日03:00
  selector     Json             // { list, title, price, images, coords ... }
  parser       String           // 预定义解析函数名
  rateLimitMs  Int              @default(1000)
  enabled      Boolean          @default(true)
  lastRunAt    DateTime?
  lastStatus   String?          // "SUCCESS" | "PARTIAL" | "FAILED"
  createdBy    String
  packages     TravelPackage[]
  runs         CrawlerRun[]

  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([enabled, schedule])
}

model CrawlerRun {
  id            String        @id @default(cuid())
  sourceId      String
  source        CrawlerSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  startedAt     DateTime      @default(now())
  finishedAt    DateTime?
  status        String        // "RUNNING" | "SUCCESS" | "FAILED"
  itemsFound    Int           @default(0)
  itemsCreated  Int           @default(0)
  itemsUpdated  Int           @default(0)
  itemsSkipped  Int           @default(0)
  alertsCount   Int           @default(0)    // 价格异常/关闭预警
  errorLog      String?       @db.Text
  triggeredBy   String        @default("CRON") // "CRON" | "MANUAL" | "API"

  @@index([sourceId, startedAt])
}

model PackagePriceAlert {
  id           String        @id @default(cuid())
  packageId    String
  oldPriceMin  Int
  newPriceMin  Int
  changeRatio  Float         // (new-old)/old
  detectedAt   DateTime      @default(now())
  acknowledged Boolean       @default(false)
  note         String?

  @@index([acknowledged, detectedAt])
}
```

---

## §5 执行流程

### Step 1 — 侦察 (Scout)
读 HolySite/Route, 选择 `TravelPackage.count < 4` 的目的地作为本轮目标。优先覆盖率最低的目的地优先。

### Step 2 — 爬虫采集 或 人工检索
- 自动: 执行已注册 CrawlerSource, 写入 CrawlerRun
- 人工: 打开 Booking/TripAdvisor/官网, 收集 ≥2 来源数据

### Step 3 — 核验
交叉对照 2 个以上来源,不一致的字段留空或取中位数,所有差异记录到 note。

### Step 4 — 分档 + 策展
按 §2.1 表格将候选项归入 LUXURY/BUSINESS/STANDARD/BUDGET。每档必须凑齐 住/食/行/游/购/向导/地接 7 类。

### Step 5 — 净化 (PurityGuard)
扫描所有文本字段,按 TP-06 规则把"寺院提供..."替换为"请咨询当地地接服务团队"。生成 purify-report.md。

### Step 6 — 落地信息补齐
每档必填 地接联系方式/季节建议/文化禁忌/预订窗口。

### Step 7 — 种子补丁
生成 `services/api/prisma/seed-packages-v{N}.ts`,幂等 upsert by `holySiteId+tier+category+title`。

### Step 8 — 部署 + 验证
本地 tsc → 种子测试 → git commit → PUSH++ → 生产运行种子 → Redis flush → 浏览器验证详情页分档。

---

## §6 工具 + Admin 后台

### 6.1 Admin 页面 (新增 3 页)

| 路径 | 页面 | 功能 |
|------|------|------|
| `/admin/packages` | 旅游配套管理 | CRUD TravelPackage, 按目的地/档次筛选, 批量分档升级 |
| `/admin/crawlers` | 爬虫源管理 | CrawlerSource CRUD + 手动触发 + 查看运行记录 + 启停 |
| `/admin/crawler-alerts` | 配套预警 | PackagePriceAlert 列表, 确认异常, 查看差异diff |

### 6.2 API 端点 (新增)

```
GET    /api/packages?holySiteId=...&tier=LUXURY
GET    /api/packages/:id
POST   /api/packages                   [ADMIN]
PATCH  /api/packages/:id               [ADMIN]
DELETE /api/packages/:id               [ADMIN]

GET    /api/crawlers/sources           [ADMIN]
POST   /api/crawlers/sources           [ADMIN]
PATCH  /api/crawlers/sources/:id       [ADMIN]
POST   /api/crawlers/sources/:id/run   [ADMIN] 手动触发
GET    /api/crawlers/runs?sourceId=... [ADMIN]

GET    /api/crawler-alerts             [ADMIN]
PATCH  /api/crawler-alerts/:id/ack     [ADMIN]
```

### 6.3 CRON 定时任务

`services/api/src/modules/crawler/crawler.cron.ts`:
- 每日 03:00 遍历 enabled=true 的 CrawlerSource 按 cron 调度执行
- 每小时 00:00 扫描过去24h 的 PackagePriceAlert, 超过5条未确认则通知 ADMIN

### 6.4 Web 前端组件

| 组件 | 位置 | 功能 |
|------|------|------|
| `<TierSwitcher>` | 目的地/路线详情页顶部 | 四档切换, 不同档次展示不同配套包 |
| `<PackageCard>` | 配套列表 | 档次徽章(TP-12 颜色) + 价格 + 评级 + 预订按钮 |
| `<GroundTeamContact>` | 配套详情底部 | 地接团队联系卡片,替代"寺院提供"话术 |
| `<TierBadge>` | 全站卡片 | 尊贵游/商务游/标准游/自助游 徽章 |

---

## §7 生命周期

| 阶段 | 动作 |
|------|------|
| **v0 (初始化)** | prisma 迁移, seed CrawlerSource 10个种子源 |
| **v1-v10** | Top 50 圣地 × 4档 (200 配套) |
| **v11-v30** | Top 150 圣地 × 4档 + 10 源爬虫生产化 |
| **v31-v80** | 全 300 圣地 + 80 路线完全覆盖 |
| **v80+** | 开始扩充至 1000 圣地, 接入第三方预订API (Booking Partner/Agoda Affiliate) |

### 7.1 循环节奏
- 日常: 每日 03:00 CRON 执行爬虫,自动增量更新
- 每周: AI 执行 `旅游配套++` 补充 5-10 个新目的地
- 每月: 全量 `旅游配套++ 寺院净化` 扫描 + 价格校正

---

## §8 铁律总表 (TP-01 ~ TP-20)

| 铁律 | 类别 | 摘要 |
|------|------|------|
| TP-01 | 真实 | 所有配套 ≥2 独立来源 |
| TP-02 | 真实 | sourceUrls + sourceLastSeenAt 必填 |
| TP-03 | 真实 | 价格必须具体+日期 |
| TP-04 | 真实 | GPS ≥5 位小数 |
| TP-05 | 真实 | 联系方式验证可达,否则留空 |
| TP-06 | 净化 | 禁止"寺院提供..."措辞 |
| TP-07 | 净化 | 全文本字段扫描 |
| TP-08 | 净化 | 新增前自动扫描,违反阻断 |
| TP-09 | 分档 | 每档完整闭环 7 类配套 |
| TP-10 | 分档 | 档次价格带不交叉 |
| TP-11 | 分档 | 一键升级路径 |
| TP-12 | 分档 | 四色标签全端统一 |
| TP-13 | 爬虫 | CrawlerSource 表注册 |
| TP-14 | 爬虫 | 遵守 robots + rate-limit |
| TP-15 | 爬虫 | CrawlerRun 执行记录 |
| TP-16 | 爬虫 | 变更预警 + 人工审核 |
| TP-17 | 安全 | selector 白名单,禁 eval |
| TP-18 | 安全 | 超时 + 重试上限 |
| TP-19 | 安全 | URL 协议校验 |
| TP-20 | 安全 | ADMIN + 审计日志 |

---

## §9 联动

- **目的地++ (DST)**: 先有真实目的地,才有配套。DST → TP 顺序执行
- **项目++ (PJ)**: 生成 M42-PRD-旅游配套.md + P31-PRD-配套详情页.md
- **页面++ (PQM)**: 升级目的地详情页 + 路线详情页 + 新建 /packages 列表页
- **全审++ (FA)**: V2功能/V4安全/D8韧性/D10状态机 全维审查
- **天查++ (TC)**: 拓扑检查 — Admin/Web/API 三端配套数据一致性
- **经论++ (SCR)**: 为配套添加经典引言 (如 LUXURY 配套配大师引言)

---

## §10 验收清单

**单目的地验收** (任一不合格则 FAIL):
- [ ] 4 档配套均齐全 (LUXURY/BUSINESS/STANDARD/BUDGET)
- [ ] 每档 7 类 (住/食/行/游/购/向导/地接) 至少有 1 条
- [ ] 所有条目 sourceUrls ≥2
- [ ] 所有价格有具体数字 + currency + priceAsOf
- [ ] 全文本无"寺院提供..."违禁措辞
- [ ] 地接联系方式字段非空
- [ ] 档次价格带无交叉
- [ ] 详情页 TierSwitcher 可切换,切换后展示不同数据
- [ ] Admin 后台可 CRUD
- [ ] Redis 缓存已刷新

**爬虫系统验收**:
- [ ] CrawlerSource 表存在,≥5 个种子源
- [ ] CRON 定时任务已注册
- [ ] /admin/crawlers 页面可管理 (增删改/手动触发/查看历史)
- [ ] /admin/crawler-alerts 页面可查看+确认预警
- [ ] 手动触发 1 个源, CrawlerRun 有记录,items 有更新

---

> **触发即执行**: 后续会话输入 `旅游配套++` 自动进入此协议。
> **优先级**: TP 铁律独立于各模块,违反即阻断提交。
