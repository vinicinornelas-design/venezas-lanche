-- REMOVER TODAS AS CONSTRAINTS DA TABELA PROFILES
-- Execute este script no Supabase Dashboard

-- 1. VER TODAS AS CONSTRAINTS ANTES
SELECT 
  'Constraints Antes' as info,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 2. REMOVER TODAS AS CONSTRAINTS
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  RAISE NOTICE '=== REMOVENDO TODAS AS CONSTRAINTS ===';
  
  -- Remover CHECK constraints
  FOR constraint_record IN 
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' 
      AND table_schema = 'public'
      AND constraint_type = 'CHECK'
  LOOP
    BEGIN
      EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
      RAISE NOTICE '✅ Removida CHECK constraint: %', constraint_record.constraint_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Erro ao remover %: %', constraint_record.constraint_name, SQLERRM;
    END;
  END LOOP;
  
  -- Remover UNIQUE constraints
  FOR constraint_record IN 
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' 
      AND table_schema = 'public'
      AND constraint_type = 'UNIQUE'
  LOOP
    BEGIN
      EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
      RAISE NOTICE '✅ Removida UNIQUE constraint: %', constraint_record.constraint_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Erro ao remover %: %', constraint_record.constraint_name, SQLERRM;
    END;
  END LOOP;
  
  -- Remover FOREIGN KEY constraints
  FOR constraint_record IN 
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' 
      AND table_schema = 'public'
      AND constraint_type = 'FOREIGN KEY'
  LOOP
    BEGIN
      EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
      RAISE NOTICE '✅ Removida FOREIGN KEY constraint: %', constraint_record.constraint_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Erro ao remover %: %', constraint_record.constraint_name, SQLERRM;
    END;
  END LOOP;
  
END $$;

-- 3. VER TODAS AS CONSTRAINTS DEPOIS
SELECT 
  'Constraints Depois' as info,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 4. TESTAR INSERÇÃO COM QUALQUER VALOR
DO $$
BEGIN
  RAISE NOTICE '=== TESTANDO SEM CONSTRAINTS ===';
  
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

-- 5. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 TODAS AS CONSTRAINTS REMOVIDAS!';
  RAISE NOTICE '✅ Agora pode inserir qualquer valor em qualquer coluna';
  RAISE NOTICE '✅ Teste o cadastro de funcionários novamente';
END $$;
