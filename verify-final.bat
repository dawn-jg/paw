@echo off
echo ====== 1. Homepage featured links ======
curl -s http://localhost:3000/ > %TEMP%\pc-v.html
findstr /C:"href=\"/best-" %TEMP%\pc-v.html | findstr /C:"href=\"/"
echo.
echo ====== 2. /reviews ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/reviews
echo.
echo ====== 3. A featured article ======
curl -s http://localhost:3000/ > %TEMP%\pc-v.html
for /f "tokens=2 delims=/" %%a in ('findstr /C:"href=\"/best-" %TEMP%\pc-v.html') do (
  set SLUG=%%a
  goto :test
)
:test
:: Find first article slug
for /f "tokens=1 delims= " %%b in ('findstr /C:"href=\"/best-" %TEMP%\pc-v.html ^| findstr /n . ^| findstr "^1:" ') do echo Found article link
echo.
echo ====== 4. Test first article link ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/best-bird-stands-2026-play-gyms-and-perch-stations
echo.
echo ====== 5. 404 still works ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/xyz-does-not-exist
echo.
echo ====== 6. Category still works ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/dogs
echo.
