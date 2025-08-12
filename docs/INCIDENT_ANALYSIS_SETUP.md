# Incident Analysis System - Setup Guide

## Quick Start

The incident analysis system is now fully integrated into your ImpactHub platform. Here's how to get started:

### 1. Database Setup

**IMPORTANT**: You need to create the database tables first before the incident analysis system will work.

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/setup_incident_tracking.sql`
4. Click **Run** to execute the script

#### Option B: Using Supabase CLI
```bash
supabase db push
```

#### Option C: Manual Migration
Apply the migration file: `supabase/migrations/20241208_incident_tracking.sql`

#### Verify Setup
Run this in your browser console to check if tables are created:
```javascript
checkDatabaseSetup();
```

### 2. Access the Dashboard

1. **Admin Access Required**: Only users with admin privileges can access the incident analysis dashboard
2. **Navigate to**: `/incident-analysis` 
3. **View**: Real-time system health, error patterns, and performance metrics

### 3. Automatic Monitoring

The system automatically monitors:
- ✅ JavaScript errors and exceptions
- ✅ API response times and failures  
- ✅ Component render performance
- ✅ Memory usage patterns
- ✅ Network connectivity issues
- ✅ Service worker errors

### 4. Testing the System

Open browser console and run:
```javascript
// Test the incident analysis system
testIncidentAnalysis();
```

This will generate test logs to verify everything is working.

## Key Features Available Now

### 🔍 **Error Tracking**
- Automatic capture of all JavaScript errors
- Component-level error boundaries with retry mechanisms
- API failure tracking with response times
- User-friendly error messages with technical details in dev mode

### 📊 **Performance Monitoring** 
- Page load time analysis
- API response time tracking
- Memory usage monitoring
- Component render time measurement
- Core Web Vitals tracking

### 🎯 **Pattern Analysis**
- Error frequency and trends
- Browser-specific issue identification
- URL-based error distribution
- Component failure patterns
- Performance bottleneck detection

### 🚨 **Real-time Alerts**
- High error rate notifications
- Performance degradation alerts
- Memory usage warnings
- Network connectivity issues
- Critical component failures

### 📈 **Admin Dashboard**
- Interactive charts and graphs
- Configurable time ranges (1h, 24h, 7d, 30d)
- Drill-down capabilities
- Export functionality
- Threshold configuration

## Configuration Options

### Performance Thresholds
- Page Load Warning: 2000ms (default)
- API Response Warning: 1000ms (default)  
- Memory Usage Warning: 80% (default)
- Error Rate Alert: 5% (default)

### Data Retention
- Error Logs: 30 days (configurable)
- Performance Metrics: 7 days (configurable)
- System Health: 30 days (configurable)

## Usage Examples

### Custom Error Handling
```typescript
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

### Performance Monitoring
```typescript
import PerformanceMonitor from '@/components/shared/PerformanceMonitor';

const MyComponent = () => {
  return (
    <>
      <PerformanceMonitor 
        componentName="MyComponent" 
        threshold={150}
        trackMemory={true}
      />
      {/* Your component content */}
    </>
  );
};
```

### System Health Monitoring
```typescript
import SystemHealthMonitor from '@/components/shared/SystemHealthMonitor';

// Compact version for header/status bar
<SystemHealthMonitor compact={true} />

// Full version for dashboard
<SystemHealthMonitor />
```

## Security & Privacy

- ✅ Row Level Security (RLS) enabled
- ✅ Admin-only access to sensitive data
- ✅ User data anonymization
- ✅ Secure error message sanitization
- ✅ GDPR-compliant data handling

## Troubleshooting

### Common Issues

1. **Dashboard shows "Access Restricted"**
   - Ensure user has admin privileges
   - Check user profile email contains 'admin' or role is 'admin'

2. **No error logs appearing**
   - Check browser console for service worker errors
   - Verify database tables were created correctly
   - Test with `testIncidentAnalysis()` function

3. **Performance data missing**
   - Verify Performance API support in browser
   - Check if PerformanceMonitor components are included

4. **High memory usage alerts**
   - Check for memory leaks in components
   - Review component lifecycle management
   - Monitor for excessive re-renders

### Debug Mode

Enable detailed logging in development:
```typescript
// Shows technical error details in development
<ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
  <App />
</ErrorBoundary>
```

## Next Steps

1. **Deploy the database migration**
2. **Set up admin user access**
3. **Test the system with the test utility**
4. **Configure monitoring thresholds**
5. **Set up alerting preferences**
6. **Train team on dashboard usage**

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the incident analysis dashboard
3. Use the test utility to verify functionality
4. Check database table permissions and data

The system is designed to be low-impact and highly reliable, automatically capturing and analyzing production incidents to help maintain system health and user experience.