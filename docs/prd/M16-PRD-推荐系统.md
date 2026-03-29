# M16-PRD-推荐系统

> 版本: v1.0 | 创建: 2026-03-29 | 状态: 待评审
> 负责人: CEO++ | 所属Phase: Phase B

---

## 1. 背景与目标

### 1.1 业务背景

JOINUS.COM 当前各详情页与首页缺乏个性化推荐能力，用户浏览完一个圣地后无明确的下一步导向，导致跳出率高、人均浏览页面数低。推荐系统是提升用户留存与探索深度的核心杠杆。

### 1.2 战略目标

```
JOINUS.COM 推荐系统 = 竞品最佳实践 + 宗教文化垂直深度
目标: 人均浏览页面数提升 40%，回访率提升 20%
```

### 1.3 阶段目标

| 阶段 | 目标 | 交付物 |
|------|------|--------|
| Phase B (Sprint B2) | 基于内容的规则推荐 (算法V1) | 相关推荐组件 + 首页推荐区块 + 最近浏览 |
| Phase C (Sprint B3) | 协同过滤推荐 (算法V2) | 用户行为矩阵 + "看了A也看了B" |

---

## 2. 竞品对标分析

### 2.1 Booking.com — "Similar properties"

- **位置**: 酒店详情页底部固定区块
- **数量**: 8-12 个推荐，横向滚动
- **排序逻辑**: 同城市 + 相近价格段 + 评分≥4.0
- **卡片信息**: 图片 + 名称 + 评分 + 价格 + 距离
- **JOINUS借鉴**: 同宗教 + 同地区的相关圣地/祖庭推荐

### 2.2 Trip.com — "猜你喜欢"

- **位置**: 首页 Banner 下方第二屏
- **机制**: 基于最近浏览 + 用户画像的个性化内容流
- **登录/未登录差异**: 登录后立即个性化，未登录显示热门
- **"换一批"按钮**: 一键刷新推荐内容，不离开当前页
- **JOINUS借鉴**: 首页"为你推荐"区块 + "换一批"交互

### 2.3 Airbnb — "相关房源"

- **位置**: 房源详情页底部
- **沉浸式图片**: 大卡片，图片占 70% 面积
- **Wishlist集成**: 推荐卡片右上角直接添加收藏
- **地图联动**: 推荐列表与地图标注联动高亮
- **JOINUS借鉴**: 大图卡片设计 + 收藏按钮集成

### 2.4 功能差距矩阵

| 功能点 | Booking | Trip.com | Airbnb | JOINUS V1 | JOINUS V2 |
|--------|---------|----------|--------|-----------|-----------|
| 相关推荐 | ✓ | ✓ | ✓ | 规划中 | 完成 |
| 首页个性化 | ✓ | ✓ | ✓ | 规划中 | 完成 |
| 协同过滤 | ✓ | ✓ | ✓ | 不支持 | 规划 Phase C |
| 最近浏览 | ✓ | ✓ | ✓ | 规划中 | 完成 |
| 附近推荐 | ✓ | ✓ | ✓ | 规划中 | 完成 |
| 换一批刷新 | - | ✓ | - | 规划中 | 完成 |

---

## 3. 用户故事

### 3.1 主用户故事

```
作为一名对佛教感兴趣的朝圣者，
我希望在浏览少林寺详情页时，能看到其他佛教圣地的推荐，
以便我规划更完整的朝圣路线。
```

```
作为一名已登录的老用户，
我希望首页能根据我的浏览历史推荐相关内容，
以便我不必每次都手动搜索同类型的圣地。
```

```
作为一名游客（未登录），
我希望首页也能看到有价值的内容推荐，
以便我探索平台内容并决定是否注册。
```

### 3.2 用户故事地图

| 用户类型 | 触点 | 期望推荐 | 优先级 |
|---------|------|---------|--------|
| 已登录 — 有浏览历史 | 首页 | 基于偏好的个性化推荐 | P0 |
| 已登录 — 无浏览历史 | 首页 | 热门内容 (浏览量+评分) | P0 |
| 未登录 | 首页 | 热门内容 | P0 |
| 任意用户 | 圣地详情页 | 同宗教相关圣地 | P0 |
| 任意用户 | 祖庭详情页 | 同宗教相关祖庭 | P0 |
| 任意用户 | 祖师详情页 | 同宗教相关祖师 | P1 |

---

## 4. 推荐算法设计

### 4.1 算法 V1 — 基于内容的规则推荐 (Phase B)

**输入**: 当前浏览的 entity (entityType + entityId)
**输出**: 相关 entity 列表 (含评分权重排序)

**规则优先级**:

```
权重计算公式:
  score = religionMatch * 40 + regionMatch * 30 + ratingBonus * 20 + popularityBonus * 10

  religionMatch:
    同宗教           → 40分
    不同宗教         → 0分

  regionMatch:
    同国家/同地区     → 30分
    同大洲           → 15分
    不同大洲         → 0分

  ratingBonus:
    rating ≥ 4.5    → 20分
    rating ≥ 4.0    → 12分
    rating ≥ 3.5    → 6分
    rating < 3.5    → 0分

  popularityBonus:
    views Top 10%   → 10分
    views Top 30%   → 5分
    其他             → 0分

  兜底规则: 当结果数 < limit 时，用全库评分最高补齐
```

**排除规则**:
- 排除当前浏览的 entity 本身
- 排除用户最近 24h 内已浏览过的 entity (已登录用户)

### 4.2 算法 V2 — 协同过滤 (Phase C，需 >1000 条行为数据)

```
输入: 用户行为矩阵 (userId × entityId 浏览/收藏/评价)
输出: "看了A的用户也看了B"
依赖: UserViewHistory 数据积累 ≥ 1000 条
方法: Item-based Collaborative Filtering (余弦相似度)
```

### 4.3 首页个性化逻辑

```
IF 已登录 AND 最近浏览 ≥ 3 条:
  提取用户浏览最多的宗教类型 (Top 2)
  用 /api/recommendations/homepage?userId={id} 返回个性化结果

ELSE IF 已登录 AND 最近浏览 < 3 条:
  50% 热门内容 + 50% 用户已浏览宗教的相关内容

ELSE (未登录):
  返回 /api/recommendations/popular 热门内容
```

---

## 5. 数据模型

### 5.1 新增 Prisma 表

```prisma
model UserViewHistory {
  id         String   @id @default(cuid())
  userId     String?  // 可选，未登录用户用 sessionId
  sessionId  String?  // 未登录用户的会话标识
  entityType String   // HOLY_SITE | TEMPLE | PATRIARCH
  entityId   String
  viewedAt   DateTime @default(now())

  @@index([userId, viewedAt])
  @@index([entityType, entityId])
  @@index([sessionId, viewedAt])
}
```

### 5.2 Redis 缓存策略

| Key 格式 | 数据类型 | 内容 | TTL |
|---------|---------|------|-----|
| `user:views:{userId}` | List | 最近50条浏览 `{type}:{id}` | 30天 |
| `entity:views:{type}:{id}` | String (Int) | 浏览计数 | 永久 (定期快照到DB) |
| `recommendations:cache:{type}:{id}` | String (JSON) | 推荐结果列表 | 1小时 |
| `recommendations:popular:{religion}` | String (JSON) | 热门推荐列表 | 6小时 |
| `recommendations:homepage:{userId}` | String (JSON) | 首页个性化推荐 | 30分钟 |

### 5.3 缓存失效策略

- 实体数据更新时 → 清除 `recommendations:cache:{type}:{id}`
- 用户新增浏览时 → 清除 `recommendations:homepage:{userId}`
- 每日凌晨 3:00 → 批量刷新 `recommendations:popular:*`

---

## 6. API 契约

### 6.1 端点总览

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/recommendations/related` | 相关推荐 (详情页) | 可选 |
| GET | `/api/recommendations/homepage` | 首页推荐 | 可选 |
| GET | `/api/recommendations/popular` | 热门推荐 | 无需 |
| GET | `/api/recommendations/nearby` | 附近热门 | 无需 |
| GET | `/api/user/view-history` | 用户浏览历史 | 必须 |
| POST | `/api/user/view-history` | 记录浏览 | 可选 |
| DELETE | `/api/user/view-history` | 清空历史 | 必须 |

### 6.2 GET /api/recommendations/related

**请求参数**:
```
entityType  string  必填  HOLY_SITE | TEMPLE | PATRIARCH
entityId    string  必填  实体ID
limit       number  选填  默认6，最大12
```

**响应示例**:
```json
{
  "items": [
    {
      "entityType": "HOLY_SITE",
      "entityId": "clxxx",
      "name": "峨眉山",
      "nameEn": "Mount Emei",
      "religion": "BUDDHISM",
      "region": "China",
      "rating": 4.8,
      "imageUrl": "https://...",
      "tags": ["佛教", "四川", "世界遗产"]
    }
  ],
  "total": 6,
  "algorithm": "content-based-v1"
}
```

### 6.3 GET /api/recommendations/homepage

**请求参数**:
```
limit   number  选填  默认10，最大20
```

**请求头** (可选): `Authorization: Bearer {token}`

**响应**: 与 related 格式一致，含 `personalized: boolean` 字段

### 6.4 GET /api/recommendations/popular

**请求参数**:
```
religion  string  选填  按宗教筛选
region    string  选填  按地区筛选
limit     number  选填  默认10，最大20
```

### 6.5 GET /api/recommendations/nearby

**请求参数**:
```
lat     number  必填  纬度
lng     number  必填  经度
radius  number  选填  默认50，单位km，最大200
limit   number  选填  默认10，最大20
```

### 6.6 POST /api/user/view-history

**请求体**:
```json
{
  "entityType": "HOLY_SITE",
  "entityId": "clxxx",
  "sessionId": "sess_xxx"
}
```

**响应**: `201 Created`，无需返回body (静默调用)

---

## 7. 页面与组件变更清单

### 7.1 Web (Next.js)

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/components/RelatedEntities.tsx` | 新建 | 相关推荐横向滚动卡片 |
| `src/components/RecentlyViewed.tsx` | 新建 | 最近浏览组件 |
| `src/components/HomepageRecommendations.tsx` | 新建 | 首页个性化推荐区块 |
| `src/app/holy-sites/[id]/page.tsx` | 修改 | 底部加入相关推荐 |
| `src/app/temples/[id]/page.tsx` | 修改 | 底部加入相关推荐 |
| `src/app/page.tsx` | 修改 | 首页加入"为你推荐"区块 |

### 7.2 Mobile (Expo)

| 文件 | 类型 | 说明 |
|------|------|------|
| `components/RelatedEntities.tsx` | 新建 | FlatList horizontal 推荐 |
| `components/RecentlyViewed.tsx` | 新建 | 最近浏览组件 |
| `app/(tabs)/index.tsx` | 修改 | 首页推荐区块 |
| `app/holy-site/[id].tsx` | 修改 | 相关推荐 |

### 7.3 微信小程序 (Taro)

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/components/RelatedEntities/index.tsx` | 新建 | scroll-view 推荐 |
| `src/pages/index/index.tsx` | 修改 | 首页推荐区块 |

### 7.4 Admin 后台

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/pages/DashboardPage.tsx` | 修改 | 浏览热度 Top10 图表 |

---

## 8. 非功能性需求

| 指标 | 要求 |
|------|------|
| 推荐接口响应时间 | ≤ 300ms (Redis命中) / ≤ 800ms (冷启动) |
| 浏览记录写入 | 异步队列，不阻塞页面加载 |
| Redis 内存占用 | 单用户历史 ≤ 5KB，总推荐缓存 ≤ 50MB |
| 推荐结果数量 | related: 4-12条 / homepage: 6-20条 |
| 相关性准确率 | ≥ 80% 推荐项与当前页面同宗教 (V1验收标准) |

---

## 9. 验收标准

- [ ] 圣地详情页底部显示"相关圣地"至少 4 个推荐项
- [ ] 推荐内容与当前页面同宗教，相关性 ≥ 80%
- [ ] 首页"为你推荐"区块对已登录用户返回个性化内容
- [ ] 首页"为你推荐"区块对未登录用户返回热门内容
- [ ] 推荐接口 P99 响应时间 ≤ 300ms
- [ ] "换一批"按钮触发新推荐，不重复上一批内容
- [ ] 最近浏览最多显示 50 条，同实体 24h 内不重复
- [ ] "附近热门"基于 GPS 坐标返回指定半径内圣地
- [ ] Redis 缓存命中率 ≥ 90% (稳态下)
- [ ] 浏览记录 POST 接口为异步非阻塞，不影响页面渲染性能

---

## 10. 关联文档

| 文档 | 说明 |
|------|------|
| [P07-PRD-首页个性化推荐](P07-PRD-首页个性化推荐.md) | 首页推荐区块详细设计 |
| [F06-PRD-相关推荐组件](F06-PRD-相关推荐组件.md) | 详情页相关推荐通用组件 |
| [F07-PRD-最近浏览](F07-PRD-最近浏览.md) | 最近浏览历史功能 |
| [M14-PRD-收藏系统](M14-PRD-收藏系统.md) | 收藏行为数据可驱动推荐 |
| [docs/protocols/04-数据模型规范.md](../protocols/04-数据模型规范.md) | Prisma 数据模型规范 |

---

*PRD版本历史*

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|---------|
| v1.0 | 2026-03-29 | CEO++ | 初始版本，Phase B 算法V1规划 |
