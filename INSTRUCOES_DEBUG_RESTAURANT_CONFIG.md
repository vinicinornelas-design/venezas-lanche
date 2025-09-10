# 🔧 Instruções para Debug da Tabela restaurant_config

## 📋 **Problema Identificado:**
A tabela `restaurant_config` não está vazia, mas as páginas não estão conseguindo carregar os dados. Isso indica um problema com as políticas RLS (Row Level Security) ou permissões.

## 🛠️ **Passos para Resolver:**

### **1. Execute o Script de Debug**
1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o arquivo `debug_restaurant_config.sql`
4. Verifique os resultados para identificar o problema

### **2. Execute o Script de Correção**
1. No **SQL Editor** do Supabase
2. Execute o arquivo `fix_restaurant_config_policies.sql`
3. Este script irá:
   - Remover políticas existentes problemáticas
   - Criar políticas corretas para acesso público
   - Habilitar RLS corretamente
   - Testar a consulta

### **3. Verifique os Resultados**
Após executar os scripts, você deve ver:
- ✅ **Dados da tabela** sendo exibidos
- ✅ **Políticas RLS** configuradas corretamente
- ✅ **Consulta de teste** funcionando

### **4. Teste as Páginas**
1. Acesse a **página inicial** (`/`)
2. Acesse o **cardápio público** (`/menu-publico`)
3. Verifique se os dados estão sendo carregados
4. Observe os **painéis de debug** (modo desenvolvimento)

## 🎯 **O que os Scripts Fazem:**

### **debug_restaurant_config.sql:**
- Verifica se há dados na tabela
- Mostra as políticas RLS atuais
- Testa consultas simples
- Exibe a estrutura da tabela

### **fix_restaurant_config_policies.sql:**
- Remove políticas problemáticas
- Cria políticas corretas:
  - **SELECT**: Acesso público (para páginas públicas)
  - **INSERT/UPDATE/DELETE**: Apenas usuários autenticados
- Habilita RLS corretamente
- Testa a consulta após correção

## 🚨 **Importante:**
- Execute os scripts **na ordem indicada**
- Verifique os **logs do console** do navegador
- Observe os **painéis de debug** nas páginas
- Se ainda não funcionar, me informe os resultados dos scripts

## 📞 **Próximos Passos:**
Após executar os scripts, me informe:
1. Os resultados do script de debug
2. Se as políticas foram criadas corretamente
3. Se as páginas estão carregando os dados
4. Qualquer erro que apareça no console
