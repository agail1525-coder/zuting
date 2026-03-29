# P11-PRD-照片墙

> **模块**: 攻略社区 — 照片墙 (Community Photo Wall)
> **状态**: 草稿 v1.0
> **创建日期**: 2026-03-29
> **负责人**: CEO++
> **优先级**: Phase B (体验升级)
> **关联PRD**: M12-PRD-评价与社区.md, F04-PRD-评价图片上传.md

---

## 1. 产品背景与目标

### 1.1 背景

视觉内容是旅行决策最重要的触发器。JOINUS.COM 需要一个能展示全球祖庭圣地之美的照片墙，让用户的朝圣瞬间成为他人的旅行灵感。照片墙兼具内容沉淀、社区氛围、品牌传播三重价值，是将平台从信息工具升级为精神社区的关键页面。

### 1.2 目标

- **用户目标**: 让朝圣者分享旅途中的神圣时刻，让潜在旅行者从中获得灵感与决策信心
- **产品目标**: 建立高质量的宗教圣地视觉内容库，强化品牌调性
- **商业目标**: 通过 UGC 图片内容提升 SEO 收录量，降低图片版权成本

### 1.3 成功指标 (OKR)

| 指标 | 目标值 (上线 3 个月) |
|------|---------------------|
| 累计照片数 | ≥ 2,000 张 |
| 月上传量 | ≥ 300 张 |
| 照片墙日 UV | ≥ 1,000 |
| 平均单张照片获赞数 | ≥ 5 |
| 精选照片数 (admin 认证) | ≥ 100 张 |

---

## 2. 竞品对标分析

### 2.1 TripAdvisor Photos

**核心优势**:
- 按目的地聚合照片，每个景点独立照片库
- 用户可上传照片并关联景点
- 照片按"最新"/"最受好评"排序
- 旅行者可为照片标注场景类型 (室内/室外/食物/住宿等)
- 照片自动出现在对应景点详情页

**JOINUS 学习点**:
- 照片与圣地/祖庭双向关联
- 场景标签系统
- 照片在实体详情页复用

### 2.2 Instagram Grid / Explore

**核心优势**:
- 瀑布流布局视觉冲击力强
- hashtag 过滤发现系统
- 点赞/评论/保存三维互动
- 图片 Lightbox 全屏沉浸体验
- 创作者主页聚合展示

**JOINUS 学习点**:
- Masonry 瀑布流布局（桌面端）
- 图片 Lightbox + 左右滑动
- 点赞互动
- 上传者主页链接

### 2.3 Unsplash

**核心优势**:
- 极简高质量视觉设计语言
- 图片元数据丰富 (相机/参数/地点)
- 精选集合 (Collections) 系统
- 下载/分享功能
- 搜索关键词联想精准

**JOINUS 学习点**:
- 精选照片集合 (编辑推荐)
- 图片元数据展示 (拍摄地/日期)
- 高质量照片展示规范
- 极简 UI 风格

### 2.4 Pinterest

**核心优势**:
- Masonry 瀑布流始祖，体验最成熟
- 无限滚动加载流畅
- 图片尺寸自适应保持原始比例
- Pin 到收藏夹功能
- 视觉相似推荐算法

**JOINUS 学习点**:
- 真正的 Masonry 布局（保持图片原始比例）
- 无限滚动 + 虚拟化
- 图片悬停显示快捷操作

### 2.5 功能对比矩阵

| 功能点 | TripAdvisor | Instagram | Unsplash | Pinterest | JOINUS (目标) |
|--------|-------------|-----------|----------|-----------|---------------|
| Masonry 布局 | 网格 | 方形格 | 瀑布流 | Masonry | Masonry |
| 圣地关联 | 景点关联 | hashtag | 无 | 无 | 圣地/祖庭/信仰 |
| Lightbox | 有 | 有 | 有 | 有 | 有+滑动 |
| 点赞 | 有 | 有 | 有 | 有 | 有 |
| 精选推荐 | 无 | Explore | Collections | 有 | 管理员精选 |
| 元数据 | 基础 | 地理位置 | 相机参数 | 少 | 地点+日期+作者 |
| 上传 | 有 | 有 | 投稿 | 有 | 有，需关联实体 |
| 标签过滤 | 场景类型 | hashtag | 关键词 | 类目 | 信仰+实体 |

---

## 3. 用户故事

### 3.1 内容消费者

```
作为一位计划前往五台山朝圣的用户，
我希望在照片墙上按"佛教"筛选，浏览其他朝圣者在五台山拍摄的照片，
以便直观了解圣地的真实景象，坚定我的出行决心。
```

```
作为访客，
我希望点击任意照片后能在 Lightbox 中全屏欣赏，并通过左右箭头浏览相邻照片，
以便沉浸式欣赏圣地之美，不被页面布局打断。
```

### 3.2 内容创作者

```
作为一位刚完成耶路撒冷朝圣的用户，
我希望上传我在哭墙拍摄的照片，关联"哭墙"圣地，添加"犹太教"标签，
以便我的照片出现在哭墙详情页和照片墙，与社区分享我的神圣时刻。
```

```
作为上传者，
我希望在上传照片时能添加简短说明和拍摄日期，
以便其他用户了解照片背后的朝圣故事。
```

### 3.3 管理员

```
作为内容管理员，
我希望能将优质照片标记为"精选"，
以便这些照片出现在照片墙顶部和首页展示区，提升平台视觉品质。
```

---

## 4. 功能清单

### 4.1 P0 — 必须上线 (核心功能)

| 编号 | 功能 | 说明 |
|------|------|------|
| P0-01 | 照片墙主页 | Masonry 布局，展示所有公开照片 |
| P0-02 | 精选照片区 | 顶部展示管理员精选，固定 6-12 张 |
| P0-03 | 按信仰类型筛选 | 12 大信仰标签筛选 |
| P0-04 | 按关联实体筛选 | 按圣地/祖庭名称筛选 |
| P0-05 | 照片 Lightbox | 点击全屏展示，支持左右导航 |
| P0-06 | 照片元数据展示 | 作者/关联圣地/拍摄日期/点赞数 |
| P0-07 | 照片点赞 | 登录用户可点赞，实时计数 |
| P0-08 | 照片上传 | 支持 JPEG/PNG/WebP，最大 10MB |
| P0-09 | 上传时关联实体 | 关联圣地/祖庭/信仰 |
| P0-10 | 无限滚动加载 | 每页 20 张，滚动到底自动加载 |

### 4.2 P1 — 重要功能 (第二轮)

| 编号 | 功能 | 说明 |
|------|------|------|
| P1-01 | 照片上传说明 | 支持简短文字描述 (200字内) |
| P1-02 | 圣地详情页照片集成 | 圣地/祖庭详情页展示关联照片 |
| P1-03 | 作者主页链接 | 点击作者名跳转其个人主页 |
| P1-04 | 收藏功能 | 照片收藏到 Wishlist |
| P1-05 | 照片分享 | 生成分享链接，支持复制 |
| P1-06 | 图片懒加载 | 使用 IntersectionObserver 优化性能 |
| P1-07 | 照片举报 | 举报违规图片 |
| P1-08 | 上传图片压缩 | 前端压缩至 1920px 内 |

### 4.3 P2 — 增值功能 (长期规划)

| 编号 | 功能 | 说明 |
|------|------|------|
| P2-01 | 照片评论 | 在 Lightbox 中评论互动 |
| P2-02 | 场景标签 | 室内/室外/日出/节日/建筑等 |
| P2-03 | AI 智能标签 | 上传时 AI 自动识别场景 |
| P2-04 | 地图模式 | 照片在地图上按 GPS 位置展示 |
| P2-05 | 用户相册 | 个人照片集合页 |
| P2-06 | 下载功能 | 下载原图（授权后） |

---

## 5. 页面线框 (ASCII)

### 5.1 照片墙主页 `/community/photos`

```
┌─────────────────────────────────────────────────────────────┐
│ JOINUS.COM                              [登录] [注册]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  圣地照片墙                            [+ 上传照片]         │
│  ─────────────────────────────────────────────────────      │
│                                                             │
│  ✨ 精选照片                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │          │ │          │ │          │ │          │       │
│  │  [精选]  │ │  [精选]  │ │  [精选]  │ │  [精选]  │       │
│  │  麦加    │ │  布达拉宫│ │  耶路撒冷│ │  五台山  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  全部照片                                                    │
│  筛选: [全部] [佛教] [道教] [基督教] [伊斯兰] [印度教]...   │
│  实体: [搜索圣地/祖庭名称...]                                │
│                                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │        │  │        │  │        │  │        │           │
│  │  图片A │  │        │  │  图片C │  │        │           │
│  │ (高)   │  │  图片B │  │ (矮)   │  │  图片D │           │
│  │        │  │ (中)   │  │        │  │ (高)   │           │
│  │ ♥ 128  │  │        │  │ ♥ 56   │  │        │           │
│  └────────┘  │        │  └────────┘  │        │           │
│              │ ♥ 89   │              │ ♥ 201  │           │
│  ┌────────┐  └────────┘  ┌────────┐  └────────┘           │
│  │        │              │        │              │
│  │  图片E │              │  图片F │              │
│  │ (矮)   │              │ (中)   │              │
│  │ ♥ 34   │              │ ♥ 77   │              │
│  └────────┘              └────────┘              │
│                                                             │
│              [加载更多...]                                   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 照片 Lightbox

```
┌─────────────────────────────────────────────────────────────┐
│ [×]                                              [< >]      │
│ ┌──────────────────────────────────────────────────────┐    │
│ │                                                      │    │
│ │                                                      │    │
│ │                   [ 照 片 全 屏 ]                    │    │
│ │                                                      │    │
│ │                                                      │    │
│ │                                                      │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                             │
│  [作者头像] 小明 · 2026-03-25                               │
│  布达拉宫日落时分，金顶在夕阳下熠熠生辉...                  │
│                                                             │
│  📍 布达拉宫 · 西藏拉萨   🏷 藏传佛教                       │
│                                                             │
│  [♥ 128 点赞] [🔗 分享] [🔖 收藏]                          │
│                                                             │
│  缩略图导航:                                                 │
│  ┌───┐ ┌───┐ ┌───┐ [当前] ┌───┐ ┌───┐ ┌───┐              │
│  │   │ │   │ │   │ █████ │   │ │   │ │   │              │
│  └───┘ └───┘ └───┘       └───┘ └───┘ └───┘              │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 上传照片弹窗

```
┌──────────────────────────────────────────────────────┐
│  上传照片                                   [× 关闭]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  │   📷  拖拽照片到此处，或点击选择文件          │    │
│  │        支持 JPG / PNG / WebP，最大 10MB      │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  关联圣地/祖庭 *                                     │
│  ┌──────────────────────────────────────────────┐    │
│  │ 搜索并选择圣地或祖庭名称...                  │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  信仰类别 *                                          │
│  ┌──────────────────────────────────────────────┐    │
│  │ 请选择信仰类别 ▾                             │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  照片说明 (选填，200字以内)                          │
│  ┌──────────────────────────────────────────────┐    │
│  │ 分享这张照片背后的故事...                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  拍摄日期 (选填)                                     │
│  ┌──────────────────────┐                           │
│  │ 2026-03-25           │                           │
│  └──────────────────────┘                           │
│                                                      │
│  ⚠ 上传即代表您拥有该照片版权，同意平台使用条款     │
│                                                      │
│  [取消]                             [上传照片]       │
└──────────────────────────────────────────────────────┘
```

### 5.4 移动端照片墙 (375px)

```
┌─────────────────────┐
│ ← 照片墙    [上传+] │
├─────────────────────┤
│ [全部][佛教][道教]  │
│  ←────────────────→ │
├─────────────────────┤
│ ✨ 精选              │
│ ┌────────────────┐  │
│ │                │  │
│ │   精选照片      │  │
│ │   横向滚动      │  │
│ └────────────────┘  │
├─────────────────────┤
│ ┌───────┐ ┌───────┐ │
│ │       │ │       │ │
│ │ 图片A │ │ 图片B │ │
│ │       │ │ (高)  │ │
│ │ ♥ 128 │ │       │ │
│ └───────┘ │       │ │
│           │ ♥ 56  │ │
│ ┌───────┐ └───────┘ │
│ │       │           │
│ │ 图片C │ ┌───────┐ │
│ │ (矮)  │ │       │ │
│ │ ♥ 34  │ │ 图片D │ │
│ └───────┘ │ ♥ 201 │ │
│           └───────┘ │
│                     │
│  [ 加载更多... ]    │
└─────────────────────┘
```

---

## 6. 数据模型

### 6.1 Photo 模型

```prisma
model Photo {
  id          String    @id @default(cuid())
  userId      String
  url         String    // CDN URL (压缩后)
  originalUrl String?   // 原图 URL (可选存储)
  width       Int       // 图片宽度（像素），用于 Masonry 计算比例
  height      Int       // 图片高度（像素）
  caption     String?   @db.VarChar(200)  // 照片说明
  entityType  String?   // "holy_site" | "temple" | "religion"
  entityId    String?   // 关联实体 ID
  entityName  String?   // 冗余字段，关联实体名称
  religion    String?   // 信仰类型（用于快速筛选）
  takenAt     DateTime? // 拍摄日期
  likeCount   Int       @default(0)
  isFeatured  Boolean   @default(false)  // 管理员精选
  isPublic    Boolean   @default(true)
  status      PhotoStatus @default(ACTIVE)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id])
  likes       PhotoLike[]

  @@index([userId])
  @@index([entityType, entityId])
  @@index([religion])
  @@index([isFeatured])
  @@index([createdAt(sort: Desc)])
  @@index([likeCount(sort: Desc)])
}

enum PhotoStatus {
  ACTIVE
  REPORTED
  REMOVED
}
```

### 6.2 PhotoLike 模型 (防重复点赞)

```prisma
model PhotoLike {
  id        String   @id @default(cuid())
  photoId   String
  userId    String
  createdAt DateTime @default(now())

  photo     Photo    @relation(fields: [photoId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@unique([photoId, userId])  // 每用户每照片只能点赞一次
  @@index([photoId])
  @@index([userId])
}
```

---

## 7. API 契约

### 7.1 获取照片墙列表

```
GET /api/photos/wall

Query Params:
  entityType  string?   "holy_site" | "temple" | "religion"
  entityId    string?   对应实体 ID
  religion    string?   信仰 slug（如 "buddhism", "islam"）
  sort        string?   latest(默认) | popular
  page        number    默认 1
  pageSize    number    默认 20，最大 40

Response 200:
{
  items: PhotoItem[],
  total: number,
  page: number,
  pageSize: number
}

PhotoItem DTO:
{
  id: string
  url: string          // 压缩后 CDN URL
  width: number        // 原始宽度（前端用于计算 Masonry 列高）
  height: number       // 原始高度
  caption: string | null
  entityType: string | null
  entityId: string | null
  entityName: string | null
  religion: string | null
  takenAt: string | null   // ISO8601
  likeCount: number
  isFeatured: boolean
  isLiked: boolean         // 当前用户是否已点赞（需登录，否则 false）
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
}
```

### 7.2 获取精选照片

```
GET /api/photos/featured?limit=12

Response 200:
{
  items: PhotoItem[]  // isFeatured=true，按 likeCount DESC
}
```

### 7.3 获取照片详情

```
GET /api/photos/:id

Response 200: PhotoItem (含完整 caption)

Error 404: 照片不存在或已删除
```

### 7.4 上传照片

```
POST /api/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Fields:
  file        File     必填，JPEG/PNG/WebP，最大 10MB
  entityType  string   必填，"holy_site" | "temple" | "religion"
  entityId    string   必填，关联实体 ID
  caption     string?  选填，最大 200 字
  takenAt     string?  选填，ISO8601 日期

Response 201: PhotoItem

Error 400: 文件格式不支持 / 文件过大 / 参数缺失
Error 401: 未登录
Error 404: entityId 对应实体不存在
Error 413: 文件超过 10MB

后端处理流程:
1. 校验文件格式和大小
2. 读取图片宽高（sharp 库）
3. 压缩至 1920px 宽（保持比例，WebP 格式，质量 85）
4. 上传至对象存储（OSS/S3），返回 CDN URL
5. 写入 Photo 记录，设置 religion 冗余字段（从实体推导）
```

### 7.5 照片点赞

```
POST /api/photos/:id/like
Authorization: Bearer <token>

Response 200:
{
  likeCount: number  // 最新点赞数
  isLiked: boolean   // 当前状态（true=已点赞，false=已取消）
}

逻辑: 已点赞则取消（toggle），未点赞则添加

Error 401: 未登录
Error 404: 照片不存在
```

### 7.6 管理员标记精选 (Admin Only)

```
PATCH /api/photos/:id/feature
Authorization: Bearer <admin-token>

Body:
{
  isFeatured: boolean
}

Response 200: PhotoItem

Error 401: 未登录
Error 403: 非管理员
Error 404: 照片不存在
```

### 7.7 删除照片

```
DELETE /api/photos/:id
Authorization: Bearer <token>

Response 204: 无内容

Error 401: 未登录
Error 403: 非照片作者且非管理员
Error 404: 照片不存在
```

---

## 8. 业务规则

| 规则编号 | 规则描述 |
|----------|----------|
| BR-01 | 每位用户对同一张照片只能点赞一次，重复点赞则取消 |
| BR-02 | 照片上传必须关联实体（圣地/祖庭/信仰），不允许无关联上传 |
| BR-03 | 精选照片只有管理员可以设置/取消 |
| BR-04 | 上传文件格式限制: JPEG, PNG, WebP |
| BR-05 | 上传文件大小限制: 单张不超过 10MB |
| BR-06 | 后端自动读取图片宽高并存储，用于前端 Masonry 布局计算 |
| BR-07 | 照片删除后关联的点赞记录级联删除 |
| BR-08 | 被举报照片状态变为 REPORTED，管理员审核后决定是否 REMOVED |
| BR-09 | REMOVED 状态照片不出现在公开展示中 |
| BR-10 | likeCount 字段通过事务与 PhotoLike 表同步，防并发脏写 |
| BR-11 | religion 字段在上传时由后端从关联实体推导，不由前端传入 |

---

## 9. 非功能需求

### 9.1 性能

- 照片墙列表接口响应时间 ≤ 300ms (P95)
- 图片全部使用 WebP 格式 + CDN 加速
- 图片懒加载: IntersectionObserver，viewport 外图片不加载
- Masonry 布局使用 CSS columns 或虚拟化滚动（超过 100 张时）
- 精选照片接口响应 ≤ 100ms（可缓存 5 分钟）

### 9.2 图片处理

- 前端上传前压缩: 宽度 > 1920px 时缩小，前端用 browser-image-compression
- 后端二次处理: sharp 库压缩至 WebP 85 质量，存储压缩版本
- 缩略图: 生成 400px 宽缩略图用于列表展示
- Lightbox: 展示压缩版原图（最大 1920px）

### 9.3 安全

- 上传文件必须验证 MIME 类型（不能仅依赖文件扩展名）
- 图片 URL 通过 CDN 签名防盗链
- 点赞操作频率限制: 每用户每秒最多 5 次
- 上传频率限制: 每用户每天最多 20 张

### 9.4 可用性

- loading/error/empty 三态必须实现
- 点赞操作支持 Optimistic UI（乐观更新）
- 上传过程显示进度条
- 移动端响应式布局（375px 起，双列 Masonry）
- 上传失败提供重试机制

---

## 10. 技术约束

### 10.1 前端 (Next.js 15 / React 19)

```
- Masonry 布局方案:
  方案A (推荐): CSS columns: 2/3/4 自适应，浏览器原生支持
  方案B: react-masonry-css（npm 包，按列数分组）
  方案C: Masonry.js（重型，不推荐）

- 图片组件: Next.js <Image> 组件，fill mode + object-fit: cover
- 无限滚动: react-intersection-observer + React Query useInfiniteQuery
- Lightbox: yet-another-react-lightbox（轻量，支持触摸滑动）
- 上传: react-dropzone + browser-image-compression
- 点赞 Optimistic UI: useMutation + onMutate/onError rollback

- 响应式 Masonry 列数:
  移动端 (< 768px): 2 列
  平板 (768px ~ 1024px): 3 列
  桌面 (> 1024px): 4 列
```

### 10.2 后端 (NestJS 11 + Prisma 6)

```
- 新增 PhotosModule，路径 services/api/src/modules/photo/
- 文件上传: @nestjs/platform-express + multer，内存限制 10MB
- 图片处理: sharp 库（读取宽高、压缩、转 WebP）
- 对象存储: 支持阿里云 OSS 或 AWS S3（通过环境变量切换）
- likeCount 维护: 使用事务同步 PhotoLike 表
- findMany 必须有 take 限制 (最大 40)，遵循 [R-64]
- 精选照片接口添加 Redis 缓存（TTL: 5 分钟）
```

### 10.3 数据库 (PostgreSQL 16)

```
- Photo.url, Photo.width, Photo.height 为必填字段
- PhotoLike 唯一约束: [photoId, userId]
- Photo 索引: (isFeatured), (religion), (entityType, entityId), (createdAt DESC), (likeCount DESC)
- 软删除: 使用 status = REMOVED 代替物理删除
```

### 10.4 对象存储规划

```
存储桶结构:
  photos/original/{userId}/{photoId}.webp   ← 原图（可选）
  photos/compressed/{userId}/{photoId}.webp ← 压缩版（1920px）
  photos/thumb/{userId}/{photoId}.webp      ← 缩略图（400px）

CDN 配置:
  - 列表页使用 /thumb/ 路径
  - Lightbox 使用 /compressed/ 路径
  - 缓存策略: Cache-Control: max-age=31536000, immutable
```

---

## 11. 验收标准

### 11.1 功能验收 (AC)

| AC编号 | 验收项 | 测试方法 |
|--------|--------|----------|
| AC-01 | Masonry 布局保持图片原始比例 | 上传高宽比不同的图片，确认无变形 |
| AC-02 | 精选照片区展示在普通照片上方 | 管理员标记精选后，刷新页面验证位置 |
| AC-03 | 按"佛教"筛选后只显示佛教相关照片 | 筛选后逐一检查照片 religion 字段 |
| AC-04 | 点击照片打开 Lightbox 全屏展示 | 点击任意照片，确认 Lightbox 打开 |
| AC-05 | Lightbox 左右箭头导航正常 | 在 Lightbox 中点击左右箭头，照片切换 |
| AC-06 | 移动端支持左右滑动导航 | 移动设备 Lightbox 中左右滑动手势 |
| AC-07 | 点赞后计数立即 +1（Optimistic UI） | 点击点赞，数字即时变化 |
| AC-08 | 再次点赞取消，计数 -1 | 连续点击两次点赞按钮 |
| AC-09 | 上传 JPEG/PNG/WebP 成功 | 分别上传三种格式，确认成功 |
| AC-10 | 上传超过 10MB 文件报错提示 | 上传 15MB 文件，确认错误提示 |
| AC-11 | 上传无关联实体报错 | 不选圣地直接上传，确认表单校验 |
| AC-12 | 无限滚动滚动到底自动加载更多 | 滚动到页面底部，确认新照片加载 |
| AC-13 | 未登录点击点赞提示登录 | 退出登录后点击点赞按钮 |
| AC-14 | 移动端 375px 双列 Masonry 正常 | Chrome DevTools 375px 模拟 |
| AC-15 | 照片上传后出现在对应圣地详情页 | 上传时关联某圣地，访问该圣地详情页 |

### 11.2 性能验收

- Lighthouse Performance 分数 ≥ 75
- 首屏 20 张图片加载完成 ≤ 3s（4G 网络）
- 照片墙列表接口响应 ≤ 300ms (P95)
- WebP 格式使用率 100%

### 11.3 安全验收

- 上传非图片文件（如 .exe 伪装为 .jpg）被拒绝
- 未登录用户无法上传
- 他人照片无法被非管理员删除（返回 403）
- 图片 URL 无法被 hotlink（CDN 防盗链生效）

---

## 12. 开发计划

### Sprint B3 第一周

| 任务 | 负责端 | 工时估算 |
|------|--------|----------|
| Prisma Schema: Photo + PhotoLike | API | 1h |
| PhotosModule: CRUD + 精选 API | API | 6h |
| 文件上传 + sharp 图片处理 | API | 4h |
| 点赞 toggle 逻辑（事务） | API | 2h |
| 照片墙 Masonry 布局实现 | Web | 8h |
| 精选照片区组件 | Web | 3h |

### Sprint B3 第二周

| 任务 | 负责端 | 工时估算 |
|------|--------|----------|
| Lightbox 组件（含滑动） | Web | 4h |
| 上传弹窗 + 进度条 | Web | 4h |
| 点赞 Optimistic UI | Web | 2h |
| 筛选器（信仰/实体） | Web | 3h |
| 无限滚动 useInfiniteQuery | Web | 3h |
| 圣地详情页照片集成 (P1) | Web | 3h |
| Mobile 端照片墙双列适配 | Mobile | 6h |
| Admin 端精选管理操作 | Admin | 2h |

---

## 13. 与其他模块的联动

| 联动模块 | 联动方式 |
|----------|----------|
| 圣地详情页 (M01) | 圣地详情页底部嵌入关联照片 (entityType=holy_site) |
| 祖庭详情页 (M02) | 祖庭详情页底部嵌入关联照片 (entityType=temple) |
| 收藏系统 (M14) | 照片支持加入 Wishlist (P1 功能) |
| 评价系统 (M15/F04) | 用户在提交评价时上传的图片可一键同步至照片墙 |
| 通知系统 (M11) | 照片被点赞/精选时推送通知给作者 |
| 个人中心 (M08) | 个人中心"我的照片"子页面展示用户上传记录 |
| 首页 (SCP-06) | 首页精选照片区调用 GET /api/photos/featured |

---

*文档版本: v1.0 | 最后更新: 2026-03-29 | 下次评审: Sprint B3 启动会*
