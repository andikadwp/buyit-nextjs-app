-- Create admins table to track admin users
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins - only admins can see admin table
CREATE POLICY "Admins can view admins table" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- Update RLS policies for products to allow admin management
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- Update RLS policies for orders to allow admin view
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- Update RLS policies for order_items to allow admin view
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- Insert your admin user (replace with your actual user ID after signup)
-- Run this after creating your admin account:
-- INSERT INTO admins (id) VALUES ('your-user-id-here');
