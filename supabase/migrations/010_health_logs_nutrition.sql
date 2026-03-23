-- =============================================
-- PetHealth AI — 누락 컬럼 및 테이블 추가
-- =============================================

-- pets 테이블 누락 컬럼 추가
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS gender           TEXT CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS is_neutered      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2);

-- =============================================
-- health_logs 테이블
-- =============================================

CREATE TABLE IF NOT EXISTS health_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id           UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at        DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg        DECIMAL(5,2),
  food_name        TEXT,
  food_amount_g    DECIMAL(8,2),
  calories_kcal    DECIMAL(8,2),
  water_ml         DECIMAL(8,2),
  activity_level   TEXT CHECK (activity_level IN ('low', 'normal', 'high')),
  stool_condition  TEXT CHECK (stool_condition IN ('normal', 'soft', 'hard', 'none')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (pet_id, logged_at)
);

-- health_logs 테이블 누락 컬럼 추가
ALTER TABLE health_logs
  ADD COLUMN IF NOT EXISTS logged_at       DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS weight_kg       DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS food_name       TEXT,
  ADD COLUMN IF NOT EXISTS food_amount_g   DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS calories_kcal   DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS water_ml        DECIMAL(8,2),
  ADD COLUMN IF NOT EXISTS activity_level  TEXT CHECK (activity_level IN ('low', 'normal', 'high')),
  ADD COLUMN IF NOT EXISTS stool_condition TEXT CHECK (stool_condition IN ('normal', 'soft', 'hard', 'none')),
  ADD COLUMN IF NOT EXISTS user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS notes           TEXT;

CREATE INDEX IF NOT EXISTS idx_health_logs_pet ON health_logs(pet_id, logged_at DESC);

ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'health_logs' AND policyname = 'health_logs_owner'
  ) THEN
    CREATE POLICY "health_logs_owner" ON health_logs
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- =============================================
-- vaccinations 테이블
-- =============================================

CREATE TABLE IF NOT EXISTS vaccinations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id       UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('VACCINE','DEWORMING','HEARTWORM','FLEA')),
  name         TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status       TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','overdue')),
  completed_at TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 테이블이 이미 존재할 경우 누락 컬럼 추가
ALTER TABLE vaccinations
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'upcoming',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes        TEXT;

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'vaccinations' AND policyname = 'vaccinations_owner'
  ) THEN
    CREATE POLICY "vaccinations_owner" ON vaccinations
      USING (auth.uid() = (SELECT user_id FROM pets WHERE id = pet_id));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_vaccinations_pet ON vaccinations(pet_id, scheduled_at);

-- =============================================
-- nutrition_configs 테이블
-- =============================================

CREATE TABLE IF NOT EXISTS nutrition_configs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id             UUID NOT NULL UNIQUE REFERENCES pets(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES auth.users(id),
  goal               TEXT NOT NULL DEFAULT 'maintain' CHECK (goal IN ('loss','maintain','gain')),
  food_kcal_per_100g DECIMAL(8,2) NOT NULL DEFAULT 360,
  food_preset_name   TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- 테이블이 이미 존재할 경우 누락 컬럼 추가
ALTER TABLE nutrition_configs
  ADD COLUMN IF NOT EXISTS food_preset_name TEXT,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT now();

ALTER TABLE nutrition_configs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nutrition_configs' AND policyname = 'nutrition_owner'
  ) THEN
    CREATE POLICY "nutrition_owner" ON nutrition_configs
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;
