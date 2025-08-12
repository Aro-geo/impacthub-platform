import { useEffect, useRef } from 'react';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

interface PerformanceMonitorProps {
  componentName: string;
  threshold?: number;
  trackMemory?: boolean;
}

const PerformanceMonitor = ({ 
  componentName, 
  threshold = 100,
  trackMemory = false 
}: PerformanceMonitorProps) => {
  const startTimeRef = useRef<number>(performance.now());
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      // Log performance metrics
      incidentAnalysisService.logPerformance({
        metric: 'render_time',
        value: renderTime,
        component: componentName,
        metadata: {
          threshold,
          exceeded_threshold: renderTime > threshold,
          mount_time: mountTimeRef.current
        }
      });
      
      // Log slow renders as warnings
      if (renderTime > threshold) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        
        incidentAnalysisService.logWarning({
          message: `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`,
          component: componentName,
          metadata: {
            render_time: renderTime,
            threshold,
            type: 'performance_warning'
          }
        });
      }

      // Track memory usage if enabled
      if (trackMemory && 'memory' in performance) {
        const memory = (performance as any).memory;
        incidentAnalysisService.logPerformance({
          metric: 'memory_usage',
          value: memory.usedJSHeapSize,
          component: componentName,
          metadata: {
            total_heap: memory.totalJSHeapSize,
            heap_limit: memory.jsHeapSizeLimit,
            component_lifecycle: 'unmount'
          }
        });
      }
    };
  }, [componentName, threshold, trackMemory]);

  // Track component mount time
  useEffect(() => {
    const mountTime = performance.now() - startTimeRef.current;
    
    incidentAnalysisService.logPerformance({
      metric: 'render_time',
      value: mountTime,
      component: componentName,
      metadata: {
        lifecycle: 'mount',
        timestamp: mountTimeRef.current
      }
    });
  }, [componentName]);

  return null;
};

export default PerformanceMonitor;