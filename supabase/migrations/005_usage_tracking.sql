-- ============================================================
-- 기능 사용량 추적
--   - AI 건강 상담: 무료 5회/월, 프리미엄/병원용 무제한
--   - 수의사 원격 상담: 무료 0회, 프리미엄 3회/월, 병원용 무제한
--   - 건강 리포트 PDF: 무료 0회, 프리미엄 1회/월, 병원용 무제한
-- ============================================================

-- 월별 기능 사용량 (billing_month: 'YYYY-MM')
CREATE TABLE IF NOT EXISTS feature_usage (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_month   text    NOT NULL CHECK (billing_month ~ '^\d{4}-\d{2}$'),
  ai_consultations    integer DEFAULT 0 NOT NULL CHECK (ai_consultations >= 0),
  vet_consultations   integer DEFAULT 0 NOT NULL CHECK (vet_consultations >= 0),
  pdf_reports         integer DEFAULT 0 NOT NULL CHECK (pdf_reports >= 0),
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, billing_month)
);

CREATE INDEX IF NOT EXISTS feature_usage_user_month_idx
  ON feature_usage (user_id, billing_month DESC);

DROP TRIGGER IF EXISTS feature_usage_updated_at ON feature_usage;
CREATE TRIGGER feature_usage_updated_at
  BEFORE UPDATE ON feature_usage
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feature usage"
  ON feature_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 플랜별 기능 한도 (서버에서 참조용 — 코드와 단일 소스 역할)
-- ============================================================
CREATE TABLE IF NOT EXISTS plan_limits (
  plan_type           text    PRIMARY KEY CHECK (plan_type IN ('free', 'premium', 'clinic')),
  max_pets            integer,          -- NULL = 무제한
  ai_consultations    integer,          -- NULL = 무제한
  vet_consultations   integer,          -- NULL = 무제한
  pdf_reports         integer,          -- NULL = 무제한
  max_users           integer,          -- NULL = 무제한 (병원용 다중 사용자)
  emr_api_access      boolean DEFAULT false,
  data_export_csv     boolean DEFAULT false,
  data_export_api     boolean DEFAULT false
);

INSERT INTO plan_limits VALUES
  ('free',     1,    5,    0,    0,    1,    false, false, false),
  ('premium',  3,    NULL, 3,    1,    2,    false, true,  false),
  ('clinic',   NULL, NULL, NULL, NULL, NULL, true,  true,  true)
ON CONFLICT (plan_type) DO UPDATE SET
  max_pets            = EXCLUDED.max_pets,
  ai_consultations    = EXCLUDED.ai_consultations,
  vet_consultations   = EXCLUDED.vet_consultations,
  pdf_reports         = EXCLUDED.pdf_reports,
  max_users           = EXCLUDED.max_users,
  emr_api_access      = EXCLUDED.emr_api_access,
  data_export_csv     = EXCLUDED.data_export_csv,
  data_export_api     = EXCLUDED.data_export_api;

-- RLS (읽기만 허용)
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan limits are publicly readable"
  ON plan_limits FOR SELECT
  USING (true);
