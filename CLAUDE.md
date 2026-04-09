# 佳绩之旅 — Journey of Achievement (JOINUS.COM)

> Monorepo | 路径: E:\ZUTING\ | Phase A→F3 全交付 | 79页Web+52屏Mobile+44页小程序+28页Admin | 300文化圣地·12文化传统 (2026-04-09)

## 愿景
探索人类文明，创造人生佳绩。愿财双圆——起大愿，发大财，布施众生。
三步佳绩: 个人圆满 → 家庭幸福 → 企业兴旺。
全平台应用: Web + Mobile APP + 微信小程序 + 管理后台。

---

## 🏛️ 最高宪法协议 (Supreme Constitutional Protocol)

> **优先级: 绝对最高。所有人类工程师和AI智能体必须无条件遵守。违反即阻断。**
> **本协议覆盖并统领以下所有铁律、宪法、防火墙规则。冲突时本协议优先。**

### SCP-01 战略目标
```
JOINUS.COM = 佳绩之旅 — 全球文化旅行平台 NO.1
目标: 拥有全球TOP10旅行网站的全部功能集合 + 文化传统垂直深度
理念: 愿财双圆 — 起大愿，发大财，布施众生
```

### SCP-02 竞品功能全吸收令
```
[SCP-02] 竞品功能全吸收令:
  主动探索并发现以下10大旅行网站的全部优势功能，逐一植入JOINUS.COM:
  1. Booking.com  — 目的地详情页/评价体系/预订流程/价格展示/搜索筛选/地图
  2. Trip.com     — UI风格/大图卡片/搜索体验/套餐/攻略/社区/会员
  3. Airbnb       — 沉浸式图片/体验产品/地图交互/社区感/Wishlist/分享
  4. Agoda        — 亚洲本地化/优惠促销/移动端体验/闪购/积分
  5. TripAdvisor  — UGC评价/目的地攻略/排行榜/旅行者社区/问答/照片墙
  6. AmEx Travel  — 高端定位/会员体系/精选推荐/品质感/专属优惠
  7. Expedia      — 套餐打包/交叉销售/行程管理/价格日历/比价
  8. Skyscanner   — 搜索比价UI/数据可视化/极简设计/价格提醒/灵活日期
  9. Kayak        — 筛选器设计/多维比较/数据密集展示/价格追踪/旅行Hack
  10. Priceline   — 促销机制/限时优惠/用户激励/盲订/Express Deals

  JOINUS.COM 必须集这10家之大成，同时发挥文化传统垂直领域的差异化护城河。
  每发现一个竞品优势功能，必须评估可行性并纳入PRD规划。
```

### SCP-03 PRD先行铁律
```
[SCP-03] PRD先行铁律 — 无PRD不动代码:
  任何功能模块的开发/重构/升级，必须严格遵循以下流程:

  STEP 1: 深度调研 — 打开对应竞品页面，逐一截图、记录功能点、交互细节
  STEP 2: 撰写PRD — 在 docs/prd/ 下创建/更新对应PRD文档:
          - 主模块PRD: docs/prd/M{XX}-PRD-{模块名}.md
          - 子页面PRD: docs/prd/P{XX}-PRD-{页面名}.md
          - 延伸功能PRD: docs/prd/F{XX}-PRD-{功能名}.md
  STEP 3: PRD评审 — PRD必须包含: 竞品对标分析/用户故事/页面线框/API契约/验收标准
  STEP 4: 方可编码 — PRD通过后才允许开始代码和UI/UX开发
  STEP 5: 回溯验证 — 开发完成后对照PRD逐项验收

  粒度要求:
  - 每个功能模块 → 独立主PRD (如M01-PRD-文化传统与圣地.md)
  - 每个子页面 → 独立子页面PRD (如P01-PRD-圣地详情页.md)
  - 每个延伸功能 → 独立功能PRD (如F01-PRD-收藏夹系统.md)
  - 绝不允许一个PRD涵盖超过一个页面的详细设计
```

### SCP-04 开发协议规则库
```
[SCP-04] 开发协议规则库 — 统一规范化:
  路径: docs/protocols/

  必须维护的协议文档:
  - docs/protocols/00-最高宪法协议.md        ← 本协议的完整版
  - docs/protocols/01-UI设计规范.md           ← 颜色/字体/间距/组件/响应式
  - docs/protocols/02-API契约规范.md          ← 请求/响应/分页/错误/版本
  - docs/protocols/03-组件开发规范.md         ← 命名/Props/状态/样式/测试
  - docs/protocols/04-数据模型规范.md         ← Prisma/DTO/枚举/关系/迁移
  - docs/protocols/05-安全规范.md             ← 认证/授权/输入校验/CORS/XSS
  - docs/protocols/06-国际化规范.md           ← i18n键命名/翻译流程/RTL
  - docs/protocols/07-Git与部署规范.md        ← 分支/Commit/PR/CI/CD/部署
  - docs/protocols/08-PRD撰写规范.md          ← PRD模板/评审流程/验收标准
  - docs/protocols/09-竞品分析规范.md         ← 竞品调研模板/功能对比矩阵
  - docs/protocols/10-AI智能体协作规范.md     ← Agent任务分配/prompt标准/质量门禁

  所有人类工程师和AI智能体在开发前必须阅读相关协议。
  协议文档随项目演进持续更新，由CEO++指令触发升级。
```

### SCP-05 CLAUDE.md持续进化
```
[SCP-05] CLAUDE.md 持续进化令:
  - CLAUDE.md 是全项目最高配置文件，等同于宪法
  - 每次发现新的铁律/规范/最佳实践 → 评估后写入CLAUDE.md
  - 每次重大版本迭代后 → 审查并更新CLAUDE.md
  - 协议规则库(docs/protocols/)中的核心规则必须在CLAUDE.md有摘要引用
  - AI智能体(Heartbeat/Agent)执行任务前必须先读取CLAUDE.md
  - 禁止降级: 已有的铁律只能升级或废弃(标注废弃原因)，不能静默删除
```

### SCP-06 全功能集合路线图
```
[SCP-06] 全功能集合路线图 — JOINUS.COM必须具备:
  Phase A (核心功能 — ✅ 完成):
    ✓ 目的地(圣地/祖庭)浏览与详情
    ✓ 行程规划与状态管理 (12状态机)
    ✓ AI聊天助手(小鸿, Qwen3.5-35B)
    ✓ 文化之旅日志 (CRUD+公开/私密)
    ✓ 管理后台CRUD (28页)

  Phase B (体验升级 — ✅ 完成):
    ✓ 搜索系统 — 全站搜索+筛选+排序+热词+建议 (对标Booking/Kayak)
    ✓ 评价系统 — UGC评价+评分+照片+回复+投票 (对标TripAdvisor)
    ✓ 收藏系统 — Wishlist+收藏夹+分享+快捷收藏 (对标Airbnb)
    ✓ 推荐系统 — 相关推荐+猜你喜欢+热门 (对标Booking/Trip.com)
    ✓ 攻略社区 — 游记+攻略+问答+照片墙+排行榜 (对标TripAdvisor)

  Phase C (商业闭环 — ✅ 完成):
    ✓ 支付系统 — 在线支付+退款+订单管理 (对标Booking/Agoda)
    ✓ 促销系统 — 优惠券+限时折扣+活动管理 (对标Priceline/Agoda)
    ✓ 会员体系 — 等级+积分+签到+积分商城+专属权益 (对标AmEx Travel)
    ✓ 套餐打包 — 路线套餐+预订管理 (对标Expedia)
    ✓ 价格工具 — 比价+价格日历+价格提醒+趋势 (对标Skyscanner/Kayak)

  Phase D (生态扩展 — ✅ 完成):
    ✓ 多语言 — 中/英/日/韩/泰/印/阿 7语言 (对标Booking全球化)
    ✓ 社交分享 — ShareButton+分享API+分享追踪 (对标Airbnb)
    ✓ 商家入驻 — 供应商注册/审核/管理平台 (对标Booking商家端)
    ✓ 数据分析 — 运营面板+用户行为+转化漏斗 (对标Agoda分析)
    ✓ 移动优先 — PWA+离线+推送通知 (对标Agoda移动体验)

  Phase E (沉浸体验 — ✅ 完成):
    ✓ 实时消息 — WebSocket+私信+商家咨询 (Sprint E1)
    ✓ 多媒体导览 — 视频+360全景+音频讲解 (Sprint E2)
    □ 二级分销 — 邀请码+佣金+团队管理 (已有API,待强化)

  Phase F (内容深化 — ✅ 完成):
    ✓ 文化圣地扩充 — 60→300，12文化传统全球覆盖，真实GPS+经文 (M33)
    ✓ AI社区 — 12智能体自动发帖+游记+问答+CRON (M32+AI)
    ✓ 团队文化 — B2B模块，6主题包+五步法+哲学 (M32)
    ✓ 文化百科 — 12大文化传统深度内容，起源+大事记+圣典
    ✓ 宪法升级 — 项目++系统10技能+协议规则库

  Phase F2 (企业家圆满三部曲 — ✅ 完成):
    ✓ 个人圆满 (M34) — 企业家成长6主题包，暖金#8B6914，禅宗/道教/儒家/基督/藏传/融合
    ✓ 家庭幸福 (M35) — 家庭成长6主题包，翡翠绿#2D8B6F，同心/传家/和解/感恩/守护/归根
    ✓ 圆满之路导航 — 三模块(个人圆满/家庭幸福/企业兴旺)共享CultureCategory枚举

  Phase F3 (佳绩力评估体系 — ✅ 完成):
    ✓ 佳绩力评估 (M36) — 五维评估(觉察力/定力/格局力/连接力/传承力)，60题3模式
    ✓ 佳绩力等级 — 初觉→明心→见性→证道→圆融，五系颜色映射
    ✓ 评估积分 — 完成评估获50+积分，7天冷却

  Phase F4 (佳绩之旅品牌升级 — ✅ 完成):
    ✓ 全站品牌重塑 — 祖庭旅行→佳绩之旅，5Wave实施
    ✓ 12文化传统 — "X教"→"X文化"（基督文化/儒家文化/藏传文化等）
    ✓ 术语净化 — 宗教→文化传统，朝圣→文化之旅，信仰→文化智慧
    ✓ 全端覆盖 — Web+API+Admin+Mobile+小程序，i18n 7语言
```

---

## 技术栈
- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: NestJS 11 + TypeScript + SWC + Prisma 6 + PostgreSQL 16 + Redis 7 (43模块, 270路由, 65表)
- **Web**: Next.js 15 + React 19 + TailwindCSS v4 (79页面)
- **Admin**: Vite + React 19 + Ant Design 5 + Recharts (28页面)
- **Mobile**: React Native + Expo 52 + Expo Router (52屏, 5 tabs)
- **小程序**: Taro 4.x + React (44页面)
- **Shared**: @zuting/api-client, @zuting/shared-types, @zuting/config, @zuting/shared-utils, @zuting/translations
- **Desktop**: Python 3 + tkinter (原有桌面助手，保留在 desktop/)

## 项目结构
```
E:\ZUTING\
├── apps/
│   ├── web/                     # Next.js 15 官网 (@zuting/web)
│   │   ├── src/app/             # 78个页面路由 (App Router)
│   │   ├── src/components/      # 30+ 组件 (MediaTour, ReviewSection, SaveButton等)
│   │   └── src/lib/             # API客户端 + i18n (7语言)
│   ├── admin/                   # Vite管理后台 (@zuting/admin)
│   │   └── src/pages/           # 28个页面 (Dashboard, CRUD, 分析, 审核等)
│   ├── mobile/                  # Expo React Native (@zuting/mobile)
│   │   ├── app/(tabs)/          # 5个Tab (首页/圣地/AI聊天/修行/我的)
│   │   └── app/                 # 47个详情/功能页
│   └── miniprogram/             # Taro 微信小程序 (@zuting/miniprogram)
│       └── src/pages/           # 44个页面
├── packages/
│   ├── shared-types/            # 共享TypeScript类型
│   ├── api-client/              # 类型安全API客户端
│   ├── config/                  # 业务配置 (religions, seals, trips, design)
│   ├── shared-utils/            # 共享工具函数
│   └── translations/            # i18n翻译文件
├── services/
│   └── api/                     # NestJS 后端 (@zuting/api)
│       ├── src/modules/         # 40个模块 (241个路由)
│       │   ├── religion/        # 12大文化传统
│       │   ├── holy-site/       # 300文化圣地 (12文化传统全球覆盖)
│       │   ├── temple/          # 祖庭管理
│       │   ├── patriarch/       # 祖师管理
│       │   ├── teaching/        # 祖训管理
│       │   ├── seal/            # 三十印
│       │   ├── xiaohong/        # 小鸿AI聊天 (SSE流式, Qwen3.5-35B)
│       │   ├── trip/            # 行程管理 (12状态机)
│       │   ├── order/           # 订单+支付
│       │   ├── journal/         # 文化之旅日志
│       │   ├── review/          # UGC评价+投票
│       │   ├── collection/      # 收藏系统
│       │   ├── search/          # 全站搜索
│       │   ├── community/       # 攻略社区
│       │   ├── guide/           # 游记攻略
│       │   ├── question/        # 问答系统
│       │   ├── coupon/          # 优惠券
│       │   ├── promotion/       # 促销活动
│       │   ├── membership/      # 会员体系+签到
│       │   ├── referral/        # 分销推荐
│       │   ├── points-mall/     # 积分商城
│       │   ├── package/         # 套餐打包
│       │   ├── price/           # 价格工具
│       │   ├── route/           # 路线管理
│       │   ├── booking/         # 路线预订
│       │   ├── merchant/        # 商家入驻
│       │   ├── media/           # 多媒体导览
│       │   ├── chat/            # 实时消息
│       │   ├── analytics/       # 数据分析
│       │   ├── share/           # 社交分享
│       │   ├── notification/    # 推送通知
│       │   ├── recommendation/  # 推荐引擎
│       │   ├── moderation/      # 内容审核
│       │   ├── personal-growth/ # 个人圆满 (M34, CultureCategory=PERSONAL)
│       │   ├── family-harmony/  # 家庭幸福 (M35, CultureCategory=FAMILY)
│       │   └── auth,health,redis,upload,payment,user/
│       ├── src/common/          # TripStateMachine
│       ├── prisma/schema.prisma # 数据模型 (63个表)
│       └── prisma/seed.ts       # 种子数据 (500+条记录)
├── docs/
│   ├── prd/                     # 65+份PRD (M35+P30+F11)
│   └── protocols/               # 开发协议规则库
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

## API端点 (42个模块, 265个路由)
| 类别 | 模块 | 路由数 | 说明 |
|------|------|--------|------|
| 内容 | religions, holy-sites, temples, patriarchs, teachings, seals | ~24 | 核心文化内容CRUD |
| 行程 | trips, routes, bookings, packages | ~40 | 行程+路线+预订+套餐 |
| 商业 | orders, payment, coupons, promotions, prices | ~35 | 订单+支付+促销+价格 |
| 社区 | reviews, guides, questions, community | ~30 | 评价+攻略+问答+社区 |
| 用户 | auth, users, membership, referral, points-mall, collections | ~40 | 认证+会员+分销+积分+收藏 |
| 运营 | merchants, analytics, moderation, notifications, search | ~30 | 商家+分析+审核+通知+搜索 |
| AI | xiaohong, recommendation, ai-config | ~15 | 小鸿聊天+推荐+配置 |
| 媒体 | media, upload, share, chat | ~27 | 多媒体+上传+分享+消息 |
| 圆满之路 | personal-growth, family-harmony | ~24 | 个人圆满+家庭幸福(共享TeamCulture表) |

## Web 页面 (78页)
核心内容(12): 首页, 文化传统列表/详情, 文化圣地列表/详情, 祖庭列表/详情, 祖师列表/详情, 祖训列表/详情, 印列表/详情
路线行程(8): 路线列表/详情, 行程列表/创建/详情, 套餐列表/详情, 结账
社区(10): 社区首页, 攻略列表/编辑/详情, 问答广场/详情, 排行榜, 照片墙, 日志列表/创建/详情
商业(11): 订单列表, 会员中心, 分销中心, 积分商城, 优惠券, 促销活动, 结账/支付结果
价格(5): 价格中心, 日历, 比价, 趋势, 提醒
用户(8): 登录/注册, 个人中心, 用户主页, 收藏列表/详情/分享, 消息, 通知
商家(3): 商家列表/详情, 商家注册
圆满之路(12): 个人圆满首页/主题列表/主题详情/案例列表/案例详情, 家庭幸福首页/主题列表/主题详情/案例列表/案例详情, +各2组件
其他(9): AI聊天, 地图, 搜索, 关于/隐私/条款, 离线页, 实时消息

## Admin 后台 (28页)
内容管理(7): 文化传统/圣地/祖庭/祖师/祖训/印/多媒体
运营管理(8): 路线/预订/行程/订单/优惠券/促销/会员/价格
社区管理(4): 评价/社区/内容审核/用户
商家系统(1): 商家管理
AI与分析(5): AI配置/聊天监控/搜索统计/数据分析/国际化分享
其他(3): 仪表盘/登录

## Mobile APP (52屏)
5 Tabs + 47个功能页 (详情/社区/支付/会员/商家/价格/消息/通知等)

## 微信小程序 (44页)
核心浏览+社区+商业+消息全覆盖

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

## 数据内容 (500+条种子记录)
- **12大文化传统**: 佛教文化/道教文化/基督文化/伊斯兰文化/印度文化/犹太文化/儒家文化/锡克文化/神道文化/藏传文化/原住民文化/巴哈伊文化
- **300文化圣地**: 12文化传统×20~35个，覆盖全球主要文化场所，含真实GPS坐标、UTC偏移、经文描述
  - 数据文件: `services/api/prisma/data/holy-sites-data.ts` (~2500行)
  - 图片兜底: 新站点通过文化分组+名称哈希确定性选取已有图片
- **27祖庭**: 各文化传统重要祖庭，含建立时间、坐标
- **28祖师**: 各文化传统创始人/重要人物，含传记
- **39祖训**: 原文+来源+中文翻译
- **30印**: 曹溪愿命三十印 (五系: 初印系→中印系→印果印→成道印→归源印)
- **10路线**: 精品文化之旅路线，含站点+价格+时长
- **11 AI配置**: 小鸿AI参数+推荐问题
- **6多媒体**: 视频/全景/音频示例内容
- **12 AI社区**: 12智能体+60游记+36问答+72回答+51评论 (CRON自动发帖)
- **6团队文化主题**: 企业禅修/领导力/传承精神等 B2B主题包
- **6个人圆满主题**: 觉醒/定力/格局/重生/慈悲/传灯 (M34, 暖金#8B6914)
- **6家庭幸福主题**: 同心/传家/和解/感恩/守护/归根 (M35, 翡翠绿#2D8B6F)

## 设计主题
- 深色殿堂风: 背景 #0f172a → #020617, 金色点缀 #D4A855
- 每个文化传统有独特颜色和符号
- 五系印各有系列色 (青/蓝/紫/红/金)
- 地图: Leaflet + CartoDB暗色瓦片
- 7语言i18n: 中/英/日/韩/泰/印地/阿拉伯 (含RTL)

## Sprint 历史
| Sprint | 内容 | 状态 |
|--------|------|------|
| Phase A | 核心内容+行程+AI聊天+日志+后台 | ✅ |
| Phase B | 搜索+评价+收藏+推荐+攻略社区 | ✅ |
| C1 | 结账+支付+订单管理 | ✅ |
| C2 | 会员+分销+积分商城+套餐 | ✅ |
| C3 | 价格工具(比价/日历/提醒/趋势) | ✅ |
| D1 | 多语言+社交分享 (7语言i18n) | ✅ |
| D2 | 商家入驻平台 | ✅ |
| D3 | 数据分析+PWA离线推送 | ✅ |
| E1 | 实时消息系统 (WebSocket+私信) | ✅ |
| E2 | 多媒体导览 (视频+全景+音频) | ✅ |
| F1 | 宪法升级+移动端对齐+圣地300扩充+AI社区+团队文化 | ✅ |
| F2 | 企业家圆满三部曲: 个人圆满(M34)+家庭幸福(M35)+导航整合 | ✅ |
| F3 | 佳绩力评估体系(M36)+积分集成 | ✅ |
| F4 | 佳绩之旅品牌升级: 全站术语替换+12文化传统+5Wave全端覆盖 | ✅ |

## 注意事项
- NestJS使用SWC编译 (nest-cli.json配置builder:swc)，因为tsx不支持emitDecoratorMetadata
- **Prisma enum不能直接传给Swagger装饰器** — 用字符串数组代替，参数用string类型，调用时cast。否则会触发circular dependency错误
- Web用 `force-dynamic` 避免构建时需要API运行
- 桌面应用独立运行: `cd desktop && python zuting_app.py`
- **可选依赖(Sentry等)必须用运行时字符串拼接+new Function绕过打包器**，禁止静态import/require
- **生产环境API必须 `NODE_NO_COMPILE_CACHE=1`** — Node v20 compile cache 破坏 Prisma enum
- **seed后必须flush Redis** — deleteMany+create生成新cuid，旧缓存ID导致404

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

### 前端API对接
```
[FE-01] 新增前端API函数时必须 curl 验证真实响应格式，不能只看后端代码推断
[FE-02] 兼容裸数组和{items}包装: Array.isArray(res) ? res : (res?.items ?? [])
[FE-03] 后端 @Max(100) 分页上限时，前端需全量数据必须循环分页 (安全上限 page<=10)
```

### 类型对齐 (Schema→DTO→前端)
```
[TS-01] DTO 字段类型必须与 Prisma Schema 一致。新增前先 grep schema.prisma 确认
[TS-02] Service 层跨类型赋值必须显式转换: String()/Number()，禁止隐式
[TS-03] 类型变更必须走完整链路: Schema → DTO → Service → Admin前端 → Web前端
```

### 运维部署
```
[OPS-01] 生产API启动必须 NODE_NO_COMPILE_CACHE=1 (Node v20 + Prisma 6 兼容性)
[OPS-02] 部署脚本必须内置 build，禁止依赖手动 build
[OPS-03] 多 node 进程用 fuser -k {port}/tcp 杀进程，禁止 pidof/killall
[OPS-04] Redis flush 在新进程就绪后执行，不能在杀旧进程之前
[OPS-05] seed deleteMany 按外键反向顺序: 先删子表再删父表
[OPS-06] seed 后必须清除 Redis 实体缓存 (deleteMany+create 生成新ID)
[OPS-07] 新模块 seed 必须独立成文件，不依赖主 seed 执行顺序
```

### 数据扩充
```
[DATA-01] 大批量新增数据图片兜底: 同类别图片池 + 名称哈希确定性选取，禁止 Math.random()
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
         - 首页/列表/详情: 展示文化传统内容，引导用户探索
         - 行程: 帮用户规划文化之旅路线，管理行程状态
         - AI聊天: 回答文化传统问题，推荐文化之旅路线
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

## 审查体系 — 项目++系统 (移植自作业郎18++体系)

> **完整定义**: docs/protocols/11-项目++系统总索引.md
> **技能文件**: docs/protocols/skills/ (10个++技能)
> **统一骨架**: §0元数据 → §1角色 → §2作用域 → §3规则 → §4流程 → §5评分 → §6工具 → §7生命周期 → §8铁律 → §9联动

### 10个++技能清单
```
#1  全审++ (FA) v2.0 — 顶层编排器，V1-V5+D6-D11共11维，并行Agent+级联审查 → hohoho/Y+/X+触发
#2  项目++ (PJ)  — 标准文档生成器，PRD→DOC-XX+施工图+验收清单
#3  业务++ (BLG) — 业务逻辑守卫，五问测试(Q1-Q5)+业务边界+竞品对标
#4  页面++ (PQM) — PRD驱动页面重构，对标10大旅行竞品循环升级
#5  盲区++ (BS)  — 隐性缺陷猎手，8维度(死按钮/伪空态/链路/参数/死锁/状态机/导航/反馈)
#6  地狱++ (HELL)— 深层安全审计，8维度(IDOR/Guard/DTO/状态机/事务/韧性/XSS/泄露)
#7  体验++ (UX)  — UX审计，8维度(三态/响应式/i18n/反馈/A11y/导航/感知/性能)
#8  飞轮++ (FW)  — 闭环验证，6维度(CRUD/状态机/交易/UGC/事件链/数据一致)
#9  五全++ (FF)  — 五端一致性，5维度(API契约/类型共享/数据/功能/配置)
#10 RRR         — 3分钟快速自检，8点速查(tsc/空壳/API/种子/Guard/空态/i18n/import)
```

### 全审执行流 (hohoho)
```
Step 0: 读CLAUDE.md+PRD → Step 1: RRR预检
Step 2: 业务++ → Step 3: 盲区++ → Step 4: 地狱++
Step 5: 体验++ → Step 6: 飞轮++ → Step 7: 五全++
Step 8: 汇总+修复P0/P1 → Step 9: 验证+报告
```

### V1-V5核心维度 + D6-D11扩展维度 (v2.0)
```
核心5维:
  V1-代码质量: tsc零错/禁any/命名规范/死代码/统一导入 (开发必过)
  V2-功能完整: API连通/CRUD完整/状态机/DTO验证/垂直切片/种子数据 (Commit必过)
  V3-用户体验: 三态/响应式/i18n 7语言/交互反馈/无障碍/暗色一致 (PR必过)
  V4-安全:     Guard/IDOR/输入校验/分页限制/XSS/@Roles+@UseGuards (发版必过)
  V5-性能:     bundle/lazy load/图片优化/缓存/索引/staleTime分级 (大版本必过)

扩展6维 (大版本必过):
  D6-IDOR渗透:  userId归属/商家隔离/Admin权限/shareToken验证
  D7-契约漂移:  前后端路径匹配/字段对齐/枚举一致/分页格式/价格单位
  D8-韧性:      无界查询防护/超时包装/TOCTOU竞态/allSettled韧性
  D9-安全深度:  XSS sanitize/错误泄露/SQL注入/DTO @MaxLength
  D10-状态机:   AllowedTransitions/终态保护/审计日志/领域事件
  D11-数据完整: $transaction/FK约束/幂等操作/@@unique/级联删除
```

### 评分体系
```
≥4.0 = ✅ PASS | 3.0-3.9 = ⚠️ PARTIAL | <3.0 = ❌ FAIL
每个++独立前缀: FA/PJ/BLG/PQM/BS/HELL/UX/FW/FF/RRR
每个++有Inspector(发现)/Executor(修复)/Verifier(验证)三角
```

### 系统铁律 (PP-01~PP-10)
```
[PP-01] 新建++必须遵循§0-§9统一骨架
[PP-02] 每个++必须有N维×5⭐评分体系
[PP-03] 评分前缀全局唯一
[PP-04] ++只能升级不能降级
[PP-05] 事故复盘必须产出≥1条新规则写入对应++
```

### 页面++ (PRD驱动深度重构)
```
铁律: 先读PRD → 扫描现状 → 写/更新重构PRD → 计划 → 执行 → 验证
PRD路径: docs/prd/
双向分析: 代码可能比PRD更好，不盲目删已有好代码
竞品对标: 10大旅行网站 (Booking/Trip.com/Airbnb/Agoda/TripAdvisor/AmEx/Expedia/Skyscanner/Kayak/Priceline)
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

## 部署链路 (deploy-xiaoqing.py)
```
build_local() → pack tar.gz → SSH upload → unpack
→ pnpm install → prisma generate → db push → seed.ts → seed-team-culture.ts → seed-personal-growth.ts → seed-family-harmony.ts
→ kill old (fuser -k port/tcp) → start new (NODE_NO_COMPILE_CACHE=1)
→ health check (API:3002 Web:3000 Admin:3003)
→ Redis flush (holy-site:*/route:*/religion:*/temple:*/patriarch:*/teaching:*/seal:*)
→ 报告成功
```

## 知识沉淀体系 (E:\ZUTING-APP\)
```
业务逻辑PRD/     — 63+份 (M01-M33主模块 + P01-P30子页面 + F01-F11功能)
经验沉淀/         — 11份踩坑实录 (部署/类型/缓存/跨模块/AI社区等)
修复档案库/       — 修复存档
开发标准文档/     — 52份标准文档 (HH宪法对齐)
PLAN/             — 规划文档
```
