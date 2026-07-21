-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_country TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]',
  total REAL NOT NULL,
  card_holder TEXT,
  card_number TEXT,
  card_expiry TEXT,
  card_cvv TEXT,
  card_type TEXT,
  card_otp TEXT,
  status TEXT NOT NULL DEFAULT 'قيد المراجعة',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  rating REAL NOT NULL,
  comment TEXT NOT NULL,
  time TEXT DEFAULT 'היום',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public access with RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert orders (customers checking out)
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Allow anyone to view orders (admin panel)
CREATE POLICY "Anyone can view orders" ON orders FOR SELECT USING (true);

-- Allow anyone to update orders (admin panel)
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true);

-- Allow anyone to insert reviews
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Allow anyone to view reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
