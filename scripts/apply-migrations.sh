#!/bin/bash

# Script to apply Supabase migrations

echo "Starting migration process..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

# Apply migration scripts
echo "Applying database migrations..."
npx supabase db reset

# Apply fix for community RLS
echo "Applying community RLS fixes..."
npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres < fix_community_rls.sql

echo "Migration completed successfully!"
