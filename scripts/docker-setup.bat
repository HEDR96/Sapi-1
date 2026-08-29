@echo off
REM Cattle Catalog Docker Setup Script (Windows)

echo.
echo 🐄 Cattle Catalog Docker Setup
echo ================================================
echo.

REM Check if Docker is running
echo Checking Docker...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker is running
echo.

REM Create .env file if not exists
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)
echo.

REM Build and start containers
echo Building Docker containers...
docker-compose build

echo.
echo Starting containers...
docker-compose up -d

REM Wait for database to be ready
echo.
echo Waiting for database to be ready (15 seconds)...
timeout /t 15 /nobreak >nul

REM Run Prisma migrations
echo Running database migrations...
docker-compose exec app npx prisma db push

REM Seed database
echo Seeding database...
docker-compose exec app npm run db:seed

echo.
echo ================================================
echo 🎉 Setup Complete!
echo.
echo Access the application:
echo   🌐 App: http://localhost:3000
echo   📊 Admin: http://localhost:3000/admin
echo.
echo Admin credentials:
echo   Email: admin@sapikatalog.com
echo   Password: admin123
echo.
echo Useful commands:
echo   docker-compose logs -f     - View logs
echo   docker-compose down       - Stop containers
echo   docker-compose restart     - Restart containers
echo ================================================
echo.
pause
