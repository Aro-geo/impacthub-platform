
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Brain,
  Mic, 
  Users, 
  TrendingUp, 
  Heart,
  Globe,
  Award,
  Play,
  ArrowRight,
  Zap,
  FileQuestion,
  GraduationCap,
  Leaf,
  MessageSquare,
  Accessibility,
  Sparkles
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Navigation from '@/components/Navigation';
import GuestModeCard from '@/components/GuestModeCard';
import FloatingAuthModal from '@/components/FloatingAuthModal';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const platformFeatures = [
    {
      category: 'AI-Powered Learning',
      icon: Brain,
      color: 'bg-blue-500',
      features: [
        { name: 'Learning Path Generator', desc: 'Personalized AI curricula', icon: Brain },
        { name: 'AI Quiz Creator', desc: 'Generate quizzes from any content', icon: FileQuestion },
        { name: 'Homework Helper', desc: 'Step-by-step AI tutoring', icon: GraduationCap },
        { name: 'Voice Q&A', desc: 'Ask questions in your language', icon: Mic }
      ]
    },
    {
      category: 'Accessibility Tools',
      icon: Accessibility,
      color: 'bg-purple-500',
      features: [
        { name: 'Text-to-Speech', desc: 'Natural voice synthesis', icon: Mic },
        { name: 'Language Translator', desc: '25+ languages supported', icon: Globe },
        { name: 'Alt Text Generator', desc: 'AI image descriptions', icon: Accessibility },
        { name: 'Simple Interface', desc: 'Low-literacy friendly design', icon: Heart }
      ]
    },
    {
      category: 'Community Impact',
      icon: Users,
      color: 'bg-green-500',
      features: [
        { name: 'Mentorship Matching', desc: 'AI-powered mentor pairing', icon: Users },
        { name: 'Learning Groups', desc: 'Study with peers globally', icon: MessageSquare },
        { name: 'Impact Tracking', desc: 'Measure your progress', icon: TrendingUp },
        { name: 'Sustainability Tools', desc: 'Track environmental impact', icon: Leaf }
      ]
    }
  ];

  const stats = [
    { icon: Users, number: '50K+', label: 'Global Learners' },
    { icon: Globe, number: '25+', label: 'Languages' },
    { icon: BookOpen, number: '1000+', label: 'AI-Enhanced Lessons' },
    { icon: Award, number: '95%', label: 'Success Rate' }
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      location: 'Philippines',
      text: 'The AI tutor helped me learn English in 3 months! Now I can help my children with homework.',
      avatar: '👩‍🌾',
      feature: 'AI Learning'
    },
    {
      name: 'Ahmed Hassan',
      location: 'Egypt',
      text: 'Voice lessons and translation made learning accessible. Perfect for our community.',
      avatar: '👨‍💼',
      feature: 'Accessibility'
    },
    {
      name: 'Priya Sharma',
      location: 'India',
      text: 'The mentorship matching connected me with amazing teachers. Learning together is powerful.',
      avatar: '👩‍🎓',
      feature: 'Community'
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthMode('signup');
      setShowAuthModal(true);
    }
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 rounded-full text-blue-700 font-medium mb-6 shadow-lg">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              AI-Powered Education for Everyone
            </div>
            
            <h1 className="text-4xl md:text-7xl font-heading font-bold text-gray-900 mb-6 leading-tight">
              Learn, Connect,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
                Create Impact
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              The world's first AI-powered social impact platform combining advanced learning tools, 
              accessibility features, and community empowerment - designed for everyone, everywhere.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 text-white px-12 py-6 text-xl rounded-2xl shadow-xl"
                onClick={handleGetStarted}
              >
                <Play className="mr-3 h-6 w-6" />
                Start Your Journey - Free
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="px-12 py-6 text-xl rounded-2xl border-2"
                onClick={() => navigate('/ai-dashboard')}
              >
                <Zap className="mr-3 h-5 w-5" />
                Try AI Tools
              </Button>
            </div>

            <div className="text-gray-600">
              No credit card required • Works offline • Available in 25+ languages
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Three Powerful Platforms in One
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced AI tools, accessible learning, and community impact - all integrated seamlessly
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {platformFeatures.map((platform, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <platform.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-foreground mb-4 text-center">
                    {platform.category}
                  </h3>
                  <div className="space-y-3">
                    {platform.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <feature.icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-semibold text-foreground text-sm">{feature.name}</div>
                          <div className="text-muted-foreground text-xs">{feature.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Access Buttons */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Button
              onClick={() => navigate('/ai-dashboard')}
              className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl"
            >
              <div className="text-center">
                <Brain className="h-8 w-8 mx-auto mb-1" />
                <div className="font-semibold">AI Learning Tools</div>
              </div>
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl"
            >
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-1" />
                <div className="font-semibold">Simple Learning</div>
              </div>
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl"
            >
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-1" />
                <div className="font-semibold">Community Hub</div>
              </div>
            </Button>
          </div>

          {/* Guest Mode Section */}
          <div className="max-w-md mx-auto">
            <GuestModeCard onAuthClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }} />
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Global Impact in Numbers
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join a worldwide community creating positive change through AI-powered education
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Real Stories, Real Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how our AI-powered platform is transforming lives across the globe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">{testimonial.avatar}</div>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                    {testimonial.feature}
                  </div>
                  <p className="text-foreground text-lg mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <div className="font-semibold text-foreground text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            Ready to Create Impact?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners, educators, and changemakers using AI to build a better future
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-xl rounded-2xl shadow-xl font-semibold"
              onClick={handleGetStarted}
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Start Learning Today
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-12 py-6 text-xl rounded-2xl border-2"
              onClick={() => navigate('/ai-dashboard')}
            >
              <Zap className="mr-3 h-6 w-6" />
              Explore AI Tools
            </Button>
          </div>
          
          <div className="text-purple-200">
            Free forever • No ads • Privacy-focused • Open source
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="md" variant="white" showText className="mb-4" />
              <p className="text-gray-400 mb-4">
                Empowering global communities through AI-powered education, accessibility tools, and social impact initiatives.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">AI Learning</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Learning Path Generator</li>
                <li>AI Quiz Creator</li>
                <li>Homework Helper</li>
                <li>Voice Q&A</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Accessibility</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Text-to-Speech</li>
                <li>Language Translation</li>
                <li>Simple Interface</li>
                <li>Offline Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mentorship Matching</li>
                <li>Learning Groups</li>
                <li>Impact Tracking</li>
                <li>Global Network</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 ImpactHub AI. Made with ❤️ for global education equity and social impact.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Auth Modal */}
      <FloatingAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default Index;
