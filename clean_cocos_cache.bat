@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Clean Cocos Creator Cache
echo ========================================
echo.

echo Step 1: Close Cocos Creator FIRST!
echo Please make sure Cocos Creator is completely closed.
pause

echo.
echo Step 2: Removing cache directories...
rmdir /s /q library 2>nul
rmdir /s /q temp 2>nul
rmdir /s /q local 2>nul

echo.
echo Step 3: Removing hidden cache files...
del /q /s *.meta~ 2>nul
del /q /s .DS_Store 2>nul

echo.
echo Step 4: Fixing any remaining plugin settings...
powershell -Command "Get-ChildItem -Recurse -Filter *.meta | ForEach-Object { $content = Get-Content $_.FullName -Raw; if ($content -match '\"isPlugin\":\s*true') { $content = $content -replace '\"isPlugin\":\s*true', '\"isPlugin\": false'; Set-Content $_.FullName $content -NoNewline; Write-Host 'Fixed: ' $_.FullName } }"

echo.
echo ========================================
echo   Cache Clean Complete!
echo ========================================
echo.
echo Now you can:
echo 1. Open Cocos Creator
echo 2. Reload the project
echo 3. Wait for rebuild to complete
echo.
pause
