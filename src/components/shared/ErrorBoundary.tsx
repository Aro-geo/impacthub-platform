import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { incidentAnalysisService } from '@/services/incidentAnalysisService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to incident analysis service
    incidentAnalysisService.logComponentError(
      'ErrorBoundary',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        retryCount: this.state.retryCount
      }
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      // Max retries reached, redirect to home
      window.location.href = '/';
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Auto-retry with exponential backoff for certain errors
    if (this.isRetryableError(this.state.error)) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  isRetryableError = (error: Error | null): boolean => {
    if (!error) return false;
    
    const retryableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk',
      'Network Error',
      'Failed to fetch'
    ];
    
    return retryableErrors.some(pattern => 
      error.message.includes(pattern) || error.name.includes(pattern)
    );
  };

  getErrorSeverity = (error: Error | null): 'low' | 'medium' | 'high' => {
    if (!error) return 'low';
    
    const highSeverityPatterns = [
      'ChunkLoadError',
      'Script error',
      'Network Error',
      'TypeError: Cannot read'
    ];
    
    const mediumSeverityPatterns = [
      'ReferenceError',
      'SyntaxError',
      'RangeError'
    ];
    
    if (highSeverityPatterns.some(pattern => error.message.includes(pattern))) {
      return 'high';
    }
    
    if (mediumSeverityPatterns.some(pattern => error.message.includes(pattern))) {
      return 'medium';
    }
    
    return 'low';
  };

  getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unexpected error occurred';
    
    // User-friendly error messages
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'Failed to load application resources. This might be due to a network issue or an app update.';
    }
    
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('Script error')) {
      return 'A script loading error occurred. This might be due to browser extensions or network issues.';
    }
    
    return 'Something went wrong. Our team has been notified and is working on a fix.';
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.getErrorSeverity(this.state.error);
      const userMessage = this.getErrorMessage(this.state.error);
      const canRetry = this.state.retryCount < 3 && this.isRetryableError(this.state.error);

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className={`w-6 h-6 ${
                  severity === 'high' ? 'text-destructive' : 
                  severity === 'medium' ? 'text-yellow-500' : 'text-orange-500'
                }`} />
              </div>
              <CardTitle className="text-xl">Oops! Something went wrong</CardTitle>
              <CardDescription className="text-center">
                {userMessage}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again {this.state.retryCount > 0 && `(${this.state.retryCount}/3)`}
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </div>

              {this.props.showDetails && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.name}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="text-xs text-muted-foreground text-center">
                Error ID: {Date.now().toString(36)}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;