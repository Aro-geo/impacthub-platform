import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import OptimizedUnifiedCommunityForum from '@/components/shared/OptimizedUnifiedCommunityForum';

const Community = () => {
  const { user, loading } = useAuth();

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
        <OptimizedUnifiedCommunityForum 
          context="general"
          title="ImpactHub Community"
          description="Connect with learners, share knowledge, and grow together across all our platforms"
        />
      </div>
    </div>
  );
};

export default Community;