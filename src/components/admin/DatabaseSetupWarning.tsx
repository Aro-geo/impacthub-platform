import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Database, ExternalLink, CheckCircle } from 'lucide-react';
import { checkDatabaseSetup } from '@/utils/checkDatabaseSetup';

interface DatabaseSetupWarningProps {
  onSetupComplete?: () => void;
}

const DatabaseSetupWarning: React.FC<DatabaseSetupWarningProps> = ({ onSetupComplete }) => {
  const [setupStatus, setSetupStatus] = useState<{
    isSetup: boolean;
    isChecking: boolean;
    results: any;
    summary: any;
  }>({
    isSetup: false,
    isChecking: true,
    results: {},
    summary: {}
  });

  const checkSetup = async () => {
    setSetupStatus(prev => ({ ...prev, isChecking: true }));
    try {
      const result = await checkDatabaseSetup();
      setSetupStatus({
        isSetup: result.isSetup,
        isChecking: false,
        results: result.results,
        summary: result.summary
      });
      
      if (result.isSetup && onSetupComplete) {
        onSetupComplete();
      }
    } catch (error) {
      console.error('Failed to check database setup:', error);
      setSetupStatus(prev => ({ ...prev, isChecking: false }));
    }
  };

  useEffect(() => {
    checkSetup();
  }, []);

  if (setupStatus.isChecking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Checking database setup...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (setupStatus.isSetup) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Database Setup Complete</AlertTitle>
        <AlertDescription>
          All incident analysis tables and views are properly configured.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <span>Database Setup Required</span>
        </CardTitle>
        <CardDescription className="text-yellow-700">
          The incident analysis system requires database tables to be created before it can function properly.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertTitle>Missing Components</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {!setupStatus.summary.tablesExist && (
                <div>
                  <strong>Missing Tables:</strong> {setupStatus.summary.missingTables?.join(', ')}
                </div>
              )}
              {!setupStatus.summary.viewsExist && (
                <div>
                  <strong>Missing Views:</strong> {setupStatus.summary.missingViews?.join(', ')}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to your Supabase project dashboard</li>
            <li>Navigate to <strong>SQL Editor</strong></li>
            <li>Copy and paste the contents of <code>supabase/setup_incident_tracking.sql</code></li>
            <li>Click <strong>Run</strong> to execute the script</li>
            <li>Return here and click "Check Setup" to verify</li>
          </ol>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={checkSetup} disabled={setupStatus.isChecking}>
            {setupStatus.isChecking ? 'Checking...' : 'Check Setup'}
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Supabase Dashboard</span>
            </a>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> The incident analysis system will continue to work with limited functionality, 
          storing data locally as a fallback until the database is properly configured.
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSetupWarning;