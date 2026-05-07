@echo off
chcp 65001 >nul
title Start natapp TCP Tunnel

echo ========================================
echo   natapp TCP Tunnel Starter
echo ========================================
echo.
echo Your TCP Tunnel Info:
echo   ID: 06q59n4k6q
echo   Address: r62d79f7.natappfree.cc:19272
echo   Port: 20480
echo.
echo Starting TCP tunnel...
echo.

:: Try to find natapp
where natapp >nul 2>&1
if %errorlevel% equ 0 (
    set "NATAPP_CMD=natapp"
    goto :start_tunnel
)

:: Check common locations
if exist "C:\natapp\natapp.exe" (
    set "NATAPP_CMD=C:\natapp\natapp.exe"
    goto :start_tunnel
)

echo [ERROR] natapp.exe not found!
echo.
echo Please specify the path to natapp.exe:
echo.
set /p NATAPP_PATH="Enter full path to natapp.exe: "

if not exist "%NATAPP_PATH%" (
    echo [ERROR] File not found: %NATAPP_PATH%
    pause
    exit /b 1
)

set "NATAPP_CMD=%NATAPP_PATH%"

:start_tunnel
echo [INFO] Using natapp: %NATAPP_CMD%
echo.
echo Starting TCP tunnel with your Authtoken...
echo.
echo After it starts, you will see:
echo   Forwarding  tcp://r62d79f7.natappfree.cc:19272 -> localhost:20480
echo.
echo Your share link:
echo   http://cdn0001.afrxvk.cn/whmj/go.html?serverAddr=r62d79f7.natappfree.cc:19272
echo.
echo ----------------------------------------
echo.

:: Start natapp with your Authtoken
start "natapp TCP Tunnel" "%NATAPP_CMD%" -authtoken=e502bcc319fd6bd5

echo.
echo natapp window opened!
echo.
echo Please check the natapp window for tunnel status.
echo.
echo Share link (copy and send to friends):
echo http://cdn0001.afrxvk.cn/whmj/go.html?serverAddr=r62d79f7.natappfree.cc:19272
echo.
echo | set /p="http://cdn0001.afrxvk.cn/whmj/go.html?serverAddr=r62d79f7.natappfree.cc:19272" | clip
echo.
echo Link copied to clipboard!
echo.
pause