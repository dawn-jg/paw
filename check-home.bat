@echo off
curl -s http://localhost:3000/ > %TEMP%\pc-home.html
echo ====== Latest Reviews section ======
findstr /C:"Latest" %TEMP%\pc-home.html
findstr /C:"latest" %TEMP%\pc-home.html
echo.
echo ====== review-card count ======
find /c "review-card" %TEMP%\pc-home.html
echo.
echo ====== first 5 review-card ======
findstr /C:"review-card" %TEMP%\pc-home.html | findstr /N . | findstr "^1: ^2: ^3: ^4: ^5:"
