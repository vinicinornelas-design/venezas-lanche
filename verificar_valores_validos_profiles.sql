-- Verificar valores válidos para a constraint da tabela profiles
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

-- 2. VERIFICAR VALORES EXISTENTES NA TABELA PROFILES
SELECT 
  'Valores Existentes' as info,
  papel,
  COUNT(*) as count
FROM public.profiles 
GROUP BY papel
ORDER BY count DESC;

-- 3. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
  'Estrutura da Tabela' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🔍 VERIFICAÇÃO CONCLUÍDA!';
  RAISE NOTICE '✅ Verifique os valores aceitos para a coluna papel';
END $$;
