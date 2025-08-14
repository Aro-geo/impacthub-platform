import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { checkDatabaseHealth, DatabaseHealthCheck } from '@/utils/adminDatabaseCheck';

interface DatabaseStatusProps {
  className?: string;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ className }) => {
  const [healthCheck, setHealthCheck] = useState<DatabaseHealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    performHealthCheck();
  }, []);

  const performHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await checkDatabaseHealth();
      setHealthCheck(result);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to perform database health check:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getTableStatusIcon = (accessible: boolean) => {
    return accessible ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Checking database health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthCheck) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Database Check Failed</AlertTitle>
            <AlertDescription>
              Unable to perform database health check. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Database Health Status</span>
              </CardTitle>
              <CardDescription>
                Current status of admin platform database tables
                {lastChecked && (
                  <span className="block text-xs mt-1">
                    Last checked: {lastChecked.toLocaleString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getOverallStatusColor(healthCheck.overall)}>
                {getOverallStatusIcon(healthCheck.overall)}
                <span className="ml-1 capitalize">{healthCheck.overall}</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={performHealthCheck}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{healthCheck.summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Tables</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{healthCheck.summary.accessible}</div>
              <div className="text-sm text-muted-foreground">Accessible</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{healthCheck.summary.missing}</div>
              <div className="text-sm text-muted-foreground">Missing</div>
            </div>
          </div>

          {/* Table Status */}
          <div>
            <h4 className="font-medium mb-3">Table Status</h4>
            <div className="space-y-2">
              {healthCheck.tables.map((table) => (
                <div key={table.tableName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTableStatusIcon(table.accessible)}
                    <div>
                      <div className="font-medium">{table.tableName}</div>
                      {table.error && (
                        <div className="text-xs text-red-600">{table.error}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant={table.accessible ? 'default' : 'destructive'}>
                    {table.accessible ? 'Available' : 'Missing'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {healthCheck.overall !== 'healthy' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>Some admin features may not work properly due to missing database tables.</p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href="https://supabase.com/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Supabase Dashboard
                      </a>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Run the database migration scripts to set up missing tables
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {healthCheck.overall === 'healthy' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>All Systems Operational</AlertTitle>
              <AlertDescription>
                All required database tables are accessible and the admin platform is fully functional.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseStatus;