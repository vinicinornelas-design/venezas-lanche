# 🚀 INTEGRAÇÃO VERCEL - GUIA COMPLETO

## 📋 PASSO A PASSO PARA NOVA INTEGRAÇÃO:

### 1. **Acesse o Dashboard Vercel**
- Vá para: https://vercel.com/dashboard
- Faça login com sua conta

### 2. **Importar Projeto do GitHub**
- Clique em "Add New..." → "Project"
- Selecione "Import Git Repository"
- Escolha: `vinicinornelas-design/venezas-lanche`

### 3. **Configuração do Projeto**
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

### 4. **Variáveis de Ambiente**
Adicione as seguintes variáveis:
```
VITE_SUPABASE_URL=https://vqqaievojhmpkxulsgqj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcWFpZXZvamhtcGt4dWxzZ3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzA1MDgsImV4cCI6MjA3MjUwNjUwOH0.NiYsgfaYHqi3Jq0dJtk6Kvl4H_vffa2I7xR7ICv1R18
```

### 5. **Deploy**
- Clique em "Deploy"
- Aguarde o build ser concluído
- Teste o site

## ✅ FUNCIONALIDADES IMPLEMENTADAS:

### Popup de Adicionais
- ✅ Fallback com opções padrão sempre disponíveis
- ✅ Debug info para investigar problemas
- ✅ Opções de remoção (Sem Cebola, Sem Alface, etc.)
- ✅ Controle de quantidade (+/-)

### Métodos de Pagamento
- ✅ Separados por categorias específicas
- ✅ Dinheiro, Débito, Crédito, VR, Sodexo, Ticket, Alelo
- ✅ Cálculo automático de percentuais
- ✅ Interface melhorada com ícones

### Checkout Final
- ✅ Carrinho funcional com botão flutuante
- ✅ Dialog completo com lista de itens
- ✅ Finalização de pedido funcionando

## 🔧 ARQUIVOS DE CONFIGURAÇÃO:

### vercel.json
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "functions": {
    "vercel-build-force.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### package.json
```json
{
  "name": "vite_react_shadcn_ts",
  "version": "1.0.2",
  "scripts": {
    "build": "VITE_CHUNK_SIZE_WARNING_LIMIT=0 vite build",
    "build:vercel": "VITE_CHUNK_SIZE_WARNING_LIMIT=0 vite build --config vite.config.vercel.ts"
  }
}
```

## 🎯 RESULTADO ESPERADO:

Após a integração, você terá:
- ✅ Site funcionando no Vercel
- ✅ Deploy automático a cada push
- ✅ Popup de adicionais funcionando
- ✅ Métodos de pagamento separados
- ✅ Checkout final funcionando

---
**Status**: Pronto para nova integração
**Versão**: 1.0.2
**Último commit**: 584800d3
