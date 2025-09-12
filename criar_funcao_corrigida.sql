-- FUNÇÃO CORRIGIDA PARA CRIAR FUNCIONÁRIO COMPLETO
-- Execute este script no Supabase Dashboard

-- 1. CRIAR FUNÇÃO QUE FUNCIONA SEMPRE
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
  papel_valido TEXT;
BEGIN
  -- Mapear papel para valor sempre válido
  papel_valido := CASE 
    WHEN p_nivel_acesso = 'ADMIN' THEN 'ADMIN'
    WHEN p_nivel_acesso = 'GERENTE' THEN 'GERENTE'
    ELSE 'FUNCIONARIO'  -- Sempre FUNCIONARIO para outros casos
  END;

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

  -- Criar perfil na tabela profiles com papel sempre válido
  INSERT INTO public.profiles (user_id, nome, papel, ativo)
  VALUES (user_id, p_nome, papel_valido, true);

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
    'papel_original', p_nivel_acesso,
    'papel_usado', papel_valido,
    'message', 'Funcionário criado com sucesso em todas as tabelas'
  );

  RETURN resultado;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'papel_original', p_nivel_acesso,
    'papel_usado', papel_valido
  );
END;
$$;

-- 2. TESTAR A FUNÇÃO CORRIGIDA
DO $$
DECLARE
  resultado JSON;
BEGIN
  RAISE NOTICE '=== TESTANDO FUNÇÃO CORRIGIDA ===';
  
  SELECT public.criar_funcionario_completo(
    'teste.corrigido@exemplo.com',
    'senha123!',
    'Funcionário Teste Corrigido',
    '(31) 99999-9999',
    'ATENDENTE',
    'FUNCIONARIO'
  ) INTO resultado;
  
  RAISE NOTICE 'Resultado: %', resultado;
END $$;

-- 3. VERIFICAR TUDO CRIADO
SELECT 'AUTH USER' as tabela, id::text as id, email, created_at FROM auth.users WHERE email = 'teste.corrigido@exemplo.com'
UNION ALL
SELECT 'PROFILE' as tabela, user_id::text as id, nome as email, created_at FROM public.profiles WHERE nome = 'Funcionário Teste Corrigido'
UNION ALL
SELECT 'FUNCIONARIO' as tabela, id::text as id, nome as email, created_at FROM public.funcionarios WHERE nome = 'Funcionário Teste Corrigido';

-- 4. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 FUNÇÃO CORRIGIDA CRIADA!';
  RAISE NOTICE '✅ Sempre usa papel válido para profiles';
  RAISE NOTICE '✅ Agora deve funcionar sem erro de constraint';
END $$;
