import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToService?: boolean;
  component?: string;
  retryable?: boolean;
  onError?: (error: Error) => void;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logToService = true,
    component = 'unknown',
    retryable = false,
    onError
  } = options;

  const handleError = useCallback((error: Error | any, context?: string) => {
    console.error(`Error in ${component}${context ? ` (${context})` : ''}:`, error);

    // Log to incident analysis service
    if (logToService) {
      incidentAnalysisService.logError({
        message: error.message || 'Unknown error',
        stack: error.stack,
        component,
        metadata: {
          context,
          retryable,
          error_type: error.name || 'Error',
          user_agent: navigator.userAgent
        }
      });
    }

    // Show user-friendly toast notification
    if (showToast) {
      const userMessage = getUserFriendlyMessage(error);
      toast({
        title: "Something went wrong",
        description: userMessage,
        variant: "destructive",
      });
    }

    // Call custom error handler
    if (onError) {
      onError(error);
    }
  }, [component, showToast, logToService, retryable, onError]);

  const handleApiError = useCallback(async (
    error: any, 
    endpoint: string, 
    responseTime?: number
  ) => {
    const errorMessage = error.message || 'API request failed';
    const statusCode = error.status || error.code || 'unknown';
    
    console.error(`API Error [${endpoint}]:`, error);

    if (logToService) {
      await incidentAnalysisService.logApiError(endpoint, error, responseTime);
    }

    if (showToast) {
      const userMessage = getApiErrorMessage(error, endpoint);
      toast({
        title: "Request Failed",
        description: userMessage,
        variant: "destructive",
      });
    }

    if (onError) {
      onError(error);
    }

    return {
      error: errorMessage,
      statusCode,
      endpoint,
      timestamp: new Date().toISOString()
    };
  }, [showToast, logToService, onError]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw so caller can handle if needed
    }
  }, [handleError]);

  const createErrorHandler = useCallback((context: string) => {
    return (error: Error | any) => handleError(error, context);
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleAsyncError,
    createErrorHandler
  };
};

// Helper functions for user-friendly error messages
function getUserFriendlyMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';

  const message = error.message || error.toString();

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('NetworkError')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  // Authentication errors
  if (message.includes('auth') || message.includes('unauthorized') || error.status === 401) {
    return 'Authentication required. Please sign in and try again.';
  }

  // Permission errors
  if (message.includes('permission') || message.includes('forbidden') || error.status === 403) {
    return 'You don\'t have permission to perform this action.';
  }

  // Not found errors
  if (message.includes('not found') || error.status === 404) {
    return 'The requested resource was not found.';
  }

  // Server errors
  if (error.status >= 500) {
    return 'Server error. Our team has been notified and is working on a fix.';
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return 'Please check your input and try again.';
  }

  // Chunk loading errors (common in SPAs)
  if (message.includes('Loading chunk') || message.includes('ChunkLoadError')) {
    return 'Failed to load application resources. Please refresh the page.';
  }

  // Generic fallback
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}

function getApiErrorMessage(error: any, endpoint: string): string {
  const baseMessage = getUserFriendlyMessage(error);
  
  // Add context based on endpoint
  if (endpoint.includes('/auth/')) {
    return 'Authentication failed. Please check your credentials and try again.';
  }
  
  if (endpoint.includes('/user/') || endpoint.includes('/profile/')) {
    return 'Failed to update your profile. Please try again.';
  }
  
  if (endpoint.includes('/learning/') || endpoint.includes('/modules/')) {
    return 'Failed to load learning content. Please check your connection and try again.';
  }
  
  return baseMessage;
}

// Hook for handling specific error types
export const useNetworkErrorHandler = () => {
  return useErrorHandler({
    component: 'network',
    showToast: true,
    logToService: true,
    retryable: true
  });
};

export const useApiErrorHandler = (endpoint?: string) => {
  return useErrorHandler({
    component: endpoint || 'api',
    showToast: true,
    logToService: true,
    retryable: false
  });
};

export const useComponentErrorHandler = (componentName: string) => {
  return useErrorHandler({
    component: componentName,
    showToast: false, // Component errors usually don't need toast
    logToService: true,
    retryable: false
  });
};