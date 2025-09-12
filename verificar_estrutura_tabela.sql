-- Verificar estrutura da tabela funcionarios
-- Execute este script no Supabase Dashboard

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
  'Tabela Existe' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'funcionarios') 
    THEN '✅ Tabela funcionarios existe'
    ELSE '❌ Tabela funcionarios NÃO existe'
  END as status;

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 
  'Estrutura da Tabela' as info,
  column_name as coluna,
  data_type as tipo,
  is_nullable as pode_null,
  column_default as valor_padrao
FROM information_schema.columns 
WHERE table_name = 'funcionarios' 
ORDER BY ordinal_position;

-- 3. VERIFICAR CONSTRAINTS
SELECT 
  'Constraints' as info,
  constraint_name as nome,
  constraint_type as tipo
FROM information_schema.table_constraints 
WHERE table_name = 'funcionarios';

-- 4. VERIFICAR ÍNDICES
SELECT 
  'Índices' as info,
  indexname as nome_indice,
  indexdef as definicao
FROM pg_indexes 
WHERE tablename = 'funcionarios';

-- 5. VERIFICAR RLS
SELECT 
  'RLS Status' as info,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 6. VERIFICAR POLÍTICAS RLS
SELECT 
  'Políticas RLS' as info,
  policyname as nome_politica,
  cmd as operacao,
  permissive as permissivo,
  roles as roles,
  qual as condicao_select,
  with_check as condicao_insert
FROM pg_policies 
WHERE tablename = 'funcionarios';

-- 7. TESTAR INSERÇÃO SIMPLES
DO $$
DECLARE
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTANDO INSERÇÃO SIMPLES ===';
  
  BEGIN
    INSERT INTO public.funcionarios (
      nome,
      email,
      cargo,
      nivel_acesso,
      ativo
    ) VALUES (
      'Teste Estrutura',
      'teste_estrutura@exemplo.com',
      'ATENDENTE',
      'FUNCIONARIO',
      true
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO: %', SQLERRM;
    RAISE NOTICE 'Código do erro: %', SQLSTATE;
  END;
END $$;

-- 8. VERIFICAR FUNCIONÁRIOS EXISTENTES
SELECT 
  'Funcionários Existentes' as info,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as nomes
FROM public.funcionarios;
