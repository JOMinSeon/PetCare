# Phase 1: 증상 체크리스트 (Self-Diagnosis)

## Context
 PetCare는 AI 기반 반려동물 건강 관리 서비스입니다. 사용자가 반려동물(강아지/고양이)의 증상을 체계적으로 입력하고 가능한 질병을 확인하며, 필요시 AI 상담으로 연결하는 기능을 구현합니다.

## Goal
 증상 체크리스트 페이지를 구현하여 사용자가 강아지/고양이의 증상을 빠르고 정확하게 입력하고, 가능한 질병 리스트와 응급도를 확인하며, AI 상담으로 원활하게 연결할 수 있게 합니다.

---

## Specifications

### 1. 페이지 경로
 - `/symptom-checker` - 증상 체크리스트 메인 페이지

### 2. 대상 동물
 - 강아지 / 고양이 (선택制)
 - 선택 후 해당 동물에 맞는 증상 표시

### 3. 증상 입력 방식 (둘 다 지원)
 - **사전 정의된 증상**: 버튼/체크박스形式
 - **텍스트 직접 입력**: "증상을 입력하세요..." 필드

### 4. 카테고리 (5개 모두)
 - 소화기 (구토, 설사, 식욕부진, 복부팽만, 변血)
 - 피부 (가려움,脱毛, 피부 발적, 종괴, 핥기)
 - 호흡기 (기침, 재채기, 호흡 곤란, 콧물, 천명음)
 - 눈/귀 (눈 분비물, 눈充血, 귀 냄새, 귀 분비물, 눈을 짜름)
 - 행동변화 (무기력, 공격성, 숨 inúmer, 불안, 이상行動)

### 5. 자주 묻는 증상 미리보기
 - 각 카테고리 상단에 주요 증상 3-4개 핫버튼
 - 한 번의 탭으로 증상 선택 가능

### 6. 디자인 스타일
 - 랜딩페이지와 동일 (오렌지/화이트 컬러 스키마)
 - 모던 카드형 레이아웃
 - 탭 기반 카테고리 전환

### 7. 진단 결과 표시
 - 가능성 높은 질병 리스트 (확률순 정렬)
 - 응급도 표시:
   - 🔴 즉시 동물병원 방문 권장
   - 🟡 주의 필요, 관찰 후獣医 상담
   - 🟢-home care 가능, 증상 지속 시 상담
 - 권장 조치 (체크리스트based)
 - AI 상담 연결 버튼

### 8. AI 상담 연결 (모달 팝업)
 - "AI 상담하기" 버튼 클릭 → 모달 팝업
 - 모달 내에서 AI 상담 페이지 로드 또는 연결
 - 증상 컨텍스트를 AI 상담에 전달

---

## Technical Approach

### Frontend
 - Next.js App Router (`app/symptom-checker/page.tsx`)
 - 'use client' 컴포넌트
 - CSS: Tailwind CSS (랜딩페이지와 동일)
 - 상태 관리: React useState/useReducer

### Backend
 - 기존 AI 상담 API (`/api/chat`) 활용
 - 증상 기반 필터링 로직 (서버 사이드)
 - Supabase 프로필 연동 (선택사항)

### 파일 구조
```
app/(main)/symptom-checker/
  page.tsx          # 메인 페이지 (탭 + 카테고리 + 결과)
  components/
    SymptomCategory.tsx
    FrequentSymptoms.tsx
    DiagnosisResult.tsx
    AIConsultModal.tsx
  lib/
    symptoms-data.ts   # 증상/질병 매핑 데이터
```

### 증상-질병 매핑 데이터 구조
```typescript
interface Symptom {
  id: string;
  name: string;
  category: 'digestive' | 'skin' | 'respiratory' | 'eyes_ears' | 'behavior';
  animal: 'dog' | 'cat' | 'both';
}

interface Disease {
  id: string;
  name: string;
  symptoms: string[];  // 관련 증상 ID 배열
  urgency: 'critical' | 'moderate' | 'mild';
  description: string;
  recommendation: string;
}
```

---

## Implementation Order

### Step 1: 뼈대 구축
- [ ] `/symptom-checker` 페이지 생성
- [ ] 동물 선택 UI (강아지/고양이)
- [ ] 카테고리 탭 구조

### Step 2: 증상 데이터
- [ ] 증상 데이터 파일 작성 (5개 카테고리)
- [ ] 자주 묻는 증상 핫버튼
- [ ] 증상 체크박스/버튼 UI

### Step 3: 진단 결과
- [ ] 증상→질병 매칭 로직
- [ ] 결과 표시 UI (질병 리스트, 응급도)
- [ ] 확률 계산 (선택한 증상 기반)

### Step 4: AI 상담 연동
- [ ] AI 상담 모달 UI
- [ ] 증상 컨텍스트 전달
- [ ] 모달 열기/닫기 로직

### Step 5: 통합 테스트
- [ ] 전체 플로우 테스트
- [ ] 모바일 반응형 테스트
- [ ] AI 상담 연결 테스트

---

## Verification Criteria

### Done Checklist
- [ ] 강아지/고양이 선택 가능
- [ ] 5개 카테고리 모두 표시
- [ ] 사전 정의 증상 선택 가능 (체크박스)
- [ ] 텍스트 직접 입력 가능
- [ ] 자주 묻는 증상 미리보기 표시
- [ ] 진단 결과 (질병 리스트 + 응급도) 표시
- [ ] AI 상담 모달 열림
- [ ] 모달에서 AI 상담 연결
- [ ] 랜딩페이지와 일관된 디자인
- [ ] 모바일 반응형 동작

### Success Metrics
- 페이지 로드 3초 이내
- 증상 선택 → 결과 표시 2초 이내
- AI 상담 연결 성공률 100%