@echo off
curl -s -o nul -w "%%{http_code}" http://localhost:3000/dogs
echo.
curl -s -o nul -w "%%{http_code}" http://localhost:3000/cats
echo.
curl -s -o nul -w "%%{http_code}" http://localhost:3000/best-dog-food-2026
echo.
