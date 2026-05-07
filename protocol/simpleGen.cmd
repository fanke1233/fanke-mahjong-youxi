@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Simple Protocol Generator (Fixed Version)
echo ========================================
echo.

rem # Check if protobufjs-cli is installed locally
if not exist "node_modules\.bin\pbjs.cmd" (
    echo [ERROR] protobufjs-cli not found!
    echo [INFO] Please run: install_pbjs.cmd
    pause
    exit /b 1
)

set "PBJS=node_modules\.bin\pbjs.cmd"
set "PBTS=node_modules\.bin\pbts.cmd"

echo [INFO] Using local protobufjs-cli
echo [INFO] PBJS: !PBJS!
echo.

rem # Create out directory
if not exist "out" md "out"

echo Generating JavaScript and TypeScript files...
echo.

echo [1/14] Generating commProtocol JS...
call !PBJS! -t static-module -w commonjs --es6 --keep-case --root comm -o .\out\mod_commProtocol.js .\commProtocol.proto
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] commProtocol JS done

echo [2/14] Generating commProtocol TS...
call !PBTS! --main .\out\mod_commProtocol.js -o .\out\mod_commProtocol.d.ts
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] commProtocol TS done

echo [3/14] Generating passportServerProtocol JS...
call !PBJS! -t static-module -w commonjs --es6 --keep-case --root passportServer -o .\out\mod_passportServerProtocol.js .\passportServerProtocol.proto
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] passportServerProtocol JS done

echo [4/14] Generating passportServerProtocol TS...
call !PBTS! --main .\out\mod_passportServerProtocol.js -o .\out\mod_passportServerProtocol.d.ts
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] passportServerProtocol TS done

echo [5/14] Generating hallServerProtocol JS...
call !PBJS! -t static-module -w commonjs --es6 --keep-case --root hallServer -o .\out\mod_hallServerProtocol.js .\hallServerProtocol.proto
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] hallServerProtocol JS done

echo [6/14] Generating hallServerProtocol TS...
call !PBTS! --main .\out\mod_hallServerProtocol.js -o .\out\mod_hallServerProtocol.d.ts
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] hallServerProtocol TS done

echo [7/14] Generating MJ_weihai_Protocol JS...
call !PBJS! -t static-module -w commonjs --es6 --keep-case --root MJ_weihai_ -o .\out\mod_MJ_weihai_Protocol.js .\MJ_weihai_Protocol.proto
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] MJ_weihai_Protocol JS done

echo [8/14] Generating MJ_weihai_Protocol TS...
call !PBTS! --main .\out\mod_MJ_weihai_Protocol.js -o .\out\mod_MJ_weihai_Protocol.d.ts
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] MJ_weihai_Protocol TS done

echo [9/14] Generating clubServerProtocol JS...
call !PBJS! -t static-module -w commonjs --es6 --keep-case --root clubServer -o .\out\mod_clubServerProtocol.js .\clubServerProtocol.proto
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] clubServerProtocol JS done

echo [10/14] Generating clubServerProtocol TS...
call !PBTS! --main .\out\mod_clubServerProtocol.js -o .\out\mod_clubServerProtocol.d.ts
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] clubServerProtocol TS done

echo [11/14] Generating chatServerProtocol JS...
call !PBJS! -t static-module -w commonjs --es6 --keep-case --root chatServer -o .\out\mod_chatServerProtocol.js .\chatServerProtocol.proto
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] chatServerProtocol JS done

echo [12/14] Generating chatServerProtocol TS...
call !PBTS! --main .\out\mod_chatServerProtocol.js -o .\out\mod_chatServerProtocol.d.ts
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] chatServerProtocol TS done

echo [13/14] Generating recordServerProtocol JS...
call !PBJS! -t static-module -w commonjs --es6 --keep-case --root recordServer -o .\out\mod_recordServerProtocol.js .\recordServerProtocol.proto
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] recordServerProtocol JS done

echo [14/14] Generating recordServerProtocol TS...
call !PBTS! --main .\out\mod_recordServerProtocol.js -o .\out\mod_recordServerProtocol.d.ts
if !errorlevel! neq 0 (echo [ERROR] Failed & pause & exit /b 1)
echo [OK] recordServerProtocol TS done

echo.
echo ========================================
echo All protocol files generated successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Copy out\mod_*.js to assets\**\script\msg\
echo 2. Copy out\mod_*.d.ts to assets\**\script\msg\
echo 3. Rebuild project in Cocos Creator
echo ========================================
pause
