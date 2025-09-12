-- Corrigir função para criar usuário com mapeamento correto de papéis
-- Execute este script no Supabase Dashboard

-- 1. RECRIAR FUNÇÃO COM MAPEAMENTO CORRETO
CREATE OR REPLACE FUNCTION public.criar_usuario_auth(
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
  papel_corrigido TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas administradores podem criar usuários'
    );
  END IF;

  -- Mapear papel para valor aceito pela constraint
  papel_corrigido := CASE 
    WHEN p_papel = 'FUNCIONARIO' THEN 'FUNCIONARIO'
    WHEN p_papel = 'ADMIN' THEN 'ADMIN'
    WHEN p_papel = 'GERENTE' THEN 'GERENTE'
    WHEN p_papel = 'ATENDENTE' THEN 'FUNCIONARIO'
    WHEN p_papel = 'COZINHEIRO' THEN 'FUNCIONARIO'
    WHEN p_papel = 'GARCOM' THEN 'FUNCIONARIO'
    ELSE 'FUNCIONARIO'
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
    json_build_object('nome', p_nome, 'papel', p_papel, 'cargo', p_cargo),
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO user_id;

  -- Criar perfil na tabela profiles com papel corrigido
  INSERT INTO public.profiles (user_id, nome, papel, ativo)
  VALUES (user_id, p_nome, papel_corrigido, true);

  -- Retornar resultado
  resultado := json_build_object(
    'success', true,
    'user_id', user_id,
    'papel_original', p_papel,
    'papel_corrigido', papel_corrigido,
    'message', 'Usuário criado com sucesso no auth e profiles'
  );

  RETURN resultado;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'papel_original', p_papel,
    'papel_corrigido', papel_corrigido
  );
END;
$$;

-- 2. TESTAR A FUNÇÃO CORRIGIDA
DO $$
DECLARE
  resultado JSON;
BEGIN
  RAISE NOTICE '=== TESTANDO FUNÇÃO CORRIGIDA ===';
  
  SELECT public.criar_usuario_auth(
    'teste_corrigido@exemplo.com',
    'senha123!',
    'Usuário Teste Corrigido',
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
WHERE email = 'teste_corrigido@exemplo.com';

-- 4. VERIFICAR PERFIL CRIADO
SELECT 
  'Perfil Criado' as info,
  user_id,
  nome,
  papel,
  ativo
FROM public.profiles 
WHERE nome = 'Usuário Teste Corrigido';

-- 5. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 FUNÇÃO CORRIGIDA!';
  RAISE NOTICE '✅ Mapeamento de papéis implementado';
  RAISE NOTICE '✅ Agora deve funcionar sem erro de constraint';
END $$;
