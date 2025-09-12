-- Script para testar inserção de funcionário
-- Execute este SQL no dashboard do Supabase para testar as permissões

-- 1. Verificar se podemos inserir um funcionário de teste
DO $$
DECLARE
  test_result TEXT;
  inserted_id UUID;
BEGIN
  -- Tentar inserir um funcionário de teste
  BEGIN
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
    ) RETURNING id INTO inserted_id;
    
    test_result := '✅ SUCESSO: Funcionário inserido com ID: ' || inserted_id;
    
    -- Remover o funcionário de teste
    DELETE FROM public.funcionarios WHERE id = inserted_id;
    
  EXCEPTION WHEN OTHERS THEN
    test_result := '❌ ERRO: ' || SQLERRM;
  END;
  
  RAISE NOTICE '%', test_result;
END $$;

-- 2. Verificar permissões específicas
SELECT 
  'Teste de permissões para tabela funcionarios' as teste,
  CASE 
    WHEN auth.uid() IS NULL THEN 'Usuário não autenticado'
    ELSE 'Usuário autenticado: ' || auth.uid()::text
  END as usuario_atual,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    ) THEN 'É ADMIN - pode gerenciar funcionários'
    ELSE 'NÃO é ADMIN - não pode gerenciar funcionários'
  END as permissao_admin;

-- 3. Verificar se a tabela está acessível
SELECT 
  'Verificação de acesso à tabela funcionarios' as teste,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.funcionarios LIMIT 1) 
    THEN '✅ Pode fazer SELECT na tabela funcionarios'
    ELSE '❌ NÃO pode fazer SELECT na tabela funcionarios'
  END as select_test;
