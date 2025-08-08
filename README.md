# 🌍 ImpactHub AI — Unified AI-Powered Social Impact Platform

ImpactHub AI is the world's first comprehensive AI-powered social impact platform that combines advanced learning tools, accessibility features, and community empowerment in one unified experience. Built with **React + TypeScript**, **Tailwind CSS**, **Supabase**, and **DeepSeek AI**.

## 🎯 **Unified Platform Vision**

We've combined the power of advanced AI tools with simple, accessible learning to create one comprehensive platform that serves everyone - from tech-savvy users wanting cutting-edge AI features to marginalized communities needing simple, visual, voice-guided learning experiences.

## ✨ **Three Platforms in One**

### 🧠 **Advanced AI Tools Dashboard**
*For power users, educators, and organizations*
- **Learning Path Generator** - AI creates personalized curricula
- **Interactive Quiz Creator** - Generate assessments from any content
- **Homework Helper** - Step-by-step AI tutoring
- **Accessibility Tools** - Text-to-speech, translation, alt-text generation
- **Sustainability Calculator** - Environmental impact tracking
- **Mentorship Matcher** - AI-powered mentor-mentee pairing
- **Community Forum** - Smart discussions with sentiment analysis

### 📚 **Simple Learning Interface**
*For low-literacy users and marginalized communities*
- **Visual Lessons** - Icon-based, story-driven content
- **Voice Narration** - All content available with audio
- **Simple Navigation** - Large buttons, intuitive design
- **Offline Support** - PWA functionality for poor connectivity
- **Multilingual** - 25+ languages with AI translation
- **5-Minute Lessons** - Bite-sized, digestible content

### 🌍 **Unified Dashboard**
*Bringing everything together*
- **Single Sign-On** - One account for all features
- **Progress Tracking** - Unified learning analytics
- **Quick Actions** - Easy access to all tools
- **Adaptive Interface** - Switches between simple and advanced modes
- **Community Integration** - Connect across all user types

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- Vite for fast development
- React Router for navigation
- TanStack Query for data fetching

**Backend & Database:**
- Supabase (PostgreSQL + Auth + Real-time)
- Row Level Security (RLS) policies
- Database triggers and functions

**AI Integration:**
- DeepSeek AI API for natural language processing
- Web Speech API for accessibility features
- Custom AI service layer with error handling

**Deployment:**
- Netlify for frontend hosting
- Supabase for backend infrastructure
- Environment-based configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- DeepSeek AI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/impacthub-ai.git
cd impacthub-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# DeepSeek AI API Configuration
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

4. **Set up Supabase**
- Create a new Supabase project
- Run the migration file in `supabase/migrations/`
- Enable authentication providers

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 📁 Project Structure

```
src/
├── components/
│   ├── ai/                 # AI-powered components
│   │   ├── LearningPathGenerator.tsx
│   │   ├── QuizCreator.tsx
│   │   ├── HomeworkHelper.tsx
│   │   ├── AccessibilityTools.tsx
│   │   ├── SustainabilityCalculator.tsx
│   │   ├── MentorshipMatcher.tsx
│   │   └── CommunityForum.tsx
│   ├── ui/                 # Reusable UI components
│   └── ...                 # Other components
├── pages/
│   ├── Index.tsx           # Landing page
│   ├── Dashboard.tsx       # User dashboard
│   ├── AIDashboard.tsx     # AI tools dashboard
│   └── Auth.tsx            # Authentication
├── services/
│   └── aiService.ts        # AI API integration
├── hooks/
│   ├── useAI.ts           # AI functionality hooks
│   └── use-toast.ts       # Toast notifications
├── contexts/
│   └── AuthContext.tsx    # Authentication context
└── integrations/
    └── supabase/          # Supabase client & types
```

## 🎯 Core AI Features

### Education Tools
- **Learning Path Generator**: Creates personalized curricula based on user profile
- **Quiz Creator**: Transforms any content into interactive assessments
- **Homework Helper**: Provides step-by-step explanations for academic questions

### Accessibility Tools
- **Text-to-Speech**: Browser-native speech synthesis with voice selection
- **Speech-to-Text**: Real-time voice recognition for hands-free input
- **Language Translator**: Multi-language support for global accessibility
- **Alt Text Generator**: AI-powered image descriptions for visual content

### Sustainability Tools
- **Impact Calculator**: Quantifies environmental benefits of user actions
- **Eco Advisor**: Location-specific sustainability recommendations
- **Waste Classifier**: AI-powered waste sorting and disposal guidance

### Community Tools
- **Mentorship Matcher**: AI compatibility analysis for mentor-mentee pairing
- **Opportunity Engine**: Personalized job and volunteer recommendations
- **Idea Evaluator**: AI feedback and scoring for community proposals
- **Sentiment Analysis**: Promotes positive community interactions

## 🌐 Deployment

### Netlify Deployment

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Add environment variables** in Netlify dashboard
4. **Deploy** - automatic deployments on git push

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-key
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with these main entities:

- **profiles** - User information, roles, impact points, badges
- **posts** - Community forum discussions with categories
- **comments** - Threaded discussions on posts
- **goals** - Personal achievement tracking
- **resources** - Educational content library
- **events** - Community events and workshops
- **ideas** - Crowdsourced project proposals
- **mentorship_matches** - Mentor-mentee connections
- **volunteer_opportunities** - Community service listings

All tables include Row Level Security (RLS) policies for data protection.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test AI integrations thoroughly
- Ensure accessibility compliance

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DeepSeek AI** for powerful language model capabilities
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for utility-first styling
- **React** ecosystem for robust frontend development

## 🌟 Vision

ImpactHub AI represents the future of social impact technology - where artificial intelligence amplifies human potential to create positive change. By democratizing access to AI-powered tools for education, accessibility, sustainability, and community building, we're creating a platform where every user can make a measurable difference in the world.

---

**Ready to make an impact?** [Get Started](https://your-deployment-url.netlify.app) | [Join our Community](https://github.com/your-username/impacthub-ai/discussions)