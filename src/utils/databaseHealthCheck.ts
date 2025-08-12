import { supabase } from '@/integrations/supabase/client';

export interface DatabaseHealthStatus {
  isHealthy: boolean;
  tables: {
    incident_logs: boolean;
    performance_metrics: boolean;
    system_health: boolean;
  };
  permissions: {
    canInsertLogs: boolean;
    canInsertMetrics: boolean;
    canReadData: boolean;
  };
  errors: string[];
  recommendations: string[];
}

/**
 * Performs a comprehensive health check of the database setup
 */
export async function performDatabaseHealthCheck(): Promise<DatabaseHealthStatus> {
  const status: DatabaseHealthStatus = {
    isHealthy: false,
    tables: {
      incident_logs: false,
      performance_metrics: false,
      system_health: false
    },
    permissions: {
      canInsertLogs: false,
      canInsertMetrics: false,
      canReadData: false
    },
    errors: [],
    recommendations: []
  };

  try {
    // Check if tables exist by trying to query them
    const tableChecks = await Promise.allSettled([
      supabase.from('incident_logs').select('id').limit(1),
      supabase.from('performance_metrics').select('id').limit(1),
      supabase.from('system_health').select('id').limit(1)
    ]);

    // Analyze table check results
    status.tables.incident_logs = tableChecks[0].status === 'fulfilled';
    status.tables.performance_metrics = tableChecks[1].status === 'fulfilled';
    status.tables.system_health = tableChecks[2].status === 'fulfilled';

    // Check permissions by trying to insert test data
    try {
      const testLog = {
        id: `health-check-${Date.now()}`,
        level: 'info',
        message: 'Database health check',
        component: 'healthCheck',
        metadata: { test: true }
      };

      const { error: logError } = await supabase
        .from('incident_logs')
        .insert(testLog);

      if (!logError) {
        status.permissions.canInsertLogs = true;
        // Clean up test data
        await supabase.from('incident_logs').delete().eq('id', testLog.id);
      }
    } catch (error) {
      status.errors.push('Cannot insert incident logs');
    }

    try {
      const testMetric = {
        id: `health-check-${Date.now()}`,
        metric: 'api_response',
        value: 100,
        component: 'healthCheck',
        metadata: { test: true }
      };

      const { error: metricError } = await supabase
        .from('performance_metrics')
        .insert(testMetric);

      if (!metricError) {
        status.permissions.canInsertMetrics = true;
        // Clean up test data
        await supabase.from('performance_metrics').delete().eq('id', testMetric.id);
      }
    } catch (error) {
      status.errors.push('Cannot insert performance metrics');
    }

    // Check read permissions
    try {
      const { error: readError } = await supabase
        .from('incident_logs')
        .select('id')
        .limit(1);

      status.permissions.canReadData = !readError;
    } catch (error) {
      status.errors.push('Cannot read incident data');
    }

    // Generate recommendations
    if (!status.tables.incident_logs || !status.tables.performance_metrics || !status.tables.system_health) {
      status.recommendations.push('Run the database setup script to create missing tables');
    }

    if (!status.permissions.canInsertLogs || !status.permissions.canInsertMetrics) {
      status.recommendations.push('Check RLS policies - users should be able to insert their own data');
    }

    if (!status.permissions.canReadData) {
      status.recommendations.push('Admin permissions may be required to read incident data');
    }

    // Determine overall health
    const tablesHealthy = Object.values(status.tables).every(Boolean);
    const basicPermissions = status.permissions.canInsertLogs && status.permissions.canInsertMetrics;
    status.isHealthy = tablesHealthy && basicPermissions;

    if (status.isHealthy) {
      status.recommendations.push('Database is healthy and ready for incident analysis');
    }

  } catch (error) {
    status.errors.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    status.recommendations.push('Check your Supabase connection and authentication');
  }

  return status;
}

/**
 * Quick check to see if the database is minimally functional
 */
export async function isMinimallyFunctional(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('performance_metrics')
      .select('id')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}