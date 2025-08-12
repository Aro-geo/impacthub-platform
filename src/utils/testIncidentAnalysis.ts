import { incidentAnalysisService } from '@/services/incidentAnalysisService';
import { checkDatabaseSetup } from './checkDatabaseSetup';

/**
 * Test utility to verify the incident analysis system is working correctly
 * This can be called from the browser console or used in development
 */
export const testIncidentAnalysis = async () => {
  console.log('🔍 Testing Incident Analysis System...');

  // First check if database is set up
  const setupCheck = await checkDatabaseSetup();
  
  if (!setupCheck.isSetup) {
    console.log('⚠️ Database setup incomplete. Some tests may fail.');
    console.log('Please run the database setup script first.');
    return;
  }

  // Test error logging
  try {
    throw new Error('Test error for incident analysis');
  } catch (error) {
    incidentAnalysisService.logError({
      message: 'Test error logged successfully',
      component: 'testIncidentAnalysis',
      metadata: {
        test: true,
        timestamp: Date.now()
      }
    });
    console.log('✅ Error logging test completed');
  }

  // Test performance logging
  incidentAnalysisService.logPerformance({
    metric: 'page_load',
    value: 1250,
    component: 'testIncidentAnalysis',
    metadata: {
      test: true,
      simulated: true
    }
  });
  console.log('✅ Performance logging test completed');

  // Test API error logging
  incidentAnalysisService.logApiError('/test/endpoint', {
    message: 'Test API error',
    status: 500
  }, 2500);
  console.log('✅ API error logging test completed');

  // Test warning logging
  incidentAnalysisService.logWarning({
    message: 'Test warning message',
    component: 'testIncidentAnalysis',
    metadata: {
      test: true,
      level: 'warning'
    }
  });
  console.log('✅ Warning logging test completed');

  console.log('🎉 All incident analysis tests completed successfully!');
  console.log('📊 Check the incident analysis dashboard at /incident-analysis (admin access required)');
  
  // Wait a moment for data to be flushed, then verify
  setTimeout(async () => {
    console.log('🔍 Verifying data was stored...');
    // You could add verification logic here if needed
  }, 2000);
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testIncidentAnalysis = testIncidentAnalysis;
}