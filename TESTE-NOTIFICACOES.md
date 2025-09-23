# 🔔 TESTE DO SISTEMA DE NOTIFICAÇÕES

## ✅ STATUS ATUAL
- **Tabela habilitada**: `pedidos_unificados` já está na publicação `supabase_realtime`
- **Sistema implementado**: Notificações em tempo real funcionando
- **Deploy realizado**: Commit `a80951e2` enviado

## 🧪 COMO TESTAR

### 1. **Execute o Script de Teste**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: testar_notificacoes_funcionando.sql
```

### 2. **Abra o Sistema de Gestão**
- Acesse a página de administração
- Mantenha o console aberto (F12)
- Procure por: "🔔 Sistema de notificações inicializado"

### 3. **Teste Manual**
- Faça um pedido pelo cardápio público
- Observe se aparece a notificação
- Verifique se o som toca

### 4. **Verificar Logs**
- Console deve mostrar:
  ```
  🔔 Sistema de notificações inicializado
  🔔 Novo pedido detectado: {payload}
  ```

## 🎯 COMPORTAMENTO ESPERADO

### **Quando um novo pedido for criado:**

1. **🔊 Som**: Toca automaticamente
2. **📱 Toast**: Aparece com:
   - Título: "🆕 Novo Pedido!"
   - Descrição: "Pedido #1234 - Nome do Cliente"
   - Botões: "Marcar como visto" e "Conferir pedido"

3. **💾 Persistência**: Notificação salva no localStorage
4. **📊 Contador**: Atualiza número de não lidas

## 🔍 DEBUG

### **Se não funcionar:**

1. **Verifique Console**:
   - Erro de conexão Supabase?
   - "Sistema de notificações inicializado"?

2. **Verifique Supabase**:
   - Tabela na publicação?
   - RLS habilitado?
   - Permissões corretas?

3. **Teste Manual**:
   - Execute `testar_notificacoes_funcionando.sql`
   - Verifique se o pedido foi inserido
   - Confirme se a notificação apareceu

## 📋 CHECKLIST DE TESTE

- [ ] Sistema de gestão aberto
- [ ] Console aberto (F12)
- [ ] Log "🔔 Sistema de notificações inicializado" aparece
- [ ] Fazer pedido pelo cardápio público
- [ ] Som de notificação toca
- [ ] Toast aparece com informações do pedido
- [ ] Botão "Marcar como visto" funciona
- [ ] Botão "Conferir pedido" abre página de pedidos
- [ ] Notificação aparece na página de Notificações

## 🚀 PRÓXIMOS PASSOS

1. **Execute** o script de teste
2. **Confirme** que as notificações estão funcionando
3. **Teste** fazendo pedidos reais
4. **Reporte** qualquer problema encontrado

## 📞 SUPORTE

Se houver problemas:
- Verifique os logs do console
- Confirme configurações do Supabase
- Teste com o script SQL fornecido
