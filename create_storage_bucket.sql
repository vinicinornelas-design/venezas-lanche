-- Script para criar bucket de storage para imagens do cardápio
-- Execute este script no SQL Editor do Supabase

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Criar política para permitir upload de imagens (apenas usuários autenticados)
CREATE POLICY "Permitir upload de imagens para usuários autenticados" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Criar política para permitir visualização pública das imagens
CREATE POLICY "Permitir visualização pública das imagens" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Criar política para permitir atualização de imagens (apenas usuários autenticados)
CREATE POLICY "Permitir atualização de imagens para usuários autenticados" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Criar política para permitir exclusão de imagens (apenas usuários autenticados)
CREATE POLICY "Permitir exclusão de imagens para usuários autenticados" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'images';
