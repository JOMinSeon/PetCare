# 펫헬스 TODO

## 우선순위 높음

### 1. 캘린더 - DB 연동 ✅
- [x] Supabase `schedule_events` 테이블 생성 → `supabase/migration.sql`
- [x] `MOCK_EVENTS` → DB 데이터로 교체
- [x] 일정 추가 시 DB에 저장
- [x] 일정 완료 토글 DB 반영
- [x] 새로고침 후에도 데이터 유지

### 2. 커뮤니티 - DB 연동 ✅
- [x] Supabase `posts`, `post_likes`, `qa_items` 테이블 생성 → `supabase/migration.sql`
- [x] `MOCK_POSTS`, `MOCK_QA` → DB 데이터로 교체
- [x] "글쓰기" 버튼 → 글 작성 모달 구현
- [x] 좋아요 토글 DB 반영 (새로고침 후 유지)
- [x] Q&A 질문 작성 기능

> ⚠️ **Supabase 설정 필요**: `supabase/migration.sql`을 Supabase 대시보드 SQL Editor에서 실행해주세요.

## 우선순위 중간

### 3. 설정 페이지 - 실제 저장 기능 ✅
- [x] 닉네임 변경 → Supabase `profiles` 테이블에 실제 저장
- [x] 알림 설정 DB 저장
- [x] 구독 플랜 선택 기능 구현
- [x] 실제 로그인된 유저 이메일/닉네임 표시

## 우선순위 낮음

### 4. 로그인/회원가입 디자인 통일 ✅
- [x] `bg-gray-50`, `text-blue-500` 등 Tailwind 기본 색상 → `var(--color-*)` CSS 변수로 교체
- [x] 로그인/회원가입 페이지 디자인을 나머지 페이지와 통일
