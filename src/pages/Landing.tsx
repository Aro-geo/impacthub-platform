import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  FileQuestion,
  GraduationCap,
  Accessibility,
  Leaf,
  Users,
  MessageSquare,
  ShieldCheck,
  Zap,
  BookOpen,
  Mic,
  ChartLine,
  Globe,
  Award
} from 'lucide-react';

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  href,
  badge,
  color,
  bg
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  badge?: string;
  color?: string;
  bg?: string;
}) => {
  const navigate = useNavigate();
  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(href)}>
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg ${bg || 'bg-blue-50'} flex items-center justify-center mb-4`}>
          <Icon className={`h-6 w-6 ${color || 'text-blue-600'}`} />
        </div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const Stat = ({ label, value, Icon }: { label: string; value: string; Icon: any }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
      <Icon className="h-7 w-7 text-white" />
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-blue-100">{label}</div>
  </div>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  type TabKey = 'education' | 'accessibility' | 'sustainability' | 'community';
  const [activeTab, setActiveTab] = useState<TabKey>('education');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const existingFeatureTitles = new Set<string>([
    'Learning Path Generator',
    'AI Quiz Creator',
    'Simple Lessons',
    'Voice Practice',
    'Community & Mentorship',
    'Impact Calculator'
  ]);

  const rawFeatures: Record<TabKey, Array<{ icon: string; title: string; desc: string; details: string }>> = {
    education: [
      { icon: '🎯', title: 'Learning Path Generator', desc: 'AI creates personalized curricula based on your learning style, pace, and goals', details: 'Adapts in real-time based on performance and interests' },
      { icon: '✅', title: 'Quiz Creator', desc: 'Transforms any lesson content into interactive, adaptive assessments', details: 'Multiple formats: multiple choice, short answer, problem-solving' },
      { icon: '🆘', title: 'Homework Helper', desc: 'Step-by-step explanations for any academic question without just giving answers', details: 'Teaches the method, builds understanding, encourages critical thinking' },
      { icon: '📖', title: 'Simple Lessons', desc: 'Visual, accessible learning materials for all literacy levels', details: 'High visual-to-text ratio, simple language, clear structure' }
    ],
    accessibility: [
      { icon: '🔊', title: 'Text-to-Speech', desc: 'Browser-native speech synthesis with multiple voice options', details: 'Perfect for visual learners and dyslexic students' },
      { icon: '🎙️', title: 'Speech-to-Text', desc: 'Real-time voice recognition for hands-free input and dictation', details: 'Great for students with mobility challenges' },
      { icon: '🌍', title: 'Language Translator', desc: 'Multi-language support for global accessibility', details: 'Learn in your native language, expand to English' },
      { icon: '🖼️', title: 'Alt Text Generator', desc: 'AI-powered image descriptions for visual content', details: 'Screen reader friendly, describes context not just content' }
    ],
    sustainability: [
      { icon: '📊', title: 'Impact Calculator', desc: 'Quantifies environmental benefits of user actions', details: 'See CO2 saved, trees planted, water conserved' },
      { icon: '🌱', title: 'Eco Advisor', desc: 'Location-specific sustainability recommendations', details: 'Personalized tips based on where you live' },
      { icon: '♻️', title: 'Waste Classifier', desc: 'AI-powered waste sorting and disposal guidance', details: 'Take a photo, get instant recycling instructions' },
      { icon: '🌿', title: 'Green Streaks', desc: 'Track daily sustainable habits and earn eco-badges', details: 'Gamified environmental action' }
    ],
    community: [
      { icon: '🤝', title: 'Mentorship Matcher', desc: 'AI compatibility analysis for perfect mentor-mentee pairing', details: 'Matches based on goals, interests, availability' },
      { icon: '💼', title: 'Opportunity Engine', desc: 'Personalized job and volunteer recommendations', details: 'Curated opportunities that match your skills' },
      { icon: '💡', title: 'Idea Evaluator', desc: 'AI feedback and scoring for community proposals', details: 'Get constructive feedback to improve your ideas' },
      { icon: '❤️', title: 'Sentiment Analysis', desc: 'Promotes positive community interactions', details: 'Detects and encourages respectful dialogue' }
    ]
  };

  const tabConfig: Record<TabKey, { label: string; color: string }> = {
    education: { label: 'Education', color: 'from-blue-600 to-blue-700' },
    accessibility: { label: 'Accessibility', color: 'from-purple-600 to-purple-700' },
    sustainability: { label: 'Sustainability', color: 'from-green-600 to-green-700' },
    community: { label: 'Community', color: 'from-pink-600 to-pink-700' }
  };

  const filteredFeatures = (Object.keys(rawFeatures) as TabKey[]).reduce((acc, key) => {
    acc[key] = rawFeatures[key].filter(f => !existingFeatureTitles.has(f.title));
    return acc;
  }, {} as Record<TabKey, Array<{ icon: string; title: string; desc: string; details: string }>>);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/impacthub-hero.svg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/50 to-white/20 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-800/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 md:py-24">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-10 items-center">
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 shadow text-blue-700 text-xs font-medium mb-4">
                Complete Learning & Accessibility Platform
              </div>
              <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-foreground">
                Learning For Every Student
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                AI-powered personalized learning + accessibility tools + community impact. One platform helping every student succeed, regardless of background or ability.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="px-8 w-full sm:w-auto" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
                <Button size="lg" className="w-full sm:w-auto" variant="outline" onClick={() => navigate('/ai-dashboard')}>
                  Explore AI Tools
                </Button>
              </div>
              
            </div>
            
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold">Everything You Need to Learn</h2>
            <p className="text-muted-foreground mt-2">From simple lessons to advanced AI tools</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Brain}
              title="Learning Path Generator"
              description="Get tailored curricula that adapt to your skills and interests."
              href="/ai-dashboard"
              badge="AI"
              color="text-blue-600"
              bg="bg-blue-50 dark:bg-blue-900/20"
            />
            <FeatureCard
              icon={FileQuestion}
              title="AI Quiz Creator"
              description="Turn any text into interactive quizzes with instant feedback."
              href="/ai-dashboard"
              badge="AI"
              color="text-purple-600"
              bg="bg-purple-50 dark:bg-purple-900/20"
            />
            <FeatureCard
              icon={GraduationCap}
              title="Simple Lessons"
              description="Bite‑size lessons with visuals and voice narration for all learners."
              href="/simple-lessons"
              badge="Learn"
              color="text-green-600"
              bg="bg-green-50 dark:bg-green-900/20"
            />
            <FeatureCard
              icon={Mic}
              title="Voice Practice"
              description="Practice speaking and listening with AI‑powered feedback."
              href="/simple-lessons"
              badge="Practice"
              color="text-pink-600"
              bg="bg-pink-50 dark:bg-pink-900/20"
            />
            <FeatureCard
              icon={Users}
              title="Community & Mentorship"
              description="Join discussions, find mentors, and learn together."
              href="/community"
              badge="Community"
              color="text-orange-600"
              bg="bg-orange-50 dark:bg-orange-900/20"
            />
            <FeatureCard
              icon={Leaf}
              title="Impact Calculator"
              description="Track sustainability actions and CO₂ savings."
              href="/ai-dashboard"
              badge="Impact"
              color="text-emerald-600"
              bg="bg-emerald-50 dark:bg-emerald-900/20"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Three steps to learning with impact</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Choose Your Goal
                </CardTitle>
                <CardDescription>Pick subjects, skills, or interests</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Select from simple lessons or advanced AI tools depending on your needs.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Get Your Plan
                </CardTitle>
                <CardDescription>AI builds a personalized path</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Real‑time streaming results guide your next best steps.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine className="h-5 w-5 text-green-600" />
                  Learn & Track
                </CardTitle>
                <CardDescription>Practice, measure, and celebrate progress</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Earn streaks and achievements as you learn and contribute.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-heading font-bold text-center mb-6">More AI‑Powered Features</h3>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {(Object.keys(tabConfig) as TabKey[]).map((key) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setExpandedFeature(null); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border \
                  ${activeTab === key ? 'bg-gradient-to-r ' + tabConfig[key].color + ' text-white border-transparent' : 'bg-background text-foreground border-muted hover:bg-muted/40'}`}
              >
                {tabConfig[key].label}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFeatures[activeTab].map((feature, idx) => (
              <div
                key={feature.title}
                onClick={() => setExpandedFeature(expandedFeature === idx ? null : idx)}
                className={`p-5 rounded-xl border cursor-pointer transition-colors \
                  ${expandedFeature === idx ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-muted hover:border-blue-600'}`}
                role="button"
                aria-expanded={expandedFeature === idx}
              >
                <div className="text-3xl mb-2" aria-hidden>{feature.icon}</div>
                <div className="font-semibold text-foreground mb-1">{feature.title}</div>
                <div className="text-sm text-muted-foreground">{feature.desc}</div>
                {expandedFeature === idx && (
                  <div className="mt-3 pt-3 border-t text-sm text-blue-700 dark:text-blue-300">
                    ✓ {feature.details}
                  </div>
                )}
              </div>
            ))}
            {filteredFeatures[activeTab].length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground">
                These highlights are showcased above. Choose another category.
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-16 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 md:grid-cols-3 mb-12">
            <div>
              <div className="text-xl font-bold mb-2">ImpactHub</div>
              <p className="text-sm text-muted-foreground">AI-powered learning for every student</p>
            </div>
            <div>
              <div className="font-semibold mb-3">Features</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Education</li>
                <li>Accessibility</li>
                <li>Sustainability</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3">For Students</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Start Learning</li>
                <li>Find Mentors</li>
                <li>Opportunities</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 ImpactHub. Learning without barriers for every student.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

