-- Add new admin user (Veneza's@gmail.com / veneza12)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'venezas@gmail.com',
  crypt('veneza12', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Veneza Admin"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create profile for new admin 
INSERT INTO public.profiles (user_id, nome, papel, ativo)
SELECT id, 'Veneza Admin', 'ADMIN', true
FROM auth.users 
WHERE email = 'venezas@gmail.com';