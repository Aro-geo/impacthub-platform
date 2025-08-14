import React, { Suspense } from 'react';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface AdminComponentWrapperProps {
  children: React.ReactNode;
  componentName: string;
}

const AdminComponentWrapper: React.FC<AdminComponentWrapperProps> = ({ 
  children, 
  componentName 
}) => {
  const fallbackUI = (
    <Card>
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {componentName} Temporarily Unavailable
        </h3>
        <p className="text-muted-foreground">
          This admin feature is currently experiencing issues. Please try refreshing the page or contact support if the problem persists.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary fallback={fallbackUI}>
      <Suspense fallback={<LoadingSpinner text={`Loading ${componentName}...`} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default AdminComponentWrapper;