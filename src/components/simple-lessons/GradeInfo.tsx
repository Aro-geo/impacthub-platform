import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, BookOpen } from 'lucide-react';

const GradeInfo = () => {
  const { user, userProfile } = useAuth();
  const [gradeStats, setGradeStats] = useState({
    totalLessons: 0,
    gradeSpecificLessons: 0
  });

  useEffect(() => {
    if (user && userProfile?.grade) {
      fetchGradeStats();
    }
  }, [user, userProfile]);

  const fetchGradeStats = async () => {
    if (!user || !userProfile?.grade) return;

    try {
      // Get total lessons
      const { count: totalLessons } = await supabase
        .from('simple_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Get grade-specific lessons (user's grade ± 1)
      const { count: gradeSpecificLessons } = await supabase
        .from('simple_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .or(`grade.is.null,grade.eq.${userProfile.grade},grade.eq.${userProfile.grade - 1},grade.eq.${userProfile.grade + 1}`);

      setGradeStats({
        totalLessons: totalLessons || 0,
        gradeSpecificLessons: gradeSpecificLessons || 0
      });
    } catch (error) {
      console.error('Error fetching grade stats:', error);
    }
  };

  if (!userProfile?.grade) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Grade {userProfile.grade} Learning</h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              {gradeStats.gradeSpecificLessons} lessons available for your grade level
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {gradeStats.gradeSpecificLessons}/{gradeStats.totalLessons}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeInfo;