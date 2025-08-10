import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
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

  const { matchMentorship, loading } = useAI();

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

    const result = await matchMentorship(mentorProfile, menteeProfile);
    if (result) {
      setMatchResult(result);
    }
  };

  const isProfileComplete = (profile: Profile) => {
    const isComplete = profile.name && profile.skills.length > 0 && profile.goals && profile.timeZone;
    console.log('Profile completeness check:', {
      name: !!profile.name,
      skills: profile.skills.length > 0,
      goals: !!profile.goals,
      timeZone: !!profile.timeZone,
      isComplete
    });
    return isComplete;
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
          <Card className={`p-4 ${isProfileComplete(mentorProfile) ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isProfileComplete(mentorProfile) ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">Mentor Profile</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isProfileComplete(mentorProfile) ? 'Complete ✓' : 'Incomplete - fill required fields'}
            </p>
          </Card>

          <Card className={`p-4 ${isProfileComplete(menteeProfile) ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isProfileComplete(menteeProfile) ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">Mentee Profile</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isProfileComplete(menteeProfile) ? 'Complete ✓' : 'Incomplete - fill required fields'}
            </p>
          </Card>
        </div>

        {/* Match Button */}
        <Button 
          onClick={handleMatch}
          disabled={loading || !isProfileComplete(mentorProfile) || !isProfileComplete(menteeProfile)}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Compatibility...
            </>
          ) : (
            <>
              <Heart className="mr-2 h-4 w-4" />
              Find Mentorship Match
            </>
          )}
        </Button>

        {/* Match Results */}
        {matchResult && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Mentorship Compatibility Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-purple-800 text-base leading-relaxed whitespace-pre-line">
                {matchResult}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 mb-3">Tips for Better Matches:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
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