# M20-PRD-会员体系

> 模块主PRD | Sprint C2 | 版本 v1.0 | 2026-03-29
> 状态: 待评审 | 负责人: CEO

---

## 一、竞品对标分析

### 1.1 对标竞品

| 竞品 | 会员体系亮点 | 可借鉴功能 |
|------|------------|-----------|
| **AmEx Travel** | Platinum/Gold双轨制，高端定位，专属礼宾服务，积分转换灵活 | 分级特权体系、VIP专属服务、品质感设计 |
| **Booking.com Genius** | 三级Genius(1/2/3)，累计订单数解锁，折扣直接抵扣 | 等级清晰、折扣即时可见、进度激励 |
| **Agoda VIP** | 消费金额分级，Asia Miles积分互通，生日礼遇，闪购优先 | 积分通兑、节日福利、移动端优先体验 |
| **Trip.com** | 会员积分+星级，套餐专属价，银/金/铂/钻四级，签到 | 签到体系、套餐专属价、多维度积分获取 |
| **美团** | 成长值+积分双轨，连续签到奖励，生日特权，会员专区 | 签到日历、连续奖励、成长值可视化 |

### 1.2 JOINUS差异化护城河

- **宗教文化深度**: 会员等级与修行境界挂钩（新手→行者→守护→导师→觉悟），符合宗教朝圣语境
- **精神激励叠加**: 积分不仅是金钱奖励，更是修行成就的象征
- **社区归属感**: 高等级会员成为"觉悟大师"，获得平台认证标识，具有社区影响力

---

## 二、用户故事

### 核心用户故事

```
US-M20-01 [P0]
作为 新注册用户
我希望 看到会员等级体系和升级路径
以便   了解参与平台活动的长期价值

US-M20-02 [P0]
作为 已注册会员
我希望 通过消费、写评价、签到等行为获得积分
以便   逐步提升会员等级，解锁更多特权

US-M20-03 [P0]
作为 Lv3及以上会员
我希望 享受早鸟价优先购买权
以便   以更低价格预订心仪套餐

US-M20-04 [P1]
作为 Lv5觉悟大师
我希望 获得专属行程定制服务和VIP标识
以便   体现我在平台的高价值贡献者身份

US-M20-05 [P1]
作为 任意等级会员
我希望 用积分兑换优惠券或行程折扣
以便   将积累的积分转化为实际优惠

US-M20-06 [P2]
作为 会员
我希望 通过邀请好友注册获得积分奖励
以便   扩大平台社区规模并获得回报
```

---

## 三、功能清单

### 3.1 P0 核心功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-M20-01 | 会员等级体系 | 5级制度，积分驱动升级，等级自动计算 |
| F-M20-02 | 积分获取 | 消费/评价/游记/签到/邀请5类积分来源 |
| F-M20-03 | 积分明细 | 完整的积分流水记录，含来源和描述 |
| F-M20-04 | 等级特权展示 | 各等级特权清单，清晰可见 |
| F-M20-05 | 每日签到 | 签到+5分，连续签到额外奖励（详见F09） |
| F-M20-06 | 我的会员中心 | 会员信息聚合页（详见P17） |

### 3.2 P1 重要功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-M20-07 | 积分兑换 | 积分换优惠券/行程折扣，兑换记录 |
| F-M20-08 | 等级进度条 | 可视化显示距下一级所需积分 |
| F-M20-09 | 专属客服入口 | Lv2+会员专属客服通道 |
| F-M20-10 | 早鸟价优先 | Lv3+会员套餐发布前24h优先购买窗口 |
| F-M20-11 | 免费升级特权 | Lv4+预订时自动触发住宿或行程升级 |

### 3.3 P2 扩展功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-M20-12 | 邀请好友 | 生成专属邀请码，好友首单后双方各得积分 |
| F-M20-13 | VIP专属行程 | Lv5可预订仅限觉悟大师的定制朝圣行程 |
| F-M20-14 | 会员标识 | Lv5在社区/评价/游记中显示VIP徽章 |
| F-M20-15 | 积分到期提醒 | 30天前推送积分过期提醒（如启用积分有效期） |

---

## 四、会员等级体系

### 4.1 等级定义

| 等级 | 名称 | 所需总积分 | 象征颜色 | 图标 |
|------|------|-----------|---------|------|
| Lv1 | 朝圣新手 | 0 分 | 灰色 #9CA3AF | 莲花苞 |
| Lv2 | 虔诚行者 | 1,000 分 | 绿色 #10B981 | 半开莲花 |
| Lv3 | 法门守护 | 5,000 分 | 蓝色 #3B82F6 | 全开莲花 |
| Lv4 | 圣地导师 | 20,000 分 | 紫色 #8B5CF6 | 金刚杵 |
| Lv5 | 觉悟大师 | 50,000 分 | 金色 #D4A855 | 法轮 |

### 4.2 积分获取规则

| 行为 | 积分 | 来源类型 | 限制 |
|------|------|---------|------|
| 消费订单 | 1元 = 1分 | ORDER | 无上限，实际支付金额计算 |
| 发布游记攻略 | 50分/篇 | GUIDE | 每日最多3篇 |
| 发布景点评价 | 20分/条 | REVIEW | 每个景点限1次 |
| 每日签到 | 5分/天 | CHECKIN | 每日1次，连续奖励另计 |
| 邀请好友 | 200分/人 | INVITE | 好友首单完成后结算 |

### 4.3 积分消耗规则

| 兑换物 | 所需积分 | 兑换值 |
|--------|---------|--------|
| ¥10优惠券 | 500分 | 1% 消耗率 |
| ¥50优惠券 | 2,000分 | 2.5% 折换率 |
| ¥100优惠券 | 3,500分 | 2.86% 折换率 |
| 行程8折码 | 1,000分 | 限单次使用 |
| 行程9折码 | 400分 | 限单次使用 |

### 4.4 等级特权矩阵

| 特权 | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|------|-----|-----|-----|-----|-----|
| 积分获取 | 标准 | 标准 | 1.2倍 | 1.5倍 | 2倍 |
| 每日签到 | 5分 | 5分 | 8分 | 10分 | 15分 |
| 专属客服 | - | ✓ | ✓ | ✓ | ✓ |
| 早鸟价优先 | - | - | ✓ | ✓ | ✓ |
| 免费升级 | - | - | - | ✓ | ✓ |
| VIP行程 | - | - | - | - | ✓ |
| VIP标识 | - | - | - | - | ✓ |
| 生日双倍积分 | - | - | ✓ | ✓ | ✓ |

---

## 五、数据模型

### 5.1 Prisma Schema

```prisma
model Membership {
  id              String   @id @default(cuid())
  userId          String   @unique
  level           Int      @default(1)           // 1-5
  levelName       String   @default("朝圣新手")
  totalPoints     Int      @default(0)            // 累计总积分（含已消耗）
  availablePoints Int      @default(0)            // 当前可用积分
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  transactions    PointsTransaction[]

  @@map("memberships")
}

model PointsTransaction {
  id           String                    @id @default(cuid())
  membershipId String
  type         PointsTransactionType     // EARN | SPEND
  amount       Int                       // 积分数量（正数）
  source       PointsSource              // 来源类型
  sourceId     String?                   // 来源记录ID（订单ID/评价ID等）
  description  String                    // 描述文字，如"完成订单#ORD-123"
  createdAt    DateTime @default(now())

  membership   Membership @relation(fields: [membershipId], references: [id])

  @@index([membershipId, createdAt])
  @@map("points_transactions")
}

enum PointsTransactionType {
  EARN
  SPEND
}

enum PointsSource {
  ORDER       // 消费订单
  GUIDE       // 发布游记
  REVIEW      // 发布评价
  CHECKIN     // 每日签到
  INVITE      // 邀请好友
  REDEEM      // 积分兑换（消耗）
  ADMIN       // 管理员手动调整
  BONUS       // 活动奖励
}
```

### 5.2 等级升级逻辑（后端Service）

```typescript
const LEVEL_THRESHOLDS = [0, 1000, 5000, 20000, 50000];
const LEVEL_NAMES = ['朝圣新手', '虔诚行者', '法门守护', '圣地导师', '觉悟大师'];

function calculateLevel(totalPoints: number): { level: number; levelName: string } {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return { level, levelName: LEVEL_NAMES[level - 1] };
}
```

---

## 六、API契约

### 6.1 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/membership/me | 获取我的会员信息 | 必须 |
| GET | /api/membership/transactions | 积分流水列表（分页） | 必须 |
| POST | /api/membership/checkin | 每日签到 | 必须 |
| GET | /api/membership/checkin-calendar | 本月签到日历 | 必须 |
| POST | /api/membership/redeem | 兑换积分 | 必须 |
| GET | /api/membership/redeem-catalog | 兑换商品目录 | 必须 |

### 6.2 GET /api/membership/me

**响应体:**
```json
{
  "id": "clxxx",
  "userId": "clyyy",
  "level": 3,
  "levelName": "法门守护",
  "totalPoints": 6800,
  "availablePoints": 5300,
  "nextLevel": {
    "level": 4,
    "levelName": "圣地导师",
    "requiredPoints": 20000,
    "remainingPoints": 13200,
    "progressPercent": 11.3
  },
  "perks": [
    "专属客服",
    "早鸟价优先",
    "1.2倍积分"
  ],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2026-03-29T10:00:00Z"
}
```

### 6.3 GET /api/membership/transactions

**查询参数:**
```
page: number (default: 1)
pageSize: number (default: 20, max: 50)
type: EARN | SPEND (可选筛选)
source: PointsSource (可选筛选)
```

**响应体:**
```json
{
  "items": [
    {
      "id": "clzzz",
      "type": "EARN",
      "amount": 200,
      "source": "ORDER",
      "sourceId": "clord123",
      "description": "完成订单 #ORD-2026-001，消费¥200",
      "createdAt": "2026-03-28T14:00:00Z"
    }
  ],
  "total": 85,
  "page": 1,
  "pageSize": 20
}
```

### 6.4 POST /api/membership/checkin

**响应体（成功）:**
```json
{
  "success": true,
  "pointsEarned": 5,
  "streakDays": 3,
  "bonusPoints": 0,
  "message": "签到成功！获得5积分",
  "totalAvailablePoints": 5305
}
```

**响应体（已签到）:**
```json
{
  "statusCode": 400,
  "message": "今日已签到，请明天再来",
  "error": "Bad Request"
}
```

### 6.5 POST /api/membership/redeem

**请求体:**
```json
{
  "redeemItemId": "coupon_10",
  "quantity": 1
}
```

**响应体:**
```json
{
  "success": true,
  "pointsSpent": 500,
  "remainingPoints": 4800,
  "couponCode": "REDEEM-XXXX-XXXX",
  "expireAt": "2026-06-29T23:59:59Z"
}
```

---

## 七、页面线框（ASCII）

```
会员中心页（P17详细设计见 P17-PRD-会员中心页.md）

┌─────────────────────────────────────────┐
│  ← 返回    我的会员                      │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  [法轮图标] 觉悟大师 Lv5           │  │
│  │  用户名: 张三                      │  │
│  │  可用积分: 12,300                  │  │
│  │  ████████████████████░░░░ 78%     │  │
│  │  距Lv5还需: 已满级                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [签到+5] [积分兑换] [邀请好友]          │
│                                         │
│  ─── 我的特权 ───────────────────────   │
│  ✓ 专属客服  ✓ 早鸟优先  ✓ VIP行程     │
│  ✓ 免费升级  ✓ 2倍积分  ✓ VIP标识     │
│                                         │
│  ─── 等级对比 ──────────────────────   │
│  [Lv1] [Lv2] [Lv3] [Lv4] [Lv5●]       │
│                                         │
│  ─── 积分明细 ──────────────────────   │
│  ● +200  完成订单#001       03-28      │
│  ● +50   发布游记《峨眉山》  03-27      │
│  ● -500  兑换¥10优惠券      03-25      │
│  ● +5    每日签到            03-24      │
└─────────────────────────────────────────┘
```

---

## 八、验收标准

### 8.1 功能验收

- [ ] F-M20-01: 5个等级均可正常展示，积分门槛准确
- [ ] F-M20-02: 下单支付后积分自动到账，金额精确到元
- [ ] F-M20-02: 发布评价后20分即时到账，同一景点不重复计分
- [ ] F-M20-02: 发布游记后50分即时到账，日限3篇生效
- [ ] F-M20-03: 积分流水分页正常，筛选条件生效
- [ ] F-M20-04: 各等级特权展示完整，与矩阵一致
- [ ] F-M20-05: 签到每日一次，重复签到返回400
- [ ] F-M20-07: 积分兑换扣减可用积分，生成有效优惠券

### 8.2 等级升级验收

- [ ] totalPoints达到门槛后level和levelName自动更新
- [ ] 降级场景不存在（总积分只增不减）
- [ ] 等级升级时触发通知（站内消息/Push）

### 8.3 性能验收

- [ ] GET /membership/me 响应时间 < 200ms
- [ ] 积分流水列表翻页 < 500ms
- [ ] 积分到账异步处理，不阻塞主业务流程

### 8.4 边界验收

- [ ] 可用积分不足时兑换操作返回422
- [ ] 并发签到场景下不重复计分（幂等性）
- [ ] 积分计算精度：元整数，分位四舍五入

---

## 九、技术约束

```
[TC-M20-01] Membership表每User唯一（@unique约束），首次登录自动创建Lv1记录
[TC-M20-02] 积分变更必须先写PointsTransaction再更新Membership，使用Prisma事务
[TC-M20-03] 积分计算服务抽离为独立MembershipService，不耦合OrderModule
[TC-M20-04] 每日签到用Redis实现幂等锁，key: checkin:{userId}:{YYYY-MM-DD}，TTL至当日24:00
[TC-M20-05] 等级倍率积分（Lv3 1.2x等）在积分入账时一次性计算，明细中注明基础+倍率分
[TC-M20-06] 遵守 [R-64] findMany必须有take参数，积分流水max 50
[TC-M20-07] Controller遵守 [R-63] JwtAuthGuard保护，全部端点需认证
```

---

## 十、开发排期

| 阶段 | 任务 | 预估 |
|------|------|------|
| 后端 | Prisma Schema + Migration | 0.5天 |
| 后端 | MembershipService（积分逻辑） | 1天 |
| 后端 | MembershipController（6端点） | 0.5天 |
| 后端 | 签到幂等Redis集成 | 0.5天 |
| 前端 | 会员中心页P17 | 1天 |
| 前端 | 积分兑换弹窗 | 0.5天 |
| 测试 | 边界/并发/等级升级测试 | 0.5天 |
| **合计** | | **4.5天** |

---

*PRD版本: v1.0 | 创建: 2026-03-29 | 下一步: 技术评审 → 排期 → P17/F09子PRD*
