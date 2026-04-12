# 天查++ (Tian-Cha Plus Plus) v1.0

> **代号**: 天查++ | **版本**: v1.0 | **创建**: 2026-04-12 | **移植自**: 作业郎 天查++ v1.0 (2026-04-07 首次定义)
> **定位**: 全维度代码审查框架 — 5 层 × 18 维 × 1 命令
> **哲学**: 广扫 → 深追 → 反查 → 漂移 → 启发
> **触发**: `天查++ {target}` / `天查++ {端}` / `天查++ + 全审++ {端}` (双跑)

---

## §0 元数据

```yaml
name: tian-cha-plus-plus
version: 1.0
triggers:
  - 天查++ {target}            # 单模块/目录/端
  - 天查++ {端}                # web / admin / mobile / api
  - 天查++ + 全审++ {端}       # 双跑 — 天查先跑出代码健康基线
前置条件:
  - {target} 已存在于 E:/ZUTING/
  - CLAUDE.md + 本技能已读
后置动作:
  - 输出 5 层 × 18 维矩阵 + P0/P1/P2 修复清单
  - FAIL → 阻断,必须修复复跑
  - 与全审++ 双跑时,天查++ 先跑
联动: 全审++ (互补双跑) / 地狱++ (F3 引用) / 飞轮++ (T2 引用) / 盲区++ (G3 引用) / AT++ (A5 契约)
```

---

## §1 角色定位 — 与全审++ 的互补

| 体系 | 层数 | 定位 | 与天查++ 关系 |
|------|------|------|---------------|
| **天查++** | 5 层 × 18 维 | **代码级排查方法总成** | 本体 |
| **全审++** (FA) | V1-V5 + D6-D11 共 11 维 | 商用就绪 + 多端商用审查 | **双跑互补**: 全审出商用结论,天查出代码健康 |
| **地狱++** | 8 维 | 安全/状态机/极限压测 | 天查 F3 (污点) 可引用 |
| **飞轮++** | 6 维 | 跨系统因果闭环 | 天查 T2 (DFS) 可引用 |
| **盲区++** | 8 维 | 用户旅程仿真 | 天查 G3 (可达性) 可引用 |
| **AT++** | 5 驱动 × 7 旅程 | 真实全链路测试 | 天查 L4 (契约漂移) 输入 AT++ A5 断言 |

**双跑规则**: 高风险模块 (认证/支付/状态机/管理后台) **必须** 天查++ + 全审++ 双跑。天查先跑,代码健康达 ≥4.0 才允许进入全审商用评审。

---

## §2 五层 18 维矩阵

### L1 拓扑层 (Topology) — 有什么、什么连什么

| 维度 | 工具/方法 | 目的 | ZUTING 实例 |
|------|----------|------|-------------|
| **T1 BFS 广度横扫** | `glob/grep` 全量清单 | Page/Controller/Service/Model 总数 | apps/admin/src/pages 28 页;services/api modules 43 |
| **T2 DFS 深度追链** | 从入口逐层追至 DB | 业务流闭环 | 下单页 → OrdersPage → apiClient → OrdersController → OrdersService → Prisma → orders 表 |
| **T3 拓扑排序** | import 依赖链 | 编译顺序 / 循环依赖 | packages/shared-types → api-client → apps/** |
| **T4 SCC 强连通** | Tarjan 算法 | 循环依赖簇 (module 级) | NestJS module circular dep (Prisma enum Swagger PIT-004) |

### L2 图论层 (Graph)

| 维度 | 工具/方法 | 目的 | ZUTING 实例 |
|------|----------|------|-------------|
| **G1 Call Graph** | 正向调用链 | 谁调用谁 / 覆盖率 | `xiaohong.service.chat` → `llm.provider.stream` |
| **G2 Reverse Call** | 反向引用 | **dead code / 孤儿页** 检测 | 哪些 apps/admin/src/pages 未在 routes 注册 |
| **G3 Shortest Path** | 入口 → 目标 ≤3 步 | 导航可达性 | Header → AdminLayout menu → 功能页 |
| **G4 Critical Path** | 热路径长度 | 性能瓶颈链 | 搜索热路径 / 小鸿 AI SSE 链路 |

### L3 流分析层 (Flow)

| 维度 | 工具/方法 | 目的 | ZUTING 实例 |
|------|----------|------|-------------|
| **F1 Data Flow** | 变量传播追踪 | **FALLBACK 污染** / 空值扩散 | `data?.items ?? []` 的传播,undefined → UI |
| **F2 Control Flow** | 分支覆盖 | 状态机全分支 | Trip 12 状态 AllowedTransitions 全覆盖 |
| **F3 Taint 污点** | 源→汇 分析 | **IDOR / XSS / Prompt 注入** | userId param → Service → prisma.where 是否带 ownership |
| **F4 AST 模式** | ESLint/自动规则 | R-64/R-68/R-74 等自动匹配 | @Roles 无 @UseGuards;findMany 无 take |

### L4 漂移层 (Differential)

| 维度 | 工具/方法 | 目的 | ZUTING 实例 |
|------|----------|------|-------------|
| **D1 PRD ↔ 代码** | 对比 PRD SSOT | **业务漂移** (缺实现/伪实现) | docs/prd/M40-*.md 与 apps/admin 现状差距 |
| **D2 DTO ↔ Schema** | Prisma 对照 | **字段漂移** | DTO 字段类型 ≠ schema.prisma (TS-01) |
| **D3 前端 API ↔ 后端路由** | apiClient/m40.ts vs controller | **契约漂移** (路径/参数/响应) | /api/xxx 前端调用 vs @Controller 实际路径 |
| **D4 Bisection 二分** | `git bisect` | 回归 commit 定位 | 5Wave 升级后某模块回归的触发 commit |

### L5 启发层 (Heuristic)

| 维度 | 工具/方法 | 目的 | ZUTING 实例 |
|------|----------|------|-------------|
| **H1 关键词扫描** | grep `Alert\|TODO\|MOCK\|FALLBACK\|@ts-ignore\|as any\|祖庭\|朝圣` | hack/空壳/旧品牌残留 | 品牌升级后旧词残留 |
| **H2 分层抽样** | 随机抽样 + 大库摸底 | 超大代码库快速诊断 | 300 holy-sites seed 抽 5% 验证字段完整性 |

---

## §3 执行流程

```
Step 0  目标解析: {target} = 页面 / 模块 / 端 (web/admin/mobile/miniprogram/api) / 全项目
Step 1  L1 拓扑扫描   (BFS/DFS/SCC)           → 清单 + 孤儿 + 循环
Step 2  L2 图论分析   (Call Graph/Reverse/导航) → dead code + 可达性
Step 3  L3 流分析     (数据流/控制流/污点)     → 空值传播 + 状态机 + 安全
Step 4  L4 漂移差分   (PRD/DTO/契约)          → 漂移清单
Step 5  L5 启发扫描   (关键词/抽样)            → hack/空壳/TODO/旧品牌
Step 6  汇总评分 + 报告 + P0/P1/P2 修复建议
```

**并行优化**: L1 + L5 可并行 (BFS/grep 相互独立);L2 + L3 + L4 需要 L1 清单作为输入,顺序执行。推荐 2 个 Agent 分两批并行 (L1+L5 一批, L2+L3+L4 一批)。

---

## §4 退出条件

| 结论 | 条件 | 动作 |
|------|------|------|
| ✅ **PASS** | 5 层全绿,综合 ≥4.0/5.0,P0=0 | 出通过报告 |
| ⚠️ **PARTIAL** | ≥1 层告警,P0 ≤2 | 出报告 + 修复建议,允许继续 |
| ❌ **FAIL** | ≥2 层红 或 P0 >2 | **阻断**,必须修复后复跑 |

---

## §5 报告模板

```markdown
# 天查++ 审查报告: {target}

**扫描时间**: {ts} | **目标**: {N 页 + N controller + N service + N hook}
**结论**: {PASS/PARTIAL/FAIL} ({score}/5.0) — {一句话摘要}

## §1 五层 18 维结果矩阵
| 层 | 维度 | 结果 | P0 | P1 | P2 |
|----|------|------|----|----|----|
| L1 | T1 BFS | ✅/⚠️/❌ | 0 | 0 | 0 |
| L1 | T2 DFS | ... |
| L2 | G1 Call | ... |
| ... |

## §2 P0 必修 (阻断)
1. {文件:行号} — {问题} — {可执行修复建议}

## §3 P1 应修 (1 周内)
## §4 P2 可优化
## §5 修复后复跑命令
  天查++ {target}
```

---

## §6 铁律 (TC-01 ~ TC-07)

```
[TC-01] 天查++ 必须跑完 5 层,禁跳层 (跳层必须标 "L4 跳过: 原因")
[TC-02] 报告必须含 P0/P1/P2 三级分类 + 文件:行号精确定位
[TC-03] P0 必须给可执行修复建议 (非"需进一步调查")
[TC-04] 与全审++ 双跑时,天查++ 先跑 (出代码健康基线)
[TC-05] 孤儿页 / dead code 必须列完整路径 + 反向引用证据
[TC-06] 漂移层 (L4) 发现 PRD↔代码 不一致时,以 PRD 为 SSOT (除非人工标注)
[TC-07] 禁止在天查++ 执行中做修复 (职责分离: 天查=诊断,修复=另跑命令 / 人工)
```

---

## §7 调用示例

```
天查++ admin                        → 管理后台全扫 (28 页)
天查++ apps/admin/src/pages/ai      → 限定目录深扫
天查++ services/api/src/modules/auth → 认证模块深扫 (高危域)
天查++ + 全审++ admin               → 双跑 (天查先,全审后)
天查++ + 地狱++ 支付                → 高危域双跑 (天查 F3 + 地狱 H1-H8)
```

---

## §8 ZUTING 适配要点

1. **多端扫描**: ZUTING 有 5 端 (web/admin/mobile/miniprogram/api),L1 BFS 必须列出每端的页数/模块数;L2 G2 反向引用必须跨端校验(e.g. api-client 被哪些端消费)
2. **PRD 基线**: docs/prd/ 65+ 份 PRD 是 L4 D1 的 SSOT;天查++ 扫到"PRD 有而代码无"必须标 P0/P1
3. **TS-01~03 链**: L4 D2 必须校验 Schema → DTO → Service → Admin 前端 → Web 前端 完整链路
4. **Pit 回归**: L5 H1 关键词扫描必须包括 PIT Registry 的 7 条坑 (NODE_NO_COMPILE_CACHE / 旧品牌词 / bind mount / msys 路径 ...)
5. **i18n 覆盖**: L1 T1 必须统计硬编码中文字符串数 (Admin 当前是重灾区)

---

## §9 历史命中

| 日期 | 目标 | 结论 | 备注 |
|------|------|------|------|
| 2026-04-12 | 移植自作业郎 | 技能初始化 | 本文档 |

---

## 附录 A — 与 AT++ / 全审++ 的编排

```
高风险域标准流程 (认证/支付/管理后台):
  Step 1. 天查++ {target}                  (代码健康基线)
  Step 2. 若 PASS → 全审++ {target}         (商用就绪)
  Step 3. 若商用 PASS → AT++ --journey {n}  (真实旅程验证)
  Step 4. 全绿 → 允许 P+/PUSH++ 发版

低风险域快速流程:
  Step 1. RRR {target}       (3 分钟速查)
  Step 2. 过即发
```
