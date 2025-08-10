import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { seedSampleData, seedCommunityPosts } from '@/lib/seedData';
import { Database, Loader2 } from 'lucide-react';

const SeedDataButton = () => {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    if (!user) return;
    
    setIsSeeding(true);
    try {
      await seedSampleData();
      await seedCommunityPosts(user.id);
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Error seeding data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      onClick={handleSeedData}
      disabled={isSeeding}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      {isSeeding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      <span>{isSeeding ? 'Seeding...' : 'Load Sample Data'}</span>
    </Button>
  );
};

export default SeedDataButton;