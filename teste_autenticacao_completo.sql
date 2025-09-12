-- Teste completo de autenticação e permissões
-- Execute este SQL no dashboard do Supabase

-- 1. Verificar usuário atual e autenticação
SELECT 
  'Verificação de Autenticação' as teste,
  auth.uid() as user_id_atual,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NÃO autenticado'
    ELSE '✅ Autenticado: ' || auth.uid()::text
  END as status_auth;

-- 2. Verificar perfil do usuário atual
SELECT 
  'Perfil do Usuário' as teste,
  p.id,
  p.nome,
  p.papel,
  p.ativo,
  p.user_id,
  CASE 
    WHEN p.user_id = auth.uid() THEN '👤 Usuário atual'
    ELSE 'Outro usuário'
  END as status
FROM public.profiles p
WHERE p.user_id = auth.uid();

-- 3. Verificar se a função is_admin funciona
SELECT 
  'Teste is_admin()' as teste,
  CASE 
    WHEN is_admin() THEN '✅ Retorna TRUE (é admin)'
    ELSE '❌ Retorna FALSE (não é admin)'
  END as resultado;

-- 4. Verificar políticas RLS da tabela funcionarios
SELECT 
  'Políticas RLS' as teste,
  policyname,
  cmd as operacao,
  permissive as permissivo,
  roles,
  qual as condicao_select,
  with_check as condicao_insert
FROM pg_policies 
WHERE tablename = 'funcionarios'
ORDER BY policyname;

-- 5. Testar permissões específicas
DO $$
DECLARE
  can_select BOOLEAN;
  can_insert BOOLEAN;
  can_update BOOLEAN;
  can_delete BOOLEAN;
  test_result TEXT;
BEGIN
  -- Testar SELECT
  BEGIN
    PERFORM 1 FROM public.funcionarios LIMIT 1;
    can_select := TRUE;
  EXCEPTION WHEN OTHERS THEN
    can_select := FALSE;
  END;
  
  -- Testar INSERT
  BEGIN
    INSERT INTO public.funcionarios (
      nome, email, cargo, nivel_acesso, ativo
    ) VALUES (
      'Teste Permissão', 'teste@teste.com', 'ATENDENTE', 'FUNCIONARIO', true
    );
    can_insert := TRUE;
    -- Remover o registro de teste
    DELETE FROM public.funcionarios WHERE email = 'teste@teste.com';
  EXCEPTION WHEN OTHERS THEN
    can_insert := FALSE;
  END;
  
  -- Testar UPDATE (se houver registros)
  BEGIN
    UPDATE public.funcionarios 
    SET nome = 'Teste Update' 
    WHERE email = 'teste@teste.com';
    can_update := TRUE;
  EXCEPTION WHEN OTHERS THEN
    can_update := FALSE;
  END;
  
  -- Testar DELETE (se houver registros)
  BEGIN
    DELETE FROM public.funcionarios 
    WHERE email = 'teste@teste.com';
    can_delete := TRUE;
  EXCEPTION WHEN OTHERS THEN
    can_delete := FALSE;
  END;
  
  -- Mostrar resultados
  RAISE NOTICE '=== TESTE DE PERMISSÕES ===';
  RAISE NOTICE 'SELECT: %', CASE WHEN can_select THEN '✅ Permitido' ELSE '❌ Negado' END;
  RAISE NOTICE 'INSERT: %', CASE WHEN can_insert THEN '✅ Permitido' ELSE '❌ Negado' END;
  RAISE NOTICE 'UPDATE: %', CASE WHEN can_update THEN '✅ Permitido' ELSE '❌ Negado' END;
  RAISE NOTICE 'DELETE: %', CASE WHEN can_delete THEN '✅ Permitido' ELSE '❌ Negado' END;
  
END $$;

-- 6. Verificar se RLS está habilitado
SELECT 
  'Status RLS' as teste,
  tablename,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 7. Verificar estrutura da tabela funcionarios
SELECT 
  'Estrutura da Tabela' as teste,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'funcionarios' 
ORDER BY ordinal_position;

-- 8. Verificar funcionários existentes
SELECT 
  'Funcionários Existentes' as teste,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as nomes
FROM public.funcionarios;

-- 9. Testar inserção manual com dados específicos
DO $$
DECLARE
  test_id UUID;
  error_message TEXT;
BEGIN
  RAISE NOTICE '=== TESTE DE INSERÇÃO MANUAL ===';
  
  BEGIN
    INSERT INTO public.funcionarios (
      nome,
      email,
      telefone,
      cargo,
      nivel_acesso,
      ativo
    ) VALUES (
      'Funcionário Teste Manual',
      'teste_manual@exemplo.com',
      '(31) 99999-9999',
      'ATENDENTE',
      'FUNCIONARIO',
      true
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
    
    -- Manter o funcionário para verificação
    RAISE NOTICE '✅ Funcionário mantido para verificação na interface';
    
  EXCEPTION WHEN OTHERS THEN
    error_message := SQLERRM;
    RAISE NOTICE '❌ ERRO: %', error_message;
    RAISE NOTICE 'Código do erro: %', SQLSTATE;
  END;
END $$;

-- 10. Verificar logs de erro (se disponível)
SELECT 
  'Verificação Final' as teste,
  'Execute este teste para identificar problemas de permissão' as observacao;
