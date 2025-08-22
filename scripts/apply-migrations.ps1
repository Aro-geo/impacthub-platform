# PowerShell script to apply Supabase migrations

Write-Host "Starting migration process..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Apply migration scripts
Write-Host "Applying database migrations..." -ForegroundColor Yellow
npx supabase db reset

# Apply fix for community RLS
Write-Host "Applying community RLS fixes..." -ForegroundColor Yellow
Get-Content fix_community_rls.sql | npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres

# Apply post_comments fixes
Write-Host "Applying post_comments fixes..." -ForegroundColor Yellow
Get-Content supabase/migrations/20250822000001_fix_post_comments.sql | npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres

# Apply lessons query fixes
Write-Host "Applying lessons query fixes..." -ForegroundColor Yellow
Get-Content supabase/migrations/20250822000002_fix_lessons_query.sql | npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres

# Apply test data
Write-Host "Adding test subjects if needed..." -ForegroundColor Yellow
Get-Content supabase/migrations/20250822000003_add_test_data.sql | npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres

# Fix duplicate foreign key constraints
Write-Host "Fixing duplicate foreign key constraints..." -ForegroundColor Yellow
Get-Content supabase/migrations/20250822000004_fix_duplicate_fk.sql | npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres

# Fix lesson progress RLS policies
Write-Host "Fixing lesson progress RLS policies..." -ForegroundColor Yellow
Get-Content supabase/migrations/20250822000006_fix_lesson_progress_rls_enhanced.sql | npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres

# Add RLS debugging functions
Write-Host "Adding RLS debugging functions..." -ForegroundColor Yellow
Get-Content supabase/migrations/20250822000007_add_rls_debug_functions.sql | npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres

Write-Host "Migration completed successfully!" -ForegroundColor Green
