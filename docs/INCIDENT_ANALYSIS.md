# Production Incident Analysis System

This document describes the comprehensive incident analysis and monitoring system implemented for the ImpactHub platform.

## Overview

The incident analysis system provides real-time monitoring, error tracking, and performance analysis to help identify patterns and potential causes of outages or performance degradation in production.

## Components

### 1. Incident Analysis Service (`src/services/incidentAnalysisService.ts`)

The core service that handles:
- **Error Logging**: Captures JavaScript errors, unhandled promise rejections, and service worker errors
- **Performance Monitoring**: Tracks page load times, API response times, memory usage, and render performance
- **Automatic Buffering**: Batches logs and metrics for efficient database storage
- **Pattern Analysis**: Analyzes error patterns and performance trends

#### Key Features:
- Global error handlers for comprehensive error capture
- Performance metrics collection using the Performance API
- Automatic retry mechanisms for failed data submissions
- Fallback to localStorage when database is unavailable

### 2. Error Boundary (`src/components/shared/ErrorBoundary.tsx`)

React error boundary that:
- Catches component-level errors
- Provides user-friendly error messages
- Implements retry mechanisms for recoverable errors
- Logs errors to the incident analysis service
- Shows technical details in development mode

### 3. Incident Dashboard (`src/components/admin/IncidentDashboard.tsx`)

Admin interface for:
- **Error Analysis**: Timeline views, component failure distribution, critical error alerts
- **Performance Monitoring**: Load time analysis, memory usage trends, slowest pages
- **Pattern Recognition**: Browser-specific errors, URL error distribution, common error messages

### 4. System Health Monitor (`src/components/shared/SystemHealthMonitor.tsx`)

Real-time system health monitoring:
- Network connectivity status
- Memory usage tracking
- Storage quota monitoring
- Performance score calculation
- Automated alerts for threshold breaches

### 5. Error Handler Hooks (`src/hooks/useErrorHandler.ts`)

React hooks for consistent error handling:
- `useErrorHandler`: General error handling with customizable options
- `useApiErrorHandler`: Specialized for API errors
- `useComponentErrorHandler`: Component-specific error handling
- `useNetworkErrorHandler`: Network-related error handling

## Database Schema

### Tables

#### `incident_logs`
Stores error and warning logs with metadata:
```sql
- id: Unique identifier
- timestamp: When the incident occurred
- level: error | warn | info
- message: Error message
- stack: Stack trace
- user_agent: Browser information
- url: Page where error occurred
- user_id: Associated user (if authenticated)
- session_id: Session identifier
- component: Component where error occurred
- metadata: Additional context (JSON)
```

#### `performance_metrics`
Stores performance measurements:
```sql
- id: Unique identifier
- timestamp: When metric was recorded
- metric: page_load | api_response | render_time | memory_usage | bundle_size
- value: Numeric measurement
- url: Associated URL
- component: Associated component
- metadata: Additional context (JSON)
```

#### `system_health`
Stores overall system health snapshots:
```sql
- timestamp: When snapshot was taken
- cpu_usage: CPU utilization percentage
- memory_usage: Memory utilization percentage
- active_users: Number of active users
- error_rate: Error rate percentage
- avg_response_time: Average API response time
- cache_hit_rate: Cache hit rate percentage
```

### Views

#### `error_patterns`
Aggregated view of error patterns for analysis:
- Groups errors by component and message
- Shows occurrence counts and affected users
- Provides time range analysis

#### `performance_insights`
Aggregated performance metrics:
- Statistical analysis (avg, median, p95)
- Grouped by metric type and component
- Identifies performance bottlenecks

## Usage

### For Developers

1. **Automatic Error Tracking**: Errors are automatically captured and logged
2. **Performance Monitoring**: Add `<PerformanceMonitor componentName="YourComponent" />` to track component performance
3. **Custom Error Handling**: Use error handler hooks for consistent error management

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, handleApiError } = useErrorHandler({
    component: 'MyComponent',
    showToast: true
  });

  const fetchData = async () => {
    try {
      const response = await api.getData();
      return response;
    } catch (error) {
      await handleApiError(error, '/api/data');
      throw error;
    }
  };
};
```

### For Administrators

1. **Access the Dashboard**: Navigate to `/incident-analysis` (admin access required)
2. **Monitor System Health**: View real-time system metrics and alerts
3. **Analyze Patterns**: Use the dashboard to identify recurring issues
4. **Set Thresholds**: Configure monitoring thresholds and alert preferences

## Monitoring Capabilities

### Error Tracking
- JavaScript errors and exceptions
- Unhandled promise rejections
- Service worker errors
- API failures and timeouts
- Component lifecycle errors

### Performance Monitoring
- Page load times (including Core Web Vitals)
- API response times
- Component render times
- Memory usage patterns
- Bundle size analysis

### System Health
- Network connectivity
- Browser compatibility issues
- Storage usage
- Cache performance
- User session patterns

## Alerting and Notifications

### Automatic Alerts
- High error rates (>5% by default)
- Slow page loads (>2s by default)
- High memory usage (>80% by default)
- Network connectivity issues
- Critical component failures

### Alert Channels
- In-app notifications
- Browser notifications (PWA)
- Console warnings for developers
- Dashboard alerts for administrators

## Data Retention

- **Error Logs**: 30 days (configurable)
- **Performance Metrics**: 7 days (configurable)
- **System Health**: 30 days (configurable)

Automatic cleanup runs daily to maintain database performance.

## Security and Privacy

- Row Level Security (RLS) enabled on all tables
- Admin-only access to sensitive incident data
- User data anonymization options
- Secure error message sanitization
- GDPR-compliant data handling

## Performance Considerations

- Batched logging to minimize database load
- Efficient indexing for fast queries
- Automatic data cleanup to prevent storage bloat
- Fallback mechanisms for high-availability
- Minimal performance impact on user experience

## Troubleshooting

### Common Issues

1. **Missing Error Logs**: Check browser console for service worker errors
2. **Performance Data Not Showing**: Verify Performance API support
3. **Dashboard Access Denied**: Ensure user has admin privileges
4. **High Memory Usage Alerts**: Check for memory leaks in components

### Debug Mode

Enable detailed logging in development:
```typescript
// In development, show technical error details
<ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
  <App />
</ErrorBoundary>
```

## Future Enhancements

- Real-time alerting via webhooks
- Integration with external monitoring services
- Machine learning for anomaly detection
- Automated incident response workflows
- Advanced performance profiling
- Custom dashboard widgets
- Export capabilities for incident reports

## Contributing

When adding new components or services:
1. Include appropriate error boundaries
2. Add performance monitoring where relevant
3. Use error handler hooks for consistent error management
4. Update incident analysis patterns as needed
5. Document any new monitoring capabilities