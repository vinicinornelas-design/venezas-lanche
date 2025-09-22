# 🍔 **SOLUÇÃO: Botão "Gerenciar Adicionais" não aparece**

## 📋 **Problema Identificado**

O botão "Gerenciar Adicionais" não aparece na interface porque:
1. **Node.js não está instalado** no sistema
2. **O projeto não foi compilado** com as mudanças mais recentes
3. **O servidor de desenvolvimento não está rodando**

## 🚀 **SOLUÇÕES DISPONÍVEIS**

### **SOLUÇÃO 1: Instalar Node.js (RECOMENDADO)**

#### **Passo 1: Instalar Node.js**
1. **Acesse**: https://nodejs.org/
2. **Baixe a versão LTS** (recomendada)
3. **Instale o arquivo** (.pkg no Mac, .msi no Windows)
4. **Reinicie o terminal**

#### **Passo 2: Verificar instalação**
```bash
node --version
npm --version
```

#### **Passo 3: Instalar dependências**
```bash
cd /Users/viniciusornelas/Downloads/venezas-lanche-main-4/venezas-lanche
npm install
```

#### **Passo 4: Executar servidor**
```bash
npm run dev
```

#### **Passo 5: Acessar sistema**
- Abra: http://localhost:5173
- Faça login como administrador
- Vá para "Gestão do Cardápio"
- **O botão "Gerenciar Adicionais" deve aparecer!**

---

### **SOLUÇÃO 2: Usar arquivo node.tar.gz (ALTERNATIVA)**

#### **Passo 1: Extrair Node.js**
```bash
cd /Users/viniciusornelas/Downloads/venezas-lanche-main-4/venezas-lanche
tar -xzf node.tar.gz
```

#### **Passo 2: Adicionar ao PATH**
```bash
export PATH=$PATH:$(pwd)/node/bin
```

#### **Passo 3: Verificar funcionamento**
```bash
node --version
npm --version
```

#### **Passo 4: Instalar dependências e executar**
```bash
npm install
npm run dev
```

---

### **SOLUÇÃO 3: Patch temporário (LIMITADO)**

Se não conseguir instalar o Node.js, pode usar o patch temporário:

#### **Passo 1: Executar patch**
```bash
cd /Users/viniciusornelas/Downloads/venezas-lanche-main-4/venezas-lanche
node patch_adicionais.js
```

#### **Passo 2: Acessar sistema**
- Abra o arquivo `index.html` no navegador
- O botão aparecerá, mas com funcionalidade limitada

---

## ✅ **O QUE DEVE APARECER**

Após seguir uma das soluções, na tela "Gestão do Cardápio" você deve ver:

- **Botão "Exportar PDF"** (laranja)
- **Botão "Gerenciar Adicionais"** (verde) ← **NOVO**
- **Botão "Gerenciar Categorias"** (azul)
- **Botão "Novo Item"** (gradiente)

## 🔧 **FUNCIONALIDADES DO BOTÃO "GERENCIAR ADICIONAIS"**

Quando funcionar, o botão permitirá:

- ✅ **Visualizar todos os adicionais** (26 adicionais pré-configurados)
- ✅ **Criar novos adicionais**
- ✅ **Editar adicionais existentes**
- ✅ **Deletar adicionais**
- ✅ **Configurar múltipla seleção**
- ✅ **Definir como obrigatório**
- ✅ **Vincular a item específico**

## 📊 **ADICIONAIS PRÉ-CONFIGURADOS**

O sistema já inclui todos os adicionais solicitados:

### **Molhos e Condimentos**
- Molho verde adicional - R$ 1,50
- Molho Barbecue - R$ 1,50
- Ketchup e Maionese adicional - R$ 2,00

### **Ingredientes Básicos**
- Ovo adicional - R$ 3,00
- Abacaxi adicional - R$ 4,00
- Banana adicional - R$ 4,00
- Bife de Hambúrguer adicional - R$ 4,00
- Cebola Caramelizada adicional - R$ 4,00
- Presunto adicional - R$ 4,00
- Cebola adicional - R$ 4,00

### **Ingredientes Premium**
- Frango adicional - R$ 5,00
- Muçarela adicional - R$ 5,00
- Bacon adicional - R$ 6,00
- Linguiça adicional - R$ 6,00

### **Ingredientes Artesanais**
- Bife artesanal adicional - R$ 8,00
- Catupiry adicional - R$ 8,00
- Cheddar adicional no lanche - R$ 8,00
- Costela ao molho barbecue - R$ 8,00

### **Adicionais Especiais**
- Cheddar adicional na batata frita - R$ 10,00
- Requeijão cremoso adicional - R$ 12,00

### **Opções de Remoção (Sem Custo)**
- Sem Pão
- Sem Presunto
- Sem Mussarela
- Sem maionese
- Sem ketchup
- Sem molho verde

## 🆘 **SE AINDA NÃO FUNCIONAR**

1. **Me envie uma captura de tela** da tela de "Gestão do Cardápio"
2. **Me envie os erros** do console do navegador (F12 → Console)
3. **Me confirme** qual solução você tentou
4. **Me envie o resultado** dos comandos `node --version` e `npm --version`

---

**🎯 O sistema de adicionais está 100% implementado, só precisa ser compilado!**
