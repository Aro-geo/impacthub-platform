import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
  Database,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  BookOpen,
  Zap,
  Star
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  aiInteractions: number;
  lessonsCompleted: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  databaseStatus: 'connected' | 'disconnected' | 'error';
}

interface AdminDashboardProps {
  onClose?: () => void;
}

const AdminDashboard = ({ onClose }: AdminDashboardProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    aiInteractions: 0,
    lessonsCompleted: 0,
    systemHealth: 'healthy',
    databaseStatus: 'connected'
  });
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.email === 'geokullo@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchPlatformStats();
    }
  }, [isAdmin]);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      
      // Fetch various platform statistics
      const [
        usersResult,
        postsResult,
        commentsResult,
        aiInteractionsResult
      ] = await Promise.allSettled([
        supabase.from('profiles').select('id, created_at').limit(1000),
        supabase.from('community_posts').select('id, created_at').limit(1000),
        supabase.from('post_comments').select('id, created_at').limit(1000),
        supabase.from('ai_interactions').select('id, created_at').limit(1000)
      ]);

      // Calculate stats with fallbacks
      const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.data?.length || 0) : 0;
      const totalPosts = postsResult.status === 'fulfilled' ? (postsResult.value.data?.length || 0) : 0;
      const totalComments = commentsResult.status === 'fulfilled' ? (commentsResult.value.data?.length || 0) : 0;
      const aiInteractions = aiInteractionsResult.status === 'fulfilled' ? (aiInteractionsResult.value.data?.length || 0) : 0;

      // Calculate active users (users who posted or commented in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let activeUsers = 0;
      if (postsResult.status === 'fulfilled' && postsResult.value.data) {
        const recentPosts = postsResult.value.data.filter(post => 
          new Date(post.created_at) > thirtyDaysAgo
        );
        activeUsers = new Set(recentPosts.map(post => post.user_id)).size;
      }

      // Determine system health based on error rates
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      let databaseStatus: 'connected' | 'disconnected' | 'error' = 'connected';

      const failedRequests = [usersResult, postsResult, commentsResult, aiInteractionsResult]
        .filter(result => result.status === 'rejected').length;

      if (failedRequests > 2) {
        systemHealth = 'critical';
        databaseStatus = 'error';
      } else if (failedRequests > 0) {
        systemHealth = 'warning';
      }

      setStats({
        totalUsers,
        activeUsers,
        totalPosts,
        totalComments,
        aiInteractions,
        lessonsCompleted: Math.floor(aiInteractions * 0.7), // Estimated
        systemHealth,
        databaseStatus
      });

    } catch (error) {
      console.error('Error fetching platform stats:', error);
      setStats(prev => ({
        ...prev,
        systemHealth: 'critical',
        databaseStatus: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground">Platform analytics and management tools</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <Shield className="h-3 w-3 mr-1" />
            Admin: George Okullo
          </Badge>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getHealthIcon(stats.systemHealth)}
                    <div>
                      <p className="font-medium text-foreground">Overall Health</p>
                      <p className="text-sm text-muted-foreground">System performance</p>
                    </div>
                  </div>
                  <Badge className={getHealthColor(stats.systemHealth)}>
                    {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-foreground">Database</p>
                      <p className="text-sm text-muted-foreground">Connection status</p>
                    </div>
                  </div>
                  <Badge className={getHealthColor(stats.databaseStatus === 'connected' ? 'healthy' : 'critical')}>
                    {stats.databaseStatus.charAt(0).toUpperCase() + stats.databaseStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Community Posts</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Comments</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalComments}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Interactions</p>
                    <p className="text-2xl font-bold text-foreground">{stats.aiInteractions}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                    <Brain className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lessons Completed</p>
                    <p className="text-2xl font-bold text-foreground">{stats.lessonsCompleted}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">User Registration</p>
                    <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">User Roles</p>
                    <p className="text-sm text-muted-foreground">Manage user permissions and roles</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage community posts, comments, and content moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Content Moderation</p>
                    <p className="text-sm text-muted-foreground">Review and moderate community content</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Featured Posts</p>
                    <p className="text-sm text-muted-foreground">Manage featured community posts</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Administration</CardTitle>
              <CardDescription>Platform configuration and maintenance tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Database Management</p>
                    <p className="text-sm text-muted-foreground">Monitor and maintain database performance</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Database className="h-4 w-4 mr-2" />
                    Monitor
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Performance Analytics</p>
                    <p className="text-sm text-muted-foreground">View detailed platform performance metrics</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">System Refresh</p>
                    <p className="text-sm text-muted-foreground">Refresh platform statistics and cache</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchPlatformStats}>
                    <Zap className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Tools Management</CardTitle>
              <CardDescription>Monitor and test AI functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* AI Performance Monitor */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">AI Performance Monitor</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      AI Performance monitoring tools will be displayed here for admin access.
                    </p>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View AI Performance
                    </Button>
                  </div>
                </div>

                {/* AI Testing Tools */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">AI Testing Tools</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      AI testing and debugging tools for development and maintenance.
                    </p>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Access Testing Tools
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;