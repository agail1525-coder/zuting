# M17-PRD-攻略社区

> 项目: JOINUS.COM — 全球祖庭文化旅行平台
> 文档类型: 主模块PRD
> 版本: v1.0 | 创建日期: 2026-03-29 | 最后更新: 2026-03-29
> 状态: 评审中
> 负责人: CEO++ / 全栈团队
> 所属Phase: Phase B (Sprint B3)

---

## 目录

1. [背景与目标](#1-背景与目标)
2. [竞品对标分析](#2-竞品对标分析)
3. [用户故事](#3-用户故事)
4. [功能清单](#4-功能清单)
5. [页面线框 / 交互设计](#5-页面线框--交互设计)
6. [API契约](#6-api契约)
7. [数据模型](#7-数据模型)
8. [技术约束](#8-技术约束)
9. [验收标准](#9-验收标准)
10. [子页面PRD索引](#10-子页面prd索引)
11. [开发记录](#11-开发记录)

---

## 1. 背景与目标

### 1.1 背景

JOINUS.COM 当前以官方内容（圣地、祖庭、祖师数据）为核心，缺乏用户生成内容（UGC）体系。朝圣者完成旅行后无处分享游记，新用户在决策前无法参考真实的朝圣经历，社区粘性极低。对标 TripAdvisor 旅行者社区、Trip.com 攻略频道、马蜂窝游记，UGC 社区是提升平台内容深度、用户留存率和口碑传播的核心杠杆，也是 JOINUS.COM 从"内容数据库"升级为"朝圣者社区"的关键一跃。

### 1.2 战略目标

```
JOINUS.COM 攻略社区 = TripAdvisor社区深度 + Trip.com攻略体验 + 马蜂窝游记温度
                     + 宗教文化垂直深度（朝圣验证 + 多信仰社区）
目标: DAU中UGC贡献率 ≥ 30%，月活社区用户 ≥ 10,000，平均人均浏览内容 ≥ 8篇
```

### 1.3 阶段目标

| 阶段 | 目标 | 关键交付物 |
|------|------|-----------|
| Phase B (Sprint B3) | 建立社区基础设施 — 游记/攻略、问答、照片墙、用户主页、排行榜 | 后端5个模块 + Web 8个页面 + Mobile 3个Tab增强 |
| Phase C (Sprint C1) | 社区运营工具 — 内容推荐、话题标签、官方精选、积分激励 | 运营后台 + 推荐算法V2 |
| Phase D (Sprint D1) | 社交图谱 — 关注/粉丝、私信、内容订阅 | 社交关系模块 |

### 1.4 非目标（本期不做的）

- 不包含私信/即时通讯（延期到 Phase D）
- 不包含内容积分激励体系（延期到 Phase C 会员模块）
- 不包含视频游记（仅支持图片，延期到 Phase D）
- 不包含AI辅助写作（延期到 Phase D 与小鸿深度集成）
- 不包含内容广告/商业化（延期到 Phase D）
- 不包含关注/粉丝社交图谱（延期到 Phase D）

---

## 2. 竞品对标分析

### 2.1 TripAdvisor — 旅行者社区 (核心对标)

**游记/评价:**
- 支持旅行者撰写长篇游记（文字 + 图片混排），正文支持富文本
- 游记与目的地双向关联，详情页直接嵌入"旅行者游记"区块
- 游记卡片展示：封面图 + 标题 + 摘要100字 + 作者头像 + 发布时间 + 阅读量 + 有用数
- 排行：近30天最有用/最多阅读/最新，含"精选游记"官方标记

**问答社区 (Forums/Q&A):**
- 旅行者可针对目的地/景点提问，其他用户回答，最佳答案可被采纳
- 问题可关联到具体圣地/祖庭，在详情页"问答"tab展示
- 回答支持点赞投票（voteCount），高票答案自动置顶
- 问题状态: OPEN → ANSWERED（有被采纳的回答）→ CLOSED

**照片墙:**
- 目的地照片墙：按宗教/地区/热门筛选，瀑布流布局
- 照片支持用户上传，附带拍摄说明和位置
- 精选照片（featured=true）出现在目的地头图轮播

**借鉴点:**
- 游记与目的地实体强关联（entityType + entityId）
- 问答"最佳答案"采纳机制 → `isAccepted` 字段
- 照片墙精选机制 → `featured` 字段
- 排行榜维度（有用/浏览/时间）

### 2.2 Trip.com — 攻略频道

**攻略内容:**
- "攻略"与"游记"分类：游记偏个人经历，攻略偏实用信息（交通/住宿/票价）
- 攻略卡片：大封面图（16:9）+ 标题 + 目的地标签 + 阅读量 + 点赞数
- 攻略编辑器：富文本 + 图片上传 + 位置打点 + 出行时间填写
- 热门攻略出现在目的地详情页"攻略"tab，引流回详情页

**标签系统:**
- 每篇攻略可添加3-5个标签（如"朝拜""摄影""素食""亲子"）
- 标签聚合页：点击标签查看该类内容集合
- 热门标签展示在社区首页侧边栏

**借鉴点:**
- 游记 + 攻略统一在 Guide 模型（用 `entityType` 区分关联对象）
- 标签系统 → `tags[]` 字段 + 标签聚合查询
- 攻略出行时间 → Guide 元数据可扩展

### 2.3 马蜂窝 — 游记社区

**游记温度:**
- 游记发布流程：选目的地 → 上传图片 → 填写正文 → 选标签 → 发布
- 图文混排编辑器，图片可插入正文任意位置（Markdown或自定义编辑器）
- 朋友圈分享 + 外链分享（生成游记海报图）
- 游记底部"去这里"CTA按钮直接跳转圣地详情页

**社区氛围:**
- "旅行达人"认证：高产优质内容创作者获得达人标识
- 粉丝关注体系：关注达人 → 首页出现其最新游记
- "徒步攻略""素食地图"等垂直话题聚合页

**借鉴点:**
- 游记与"去这里"跳转 → Guide关联 entityId 直接跳转实体详情页
- 用户等级 `pilgrimLevel`（1-10）类比马蜂窝旅行等级
- 达人认证 → UserProfile 可扩展 `isVerified` 字段（Phase C）

### 2.4 功能差距矩阵

| 功能点 | TripAdvisor | Trip.com | 马蜂窝 | JOINUS当前 | JOINUS Sprint B3目标 |
|--------|-------------|----------|--------|------------|---------------------|
| 游记发布 | ✓ | ✓ | ✓ | 无 | P0 完成 |
| 游记列表/详情 | ✓ | ✓ | ✓ | 无 | P0 完成 |
| 问答系统 | ✓ | 部分 | 部分 | 无 | P0 完成 |
| 最佳答案采纳 | ✓ | - | - | 无 | P0 完成 |
| 照片墙 | ✓ | ✓ | ✓ | 无 | P1 完成 |
| 用户主页 | ✓ | ✓ | ✓ | 无 | P0 完成 |
| 社区排行榜 | ✓ | ✓ | ✓ | 无 | P1 完成 |
| 标签系统 | ✓ | ✓ | ✓ | 无 | P1 完成 |
| 关注/粉丝 | ✓ | ✓ | ✓ | 无 | Phase D |
| 私信 | ✓ | ✓ | ✓ | 无 | Phase D |
| 积分激励 | ✓ | ✓ | ✓ | 无 | Phase C |

### 2.5 差异化优势 (JOINUS.COM独有)

- **朝圣验证标记**: 游记作者若有对应圣地的 COMPLETED 行程，自动显示"已朝圣 ✓"徽章，内容可信度远超普通 UGC 平台
- **多信仰社区分区**: 游记/问答按宗教信仰分区（佛教区/道教区/基督教区…），避免宗教冲突，加深垂直用户粘性
- **朝圣等级体系**: `pilgrimLevel` 1-10 与行程数量/圣地数量挂钩，展现在用户主页，形成独特身份认同
- **祖训引用**: 游记正文可引用平台内 39 条祖训（@祖训ID），形成内容与知识库的深度融合

---

## 3. 用户故事

### 3.1 目标用户

- **主要用户**: 已完成或正在规划朝圣旅行的用户（朝圣者）
- **次要用户**: 对宗教文化感兴趣但尚未出发的探索者（潜在朝圣者）
- **管理用户**: 平台运营人员（内容审核、精选推荐）

### 3.2 用户故事列表

| 编号 | 用户故事 | 优先级 |
|------|---------|-------|
| US-01 | 作为一名朝圣者，我希望发布图文游记记录我的朝圣经历，以便与其他信众分享并留下珍贵记忆 | P0 |
| US-02 | 作为一名潜在朝圣者，我希望浏览他人的游记和攻略，以便在出发前了解真实的朝圣体验 | P0 |
| US-03 | 作为一名初次朝圣者，我希望在问答社区提问（如"少林寺朝拜需要预约吗？"），以便获得有经验者的建议 | P0 |
| US-04 | 作为一名有经验的朝圣者，我希望回答其他用户的问题并被采纳为最佳答案，以便获得社区认可 | P0 |
| US-05 | 作为一名朝圣者，我希望在照片墙浏览各圣地的照片，以便感受圣地氛围辅助决策 | P1 |
| US-06 | 作为一名朝圣者，我希望查看自己的用户主页，以便展示我的朝圣历程和等级 | P0 |
| US-07 | 作为一名探索者，我希望查看社区排行榜（最活跃用户/最热游记），以便发现高质量内容和达人 | P1 |
| US-08 | 作为一名游记作者，我希望我发布的游记关联到对应圣地详情页，以便获得更多曝光 | P0 |
| US-09 | 作为一名朝圣者，我希望对游记点赞，以便表达认可并帮助好内容浮现 | P0 |
| US-10 | 作为一名朝圣者，我希望在游记下方留言评论，以便与作者互动和交流体验 | P0 |

### 3.3 关键用户旅程

```
【游记发布旅程】
用户完成行程 → 点击"写游记"按钮
  → 选择关联圣地/祖庭（可选）
  → 上传封面图 + 填写标题
  → 在 Markdown 编辑器中撰写正文
  → 添加标签（最多5个）
  → 保存草稿 / 直接发布
  → 游记出现在个人主页 + 关联圣地详情页

【问答旅程】
用户在圣地详情页 → 点击"提问"按钮
  → 填写问题标题 + 详细描述
  → 关联圣地自动填充
  → 发布问题
  → 收到通知：有人回答了你的问题
  → 查看回答 → 采纳最佳答案
  → 问题状态变为 ANSWERED
```

---

## 4. 功能清单

### 4.1 核心功能（P0 — 必须有）

**游记/攻略子系统:**
- [ ] 发布游记：标题 + 封面图 + Markdown正文 + 关联实体（可选）+ 标签
- [ ] 游记草稿保存（status: DRAFT）与发布（status: PUBLISHED）
- [ ] 游记列表页：分页/无限滚动，支持按时间/热度排序
- [ ] 游记详情页：正文渲染 + 作者信息 + 点赞 + 评论 + 关联圣地跳转
- [ ] 游记点赞/取消点赞（GuideLike，唯一约束防止重复）
- [ ] 游记评论（GuideComment）的增删查
- [ ] 游记与圣地/祖庭的双向关联（entityType + entityId）

**问答子系统:**
- [ ] 发布问题：标题 + 详细描述 + 关联实体（可选）+ 标签
- [ ] 问题列表页：按最新/最多回答/未解决筛选
- [ ] 问题详情页：问题内容 + 回答列表 + 发布回答
- [ ] 回答投票（voteCount 累加/累减）
- [ ] 问题提问者采纳最佳答案（isAccepted，一个问题只能有一个）
- [ ] 问题状态自动流转：有被采纳回答 → ANSWERED

**用户主页子系统:**
- [ ] 用户公开主页（/users/:userId）：头像 + 简介 + 朝圣等级 + 统计数据
- [ ] 朝圣统计展示：totalTrips / totalSites / guideCount / reviewCount
- [ ] 朝圣等级（pilgrimLevel 1-10）徽章展示
- [ ] 用户发布的游记列表（公开可见）
- [ ] 我的主页（/profile）：可编辑 displayName / avatar / bio / location

### 4.2 增强功能（P1 — 应该有）

**照片墙子系统:**
- [ ] 全平台照片墙（/community/photos）：瀑布流展示用户上传的照片
- [ ] 照片按宗教/圣地筛选
- [ ] 精选照片（featured=true）置顶展示
- [ ] 照片点击可查看来源游记

**排行榜子系统:**
- [ ] 社区排行榜（/community/leaderboard）：本月最活跃用户 Top 20
- [ ] 热门游记榜：按viewCount / likeCount排序
- [ ] 热门问答榜：按answerCount / viewCount排序

**标签系统:**
- [ ] 游记/问答添加标签（最多5个，前端提供热门标签快速选择）
- [ ] 标签聚合页：点击标签查看相关内容
- [ ] 热门标签展示在社区首页

**社区首页:**
- [ ] 社区首页（/community）：推荐游记 + 热门问答 + 照片墙入口 + 排行榜入口
- [ ] 按宗教信仰分区浏览（Tab切换）

### 4.3 优化功能（P2 — 可以有）

- [ ] 游记内容与祖训的关联引用（@祖训ID自动转为卡片引用）
- [ ] 朝圣验证徽章：游记作者有COMPLETED行程对应同一圣地时，展示"已朝圣 ✓"
- [ ] 游记分享海报生成（封面图 + 标题 + 作者 + JOINUS Logo）
- [ ] 问答订阅：关注某问题，有新回答时推送通知
- [ ] 管理员"精选游记"标记，精选内容出现在社区首页Featured区块
- [ ] 游记草稿自动保存（localStorage + 服务端双保险）

---

## 5. 页面线框 / 交互设计

### 5.1 社区首页（/community）

```
+----------------------------------------------------------+
|  导航栏 (JOINUS.COM + 全局搜索 + 用户头像)               |
+----------------------------------------------------------+
|  社区Hero区                                              |
|  "朝圣者社区" 大标题 + 副标题 + [写游记] [提问] 按钮     |
+----------------------------------------------------------+
|  Tab栏: [全部] [佛教] [道教] [基督教] [伊斯兰] [更多▾]  |
+----------------------------------------------------------+
|  左侧主内容区 (70%)          | 右侧边栏 (30%)           |
|                              |                          |
|  【精选游记】                | 【排行榜】               |
|  [大卡片: 封面+标题+摘要]    | 1. 用户名 (N篇游记)      |
|  [大卡片]                   | 2. 用户名                |
|                              | 3. 用户名               |
|  【热门问答】                |                          |
|  Q: 问题标题 (N个回答)       | 【热门标签】             |
|  Q: 问题标题 (N个回答)       | #朝拜 #摄影 #素食       |
|  Q: 问题标题 (N个回答)       | #亲子 #禅修 #朝圣路线   |
|  [查看更多问答 →]            |                          |
|                              | 【照片墙入口】           |
|  【最新游记】                | [3x3缩略图网格]         |
|  [卡片] [卡片] [卡片]       | [查看全部照片 →]        |
|  [卡片] [卡片] [卡片]       |                          |
|  [加载更多]                  |                          |
+----------------------------------------------------------+
|  Footer                                                  |
+----------------------------------------------------------+
```

### 5.2 游记列表页（/community/guides）

```
+----------------------------------------------------------+
|  页面标题: 朝圣游记与攻略                                 |
+----------------------------------------------------------+
|  筛选栏:                                                 |
|  排序: [最新▾] [最热] [最多点赞]                        |
|  宗教: [全部▾] [佛教] [道教] [基督教]...                |
|  标签: [朝拜] [摄影] [素食] [亲子] [禅修] [+更多]       |
|  [写游记 + 按钮]                                        |
+----------------------------------------------------------+
|  游记卡片网格 (3列, 响应式降级为2列/1列)                 |
|                                                          |
|  +------------------+  +------------------+             |
|  | [封面图 16:9]    |  | [封面图 16:9]    |             |
|  | 标题 (最多2行)   |  | 标题 (最多2行)   |             |
|  | [标签][标签]     |  | [标签][标签]     |             |
|  | 作者头像 名称    |  | 作者头像 名称    |             |
|  | 👁 1.2k  ❤️ 89   |  | 👁 980  ❤️ 42    |             |
|  | 📍 少林寺        |  | 📍 麦加          |             |
|  +------------------+  +------------------+             |
|                                                          |
|  [加载更多] / 无限滚动                                   |
+----------------------------------------------------------+
```

### 5.3 游记详情页（/community/guides/:id）

```
+----------------------------------------------------------+
|  面包屑: 社区 > 游记 > {标题}                            |
+----------------------------------------------------------+
|  封面大图 (全宽, 最高 500px)                             |
+----------------------------------------------------------+
|  左侧正文区 (70%)             | 右侧作者卡片 (30%)       |
|                               |                          |
|  标题 (H1)                   | +----------------------+ |
|  发布时间 | 阅读数 | 点赞数   | | 作者头像              | |
|                               | | 朝圣等级 Lv.7        | |
|  [已朝圣 ✓ 少林寺] 标签徽章  | | displayName          | |
|                               | | 已发布 12 篇游记     | |
|  --- Markdown 正文 ---        | | [查看主页]           | |
|  (图文混排渲染)               | +----------------------+ |
|                               |                          |
|  ---正文结束---               | 关联圣地:               |
|                               | [少林寺卡片 →]          |
|  标签: [朝拜] [摄影]          |                          |
|  [❤️ 点赞 (89)] [分享]       | 相关游记:               |
|                               | [小卡片] [小卡片]       |
|  --- 评论区 ---               |                          |
|  N 条评论                     |                          |
|  [评论输入框]                 |                          |
|  [评论列表]                   |                          |
+----------------------------------------------------------+
```

### 5.4 问答列表页（/community/questions）

```
+----------------------------------------------------------+
|  页面标题: 朝圣问答                                      |
+----------------------------------------------------------+
|  筛选栏: [全部] [未解决] [已解答] [最多回答]             |
|  [提问 + 按钮]                                          |
+----------------------------------------------------------+
|  问题列表 (单列)                                         |
|                                                          |
|  +------------------------------------------------------+|
|  | Q: 少林寺朝拜需要提前预约吗？          [未解决]      ||
|  | 描述摘要 (50字)                                       ||
|  | 标签: [少林寺] [朝拜攻略]  提问者: 用户名  2天前     ||
|  | 💬 3个回答  👁 234次浏览                              ||
|  +------------------------------------------------------+|
|                                                          |
|  +------------------------------------------------------+|
|  | Q: 麦加朝圣签证怎么办理？             [已解答 ✓]    ||
|  ...                                                     ||
|  +------------------------------------------------------+|
|                                                          |
|  [加载更多]                                              |
+----------------------------------------------------------+
```

### 5.5 问题详情页（/community/questions/:id）

```
+----------------------------------------------------------+
|  [← 返回问答列表]                                        |
+----------------------------------------------------------+
|  问题标题 (H1)                                           |
|  提问者头像 | 名称 | 发布时间 | 👁 234浏览 | 状态徽章   |
|  标签: [少林寺] [朝拜攻略]                               |
|  关联圣地: 少林寺 →                                     |
|  --- 问题详细描述 ---                                    |
+----------------------------------------------------------+
|  N 个回答  (排序: [最高票▾] [最新])                     |
|                                                          |
|  +------------------------------------------------------+|
|  | [最佳答案 ✓] (isAccepted=true, 绿色高亮边框)        ||
|  | 回答者头像 | 名称 | Lv.8 | 1天前                    ||
|  | 回答正文...                                          ||
|  | [👍 赞 (24)] [👎 踩]  [采纳为最佳答案] (仅提问者可见)||
|  +------------------------------------------------------+|
|                                                          |
|  +------------------------------------------------------+|
|  | 回答者头像 | 名称 | Lv.5 | 3天前                    ||
|  | 回答正文...                                          ||
|  | [👍 赞 (8)] [👎 踩]  [采纳为最佳答案]               ||
|  +------------------------------------------------------+|
|                                                          |
|  --- 写回答 ---                                          |
|  [文本编辑器]                                            |
|  [提交回答]                                              |
+----------------------------------------------------------+
```

### 5.6 照片墙（/community/photos）

```
+----------------------------------------------------------+
|  页面标题: 朝圣照片墙                                    |
|  筛选: [全部宗教▾] [精选] [最新] [最多点赞]             |
+----------------------------------------------------------+
|  瀑布流照片网格 (Masonry Layout)                         |
|                                                          |
|  +--------+  +--------+  +--------+                     |
|  | 图片   |  | 图片   |  | 图片   |                     |
|  | (高)   |  | (矮)   |  | (中)   |                     |
|  | 📍少林寺|  | 📍麦加  |  | 📍梵蒂冈|                     |
|  +--------+  +--------+  +--------+                     |
|  | 图片   |  | 图片   |  | 图片   |                     |
|  | (矮)   |  | (高)   |  | (高)   |                     |
|  +--------+  +--------+  +--------+                     |
|                                                          |
|  [加载更多]                                              |
+----------------------------------------------------------+
```

### 5.7 用户主页（/users/:userId）

```
+----------------------------------------------------------+
|  用户封面背景 (默认渐变)                                 |
|  用户头像 (圆形, 80px) | displayName | 朝圣等级 Lv.7    |
|  简介: "我已走过13座佛教圣地..."                        |
|  📍 中国·西安                                           |
|  [游记 12] [评价 8] [已朝圣 13处]                       |
+----------------------------------------------------------+
|  统计徽章排列:                                           |
|  [🗺 13次行程] [🏛 13处圣地] [📖 12篇游记] [⭐ 8条评价]  |
+----------------------------------------------------------+
|  Tab: [游记] [问答] [评价]                              |
|                                                          |
|  (游记Tab激活)                                          |
|  游记卡片列表 (2列网格)                                  |
|  [卡片] [卡片]                                          |
|  [卡片] [卡片]                                          |
+----------------------------------------------------------+
```

### 5.8 排行榜（/community/leaderboard）

```
+----------------------------------------------------------+
|  页面标题: 社区排行榜                                    |
|  周期: [本月▾] [本周] [全部]                             |
+----------------------------------------------------------+
|  Tab: [活跃用户] [热门游记] [热门问答]                   |
+----------------------------------------------------------+
|  (活跃用户Tab)                                          |
|                                                          |
|  #1  [头像] 用户名   Lv.10  12篇游记 / 45条评价          |
|  #2  [头像] 用户名   Lv.9   9篇游记 / 38条评价           |
|  #3  [头像] 用户名   Lv.8   7篇游记 / 29条评价           |
|  ...                                                     |
|  #20 [头像] 用户名   Lv.4   2篇游记 / 5条评价            |
+----------------------------------------------------------+
```

### 5.9 三态设计

| 状态 | 游记列表 | 问答列表 | 照片墙 | 用户主页 |
|------|---------|---------|--------|---------|
| Loading | 骨架屏卡片（3x3灰色矩形脉冲动画） | 骨架屏列表条目 | Masonry骨架屏 | 用户信息区骨架屏 |
| Empty | "还没有游记，成为第一个分享者" + [写游记]按钮 | "暂无问答，提出第一个问题" + [提问]按钮 | "暂无照片，发布游记上传照片" | "TA还没有发布游记" |
| Error | 错误图标 + "加载失败" + [重试]按钮 | 同左 | 同左 | 同左 |

---

## 6. API契约

### 6.1 游记/攻略 (Guides) 端点

#### `GET /api/guides`

获取游记列表（公开）

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `page` | number | 否 | 页码，默认1 |
| `pageSize` | number | 否 | 每页数量，默认20，最大100 |
| `sort` | string | 否 | `latest`(默认) \| `popular` \| `most_liked` |
| `entityType` | string | 否 | 关联实体类型，如 `HOLY_SITE` \| `TEMPLE` |
| `entityId` | string | 否 | 关联实体ID，配合entityType使用 |
| `tags` | string | 否 | 逗号分隔的标签列表，如 `朝拜,摄影` |
| `userId` | string | 否 | 筛选某用户的游记 |
| `status` | string | 否 | 仅作者或管理员可用，`DRAFT` \| `PUBLISHED`，默认只返回PUBLISHED |

**响应格式:**

```json
{
  "items": [
    {
      "id": "clxxx",
      "title": "少林寺朝拜记",
      "coverImage": "https://cdn.joinus.com/guides/xxx.jpg",
      "excerpt": "正文前100字...",
      "tags": ["朝拜", "摄影", "禅修"],
      "entityType": "HOLY_SITE",
      "entityId": "clyyy",
      "entityName": "少林寺",
      "status": "PUBLISHED",
      "viewCount": 1280,
      "likeCount": 89,
      "commentCount": 12,
      "publishedAt": "2026-03-20T08:00:00Z",
      "author": {
        "id": "clzzz",
        "displayName": "朝圣者小明",
        "avatar": "https://cdn.joinus.com/avatars/zzz.jpg",
        "pilgrimLevel": 7
      },
      "isPilgrimVerified": true
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 20
}
```

#### `GET /api/guides/:id`

获取游记详情（公开，自动累加 viewCount）

**响应格式:**

```json
{
  "id": "clxxx",
  "title": "少林寺朝拜记",
  "coverImage": "https://cdn.joinus.com/guides/xxx.jpg",
  "content": "# 出发\n\n正文 Markdown 内容...",
  "tags": ["朝拜", "摄影"],
  "entityType": "HOLY_SITE",
  "entityId": "clyyy",
  "status": "PUBLISHED",
  "viewCount": 1281,
  "likeCount": 89,
  "commentCount": 12,
  "publishedAt": "2026-03-20T08:00:00Z",
  "author": {
    "id": "clzzz",
    "displayName": "朝圣者小明",
    "avatar": "...",
    "pilgrimLevel": 7,
    "guideCount": 12
  },
  "isLikedByCurrentUser": false,
  "isPilgrimVerified": true
}
```

#### `POST /api/guides`

创建游记（需JWT认证）

**请求体:**

```json
{
  "title": "少林寺朝拜记",
  "coverImage": "https://cdn.joinus.com/guides/xxx.jpg",
  "content": "# 出发\n\n正文...",
  "tags": ["朝拜", "摄影"],
  "entityType": "HOLY_SITE",
  "entityId": "clyyy",
  "status": "DRAFT"
}
```

**响应:** `201 Created` + 创建的游记对象

#### `PATCH /api/guides/:id`

更新游记（需JWT认证，仅作者或管理员）

**请求体:** 与POST相同，字段均可选

**响应:** `200 OK` + 更新后的游记对象

#### `DELETE /api/guides/:id`

删除游记（需JWT认证，仅作者或管理员）

**响应:** `204 No Content`

#### `POST /api/guides/:id/publish`

发布草稿（需JWT认证，仅作者）将 status 从 DRAFT → PUBLISHED

**响应:** `200 OK` + 更新后的游记对象（status: PUBLISHED, publishedAt: now）

#### `GET /api/guides/:id/comments`

获取游记评论列表（公开）

**请求参数:** `page`, `pageSize`

**响应格式:**

```json
{
  "items": [
    {
      "id": "clccc",
      "content": "写得太好了！",
      "createdAt": "2026-03-21T10:00:00Z",
      "author": {
        "id": "claaa",
        "displayName": "用户A",
        "avatar": "..."
      }
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 20
}
```

#### `POST /api/guides/:id/comments`

发表游记评论（需JWT认证）

**请求体:** `{ "content": "评论内容" }`

**响应:** `201 Created` + 创建的评论对象

#### `DELETE /api/guides/:guideId/comments/:commentId`

删除评论（需JWT认证，仅评论作者或管理员）

**响应:** `204 No Content`

#### `POST /api/guides/:id/like`

点赞游记（需JWT认证）；若已点赞则取消点赞（toggle语义）

**响应:**

```json
{ "liked": true, "likeCount": 90 }
```

**错误码:**

| HTTP状态码 | 错误码 | 说明 |
|------------|-------|------|
| 401 | UNAUTHORIZED | 未登录 |
| 403 | FORBIDDEN | 无权限 |
| 404 | NOT_FOUND | 游记不存在 |
| 400 | INVALID_PARAMS | 参数校验失败 |

---

### 6.2 问答 (Questions & Answers) 端点

#### `GET /api/questions`

获取问题列表（公开）

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `page` | number | 否 | 默认1 |
| `pageSize` | number | 否 | 默认20，最大100 |
| `sort` | string | 否 | `latest`(默认) \| `most_answers` \| `unanswered` |
| `status` | string | 否 | `OPEN` \| `ANSWERED` \| `CLOSED` |
| `entityType` | string | 否 | 关联实体类型 |
| `entityId` | string | 否 | 关联实体ID |
| `tags` | string | 否 | 逗号分隔标签 |

**响应格式:**

```json
{
  "items": [
    {
      "id": "clqqq",
      "title": "少林寺朝拜需要提前预约吗？",
      "excerpt": "问题描述前50字...",
      "tags": ["少林寺", "朝拜攻略"],
      "entityType": "HOLY_SITE",
      "entityId": "clyyy",
      "entityName": "少林寺",
      "status": "OPEN",
      "viewCount": 234,
      "answerCount": 3,
      "publishedAt": "2026-03-18T09:00:00Z",
      "author": {
        "id": "clzzz",
        "displayName": "用户小李",
        "avatar": "..."
      }
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

#### `GET /api/questions/:id`

获取问题详情及回答列表（公开，自动累加viewCount）

**响应格式:**

```json
{
  "id": "clqqq",
  "title": "少林寺朝拜需要提前预约吗？",
  "content": "问题详细描述...",
  "tags": ["少林寺", "朝拜攻略"],
  "entityType": "HOLY_SITE",
  "entityId": "clyyy",
  "status": "ANSWERED",
  "viewCount": 235,
  "answerCount": 3,
  "author": { "id": "...", "displayName": "...", "avatar": "..." },
  "answers": [
    {
      "id": "clans",
      "content": "不需要预约，但建议工作日前往...",
      "isAccepted": true,
      "voteCount": 24,
      "createdAt": "2026-03-19T10:00:00Z",
      "author": { "id": "...", "displayName": "...", "pilgrimLevel": 8 }
    }
  ]
}
```

#### `POST /api/questions`

发布问题（需JWT认证）

**请求体:**

```json
{
  "title": "少林寺朝拜需要提前预约吗？",
  "content": "详细描述...",
  "tags": ["少林寺", "朝拜攻略"],
  "entityType": "HOLY_SITE",
  "entityId": "clyyy"
}
```

**响应:** `201 Created` + 问题对象

#### `PATCH /api/questions/:id`

更新问题（需JWT认证，仅提问者或管理员，仅OPEN状态可更新）

#### `POST /api/questions/:id/answers`

发布回答（需JWT认证）

**请求体:** `{ "content": "回答内容..." }`

**响应:** `201 Created` + 回答对象

#### `POST /api/questions/:questionId/answers/:answerId/accept`

采纳最佳答案（需JWT认证，仅问题提问者）

- 将该回答 `isAccepted` 置为 true，其余回答 isAccepted 置为 false
- 问题 status 自动流转为 `ANSWERED`

**响应:** `200 OK` + 更新后的回答对象

#### `POST /api/questions/:questionId/answers/:answerId/vote`

对回答投赞/踩（需JWT认证）

**请求体:** `{ "direction": "UP" | "DOWN" }`

**响应:** `200 OK` + `{ "voteCount": 25 }`

---

### 6.3 照片墙 (Photos) 端点

#### `GET /api/photos`

获取照片列表（从游记图片聚合，公开）

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `page` | number | 否 | 默认1 |
| `pageSize` | number | 否 | 默认30，最大100 |
| `featured` | boolean | 否 | 仅返回精选照片 |
| `entityType` | string | 否 | 关联实体类型筛选 |
| `entityId` | string | 否 | 关联实体ID筛选 |

**响应格式:**

```json
{
  "items": [
    {
      "id": "clppp",
      "url": "https://cdn.joinus.com/photos/xxx.jpg",
      "caption": "少林寺晨曦",
      "featured": true,
      "guideId": "clggg",
      "guideTitle": "少林寺三日朝拜记",
      "entityType": "HOLY_SITE",
      "entityId": "clyyy",
      "entityName": "少林寺",
      "uploadedBy": {
        "id": "clzzz",
        "displayName": "用户小明",
        "avatar": "..."
      },
      "createdAt": "2026-03-20T08:00:00Z"
    }
  ],
  "total": 320,
  "page": 1,
  "pageSize": 30
}
```

#### `GET /api/photos/featured`

获取精选照片（公开，用于首页/详情页头图轮播，最多返回10张）

**响应格式:** 同 `/api/photos` 的 items 数组（无分页）

---

### 6.4 用户主页 (User Profile) 端点

#### `GET /api/users/:userId/profile`

获取用户公开主页数据（公开）

**响应格式:**

```json
{
  "id": "clppp",
  "userId": "clzzz",
  "displayName": "朝圣者小明",
  "avatar": "https://cdn.joinus.com/avatars/zzz.jpg",
  "bio": "我已走过13座佛教圣地，愿与诸君共修行。",
  "location": "中国·西安",
  "pilgrimLevel": 7,
  "totalTrips": 13,
  "totalSites": 13,
  "guideCount": 12,
  "reviewCount": 8,
  "followerCount": 234,
  "followingCount": 56,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### `GET /api/users/me/profile`

获取当前登录用户的主页数据（需JWT认证）

**响应格式:** 同上，额外包含私有字段（如 email）

#### `PATCH /api/users/me/profile`

更新当前用户主页信息（需JWT认证）

**请求体:**

```json
{
  "displayName": "新的显示名",
  "avatar": "https://cdn.joinus.com/avatars/new.jpg",
  "bio": "更新后的简介",
  "location": "日本·京都"
}
```

**响应:** `200 OK` + 更新后的profile对象

---

### 6.5 社区综合 (Community) 端点

#### `GET /api/community/leaderboard`

获取社区排行榜（公开）

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `type` | string | 否 | `users`(默认) \| `guides` \| `questions` |
| `period` | string | 否 | `month`(默认) \| `week` \| `all_time` |
| `limit` | number | 否 | 返回数量，默认20，最大20 |

**响应格式 (type=users):**

```json
{
  "type": "users",
  "period": "month",
  "items": [
    {
      "rank": 1,
      "userId": "clzzz",
      "displayName": "朝圣者小明",
      "avatar": "...",
      "pilgrimLevel": 10,
      "guideCount": 5,
      "reviewCount": 12,
      "score": 145
    }
  ]
}
```

#### `GET /api/community/trending`

获取热门趋势内容（公开）

**响应格式:**

```json
{
  "trendingGuides": [ /* 最近7天viewCount增长最快的5篇游记 */ ],
  "trendingQuestions": [ /* 最近7天answerCount最多的5个问题 */ ],
  "trendingTags": [ /* 最近7天使用频率最高的10个标签字符串数组 */ ]
}
```

---

## 7. 数据模型

### 7.1 新增 Prisma 模型

```prisma
// ============================================================
// M17 攻略社区 — 新增模型
// ============================================================

// 游记/攻略
model Guide {
  id           String      @id @default(cuid())
  userId       String
  title        String
  coverImage   String?
  content      String      // Markdown 正文
  entityType   String?     // "HOLY_SITE" | "TEMPLE" | "PATRIARCH" etc.
  entityId     String?     // 关联实体 ID
  tags         String[]    @default([])
  status       GuideStatus @default(DRAFT)
  viewCount    Int         @default(0)
  likeCount    Int         @default(0)  // 冗余缓存
  commentCount Int         @default(0)  // 冗余缓存
  publishedAt  DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  user     User           @relation(fields: [userId], references: [id])
  likes    GuideLike[]
  comments GuideComment[]

  @@index([userId])
  @@index([status, publishedAt])
  @@index([entityType, entityId])
}

enum GuideStatus {
  DRAFT
  PUBLISHED
  HIDDEN
}

// 游记点赞 (唯一约束防止重复点赞)
model GuideLike {
  id      String @id @default(cuid())
  guideId String
  userId  String

  guide Guide @relation(fields: [guideId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@unique([guideId, userId])
  @@index([userId])
}

// 游记评论
model GuideComment {
  id        String   @id @default(cuid())
  guideId   String
  userId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  guide Guide @relation(fields: [guideId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@index([guideId])
  @@index([userId])
}

// 问题
model Question {
  id         String         @id @default(cuid())
  userId     String
  title      String
  content    String
  entityType String?
  entityId   String?
  tags       String[]       @default([])
  status     QuestionStatus @default(OPEN)
  viewCount  Int            @default(0)
  answerCount Int           @default(0)  // 冗余缓存
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  user    User     @relation(fields: [userId], references: [id])
  answers Answer[]

  @@index([userId])
  @@index([status])
  @@index([entityType, entityId])
}

enum QuestionStatus {
  OPEN
  ANSWERED
  CLOSED
}

// 回答
model Answer {
  id         String   @id @default(cuid())
  questionId String
  userId     String
  content    String
  isAccepted Boolean  @default(false)
  voteCount  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id])

  @@index([questionId])
  @@index([userId])
}

// 用户主页 (扩展 User 模型)
model UserProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  displayName    String?
  avatar         String?
  bio            String?
  location       String?
  pilgrimLevel   Int      @default(1)   // 1-10
  totalTrips     Int      @default(0)   // 冗余缓存，从 Trip 模型同步
  totalSites     Int      @default(0)   // 冗余缓存，从 TripSite 模型同步
  guideCount     Int      @default(0)   // 冗余缓存，从 Guide 模型同步
  reviewCount    Int      @default(0)   // 冗余缓存，从 Review 模型同步
  followerCount  Int      @default(0)   // Phase D 社交功能用
  followingCount Int      @default(0)   // Phase D 社交功能用
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([pilgrimLevel])
}
```

### 7.2 新增字段说明

| 模型 | 字段 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Guide | `entityType` | String? | null | 关联实体类型，枚举字符串 |
| Guide | `entityId` | String? | null | 关联实体的 cuid |
| Guide | `likeCount` | Int | 0 | 点赞数冗余缓存，GuideLike变更时更新 |
| Guide | `commentCount` | Int | 0 | 评论数冗余缓存，GuideComment变更时更新 |
| Answer | `isAccepted` | Boolean | false | 一个Question中最多一个为true |
| Answer | `voteCount` | Int | 0 | 净票数（赞-踩），暂不拆分存储 |
| UserProfile | `pilgrimLevel` | Int | 1 | 1-10，由后台计算规则定期更新 |
| UserProfile | `totalTrips` | Int | 0 | 冗余缓存，Trip COMPLETED数量 |
| UserProfile | `totalSites` | Int | 0 | 冗余缓存，去重的TripSite数量 |

### 7.3 冗余字段同步策略

```
Guide.likeCount     ← GuideLike 创建/删除时 +1/-1 (Service层原子更新)
Guide.commentCount  ← GuideComment 创建/删除时 +1/-1
Question.answerCount ← Answer 创建时 +1
UserProfile.guideCount  ← Guide PUBLISHED/HIDDEN 时 +1/-1
UserProfile.reviewCount ← Review APPROVED/HIDDEN 时 +1/-1
UserProfile.totalTrips  ← Trip 状态变为 COMPLETED 时 +1 (定期reconcile)
UserProfile.totalSites  ← TripSite 添加时重新计算去重 (定期reconcile)
UserProfile.pilgrimLevel ← 定期批量计算 (规则: level = min(10, floor(totalTrips/2) + 1))
```

---

## 8. 技术约束

### 8.1 性能要求

| 页面/接口 | 指标 | 目标值 |
|---------|------|-------|
| 游记列表页首屏 | LCP | < 2s |
| 游记详情页 | LCP | < 1.5s |
| API列表接口响应 | P95 | < 500ms |
| API详情接口响应 | P95 | < 300ms |
| 照片墙瀑布流 | LCP | < 2.5s |

### 8.2 移动端

- 游记卡片网格：桌面3列 → 平板2列 → 手机1列
- 游记详情：侧边栏在手机端隐藏，折叠到底部
- 最小可点击区域 44×44px（点赞/评论按钮）
- 正文 Markdown 渲染字号 ≥ 16px

### 8.3 安全规范

- 游记/问答/回答的内容提交必须经过 XSS 过滤（使用 DOMPurify 或 sanitize-html）
- 图片上传仅接受 jpg/png/webp，最大5MB/张，每篇游记最多20张
- 图片存储使用 CDN 路径，禁止直接存储 base64 到数据库
- Guide CRUD 端点需要 `@UseGuards(JwtAuthGuard)` [R-63]
- 更新/删除操作必须验证 `userId === currentUser.id` [R-68] (IDOR防护)
- 所有 findMany 必须有 `take` 参数上限 [R-64]

### 8.4 类型安全

- 禁止 `any` 类型 [R-01]
- `entityType` 字段使用联合类型而非枚举（避免 Prisma enum Swagger 循环依赖问题）
- DTO 全部使用 `class-validator` 装饰器 [R-03]
- 前端 API 响应类型在 `@zuting/shared-types` 中定义

### 8.5 国际化

- 游记内容为用户自由输入，支持中英文混排
- UI文案（按钮/提示/空状态文案）需在 i18n 配置中维护中英双语版本 [06-国际化规范.md]
- 时间显示使用相对时间（"3天前"）+ hover 展示绝对时间（ISO8601）

### 8.6 依赖说明

- Markdown渲染：`react-markdown` + `remark-gfm`（Web端），`react-native-markdown-display`（Mobile端）
- 照片墙瀑布流：`react-masonry-css`（Web端）
- 图片上传：使用已有的文件上传接口，复用 Multer 配置

---

## 9. 验收标准

### 9.1 功能验收

| 编号 | 验收项 | 测试步骤 | 通过标准 |
|------|-------|---------|---------|
| AC-01 | 游记发布流程 | 登录后访问 /community/guides/new，填写标题+正文（≥50字）+封面图，点击"发布" | 页面跳转到游记详情页，status=PUBLISHED，游记出现在列表首位 |
| AC-02 | 游记草稿保存 | 填写游记内容后点击"保存草稿" | status=DRAFT，仅在"我的草稿"中可见，公开列表不显示 |
| AC-03 | 游记点赞 | 在游记详情页点击❤️点赞按钮 | likeCount+1，按钮变为已点赞状态；再次点击取消，likeCount-1 |
| AC-04 | 游记评论 | 在评论框输入内容点击"发布评论" | 评论出现在列表顶部，commentCount+1 |
| AC-05 | 游记关联圣地 | 发布时选择关联"少林寺"，发布后访问少林寺详情页 | 少林寺详情页"游记"tab显示该篇游记 |
| AC-06 | 发布问题 | 登录后在问答列表点击"提问"，填写标题+描述，点击发布 | 问题出现在列表，status=OPEN |
| AC-07 | 发布回答 | 在问题详情页填写回答并提交 | 回答出现在回答列表，answerCount+1 |
| AC-08 | 采纳最佳答案 | 问题提问者点击某回答的"采纳为最佳答案" | 该回答 isAccepted=true 且绿色标记，问题 status=ANSWERED |
| AC-09 | 回答投票 | 点击回答的👍赞 | voteCount+1；同一用户不可重复投赞（前端防抖+后端幂等） |
| AC-10 | 用户主页 | 访问 /users/:userId | 显示头像/等级/游记数/评价数/已朝圣处数，游记列表正确展示 |
| AC-11 | 编辑我的主页 | 访问 /profile，修改displayName，保存 | 刷新后显示新displayName，其他用户访问该主页也同步更新 |
| AC-12 | 照片墙 | 访问 /community/photos | 瀑布流展示用户上传的照片，精选照片排在前面 |
| AC-13 | 排行榜 | 访问 /community/leaderboard | 显示本月Top20活跃用户，数据正确（按guideCount+reviewCount加权） |
| AC-14 | 空状态 | 访问一个没有游记的新用户主页 | 显示"TA还没有发布游记"空状态，有"写游记"引导按钮 |
| AC-15 | 错误状态 | 断网后访问游记列表 | 显示网络错误提示 + "重试"按钮，点击重试后重新请求 |
| AC-16 | 移动端适配 | iPhone 14 (390px) 访问游记列表 | 单列卡片布局，无横向滚动条，点赞/评论按钮可点击区域≥44px |
| AC-17 | 权限防护 | 未登录用户点击"发布游记" | 弹出登录引导弹窗，不可直接提交 |
| AC-18 | IDOR防护 | 用户A尝试 PATCH /api/guides/{用户B的guideId} | 返回 403 Forbidden |
| AC-19 | XSS防护 | 游记正文提交含 `<script>alert(1)</script>` | 存储和展示时均不执行JS，内容被正确转义 |
| AC-20 | 标签筛选 | 在游记列表点击"摄影"标签 | 列表只显示包含"摄影"标签的游记 |

### 9.2 性能验收

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 游记列表首屏 LCP | < 2s | Chrome Lighthouse (网络: Fast 3G) |
| 游记详情页 LCP | < 1.5s | Chrome Lighthouse |
| `GET /api/guides` 响应时间 | P95 < 500ms | Network面板 (测试集: 100篇游记) |
| `GET /api/guides/:id` 响应时间 | P95 < 300ms | Network面板 |
| 照片墙首屏 LCP | < 2.5s | Chrome Lighthouse |
| TypeScript 编译 | 0 error | `pnpm tsc --noEmit` |

### 9.3 边界条件验收

| 边界场景 | 验收要求 |
|---------|---------|
| 超长标题（>100字） | 游记卡片标题显示最多2行 + 省略号，不破坏卡片布局 |
| 超长正文（>50,000字） | 游记详情页正常渲染，无超时或崩溃 |
| 游记0条 | 列表页显示"还没有游记"空状态 + [写游记]按钮 |
| 问题0个回答 | 问题详情页显示"暂无回答，你来第一个" |
| 图片加载失败 | 显示默认占位图（宗教符号灰色图），不显示broken图标 |
| 并发点赞（同一用户快速连点） | 前端防抖300ms + 后端 GuideLike @@unique 约束保证幂等 |
| 非法entityId | Guide创建时若entityId不存在对应实体，返回 400 INVALID_ENTITY_ID |

### 9.4 完成标志

- [ ] 所有 P0 功能已实现并通过 AC-01 至 AC-10 验收
- [ ] P1 功能（照片墙/排行榜/标签）已实现并通过 AC-12/AC-13/AC-20 验收
- [ ] TypeScript 编译零错误（`pnpm tsc --noEmit`）
- [ ] 移动端响应式验证通过（AC-16）
- [ ] 三态（loading/error/empty）全部实现（AC-14/AC-15）
- [ ] 安全验收通过（AC-17/AC-18/AC-19）
- [ ] API 端点全部有 Swagger 文档
- [ ] Prisma Schema 已执行 `db push`，新表正常创建

---

## 10. 子页面PRD索引

根据 [PRD-G01] 规则，以下子页面需单独创建 P 系列 PRD（Sprint B3 开发前创建）：

| PRD文件 | 页面 | 优先级 | 状态 |
|---------|------|--------|------|
| P08-PRD-社区首页.md | /community | P1 | 待创建 |
| P09-PRD-游记列表页.md | /community/guides | P0 | 待创建 |
| P10-PRD-游记详情页.md | /community/guides/:id | P0 | 待创建 |
| P11-PRD-游记编辑器页.md | /community/guides/new + /edit | P0 | 待创建 |
| P12-PRD-问答列表页.md | /community/questions | P0 | 待创建 |
| P13-PRD-问题详情页.md | /community/questions/:id | P0 | 待创建 |
| P14-PRD-照片墙页.md | /community/photos | P1 | 待创建 |
| P15-PRD-用户主页.md | /users/:userId + /profile | P0 | 待创建 |
| P16-PRD-社区排行榜页.md | /community/leaderboard | P1 | 待创建 |

---

## 11. 开发记录

### 11.1 实现进度

| 任务 | 负责人 | 开始日期 | 完成日期 | 状态 |
|------|-------|---------|---------|------|
| PRD 撰写 | CEO++ | 2026-03-29 | 2026-03-29 | 完成 |
| Prisma Schema 新增模型 | 全栈 | - | - | 未开始 |
| NestJS 后端：Guide模块 | 全栈 | - | - | 未开始 |
| NestJS 后端：Question模块 | 全栈 | - | - | 未开始 |
| NestJS 后端：Photo聚合接口 | 全栈 | - | - | 未开始 |
| NestJS 后端：UserProfile模块 | 全栈 | - | - | 未开始 |
| NestJS 后端：Community聚合接口 | 全栈 | - | - | 未开始 |
| Web 前端：游记模块 (P09+P10+P11) | 前端 | - | - | 未开始 |
| Web 前端：问答模块 (P12+P13) | 前端 | - | - | 未开始 |
| Web 前端：照片墙 (P14) | 前端 | - | - | 未开始 |
| Web 前端：用户主页 (P15) | 前端 | - | - | 未开始 |
| Web 前端：排行榜 (P16) | 前端 | - | - | 未开始 |
| Mobile：游记/问答Tab增强 | 移动端 | - | - | 未开始 |
| 小程序：社区页面 | 小程序 | - | - | 未开始 |
| Admin：内容审核后台 | 后台 | - | - | 未开始 |
| 联调测试 | 全栈 | - | - | 未开始 |

### 11.2 变更记录

| 日期 | 版本 | 变更内容 | 原因 | 更改者 |
|------|------|---------|------|-------|
| 2026-03-29 | v1.0 | 初版创建 | Sprint B3 启动 | CEO++ |

---

*本 PRD 由 CEO++ 指令触发，遵循 SCP-03 PRD先行铁律。开发前必须先阅读 docs/protocols/08-PRD撰写规范.md。*

*版本历史: v1.0 (2026-03-29) — Sprint B3 攻略社区模块初版*
