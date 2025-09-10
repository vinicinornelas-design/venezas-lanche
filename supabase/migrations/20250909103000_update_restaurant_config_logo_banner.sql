-- Define logo e banner padrão do Veneza's Lanches em restaurant_config
DO $$
DECLARE
  cfg_count integer;
BEGIN
  SELECT COUNT(*) INTO cfg_count FROM restaurant_config;

  IF cfg_count > 0 THEN
    -- Atualiza todos os registros existentes (normalmente há 1)
    UPDATE restaurant_config
    SET 
      nome_restaurante = COALESCE(nome_restaurante, 'Veneza''s Lanches'),
      logo_url = '/assets/veneza-logo.png',
      banner_url = '/assets/veneza-bg.png',
      updated_at = now();
  ELSE
    -- Cria configuração padrão
    INSERT INTO restaurant_config (
      nome_restaurante, logo_url, banner_url, telefone, endereco, horario_funcionamento, created_at, updated_at
    ) VALUES (
      'Veneza''s Lanches',
      '/assets/veneza-logo.png',
      '/assets/veneza-bg.png',
      '(31) 99999-0000',
      'Endereço não definido',
      jsonb_build_object(
        'segunda','17:00-23:00','terca','17:00-23:00','quarta','17:00-23:00','quinta','17:00-23:00','sexta','17:00-00:00','sabado','17:00-00:00','domingo','17:00-23:00'
      ),
      now(),
      now()
    );
  END IF;
END $$;



