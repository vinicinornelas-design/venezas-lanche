-- REMOVER CONSTRAINT DA TABELA PROFILES
-- Execute este script no Supabase Dashboard

-- 1. REMOVER A CONSTRAINT
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_papel_check;

-- 2. VERIFICAR SE FOI REMOVIDA
SELECT 
  'Constraint Removida' as info,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.constraint_type = 'CHECK'
  AND cc.check_clause LIKE '%papel%';

-- 3. TESTAR INSERÇÃO COM QUALQUER VALOR
DO $$
BEGIN
  RAISE NOTICE '=== TESTANDO SEM CONSTRAINT ===';
  
  -- Testar FUNCIONARIO
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (gen_random_uuid(), 'Teste FUNCIONARIO', 'FUNCIONARIO', true);
    RAISE NOTICE '✅ FUNCIONARIO: FUNCIONOU!';
    DELETE FROM public.profiles WHERE nome = 'Teste FUNCIONARIO';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ FUNCIONARIO: ERRO - %', SQLERRM;
  END;
  
  -- Testar QUALQUER_COISA
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (gen_random_uuid(), 'Teste QUALQUER', 'QUALQUER_COISA', true);
    RAISE NOTICE '✅ QUALQUER_COISA: FUNCIONOU!';
    DELETE FROM public.profiles WHERE nome = 'Teste QUALQUER';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ QUALQUER_COISA: ERRO - %', SQLERRM;
  END;
  
END $$;

-- 4. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 CONSTRAINT REMOVIDA!';
  RAISE NOTICE '✅ Agora pode inserir qualquer valor na coluna papel';
  RAISE NOTICE '✅ Teste o cadastro de funcionários novamente';
END $$;
