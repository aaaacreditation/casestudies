#!/bin/bash

# Database setup script for Vercel deployment
echo "🗄️  Setting up database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set. Skipping database operations."
  echo "📝 Make sure to set DATABASE_URL in Vercel environment variables"
  exit 0
fi

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🚀 Pushing database schema..."
npx prisma db push --accept-data-loss

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup completed!"