
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, ValidationError } from '@formspree/react';
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

import Navigation from '@/components/Navigation';
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
      category: 'Simple Lessons',
      icon: BookOpen,
      color: 'bg-purple-500',
      features: [
        { name: 'Visual Learning', desc: 'Image-rich easy lessons', icon: BookOpen },
        { name: 'Self-paced Progress', desc: 'Learn at your own speed', icon: TrendingUp },
        { name: 'Basic Skills', desc: 'Focus on essential concepts', icon: GraduationCap },
        { name: 'Offline Access', desc: 'Learn without internet', icon: Zap }
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
    { icon: Users, number: '10K+', label: 'Global Learners' },
    { icon: Globe, number: '25+', label: 'Languages' },
    { icon: BookOpen, number: '500+', label: 'AI-Enhanced Lessons' },
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
      name: 'John Esekon',
      location: 'Kenya',
      text: 'The visual lessons helped me understand key concepts. Learning at my own pace made all the difference.',
      avatar: '👨‍🎓',
      feature: 'Simple Lessons'
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
              Transforming education through AI-powered learning pathways. Simple lessons,
              personalized guidance, and community support to help you achieve your goals.
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
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-20 px-4 bg-background">
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
              <div key={index} className="transition-all duration-300 hover:scale-105 p-8 backdrop-blur-sm bg-transparent border border-muted-foreground/10 rounded-xl">
                <div className={`w-16 h-16 ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <platform.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-4 text-center">
                  {platform.category}
                </h3>
                <div className="space-y-3">
                  {platform.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-transparent border border-muted-foreground/20 rounded-lg hover:bg-background/50 dark:hover:bg-background/10 transition-colors">
                      <feature.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold text-foreground text-sm">{feature.name}</div>
                        <div className="text-muted-foreground text-xs">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Access Buttons - Removed as requested, will only be accessible after login */}

        </div>
      </section>

      {/* Impact Stats */}
      <section id="impact" className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
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
      <section className="py-20 px-4 bg-transparent">
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
              <div key={index} className="p-8 text-center rounded-lg transition-all backdrop-blur-sm bg-transparent border border-muted-foreground/10">
                <div className="text-6xl mb-4">{testimonial.avatar}</div>
                <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions or want to join our mission? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <a 
                        href="mailto:impacthub_platform@hotmail.com" 
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        impacthub_platform@hotmail.com
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">WhatsApp</p>
                      <a 
                        href="https://wa.me/254726796020" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 dark:text-green-400 hover:underline"
                      >
                        Contact us
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Location</p>
                      <p className="text-muted-foreground">Global Community</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
                Send us a Message
              </h3>
              
              {(() => {
                const [formState, handleSubmit] = useForm("xandangw");
                
                if (formState.succeeded) {
                  return (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Thank You!</h4>
                      <p className="text-muted-foreground">Your message has been sent successfully. We'll get back to you soon.</p>
                    </div>
                  );
                }
                
                return (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Your first name"
                          required
                        />
                        <ValidationError prefix="First Name" field="firstName" errors={formState.errors} />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Your last name"
                          required
                        />
                        <ValidationError prefix="Last Name" field="lastName" errors={formState.errors} />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="index-email" className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        id="index-email"
                        name="email"
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="your@email.com"
                        required
                      />
                      <ValidationError prefix="Email" field="email" errors={formState.errors} />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Subject
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="What's this about?"
                        required
                      />
                      <ValidationError prefix="Subject" field="subject" errors={formState.errors} />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Tell us how we can help you..."
                        required
                      ></textarea>
                      <ValidationError prefix="Message" field="message" errors={formState.errors} />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={formState.submitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      {formState.submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                );
              })()}
            </div>
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
                Transforming education through AI-powered learning pathways and simple lessons for everyone.
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
              <h4 className="font-semibold mb-4">Simple Lessons</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Visual Learning</li>
                <li>Self-paced Progress</li>
                <li>Basic Skills</li>
                <li>Offline Access</li>
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
