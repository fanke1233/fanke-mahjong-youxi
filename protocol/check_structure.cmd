@echo off
chcp 65001 >nul

echo ========================================
echo Checking Protobufjs Installation Structure
echo ========================================
echo.

echo [1] Checking protobufjs bin directory...
if exist "C:\Users\wsmhn\AppData\Roaming\npm\node_modules\protobufjs\bin" (
    echo [OK] bin directory exists
    echo.
    echo Contents of bin directory:
    dir /b "C:\Users\wsmhn\AppData\Roaming\npm\node_modules\protobufjs\bin"
) else (
    echo [ERROR] bin directory does NOT exist!
)
echo.

echo [2] Checking for pbjs files in npm global directory...
echo Files in C:\Users\wsmhn\AppData\Roaming\npm\ matching pbjs*:
dir /b "C:\Users\wsmhn\AppData\Roaming\npm\pbjs*" 2>nul
if %errorlevel% neq 0 echo [WARNING] No pbjs files found
echo.

echo Files matching pbts*:
dir /b "C:\Users\wsmhn\AppData\Roaming\npm\pbts*" 2>nul
if %errorlevel% neq 0 echo [WARNING] No pbts files found
echo.

echo [3] Checking npm prefix configuration...
npm config get prefix
echo.

echo [4] Listing all files in npm global root...
echo Files in C:\Users\wsmhn\AppData\Roaming\npm\:
dir /b "C:\Users\wsmhn\AppData\Roaming\npm" 2>nul
echo.

echo ========================================
echo Check Complete
echo ========================================
pause
