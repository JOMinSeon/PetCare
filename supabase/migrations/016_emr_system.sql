-- ============================================================
-- EMR (전자medical records) 시스템 연동 준비
--   - FHIR 표준 기반 동물 건강 기록
--   - 외부 EMR 시스템과의 동기화
-- ============================================================

-- EMR 동기화 로그
CREATE TABLE IF NOT EXISTS emr_sync_log (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id     uuid    REFERENCES hospitals(id) ON DELETE CASCADE,
  sync_token      text    NOT NULL,
  status          text    DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  records_count   integer DEFAULT 0,
  error_message   text,
  last_sync_at    timestamptz,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS emr_sync_log_user_idx ON emr_sync_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS emr_sync_log_token_idx ON emr_sync_log (sync_token);

DROP TRIGGER IF EXISTS emr_sync_log_updated_at ON emr_sync_log;
CREATE TRIGGER emr_sync_log_updated_at
  BEFORE UPDATE ON emr_sync_log
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE emr_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sync logs"
  ON emr_sync_log FOR ALL
  USING (auth.uid() = user_id);

-- EMR 기록 (진료 이력, 예방접종, 처방 등)
CREATE TABLE IF NOT EXISTS emr_records (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id          uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  hospital_id     uuid    REFERENCES hospitals(id) ON DELETE SET NULL,

  visit_date      date    NOT NULL,
  visit_type      text    NOT NULL
                  CHECK (visit_type IN ('진료', '예방접종', '수술', '검사', '호텔링', '미용', '기타')),
  
  diagnosis       text,
  treatment       text,
  medications     jsonb   DEFAULT '[]',
  notes           text,

  fhir_resource_id text,
  fhir_resource_type text,

  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS emr_records_pet_idx ON emr_records (pet_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS emr_records_hospital_idx ON emr_records (hospital_id);
CREATE INDEX IF NOT EXISTS emr_records_fhir_idx ON emr_records (fhir_resource_id);

DROP TRIGGER IF EXISTS emr_records_updated_at ON emr_records;
CREATE TRIGGER emr_records_updated_at
  BEFORE UPDATE ON emr_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE emr_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pet EMR"
  ON emr_records FOR ALL
  USING (auth.uid() = user_id);

-- 예방접종 기록 (emr_records의 visit_type='예방접종'과 연결)
CREATE TABLE IF NOT EXISTS vaccinations (
  id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  emr_record_id     uuid    REFERENCES emr_records(id) ON DELETE CASCADE,
  pet_id            uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name      text    NOT NULL,
  vaccine_manufacturer text,
  lot_number        text,
  administered_date date    NOT NULL,
  next_due_date     date,
  veterinarian      text,
  clinic_name       text,
  notes             text,
  created_at        timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS vaccinations_pet_idx ON vaccinations (pet_id, administered_date DESC);
CREATE INDEX IF NOT EXISTS vaccinations_next_due_idx ON vaccinations (next_due_date)
  WHERE next_due_date IS NOT NULL;

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pet vaccinations"
  ON vaccinations FOR ALL
  USING (auth.uid() = user_id);

-- 처방 기록
CREATE TABLE IF NOT EXISTS prescriptions (
  id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  emr_record_id     uuid    REFERENCES emr_records(id) ON DELETE CASCADE,
  pet_id            uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  medication_name   text    NOT NULL,
  dosage            text,
  frequency         text,
  start_date        date,
  end_date          date,
  prescribed_date    date    NOT NULL,
  veterinarian      text,
  hospital_id       uuid    REFERENCES hospitals(id) ON DELETE SET NULL,
  notes             text,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS prescriptions_pet_idx ON prescriptions (pet_id, prescribed_date DESC);
CREATE INDEX IF NOT EXISTS prescriptions_active_idx ON prescriptions (is_active) WHERE is_active = true;

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pet prescriptions"
  ON prescriptions FOR ALL
  USING (auth.uid() = user_id);

-- 분석을 위한 뷰: 반려동물별 최근 건강 상태 요약
CREATE OR REPLACE VIEW pet_health_summary AS
SELECT 
  p.id as pet_id,
  p.name as pet_name,
  p.species,
  COUNT(DISTINCT er.id) as total_visits,
  COUNT(DISTINCT v.id) FILTER (WHERE v.administered_date >= NOW() - INTERVAL '1 year') as vaccinations_this_year,
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.is_active = true) as active_prescriptions,
  MAX(er.visit_date) as last_visit_date
FROM pets p
LEFT JOIN emr_records er ON p.id = er.pet_id
LEFT JOIN vaccinations v ON p.id = v.pet_id
LEFT JOIN prescriptions pr ON p.id = pr.pet_id
GROUP BY p.id, p.name, p.species;
