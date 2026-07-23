-- Supabase public.accounts 테이블의 계정 role 컬럼을 'admin'으로 승격 업데이트

-- 1. 기존 public.accounts 레코드의 role을 'admin'으로 변경
UPDATE public.accounts
SET role = 'admin';

-- 2. auth.users 테이블에 가입되어 있으나 accounts 테이블에 누락된 경우 'admin' 권한으로 자동 생성/업데이트
INSERT INTO public.accounts (id, display_name, role)
SELECT 
  id, 
  coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1)), 
  'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';
