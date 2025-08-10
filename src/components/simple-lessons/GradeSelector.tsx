import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { GraduationCap, Settings } from 'lucide-react';

const GradeSelector = () => {
  const { user, userProfile, updateUserGrade } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<string>(userProfile?.grade?.toString() || '');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateGrade = async () => {
    if (!user || !selectedGrade) return;

    setLoading(true);
    try {
      const { error } = await updateUserGrade(parseInt(selectedGrade));

      if (error) throw error;

      toast({
        title: "Grade Updated",
        description: `Your grade has been updated to Grade ${selectedGrade}. Lessons will be filtered accordingly.`,
      });

      setIsOpen(false);
      // Refresh the page to show updated content
      window.location.reload();
    } catch (error) {
      console.error('Error updating grade:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Update Grade</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Update Your Grade</span>
          </DialogTitle>
          <DialogDescription>
            Change your grade level to see lessons appropriate for your current level.
            This will filter lessons to show content suitable for your grade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Current Grade: {userProfile?.grade ? `Grade ${userProfile.grade}` : 'Not set'}
            </label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select your current grade" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((gradeNum) => (
                  <SelectItem key={gradeNum} value={gradeNum.toString()}>
                    Grade {gradeNum}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changing your grade will show lessons for your selected grade level, 
              plus one grade above and below for flexibility.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateGrade} 
            disabled={loading || !selectedGrade || selectedGrade === userProfile?.grade?.toString()}
          >
            {loading ? 'Updating...' : 'Update Grade'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeSelector;