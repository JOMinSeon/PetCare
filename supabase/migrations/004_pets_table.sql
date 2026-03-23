-- ============================================================
-- 반려동물 테이블
-- 플랜별 등록 제한: 무료 1마리 / 프리미엄 3마리 / 병원용 무제한
-- ============================================================

CREATE TABLE IF NOT EXISTS pets (
  id          uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text         NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  species     text         NOT NULL CHECK (species IN ('dog', 'cat')),
  breed       text,
  birth_date  date,
  age         numeric      CHECK (age >= 0 AND age <= 30),
  weight      numeric      CHECK (weight > 0 AND weight <= 200),
  neutered    boolean      DEFAULT false,
  avatar_url  text,
  is_active   boolean      DEFAULT true,
  created_at  timestamptz  DEFAULT now() NOT NULL,
  updated_at  timestamptz  DEFAULT now() NOT NULL
);

-- 테이블이 이미 존재할 경우 누락 컬럼 추가
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS breed      text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS is_active  boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 인덱스
CREATE INDEX IF NOT EXISTS pets_user_id_idx        ON pets (user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS pets_user_species_idx   ON pets (user_id, species) WHERE is_active = true;

-- updated_at 트리거
DROP TRIGGER IF EXISTS pets_updated_at ON pets;
CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pets"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets"
  ON pets FOR DELETE
  USING (auth.uid() = user_id);
