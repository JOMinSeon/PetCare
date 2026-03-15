# 미구현 항목 (TODO)

## 1. 프론트엔드

### 1-1. 홈 페이지 (`app/page.tsx`)
- 현재 기본 Next.js 템플릿 그대로
- 로그인 여부에 따라 대시보드 또는 랜딩 페이지로 리다이렉트 처리 필요

### 1-2. 반려동물 목록 페이지 (`app/pets/page.tsx`)
- 등록된 반려동물 카드 목록 표시
- 반려동물 추가 버튼 → 등록 폼으로 이동

### 1-3. 반려동물 등록/수정 페이지 (`app/pets/new/page.tsx`, `app/pets/[id]/edit/page.tsx`)
- 이름, 종(개/고양이), 나이, 체중, 중성화 여부 입력 폼
- Server Action으로 Supabase `pets` 테이블에 저장

### 1-4. 사료 사진 분석 UI (`components/FoodAnalyzer.tsx`)
- 이미지 파일 업로드 input
- `/api/analyze-food`로 FormData 전송
- 분석 결과 텍스트 렌더링
- `/pets/[id]` 상세 페이지에 탭 또는 섹션으로 통합

### 1-5. 체중 변화 차트 (`components/HealthChart.tsx`)
- `recharts` 설치는 완료, 컴포넌트 미작성
- `health_logs` 데이터를 날짜별 꺾은선 그래프로 시각화
- RER/MER 목표 칼로리 기준선 표시
- `/pets/[id]` 상세 페이지에 통합

### 1-6. 공통 레이아웃 및 네비게이션
- 상단 네비게이션 바 (홈, 내 반려동물, 로그아웃)
- `app/layout.tsx` 타이틀/메타 정보 수정 (현재 "Create Next App" 그대로)

---

## 2. 백엔드

### 2-1. 반려동물 CRUD Server Actions (`app/actions/pet.ts`)
- `createPet(formData)` — 반려동물 등록
- `updatePet(formData)` — 반려동물 정보 수정
- `deletePet(petId)` — 반려동물 삭제

### 2-2. 인증 (`app/auth/`)
- Supabase Auth 기반 이메일/소셜 로그인
- `app/auth/login/page.tsx` — 로그인 페이지
- `app/auth/signup/page.tsx` — 회원가입 페이지
- `middleware.ts` — 비로그인 사용자 `/auth/login`으로 리다이렉트

### 2-3. RLS(Row Level Security) 적용
- 현재 Server Action이 `petId`를 클라이언트에서 받아 처리
- 로그인한 사용자 본인의 데이터만 읽기/쓰기 가능하도록 Supabase RLS 정책 적용 필요

---

## 3. 인프라/DB

### 3-1. Supabase 테이블 스키마

```sql
-- 반려동물 테이블
create table pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  species text not null,       -- 'dog' | 'cat'
  age numeric not null,
  weight numeric not null,
  neutered boolean default false,
  activity_factor numeric default 1.6,  -- MER 계산용
  created_at timestamptz default now()
);

-- 건강 기록 테이블
create table health_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets on delete cascade not null,
  weight numeric not null,
  rer numeric not null,
  mer numeric not null,
  recorded_at timestamptz default now()
);

-- RLS 활성화
alter table pets enable row level security;
alter table health_logs enable row level security;

-- RLS 정책
create policy "본인 반려동물만 접근" on pets
  for all using (auth.uid() = user_id);

create policy "본인 반려동물 건강기록만 접근" on health_logs
  for all using (
    pet_id in (select id from pets where user_id = auth.uid())
  );
```

### 3-2. 환경변수 설정 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
GEMINI_API_KEY=<Google AI Studio API Key>
```

### 3-3. Vercel 배포 설정
- Vercel 프로젝트에 위 환경변수 등록
- `next.config.ts` `experimental` 옵션 정리 (현재 빈 객체)

---

## 구현 우선순위

| 순서 | 항목 | 이유 |
|------|------|------|
| 1 | DB 스키마 생성 (3-1) | 모든 기능의 기반 |
| 2 | 환경변수 설정 (3-2) | 로컬 실행을 위해 필수 |
| 3 | 인증 구현 (2-2) | 사용자 식별 없이 RLS 불가 |
| 4 | 반려동물 목록/등록 페이지 (1-2, 1-3) | 데이터 없으면 상세 페이지 진입 불가 |
| 5 | 체중 차트 (1-5) | 핵심 가치 기능 |
| 6 | 사료 분석 UI (1-4) | AI 핵심 기능 |
| 7 | 홈/네비게이션 (1-1, 1-6) | UX 마무리 |
| 8 | Vercel 배포 (3-3) | 서비스 오픈 |
