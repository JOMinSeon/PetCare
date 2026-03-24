-- ============================================================
-- 쿠폰/프로모션 시스템
--   1. coupons 테이블 — 쿠폰 정의
--   2. coupon_usages 테이블 — 사용 이력
--   3. RLS 정책
--   4. increment_coupon_used_count RPC
-- ============================================================

-- ============================================================
-- 1. coupons 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text        NOT NULL UNIQUE,
  type             text        NOT NULL CHECK (type IN ('fixed', 'percent')),
  discount_value   integer     NOT NULL CHECK (discount_value > 0),
  applicable_plans text[]      DEFAULT NULL,  -- NULL = 모든 플랜 적용 가능
  expires_at       timestamptz DEFAULT NULL,
  max_uses         integer     DEFAULT NULL,  -- NULL = 무제한
  used_count       integer     NOT NULL DEFAULT 0,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. coupon_usages 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_usages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id  uuid        NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id)  -- 유저당 1회만 사용 가능
);

-- ============================================================
-- 3. RLS
-- ============================================================
ALTER TABLE coupons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- coupons: 인증 유저는 조회 가능, 수정은 service_role만
CREATE POLICY "coupons_read" ON coupons
  FOR SELECT TO authenticated USING (true);

-- coupon_usages: 본인 이력만 조회
CREATE POLICY "coupon_usages_read_own" ON coupon_usages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- 4. RPC: used_count 안전 증가 (service_role에서 호출)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_coupon_used_count(coupon_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
$$;

-- ============================================================
-- 5. 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_coupons_code      ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user ON coupon_usages (user_id);
