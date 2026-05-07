@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Checking Protobufjs Actual Installation
echo ========================================
echo.

set "PROTO_PATH=C:\Users\wsmhn\AppData\Roaming\npm\node_modules\protobufjs"

if not exist "!PROTO_PATH!" (
    echo [ERROR] protobufjs not installed at: !PROTO_PATH!
    echo.
    echo [SOLUTION] Install protobufjs:
    echo   npm install -g protobufjs
    pause
    exit /b 1
)

echo [OK] protobufjs exists at: !PROTO_PATH!
echo.
echo Contents of protobufjs directory:
dir /b "!PROTO_PATH!"
echo.

echo Checking for bin directory...
if exist "!PROTO_PATH!\bin" (
    echo [OK] bin directory exists
    echo Contents:
    dir /b "!PROTO_PATH!\bin"
) else (
    echo [ERROR] bin directory NOT found!
    echo.
    echo This means protobufjs was not properly installed.
    echo.
    echo [SOLUTION] Try reinstalling:
    echo   npm uninstall -g protobufjs
    echo   npm install -g protobufjs
    echo.
    echo Or install pbjs-cli separately:
    echo   npm install -g pbjs-cli
)
echo.

echo ========================================
echo Alternative: Install pbjs-cli package
echo ========================================
echo.
echo The 'pbjs-cli' package provides standalone pbjs/pbts commands.
echo Run: npm install -g pbjs-cli
echo.

pause
