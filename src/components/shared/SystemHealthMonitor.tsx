import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Server, 
  Clock, 
  MemoryStick, 
  HardDrive,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

interface SystemHealthProps {
  className?: string;
  compact?: boolean;
}

interface HealthMetrics {
  isOnline: boolean;
  connectionType: string;
  memoryUsage: number;
  memoryLimit: number;
  storageUsed: number;
  storageQuota: number;
  performanceScore: number;
  errorRate: number;
  lastUpdate: string;
}

const SystemHealthMonitor: React.FC<SystemHealthProps> = ({ className, compact = false }) => {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    memoryUsage: 0,
    memoryLimit: 0,
    storageUsed: 0,
    storageQuota: 0,
    performanceScore: 100,
    errorRate: 0,
    lastUpdate: new Date().toISOString()
  });

  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const newMetrics: Partial<HealthMetrics> = {
          isOnline: navigator.onLine,
          lastUpdate: new Date().toISOString()
        };

        // Get connection info
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          newMetrics.connectionType = connection.effectiveType || 'unknown';
        }

        // Get memory info
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          newMetrics.memoryUsage = memory.usedJSHeapSize;
          newMetrics.memoryLimit = memory.jsHeapSizeLimit;
        }

        // Get storage info
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          try {
            const estimate = await navigator.storage.estimate();
            newMetrics.storageUsed = estimate.usage || 0;
            newMetrics.storageQuota = estimate.quota || 0;
          } catch (error) {
            console.warn('Failed to get storage estimate:', error);
          }
        }

        // Calculate performance score based on various factors
        const performanceScore = calculatePerformanceScore(newMetrics);
        newMetrics.performanceScore = performanceScore;

        setMetrics(prev => ({ ...prev, ...newMetrics }));

        // Check for alerts
        checkForAlerts(newMetrics);

      } catch (error) {
        console.error('Failed to update system metrics:', error);
        incidentAnalysisService.logError({
          message: 'Failed to update system health metrics',
          component: 'SystemHealthMonitor',
          metadata: { error: error.message }
        });
      }
    };

    // Initial update
    updateMetrics();

    // Set up periodic updates
    const interval = setInterval(updateMetrics, 30000); // Every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => updateMetrics();
    const handleOffline = () => updateMetrics();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const calculatePerformanceScore = (metrics: Partial<HealthMetrics>): number => {
    let score = 100;

    // Deduct points for high memory usage
    if (metrics.memoryUsage && metrics.memoryLimit) {
      const memoryUsagePercent = (metrics.memoryUsage / metrics.memoryLimit) * 100;
      if (memoryUsagePercent > 80) score -= 20;
      else if (memoryUsagePercent > 60) score -= 10;
    }

    // Deduct points for being offline
    if (!metrics.isOnline) score -= 30;

    // Deduct points for slow connection
    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      score -= 15;
    } else if (metrics.connectionType === '3g') {
      score -= 5;
    }

    return Math.max(0, score);
  };

  const checkForAlerts = (newMetrics: Partial<HealthMetrics>) => {
    const newAlerts: typeof alerts = [];

    // Memory usage alert
    if (newMetrics.memoryUsage && newMetrics.memoryLimit) {
      const memoryPercent = (newMetrics.memoryUsage / newMetrics.memoryLimit) * 100;
      if (memoryPercent > 85) {
        newAlerts.push({
          id: 'memory-high',
          type: 'error',
          message: `High memory usage: ${memoryPercent.toFixed(1)}%`,
          timestamp: new Date().toISOString()
        });
      } else if (memoryPercent > 70) {
        newAlerts.push({
          id: 'memory-warning',
          type: 'warning',
          message: `Memory usage elevated: ${memoryPercent.toFixed(1)}%`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Storage alert
    if (newMetrics.storageUsed && newMetrics.storageQuota) {
      const storagePercent = (newMetrics.storageUsed / newMetrics.storageQuota) * 100;
      if (storagePercent > 90) {
        newAlerts.push({
          id: 'storage-high',
          type: 'error',
          message: `Storage almost full: ${storagePercent.toFixed(1)}%`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Connection alert
    if (!newMetrics.isOnline) {
      newAlerts.push({
        id: 'offline',
        type: 'error',
        message: 'Device is offline',
        timestamp: new Date().toISOString()
      });
    } else if (newMetrics.connectionType === 'slow-2g' || newMetrics.connectionType === '2g') {
      newAlerts.push({
        id: 'slow-connection',
        type: 'warning',
        message: 'Slow network connection detected',
        timestamp: new Date().toISOString()
      });
    }

    setAlerts(newAlerts);
  };

  const getHealthStatus = () => {
    if (!metrics.isOnline) return { status: 'critical', color: 'destructive', icon: XCircle };
    if (metrics.performanceScore < 60) return { status: 'warning', color: 'secondary', icon: AlertTriangle };
    return { status: 'healthy', color: 'default', icon: CheckCircle };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const health = getHealthStatus();
  const StatusIcon = health.icon;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <StatusIcon className={`h-4 w-4 ${
          health.status === 'healthy' ? 'text-green-500' : 
          health.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
        }`} />
        <span className="text-sm">
          {metrics.isOnline ? 'Online' : 'Offline'}
        </span>
        {metrics.performanceScore < 100 && (
          <Badge variant={health.color} className="text-xs">
            {metrics.performanceScore}%
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${
                  health.status === 'healthy' ? 'text-green-500' : 
                  health.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span>System Health</span>
              </CardTitle>
              <CardDescription>
                Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge variant={health.color}>
              {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Performance Score */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Performance Score</span>
              <span>{metrics.performanceScore}%</span>
            </div>
            <Progress value={metrics.performanceScore} className="h-2" />
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {metrics.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Connection</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {metrics.isOnline ? 'Online' : 'Offline'}
              </div>
              {metrics.connectionType !== 'unknown' && (
                <div className="text-xs text-muted-foreground">
                  {metrics.connectionType.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memoryLimit > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-4 w-4" />
                  <span className="text-sm">Memory</span>
                </div>
                <span className="text-sm">
                  {formatBytes(metrics.memoryUsage)} / {formatBytes(metrics.memoryLimit)}
                </span>
              </div>
              <Progress 
                value={(metrics.memoryUsage / metrics.memoryLimit) * 100} 
                className="h-2" 
              />
            </div>
          )}

          {/* Storage Usage */}
          {metrics.storageQuota > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm">Storage</span>
                </div>
                <span className="text-sm">
                  {formatBytes(metrics.storageUsed)} / {formatBytes(metrics.storageQuota)}
                </span>
              </div>
              <Progress 
                value={(metrics.storageUsed / metrics.storageQuota) * 100} 
                className="h-2" 
              />
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthMonitor;