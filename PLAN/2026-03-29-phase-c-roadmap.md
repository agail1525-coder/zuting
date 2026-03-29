# Phase C 商业闭环路线图
> 2026-03-29 | 对标 Expedia + Agoda + Priceline + AmEx Travel + Skyscanner + Kayak

---

## 战略目标

**JOINUS.COM 商业闭环 — 从内容平台升级为交易平台**

Phase B 已完成体验升级（评价/收藏/推荐/搜索/攻略），用户留存与内容生态初步建立。
Phase C 目标：打通交易闭环，实现第一笔真实收入，构建可持续商业模型。

```
内容浏览 → 行程规划 → [支付成交] → 会员积累 → [复购增长]
         Phase A+B已完成   ↑                        ↑
                        Phase C-Sprint1        Phase C-Sprint2/3
```

### 核心KPI（Phase C完成时）
| 指标 | 目标 |
|------|------|
| 支付转化率 | ≥ 3%（行程规划→付款） |
| 优惠券核销率 | ≥ 40% |
| 会员注册率 | ≥ 25%（活跃用户） |
| 套餐购买占比 | ≥ 15%（总订单） |
| 价格工具使用率 | ≥ 20%（活跃用户） |

---

## 现有基础设施（Phase A+B 已交付）

### 后端模块（可直接复用）
```
services/api/src/modules/
├── order/          # 订单 CRUD + pay/cancel/refund (6端点)
├── payment/        # create + webhook(WeChat/Alipay/Stripe) + status + query + gateways (7端点)
├── coupon/         # Admin CRUD + verify + apply + my-coupons (7端点)
├── booking/        # 路线预订 create/list/admin/detail/cancel (5端点)
├── trip/           # 行程12状态机（已完整）
├── auth/           # JWT认证 + 用户体系
├── notification/   # 消息通知
└── user/           # 用户档案
```

### 前端能力（已具备）
- Web: Next.js 15 + TailwindCSS v4, 21页面
- Mobile: Expo 52 + Expo Router, 5 tabs
- 小程序: Taro 4.x, 14页面
- 共享组件库: 优惠券卡片/评价组件/地图组件已实现

### 缺口分析
```
已有但未接前端:
  - 支付 webhook 已实现，但支付结果页未建
  - 优惠券 CRUD 已实现，但优惠券中心 UI 未建
  - Order API 完整，但统一结账页面未建

需新建:
  - 会员体系 (MembershipModule)
  - 积分系统 (PointsModule)
  - 套餐打包 (PackageModule)
  - 价格工具 (PriceToolModule): 日历/比价/提醒/趋势
  - 促销活动 (PromotionModule): 限时折扣/早鸟/闪购
```

---

## Sprint 规划

### Sprint C1: 支付体验 + 促销引擎（2026-03-29 起，预计 2 周）

**目标**: 打通从行程→下单→付款→结果的完整交易链路

#### C1-F1: 统一结账页
- [ ] Web: `/checkout/[orderId]` — 订单摘要/价格明细/优惠券/支付方式/提交
- [ ] Mobile: CheckoutScreen — 全屏结账流程
- [ ] 小程序: /pages/checkout/index — 微信原生支付接入
- [ ] 支付方式: 微信支付/支付宝/Stripe(境外)
- [ ] 价格明细展示: 原价/折扣/优惠券/最终价
- PRD: `M18-PRD-结账与支付体验.md` ← **已创建**

#### C1-F2: 优惠券中心
- [ ] 优惠券列表页 (可领取 + 我的券包)
- [ ] 领券动画 + 到期提醒
- [ ] 结账时自动推荐可用券
- [ ] 核销历史记录
- PRD: `F09-PRD-优惠券中心.md`

#### C1-F3: 促销活动系统
- [ ] 后端: PromotionModule (限时折扣/早鸟价/闪购/满减)
- [ ] 首页促销 Banner (倒计时)
- [ ] 行程列表价格标签 (限时/早鸟/折扣)
- [ ] Admin 促销管理页
- PRD: `M19-PRD-促销活动系统.md`

#### C1-F4: 支付结果页
- [ ] 成功页: 订单编号/行程摘要/分享/下一步指引
- [ ] 失败页: 原因说明/重试/客服入口
- [ ] 处理中页: 轮询状态/支付宝跳转回调
- PRD: `P04-PRD-支付结果页.md`

#### C1-F5: Admin 促销管理
- [ ] 优惠券批量创建/发放/停用
- [ ] 促销活动创建 (时间段/折扣率/限量)
- [ ] 核销数据统计

**C1 交付物验收标准**:
1. 用户可从行程详情页点击"立即预订" → 进入结账 → 完成支付
2. 支付成功后自动更新订单状态 (PAID)
3. 优惠券正确计算最终价格
4. 支付回调幂等处理（重复 webhook 不重复扣款）

---

### Sprint C2: 会员体系 + 套餐打包（预计 2026-04-12 起，3 周）

**目标**: 建立用户留存激励机制，提升客单价

#### C2-F1: 会员等级体系
```
等级设计 (对标 AmEx Travel 精英感):
  Lv1 朝圣新手   (0-999积分)   — 基础权益
  Lv2 行脚僧     (1000-4999)   — 5%折扣 + 专属徽章
  Lv3 修行者     (5000-19999)  — 10%折扣 + 优先客服 + 行程顾问
  Lv4 觉悟者     (20000-99999) — 15%折扣 + 专属路线 + VIP服务
  Lv5 觉悟大师   (100000+)     — 20%折扣 + 定制行程 + 专属陪同
```
- [ ] 后端: MembershipModule (等级/权益/升级规则)
- [ ] 会员中心页面 (等级卡/权益/进度条)
- [ ] 等级升级动画
- [ ] PRD: `M20-PRD-会员体系.md`

#### C2-F2: 积分系统
```
积分获取:
  - 完成行程: +500
  - 发布评价(含图): +100
  - 日志打卡: +50
  - 邀请好友注册: +200
  - 购买套餐: 消费金额 × 10

积分消耗:
  - 抵扣现金 (100积分=1元)
  - 兑换优惠券
  - 解锁专属内容(高清地图/独家攻略)
  - 会员等级升级加速
```
- [ ] 后端: PointsModule (获取/消耗/流水/兑换)
- [ ] 积分流水页 (明细/统计)
- [ ] 兑换商城 (基础版)
- PRD: `F10-PRD-积分系统.md`

#### C2-F3: 套餐打包
```
套餐类型 (对标 Expedia 打包策略):
  基础套餐: 行程 + 导游
  经典套餐: 行程 + 住宿 + 导游
  尊享套餐: 行程 + 住宿 + 交通 + 导游 + 餐食
  亲子套餐: 适合家庭的圣地+互动体验
  闭关套餐: 深度修行 + 住寺 + 禅修课程
```
- [ ] 后端: PackageModule (套餐CRUD + 库存 + 定价)
- [ ] 套餐详情页 (含清单/价格对比/预订)
- [ ] 套餐 vs 单项 价格对比展示
- PRD: `M21-PRD-套餐打包.md`

#### C2-F4: 会员专属价格
- [ ] 价格展示: 原价 / 会员价 / 积分抵扣后价
- [ ] 非会员引导注册入口
- [ ] 会员专属行程标签

**C2 交付物验收标准**:
1. 新用户注册自动成为 Lv1，完成首次购买获得积分
2. 套餐价格低于单项累计，对比展示清晰
3. 会员价格在结账时自动应用

---

### Sprint C3: 价格工具（预计 2026-05-03 起，2 周）

**目标**: 帮助用户做出最优购买决策，提升转化

#### C3-F1: 价格日历
```
对标: Skyscanner 日期灵活选择
功能:
  - 按月/按周浏览行程价格热力图
  - 最低价日期高亮标注
  - 节假日/传统节日价格预警
  - 一键跳转最低价日期
```
- [ ] 后端: PriceCalendarService (按日期查价格快照)
- [ ] Web: 日历组件 (含价格展示)
- [ ] Mobile: 日历选择器升级版
- PRD: `F11-PRD-价格日历.md`

#### C3-F2: 比价面板
```
对标: Kayak 多维比较
功能:
  - 同类行程横向比较 (最多4项)
  - 比较维度: 价格/时长/评分/包含项/出发地
  - 差异高亮
  - 一键加入对比
```
- [ ] 比价页面 `/compare`
- [ ] 行程卡片"加入对比"按钮
- PRD: `F12-PRD-比价面板.md`

#### C3-F3: 价格提醒
```
对标: Kayak 价格追踪
功能:
  - 设定目标价格
  - 价格下降时 Push/邮件/短信通知
  - 价格历史趋势图 (30天)
  - 提醒管理 (开/关/修改目标价)
```
- [ ] 后端: PriceAlertModule (订阅/触发/推送)
- [ ] 通知接入 notification 模块
- PRD: `F13-PRD-价格提醒.md`

#### C3-F4: 价格趋势图
- [ ] 行程详情页价格趋势展示 (对标 Kayak)
- [ ] 过去30/90/180天价格曲线
- [ ] 预测下周价格趋势 (AI辅助)
- PRD: `F14-PRD-价格趋势图.md`

**C3 交付物验收标准**:
1. 用户在价格日历上能找到最低价日期并直接预订
2. 价格提醒触发后72小时内用户收到通知
3. 比价面板最多支持4个行程同时比较

---

## 数据模型概览

### 新增表（Phase C 新建）

```prisma
// 会员等级
model MemberLevel {
  id          String   @id @default(cuid())
  userId      String   @unique
  level       Int      @default(1)          // 1-5
  totalPoints Int      @default(0)
  usedPoints  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 积分流水
model PointsTransaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Int                           // 正数=获取, 负数=消耗
  type        PointsType
  description String
  relatedId   String?                       // 关联订单/评价ID
  createdAt   DateTime @default(now())
}

enum PointsType {
  TRIP_COMPLETE REVIEW JOURNAL INVITE PURCHASE REDEEM ADMIN_ADJUST
}

// 促销活动
model Promotion {
  id          String    @id @default(cuid())
  name        String
  type        PromoType
  discountRate Float?                        // 折扣率 0.8=8折
  discountAmt  Float?                        // 固定减免金额
  minAmount    Float?                        // 最低消费门槛
  startAt     DateTime
  endAt       DateTime
  stock       Int?                           // null=无限量
  usedCount   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
}

enum PromoType {
  FLASH_SALE EARLY_BIRD SEASONAL MEMBER_EXCLUSIVE BUNDLE
}

// 套餐
model Package {
  id          String   @id @default(cuid())
  name        String
  nameEn      String?
  type        PackageType
  basePrice   Float
  description String
  items       Json                           // [{type, name, value}]
  stock       Int      @default(0)
  soldCount   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

enum PackageType {
  BASIC CLASSIC PREMIUM FAMILY RETREAT
}

// 价格快照（用于价格日历+趋势）
model PriceSnapshot {
  id          String   @id @default(cuid())
  refType     String                         // "trip" | "package"
  refId       String
  price       Float
  currency    String   @default("CNY")
  recordedAt  DateTime @default(now())

  @@index([refType, refId, recordedAt])
}

// 价格提醒订阅
model PriceAlert {
  id          String    @id @default(cuid())
  userId      String
  refType     String
  refId       String
  targetPrice Float
  isActive    Boolean   @default(true)
  triggeredAt DateTime?
  createdAt   DateTime  @default(now())

  @@index([refType, refId, isActive])
}
```

### 现有表扩展（Phase C 增字段）

```
User:    + memberLevel(Int) + totalPoints(Int) + usedPoints(Int)
Order:   + promotionId(String?) + pointsUsed(Int) + finalAmount(Float)
Coupon:  + promotionId(String?)  // 关联促销活动
```

---

## 依赖图

```
Sprint C1 (基础交易)
  ├─ Order API ──────────── 已完成 ✓
  ├─ Payment API ────────── 已完成 ✓
  ├─ Coupon API ─────────── 已完成 ✓
  ├─ 结账页UI ────────────── 新建 (依赖 Order + Payment + Coupon)
  ├─ 支付结果页 ─────────── 新建 (依赖 Payment webhook)
  └─ PromotionModule ────── 新建 (独立)

Sprint C2 (留存激励)           依赖 C1 ↓
  ├─ MembershipModule ────── 新建 (依赖 User + Order)
  ├─ PointsModule ────────── 新建 (依赖 MembershipModule)
  ├─ PackageModule ────────── 新建 (依赖 Order + Payment)
  └─ 会员专属价格 ─────────── 新建 (依赖 MembershipModule + PackageModule)

Sprint C3 (决策工具)           依赖 C1+C2 ↓
  ├─ PriceCalendar ──────── 新建 (依赖 PriceSnapshot + Trip)
  ├─ PriceAlert ─────────── 新建 (依赖 Notification + User)
  ├─ ComparePanel ─────────── 新建 (独立)
  └─ PriceTrend ─────────── 新建 (依赖 PriceSnapshot)
```

---

## 时间线

```
2026-03-29 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├─ Week 1-2 (03-29 ~ 04-11) ── Sprint C1: 支付体验+促销引擎
│   ├─ Day 1-3:  M18 PRD确认 + 结账页 Web 开发
│   ├─ Day 4-5:  结账页 Mobile + 小程序
│   ├─ Day 6-8:  优惠券中心 + 结账时选券
│   ├─ Day 9-10: 支付结果页 (成功/失败/处理中)
│   └─ Day 11-14: PromotionModule + Admin促销管理 + C1验收
│
├─ Week 3-5 (04-12 ~ 05-02) ── Sprint C2: 会员+套餐
│   ├─ Day 1-5:  MembershipModule + 会员中心页
│   ├─ Day 6-8:  PointsModule + 积分流水
│   ├─ Day 9-14: PackageModule + 套餐详情页
│   └─ Day 15-21: 会员专属价格 + 套餐购买流程 + C2验收
│
└─ Week 6-7 (05-03 ~ 05-16) ── Sprint C3: 价格工具
    ├─ Day 1-4:  PriceSnapshot数据管道 + 价格日历
    ├─ Day 5-7:  比价面板
    ├─ Day 8-10: 价格提醒 (Alert + Push)
    └─ Day 11-14: 价格趋势图 + C3验收

2026-05-16 ── Phase C 完成里程碑 ✓
```

---

## 风险与应对

| 风险 | 概率 | 影响 | 应对方案 |
|------|------|------|----------|
| 微信支付审核周期长 | 高 | 高 | 同步推进支付宝; 先上Stripe境外版本 |
| 积分体系被刷 | 中 | 高 | 每日上限+行为验证+风控规则 |
| 套餐库存超卖 | 中 | 高 | Redis原子锁 + 数据库乐观锁双保险 |
| 价格日历数据量大 | 低 | 中 | 只存变更快照，CDN缓存7天 |
| 会员等级设计不吸引人 | 中 | 中 | A/B测试，先上线再迭代权益 |

---

## PRD 任务队列

| PRD文件 | Sprint | 状态 |
|---------|--------|------|
| M18-PRD-结账与支付体验.md | C1 | **已创建** |
| M19-PRD-促销活动系统.md | C1 | 待创建 |
| P04-PRD-支付结果页.md | C1 | 待创建 |
| F09-PRD-优惠券中心.md | C1 | 待创建 |
| M20-PRD-会员体系.md | C2 | 待创建 |
| F10-PRD-积分系统.md | C2 | 待创建 |
| M21-PRD-套餐打包.md | C2 | 待创建 |
| F11-PRD-价格日历.md | C3 | 待创建 |
| F12-PRD-比价面板.md | C3 | 待创建 |
| F13-PRD-价格提醒.md | C3 | 待创建 |
| F14-PRD-价格趋势图.md | C3 | 待创建 |

---

*文档版本: v1.0 | 作者: Claude Sonnet 4.6 | 最后更新: 2026-03-29*
