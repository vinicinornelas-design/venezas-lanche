-- Script para criar o bucket de imagens do restaurante no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- Criar o bucket para imagens do restaurante
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-images',
  'restaurant-images',
  true,
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Configurar políticas de acesso público para leitura
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'restaurant-images');

-- Configurar políticas para upload (apenas usuários autenticados)
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.role() = 'authenticated'
);

-- Configurar políticas para atualização (apenas usuários autenticados)
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'restaurant-images' 
  AND auth.role() = 'authenticated'
);

-- Configurar políticas para exclusão (apenas usuários autenticados)
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'restaurant-images' 
  AND auth.role() = 'authenticated'
);

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'restaurant-images';
