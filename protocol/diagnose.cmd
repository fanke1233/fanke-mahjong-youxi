@echo off
chcp 65001 >nul
echo ========================================
echo Protobuf Protocol Generation Diagnostic
echo ========================================
echo.

echo [Step 1] Check protoc.exe availability...
D:\tools\protoc-25.1-win64\bin\protoc.exe --version
if errorlevel 1 (
    echo [ERROR] protoc.exe not found!
    pause
    exit /b 1
)
echo [OK] protoc.exe is available.
echo.

echo [Step 2] Check proto file syntax...
if not exist "MJ_weihai_Protocol.proto" (
    echo [ERROR] MJ_weihai_Protocol.proto not found!
    pause
    exit /b 1
)
echo [OK] Proto file exists.
echo.

echo [Step 3] Clean and create output directory...
if exist ".\out" rd /s/q .\out
md .\out
echo [OK] Output directory ready.
echo.

echo [Step 4] Generate Java code from proto...
D:\tools\protoc-25.1-win64\bin\protoc.exe --java_out=.\out .\MJ_weihai_Protocol.proto
if errorlevel 1 (
    echo [ERROR] Failed to generate Java code!
    pause
    exit /b 1
)
echo [OK] Java code generated successfully.
echo.

echo [Step 5] Check Node.js environment...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found in PATH!
    echo Please install Node.js and add it to PATH.
    pause
    exit /b 1
)
echo [OK] Node.js is available.
echo.

echo [Step 6] Check if protobufjs is installed...
where pbjs >nul 2>&1
if errorlevel 1 (
    echo [WARNING] pbjs not found in PATH.
    echo Trying to use npx...
    npx pbjs --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] protobufjs not found!
        echo Please run: npm install -g protobufjs
        pause
        exit /b 1
    )
    set PBJS=npx pbjs
    set PBTS=npx pbts
    echo [OK] Using npx to run protobufjs.
) else (
    set PBJS=pbjs
    set PBTS=pbts
    echo [OK] protobufjs is available.
)
echo.

echo [Step 7] Generate JavaScript code...
%PBJS% -t static-module -w commonjs --es6 --keep-case --root MJ_weihai_ -o .\out\mod_MJ_weihai_Protocol.js .\MJ_weihai_Protocol.proto
if errorlevel 1 (
    echo [ERROR] Failed to generate JavaScript code!
    pause
    exit /b 1
)
echo [OK] JavaScript code generated successfully.
echo.

echo [Step 8] Generate TypeScript definition...
%PBTS% -o .\out\mod_MJ_weihai_Protocol.d.ts .\out\mod_MJ_weihai_Protocol.js
if errorlevel 1 (
    echo [ERROR] Failed to generate TypeScript definition!
    pause
    exit /b 1
)
echo [OK] TypeScript definition generated successfully.
echo.

echo [Step 9] Verify generated files...
if not exist ".\out\mod_MJ_weihai_Protocol.js" (
    echo [ERROR] JavaScript file not generated!
    pause
    exit /b 1
)
if not exist ".\out\mod_MJ_weihai_Protocol.d.ts" (
    echo [ERROR] TypeScript definition file not generated!
    pause
    exit /b 1
)
echo [OK] All files generated successfully.
echo.

echo [Step 10] Check for laiGenTile and laiZiTile...
findstr /C:"laiGenTile" .\out\mod_MJ_weihai_Protocol.d.ts >nul
if errorlevel 1 (
    echo [WARNING] laiGenTile field not found!
) else (
    echo [OK] laiGenTile field found.
)

findstr /C:"laiZiTile" .\out\mod_MJ_weihai_Protocol.d.ts >nul
if errorlevel 1 (
    echo [WARNING] laiZiTile field not found!
) else (
    echo [OK] laiZiTile field found.
)
echo.

echo ========================================
echo Diagnostic completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .\out\mod_MJ_weihai_Protocol.js to assets\game\MJ_weihai_\script\msg\
echo 2. Copy .\out\mod_MJ_weihai_Protocol.d.ts to assets\game\MJ_weihai_\script\msg\
echo 3. Reload VSCode window
echo.
pause
