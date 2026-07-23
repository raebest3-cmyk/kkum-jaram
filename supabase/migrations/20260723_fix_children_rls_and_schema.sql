-- ========================================================
-- 우리아이 꿈 자람 터 - children 테이블 스키마 및 RLS 보완 SQL
-- Migration Date: 2026-07-23
-- Description: children 테이블 actual_job 컬럼 추가 및 RLS INSERT/SELECT/UPDATE 허용 정책 보완
-- ========================================================

-- 1. children 테이블 actual_job 컬럼 추가 (존재하지 않을 경우)
ALTER TABLE children ADD COLUMN IF NOT EXISTS actual_job text;
ALTER TABLE children ADD COLUMN IF NOT EXISTS dream_job text;

-- 2. children RLS 정책 보완 (본인 account_id 기준 INSERT / SELECT / UPDATE / DELETE 허용)
DROP POLICY IF EXISTS "본인 아이 프로필 관리" ON children;
DROP POLICY IF EXISTS "본인 아이 프로필 조회" ON children;
DROP POLICY IF EXISTS "본인 아이 프로필 생성" ON children;
DROP POLICY IF EXISTS "본인 아이 프로필 수정" ON children;
DROP POLICY IF EXISTS "본인 아이 프로필 삭제" ON children;

-- RLS 생성/조회/수정 통합 정책
CREATE POLICY "본인 아이 프로필 완전 관리" ON children
  FOR ALL
  USING (account_id = auth.uid())
  WITH CHECK (account_id = auth.uid());

-- 3. accounts RLS 정책 보완
DROP POLICY IF EXISTS "본인 계정 조회/수정" ON accounts;
CREATE POLICY "본인 계정 완전 관리" ON accounts
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. wishes RLS 정책 보완
DROP POLICY IF EXISTS "본인 아이 소원상자 관리" ON wishes;
CREATE POLICY "본인 아이 소원상자 완전 관리" ON wishes
  FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE account_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM children WHERE account_id = auth.uid()));

-- 5. points_ledger RLS 정책 보완
DROP POLICY IF EXISTS "본인 아이 포인트 원장 관리" ON points_ledger;
CREATE POLICY "본인 아이 포인트 원장 완전 관리" ON points_ledger
  FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE account_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM children WHERE account_id = auth.uid()));
