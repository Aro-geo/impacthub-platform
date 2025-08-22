-- Fix RLS policy for performance_metrics to allow anonymous users to insert metrics
-- This is needed for client-side performance monitoring before authentication

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert performance metrics" ON performance_metrics;

-- Create a more permissive policy that allows both authenticated and anonymous users
-- to insert performance metrics (for client-side monitoring)
CREATE POLICY "Allow performance metrics insertion" ON performance_metrics
  FOR INSERT WITH CHECK (true);

-- Also update incident_logs to allow anonymous error reporting
DROP POLICY IF EXISTS "Users can insert their own incident logs" ON incident_logs;

CREATE POLICY "Allow incident logs insertion" ON incident_logs
  FOR INSERT WITH CHECK (true);