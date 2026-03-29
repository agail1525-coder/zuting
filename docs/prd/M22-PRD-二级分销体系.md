# M22-PRD-二级分销体系

> 版本: v1.0 | 创建日期: 2026-03-29 | 状态: 待评审
> 模块类型: 主模块PRD | 所属平台: Web + Mobile + 小程序

---

## 一、竞品对标分析

### 1.1 竞品功能矩阵

| 竞品 | 核心分销机制 | 返佣形式 | 层级限制 | 合规做法 |
|------|-------------|---------|---------|---------|
| 拼多多 | 砍一刀+分享裂变+二级返佣 | 现金/优惠 | 二级 | 合法推荐制 |
| 美团 | 推荐有礼+新用户首单返佣 | 红包/积分 | 一级为主 | 首单限定 |
| 云集 | 二级分销+团队奖励 | 现金佣金 | 严格二级 | 持牌经营 |
| 花生日记 | 二级分销+销售排行 | 积分+优惠 | 二级 | 积分制 |
| Trip.com | 邀请好友旅行得积分 | 积分奖励 | 一级 | 积分只兑换 |

### 1.2 竞品优势学习点

- **拼多多**: 裂变分享海报设计、邀请码玩法、推广数据实时展示
- **美团**: 下线首单触发机制，降低合规风险
- **云集/花生日记**: 分销中心页面设计，团队层级可视化展示
- **Trip.com**: 旅行场景邀请话术，积分制返佣完全合规

### 1.3 差异化定位

JOINUS.COM 分销体系 = 旅行场景下的宗教文化传播裂变 + 积分制返佣(合规) + 最多二级(安全)

---

## 二、用户故事

### 2.1 核心用户故事

```
作为一名热爱朝圣旅行的用户(A)，
我希望能分享我的专属邀请码给朋友，
当他们通过我的邀请注册并完成订单时，
我能获得积分奖励，用于兑换旅行优惠。

验收标准:
  - A能在"分销中心"看到自己的专属邀请码和二维码
  - A能一键生成并分享邀请海报至微信/朋友圈
  - B通过A的邀请链接注册后，A能看到B出现在"我的团队"
  - B完成订单支付后，A收到积分返佣通知
  - A能在分销中心查看所有返佣明细
```

```
作为B(被邀请用户，A的一级下线)，
我希望我邀请的C也能帮A获得积分，
这样形成一种自然的分享文化链条。

验收标准:
  - C注册后，B在团队中看到C(一级下线)
  - C下单后，B获得一级返佣(5%)，A获得二级返佣(2%)
  - 系统确保A-B-C链条正确，不超过二级
```

```
作为平台运营者，
我希望分销行为完全合规，
不触发传销认定，保护平台安全。

验收标准:
  - 严格限制二级，第三级不产生任何返佣
  - 返佣以积分形式，不支持提现
  - 积分只能在积分商城兑换实物/权益，不能转账
  - 所有分销记录可追溯、可审计
```

### 2.2 边缘场景用户故事

```
场景: 循环邀请(A邀请B,B邀请A)
期望: 系统检测已有邀请关系，禁止覆盖，提示"您已有上线关系"

场景: 用户已注册再绑定邀请码
期望: 只允许在首次注册时绑定，注册7天后不再接受绑定

场景: 订单退款时的返佣处理
期望: 订单进入REFUNDING状态时，对应返佣状态改为CANCELLED，
      若已结算则从下次返佣中扣除

场景: 下线被封号
期望: 封号用户的下线链继续有效，但封号用户本人返佣暂停
```

---

## 三、功能清单

### P0 (必须上线)

| 编号 | 功能 | 说明 |
|------|------|------|
| F-001 | 邀请码生成 | 每个用户注册后自动生成6位唯一邀请码 |
| F-002 | 邀请链接 | joinus.com/invite/{code} 专属链接 |
| F-003 | 邀请码绑定 | 新用户注册时填写/从链接自动填入邀请码 |
| F-004 | 上下线关系建立 | 绑定成功后写入Referral表 |
| F-005 | 二级关系追溯 | B邀请C时，自动识别A为C的二级上线 |
| F-006 | 返佣计算 | 订单完成时触发，按5%/2%计算，≤500积分上限 |
| F-007 | 返佣积分发放 | 调用积分模块，增加上线用户积分 |
| F-008 | 分销中心页 | 我的邀请码+团队+返佣明细，见P20-PRD |
| F-009 | 返佣状态管理 | PENDING→SETTLED(订单完成)→CANCELLED(退款) |

### P1 (首月内上线)

| 编号 | 功能 | 说明 |
|------|------|------|
| F-010 | 邀请海报生成 | 含用户头像+昵称+邀请码+二维码的海报图片 |
| F-011 | 微信/朋友圈分享 | 移动端原生分享接口 |
| F-012 | 分销排行榜 | 本月邀请人数TOP榜单 |
| F-013 | 返佣通知推送 | 积分到账时推送应用内通知 |
| F-014 | 邀请统计 | 总邀请/本月邀请/转化率统计 |
| F-015 | 下线活跃度 | 展示下线最近下单时间/贡献积分 |

### P2 (后续迭代)

| 编号 | 功能 | 说明 |
|------|------|------|
| F-016 | 团队竞赛活动 | 双倍返佣活动/节日限时加倍 |
| F-017 | 分销等级 | 根据邀请人数/贡献积分升级分销等级 |
| F-018 | 专属分销页 | 自定义分销个人主页 |
| F-019 | 管理后台分销监控 | 异常分销行为监控+黑名单管理 |

---

## 四、页面线框 (ASCII)

### 4.1 分销中心页 (见 P20-PRD-分销中心页.md)

```
┌──────────────────────────────────────────┐
│  分销中心                           [?]  │
├──────────────────────────────────────────┤
│                                          │
│  我的邀请码                              │
│  ┌────────────────────────────────────┐  │
│  │   ABBEY6  [复制]    [生成海报]     │  │
│  │   joinus.com/invite/ABBEY6  [分享] │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │  总邀请 │ │ 一级下线│ │二级下线│        │
│  │  38人  │ │  25人  │ │  13人  │        │
│  └────────┘ └────────┘ └────────┘        │
│  ┌───────────────────────────────────┐   │
│  │  累计收益: 12,850积分  本月: 3,200│   │
│  │  [本月收益趋势折线图]              │   │
│  └───────────────────────────────────┘   │
│                                          │
│  我的团队  [一级下线▼] [二级下线]         │
│  ┌─────────────────────────────────────┐ │
│  │ 👤 张三  注册于2026-01-15  贡献560分 │ │
│  │ 👤 李四  注册于2026-02-03  贡献320分 │ │
│  │ 👤 王五  注册于2026-03-11  贡献 80分 │ │
│  │           ... 查看更多              │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  返佣明细                                │
│  ┌─────────────────────────────────────┐ │
│  │ 订单#8823  李四下单  ¥368 → +18积分 │ │
│  │ 已结算  2026-03-20                  │ │
│  │ 订单#8641  张三下单  ¥520 → +26积分 │ │
│  │ 已结算  2026-03-18                  │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 五、数据模型

### 5.1 Prisma Schema

```prisma
// 邀请码表
model InviteCode {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  code          String   @unique @db.VarChar(6)
  totalInvites  Int      @default(0)
  totalRewards  Int      @default(0)  // 累计获得积分
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  referrals     Referral[] @relation("InviterCodes")

  @@index([code])
}

// 推荐关系表
model Referral {
  id          String   @id @default(cuid())
  inviterId   String
  invitee     User     @relation("ReferralInvitee", fields: [inviteeId], references: [id])
  inviteeId   String   @unique  // 每人只有一个上线(一级)
  inviter     User     @relation("ReferralInviter", fields: [inviterId], references: [id])
  level       Int      @default(1)  // 1=一级上线, 2=二级上线(冗余字段便于查询)
  createdAt   DateTime @default(now())

  rewards     ReferralReward[]

  @@index([inviterId])
  @@index([inviteeId])
}

// 返佣记录表
model ReferralReward {
  id          String              @id @default(cuid())
  referralId  String
  referral    Referral            @relation(fields: [referralId], references: [id])
  orderId     String
  order       Order               @relation(fields: [orderId], references: [id])
  inviterId   String              // 获得返佣的用户
  inviter     User                @relation("RewardReceiver", fields: [inviterId], references: [id])
  amount      Int                 // 积分数量
  level       Int                 // 1=一级返佣(5%), 2=二级返佣(2%)
  status      ReferralRewardStatus @default(PENDING)
  settledAt   DateTime?
  cancelledAt DateTime?
  createdAt   DateTime            @default(now())

  @@index([inviterId])
  @@index([orderId])
  @@index([referralId])
}

enum ReferralRewardStatus {
  PENDING    // 待结算(订单未完成)
  SETTLED    // 已结算(积分已发放)
  CANCELLED  // 已取消(订单退款)
}
```

### 5.2 User表扩展字段

```prisma
// 在现有User模型中追加:
model User {
  // ... 已有字段 ...
  inviteCode        InviteCode?
  referralAsInvitee Referral?   @relation("ReferralInvitee")
  referralsAsInviter Referral[] @relation("ReferralInviter")
  rewardsReceived   ReferralReward[] @relation("RewardReceiver")
}
```

### 5.3 索引与约束说明

- `inviteeId` 字段为 `@unique`，确保每个用户只有一个直接上线
- 二级上线通过业务逻辑在 `Referral` 表查询（invitee的inviter即为二级上线）
- 不在数据库层存储"二级"关系，防止数据不一致，通过查询推导

---

## 六、API契约

### 6.1 端点列表

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/referral/my-code | 获取我的邀请码(不存在则自动创建) | 登录用户 |
| GET | /api/referral/my-team | 我的一级+二级下线列表(分页) | 登录用户 |
| GET | /api/referral/my-rewards | 我的返佣记录(分页+状态筛选) | 登录用户 |
| POST | /api/referral/bind | 绑定邀请码(注册时调用) | 登录用户 |
| GET | /api/referral/stats | 分销统计汇总 | 登录用户 |
| GET | /api/referral/leaderboard | 本月邀请排行榜 | 公开 |

### 6.2 请求/响应详情

#### GET /api/referral/my-code

Response:
```json
{
  "code": "ABBEY6",
  "inviteUrl": "https://joinus.com/invite/ABBEY6",
  "totalInvites": 38,
  "totalRewards": 12850,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

#### GET /api/referral/my-team

Query: `?level=1|2&page=1&pageSize=20`

Response:
```json
{
  "items": [
    {
      "userId": "cuid",
      "nickname": "张三",
      "avatarUrl": "https://...",
      "level": 1,
      "joinedAt": "2026-01-15T00:00:00Z",
      "totalContribution": 560,
      "lastOrderAt": "2026-03-20T00:00:00Z"
    }
  ],
  "total": 38,
  "page": 1,
  "pageSize": 20
}
```

#### GET /api/referral/my-rewards

Query: `?status=PENDING|SETTLED|CANCELLED&page=1&pageSize=20`

Response:
```json
{
  "items": [
    {
      "id": "cuid",
      "orderId": "8823",
      "orderAmount": 36800,
      "inviteeName": "李四",
      "amount": 18,
      "level": 1,
      "status": "SETTLED",
      "settledAt": "2026-03-20T00:00:00Z",
      "createdAt": "2026-03-19T00:00:00Z"
    }
  ],
  "total": 156,
  "totalAmount": 12850,
  "page": 1,
  "pageSize": 20
}
```

#### POST /api/referral/bind

Request:
```json
{
  "code": "ABBEY6"
}
```

Response (成功):
```json
{
  "success": true,
  "message": "绑定成功，邀请人将在您完成订单后获得积分奖励"
}
```

Response (失败 - 已有上线):
```json
{
  "statusCode": 400,
  "message": "您已有邀请关系，无法重复绑定"
}
```

Response (失败 - 邀请码无效):
```json
{
  "statusCode": 404,
  "message": "邀请码不存在"
}
```

Response (失败 - 注册超过7天):
```json
{
  "statusCode": 400,
  "message": "邀请码绑定窗口已关闭（仅限注册7天内）"
}
```

#### GET /api/referral/stats

Response:
```json
{
  "totalInvites": 38,
  "level1Count": 25,
  "level2Count": 13,
  "totalRewards": 12850,
  "monthlyRewards": 3200,
  "pendingRewards": 450,
  "monthlyTrend": [
    { "date": "2026-03-01", "amount": 200 },
    { "date": "2026-03-02", "amount": 150 }
  ]
}
```

### 6.3 内部触发接口 (由Order模块调用)

```
POST /api/referral/internal/trigger-reward
Body: { orderId: string, userId: string, orderAmount: number }
说明: 订单状态变为COMPLETED时，Order Service调用此接口触发返佣计算
权限: 内部服务调用，需ServiceToken
```

---

## 七、业务规则详述

### 7.1 返佣计算规则

```
订单完成(COMPLETED)时触发:
1. 查找下单用户的一级上线(Referral.inviterId where inviteeId=userId AND level=1)
2. 计算一级返佣: min(orderAmount * 0.05, 500) 积分
3. 查找一级上线的一级上线 = 当前用户的二级上线
4. 计算二级返佣: min(orderAmount * 0.02, 500) 积分
5. 分别创建ReferralReward记录(status=PENDING → 立即SETTLED)
6. 调用积分模块: PointsService.addPoints(inviterId, amount, '分销返佣')
7. 更新InviteCode.totalRewards

注意:
- 积分单位: 1积分 = 1积分(整数)
- 订单金额单位: 分(整数)，¥368.00 = 36800分
- 一级返佣 = floor(36800 * 0.05 / 100) = floor(18.4) = 18积分
- 每笔订单一级+二级返佣各自独立计算上限500积分
```

### 7.2 合规保障规则

```
[C-01] 最多二级: 数据库层通过inviteeId唯一约束保证每人只有一个直接上线
       查询二级上线时直接用JOIN，不递归
[C-02] 积分不可提现: PointsTransaction中type=REFERRAL_REWARD，只能商城消费
[C-03] 绑定时间窗口: 注册7天内才可绑定，超时拒绝
[C-04] 不允许自己邀请自己: bind时校验code.userId !== currentUserId
[C-05] 循环邀请检测: A邀请B后，B不能使用A的邀请码(但A未邀请B时，B可邀请A的下线)
       简化版: 绑定前检查目标用户是否已在当前用户的下线链中
```

### 7.3 退款时返佣撤销

```
订单进入REFUNDING时:
1. 查找该订单对应的所有ReferralReward记录
2. 若状态为PENDING → 直接改为CANCELLED
3. 若状态为SETTLED(积分已发放) → 记录为CANCELLED，
   从该用户下次获得的返佣中扣除(欠债机制)，
   或直接从用户积分账户扣除(需检查是否足够)
4. 若余额不足 → 记录负债，下次获得积分时优先抵扣
```

---

## 八、技术约束

### 8.1 后端约束

- 返佣计算在Order状态机中，状态变为COMPLETED时触发事件
- 使用NestJS EventEmitter2实现解耦: `order.completed` 事件
- ReferralService监听事件，异步执行返佣计算
- 防重复: 每笔orderId的返佣记录唯一(唯一索引 orderId+inviterId)
- 性能: 查找上线关系最多查2次数据库，无递归

### 8.2 前端约束

- 邀请码使用`navigator.clipboard.writeText`实现复制
- 海报生成使用Canvas API或html2canvas库
- 分享使用微信JSSDK(小程序)/原生Share API(移动端)
- Web端使用链接分享+复制

### 8.3 安全约束

- 邀请码生成: 使用加密随机数，确保不可预测
- `bind`接口做幂等处理，重复绑定返回已有关系
- 内部触发接口使用内部ServiceToken，不对外暴露

---

## 九、验收标准

### 9.1 功能验收

| 测试用例 | 预期结果 |
|---------|---------|
| 新用户注册后访问分销中心 | 自动生成邀请码，格式为6位字母数字 |
| 点击"复制邀请码" | 弹出toast"复制成功"，剪贴板有内容 |
| 新用户通过邀请链接注册 | 注册页面自动填入邀请码 |
| 完成绑定后A访问我的团队 | B出现在一级下线列表 |
| B再邀请C，A访问二级下线 | C出现在二级下线列表 |
| B完成¥368订单 | A获得18积分(5%)，无二级上线则结束 |
| C完成¥200订单 | B获得10积分(5%)，A获得4积分(2%) |
| 尝试第三级绑定 | 不产生三级返佣，系统只计算到A(二级) |
| 订单退款 | 对应ReferralReward状态变为CANCELLED，积分回滚 |
| 尝试自我邀请 | 返回400错误"不能使用自己的邀请码" |
| 注册超8天绑定 | 返回400错误"绑定窗口已关闭" |

### 9.2 性能验收

- 返佣计算异步执行，不影响订单接口响应时间
- 我的团队列表响应时间 < 500ms
- 并发100个订单同时完成，所有返佣记录正确创建

### 9.3 合规验收

- 审计日志中所有返佣记录可追溯至原始订单
- 积分账单中type=REFERRAL_REWARD的记录不可在提现接口使用
- 管理后台可查看任意用户的上下线关系图

---

## 十、依赖模块

| 依赖 | 类型 | 说明 |
|------|------|------|
| M08-用户认证 | 强依赖 | 获取当前用户ID，User表扩展 |
| M06-订单支付 | 强依赖 | 订单COMPLETED事件触发返佣 |
| M20-会员体系 | 强依赖 | 积分系统，发放和扣除积分 |
| M23-积分商城 | 弱依赖 | 积分消费场景，两者互相引用 |
| P20-分销中心页 | UI依赖 | 本模块主要展示页面 |

---

## 十一、里程碑

| 阶段 | 时间 | 交付物 |
|------|------|------|
| Phase 1 | W1 | Prisma Schema + Migration + 核心Service |
| Phase 2 | W2 | API全部实现 + 单元测试 |
| Phase 3 | W3 | 前端分销中心页(P20) |
| Phase 4 | W4 | 海报生成 + 分享 + 集成测试 |
| Phase 5 | W5 | 管理后台监控页 + 上线 |
