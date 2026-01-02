#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy || npx prisma migrate dev --name init

# Run seed if migrations were successful
if [ $? -eq 0 ]; then
  echo "Seeding database..."
  npm run prisma:seed || echo "Seed completed or skipped"
fi

# Execute the main command
exec "$@"


