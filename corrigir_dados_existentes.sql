-- Corrigir dados existentes que violam a constraint
-- Execute este script no Supabase Dashboard

-- 1. DESABILITAR RLS
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR DADOS EXISTENTES
SELECT 
  'Dados Existentes' as info,
  cargo,
  COUNT(*) as quantidade
FROM public.funcionarios 
GROUP BY cargo
ORDER BY cargo;

-- 3. VERIFICAR DADOS PROBLEMÁTICOS
SELECT 
  'Dados Problemáticos' as info,
  id,
  nome,
  email,
  cargo,
  nivel_acesso,
  ativo
FROM public.funcionarios 
WHERE cargo NOT IN ('CHAPEIRO', 'ATENDENTE', 'CAIXA', 'COZINHEIRA', 'GERENTE');

-- 4. REMOVER CONSTRAINT TEMPORARIAMENTE
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.funcionarios DROP CONSTRAINT IF EXISTS funcionarios_cargo_check;
    RAISE NOTICE '✅ Constraint removida temporariamente';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ℹ️  Constraint não existia';
  END;
END $$;

-- 5. CORRIGIR DADOS PROBLEMÁTICOS
DO $$
DECLARE
  funcionario_record RECORD;
  cargo_corrigido TEXT;
BEGIN
  RAISE NOTICE '=== CORRIGINDO DADOS PROBLEMÁTICOS ===';
  
  -- Buscar funcionários com cargo inválido
  FOR funcionario_record IN 
    SELECT id, nome, cargo 
    FROM public.funcionarios 
    WHERE cargo NOT IN ('CHAPEIRO', 'ATENDENTE', 'CAIXA', 'COZINHEIRA', 'GERENTE')
  LOOP
    -- Mapear cargo inválido para válido
    CASE 
      WHEN UPPER(funcionario_record.cargo) LIKE '%ATEND%' THEN cargo_corrigido := 'ATENDENTE';
      WHEN UPPER(funcionario_record.cargo) LIKE '%CHAP%' THEN cargo_corrigido := 'CHAPEIRO';
      WHEN UPPER(funcionario_record.cargo) LIKE '%CAIX%' THEN cargo_corrigido := 'CAIXA';
      WHEN UPPER(funcionario_record.cargo) LIKE '%COZIN%' THEN cargo_corrigido := 'COZINHEIRA';
      WHEN UPPER(funcionario_record.cargo) LIKE '%GER%' THEN cargo_corrigido := 'GERENTE';
      ELSE cargo_corrigido := 'ATENDENTE'; -- Valor padrão
    END CASE;
    
    -- Atualizar cargo
    UPDATE public.funcionarios 
    SET cargo = cargo_corrigido
    WHERE id = funcionario_record.id;
    
    RAISE NOTICE '✅ Funcionário %: "%" -> "%"', funcionario_record.nome, funcionario_record.cargo, cargo_corrigido;
  END LOOP;
  
  RAISE NOTICE '✅ Dados corrigidos com sucesso!';
END $$;

-- 6. VERIFICAR DADOS CORRIGIDOS
SELECT 
  'Dados Após Correção' as info,
  cargo,
  COUNT(*) as quantidade
FROM public.funcionarios 
GROUP BY cargo
ORDER BY cargo;

-- 7. ADICIONAR CONSTRAINT NOVAMENTE
ALTER TABLE public.funcionarios 
ADD CONSTRAINT funcionarios_cargo_check 
CHECK (cargo IN ('CHAPEIRO', 'ATENDENTE', 'CAIXA', 'COZINHEIRA', 'GERENTE'));

-- 8. TESTAR INSERÇÃO
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
    'Teste Final Cargo',
    'teste_final_cargo@exemplo.com',
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

-- 9. VERIFICAR TOTAL DE FUNCIONÁRIOS
SELECT 
  'Total Funcionários' as info,
  COUNT(*) as quantidade
FROM public.funcionarios;
