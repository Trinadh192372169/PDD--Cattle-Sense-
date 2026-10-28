@echo off
cd /d "%~dp0app\android"
echo ========================================================
echo Building CattleSense Standalone APK (assembleDebug)...
echo ========================================================
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "ANDROID_HOME=C:\Users\Trina\AppData\Local\Android\Sdk"
call gradlew.bat assembleDebug --console=plain
echo ========================================================
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo ========================================================
    echo SUCCESS! Standalone APK built successfully:
    echo %~dp0app\android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================================
) else (
    echo.
    echo Build finished. Check output above.
)
pause

