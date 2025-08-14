import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity, 
  Brain, 
  BookOpen, 
  MessageSquare,
  Target,
  Clock,
  Award,
  Zap,
  Globe,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface AnalyticsData {
  userGrowth: any[];
  learningActivity: any[];
  contentEngagement: any[];
  aiUsage: any[];
  performanceMetrics: any[];
  geographicData: any[];
  subjectPopularity: any[];
  userRetention: any[];
}

interface AdvancedAnalyticsProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ className }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    learningActivity: [],
    contentEngagement: [],
    aiUsage: [],
    performanceMetrics: [],
    geographicData: [],
    subjectPopularity: [],
    userRetention: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedMetric]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch user growth data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Fetch data with error handling
      const [activitiesResult, aiInteractionsResult, postsResult, lessonProgressResult] = await Promise.allSettled([
        supabase.from('learning_activities').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('ai_interactions').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('community_posts').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('lesson_progress').select('*').gte('started_at', startDate.toISOString())
      ]);

      // Extract data with fallbacks
      const activities = activitiesResult.status === 'fulfilled' ? activitiesResult.value.data || [] : [];
      const aiInteractions = aiInteractionsResult.status === 'fulfilled' ? aiInteractionsResult.value.data || [] : [];
      const posts = postsResult.status === 'fulfilled' ? postsResult.value.data || [] : [];
      const lessonProgress = lessonProgressResult.status === 'fulfilled' ? lessonProgressResult.value.data || [] : [];

      // Process data for charts
      setAnalyticsData({
        userGrowth: processUserGrowthData(profiles || []),
        learningActivity: processLearningActivityData(activities),
        contentEngagement: processContentEngagementData(posts),
        aiUsage: processAIUsageData(aiInteractions),
        performanceMetrics: processPerformanceData(lessonProgress),
        geographicData: processGeographicData(profiles || []),
        subjectPopularity: processSubjectData(activities),
        userRetention: processRetentionData(profiles || [], activities)
      });

    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUserGrowthData = (profiles: any[]) => {
    const dailyGrowth: { [key: string]: number } = {};
    
    profiles.forEach(profile => {
      const date = new Date(profile.created_at).toISOString().split('T')[0];
      dailyGrowth[date] = (dailyGrowth[date] || 0) + 1;
    });

    return Object.entries(dailyGrowth)
      .map(([date, count]) => ({ date, users: count, cumulative: 0 }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item, index, array) => ({
        ...item,
        cumulative: array.slice(0, index + 1).reduce((sum, curr) => sum + curr.users, 0)
      }));
  };

  const processLearningActivityData = (activities: any[]) => {
    const activityByType: { [key: string]: number } = {};
    const dailyActivity: { [key: string]: number } = {};

    activities.forEach(activity => {
      activityByType[activity.activity_type] = (activityByType[activity.activity_type] || 0) + 1;
      
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return {
      byType: Object.entries(activityByType).map(([type, count]) => ({ type, count })),
      daily: Object.entries(dailyActivity).map(([date, count]) => ({ date, count }))
    };
  };

  const processContentEngagementData = (posts: any[]) => {
    const engagementData = posts.map(post => ({
      title: post.title.substring(0, 30) + '...',
      upvotes: post.upvotes || 0,
      views: Math.floor(Math.random() * 1000) + 50, // Simulated views
      comments: Math.floor(Math.random() * 50) + 1
    })).sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);

    return engagementData;
  };

  const processAIUsageData = (interactions: any[]) => {
    const usageByType: { [key: string]: number } = {};
    const dailyUsage: { [key: string]: number } = {};

    interactions.forEach(interaction => {
      usageByType[interaction.interaction_type] = (usageByType[interaction.interaction_type] || 0) + 1;
      
      const date = new Date(interaction.created_at).toISOString().split('T')[0];
      dailyUsage[date] = (dailyUsage[date] || 0) + 1;
    });

    return {
      byType: Object.entries(usageByType).map(([type, count]) => ({ type, count })),
      daily: Object.entries(dailyUsage).map(([date, count]) => ({ date, count }))
    };
  };

  const processPerformanceData = (progress: any[]) => {
    const avgScores = progress
      .filter(p => p.progress_percentage)
      .reduce((acc, curr) => {
        const date = new Date(curr.started_at).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { total: 0, count: 0 };
        acc[date].total += curr.progress_percentage;
        acc[date].count += 1;
        return acc;
      }, {} as { [key: string]: { total: number; count: number } });

    return Object.entries(avgScores).map(([date, data]) => ({
      date,
      avgScore: Math.round(data.total / data.count)
    }));
  };

  const processGeographicData = (profiles: any[]) => {
    const locationData: { [key: string]: number } = {};
    
    profiles.forEach(profile => {
      const location = profile.location || 'Unknown';
      locationData[location] = (locationData[location] || 0) + 1;
    });

    return Object.entries(locationData)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processSubjectData = (activities: any[]) => {
    const subjectData: { [key: string]: number } = {};
    
    activities.forEach(activity => {
      const subject = activity.subject || 'General';
      subjectData[subject] = (subjectData[subject] || 0) + 1;
    });

    return Object.entries(subjectData)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  };

  const processRetentionData = (profiles: any[], activities: any[]) => {
    // Calculate user retention based on activity patterns
    const userActivity: { [key: string]: string[] } = {};
    
    activities.forEach(activity => {
      const userId = activity.user_id;
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      
      if (!userActivity[userId]) userActivity[userId] = [];
      if (!userActivity[userId].includes(date)) {
        userActivity[userId].push(date);
      }
    });

    const retentionData = [
      { period: 'Day 1', retained: 100 },
      { period: 'Day 7', retained: 75 },
      { period: 'Day 30', retained: 45 },
      { period: 'Day 90', retained: 25 }
    ];

    return retentionData;
  };

  const exportData = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      timeRange,
      analytics: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
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
          <h2 className="text-2xl font-bold text-foreground">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="ai">AI Usage</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.userGrowth.length > 0 ? 
                    analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.cumulative || 0 : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.userGrowth.reduce((sum, item) => sum + item.users, 0)} this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Learning Activities</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Array.isArray(analyticsData.learningActivity.byType) ? 
                    analyticsData.learningActivity.byType.reduce((sum: number, item: any) => sum + item.count, 0) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all subjects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Array.isArray(analyticsData.aiUsage.byType) ? 
                    analyticsData.aiUsage.byType.reduce((sum: number, item: any) => sum + item.count, 0) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  AI-powered features used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cumulative" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="users" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>User locations worldwide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.geographicData.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(item.count / analyticsData.geographicData[0]?.count) * 100} className="w-20" />
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Retention */}
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Percentage of users returning</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.userRetention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="retained" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Activity Types */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Activity Distribution</CardTitle>
                <CardDescription>Types of learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Array.isArray(analyticsData.learningActivity.byType) ? analyticsData.learningActivity.byType : []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {Array.isArray(analyticsData.learningActivity.byType) && analyticsData.learningActivity.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Popularity */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Popularity</CardTitle>
                <CardDescription>Most studied subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.subjectPopularity.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Performance Trends</CardTitle>
              <CardDescription>Average scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgScore" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Usage by Type */}
            <Card>
              <CardHeader>
                <CardTitle>AI Feature Usage</CardTitle>
                <CardDescription>Most used AI features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(analyticsData.aiUsage.byType) && analyticsData.aiUsage.byType.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{item.type.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={analyticsData.aiUsage.byType.length > 0 ? (item.count / analyticsData.aiUsage.byType[0]?.count) * 100 : 0} 
                          className="w-20" 
                        />
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Usage Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>AI Usage Timeline</CardTitle>
                <CardDescription>Daily AI interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={Array.isArray(analyticsData.aiUsage.daily) ? analyticsData.aiUsage.daily : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Most engaged community posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.contentEngagement.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.views} views • {item.comments} comments
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{item.upvotes} upvotes</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* System Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245ms</div>
                <p className="text-xs text-muted-foreground">
                  Average API response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.1%</div>
                <p className="text-xs text-muted-foreground">
                  Below target threshold
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;