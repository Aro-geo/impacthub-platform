-- Add sample lessons to simple_lessons table
-- Based on the actual table schema with INTEGER grade column (1-12)

DO $$
DECLARE
    english_id UUID;
    digital_id UUID;
    financial_id UUID;
    health_id UUID;
    life_id UUID;
BEGIN
    -- Get subject IDs (create them if they don't exist)
    INSERT INTO subjects (name, description) VALUES 
    ('English Language', 'Learn English language skills for communication')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO subjects (name, description) VALUES 
    ('Digital Literacy', 'Learn basic computer and internet skills')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO subjects (name, description) VALUES 
    ('Financial Literacy', 'Learn money management and financial planning')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO subjects (name, description) VALUES 
    ('Health & Wellness', 'Learn about health, nutrition, and wellness')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO subjects (name, description) VALUES 
    ('Life Skills', 'Learn essential life and social skills')
    ON CONFLICT (name) DO NOTHING;

    -- Get subject IDs
    SELECT id INTO english_id FROM subjects WHERE name = 'English Language';
    SELECT id INTO digital_id FROM subjects WHERE name = 'Digital Literacy';
    SELECT id INTO financial_id FROM subjects WHERE name = 'Financial Literacy';
    SELECT id INTO health_id FROM subjects WHERE name = 'Health & Wellness';
    SELECT id INTO life_id FROM subjects WHERE name = 'Life Skills';

    -- Insert sample lessons for English Language (Grade 1-3: Basic)
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published, grade) VALUES
    ('Basic English Greetings', 'Learn how to greet people in English and introduce yourself', 
     'In this lesson, you will learn common English greetings like "Hello", "Good morning", and "How are you?". You will also practice introducing yourself with "My name is..." and "I am from...".

## What You Will Learn:
- Common greetings: Hello, Hi, Good morning, Good afternoon, Good evening
- How to introduce yourself: "My name is...", "I am...", "Nice to meet you"
- Polite responses: "Nice to meet you too", "How are you?", "I am fine, thank you"

## Practice Activities:
1. Listen and repeat the greetings
2. Practice introducing yourself
3. Role-play meeting someone new', 
     english_id, 'beginner', 15, 1, true, 1),
    
    ('English Numbers 1-20', 'Learn to count and use numbers in English', 
     'Master counting from 1 to 20 in English. Learn how to use numbers in daily conversations, tell time, and express quantities.

## What You Will Learn:
- Numbers 1-10: one, two, three, four, five, six, seven, eight, nine, ten
- Numbers 11-20: eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty
- Using numbers in sentences: "I have three children", "It is five o''clock"

## Practice Activities:
1. Count from 1 to 20
2. Practice saying your age and phone number
3. Tell time using numbers', 
     english_id, 'beginner', 20, 2, true, 1),
    
    ('Family Members in English', 'Learn vocabulary for family relationships', 
     'Learn the English words for family members: mother, father, sister, brother, grandmother, grandfather, and more. Practice talking about your family.

## What You Will Learn:
- Immediate family: mother, father, sister, brother, son, daughter
- Extended family: grandmother, grandfather, aunt, uncle, cousin
- Family sentences: "This is my mother", "I have two sisters", "My father works"

## Practice Activities:
1. Name your family members
2. Describe your family tree
3. Talk about what your family members do', 
     english_id, 'beginner', 18, 3, true, 2),
    
    ('Basic English Conversations', 'Practice simple everyday conversations', 
     'Learn to have basic conversations in English. Practice asking for directions, ordering food, and making small talk with neighbors and friends.

## What You Will Learn:
- Asking for help: "Can you help me?", "Where is...?", "How much is...?"
- Ordering food: "I would like...", "Can I have...?", "Thank you"
- Small talk: "How is the weather?", "How is your family?", "Have a good day"

## Practice Activities:
1. Practice asking for directions
2. Role-play ordering food at a restaurant
3. Have a conversation with a neighbor', 
     english_id, 'intermediate', 25, 4, true, 3);

    -- Insert sample lessons for Digital Literacy (Grade 4-6: Intermediate)
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published, grade) VALUES
    ('Using a Smartphone Safely', 'Learn basic smartphone functions and safety', 
     'Discover how to use your smartphone safely. Learn about making calls, sending messages, and protecting your personal information online.

## What You Will Learn:
- Making and receiving phone calls
- Sending text messages (SMS)
- Connecting to Wi-Fi safely
- Protecting your personal information
- Understanding app permissions

## Safety Tips:
- Never share your passwords
- Be careful with unknown phone numbers
- Check app permissions before installing
- Keep your phone updated

## Practice Activities:
1. Make a phone call to a family member
2. Send a text message
3. Connect to Wi-Fi at home', 
     digital_id, 'beginner', 20, 1, true, 4),
    
    ('Internet Basics', 'Introduction to using the internet', 
     'Learn what the internet is and how to use it safely. Understand web browsers, search engines, and how to find reliable information online.

## What You Will Learn:
- What is the internet and how it works
- Using web browsers (Chrome, Safari, Firefox)
- Searching for information on Google
- Identifying reliable websites
- Understanding website addresses (URLs)

## Safety Guidelines:
- Look for secure websites (https://)
- Verify information from multiple sources
- Be careful with personal information
- Avoid clicking suspicious links

## Practice Activities:
1. Search for local weather information
2. Find a recipe online
3. Look up bus schedules or directions', 
     digital_id, 'beginner', 25, 2, true, 5),
    
    ('Email and Communication', 'Learn to send and receive emails', 
     'Master the basics of email communication. Learn to create an email account, send messages, and communicate professionally online.

## What You Will Learn:
- Creating an email account (Gmail, Yahoo, etc.)
- Writing and sending emails
- Replying to emails
- Adding attachments (photos, documents)
- Organizing your inbox

## Email Etiquette:
- Use clear subject lines
- Be polite and professional
- Check spelling before sending
- Reply promptly to important emails

## Practice Activities:
1. Create your first email account
2. Send an email to a family member
3. Reply to an email with a photo attachment', 
     digital_id, 'intermediate', 30, 3, true, 6);

    -- Insert sample lessons for Financial Literacy (Grade 7-9: Advanced Beginner)
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published, grade) VALUES
    ('Understanding Money', 'Basic concepts about money and currency', 
     'Learn the basics of money, including different denominations, how to count money, and the importance of saving for the future.

## What You Will Learn:
- Different types of money (coins and bills)
- Counting money accurately
- Making change when shopping
- The difference between needs and wants
- Why saving money is important

## Money Management Basics:
- Keep track of your money
- Count your money regularly
- Save some money each week
- Spend money on needs first, then wants

## Practice Activities:
1. Count different combinations of coins and bills
2. Practice making change for purchases
3. Create a simple savings goal', 
     financial_id, 'beginner', 15, 1, true, 7),
    
    ('Mobile Money Safety', 'Learn to use digital payments safely', 
     'Understand how mobile money works and how to use it safely. Learn about PINs, transaction limits, and how to avoid fraud.

## What You Will Learn:
- How mobile money works (M-Pesa, Airtel Money, etc.)
- Setting up your mobile money account
- Creating a strong PIN
- Sending and receiving money
- Checking your balance

## Safety Rules:
- Never share your PIN with anyone
- Always verify the recipient before sending money
- Keep your phone secure
- Check transaction messages carefully
- Report suspicious activity immediately

## Practice Activities:
1. Check your mobile money balance
2. Practice entering your PIN safely
3. Send a small amount to a trusted family member', 
     financial_id, 'beginner', 20, 2, true, 8),
    
    ('Basic Budgeting', 'Learn to manage your money with a simple budget', 
     'Create a simple budget to track your income and expenses. Learn how to prioritize spending and save money for important goals.

## What You Will Learn:
- What is a budget and why it''s important
- Tracking your income (money coming in)
- Tracking your expenses (money going out)
- The difference between fixed and variable expenses
- Setting aside money for savings

## Simple Budget Steps:
1. Write down all money you receive each month
2. List all your regular expenses (rent, food, transport)
3. Subtract expenses from income
4. Plan to save at least 10% if possible

## Practice Activities:
1. Create your first monthly budget
2. Track your expenses for one week
3. Find one area where you can save money', 
     financial_id, 'intermediate', 25, 3, true, 9),
    
    ('Starting a Small Business', 'Introduction to entrepreneurship', 
     'Learn the basics of starting a small business. Understand market research, business planning, and managing finances for your business.

## What You Will Learn:
- Identifying business opportunities in your community
- Understanding your customers and their needs
- Basic business planning
- Calculating costs and profits
- Managing business money separately from personal money

## Business Planning Steps:
1. Choose a business idea you are passionate about
2. Research if people want your product or service
3. Calculate how much money you need to start
4. Plan how you will find customers
5. Set realistic goals for your business

## Practice Activities:
1. Brainstorm three business ideas for your community
2. Interview potential customers about their needs
3. Calculate the cost of starting one business idea', 
     financial_id, 'advanced', 35, 4, true, 10);

    -- Insert sample lessons for Health & Wellness (Grade 10-12: Advanced)
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published, grade) VALUES
    ('Healthy Eating Basics', 'Learn about nutritious foods for your family', 
     'Discover the importance of eating fruits, vegetables, and balanced meals. Learn how to prepare healthy, affordable meals for your family.

## What You Will Learn:
- The five food groups and their importance
- How to create balanced meals
- Affordable sources of protein, vitamins, and minerals
- Meal planning for the week
- Safe food storage and preparation

## Healthy Eating Guidelines:
- Eat fruits and vegetables every day
- Include protein in each meal (beans, eggs, fish, meat)
- Choose whole grains when possible
- Drink plenty of clean water
- Limit sugar and processed foods

## Practice Activities:
1. Plan three balanced meals for your family
2. Visit a local market and identify healthy, affordable foods
3. Prepare one nutritious meal using local ingredients', 
     health_id, 'beginner', 18, 1, true, 10),
    
    ('Clean Water and Hygiene', 'Importance of clean water and personal hygiene', 
     'Learn about the importance of clean water, proper handwashing, and basic hygiene practices to keep your family healthy.

## What You Will Learn:
- Why clean water is essential for health
- How to make water safe for drinking
- Proper handwashing techniques
- Personal hygiene practices
- Keeping your home clean and healthy

## Water Safety Methods:
- Boil water for at least 1 minute
- Use water purification tablets
- Store clean water in covered containers
- Clean water containers regularly

## Hygiene Practices:
- Wash hands with soap for 20 seconds
- Brush teeth twice daily
- Bathe regularly
- Keep fingernails clean and short

## Practice Activities:
1. Demonstrate proper handwashing technique
2. Practice safe water storage methods
3. Create a family hygiene routine', 
     health_id, 'beginner', 15, 2, true, 11),
    
    ('Child Health and Nutrition', 'Keeping children healthy and well-nourished', 
     'Learn about proper nutrition for children, vaccination schedules, and when to seek medical help for common childhood illnesses.

## What You Will Learn:
- Nutritional needs of children at different ages
- Importance of breastfeeding and proper weaning
- Vaccination schedules and their importance
- Recognizing signs of malnutrition
- When to seek medical help for children

## Child Nutrition Guidelines:
- Breastfeed exclusively for first 6 months
- Introduce solid foods gradually after 6 months
- Ensure children eat from all food groups
- Monitor child''s growth and development
- Provide plenty of clean water

## Warning Signs to Watch:
- Persistent fever or cough
- Difficulty breathing
- Unusual tiredness or irritability
- Loss of appetite for several days
- Signs of dehydration

## Practice Activities:
1. Plan a week of meals for a young child
2. Learn to recognize signs of common childhood illnesses
3. Create a vaccination tracking chart', 
     health_id, 'intermediate', 22, 3, true, 11),
    
    ('Mental Health and Stress', 'Understanding and managing stress and mental health', 
     'Learn about mental health, how to recognize stress, and simple techniques for managing stress and maintaining emotional well-being.

## What You Will Learn:
- What is mental health and why it matters
- Common signs of stress and anxiety
- Simple stress management techniques
- The importance of social support
- When to seek help for mental health concerns

## Stress Management Techniques:
- Deep breathing exercises
- Regular physical activity
- Talking to trusted friends or family
- Getting enough sleep
- Taking time for activities you enjoy

## Building Mental Resilience:
- Practice gratitude daily
- Set realistic goals
- Learn to say no when overwhelmed
- Build strong relationships
- Seek help when needed

## Practice Activities:
1. Practice a 5-minute deep breathing exercise
2. Identify your personal stress triggers
3. Create a support network of trusted people you can talk to', 
     health_id, 'intermediate', 20, 4, true, 12);

    -- Insert sample lessons for Life Skills (Grade 1-12: All levels)
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published, grade) VALUES
    ('Time Management', 'Learn to organize your time effectively', 
     'Discover techniques for managing your time better. Learn to prioritize tasks, create schedules, and balance work and family life.

## What You Will Learn:
- How to prioritize important tasks
- Creating daily and weekly schedules
- Balancing work, family, and personal time
- Avoiding procrastination
- Making time for rest and relaxation

## Time Management Tips:
- Make a list of tasks each morning
- Do the most important tasks first
- Set specific times for different activities
- Learn to say no to less important requests
- Take breaks to avoid burnout

## Practice Activities:
1. Create a daily schedule for tomorrow
2. List your top 5 priorities for this week
3. Practice saying no politely to a request', 
     life_id, 'beginner', 20, 1, true, 6),
    
    ('Problem Solving Skills', 'Learn to solve everyday problems', 
     'Develop problem-solving skills for daily challenges. Learn to identify problems, think of solutions, and make good decisions.

## What You Will Learn:
- How to identify the real problem
- Brainstorming multiple solutions
- Evaluating the pros and cons of each solution
- Making decisions with confidence
- Learning from the results

## Problem-Solving Steps:
1. Clearly define the problem
2. Gather information about the situation
3. Think of at least 3 possible solutions
4. Consider the consequences of each solution
5. Choose the best solution and try it
6. Evaluate the results and learn

## Practice Activities:
1. Apply the problem-solving steps to a current challenge
2. Practice brainstorming solutions with family members
3. Make a decision about something you''ve been postponing', 
     life_id, 'intermediate', 25, 2, true, 8),
    
    ('Communication Skills', 'Improve your communication with others', 
     'Learn effective communication skills for family, work, and community. Practice active listening and clear expression of ideas.

## What You Will Learn:
- Active listening techniques
- How to express your ideas clearly
- Non-verbal communication (body language)
- Resolving conflicts peacefully
- Building rapport with others

## Good Communication Habits:
- Listen more than you speak
- Ask questions to understand better
- Use "I" statements instead of "you" statements
- Pay attention to body language
- Be respectful even when disagreeing

## Practice Activities:
1. Practice active listening with a family member
2. Have a difficult conversation using "I" statements
3. Observe and improve your body language', 
     life_id, 'intermediate', 22, 3, true, 9),
    
    ('Leadership in Your Community', 'Develop leadership skills for community involvement', 
     'Learn basic leadership skills to help in your community. Understand how to organize groups, lead meetings, and create positive change.

## What You Will Learn:
- What makes a good leader
- How to organize and lead meetings
- Building consensus and making group decisions
- Motivating others to participate
- Planning and implementing community projects

## Leadership Qualities:
- Listen to others'' ideas and concerns
- Be honest and trustworthy
- Take responsibility for your actions
- Encourage and support others
- Stay committed to your goals

## Community Leadership Steps:
1. Identify a need in your community
2. Find others who share your concern
3. Organize meetings to discuss solutions
4. Create an action plan together
5. Implement the plan step by step
6. Celebrate successes and learn from challenges

## Practice Activities:
1. Identify one problem in your community you''d like to help solve
2. Practice leading a family meeting or discussion
3. Volunteer to help with a community event or project', 
     life_id, 'advanced', 30, 4, true, 12);

END $$;

-- Add some sample quizzes for a few lessons
INSERT INTO lesson_quizzes (lesson_id, question, options, correct_answer, explanation, order_index)
SELECT 
    sl.id,
    'What is the most common English greeting?',
    '["Hello", "Goodbye", "Thank you", "Please"]'::jsonb,
    0,
    'Hello is the most common and universal English greeting used in most situations.',
    1
FROM simple_lessons sl 
WHERE sl.title = 'Basic English Greetings';

INSERT INTO lesson_quizzes (lesson_id, question, options, correct_answer, explanation, order_index)
SELECT 
    sl.id,
    'Why is it important to keep your mobile money PIN secret?',
    '["To remember it better", "To prevent fraud and theft", "It looks more professional", "The bank requires it"]'::jsonb,
    1,
    'Keeping your PIN secret prevents unauthorized access to your mobile money account and protects you from fraud.',
    1
FROM simple_lessons sl 
WHERE sl.title = 'Mobile Money Safety';

INSERT INTO lesson_quizzes (lesson_id, question, options, correct_answer, explanation, order_index)
SELECT 
    sl.id,
    'What should you eat every day for good health?',
    '["Only meat", "Only rice", "Fruits and vegetables", "Only bread"]'::jsonb,
    2,
    'Fruits and vegetables provide essential vitamins and nutrients that your body needs every day for good health.',
    1
FROM simple_lessons sl 
WHERE sl.title = 'Healthy Eating Basics';

INSERT INTO lesson_quizzes (lesson_id, question, options, correct_answer, explanation, order_index)
SELECT 
    sl.id,
    'What is the first step in solving a problem?',
    '["Choose a solution quickly", "Ask someone else to solve it", "Clearly define the problem", "Give up and try later"]'::jsonb,
    2,
    'The first step in problem-solving is to clearly define and understand what the real problem is.',
    1
FROM simple_lessons sl 
WHERE sl.title = 'Problem Solving Skills';

INSERT INTO lesson_quizzes (lesson_id, question, options, correct_answer, explanation, order_index)
SELECT 
    sl.id,
    'How long should you wash your hands with soap?',
    '["5 seconds", "10 seconds", "20 seconds", "1 minute"]'::jsonb,
    2,
    'You should wash your hands with soap for at least 20 seconds to effectively remove germs and bacteria.',
    1
FROM simple_lessons sl 
WHERE sl.title = 'Clean Water and Hygiene';