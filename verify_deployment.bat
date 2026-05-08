@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Verify GitHub Pages Deployment
echo ========================================
echo.

echo Checking Git status...
git log --oneline -3
echo.

echo Checking if build/web-mobile is tracked...
git ls-tree -r HEAD --name-only | findstr "build/web-mobile"
echo.

echo Remote repository URL:
git remote -v
echo.

echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Verify files are on GitHub:
echo    Visit: https://github.com/fanke1233/fanke-mahjong-youxi/tree/main/build/web-mobile
echo.
echo 2. Configure GitHub Pages:
echo    - Go to: https://github.com/fanke1233/fanke-mahjong-youxi/settings/pages
echo    - Source: Deploy from a branch
echo    - Branch: main
echo    - Folder: /build/web-mobile/
echo    - Click Save
echo.
echo 3. Wait 2-3 minutes, then visit:
echo    https://fanke1233.github.io/fanke-mahjong-youxi/
echo.
pause
