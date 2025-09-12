-- VERIFICAR CONSTRAINT EXATA DA TABELA PROFILES
-- Execute este script no Supabase Dashboard

-- 1. VER A CONSTRAINT EXATA
SELECT 
  'Constraint Exata' as info,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.constraint_type = 'CHECK'
  AND cc.check_clause LIKE '%papel%';

-- 2. TESTAR TODOS OS VALORES POSSÍVEIS
DO $$
BEGIN
  RAISE NOTICE '=== TESTANDO TODOS OS VALORES ===';
  
  -- Testar ATENDENTE
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (gen_random_uuid(), 'Teste ATENDENTE', 'ATENDENTE', true);
    RAISE NOTICE '✅ ATENDENTE: FUNCIONOU';
    DELETE FROM public.profiles WHERE nome = 'Teste ATENDENTE';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ATENDENTE: ERRO - %', SQLERRM;
  END;
  
  -- Testar ADMIN
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (gen_random_uuid(), 'Teste ADMIN', 'ADMIN', true);
    RAISE NOTICE '✅ ADMIN: FUNCIONOU';
    DELETE FROM public.profiles WHERE nome = 'Teste ADMIN';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ADMIN: ERRO - %', SQLERRM;
  END;
  
  -- Testar FUNCIONARIO
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (gen_random_uuid(), 'Teste FUNCIONARIO', 'FUNCIONARIO', true);
    RAISE NOTICE '✅ FUNCIONARIO: FUNCIONOU';
    DELETE FROM public.profiles WHERE nome = 'Teste FUNCIONARIO';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ FUNCIONARIO: ERRO - %', SQLERRM;
  END;
  
  -- Testar GERENTE
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (gen_random_uuid(), 'Teste GERENTE', 'GERENTE', true);
    RAISE NOTICE '✅ GERENTE: FUNCIONOU';
    DELETE FROM public.profiles WHERE nome = 'Teste GERENTE';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ GERENTE: ERRO - %', SQLERRM;
  END;
  
  -- Testar USUARIO
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (gen_random_uuid(), 'Teste USUARIO', 'USUARIO', true);
    RAISE NOTICE '✅ USUARIO: FUNCIONOU';
    DELETE FROM public.profiles WHERE nome = 'Teste USUARIO';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ USUARIO: ERRO - %', SQLERRM;
  END;
  
END $$;

-- 3. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🔍 TESTE CONCLUÍDO!';
  RAISE NOTICE '✅ Use apenas os valores que funcionaram';
END $$;
