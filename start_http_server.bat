@echo off
title Start Optimized HTTP Server

echo ========================================
echo   Optimized HTTP Server for Natapp
echo ========================================
echo.

:: Change to the directory where this script is located
cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Configuration:
echo   Port: 8080 (default)
echo   GZIP Compression: Enabled
echo   CORS: Enabled  
echo   Cache: 1 hour (3600 seconds) - OPTIMIZED for natapp
echo.
echo Starting optimized HTTP server...
echo.
echo Server will be available at:
echo   http://127.0.0.1:8080
echo.
echo Press Ctrl+C to stop the server
echo.
echo ----------------------------------------
echo.

:: Start http-server with optimization flags
:: -c 3600: Enable cache for 1 hour (reduces repeated requests through natapp)
:: --gzip: Enable compression (reduces bandwidth usage)
:: --cors: Enable CORS for cross-origin requests
http-server build\web-mobile -p 8080 --gzip --cors -c 3600

if errorlevel 1 (
    echo.
    echo [ERROR] http-server failed to start!
    echo.
    echo Possible reasons:
    echo   1. Port 8080 is already in use
    echo   2. http-server is not installed (run: npm install -g http-server)
    echo   3. build\web-mobile directory is missing
    echo.
)

pause