import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { clearAppCache } from '@/utils/cacheUtils';

const EmergencyCacheClear: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAppCache();
    } catch (error) {
      console.error('Cache clear failed:', error);
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleClearCache}
        disabled={isClearing}
        variant="destructive"
        size="sm"
        className="shadow-lg"
      >
        {isClearing ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <AlertTriangle className="h-4 w-4 mr-2" />
        )}
        {isClearing ? 'Clearing...' : 'Clear Cache'}
      </Button>
    </div>
  );
};

export default EmergencyCacheClear;