// AI Service for DeepSeek API integration
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL;

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
  };
}

class AIService {
  constructor() {
    // Validate API configuration on initialization
    if (!DEEPSEEK_API_KEY) {
      console.warn('DeepSeek API key not found. Please check your .env file.');
    }
    if (!DEEPSEEK_API_URL) {
      console.warn('DeepSeek API URL not found. Please check your .env file.');
    }
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>, temperature = 0.3, maxTokens = 800): Promise<string> {
    // Check if API is configured
    if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_URL) {
      throw new Error('DeepSeek API is not properly configured. Please check your environment variables.');
    }

    try {
      console.log('Making AI request to:', `${DEEPSEEK_API_URL}/chat/completions`);

      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      console.log('AI API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error Response:', errorText);
        throw new Error(`AI API error (${response.status}): ${response.statusText} - ${errorText}`);
      }

      const data: AIResponse = await response.json();
      console.log('AI API Success Response:', data);

      if (data.error) {
        throw new Error(`AI API returned error: ${data.error.message}`);
      }

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI API returned empty response');
      }

      // Clean up any markdown formatting that might appear
      const cleanContent = this.cleanMarkdown(content);
      return cleanContent;
    } catch (error) {
      console.error('AI Service Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get AI response');
    }
  }

  // Clean markdown formatting for simple text output
  private cleanMarkdown(text: string): string {
    return text
      // Remove markdown headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic markers
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.*?)`/g, '$1')
      // Remove bullet points and replace with simple text
      .replace(/^\s*[-*+]\s+/gm, '')
      // Remove numbered lists
      .replace(/^\s*\d+\.\s+/gm, '')
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  // Education Features
  async generateLearningPath(userSkills: string[], interests: string[], currentLevel: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly teacher helping students learn. Write in simple, clear language that a high school student can understand. Do not use markdown, bullet points, or special formatting. Write in plain text with short sentences.'
      },
      {
        role: 'user',
        content: `I am a ${currentLevel} student. My skills are: ${userSkills.join(', ')}. I am interested in: ${interests.join(', ')}. Please create a simple learning plan for me. Keep it short and easy to understand.`
      }
    ];
    return this.makeRequest(messages, 0.3, 600);
  }

  async createQuizFromContent(content: string, difficulty: string = 'easy'): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a teacher creating simple quizzes for students. Make questions easy to understand. Use simple words. Create exactly 3 questions. Return only valid JSON format with no extra text.'
      },
      {
        role: 'user',
        content: `Create a simple quiz from this text: "${content}". Make it ${difficulty} level. Return JSON: {"questions": [{"question": "simple question?", "options": ["option 1", "option 2", "option 3"], "correct": 0, "explanation": "simple explanation"}]}`
      }
    ];
    return this.makeRequest(messages, 0.2, 500);
  }

  async provideHomeworkHelp(question: string, subject: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly teacher helping a student. Explain things in very simple words that a primary or high school student can understand. Use short sentences. Do not use markdown or special formatting. Be encouraging and positive.'
      },
      {
        role: 'user',
        content: `Please help me with this ${subject} question: "${question}". Explain it step by step in simple words.`
      }
    ];
    return this.makeRequest(messages, 0.3, 400);
  }

  // Accessibility Features
  async generateAltText(imageDescription: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are an accessibility expert. Generate concise, descriptive alt text for images that helps visually impaired users understand the content.'
      },
      {
        role: 'user',
        content: `Generate alt text for an image described as: "${imageDescription}"`
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
    return this.makeRequest(messages, 0.1, 300);
  }

  // Sustainability Features
  async getEcoActionAdvice(location: string, lifestyle: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a teacher explaining how to help the environment. Use simple words that students can understand. Give practical tips they can actually do. Do not use markdown or bullet points.'
      },
      {
        role: 'user',
        content: `I live in ${location} and my lifestyle is ${lifestyle}. Give me 3 simple ways to help the environment that I can do easily.`
      }
    ];
    return this.makeRequest(messages, 0.3, 400);
  }

  async calculateSustainabilityImpact(activities: string[]): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a teacher explaining environmental impact to students. Use simple words and give encouraging feedback. Explain how their actions help the planet in ways they can understand.'
      },
      {
        role: 'user',
        content: `I did these good things for the environment: ${activities.join(', ')}. Tell me how this helps the planet. Use simple words and be encouraging.`
      }
    ];
    return this.makeRequest(messages, 0.3, 500);
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
        content: 'You are a mentorship matching expert. Analyze profiles and provide compatibility scores and recommendations.'
      },
      {
        role: 'user',
        content: `Analyze mentorship compatibility between mentor: ${JSON.stringify(mentorProfile)} and mentee: ${JSON.stringify(menteeProfile)}. Provide compatibility score and recommendations.`
      }
    ];
    return this.makeRequest(messages);
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
        content: 'You are an innovation expert. Evaluate project ideas for feasibility, impact, and provide constructive feedback.'
      },
      {
        role: 'user',
        content: `Evaluate this ${category} project idea and provide feedback with a score (1-10): "${ideaDescription}"`
      }
    ];
    return this.makeRequest(messages);
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
        content: 'You are a grant writing expert. Help create compelling, well-structured grant proposals.'
      },
      {
        role: 'user',
        content: `Help write a grant proposal for a ${category} project: "${projectDescription}" requesting ${fundingAmount}. Include key sections and persuasive language.`
      }
    ];
    return this.makeRequest(messages);
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

  // Test API Connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with a simple greeting in plain text.'
        },
        {
          role: 'user',
          content: 'Hello, can you confirm you are working?'
        }
      ];
      
      const response = await this.makeRequest(messages, 0.1, 100);
      return {
        success: true,
        message: `API connection successful! Response: ${response}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const aiService = new AIService();