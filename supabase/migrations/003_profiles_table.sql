-- ============================================================
-- profiles 테이블 정식 정의 및 누락 컬럼 추가
-- 기존 테이블이 대시보드에서 수동 생성되었으므로 ADD COLUMN 방식 사용
-- ============================================================

-- 플랜 값 정규화: 'plus' → 'premium' (pet.ts 레거시 값 마이그레이션)
UPDATE profiles
  SET subscription_plan = 'premium'
  WHERE subscription_plan = 'plus';

-- 누락된 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS next_billing_at   timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at      timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at        timestamptz DEFAULT now();

-- subscription_plan CHECK 제약 추가 (기존 제약이 없을 경우)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_subscription_plan_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_subscription_plan_check
      CHECK (subscription_plan IN ('free', 'premium', 'clinic'));
  END IF;
END $$;

-- subscription_status CHECK 제약 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_subscription_status_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_subscription_status_check
      CHECK (subscription_status IN ('active', 'inactive', 'payment_failed', 'cancelled'));
  END IF;
END $$;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 인덱스
CREATE INDEX IF NOT EXISTS profiles_subscription_plan_idx  ON profiles (subscription_plan);
CREATE INDEX IF NOT EXISTS profiles_next_billing_at_idx    ON profiles (next_billing_at)
  WHERE subscription_status = 'active';

-- RLS (기존에 없을 경우)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
