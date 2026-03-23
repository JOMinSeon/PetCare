-- ============================================================
-- billing_cycle 컬럼 추가 (monthly | yearly)
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly'
  CHECK (billing_cycle IN ('monthly', 'yearly'));
