@echo off
chcp 65001 >nul

echo Checking actual protobufjs installation structure...
echo.

echo Contents of node_modules\protobufjs:
dir /b "node_modules\protobufjs"
echo.

echo Checking for bin directory:
if exist "node_modules\protobufjs\bin" (
    echo [OK] bin directory exists
    dir /b "node_modules\protobufjs\bin"
) else (
    echo [ERROR] bin directory NOT found
)
echo.

echo Looking for pbjs in entire package...
dir /s /b "node_modules\protobufjs\*pbjs*" 2>nul
echo.

pause
