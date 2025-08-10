import { supabase } from '@/integrations/supabase/client';

export const seedSampleData = async () => {
    try {
        console.log('Starting to seed sample data...');

        // Check if we already have lessons
        const { count: existingLessons } = await supabase
            .from('simple_lessons')
            .select('*', { count: 'exact', head: true });

        if (existingLessons && existingLessons > 5) {
            console.log('Sample data already exists, skipping seed.');
            return;
        }

        // Get subjects
        const { data: subjects } = await supabase
            .from('subjects')
            .select('*');

        if (!subjects || subjects.length === 0) {
            console.log('No subjects found, cannot seed lessons.');
            return;
        }

        // Sample lessons for each subject
        const sampleLessons = [
            // English Language lessons
            {
                title: 'Basic Greetings and Introductions',
                description: 'Learn how to greet people and introduce yourself in English.',
                content: `# Basic Greetings and Introductions

## Learning Objectives
- Master common English greetings
- Learn how to introduce yourself
- Practice basic conversation starters

## Common Greetings
- Hello / Hi
- Good morning / Good afternoon / Good evening
- How are you?
- Nice to meet you

## Introducing Yourself
- My name is...
- I am from...
- I work as...
- I am learning English

## Practice Exercises
Try using these phrases in your daily conversations!`,
                subject_name: 'English Language',
                difficulty_level: 'beginner',
                duration_minutes: 15,
                order_index: 1
            },
            {
                title: 'Numbers and Counting',
                description: 'Learn numbers 1-100 and basic counting in English.',
                content: `# Numbers and Counting

## Learning Objectives
- Count from 1 to 100
- Learn ordinal numbers
- Practice using numbers in context

## Cardinal Numbers (1-20)
1 - one, 2 - two, 3 - three, 4 - four, 5 - five
6 - six, 7 - seven, 8 - eight, 9 - nine, 10 - ten
11 - eleven, 12 - twelve, 13 - thirteen, 14 - fourteen, 15 - fifteen
16 - sixteen, 17 - seventeen, 18 - eighteen, 19 - nineteen, 20 - twenty

## Larger Numbers
30 - thirty, 40 - forty, 50 - fifty, 60 - sixty, 70 - seventy
80 - eighty, 90 - ninety, 100 - one hundred

## Practice
Count objects around you and practice saying the numbers out loud!`,
                subject_name: 'English Language',
                difficulty_level: 'beginner',
                duration_minutes: 20,
                order_index: 2
            },
            // Digital Literacy lessons
            {
                title: 'Introduction to Computers',
                description: 'Learn the basic parts of a computer and how to use them.',
                content: `# Introduction to Computers

## Learning Objectives
- Identify computer parts
- Understand basic computer operations
- Learn about input and output devices

## Main Computer Parts
- **Monitor**: The screen that displays information
- **Keyboard**: Used for typing
- **Mouse**: Used for pointing and clicking
- **CPU**: The "brain" of the computer

## Basic Operations
- Turning on/off the computer
- Using the mouse to click and drag
- Typing on the keyboard
- Opening and closing programs

## Safety Tips
- Always shut down properly
- Keep food and drinks away from the computer
- Handle equipment carefully`,
                subject_name: 'Digital Literacy',
                difficulty_level: 'beginner',
                duration_minutes: 25,
                order_index: 1
            },
            // Financial Literacy lessons
            {
                title: 'Understanding Money and Budgeting',
                description: 'Learn the basics of money management and creating a simple budget.',
                content: `# Understanding Money and Budgeting

## Learning Objectives
- Understand the value of money
- Learn to create a simple budget
- Identify needs vs wants

## What is Money?
Money is a tool we use to buy things we need and want. It comes in different forms:
- Cash (bills and coins)
- Bank accounts
- Digital payments

## Creating a Simple Budget
1. **Income**: Money you receive (salary, benefits)
2. **Expenses**: Money you spend
   - Fixed expenses (rent, utilities)
   - Variable expenses (food, entertainment)
3. **Savings**: Money you keep for the future

## Needs vs Wants
- **Needs**: Things you must have (food, shelter, healthcare)
- **Wants**: Things you would like to have (entertainment, luxury items)

## Budgeting Tips
- Track your spending
- Save a little each month
- Plan for unexpected expenses`,
                subject_name: 'Financial Literacy',
                difficulty_level: 'beginner',
                duration_minutes: 30,
                order_index: 1
            },
            // Health & Wellness lessons
            {
                title: 'Basic Nutrition and Healthy Eating',
                description: 'Learn about nutrition basics and how to make healthy food choices.',
                content: `# Basic Nutrition and Healthy Eating

## Learning Objectives
- Understand basic nutrition concepts
- Learn about food groups
- Make healthier food choices

## Food Groups
1. **Fruits and Vegetables**: Provide vitamins and minerals
2. **Grains**: Give you energy (rice, bread, pasta)
3. **Proteins**: Help build muscles (meat, fish, beans)
4. **Dairy**: Strengthen bones (milk, cheese, yogurt)
5. **Fats**: Needed in small amounts (oils, nuts)

## Healthy Eating Tips
- Eat a variety of foods
- Drink plenty of water
- Limit sugary and processed foods
- Eat regular meals

## Reading Food Labels
- Check serving sizes
- Look at calories
- Check for added sugars
- Look for whole grain options

## Meal Planning
- Plan meals ahead of time
- Include foods from all groups
- Prepare healthy snacks`,
                subject_name: 'Health & Wellness',
                difficulty_level: 'beginner',
                duration_minutes: 25,
                order_index: 1
            },
            // Life Skills lessons
            {
                title: 'Time Management and Organization',
                description: 'Learn how to manage your time effectively and stay organized.',
                content: `# Time Management and Organization

## Learning Objectives
- Learn to prioritize tasks
- Create effective schedules
- Develop organizational systems

## Why Time Management Matters
- Reduces stress
- Increases productivity
- Helps achieve goals
- Creates work-life balance

## Time Management Techniques
1. **Make a To-Do List**: Write down what you need to do
2. **Prioritize**: Decide what's most important
3. **Set Deadlines**: Give yourself time limits
4. **Break Big Tasks**: Divide large projects into smaller steps

## Organization Tips
- Keep a calendar
- Use reminders
- Have a designated place for important items
- Clean and organize regularly

## Creating a Daily Schedule
- Wake up at the same time
- Plan your most important tasks first
- Include breaks
- Set aside time for unexpected things`,
                subject_name: 'Life Skills',
                difficulty_level: 'beginner',
                duration_minutes: 20,
                order_index: 1
            }
        ];

        // Insert lessons
        for (const lessonData of sampleLessons) {
            const subject = subjects.find(s => s.name === lessonData.subject_name);
            if (!subject) continue;

            // Assign grade based on subject and difficulty
            let gradeLevel = 6; // default
            if (lessonData.difficulty_level === 'beginner') {
                gradeLevel = lessonData.subject_name === 'English Language' ? 3 : 4;
            } else if (lessonData.difficulty_level === 'intermediate') {
                gradeLevel = 7;
            } else if (lessonData.difficulty_level === 'advanced') {
                gradeLevel = 10;
            }

            const { data: lesson, error: lessonError } = await supabase
                .from('simple_lessons')
                .insert({
                    title: lessonData.title,
                    description: lessonData.description,
                    content: lessonData.content,
                    subject_id: subject.id,
                    difficulty_level: lessonData.difficulty_level,
                    duration_minutes: lessonData.duration_minutes,
                    order_index: lessonData.order_index,
                    grade: gradeLevel,
                    is_published: true
                })
                .select()
                .single();

            if (lessonError) {
                console.error('Error inserting lesson:', lessonError);
                continue;
            }

            // Add sample quizzes for each lesson
            const sampleQuizzes = [
                {
                    question: `What is the main topic of the "${lessonData.title}" lesson?`,
                    options: [
                        lessonData.title.split(' ')[0] + ' basics',
                        'Advanced techniques',
                        'Professional certification',
                        'None of the above'
                    ],
                    correct_answer: 0,
                    explanation: `This lesson focuses on ${lessonData.title.toLowerCase()} as indicated in the title and learning objectives.`,
                    order_index: 1
                },
                {
                    question: 'How long is this lesson designed to take?',
                    options: [
                        '5 minutes',
                        `${lessonData.duration_minutes} minutes`,
                        '1 hour',
                        '2 hours'
                    ],
                    correct_answer: 1,
                    explanation: `This lesson is designed to take approximately ${lessonData.duration_minutes} minutes to complete.`,
                    order_index: 2
                }
            ];

            for (const quiz of sampleQuizzes) {
                const { error: quizError } = await supabase
                    .from('lesson_quizzes')
                    .insert({
                        lesson_id: lesson.id,
                        question: quiz.question,
                        options: quiz.options,
                        correct_answer: quiz.correct_answer,
                        explanation: quiz.explanation,
                        order_index: quiz.order_index
                    });

                if (quizError) {
                    console.error('Error inserting quiz:', quizError);
                }
            }
        }

        console.log('Sample data seeded successfully!');
    } catch (error) {
        console.error('Error seeding sample data:', error);
    }
};

// Function to create sample community posts
export const seedCommunityPosts = async (userId: string) => {
    try {
        const { data: subjects } = await supabase
            .from('subjects')
            .select('*');

        if (!subjects) return;

        const samplePosts = [
            {
                title: 'Welcome to the Learning Community!',
                content: 'Hello everyone! Welcome to our learning community. This is a place where we can all help each other learn and grow. Feel free to ask questions, share resources, and connect with fellow learners. What are you most excited to learn about?',
                post_type: 'announcement',
                subject_id: null,
                is_featured: true,
                upvotes: 8
            },
            {
                title: 'Tips for Learning English as a Second Language',
                content: 'I\'ve been learning English for a few months now and wanted to share some tips that have helped me:\n\n1. Practice speaking every day, even if it\'s just to yourself\n2. Watch English movies with subtitles\n3. Keep a vocabulary journal\n4. Don\'t be afraid to make mistakes!\n\nWhat tips do you have for language learning?',
                post_type: 'discussion',
                subject_id: subjects.find(s => s.name === 'English Language')?.id,
                is_featured: false,
                upvotes: 12
            },
            {
                title: 'Question about Computer Basics',
                content: 'I\'m just starting to learn about computers and I\'m confused about the difference between RAM and storage. Can someone explain this in simple terms? Thanks!',
                post_type: 'question',
                subject_id: subjects.find(s => s.name === 'Digital Literacy')?.id,
                is_featured: false,
                upvotes: 5
            },
            {
                title: 'Free Budgeting Apps Recommendation',
                content: 'I found some great free apps that help with budgeting and wanted to share them with the community:\n\n1. Mint - Great for tracking expenses\n2. YNAB (You Need A Budget) - Excellent for planning\n3. PocketGuard - Simple and easy to use\n\nHas anyone tried these? What other budgeting tools do you recommend?',
                post_type: 'resource',
                subject_id: subjects.find(s => s.name === 'Financial Literacy')?.id,
                is_featured: true,
                upvotes: 15
            }
        ];

        for (const post of samplePosts) {
            const { error } = await supabase
                .from('community_posts')
                .insert({
                    title: post.title,
                    content: post.content,
                    post_type: post.post_type,
                    subject_id: post.subject_id,
                    user_id: userId,
                    upvotes: post.upvotes,
                    is_featured: post.is_featured
                });

            if (error) {
                console.error('Error inserting community post:', error);
            }
        }

        console.log('Community posts seeded successfully!');
    } catch (error) {
        console.error('Error seeding community posts:', error);
    }
};