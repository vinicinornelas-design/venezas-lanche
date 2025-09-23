-- Script para inserir adicionais de teste
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_opcionais FROM opcionais;

-- Se não houver dados, vamos inserir alguns adicionais de teste
-- Primeiro, vamos pegar um item do cardápio para usar como referência
SELECT id, nome FROM itens_cardapio LIMIT 1;

-- Inserir adicionais de teste (substitua o item_id pelo ID real do item)
INSERT INTO opcionais (nome, preco_extra, multi_selecao, obrigatorio, item_id) VALUES
('Queijo Extra', 3.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1)),
('Bacon Extra', 4.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1)),
('Alface', 0.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1)),
('Tomate', 0.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1)),
('Cebola', 0.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1)),
('Sem Cebola', 0.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1)),
('Sem Alface', 0.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1)),
('Sem Tomate', 0.00, false, false, (SELECT id FROM itens_cardapio LIMIT 1))
ON CONFLICT DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 
    o.nome as adicional,
    o.preco_extra,
    i.nome as item_cardapio
FROM opcionais o
LEFT JOIN itens_cardapio i ON o.item_id = i.id
ORDER BY o.nome;
