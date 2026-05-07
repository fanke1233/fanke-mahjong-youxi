@echo off
chcp 65001 >nul

echo ========================================
echo Detailed Protobufjs Installation Check
echo ========================================
echo.

echo [1] Checking npm global prefix...
for /f "delims=" %%i in ('npm config get prefix') do set NPM_PREFIX=%%i
echo NPM Prefix: %NPM_PREFIX%
echo.

echo [2] Checking files in NPM_PREFIX...
if exist "%NPM_PREFIX%" (
    echo Directory exists: %NPM_PREFIX%
    echo.
    echo Files matching pbjs*:
    dir /b "%NPM_PREFIX%\pbjs*" 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] No pbjs* files found in %NPM_PREFIX%
    )
    echo.
    echo Files matching pbts*:
    dir /b "%NPM_PREFIX%\pbts*" 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] No pbts* files found in %NPM_PREFIX%
    )
) else (
    echo [ERROR] NPM_PREFIX directory does not exist!
)
echo.

echo [3] Checking protobufjs module location...
if exist "%NPM_PREFIX%\node_modules\protobufjs" (
    echo [OK] protobufjs found at: %NPM_PREFIX%\node_modules\protobufjs
    echo.
    echo Checking bin directory:
    if exist "%NPM_PREFIX%\node_modules\protobufjs\bin" (
        dir /b "%NPM_PREFIX%\node_modules\protobufjs\bin"
    ) else (
        echo [ERROR] bin directory not found!
    )
) else (
    echo [ERROR] protobufjs NOT found in node_modules!
    echo.
    echo [SOLUTION] Try reinstalling:
    echo   npm install -g protobufjs --force
)
echo.

echo [4] Checking AppData\npm directly...
if exist "%APPDATA%\npm" (
    echo Directory exists: %APPDATA%\npm
    echo.
    echo Files matching pbjs*:
    dir /b "%APPDATA%\npm\pbjs*" 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] No pbjs* files found in %APPDATA%\npm
    )
) else (
    echo [ERROR] %APPDATA%\npm does not exist!
)
echo.

echo [5] Checking PATH environment variable...
echo %PATH% | findstr /i "npm" >nul
if %errorlevel% equ 0 (
    echo [OK] PATH contains 'npm'
) else (
    echo [ERROR] PATH does NOT contain npm path!
)
echo.

echo ========================================
echo Diagnosis Complete
echo ========================================
pause
