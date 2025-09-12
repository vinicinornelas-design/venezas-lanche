-- Criar tabela funcionarios se não existir
-- Execute este script no Supabase Dashboard

-- 1. CRIAR TABELA FUNCIONARIOS
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cargo TEXT NOT NULL,
  nivel_acesso TEXT DEFAULT 'FUNCIONARIO' CHECK (nivel_acesso IN ('FUNCIONARIO', 'ADMIN')),
  ativo BOOLEAN DEFAULT TRUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_activity TIMESTAMP WITH TIME ZONE,
  total_pedidos_processados INTEGER DEFAULT 0,
  total_mesas_atendidas INTEGER DEFAULT 0
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_funcionarios_email ON public.funcionarios(email);
CREATE INDEX IF NOT EXISTS idx_funcionarios_nivel_acesso ON public.funcionarios(nivel_acesso);
CREATE INDEX IF NOT EXISTS idx_funcionarios_ativo ON public.funcionarios(ativo);

-- 3. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- 4. INSERIR FUNCIONÁRIO DE TESTE
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
);

-- 5. VERIFICAR SE FOI CRIADO E INSERIDO
SELECT 
  'Tabela Criada' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'funcionarios') 
    THEN '✅ Tabela funcionarios criada'
    ELSE '❌ Erro ao criar tabela'
  END as status;

SELECT 
  'Funcionário Inserido' as info,
  id,
  nome,
  email,
  cargo,
  nivel_acesso,
  ativo
FROM public.funcionarios 
WHERE email = 'teste@exemplo.com';

-- 6. MENSAGEM DE SUCESSO
DO $$
BEGIN
  RAISE NOTICE '🎉 TABELA FUNCIONARIOS CRIADA COM SUCESSO!';
  RAISE NOTICE '✅ Funcionário de teste inserido';
  RAISE NOTICE '✅ RLS desabilitado temporariamente';
  RAISE NOTICE '✅ Agora teste o cadastro na interface do sistema';
END $$;
