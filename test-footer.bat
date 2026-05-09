@echo off
setlocal enabledelayedexpansion
echo ===== PawCritic Footer Pages Test =====
echo.

set PAGES=about how-we-test contact editorial-policy newsletter blog buying-guides comparisons

for %%p in (%PAGES%) do (
  curl.exe -s -o NUL -w "  /%%p  HTTP %%{http_code}  (%%{size_download} bytes)" http://localhost:3000/%%p
  echo.
)

echo.
echo ===== Done =====
