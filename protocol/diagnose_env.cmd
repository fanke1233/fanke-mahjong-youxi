@echo off
chcp 65001 >nul

echo ========================================
echo Environment Diagnosis for autoGen.cmd
echo ========================================
echo.

echo [1] Checking NODE_HOME...
if "%NODE_HOME%"=="" (
    echo [ERROR] NODE_HOME is NOT set!
) else (
    echo [OK] NODE_HOME=%NODE_HOME%
    if exist "%NODE_HOME%\node.exe" (
        echo [OK] node.exe found at: %NODE_HOME%\node.exe
    ) else (
        echo [ERROR] node.exe NOT found at: %NODE_HOME%\node.exe
    )
)
echo.

echo [2] Checking Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('where node') do (
        echo [OK] node found at: %%i
        goto :node_check_done
    )
) else (
    echo [ERROR] node command NOT found in PATH!
)
:node_check_done
echo.

echo [3] Checking npm...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('where npm') do (
        echo [OK] npm found at: %%i
        goto :npm_check_done
    )
) else (
    echo [ERROR] npm command NOT found in PATH!
)
:npm_check_done
echo.

echo [4] Checking protobufjs (pbjs)...
where pbjs >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('where pbjs') do (
        echo [OK] pbjs found at: %%i
        goto :pbjs_check_done
    )
) else (
    echo [WARNING] pbjs command NOT found in PATH!
    echo [INFO] This is OK if protobufjs is installed globally but not in PATH
)
:pbjs_check_done
echo.

echo [5] Checking protobufjs installation locations...
set "FOUND_PBJS=0"

rem Check NODE_HOME
if not "%NODE_HOME%"=="" (
    if exist "%NODE_HOME%\node_modules\protobufjs\bin\pbjs" (
        echo [OK] Found pbjs in NODE_HOME: %NODE_HOME%\node_modules\protobufjs\bin\pbjs
        set "FOUND_PBJS=1"
    )
)

rem Check AppData
if exist "%APPDATA%\npm\node_modules\protobufjs\bin\pbjs" (
    echo [OK] Found pbjs in AppData: %APPDATA%\npm\node_modules\protobufjs\bin\pbjs
    set "FOUND_PBJS=1"
)

rem Check npm prefix
for /f "tokens=*" %%i in ('npm config get prefix 2^>nul') do set "NPM_PREFIX=%%i"
if exist "!NPM_PREFIX!\node_modules\protobufjs\bin\pbjs" (
    echo [OK] Found pbjs in NPM prefix: !NPM_PREFIX!\node_modules\protobufjs\bin\pbjs
    set "FOUND_PBJS=1"
)

if "%FOUND_PBJS%"=="0" (
    echo [ERROR] protobufjs NOT found in any location!
    echo [SOLUTION] Run: npm install -g protobufjs
)
echo.

echo [6] Checking protoc...
if exist "D:\tools\protoc-25.1-win64\bin\protoc.exe" (
    echo [OK] protoc found at: D:\tools\protoc-25.1-win64\bin\protoc.exe
) else (
    echo [ERROR] protoc NOT found at: D:\tools\protoc-25.1-win64\bin\protoc.exe
)
echo.

echo ========================================
echo Diagnosis Complete
echo ========================================
echo.
pause
