import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  UserPlus,
  LogIn,
  Smartphone
} from 'lucide-react';

const ImpactLearnAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const identifier = authMethod === 'email' ? email : phone;
      
      if (isLogin) {
        const { error } = await signIn(identifier, password);
        if (error) {
          toast({
            title: "Sign In Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back! 🎉",
            description: "Ready to continue learning?",
          });
          navigate('/impact-learn/dashboard');
        }
      } else {
        const { error } = await signUp(identifier, password, name);
        if (error) {
          toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome to ImpactLearn! 🌟",
            description: "Let's start your learning journey!",
          });
          navigate('/impact-learn/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    navigate('/impact-learn/guest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/impact-learn')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="ImpactHub Logo" 
              className="h-12 w-12 object-contain"
            />
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              ImpactLearn
            </h1>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-heading font-bold text-gray-900 flex items-center justify-center gap-2">
              {isLogin ? (
                <>
                  <LogIn className="h-6 w-6 text-blue-600" />
                  Welcome Back!
                </>
              ) : (
                <>
                  <UserPlus className="h-6 w-6 text-green-600" />
                  Join ImpactLearn
                </>
              )}
            </CardTitle>
            <CardDescription className="text-lg">
              {isLogin 
                ? 'Continue your learning journey' 
                : 'Start learning for free today'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Auth Method Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <Button
                variant={authMethod === 'email' ? 'default' : 'ghost'}
                onClick={() => setAuthMethod('email')}
                className="rounded-lg"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                variant={authMethod === 'phone' ? 'default' : 'ghost'}
                onClick={() => setAuthMethod('phone')}
                className="rounded-lg"
              >
                <Phone className="mr-2 h-4 w-4" />
                Phone
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 text-base"
                    required={!isLogin}
                  />
                </div>
              )}
              
              {authMethod === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 text-base"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="h-12 text-base"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 text-base pr-12"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                disabled={loading}
              >
                {loading ? (
                  'Please wait...'
                ) : isLogin ? (
                  'Sign In & Start Learning'
                ) : (
                  'Create Account & Start Learning'
                )}
              </Button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up for free" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>

            {/* Guest Mode */}
            <div className="border-t pt-6">
              <Button
                variant="outline"
                onClick={handleGuestMode}
                className="w-full h-12 text-lg font-medium border-2 border-dashed"
              >
                <Smartphone className="mr-2 h-5 w-5" />
                Try as Guest (No Account Needed)
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">
                Limited features • Progress won't be saved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Need help? We support learners in 25+ languages
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Works on any device • No internet required for saved lessons
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImpactLearnAuth;