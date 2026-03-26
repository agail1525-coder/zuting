# M05 行程管理 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: 已实现(v1) / v2规划中

---

## 1. 需求背景与目标

### 1.1 背景

行程管理是祖庭旅行平台的核心交易模块，衔接"文化探索"与"实地朝圣"两大场景。用户从浏览圣地、祖庭信息，到生成可执行的朝圣行程，再到支付、出行、完成、评价，全生命周期均由本模块承载。行程采用12状态有限状态机驱动，确保流程严谨、审计可追踪。

### 1.2 目标

| 目标 | 指标 | 说明 |
|------|------|------|
| 行程创建转化率 | >30% | 浏览圣地后创建行程的用户占比 |
| 行程完成率 | >60% | 已确认行程最终完成朝圣的比例 |
| 状态流转合规率 | 100% | 所有状态变更必须经过状态机校验 |
| 平均行程规划时长 | <15min | 从创建到提交的平均耗时 |

### 1.3 范围

| 范围 | v1 (已实现) | v2 (规划中) |
|------|-------------|-------------|
| 行程 CRUD | 创建/列表/详情/更新 | 创建向导页面 |
| 12状态机 | 全部15种转换 | — |
| 圣地关联 | 添加/移除圣地 | 拖拽排序、行程优化 |
| 状态元数据 | API输出标签+颜色+可用转换 | — |
| 导游分配 | — | 匹配算法+导游端接单 |
| 行程导出 | — | PDF行程单 |
| 行程模板 | — | 官方推荐路线模板 |

---

## 2. 用户故事

### US-05-01: 朝圣者创建行程

**作为** 朝圣者，**我希望** 能够创建一个行程草稿并添加想去的圣地，**以便** 规划我的朝圣旅途。

**验收标准:**
- 可填写标题、出行日期、人数、联系人、备注
- 可从圣地列表中添加圣地到行程，指定访问顺序和日期
- 创建后状态为 DRAFT，可随时编辑
- 行程列表按状态分 Tab 展示

### US-05-02: 朝圣者提交行程

**作为** 朝圣者，**我希望** 规划完成后提交行程给平台审核，**以便** 获得官方确认和服务保障。

**验收标准:**
- PLANNING 状态下可点击"提交审核"
- 提交前校验: 至少选择1个圣地、填写联系人信息、选择日期
- 提交后状态变为 SUBMITTED，不可再编辑
- 用户可在 SUBMITTED 状态下取消行程

### US-05-03: 管理员确认行程

**作为** 管理员，**我希望** 审核用户提交的行程并确认可行性，**以便** 保障服务质量。

**验收标准:**
- Admin 后台显示所有 SUBMITTED 行程
- 可点击"确认"将状态转为 CONFIRMED
- 确认后用户收到通知，可进入支付流程
- 操作记录写入 TripStatusHistory

### US-05-04: 朝圣者查看行程进度

**作为** 朝圣者，**我希望** 随时查看行程的当前状态和历史变更，**以便** 了解进度。

**验收标准:**
- 行程详情页显示当前状态徽标(带颜色)
- 时间轴展示所有状态变更历史
- 显示当前状态下可执行的操作按钮
- 关联圣地列表按访问顺序排列

### US-05-05: 朝圣者取消/退款行程

**作为** 朝圣者，**我希望** 在特定阶段取消行程或申请退款，**以便** 应对计划变更。

**验收标准:**
- SUBMITTED / CONFIRMED 状态可直接取消
- PAID / CONFIRMED 状态可申请退款(进入 REFUNDING)
- 取消/退款需填写原因
- 已取消的行程可重新打开(reopen → DRAFT)

---

## 3. 业务流程

### 3.1 行程状态机流程图

```
                              ┌─────────────────────────────────────┐
                              │          行程12状态生命周期           │
                              └─────────────────────────────────────┘

                                    reopen
                    ┌──────────────────────────────────────────┐
                    │                                          │
                    ▼          start_planning                  │
              ┌──────────┐ ─────────────────► ┌──────────┐    │
              │  DRAFT   │                    │ PLANNING │    │
              │  草稿    │ ◄───────────────── │  规划中   │    │
              └──────────┘    save_draft       └────┬─────┘    │
                                                   │          │
                                              submit│          │
                                                   ▼          │
                                             ┌──────────┐     │
                                  ┌──────────│SUBMITTED │     │
                                  │          │  已提交   │     │
                                  │          └────┬─────┘     │
                                  │               │           │
                          user_cancel        admin_confirm    │
                                  │               │           │
                                  ▼               ▼           │
                            ┌──────────┐   ┌──────────┐      │
                            │CANCELLED │   │CONFIRMED │      │
                            │  已取消   │   │  已确认   │      │
                            └──────────┘   └──┬───┬───┘      │
                                  ▲           │   │           │
                                  │   payment_│   │request_   │
                          user_cancel success  │   │refund     │
                                  │           │   │           │
                                  │           ▼   ▼           │
                                  │     ┌────────┐ ┌─────────┐│
                                  │     │  PAID  │ │REFUNDING││
                                  │     │ 已支付  │ │  退款中  ││
                                  │     └───┬──┬─┘ └──┬──┬───┘│
                                  │         │  │      │  │    │
                                  │ start_  │  │refund│  │refund
                                  │ prepare │  │approved  │rejected
                                  │         │  │      │  │    │
                                  │         ▼  │      ▼  │    │
                                  │  ┌─────────┐ ┌────────┐   │
                                  │  │PREPARING│ │REFUNDED│   │
                                  │  │  准备中  │ │ 已退款  │   │
                                  │  └────┬────┘ └────────┘   │
                                  │       │                   │
                                  │  start_trip               │
                                  │       │                   │
                                  │       ▼                   │
                                  │  ┌───────────┐            │
                                  │  │IN_PROGRESS│            │
                                  │  │  朝圣中    │            │
                                  │  └─────┬─────┘            │
                                  │        │                  │
                                  │   complete_trip           │
                                  │        │                  │
                                  │        ▼                  │
                                  │  ┌──────────┐            │
                                  │  │COMPLETED │◄───┐       │
                                  │  │  已完成   │    │       │
                                  │  └─────┬────┘    │       │
                                  │        │    finish_review │
                                  │   start_review   │       │
                                  │        │         │       │
                                  │        ▼         │       │
                                  │  ┌──────────┐    │       │
                                  │  │REVIEWING │────┘       │
                                  │  │  评价中   │            │
                                  │  └──────────┘            │
                                  │                          │
                                  └──────────────────────────┘
```

### 3.2 状态转换规则表

| # | 事件 (event) | 起始状态 (from) | 目标状态 (to) | 触发方 | 前置条件 | 说明 |
|---|-------------|----------------|--------------|--------|----------|------|
| 1 | `start_planning` | DRAFT | PLANNING | 用户 | 行程已有标题 | 开始规划，可添加圣地 |
| 2 | `submit` | PLANNING | SUBMITTED | 用户 | 至少1个圣地、联系人信息、日期 | 提交平台审核 |
| 3 | `save_draft` | PLANNING | DRAFT | 用户 | 无 | 退回草稿继续编辑 |
| 4 | `admin_confirm` | SUBMITTED | CONFIRMED | 管理员 | 管理员审核通过 | 确认行程可行性 |
| 5 | `user_cancel` | SUBMITTED | CANCELLED | 用户 | 无 | 提交后反悔取消 |
| 6 | `user_cancel` | CONFIRMED | CANCELLED | 用户 | 无 | 确认后未支付取消 |
| 7 | `payment_success` | CONFIRMED | PAID | 系统 | 关联订单支付成功 | 由订单模块回调触发 |
| 8 | `start_prepare` | PAID | PREPARING | 管理员/系统 | 距出发日<7天 | 开始准备出行物料 |
| 9 | `start_trip` | PREPARING | IN_PROGRESS | 管理员/系统 | 到达出发日期 | 朝圣正式开始 |
| 10 | `complete_trip` | IN_PROGRESS | COMPLETED | 管理员/系统 | 行程日期结束 | 朝圣完成 |
| 11 | `start_review` | COMPLETED | REVIEWING | 用户 | 无 | 用户开始撰写评价 |
| 12 | `finish_review` | REVIEWING | COMPLETED | 用户/系统 | 评价已提交或超时 | 评价完成，回归已完成 |
| 13 | `request_refund` | PAID | REFUNDING | 用户 | 填写退款原因 | 已付款申请退款 |
| 14 | `request_refund` | CONFIRMED | REFUNDING | 用户 | 填写退款原因 | 已确认申请退款 |
| 15 | `refund_approved` | REFUNDING | REFUNDED | 管理员 | 审核退款申请 | 退款通过 |
| 16 | `refund_rejected` | REFUNDING | PAID | 管理员 | 说明拒绝原因 | 退款被拒，恢复已支付 |
| 17 | `reopen` | CANCELLED | DRAFT | 用户 | 无 | 重新打开已取消行程 |

### 3.3 状态含义说明

| 状态 | 中文 | 颜色 | 用户可见含义 | 可执行操作 |
|------|------|------|-------------|-----------|
| DRAFT | 草稿 | #9E9E9E | 行程刚创建，尚未开始规划 | 编辑、开始规划、删除 |
| PLANNING | 规划中 | #2196F3 | 正在添加圣地和安排细节 | 编辑、添加/移除圣地、提交、退回草稿 |
| SUBMITTED | 已提交 | #FF9800 | 等待平台审核中 | 取消 |
| CONFIRMED | 已确认 | #4CAF50 | 平台已确认，请尽快支付 | 支付、取消、申请退款 |
| PAID | 已支付 | #8BC34A | 已付款，等待出行准备 | 申请退款 |
| PREPARING | 准备中 | #00BCD4 | 平台正在准备出行物料 | 查看准备进度 |
| IN_PROGRESS | 朝圣中 | #3F51B5 | 正在朝圣旅途中 | 写日志、查看路线 |
| COMPLETED | 已完成 | #009688 | 朝圣已完成 | 写评价、写日志 |
| REVIEWING | 评价中 | #E91E63 | 正在撰写评价 | 提交评价 |
| CANCELLED | 已取消 | #F44336 | 行程已取消 | 重新打开 |
| REFUNDING | 退款中 | #FF5722 | 退款申请处理中 | 等待 |
| REFUNDED | 已退款 | #795548 | 退款已到账 | 无 |

---

## 4. 功能清单

| 功能ID | 功能名称 | 优先级 | 版本 | 端 | 说明 |
|--------|---------|--------|------|-----|------|
| F05-01 | 创建行程 | P0 | v1 | Web/App/Mini | 填写基本信息创建草稿 |
| F05-02 | 行程列表 | P0 | v1 | Web/App/Mini/Admin | 分页+状态筛选+搜索 |
| F05-03 | 行程详情 | P0 | v1 | Web/App/Mini/Admin | 状态徽标+时间轴+圣地列表 |
| F05-04 | 更新行程 | P0 | v1 | Web/App/Mini | 仅 DRAFT/PLANNING 状态可编辑 |
| F05-05 | 状态转换 | P0 | v1 | Web/App/Mini/Admin | 15种转换，状态机校验 |
| F05-06 | 添加圣地 | P0 | v1 | Web/App/Mini | 关联圣地并设置顺序和访问日期 |
| F05-07 | 移除圣地 | P0 | v1 | Web/App/Mini | 从行程中移除圣地 |
| F05-08 | 状态元数据 | P0 | v1 | 全端 | 返回所有状态的标签、颜色、可用转换 |
| F05-09 | 创建向导 | P1 | v2 | Web/App | 分步创建: 选圣地→选日期→填信息→确认 |
| F05-10 | 导游分配 | P1 | v2 | Admin/App | 为行程匹配和指派导游 |
| F05-11 | 行程单导出 | P2 | v2 | Web/App | 导出 PDF 行程单 |
| F05-12 | 行程模板 | P2 | v2 | Web/App/Mini | 官方推荐路线一键创建 |
| F05-13 | 行程地图 | P1 | v2 | Web/App | 圣地路线在地图上展示 |

---

## 5. 数据模型

### 5.1 实体关系

```
User 1──────* Trip 1──────* TripSite *──────1 HolySite
                  │
                  1──────* TripStatusHistory
                  │
                  1──────* Order
                  │
                  1──────* JournalEntry
```

### 5.2 字段表

**Trip (行程)**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| userId | String | 是 | — | 关联用户 |
| title | String | 是 | — | 行程标题 |
| startDate | DateTime | 否 | — | 出发日期 |
| endDate | DateTime | 否 | — | 返程日期 |
| status | TripStatus | 是 | DRAFT | 当前状态(12枚举) |
| totalBudget | Int | 否 | — | 预算总额(分) |
| persons | Int | 是 | 1 | 出行人数 |
| contactName | String | 否 | — | 联系人姓名 |
| contactPhone | String | 否 | — | 联系人电话 |
| note | String(Text) | 否 | — | 备注 |
| createdAt | DateTime | 是 | now() | 创建时间 |
| updatedAt | DateTime | 是 | auto | 更新时间 |

**TripSite (行程圣地)**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| tripId | String | 是 | — | 关联行程 |
| siteId | String | 是 | — | 关联圣地(HolySite) |
| order | Int | 是 | — | 访问顺序(从1开始) |
| visitDate | DateTime | 否 | — | 计划访问日期 |
| notes | String(Text) | 否 | — | 圣地备注 |

**TripStatusHistory (状态变更记录)**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| tripId | String | 是 | — | 关联行程 |
| fromStatus | TripStatus | 是 | — | 变更前状态 |
| toStatus | TripStatus | 是 | — | 变更后状态 |
| event | String | 是 | — | 触发事件名称 |
| operator | String | 否 | — | 操作者(userId / "system") |
| reason | String | 否 | — | 原因(取消/退款时必填) |
| createdAt | DateTime | 是 | now() | 变更时间 |

---

## 6. API 接口

| # | 方法 | 路径 | 认证 | 说明 | 请求体/参数 | 响应 |
|---|------|------|------|------|------------|------|
| 1 | POST | /api/trips | JWT | 创建行程 | `{userId, title, startDate?, endDate?, totalBudget?, persons?, contactName?, contactPhone?, note?}` | Trip 对象 |
| 2 | GET | /api/trips | Public | 行程列表 | Query: `userId?, status?, page?, limit?` | `{data: Trip[], total, page, limit}` |
| 3 | GET | /api/trips/status-meta | Public | 状态元数据 | 无 | `[{status, label:{cn,en}, color, transitions:[{status,event}]}]` |
| 4 | GET | /api/trips/:id | Public | 行程详情 | Path: id | Trip + sites + statusHistory |
| 5 | PATCH | /api/trips/:id | JWT | 更新行程 | `{title?, startDate?, endDate?, totalBudget?, persons?, contactName?, contactPhone?, note?}` | Trip 对象 |
| 6 | POST | /api/trips/:id/transition | JWT | 状态转换 | `{action: string, operator?: string, reason?: string}` | Trip + sites + statusHistory |
| 7 | POST | /api/trips/:id/sites | JWT | 添加圣地 | `{siteId, order, visitDate?, notes?}` | TripSite 对象 |
| 8 | DELETE | /api/trips/:id/sites/:siteId | JWT | 移除圣地 | Path: id, siteId | `{message}` |

**transition action 枚举值:** `start_planning`, `submit`, `save_draft`, `admin_confirm`, `user_cancel`, `payment_success`, `start_prepare`, `start_trip`, `complete_trip`, `start_review`, `finish_review`, `request_refund`, `refund_approved`, `refund_rejected`, `reopen`

**更新限制:** PATCH /trips/:id 仅在 DRAFT 或 PLANNING 状态下可用，其他状态返回 400。

**状态机校验:** POST /trips/:id/transition 在数据库事务中执行:
1. 查询当前 Trip 状态
2. 校验 `(currentStatus, action)` 是否在合法转换表中
3. 写入 TripStatusHistory 审计记录
4. 更新 Trip.status
5. 返回更新后的 Trip (含 sites 和最近10条 statusHistory)

---

## 7. 多端页面规格

### 7.1 Web 端

#### 页面: /trips — 行程列表

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 页面标题 + "创建行程"按钮; 中部: 状态 Tab 栏(全部/规划中/已确认/朝圣中/已完成); 下方: 行程卡片网格 |
| 卡片字段 | 标题、状态徽标(带颜色)、日期范围、人数、圣地数量、预算 |
| 交互 | Tab 切换筛选状态; 点击卡片进入详情; 无限滚动加载; 空状态提示"开始你的朝圣之旅" |
| 状态 | Loading骨架屏; 空状态; 错误重试 |

#### 页面: /trips/[id] — 行程详情

| 项目 | 说明 |
|------|------|
| 布局 | 左侧(2/3): 行程信息+圣地列表; 右侧(1/3): 状态面板+操作按钮 |
| 行程信息 | 标题、日期、人数、联系人、备注、预算(格式化为元) |
| 圣地列表 | 编号+圣地名称+信仰徽标+访问日期+备注; PLANNING状态下可添加/移除 |
| 状态面板 | 大字状态徽标 + 状态说明文字 + 可用操作按钮(根据状态动态渲染) |
| 时间轴 | 纵向时间轴展示 statusHistory, 每条: 时间+事件+操作者+原因 |
| 操作按钮 | DRAFT: "开始规划"; PLANNING: "提交审核"/"退回草稿"; SUBMITTED: "取消"; CONFIRMED: "去支付"/"取消"/"申请退款"; COMPLETED: "写评价" |
| 状态 | Loading; 404行程不存在; 权限校验(仅本人或Admin) |

#### 页面: /trips/create (v2)

| 项目 | 说明 |
|------|------|
| 布局 | 分步向导: Step1 选择圣地(地图/列表) → Step2 选择日期和排序 → Step3 填写信息 → Step4 确认预览 |
| 交互 | 步骤间可前进/后退; 地图上点击圣地添加; 拖拽调整顺序; 最终确认创建 |

### 7.2 App 端 (Expo React Native)

#### 页面: /trips — 行程列表

| 项目 | 说明 |
|------|------|
| 布局 | 顶部导航栏 + 状态 Tab (横向滚动); 列表: FlatList 行程卡片; 底部浮动"+"按钮 |
| 卡片字段 | 标题、状态徽标(圆角pill)、日期、人数图标+数字 |
| 交互 | 下拉刷新; 上拉加载更多; 点击进入详情; 长按快捷操作(取消/重新打开) |
| 手势 | 左滑显示取消/删除按钮(仅适用状态) |

#### 页面: /trips/[id] — 行程详情

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 状态大横幅(颜色背景); 中部: ScrollView 信息区; 底部: 固定操作按钮栏 |
| 信息区 | 基本信息卡片 → 圣地列表(可点击跳转圣地详情) → 时间轴(折叠式) |
| 操作栏 | 根据状态显示1-2个主操作按钮(如"提交审核"、"去支付") |
| 动画 | 状态变更时横幅颜色渐变动画; 时间轴条目出现动画 |

### 7.3 小程序端 (Taro)

#### 页面: /trips — 行程列表

| 项目 | 说明 |
|------|------|
| 布局 | 自定义导航栏; 状态 Tab (Taro Tabs 组件); 列表: 行程卡片 |
| 交互 | Tab切换; 点击跳转 /trip-detail?id=xxx; 下拉刷新 onPullDownRefresh |
| 分享 | 支持分享行程到微信聊天(仅公开信息) |

#### 页面: /trip-detail — 行程详情

| 项目 | 说明 |
|------|------|
| 布局 | 状态横幅 → 基本信息 → 圣地列表 → 时间轴 → 操作按钮 |
| 交互 | 操作按钮触发 wx.showModal 确认; 支付按钮跳转支付模块 |
| 限制 | 小程序内不支持创建向导(v2), 简化为表单创建 |

### 7.4 Admin 后台

#### 页面: TripsPage — 行程管理

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 筛选栏(状态下拉、用户搜索、日期范围); 中部: Ant Design Table |
| 表格列 | ID(前8位)、用户昵称、标题、状态(Tag带颜色)、圣地数、人数、预算、创建时间、操作 |
| 操作 | 查看详情(Drawer); 状态转换(根据当前状态显示可用按钮): "确认"(SUBMITTED→CONFIRMED)、"开始准备"(PAID→PREPARING)、"开始行程"(PREPARING→IN_PROGRESS)、"完成行程"(IN_PROGRESS→COMPLETED)、"批准退款"/"拒绝退款"(REFUNDING) |
| 详情Drawer | 行程完整信息 + 圣地列表 + 完整状态历史时间轴 + 关联订单信息 |
| 批量操作 | v2: 批量确认、批量分配导游 |

---

## 8. 埋点需求

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `trip_create` | 用户创建行程 | tripId, userId, siteCount | 行程创建量 |
| `trip_transition` | 任何状态转换 | tripId, fromStatus, toStatus, event, operator | 状态流转分析 |
| `trip_site_add` | 添加圣地到行程 | tripId, siteId, religionSlug | 圣地热度分析 |
| `trip_site_remove` | 移除行程圣地 | tripId, siteId | 弃选分析 |
| `trip_submit` | 行程提交审核 | tripId, siteCount, persons, budgetRange | 提交转化 |
| `trip_cancel` | 行程取消 | tripId, status, reason | 取消原因分析 |
| `trip_refund_request` | 申请退款 | tripId, orderId, reason | 退款分析 |
| `trip_list_view` | 查看行程列表 | userId, statusFilter | 页面访问 |
| `trip_detail_view` | 查看行程详情 | tripId, currentStatus | 详情页访问 |
| `trip_create_wizard_step` | v2向导步骤 | step, action(next/prev/skip) | 向导漏斗分析 |
