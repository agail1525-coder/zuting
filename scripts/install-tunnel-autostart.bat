@echo off
REM 注册 Windows 计划任务: 登录自启 Clash 反向隧道
REM 使用: 双击运行本 .bat (需管理员权限)

setlocal

set TASK_NAME=ZutingClashTunnel
set SCRIPT_PATH=E:\ZUTING\scripts\clash-reverse-tunnel.py
set PYTHONW=R:\python\pythonw.exe

if not exist "%PYTHONW%" (
  echo [FAIL] pythonw.exe not found at %PYTHONW%
  exit /b 1
)
if not exist "%SCRIPT_PATH%" (
  echo [FAIL] tunnel script not found at %SCRIPT_PATH%
  exit /b 1
)

echo [1/2] Deleting existing task if any...
schtasks /Delete /TN "%TASK_NAME%" /F >nul 2>&1

echo [2/2] Creating ONLOGON task...
schtasks /Create ^
  /TN "%TASK_NAME%" ^
  /TR "\"%PYTHONW%\" \"%SCRIPT_PATH%\"" ^
  /SC ONLOGON ^
  /RL HIGHEST ^
  /F

if %ERRORLEVEL% NEQ 0 (
  echo [FAIL] schtasks failed. Run as Administrator.
  exit /b 1
)

echo.
echo [OK] Task "%TASK_NAME%" created. Runs on every user logon.
echo     Manual start now:   schtasks /Run /TN "%TASK_NAME%"
echo     Check status:       schtasks /Query /TN "%TASK_NAME%" /V /FO LIST
echo     Uninstall:          schtasks /Delete /TN "%TASK_NAME%" /F
endlocal
