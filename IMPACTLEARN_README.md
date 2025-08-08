# 🌍 ImpactLearn - AI-Assisted Learning for Marginalized Communities

ImpactLearn is a specialized learning platform designed specifically for marginalized communities with low literacy, limited internet access, and varying local languages. Built with **React + TypeScript**, **Tailwind CSS**, **Supabase**, and **DeepSeek AI**.

## 🎯 Mission

Democratize education by providing simple, visual, multilingual, and offline-friendly learning experiences that empower marginalized learners through bite-sized lessons, AI-assisted guidance, and community support.

## ✨ Key Features

### 🎓 **Accessible Learning Design**
- **Large, Visual Interface** - Icons and images instead of text-heavy sections
- **Voice Narration** - All content available with audio support
- **Simple Navigation** - Icon-based, intuitive interface
- **Multiple Languages** - AI-powered translation for 25+ local languages
- **Offline Support** - PWA functionality for areas with poor connectivity

### 🤖 **AI-Powered Features**
- **Voice-Based Q&A** - Ask questions in native language, get AI answers with speech
- **Automatic Translation** - All content available in multiple local languages
- **AI Quiz Creator** - Generate simple quizzes from lesson content
- **Confidence Feedback** - Encouraging, easy-to-understand AI feedback

### 📚 **Learning Content**
- **Microlearning** - 5-minute daily lessons
- **Story-Based Lessons** - Visual, narrative-driven content
- **Life Skills Focus** - Health, agriculture, financial literacy, digital literacy
- **Interactive Scenarios** - Role-play situations (e.g., "How to greet in English")

### 🤝 **Community Features**
- **Peer Learning Groups** - Chat-based with AI moderation
- **Local Mentor Matching** - Connect with experienced learners nearby
- **User-Generated Content** - AI refines and translates community knowledge
- **Progress Sharing** - Printable/shareable certificates

### 🎮 **Gamification**
- **Badges & Stars** - Visual achievement system
- **Streak Rewards** - Daily learning incentives
- **Progress Tracking** - Colorful, visual progress indicators
- **Certificates** - Printable achievements for skill completion

## 🛠️ Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type safety
- **Tailwind CSS** with large, accessible design tokens
- **shadcn/ui** components optimized for low-literacy users
- **PWA Support** for offline functionality
- **Responsive Design** mobile-first approach

### **Backend & Database**
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** with specialized schema for learning content
- **Row Level Security** for data protection
- **Real-time subscriptions** for group messaging

### **AI Integration**
- **DeepSeek AI** for natural language processing
- **Web Speech API** for voice recognition and synthesis
- **Custom AI service** with error handling and fallbacks
- **Sentiment Analysis** for community moderation

### **Accessibility Features**
- **WCAG 2.1 AA Compliance**
- **High Contrast Mode**
- **Large Touch Targets** (minimum 44px)
- **Screen Reader Support**
- **Keyboard Navigation**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- DeepSeek AI API key

### Installation

1. **Clone and install**
```bash
git clone https://github.com/your-username/impactlearn.git
cd impactlearn
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# DeepSeek AI Configuration
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

3. **Database setup**
```bash
# Run the ImpactLearn migration
supabase db push
```

4. **Start development**
```bash
npm run dev
```

Visit `http://localhost:8080/impact-learn`

## 📁 Project Structure

```
src/
├── pages/
│   ├── ImpactLearnIndex.tsx      # Landing page
│   ├── ImpactLearnAuth.tsx       # Authentication
│   ├── ImpactLearnDashboard.tsx  # Main dashboard
│   └── ImpactLearnGuest.tsx      # Guest mode
├── components/
│   └── learn/
│       ├── VoiceQA.tsx           # Voice Q&A component
│       ├── LessonViewer.tsx      # Lesson display
│       └── SimpleQuizCreator.tsx # Quiz generator
├── services/
│   └── aiService.ts              # AI integration
└── hooks/
    └── useAI.ts                  # AI functionality hooks
```

## 🎯 Core User Journeys

### **New Learner Journey**
1. **Landing Page** - Simple, visual introduction
2. **Guest Mode** - Try features without signup
3. **Easy Registration** - Email/phone with large buttons
4. **Onboarding** - Language selection and simple tutorial
5. **First Lesson** - Guided, voice-narrated experience

### **Daily Learning Flow**
1. **Dashboard** - Visual progress and today's lesson
2. **5-Minute Lesson** - Story-based, interactive content
3. **Practice Quiz** - Simple, encouraging assessment
4. **Voice Q&A** - Ask questions in native language
5. **Progress Celebration** - Badges and streak rewards

### **Community Engagement**
1. **Find Local Group** - Location-based matching
2. **Join Discussions** - AI-moderated chat
3. **Mentor Connection** - Skill-based pairing
4. **Share Progress** - Celebrate achievements

## 🌐 Multilingual Support

### **Supported Languages**
- English, Spanish, French, Arabic, Hindi
- Swahili, Portuguese, Mandarin, Bengali, Urdu
- And 15+ more regional languages

### **AI Translation Features**
- **Content Translation** - All lessons available in local languages
- **Voice Support** - Text-to-speech in native languages
- **Q&A Translation** - Ask in any language, get answers translated
- **Community Translation** - Real-time message translation

## 📱 Offline & Low-Bandwidth Features

### **Progressive Web App (PWA)**
- **Offline Lesson Access** - Download lessons for offline use
- **Service Worker** - Cache critical resources
- **Background Sync** - Upload progress when online
- **App-like Experience** - Install on mobile devices

### **Bandwidth Optimization**
- **Compressed Images** - WebP format with fallbacks
- **Audio-First Content** - Reduce visual data usage
- **Lazy Loading** - Load content as needed
- **SMS Integration** - Optional lesson delivery via SMS

## 🎨 Design Principles

### **Low-Literacy Design**
- **Visual Hierarchy** - Clear, simple layouts
- **Icon Communication** - Universal symbols over text
- **Color Coding** - Consistent color meanings
- **Large Typography** - Minimum 18px font size
- **Touch-Friendly** - Large buttons and touch targets

### **Cultural Sensitivity**
- **Local Context** - Region-appropriate examples
- **Cultural Colors** - Respectful color choices
- **Inclusive Imagery** - Diverse representation
- **Local Languages** - Native language support

## 📊 Database Schema

### **Core Tables**
- **lessons** - Learning content with multilingual support
- **user_progress** - Individual learning tracking
- **learning_groups** - Community groups and discussions
- **mentor_matches_enhanced** - AI-powered mentor pairing
- **user_streaks** - Gamification and achievement tracking

### **Key Features**
- **JSONB Content** - Flexible lesson structure
- **Multilingual Fields** - Language-specific content
- **Progress Tracking** - Detailed learning analytics
- **Community Features** - Groups, messages, mentorship

## 🚀 Deployment

### **Netlify Deployment**
```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### **Environment Variables**
Set in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DEEPSEEK_API_KEY`
- `VITE_DEEPSEEK_API_URL`

## 🤝 Contributing

### **Development Guidelines**
- **Accessibility First** - Test with screen readers
- **Mobile-First** - Design for small screens
- **Performance** - Optimize for slow connections
- **Internationalization** - Support RTL languages
- **User Testing** - Test with target communities

### **Code Standards**
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Consistent formatting
- **Component Testing** - Test accessibility features

## 📈 Impact Metrics

### **Learning Outcomes**
- **Completion Rates** - Track lesson completion
- **Retention** - Daily/weekly active users
- **Progress Speed** - Time to skill mastery
- **Community Engagement** - Group participation

### **Accessibility Metrics**
- **Device Compatibility** - Support for older devices
- **Bandwidth Usage** - Data consumption tracking
- **Offline Usage** - Offline session analytics
- **Language Distribution** - Usage by language

## 🌟 Success Stories

> *"I learned English in 3 months using ImpactLearn! The voice lessons helped me practice speaking, and now I can help my children with homework."* - **Maria Santos, Philippines**

> *"Perfect for our village where internet is slow. I can download lessons and learn even when offline."* - **Priya Sharma, India**

> *"The simple design makes it easy to use. My grandmother is learning to read at age 65!"* - **Ahmed Hassan, Egypt**

## 📜 License

MIT License - Free to use, modify, and distribute for educational purposes.

## 🙏 Acknowledgments

- **DeepSeek AI** - Multilingual AI capabilities
- **Supabase** - Scalable backend infrastructure
- **Web Speech API** - Voice recognition and synthesis
- **Community Partners** - Local organizations and educators
- **Beta Testers** - Learners from marginalized communities worldwide

## 🌍 Vision

ImpactLearn represents the future of inclusive education - where technology breaks down barriers of literacy, language, and connectivity to make quality education accessible to everyone, everywhere. By combining AI-powered personalization with community-driven learning, we're creating a platform where every learner can build a better future through education.

---

**Ready to make education accessible for all?** 
[Try ImpactLearn](https://your-deployment-url.netlify.app/impact-learn) | [Join our Mission](https://github.com/your-username/impactlearn/discussions)