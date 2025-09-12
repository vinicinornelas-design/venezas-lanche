-- Diagnóstico específico para o usuário vinicius (ADMIN)
-- Execute este SQL no dashboard do Supabase

-- 1. Confirmar dados do usuário atual
SELECT 
  'Dados do usuário atual' as info,
  auth.uid() as user_id,
  p.nome,
  p.papel,
  p.ativo,
  CASE WHEN p.user_id = auth.uid() THEN '✅ Usuário confirmado' ELSE '❌ Usuário não encontrado' END as status
FROM public.profiles p
WHERE p.user_id = auth.uid();

-- 2. Verificar se a tabela funcionarios existe
SELECT 
  'Verificação da tabela' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') 
    THEN '✅ Tabela funcionarios existe'
    ELSE '❌ Tabela funcionarios NÃO existe'
  END as status;

-- 3. Verificar estrutura da tabela funcionarios
SELECT 
  'Estrutura da tabela' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'funcionarios' 
ORDER BY ordinal_position;

-- 4. Verificar se RLS está habilitado
SELECT 
  'Status RLS' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'funcionarios' AND rowsecurity = true
    ) THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status;

-- 5. Verificar políticas RLS existentes
SELECT 
  'Políticas RLS' as info,
  policyname,
  cmd as operacao,
  permissive as permissivo,
  roles
FROM pg_policies 
WHERE tablename = 'funcionarios'
ORDER BY policyname;

-- 6. Testar SELECT na tabela funcionarios
SELECT 
  'Teste SELECT' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.funcionarios LIMIT 1) 
    THEN '✅ Pode fazer SELECT'
    ELSE '❌ NÃO pode fazer SELECT'
  END as status;

-- 7. Verificar se a função is_admin existe e funciona
SELECT 
  'Função is_admin' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'is_admin' 
      AND routine_schema = 'public'
    ) THEN '✅ Função existe'
    ELSE '❌ Função NÃO existe'
  END as status;

-- 8. Testar a função is_admin
SELECT 
  'Teste is_admin()' as info,
  CASE 
    WHEN is_admin() THEN '✅ Retorna TRUE (é admin)'
    ELSE '❌ Retorna FALSE (não é admin)'
  END as status;

-- 9. Verificar funcionários existentes
SELECT 
  'Funcionários existentes' as info,
  COUNT(*) as total_funcionarios,
  STRING_AGG(nome, ', ') as nomes
FROM public.funcionarios;

-- 10. Testar inserção com RLS habilitado
DO $$
DECLARE
  test_id UUID;
  can_insert BOOLEAN;
  error_message TEXT;
BEGIN
  -- Verificar se pode inserir
  can_insert := EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND papel = 'ADMIN'
  );
  
  RAISE NOTICE 'Verificação de permissão: %', CASE WHEN can_insert THEN 'PODE inserir' ELSE 'NÃO pode inserir' END;
  
  IF can_insert THEN
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
        'Teste Vinicius',
        'teste_vinicius@teste.com',
        '(31) 77777-7777',
        'ATENDENTE',
        'FUNCIONARIO',
        true
      ) RETURNING id INTO test_id;
      
      RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
      
      -- Remover o funcionário de teste
      DELETE FROM public.funcionarios WHERE id = test_id;
      RAISE NOTICE '✅ Funcionário de teste removido';
      
    EXCEPTION WHEN OTHERS THEN
      error_message := SQLERRM;
      RAISE NOTICE '❌ ERRO ao inserir: %', error_message;
    END;
  ELSE
    RAISE NOTICE '❌ ERRO: Usuário não tem permissão para inserir funcionários';
  END IF;
END $$;

-- 11. Verificar logs de erro recentes (se disponível)
SELECT 
  'Verificação de logs' as info,
  'Execute este diagnóstico para identificar o problema específico' as observacao;
