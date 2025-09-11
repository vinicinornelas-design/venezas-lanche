-- Script para debug da tabela restaurant_config
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se há dados na tabela
SELECT 'Dados na tabela restaurant_config:' as info;
SELECT * FROM restaurant_config;

-- 2. Verificar políticas RLS
SELECT 'Políticas RLS da tabela restaurant_config:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'restaurant_config';

-- 3. Verificar se RLS está habilitado
SELECT 'RLS habilitado na tabela restaurant_config:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'restaurant_config';

-- 4. Testar consulta simples
SELECT 'Teste de consulta simples:' as info;
SELECT COUNT(*) as total_registros FROM restaurant_config;

-- 5. Verificar estrutura da tabela
SELECT 'Estrutura da tabela restaurant_config:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'restaurant_config'
ORDER BY ordinal_position;

-- 6. Verificar se há dados específicos
SELECT 'Verificação de campos específicos:' as info;
SELECT 
  id,
  nome_restaurante,
  telefone,
  endereco,
  horario_funcionamento,
  logo_url,
  banner_url,
  created_at,
  updated_at
FROM restaurant_config
LIMIT 5;
