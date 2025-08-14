import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Clock, Users, Server, Zap, Info, CheckCircle } from 'lucide-react';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

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
      
      // Use Promise.allSettled to handle potential failures gracefully
      const [patternsResult, insightsResult] = await Promise.allSettled([
        incidentAnalysisService.getErrorPatterns(range),
        incidentAnalysisService.getPerformanceInsights(range)
      ]);
      
      // Handle results with fallbacks
      const patterns = patternsResult.status === 'fulfilled' ? patternsResult.value : null;
      const insights = insightsResult.status === 'fulfilled' ? insightsResult.value : null;
      
      setErrorPatterns(patterns);
      setPerformanceInsights(insights);
      
      // Log any failures for debugging
      if (patternsResult.status === 'rejected') {
        console.warn('Failed to fetch error patterns:', patternsResult.reason);
      }
      if (insightsResult.status === 'rejected') {
        console.warn('Failed to fetch performance insights:', insightsResult.reason);
      }
      
    } catch (error) {
      console.error('Failed to fetch incident data:', error);
      // Set fallback data to prevent UI crashes
      setErrorPatterns(null);
      setPerformanceInsights(null);
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
          {!errorPatterns && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Incident Analysis Unavailable</AlertTitle>
              <AlertDescription>
                The incident analysis system requires database setup to function properly. 
                Using fallback data for demonstration.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Error Timeline - Simplified */}
            <Card>
              <CardHeader>
                <CardTitle>Error Timeline</CardTitle>
                <CardDescription>Errors over time (last 24 hours)</CardDescription>
              </CardHeader>
              <CardContent>
                {errorPatterns?.timeline ? (
                  <div className="space-y-2">
                    {errorPatterns.timeline.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{new Date(item.hour).toLocaleTimeString()}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(item.count / 10) * 100} className="w-20" />
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>No error timeline data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Errors by Component - Simplified */}
            <Card>
              <CardHeader>
                <CardTitle>Errors by Component</CardTitle>
                <CardDescription>Component failure distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {errorPatterns?.byComponent ? (
                  <div className="space-y-3">
                    {Object.entries(errorPatterns.byComponent).map(([component, count], index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{component}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={((count as number) / 10) * 100} className="w-20" />
                          <Badge variant={getSeverityColor(count as number)}>
                            {count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No component errors detected</p>
                  </div>
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
                <CardTitle>Page Load Performance</CardTitle>
                <CardDescription>Load time metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceInsights?.summary ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Load Time:</span>
                      <Badge variant="outline">{Math.round(performanceInsights.summary.avgPageLoad)}ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>95th Percentile:</span>
                      <Badge variant="outline">{Math.round(performanceInsights.summary.p95PageLoad)}ms</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance Score</span>
                        <span>{Math.round((3000 - performanceInsights.summary.avgPageLoad) / 30)}%</span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, (3000 - performanceInsights.summary.avgPageLoad) / 30))} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Current memory consumption</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceInsights?.summary ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Memory:</span>
                      <Badge variant="outline">
                        {Math.round(performanceInsights.summary.avgMemoryUsage / 1024 / 1024)}MB
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>{Math.round((performanceInsights.summary.avgMemoryUsage / 1024 / 1024 / 100) * 100)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (performanceInsights.summary.avgMemoryUsage / 1024 / 1024 / 100) * 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Server className="h-8 w-8 mx-auto mb-2" />
                    <p>No memory data available</p>
                  </div>
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
                {errorPatterns?.byUserAgent ? (
                  <div className="space-y-3">
                    {Object.entries(errorPatterns.byUserAgent).map(([browser, count], index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{browser}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={((count as number) / 5) * 100} className="w-20" />
                          <Badge variant={getSeverityColor(count as number)}>
                            {count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No browser-specific errors detected</p>
                  </div>
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
                  {errorPatterns?.byUrl ? (
                    Object.entries(errorPatterns.byUrl)
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
                      ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No URL-specific errors detected</p>
                    </div>
                  )}
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