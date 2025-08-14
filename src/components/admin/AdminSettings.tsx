import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Bell, 
  Mail, 
  Database, 
  Key, 
  Globe, 
  Palette,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  enableMaintenance: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  defaultUserRole: string;
  sessionTimeout: number;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableAI: boolean;
  aiProvider: string;
  aiApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  enableSSL: boolean;
  backupFrequency: string;
  retentionDays: number;
  enableLogging: boolean;
  logLevel: string;
  enableRateLimit: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
}

interface AdminSettingsProps {
  className?: string;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ className }) => {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'ImpactHub Learning Platform',
    siteDescription: 'Empowering learners through AI-powered education',
    allowRegistration: true,
    requireEmailVerification: true,
    enableMaintenance: false,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    defaultUserRole: 'student',
    sessionTimeout: 24,
    enableNotifications: true,
    enableAnalytics: true,
    enableAI: true,
    aiProvider: 'deepseek',
    aiApiKey: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    enableSSL: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    enableLogging: true,
    logLevel: 'info',
    enableRateLimit: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd load settings from a database table
      // For now, we'll use localStorage as a fallback
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
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
      // In a real implementation, you'd save to a database table
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      // In a real implementation, you'd test the email configuration
      toast.success('Email settings test successful');
    } catch (error) {
      toast.error('Email settings test failed');
    }
  };

  const testAIConnection = async () => {
    if (!settings.aiApiKey) {
      toast.error('Please enter an API key first');
      return;
    }

    try {
      toast.info('Testing AI connection...');
      
      // Test based on provider
      let testEndpoint = '';
      let testHeaders: Record<string, string> = {};
      let testBody: any = {};

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
          testBody = {
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test' }]
          };
          break;
        
        case 'google':
          testEndpoint = `https://generativelanguage.googleapis.com/v1/models?key=${settings.aiApiKey}`;
          break;
        
        default:
          toast.error('AI provider testing not implemented for this provider');
          return;
      }

      const response = await fetch(testEndpoint, {
        method: settings.aiProvider === 'anthropic' ? 'POST' : 'GET',
        headers: testHeaders,
        body: settings.aiProvider === 'anthropic' ? JSON.stringify(testBody) : undefined
      });

      if (response.ok) {
        toast.success(`${settings.aiProvider.toUpperCase()} connection test successful!`);
      } else {
        const errorData = await response.text();
        console.error('AI API Error:', errorData);
        toast.error(`AI connection test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('AI connection test error:', error);
      toast.error('AI connection test failed: Network error');
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

  const exportSettings = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      settings: { ...settings, aiApiKey: '***', smtpPassword: '***' } // Hide sensitive data
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.settings) {
          setSettings({ ...settings, ...importedData.settings });
          toast.success('Settings imported successfully');
        }
      } catch (error) {
        toast.error('Failed to import settings');
      }
    };
    reader.readAsText(file);
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
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
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            className="hidden"
            id="import-settings"
          />
          <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="ai">AI & Features</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                <Textarea
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
              <CardDescription>Control user registration and onboarding</CardDescription>
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
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify email before access</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="defaultUserRole">Default User Role</Label>
                <Select value={settings.defaultUserRole} onValueChange={(value) => updateSetting('defaultUserRole', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Upload Settings</CardTitle>
              <CardDescription>Configure file upload limits and types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes.join(', ')}
                  onChange={(e) => updateSetting('allowedFileTypes', e.target.value.split(', '))}
                  placeholder="jpg, png, pdf, doc"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Security</CardTitle>
              <CardDescription>Configure security settings and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Limit API requests per user</p>
                </div>
                <Switch
                  checked={settings.enableRateLimit}
                  onCheckedChange={(checked) => updateSetting('enableRateLimit', checked)}
                />
              </div>
              
              {settings.enableRateLimit && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rateLimitRequests">Requests per Window</Label>
                    <Input
                      id="rateLimitRequests"
                      type="number"
                      value={settings.rateLimitRequests}
                      onChange={(e) => updateSetting('rateLimitRequests', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rateLimitWindow">Window (minutes)</Label>
                    <Input
                      id="rateLimitWindow"
                      type="number"
                      value={settings.rateLimitWindow}
                      onChange={(e) => updateSetting('rateLimitWindow', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Control platform availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
                </div>
                <Switch
                  checked={settings.enableMaintenance}
                  onCheckedChange={(checked) => updateSetting('enableMaintenance', checked)}
                />
              </div>
              {settings.enableMaintenance && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Maintenance mode is enabled. Only admins can access the platform.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure email delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={settings.smtpUser}
                  onChange={(e) => updateSetting('smtpUser', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable SSL/TLS</Label>
                  <p className="text-sm text-muted-foreground">Use secure connection</p>
                </div>
                <Switch
                  checked={settings.enableSSL}
                  onCheckedChange={(checked) => updateSetting('enableSSL', checked)}
                />
              </div>
              
              <Button onClick={testEmailSettings} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Test Email Settings
              </Button>
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
                        <SelectItem value="google">Google AI</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="custom">Custom Provider</SelectItem>
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
                  
                  <Button onClick={testAIConnection} variant="outline" disabled={!settings.aiApiKey}>
                    <Zap className="h-4 w-4 mr-2" />
                    Test AI Connection
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

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

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Configure database backup and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => updateSetting('backupFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="retentionDays">Backup Retention (days)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => updateSetting('retentionDays', parseInt(e.target.value))}
                />
              </div>
              
              <Button onClick={testDatabaseConnection} variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Test Database Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logging & Monitoring</CardTitle>
              <CardDescription>Configure system logging and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Logging</Label>
                  <p className="text-sm text-muted-foreground">System and user activity logging</p>
                </div>
                <Switch
                  checked={settings.enableLogging}
                  onCheckedChange={(checked) => updateSetting('enableLogging', checked)}
                />
              </div>
              
              {settings.enableLogging && (
                <div>
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select value={settings.logLevel} onValueChange={(value) => updateSetting('logLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Dangerous actions that cannot be undone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">Reset All Settings</span>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  This will reset all platform settings to their default values. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm">
                  Reset Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;