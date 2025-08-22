# PowerShell script to fix the duplicate foreign key constraint
# This script will run the SQL directly without using Docker

$connectionString = "Host=otxttowidmshxzzfxpdu.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your_password_here;Sslmode=Require"

# First, display the constraints
Write-Host "Checking existing foreign key constraints..." -ForegroundColor Yellow
$checkConstraintsQuery = @"
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'simple_lessons'
  AND kcu.column_name = 'subject_id';
"@

# Run the SQL to drop the duplicate constraint
Write-Host "Dropping duplicate constraint..." -ForegroundColor Yellow
$fixConstraintQuery = @"
ALTER TABLE simple_lessons
DROP CONSTRAINT IF EXISTS simple_lessons_subject_id_fkey;
"@

Write-Host "To run these SQL commands, connect to your Supabase database and execute:"
Write-Host "`nCheck constraints:`n$checkConstraintsQuery" -ForegroundColor Cyan
Write-Host "`nFix duplicate constraint:`n$fixConstraintQuery" -ForegroundColor Cyan
Write-Host "`nYou can use the Supabase Dashboard SQL Editor or psql to execute these commands directly." -ForegroundColor Yellow
