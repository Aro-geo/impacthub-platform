# Simple Lesson Dashboard

A comprehensive e-learning platform designed for learners to browse lessons, practice skills, track progress, and engage in a learning community.

## Features

### 1. Overview Section
- **Progress Tracking**: Visual progress bar showing percentage of completed lessons
- **Summary Statistics**: 
  - Total lessons completed
  - Total quizzes attempted
  - Current learning streak (days)
  - Badges earned
- **Continue Learning**: Quick access to resume in-progress lessons
- **Personalized Suggestions**: AI-recommended lessons based on progress and preferences
- **Motivational Messages**: Dynamic encouragement based on learning progress

### 2. Lessons Section
- **Comprehensive Lesson Browser**: Grid and list view options
- **Advanced Filtering**:
  - Filter by subject
  - Filter by difficulty level (beginner, intermediate, advanced)
  - Search by title, description, or subject
  - Sort by title, difficulty, or duration
- **Lesson Cards Display**:
  - Lesson title and description
  - Subject badge with color coding
  - Difficulty level indicators
  - Duration in minutes
  - Progress status (Not Started, In Progress, Completed)
  - Bookmark functionality
- **Interactive Features**:
  - Hover previews
  - One-click lesson start
  - Progress tracking
  - Bookmark lessons for later

### 3. Practice Section
- **Quiz Management**: Access to all lesson-linked quizzes
- **Practice Modes**:
  - Review Mode: Study at your own pace
  - Timed Practice: Challenge yourself with time limits
  - Random Questions: Mixed practice across subjects
- **Performance Analytics**:
  - Total quiz attempts
  - Correct answers count
  - Average score percentage
  - Best streak tracking
- **Subject-Based Practice**: Filter quizzes by specific subjects
- **Recent Attempts**: View your latest quiz performance with retry options
- **Success Rate Tracking**: Visual progress indicators for each subject

### 4. Community Section
- **Discussion Forum**: Subject-grouped discussions
- **Post Types**:
  - Questions: Ask for help from the community
  - Discussions: General topic conversations
  - Resources: Share helpful materials
  - Announcements: Important updates (featured posts)
- **Community Features**:
  - Upvote/downvote system
  - Reply to posts
  - Follow specific lessons for updates
  - User profiles with avatars
- **Moderation Tools**:
  - Featured posts highlighting
  - Community stats tracking
  - Active member recognition

## Database Schema

### Core Tables
- **subjects**: Master list of learning subjects
- **simple_lessons**: Lesson metadata and content
- **lesson_progress**: Individual learner progress tracking
- **lesson_quizzes**: Quiz questions linked to lessons
- **quiz_attempts**: User quiz attempt history
- **learning_streaks**: Daily learning streak tracking

### Community Tables
- **community_posts**: Forum posts and discussions
- **community_replies**: Replies to forum posts
- **post_upvotes**: Community engagement tracking
- **user_bookmarks**: Saved lessons for later

## Technical Features

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Screen reader friendly, keyboard navigation
- **Performance**: Lazy loading, optimized queries, caching
- **Offline Support**: Basic functionality works offline

### Data Management
- **Real-time Updates**: Progress saved automatically
- **Data Persistence**: All progress and preferences saved
- **Privacy**: Row-level security for user data
- **Scalability**: Optimized database queries and indexes

### Gamification
- **Streak Tracking**: Daily learning streaks with visual indicators
- **Badge System**: Achievements for milestones (every 5 lessons completed)
- **Progress Visualization**: Animated progress bars and completion indicators
- **Leaderboards**: Community engagement rankings

## Sample Data

The platform includes a comprehensive seeding system that creates:
- 5 core subjects (English Language, Digital Literacy, Financial Literacy, Health & Wellness, Life Skills)
- Sample lessons for each subject with rich content
- Quiz questions for each lesson
- Community posts and discussions
- User progress examples

## Getting Started

1. **Access the Dashboard**: Navigate to `/simple-lessons` when logged in
2. **Load Sample Data**: Click the "Load Sample Data" button in the header
3. **Start Learning**: Browse lessons, take quizzes, and engage with the community
4. **Track Progress**: Monitor your learning journey in the Overview section

## API Integration

The dashboard integrates with Supabase for:
- User authentication and profiles
- Real-time data synchronization
- File storage for lesson content
- Community features and moderation
- Analytics and progress tracking

## Customization

The platform is designed to be easily customizable:
- **Themes**: Light/dark mode support
- **Languages**: Multi-language support ready
- **Subjects**: Easy to add new learning subjects
- **Content**: Rich text editor for lesson content
- **Branding**: Customizable colors and logos

This Simple Lesson Dashboard provides a complete learning management system with modern UX/UX design, comprehensive features, and scalable architecture suitable for educational institutions, corporate training, or community learning initiatives.