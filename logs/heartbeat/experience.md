
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
