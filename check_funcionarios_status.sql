-- Script para verificar o status atual da tabela funcionarios
-- Execute este SQL no dashboard do Supabase para diagnosticar problemas

-- 1. Verificar se a tabela funcionarios existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') 
    THEN '✅ Tabela funcionarios existe'
    ELSE '❌ Tabela funcionarios NÃO existe'
  END as tabela_status;

-- 2. Verificar estrutura da tabela funcionarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'funcionarios' 
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 4. Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'funcionarios'
ORDER BY policyname;

-- 5. Verificar usuário atual e permissões
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Nenhum usuário autenticado'
    ELSE '✅ Usuário autenticado: ' || auth.uid()::text
  END as auth_status;

-- 6. Verificar se usuário atual é admin
SELECT 
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Nenhum usuário autenticado'
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    ) THEN '✅ Usuário atual é ADMIN'
    ELSE '❌ Usuário atual NÃO é ADMIN'
  END as admin_status;

-- 7. Verificar perfis de usuários
SELECT 
  p.id,
  p.nome,
  p.papel,
  p.ativo,
  p.user_id,
  CASE 
    WHEN p.user_id = auth.uid() THEN '👤 Usuário atual'
    ELSE ''
  END as current_user
FROM public.profiles p
ORDER BY p.papel, p.nome;

-- 8. Verificar funcionários existentes
SELECT 
  f.id,
  f.nome,
  f.email,
  f.cargo,
  f.nivel_acesso,
  f.ativo,
  f.created_at
FROM public.funcionarios f
ORDER BY f.nome;

-- 9. Testar permissões de SELECT
SELECT 
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Não pode fazer SELECT (não autenticado)'
    ELSE '✅ Pode fazer SELECT (autenticado)'
  END as select_permission;

-- 10. Testar permissões de INSERT
SELECT 
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ Não pode fazer INSERT (não autenticado)'
    WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    ) THEN '❌ Não pode fazer INSERT (não é admin)'
    ELSE '✅ Pode fazer INSERT (é admin)'
  END as insert_permission;

-- 11. Verificar se a função is_admin existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'is_admin' 
      AND routine_schema = 'public'
    ) THEN '✅ Função is_admin existe'
    ELSE '❌ Função is_admin NÃO existe'
  END as function_status;

-- 12. Verificar triggers na tabela funcionarios
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'funcionarios'
ORDER BY trigger_name;

-- 13. Verificar índices na tabela funcionarios
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'funcionarios'
ORDER BY indexname;

-- 14. Contar registros em cada tabela relacionada
SELECT 
  'profiles' as tabela,
  COUNT(*) as total_registros
FROM public.profiles
UNION ALL
SELECT 
  'funcionarios' as tabela,
  COUNT(*) as total_registros
FROM public.funcionarios
UNION ALL
SELECT 
  'auth.users' as tabela,
  COUNT(*) as total_registros
FROM auth.users;

-- 15. Verificar últimos erros de permissão (se houver logs)
-- Nota: Esta query pode não funcionar dependendo das permissões do usuário
SELECT 
  'Verificação de logs de erro não disponível para usuários não-admin' as observacao;
