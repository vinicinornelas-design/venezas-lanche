-- Script simplificado para corrigir permissões da tabela restaurant_config
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'restaurant_config'
) as table_exists;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE restaurant_config DISABLE ROW LEVEL SECURITY;

-- 3. Remover todas as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'restaurant_config') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON restaurant_config';
    END LOOP;
END $$;

-- 4. Criar políticas simples e permissivas
CREATE POLICY "Allow all operations for authenticated users" ON restaurant_config
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. Permitir leitura pública (para o cardápio público)
CREATE POLICY "Allow public read access" ON restaurant_config
    FOR SELECT USING (true);

-- 6. Reabilitar RLS
ALTER TABLE restaurant_config ENABLE ROW LEVEL SECURITY;

-- 7. Verificar se existe pelo menos um registro, se não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM restaurant_config LIMIT 1) THEN
        INSERT INTO restaurant_config (
            nome_restaurante,
            telefone,
            endereco,
            logo_url,
            banner_url,
            horario_funcionamento
        ) VALUES (
            'Veneza''s Lanches',
            '31 99549-2713',
            'Rua Laguna, 145A - Veneza',
            '',
            '',
            '{}'
        );
    END IF;
END $$;

-- 8. Verificar resultado final
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
    END as banner_status,
    created_at
FROM restaurant_config;

-- 9. Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'restaurant_config';
