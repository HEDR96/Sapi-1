@echo off
REM Stop Cattle Catalog Docker Containers

echo.
echo Stopping containers...
docker-compose down

echo.
echo ✅ Containers stopped
echo.
echo To remove all data: docker-compose down -v
pause
