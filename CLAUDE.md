# 全球祖庭旅行平台 — Global Ancestral Temple Travel Platform

> Monorepo | 路径: E:\ZUTING\ | Phase 1 + P0/P1升级完成 (2026-03-25)

## 愿景
帮助100万人走祖庭，建立全球宗教文化和平使者网络。
全平台应用: Web + Mobile APP + 微信小程序 + 管理后台。

## 技术栈
- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: NestJS 11 + TypeScript + SWC + Prisma 6 + PostgreSQL 16 + Redis 7
- **Web**: Next.js 15 + React 19 + TailwindCSS v4 (21页面)
- **Admin**: Vite + React 19 + Ant Design 5 + Recharts (11页面)
- **Mobile**: React Native + Expo 52 + Expo Router (5 tabs + 详情页)
- **小程序**: Taro 4.x + React (14页面)
- **Shared**: @zuting/api-client, @zuting/shared-types, @zuting/config
- **Desktop**: Python 3 + tkinter (原有桌面助手，保留在 desktop/)

## 项目结构
```
E:\ZUTING\
├── apps/
│   ├── web/                     # Next.js 15 官网 (@zuting/web)
│   │   ├── src/app/             # 21个页面路由 (App Router)
│   │   ├── src/components/      # WorldMap, MobileNav 等
│   │   └── src/lib/             # API客户端 + i18n
│   ├── admin/                   # Vite管理后台 (@zuting/admin)
│   │   └── src/pages/           # 11个页面 (Dashboard, CRUD tables)
│   ├── mobile/                  # Expo React Native (@zuting/mobile)
│   │   ├── app/(tabs)/          # 5个Tab (首页/圣地/AI聊天/修行/我的)
│   │   └── app/                 # 详情页 (chat, trips, journals)
│   └── miniprogram/             # Taro 微信小程序 (@zuting/miniprogram)
│       └── src/pages/           # 14个页面
├── packages/
│   ├── shared-types/            # 共享TypeScript类型
│   ├── api-client/              # 类型安全API客户端
│   └── config/                  # 业务配置 (religions, seals, trips, design)
├── services/
│   └── api/                     # NestJS 后端 (@zuting/api)
│       ├── src/modules/         # 10个模块 (34个路由)
│       │   ├── religion/        # 12大信仰
│       │   ├── holy-site/       # 60圣地
│       │   ├── temple/          # 27祖庭
│       │   ├── patriarch/       # 28祖师
│       │   ├── teaching/        # 39祖训
│       │   ├── seal/            # 30印
│       │   ├── xiaohong/        # 小鸿AI聊天 (SSE流式)
│       │   ├── trip/            # 行程管理 (12状态机)
│       │   ├── order/           # 订单管理
│       │   └── journal/         # 朝圣日志
│       ├── src/common/          # TripStateMachine
│       ├── prisma/schema.prisma # 数据模型 (14个表)
│       └── prisma/seed.ts       # 种子数据 (196条记录)
├── desktop/                     # 原有Python桌面修行助手
├── docker/docker-compose.yml    # PostgreSQL:5435 + Redis:6380
├── turbo.json
├── pnpm-workspace.yaml
└── CLAUDE.md
```

## 快速启动
```bash
# 1. 启动数据库
pnpm docker:up

# 2. 推送Schema + 种子数据
pnpm db:push && pnpm db:seed

# 3. 启动各端
pnpm dev:api          # → http://localhost:3002/api + /docs (Swagger)
pnpm dev:web          # → http://localhost:3000
pnpm --filter @zuting/admin dev        # → http://localhost:3003
pnpm --filter @zuting/mobile dev       # Expo开发服务器
pnpm --filter @zuting/miniprogram dev  # Taro微信小程序
```

## API端点 (10个模块, 34个路由)
| 模块 | 端点 | 说明 |
|------|------|------|
| religions | GET /api/religions, GET /:slug | 12大信仰 |
| holy-sites | GET /api/holy-sites, GET /:id | 60圣地 |
| temples | GET /api/temples, GET /:id | 27祖庭 |
| patriarchs | GET /api/patriarchs, GET /:id | 28祖师 |
| teachings | GET /api/teachings, GET /:id | 39祖训 |
| seals | GET /api/seals, GET /:id | 30印 |
| xiaohong | POST /chat, GET /chat/stream, GET /suggestions | 小鸿AI聊天 (SSE) |
| trips | POST, GET, GET /:id, PATCH /:id, POST /:id/transition, POST /:id/sites, DELETE /:id/sites/:siteId, GET /status-meta | 行程管理 (12状态机) |
| orders | POST, GET, GET /:id, POST /:id/pay, POST /:id/cancel, POST /:id/refund | 订单管理 |
| journals | POST, GET, GET /:id, PATCH /:id, DELETE /:id | 朝圣日志 |

## Web 页面 (21页)
首页, 12信仰, 信仰详情, 圣地列表(地图/网格), 圣地详情, 祖庭, 祖庭详情, 祖师, 祖师详情, 祖训, 祖训详情, 三十印, 印详情, AI聊天, 地图, 行程列表, 行程详情, 日志, 个人中心, 404

## Admin 后台 (11页)
Dashboard(图表), 宗教管理, 圣地管理, 祖庭管理, 祖师管理, 祖训管理, 印管理, 行程管理, 订单管理, 日志管理, AI配置

## Trip 状态机 (12状态)
DRAFT → PLANNING → SUBMITTED → CONFIRMED → PAID → PREPARING → IN_PROGRESS → COMPLETED → REVIEWING
支持: CANCELLED, REFUNDING, REFUNDED

## 端口分配
| 服务 | 端口 |
|------|------|
| PostgreSQL | 5435 |
| Redis | 6380 |
| API | 3002 |
| Web | 3000 |
| Admin | 3003 |
| Expo | 8081 |

## 数据内容 (196条记录)
- **12大信仰**: 佛教/道教/基督教/伊斯兰教/印度教/犹太教/儒教/锡克教/神道教/藏传佛教/原住民灵性/巴哈伊教
- **60圣地**: 每信仰5个，含GPS坐标、UTC偏移、描述
- **27祖庭**: 各信仰重要祖庭
- **28祖师**: 各信仰创始人/重要人物
- **39祖训**: 原文+来源
- **30印**: 曹溪愿命三十印 (五系: 初印系→中印系→印果印→成道印→归源印)

## 设计主题
- 深色殿堂风: 背景 #0f172a → #020617, 金色点缀 #D4A855
- 每个宗教有独特颜色和符号
- 五系印各有系列色 (青/蓝/紫/红/金)
- 地图: Leaflet + CartoDB暗色瓦片
- 中英双语支持 (i18n)

## 注意事项
- NestJS使用SWC编译 (nest-cli.json配置builder:swc)，因为tsx不支持emitDecoratorMetadata
- **Prisma enum不能直接传给Swagger装饰器** — 用字符串数组代替，参数用string类型，调用时cast。否则会触发circular dependency错误
- Web用 `force-dynamic` 避免构建时需要API运行
- 桌面应用独立运行: `cd desktop && python zuting_app.py`
- **可选依赖(Sentry等)必须用运行时字符串拼接+new Function绕过打包器**，禁止静态import/require

---

## 代码铁律（违反即阻断）

> 移植自作业郎项目百科全书，适配ZUTING架构

### 类型安全
```
[R-01] 严禁 any 类型，必须定义 Interface/DTO
[R-02] 前端枚举值必须与 Prisma Schema 枚举完全一致
[R-03] 后端 DTO 必须使用 class-validator 装饰器校验
```

### 响应格式
```
[R-04] API使用NestJS标准响应格式 + Swagger文档
[R-05] 分页: { items: T[], total, page, pageSize }
[R-06] 错误: HttpException + 对应HTTP状态码
```

### 状态机 (Trip 12状态)
```
[R-07] 状态变更必须校验 AllowedTransitions (TripStateMachine)
[R-08] 终态 (COMPLETED/CANCELLED/REFUNDED) 不可再跳转
[R-09] 状态变更需写审计日志
```

### 命名规范
```
[R-19] 组件: PascalCase       [R-20] 函数/变量: camelCase
[R-21] Prisma: camelCase      [R-22] 枚举: UPPER_SNAKE_CASE
[R-23] 时间: ISO8601          [R-24] ID: UUID (cuid)
```

### 数据库
```
[R-31] Schema变更用 prisma db push (开发阶段)
[R-32] 新增字段必须有默认值或允许 null
[R-33] 枚举新增顺序: Schema → 后端DTO → 前端
[R-59] Prisma字段名必须查schema.prisma确认，禁止猜测
```

### 安全与Guard
```
[R-63] Controller必须有 JwtAuthGuard + RolesGuard。@Public()标记公开路由
[R-64] findMany必须有take参数，列表@Max(100)，防OOM
[R-65] 外部HTTP调用必须有超时
[R-68] 接受userId param的端点必须验证访问权限 (IDOR防护)
[R-74] @Roles()必须配合@UseGuards使用，否则装饰器无效
```

### 备份铁律
```
[B-01] 每完成一个功能必须立即 git add+commit。禁止积累超过半天
[B-02] 单次commit ≤ 30个文件，超过必须拆分
[B-03] 禁止 --no-verify 绕过 pre-commit hook
[B-07] 禁止积累临时文件，会话结束清理根目录杂散文件
```

---

## 开发基座宪法（HH，最高约束）

> 移植自作业郎 HH-00-开发基座宪法-v1.0，适配ZUTING五端架构

### 垂直切片
```
[HH-V01] 垂直切片强制令: 页面→组件→API调用→Controller→Service→Prisma→DB 缺一不可
[HH-V02] 空壳零容忍: 空壳页面/Alert占位/断联组件 → 要么完善要么删除
[HH-V03] 交付≠编译通过: 必须有真实API调用+真实数据渲染+交互可用
[HH-V04] 新文件必须有调用者。孤立文件 = 死代码
[HH-V05] 禁止批量生成骨架。宁可少做但做透，不要多做全是壳
[HH-V06] 空壳只减不增。每次迭代必须减少空壳数量
```

### 安全底线
```
[HH-S01] .env* 禁入 Git (.gitignore已配置)
[HH-S02] Token/密码存环境变量，禁止硬编码
[HH-S03] helmet + CORS白名单 + RateLimiter 三件套
```

### 编码前检查
```
[HH-E01] 编码前5问 (任一"否"则停):
  Q1: 这个页面的数据从哪个API获取?
  Q2: 用户在这个页面能完成什么任务?
  Q3: 这个API端点有Swagger文档吗?
  Q4: 页面的loading/error/empty三态都处理了吗?
  Q5: 移动端响应式布局考虑了吗?
```

---

## 防火墙（高频出错区）

### 人工修改保护
```
[HE-01] 人工修改 > AI判断。CEO发起/指示/批准的 = 人工修改
[HE-04] 绝对禁止覆盖/还原/重写人工修改
[HE-06] 冲突时: 人工 > PRD > AI
```

### 业务逻辑守卫 (业务++)
```
[BLG-01] 页面数据必须服务于目标用户的业务目的
[BLG-02] 三问测试: Q1目标用户? Q2帮做什么决策? Q3去掉会变差?
         任一答不上 = 不属于该页面
[BLG-03] ZUTING业务边界:
         - 首页/列表/详情: 展示宗教文化内容，引导用户探索
         - 行程: 帮用户规划朝圣路线，管理行程状态
         - AI聊天: 回答宗教文化问题，推荐朝圣路线
         - 管理后台: CRUD管理内容数据+用户+订单
```

### 前端常见陷阱
```
[B1] ❌ useQuery+useEffect双写  → ✅ 只用useQuery
[B4] ❌ api.getDetail('')        → ✅ enabled: !!id
[B7] ❌ item.score.toFixed()     → ✅ (item.score ?? 0).toFixed()
[B8] ❌ data.items.map()         → ✅ (Array.isArray(data?.items) ? data.items : []).map()
[B10]❌ 删除后忘invalidate       → ✅ deleteAPI → invalidateQueries
```

### 上下文管理
```
[C-01] 禁止无脑读全文。Read必须带 offset+limit (除非 <100行)
[C-02] 先 Grep 定位，再 Read 精读
[C-04] 单个 Agent 只做一件事，禁止同时处理 3+ 个文件
[C-05] 拆任务时提供精确上下文(文件+行号)，避免Agent重新探索
```

---

## 审查体系

### 页面++ (PRD驱动深度重构)
```
铁律: 先读PRD → 扫描现状 → 写/更新重构PRD → 计划 → 执行 → 验证
PRD路径: docs/prd/
双向分析: 代码可能比PRD更好，不盲目删已有好代码
```

### 全审++ (hohoho)
```
对指定模块执行全面审查:
V1-代码质量: tsc检查/ESLint/命名规范/死代码
V2-功能完整: API连通/CRUD完整/状态机/数据验证
V3-用户体验: loading/error/empty三态/响应式/i18n
V4-安全: 认证Guard/输入验证/IDOR防护/CORS
V5-性能: bundle大小/lazy loading/图片优化/缓存
```

### Commit 规范
```
<type>(<scope>): <subject>
type:  feat | fix | refactor | style | docs | test | chore | perf
scope: api | web | admin | mobile | miniprogram | shared | deploy | desktop
```
