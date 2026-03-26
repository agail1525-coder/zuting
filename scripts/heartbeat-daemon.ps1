# ============================================================================
# ZUTING Heartbeat Daemon v3.0 — 全自动化建设引擎
# ============================================================================
# 核心机制: SCAN(扫描缺口) -> BUILD(并行建设) -> VERIFY(构建验证) -> PUSH(推送) -> 循环
# v3.0: 脏文件追踪/选择性commit/超时/静默限流/两级探针/人工编辑保护/铁律注入/状态持久化
# 使用: powershell -File scripts\heartbeat-daemon.ps1
# 停止: Ctrl+C
# ============================================================================

# --- UTF-8 ---
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# --- Config ---

$Config = @{
    ProjectRoot     = "E:\ZUTING"
    LogDir          = "E:\ZUTING\logs\heartbeat"
    TaskFile        = "E:\ZUTING\logs\heartbeat\pending-tasks.json"
    HistoryFile     = "E:\ZUTING\logs\heartbeat\completed-history.json"
    ProgressFile    = "E:\ZUTING\logs\heartbeat\progress.json"
    StateFile       = "E:\ZUTING\logs\heartbeat\heartbeat-state.json"
    FailedTaskFile  = "E:\ZUTING\logs\heartbeat\failed-tasks.json"

    MaxConcurrency      = 3
    HeartbeatInterval   = 15
    PostTaskCooldown    = 30
    CycleCooldown       = 300

    # Rate limit
    ProbeIntervalBase   = 300
    ProbeIntervalMax    = 3600
    ProbePrompt         = "reply only: ok"
    RateLimitPattern    = "rate.?limit|usage.?limit|limit.?reached|too many requests|429|out of.*usage|resets \d+[ap]m"

    # Recovery
    RecoveryCooldown        = 120
    RampUpSuccessCount      = 2
    TwoTierProbeWaitSeconds = 120

    # Auth
    AuthRetryInterval   = 300
    AuthMaxRetries      = 12

    # Task execution
    TaskTimeoutSeconds   = 900
    IndexLockRetries     = 3
    IndexLockWaitSeconds = 5
    MaxRetries           = 2

    # Suspicious output detection
    SuspiciousMinChars       = 100
    SuspiciousMinSeconds     = 60
    SuspiciousConsecutiveMax = 5

    # Log rotation
    LogMaxBytes = 10485760

    ClaudeCLI = "claude"
}

# --- Scan Prompt ---

$ScanPrompt = @'
你是ZUTING全球祖庭旅行平台的自动扫描Agent。你的任务是扫描整个项目，发现可以改进的地方，输出一个JSON任务清单。

项目结构 (Monorepo):
- services/api/     — NestJS后端 (20个模块, 34+路由)
- apps/web/          — Next.js 15前端 (32页面)
- apps/admin/        — Vite+AntDesign管理后台 (12页面)
- apps/mobile/       — Expo React Native APP (15页面)
- apps/miniprogram/  — Taro微信小程序 (14页面)
- packages/          — 共享类型/API客户端/配置

扫描步骤:
A. 读取 CLAUDE.md 了解项目架构、铁律(R系列)、宪法(HH系列)、防火墙(BLG/B系列)
B. 读取 logs/heartbeat/completed-history.json 了解已完成的任务(避免重复)
C. 读取 logs/heartbeat/failed-tasks.json 了解已失败的任务(避免重复浪费)
D. 对每个端(API/Web/Admin/Mobile/小程序)执行全审++(五维审查):
   - V1-功能完整: 空壳页面/mock数据/缺少页面/未连接API的组件/缺少的CRUD
   - V2-安全合规: API鉴权(R-63~R-74)/输入校验/SQL注入/XSS/CORS/敏感数据暴露
   - V3-体验质量: i18n/loading状态/错误处理/空状态/响应式布局/无障碍
   - V4-代码铁律: 类型安全(R-01~R-03)/命名规范(R-19~R-24)/数据库(R-31~R-59)
   - V5-业务逻辑: 状态机正确性/支付流程/订单生命周期/BLG业务守卫
   - 找出: 可以新增的功能页面(用户收藏/评论/推荐/社交分享/搜索)
E. 按优先级排序: P0(崩溃/安全) > P1(功能缺失) > P2(体验优化) > P3(新功能)

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
- 检查 completed-history.json 和 failed-tasks.json, 不要输出已完成或已失败的同ID任务
- 每个任务的description要足够详细, 建设Agent拿到就能直接执行
- description中必须注明要遵守的铁律编号(如R-01, HH-V03, BLG-02)
- 页面任务必须符合页面++标准: 垂直切片(HH-V01~V06) + 五维审查
- id命名规范: {app}-{action}-{target}, 例如 "web-add-favorites-page", "api-fix-auth-validation"
- 任务粒度: 一个任务 = 一个Claude CLI调用能完成的工作量(1-3个文件修改)
- 必须包含验证步骤(tsc --noEmit 或 pnpm build)
- 不要包含 git commit 指令 (daemon自动处理)
'@

# --- Iron Rules Injection (appended to every build prompt) ---

$IronRulesInjection = @'

[SELF-CHECK IRON RULES]
A. 先读取 CLAUDE.md 了解项目铁律 (R系列, HH系列, BLG系列)
B. 遵守所有适用的铁律编号
C. 执行完毕后运行验证:
   - 如果修改了 services/api/: cd E:\ZUTING && pnpm --filter @zuting/api build
   - 如果修改了 apps/web/: cd E:\ZUTING && pnpm --filter @zuting/web build
   - 如果修改了 apps/admin/: cd E:\ZUTING && pnpm --filter @zuting/admin build
   - 如果修改了 apps/mobile/: cd E:\ZUTING/apps/mobile && npx tsc --noEmit
   - 如果修改了 apps/miniprogram/: cd E:\ZUTING && pnpm --filter @zuting/miniprogram build
D. 如果构建失败, 修复错误直到通过
E. 不要执行 git add 或 git commit (daemon自动处理)
'@

# --- Init ---

if (-not (Test-Path $Config.LogDir)) {
    New-Item -ItemType Directory -Path $Config.LogDir -Force | Out-Null
}

# --- Global State ---

$RunningJobs = @{}
$CycleCount = 0
$TotalTasksCompleted = 0
$ConsecutiveSuccesses = 0
$CurrentMaxConcurrency = 1
$SuspiciousCount = 0
$RateLimitHits = 0
$AuthRetryCount = 0
$DaemonStartTime = Get-Date

# ═══════════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

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

    # Log rotation: > 10MB -> rotate
    if (Test-Path $logFile) {
        $size = (Get-Item $logFile -ErrorAction SilentlyContinue).Length
        if ($size -gt $Config.LogMaxBytes) {
            $rotated = "$logFile.1"
            if (Test-Path $rotated) { Remove-Item $rotated -Force }
            Rename-Item $logFile $rotated -ErrorAction SilentlyContinue
        }
    }
}

function Save-Progress {
    param([int]$TasksDone = 0, [int]$TasksTotal = 0, [string]$Phase = "idle")
    @{
        CycleCount = $CycleCount
        TotalCompleted = $TotalTasksCompleted
        CurrentPhase = $Phase
        CycleTasks = "$TasksDone/$TasksTotal"
        Slots = "$CurrentMaxConcurrency/$($Config.MaxConcurrency)"
        LastUpdate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json | Set-Content -Path $Config.ProgressFile -Encoding UTF8
}

# --- Completed/Failed History ---

function Get-CompletedHistory {
    if (Test-Path $Config.HistoryFile) {
        try { return @(Get-Content $Config.HistoryFile -Raw | ConvertFrom-Json) }
        catch { return @() }
    }
    return @()
}

function Add-CompletedHistory {
    param([string]$TaskId, [string]$TaskName)
    $history = @(Get-CompletedHistory)
    $history += @{ id = $TaskId; name = $TaskName; completedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss") }
    $history | ConvertTo-Json -Depth 5 | Set-Content -Path $Config.HistoryFile -Encoding UTF8
}

function Get-FailedTasks {
    if (Test-Path $Config.FailedTaskFile) {
        try { return @(Get-Content $Config.FailedTaskFile -Raw | ConvertFrom-Json) }
        catch { return @() }
    }
    return @()
}

function Add-FailedTask {
    param([string]$TaskId, [string]$TaskName, [string]$Reason)
    $failed = @(Get-FailedTasks)
    $failed += @{ id = $TaskId; name = $TaskName; reason = $Reason; failedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss") }
    $failed | ConvertTo-Json -Depth 5 | Set-Content -Path $Config.FailedTaskFile -Encoding UTF8
    Write-Log "Task $TaskId recorded as FAILED: $Reason" "WARN"
}

# --- Rate Limit / Auth Detection ---

function Test-RateLimit {
    param([string]$Output)
    return $Output -match $Config.RateLimitPattern
}

function Test-AuthError {
    param([string]$Output)
    return $Output -match "unauthorized|token.*expired|login.*required|session.*expired|Invalid API key"
}

function Test-SuspiciousOutput {
    param([string]$Output, [datetime]$StartTime, [string]$TaskId)
    $elapsed = (Get-Date) - $StartTime
    $charCount = if ($Output) { $Output.Length } else { 0 }

    if ($charCount -lt $Config.SuspiciousMinChars -and $elapsed.TotalSeconds -lt $Config.SuspiciousMinSeconds) {
        $script:SuspiciousCount++
        Write-Log "Task $TaskId suspicious: ${charCount}chars in $([int]$elapsed.TotalSeconds)s ($SuspiciousCount/$($Config.SuspiciousConsecutiveMax))" "WARN"
        if ($SuspiciousCount -ge $Config.SuspiciousConsecutiveMax) {
            Write-Log "SILENT RATE LIMIT detected ($SuspiciousCount consecutive suspicious outputs)" "WARN"
            $script:SuspiciousCount = 0
            $script:RateLimitHits++
            return $true
        }
        return $false
    }
    $script:SuspiciousCount = 0
    return $false
}

# --- Two-Tier Probe Recovery ---

function Wait-ForRateLimit {
    $interval = $Config.ProbeIntervalBase
    $probeCount = 0
    $script:RateLimitHits++

    while ($true) {
        $probeCount++
        Write-Log "Rate limited. Probe #$probeCount, waiting ${interval}s..." "WARN"
        Start-Sleep -Seconds $interval

        Write-Log "Sending probe..."
        try {
            $env:ANTHROPIC_API_KEY = $null
            $probeResult = & $Config.ClaudeCLI -p $Config.ProbePrompt --dangerously-skip-permissions 2>&1
            $probeOutput = $probeResult -join "`n"

            if (Test-RateLimit $probeOutput) {
                $interval = [Math]::Min($interval * 2, $Config.ProbeIntervalMax)
                Write-Log "Still rate limited. Next probe in ${interval}s" "WARN"
            } else {
                # Two-tier confirmation
                Write-Log "First probe OK. Confirming in $($Config.TwoTierProbeWaitSeconds)s..." "INFO"
                Start-Sleep -Seconds $Config.TwoTierProbeWaitSeconds

                $env:ANTHROPIC_API_KEY = $null
                $confirmResult = & $Config.ClaudeCLI -p $Config.ProbePrompt --dangerously-skip-permissions 2>&1
                $confirmOutput = $confirmResult -join "`n"

                if (Test-RateLimit $confirmOutput) {
                    Write-Log "Confirm probe FAILED — still rate limited" "WARN"
                    $interval = [Math]::Min($interval * 2, $Config.ProbeIntervalMax)
                    continue
                }

                Write-Log "Two-tier probe CONFIRMED — rate limit cleared!" "OK"
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

# --- Git: Dirty File Tracking & Selective Commit ---

function Get-DirtyFiles {
    Set-Location $Config.ProjectRoot
    $status = git status --porcelain 2>&1
    $files = @()
    foreach ($line in ($status -split "`n")) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -gt 3) {
            $files += $trimmed.Substring(3).Trim('"')
        }
    }
    return $files
}

function Invoke-SelectiveCommit {
    param([string[]]$PreSnapshot, [string]$TaskId, [string]$TaskName)
    Set-Location $Config.ProjectRoot
    $postFiles = Get-DirtyFiles

    # Files changed by this task = in post but not in pre
    $newFiles = @($postFiles | Where-Object { $_ -notin $PreSnapshot })

    if ($newFiles.Count -eq 0) {
        Write-Log "Task $TaskId : no file changes to commit" "INFO"
        return $true
    }

    Write-Log "Task $TaskId : committing $($newFiles.Count) files"

    $retries = 0
    while ($retries -lt $Config.IndexLockRetries) {
        $lockFile = Join-Path $Config.ProjectRoot ".git\index.lock"
        if (Test-Path $lockFile) {
            $retries++
            Write-Log "git index.lock detected, retry $retries/$($Config.IndexLockRetries)..." "WARN"
            Start-Sleep -Seconds ($Config.IndexLockWaitSeconds * $retries)
            continue
        }

        try {
            foreach ($f in $newFiles) {
                git add -- $f 2>&1 | Out-Null
            }
            $shortName = if ($TaskName.Length -gt 60) { $TaskName.Substring(0, 60) } else { $TaskName }
            $app = $TaskId.Split('-')[0]
            $msg = "heartbeat($app): $shortName"
            git commit -m "$msg`n`nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" 2>&1 | Out-Null
            Write-Log "Task $TaskId : committed $($newFiles.Count) files" "OK"
            return $true
        } catch {
            $retries++
            if ($_.ToString() -match "index\.lock") {
                Write-Log "index.lock contention, retry $retries..." "WARN"
                Start-Sleep -Seconds ($Config.IndexLockWaitSeconds * $retries)
            } else {
                Write-Log "Commit failed for $TaskId : $_" "ERROR"
                return $false
            }
        }
    }
    Write-Log "Commit failed after $($Config.IndexLockRetries) retries for $TaskId" "ERROR"
    return $false
}

# --- Human Edit Context Protection ---

function Get-HumanEditContext {
    Set-Location $Config.ProjectRoot
    $staged = @(git diff --cached --name-only 2>&1) | Where-Object { $_ -and $_ -notmatch "^warning" }
    $unstaged = @(git diff --name-only 2>&1) | Where-Object { $_ -and $_ -notmatch "^warning" }
    $untracked = @(git ls-files --others --exclude-standard 2>&1) | Where-Object { $_ -and $_ -notmatch "^warning" }

    $humanFiles = @($staged + $unstaged + $untracked) | Select-Object -Unique | Where-Object {
        $_ -and $_ -notmatch "^logs/" -and $_ -notmatch "\.tsbuildinfo$"
    }

    if ($humanFiles.Count -eq 0) { return "" }

    $fileList = ($humanFiles | ForEach-Object { "  - $_" }) -join "`n"
    return "`n[HUMAN EDIT PROTECTION - HE-01/HE-04/HE-06]`nThe following files may contain human edits. DO NOT overwrite or revert them:`n$fileList`nIf you need to modify any of these, PRESERVE existing changes and only ADD yours.`n"
}

# --- Daemon State Persistence ---

function Save-DaemonState {
    @{
        EffectiveMaxSlots = $CurrentMaxConcurrency
        ConsecutiveSuccesses = $ConsecutiveSuccesses
        SuspiciousCount = $SuspiciousCount
        RateLimitHits = $RateLimitHits
        AuthRetryCount = $AuthRetryCount
        TotalTasksCompleted = $TotalTasksCompleted
        CycleCount = $CycleCount
        LastSaved = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json | Set-Content -Path $Config.StateFile -Encoding UTF8
}

function Restore-DaemonState {
    if (Test-Path $Config.StateFile) {
        try {
            $state = Get-Content $Config.StateFile -Raw | ConvertFrom-Json
            $script:CurrentMaxConcurrency = [Math]::Max(1, [int]$state.EffectiveMaxSlots)
            $script:ConsecutiveSuccesses = [int]$state.ConsecutiveSuccesses
            $script:SuspiciousCount = [int]$state.SuspiciousCount
            $script:RateLimitHits = [int]$state.RateLimitHits
            $script:TotalTasksCompleted = [int]$state.TotalTasksCompleted
            $script:CycleCount = [int]$state.CycleCount
            Write-Log "Restored state: slots=$CurrentMaxConcurrency, completed=$TotalTasksCompleted, cycles=$CycleCount" "OK"
        } catch {
            Write-Log "Could not restore state, starting fresh" "WARN"
        }
    }
}

# --- Claude Invocation ---

function Invoke-Claude {
    param([string]$Prompt, [string]$Label = "task")
    $logFile = Join-Path $Config.LogDir "$Label-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    Write-Log "Invoking Claude: $Label"

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
        $script:AuthRetryCount++
        Write-Log "Auth error #$AuthRetryCount/$($Config.AuthMaxRetries) during $Label" "WARN"
        if ($AuthRetryCount -ge $Config.AuthMaxRetries) {
            Write-Log "AUTH FAILURE THRESHOLD — daemon auto-exit after $($Config.AuthMaxRetries) retries" "FATAL"
            Show-ExitSummary
            exit 1
        }
        Start-Sleep -Seconds $Config.AuthRetryInterval
        return $null
    }
    # Auth success resets counter
    $script:AuthRetryCount = 0
    return $output
}

function Invoke-ClaudeAsync {
    param([string]$Prompt, [string]$Label = "task")
    $logFile = Join-Path $Config.LogDir "$Label-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

    $job = Start-Job -ScriptBlock {
        param($ProjectRoot, $Prompt, $LogFile, $ClaudeCLI)
        $env:ANTHROPIC_API_KEY = $null
        [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
        Set-Location $ProjectRoot
        $result = & $ClaudeCLI -p $Prompt --dangerously-skip-permissions 2>&1
        $output = $result -join "`n"
        [System.IO.File]::WriteAllText($LogFile, $output, [System.Text.UTF8Encoding]::new($true))
        return $output
    } -ArgumentList $Config.ProjectRoot, $Prompt, $logFile, $Config.ClaudeCLI

    return $job
}

# --- Parse Tasks from Claude Output ---

function Parse-TasksFromOutput {
    param([string]$Output)
    if ($Output -match '```json\s*\n([\s\S]*?)\n```') {
        try {
            $tasks = $Matches[1] | ConvertFrom-Json
            return $tasks
        } catch {
            Write-Log "Failed to parse task JSON: $_" "ERROR"
            return @()
        }
    }
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

# --- Temp Cleanup ---

function Remove-TempArtifacts {
    $cleaned = 0
    $patterns = @("*.node", "tree-sitter-*.wasm")
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path $Config.ProjectRoot -Filter $pattern -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notmatch "node_modules" }
        foreach ($f in $files) {
            Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
            $cleaned++
        }
    }
    if ($cleaned -gt 0) { Write-Log "Cleaned $cleaned temp artifacts" "INFO" }
}

# --- Exit Summary ---

function Show-ExitSummary {
    $uptime = (Get-Date) - $DaemonStartTime
    $uptimeStr = "{0}h {1}m {2}s" -f [int]$uptime.TotalHours, $uptime.Minutes, $uptime.Seconds
    $failedCount = (Get-FailedTasks).Count

    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host "    ZUTING Daemon v3.0 — Exit Summary" -ForegroundColor Yellow
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ("    Uptime:          {0}" -f $uptimeStr) -ForegroundColor White
    Write-Host ("    Cycles:          {0}" -f $CycleCount) -ForegroundColor White
    Write-Host ("    Tasks Completed: {0}" -f $TotalTasksCompleted) -ForegroundColor Green
    Write-Host ("    Tasks Failed:    {0}" -f $failedCount) -ForegroundColor Red
    Write-Host ("    Rate Limit Hits: {0}" -f $RateLimitHits) -ForegroundColor Yellow
    Write-Host ("    Current Slots:   {0}/{1}" -f $CurrentMaxConcurrency, $Config.MaxConcurrency) -ForegroundColor White
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ""

    Save-DaemonState
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN LOOP
# ═══════════════════════════════════════════════════════════════════════════════

function Start-HeartbeatLoop {
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host "    ZUTING Heartbeat Daemon v3.0" -ForegroundColor Yellow
    Write-Host "    Auto-Scan -> Discover -> Build -> Loop" -ForegroundColor Yellow
    Write-Host "    Selective Commit | Two-Tier Probe | Iron Rules" -ForegroundColor DarkYellow
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ""

    # Restore persistent state
    Restore-DaemonState
    Write-Log "Daemon started. Project: $($Config.ProjectRoot)"

    if (-not (Test-Path $Config.LogDir)) {
        New-Item -ItemType Directory -Path $Config.LogDir -Force | Out-Null
    }
    if (-not (Test-Path $Config.HistoryFile)) {
        "[]" | Set-Content -Path $Config.HistoryFile -Encoding UTF8
    }
    if (-not (Test-Path $Config.FailedTaskFile)) {
        "[]" | Set-Content -Path $Config.FailedTaskFile -Encoding UTF8
    }

    # --- Resume: check pending tasks from last session ---
    $resumedTasks = $null
    if (Test-Path $Config.TaskFile) {
        try {
            $pendingRaw = Get-Content $Config.TaskFile -Raw | ConvertFrom-Json
            $history = Get-CompletedHistory
            $failedHistory = Get-FailedTasks
            $doneIds = @($history | ForEach-Object { $_.id }) + @($failedHistory | ForEach-Object { $_.id })
            $remaining = @($pendingRaw | Where-Object { $_.id -notin $doneIds })
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

        # --- Resume or Scan ---
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

        # Save task list for resume
        $tasks | ConvertTo-Json -Depth 5 | Set-Content -Path $Config.TaskFile -Encoding UTF8

        # ═══════════════════════════════════════════════════════════════
        # STEP 2: BUILD — Concurrent execution with dirty file tracking
        # ═══════════════════════════════════════════════════════════════
        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Green
        Write-Host "  │  Cycle #$CycleCount — BUILD Phase              │" -ForegroundColor Green
        Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Green

        $sortedTasks = $tasks | Sort-Object { $_.priority }
        $completedThisCycle = 0
        $failedThisCycle = 0
        $taskIndex = 0

        # Get human edit context once per cycle
        $humanContext = Get-HumanEditContext

        while ($taskIndex -lt $sortedTasks.Count -or $RunningJobs.Count -gt 0) {
            Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "building"

            # --- Harvest finished jobs ---
            $finishedIds = @()
            foreach ($id in @($RunningJobs.Keys)) {
                $jobInfo = $RunningJobs[$id]

                # Timeout check
                $elapsed = (Get-Date) - $jobInfo.StartTime
                if ($elapsed.TotalSeconds -gt $Config.TaskTimeoutSeconds -and $jobInfo.Job.State -eq "Running") {
                    Write-Log "Task $id TIMED OUT after $([int]$elapsed.TotalMinutes)m" "ERROR"
                    Stop-Job -Job $jobInfo.Job -ErrorAction SilentlyContinue
                    Remove-Job -Job $jobInfo.Job -Force -ErrorAction SilentlyContinue
                    $RunningJobs.Remove($id)
                    $failedThisCycle++
                    Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Timed out after $([int]$elapsed.TotalMinutes)m"
                    continue
                }

                if ($jobInfo.Job.State -eq "Completed" -or $jobInfo.Job.State -eq "Failed") {
                    $finishedIds += $id
                    try {
                        $output = (Receive-Job -Job $jobInfo.Job -ErrorAction SilentlyContinue) -join "`n"

                        # Suspicious output check (silent rate limit)
                        if (Test-SuspiciousOutput -Output $output -StartTime $jobInfo.StartTime -TaskId $id) {
                            Wait-ForRateLimit
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Silent rate limit detected"
                            Remove-Job -Job $jobInfo.Job -Force -ErrorAction SilentlyContinue
                            continue
                        }

                        if (Test-RateLimit $output) {
                            Write-Log "Task $id hit rate limit" "WARN"
                            Wait-ForRateLimit
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Rate limit during execution"
                        } elseif ($jobInfo.Job.State -eq "Failed") {
                            Write-Log "Task $id FAILED" "ERROR"
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Job execution failed"
                        } else {
                            Write-Log "Task $id COMPLETED" "OK"

                            # Selective commit: only commit files this task changed
                            $commitOk = Invoke-SelectiveCommit -PreSnapshot $jobInfo.PreSnapshot -TaskId $id -TaskName $jobInfo.Name
                            if (-not $commitOk) {
                                Write-Log "Task $id completed but commit failed" "WARN"
                            }

                            $completedThisCycle++
                            $script:TotalTasksCompleted++
                            $script:ConsecutiveSuccesses++
                            $script:SuspiciousCount = 0
                            Add-CompletedHistory -TaskId $id -TaskName $jobInfo.Name

                            # Ramp up concurrency
                            if ($ConsecutiveSuccesses -ge $Config.RampUpSuccessCount -and $CurrentMaxConcurrency -lt $Config.MaxConcurrency) {
                                $script:CurrentMaxConcurrency++
                                $script:ConsecutiveSuccesses = 0
                                Write-Log "Concurrency ramped up to $CurrentMaxConcurrency" "INFO"
                            }
                        }
                    } catch {
                        Write-Log "Error receiving $id : $_" "ERROR"
                        $failedThisCycle++
                        Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Error receiving job output: $_"
                    }
                    Remove-Job -Job $jobInfo.Job -Force -ErrorAction SilentlyContinue
                }
            }
            foreach ($id in $finishedIds) { $RunningJobs.Remove($id) }

            # --- Dispatch new tasks ---
            $freeSlots = $CurrentMaxConcurrency - $RunningJobs.Count
            while ($freeSlots -gt 0 -and $taskIndex -lt $sortedTasks.Count) {
                $task = $sortedTasks[$taskIndex]
                $taskIndex++

                # Build prompt with human edit protection + iron rules
                $buildPrompt = "你是ZUTING平台的D1建设Agent。请执行以下任务，遵守CLAUDE.md铁律。" + "`n" + $humanContext + "`n任务: $($task.name)`n`n$($task.description)" + "`n" + $IronRulesInjection

                Write-Log "Dispatching: $($task.id) — $($task.name)"

                # Capture dirty file snapshot BEFORE task starts
                $preSnapshot = Get-DirtyFiles

                $job = Invoke-ClaudeAsync -Prompt $buildPrompt -Label "build-$($task.id)"
                $RunningJobs[$task.id] = @{
                    Job = $job
                    Name = $task.name
                    StartTime = Get-Date
                    PreSnapshot = $preSnapshot
                }

                $freeSlots--
                if ($freeSlots -gt 0) { Start-Sleep -Seconds 5 }
            }

            if ($RunningJobs.Count -gt 0) {
                Start-Sleep -Seconds $Config.HeartbeatInterval
            }
        }

        # ═══════════════════════════════════════════════════════════════
        # STEP 3: VERIFY — Build verification
        # ═══════════════════════════════════════════════════════════════
        if ($completedThisCycle -gt 0) {
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
- 不要执行 git add 或 git commit (daemon自动处理)
- 简短输出结果: PASS或FAIL + 修复了什么
'@
            Write-Log "Running build verification..."
            $verifyOutput = Invoke-Claude -Prompt $verifyPrompt -Label "verify-cycle$CycleCount"
            if ($verifyOutput) {
                # Commit any verify fixes
                $verifySnapshot = Get-DirtyFiles
                if ($verifySnapshot.Count -gt 0) {
                    Invoke-SelectiveCommit -PreSnapshot @() -TaskId "verify-cycle$CycleCount" -TaskName "build verification fixes"
                }
                Write-Log "Verification complete"
            }
        }

        # ═══════════════════════════════════════════════════════════════
        # STEP 4: PUSH — Push to GitHub
        # ═══════════════════════════════════════════════════════════════
        Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "pushing"

        Write-Log "Pushing to GitHub..."
        Set-Location $Config.ProjectRoot
        try {
            $pushResult = git push origin master 2>&1
            $pushStr = $pushResult -join "`n"
            if ($pushStr -match "error|rejected|fatal") {
                Write-Log "Push failed: $pushStr" "ERROR"
            } else {
                Write-Log "Push complete" "OK"
            }
        } catch {
            Write-Log "Push failed: $_" "ERROR"
        }

        # ═══════════════════════════════════════════════════════════════
        # CYCLE SUMMARY
        # ═══════════════════════════════════════════════════════════════
        $failedTotal = (Get-FailedTasks).Count
        $uptime = (Get-Date) - $DaemonStartTime

        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────────────┐" -ForegroundColor Magenta
        Write-Host ("  │  Cycle #{0} Summary                                │" -f $CycleCount) -ForegroundColor Magenta
        Write-Host ("  │  This cycle: {0,3} completed / {1,3} failed            │" -f $completedThisCycle, $failedThisCycle) -ForegroundColor Magenta
        Write-Host ("  │  Lifetime:   {0,4} completed / {1,3} failed            │" -f $TotalTasksCompleted, $failedTotal) -ForegroundColor Magenta
        Write-Host ("  │  Slots: {0}/{1}  RateLimits: {2}  Uptime: {3}h       │" -f $CurrentMaxConcurrency, $Config.MaxConcurrency, $RateLimitHits, [int]$uptime.TotalHours) -ForegroundColor Magenta
        Write-Host "  └──────────────────────────────────────────────────┘" -ForegroundColor Magenta
        Write-Host ""

        # Cleanup
        Remove-TempArtifacts
        Save-DaemonState
        Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "cooling"
        Write-Log "Cycle #$CycleCount done. Cooling down $($Config.CycleCooldown)s..."
        Start-Sleep -Seconds $Config.CycleCooldown
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

try {
    Start-HeartbeatLoop
} catch {
    Write-Log "Fatal error: $_" "FATAL"
    Write-Host ""
    Write-Host "  FATAL ERROR: $_" -ForegroundColor Red
} finally {
    # Kill remaining jobs
    foreach ($id in @($RunningJobs.Keys)) {
        Stop-Job -Job $RunningJobs[$id].Job -ErrorAction SilentlyContinue
        Remove-Job -Job $RunningJobs[$id].Job -Force -ErrorAction SilentlyContinue
    }
    Show-ExitSummary
    Write-Host "  Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
