# F09-PRD-每日签到

> 延伸功能PRD | 所属模块: M20-会员体系 | Sprint C2 | 版本 v1.0 | 2026-03-29
> 状态: 待评审

---

## 一、竞品对标分析

| 竞品 | 签到功能亮点 | 借鉴点 |
|------|------------|-------|
| **美团/大众点评** | 日历网格展示本月签到，连续签到火焰特效，今日奖励大按钮，补签消耗积分 | 日历可视化、连续奖励视觉化、补签机制 |
| **携程** | 签到+任务双轨，连续签到里程碑奖励（7天/14天/30天），积分实时到账动画 | 里程碑奖励节点、到账动画、任务体系 |
| **淘宝/天猫** | 签到日历精美，有连续签到进度提示，节假日特殊奖励 | 节假日特殊积分、进度感设计 |
| **Keep** | 日历热力图（颜色深浅表示活跃度），连续打卡徽章，分享打卡海报 | 热力图、徽章激励、社交分享 |
| **Agoda** | 签到积分直接抵扣下单，奖励与消费紧密结合 | 积分即时可见、与预订闭环 |

### 1.1 JOINUS签到差异化

- **修行日历**: 界面设计融入朝圣修行语境，已签到日显示莲花图标
- **连续修行奖励**: 连续7天获"七日修行"特别徽章和额外积分
- **节日特殊签到**: 宗教节日（佛诞/圣诞/开斋节等）签到获双倍积分

---

## 二、用户故事

```
US-F09-01 [P0]
作为 会员
我希望 每天点击签到按钮获取积分
以便   通过轻松的日常行为积累积分

US-F09-02 [P0]
作为 会员
我希望 在日历上看到本月哪些天已签到
以便   追踪自己的签到记录，形成习惯

US-F09-03 [P0]
作为 连续签到的会员
我希望 看到连续签到天数和进度
以便   保持连续签到动力，争取连续奖励

US-F09-04 [P1]
作为 连续签到7天的会员
我希望 自动获得额外50分奖励
以便   感受到坚持的额外回报

US-F09-05 [P1]
作为 会员
我希望 看到本月签到统计
以便   了解自己的参与度

US-F09-06 [P2]
作为 已完成连续签到里程碑的会员
我希望 获得专属徽章
以便   展示我的坚持成就
```

---

## 三、功能清单

### 3.1 P0 核心功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-F09-01 | 签到按钮 | 大型CTA按钮，带动画效果，每日一次 |
| F-F09-02 | 今日签到状态 | 未签到/已签到两态，文案和样式区分 |
| F-F09-03 | 本月日历网格 | 7列×5行日历，已签到日标记，今日高亮 |
| F-F09-04 | 积分到账提示 | 签到成功后浮动气泡显示 "+5分" |
| F-F09-05 | 连续签到天数 | 显示当前连续签到天数和连续奖励进度 |

### 3.2 P1 重要功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-F09-06 | 连续7天奖励 | 连续签到7天时自动发放额外50分 |
| F-F09-07 | 连续签到进度条 | 距下一个7天里程碑的天数进度 |
| F-F09-08 | 本月统计 | 本月签到次数、获取积分汇总 |
| F-F09-09 | 签到奖励规则说明 | 清晰展示基础积分和连续奖励规则 |

### 3.3 P2 扩展功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-F09-10 | 签到徽章 | 连续7天/30天徽章，展示在会员资料 |
| F-F09-11 | 节日特殊签到 | 宗教节日当天签到获双倍基础积分 |
| F-F09-12 | 分享签到 | 生成今日签到海报，分享到社交 |
| F-F09-13 | 补签功能 | 消耗100积分补签昨日（每月限2次） |

---

## 四、签到奖励规则

### 4.1 基础规则

| 签到类型 | 积分 | 说明 |
|---------|------|------|
| 普通签到 | 5分 | 每日基础 |
| 连续7天里程碑 | +50分 | 在第7天签到时额外发放 |
| 连续14天里程碑 | +100分 | 在第14天签到时额外发放 |
| 连续30天里程碑 | +200分 | 在第30天签到时额外发放 |

### 4.2 等级加成

| 会员等级 | 签到积分 |
|---------|---------|
| Lv1 朝圣新手 | 5分 |
| Lv2 虔诚行者 | 5分 |
| Lv3 法门守护 | 8分 |
| Lv4 圣地导师 | 10分 |
| Lv5 觉悟大师 | 15分 |

### 4.3 连续签到断签规则

```
- 连续天数: 每天签到累计
- 断签条件: 某天未签到，连续天数归零
- 里程碑奖励: 在达成的第N天签到时触发，未触发则不补发
- 里程碑判断: streak % 7 === 0 时触发7天奖励，streak % 14 === 0 时触发14天奖励
```

---

## 五、数据模型

### 5.1 签到记录（存储在PointsTransaction）

签到记录使用现有的 `PointsTransaction` 表存储：
```
source: CHECKIN
sourceId: "checkin:{YYYY-MM-DD}" (用于幂等性校验)
description: "每日签到 · 连续第N天"
```

### 5.2 签到日历（Redis缓存方案）

```
签到状态: Redis Set
Key: checkin_days:{userId}:{YYYY-MM}
Value: Set<number>  (已签到的日期数字，如 {1, 3, 5, 15, 28})
TTL: 当月最后一天 23:59:59

当日幂等锁:
Key: checkin_lock:{userId}:{YYYY-MM-DD}
Value: "1"
TTL: 当天剩余秒数（至00:00:00）
```

### 5.3 连续签到天数（Membership扩展字段）

在 Membership 表新增字段：
```prisma
model Membership {
  // ... 现有字段 ...
  streakDays      Int      @default(0)   // 当前连续签到天数
  lastCheckinDate DateTime?              // 最后一次签到日期（仅日期部分）
}
```

---

## 六、API契约

### 6.1 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/membership/checkin | 执行今日签到 | 必须 |
| GET | /api/membership/checkin-calendar | 获取本月签到日历 | 必须 |

### 6.2 POST /api/membership/checkin

**请求体:** 无（从Token获取userId）

**响应体（成功）:**
```json
{
  "success": true,
  "date": "2026-03-29",
  "basePoints": 5,
  "levelBonus": 3,
  "streakBonus": 0,
  "totalPointsEarned": 8,
  "streakDays": 4,
  "nextMilestone": {
    "days": 7,
    "bonusPoints": 50,
    "daysRemaining": 3
  },
  "message": "签到成功！连续签到第4天，获得8积分",
  "totalAvailablePoints": 5308
}
```

**第7天签到响应（触发连续奖励）:**
```json
{
  "success": true,
  "date": "2026-03-29",
  "basePoints": 5,
  "levelBonus": 3,
  "streakBonus": 50,
  "totalPointsEarned": 58,
  "streakDays": 7,
  "nextMilestone": {
    "days": 14,
    "bonusPoints": 100,
    "daysRemaining": 7
  },
  "message": "连续签到7天！额外奖励50积分，共获得58积分🎉",
  "totalAvailablePoints": 5366
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

### 6.3 GET /api/membership/checkin-calendar

**查询参数:**
```
year: number (default: 当前年)
month: number (default: 当前月, 1-12)
```

**响应体:**
```json
{
  "year": 2026,
  "month": 3,
  "checkedInDays": [1, 3, 5, 7, 8, 10, 15, 20, 22, 25, 27, 28, 29],
  "totalDays": 13,
  "totalPointsEarned": 104,
  "streakDays": 5,
  "todayCheckedIn": true
}
```

---

## 七、页面线框（ASCII）

### 7.1 签到区块（嵌入会员中心P17）

```
┌─────────────────────────────────────────────┐
│  每日修行签到                                │
├─────────────────────────────────────────────┤
│                                             │
│  🔥 连续签到 第 7 天  → 已达7天里程碑!      │
│                                             │
│  ████████████████████  7/7天  [🎉 100%]    │
│  下一里程碑: 第14天额外+100分               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 三 四 五 六 日 一 二              │   │
│  │  1  2  3  4  5  6  7             │   │
│  │  ◆  ◆  ◆  ◆  ◆  ◆  [今]         │   │
│  │  8  9 10 11 12 13 14             │   │
│  │  ◆  ·  ◆  ·  ·  ·  ·             │   │
│  │ 15 16 17 18 19 20 21             │   │
│  │  ·  ·  ·  ·  ·  ·  ·             │   │
│  │ 22 23 24 25 26 27 28             │   │
│  │  ·  ·  ·  ·  ·  ·  ·             │   │
│  │ 29 30 31                          │   │
│  │ [今]  ·  ·                        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  本月已签到 9 天  |  本月获得 72 分          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │      [ 今日签到  +8分  莲花✨  ]      │   │
│  │           (已签到变为灰色勾选)        │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  签到规则: 基础5分 · Lv3额外+3分            │
│  连续7天 +50分 | 连续14天 +100分           │
└─────────────────────────────────────────────┘
```

### 7.2 签到成功动效

```
点击签到按钮:

1. 按钮变为Loading状态
2. API成功后:
   - 按钮变为"✓ 今日已签到"（灰色禁用）
   - 今天的日历格子出现莲花◆图标
   - 浮动气泡从按钮上方升起: "+8分" (绿色)
   - 如果触发连续奖励: 额外气泡"+50分" (金色)
   - 顶部积分数字滚动更新
   - 连续天数数字+1动画
```

### 7.3 独立签到页面（从快捷操作入口进入）

```
┌─────────────────────────────────────────┐
│  ← 返回          每日修行签到           │
├─────────────────────────────────────────┤
│                                         │
│         [莲花大图 或 修行图示]           │
│                                         │
│    连续签到 第 4 天                     │
│    ████████░░░░░░░░░░ 4/7             │
│    再坚持 3 天解锁里程碑奖励 +50分      │
│                                         │
│  ─── 本月日历 ────────────────────    │
│  [日历组件]                             │
│  ◆ = 已签到  [今] = 今日  · = 未签到   │
│                                         │
│  本月: 9天 | 72分  连续: 4天            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │   [ 🌸 今日签到 · 获取 +8分 ]      │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ─── 签到奖励规则 ────────────────    │
│  基础签到      +5分/天                  │
│  Lv3额外       +3分/天                  │
│  连续7天       额外+50分                │
│  连续14天      额外+100分               │
│  连续30天      额外+200分               │
└─────────────────────────────────────────┘
```

---

## 八、交互状态

### 8.1 签到按钮状态

```
状态1 - 未签到:
  样式: 主色渐变背景（金色），文字"今日签到 +N分"
  大小: 宽100%，高56px
  动画: 轻微呼吸脉冲效果吸引注意

状态2 - 签到中:
  样式: Loading spinner，文字"签到中..."
  禁用点击

状态3 - 已签到:
  样式: 灰色背景，文字"今日已签到 ✓"，绿色勾图标
  禁用点击

状态4 - 签到失败:
  样式: 恢复未签到状态
  Toast: "签到失败，请稍后重试"
```

### 8.2 日历格子状态

```
已签到日:  深金色背景 + 莲花图标 ◆
今日(已签到): 绿色圆圈 + 勾图标 ✓
今日(未签到): 金色圆圈边框（高亮当前日）
未来日期:  正常日期数字，灰色
过去未签到: 浅灰色数字，无图标
```

---

## 九、后端实现逻辑

### 9.1 签到Service伪代码

```typescript
async checkin(userId: string): Promise<CheckinResult> {
  const today = dayjs().format('YYYY-MM-DD');

  // 1. 幂等性检查（Redis）
  const lockKey = `checkin_lock:${userId}:${today}`;
  const alreadyCheckedIn = await redis.get(lockKey);
  if (alreadyCheckedIn) {
    throw new BadRequestException('今日已签到，请明天再来');
  }

  // 2. 获取会员信息
  const membership = await prisma.membership.findUnique({ where: { userId } });

  // 3. 计算积分
  const basePoints = LEVEL_CHECKIN_POINTS[membership.level]; // 5/5/8/10/15

  // 4. 计算连续天数
  const lastDate = membership.lastCheckinDate
    ? dayjs(membership.lastCheckinDate).format('YYYY-MM-DD')
    : null;
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  let streakDays: number;
  if (lastDate === yesterday) {
    streakDays = membership.streakDays + 1; // 连续
  } else {
    streakDays = 1; // 断签，重新开始
  }

  // 5. 计算里程碑奖励
  let streakBonus = 0;
  if (streakDays % 7 === 0) streakBonus = 50;
  if (streakDays % 14 === 0) streakBonus = 100; // 覆盖7天奖励
  if (streakDays % 30 === 0) streakBonus = 200; // 覆盖14天奖励

  const totalPoints = basePoints + streakBonus;

  // 6. 事务写入
  await prisma.$transaction([
    // 写积分流水
    prisma.pointsTransaction.create({
      data: {
        membershipId: membership.id,
        type: 'EARN',
        amount: totalPoints,
        source: 'CHECKIN',
        sourceId: `checkin:${today}`,
        description: `每日签到 · 连续第${streakDays}天${streakBonus > 0 ? ` · 里程碑奖励+${streakBonus}` : ''}`,
      }
    }),
    // 更新会员积分和连续天数
    prisma.membership.update({
      where: { id: membership.id },
      data: {
        availablePoints: { increment: totalPoints },
        totalPoints: { increment: totalPoints },
        streakDays,
        lastCheckinDate: new Date(),
        // 重新计算等级
        ...calculateLevel(membership.totalPoints + totalPoints),
      }
    }),
  ]);

  // 7. 设置Redis幂等锁
  const ttl = dayjs().endOf('day').diff(dayjs(), 'second');
  await redis.set(lockKey, '1', 'EX', ttl);

  // 8. 更新Redis签到日历
  await redis.sadd(`checkin_days:${userId}:${dayjs().format('YYYY-MM')}`, dayjs().date());

  return { success: true, totalPointsEarned: totalPoints, streakDays, streakBonus, ... };
}
```

---

## 十、验收标准

### 10.1 功能验收

- [ ] F-F09-01: 签到按钮状态正确（未签到/已签到/Loading）
- [ ] F-F09-02: 已签到时按钮禁用，重复点击不触发API
- [ ] F-F09-03: 本月日历网格正确显示已签到/未签到/今日高亮
- [ ] F-F09-04: 签到成功后积分气泡动画出现
- [ ] F-F09-05: 连续签到天数正确累计

### 10.2 业务规则验收

- [ ] 每日签到严格一次：同一用户同一天不能重复签到
- [ ] 连续签到正确判断：昨日未签到则重置为第1天
- [ ] 第7/14/30天里程碑自动发放额外积分
- [ ] 积分金额与等级加成正确（Lv3=8分，Lv4=10分，Lv5=15分）
- [ ] 断签后再重新开始，里程碑重新计算

### 10.3 技术验收

- [ ] 并发请求幂等：同一用户同时发送两次签到请求，只成功一次
- [ ] Redis锁在当日23:59:59自动过期
- [ ] GET checkin-calendar 返回的checkedInDays与实际签到记录一致
- [ ] 跨月签到：新月第一天连续天数正常延续（若昨日最后一天已签到）

---

## 十一、技术约束

```
[TC-F09-01] 幂等锁使用Redis，key: checkin_lock:{userId}:{YYYY-MM-DD}，TTL至当日24:00
[TC-F09-02] 签到事务：PointsTransaction和Membership更新在同一Prisma $transaction中
[TC-F09-03] 签到Calendar接口使用Redis缓存，不每次查PointsTransaction全表
[TC-F09-04] 连续天数用Membership.streakDays字段维护，不每次重算
[TC-F09-05] 日期计算统一使用UTC+8时区，避免跨时区签到问题
[TC-F09-06] 前端签到成功后乐观更新: 立即切换按钮状态，不等待重新fetch
[TC-F09-07] 日历组件按月缓存，当月切换不重复请求
```

---

## 十二、开发排期

| 任务 | 说明 | 预估 |
|------|------|------|
| 后端: 签到Service | 幂等锁+积分计算+事务 | 1天 |
| 后端: 日历API | Redis缓存+查询 | 0.5天 |
| 前端: 签到按钮组件 | 三态+动画 | 0.5天 |
| 前端: 日历网格组件 | 月历渲染+已签到标记 | 1天 |
| 前端: 积分气泡动画 | 浮起+消失动画 | 0.5天 |
| 测试: 幂等/并发测试 | Redis锁有效性 | 0.5天 |
| **合计** | | **4天** |

---

*PRD版本: v1.0 | 创建: 2026-03-29 | 所属模块: M20 | 集成到: P17-会员中心页*
