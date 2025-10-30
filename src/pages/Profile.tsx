import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/hooks/useAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  GraduationCap,
  Brain,
  BookOpen,
  Trophy,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

const Profile = () => {
  const { user, userProfile, updateProfile, loading } = useAuth();
  const { getUserStats, getUserLearningPaths, getUserQuizzes, getUserHomeworkSessions } = useAI();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    skills: [] as string[],
    grade: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [aiStats, setAiStats] = useState<any>(null);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [homeworkSessions, setHomeworkSessions] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        skills: userProfile.skills || [],
        grade: userProfile.grade?.toString() || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const [stats, paths, userQuizzes, sessions] = await Promise.all([
          getUserStats(),
          getUserLearningPaths(),
          getUserQuizzes(),
          getUserHomeworkSessions()
        ]);
        
        setAiStats(stats);
        setLearningPaths(paths);
        setQuizzes(userQuizzes);
        setHomeworkSessions(sessions);
      }
    };
    
    fetchUserData();
  }, [user, getUserStats, getUserLearningPaths, getUserQuizzes, getUserHomeworkSessions]);

  const handleSave = async () => {
    setUpdating(true);
    try {
      const { error } = await updateProfile({
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        skills: editForm.skills,
        grade: editForm.grade ? parseInt(editForm.grade) : null
      });

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const getUserInitials = () => {
    if (userProfile?.name) {
      const names = userProfile.name.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0];
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {userProfile?.name || 'User'}
                    </h2>
                    
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    
                    {userProfile?.location && (
                      <div className="flex items-center justify-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{userProfile.location}</span>
                      </div>
                    )}
                    
                    {userProfile?.grade && (
                      <div className="flex items-center justify-center">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          Grade {userProfile.grade}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Joined {formatDate(userProfile?.created_at || user?.created_at || '')}
                      </span>
                    </div>
                  </div>
                  
                  {userProfile?.bio && (
                    <p className="mt-4 text-muted-foreground text-sm text-center">
                      {userProfile.bio}
                    </p>
                  )}
                  
                  {/* Skills */}
                  {userProfile?.skills && userProfile.skills.length > 0 && (
                    <div className="mt-4 w-full">
                      <h4 className="text-sm font-medium text-foreground mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-3 w-full">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    
                    {/* Quick Grade Update */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">Current Grade</h4>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          Grade {userProfile?.grade || 'Not set'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Select 
                          value={userProfile?.grade?.toString() || ''} 
                          onValueChange={async (value) => {
                            const { error } = await updateProfile({ grade: parseInt(value) });
                            if (error) {
                              toast({
                                title: "Update Failed",
                                description: "Failed to update grade",
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Grade Updated",
                                description: `Your grade has been updated to Grade ${value}`,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => i + 5).map((gradeNum) => (
                              <SelectItem key={gradeNum} value={gradeNum.toString()}>
                                Grade {gradeNum}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                        This helps personalize your learning experience
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Activity Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                      <span className="text-sm">AI Interactions</span>
                    </div>
                    <span className="font-semibold">{aiStats?.totalInteractions || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm">Learning Paths</span>
                    </div>
                    <span className="font-semibold">{learningPaths.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm">Quizzes Created</span>
                    </div>
                    <span className="font-semibold">{quizzes.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm">Impact Points</span>
                    </div>
                    <span className="font-semibold">{userProfile?.impact_points || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="learning">Learning</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent AI Interactions</CardTitle>
                    <CardDescription>Your latest AI tool usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiStats?.mostUsedTypes && aiStats.mostUsedTypes.length > 0 ? (
                      <div className="space-y-4">
                        {aiStats.mostUsedTypes.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-foreground capitalize">
                                {item.type.replace('_', ' ')}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Used {item.count} times
                              </p>
                            </div>
                            <Badge variant="outline">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">No AI interactions yet</p>
                        <p className="text-sm text-muted-foreground/70">Start using AI tools to see your activity here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learning" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Paths</CardTitle>
                    <CardDescription>Your personalized learning journeys</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {learningPaths.length > 0 ? (
                      <div className="space-y-4">
                        {learningPaths.slice(0, 3).map((path) => (
                          <div key={path.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">Learning Path</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Skills: {path.skills?.join(', ')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Interests: {path.interests?.join(', ')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Level: {path.level}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {formatDate(path.created_at)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">No learning paths yet</p>
                        <p className="text-sm text-muted-foreground/70">Generate your first learning path with AI</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Homework Help</CardTitle>
                    <CardDescription>Your latest homework assistance sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {homeworkSessions.length > 0 ? (
                      <div className="space-y-4">
                        {homeworkSessions.slice(0, 3).map((session) => (
                          <div key={session.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">{session.subject}</h4>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {session.question}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {formatDate(session.created_at)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">No homework sessions yet</p>
                        <p className="text-sm text-muted-foreground/70">Get help with your homework using AI</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Badges & Achievements</CardTitle>
                    <CardDescription>Your learning milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No achievements yet</p>
                      <p className="text-sm text-muted-foreground/70">Keep learning to unlock badges and achievements</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Profile</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={editForm.grade} onValueChange={(value) => setEditForm(prev => ({ ...prev, grade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => i + 5).map((gradeNum) => (
                      <SelectItem key={gradeNum} value={gradeNum.toString()}>
                        Grade {gradeNum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editForm.skills.map((skill) => (
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;