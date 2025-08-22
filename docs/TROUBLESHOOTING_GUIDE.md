# Database and UI Troubleshooting Guide

## Issues Identified

1. **Community Forum 400 Error**
   - Issue: The Supabase query to `community_posts` table was failing with a 400 error
   - Root cause: Foreign key references issue and possible RLS (Row Level Security) misconfiguration
   - Fix: Simplified the query to avoid complex joins and applied RLS fixes

2. **Multiple AI Learning Observer Initializations**
   - Issue: `AI Learning Observer initialized and auto-connected` appearing multiple times in logs
   - Root cause: The initialization check was using `isProcessing` which doesn't prevent multiple initializations
   - Fix: Added a static flag to properly track initialization state

3. **Lessons Section Subject Mapping**
   - Issue: Subjects not displaying correctly in the UI
   - Root cause: The structure of the data returned by Supabase doesn't match component expectations
   - Fix: Added fallback for subject data to prevent UI rendering issues and added additional subject fetching logic

4. **Post Comments Relationship Error**
   - Issue: 400 error when fetching post comments with the message "Could not find a relationship between 'post_comments' and 'user_id'"
   - Root cause: Missing or incorrectly defined foreign key relationship between post_comments and profiles tables
   - Fix: Created migration to properly define table relationships and modified the query to fetch profiles separately

5. **Dual Subject Fields in simple_lessons**
   - Issue: The table has both a text 'subject' field and a UUID 'subject_id' foreign key
   - Root cause: Legacy data structure maintained for backward compatibility
   - Fix: Added migration to map text subject names to subject_id values when missing

6. **Multiple Foreign Key Constraints**
   - Issue: Error "Could not embed because more than one relationship was found for 'simple_lessons' and 'subject_id'"
   - Root cause: Multiple foreign key constraints between simple_lessons.subject_id and subjects table
   - Fix: Keep only one foreign key constraint (fk_subject) and update queries to use the specific constraint name

## How to Apply Fixes

1. **For Database Issues**:
   - Start Docker Desktop
   - Run the PowerShell script: `./scripts/apply-migrations.ps1`
   - This will reset the database and apply all migrations including the RLS fixes and relationship fixes

2. **For Code Fixes**:
   - The changes to OptimizedUnifiedCommunityForum.tsx simplify the query
   - The changes to aiLearningObserver.ts prevent multiple initializations
   - The changes to LessonsSection.tsx fix subject mapping issues and add fallback data fetching
   - The changes to EmojiCommentSystem.tsx fix profile fetching to avoid relationship errors

3. **Debugging Tools**:
   - Added the `subjectDebugger.ts` utility to check subject data
   - Added the `lessonDebugger.ts` utility to diagnose lesson display issues
   - Added test data generation scripts to ensure there's content to test with

## Database Schema Notes

1. **subjects table**:
   ```sql
   create table public.subjects (
     id uuid not null default extensions.uuid_generate_v4(),
     name text not null,
     description text null,
     icon character varying(50) null,
     color character varying(20) null,
     created_at timestamp with time zone null default now(),
     constraint subjects_pkey primary key (id),
     constraint subjects_name_key unique (name)
   )
   ```

2. **simple_lessons table**:
   ```sql
   create table public.simple_lessons (
     id uuid not null default extensions.uuid_generate_v4(),
     title text not null,
     content text not null,
     grade integer not null,
     subject text null,
     created_at timestamp with time zone null default now(),
     subject_id uuid null,
     description text null,
     difficulty_level character varying(20) null default 'beginner'::character varying,
     duration_minutes integer null default 15,
     order_index integer null default 0,
     is_published boolean null default true,
     updated_at timestamp with time zone null default now(),
     constraint simple_lessons_pkey primary key (id),
     constraint fk_subject foreign KEY (subject_id) references subjects (id)
   )
   ```

## Ongoing Monitoring

After applying these fixes, monitor the browser console for:
- Any remaining 400 errors from Supabase
- Multiple initialization messages from aiLearningObserver
- Verify lessons and subjects display correctly in the UI

If issues persist, check:
1. The database schema matches what the queries expect
2. RLS policies are correctly applied
3. Foreign key relationships are properly configured

## Database Migrations Added

1. `20250822000001_fix_post_comments.sql` - Fixes post_comments table foreign key references
2. `20250822000002_fix_lessons_query.sql` - Adds missing indexes and fixes subject relationships for lessons
3. `20250822000003_add_test_data.sql` - Adds test data to ensure there's content to display
4. `20250822000004_fix_duplicate_fk.sql` - Fixes the multiple foreign key constraints issue
