-- Promove o primeiro usuário cadastrado a ADMIN. Demais entram como ATENDENTE/FUNCIONARIO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  exists_admin BOOLEAN;
  new_user_name TEXT;
BEGIN
  -- Verifica se já existe algum perfil ADMIN
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE papel = 'ADMIN') INTO exists_admin;

  new_user_name := COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo Usuário');

  IF NOT exists_admin THEN
    -- Primeiro usuário: ADMIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo)
    VALUES (NEW.id, new_user_name, 'ADMIN', true)
    ON CONFLICT (user_id) DO UPDATE SET nome = EXCLUDED.nome, papel = 'ADMIN', ativo = true;
  ELSE
    -- Demais usuários: ATENDENTE
    INSERT INTO public.profiles (user_id, nome, papel, ativo)
    VALUES (NEW.id, new_user_name, 'ATENDENTE', true)
    ON CONFLICT (user_id) DO UPDATE SET nome = EXCLUDED.nome, ativo = true;
  END IF;

  RETURN NEW;
END;
$$;

-- Garante o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


