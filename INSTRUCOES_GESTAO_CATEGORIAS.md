# 🍔 Funcionalidade de Gerenciamento de Categorias - Cardápio

## 📋 Descrição
Esta atualização adiciona uma funcionalidade completa de gerenciamento de categorias no menu de gestão do cardápio do sistema Veneza's Lanches.

## ✨ Funcionalidades Implementadas

### 🎯 Gerenciamento de Categorias
- ✅ **Criar Nova Categoria** - Adicionar categorias com nome e status
- ✅ **Editar Categoria** - Modificar categorias existentes
- ✅ **Ativar/Desativar** - Controlar visibilidade das categorias
- ✅ **Deletar Categoria** - Remover categorias (com validação de segurança)
- ✅ **Listar Categorias** - Visualizar todas as categorias com contadores

### 🔒 Validações de Segurança
- **Proteção contra exclusão**: Não permite deletar categoria que possui itens
- **Validação de campos**: Nome da categoria é obrigatório
- **Feedback visual**: Tooltips e mensagens informativas
- **Confirmação de ações**: Toast notifications para todas as operações

### 🎨 Melhorias na Interface
- **Categorias Ativas e Inativas**: Mostra todas as categorias
- **Indicadores Visuais**: Badges para status e contadores
- **Categorias Vazias**: Mensagem quando não há itens
- **Design Responsivo**: Interface adaptável para diferentes telas

## 📁 Arquivos Modificados

### `src/components/ExpandedMenu.tsx`
- Adicionado botão "Gerenciar Categorias" no header
- Implementado modal completo de CRUD de categorias
- Adicionadas funções de gerenciamento:
  - `handleSaveCategory()` - Criar/editar categoria
  - `handleDeleteCategory()` - Deletar categoria
  - `handleToggleCategoryStatus()` - Ativar/desativar categoria
  - `editCategory()` - Editar categoria existente
  - `resetCategoryForm()` - Limpar formulário
- Melhorada exibição das categorias no cardápio
- Adicionados estados para gerenciamento de categorias

## 🚀 Como Aplicar as Alterações

### Opção 1: Usando Git Patch
```bash
# Aplicar o patch
git apply gestao_categorias_cardapio.patch

# Verificar as alterações
git status

# Fazer commit
git add .
git commit -m "feat: adicionar gerenciamento de categorias no cardápio"
```

### Opção 2: Aplicar Manualmente
1. Abra o arquivo `src/components/ExpandedMenu.tsx`
2. Substitua o conteúdo pelo arquivo fornecido
3. Faça commit das alterações

## 🎯 Como Usar

### 1. Acessar Gerenciamento de Categorias
- Vá para **Gestão do Cardápio**
- Clique no botão **"Gerenciar Categorias"** (ícone de pasta)

### 2. Criar Nova Categoria
- No modal, preencha o **Nome da Categoria**
- Marque/desmarque **"Categoria ativa"** conforme necessário
- Clique em **"Criar Categoria"**

### 3. Editar Categoria Existente
- Na lista de categorias, clique em **"Editar"**
- Modifique o nome ou status
- Clique em **"Atualizar Categoria"**

### 4. Gerenciar Status
- Use o botão **"Ativar/Desativar"** para controlar visibilidade
- Categorias inativas aparecem com opacidade reduzida

### 5. Deletar Categoria
- Clique no botão **"Deletar"** (ícone de lixeira)
- ⚠️ **Atenção**: Não é possível deletar categoria que possui itens

## 🔧 Estrutura do Banco de Dados

### Tabela `categorias`
```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📱 Interface Responsiva

### Desktop
- Modal com 2 colunas para formulário
- Grid de categorias em 2 colunas
- Botões organizados horizontalmente

### Mobile
- Modal em coluna única
- Grid de categorias em 1 coluna
- Botões empilhados verticalmente

## 🎨 Design System

### Cores
- **Primária**: Laranja/Vermelho (gradiente)
- **Secundária**: Azul para categorias
- **Sucesso**: Verde para confirmações
- **Erro**: Vermelho para validações
- **Neutro**: Cinza para elementos inativos

### Ícones
- **FolderPlus**: Gerenciar categorias
- **Edit**: Editar categoria
- **Trash2**: Deletar categoria
- **Upload**: Categoria vazia

## 🧪 Testes Recomendados

### 1. Teste de Criação
- [ ] Criar categoria com nome válido
- [ ] Criar categoria ativa e inativa
- [ ] Validar campo obrigatório

### 2. Teste de Edição
- [ ] Editar nome da categoria
- [ ] Alterar status ativo/inativo
- [ ] Salvar alterações

### 3. Teste de Exclusão
- [ ] Tentar deletar categoria vazia
- [ ] Tentar deletar categoria com itens (deve falhar)
- [ ] Confirmar mensagens de erro

### 4. Teste de Interface
- [ ] Verificar responsividade
- [ ] Testar navegação do modal
- [ ] Validar feedback visual

## 🐛 Solução de Problemas

### Erro: "Não é possível deletar categoria com itens"
- **Causa**: Categoria possui itens associados
- **Solução**: Mova ou delete os itens primeiro, ou desative a categoria

### Erro: "Nome da categoria é obrigatório"
- **Causa**: Campo nome está vazio
- **Solução**: Preencha o nome da categoria

### Categoria não aparece no cardápio
- **Causa**: Categoria está inativa
- **Solução**: Ative a categoria no gerenciamento

## 📈 Próximas Melhorias Sugeridas

1. **Ordenação de Categorias**: Permitir reordenar categorias
2. **Cores Personalizadas**: Adicionar cores para categorias
3. **Ícones Personalizados**: Permitir ícones customizados
4. **Importação em Massa**: Importar categorias via CSV
5. **Estatísticas**: Relatórios de uso por categoria

## 📞 Suporte

Para dúvidas ou problemas com esta funcionalidade, entre em contato com a equipe de desenvolvimento.

---
**Versão**: 1.0.0  
**Data**: Janeiro 2025  
**Autor**: Sistema Veneza's Lanches
