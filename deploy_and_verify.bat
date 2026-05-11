@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Deploy to GitHub Pages (One-Click)
echo ========================================
echo.

echo [Step 1] Checking Git status...
git status --short --no-pager
echo.

echo [Step 2] Removing old build files from Git tracking...
git rm -rf build/web-mobile/ 2>nul
if %errorlevel% neq 0 (
    echo [INFO] No old build files to remove or already removed
)
echo.

echo [Step 3] Adding all changes including new build files...
git add -A
echo.

echo [Step 4] Checking for changes to commit...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo [WARNING] No changes detected. Nothing to commit.
    echo.
    echo Please verify:
    echo - Have you made any code changes?
    echo - Did you rebuild the project in Cocos Creator?
    echo.
    pause
    exit /b 0
)
echo.

echo [Step 5] Summary of changes (showing file count only)...
for /f "tokens=*" %%i in ('git diff --cached --name-only ^| find /c /v ""') do set FILE_COUNT=%%i
echo Total files to commit: %FILE_COUNT%
echo.
echo File types breakdown:
git diff --cached --name-only | findstr /C:".ts" /C:".js" /C:".json" /C:".html" | find /c /v "" > temp_count.txt
set /p TS_JS_COUNT=<temp_count.txt
del temp_count.txt
echo TypeScript/JavaScript/JSON/HTML files: %TS_JS_COUNT%
echo.

echo [Step 6] Committing changes...
git commit -m "Deploy: Update client code and rebuild web-mobile"
if %errorlevel% neq 0 (
    echo [ERROR] Commit failed!
    echo Possible reasons:
    echo - Git not configured (run: git config user.name and git config user.email)
    echo - Merge conflicts
    echo.
    pause
    exit /b 1
)
echo.

echo [Step 7] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [ERROR] Push failed!
    echo.
    echo Troubleshooting:
    echo 1. Check your internet connection
    echo 2. Verify GitHub token is valid
    echo 3. Run: git remote -v to check remote URL
    echo 4. Clear credentials: git config --global --unset credential.helper
    echo.
    pause
    exit /b 1
)
echo.

echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Repository: https://github.com/fanke1233/fanke-mahjong-youxi
echo.
echo Next Steps:
echo.
echo 1. Verify files on GitHub:
echo    https://github.com/fanke1233/fanke-mahjong-youxi/tree/main/build/web-mobile
echo.
echo 2. Configure GitHub Pages (if not already configured):
echo    - Go to: https://github.com/fanke1233/fanke-mahjong-youxi/settings/pages
echo    - Source: Deploy from a branch
echo    - Branch: main
echo    - Folder: /build/web-mobile/
echo    - Click Save
echo.
echo 3. Wait 2-3 minutes for GitHub Pages to update
echo.
echo 4. Visit your site:
echo    https://fanke1233.github.io/fanke-mahjong-youxi/
echo.
echo ========================================
echo   Verification Commands:
echo ========================================
echo.
echo Recent commits:
git log --oneline -3 --no-pager
echo.
echo Remote repository:
git remote -v --no-pager
echo.
pause
