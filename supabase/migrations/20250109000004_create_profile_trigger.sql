-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_grade INTEGER;
BEGIN
  -- Try to extract grade from metadata
  user_grade := NULL;
  
  -- Handle different ways grade might be stored
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    IF NEW.raw_user_meta_data->>'grade' IS NOT NULL AND NEW.raw_user_meta_data->>'grade' != 'null' THEN
      BEGIN
        user_grade := (NEW.raw_user_meta_data->>'grade')::integer;
      EXCEPTION WHEN OTHERS THEN
        user_grade := NULL;
      END;
    END IF;
  END IF;

  -- Insert the profile
  INSERT INTO public.profiles (id, name, email, grade, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    user_grade,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;