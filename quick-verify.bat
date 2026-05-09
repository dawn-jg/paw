@echo off
echo ====== /reviews ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/reviews
echo.
echo ====== Article from latest.json ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/best-bird-stands-2026-play-gyms-and-perch-stations
echo.
echo ====== Another article ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/best-fish-food-for-bottom-feeders-2026-sinking-pellets-and-wafers
echo.
echo ====== Categories still work ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/cats
echo.
echo ====== Unknown = 404 ======
curl -s -o nul -w "HTTP %%{http_code}" http://localhost:3000/no-such-thing
echo.
