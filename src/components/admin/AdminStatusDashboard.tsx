import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Brain, 
  Database, 
  Users, 
  MessageSquare,
  BarChart3,
  Settings,
  RefreshCw,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { checkDatabaseHealth } from '@/utils/adminDatabaseCheck';

interface AdminStatusDashboardProps {
  className?: string;
}

interface SystemStatus {
  database: 'healthy' | 'partial' | 'critical';
  ai: 'connected' | 'disconnected' | 'unknown';
  users: number;
  posts: number;
  lastUpdated: Date;
}

const AdminStatusDashboard: React.FC<AdminStatusDashboardProps> = ({ className }) => {
  const [status, setStatus] = useState<SystemStatus>({
    database: 'unknown' as any,
    ai: 'unknown',
    users: 0,
    posts: 0,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      // Check database health
      const dbHealth = await checkDatabaseHealth();
      
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get posts count
      const { count: postsCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

      // Check AI status from settings
      const savedSettings = localStorage.getItem('admin_settings');
      let aiStatus: 'connected' | 'disconnected' | 'unknown' = 'unknown';
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          aiStatus = settings.enableAI && settings.aiApiKey ? 'connected' : 'disconnected';
        } catch (error) {
          aiStatus = 'unknown';
        }
      }

      setStatus({
        database: dbHealth.overall,
        ai: aiStatus,
        users: userCount || 0,
        posts: postsCount || 0,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Failed to check system status:', error);
      setStatus(prev => ({
        ...prev,
        database: 'critical',
        lastUpdated: new Date()
      }));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
      case 'disconnected':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'partial':
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Platform Status</CardTitle>
              <CardDescription>
                Current status of all admin features and services
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={checkSystemStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Database</p>
                  <p className="text-xs text-muted-foreground">Supabase</p>
                </div>
              </div>
              <Badge className={getStatusColor(status.database)}>
                {getStatusIcon(status.database)}
                <span className="ml-1 capitalize">{status.database}</span>
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">AI Services</p>
                  <p className="text-xs text-muted-foreground">DeepSeek</p>
                </div>
              </div>
              <Badge className={getStatusColor(status.ai)}>
                {getStatusIcon(status.ai)}
                <span className="ml-1 capitalize">{status.ai}</span>
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Users</p>
                  <p className="text-xs text-muted-foreground">Total registered</p>
                </div>
              </div>
              <Badge variant="outline">
                {status.users}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">Posts</p>
                  <p className="text-xs text-muted-foreground">Community content</p>
                </div>
              </div>
              <Badge variant="outline">
                {status.posts}
              </Badge>
            </div>
          </div>

          {/* Feature Status */}
          <div>
            <h4 className="font-medium mb-3">Admin Features Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">User Management</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Content Moderation</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Analytics Dashboard</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">System Monitoring</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {status.database === 'healthy' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">Incident Analysis</span>
                </div>
                <Badge className={status.database === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {status.database === 'healthy' ? 'Active' : 'Limited'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {status.ai === 'connected' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">AI Integration</span>
                </div>
                <Badge className={status.ai === 'connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {status.ai === 'connected' ? 'Connected' : 'Setup Required'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {(status.database !== 'healthy' || status.ai !== 'connected') && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Setup Recommendations</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1 text-sm">
                  {status.database !== 'healthy' && (
                    <p>• Run database migrations for full admin functionality</p>
                  )}
                  {status.ai !== 'connected' && (
                    <p>• Configure AI API key in Settings for AI features</p>
                  )}
                  <p>• Check the System tab for detailed status and testing tools</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {status.lastUpdated.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatusDashboard;