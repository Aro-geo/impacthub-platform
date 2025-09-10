# AI Streaming Implementation Guide

This document explains how to implement and use real-time AI streaming in your application for token-by-token response generation.

## Overview

The streaming feature allows users to receive AI responses in real-time, token by token, instead of waiting for the complete response. This provides:

- **Better User Experience**: More engaging and natural conversation flow
- **Perceived Performance**: Responses feel faster even for complex queries
- **Real-time Feedback**: Users see progress immediately
- **Educational Value**: Students can follow the AI's thought process as it develops

## Implementation

### 1. AI Service Integration

The streaming functionality is implemented in `src/services/aiService.ts` with the following key methods:

```typescript
// Stream any response with real-time output
await aiService.streamResponse(prompt, options, taskType);

// Stream reasoned responses using DeepSeek Reasoner model
await aiService.streamReasonedResponse(prompt, options);

// Stream conversational learning responses
await aiService.streamConversationalLearning(topic, userMessage, learningLevel, options);

// Stream homework help responses
await aiService.streamHomeworkHelp(question, subject, options);
```

### 2. Hook Integration

The `useAI` hook provides easy-to-use streaming methods:

```typescript
import { useAI } from '@/hooks/useAI';

const {
  streamResponse,
  streamReasonedResponse,
  streamConversationalLearning,
  streamHomeworkHelp
} = useAI();
```

### 3. Basic Usage Example

```typescript
const [streamingOutput, setStreamingOutput] = useState('');
const [isStreaming, setIsStreaming] = useState(false);

const handleStreaming = async () => {
  setIsStreaming(true);
  setStreamingOutput('');
  
  try {
    await streamConversationalLearning(
      'Science',
      'Explain photosynthesis',
      'intermediate',
      {
        onToken: (token) => {
          // Update UI with each token as it arrives
          setStreamingOutput(prev => prev + token);
        },
        onComplete: (response) => {
          // Handle completed response
          setIsStreaming(false);
          console.log('Streaming completed:', response);
        },
        onError: (error) => {
          // Handle any errors
          setIsStreaming(false);
          console.error('Streaming error:', error);
        }
      }
    );
  } catch (error) {
    setIsStreaming(false);
    console.error('Error:', error);
  }
};
```

### 4. Advanced Chat Implementation

For a complete chat implementation, see `StreamingChatExample.tsx`:

```typescript
const handleSendMessage = async () => {
  const userMessage = input.trim();
  
  // Add user message to chat
  setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
  
  // Start streaming response
  setIsStreaming(true);
  setCurrentResponse('');
  
  await streamConversationalLearning(
    'General Learning',
    userMessage,
    'intermediate',
    {
      onToken: (token) => {
        setCurrentResponse(prev => prev + token);
      },
      onComplete: (response) => {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setCurrentResponse('');
        setIsStreaming(false);
      },
      onError: (error) => {
        console.error('Error:', error);
        setIsStreaming(false);
      }
    }
  );
};
```

## API Options

### StreamingOptions Interface

```typescript
interface AIRequestOptions {
  temperature?: number;           // Response creativity (0.0 - 2.0)
  maxTokens?: number;            // Maximum response length
  history?: Array<{ role: string; content: string }>; // Conversation history
  systemPrompt?: string;         // Custom system prompt
  stream?: boolean;              // Enable streaming (automatically set to true)
  onToken?: (token: string) => void;     // Called for each token
  onComplete?: (response: string) => void; // Called when complete
  onError?: (error: Error) => void;      // Called on error
}
```

## Available Streaming Methods

### 1. General Streaming
```typescript
streamResponse(prompt, options, taskType)
```
- **Use for**: Any general AI task
- **Model**: Automatically selected based on task type
- **Best for**: General questions, explanations, creative tasks

### 2. Reasoned Streaming
```typescript
streamReasonedResponse(prompt, options)
```
- **Use for**: Complex problem-solving, analysis, mathematical reasoning
- **Model**: DeepSeek Reasoner (optimized for reasoning tasks)
- **Best for**: Math problems, logical analysis, step-by-step solutions

### 3. Conversational Learning
```typescript
streamConversationalLearning(topic, userMessage, learningLevel, options)
```
- **Use for**: Educational conversations, tutoring
- **Model**: DeepSeek Chat (optimized for conversations)
- **Best for**: Learning assistance, Q&A, educational content

### 4. Homework Help
```typescript
streamHomeworkHelp(question, subject, options)
```
- **Use for**: Academic assistance, subject-specific help
- **Model**: DeepSeek Reasoner (for detailed explanations)
- **Best for**: Homework questions, subject explanations, study help

## Error Handling

Always implement proper error handling:

```typescript
const streamOptions = {
  onToken: (token) => {
    // Update UI
    setResponse(prev => prev + token);
  },
  onComplete: (response) => {
    // Success handling
    setIsComplete(true);
  },
  onError: (error) => {
    // Error handling
    console.error('Streaming failed:', error);
    setError(error.message);
    setIsStreaming(false);
  }
};

try {
  await streamResponse(prompt, streamOptions);
} catch (error) {
  // Additional error handling
  console.error('Streaming error:', error);
}
```

## Performance Considerations

1. **Token Accumulation**: Store tokens efficiently to avoid UI lag
2. **Rate Limiting**: The service includes built-in rate limiting
3. **Memory Management**: Clear old responses to prevent memory leaks
4. **Network Handling**: Implement proper connection error handling

## UI Best Practices

1. **Visual Indicators**: Show streaming status with animations
2. **Progress Feedback**: Display typing indicators and live status
3. **Responsive Design**: Handle different screen sizes for streaming output
4. **Accessibility**: Ensure screen readers can handle dynamic content
5. **Copy/Share**: Provide options to copy streaming responses

## Configuration

Streaming is enabled by setting `stream: true` in the API request. The implementation automatically handles:
- Server-Sent Events (SSE) parsing
- Token accumulation
- Error recovery
- Connection management

## Testing

Test streaming functionality with:
1. Network interruptions
2. Long responses
3. Rapid consecutive requests
4. Error scenarios
5. Different content types (text, code, markdown)

## Integration Examples

See the following components for complete implementations:
- `StreamingDemo.tsx` - Interactive demo with multiple streaming types
- `StreamingChatExample.tsx` - Full chat implementation
- `DeepSeekModelDemo.tsx` - Model comparison with streaming options

## Support

For issues or questions about streaming implementation:
1. Check the console for error messages
2. Verify API configuration
3. Test with simple prompts first
4. Review network connectivity
5. Check rate limiting status
