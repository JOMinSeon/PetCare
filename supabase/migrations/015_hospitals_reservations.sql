-- ============================================================
-- 동물병원 검색 및 예약 연동 (Phase 5)
--   - 제휴 병원 정보 관리
--   - 온라인 예약 시스템
-- ============================================================

-- 동물병원 정보
CREATE TABLE IF NOT EXISTS hospitals (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text    NOT NULL,
  address         text    NOT NULL,
  latitude        numeric(10, 7),
  longitude       numeric(10, 7),
  phone           text,
  operating_hours jsonb   DEFAULT '{}',
  departments     text[]  DEFAULT '{}',
  is_24h          boolean DEFAULT false,
  is_partner      boolean DEFAULT false,
  avg_price       integer,
  description     text,
  image_url       text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS hospitals_location_idx
  ON hospitals (latitude, longitude);
CREATE INDEX IF NOT EXISTS hospitals_partner_idx
  ON hospitals (is_partner) WHERE is_partner = true;

-- RLS: 파트너 병원은 공개 조회, 전체는 관리자만
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner hospitals are publicly readable"
  ON hospitals FOR SELECT
  USING (is_partner = true AND is_active = true);

CREATE POLICY "Anyone can insert partner hospitals"
  ON hospitals FOR INSERT
  WITH CHECK (is_partner = true);

CREATE POLICY "Only admins can update hospitals"
  ON hospitals FOR UPDATE
  USING (true);

-- 병원 예약
CREATE TABLE IF NOT EXISTS hospital_reservations (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id          uuid    REFERENCES pets(id) ON DELETE SET NULL,
  hospital_id     uuid    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,

  reservation_date date   NOT NULL,
  reservation_time text   NOT NULL,
  department       text   NOT NULL,
  chief_complaint  text,

  status          text    DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),

  cancel_reason   text,
  cancelled_at     timestamptz,

  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS hospital_reservations_user_idx
  ON hospital_reservations (user_id, reservation_date DESC);
CREATE INDEX IF NOT EXISTS hospital_reservations_hospital_idx
  ON hospital_reservations (hospital_id, reservation_date DESC)
  WHERE status IN ('pending', 'confirmed');

DROP TRIGGER IF EXISTS hospital_reservations_updated_at ON hospital_reservations;
CREATE TRIGGER hospital_reservations_updated_at
  BEFORE UPDATE ON hospital_reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE hospital_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON hospital_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations"
  ON hospital_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON hospital_reservations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel own reservations"
  ON hospital_reservations FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');
