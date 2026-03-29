# M28-PRD-数据分析 (Analytics Dashboard)

> Sprint D3 | 优先级: P1 | 状态: Draft
> 最后更新: 2026-03-29

---

## 1. 概述

### 1.1 产品目标
为平台运营团队提供数据驱动的决策支持工具，通过可视化仪表盘展示核心业务指标、用户行为趋势和转化漏斗，帮助运营人员快速洞察平台健康状况并发现增长机会。

### 1.2 竞品对标
| 竞品 | 对标功能 | JOINUS.COM 适配 |
|------|----------|----------------|
| Expedia Partner Central | 酒店/产品表现仪表盘、收入趋势、预订转化率 | 行程/路线表现、订单收入趋势、转化漏斗 |
| Booking.com Analytics | 页面浏览→预订转化、客源地分布、竞品对比 | 浏览→收藏→下单→支付漏斗、内容热度排行 |
| Google Analytics | DAU/MAU、留存率、事件追踪、实时监控 | 用户活跃度指标、内容互动追踪 |
| TripAdvisor Insights | UGC内容分析、评分趋势、热门目的地 | 评价分析、热门圣地/路线排行 |

### 1.3 目标用户
- **平台管理员 (ADMIN)**: 全局数据概览，运营决策
- **未来扩展**: 商家入驻后，商家端数据面板

---

## 2. 用户故事

| ID | 角色 | 故事 | 验收标准 |
|----|------|------|----------|
| US-01 | 管理员 | 我想看到平台整体数据概览，包括用户数、行程数、订单数、评价数等 | Overview面板展示7+核心指标卡片 |
| US-02 | 管理员 | 我想看到过去30天的业务趋势图，判断增长是否健康 | 折线图展示每日订单/行程/用户注册趋势 |
| US-03 | 管理员 | 我想看到转化漏斗，找到流失环节 | 漏斗图: 总用户→有行程→有订单→已支付 |
| US-04 | 管理员 | 我想看到热门内容排行，指导运营方向 | Top 10 最多浏览/分享/评价的实体排行 |

---

## 3. 功能设计

### 3.1 数据概览 (Overview)

**指标卡片 (KPI Cards)**:
| 指标 | 数据源 | 说明 |
|------|--------|------|
| 总用户数 | User.count | 平台注册用户总数 |
| 总行程数 | Trip.count | 已创建行程总数 |
| 总订单数 | Order.count | 已创建订单总数 |
| 总收入(元) | Order.sum(paidAmount) where status=PAID | 已支付订单总金额 |
| 总评价数 | Review.count | UGC评价总数 |
| 总攻略数 | Guide.count where status=PUBLISHED | 已发布攻略数 |
| 总商家数 | Merchant.count where status=APPROVED | 已认证商家数 |
| 总分享数 | Share.count | 社交分享总次数 |

### 3.2 趋势分析 (Trends)

- **时间范围**: 最近30天，按天聚合
- **指标线**:
  - 每日新增订单数 (Order.createdAt groupBy date)
  - 每日新增行程数 (Trip.createdAt groupBy date)
  - 每日新增用户数 (User.createdAt groupBy date)
- **图表类型**: 多线折线图 (Recharts LineChart)

### 3.3 转化漏斗 (Funnel)

漏斗层级:
```
Level 1: 总注册用户数 (User.count)
Level 2: 有行程的用户数 (User with at least 1 Trip)
Level 3: 有订单的用户数 (User with at least 1 Order)
Level 4: 有已支付订单的用户数 (User with Order.status = PAID)
```

每层展示: 人数 + 转化率(相对上一层) + 绝对转化率(相对第一层)

### 3.4 热门内容 (Top Content)

Top 10排行，3个维度:
- **最多浏览**: UserViewHistory groupBy entityType+entityId，按 count desc
- **最多分享**: Share groupBy entityType+entityId，按 count desc
- **最多评价**: Review groupBy targetType+targetId，按 count desc

每项展示: 排名、实体类型、实体ID、计数

---

## 4. API 契约

### 4.1 GET /api/analytics/overview

**权限**: ADMIN only

**Response 200**:
```json
{
  "totalUsers": 1234,
  "totalTrips": 567,
  "totalOrders": 234,
  "totalRevenue": 12345600,
  "totalReviews": 89,
  "totalGuides": 45,
  "totalMerchants": 12,
  "totalShares": 678
}
```

### 4.2 GET /api/analytics/trends

**权限**: ADMIN only

**Query Params**:
| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| days | number | 30 | 最近N天 (max 90) |

**Response 200**:
```json
{
  "days": 30,
  "data": [
    {
      "date": "2026-03-01",
      "orders": 12,
      "trips": 8,
      "users": 15
    }
  ]
}
```

### 4.3 GET /api/analytics/funnel

**权限**: ADMIN only

**Response 200**:
```json
{
  "levels": [
    { "name": "注册用户", "nameEn": "Registered Users", "count": 1234, "rate": 1.0 },
    { "name": "创建行程", "nameEn": "With Trips", "count": 567, "rate": 0.459 },
    { "name": "创建订单", "nameEn": "With Orders", "count": 234, "rate": 0.190 },
    { "name": "完成支付", "nameEn": "Paid", "count": 123, "rate": 0.100 }
  ]
}
```

### 4.4 GET /api/analytics/top-content

**权限**: ADMIN only

**Query Params**:
| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| dimension | string | "views" | "views" / "shares" / "reviews" |
| limit | number | 10 | 返回条数 (max 50) |

**Response 200**:
```json
{
  "dimension": "views",
  "items": [
    {
      "rank": 1,
      "entityType": "HOLY_SITE",
      "entityId": "clx...",
      "count": 1256
    }
  ]
}
```

---

## 5. 技术方案

### 5.1 数据聚合策略
- **实时聚合**: 基于现有 Prisma 表的 count/groupBy 查询
- **无需额外表**: 利用 User, Trip, Order, Review, Guide, Share, Merchant, UserViewHistory 现有模型
- **性能**: Admin 面板低频访问，实时查询可接受；未来可加 Redis 缓存

### 5.2 技术栈
- **后端**: NestJS analytics module + PrismaService
- **前端 (Admin)**: Recharts (已引入) — LineChart, BarChart, FunnelChart
- **权限**: @Roles('ADMIN') + RolesGuard

### 5.3 模块结构
```
services/api/src/modules/analytics/
├── analytics.module.ts
├── analytics.controller.ts
└── analytics.service.ts
```

---

## 6. 验收标准

- [ ] GET /api/analytics/overview 返回8项核心指标，数据准确
- [ ] GET /api/analytics/trends 返回最近30天每日数据，无遗漏天数
- [ ] GET /api/analytics/funnel 返回4层漏斗，转化率计算正确
- [ ] GET /api/analytics/top-content 支持3个维度切换，返回Top N
- [ ] 所有端点仅 ADMIN 角色可访问，非管理员返回 403
- [ ] Swagger 文档完整，包含请求/响应示例
- [ ] TypeScript 编译零错误
- [ ] Admin 前端仪表盘页面展示所有4个面板 (后续迭代)

---

## 7. 里程碑

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | API 模块 (4个端点) | 当前 |
| Phase 2 | Admin 仪表盘 UI (Recharts 图表) | 待排期 |
| Phase 3 | Redis 缓存 + 定时聚合 | 待排期 |
| Phase 4 | 导出报表 (Excel/PDF) | 待排期 |
