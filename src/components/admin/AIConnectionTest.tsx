import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Zap,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface AIConnectionTestProps {
  className?: string;
}

const AIConnectionTest: React.FC<AIConnectionTestProps> = ({ className }) => {
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{
    success: boolean;
    provider: string;
    message: string;
    timestamp: Date;
  } | null>(null);

  const testAIConnection = async (provider: string, apiKey: string) => {
    setTesting(true);
    
    try {
      let testEndpoint = '';
      let testHeaders: Record<string, string> = {};
      let testBody: any = undefined;
      let method = 'GET';

      switch (provider.toLowerCase()) {
        case 'openai':
          testEndpoint = 'https://api.openai.com/v1/models';
          testHeaders = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          break;
        
        case 'deepseek':
          testEndpoint = 'https://api.deepseek.com/v1/models';
          testHeaders = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          break;
        
        case 'anthropic':
          testEndpoint = 'https://api.anthropic.com/v1/messages';
          method = 'POST';
          testHeaders = {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          };
          testBody = {
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test connection' }]
          };
          break;
        
        case 'google':
          testEndpoint = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
          break;
        
        default:
          throw new Error(`Testing not implemented for provider: ${provider}`);
      }

      const response = await fetch(testEndpoint, {
        method,
        headers: testHeaders,
        body: testBody ? JSON.stringify(testBody) : undefined
      });

      const result = {
        success: response.ok,
        provider: provider.toUpperCase(),
        message: response.ok 
          ? `Connection successful! Status: ${response.status}` 
          : `Connection failed: ${response.status} ${response.statusText}`,
        timestamp: new Date()
      };

      setLastTestResult(result);

      if (response.ok) {
        toast.success(`${provider.toUpperCase()} connection test successful!`);
      } else {
        toast.error(`${provider.toUpperCase()} connection test failed`);
      }

    } catch (error) {
      const result = {
        success: false,
        provider: provider.toUpperCase(),
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };

      setLastTestResult(result);
      toast.error(`AI connection test failed: ${result.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testCurrentAIProvider = () => {
    // Get current AI settings from localStorage or default values
    const savedSettings = localStorage.getItem('admin_settings');
    let aiProvider = 'deepseek';
    let aiApiKey = '';

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        aiProvider = settings.aiProvider || 'deepseek';
        aiApiKey = settings.aiApiKey || '';
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    if (!aiApiKey) {
      toast.error('Please configure your AI API key in Settings first');
      return;
    }

    testAIConnection(aiProvider, aiApiKey);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (success: boolean) => {
    return success 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>AI Connection Test</span>
        </CardTitle>
        <CardDescription>
          Test connectivity to your configured AI provider
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Test Button */}
        <Button 
          onClick={testCurrentAIProvider} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Test AI Connection
            </>
          )}
        </Button>

        {/* Last Test Result */}
        {lastTestResult && (
          <Alert>
            {lastTestResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle className="flex items-center justify-between">
              <span>Last Test Result</span>
              <Badge className={getStatusColor(lastTestResult.success)}>
                {getStatusIcon(lastTestResult.success)}
                <span className="ml-1">
                  {lastTestResult.success ? 'Success' : 'Failed'}
                </span>
              </Badge>
            </AlertTitle>
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Provider:</strong> {lastTestResult.provider}</p>
                <p><strong>Result:</strong> {lastTestResult.message}</p>
                <p className="text-xs text-muted-foreground">
                  <strong>Tested:</strong> {lastTestResult.timestamp.toLocaleString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Supported Providers */}
        <div>
          <h4 className="font-medium mb-2">Supported AI Providers</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 p-2 border rounded">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-sm">OpenAI</span>
            </div>
            <div className="flex items-center space-x-2 p-2 border rounded">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-sm">DeepSeek</span>
            </div>
            <div className="flex items-center space-x-2 p-2 border rounded">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-sm">Anthropic</span>
            </div>
            <div className="flex items-center space-x-2 p-2 border rounded">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-sm">Google AI</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription>
            Make sure to configure your AI provider and API key in the Settings tab before testing the connection.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AIConnectionTest;