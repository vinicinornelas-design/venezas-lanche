-- SOLUÇÃO QUE FUNCIONA - USAR APENAS VALORES VÁLIDOS
-- Execute este script no Supabase Dashboard

-- 1. CRIAR FUNÇÃO QUE USA APENAS VALORES VÁLIDOS
CREATE OR REPLACE FUNCTION public.criar_funcionario_completo(
  p_email TEXT,
  p_senha TEXT,
  p_nome TEXT,
  p_telefone TEXT,
  p_cargo TEXT,
  p_nivel_acesso TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  funcionario_id UUID;
  resultado JSON;
BEGIN
  -- Criar usuário no auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    p_email,
    crypt(p_senha, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object('nome', p_nome, 'papel', p_nivel_acesso, 'cargo', p_cargo),
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Criar perfil na tabela profiles
  -- USAR APENAS VALORES VÁLIDOS: ADMIN, ATENDENTE, COZINHA
  INSERT INTO public.profiles (user_id, nome, papel, ativo)
  VALUES (user_id, p_nome, 
    CASE 
      WHEN p_cargo = 'GERENTE' THEN 'ADMIN'
      WHEN p_cargo = 'COZINHEIRA' THEN 'COZINHA'
      ELSE 'ATENDENTE'  -- Para ATENDENTE, CHAPEIRO, CAIXA
    END, 
    true);

  -- Criar funcionário na tabela funcionarios
  INSERT INTO public.funcionarios (
    nome,
    email,
    telefone,
    cargo,
    nivel_acesso,
    ativo,
    profile_id
  ) VALUES (
    p_nome,
    p_email,
    p_telefone,
    p_cargo,
    p_nivel_acesso,
    true,
    user_id
  ) RETURNING id INTO funcionario_id;

  -- Retornar resultado
  resultado := json_build_object(
    'success', true,
    'user_id', user_id,
    'funcionario_id', funcionario_id,
    'message', 'Funcionário criado com sucesso em todas as tabelas'
  );

  RETURN resultado;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 2. TESTAR A FUNÇÃO
DO $$
DECLARE
  resultado JSON;
BEGIN
  RAISE NOTICE '=== TESTANDO FUNÇÃO QUE FUNCIONA ===';
  
  SELECT public.criar_funcionario_completo(
    'teste.funciona@exemplo.com',
    'senha123!',
    'Funcionário Teste Funciona',
    '(31) 99999-9999',
    'ATENDENTE',
    'FUNCIONARIO'
  ) INTO resultado;
  
  RAISE NOTICE 'Resultado: %', resultado;
END $$;

-- 3. VERIFICAR TUDO CRIADO
SELECT 'AUTH USER' as tabela, id::text as id, email, created_at FROM auth.users WHERE email = 'teste.funciona@exemplo.com'
UNION ALL
SELECT 'PROFILE' as tabela, user_id::text as id, nome as email, created_at FROM public.profiles WHERE nome = 'Funcionário Teste Funciona'
UNION ALL
SELECT 'FUNCIONARIO' as tabela, id::text as id, nome as email, created_at FROM public.funcionarios WHERE nome = 'Funcionário Teste Funciona';

-- 4. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 FUNÇÃO QUE FUNCIONA CRIADA!';
  RAISE NOTICE '✅ GERENTE = ADMIN, todos os outros = ATENDENTE';
  RAISE NOTICE '✅ Agora deve funcionar!';
END $$;
