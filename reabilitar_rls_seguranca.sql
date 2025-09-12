-- Reabilitar RLS e políticas de segurança
-- Execute APÓS confirmar que tudo está funcionando

-- 1. REABILITAR RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS DE SEGURANÇA
DROP POLICY IF EXISTS "Admins podem gerenciar funcionarios" ON public.funcionarios;
CREATE POLICY "Admins podem gerenciar funcionarios" ON public.funcionarios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Funcionarios podem ver seus dados" ON public.funcionarios;
CREATE POLICY "Funcionarios podem ver seus dados" ON public.funcionarios
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- 3. VERIFICAR STATUS
SELECT 
  'RLS Status' as info,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE tablename = 'funcionarios';

-- 4. VERIFICAR POLÍTICAS
SELECT 
  'Políticas RLS' as info,
  policyname as nome_politica,
  cmd as operacao,
  permissive as permissivo
FROM pg_policies 
WHERE tablename = 'funcionarios';

-- 5. MENSAGEM FINAL
DO $$
BEGIN
  RAISE NOTICE '🔒 SEGURANÇA REABILITADA!';
  RAISE NOTICE '✅ RLS habilitado';
  RAISE NOTICE '✅ Políticas de segurança criadas';
  RAISE NOTICE '✅ Sistema funcionando com segurança!';
END $$;
