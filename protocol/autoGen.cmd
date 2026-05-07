@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Generating Protocol Files
echo ========================================
echo.

rd /s/q .\out
md .\out

rem # Set protoc absolute path
set "PROTOC=D:\tools\protoc-25.1-win64\bin\protoc.exe"

echo [1/7] Generating commProtocol...
%PROTOC% --java_out=.\out .\commProtocol.proto
echo [2/7] Generating passportServerProtocol...
%PROTOC% --java_out=.\out .\passportServerProtocol.proto
echo [3/7] Generating hallServerProtocol...
%PROTOC% --java_out=.\out .\hallServerProtocol.proto
echo [4/7] Generating MJ_weihai_Protocol...
%PROTOC% --java_out=.\out .\MJ_weihai_Protocol.proto
echo [5/7] Generating clubServerProtocol...
%PROTOC% --java_out=.\out .\clubServerProtocol.proto
echo [6/7] Generating chatServerProtocol...
%PROTOC% --java_out=.\out .\chatServerProtocol.proto
echo [7/7] Generating recordServerProtocol...
%PROTOC% --java_out=.\out .\recordServerProtocol.proto

echo.
echo Java code generation completed.
echo.

rem # Find protobufjs installation
set "PBJS="
set "PBTS="
set "USE_NPX=0"

rem # Try 0: Check if npx is available (last resort fallback)
where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] npx is available, will use as last resort
    set "USE_NPX=1"
)

rem # Try 1: Check if pbjs.cmd exists in PATH (npm global bin)
where pbjs >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('where pbjs') do (
        set "PBJS=%%i"
        set "PBTS=%%~dpi\pbts.cmd"
        echo [INFO] Found pbjs in PATH: !PBJS!
        goto :pbjs_found
    )
)

rem # Try 2: Use Node.js to directly run pbjs from global installation
rem This bypasses the need for .cmd wrapper files
for /f "delims=" %%i in ('npm config get prefix 2^>nul') do set NPM_PREFIX=%%i
if exist "!NPM_PREFIX!\node_modules\protobufjs\bin\pbjs" (
    set "PBJS=!NPM_PREFIX!\node_modules\protobufjs\bin\pbjs"
    set "PBTS=!NPM_PREFIX!\node_modules\protobufjs\bin\pbts"
    echo [INFO] Found pbjs script at: !PBJS!
    echo [INFO] Will use: node "!PBJS!"
    goto :pbjs_found
)

rem # Try 3: NODE_HOME (global installation)
if not "%NODE_HOME%"=="" (
    if exist "%NODE_HOME%\node_modules\protobufjs\bin\pbjs" (
        set "PBJS=%NODE_HOME%\node_modules\protobufjs\bin\pbjs"
        set "PBTS=%NODE_HOME%\node_modules\protobufjs\bin\pbts"
        echo [INFO] Found protobufjs in NODE_HOME
        goto :pbjs_found
    )
)

rem # Try 4: User AppData (npm global default) - check .cmd files first
if exist "%APPDATA%\npm\pbjs.cmd" (
    set "PBJS=%APPDATA%\npm\pbjs.cmd"
    set "PBTS=%APPDATA%\npm\pbts.cmd"
    echo [INFO] Found pbjs in AppData\npm (direct)
    goto :pbjs_found
)

if exist "%APPDATA%\npm\node_modules\protobufjs\bin\pbjs.cmd" (
    set "PBJS=%APPDATA%\npm\node_modules\protobufjs\bin\pbjs.cmd"
    set "PBTS=%APPDATA%\npm\node_modules\protobufjs\bin\pbts.cmd"
    echo [INFO] Found protobufjs in NPM global (AppData)
    goto :pbjs_found
)

rem # Try 5: Check system npm prefix
for /f "tokens=*" %%i in ('npm config get prefix 2^>nul') do set "NPM_PREFIX=%%i"
if exist "!NPM_PREFIX!\pbjs.cmd" (
    set "PBJS=!NPM_PREFIX!\pbjs.cmd"
    set "PBTS=!NPM_PREFIX!\pbts.cmd"
    echo [INFO] Found pbjs in NPM prefix (direct)
    goto :pbjs_found
)

if exist "!NPM_PREFIX!\node_modules\protobufjs\bin\pbjs.cmd" (
    set "PBJS=!NPM_PREFIX!\node_modules\protobufjs\bin\pbjs.cmd"
    set "PBTS=!NPM_PREFIX!\node_modules\protobufjs\bin\pbts.cmd"
    echo [INFO] Found protobufjs in NPM prefix
    goto :pbjs_found
)

:pbjs_found
if "%PBJS%"=="" (
    rem # Try fallback: Use npx if available
    if "!USE_NPX!"=="1" (
        echo [WARNING] pbjs not found in PATH, using npx as fallback
        echo [INFO] npx will download protobufjs if not cached (may take 30s-2min on first run)
        set "PBJS=npx pbjs"
        set "PBTS=npx pbts"
        goto :pbjs_found_success
    )
    
    echo [ERROR] protobufjs not found!
    echo.
    echo Please install: npm install -g protobufjs
    echo.
    echo And add this to your system PATH:
    echo   %APPDATA%\npm
    echo.
    pause
    exit /b 1
)

:pbjs_found_success
echo.
echo Found protobufjs at: !PBJS!
echo.

rem # Create wrapper commands based on whether we're using npx or direct path
if "!USE_NPX!"=="1" (
    if "!PBJS!"=="npx pbjs" (
        set "CMD_PBJS=npx pbjs"
        set "CMD_PBTS=npx pbts"
        echo [INFO] Using npx mode (will download if needed)
        goto :cmd_setup_done
    )
)

rem # Check if PBJS points to a .cmd file or a .js file
echo !PBJS! | findstr /i "\.cmd$" >nul
if %errorlevel% equ 0 (
    rem It's a .cmd file, use directly
    set "CMD_PBJS=!PBJS!"
    set "CMD_PBTS=!PBTS!"
    echo [INFO] Using .cmd wrapper mode
) else (
    rem It's a .js file, use node to execute
    set "CMD_PBJS=node "!PBJS!""
    set "CMD_PBTS=node "!PBTS!""
    echo [INFO] Using direct node execution mode
)

:cmd_setup_done
echo [INFO] Command: !CMD_PBJS!
echo.

echo Generating JavaScript and TypeScript files...
echo.

echo [1/14] Generating commProtocol JS...
!CMD_PBJS! -t static-module -w commonjs --es6 --keep-case --root comm -o .\out\mod_commProtocol.js .\commProtocol.proto
echo [2/14] Generating commProtocol TS...
!CMD_PBTS! -o .\out\mod_commProtocol.d.ts .\out\mod_commProtocol.js

echo [3/14] Generating passportServerProtocol JS...
!CMD_PBJS! -t static-module -w commonjs --es6 --keep-case --root passportServer -o .\out\mod_passportServerProtocol.js .\passportServerProtocol.proto
echo [4/14] Generating passportServerProtocol TS...
!CMD_PBTS! -o .\out\mod_passportServerProtocol.d.ts .\out\mod_passportServerProtocol.js

echo [5/14] Generating hallServerProtocol JS...
!CMD_PBJS! -t static-module -w commonjs --es6 --keep-case --root hallServer -o .\out\mod_hallServerProtocol.js .\hallServerProtocol.proto
echo [6/14] Generating hallServerProtocol TS...
!CMD_PBTS! -o .\out\mod_hallServerProtocol.d.ts .\out\mod_hallServerProtocol.js

echo [7/14] Generating MJ_weihai_Protocol JS...
!CMD_PBJS! -t static-module -w commonjs --es6 --keep-case --root MJ_weihai_ -o .\out\mod_MJ_weihai_Protocol.js .\MJ_weihai_Protocol.proto
echo [8/14] Generating MJ_weihai_Protocol TS...
!CMD_PBTS! -o .\out\mod_MJ_weihai_Protocol.d.ts .\out\mod_MJ_weihai_Protocol.js

echo [9/14] Generating clubServerProtocol JS...
!CMD_PBJS! -t static-module -w commonjs --es6 --keep-case --root clubServer -o .\out\mod_clubServerProtocol.js .\clubServerProtocol.proto
echo [10/14] Generating clubServerProtocol TS...
!CMD_PBTS! -o .\out\mod_clubServerProtocol.d.ts .\out\mod_clubServerProtocol.js

echo [11/14] Generating chatServerProtocol JS...
!CMD_PBJS! -t static-module -w commonjs --es6 --keep-case --root chatServer -o .\out\mod_chatServerProtocol.js .\chatServerProtocol.proto
echo [12/14] Generating chatServerProtocol TS...
!CMD_PBTS! -o .\out\mod_chatServerProtocol.d.ts .\out\mod_chatServerProtocol.js

echo [13/14] Generating recordServerProtocol JS...
!CMD_PBJS! -t static-module -w commonjs --es6 --keep-case --root recordServer -o .\out\mod_recordServerProtocol.js .\recordServerProtocol.proto
echo [14/14] Generating recordServerProtocol TS...
!CMD_PBTS! -o .\out\mod_recordServerProtocol.d.ts .\out\mod_recordServerProtocol.js

echo.
echo ========================================
echo All protocol files generated successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Copy generated files from .\out\ to corresponding msg\ directories
echo 2. Reload VSCode window if TypeScript errors persist
echo.

rem # Sync generated files to corresponding msg directories
echo.
echo ========================================
echo Syncing Protocol Files to Assets Directories
echo ========================================
echo.

echo [1/7] Syncing commProtocol to comm/msg...
copy /y .\out\mod_commProtocol.js ..\assets\comm\script\msg\mod_commProtocol.js >nul
copy /y .\out\mod_commProtocol.d.ts ..\assets\comm\script\msg\mod_commProtocol.d.ts >nul
echo [2/7] Syncing passportServerProtocol to userlogin/msg...
copy /y .\out\mod_passportServerProtocol.js ..\assets\userlogin\script\msg\mod_passportServerProtocol.js >nul
copy /y .\out\mod_passportServerProtocol.d.ts ..\assets\userlogin\script\msg\mod_passportServerProtocol.d.ts >nul
echo [3/7] Syncing hallServerProtocol to hall/msg...
copy /y .\out\mod_hallServerProtocol.js ..\assets\hall\script\msg\mod_hallServerProtocol.js >nul
copy /y .\out\mod_hallServerProtocol.d.ts ..\assets\hall\script\msg\mod_hallServerProtocol.d.ts >nul
echo [4/7] Syncing MJ_weihai_Protocol to game/MJ_weihai_/script/msg...
copy /y .\out\mod_MJ_weihai_Protocol.js ..\assets\game\MJ_weihai_\script\msg\mod_MJ_weihai_Protocol.js >nul
copy /y .\out\mod_MJ_weihai_Protocol.d.ts ..\assets\game\MJ_weihai_\script\msg\mod_MJ_weihai_Protocol.d.ts >nul
echo [5/7] Syncing clubServerProtocol to club/msg...
copy /y .\out\mod_clubServerProtocol.js ..\assets\club\script\msg\mod_clubServerProtocol.js >nul
copy /y .\out\mod_clubServerProtocol.d.ts ..\assets\club\script\msg\mod_clubServerProtocol.d.ts >nul
echo [6/7] Syncing chatServerProtocol to chat/msg...
copy /y .\out\mod_chatServerProtocol.js ..\assets\chat\script\msg\mod_chatServerProtocol.js >nul
copy /y .\out\mod_chatServerProtocol.d.ts ..\assets\chat\script\msg\mod_chatServerProtocol.d.ts >nul
echo [7/7] Syncing recordServerProtocol to record/msg...
copy /y .\out\mod_recordServerProtocol.js ..\assets\record\script\msg\mod_recordServerProtocol.js >nul
copy /y .\out\mod_recordServerProtocol.d.ts ..\assets\record\script\msg\mod_recordServerProtocol.d.ts >nul

echo.
echo ========================================
echo All protocol files synced successfully!
echo ========================================
echo.

pause
