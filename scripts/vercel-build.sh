#!/bin/bash

# Vercel build script for AAA Case Studies
echo "🚀 Starting Vercel build process..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (only if DATABASE_URL is set)
if [ ! -z "$DATABASE_URL" ]; then
  echo "🗄️  Pushing database schema..."
  npx prisma db push --accept-data-loss
  
  echo "🌱 Seeding database..."
  npm run db:seed
else
  echo "⚠️  DATABASE_URL not set, skipping database operations"
fi

# Build the application
echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"