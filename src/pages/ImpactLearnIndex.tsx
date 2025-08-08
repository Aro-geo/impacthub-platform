import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Mic, 
  Users, 
  TrendingUp, 
  Heart,
  Globe,
  Award,
  Play,
  ArrowRight
} from 'lucide-react';

const ImpactLearnIndex = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Learn',
      description: 'Short, visual lessons in your language',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      icon: Mic,
      title: 'Speak',
      description: 'Voice-based learning and practice',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      icon: Users,
      title: 'Practice',
      description: 'Learn with friends and mentors',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Connect',
      description: 'Join learning groups in your area',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    }
  ];

  const stats = [
    { icon: Users, number: '50K+', label: 'Learners' },
    { icon: Globe, number: '25+', label: 'Languages' },
    { icon: BookOpen, number: '1000+', label: 'Lessons' },
    { icon: Award, number: '95%', label: 'Success Rate' }
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      location: 'Philippines',
      text: 'I learned English in 3 months! Now I can help my children with homework.',
      avatar: '👩‍🌾'
    },
    {
      name: 'Ahmed Hassan',
      location: 'Egypt',
      text: 'The voice lessons helped me practice speaking. Very easy to use!',
      avatar: '👨‍💼'
    },
    {
      name: 'Priya Sharma',
      location: 'India',
      text: 'I can learn even when internet is slow. Perfect for our village.',
      avatar: '👩‍🎓'
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/impact-learn/dashboard');
    } else {
      navigate('/impact-learn/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              ImpactLearn
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/impact-learn/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/impact-learn/auth')}>
                  Sign In
                </Button>
                <Button onClick={handleGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 rounded-full text-blue-700 font-medium mb-6 shadow-lg">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Free Education for Everyone
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 mb-6 leading-tight">
              Learn in Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Own Language
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Simple, visual lessons with voice support. Learn English, life skills, and more - 
              even with slow internet!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl"
                onClick={handleGetStarted}
              >
                <Play className="mr-3 h-6 w-6" />
                Start Learning for Free
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg rounded-2xl border-2"
                onClick={() => navigate('/impact-learn/guest')}
              >
                Try as Guest
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              How ImpactLearn Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to start your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 ${feature.color} ${feature.hoverColor} rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Making Real Impact
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of learners from around the world
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real people, real progress, real impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4 text-center">{testimonial.avatar}</div>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500">
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
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are building better futures through education
          </p>
          
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-xl rounded-2xl shadow-xl font-semibold"
            onClick={handleGetStarted}
          >
            Start Learning Today - It's Free!
          </Button>
          
          <div className="mt-6 text-purple-200">
            No credit card required • Works offline • Available in 25+ languages
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-2xl font-heading font-bold">ImpactLearn</h3>
          </div>
          
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Empowering marginalized communities through accessible, AI-powered education. 
            Learn in your language, at your pace, anywhere.
          </p>
          
          <div className="text-gray-500">
            © 2024 ImpactLearn. Made with ❤️ for global education equity.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ImpactLearnIndex;