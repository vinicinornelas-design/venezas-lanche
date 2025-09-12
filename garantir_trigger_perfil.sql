-- GARANTIR QUE O TRIGGER CRIE PERFIL AUTOMATICAMENTE
-- Execute este SQL no dashboard do Supabase

-- 1. VERIFICAR SE O TRIGGER EXISTE
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. REMOVER TRIGGER E FUNÇÃO EXISTENTES (SE HOUVER)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. CRIAR FUNÇÃO ROBUSTA PARA CRIAR PERFIL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_user_name TEXT;
  user_papel TEXT;
  user_email TEXT;
BEGIN
  -- Obter dados do usuário
  new_user_name := COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo Usuário');
  user_papel := COALESCE(NEW.raw_user_meta_data->>'papel', 'FUNCIONARIO');
  user_email := NEW.email;

  -- Se não tem nome, usar parte do email
  IF new_user_name = 'Novo Usuário' AND user_email IS NOT NULL THEN
    new_user_name := split_part(user_email, '@', 1);
  END IF;

  -- Garantir que o papel é válido
  user_papel := CASE 
    WHEN user_papel IN ('ADMIN', 'FUNCIONARIO', 'CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA') THEN user_papel
    ELSE 'FUNCIONARIO'
  END;

  -- Inserir perfil do usuário
  INSERT INTO public.profiles (user_id, nome, papel, ativo)
  VALUES (NEW.id, new_user_name, user_papel, true)
  ON CONFLICT (user_id) DO UPDATE SET 
    nome = EXCLUDED.nome, 
    papel = EXCLUDED.papel, 
    ativo = true;

  -- Log de sucesso
  RAISE NOTICE 'Perfil criado para usuário: % (ID: %)', new_user_name, NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro mas não falha o trigger
  RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. CRIAR O TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. TESTAR O TRIGGER (OPCIONAL - REMOVER APÓS TESTE)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
-- VALUES (gen_random_uuid(), 'teste@exemplo.com', crypt('123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email"}', '{"nome":"Usuário Teste","papel":"FUNCIONARIO"}');

-- 6. VERIFICAR SE O TRIGGER FOI CRIADO
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. VERIFICAR USUÁRIOS SEM PERFIL (ANTES DA CORREÇÃO)
SELECT 
  'ANTES' as status,
  COUNT(*) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 8. CRIAR PERFIS PARA USUÁRIOS EXISTENTES SEM PERFIL
INSERT INTO public.profiles (user_id, nome, papel, ativo)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1), 'Usuário'),
  'FUNCIONARIO',
  true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 9. VERIFICAR USUÁRIOS SEM PERFIL (APÓS A CORREÇÃO)
SELECT 
  'DEPOIS' as status,
  COUNT(*) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 10. RELATÓRIO FINAL
SELECT 
  u.email,
  p.nome,
  p.papel,
  p.ativo,
  u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 TRIGGER CONFIGURADO COM SUCESSO!';
  RAISE NOTICE '✅ Função handle_new_user() criada e otimizada.';
  RAISE NOTICE '✅ Trigger on_auth_user_created ativo.';
  RAISE NOTICE '✅ Perfis criados para usuários existentes sem perfil.';
  RAISE NOTICE '✅ Novos usuários terão perfil criado automaticamente.';
END $$;
