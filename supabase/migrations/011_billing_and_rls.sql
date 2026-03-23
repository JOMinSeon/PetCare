-- ============================================================
-- 결제/플랜 개선 및 RLS 전체 적용
--   1. plan_limits에 가격 컬럼 추가 (하드코딩된 가격을 DB로 통합)
--   2. next_billing_at 초기화 (연간 결제 버그 수정 지원)
--   3. 모든 테이블 RLS 활성화 확인
-- ============================================================

-- ============================================================
-- 1. plan_limits 가격 컬럼 추가
-- ============================================================
ALTER TABLE plan_limits
  ADD COLUMN IF NOT EXISTS monthly_price integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yearly_price  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_name    text    NOT NULL DEFAULT '';

UPDATE plan_limits SET
  monthly_price = 0,
  yearly_price  = 0,
  order_name    = '무료 플랜'
WHERE plan_type = 'free';

UPDATE plan_limits SET
  monthly_price = 14900,
  yearly_price  = 149000,
  order_name    = '프리미엄 플랜'
WHERE plan_type = 'premium';

UPDATE plan_limits SET
  monthly_price = 49000,
  yearly_price  = 490000,
  order_name    = '병원용 플랜'
WHERE plan_type = 'clinic';

-- ============================================================
-- 2. 기존 활성 구독자 next_billing_at 초기화
--    (billing_cycle 기준으로 정확한 다음 결제일 설정)
-- ============================================================
UPDATE profiles
SET next_billing_at = CASE
    WHEN billing_cycle = 'yearly' THEN plan_started_at + INTERVAL '1 year'
    ELSE plan_started_at + INTERVAL '1 month'
  END
WHERE subscription_status = 'active'
  AND plan_started_at IS NOT NULL
  AND next_billing_at IS NULL;

-- ============================================================
-- 3. 모든 테이블 RLS 활성화 (이미 적용된 경우 무해)
-- ============================================================
ALTER TABLE payment_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage         ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds               ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records        ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vets                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_consultations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_configs     ENABLE ROW LEVEL SECURITY;
