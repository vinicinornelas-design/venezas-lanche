-- Primeiro, vamos tentar adicionar funcionários com cargo 'Funcionario'
INSERT INTO funcionarios (nome, email, cargo, nivel_acesso, ativo) 
VALUES 
('Garçom 1', 'garcom1@veneza.com', 'Funcionario', 'FUNCIONARIO', true),
('Garçom 2', 'garcom2@veneza.com', 'Funcionario', 'FUNCIONARIO', true),
('Cozinheiro', 'cozinha@veneza.com', 'Funcionario', 'FUNCIONARIO', true);

-- Garantir que existe um admin no sistema
INSERT INTO profiles (user_id, nome, papel, ativo)
SELECT gen_random_uuid(), 'Admin Veneza', 'ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE papel = 'ADMIN');

-- Criar algumas mesas se não existirem
INSERT INTO mesas (numero, status) 
VALUES 
(1, 'LIVRE'),
(2, 'LIVRE'),
(3, 'LIVRE'),
(4, 'LIVRE');