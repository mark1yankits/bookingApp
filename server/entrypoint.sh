#!/bin/sh

# Debug: Show DATABASE_URL (without password)
echo "DATABASE_URL: ${DATABASE_URL//:12345@/:****@}"

# Wait for database to be ready using pg_isready
echo "Waiting for database to be ready..."
RETRIES=30
until pg_isready -h postgres -p 5432 -U postgres > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for database... $RETRIES retries left"
  RETRIES=$((RETRIES-1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "Warning: Database may not be ready, but continuing..."
  sleep 5
else
  echo "Database is ready!"
  sleep 2
fi

# Generate Prisma Client (in case schema changed)
echo "Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
# For development, use migrate dev which is more flexible
# It will create new migrations if schema changed, or apply existing ones
MIGRATION_SUCCESS=false
if npx prisma migrate dev --name init --skip-seed 2>&1; then
  echo "✓ Migrations applied successfully via migrate dev"
  MIGRATION_SUCCESS=true
else
  echo "⚠ migrate dev failed, trying migrate deploy..."
  if npx prisma migrate deploy 2>&1; then
    echo "✓ Migrations deployed successfully via migrate deploy"
    MIGRATION_SUCCESS=true
  else
    echo "⚠ Both migration commands failed"
    echo "Trying db push as last resort..."
    if npx prisma db push --accept-data-loss --skip-generate 2>&1; then
      echo "✓ Database schema pushed successfully"
      MIGRATION_SUCCESS=true
      # Regenerate client after db push
      npx prisma generate
    else
      echo "⚠ db push also failed"
    fi
  fi
fi

# Verify migration status
echo "Checking migration status..."
npx prisma migrate status 2>&1 | head -20 || echo "Could not check migration status"

# Run seed
echo "Seeding database..."
npm run prisma:seed || echo "Seed completed or skipped"

# Execute the main command 
exec "$@"


