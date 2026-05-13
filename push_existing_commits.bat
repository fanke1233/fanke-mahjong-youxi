@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Sync and Push to GitHub
echo ========================================
echo.

echo [Step 1] Current status:
git log --oneline -5
echo.

echo [Step 2] Fetching remote changes...
git fetch origin main
if %errorlevel% neq 0 (
    echo [ERROR] Fetch failed! Check internet connection.
    pause
    exit /b 1
)
echo.

echo [Step 3] Checking remote updates...
git log HEAD..origin/main --oneline > temp_remote.txt 2>&1
set /p REMOTE=<temp_remote.txt
del temp_remote.txt

if not "%REMOTE%"=="" (
    if not "%REMOTE:~0,5%"=="error" (
        echo [INFO] Remote has new commits that need to be merged.
        echo Remote commits:
        git log HEAD..origin/main --oneline
        echo.
        echo [Step 4] Merging remote changes...
        git pull origin main --rebase
        if %errorlevel% neq 0 (
            echo.
            echo [ERROR] Merge conflict detected!
            echo.
            echo Manual steps required:
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
    ) else (
        echo [INFO] No remote updates or fetch incomplete
    )
) else (
    echo [INFO] No remote updates to merge
)
echo.

echo [Step 5] Ready to push
echo.
echo Repository: fanke1233/fanke-mahjong-youxi
echo Branch: main
echo.
echo Press any key to push...
echo Git will prompt for credentials if needed:
echo - Username: fanke1233
echo - Password: Personal Access Token (PAT)
echo.
pause

echo.
echo [Step 6] Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS!
    echo ========================================
    echo.
    echo Verify on GitHub:
    echo https://github.com/fanke1233/fanke-mahjong-youxi/tree/main/build/web-mobile
    echo.
    echo GitHub Pages (updates in 2-3 min):
    echo https://fanke1233.github.io/fanke-mahjong-youxi/
    echo.
    echo Recent commits:
    git log --oneline -3
    echo.
) else (
    echo.
    echo ========================================
    echo   FAILED
    echo ========================================
    echo.
    echo Troubleshooting:
    echo 1. Clear credentials: git config --global --unset credential.helper
    echo 2. Check PAT token validity
    echo 3. Run this script again
    echo.
)

pause
