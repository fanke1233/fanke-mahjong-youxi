
@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Deploy Web Build to main branch
echo ========================================
echo.

echo Step 1: Switch to main branch
git checkout main

echo.
echo Step 2: Remove old files one by one
rmdir /s /q assets 2>nul
rmdir /s /q protocol 2>nul
rmdir /s /q temp 2>nul
rmdir /s /q library 2>nul
rmdir /s /q local 2>nul
rmdir /s /q build 2>nul
del /q creator.d.ts 2>nul
del /q *.fire 2>nul
del /q *.meta 2>nul
del /q *.ts 2>nul

echo.
echo Step 3: Remove deleted files from git
git add -A

echo.
echo Step 4: Copy web build files
xcopy /E /I /Y build\web-mobile\*.* .

echo.
echo Step 5: Add all files to git
git add .

echo.
echo Step 6: Check status
git status

echo.
echo Step 7: Commit changes
git commit -m "Deploy: Replace source code with web build files"

echo.
echo Step 8: Push to GitHub
git push origin main --force

echo.
echo ========================================
echo   Deploy Complete!
echo ========================================
echo.
echo Your site will be published at:
echo https://fanke1233.github.io/fanke-mahjong-youxi/
echo.
echo Please wait 2-3 minutes for GitHub Pages to build.
echo.
pause
