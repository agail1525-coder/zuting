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
