import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  X,
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  UserPlus,
  LogIn,
  Sparkles
} from 'lucide-react';

interface FloatingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const FloatingAuthModal: React.FC<FloatingAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'signin');
      setEmail('');
      setPhone('');
      setPassword('');
      setName('');
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen, initialMode]);

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
            description: "Ready to continue your learning journey?",
          });
          onClose();
          navigate('/dashboard');
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
            title: "Welcome to ImpactHub AI! 🌟",
            description: "Let's start creating positive impact together!",
          });
          onClose();
          navigate('/dashboard');
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-md w-full">
        {/* Floating Card with Animation */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                ImpactHub AI
              </h1>
            </div>
            
            <CardTitle className="text-2xl font-heading font-bold text-gray-900 flex items-center justify-center gap-2">
              {isLogin ? (
                <>
                  <LogIn className="h-6 w-6 text-blue-600" />
                  Welcome Back!
                </>
              ) : (
                <>
                  <UserPlus className="h-6 w-6 text-green-600" />
                  Join ImpactHub AI
                </>
              )}
            </CardTitle>
            <CardDescription className="text-lg">
              {isLogin 
                ? 'Continue your learning and impact journey' 
                : 'Start creating positive change with AI'
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
                size="sm"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                variant={authMethod === 'phone' ? 'default' : 'ghost'}
                onClick={() => setAuthMethod('phone')}
                className="rounded-lg"
                size="sm"
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
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700"
                disabled={loading}
              >
                {loading ? (
                  'Please wait...'
                ) : isLogin ? (
                  'Sign In & Continue Learning'
                ) : (
                  'Create Account & Start Impact'
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
                onClick={() => {
                  onClose();
                  navigate('/ai-dashboard');
                }}
                className="w-full h-12 text-lg font-medium border-2 border-dashed"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Try AI Tools as Guest
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">
                No account needed • Full features • Progress not saved
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FloatingAuthModal;