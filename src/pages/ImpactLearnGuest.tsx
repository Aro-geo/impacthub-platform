import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import VoiceQA from '@/components/learn/VoiceQA';
import SimpleQuizCreator from '@/components/learn/SimpleQuizCreator';
import LessonViewer from '@/components/learn/LessonViewer';
import { 
  BookOpen, 
  Mic, 
  FileQuestion, 
  ArrowLeft,
  Play,
  Star,
  Clock,
  Users,
  Lock
} from 'lucide-react';

const ImpactLearnGuest = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const guestFeatures = [
    {
      id: 'lesson',
      title: 'Try a Sample Lesson',
      description: 'Experience our visual, voice-guided lessons',
      icon: BookOpen,
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'voice-qa',
      title: 'Voice Q&A',
      description: 'Ask questions and get answers in your language',
      icon: Mic,
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'quiz',
      title: 'Practice Quiz',
      description: 'Create simple quizzes from any text',
      icon: FileQuestion,
      color: 'bg-purple-500',
      available: true
    }
  ];

  const premiumFeatures = [
    'Save your progress',
    'Access all 1000+ lessons',
    'Connect with mentors',
    'Join learning groups',
    'Earn certificates',
    'Offline lesson downloads',
    'Personalized learning path'
  ];

  if (activeFeature === 'lesson') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setActiveFeature(null)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guest Mode
            </Button>
          </div>
          <LessonViewer lessonId="sample-lesson" />
        </div>
      </div>
    );
  }

  if (activeFeature === 'voice-qa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setActiveFeature(null)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guest Mode
            </Button>
          </div>
          <VoiceQA />
        </div>
      </div>
    );
  }

  if (activeFeature === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setActiveFeature(null)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guest Mode
            </Button>
          </div>
          <SimpleQuizCreator />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-gray-900">
                  ImpactLearn - Guest Mode
                </h1>
                <p className="text-gray-600 text-sm">Try our features without signing up</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/impact-learn/auth')}
                variant="outline"
              >
                Sign Up for Full Access
              </Button>
              <Button
                onClick={() => navigate('/impact-learn')}
                variant="ghost"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
            Welcome to Guest Mode!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Try our AI-powered learning features for free. 
            Sign up to save your progress and access all lessons.
          </p>
        </div>

        {/* Guest Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {guestFeatures.map((feature) => (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <Button
                  onClick={() => setActiveFeature(feature.id)}
                  className="w-full"
                  size="lg"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Try Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Limitations Notice */}
        <Card className="bg-yellow-50 border-yellow-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Guest Mode Limitations</h3>
                <ul className="text-yellow-800 space-y-1">
                  <li>• Progress is not saved</li>
                  <li>• Limited to sample content</li>
                  <li>• No access to mentors or groups</li>
                  <li>• Cannot earn certificates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Full Access Features
              </CardTitle>
              <CardDescription>
                What you get when you create a free account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Learning?
              </h3>
              <p className="text-gray-600 mb-6">
                Create your free account to unlock all features and start your learning journey!
              </p>
              <Button
                onClick={() => navigate('/impact-learn/auth')}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                Sign Up for Free
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                No credit card required • Works offline • 25+ languages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-8">
            What Our Learners Say
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Maria',
                location: 'Philippines',
                text: 'I learned English in 3 months using ImpactLearn!',
                avatar: '👩‍🌾'
              },
              {
                name: 'Ahmed',
                location: 'Egypt',
                text: 'The voice lessons helped me practice speaking.',
                avatar: '👨‍💼'
              },
              {
                name: 'Priya',
                location: 'India',
                text: 'Perfect for learning with slow internet.',
                avatar: '👩‍🎓'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{testimonial.avatar}</div>
                  <p className="text-gray-700 mb-3 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {testimonial.location}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactLearnGuest;