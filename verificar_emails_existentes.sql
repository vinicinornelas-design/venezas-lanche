-- Verificar emails existentes na tabela funcionarios
-- Execute este script no Supabase Dashboard

-- 1. LISTAR TODOS OS FUNCIONÁRIOS
SELECT 
  'Funcionários Existentes' as info,
  id,
  nome,
  email,
  cargo,
  nivel_acesso,
  ativo,
  created_at
FROM public.funcionarios 
ORDER BY created_at DESC;

-- 2. CONTAR TOTAL
SELECT 
  'Total de Funcionários' as info,
  COUNT(*) as quantidade
FROM public.funcionarios;

-- 3. VERIFICAR EMAILS DUPLICADOS (se houver)
SELECT 
  'Emails Duplicados' as info,
  email,
  COUNT(*) as quantidade
FROM public.funcionarios 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 4. VERIFICAR FUNCIONÁRIOS INATIVOS
SELECT 
  'Funcionários Inativos' as info,
  nome,
  email,
  cargo,
  ativo
FROM public.funcionarios 
WHERE ativo = false;
