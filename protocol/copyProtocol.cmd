@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo Copying Generated Protocol Files
echo ========================================
echo.

if not exist "out" (
    echo [ERROR] out directory not found!
    echo Please run simpleGen.cmd first
    pause
    exit /b 1
)

echo Copying files to assets directories...
echo.

rem # Copy comm protocol
echo [1/7] Copying commProtocol...
copy /Y "out\mod_commProtocol.js" "..\assets\comm\script\msg\" >nul
copy /Y "out\mod_commProtocol.d.ts" "..\assets\comm\script\msg\" >nul
echo [OK] commProtocol copied

rem # Copy passport protocol
echo [2/7] Copying passportServerProtocol...
copy /Y "out\mod_passportServerProtocol.js" "..\assets\userlogin\script\msg\" >nul
copy /Y "out\mod_passportServerProtocol.d.ts" "..\assets\userlogin\script\msg\" >nul
echo [OK] passportServerProtocol copied

rem # Copy hall protocol
echo [3/7] Copying hallServerProtocol...
copy /Y "out\mod_hallServerProtocol.js" "..\assets\hall\script\msg\" >nul
copy /Y "out\mod_hallServerProtocol.d.ts" "..\assets\hall\script\msg\" >nul
echo [OK] hallServerProtocol copied

rem # Copy MJ_weihai protocol
echo [4/7] Copying MJ_weihai_Protocol...
copy /Y "out\mod_MJ_weihai_Protocol.js" "..\assets\game\MJ_weihai_\script\msg\" >nul
copy /Y "out\mod_MJ_weihai_Protocol.d.ts" "..\assets\game\MJ_weihai_\script\msg\" >nul
echo [OK] MJ_weihai_Protocol copied

rem # Copy club protocol
echo [5/7] Copying clubServerProtocol...
copy /Y "out\mod_clubServerProtocol.js" "..\assets\club\script\msg\" >nul
copy /Y "out\mod_clubServerProtocol.d.ts" "..\assets\club\script\msg\" >nul
echo [OK] clubServerProtocol copied

rem # Copy chat protocol
echo [6/7] Copying chatServerProtocol...
copy /Y "out\mod_chatServerProtocol.js" "..\assets\game\MJ_weihai_\script\msg\" >nul
copy /Y "out\mod_chatServerProtocol.d.ts" "..\assets\game\MJ_weihai_\script\msg\" >nul
echo [OK] chatServerProtocol copied

rem # Copy record protocol
echo [7/7] Copying recordServerProtocol...
copy /Y "out\mod_recordServerProtocol.js" "..\assets\record\script\msg\" >nul
copy /Y "out\mod_recordServerProtocol.d.ts" "..\assets\record\script\msg\" >nul
echo [OK] recordServerProtocol copied

echo.
echo ========================================
echo All files copied successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Open Cocos Creator
echo 2. Rebuild the project
echo 3. Test the game
echo ========================================
pause
