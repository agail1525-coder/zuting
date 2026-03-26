# M12 评价与社区 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: v2 规划中 (当前 0% 实施)

---

## 1. 需求背景与目标

### 1.1 背景

祖庭旅行平台目前已有朝圣日志 (JournalEntry) 和社区帖子 (Post) 的基础数据模型，但缺乏评价体系和社区互动机制。用户完成朝圣行程后无法对行程、导游、圣地进行评价打分，也无法与其他朝圣者进行深度互动。

作为跨宗教文化平台，社区模块面临特殊挑战: 必须确保不同信仰的用户能够相互尊重、和平对话。内容审核和宗教敏感度管理是核心需求。

### 1.2 目标

| 目标 | 衡量指标 |
|------|----------|
| 行程评价率 | 完成行程后 30 天内评价率 > 40% |
| 评价质量 | 平均评价内容长度 > 50 字 |
| 社区活跃度 | 月活用户发帖/评论 > 1 次 |
| 内容安全 | 宗教敏感内容 24 小时内审核完毕 |
| 举报处理 | 举报响应时间 < 4 小时 |
| 跨信仰尊重 | 宗教歧视内容零容忍，发现即处理 |

### 1.3 设计原则

1. **跨信仰尊重**: 平台核心价值观，所有评价/社区功能以促进宗教文化对话为目标
2. **正向引导**: 评价以建设性反馈为主，不鼓励负面攻击
3. **隐私保护**: 用户可选择匿名评价
4. **真实可信**: 只有实际完成行程的用户才能评价
5. **多语言包容**: 支持中英双语评价，未来扩展更多语言

---

## 2. 用户故事

### 2.1 评价功能

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-R01 | 作为朝圣者，我想在完成行程后对行程体验打分 (1-5星) 并写评价 | P0 |
| US-R02 | 作为朝圣者，我想对圣地的体验进行评价 (灵性感受/交通便利/设施) | P0 |
| US-R03 | 作为朝圣者，我想为导游打分 (知识专业性/沟通/可靠性) | P1 |
| US-R04 | 作为朝圣者，我想在评价中上传朝圣照片 | P0 |
| US-R05 | 作为朝圣者，我想选择匿名评价 | P1 |
| US-R06 | 作为朝圣者，我想查看其他人对圣地/行程/导游的评价 | P0 |
| US-R07 | 作为朝圣者，我想按评分/时间排序查看评价 | P1 |
| US-R08 | 作为朝圣者，我想对有帮助的评价点赞 | P2 |

### 2.2 社区功能

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-R09 | 作为朝圣者，我想将朝圣日志发布到社区，与他人分享感悟 | P0 |
| US-R10 | 作为朝圣者，我想在社区浏览其他人的朝圣故事 | P0 |
| US-R11 | 作为朝圣者，我想评论其他人的日志/帖子 | P1 |
| US-R12 | 作为朝圣者，我想点赞喜欢的内容 | P1 |
| US-R13 | 作为朝圣者，我想关注感兴趣的朝圣者 | P2 |
| US-R14 | 作为朝圣者，我想按信仰/圣地标签浏览社区内容 | P1 |

### 2.3 内容举报与审核

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-R15 | 作为朝圣者，我想举报不当内容 (冒犯/不敬/垃圾信息) | P0 |
| US-R16 | 作为管理员，我想在审核队列中查看被举报的内容 | P0 |
| US-R17 | 作为管理员，我想对举报内容进行通过/删除/警告/封禁处理 | P0 |
| US-R18 | 作为管理员，我想查看自动标记的宗教敏感内容并复核 | P0 |
| US-R19 | 作为管理员，我想设置敏感词库并更新过滤规则 | P1 |

---

## 3. 业务流程

### 3.1 行程评价流程

```
行程状态变为 COMPLETED
    │
    ▼
系统发送通知: "恭喜完成朝圣，记录您的感悟吧"
    │
    ▼ (用户点击通知 / 进入行程详情)
    │
    ▼
展示评价入口 (行程详情底部 Banner)
    │
    ▼
用户点击「撰写评价」→ 评价表单页:
    │
    ├── 整体评分: 1-5 星 (必填)
    ├── 分项评分:
    │   ├── 行程安排: 1-5 星
    │   ├── 圣地体验: 1-5 星
    │   ├── 交通住宿: 1-5 星
    │   └── 性价比: 1-5 星
    ├── 文字评价: TextArea (最少 10 字，最多 2000 字)
    ├── 上传照片: 最多 9 张
    ├── 心情标签: 感悟/喜悦/平静/震撼/感恩 (可多选)
    └── 匿名发布: Switch (默认关闭)
    │
    ▼
提交评价 → POST /api/reviews
    │
    ▼
自动检测:
    ├── 敏感词过滤 → 命中 → 进入人工审核队列
    └── 未命中 → 直接发布
    │
    ▼
评价发布成功 → 更新行程/圣地/导游平均评分
```

### 3.2 圣地评价流程

```
用户访问圣地详情页 → 评价区域
    │
    ├── 查看已有评价列表 (按时间/评分排序)
    ├── 评分汇总: 平均分 + 分布直方图 (5星xx%/4星xx%/...)
    │
    └── 用户已完成含该圣地的行程 → 显示「写评价」按钮
        │
        ▼
    评价表单:
        ├── 总体评分: 1-5 星
        ├── 分项:
        │   ├── 灵性氛围: 1-5
        │   ├── 历史文化: 1-5
        │   ├── 自然环境: 1-5
        │   └── 可达性: 1-5
        ├── 文字描述
        ├── 照片 (最多 9 张)
        └── 推荐标签: 适合冥想/适合摄影/适合家庭/历史厚重/...
```

### 3.3 内容举报与审核流程

```
用户在评价/帖子/评论上点击「举报」
    │
    ▼
选择举报原因:
    ├── INAPPROPRIATE: 不当内容
    ├── OFFENSIVE: 冒犯性内容
    ├── SPAM: 垃圾信息/广告
    ├── RELIGIOUS_SENSITIVE: 宗教敏感/不敬内容
    └── OTHER: 其他 (需填写说明)
    │
    ▼
填写补充说明 (可选) → POST /api/reports
    │
    ▼
系统创建 ContentReport 记录 (status=PENDING)
    │
    ▼
通知管理员审核队列有新举报
    │
    ▼
管理员在后台 ModerationPage 审核:
    │
    ├── 查看被举报内容原文 + 举报原因 + 举报人信息
    │
    ├── 处理决定:
    │   ├── DISMISS: 驳回举报 (内容无问题)
    │   ├── DELETE: 删除内容
    │   ├── WARN: 删除内容 + 向发布者发送警告通知
    │   └── BAN: 删除内容 + 封禁发布者账号
    │
    └── 记录审核结果 (reviewedBy, reviewedAt, action)
```

### 3.4 宗教敏感内容自动检测流程

```
用户提交评价/帖子/评论
    │
    ▼
SensitivityFilter 自动检测:
    │
    ├── 敏感词库匹配 (宗教名称+负面词组合)
    │   例: "XX教是邪教"、"XX教不如XX教" 等
    │
    ├── AI 辅助检测 (调用小鸿 AI 接口):
    │   - 评估内容是否包含宗教偏见
    │   - 评估是否可能引起跨信仰冲突
    │   - 返回敏感度分数 0-100
    │
    └── 判定结果:
        ├── 敏感度 < 30: 自动通过
        ├── 30 <= 敏感度 < 70: 标记为待审核，临时隐藏
        └── 敏感度 >= 70: 自动拦截，通知管理员

特殊保护规则:
    - 涉及多个宗教的比较性言论 → 自动进入审核
    - 包含宗教领袖/经典的负面评价 → 自动进入审核
    - 新用户 (注册 < 7天) 的首条评价 → 自动审核
```

---

## 4. 功能清单

### 4.1 评价系统

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 行程评价 | 行程完成后评分 + 文字 + 照片 | P0 |
| 圣地评价 | 对已访问圣地的体验评价 | P0 |
| 导游评价 | 对导游的专业性/沟通/可靠性评价 | P1 |
| 评分聚合 | 平均分/分项分/评分分布统计 | P0 |
| 评价列表 | 按时间/评分排序，支持翻页 | P0 |
| 评价详情 | 全文 + 照片 + 回复 | P0 |
| 评价点赞 | 其他用户可点赞有帮助的评价 | P2 |
| 匿名评价 | 隐藏评价者昵称和头像 | P1 |
| 评价提醒 | 完成行程 1/3/7 天后分别提醒评价 | P1 |
| 评价回复 | 导游/管理员可回复评价 | P2 |

### 4.2 社区功能

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 社区动态流 | 公开日志 + 帖子聚合展示 | P0 |
| 发布帖子 | 文字 + 图片 + 圣地标签 + 信仰标签 | P0 |
| 日志公开 | 朝圣日志设为公开后出现在社区流 | P0 |
| 评论系统 | 对帖子/日志的评论，支持多级回复 | P1 |
| 点赞 | 帖子/日志/评论的点赞 | P1 |
| 收藏 | 收藏感兴趣的内容 | P2 |
| 关注用户 | 关注其他朝圣者，优先显示其动态 | P2 |
| 标签体系 | 按信仰/圣地/话题组织内容 | P1 |
| 热门内容 | 基于点赞/评论/浏览的热门排行 | P2 |
| 搜索 | 全文搜索帖子/日志内容 | P2 |

### 4.3 内容审核

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 举报功能 | 用户举报不当内容 (4 种原因) | P0 |
| 审核队列 | 管理后台待审核内容列表 | P0 |
| 审核操作 | 驳回/删除/警告/封禁 4 种处理 | P0 |
| 敏感词库 | 可配置的敏感词列表 | P0 |
| AI 辅助检测 | 小鸿 AI 评估宗教敏感度 | P1 |
| 新用户审核 | 新注册用户首条内容自动审核 | P1 |
| 审核日志 | 审核操作记录，可追溯 | P1 |
| 用户封禁 | 封禁违规用户 + 解封机制 | P0 |
| 内容申诉 | 被删除内容的发布者可申诉 | P2 |

### 4.4 宗教敏感管理 (平台特色)

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 跨信仰比较检测 | 自动标记宗教比较性内容 | P0 |
| 尊重指南 | 评价前展示跨信仰尊重指南 | P0 |
| 宗教标签校验 | 确保内容标签与宗教维度一致 | P1 |
| 正面引导 | 评价表单引导用户写建设性内容 | P1 |
| 多语言审核 | 中/英双语内容分别审核 | P2 |
| 季度报告 | 社区健康度报告 (内容质量/敏感事件/处理统计) | P2 |

---

## 5. 数据模型

### 5.1 Review — 评价

```prisma
model Review {
  id          String       @id @default(cuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  targetType  ReviewTarget // TRIP / GUIDE / SITE
  targetId    String       // tripId / guideId / siteId
  rating      Int          // 1-5 总体评分
  subRatings  Json?        // {"arrangement":4, "experience":5, "transport":3, "value":4}
  content     String       @db.Text
  images      String[]     // 照片URL数组
  tags        String[]     // 心情/推荐标签
  isAnonymous Boolean      @default(false)
  likes       Int          @default(0)
  status      ReviewStatus @default(PUBLISHED)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  replies     ReviewReply[]

  @@index([targetType, targetId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum ReviewTarget {
  TRIP
  GUIDE
  SITE
}

enum ReviewStatus {
  PUBLISHED     // 已发布
  PENDING       // 待审核
  HIDDEN        // 已隐藏 (审核不通过)
  DELETED       // 已删除
}
```

### 5.2 ReviewReply — 评价回复

```prisma
model ReviewReply {
  id        String   @id @default(cuid())
  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())

  @@index([reviewId])
}
```

### 5.3 Comment — 评论 (帖子/日志)

```prisma
model Comment {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  targetType String  // POST / JOURNAL
  targetId  String
  parentId  String?  // 回复哪条评论 (多级回复)
  content   String   @db.Text
  likes     Int      @default(0)
  status    String   @default("ACTIVE") // ACTIVE / HIDDEN / DELETED
  createdAt DateTime @default(now())

  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  @@index([targetType, targetId])
  @@index([parentId])
  @@index([userId])
}
```

### 5.4 ContentReport — 内容举报

```prisma
model ContentReport {
  id          String       @id @default(cuid())
  userId      String       // 举报人
  user        User         @relation(fields: [userId], references: [id])
  targetType  String       // REVIEW / POST / JOURNAL / COMMENT
  targetId    String
  reason      ReportReason
  description String?      @db.Text  // 补充说明
  status      ReportStatus @default(PENDING)
  action      String?      // DISMISS / DELETE / WARN / BAN
  reviewedBy  String?      // 审核管理员 userId
  reviewedAt  DateTime?
  reviewNote  String?      // 审核备注
  createdAt   DateTime     @default(now())

  @@index([status])
  @@index([targetType, targetId])
  @@index([userId])
}

enum ReportReason {
  INAPPROPRIATE       // 不当内容
  OFFENSIVE           // 冒犯性内容
  SPAM                // 垃圾信息
  RELIGIOUS_SENSITIVE // 宗教敏感
  OTHER               // 其他
}

enum ReportStatus {
  PENDING    // 待审核
  REVIEWED   // 已审核
  DISMISSED  // 已驳回
}
```

### 5.5 UserFollow — 用户关注 (v2)

```prisma
model UserFollow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

### 5.6 ContentLike — 通用点赞

```prisma
model ContentLike {
  id         String   @id @default(cuid())
  userId     String
  targetType String   // POST / JOURNAL / REVIEW / COMMENT
  targetId   String
  createdAt  DateTime @default(now())

  @@unique([userId, targetType, targetId])
  @@index([targetType, targetId])
}
```

### 5.7 聚合字段 (缓存在目标表上)

在 HolySite / Trip 等目标模型上增加评价聚合字段:

```prisma
// 追加到 HolySite 模型
model HolySite {
  // ... 现有字段
  avgRating    Float?   // 平均评分 (定期聚合)
  reviewCount  Int      @default(0)
}
```

---

## 6. API 接口

### 6.1 评价接口

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| POST | /api/reviews | 必须 | 创建评价 |
| GET | /api/reviews | 可选 | 查询评价列表 ?targetType=&targetId=&sort=&page= |
| GET | /api/reviews/:id | 可选 | 评价详情 (含回复) |
| PATCH | /api/reviews/:id | 必须 | 修改评价 (仅作者，24h内) |
| DELETE | /api/reviews/:id | 必须 | 删除评价 (仅作者/管理员) |
| POST | /api/reviews/:id/like | 必须 | 点赞评价 |
| DELETE | /api/reviews/:id/like | 必须 | 取消点赞 |
| POST | /api/reviews/:id/reply | 必须 | 回复评价 |
| GET | /api/reviews/stats/:targetType/:targetId | 可选 | 评价统计 (平均分/分布) |

### 6.2 评论接口

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| POST | /api/comments | 必须 | 创建评论 |
| GET | /api/comments | 可选 | 查询评论 ?targetType=&targetId=&page= |
| DELETE | /api/comments/:id | 必须 | 删除评论 (作者/管理员) |
| POST | /api/comments/:id/like | 必须 | 点赞评论 |

### 6.3 社区接口

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| GET | /api/community/feed | 可选 | 社区动态流 ?tag=&religion=&sort=&page= |
| GET | /api/community/hot | 可选 | 热门内容 |
| POST | /api/users/:id/follow | 必须 | 关注用户 |
| DELETE | /api/users/:id/follow | 必须 | 取消关注 |
| GET | /api/users/:id/followers | 可选 | 粉丝列表 |
| GET | /api/users/:id/following | 可选 | 关注列表 |

### 6.4 举报与审核接口

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| POST | /api/reports | 必须 | 提交举报 |
| GET | /api/admin/reports | ADMIN | 举报列表 ?status=&reason=&page= |
| PATCH | /api/admin/reports/:id | ADMIN | 审核处理 {action, note} |
| GET | /api/admin/moderation/queue | ADMIN | 待审核内容队列 |
| GET | /api/admin/moderation/stats | ADMIN | 审核统计 |
| POST | /api/admin/sensitive-words | ADMIN | 添加敏感词 |
| DELETE | /api/admin/sensitive-words/:id | ADMIN | 删除敏感词 |
| GET | /api/admin/sensitive-words | ADMIN | 敏感词列表 |

### 6.5 接口详细设计

**POST /api/reviews**
```json
{
  "targetType": "TRIP",
  "targetId": "clu...",
  "rating": 5,
  "subRatings": {
    "arrangement": 5,
    "experience": 5,
    "transport": 4,
    "value": 4
  },
  "content": "这次菩提伽耶朝圣之旅非常震撼...",
  "images": ["https://...1.jpg", "https://...2.jpg"],
  "tags": ["震撼", "灵性体验", "推荐冥想"],
  "isAnonymous": false
}
```

**GET /api/reviews/stats/SITE/:siteId**
```json
{
  "avgRating": 4.6,
  "totalCount": 128,
  "distribution": {
    "5": 72,
    "4": 38,
    "3": 12,
    "2": 4,
    "1": 2
  },
  "subRatings": {
    "spirituality": 4.8,
    "history": 4.5,
    "nature": 4.3,
    "accessibility": 3.9
  },
  "topTags": [
    { "tag": "灵性氛围", "count": 85 },
    { "tag": "适合冥想", "count": 62 },
    { "tag": "历史厚重", "count": 48 }
  ]
}
```

---

## 7. 多端页面规格

### 7.1 Web — 圣地详情页评价区

```
┌─────────────────────────────────────────────┐
│  圣地详情 (上方: 基本信息/描述/图片/地图)       │
├─────────────────────────────────────────────┤
│  用户评价                                     │
│                                              │
│  ★★★★★ 4.6/5  (128条评价)                   │
│  ┌─────────────────────────────────┐         │
│  │ 5★ ████████████████████ 72     │         │
│  │ 4★ ██████████ 38              │         │
│  │ 3★ ████ 12                    │         │
│  │ 2★ █ 4                       │         │
│  │ 1★ █ 2                       │         │
│  └─────────────────────────────────┘         │
│                                              │
│  热门标签: [灵性氛围] [适合冥想] [历史厚重]     │
│                                              │
│  [按时间 ▼] [全部评分 ▼]       [写评价]        │
├─────────────────────────────────────────────┤
│  ┌────┐ 张三 ★★★★★              2天前       │
│  │头像│ 菩提伽耶的灵性氛围无与伦比...            │
│  └────┘ [图片1] [图片2] [图片3]               │
│         👍 12  💬 3                          │
├─────────────────────────────────────────────┤
│  ┌────┐ 匿名用户 ★★★★☆           1周前       │
│  │ ?  │ 交通不太方便，但值得...                 │
│  └────┘                                      │
│         👍 5  💬 1        [举报]              │
├─────────────────────────────────────────────┤
│              加载更多评价                      │
└─────────────────────────────────────────────┘
```

### 7.2 Web — 评价撰写表单

```
┌─────────────────────────────────────────────┐
│  撰写评价                                     │
├─────────────────────────────────────────────┤
│                                              │
│  跨信仰尊重提醒:                               │
│  ┌─────────────────────────────────────┐     │
│  │ 祖庭旅行平台致力于促进跨宗教文化对话。  │     │
│  │ 请以尊重和包容的态度分享您的体验。      │     │
│  │ 避免对其他信仰的负面评判。             │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  总体评分: ☆☆☆☆☆ (点击打分)                   │
│                                              │
│  分项评分:                                    │
│    灵性氛围  ☆☆☆☆☆                           │
│    历史文化  ☆☆☆☆☆                           │
│    自然环境  ☆☆☆☆☆                           │
│    可达性    ☆☆☆☆☆                           │
│                                              │
│  评价内容:                                    │
│  ┌─────────────────────────────────────┐     │
│  │ (请至少写 10 个字...)                  │     │
│  │                                      │     │
│  │                                      │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  上传照片 (最多9张):                           │
│  [+] [+] [+] ...                             │
│                                              │
│  推荐标签: [灵性氛围] [适合冥想] [适合摄影]      │
│           [适合家庭] [历史厚重] [交通便利]      │
│                                              │
│  ☐ 匿名发布                                  │
│                                              │
│        [取消]        [提交评价]               │
└─────────────────────────────────────────────┘
```

### 7.3 Web — 社区动态流

```
┌─────────────────────────────────────────────┐
│  朝圣社区                                     │
├─────────────────────────────────────────────┤
│  [最新] [热门] [关注]   [佛教▼] [全部▼]       │
├─────────────────────────────────────────────┤
│  ┌────┐ 李明            3小时前              │
│  │头像│ 在耶路撒冷旧城，三大宗教的圣地仅      │
│  └────┘ 数百米之隔，感受到前所未有的和平...     │
│         [图片1] [图片2]                       │
│         #耶路撒冷 #基督教 #跨信仰             │
│         ❤ 42  💬 8  🔖 收藏                  │
├─────────────────────────────────────────────┤
│  ┌────┐ 王芳 · 朝圣日志          昨天        │
│  │头像│ 菩提伽耶悟道记                        │
│  └────┘ 在菩提树下静坐两小时，忽然理解了...    │
│         [图片1] [图片2] [图片3]               │
│         #菩提伽耶 #佛教 #冥想                 │
│         ❤ 128  💬 23  🔖 收藏                │
├─────────────────────────────────────────────┤
│              加载更多                         │
└─────────────────────────────────────────────┘
```

### 7.4 Mobile App — 评价与社区

- 评价: 行程详情页底部 Tab 切换到"评价"
- 社区: 独立 Tab (如果 Tab 位置充裕) 或作为"圣地"Tab 的子页面
- 评价撰写: 全屏 Modal，底部工具栏 (拍照/相册/标签)
- 评论: BottomSheet 形式展开评论列表

### 7.5 小程序 — 评价

- 评价入口: 行程详情页底部
- 评价列表: 圣地详情页评价区 (简化版，只展示 5 条)
- 社区: 小程序暂不实现完整社区，通过朝圣日志公开分享

### 7.6 管理后台 — 审核队列

```
┌─────────────────────────────────────────────────────┐
│  内容审核                                             │
├─────────────────────────────────────────────────────┤
│  [待审核(12)] [已处理] [已驳回]                         │
├───┬──────┬──────┬────────┬──────┬────────┬─────────┤
│ # │ 内容  │ 类型  │ 举报原因 │ 举报数 │ 发布者   │ 操作     │
├───┼──────┼──────┼────────┼──────┼────────┼─────────┤
│ 1 │ "xx教│ 评价  │ 宗教敏感 │  3   │ user123 │[通过][删 │
│   │ 不如..│      │        │      │        │ 除][警告]│
├───┼──────┼──────┼────────┼──────┼────────┼─────────┤
│ 2 │ 广告.. │ 帖子  │ 垃圾信息 │  5   │ user456 │[通过][删 │
│   │      │      │        │      │        │ 除][封禁]│
└───┴──────┴──────┴────────┴──────┴────────┴─────────┘
```

---

## 8. 埋点需求

### 8.1 评价事件

| 事件 | 参数 | 说明 |
|------|------|------|
| review_form_open | target_type, target_id | 打开评价表单 |
| review_submit | target_type, target_id, rating, has_images, is_anonymous | 提交评价 |
| review_submit_success | review_id, target_type | 评价提交成功 |
| review_submit_fail | error_reason | 评价提交失败 |
| review_view | review_id, target_type | 查看评价详情 |
| review_like | review_id | 点赞评价 |
| review_report | review_id, reason | 举报评价 |

### 8.2 社区事件

| 事件 | 参数 | 说明 |
|------|------|------|
| community_feed_view | tab(latest/hot/following), religion_filter | 浏览社区 |
| community_post_create | has_images, tags[], site_tag | 创建帖子 |
| community_post_view | post_id | 查看帖子 |
| community_comment | target_type, target_id, is_reply | 发表评论 |
| community_like | target_type, target_id | 点赞 |
| community_follow | following_id | 关注用户 |
| community_share | post_id, platform | 分享内容 |

### 8.3 审核事件

| 事件 | 参数 | 说明 |
|------|------|------|
| report_submit | target_type, target_id, reason | 提交举报 |
| moderation_action | report_id, action, target_type | 审核操作 |
| sensitivity_auto_flag | content_id, score, matched_words | 自动标记 |
| sensitivity_auto_block | content_id, score | 自动拦截 |

### 8.4 业务指标

| 指标 | 计算方式 | 目标 |
|------|----------|------|
| 评价率 | 评价用户 / 完成行程用户 | > 40% |
| 平均评分 | 所有评价的 rating 均值 | 监控 (理想 > 4.0) |
| 评价深度 | 有文字+照片的评价占比 | > 60% |
| 社区活跃 MAU | 月内发帖/评论/点赞至少 1 次 | 持续增长 |
| 举报准确率 | 举报被确认处理 / 总举报 | > 50% |
| 敏感内容拦截率 | 自动拦截 / (自动拦截 + 人工发现) | > 80% |
| 审核平均时间 | reviewedAt - createdAt | < 4h |
