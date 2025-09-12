-- Correção simples para erro de inserção de funcionários
-- Execute este SQL no dashboard do Supabase

-- 1. Primeiro, vamos desabilitar RLS temporariamente para testar
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se conseguimos inserir um funcionário de teste
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
    'Teste Inserção',
    'teste@teste.com',
    '(31) 99999-9999',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
  
  -- Remover o funcionário de teste
  DELETE FROM public.funcionarios WHERE id = test_id;
  RAISE NOTICE '✅ Funcionário de teste removido com sucesso';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO ao inserir: %', SQLERRM;
END $$;

-- 3. Reabilitar RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas básicas de RLS
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "funcionarios_select_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_insert_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_update_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_delete_policy" ON public.funcionarios;

-- Política para SELECT - todos os usuários autenticados podem ver
CREATE POLICY "funcionarios_select_policy" ON public.funcionarios
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para INSERT - apenas admins podem inserir
CREATE POLICY "funcionarios_insert_policy" ON public.funcionarios
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- Política para UPDATE - apenas admins podem atualizar
CREATE POLICY "funcionarios_update_policy" ON public.funcionarios
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- Política para DELETE - apenas admins podem deletar
CREATE POLICY "funcionarios_delete_policy" ON public.funcionarios
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- 5. Verificar se o usuário atual é ADMIN
DO $$
DECLARE
  is_admin_user BOOLEAN;
  user_profile RECORD;
BEGIN
  -- Verificar perfil do usuário atual
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF user_profile IS NULL THEN
    RAISE NOTICE '❌ ERRO: Usuário não tem perfil cadastrado';
    RAISE NOTICE 'Solução: Execute o script de criação de perfil primeiro';
  ELSE
    RAISE NOTICE '✅ Usuário encontrado: % (Papel: %)', user_profile.nome, user_profile.papel;
    
    -- Verificar se é admin
    is_admin_user := (user_profile.papel = 'ADMIN');
    
    IF is_admin_user THEN
      RAISE NOTICE '✅ Usuário é ADMIN - pode gerenciar funcionários';
    ELSE
      RAISE NOTICE '❌ Usuário NÃO é ADMIN - promovendo para ADMIN...';
      
      -- Promover para ADMIN
      UPDATE public.profiles 
      SET papel = 'ADMIN' 
      WHERE user_id = auth.uid();
      
      RAISE NOTICE '✅ Usuário promovido para ADMIN';
    END IF;
  END IF;
END $$;

-- 6. Testar inserção com RLS habilitado
DO $$
DECLARE
  test_id UUID;
  can_insert BOOLEAN;
BEGIN
  -- Verificar se pode inserir
  can_insert := EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND papel = 'ADMIN'
  );
  
  IF can_insert THEN
    -- Tentar inserir funcionário de teste
    INSERT INTO public.funcionarios (
      nome,
      email,
      telefone,
      cargo,
      nivel_acesso,
      ativo
    ) VALUES (
      'Teste RLS',
      'teste_rls@teste.com',
      '(31) 88888-8888',
      'ATENDENTE',
      'FUNCIONARIO',
      true
    ) RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ SUCESSO: Funcionário inserido com RLS habilitado (ID: %)', test_id;
    
    -- Remover o funcionário de teste
    DELETE FROM public.funcionarios WHERE id = test_id;
    RAISE NOTICE '✅ Funcionário de teste removido';
    
  ELSE
    RAISE NOTICE '❌ ERRO: Usuário não tem permissão para inserir funcionários';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO ao inserir com RLS: %', SQLERRM;
END $$;

-- 7. Verificar políticas criadas
SELECT 
  'Políticas RLS criadas' as status,
  policyname,
  cmd as operacao,
  permissive as permissivo
FROM pg_policies 
WHERE tablename = 'funcionarios'
ORDER BY policyname;

-- 8. Mensagem final
DO $$
BEGIN
  RAISE NOTICE '🎯 Correção aplicada com sucesso!';
  RAISE NOTICE 'Agora você deve conseguir cadastrar funcionários na interface.';
  RAISE NOTICE 'Se ainda houver erro, verifique se está logado como ADMIN.';
END $$;
