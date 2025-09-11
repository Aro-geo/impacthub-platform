import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Users, Plus, X, Loader2, Heart } from 'lucide-react';

interface Profile {
  name: string;
  role: 'mentor' | 'mentee';
  skills: string[];
  goals: string;
  experience: string;
  timeZone: string;
  availability: string;
}

const MentorshipMatcher = () => {
  const [mentorProfile, setMentorProfile] = useState<Profile>({
    name: '',
    role: 'mentor',
    skills: [],
    goals: '',
    experience: '',
    timeZone: '',
    availability: ''
  });

  const [menteeProfile, setMenteeProfile] = useState<Profile>({
    name: '',
    role: 'mentee',
    skills: [],
    goals: '',
    experience: '',
    timeZone: '',
    availability: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [activeProfile, setActiveProfile] = useState<'mentor' | 'mentee'>('mentor');
  const [matchResult, setMatchResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [partialResult, setPartialResult] = useState('');
  const isMountedRef = useRef(true);
  const resultRef = useRef<HTMLDivElement>(null);

  const { matchMentorship, loading } = useAI();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Scroll to results when match is available
  useEffect(() => {
    if (matchResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [matchResult]);

  // Update processing stage for visual feedback
  useEffect(() => {
    if (isGenerating) {
      const stages = [
        "Analyzing mentor profile...",
        "Analyzing mentee profile...",
        "Identifying skill matches...",
        "Assessing compatibility...",
        "Generating recommendations..."
      ];
      
      let currentStage = 0;
      const stageInterval = setInterval(() => {
        if (currentStage < stages.length) {
          setProcessingStage(stages[currentStage]);
          currentStage++;
        } else {
          clearInterval(stageInterval);
        }
      }, 1200);
      
      return () => clearInterval(stageInterval);
    } else {
      setProcessingStage('');
    }
  }, [isGenerating]);

  const timeZones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1',
    'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8',
    'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];

  const currentProfile = activeProfile === 'mentor' ? mentorProfile : menteeProfile;
  const setCurrentProfile = activeProfile === 'mentor' ? setMentorProfile : setMenteeProfile;

  const addSkill = () => {
    if (newSkill.trim() && !currentProfile.skills.includes(newSkill.trim())) {
      setCurrentProfile({
        ...currentProfile,
        skills: [...currentProfile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setCurrentProfile({
      ...currentProfile,
      skills: currentProfile.skills.filter(s => s !== skill)
    });
  };

  const updateProfile = (field: keyof Profile, value: string) => {
    setCurrentProfile({
      ...currentProfile,
      [field]: value
    });
  };

  const handleMatch = async () => {
    if (!mentorProfile.name || !menteeProfile.name) return;
    
    setIsGenerating(true);
    setMatchResult('');
    setPartialResult('');
    
    try {
      // Start the mentorship matching process
      const resultPromise = matchMentorship(mentorProfile, menteeProfile);
      
      // Show progressive feedback while waiting for the result
      setTimeout(() => {
        if (isMountedRef.current && !matchResult) {
          setPartialResult('*Analyzing mentor and mentee profiles...*\n\n');
        }
      }, 800);
      
      setTimeout(() => {
        if (isMountedRef.current && !matchResult) {
          setPartialResult(prev => 
            prev + `*Evaluating skill match between ${mentorProfile.name} and ${menteeProfile.name}...*\n\n` +
            `- Mentor skills: ${mentorProfile.skills.join(', ')}\n` +
            `- Mentee interests: ${menteeProfile.skills.join(', ')}\n\n`
          );
        }
      }, 2000);
      
      setTimeout(() => {
        if (isMountedRef.current && !matchResult) {
          setPartialResult(prev => 
            prev + '*Identifying potential mentorship focus areas...*\n\n'
          );
        }
      }, 3200);
      
      // Wait for the actual result
      const result = await resultPromise;
      
      if (isMountedRef.current) {
        if (result) {
          setMatchResult(result);
        } else {
          setMatchResult("Sorry, I couldn't generate a compatibility analysis. Please check that both profiles have sufficient information and try again.");
        }
      }
    } catch (error) {
      console.error('Error matching mentorship:', error);
      if (isMountedRef.current) {
        setMatchResult("An error occurred while analyzing mentorship compatibility. Please try again with different profile information.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
        setPartialResult('');
      }
    }
  };

  const isProfileComplete = (profile: Profile) => {
    return profile.name && profile.skills.length > 0 && profile.goals && profile.timeZone;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-purple-600" />
          AI Mentorship Matcher
        </CardTitle>
        <CardDescription>
          Find the perfect mentor-mentee matches using AI compatibility analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Selector */}
        <div className="flex gap-2">
          <Button
            variant={activeProfile === 'mentor' ? 'default' : 'outline'}
            onClick={() => setActiveProfile('mentor')}
            className="flex-1"
          >
            Mentor Profile
          </Button>
          <Button
            variant={activeProfile === 'mentee' ? 'default' : 'outline'}
            onClick={() => setActiveProfile('mentee')}
            className="flex-1"
          >
            Mentee Profile
          </Button>
        </div>

        {/* Profile Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder={`${activeProfile === 'mentor' ? 'Mentor' : 'Mentee'} name`}
                value={currentProfile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProfile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select 
                value={currentProfile.timeZone} 
                onValueChange={(value) => updateProfile('timeZone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {activeProfile === 'mentor' ? 'Mentoring Goals' : 'Learning Goals'}
              </Label>
              <Textarea
                placeholder={`What do you want to ${activeProfile === 'mentor' ? 'help others achieve' : 'learn or achieve'}?`}
                value={currentProfile.goals}
                onChange={(e) => updateProfile('goals', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Textarea
                placeholder={`Describe your ${activeProfile === 'mentor' ? 'expertise and teaching experience' : 'current level and background'}`}
                value={currentProfile.experience}
                onChange={(e) => updateProfile('experience', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <Input
                placeholder="e.g., Weekends, evenings, 2 hours/week"
                value={currentProfile.availability}
                onChange={(e) => updateProfile('availability', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Profile Status */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className={`p-4 ${isProfileComplete(mentorProfile) ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isProfileComplete(mentorProfile) ? 'bg-green-500' : 'bg-muted-foreground'}`} />
              <span className="font-medium">Mentor Profile</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isProfileComplete(mentorProfile) ? 'Complete ✓' : 'Incomplete - fill required fields'}
            </p>
          </Card>

          <Card className={`p-4 ${isProfileComplete(menteeProfile) ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isProfileComplete(menteeProfile) ? 'bg-green-500' : 'bg-muted-foreground'}`} />
              <span className="font-medium">Mentee Profile</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isProfileComplete(menteeProfile) ? 'Complete ✓' : 'Incomplete - fill required fields'}
            </p>
          </Card>
        </div>

        {/* Match Button */}
        <Button 
          onClick={handleMatch}
          disabled={isGenerating || loading || !isProfileComplete(mentorProfile) || !isProfileComplete(menteeProfile)}
          className="w-full"
        >
          {isGenerating || loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingStage || "Analyzing Compatibility..."}
            </>
          ) : (
            <>
              <Heart className="mr-2 h-4 w-4" />
              Find Mentorship Match
            </>
          )}
        </Button>

        {/* Loading Indicator with Progressive Content */}
        {isGenerating && partialResult && (
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" ref={resultRef}>
            <CardHeader>
              <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Generating Compatibility Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer 
                content={partialResult} 
                className="text-purple-800 dark:text-purple-300"
              />
              <div className="flex items-center mt-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-purple-700 dark:text-purple-400" />
                <span className="text-sm text-purple-700 dark:text-purple-400">{processingStage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Results */}
        {!isGenerating && matchResult && (
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" ref={resultRef}>
            <CardHeader>
              <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Mentorship Compatibility Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer 
                content={matchResult} 
                className="text-purple-800 dark:text-purple-300"
              />
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Tips for Better Matches:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <h5 className="font-medium mb-2">For Mentors:</h5>
                <ul className="space-y-1">
                  <li>• Be specific about your expertise areas</li>
                  <li>• Mention your teaching/mentoring style</li>
                  <li>• Include industry experience</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">For Mentees:</h5>
                <ul className="space-y-1">
                  <li>• Clearly state your learning goals</li>
                  <li>• Mention your commitment level</li>
                  <li>• Be honest about your current skill level</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default MentorshipMatcher;