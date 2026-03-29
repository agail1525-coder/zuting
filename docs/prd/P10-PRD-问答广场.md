# P10-PRD-问答广场

> **模块**: 攻略社区 — 问答广场 (Q&A Forum)
> **状态**: 草稿 v1.0
> **创建日期**: 2026-03-29
> **负责人**: CEO++
> **优先级**: Phase B (体验升级)
> **关联PRD**: M12-PRD-评价与社区.md

---

## 1. 产品背景与目标

### 1.1 背景

JOINUS.COM 定位为全球祖庭文化旅行平台 NO.1，需要建立强大的用户社区生态。问答广场作为 UGC 社区的核心组件，承载用户之间的知识交流与经验共享，帮助朝圣者解答疑惑、分享智慧，形成宗教文化知识沉淀。

### 1.2 目标

- **用户目标**: 让每位朝圣者都能快速找到旅行中遇到问题的解答，并贡献自己的智慧
- **产品目标**: 建立权威的祖庭旅行问答知识库，提升用户粘性与社区活跃度
- **商业目标**: 通过高质量 UGC 内容提升 SEO，吸引潜在用户，降低获客成本

### 1.3 成功指标 (OKR)

| 指标 | 目标值 (上线 3 个月) |
|------|---------------------|
| 日活问题数 | ≥ 50 条 |
| 问题回答率 | ≥ 70% |
| 平均回答时间 | ≤ 24 小时 |
| 用户满意度 (有用投票比) | ≥ 80% |
| 月活问答用户 | ≥ 500 人 |

---

## 2. 竞品对标分析

### 2.1 TripAdvisor Forums

**核心优势**:
- 按目的地分类的论坛结构，导航清晰
- "专家徽章"激励高质量回答者
- 问题与攻略深度关联，形成知识图谱
- 移动端体验流畅，支持离线浏览

**JOINUS 学习点**:
- 按信仰/圣地分类问题，对标 TripAdvisor 按目的地分类
- 设立"朝圣达人"认证徽章激励体系
- 问题与圣地详情页双向关联

### 2.2 Stack Overflow

**核心优势**:
- 问题状态系统 (Open/Answered/Closed)
- 最佳答案采纳机制 (绿色勾)
- 答案投票排序，优质内容自动置顶
- 标签系统强大，支持多维度分类
- 防重复提问提示

**JOINUS 学习点**:
- 复用问题状态机 (OPEN/ANSWERED/CLOSED)
- 采纳最佳答案功能 (提问者权限)
- upvote/downvote 投票机制
- 标签系统 (按信仰+主题双维度)

### 2.3 知乎

**核心优势**:
- 关注话题/用户的个性化 Feed
- 回答编辑器功能丰富 (图文混排)
- "赞同"/"感谢"/"收藏"三维互动
- 专业用户认证 (行业认证)
- 相关问题推荐算法精准

**JOINUS 学习点**:
- 富文本回答编辑器
- 相关问题侧边栏推荐
- 用户专业背景展示 (朝圣经历)
- 回答可被收藏

### 2.4 功能对比矩阵

| 功能点 | TripAdvisor | Stack Overflow | 知乎 | JOINUS (目标) |
|--------|-------------|----------------|------|---------------|
| 问题分类/标签 | 按目的地 | 多标签 | 话题 | 信仰+主题双维度 |
| 答案投票 | 有 | upvote/downvote | 赞同 | upvote/downvote |
| 最佳答案 | 无 | 采纳 | 无 | 采纳 (问题作者) |
| 问题状态 | 无 | OPEN/ANSWERED | 无 | OPEN/ANSWERED/CLOSED |
| 相关推荐 | 有 | 有 | 有 | 侧边栏+底部 |
| 富文本编辑 | 基础 | Markdown | 富文本 | Markdown |
| 用户认证 | 徽章 | 声誉值 | 专业认证 | 朝圣徽章 |
| 与内容联动 | 圣地关联 | 无 | 话题关联 | 圣地/祖庭/信仰关联 |

---

## 3. 用户故事

### 3.1 提问者

```
作为一位计划前往麦加朝圣的用户，
我希望能提问"第一次朝圣需要准备哪些证件？"并附上"伊斯兰教"标签，
以便获得有经验的朝圣者的专业解答。
```

```
作为问题作者，
我希望能将最有帮助的回答标记为"最佳答案"，
以便后来者能快速找到权威解答。
```

### 3.2 回答者

```
作为一位多次前往耶路撒冷朝圣的老用户，
我希望能看到未回答的问题列表，
以便及时为新手提供帮助并积累社区声誉。
```

```
作为回答者，
我希望能对其他回答进行投票，
以便帮助社区甄别高质量内容。
```

### 3.3 浏览者

```
作为一位对藏传佛教圣地感兴趣的访客，
我希望能按"藏传佛教"标签筛选问题，
以便快速找到与我相关的知识。
```

```
作为浏览者，
我希望在圣地详情页看到关联的问答，
以便不离开当前场景就能解决疑问。
```

---

## 4. 功能清单

### 4.1 P0 — 必须上线 (核心功能)

| 编号 | 功能 | 说明 |
|------|------|------|
| P0-01 | 问题列表页 | 展示所有问题，支持分页 |
| P0-02 | 列表排序筛选 | 最新/未回答/热门三个 Tab |
| P0-03 | 标签筛选 | 按信仰类型 + 主题标签筛选 |
| P0-04 | 提问表单 | 标题+内容+标签，验证非空 |
| P0-05 | 问题详情页 | 展示问题+全部回答 |
| P0-06 | 发布回答 | 登录用户可回答，Markdown 支持 |
| P0-07 | 答案投票 | upvote/downvote，登录必须 |
| P0-08 | 采纳最佳答案 | 仅问题作者可操作，每题仅一个 |
| P0-09 | 问题状态显示 | OPEN/ANSWERED/CLOSED 徽章 |
| P0-10 | 浏览量统计 | 每次访问详情页 +1 |

### 4.2 P1 — 重要功能 (第二轮)

| 编号 | 功能 | 说明 |
|------|------|------|
| P1-01 | 相关问题侧边栏 | 同标签/同圣地的其他问题推荐 |
| P1-02 | 圣地/祖庭关联 | 提问时可关联具体实体 |
| P1-03 | 问题搜索 | 全文搜索问题标题+内容 |
| P1-04 | 我的提问/回答 | 个人中心子页面 |
| P1-05 | 问题关注 | 关注后收到新回答通知 |
| P1-06 | 答案编辑 | 回答者可编辑自己的答案 |
| P1-07 | 问题关闭 | 管理员/作者可关闭问题 |
| P1-08 | 举报功能 | 举报违规问题/回答 |

### 4.3 P2 — 增值功能 (长期规划)

| 编号 | 功能 | 说明 |
|------|------|------|
| P2-01 | 朝圣达人认证 | 回答数≥20且满意度≥85%自动认证 |
| P2-02 | 问题悬赏 | 积分悬赏机制 |
| P2-03 | AI 辅助回答 | 小鸿参与回答低频问题 |
| P2-04 | 问题合并 | 管理员合并重复问题 |
| P2-05 | 每周精选 | 编辑推荐优质问答 |
| P2-06 | 多语言问答 | 中/英文答案并行 |

---

## 5. 页面线框 (ASCII)

### 5.1 问题列表页 `/community/questions`

```
┌─────────────────────────────────────────────────────────────┐
│ JOINUS.COM                              [登录] [注册]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  问答广场                              [+ 提问]             │
│  ─────────────────────────────────────────────────────      │
│                                                             │
│  [最新] [未回答 (42)] [热门]                                 │
│                                                             │
│  标签: [全部] [佛教] [道教] [基督教] [伊斯兰] [印度教]...   │
│        [行前准备] [住宿] [交通] [礼仪禁忌] [费用]            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [ANSWERED] 第一次去麦加朝觐，需要办哪些签证？         │   │
│  │ 标签: 伊斯兰教 · 行前准备 · 签证                      │   │
│  │ 小明问 · 2026-03-28 · 👁 1.2k · 💬 8 个回答          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [OPEN] 布达拉宫门票怎么预订？提前多久？               │   │
│  │ 标签: 藏传佛教 · 布达拉宫 · 门票                      │   │
│  │ 阿华问 · 2026-03-29 · 👁 340 · 💬 0 个回答            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [CLOSED] 五台山最佳朝圣季节是什么时候？               │   │
│  │ 标签: 佛教 · 五台山 · 最佳时机                        │   │
│  │ 李老师问 · 2026-03-20 · 👁 5.6k · 💬 24 个回答       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  [< 上一页]  第 1 / 12 页  [下一页 >]                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 问题详情页 `/community/questions/:id`

```
┌──────────────────────────────────────────┬──────────────────┐
│                                          │  相关问题        │
│  [ANSWERED] 第一次去麦加朝觐，需要办哪   │  ─────────────   │
│  些签证？                                │ · 麦加朝觐装备   │
│                                          │   清单？         │
│  标签: [伊斯兰教] [行前准备] [签证]      │ · 开斋节期间前   │
│  小明 · 2026-03-25 · 👁 1,234           │   往麦加需要...  │
│                                          │ · 伊斯兰圣地导   │
│  朝觐（Hajj）是伊斯兰教五功之一，每年   │   游推荐？       │
│  伊斯兰历12月8-12日举行。作为非穆斯林   │                  │
│  中国公民，需要准备以下材料：            │  热门标签        │
│  1. 有效护照 (有效期≥6个月)             │  ─────────────   │
│  2. 朝觐签证申请表...                   │  [佛教] [麦加]   │
│                                          │  [行前准备]      │
│  ────────────────────────────────        │  [布达拉宫]      │
│  8 个回答  ·  按投票排序 ▾              │  [五台山]        │
│  ────────────────────────────────        │                  │
│                                          │  提问统计        │
│  ┌────────────────────────────────────┐  │  ─────────────   │
│  │ ✅ 最佳答案                         │  │  今日: 12        │
│  │ 用户: 朝圣达人·阿里 [认证]          │  │  本周: 89        │
│  │                                    │  │  总计: 1,247     │
│  │ 朝觐签证由沙特政府统一签发，需通    │  │                  │
│  │ 过中国伊斯兰协会办理...            │  └──────────────────┘
│  │                                    │
│  │  [👍 128] [👎 2]                  │
│  └────────────────────────────────────┘
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 用户: 旅行者·小周                  │  │
│  │ 补充一点，朝觐名额有限制，中国每年 │  │
│  │ 约有2万名额，需提前报名...         │  │
│  │  [👍 45] [👎 1]                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ── 发表回答 ──────────────────────      │
│  ┌────────────────────────────────────┐  │
│  │ [Markdown 编辑器]                  │  │
│  │                                    │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│  [发布回答]                              │
└──────────────────────────────────────────┘
```

### 5.3 提问弹窗 / 提问页

```
┌──────────────────────────────────────────────────────┐
│  提出你的问题                               [× 关闭]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  问题标题 *                                          │
│  ┌────────────────────────────────────────────────┐  │
│  │ 例: 第一次去梵蒂冈，有什么注意事项？           │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  详细描述                                            │
│  ┌────────────────────────────────────────────────┐  │
│  │ 支持 Markdown 格式                             │  │
│  │                                                │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  标签 (最多 5 个)                                    │
│  [佛教 ×] [朝圣 ×]  + 添加标签...                   │
│                                                      │
│  关联圣地/祖庭 (可选)                                │
│  ┌────────────────────────────────────────────────┐  │
│  │ 搜索圣地名称...                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [取消]                             [发布问题]       │
└──────────────────────────────────────────────────────┘
```

---

## 6. 数据模型

### 6.1 Question 模型

```prisma
model Question {
  id          String         @id @default(cuid())
  userId      String
  title       String         @db.VarChar(200)
  content     String         @db.Text
  entityType  String?        // "holy_site" | "temple" | "religion"
  entityId    String?        // 关联实体 ID
  tags        String[]       // 标签列表
  status      QuestionStatus @default(OPEN)
  viewCount   Int            @default(0)
  answerCount Int            @default(0)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  user        User           @relation(fields: [userId], references: [id])
  answers     Answer[]

  @@index([userId])
  @@index([status])
  @@index([tags])
  @@index([entityType, entityId])
  @@index([createdAt(sort: Desc)])
}

enum QuestionStatus {
  OPEN
  ANSWERED
  CLOSED
}
```

### 6.2 Answer 模型

```prisma
model Answer {
  id         String   @id @default(cuid())
  questionId String
  userId     String
  content    String   @db.Text
  isAccepted Boolean  @default(false)
  voteCount  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id])
  votes      AnswerVote[]

  @@index([questionId])
  @@index([userId])
  @@index([isAccepted])
}
```

### 6.3 AnswerVote 模型 (防重复投票)

```prisma
model AnswerVote {
  id        String    @id @default(cuid())
  answerId  String
  userId    String
  voteType  VoteType  // UP | DOWN

  answer    Answer    @relation(fields: [answerId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id])

  @@unique([answerId, userId])  // 每用户每答案只能投一次
}

enum VoteType {
  UP
  DOWN
}
```

---

## 7. API 契约

### 7.1 获取问题列表

```
GET /api/questions

Query Params:
  tag       string?   标签名
  status    string?   OPEN | ANSWERED | CLOSED
  sort      string?   latest(默认) | unanswered | popular
  page      number    默认 1
  pageSize  number    默认 20，最大 50

Response 200:
{
  items: Question[],
  total: number,
  page: number,
  pageSize: number
}

Question DTO:
{
  id: string
  title: string
  tags: string[]
  status: "OPEN" | "ANSWERED" | "CLOSED"
  viewCount: number
  answerCount: number
  createdAt: string  // ISO8601
  author: {
    id: string
    name: string
    avatar: string | null
  }
  entityType: string | null
  entityId: string | null
  entityName: string | null  // 关联圣地/祖庭名称（冗余字段，前端显示用）
}
```

### 7.2 创建问题

```
POST /api/questions
Authorization: Bearer <token>

Body:
{
  title: string      // 必填，5-200字
  content: string    // 必填，10-5000字
  tags: string[]     // 必填，1-5个
  entityType?: string
  entityId?: string
}

Response 201: Question DTO (含 id)

Error 400: 标题/内容/标签校验失败
Error 401: 未登录
```

### 7.3 获取问题详情

```
GET /api/questions/:id

Response 200:
{
  ...Question DTO,
  content: string,
  answers: Answer[]  // 按 isAccepted DESC, voteCount DESC 排序
}

Answer DTO:
{
  id: string
  content: string
  isAccepted: boolean
  voteCount: number
  userVote: "UP" | "DOWN" | null  // 当前用户的投票状态（需登录）
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
    badge: string | null  // 朝圣达人徽章等
  }
}

Error 404: 问题不存在
```

### 7.4 发布回答

```
POST /api/questions/:id/answers
Authorization: Bearer <token>

Body:
{
  content: string  // 必填，10-5000字
}

Response 201: Answer DTO

Error 400: 内容校验失败
Error 401: 未登录
Error 404: 问题不存在
Error 409: 问题已关闭，不能回答
```

### 7.5 采纳最佳答案

```
POST /api/questions/:id/answers/:answerId/accept
Authorization: Bearer <token>

Response 200: { accepted: true }

Error 401: 未登录
Error 403: 非问题作者
Error 404: 问题或答案不存在

副作用:
- 将 Answer.isAccepted = true (自动取消之前被采纳的答案)
- 将 Question.status = ANSWERED
```

### 7.6 答案投票

```
POST /api/questions/:id/answers/:answerId/vote
Authorization: Bearer <token>

Body:
{
  voteType: "UP" | "DOWN"
}

Response 200:
{
  voteCount: number  // 最新票数
  userVote: "UP" | "DOWN" | null  // 若传相同类型则取消投票，返回 null
}

Error 400: voteType 非法
Error 401: 未登录
Error 403: 不能为自己的回答投票
Error 404: 答案不存在

投票逻辑:
- 同类型再次投票 = 取消投票
- 不同类型投票 = 切换投票方向
- UP +1 vote，DOWN -1 vote（voteCount = upvotes - downvotes）
```

### 7.7 获取相关问题

```
GET /api/questions/:id/related?limit=5

Response 200:
{
  items: QuestionListItem[]  // 同标签或同关联实体的其他问题
}
```

---

## 8. 业务规则

| 规则编号 | 规则描述 |
|----------|----------|
| BR-01 | 每个用户对同一答案只能投一次票，重复投同方向则取消 |
| BR-02 | 仅问题作者可采纳最佳答案 |
| BR-03 | 每个问题只能有一个最佳答案 |
| BR-04 | 采纳最佳答案后，问题状态自动变为 ANSWERED |
| BR-05 | CLOSED 状态的问题不允许继续回答 |
| BR-06 | 用户不能为自己的回答投票 |
| BR-07 | 问题浏览量：每次访问详情页 +1（后端原子操作，防并发脏写） |
| BR-08 | 答案列表排序：isAccepted 优先，其次 voteCount DESC |
| BR-09 | 标签数量限制：每个问题最多 5 个标签 |
| BR-10 | 问题/回答内容不允许包含 XSS，后端需 sanitize |

---

## 9. 非功能需求

### 9.1 性能

- 问题列表接口响应时间 ≤ 200ms (P95)
- 问题详情页（含答案）响应时间 ≤ 300ms (P95)
- 投票操作响应时间 ≤ 100ms
- 支持 100 并发用户同时访问

### 9.2 安全

- 所有写操作（提问/回答/投票/采纳）必须 JWT 认证
- 答案内容需服务端 HTML sanitize，防 XSS
- 提问/回答频率限制: 每用户每分钟最多 5 次
- 问题/答案内容需内容审核（关键词过滤）

### 9.3 可用性

- loading/error/empty 三态必须实现
- 投票操作支持乐观更新（Optimistic UI）
- 移动端响应式布局（375px 起）
- 分页组件支持键盘导航

---

## 10. 技术约束

### 10.1 前端 (Next.js 15 / React 19)

```
- 问题列表页使用 React Query (useInfiniteQuery 或 useQuery + 分页)
- 问题详情页 force-dynamic（避免 SSG 时需要后端运行）
- 投票操作使用 useMutation + optimistic update
- Markdown 渲染: react-markdown + rehype-sanitize
- 代码编辑器: 可选 @uiw/react-md-editor (轻量 Markdown 编辑器)
- 标签输入: 自定义 TagInput 组件（参考 P03 收藏夹组件规范）
```

### 10.2 后端 (NestJS 11 + Prisma 6)

```
- 新增 QuestionsModule，路径 services/api/src/modules/question/
- 浏览量用 Prisma $executeRaw 原子 UPDATE 防并发问题
- 投票用事务: AnswerVote upsert + Answer.voteCount 重新计算
- findMany 必须有 take 限制 (最大 50)，遵循 [R-64]
- 相关问题查询: 同标签 Prisma array_overlaps 或 JSON 查询
- 内容审核: 接入 services/api/src/common/content-filter 模块
```

### 10.3 数据库 (PostgreSQL 16)

```
- tags 字段用 String[] (PostgreSQL TEXT[])
- 相关问题查询可用 @> 操作符匹配标签交集
- Question 和 Answer 均需 createdAt 和 voteCount 索引
- AnswerVote 唯一约束: [answerId, userId]
```

---

## 11. 验收标准

### 11.1 功能验收 (AC)

| AC编号 | 验收项 | 测试方法 |
|--------|--------|----------|
| AC-01 | 问题列表按最新/未回答/热门正确排序 | 手动切换 Tab，观察排序结果 |
| AC-02 | 标签筛选后只显示含对应标签的问题 | 选择"佛教"标签，确认全部结果含佛教 |
| AC-03 | 提问表单空提交报错 | 直接点发布，检查表单校验提示 |
| AC-04 | 回答发布后立即显示在列表中 | 发布后刷新，确认显示最新回答 |
| AC-05 | 投票计数实时更新 | 点击 upvote，数字立即 +1 |
| AC-06 | 重复 upvote 取消投票 | 连续点两次 upvote，数字恢复原值 |
| AC-07 | 采纳最佳答案后答案置顶且有绿勾 | 点击采纳，验证排序和视觉变化 |
| AC-08 | 采纳后问题状态变为 ANSWERED | 返回列表页，确认状态徽章变化 |
| AC-09 | CLOSED 问题详情页隐藏回答输入框 | 访问 CLOSED 问题，确认无回答框 |
| AC-10 | 相关问题侧边栏展示同标签问题 | 检查侧边栏内容与当前问题标签一致 |
| AC-11 | 未登录用户投票跳转登录页 | 退出登录后点击 upvote |
| AC-12 | 移动端 375px 宽度正常显示 | Chrome DevTools 375px 模拟 |

### 11.2 性能验收

- Lighthouse Performance 分数 ≥ 80
- 首次内容绘制 (FCP) ≤ 1.5s
- 问题列表接口响应 ≤ 200ms

### 11.3 安全验收

- XSS 测试: 在回答中输入 `<script>alert(1)</script>`，不执行
- 越权测试: 用 User A Token 采纳 User B 的问题答案，返回 403
- 频率限制测试: 1 分钟内连续提问 6 次，第 6 次被限流

---

## 12. 开发计划

### Sprint B3 第一周

| 任务 | 负责端 | 工时估算 |
|------|--------|----------|
| Prisma Schema: Question + Answer + AnswerVote | API | 2h |
| QuestionsController + QuestionsService (CRUD) | API | 8h |
| 投票逻辑 (事务 + 防重复) | API | 4h |
| 采纳最佳答案逻辑 | API | 2h |
| 问题列表页 UI | Web | 6h |
| 问题详情页 UI (含答案列表) | Web | 8h |
| 提问弹窗 | Web | 4h |

### Sprint B3 第二周

| 任务 | 负责端 | 工时估算 |
|------|--------|----------|
| 相关问题侧边栏 | Web | 3h |
| 投票 Optimistic UI | Web | 3h |
| Mobile 端问答广场适配 | Mobile | 8h |
| 内容过滤集成 | API | 2h |
| E2E 测试 | 全端 | 4h |

---

*文档版本: v1.0 | 最后更新: 2026-03-29 | 下次评审: Sprint B3 启动会*
