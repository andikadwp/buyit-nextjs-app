-- Easy Admin Setup Script
-- This script creates an admin user automatically from the current authenticated user

-- First, ensure the admins table exists
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own data
CREATE POLICY IF NOT EXISTS "Admins can view own data"
  ON admins FOR SELECT
  USING (auth.uid() = id);

-- Policy: Only admins can view all admins
CREATE POLICY IF NOT EXISTS "Admins can view all admins"
  ON admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

-- IMPORTANT: After running this script, you need to manually insert your user as admin
-- Replace 'your-email@example.com' with your actual email that you used to sign up
-- 
-- To make yourself admin, run this query in Supabase SQL Editor:
-- INSERT INTO admins (id, email, role)
-- SELECT id, email, 'admin'
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (id) DO NOTHING;
