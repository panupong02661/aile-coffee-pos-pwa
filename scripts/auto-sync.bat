@echo off
REM ============================================================
REM  Auto-Sync watcher — Lovable -> Local -> Capacitor
REM  ใช้งาน: เปิด CMD ที่โฟลเดอร์โปรเจกต์ แล้วรัน:
REM     scripts\auto-sync.bat
REM  ปล่อยหน้าต่างเปิดค้างไว้ — จะเช็ค commit ใหม่ทุก 60 วิ
REM  พอเจอ commit ใหม่: git pull -> npm install (ถ้า package เปลี่ยน)
REM                     -> npm run build -> npx cap sync android
REM                     -> เสียง beep แจ้งเตือน "พร้อม Build APK"
REM ============================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Lovable Auto-Sync

set INTERVAL=60

echo.
echo ========================================================
echo   Lovable Auto-Sync กำลังทำงาน
echo   เช็คทุก %INTERVAL% วินาที — กด Ctrl+C เพื่อหยุด
echo ========================================================
echo.

:LOOP
echo [%date% %time%] เช็ค commit ใหม่จาก Lovable...

git fetch origin >nul 2>&1
if errorlevel 1 (
    echo    [!] git fetch ล้มเหลว — เช็คอินเทอร์เน็ต/ไม่มี remote
    goto WAIT
)

for /f %%i in ('git rev-parse HEAD') do set LOCAL=%%i
for /f %%i in ('git rev-parse @{u}') do set REMOTE=%%i

if "!LOCAL!"=="!REMOTE!" (
    echo    ยังไม่มีอะไรใหม่
    goto WAIT
)

echo.
echo ==========================================
echo   พบ commit ใหม่ — เริ่ม sync
echo ==========================================

REM เช็คว่า package.json จะเปลี่ยนไหมหลัง pull
git diff --name-only HEAD !REMOTE! | findstr /C:"package.json" >nul
set PKG_CHANGED=%errorlevel%

echo [1/4] git pull...
git pull --ff-only
if errorlevel 1 (
    echo    [X] git pull ล้มเหลว — อาจมี conflict
    goto WAIT
)

if %PKG_CHANGED%==0 (
    echo [2/4] npm install ^(package.json เปลี่ยน^)...
    call npm install
    if errorlevel 1 (
        echo    [X] npm install ล้มเหลว
        goto WAIT
    )
) else (
    echo [2/4] ข้าม npm install ^(package.json ไม่เปลี่ยน^)
)

echo [3/4] npm run build...
call npm run build
if errorlevel 1 (
    echo    [X] build ล้มเหลว
    goto WAIT
)

echo [4/4] npx cap sync android...
call npx cap sync android
if errorlevel 1 (
    echo    [X] cap sync ล้มเหลว
    goto WAIT
)

echo.
echo ==========================================
echo   ✅ เสร็จ! พร้อม Build APK ใน Android Studio
echo   %date% %time%
echo ==========================================
REM เสียง beep 3 ครั้ง
echo 
echo 
echo 
REM แจ้งเตือน popup Windows
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Auto-Sync เสร็จแล้ว! เปิด Android Studio แล้ว Build APK ได้เลย','Lovable Auto-Sync')" >nul 2>&1

:WAIT
timeout /t %INTERVAL% /nobreak >nul
goto LOOP
