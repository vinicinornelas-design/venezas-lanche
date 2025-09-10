# 🔧 Instruções Finais para Debug da restaurant_config

## 📋 **Problema Identificado:**
Os logs de debug não estão aparecendo no console, indicando que pode haver um problema com:
1. Cache do navegador
2. Dados não atualizados na tabela
3. Políticas RLS ainda bloqueando
4. Problema de conectividade

## 🛠️ **Passos para Resolver:**

### **1. Execute o Script de Força:**
```sql
-- No Supabase SQL Editor
-- Execute: force_update_restaurant_config.sql
```

### **2. Limpe o Cache do Navegador:**
1. **Pressione Ctrl+Shift+R** (ou Cmd+Shift+R no Mac)
2. **Ou abra DevTools (F12) → Network → Disable cache**
3. **Ou use modo incógnito**

### **3. Verifique os Logs:**
1. **Abra DevTools (F12)**
2. **Vá para Console**
3. **Recarregue a página (Ctrl+R)**
4. **Procure por:**
   ```
   === INÍCIO: Buscando configurações do restaurante ===
   ```

### **4. Se os Logs Não Aparecerem:**
Execute este comando no console do navegador:
```javascript
// Força recarregamento da página
window.location.reload(true);
```

### **5. Verifique a Rede:**
1. **DevTools → Network**
2. **Recarregue a página**
3. **Procure por requisições para Supabase**
4. **Verifique se há erros 403/404**

## 🎯 **O que Esperar:**

### **Se Funcionar:**
- ✅ Logs detalhados no console
- ✅ Logo personalizado na hero
- ✅ Informações de contato atualizadas
- ✅ Painel de debug visível

### **Se Não Funcionar:**
- ❌ Nenhum log no console
- ❌ Dados ainda hardcoded
- ❌ Erros de rede no DevTools

## 🚨 **Próximos Passos:**
1. Execute o script SQL
2. Limpe o cache
3. Verifique os logs
4. Me informe o resultado

## 📞 **Se Ainda Não Funcionar:**
Me envie:
1. Screenshot do console
2. Screenshot da aba Network
3. Resultado do script SQL
4. URL da página que está testando
