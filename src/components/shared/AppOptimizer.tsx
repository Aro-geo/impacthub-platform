/**
 * Performance Optimizer for App Loading
 * 
 * A more comprehensive component that integrates multiple optimization
 * strategies including data prefetching, script loading control,
 * and resource prioritization.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { prefetchData } from '@/utils/dbOptimization';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

// List of critical services and data to prioritize on app load
const CRITICAL_RESOURCES = [
  'auth', 
  'user_profile', 
  'navigation',
  'recent_lessons'
];

// List of non-critical resources that can be loaded after the app is interactive
const DEFERRED_RESOURCES = [
  'community_posts',
  'analytics',
  'recommendations',
  'notifications'
];

interface LoadingMetrics {
  startTime: number;
  resourcesLoaded: number;
  totalResources: number;
  criticalResourcesLoaded: boolean;
}

/**
 * AppOptimizer Component
 * 
 * This is an enhanced version of DatabaseOptimizer that handles more aspects
 * of application performance beyond just database optimization.
 * 
 * It implements:
 * 1. Database prefetching for critical data
 * 2. Progressive loading of non-critical resources
 * 3. Performance metrics tracking
 * 4. Resource loading prioritization
 */
const AppOptimizer = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<LoadingMetrics>({
    startTime: performance.now(),
    resourcesLoaded: 0,
    totalResources: CRITICAL_RESOURCES.length + DEFERRED_RESOURCES.length,
    criticalResourcesLoaded: false
  });
  
  // Track and report loading performance
  useEffect(() => {
    if (metrics.criticalResourcesLoaded) {
      const timeToInteractive = performance.now() - metrics.startTime;
      
      // Log performance metrics for analysis
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Time to interactive: ${timeToInteractive.toFixed(2)}ms`);
        console.log(`Resources loaded: ${metrics.resourcesLoaded}/${metrics.totalResources}`);
      }
      
      // Report metrics for performance analysis
      incidentAnalysisService.recordPerformanceMetric({
        metric: 'time_to_interactive',
        value: timeToInteractive,
        user_id: user?.id
      }).catch(err => console.warn('Error recording metrics:', err));
    }
  }, [metrics.criticalResourcesLoaded, user]);
  
  // Load critical resources first
  useEffect(() => {
    if (!user) return;
    
    const userId = user.id;
    
    // Mark the start time for performance measurement
    const startTime = performance.now();
    setMetrics(prev => ({ ...prev, startTime }));
    
      // Load critical data first
    prefetchData([
      // User profile (critical)
      {
        tableName: 'profiles',
        columns: ['id', 'name', 'avatar_url', 'impact_points', 'skills'],
        filters: { id: userId },
        cacheKey: `profile:${userId}`,
        ttlSeconds: 600 // 10 minutes
      },
      
      // Active learning progress (critical)
      {
        tableName: 'lesson_progress',
        columns: ['id', 'lesson_id', 'status', 'progress_percentage', 'last_accessed'],
        filters: { 
          user_id: userId,
          status: 'in_progress'
        },
        cacheKey: `user:${userId}:in_progress_lessons`,
        ttlSeconds: 300 // 5 minutes
      }
      
      // Temporarily removing these tables that don't exist yet
      // which are causing 404 errors
      /*
      // User permissions (critical)
      {
        tableName: 'user_roles',
        columns: ['role'],
        filters: { user_id: userId },
        cacheKey: `user:${userId}:roles`,
        ttlSeconds: 1800 // 30 minutes
      }
      */
    ]);    // Mark critical resources as loaded
    setMetrics(prev => ({ 
      ...prev, 
      resourcesLoaded: CRITICAL_RESOURCES.length,
      criticalResourcesLoaded: true
    }));
    
  }, [user]);
  
  // Load non-critical resources after app is interactive
  useEffect(() => {
    if (!user || !metrics.criticalResourcesLoaded) return;
    
    const userId = user.id;
    
    // Use requestIdleCallback or setTimeout to defer non-critical loading
    const loadNonCriticalResources = () => {
      // Prefetch non-critical data
      prefetchData([
        // Subject list (non-critical)
        {
          tableName: 'subjects',
          columns: ['id', 'name', 'color', 'icon'],
          cacheKey: 'subjects:minimal',
          ttlSeconds: 1800 // 30 minutes
        }
        
        // Temporarily removing these tables that don't exist yet
        // which are causing 404/400 errors
        /*
        // Recent community posts (non-critical)
        {
          tableName: 'posts',
          columns: ['id', 'title', 'post_type', 'created_at', 'user_id', 'upvotes'],
          cacheKey: 'recent_posts',
          ttlSeconds: 300 // 5 minutes
        },
        
        // Notifications (non-critical)
        {
          tableName: 'notifications',
          columns: ['id', 'message', 'created_at', 'read'],
          filters: { 
            user_id: userId,
            read: false
          },
          cacheKey: `user:${userId}:unread_notifications`,
          ttlSeconds: 120 // 2 minutes
        }
        */
      ]);
      
      // Update the metrics
      setMetrics(prev => ({ 
        ...prev, 
        resourcesLoaded: metrics.totalResources 
      }));
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadNonCriticalResources);
    } else {
      setTimeout(loadNonCriticalResources, 1000);
    }
  }, [user, metrics.criticalResourcesLoaded]);
  
  // This component doesn't render anything
  return null;
};

export default AppOptimizer;
