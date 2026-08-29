#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run Prisma migrations
echo "Running database migrations..."
./node_modules/.bin/prisma db push

# Seed database
echo "Seeding database..."
npm run db:seed

echo "Database setup complete!"

# Start the application
exec node server.js
