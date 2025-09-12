-- Debug da criação de usuários
-- Execute este script no Supabase Dashboard

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
SELECT 
  'Função criar_usuario_auth' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'criar_usuario_auth') 
    THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status;

-- 2. VERIFICAR SE A FUNÇÃO is_admin EXISTE
SELECT 
  'Função is_admin' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') 
    THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status;

-- 3. TESTAR FUNÇÃO is_admin
SELECT 
  'Teste is_admin' as info,
  CASE 
    WHEN is_admin() THEN '✅ Retorna TRUE (é admin)'
    ELSE '❌ Retorna FALSE (não é admin)'
  END as resultado;

-- 4. VERIFICAR USUÁRIO ATUAL
SELECT 
  'Usuário Atual' as info,
  auth.uid() as user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Não autenticado'
    ELSE '✅ Autenticado'
  END as status;

-- 5. VERIFICAR PERFIL DO USUÁRIO ATUAL
SELECT 
  'Perfil Atual' as info,
  nome,
  papel,
  ativo
FROM public.profiles 
WHERE user_id = auth.uid();

-- 6. TESTAR CRIAÇÃO DE USUÁRIO MANUAL
DO $$
DECLARE
  resultado JSON;
BEGIN
  RAISE NOTICE '=== TESTANDO CRIAÇÃO DE USUÁRIO ===';
  
  SELECT public.criar_usuario_auth(
    'teste_debug@exemplo.com',
    'senha123!',
    'Usuário Debug',
    'FUNCIONARIO',
    'ATENDENTE'
  ) INTO resultado;
  
  RAISE NOTICE 'Resultado: %', resultado;
END $$;

-- 7. VERIFICAR SE USUÁRIO FOI CRIADO
SELECT 
  'Usuário Criado no Auth' as info,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'teste_debug@exemplo.com';

-- 8. VERIFICAR SE PERFIL FOI CRIADO
SELECT 
  'Perfil Criado' as info,
  user_id,
  nome,
  papel,
  ativo
FROM public.profiles 
WHERE nome = 'Usuário Debug';

-- 9. VERIFICAR FUNCIONÁRIOS EXISTENTES
SELECT 
  'Funcionários Existentes' as info,
  COUNT(*) as total
FROM public.funcionarios;
