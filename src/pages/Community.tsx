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
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
            Community Hub
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Connect, learn, and grow together. All community features unified in one place.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
            <TabsTrigger value="forum" className="text-sm sm:text-base whitespace-normal h-auto py-2">Community Forum</TabsTrigger>
            <TabsTrigger value="mentorship" className="text-sm sm:text-base whitespace-normal h-auto py-2">Mentorship Hub</TabsTrigger>
            <TabsTrigger value="ai-matcher" className="text-sm sm:text-base whitespace-normal h-auto py-2">AI Mentor Matcher</TabsTrigger>
            <TabsTrigger value="events" className="text-sm sm:text-base whitespace-normal h-auto py-2">Events & Learning</TabsTrigger>
          </TabsList>

          {/* All tabs show the same unified community content */}
          <TabsContent value="forum">
            <div className="space-y-8">
              {/* Main Community Forum */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold mb-2">Community Discussions</h2>
                  <p className="text-muted-foreground">
                    Join conversations, ask questions, and share knowledge with the community
                  </p>
                </div>
                <div className="p-6">
                  <OptimizedUnifiedCommunityForum 
                    context="general"
                    title=""
                    description=""
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mentorship">
            <div className="space-y-8">
              {/* Main Community Forum */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold mb-2">Community Discussions</h2>
                  <p className="text-muted-foreground">
                    Connect with mentors and mentees through community discussions
                  </p>
                </div>
                <div className="p-6">
                  <OptimizedUnifiedCommunityForum 
                    context="general"
                    title=""
                    description=""
                  />
                </div>
              </div>

              {/* AI Mentorship Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold mb-2">Find Your Perfect Mentor</h2>
                  <p className="text-muted-foreground">
                    Use AI to find mentors that match your learning goals and interests
                  </p>
                </div>
                <div className="p-6">
                  <MentorshipMatcher />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-matcher">
            <div className="space-y-8">
              {/* AI Mentorship Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold mb-2">AI Mentor Matching</h2>
                  <p className="text-muted-foreground">
                    Advanced AI algorithms to find the perfect mentor-mentee matches
                  </p>
                </div>
                <div className="p-6">
                  <MentorshipMatcher />
                </div>
              </div>

              {/* Main Community Forum */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold mb-2">Community Support</h2>
                  <p className="text-muted-foreground">
                    Discuss mentorship experiences and get advice from the community
                  </p>
                </div>
                <div className="p-6">
                  <OptimizedUnifiedCommunityForum 
                    context="general"
                    title=""
                    description=""
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-8">
              {/* Main Community Forum */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold mb-2">Community Events & Learning</h2>
                  <p className="text-muted-foreground">
                    Join discussions about upcoming events and collaborative learning opportunities
                  </p>
                </div>
                <div className="p-6">
                  <OptimizedUnifiedCommunityForum 
                    context="general"
                    title=""
                    description=""
                  />
                </div>
              </div>

              {/* AI Mentorship Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-semibold mb-2">Connect with Learning Partners</h2>
                  <p className="text-muted-foreground">
                    Find study partners and mentors for collaborative learning experiences
                  </p>
                </div>
                <div className="p-6">
                  <MentorshipMatcher />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;