# 🔧 Guia para Corrigir Erro de Cadastro de Funcionários

## 📋 Problema Identificado

O erro "Erro ao salvar funcionário" está ocorrendo porque a tabela `funcionarios` não possui as políticas de segurança (RLS - Row Level Security) configuradas corretamente.

## 🎯 Solução Passo a Passo

### Passo 1: Verificar Status Atual
1. Acesse o **Dashboard do Supabase**
2. Vá para **SQL Editor**
3. Execute o arquivo `check_funcionarios_status.sql`
4. Analise os resultados para identificar o problema

### Passo 2: Aplicar Correções
1. No **SQL Editor** do Supabase
2. Execute o arquivo `fix_funcionarios_permissions.sql`
3. Verifique se não há erros na execução
4. Confirme que todas as mensagens mostram ✅

### Passo 3: Testar as Correções
1. Execute o arquivo `test_funcionario_insert.sql`
2. Verifique se o teste de inserção foi bem-sucedido
3. Se houver erro, verifique se você está logado como ADMIN

### Passo 4: Verificar Usuário Admin
Se você não conseguir cadastrar funcionários, verifique:

1. **Você está logado como ADMIN?**
   ```sql
   SELECT 
     p.nome,
     p.papel,
     CASE WHEN p.user_id = auth.uid() THEN '👤 Usuário atual' ELSE '' END as status
   FROM public.profiles p
   WHERE p.user_id = auth.uid();
   ```

2. **Se não for ADMIN, promova seu usuário:**
   ```sql
   UPDATE public.profiles 
   SET papel = 'ADMIN' 
   WHERE user_id = auth.uid();
   ```

## 🔍 Diagnóstico Detalhado

### Possíveis Causas do Erro:

1. **RLS não habilitado** - A tabela não tem Row Level Security ativado
2. **Políticas ausentes** - Não existem políticas para INSERT/UPDATE
3. **Usuário não é ADMIN** - Apenas admins podem gerenciar funcionários
4. **Tabela não existe** - A tabela funcionarios não foi criada
5. **Estrutura incorreta** - Faltam colunas obrigatórias

### Verificações Importantes:

- ✅ Tabela `funcionarios` existe
- ✅ RLS está habilitado
- ✅ Políticas de segurança estão configuradas
- ✅ Usuário atual é ADMIN
- ✅ Função `is_admin()` existe

## 🚨 Soluções de Emergência

### Se nada funcionar, execute este comando de emergência:

```sql
-- Desabilitar RLS temporariamente (APENAS PARA TESTE)
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;

-- Testar inserção
INSERT INTO public.funcionarios (nome, email, cargo, nivel_acesso) 
VALUES ('Teste', 'teste@teste.com', 'ATENDENTE', 'FUNCIONARIO');

-- Reabilitar RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
```

## 📞 Próximos Passos

1. **Execute os scripts na ordem correta**
2. **Verifique se você está logado como ADMIN**
3. **Teste o cadastro de funcionários na interface**
4. **Se persistir o erro, verifique os logs do Supabase**

## 🔧 Arquivos Criados

- `check_funcionarios_status.sql` - Diagnóstico completo
- `fix_funcionarios_permissions.sql` - Correção das permissões
- `test_funcionario_insert.sql` - Teste de inserção
- `GUIA_CORRECAO_FUNCIONARIOS.md` - Este guia

## ⚠️ Importante

- Sempre faça backup antes de executar scripts SQL
- Execute os scripts no ambiente de desenvolvimento primeiro
- Mantenha pelo menos um usuário ADMIN sempre ativo
- Monitore os logs do Supabase para erros adicionais

## 🎯 Resultado Esperado

Após executar as correções, você deve conseguir:
- ✅ Cadastrar novos funcionários
- ✅ Editar funcionários existentes
- ✅ Deletar funcionários
- ✅ Ver lista de funcionários

Se ainda houver problemas, verifique se:
1. O usuário está autenticado
2. O usuário tem papel de ADMIN
3. A conexão com o Supabase está funcionando
4. Não há erros de JavaScript no console do navegador
