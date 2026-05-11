@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   One-Click Deploy to GitHub Pages
echo ========================================
echo.

echo [Step 1] Checking build directory...
if not exist "build\web-mobile" (
    echo [ERROR] build/web-mobile directory not found!
    echo Please build the project in Cocos Creator first.
    echo.
    pause
    exit /b 1
)
echo [OK] Build directory exists
echo.

echo [Step 2] Checking Git status...
git status --short
echo.

echo [Step 3] Removing old build files from Git tracking...
git rm -rf build/web-mobile/ >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Old build files removed from Git
) else (
    echo [INFO] No old build files to remove
)
echo.

echo [Step 4] Adding build files...
git add -f build/web-mobile/
if %errorlevel% neq 0 (
    echo [ERROR] Failed to add build files!
    pause
    exit /b 1
)
echo [OK] Build files added
echo.

echo [Step 5] Adding other changes...
git add deploy_and_verify.bat push_existing_commits.bat push_last_commit.bat fix_and_push.bat .gitignore >nul 2>&1
echo [OK] Other files added
echo.

echo [Step 6] Checking for changes...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo [WARNING] No changes detected!
    echo Nothing to commit.
    echo.
    pause
    exit /b 0
)
echo [OK] Changes detected
echo.

echo [Step 7] Summary of changes...
for /f "tokens=*" %%i in ('git diff --cached --name-only ^| find /c /v ""') do set FILE_COUNT=%%i
echo Total files to commit: %FILE_COUNT%
echo.

echo [Step 8] Committing changes...
git commit -m "Deploy: Update build and deployment scripts"
if %errorlevel% neq 0 (
    echo [ERROR] Commit failed!
    pause
    exit /b 1
)
echo [OK] Commit successful
echo.

echo [Step 9] Fetching remote updates...
git fetch origin main
echo [OK] Fetch completed
echo.

echo [Step 10] Checking for remote updates...
git log HEAD..origin/main --oneline > temp_remote.txt 2>&1
findstr /C:"error" temp_remote.txt >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] No remote updates
    del temp_remote.txt >nul 2>&1
) else (
    findstr /C:"error" temp_remote.txt >nul 2>&1
    if %errorlevel% neq 0 (
        echo [INFO] Merging remote updates...
        git pull origin main --rebase
        if %errorlevel% neq 0 (
            echo.
            echo [ERROR] Merge conflict detected!
            echo Please resolve conflicts manually:
            echo 1. git status
            echo 2. Edit conflicted files
            echo 3. git add ^<filename^>
            echo 4. git rebase --continue
            echo 5. Run this script again
            echo.
            del temp_remote.txt >nul 2>&1
            pause
            exit /b 1
        )
        echo [OK] Remote updates merged
    ) else (
        echo [INFO] No remote updates
    )
    del temp_remote.txt >nul 2>&1
)
echo.

echo [Step 11] Current commit history...
git log --oneline -3
echo.

echo ========================================
echo   Ready to push to GitHub
echo ========================================
echo.
echo Repository: fanke1233/fanke-mahjong-youxi
echo Branch: main
echo.
pause

echo.
echo [Step 12] Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   Push Failed!
    echo ========================================
    echo.
    echo Troubleshooting:
    echo 1. Check internet connection
    echo 2. Clear credentials: git config --global --unset credential.helper
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)
echo [OK] Push successful
echo.

echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Repository: https://github.com/fanke1233/fanke-mahjong-youxi
echo.
echo Verification:
echo 1. GitHub: https://github.com/fanke1233/fanke-mahjong-youxi/tree/main/build/web-mobile
echo 2. GitHub Pages: https://fanke1233.github.io/fanke-mahjong-youxi/
echo.
echo Wait 2-3 minutes for GitHub Pages to update.
echo.
pause
