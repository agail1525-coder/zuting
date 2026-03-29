# M30 实时消息系统 产品需求文档

> 版本: v1.0 | 日期: 2026-03-29 | 状态: Sprint E1 规划中 | 优先级: P0

---

## 1. 需求背景与目标

### 1.1 背景

实时消息系统是祖庭旅行平台从"内容浏览"升级为"服务闭环"的关键基础设施。用户在浏览圣地、预订行程、咨询导游的过程中，需要与商家、导游、客服进行即时沟通。当前平台缺乏用户间直接通信能力，所有咨询需通过外部渠道（微信、电话）完成，导致用户流失和服务体验断裂。

基于 WebSocket 的实时消息系统将打通用户-商家-导游三方沟通链路，实现消息即时送达、在线状态感知、已读回执等核心能力，为后续客服系统、订单通知、社区互动奠定技术基座。

### 1.2 目标

| 目标 | 指标 | 说明 |
|------|------|------|
| 消息送达率 | >99.5% | WebSocket在线直送 + 离线消息队列兜底 |
| 消息延迟 | <200ms | 同Region用户间端到端延迟 |
| 商家首次响应时长 | <5min | 商家收到咨询后平均首次回复时间 |
| 用户咨询转化率 | >15% | 发起咨询后最终下单的用户占比 |
| 在线状态准确率 | >95% | 在线/离线状态与实际一致的比例 |

### 1.3 范围

| 范围 | v1 (Sprint E1) | v2 (规划中) |
|------|----------------|-------------|
| 1v1私聊 | TEXT + IMAGE + SYSTEM消息 | 语音消息、视频通话 |
| 商家咨询 | MERCHANT_INQUIRY聊天室 | 智能客服机器人分流 |
| 导游咨询 | GUIDE_CHAT聊天室 | 导游评分+匹配推荐 |
| 在线状态 | ONLINE/OFFLINE/AWAY | 自定义状态文案 |
| 已读回执 | 单聊已读标记 | 群聊已读人数 |
| 消息搜索 | — | 全文搜索+按类型筛选 |
| 消息撤回 | — | 2分钟内撤回 |
| 群聊 | — | 行程同伴群、朝圣团群 |
| 文件传输 | — | PDF行程单、合同文件 |
| 消息加密 | — | 端到端加密 |

---

## 2. 竞品对标分析

### 2.1 竞品功能矩阵

| 功能点 | Booking.com Messages | Airbnb Inbox | Trip.com 客服 | WhatsApp | JOINUS目标 |
|--------|---------------------|--------------|---------------|----------|------------|
| 1v1文字消息 | ✅ | ✅ | ✅ | ✅ | ✅ v1 |
| 图片消息 | ✅ | ✅ | ✅ | ✅ | ✅ v1 |
| 系统通知消息 | ✅ 预订确认/变更 | ✅ 预订/评价提醒 | ✅ 订单状态推送 | ❌ | ✅ v1 |
| 在线状态 | ❌ | ❌ | ✅ 客服在线 | ✅ | ✅ v1 |
| 已读回执 | ❌ | ❌ | ❌ | ✅ 双勾 | ✅ v1 |
| 实时输入提示 | ❌ | ❌ | ✅ | ✅ | ✅ v1 |
| 商家咨询入口 | ✅ 酒店详情页 | ✅ 房源详情页 | ✅ 在线客服浮窗 | N/A | ✅ v1 |
| 消息搜索 | ❌ | ✅ | ❌ | ✅ | v2 |
| 消息撤回 | ❌ | ❌ | ❌ | ✅ | v2 |
| 语音消息 | ❌ | ❌ | ❌ | ✅ | v2 |
| 快捷回复模板 | ✅ 商家端 | ✅ 房东端 | ✅ 客服端 | ❌ | v2 |

### 2.2 竞品亮点吸收

**Booking.com Messages:**
- 预订关联消息: 每条对话自动关联预订单号，上下文清晰
- 商家端仪表盘: 未回复消息数、平均响应时长统计
- JOINUS吸收: 聊天室自动关联行程/订单，Admin后台显示响应指标

**Airbnb Inbox:**
- 对话分类: 所有消息 / 预订相关 / 星标
- 翻译功能: 自动检测语言并提供翻译按钮
- JOINUS吸收: 聊天室列表支持按类型筛选，未来接入多语言翻译

**Trip.com Customer Service:**
- 智能分流: 先机器人问答，无法解决再转人工
- 浮窗入口: 全站右下角客服入口，不跳转页面
- JOINUS吸收: v2接入小鸿AI自动应答，v1先提供全站消息入口

**WhatsApp:**
- 极致实时: 打字中提示、双勾已读、在线状态
- 消息类型丰富: 文字/图片/语音/视频/文件/位置
- JOINUS吸收: v1实现typing指示器+已读回执+在线状态，v2扩展消息类型

---

## 3. 消息类型定义

### 3.1 消息类型枚举

```typescript
enum MessageType {
  TEXT = 'TEXT',           // 文字消息
  IMAGE = 'IMAGE',        // 图片消息 (content存URL)
  SYSTEM = 'SYSTEM',      // 系统消息 (订单通知、预订确认等)
}
```

### 3.2 消息内容结构

| 类型 | content字段格式 | 示例 |
|------|----------------|------|
| TEXT | 纯文本字符串 | `"请问这个行程包含住宿吗？"` |
| IMAGE | JSON: `{ url, width, height, thumbnail }` | `{"url":"https://...","width":800,"height":600,"thumbnail":"https://..."}` |
| SYSTEM | JSON: `{ action, title, body, meta }` | `{"action":"ORDER_CONFIRMED","title":"订单已确认","body":"您的峨眉山朝圣行程已确认","meta":{"orderId":"xxx"}}` |

### 3.3 系统消息触发场景

| 触发事件 | action | 目标聊天室 | 说明 |
|----------|--------|-----------|------|
| 行程状态变更 | TRIP_STATUS_CHANGED | 用户-商家聊天室 | 行程从SUBMITTED变为CONFIRMED等 |
| 订单支付成功 | ORDER_PAID | 用户-商家聊天室 | 支付完成自动通知商家 |
| 订单取消 | ORDER_CANCELLED | 用户-商家聊天室 | 取消订单通知对方 |
| 导游分配 | GUIDE_ASSIGNED | 用户-导游聊天室 | 自动创建导游咨询聊天室 |
| 出行提醒 | TRIP_REMINDER | 用户-商家聊天室 | 出行前24h自动提醒 |

---

## 4. 聊天室类型定义

### 4.1 聊天室类型枚举

```typescript
enum ChatRoomType {
  PRIVATE = 'PRIVATE',                 // 1v1私聊 (用户间)
  MERCHANT_INQUIRY = 'MERCHANT_INQUIRY', // 商家咨询 (用户→商家)
  GUIDE_CHAT = 'GUIDE_CHAT',           // 导游咨询 (用户→导游)
}
```

### 4.2 聊天室特性对比

| 特性 | PRIVATE | MERCHANT_INQUIRY | GUIDE_CHAT |
|------|---------|-----------------|------------|
| 参与人数 | 2人 | 2人 (用户+商家) | 2人 (用户+导游) |
| 创建方 | 任意用户 | 用户从商家详情页发起 | 系统自动创建/用户发起 |
| 关联实体 | 无 | 商家ID (merchantId) | 导游ID (guideId)、行程ID (tripId) |
| Admin可见 | 否 | 是 (商家端后台) | 是 (导游管理) |
| 系统消息 | 否 | 是 (订单通知) | 是 (行程通知) |
| 自动关闭 | 否 | 行程完成后30天 | 行程完成后7天 |

---

## 5. 在线状态系统

### 5.1 状态枚举

```typescript
enum PresenceStatus {
  ONLINE = 'ONLINE',   // 在线 — WebSocket连接中
  OFFLINE = 'OFFLINE', // 离线 — 无活跃连接
  AWAY = 'AWAY',       // 离开 — 连接存在但超过5分钟无操作
}
```

### 5.2 技术方案: Redis SET + TTL

```
实现方案:
1. 用户建立WebSocket连接 → SADD presence:online <userId>, SET presence:user:<userId> ONLINE EX 300
2. 用户发送心跳(每60s) → EXPIRE presence:user:<userId> 300 (续期TTL)
3. 用户5分钟无操作 → SET presence:user:<userId> AWAY EX 600
4. 用户断开连接 → SREM presence:online <userId>, DEL presence:user:<userId>
5. TTL自然过期 → 自动变为OFFLINE (兜底机制，防止异常断连)

查询接口:
- 批量查询在线状态: MGET presence:user:<userId1> presence:user:<userId2> ...
- 获取所有在线用户: SMEMBERS presence:online
```

### 5.3 状态变更广播

当用户状态变更时，通过WebSocket向该用户所有聊天室的参与者广播 `presence_changed` 事件。为避免广播风暴，采用以下策略:
- 同一用户状态变更最小间隔: 5秒 (防抖)
- 仅向最近7天有消息的聊天室广播
- OFFLINE状态延迟30秒广播 (防止短暂断连抖动)

---

## 6. 数据模型

### 6.1 Prisma Schema

```prisma
// ===== 聊天室 =====
model ChatRoom {
  id           String            @id @default(cuid())
  type         ChatRoomType      @default(PRIVATE)
  name         String?           // 聊天室名称 (商家咨询自动填商家名)
  merchantId   String?           // MERCHANT_INQUIRY时关联商家
  guideId      String?           // GUIDE_CHAT时关联导游
  tripId       String?           // 关联行程 (可选)
  isActive     Boolean           @default(true)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  participants ChatParticipant[]
  messages     ChatMessage[]

  @@index([type])
  @@index([merchantId])
  @@index([guideId])
  @@map("chat_rooms")
}

// ===== 聊天参与者 =====
model ChatParticipant {
  id         String   @id @default(cuid())
  roomId     String
  userId     String
  role       String   @default("MEMBER") // MEMBER | MERCHANT | GUIDE | SYSTEM
  lastReadAt DateTime @default(now())
  joinedAt   DateTime @default(now())
  isActive   Boolean  @default(true)     // 软删除，退出聊天室

  room ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([roomId, userId])
  @@index([userId])
  @@index([roomId])
  @@map("chat_participants")
}

// ===== 聊天消息 =====
model ChatMessage {
  id        String      @id @default(cuid())
  roomId    String
  senderId  String      // 发送者userId，系统消息用 "SYSTEM"
  type      MessageType @default(TEXT)
  content   String      // 文本内容 或 JSON (IMAGE/SYSTEM)
  isDeleted Boolean     @default(false)  // 软删除
  createdAt DateTime    @default(now())

  room ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([roomId, createdAt])
  @@index([senderId])
  @@map("chat_messages")
}

// ===== 枚举 =====
enum ChatRoomType {
  PRIVATE
  MERCHANT_INQUIRY
  GUIDE_CHAT
}

enum MessageType {
  TEXT
  IMAGE
  SYSTEM
}
```

### 6.2 ER关系图

```
User 1──N ChatParticipant N──1 ChatRoom 1──N ChatMessage
                                    │
                                    ├── merchantId? → Merchant
                                    ├── guideId?    → Guide
                                    └── tripId?     → Trip
```

---

## 7. WebSocket事件定义

### 7.1 技术选型

- 框架: `@nestjs/websockets` + `socket.io` (兼容性好，支持房间、命名空间、自动重连)
- 命名空间: `/chat`
- 认证: 连接时通过 `auth.token` 传递JWT，Gateway中校验

### 7.2 客户端 → 服务端事件

| 事件名 | Payload | 说明 |
|--------|---------|------|
| `join_room` | `{ roomId: string }` | 加入聊天室 (订阅消息推送) |
| `leave_room` | `{ roomId: string }` | 离开聊天室 (取消订阅) |
| `send_message` | `{ roomId: string, type: MessageType, content: string }` | 发送消息 |
| `typing` | `{ roomId: string, isTyping: boolean }` | 输入状态 |
| `read_receipt` | `{ roomId: string, messageId: string }` | 已读回执 (标记到该消息) |
| `heartbeat` | `{}` | 心跳保活 (每60秒) |

### 7.3 服务端 → 客户端事件

| 事件名 | Payload | 说明 |
|--------|---------|------|
| `message_received` | `{ id, roomId, senderId, senderName, senderAvatar, type, content, createdAt }` | 新消息推送 |
| `typing_indicator` | `{ roomId, userId, userName, isTyping }` | 对方输入状态 |
| `read_receipt_update` | `{ roomId, userId, lastReadAt, messageId }` | 对方已读更新 |
| `presence_changed` | `{ userId, status: PresenceStatus }` | 在线状态变更 |
| `room_updated` | `{ roomId, lastMessage, unreadCount }` | 聊天室列表更新 |
| `error` | `{ code: string, message: string }` | 错误通知 |

### 7.4 消息发送流程

```
1. 客户端 emit('send_message', { roomId, type, content })
2. Gateway 校验JWT → 校验用户是否为聊天室参与者
3. Service 写入 ChatMessage 到数据库
4. Service 更新 ChatRoom.updatedAt
5. Gateway 向 roomId 房间广播 'message_received' (排除发送者)
6. Gateway 向发送者回复 'message_received' (含服务端生成的id和createdAt)
7. 若有离线参与者 → 写入推送队列 (v2: 推送通知)
```

---

## 8. REST API端点

### 8.1 端点清单

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/chat/rooms` | 获取当前用户的聊天室列表 | JWT |
| POST | `/api/chat/rooms` | 创建聊天室 | JWT |
| GET | `/api/chat/rooms/:id` | 获取聊天室详情 (含参与者) | JWT |
| GET | `/api/chat/rooms/:id/messages` | 获取聊天室消息列表 (分页) | JWT |
| POST | `/api/chat/rooms/:id/read` | 标记聊天室已读 | JWT |
| GET | `/api/chat/unread-count` | 获取总未读消息数 | JWT |

### 8.2 接口详细设计

#### GET /api/chat/rooms

获取当前用户参与的所有聊天室列表，按最后消息时间倒序。

**Query参数:**
| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| type | ChatRoomType | 否 | — | 按类型筛选 |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 (max: 50) |

**Response 200:**
```json
{
  "items": [
    {
      "id": "clxxx...",
      "type": "MERCHANT_INQUIRY",
      "name": "峨眉山金顶寺",
      "participants": [
        { "userId": "u1", "name": "张三", "avatar": "https://...", "role": "MEMBER" },
        { "userId": "u2", "name": "金顶寺客服", "avatar": "https://...", "role": "MERCHANT" }
      ],
      "lastMessage": {
        "id": "msg1",
        "type": "TEXT",
        "content": "请问包含素斋吗？",
        "senderName": "张三",
        "createdAt": "2026-03-29T10:30:00Z"
      },
      "unreadCount": 2,
      "updatedAt": "2026-03-29T10:30:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

#### POST /api/chat/rooms

创建新聊天室。

**Request Body:**
```json
{
  "type": "MERCHANT_INQUIRY",
  "participantIds": ["userId-of-merchant"],
  "merchantId": "merchant-id",
  "name": "峨眉山金顶寺咨询",
  "tripId": "trip-id (可选)"
}
```

**业务规则:**
- PRIVATE: 必须提供1个participantId (对方)，同一对用户只能有1个PRIVATE聊天室
- MERCHANT_INQUIRY: 必须提供merchantId，同一用户对同一商家只能有1个活跃聊天室
- GUIDE_CHAT: 必须提供guideId，可关联tripId

**Response 201:** 返回创建的ChatRoom对象

#### GET /api/chat/rooms/:id/messages

获取聊天室消息列表，按时间倒序分页 (用于上拉加载历史消息)。

**Query参数:**
| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| cursor | string | 否 | — | 游标 (上一页最后一条消息的id) |
| limit | number | 否 | 30 | 每页数量 (max: 100) |

**Response 200:**
```json
{
  "items": [
    {
      "id": "msg-xxx",
      "roomId": "room-xxx",
      "senderId": "user-xxx",
      "senderName": "张三",
      "senderAvatar": "https://...",
      "type": "TEXT",
      "content": "你好，想咨询一下行程",
      "createdAt": "2026-03-29T10:00:00Z",
      "isDeleted": false
    }
  ],
  "nextCursor": "msg-yyy",
  "hasMore": true
}
```

**说明:** 消息列表使用游标分页 (cursor-based pagination) 而非页码分页，避免新消息插入导致的数据偏移问题。

#### POST /api/chat/rooms/:id/read

标记聊天室已读，更新当前用户的 `lastReadAt` 为当前时间。

**Response 200:**
```json
{
  "roomId": "room-xxx",
  "lastReadAt": "2026-03-29T10:35:00Z"
}
```

#### GET /api/chat/unread-count

获取当前用户所有聊天室的总未读消息数 (用于导航栏Badge)。

**Response 200:**
```json
{
  "totalUnread": 7,
  "rooms": [
    { "roomId": "room-xxx", "unread": 3 },
    { "roomId": "room-yyy", "unread": 4 }
  ]
}
```

---

## 9. 技术架构

### 9.1 架构图

```
┌─────────┐  ┌─────────┐  ┌──────────────┐
│   Web   │  │ Mobile  │  │  MiniProgram │
│ (Next)  │  │ (Expo)  │  │   (Taro)     │
└────┬────┘  └────┬────┘  └──────┬───────┘
     │            │               │
     └────────────┼───────────────┘
                  │ WebSocket (socket.io) + REST
                  ▼
         ┌────────────────┐
         │  NestJS Gateway │ ← JWT认证
         │  /chat namespace │
         └───────┬────────┘
                 │
         ┌───────┴────────┐
         │  ChatService    │
         │  PresenceService│
         └───────┬────────┘
                 │
          ┌──────┴──────┐
          │             │
     ┌────▼────┐  ┌────▼────┐
     │PostgreSQL│  │  Redis  │
     │ Messages │  │Presence │
     │ Rooms    │  │Pub/Sub  │
     └─────────┘  └─────────┘
```

### 9.2 NestJS模块结构

```
services/api/src/modules/chat/
├── chat.module.ts           # 模块定义
├── chat.gateway.ts          # WebSocket Gateway (@WebSocketGateway)
├── chat.controller.ts       # REST Controller
├── chat.service.ts          # 消息+聊天室业务逻辑
├── presence.service.ts      # 在线状态管理 (Redis)
├── dto/
│   ├── create-room.dto.ts
│   ├── send-message.dto.ts
│   └── query-messages.dto.ts
└── guards/
    └── ws-auth.guard.ts     # WebSocket JWT校验
```

### 9.3 关键依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| @nestjs/websockets | ^11.x | WebSocket支持 |
| @nestjs/platform-socket.io | ^11.x | Socket.IO适配器 |
| socket.io | ^4.x | WebSocket库 |
| socket.io-client | ^4.x | 前端SDK |
| @socket.io/redis-adapter | ^8.x | 多实例Redis适配 (v2水平扩展) |

---

## 10. 安全设计

### 10.1 认证与授权

| 安全措施 | 实现方式 |
|----------|---------|
| WebSocket认证 | 连接握手时校验 `auth.token` (JWT)，无效token拒绝连接 |
| 聊天室权限 | 只有ChatParticipant中的用户可加入/发送/读取消息 |
| IDOR防护 | 所有操作校验当前用户是否为聊天室参与者 |
| 消息频率限制 | 每用户每秒最多5条消息，超出返回 `RATE_LIMITED` 错误 |
| 内容校验 | TEXT消息最大5000字符，IMAGE必须为合法URL |
| XSS防护 | 前端渲染消息内容时HTML转义，禁止dangerouslySetInnerHTML |

### 10.2 数据安全

- 消息存储不加密 (v1)，v2评估端到端加密需求
- 软删除: `isDeleted=true` 后前端显示"该消息已删除"
- 聊天室关闭后消息保留90天，之后归档到冷存储

---

## 11. 性能设计

| 场景 | 方案 |
|------|------|
| 消息写入 | 异步写入数据库，先通过WebSocket推送再落库 |
| 消息列表加载 | 游标分页 + 数据库索引 `[roomId, createdAt]` |
| 聊天室列表 | 缓存最后一条消息在Redis，减少JOIN查询 |
| 在线状态查询 | Redis MGET批量查询，缓存5秒 |
| 未读数计算 | 基于 `lastReadAt` 与消息 `createdAt` 比较，走索引 |
| 连接管理 | 心跳60秒，超时300秒断开，客户端自动重连 |

---

## 12. 验收标准

### 12.1 功能验收

| 编号 | 验收项 | 验收条件 |
|------|--------|---------|
| AC-01 | 创建聊天室 | 可创建PRIVATE/MERCHANT_INQUIRY/GUIDE_CHAT三种类型聊天室 |
| AC-02 | 发送文字消息 | 发送后200ms内对方收到，消息持久化到数据库 |
| AC-03 | 发送图片消息 | 图片URL有效，缩略图正确渲染，点击可查看大图 |
| AC-04 | 系统消息 | 行程状态变更/订单支付时自动发送系统消息到关联聊天室 |
| AC-05 | 聊天室列表 | 按最后消息时间倒序，显示未读数Badge，最后一条消息预览 |
| AC-06 | 消息历史 | 上拉加载历史消息，游标分页正确，无重复/遗漏 |
| AC-07 | 在线状态 | 用户上线/离线/离开状态正确显示绿/灰/黄点 |
| AC-08 | 已读回执 | 进入聊天室自动标记已读，对方看到已读状态更新 |
| AC-09 | 输入提示 | 对方正在输入时显示"正在输入..."，停止3秒后消失 |
| AC-10 | 未读总数 | 导航栏消息图标显示正确的总未读数Badge |
| AC-11 | 断线重连 | WebSocket断开后自动重连，重连后拉取离线期间消息 |
| AC-12 | 权限校验 | 非聊天室成员无法加入/发送/读取消息，返回403 |

### 12.2 非功能验收

| 编号 | 验收项 | 验收条件 |
|------|--------|---------|
| NF-01 | 消息延迟 | 同Region端到端 < 200ms (P95) |
| NF-02 | 并发连接 | 单实例支持1000个WebSocket并发连接 |
| NF-03 | 消息频率 | 频率限制生效，超出返回错误而非静默丢弃 |
| NF-04 | 数据完整性 | 消息不丢失、不重复、顺序正确 |

---

## 13. 里程碑计划

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| E1-W1 | 第1周 | Prisma Schema + ChatModule + Gateway骨架 + REST端点 |
| E1-W2 | 第2周 | WebSocket事件实现 + 在线状态(Redis) + 已读回执 |
| E1-W3 | 第3周 | Web消息中心页面(P27) + 商家咨询入口(P28) |
| E1-W4 | 第4周 | Mobile/MiniProgram适配 + 联调测试 + 上线 |

---

## 14. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| WebSocket连接不稳定 | 消息丢失 | 客户端自动重连 + 离线消息队列 + REST兜底拉取 |
| 消息顺序错乱 | 用户体验差 | 服务端生成createdAt + 客户端按时间排序 |
| Redis宕机 | 在线状态不可用 | 降级为"全部显示离线" + Redis哨兵高可用 |
| 消息量暴增 | 数据库压力 | 消息表按月分区 + 冷热数据分离 |
| 小程序WebSocket限制 | 微信不支持socket.io | Taro端使用原生WebSocket + 自定义协议适配层 |
