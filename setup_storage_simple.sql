-- Script simples para configurar o bucket de imagens
-- Execute no SQL Editor do Supabase

-- Criar bucket para imagens do restaurante
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true);

-- Política para permitir leitura pública
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'restaurant-images');

-- Política para permitir upload de usuários autenticados
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização de usuários autenticados
CREATE POLICY "Authenticated update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'restaurant-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão de usuários autenticados
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'restaurant-images' 
  AND auth.role() = 'authenticated'
);
