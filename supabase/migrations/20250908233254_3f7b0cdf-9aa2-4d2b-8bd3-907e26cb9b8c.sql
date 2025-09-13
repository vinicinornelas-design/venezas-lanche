-- Criar funcionários básicos se não existirem
INSERT INTO funcionarios (nome, email, cargo, nivel_acesso, ativo) 
SELECT 'Garçom 1', 'garcom1@veneza.com', 'Garçom', 'FUNCIONARIO', true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE email = 'garcom1@veneza.com');

INSERT INTO funcionarios (nome, email, cargo, nivel_acesso, ativo) 
SELECT 'Garçom 2', 'garcom2@veneza.com', 'Garçom', 'FUNCIONARIO', true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE email = 'garcom2@veneza.com');

INSERT INTO funcionarios (nome, email, cargo, nivel_acesso, ativo) 
SELECT 'Cozinheiro', 'cozinha@veneza.com', 'Cozinheiro', 'FUNCIONARIO', true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE email = 'cozinha@veneza.com');

-- Garantir que existe um admin no sistema
INSERT INTO profiles (user_id, nome, papel, ativo)
SELECT gen_random_uuid(), 'Admin Veneza', 'ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE papel = 'ADMIN');

-- Criar algumas mesas se não existirem
INSERT INTO mesas (numero, status) 
SELECT 1, 'LIVRE'
WHERE NOT EXISTS (SELECT 1 FROM mesas WHERE numero = 1);

INSERT INTO mesas (numero, status) 
SELECT 2, 'LIVRE'
WHERE NOT EXISTS (SELECT 1 FROM mesas WHERE numero = 2);

INSERT INTO mesas (numero, status) 
SELECT 3, 'LIVRE'
WHERE NOT EXISTS (SELECT 1 FROM mesas WHERE numero = 3);

INSERT INTO mesas (numero, status) 
SELECT 4, 'LIVRE'
WHERE NOT EXISTS (SELECT 1 FROM mesas WHERE numero = 4);

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id),
  item_cardapio_id UUID REFERENCES itens_cardapio(id),
  cliente_nome TEXT,
  cliente_telefone TEXT,
  nota INTEGER CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela avaliacoes
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas para avaliações
CREATE POLICY "Público pode criar avaliações" ON avaliacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Público pode ver avaliações" ON avaliacoes FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar avaliações" ON avaliacoes FOR ALL USING (is_admin());

-- Criar trigger para updated_at
CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();