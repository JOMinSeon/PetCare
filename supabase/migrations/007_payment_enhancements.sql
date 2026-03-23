-- ============================================================
-- 결제 관련 보완
--   1. refunds          — 환불 내역
--   2. webhook_events   — 웹훅 중복 처리 방지 (idempotency)
-- ============================================================

-- 1. 환불 내역 -----------------------------------------------
CREATE TABLE IF NOT EXISTS refunds (
  id                  uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 원본 결제 연결 (payment_history.payment_id 참조)
  payment_id          text    NOT NULL,
  refund_amount       integer NOT NULL CHECK (refund_amount > 0),
  reason              text,

  -- PortOne 환불 응답
  portone_cancel_id   text,
  status              text    DEFAULT 'pending'
                      CHECK (status IN ('pending', 'completed', 'failed')),

  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS refunds_user_id_idx       ON refunds (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS refunds_payment_id_idx    ON refunds (payment_id);

DROP TRIGGER IF EXISTS refunds_updated_at ON refunds;
CREATE TRIGGER refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refunds"
  ON refunds FOR SELECT
  USING (auth.uid() = user_id);

-- 2. 웹훅 이벤트 (idempotency) --------------------------------
-- PortOne 웹훅은 재시도될 수 있으므로 이미 처리된 이벤트는 무시
CREATE TABLE IF NOT EXISTS webhook_events (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id        text    NOT NULL UNIQUE,   -- PortOne tx_id 또는 webhook 고유 ID
  event_type      text    NOT NULL,
  payment_id      text,
  status          text    NOT NULL CHECK (status IN ('processed', 'skipped', 'error')),
  payload         jsonb,
  processed_at    timestamptz DEFAULT now() NOT NULL
);

-- 최근 30일 이벤트만 보존 (오래된 행은 pg_cron 등으로 정리 가능)
CREATE INDEX IF NOT EXISTS webhook_events_processed_at_idx
  ON webhook_events (processed_at DESC);

-- webhook_events는 서비스 롤 전용 (유저 접근 불필요)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- 유저에게 노출하지 않음 — 정책 없음 = 서비스 롤만 접근 가능

-- ============================================================
-- payment_history 보완: tax, billing_cycle 컬럼 추가
-- ============================================================
ALTER TABLE payment_history
  ADD COLUMN IF NOT EXISTS tax           integer,
  ADD COLUMN IF NOT EXISTS billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly'));
