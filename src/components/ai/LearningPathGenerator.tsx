import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Brain, Plus, X, Loader2 } from 'lucide-react';

const LearningPathGenerator = () => {
    const [skills, setSkills] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [currentLevel, setCurrentLevel] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [learningPath, setLearningPath] = useState('');

    const { generateLearningPath, loading } = useAI();

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const addInterest = () => {
        if (newInterest.trim() && !interests.includes(newInterest.trim())) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const removeInterest = (interest: string) => {
        setInterests(interests.filter(i => i !== interest));
    };

    const handleGeneratePath = async () => {
        if (skills.length === 0 || interests.length === 0 || !currentLevel) {
            return;
        }

        try {
            const result = await generateLearningPath(skills, interests, currentLevel);
            if (result) {
                setLearningPath(result);
            } else {
                setLearningPath("Sorry, I couldn't generate a learning path right now. Please try again later.");
            }
        } catch (error) {
            console.error('Learning path generation error:', error);
            setLearningPath("There was an error generating your learning path. Please check your internet connection and try again.");
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-blue-600" />
                    AI Learning Path Generator
                </CardTitle>
                <CardDescription>
                    Get a personalized learning path based on your current skills, interests, and level
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Skills Section */}
                <div className="space-y-3">
                    <Label>Current Skills</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a skill (e.g., JavaScript, Design)"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill} size="sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
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

                {/* Interests Section */}
                <div className="space-y-3">
                    <Label>Learning Interests</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add an interest (e.g., AI, Sustainability)"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        />
                        <Button onClick={addInterest} size="sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                            <Badge key={interest} variant="outline" className="flex items-center gap-1">
                                {interest}
                                <X
                                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                                    onClick={() => removeInterest(interest)}
                                />
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Level Selection */}
                <div className="space-y-3">
                    <Label>Current Level</Label>
                    <Select value={currentLevel} onValueChange={setCurrentLevel}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your current level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={handleGeneratePath}
                    disabled={loading || skills.length === 0 || interests.length === 0 || !currentLevel}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Learning Path...
                        </>
                    ) : (
                        'Generate Personalized Learning Path'
                    )}
                </Button>

                {/* Results */}
                {learningPath && (
                    <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <MarkdownRenderer 
                            content={learningPath} 
                            className="text-blue-800"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LearningPathGenerator;