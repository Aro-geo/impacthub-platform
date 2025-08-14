import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Settings, 
  Shield, 
  Mail, 
  Database, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminSettingsSimpleProps {
  className?: string;
}

const AdminSettingsSimple: React.FC<AdminSettingsSimpleProps> = ({ className }) => {
  const [settings, setSettings] = useState({
    siteName: 'ImpactHub Learning Platform',
    siteDescription: 'Empowering learners through AI-powered education',
    allowRegistration: true,
    enableAI: true,
    aiProvider: 'deepseek',
    aiApiKey: '',
    enableNotifications: true,
    enableAnalytics: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingAI, setTestingAI] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testAIConnection = async () => {
    if (!settings.aiApiKey) {
      toast.error('Please enter an API key first');
      return;
    }

    setTestingAI(true);
    try {
      toast.info('Testing AI connection...');
      
      let testEndpoint = '';
      let testHeaders: Record<string, string> = {};

      switch (settings.aiProvider) {
        case 'openai':
          testEndpoint = 'https://api.openai.com/v1/models';
          testHeaders = {
            'Authorization': `Bearer ${settings.aiApiKey}`,
            'Content-Type': 'application/json'
          };
          break;
        
        case 'deepseek':
          testEndpoint = 'https://api.deepseek.com/v1/models';
          testHeaders = {
            'Authorization': `Bearer ${settings.aiApiKey}`,
            'Content-Type': 'application/json'
          };
          break;
        
        case 'anthropic':
          testEndpoint = 'https://api.anthropic.com/v1/messages';
          testHeaders = {
            'x-api-key': settings.aiApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          };
          break;
        
        default:
          toast.error('AI provider testing not implemented for this provider');
          return;
      }

      const response = await fetch(testEndpoint, {
        method: settings.aiProvider === 'anthropic' ? 'POST' : 'GET',
        headers: testHeaders,
        body: settings.aiProvider === 'anthropic' ? JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }]
        }) : undefined
      });

      if (response.ok) {
        toast.success(`${settings.aiProvider.toUpperCase()} connection test successful!`);
      } else {
        toast.error(`AI connection test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('AI connection test error:', error);
      toast.error('AI connection test failed: Network error');
    } finally {
      setTestingAI(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      toast.success('Database connection successful');
    } catch (error) {
      toast.error('Database connection failed');
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Settings</h2>
          <p className="text-muted-foreground">Configure platform behavior and features</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic platform information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
              <CardDescription>Control user registration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">Enable new users to register</p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure AI features and providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AI Features</Label>
                  <p className="text-sm text-muted-foreground">Enable AI-powered learning tools</p>
                </div>
                <Switch
                  checked={settings.enableAI}
                  onCheckedChange={(checked) => updateSetting('enableAI', checked)}
                />
              </div>
              
              {settings.enableAI && (
                <>
                  <div>
                    <Label htmlFor="aiProvider">AI Provider</Label>
                    <Select value={settings.aiProvider} onValueChange={(value) => updateSetting('aiProvider', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="google">Google AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="aiApiKey">AI API Key</Label>
                    <Input
                      id="aiApiKey"
                      type="password"
                      value={settings.aiApiKey}
                      onChange={(e) => updateSetting('aiApiKey', e.target.value)}
                      placeholder="Enter your AI provider API key"
                    />
                  </div>
                  
                  <Button 
                    onClick={testAIConnection} 
                    variant="outline" 
                    disabled={!settings.aiApiKey || testingAI}
                  >
                    {testingAI ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Test AI Connection
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Push notifications and alerts</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">User behavior tracking</p>
                </div>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Tests</CardTitle>
              <CardDescription>Test system connectivity and functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-foreground">Database Connection</p>
                    <p className="text-sm text-muted-foreground">Test Supabase connectivity</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={testDatabaseConnection}>
                  <Database className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-foreground">AI Connection</p>
                    <p className="text-sm text-muted-foreground">Test {settings.aiProvider.toUpperCase()} API</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testAIConnection}
                  disabled={!settings.aiApiKey || testingAI}
                >
                  {testingAI ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Current Configuration</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <p><strong>AI Provider:</strong> {settings.aiProvider.toUpperCase()}</p>
                <p><strong>AI Enabled:</strong> {settings.enableAI ? 'Yes' : 'No'}</p>
                <p><strong>API Key:</strong> {settings.aiApiKey ? 'Configured' : 'Not Set'}</p>
                <p><strong>Analytics:</strong> {settings.enableAnalytics ? 'Enabled' : 'Disabled'}</p>
              </div>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsSimple;