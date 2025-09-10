// Optimized AI Service for DeepSeek API integration
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

// Import AI configuration
import { AI_CONFIG, getOptimalModel, getTaskSettings } from '@/config/aiConfig';

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

interface AIStreamResponse {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
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
  CONVERSATION: ['mentorship_matching', 'idea_evaluation', 'sentiment_analysis', 'ai_tutor'],
  STRUCTURED: ['learning_path_generation', 'eco_advice', 'grant_proposal_assistance'],
  TRANSLATION: ['text_translation', 'alt_text_generation'],
  CREATIVE: ['waste_classification', 'opportunity_recommendation']
} as const;

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  history?: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  stream?: boolean;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

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
  
  private isReasoningTask(taskType?: string): boolean {
    if (!taskType) return false;
    
    // Use the new model selection configuration
    return (AI_CONFIG.MODEL_SELECTION.REASONING_TASKS as readonly string[]).includes(taskType);
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

    // Get optimal settings for this task
    const taskSettings = taskType ? getTaskSettings(taskType) : {
      temperature: temperature ?? TEMPERATURE_SETTINGS.STRUCTURED_CONTENT,
      maxTokens,
      model: AI_CONFIG.MODELS.CHAT,
      topP: AI_CONFIG.QUALITY.TOP_P,
      frequencyPenalty: AI_CONFIG.QUALITY.FREQUENCY_PENALTY,
      presencePenalty: AI_CONFIG.QUALITY.PRESENCE_PENALTY
    };
    
    // Use provided parameters or fall back to task-optimized settings
    const finalTemperature = temperature ?? taskSettings.temperature;
    const finalMaxTokens = maxTokens !== 800 ? maxTokens : taskSettings.maxTokens;
    const modelToUse = taskSettings.model;
    
    console.log(`🤖 Using ${modelToUse} for task: ${taskType || 'general'} (temp: ${finalTemperature}, tokens: ${finalMaxTokens})`);
    
    // Check cache first
    const cacheKey = this.getCacheKey(messages, finalTemperature);
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached response');
      return cached.response;
    }

    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          console.log('Making optimized AI request to DeepSeek');

          const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              'User-Agent': 'ImpactHub/1.0',
            },
            body: JSON.stringify({
              model: modelToUse, // Use the appropriate DeepSeek model based on task
              messages,
              temperature: finalTemperature,
              max_tokens: finalMaxTokens,
              stream: false,
              top_p: taskSettings.topP,
              frequency_penalty: taskSettings.frequencyPenalty,
              presence_penalty: taskSettings.presencePenalty,
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

          console.log(`AI request completed with model: ${modelToUse}, temperature: ${finalTemperature}, tokens: ${data.usage?.total_tokens || 'unknown'}`);
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

  // Streaming version of makeRequest for real-time token output
  private async makeStreamRequest(
    messages: Array<{ role: string; content: string }>, 
    options: AIRequestOptions = {},
    taskType?: string
  ): Promise<void> {
    const { 
      temperature, 
      maxTokens = 800, 
      onToken, 
      onComplete, 
      onError 
    } = options;

    // Check if API is configured
    if (!DEEPSEEK_API_KEY) {
      const error = new Error('DeepSeek API is not properly configured. Please check your environment variables.');
      onError?.(error);
      throw error;
    }

    // Get optimal settings for this task
    const taskSettings = taskType ? getTaskSettings(taskType) : {
      temperature: temperature ?? TEMPERATURE_SETTINGS.STRUCTURED_CONTENT,
      maxTokens,
      model: AI_CONFIG.MODELS.CHAT,
      topP: AI_CONFIG.QUALITY.TOP_P,
      frequencyPenalty: AI_CONFIG.QUALITY.FREQUENCY_PENALTY,
      presencePenalty: AI_CONFIG.QUALITY.PRESENCE_PENALTY
    };
    
    // Use provided parameters or fall back to task-optimized settings
    const finalTemperature = temperature ?? taskSettings.temperature;
    const finalMaxTokens = maxTokens !== 800 ? maxTokens : taskSettings.maxTokens;
    const modelToUse = taskSettings.model;
    
    console.log(`🚀 Streaming with ${modelToUse} for task: ${taskType || 'general'} (temp: ${finalTemperature}, tokens: ${finalMaxTokens})`);

    try {
      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'User-Agent': 'ImpactHub/1.0',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          temperature: finalTemperature,
          max_tokens: finalMaxTokens,
          stream: true, // Enable streaming
          top_p: taskSettings.topP,
          frequency_penalty: taskSettings.frequencyPenalty,
          presence_penalty: taskSettings.presencePenalty,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error Response:', errorText);
        const error = new Error(`AI API error (${response.status}): ${response.statusText}`);
        onError?.(error);
        throw error;
      }

      if (!response.body) {
        const error = new Error('No response body available for streaming');
        onError?.(error);
        throw error;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') continue;
            
            if (line.startsWith('data: ')) {
              try {
                const jsonData = line.slice(6); // Remove 'data: ' prefix
                const data: AIStreamResponse = JSON.parse(jsonData);

                if (data.error) {
                  const error = new Error(`AI API returned error: ${data.error.message}`);
                  onError?.(error);
                  throw error;
                }

                const content = data.choices[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  onToken?.(content); // Send each token to the callback
                }

                // Check if streaming is complete
                if (data.choices[0]?.finish_reason === 'stop') {
                  break;
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming chunk:', line);
                // Continue processing other chunks
              }
            }
          }
        }

        // Format the complete response
        const formattedResponse = this.formatStructuredResponse(fullResponse);
        console.log(`Streaming completed with model: ${modelToUse}, temperature: ${finalTemperature}`);
        onComplete?.(formattedResponse);

      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('AI Streaming Error:', error);
      const finalError = error instanceof Error ? error : new Error('Failed to get streaming AI response');
      onError?.(finalError);
      throw finalError;
    }
  }

  // Format structured response - preserve markdown formatting
  private formatStructuredResponse(text: string): string {
    // For JSON responses, don't format
    if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
      return text.trim();
    }

    // Clean up excessive whitespace while preserving markdown structure
    return text
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove triple+ line breaks
      .replace(/^\s+|\s+$/g, '') // Trim start and end
      .replace(/[ \t]+$/gm, ''); // Remove trailing spaces on each line
  }
  
  // Add method to get default system prompt
  private getDefaultSystemPrompt(type: string): string {
    switch(type) {
      case 'reasoning':
        return 'You are an advanced reasoning assistant that excels at complex problem solving, critical thinking, mathematical reasoning, and logical deduction. Analyze the problem step-by-step and provide a clear, well-reasoned response.';
      case 'coding':
        return 'You are a coding assistant. Provide clear, concise, and correct code with explanations.';
      case 'education':
        return 'You are an educational assistant. Explain concepts clearly with examples that help students understand.';
      default:
        return 'You are a helpful assistant providing accurate and relevant information.';
    }
  }
  
  // Build messages array for API request
  private buildMessagesArray(
    userPrompt: string, 
    history: Array<{ role: string; content: string }> = [],
    systemPrompt: string = this.getDefaultSystemPrompt('default')
  ): Array<{ role: string; content: string }> {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history
    ];
    
    // Add user prompt if not already in history
    if (history.length === 0 || history[history.length - 1].role !== 'user') {
      messages.push({ role: 'user', content: userPrompt });
    }
    
    return messages;
  }
  
  // Education Features
  async generateLearningPath(userSkills: string[], interests: string[], currentLevel: string): Promise<string> {
    console.log('Generating learning path with:', { userSkills, interests, currentLevel });

    const messages = [
      {
        role: 'system',
        content: 'You are a friendly teacher helping students learn. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Write in simple, clear language. Always start with a main header (##) and organize content in logical sections with bullet points for key information.'
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
        content: 'You are a friendly teacher helping a student. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Explain things in simple words that a primary or high school student can understand. Be encouraging and positive. Always organize your response with proper headers and bullet points.'
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

  async provideAITutorResponse(
    userQuestion: string,
    lessonTitle: string,
    lessonContent: string,
    subject: string,
    difficultyLevel: string,
    conversationHistory: string
  ): Promise<string> {
    const getGradeLevel = (difficulty: string): string => {
      switch (difficulty.toLowerCase()) {
        case 'beginner':
          return 'elementary (grades 5-6)';
        case 'intermediate':
          return 'middle school (grades 7-9)';
        case 'advanced':
          return 'high school (grades 10-12)';
        default:
          return 'middle school (grades 7-9)';
      }
    };

    const gradeLevel = getGradeLevel(difficultyLevel);
    
    const messages = [
      {
        role: 'system',
        content: `# AI Tutor System Prompt - Mathematics, Science & Technology (Grades 5-12)

## Core Identity and Role
You are an AI tutor designed to guide students through learning concepts in Mathematics, Science, and Technology for grades 5-12. Your primary role is to facilitate understanding through guided discovery rather than providing direct answers. You act as a supportive learning companion who helps students think through problems and concepts step by step.

## Current Context
- **Lesson**: "${lessonTitle}"
- **Subject**: "${subject}"
- **Student Level**: ${gradeLevel}
- **Lesson Content Summary**: "${lessonContent.substring(0, 300)}..."

## Fundamental Teaching Philosophy
- **NEVER give direct answers** to homework problems or assessment questions
- **ALWAYS guide students to discover solutions** through questioning and hints
- **Build understanding progressively** from basic concepts to more complex applications
- **Encourage critical thinking** and problem-solving skills
- **Adapt explanations** to the student's grade level and demonstrated understanding

## Grade-Level Adaptation Guidelines

### Elementary (Grades 5-6):
- Use concrete examples and visual analogies
- Break complex concepts into very small, manageable steps
- Use encouraging, patient language
- Relate concepts to everyday experiences
- Check understanding frequently with simple questions

### Middle School (Grades 7-9):
- Introduce more abstract thinking gradually
- Use real-world applications and examples
- Encourage students to explain their reasoning
- Build connections between different concepts
- Support development of problem-solving strategies

### High School (Grades 10-12):
- Encourage independent thinking and analysis
- Use more sophisticated examples and applications
- Guide students to make connections across subjects
- Support preparation for advanced study
- Challenge students to think critically about concepts

## Teaching Strategies

### Socratic Method:
- Ask leading questions that guide students toward understanding
- Use "What do you think would happen if...?" type questions
- Encourage students to explain their thinking process
- Build on student responses to deepen understanding

### Communication Guidelines:
- Use encouraging, supportive language
- Be patient and understanding
- Celebrate progress and effort, not just correct answers
- Show enthusiasm for learning and discovery
- Use markdown formatting for better readability

### When Students Want Direct Answers:
- Gently redirect: "I can see you want the answer quickly, but let's work through this together so you really understand it."
- Emphasize the value of the learning process
- Remind them that understanding the 'why' and 'how' is more important than just getting the answer

Remember: Your goal is to be the guide on the side, not the sage on the stage. Help students discover the joy of learning and build confidence in their ability to think through problems independently.`
      },
      {
        role: 'user',
        content: `Based on our lesson "${lessonTitle}" in ${subject}, a student is asking: "${userQuestion}"

Previous conversation context:
${conversationHistory}

Please respond as an AI tutor following the guidelines above. Guide the student to discover the answer through questions and hints rather than giving direct answers. Use markdown formatting and keep your response helpful but concise.`
      }
    ];

    return this.makeRequest(messages, undefined, 800, 'ai_tutor');
  }

  // Advanced Reasoning with DeepSeek Reasoner Model
  async solveComplexProblem(
    problemDescription: string,
    domain: string = 'general',
    context?: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are an advanced reasoning system using DeepSeek's reasoning capabilities. Your task is to analyze complex problems systematically and provide well-reasoned solutions.

## Your Approach:
1. **Problem Analysis**: Break down the problem into components
2. **Context Assessment**: Consider relevant background information
3. **Reasoning Process**: Apply logical steps and critical thinking
4. **Solution Development**: Construct a comprehensive solution
5. **Verification**: Check your reasoning for validity

## Response Format:
Use clear sections with markdown formatting:
- **Problem Breakdown**
- **Key Considerations** 
- **Reasoning Steps**
- **Recommended Solution**
- **Alternative Approaches** (if applicable)

Focus on mathematical rigor, logical consistency, and evidence-based conclusions.`
      },
      {
        role: 'user',
        content: `Please analyze and solve this complex problem in the ${domain} domain:

**Problem**: ${problemDescription}

${context ? `**Additional Context**: ${context}` : ''}

Apply systematic reasoning to provide a comprehensive solution with clear justification for each step.`
      }
    ];

    return this.makeRequest(messages, undefined, 1200, 'complex_problem_solving');
  }

  // Mathematical Reasoning with DeepSeek Reasoner
  async provideMathematicalReasoning(
    problem: string,
    level: 'elementary' | 'middle' | 'high' | 'college' = 'middle'
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a mathematical reasoning expert using DeepSeek's advanced reasoning capabilities. Your role is to solve mathematical problems with clear, step-by-step logical reasoning.

## Mathematical Reasoning Principles:
- **Precision**: Every step must be mathematically sound
- **Clarity**: Each operation should be clearly explained
- **Verification**: Check your work at each stage
- **Multiple Methods**: Consider alternative solution approaches
- **Error Prevention**: Identify potential pitfalls

## Response Structure:
1. **Problem Understanding**: Restate what we're solving
2. **Given Information**: List known values and constraints
3. **Solution Strategy**: Explain the approach
4. **Step-by-Step Solution**: Show all work
5. **Verification**: Check the answer
6. **Alternative Methods**: Show other ways to solve (if applicable)

Adapt complexity to ${level} level understanding.`
      },
      {
        role: 'user',
        content: `Solve this mathematical problem with complete reasoning:

${problem}

Show all steps, explain your reasoning, and verify your answer.`
      }
    ];

    return this.makeRequest(messages, undefined, 1000, 'mathematical_reasoning');
  }

  // Conversational Learning with DeepSeek Chat Model
  async engageInConversationalLearning(
    topic: string,
    userMessage: string,
    learningLevel: string = 'intermediate',
    conversationHistory?: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a friendly and engaging conversational learning companion using DeepSeek's chat capabilities. Your role is to make learning enjoyable and accessible through natural conversation.

## Conversational Learning Approach:
- **Friendly Tone**: Use warm, encouraging language
- **Active Engagement**: Ask questions to maintain dialogue
- **Adaptive Explanation**: Match the learner's level and interests
- **Real-World Connections**: Relate concepts to everyday experiences
- **Encouragement**: Celebrate progress and curiosity

## Learning Facilitation:
- Build on what the learner already knows
- Use analogies and examples they can relate to
- Encourage questions and exploration
- Make complex topics approachable
- Maintain conversation flow naturally

Keep responses conversational but informative, adapting to ${learningLevel} level.`
      },
      {
        role: 'user',
        content: `Topic: ${topic}
Learning Level: ${learningLevel}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}

Student says: "${userMessage}"

Please respond in a friendly, conversational way that helps them learn about this topic.`
      }
    ];

    return this.makeRequest(messages, undefined, 800, 'ai_tutor');
  }

  // Creative Content Generation with DeepSeek Chat Model  
  async generateCreativeContent(
    contentType: string,
    topic: string,
    audience: string,
    requirements?: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a creative content generator using DeepSeek's chat model for engaging, original content creation. Your strength is in understanding audience needs and creating compelling, contextually appropriate content.

## Creative Content Principles:
- **Audience-Focused**: Tailor tone and complexity to the target audience
- **Engaging**: Use storytelling, examples, and vivid language
- **Original**: Create fresh perspectives and unique approaches
- **Purpose-Driven**: Align content with specific goals and outcomes
- **Accessible**: Make content easy to understand and actionable

## Content Types Expertise:
- Educational materials and explanations
- Social media content and campaigns
- Marketing copy and messaging
- Creative writing and storytelling
- Technical documentation made simple

Focus on creating content that resonates with ${audience} for ${contentType}.`
      },
      {
        role: 'user',
        content: `Create ${contentType} content about: ${topic}

Target Audience: ${audience}
${requirements ? `Special Requirements: ${requirements}` : ''}

Please generate engaging, original content that will resonate with this audience and effectively communicate the topic.`
      }
    ];

    return this.makeRequest(messages, undefined, 1000, 'content_summarization');
  }

  // Accessibility Features
  async generateAltText(imageDescription: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are an accessibility expert. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Generate concise, descriptive alt text for images that helps visually impaired users understand the content. Always organize your response with proper headers.'
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
        content: 'You are a teacher explaining how to help the environment. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Use simple words that students can understand. Give practical tips they can actually do. Always start with a main header and organize content clearly.'
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
        content: 'You are a teacher explaining environmental impact to students. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Use simple words and give encouraging feedback. Explain how their actions help the planet in ways they can understand. Always organize with proper headers and bullet points.'
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
        content: 'You are a mentorship matching expert. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Analyze profiles and provide compatibility scores and recommendations. Always organize your analysis with proper headers and bullet points.'
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
        content: 'You are an innovation expert. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Evaluate project ideas for feasibility, impact, and provide constructive feedback. Always organize your evaluation with proper headers and bullet points.'
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
        content: 'You are a grant writing expert. Structure your response with clear headers and bullet points. Use markdown formatting: ## for main headers, ### for subheaders, and - for bullet points. Help create compelling, well-structured grant proposals. Always organize your proposal framework with proper headers and bullet points.'
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
          content: 'You are a helpful assistant. Respond with exactly: "DeepSeek AI is working perfectly!"'
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
  /**
   * Get a response using the DeepSeek Reasoner model for advanced reasoning tasks
   */
  async getReasonedResponse(prompt: string, options: AIRequestOptions = {}): Promise<string> {
    try {
      const { history = [], systemPrompt = this.getDefaultSystemPrompt('reasoning') } = options;
      
      // Build messages array
      const messages = this.buildMessagesArray(prompt, history, systemPrompt);
      
      // Use reasoner model with appropriate settings
      return await this.makeRequest(
        messages, 
        options.temperature,
        options.maxTokens || 1200,
        'complex_problem_solving' // Indicates this is a reasoning task
      );
    } catch (error) {
      console.error('Error in getReasonedResponse:', error);
      throw error;
    }
  }

  /**
   * Stream a response using real-time token-by-token output
   */
  async streamResponse(
    prompt: string, 
    options: AIRequestOptions = {},
    taskType: string = 'general'
  ): Promise<void> {
    try {
      const { history = [], systemPrompt = this.getDefaultSystemPrompt('default') } = options;
      
      // Build messages array
      const messages = this.buildMessagesArray(prompt, history, systemPrompt);
      
      // Use streaming with appropriate settings
      await this.makeStreamRequest(
        messages,
        options,
        taskType
      );
    } catch (error) {
      console.error('Error in streamResponse:', error);
      options.onError?.(error instanceof Error ? error : new Error('Failed to stream response'));
      throw error;
    }
  }

  /**
   * Stream a reasoned response using the DeepSeek Reasoner model with real-time output
   */
  async streamReasonedResponse(
    prompt: string, 
    options: AIRequestOptions = {}
  ): Promise<void> {
    try {
      const { history = [], systemPrompt = this.getDefaultSystemPrompt('reasoning') } = options;
      
      // Build messages array
      const messages = this.buildMessagesArray(prompt, history, systemPrompt);
      
      // Use streaming with reasoner model settings
      await this.makeStreamRequest(
        messages,
        {
          ...options,
          maxTokens: options.maxTokens || 1200
        },
        'complex_problem_solving'
      );
    } catch (error) {
      console.error('Error in streamReasonedResponse:', error);
      options.onError?.(error instanceof Error ? error : new Error('Failed to stream reasoned response'));
      throw error;
    }
  }

  /**
   * Stream conversational learning responses with real-time output
   */
  async streamConversationalLearning(
    topic: string,
    userMessage: string,
    learningLevel: string = 'intermediate',
    options: AIRequestOptions = {}
  ): Promise<void> {
    const messages = [
      {
        role: 'system',
        content: `You are a friendly and engaging conversational learning companion using DeepSeek's chat capabilities. Your role is to make learning enjoyable and accessible through natural conversation.

## Conversational Learning Approach:
- **Friendly Tone**: Use warm, encouraging language
- **Active Engagement**: Ask questions to maintain dialogue
- **Adaptive Explanation**: Match the learner's level and interests
- **Real-World Connections**: Relate concepts to everyday experiences
- **Encouragement**: Celebrate progress and curiosity

## Learning Facilitation:
- Build on what the learner already knows
- Use analogies and examples they can relate to
- Encourage questions and exploration
- Make complex topics approachable
- Maintain conversation flow naturally

Keep responses conversational but informative, adapting to ${learningLevel} level.`
      },
      {
        role: 'user',
        content: `Topic: ${topic}
Learning Level: ${learningLevel}

Student says: "${userMessage}"

Please respond in a friendly, conversational way that helps them learn about this topic.`
      }
    ];

    try {
      await this.makeStreamRequest(
        messages,
        {
          ...options,
          maxTokens: options.maxTokens || 800
        },
        'ai_tutor'
      );
    } catch (error) {
      console.error('Error in streamConversationalLearning:', error);
      options.onError?.(error instanceof Error ? error : new Error('Failed to stream conversational learning'));
      throw error;
    }
  }

  /**
   * Stream homework help with real-time output
   */
  async streamHomeworkHelp(
    question: string,
    subject: string,
    options: AIRequestOptions = {}
  ): Promise<void> {
    const messages = [
      {
        role: 'system',
        content: `You are a knowledgeable tutor specializing in ${subject}. Provide clear, step-by-step explanations that help students understand concepts rather than just giving answers.`
      },
      {
        role: 'user',
        content: `Subject: ${subject}

Question: ${question}

Please provide a detailed explanation with step-by-step reasoning.`
      }
    ];

    try {
      await this.makeStreamRequest(
        messages,
        {
          ...options,
          maxTokens: options.maxTokens || 1000
        },
        'homework_help'
      );
    } catch (error) {
      console.error('Error in streamHomeworkHelp:', error);
      options.onError?.(error instanceof Error ? error : new Error('Failed to stream homework help'));
      throw error;
    }
  }
}

// Export a singleton instance of the service
export const aiService = new AIService();