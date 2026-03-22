-- ============================================================
-- 결제 내역 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id          uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_id  text         NOT NULL,
  plan        text         NOT NULL,
  amount      integer      NOT NULL,
  status      text         NOT NULL CHECK (status IN ('success', 'failed')),
  type        text         NOT NULL CHECK (type IN ('subscribe', 'renewal')),
  created_at  timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS payment_history_user_id_idx ON payment_history (user_id, created_at DESC);

-- RLS: 본인 결제 내역만 조회 가능 (서비스 롤은 RLS 자동 bypass)
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 신규 유저 가입 시 profiles 행 자동 생성 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
