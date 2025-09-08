// AI Configuration and Performance Settings

export const AI_CONFIG = {
  // DeepSeek AI Models Configuration
  MODELS: {
    CHAT: 'deepseek-chat',        // For conversations, creativity, and general interactions
    REASONER: 'deepseek-reasoner' // For complex reasoning, analysis, and problem-solving
  },
  DEFAULT_MODEL: 'deepseek-chat',
  API_URL: import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  
  // Model Selection Rules - Define which model to use for different task types
  MODEL_SELECTION: {
    // Tasks that require deep reasoning and analysis (use deepseek-reasoner)
    REASONING_TASKS: [
      'complex_problem_solving',
      'critical_thinking', 
      'mathematical_reasoning',
      'scientific_analysis',
      'logical_deduction',
      'quiz_creation',           // Creating educational content requires reasoning
      'learning_path_generation', // Planning learning requires analysis
      'homework_help'            // Academic help benefits from reasoning capabilities
    ] as const,
    
    // Tasks that are conversational and creative (use deepseek-chat)
    CONVERSATIONAL_TASKS: [
      'ai_tutor',                // Interactive tutoring is conversational
      'mentorship_matching',     // Social matching is conversational
      'idea_evaluation',         // Idea feedback is conversational
      'sentiment_analysis',      // Understanding emotions is conversational
      'opportunity_recommendation', // Recommendations are conversational
      'content_summarization',   // Text processing is conversational
      'text_translation',        // Language tasks are conversational
      'alt_text_generation',     // Accessibility content is conversational
      'eco_advice',             // Environmental advice is conversational
      'grant_proposal_assistance', // Writing assistance is conversational
      'waste_classification'     // Classification can be conversational
    ] as const
  },
  
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
      'opportunity_recommendation',
      'ai_tutor'
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
    ],
    REASONING: [
      'complex_problem_solving',
      'critical_thinking',
      'mathematical_reasoning',
      'scientific_analysis',
      'logical_deduction'
    ]
  },
  
  // Response Quality Settings
  QUALITY: {
    TOP_P: 0.95,              // Nucleus sampling
    FREQUENCY_PENALTY: 0.1,   // Reduce repetition
    PRESENCE_PENALTY: 0.1     // Encourage diverse responses
  }
} as const;

// Helper function to get optimal model for a task
export function getOptimalModel(taskType: string): string {
  const { MODEL_SELECTION, MODELS } = AI_CONFIG;
  
  // Check if it's a reasoning task
  if ((MODEL_SELECTION.REASONING_TASKS as readonly string[]).includes(taskType)) {
    return MODELS.REASONER;
  }
  
  // Check if it's a conversational task
  if ((MODEL_SELECTION.CONVERSATIONAL_TASKS as readonly string[]).includes(taskType)) {
    return MODELS.CHAT;
  }
  
  // Default to chat model for unknown tasks
  return MODELS.CHAT;
}

// Helper function to get optimal settings for a task
export function getTaskSettings(taskType: string): {
  temperature: number;
  maxTokens: number;
  model: string;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
} {
  const { TEMPERATURES, PERFORMANCE, TASK_CLASSIFICATIONS } = AI_CONFIG;
  
  // Determine temperature based on task type
  let temperature: number = TEMPERATURES.STRUCTURED_CONTENT;
  
  if (TASK_CLASSIFICATIONS.CODING.includes(taskType as any)) {
    temperature = TEMPERATURES.CODING_MATH;
  } else if (TASK_CLASSIFICATIONS.CONVERSATION.includes(taskType as any)) {
    temperature = TEMPERATURES.GENERAL_CONVERSATION;
  } else if (TASK_CLASSIFICATIONS.TRANSLATION.includes(taskType as any)) {
    temperature = TEMPERATURES.TRANSLATION;
  }
  
  // Determine max tokens based on task complexity
  let maxTokens: number = PERFORMANCE.MAX_TOKENS.STANDARD;
  
  if (['grant_proposal_assistance', 'learning_path_generation'].includes(taskType)) {
    maxTokens = PERFORMANCE.MAX_TOKENS.COMPREHENSIVE;
  } else if (['text_translation', 'waste_classification'].includes(taskType)) {
    maxTokens = PERFORMANCE.MAX_TOKENS.QUICK_RESPONSE;
  } else if (['idea_evaluation', 'mentorship_matching'].includes(taskType)) {
    maxTokens = PERFORMANCE.MAX_TOKENS.DETAILED;
  }
  
  // Get optimal model for this task
  const model = getOptimalModel(taskType);
  
  return {
    temperature,
    maxTokens,
    model,
    topP: AI_CONFIG.QUALITY.TOP_P,
    frequencyPenalty: AI_CONFIG.QUALITY.FREQUENCY_PENALTY,
    presencePenalty: AI_CONFIG.QUALITY.PRESENCE_PENALTY
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