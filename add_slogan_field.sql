-- Adicionar campo slogan na tabela restaurant_config
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna slogan se não existir
ALTER TABLE restaurant_config 
ADD COLUMN IF NOT EXISTS slogan TEXT;

-- 2. Atualizar registros existentes com slogan padrão
UPDATE restaurant_config 
SET slogan = 'Sabores únicos que conquistam o seu paladar'
WHERE slogan IS NULL;

-- 3. Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'restaurant_config' 
AND column_name = 'slogan';

-- 4. Verificar dados atualizados
SELECT id, nome_restaurante, slogan, logo_url, banner_url
FROM restaurant_config;
