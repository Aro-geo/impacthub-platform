import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { MessageCircle, Send, Loader2, Zap, Copy, Check } from 'lucide-react';

const StreamingChatExample = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { streamConversationalLearning } = useAI();

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedMessages);
    
    // Start streaming response
    setIsStreaming(true);
    setCurrentResponse('');
    
    try {
      await streamConversationalLearning(
        'General Learning',
        userMessage,
        'intermediate',
        {
          onToken: (token: string) => {
            setCurrentResponse(prev => prev + token);
          },
          onComplete: (response: string) => {
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setCurrentResponse('');
            setIsStreaming(false);
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `Sorry, I encountered an error: ${error.message}` 
            }]);
            setCurrentResponse('');
            setIsStreaming(false);
          }
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setCurrentResponse('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const exampleQuestions = [
    "Explain photosynthesis in simple terms",
    "How does machine learning work?",
    "What are the basics of climate change?",
    "Help me understand quantum physics",
    "Teach me about the water cycle"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <Zap className="h-5 w-5 text-yellow-500 -ml-1" />
            </div>
            Streaming AI Chat Example
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Real-time
            </Badge>
          </CardTitle>
          <CardDescription>
            Experience real-time AI conversation with streaming responses. Watch as the AI generates 
            responses token by token for a more natural and engaging interaction.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Example Questions */}
      {messages.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Try asking about:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3"
                  onClick={() => setInput(question)}
                  disabled={isStreaming}
                >
                  <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center text-muted-foreground py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Start a conversation to see streaming in action!</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] relative group ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-lg rounded-br-sm' 
                    : 'bg-gray-100 dark:bg-gray-800 rounded-lg rounded-bl-sm'
                } p-3`}>
                  {message.role === 'assistant' ? (
                    <div className="relative">
                      <MarkdownRenderer content={message.content} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 shadow-md"
                        onClick={() => copyToClipboard(message.content, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Streaming Response */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-lg rounded-bl-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">AI is thinking...</span>
                  </div>
                  {currentResponse ? (
                    <div className="relative">
                      <MarkdownRenderer content={currentResponse} />
                      <div className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Waiting for response...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Ask me anything about learning, science, or any topic you're curious about..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[60px] resize-none"
              disabled={isStreaming}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
              size="lg"
              className="px-6"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {isStreaming && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span>Streaming live response</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Code Example */}
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Example</CardTitle>
          <CardDescription>
            Here's how this streaming chat is implemented:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-lg">
            <code>{`// Using the streaming API
await streamConversationalLearning(
  'General Learning',
  userMessage,
  'intermediate',
  {
    onToken: (token) => {
      // Update UI with each token as it arrives
      setCurrentResponse(prev => prev + token);
    },
    onComplete: (response) => {
      // Handle completed response
      addMessageToChat(response);
    },
    onError: (error) => {
      // Handle any errors
      console.error('Streaming error:', error);
    }
  }
);`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamingChatExample;
