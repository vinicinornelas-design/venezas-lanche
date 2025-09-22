-- Script SIMPLES para criar tabela opcionais e inserir adicionais
-- Execute este script no Supabase SQL Editor

-- Criar a tabela opcionais
CREATE TABLE IF NOT EXISTS opcionais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco_extra DECIMAL(10,2) DEFAULT 0.00,
    multi_selecao BOOLEAN DEFAULT false,
    obrigatorio BOOLEAN DEFAULT false,
    item_id UUID
);

-- Inserir adicionais com preços específicos
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
('Catupiry adicional', 8.00, false, false, null),
('Cheddar adicional no lanche', 8.00, false, false, null),
('Costela ao molho barbecue', 8.00, false, false, null),

-- Adicionais especiais
('Cheddar adicional na batata frita', 10.00, false, false, null),
('Requeijão cremoso adicional', 12.00, false, false, null),

-- Opções de remoção (sem custo adicional)
('Sem Pão', 0.00, false, false, null),
('Sem Presunto', 0.00, false, false, null),
('Sem Mussarela', 0.00, false, false, null),
('Sem maionese', 0.00, false, false, null),
('Sem ketchup', 0.00, false, false, null),
('Sem molho verde', 0.00, false, false, null);

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
