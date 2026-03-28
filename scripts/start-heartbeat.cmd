@echo off
chcp 65001 >nul 2>&1
title ZUTING Heartbeat Daemon
cd /d "E:\ZUTING"

echo.
echo   ============================================
echo     ZUTING Heartbeat Daemon v4.2 Launcher
echo     CEO++ Business-Driven Build Engine
echo     JOINUS.COM = Global No.1 Temple Travel
echo   ============================================
echo.

REM --- Check Claude CLI ---
where claude >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Claude CLI found
    goto :claude_ok
)
if exist "%USERPROFILE%\.local\bin\claude.exe" (
    set "PATH=%USERPROFILE%\.local\bin;%PATH%"
    echo   [OK] Claude CLI found via .local/bin
    goto :claude_ok
)
if exist "%APPDATA%\npm\claude.cmd" (
    set "PATH=%APPDATA%\npm;%PATH%"
    echo   [OK] Claude CLI found via npm
    goto :claude_ok
)
if exist "%LOCALAPPDATA%\Programs\claude\claude.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\claude;%PATH%"
    echo   [OK] Claude CLI found via Programs
    goto :claude_ok
)
echo.
echo   [ERROR] Claude CLI not found!
echo   Please install Claude Code first.
echo.
pause
exit /b 1

:claude_ok

REM --- Check PowerShell ---
powershell -Command "exit 0" >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERROR] PowerShell not available!
    pause
    exit /b 1
)
echo   [OK] PowerShell ready

REM --- Create log directory ---
if not exist "E:\ZUTING\logs\heartbeat" mkdir "E:\ZUTING\logs\heartbeat"
echo   [OK] Log directory ready
echo.

REM --- Foreground or Background ---
if "%1"=="--bg" goto :run_bg

echo   [MODE] Foreground - live output
echo   Press Ctrl+C to stop
echo.
powershell -ExecutionPolicy Bypass -NoExit -File "scripts\heartbeat-daemon.ps1"
echo.
echo   === Daemon exited ===
pause
goto :eof

:run_bg
echo   [MODE] Background - minimized window
echo.
start /min "ZUTING-Heartbeat" powershell -ExecutionPolicy Bypass -NoExit -File "scripts\heartbeat-daemon.ps1"
echo   Daemon started in background.
echo   Logs: E:\ZUTING\logs\heartbeat\
echo.
pause
goto :eof
