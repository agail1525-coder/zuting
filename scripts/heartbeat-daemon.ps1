# ============================================================================
# ZUTING Heartbeat Daemon v2.0 — 自动扫描→发现→建设→循环
# ============================================================================
# 核心机制: 每轮先让Claude扫描项目缺口, 输出任务清单JSON, 然后逐个执行
# 不是固定任务列表, 而是每轮自我发现新的建设目标
# 执行链: SCAN(扫描缺口) → BUILD(逐个建设) → VERIFY(构建验证) → PUSH(推送) → 循环
# 使用: powershell -File scripts\heartbeat-daemon.ps1
# 停止: Ctrl+C
# ============================================================================

# ─── 强制 UTF-8 编码 ──────────────────────────────────────────────────────────
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# ─── 配置区 ─────────────────────────────────────────────────────────────────

$Config = @{
    ProjectRoot     = "E:\ZUTING"
    LogDir          = "E:\ZUTING\logs\heartbeat"
    TaskFile        = "E:\ZUTING\logs\heartbeat\pending-tasks.json"
    HistoryFile     = "E:\ZUTING\logs\heartbeat\completed-history.json"
    ProgressFile    = "E:\ZUTING\logs\heartbeat\progress.json"

    # 并发: 扫描阶段1路, 建设阶段最多3路
    MaxConcurrency      = 3
    HeartbeatInterval   = 15
    PostTaskCooldown    = 30
    CycleCooldown       = 300          # 一轮完成后等5分钟再扫描

    # 流量限制
    ProbeIntervalBase   = 300
    ProbeIntervalMax    = 3600
    ProbePrompt         = "reply only: ok"
    RateLimitPattern    = "rate.?limit|usage.?limit|limit.?reached|too many requests|429|out of.*usage|resets \d+[ap]m"

    # 恢复策略
    RecoveryCooldown    = 120
    RampUpSuccessCount  = 2

    # 认证重试
    AuthRetryInterval   = 300
    AuthMaxRetries      = 12

    ClaudeCLI       = "claude"
    MaxRetries      = 2
}

# ─── 扫描Prompt: 让Claude自己发现要做什么 ────────────────────────────────────

$ScanPrompt = @'
你是ZUTING全球祖庭旅行平台的自动扫描Agent。你的任务是扫描整个项目，发现可以改进的地方，输出一个JSON任务清单。

项目结构 (Monorepo):
- services/api/     — NestJS后端 (20个模块, 34+路由)
- apps/web/          — Next.js 15前端 (21页面)
- apps/admin/        — Vite+AntDesign管理后台 (11页面)
- apps/mobile/       — Expo React Native APP (5 tabs + 详情页)
- apps/miniprogram/  — Taro微信小程序 (14页面)
- packages/          — 共享类型/API客户端/配置

扫描步骤:
A. 读取 CLAUDE.md 了解项目架构、铁律(R系列)、宪法(HH系列)、防火墙(BLG/B系列)
B. 读取 logs/heartbeat/completed-history.json 了解已经完成过的任务(避免重复)
C. 对每个端(API/Web/Admin/Mobile/小程序)执行全审++(五维审查):
   - V1-功能完整: 空壳页面/mock数据/缺少页面/未连接API的组件/缺少的CRUD
   - V2-安全合规: API鉴权(R-63~R-74)/输入校验/SQL注入/XSS/CORS/敏感数据暴露
   - V3-体验质量: i18n/loading状态/错误处理/空状态/响应式布局/无障碍
   - V4-代码铁律: 类型安全(R-01~R-03)/命名规范(R-19~R-24)/数据库(R-31~R-59)
   - V5-业务逻辑: 状态机正确性/支付流程/订单生命周期/BLG业务守卫
   - 找出: 可以新增的功能页面(用户收藏/评论/推荐/社交分享/搜索)
D. 按优先级排序: P0(崩溃/安全) > P1(功能缺失) > P2(体验优化) > P3(新功能)

输出要求 — 你必须在最后输出一个JSON代码块，格式如下:
```json
[
  {
    "id": "unique-task-id",
    "name": "任务名称",
    "app": "api|web|admin|mobile|miniprogram",
    "priority": 0,
    "description": "详细的执行指令，告诉建设Agent具体要做什么、改哪些文件、如何验证"
  }
]
```

规则:
- 每次输出5-10个最高优先级任务(不要输出太多, 做完再扫描)
- 检查 completed-history.json, 不要输出已完成的同ID任务
- 每个任务的description要足够详细, 建设Agent拿到就能直接执行
- description中必须注明要遵守的铁律编号(如R-01, HH-V03, BLG-02)
- 页面任务必须符合页面++标准: 垂直切片(HH-V01~V06) + 五维审查
- id命名规范: {app}-{action}-{target}, 例如 "web-add-favorites-page", "api-fix-auth-validation"
- 任务粒度: 一个任务 = 一个Claude CLI调用能完成的工作量(1-3个文件修改)
- 必须包含验证步骤(tsc --noEmit 或 pnpm build)
- 必须包含 git commit
'@

# ─── 初始化目录 ──────────────────────────────────────────────────────────────
if (-not (Test-Path $Config.LogDir)) {
    New-Item -ItemType Directory -Path $Config.LogDir -Force | Out-Null
}

# ─── 进度跟踪 ────────────────────────────────────────────────────────────────

$RunningJobs = @{}
$CycleCount = 0
$TotalTasksCompleted = 0
$ConsecutiveSuccesses = 0
$CurrentMaxConcurrency = 1

# ─── 工具函数 ────────────────────────────────────────────────────────────────

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "OK"    { "Green" }
        "WARN"  { "Yellow" }
        "ERROR" { "Red" }
        "FATAL" { "Magenta" }
        default { "White" }
    }
    Write-Host "[$ts] [$Level] $Message" -ForegroundColor $color
    $logFile = Join-Path $Config.LogDir "heartbeat-$(Get-Date -Format 'yyyy-MM-dd').log"
    "[$ts] [$Level] $Message" | Out-File -Append -FilePath $logFile -Encoding UTF8
}

function Save-Progress {
    param([int]$TasksDone = 0, [int]$TasksTotal = 0, [string]$Phase = "idle")
    @{
        CycleCount = $CycleCount
        TotalCompleted = $TotalTasksCompleted
        CurrentPhase = $Phase
        CycleTasks = "$TasksDone/$TasksTotal"
        LastUpdate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json | Set-Content -Path $Config.ProgressFile -Encoding UTF8
}

function Get-CompletedHistory {
    if (Test-Path $Config.HistoryFile) {
        try {
            return (Get-Content $Config.HistoryFile -Raw | ConvertFrom-Json)
        } catch {
            return @()
        }
    }
    return @()
}

function Add-CompletedHistory {
    param([string]$TaskId, [string]$TaskName)
    $history = @(Get-CompletedHistory)
    $history += @{ id = $TaskId; name = $TaskName; completedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss") }
    $history | ConvertTo-Json -Depth 5 | Set-Content -Path $Config.HistoryFile -Encoding UTF8
}

function Test-RateLimit {
    param([string]$Output)
    return $Output -match $Config.RateLimitPattern
}

function Test-AuthError {
    param([string]$Output)
    return $Output -match "unauthorized|token.*expired|login.*required|session.*expired"
}

function Wait-ForRateLimit {
    $interval = $Config.ProbeIntervalBase
    $probeCount = 0

    while ($true) {
        $probeCount++
        Write-Log "Rate limited. Probe #$probeCount, waiting ${interval}s..." "WARN"
        Start-Sleep -Seconds $interval

        Write-Log "Sending probe..."
        try {
            $probeResult = & $Config.ClaudeCLI -p $Config.ProbePrompt 2>&1
            $probeOutput = $probeResult -join "`n"

            if (Test-RateLimit $probeOutput) {
                $interval = [Math]::Min($interval * 2, $Config.ProbeIntervalMax)
                Write-Log "Still rate limited. Next probe in ${interval}s" "WARN"
            } else {
                Write-Log "Rate limit cleared! Resuming in $($Config.RecoveryCooldown)s..." "INFO"
                Start-Sleep -Seconds $Config.RecoveryCooldown
                $script:CurrentMaxConcurrency = 1
                $script:ConsecutiveSuccesses = 0
                return
            }
        } catch {
            Write-Log "Probe failed: $_" "ERROR"
            $interval = [Math]::Min($interval * 2, $Config.ProbeIntervalMax)
        }
    }
}

function Invoke-Claude {
    param([string]$Prompt, [string]$Label = "task")
    $logFile = Join-Path $Config.LogDir "$Label-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    Write-Log "Invoking Claude: $Label"

    # 清除无效 API key, 强制 OAuth (Max套餐)
    $env:ANTHROPIC_API_KEY = $null

    $result = & $Config.ClaudeCLI -p $Prompt --dangerously-skip-permissions 2>&1
    $output = $result -join "`n"
    $output | Out-File -FilePath $logFile -Encoding UTF8

    if (Test-RateLimit $output) {
        Write-Log "Hit rate limit during $Label" "WARN"
        Wait-ForRateLimit
        return $null
    }
    if (Test-AuthError $output) {
        Write-Log "Auth error during $Label, waiting..." "WARN"
        Start-Sleep -Seconds $Config.AuthRetryInterval
        return $null
    }

    return $output
}

function Invoke-ClaudeAsync {
    param([string]$Prompt, [string]$Label = "task")
    $logFile = Join-Path $Config.LogDir "$Label-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

    $job = Start-Job -ScriptBlock {
        param($ProjectRoot, $Prompt, $LogFile, $ClaudeCLI)
        # 清除无效 API key, 强制 OAuth (Max套餐)
        $env:ANTHROPIC_API_KEY = $null
        Set-Location $ProjectRoot
        $result = & $ClaudeCLI -p $Prompt --dangerously-skip-permissions 2>&1
        $output = $result -join "`n"
        [System.IO.File]::WriteAllText($LogFile, $output, [System.Text.UTF8Encoding]::new($true))
        return $output
    } -ArgumentList $Config.ProjectRoot, $Prompt, $logFile, $Config.ClaudeCLI

    return $job
}

function Parse-TasksFromOutput {
    param([string]$Output)
    # 从Claude输出中提取JSON代码块
    if ($Output -match '```json\s*\n([\s\S]*?)\n```') {
        try {
            $tasks = $Matches[1] | ConvertFrom-Json
            return $tasks
        } catch {
            Write-Log "Failed to parse task JSON: $_" "ERROR"
            return @()
        }
    }
    # 尝试直接解析(可能没有代码块包裹)
    if ($Output -match '\[\s*\{') {
        $jsonStart = $Output.IndexOf('[')
        $depth = 0; $jsonEnd = $jsonStart
        for ($i = $jsonStart; $i -lt $Output.Length; $i++) {
            if ($Output[$i] -eq '[') { $depth++ }
            if ($Output[$i] -eq ']') { $depth--; if ($depth -eq 0) { $jsonEnd = $i; break } }
        }
        try {
            $jsonStr = $Output.Substring($jsonStart, $jsonEnd - $jsonStart + 1)
            return ($jsonStr | ConvertFrom-Json)
        } catch {
            Write-Log "Failed to parse raw JSON: $_" "ERROR"
        }
    }
    return @()
}

# ─── 主循环 ───────────────────────────────────────────────────────────────────

function Start-HeartbeatLoop {
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host "    ZUTING Heartbeat Daemon v2.0" -ForegroundColor Yellow
    Write-Host "    Auto-Scan -> Discover -> Build -> Loop" -ForegroundColor Yellow
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Log "Daemon started. Project: $($Config.ProjectRoot)"

    if (-not (Test-Path $Config.LogDir)) {
        New-Item -ItemType Directory -Path $Config.LogDir -Force | Out-Null
    }

    # 初始化 completed-history.json
    if (-not (Test-Path $Config.HistoryFile)) {
        "[]" | Set-Content -Path $Config.HistoryFile -Encoding UTF8
    }

    # ─── 断点恢复: 检查上次未完成的任务 ───
    $resumedTasks = $null
    if (Test-Path $Config.TaskFile) {
        try {
            $pendingRaw = Get-Content $Config.TaskFile -Raw | ConvertFrom-Json
            $history = Get-CompletedHistory
            $completedIds = @($history | ForEach-Object { $_.id })
            $remaining = @($pendingRaw | Where-Object { $_.id -notin $completedIds })
            if ($remaining.Count -gt 0) {
                Write-Log "Resuming $($remaining.Count) tasks from previous session" "OK"
                foreach ($t in $remaining) {
                    Write-Log "  [resume] $($t.app)/$($t.id): $($t.name)"
                }
                $resumedTasks = $remaining
            }
        } catch {
            Write-Log "Could not parse pending-tasks.json, starting fresh" "WARN"
        }
    }

    while ($true) {
        $script:CycleCount++
        $tasks = $null

        # ─── 如果有恢复的任务, 跳过扫描直接执行 ───
        if ($resumedTasks) {
            Write-Host ""
            Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Yellow
            Write-Host "  │  Cycle #$CycleCount — RESUME Phase             │" -ForegroundColor Yellow
            Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Yellow
            $tasks = $resumedTasks
            $resumedTasks = $null
            Write-Log "Resumed $($tasks.Count) pending tasks from last session"
        } else {
            Write-Host ""
            Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Cyan
            Write-Host "  │  Cycle #$CycleCount — SCAN Phase               │" -ForegroundColor Cyan
            Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Cyan
            Save-Progress -Phase "scanning"

            # ═══════════════════════════════════════════════════════════════
            # STEP 1: SCAN — 让Claude扫描项目, 发现缺口, 输出任务JSON
            # ═══════════════════════════════════════════════════════════════
            Write-Log "Scanning project for gaps and improvements..."
            $scanOutput = Invoke-Claude -Prompt $ScanPrompt -Label "scan-cycle$CycleCount"

            if (-not $scanOutput) {
                Write-Log "Scan failed or rate limited, retrying next cycle" "WARN"
                Start-Sleep -Seconds $Config.CycleCooldown
                continue
            }

            $tasks = Parse-TasksFromOutput $scanOutput
            if ($tasks.Count -eq 0) {
                Write-Log "No tasks discovered. Project may be fully built! Cooling down..." "OK"
                Start-Sleep -Seconds ($Config.CycleCooldown * 2)
                continue
            }

            Write-Log "Discovered $($tasks.Count) tasks to execute"
            foreach ($t in $tasks) {
                Write-Log "  [$($t.priority)] $($t.app)/$($t.id): $($t.name)"
            }
        }

        # 保存任务清单
        $tasks | ConvertTo-Json -Depth 5 | Set-Content -Path $Config.TaskFile -Encoding UTF8

        # ═══════════════════════════════════════════════════════════════
        # STEP 2: BUILD — 逐个/并行执行发现的任务
        # ═══════════════════════════════════════════════════════════════
        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Green
        Write-Host "  │  Cycle #$CycleCount — BUILD Phase              │" -ForegroundColor Green
        Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Green

        $sortedTasks = $tasks | Sort-Object { $_.priority }
        $completedThisCycle = 0
        $failedThisCycle = 0
        $taskIndex = 0

        while ($taskIndex -lt $sortedTasks.Count -or $RunningJobs.Count -gt 0) {
            Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "building"

            # 收割完成的Job
            $finishedIds = @()
            foreach ($id in @($RunningJobs.Keys)) {
                $jobInfo = $RunningJobs[$id]
                if ($jobInfo.Job.State -eq "Completed" -or $jobInfo.Job.State -eq "Failed") {
                    $finishedIds += $id
                    try {
                        $output = (Receive-Job -Job $jobInfo.Job -ErrorAction SilentlyContinue) -join "`n"

                        if (Test-RateLimit $output) {
                            Write-Log "Task $id hit rate limit" "WARN"
                            Wait-ForRateLimit
                            $failedThisCycle++
                        } elseif ($jobInfo.Job.State -eq "Failed") {
                            Write-Log "Task $id FAILED" "ERROR"
                            $failedThisCycle++
                        } else {
                            Write-Log "Task $id COMPLETED" "OK"
                            $completedThisCycle++
                            $script:TotalTasksCompleted++
                            $script:ConsecutiveSuccesses++
                            Add-CompletedHistory -TaskId $id -TaskName $jobInfo.Name

                            if ($ConsecutiveSuccesses -ge $Config.RampUpSuccessCount -and $CurrentMaxConcurrency -lt $Config.MaxConcurrency) {
                                $script:CurrentMaxConcurrency++
                                $script:ConsecutiveSuccesses = 0
                                Write-Log "Concurrency ramped up to $CurrentMaxConcurrency" "INFO"
                            }
                        }
                    } catch {
                        Write-Log "Error receiving $id : $_" "ERROR"
                        $failedThisCycle++
                    }
                    Remove-Job -Job $jobInfo.Job -Force -ErrorAction SilentlyContinue
                }
            }
            foreach ($id in $finishedIds) { $RunningJobs.Remove($id) }

            # 调度新任务
            $freeSlots = $CurrentMaxConcurrency - $RunningJobs.Count
            while ($freeSlots -gt 0 -and $taskIndex -lt $sortedTasks.Count) {
                $task = $sortedTasks[$taskIndex]
                $taskIndex++

                $buildPrompt = "你是ZUTING平台的D1建设Agent。请执行以下任务，遵守CLAUDE.md铁律。`n`n任务: $($task.name)`n`n$($task.description)"

                Write-Log "Dispatching: $($task.id) — $($task.name)"
                $job = Invoke-ClaudeAsync -Prompt $buildPrompt -Label "build-$($task.id)"
                $RunningJobs[$task.id] = @{ Job = $job; Name = $task.name; StartTime = Get-Date }

                $freeSlots--
                if ($freeSlots -gt 0) { Start-Sleep -Seconds 5 }
            }

            if ($RunningJobs.Count -gt 0) {
                Start-Sleep -Seconds $Config.HeartbeatInterval
            }
        }

        # ═══════════════════════════════════════════════════════════════
        # STEP 3: VERIFY — 全量构建验证
        # ═══════════════════════════════════════════════════════════════
        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Yellow
        Write-Host "  │  Cycle #$CycleCount — VERIFY Phase             │" -ForegroundColor Yellow
        Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Yellow
        Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "verifying"

        $verifyPrompt = @'
你是ZUTING平台的验证Agent。执行全量构建验证:
- cd E:\ZUTING
- pnpm run build --filter=@zuting/api
- pnpm run build --filter=@zuting/web
- pnpm run build --filter=@zuting/admin
- 如果构建失败, 分析错误并修复, 然后重新构建直到通过
- 确保所有修复都 git commit
- 简短输出结果: PASS或FAIL + 修复了什么
'@
        Write-Log "Running build verification..."
        $verifyOutput = Invoke-Claude -Prompt $verifyPrompt -Label "verify-cycle$CycleCount"
        if ($verifyOutput) {
            Write-Log "Verification complete"
        }

        # ═══════════════════════════════════════════════════════════════
        # STEP 4: PUSH — 推送到GitHub
        # ═══════════════════════════════════════════════════════════════
        Write-Host ""
        Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "pushing"

        $pushPrompt = @'
你是ZUTING平台的发布Agent。
- cd E:\ZUTING && git status
- 如果有未commit的变更, git add相关文件并commit (message格式: "heartbeat: auto-improvements")
- git push origin master
- 输出推送结果
'@
        Write-Log "Pushing to GitHub..."
        $pushOutput = Invoke-Claude -Prompt $pushPrompt -Label "push-cycle$CycleCount"
        if ($pushOutput) {
            Write-Log "Push complete"
        }

        # ═══════════════════════════════════════════════════════════════
        # CYCLE SUMMARY
        # ═══════════════════════════════════════════════════════════════
        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Magenta
        Write-Host ("  │  Cycle #{0} Summary                       │" -f $CycleCount) -ForegroundColor Magenta
        Write-Host ("  │  Discovered: {0,3} tasks                   │" -f $sortedTasks.Count) -ForegroundColor Magenta
        Write-Host ("  │  Completed:  {0,3} / Failed: {1,3}            │" -f $completedThisCycle, $failedThisCycle) -ForegroundColor Magenta
        Write-Host ("  │  Lifetime:   {0,3} tasks done               │" -f $TotalTasksCompleted) -ForegroundColor Magenta
        Write-Host "  │  Next scan in $($Config.CycleCooldown)s...                │" -ForegroundColor Magenta
        Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Magenta
        Write-Host ""

        Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "cooling"
        Write-Log "Cycle #$CycleCount done. Cooling down $($Config.CycleCooldown)s before next scan..."
        Start-Sleep -Seconds $Config.CycleCooldown
    }
}

# ─── 启动 ─────────────────────────────────────────────────────────────────────

try {
    Start-HeartbeatLoop
} catch {
    Write-Log "Fatal error: $_" "FATAL"
    Write-Host ""
    Write-Host "  FATAL ERROR: $_" -ForegroundColor Red
    Write-Host "  Press any key to exit..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
