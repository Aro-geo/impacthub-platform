import { supabase } from '@/integrations/supabase/client';

export interface DatabaseStatus {
  tableName: string;
  exists: boolean;
  accessible: boolean;
  error?: string;
}

export interface DatabaseHealthCheck {
  overall: 'healthy' | 'partial' | 'critical';
  tables: DatabaseStatus[];
  summary: {
    total: number;
    accessible: number;
    missing: number;
  };
}

const REQUIRED_TABLES = [
  'profiles',
  'community_posts',
  'post_comments',
  'ai_interactions',
  'learning_activities',
  'lesson_progress',
  'incident_logs',
  'performance_metrics'
];

export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const tableStatuses: DatabaseStatus[] = [];
  
  for (const tableName of REQUIRED_TABLES) {
    try {
      // Try to select a single row to test table access
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        tableStatuses.push({
          tableName,
          exists: false,
          accessible: false,
          error: error.message
        });
      } else {
        tableStatuses.push({
          tableName,
          exists: true,
          accessible: true
        });
      }
    } catch (error) {
      tableStatuses.push({
        tableName,
        exists: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  const accessible = tableStatuses.filter(t => t.accessible).length;
  const missing = tableStatuses.filter(t => !t.accessible).length;
  
  let overall: 'healthy' | 'partial' | 'critical';
  if (accessible === REQUIRED_TABLES.length) {
    overall = 'healthy';
  } else if (accessible >= REQUIRED_TABLES.length / 2) {
    overall = 'partial';
  } else {
    overall = 'critical';
  }
  
  return {
    overall,
    tables: tableStatuses,
    summary: {
      total: REQUIRED_TABLES.length,
      accessible,
      missing
    }
  };
}

export function getTableStatus(tableName: string, healthCheck: DatabaseHealthCheck): DatabaseStatus | null {
  return healthCheck.tables.find(t => t.tableName === tableName) || null;
}

export function isTableAccessible(tableName: string, healthCheck: DatabaseHealthCheck): boolean {
  const status = getTableStatus(tableName, healthCheck);
  return status?.accessible || false;
}