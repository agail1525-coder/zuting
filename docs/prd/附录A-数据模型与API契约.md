# 附录A 数据模型与API契约

> 版本: v1.0 | 日期: 2026-03-25 | 状态: 开发参考文档 (随代码同步更新)

---

## 1. ER 关系图

```
┌──────────────────────────────────────────────────────────────────────┐
│                          ER DIAGRAM                                  │
│                                                                      │
│  ┌─────────┐       ┌──────────┐       ┌──────────┐                  │
│  │  User    │──1:N──│ Session  │       │ VerCode  │                  │
│  │─────────│       └──────────┘       └──────────┘                  │
│  │ id      │                                                         │
│  │ phone   │──1:N──┌──────────┐                                     │
│  │ email   │       │ Practice │                                     │
│  │ role    │       └──────────┘                                     │
│  │ ...     │                                                         │
│  └────┬────┘                                                         │
│       │                                                              │
│       ├──1:N──┌──────────┐──N:1──┌───────────┐                      │
│       │       │  Trip    │       │ TripSite  │──N:1──┐              │
│       │       │──────────│       └───────────┘       │              │
│       │       │ status   │──1:N──┌─────────────────┐ │              │
│       │       │ budget   │       │TripStatusHistory│ │              │
│       │       └──────────┘       └─────────────────┘ │              │
│       │            │                                  │              │
│       │            └──1:N──┌──────────┐               │              │
│       │                    │  Order   │               │              │
│       │                    └──────────┘               │              │
│       │                                               │              │
│       └──1:N──┌──────────────┐                        │              │
│               │ JournalEntry │                        │              │
│               └──────────────┘                        │              │
│       │                                               │              │
│       └──1:N──┌──────────┐                            │              │
│               │  Post    │                            │              │
│               └──────────┘                            │              │
│                                                       │              │
│  ┌──────────┐       ┌──────────┐                      │              │
│  │ Religion │──1:N──│ HolySite │──────────────────────┘              │
│  │──────────│       │──────────│                                     │
│  │ name     │       │ lat/lng  │                                     │
│  │ slug     │       │ country  │                                     │
│  │ color    │       └──────────┘                                     │
│  │ symbol   │                                                        │
│  └────┬─────┘                                                        │
│       │                                                              │
│       ├──1:N──┌──────────┐                                          │
│       │       │ Temple   │                                          │
│       │       └──────────┘                                          │
│       │                                                              │
│       ├──1:N──┌──────────┐                                          │
│       │       │Patriarch │                                          │
│       │       └──────────┘                                          │
│       │                                                              │
│       └──1:N──┌──────────┐                                          │
│               │ Teaching │                                          │
│               └──────────┘                                          │
│                                                                      │
│  ┌──────────┐  (独立，无外键关联)                                     │
│  │  Seal    │                                                        │
│  │──────────│                                                        │
│  │ id (Int) │                                                        │
│  │ series   │                                                        │
│  │ poem     │                                                        │
│  └──────────┘                                                        │
│                                                                      │
│  关系汇总:                                                            │
│  User 1:N → Session, Practice, Trip, Post, Order, JournalEntry      │
│  Religion 1:N → HolySite, Temple, Patriarch, Teaching               │
│  Trip 1:N → TripSite, TripStatusHistory, Order, JournalEntry       │
│  HolySite 1:N → TripSite                                           │
│  TripSite → Trip (N:1) + HolySite (N:1)                            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prisma 模型详解

### 2.1 User — 用户

```prisma
model User {
  id              String    @id @default(cuid())
  phone           String?   @unique          // 手机号 (国内登录)
  email           String?   @unique          // 邮箱 (国际登录)
  wechatOpenId    String?   @unique          // 微信OpenID (小程序登录)
  googleId        String?   @unique          // Google OAuth ID
  nickname        String                      // 昵称
  avatar          String?                     // 头像URL
  role            UserRole  @default(PILGRIM) // 角色
  language        String    @default("zh-CN") // 语言偏好
  passwordHash    String?                     // bcrypt 密码哈希
  refreshToken    String?                     // JWT refresh token
  emailVerified   Boolean   @default(false)   // 邮箱是否验证
  phoneVerified   Boolean   @default(false)   // 手机是否验证
  lastLoginAt     DateTime?                   // 最后登录时间
  isActive        Boolean   @default(true)    // 账号是否激活
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  practices  Practice[]
  trips      Trip[]
  posts      Post[]
  orders     Order[]
  journals   JournalEntry[]
  sessions   Session[]
}
```

**v2 追加字段**:
```
  bio            String?   @db.Text   // 个人简介
  country        String?              // 所在国家
  faithInterests String[]             // 感兴趣的信仰 (religion slugs)
  pushToken      String?              // Expo Push Token
  // v2 Relations
  reviews        Review[]
  notifications  Notification[]
  preferences    NotificationPreference[]
  footprints     UserFootprint[]
  followers      UserFollow[] @relation("Following")
  following      UserFollow[] @relation("Follower")
  reports        ContentReport[]
```

### 2.2 Session — 会话

```prisma
model Session {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token      String   @unique               // JWT access token
  deviceInfo String?                         // 设备信息 (User-Agent / 设备型号)
  ipAddress  String?                         // 登录IP
  expiresAt  DateTime                        // 过期时间
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

### 2.3 VerificationCode — 验证码

```prisma
model VerificationCode {
  id        String   @id @default(cuid())
  target    String                           // 手机号或邮箱
  code      String                           // 6位验证码
  type      String                           // REGISTER / LOGIN / RESET_PASSWORD
  expiresAt DateTime                         // 过期时间 (5分钟)
  used      Boolean  @default(false)         // 是否已使用
  createdAt DateTime @default(now())

  @@index([target, type])
}
```

### 2.4 Religion — 宗教

```prisma
model Religion {
  id     String  @id @default(cuid())
  name   String  @unique                     // 中文名: 佛教, 道教, ...
  nameEn String                              // 英文名: Buddhism, Taoism, ...
  slug   String  @unique                     // URL标识: buddhism, taoism, ...
  symbol String?                             // 符号/emoji: ☸, ☯, ✝, ...
  color  String?                             // 主题色: #FFD700, #00CED1, ...

  holySites  HolySite[]
  temples    Temple[]
  patriarchs Patriarch[]
  teachings  Teaching[]
}
```

**12 大信仰** (种子数据):
| slug | name | nameEn | symbol | color |
|------|------|--------|--------|-------|
| buddhism | 佛教 | Buddhism | ☸ | #FFD700 |
| taoism | 道教 | Taoism | ☯ | #00CED1 |
| christianity | 基督教 | Christianity | ✝ | #4169E1 |
| islam | 伊斯兰教 | Islam | ☪ | #228B22 |
| hinduism | 印度教 | Hinduism | 🕉 | #FF6347 |
| judaism | 犹太教 | Judaism | ✡ | #1E90FF |
| confucianism | 儒教 | Confucianism | 儒 | #8B0000 |
| sikhism | 锡克教 | Sikhism | ☬ | #FF8C00 |
| shinto | 神道教 | Shinto | ⛩ | #DC143C |
| tibetan-buddhism | 藏传佛教 | Tibetan Buddhism | 🏔 | #9400D3 |
| indigenous | 原住民灵性 | Indigenous Spirituality | 🌿 | #2E8B57 |
| bahai | 巴哈伊教 | Baha'i Faith | ✴ | #B8860B |

### 2.5 HolySite — 圣地

```prisma
model HolySite {
  id          String  @id @default(cuid())
  name        String                         // 中文名
  nameEn      String                         // 英文名
  country     String                         // 国家
  latitude    Float                          // 纬度 (-90 ~ 90)
  longitude   Float                          // 经度 (-180 ~ 180)
  utcOffset   Float                          // UTC时区偏移 (e.g. 8.0, -5.0)
  description String  @db.Text               // 详细描述
  imageUrl    String?                        // 封面图片URL
  soundEffect String?                        // 到达时播放的音效URL

  religionId String
  religion   Religion   @relation(fields: [religionId], references: [id])
  tripSites  TripSite[]

  @@index([religionId])
}
```

数据: 每个信仰 5 个圣地，共 60 个，均含 GPS 坐标。

### 2.6 Temple — 祖庭

```prisma
model Temple {
  id           String  @id @default(cuid())
  name         String                        // 中文名
  nameEn       String?                       // 英文名
  country      String                        // 国家
  foundingDate String?                       // 创建年代 (文本)
  description  String  @db.Text              // 详细描述
  imageUrl     String?                       // 封面图片URL
  latitude     Float?                        // 纬度 (部分有)
  longitude    Float?                        // 经度 (部分有)

  religionId String
  religion   Religion @relation(fields: [religionId], references: [id])

  @@index([religionId])
}
```

数据: 27 座祖庭。

### 2.7 Patriarch — 祖师

```prisma
model Patriarch {
  id           String  @id @default(cuid())
  name         String                        // 姓名
  nameEn       String?                       // 英文名
  dates        String?                       // 生卒年代
  title        String?                       // 头衔/尊称
  biography    String  @db.Text              // 传记
  coreTeaching String  @db.Text              // 核心教义
  imageUrl     String?                       // 头像/画像URL

  religionId String
  religion   Religion @relation(fields: [religionId], references: [id])

  @@index([religionId])
}
```

数据: 28 位祖师。

### 2.8 Teaching — 祖训

```prisma
model Teaching {
  id            String  @id @default(cuid())
  name          String                       // 名称
  originalText  String  @db.Text             // 原文
  sourceText    String?                      // 来源出处
  translationCn String? @db.Text             // 中文翻译 (非中文原典)

  religionId String
  religion   Religion @relation(fields: [religionId], references: [id])

  @@index([religionId])
}
```

数据: 39 条祖训。

### 2.9 Seal — 三十印

```prisma
model Seal {
  id       Int        @id                    // 1-30 序号
  name     String                            // 印名
  series   SealSeries                        // 所属系列
  poem     String     @db.Text               // 偈语
  essence  String     @db.Text               // 精要
  practice String     @db.Text               // 修行法
  vow      String     @db.Text               // 大愿
  color    String?                           // 印的主题色
}
```

**五系分布** (种子数据):
| SealSeries | 中文 | 序号范围 | 系列色 |
|------------|------|----------|--------|
| CHUYIN | 初印系 | 1-6 | 青色 #22d3ee |
| ZHONGYIN | 中印系 | 7-12 | 蓝色 #3b82f6 |
| YINGUOYIN | 印果印 | 13-18 | 紫色 #a855f7 |
| CHENGDAOYIN | 成道印 | 19-24 | 红色 #ef4444 |
| GUIYUANYIN | 归源印 | 25-30 | 金色 #D4A855 |

### 2.10 Practice — 修行记录

```prisma
model Practice {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id])
  sealId   Int                               // 关联印的序号
  date     DateTime @default(now())           // 修行日期
  duration Int?                               // 修行时长 (分钟)
  note     String?  @db.Text                  // 修行笔记

  @@index([userId])
  @@index([date])
}
```

### 2.11 Trip — 行程

```prisma
model Trip {
  id           String     @id @default(cuid())
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  title        String                        // 行程标题
  startDate    DateTime?                     // 出发日期
  endDate      DateTime?                     // 结束日期
  status       TripStatus @default(DRAFT)    // 状态 (12种)
  totalBudget  Int?                          // 预算 (单位: 分)
  persons      Int        @default(1)        // 人数
  contactName  String?                       // 联系人
  contactPhone String?                       // 联系电话
  note         String?    @db.Text           // 备注

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sites         TripSite[]
  statusHistory TripStatusHistory[]
  orders        Order[]
  journals      JournalEntry[]

  @@index([userId])
  @@index([status])
}
```

### 2.12 TripSite — 行程圣地

```prisma
model TripSite {
  id        String    @id @default(cuid())
  tripId    String
  trip      Trip      @relation(fields: [tripId], references: [id])
  siteId    String
  site      HolySite  @relation(fields: [siteId], references: [id])
  order     Int                              // 访问顺序
  visitDate DateTime?                        // 计划访问日期
  notes     String?   @db.Text               // 该站备注

  @@index([tripId])
}
```

### 2.13 TripStatusHistory — 状态变更历史

```prisma
model TripStatusHistory {
  id         String     @id @default(cuid())
  tripId     String
  trip       Trip       @relation(fields: [tripId], references: [id])
  fromStatus TripStatus                      // 变更前状态
  toStatus   TripStatus                      // 变更后状态
  event      String                          // 触发事件名
  operator   String?                         // 操作者 (userId / "system")
  reason     String?                         // 原因 (取消/退款时)
  createdAt  DateTime   @default(now())

  @@index([tripId])
}
```

### 2.14 Order — 订单

```prisma
model Order {
  id            String      @id @default(cuid())
  orderNo       String      @unique          // 订单号: OD + 时间戳 + 随机
  tripId        String
  trip          Trip        @relation(fields: [tripId], references: [id])
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  totalAmount   Int                          // 总金额 (单位: 分)
  paidAmount    Int?                         // 实付金额
  paymentMethod String?                      // 支付方式: wechat/alipay/stripe
  paymentId     String?                      // 外部支付ID
  status        OrderStatus @default(PENDING)
  createdAt     DateTime    @default(now())
  paidAt        DateTime?                    // 支付时间
  cancelledAt   DateTime?                    // 取消时间
  refundedAt    DateTime?                    // 退款时间

  @@index([userId])
  @@index([tripId])
  @@index([orderNo])
}
```

### 2.15 JournalEntry — 朝圣日志

```prisma
model JournalEntry {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  tripId    String?
  trip      Trip?    @relation(fields: [tripId], references: [id])
  siteId    String?                          // 关联圣地 (可选)
  title     String                           // 标题
  content   String   @db.Text                // 正文 (Markdown)
  images    String[]                         // 图片URL数组
  mood      String?                          // 心情: 感悟/喜悦/平静/震撼
  isPublic  Boolean  @default(false)         // 是否公开到社区
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([tripId])
}
```

### 2.16 Post — 社区帖子

```prisma
model Post {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String   @db.Text                // 帖子内容
  images    String[]                         // 图片URL数组
  siteTag   String?                          // 圣地标签
  likes     Int      @default(0)             // 点赞数
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

### 2.17 v2 新增模型 (规划)

详见各模块 PRD:
- **Notification** / **NotificationDelivery** / **NotificationPreference** / **SystemAnnouncement** — 见 M11-PRD-通知与消息
- **Review** / **ReviewReply** / **Comment** / **ContentReport** / **ContentLike** / **UserFollow** — 见 M12-PRD-评价与社区
- **UserFootprint** / **SavedRoute** — 见 M10-PRD-地图与导航
- **GuideProfile** — 导游档案 (v2)
- **Coupon** / **CouponUsage** — 优惠券 (v2)
- **PaymentTransaction** — 支付流水 (v2)

---

## 3. 枚举类型

### 3.1 UserRole — 用户角色

```prisma
enum UserRole {
  PILGRIM      // 朝圣者 (默认)
  GUIDE        // 导游
  AMBASSADOR   // 文化大使
  ADMIN        // 管理员
}
```

### 3.2 TripStatus — 行程状态 (12 状态机)

```prisma
enum TripStatus {
  DRAFT           // 草稿 — 用户创建未完善
  PLANNING        // 规划中 — 添加圣地、设定日期
  SUBMITTED       // 已提交 — 提交审核
  CONFIRMED       // 已确认 — 管理员确认可出行
  PAID            // 已支付 — 完成支付
  PREPARING       // 准备中 — 行前准备 (签证/保险等)
  IN_PROGRESS     // 朝圣中 — 行程进行中
  COMPLETED       // 已完成 — 行程结束
  REVIEWING       // 评价中 — 待用户评价
  CANCELLED       // 已取消
  REFUNDING       // 退款中
  REFUNDED        // 已退款
}
```

**状态转换表**:
```
DRAFT ──────→ PLANNING ──────→ SUBMITTED ──────→ CONFIRMED
  │              │                  │                 │
  └── CANCELLED  └── CANCELLED     └── CANCELLED     ▼
                                                    PAID
                                                     │
                                        ┌────────────┤
                                        ▼            ▼
                                   CANCELLED    PREPARING
                                                     │
                                                     ▼
                                                IN_PROGRESS
                                                     │
                                                     ▼
                                                 COMPLETED
                                                     │
                                                     ▼
                                                 REVIEWING

PAID/PREPARING/IN_PROGRESS → CANCELLED → REFUNDING → REFUNDED
```

**状态转换事件**:
| 事件 | 从 | 到 | 触发者 |
|------|----|----|--------|
| start_planning | DRAFT | PLANNING | 用户 |
| user_submit | PLANNING | SUBMITTED | 用户 |
| admin_confirm | SUBMITTED | CONFIRMED | 管理员 |
| payment_success | CONFIRMED | PAID | 系统 |
| start_preparing | PAID | PREPARING | 管理员 |
| start_trip | PREPARING | IN_PROGRESS | 系统/管理员 |
| complete_trip | IN_PROGRESS | COMPLETED | 系统/管理员 |
| start_review | COMPLETED | REVIEWING | 系统 |
| cancel | DRAFT/PLANNING/SUBMITTED/CONFIRMED | CANCELLED | 用户/管理员 |
| cancel_paid | PAID/PREPARING | CANCELLED | 管理员 |
| request_refund | CANCELLED (from PAID+) | REFUNDING | 系统 |
| refund_complete | REFUNDING | REFUNDED | 系统 |

### 3.3 OrderStatus — 订单状态

```prisma
enum OrderStatus {
  PENDING     // 待支付 — 订单创建，等待用户支付
  PAID        // 已支付 — 支付成功
  CANCELLED   // 已取消 — 超时未支付 / 用户取消
  REFUNDING   // 退款中 — 发起退款，处理中
  REFUNDED    // 已退款 — 退款到账
}
```

### 3.4 SealSeries — 印系列

```prisma
enum SealSeries {
  CHUYIN       // 初印系 (1-6)
  ZHONGYIN     // 中印系 (7-12)
  YINGUOYIN    // 印果印 (13-18)
  CHENGDAOYIN  // 成道印 (19-24)
  GUIYUANYIN   // 归源印 (25-30)
}
```

---

## 4. 完整 API 端点表

### 4.1 认证模块 (Auth)

| 方法 | 路径 | Auth | 描述 | Request Body | Response |
|------|------|------|------|-------------|----------|
| POST | /api/auth/register | 无 | 用户注册 | `{phone?, email?, password, nickname}` | `{user, accessToken, refreshToken}` |
| POST | /api/auth/login | 无 | 密码登录 | `{email/phone, password}` | `{user, accessToken, refreshToken}` |
| POST | /api/auth/login/wechat | 无 | 微信登录 | `{code}` | `{user, accessToken, refreshToken}` |
| POST | /api/auth/login/google | 无 | Google登录 | `{idToken}` | `{user, accessToken, refreshToken}` |
| POST | /api/auth/send-code | 无 | 发送验证码 | `{target, type}` | `{success, expiresIn}` |
| POST | /api/auth/verify-code | 无 | 验证码校验 | `{target, code, type}` | `{verified}` |
| POST | /api/auth/refresh | 无 | 刷新Token | `{refreshToken}` | `{accessToken, refreshToken}` |
| POST | /api/auth/logout | 必须 | 退出登录 | — | `{success}` |
| GET | /api/auth/me | 必须 | 获取当前用户 | — | `User` |
| PATCH | /api/auth/me | 必须 | 更新个人信息 | `{nickname?, avatar?, language?}` | `User` |

### 4.2 宗教数据模块

| 方法 | 路径 | Auth | 描述 | Response |
|------|------|------|------|----------|
| GET | /api/religions | 无 | 宗教列表 | `Religion[]` |
| GET | /api/religions/:slug | 无 | 宗教详情 (by slug) | `Religion` 含关联数据 |
| GET | /api/holy-sites | 无 | 圣地列表 ?religionId= | `HolySite[]` |
| GET | /api/holy-sites/:id | 无 | 圣地详情 | `HolySite` 含 religion |
| GET | /api/temples | 无 | 祖庭列表 ?religionId= | `Temple[]` |
| GET | /api/temples/:id | 无 | 祖庭详情 | `Temple` 含 religion |
| GET | /api/patriarchs | 无 | 祖师列表 ?religionId= | `Patriarch[]` |
| GET | /api/patriarchs/:id | 无 | 祖师详情 | `Patriarch` 含 religion |
| GET | /api/teachings | 无 | 祖训列表 ?religionId= | `Teaching[]` |
| GET | /api/teachings/:id | 无 | 祖训详情 | `Teaching` 含 religion |
| GET | /api/seals | 无 | 三十印列表 ?series= | `Seal[]` |
| GET | /api/seals/:id | 无 | 印详情 | `Seal` |

### 4.3 小鸿AI模块 (Xiaohong)

| 方法 | 路径 | Auth | 描述 | Request Body | Response |
|------|------|------|------|-------------|----------|
| POST | /api/xiaohong/chat | 可选 | 发送消息 | `{message, context?}` | `{reply, suggestions}` |
| GET | /api/xiaohong/chat/stream | 可选 | SSE流式回复 | query: `message` | `text/event-stream` |
| GET | /api/xiaohong/suggestions | 无 | 推荐问题 | — | `string[]` |

### 4.4 行程模块 (Trips)

| 方法 | 路径 | Auth | 描述 | Request Body | Response |
|------|------|------|------|-------------|----------|
| POST | /api/trips | 必须 | 创建行程 | `{title, startDate?, endDate?, persons?, note?}` | `Trip` |
| GET | /api/trips | 必须 | 我的行程列表 | query: `status?` | `Trip[]` 含 sites |
| GET | /api/trips/:id | 必须 | 行程详情 | — | `Trip` 含 sites, statusHistory, orders |
| PATCH | /api/trips/:id | 必须 | 更新行程 | `{title?, startDate?, endDate?, ...}` | `Trip` |
| POST | /api/trips/:id/transition | 必须 | 状态转换 | `{event, reason?}` | `Trip` |
| POST | /api/trips/:id/sites | 必须 | 添加圣地 | `{siteId, order?, visitDate?, notes?}` | `TripSite` |
| DELETE | /api/trips/:id/sites/:siteId | 必须 | 移除圣地 | — | `{success}` |
| GET | /api/trips/status-meta | 无 | 状态元数据 | — | `{statuses, transitions}` |

### 4.5 订单模块 (Orders)

| 方法 | 路径 | Auth | 描述 | Request Body | Response |
|------|------|------|------|-------------|----------|
| POST | /api/orders | 必须 | 创建订单 | `{tripId, paymentMethod?}` | `Order` |
| GET | /api/orders | 必须 | 我的订单列表 | query: `status?` | `Order[]` 含 trip |
| GET | /api/orders/:id | 必须 | 订单详情 | — | `Order` 含 trip, user |
| POST | /api/orders/:id/pay | 必须 | 发起支付 | `{paymentMethod}` | `{paymentUrl, orderNo}` |
| POST | /api/orders/:id/cancel | 必须 | 取消订单 | — | `Order` |
| POST | /api/orders/:id/refund | ADMIN | 订单退款 | `{reason?}` | `Order` |

### 4.6 日志模块 (Journals)

| 方法 | 路径 | Auth | 描述 | Request Body | Response |
|------|------|------|------|-------------|----------|
| POST | /api/journals | 必须 | 创建日志 | `{title, content, tripId?, siteId?, images?, mood?, isPublic?}` | `JournalEntry` |
| GET | /api/journals | 必须 | 我的日志列表 | query: `tripId?` | `JournalEntry[]` |
| GET | /api/journals/:id | 必须 | 日志详情 | — | `JournalEntry` |
| PATCH | /api/journals/:id | 必须 | 更新日志 | `{title?, content?, images?, mood?, isPublic?}` | `JournalEntry` |
| DELETE | /api/journals/:id | 必须 | 删除日志 | — | `{success}` |

### 4.7 健康检查

| 方法 | 路径 | Auth | 描述 | Response |
|------|------|------|------|----------|
| GET | /api/health | 无 | 健康检查 | `{status: "ok", timestamp}` |

### 4.8 v2 新增接口 (规划)

#### 通知模块
| 方法 | 路径 | Auth | 描述 |
|------|------|------|------|
| GET | /api/notifications | 必须 | 通知列表 |
| GET | /api/notifications/unread-count | 必须 | 未读计数 |
| PATCH | /api/notifications/:id/read | 必须 | 标记已读 |
| PATCH | /api/notifications/read-all | 必须 | 全部已读 |
| DELETE | /api/notifications/:id | 必须 | 删除通知 |
| GET | /api/notifications/preferences | 必须 | 获取偏好 |
| PUT | /api/notifications/preferences | 必须 | 更新偏好 |

#### 评价模块
| 方法 | 路径 | Auth | 描述 |
|------|------|------|------|
| POST | /api/reviews | 必须 | 创建评价 |
| GET | /api/reviews | 可选 | 评价列表 |
| GET | /api/reviews/:id | 可选 | 评价详情 |
| POST | /api/reviews/:id/like | 必须 | 点赞 |
| POST | /api/reviews/:id/reply | 必须 | 回复 |
| GET | /api/reviews/stats/:type/:id | 可选 | 评分统计 |

#### 社区模块
| 方法 | 路径 | Auth | 描述 |
|------|------|------|------|
| GET | /api/community/feed | 可选 | 社区动态流 |
| GET | /api/community/hot | 可选 | 热门内容 |
| POST | /api/comments | 必须 | 发表评论 |
| GET | /api/comments | 可选 | 评论列表 |
| POST | /api/reports | 必须 | 提交举报 |

#### 地图模块
| 方法 | 路径 | Auth | 描述 |
|------|------|------|------|
| GET | /api/holy-sites/nearby | 可选 | 附近圣地 |
| GET | /api/users/me/footprint | 必须 | 我的足迹 |
| POST | /api/users/me/footprint | 必须 | 记录足迹 |
| POST | /api/routes/calculate | 可选 | 计算路线 |

#### 管理员模块
| 方法 | 路径 | Auth | 描述 |
|------|------|------|------|
| GET | /api/admin/dashboard/stats | ADMIN | 聚合统计 |
| GET | /api/admin/users | ADMIN | 用户列表 |
| PATCH | /api/admin/users/:id/role | ADMIN | 修改角色 |
| GET | /api/admin/reports | ADMIN | 举报列表 |
| PATCH | /api/admin/reports/:id | ADMIN | 审核处理 |
| POST | /api/admin/notifications/announce | ADMIN | 发送公告 |
| POST | /api/admin/ai-config | ADMIN | 保存AI配置 |
| GET | /api/admin/ai-config | ADMIN | 获取AI配置 |
| GET | /api/admin/audit-log | ADMIN | 审计日志 |

---

## 5. 错误响应格式

### 5.1 标准错误结构

所有 API 错误返回统一格式:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-03-25T10:30:00.000Z",
  "path": "/api/trips"
}
```

### 5.2 HTTP 状态码约定

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | GET 成功, PATCH 成功 |
| 201 | Created | POST 创建成功 |
| 204 | No Content | DELETE 成功 |
| 400 | Bad Request | 请求参数校验失败 |
| 401 | Unauthorized | 未提供 token / token 过期 |
| 403 | Forbidden | 权限不足 (非 ADMIN 访问管理接口) |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 唯一约束冲突 (邮箱/手机号已注册) |
| 422 | Unprocessable Entity | 业务逻辑错误 (状态转换不合法) |
| 429 | Too Many Requests | 频率限制 (验证码 60s 一次) |
| 500 | Internal Server Error | 服务端异常 |

### 5.3 验证错误详情

```json
{
  "statusCode": 400,
  "message": [
    "title must be a string",
    "startDate must be a valid ISO date"
  ],
  "error": "Bad Request",
  "timestamp": "2026-03-25T10:30:00.000Z",
  "path": "/api/trips"
}
```

### 5.4 业务错误码 (v2)

```json
{
  "statusCode": 422,
  "message": "Invalid trip transition: DRAFT cannot transition to PAID",
  "errorCode": "TRIP_INVALID_TRANSITION",
  "details": {
    "currentStatus": "DRAFT",
    "targetStatus": "PAID",
    "allowedTransitions": ["PLANNING", "CANCELLED"]
  },
  "timestamp": "2026-03-25T10:30:00.000Z",
  "path": "/api/trips/clu.../transition"
}
```

---

## 6. 认证与授权

### 6.1 JWT Token 结构

**Access Token** (有效期: 15 分钟):
```json
{
  "sub": "user_cuid",
  "role": "PILGRIM",
  "nickname": "张三",
  "iat": 1711353000,
  "exp": 1711353900
}
```

**Refresh Token** (有效期: 7 天):
```json
{
  "sub": "user_cuid",
  "type": "refresh",
  "iat": 1711353000,
  "exp": 1711957800
}
```

### 6.2 认证流程

```
请求 → Authorization: Bearer <accessToken>
    → JwtAuthGuard 校验 token
        → 有效 → 注入 req.user
        → 过期 → 返回 401
            → 客户端用 refreshToken 调用 /auth/refresh
            → 获得新 accessToken → 重试原请求
        → 无效 → 返回 401 → 跳转登录
```

### 6.3 角色权限矩阵

| 操作 | PILGRIM | GUIDE | AMBASSADOR | ADMIN |
|------|---------|-------|------------|-------|
| 浏览宗教数据 | O | O | O | O |
| 创建行程 | O | O | O | O |
| 管理自己的行程 | O | O | O | O |
| 写日志/评价 | O | O | O | O |
| 接单带团 | X | O | X | O |
| 发布社区内容 | O | O | O | O |
| 审核内容 | X | X | X | O |
| CRUD 全部数据 | X | X | X | O |
| 管理用户 | X | X | X | O |
| 系统配置 | X | X | X | O |

O = 允许, X = 禁止

---

## 7. 数据统计

### 7.1 种子数据 (196 条)

| 模型 | 数量 | 说明 |
|------|------|------|
| Religion | 12 | 12 大信仰体系 |
| HolySite | 60 | 每信仰 5 个 |
| Temple | 27 | 各信仰重要祖庭 |
| Patriarch | 28 | 各信仰创始人/重要人物 |
| Teaching | 39 | 经典祖训原文 |
| Seal | 30 | 曹溪愿命三十印 |
| **合计** | **196** | |

### 7.2 索引策略

所有模型的查询频繁字段均已建立索引:
- `@@index([userId])` — 按用户查询
- `@@index([religionId])` — 按宗教筛选
- `@@index([tripId])` — 按行程关联
- `@@index([status])` — 按状态筛选
- `@@index([createdAt])` — 按时间排序
- `@unique` — phone, email, wechatOpenId, googleId, slug, orderNo, token
