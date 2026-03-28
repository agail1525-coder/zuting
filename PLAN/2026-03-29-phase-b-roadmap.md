# JOINUS.COM Phase B 实施路线图

> 版本: v1.0 | 日期: 2026-03-29 | 状态: 待执行
> 负责人: CEO++ | 对标: Booking.com / TripAdvisor / Airbnb / Trip.com / Kayak

---

## 一、Phase B 总览

### 目标
在 Phase A 核心功能基础上，植入10大竞品的关键体验模块，使 JOINUS.COM 从内容展示平台升级为**完整旅行体验闭环平台**。

### 5大功能模块

| 模块 | 对标竞品 | 核心价值 | 优先级 |
|------|---------|---------|--------|
| B1-搜索系统 | Booking / Kayak / Skyscanner | 平台核心入口，用户找内容的第一路径 | P0 |
| B2-收藏系统 | Airbnb Wishlist | 轻量高频，提升留存与回访 | P0 |
| B3-评价系统 | TripAdvisor / Booking | UGC内容生产，建立信任与社区 | P1 |
| B4-推荐系统 | Booking / Trip.com | 消费UGC数据，提升转化与探索 | P1 |
| B5-攻略社区 | TripAdvisor / Trip.com | 深度社区，用户黏性与内容护城河 | P2 |

### Sprint规划

```
Sprint B1 (2周): 搜索系统 + 收藏系统
  → 最高ROI：搜索是平台核心体验，收藏是轻量但高频功能
  → 两者均为独立功能，无跨模块依赖

Sprint B2 (3周): 评价系统 + 推荐系统
  → 评价产生UGC内容，推荐消费UGC内容，互相依赖
  → 推荐系统依赖评价数据(评分)驱动排序

Sprint B3 (3周): 攻略社区
  → 最重社交功能，依赖评价系统的用户基础与行为数据
  → 新增独立数据模型(Guide/Post/Question/Answer)
```

---

## 二、Sprint B1：搜索系统 + 收藏系统

### 2.1 Sprint B1 目标
- 用户可在全站任意位置快速搜索圣地/祖庭/祖师/祖训
- 用户可收藏喜爱的圣地/祖庭，创建命名收藏夹并分享

---

### 2.2 功能一：全站搜索系统

**对标竞品**: Booking.com 目的地搜索 / Kayak 多维筛选器 / Skyscanner 极简搜索 UI

#### 需要创建的 PRD 文档

| 文档路径 | 内容 |
|---------|------|
| `docs/prd/M01-PRD-全站搜索系统.md` | 搜索模块主PRD，含竞品分析/用户故事/验收标准 |
| `docs/prd/P01-PRD-搜索结果页.md` | 搜索结果列表页详细设计，含筛选器/排序/分页 |
| `docs/prd/P02-PRD-搜索建议下拉框.md` | 搜索框 autocomplete 交互设计 |
| `docs/prd/F01-PRD-地图搜索.md` | 地图模式搜索功能(基于现有Leaflet集成) |
| `docs/prd/F02-PRD-搜索历史与热门搜索.md` | 本地搜索历史 + 全局热门搜索榜 |

#### 数据模型变更 (Prisma Schema)

```prisma
// 新增: 热门搜索词统计
model SearchStat {
  id        String   @id @default(cuid())
  keyword   String   @unique
  count     Int      @default(0)
  updatedAt DateTime @updatedAt
}

// 新增: 用户搜索历史 (存Redis，不入PG，但保留模型注释供参考)
// Redis key: search:history:{userId} → List<string> (最近20条)
// Redis key: search:hot → SortedSet (按count排序)

// 修改现有表: 为全文检索添加 tsvector 字段
// HolySite: 添加 searchVector Unsupported("tsvector")? @ignore
// Temple:   添加 searchVector Unsupported("tsvector")? @ignore
// Patriarch: 添加 searchVector Unsupported("tsvector")? @ignore
// Teaching: 添加 searchVector Unsupported("tsvector")? @ignore
```

**PostgreSQL 技术方案**:
```sql
-- 启用 pg_trgm 扩展(模糊匹配)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- HolySite 全文索引
ALTER TABLE "HolySite" ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(name, '') || ' ' ||
      coalesce("nameZh", '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce("descriptionZh", '') || ' ' ||
      coalesce(location, '') || ' ' ||
      coalesce(country, '')
    )
  ) STORED;

CREATE INDEX idx_holy_site_fts ON "HolySite" USING GIN(search_vector);
CREATE INDEX idx_holy_site_trgm ON "HolySite" USING GIN(name gin_trgm_ops, "nameZh" gin_trgm_ops);

-- Temple / Patriarch / Teaching 同理
```

#### API 新增端点

```
POST /api/search                          # 全站搜索主接口
  Body: { q, types[], religion, region, page, pageSize, sort }
  Response: { results: SearchResult[], total, facets }

GET  /api/search/suggestions?q=           # 搜索建议(autocomplete)
  Response: { suggestions: string[], entities: QuickResult[] }

GET  /api/search/hot                      # 热门搜索词
  Response: { keywords: { word: string, count: number }[] }

GET  /api/search/map?bounds=&filters=     # 地图模式搜索
  Response: { items: MapMarker[] }

POST /api/search/history                  # 记录搜索历史(需登录)
DELETE /api/search/history                # 清空搜索历史
GET  /api/search/history                  # 获取用户搜索历史
```

#### Web 页面变更

| 页面/组件 | 变更类型 | 说明 |
|---------|---------|------|
| `src/components/GlobalSearchBar.tsx` | 新建 | 全局搜索框组件，含autocomplete下拉 |
| `src/components/SearchSuggestions.tsx` | 新建 | 搜索建议下拉组件 |
| `src/app/search/page.tsx` | 新建 | 搜索结果页 |
| `src/app/search/components/SearchFilters.tsx` | 新建 | 筛选器面板(宗教/地区/评分/排序) |
| `src/app/search/components/SearchResultCard.tsx` | 新建 | 搜索结果卡片 |
| `src/app/search/components/SearchMapView.tsx` | 新建 | 地图模式视图(复用Leaflet) |
| `src/components/layout/Header.tsx` | 修改 | 顶部导航栏嵌入搜索框 |
| `src/app/page.tsx` | 修改 | 首页英雄区搜索框联动 |

#### Mobile (Expo) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `app/(tabs)/search.tsx` | 新建 | 新增搜索Tab(替换或新增第6 tab) |
| `components/SearchBar.tsx` | 新建 | 移动端搜索栏组件 |
| `components/SearchFiltersSheet.tsx` | 新建 | 底部弹出筛选器Sheet |
| `app/search-results.tsx` | 新建 | 搜索结果页 |

#### 微信小程序 (Taro) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/pages/search/index.tsx` | 新建 | 搜索主页 |
| `src/pages/search-results/index.tsx` | 新建 | 搜索结果页 |
| `src/components/SearchBar/index.tsx` | 新建 | 小程序搜索栏组件 |

#### Admin 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/pages/SearchStatsPage.tsx` | 新建 | 搜索词统计/热度分析 |
| `src/pages/DashboardPage.tsx` | 修改 | 新增搜索词热度图表 |

#### 预估工作量

| 层 | 新增文件 | 修改文件 |
|---|---------|---------|
| API (NestJS) | 5个(module/controller/service/dto/migration) | 1个(AppModule) |
| Web (Next.js) | 8个 | 2个 |
| Mobile (Expo) | 4个 | 1个 |
| 小程序 (Taro) | 3个 | 1个 |
| Admin | 2个 | 1个 |
| PRD文档 | 5个 | 0个 |
| **合计** | **27个** | **6个** |

#### 验收标准

- [ ] 在搜索框输入2个字符即出现autocomplete建议(≤200ms响应)
- [ ] 搜索"峨眉山"能返回相关圣地、祖庭、祖师
- [ ] 筛选"佛教"后结果全部为佛教相关内容
- [ ] 排序"评分最高"返回评分倒序(评价系统完成后验证)
- [ ] 地图模式显示搜索结果的地理位置标记
- [ ] 搜索历史在同设备跨页面持久化
- [ ] 热门搜索词显示真实统计数据
- [ ] Web/Mobile/小程序三端均可用
- [ ] tsc 0错误, 无 any 类型

---

### 2.3 功能二：收藏系统

**对标竞品**: Airbnb Wishlist / Booking.com 心愿单 / Trip.com 收藏夹

#### 需要创建的 PRD 文档

| 文档路径 | 内容 |
|---------|------|
| `docs/prd/M02-PRD-收藏系统.md` | 收藏模块主PRD |
| `docs/prd/P03-PRD-收藏夹列表页.md` | 我的收藏夹页面详细设计 |
| `docs/prd/P04-PRD-收藏夹详情页.md` | 单个收藏夹详情页(含分享功能) |
| `docs/prd/F03-PRD-收藏按钮组件.md` | 心形/书签收藏按钮通用组件规范 |

#### 数据模型变更 (Prisma Schema)

```prisma
// 新增: 收藏夹
model Collection {
  id          String   @id @default(cuid())
  userId      String
  name        String   @default("默认收藏夹")
  description String?
  coverImage  String?
  isPublic    Boolean  @default(false)
  shareToken  String?  @unique  // 用于分享链接
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  items       CollectionItem[]
}

// 新增: 收藏夹内容项
model CollectionItem {
  id           String     @id @default(cuid())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  entityType   CollectionEntityType
  entityId     String     // holySiteId / templeId / tripId
  note         String?    // 用户备注
  createdAt    DateTime   @default(now())

  @@unique([collectionId, entityType, entityId])
}

enum CollectionEntityType {
  HOLY_SITE
  TEMPLE
  TRIP
  PATRIARCH
}
```

#### API 新增端点

```
GET    /api/collections                         # 获取我的收藏夹列表
POST   /api/collections                         # 创建收藏夹
GET    /api/collections/:id                     # 获取收藏夹详情
PATCH  /api/collections/:id                     # 更新收藏夹信息
DELETE /api/collections/:id                     # 删除收藏夹

POST   /api/collections/:id/items               # 添加内容到收藏夹
DELETE /api/collections/:id/items/:itemId       # 从收藏夹移除

POST   /api/collections/:id/share              # 生成分享链接(shareToken)
GET    /api/collections/shared/:shareToken      # 通过分享链接访问(公开)

GET    /api/collections/check?entityType=&entityId=   # 检查某内容是否已收藏
POST   /api/collections/quick-save             # 快速收藏(自动存入默认收藏夹)
```

#### Web 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/app/collections/page.tsx` | 新建 | 我的收藏夹列表页 |
| `src/app/collections/[id]/page.tsx` | 新建 | 收藏夹详情页 |
| `src/app/collections/shared/[token]/page.tsx` | 新建 | 分享收藏夹公开页 |
| `src/components/SaveButton.tsx` | 新建 | 通用收藏按钮(心形) |
| `src/components/CollectionPicker.tsx` | 新建 | 选择收藏夹弹窗组件 |
| `src/app/holy-sites/[id]/page.tsx` | 修改 | 圣地详情页添加收藏按钮 |
| `src/app/temples/[id]/page.tsx` | 修改 | 祖庭详情页添加收藏按钮 |
| `src/app/profile/page.tsx` | 修改 | 个人中心新增"我的收藏"入口 |

#### Mobile (Expo) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `app/(tabs)/profile.tsx` | 修改 | 个人页添加收藏夹入口 |
| `app/collections/index.tsx` | 新建 | 收藏夹列表页 |
| `app/collections/[id].tsx` | 新建 | 收藏夹详情页 |
| `components/SaveButton.tsx` | 新建 | 移动端收藏按钮组件 |
| `app/holy-site/[id].tsx` | 修改 | 圣地详情添加收藏按钮 |
| `app/temple/[id].tsx` | 修改 | 祖庭详情添加收藏按钮 |

#### 微信小程序 (Taro) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/pages/collections/index.tsx` | 新建 | 收藏夹列表页 |
| `src/pages/collection-detail/index.tsx` | 新建 | 收藏夹详情页 |
| `src/components/SaveButton/index.tsx` | 新建 | 收藏按钮组件 |

#### Admin 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| 无新增 | — | 收藏数据通过 Dashboard 统计图表展示即可 |
| `src/pages/DashboardPage.tsx` | 修改 | 新增"最多被收藏的内容 Top10"图表 |

#### 预估工作量

| 层 | 新增文件 | 修改文件 |
|---|---------|---------|
| API (NestJS) | 4个(module/controller/service/dto) | 1个(AppModule) |
| Web (Next.js) | 5个 | 3个 |
| Mobile (Expo) | 4个 | 3个 |
| 小程序 (Taro) | 3个 | 2个 |
| Admin | 0个 | 1个 |
| PRD文档 | 4个 | 0个 |
| **合计** | **20个** | **10个** |

#### 验收标准

- [ ] 用户可在圣地详情页点击心形按钮一键收藏
- [ ] 收藏时可选择现有收藏夹或新建收藏夹
- [ ] 收藏夹支持命名、封面图、公开/私有设置
- [ ] 分享链接打开后未登录用户可查看公开收藏夹
- [ ] 再次点击心形按钮可取消收藏
- [ ] 个人中心"我的收藏"显示所有收藏夹
- [ ] 收藏状态跨端同步(Web/Mobile均显示已收藏)
- [ ] tsc 0错误, 无 any 类型

---

### 2.4 Sprint B1 总计

| 项目 | 数量 |
|------|------|
| PRD文档 | 9个 |
| API新增文件 | 9个 |
| Web新增文件 | 13个 |
| Mobile新增文件 | 8个 |
| 小程序新增文件 | 6个 |
| Admin修改文件 | 2个 |
| **总文件数** | **~47个** |
| **预估工期** | **10个工作日** |

---

## 三、Sprint B2：评价系统 + 推荐系统

### 3.1 Sprint B2 目标
- 用户可为圣地/祖庭/行程提交星级评价+文字+图片
- 平台基于内容标签/宗教/地区/评分智能推荐相关内容

---

### 3.2 功能三：UGC评价系统

**对标竞品**: TripAdvisor 评价体系 / Booking.com Guest Reviews / 大众点评

#### 需要创建的 PRD 文档

| 文档路径 | 内容 |
|---------|------|
| `docs/prd/M03-PRD-UGC评价系统.md` | 评价模块主PRD |
| `docs/prd/P05-PRD-评价列表组件.md` | 评价展示列表组件(嵌入详情页) |
| `docs/prd/P06-PRD-提交评价页.md` | 写评价页面/弹窗 |
| `docs/prd/F04-PRD-评价图片上传.md` | 图片上传功能(阿里云OSS) |
| `docs/prd/F05-PRD-评价管理后台.md` | 管理员审核/回复/删除评价 |

#### 数据模型变更 (Prisma Schema)

```prisma
// 新增: 评价主表
model Review {
  id           String       @id @default(cuid())
  userId       String
  entityType   ReviewEntityType
  entityId     String       // holySiteId / templeId / tripId
  rating       Int          // 1-5星
  title        String?
  content      String
  photos       String[]     // OSS图片URL列表
  status       ReviewStatus @default(PENDING)
  helpfulCount Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  replies      ReviewReply[]
  votes        ReviewVote[]

  @@index([entityType, entityId])
  @@index([userId])
}

// 新增: 评价回复(管理员/用户)
model ReviewReply {
  id        String   @id @default(cuid())
  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  userId    String
  isOfficial Boolean @default(false)  // 官方回复标记
  content   String
  createdAt DateTime @default(now())
}

// 新增: 有用投票
model ReviewVote {
  id        String   @id @default(cuid())
  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  userId    String
  createdAt DateTime @default(now())

  @@unique([reviewId, userId])  // 每人每评价只能投一次
}

enum ReviewEntityType {
  HOLY_SITE
  TEMPLE
  TRIP
}

enum ReviewStatus {
  PENDING     // 待审核
  APPROVED    // 已发布
  REJECTED    // 已拒绝
  HIDDEN      // 隐藏
}

// 修改: HolySite 表新增评分聚合字段(冗余存储提升查询性能)
// HolySite: avgRating Float? / reviewCount Int @default(0)
// Temple:   avgRating Float? / reviewCount Int @default(0)
```

#### API 新增端点

```
GET    /api/reviews?entityType=&entityId=&page=&sort=  # 获取评价列表
POST   /api/reviews                                     # 提交评价(需登录)
GET    /api/reviews/:id                                 # 获取单条评价
PATCH  /api/reviews/:id                                 # 编辑自己的评价
DELETE /api/reviews/:id                                 # 删除自己的评价

POST   /api/reviews/:id/replies                         # 回复评价
POST   /api/reviews/:id/vote                            # 标记"有用"
DELETE /api/reviews/:id/vote                            # 取消"有用"

GET    /api/reviews/stats?entityType=&entityId=         # 获取评价统计(星级分布)

# Admin专用
GET    /api/admin/reviews?status=&page=                 # 待审核评价列表
PATCH  /api/admin/reviews/:id/status                    # 审核通过/拒绝/隐藏
POST   /api/admin/reviews/:id/replies                   # 官方回复

# 图片上传
POST   /api/uploads/review-photos                       # 上传评价图片到OSS
```

#### Web 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/components/ReviewList.tsx` | 新建 | 评价列表通用组件 |
| `src/components/ReviewCard.tsx` | 新建 | 单条评价卡片 |
| `src/components/RatingSummary.tsx` | 新建 | 评分摘要(星级分布图) |
| `src/components/WriteReview.tsx` | 新建 | 写评价弹窗/表单 |
| `src/components/StarRating.tsx` | 新建 | 星级评分组件 |
| `src/app/holy-sites/[id]/page.tsx` | 修改 | 嵌入评价列表+评分摘要 |
| `src/app/temples/[id]/page.tsx` | 修改 | 嵌入评价列表+评分摘要 |
| `src/app/trips/[id]/page.tsx` | 修改 | 行程完成后可发起评价 |

#### Mobile (Expo) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `components/ReviewList.tsx` | 新建 | 移动端评价列表 |
| `components/StarRating.tsx` | 新建 | 星级评分组件 |
| `app/write-review.tsx` | 新建 | 写评价页面 |
| `app/holy-site/[id].tsx` | 修改 | 嵌入评价区块 |
| `app/temple/[id].tsx` | 修改 | 嵌入评价区块 |

#### 微信小程序 (Taro) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/components/ReviewList/index.tsx` | 新建 | 评价列表组件 |
| `src/components/StarRating/index.tsx` | 新建 | 星级组件 |
| `src/pages/write-review/index.tsx` | 新建 | 写评价页面 |

#### Admin 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/pages/ReviewManagePage.tsx` | 新建 | 评价审核管理页(含批量审核/回复) |
| `src/pages/DashboardPage.tsx` | 修改 | 新增"待审核评价"待办提醒 |

#### 图片上传技术方案 (阿里云OSS)

```
推荐方案: 前端直传OSS(STS临时凭证)
流程:
  1. 前端向后端申请STS临时凭证 POST /api/uploads/sts
  2. 后端调用阿里云STS服务返回临时AK/SK/Token
  3. 前端直接上传至OSS(绕过后端，减轻服务器压力)
  4. 上传成功后将OSS URL存入Review.photos[]

环境变量:
  OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET
  OSS_BUCKET / OSS_REGION / OSS_CDN_DOMAIN

备选方案(开发阶段): 本地文件存储(multer)，后期迁移OSS
```

#### 预估工作量

| 层 | 新增文件 | 修改文件 |
|---|---------|---------|
| API (NestJS) | 6个 | 1个 |
| Web (Next.js) | 5个 | 3个 |
| Mobile (Expo) | 3个 | 2个 |
| 小程序 (Taro) | 3个 | 2个 |
| Admin | 1个 | 1个 |
| PRD文档 | 5个 | 0个 |
| **合计** | **23个** | **9个** |

#### 验收标准

- [ ] 用户可在圣地详情页提交1-5星+文字评价
- [ ] 评价可上传最多9张图片
- [ ] 评价提交后进入"待审核"状态，管理员审核后发布
- [ ] 评价列表支持按"最新"/"最有用"/"最高分"排序
- [ ] 每个评价可标记"有用"，每人只能标记一次
- [ ] 管理员可在后台审核/回复/隐藏评价
- [ ] 圣地/祖庭详情页显示平均评分和星级分布图
- [ ] tsc 0错误, 图片上传有文件类型和大小校验

---

### 3.3 功能四：推荐系统

**对标竞品**: Booking.com "Similar properties" / Trip.com "猜你喜欢" / Airbnb "相关房源"

#### 需要创建的 PRD 文档

| 文档路径 | 内容 |
|---------|------|
| `docs/prd/M04-PRD-推荐系统.md` | 推荐模块主PRD，含算法设计 |
| `docs/prd/P07-PRD-首页个性化推荐.md` | 首页推荐区块详细设计 |
| `docs/prd/F06-PRD-相关推荐组件.md` | 详情页"相关推荐"通用组件 |
| `docs/prd/F07-PRD-最近浏览.md` | 最近浏览历史功能 |

#### 数据模型变更 (Prisma Schema)

```prisma
// 新增: 用户行为记录(驱动推荐)
model UserViewHistory {
  id         String   @id @default(cuid())
  userId     String?  // 可选，未登录用户用sessionId
  sessionId  String?
  entityType String   // HOLY_SITE / TEMPLE / PATRIARCH
  entityId   String
  viewedAt   DateTime @default(now())

  @@index([userId, viewedAt])
  @@index([entityType, entityId])
}

// Redis冗余: user:views:{userId} → List<{type,id}> (最近50条，TTL 30天)
// Redis冗余: entity:views:{type}:{id} → Int (浏览计数，用于热度排序)
```

**推荐算法设计(基于内容，Phase B)**:

```
算法 V1 (Sprint B2): 基于内容的规则推荐
  输入: 当前浏览的 entity (type + id)
  输出: 相关 entity 列表

  规则优先级:
  1. 同宗教 + 同地区 → 权重最高
  2. 同宗教 + 不同地区 → 权重次之
  3. 同地区 + 不同宗教 → 权重再次
  4. 评分最高 → 基础兜底

算法 V2 (Sprint B3/Phase C): 协同过滤
  输入: 用户行为矩阵(浏览/收藏/评价)
  输出: "看了A的人也看了B"
  依赖: 足够的用户行为数据(>1000条)
```

#### API 新增端点

```
GET /api/recommendations/related?entityType=&entityId=&limit=   # 相关推荐(详情页)
GET /api/recommendations/homepage                               # 首页推荐(需登录返回个性化)
GET /api/recommendations/popular?religion=&region=             # 热门推荐
GET /api/recommendations/nearby?lat=&lng=&radius=              # 附近热门(地理位置)

GET /api/user/view-history?limit=                              # 用户最近浏览
POST /api/user/view-history                                    # 记录浏览(后台静默调用)
DELETE /api/user/view-history                                  # 清空浏览历史
```

#### Web 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/components/RelatedEntities.tsx` | 新建 | "相关推荐"横向滚动卡片列表 |
| `src/components/RecentlyViewed.tsx` | 新建 | "最近浏览"组件 |
| `src/components/HomepageRecommendations.tsx` | 新建 | 首页个性化推荐区块 |
| `src/app/holy-sites/[id]/page.tsx` | 修改 | 底部添加"相关圣地"推荐 |
| `src/app/temples/[id]/page.tsx` | 修改 | 底部添加"相关祖庭"推荐 |
| `src/app/page.tsx` | 修改 | 首页添加"为你推荐"区块 |

#### Mobile (Expo) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `components/RelatedEntities.tsx` | 新建 | 移动端相关推荐组件 |
| `components/RecentlyViewed.tsx` | 新建 | 最近浏览组件 |
| `app/(tabs)/index.tsx` | 修改 | 首页添加个性化推荐区块 |
| `app/holy-site/[id].tsx` | 修改 | 添加相关推荐 |

#### 微信小程序 (Taro) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/components/RelatedEntities/index.tsx` | 新建 | 相关推荐组件 |
| `src/pages/index/index.tsx` | 修改 | 首页添加推荐区块 |

#### Admin 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/pages/DashboardPage.tsx` | 修改 | 新增"浏览热度 Top10"图表 |

#### 预估工作量

| 层 | 新增文件 | 修改文件 |
|---|---------|---------|
| API (NestJS) | 4个 | 1个 |
| Web (Next.js) | 3个 | 3个 |
| Mobile (Expo) | 2个 | 2个 |
| 小程序 (Taro) | 1个 | 1个 |
| Admin | 0个 | 1个 |
| PRD文档 | 4个 | 0个 |
| **合计** | **14个** | **8个** |

#### 验收标准

- [ ] 圣地详情页底部显示"相关圣地"至少4个推荐项
- [ ] 推荐内容与当前页面同宗教(相关性验证)
- [ ] 首页"为你推荐"区块对登录用户返回个性化内容
- [ ] 首页"为你推荐"区块对未登录用户返回热门内容
- [ ] "最近浏览"显示用户最近10条浏览记录
- [ ] "附近热门"基于GPS坐标返回50km内圣地
- [ ] 推荐接口响应时间≤300ms(Redis缓存加速)

---

### 3.4 Sprint B2 总计

| 项目 | 数量 |
|------|------|
| PRD文档 | 9个 |
| API新增文件 | 10个 |
| Web新增文件 | 8个 |
| Mobile新增文件 | 5个 |
| 小程序新增文件 | 4个 |
| Admin修改文件 | 2个 |
| **总文件数** | **~38个** |
| **预估工期** | **15个工作日** |

---

## 四、Sprint B3：攻略社区

### 4.1 Sprint B3 目标
- 建立朝圣者社区，用户可发布游记/攻略/问答
- 照片墙展示社区精选图片
- 用户主页显示旅行数据与社区影响力

---

### 4.2 功能五：攻略社区

**对标竞品**: TripAdvisor 旅行者社区 / Trip.com 攻略 / 马蜂窝游记

#### 需要创建的 PRD 文档

| 文档路径 | 内容 |
|---------|------|
| `docs/prd/M05-PRD-攻略社区.md` | 攻略社区主PRD |
| `docs/prd/P08-PRD-社区首页.md` | 社区发现页面设计 |
| `docs/prd/P09-PRD-游记攻略编辑器.md` | 富文本游记编辑器 |
| `docs/prd/P10-PRD-问答广场.md` | Q&A 问答页面 |
| `docs/prd/P11-PRD-照片墙.md` | 社区照片展示墙(Masonry布局) |
| `docs/prd/P12-PRD-用户主页.md` | 用户公开主页(旅行统计+社区贡献) |
| `docs/prd/F08-PRD-社区排行榜.md` | 用户贡献排行榜/内容热度榜 |

#### 数据模型变更 (Prisma Schema)

```prisma
// 新增: 游记/攻略
model Guide {
  id          String      @id @default(cuid())
  userId      String
  title       String
  coverImage  String?
  content     String      // Markdown/富文本
  entityType  String?     // 关联的圣地/祖庭类型
  entityId    String?     // 关联实体ID
  tags        String[]    // 标签
  status      GuideStatus @default(DRAFT)
  viewCount   Int         @default(0)
  likeCount   Int         @default(0)
  commentCount Int        @default(0)
  publishedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  comments    GuideComment[]
  likes       GuideLike[]
}

// 新增: 游记评论
model GuideComment {
  id        String   @id @default(cuid())
  guideId   String
  guide     Guide    @relation(fields: [guideId], references: [id], onDelete: Cascade)
  userId    String
  content   String
  createdAt DateTime @default(now())
}

// 新增: 游记点赞
model GuideLike {
  id        String   @id @default(cuid())
  guideId   String
  guide     Guide    @relation(fields: [guideId], references: [id], onDelete: Cascade)
  userId    String
  createdAt DateTime @default(now())

  @@unique([guideId, userId])
}

// 新增: 问答
model Question {
  id          String     @id @default(cuid())
  userId      String
  title       String
  content     String
  entityType  String?
  entityId    String?
  tags        String[]
  status      QuestionStatus @default(OPEN)
  viewCount   Int        @default(0)
  answerCount Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  answers     Answer[]
}

// 新增: 问答回答
model Answer {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userId     String
  content    String
  isAccepted Boolean  @default(false)
  voteCount  Int      @default(0)
  createdAt  DateTime @default(now())
}

// 新增: 用户主页扩展信息
model UserProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  displayName   String?
  avatar        String?
  bio           String?
  location      String?
  pilgrimLevel  Int      @default(1)  // 1-10级朝圣者等级
  totalTrips    Int      @default(0)
  totalSites    Int      @default(0)  // 到访圣地数
  guideCount    Int      @default(0)
  reviewCount   Int      @default(0)
  followerCount Int      @default(0)
  followingCount Int     @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum GuideStatus {
  DRAFT
  PUBLISHED
  HIDDEN
}

enum QuestionStatus {
  OPEN
  ANSWERED
  CLOSED
}
```

#### API 新增端点

```
# 游记/攻略
GET    /api/guides?tag=&religion=&page=              # 攻略列表(社区发现)
POST   /api/guides                                   # 创建游记草稿
GET    /api/guides/:id                               # 游记详情
PATCH  /api/guides/:id                               # 更新游记
DELETE /api/guides/:id                               # 删除游记
POST   /api/guides/:id/publish                       # 发布游记

GET    /api/guides/:id/comments                      # 游记评论列表
POST   /api/guides/:id/comments                      # 发布评论
POST   /api/guides/:id/like                          # 点赞
DELETE /api/guides/:id/like                          # 取消点赞

# 问答
GET    /api/questions?tag=&status=&page=             # 问题列表
POST   /api/questions                                # 提问
GET    /api/questions/:id                            # 问题详情+回答
POST   /api/questions/:id/answers                    # 回答问题
POST   /api/questions/:id/answers/:answerId/accept  # 采纳回答
POST   /api/questions/:id/answers/:answerId/vote    # 给回答投票

# 照片墙
GET    /api/photos/wall?entityType=&entityId=        # 按实体获取照片墙
GET    /api/photos/featured                          # 精选照片(管理员推荐)

# 用户主页
GET    /api/users/:userId/profile                    # 用户公开主页信息
GET    /api/users/:userId/guides                     # 用户发布的游记
GET    /api/users/:userId/reviews                    # 用户的评价
GET    /api/users/me/profile                         # 我的主页
PATCH  /api/users/me/profile                         # 更新个人信息

# 社区排行榜
GET    /api/community/leaderboard?type=guides|reviews|trips  # 排行榜
GET    /api/community/trending                       # 当前热门内容
```

#### Web 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/app/community/page.tsx` | 新建 | 社区发现首页(瀑布流) |
| `src/app/community/guides/page.tsx` | 新建 | 游记攻略列表 |
| `src/app/community/guides/[id]/page.tsx` | 新建 | 游记详情页 |
| `src/app/community/guides/write/page.tsx` | 新建 | 游记编辑器页(Markdown+富文本) |
| `src/app/community/questions/page.tsx` | 新建 | 问答广场列表 |
| `src/app/community/questions/[id]/page.tsx` | 新建 | 问答详情页 |
| `src/app/community/photos/page.tsx` | 新建 | 社区照片墙(Masonry布局) |
| `src/app/community/leaderboard/page.tsx` | 新建 | 排行榜页 |
| `src/app/users/[userId]/page.tsx` | 新建 | 用户公开主页 |
| `src/app/profile/page.tsx` | 修改 | 个人中心添加社区数据统计 |
| `src/app/holy-sites/[id]/page.tsx` | 修改 | 添加相关游记/照片墙区块 |
| `src/components/layout/Navigation.tsx` | 修改 | 顶部导航新增"社区"入口 |

#### Mobile (Expo) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `app/(tabs)/community.tsx` | 新建 | 社区Tab(替换现有tab之一) |
| `app/community/guides/index.tsx` | 新建 | 游记列表 |
| `app/community/guides/[id].tsx` | 新建 | 游记详情 |
| `app/community/questions/index.tsx` | 新建 | 问答列表 |
| `app/community/questions/[id].tsx` | 新建 | 问答详情 |
| `app/write-guide.tsx` | 新建 | 发布游记页 |
| `components/PhotoWall.tsx` | 新建 | 照片墙组件(FlatList优化) |
| `app/users/[userId].tsx` | 新建 | 用户主页 |

#### 微信小程序 (Taro) 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/pages/community/index.tsx` | 新建 | 社区首页 |
| `src/pages/guide-detail/index.tsx` | 新建 | 游记详情 |
| `src/pages/write-guide/index.tsx` | 新建 | 发布游记 |
| `src/pages/questions/index.tsx` | 新建 | 问答广场 |
| `src/pages/user-profile/index.tsx` | 新建 | 用户主页 |

#### Admin 页面变更

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| `src/pages/CommunityManagePage.tsx` | 新建 | 游记/问答内容审核管理 |
| `src/pages/UserManagePage.tsx` | 新建 | 用户管理页(查看社区活跃度) |
| `src/pages/DashboardPage.tsx` | 修改 | 新增社区活跃度统计 |

#### 预估工作量

| 层 | 新增文件 | 修改文件 |
|---|---------|---------|
| API (NestJS) | 8个 | 1个 |
| Web (Next.js) | 9个 | 3个 |
| Mobile (Expo) | 8个 | 1个 |
| 小程序 (Taro) | 5个 | 1个 |
| Admin | 2个 | 1个 |
| PRD文档 | 7个 | 0个 |
| **合计** | **39个** | **7个** |

#### 验收标准

- [ ] 用户可创建、编辑、发布 Markdown 格式游记
- [ ] 游记支持封面图+标签+关联圣地
- [ ] 问答广场可提问、回答、采纳最佳回答
- [ ] 照片墙以 Masonry 布局展示社区图片
- [ ] 用户公开主页显示：游记数/评价数/到访圣地数/朝圣等级
- [ ] 排行榜按"贡献游记最多"/"评价最多"/"行程最多"分榜展示
- [ ] 内容管理员可在后台审核/隐藏不当内容
- [ ] tsc 0错误，富文本内容有 XSS 过滤

---

### 4.3 Sprint B3 总计

| 项目 | 数量 |
|------|------|
| PRD文档 | 7个 |
| API新增文件 | 8个 |
| Web新增文件 | 9个 |
| Mobile新增文件 | 8个 |
| 小程序新增文件 | 5个 |
| Admin新增文件 | 2个 |
| **总文件数** | **~39个** |
| **预估工期** | **15个工作日** |

---

## 五、技术决策汇总

### 5.1 搜索引擎选型

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **PostgreSQL FTS** (pg_trgm + tsvector) | 无额外服务依赖，维护简单，适合<100万记录 | 复杂排序/聚合较弱 | **Sprint B1 推荐** |
| Elasticsearch | 专业搜索，评分/聚合/高亮强大 | 需单独服务，内存占用大，运维复杂 | Phase C升级时迁移 |
| Meilisearch | 比ES轻量，全文搜索好用 | 中文支持需额外配置 | 备选 |

**决策**: Sprint B1 使用 PostgreSQL FTS(pg_trgm + tsvector)，当数据量超过50万条或搜索需求复杂化时迁移 Meilisearch/Elasticsearch。

### 5.2 图片存储选型

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **阿里云OSS + CDN** | 国内访问快，价格低，SDK成熟 | 需付费，需配置STS | **生产环境推荐** |
| 本地存储(multer) | 开发简单，无成本 | 不支持CDN，水平扩展困难 | 仅开发阶段 |
| AWS S3 | 国际标准，生态好 | 国内访问慢，需要代理 | 国际版备选 |

**决策**: 开发阶段用 multer 本地存储，上线前切换阿里云OSS。配置抽象为 StorageService interface，支持无缝切换。

### 5.3 推荐算法选型

| 阶段 | 算法 | 触发条件 | 实现难度 |
|------|------|---------|---------|
| **Phase B (当前)** | 基于内容过滤 (宗教/地区/标签匹配) | 即刻可用，无需行为数据 | 低 |
| **Phase C** | 协同过滤 (看了A的人也看了B) | 需要>1000条用户行为数据 | 中 |
| **Phase D** | 混合推荐 (内容+协同+深度学习) | 需要>10万活跃用户 | 高 |

**决策**: Sprint B2 实现基于内容的规则推荐，Redis缓存推荐结果(TTL 1小时)。收集用户行为数据为Phase C协同过滤做准备。

### 5.4 富文本编辑器选型

| 方案 | 优点 | 缺点 |
|------|------|------|
| **TipTap** | 现代，React友好，支持扩展，无许可证问题 | 相对较新 |
| Quill | 成熟稳定 | 维护较少，React集成不完美 |
| Slate.js | 高度可定制 | 学习曲线陡 |

**决策**: Sprint B3 使用 TipTap (基于 ProseMirror)，支持 Markdown 快捷键，图片上传插件完善。

### 5.5 XSS 防护

评价/游记/问答的用户输入内容必须经过 XSS 过滤后再存储和渲染：
- 后端: 使用 `sanitize-html` 过滤富文本 HTML
- 前端渲染: 使用 `DOMPurify` 二次清洗后再 `dangerouslySetInnerHTML`
- 纯文本内容(评价文字): 直接存储，渲染时不使用 innerHTML

---

## 六、Phase B 整体工作量汇总

| Sprint | 功能 | PRD文档 | 总文件数 | 工期 |
|--------|------|---------|---------|------|
| B1 | 搜索系统 + 收藏系统 | 9个 | ~47个 | 10工作日 |
| B2 | 评价系统 + 推荐系统 | 9个 | ~38个 | 15工作日 |
| B3 | 攻略社区 | 7个 | ~39个 | 15工作日 |
| **合计** | **5个功能模块** | **25个PRD** | **~124个文件** | **~40工作日** |

---

## 七、Phase B 执行前置条件

### 必须完成的准备工作

- [ ] 所有 PRD 文档按 SCP-03 规范撰写并评审通过
- [ ] 阿里云OSS Bucket 创建并配置 STS 权限
- [ ] PostgreSQL `pg_trgm` 扩展在生产环境开启确认
- [ ] Redis 连接池配置已优化(推荐系统需要高并发读)
- [ ] 用户认证系统确认(JWT + UserId，各模块均依赖)
- [ ] `docs/protocols/` 协议库相关文档更新:
  - `01-UI设计规范.md` 新增搜索筛选器/收藏按钮/评价星级规范
  - `02-API契约规范.md` 新增图片上传/分页/搜索接口规范
  - `04-数据模型规范.md` 新增评价/收藏/社区模型规范

### 依赖关系图

```
Sprint B1 (搜索 + 收藏)
  └── 独立，可立即开始

Sprint B2 (评价 + 推荐)
  ├── 评价系统: 独立，可与B1并行
  └── 推荐系统: 依赖评价数据(avgRating)，但可先用浏览计数驱动

Sprint B3 (攻略社区)
  ├── 依赖: 用户体系(userId)
  ├── 依赖: 图片上传(OSS，评价系统已完成)
  └── 依赖: 评价系统建立的社区用户习惯
```

---

## 八、质量门禁 (Phase B 通用)

每个 Sprint 交付前必须通过以下检查：

```
[QB-01] tsc 编译 0错误，0 any 类型
[QB-02] 所有 API 端点有 Swagger 文档
[QB-03] 所有列表接口有分页 { items, total, page, pageSize }
[QB-04] 所有用户输入有 class-validator 校验
[QB-05] 所有 Controller 有 JwtAuthGuard，公开接口标注 @Public()
[QB-06] 所有图片上传有类型验证(jpg/png/webp)和大小限制(≤10MB)
[QB-07] 所有富文本输入有 XSS 过滤
[QB-08] 页面三态完整: loading / error / empty
[QB-09] 移动端响应式布局验证(375px / 768px / 1280px)
[QB-10] 对照 PRD 验收标准逐项验收 ✓
```

---

*本计划文件根据 SCP-03 PRD先行铁律制定。任何偏离本计划的开发必须先更新本文档并获得 CEO++ 批准。*

*下一步: 按 Sprint B1 顺序，首先创建 `docs/prd/M01-PRD-全站搜索系统.md`，完成竞品分析后方可开始编码。*
