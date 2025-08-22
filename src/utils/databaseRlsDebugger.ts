import { supabase } from '@/integrations/supabase/client';

// This function returns the current authentication status
// and can be used to detect if auth tokens are correctly set
export async function checkAuthStatus() {
  try {
    const { data: user, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth status check failed:', error);
      return {
        authenticated: false,
        error: error.message,
        user: null
      };
    }
    
    return {
      authenticated: !!user?.user,
      user: user?.user,
      error: null
    };
  } catch (err) {
    console.error('Error checking auth status:', err);
    return {
      authenticated: false,
      error: err.message,
      user: null
    };
  }
}

// This function checks if an RLS policy exists for a specific table
export async function checkRlsPolicy(tableName: string) {
  try {
    const { data, error } = await supabase
      .rpc('check_rls_policies', { table_name: tableName });
    
    if (error) {
      console.error('Error checking RLS policies:', error);
      return {
        hasPolicies: false,
        error: error.message,
        policies: []
      };
    }
    
    return {
      hasPolicies: data && data.length > 0,
      policies: data || [],
      error: null
    };
  } catch (err) {
    console.error('Error checking RLS policies:', err);
    return {
      hasPolicies: false,
      error: err.message,
      policies: []
    };
  }
}

// This function logs RLS related errors to help diagnose problems
export async function logRlsError(tableName: string, operation: string, error: any) {
  try {
    // First check auth status
    const authStatus = await checkAuthStatus();
    
    // Then log the diagnostic info
    await supabase.from('incident_logs').insert({
      level: 'error',
      message: `RLS Error: ${operation} on ${tableName}`,
      component: 'database',
      user_id: authStatus.user?.id || null,
      metadata: {
        tableName,
        operation,
        errorMessage: error.message,
        errorCode: error.code,
        authStatus: authStatus.authenticated ? 'authenticated' : 'unauthenticated',
        timestamp: new Date().toISOString()
      }
    });
    
    console.error(`RLS Error: ${operation} on ${tableName}`, {
      error,
      authStatus
    });
  } catch (err) {
    // If even logging fails, output to console
    console.error('Failed to log RLS error:', err);
  }
}

// This function can be called to create a temporary admin function for fixing RLS issues
// IMPORTANT: This should only be used in development environments
export async function createAdminFunctions() {
  try {
    // Create a stored procedure to check RLS policies
    const { error } = await supabase.rpc('create_admin_functions');
    
    if (error) {
      console.error('Error creating admin functions:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      error: null
    };
  } catch (err) {
    console.error('Error creating admin functions:', err);
    return {
      success: false,
      error: err.message
    };
  }
}
