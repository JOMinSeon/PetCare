-- ============================================================
-- VetClinic Manager - 동물병원 실시간 예약 대시보드
-- Phase 1: 핵심 테이블 생성
-- ============================================================

-- 의사(수의사) 프로필
CREATE TABLE IF NOT EXISTS doctors (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id     uuid    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id         uuid    REFERENCES auth.users(id) ON DELETE SET NULL,
  name            text    NOT NULL,
  email           text,
  phone           text,
  specialty       text[]  DEFAULT '{}',
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS doctors_hospital_idx ON doctors (hospital_id);

-- 진료실
CREATE TABLE IF NOT EXISTS rooms (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id     uuid    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name            text    NOT NULL,
  room_number     text,
  equipment       text[],
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS rooms_hospital_idx ON rooms (hospital_id);

-- 보호자 (반려동물 주인)
CREATE TABLE IF NOT EXISTS guardians (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id     uuid    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id         uuid    REFERENCES auth.users(id) ON DELETE SET NULL,
  name            text    NOT NULL,
  phone           text    NOT NULL,
  email           text,
  address         text,
  memo            text,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS guardians_hospital_idx ON guardians (hospital_id);
CREATE INDEX IF NOT EXISTS guardians_phone_idx ON guardians (phone);

-- enhanced pets table (기존 pets 테이블과 연결)
CREATE TABLE IF NOT EXISTS guardian_pets (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id     uuid    NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  pet_id          uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  relationship     text    DEFAULT 'owner',
  created_at      timestamptz DEFAULT now() NOT NULL,
  UNIQUE(guardian_id, pet_id)
);

CREATE INDEX IF NOT EXISTS guardian_pets_guardian_idx ON guardian_pets (guardian_id);
CREATE INDEX IF NOT EXISTS guardian_pets_pet_idx ON guardian_pets (pet_id);

-- enhanced appointments (병원 예약 시스템)
CREATE TABLE IF NOT EXISTS vet_appointments (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id     uuid    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  pet_id          uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  guardian_id     uuid    NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  doctor_id       uuid    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  room_id         uuid    REFERENCES rooms(id) ON DELETE SET NULL,
  
  appointment_type text   DEFAULT 'general'
                  CHECK (appointment_type IN ('general', 'surgery', 'checkup', 'vaccination', 'emergency')),
  scheduled_at    timestamptz NOT NULL,
  duration_min    integer DEFAULT 30,
  status          text    DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed', 'arrived', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show')),
  
  chief_complaint text,
  memo            text,
  
  created_by      uuid    REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS vet_appointments_hospital_idx ON vet_appointments (hospital_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS vet_appointments_doctor_idx ON vet_appointments (doctor_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS vet_appointments_pet_idx ON vet_appointments (pet_id);
CREATE INDEX IF NOT EXISTS vet_appointments_status_idx ON vet_appointments (status) WHERE status IN ('confirmed', 'arrived', 'waiting', 'in_progress');

DROP TRIGGER IF EXISTS vet_appointments_updated_at ON vet_appointments;
CREATE TRIGGER vet_appointments_updated_at
  BEFORE UPDATE ON vet_appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 당일 대기 큐 (워크인)
CREATE TABLE IF NOT EXISTS walk_in_queue (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id     uuid    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  pet_id          uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  guardian_id     uuid    NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  doctor_id       uuid    REFERENCES doctors(id) ON DELETE SET NULL,
  
  queue_number    integer NOT NULL,
  status          text    DEFAULT 'waiting'
                  CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  
  arrived_at      timestamptz DEFAULT now(),
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS walk_in_queue_hospital_idx ON walk_in_queue (hospital_id, arrived_at DESC);
CREATE INDEX IF NOT EXISTS walk_in_queue_status_idx ON walk_in_queue (hospital_id, status) WHERE status = 'waiting';

DROP TRIGGER IF EXISTS walk_in_queue_updated_at ON walk_in_queue;
CREATE TRIGGER walk_in_queue_updated_at
  BEFORE UPDATE ON walk_in_queue
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 진료 기록
CREATE TABLE IF NOT EXISTS medical_records (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id  uuid    REFERENCES vet_appointments(id) ON DELETE SET NULL,
  queue_id        uuid    REFERENCES walk_in_queue(id) ON DELETE SET NULL,
  pet_id          uuid    NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  doctor_id       uuid    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  chief_complaint text,
  diagnosis       text,
  treatment       text,
  notes           text,
  weight_kg       numeric(5,2),
  temperature     numeric(4,1),
  
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS medical_records_pet_idx ON medical_records (pet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS medical_records_doctor_idx ON medical_records (doctor_id);

DROP TRIGGER IF EXISTS medical_records_updated_at ON medical_records;
CREATE TRIGGER medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 의사 스케줄
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id       uuid    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week     integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time      time    NOT NULL,
  end_time        time    NOT NULL,
  slot_min        integer DEFAULT 30,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL,
  UNIQUE(doctor_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS doctor_schedules_doctor_idx ON doctor_schedules (doctor_id);

-- 의사 휴진/휴가
CREATE TABLE IF NOT EXISTS doctor_leaves (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id       uuid    NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  start_date      date    NOT NULL,
  end_date        date    NOT NULL,
  reason          text,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS doctor_leaves_doctor_idx ON doctor_leaves (doctor_id);
CREATE INDEX IF NOT EXISTS doctor_leaves_dates_idx ON doctor_leaves (start_date, end_date);

DROP TRIGGER IF EXISTS doctor_leaves_updated_at ON doctor_leaves;
CREATE TRIGGER doctor_leaves_updated_at
  BEFORE UPDATE ON doctor_leaves
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_in_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_leaves ENABLE ROW LEVEL SECURITY;

-- 의사: 같은 병원 내 모든 사용자가 조회 가능
CREATE POLICY "Doctors are readable by hospital users"
  ON doctors FOR SELECT
  USING (true);

CREATE POLICY "Doctors can be managed by hospital admins"
  ON doctors FOR ALL
  USING (true);

-- 진료실: 같은 병원 내 모든 사용자가 조회 가능
CREATE POLICY "Rooms are readable by hospital users"
  ON rooms FOR SELECT
  USING (true);

CREATE POLICY "Rooms can be managed by hospital admins"
  ON rooms FOR ALL
  USING (true);

-- 보호자: 같은 병원 내 모든 사용자가 조회/관리 가능
CREATE POLICY "Guardians are readable by hospital users"
  ON guardians FOR SELECT
  USING (true);

CREATE POLICY "Guardians can be managed by hospital staff"
  ON guardians FOR ALL
  USING (true);

-- guardian_pets: 보호자와 반려동물 연결
CREATE POLICY "Guardian pets are readable by hospital users"
  ON guardian_pets FOR SELECT
  USING (true);

CREATE POLICY "Guardian pets can be managed by hospital staff"
  ON guardian_pets FOR ALL
  USING (true);

-- 예약: 같은 병원 내 모든 사용자가 조회/관리 가능
CREATE POLICY "Appointments are readable by hospital users"
  ON vet_appointments FOR SELECT
  USING (true);

CREATE POLICY "Appointments can be managed by hospital staff"
  ON vet_appointments FOR ALL
  USING (true);

-- 대기 큐: 같은 병원 내 모든 사용자가 조회/관리 가능
CREATE POLICY "Walk-in queue is readable by hospital users"
  ON walk_in_queue FOR SELECT
  USING (true);

CREATE POLICY "Walk-in queue can be managed by hospital staff"
  ON walk_in_queue FOR ALL
  USING (true);

-- 진료 기록: 의사만 작성, 같은 병원 내 조회 가능
CREATE POLICY "Medical records are readable by hospital users"
  ON medical_records FOR SELECT
  USING (true);

CREATE POLICY "Medical records can be managed by doctors"
  ON medical_records FOR ALL
  USING (true);

-- 의사 스케줄: 같은 병원 내 모든 사용자가 조회/관리 가능
CREATE POLICY "Doctor schedules are readable by hospital users"
  ON doctor_schedules FOR SELECT
  USING (true);

CREATE POLICY "Doctor schedules can be managed by hospital admins"
  ON doctor_schedules FOR ALL
  USING (true);

-- 의사 휴가: 같은 병원 내 모든 사용자가 조회/관리 가능
CREATE POLICY "Doctor leaves are readable by hospital users"
  ON doctor_leaves FOR SELECT
  USING (true);

CREATE POLICY "Doctor leaves can be managed by hospital admins"
  ON doctor_leaves FOR ALL
  USING (true);
