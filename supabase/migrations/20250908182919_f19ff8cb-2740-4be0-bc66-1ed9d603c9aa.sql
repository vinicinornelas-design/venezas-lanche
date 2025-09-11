-- Fix security vulnerability: Restrict access to sensitive order data
-- Remove overly permissive policies and implement proper access controls

-- Fix order_items table policies
DROP POLICY IF EXISTS "Allow public access to order_items" ON public.order_items;

-- Allow public INSERT (customers can create orders)
CREATE POLICY "Public can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users (staff) can view order items
CREATE POLICY "Authenticated users can view order items" 
ON public.order_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update/delete order items
CREATE POLICY "Authenticated users can manage order items" 
ON public.order_items 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete order items" 
ON public.order_items 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Fix orders table policies
DROP POLICY IF EXISTS "Allow public access to orders" ON public.orders;

-- Allow public INSERT (customers can place orders)
CREATE POLICY "Public can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users (staff) can view orders
CREATE POLICY "Authenticated users can view orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update orders
CREATE POLICY "Authenticated users can manage orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete orders" 
ON public.orders 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Fix customers table policies
DROP POLICY IF EXISTS "Allow public access to customers" ON public.customers;

-- Allow public INSERT (new customers can be created during order)
CREATE POLICY "Public can create customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users (staff) can view customer data
CREATE POLICY "Authenticated users can view customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update customer data
CREATE POLICY "Authenticated users can manage customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() IS NOT NULL);