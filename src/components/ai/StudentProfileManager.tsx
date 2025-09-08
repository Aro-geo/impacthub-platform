import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Brain, Target, BookOpen, TrendingUp } from 'lucide-react';
import type { StudentProfile, ConceptHistory } from '@/services/adaptiveLearningService';

interface StudentProfileManagerProps {
  onProfileUpdate?: (profile: StudentProfile) => void;
  showAnalytics?: boolean;
}

const StudentProfileManager: React.FC<StudentProfileManagerProps> = ({
  onProfileUpdate,
  showAnalytics = true
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
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
      loadStudentProfile();
    }
  }, [user]);

  const loadStudentProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For now, use localStorage as a temporary storage
      // This would be replaced with proper Supabase integration after migration
      const storedProfile = localStorage.getItem(`student-profile-${user.id}`);
      
      if (storedProfile) {
        const profileData: StudentProfile = JSON.parse(storedProfile);
        setProfile(profileData);
        setInterests(profileData.interests);
        setCareerGoals(profileData.careerGoals);
        setGradeLevel(profileData.gradeLevel);
        setLearningStyle(profileData.preferredLearningStyle);
      } else {
        // Create new profile
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      const updatedProfile: StudentProfile = {
        userId: user.id,
        interests,
        careerGoals,
        gradeLevel: gradeLevel as any,
        preferredLearningStyle: learningStyle as any,
        conceptHistory: profile?.conceptHistory || {},
        responsePatterns: profile?.responsePatterns || {
          averageResponseTime: 0,
          accuracy: 0,
          hintUsageRate: 0,
          preferredDifficultyLevel: 3,
          learningSpeed: 'moderate',
          conceptualStrengths: [],
          conceptualWeaknesses: []
        },
        personalizedExamples: profile?.personalizedExamples || {},
        createdAt: profile?.createdAt || new Date(),
        lastUpdated: new Date()
      };

      // For now, save to localStorage
      // This would be replaced with proper Supabase integration after migration
      localStorage.setItem(`student-profile-${user.id}`, JSON.stringify(updatedProfile));

      setProfile(updatedProfile);
      setIsEditing(false);

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
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

  const getConceptsNeedingReview = (): ConceptHistory[] => {
    if (!profile?.conceptHistory) return [];
    
    return Object.values(profile.conceptHistory)
      .filter(concept => concept.needsReview)
      .sort((a, b) => (a.nextReviewDate || new Date()).getTime() - (b.nextReviewDate || new Date()).getTime());
  };

  const getStrengthsAndWeaknesses = () => {
    if (!profile?.conceptHistory) return { strengths: [], weaknesses: [] };

    const concepts = Object.values(profile.conceptHistory);
    const strengths = concepts
      .filter(c => c.successfulAttempts / c.attempts > 0.8 && c.attempts >= 3)
      .sort((a, b) => (b.successfulAttempts / b.attempts) - (a.successfulAttempts / a.attempts))
      .slice(0, 5);

    const weaknesses = concepts
      .filter(c => c.successfulAttempts / c.attempts < 0.5 && c.attempts >= 2)
      .sort((a, b) => (a.successfulAttempts / a.attempts) - (b.successfulAttempts / b.attempts))
      .slice(0, 5);

    return { strengths, weaknesses };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Learning Profile
          </CardTitle>
          <CardDescription>
            Personalize your learning experience by sharing your interests and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing && profile ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Grade Level</Label>
                  <Badge variant="outline" className="ml-2">
                    {profile.gradeLevel}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Learning Style</Label>
                  <Badge variant="outline" className="ml-2">
                    {profile.preferredLearningStyle}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Interests</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.interests.map(interest => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Career Goals</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.careerGoals.map(career => (
                    <Badge key={career} variant="secondary">
                      {career}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
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
                <Button onClick={saveProfile}>
                  Save Profile
                </Button>
                {profile && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Analytics */}
      {showAnalytics && profile && (
        <>
          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Learning Analytics
              </CardTitle>
              <CardDescription>
                Track your progress and identify areas for improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(profile.responsePatterns.accuracy * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(profile.responsePatterns.averageResponseTime)}s
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {profile.responsePatterns.preferredDifficultyLevel}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Difficulty Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Concepts to Review */}
          {getConceptsNeedingReview().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Concepts to Review
                </CardTitle>
                <CardDescription>
                  Based on spaced repetition, these concepts are due for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getConceptsNeedingReview().slice(0, 5).map(concept => (
                    <div key={concept.conceptId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{concept.conceptName}</div>
                        <div className="text-sm text-muted-foreground">
                          Success Rate: {Math.round((concept.successfulAttempts / concept.attempts) * 100)}%
                        </div>
                      </div>
                      <Badge variant={concept.needsReview ? "destructive" : "secondary"}>
                        {concept.needsReview ? "Review Due" : "On Track"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Target className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getStrengthsAndWeaknesses().strengths.length > 0 ? (
                  <div className="space-y-2">
                    {getStrengthsAndWeaknesses().strengths.map(concept => (
                      <div key={concept.conceptId} className="flex items-center justify-between">
                        <span className="text-sm">{concept.conceptName}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {Math.round((concept.successfulAttempts / concept.attempts) * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Keep practicing to identify your strengths!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <BookOpen className="w-5 h-5" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getStrengthsAndWeaknesses().weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {getStrengthsAndWeaknesses().weaknesses.map(concept => (
                      <div key={concept.conceptId} className="flex items-center justify-between">
                        <span className="text-sm">{concept.conceptName}</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {Math.round((concept.successfulAttempts / concept.attempts) * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Great job! No specific areas need improvement yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentProfileManager;
