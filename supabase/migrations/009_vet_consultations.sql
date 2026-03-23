-- ============================================================
-- 수의사 원격 상담 (Phase 4)
--   - 프리미엄: 3회/월
--   - 병원용: 무제한
-- ============================================================

-- 수의사 정보 (병원용 플랜 EMR 연동)
CREATE TABLE IF NOT EXISTS vets (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text    NOT NULL,
  specialty       text,
  license_number  text    UNIQUE,
  hospital_name   text,
  avatar_url      text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now() NOT NULL
);

-- RLS: 누구나 조회 가능 (예약 화면에서 수의사 목록 표시용)
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vets are publicly readable"
  ON vets FOR SELECT
  USING (is_active = true);

-- 상담 예약
CREATE TABLE IF NOT EXISTS vet_consultations (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id          uuid    REFERENCES pets(id) ON DELETE SET NULL,
  vet_id          uuid    REFERENCES vets(id) ON DELETE SET NULL,

  -- 예약 시간 슬롯
  scheduled_at    timestamptz NOT NULL,
  duration_min    integer DEFAULT 30 CHECK (duration_min > 0),

  status          text    DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),

  -- 상담 내용
  chief_complaint text,                    -- 주요 증상/상담 이유
  vet_notes       text,                    -- 수의사 소견 (상담 후 입력)

  -- 취소 정보
  cancelled_at    timestamptz,
  cancel_reason   text,

  -- 비용 (병원용 플랜에서 자체 과금 시)
  fee             integer DEFAULT 0,

  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS vet_consultations_user_idx
  ON vet_consultations (user_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS vet_consultations_scheduled_idx
  ON vet_consultations (scheduled_at)
  WHERE status IN ('pending', 'confirmed');

DROP TRIGGER IF EXISTS vet_consultations_updated_at ON vet_consultations;
CREATE TRIGGER vet_consultations_updated_at
  BEFORE UPDATE ON vet_consultations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE vet_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON vet_consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consultations"
  ON vet_consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations"
  ON vet_consultations FOR UPDATE
  USING (auth.uid() = user_id);

-- 상담 채팅 메시지 (Supabase Realtime 활용)
CREATE TABLE IF NOT EXISTS consultation_messages (
  id                  uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id     uuid    NOT NULL REFERENCES vet_consultations(id) ON DELETE CASCADE,
  sender_id           uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role         text    NOT NULL CHECK (sender_role IN ('user', 'vet', 'system')),
  content             text    NOT NULL,
  attachment_url      text,
  created_at          timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS consultation_messages_consult_idx
  ON consultation_messages (consultation_id, created_at ASC);

ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

-- 상담 참여자(유저 + 수의사)만 메시지 조회 가능
CREATE POLICY "Consultation participants can view messages"
  ON consultation_messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() IN (
      SELECT user_id FROM vet_consultations WHERE id = consultation_id
    )
  );

CREATE POLICY "Participants can send messages"
  ON consultation_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
