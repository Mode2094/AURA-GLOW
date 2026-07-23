-- Run this in Supabase SQL Editor to update security policies

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;

-- Keep INSERT open for customers checking out
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Only authenticated admin can view orders
CREATE POLICY "Admin can view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated admin can update orders
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated admin can delete orders
CREATE POLICY "Admin can delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- Reviews are public (anyone can view/insert)
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);

-- Flutter app needs public read access (anon key)
CREATE POLICY "Flutter app can view orders" ON orders FOR SELECT USING (true);

-- Enable Realtime for orders table (required for Flutter app)
-- Run this separately if the table is already in the publication:
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
