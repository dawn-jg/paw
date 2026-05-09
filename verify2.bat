@echo off
echo ====== /dogs ======
curl -s http://localhost:3000/dogs > %TEMP%\pc-dogs.html
type %TEMP%\pc-dogs.html | find "category-page"
type %TEMP%\pc-dogs.html | find "Dogs</h1>"
echo.
echo ====== /cats ======
curl -s http://localhost:3000/cats > %TEMP%\pc-cats.html
type %TEMP%\pc-cats.html | find "category-page"
type %TEMP%\pc-cats.html | find "Cats</h1>"
echo.
echo ====== /reptiles ======
curl -s http://localhost:3000/reptiles > %TEMP%\pc-reptiles.html
type %TEMP%\pc-reptiles.html | find "category-page"
echo.
echo ====== /best-rabbit-food (Article) ======
curl -s http://localhost:3000/best-rabbit-food > %TEMP%\pc-rabbit.html
type %TEMP%\pc-rabbit.html | find "article-page"
echo.
echo ====== 404 test ======
curl -s -o nul -w "%%{http_code}" http://localhost:3000/this-does-not-exist
echo.
