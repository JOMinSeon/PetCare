# VetClinic Manager — 동물병원 실시간 예약 대시보드 기획서

> 작성일: 2026-03-27
> 버전: v1.0
> 대상: 중규모 동물병원 (의사 3-5명, 직원 5-10명)

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [사용자 역할 및 권한](#2-사용자-역할-및-권한)
3. [핵심 기능 명세](#3-핵심-기능-명세)
4. [화면 구성 및 UI/UX 흐름](#4-화면-구성-및-uiux-흐름)
5. [기술 스택](#5-기술-스택)
6. [데이터 모델 설계](#6-데이터-모델-설계)
7. [API 설계](#7-api-설계)
8. [실시간 이벤트 설계](#8-실시간-이벤트-설계)
9. [구현 로드맵](#9-구현-로드맵)
10. [보안 및 성능 고려사항](#10-보안-및-성능-고려사항)

---

## 1. 프로젝트 개요

### 1.1 서비스 정의

**VetClinic Manager**는 동물병원의 예약, 진료, 환자 관리를 통합하는 실시간 웹 기반 대시보드 시스템입니다.

### 1.2 핵심 문제 및 해결 방향

| 문제 | 해결 방향 |
|------|-----------|
| 전화 예약으로 인한 업무 과부하 | 온라인 예약 + 자동 확인 알림 |
| 진료 현황 파악 어려움 | 실시간 대시보드로 한눈에 현황 파악 |
| 예약 중복/누락 발생 | 실시간 동기화로 충돌 방지 |
| 보호자 대기 불만 | 대기 순번 실시간 안내 |
| 환자 이력 관리 비효율 | 통합 EMR 연동 |

### 1.3 서비스 목표

- 예약 처리 시간 **50% 단축**
- 노쇼(No-show) 율 **30% 감소** (자동 리마인드)
- 직원 업무 만족도 **향상**
- 보호자 대기 경험 **개선**

---

## 2. 사용자 역할 및 권한

### 2.1 역할 정의

```
원장 (Admin)
├── 전체 시스템 관리
├── 의사/직원 계정 관리
├── 매출/통계 대시보드
├── 시스템 설정 변경
└── 모든 예약/기록 열람 및 수정

수의사 (Doctor)
├── 본인 스케줄 관리
├── 담당 환자 진료 기록 작성
├── 예약 확인 및 상태 변경
└── 처방전 발행

직원/리셉션 (Staff)
├── 예약 생성/수정/취소
├── 환자 및 보호자 정보 등록
├── 당일 대기 큐 관리
└── 기본 통계 열람

보호자 (Guardian)
├── 본인 반려동물 예약 생성/취소
├── 예약 현황 및 대기 순번 확인
├── 진료 기록 열람 (처방전, 검사 결과)
└── 알림 수신 설정
```

### 2.2 권한 매트릭스

| 기능 | 원장 | 수의사 | 직원 | 보호자 |
|------|:----:|:------:|:----:|:------:|
| 전체 예약 열람 | ✅ | ✅ | ✅ | ❌ |
| 예약 생성 | ✅ | ✅ | ✅ | ✅(본인) |
| 예약 취소 | ✅ | ✅ | ✅ | ✅(본인) |
| 진료 기록 작성 | ✅ | ✅ | ❌ | ❌ |
| 진료 기록 열람 | ✅ | ✅(담당) | ❌ | ✅(본인) |
| 직원 관리 | ✅ | ❌ | ❌ | ❌ |
| 매출 통계 | ✅ | ❌ | ❌ | ❌ |
| 스케줄 설정 | ✅ | ✅(본인) | ❌ | ❌ |

---

## 3. 핵심 기능 명세

### 3.1 실시간 예약 대시보드 (P0 - 최우선)

**메인 대시보드 구성**
- 오늘의 예약 타임라인 (의사별/진료실별 분리 뷰)
- 현재 대기 중인 환자 큐 (순번 표시)
- 진행 중 진료 현황
- 완료된 진료 수 / 남은 예약 수 요약 카드
- 실시간 업데이트 (WebSocket 기반, 새로고침 불필요)

**예약 상태 흐름**
```
예약확정 → 내원확인 → 대기중 → 진료중 → 완료
                              ↓
                           취소/노쇼
```

### 3.2 예약 관리 (P0)

**지정 시간 예약**
- 의사별 가용 슬롯 자동 계산 (15분/30분/1시간 단위 설정)
- 중복 예약 실시간 방지
- 예약 시 보호자에게 SMS/카카오 알림 자동 발송

**당일 대기 큐**
- 워크인(walk-in) 환자 즉시 등록
- 예약 환자와 대기 환자 통합 관리
- 순번 변경 드래그&드롭 지원

**예약 반복 설정**
- 추적 진료를 위한 반복 예약 (주간/격주/월간)
- 반복 예약 일괄 수정/취소 지원

### 3.3 환자(반려동물) 및 보호자 관리 (P0)

**보호자 프로필**
- 기본 정보 (이름, 연락처, 주소, 이메일)
- 보유 반려동물 목록
- 방문 이력 및 누적 진료비

**반려동물 프로필**
- 기본 정보 (이름, 종, 품종, 성별, 중성화 여부, 생년월일, 체중)
- 사진 등록
- 알레르기/기저질환 메모
- 예방접종 기록 및 만료일 알림
- 진료 기록 타임라인

### 3.4 의사/진료실 스케줄 관리 (P1)

**의사 스케줄**
- 주간 근무 시간 설정
- 휴가/휴진 등록
- 진료 유형별 시간 배분 설정 (일반진료, 수술, 검진)

**진료실 관리**
- 진료실 등록 및 배정
- 장비/기기 연동 메모
- 진료실별 예약 현황 뷰

### 3.5 알림 시스템 (P1)

**자동 발송 알림**
| 시점 | 채널 | 내용 |
|------|------|------|
| 예약 완료 시 | SMS + 앱 | 예약 확인 및 안내사항 |
| 예약 1일 전 | SMS + 앱 | 내일 예약 리마인드 |
| 예약 2시간 전 | SMS | 당일 방문 리마인드 |
| 대기 순번 3번 전 | 앱 | 곧 진료 차례 알림 |
| 진료 완료 시 | 앱 | 처방전 및 다음 예약 안내 |
| 예방접종 만료 1개월 전 | SMS + 앱 | 접종 일정 안내 |

**실시간 내부 알림 (직원/의사용)**
- 새 예약 접수
- 환자 내원 확인
- 긴급 환자 등록
- 예약 취소 발생

### 3.6 통계 및 리포트 (P2)

- 일간/주간/월간 예약 현황
- 의사별 진료 건수 및 매출
- 인기 시간대 분석 (예약률 히트맵)
- 노쇼율 추이
- 신규/재방문 환자 비율
- CSV/PDF 내보내기

---

## 4. 화면 구성 및 UI/UX 흐름

### 4.1 주요 화면 목록

```
[인증]
├── 로그인
└── 비밀번호 재설정

[대시보드] (직원/의사/원장 공통)
├── 메인 대시보드 (실시간 현황)
├── 캘린더 뷰 (주간/월간)
└── 통계 대시보드 (원장 전용)

[예약 관리]
├── 예약 목록 (필터/검색)
├── 예약 상세 / 수정
├── 새 예약 생성
└── 대기 큐 관리

[환자 관리]
├── 보호자 목록 (검색)
├── 보호자 상세 (반려동물 목록 포함)
├── 반려동물 상세 (진료 기록 타임라인)
└── 신규 등록

[스케줄 관리]
├── 의사 스케줄 설정
└── 진료실 배정

[설정] (원장 전용)
├── 병원 기본 정보
├── 직원 계정 관리
├── 알림 템플릿 설정
└── 예약 슬롯 설정

[보호자 포털]
├── 내 반려동물 목록
├── 예약하기
├── 예약 현황 / 대기 순번
└── 진료 기록 열람
```

### 4.2 메인 대시보드 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  [로고] VetClinic Manager          🔔 알림  [프로필]    │
├──────────────┬──────────────────────────────────────────┤
│              │  📅 2026년 3월 27일 (금)   [오늘] [주간] │
│  [사이드바]  ├──────────────────────────────────────────┤
│              │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  📊 대시보드 │  │총예약 │ │완료  │ │대기  │ │취소  │   │
│  📅 예약관리 │  │  18  │ │  7   │ │  5   │ │  1   │   │
│  🐾 환자관리 │  └──────┘ └──────┘ └──────┘ └──────┘   │
│  👨‍⚕️ 스케줄  │                                          │
│  📈 통계    │  [의사A] [의사B] [의사C] [전체]           │
│  ⚙️ 설정   │  ┌────────────────────────────────────┐   │
│              │  │ 09:00 ████████ 김멍멍 (말티즈)     │   │
│              │  │ 09:30 ▓▓▓▓▓▓▓▓ (진료중)           │   │
│              │  │ 10:00 ░░░░░░░░ 이냥냥 (예약)       │   │
│              │  │ 10:30 [비어있음]                   │   │
│              │  │ ...                                │   │
│              │  └────────────────────────────────────┘   │
│              │                                          │
│              │  대기 큐                                  │
│              │  1. 박해피 (골든리트리버) - 10분 대기     │
│              │  2. 최루루 (페르시안) - 23분 대기        │
└──────────────┴──────────────────────────────────────────┘
```

### 4.3 주요 사용자 플로우

**플로우 1: 새 예약 생성 (직원)**
```
예약 목록 → [+ 새 예약] → 보호자 검색/등록 → 반려동물 선택
→ 의사 선택 → 날짜/시간 선택 (가용 슬롯 표시) → 진료 유형 선택
→ 메모 입력 → [예약 확정] → SMS 자동 발송 → 대시보드 실시간 반영
```

**플로우 2: 당일 워크인 환자 처리 (직원)**
```
대시보드 → [워크인 등록] → 보호자 검색/신규등록 → 대기 큐 자동 추가
→ 순번 배정 → 보호자에게 순번 SMS 발송
```

**플로우 3: 진료 진행 (수의사)**
```
대시보드 → 대기 환자 클릭 → [진료 시작] → 진료 기록 작성
→ 처방전 작성 → [진료 완료] → 다음 예약 안내 → 완료 처리
```

**플로우 4: 보호자 예약 (보호자 포털)**
```
보호자 포털 로그인 → 반려동물 선택 → 날짜/의사 선택
→ 가용 시간대 선택 → 증상 메모 입력 → [예약 신청]
→ 직원 승인 후 확정 알림 수신
```

---

## 5. 기술 스택

### 5.1 전체 아키텍처

```
[클라이언트]
Next.js 14 (App Router) + TypeScript
TailwindCSS + shadcn/ui
TanStack Query (서버 상태 관리)
Zustand (클라이언트 상태)
Socket.IO Client (실시간)

[백엔드]
NestJS + TypeScript
Socket.IO Server (실시간 이벤트)
Bull Queue (작업 큐 - 알림 발송)
Passport.js (인증)

[데이터베이스]
PostgreSQL (메인 DB)
Redis (세션, 캐시, 큐)
Prisma ORM

[인프라]
Vercel (프론트엔드)
Railway / AWS ECS (백엔드)
AWS RDS (PostgreSQL)
Upstash (Redis)
Cloudinary (이미지)

[외부 서비스]
Twilio / 알리고 (SMS)
카카오 알림톡 API
```

### 5.2 기술 선택 이유

| 기술 | 선택 이유 |
|------|-----------|
| Next.js 14 | SSR/SSG 지원, App Router로 빠른 개발, Vercel 최적화 |
| NestJS | 구조화된 백엔드, DI 패턴, WebSocket 내장 지원 |
| PostgreSQL | 복잡한 쿼리 지원, 트랜잭션 안정성, JSON 지원 |
| Redis | 실시간 세션 관리, 대기 큐 구현, 캐싱 |
| Prisma | 타입 안전 ORM, 마이그레이션 관리 용이 |
| Socket.IO | 실시간 양방향 통신, 자동 재연결 |

---

## 6. 데이터 모델 설계

### 6.1 ERD 개요

```
Hospital (병원)
├── User (사용자: 직원/의사/원장)
├── Doctor (수의사 프로필)
│   └── DoctorSchedule (스케줄)
├── Room (진료실)
├── Guardian (보호자)
│   └── Pet (반려동물)
│       ├── Appointment (예약)
│       │   └── MedicalRecord (진료 기록)
│       │       └── Prescription (처방전)
│       └── Vaccination (예방접종 기록)
└── WalkInQueue (당일 대기)
```

### 6.2 주요 테이블 스키마

```sql
-- 사용자
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  role        ENUM('admin', 'doctor', 'staff', 'guardian') NOT NULL,
  phone       VARCHAR(20),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 보호자
CREATE TABLE guardians (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  email       VARCHAR(255),
  address     TEXT,
  memo        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 반려동물
CREATE TABLE pets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id     UUID NOT NULL REFERENCES guardians(id),
  name            VARCHAR(100) NOT NULL,
  species         VARCHAR(50) NOT NULL,  -- 개, 고양이, 토끼, 등
  breed           VARCHAR(100),
  gender          ENUM('male', 'female') NOT NULL,
  is_neutered     BOOLEAN DEFAULT false,
  birth_date      DATE,
  weight_kg       DECIMAL(5,2),
  photo_url       TEXT,
  allergies       TEXT,
  medical_notes   TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 예약
CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     UUID NOT NULL REFERENCES hospitals(id),
  pet_id          UUID NOT NULL REFERENCES pets(id),
  guardian_id     UUID NOT NULL REFERENCES guardians(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  room_id         UUID REFERENCES rooms(id),
  appointment_type ENUM('general', 'surgery', 'checkup', 'vaccination', 'emergency'),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_min    INTEGER DEFAULT 30,
  status          ENUM('confirmed', 'arrived', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'confirmed',
  chief_complaint TEXT,
  memo            TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 대기 큐 (당일 워크인)
CREATE TABLE walk_in_queue (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  pet_id      UUID NOT NULL REFERENCES pets(id),
  guardian_id UUID NOT NULL REFERENCES guardians(id),
  doctor_id   UUID REFERENCES doctors(id),
  queue_number INTEGER NOT NULL,
  status      ENUM('waiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'waiting',
  arrived_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 진료 기록
CREATE TABLE medical_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id),
  pet_id          UUID NOT NULL REFERENCES pets(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  chief_complaint TEXT,
  diagnosis       TEXT,
  treatment       TEXT,
  notes           TEXT,
  weight_kg       DECIMAL(5,2),
  temperature     DECIMAL(4,1),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 처방전
CREATE TABLE prescriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id),
  medication_name   VARCHAR(200) NOT NULL,
  dosage            VARCHAR(100),
  frequency         VARCHAR(100),
  duration_days     INTEGER,
  instructions      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 의사 스케줄
CREATE TABLE doctor_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES doctors(id),
  day_of_week INTEGER NOT NULL,  -- 0=일, 1=월, ..., 6=토
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  slot_min    INTEGER DEFAULT 30,  -- 예약 슬롯 단위(분)
  is_active   BOOLEAN DEFAULT true
);

-- 휴진/휴가
CREATE TABLE doctor_leaves (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES doctors(id),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  reason      VARCHAR(200),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. API 설계

### 7.1 REST API 엔드포인트

```
[인증]
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password

[예약]
GET    /api/appointments?date=&doctorId=&status=
POST   /api/appointments
GET    /api/appointments/:id
PATCH  /api/appointments/:id
DELETE /api/appointments/:id
PATCH  /api/appointments/:id/status     # 상태 변경
GET    /api/appointments/slots?doctorId=&date=   # 가용 슬롯 조회

[대기 큐]
GET    /api/queue?date=&hospitalId=
POST   /api/queue                       # 워크인 등록
PATCH  /api/queue/:id/status
PATCH  /api/queue/reorder               # 순번 변경

[보호자]
GET    /api/guardians?search=
POST   /api/guardians
GET    /api/guardians/:id
PATCH  /api/guardians/:id

[반려동물]
GET    /api/pets?guardianId=
POST   /api/pets
GET    /api/pets/:id
PATCH  /api/pets/:id
GET    /api/pets/:id/appointments
GET    /api/pets/:id/medical-records

[진료 기록]
GET    /api/medical-records/:appointmentId
POST   /api/medical-records
PATCH  /api/medical-records/:id

[처방전]
POST   /api/prescriptions
GET    /api/prescriptions/:medicalRecordId

[의사/스케줄]
GET    /api/doctors
GET    /api/doctors/:id/schedule
PUT    /api/doctors/:id/schedule
POST   /api/doctors/:id/leaves

[통계]
GET    /api/stats/daily?date=
GET    /api/stats/monthly?year=&month=
GET    /api/stats/doctors?period=

[설정]
GET    /api/settings/hospital
PATCH  /api/settings/hospital
GET    /api/settings/notification-templates
PATCH  /api/settings/notification-templates
```

### 7.2 응답 형식 표준

```typescript
// 성공 응답
{
  success: true,
  data: { ... },
  meta?: {
    total: number,
    page: number,
    limit: number
  }
}

// 에러 응답
{
  success: false,
  error: {
    code: "APPOINTMENT_CONFLICT",
    message: "해당 시간에 이미 예약이 있습니다.",
    details?: { ... }
  }
}
```

---

## 8. 실시간 이벤트 설계

### 8.1 Socket.IO 이벤트 목록

```typescript
// 서버 → 클라이언트 (emit)
'appointment:created'     // 새 예약 생성됨
'appointment:updated'     // 예약 정보/상태 변경됨
'appointment:cancelled'   // 예약 취소됨
'queue:updated'           // 대기 큐 변경됨
'queue:called'            // 순번 호출됨
'notification:new'        // 새 알림
'dashboard:refresh'       // 대시보드 강제 새로고침

// 클라이언트 → 서버 (on)
'room:join'               // 병원 룸 입장 (hospitalId)
'room:leave'              // 룸 퇴장
```

### 8.2 실시간 업데이트 흐름

```
직원이 예약 상태 변경
    ↓
REST API PATCH /appointments/:id/status
    ↓
DB 업데이트
    ↓
Socket.IO emit 'appointment:updated' → 같은 hospitalId 룸의 모든 클라이언트
    ↓
대시보드 자동 업데이트 (React 상태 갱신)
```

### 8.3 연결 관리

```typescript
// 클라이언트 연결 시 병원 룸 자동 참가
socket.on('connect', () => {
  socket.emit('room:join', { hospitalId: user.hospitalId });
});

// 자동 재연결 설정
const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 10
});
```

---

## 9. 구현 로드맵

### 9.1 개발 단계 (총 16주)

#### Phase 1 — 기반 구축 (1~3주)

- [ ] 프로젝트 초기 설정 (Next.js, NestJS, PostgreSQL, Redis)
- [ ] 인증 시스템 구현 (JWT + 역할 기반 접근 제어)
- [ ] DB 스키마 설계 및 마이그레이션
- [ ] 기본 UI 레이아웃 (사이드바, 헤더, 라우팅)
- [ ] CI/CD 파이프라인 구축

#### Phase 2 — 핵심 기능 MVP (4~8주)

- [ ] 예약 CRUD API 및 UI
- [ ] 의사/진료실 스케줄 관리
- [ ] 가용 슬롯 계산 로직
- [ ] 보호자 및 반려동물 관리
- [ ] 메인 대시보드 (정적 버전)
- [ ] 대기 큐 기본 기능

#### Phase 3 — 실시간 기능 (9~11주)

- [ ] Socket.IO 서버/클라이언트 통합
- [ ] 대시보드 실시간 업데이트
- [ ] 대기 큐 실시간 동기화
- [ ] 내부 알림 시스템

#### Phase 4 — 알림 및 보호자 포털 (12~14주)

- [ ] SMS 알림 연동 (알리고/Twilio)
- [ ] 카카오 알림톡 연동
- [ ] 자동 알림 스케줄러 (Bull Queue)
- [ ] 보호자 포털 (예약, 대기 순번, 기록 열람)

#### Phase 5 — 완성도 및 출시 (15~16주)

- [ ] 통계 대시보드
- [ ] 진료 기록 및 처방전 시스템
- [ ] 성능 최적화 및 버그 수정
- [ ] 사용자 테스트 및 피드백 반영
- [ ] 운영 환경 배포

### 9.2 개발 우선순위

```
P0 (MVP 필수)
  - 예약 생성/수정/취소
  - 실시간 대시보드 (타임라인 뷰)
  - 환자 등록 및 관리
  - 대기 큐 관리
  - 로그인/역할 기반 접근

P1 (1차 업데이트)
  - SMS/카카오 알림 자동 발송
  - 보호자 포털
  - 의사 스케줄 관리
  - 진료 기록 작성

P2 (2차 업데이트)
  - 통계 리포트
  - 예방접종 관리 및 리마인드
  - 반복 예약
  - 모바일 최적화
```

---

## 10. 보안 및 성능 고려사항

### 10.1 보안

**인증/인가**
- JWT Access Token (15분) + Refresh Token (7일) 구조
- Refresh Token은 Redis에 저장, HttpOnly 쿠키로 전달
- 역할 기반 접근 제어 (RBAC) 미들웨어 전 API에 적용
- 병원 간 데이터 격리 (hospitalId 강제 필터링)

**데이터 보안**
- 개인정보 암호화 저장 (연락처, 주소)
- HTTPS 강제 적용
- SQL Injection 방지 (Prisma ORM 사용)
- XSS 방지 (입력값 sanitize)
- Rate Limiting (API 요청 제한)
- 감사 로그 (주요 데이터 변경 이력 보관 5년)

**의료 정보 보호**
- 진료 기록 접근 로그 저장
- 권한 없는 데이터 접근 시 알림

### 10.2 성능

**프론트엔드**
- TanStack Query로 서버 상태 캐싱 (staleTime: 30초)
- 대시보드 가상화 렌더링 (대용량 예약 목록)
- 이미지 최적화 (next/image)
- 코드 스플리팅 및 Lazy Loading

**백엔드**
- Redis 캐싱 (가용 슬롯 계산 결과, 1분 TTL)
- 데이터베이스 인덱싱 (scheduled_at, status, doctor_id)
- N+1 쿼리 방지 (Prisma include 최적화)
- 페이지네이션 (기본 20개, 최대 100개)

**실시간**
- Socket.IO 룸 단위 이벤트 발송 (전체 브로드캐스트 지양)
- Redis Adapter (다중 서버 인스턴스 지원)

### 10.3 확장성

- 멀티 병원 지원 (SaaS 구조)
- 수평 확장 가능한 상태 비저장(stateless) 백엔드
- 작업 큐(Bull Queue)로 알림 발송 분리
- 데이터베이스 읽기 복제(Read Replica) 준비

---

## 부록: 용어 정의

| 용어 | 설명 |
|------|------|
| 예약 | 사전에 날짜/시간을 지정한 진료 일정 |
| 워크인 | 예약 없이 당일 방문한 환자 |
| 대기 큐 | 당일 방문 환자의 진료 대기 순번 목록 |
| 슬롯 | 예약 가능한 시간 단위 (기본 30분) |
| 노쇼 | 예약 후 나타나지 않은 경우 |
| EMR | Electronic Medical Record (전자 진료 기록) |
| 보호자 | 반려동물의 주인/보호 책임자 |

---

*본 기획서는 VetClinic Manager 초기 버전 기준이며, 개발 진행에 따라 업데이트될 수 있습니다.*
