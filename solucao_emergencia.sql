-- SOLUÇÃO DE EMERGÊNCIA - Desabilitar RLS temporariamente
-- ⚠️ ATENÇÃO: Use apenas para teste. Reabilite RLS após resolver o problema.

-- 1. Desabilitar RLS completamente
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se a tabela tem a estrutura correta
DO $$
BEGIN
  -- Verificar se todas as colunas necessárias existem
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' AND column_name = 'nome'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN nome TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN email TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' AND column_name = 'cargo'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN cargo TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' AND column_name = 'nivel_acesso'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN nivel_acesso TEXT DEFAULT 'FUNCIONARIO';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE public.funcionarios ADD COLUMN ativo BOOLEAN DEFAULT true;
  END IF;
  
  RAISE NOTICE '✅ Estrutura da tabela verificada e corrigida';
END $$;

-- 3. Testar inserção sem RLS
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Inserir funcionário de teste
  INSERT INTO public.funcionarios (
    nome,
    email,
    telefone,
    cargo,
    nivel_acesso,
    ativo
  ) VALUES (
    'Funcionário Teste',
    'teste@exemplo.com',
    '(31) 99999-9999',
    'ATENDENTE',
    'FUNCIONARIO',
    true
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ SUCESSO: Funcionário inserido sem RLS (ID: %)', test_id;
  
  -- Manter o funcionário de teste para verificar na interface
  RAISE NOTICE '✅ Funcionário de teste mantido para verificação';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO: %', SQLERRM;
END $$;

-- 4. Verificar funcionários existentes
SELECT 
  'Funcionários existentes' as status,
  COUNT(*) as total,
  STRING_AGG(nome, ', ') as nomes
FROM public.funcionarios;

-- 5. Instruções para reabilitar RLS (quando resolver o problema)
DO $$
BEGIN
  RAISE NOTICE '⚠️  IMPORTANTE: RLS está DESABILITADO temporariamente';
  RAISE NOTICE 'Para reabilitar RLS, execute:';
  RAISE NOTICE 'ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora teste o cadastro de funcionários na interface.';
  RAISE NOTICE 'Se funcionar, o problema era de permissões RLS.';
END $$;
