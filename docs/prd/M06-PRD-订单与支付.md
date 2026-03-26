# M06 订单与支付 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: v1已实现(模拟支付) / v2规划中(真实网关)

---

## 1. 需求背景与目标

### 1.1 背景

订单与支付模块是行程管理的下游交易闭环。当行程被管理员确认(CONFIRMED)后，用户需创建订单并完成支付。v1 版本使用模拟支付(`SIM_${Date.now()}`)验证全流程，v2 将接入微信支付 V3、支付宝、Stripe 三大网关，覆盖国内外用户。金额统一使用"分"(cents)存储，避免浮点精度问题。

### 1.2 目标

| 目标 | 指标 | 说明 |
|------|------|------|
| 支付成功率 | >95% | 创建订单后成功支付的比例 |
| 支付平均耗时 | <30s | 从点击支付到回调确认 |
| 退款处理时效 | <48h | 管理员审批退款的平均时长 |
| 订单数据一致性 | 100% | 订单状态与行程状态严格同步 |

### 1.3 范围

| 范围 | v1 (已实现) | v2 (规划中) |
|------|-------------|-------------|
| 订单 CRUD | 创建/列表/详情 | — |
| 支付触发 | 模拟支付(SIM_xxx) | 微信支付V3 / 支付宝 / Stripe |
| 取消订单 | PENDING 状态可取消 | 超时自动取消(30min) |
| 退款 | PAID → REFUNDING | 网关退款API + Webhook确认 |
| 支付流水 | — | PaymentTransaction 模型 |
| 优惠券 | — | Coupon + CouponUsage 模型 |
| 多币种 | — | Stripe 国际支付(USD/EUR/JPY) |

---

## 2. 用户故事

### US-06-01: 朝圣者支付行程

**作为** 朝圣者，**我希望** 在行程确认后能便捷地完成支付，**以便** 锁定我的朝圣名额。

**验收标准:**
- 行程状态为 CONFIRMED 时，可创建订单
- 同一行程不允许存在多个 PENDING 订单
- 支付成功后订单状态变为 PAID，行程自动转为 PAID
- 显示订单号(OD+时间戳+随机)用于查询

### US-06-02: 朝圣者取消未支付订单

**作为** 朝圣者，**我希望** 能取消尚未支付的订单，**以便** 重新考虑或修改行程。

**验收标准:**
- 仅 PENDING 状态订单可取消
- 取消后记录 cancelledAt 时间戳
- 取消订单不影响行程状态(行程仍为 CONFIRMED)

### US-06-03: 朝圣者申请退款

**作为** 朝圣者，**我希望** 已支付后能申请退款，**以便** 应对行程变化。

**验收标准:**
- 仅 PAID 状态订单可申请退款
- 退款需填写原因
- 订单进入 REFUNDING 状态，行程同步进入 REFUNDING
- 管理员审批后完成退款

### US-06-04: 管理员处理退款

**作为** 管理员，**我希望** 能审核退款申请并执行退款操作，**以便** 保障平台服务质量。

**验收标准:**
- Admin 后台显示所有 REFUNDING 订单
- 可批准(→REFUNDED)或拒绝退款
- 批准后 v1 直接标记已退款; v2 调用网关退款 API
- 操作记录可追溯

### US-06-05: 朝圣者查看订单列表 (v2增强)

**作为** 朝圣者，**我希望** 查看所有历史订单和支付记录，**以便** 管理我的消费。

**验收标准:**
- 按时间倒序显示所有订单
- 可按状态筛选(待支付/已支付/已取消/已退款)
- 显示关联行程标题、金额、支付方式、时间

---

## 3. 业务流程

### 3.1 订单支付流程图

```
用户                        API服务                    支付网关              管理员
 │                            │                          │                    │
 │  1. 创建订单               │                          │                    │
 │  POST /orders              │                          │                    │
 │  {tripId,userId,amount}    │                          │                    │
 │ ──────────────────────────►│                          │                    │
 │                            │  校验行程 CONFIRMED       │                    │
 │                            │  校验无重复 PENDING 订单   │                    │
 │                            │  生成订单号 OD_xxx        │                    │
 │  ◄─────────────────────────│                          │                    │
 │  返回 Order(PENDING)       │                          │                    │
 │                            │                          │                    │
 │  2. 触发支付               │                          │                    │
 │  POST /orders/:id/pay      │                          │                    │
 │  {paymentMethod}           │                          │                    │
 │ ──────────────────────────►│                          │                    │
 │                            │  v1: 模拟支付             │                    │
 │                            │  v2: 调用网关 ──────────►│                    │
 │                            │                   ◄──────│ 返回预支付参数       │
 │  ◄─────────────────────────│                          │                    │
 │  v1: 直接返回 PAID         │                          │                    │
 │  v2: 返回支付参数           │                          │                    │
 │                            │                          │                    │
 │  (v2) 用户完成支付          │                          │                    │
 │ ─────────────────────────────────────────────────────►│                    │
 │                            │  (v2) Webhook回调         │                    │
 │                            │ ◄─────────────────────────│                    │
 │                            │  验签 + 更新订单 PAID      │                    │
 │                            │  行程状态 → PAID           │                    │
 │                            │                          │                    │
 │  3. 申请退款               │                          │                    │
 │  POST /orders/:id/refund   │                          │                    │
 │ ──────────────────────────►│                          │                    │
 │                            │  订单 → REFUNDING         │                    │
 │                            │  行程 → REFUNDING         │                    │
 │                            │                          │       4. 审批退款   │
 │                            │                          │  ◄────────────────│
 │                            │  v2: 调用退款API ────────►│                    │
 │                            │                   ◄──────│ 退款成功            │
 │                            │  订单 → REFUNDED          │                    │
 │                            │  行程 → REFUNDED          │                    │
```

### 3.2 订单状态流转

```
            创建订单
               │
               ▼
         ┌──────────┐     取消(用户)     ┌──────────┐
         │ PENDING  │ ─────────────────► │CANCELLED │
         │  待支付   │                    │  已取消   │
         └────┬─────┘                    └──────────┘
              │
        支付成功(网关回调)
              │
              ▼
         ┌──────────┐     申请退款(用户)   ┌──────────┐
         │   PAID   │ ─────────────────► │REFUNDING │
         │  已支付   │                    │  退款中   │
         └──────────┘                    └────┬─────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                              退款批准(Admin)       退款拒绝(Admin)
                                    │                   │
                                    ▼                   ▼
                              ┌──────────┐        (恢复PAID)
                              │ REFUNDED │
                              │  已退款   │
                              └──────────┘
```

### 3.3 业务规则表

| 规则ID | 规则 | 说明 |
|--------|------|------|
| BR-06-01 | 创建订单时行程必须为 CONFIRMED | 其他状态返回 400 |
| BR-06-02 | 同一行程不允许多个 PENDING 订单 | 有未支付订单则拒绝创建 |
| BR-06-03 | 金额以"分"存储 | totalAmount, paidAmount 均为整数(分) |
| BR-06-04 | 订单号格式: OD + 时间戳 + 4位随机 | 确保唯一性，便于客服查询 |
| BR-06-05 | 支付成功联动行程状态 | Order PAID → Trip CONFIRMED→PAID (通过 TripStateMachine) |
| BR-06-06 | 退款联动行程状态 | Order REFUNDING → Trip 尝试转 REFUNDING (失败不阻塞) |
| BR-06-07 | v2: 未支付订单30分钟自动取消 | 定时任务扫描 PENDING 且 createdAt < now-30min |
| BR-06-08 | v2: Webhook 必须验签 | 微信支付 V3 RSA 验签 / 支付宝公钥验签 / Stripe Webhook Secret |
| BR-06-09 | v2: 退款金额 <= 已支付金额 | 部分退款场景 |
| BR-06-10 | v2: 支付幂等性 | 相同 paymentId 不重复处理 |

---

## 4. 功能清单

| 功能ID | 功能名称 | 优先级 | 版本 | 端 | 说明 |
|--------|---------|--------|------|-----|------|
| F06-01 | 创建订单 | P0 | v1 | Web/App/Mini | 从已确认行程创建 |
| F06-02 | 订单列表 | P0 | v1 | Web/App/Mini/Admin | 分页+筛选 |
| F06-03 | 订单详情 | P0 | v1 | Web/App/Mini/Admin | 含关联行程+支付信息 |
| F06-04 | 触发支付 | P0 | v1 | Web/App/Mini | v1模拟 / v2真实 |
| F06-05 | 取消订单 | P0 | v1 | Web/App/Mini | 仅 PENDING |
| F06-06 | 申请退款 | P0 | v1 | Web/App/Mini | 仅 PAID |
| F06-07 | 微信支付V3 | P0 | v2 | Web(H5)/App(App)/Mini(JSAPI) | 三种调用方式 |
| F06-08 | 支付宝 | P1 | v2 | Web/App | 手机网站支付+App支付 |
| F06-09 | Stripe | P1 | v2 | Web/App | PaymentIntents，国际用户 |
| F06-10 | Webhook回调 | P0 | v2 | API | 接收网关异步通知 |
| F06-11 | 自动取消 | P1 | v2 | API | 30min未支付自动取消 |
| F06-12 | 支付流水 | P1 | v2 | Admin | PaymentTransaction 记录 |
| F06-13 | 优惠券系统 | P2 | v2 | Web/App/Mini/Admin | 创建/分发/核销/统计 |
| F06-14 | 退款审批流 | P1 | v2 | Admin | Admin审批 → 网关退款 |

---

## 5. 数据模型

### 5.1 实体关系

```
Trip 1──────* Order
User 1──────* Order
Order 1─────* PaymentTransaction (v2)
Coupon 1────* CouponUsage (v2)
User 1──────* CouponUsage (v2)
Order 1─────1 CouponUsage (v2)
```

### 5.2 字段表

**Order (订单) — 已实现**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| orderNo | String | 是 | auto | 订单号(OD+时间戳+随机), unique |
| tripId | String | 是 | — | 关联行程 |
| userId | String | 是 | — | 关联用户 |
| totalAmount | Int | 是 | — | 订单总额(分) |
| paidAmount | Int | 否 | — | 实付金额(分) |
| paymentMethod | String | 否 | — | 支付方式(wechat/alipay/stripe) |
| paymentId | String | 否 | — | 外部支付ID |
| status | OrderStatus | 是 | PENDING | 订单状态 |
| createdAt | DateTime | 是 | now() | 创建时间 |
| paidAt | DateTime | 否 | — | 支付时间 |
| cancelledAt | DateTime | 否 | — | 取消时间 |
| refundedAt | DateTime | 否 | — | 退款时间 |

**PaymentTransaction (支付流水) — v2新增**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| orderId | String | 是 | — | 关联订单 |
| gateway | String | 是 | — | 支付网关(WECHAT/ALIPAY/STRIPE) |
| transactionId | String | 是 | — | 网关交易号 |
| type | String | 是 | — | 类型(PAY/REFUND) |
| amount | Int | 是 | — | 金额(分) |
| currency | String | 是 | CNY | 币种(CNY/USD/EUR/JPY) |
| status | String | 是 | — | 网关返回状态 |
| callbackPayload | JSON | 否 | — | 完整回调报文(用于对账) |
| createdAt | DateTime | 是 | now() | 创建时间 |

**Coupon (优惠券) — v2新增**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| code | String | 是 | — | 优惠码, unique |
| type | String | 是 | — | 类型(FIXED/PERCENT) |
| value | Int | 是 | — | 面额(分)或折扣百分比 |
| minAmount | Int | 否 | 0 | 最低消费(分) |
| maxDiscount | Int | 否 | — | 最大优惠金额(分) |
| totalCount | Int | 是 | — | 总发放量 |
| usedCount | Int | 是 | 0 | 已使用量 |
| startAt | DateTime | 是 | — | 生效时间 |
| endAt | DateTime | 是 | — | 过期时间 |
| isActive | Boolean | 是 | true | 是否启用 |

---

## 6. API 接口

### v1 已实现

| # | 方法 | 路径 | 认证 | 说明 | 请求体/参数 | 响应 |
|---|------|------|------|------|------------|------|
| 1 | POST | /api/orders | JWT | 创建订单 | `{tripId, userId, totalAmount, paymentMethod?}` | Order + Trip |
| 2 | GET | /api/orders | JWT | 订单列表 | Query: `userId?, tripId?, status?, page?, limit?` | `{data, total, page, limit}` |
| 3 | GET | /api/orders/:id | JWT | 订单详情 | Path: id | Order + Trip + User |
| 4 | POST | /api/orders/:id/pay | JWT | 触发支付 | `{paymentMethod, paidAmount?, paymentId?}` | Order(PAID) |
| 5 | POST | /api/orders/:id/cancel | JWT | 取消订单 | 无 | Order(CANCELLED) |
| 6 | POST | /api/orders/:id/refund | JWT | 申请退款 | `{reason?}` | Order(REFUNDING) |

### v2 新增

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 7 | POST | /api/orders/:id/prepay | JWT | 预支付(获取网关支付参数) |
| 8 | POST | /api/webhooks/wechat-pay | 公开(验签) | 微信支付回调 |
| 9 | POST | /api/webhooks/alipay | 公开(验签) | 支付宝回调 |
| 10 | POST | /api/webhooks/stripe | 公开(验签) | Stripe Webhook |
| 11 | POST | /api/orders/:id/refund/approve | JWT+Admin | 批准退款 |
| 12 | POST | /api/orders/:id/refund/reject | JWT+Admin | 拒绝退款 |
| 13 | POST | /api/coupons/validate | JWT | 校验优惠券 |
| 14 | GET | /api/coupons/mine | JWT | 我的优惠券列表 |

---

## 7. 多端页面规格

### 7.1 Web 端

#### 页面: /trips/[id] 内的支付区域 (v1)

| 项目 | 说明 |
|------|------|
| 布局 | 行程详情页右侧状态面板内，CONFIRMED 状态显示"立即支付"按钮 |
| 流程 | 点击支付 → 调用 POST /orders 创建 → 调用 POST /orders/:id/pay → 成功提示 → 页面刷新 |
| 状态 | 按钮 Loading; 支付成功 Toast; 失败错误提示 |

#### 页面: /trips/[id]/checkout (v2)

| 项目 | 说明 |
|------|------|
| 布局 | 左侧: 行程摘要(标题+圣地列表+日期+人数); 右侧: 支付面板 |
| 支付面板 | 金额明细(基础费用+服务费-优惠券); 优惠券输入框+验证; 支付方式选择(微信/支付宝/Stripe); 支付按钮 |
| 优惠券 | 输入码 → 调用 validate → 显示抵扣金额; 或从"我的优惠券"选择 |
| 交互 | 选择微信: 弹出二维码(H5); 选择支付宝: 跳转收银台; 选择Stripe: 内嵌卡片表单 |

#### 页面: /payment/result (v2)

| 项目 | 说明 |
|------|------|
| 布局 | 居中卡片: 支付结果图标(成功勾/失败叉) + 金额 + 订单号 + 操作按钮 |
| 成功 | "查看行程"按钮 → /trips/[id]; "返回首页"按钮 |
| 失败 | "重新支付"按钮; "联系客服"按钮 |

### 7.2 App 端 (Expo React Native)

#### 页面: Checkout 屏幕

| 项目 | 说明 |
|------|------|
| 布局 | ScrollView: 行程摘要卡片 → 金额明细 → 支付方式选择 → 底部"确认支付"按钮 |
| 支付方式 | v1: 模拟支付按钮; v2: 微信(调用wx SDK) / 支付宝(调用ali SDK) / Stripe(内嵌) |
| 动画 | 支付中 Lottie 加载动画; 成功后撒花动画 |

#### 页面: Payment Result 屏幕

| 项目 | 说明 |
|------|------|
| 布局 | 全屏结果页: 大图标 + 金额 + 订单号 + "查看行程"/"返回首页" |

### 7.3 小程序端 (Taro)

#### 页面: /payment

| 项目 | 说明 |
|------|------|
| 布局 | 行程摘要 → 金额 → 支付按钮 |
| 支付 | v1: 模拟; v2: 调用 `wx.requestPayment(JSAPI参数)` |
| 流程 | 创建订单 → 获取预支付参数 → wx.requestPayment → 回调确认 → 跳转结果页 |

### 7.4 Admin 后台

#### 页面: OrdersPage — 订单管理

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 筛选栏(状态/用户/订单号/日期范围); 中部: Ant Design Table; 底部: 分页 |
| 表格列 | 订单号、用户昵称、关联行程、金额(元)、支付方式、状态(Tag)、创建时间、支付时间、操作 |
| 操作 | 查看详情(Modal); REFUNDING 状态: "批准退款"/"拒绝退款" 按钮 |
| 统计栏 | v2: 顶部卡片显示今日订单数、今日金额、待处理退款数 |
| 导出 | v2: 导出订单 Excel |

---

## 8. 埋点需求

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `order_create` | 创建订单 | orderId, tripId, amount, paymentMethod | 订单创建量 |
| `order_pay_start` | 点击支付按钮 | orderId, paymentMethod | 支付发起 |
| `order_pay_success` | 支付成功 | orderId, amount, paymentMethod, duration | 支付成功率+耗时 |
| `order_pay_fail` | 支付失败 | orderId, paymentMethod, errorCode | 失败原因分析 |
| `order_cancel` | 取消订单 | orderId, reason | 取消分析 |
| `order_refund_request` | 申请退款 | orderId, amount, reason | 退款分析 |
| `order_refund_approve` | 批准退款 | orderId, adminId | 管理员操作 |
| `order_refund_reject` | 拒绝退款 | orderId, adminId, reason | 管理员操作 |
| `checkout_page_view` | 查看结算页 | tripId, amount | 结算页访问 |
| `coupon_apply` | 使用优惠券 | orderId, couponCode, discountAmount | v2 优惠券分析 |
| `payment_method_select` | 选择支付方式 | method, platform | 支付方式偏好 |
