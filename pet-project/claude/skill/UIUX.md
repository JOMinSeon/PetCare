# UI/UX 디자인 가이드 — 반려동물 헬스케어 앱 (2026)

> Next.js 16 + Tailwind CSS v4 + shadcn/ui 기반 최신 디자인 시스템

---

## 1. 디자인 철학

| 원칙 | 설명 |
|------|------|
| **Calm Technology** | 알림과 정보는 필요할 때만, 주변적으로 존재 |
| **One-handed First** | 모바일 한 손 조작 최우선 (핵심 CTA는 화면 하단) |
| **Data as Story** | 숫자 나열 대신 반려동물의 건강 '이야기'로 시각화 |
| **Trust by Default** | AI 조언에 항상 수의사 확인 권고 문구 노출 |

---

## 2. 디자인 토큰 (Design Tokens)

### 2-1. 컬러 팔레트

```css
/* tailwind.config.ts 또는 CSS 변수 */
:root {
  /* Primary — 따뜻한 Sage Green (신뢰 + 건강) */
  --color-primary-50:  #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-400: #4ade80;
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;

  /* Accent — Warm Amber (알림, 칼로리 기준선) */
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;

  /* Semantic */
  --color-danger:  #ef4444;   /* 이상 징후 */
  --color-warning: #f97316;   /* 주의 */
  --color-info:    #3b82f6;   /* AI 응답 버블 */

  /* Neutral (Gray-Zinc 계열) */
  --color-bg:      #fafafa;
  --color-surface: #ffffff;
  --color-border:  #e4e4e7;
  --color-text-primary:   #18181b;
  --color-text-secondary: #71717a;
  --color-text-muted:     #a1a1aa;
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:      #09090b;
    --color-surface: #18181b;
    --color-border:  #27272a;
    --color-text-primary:   #fafafa;
    --color-text-secondary: #a1a1aa;
  }
}
```

### 2-2. 타이포그래피

```css
/* Geist Sans (Next.js 기본) + Geist Mono (수치 데이터) */
--font-sans: 'Geist', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;

/* Scale */
--text-xs:   0.75rem;   /* 12px — 레이블, 캡션 */
--text-sm:   0.875rem;  /* 14px — 본문, 카드 설명 */
--text-base: 1rem;      /* 16px — 기본 본문 */
--text-lg:   1.125rem;  /* 18px — 섹션 제목 */
--text-xl:   1.25rem;   /* 20px — 페이지 제목 */
--text-2xl:  1.5rem;    /* 24px — 히어로 수치 */
--text-3xl:  1.875rem;  /* 30px — 랜딩 헤드라인 */
```

### 2-3. 간격 & 반지름

```css
/* Spacing (8px 기반 그리드) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */

/* Border Radius */
--radius-sm:  0.375rem;  /* 6px  — 버튼, 입력 */
--radius-md:  0.75rem;   /* 12px — 카드 */
--radius-lg:  1rem;      /* 16px — 패널 */
--radius-xl:  1.5rem;    /* 24px — 바텀 시트 */
--radius-full: 9999px;   /* 아바타, 배지 */
```

---

## 3. 컴포넌트 시스템

### 3-1. 반려동물 카드 (`PetCard`)

```
┌─────────────────────────────────┐
│ 🐕  [아바타 64px]               │
│     **몽이**  · 말티즈 · 3세    │
│     ─────────────────────       │
│     체중  4.2 kg   ↑ 0.1 kg    │
│     칼로리 목표  320 kcal/일    │
│                                 │
│  [건강 기록]    [AI 상담]       │
└─────────────────────────────────┘
```

**구현 포인트**
- 아바타: `next/image` + `object-cover`, 원형 마스크
- 체중 델타: 양수 → `text-red-500 ↑`, 음수 → `text-green-500 ↓` (과체중 주의)
- 카드 hover: `shadow-md` + `scale-[1.01]` (transition 150ms)
- 스켈레톤: `animate-pulse` bg-zinc-100 placeholder

### 3-2. 건강 대시보드 차트 (`HealthChart`)

```
  체중 변화 (최근 30일)
  ┌──────────────────────────────┐
  │ 4.5 ──────────────────────   │
  │     ╲                        │
  │ 4.2  ╲──────╮               │
  │            ╰──── MER 기준   │
  │ 4.0 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │ ← 점선
  └──────────────────────────────┘
       1일  7일  14일  21일  30일
```

**Recharts 설정**
```tsx
<LineChart data={healthLogs}>
  <Line
    type="monotone"
    dataKey="weight"
    stroke="var(--color-primary-500)"
    strokeWidth={2}
    dot={{ r: 4, fill: 'var(--color-primary-500)' }}
    activeDot={{ r: 6 }}
  />
  {/* MER 칼로리 기준선 */}
  <ReferenceLine
    y={targetWeight}
    stroke="var(--color-accent-500)"
    strokeDasharray="4 4"
    label={{ value: '이상 체중', position: 'right', fontSize: 12 }}
  />
  <Tooltip
    content={<CustomTooltip />}  /* 날짜 + 체중 + RER/MER 수치 */
  />
</LineChart>
```

### 3-3. AI 채팅 패널 (`GeminiAdvicePanel`)

```
┌─────────────────────────────────────┐
│ ✨ AI 건강 상담                     │
│ ─────────────────────────────────   │
│                                     │
│  [AI]  몽이의 현재 체중은 4.2kg으로  │
│        권장 범위 내에 있어요. RER   │
│        기준 하루 220kcal가 필요합니다│
│        ···                          │
│                                     │
│                    [나]  요즘 사료를 │
│                          자주 남겨요 │
│                                     │
│  ─────────────────────────────────  │
│  [📷 사진 첨부]  질문을 입력하세요   [▶] │
└─────────────────────────────────────┘
```

**UX 규칙**
- AI 버블: `bg-blue-50 dark:bg-blue-950` rounded-tl-none
- 사용자 버블: `bg-primary-100 dark:bg-primary-900` rounded-tr-none
- 스트리밍 중 타이핑 인디케이터: `●●●` CSS animation
- 항상 하단에 고정: `⚠️ AI 답변은 참고용이며 수의사 상담을 권장합니다`

### 3-4. 사료 분석 UI (`FoodAnalyzer`)

```
┌─────────────────────────────────┐
│        사료 성분 분석            │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   [사진을 드래그하거나     │  │
│  │    탭하여 업로드]          │  │
│  │         📷                │  │
│  └───────────────────────────┘  │
│                                 │
│  [분석하기 →]                   │
│                                 │
│  ── 분석 결과 ──────────────    │
│  ✅ 단백질 적합  ⚠️ 나트륨 과다  │
│  칼로리 밀도: 3.8 kcal/g        │
└─────────────────────────────────┘
```

---

## 4. 페이지별 레이아웃

### 4-1. 랜딩 페이지 (`/`)

```
[네비게이션] 로고 | 로그인 버튼
─────────────────────────────────
[히어로 섹션]
  "우리 아이 건강,
   AI가 함께 지켜드려요"

  [무료로 시작하기]  [데모 보기]

  ↓ 반려동물 카드 애니메이션 (Framer Motion)

[기능 섹션 3열]
  🧪 AI 사료 분석  📊 체중 트래킹  💬 24/7 상담

[CTA 섹션]
  "지금 바로 등록하세요"  [시작하기]
─────────────────────────────────
[푸터]
```

**애니메이션**: `@/lib/animations.ts`에 Framer Motion variant 정의
```ts
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
```

### 4-2. 대시보드 (`/pets`)

**모바일 레이아웃 (기본)**
```
[상단 앱바]  안녕하세요, OO님  [🔔]
──────────────────────────────────
[가로 스크롤 카드 열]
  ← [PetCard] [PetCard] [+ 추가] →

[오늘의 건강 요약]
  전체 반려동물 체중 변화 요약

[하단 탭 내비게이션]
  🏠홈  🐾내반려동물  💬상담  👤프로필
```

**데스크톱 레이아웃**
```
[사이드바 240px]    [메인 콘텐츠]
  로고              반려동물 카드 그리드 (2-3열)
  ─────────         체중 차트 (전체 너비)
  🏠 홈             AI 상담 패널 (우측 고정)
  🐾 내 반려동물
  💬 AI 상담
  ─────────
  👤 프로필
  🚪 로그아웃
```

### 4-3. 반려동물 상세 (`/pets/[id]`)

```
[← 뒤로]  몽이의 건강 대시보드  [수정]
──────────────────────────────────
[탭 네비게이션]
  건강기록 | 사료분석 | AI상담

[탭: 건강기록]
  ┌ 핵심 수치 카드 (2열) ─────┐
  │ 현재 체중     RER/MER     │
  │ 4.2 kg     220 / 352 kcal│
  └──────────────────────────┘

  [체중 변화 차트 - HealthChart]

  [건강 기록 추가] 버튼 → 바텀 시트
```

---

## 5. 인터랙션 패턴

### 5-1. 반려동물 등록 플로우 (멀티 스텝)

```
Step 1/4         Step 2/4         Step 3/4         Step 4/4
─────────        ─────────        ─────────        ─────────
이름 & 종        나이 & 체중      중성화 여부        사진 업로드
[다음 →]         [다음 →]        [다음 →]          [완료 ✓]
```

- 상단 progress bar: `w-[25%] → w-[50%] → w-[75%] → w-[100%]`
- 각 스텝 전환: `translate-x` slide animation

### 5-2. 건강 기록 추가 (바텀 시트)

```tsx
// shadcn/ui Drawer 컴포넌트 활용
<Drawer>
  <DrawerTrigger asChild>
    <Button>건강 기록 추가</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>오늘의 건강 기록</DrawerHeader>
    <form action={saveHealthLog}>
      <Input name="weight" type="number" step="0.1" placeholder="체중 (kg)" />
      <Button type="submit">저장</Button>
    </form>
  </DrawerContent>
</Drawer>
```

### 5-3. 로딩 상태

| 상황 | 패턴 |
|------|------|
| 페이지 초기 로드 | Skeleton UI (pulse animation) |
| 차트 데이터 | Suspense + 스켈레톤 차트 |
| AI 응답 스트리밍 | 타이핑 인디케이터 `●●●` |
| 사료 분석 | 전체 오버레이 + 프로그레스 링 |
| Server Action 제출 | 버튼 disabled + spinner |

---

## 6. 접근성 (A11y)

```tsx
// 색상만으로 상태 구분 금지 → 아이콘 + 텍스트 병행
<Badge variant="warning">
  <AlertTriangle size={12} aria-hidden />
  <span>나트륨 과다</span>
</Badge>

// 포커스 링 항상 표시 (키보드 사용자)
// tailwind.config: ring-offset 설정
className="focus-visible:ring-2 focus-visible:ring-primary-500"

// 차트 대체 텍스트
<HealthChart aria-label={`${pet.name}의 최근 30일 체중 변화 차트`} />

// 동적 콘텐츠 알림
<div aria-live="polite" aria-atomic="true">
  {isLoading ? 'AI 분석 중...' : null}
</div>
```

---

## 7. 모바일 최적화

### 터치 타겟
- 최소 터치 영역: **44 × 44px** (Apple HIG 기준)
- 하단 탭 아이콘: `h-12 w-12` + 라벨 포함

### Safe Area 대응
```css
/* 노치/홈 인디케이터 영역 침범 방지 */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 스와이프 제스처
- 반려동물 카드 가로 스크롤: `overflow-x-auto scroll-snap-x mandatory`
- 채팅 버블 좌우 스와이프: `@use-gesture/react` 활용

---

## 8. 다크 모드

Tailwind `class` 전략 + `next-themes` 사용

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**다크 모드 색상 검증 체크리스트**
- [ ] 차트 선 색상 (`stroke`) 다크 배경 대비 4.5:1 이상
- [ ] AI 버블 텍스트 가독성
- [ ] 사료 분석 결과 배지 (✅/⚠️) 명도 대비 충족

---

## 9. 구현 우선순위 (UI 관점)

| 순서 | 컴포넌트/페이지 | 비고 |
|------|---------------|------|
| 1 | 공통 레이아웃 + 네비게이션 | 모든 페이지의 기반 |
| 2 | 로그인/회원가입 페이지 | Supabase Auth UI 활용 가능 |
| 3 | 반려동물 목록 (`PetCard`) | 핵심 진입점 |
| 4 | 반려동물 등록 멀티스텝 폼 | 데이터 생성 경로 |
| 5 | `HealthChart` 컴포넌트 | 핵심 가치 시각화 |
| 6 | `GeminiAdvicePanel` 채팅 | AI 차별화 기능 |
| 7 | `FoodAnalyzer` 업로더 | 멀티모달 AI 기능 |
| 8 | 랜딩 페이지 | 마케팅 마무리 |

---

## 10. 추천 패키지

```bash
pnpm add \
  next-themes \                    # 다크 모드
  framer-motion \                  # 페이지 전환 애니메이션
  @radix-ui/react-dialog \         # 바텀 시트 기반
  lucide-react \                   # 아이콘
  class-variance-authority \       # 컴포넌트 variant 관리
  clsx tailwind-merge \            # className 유틸
  @use-gesture/react               # 스와이프 제스처
```

> shadcn/ui는 위 패키지들을 내부적으로 활용하므로 `npx shadcn@latest init`으로 초기화 권장
