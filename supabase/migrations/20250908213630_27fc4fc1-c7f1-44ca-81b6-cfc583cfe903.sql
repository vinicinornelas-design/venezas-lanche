-- Criar usuário admin hardcoded no sistema
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sistema.com',
  crypt('123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nome":"Administrador"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Criar perfil admin
INSERT INTO public.profiles (user_id, nome, papel, ativo)
SELECT id, 'Administrador', 'ADMIN', true
FROM auth.users 
WHERE email = 'admin@sistema.com'
ON CONFLICT (user_id) DO UPDATE SET papel = 'ADMIN', nome = 'Administrador';