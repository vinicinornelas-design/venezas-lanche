-- Script completo para corrigir o sistema de notificações

-- 1. Verificar se a tabela notifications existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        -- Criar tabela notifications
        CREATE TABLE notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN ('NEW_ORDER', 'ORDER_UPDATE', 'SYSTEM', 'INFO')),
            priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            target_role VARCHAR(50) CHECK (target_role IN ('ADMIN', 'CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA', 'GARCOM')),
            order_id UUID,
            metadata JSONB
        );
        
        -- Criar índices
        CREATE INDEX idx_notifications_target_role ON notifications(target_role);
        CREATE INDEX idx_notifications_read ON notifications(read);
        CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
        CREATE INDEX idx_notifications_type ON notifications(type);
        
        -- Habilitar RLS
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas
        CREATE POLICY "Users can read notifications" ON notifications
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Users can insert notifications" ON notifications
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Users can update notifications" ON notifications
            FOR UPDATE USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Users can delete notifications" ON notifications
            FOR DELETE USING (auth.role() = 'authenticated');
        
        RAISE NOTICE 'Tabela notifications criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela notifications já existe.';
    END IF;
END $$;

-- 2. Criar ou recriar trigger para novos pedidos
DROP FUNCTION IF EXISTS create_new_order_notification() CASCADE;

CREATE OR REPLACE FUNCTION create_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir notificação para novo pedido
    INSERT INTO notifications (
        title,
        message,
        type,
        priority,
        target_role,
        order_id,
        metadata
    ) VALUES (
        'Novo Pedido Recebido',
        CASE 
            WHEN NEW.origem = 'MESA' THEN 
                'Novo pedido na mesa ' || COALESCE(NEW.mesa_etiqueta, 'N/A')
            WHEN NEW.origem = 'DELIVERY' THEN 
                'Novo pedido delivery para ' || COALESCE(NEW.cliente_nome, 'Cliente')
            ELSE 
                'Novo pedido no balcão'
        END,
        'NEW_ORDER',
        'HIGH',
        'CAIXA',
        NEW.id,
        jsonb_build_object(
            'order_type', NEW.origem,
            'table_number', NEW.mesa_numero,
            'customer_name', NEW.cliente_nome,
            'total_amount', NEW.total
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger
DROP TRIGGER IF EXISTS trigger_new_order_notification ON pedidos_unificados;
CREATE TRIGGER trigger_new_order_notification
    AFTER INSERT ON pedidos_unificados
    FOR EACH ROW
    EXECUTE FUNCTION create_new_order_notification();

-- 4. Inserir notificação de teste
INSERT INTO notifications (title, message, type, priority, target_role, metadata) VALUES
('Sistema de Notificações Ativado', 'O sistema de notificações foi configurado com sucesso!', 'SYSTEM', 'LOW', 'CAIXA', '{"system_init": true}');

-- 5. Verificar se tudo está funcionando
SELECT 
    'Tabela notifications' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') 
         THEN 'OK' ELSE 'ERRO' END as status
UNION ALL
SELECT 
    'Trigger create_new_order_notification' as item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'trigger_new_order_notification') 
         THEN 'OK' ELSE 'ERRO' END as status
UNION ALL
SELECT 
    'Notificações de teste' as item,
    CASE WHEN EXISTS (SELECT 1 FROM notifications WHERE title = 'Sistema de Notificações Ativado') 
         THEN 'OK' ELSE 'ERRO' END as status;

-- 6. Mostrar notificações existentes
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
