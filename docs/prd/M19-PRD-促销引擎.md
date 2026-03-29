# M19-PRD-促销引擎

> 版本: v1.0 | 创建: 2026-03-29 | 状态: 待评审
> 模块编号: M19 | 所属 Sprint: C1

---

## 1. 概述与背景

### 1.1 模块定位

促销引擎是 JOINUS.COM Phase C 商业闭环的核心模块，负责管理全平台的折扣、优惠与限时活动。通过差异化促销策略驱动转化率提升，同时服务宗教文化旅行的特殊场景（节庆朝圣季、早鸟朝圣团等）。

### 1.2 竞品对标分析

| 竞品 | 核心功能 | 借鉴点 |
|------|----------|--------|
| Priceline Express Deals | 盲订闪购，降价达60%，限时倒计时 | 稀缺感营造、价格锚点、倒计时组件 |
| Agoda 闪购 | Flash Sale 每日限量，已售百分比进度条 | 实时配额展示、社会证明效应 |
| Booking.com 限时折扣 | 红色价格标签、"仅剩X个"提示、Genius折扣 | 视觉强化、会员折扣分级 |
| 美团/飞猪 | 优惠券叠加、满减、限时抢 | 国内用户心智、优惠券体系 |

### 1.3 业务目标

- 提升行程/路线页面转化率 ≥ 15%
- 促销期间 GMV 环比提升 ≥ 25%
- 闪购活动售罄率 ≥ 80%
- 早鸟价提前预订周期拉长 ≥ 7 天

---

## 2. 用户故事

### 2.1 游客/用户视角

```
US-01: 作为朝圣者，我希望在首页看到限时折扣标签，以便第一时间发现优惠行程
US-02: 作为用户，我希望在结账前能看到适用的促销活动并一键应用，降低决策摩擦
US-03: 作为早鸟用户，我希望提前预订能享受更低价格，激励我早做决定
US-04: 作为抢购用户，我希望看到闪购剩余数量和倒计时，增强紧迫感
US-05: 作为用户，我希望了解促销规则（是否可与优惠券叠加），避免结账时困惑
```

### 2.2 管理员视角

```
US-06: 作为运营，我希望在后台快速创建限时折扣活动，绑定指定行程/路线
US-07: 作为运营，我希望实时监控各促销活动的使用量和转化数据
US-08: 作为运营，我希望设置促销总配额，防止超卖
US-09: 作为财务，我希望导出促销使用明细，用于对账和分析
```

---

## 3. 功能清单

### P0（核心，必须上线）

- [ ] 三种促销类型：限时折扣 / 早鸟价 / 闪购
- [ ] 促销绑定实体：行程(TRIP) / 路线(ROUTE)，支持多 ID
- [ ] 配额管理：totalQuota=0 表示不限量，已用配额实时更新
- [ ] 时间窗口校验：startAt / endAt 双端校验
- [ ] 结账页自动匹配可用促销，展示最优折扣
- [ ] 同一订单不可叠加促销（仅可选一个促销 OR 一个优惠券）
- [ ] Admin 后台 CRUD：创建/编辑/启用/禁用/删除促销
- [ ] PromotionUsage 记录：防止同用户重复使用同一活动（依业务规则）

### P1（重要，Sprint C1 内交付）

- [ ] 促销活动页（P16）：展示全部活动，按类型分 Tab
- [ ] 行程卡片/详情页上展示促销标签（红色/橙色徽章）
- [ ] 首页"限时优惠"区块（对标 Agoda 闪购入口）
- [ ] 管理后台促销数据看板：使用量 / 折扣总额 / 转化率

### P2（增强，后续迭代）

- [ ] 促销 A/B 测试框架
- [ ] 个性化推荐促销（基于用户历史）
- [ ] 促销 Push 通知（闪购开始前 15 分钟推送）
- [ ] 早鸟倒计时：距早鸟截止日期的实时倒计时

---

## 4. 数据模型

### 4.1 Promotion 表

```prisma
model Promotion {
  id            String         @id @default(cuid())
  name          String         // 活动名称，如"五一朝圣闪购"
  description   String?        // 活动描述
  type          PromotionType  // 促销类型枚举
  discountType  DiscountType   // 折扣类型枚举
  discountValue Decimal        // 折扣值：PERCENT时为0-100，FIXED时为金额
  minAmount     Decimal?       // 最低消费门槛（可选）
  maxDiscount   Decimal?       // 最高折扣金额上限（PERCENT类型时生效）
  startAt       DateTime       // 活动开始时间
  endAt         DateTime       // 活动结束时间
  entityType    EntityType     // 绑定实体类型：TRIP / ROUTE
  entityIds     String[]       // 绑定的实体ID数组（空数组=全场通用）
  totalQuota    Int            @default(0)  // 0=不限量
  usedQuota     Int            @default(0)  // 已使用配额（原子更新）
  isActive      Boolean        @default(true)
  coverImage    String?        // 活动封面图URL
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  usages        PromotionUsage[]

  @@index([type, isActive, startAt, endAt])
}

enum PromotionType {
  TIME_LIMITED  // 限时折扣
  EARLY_BIRD    // 早鸟价
  FLASH_SALE    // 闪购
}

enum DiscountType {
  FIXED    // 固定金额折扣，如减100元
  PERCENT  // 百分比折扣，如打8折(80%)
}

enum EntityType {
  TRIP   // 绑定行程
  ROUTE  // 绑定路线
}
```

### 4.2 PromotionUsage 表

```prisma
model PromotionUsage {
  id          String    @id @default(cuid())
  promotionId String
  userId      String
  orderId     String    @unique  // 一个订单只能有一条使用记录
  discount    Decimal             // 实际折扣金额（快照）
  createdAt   DateTime  @default(now())

  promotion   Promotion @relation(fields: [promotionId], references: [id])

  @@index([promotionId])
  @@index([userId])
  @@unique([promotionId, orderId])  // 防重复
}
```

### 4.3 业务规则

```
RULE-01: 同一订单只能使用一个促销活动 OR 一个优惠券，不可叠加
RULE-02: totalQuota > 0 时，usedQuota >= totalQuota 则拒绝应用
RULE-03: 当前时间必须在 [startAt, endAt] 区间内
RULE-04: isActive = false 时，即使在时间窗口内也不生效
RULE-05: PERCENT 折扣计算：discount = min(amount * discountValue/100, maxDiscount ?? ∞)
RULE-06: FIXED 折扣计算：discount = min(discountValue, amount)（不超过订单金额）
RULE-07: entityIds 为空数组时，视为全场通用（不限行程/路线）
RULE-08: 配额更新必须使用数据库原子操作（UPDATE ... WHERE usedQuota < totalQuota）
```

---

## 5. API 契约

### 5.1 公开接口（用户端）

#### GET /api/promotions/active
获取当前有效的促销列表

**Query Params:**
```
entityType?: 'TRIP' | 'ROUTE'
entityId?:   string       // 筛选适用于特定实体的促销
type?:       PromotionType
page?:       number (default: 1)
pageSize?:   number (default: 20, max: 50)
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "clxxx",
      "name": "五一朝圣闪购",
      "type": "FLASH_SALE",
      "discountType": "PERCENT",
      "discountValue": 20,
      "maxDiscount": 500,
      "startAt": "2026-04-30T00:00:00Z",
      "endAt": "2026-05-01T23:59:59Z",
      "remainingQuota": 23,   // totalQuota - usedQuota，0表示不限量
      "soldPercent": 77,       // 已售百分比，仅 FLASH_SALE 有意义
      "coverImage": "https://...",
      "isAvailable": true      // 当前是否可用
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

#### GET /api/promotions/:id
获取单个促销详情

**Response 200:** 同上单项，附加 `description`, `entityIds`, `minAmount`

#### POST /api/promotions/apply
在结账前计算促销折扣（不消耗配额，仅预计算）

**Request Body:**
```json
{
  "promotionId": "clxxx",
  "orderId": "order_yyy",   // 可选，有则校验是否已使用
  "amount": 3980.00,
  "entityType": "TRIP",
  "entityId": "trip_zzz"
}
```

**Response 200:**
```json
{
  "applicable": true,
  "discount": 200.00,
  "finalAmount": 3780.00,
  "reason": null
}
```

**Response 200 (不适用时):**
```json
{
  "applicable": false,
  "discount": 0,
  "finalAmount": 3980.00,
  "reason": "QUOTA_EXHAUSTED" | "OUT_OF_TIME" | "MIN_AMOUNT_NOT_MET" | "ENTITY_MISMATCH"
}
```

### 5.2 管理员接口

#### POST /api/admin/promotions
创建促销活动

**Request Body:**
```json
{
  "name": "string",
  "description": "string?",
  "type": "TIME_LIMITED | EARLY_BIRD | FLASH_SALE",
  "discountType": "FIXED | PERCENT",
  "discountValue": 20,
  "minAmount": 1000,
  "maxDiscount": 500,
  "startAt": "ISO8601",
  "endAt": "ISO8601",
  "entityType": "TRIP | ROUTE",
  "entityIds": ["id1", "id2"],
  "totalQuota": 100,
  "isActive": true,
  "coverImage": "string?"
}
```

**Response 201:** 创建的 Promotion 对象

#### GET /api/admin/promotions
管理员获取全部促销（含已过期/禁用）

**Query Params:** `type?`, `isActive?`, `page`, `pageSize`

#### PATCH /api/admin/promotions/:id
更新促销（限制：已开始的活动不允许修改 discountValue 和 totalQuota 减少）

#### DELETE /api/admin/promotions/:id
软删除（设 isActive=false）

#### GET /api/admin/promotions/:id/stats
促销统计数据

**Response 200:**
```json
{
  "totalUsed": 77,
  "totalDiscount": 15400.00,
  "conversionRate": 0.23,
  "usageByDay": [{ "date": "2026-04-30", "count": 45, "discount": 9000 }]
}
```

---

## 6. 页面线框（ASCII）

### 6.1 促销管理后台列表页

```
┌─────────────────────────────────────────────────────────────┐
│ 促销活动管理                              [+ 创建活动]        │
├───────────┬────────┬──────────┬────────┬────────┬───────────┤
│ 活动名称  │ 类型   │ 折扣     │ 时间   │ 配额   │ 操作      │
├───────────┼────────┼──────────┼────────┼────────┼───────────┤
│ 五一闪购  │ 闪购   │ 8折      │ 5/1~2  │ 77/100 │ 编辑 禁用 │
│ 早鸟特惠  │ 早鸟价 │ 减500元  │ 4/1~30 │ 不限   │ 编辑 禁用 │
│ 周末折扣  │ 限时   │ 9折      │ 已过期 │ 23/50  │ 查看 删除 │
└───────────┴────────┴──────────┴────────┴────────┴───────────┘
```

### 6.2 促销创建表单

```
┌────────────────────────────────────────────┐
│ 创建促销活动                                │
│                                            │
│ 活动名称: [________________________]        │
│ 促销类型: ○ 限时折扣  ○ 早鸟价  ● 闪购     │
│                                            │
│ 折扣方式: ● 百分比折扣  ○ 固定金额          │
│ 折扣值:   [20] %   最高折扣: [500] 元       │
│ 最低消费: [1000] 元                         │
│                                            │
│ 开始时间: [2026-05-01 00:00]               │
│ 结束时间: [2026-05-02 23:59]               │
│                                            │
│ 绑定类型: ● 行程  ○ 路线                   │
│ 绑定对象: [搜索并选择行程...        ▼]      │
│           ✓ 丝绸之路朝圣7日游               │
│           ✓ 麦加朝圣精华5日                 │
│                                            │
│ 总配额:   [100]  (0=不限量)                │
│ 封面图:   [上传图片]                        │
│                                            │
│          [取消]  [保存草稿]  [立即发布]     │
└────────────────────────────────────────────┘
```

---

## 7. 技术约束

### 7.1 并发安全

```
配额更新必须使用原子操作，防止超卖:
Prisma: await prisma.$transaction(async (tx) => {
  const promo = await tx.promotion.findFirst({
    where: { id, usedQuota: { lt: totalQuota } }
  });
  if (!promo) throw new ConflictException('QUOTA_EXHAUSTED');
  await tx.promotion.update({
    where: { id },
    data: { usedQuota: { increment: 1 } }
  });
  await tx.promotionUsage.create({ data: {...} });
});
```

### 7.2 缓存策略

```
- 公开促销列表: Redis 缓存 60 秒（TTL），高并发场景
- 配额查询: 不缓存，直接读 DB（保证准确性）
- 后台管理: 不缓存
```

### 7.3 索引要求

```sql
-- 高频查询: 当前有效促销
CREATE INDEX idx_promotions_active_time ON Promotion(isActive, startAt, endAt);
-- 实体匹配
CREATE INDEX idx_promotions_entity ON Promotion USING GIN(entityIds);
-- 使用记录
CREATE INDEX idx_usage_user ON PromotionUsage(userId);
CREATE INDEX idx_usage_promotion ON PromotionUsage(promotionId);
```

### 7.4 守卫规则

```
[R-63] Admin CRUD 必须有 JwtAuthGuard + @Roles('ADMIN')
[R-64] 列表接口 @Max(50) pageSize
[R-68] 用户只能查自己的使用记录
RULE-01 ~ RULE-08 在 Service 层统一校验，不在 Controller
```

---

## 8. 验收标准

### 8.1 功能验收

- [ ] 创建三种类型促销活动均可正常保存，数据正确入库
- [ ] 促销时间外（startAt 前 / endAt 后）申请促销，返回 OUT_OF_TIME
- [ ] 配额耗尽后申请促销，返回 QUOTA_EXHAUSTED，数据库 usedQuota 不超过 totalQuota
- [ ] 高并发（50并发）配额申请压测，无超卖（usedQuota ≤ totalQuota）
- [ ] PERCENT 折扣：maxDiscount 生效，不超过上限
- [ ] FIXED 折扣：不超过订单金额本身
- [ ] entityIds 为空时适用所有行程/路线
- [ ] 同一订单不能同时使用促销 + 优惠券（结账层校验）
- [ ] 管理员禁用活动后，公开接口立即不返回该活动（缓存 TTL 内可有短暂延迟）
- [ ] 促销统计 API 数据与 PromotionUsage 表记录一致

### 8.2 性能验收

- [ ] GET /api/promotions/active 响应 P95 < 200ms（含 Redis 缓存场景）
- [ ] POST /api/promotions/apply 响应 P95 < 300ms

### 8.3 安全验收

- [ ] 非管理员调用 Admin CRUD 接口返回 403
- [ ] discountValue 不接受负数或超过 100 的百分比值

---

## 9. 关联文档

- [P13-PRD-结账页](P13-PRD-结账页.md) — 促销在结账页的展示与应用
- [P15-PRD-优惠券中心](P15-PRD-优惠券中心.md) — 优惠券系统（与促销互斥）
- [P16-PRD-促销活动页](P16-PRD-促销活动页.md) — 促销活动展示页面
- [M06-PRD-订单与支付](M06-PRD-订单与支付.md) — 订单模型与支付流程
- [docs/protocols/02-API契约规范.md](../protocols/02-API契约规范.md)
- [docs/protocols/04-数据模型规范.md](../protocols/04-数据模型规范.md)
