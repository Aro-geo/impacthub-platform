import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type AIRecommendation = Tables<'ai_recommendations'>;

export const aiRecommendationService = {
  // Get AI recommendations for a user
  async getUserRecommendations(userId: string, type?: string) {
    let query = supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('recommended_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Create new AI recommendation
  async createRecommendation(recommendation: TablesInsert<'ai_recommendations'>) {
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .insert(recommendation)
        .select()
        .single();

      if (error) {
        console.warn('Failed to save recommendation:', error.message);
        if (error.code === '42501' || error.code === 'PGRST116' || error.status === 403) {
          console.error('Permission denied: Check RLS policies for ai_recommendations table');
        }
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error creating recommendation:', err);
      return null;
    }
  },

  // Generate learning path recommendations
  async generateLearningPathRecommendations(userId: string, skills: string[], interests: string[], level: string) {
    try {
      // This would integrate with your AI service to generate recommendations
      // For now, we'll create a basic recommendation entry
      const recommendation = await this.createRecommendation({
        user_id: userId,
        recommended_type: 'learning_path',
        reason: `Based on skills: ${skills.join(', ')} and interests: ${interests.join(', ')} at ${level} level`
      });

      return recommendation;
    } catch (err) {
      console.error('Failed to generate learning path recommendations:', err);
      return null;
    }
  },

  // Generate mentorship recommendations
  async generateMentorshipRecommendations(userId: string, skills: string[]) {
    const recommendation = await this.createRecommendation({
      user_id: userId,
      recommended_type: 'mentorship',
      reason: `Recommended mentors for skills: ${skills.join(', ')}`
    });

    return recommendation;
  },

  // Generate resource recommendations
  async generateResourceRecommendations(userId: string, category: string, level: string) {
    const recommendation = await this.createRecommendation({
      user_id: userId,
      recommended_type: 'resource',
      reason: `Recommended ${category} resources for ${level} level`
    });

    return recommendation;
  }
};