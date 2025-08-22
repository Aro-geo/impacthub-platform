# Fix for Duplicate Foreign Key Constraints

## Issue Summary
The application is experiencing an issue where subjects and lessons are not displaying in the UI despite being loaded in the console. The root cause is duplicate foreign key constraints between the `simple_lessons` table and the `subjects` table:

- `fk_subject` - This is the constraint referenced in the code with `subjects!fk_subject`
- `simple_lessons_subject_id_fkey` - This is an automatically generated constraint

This causes PostgREST to be unable to determine which relationship to use in join queries.

## Fix Options

### Option 1: Run locally with Docker (Recommended)
1. Start Docker Desktop
2. Run the migration script:
   ```powershell
   cd c:\Users\Admin\Documents\impacthub-platform
   .\scripts\apply-migrations.ps1
   ```

### Option 2: Run directly in Supabase Dashboard
1. Go to the Supabase Dashboard
2. Open the SQL Editor
3. Run the SQL from `fix_duplicate_constraint.sql`

```sql
-- First check the existing constraints
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

-- Then drop the duplicate constraint
ALTER TABLE simple_lessons
DROP CONSTRAINT IF EXISTS simple_lessons_subject_id_fkey;
```

## Testing the Fix
After applying the fix, refresh the application and verify:
1. Subjects are now displayed in the UI
2. Lessons are now displayed properly under their subjects
3. Check the browser console for any remaining errors

## Explanation
The component in `LessonsSection.tsx` is already correctly using the `subjects!fk_subject` syntax in its query to specify which foreign key constraint to use. By removing the duplicate constraint, we eliminate the ambiguity that was causing PostgREST to fail.
