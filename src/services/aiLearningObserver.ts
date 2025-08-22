import { supabase } from '@/integrations/supabase/client';

interface LearningActivity {
  userId: string;
  activityType: 'quiz_attempt' | 'lesson_view' | 'lesson_complete' | 'ai_interaction' | 'forum_post';
  subject?: string;
  topic?: string;
  score?: number;
  timeSpent?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  metadata?: Record<string, any>;
}

interface LearnerProfile {
  userId: string;
  interests: string[];
  strengths: string[];
  weaknesses: string[];
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  recommendedTopics: string[];
  lastUpdated: string;
}

interface LearningRecommendation {
  type: 'lesson' | 'skill' | 'topic' | 'practice';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
}

class AILearningObserver {
  private static instance: AILearningObserver;
  private learnerProfiles: Map<string, LearnerProfile> = new Map();
  private activityBuffer: LearningActivity[] = [];
  private isProcessing = false;

  static getInstance(): AILearningObserver {
    if (!AILearningObserver.instance) {
      AILearningObserver.instance = new AILearningObserver();
    }
    return AILearningObserver.instance;
  }

  // Track learning activity
  async trackActivity(activity: LearningActivity): Promise<void> {
    try {
      // Add to buffer for batch processing
      this.activityBuffer.push({
        ...activity,
        metadata: {
          ...activity.metadata,
          timestamp: new Date().toISOString()
        }
      });

      // Store activity in database (with error handling)
      try {
        await supabase
          .from('learning_activities')
          .insert({
            user_id: activity.userId,
            activity_type: activity.activityType,
            subject: activity.subject,
            topic: activity.topic,
            score: activity.score,
            time_spent: activity.timeSpent,
            difficulty: activity.difficulty,
            metadata: activity.metadata,
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.warn('Learning activities table not available:', dbError);
      }

      // Process activities if buffer is full or it's been a while
      if (this.activityBuffer.length >= 5 || !this.isProcessing) {
        this.processActivities();
      }
    } catch (error) {
      console.error('Error tracking learning activity:', error);
    }
  }

  // Process activities and update learner profile
  private async processActivities(): Promise<void> {
    if (this.isProcessing || this.activityBuffer.length === 0) return;

    this.isProcessing = true;
    const activitiesToProcess = [...this.activityBuffer];
    this.activityBuffer = [];

    try {
      // Group activities by user
      const userActivities = new Map<string, LearningActivity[]>();
      activitiesToProcess.forEach(activity => {
        if (!userActivities.has(activity.userId)) {
          userActivities.set(activity.userId, []);
        }
        userActivities.get(activity.userId)!.push(activity);
      });

      // Update profiles for each user
      for (const [userId, activities] of userActivities) {
        await this.updateLearnerProfile(userId, activities);
      }
    } catch (error) {
      console.error('Error processing learning activities:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Update learner profile based on activities
  private async updateLearnerProfile(userId: string, activities: LearningActivity[]): Promise<void> {
    try {
      let profile = this.learnerProfiles.get(userId);
      
      if (!profile) {
        try {
          // Load existing profile from database
          const { data, error } = await supabase
            .from('learner_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.warn('Learner profiles table not available:', error.message);
          }

          profile = data ? {
            userId: data.user_id,
            interests: data.interests || [],
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            preferredDifficulty: data.preferred_difficulty || 'medium',
            learningStyle: data.learning_style || 'mixed',
            recommendedTopics: data.recommended_topics || [],
            lastUpdated: data.updated_at
          } : {
            userId,
            interests: [],
            strengths: [],
            weaknesses: [],
            preferredDifficulty: 'medium',
            learningStyle: 'mixed',
            recommendedTopics: [],
            lastUpdated: new Date().toISOString()
          };
        } catch (error) {
          console.warn('Error loading learner profile, using defaults:', error);
          profile = {
            userId,
            interests: [],
            strengths: [],
            weaknesses: [],
            preferredDifficulty: 'medium',
            learningStyle: 'mixed',
            recommendedTopics: [],
            lastUpdated: new Date().toISOString()
          };
        }
      }

      // Analyze activities to update profile
      const updatedProfile = this.analyzeActivities(profile, activities);
      
      // Cache updated profile
      this.learnerProfiles.set(userId, updatedProfile);

      // Save to database
      await supabase
        .from('learner_profiles')
        .upsert({
          user_id: userId,
          interests: updatedProfile.interests,
          strengths: updatedProfile.strengths,
          weaknesses: updatedProfile.weaknesses,
          preferred_difficulty: updatedProfile.preferredDifficulty,
          learning_style: updatedProfile.learningStyle,
          recommended_topics: updatedProfile.recommendedTopics,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

    } catch (error) {
      console.error('Error updating learner profile:', error);
    }
  }

  // Analyze activities to extract learning patterns
  private analyzeActivities(profile: LearnerProfile, activities: LearningActivity[]): LearnerProfile {
    const updatedProfile = { ...profile };
    
    // Track subjects/topics of interest
    const subjectInteraction = new Map<string, number>();
    const topicInteraction = new Map<string, number>();
    const performanceBySubject = new Map<string, number[]>();
    
    activities.forEach(activity => {
      // Track subject interactions
      if (activity.subject) {
        subjectInteraction.set(
          activity.subject, 
          (subjectInteraction.get(activity.subject) || 0) + 1
        );
        
        // Track performance
        if (activity.score !== undefined) {
          if (!performanceBySubject.has(activity.subject)) {
            performanceBySubject.set(activity.subject, []);
          }
          performanceBySubject.get(activity.subject)!.push(activity.score);
        }
      }
      
      // Track topic interactions
      if (activity.topic) {
        topicInteraction.set(
          activity.topic,
          (topicInteraction.get(activity.topic) || 0) + 1
        );
      }
    });

    // Update interests based on interaction frequency
    const sortedSubjects = Array.from(subjectInteraction.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([subject]) => subject);
    
    updatedProfile.interests = [...new Set([...updatedProfile.interests, ...sortedSubjects])].slice(0, 8);

    // Analyze performance to identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    performanceBySubject.forEach((scores, subject) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      if (avgScore >= 80) {
        strengths.push(subject);
      } else if (avgScore < 60) {
        weaknesses.push(subject);
      }
    });

    updatedProfile.strengths = [...new Set([...updatedProfile.strengths, ...strengths])].slice(0, 5);
    updatedProfile.weaknesses = [...new Set([...updatedProfile.weaknesses, ...weaknesses])].slice(0, 5);

    // Determine preferred difficulty based on performance
    const quizActivities = activities.filter(a => a.activityType === 'quiz_attempt' && a.score !== undefined);
    if (quizActivities.length > 0) {
      const difficultyPerformance = new Map<string, number[]>();
      
      quizActivities.forEach(activity => {
        if (activity.difficulty && activity.score !== undefined) {
          if (!difficultyPerformance.has(activity.difficulty)) {
            difficultyPerformance.set(activity.difficulty, []);
          }
          difficultyPerformance.get(activity.difficulty)!.push(activity.score);
        }
      });

      let bestDifficulty = 'medium';
      let bestScore = 0;
      
      difficultyPerformance.forEach((scores, difficulty) => {
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (avgScore > bestScore) {
          bestScore = avgScore;
          bestDifficulty = difficulty as 'easy' | 'medium' | 'hard';
        }
      });

      updatedProfile.preferredDifficulty = bestDifficulty;
    }

    updatedProfile.lastUpdated = new Date().toISOString();
    return updatedProfile;
  }

  // Generate personalized learning recommendations
  async generateRecommendations(userId: string): Promise<LearningRecommendation[]> {
    try {
      let profile = this.learnerProfiles.get(userId);
      
      if (!profile) {
        // Load from database
        const { data } = await supabase
          .from('learner_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          profile = {
            userId: data.user_id,
            interests: data.interests || [],
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            preferredDifficulty: data.preferred_difficulty || 'medium',
            learningStyle: data.learning_style || 'mixed',
            recommendedTopics: data.recommended_topics || [],
            lastUpdated: data.updated_at
          };
          this.learnerProfiles.set(userId, profile);
        }
      }

      if (!profile) {
        return this.getDefaultRecommendations();
      }

      const recommendations: LearningRecommendation[] = [];

      // Recommend practice for weak areas
      profile.weaknesses.forEach(weakness => {
        recommendations.push({
          type: 'practice',
          title: `Practice ${weakness}`,
          description: `Strengthen your understanding of ${weakness} with targeted exercises`,
          reason: `Based on your quiz performance, you could benefit from more practice in ${weakness}`,
          priority: 'high',
          estimatedTime: 30,
          difficulty: 'easy',
          subject: weakness
        });
      });

      // Recommend advanced topics for strengths
      profile.strengths.forEach(strength => {
        recommendations.push({
          type: 'lesson',
          title: `Advanced ${strength}`,
          description: `Explore advanced concepts in ${strength}`,
          reason: `You've shown strong performance in ${strength}, ready for advanced topics`,
          priority: 'medium',
          estimatedTime: 45,
          difficulty: 'hard',
          subject: strength
        });
      });

      // Recommend new topics based on interests
      profile.interests.forEach(interest => {
        if (!profile.strengths.includes(interest) && !profile.weaknesses.includes(interest)) {
          recommendations.push({
            type: 'topic',
            title: `Explore ${interest}`,
            description: `Dive deeper into ${interest} concepts`,
            reason: `Based on your activity, you seem interested in ${interest}`,
            priority: 'medium',
            estimatedTime: 25,
            difficulty: profile.preferredDifficulty,
            subject: interest
          });
        }
      });

      // Sort by priority and return top recommendations
      return recommendations
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 6);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

  // Get learner profile
  async getLearnerProfile(userId: string): Promise<LearnerProfile | null> {
    try {
      let profile = this.learnerProfiles.get(userId);
      
      if (!profile) {
        const { data } = await supabase
          .from('learner_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          profile = {
            userId: data.user_id,
            interests: data.interests || [],
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            preferredDifficulty: data.preferred_difficulty || 'medium',
            learningStyle: data.learning_style || 'mixed',
            recommendedTopics: data.recommended_topics || [],
            lastUpdated: data.updated_at
          };
          this.learnerProfiles.set(userId, profile);
        }
      }

      return profile || null;
    } catch (error) {
      console.error('Error getting learner profile:', error);
      return null;
    }
  }

  // Default recommendations for new users
  private getDefaultRecommendations(): LearningRecommendation[] {
    return [
      {
        type: 'lesson',
        title: 'Getting Started with Learning',
        description: 'Learn effective study techniques and time management',
        reason: 'Great starting point for new learners',
        priority: 'high',
        estimatedTime: 20,
        difficulty: 'easy',
        subject: 'Study Skills'
      },
      {
        type: 'topic',
        title: 'Explore Your Interests',
        description: 'Take a quiz to discover your learning preferences',
        reason: 'Help us personalize your experience',
        priority: 'high',
        estimatedTime: 15,
        difficulty: 'easy',
        subject: 'Assessment'
      },
      {
        type: 'skill',
        title: 'Critical Thinking',
        description: 'Develop analytical and problem-solving skills',
        reason: 'Essential skill for all subjects',
        priority: 'medium',
        estimatedTime: 35,
        difficulty: 'medium',
        subject: 'Life Skills'
      }
    ];
  }

  // Initialize auto-connection when app starts
  async initializeAutoConnection(): Promise<void> {
    try {
      // Use a static flag to prevent multiple initializations
      if ((AILearningObserver as any)._initialized) {
        return;
      }
      
      (AILearningObserver as any)._initialized = true;
      console.log('AI Learning Observer initialized and auto-connected');
    } catch (error) {
      console.error('Error initializing AI Learning Observer:', error);
    }
  }
}

export const aiLearningObserver = AILearningObserver.getInstance();
export type { LearningActivity, LearnerProfile, LearningRecommendation };