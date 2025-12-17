-- This script will insert the current authenticated user as an admin
-- Run this after you've signed up and are logged in

-- Insert admin user - this will use the first user that signs up
-- Or you can manually insert your user ID after signing up
INSERT INTO admins (id)
SELECT id FROM auth.users
WHERE email = 'admin@example.com' -- Replace with your admin email
ON CONFLICT (id) DO NOTHING;

-- Alternative: Insert all existing users as admins (for testing only)
-- Uncomment the line below if you want to make all users admins
-- INSERT INTO admins (id) SELECT id FROM auth.users ON CONFLICT (id) DO NOTHING;
