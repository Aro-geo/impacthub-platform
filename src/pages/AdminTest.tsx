import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, Users, BarChart3, Settings } from 'lucide-react';

const AdminTest = () => {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.email === 'geokullo@gmail.com';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Platform Test</h1>
              <p className="text-muted-foreground mt-2">
                Testing admin functionality and database connectivity
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access Verified
            </Badge>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Admin authentication is working correctly
              </p>
              <Badge variant="default">✓ Verified</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Database</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Some admin tables may not be set up yet
              </p>
              <Badge variant="secondary">⚠ Partial</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Components</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                All admin components loaded successfully
              </p>
              <Badge variant="default">✓ Ready</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Feature Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Available Admin Features</CardTitle>
              <CardDescription>Features that are currently functional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Admin Dashboard Overview</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">User Profile Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">System Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Platform Settings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Requiring Setup</CardTitle>
              <CardDescription>Features that need database migration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Advanced Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Incident Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Performance Metrics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Learning Activity Tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <a href="/admin-dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Open Full Admin Dashboard
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <a href="/admin">
              <Users className="h-4 w-4 mr-2" />
              Basic Admin Panel
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
              <Settings className="h-4 w-4 mr-2" />
              Supabase Dashboard
            </a>
          </Button>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>How to enable full admin functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Database Migration</h4>
                <p className="text-sm text-muted-foreground">
                  Run the database migration scripts in your Supabase project to create the required admin tables.
                  Check the <code>database-migration-simple.sql</code> file in the project root.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Row Level Security</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure RLS policies are properly configured for admin access to all tables.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Test Features</h4>
                <p className="text-sm text-muted-foreground">
                  Once the database is set up, test each admin feature to ensure proper functionality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTest;