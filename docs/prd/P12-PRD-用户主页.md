# P12-PRD-用户主页 (User Public Profile Page)

> 版本: v1.0 | 状态: 待评审 | 创建日期: 2026-03-29
> Sprint: B3 | 优先级: P1 | 关联模块: M08-PRD-用户与认证.md

---

## 1. 背景与目标

### 1.1 业务背景

JOINUS.COM 定位为全球宗教文化朝圣旅行社区。用户不仅是消费者，更是内容生产者和社区成员。
当前平台缺乏用户个人主页，导致:
- UGC内容(游记/评价)无法与用户身份关联展示
- 用户无法建立个人品牌和社区影响力
- 社区感缺失，用户留存率低

### 1.2 目标

- 为每位用户提供公开可访问的个人主页
- 展示朝圣成就、内容贡献与个人信息
- 为 Phase D 的关注/粉丝社交体系打好地基
- 提升用户归属感与社区活跃度

---

## 2. 竞品对标分析

### 2.1 TripAdvisor — Traveler Profile

| 功能点 | TripAdvisor实现 | JOINUS借鉴 |
|--------|----------------|-----------|
| 朝圣等级徽章 | "Reviewer Level 1–6" 金色徽章 | 朝圣者等级 1–10，与实际到访圣地数挂钩 |
| 贡献统计 | 评价数/照片数/有帮助数 | 游记数/评价数/到访圣地数/行程数 |
| 内容Tab | Reviews / Photos / Trips | 游记 / 评价 / 收藏 |
| 头像 + 简介 | 圆形头像 + 1–2行简介 | 头像 + 朝圣宣言(bio) + 所在地 |
| 公开性 | 全公开，无登录可查 | 全公开，收藏Tab仅本人可见详情 |

### 2.2 Airbnb — Host Profile

| 功能点 | Airbnb实现 | JOINUS借鉴 |
|--------|-----------|-----------|
| 身份验证徽章 | "身份已验证" | (Phase D) 朝圣认证徽章 |
| 加入年份 | "2019年加入" | 加入时间 + 朝圣年数 |
| 评分 | 整体评分星级 | 朝圣等级进度条 |
| 个人故事 | 长文字自述 | 朝圣宣言(bio，200字上限) |

### 2.3 马蜂窝 — 个人主页

| 功能点 | 马蜂窝实现 | JOINUS借鉴 |
|--------|-----------|-----------|
| 动态/游记/关注/粉丝 | Tab切换+数字统计 | 游记/评价/收藏三Tab |
| 等级体系 | 旅行达人 V1–V10 | 朝圣者等级 Lv.1–Lv.10，含称号 |
| 足迹地图 | 世界地图上标注去过的地方 | (Phase D) 朝圣地图 |
| 关注/粉丝 | 互相关注 | (Phase D) 预留字段 |

### 2.4 差异化护城河

- **朝圣等级体系**: 1–10级对应独特宗教称号(朝圣初心者 → 觉悟大师)
- **宗教文化标签**: 个人主页展示信仰标签(佛教/道教/基督教等)
- **到访圣地地图**: (Phase D) 在世界地图上标记到访过的圣地

---

## 3. 用户故事

### 3.1 核心用户故事

```
US-001 [游客/访客]
作为一个未登录用户，
我希望能查看其他用户的公开主页，
以便了解他们的朝圣经历和内容贡献，决定是否关注。

US-002 [登录用户 — 查看他人]
作为一个登录用户，
我希望点击某篇游记的作者头像后跳转到其主页，
以便浏览他/她的全部游记和评价。

US-003 [登录用户 — 编辑自己]
作为一个登录用户，
我希望在自己的主页上点击"编辑资料"，
以便修改头像、昵称、朝圣宣言和所在地。

US-004 [登录用户 — 成就感]
作为一个登录用户，
我希望在主页看到自己的朝圣等级和统计数据，
以便感受到平台对我贡献的认可。

US-005 [管理员]
作为管理员，
我希望能通过后台查看任意用户主页数据，
以便处理举报和内容审核。
```

---

## 4. 功能清单

### 4.1 P0 — 必须上线 (Sprint B3)

| 编号 | 功能 | 说明 |
|------|------|------|
| P0-01 | 用户头像展示 | 圆形头像，默认使用首字母生成色块头像 |
| P0-02 | 基本信息展示 | 显示名、朝圣宣言(bio)、所在地 |
| P0-03 | 朝圣等级徽章 | Lv.1–10，含等级名称，颜色渐进 |
| P0-04 | 统计卡片 | 游记数 / 评价数 / 到访圣地数 / 行程数 |
| P0-05 | 游记Tab | 列表展示该用户发布的全部公开游记 |
| P0-06 | 评价Tab | 列表展示该用户发布的全部公开评价 |
| P0-07 | 编辑入口 | 仅本人主页显示"编辑资料"按钮 |
| P0-08 | 编辑弹窗/页 | 修改头像/显示名/bio/所在地 |
| P0-09 | 加入时间 | 展示用户注册日期 |
| P0-10 | 页面SEO | title/description/og:image 元数据 |

### 4.2 P1 — 重要功能 (Sprint B4)

| 编号 | 功能 | 说明 |
|------|------|------|
| P1-01 | 收藏Tab | 仅本人可见收藏夹列表(公开/私密区分) |
| P1-02 | 朝圣等级进度条 | 显示当前等级进度，下一级所需条件 |
| P1-03 | 信仰标签 | 用户可选择1–3个感兴趣的宗教标签展示 |
| P1-04 | 头像上传 | 支持上传本地图片作为头像(图片裁剪) |
| P1-05 | 分享按钮 | 复制链接 / 分享到社交平台 |

### 4.3 P2 — 未来规划 (Phase D)

| 编号 | 功能 | 说明 |
|------|------|------|
| P2-01 | 关注/取关按钮 | 关注其他用户，展示粉丝/关注数 |
| P2-02 | 朝圣足迹地图 | 世界地图标记到访的圣地 |
| P2-03 | 朝圣认证徽章 | 线下核验的朝圣认证 |
| P2-04 | 私信按钮 | 向对方发送站内信 |
| P2-05 | 屏蔽/举报 | 对其他用户的安全操作 |

---

## 5. 朝圣等级体系

| 等级 | 称号 | 解锁条件(到访圣地数) | 颜色 |
|------|------|---------------------|------|
| Lv.1 | 朝圣初心者 | 0 | 灰色 #9CA3AF |
| Lv.2 | 虔诚信徒 | 1 | 绿色 #10B981 |
| Lv.3 | 圣路行者 | 3 | 蓝色 #3B82F6 |
| Lv.4 | 礼拜者 | 6 | 靛蓝 #6366F1 |
| Lv.5 | 圣地探索家 | 10 | 紫色 #8B5CF6 |
| Lv.6 | 朝圣达人 | 15 | 粉色 #EC4899 |
| Lv.7 | 灵性引领者 | 21 | 橙色 #F59E0B |
| Lv.8 | 祖庭守护者 | 28 | 红色 #EF4444 |
| Lv.9 | 大朝圣者 | 36 | 金色 #D97706 |
| Lv.10 | 觉悟大师 | 45 | 金色渐变 #D4A855→#FFD700 |

---

## 6. 页面线框 (ASCII)

### 6.1 桌面端 — 用户主页

```
┌─────────────────────────────────────────────────────────────┐
│ [JOINUS LOGO]        [搜索]      [导航]       [登录/头像]    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [背景图/渐变色横幅 — 金色#D4A855 → 深色]             │   │
│  │                                                      │   │
│  │  ┌──────┐  显示名 张三                               │   │
│  │  │      │  📍 中国·北京                             │   │
│  │  │ 头像 │  🕊 朝圣宣言: "愿以此身，走遍祖庭..."     │   │
│  │  │  72px│                                           │   │
│  │  └──────┘  [Lv.5 圣地探索家 🏅]  加入于 2024年3月  │   │
│  │                                  [编辑资料] ← 仅本人│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  游记数  │  │ 评价数  │  │到访圣地  │  │  行程数  │       │
│  │   12    │  │   34   │  │   10    │  │    5    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                              │
│  [游记 12]  [评价 34]  [收藏(仅本人)]                       │
│  ──────────────────────────────────────────────────────     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [游记卡片] [游记卡片] [游记卡片]                      │   │
│  │ [游记卡片] [游记卡片] [游记卡片]                      │   │
│  │                          [加载更多]                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 移动端 — 用户主页

```
┌───────────────────────────┐
│ ←  用户主页                │
├───────────────────────────┤
│ ┌─────────────────────┐   │
│ │  [背景色横幅]        │   │
│ │  ┌──────┐           │   │
│ │  │ 头像 │ 显示名     │   │
│ │  │ 60px │ 📍 北京   │   │
│ │  └──────┘           │   │
│ │ [Lv.5 圣地探索家]    │   │
│ │ "朝圣宣言文字..."    │   │
│ │            [编辑]   │   │
│ └─────────────────────┘   │
│                            │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │
│ │12 │ │34 │ │10 │ │ 5 │  │
│ │游记│ │评价│ │圣地│ │行程│  │
│ └───┘ └───┘ └───┘ └───┘  │
│                            │
│ [游记][评价][收藏]          │
│ ───────────────────────── │
│ ┌─────────────────────┐   │
│ │ [游记卡片(竖排)]     │   │
│ └─────────────────────┘   │
│ ┌─────────────────────┐   │
│ │ [游记卡片(竖排)]     │   │
│ └─────────────────────┘   │
└───────────────────────────┘
```

### 6.3 编辑资料弹窗

```
┌─────────────────────────────────┐
│  编辑个人资料              [✕]  │
├─────────────────────────────────┤
│  头像                           │
│  ┌──────┐                       │
│  │      │  [更换头像]           │
│  │ 头像 │                       │
│  └──────┘                       │
│                                  │
│  显示名                          │
│  ┌──────────────────────────┐   │
│  │ 张三                     │   │
│  └──────────────────────────┘   │
│                                  │
│  所在地                          │
│  ┌──────────────────────────┐   │
│  │ 中国·北京                │   │
│  └──────────────────────────┘   │
│                                  │
│  朝圣宣言 (0/200)                │
│  ┌──────────────────────────┐   │
│  │                          │   │
│  │                          │   │
│  └──────────────────────────┘   │
│                                  │
│      [取消]    [保存修改]        │
└─────────────────────────────────┘
```

---

## 7. 数据模型

### 7.1 UserProfile 表 (Prisma)

```prisma
model UserProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  displayName    String   @db.VarChar(50)
  avatar         String?  @db.Text          // URL or base64
  bio            String?  @db.VarChar(200)
  location       String?  @db.VarChar(100)
  pilgrimLevel   Int      @default(1)       // 1-10
  totalTrips     Int      @default(0)
  totalSites     Int      @default(0)       // 到访圣地数
  guideCount     Int      @default(0)       // 游记数
  reviewCount    Int      @default(0)       // 评价数
  followerCount  Int      @default(0)       // Phase D
  followingCount Int      @default(0)       // Phase D
  isPublic       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([userId])
  @@index([pilgrimLevel])
  @@index([totalSites])
}
```

### 7.2 pilgrimLevel 自动计算规则

```
totalSites → pilgrimLevel
0        → 1
1–2      → 2
3–5      → 3
6–9      → 4
10–14    → 5
15–20    → 6
21–27    → 7
28–35    → 8
36–44    → 9
45+      → 10
```

计算由后端 Service 在更新 totalSites 时同步触发。

---

## 8. API 契约

### 8.1 GET /api/users/:userId/profile

**描述**: 获取指定用户的公开主页数据

**请求**:
```
GET /api/users/cm123abc/profile
Authorization: Bearer <token>  (可选，已登录则返回 isOwnProfile: true)
```

**响应 200**:
```json
{
  "id": "cm123abc",
  "displayName": "张三",
  "avatar": "https://cdn.joinus.com/avatars/cm123abc.jpg",
  "bio": "愿以此身，走遍祖庭...",
  "location": "中国·北京",
  "pilgrimLevel": 5,
  "pilgrimLevelName": "圣地探索家",
  "stats": {
    "totalTrips": 5,
    "totalSites": 10,
    "guideCount": 12,
    "reviewCount": 34,
    "followerCount": 88,
    "followingCount": 23
  },
  "joinedAt": "2024-03-15T00:00:00Z",
  "isOwnProfile": false,
  "isFollowing": false
}
```

**响应 404**: 用户不存在

---

### 8.2 GET /api/users/me/profile

**描述**: 获取当前登录用户的主页数据

**请求**:
```
GET /api/users/me/profile
Authorization: Bearer <token>  (必须)
```

**响应**: 同 8.1，`isOwnProfile: true`

---

### 8.3 PATCH /api/users/me/profile

**描述**: 更新当前登录用户的个人资料

**请求**:
```json
{
  "displayName": "张三",
  "bio": "愿以此身，走遍祖庭...",
  "location": "中国·北京",
  "avatar": "https://cdn.joinus.com/avatars/new.jpg"
}
```

**验证规则**:
- `displayName`: 必填，2–50字符
- `bio`: 可选，最多200字符
- `location`: 可选，最多100字符
- `avatar`: 可选，合法URL格式

**响应 200**: 返回更新后的完整 profile 对象

**响应 400**: 验证失败，返回具体错误字段

---

### 8.4 GET /api/users/:userId/guides

**描述**: 获取指定用户发布的游记列表(分页)

**请求**:
```
GET /api/users/cm123abc/guides?page=1&pageSize=12
```

**响应 200**:
```json
{
  "items": [
    {
      "id": "guide-001",
      "title": "五台山朝圣记",
      "coverImage": "https://...",
      "excerpt": "...",
      "holySiteName": "五台山",
      "likeCount": 42,
      "viewCount": 380,
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 12
}
```

---

### 8.5 GET /api/users/:userId/reviews

**描述**: 获取指定用户发布的评价列表(分页)

**请求**:
```
GET /api/users/cm123abc/reviews?page=1&pageSize=12
```

**响应 200**:
```json
{
  "items": [
    {
      "id": "review-001",
      "rating": 5,
      "content": "非常震撼...",
      "holySiteName": "五台山",
      "holySiteId": "site-001",
      "images": ["https://..."],
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "total": 34,
  "page": 1,
  "pageSize": 12
}
```

---

## 9. 前端路由与组件规划

### 9.1 路由

| 平台 | 路由 | 说明 |
|------|------|------|
| Web | /users/[userId] | 公开用户主页 |
| Web | /users/me | 当前用户主页(重定向至 /users/[userId]) |
| Mobile | /user/[userId] | 用户主页(Expo Router) |
| 小程序 | /pages/user/index | 用户主页 |

### 9.2 Web 组件树

```
UserProfilePage
├── ProfileHeader
│   ├── AvatarWithLevel (头像 + 等级徽章)
│   ├── UserBasicInfo (显示名/地点/bio)
│   ├── StatsRow (4个统计数字)
│   └── EditProfileButton (仅本人)
├── ProfileTabs
│   ├── GuidesTab → GuideCard[]
│   ├── ReviewsTab → ReviewCard[]
│   └── FavoritesTab (仅本人) → FavoriteCard[]
└── EditProfileModal
    ├── AvatarUploader
    └── ProfileForm (react-hook-form)
```

---

## 10. 错误状态处理

| 状态 | 处理方式 |
|------|---------|
| 用户不存在 | 显示 404 页面 "该用户不存在或已注销" |
| 网络错误 | Toast 提示 + 重试按钮 |
| 未登录访问收藏Tab | 提示 "请登录后查看" |
| 编辑保存失败 | 表单内行内错误提示，不关闭弹窗 |
| 头像上传失败 | 保留旧头像，Toast 错误提示 |

---

## 11. 性能要求

- 主页首屏 LCP < 2.5s
- 头像图片使用 CDN + WebP 格式，尺寸 72x72 缩略图
- 游记/评价列表使用虚拟滚动(超过20条)或分页(每页12条)
- UserProfile 数据 SSR (Next.js) 支持 SEO 索引
- API 响应缓存: `GET /api/users/:userId/profile` 缓存 60s (Redis)

---

## 12. 安全要求

- `PATCH /api/users/me/profile` 必须验证 JWT，且只能修改自己的资料
- 防 IDOR: 后端验证 userId === req.user.id (参考规则 R-68)
- bio/displayName 必须 XSS 过滤 (HTML实体转义)
- 头像 URL 必须白名单校验，防止 SSRF
- 个人主页页面限流: 同 IP 1分钟内最多60次请求

---

## 13. 国际化 (i18n)

所有 UI 文本使用 i18n key，支持中文/英文:

| i18n key | 中文 | English |
|----------|------|---------|
| profile.pilgrimLevel | 朝圣等级 | Pilgrim Level |
| profile.stats.guides | 游记 | Guides |
| profile.stats.reviews | 评价 | Reviews |
| profile.stats.sites | 到访圣地 | Sites Visited |
| profile.stats.trips | 行程 | Trips |
| profile.editProfile | 编辑资料 | Edit Profile |
| profile.joinedAt | 加入于 | Joined |
| profile.bio.placeholder | 写下你的朝圣宣言... | Write your pilgrim manifesto... |
| profile.tabs.guides | 我的游记 | My Guides |
| profile.tabs.reviews | 我的评价 | My Reviews |
| profile.tabs.favorites | 我的收藏 | My Favorites |

---

## 14. 验收标准

### 14.1 功能验收

- [ ] AC-01: 访问 `/users/{userId}` 可加载用户头像、显示名、bio、所在地
- [ ] AC-02: 朝圣等级徽章 (Lv.1–10) 正确展示，颜色与等级表对应
- [ ] AC-03: 4个统计卡片数字与数据库实际值一致
- [ ] AC-04: 游记Tab默认选中，展示用户游记列表(瀑布流/网格)
- [ ] AC-05: 评价Tab切换后展示用户评价列表
- [ ] AC-06: 收藏Tab仅对本人可见，非本人访问该Tab时显示锁图标+提示
- [ ] AC-07: 本人主页显示"编辑资料"按钮，他人主页不显示
- [ ] AC-08: 点击"编辑资料"弹出编辑弹窗，修改并保存后主页信息立即刷新
- [ ] AC-09: 未登录用户可访问他人公开主页(游记+评价Tab)
- [ ] AC-10: 用户不存在时返回404页面

### 14.2 性能验收

- [ ] AC-11: 首屏 LCP < 2.5s (Lighthouse测试)
- [ ] AC-12: 页面支持 SSR，`/users/{userId}` 有正确的 og:title / og:description

### 14.3 安全验收

- [ ] AC-13: 尝试 PATCH `/api/users/{otherId}/profile` 返回 403
- [ ] AC-14: bio 中输入 `<script>alert(1)</script>` 不执行XSS
- [ ] AC-15: 无 JWT 访问 `/api/users/me/profile` 返回 401

---

## 15. 开发任务拆分

| 任务 | 负责端 | 估时 | 依赖 |
|------|--------|------|------|
| UserProfile Prisma Schema + 迁移 | API | 0.5d | - |
| UsersModule CRUD API (5个端点) | API | 1d | Schema |
| UserProfile Service (等级自动计算) | API | 0.5d | Schema |
| Web: ProfileHeader 组件 | Web | 0.5d | API |
| Web: ProfileTabs + 游记/评价列表 | Web | 1d | API |
| Web: EditProfileModal | Web | 0.5d | API |
| Web: /users/[userId] 路由页面集成 | Web | 0.5d | 以上 |
| Mobile: 用户主页页面 | Mobile | 1d | API |
| 小程序: 用户主页页面 | 小程序 | 1d | API |
| **合计** | | **6d** | |

---

*文档作者: CEO++ 指令触发 | 对标: TripAdvisor Traveler Profile + Airbnb Host Profile + 马蜂窝个人主页*
