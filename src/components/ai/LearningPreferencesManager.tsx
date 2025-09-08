import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { personalizedLearningService, type UserLearningPreferences } from '@/services/personalizedLearningService';
import { Settings, Brain, Target } from 'lucide-react';

interface LearningPreferencesManagerProps {
  onPreferencesUpdate?: (preferences: UserLearningPreferences) => void;
}

const LearningPreferencesManager: React.FC<LearningPreferencesManagerProps> = ({
  onPreferencesUpdate
}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserLearningPreferences | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [interests, setInterests] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [learningStyle, setLearningStyle] = useState<string>('');

  const interestOptions = [
    'Sports', 'Technology', 'Music', 'Art', 'Science', 'Mathematics',
    'History', 'Literature', 'Gaming', 'Photography', 'Cooking', 'Travel',
    'Environment', 'Social Issues', 'Business', 'Health & Fitness'
  ];

  const careerOptions = [
    'Engineering', 'Medicine', 'Teaching', 'Business', 'Law', 'Architecture',
    'Computer Science', 'Research', 'Arts & Design', 'Media & Communications',
    'Environmental Science', 'Psychology', 'Finance', 'Social Work'
  ];

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userPreferences = await personalizedLearningService.getUserLearningPreferences(user.id);
      
      if (userPreferences) {
        setPreferences(userPreferences);
        setInterests(userPreferences.interests);
        setCareerGoals(userPreferences.careerGoals);
        setGradeLevel(userPreferences.gradeLevel);
        setLearningStyle(userPreferences.preferredLearningStyle);
      } else {
        // No preferences found, start editing
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      const updatedPreferences: UserLearningPreferences = {
        userId: user.id,
        interests,
        careerGoals,
        gradeLevel: gradeLevel as any,
        preferredLearningStyle: learningStyle as any
      };

      // Save to localStorage
      localStorage.setItem(`learning-preferences-${user.id}`, JSON.stringify(updatedPreferences));

      setPreferences(updatedPreferences);
      setIsEditing(false);

      if (onPreferencesUpdate) {
        onPreferencesUpdate(updatedPreferences);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleCareerGoal = (career: string) => {
    setCareerGoals(prev => 
      prev.includes(career) 
        ? prev.filter(c => c !== career)
        : [...prev, career]
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Learning Preferences
        </CardTitle>
        <CardDescription>
          Customize your AI tutor experience by setting your interests and learning preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isEditing && preferences ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Grade Level</Label>
                <Badge variant="outline" className="ml-2">
                  {preferences.gradeLevel}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Learning Style</Label>
                <Badge variant="outline" className="ml-2">
                  {preferences.preferredLearningStyle}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Interests</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.interests.length > 0 ? (
                  preferences.interests.map(interest => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No interests selected</span>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Career Goals</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.careerGoals.length > 0 ? (
                  preferences.careerGoals.map(career => (
                    <Badge key={career} variant="secondary">
                      {career}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No career goals selected</span>
                )}
              </div>
            </div>

            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Preferences
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">Elementary (K-5)</SelectItem>
                    <SelectItem value="middle">Middle School (6-8)</SelectItem>
                    <SelectItem value="high">High School (9-12)</SelectItem>
                    <SelectItem value="college">College/University</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="learningStyle">Preferred Learning Style</Label>
                <Select value={learningStyle} onValueChange={setLearningStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual (pictures, diagrams)</SelectItem>
                    <SelectItem value="auditory">Auditory (listening, discussion)</SelectItem>
                    <SelectItem value="kinesthetic">Kinesthetic (hands-on, movement)</SelectItem>
                    <SelectItem value="reading">Reading/Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Interests (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {interestOptions.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={interests.includes(interest)}
                      onCheckedChange={() => toggleInterest(interest)}
                    />
                    <Label htmlFor={interest} className="text-sm">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Career Goals (select your interests)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {careerOptions.map(career => (
                  <div key={career} className="flex items-center space-x-2">
                    <Checkbox
                      id={career}
                      checked={careerGoals.includes(career)}
                      onCheckedChange={() => toggleCareerGoal(career)}
                    />
                    <Label htmlFor={career} className="text-sm">
                      {career}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={savePreferences}>
                Save Preferences
              </Button>
              {preferences && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningPreferencesManager;
