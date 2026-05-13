@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Build Optimization Checklist
echo ========================================
echo.

echo Checking Cocos Creator Build Settings...
echo.

REM 检查构建目录是否存在
if not exist "build\web-mobile\" (
    echo [ERROR] build/web-mobile directory NOT found!
    echo.
    echo You need to build the project first:
    echo 1. Open Cocos Creator
    echo 2. Click "Project" -> "Build"
    echo 3. Enable these options:
    echo    - MD5 Cache: YES
    echo    - Zip Compress: YES
    echo 4. Click "Build"
    echo.
    pause
    exit /b 1
)

echo [OK] Build directory found
echo.

REM 检查是否启用了MD5缓存（文件名包含哈希）
echo Checking MD5 Cache...
dir /b build\web-mobile\main.*.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MD5 Cache: ENABLED
    echo      Files have MD5 hash in names
) else (
    echo [WARNING] MD5 Cache: NOT ENABLED
    echo           Please enable "MD5 Cache" in build settings
)
echo.

REM 检查文件大小
echo Checking file sizes...
echo.
for %%F in (build\web-mobile\*.js) do (
    echo   %%~nxF: %%~zF bytes
)
echo.

REM 检查是否启用了Zip压缩（检查assets目录结构）
echo Checking Zip Compress...
if exist "build\web-mobile\assets\import\" (
    echo [OK] Resources structure: NORMAL
    echo      Note: Zip Compress creates .zip files in assets/import/
    echo.
    echo      To enable better compression:
    echo      1. Open Cocos Creator
    echo      2. Project -> Build
    echo      3. Check "Zip Compress"
    echo      4. Rebuild
) else (
    echo [INFO] Assets directory structure varies
)
echo.

echo ========================================
echo   Next Steps
echo ========================================
echo.
echo If you see any [WARNING] or [ERROR]:
echo.
echo 1. Open Cocos Creator
echo 2. Click "Project" -> "Build" (Ctrl+Shift+B)
echo 3. Configure build settings:
echo    Platform: Web Mobile
echo    MD5 Cache: YES
echo    Zip Compress: YES
echo 4. Click "Build" and wait for completion
echo 5. Run this script again to verify
echo.
echo ========================================
echo   Expected File Sizes (After Optimization)
echo ========================================
echo.
echo cocos2d-js-min.*.js: ~300-400 KB (compressed)
echo main.*.js:           ~100-200 KB
echo assets/*:            Varies (30-50%% smaller)
echo.
echo Without optimization:
echo cocos2d-js-min.*.js: ~1000 KB (uncompressed)
echo main.*.js:           ~500 KB
echo.
pause