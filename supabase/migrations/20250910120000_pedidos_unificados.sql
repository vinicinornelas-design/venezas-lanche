-- Criar tabela unificada de pedidos
-- Esta tabela consolida TODOS os dados relacionados a pedidos em um único lugar

CREATE TABLE IF NOT EXISTS pedidos_unificados (
  -- Identificação básica
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido SERIAL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações do cliente/mesa
  cliente_nome TEXT,
  cliente_telefone TEXT,
  cliente_endereco TEXT,
  cliente_bairro TEXT,
  mesa_numero INTEGER,
  mesa_etiqueta TEXT,
  
  -- Origem do pedido
  origem TEXT CHECK (origem IN ('BALCAO', 'MESA', 'DELIVERY', 'IFOOD', 'WHATSAPP')) DEFAULT 'BALCAO',
  
  -- Funcionário responsável
  funcionario_id UUID,
  funcionario_nome TEXT,
  
  -- Itens do pedido (JSON array com todos os itens)
  itens JSONB NOT NULL DEFAULT '[]',
  -- Estrutura dos itens:
  -- [
  --   {
  --     "nome": "X-Bacon",
  --     "preco_unitario": 18.90,
  --     "quantidade": 2,
  --     "subtotal": 37.80,
  --     "observacoes": "Sem cebola, extra bacon",
  --     "categoria": "Lanches",
  --     "adicionais": [
  --       {"nome": "Bacon extra", "preco": 3.00, "quantidade": 1},
  --       {"nome": "Queijo extra", "preco": 2.50, "quantidade": 1}
  --     ]
  --   }
  -- ]
  
  -- Totais calculados
  subtotal DECIMAL(10,2) DEFAULT 0,
  taxa_entrega DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Status e controle
  status TEXT CHECK (status IN ('PENDENTE', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO')) DEFAULT 'PENDENTE',
  
  -- Pagamento
  metodo_pagamento TEXT,
  pago BOOLEAN DEFAULT FALSE,
  troco_para DECIMAL(10,2),
  valor_pago DECIMAL(10,2),
  
  -- Observações gerais
  observacoes TEXT,
  observacoes_cozinha TEXT,
  observacoes_entrega TEXT,
  
  -- Tempo estimado e controle
  tempo_preparo_estimado INTEGER, -- em minutos
  tempo_entrega_estimado INTEGER, -- em minutos
  iniciado_preparo_em TIMESTAMP WITH TIME ZONE,
  finalizado_preparo_em TIMESTAMP WITH TIME ZONE,
  entregue_em TIMESTAMP WITH TIME ZONE,
  
  -- Avaliação (pode ser preenchida após entrega)
  avaliacao_nota INTEGER CHECK (avaliacao_nota >= 1 AND avaliacao_nota <= 5),
  avaliacao_comentario TEXT,
  avaliacao_em TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_status ON pedidos_unificados(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_origem ON pedidos_unificados(origem);
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_funcionario ON pedidos_unificados(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_mesa ON pedidos_unificados(mesa_numero);
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_created_at ON pedidos_unificados(created_at);
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_cliente_telefone ON pedidos_unificados(cliente_telefone);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_pedidos_unificados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER trigger_update_pedidos_unificados_updated_at
  BEFORE UPDATE ON pedidos_unificados
  FOR EACH ROW
  EXECUTE FUNCTION update_pedidos_unificados_updated_at();

-- Função para calcular totais automaticamente baseado nos itens
CREATE OR REPLACE FUNCTION calculate_pedido_totals()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  calculated_subtotal DECIMAL(10,2) := 0;
  adicional JSONB;
  item_subtotal DECIMAL(10,2);
  adicional_total DECIMAL(10,2);
BEGIN
  -- Calcular subtotal baseado nos itens
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.itens)
  LOOP
    -- Subtotal do item principal
    item_subtotal := (item->>'preco_unitario')::DECIMAL * (item->>'quantidade')::INTEGER;
    
    -- Adicionar adicionais se existirem
    adicional_total := 0;
    IF item ? 'adicionais' THEN
      FOR adicional IN SELECT * FROM jsonb_array_elements(item->'adicionais')
      LOOP
        adicional_total := adicional_total + ((adicional->>'preco')::DECIMAL * (adicional->>'quantidade')::INTEGER);
      END LOOP;
    END IF;
    
    calculated_subtotal := calculated_subtotal + item_subtotal + adicional_total;
  END LOOP;
  
  -- Atualizar subtotal
  NEW.subtotal := calculated_subtotal;
  
  -- Calcular total final
  NEW.total := NEW.subtotal + COALESCE(NEW.taxa_entrega, 0) - COALESCE(NEW.desconto, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular totais automaticamente
CREATE TRIGGER trigger_calculate_pedido_totals
  BEFORE INSERT OR UPDATE ON pedidos_unificados
  FOR EACH ROW
  EXECUTE FUNCTION calculate_pedido_totals();

-- Função para popular funcionario_nome automaticamente
CREATE OR REPLACE FUNCTION populate_funcionario_nome_unificado()
RETURNS TRIGGER AS $$
BEGIN
  -- Se funcionario_id foi fornecido, buscar o nome
  IF NEW.funcionario_id IS NOT NULL AND (NEW.funcionario_nome IS NULL OR NEW.funcionario_nome = '') THEN
    SELECT nome INTO NEW.funcionario_nome
    FROM funcionarios 
    WHERE id = NEW.funcionario_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para popular funcionario_nome
CREATE TRIGGER trigger_populate_funcionario_nome_unificado
  BEFORE INSERT OR UPDATE ON pedidos_unificados
  FOR EACH ROW
  EXECUTE FUNCTION populate_funcionario_nome_unificado();

-- Habilitar RLS
ALTER TABLE pedidos_unificados ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Público pode criar pedidos" ON pedidos_unificados
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ver pedidos" ON pedidos_unificados
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar pedidos" ON pedidos_unificados
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar todos os pedidos" ON pedidos_unificados
  FOR ALL USING (is_admin());

-- Inserir alguns dados de exemplo para demonstrar a estrutura
INSERT INTO pedidos_unificados (
  cliente_nome,
  cliente_telefone,
  mesa_numero,
  mesa_etiqueta,
  origem,
  funcionario_nome,
  itens,
  status,
  metodo_pagamento,
  observacoes
) VALUES 
(
  'João Silva',
  '(31) 99999-1234',
  5,
  'Mesa 5',
  'MESA',
  'Garçom 1',
  '[
    {
      "nome": "X-Bacon",
      "preco_unitario": 21.00,
      "quantidade": 1,
      "observacoes": "Ponto da carne bem passado",
      "categoria": "Tradicionais",
      "adicionais": [
        {"nome": "Bacon extra", "preco": 3.00, "quantidade": 1},
        {"nome": "Queijo extra", "preco": 2.50, "quantidade": 1}
      ]
    },
    {
      "nome": "Coca-Cola 350ml",
      "preco_unitario": 4.50,
      "quantidade": 2,
      "observacoes": "Bem gelada",
      "categoria": "Bebidas",
      "adicionais": []
    }
  ]'::jsonb,
  'PREPARANDO',
  'Cartão de Crédito',
  'Mesa próxima à janela'
),
(
  'Maria Oliveira',
  '(31) 98888-5678',
  NULL,
  NULL,
  'DELIVERY',
  'Atendente 1',
  '[
    {
      "nome": "Smash Clássico",
      "preco_unitario": 18.00,
      "quantidade": 2,
      "observacoes": "Sem cebola",
      "categoria": "Smash Burguer",
      "adicionais": []
    },
    {
      "nome": "Açaí no Copo",
      "preco_unitario": 10.00,
      "quantidade": 1,
      "observacoes": "Extra leite condensado",
      "categoria": "Sobremesas",
      "adicionais": [
        {"nome": "Granola", "preco": 2.00, "quantidade": 1}
      ]
    }
  ]'::jsonb,
  'PENDENTE',
  'PIX',
  'Apartamento 203, interfone 25'
);

-- Criar função para migrar dados das tabelas antigas (se necessário)
CREATE OR REPLACE FUNCTION migrate_old_pedidos_to_unified()
RETURNS INTEGER AS $$
DECLARE
  pedido_record RECORD;
  item_record RECORD;
  itens_json JSONB := '[]';
  migrated_count INTEGER := 0;
BEGIN
  -- Iterar sobre todos os pedidos antigos
  FOR pedido_record IN 
    SELECT p.*, m.numero as mesa_num, m.etiqueta as mesa_label
    FROM pedidos p
    LEFT JOIN mesas m ON p.mesa_id = m.id
  LOOP
    -- Reset para cada pedido
    itens_json := '[]';
    
    -- Buscar todos os itens deste pedido
    FOR item_record IN 
      SELECT pi.*, ic.nome, ic.preco 
      FROM pedidos_itens pi
      JOIN itens_cardapio ic ON pi.item_cardapio_id = ic.id
      WHERE pi.pedido_id = pedido_record.id
    LOOP
      -- Adicionar item ao JSON
      itens_json := itens_json || jsonb_build_object(
        'nome', item_record.nome,
        'preco_unitario', item_record.preco_unitario,
        'quantidade', item_record.quantidade,
        'observacoes', COALESCE(item_record.observacoes, ''),
        'categoria', 'Migrado',
        'adicionais', '[]'::jsonb
      );
    END LOOP;
    
    -- Inserir pedido unificado
    INSERT INTO pedidos_unificados (
      cliente_nome,
      cliente_telefone,
      mesa_numero,
      mesa_etiqueta,
      origem,
      funcionario_nome,
      itens,
      status,
      total,
      metodo_pagamento,
      pago,
      observacoes,
      created_at,
      updated_at
    ) VALUES (
      pedido_record.cliente_nome,
      pedido_record.cliente_telefone,
      pedido_record.mesa_num,
      pedido_record.mesa_label,
      COALESCE(pedido_record.origem, 'BALCAO'),
      pedido_record.funcionario_nome,
      itens_json,
      pedido_record.status,
      pedido_record.total,
      pedido_record.metodo_pagamento,
      COALESCE(pedido_record.pago, false),
      pedido_record.observacoes,
      pedido_record.created_at,
      pedido_record.updated_at
    );
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE pedidos_unificados IS 'Tabela unificada que consolida todas as informações de pedidos em um único local';
COMMENT ON COLUMN pedidos_unificados.itens IS 'Array JSON contendo todos os itens do pedido com seus adicionais e observações';
COMMENT ON COLUMN pedidos_unificados.origem IS 'Origem do pedido: BALCAO, MESA, DELIVERY, IFOOD, WHATSAPP';
COMMENT ON COLUMN pedidos_unificados.status IS 'Status atual: PENDENTE, PREPARANDO, PRONTO, ENTREGUE, CANCELADO';
