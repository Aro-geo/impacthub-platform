import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Leaf, Plus, X, Loader2, TreePine } from 'lucide-react';

const SustainabilityCalculator = () => {
  const [activities, setActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState('');
  const [impactReport, setImpactReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [partialReport, setPartialReport] = useState('');
  const isMountedRef = useRef(true);
  const resultRef = useRef<HTMLDivElement>(null);

  const { calculateImpact, loading } = useAI();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Scroll to results when report is available
  useEffect(() => {
    if (impactReport && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [impactReport]);

  // Update processing stage for visual feedback
  useEffect(() => {
    if (isGenerating) {
      const stages = [
        "Analyzing activities...",
        "Calculating CO₂ savings...",
        "Estimating environmental impact...",
        "Generating recommendations...",
        "Finalizing impact report..."
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

  const commonActivities = [
    'Recycled 10 plastic bottles',
    'Used public transport instead of car for 5 days',
    'Switched to LED bulbs in home',
    'Composted organic waste for 1 month',
    'Reduced meat consumption by 3 days/week',
    'Used reusable water bottle for 1 month',
    'Planted 2 trees',
    'Reduced shower time by 5 minutes daily',
    'Used bicycle instead of car for short trips',
    'Bought local/organic produce'
  ];

  const addActivity = (activity: string) => {
    if (activity.trim() && !activities.includes(activity.trim())) {
      setActivities([...activities, activity.trim()]);
      setNewActivity('');
    }
  };

  const removeActivity = (activity: string) => {
    setActivities(activities.filter(a => a !== activity));
  };

  const handleCalculateImpact = async () => {
    if (activities.length === 0) return;
    
    setIsGenerating(true);
    setImpactReport('');
    setPartialReport('');
    
    try {
      // Start the impact calculation process
      const resultPromise = calculateImpact(activities);
      
      // Show progressive feedback while waiting for the result
      setTimeout(() => {
        if (isMountedRef.current && !impactReport) {
          setPartialReport('*Analyzing your sustainable activities...*\n\n');
        }
      }, 800);
      
      setTimeout(() => {
        if (isMountedRef.current && !impactReport) {
          setPartialReport(prev => 
            prev + '*Calculating CO₂ equivalent savings for ' + activities.length + ' activities...*\n\n'
          );
        }
      }, 2000);
      
      setTimeout(() => {
        if (isMountedRef.current && !impactReport) {
          setPartialReport(prev => 
            prev + '*Preparing sustainability impact visualization...*\n\n'
          );
        }
      }, 3200);
      
      // Wait for the actual result
      const result = await resultPromise;
      
      if (isMountedRef.current) {
        if (result) {
          setImpactReport(result);
        } else {
          setImpactReport("I'm sorry, I couldn't calculate the impact for these activities. Please try with different activities or be more specific.");
        }
      }
    } catch (error) {
      console.error('Error calculating sustainability impact:', error);
      if (isMountedRef.current) {
        setImpactReport("An error occurred while calculating your environmental impact. Please try again with different activities.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
        setPartialReport('');
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" />
          Sustainability Impact Calculator
        </CardTitle>
        <CardDescription>
          Calculate your environmental impact and CO₂ savings from sustainable activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Activity Input */}
        <div className="space-y-3">
          <Label>Add Your Sustainable Activities</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Describe your sustainable activity..."
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addActivity(newActivity)}
            />
            <Button onClick={() => addActivity(newActivity)} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Common Activities */}
        <div className="space-y-3">
          <Label>Quick Add Common Activities</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonActivities.map((activity) => (
              <Button
                key={activity}
                variant="outline"
                size="sm"
                className="justify-start h-auto p-3 text-left"
                onClick={() => addActivity(activity)}
                disabled={activities.includes(activity)}
              >
                <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-xs">{activity}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Activities */}
        {activities.length > 0 && (
          <div className="space-y-3">
            <Label>Your Activities ({activities.length})</Label>
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => (
                <Badge key={activity} variant="secondary" className="flex items-center gap-1 p-2">
                  <TreePine className="h-3 w-3" />
                  {activity}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1" 
                    onClick={() => removeActivity(activity)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <Button 
          onClick={handleCalculateImpact}
          disabled={isGenerating || loading || activities.length === 0}
          className="w-full"
        >
          {isGenerating || loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingStage || "Calculating Impact..."}
            </>
          ) : (
            <>
              <Leaf className="mr-2 h-4 w-4" />
              Calculate Environmental Impact
            </>
          )}
        </Button>

        {/* Loading Indicator with Progressive Content */}
        {isGenerating && partialReport && (
          <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700" ref={resultRef}>
            <CardContent className="pt-6">
              <MarkdownRenderer 
                content={partialReport} 
                className="text-green-800 dark:text-green-200"
              />
              <div className="flex items-center mt-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-green-700 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-400">{processingStage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impact Report */}
        {!isGenerating && impactReport && (
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700" ref={resultRef}>
            <CardContent className="pt-6">
              <MarkdownRenderer 
                content={impactReport} 
                className="text-green-800 dark:text-green-200"
              />
            </CardContent>
          </Card>
        )}

        {/* Motivation Section */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Every Action Counts! 🌍</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <h5 className="font-medium mb-2">Track Your Progress:</h5>
                <ul className="space-y-1">
                  <li>• Log daily sustainable activities</li>
                  <li>• See cumulative CO₂ savings</li>
                  <li>• Compare with global averages</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Make It a Habit:</h5>
                <ul className="space-y-1">
                  <li>• Start with small changes</li>
                  <li>• Set weekly sustainability goals</li>
                  <li>• Share progress with friends</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SustainabilityCalculator;