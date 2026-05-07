@echo off
chcp 65001 >nul

echo Testing npx pbjs availability...
echo.

where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npx not found!
    pause
    exit /b 1
)

echo [OK] npx found
echo.
echo Testing pbjs with npx (this may take 30s-2min on first run)...
echo.

npx pbjs --version
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] npx pbjs is working!
    echo.
    echo You can now run: autoGen.cmd
) else (
    echo.
    echo [ERROR] npx pbjs failed!
)

echo.
pause
