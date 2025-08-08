import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';

const APITest = () => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { testConnection, loading } = useAI();

  const handleTestConnection = async () => {
    const result = await testConnection();
    if (result) {
      setTestResult(result);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-600" />
          DeepSeek AI API Test
        </CardTitle>
        <CardDescription>
          Test the connection to your DeepSeek AI API
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button
            onClick={handleTestConnection}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Test AI Connection
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <Card className={`${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                  </h4>
                  <p className={`text-sm mt-1 ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">API Configuration:</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <div>API URL: {import.meta.env.VITE_DEEPSEEK_API_URL || 'Not configured'}</div>
              <div>API Key: {import.meta.env.VITE_DEEPSEEK_API_KEY ? '✓ Configured' : '✗ Not configured'}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Troubleshooting:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Make sure your .env file contains VITE_DEEPSEEK_API_KEY</li>
              <li>• Verify your DeepSeek API key is valid and active</li>
              <li>• Check that VITE_DEEPSEEK_API_URL is set correctly</li>
              <li>• Restart the development server after changing .env</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default APITest;