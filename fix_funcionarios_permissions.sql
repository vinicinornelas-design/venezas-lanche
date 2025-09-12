-- Fix para permissões da tabela funcionarios
-- Execute este SQL no dashboard do Supabase

-- 1. Verificar se a tabela funcionarios existe e sua estrutura
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') THEN
    RAISE NOTICE 'Tabela funcionarios não existe. Criando...';
    
    -- Criar tabela funcionarios
    CREATE TABLE public.funcionarios (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      cargo TEXT NOT NULL,
      nivel_acesso TEXT NOT NULL DEFAULT 'FUNCIONARIO',
      ativo BOOLEAN DEFAULT true,
      profile_id UUID REFERENCES public.profiles(id),
      total_mesas_atendidas INTEGER DEFAULT 0,
      total_pedidos_processados INTEGER DEFAULT 0,
      last_activity TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Tabela funcionarios criada com sucesso.';
  ELSE
    RAISE NOTICE 'Tabela funcionarios já existe.';
  END IF;
END $$;

-- 2. Verificar e adicionar colunas que podem estar faltando
DO $$
BEGIN
  -- Verificar se a coluna profile_id existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' 
    AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
    RAISE NOTICE 'Coluna profile_id adicionada.';
  END IF;
  
  -- Verificar se a coluna total_mesas_atendidas existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' 
    AND column_name = 'total_mesas_atendidas'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN total_mesas_atendidas INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna total_mesas_atendidas adicionada.';
  END IF;
  
  -- Verificar se a coluna total_pedidos_processados existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' 
    AND column_name = 'total_pedidos_processados'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN total_pedidos_processados INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna total_pedidos_processados adicionada.';
  END IF;
  
  -- Verificar se a coluna last_activity existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' 
    AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Coluna last_activity adicionada.';
  END IF;
  
  -- Verificar se a coluna created_at existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Coluna created_at adicionada.';
  END IF;
  
  -- Verificar se a coluna updated_at existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Coluna updated_at adicionada.';
  END IF;
END $$;

-- 3. Habilitar RLS (Row Level Security) na tabela funcionarios
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "funcionarios_select_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_insert_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_update_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_delete_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "Admins podem gerenciar funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ver funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar funcionarios" ON public.funcionarios;

-- 5. Criar políticas RLS para funcionarios
-- Política para SELECT: Usuários autenticados podem ver funcionarios
CREATE POLICY "funcionarios_select_policy" ON public.funcionarios
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para INSERT: Apenas admins podem inserir funcionarios
CREATE POLICY "funcionarios_insert_policy" ON public.funcionarios
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- Política para UPDATE: Apenas admins podem atualizar funcionarios
CREATE POLICY "funcionarios_update_policy" ON public.funcionarios
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- Política para DELETE: Apenas admins podem deletar funcionarios
CREATE POLICY "funcionarios_delete_policy" ON public.funcionarios
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- 6. Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND papel = 'ADMIN'
  );
END;
$$;

-- 7. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_funcionarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_funcionarios_updated_at ON public.funcionarios;
CREATE TRIGGER trigger_update_funcionarios_updated_at
  BEFORE UPDATE ON public.funcionarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_funcionarios_updated_at();

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_funcionarios_email ON public.funcionarios(email);
CREATE INDEX IF NOT EXISTS idx_funcionarios_cargo ON public.funcionarios(cargo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_ativo ON public.funcionarios(ativo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_profile_id ON public.funcionarios(profile_id);

-- 9. Verificar se existe pelo menos um admin
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE papel = 'ADMIN';
  
  IF admin_count = 0 THEN
    RAISE NOTICE 'ATENÇÃO: Não há nenhum usuário ADMIN cadastrado!';
    RAISE NOTICE 'Você precisa ter pelo menos um usuário ADMIN para gerenciar funcionários.';
  ELSE
    RAISE NOTICE 'Encontrados % usuário(s) ADMIN.', admin_count;
  END IF;
END $$;

-- 10. Testar as permissões
DO $$
DECLARE
  current_user_id UUID;
  is_admin_user BOOLEAN;
BEGIN
  -- Verificar usuário atual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário autenticado.';
  ELSE
    RAISE NOTICE 'Usuário atual: %', current_user_id;
    
    -- Verificar se é admin
    SELECT is_admin() INTO is_admin_user;
    
    IF is_admin_user THEN
      RAISE NOTICE 'Usuário atual é ADMIN - pode gerenciar funcionários.';
    ELSE
      RAISE NOTICE 'Usuário atual NÃO é ADMIN - não pode gerenciar funcionários.';
    END IF;
  END IF;
END $$;

-- 11. Comentários para documentação
COMMENT ON TABLE public.funcionarios IS 'Tabela de funcionários do restaurante com controle de acesso baseado em roles';
COMMENT ON COLUMN public.funcionarios.cargo IS 'Cargo do funcionário: CHAPEIRO, ATENDENTE, CAIXA, COZINHEIRA, GERENTE';
COMMENT ON COLUMN public.funcionarios.nivel_acesso IS 'Nível de acesso: FUNCIONARIO ou ADMIN';
COMMENT ON COLUMN public.funcionarios.profile_id IS 'Referência ao perfil do usuário autenticado';

-- 12. Mensagem final de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Script de correção das permissões da tabela funcionarios executado com sucesso!';
  RAISE NOTICE 'Verifique os logs acima para confirmar que tudo foi configurado corretamente.';
END $$;
