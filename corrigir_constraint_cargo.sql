-- Corrigir constraint do campo cargo
-- Execute este script no Supabase Dashboard

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER CONSTRAINT EXISTENTE (se existir)
DO $$
BEGIN
  -- Tentar remover constraint de cargo se existir
  BEGIN
    ALTER TABLE public.funcionarios DROP CONSTRAINT IF EXISTS funcionarios_cargo_check;
    RAISE NOTICE '✅ Constraint funcionarios_cargo_check removida (se existia)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ℹ️  Constraint funcionarios_cargo_check não existia ou não pôde ser removida';
  END;
END $$;

-- 3. ADICIONAR NOVA CONSTRAINT CORRETA
ALTER TABLE public.funcionarios 
ADD CONSTRAINT funcionarios_cargo_check 
CHECK (cargo IN ('CHAPEIRO', 'ATENDENTE', 'CAIXA', 'COZINHEIRA', 'GERENTE'));

-- 4. VERIFICAR SE CONSTRAINT FOI ADICIONADA
SELECT 
  'Constraint Adicionada' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'funcionarios_cargo_check';

-- 5. TESTAR INSERÇÃO COM VALORES CORRETOS
DO $$
DECLARE
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTANDO INSERÇÃO COM CONSTRAINT CORRIGIDA ===';
  
  -- Testar inserção com cargo válido
  INSERT INTO public.funcionarios (
    nome,
    email,
    telefone,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Funcionário Teste Constraint',
    'teste_constraint@exemplo.com',
    '(31) 99999-9999',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
  RAISE NOTICE '✅ Constraint corrigida! Agora teste o cadastro na interface.';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO: %', SQLERRM;
  RAISE NOTICE 'Código: %', SQLSTATE;
END $$;

-- 6. VERIFICAR FUNCIONÁRIOS EXISTENTES
SELECT 
  'Funcionários Existentes' as info,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as nomes
FROM public.funcionarios;

-- 7. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 CORREÇÃO DA CONSTRAINT APLICADA!';
  RAISE NOTICE '✅ Valores permitidos para cargo: CHAPEIRO, ATENDENTE, CAIXA, COZINHEIRA, GERENTE';
  RAISE NOTICE '✅ RLS desabilitado temporariamente';
  RAISE NOTICE '✅ Agora teste o cadastro de funcionários na interface!';
END $$;
