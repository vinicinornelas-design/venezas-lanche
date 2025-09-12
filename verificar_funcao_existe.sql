-- Verificar se a função criar_funcionario_completo existe
-- Execute este script no Supabase Dashboard

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
SELECT 
  'Função Existe' as info,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'criar_funcionario_completo'
  AND routine_schema = 'public';

-- 2. VERIFICAR FUNÇÕES DISPONÍVEIS
SELECT 
  'Funções Disponíveis' as info,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%criar%'
ORDER BY routine_name;

-- 3. VERIFICAR CONSTRAINT DA TABELA PROFILES
SELECT 
  'Constraint Profiles' as info,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.constraint_type = 'CHECK'
  AND cc.check_clause LIKE '%papel%';

-- 4. VERIFICAR VALORES ÚNICOS DE PAPEL NA TABELA PROFILES
SELECT 
  'Valores de Papel' as info,
  papel,
  COUNT(*) as count
FROM public.profiles 
GROUP BY papel
ORDER BY count DESC;

-- 5. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🔍 VERIFICAÇÃO CONCLUÍDA!';
  RAISE NOTICE '✅ Verifique se a função existe e os valores aceitos';
END $$;
