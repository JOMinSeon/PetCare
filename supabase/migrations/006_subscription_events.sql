-- ============================================================
-- 구독 이벤트 감사 로그
-- 플랜 변경, 취소, 재개, 결제 성공/실패 이력을 불변 기록으로 보존
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_events (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 이벤트 종류
  event_type  text    NOT NULL CHECK (event_type IN (
    'subscribed',        -- 신규 유료 구독 시작
    'renewed',           -- 정기 갱신 결제 성공
    'upgraded',          -- 플랜 업그레이드 (예: premium → clinic)
    'downgraded',        -- 플랜 다운그레이드
    'cancelled',         -- 구독 취소 요청
    'reactivated',       -- 취소 후 재구독
    'payment_failed',    -- 결제 실패 (크론 또는 웹훅)
    'card_changed'       -- 카드(빌링키) 변경
  )),

  -- 변경 전/후 상태
  from_plan   text    CHECK (from_plan IN ('free', 'premium', 'clinic')),
  to_plan     text    CHECK (to_plan   IN ('free', 'premium', 'clinic')),
  from_cycle  text    CHECK (from_cycle IN ('monthly', 'yearly')),
  to_cycle    text    CHECK (to_cycle   IN ('monthly', 'yearly')),

  -- 관련 결제 정보
  amount      integer,
  payment_id  text,                 -- payment_history.payment_id

  -- 추가 컨텍스트 (사유, 오류 메시지 등)
  metadata    jsonb,

  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS subscription_events_user_id_idx
  ON subscription_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS subscription_events_type_idx
  ON subscription_events (event_type, created_at DESC);

-- RLS (본인 이벤트만 조회, 삽입은 서비스 롤만 가능)
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- 삽입은 서비스 롤(API)만 가능 — 유저가 직접 쓸 수 없음
-- (서비스 롤은 RLS를 bypass하므로 별도 INSERT 정책 불필요)
