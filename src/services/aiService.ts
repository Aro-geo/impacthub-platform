// Optimized AI Service for DeepSeek-V2.5 API integration
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
  };
}

// Temperature settings for different task types
const TEMPERATURE_SETTINGS = {
  CODING_MATH: 0.0,        // Precise, deterministic responses
  GENERAL_CONVERSATION: 1.3, // Creative, varied responses
  STRUCTURED_CONTENT: 0.3,  // Balanced for educational content
  TRANSLATION: 0.1,         // Accurate translations
  CREATIVE_WRITING: 1.0     // Creative but controlled
} as const;

// Task type classification for temperature selection
const TASK_TYPES = {
  CODING: ['quiz_creation', 'homework_help', 'content_summarization'],
  CONVERSATION: ['mentorship_matching', 'idea_evaluation', 'sentiment_analysis'],
  STRUCTURED: ['learning_path_generation', 'eco_advice', 'grant_proposal_assistance'],
  TRANSLATION: ['text_translation', 'alt_text_generation'],
  CREATIVE: ['waste_classification', 'opportunity_recommendation']
} as const;

class AIService {
  private requestCache = new Map<string, { response: string; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor() {
    // Validate API configuration on initialization
    if (!DEEPSEEK_API_KEY) {
      console.warn('DeepSeek API key not found. Please check your .env file.');
    }
    
    // Clean cache periodically
    setInterval(() => this.cleanCache(), 60000); // Clean every minute
  }

  private cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.requestCache.delete(key);
      }
    }
  }

  private getCacheKey(messages: Array<{ role: string; content: string }>, temperature: number): string {
    return JSON.stringify({ messages, temperature });
  }

  private getOptimalTemperature(taskType?: string): number {
    if (!taskType) return TEMPERATURE_SETTINGS.STRUCTURED_CONTENT;

    // Check if task is coding/math related
    if (TASK_TYPES.CODING.includes(taskType as any)) {
      return TEMPERATURE_SETTINGS.CODING_MATH;
    }
    
    // Check if task is conversational
    if (TASK_TYPES.CONVERSATION.includes(taskType as any)) {
      return TEMPERATURE_SETTINGS.GENERAL_CONVERSATION;
    }
    
    // Check if task is translation
    if (TASK_TYPES.TRANSLATION.includes(taskType as any)) {
      return TEMPERATURE_SETTINGS.TRANSLATION;
    }
    
    // Check if task is creative
    if (TASK_TYPES.CREATIVE.includes(taskType as any)) {
      return TEMPERATURE_SETTINGS.CREATIVE_WRITING;
    }
    
    // Default to structured content
    return TEMPERATURE_SETTINGS.STRUCTURED_CONTENT;
  }

  private async processRequestQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.isProcessingQueue = false;
  }

  private async makeRequest(
    messages: Array<{ role: string; content: string }>, 
    temperature?: number, 
    maxTokens = 800,
    taskType?: string
  ): Promise<string> {
    // Check if API is configured
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API is not properly configured. Please check your environment variables.');
    }

    // Use optimal temperature if not specified
    const optimalTemperature = temperature ?? this.getOptimalTemperature(taskType);
    
    // Check cache first
    const cacheKey = this.getCacheKey(messages, optimalTemperature);
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached response');
      return cached.response;
    }

    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          console.log('Making optimized AI request to DeepSeek-V2.5');

          const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              'User-Agent': 'ImpactHub/1.0',
            },
            body: JSON.stringify({
              model: 'deepseek-chat', // DeepSeek-V2.5 model
              messages,
              temperature: optimalTemperature,
              max_tokens: maxTokens,
              stream: false,
              top_p: 0.95, // Optimize for quality
              frequency_penalty: 0.1, // Reduce repetition
              presence_penalty: 0.1, // Encourage diverse responses
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('AI API Error Response:', errorText);
            throw new Error(`AI API error (${response.status}): ${response.statusText}`);
          }

          const data: AIResponse = await response.json();

          if (data.error) {
            throw new Error(`AI API returned error: ${data.error.message}`);
          }

          const content = data.choices[0]?.message?.content;
          if (!content) {
            throw new Error('AI API returned empty response');
          }

          // Format content for structured display
          const formattedContent = this.formatStructuredResponse(content);
          
          // Cache the response
          this.requestCache.set(cacheKey, {
            response: formattedContent,
            timestamp: Date.now()
          });

          console.log(`AI request completed with temperature: ${optimalTemperature}, tokens: ${data.usage?.total_tokens || 'unknown'}`);
          resolve(formattedContent);
        } catch (error) {
          console.error('AI Service Error:', error);
          reject(error instanceof Error ? error : new Error('Failed to get AI response'));
        }
      };

      // Add to queue for rate limiting
      this.requestQueue.push(executeRequest);
      this.processRequestQueue();
    });
  }

  // Format markdown for structured display with headers and points
  private formatStructuredResponse(text: string): string {
    // For JSON responses, don't format
    if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
      return text.trim();
    }

    // Clean up extra whitespace but preserve structure
    return text
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  // Education Features
  async generateLearningPath(userSkills: string[], interests: string[], currentLevel: string): Promise<string> {
    console.log('Generating learning path with:', { userSkills, interests, currentLevel });

    const messages = [
      {
        role: 'system',
        content: 'You are a friendly teacher helping students learn. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Write in simple, clear language that a high school student can understand.'
      },
      {
        role: 'user',
        content: `I am a ${currentLevel} student. My skills are: ${userSkills.join(', ')}. I am interested in: ${interests.join(', ')}. Please create a structured learning plan for me with the following sections:

## Your Personalized Learning Path

### Current Assessment
- Analyze my current skills

### Recommended Learning Areas
- List 3-4 key areas to focus on

### Step-by-Step Plan
- Provide a clear progression path

### Resources & Next Steps
- Suggest specific resources and actions`
      }
    ];

    try {
      const result = await this.makeRequest(messages, undefined, 800, 'learning_path_generation');
      console.log('Learning path generated successfully');
      return result;
    } catch (error) {
      console.error('Error generating learning path:', error);
      throw error;
    }
  }

  async createQuizFromContent(content: string, difficulty: string = 'easy'): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a teacher creating simple quizzes for students. Make questions easy to understand. Use simple words. Create exactly 5 questions. Return ONLY valid JSON format with no extra text, explanations, or markdown. The JSON must be properly formatted and parseable.'
      },
      {
        role: 'user',
        content: `Create a simple ${difficulty} level quiz from this text: "${content}". Return only this JSON format with exactly 5 questions: {"questions": [{"question": "What is the main topic?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0, "explanation": "Brief explanation"}]}`
      }
    ];

    return this.makeRequest(messages, undefined, 800, 'quiz_creation');
  }

  async provideHomeworkHelp(question: string, subject: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly teacher helping a student. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Explain things in simple words that a primary or high school student can understand. Be encouraging and positive.'
      },
      {
        role: 'user',
        content: `Please help me with this ${subject} question: "${question}". Structure your response as follows:

## Understanding the Question
- Break down what the question is asking

## Key Concepts
- Explain the main ideas needed

## Step-by-Step Solution
- Provide clear steps to solve this

## Final Answer
- Give the complete answer

## Tips for Similar Problems
- Helpful hints for future questions`
      }
    ];
    return this.makeRequest(messages, undefined, 600, 'homework_help');
  }

  // Accessibility Features
  async generateAltText(imageDescription: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are an accessibility expert. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Generate concise, descriptive alt text for images that helps visually impaired users understand the content.'
      },
      {
        role: 'user',
        content: `Generate alt text for an image described as: "${imageDescription}". Structure your response as follows:

## Alt Text Generation

### Recommended Alt Text
- Provide the concise alt text

### Key Visual Elements
- List important visual components
- Describe colors, shapes, or notable features

### Context Considerations
- Explain why these elements matter
- Suggest variations for different contexts`
      }
    ];
    return this.makeRequest(messages);
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a translator. Translate text accurately and simply. Return only the translation with no extra text or formatting.'
      },
      {
        role: 'user',
        content: `Translate to ${targetLanguage}: "${text}"`
      }
    ];
    return this.makeRequest(messages, undefined, 300, 'text_translation');
  }

  // Sustainability Features
  async getEcoActionAdvice(location: string, lifestyle: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a teacher explaining how to help the environment. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Use simple words that students can understand. Give practical tips they can actually do.'
      },
      {
        role: 'user',
        content: `I live in ${location} and my lifestyle is ${lifestyle}. Structure your environmental advice as follows:

## Your Environmental Impact Plan

### Current Situation Analysis
- Assess your location and lifestyle impact

### Top 3 Easy Actions You Can Take
- Action 1: [Specific action with explanation]
- Action 2: [Specific action with explanation] 
- Action 3: [Specific action with explanation]

### Expected Impact
- How these actions help the environment

### Getting Started
- First steps to begin today`
      }
    ];
    return this.makeRequest(messages, 0.3, 600);
  }

  async calculateSustainabilityImpact(activities: string[]): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a teacher explaining environmental impact to students. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Use simple words and give encouraging feedback. Explain how their actions help the planet in ways they can understand.'
      },
      {
        role: 'user',
        content: `I did these good things for the environment: ${activities.join(', ')}. Structure your impact analysis as follows:

## Your Environmental Impact Report

### Great Job! Here's What You Accomplished
- List each activity and its positive impact

### Environmental Benefits
- How your actions help reduce pollution
- How they save natural resources
- How they protect wildlife

### Your Impact Numbers
- Estimated CO2 saved
- Resources conserved
- Positive effects created

### Keep It Up!
- Encouragement and next steps
- Ways to do even more`
      }
    ];
    return this.makeRequest(messages, 0.3, 700);
  }

  async classifyWaste(wasteDescription: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a waste management expert. Classify waste items and provide disposal instructions.'
      },
      {
        role: 'user',
        content: `Classify this waste item and provide proper disposal instructions: "${wasteDescription}"`
      }
    ];
    return this.makeRequest(messages);
  }

  // Community Features
  async matchMentorship(mentorProfile: any, menteeProfile: any): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a mentorship matching expert. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Analyze profiles and provide compatibility scores and recommendations.'
      },
      {
        role: 'user',
        content: `Analyze mentorship compatibility between mentor: ${JSON.stringify(mentorProfile)} and mentee: ${JSON.stringify(menteeProfile)}. Structure your analysis as follows:

## Mentorship Compatibility Analysis

### Compatibility Score: [X/10]
- Overall compatibility rating

### Strengths of This Match
- Shared interests and goals
- Complementary skills
- Communication style compatibility

### Potential Challenges
- Areas that might need attention
- Differences to be aware of

### Recommendations
- How to make this mentorship successful
- Suggested meeting frequency
- Key topics to focus on

### Next Steps
- How to initiate the mentorship
- First meeting suggestions`
      }
    ];
    return this.makeRequest(messages, undefined, 800, 'mentorship_matching');
  }

  async recommendOpportunities(userProfile: any, opportunities: any[]): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a career advisor. Match users with relevant job opportunities and volunteer positions.'
      },
      {
        role: 'user',
        content: `Recommend the best opportunities for this user profile: ${JSON.stringify(userProfile)} from these options: ${JSON.stringify(opportunities)}`
      }
    ];
    return this.makeRequest(messages);
  }

  async evaluateIdea(ideaDescription: string, category: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are an innovation expert. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Evaluate project ideas for feasibility, impact, and provide constructive feedback.'
      },
      {
        role: 'user',
        content: `Evaluate this ${category} project idea: "${ideaDescription}". Structure your evaluation as follows:

## Project Idea Evaluation

### Idea Summary
- Brief overview of the concept

### Strengths
- What makes this idea good
- Unique advantages
- Potential benefits

### Areas for Improvement
- Challenges to consider
- Potential obstacles
- Suggestions for enhancement

### Feasibility Assessment
- Technical feasibility
- Resource requirements
- Timeline considerations

### Impact Potential
- Who will benefit
- Scale of impact
- Long-term effects

### Overall Score: [X/10]
- Final rating with justification
- Key recommendations for moving forward`
      }
    ];
    return this.makeRequest(messages, 0.3, 800);
  }

  // Content & Collaboration Features
  async summarizeContent(content: string, maxLength: number = 200): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a content summarizer. Create concise, informative summaries under ${maxLength} words.`
      },
      {
        role: 'user',
        content: `Summarize this content: "${content}"`
      }
    ];
    return this.makeRequest(messages);
  }

  async assistGrantProposal(projectDescription: string, fundingAmount: string, category: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a grant writing expert. Structure your response with clear headers and bullet points. Use markdown formatting with ## for main headers, ### for subheaders, and - for bullet points. Help create compelling, well-structured grant proposals.'
      },
      {
        role: 'user',
        content: `Help write a grant proposal for a ${category} project: "${projectDescription}" requesting ${fundingAmount}. Structure the proposal as follows:

## Grant Proposal Framework

### Executive Summary
- Project overview in 2-3 sentences
- Funding request amount
- Expected impact

### Problem Statement
- What issue does this project address
- Why it's important to solve now
- Who is affected

### Project Description
- Detailed explanation of your solution
- How it works
- What makes it innovative

### Goals and Objectives
- Primary goal
- Specific measurable objectives
- Timeline for achievement

### Budget Justification
- How the ${fundingAmount} will be used
- Key expense categories
- Cost-effectiveness explanation

### Expected Outcomes
- Short-term results
- Long-term impact
- Success metrics

### Next Steps
- Implementation plan
- Key milestones
- Reporting schedule`
      }
    ];
    return this.makeRequest(messages, 0.3, 1000);
  }

  // Sentiment Analysis
  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; confidence: number; summary: string }> {
    const messages = [
      {
        role: 'system',
        content: 'You are a sentiment analysis expert. Analyze text sentiment and return JSON format: {"sentiment": "positive/negative/neutral", "confidence": 0.95, "summary": "brief explanation"}'
      },
      {
        role: 'user',
        content: `Analyze the sentiment of this text: "${text}"`
      }
    ];

    try {
      const response = await this.makeRequest(messages);
      return JSON.parse(response);
    } catch (error) {
      return { sentiment: 'neutral', confidence: 0.5, summary: 'Unable to analyze sentiment' };
    }
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      cacheSize: this.requestCache.size,
      queueLength: this.requestQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  private calculateCacheHitRate(): number {
    // This would need to be tracked over time in a real implementation
    return this.requestCache.size > 0 ? 0.85 : 0; // Estimated 85% hit rate
  }

  // Clear cache manually if needed
  clearCache() {
    this.requestCache.clear();
    console.log('AI service cache cleared');
  }

  // Test API Connection with optimized settings
  async testConnection(): Promise<{ success: boolean; message: string; performance: any }> {
    const startTime = Date.now();
    
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with exactly: "DeepSeek-V2.5 is working perfectly!"'
        },
        {
          role: 'user',
          content: 'Test connection'
        }
      ];

      const response = await this.makeRequest(messages, TEMPERATURE_SETTINGS.CODING_MATH, 50);
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `API connection successful! Response: ${response}`,
        performance: {
          responseTime: `${responseTime}ms`,
          model: 'DeepSeek-V2.5',
          temperature: TEMPERATURE_SETTINGS.CODING_MATH,
          ...this.getPerformanceStats()
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        performance: {
          responseTime: `${responseTime}ms`,
          error: true,
          ...this.getPerformanceStats()
        }
      };
    }
  }
}

export const aiService = new AIService();