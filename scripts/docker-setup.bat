@echo off
REM Cattle Catalog Docker Setup Script (Windows)

echo.
echo Cattle Catalog Docker Setup
echo ================================================

REM Check if Docker is running
echo Checking Docker...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo Docker is running

REM Install node_modules if not exists
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Install Prisma locally (needed for migrations)
echo Installing Prisma CLI locally...
npm install prisma@5.15.0 --save-dev

REM Create .env file if not exists
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
)

REM Start database first
echo Starting database...
docker-compose up -d db

REM Wait for database to be ready
echo Waiting for database to be ready (15 seconds)...
timeout /t 15 /nobreak >nul

REM Update .env with docker connection string
echo DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cattle_catalog" > .env.tmp
echo JWT_SECRET="cattle-catalog-super-secret-jwt-key-2024" >> .env.tmp
echo JWT_EXPIRES_IN="24h" >> .env.tmp
echo NEXT_PUBLIC_APP_URL="http://localhost:3000" >> .env.tmp
copy .env.tmp .env /y
del .env.tmp

REM Run Prisma migrations
echo Running database migrations...
npx prisma db push

REM Seed database
echo Seeding database...
npm run db:seed

REM Build and start app
echo Building Docker containers...
docker-compose build

echo.
echo Starting containers...
docker-compose up -d

echo.
echo ================================================
echo Setup Complete!
echo.
echo Access the application:
echo   App: http://localhost:3000
echo   Admin: http://localhost:3000/admin
echo.
echo Admin credentials:
echo   Email: admin@sapikatalog.com
echo   Password: admin123
echo ================================================
pause
