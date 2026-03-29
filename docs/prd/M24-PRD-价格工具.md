# M24-PRD-价格工具

> 版本: v1.0 | 日期: 2026-03-29 | 状态: 已批准 | 负责人: CEO++

---

## 1. 产品概述

### 1.1 功能定位

价格工具模块是 JOINUS.COM 的核心商业智能工具，帮助用户做出最优朝圣计划决策。本模块对标 Skyscanner 价格日历、Kayak 比价工具、Google Flights 价格趋势图，结合宗教文化旅行垂直场景，提供价格透明、价值可见的朝圣预订体验。

### 1.2 战略价值

- **转化率提升**: 价格日历让用户找到最低价出行日期，降低决策门槛
- **用户留存**: 价格提醒让用户持续关注平台，提高回访率
- **信任建立**: 价格趋势图展示历史价格，证明当前价格合理性
- **差异化竞争**: 祖庭/圣地专属朝圣套餐价格工具，竞品无法复制

---

## 2. 竞品对标分析

### 2.1 Skyscanner 价格日历

| 功能点 | Skyscanner 做法 | JOINUS.COM 适配 |
|--------|----------------|-----------------|
| 月度日历视图 | 全月价格热力图，最低价高亮绿色 | 套餐/路线按日期展示起价 |
| 颜色编码 | 绿(低价)/黄(中价)/红(高价)/灰(无数据) | 同样颜色逻辑 |
| 月份导航 | 前后月切换，最多查看12个月 | 支持前后3个月 |
| 点击日期 | 弹出当日可用航班列表 | 弹出当日可用套餐/路线 |
| 灵活日期 | "整个月最低价"一键筛选 | "本月最低价"快捷按钮 |

### 2.2 Kayak 比价工具

| 功能点 | Kayak 做法 | JOINUS.COM 适配 |
|--------|------------|-----------------|
| 多项对比 | 最多5个选项并排对比 | 最多4个套餐/路线并排 |
| 对比维度 | 价格/时长/设施/评分 | 价格/天数/含项/评分/会员价 |
| 价格迷你图 | 每个选项显示30天价格走势 | 同，显示最近30天 |
| 高亮最优 | 自动标记"最佳价值" | 标记"价格最低"/"评分最高" |

### 2.3 Google Flights 价格趋势

| 功能点 | Google 做法 | JOINUS.COM 适配 |
|--------|-------------|-----------------|
| 趋势折线图 | 显示过去90天价格历史 | 显示最近30/60/90天 |
| 建议标签 | "价格正在上涨，建议尽快购买" | "比历史均价低X%，好时机!" |
| 预测 | 7天内价格预测 | 暂不实现(P2) |

---

## 3. 用户故事

### 3.1 核心用户故事

**US-01 价格日历**
> 作为朝圣者，我想查看某条路线/套餐在未来一个月内每天的价格，以便选择最便宜的出发日期。

**US-02 比价面板**
> 作为朝圣者，我想把2-4条不同路线并排对比价格、包含内容和评分，以便做出最优选择。

**US-03 价格提醒**
> 作为朝圣者，我想设置目标价格，当套餐降到该价格时自动通知我，以便不错过优惠。

**US-04 价格趋势**
> 作为朝圣者，我想看某条路线最近30天的价格历史曲线，判断当前价格是高还是低。

**US-05 管理员录入价格**
> 作为管理员，我想批量录入/更新每日价格快照，驱动日历和趋势图的数据展示。

---

## 4. 功能清单

### P0 核心功能（必须上线）

| ID | 功能 | 说明 |
|----|------|------|
| P0-01 | 价格日历 API | GET /api/prices/calendar，按日期范围返回价格映射 |
| P0-02 | 比价面板 API | GET /api/prices/compare，多实体价格对比 |
| P0-03 | 价格趋势 API | GET /api/prices/trend，最近N天历史价格 |
| P0-04 | 创建价格提醒 | POST /api/price-alerts，设置目标价格 |
| P0-05 | 查看我的提醒 | GET /api/price-alerts/my，用户提醒列表 |
| P0-06 | 删除价格提醒 | DELETE /api/price-alerts/:id，软删除 |
| P0-07 | 数据库模型 | PriceSnapshot + PriceAlert 两张表 |

### P1 增强功能（第二阶段）

| ID | 功能 | 说明 |
|----|------|------|
| P1-01 | 价格日历页 Web | 日历网格 UI，月份导航 |
| P1-02 | 比价面板页 Web | 并排对比表格 + 迷你趋势图 |
| P1-03 | 价格提醒触发 | Cron 任务定期检查价格是否触达目标 |
| P1-04 | 提醒推送通知 | 触达后通过 Notification 模块发推送 |

### P2 未来规划

| ID | 功能 | 说明 |
|----|------|------|
| P2-01 | 价格预测 | 基于历史数据预测未来7天价格 |
| P2-02 | 价格提醒 App 推送 | 接入极光/Firebase 推送 |
| P2-03 | 批量价格导入 | Admin 后台 Excel 批量导入 |
| P2-04 | 价格提醒邮件 | 邮件通知触达 |

---

## 5. 数据模型

### 5.1 PriceSnapshot（价格快照）

```prisma
model PriceSnapshot {
  id         String   @id @default(cuid())
  entityType String   // PACKAGE / ROUTE
  entityId   String
  date       DateTime @db.Date
  price      Int      // 分（人民币分）
  currency   String   @default("CNY")
  createdAt  DateTime @default(now())

  @@unique([entityType, entityId, date])
  @@index([entityType, entityId])
}
```

**字段说明:**
- `entityType`: `PACKAGE`(旅行套餐) | `ROUTE`(朝圣路线)
- `entityId`: 对应 TravelPackage.id 或 Route.id
- `date`: 仅日期部分（@db.Date），不含时间
- `price`: 以分为单位，例如 198000 = 1980元
- `@@unique`: 每个实体每天只能有一条价格记录

### 5.2 PriceAlert（价格提醒）

```prisma
model PriceAlert {
  id           String    @id @default(cuid())
  userId       String
  entityType   String
  entityId     String
  entityName   String
  targetPrice  Int       // 用户设置的目标价格（分）
  currentPrice Int       // 记录创建时的当前价格（分）
  isTriggered  Boolean   @default(false)
  triggeredAt  DateTime?
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())

  @@index([userId, isActive])
  @@index([entityType, entityId])
}
```

---

## 6. API 契约

### 6.1 GET /api/prices/calendar

**查询参数:**
```
entityType: string  (PACKAGE | ROUTE)
entityId:   string
startDate:  string  (ISO8601 date, e.g. 2026-04-01)
endDate:    string  (ISO8601 date, e.g. 2026-04-30)
```

**响应:**
```json
{
  "entityType": "ROUTE",
  "entityId": "clx123",
  "startDate": "2026-04-01",
  "endDate": "2026-04-30",
  "calendar": {
    "2026-04-01": { "price": 198000, "currency": "CNY" },
    "2026-04-05": { "price": 168000, "currency": "CNY" },
    "2026-04-15": null
  },
  "minPrice": 168000,
  "maxPrice": 238000,
  "currency": "CNY"
}
```

### 6.2 GET /api/prices/compare

**查询参数:**
```
entityType: string             (PACKAGE | ROUTE)
entityIds:  string             (逗号分隔, 最多4个)
```

**响应:**
```json
{
  "entityType": "ROUTE",
  "items": [
    {
      "entityId": "clx123",
      "latestPrice": 198000,
      "currency": "CNY",
      "minPrice30d": 168000,
      "maxPrice30d": 238000,
      "avgPrice30d": 193000,
      "priceCount": 25
    }
  ]
}
```

### 6.3 GET /api/prices/trend

**查询参数:**
```
entityType: string  (PACKAGE | ROUTE)
entityId:   string
days:       number  (default: 30, max: 90)
```

**响应:**
```json
{
  "entityType": "ROUTE",
  "entityId": "clx123",
  "days": 30,
  "trend": [
    { "date": "2026-03-01", "price": 198000 },
    { "date": "2026-03-02", "price": 195000 }
  ],
  "stats": {
    "minPrice": 168000,
    "maxPrice": 238000,
    "avgPrice": 193000,
    "currentPrice": 195000,
    "vsAvg": -1.03
  }
}
```

### 6.4 POST /api/price-alerts

**请求体:**
```json
{
  "entityType": "ROUTE",
  "entityId": "clx123",
  "entityName": "六祖慧能禅宗之路",
  "targetPrice": 180000,
  "currentPrice": 198000
}
```

**响应:** PriceAlert 完整对象，HTTP 201

### 6.5 GET /api/price-alerts/my

**请求头:** Authorization: Bearer {token}

**响应:**
```json
[
  {
    "id": "clx...",
    "entityType": "ROUTE",
    "entityId": "clx123",
    "entityName": "六祖慧能禅宗之路",
    "targetPrice": 180000,
    "currentPrice": 198000,
    "isTriggered": false,
    "isActive": true,
    "createdAt": "2026-03-29T00:00:00Z"
  }
]
```

### 6.6 DELETE /api/price-alerts/:id

**路径参数:** id (PriceAlert CUID)

**响应:** `{ "message": "提醒已删除" }` HTTP 200

---

## 7. 页面线框（文字描述）

### 7.1 价格日历页（详见 P22）

```
┌─────────────────────────────────────────┐
│  [← 上月]    2026年4月    [下月 →]       │
├─────────────────────────────────────────┤
│ 一    二    三    四    五    六    日    │
│  1    2    3    4    5    6    7         │
│ ¥1980 ¥— ¥1680 ¥2000 ¥1750 ¥— ¥—       │
│ [绿] [灰]  [绿] [红]  [黄] [灰] [灰]    │
│ ...                                     │
├─────────────────────────────────────────┤
│ 本月最低: ¥1,680  本月最高: ¥2,380       │
└─────────────────────────────────────────┘
```

### 7.2 比价面板页（详见 P23）

```
┌─────────────────────────────────────────────────────────┐
│ 对比选项: [路线A ×] [路线B ×] [+ 添加对比]              │
├──────────────┬──────────────┬──────────────┬────────────┤
│              │  六祖慧能路  │  五台山路    │  峨眉山路  │
├──────────────┼──────────────┼──────────────┼────────────┤
│ 当前价格     │ ¥1,980 [最低]│ ¥2,380       │ ¥2,180     │
│ 30天最低     │ ¥1,680       │ ¥2,100       │ ¥1,950     │
│ 30天均价     │ ¥1,930       │ ¥2,250       │ ¥2,050     │
│ 价格趋势     │ [迷你折线图] │ [迷你折线图] │[迷你折线图]│
│ 天数         │ 5天          │ 7天          │ 6天        │
│ 评分         │ ★4.8         │ ★4.6         │ ★4.7       │
│ 操作         │ [立即预订]   │ [立即预订]   │[立即预订]  │
└──────────────┴──────────────┴──────────────┴────────────┘
```

---

## 8. 验收标准

### 8.1 功能验收

- [ ] GET /api/prices/calendar 返回正确的日期→价格映射，包含 minPrice/maxPrice
- [ ] GET /api/prices/compare 支持逗号分隔的 entityIds，最多4个
- [ ] GET /api/prices/trend 默认 30 天，支持 days 参数（最大90）
- [ ] POST /api/price-alerts 需要 JWT 认证，创建成功返回 201
- [ ] GET /api/price-alerts/my 只返回当前用户的 isActive=true 的提醒
- [ ] DELETE /api/price-alerts/:id 软删除（isActive=false），IDOR 保护

### 8.2 数据验收

- [ ] PriceSnapshot 唯一约束 (entityType, entityId, date) 生效
- [ ] PriceAlert 索引 (userId, isActive) 创建成功
- [ ] prisma validate 无报错
- [ ] tsc --noEmit 无报错

### 8.3 安全验收

- [ ] /api/prices/* 三个查询端点为 @Public()，无需登录即可访问
- [ ] /api/price-alerts/* 三个端点需要 JWT，未登录返回 401
- [ ] deleteAlert 检查 alert.userId === currentUser.id，否则返回 403

---

## 9. 非功能要求

- 价格日历查询：P99 < 200ms（使用索引 [entityType, entityId]）
- 比价 API：最多4个实体，每个 30 天数据量可控
- 价格提醒列表：每用户最多100条活跃提醒
- 所有接口接入 Swagger 文档

---

*文档结束 | M24-PRD-价格工具 v1.0*
