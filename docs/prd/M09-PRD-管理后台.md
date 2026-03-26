# M09 管理后台 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: Phase 1 已实施 + v2 规划中

---

## 1. 需求背景与目标

### 1.1 背景

管理后台是祖庭旅行平台的运营神经中枢，供运营团队和管理员使用。后台需覆盖全部业务数据的查看、编辑、审核功能，并通过 Dashboard 提供关键运营指标的可视化监控。

当前平台已有 12 大信仰、60 圣地、27 祖庭、28 祖师、39 祖训、30 印共 196 条基础数据，以及行程、订单、日志等动态业务数据。管理后台需要为运营人员提供高效的数据管理工具。

### 1.2 目标

| 目标 | 衡量指标 |
|------|----------|
| 运营效率提升 | 单条数据 CRUD 操作 < 30秒 |
| 数据可视化 | Dashboard 加载 < 2秒，KPI 实时刷新 |
| 权限安全 | 仅 ADMIN 角色可访问，JWT + RequireAuth 守卫 |
| 多模块覆盖 | 10 个业务模块全覆盖 + AI 配置 |

### 1.3 技术选型

- **框架**: Vite + React 19
- **UI库**: Ant Design 5 (暗色主题 ConfigProvider)
- **图表**: Recharts (BarChart, PieChart, Legend)
- **路由**: React Router v6
- **HTTP**: Axios / fetch 封装 (src/lib/api.ts)
- **端口**: localhost:3003

---

## 2. 用户故事

### 2.1 管理员登录

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-A01 | 作为管理员，我想通过账号密码登录后台，以确保只有授权人员能访问 | P0 |
| US-A02 | 作为管理员，我想在登录状态过期时自动跳转到登录页，以保障系统安全 | P0 |
| US-A03 | 作为管理员，我想点击头像下拉菜单中的「退出」按钮注销登录 | P0 |

### 2.2 仪表盘

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-A04 | 作为管理员，我想在 Dashboard 看到 6 个 KPI 卡片，快速了解平台数据规模 | P0 |
| US-A05 | 作为管理员，我想看到数据总览柱状图，直观比较各类数据量 | P0 |
| US-A06 | 作为管理员，我想看到三十印系列分布饼图，了解五系分布情况 | P0 |
| US-A07 | 作为管理员，我想看到各信仰圣地与祖庭分布横向柱状图 | P0 |
| US-A08 | 作为管理员，我想看到最近活动动态列表，掌握平台实时事件 | P1 |

### 2.3 数据管理

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-A09 | 作为管理员，我想在各 CRUD 表格中搜索、筛选、分页浏览数据 | P0 |
| US-A10 | 作为管理员，我想通过弹窗表单新增/编辑/删除数据记录 | P0 |
| US-A11 | 作为管理员，我想在行程管理中一键执行状态转换操作 | P0 |
| US-A12 | 作为管理员，我想在订单管理中处理退款操作 | P0 |
| US-A13 | 作为管理员，我想在日志管理中切换公开/私密状态，进行内容审核 | P1 |
| US-A14 | 作为管理员，我想配置小鸿 AI 的系统提示词和回复参数 | P1 |

---

## 3. 业务流程

### 3.1 管理员登录流程

```
打开 /login → 输入邮箱 + 密码
    → POST /api/auth/login (role=ADMIN)
    → 返回 JWT accessToken + refreshToken
    → 存储 localStorage
    → 跳转 /dashboard
    → RequireAuth 守卫检查 token + role
    → token过期 → 自动 refresh 或跳转 /login
```

### 3.2 CRUD 通用流程

```
进入列表页 → GET /api/{module} 加载数据
    → 表格展示 (Ant Design Table)
    → 搜索框输入关键词 → 前端过滤 / API query
    → 筛选宗教下拉 → 按 religionId 过滤
    → 点击「新增」 → Modal 弹出 Form
        → 填写字段 → POST /api/{module} → 刷新列表
    → 点击行「编辑」 → Modal 弹出预填 Form
        → 修改字段 → PATCH /api/{module}/:id → 刷新列表
    → 点击行「删除」 → Popconfirm 确认
        → DELETE /api/{module}/:id → 刷新列表
```

### 3.3 行程管理审核流程

```
行程列表 → Tabs 按状态过滤 (全部/草稿/待审核/已确认/进行中/已完成/已取消)
    → 点击「查看」 → Drawer 展示详情 (Descriptions组件)
        → 行程基本信息 + 圣地列表 + 状态历史
    → 审核操作:
        SUBMITTED → 点击「确认」 → POST /:id/transition {event:'admin_confirm'}
        PAID → 点击「准备」 → POST /:id/transition {event:'start_preparing'}
        PREPARING → 点击「开始」 → POST /:id/transition {event:'start_trip'}
        任意状态 → 点击「取消」 → POST /:id/transition {event:'cancel'} + reason
```

### 3.4 订单管理退款流程

```
订单列表 → 筛选 PAID 状态订单
    → 点击「退款」 → Modal 确认退款金额 + 原因
    → POST /api/orders/:id/refund
    → 订单状态 PAID → REFUNDING → REFUNDED
    → 关联行程自动 transition 到 REFUNDING → REFUNDED
```

---

## 4. 功能清单

### 4.1 Phase 1 — 已实施 (12 页面)

#### 4.1.1 LoginPage (登录页)

| 功能点 | 说明 |
|--------|------|
| 登录表单 | 邮箱 + 密码，Ant Design Form 校验 |
| 记住登录 | Checkbox，token 存 localStorage |
| 错误提示 | 账号密码错误 → message.error |
| 权限检查 | 登录后验证 role === ADMIN，非管理员拒绝 |
| 页面样式 | 居中卡片，深色背景，金色 Logo + 标题 |

#### 4.1.2 Dashboard (仪表盘)

| 组件 | 说明 |
|------|------|
| KPI 卡片 x6 | 信仰(#D4A855) / 圣地(#52C41A) / 祖庭(#1890FF) / 祖师(#B37FEB) / 祖训(#E87040) / 印(#52C41A)，每卡含图标 + 数字 + 标题 |
| 数据总览柱状图 | Recharts BarChart，6 根彩色柱子，深色 tooltip |
| 三十印系列饼图 | Recharts PieChart (Donut)，innerRadius=60，五系颜色编码 (CHUYIN/ZHONGYIN/YINGUOYIN/CHENGDAOYIN/GUIYUANYIN) |
| 信仰分布横向柱状图 | Recharts BarChart layout="vertical"，双系列 (圣地金色 + 祖庭蓝色)，12 行 |
| 最近动态 | Ant Design List，6 条 mock 动态，每条含时间 Tag + 描述文本 |
| 额外统计 | 底部 Card 内 Row: 祖训计数 + 印计数 |

**数据获取**: getDashboardStats() → 并行请求 6 个 API 端点，聚合后渲染。

#### 4.1.3 ReligionsPage (宗教管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 名称 | name / nameZh | 粗体显示 |
| 英文名 | nameEn | |
| Slug | slug | 唯一标识 |
| 符号 | symbol | 20px 大字体展示 |
| 颜色 | color | Tag 组件，背景色即为该宗教主题色 |
| 操作 | — | 查看按钮 → Modal 展示 Descriptions 详情 |

**当前为只读表格**，v2 增加编辑/新增功能。

#### 4.1.4 HolySitesPage (圣地管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 名称 | name | 粗体 |
| 英文名 | nameEn | |
| 国家 | country | |
| 宗教 | religion.name | Tag 显示，颜色为宗教主题色 |
| 坐标 | latitude, longitude | 格式: lat, lng |
| UTC偏移 | utcOffset | |
| 操作 | — | 查看详情 Drawer (含描述全文、图片、音效) |

**筛选**: 宗教下拉 Select 过滤。**搜索**: 按名称/国家搜索。

#### 4.1.5 TemplesPage (祖庭管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 名称 | name | 粗体 |
| 英文名 | nameEn | |
| 国家 | country | |
| 创建年代 | foundingDate | |
| 宗教 | religion.name | Tag |
| 操作 | — | 查看详情 (含描述、坐标、图片) |

#### 4.1.6 PatriarchsPage (祖师管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 姓名 | name | 粗体 |
| 英文名 | nameEn | |
| 生卒年代 | dates | |
| 头衔 | title | |
| 宗教 | religion.name | Tag |
| 操作 | — | 查看详情 Drawer (含传记全文、核心教义) |

#### 4.1.7 TeachingsPage (祖训管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 名称 | name | 粗体 |
| 宗教 | religion.name | Tag |
| 来源 | sourceText | 截断显示 |
| 操作 | — | 查看详情 (含原文全文、翻译) |

#### 4.1.8 SealsPage (印管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 序号 | id | 1-30 |
| 名称 | name | 粗体 |
| 系列 | series | Tag，五系各有颜色 (青/蓝/紫/红/金) |
| 操作 | — | 查看详情 (含偈语、精要、修行法、大愿) |

#### 4.1.9 TripsPage (行程管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 行程名称 | title | 粗体 |
| 目的地 | destination | 关联圣地名称 |
| 出发日期 | startDate | dayjs 格式化 |
| 人数 | persons | |
| 预算 | totalBudget | 分→元显示 |
| 状态 | status | 彩色 Tag (STATUS_MAP: DRAFT灰/PENDING蓝/CONFIRMED蓝/IN_PROGRESS橙/COMPLETED绿/CANCELLED红) |
| 操作 | — | 查看 Drawer + 状态转换按钮 |

**特殊交互**:
- Tabs 按状态过滤: 全部 / DRAFT / PENDING / CONFIRMED / IN_PROGRESS / COMPLETED / CANCELLED
- Drawer 详情: Descriptions 组件展示行程信息 + 圣地列表 + 状态历史时间线
- 状态操作按钮: 根据当前状态动态显示 (确认/准备/开始/取消)
- handleStatusChange: POST /api/trips/:id/transition → message.success/error

#### 4.1.10 OrdersPage (订单管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 订单号 | orderNo | OD + 时间戳 |
| 关联行程 | trip.title | |
| 用户 | user.nickname | |
| 总金额 | totalAmount | 分→元，金色字体 |
| 已付金额 | paidAmount | |
| 支付方式 | paymentMethod | Tag: wechat绿/alipay蓝/stripe紫 |
| 状态 | status | Tag: PENDING黄/PAID绿/CANCELLED灰/REFUNDING橙/REFUNDED红 |
| 支付时间 | paidAt | dayjs |
| 操作 | — | 查看详情 + 退款按钮 (仅 PAID 状态显示) |

**退款流程**: 点击退款 → Modal 确认 → POST /api/orders/:id/refund → 刷新列表

#### 4.1.11 JournalsPage (日志管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 标题 | title | 粗体 |
| 用户 | user.nickname | |
| 关联行程 | trip.title | |
| 心情 | mood | Tag: 感悟紫/喜悦金/平静蓝/震撼红 |
| 公开状态 | isPublic | Switch 切换 |
| 图片数 | images.length | |
| 创建时间 | createdAt | |
| 操作 | — | 查看全文 + 切换公开/私密 + 删除 (审核不通过) |

**审核工作流**:
- 查看日志全文内容 + 图片预览
- isPublic Toggle: PATCH /api/journals/:id {isPublic: true/false}
- 删除: 违规内容 → Popconfirm → DELETE /api/journals/:id

#### 4.1.12 AIConfigPage (AI 配置)

| 功能 | 说明 |
|------|------|
| 系统提示词 | TextArea，小鸿 AI 的 system prompt |
| 温度参数 | Slider 0-2，默认 0.7 |
| 最大 Token | InputNumber，默认 2048 |
| 推荐问题列表 | 可编辑列表，GET /api/xiaohong/suggestions 的返回值 |
| 敏感词过滤 | Tag 列表，可添加/删除 |
| 保存 | 提交配置 → POST /api/admin/ai-config |

### 4.2 管理后台通用布局

```
┌───────────────────────────────────────────────────────────┐
│  Header: Logo + 标题「祖庭旅行管理后台」 + 用户头像 + 退出  │
├──────────┬────────────────────────────────────────────────┤
│ Sidebar  │  Content Area                                  │
│          │                                                │
│ Dashboard│  根据路由渲染对应页面                              │
│ 宗教管理 │                                                │
│ 圣地管理 │                                                │
│ 祖庭管理 │                                                │
│ 祖师管理 │                                                │
│ 祖训管理 │                                                │
│ 印管理   │                                                │
│ ──────── │                                                │
│ 行程管理 │                                                │
│ 订单管理 │                                                │
│ 日志管理 │                                                │
│ ──────── │                                                │
│ AI配置   │                                                │
├──────────┴────────────────────────────────────────────────┤
│  Footer: (c) 2026 祖庭旅行平台                             │
└───────────────────────────────────────────────────────────┘
```

- Sidebar: Ant Design Menu，`selectedKeys` 绑定路由，`theme="dark"`，宽度 240px
- Header: 高度 64px，深色背景 #141414，右侧 Avatar + Dropdown (个人信息/退出)
- Content: padding 24px，min-height 计算充满视口
- 暗色主题: ConfigProvider `theme.algorithm = darkAlgorithm`，token 覆盖 colorPrimary=#D4A855

### 4.3 Phase 2 — v2 规划页面

#### 4.3.1 UsersPage (用户管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 昵称 | nickname | |
| 手机 | phone | 脱敏显示 |
| 邮箱 | email | 脱敏显示 |
| 角色 | role | Tag: PILGRIM/GUIDE/AMBASSADOR/ADMIN |
| 注册时间 | createdAt | |
| 最后登录 | lastLoginAt | |
| 状态 | isActive | Switch |
| 操作 | — | 查看/编辑角色/禁用/删除 |

角色变更需要二次确认 Modal。

#### 4.3.2 GuidesPage (导游管理)

| 列 | 字段 | 说明 |
|----|------|------|
| 姓名 | user.nickname | |
| 擅长信仰 | specialties | 多个 Tag |
| 评分 | avgRating | 星级 Rate 组件 |
| 带团数 | tripCount | |
| 认证状态 | verified | Badge |
| 操作 | — | 查看资质/审核认证/禁用 |

#### 4.3.3 CouponsPage (优惠券管理)

- 创建优惠券: 名称/类型(满减/折扣/免邮)/面值/有效期/使用条件/总数量
- 列表: 名称/类型/面值/已使用/剩余/有效期/状态
- 操作: 编辑/停用/查看使用记录

#### 4.3.4 ModerationPage (内容审核)

- 审核队列: 日志/评论/社区帖子，按举报数排序
- 审核操作: 通过/删除/警告用户/封禁用户
- 敏感内容标记: 自动检测涉宗教敏感内容，人工复核

#### 4.3.5 NotificationsPage (通知管理)

- 系统公告: 创建/编辑/发送全局通知
- 推送管理: 查看推送历史/送达率/打开率
- 模板管理: 邮件/短信/微信模板消息配置

#### 4.3.6 SettingsPage (系统设置)

- 网站基本信息: 名称/Logo/描述
- 支付配置: 微信支付/支付宝/Stripe 商户信息
- 短信配置: 阿里云短信/Twilio API Key
- 邮件配置: SMTP/阿里云邮件服务
- 安全设置: 密码策略/登录限制/IP 白名单

---

## 5. 数据模型

管理后台不引入新表，直接使用现有 14 个 Prisma 模型的数据。

Dashboard 聚合查询:

```typescript
// getDashboardStats 并行请求
const [religions, holySites, temples, patriarchs, teachings, seals] =
  await Promise.all([
    fetch('/api/religions'),
    fetch('/api/holy-sites'),
    fetch('/api/temples'),
    fetch('/api/patriarchs'),
    fetch('/api/teachings'),
    fetch('/api/seals'),
  ]);
```

v2 新增表 (供后台管理):
- AdminAuditLog: 管理员操作审计日志 (who, what, when, detail)
- SystemConfig: 键值对配置存储 (key, value, group, description)

---

## 6. API 接口

### 6.1 现有接口 (管理后台调用)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 管理员登录 |
| GET | /api/religions | 宗教列表 |
| GET | /api/holy-sites | 圣地列表 |
| GET | /api/temples | 祖庭列表 |
| GET | /api/patriarchs | 祖师列表 |
| GET | /api/teachings | 祖训列表 |
| GET | /api/seals | 印列表 |
| GET | /api/trips | 行程列表 |
| POST | /api/trips/:id/transition | 行程状态转换 |
| GET | /api/orders | 订单列表 |
| POST | /api/orders/:id/refund | 订单退款 |
| GET | /api/journals | 日志列表 |
| PATCH | /api/journals/:id | 日志编辑 (公开/私密切换) |
| DELETE | /api/journals/:id | 日志删除 |

### 6.2 v2 新增管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/religions | 新增宗教 |
| PATCH | /api/admin/religions/:id | 编辑宗教 |
| DELETE | /api/admin/religions/:id | 删除宗教 |
| POST | /api/admin/holy-sites | 新增圣地 |
| PATCH | /api/admin/holy-sites/:id | 编辑圣地 |
| DELETE | /api/admin/holy-sites/:id | 删除圣地 |
| GET | /api/admin/users | 用户列表 (含分页/筛选) |
| PATCH | /api/admin/users/:id/role | 修改用户角色 |
| PATCH | /api/admin/users/:id/status | 启用/禁用用户 |
| POST | /api/admin/ai-config | 保存 AI 配置 |
| GET | /api/admin/ai-config | 获取 AI 配置 |
| GET | /api/admin/dashboard/stats | 聚合统计 (替代并行请求) |
| GET | /api/admin/audit-log | 操作审计日志 |
| POST | /api/admin/notifications | 发送系统通知 |

---

## 7. 多端页面规格

管理后台为**纯 Web 端**，仅通过 PC 浏览器访问 (localhost:3003)。

### 7.1 响应式断点

| 断点 | 布局 |
|------|------|
| >= 1200px | Sidebar 展开 + Content 区域 |
| 768-1199px | Sidebar 折叠为图标 + Content 全宽 |
| < 768px | 不做适配 (管理后台限 PC 使用) |

### 7.2 页面清单与路由

| 路由 | 页面组件 | 守卫 |
|------|----------|------|
| /login | LoginPage | 无 (未登录才可访问) |
| / | Dashboard | RequireAuth(ADMIN) |
| /religions | ReligionsPage | RequireAuth(ADMIN) |
| /holy-sites | HolySitesPage | RequireAuth(ADMIN) |
| /temples | TemplesPage | RequireAuth(ADMIN) |
| /patriarchs | PatriarchsPage | RequireAuth(ADMIN) |
| /teachings | TeachingsPage | RequireAuth(ADMIN) |
| /seals | SealsPage | RequireAuth(ADMIN) |
| /trips | TripsPage | RequireAuth(ADMIN) |
| /orders | OrdersPage | RequireAuth(ADMIN) |
| /journals | JournalsPage | RequireAuth(ADMIN) |
| /ai-config | AIConfigPage | RequireAuth(ADMIN) |
| /users | UsersPage (v2) | RequireAuth(ADMIN) |
| /guides | GuidesPage (v2) | RequireAuth(ADMIN) |
| /coupons | CouponsPage (v2) | RequireAuth(ADMIN) |
| /moderation | ModerationPage (v2) | RequireAuth(ADMIN) |
| /notifications | NotificationsPage (v2) | RequireAuth(ADMIN) |
| /settings | SettingsPage (v2) | RequireAuth(ADMIN) |

### 7.3 暗色主题 Token

```typescript
// Ant Design ConfigProvider theme
{
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#D4A855',
    colorBgContainer: '#141414',
    colorBgLayout: '#0a0a0a',
    borderRadius: 8,
    colorText: '#e5e5e5',
    colorTextSecondary: '#999',
  }
}
```

---

## 8. 埋点需求

### 8.1 页面访问

| 事件 | 参数 | 说明 |
|------|------|------|
| admin_page_view | page_name, user_id | 每次页面切换 |
| admin_login | method, success | 登录行为 |
| admin_logout | user_id | 退出行为 |

### 8.2 操作行为

| 事件 | 参数 | 说明 |
|------|------|------|
| admin_crud_action | module, action(create/update/delete), record_id | CRUD 操作 |
| admin_trip_transition | trip_id, from_status, to_status, event | 行程状态转换 |
| admin_order_refund | order_id, amount, reason | 退款操作 |
| admin_journal_moderate | journal_id, action(publish/unpublish/delete) | 日志审核 |
| admin_ai_config_save | config_keys_changed[] | AI 配置保存 |
| admin_search | module, keyword, result_count | 搜索行为 |
| admin_filter | module, filter_type, filter_value | 筛选行为 |

### 8.3 性能指标

| 指标 | 采集方式 | 目标 |
|------|----------|------|
| Dashboard 加载时间 | Performance API | < 2s |
| 表格数据加载时间 | API 请求耗时 | < 1s |
| 弹窗表单提交耗时 | 点击提交到成功回调 | < 500ms |
| 页面切换耗时 | React Router 切换 | < 200ms |
