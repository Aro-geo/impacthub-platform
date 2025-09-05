# Performance Metrics Integration Fix

## Issue

The application was generating a runtime error:

```
Uncaught TypeError: incidentAnalysisService.recordPerformanceMetric is not a function
```

This error occurred in the `AppOptimizer` component which attempted to use a method (`recordPerformanceMetric`) that was not implemented in the `incidentAnalysisService`. 

## Fix Applied

1. **Added the missing method to IncidentAnalysisService**:
   - Created a proper `recordPerformanceMetric` method in the `incidentAnalysisService` class
   - Extended the `PerformanceMetric` interface to include the new `time_to_interactive` metric

2. **Method Implementation**:
   ```typescript
   public recordPerformanceMetric(data: { 
     metric: string; 
     value: number; 
     user_id?: string;
     component?: string;
     metadata?: Record<string, any>;
   }): Promise<void> {
     return new Promise((resolve) => {
       this.logPerformance({
         metric: data.metric as any,
         value: data.value,
         component: data.component,
         metadata: {
           ...(data.metadata || {}),
           user_id: data.user_id
         }
       });
       resolve();
     });
   }
   ```

3. **Added Error Handling**:
   - Improved error handling in the AppOptimizer component with a more descriptive message

## Benefits

1. The application no longer crashes on startup
2. Performance metrics are now properly recorded
3. The implementation follows the same pattern as other service methods
4. Future expansion of performance metrics is now easier with the established pattern

## Verification

This fix addresses the error shown in the browser console:
```
Uncaught TypeError: incidentAnalysisService.recordPerformanceMetric is not a function
    at AppOptimizer.tsx:70:31
```

The fix properly integrates the AppOptimizer component with the existing incident analysis system.
