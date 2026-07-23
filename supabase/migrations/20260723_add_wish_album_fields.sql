-- ========================================================
-- 우리아이 꿈 자람 터 - wishes 테이블 추억 앨범 필드 보완 SQL
-- Migration Date: 2026-07-23
-- Description: wishes 테이블 parent_message, redemption_type 컬럼 추가
-- ========================================================

ALTER TABLE wishes ADD COLUMN IF NOT EXISTS parent_message text;
ALTER TABLE wishes ADD COLUMN IF NOT EXISTS redemption_type text DEFAULT '포인트 교환 🎁';
