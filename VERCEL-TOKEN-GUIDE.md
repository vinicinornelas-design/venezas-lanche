# 🔑 COMO OBTER TOKEN DO VERCEL

## 📋 PASSO A PASSO PARA OBTER O TOKEN:

### 1. **Acesse o Dashboard Vercel**
- Vá para: https://vercel.com/dashboard
- Faça login com sua conta

### 2. **Acesse as Configurações de Conta**
- Clique no seu **avatar/foto de perfil** no canto superior direito
- Selecione **"Settings"** (Configurações)

### 3. **Navegue para Tokens**
- No menu lateral esquerdo, clique em **"Tokens"**
- Ou acesse diretamente: https://vercel.com/account/tokens

### 4. **Criar Novo Token**
- Clique no botão **"Create Token"** (Criar Token)
- Preencha os campos:
  - **Name**: `venezas-lanche-deploy` (ou qualquer nome)
  - **Scope**: Selecione **"Full Account"** (Conta Completa)
  - **Expiration**: Escolha a expiração (recomendo 1 ano)

### 5. **Copiar o Token**
- Após criar, o token será exibido **APENAS UMA VEZ**
- **COPIE IMEDIATAMENTE** e salve em local seguro
- O token terá formato: `vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🔧 COMO USAR O TOKEN:

### Para Deploy via CLI:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### Para Deploy via API:
```bash
# Deploy via API
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxxxxxxxx" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## ⚠️ IMPORTANTE:

### Segurança:
- **NUNCA** compartilhe o token publicamente
- **NUNCA** commite o token no Git
- **SEMPRE** mantenha o token em local seguro

### Alternativas:
Se não conseguir o token, você pode:
1. **Fazer deploy manual** no dashboard
2. **Conectar GitHub** para deploy automático
3. **Usar a interface web** do Vercel

## 🎯 PARA SUA SITUAÇÃO:

Como você está tendo problemas com deploy automático, recomendo:

### Opção 1: Deploy Manual (Mais Simples)
1. Acesse o dashboard Vercel
2. Importe o projeto do GitHub
3. Configure as variáveis de ambiente
4. Clique em "Deploy"

### Opção 2: Reconectar GitHub
1. No projeto Vercel, vá em "Settings"
2. Clique em "Git Integration"
3. Reconecte com o GitHub
4. Ative "Auto Deploy"

## 📞 SUPORTE:

Se tiver problemas:
- **Documentação**: https://vercel.com/docs
- **Suporte**: https://vercel.com/support
- **Comunidade**: https://github.com/vercel/vercel/discussions

---
**Status**: Guia completo para obter token
**Próximo passo**: Seguir os passos acima para obter o token
