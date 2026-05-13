@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Sync and Push to GitHub
echo ========================================
echo.

echo [Step 1] Checking current status...
git log --oneline -3 --no-pager
echo.

echo [Step 2] Fetching remote changes...
git fetch origin main --no-pager
echo.

echo [Step 3] Checking for remote updates...
git log HEAD..origin/main --oneline --no-pager
if %errorlevel% equ 0 (
    echo.
    echo Remote has new commits that need to be merged.
    echo.
    echo [Step 4] Pulling and merging remote changes...
    git pull origin main --no-pager --rebase
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Merge conflict detected!
        echo.
        echo You need to manually resolve conflicts:
        echo 1. Check conflicted files: git status
        echo 2. Edit files to resolve conflicts
        echo 3. Stage resolved files: git add <filename>
        echo 4. Continue rebase: git rebase --continue
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [INFO] Successfully merged remote changes
) else (
    echo [INFO] No remote updates to merge
)
echo.

echo [Step 5] Current commit history:
git log --oneline -5 --no-pager
echo.

echo ========================================
echo   Ready to push to GitHub
echo ========================================
echo.
echo Repository: fanke1233/fanke-mahjong-youxi
echo Branch: main
echo.
echo NOTE: You will be prompted for credentials
echo - Username: fanke1233
echo - Password: Paste your Personal Access Token (PAT)
echo.
pause

echo.
echo [Step 6] Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Push Successful!
    echo ========================================
    echo.
    echo Verify on GitHub:
    echo https://github.com/fanke1233/fanke-mahjong-youxi/tree/main/build/web-mobile
    echo.
    echo GitHub Pages will update in 2-3 minutes
    echo Visit: https://fanke1233.github.io/fanke-mahjong-youxi/
    echo.
    echo Recent commits:
    git log --oneline -3 --no-pager
    echo.
) else (
    echo.
    echo ========================================
    echo   Push Failed!
    echo ========================================
    echo.
    echo Troubleshooting:
    echo 1. Check internet connection
    echo 2. Verify GitHub PAT token is valid
    echo 3. Clear credentials: git config --global --unset credential.helper
    echo 4. Run this script again
    echo.
)

pause
