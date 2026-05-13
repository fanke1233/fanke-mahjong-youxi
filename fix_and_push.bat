@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Fix Branch Divergence and Push
echo ========================================
echo.

echo [Step 1] Current status:
echo Local commits:
git log --oneline origin/main..HEAD
echo.
echo Remote commits you don't have:
git log --oneline HEAD..origin/main
echo.

echo [Step 2] Merging remote changes...
git pull origin main --rebase
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Merge conflict detected!
    echo.
    echo Manual resolution required:
    echo 1. git status (check conflicted files)
    echo 2. Edit files to resolve conflicts
    echo 3. git add ^<filename^>
    echo 4. git rebase --continue
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)
echo [INFO] Merge successful
echo.

echo [Step 3] Updated commit history:
git log --oneline -5
echo.

echo [Step 4] Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS!
    echo ========================================
    echo.
    echo All commits pushed to:
    echo https://github.com/fanke1233/fanke-mahjong-youxi
    echo.
    echo Verify build files:
    echo https://github.com/fanke1233/fanke-mahjong-youxi/tree/main/build/web-mobile
    echo.
    echo GitHub Pages (updates in 2-3 min):
    echo https://fanke1233.github.io/fanke-mahjong-youxi/
    echo.
) else (
    echo.
    echo ========================================
    echo   FAILED
    echo ========================================
    echo.
    echo Troubleshooting:
    echo 1. git config --global --unset credential.helper
    echo 2. Check PAT token
    echo 3. Run script again
    echo.
)

pause
