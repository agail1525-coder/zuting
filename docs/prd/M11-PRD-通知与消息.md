# M11 通知与消息 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: v2 规划中 (当前 0% 实施)

---

## 1. 需求背景与目标

### 1.1 背景

当前祖庭旅行平台缺乏任何通知机制。用户在行程状态变更、支付成功/失败、退款进度等关键节点无法获得及时反馈。管理员也无法主动触达用户推送系统公告或营销信息。

通知系统是提升用户体验和运营效率的基础设施，需支持多渠道 (站内信、邮件、短信、Push、微信模板消息) 投递，并根据用户偏好和事件优先级选择合适的渠道。

### 1.2 目标

| 目标 | 衡量指标 |
|------|----------|
| 关键事件必达 | 支付/退款通知送达率 > 99.5% |
| 用户体验 | 状态变更后 5 秒内收到站内通知 |
| 多渠道覆盖 | 支持 5 种通知渠道 |
| 用户偏好 | 用户可自定义各类通知的接收渠道 |
| 运营触达 | 管理员可发送系统公告到全平台 |
| 消息可追溯 | 每条通知有完整投递状态记录 |

### 1.3 技术选型

| 组件 | 技术方案 | 说明 |
|------|----------|------|
| 站内通知 | NestJS + WebSocket (Socket.io) | 实时推送 + REST 回退 |
| 邮件 | Nodemailer (开发) / 阿里云邮件推送 (生产) | SMTP / API 双模式 |
| 短信 (国内) | 阿里云短信服务 | AccessKeyId + AccessKeySecret |
| 短信 (国际) | Twilio | Account SID + Auth Token |
| App Push | Expo Push Notifications | Expo 内置，无需额外 SDK |
| 微信模板消息 | 微信订阅消息 API | 小程序一次性订阅 |
| 消息队列 | Bull (Redis) | 异步处理，重试机制 |
| 模板引擎 | Handlebars / EJS | 邮件 HTML 模板 |

---

## 2. 用户故事

### 2.1 通知接收

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-N01 | 作为朝圣者，我想在行程状态变更时收到站内通知，及时了解进度 | P0 |
| US-N02 | 作为朝圣者，我想在支付成功/失败后收到邮件确认 | P0 |
| US-N03 | 作为朝圣者，我想在 App 中收到 Push 推送通知 | P0 |
| US-N04 | 作为朝圣者，我想在小程序中收到微信模板消息通知 | P0 |
| US-N05 | 作为朝圣者，我想在退款处理完成时收到短信通知 (涉及资金) | P1 |
| US-N06 | 作为朝圣者，我想在个人中心查看所有历史通知 | P0 |
| US-N07 | 作为朝圣者，我想标记通知为已读 / 一键全部已读 | P0 |
| US-N08 | 作为朝圣者，我想自定义哪些类型的通知通过哪些渠道接收 | P1 |

### 2.2 通知管理 (管理员)

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-N09 | 作为管理员，我想发送系统公告到全平台用户 | P1 |
| US-N10 | 作为管理员，我想查看通知发送历史和送达统计 | P1 |
| US-N11 | 作为管理员，我想管理邮件/短信/微信模板消息的模板 | P1 |
| US-N12 | 作为管理员，我想针对特定用户群发送定向通知 | P2 |

---

## 3. 业务流程

### 3.1 通知触发与分发流程

```
业务事件发生 (行程状态变更/支付成功/退款完成/...)
    │
    ▼
NotificationService.send({
  userId, type, title, content, data
})
    │
    ▼
查询用户通知偏好 (NotificationPreference)
    │
    ▼
确定投递渠道 (根据事件优先级 + 用户偏好):
    │
    ├─ IN_APP:     → 写入 Notification 表 + WebSocket 实时推送
    ├─ EMAIL:      → Bull Queue → EmailService.send(template, data)
    ├─ SMS:        → Bull Queue → SmsService.send(phone, template, data)
    ├─ PUSH:       → Bull Queue → ExpoPushService.send(pushToken, title, body)
    └─ WECHAT_TPL: → Bull Queue → WechatService.sendTemplate(openId, templateId, data)
    │
    ▼
记录投递状态 (NotificationDelivery: channel, status, sentAt, error?)
    │
    ▼
失败重试 (Bull Queue retry: 最多 3 次, 间隔 1min/5min/30min)
```

### 3.2 通知触发矩阵

| 触发事件 | 类型 | 默认渠道 | 优先级 |
|----------|------|----------|--------|
| 行程: DRAFT→PLANNING | TRIP_STATUS | IN_APP | 低 |
| 行程: SUBMITTED→CONFIRMED | TRIP_STATUS | IN_APP + PUSH | 中 |
| 行程: CONFIRMED→PAID | TRIP_STATUS | IN_APP + EMAIL | 中 |
| 行程: 管理员确认 | TRIP_STATUS | IN_APP + PUSH + WECHAT_TPL | 高 |
| 行程: IN_PROGRESS 开始 | TRIP_STATUS | IN_APP + PUSH + SMS | 高 |
| 行程: COMPLETED 完成 | TRIP_STATUS | IN_APP + PUSH | 中 |
| 行程: CANCELLED 取消 | TRIP_STATUS | IN_APP + EMAIL + SMS | 高 |
| 支付成功 | PAYMENT | IN_APP + EMAIL | 高 |
| 支付失败 | PAYMENT | IN_APP + EMAIL + PUSH | 高 |
| 退款发起 | PAYMENT | IN_APP + EMAIL | 高 |
| 退款到账 | PAYMENT | IN_APP + EMAIL + SMS | 高 |
| 新日志评论 (v2) | SOCIAL | IN_APP + PUSH | 低 |
| 日志被点赞 (v2) | SOCIAL | IN_APP | 低 |
| 系统公告 | SYSTEM | ALL (IN_APP + EMAIL + PUSH + WECHAT_TPL) | 高 |
| 营销推广 | PROMOTION | IN_APP + PUSH (用户可关闭) | 低 |
| 行程出发提醒 (T-3天) | REMINDER | IN_APP + PUSH + EMAIL | 中 |
| 行程出发提醒 (T-1天) | REMINDER | IN_APP + PUSH + SMS | 高 |

### 3.3 站内通知交互流程

```
用户登录后 → WebSocket 连接建立
    → 服务端推送未读通知计数 badge
    → 顶部导航栏 NotificationBell 显示红点 + 数字

用户点击 NotificationBell:
    → 下拉面板展示最近 10 条通知
    → 每条: 图标 + 标题 + 内容摘要 + 时间 + 已读/未读状态
    → 点击某条 → 标记已读 + 跳转关联页面 (行程详情/订单详情)
    → 「查看全部」→ 跳转 /notifications 页面

/notifications 页面:
    → Tabs: 全部 / 行程 / 支付 / 系统 / 社交
    → 列表: 按时间倒序排列
    → 批量操作: 全部标记已读 / 删除已读通知
```

### 3.4 用户通知偏好设置流程

```
用户进入 /settings/notifications:
    → 显示通知偏好矩阵:
        │           │ 站内 │ 邮件 │ 短信 │ Push │ 微信 │
        │ 行程状态   │  ☑  │  ☑  │  ☐  │  ☑  │  ☑  │
        │ 支付通知   │  ☑  │  ☑  │  ☑  │  ☑  │  ☑  │
        │ 社交互动   │  ☑  │  ☐  │  ☐  │  ☑  │  ☐  │
        │ 系统公告   │  ☑  │  ☑  │  ☐  │  ☐  │  ☐  │
        │ 营销推广   │  ☐  │  ☐  │  ☐  │  ☐  │  ☐  │
    → 用户勾选/取消 → 保存偏好
    → 注意: IN_APP 站内通知不可关闭 (强制开启)
    → 注意: 涉及资金的通知 (退款) 强制 SMS 不可关闭
```

---

## 4. 功能清单

### 4.1 站内通知

| 功能 | 说明 | 优先级 |
|------|------|--------|
| NotificationBell 组件 | 顶部导航栏铃铛图标 + 未读计数 badge | P0 |
| 通知下拉面板 | 点击铃铛展示最近 10 条通知 | P0 |
| /notifications 页面 | 全部通知列表，按类型 Tabs 过滤 | P0 |
| 标记已读 | 单条已读 + 一键全部已读 | P0 |
| WebSocket 实时推送 | Socket.io 连接，新通知实时推送到前端 | P1 |
| 通知详情跳转 | 点击通知跳转到关联页面 | P0 |
| 删除通知 | 用户可删除已读通知 | P2 |

### 4.2 邮件通知

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 注册验证邮件 | 验证码邮件，HTML 模板 | P0 |
| 密码重置邮件 | 重置链接，有效期 30 分钟 | P0 |
| 支付确认邮件 | 订单详情 + 金额 + 支付方式 | P0 |
| 行程确认邮件 | 行程详情 + 圣地列表 + 日期 | P1 |
| 退款通知邮件 | 退款金额 + 预计到账时间 | P0 |
| 行程提醒邮件 | 出发前 3 天提醒，含行程摘要 | P1 |
| 系统公告邮件 | 管理员发送的全平台公告 | P2 |

邮件模板设计:
```
┌─────────────────────────────────────┐
│        祖庭旅行 Logo (金色)           │
│   ─────────────────────────────     │
│                                      │
│   尊敬的 {nickname}:                  │
│                                      │
│   {content body}                     │
│                                      │
│   ┌───────────────────────┐          │
│   │  [查看详情]  (金色按钮)  │         │
│   └───────────────────────┘          │
│                                      │
│   ─────────────────────────────     │
│   祖庭旅行平台 · 帮助100万人走祖庭     │
│   退订通知: {unsubscribe_link}       │
└─────────────────────────────────────┘
```

背景色: #0f172a，文字: #e5e5e5，强调: #D4A855

### 4.3 短信通知

| 场景 | 模板内容 | 渠道 |
|------|----------|------|
| 注册验证码 | 【祖庭旅行】验证码: {code}，5分钟内有效。 | 阿里云 |
| 登录验证码 | 【祖庭旅行】登录验证码: {code}，5分钟内有效。 | 阿里云 |
| 行程开始 | 【祖庭旅行】您的朝圣行程「{title}」明日出发，请做好准备。 | 阿里云/Twilio |
| 退款到账 | 【祖庭旅行】订单{orderNo}退款{amount}元已到账，请查收。 | 阿里云/Twilio |
| 行程取消 | 【祖庭旅行】行程「{title}」已取消，退款将在3个工作日内处理。 | 阿里云/Twilio |

国内用户: 阿里云短信 (需备案模板审核)
国际用户: Twilio SMS (按国家费率)

### 4.4 App Push 通知

| 场景 | 标题 | 内容 | 动作 |
|------|------|------|------|
| 行程确认 | 行程已确认 | 「{title}」已由管理员确认，请完成支付 | 跳转行程详情 |
| 支付成功 | 支付成功 | 订单{orderNo}支付{amount}元成功 | 跳转订单详情 |
| 行程开始 | 朝圣之旅即将开始 | 「{title}」明日出发，祝旅途平安 | 跳转行程详情 |
| 行程完成 | 朝圣圆满 | 恭喜完成「{title}」，记录您的感悟吧 | 跳转写日志 |
| 新评论 | 有人评论了您的日志 | {commenter}: {comment_preview} | 跳转日志详情 |

实现: Expo Push Notifications API
```typescript
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: expoPushToken,
    title: '行程已确认',
    body: '「菩提伽耶朝圣之旅」已确认，请完成支付',
    data: { screen: 'TripDetail', tripId: '...' },
    sound: 'default',
    badge: unreadCount,
  }),
});
```

### 4.5 微信模板消息

| 场景 | 模板 | 关键字 |
|------|------|--------|
| 行程状态变更 | 行程状态通知 | 行程名称、当前状态、变更时间 |
| 支付成功 | 支付成功通知 | 订单号、支付金额、支付时间 |
| 退款通知 | 退款到账通知 | 订单号、退款金额、到账时间 |
| 出发提醒 | 行程提醒 | 行程名称、出发日期、目的地 |

小程序订阅消息流程:
```
用户在小程序中点击「订阅通知」按钮
    → wx.requestSubscribeMessage({ tmplIds: [...] })
    → 用户授权一次性订阅
    → 后端记录用户订阅状态
    → 事件触发时调用微信 API 发送模板消息
```

### 4.6 通知偏好管理

- 默认偏好: 全部开启 (除营销推广外)
- 强制通知: IN_APP 不可关闭；涉及资金的 SMS 不可关闭
- 偏好存储: NotificationPreference 表
- 多端同步: 任一端修改偏好，全端同步

---

## 5. 数据模型

### 5.1 Notification — 通知记录

```prisma
model Notification {
  id        String             @id @default(cuid())
  userId    String
  user      User               @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  content   String             @db.Text
  data      Json?              // 关联数据 {tripId?, orderId?, journalId?}
  isRead    Boolean            @default(false)
  readAt    DateTime?
  createdAt DateTime           @default(now())

  deliveries NotificationDelivery[]

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@index([type])
}

enum NotificationType {
  TRIP_STATUS   // 行程状态变更
  PAYMENT       // 支付/退款
  SOCIAL        // 社交互动 (评论/点赞)
  SYSTEM        // 系统公告
  PROMOTION     // 营销推广
  REMINDER      // 提醒 (出发提醒等)
}
```

### 5.2 NotificationDelivery — 投递记录

```prisma
model NotificationDelivery {
  id             String           @id @default(cuid())
  notificationId String
  notification   Notification     @relation(fields: [notificationId], references: [id])
  channel        NotificationChannel
  status         DeliveryStatus   @default(PENDING)
  externalId     String?          // 外部服务返回的 ID (邮件messageId/短信bizId)
  error          String?          // 失败原因
  sentAt         DateTime?
  deliveredAt    DateTime?
  retryCount     Int              @default(0)
  createdAt      DateTime         @default(now())

  @@index([notificationId])
  @@index([status])
}

enum NotificationChannel {
  IN_APP           // 站内通知
  EMAIL            // 邮件
  SMS              // 短信
  PUSH             // App Push
  WECHAT_TEMPLATE  // 微信模板消息
}

enum DeliveryStatus {
  PENDING     // 待发送
  SENT        // 已发送
  DELIVERED   // 已送达
  FAILED      // 失败
  RETRYING    // 重试中
}
```

### 5.3 NotificationPreference — 用户偏好

```prisma
model NotificationPreference {
  id      String             @id @default(cuid())
  userId  String
  user    User               @relation(fields: [userId], references: [id])
  type    NotificationType
  channel NotificationChannel
  enabled Boolean            @default(true)

  @@unique([userId, type, channel])
  @@index([userId])
}
```

### 5.4 SystemAnnouncement — 系统公告 (管理员发送)

```prisma
model SystemAnnouncement {
  id         String   @id @default(cuid())
  title      String
  content    String   @db.Text
  channels   String[] // 发送渠道: ["IN_APP", "EMAIL", "PUSH"]
  targetRole String?  // 目标角色，null=全部用户
  sentBy     String   // 管理员 userId
  sentAt     DateTime @default(now())
  readCount  Int      @default(0)
  totalSent  Int      @default(0)
}
```

---

## 6. API 接口

### 6.1 用户通知接口

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| GET | /api/notifications | 必须 | 我的通知列表 ?type=&isRead=&page=&limit= |
| GET | /api/notifications/unread-count | 必须 | 未读通知计数 |
| PATCH | /api/notifications/:id/read | 必须 | 标记单条已读 |
| PATCH | /api/notifications/read-all | 必须 | 全部标记已读 |
| DELETE | /api/notifications/:id | 必须 | 删除通知 |
| GET | /api/notifications/preferences | 必须 | 获取通知偏好 |
| PUT | /api/notifications/preferences | 必须 | 更新通知偏好 |

### 6.2 WebSocket 事件

| 事件 | 方向 | 数据 | 说明 |
|------|------|------|------|
| connect | C→S | { token } | 建立连接，JWT 认证 |
| notification:new | S→C | { id, type, title, content } | 新通知推送 |
| notification:count | S→C | { unread: number } | 未读计数更新 |
| notification:read | C→S | { id } | 客户端标记已读 |

### 6.3 管理员通知接口

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| POST | /api/admin/notifications/announce | ADMIN | 发送系统公告 |
| GET | /api/admin/notifications/stats | ADMIN | 通知发送统计 |
| GET | /api/admin/notifications/delivery-log | ADMIN | 投递日志查询 |
| POST | /api/admin/notifications/templates | ADMIN | 创建/编辑通知模板 |
| GET | /api/admin/notifications/templates | ADMIN | 获取通知模板列表 |

### 6.4 接口详细设计

**GET /api/notifications**
```
Query: ?type=TRIP_STATUS&isRead=false&page=1&limit=20

Response:
{
  "data": [
    {
      "id": "clu...",
      "type": "TRIP_STATUS",
      "title": "行程已确认",
      "content": "您的行程「菩提伽耶朝圣之旅」已由管理员确认，请在24小时内完成支付。",
      "data": { "tripId": "clu...", "action": "admin_confirm" },
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-03-25T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

## 7. 多端页面规格

### 7.1 Web — NotificationBell 组件

```
位置: TopNav 右侧，用户头像左边

未读时:
  🔔(2)  ← 铃铛图标 + 红色 badge 数字

点击展开下拉面板:
┌──────────────────────────────┐
│  通知                  全部已读 │
├──────────────────────────────┤
│ ● 行程已确认              10分钟前│
│   「菩提伽耶之旅」已确认...       │
├──────────────────────────────┤
│ ○ 支付成功               1小时前 │
│   订单OD20260325...已支付       │
├──────────────────────────────┤
│ ○ 系统公告                昨天   │
│   平台新功能上线...              │
├──────────────────────────────┤
│         查看全部通知 →          │
└──────────────────────────────┘

● = 未读 (金色圆点)
○ = 已读 (灰色)
```

### 7.2 Web — /notifications 页面

```
┌─────────────────────────────────────────┐
│  通知中心                                │
├─────────────────────────────────────────┤
│  [全部] [行程] [支付] [系统] [社交]       │
│                           [全部标记已读]  │
├─────────────────────────────────────────┤
│  ● 行程已确认                 2026-03-25 │
│    「菩提伽耶朝圣之旅」已确认，请完成支付  │
│                          [查看详情] [已读] │
├─────────────────────────────────────────┤
│  ○ 支付成功                   2026-03-24 │
│    订单OD20260324支付200.00元成功         │
│                          [查看详情]       │
├─────────────────────────────────────────┤
│                  1 / 5 页               │
└─────────────────────────────────────────┘
```

### 7.3 Mobile App — 通知

```
┌─────────────────────────┐
│  通知中心        全部已读  │
├─────────────────────────┤
│ [全部][行程][支付][系统]  │ ← 横向 Tabs
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │● 行程已确认      10分│ │
│ │  菩提伽耶之旅已确认  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │○ 支付成功       1小时│ │
│ │  订单支付200元成功   │ │
│ └─────────────────────┘ │
│                          │
│           ...            │
├─────────────────────────┤
│  TabBar                  │
└─────────────────────────┘
```

### 7.4 小程序 — 通知

小程序不设独立通知页面，通过以下方式触达:
- 微信服务通知 (订阅消息): 出现在微信「服务通知」中
- 小程序内 toast/modal: 进入小程序时弹出未处理通知
- 个人中心红点: 有未读通知时显示红点

### 7.5 通知偏好设置页

```
┌─────────────────────────────────────────┐
│  通知设置                                │
├─────────────────────────────────────────┤
│                                          │
│  行程通知                                │
│    站内通知  [━━○]  (不可关闭)            │
│    邮件通知  [━━○]                        │
│    短信通知  [○━━]                        │
│    Push推送  [━━○]                        │
│    微信通知  [━━○]                        │
│                                          │
│  支付通知                                │
│    站内通知  [━━○]  (不可关闭)            │
│    邮件通知  [━━○]                        │
│    短信通知  [━━○]  (涉及资金不可关闭)     │
│    Push推送  [━━○]                        │
│    微信通知  [━━○]                        │
│                                          │
│  社交互动                                │
│    站内通知  [━━○]                        │
│    Push推送  [━━○]                        │
│                                          │
│  营销推广                                │
│    全部关闭  [○━━]                        │
│                                          │
│            [保存设置]                     │
└─────────────────────────────────────────┘
```

---

## 8. 埋点需求

### 8.1 通知事件

| 事件 | 参数 | 说明 |
|------|------|------|
| notification_received | type, channel, notification_id | 收到通知 |
| notification_bell_click | unread_count | 点击铃铛 |
| notification_item_click | notification_id, type, is_read | 点击通知条目 |
| notification_read | notification_id, type | 标记已读 |
| notification_read_all | count | 全部标记已读 |
| notification_delete | notification_id | 删除通知 |
| notification_page_view | tab, total_count, unread_count | 通知页面访问 |

### 8.2 偏好设置事件

| 事件 | 参数 | 说明 |
|------|------|------|
| notification_preference_view | — | 打开偏好设置 |
| notification_preference_change | type, channel, enabled | 切换偏好开关 |
| notification_preference_save | changed_items[] | 保存偏好 |

### 8.3 投递指标 (后端)

| 指标 | 采集方式 | 目标 |
|------|----------|------|
| 送达率 | DeliveryStatus=DELIVERED / total | > 99.5% (关键通知) |
| 平均送达时间 | deliveredAt - createdAt | < 5s (站内), < 30s (Push), < 60s (邮件) |
| 失败率 | DeliveryStatus=FAILED / total | < 0.5% |
| 重试成功率 | retryCount>0 且 DELIVERED / 重试总数 | > 80% |
| 未读率 | isRead=false / total | 监控，无目标 |
| 邮件打开率 | 邮件追踪像素 | > 30% |
| Push 打开率 | App 端回调 | > 15% |
