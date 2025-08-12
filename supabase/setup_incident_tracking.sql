-- Setup script for Incident Analysis System
-- Run this in your Supabase SQL Editor

-- Create incident_logs table for error tracking
CREATE TABLE IF NOT EXISTS incident_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info')),
  message TEXT NOT NULL,
  stack TEXT,
  user_agent TEXT,
  url TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  component TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create performance_metrics table for performance tracking
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric TEXT NOT NULL CHECK (metric IN ('page_load', 'api_response', 'render_time', 'memory_usage', 'bundle_size')),
  value NUMERIC NOT NULL,
  url TEXT,
  component TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create system_health table for overall system health tracking
CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cpu_usage NUMERIC,
  memory_usage NUMERIC,
  active_users INTEGER NOT NULL DEFAULT 0,
  error_rate NUMERIC NOT NULL DEFAULT 0,
  avg_response_time NUMERIC NOT NULL DEFAULT 0,
  cache_hit_rate NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_incident_logs_timestamp ON incident_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incident_logs_level ON incident_logs(level);
CREATE INDEX IF NOT EXISTS idx_incident_logs_component ON incident_logs(component);
CREATE INDEX IF NOT EXISTS idx_incident_logs_user_id ON incident_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_logs_session_id ON incident_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric ON performance_metrics(metric);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_component ON performance_metrics(component);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON performance_metrics(url);

CREATE INDEX IF NOT EXISTS idx_system_health_timestamp ON system_health(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert their own incident logs" ON incident_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to insert performance metrics
CREATE POLICY "Users can insert performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow system to insert system health data
CREATE POLICY "System can insert health data" ON system_health
  FOR INSERT WITH CHECK (true);

-- Only allow admins to read incident logs and performance metrics
-- Note: Adjust this policy based on your admin identification logic
CREATE POLICY "Admins can read incident logs" ON incident_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.email LIKE '%admin%' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can read performance metrics" ON performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.email LIKE '%admin%' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can read system health" ON system_health
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.email LIKE '%admin%' OR profiles.role = 'admin')
    )
  );

-- Create a function to clean up old logs (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Delete incident logs older than 30 days
  DELETE FROM incident_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete performance metrics older than 7 days
  DELETE FROM performance_metrics 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete system health data older than 30 days
  DELETE FROM system_health 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create views for analysis
CREATE OR REPLACE VIEW error_patterns AS
SELECT 
  component,
  message,
  COUNT(*) as occurrence_count,
  MIN(timestamp) as first_seen,
  MAX(timestamp) as last_seen,
  COUNT(DISTINCT session_id) as affected_sessions,
  COUNT(DISTINCT user_id) as affected_users
FROM incident_logs 
WHERE level = 'error'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY component, message
ORDER BY occurrence_count DESC;

CREATE OR REPLACE VIEW performance_insights AS
SELECT 
  metric,
  component,
  url,
  COUNT(*) as sample_count,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
  MIN(value) as min_value,
  MAX(value) as max_value
FROM performance_metrics 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY metric, component, url
ORDER BY avg_value DESC;

-- Grant necessary permissions
GRANT SELECT ON error_patterns TO authenticated;
GRANT SELECT ON performance_insights TO authenticated;

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('incident_logs', 'performance_metrics', 'system_health')
ORDER BY tablename;