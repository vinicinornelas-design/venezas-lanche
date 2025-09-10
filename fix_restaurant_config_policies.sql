-- Script para corrigir políticas RLS da tabela restaurant_config
-- Execute este script no Supabase SQL Editor

-- 1. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "restaurant_config_select_policy" ON restaurant_config;
DROP POLICY IF EXISTS "restaurant_config_insert_policy" ON restaurant_config;
DROP POLICY IF EXISTS "restaurant_config_update_policy" ON restaurant_config;
DROP POLICY IF EXISTS "restaurant_config_delete_policy" ON restaurant_config;

-- 2. Criar políticas que permitem acesso público para leitura
-- (Necessário para páginas públicas como Index e MenuPublico)

-- Política para SELECT (leitura pública)
CREATE POLICY "restaurant_config_select_policy" ON restaurant_config
FOR SELECT
TO public
USING (true);

-- Política para INSERT (apenas para usuários autenticados)
CREATE POLICY "restaurant_config_insert_policy" ON restaurant_config
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (apenas para usuários autenticados)
CREATE POLICY "restaurant_config_update_policy" ON restaurant_config
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (apenas para usuários autenticados)
CREATE POLICY "restaurant_config_delete_policy" ON restaurant_config
FOR DELETE
TO authenticated
USING (true);

-- 3. Verificar se RLS está habilitado
ALTER TABLE restaurant_config ENABLE ROW LEVEL SECURITY;

-- 4. Verificar as políticas criadas
SELECT 'Políticas criadas:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'restaurant_config';

-- 5. Testar consulta após correção
SELECT 'Teste após correção:' as info;
SELECT * FROM restaurant_config;
