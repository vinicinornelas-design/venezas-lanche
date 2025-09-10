-- Adiciona administradora: laryssalorraynne104@gmail.com (senha: laryssa)
-- OBS: a senha será aplicada com bcrypt via crypt/gen_salt('bf')

-- 1) Criar usuária em auth.users (id gerado)
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
  'laryssalorraynne104@gmail.com',
  crypt('laryssa', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Administradora"}',
  false,
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- 2) Garantir perfil ADMIN vinculado ao auth.users
INSERT INTO public.profiles (user_id, nome, papel, ativo)
SELECT id, 'Administradora', 'ADMIN', true
FROM auth.users
WHERE email = 'laryssalorraynne104@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET papel = 'ADMIN', nome = 'Administradora', ativo = true;


