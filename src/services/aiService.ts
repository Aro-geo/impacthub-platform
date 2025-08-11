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

      // Format content for structured display
      const formattedContent = this.formatStructuredResponse(content);
      return formattedContent;
    } catch (error) {
      console.error('AI Service Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get AI response');
    }
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
      const result = await this.makeRequest(messages, 0.3, 800);
      console.log('Learning path generated successfully:', result);
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

    return this.makeRequest(messages, 0.1, 800);
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
    return this.makeRequest(messages, 0.3, 600);
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
    return this.makeRequest(messages, 0.1, 300);
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
    return this.makeRequest(messages, 0.3, 800);
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