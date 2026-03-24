-- ============================================================
-- handle_new_user 트리거 수정
-- 1. profiles NOT NULL 컬럼 (email, name) DEFAULT 추가
-- 2. 트리거 함수: email/name 포함 INSERT + ON CONFLICT DO NOTHING
-- ============================================================

ALTER TABLE profiles
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN name  SET DEFAULT '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
