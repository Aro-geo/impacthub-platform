
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Users, Globe, Award, Target, Calendar, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const stats = [
    { label: 'Impact Points', value: '1,250', icon: Award, color: 'text-blue-600' },
    { label: 'Goals Completed', value: '12', icon: Target, color: 'text-green-600' },
    { label: 'Hours Volunteered', value: '48', icon: Users, color: 'text-purple-600' },
    { label: 'CO₂ Saved (kg)', value: '125', icon: Globe, color: 'text-orange-600' },
  ];

  const recentActivity = [
    { type: 'goal', title: 'Completed "Learn Sign Language" course', time: '2 hours ago' },
    { type: 'volunteer', title: 'Volunteered at Local Food Bank', time: '1 day ago' },
    { type: 'post', title: 'Posted in Sustainability Forum', time: '3 days ago' },
    { type: 'resource', title: 'Shared accessibility resource', time: '5 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.name || 'Impact Maker'}!
                </h1>
                <p className="text-gray-600">Ready to make a difference today?</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Impact Journey
                </CardTitle>
                <CardDescription>
                  Track your progress and see how you're making a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-blue-900">Current Goal</h3>
                      <p className="text-blue-700">Complete Digital Accessibility Course</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Progress</p>
                      <p className="text-2xl font-bold text-blue-900">75%</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">This Week</h4>
                      <p className="text-green-700">8 hours of community service</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900">This Month</h4>
                      <p className="text-purple-700">3 new skills learned</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    🎓 Learner
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    🌱 Eco Warrior
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    🤝 Community Helper
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
