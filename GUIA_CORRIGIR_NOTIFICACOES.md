# 🔧 Guia para Corrigir o Sistema de Notificações

## 🚨 Problema Identificado
As notificações não estão funcionando porque a tabela `notifications` provavelmente não foi criada no Supabase ainda.

## ✅ Solução Passo a Passo

### 1. **Executar Script SQL no Supabase**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Clique em **SQL Editor**
4. Execute o script `fix_notifications_system.sql` que foi criado

### 2. **Verificar se Funcionou**
Após executar o script, você deve ver:
- ✅ Tabela `notifications` criada
- ✅ Trigger `trigger_new_order_notification` ativo
- ✅ Uma notificação de teste inserida

### 3. **Testar o Sistema**
1. Acesse a página **Notificações** no sistema
2. Clique no botão **"Testar Notificação"** (azul)
3. Verifique se a notificação aparece na lista
4. Teste criar um novo pedido para ver se a notificação automática funciona

## 🔍 Diagnóstico

### Se ainda não funcionar:

#### **Verificar Console do Navegador:**
1. Abra o DevTools (F12)
2. Vá para a aba **Console**
3. Procure por erros relacionados a notificações

#### **Verificar Permissões do Navegador:**
1. Clique no ícone de notificação na barra de endereços
2. Certifique-se que as notificações estão **permitidas**
3. Se estiver bloqueado, clique em **"Permitir"**

#### **Verificar Configurações:**
1. Na página de notificações, verifique se as configurações estão habilitadas:
   - ✅ Som de notificação
   - ✅ Notificações do sistema
   - ✅ Notificações de pedidos

## 📋 Scripts Disponíveis

### `fix_notifications_system.sql`
- **Função**: Cria a tabela e configura tudo automaticamente
- **Quando usar**: Primeira vez ou se algo estiver quebrado

### `test_notifications.sql`
- **Função**: Verifica se a tabela existe e insere notificação de teste
- **Quando usar**: Para diagnosticar problemas

### `insert_test_notification.sql`
- **Função**: Insere uma notificação de teste específica
- **Quando usar**: Para testar se o sistema está funcionando

## 🎯 Como Funciona o Sistema

### **Fluxo de Notificação:**
1. **Novo pedido** é criado (mesa ou delivery)
2. **Trigger automático** detecta a inserção
3. **Notificação é criada** na tabela `notifications`
4. **Supabase Realtime** envia a notificação para o frontend
5. **Hook useNotifications** recebe e exibe a notificação
6. **Badge no header** é atualizado
7. **Som e desktop notification** são reproduzidos

### **Tipos de Notificação:**
- 🛒 **NEW_ORDER**: Novos pedidos (prioridade HIGH)
- ✅ **ORDER_UPDATE**: Atualizações de pedidos
- ⚙️ **SYSTEM**: Notificações do sistema
- ℹ️ **INFO**: Informações gerais

## 🚀 Próximos Passos

1. **Execute o script SQL** no Supabase
2. **Teste o botão** "Testar Notificação"
3. **Crie um novo pedido** para verificar notificações automáticas
4. **Configure as permissões** do navegador se necessário

## 📞 Suporte

Se ainda houver problemas após seguir este guia:
1. Verifique o console do navegador para erros
2. Confirme que o script SQL foi executado com sucesso
3. Teste com diferentes tipos de pedidos (mesa e delivery)

---

**Status**: ✅ Sistema implementado e pronto para uso após configuração do banco
