-- Script para testar inserção de pedido do cardápio público
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;

-- 2. Tentar inserir pedido de teste
INSERT INTO pedidos_unificados (
    id,
    numero_pedido,
    itens,
    origem,
    observacoes,
    metodo_pagamento,
    cliente_nome,
    cliente_telefone,
    cliente_endereco,
    cliente_bairro,
    taxa_entrega,
    desconto,
    subtotal,
    total,
    status,
    pago,
    troco_para,
    valor_pago,
    observacoes_cozinha,
    observacoes_entrega,
    tempo_preparo_estimado,
    tempo_entrega_estimado,
    iniciado_preparo_em,
    finalizado_preparo_em,
    entregue_em,
    avaliacao_nota,
    avaliacao_comentario,
    avaliacao_em,
    mesa_numero,
    mesa_etiqueta,
    funcionario_id,
    funcionario_nome
) VALUES (
    'teste_cardapio_' || extract(epoch from now()),
    9998,
    '[
        {
            "nome": "Hambúrguer Teste",
            "categoria": "TRADICIONAIS",
            "adicionais": [
                {"nome": "Queijo Extra", "preco": 3.00, "quantidade": 1}
            ],
            "quantidade": 1,
            "preco_unitario": 25
        }
    ]'::jsonb,
    'DELIVERY',
    'Pedido de teste do cardápio público',
    'dinheiro',
    'Cliente Teste',
    '(11) 99999-9999',
    'Rua Teste, 123',
    'Centro',
    '5.00',
    '0.00',
    '28.00',
    '33.00',
    'PENDENTE',
    false,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
);

-- 3. Verificar se foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 9998;

-- 4. Verificar últimos pedidos
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 3;
