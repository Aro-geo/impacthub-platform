import { Card, CardContent } from '@/components/ui/card';
import { Info, GraduationCap } from 'lucide-react';

interface GradeExplanationProps {
  userGrade?: number;
}

const GradeExplanation = ({ userGrade }: GradeExplanationProps) => {
  if (!userGrade) return null;

  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
              Your current grade: Grade {userGrade}
            </h4>
            <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-3 w-3 mr-1" />
              <span>Your current grade: Grade {userGrade}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeExplanation;