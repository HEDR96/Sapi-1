#!/bin/bash

# Cattle Catalog Docker Setup Script

echo "🐄 Cattle Catalog Docker Setup"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Create .env file if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Build and start containers
echo -e "${YELLOW}Building Docker containers...${NC}"
docker-compose build

echo -e "${YELLOW}Starting containers...${NC}"
docker-compose up -d

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 10

# Run Prisma migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec app npx prisma db push

# Seed database
echo -e "${YELLOW}Seeding database...${NC}"
docker-compose exec app npm run db:seed

echo ""
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Access the application:"
echo -e "  🌐 App: ${YELLOW}http://localhost:3000${NC}"
echo -e "  📊 Admin: ${YELLOW}http://localhost:3000/admin${NC}"
echo ""
echo "Admin credentials:"
echo "  Email: admin@sapikatalog.com"
echo "  Password: admin123"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f     # View logs"
echo "  docker-compose down       # Stop containers"
echo "  docker-compose restart    # Restart containers"
echo "  docker-compose exec db psql -U postgres -d cattle_catalog  # DB CLI"
echo "================================"
