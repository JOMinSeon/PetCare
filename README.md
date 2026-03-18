# 🐾 펫헬스 (PetHealth)

AI 기반 반려동물 건강 관리 웹 앱입니다.

## 주요 기능

- **건강 기록 & 체중 추적** — 체중 변화 차트, RER/MER 자동 계산
- **AI 사료 분석** — 사료 사진을 찍으면 Gemini AI가 즉시 분석
- **AI 채팅 상담** — 반려동물 건강 관련 실시간 AI 상담
- **예방접종 & 일정 캘린더** — 접종·구충제·미용·병원 일정 통합 관리
- **보호자 커뮤니티** — 피드 & 수의사 Q&A
- **Google / 이메일 인증** — Supabase Auth 기반

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase |
| AI | Gemini 2.0 Flash (via AI SDK) |
| Charts | Recharts |
| Icons | Lucide React |
| Deploy | Vercel |

## 시작하기

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 아래 값을 채워주세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Supabase 테이블 설정

Supabase 대시보드 SQL Editor에서 아래 테이블을 생성해주세요:

```sql
-- 반려동물
create table pets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  species text not null,
  age integer,
  weight numeric,
  neutered boolean default false,
  created_at timestamptz default now()
);
alter table pets enable row level security;
create policy "Users manage own pets" on pets for all using (auth.uid() = user_id);

-- 건강 기록
create table health_logs (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references pets(id) on delete cascade not null,
  weight numeric not null,
  rer numeric not null,
  mer numeric not null,
  recorded_at timestamptz default now()
);
alter table health_logs enable row level security;
create policy "Users manage own logs" on health_logs for all
  using (exists (select 1 from pets where pets.id = health_logs.pet_id and pets.user_id = auth.uid()));
```

### 3. 패키지 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 됩니다.

## 프로젝트 구조

```
app/
├── actions/          # Server Actions (pet, health)
├── api/              # API Routes (chat, analyze-food)
├── auth/             # 로그인 / 회원가입
├── calendar/         # 일정 캘린더
├── community/        # 커뮤니티
├── pets/             # 반려동물 목록 & 상세
└── settings/         # 설정

components/
├── FoodAnalyzer      # AI 사료 분석
├── GeminiAdvicePanel # AI 상담 패널
├── HealthChart       # 체중 추이 차트
├── HealthDonut       # 건강 도넛 차트
├── PetCard           # 반려동물 카드
├── PetDetailTabs     # 상세 탭 네비게이션
└── VaccinationStepper # 예방접종 스텝퍼

lib/
├── supabase.ts         # 기본 클라이언트
├── supabase-browser.ts # 클라이언트 컴포넌트용
└── supabase-server.ts  # 서버 컴포넌트용
```

## 남은 작업

[TODO.md](./TODO.md) 참고
