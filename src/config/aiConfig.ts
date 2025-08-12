// AI Configuration and Performance Settings

export const AI_CONFIG = {
  // DeepSeek-V2.5 Model Configuration
  MODEL: 'deepseek-chat',
  API_URL: import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  
  // Temperature Settings for Different Task Types
  TEMPERATURES: {
    CODING_MATH: 0.0,        // Precise, deterministic responses for coding/math
    GENERAL_CONVERSATION: 1.3, // Creative, varied responses for conversations
    STRUCTURED_CONTENT: 0.3,  // Balanced for educational content
    TRANSLATION: 0.1,         // Accurate translations
    CREATIVE_WRITING: 1.0     // Creative but controlled
  },
  
  // Performance Optimization Settings
  PERFORMANCE: {
    CACHE_ENABLED: import.meta.env.VITE_ENABLE_AI_CACHE !== 'false',
    CACHE_DURATION: parseInt(import.meta.env.VITE_AI_CACHE_DURATION || '300000'), // 5 minutes
    MAX_TOKENS: {
      QUICK_RESPONSE: 200,    // For simple queries
      STANDARD: 800,          // For most tasks
      DETAILED: 1200,         // For complex explanations
      COMPREHENSIVE: 2000     // For detailed analysis
    },
    RATE_LIMITING: {
      QUEUE_DELAY: 100,       // ms between requests
      MAX_CONCURRENT: 3       // Maximum concurrent requests
    }
  },
  
  // Task Type Classifications
  TASK_CLASSIFICATIONS: {
    CODING: [
      'quiz_creation',
      'homework_help', 
      'content_summarization',
      'waste_classification'
    ],
    CONVERSATION: [
      'mentorship_matching',
      'idea_evaluation',
      'sentiment_analysis',
      'opportunity_recommendation'
    ],
    STRUCTURED: [
      'learning_path_generation',
      'eco_advice',
      'grant_proposal_assistance',
      'sustainability_impact'
    ],
    TRANSLATION: [
      'text_translation',
      'alt_text_generation'
    ]
  },
  
  // Response Quality Settings
  QUALITY: {
    TOP_P: 0.95,              // Nucleus sampling
    FREQUENCY_PENALTY: 0.1,   // Reduce repetition
    PRESENCE_PENALTY: 0.1     // Encourage diverse responses
  }
} as const;

// Helper function to get optimal settings for a task
export function getTaskSettings(taskType: string) {
  const { TEMPERATURES, PERFORMANCE, TASK_CLASSIFICATIONS } = AI_CONFIG;
  
  // Determine temperature based on task type
  let temperature = TEMPERATURES.STRUCTURED_CONTENT;
  
  if (TASK_CLASSIFICATIONS.CODING.includes(taskType)) {
    temperature = TEMPERATURES.CODING_MATH;
  } else if (TASK_CLASSIFICATIONS.CONVERSATION.includes(taskType)) {
    temperature = TEMPERATURES.GENERAL_CONVERSATION;
  } else if (TASK_CLASSIFICATIONS.TRANSLATION.includes(taskType)) {
    temperature = TEMPERATURES.TRANSLATION;
  }
  
  // Determine max tokens based on task complexity
  let maxTokens = PERFORMANCE.MAX_TOKENS.STANDARD;
  
  if (['grant_proposal_assistance', 'learning_path_generation'].includes(taskType)) {
    maxTokens = PERFORMANCE.MAX_TOKENS.COMPREHENSIVE;
  } else if (['text_translation', 'waste_classification'].includes(taskType)) {
    maxTokens = PERFORMANCE.MAX_TOKENS.QUICK_RESPONSE;
  } else if (['idea_evaluation', 'mentorship_matching'].includes(taskType)) {
    maxTokens = PERFORMANCE.MAX_TOKENS.DETAILED;
  }
  
  return {
    temperature,
    maxTokens,
    model: AI_CONFIG.MODEL,
    ...AI_CONFIG.QUALITY
  };
}

// Performance monitoring utilities
export const PERFORMANCE_METRICS = {
  RESPONSE_TIME_THRESHOLDS: {
    FAST: 1000,      // < 1s
    NORMAL: 3000,    // < 3s
    SLOW: 5000       // < 5s
  },
  
  CACHE_EFFICIENCY: {
    GOOD: 0.8,       // 80% hit rate
    FAIR: 0.6,       // 60% hit rate
    POOR: 0.4        // 40% hit rate
  }
};

export default AI_CONFIG;