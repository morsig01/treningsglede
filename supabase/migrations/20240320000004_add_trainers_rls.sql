-- Enable RLS on trainers table
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read trainers
CREATE POLICY "Allow anyone to read trainers"
  ON trainers FOR SELECT
  USING (true);

-- Allow admins to manage trainers
CREATE POLICY "Allow admins to manage trainers"
  ON trainers FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin'); 