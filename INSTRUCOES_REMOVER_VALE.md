# 🗑️ Instruções para Remover Opções de Vale

## 📋 O que fazer:

### 1. Acesse o Painel do Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Acesse o projeto do Veneza's Lanches

### 2. Execute o Script SQL
- No painel do Supabase, vá para **SQL Editor**
- Clique em **New Query**
- Copie e cole o conteúdo do arquivo `remove_vale_payment_methods.sql`
- Clique em **Run** para executar

### 3. Verifique o Resultado
Após executar o script, você deve ver apenas 4 métodos de pagamento:
- ✅ Dinheiro (sem taxa)
- ✅ PIX (sem taxa)  
- ✅ Cartão de Débito (2.5% de taxa)
- ✅ Cartão de Crédito (3.5% de taxa)

### 4. Teste a Aplicação
- Recarregue a página da aplicação
- Vá para "Lançar Pedido" ou "Menu Público"
- Verifique se as opções de "Vale Refeição" e "Vale Alimentação" desapareceram
- Teste a seleção de cartão para ver as taxas sendo aplicadas automaticamente

## 🔧 O que o script faz:

1. **Remove** os métodos de pagamento de vale da tabela `payment_methods`
2. **Atualiza** as constraints das tabelas `pedidos` e `pedidos_unificados`
3. **Define** as taxas corretas para cartões:
   - Cartão de Débito: 2.5%
   - Cartão de Crédito: 3.5%
4. **Mostra** uma consulta final para verificar os métodos restantes

## ⚠️ Importante:
- Execute o script apenas uma vez
- Faça backup do banco antes se necessário
- Após executar, as opções de vale não aparecerão mais em lugar nenhum da aplicação

## 🎯 Resultado Esperado:
Após executar o script, a aplicação mostrará apenas os 4 métodos de pagamento essenciais, com cálculo automático de taxas para cartões.
