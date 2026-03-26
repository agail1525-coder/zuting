# Heartbeat Daemon v4.0 — 智能自愈建设引擎

## Context
v3.0运行3.1小时完成55+任务(17.8/h)，但暴露5个关键Bug：completed-history.json嵌套损坏(PowerShell `@()+=@{}` 产生 `value/Count` 包裹层)、完成任务不清理pending-tasks.json、状态文件滞后18分钟、无.gitattributes致98文件CRLF误判、并发commit归属文件错乱。同时对比ZYL D1发现10项能力差距。v4.0目标：修复所有Bug + 关闭高价值差距 + 新增自愈智能。

## 目标文件
`E:\ZUTING\scripts\heartbeat-daemon.ps1` (单文件，当前850行→预计~1070行)

---

## Phase A: 关键Bug修复 (+75行)

### A1. 修复completed-history.json嵌套损坏
**根因**: `Add-CompletedHistory` 用 `@(Get-CompletedHistory) += @{...}` → PowerShell将hashtable包裹为`{value:[], Count:N}`嵌套对象。

**新函数: `Repair-CompletedHistory`** (~20行)
- 递归遍历`value`属性链，提取有`id`+`completedAt`属性的叶节点
- 去重后写回扁平数组
- 启动时调用一次(一次性修复)

**修改函数: `Add-CompletedHistory`** (6行→12行)
- 用 `[System.Collections.ArrayList]` 代替 `@()+=`
- 新条目用 `[PSCustomObject]@{...}` 代替 `@{...}`
- `ConvertTo-Json -Depth 10`

**修改函数: `Get-CompletedHistory`** (6行→8行)
- 显式cast为 `[array]` of `[PSCustomObject]`

### A2. 完成任务清理pending-tasks.json
**新函数: `Remove-CompletedFromPending`** (~10行)
- 读取pending-tasks.json，过滤掉已完成/已失败ID，写回
- 在 `Add-CompletedHistory` 之后立即调用

### A3. 状态文件实时更新
**修改**: 在3处新增 `Save-DaemonState` 调用:
- 任务完成后(harvest成功分支)
- 任务失败后(harvest失败分支)
- VERIFY阶段完成后
- +3行

### A4. 创建.gitattributes规范化行尾
**新函数: `Initialize-GitAttributes`** (~18行)
- 检查 `.gitattributes` 是否存在
- 不存在则创建: `* text=auto eol=lf` + `*.ps1 text eol=crlf`
- `git add .gitattributes && git commit`
- 启动时调用一次

### A5. 修复并发commit文件归属错乱
**修改函数: `Invoke-SelectiveCommit`** (+15行)
- 新增 `$AppScope` 参数
- 新增 `$AppPathMap` 映射: api→`services/api/`, web→`apps/web/`, admin→`apps/admin/`, mobile→`apps/mobile/`, miniprogram→`apps/miniprogram/`, verify→`""`, packages→`packages/`
- `$newFiles` 二次过滤：只保留属于该app路径下的文件
- `packages/` 共享目录：归属给首个检测到变更的任务

---

## Phase B: 关闭D1差距 (+51行)

### B1. VERIFY阶段补全miniprogram (+3行)
- 在 `$verifyPrompt` 中增加 `cd apps/miniprogram && npx tsc --noEmit`
- 确保五端全覆盖

### B2. BUILD阶段确定性构建验证后缀 (+10行)
**新变量: `$BuildVerifySuffix`** (hashtable)
```
api          → "cd services/api && npx tsc --noEmit"
web          → "cd apps/web && npx tsc --noEmit"
admin        → "cd apps/admin && npx tsc --noEmit"
mobile       → "cd apps/mobile && npx tsc --noEmit"
miniprogram  → "cd apps/miniprogram && npx tsc --noEmit"
```
- 替换 `$IronRulesInjection` 中的条件列表为确定性后缀
- 每个任务prompt附加其app对应的精确验证命令

### B3. MaxConcurrency 3→5 + 自适应系统监控 (+13行)
**修改**: `$Config.MaxConcurrency = 5`
**新函数: `Test-SystemCapacity`** (~12行)
- 检查可用内存 > 2GB + CPU < 80%
- 在ramp-up决策前调用，系统压力大则暂缓提升并发
- 使用 `Get-CimInstance Win32_OperatingSystem` 和 `Get-CimInstance Win32_Processor`

### B4. 丰富Dashboard (+18行)
**新函数: `Show-Dashboard`** (~25行，替换7行内联代码)
- 进度条: `[████░░░░] 4/8`
- 按app统计: api(3/5) web(2/4) admin(1/2) mobile(2/3) mini(1/2)
- 吞吐率: 17.8 tasks/hour
- 累计: 完成/失败/限流/运行时长

### B5. API优先排序 (+5行)
- 任务排序增加app权重: api=0, packages=1, web/admin/mobile/miniprogram=2
- 确保后端修复先于前端（前端可能依赖API变更）

### B6. Cooldown修正 (+2行)
- `$Config.PostTaskCooldown` 实际未使用(dispatch间隔硬编码5s)
- 替换为 `$Config.InterDispatchDelay = 10`
- `Start-Sleep -Seconds $Config.InterDispatchDelay`

---

## Phase C: 新增自愈智能 (+78行)

### C1. 任务价值评分 — 避免浪费配额 (+18行)
**新函数: `Measure-TaskValue`**
- P0(崩溃/安全)=100, P1(功能)=70, P2(UX)=40, P3(新功能)=20
- app=="api" 加分+20（API修复级联价值高）
- 与失败模式匹配减分-30
- 过滤 score < `$Config.MinTaskScore` (默认30)
- 在 `Parse-TasksFromOutput` 之后调用

### C2. 失败模式记忆 — 跳过必败任务 (+15行)
**新函数: `Test-FailurePattern`**
- 解析failed-tasks.json，提取 `{app}-{action}` 前缀模式
- 同模式24h内3+次失败 → 跳过该模式的新任务
- 日志: "Skipping {id}: pattern {app}-{action} has {N} recent failures"

### C3. 状态文件自愈 (+15行)
**新函数: `Test-StateIntegrity`**
- 每轮cycle开始时验证所有JSON状态文件
- 解析失败 → 备份为 `.corrupt.bak` + 从零重建
- 验证结构: completed-history必须是数组、state必须有TotalTasksCompleted等键

### C4. 配额守卫 — 主动防限流 (+15行)
**新函数: `Get-QuotaStatus`**
- 维护 `$InvocationTimestamps` 滚动窗口
- 计算5分钟内调用率
- 超过 `$Config.MaxInvocationsPerWindow = 15` → 注入冷却
- 在dispatch前调用，预防burst触发静默限流

**新Config**: `MaxInvocationsPerWindow = 15`, `InvocationWindowSeconds = 300`

### C5. 输出质量门禁 — 拒绝垃圾代码 (+15行)
**新函数: `Test-OutputQuality`**
- 正则扫描build日志中的质量红旗:
  - `// TODO` / `// FIXME` 超过3处
  - `console.log` (调试语句)
  - `: any` (违反R-01)
  - `catch\s*\{\s*\}` (空catch块)
- 质量门禁失败 → 标记任务失败，不commit
- 在task完成后、commit前调用

---

## Phase D: 打磨 (+15行)

### D1. 版本号更新
- 所有 "v3.0" → "v4.0"
- Banner更新: 增加 "Value Scoring | Quality Gate | Self-Healing"

### D2. 输出分类优先级链 (+5行)
重排harvest循环的检测顺序为严格优先级:
1. Rate limit (显式) → Wait-ForRateLimit
2. Auth error → Auth retry
3. Suspicious output → Wait-ForRateLimit
4. Job.State == Failed → 记录失败
5. Quality gate → 记录失败
6. Success → commit + 记录

### D3. Config文档注释 (+10行)
- 每个Config键添加单位、默认值、用途注释

---

## 实施顺序
```
Phase A (Bug修复) → Phase B (D1差距) → Phase C (自愈智能) → Phase D (打磨)
```

## 验证方案
1. **语法**: `PSParser::Tokenize` 零错误
2. **BOM**: UTF-8 BOM确认
3. **Bug1修复**: 手动检查completed-history.json是否已扁平化
4. **Bug5修复**: 并发启动2个任务，验证各自只commit自己app的文件
5. **启动测试**: daemon正常显示v4.0 banner + 进入SCAN
6. **质量门禁**: 模拟含`console.log`的输出，验证被拦截
7. **配额守卫**: 快速连续调用15次，验证冷却触发
8. **Dashboard**: 检查进度条和按app统计是否正确渲染

## 新增函数清单 (10个)
| 函数 | 行数 | Phase |
|------|------|-------|
| Repair-CompletedHistory | ~20 | A1 |
| Remove-CompletedFromPending | ~10 | A2 |
| Initialize-GitAttributes | ~18 | A4 |
| Test-SystemCapacity | ~12 | B3 |
| Show-Dashboard | ~25 | B4 |
| Measure-TaskValue | ~18 | C1 |
| Test-FailurePattern | ~15 | C2 |
| Test-StateIntegrity | ~15 | C3 |
| Get-QuotaStatus | ~15 | C4 |
| Test-OutputQuality | ~15 | C5 |

## 修改函数清单 (5个)
| 函数 | 变更 | Phase |
|------|------|-------|
| Add-CompletedHistory | ArrayList重写 | A1 |
| Get-CompletedHistory | PSCustomObject cast | A1 |
| Invoke-SelectiveCommit | AppScope过滤 | A5 |
| Start-HeartbeatLoop | 排序/dispatch/harvest重排 | B5/D2 |
| $IronRulesInjection | 确定性后缀 | B2 |

## 关键约束
- 单文件PowerShell脚本，UTF-8 BOM编码
- 每次Edit后必须重新保存BOM
- `$env:ANTHROPIC_API_KEY = $null` 强制OAuth
- `--dangerously-skip-permissions` 全权模式
- 所有多行prompt用 @'...'@ here-string
