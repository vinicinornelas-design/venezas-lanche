# 🍔 **GUIA: Sistema de Adicionais para Lanches**

## 📋 **VISÃO GERAL**

O Sistema de Adicionais para Lanches foi implementado com sucesso! Agora você pode gerenciar todos os adicionais que os clientes podem escolher ao fazer pedidos de lanches.

## ✨ **FUNCIONALIDADES IMPLEMENTADAS**

### **1. Gerenciamento de Adicionais**
- ✅ **Criar Novo Adicional** - Adicionar adicionais com nome e preço
- ✅ **Editar Adicional** - Modificar adicionais existentes
- ✅ **Deletar Adicional** - Remover adicionais
- ✅ **Listar Adicionais** - Visualizar todos os adicionais disponíveis
- ✅ **Configurações Avançadas** - Múltipla seleção, obrigatório, item específico

### **2. Adicionais Pré-Configurados**
O sistema já inclui todos os adicionais solicitados:

#### **Molhos e Condimentos**
- Molho verde adicional - R$ 1,50
- Molho Barbecue - R$ 1,50
- Ketchup e Maionese adicional - R$ 2,00

#### **Ingredientes Básicos**
- Ovo adicional - R$ 3,00
- Abacaxi adicional - R$ 4,00
- Banana adicional - R$ 4,00
- Bife de Hambúrguer adicional - R$ 4,00
- Cebola Caramelizada adicional - R$ 4,00
- Presunto adicional - R$ 4,00
- Cebola adicional - R$ 4,00

#### **Ingredientes Premium**
- Frango adicional - R$ 5,00
- Muçarela adicional - R$ 5,00
- Bacon adicional - R$ 6,00
- Linguiça adicional - R$ 6,00

#### **Ingredientes Artesanais**
- Bife artesanal adicional - R$ 8,00
- Catupiry adicional - R$ 8,00
- Cheddar adicional no lanche - R$ 8,00
- Costela ao molho barbecue - R$ 8,00

#### **Adicionais Especiais**
- Cheddar adicional na batata frita - R$ 10,00
- Requeijão cremoso adicional - R$ 12,00

#### **Opções de Remoção (Sem Custo)**
- Sem Pão
- Sem Presunto
- Sem Mussarela
- Sem maionese
- Sem ketchup
- Sem molho verde

## 🚀 **COMO USAR**

### **Acesso à Funcionalidade**
1. **Login** como administrador
2. **Navegue** para "Gestão do Cardápio" no sidebar
3. **Clique** no botão "Gerenciar Adicionais" (botão verde)

### **Gerenciar Adicionais**

#### **1. Criar Novo Adicional**
```
Modal Gerenciar Adicionais → Preencher formulário → Criar Adicional
```

#### **2. Editar Adicional Existente**
```
Modal Gerenciar Adicionais → Clicar "Editar" no adicional → Modificar → Atualizar
```

#### **3. Remover Adicional**
```
Modal Gerenciar Adicionais → Clicar "Deletar" no adicional → Confirmar
```

## 📊 **CONFIGURAÇÕES AVANÇADAS**

### **Múltipla Seleção**
- Permite que o cliente escolha o mesmo adicional várias vezes
- Útil para ingredientes como "Bacon adicional" (2x, 3x, etc.)

### **Obrigatório**
- Força o cliente a escolher pelo menos uma opção
- Útil para escolhas como "Tipo de Pão"

### **Item Específico**
- Vincula o adicional a um item específico do cardápio
- Se deixado vazio, o adicional fica disponível para todos os itens

## 🗄️ **APLICAR ADICIONAIS PRÉ-CONFIGURADOS**

### **Opção 1: Via Painel Supabase (Recomendado)**
1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole o conteúdo do arquivo `insert_adicionais_lanches.sql`
5. Execute o script

### **Opção 2: Via Interface Web**
1. Acesse "Gestão do Cardápio"
2. Clique em "Gerenciar Adicionais"
3. Adicione manualmente cada adicional usando o formulário

## 📁 **ARQUIVOS MODIFICADOS**

### `src/components/ExpandedMenu.tsx`
- Adicionado sistema completo de gerenciamento de adicionais
- Interface para CRUD de adicionais
- Integração com banco de dados Supabase
- Modal responsivo para gerenciamento

### `insert_adicionais_lanches.sql`
- Script SQL com todos os adicionais pré-configurados
- Inclui preços e configurações corretas
- Pronto para execução no Supabase

## 🎯 **PRÓXIMOS PASSOS**

1. **Execute o script SQL** para adicionar os adicionais pré-configurados
2. **Teste a funcionalidade** criando, editando e removendo adicionais
3. **Configure adicionais específicos** para itens do cardápio se necessário
4. **Integre com o sistema de pedidos** (próxima fase)

## 🔧 **TROUBLESHOOTING**

### **Erro ao salvar adicional**
- Verifique se o nome não está vazio
- Confirme se o preço é um número válido
- Verifique a conexão com o banco de dados

### **Adicionais não aparecem**
- Execute o script SQL no Supabase
- Verifique se a tabela `opcionais` existe
- Confirme as permissões do usuário

### **Interface não carrega**
- Verifique se está logado como administrador
- Confirme se tem permissão para acessar "Gestão do Cardápio"

## 📞 **SUPORTE**

Se encontrar algum problema:
1. Verifique os logs do console do navegador
2. Confirme se o banco de dados está acessível
3. Teste com um usuário administrador

---

**🎉 Sistema de Adicionais implementado com sucesso!**
