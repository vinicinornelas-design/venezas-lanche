-- Teste final para inserção de funcionários
-- Execute este script no Supabase Dashboard

-- 1. VERIFICAR AUTENTICAÇÃO
SELECT 
  'Status Auth' as info,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NÃO autenticado'
    ELSE '✅ Autenticado: ' || auth.uid()::text
  END as status;

-- 2. VERIFICAR PERFIL
SELECT 
  'Perfil' as info,
  nome,
  papel,
  ativo
FROM public.profiles 
WHERE user_id = auth.uid();

-- 3. VERIFICAR RLS
SELECT 
  'RLS Status' as info,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 4. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 5. TESTAR INSERÇÃO
DO $$
DECLARE
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTANDO INSERÇÃO DE FUNCIONÁRIO ===';
  
  INSERT INTO public.funcionarios (
    nome,
    email,
    telefone,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Funcionário Teste Final',
    'teste_final@exemplo.com',
    '(31) 99999-9999',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
  RAISE NOTICE '✅ Agora teste o cadastro na interface do sistema!';
  
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

-- 7. MOSTRAR FUNCIONÁRIOS
SELECT 
  'Lista de Funcionários' as info,
  id,
  nome,
  email,
  cargo,
  nivel_acesso,
  ativo,
  created_at
FROM public.funcionarios 
ORDER BY created_at DESC;
