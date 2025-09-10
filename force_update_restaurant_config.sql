-- Script para forçar atualização dos dados da restaurant_config
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados atuais
SELECT 'Dados atuais:' as info;
SELECT * FROM restaurant_config;

-- 2. Atualizar com dados completos
UPDATE restaurant_config 
SET 
  nome_restaurante = 'Veneza''s Lanches',
  slogan = 'Sabores únicos que conquistam o seu paladar',
  logo_url = '/lovable-uploads/7879c400-f6d5-4608-b189-9a23e3d9922f.png',
  banner_url = '/lovable-uploads/a1d88967-0f07-48f9-bc12-342086b4b146.png',
  telefone = '(31) 99999-0000',
  endereco = 'Rua das Palmeiras, 456 - Centro',
  horario_funcionamento = '{
    "segunda": "17:00-23:00",
    "terca": "17:00-23:00", 
    "quarta": "17:00-23:00",
    "quinta": "17:00-23:00",
    "sexta": "17:00-00:00",
    "sabado": "17:00-00:00",
    "domingo": "17:00-23:00"
  }'::jsonb,
  updated_at = now()
WHERE id = (SELECT id FROM restaurant_config LIMIT 1);

-- 3. Verificar dados após atualização
SELECT 'Dados após atualização:' as info;
SELECT 
  id,
  nome_restaurante,
  slogan,
  logo_url,
  banner_url,
  telefone,
  endereco,
  horario_funcionamento
FROM restaurant_config;

-- 4. Testar consulta como usuário anônimo
SELECT 'Teste de acesso público:' as info;
SET LOCAL role TO anon;
SELECT nome_restaurante, slogan, logo_url, telefone, endereco FROM restaurant_config;
RESET role;
