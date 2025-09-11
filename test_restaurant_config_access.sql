-- Script para testar acesso à tabela restaurant_config
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as políticas RLS estão funcionando
SELECT 'Testando acesso público à tabela:' as info;

-- 2. Testar consulta como usuário anônimo (simulando páginas públicas)
SET LOCAL role TO anon;
SELECT * FROM restaurant_config;
RESET role;

-- 3. Verificar se há dados com todos os campos
SELECT 'Dados completos na tabela:' as info;
SELECT 
  id,
  nome_restaurante,
  slogan,
  logo_url,
  banner_url,
  telefone,
  endereco,
  horario_funcionamento,
  created_at,
  updated_at
FROM restaurant_config;

-- 4. Verificar se as colunas existem
SELECT 'Verificando se todas as colunas existem:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'restaurant_config'
ORDER BY ordinal_position;

-- 5. Atualizar dados de teste se necessário
UPDATE restaurant_config 
SET 
  slogan = COALESCE(slogan, 'Sabores únicos que conquistam o seu paladar'),
  logo_url = COALESCE(logo_url, '/lovable-uploads/7879c400-f6d5-4608-b189-9a23e3d9922f.png'),
  banner_url = COALESCE(banner_url, '/lovable-uploads/a1d88967-0f07-48f9-bc12-342086b4b146.png')
WHERE id = (SELECT id FROM restaurant_config LIMIT 1);

-- 6. Verificar dados após atualização
SELECT 'Dados após atualização:' as info;
SELECT 
  nome_restaurante,
  slogan,
  logo_url,
  banner_url,
  telefone,
  endereco
FROM restaurant_config;
