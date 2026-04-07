# 全审++ (Full Audit Pipeline) v2.0

> **代号**: FA | **版本**: v2.0 | **升级日期**: 2026-04-06 | **移植自**: 作业郎 全审++ v3.3 (320次经验沉淀)
> **定位**: 顶层编排器 — 调度所有子++技能，汇总V1-V5+D6-D11质量门评分
> **触发**: `hohoho` / `Y+` / CEO手动指定模块
> **变更**: v1.0→v2.0: +6扩展维度 / +60条铁律 / +并行Agent执行 / +级联审查机制

---

## §0 元数据

```yaml
name: full-audit-pipeline
version: 2.0
triggers:
  - hohoho              # 全审+修复 (全量11维)
  - hohoho --quick      # 快速模式 (仅V1-V5核心5维)
  - Y+                  # 宪法审查 (V1-V5 + 人工保护检查)
  - 全审 {module}       # 指定模块审计
  - X+                  # BUG猎杀 (盲区++ + 地狱++ + 飞轮++)
前置条件:
  - 已读取 CLAUDE.md
  - 目标模块已确定
  - 对应PRD已存在 (docs/prd/)
  - API服务可运行 (D6-D11实弹测试需要)
后置动作:
  - 输出审计报告 (Markdown表格, 含文件:行号)
  - P0问题立即修复 (GOGOGO)
  - P1问题本轮修复
  - P2问题记录到残留清单
  - 经验沉淀 (新发现的模式→对应++铁律)
联动技能: 业务++ / 页面++ / 盲区++ / 地狱++ / 体验++ / 飞轮++ / 五全++ / RRR
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Inspector** (审查员) | 调度子++扫描，收集各维度评分，发现问题并分级 | Step 1-7 |
| **Executor** (修复者) | 对P0/P1问题执行GOGOGO修复，每次修复后tsc验证 | Step 8 |
| **Verifier** (验证者) | 修复后重新评分，确认≥4.0，级联检查无回归 | Step 9 |

### 角色切换协议
```
Inspector阶段: 只读 + Grep + Glob + Bash(tsc/git)，禁止Edit
Executor阶段: Read + Edit + Bash(tsc验证)，每次Edit后立即tsc
Verifier阶段: 只读 + Bash(tsc + 端点测试)，确认无回归
```

---

## §2 作用域

### 审计范围 (ZUTING五端)

| 端 | 路径 | 页面/路由数 | 关键模块 |
|----|------|-----------|---------|
| API | services/api/src/modules/ (40模块) | 241路由 | holy-site, trip, order, route, review, chat |
| Web | apps/web/src/app/ (66页面) | 66页 | 圣地/路线/行程/社区/商业/价格 |
| Mobile | apps/mobile/app/ (52屏) | 52屏 | 5 tabs + 47功能页 |
| 小程序 | apps/miniprogram/src/pages/ (44页) | 44页 | 核心浏览+社区+商业+消息 |
| Admin | apps/admin/src/pages/ (28页) | 28页 | 内容(7)+运营(8)+社区(4)+AI(5) |

### 排除项
- node_modules/, .next/, dist/, build/, .turbo/
- *.test.ts, *.spec.ts (测试文件单独审计)
- desktop/ (Python桌面应用，独立项目)
- logs/, docker/, .github/

---

## §3 领域规则 — V1~V5 核心维度 + D6~D11 扩展维度

### V1 代码质量 (Code Quality)
```
[FA-V1-01] tsc编译零错误 (全端: web + api + admin + mobile)
[FA-V1-02] 禁止any类型 — 必须定义Interface/DTO (R-01)
[FA-V1-03] 命名规范: PascalCase组件 / camelCase函数 / UPPER_SNAKE枚举 (R-19~R-24)
[FA-V1-04] 死代码清除: 未使用import / 未调用函数 / 注释掉的代码块
[FA-V1-05] 文件大小: 单文件≤500行，超过必须拆分 (组件/工具/常量分离)
[FA-V1-06] 统一导入: 同一模块禁止多路径导入 (如同时import {api}和apiClient)
[FA-V1-07] ESLint清洁: no-unused-vars / no-explicit-any / no-console(生产)
[FA-V1-08] Prisma字段名必须查schema.prisma确认，禁止猜测 (R-59)
```

### V2 功能完整 (Functional Completeness)
```
[FA-V2-01] API连通: 每个页面的数据源API必须可调用返回200
[FA-V2-02] CRUD完整: 列表/详情/创建/编辑/删除 缺一不可 (按PRD)
[FA-V2-03] 状态机: Trip 12状态跳转严格遵循AllowedTransitions (R-07~R-09)
[FA-V2-04] 数据验证: DTO class-validator装饰器齐全 (R-03)
[FA-V2-05] 垂直切片: 页面→组件→API→Controller→Service→Prisma→DB (HH-V01)
[FA-V2-06] 空壳零容忍: 空壳页面/Alert占位/断联组件 → 要么完善要么删除 (HH-V02)
[FA-V2-07] 种子数据: 每个模块的seed.ts必须有≥3条真实数据，API返回非空
[FA-V2-08] QueryKey标准化: 所有useQuery必须使用QUERY_KEYS常量，禁止内联字符串
```

### V3 用户体验 (User Experience)
```
[FA-V3-01] 三态处理: loading/error/empty 每个页面必须有 (HH-E01 Q4)
[FA-V3-02] 响应式: 移动端≤768px布局不破裂，内容可读 (HH-E01 Q5)
[FA-V3-03] i18n: 7语言键值齐全 (zh-CN/en/ja/ko/th/hi/ar含RTL)
[FA-V3-04] 无障碍: 图片有alt, 按钮有aria-label, 颜色对比度≥4.5:1
[FA-V3-05] 交互反馈: 按钮点击→loading态→结果反馈 (toast/跳转/状态变化)
[FA-V3-06] 操作后刷新: 每个mutation.onSuccess必须invalidateQueries (B10)
[FA-V3-07] 暗色主题一致性: 背景/文字/边框在dark mode下可读
[FA-V3-08] 错误状态是UX底线: isLoading + isError + 空态，缺一不可
```

### V4 安全 (Security)
```
[FA-V4-01] JwtAuthGuard: 非@Public()路由必须有Guard (R-63)
[FA-V4-02] IDOR防护: userId参数端点验证访问权限 (R-68)
[FA-V4-03] 输入校验: 所有用户输入必须经过validation pipe (R-03)
[FA-V4-04] 分页限制: findMany必须有take参数, @Max(100) (R-64)
[FA-V4-05] XSS防护: 用户内容输出必须转义, DTO string字段必须@MaxLength
[FA-V4-06] @Roles()必须配合@UseGuards使用，否则装饰器无效 (R-74)
[FA-V4-07] 未认证=401, 已认证无权限=403, 资源不存在=404
[FA-V4-08] 错误响应禁止泄露error.message原文 (可能含schema/表名)
```

### V5 性能 (Performance)
```
[FA-V5-01] Bundle大小: Web首屏JS < 300KB (gzipped)
[FA-V5-02] Lazy Loading: 非首屏组件使用dynamic import / React.lazy
[FA-V5-03] 图片优化: 使用next/image, 适当尺寸, WebP格式, 含width/height
[FA-V5-04] 缓存策略: API响应设置适当Cache-Control / Redis缓存热数据
[FA-V5-05] 数据库: 复杂查询有索引, N+1查询用include/select消除
[FA-V5-06] staleTime分级: 静态内容5min / 列表2min / 详情1min / 实时数据0
[FA-V5-07] 可选依赖: Sentry等可选依赖用运行时字符串拼接+new Function绕过打包器
[FA-V5-08] Promise.allSettled: 多源聚合查询用allSettled，单查询失败不崩整个接口
```

### D6 IDOR渗透检测 (Authorization Penetration)
```
[FA-D6-01] 接受userId/entityId query param的端点必须验证访问权限
[FA-D6-02] 修改操作验证资源归属 + 检查终态 (已完成/已取消不可修改)
[FA-D6-03] 商家端点必须验证merchantId归属 (防跨商家操作)
[FA-D6-04] Admin操作必须有@Roles('ADMIN')，不能仅靠JwtAuthGuard
[FA-D6-05] 收藏/评价/日志的userId必须从req.user取，禁止客户端传入
[FA-D6-06] 分享链接的shareToken必须验证有效性+权限范围
```

### D7 契约漂移检测 (Contract Drift)
```
[FA-D7-01] 前端API prefix必须与后端Controller @ApiTags/@Controller完全匹配
[FA-D7-02] 前端interface字段必须与后端实际响应字段对齐 (非多非少)
[FA-D7-03] 前端枚举值必须与Prisma Schema枚举完全一致 (R-02)
[FA-D7-04] 分页响应: 后端{items,total,page,pageSize} = 前端期望格式 (R-05)
[FA-D7-05] 时间字段统一ISO8601格式 (R-23)
[FA-D7-06] 价格字段单位统一: 后端存分(int)，前端显示时÷100
```

### D8 韧性检测 (Resilience & Chaos)
```
[FA-D8-01] 无界查询防护: findMany必须有take参数，上限100 (防OOM)
[FA-D8-02] 外部HTTP调用必须有超时包装 (≤10s，AI调用≤30s) (R-65)
[FA-D8-03] TOCTOU竞态: 检查+修改必须在$transaction内部 (如签到/领券)
[FA-D8-04] 多源聚合用Promise.allSettled (推荐/统计等非关键查询)
[FA-D8-05] WebSocket连接必须有心跳+自动重连+消息队列防丢
[FA-D8-06] 文件上传: 大小限制 + 类型白名单 + 病毒扫描(如有)
```

### D9 安全深度检测 (Security Depth)
```
[FA-D9-01] XSS: 用户输入存DB前必须sanitize (转义<>&"')
[FA-D9-02] 错误消息泄露: catch块禁止返回error.message原文
[FA-D9-03] SQL注入: 禁止$queryRaw拼接用户输入，必须用参数化
[FA-D9-04] DTO所有string字段必须@MaxLength (ID=64, 短文本=200, 描述=2000, 内容=10000)
[FA-D9-05] 密码/Token禁止日志输出，禁止返回给前端 (HH-S02)
[FA-D9-06] CORS白名单严格限制，禁止通配符 (HH-S03)
```

### D10 状态机运行时 (State Machine Runtime)
```
[FA-D10-01] Trip状态变更必须校验AllowedTransitions (R-07)
[FA-D10-02] 终态(COMPLETED/CANCELLED/REFUNDED)不可再跳转 (R-08)
[FA-D10-03] 状态变更需写审计日志 (R-09)
[FA-D10-04] 订单状态机: PENDING→PAID→COMPLETED/REFUNDED, 各跳转有Guard
[FA-D10-05] 前端状态流转按钮必须与后端AllowedTransitions同步 (禁止前端显示不可用操作)
[FA-D10-06] 状态变更必须发布领域事件 (如trip.statusChanged → 通知/积分/统计)
```

### D11 数据完整性 (Data Integrity)
```
[FA-D11-01] 2+表写操作必须$transaction (原子化)
[FA-D11-02] FK约束: create新记录前必须先创建父记录
[FA-D11-03] @@unique约束: 防止重复数据 (如userId+entityType+entityId)
[FA-D11-04] 幂等操作: findFirst+update/create 替代直接create (防Cron重跑脏数据)
[FA-D11-05] 级联删除: 父记录删除时子记录处理策略明确 (onDelete: Cascade/SetNull)
[FA-D11-06] 种子数据完整: 关联表必须有对应种子，禁止FK悬空引用
```

---

## §4 执行流程

### 4.1 完整模式 (hohoho)

```
Step 0: 环境准备 [Inspector]
  → 读取 CLAUDE.md + 11-项目++系统总索引.md + 对应PRD
  → 确定审计目标 (模块/页面/全量)
  → 确认API服务状态 (D6-D11实弹测试需要)

Step 1: RRR快速预检 (3分钟) [Inspector]
  → 调用 RRR 技能 (8点速查)
  → 输出: P0阻断问题列表
  → 如有P0 → 立即修复后继续

Step 2-3: 核心扫描 — 串行 [Inspector]
  Step 2: 业务++ 扫描
    → 数据服务于目标用户验证 / 五问测试(Q1-Q5) / 竞品对标
    → 输出: BLG评分 + 问题列表
  Step 3: 盲区++ 扫描
    → 死按钮/伪空态/链路断裂/参数空洞/导航可达性/异步反馈
    → 输出: BS评分 + 问题列表

Step 4-6: 深度扫描 — 并行Agent [Inspector]
  ┌─ Agent A: 地狱++ 扫描
  │   → IDOR/Guard/事务/状态机/DTO/韧性/XSS/泄露
  │   → 输出: HELL评分
  ├─ Agent B: 体验++ 扫描
  │   → 三态/响应式/i18n/感知/无障碍/导航/性能感知
  │   → 输出: UX评分
  └─ Agent C: 飞轮++ 扫描
      → CRUD闭环/状态机闭环/交易闭环/UGC闭环/事件链/数据一致
      → 输出: FW评分

Step 7: 五全++ 扫描 (跨端) [Inspector]
  → Web/Mobile/Mini/Admin/API数据一致性
  → API契约/类型共享/数据展示/功能覆盖/配置共享
  → 输出: FF评分

Step 8: 汇总 + 修复 [Executor]
  → 汇总V1-V5 + D6-D11评分
  → P0问题: 立即GOGOGO修复 (每次修复后tsc验证)
  → P1问题: 本轮修复
  → P2问题: 记录到残留清单
  → ⚠️ 单次修复≤30文件 (B-02)，超过拆分多次commit

Step 9: 验证 + 报告 [Verifier]
  → tsc编译验证 (web + api)
  → 重新评分确认核心维度≥4.0
  → 级联检查: 修复是否引入新问题
  → 输出最终审计报告
```

### 4.2 快速模式 (hohoho --quick)

```
Step 0: RRR预检 (3分钟)
Step 1: V1-V5核心扫描 (tsc/Guard/三态/i18n/空壳)
Step 2: 修复P0/P1 → tsc验证
Step 3: 输出简报
```

### 4.3 BUG猎杀模式 (X+)

```
Step 0: RRR预检
Step 1: 盲区++ 重点扫描 (死按钮/断链/伪空态)
Step 2: 地狱++ 安全速查 (IDOR/Guard/DTO)
Step 3: 飞轮++ 闭环验证 (mutation→invalidate→刷新)
Step 4: 修复 → tsc验证 → commit
```

### 4.4 并行Agent执行策略

```
最优分配策略 (经验值):
┌─────────────────────────────────────────────────┐
│ 串行阶段 (有依赖):                               │
│   RRR(3min) → 业务++(依赖PRD) → 盲区++(依赖业务) │
├─────────────────────────────────────────────────┤
│ 并行阶段 (无依赖):                               │
│   Agent A: 地狱++ (安全维度)                      │
│   Agent B: 体验++ (UX维度)                        │
│   Agent C: 飞轮++ (闭环维度)                      │
├─────────────────────────────────────────────────┤
│ 收束阶段:                                        │
│   五全++ (需要前序所有结果) → 汇总修复 → 验证     │
└─────────────────────────────────────────────────┘

多模块全审时的分路策略:
  Web 66页 → 按域拆分5路Agent:
    路A: 核心内容 (圣地/祖庭/祖师/信仰/印) 12页
    路B: 路线行程 (路线/行程/套餐/结账) 8页
    路C: 社区 (攻略/问答/排行/照片墙/日志) 10页
    路D: 商业 (订单/会员/积分/促销/价格) 16页
    路E: 用户+其他 (登录/消息/搜索/地图/AI) 20页
```

---

## §5 评分机制

### 5.1 维度权重

| 维度 | 权重 | 说明 |
|------|------|------|
| V1 代码质量 | 1.0 | 基础门槛，不达标全盘否 |
| V2 功能完整 | 1.2 | 垂直切片完整性，最重要 |
| V3 用户体验 | 1.0 | 三态/i18n/响应式 |
| V4 安全 | 1.5 | 安全问题权重最高 |
| V5 性能 | 0.8 | 大版本才强制要求 |
| D6 IDOR渗透 | 1.5 | 同V4安全权重 |
| D7 契约漂移 | 1.0 | 跨端一致性基础 |
| D8 韧性 | 0.8 | 生产稳定性 |
| D9 安全深度 | 1.2 | XSS/注入/泄露 |
| D10 状态机 | 1.0 | Trip核心业务 |
| D11 数据完整 | 1.0 | 事务/幂等/约束 |

### 5.2 通过阈值

| 阶段 | 必过门 | 阈值 |
|------|--------|------|
| 开发中 | V1 | ≥4.0 |
| Commit | V1 + V2 | ≥4.0 每维 |
| PR | V1 + V2 + V3 | ≥4.0 每维 |
| 发版 | V1-V4 + D6 + D9 | ≥4.0 每维 |
| 大版本 | V1-V5 + D6-D11 | ≥4.0 每维 |

### 5.3 评分进阶路径 (经验值)

```
3.0→3.5: 消除tsc错误 + any类型 + 死代码
3.5→4.0: 补全Guard/IDOR + 三态处理 + i18n
4.0→4.3: QueryKey标准化 + mutation闭环 + 响应式
4.3→4.6: 契约对齐 + $transaction + 状态机保护
4.6→4.8: staleTime分级 + allSettled韧性 + 无障碍
4.8→5.0: 全维度无残留 + 性能优化 + 竞品对标领先
```

### 5.4 输出报告模板

```markdown
## 全审报告 — {模块名} ({日期}) v2.0

### 核心维度
| 维度 | 评分 | 状态 | 关键问题 |
|------|------|------|---------|
| V1 代码质量 | ⭐⭐⭐⭐☆ 4.2 | ✅ PASS | - |
| V2 功能完整 | ⭐⭐⭐⭐⭐ 4.8 | ✅ PASS | - |
| V3 用户体验 | ⭐⭐⭐☆☆ 3.5 | ⚠️ PARTIAL | i18n缺3个key |
| V4 安全 | ⭐⭐⭐⭐☆ 4.0 | ✅ PASS | - |
| V5 性能 | ⭐⭐⭐⭐☆ 4.1 | ✅ PASS | - |

### 扩展维度
| 维度 | 评分 | 状态 | 关键问题 |
|------|------|------|---------|
| D6 IDOR渗透 | ⭐⭐⭐⭐☆ 4.0 | ✅ PASS | - |
| D7 契约漂移 | ⭐⭐⭐⭐⭐ 4.5 | ✅ PASS | - |
| D8 韧性 | ⭐⭐⭐☆☆ 3.8 | ⚠️ PARTIAL | 2处无超时包装 |
| D9 安全深度 | ⭐⭐⭐⭐☆ 4.2 | ✅ PASS | - |
| D10 状态机 | ⭐⭐⭐⭐⭐ 5.0 | ✅ PASS | - |
| D11 数据完整 | ⭐⭐⭐⭐☆ 4.3 | ✅ PASS | - |

### 综合评分
| 指标 | 值 |
|------|-----|
| 加权平均 | **4.22** |
| 最低维度 | V3 3.5 ⚠️ |
| 状态 | **⚠️ PARTIAL** (V3未达标) |

### 问题清单
| # | 级别 | 维度 | 描述 | 文件:行号 | 状态 |
|---|------|------|------|----------|------|
| 1 | P0 | V4 | 缺少JwtAuthGuard | api/src/modules/xxx/xxx.controller.ts:45 | 🔴 修复中 |
| 2 | P1 | V3 | empty态未处理 | web/src/app/xxx/page.tsx:120 | 🟡 待修 |
| 3 | P1 | D7 | 前端缺少transport字段 | web/src/lib/api.ts:55 | 🟡 待修 |
| 4 | P2 | D8 | 外部调用无超时 | api/src/modules/xxx/xxx.service.ts:88 | 🔵 记录 |

### 残留项 (P2, 下轮处理)
- [ ] D8: xiaohong AI调用增加30s超时
- [ ] V5: 图片组件缺少width/height优化
```

---

## §6 工具治理

```
允许工具:
  - Grep: 搜索代码模式 (any类型/缺失Guard/死代码/硬编码)
  - Read: 精读文件 (offset+limit, ≤200行/次)
  - Glob: 文件发现 (按模式匹配)
  - Bash: tsc编译 / git status / curl端点测试
  - Edit: 修复代码 (Executor阶段)
  - Agent: 并行子++扫描 (每Agent单一职责, ≤1个文件域)

检测命令速查:
  # V1 代码质量
  tsc零错(API):   cd services/api && npx tsc --noEmit
  tsc零错(Web):   cd apps/web && npx tsc --noEmit
  any扫描:        Grep ": any" --glob "*.ts" --glob "*.tsx"
  死import:       Grep "^import .* from" → 对比使用处

  # V4/D6 安全
  Guard覆盖:     Grep "@Public|JwtAuthGuard|@UseGuards" --glob "*.controller.ts"
  Roles匹配:     Grep "@Roles" --glob "*.controller.ts"
  IDOR检测:       Grep "req.query\.|req.params\." → 检查是否验证归属

  # V3 体验
  i18n完整:      对比 zh-CN.json vs en.json 的key集合
  硬编码中文:    Grep "[\u4e00-\u9fff]" --glob "*.tsx" (排除i18n文件)
  三态检查:      Grep "loading|isLoading|error|isError|empty" 每个页面

  # D7 契约漂移
  API路径匹配:   对比前端fetch URL vs 后端@Controller+@Get/@Post
  类型对齐:      对比前端interface字段 vs 后端select/include

  # D8 韧性
  无界查询:      Grep "findMany" → 检查是否有take
  超时检查:      Grep "fetch\(|axios\.|http\." → 检查timeout

  # D10 状态机
  状态跳转:      Grep "AllowedTransitions|updateStatus" → 验证Guard
  终态保护:      Grep "COMPLETED|CANCELLED|REFUNDED" → 检查不可变

  # D11 数据完整
  事务检查:      Grep "\$transaction" → 匹配2+表写操作
  幂等检查:      Grep "findFirst.*update|upsert" → 验证幂等模式
```

---

## §7 生命周期

```
L1 触发: hohoho/Y+/X+/CEO指令 → 读取目标模块 + PRD
L2 执行:
   L2a 串行预检: RRR → 业务++ → 盲区++ (有依赖链)
   L2b 并行深扫: 地狱++ ‖ 体验++ ‖ 飞轮++ (Agent并行)
   L2c 收束汇总: 五全++ → 合并评分
L3 输出: 审计报告(Markdown) + 问题清单(按P0/P1/P2分级, 含文件:行号)
L4 反馈:
   P0 → 立即修→tsc验证→级联检查→重新评分
   P1 → 本轮修→commit
   P2 → 记录到残留清单
L5 沉淀:
   新发现的模式 → 写入对应++铁律 (版本号+1)
   经验教训 → 更新本文档相关Section
   评分基线 → 记录模块评分历史,跟踪趋势
```

---

## §8 铁律清单

### 核心铁律 (FA-01~FA-15)
```
[FA-01] 审计前必须先读PRD，无PRD的模块先补PRD再审 (SCP-03)
[FA-02] 各维度独立评分，不因某维度优秀而放过其他维度
[FA-03] P0问题必须当场修复，不允许标记"待修"后跳过
[FA-04] 修复后必须tsc验证，编译不过的修复等于没修
[FA-05] 人工修改保护: CEO指示的改动 > AI判断 (HE-01)
[FA-06] 单次审计≤30文件修改，超过拆分多次commit (B-02)
[FA-07] 审计报告必须包含具体文件路径和行号
[FA-08] 子++评分有分歧时，取保守值(较低分)
[FA-09] 全审不等于重构，只修问题不改风格
[FA-10] 新发现的反模式必须回写到对应++的铁律中
[FA-11] 并行Agent执行时，每次修复后tsc验证 (防交叉冲突)
[FA-12] Inspector阶段禁止Edit，先全量扫描再集中修复
[FA-13] 级联检查: 修复A文件后检查引用A的所有文件是否受影响
[FA-14] API前缀对齐必须在正式审计前完成 (否则D7/D6全面误判)
[FA-15] 评分报告中每个扣分项必须附带修复建议 (不能只报问题不给方案)
```

### 扩展铁律 — 契约与连通 (E-FA2-01~E-FA2-06)
```
[E-FA2-01] 前端API fetch路径必须与后端Controller路径完全匹配
[E-FA2-02] API实弹测试URL必须包含必需参数 (缺参→404误判)
[E-FA2-03] SWC编译通过不等于tsc通过 — 以tsc为准
[E-FA2-04] DB连接失败先验证密码/端口 (docker exec确认), 再查代码
[E-FA2-05] 11维最优顺序: tsc→业务→盲区→(地狱‖体验‖飞轮)→五全→修复→验证
[E-FA2-06] 评分进阶三阶段: 基础修复(→4.0)→标准化(→4.5)→竞品领先(→5.0)
```

### 扩展铁律 — 数据与查询 (E-TA-01~E-TA-06)
```
[E-TA-01] 数组返回API必须null guard: `?? []` (404返回null, 数组方法直接crash)
[E-TA-02] Dead UI按钮必须有真实handler或disabled+tooltip"功能开发中"
[E-TA-03] 跨角色Controller端点必须验证@Roles覆盖所有合法调用角色
[E-TA-04] any类型消除优先用interface替代，不是`as unknown as X`
[E-TA-05] 多模块全审分5路Agent并行 (按业务域划分, 非按文件数均分)
[E-TA-06] 商家/Admin共享页面的@Roles必须包含所有访问角色
```

### 扩展铁律 — 业务与闭环 (E-WA-01~E-WA-08)
```
[E-WA-01] 垂直切片末端回写需要DB状态变更, 不能只invalidateQueries
[E-WA-02] 移动端useFocusEffect: A→B→A导航必须refetch
[E-WA-03] Mobile列表必须有RefreshControl三件套 ({refetch, isRefetching} + 组件)
[E-WA-04] staleTime分级: 静态内容5min / 列表2min / 详情1min / 实时0
[E-WA-05] 状态机导航守卫: 前端按钮可见性必须与AllowedTransitions同步
[E-WA-06] 三问测试: Q1目标用户? Q2帮做什么决策? Q3去掉会变差? 答不上=不属于该页面
[E-WA-07] 系统参数不暴露终端用户 (内部ID/配置值/调试信息)
[E-WA-08] 非空断言`!`→可选链`?.` (运行时崩溃风险)
```

---

## §9 联动点

### 9.1 调用矩阵

| 方向 | 技能 | 接口 | 输入 | 输出 |
|------|------|------|------|------|
| 调用→ | RRR | Step 1 预检 | 目标模块路径 | P0列表 + 8点速查分 |
| 调用→ | 业务++ | Step 2 | PRD + 代码 | BLG评分 + 五问结果 |
| 调用→ | 盲区++ | Step 3 | 前序问题列表 | BS评分 + 8维缺陷列表 |
| 调用→ | 地狱++ | Step 4 (并行A) | Controller/Service | HELL评分 + 安全缺陷 |
| 调用→ | 体验++ | Step 5 (并行B) | 页面组件 | UX评分 + 三态/i18n缺陷 |
| 调用→ | 飞轮++ | Step 6 (并行C) | Service/Event | FW评分 + 闭环缺陷 |
| 调用→ | 五全++ | Step 7 | 全端代码 | FF评分 + 跨端差异 |
| ←触发 | CLAUDE.md | hohoho/Y+/X+ | 指令 | 启动全审流水线 |
| →输出 | 审计报告 | Step 9 | 全维度评分 | Markdown报告 |
| →沉淀 | 对应++ | L5 | 新模式/铁律 | 更新++版本号 |

### 9.2 级联审查协议

```
发现问题 → 检查影响范围:
  1. 同文件内: 该函数的所有调用者
  2. 同模块内: import该文件的所有文件
  3. 跨模块: API契约变更→检查所有消费端
  4. 跨端: Schema变更→检查Web/Mobile/Mini/Admin是否同步

修复级联验证:
  修复Controller → 检查Service是否一致
  修复Service → 检查DTO是否匹配
  修复DTO → 检查前端interface是否对齐
  修复前端类型 → 检查所有使用该类型的组件
```

### 9.3 自动升级触发

```
当核心5维全≥4.3 → 自动启动D6-D11扩展维度扫描
当发现1个IDOR → 自动全codebase扫描所有userId/entityId参数端点
当发现1个契约漂移 → 自动扫描同模块所有前后端接口对
当发现1个缺失$transaction → 自动扫描所有多表写操作
```

---

## §10 特殊机制 (v2.0新增)

### 10.1 TOCTOU竞态防护模式
```typescript
// ❌ 错误: 检查与修改分离, 高并发下可重复领取
const user = await prisma.user.findFirst({ where: { id, dailyClaimed: false } });
if (user) {
  await prisma.pointsTransaction.create({ data: { userId: id, amount: 10 } });
  await prisma.user.update({ where: { id }, data: { dailyClaimed: true } });
}

// ✅ 正确: 检查+修改在$transaction内, 原子化
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findFirst({ where: { id, dailyClaimed: false } });
  if (!user) throw new ConflictException('Already claimed');
  await tx.pointsTransaction.create({ data: { userId: id, amount: 10 } });
  await tx.user.update({ where: { id }, data: { dailyClaimed: true } });
});
```

### 10.2 契约归一化层模式
```typescript
// 当后端响应与前端期望不一致时, 用normalize层桥接
// ❌ 错误: 前端直接使用后端原始响应 (字段名/嵌套层级不匹配)
// ✅ 正确: 在api.ts中添加normalize函数

// 后端返回: { data: { averageRating, reviewCount }, statistics: {...} }
// 前端期望: { averageRating, totalCount, distribution }
function normalizeReviewStats(raw: ApiReviewStats): ReviewStats {
  return {
    averageRating: raw.data.averageRating,
    totalCount: raw.data.reviewCount,
    distribution: raw.statistics?.distribution ?? {},
  };
}
```

### 10.3 Dead UI检测模式
```
检测方法:
  1. Grep所有onClick/onPress → 检查handler是否为空函数/undefined
  2. Grep所有<button>/<TouchableOpacity> → 检查是否有事件绑定
  3. Grep所有href="#" → 检查是否有真实导航目标
  4. 对比: 按钮总数 vs 有效handler数 → 差值>0即Dead UI

修复策略:
  - 有真实功能但未实现 → disabled + tooltip "功能开发中"
  - 装饰性无功能 → 移除交互元素, 改为纯展示
  - 导航已删除的页面 → 更新或移除链接
```

### 10.4 事件链四环闭合验证
```
事件驱动架构必须验证四环缺一不可:
  环1: 定义 — 事件常量定义 (如 TRIP_STATUS_CHANGED)
  环2: 注入 — EventBusService注入到Service (import常量≠注入服务)
  环3: 发布 — service方法中调用 eventBus.publish(event)
  环4: 消费 — @OnEvent消费者注册并处理

检测: Grep事件常量定义数 vs publish调用数 vs @OnEvent数
  三者不等 → 事件链断裂
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-04-06 | 从作业郎v3.3移植，基础§0-§9骨架，V1-V5各5条规则 |
| v2.0 | 2026-04-06 | 深度升级: +D6-D11扩展6维(36条) / V1-V5扩展至8条(40条) / +铁律FA-11~15+E-FA2+E-TA+E-WA(29条) / +并行Agent策略 / +级联审查协议 / +自动升级触发 / +4个特殊机制(TOCTOU/归一化/DeadUI/事件链) / +评分权重+进阶路径 / +报告模板v2 |
