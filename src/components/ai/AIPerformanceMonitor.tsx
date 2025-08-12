import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { aiService } from '@/services/aiService';
import { AI_CONFIG, PERFORMANCE_METRICS } from '@/config/aiConfig';
import { 
  Zap, 
  Clock, 
  Database, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceStats {
  cacheSize: number;
  queueLength: number;
  isProcessingQueue: boolean;
  cacheHitRate: number;
}

interface ConnectionTest {
  success: boolean;
  message: string;
  performance: {
    responseTime: string;
    model?: string;
    temperature?: number;
    cacheSize?: number;
    queueLength?: number;
  };
}

const AIPerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [testing, setTesting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const refreshStats = () => {
    const performanceStats = aiService.getPerformanceStats();
    setStats(performanceStats);
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const result = await aiService.testConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        success: false,
        message: 'Connection test failed',
        performance: { responseTime: 'N/A' }
      });
    } finally {
      setTesting(false);
    }
  };

  const clearCache = () => {
    aiService.clearCache();
    refreshStats();
  };

  useEffect(() => {
    refreshStats();
    
    if (autoRefresh) {
      const interval = setInterval(refreshStats, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getResponseTimeStatus = (responseTime: string) => {
    const time = parseInt(responseTime.replace('ms', ''));
    if (time < PERFORMANCE_METRICS.RESPONSE_TIME_THRESHOLDS.FAST) return 'fast';
    if (time < PERFORMANCE_METRICS.RESPONSE_TIME_THRESHOLDS.NORMAL) return 'normal';
    return 'slow';
  };

  const getCacheEfficiencyStatus = (hitRate: number) => {
    if (hitRate >= PERFORMANCE_METRICS.CACHE_EFFICIENCY.GOOD) return 'good';
    if (hitRate >= PERFORMANCE_METRICS.CACHE_EFFICIENCY.FAIR) return 'fair';
    return 'poor';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>AI Performance Monitor</span>
          </CardTitle>
          <CardDescription>
            Monitor DeepSeek-V2.5 API performance and optimization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button onClick={refreshStats} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            <Button 
              onClick={testConnection} 
              size="sm" 
              disabled={testing}
              variant={connectionTest?.success ? "default" : "secondary"}
            >
              <Zap className="h-4 w-4 mr-2" />
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={clearCache} size="sm" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button 
              onClick={() => setAutoRefresh(!autoRefresh)} 
              size="sm" 
              variant={autoRefresh ? "default" : "outline"}
            >
              Auto Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Connection Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              {connectionTest?.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Connection Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionTest ? (
              <div className="space-y-2">
                <Badge variant={connectionTest.success ? "default" : "destructive"}>
                  {connectionTest.success ? 'Connected' : 'Disconnected'}
                </Badge>
                <div className="text-sm">
                  <div>Response Time: {connectionTest.performance.responseTime}</div>
                  <div>Model: {connectionTest.performance.model || 'DeepSeek-V2.5'}</div>
                  {connectionTest.performance.temperature !== undefined && (
                    <div>Temperature: {connectionTest.performance.temperature}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Click "Test Connection" to check API status
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cache Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Cache Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cache Size:</span>
                  <span>{stats.cacheSize} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hit Rate:</span>
                  <Badge variant={getCacheEfficiencyStatus(stats.cacheHitRate) === 'good' ? 'default' : 'secondary'}>
                    {Math.round(stats.cacheHitRate * 100)}%
                  </Badge>
                </div>
                <Progress value={stats.cacheHitRate * 100} className="h-2" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading cache stats...</div>
            )}
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Request Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Queue Length:</span>
                  <span>{stats.queueLength}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing:</span>
                  <Badge variant={stats.isProcessingQueue ? "default" : "secondary"}>
                    {stats.isProcessingQueue ? 'Active' : 'Idle'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading queue stats...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Temperature Settings</h4>
              <div className="space-y-1">
                <div>Coding/Math: {AI_CONFIG.TEMPERATURES.CODING_MATH}</div>
                <div>General Conversation: {AI_CONFIG.TEMPERATURES.GENERAL_CONVERSATION}</div>
                <div>Structured Content: {AI_CONFIG.TEMPERATURES.STRUCTURED_CONTENT}</div>
                <div>Translation: {AI_CONFIG.TEMPERATURES.TRANSLATION}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Performance Settings</h4>
              <div className="space-y-1">
                <div>Cache Enabled: {AI_CONFIG.PERFORMANCE.CACHE_ENABLED ? 'Yes' : 'No'}</div>
                <div>Cache Duration: {AI_CONFIG.PERFORMANCE.CACHE_DURATION / 1000}s</div>
                <div>Queue Delay: {AI_CONFIG.PERFORMANCE.RATE_LIMITING.QUEUE_DELAY}ms</div>
                <div>Model: {AI_CONFIG.MODEL}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Time Analysis */}
      {connectionTest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Response Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Response Time:</span>
                <Badge variant={
                  getResponseTimeStatus(connectionTest.performance.responseTime) === 'fast' ? 'default' :
                  getResponseTimeStatus(connectionTest.performance.responseTime) === 'normal' ? 'secondary' : 'destructive'
                }>
                  {connectionTest.performance.responseTime}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Fast: &lt;1s | Normal: 1-3s | Slow: &gt;3s
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIPerformanceMonitor;