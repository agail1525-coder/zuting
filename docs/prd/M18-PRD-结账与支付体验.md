# M18-PRD-结账与支付体验
> 版本: v1.0 | 日期: 2026-03-29 | 状态: 已审批，可编码
> 负责人: CEO++ | 模块: 结账与支付 | Sprint: C1

---

## 一、竞品对标分析

### 1.1 Booking.com — 结账流程对标
| 功能点 | Booking.com 做法 | JOINUS.COM 目标 |
|--------|-----------------|-----------------|
| 结账布局 | 左侧订单摘要 + 右侧支付表单，双栏设计 | 同样双栏，移动端单列堆叠 |
| 价格明细 | 原价/税费/折扣逐行展示，最终价用大字 | 原价/优惠券/促销折扣/最终价 |
| 支付方式 | 信用卡/PayPal/本地支付卡片式选择 | 微信支付/支付宝/Stripe 卡片选择 |
| 信任要素 | 安全锁图标 + "免费取消"标签 + 评分 | 安全加密图标 + 退款政策说明 |
| 错误处理 | 行内实时校验，红色提示 | 同样行内校验 |
| CTA按钮 | "Complete Booking" 橙色大按钮，Sticky底部 | "确认支付" 金色大按钮，Sticky底部 |

### 1.2 Agoda — 价格展示对标
| 功能点 | Agoda 做法 | JOINUS.COM 目标 |
|--------|-----------|-----------------|
| 优惠标签 | 红色"-30%"标签显眼悬浮在价格上方 | 同样醒目的折扣标签 |
| 总价呈现 | "最终总价" 加粗放大，下方小字"含税含服务费" | 同样的最终价大字 + 费用说明 |
| 优惠券 | 结账时弹窗选择可用券，自动计算节省金额 | 内联展开选择，实时更新价格 |
| 倒计时 | "此价格还剩 10:23 有效" 倒计时 | 限时促销价倒计时（如适用） |
| 多币种 | 自动识别用户地区，展示本地货币 | 支持 CNY/USD/HKD 切换 |

### 1.3 Priceline — 一键支付对标
| 功能点 | Priceline 做法 | JOINUS.COM 目标 |
|--------|--------------|-----------------|
| Express支付 | 登录用户直接"1-Click Pay"，跳过填表 | 已绑定支付方式的用户快捷支付 |
| 支付记忆 | 记住上次支付方式，下次默认选中 | P1需求：记住用户支付偏好 |
| 进度指示器 | 顶部3步骤条: 选择→结账→确认 | 同样3步骤进度条 |
| 失败重试 | 支付失败后原地重试，不丢失表单数据 | 失败后保留订单，允许重新支付 |
| 移动端优化 | 数字键盘自动弹出，触摸友好大按钮 | 同样的移动端体验优先设计 |

---

## 二、用户故事

### 主流程（P0）
```
As a 计划出行的朝圣用户
I want to 完成圣地行程的在线支付
So that I can 确认我的朝圣计划并等待出发

触发场景:
  A. 行程详情页 → 点击"立即预订"
  B. 购物车(套餐) → 点击"去结账"
  C. 订单列表 → 点击"继续支付"（待支付订单）
```

### 用户故事地图

| 步骤 | 用户行为 | 系统响应 | 优先级 |
|------|---------|---------|--------|
| 1 | 点击"立即预订" | 创建草稿订单，跳转结账页 | P0 |
| 2 | 查看订单摘要 | 展示行程名/日期/人数/原价 | P0 |
| 3 | 查看价格明细 | 原价/促销折扣/优惠券/最终价逐行 | P0 |
| 4 | 选择/输入优惠券 | 校验券有效性，实时刷新价格 | P0 |
| 5 | 选择支付方式 | 展示微信/支付宝/Stripe | P0 |
| 6 | 确认联系信息 | 预填已有资料，可修改手机/邮件 | P0 |
| 7 | 点击"确认支付" | 调起对应支付SDK | P0 |
| 8a | 支付成功 | 跳转支付成功页，更新订单状态PAID | P0 |
| 8b | 支付失败 | 跳转支付失败页，原订单保留 | P0 |
| 8c | 支付处理中 | 展示处理中页，轮询状态 | P0 |
| 9 | 查看支付结果 | 展示订单号/行程摘要/下一步 | P0 |
| 10 | 分享成功 | 分享朋友圈/微信 | P2 |

### 异常流程
```
E1: 优惠券已过期 → 提示"该券已过期，请重新选择"，清空已选券
E2: 库存不足 → 提示"该行程剩余名额不足，请调整人数"
E3: 网络超时 → 支付结果未知时，展示"查询支付状态"按钮
E4: 重复支付 → 后端幂等校验，返回已有支付结果
E5: 优惠券被抢光 → 提示"该券已用完，系统已为您推荐其他优惠"
```

---

## 三、功能清单

### P0（Sprint C1 必须交付）

#### 3.1 结账页 `/checkout/[orderId]`
- [P0] 页面标题: "确认订单" + 3步骤进度条（选择→结账→完成）
- [P0] **订单摘要区块**: 行程封面图/名称/目的地/出发日期/人数/时长
- [P0] **价格明细区块**:
  - 原价（原始价格，中划线）
  - 促销折扣（如有，红色标注节省金额）
  - 优惠券抵扣（如已选，绿色显示）
  - 分隔线
  - **最终应付价** (大字，金色)
  - 含税费说明
- [P0] **优惠券选择区块**:
  - 文字"选择优惠券"，右侧展示可用券数量
  - 点击展开可用券列表（自动匹配当前订单可用）
  - 选中后实时更新价格明细
  - 支持输入券码（兜底）
- [P0] **联系信息区块**:
  - 手机号（预填，可修改）
  - 邮箱（预填，可修改）
  - 特殊需求备注（可选）
- [P0] **支付方式区块**:
  - 微信支付（大陆用户首选）
  - 支付宝
  - Stripe（境外用户）
  - 卡片式单选，选中高亮金色边框
- [P0] **Sticky 底部**: "确认支付 ¥XX" 金色大按钮
- [P0] **安全说明**: "🔒 128位SSL加密，安全支付" + 退款政策链接

#### 3.2 支付处理中页 `/checkout/processing/[orderId]`
- [P0] 全屏动画（转经筒/禅意loading动画）
- [P0] "正在处理您的支付..." 文案
- [P0] 每3秒轮询 `GET /api/payments/status/:orderId`
- [P0] 超时60秒后展示"查询支付状态"按钮
- [P0] 成功自动跳转支付成功页
- [P0] 失败自动跳转支付失败页

#### 3.3 支付成功页 `/checkout/success/[orderId]`
- [P0] 成功动画（打卡/印记解锁动画）
- [P0] 订单号展示（可复制）
- [P0] 行程摘要（目的地/日期/人数）
- [P0] 下一步操作区:
  - "查看行程详情" → 跳转行程页
  - "继续探索圣地" → 跳转首页
- [P0] 积分获得提示（如: "恭喜获得 500 积分！"）

#### 3.4 支付失败页 `/checkout/failed/[orderId]`
- [P0] 失败图标（非恐怖化，禅意风格）
- [P0] 失败原因说明（从 API 返回 message 展示）
- [P0] 操作区:
  - "重新支付" → 跳回结账页（保留订单）
  - "取消订单" → 调用 cancel API
  - "联系客服" → 跳转客服
- [P0] 订单号（便于联系客服时使用）

### P1（Sprint C2 前完成）
- [P1] 支付方式记忆（记住上次使用的支付方式，下次自动选中）
- [P1] 多币种展示（CNY/USD/HKD 切换，汇率实时计算）
- [P1] 信任徽章区块（支付宝认证商家/微信支付商家/SSL证书图标）
- [P1] 已登录用户保存联系信息到 Profile
- [P1] 结账页分享（"我正在预订XX圣地之旅" → 微信/朋友圈）
- [P1] 快捷重复支付（已绑定方式一键支付）

### P2（未来版本）
- [P2] 分期付款（信用卡3/6/12期）
- [P2] Apple Pay / Google Pay（Web端 Payment Request API）
- [P2] 邀请好友拼单（AA制结账）
- [P2] 企业对公支付（B端客户）
- [P2] 礼品卡/余额支付

---

## 四、页面线框

### 4.1 结账页（Web 双栏布局）

```
┌─────────────────────────────────────────────────────────────┐
│  JOINUS.COM    [步骤1: 选择] ──●[步骤2: 结账]── [步骤3: 完成]  │
├────────────────────────────┬────────────────────────────────┤
│  左栏 (60%)                │  右栏 (40%)                    │
│  ┌──────────────────────┐  │  ┌──────────────────────────┐  │
│  │ 行程封面图            │  │  │ 价格明细                 │  │
│  │ 名称/目的地/日期/人数 │  │  │ 原价          ¥2,999.00  │  │
│  └──────────────────────┘  │  │ 促销折扣      -¥300.00   │  │
│                             │  │ 优惠券        -¥100.00   │  │
│  ── 优惠券 ─────────────── │  │ ────────────────────────  │  │
│  [选择优惠券 >] 可用2张     │  │ 应付金额    ¥2,599.00    │  │
│  ┌ 展开时显示可用券列表 ─┐  │  │ 含税费，最终价格         │  │
│  │ ✓ 新用户立减100券     │  │  └──────────────────────────┘  │
│  │   满500减50券         │  │                                 │
│  └────────────────────────┘  │  ┌──────────────────────────┐  │
│                             │  │ 支付方式                 │  │
│  ── 联系信息 ─────────────  │  │ ◉ 微信支付               │  │
│  手机: [138****8888   ]     │  │ ○ 支付宝                 │  │
│  邮箱: [user@email.com]     │  │ ○ Stripe（境外）         │  │
│  备注: [特殊需求...    ]    │  └──────────────────────────┘  │
│                             │                                 │
│                             │  ┌──────────────────────────┐  │
│                             │  │ 🔒 SSL 加密安全支付       │  │
│                             │  │ 支持 7 天无理由退款       │  │
│                             │  └──────────────────────────┘  │
│                             │                                 │
│                             │  [   确认支付 ¥2,599.00   ]    │
│                             │  （Sticky，滚动时固定底部）    │
└────────────────────────────┴────────────────────────────────┘
```

### 4.2 支付成功页

```
┌──────────────────────────────────────────────┐
│                                              │
│           🎉  (打卡印记解锁动画)              │
│                                              │
│           支付成功！                          │
│           订单号: ZT-2026-0329-001   [复制]  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  🏯 终南山朝圣之旅                    │    │
│  │  📅 2026-04-15 出发  👥 2人           │    │
│  │  ⏱ 5天4夜                            │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ✨ 恭喜获得 500 积分！已进入您的账户         │
│                                              │
│  [     查看行程详情     ]                    │
│  [     继续探索圣地     ]                    │
│                                              │
└──────────────────────────────────────────────┘
```

### 4.3 结账页（Mobile 单列布局）

```
┌─────────────────────┐
│ ← 确认订单           │
├─────────────────────┤
│ [行程封面图 16:9]    │
│ 终南山朝圣之旅        │
│ 陕西省西安市 · 5天4夜 │
│ 2026-04-15 · 2人    │
├─────────────────────┤
│ 优惠券               │
│ [选择优惠券]  > 2张  │
├─────────────────────┤
│ 联系信息             │
│ 手机 138****8888    │
│ 邮箱 user@email.com │
├─────────────────────┤
│ 支付方式             │
│ ● 微信支付           │
│ ○ 支付宝            │
│ ○ Stripe            │
├─────────────────────┤
│ 价格明细             │
│ 原价          ¥2,999 │
│ 促销折扣      -¥300  │
│ 优惠券        -¥100  │
│ ─────────────────── │
│ 应付         ¥2,599  │
├─────────────────────┤
│ [  确认支付 ¥2,599 ] │ ← Sticky 底部
└─────────────────────┘
```

---

## 五、API 契约

### 5.1 创建订单（已有接口，结账页调用）

```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "tripId": "clxxx...",          // 行程ID
  "quantity": 2,                  // 人数
  "contactPhone": "13812345678",
  "contactEmail": "user@mail.com",
  "note": "素食需求"              // 可选
}

Response 201:
{
  "id": "clyyy...",
  "orderNo": "ZT-2026-0329-001",
  "tripId": "clxxx...",
  "tripName": "终南山朝圣之旅",
  "quantity": 2,
  "originalAmount": 2999.00,
  "discountAmount": 300.00,      // 促销折扣
  "couponAmount": 0,             // 优惠券抵扣（初始为0）
  "finalAmount": 2699.00,        // 当前最终价
  "status": "PENDING_PAYMENT",
  "expiredAt": "2026-03-29T16:00:00Z"  // 订单15分钟有效期
}
```

### 5.2 应用优惠券（已有接口，结账页选券后调用）

```http
POST /api/coupons/apply
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "couponCode": "NEWUSER100",
  "orderId": "clyyy..."
}

Response 200:
{
  "couponCode": "NEWUSER100",
  "couponName": "新用户立减100",
  "discountAmount": 100.00,
  "originalAmount": 2699.00,
  "finalAmount": 2599.00,        // 扣券后最终价
  "message": "优惠券应用成功"
}

Error 400:
{
  "statusCode": 400,
  "message": "该优惠券已过期",
  "error": "COUPON_EXPIRED"
}
```

### 5.3 创建支付（已有接口，点击确认支付时调用）

```http
POST /api/payments/create
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "orderId": "clyyy...",
  "paymentMethod": "wechat" | "alipay" | "stripe",
  "couponCode": "NEWUSER100",    // 可选，最终确认的券码
  "returnUrl": "https://joinus.com/checkout/result" // Stripe/支付宝回跳URL
}

Response 200:
{
  "paymentId": "PAY-xxx",
  "orderId": "clyyy...",
  "amount": 2599.00,
  "currency": "CNY",
  "method": "wechat",
  "status": "PENDING",
  // 微信支付:
  "wechatPayParams": {
    "appId": "wx...",
    "timeStamp": "...",
    "nonceStr": "...",
    "package": "prepay_id=...",
    "signType": "RSA",
    "paySign": "..."
  },
  // 支付宝:
  "alipayOrderString": "...",    // 直接传给 AlipaySDK
  // Stripe:
  "stripeClientSecret": "pi_..._secret_...",
  "expiredAt": "2026-03-29T16:15:00Z"
}
```

### 5.4 查询支付状态（处理中页轮询）

```http
GET /api/payments/status/:orderId
Authorization: Bearer {token}

Response 200:
{
  "orderId": "clyyy...",
  "paymentStatus": "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED",
  "orderStatus": "PENDING_PAYMENT" | "PAID" | "CANCELLED",
  "paidAt": "2026-03-29T15:30:00Z",  // 仅SUCCESS时
  "failReason": "余额不足"           // 仅FAILED时
}
```

### 5.5 获取可用优惠券列表（结账页选券列表）

```http
GET /api/coupons/my?orderId={orderId}&status=ACTIVE
Authorization: Bearer {token}

Response 200:
{
  "items": [
    {
      "id": "clzzz...",
      "code": "NEWUSER100",
      "name": "新用户立减100",
      "type": "FIXED",          // FIXED | PERCENTAGE
      "discountValue": 100,
      "minOrderAmount": 500,
      "isApplicable": true,     // 是否适用于当前订单
      "expiredAt": "2026-04-30T23:59:59Z"
    }
  ],
  "total": 2
}
```

---

## 六、验收标准

### AC-01: 完整支付流程
```gherkin
Given 用户已登录，行程详情页
When 用户点击"立即预订"
Then 创建订单成功，跳转到结账页 /checkout/{orderId}
And 结账页展示正确的行程摘要和价格明细
```

### AC-02: 优惠券应用
```gherkin
Given 用户在结账页，有可用优惠券"NEWUSER100"(减100元)
When 用户选择该优惠券
Then 价格明细实时更新：优惠券抵扣 -¥100
And 最终应付金额正确减少100元
And 按钮文案更新为"确认支付 ¥{新金额}"
```

### AC-03: 微信支付调起
```gherkin
Given 用户在结账页选择"微信支付"，点击"确认支付"
When 系统调用 POST /api/payments/create
Then 成功获取微信支付参数
And 调起微信支付收银台（H5/小程序/APP三端分别验证）
```

### AC-04: 支付成功跳转
```gherkin
Given 用户微信支付成功
When 支付 webhook 触发，订单状态更新为 PAID
Then 自动跳转支付成功页 /checkout/success/{orderId}
And 展示订单号、行程摘要、积分获得提示
```

### AC-05: 支付失败处理
```gherkin
Given 用户支付失败（余额不足）
When 微信返回失败回调
Then 跳转支付失败页，展示"余额不足"原因
And 展示"重新支付"按钮
And 原订单状态维持 PENDING_PAYMENT（不变为 CANCELLED）
```

### AC-06: 幂等处理
```gherkin
Given 同一订单已支付成功
When 重复发送支付 webhook
Then 系统不重复更新订单状态
And 不重复发放积分
And 返回已有支付结果
```

### AC-07: 订单超时
```gherkin
Given 用户进入结账页后15分钟未支付
When 超过 expiredAt 时间
Then 显示"订单已过期"提示
And "确认支付"按钮禁用
And 提示"点击此处重新下单"
```

### AC-08: 移动端适配
```gherkin
Given 用户在 Mobile APP 或微信小程序
When 进入结账页
Then 单列布局正确展示所有区块
And 手机号键盘自动为数字键盘
And Sticky 底部按钮不遮挡内容
And 微信小程序直接调起 wx.requestPayment
```

---

## 七、技术约束

### 7.1 支付安全
- 所有支付金额计算在后端进行，前端只展示，不可信任前端传入的金额
- 优惠券核销在创建支付时后端原子操作，防止并发重复核销
- 支付 webhook 需要验签（微信/支付宝官方签名验证）
- 支付金额最小单位：分（Integer），前端展示时除以100
- 订单创建后15分钟有效期，过期自动 CANCELLED

### 7.2 状态一致性
- 支付中间状态（PROCESSING）需要 Redis 锁防止并发
- 轮询间隔建议：3秒一次，最多轮询20次（1分钟）
- 轮询超时后显示"查询状态"按钮，手动查询
- 网络异常时，保留本地 orderId，下次打开 APP 可继续支付

### 7.3 三端支付差异
| 端 | 微信支付 | 支付宝 | Stripe |
|----|---------|--------|--------|
| Web | H5支付（跳转） | H5支付（跳转） | Stripe Elements |
| Mobile | wx.requestPayment | AlipaySDK | Stripe RN SDK |
| 小程序 | wx.requestPayment | 跳转H5 | 不支持 |

### 7.4 性能要求
- 结账页首屏加载 < 2秒（LCP）
- 价格更新（选优惠券）< 500ms 响应
- 支付创建 API < 3秒超时
- 支付状态轮询 < 1秒响应

### 7.5 错误码约定
| 错误码 | 含义 | 前端处理 |
|--------|------|---------|
| COUPON_EXPIRED | 优惠券已过期 | 清除选中券，提示更换 |
| COUPON_USED | 优惠券已使用 | 清除选中券，提示更换 |
| COUPON_NOT_APPLICABLE | 不适用当前订单 | 灰显该券 |
| ORDER_EXPIRED | 订单已超时 | 提示重新下单 |
| PAYMENT_AMOUNT_MISMATCH | 支付金额与订单不符 | 刷新页面重新获取 |
| INSUFFICIENT_STOCK | 库存不足 | 提示调整人数 |
| PAYMENT_GATEWAY_ERROR | 支付网关异常 | 建议更换支付方式 |

---

## 八、多端开发任务拆解

### Web (Next.js 15)
```
app/checkout/
├── [orderId]/
│   └── page.tsx          # 结账主页
├── processing/
│   └── [orderId]/
│       └── page.tsx      # 支付处理中
├── success/
│   └── [orderId]/
│       └── page.tsx      # 支付成功
└── failed/
    └── [orderId]/
        └── page.tsx      # 支付失败

components/checkout/
├── OrderSummary.tsx       # 订单摘要区块
├── PriceBreakdown.tsx     # 价格明细区块
├── CouponSelector.tsx     # 优惠券选择区块
├── PaymentMethodPicker.tsx # 支付方式选择
├── ContactForm.tsx        # 联系信息表单
└── CheckoutFooter.tsx     # Sticky底部按钮
```

### Mobile (Expo)
```
app/checkout/
├── index.tsx             # 结账主屏
├── processing.tsx        # 支付处理中
├── success.tsx           # 支付成功
└── failed.tsx            # 支付失败
```

### 小程序 (Taro)
```
src/pages/checkout/
├── index.tsx             # 结账主页
├── processing/index.tsx  # 支付处理中
├── success/index.tsx     # 支付成功
└── failed/index.tsx      # 支付失败
```

---

## 九、设计规范（遵循 docs/protocols/01-UI设计规范.md）

- 主色调: 金色 #D4A855（CTA按钮/价格高亮/选中状态）
- 背景: 深色 #0f172a
- 成功色: 翠绿 #10b981
- 失败色: 暖红 #ef4444（非恐怖化，平静感）
- 优惠/折扣: 红色 #f87171
- 字体: 价格大字 text-3xl font-bold，说明文字 text-sm text-gray-400
- 卡片: bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl
- 按钮: bg-gradient-to-r from-amber-500 to-yellow-600 文字 text-black font-bold

---

*文档版本: v1.0 | 撰写: Claude Sonnet 4.6 | 最后更新: 2026-03-29*
*下一步: 依照本PRD启动 Sprint C1 结账页面开发*
