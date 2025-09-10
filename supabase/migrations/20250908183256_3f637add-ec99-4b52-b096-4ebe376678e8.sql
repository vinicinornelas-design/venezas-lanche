-- Fix security vulnerability: Restrict access to WhatsApp messages
-- Remove public access and implement proper authentication-based policies

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public access to whatsapp_messages" ON public.whatsapp_messages;

-- Only authenticated users (staff) can create WhatsApp messages
CREATE POLICY "Authenticated users can create whatsapp messages" 
ON public.whatsapp_messages 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users (staff) can view WhatsApp messages
CREATE POLICY "Authenticated users can view whatsapp messages" 
ON public.whatsapp_messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only authenticated users (staff) can update WhatsApp message status
CREATE POLICY "Authenticated users can update whatsapp messages" 
ON public.whatsapp_messages 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Only authenticated users (staff) can delete WhatsApp messages
CREATE POLICY "Authenticated users can delete whatsapp messages" 
ON public.whatsapp_messages 
FOR DELETE 
USING (auth.uid() IS NOT NULL);