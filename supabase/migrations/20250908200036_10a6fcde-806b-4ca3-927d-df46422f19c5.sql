-- Criar usuário admin inicial se não existir
-- Primeiro vamos verificar se já existe um perfil admin

DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Verificar se já existe um admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE papel = 'ADMIN') THEN
        -- Criar um UUID para o usuário admin
        admin_user_id := '550e8400-e29b-41d4-a716-446655440000';
        
        -- Inserir perfil admin
        INSERT INTO profiles (user_id, nome, papel, ativo) 
        VALUES (admin_user_id, 'Administrador', 'ADMIN', true)
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Atualizar funcionario admin se existir
        UPDATE funcionarios 
        SET profile_id = (SELECT id FROM profiles WHERE user_id = admin_user_id LIMIT 1)
        WHERE cargo = 'Gerente' AND nome = 'Administrador';
    END IF;
END $$;