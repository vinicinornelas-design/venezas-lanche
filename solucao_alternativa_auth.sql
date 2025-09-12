-- Solução alternativa para criação de usuários
-- Execute este script no Supabase Dashboard

-- 1. CRIAR FUNÇÃO PARA CRIAR USUÁRIO DIRETAMENTE NO AUTH
CREATE OR REPLACE FUNCTION public.criar_usuario_direto(
  p_email TEXT,
  p_senha TEXT,
  p_nome TEXT,
  p_papel TEXT,
  p_cargo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  resultado JSON;
BEGIN
  -- Criar usuário diretamente no auth.users
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
    json_build_object('nome', p_nome, 'papel', p_papel, 'cargo', p_cargo),
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Criar perfil na tabela profiles
  INSERT INTO public.profiles (user_id, nome, papel, ativo)
  VALUES (user_id, p_nome, p_papel, true);

  -- Retornar resultado
  resultado := json_build_object(
    'success', true,
    'user_id', user_id,
    'message', 'Usuário criado com sucesso'
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
  RAISE NOTICE '=== TESTANDO CRIAÇÃO DIRETA ===';
  
  SELECT public.criar_usuario_direto(
    'teste_direto@exemplo.com',
    'senha123!',
    'Usuário Direto',
    'FUNCIONARIO',
    'ATENDENTE'
  ) INTO resultado;
  
  RAISE NOTICE 'Resultado: %', resultado;
END $$;

-- 3. VERIFICAR USUÁRIO CRIADO
SELECT 
  'Usuário Criado' as info,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'teste_direto@exemplo.com';

-- 4. VERIFICAR PERFIL CRIADO
SELECT 
  'Perfil Criado' as info,
  user_id,
  nome,
  papel,
  ativo
FROM public.profiles 
WHERE nome = 'Usuário Direto';

-- 5. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 FUNÇÃO ALTERNATIVA CRIADA!';
  RAISE NOTICE '✅ Agora teste o cadastro de funcionários';
END $$;
