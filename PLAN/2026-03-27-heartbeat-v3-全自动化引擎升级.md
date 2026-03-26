# Heartbeat Daemon v3.0 — 全自动化建设引擎升级计划

## Context
ZUTING heartbeat daemon v2.0 (~510行) 已能自动扫描→发现→建设，但缺少ZYL D1的多项关键能力：无脏文件追踪导致并发commit混乱、无任务超时、无静默限流检测、无人工编辑保护、无失败任务追踪。项目完成度86%，daemon需要成为可靠的全自动引擎来完成剩余14%。

## 目标文件
`E:\ZUTING\scripts\heartbeat-daemon.ps1` (单文件升级，当前~510行→预计~730行)

---

## Phase A: 核心可靠性 (+91行)

### A1. 新增Config键
```
TaskTimeoutSeconds = 900       # 单任务最长15分钟
IndexLockRetries = 3           # git index.lock重试次数
IndexLockWaitSeconds = 5       # 重试间隔
StateFile = "E:\ZUTING\logs\heartbeat\heartbeat-state.json"
FailedTaskFile = "E:\ZUTING\logs\heartbeat\failed-tasks.json"
```

### A2. 新函数: `Get-DirtyFiles` (15行)
- 执行 `git status --porcelain`，返回所有脏文件路径数组
- 插入位置: Parse-TasksFromOutput之后

### A3. 新函数: `Invoke-SelectiveCommit` (55行)
- 参数: PreSnapshot(任务前脏文件), TaskId, TaskName
- 逻辑: 对比任务前后脏文件差异 → 只add该任务新增的文件 → commit
- git index.lock检测 + 3次重试
- commit message: `heartbeat(app): 任务名称`

### A4. 修改任务派发
- 派发前调用 `Get-DirtyFiles` 保存快照到 `$RunningJobs[$id].PreSnapshot`

### A5. 任务超时检测
- 在harvest循环中: elapsed > 900s且Job仍Running → Stop-Job + 标记失败

### A6. 任务完成后自动commit
- 成功完成的任务 → 调用 `Invoke-SelectiveCommit`
- 移除PUSH阶段的委托式git commit

### A7. 修改Prompt
- ScanPrompt: "不要包含 git commit (daemon自动处理)"
- Build prompt: "不要执行 git add 或 git commit"
- PUSH阶段: 简化为仅 `git push origin master`

---

## Phase B: 智能恢复 (+88行)

### B1. 新增Config键
```
SuspiciousMinChars = 100       # 输出<100字符=可疑
SuspiciousMinSeconds = 60      # 耗时<60秒=可疑
SuspiciousConsecutiveMax = 5   # 连续5次可疑=静默限流
TwoTierProbeWaitSeconds = 120  # 两级探针间隔
```

### B2. 新增全局状态
```
$SuspiciousCount = 0
$RateLimitHits = 0
$AuthRetryCount = 0
$DaemonStartTime = Get-Date
```

### B3. 新函数: `Test-SuspiciousOutput` (20行)
- 检测: 输出<100字符 且 耗时<60秒 → suspicious++
- 连续5次可疑 → 判定静默限流，触发Wait-ForRateLimit
- 正常输出 → 计数器归零

### B4. 升级 `Wait-ForRateLimit`: 两级探针确认
- 第一次探针OK → 等120秒 → 第二次确认探针
- 第二次也OK → 真正恢复
- 第二次失败 → 继续等待（防止误判恢复）

### B5. Auth失败阈值
- AuthRetryCount递增，达到12次(1小时) → 自动退出daemon
- 避免无限等待过期的OAuth session

### B6. 新函数: `Save-DaemonState` / `Restore-DaemonState` (35行)
- 持久化: EffectiveMaxSlots, ConsecutiveSuccesses, SuspiciousCount, RateLimitHits, TotalTasksCompleted, CycleCount
- 启动时恢复 → 崩溃重启不丢失学习状态

---

## Phase C: 质量门禁 (+76行)

### C1. 新函数: `Get-HumanEditContext` (30行)
- 检测 git staged/unstaged/untracked 文件
- 生成保护性前言: "以下文件包含人工修改，禁止覆盖/还原"
- 注入到每个build任务的prompt中

### C2. 新常量: `$IronRulesInjection` (15行)
```
[SELF-CHECK IRON RULES]
1. 读取CLAUDE.md铁律
2. 遵守适用的R/HH/BLG规则
3. 按端执行对应build验证命令
4. 构建失败必须修复
5. 不要执行git操作(daemon处理)
```

### C3. 升级Build Prompt
- 组合: 基础指令 + 人工编辑保护 + 任务描述 + 铁律注入
- 每个任务都带着完整的质量门禁上下文

### C4. 新函数: `Add-FailedTask` / `Get-FailedTasks` (20行)
- 失败任务记录到 `failed-tasks.json`: {id, name, reason, failedAt}
- 失败任务不自动重试(避免配额浪费)

### C5. ScanPrompt更新
- 增加: "检查failed-tasks.json，不要重复已失败的任务"

---

## Phase D: 打磨 (+68行)

### D1. 新函数: `Show-ExitSummary` (25行)
- Ctrl+C或异常退出时打印: 运行时长/周期数/完成数/失败数/限流次数/当前并发
- 调用Save-DaemonState保存最终状态

### D2. 优雅退出处理
- try/catch/finally: finally中清理所有Running jobs + Show-ExitSummary

### D3. 新函数: `Remove-TempArtifacts` (15行)
- 每轮cycle结束: 清理 *.node / tree-sitter-*.wasm 临时文件
- 排除 node_modules 目录

### D4. 日志轮转
- Write-Log中检查: 日志>10MB → 轮转为.log.1

### D5. 增强Cycle Dashboard
- 显示: 发现/完成/失败、累计完成/失败、并发数/限流次数/运行时长

---

## 实施顺序
```
Phase A (核心可靠性) → Phase B (智能恢复) → Phase C (质量门禁) → Phase D (打磨)
```
A是基础，B/C依赖A，D依赖B+C。严格按序实施。

## 验证方案
1. 语法验证: `PSParser::Tokenize` 零错误
2. 启动测试: daemon正常显示banner + 读取CLAUDE.md
3. 断点恢复: 重启后从pending-tasks.json恢复 + 状态文件恢复
4. 选择性commit: 并发任务各自只commit自己的文件
5. 超时: 模拟长任务被kill
6. 退出摘要: Ctrl+C显示完整统计

## 关键约束
- 单文件PowerShell脚本，UTF-8 BOM编码
- 所有多行prompt用 @'...'@ (避免numbered list解析问题)
- `$env:ANTHROPIC_API_KEY = $null` 强制OAuth
- `--dangerously-skip-permissions` 全权模式
- 每次Edit后必须重新保存BOM
