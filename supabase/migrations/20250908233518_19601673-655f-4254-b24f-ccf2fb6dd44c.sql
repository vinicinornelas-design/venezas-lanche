-- Corrigir funcionários básicos com cargos válidos
INSERT INTO funcionarios (nome, email, cargo, nivel_acesso, ativo) 
SELECT 'Garçom 1', 'garcom1@veneza.com', 'ATENDENTE', 'FUNCIONARIO', true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE email = 'garcom1@veneza.com');

INSERT INTO funcionarios (nome, email, cargo, nivel_acesso, ativo) 
SELECT 'Garçom 2', 'garcom2@veneza.com', 'ATENDENTE', 'FUNCIONARIO', true
WHERE NOT EXISTS (SELECT 1 FROM funcionarios WHERE email = 'garcom2@veneza.com');

INSERT INTO funcionarios (nome, email, cargo, nivel_acesso, ativo) 
SELECT 'Cozinheiro', 'cozinha@veneza.com', 'COZINHEIRO', 'FUNCIONARIO', true
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