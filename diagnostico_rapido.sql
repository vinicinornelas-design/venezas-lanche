-- Diagnóstico rápido para erro de inserção de funcionários
-- Execute este SQL no dashboard do Supabase

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
  'Verificação da tabela funcionarios' as teste,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') 
    THEN '✅ Tabela existe'
    ELSE '❌ Tabela NÃO existe'
  END as status;

-- 2. Verificar se RLS está habilitado
SELECT 
  'Verificação RLS' as teste,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'funcionarios' AND rowsecurity = true
    ) THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status;

-- 3. Verificar políticas existentes
SELECT 
  'Políticas RLS' as teste,
  COUNT(*) as total_politicas,
  STRING_AGG(policyname, ', ') as politicas
FROM pg_policies 
WHERE tablename = 'funcionarios';

-- 4. Verificar usuário atual
SELECT 
  'Usuário atual' as teste,
  auth.uid() as user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Não autenticado'
    ELSE '✅ Autenticado'
  END as status;

-- 5. Verificar se é ADMIN
SELECT 
  'Verificação ADMIN' as teste,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Não autenticado'
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    ) THEN '✅ É ADMIN'
    ELSE '❌ NÃO é ADMIN'
  END as status;

-- 6. Verificar perfil do usuário atual
SELECT 
  'Perfil do usuário' as teste,
  p.nome,
  p.papel,
  p.ativo,
  CASE WHEN p.user_id = auth.uid() THEN '👤 Atual' ELSE '' END as status
FROM public.profiles p
WHERE p.user_id = auth.uid();

-- 7. Testar SELECT na tabela funcionarios
SELECT 
  'Teste SELECT' as teste,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.funcionarios LIMIT 1) 
    THEN '✅ Pode fazer SELECT'
    ELSE '❌ NÃO pode fazer SELECT'
  END as status;

-- 8. Verificar se a função is_admin existe
SELECT 
  'Função is_admin' as teste,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'is_admin' 
      AND routine_schema = 'public'
    ) THEN '✅ Função existe'
    ELSE '❌ Função NÃO existe'
  END as status;

-- 9. Testar a função is_admin
SELECT 
  'Teste is_admin()' as teste,
  CASE 
    WHEN is_admin() THEN '✅ Retorna TRUE'
    ELSE '❌ Retorna FALSE'
  END as status;
