-- Script para inserir métodos de pagamento padrão
-- Execute este script no Supabase SQL Editor

-- Atualizar restaurant_config com métodos de pagamento padrão
UPDATE restaurant_config 
SET formas_pagamento = '[
  {"nome": "Dinheiro", "taxa": 0},
  {"nome": "Débito", "taxa": 0},
  {"nome": "Crédito", "taxa": 0},
  {"nome": "VR", "taxa": 0},
  {"nome": "Sodexo", "taxa": 0},
  {"nome": "Ticket", "taxa": 0},
  {"nome": "Alelo", "taxa": 0}
]'::jsonb
WHERE id IS NOT NULL;

-- Verificar se foi atualizado
SELECT formas_pagamento FROM restaurant_config;

-- Inserir bairros padrão se não existirem
UPDATE restaurant_config 
SET bairros_entrega = '[
  {"nome": "Centro", "taxa_entrega": 5.00},
  {"nome": "Zona Norte", "taxa_entrega": 7.00},
  {"nome": "Zona Sul", "taxa_entrega": 6.00},
  {"nome": "Zona Leste", "taxa_entrega": 8.00},
  {"nome": "Zona Oeste", "taxa_entrega": 7.50}
]'::jsonb
WHERE id IS NOT NULL;

-- Verificar se foi atualizado
SELECT bairros_entrega FROM restaurant_config;
