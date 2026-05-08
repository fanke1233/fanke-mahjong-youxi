
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
echo Step 2: Ensure we are on main branch
git checkout main

echo.
echo Step 3: Add build files to git tracking
git add build/

echo.
echo Step 4: Check status
git status

echo.
echo Step 5: Commit changes (only if there are changes)
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes to commit. Skipping commit.
) else (
    git commit -m "Deploy: Update web build files for GitHub Pages"
)

echo.
echo Step 6: Push to GitHub
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
