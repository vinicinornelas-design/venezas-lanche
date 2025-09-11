-- Fix para erro no cadastro de usuários
-- Execute este SQL no dashboard do Supabase

-- Primeiro, vamos verificar se a função existe e remover se necessário
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar uma versão mais simples e segura da função
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_user_name TEXT;
  user_papel TEXT;
BEGIN
  -- Obter dados do usuário
  new_user_name := COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo Usuário');
  user_papel := COALESCE(NEW.raw_user_meta_data->>'papel', 'FUNCIONARIO');

  -- Inserir perfil do usuário
  INSERT INTO public.profiles (user_id, nome, papel, ativo)
  VALUES (NEW.id, new_user_name, user_papel, true)
  ON CONFLICT (user_id) DO UPDATE SET 
    nome = EXCLUDED.nome, 
    papel = EXCLUDED.papel, 
    ativo = true;

  RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar se a tabela profiles existe e tem a estrutura correta
DO $$
BEGIN
  -- Verificar se a coluna papel existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'papel'
  ) THEN
    -- Adicionar coluna papel se não existir
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS papel TEXT DEFAULT 'FUNCIONARIO';
  END IF;
  
  -- Verificar se a coluna ativo existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'ativo'
  ) THEN
    -- Adicionar coluna ativo se não existir
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
  END IF;
END $$;
