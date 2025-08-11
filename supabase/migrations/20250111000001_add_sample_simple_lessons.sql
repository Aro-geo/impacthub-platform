-- Add sample lessons to simple_lessons table
-- First, get the subject IDs
DO $$
DECLARE
    english_id UUID;
    digital_id UUID;
    financial_id UUID;
    health_id UUID;
    life_id UUID;
BEGIN
    -- Get subject IDs
    SELECT id INTO english_id FROM subjects WHERE name = 'English Language';
    SELECT id INTO digital_id FROM subjects WHERE name = 'Digital Literacy';
    SELECT id INTO financial_id FROM subjects WHERE name = 'Financial Literacy';
    SELECT id INTO health_id FROM subjects WHERE name = 'Health & Wellness';
    SELECT id INTO life_id FROM subjects WHERE name = 'Life Skills';

    -- Insert sample lessons for English Language
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published) VALUES
    ('Basic English Greetings', 'Learn how to greet people in English and introduce yourself', 
     'In this lesson, you will learn common English greetings like "Hello", "Good morning", and "How are you?". You will also practice introducing yourself with "My name is..." and "I am from...".', 
     english_id, 'beginner', 15, 1, true),
    
    ('English Numbers 1-20', 'Learn to count and use numbers in English', 
     'Master counting from 1 to 20 in English. Learn how to use numbers in daily conversations, tell time, and express quantities.', 
     english_id, 'beginner', 20, 2, true),
    
    ('Family Members in English', 'Learn vocabulary for family relationships', 
     'Learn the English words for family members: mother, father, sister, brother, grandmother, grandfather, and more. Practice talking about your family.', 
     english_id, 'beginner', 18, 3, true),
    
    ('Basic English Conversations', 'Practice simple everyday conversations', 
     'Learn to have basic conversations in English. Practice asking for directions, ordering food, and making small talk with neighbors and friends.', 
     english_id, 'intermediate', 25, 4, true);

    -- Insert sample lessons for Digital Literacy
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published) VALUES
    ('Using a Smartphone Safely', 'Learn basic smartphone functions and safety', 
     'Discover how to use your smartphone safely. Learn about making calls, sending messages, and protecting your personal information online.', 
     digital_id, 'beginner', 20, 1, true),
    
    ('Internet Basics', 'Introduction to using the internet', 
     'Learn what the internet is and how to use it safely. Understand web browsers, search engines, and how to find reliable information online.', 
     digital_id, 'beginner', 25, 2, true),
    
    ('Email and Communication', 'Learn to send and receive emails', 
     'Master the basics of email communication. Learn to create an email account, send messages, and communicate professionally online.', 
     digital_id, 'intermediate', 30, 3, true);

    -- Insert sample lessons for Financial Literacy
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published) VALUES
    ('Understanding Money', 'Basic concepts about money and currency', 
     'Learn the basics of money, including different denominations, how to count money, and the importance of saving for the future.', 
     financial_id, 'beginner', 15, 1, true),
    
    ('Mobile Money Safety', 'Learn to use digital payments safely', 
     'Understand how mobile money works and how to use it safely. Learn about PINs, transaction limits, and how to avoid fraud.', 
     financial_id, 'beginner', 20, 2, true),
    
    ('Basic Budgeting', 'Learn to manage your money with a simple budget', 
     'Create a simple budget to track your income and expenses. Learn how to prioritize spending and save money for important goals.', 
     financial_id, 'intermediate', 25, 3, true),
    
    ('Starting a Small Business', 'Introduction to entrepreneurship', 
     'Learn the basics of starting a small business. Understand market research, business planning, and managing finances for your business.', 
     financial_id, 'advanced', 35, 4, true);

    -- Insert sample lessons for Health & Wellness
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published) VALUES
    ('Healthy Eating Basics', 'Learn about nutritious foods for your family', 
     'Discover the importance of eating fruits, vegetables, and balanced meals. Learn how to prepare healthy, affordable meals for your family.', 
     health_id, 'beginner', 18, 1, true),
    
    ('Clean Water and Hygiene', 'Importance of clean water and personal hygiene', 
     'Learn about the importance of clean water, proper handwashing, and basic hygiene practices to keep your family healthy.', 
     health_id, 'beginner', 15, 2, true),
    
    ('Child Health and Nutrition', 'Keeping children healthy and well-nourished', 
     'Learn about proper nutrition for children, vaccination schedules, and when to seek medical help for common childhood illnesses.', 
     health_id, 'intermediate', 22, 3, true),
    
    ('Mental Health and Stress', 'Understanding and managing stress and mental health', 
     'Learn about mental health, how to recognize stress, and simple techniques for managing stress and maintaining emotional well-being.', 
     health_id, 'intermediate', 20, 4, true);

    -- Insert sample lessons for Life Skills
    INSERT INTO simple_lessons (title, description, content, subject_id, difficulty_level, duration_minutes, order_index, is_published) VALUES
    ('Time Management', 'Learn to organize your time effectively', 
     'Discover techniques for managing your time better. Learn to prioritize tasks, create schedules, and balance work and family life.', 
     life_id, 'beginner', 20, 1, true),
    
    ('Problem Solving Skills', 'Learn to solve everyday problems', 
     'Develop problem-solving skills for daily challenges. Learn to identify problems, think of solutions, and make good decisions.', 
     life_id, 'intermediate', 25, 2, true),
    
    ('Communication Skills', 'Improve your communication with others', 
     'Learn effective communication skills for family, work, and community. Practice active listening and clear expression of ideas.', 
     life_id, 'intermediate', 22, 3, true),
    
    ('Leadership in Your Community', 'Develop leadership skills for community involvement', 
     'Learn basic leadership skills to help in your community. Understand how to organize groups, lead meetings, and create positive change.', 
     life_id, 'advanced', 30, 4, true);

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