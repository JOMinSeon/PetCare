-- ============================================================
-- 건강 기록 (Phase 4 — 건강 기록 관리)
--   체중, 식이, 증상, 투약, 예방접종
--   - 무료: 기본 기록 (최근 90일)
--   - 프리미엄+: 전체 히스토리 + 시계열 차트 + PDF 리포트
-- ============================================================

-- 체중 기록 (시계열 차트용)
CREATE TABLE IF NOT EXISTS weight_records (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id      uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id     uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg   numeric NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 200),
  recorded_at date    NOT NULL DEFAULT CURRENT_DATE,
  note        text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS weight_records_pet_date_idx
  ON weight_records (pet_id, recorded_at DESC);

-- 식이 기록
CREATE TABLE IF NOT EXISTS diet_records (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id      uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id     uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name   text    NOT NULL,
  amount_g    numeric CHECK (amount_g > 0),
  calories    integer CHECK (calories >= 0),
  meal_time   text    CHECK (meal_time IN ('morning', 'afternoon', 'evening', 'snack')),
  recorded_at date    NOT NULL DEFAULT CURRENT_DATE,
  note        text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS diet_records_pet_date_idx
  ON diet_records (pet_id, recorded_at DESC);

-- 증상 기록
CREATE TABLE IF NOT EXISTS symptom_records (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id      uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id     uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom     text    NOT NULL,
  severity    text    CHECK (severity IN ('mild', 'moderate', 'severe')),
  photo_url   text,                       -- 프리미엄: 증상 사진 AI 분석
  ai_analysis text,                       -- Gemini 분석 결과
  recorded_at date    NOT NULL DEFAULT CURRENT_DATE,
  note        text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS symptom_records_pet_date_idx
  ON symptom_records (pet_id, recorded_at DESC);

-- 투약 기록
CREATE TABLE IF NOT EXISTS medication_records (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id          uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name text    NOT NULL,
  dosage          text,
  frequency       text,
  start_date      date    NOT NULL,
  end_date        date,
  note            text,
  created_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS medication_records_pet_idx
  ON medication_records (pet_id, start_date DESC);

-- 예방접종 기록 (무료 포함 — 알림 기능용)
CREATE TABLE IF NOT EXISTS vaccination_records (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id          uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vaccine_name    text    NOT NULL,
  vaccinated_at   date    NOT NULL,
  next_due_at     date,                   -- 다음 접종일 (알림 기준)
  clinic_name     text,
  note            text,
  created_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS vaccination_records_pet_idx
  ON vaccination_records (pet_id, vaccinated_at DESC);

CREATE INDEX IF NOT EXISTS vaccination_records_next_due_idx
  ON vaccination_records (next_due_at)
  WHERE next_due_at IS NOT NULL;

-- ============================================================
-- RLS (공통: 본인 반려동물 기록만 접근)
-- ============================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'weight_records', 'diet_records', 'symptom_records',
    'medication_records', 'vaccination_records'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format(
      'CREATE POLICY "Users can manage own %1$s"
       ON %1$I FOR ALL
       USING (auth.uid() = user_id)
       WITH CHECK (auth.uid() = user_id)',
      tbl
    );
  END LOOP;
END $$;
