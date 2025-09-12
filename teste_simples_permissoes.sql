-- Teste simples de permissões para funcionários
-- Execute este SQL no dashboard do Supabase

-- 1. Verificar autenticação atual
SELECT 
  'Usuário Atual' as info,
  auth.uid() as user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Não autenticado'
    ELSE '✅ Autenticado'
  END as status;

-- 2. Verificar perfil do usuário
SELECT 
  'Perfil' as info,
  nome,
  papel,
  ativo
FROM public.profiles 
WHERE user_id = auth.uid();

-- 3. Verificar se é admin
SELECT 
  'Admin Check' as info,
  CASE 
    WHEN is_admin() THEN '✅ É ADMIN'
    ELSE '❌ NÃO é admin'
  END as resultado;

-- 4. Verificar RLS da tabela funcionarios
SELECT 
  'RLS Status' as info,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 5. Testar inserção simples
DO $$
DECLARE
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTANDO INSERÇÃO ===';
  
  INSERT INTO public.funcionarios (
    nome,
    email,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Teste Permissão',
    'teste_permissao@exemplo.com',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
  RAISE NOTICE '✅ Agora teste o cadastro na interface!';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO: %', SQLERRM;
  RAISE NOTICE 'Código: %', SQLSTATE;
END $$;

-- 6. Verificar funcionários existentes
SELECT 
  'Total Funcionários' as info,
  COUNT(*) as quantidade
FROM public.funcionarios;
