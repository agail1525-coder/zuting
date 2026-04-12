# M40-PRD — 数据层 react-query 迁移

> **状态**: v1.0 / 待执行 | **负责人**: CEO++ | **日期**: 2026-04-12
> **前置**: M39 修行大系统重构 (Wave 2 UX 已定基调) | **衍生自**: M39 FR-05 延期项
> **触发**: 全站 fetch+setState 手写缓存,提交后不自动刷新,切页丢状态

## §0 元数据

| 字段 | 值 |
|------|-----|
| PRD 编号 | M40 |
| 主题 | 前端数据层 react-query 渐进式接入 |
| 范围 | apps/web (只管 Next.js Web 端,不动 Mobile/小程序) |
| 预计工期 | 4-6 天 (3 Wave) |
| 依赖 | `@tanstack/react-query` v5 (待安装) |
| 风险 | 中 — 触及 providers 根节点,需灰度 |

## §1 背景与目标

### 1.1 背景
M39 Wave 2 审查暴露:
- cultivation/* 6 页面全部手写 `useState + useEffect + fetch`,无缓存层
- 提交后靠手动 `load()` 重新拉,内存状态,切页丢失
- 并发 2 个 tab 无法同步
- `Promise.allSettled` 编排 7 个 API,首屏 7 瀑布,无去重

### 1.2 目标
- 引入 react-query v5,按**页面迁移**而非大爆炸
- staleTime 分级:静态内容 `Infinity` / 用户进度 `5min` / 列表 `1min`
- 提交成功后 `invalidateQueries` 自动刷新
- 首屏保持不退化 (parallel fetch via `useQueries`)

### 1.3 不做什么
- ❌ 不动 Mobile/小程序/Admin (各自独立)
- ❌ 不做 SSR prefetch (首版后端仍 force-dynamic)
- ❌ 不替换 fetch 层 (`@/lib/api` 保持纯函数)
- ❌ 不引入 devtools (bundle 代价大)

## §2 作用域

### Wave 1 — 地基 (本次)
- 安装 `@tanstack/react-query@^5`
- `apps/web/src/lib/query-client.ts` (新) — 单例 QueryClient,默认 staleTime 60s
- `apps/web/src/app/providers.tsx` — 加 `QueryClientProvider` 外层
- POC 迁移 **1 个页面**: `/trips/cultivation` (overview) — 最复杂 (7 并发 API),作为模板

### Wave 2 — cultivation 全量 (下次)
- `/trips/cultivation/ox-path`
- `/trips/cultivation/bhumi-path`
- `/trips/cultivation/scriptures`
- `/trips/cultivation/daily-practice`
- `/trips/cultivation/wisdom`
- 各页面提交后 `queryClient.invalidateQueries(['cultivation'])`

### Wave 3 — 扩散 (M42 后续)
- `/trips/*` 其他页面 (行程/路线/套餐/订单)
- `/community/*` 评价/游记/问答
- 跨模块 query key 规范

## §3 功能需求

### FR-01 QueryClient 单例
```ts
// apps/web/src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### FR-02 Providers 接入
`providers.tsx` 最外层包 `<QueryClientProvider client={queryClient}>`。

### FR-03 cultivation overview POC
用 `useQueries` 替换 `Promise.allSettled`,7 个 key:
- `['cultivation','compass']` staleTime 5min
- `['cultivation','daily-practice','timeline']` staleTime 1min
- `['cultivation','ox-path']` staleTime 5min
- `['cultivation','wisdom','history', page, size]` staleTime 1min
- `['cultivation','karma','timeline', page, size]` staleTime 1min
- `['cultivation','three-lives']` staleTime 5min
- `['cultivation','scripture','recommended']` staleTime 10min

## §4 验收

| # | 验收项 | 通过条件 |
|---|--------|----------|
| AC-01 | 安装 | `pnpm --filter @zuting/web ls @tanstack/react-query` 返回 v5.x |
| AC-02 | 单例 | grep `new QueryClient` 全 web 仅 1 处 |
| AC-03 | Provider | providers.tsx 最外层 QueryClientProvider |
| AC-04 | POC 页面 | /trips/cultivation 首屏正常,切到 ox-path 返回 **不再重新拉** compass |
| AC-05 | tsc | `tsc --noEmit` 全绿 |
| AC-06 | 无退化 | 原 loading/error/empty 三态行为不变 |

## §5 风险与回滚
- 风险:provider 顺序错 → 所有页面白屏。缓解:单 commit 灰度,出问题 revert providers.tsx 即可。
- 风险:默认 staleTime 60s 对登录态敏感数据过长。缓解:各页面显式覆盖。
- 回滚:revert Wave 1 commit,保留安装。

---

**签批即执行**。
