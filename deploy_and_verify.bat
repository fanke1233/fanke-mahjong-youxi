@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   One-Click Deploy to GitHub Pages
echo ========================================
echo.

echo [Step 1] Checking Git status...
git status --short
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

echo [Step 5] Summary of changes...
for /f "tokens=*" %%i in ('git diff --cached --name-only ^| find /c /v ""') do set FILE_COUNT=%%i
echo Total files to commit: %FILE_COUNT%
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
echo [INFO] Commit successful
echo.

echo [Step 7] Fetching remote changes...
git fetch origin main
echo.

echo [Step 8] Checking for remote updates...
git log HEAD..origin/main --oneline > temp_remote_commits.txt 2>&1
set /p REMOTE_COMMITS=<temp_remote_commits.txt
del temp_remote_commits.txt

if not "%REMOTE_COMMITS%"=="" (
    if not "%REMOTE_COMMITS:~0,5%"=="error" (
        echo [INFO] Remote has new commits that need to be merged.
        echo.
        echo [Step 9] Pulling and merging remote changes...
        git pull origin main --rebase
        if %errorlevel% neq 0 (
            echo.
            echo [ERROR] Merge conflict detected!
            echo.
            echo You need to manually resolve conflicts:
            echo 1. Check conflicted files: git status
            echo 2. Edit files to resolve conflicts
            echo 3. Stage resolved files: git add ^<filename^>
            echo 4. Continue rebase: git rebase --continue
            echo 5. Run this script again
            echo.
            pause
            exit /b 1
        )
        echo [INFO] Successfully merged remote changes
    ) else (
        echo [INFO] No remote updates to merge or fetch failed
    )
) else (
    echo [INFO] No remote updates to merge
)
echo.

echo [Step 10] Current commit history:
git log --oneline -5
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
echo [Step 11] Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
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
git log --oneline -3
echo.
echo Remote repository:
git remote -v
echo.
pause
