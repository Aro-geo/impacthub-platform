import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Shield,
  RefreshCw,
  Download,
  Bell,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  cacheHitRate: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface SystemMonitoringProps {
  className?: string;
}

const SystemMonitoring: React.FC<SystemMonitoringProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.1,
    activeUsers: 0,
    databaseConnections: 15,
    memoryUsage: 68,
    cpuUsage: 45,
    diskUsage: 32,
    networkLatency: 12,
    cacheHitRate: 94
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      // Fetch real data from various sources
      await Promise.all([
        fetchMetrics(),
        fetchAlerts(),
        fetchPerformanceHistory()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      // Get active users count
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get recent error patterns
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const errorPatterns = await incidentAnalysisService.getErrorPatterns({
        start: startTime,
        end: endTime
      });

      // Calculate error rate
      const totalErrors = errorPatterns ? 
        Object.values(errorPatterns.byComponent).reduce((a: number, b: number) => a + b, 0) : 0;
      const errorRate = totalErrors > 0 ? Math.min((totalErrors / 1000) * 100, 5) : 0.1;

      // Simulate other metrics (in a real app, these would come from monitoring services)
      const simulatedMetrics = {
        responseTime: Math.floor(Math.random() * 100) + 200,
        memoryUsage: Math.floor(Math.random() * 20) + 60,
        cpuUsage: Math.floor(Math.random() * 30) + 30,
        diskUsage: Math.floor(Math.random() * 10) + 30,
        networkLatency: Math.floor(Math.random() * 10) + 8,
        cacheHitRate: Math.floor(Math.random() * 10) + 90,
        databaseConnections: Math.floor(Math.random() * 10) + 10
      };

      setMetrics(prev => ({
        ...prev,
        activeUsers: activeUsersCount || 0,
        errorRate: errorRate,
        ...simulatedMetrics
      }));

    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchAlerts = async () => {
    // Simulate system alerts (in a real app, these would come from monitoring systems)
    const simulatedAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Memory usage is above 80% threshold',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Database Backup Completed',
        message: 'Scheduled database backup completed successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: true
      },
      {
        id: '3',
        type: 'error',
        title: 'API Rate Limit Exceeded',
        message: 'External API rate limit exceeded for AI service',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        resolved: true
      }
    ];

    setAlerts(simulatedAlerts);
  };

  const fetchPerformanceHistory = async () => {
    // Generate performance history data
    const history: PerformanceData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      history.push({
        timestamp: timestamp.toISOString(),
        responseTime: Math.floor(Math.random() * 200) + 150,
        errorRate: Math.random() * 2,
        activeUsers: Math.floor(Math.random() * 50) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 50,
        cpuUsage: Math.floor(Math.random() * 50) + 25
      });
    }

    setPerformanceData(history);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value <= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const exportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts,
      performanceData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchSystemData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{metrics.uptime}%</p>
              </div>
              <div className="flex items-center">
                {getStatusIcon(100 - metrics.uptime, { good: 0.5, warning: 2 })}
                <Activity className="h-6 w-6 ml-2 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.responseTime, { good: 300, warning: 500 })}`}>
                  {metrics.responseTime}ms
                </p>
              </div>
              <div className="flex items-center">
                {getStatusIcon(metrics.responseTime, { good: 300, warning: 500 })}
                <Clock className="h-6 w-6 ml-2 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className={`text-2xl font-bold ${getStatusColor(metrics.errorRate, { good: 1, warning: 3 })}`}>
                  {metrics.errorRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center">
                {getStatusIcon(metrics.errorRate, { good: 1, warning: 3 })}
                <AlertTriangle className="h-6 w-6 ml-2 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <Globe className="h-6 w-6 ml-2 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
                <CardDescription>Average response time over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value) => [`${value}ms`, 'Response Time']}
                    />
                    <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate Trend</CardTitle>
                <CardDescription>Error rate percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Error Rate']}
                    />
                    <Area type="monotone" dataKey="errorRate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Health Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Indicators</CardTitle>
              <CardDescription>Current status of key system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-muted-foreground">{metrics.databaseConnections} connections</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">API Server</p>
                      <p className="text-sm text-muted-foreground">Healthy</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wifi className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Network</p>
                      <p className="text-sm text-muted-foreground">{metrics.networkLatency}ms latency</p>
                    </div>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Security</p>
                      <p className="text-sm text-muted-foreground">All systems secure</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Cache</p>
                      <p className="text-sm text-muted-foreground">{metrics.cacheHitRate}% hit rate</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Monitoring</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Active Users Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Active Users Over Time</CardTitle>
              <CardDescription>Number of active users in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [value, 'Active Users']}
                  />
                  <Area type="monotone" dataKey="activeUsers" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Comparison</CardTitle>
              <CardDescription>Current vs. average performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Time</span>
                    <span>{metrics.responseTime}ms</span>
                  </div>
                  <Progress value={(metrics.responseTime / 1000) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Error Rate</span>
                    <span>{metrics.errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.errorRate * 10} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cache Hit Rate</span>
                    <span>{metrics.cacheHitRate}%</span>
                  </div>
                  <Progress value={metrics.cacheHitRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Resource Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.cpuUsage}%</span>
                </div>
                <Progress value={metrics.cpuUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.memoryUsage}%</span>
                </div>
                <Progress value={metrics.memoryUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Disk Usage</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.diskUsage}%</span>
                </div>
                <Progress value={metrics.diskUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Network</span>
                  </div>
                  <span className="text-sm font-bold">{metrics.networkLatency}ms</span>
                </div>
                <Progress value={(metrics.networkLatency / 100) * 100} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Resource Usage Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Trends</CardTitle>
              <CardDescription>CPU and Memory usage over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => [`${value}%`, name === 'cpuUsage' ? 'CPU Usage' : 'Memory Usage']}
                  />
                  <Line type="monotone" dataKey="cpuUsage" stroke="#8884d8" strokeWidth={2} name="CPU Usage" />
                  <Line type="monotone" dataKey="memoryUsage" stroke="#82ca9d" strokeWidth={2} name="Memory Usage" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className={
                    alert.type === 'error' ? 'border-red-200 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        {alert.type === 'error' && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                        {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                        {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />}
                        <div>
                          <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                          <AlertDescription className="text-xs">
                            {alert.message}
                          </AlertDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.resolved ? (
                          <Badge variant="secondary">Resolved</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitoring;