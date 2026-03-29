# M23-PRD-积分商城

> 版本: v1.0 | 创建日期: 2026-03-29 | 状态: 待评审
> 模块类型: 主模块PRD | 所属平台: Web + Mobile + 小程序

---

## 一、竞品对标分析

### 1.1 竞品功能矩阵

| 竞品 | 积分获取方式 | 商品类型 | 兑换体验 | 特色功能 |
|------|-------------|---------|---------|---------|
| 京东积分商城 | 购物/签到/评价 | 实物+虚拟+优惠券 | 即时发放 | 积分拍卖/限量秒杀 |
| 美团积分商城 | 消费/点评/签到 | 优惠券/会员权益 | 即时到账 | 分类筛选/每日限量 |
| Booking Genius | 住宿/评价 | 折扣/免费升级 | 自动应用 | 会员等级联动 |
| 航司里程商城 | 飞行/合作消费 | 机票/升舱/实物 | 周期兑换 | 里程计算器/过期提醒 |
| 星巴克星星 | 消费积累 | 免费饮品/食品 | 门店核销 | 积星进度可视化 |

### 1.2 竞品优势学习点

- **京东**: 商品卡片设计(大图+积分价突出)、筛选分类、已售/库存展示
- **美团**: 每日限量制造稀缺感、分类Tab快速切换
- **Booking Genius**: 兑换自动应用到订单，无需手动核销
- **航司商城**: 积分估值展示(XX积分≈¥XX)、过期预警
- **星巴克**: 积星进度条，激励用户达到下一档位

### 1.3 差异化定位

JOINUS.COM积分商城 = 朝圣旅行场景专属权益 + 宗教文化虚拟勋章 + 积分消费闭环(接收分销返佣+会员签到)

---

## 二、用户故事

### 2.1 核心用户故事

```
作为一名积累了2000积分的朝圣者，
我希望在积分商城兑换一张行程折扣券，
用于我下次的西藏朝圣行程，节省旅行费用。

验收标准:
  - 用户能看到当前积分余额(大数字，醒目)
  - 能浏览"行程折扣"分类下的所有可兑换商品
  - 商品卡片清晰展示: 名称/积分价/适用范围/库存
  - 点击"立即兑换"出现确认弹窗，显示扣除积分
  - 确认后积分即时扣除，优惠券即时到账到"我的优惠券"
  - 兑换成功后展示兑换成功页面+跳转引导
```

```
作为一名热爱收集的用户，
我希望用100积分兑换"朝圣者"专属头像框勋章，
彰显我的朝圣身份。

验收标准:
  - "虚拟勋章"分类下展示所有可兑换勋章
  - 已兑换的勋章显示"已拥有"状态
  - 兑换成功后勋章出现在个人主页/评价头像框选择中
  - 稀有勋章显示稀缺度标签(限量100份)
```

```
作为平台运营者，
我希望灵活管理商城商品，
包括上下架、库存调整、限时活动配置。

验收标准:
  - 管理后台可CRUD积分商品
  - 支持设置上架/下架时间
  - 库存调整立即生效
  - 可查看每个商品的兑换记录和统计
```

### 2.2 边缘场景用户故事

```
场景: 积分不足时点击兑换
期望: 按钮置灰或点击后提示"积分不足，还差XXX积分"并引导去获取积分

场景: 限量商品被抢完
期望: 前端实时显示库存，售罄后按钮变为"已售罄"，不可点击
      超卖防护: 后端使用Redis原子操作扣库存，确保不超卖

场景: 兑换后订单中使用优惠券
期望: 兑换的优惠券自动出现在结账页"优惠券"选择列表
      已使用的优惠券在兑换记录中显示"已使用"

场景: 商品下架时用户已在浏览
期望: 点击兑换时后端返回400"商品已下架"，前端刷新状态
```

---

## 三、功能清单

### P0 (必须上线)

| 编号 | 功能 | 说明 |
|------|------|------|
| F-001 | 商品列表展示 | 支持分类Tab筛选+分页 |
| F-002 | 商品详情页 | 详情描述+使用说明+适用范围 |
| F-003 | 积分兑换 | 扣积分+创建兑换记录+发放权益 |
| F-004 | 兑换确认弹窗 | 展示商品信息+扣除积分+确认/取消 |
| F-005 | 我的积分展示 | 在商城页头部展示当前积分余额 |
| F-006 | 我的兑换记录 | 兑换历史列表+状态查看 |
| F-007 | 库存管理 | 超卖防护+售罄状态展示 |
| F-008 | 优惠券类商品发放 | 兑换后将优惠券写入用户优惠券表 |
| F-009 | 虚拟勋章发放 | 兑换后勋章写入用户资产表 |
| F-010 | Admin商品CRUD | 管理后台商品管理 |

### P1 (首月内上线)

| 编号 | 功能 | 说明 |
|------|------|------|
| F-011 | 积分明细跳转 | 从商城头部"积分明细"链接跳转 |
| F-012 | 积分不足引导 | 提示积分缺口+引导获取积分入口 |
| F-013 | 行程折扣兑换 | 兑换后在行程支付页自动可选折扣 |
| F-014 | 会员权益兑换 | 临时升级会员等级(30天) |
| F-015 | 商品上下架时间 | 定时上架/下架配置 |
| F-016 | 每日限量 | 每人每天限购数量配置 |

### P2 (后续迭代)

| 编号 | 功能 | 说明 |
|------|------|------|
| F-017 | 积分估值展示 | XX积分≈¥XX 帮助用户理解价值 |
| F-018 | 积分到期提醒 | 积分X天后过期的推送提醒 |
| F-019 | 限时秒杀 | 特殊商品限时低价兑换 |
| F-020 | 兑换排行榜 | 本月最受欢迎商品展示 |
| F-021 | 积分拍卖 | 高价值商品竞价兑换 |

---

## 四、商品类型详述

### 4.1 商品类型枚举

```
COUPON       — 优惠券兑换
DISCOUNT     — 行程折扣
EXPERIENCE   — 专属体验
PERK         — 会员权益
BADGE        — 虚拟勋章/头像框
```

### 4.2 各类型商品配置示例

#### 优惠券 (COUPON)

| 商品名 | 积分价 | 面值 | 使用门槛 |
|--------|--------|------|---------|
| 满100减20券 | 500 | ¥20 | 订单满¥100 |
| 满200减50券 | 1000 | ¥50 | 订单满¥200 |
| 满500减150券 | 2000 | ¥150 | 订单满¥500 |
| 免邮券 | 200 | 免邮 | 无门槛 |

metadata: `{ "couponId": "COUPON_TYPE_ID", "discountAmount": 2000, "minOrderAmount": 10000 }`

#### 行程折扣 (DISCOUNT)

| 商品名 | 积分价 | 折扣 | 适用范围 |
|--------|--------|------|---------|
| 指定行程9折券 | 3000 | 9折 | 全部行程 |
| 指定行程8折券 | 5000 | 8折 | 全部行程 |
| 朝圣专属7折 | 8000 | 7折 | 圣地朝圣类行程 |

metadata: `{ "discountPercent": 90, "applicableCategories": ["PILGRIMAGE"] }`

#### 专属体验 (EXPERIENCE)

| 商品名 | 积分价 | 内容 | 库存 |
|--------|--------|------|------|
| VIP朝圣专属导游(1次) | 10000 | 专属导游服务 | 月限50份 |
| 限定朝圣纪念品 | 20000 | 限定实物寄送 | 季度限100份 |
| 祖庭住持1对1对话 | 50000 | 线上视频会面 | 月限5份 |

metadata: `{ "fulfillmentType": "MANUAL", "contactRequired": true, "estimatedDelivery": "7天内安排" }`

#### 会员权益 (PERK)

| 商品名 | 积分价 | 内容 | 时效 |
|--------|--------|------|------|
| 黄金会员体验卡(30天) | 8000 | 临时升级黄金会员 | 30天 |
| 铂金会员体验卡(7天) | 5000 | 临时升级铂金会员 | 7天 |

metadata: `{ "memberLevel": "GOLD", "durationDays": 30 }`

#### 虚拟勋章 (BADGE)

| 商品名 | 积分价 | 类型 | 稀缺度 |
|--------|--------|------|-------|
| 朝圣者勋章 | 100 | 头像框 | 无限 |
| 特殊头像框(佛光) | 500 | 头像框 | 限量1000 |
| 守护天使徽章 | 500 | 资料卡徽章 | 限量1000 |
| 大师级朝圣者 | 2000 | 专属称号 | 限量200 |
| 创始朝圣者 | 5000 | 永久专属身份 | 限量100 |

metadata: `{ "badgeType": "AVATAR_FRAME", "imageUrl": "https://...", "rarity": "RARE" }`

---

## 五、页面线框 (ASCII)

### 5.1 积分商城主页 (见 P21-PRD-积分商城页.md)

```
┌──────────────────────────────────────────┐
│  积分商城                                │
├──────────────────────────────────────────┤
│  我的积分                                │
│  ┌──────────────────────────────────┐    │
│  │  12,850积分         [积分明细→]  │    │
│  │  ████████████░░░░░ 距黄金8000积分│    │
│  └──────────────────────────────────┘    │
│                                          │
│  [全部] [优惠券] [行程折扣] [专属体验]   │
│  [虚拟勋章] [会员权益]                   │
│                                          │
│  ┌──────────┐ ┌──────────┐              │
│  │ [封面图] │ │ [封面图] │              │
│  │ 满200减50│ │ 指定9折券│              │
│  │          │ │          │              │
│  │ 1000积分 │ │ 3000积分 │              │
│  │ ~~¥50~~  │ │ ~~¥30~~  │              │
│  │ 剩余:238 │ │ 剩余:50  │              │
│  │[立即兑换]│ │[立即兑换]│              │
│  └──────────┘ └──────────┘              │
│                                          │
│  ┌──────────┐ ┌──────────┐              │
│  │ [封面图] │ │ [封面图] │              │
│  │朝圣者勋章│ │VIP专属导游              │
│  │          │ │ 【限量50】│              │
│  │  100积分 │ │ 10000积分│              │
│  │ 已售:823 │ │ 剩余:12  │              │
│  │[立即兑换]│ │[立即兑换]│              │
│  └──────────┘ └──────────┘              │
│                                          │
│  我的兑换记录    [查看全部→]             │
│  ┌──────────────────────────────────┐   │
│  │ 满100减20券  500积分  已发放      │   │
│  │ 2026-03-20                        │   │
│  │ 朝圣者勋章   100积分  已到账      │   │
│  │ 2026-03-15                        │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 5.2 兑换确认弹窗

```
┌────────────────────────────────────┐
│           确认兑换                 │
├────────────────────────────────────┤
│  [商品封面图]                      │
│  满200减50券                       │
│  使用门槛: 订单满¥200              │
│  有效期: 兑换后30天                │
│                                    │
│  扣除积分                          │
│  ████████████░░░░░                 │
│  当前: 12,850积分                  │
│  扣除: - 1,000积分                 │
│  剩余: = 11,850积分                │
│                                    │
│  [取消]            [确认兑换]      │
└────────────────────────────────────┘
```

---

## 六、数据模型

### 6.1 Prisma Schema

```prisma
// 积分商城商品表
model PointsProduct {
  id            String               @id @default(cuid())
  name          String
  description   String               @db.Text
  coverImage    String
  category      PointsProductCategory
  pointsCost    Int                  // 积分价格
  originalPrice Int?                 // 原价(分)，用于展示划线价
  stock         Int                  @default(-1)  // -1=无限库存
  soldCount     Int                  @default(0)
  metadata      Json                 // 扩展字段(couponId/discountPercent/badgeImage等)
  isActive      Boolean              @default(true)
  startAt       DateTime?            // 可选: 定时上架
  endAt         DateTime?            // 可选: 定时下架
  dailyLimit    Int?                 // 每人每天限购数量
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  exchanges     PointsExchange[]

  @@index([category, isActive])
  @@index([isActive, startAt, endAt])
}

// 积分兑换记录表
model PointsExchange {
  id           String               @id @default(cuid())
  userId       String
  user         User                 @relation(fields: [userId], references: [id])
  productId    String
  product      PointsProduct        @relation(fields: [productId], references: [id])
  pointsSpent  Int                  // 实际扣除积分
  status       PointsExchangeStatus @default(PENDING)
  metadata     Json?                // 兑换结果详情(优惠券ID/勋章资产ID等)
  fulfilledAt  DateTime?
  cancelledAt  DateTime?
  createdAt    DateTime             @default(now())

  @@index([userId])
  @@index([productId])
  @@index([userId, createdAt])
}

enum PointsProductCategory {
  COUPON      // 优惠券
  DISCOUNT    // 行程折扣
  EXPERIENCE  // 专属体验
  PERK        // 会员权益
  BADGE       // 虚拟勋章
}

enum PointsExchangeStatus {
  PENDING    // 兑换中(处理中)
  FULFILLED  // 已发放
  CANCELLED  // 已取消
}
```

### 6.2 积分交易记录(现有模块扩展)

```prisma
// 在现有 PointsTransaction 枚举中增加:
enum PointsTransactionType {
  // ... 已有类型 ...
  MALL_EXCHANGE     // 积分商城兑换(支出)
  REFERRAL_REWARD   // 分销返佣(收入)
}
```

### 6.3 Redis键设计(库存管理)

```
product:stock:{productId}  → 剩余库存数量 (Integer)
product:daily:{productId}:{userId}:{date}  → 今日已兑换数量 (Integer, TTL=86400s)
```

---

## 七、API契约

### 7.1 端点列表

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/points-mall/products | 商品列表(category/isActive筛选) | 登录用户 |
| GET | /api/points-mall/products/:id | 商品详情 | 登录用户 |
| POST | /api/points-mall/exchange | 兑换商品 | 登录用户 |
| GET | /api/points-mall/my-exchanges | 我的兑换记录 | 登录用户 |
| POST | /api/admin/points-mall/products | 创建商品 | Admin |
| PATCH | /api/admin/points-mall/products/:id | 更新商品 | Admin |
| DELETE | /api/admin/points-mall/products/:id | 删除/下架商品 | Admin |
| GET | /api/admin/points-mall/exchanges | 所有兑换记录 | Admin |

### 7.2 请求/响应详情

#### GET /api/points-mall/products

Query: `?category=COUPON&page=1&pageSize=20&isActive=true`

Response:
```json
{
  "items": [
    {
      "id": "cuid",
      "name": "满200减50券",
      "description": "订单满200元可使用，有效期30天",
      "coverImage": "https://...",
      "category": "COUPON",
      "pointsCost": 1000,
      "originalPrice": 5000,
      "stock": 238,
      "soldCount": 762,
      "isActive": true,
      "isSoldOut": false,
      "canExchange": true,
      "endAt": null
    }
  ],
  "total": 18,
  "page": 1,
  "pageSize": 20
}
```

注: `canExchange` 由后端根据用户积分余额+库存+每日限量综合计算

#### POST /api/points-mall/exchange

Request:
```json
{
  "productId": "cuid"
}
```

Response (成功):
```json
{
  "success": true,
  "exchangeId": "cuid",
  "pointsSpent": 1000,
  "remainingPoints": 11850,
  "fulfillment": {
    "type": "COUPON",
    "couponId": "cuid",
    "couponCode": "MALL-ABC123",
    "description": "已发放到您的优惠券中心"
  }
}
```

Response (积分不足):
```json
{
  "statusCode": 400,
  "message": "积分不足，还差150积分",
  "details": { "required": 1000, "current": 850, "gap": 150 }
}
```

Response (售罄):
```json
{
  "statusCode": 400,
  "message": "该商品已售罄"
}
```

Response (已下架):
```json
{
  "statusCode": 400,
  "message": "该商品已下架"
}
```

#### GET /api/points-mall/my-exchanges

Query: `?status=FULFILLED&page=1&pageSize=20`

Response:
```json
{
  "items": [
    {
      "id": "cuid",
      "product": {
        "id": "cuid",
        "name": "满100减20券",
        "coverImage": "https://...",
        "category": "COUPON"
      },
      "pointsSpent": 500,
      "status": "FULFILLED",
      "metadata": {
        "couponId": "cuid",
        "couponCode": "MALL-XYZ456"
      },
      "fulfilledAt": "2026-03-20T10:00:00Z",
      "createdAt": "2026-03-20T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 20
}
```

---

## 八、业务规则详述

### 8.1 兑换流程 (事务保障)

```
POST /exchange 执行步骤:
1. 验证商品存在且isActive=true且在startAt~endAt范围内
2. 检查Redis库存: DECR product:stock:{productId}，若结果<0则回滚+返回售罄
3. 检查每日限量: GET product:daily:{productId}:{userId}:{today}，超限返回错误
4. 验证用户积分余额 >= pointsCost
5. 开始数据库事务:
   a. 扣除用户积分: PointsService.deductPoints(userId, pointsCost, 'MALL_EXCHANGE')
   b. 更新 PointsProduct.soldCount += 1
   c. 创建 PointsExchange 记录(status=PENDING)
6. 执行权益发放(根据category):
   COUPON     → CouponService.createUserCoupon(userId, couponTemplateId)
   DISCOUNT   → DiscountService.createUserDiscount(userId, metadata)
   EXPERIENCE → ExperienceService.createRequest(userId, productId) [需人工处理]
   PERK       → MemberService.applyTempUpgrade(userId, level, days)
   BADGE      → BadgeService.grantBadge(userId, badgeId)
7. 更新 PointsExchange.status=FULFILLED，写入metadata(权益ID)
8. 更新每日限量计数: INCR product:daily:{productId}:{userId}:{today}
9. 返回成功响应
```

### 8.2 超卖防护

```
使用 Redis DECR 原子操作:
- 初始化: SET product:stock:{id} {stock}
- 扣减: result = DECR product:stock:{id}
- 若 result < 0: INCR product:stock:{id}(回滚), 返回售罄错误
- 库存为-1(无限)时: 不操作Redis库存，直接跳过
- 定期将Redis库存同步回DB(定时任务，每5分钟)
```

### 8.3 商品状态计算

```
isActive      = true
startAt       = null OR <= now()
endAt         = null OR >= now()
stock         = -1 OR stock > 0(Redis库存)
userCanBuy    = 用户积分 >= pointsCost AND 每日限量未达

综合状态:
  - 商品可兑换: isActive && 时间范围内 && 有库存
  - 用户可兑换: 商品可兑换 && userCanBuy
```

---

## 九、技术约束

### 9.1 后端约束

- NestJS + Prisma，积分扣减必须在数据库事务中执行
- Redis用于库存原子操作，防超卖
- 权益发放失败时需回滚积分扣减(补偿机制)
- `metadata` 字段使用 `Json` 类型，TypeScript中定义具体interface
- 每个category的fulfillment handler单独Service，通过工厂模式分发

### 9.2 前端约束

- 商品列表懒加载分页
- 积分余额从全局状态获取，兑换后即时更新
- 库存展示实时刷新(间隔30s轮询或兑换时刷新)
- 兑换确认弹窗防重复提交(提交中禁用按钮)
- 图片使用懒加载+占位图

### 9.3 安全约束

- 兑换接口做限流: 每用户每分钟最多兑换5次
- 幂等处理: 同一请求重复提交只处理一次(使用requestId或客户端幂等键)
- 权益发放日志完整记录，管理后台可查

---

## 十、验收标准

### 10.1 功能验收

| 测试用例 | 预期结果 |
|---------|---------|
| 访问积分商城 | 头部显示我的积分余额，商品列表正常加载 |
| 切换分类Tab | 商品列表按分类正确筛选 |
| 积分充足时兑换 | 弹窗显示正确，确认后积分扣除，权益到账 |
| 积分不足时兑换 | 提示"积分不足，还差XX积分" |
| 售罄商品点击兑换 | 按钮显示"已售罄"，不可点击 |
| 下架商品访问 | 返回商品已下架提示 |
| 优惠券兑换成功 | 优惠券出现在用户优惠券列表 |
| 勋章兑换成功 | 勋章出现在个人主页头像框选择 |
| 同时多个用户抢购限量商品 | 不超卖，先到先得 |
| 查看我的兑换记录 | 历史记录按时间倒序排列，状态正确 |
| Admin创建商品 | 商品正确创建，立即在商城可见(若isActive) |
| Admin调整库存 | 库存即时更新，Redis同步 |

### 10.2 性能验收

- 商品列表响应时间 < 300ms
- 兑换接口响应时间 < 500ms
- 并发100个用户同时兑换同一限量商品(库存10): 精确10个成功，90个返回售罄

### 10.3 数据一致性验收

- 兑换成功后用户积分余额准确减少
- PointsTransaction中有对应MALL_EXCHANGE记录
- PointsExchange状态最终为FULFILLED或CANCELLED，无永久PENDING

---

## 十一、依赖模块

| 依赖 | 类型 | 说明 |
|------|------|------|
| M08-用户认证 | 强依赖 | 获取当前用户ID和积分余额 |
| M20-会员体系 | 强依赖 | 积分账户读写，临时会员升级 |
| M06-订单支付 | 弱依赖 | 优惠券/折扣券在结账时使用 |
| M22-二级分销 | 弱依赖 | 分销返佣积分在此消费 |
| P21-积分商城页 | UI依赖 | 本模块主要展示页面 |
| Redis | 基础设施 | 库存原子操作 |

---

## 十二、里程碑

| 阶段 | 时间 | 交付物 |
|------|------|------|
| Phase 1 | W1 | Prisma Schema + Redis库存管理 + 基础CRUD |
| Phase 2 | W2 | 兑换核心流程 + 权益发放Handler |
| Phase 3 | W3 | 前端积分商城页(P21) |
| Phase 4 | W4 | Admin管理页面 + 兑换统计 |
| Phase 5 | W5 | 性能测试 + 超卖压测 + 上线 |
