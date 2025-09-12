-- Desabilitar RLS temporariamente para teste
-- ⚠️ ATENÇÃO: Use apenas para teste. Reabilite RLS após resolver o problema.

-- 1. Desabilitar RLS completamente
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 2. Verificar status
SELECT 
  'Status RLS' as info,
  tablename,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 3. Testar inserção sem RLS
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Tentar inserir funcionário de teste
  INSERT INTO public.funcionarios (
    nome,
    email,
    telefone,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Teste Sem RLS',
    'teste_sem_rls@exemplo.com',
    '(31) 88888-8888',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido sem RLS (ID: %)', test_id;
  RAISE NOTICE '✅ Agora teste o cadastro na interface do sistema';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO ao inserir sem RLS: %', SQLERRM;
  RAISE NOTICE 'Código do erro: %', SQLSTATE;
END $$;

-- 4. Verificar funcionários existentes
SELECT 
  'Funcionários Existentes' as info,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as nomes
FROM public.funcionarios;

-- 5. Instruções para reabilitar RLS
DO $$
BEGIN
  RAISE NOTICE '⚠️  IMPORTANTE: RLS está DESABILITADO temporariamente';
  RAISE NOTICE '';
  RAISE NOTICE 'Para reabilitar RLS depois, execute:';
  RAISE NOTICE 'ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora teste o cadastro de funcionários na interface.';
  RAISE NOTICE 'Se funcionar, o problema era de permissões RLS.';
END $$;
