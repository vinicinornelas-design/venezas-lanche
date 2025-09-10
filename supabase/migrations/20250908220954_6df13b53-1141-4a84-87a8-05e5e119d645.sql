-- Create a simple hardcoded admin entry for Veneza's admin
-- This will be used with the hardcoded login system
INSERT INTO public.profiles (id, user_id, nome, papel, ativo)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(), -- dummy user_id since it's hardcoded login
  'Veneza Admin',
  'ADMIN',
  true
) ON CONFLICT (user_id) DO NOTHING;