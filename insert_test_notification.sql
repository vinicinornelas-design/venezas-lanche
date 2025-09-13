-- Inserir notificação de teste para verificar se o sistema está funcionando

INSERT INTO notifications (
  title,
  message,
  type,
  priority,
  target_role,
  metadata
) VALUES (
  'Novo Pedido Recebido',
  'Novo pedido delivery para JOSE PEDRO DA SILVA FERNANDES',
  'NEW_ORDER',
  'HIGH',
  'CAIXA',
  jsonb_build_object(
    'order_type', 'DELIVERY',
    'customer_name', 'JOSE PEDRO DA SILVA FERNANDES',
    'total_amount', 76.00
  )
);

-- Verificar se foi inserida
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
