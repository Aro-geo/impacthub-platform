import { useEffect } from 'react';

interface PerformanceMonitorProps {
  componentName: string;
}

const PerformanceMonitor = ({ componentName }: PerformanceMonitorProps) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  return null;
};

export default PerformanceMonitor;