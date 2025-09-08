// Personalized Learning Experiences Service
// This service works with existing user profiles and lesson data

import { supabase } from '@/integrations/supabase/client';

// Personalized Learning Experience interfaces
export interface PersonalizedLearningExperience {
  id?: string;
  userId: string;
  lessonId?: string;
  sessionId: string;
  experienceType: 'difficulty_adjustment' | 'hint_usage' | 'concept_review' | 'personalized_example' | 'spaced_repetition';
  conceptName: string;
  difficultyLevel: number;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  responseTimeSeconds?: number;
  accuracyScore?: number;
  hintsUsed: number;
  attemptsCount: number;
  studentInterests: string[];
  careerGoals: string[];
  personalizedContent: {
    examples?: Array<{
      type: 'interest_based' | 'career_based' | 'current_events' | 'technology';
      content: string;
      effectivenessScore?: number;
    }>;
    hints?: Array<{
      level: number;
      type: 'general' | 'specific' | 'conceptual' | 'example';
      content: string;
      used: boolean;
    }>;
    adaptations?: {
      difficultyAdjustments: number[];
      learningStyleModifications: string[];
      engagementBoosters: string[];
    };
  };
  spacedRepetitionData?: {
    sm2Data: {
      easeFactor: number;
      interval: number;
      repetitions: number;
      quality: number;
    };
    reviewHistory: Array<{
      date: string;
      quality: number;
      responseTime: number;
    }>;
    difficultyProgression: number[];
    conceptConnections: string[];
  };
  nextReviewDate?: Date;
  masteryLevel: number;
  interactionData?: {
    questionAsked?: string;
    aiResponse?: string;
    studentEngagement?: {
      sessionDuration: number;
      questionsCount: number;
      hintRequests: number;
      followUpQuestions: number;
    };
    learningOutcomes?: {
      conceptUnderstanding: number;
      skillImprovement: number;
      confidenceLevel: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Simplified interface for getting user learning preferences from existing profile
export interface UserLearningPreferences {
  userId: string;
  interests: string[];
  careerGoals: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  gradeLevel: 'elementary' | 'middle' | 'high' | 'college';
}

export class PersonalizedLearningService {
  
  // Get user learning preferences from existing profile
  async getUserLearningPreferences(userId: string): Promise<UserLearningPreferences | null> {
    try {
      // For now, use localStorage until the database migration is applied
      const storedPreferences = localStorage.getItem(`learning-preferences-${userId}`);
      
      if (storedPreferences) {
        return JSON.parse(storedPreferences);
      }

      // Try to get from existing user profiles table
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profile && !error) {
          const preferences: UserLearningPreferences = {
            userId,
            interests: [], // These would need to be added to the profiles table
            careerGoals: [],
            preferredLearningStyle: 'visual',
            gradeLevel: 'middle'
          };
          
          // Store in localStorage for future use
          localStorage.setItem(`learning-preferences-${userId}`, JSON.stringify(preferences));
          return preferences;
        }
      } catch (dbError) {
        console.log('Database query failed, using localStorage only');
      }

      // Return default preferences if no profile found
      const defaultPreferences: UserLearningPreferences = {
        userId,
        interests: [],
        careerGoals: [],
        preferredLearningStyle: 'visual',
        gradeLevel: 'middle'
      };
      
      return defaultPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  // Create a new learning experience
  async createLearningExperience(experience: Omit<PersonalizedLearningExperience, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonalizedLearningExperience | null> {
    try {
      // For now, store in localStorage until database migration is applied
      const experienceWithId: PersonalizedLearningExperience = {
        ...experience,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Get existing experiences
      const existingExperiences = this.getStoredExperiences(experience.userId);
      existingExperiences.push(experienceWithId);

      // Store updated experiences
      localStorage.setItem(
        `learning-experiences-${experience.userId}`, 
        JSON.stringify(existingExperiences)
      );

      return experienceWithId;
    } catch (error) {
      console.error('Error creating learning experience:', error);
      return null;
    }
  }

  // Get learning experiences for a user
  async getUserLearningExperiences(userId: string, limit = 50): Promise<PersonalizedLearningExperience[]> {
    try {
      // Get from localStorage for now
      const experiences = this.getStoredExperiences(userId);
      return experiences
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching learning experiences:', error);
      return [];
    }
  }

  // Get concepts due for review (spaced repetition)
  async getConceptsForReview(userId: string): Promise<PersonalizedLearningExperience[]> {
    try {
      const experiences = this.getStoredExperiences(userId);
      const now = new Date();
      
      return experiences
        .filter(exp => 
          exp.experienceType === 'spaced_repetition' && 
          exp.nextReviewDate && 
          new Date(exp.nextReviewDate) <= now
        )
        .sort((a, b) => {
          const dateA = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : 0;
          const dateB = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : 0;
          return dateA - dateB;
        });
    } catch (error) {
      console.error('Error fetching concepts for review:', error);
      return [];
    }
  }

  // Update mastery level for a concept
  async updateMasteryLevel(experienceId: string, masteryLevel: number, qualityScore: number): Promise<boolean> {
    try {
      // Get all experiences to find the one to update
      const allUsers = this.getAllStoredExperiences();
      let updated = false;

      for (const userId in allUsers) {
        const userExperiences = allUsers[userId];
        const experienceIndex = userExperiences.findIndex(exp => exp.id === experienceId);
        
        if (experienceIndex !== -1) {
          const experience = userExperiences[experienceIndex];
          
          // Calculate next review date using SM-2 algorithm
          const sm2Data = experience.spacedRepetitionData?.sm2Data || {
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            quality: qualityScore
          };

          const updatedSM2 = this.calculateSM2(sm2Data, qualityScore);
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + updatedSM2.interval);

          // Update the experience
          userExperiences[experienceIndex] = {
            ...experience,
            masteryLevel,
            nextReviewDate,
            spacedRepetitionData: {
              ...experience.spacedRepetitionData,
              sm2Data: updatedSM2,
              reviewHistory: [
                ...(experience.spacedRepetitionData?.reviewHistory || []),
                {
                  date: new Date().toISOString(),
                  quality: qualityScore,
                  responseTime: experience.responseTimeSeconds || 0
                }
              ]
            },
            updatedAt: new Date()
          };

          // Save back to localStorage
          localStorage.setItem(`learning-experiences-${userId}`, JSON.stringify(userExperiences));
          updated = true;
          break;
        }
      }

      return updated;
    } catch (error) {
      console.error('Error updating mastery level:', error);
      return false;
    }
  }

  // Generate personalized examples based on interests and career goals
  generatePersonalizedExample(concept: string, interests: string[], careerGoals: string[]): string {
    const exampleTemplates = {
      algebra: {
        sports: "In basketball, if a player scores an average of x points per game over n games, the total points would be: total = x × n",
        technology: "In programming, if you have x lines of code and each function averages y lines, you'd have x/y functions",
        music: "If a song has x beats per minute and lasts y minutes, the total beats = x × y",
        medicine: "If a medication dosage is x mg per kg of body weight, a patient weighing y kg needs x × y mg",
        business: "If revenue is R and costs are C, profit P = R - C (a basic algebraic relationship)"
      },
      geometry: {
        sports: "A basketball court is rectangular - understanding area (length × width) helps calculate playing space",
        technology: "Screen resolutions use coordinate geometry - pixels are arranged in x,y coordinates",
        arts: "The golden ratio (1:1.618) appears in art and architecture for pleasing proportions",
        engineering: "Engineers use trigonometry to calculate angles and forces in structures",
        medicine: "Medical imaging uses geometric principles to create 3D representations from 2D scans"
      }
    };

    const conceptExamples = exampleTemplates[concept as keyof typeof exampleTemplates];
    if (!conceptExamples) {
      return `Here's how ${concept} applies in real-world situations you might encounter...`;
    }

    // Find the best match from interests or career goals
    const allPreferences = [...interests, ...careerGoals];
    for (const preference of allPreferences) {
      const key = Object.keys(conceptExamples).find(k => 
        preference.toLowerCase().includes(k) || k.includes(preference.toLowerCase())
      );
      if (key) {
        return conceptExamples[key as keyof typeof conceptExamples];
      }
    }

    // Return a random example if no match found
    const examples = Object.values(conceptExamples);
    return examples[Math.floor(Math.random() * examples.length)];
  }

  // Adjust difficulty based on performance
  calculateNewDifficulty(currentDifficulty: number, responseTime: number, accuracy: number, hintsUsed: number): number {
    let adjustment = 0;

    // Time-based adjustment (assuming 30 seconds is ideal)
    if (responseTime < 10) adjustment += 1; // Too fast, increase difficulty
    else if (responseTime > 60) adjustment -= 1; // Too slow, decrease difficulty

    // Accuracy-based adjustment
    if (accuracy > 0.9) adjustment += 1; // High accuracy, increase difficulty
    else if (accuracy < 0.5) adjustment -= 2; // Low accuracy, decrease significantly

    // Hints-based adjustment
    if (hintsUsed === 0) adjustment += 0.5; // No hints needed, slight increase
    else if (hintsUsed > 2) adjustment -= 1; // Many hints needed, decrease difficulty

    const newDifficulty = Math.max(1, Math.min(10, currentDifficulty + adjustment));
    return Math.round(newDifficulty * 10) / 10; // Round to 1 decimal place
  }

  // Private helper methods
  private getStoredExperiences(userId: string): PersonalizedLearningExperience[] {
    try {
      const stored = localStorage.getItem(`learning-experiences-${userId}`);
      if (!stored) return [];
      
      const experiences = JSON.parse(stored);
      return experiences.map((exp: any) => ({
        ...exp,
        createdAt: new Date(exp.createdAt),
        updatedAt: new Date(exp.updatedAt),
        nextReviewDate: exp.nextReviewDate ? new Date(exp.nextReviewDate) : undefined
      }));
    } catch (error) {
      console.error('Error parsing stored experiences:', error);
      return [];
    }
  }

  private getAllStoredExperiences(): { [userId: string]: PersonalizedLearningExperience[] } {
    const allExperiences: { [userId: string]: PersonalizedLearningExperience[] } = {};
    
    // Scan localStorage for all learning experience keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('learning-experiences-')) {
        const userId = key.replace('learning-experiences-', '');
        allExperiences[userId] = this.getStoredExperiences(userId);
      }
    }
    
    return allExperiences;
  }

  private calculateSM2(sm2Data: any, quality: number) {
    let { easeFactor, interval, repetitions } = sm2Data;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    return { easeFactor, interval, repetitions, quality };
  }
}

export const personalizedLearningService = new PersonalizedLearningService();
