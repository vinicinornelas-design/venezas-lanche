-- Correção simples para o usuário vinicius (ADMIN)
-- Execute este SQL no dashboard do Supabase

-- 1. Verificar e criar tabela funcionarios se necessário
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funcionarios') THEN
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

-- 2. Garantir estrutura correta da tabela
DO $$
BEGIN
  -- Adicionar colunas que podem estar faltando
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
  
  RAISE NOTICE '✅ Estrutura da tabela verificada';
END $$;

-- 3. Desabilitar RLS temporariamente
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 4. Testar inserção sem RLS
DO $$
DECLARE
  test_id UUID;
BEGIN
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
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO ao inserir sem RLS: %', SQLERRM;
END $$;

-- 5. Reabilitar RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas
DROP POLICY IF EXISTS "funcionarios_select_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_insert_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_update_policy" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_delete_policy" ON public.funcionarios;

-- 7. Criar políticas RLS
CREATE POLICY "funcionarios_select_policy" ON public.funcionarios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "funcionarios_insert_policy" ON public.funcionarios
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

CREATE POLICY "funcionarios_update_policy" ON public.funcionarios
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

CREATE POLICY "funcionarios_delete_policy" ON public.funcionarios
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND papel = 'ADMIN'
    )
  );

-- 8. Criar função is_admin
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

-- 9. Testar inserção com RLS
DO $$
DECLARE
  test_id UUID;
  can_insert BOOLEAN;
BEGIN
  can_insert := EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND papel = 'ADMIN'
  );
  
  IF can_insert THEN
    BEGIN
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
      
      DELETE FROM public.funcionarios WHERE id = test_id;
      RAISE NOTICE '✅ Funcionário de teste removido';
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO ao inserir com RLS: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE '❌ ERRO: Usuário não tem permissão para inserir funcionários';
  END IF;
END $$;

-- 10. Verificar resultado
SELECT 
  'Políticas RLS criadas' as status,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'funcionarios';

SELECT 
  'Funcionários existentes' as status,
  COUNT(*) as total
FROM public.funcionarios;

-- 11. Mensagem final
DO $$
BEGIN
  RAISE NOTICE '🎯 Correção aplicada com sucesso para o usuário vinicius!';
  RAISE NOTICE 'Agora teste o cadastro de funcionários na interface.';
END $$;
