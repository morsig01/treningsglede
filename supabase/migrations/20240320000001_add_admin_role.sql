-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set a user as admin
CREATE OR REPLACE FUNCTION auth.set_user_role(user_id UUID, role TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data::jsonb, '{}'::jsonb) || 
    jsonb_build_object('role', role)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 