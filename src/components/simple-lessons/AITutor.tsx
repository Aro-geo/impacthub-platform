import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAI } from '@/hooks/useAI';
import MarkdownRenderer from '@/components/ui/markdown-renderer';
import { Bot, Send, Loader2, RefreshCw } from 'lucide-react';

interface AITutorProps {
  lessonTitle: string;
  lessonContent: string;
  subject?: string;
  difficultyLevel?: string;
  lessonId?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AITutor: React.FC<AITutorProps> = ({ 
  lessonTitle, 
  lessonContent, 
  subject = 'General',
  difficultyLevel = 'intermediate',
  lessonId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { streamAITutorResponse, loading } = useAI();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation when dialog opens
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      initializeConversation();
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized]);

  const initializeConversation = async () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I'm your AI tutor, here to help you understand "${lessonTitle}" better.

I'm designed to guide you through learning step by step with clear explanations and just the right amount of questions. Think of me as a supportive learning companion who will help you discover solutions through guidance, examples, and strategic questions.

**What I can help you with:**
- 📚 Clarifying concepts from the lesson with clear explanations
- 🔧 Breaking down complex ideas into simpler, manageable parts  
- 🎯 Guiding you through problem-solving with step-by-step direction
- 🌍 Connecting this lesson to real-world applications and examples
- 💡 Providing helpful hints and guidance when you're stuck

**My teaching approach:**
- I'll give you clear guidance and examples
- I'll ask focused questions (usually just one at a time) when they help you learn
- I'll provide direction rather than leaving you guessing
- I'll celebrate your progress and help build your confidence

**How to get the best help:**
- Ask specific questions about what you don't understand
- Tell me what part is confusing you
- Share your thinking process so I can guide you better
- Don't worry if you need more explanation - I'm here to help!

What would you like to explore about this ${subject} lesson? Is there a particular concept or part that you'd like to understand better?`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);

    // Create a placeholder assistant message for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .map(msg => `${msg.role === 'user' ? 'Student' : 'AI Tutor'}: ${msg.content}`)
        .join('\n\n');

      await streamAITutorResponse(
        inputMessage,
        lessonTitle,
        lessonContent,
        subject,
        difficultyLevel,
        conversationHistory,
        {
          onToken: (token: string) => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: msg.content + token }
                  : msg
              )
            );
          },
          onComplete: (response: string) => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: response }
                  : msg
              )
            );
          },
          onError: (error: Error) => {
            console.error('Error getting AI response:', error);
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: 'I apologize, but I encountered an error. Please try asking your question again.' }
                  : msg
              )
            );
          }
        }
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'I apologize, but I encountered an error. Please try asking your question again.' }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setHasInitialized(false);
    if (isOpen) {
      initializeConversation();
      setHasInitialized(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800"
        >
          <Bot className="w-4 h-4 mr-2" />
          Chat with AI Tutor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Tutor - {lessonTitle}
          </DialogTitle>
          <DialogDescription>
            Get personalized guidance and explanations for this lesson
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background'
                }`}>
                  <CardContent className="p-3">
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex justify-start">
                <Card className="bg-background">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-muted-foreground">AI Tutor is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={resetConversation}
                variant="outline"
                size="sm"
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about any concept you'd like me to explain or clarify..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                  disabled={isGenerating}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isGenerating || loading}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              💡 I'll provide clear guidance and ask focused questions to help you learn. Press Enter to send.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AITutor;
