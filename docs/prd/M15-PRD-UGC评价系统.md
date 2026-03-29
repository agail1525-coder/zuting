# M15-PRD-UGC评价系统

> 项目: JOINUS.COM — 全球祖庭文化旅行平台
> 文档类型: 主模块PRD
> 版本: v1.0 | 创建日期: 2026-03-29 | 最后更新: 2026-03-29
> 状态: 评审中
> 负责人: CEO++ / 全栈团队

---

## 1. 背景与目标

### 1.1 背景

JOINUS.COM 当前数据库已存在基础 `Review` 模型（含 userId、targetType、targetId、rating、content、images 字段），但缺乏评价状态审核机制、回复体系和"有用"投票功能，前端亦未实现评价展示与提交界面。对标 TripAdvisor、Booking.com 等头部平台，UGC 评价体系是驱动用户留存、提升内容可信度的核心功能。

### 1.2 目标

- [ ] 用户可对圣地、祖庭、行程提交星级+图文评价，评价须经管理员审核后发布
- [ ] 评价列表支持三种排序方式（最新/最有用/最高分），并展示星级分布汇总图
- [ ] 支持"有用"投票（每人每条评价一票），促进高质量内容浮现
- [ ] 管理员可在后台批量审核、官方回复、隐藏违规评价
- [ ] 圣地/祖庭详情页实时展示平均评分和评价数量（冗余字段缓存）

### 1.3 非目标（本期不做的）

- 不包含评价举报申诉流程（延期到 Phase C 合规模块）
- 不包含评价积分激励体系（延期到 Phase C 会员体系）
- 不包含视频上传（仅支持图片，延期到 Phase D）
- 不包含 AI 自动审核（延期到 Phase D，当前仅人工审核）

---

## 2. 竞品对标分析

### 2.1 竞品功能对比

| 竞品 | 功能描述 | 优点 | 缺点 | 借鉴点 |
|------|---------|------|------|-------|
| TripAdvisor | UGC 评价+星级+照片+旅行者问答，支持"有用"投票，分类筛选 | 内容丰富，社区信任度高，星级分布可视化 | 垃圾评价多，审核慢 | 星级分布柱状图、"有用"投票机制、官方回复标记 |
| Booking.com | 入住后强制触发评价邀请，评价按维度打分（位置/清洁/服务） | 评价率极高，结构化评分维度可信 | 维度过多增加填写负担 | 行程完成后自动触发评价提示、官方回复样式 |
| 大众点评 | 图文评价+标签+口味/服务/环境多维打分，UGC照片墙 | 中文用户习惯贴合，图片展示突出 | 刷评问题较严重 | 评价图片网格展示、内容长度激励提示 |
| Airbnb | 双向评价（客人+房东互评），隐匿期后同时公开 | 公平性高，促进真实评价 | 流程复杂，用户疲劳 | 评价回复的对话感设计 |

### 2.2 差距分析

当前 JOINUS.COM 评价模块：
- 缺少评价审核状态（PENDING/APPROVED/REJECTED/HIDDEN），任何提交内容直接可见，存在合规风险
- 缺少 ReviewReply 表，管理员无法进行官方回复
- 缺少 ReviewVote 表，无"有用"投票机制
- HolySite/Temple 表缺少 avgRating / reviewCount 冗余字段，每次查询需实时聚合，性能差
- 前端 ReviewSection 仅有基础占位，未实现星级分布图和排序功能

### 2.3 差异化优势

- **宗教文化语境**：评价维度可增加"灵性体验"、"文化深度"等宗教专属维度，契合朝圣用户心理
- **多信仰兼容**：评价展示时附带宗教标签，帮助同信仰用户快速找到共鸣内容
- **朝圣验证机制**（未来）：行程状态 COMPLETED → REVIEWING 时自动触发评价邀请，评价带"已朝圣"认证标记，可信度高于普通 UGC

---

## 3. 用户故事

### 3.1 目标用户

- 主要用户: 朝圣旅行者（完成行程后分享体验）
- 次要用户: 潜在朝圣者（浏览评价辅助决策）、管理员（内容审核与运营）

### 3.2 用户故事列表

| 编号 | 用户故事 | 优先级 |
|------|---------|-------|
| US-01 | 作为朝圣旅行者，我希望在圣地详情页提交星级+图文评价，以便分享我的朝圣体验 | P0 |
| US-02 | 作为潜在朝圣者，我希望在圣地详情页看到其他人的评价列表和平均星级，以便做出朝圣决策 | P0 |
| US-03 | 作为旅行者，我希望给有帮助的评价点"有用"，以便帮助优质内容浮现 | P1 |
| US-04 | 作为旅行者，我希望在评价中上传最多9张照片，以便让其他人看到真实的圣地风貌 | P0 |
| US-05 | 作为旅行者，我希望能编辑自己已提交但尚未审核通过的评价，以便修正错误 | P1 |
| US-06 | 作为管理员，我希望在后台看到待审核评价列表，以便及时审核并维护内容质量 | P0 |
| US-07 | 作为管理员，我希望对评价进行官方回复，以便展示平台对用户反馈的重视 | P1 |
| US-08 | 作为行程完成的旅行者，我希望收到评价邀请提示，以便方便地完成评价而无需主动寻找入口 | P1 |

---

## 4. 功能清单

### 4.1 核心功能（P0 — 必须有）

- [ ] 提交评价：登录用户可提交 1-5 星 + 文字（≥10字）+ 最多9张图片
- [ ] 评价审核流：提交后状态为 PENDING，管理员审核通过（APPROVED）后前端可见
- [ ] 评价列表展示：APPROVED 状态评价分页展示，支持排序（最新/最有用/最高分）
- [ ] 星级分布汇总：展示1-5星各档次数量和百分比，配合柱状图可视化
- [ ] 评分冗余字段：HolySite.avgRating / reviewCount 字段，在评价审核通过时同步更新
- [ ] 管理员审核：后台支持通过/拒绝（填写理由），拒绝评价对用户不可见

### 4.2 增强功能（P1 — 应该有）

- [ ] "有用"投票：已登录用户可对评价标记有用，每人每条评价限一次，可取消
- [ ] 评价回复：管理员可官方回复，显示"官方回复"标记；用户可查看回复
- [ ] 编辑评价：用户可编辑状态为 PENDING 的评价（已审核通过后不可编辑）
- [ ] 删除评价：用户可删除自己的评价（任意状态）
- [ ] 行程完成提示：TripStatus 变为 COMPLETED 时，通知提醒用户评价关联圣地

### 4.3 优化功能（P2 — 可以有）

- [ ] 评价举报：用户可举报违规评价（接入 ContentReport 模型）
- [ ] 评价图片瀑布流：详情页评价区图片独立展示区（照片墙）
- [ ] 评价翻译：自动翻译外文评价（对标 Booking.com 自动翻译）
- [ ] "已朝圣"认证标记：行程 COMPLETED 后触发的评价显示认证勋章

---

## 5. 页面线框 / 交互设计

### 5.1 模块整体架构

本模块包含以下子页面/组件，各有独立 PRD：

| 文档 | 内容 | 嵌入位置 |
|------|------|---------|
| P05-PRD-评价列表组件.md | 星级分布图 + 评价卡片列表 | 圣地/祖庭/行程详情页底部 |
| P06-PRD-提交评价页.md | 写评价表单（Web弹窗/Mobile全页） | 详情页"写评价"按钮触发 |
| F04-PRD-评价图片上传.md | 图片选择/压缩/上传 | 嵌入提交评价页 |
| F05-PRD-评价管理后台.md | 审核列表/操作/官方回复 | Admin 后台独立页面 |

### 5.2 核心状态流转

```
用户提交评价
     ↓
  PENDING（待审核）
  ↙         ↘
APPROVED    REJECTED（附理由）
（前端可见）  （用户不可见）
     ↓
  HIDDEN（管理员隐藏，已发布后违规处理）
```

### 5.3 三态设计

| 状态 | 表现 |
|------|------|
| Loading | 评价列表区骨架屏（3条灰色卡片占位） |
| Empty | 插图 + "还没有评价，来做第一个评价者吧" + "写评价"按钮 |
| Error | 错误图标 + "加载失败，请重试" + 重试按钮 |

---

## 6. API 契约

### 6.1 现有 API 端点

当前 Review 模块无公开 API，本模块为全新建设。

### 6.2 新增 API 端点

#### `GET /api/reviews`

获取评价列表（仅返回 APPROVED 状态，Admin 端点另行说明）

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `entityType` | string | 是 | HOLY_SITE / TEMPLE / TRIP |
| `entityId` | string | 是 | 对应实体的 cuid |
| `sort` | string | 否 | newest（默认）/ helpful / highest |
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 10，最大 50 |

**响应格式:**

```json
{
  "items": [
    {
      "id": "clxxx",
      "userId": "clyyy",
      "userNickname": "旅行者小明",
      "userAvatar": "https://...",
      "rating": 5,
      "title": "震撼心灵的朝圣之旅",
      "content": "...",
      "photos": ["https://..."],
      "helpfulCount": 12,
      "isHelpful": false,
      "createdAt": "2026-03-01T10:00:00Z",
      "replies": [
        {
          "id": "clzzz",
          "isOfficial": true,
          "content": "感谢您的分享...",
          "createdAt": "2026-03-02T09:00:00Z"
        }
      ]
    }
  ],
  "total": 48,
  "page": 1,
  "pageSize": 10
}
```

#### `GET /api/reviews/stats`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `entityType` | string | 是 | HOLY_SITE / TEMPLE / TRIP |
| `entityId` | string | 是 | 实体 cuid |

**响应格式:**

```json
{
  "avgRating": 4.7,
  "reviewCount": 48,
  "distribution": {
    "5": 32,
    "4": 10,
    "3": 4,
    "2": 1,
    "1": 1
  }
}
```

#### `POST /api/reviews` （需 JWT）

**请求体:**

```json
{
  "entityType": "HOLY_SITE",
  "entityId": "clxxx",
  "rating": 5,
  "title": "可选标题",
  "content": "至少10个字的评价内容...",
  "photos": ["https://oss.../review-photos/uuid.jpg"]
}
```

**响应:** 201 Created，返回新建 Review 对象（status: PENDING）

#### `PATCH /api/reviews/:id` （需 JWT，限自己 PENDING 的评价）

**请求体:** 同 POST，字段全部可选

**错误码:**

| HTTP 状态码 | 错误码 | 说明 |
|------------|-------|------|
| 400 | INVALID_RATING | rating 不在 1-5 范围 |
| 400 | CONTENT_TOO_SHORT | content 少于 10 字 |
| 403 | NOT_YOUR_REVIEW | 非本人评价 |
| 403 | REVIEW_APPROVED | 已审核通过的评价不可编辑 |
| 404 | NOT_FOUND | 评价不存在 |
| 409 | DUPLICATE_REVIEW | 同一用户对同一实体已有评价 |

#### `DELETE /api/reviews/:id` （需 JWT，限自己的评价）

**响应:** 204 No Content

#### `POST /api/reviews/:id/vote` （需 JWT）

标记"有用"，已投票则返回 409

#### `DELETE /api/reviews/:id/vote` （需 JWT）

取消"有用"

#### `POST /api/reviews/:id/replies` （需 JWT）

**请求体:**
```json
{ "content": "回复内容..." }
```

#### `GET /api/admin/reviews` （需 Admin JWT）

**请求参数:** `status`（PENDING/APPROVED/REJECTED/HIDDEN）、`entityType`、`page`、`pageSize`

#### `PATCH /api/admin/reviews/:id/status` （需 Admin JWT）

**请求体:**
```json
{
  "status": "APPROVED",
  "reason": "可选拒绝理由"
}
```

---

## 7. 数据模型

### 7.1 Review 表升级

在现有 Review 模型基础上新增字段：

```prisma
model Review {
  id           String          @id @default(cuid())
  userId       String
  user         User            @relation(fields: [userId], references: [id])
  entityType   ReviewEntityType
  entityId     String
  rating       Int             // 1-5
  title        String?         // 新增: 评价标题(可选)
  content      String          @db.Text
  photos       String[]        // 原 images 字段重命名
  status       ReviewStatus    @default(PENDING)   // 新增
  helpfulCount Int             @default(0)         // 新增: 有用数冗余缓存
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  replies      ReviewReply[]   // 新增关联
  votes        ReviewVote[]    // 新增关联

  @@unique([userId, entityType, entityId])
  @@index([entityType, entityId])
  @@index([userId])
  @@index([status])
}
```

### 7.2 新增 ReviewReply 表

```prisma
model ReviewReply {
  id         String   @id @default(cuid())
  reviewId   String
  review     Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  userId     String
  isOfficial Boolean  @default(false)
  content    String   @db.Text
  createdAt  DateTime @default(now())

  @@index([reviewId])
}
```

### 7.3 新增 ReviewVote 表

```prisma
model ReviewVote {
  id        String   @id @default(cuid())
  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  userId    String
  createdAt DateTime @default(now())

  @@unique([reviewId, userId])
  @@index([reviewId])
}
```

### 7.4 新增枚举

```prisma
enum ReviewEntityType {
  HOLY_SITE
  TEMPLE
  TRIP
}

enum ReviewStatus {
  PENDING     // 待审核
  APPROVED    // 已发布
  REJECTED    // 已拒绝
  HIDDEN      // 已隐藏
}
```

### 7.5 HolySite / Temple 冗余字段

```prisma
// HolySite 新增:
avgRating   Float?  // 评价通过时同步更新
reviewCount Int     @default(0)

// Temple 新增:
avgRating   Float?
reviewCount Int     @default(0)
```

### 7.6 字段变更说明

| 变更 | 说明 |
|------|------|
| Review.targetType → entityType | 重命名，与枚举对齐 |
| Review.targetId → entityId | 重命名，语义更清晰 |
| Review.images → photos | 重命名，与路线产品命名一致 |
| 新增 Review.title | 可选标题，对标 TripAdvisor |
| 新增 Review.status | 审核状态，必须有默认值 PENDING |
| 新增 Review.helpfulCount | 冗余有用数，避免每次聚合 |

---

## 8. 技术约束

- **性能要求**: 评价列表首次加载 < 2s，评价提交 < 3s（含图片上传完成）
- **移动端**: 必须在 375px 宽度下正常显示，图片上传支持移动端原生相机/相册
- **兼容性**: Web 支持 Chrome 100+, Safari 15+，小程序支持微信基础库 3.0+
- **类型安全**: 禁止 any 类型（[R-01]），ReviewEntityType/ReviewStatus 枚举从 @zuting/shared-types 导出
- **认证**: GET /api/reviews 和 GET /api/reviews/stats 为公开接口；POST/PATCH/DELETE 需 JWT；Admin 端点需 ADMIN 角色
- **并发安全**: ReviewVote 的 UNIQUE 约束防止重复投票；Review 的 UNIQUE([userId, entityType, entityId]) 防止重复评价
- **图片上传**: 开发阶段用 multer 本地存储，生产阶段迁移阿里云 OSS（详见 F04-PRD）
- **特殊依赖**: 后端引入 multer（已有 Upload 模块可复用）

---

## 9. 验收标准

### 9.1 功能验收

| 编号 | 验收项 | 测试步骤 | 通过标准 |
|------|-------|---------|---------|
| AC-01 | 提交评价成功 | 登录用户访问圣地详情页，点击"写评价"，填写5星+至少10字内容，点击提交 | 响应 201，数据库 Review.status = PENDING，前端弹出"评价已提交，等待审核" |
| AC-02 | 未登录无法提交 | 未登录状态点击"写评价"按钮 | 跳转到登录页或弹出登录提示 |
| AC-03 | 重复评价被拒绝 | 同一用户对同一圣地再次提交评价 | 响应 409 DUPLICATE_REVIEW |
| AC-04 | 内容过短被拒绝 | 提交少于10字的评价内容 | 前端实时提示"评价内容至少10个字"，禁止提交 |
| AC-05 | 审核通过后可见 | 管理员在后台将评价状态改为 APPROVED | 圣地详情页评价列表出现该条评价 |
| AC-06 | 星级分布图正确 | 某圣地有3条5星评价、1条4星评价 | 统计接口返回 avgRating=4.75，distribution.5=3，distribution.4=1 |
| AC-07 | 有用投票生效 | 已登录用户点击某评价的"有用"按钮 | 评价 helpfulCount+1，按钮变为"已标记有用"状态 |
| AC-08 | 有用投票去重 | 同一用户对同一评价再次点击"有用" | 响应 409，前端显示已投票状态 |
| AC-09 | 官方回复展示 | 管理员通过后台添加官方回复 | 评价卡片底部显示官方回复区块，带"官方回复"标记 |
| AC-10 | 移动端正常 | 在 Chrome DevTools iPhone 14 (390px) 模拟下浏览评价列表和提交评价 | 无横向滚动条，最小可点击区域 ≥ 44×44px，表单可正常输入提交 |

### 9.2 性能验收

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 评价列表首屏 (LCP) | < 2s | Chrome DevTools Lighthouse |
| 评价统计 API 响应 | < 300ms | Network 面板（有冗余字段缓存后） |
| 图片上传单张 | < 5s (5MB 图片，正常网络) | Network 面板 |

### 9.3 完成标志

- [ ] 所有 P0 功能已实现并通过验收
- [ ] TypeScript 编译零错误（tsc --noEmit 通过）
- [ ] Prisma Schema 变更已 push 并通过 db:push
- [ ] 移动端响应式验证通过（375px/390px）
- [ ] 三态（loading/error/empty）全部实现
- [ ] PRD 验收表逐项打钩完成

---

## 10. 开发记录

### 10.1 实现进度

| 任务 | 负责人 | 开始日期 | 完成日期 | 状态 |
|------|-------|---------|---------|------|
| Prisma Schema 升级 | - | - | - | 未开始 |
| NestJS Review 模块实现 | - | - | - | 未开始 |
| Web 评价列表组件 | - | - | - | 未开始 |
| Web 提交评价弹窗 | - | - | - | 未开始 |
| Mobile 评价组件 | - | - | - | 未开始 |
| 小程序评价组件 | - | - | - | 未开始 |
| Admin 审核页面 | - | - | - | 未开始 |
| 图片上传功能 | - | - | - | 未开始 |
| 联调测试 | - | - | - | 未开始 |

### 10.2 变更记录

| 日期 | 变更内容 | 原因 | 更改者 |
|------|---------|------|-------|
| 2026-03-29 | 初版创建 | Phase B 评价系统立项 | CEO++ |

---

*本 PRD 遵循 SCP-03 PRD 先行铁律，子页面详细设计见 P05/P06/F04/F05 各独立 PRD。*
