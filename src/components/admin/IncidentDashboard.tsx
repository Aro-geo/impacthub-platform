import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, Clock, Users, Server, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

// Lazy load the entire charts module
const Charts = lazy(() => import('./IncidentCharts'));

interface IncidentDashboardProps {
  className?: string;
}

const IncidentDashboard: React.FC<IncidentDashboardProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [errorPatterns, setErrorPatterns] = useState<any>(null);
  const [performanceInsights, setPerformanceInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getTimeRange = (range: string) => {
    const end = new Date().toISOString();
    const start = new Date();
    
    switch (range) {
      case '1h':
        start.setHours(start.getHours() - 1);
        break;
      case '24h':
        start.setDate(start.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      default:
        start.setDate(start.getDate() - 1);
    }
    
    return { start: start.toISOString(), end };
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const range = getTimeRange(timeRange);
      
      const [patterns, insights] = await Promise.all([
        incidentAnalysisService.getErrorPatterns(range),
        incidentAnalysisService.getPerformanceInsights(range)
      ]);
      
      setErrorPatterns(patterns);
      setPerformanceInsights(insights);
    } catch (error) {
      console.error('Failed to fetch incident data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const getSeverityColor = (count: number) => {
    if (count > 100) return 'destructive';
    if (count > 50) return 'secondary';
    return 'default';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Production Incident Analysis</h1>
          <p className="text-muted-foreground">Monitor system health and identify patterns</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {errorPatterns ? Object.values(errorPatterns.byComponent).reduce((a: number, b: number) => a + b, 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {errorPatterns?.criticalErrors?.length || 0} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Page Load</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceInsights?.summary?.avgPageLoad ? 
                `${Math.round(performanceInsights.summary.avgPageLoad)}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {performanceInsights?.summary?.p95PageLoad ? 
                `${Math.round(performanceInsights.summary.p95PageLoad)}ms` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceInsights?.summary?.avgApiResponse ? 
                `${Math.round(performanceInsights.summary.avgApiResponse)}ms` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {performanceInsights?.summary?.p95ApiResponse ? 
                `${Math.round(performanceInsights.summary.p95ApiResponse)}ms` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceInsights?.summary?.avgMemoryUsage ? 
                `${Math.round(performanceInsights.summary.avgMemoryUsage / 1024 / 1024)}MB` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average heap usage
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Error Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Error Timeline</CardTitle>
                <CardDescription>Errors over time</CardDescription>
              </CardHeader>
              <CardContent>
                {errorPatterns?.timeline && (
                  <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><LoadingSpinner text="Loading chart..." /></div>}>
                    <Charts.ErrorTimelineChart data={errorPatterns.timeline} />
                  </Suspense>
                )}
              </CardContent>
            </Card>

            {/* Errors by Component */}
            <Card>
              <CardHeader>
                <CardTitle>Errors by Component</CardTitle>
                <CardDescription>Component failure distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {errorPatterns?.byComponent && (
                  <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><LoadingSpinner text="Loading chart..." /></div>}>
                    <Charts.ComponentErrorChart 
                      data={Object.entries(errorPatterns.byComponent).map(([name, value]) => ({ name, value }))} 
                    />
                  </Suspense>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Critical Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Critical Errors</CardTitle>
              <CardDescription>High-priority issues requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorPatterns?.criticalErrors?.slice(0, 10).map((error: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{error.message}</div>
                      <div className="text-sm text-muted-foreground">
                        {error.component} • {new Date(error.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(1)}>Critical</Badge>
                  </div>
                )) || <p className="text-muted-foreground">No critical errors found</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Page Load Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Page Load Distribution</CardTitle>
                <CardDescription>Load time percentiles</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceInsights?.pageLoadTimes && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average:</span>
                      <span>{Math.round(performanceInsights.summary.avgPageLoad)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>95th Percentile:</span>
                      <span>{Math.round(performanceInsights.summary.p95PageLoad)}ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (performanceInsights.summary.avgPageLoad / 3000) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Memory Usage Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Heap memory consumption</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceInsights?.memoryUsage && (
                  <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><LoadingSpinner text="Loading chart..." /></div>}>
                    <Charts.MemoryUsageChart 
                      data={performanceInsights.memoryUsage.map((value: number, index: number) => ({ 
                        index, 
                        memory: Math.round(value / 1024 / 1024) 
                      }))} 
                    />
                  </Suspense>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Slowest Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Slowest Pages</CardTitle>
              <CardDescription>Pages with highest load times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceInsights?.summary?.slowestPages?.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{page.url}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg: {Math.round(page.avgTime)}ms • P95: {Math.round(page.p95Time)}ms
                      </div>
                    </div>
                    <Badge variant={page.avgTime > 2000 ? 'destructive' : page.avgTime > 1000 ? 'secondary' : 'default'}>
                      {Math.round(page.avgTime)}ms
                    </Badge>
                  </div>
                )) || <p className="text-muted-foreground">No performance data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Browser Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Errors by Browser</CardTitle>
                <CardDescription>Browser-specific error patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {errorPatterns?.byUserAgent && (
                  <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><LoadingSpinner text="Loading chart..." /></div>}>
                    <Charts.BrowserErrorChart 
                      data={Object.entries(errorPatterns.byUserAgent).map(([name, value]) => ({ name, value }))} 
                    />
                  </Suspense>
                )}
              </CardContent>
            </Card>

            {/* URL Error Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Errors by URL</CardTitle>
                <CardDescription>Page-specific error frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {errorPatterns?.byUrl && Object.entries(errorPatterns.byUrl)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 10)
                    .map(([url, count], index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 truncate">
                          <div className="text-sm font-medium truncate">{url}</div>
                        </div>
                        <Badge variant={getSeverityColor(count as number)}>
                          {count}
                        </Badge>
                      </div>
                    )) || <p className="text-muted-foreground">No URL data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Error Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Most Common Errors</CardTitle>
              <CardDescription>Frequently occurring error messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorPatterns?.byMessage && Object.entries(errorPatterns.byMessage)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 10)
                  .map(([message, count], index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium truncate">{message}</div>
                        <div className="text-sm text-muted-foreground">
                          Occurred {count} times
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(count as number)}>
                        {count}
                      </Badge>
                    </div>
                  )) || <p className="text-muted-foreground">No error message data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentDashboard;