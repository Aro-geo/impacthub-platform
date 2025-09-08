import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, Lightbulb, Eye, BookOpen } from 'lucide-react';

export interface HintLevel {
  level: number;
  type: 'general' | 'specific' | 'conceptual' | 'example';
  title: string;
  content: string;
  difficulty: number;
}

interface ProgressiveHintSystemProps {
  concept: string;
  problemContext: string;
  studentInterests: string[];
  onHintUsed: (level: number, hintType: string) => void;
  maxHints?: number;
}

const ProgressiveHintSystem: React.FC<ProgressiveHintSystemProps> = ({
  concept,
  problemContext,
  studentInterests,
  onHintUsed,
  maxHints = 4
}) => {
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [usedHints, setUsedHints] = useState<HintLevel[]>([]);
  const [showHintAnimation, setShowHintAnimation] = useState(false);

  // Generate contextual hints based on the concept and student interests
  const generateHints = (concept: string, context: string, interests: string[]): HintLevel[] => {
    const baseHints: Record<string, HintLevel[]> = {
      algebra: [
        {
          level: 1,
          type: 'general',
          title: 'Think About the Operation',
          content: 'What mathematical operation do you think you need to use here? Look at what the problem is asking for.',
          difficulty: 1
        },
        {
          level: 2,
          type: 'specific',
          title: 'Focus on Both Sides',
          content: 'Remember that whatever you do to one side of an equation, you must do to the other side too. What operation would help isolate the variable?',
          difficulty: 2
        },
        {
          level: 3,
          type: 'conceptual',
          title: 'Inverse Operations',
          content: 'Think about inverse operations. If the variable is being multiplied by something, what operation would "undo" that multiplication?',
          difficulty: 3
        },
        {
          level: 4,
          type: 'example',
          title: 'Similar Problem',
          content: generatePersonalizedExample('algebra', interests, context),
          difficulty: 4
        }
      ],
      geometry: [
        {
          level: 1,
          type: 'general',
          title: 'Visualize the Shape',
          content: 'Try to picture the geometric shape in your mind. What properties does this shape have?',
          difficulty: 1
        },
        {
          level: 2,
          type: 'specific',
          title: 'Key Measurements',
          content: 'What measurements or dimensions are you given? Which ones do you need to find?',
          difficulty: 2
        },
        {
          level: 3,
          type: 'conceptual',
          title: 'Geometric Formulas',
          content: 'Think about the formulas you know for this type of shape. Which formula relates the given information to what you need to find?',
          difficulty: 3
        },
        {
          level: 4,
          type: 'example',
          title: 'Real-World Connection',
          content: generatePersonalizedExample('geometry', interests, context),
          difficulty: 4
        }
      ]
    };

    return baseHints[concept] || [
      {
        level: 1,
        type: 'general',
        title: 'Break It Down',
        content: 'Try breaking this problem into smaller parts. What do you know, and what do you need to find?',
        difficulty: 1
      },
      {
        level: 2,
        type: 'specific',
        title: 'Look for Patterns',
        content: 'Are there any patterns or relationships in the given information that might help?',
        difficulty: 2
      },
      {
        level: 3,
        type: 'conceptual',
        title: 'Connect to What You Know',
        content: 'How does this relate to concepts you\'ve learned before? What similar problems have you solved?',
        difficulty: 3
      },
      {
        level: 4,
        type: 'example',
        title: 'Step-by-Step Approach',
        content: 'Let me show you a similar problem with different numbers to help you see the pattern.',
        difficulty: 4
      }
    ];
  };

  const generatePersonalizedExample = (concept: string, interests: string[], context: string): string => {
    const interest = interests[0] || 'general';
    
    const examples = {
      algebra: {
        sports: `If a basketball player scores 2x + 5 points per game, and they scored 15 points last game, you'd solve: 2x + 5 = 15. First subtract 5 from both sides: 2x = 10, then divide by 2: x = 5 points from two-pointers.`,
        technology: `If a smartphone battery drains at a rate of 3x% per hour gaming, and it dropped 21% in one session, solve: 3x = 21. Divide both sides by 3: x = 7 hours of gaming.`,
        music: `If a song has 4x beats in the chorus, and the chorus has 32 beats total, solve: 4x = 32. Divide both sides by 4: x = 8 measures.`
      },
      geometry: {
        sports: `Think about a basketball court - it's a rectangle. If the court is 94 feet long and 50 feet wide, you can find the area using length × width = 94 × 50 = 4,700 square feet.`,
        technology: `A smartphone screen is rectangular. If it's 6 inches tall and 3 inches wide, the area is 6 × 3 = 18 square inches.`,
        arts: `Picture frames are rectangles. If a frame is 12 inches by 8 inches, its area is 12 × 8 = 96 square inches.`
      }
    };

    return examples[concept]?.[interest] || examples[concept]?.['general'] || 
           `Here's a step-by-step example with different numbers to help you see the pattern...`;
  };

  const hints = generateHints(concept, problemContext, studentInterests);

  const requestNextHint = () => {
    if (currentHintLevel < hints.length) {
      const nextHint = hints[currentHintLevel];
      setUsedHints(prev => [...prev, nextHint]);
      setCurrentHintLevel(prev => prev + 1);
      setShowHintAnimation(true);
      
      // Call the callback to track hint usage
      onHintUsed(nextHint.level, nextHint.type);

      // Reset animation after a short delay
      setTimeout(() => setShowHintAnimation(false), 500);
    }
  };

  const resetHints = () => {
    setCurrentHintLevel(0);
    setUsedHints([]);
  };

  const getHintIcon = (type: string) => {
    switch (type) {
      case 'general': return <HelpCircle className="w-4 h-4" />;
      case 'specific': return <Eye className="w-4 h-4" />;
      case 'conceptual': return <BookOpen className="w-4 h-4" />;
      case 'example': return <Lightbulb className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getHintColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'specific': return 'bg-green-100 text-green-800 border-green-200';
      case 'conceptual': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'example': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Hint Progress */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-medium">Hint Progress</div>
          <Progress value={(currentHintLevel / hints.length) * 100} className="w-32" />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={requestNextHint}
            disabled={currentHintLevel >= hints.length}
            variant="outline"
            size="sm"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {currentHintLevel === 0 ? 'Get a Hint' : 'Next Hint'}
          </Button>
          {usedHints.length > 0 && (
            <Button onClick={resetHints} variant="ghost" size="sm">
              Reset Hints
            </Button>
          )}
        </div>
      </div>

      {/* Used Hints Display */}
      {usedHints.map((hint, index) => (
        <Card 
          key={index} 
          className={`transition-all duration-300 ${
            index === usedHints.length - 1 && showHintAnimation 
              ? 'scale-105 shadow-lg' 
              : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 min-w-fit">
                {getHintIcon(hint.type)}
                <Badge className={getHintColor(hint.type)}>
                  Level {hint.level}
                </Badge>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{hint.title}</h4>
                <p className="text-sm text-muted-foreground">{hint.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Hint System Info */}
      {currentHintLevel === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Progressive Hint System</span>
            </div>
            <p className="text-xs text-blue-700">
              Get help when you need it! Hints start general and become more specific. 
              Try to solve as much as you can before requesting the next hint.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hint Types Legend */}
      {usedHints.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="text-xs font-medium mb-2">Hint Types:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-blue-600" />
                <span>General Direction</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-green-600" />
                <span>Specific Guidance</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-purple-600" />
                <span>Concept Reminder</span>
              </div>
              <div className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-orange-600" />
                <span>Example</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressiveHintSystem;
