-- ============================================================
-- 비회원(Anonymous) 로그인 지원을 위한 트리거 수정
-- 문제: 익명 유저는 email이 NULL → NOT NULL 제약 위반 → 유저 생성 실패
-- 수정: COALESCE로 NULL 방어
-- ============================================================

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
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
