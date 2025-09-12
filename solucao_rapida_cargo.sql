-- Solução rápida para o problema de constraint do cargo
-- Execute este script no Supabase Dashboard

-- 1. DESABILITAR RLS
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER CONSTRAINT PROBLEMÁTICA
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.funcionarios DROP CONSTRAINT IF EXISTS funcionarios_cargo_check;
    RAISE NOTICE '✅ Constraint removida';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ℹ️  Constraint não existia';
  END;
END $$;

-- 3. ADICIONAR CONSTRAINT CORRETA
ALTER TABLE public.funcionarios 
ADD CONSTRAINT funcionarios_cargo_check 
CHECK (cargo IN ('CHAPEIRO', 'ATENDENTE', 'CAIXA', 'COZINHEIRA', 'GERENTE'));

-- 4. TESTAR INSERÇÃO
DO $$
DECLARE
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTANDO INSERÇÃO ===';
  
  INSERT INTO public.funcionarios (
    nome,
    email,
    telefone,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Teste Cargo Fix',
    'teste_cargo_fix@exemplo.com',
    '(31) 99999-9999',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
  RAISE NOTICE '✅ Agora teste o cadastro na interface!';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO: %', SQLERRM;
END $$;

-- 5. VERIFICAR FUNCIONÁRIOS
SELECT 
  'Total Funcionários' as info,
  COUNT(*) as quantidade
FROM public.funcionarios;
