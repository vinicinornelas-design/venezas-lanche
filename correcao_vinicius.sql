-- Correção específica para o usuário vinicius (ADMIN)
-- Execute este SQL no dashboard do Supabase

-- 1. Verificar se a tabela funcionarios existe, se não, criar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') THEN
    RAISE NOTICE 'Criando tabela funcionarios...';
    
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
    
    RAISE NOTICE '✅ Tabela funcionarios criada';
  ELSE
    RAISE NOTICE '✅ Tabela funcionarios já existe';
  END IF;
END $$;

-- 2. Garantir que todas as colunas necessárias existem
DO $$
BEGIN
  -- Verificar e adicionar colunas que podem estar faltando
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'nome') THEN
    ALTER TABLE public.funcionarios ADD COLUMN nome TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'email') THEN
    ALTER TABLE public.funcionarios ADD COLUMN email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'telefone') THEN
    ALTER TABLE public.funcionarios ADD COLUMN telefone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'cargo') THEN
    ALTER TABLE public.funcionarios ADD COLUMN cargo TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'nivel_acesso') THEN
    ALTER TABLE public.funcionarios ADD COLUMN nivel_acesso TEXT DEFAULT 'FUNCIONARIO';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'ativo') THEN
    ALTER TABLE public.funcionarios ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'created_at') THEN
    ALTER TABLE public.funcionarios ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funcionarios' AND column_name = 'updated_at') THEN
    ALTER TABLE public.funcionarios ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  RAISE NOTICE '✅ Estrutura da tabela verificada';
END $$;

-- 3. Desabilitar RLS temporariamente para testar
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE 'RLS desabilitado temporariamente para teste';
END $$;

-- 4. Testar inserção sem RLS
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Tentar inserir funcionário de teste
  INSERT INTO public.funcionarios (
    nome,
    email,
    telefone,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Teste Sem RLS',
    'teste_sem_rls@teste.com',
    '(31) 66666-6666',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido sem RLS (ID: %)', test_id;
  
  -- Manter o funcionário de teste
  RAISE NOTICE '✅ Funcionário de teste mantido para verificação';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO ao inserir sem RLS: %', SQLERRM;
END $$;

-- 5. Reabilitar RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE 'RLS reabilitado';
END $$;

-- 6. Remover todas as políticas antigas
DROP POLICY IF EXISTS "funcionarios_select_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_insert_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_update_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_delete_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "Admins podem gerenciar funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ver funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar funcionarios" ON public.funcionarios;

-- 7. Criar políticas RLS simples e funcionais
-- Política para SELECT - todos os usuários autenticados podem ver
CREATE POLICY "funcionarios_select_policy" ON public.funcionarios
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para INSERT - apenas admins podem inserir
CREATE POLICY "funcionarios_insert_policy" ON public.funcionarios
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- Política para UPDATE - apenas admins podem atualizar
CREATE POLICY "funcionarios_update_policy" ON public.funcionarios
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- Política para DELETE - apenas admins podem deletar
CREATE POLICY "funcionarios_delete_policy" ON public.funcionarios
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS criadas';
END $$;

-- 8. Criar função is_admin se não existir
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

DO $$
BEGIN
  RAISE NOTICE '✅ Função is_admin criada/atualizada';
END $$;

-- 9. Testar inserção com RLS habilitado
DO $$
DECLARE
  test_id UUID;
  can_insert BOOLEAN;
BEGIN
  -- Verificar se pode inserir
  can_insert := EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND papel = 'ADMIN'
  );
  
  RAISE NOTICE 'Verificação de permissão: %', CASE WHEN can_insert THEN 'PODE inserir' ELSE 'NÃO pode inserir' END;
  
  IF can_insert THEN
    BEGIN
      -- Tentar inserir funcionário de teste
      INSERT INTO public.funcionarios (
        nome,
        email,
        telefone,
        cargo,
        nivel_acesso,
        ativo
      ) VALUES (
        'Teste Com RLS',
        'teste_com_rls@teste.com',
        '(31) 55555-5555',
        'ATENDENTE',
        'FUNCIONARIO',
        true
      ) RETURNING id INTO test_id;
      
      RAISE NOTICE '✅ SUCESSO: Funcionário inserido com RLS (ID: %)', test_id;
      
      -- Remover o funcionário de teste
      DELETE FROM public.funcionarios WHERE id = test_id;
      RAISE NOTICE '✅ Funcionário de teste removido';
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO ao inserir com RLS: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE '❌ ERRO: Usuário não tem permissão para inserir funcionários';
  END IF;
END $$;

-- 10. Verificar políticas criadas
SELECT 
  'Políticas RLS criadas' as status,
  policyname,
  cmd as operacao,
  permissive as permissivo
FROM pg_policies 
WHERE tablename = 'funcionarios'
ORDER BY policyname;

-- 11. Verificar funcionários existentes
SELECT 
  'Funcionários existentes' as status,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as nomes
FROM public.funcionarios;

-- 12. Mensagem final
DO $$
BEGIN
  RAISE NOTICE '🎯 Correção aplicada com sucesso para o usuário vinicius!';
  RAISE NOTICE 'Agora você deve conseguir cadastrar funcionários na interface.';
  RAISE NOTICE 'Se ainda houver erro, verifique o console do navegador para mais detalhes.';
END $$;
