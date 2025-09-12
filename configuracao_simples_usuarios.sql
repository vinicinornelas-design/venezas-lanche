-- Configuração simples para criação de usuários
-- Execute este script no Supabase Dashboard

-- 1. CRIAR FUNÇÃO is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND papel = 'ADMIN'
  );
END;
$$;

-- 2. VERIFICAR SE FUNÇÃO FOI CRIADA
SELECT 
  'Função is_admin' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') 
    THEN '✅ Criada com sucesso'
    ELSE '❌ Erro ao criar'
  END as status;

-- 3. CRIAR POLÍTICAS RLS PARA FUNCIONARIOS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Admins podem gerenciar funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Funcionarios podem ver seus dados" ON public.funcionarios;

-- Criar políticas
CREATE POLICY "Admins podem gerenciar funcionarios" ON public.funcionarios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Funcionarios podem ver seus dados" ON public.funcionarios
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- 4. VERIFICAR POLÍTICAS
SELECT 
  'Políticas RLS' as info,
  policyname as nome_politica,
  cmd as operacao
FROM pg_policies 
WHERE tablename = 'funcionarios';

-- 5. TESTAR FUNÇÃO is_admin
SELECT 
  'Teste is_admin' as info,
  CASE 
    WHEN is_admin() THEN '✅ Retorna TRUE (é admin)'
    ELSE '❌ Retorna FALSE (não é admin)'
  END as resultado;

-- 6. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🎉 CONFIGURAÇÃO CONCLUÍDA!';
  RAISE NOTICE '✅ Função is_admin criada';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '✅ Sistema pronto para criar funcionários com login!';
END $$;
