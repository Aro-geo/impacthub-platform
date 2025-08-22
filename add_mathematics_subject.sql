-- Add Mathematics subject if it doesn't exist
INSERT INTO subjects (name, description, icon, color) VALUES
('Mathematics', 'Learn math concepts, problem solving, and calculations', 'Calculator', 'indigo')
ON CONFLICT (name) DO NOTHING;

-- Check if lessons exist
SELECT 
  s.name as subject_name,
  COUNT(sl.id) as lesson_count
FROM subjects s
LEFT JOIN simple_lessons sl ON s.id = sl.subject_id
WHERE s.name = 'Mathematics'
GROUP BY s.name;