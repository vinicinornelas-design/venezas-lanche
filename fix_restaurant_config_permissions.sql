-- Script para corrigir permissões da tabela restaurant_config
-- Execute no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para correção
ALTER TABLE restaurant_config DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "restaurant_config_policy" ON restaurant_config;
DROP POLICY IF EXISTS "Enable read access for all users" ON restaurant_config;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON restaurant_config;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON restaurant_config;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON restaurant_config;

-- 3. Criar políticas corretas
CREATE POLICY "Enable read access for all users" ON restaurant_config
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON restaurant_config
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON restaurant_config
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON restaurant_config
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Reabilitar RLS
ALTER TABLE restaurant_config ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'restaurant_config';

-- 6. Garantir que existe pelo menos um registro
INSERT INTO restaurant_config (
    id,
    nome_restaurante,
    telefone,
    endereco,
    logo_url,
    banner_url,
    horario_funcionamento
) VALUES (
    'default-config',
    'Veneza''s Lanches',
    '31 99549-2713',
    'Rua Laguna, 145A - Veneza',
    '',
    '',
    '{}'
) ON CONFLICT (id) DO NOTHING;

-- 7. Verificar dados finais
SELECT 
    id,
    nome_restaurante,
    CASE 
        WHEN logo_url IS NOT NULL AND logo_url != '' THEN 'Logo presente (' || LENGTH(logo_url) || ' chars)'
        ELSE 'Logo ausente'
    END as logo_status,
    CASE 
        WHEN banner_url IS NOT NULL AND banner_url != '' THEN 'Banner presente (' || LENGTH(banner_url) || ' chars)'
        ELSE 'Banner ausente'
    END as banner_status
FROM restaurant_config;
