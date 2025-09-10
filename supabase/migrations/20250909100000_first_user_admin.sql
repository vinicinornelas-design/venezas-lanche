-- Cria perfil do usuário respeitando o papel escolhido no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  exists_admin BOOLEAN;
  new_user_name TEXT;
  user_papel TEXT;
BEGIN
  -- Verifica se já existe algum perfil ADMIN
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE papel = 'ADMIN') INTO exists_admin;

  new_user_name := COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo Usuário');
  user_papel := COALESCE(NEW.raw_user_meta_data->>'papel', 'FUNCIONARIO');

  -- Se não existe admin e o usuário escolheu ADMIN, permitir
  -- Se já existe admin, só permitir ADMIN se explicitamente escolhido
  IF user_papel = 'ADMIN' AND NOT exists_admin THEN
    -- Primeiro usuário pode ser ADMIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo)
    VALUES (NEW.id, new_user_name, 'ADMIN', true)
    ON CONFLICT (user_id) DO UPDATE SET nome = EXCLUDED.nome, papel = 'ADMIN', ativo = true;
  ELSIF user_papel = 'ADMIN' AND exists_admin THEN
    -- Se já existe admin, criar como FUNCIONARIO mesmo se escolheu ADMIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo)
    VALUES (NEW.id, new_user_name, 'FUNCIONARIO', true)
    ON CONFLICT (user_id) DO UPDATE SET nome = EXCLUDED.nome, papel = 'FUNCIONARIO', ativo = true;
  ELSE
    -- Usuário escolheu FUNCIONARIO ou outro papel
    INSERT INTO public.profiles (user_id, nome, papel, ativo)
    VALUES (NEW.id, new_user_name, user_papel, true)
    ON CONFLICT (user_id) DO UPDATE SET nome = EXCLUDED.nome, papel = EXCLUDED.papel, ativo = true;
  END IF;

  RETURN NEW;
END;
$$;

-- Garante o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


