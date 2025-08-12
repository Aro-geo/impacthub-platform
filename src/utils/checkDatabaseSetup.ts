import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the incident analysis database tables are set up correctly
 */
export const checkDatabaseSetup = async () => {
  console.log('🔍 Checking incident analysis database setup...');
  
  const results = {
    incident_logs: false,
    performance_metrics: false,
    system_health: false,
    error_patterns_view: false,
    performance_insights_view: false
  };

  // Check tables
  const tablesToCheck = ['incident_logs', 'performance_metrics', 'system_health'];
  
  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (!error) {
        results[table as keyof typeof results] = true;
        console.log(`✅ Table ${table} exists and is accessible`);
      } else {
        console.log(`❌ Table ${table} error:`, error.message);
      }
    } catch (error) {
      console.log(`❌ Table ${table} check failed:`, error);
    }
  }

  // Check views
  try {
    const { error: errorPatternsError } = await supabase
      .from('error_patterns')
      .select('*')
      .limit(1);
    
    if (!errorPatternsError) {
      results.error_patterns_view = true;
      console.log('✅ View error_patterns exists and is accessible');
    } else {
      console.log('❌ View error_patterns error:', errorPatternsError.message);
    }
  } catch (error) {
    console.log('❌ View error_patterns check failed:', error);
  }

  try {
    const { error: performanceInsightsError } = await supabase
      .from('performance_insights')
      .select('*')
      .limit(1);
    
    if (!performanceInsightsError) {
      results.performance_insights_view = true;
      console.log('✅ View performance_insights exists and is accessible');
    } else {
      console.log('❌ View performance_insights error:', performanceInsightsError.message);
    }
  } catch (error) {
    console.log('❌ View performance_insights check failed:', error);
  }

  // Summary
  const allTablesExist = tablesToCheck.every(table => results[table as keyof typeof results]);
  const allViewsExist = results.error_patterns_view && results.performance_insights_view;

  console.log('\n📊 Database Setup Summary:');
  console.log('Tables:', allTablesExist ? '✅ All tables exist' : '❌ Some tables missing');
  console.log('Views:', allViewsExist ? '✅ All views exist' : '❌ Some views missing');

  if (!allTablesExist || !allViewsExist) {
    console.log('\n🔧 Setup Required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Run the setup script: supabase/setup_incident_tracking.sql');
    console.log('4. Or apply the migration: supabase/migrations/20241208_incident_tracking.sql');
    console.log('\nFor detailed instructions, see: docs/INCIDENT_ANALYSIS_SETUP.md');
  } else {
    console.log('\n🎉 Database setup is complete! Incident analysis system is ready to use.');
  }

  return {
    isSetup: allTablesExist && allViewsExist,
    results,
    summary: {
      tablesExist: allTablesExist,
      viewsExist: allViewsExist,
      missingTables: tablesToCheck.filter(table => !results[table as keyof typeof results]),
      missingViews: [
        ...(results.error_patterns_view ? [] : ['error_patterns']),
        ...(results.performance_insights_view ? [] : ['performance_insights'])
      ]
    }
  };
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).checkDatabaseSetup = checkDatabaseSetup;
}