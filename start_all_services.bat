@echo off
chcp 65001 >nul
title Start All Services - Local Client + Game Server

echo ========================================
echo   Complete Service Starter
echo ========================================
echo.
echo This script will start:
echo   1. Local HTTP server (port 8080)
echo   2. natapp HTTP tunnel (for client)
echo   3. natapp TCP tunnel (for game server)
echo.
echo Your tunnels:
echo   HTTP: http://u64576b8.natappfree.cc
echo   TCP:  tcp://r62d79f7.natappfree.cc:19272
echo.
echo ----------------------------------------
echo.

:: Check if running in Git Bash
if "%BASH_VERSION%" NEQ "" (
    echo [WARNING] Running in Git Bash environment
    echo [INFO] This script should be run in Windows CMD
    echo.
    echo Please open Windows CMD and run:
    echo   cd /d d:\xiantaomj.cocos2d_client-main
    echo   start_all_services.bat
    echo.
    echo Or run this script directly from File Explorer
    echo.
    pause
    exit /b 1
)

:: Check build directory
if not exist "%~dp0build\web-mobile" (
    echo [ERROR] build\web-mobile directory not found!
    echo.
    echo Please build the project in Cocos Creator first:
    echo   1. Open Cocos Creator
    echo   2. Project -^> Build
    echo   3. Platform: Web Mobile
    echo   4. Click Build
    echo.
    pause
    exit /b 1
)

:: Step 1: Start local HTTP server
echo [Step 1/3] Starting local HTTP server...
echo.

:: Try Node.js http-server first (better for mobile with compression)
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting Node.js http-server on port 8080...
    echo [INFO] Features: GZIP compression, CORS support, better performance
    start "Local HTTP Server" cmd /k "cd /d "%~dp0build\web-mobile" && http-server . -p 8080 -a 0.0.0.0 --gzip --cors -c-1"
    echo [INFO] HTTP server started successfully
    goto :http_started
)

:: Try Python as fallback
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting Python HTTP server on port 8080...
    echo [NOTE] Connection reset errors are normal and can be ignored
    start "Local HTTP Server" cmd /k "cd /d "%~dp0build\web-mobile" && python -m http.server 8080 --bind 0.0.0.0"
    echo [INFO] HTTP server started successfully
    goto :http_started
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting Python3 HTTP server on port 8080...
    echo [NOTE] Connection reset errors are normal and can be ignored
    start "Local HTTP Server" cmd /k "cd /d "%~dp0build\web-mobile" && python3 -m http.server 8080 --bind 0.0.0.0"
    echo [INFO] HTTP server started successfully
    goto :http_started
)

echo [ERROR] Failed to start HTTP server!
echo.
echo Please install one of the following:
echo   1. Node.js (recommended): https://nodejs.org/
echo      Then run: npm install -g http-server
echo   2. Python 3.x: https://www.python.org/downloads/
echo.
pause
exit /b 1

:http_started
timeout /t 3 /nobreak >nul

:: Step 2: Start natapp HTTP tunnel
echo [Step 2/3] Starting natapp HTTP tunnel...
echo.

:: Find natapp
set "NATAPP_CMD="
where natapp >nul 2>&1
if %errorlevel% equ 0 set "NATAPP_CMD=natapp"

if "%NATAPP_CMD%"=="" (
    if exist "C:\natapp\natapp.exe" (
        set "NATAPP_CMD=C:\natapp\natapp.exe"
    )
)

if "%NATAPP_CMD%"=="" (
    echo [ERROR] natapp.exe not found!
    echo.
    echo Please specify the path to natapp.exe:
    set /p NATAPP_PATH=Enter full path to natapp.exe: 
    if not exist "%NATAPP_PATH%" (
        echo [ERROR] File not found: %NATAPP_PATH%
        pause
        exit /b 1
    )
    set "NATAPP_CMD=%NATAPP_PATH%"
)

echo [INFO] Starting natapp HTTP tunnel...
start "natapp HTTP Tunnel" "%NATAPP_CMD%" -authtoken=85cfabd42318aed5
echo [INFO] natapp HTTP tunnel started

timeout /t 3 /nobreak >nul

:: Step 3: Start natapp TCP tunnel
echo [Step 3/3] Starting natapp TCP tunnel...
echo.

echo [INFO] Starting natapp TCP tunnel...
start "natapp TCP Tunnel" "%NATAPP_CMD%" -authtoken=e502bcc319fd6bd5
echo [INFO] natapp TCP tunnel started

timeout /t 3 /nobreak >nul

:: Generate share link
echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Your complete share link:
echo.
echo http://u64576b8.natappfree.cc/index.html?serverAddr=r62d79f7.natappfree.cc:19272
echo.
echo | set /p="http://u64576b8.natappfree.cc/index.html?serverAddr=r62d79f7.natappfree.cc:19272" | clip
echo Link copied to clipboard!
echo.
echo ----------------------------------------
echo.
echo Local access: http://localhost:8080/index.html?serverAddr=127.0.0.1:20480
echo.
echo Services running:
echo   - Local HTTP Server (port 8080)
echo   - natapp HTTP Tunnel (client access)
echo   - natapp TCP Tunnel (game connection)
echo.
echo Note: HTTP server may show connection reset errors - this is normal!
echo.
echo IMPORTANT: Make sure natapp HTTP tunnel is configured for port 8080!
echo   Check at: https://natapp.cn/ -^> My Tunnels -^> Config
echo.
echo Press Ctrl+C in each window to stop services
echo ========================================
echo.
pause