import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Play, Brain, Mic, FileQuestion, Users } from 'lucide-react';

interface GuestModeCardProps {
  onAuthClick?: () => void;
}

const GuestModeCard: React.FC<GuestModeCardProps> = ({ onAuthClick }) => {
  const navigate = useNavigate();

  const guestFeatures = [
    { name: 'AI Learning Path', icon: Brain, desc: 'Try personalized AI recommendations' },
    { name: 'Voice Q&A', icon: Mic, desc: 'Ask questions in any language' },
    { name: 'Quiz Creator', icon: FileQuestion, desc: 'Generate quizzes from text' },
    { name: 'Community Preview', icon: Users, desc: 'See how our community works' }
  ];

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Play className="h-6 w-6 text-blue-600" />
          Try Without Signing Up
        </CardTitle>
        <CardDescription className="text-lg">
          Explore our AI-powered features in guest mode
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {guestFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
              <feature.icon className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-sm">{feature.name}</div>
                <div className="text-xs text-gray-600">{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center pt-4">
          <Button 
            onClick={() => navigate('/ai-dashboard')}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="mr-2 h-5 w-5" />
            Try AI Tools Now
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            No account required • Full features available • Progress not saved
          </p>
          
          {onAuthClick && (
            <Button 
              variant="outline"
              onClick={onAuthClick}
              className="w-full mt-3 border-dashed"
            >
              Or Sign Up for Full Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestModeCard;