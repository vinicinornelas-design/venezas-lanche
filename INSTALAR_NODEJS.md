# 🚀 **INSTALAÇÃO DO NODE.JS - NECESSÁRIA PARA FUNCIONAR**

## 📋 **Problema Identificado**

O botão "Gerenciar Adicionais" não aparece porque o projeto precisa ser compilado, mas o Node.js não está instalado no sistema.

## 🔧 **Soluções Disponíveis**

### **Opção 1: Instalar Node.js (Recomendado)**

#### **Para macOS:**
1. **Baixe o Node.js**: https://nodejs.org/
2. **Escolha a versão LTS** (recomendada)
3. **Instale o arquivo .pkg**
4. **Reinicie o terminal**

#### **Para Windows:**
1. **Baixe o Node.js**: https://nodejs.org/
2. **Escolha a versão LTS** (recomendada)
3. **Execute o instalador .msi**
4. **Reinicie o terminal**

#### **Para Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

### **Opção 2: Usar o arquivo node.tar.gz (Alternativa)**

Se você não quiser instalar o Node.js, pode extrair o arquivo `node.tar.gz` que está no projeto:

```bash
# Extrair o Node.js
tar -xzf node.tar.gz

# Adicionar ao PATH temporariamente
export PATH=$PATH:$(pwd)/node/bin

# Verificar se funcionou
node --version
npm --version
```

## 🚀 **Após Instalar o Node.js**

### **1. Instalar dependências:**
```bash
cd /Users/viniciusornelas/Downloads/venezas-lanche-main-4/venezas-lanche
npm install
```

### **2. Executar o servidor de desenvolvimento:**
```bash
npm run dev
```

### **3. Acessar o sistema:**
- Abra o navegador
- Vá para: http://localhost:5173
- Faça login como administrador
- Vá para "Gestão do Cardápio"
- **O botão "Gerenciar Adicionais" deve aparecer!**

## 🔍 **Verificar se Funcionou**

### **1. Verificar instalação:**
```bash
node --version
npm --version
```

### **2. Verificar se o servidor está rodando:**
- Deve aparecer: `Local: http://localhost:5173`
- Deve aparecer: `Network: http://192.168.x.x:5173`

### **3. Verificar se o botão aparece:**
- Acesse "Gestão do Cardápio"
- Deve aparecer o botão verde "Gerenciar Adicionais"

## 🆘 **Se Ainda Não Funcionar**

### **1. Limpar cache:**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### **2. Verificar erros:**
- Abra o DevTools (F12)
- Vá para a aba "Console"
- Procure por erros em vermelho

### **3. Verificar se o arquivo foi salvo:**
- Confirme se `src/components/ExpandedMenu.tsx` foi salvo
- Confirme se não há erros de sintaxe

## 📞 **Suporte**

Se encontrar problemas:
1. **Me envie uma captura de tela** do terminal
2. **Me envie os erros** do console do navegador
3. **Me confirme** se o Node.js foi instalado corretamente

---

**🎯 O botão "Gerenciar Adicionais" só aparecerá após compilar o projeto com Node.js!**
