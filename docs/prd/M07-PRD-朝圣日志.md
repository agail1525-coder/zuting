# M07 朝圣日志 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: v1已实现 / v2规划中

---

## 1. 需求背景与目标

### 1.1 背景

朝圣日志是用户在朝圣旅途中记录感悟、拍照留念、表达情感的核心内容模块。它既是个人修行日记，也是平台社区内容的重要来源。日志可关联行程(Trip)和圣地(HolySite)，形成"旅途+地点+感悟"的立体记录。通过公开/私密开关，用户可选择是否将日志分享到社区，为其他朝圣者提供参考。

### 1.2 目标

| 目标 | 指标 | 说明 |
|------|------|------|
| 日志创建率 | >40% | 完成朝圣的用户中撰写日志的比例 |
| 公开分享率 | >25% | 创建日志中设为公开的比例 |
| 图片上传率 | >60% | 日志中包含图片的比例 |
| 平均日志长度 | >200字 | 鼓励深度记录 |

### 1.3 范围

| 范围 | v1 (已实现) | v2 (规划中) |
|------|-------------|-------------|
| 日志 CRUD | 创建/列表/详情/更新/删除 | — |
| 关联行程/圣地 | tripId / siteId 可选关联 | — |
| 图片 | images 字符串数组(URL) | 图片上传到 OSS + 压缩 |
| 心情标签 | mood 字符串字段 | 预设心情+自定义 |
| 公开/私密 | isPublic 布尔字段 | — |
| 富文本编辑 | — | Markdown / 富文本编辑器 |
| 点赞/评论 | — | Like + Comment 模型 |
| 分享 | — | 生成分享卡片(小程序/微信) |
| 审核 | — | Admin 内容审核(敏感词过滤) |

---

## 2. 用户故事

### US-07-01: 朝圣者记录日志

**作为** 朝圣者，**我希望** 在朝圣途中或完成后撰写日志记录感悟，**以便** 保存珍贵的心灵体验。

**验收标准:**
- 可填写标题、正文内容、上传图片(多张)
- 可选择心情标签(感悟/喜悦/平静/震撼等)
- 可选择关联的行程和圣地
- 可设置公开或私密
- 创建后立即可见于个人日志列表

### US-07-02: 朝圣者浏览公开日志

**作为** 朝圣者，**我希望** 浏览其他人的公开朝圣日志，**以便** 获得灵感和了解圣地真实体验。

**验收标准:**
- 公开日志列表按时间倒序展示
- 显示作者昵称、标题、摘要、图片缩略图、心情、关联圣地
- 可按圣地/行程筛选
- 点击进入日志详情页

### US-07-03: 朝圣者管理自己的日志

**作为** 朝圣者，**我希望** 能编辑和删除自己的日志，**以便** 维护个人内容。

**验收标准:**
- 仅日志作者可编辑/删除
- 编辑可修改标题、内容、图片、心情、公开状态
- 删除需二次确认
- 删除后不可恢复(v2: 软删除+回收站)

### US-07-04: 管理员审核日志内容

**作为** 管理员，**我希望** 审核公开日志内容，**以便** 确保社区内容健康。

**验收标准:**
- Admin 后台可查看所有日志(含私密)
- 可将不当内容标记为隐藏
- 可直接删除违规内容
- v2: 敏感词自动过滤+人工复审

### US-07-05: 朝圣者分享日志 (v2)

**作为** 朝圣者，**我希望** 将日志分享到微信/朋友圈，**以便** 传播朝圣文化。

**验收标准:**
- 生成精美分享卡片(标题+首图+心情+圣地)
- 小程序内可直接分享到微信好友/群
- Web端生成分享链接+海报图
- 分享的日志页面有平台品牌露出

---

## 3. 业务流程

### 3.1 日志创建流程图

```
用户                        API服务                    存储/OSS
 │                            │                          │
 │  1. 上传图片(v2)            │                          │
 │ ──────────────────────────►│                          │
 │                            │  压缩+上传 ─────────────►│
 │                            │              ◄───────────│ 返回URL
 │  ◄─────────────────────────│ 返回图片URL列表            │
 │                            │                          │
 │  2. 创建日志                │                          │
 │  POST /journals             │                          │
 │  {userId, title, content,   │                          │
 │   images[], mood,           │                          │
 │   tripId?, siteId?,         │                          │
 │   isPublic}                 │                          │
 │ ──────────────────────────►│                          │
 │                            │  校验 userId 存在          │
 │                            │  校验 tripId 属于该用户     │
 │                            │  校验 siteId 存在          │
 │                            │  v2: 敏感词过滤             │
 │                            │  写入数据库                 │
 │  ◄─────────────────────────│                          │
 │  返回 JournalEntry          │                          │
```

### 3.2 日志内容审核流程 (v2)

```
    用户创建日志(isPublic=true)
           │
           ▼
    ┌──────────────┐
    │ 自动敏感词过滤 │
    └──────┬───────┘
           │
     ┌─────┴─────┐
     │           │
   通过        命中
     │           │
     ▼           ▼
  直接发布    进入审核队列
     │           │
     │     ┌─────┴─────┐
     │     │           │
     │   审核通过     审核拒绝
     │     │           │
     │     ▼           ▼
     │   发布        通知用户修改
     │                 │
     └─────────────────┘
```

### 3.3 业务规则表

| 规则ID | 规则 | 说明 |
|--------|------|------|
| BR-07-01 | userId 必填 | 日志必须关联用户 |
| BR-07-02 | tripId 可选 | 关联行程时校验行程属于该用户 |
| BR-07-03 | siteId 可选 | 关联圣地时校验圣地存在 |
| BR-07-04 | images 最多9张 | 与微信朋友圈对齐 |
| BR-07-05 | content 最大10000字符 | 防止滥用 |
| BR-07-06 | 仅作者可编辑/删除 | 服务端校验 userId |
| BR-07-07 | isPublic=false 的日志仅作者和Admin可见 | 列表查询默认过滤 |
| BR-07-08 | mood 预设值: 感悟/喜悦/平静/震撼/虔诚/感恩 | 可扩展 |
| BR-07-09 | v2: 公开日志需通过敏感词检测 | 命中则进入人工审核 |
| BR-07-10 | v2: 删除改为软删除 | deletedAt 字段，30天后物理清理 |

---

## 4. 功能清单

| 功能ID | 功能名称 | 优先级 | 版本 | 端 | 说明 |
|--------|---------|--------|------|-----|------|
| F07-01 | 创建日志 | P0 | v1 | Web/App/Mini | 标题+正文+图片+心情+关联 |
| F07-02 | 日志列表 | P0 | v1 | Web/App/Mini/Admin | 公开列表+个人列表+分页筛选 |
| F07-03 | 日志详情 | P0 | v1 | Web/App/Mini/Admin | 完整内容+图片画廊+关联信息 |
| F07-04 | 更新日志 | P0 | v1 | Web/App/Mini | 仅作者可编辑 |
| F07-05 | 删除日志 | P0 | v1 | Web/App/Mini/Admin | 作者删除+Admin删除 |
| F07-06 | 图片上传 | P1 | v2 | Web/App/Mini | OSS 上传+压缩+缩略图 |
| F07-07 | 富文本编辑器 | P1 | v2 | Web | Markdown 或 WYSIWYG |
| F07-08 | 点赞 | P1 | v2 | Web/App/Mini | 公开日志点赞 |
| F07-09 | 评论 | P2 | v2 | Web/App/Mini | 公开日志评论 |
| F07-10 | 分享卡片 | P1 | v2 | App/Mini | 生成微信分享卡片 |
| F07-11 | 内容审核 | P1 | v2 | Admin/API | 敏感词过滤+人工审核 |
| F07-12 | 日志搜索 | P2 | v2 | Web/App | 全文搜索(标题+内容) |

---

## 5. 数据模型

### 5.1 实体关系

```
User 1──────* JournalEntry *──────? Trip
                  │
                  *──────? HolySite (通过 siteId)
                  │
                  1──────* Like (v2)
                  │
                  1──────* Comment (v2)
```

### 5.2 字段表

**JournalEntry (朝圣日志) — 已实现**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| userId | String | 是 | — | 作者 |
| tripId | String | 否 | — | 关联行程 |
| siteId | String | 否 | — | 关联圣地 |
| title | String | 是 | — | 标题 |
| content | String(Text) | 是 | — | 正文内容 |
| images | String[] | 否 | [] | 图片URL数组 |
| mood | String | 否 | — | 心情标签 |
| isPublic | Boolean | 是 | false | 是否公开 |
| createdAt | DateTime | 是 | now() | 创建时间 |
| updatedAt | DateTime | 是 | auto | 更新时间 |

**Like (点赞) — v2新增**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| userId | String | 是 | — | 点赞用户 |
| journalId | String | 是 | — | 关联日志 |
| createdAt | DateTime | 是 | now() | 点赞时间 |
| @@unique | [userId, journalId] | — | — | 同一用户不可重复点赞 |

**Comment (评论) — v2新增**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| userId | String | 是 | — | 评论用户 |
| journalId | String | 是 | — | 关联日志 |
| content | String(Text) | 是 | — | 评论内容(最大500字) |
| parentId | String | 否 | — | 父评论ID(回复) |
| createdAt | DateTime | 是 | now() | 评论时间 |

---

## 6. API 接口

### v1 已实现

| # | 方法 | 路径 | 认证 | 说明 | 请求体/参数 | 响应 |
|---|------|------|------|------|------------|------|
| 1 | POST | /api/journals | JWT | 创建日志 | `{userId, tripId?, siteId?, title, content, images?[], mood?, isPublic?}` | JournalEntry |
| 2 | GET | /api/journals | Public | 日志列表 | Query: `userId?, tripId?, isPublic?, page?, limit?` | `{data, total, page, limit}` |
| 3 | GET | /api/journals/:id | JWT | 日志详情 | Path: id | JournalEntry + User + Trip + Site |
| 4 | PATCH | /api/journals/:id | JWT | 更新日志 | `{title?, content?, images?[], mood?, isPublic?}` | JournalEntry |
| 5 | DELETE | /api/journals/:id | JWT | 删除日志 | Path: id | `{message}` |

### v2 新增

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 6 | POST | /api/journals/:id/like | JWT | 点赞/取消点赞(toggle) |
| 7 | GET | /api/journals/:id/comments | Public | 获取评论列表 |
| 8 | POST | /api/journals/:id/comments | JWT | 发表评论 |
| 9 | DELETE | /api/journals/comments/:commentId | JWT | 删除评论(作者/Admin) |
| 10 | POST | /api/upload/images | JWT | 上传图片(返回URL) |
| 11 | GET | /api/journals/:id/share-card | Public | 获取分享卡片数据 |
| 12 | GET | /api/journals/search | Public | 全文搜索 |

---

## 7. 多端页面规格

### 7.1 Web 端

#### 页面: /journals — 日志列表(公开)

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: "朝圣日志"标题 + 筛选(全部/按圣地/按信仰); 主体: 瀑布流卡片布局(2-3列) |
| 卡片字段 | 首图(封面) + 标题 + 摘要(前100字) + 心情Tag + 作者头像+昵称 + 关联圣地名 + 时间 |
| 交互 | 点击卡片进入详情; 无限滚动; 图片懒加载; Hover 卡片轻微上浮 |
| 空状态 | "还没有公开日志，成为第一个分享者吧" |
| 暗色主题 | 卡片背景 #1e293b, 文字 #e2e8f0, 心情 Tag 彩色 |

#### 页面: /journals/[id] — 日志详情 (v2)

| 项目 | 说明 |
|------|------|
| 布局 | 居中内容区(max-width 720px): 标题 → 作者信息栏 → 心情+时间+关联圣地 → 正文 → 图片画廊 → 点赞/评论区 |
| 图片画廊 | 网格布局, 点击放大(Lightbox); 1张全宽, 2张并排, 3张田字+1, 4+网格 |
| 点赞 | 心形按钮 + 点赞数; 点击 toggle; 已赞填充金色(#D4A855) |
| 评论区 | v2: 评论列表 + 输入框; 支持回复; 作者评论高亮 |

#### 页面: /journals/create (v2)

| 项目 | 说明 |
|------|------|
| 布局 | 居中表单: 标题输入 → 心情选择器(预设图标) → 关联行程下拉 → 关联圣地下拉 → 富文本编辑器 → 图片上传区 → 公开开关 → 提交按钮 |
| 编辑器 | Markdown 编辑器(左编辑右预览) 或 WYSIWYG(TipTap) |
| 图片上传 | 拖拽上传 + 点击上传; 最多9张; 显示上传进度; 可拖拽排序 |
| 自动保存 | 每30秒自动保存草稿到 localStorage |

### 7.2 App 端 (Expo React Native)

#### 页面: /journals — 日志列表

| 项目 | 说明 |
|------|------|
| 布局 | 顶部 Tab: "公开日志" / "我的日志"; FlatList 日志卡片; 底部浮动"写日志"按钮(羽毛笔图标) |
| 卡片 | 首图+标题+摘要+心情图标+时间; 公开日志显示作者; 我的日志显示状态(公开/私密) |
| 交互 | 下拉刷新; 上拉加载; 点击进入详情; 左滑删除(我的日志) |
| 图片 | 首图使用 FastImage 缓存加载 |

#### 页面: 日志编辑屏幕

| 项目 | 说明 |
|------|------|
| 布局 | ScrollView: 标题输入 → 心情选择(横向滚动圆形图标) → 正文 TextInput(多行) → 图片网格(点击添加) → 关联选择(Sheet) → 公开 Switch → 提交按钮 |
| 图片 | 调用 ImagePicker 选择/拍照; 最多9张; 长按拖拽排序; 点击X删除 |
| 键盘 | KeyboardAvoidingView; 输入法弹出时自动滚动 |

### 7.3 小程序端 (Taro)

#### 页面: /journals — 日志列表

| 项目 | 说明 |
|------|------|
| 布局 | 自定义导航栏; Tab: 公开/我的; 列表: 日志卡片 |
| 交互 | onPullDownRefresh 刷新; onReachBottom 加载更多; 点击跳转 /journal-detail |
| 分享 | 公开日志卡片右上角分享按钮 → wx.shareAppMessage |

#### 页面: 日志编写

| 项目 | 说明 |
|------|------|
| 布局 | 表单页: 标题 Input → 心情选择器(wx.showActionSheet) → 内容 Textarea → 图片上传(wx.chooseImage) → 公开 Switch → 提交 |
| 图片 | wx.chooseImage 最多9张; 调用 wx.uploadFile 上传; 显示上传进度 |

### 7.4 Admin 后台

#### 页面: JournalsPage — 日志管理

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 筛选栏(作者搜索、公开状态、心情、日期范围); 中部: Ant Design Table |
| 表格列 | ID(前8位)、作者昵称、标题、心情(Tag)、公开(勾/叉)、图片数、关联行程、关联圣地、创建时间、操作 |
| 操作 | 查看详情(Modal, 含完整内容+图片); 隐藏/显示(toggle isPublic); 删除(二次确认) |
| v2 | 审核队列 Tab: 待审核列表; 批量审核通过/拒绝; 敏感词命中高亮 |
| 统计 | v2: 日志创建趋势图; 热门圣地日志数; 心情分布饼图 |

---

## 8. 埋点需求

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `journal_create` | 创建日志 | journalId, userId, hasTrip, hasSite, imageCount, mood, isPublic | 日志创建分析 |
| `journal_update` | 更新日志 | journalId, changedFields[] | 编辑行为 |
| `journal_delete` | 删除日志 | journalId, userId | 删除分析 |
| `journal_view` | 查看日志详情 | journalId, isPublic, viewerUserId | 日志热度 |
| `journal_list_view` | 查看日志列表 | tab(public/mine), filter | 页面访问 |
| `journal_like` | 点赞/取消 | journalId, action(like/unlike), userId | v2 互动分析 |
| `journal_comment` | 发表评论 | journalId, commentId, isReply | v2 互动分析 |
| `journal_share` | 分享日志 | journalId, platform(wechat/link), userId | v2 传播分析 |
| `journal_image_upload` | 上传图片 | count, totalSize | 图片使用分析 |
| `journal_mood_select` | 选择心情 | mood | 心情分布 |
