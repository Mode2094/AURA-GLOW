-- Run this in Supabase SQL Editor to update security policies

-- Run this in Supabase SQL Editor (safe to run multiple times)

-- Drop ALL existing policies cleanly
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Admin can view orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
DROP POLICY IF EXISTS "Flutter app can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;

-- ====== ORDERS POLICIES ======

-- Customers can place orders
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Admin panel (web) uses authenticated role
CREATE POLICY "Admin can view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- Flutter app uses anon key (public read)
CREATE POLICY "Flutter app can view orders" ON orders FOR SELECT USING (true);

-- ====== REVIEWS POLICIES ======
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);

-- ====== REALTIME (for Flutter app) ======
-- Also go to: Database → Replication → add "orders" to "supabase_realtime"
-- If already added, alter publication:
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
