# 📱 Guia de Integração WhatsApp Business API

## Visão Geral

A integração WhatsApp permite que o sistema Veneza's Lanches envie notificações automáticas para clientes e receba mensagens via WhatsApp Business API.

## 🚀 Funcionalidades

### Para o Restaurante:
- ✅ **Notificações de novos pedidos** via WhatsApp
- ✅ **Confirmação automática** de pedidos
- ✅ **Atualizações de status** em tempo real
- ✅ **Menu interativo** via WhatsApp
- ✅ **Consultas de status** de pedidos

### Para os Clientes:
- ✅ **Confirmação de pedidos** recebida
- ✅ **Atualizações de status** (preparando, pronto, saiu para entrega)
- ✅ **Menu interativo** com botões
- ✅ **Consulta de status** por número do pedido

## 📋 Pré-requisitos

1. **Conta WhatsApp Business** verificada
2. **Aplicação Facebook Developer** configurada
3. **Número de telefone** verificado no WhatsApp Business
4. **Token de acesso** permanente da API

## 🔧 Configuração Passo a Passo

### 1. Configurar WhatsApp Business API

1. Acesse [Facebook Developer Console](https://developers.facebook.com/)
2. Crie uma nova aplicação do tipo "Business"
3. Adicione o produto "WhatsApp Business API"
4. Configure seu número de telefone business

### 2. Obter Credenciais

No Facebook Developer Console, você precisará de:

- **Phone Number ID**: ID do seu número de telefone
- **Access Token**: Token permanente de acesso
- **Business Account ID**: ID da sua conta business
- **Webhook Verify Token**: Token personalizado para verificação

### 3. Configurar no Sistema

1. Acesse **WhatsApp** no menu lateral
2. Preencha os campos obrigatórios:
   - Phone Number ID
   - Access Token
   - Business Account ID
   - Webhook Verify Token
3. Ative a integração
4. Salve as configurações

### 4. Configurar Webhook

1. No Facebook Developer Console, vá para WhatsApp > Configuration
2. Configure o webhook com:
   - **URL**: `https://seu-dominio.com/api/whatsapp/webhook`
   - **Verify Token**: O mesmo token configurado no sistema
3. Subscreva aos eventos:
   - `messages`
   - `message_deliveries`

## 🧪 Testando a Integração

1. Na página de configuração do WhatsApp
2. Digite um número de telefone para teste (formato internacional)
3. Clique em "Enviar Mensagem de Teste"
4. Verifique se a mensagem foi recebida

## 📱 Tipos de Mensagens

### 1. Notificação de Novo Pedido
```
🆕 NOVO PEDIDO RECEBIDO!

👤 Cliente: João Silva
📱 Telefone: 5511999999999
🆔 Pedido: #123

📋 Itens:
• X-Burger x1 - R$ 25,00
• Batata Frita x1 - R$ 12,00

💰 Total: R$ 37,00
🚚 Entrega: Delivery
💳 Pagamento: Cartão de Crédito

📍 Endereço: Rua das Flores, 123

⏰ Horário: 23/01/2025 19:30
```

### 2. Confirmação de Pedido
```
🍔 Pedido Confirmado!

Seu pedido #123 foi recebido e está sendo preparado.

💰 Total: R$ 37,00
🚚 Entrega: Delivery
💳 Pagamento: Cartão de Crédito

Você receberá atualizações sobre o status do seu pedido.

Obrigado por escolher Veneza's Lanches! 🍕
```

### 3. Atualização de Status
```
🍳 Seu pedido está sendo preparado!

Pedido #123

Veneza's Lanches 🍔
```

### 4. Menu Interativo
```
🍔 Bem-vindo ao Veneza's Lanches!

Escolha uma opção para continuar:

[📋 Ver Cardápio] [🛒 Fazer Pedido] [📊 Status Pedido]
```

## 🔄 Fluxo de Notificações

1. **Cliente faz pedido** → Sistema recebe
2. **Sistema envia notificação** para o restaurante
3. **Restaurante confirma pedido** → Cliente recebe confirmação
4. **Status muda** → Cliente recebe atualização
5. **Pedido entregue** → Cliente recebe notificação final

## 🛠️ Solução de Problemas

### Erro: "WhatsApp API Error"
- Verifique se o Access Token está correto
- Confirme se o Phone Number ID está válido
- Verifique se a aplicação está ativa

### Erro: "Webhook verification failed"
- Confirme se o Verify Token está correto
- Verifique se a URL do webhook está acessível
- Teste a verificação manualmente

### Mensagens não são enviadas
- Verifique se a integração está ativada
- Confirme se o número de telefone está no formato correto
- Verifique os logs de erro no sistema

## 📊 Logs e Monitoramento

O sistema registra todas as mensagens enviadas e recebidas na tabela `whatsapp_messages_log`:

- **Status**: success, failed, pending
- **Tipo**: sent, received
- **Conteúdo**: JSON da mensagem
- **Erros**: Mensagens de erro detalhadas

## 🔒 Segurança

- ✅ Tokens são armazenados de forma segura
- ✅ Webhook é verificado antes de processar mensagens
- ✅ Logs de todas as interações
- ✅ Controle de acesso por roles de usuário

## 📈 Próximas Funcionalidades

- [ ] Templates de mensagens personalizáveis
- [ ] Respostas automáticas
- [ ] Integração com chatbot
- [ ] Relatórios de mensagens
- [ ] Múltiplos números de WhatsApp

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do sistema
2. Teste a integração com mensagem de teste
3. Confirme as configurações no Facebook Developer Console
4. Entre em contato com o suporte técnico

---

**Veneza's Lanches** - Sistema de Gestão Integrado com WhatsApp 🍔📱
