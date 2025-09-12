-- Verificar constraint da tabela profiles
-- Execute este script no Supabase Dashboard

-- 1. VERIFICAR CONSTRAINT DA COLUNA PAPEL
SELECT 
  'Constraint Info' as info,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.constraint_type = 'CHECK'
  AND cc.check_clause LIKE '%papel%';

-- 2. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
  'Table Structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR DADOS EXISTENTES NA TABELA PROFILES
SELECT 
  'Existing Data' as info,
  user_id,
  nome,
  papel,
  ativo,
  created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 4. VERIFICAR VALORES ÚNICOS DE PAPEL
SELECT 
  'Unique Papel Values' as info,
  papel,
  COUNT(*) as count
FROM public.profiles 
GROUP BY papel
ORDER BY count DESC;

-- 5. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🔍 VERIFICAÇÃO DA TABELA PROFILES CONCLUÍDA!';
  RAISE NOTICE '✅ Verifique os valores aceitos para a coluna papel';
END $$;
