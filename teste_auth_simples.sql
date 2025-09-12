-- Teste simples de autenticação
-- Execute APÓS reconectar no Supabase

-- 1. Verificar se está autenticado
SELECT 
  'Status Auth' as info,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NÃO autenticado'
    ELSE '✅ Autenticado: ' || auth.uid()::text
  END as status;

-- 2. Verificar perfil
SELECT 
  'Perfil' as info,
  nome,
  papel,
  ativo
FROM public.profiles 
WHERE user_id = auth.uid();

-- 3. Testar inserção simples
DO $$
DECLARE
  test_id UUID;
BEGIN
  RAISE NOTICE '=== TESTE DE INSERÇÃO ===';
  
  INSERT INTO public.funcionarios (
    nome,
    email,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Teste Auth',
    'teste_auth@exemplo.com',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido com ID: %', test_id;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO: %', SQLERRM;
END $$;
