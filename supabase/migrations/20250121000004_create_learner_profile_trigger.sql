-- Create trigger to automatically create learner profile when user profile is created
CREATE OR REPLACE FUNCTION create_learner_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create learner profile if grade is provided
  IF NEW.grade IS NOT NULL THEN
    BEGIN
      INSERT INTO public.learner_profiles (
        user_id,
        preferred_difficulty
      ) VALUES (
        NEW.id,
        CASE 
          WHEN NEW.grade BETWEEN 1 AND 4 THEN 'beginner'
          WHEN NEW.grade BETWEEN 5 AND 8 THEN 'intermediate'
          WHEN NEW.grade BETWEEN 9 AND 12 THEN 'advanced'
          ELSE 'intermediate'
        END
      ) ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Failed to create learner profile: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT OR UPDATE OF grade ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_learner_profile_on_signup();