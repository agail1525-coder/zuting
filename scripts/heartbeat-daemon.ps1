# ============================================================================
# ZUTING Heartbeat Daemon v4.0 — 智能自愈建设引擎
# ============================================================================
# 核心机制: SCAN -> BUILD(并行) -> VERIFY -> PUSH -> 循环
# v4.0: 自愈状态/质量门禁/配额守卫/价值评分/失败模式/App归属commit/丰富Dashboard
# v4.1: 经验沉淀/BLG三问硬门禁/BUILD构建硬条件
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

    MaxConcurrency      = 5          # slots (was 3 in v3.0)
    HeartbeatInterval   = 15         # seconds between job polls
    InterDispatchDelay  = 10         # seconds between task dispatches
    CycleCooldown       = 300        # seconds between full cycles

    # Rate limit
    ProbeIntervalBase   = 300        # seconds, initial probe wait
    ProbeIntervalMax    = 3600       # seconds, max probe wait
    ProbePrompt         = "reply only: ok"
    RateLimitPattern    = "rate.?limit|usage.?limit|limit.?reached|too many requests|429|out of.*usage|resets \d+[ap]m"

    # Recovery
    RecoveryCooldown        = 120    # seconds, post-recovery wait
    RampUpSuccessCount      = 2      # successes before +1 slot
    TwoTierProbeWaitSeconds = 120    # seconds, confirm probe wait

    # Auth
    AuthRetryInterval   = 300        # seconds between auth retries
    AuthMaxRetries      = 12         # max retries (= 1 hour)

    # Task execution
    TaskTimeoutSeconds   = 900       # 15 minutes
    IndexLockRetries     = 3
    IndexLockWaitSeconds = 5
    MaxRetries           = 2

    # Suspicious output detection
    SuspiciousMinChars       = 100   # chars threshold
    SuspiciousMinSeconds     = 60    # seconds threshold
    SuspiciousConsecutiveMax = 5     # triggers silent rate limit

    # Quota guardian
    MaxInvocationsPerWindow  = 15    # max Claude calls per window
    InvocationWindowSeconds  = 300   # 5-minute rolling window

    # Task value scoring
    MinTaskScore = 30                # minimum score to accept task

    # Log rotation
    LogMaxBytes = 10485760           # 10MB

    ClaudeCLI = "claude"
}

# --- App Path Map (for scoped commits) ---

$AppPathMap = @{
    "api"          = "services/api/"
    "web"          = "apps/web/"
    "admin"        = "apps/admin/"
    "mobile"       = "apps/mobile/"
    "miniprogram"  = "apps/miniprogram/"
    "shared"       = "packages/"
    "verify"       = ""
}

# --- Build Verification Suffix (deterministic per app) ---

$BuildVerifySuffix = @{
    "api"          = "cd E:\ZUTING && pnpm --filter @zuting/api build"
    "web"          = "cd E:\ZUTING && pnpm --filter @zuting/web build"
    "admin"        = "cd E:\ZUTING && pnpm --filter @zuting/admin build"
    "mobile"       = "cd E:\ZUTING/apps/mobile && npx tsc --noEmit"
    "miniprogram"  = "cd E:\ZUTING && pnpm --filter @zuting/miniprogram build"
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
C. 执行完毕后必须运行验证(构建命令由daemon根据app类型注入，见下方)
   - 带着编译错误结束任务 = 任务失败。必须修复到0 errors
D. 不要执行 git add 或 git commit (daemon自动处理)

[BLG BUSINESS LOGIC GUARD — 页面任务必答三问]
在向页面添加数据或组件之前，必须回答:
  Q1: 目标用户是谁? (游客/朝圣者/管理员/CEO)
  Q2: 这个数据帮用户做什么决策?
  Q3: 去掉这个数据，页面会变差吗?
任一答不上 = 不属于该页面，禁止添加。(BLG-01~BLG-03)

[EXPERIENCE SEDIMENTATION]
如果你在执行过程中发现了非显而易见的坑或技巧，在任务末尾用以下格式输出:
```experience
文件: xxx
发现: 一句话描述踩坑或技巧
原因: 为什么会这样
解法: 怎么解决的
```
daemon会自动提取并注入到后续任务的prompt中，帮助后续Agent避坑。
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
$InvocationTimestamps = [System.Collections.ArrayList]::new()

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

# --- Completed/Failed History (v4.0: ArrayList fix for nested value/Count bug) ---

function Repair-CompletedHistory {
    if (-not (Test-Path $Config.HistoryFile)) { return }
    try {
        $raw = Get-Content $Config.HistoryFile -Raw | ConvertFrom-Json
    } catch { return }
    $flat = [System.Collections.ArrayList]::new()
    $queue = [System.Collections.Queue]::new()
    $queue.Enqueue($raw)
    while ($queue.Count -gt 0) {
        $item = $queue.Dequeue()
        if ($null -eq $item) { continue }
        if ($item -is [array] -or $item -is [System.Collections.IEnumerable] -and $item -isnot [string]) {
            foreach ($sub in $item) { $queue.Enqueue($sub) }
            continue
        }
        if ($item.PSObject.Properties.Name -contains "value") {
            $queue.Enqueue($item.value)
            continue
        }
        if ($item.PSObject.Properties.Name -contains "id" -and $item.PSObject.Properties.Name -contains "completedAt") {
            $exists = $false
            foreach ($f in $flat) { if ($f.id -eq $item.id) { $exists = $true; break } }
            if (-not $exists) {
                $flat.Add([PSCustomObject]@{
                    id = $item.id
                    name = $item.name
                    completedAt = $item.completedAt
                }) | Out-Null
            }
        }
    }
    $flat | ConvertTo-Json -Depth 10 | Set-Content -Path $Config.HistoryFile -Encoding UTF8
    Write-Log "Repaired completed-history.json: $($flat.Count) entries flattened" "OK"
}

function Get-CompletedHistory {
    if (Test-Path $Config.HistoryFile) {
        try {
            $parsed = Get-Content $Config.HistoryFile -Raw | ConvertFrom-Json
            if ($parsed -is [array]) { return [PSCustomObject[]]$parsed }
            return @([PSCustomObject]$parsed)
        } catch { return @() }
    }
    return @()
}

function Add-CompletedHistory {
    param([string]$TaskId, [string]$TaskName)
    $list = [System.Collections.ArrayList]::new()
    foreach ($item in (Get-CompletedHistory)) { $list.Add($item) | Out-Null }
    $list.Add([PSCustomObject]@{
        id = $TaskId
        name = $TaskName
        completedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }) | Out-Null
    $list | ConvertTo-Json -Depth 10 | Set-Content -Path $Config.HistoryFile -Encoding UTF8
}

function Remove-CompletedFromPending {
    if (-not (Test-Path $Config.TaskFile)) { return }
    try {
        $pending = Get-Content $Config.TaskFile -Raw | ConvertFrom-Json
        $doneIds = @(Get-CompletedHistory | ForEach-Object { $_.id }) + @(Get-FailedTasks | ForEach-Object { $_.id })
        $remaining = @($pending | Where-Object { $_.id -notin $doneIds })
        $remaining | ConvertTo-Json -Depth 10 | Set-Content -Path $Config.TaskFile -Encoding UTF8
    } catch { }
}

function Get-FailedTasks {
    if (Test-Path $Config.FailedTaskFile) {
        try {
            $parsed = Get-Content $Config.FailedTaskFile -Raw | ConvertFrom-Json
            if ($parsed -is [array]) { return [PSCustomObject[]]$parsed }
            return @([PSCustomObject]$parsed)
        } catch { return @() }
    }
    return @()
}

function Add-FailedTask {
    param([string]$TaskId, [string]$TaskName, [string]$Reason)
    $list = [System.Collections.ArrayList]::new()
    foreach ($item in (Get-FailedTasks)) { $list.Add($item) | Out-Null }
    $list.Add([PSCustomObject]@{
        id = $TaskId
        name = $TaskName
        reason = $Reason
        failedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }) | Out-Null
    $list | ConvertTo-Json -Depth 10 | Set-Content -Path $Config.FailedTaskFile -Encoding UTF8
    Write-Log "Task $TaskId recorded as FAILED: $Reason" "WARN"
}

# --- State Integrity Check (v4.0 self-healing) ---

function Test-StateIntegrity {
    $stateFiles = @(
        @{ Path = $Config.HistoryFile; MustBeArray = $true },
        @{ Path = $Config.FailedTaskFile; MustBeArray = $true },
        @{ Path = $Config.StateFile; MustBeArray = $false },
        @{ Path = $Config.TaskFile; MustBeArray = $true }
    )
    foreach ($sf in $stateFiles) {
        if (-not (Test-Path $sf.Path)) { continue }
        try {
            $parsed = Get-Content $sf.Path -Raw | ConvertFrom-Json
            if ($sf.MustBeArray -and $parsed -isnot [array] -and $null -ne $parsed) {
                throw "Expected array, got $($parsed.GetType().Name)"
            }
        } catch {
            $backup = "$($sf.Path).corrupt.bak"
            Copy-Item $sf.Path $backup -Force -ErrorAction SilentlyContinue
            if ($sf.MustBeArray) { "[]" | Set-Content -Path $sf.Path -Encoding UTF8 }
            else { "{}" | Set-Content -Path $sf.Path -Encoding UTF8 }
            Write-Log "Self-healed corrupt state: $($sf.Path) (backup: $backup)" "WARN"
        }
    }
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

# --- Output Quality Gate (v4.0) ---

function Test-OutputQuality {
    param([string]$Output, [string]$TaskId)
    if (-not $Output -or $Output.Length -lt 50) { return $true }

    $issues = @()
    $todoCount = ([regex]::Matches($Output, "//\s*(TODO|FIXME|HACK)", "IgnoreCase")).Count
    if ($todoCount -gt 3) { $issues += "TODO/FIXME x$todoCount" }

    $consoleLogCount = ([regex]::Matches($Output, "console\.log\(", "IgnoreCase")).Count
    if ($consoleLogCount -gt 0) { $issues += "console.log x$consoleLogCount" }

    $anyCount = ([regex]::Matches($Output, ":\s*any\b")).Count
    if ($anyCount -gt 2) { $issues += "any type x$anyCount (R-01)" }

    $emptyCatchCount = ([regex]::Matches($Output, "catch\s*\(\w*\)\s*\{\s*\}", "IgnoreCase")).Count
    if ($emptyCatchCount -gt 0) { $issues += "empty catch x$emptyCatchCount" }

    if ($issues.Count -gt 0) {
        $reason = "Quality gate: " + ($issues -join ", ")
        Write-Log "Task $TaskId REJECTED by quality gate: $reason" "WARN"
        return $false
    }
    return $true
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
    param([string[]]$PreSnapshot, [string]$TaskId, [string]$TaskName, [string]$AppScope = "")
    Set-Location $Config.ProjectRoot
    $postFiles = Get-DirtyFiles

    # Files changed by this task = in post but not in pre
    $newFiles = @($postFiles | Where-Object { $_ -notin $PreSnapshot })

    # v4.0: Filter by app scope to prevent cross-task attribution
    if ($AppScope -and $AppScope -ne "verify" -and $AppPathMap.ContainsKey($AppScope)) {
        $appPath = $AppPathMap[$AppScope]
        $newFiles = @($newFiles | Where-Object {
            $_ -like "$appPath*" -or $_ -like "packages/*" -or $_ -like "logs/*"
        })
    }

    if ($newFiles.Count -eq 0) {
        Write-Log "Task $TaskId : no file changes to commit" "INFO"
        return $true
    }

    Write-Log "Task $TaskId : committing $($newFiles.Count) files (scope: $AppScope)"

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
            $app = if ($AppScope) { $AppScope } else { $TaskId.Split('-')[0] }
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

# --- .gitattributes Initialization (v4.0) ---

function Initialize-GitAttributes {
    $gaPath = Join-Path $Config.ProjectRoot ".gitattributes"
    if (Test-Path $gaPath) { return }
    $content = @"
# Auto-detect text files and normalize line endings
* text=auto eol=lf

# Windows scripts
*.ps1 text eol=crlf
*.cmd text eol=crlf
*.bat text eol=crlf
"@
    [System.IO.File]::WriteAllText($gaPath, $content, [System.Text.UTF8Encoding]::new($false))
    Set-Location $Config.ProjectRoot
    git add .gitattributes 2>&1 | Out-Null
    git commit -m "chore: add .gitattributes for consistent line endings`n`nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>" 2>&1 | Out-Null
    Write-Log ".gitattributes created and committed" "OK"
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

# --- System Capacity Check (v4.0 adaptive concurrency) ---

function Test-SystemCapacity {
    try {
        $os = Get-CimInstance Win32_OperatingSystem
        $freeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
        $cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
        if ($freeGB -lt 2.0) {
            Write-Log "System memory low (${freeGB}GB free), holding concurrency" "WARN"
            return $false
        }
        if ($cpu -gt 80) {
            Write-Log "CPU high (${cpu}%), holding concurrency" "WARN"
            return $false
        }
        return $true
    } catch {
        return $true
    }
}

# --- Quota Guardian (v4.0 proactive rate limit prevention) ---

function Get-QuotaStatus {
    $now = Get-Date
    $cutoff = $now.AddSeconds(-$Config.InvocationWindowSeconds)
    # Prune old timestamps
    $toRemove = @()
    for ($i = 0; $i -lt $InvocationTimestamps.Count; $i++) {
        if ($InvocationTimestamps[$i] -lt $cutoff) { $toRemove += $i }
    }
    for ($i = $toRemove.Count - 1; $i -ge 0; $i--) {
        $InvocationTimestamps.RemoveAt($toRemove[$i])
    }
    $rate = $InvocationTimestamps.Count
    if ($rate -ge $Config.MaxInvocationsPerWindow) {
        $waitSeconds = [int](($InvocationTimestamps[0] - $cutoff).TotalSeconds) + 10
        Write-Log "Quota guardian: $rate/$($Config.MaxInvocationsPerWindow) invocations in window, cooling ${waitSeconds}s" "WARN"
        Start-Sleep -Seconds $waitSeconds
        return $false
    }
    return $true
}

function Register-Invocation {
    $InvocationTimestamps.Add((Get-Date)) | Out-Null
}

# --- Task Value Scoring (v4.0) ---

function Measure-TaskValue {
    param($Task)
    $score = switch ([int]$Task.priority) {
        0 { 100 }
        1 { 70 }
        2 { 40 }
        3 { 20 }
        default { 30 }
    }
    if ($Task.app -eq "api") { $score += 20 }
    # Penalty if failure pattern matches
    if (Test-FailurePattern -TaskId $Task.id) { $score -= 30 }
    return $score
}

# --- Failure Pattern Memory (v4.0) ---

function Test-FailurePattern {
    param([string]$TaskId)
    $failed = Get-FailedTasks
    if ($failed.Count -eq 0) { return $false }
    $parts = $TaskId -split '-'
    if ($parts.Count -lt 2) { return $false }
    $pattern = "$($parts[0])-$($parts[1])"
    $cutoff = (Get-Date).AddHours(-24)
    $matchCount = @($failed | Where-Object {
        $_.id -like "$pattern*" -and
        [datetime]$_.failedAt -gt $cutoff
    }).Count
    if ($matchCount -ge 3) {
        Write-Log "Skipping $TaskId : pattern '$pattern' has $matchCount recent failures" "WARN"
        return $true
    }
    return $false
}

# --- Claude Invocation ---

function Invoke-Claude {
    param([string]$Prompt, [string]$Label = "task")
    $logFile = Join-Path $Config.LogDir "$Label-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    Write-Log "Invoking Claude: $Label"
    Register-Invocation

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
    Register-Invocation

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

# --- Experience Sedimentation (v4.1: learn from past fixes) ---

function Get-ExperienceContext {
    $expFile = Join-Path $Config.LogDir "experience.md"
    if (-not (Test-Path $expFile)) { return "" }
    $content = [System.IO.File]::ReadAllText($expFile, [System.Text.Encoding]::UTF8)
    if ($content.Length -lt 10) { return "" }
    # Limit to last 2000 chars to avoid prompt bloat
    if ($content.Length -gt 2000) { $content = $content.Substring($content.Length - 2000) }
    return "`n[PAST EXPERIENCE — avoid these pitfalls]`n$content`n"
}

function Save-ExperienceFromOutput {
    param([string]$Output, [string]$TaskId)
    if (-not $Output) { return }
    if ($Output -match '```experience\s*\n([\s\S]*?)\n```') {
        $exp = $Matches[1].Trim()
        if ($exp.Length -gt 10) {
            $expFile = Join-Path $Config.LogDir "experience.md"
            $ts = Get-Date -Format "yyyy-MM-dd HH:mm"
            $entry = "`n---`n[$ts] Task: $TaskId`n$exp`n"
            [System.IO.File]::AppendAllText($expFile, $entry, [System.Text.UTF8Encoding]::new($true))
            Write-Log "Experience captured from $TaskId" "OK"
        }
    }
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

# --- Dashboard (v4.0 rich display) ---

function Show-Dashboard {
    param([int]$Done, [int]$Total, [int]$Failed, [hashtable]$AppStats = @{})
    $pct = if ($Total -gt 0) { [int]($Done / $Total * 100) } else { 0 }
    $filled = [int]($pct / 5)
    $empty = 20 - $filled
    $bar = ("$([char]0x2588)" * $filled) + ("$([char]0x2591)" * $empty)
    $uptime = (Get-Date) - $DaemonStartTime
    $uptimeStr = "{0}h{1}m" -f [int]$uptime.TotalHours, $uptime.Minutes
    $rate = if ($uptime.TotalHours -gt 0) { [math]::Round($TotalTasksCompleted / $uptime.TotalHours, 1) } else { 0 }
    $failedTotal = (Get-FailedTasks).Count

    Write-Host ""
    Write-Host "  ┌──────────────────────────────────────────────────────┐" -ForegroundColor Magenta
    Write-Host ("  │  Cycle #{0,-3} [{1}] {2,3}%            │" -f $CycleCount, $bar, $pct) -ForegroundColor Magenta
    Write-Host ("  │  This:  {0,3} done / {1,3} fail   Lifetime: {2,4} / {3,3}    │" -f $Done, $Failed, $TotalTasksCompleted, $failedTotal) -ForegroundColor Magenta
    Write-Host ("  │  Slots: {0}/{1}  Rate: {2}/h  Limits: {3}  Up: {4,-6} │" -f $CurrentMaxConcurrency, $Config.MaxConcurrency, $rate, $RateLimitHits, $uptimeStr) -ForegroundColor Magenta
    if ($AppStats.Count -gt 0) {
        $appLine = ($AppStats.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name)($($_.Value))" }) -join " "
        Write-Host ("  │  Apps: {0,-46}│" -f $appLine) -ForegroundColor Magenta
    }
    Write-Host "  └──────────────────────────────────────────────────────┘" -ForegroundColor Magenta
    Write-Host ""
}

# --- Exit Summary ---

function Show-ExitSummary {
    $uptime = (Get-Date) - $DaemonStartTime
    $uptimeStr = "{0}h {1}m {2}s" -f [int]$uptime.TotalHours, $uptime.Minutes, $uptime.Seconds
    $failedCount = (Get-FailedTasks).Count

    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host "    ZUTING Daemon v4.0 — Exit Summary" -ForegroundColor Yellow
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
    Write-Host "    ZUTING Heartbeat Daemon v4.0" -ForegroundColor Yellow
    Write-Host "    Auto-Scan -> Discover -> Build -> Loop" -ForegroundColor Yellow
    Write-Host "    Value Scoring | Quality Gate | Self-Healing" -ForegroundColor DarkYellow
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ""

    # Restore persistent state
    Restore-DaemonState
    Write-Log "Daemon started. Project: $($Config.ProjectRoot)"

    # v4.0: One-time repairs and initialization
    Repair-CompletedHistory
    Test-StateIntegrity
    Initialize-GitAttributes

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

        # v4.0: State integrity check each cycle
        Test-StateIntegrity

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

            # v4.0: Quota check before scan
            Get-QuotaStatus | Out-Null

            Write-Log "Scanning project for gaps and improvements..."
            $scanOutput = Invoke-Claude -Prompt $ScanPrompt -Label "scan-cycle$CycleCount"

            if (-not $scanOutput) {
                Write-Log "Scan failed or rate limited, retrying next cycle" "WARN"
                Start-Sleep -Seconds $Config.CycleCooldown
                continue
            }

            $tasks = Parse-TasksFromOutput $scanOutput

            # v4.0: Value scoring filter
            if ($tasks.Count -gt 0) {
                $scoredTasks = @()
                foreach ($t in $tasks) {
                    $score = Measure-TaskValue -Task $t
                    if ($score -ge $Config.MinTaskScore) {
                        $scoredTasks += $t
                    } else {
                        Write-Log "  [skip] $($t.id) score=$score < $($Config.MinTaskScore)" "INFO"
                    }
                }
                $tasks = $scoredTasks
            }

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
        $tasks | ConvertTo-Json -Depth 10 | Set-Content -Path $Config.TaskFile -Encoding UTF8

        # ═══════════════════════════════════════════════════════════════
        # STEP 2: BUILD — Concurrent execution with dirty file tracking
        # ═══════════════════════════════════════════════════════════════
        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────┐" -ForegroundColor Green
        Write-Host "  │  Cycle #$CycleCount — BUILD Phase              │" -ForegroundColor Green
        Write-Host "  └──────────────────────────────────────────┘" -ForegroundColor Green

        # v4.0: Sort by priority then by app weight (api first)
        $appWeight = @{ "api" = 0; "shared" = 1; "web" = 2; "admin" = 2; "mobile" = 2; "miniprogram" = 2 }
        $sortedTasks = $tasks | Sort-Object { [int]$_.priority }, { if ($appWeight.ContainsKey($_.app)) { $appWeight[$_.app] } else { 3 } }
        $completedThisCycle = 0
        $failedThisCycle = 0
        $taskIndex = 0
        $appStats = @{}

        # Get human edit context once per cycle
        $humanContext = Get-HumanEditContext

        while ($taskIndex -lt $sortedTasks.Count -or $RunningJobs.Count -gt 0) {
            Save-Progress -TasksDone $completedThisCycle -TasksTotal $sortedTasks.Count -Phase "building"

            # --- Harvest finished jobs (v4.0: strict priority chain) ---
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
                    Save-DaemonState
                    continue
                }

                if ($jobInfo.Job.State -eq "Completed" -or $jobInfo.Job.State -eq "Failed") {
                    $finishedIds += $id
                    try {
                        $output = (Receive-Job -Job $jobInfo.Job -ErrorAction SilentlyContinue) -join "`n"

                        # v4.0: Strict priority classification chain
                        # 1. Explicit rate limit (highest priority)
                        if (Test-RateLimit $output) {
                            Write-Log "Task $id hit rate limit" "WARN"
                            Wait-ForRateLimit
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Rate limit during execution"
                            Save-DaemonState
                        }
                        # 2. Auth error
                        elseif (Test-AuthError $output) {
                            Write-Log "Task $id auth error" "WARN"
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Auth error during execution"
                            Save-DaemonState
                        }
                        # 3. Suspicious output (silent rate limit)
                        elseif (Test-SuspiciousOutput -Output $output -StartTime $jobInfo.StartTime -TaskId $id) {
                            Wait-ForRateLimit
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Silent rate limit detected"
                            Save-DaemonState
                        }
                        # 4. Job execution failed
                        elseif ($jobInfo.Job.State -eq "Failed") {
                            Write-Log "Task $id FAILED" "ERROR"
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Job execution failed"
                            Save-DaemonState
                        }
                        # 5. Quality gate
                        elseif (-not (Test-OutputQuality -Output $output -TaskId $id)) {
                            $failedThisCycle++
                            Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Output quality gate failed"
                            Save-DaemonState
                        }
                        # 6. Success
                        else {
                            Write-Log "Task $id COMPLETED" "OK"

                            # v4.1: Extract experience from output
                            Save-ExperienceFromOutput -Output $output -TaskId $id

                            # Selective commit with app scope
                            $taskApp = ($id -split '-')[0]
                            $commitOk = Invoke-SelectiveCommit -PreSnapshot $jobInfo.PreSnapshot -TaskId $id -TaskName $jobInfo.Name -AppScope $taskApp
                            if (-not $commitOk) {
                                Write-Log "Task $id completed but commit failed" "WARN"
                            }

                            $completedThisCycle++
                            $script:TotalTasksCompleted++
                            $script:ConsecutiveSuccesses++
                            $script:SuspiciousCount = 0
                            Add-CompletedHistory -TaskId $id -TaskName $jobInfo.Name
                            Remove-CompletedFromPending
                            Save-DaemonState

                            # Track per-app stats
                            if (-not $appStats.ContainsKey($taskApp)) { $appStats[$taskApp] = 0 }
                            $appStats[$taskApp]++

                            # Ramp up concurrency (v4.0: with system capacity check)
                            if ($ConsecutiveSuccesses -ge $Config.RampUpSuccessCount -and $CurrentMaxConcurrency -lt $Config.MaxConcurrency) {
                                if (Test-SystemCapacity) {
                                    $script:CurrentMaxConcurrency++
                                    $script:ConsecutiveSuccesses = 0
                                    Write-Log "Concurrency ramped up to $CurrentMaxConcurrency" "INFO"
                                }
                            }
                        }
                    } catch {
                        Write-Log "Error receiving $id : $_" "ERROR"
                        $failedThisCycle++
                        Add-FailedTask -TaskId $id -TaskName $jobInfo.Name -Reason "Error receiving job output: $_"
                        Save-DaemonState
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

                # v4.0: Quota guardian check before dispatch
                Get-QuotaStatus | Out-Null

                # v4.0: Skip if failure pattern blocks it
                if (Test-FailurePattern -TaskId $task.id) {
                    Write-Log "Skipping $($task.id) due to failure pattern" "WARN"
                    continue
                }

                # Build prompt: human edit protection + experience + BLG + hard build gate
                $verifySuffix = if ($BuildVerifySuffix.ContainsKey($task.app)) {
                    "`n[HARD BUILD GATE] 任务完成后必须执行: $($BuildVerifySuffix[$task.app])`n如果构建失败，必须修复到0 errors后才算完成。带着编译错误结束 = 任务失败。"
                } else { "" }
                $expContext = Get-ExperienceContext
                $buildPrompt = "你是ZUTING平台的D1建设Agent。请执行以下任务，遵守CLAUDE.md铁律。" + "`n" + $humanContext + $expContext + "`n任务: $($task.name)`n`n$($task.description)" + "`n" + $IronRulesInjection + $verifySuffix

                Write-Log "Dispatching: $($task.id) — $($task.name)"

                # Capture dirty file snapshot BEFORE task starts
                $preSnapshot = Get-DirtyFiles

                $job = Invoke-ClaudeAsync -Prompt $buildPrompt -Label "build-$($task.id)"
                $RunningJobs[$task.id] = @{
                    Job = $job
                    Name = $task.name
                    StartTime = Get-Date
                    PreSnapshot = $preSnapshot
                    App = $task.app
                }

                $freeSlots--
                if ($freeSlots -gt 0) { Start-Sleep -Seconds $Config.InterDispatchDelay }
            }

            if ($RunningJobs.Count -gt 0) {
                Start-Sleep -Seconds $Config.HeartbeatInterval
            }
        }

        # ═══════════════════════════════════════════════════════════════
        # STEP 3: VERIFY — Build verification (v4.0: includes miniprogram)
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
- cd apps/mobile && npx tsc --noEmit
- pnpm run build --filter=@zuting/miniprogram
- 如果构建失败, 分析错误并修复, 然后重新构建直到通过
- 不要执行 git add 或 git commit (daemon自动处理)
- 简短输出结果: PASS或FAIL + 修复了什么
'@
            # v4.0: Quota check before verify
            Get-QuotaStatus | Out-Null

            Write-Log "Running build verification..."
            $verifyOutput = Invoke-Claude -Prompt $verifyPrompt -Label "verify-cycle$CycleCount"
            if ($verifyOutput) {
                # Commit any verify fixes
                $verifySnapshot = Get-DirtyFiles
                if ($verifySnapshot.Count -gt 0) {
                    Invoke-SelectiveCommit -PreSnapshot @() -TaskId "verify-cycle$CycleCount" -TaskName "build verification fixes" -AppScope "verify"
                }
                Write-Log "Verification complete"
                Save-DaemonState
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
        # CYCLE SUMMARY (v4.0: rich dashboard)
        # ═══════════════════════════════════════════════════════════════
        Show-Dashboard -Done $completedThisCycle -Total $sortedTasks.Count -Failed $failedThisCycle -AppStats $appStats

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
