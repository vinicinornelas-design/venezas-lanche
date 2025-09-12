-- SOLUÇÃO: Criar perfil para usuários que não possuem
-- Execute este SQL no dashboard do Supabase

-- 1. VERIFICAR USUÁRIOS SEM PERFIL
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.nome,
  p.papel
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 2. CRIAR PERFIS PARA USUÁRIOS SEM PERFIL
INSERT INTO public.profiles (user_id, nome, papel, ativo)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1), 'Usuário'),
  'FUNCIONARIO', -- Papel padrão
  true
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 3. VERIFICAR SE FOI CRIADO CORRETAMENTE
SELECT 
  u.id,
  u.email,
  p.nome,
  p.papel,
  p.ativo
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- 4. ATUALIZAR FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE SE NÃO EXISTIR
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Verificar se o perfil existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = ensure_user_profile.user_id) THEN
    -- Buscar dados do usuário
    INSERT INTO public.profiles (user_id, nome, papel, ativo)
    SELECT 
      u.id,
      COALESCE(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1), 'Usuário'),
      'FUNCIONARIO',
      true
    FROM auth.users u
    WHERE u.id = ensure_user_profile.user_id;
  END IF;
END;
$$;

-- 5. CRIAR FUNÇÃO PARA ATUALIZAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(user_id UUID)
RETURNS TABLE(nome TEXT, papel TEXT, ativo BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Garantir que o perfil existe
  PERFORM public.ensure_user_profile(user_id);
  
  -- Retornar o perfil
  RETURN QUERY
  SELECT p.nome, p.papel, p.ativo
  FROM public.profiles p
  WHERE p.user_id = get_or_create_user_profile.user_id;
END;
$$;

-- MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 CORREÇÃO APLICADA!';
  RAISE NOTICE '✅ Perfis criados para usuários sem perfil.';
  RAISE NOTICE '✅ Função ensure_user_profile() criada.';
  RAISE NOTICE '✅ Função get_or_create_user_profile() criada.';
  RAISE NOTICE '✅ Agora o sistema criará perfis automaticamente quando necessário.';
END $$;
