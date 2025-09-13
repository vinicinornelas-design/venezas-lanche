-- Script para corrigir o perfil do usuário "jose" para ADMIN
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar o usuário atual
SELECT 
  p.id,
  p.nome,
  p.papel,
  p.user_id,
  p.ativo,
  au.email
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.nome ILIKE '%jose%' OR au.email ILIKE '%jose%';

-- Atualizar o perfil para ADMIN (substitua o ID pelo ID correto do usuário)
-- UPDATE profiles 
-- SET papel = 'ADMIN', updated_at = NOW()
-- WHERE nome ILIKE '%jose%' OR user_id IN (
--   SELECT id FROM auth.users WHERE email ILIKE '%jose%'
-- );

-- Verificar se a atualização foi feita
-- SELECT 
--   p.id,
--   p.nome,
--   p.papel,
--   p.user_id,
--   p.ativo,
--   au.email
-- FROM profiles p
-- LEFT JOIN auth.users au ON p.user_id = au.id
-- WHERE p.nome ILIKE '%jose%' OR au.email ILIKE '%jose%';
