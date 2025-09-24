-- Script para adicionar configurações PIX na tabela restaurant_config
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as colunas já existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'restaurant_config' 
AND column_name IN ('chave_pix', 'nome_beneficiario_pix');

-- 2. Adicionar colunas PIX se não existirem
DO $$ 
BEGIN
    -- Adicionar coluna chave_pix se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_config' 
        AND column_name = 'chave_pix'
    ) THEN
        ALTER TABLE restaurant_config 
        ADD COLUMN chave_pix TEXT DEFAULT '';
    END IF;

    -- Adicionar coluna nome_beneficiario_pix se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurant_config' 
        AND column_name = 'nome_beneficiario_pix'
    ) THEN
        ALTER TABLE restaurant_config 
        ADD COLUMN nome_beneficiario_pix TEXT DEFAULT 'Veneza''s Lanche';
    END IF;
END $$;

-- 3. Atualizar configurações PIX existentes (se houver)
UPDATE restaurant_config 
SET 
    chave_pix = COALESCE(chave_pix, ''),
    nome_beneficiario_pix = COALESCE(nome_beneficiario_pix, 'Veneza''s Lanche')
WHERE chave_pix IS NULL OR nome_beneficiario_pix IS NULL;

-- 4. Verificar se as colunas foram adicionadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'restaurant_config' 
AND column_name IN ('chave_pix', 'nome_beneficiario_pix')
ORDER BY column_name;

-- 5. Verificar dados atuais
SELECT id, chave_pix, nome_beneficiario_pix, created_at 
FROM restaurant_config 
LIMIT 1;
