# 🔧 **DEBUG: Botão "Gerenciar Adicionais" não aparece**

## 📋 **Possíveis Causas e Soluções**

### **1. Cache do Navegador**
- **Problema**: O navegador pode estar usando uma versão antiga do código
- **Solução**: 
  - Pressione `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)
  - Ou abra o DevTools (F12) → Network → marque "Disable cache"

### **2. Servidor de Desenvolvimento não está rodando**
- **Problema**: O servidor pode não estar rodando
- **Solução**:
  ```bash
  cd /Users/viniciusornelas/Downloads/venezas-lanche-main-4/venezas-lanche
  npm run dev
  ```

### **3. Erro de Compilação**
- **Problema**: Pode haver um erro que impede o componente de renderizar
- **Solução**:
  - Abra o DevTools (F12) → Console
  - Verifique se há erros em vermelho
  - Se houver, me envie o erro

### **4. Permissões de Usuário**
- **Problema**: O usuário pode não ter permissão para ver o botão
- **Solução**:
  - Faça login como administrador
  - Verifique se tem acesso à "Gestão do Cardápio"

## 🔍 **Como Verificar**

### **Passo 1: Verificar se o componente está sendo renderizado**
1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Procure por mensagens de erro em vermelho
4. Se houver erros, me envie uma captura de tela

### **Passo 2: Verificar se o botão está no HTML**
1. Abra o DevTools (F12)
2. Vá para a aba "Elements"
3. Procure por "Gerenciar Adicionais"
4. Se não encontrar, o componente não está sendo renderizado

### **Passo 3: Verificar se o servidor está rodando**
1. Abra o terminal
2. Execute: `npm run dev`
3. Verifique se aparece "Local: http://localhost:3000"
4. Acesse o link no navegador

## 🚀 **Soluções Rápidas**

### **Solução 1: Limpar Cache**
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules
npm install

# Iniciar servidor
npm run dev
```

### **Solução 2: Verificar se o arquivo foi salvo**
1. Verifique se o arquivo `src/components/ExpandedMenu.tsx` foi salvo
2. Verifique se não há erros de sintaxe
3. Verifique se o servidor está rodando

### **Solução 3: Verificar permissões**
1. Faça login como administrador
2. Vá para "Gestão do Cardápio"
3. Verifique se aparece o botão "Gerenciar Adicionais"

## 📞 **Se nada funcionar**

1. **Me envie uma captura de tela** da tela de "Gestão do Cardápio"
2. **Me envie os erros** do console do navegador
3. **Me confirme** se o servidor está rodando
4. **Me confirme** se está logado como administrador

## ✅ **O que deve aparecer**

Na tela de "Gestão do Cardápio", você deve ver:
- Botão "Exportar PDF" (laranja)
- Botão "Gerenciar Adicionais" (verde) ← **ESTE É O NOVO**
- Botão "Gerenciar Categorias" (azul)
- Botão "Novo Item" (gradiente)

Se não aparecer o botão verde "Gerenciar Adicionais", siga as instruções acima.
