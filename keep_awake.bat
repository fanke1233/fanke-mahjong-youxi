@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Keep Awake - Prevent Sleep Mode
echo ========================================
echo.

echo Current power settings:
powercfg -query | findstr "Standby"
echo.

echo Options:
echo [1] Disable sleep (computer stays awake)
echo [2] Enable sleep (restore default 30 minutes)
echo [3] Check current status
echo [0] Exit
echo.

set /p choice="Enter your choice (0-3): "

if "%choice%"=="1" goto disable_sleep
if "%choice%"=="2" goto enable_sleep
if "%choice%"=="3" goto check_status
if "%choice%"=="0" goto exit

echo Invalid choice!
pause
exit /b

:disable_sleep
echo.
echo Disabling sleep mode...
powercfg -change -standby-timeout-ac 0
powercfg -change -standby-timeout-dc 0
powercfg -change -hibernate-timeout-ac 0
powercfg -change -hibernate-timeout-dc 0
echo.
echo [OK] Sleep mode disabled!
echo Computer will stay awake while game server is running.
echo.
echo To restore sleep mode, run this script and choose option [2]
echo.
pause
exit /b

:enable_sleep
echo.
echo Enabling sleep mode (30 minutes)...
powercfg -change -standby-timeout-ac 30
powercfg -change -standby-timeout-dc 15
powercfg -change -hibernate-timeout-ac 60
powercfg -change -hibernate-timeout-dc 30
echo.
echo [OK] Sleep mode restored!
echo.
pause
exit /b

:check_status
echo.
echo Current Power Settings:
powercfg -query | findstr "Standby"
powercfg -query | findstr "Hibernate"
echo.
pause
exit /b

:exit
echo.
echo Exiting...
exit /b
