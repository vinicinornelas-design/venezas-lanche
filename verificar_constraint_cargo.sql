-- Verificar constraint do campo cargo
-- Execute este script no Supabase Dashboard

-- 1. VERIFICAR CONSTRAINTS DA TABELA FUNCIONARIOS
SELECT 
  'Constraints da Tabela' as info,
  constraint_name as nome_constraint,
  check_clause as condicao
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%funcionarios%' 
   OR constraint_name LIKE '%cargo%';

-- 2. VERIFICAR CONSTRAINTS ESPECÍFICAS
SELECT 
  'Constraints Específicas' as info,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'funcionarios';

-- 3. VERIFICAR ESTRUTURA DA COLUNA CARGO
SELECT 
  'Estrutura Coluna Cargo' as info,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'funcionarios' 
  AND column_name = 'cargo';

-- 4. TESTAR VALORES PERMITIDOS
DO $$
DECLARE
  test_cargos TEXT[] := ARRAY['CHAPEIRO', 'ATENDENTE', 'CAIXA', 'COZINHEIRA', 'GERENTE'];
  cargo TEXT;
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTANDO VALORES DE CARGO ===';
  
  FOREACH cargo IN ARRAY test_cargos
  LOOP
    BEGIN
      INSERT INTO public.funcionarios (
        nome,
        email,
        cargo,
        nivel_acesso,
        ativo
      ) VALUES (
        'Teste ' || cargo,
        'teste_' || LOWER(cargo) || '@exemplo.com',
        cargo,
        'FUNCIONARIO',
        true
      ) RETURNING id INTO test_id;
      
      RAISE NOTICE '✅ SUCESSO: Cargo "%" aceito (ID: %)', cargo, test_id;
      
      -- Remover o teste
      DELETE FROM public.funcionarios WHERE id = test_id;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO: Cargo "%" rejeitado - %', cargo, SQLERRM;
    END;
  END LOOP;
END $$;

-- 5. VERIFICAR FUNCIONÁRIOS EXISTENTES E SEUS CARGOS
SELECT 
  'Cargos Existentes' as info,
  cargo,
  COUNT(*) as quantidade
FROM public.funcionarios 
GROUP BY cargo
ORDER BY cargo;
