import { Card, CardContent } from '@/components/ui/card';
import { Info, GraduationCap } from 'lucide-react';

interface GradeExplanationProps {
  userGrade?: number;
}

const GradeExplanation = ({ userGrade }: GradeExplanationProps) => {
  if (!userGrade) return null;

  const getGradeRange = (grade: number) => {
    const minGrade = Math.max(1, grade - 1);
    const maxGrade = Math.min(12, grade + 1);
    
    if (minGrade === maxGrade) {
      return `Grade ${grade}`;
    } else if (minGrade === grade) {
      return `Grades ${grade}-${maxGrade}`;
    } else if (maxGrade === grade) {
      return `Grades ${minGrade}-${grade}`;
    } else {
      return `Grades ${minGrade}-${maxGrade}`;
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">
              Personalized Content for You
            </h4>
            <p className="text-sm text-blue-700">
              We're showing lessons for <strong>{getGradeRange(userGrade)}</strong> to match your learning level. 
              This includes content for your grade plus one level above and below for flexibility.
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600">
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