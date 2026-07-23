-- 임시 관리자 계정 생성 마이그레이션 SQL

-- 1. 기존 가입된 모든 사용자 계정을 admin 권한으로 설정
UPDATE public.accounts
SET role = 'admin';

-- 2. admin@kkumjaram.kr 이메일 계정이 존재할 경우 확실하게 admin 지정
UPDATE public.accounts
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@kkumjaram.kr'
);
