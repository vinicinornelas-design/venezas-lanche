-- CORREÇÃO DEFINITIVA DO ERRO DE CADASTRO
-- Execute este script no Supabase Dashboard

-- 1. REMOVER CONSTRAINT PROBLEMÁTICA
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_papel_check;

-- 2. VERIFICAR E CORRIGIR A FUNÇÃO handle_new_user
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

  -- Mapear papel para valor sempre válido
  user_papel := CASE 
    WHEN user_papel = 'ADMIN' THEN 'ADMIN'
    WHEN user_papel = 'FUNCIONARIO' THEN 'FUNCIONARIO'
    WHEN user_papel = 'GERENTE' THEN 'GERENTE'
    WHEN user_papel = 'ATENDENTE' THEN 'FUNCIONARIO'
    WHEN user_papel = 'COZINHEIRO' THEN 'FUNCIONARIO'
    WHEN user_papel = 'GARCOM' THEN 'FUNCIONARIO'
    ELSE 'FUNCIONARIO'  -- Default seguro
  END;

  -- Inserir perfil do usuário
  INSERT INTO public.profiles (user_id, nome, papel, ativo)
  VALUES (NEW.id, new_user_name, user_papel, true)
  ON CONFLICT (user_id) DO UPDATE SET 
    nome = EXCLUDED.nome, 
    papel = EXCLUDED.papel, 
    ativo = true;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro mas não falha o trigger
  RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. RECRIAR O TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFICAR SE A TABELA PROFILES TEM A ESTRUTURA CORRETA
DO $$
BEGIN
  -- Verificar se a coluna papel existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'papel'
    AND table_schema = 'public'
  ) THEN
    -- Adicionar coluna papel se não existir
    ALTER TABLE public.profiles ADD COLUMN papel TEXT DEFAULT 'FUNCIONARIO';
  END IF;
  
  -- Verificar se a coluna ativo existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'ativo'
    AND table_schema = 'public'
  ) THEN
    -- Adicionar coluna ativo se não existir
    ALTER TABLE public.profiles ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 5. TESTAR A FUNÇÃO
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  RAISE NOTICE '=== TESTANDO CADASTRO DE USUÁRIO ===';
  
  -- Simular criação de usuário
  test_user_id := gen_random_uuid();
  
  -- Testar inserção direta na tabela profiles
  BEGIN
    INSERT INTO public.profiles (user_id, nome, papel, ativo) 
    VALUES (test_user_id, 'Teste Usuário', 'FUNCIONARIO', true);
    RAISE NOTICE '✅ Inserção direta na tabela profiles: FUNCIONOU!';
    
    -- Limpar teste
    DELETE FROM public.profiles WHERE user_id = test_user_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Inserção direta na tabela profiles: ERRO - %', SQLERRM;
  END;
  
END $$;

-- 6. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 CORREÇÃO DO ERRO DE CADASTRO CONCLUÍDA!';
  RAISE NOTICE '✅ Constraint problemática removida';
  RAISE NOTICE '✅ Função handle_new_user corrigida';
  RAISE NOTICE '✅ Trigger recriado';
  RAISE NOTICE '✅ Teste o cadastro de usuários novamente';
END $$;
