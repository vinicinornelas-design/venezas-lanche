-- Script para verificar permissões da tabela restaurant_config
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurant_config' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'restaurant_config';

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'restaurant_config';

-- 4. Verificar dados existentes
SELECT 
    id,
    nome_restaurante,
    telefone,
    endereco,
    CASE 
        WHEN logo_url IS NOT NULL THEN 'Logo presente (' || LENGTH(logo_url) || ' chars)'
        ELSE 'Logo ausente'
    END as logo_status,
    CASE 
        WHEN banner_url IS NOT NULL THEN 'Banner presente (' || LENGTH(banner_url) || ' chars)'
        ELSE 'Banner ausente'
    END as banner_status,
    created_at,
    updated_at
FROM restaurant_config;

-- 5. Testar inserção/atualização (comentado para não executar automaticamente)
-- UPDATE restaurant_config 
-- SET logo_url = 'teste' 
-- WHERE id = (SELECT id FROM restaurant_config LIMIT 1);
