import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, BarChart3, Settings, Monitor, AlertTriangle } from 'lucide-react';

const AdminDashboardTest = () => {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.email === 'geokullo@gmail.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <Badge variant="destructive">Admin Access Required</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive platform management and analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                <Shield className="h-3 w-3 mr-1" />
                Admin: {user?.email}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Admin Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Advanced Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Comprehensive platform insights, user behavior analysis, learning patterns, and performance metrics with interactive charts and data visualization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Complete user administration including role management, user banning/unbanning, profile editing, and bulk user operations with advanced filtering.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Review and moderate community posts, comments, manage featured content, handle reports, and maintain platform content quality standards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <Monitor className="h-5 w-5 mr-2 text-orange-600" />
                  System Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Real-time system health monitoring, performance metrics, resource usage tracking, uptime monitoring, and system alerts management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Incident Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Production incident tracking, error pattern analysis, performance insights, and automated incident detection with detailed reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Configure platform behavior, security settings, AI features, email configuration, database settings, and advanced system parameters.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Admin Dashboard */}
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminDashboardTest;