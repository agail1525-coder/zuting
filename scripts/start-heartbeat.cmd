@echo off
chcp 65001 >nul 2>&1
:: ============================================================================
:: ZUTING Heartbeat Daemon - One-Click Launcher
:: ============================================================================
:: 用法:
::   双击运行                    → 前台运行 (可以看到实时日志)
::   start-heartbeat.cmd --bg   → 后台运行 (最小化窗口)
:: ============================================================================

title ZUTING Heartbeat Daemon

cd /d "E:\ZUTING"

echo.
echo   ============================================
echo     ZUTING Heartbeat Daemon Launcher
echo     Global Ancestral Temple Platform
echo   ============================================
echo.

:: 检查 claude CLI 是否可用
where claude >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%USERPROFILE%\.local\bin\claude.exe" (
        set "PATH=%USERPROFILE%\.local\bin;%PATH%"
        echo   [OK] Claude CLI found via .local/bin
        goto :claude_ok
    )
    if exist "%APPDATA%\npm\claude.cmd" (
        set "PATH=%APPDATA%\npm;%PATH%"
        echo   [OK] Claude CLI found via npm global
        goto :claude_ok
    )
    if exist "%LOCALAPPDATA%\Programs\claude\claude.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\claude;%PATH%"
        echo   [OK] Claude CLI found via local install
        goto :claude_ok
    )
    echo.
    echo   [ERROR] claude CLI not found in PATH!
    echo   Searched: %%USERPROFILE%%\.local\bin, %%APPDATA%%\npm, %%LOCALAPPDATA%%\Programs\claude
    echo   Please install Claude Code first.
    echo.
    echo   Press any key to exit...
    pause >nul
    exit /b 1
)
echo   [OK] Claude CLI found
:claude_ok

:: 检查 PowerShell
powershell -Command "if ($PSVersionTable.PSVersion.Major -ge 5) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERROR] PowerShell 5+ required!
    echo   Press any key to exit...
    pause >nul
    exit /b 1
)
echo   [OK] PowerShell ready

:: 创建日志目录
if not exist "E:\ZUTING\logs\heartbeat" (
    mkdir "E:\ZUTING\logs\heartbeat"
)
echo   [OK] Log directory ready

echo.

:: 根据参数决定前台/后台
if "%1"=="--bg" (
    echo   [MODE] Background - minimized window
    echo.
    start /min "ZUTING-Heartbeat" powershell -ExecutionPolicy Bypass -NoExit -File "scripts\heartbeat-daemon.ps1"
    echo   Daemon started in background.
    echo   Logs: E:\ZUTING\logs\heartbeat\
    echo.
    echo   Press any key to close this launcher...
    pause >nul
) else (
    echo   [MODE] Foreground - live output
    echo   Press Ctrl+C to stop
    echo.
    powershell -ExecutionPolicy Bypass -NoExit -File "scripts\heartbeat-daemon.ps1"
    echo.
    echo   === Daemon exited ===
    echo   Press any key to close...
    pause >nul
)
