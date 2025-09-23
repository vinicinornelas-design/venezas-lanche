-- Script para inserir adicionais corretos baseados na imagem
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar quais itens existem no cardápio
SELECT id, nome, preco FROM itens_cardapio ORDER BY nome;

-- Inserir adicionais para TODOS os itens do cardápio (item_id = null significa que se aplica a todos)
INSERT INTO opcionais (nome, preco_extra, multi_selecao, obrigatorio, item_id) VALUES
-- Molhos e condimentos
('Molho verde adicional', 1.50, false, false, null),
('Molho Barbecue', 1.50, false, false, null),
('Ketchup e Maionese adicional', 2.00, false, false, null),

-- Ingredientes básicos
('Ovo adicional', 3.00, false, false, null),
('Abacaxi adicional', 4.00, false, false, null),
('Banana adicional', 4.00, false, false, null),
('Bife de Hambúrguer adicional', 4.00, false, false, null),
('Cebola Caramelizada adicional', 4.00, false, false, null),
('Presunto adicional', 4.00, false, false, null),
('Cebola adicional', 4.00, false, false, null),

-- Ingredientes premium
('Frango adicional', 5.00, false, false, null),
('Muçarela adicional', 5.00, false, false, null),
('Bacon adicional', 6.00, false, false, null),
('Linguiça adicional', 6.00, false, false, null),

-- Ingredientes artesanais
('Bife artesanal adicional', 8.00, false, false, null),

-- Opções de remoção (sem custo adicional)
('Sem Pão', 0.00, false, false, null),
('Sem Presunto', 0.00, false, false, null),
('Sem Mussarela', 0.00, false, false, null),
('Sem maionese', 0.00, false, false, null),
('Sem ketchup', 0.00, false, false, null),
('Sem molho verde', 0.00, false, false, null),
('Sem cebola', 0.00, false, false, null),
('Sem tomate', 0.00, false, false, null),
('Sem alface', 0.00, false, false, null),
('Sem picles', 0.00, false, false, null),
('Sem batata palha', 0.00, false, false, null),
('Sem milho', 0.00, false, false, null);

-- Verificar se os adicionais foram inseridos
SELECT 
    nome,
    preco_extra,
    CASE 
        WHEN preco_extra = 0 THEN 'Remoção'
        ELSE 'Adicional'
    END as tipo
FROM opcionais 
ORDER BY preco_extra, nome;
