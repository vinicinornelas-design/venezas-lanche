-- Atualizar configuração do restaurante para Veneza's Lanches
UPDATE restaurant_config 
SET 
  nome_restaurante = 'VENEZA''S LANCHES',
  logo_url = '/lovable-uploads/7879c400-f6d5-4608-b189-9a23e3d9922f.png',
  updated_at = now()
WHERE id IS NOT NULL;