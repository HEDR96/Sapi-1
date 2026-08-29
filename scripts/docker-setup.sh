#!/bin/bash

# Cattle Catalog Docker Setup Script

echo "Cattle Catalog Docker Setup"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker."
    exit 1
fi
echo "Docker is running"

# Install dependencies if not exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install Prisma locally
echo "Installing Prisma CLI locally..."
npm install prisma@5.15.0 --save-dev

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Update DATABASE_URL for local
sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cattle_catalog"|' .env

# Start database first
echo "Starting database..."
docker-compose up -d db

# Wait for database
echo "Waiting for database (15 seconds)..."
sleep 15

# Run Prisma migrations
echo "Running database migrations..."
npx prisma db push

# Seed database
echo "Seeding database..."
npm run db:seed

# Build and start app
echo "Building and starting containers..."
docker-compose up -d --build

echo ""
echo "================================"
echo "Setup Complete!"
echo ""
echo "Access the application:"
echo "  App: http://localhost:3000"
echo "  Admin: http://localhost:3000/admin"
echo ""
echo "Admin credentials:"
echo "  Email: admin@sapikatalog.com"
echo "  Password: admin123"
echo "================================"
