-- REVERTER TUDO AO ESTADO ORIGINAL
-- Execute este script no Supabase Dashboard

-- 1. REMOVER FUNÇÃO CRIADA
DROP FUNCTION IF EXISTS public.criar_funcionario_completo(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 2. REMOVER OUTRAS FUNÇÕES CRIADAS
DROP FUNCTION IF EXISTS public.criar_usuario_auth(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.criar_usuario_direto(TEXT, TEXT, TEXT, TEXT, TEXT);

-- 3. REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- 4. RECRIAR CONSTRAINT ORIGINAL DA TABELA PROFILES
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_papel_check 
CHECK (papel = ANY (ARRAY['ADMIN'::text, 'ATENDENTE'::text, 'COZINHA'::text]));

-- 5. VERIFICAR CONSTRAINTS RESTAURADAS
SELECT 
  'Constraints Restauradas' as info,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;

-- 6. VERIFICAR RLS RESTAURADO
SELECT 
  'RLS Status' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'funcionarios')
  AND schemaname = 'public';

-- 7. LIMPAR DADOS DE TESTE
DELETE FROM public.profiles WHERE nome LIKE '%Teste%';
DELETE FROM public.funcionarios WHERE nome LIKE '%Teste%';
DELETE FROM auth.users WHERE email LIKE '%teste%';

-- 8. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 TUDO REVERTIDO AO ORIGINAL!';
  RAISE NOTICE '✅ Funções removidas';
  RAISE NOTICE '✅ RLS reabilitado';
  RAISE NOTICE '✅ Constraints restauradas';
  RAISE NOTICE '✅ Dados de teste limpos';
  RAISE NOTICE '✅ Sistema voltou ao estado original';
END $$;
