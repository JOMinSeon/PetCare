-- ============================================================
-- billing_keys 테이블 (KG이니시스 PortOne 빌링키 저장)
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_keys (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  billing_key text        NOT NULL,
  plan_id     text        NOT NULL,
  status      text        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive')),
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS billing_keys_user_id_idx ON billing_keys (user_id);
CREATE INDEX IF NOT EXISTS billing_keys_status_idx   ON billing_keys (user_id, status);

ALTER TABLE billing_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own billing key" ON billing_keys;
CREATE POLICY "Users can manage own billing key"
  ON billing_keys FOR ALL
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS billing_keys_updated_at ON billing_keys;
CREATE TRIGGER billing_keys_updated_at
  BEFORE UPDATE ON billing_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
