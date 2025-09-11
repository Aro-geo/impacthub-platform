import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import OptimizedUnifiedCommunityForum from '@/components/shared/OptimizedUnifiedCommunityForum';
import MentorshipMatcher from '@/components/ai/MentorshipMatcher';

const Community = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('forum');

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to access the community.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Community Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect, learn, and grow together with AI-powered mentorship and community discussions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forum">Community Forum</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship Hub</TabsTrigger>
            <TabsTrigger value="ai-matcher">AI Mentor Matcher</TabsTrigger>
            <TabsTrigger value="events">Events & Meetups</TabsTrigger>
          </TabsList>

          <TabsContent value="forum">
            <OptimizedUnifiedCommunityForum 
              context="general"
              title="ImpactHub Community"
              description="Connect with learners, share knowledge, and grow together across all our platforms"
            />
          </TabsContent>

          <TabsContent value="mentorship">
            <div className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold mb-4">Mentorship Hub</h3>
                <p className="text-muted-foreground mb-6">
                  Connect with mentors and mentees in your field of interest
                </p>
                <p className="text-sm text-muted-foreground">
                  Traditional mentorship hub coming soon! For now, use our AI-powered matcher below.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-matcher">
            <MentorshipMatcher />
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold mb-4">Events & Meetups</h3>
                <p className="text-muted-foreground mb-6">
                  Join community events, study groups, and networking sessions
                </p>
                <p className="text-sm text-muted-foreground">
                  Events feature coming soon! Stay tuned for virtual meetups and learning sessions.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;