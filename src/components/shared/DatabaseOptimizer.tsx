import { useEffect } from 'react';
import { prefetchData } from '@/utils/dbOptimization';
import { useAuth } from '@/contexts/AuthContext';

/**
 * DatabaseOptimizer component
 * 
 * This component prefetches commonly needed data in the background
 * to improve perceived performance across the application.
 * 
 * Usage: Include this component in your app layout or high-level component.
 * <DatabaseOptimizer />
 */
const DatabaseOptimizer = () => {
  const { user } = useAuth();
  
  // Prefetch common data when the component mounts and user changes
  useEffect(() => {
    if (!user) return;
    
    const userId = user.id;
    
    // Prefetch data that's frequently needed
    prefetchData([
      // Common subjects (used across multiple pages)
      {
        tableName: 'subjects',
        columns: ['id', 'name', 'color', 'icon'],
        cacheKey: 'subjects:minimal',
        ttlSeconds: 1800 // 30 minutes
      },
      
      // User's in-progress lessons
      {
        tableName: 'lesson_progress',
        columns: ['id', 'lesson_id', 'status', 'progress_percentage', 'last_accessed'],
        filters: { 
          user_id: userId,
          status: 'in_progress'
        },
        cacheKey: `user:${userId}:in_progress_lessons`,
        ttlSeconds: 300 // 5 minutes
      },
      
      // Recent community posts
      {
        tableName: 'posts',
        columns: ['id', 'title', 'created_at', 'user_id'],
        cacheKey: 'recent_posts',
        ttlSeconds: 300 // 5 minutes
      }
    ]);
    
    // Prefetch user-specific data
    if (userId) {
      prefetchData([
        // User profile
        {
          tableName: 'profiles',
          columns: ['id', 'name', 'avatar_url', 'impact_points', 'skills'],
          filters: { id: userId },
          cacheKey: `profile:${userId}`,
          ttlSeconds: 600 // 10 minutes
        }
      ]);
    }
  }, [user]);
  
  // This component doesn't render anything
  return null;
};

export default DatabaseOptimizer;
