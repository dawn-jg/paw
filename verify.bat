@echo off
echo === /dogs (Category) ===
curl -s http://localhost:3000/dogs | findstr /C:"<h1>" /C:"<title>"
echo.
echo === /cats (Category) ===
curl -s http://localhost:3000/cats | findstr /C:"<h1>" /C:"<title>"
echo.
echo === /small-pets (Category) ===
curl -s http://localhost:3000/small-pets | findstr /C:"<h1>" /C:"<title>"
echo.
echo === /best-dog-food-2026 (Article) ===
curl -s http://localhost:3000/best-dog-food-2026 | findstr /C:"<h1>" /C:"<title>"
echo.
echo === /best-cat-food-indoor-cats (Article) ===
curl -s http://localhost:3000/best-cat-food-indoor-cats | findstr /C:"<h1>" /C:"<title>"
echo.
echo === /nonexistent (should 404) ===
curl -s -o nul -w "%%{http_code}" http://localhost:3000/nonexistent
echo.
