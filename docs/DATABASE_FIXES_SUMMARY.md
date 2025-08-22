# Issue Resolution: Database Issues Fixed

## Issues Fixed:

### 1. Duplicate Foreign Key Constraint Issue ✅
- **Problem**: Subjects and lessons weren't displaying in the UI due to duplicate foreign key constraints between `simple_lessons` and `subjects` tables
- **Solution**: Removed the duplicate constraint `simple_lessons_subject_id_fkey` while keeping the named constraint `fk_subject`
- **Files Modified**: 
  - `fix_duplicate_constraint.sql`
  - `supabase/migrations/20250822000004_fix_duplicate_fk.sql`
- **Result**: Subjects and lessons now load and display correctly in the UI

### 2. Lesson Progress RLS Issue ✅
- **Problem**: 403 Forbidden errors when trying to update lesson progress
- **Solution**: Fixed Row Level Security (RLS) policies for the `lesson_progress` table
- **Files Created**:
  - `supabase/migrations/20250822000005_fix_lesson_progress_rls.sql`
- **Script Updated**:
  - `scripts/apply-migrations.ps1` to include the new migration

## How to Apply These Fixes:

### Option 1: Run the SQL directly in Supabase Dashboard
1. Navigate to the SQL Editor in your Supabase Dashboard
2. Run the SQL from `supabase/migrations/20250822000005_fix_lesson_progress_rls.sql`

### Option 2: Run with Docker locally
1. Make sure Docker Desktop is running
2. Execute the updated migration script:
   ```powershell
   cd c:\Users\Admin\Documents\impacthub-platform
   .\scripts\apply-migrations.ps1
   ```

## Verification
After applying the fixes:
1. Subjects and lessons should display correctly in the UI (already confirmed)
2. Lesson progress should update without 403 errors
3. User interactions with lessons should be properly tracked

## Technical Details
1. The duplicate foreign key issue was resolved by identifying and removing the automatically generated constraint while keeping the explicitly named one used in code.
2. The RLS policies were updated to properly handle CRUD operations and upsert scenarios for the lesson_progress table.

## Next Steps
Monitor the application logs for any remaining 403 errors. If any persist, additional RLS policies may need to be updated.
