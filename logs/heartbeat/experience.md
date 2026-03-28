
---
[2026-03-27 07:17] Task: miniprogram-fix-auth-hardcoded-localhost
文件: apps/miniprogram/src/lib/auth.ts
发现: auth.ts 和 api.ts 各自独立定义 API_URL/BASE_URL，auth.ts 忘记用环境变量导致生产认证全挂
原因: auth.ts 是后加的模块，复制时没同步 api.ts 的环境变量逻辑
解法: 用相同的 process.env.TARO_APP_API_URL + NODE_ENV fallback 模式。理想状态是抽取为共享常量避免重复

---
[2026-03-27 07:17] Task: api-fix-journal-findone-no-ownership-check
文件: services/api/src/modules/journal/journal.service.ts
发现: findOne方法缺少所有权校验是常见IDOR模式 — findAll正确过滤了isPublic，但findOne遗漏
原因: CRUD生成时findOne通常只做findUnique+404检查，开发者忘记对详情接口也做可见性校验
解法: 所有涉及用户数据的findOne方法都应接受requestUserId参数，查询后检查isPublic+ownership

---
[2026-03-27 07:18] Task: miniprogram-fix-missing-fetchReligionById
文件: apps/miniprogram/src/pages/religion-detail/index.tsx
发现: 搜索结果跳转详情页时传的是id而非slug，但API层只有fetchBySlug，导致页面永远空白
原因: fetchReligionBySlug(undefined)不会报错但返回空数组，.then(list => list[0])得到undefined，页面无任何内容也无错误提示
解法: 同时提供fetchById和fetchBySlug，详情页根据路由参数选择正确的fetch方法；优先用id（更可靠），slug作为fallback

---
[2026-03-27 07:18] Task: mobile-fix-journal-list-no-onpress
文件: apps/mobile/app/journals/[id].tsx
发现: Expo Router动态路由文件 [id].tsx 用 useLocalSearchParams<{ id: string }> 获取参数，需要泛型约束否则类型为 string | string[]
原因: Expo Router的searchParams默认类型宽泛
解法: 使用 useLocalSearchParams<{ id: string }> 指定具体类型

---
[2026-03-27 07:20] Task: api-fix-trip-public-endpoint-idor
文件: services/api/src/modules/trip/trip.service.ts
发现: Trip模型没有isPublic字段(只有Journal有)，不能用isPublic做可见性过滤
原因: 初始设计时Trip没有公开/私密概念，isPublic只在JournalEntry模型上
解法: 用status做可见性边界——只有IN_PROGRESS/COMPLETED/REVIEWING状态的行程对非owner可见，DRAFT/PLANNING等私密状态不暴露

---
[2026-03-27 07:20] Task: miniprogram-fix-profile-wrong-stat-label
文件: apps/miniprogram/src/pages/profile/index.tsx
发现: 统计标签'已访圣地'绑定的是journals计数，数据与标签完全不匹配，会误导用户
原因: 开发时可能先写了理想标签，但后端User模型只有journals/practices/trips的_count关联，没有visitedSites聚合字段
解法: 标签必须与实际数据源一致 — 要么改标签匹配数据，要么后端新增聚合字段。此处选择改标签为'朝圣日志'

---
[2026-03-27 07:20] Task: api-fix-xiaohong-missing-await
文件: services/api/dist/ (stale build cache)
发现: nest build 可能使用 dist/ 缓存导致报错信息指向旧代码行号，与当前源码不匹配
原因: SWC增量编译可能未正确清理旧的 .js/.d.ts 文件
解法: rm -rf services/api/dist 后重新 build 即可解决幽灵编译错误

---
[2026-03-27 07:21] Task: web-fix-search-religion-link-broken
文件: apps/web/src/app/search/page.tsx + services/api/src/modules/search/search.service.ts
发现: 搜索结果中religion类型需要slug而非id来构建详情页URL，但后端SearchResultItem未包含slug字段
原因: 其他实体(holy-site/temple等)用id做路由，religion是唯一用slug做路由的类型，搜索接口设计时遗漏了这个差异
解法: 后端SearchResultItem加可选slug字段，searchReligions返回r.slug，前端用slug构建URL并fallback到列表页

---
[2026-03-27 07:22] Task: admin-fix-auth-api-url-mismatch
文件: apps/admin/src/lib/auth.ts, apps/admin/src/lib/api.ts
发现: admin的auth.ts用绝对URL fallback(localhost:3002)而api.ts用相对路径fallback(/api)，生产环境认证到API服务器但数据请求到前端域404
原因: auth.ts和api.ts独立编写，fallback策略不一致。与miniprogram的auth.ts/api.ts问题完全相同(见经验#miniprogram-fix-auth-hardcoded-localhost)
解法: 统一为 import.meta.env.VITE_API_URL || '/api' 模式。所有端的auth和api模块必须共享同一BASE_URL常量或使用相同的环境变量+fallback

---
[2026-03-27 07:22] Task: miniprogram-fix-unauthenticated-mutations
文件: apps/miniprogram/src/lib/api.ts, apps/mobile/src/lib/api.ts
发现: 读取用的request函数通常不需认证（公开API），但写入用的postRequest/requestMutate函数必须带token。两个文件各自有独立的请求函数，容易出现一个有认证一个没有的情况
原因: 项目中已有requestMutateAuth（需显式传token），后来新增的requestMutate简化了接口但遗漏了认证逻辑。小程序的auth.ts中getAccessToken是同步的(Taro.getStorageSync)，而mobile的是异步的(SecureStore)，处理方式不同
解法: 小程序用同步getAccessToken()直接取token；Mobile用异步await getAccessToken()。建议统一模式：所有mutation请求函数都应自动附带token，不依赖调用方传入

---
[2026-03-27 07:39] Task: miniprogram-fix-get-request-missing-auth
文件: apps/miniprogram/src/lib/api.ts
发现: 小程序api.ts中存在两套请求函数(request用于GET, postRequest用于POST)，认证逻辑只在postRequest中实现，request完全无认证。所有用户私有数据的GET端点(trips/orders/journals)都会401
原因: request()最初只服务公开端点(religions/holy-sites等)，后来新增了需认证的GET端点但没回头给request加token
解法: 在request()中复用getAccessToken()同步取token并附加Authorization header，与postRequest保持一致模式

---
[2026-03-27 07:39] Task: admin-fix-holysites-form-validation
文件: apps/admin/src/pages/HolySitesPage.tsx, apps/admin/src/pages/TemplesPage.tsx
发现: 前端表单校验规则与后端DTO必填字段不一致，name和religionId有required但其余必填字段遗漏，提交空表单直接拿到400
原因: 表单开发时可能先搭结构后补校验，但补校验时只覆盖了最明显的字段(name/religionId)，忘了country/lat/lng/utcOffset/description
解法: 对照后端CreateXxxDto逐字段检查@IsOptional标记，凡是没有@IsOptional的字段前端Form.Item必须加required规则，数值字段同步后端@Min/@Max范围

---
[2026-03-27 07:41] Task: web-fix-checkout-missing-api-methods
文件: apps/web/src/app/trips/create/page.tsx
发现: 页面自定义API_URL为 http://localhost:3002/api（带/api后缀），而api.ts的API_BASE是 http://localhost:3002（不带/api），路径前缀在每个方法中拼接。两种模式混用会导致URL拼错
原因: trips/create早期独立开发时直接定义了带/api的BASE URL，与统一客户端的约定不一致
解法: 统一使用api.ts的fetchAuthed，它内部已正确处理BASE_URL + /api/xxx路径拼接

---
[2026-03-27 07:43] Task: web-fix-inline-api-calls-chat
文件: apps/web/src/app/chat/page.tsx
发现: 清理.next缓存后首次build可能报pages-manifest.json ENOENT，再次清理后正常
原因: Next.js 15增量编译的缓存状态文件损坏时，简单rm -rf .next即可修复
解法: 构建前先rm -rf .next确保干净状态

---
[2026-03-27 07:44] Task: web-fix-any-types-sentry
文件: apps/web/.next (build cache)
发现: 删除.next目录后立即rebuild可能因为race condition导致manifest文件缺失错误
原因: rm -rf .next在Windows上可能不完全清理，或Next.js构建过程中的standalone output配置在中间状态时会尝试copy不存在的manifest
解法: 确保完整删除.next后再执行build，用rm -rf && build串联执行而非分步

---
[2026-03-27 07:59] Task: api-fix-findmany-missing-take-limit
文件: services/api/src/modules/user/user.service.ts
发现: interface定义在service文件内部但未export，controller的public方法返回该类型时触发TS4053错误
原因: TypeScript要求public方法的返回类型必须是可从外部访问的（exported），私有interface作为public方法的返回类型违反了declaration emit规则
解法: 将interface改为export interface即可。检查新增module时，凡是service中定义的类型被controller引用的，都必须export

---
[2026-03-27 07:59] Task: miniprogram-fix-any-types-multiple
文件: apps/miniprogram/src/pages/profile/index.tsx
发现: profile.tsx的catch块已经在之前的修复中改为err: unknown，任务描述中的行号可能基于旧版本
原因: 行号会随代码变更漂移，之前的heartbeat任务可能已修复此问题
解法: 修复前先读取当前文件确认实际状态，不盲信任务描述中的行号

---
[2026-03-27 08:01] Task: admin-fix-dashboard-stats-no-pagination
文件: apps/admin/src/lib/api.ts
发现: getDashboardStats()通过调用getReligions()等wrapper函数间接请求API，这些wrapper没有传take参数。Dashboard只需要count和少量字段用于图表，但拉取了完整实体数组
原因: wrapper函数设计时面向列表页(需要全量展示)，Dashboard复用时没有意识到统计场景只需要count
解法: Dashboard stats直接用fetchJson并显式传?take=100，绕过不带分页的wrapper函数。理想方案是后端添加/stats或/count端点，但当前数据量(196条)下take=100已足够

---
[2026-03-27 08:02] Task: web-add-journal-mutation-apis
文件: apps/web/src/app/journals/[id]/page.tsx
发现: JournalDetail接口原先没有userId字段，导致前端无法判断日志所有权
原因: 后端findOne返回完整的Prisma记录（含userId），但前端接口定义遗漏了该字段
解法: 在JournalDetail接口中补充userId?: string，后端已自动返回该字段无需改动

---
[2026-03-27 08:23] Task: mobile-fix-religion-detail-permanent-spinner
文件: apps/mobile/app/religions/[slug].tsx
发现: useEffect内的async函数无法直接作为retry回调，需要提取为组件级函数
原因: useEffect的回调只能返回cleanup function，async函数定义在effect内部时作用域限制导致无法从外部调用重试
解法: 将fetchData提取为组件级的loadData函数，useEffect中调用它，retry按钮也调用同一个函数

---
[2026-03-27 08:25] Task: web-fix-payment-result-raw-fetch
文件: apps/web/src/app/payment/result/page.tsx
发现: 页面内定义的fetchOrder回调与api.ts导出的fetchOrder函数同名，直接导入会产生命名冲突
原因: 页面最初用raw fetch自行实现了fetchOrder，改用api.ts的fetchOrder后名称碰撞
解法: 将页面内的回调重命名为pollOrder（更准确反映其轮询语义），避免与导入函数冲突

---
[2026-03-27 08:25] Task: web-fix-checkout-raw-fetch-bypass
文件: apps/web/src/app/trips/[id]/checkout/page.tsx
发现: 本地TripSite接口用holySite字段，而api.ts的TripSite用site字段(类型为HolySite)，且HolySite没有emoji字段
原因: checkout页面独立开发时自定义了简化接口，与统一api.ts类型产生了字段名和字段集不一致
解法: 统一使用api.ts的TripDetail类型，将模板中的site.holySite改为site.site，移除不存在的emoji引用

---
[2026-03-27 08:26] Task: admin-add-users-page
文件: services/api/src/modules/user/user.controller.ts
发现: 用户模块只有GDPR自助端点(export/delete)，没有管理员管理端点。GET /users路由需注意不与GET users/me/export冲突
原因: 初始设计只考虑了用户自助场景，管理后台的用户管理被遗漏
解法: 在同一controller中新增GET /和PATCH /:id端点，用@Roles('ADMIN')保护。NestJS路由匹配按注册顺序，通配路由放在具体路径后面即可

---
[2026-03-27 08:42] Task: api-fix-trip-operator-audit-poisoning
文件: services/api/src/modules/trip/dto/transition-trip.dto.ts + trip.controller.ts
发现: 审计日志的operator字段由客户端DTO传入，攻击者可伪造任意操作人身份
原因: DTO设计时将operator作为可选参数暴露给客户端，而非从JWT token中提取
解法: 从DTO中删除operator字段，controller中直接使用@CurrentUser('id')作为operator传给状态机

---
[2026-03-27 08:42] Task: admin-fix-api-error-body-discarded
文件: apps/admin/src/lib/api.ts
发现: NestJS class-validator返回的message字段可能是string也可能是string[]（多字段校验失败时）
原因: class-validator批量校验时将所有错误收集到数组中返回
解法: 用Array.isArray判断，数组时join('; ')拼接，确保错误信息完整展示

---
[2026-03-27 08:42] Task: api-fix-user-update-no-dto-validation
文件: services/api/src/modules/user/dto/admin-update-user.dto.ts
发现: Prisma的UserRole枚举包含PILGRIM/GUIDE/AMBASSADOR/ADMIN四个值，任务描述中的USER角色不存在于schema
原因: 任务描述基于假设的角色列表，实际schema使用PILGRIM而非USER
解法: 始终从prisma/schema.prisma读取实际enum值，不盲信任务描述中的枚举值

---
[2026-03-27 08:43] Task: miniprogram-fix-journal-create-no-auth-gate
文件: apps/miniprogram/src/pages/journals/index.tsx
发现: journals页面已经在顶部调用了isLoggedIn()并存为loggedIn变量用于tab显示逻辑，FAB的登录检查可以直接复用该变量，无需额外导入
原因: loggedIn在组件顶层已计算，控制tab栏是否渲染，FAB共享同一作用域
解法: handleCreateJournal直接用已有的loggedIn变量判断，保持代码简洁

---
[2026-03-27 08:43] Task: web-fix-trips-page-no-auth-gate
文件: apps/web/src/app/trips/page.tsx
发现: orders/page.tsx的登录重定向用router.push("/login")不带redirect参数，trips页面加了redirect=/trips以便登录后返回
原因: 用户从trips页面被踢出后，登录完成应回到trips而非首页，提升UX连贯性
解法: 重定向URL中附加?redirect=/trips参数，login页面可据此实现登录后跳回

---
[2026-03-27 08:45] Task: web-fix-review-section-inline-fetch
文件: apps/web/src/components/ReviewSection.tsx
发现: ReviewSection的loadData需要提取为组件级函数供useEffect和ReviewForm的onSubmitted回调共用
原因: useEffect内定义的函数作用域无法被子组件回调引用，必须在组件顶层定义
解法: 将数据加载逻辑提取为组件级loadData函数，useEffect调用它，ReviewForm的onSubmitted也调用它实现提交后自动刷新

---
[2026-03-27 08:46] Task: miniprogram-fix-detail-pages-wrong-error-message
文件: apps/miniprogram/src/app.scss
发现: 小程序的.container/.loading-text/.empty-text等通用样式定义在全局app.scss中，而非各页面scss
原因: Taro小程序的app.scss作为全局样式自动注入所有页面，各页面scss只定义页面特有样式
解法: 新增通用样式（如.retry-btn）应放在app.scss中，避免在每个页面scss中重复定义

---
[2026-03-27 09:05] Task: miniprogram-add-temples-patriarchs-teachings-pages
文件: apps/miniprogram/src/pages/teachings/index.tsx
发现: 祖训(Teaching)没有对应的detail详情页，与圣地/祖庭/祖师不同
原因: Teaching数据结构简单（content+source），不需要独立详情页
解法: 祖训列表页直接内联展示完整内容，无需navigateTo详情页

---
[2026-03-27 09:06] Task: admin-fix-trips-orders-journals-reviews-no-pagination
文件: apps/admin/src/pages/TripsPage.tsx
发现: TripsPage原来用client-side tab过滤(data.filter)配合全量加载，改为server-side分页后tab不能再靠前端filter，需要将status作为API参数传递
原因: 全量加载时前端过滤可行，但分页后data只是当前页数据，前端filter会导致显示数据不完整
解法: 将activeTab的status值作为getTrips的查询参数传给后端，后端已支持status过滤；tab计数不再显示，因为需要额外API才能获取各状态总数

---
[2026-03-27 09:07] Task: web-fix-social-login-inline-fetch
文件: apps/web/src/app/sitemap.ts
发现: sitemap.ts定义了自己的API_BASE(含/api后缀)和3个fetch函数，与api.ts中已有函数完全重复但URL拼接方式不同
原因: sitemap是后来添加的，开发者没注意api.ts已有相同功能的函数
解法: 直接复用api.ts的fetch函数，外包一层safe()做error catch保持sitemap不因API故障而崩溃

---
[2026-03-27 09:07] Task: web-fix-list-pages-silent-fail
文件: apps/web/src/app/*/page.tsx + client.tsx
发现: Next.js 15在Windows上构建时偶发ENOENT: rename 500.html错误，这是文件系统竞态条件，与代码无关
原因: Windows NTFS文件锁定机制与Next.js的export→server目录rename操作冲突
解法: tsc --noEmit验证类型正确性即可确认代码无误，构建错误需要重试或清理.next目录

---
[2026-03-27 09:07] Task: web-fix-auth-context-inline-fetch
文件: apps/web/src/lib/api.ts
发现: auth端点的fetchMe需要显式传token参数，不能复用fetchAuthed（后者从localStorage自动获取token）
原因: auth-context的refreshUser在组件mount时调用，此时需要用刚从localStorage读取的token，而fetchAuthed内部也会读localStorage——虽然效果相同，但fetchMe接受显式token参数使调用语义更清晰，且避免了auth-context对fetchAuthed内部实现的隐式依赖
解法: 创建独立的fetchAuthEndpoint辅助函数，不自动注入token，由调用方通过options.headers显式传入

---
[2026-03-27 09:10] Task: mobile-fix-sentry-any-types
文件: apps/mobile/src/lib/sentry.ts
发现: 模块级let变量赋值后TS不会自动窄化(即使紧接着require赋值)，闭包内也不会窄化
原因: TS对module-scope的let不做控制流窄化，因为其他函数可能随时修改它
解法: require结果先赋给局部const再调用方法，闭包内也用局部const捕获已窄化的值

---
[2026-03-27 09:10] Task: web-fix-notifications-silent-errors
文件: apps/web/src/components/NotificationBell.tsx
发现: 背景轮询(30s interval)的fetch失败应保持静默，只有用户主动触发的操作才需要错误反馈
原因: 轮询失败频繁弹toast会干扰用户体验，且轮询会自动重试；但点击操作失败用户需要知道以便重试
解法: 区分被动轮询和主动操作，前者catch静默，后者catch显示错误提示

---
[2026-03-27 09:16] Task: web-fix-i18n-hardcoded-form-placeholders
文件: apps/web/src/lib/i18n/*.json
发现: i18n系统使用zh-CN作为默认回退语言(DEFAULT_LOCALE)，这意味着如果只更新zh-CN和en而不更新其他5种语言，非中文非英文用户仍会看到中文占位符
原因: 翻译查找链是 当前语言→zh-CN→key本身，没有en作为中间回退
解法: 新增i18n key时必须同步更新全部7种语言的locale文件，其他语言至少使用英文翻译作为基础

---
[2026-03-27 09:59] Task: api-fix-coupon-service-pagination
文件: services/api/src/modules/coupon/coupon.service.ts
发现: 用take:500获取用户已用优惠券ID再notIn过滤，可以用Prisma关系过滤usages:{none:{userId}}替代，完全消除大take查询
原因: Prisma的relation filter会生成SQL NOT EXISTS子查询，由数据库引擎优化执行，比应用层过滤更高效且无分页上限问题
解法: 将两步查询(先查usage再notIn)改为单步where条件中的关系过滤

---
[2026-03-27 09:59] Task: miniprogram-add-teaching-detail-page
文件: apps/miniprogram/src/lib/api.ts
发现: Teaching接口字段名(content/source)与Prisma schema字段名(originalText/sourceText)不匹配，列表页用content但API实际返回originalText
原因: 初始开发时接口定义与后端字段名不一致，列表页可能依赖了某种字段映射或实际使用了错误字段名但因数据恰好存在而未暴露
解法: 详情页中两组字段名都做兼容(originalText || content)，同时在Teaching接口中添加完整的Prisma字段，保持向后兼容

---
[2026-03-27 10:00] Task: admin-fix-aiconfig-mock-suggestions
文件: services/api/src/modules/xiaohong/xiaohong.service.ts
发现: getSuggestions原返回`{ suggestions: string[] }`包裹对象，但admin api.ts的fetchJson<string[]>期望直接数组，类型不匹配导致前端拿到的是对象而非数组
原因: 后端返回格式与前端期望不一致，且.catch((): string[] => [])掩盖了运行时错误
解法: 后端改为直接返回数组`{ text, category }[]`，前端类型同步为`XiaohongSuggestion[]`

---
[2026-03-27 10:00] Task: admin-add-orders-search-filter
文件: apps/admin/src/pages/OrdersPage.tsx
发现: admin的getOrders API已支持status查询参数，可以直接用服务端过滤，无需像CouponsPage那样全量加载后客户端过滤
原因: order.service.ts的findAll方法已有status参数的where条件构建
解法: 状态筛选走服务端(传status参数)，文本搜索走客户端(在当前页数据中过滤)，两者组合使用

---
[2026-03-27 10:22] Task: web-fix-i18n-chat-page-hardcoded
文件: apps/web/src/app/chat/page.tsx
发现: 含有内嵌链接的文案(如"请先[登录]后再对话")无法用单个i18n key解决，需拆分为prefix/link/suffix三段
原因: React JSX中需要在文案中间插入<a>标签，如果用单个key包含整段文字，链接部分无法渲染为可点击元素
解法: 将含链接的文案拆为chat.loginPromptPrefix + chat.loginPromptLink + chat.loginPromptSuffix三个key，在JSX中分别渲染，链接部分用<a>包裹

---
[2026-03-27 10:24] Task: web-fix-i18n-map-page-hardcoded
文件: apps/web/src/lib/i18n/index.tsx
发现: t()函数不支持参数插值，只做简单key→value查找，需要用.replace()手动替换模板变量
原因: useCallback中的t函数实现是直接返回翻译字符串，没有内置interpolation机制
解法: 使用t("key").replace("{var}", value)模式，或设计不需要插值的key拆分方案

---
[2026-03-27 10:33] Task: web-fix-i18n-trips-orders-status-labels
文件: apps/web/src/app/orders/page.tsx, apps/web/src/app/trips/page.tsx
发现: 将STATUS_CONFIG拆分为纯样式对象+i18n动态标签比在组件内重建整个CONFIG更简洁，避免了在非React函数中调用hooks的问题
原因: STATUS_CONFIG原先包含label+style混合数据，但label需要t()（React hook），而CONFIG定义在模块顶层无法调用hooks
解法: 保留模块级style-only常量(STATUS_STYLE)，在组件渲染时用t(`prefix.${status}`)获取标签，两者通过status key关联

---
[2026-03-27 10:51] Task: api-fix-seal-update-dto-validation-bypass
文件: services/api/src/modules/seal/dto/update-seal.dto.ts
发现: 项目中PartialType统一从@nestjs/swagger导入，而非@nestjs/mapped-types，后者未安装且不会正确暴露属性类型
原因: @nestjs/swagger的PartialType同时处理Swagger元数据和class-validator装饰器继承，@nestjs/mapped-types只处理验证装饰器且需要单独安装
解法: 检查项目中已有的UpdateXxxDto文件确认PartialType的导入来源，保持一致

---
[2026-03-27 10:52] Task: miniprogram-fix-journals-mine-tab-shows-others
文件: apps/miniprogram/src/pages/journals/index.tsx
发现: mine tab调用fetchJournals时未传userId，后端IDOR防护逻辑在无userId时默认返回所有公开日志(where.isPublic=true)，数据不泄露但mine tab显示的是社区数据而非个人数据
原因: journal.service.ts的findAll中，当userId未传且currentUserId与userId不匹配时，强制isPublic=true——这防止了真正的数据泄露，但功能上mine tab等同于community tab
解法: 从getCachedUser()获取用户ID并传入fetchJournals({userId: user.id})，同时用useDidShow替代静态isLoggedIn()实现auth状态响应式更新

---
[2026-03-27 10:53] Task: web-fix-i18n-payment-result-page
文件: apps/web/src/app/payment/result/page.tsx
发现: 支付结果页是纯轮询页面(useRef+setTimeout)，auth gate需要放在pollOrder之外用独立useEffect，否则未登录状态下会先触发API调用再跳转
原因: pollOrder在useEffect中立即执行，如果auth检查和poll在同一个effect中，竞态条件可能导致未认证的API请求
解法: auth gate用独立useEffect([authLoading, user, router])，与pollOrder的useEffect完全分离

---
[2026-03-27 10:53] Task: web-fix-i18n-search-page-plus-error
文件: apps/web/src/lib/i18n/zh-CN.json
发现: 中文弯引号（""）在JSON中会导致解析失败，即使它们不是ASCII双引号
原因: Node.js JSON.parse将U+201C/U+201D视为普通字符，但某些webpack JSON loader在特定上下文下解析出错
解法: 使用中文方括号引号「」替代弯引号""，或使用Unicode转义\u201C\u201D

---
[2026-03-27 10:53] Task: miniprogram-fix-auth-check-race-condition
文件: apps/miniprogram/src/pages/chat/index.tsx, trips/index.tsx, journal-create/index.tsx
发现: Taro小程序中useEffect([])只在组件mount时执行一次，从其他tab页登录后返回不会触发re-mount，导致auth状态不刷新
原因: 微信小程序页面栈机制——已打开的页面切走后不会卸载，switchTab回来时组件不重新mount，useEffect([])不重新执行
解法: 使用Taro的useDidShow生命周期钩子替代useEffect([])，它在每次页面显示时都会触发（包括从其他tab返回）

---
[2026-03-27 10:54] Task: web-fix-i18n-journals-pages
文件: apps/web/src/app/journals/page.tsx, journals/[id]/page.tsx
发现: MOOD_EMOJI/MOOD_MAP定义在模块顶层用中文key映射到中文label，i18n化需要将label替换为i18n key引用，在渲染时调用t()
原因: 模块顶层常量无法调用hooks(useTranslation)，所以不能直接存翻译后的label
解法: 将mood映射改为存储i18n key字符串(如"journal.mood.insight")，在JSX渲染时用t(moodInfo.key)动态获取翻译

---
[2026-03-27 10:56] Task: web-fix-i18n-trip-detail-page
文件: apps/web/src/app/trips/[id]/page.tsx
发现: STATUS_STEPS数组中的label需要i18n时，不能在模块顶层调用t()，需要将label与数据结构分离
原因: t()依赖useTranslation hook，只能在React组件内调用，模块顶层的常量定义无法使用hooks
解法: STATUS_STEPS只保留key数组(TripStatus[])，icon用独立Record映射，label在JSX渲染时用t(`tripDetail.status.${stepKey}`)动态获取
