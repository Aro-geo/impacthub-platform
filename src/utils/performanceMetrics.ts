import { incidentAnalysisService } from '@/services/incidentAnalysisService';

/**
 * This file provides a temporary fix for the AppOptimizer component
 * until the recordPerformanceMetric function is properly implemented in incidentAnalysisService.
 */

/**
 * Extension to the incidentAnalysisService that adds the missing recordPerformanceMetric function.
 * This uses the existing logPerformance method under the hood.
 */
if (!('recordPerformanceMetric' in incidentAnalysisService)) {
  // Add the missing method to avoid runtime errors
  (incidentAnalysisService as any).recordPerformanceMetric = function(metricData: {
    metric: string;
    value: number;
    user_id?: string;
  }) {
    // Map the parameters to what logPerformance expects
    return Promise.resolve(this.logPerformance({
      metric: metricData.metric as any, 
      value: metricData.value,
      metadata: {
        user_id: metricData.user_id
      }
    }));
  };
}

export default incidentAnalysisService;
