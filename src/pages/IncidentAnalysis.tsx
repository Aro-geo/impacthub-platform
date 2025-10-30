import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { AlertTriangle, Activity, BarChart3, Settings } from 'lucide-react';

// Lazy load heavy components
const SystemHealthMonitor = lazy(() => import('@/components/shared/SystemHealthMonitor'));

const IncidentAnalysis: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [isDatabaseSetup, setIsDatabaseSetup] = useState(false);

  // Check if user is admin (you may need to adjust this based on your user role system)
  const isAdmin = userProfile?.email?.includes('admin') || userProfile?.role === 'admin';

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This page is only accessible to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Monitoring & Incident Analysis</h1>
            <p className="text-muted-foreground">
              Monitor production health and analyze incident patterns
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Admin Panel</span>
          </Badge>
        </div>

        {/* Database Setup Warning */}
        {!isDatabaseSetup && (
          <Suspense fallback={<LoadingSpinner text="Loading setup check..." />}>
            <DatabaseSetupWarning onSetupComplete={() => setIsDatabaseSetup(true)} />
          </Suspense>
        )}

        {/* System Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner text="Loading system health..." />}>
              <SystemHealthMonitor />
            </Suspense>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Quick Stats</span>
                </CardTitle>
                <CardDescription>
                  Real-time system performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">1.2s</div>
                    <div className="text-sm text-muted-foreground">Avg Load</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">0.1%</div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">247</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="incidents" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Incident Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <Suspense fallback={<LoadingSpinner text="Loading incident dashboard..." />}>
              <IncidentDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>
                  Detailed performance metrics and optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Core Web Vitals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">LCP</span>
                            <Badge variant="default">Good</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">FID</span>
                            <Badge variant="default">Good</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">CLS</span>
                            <Badge variant="secondary">Needs Improvement</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Bundle Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Main Bundle</span>
                            <span className="text-sm">245 KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Vendor Bundle</span>
                            <span className="text-sm">892 KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total Size</span>
                            <span className="text-sm font-medium">1.1 MB</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Cache Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Hit Rate</span>
                            <span className="text-sm">87%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Miss Rate</span>
                            <span className="text-sm">13%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Cache Size</span>
                            <span className="text-sm">45 MB</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 border rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <div className="font-medium">Optimize Bundle Size</div>
                            <div className="text-sm text-muted-foreground">
                              Consider code splitting for vendor libraries to reduce initial bundle size
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <div className="font-medium">Improve Cache Strategy</div>
                            <div className="text-sm text-muted-foreground">
                              Implement better caching for API responses to reduce server load
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Settings</CardTitle>
                <CardDescription>
                  Configure monitoring thresholds and alert preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Performance Thresholds</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Page Load Warning (ms)</label>
                        <input 
                          type="number" 
                          defaultValue="2000" 
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">API Response Warning (ms)</label>
                        <input 
                          type="number" 
                          defaultValue="1000" 
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Memory Usage Warning (%)</label>
                        <input 
                          type="number" 
                          defaultValue="80" 
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Error Rate Alert (%)</label>
                        <input 
                          type="number" 
                          defaultValue="5" 
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Data Retention</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Error Logs (days)</label>
                        <input 
                          type="number" 
                          defaultValue="30" 
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Performance Metrics (days)</label>
                        <input 
                          type="number" 
                          defaultValue="7" 
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IncidentAnalysis;