@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Installing protobufjs-cli
echo ========================================
echo.

rem # Uninstall old versions
echo [1/3] Removing old packages...
call npm uninstall protobufjs-cli 2>nul
call npm uninstall protobufjs 2>nul

rem # Install protobufjs-cli (this includes pbjs command)
echo.
echo [2/3] Installing protobufjs-cli...
echo [INFO] This package provides pbjs and pbts commands
call npm install protobufjs-cli
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install protobufjs-cli
    echo.
    echo Trying alternative approach...
    call npm install protobufjs@6.11.2
    if !errorlevel! neq 0 (
        echo [ERROR] All installation attempts failed
        pause
        exit /b 1
    )
)

echo.
echo [3/3] Verifying installation...
if exist "node_modules\.bin\pbjs.cmd" (
    echo [OK] pbjs.cmd found in node_modules\.bin
    set "PBJS=node node_modules\.bin\pbjs.cmd"
    set "PBTS=node node_modules\.bin\pbts.cmd"
) else if exist "node_modules\protobufjs-cli\bin\pbjs" (
    echo [OK] pbjs found in protobufjs-cli/bin
    set "PBJS=node node_modules\protobufjs-cli\bin\pbjs"
    set "PBTS=node node_modules\protobufjs-cli\bin\pbts"
) else (
    echo [WARNING] pbjs not found in expected locations
    echo Searching...
    dir /s /b "node_modules\*pbjs*" 2>nul
    echo.
    echo [ERROR] Cannot find pbjs executable
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Installation complete!
echo.
echo [INFO] PBJS: !PBJS!
echo.

rem # Test pbjs
echo Testing pbjs...
!PBJS! --version
if !errorlevel! equ 0 (
    echo [OK] pbjs is working!
) else (
    echo [WARNING] pbjs test failed, but files may still be generated
)

echo.
echo ========================================
echo You can now use pbjs to generate files
echo ========================================
pause
