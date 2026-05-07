
@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Deploy Web Build to GitHub Pages
echo ========================================
echo.

echo Step 1: Check if build/web-mobile exists
if not exist "build\web-mobile" (
    echo ERROR: build\web-mobile directory not found!
    echo Please build the project in Cocos Creator first.
    pause
    exit /b 1
)

echo.
echo Step 2: Switch to main branch
git checkout main

echo.
echo Step 3: Clean old build files (keep source code)
git rm -rf --cached build/ 2>nul
rmdir /s /q build 2>nul

echo.
echo Step 4: Copy web build files to build/web-mobile
xcopy /E /I /Y build\web-mobile\*.* build\web-mobile\ 2>nul

echo.
echo Step 5: Add build files to git
git add build/

echo.
echo Step 6: Check status
git status

echo.
echo Step 7: Commit changes
git commit -m "Deploy: Update web build files"

echo.
echo Step 8: Push to GitHub
git push origin main

echo.
echo ========================================
echo   Deploy Complete!
echo ========================================
echo.
echo Your site will be published at:
echo https://fanke1233.github.io/fanke-mahjong-youxi/
echo.
echo IMPORTANT: GitHub Pages Configuration
echo 1. Go to: https://github.com/fanke1233/fanke-mahjong-youxi/settings/pages
echo 2. Source: Deploy from a branch
echo 3. Branch: main
echo 4. Folder: /build/web-mobile/
echo 5. Click Save and wait 2-3 minutes
echo.
pause
