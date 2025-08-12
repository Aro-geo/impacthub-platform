# Database Setup Guide

This guide will help you set up the required database tables for the incident analysis system.

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20241208_incident_tracking.sql`
4. Click **Run** to execute the script
5. Verify the setup by visiting the Incident Analysis page in your app

### Option 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed and configured:

```bash
# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase migration up --include-all
```

## What Gets Created

The setup script creates the following tables:

- **incident_logs**: Stores error logs and incidents
- **performance_metrics**: Tracks performance data
- **system_health**: Monitors overall system health

It also creates:
- Indexes for better query performance
- Row Level Security (RLS) policies
- Views for error patterns and performance insights
- A cleanup function for data retention

## Verification

After running the setup:

1. Visit the **Incident Analysis** page in your app
2. You should see a green "Database Setup Complete" message
3. The performance metrics will start being stored in the database instead of localStorage

## Troubleshooting

### 401 Authentication Errors

If you see 401 errors in the console, it usually means:
- The tables haven't been created yet
- The RLS policies aren't set up correctly
- Your user doesn't have the required permissions

**Solution**: Run the setup script as described above.

### Permission Issues

The system requires:
- Authenticated users can insert their own logs and performance metrics
- Admin users can read all data
- The system can insert health monitoring data

These permissions are automatically configured by the setup script.

## Fallback Behavior

If the database isn't set up, the system will:
- Store data in localStorage as a fallback
- Show warnings in the console
- Display setup instructions to users
- Continue working with limited functionality

This ensures the app remains functional even without the database setup.