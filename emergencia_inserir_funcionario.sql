-- SCRIPT DE EMERGÊNCIA - Inserir Funcionário
-- Execute este script no Supabase Dashboard

-- 1. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SE RLS FOI DESABILITADO
SELECT 
  'RLS Status' as info,
  CASE 
    WHEN rowsecurity THEN '❌ RLS ainda habilitado'
    ELSE '✅ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 3. INSERIR FUNCIONÁRIO DE TESTE
INSERT INTO public.funcionarios (
  nome,
  email,
  telefone,
  cargo,
  nivel_acesso,
  ativo
) VALUES (
  'Funcionário Teste',
  'teste@exemplo.com',
  '(31) 99999-9999',
  'ATENDENTE',
  'FUNCIONARIO',
  true
);

-- 4. VERIFICAR SE FOI INSERIDO
SELECT 
  'Funcionário Inserido' as info,
  id,
  nome,
  email,
  cargo,
  nivel_acesso,
  ativo
FROM public.funcionarios 
WHERE email = 'teste@exemplo.com';

-- 5. CONTAR TOTAL DE FUNCIONÁRIOS
SELECT 
  'Total Funcionários' as info,
  COUNT(*) as quantidade
FROM public.funcionarios;

-- 6. MENSAGEM DE SUCESSO
DO $$
BEGIN
  RAISE NOTICE '🎉 FUNCIONÁRIO INSERIDO COM SUCESSO!';
  RAISE NOTICE '✅ RLS foi desabilitado temporariamente';
  RAISE NOTICE '✅ Agora teste o cadastro na interface do sistema';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Para reabilitar RLS depois, execute:';
  RAISE NOTICE 'ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;';
END $$;
