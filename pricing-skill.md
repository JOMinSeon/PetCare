# Pricing & Subscribe Page 개선 계획

## 현재 구조

- `app/(main)/pricing/PricingClient.tsx` — 플랜 선택 + `BillingToggle` (이미 구현됨)
- `app/(main)/subscribe/page.tsx` — 실제 결제 폼 (PortOne `requestIssueBillingKey` 호출)
- `lib/plans.ts` — 플랜 데이터, 가격 유틸리티

---

## 추가할 기능 5가지

### 1. 결제 주기 선택 (월간/연간) — 이미 부분 구현됨

**현황:** `PricingClient`에서 `BillingToggle`로 토글 구현, `/subscribe?cycle=yearly` 쿼리로 전달됨.
**개선 필요:**
- `subscribe/page.tsx` 내부에도 주기 변경 토글 추가 (플랜 요약 카드 위)
- 연간 선택 시 "2개월 무료" 배지 이미 표시됨 — 연간 할인 절약 금액(`월정가 × 12 - 연간가`)도 함께 표시

**구현 위치:** `subscribe/page.tsx` — 선택 플랜 요약 섹션 상단

---

### 2. 쿠폰/프로모션 코드 입력

**구현 위치:** `subscribe/page.tsx` — 고객 정보 섹션 아래

**UI:**
```
[ 쿠폰 코드 입력 ]  [적용]
✓ "LAUNCH2024" 적용됨 — 3,000원 할인
```

**State 추가:**
```ts
const [couponCode, setCouponCode] = useState('');
const [couponDiscount, setCouponDiscount] = useState(0);
const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
```

**API 필요:** `POST /api/coupon/validate` — `{ code, planId, billingCycle }` → `{ discount: number, type: 'fixed' | 'percent' }`
결제 시 `billingKey` 요청 body에 `couponCode` 포함하여 서버에서 실제 할인 적용.

---

### 3. 카드 정보 입력 폼 (카드번호, 소유자 이름, 유효기간, CVC)

**현황:** KG이니시스 팝업(`requestIssueBillingKey`)이 카드 정보를 처리함 — 별도 입력 폼 불필요.
**선택지:**
- **A (현행 유지):** KG이니시스 팝업이 카드 입력을 담당 → 별도 폼 없음 (권장)
- **B (UI 개선):** 결제 버튼 위에 "등록할 카드 정보는 KG이니시스 보안 팝업에서 입력합니다" 안내 문구 추가

> **결론:** PCI-DSS 준수를 위해 카드번호를 직접 받지 않고 PG사 팝업을 그대로 활용하는 것이 맞음.
> 대신 버튼 레이블과 안내 문구를 명확히 개선.

**변경:**
```tsx
// 현재
'KG이니시스 카드 등록 및 결제'

// 개선
'카드 등록 및 결제하기'
// 버튼 아래 설명
'카드 정보는 KG이니시스 보안 창에서 안전하게 입력합니다'
```

---

### 4. 약관 동의 체크박스

**구현 위치:** `subscribe/page.tsx` — 결제 버튼 바로 위

**State 추가:**
```ts
const [agreements, setAgreements] = useState({
  terms: false,
  privacy: false,
  autoPay: false,
});
const allAgreed = Object.values(agreements).every(Boolean);
```

**UI:**
```
□ [전체 동의]
─────────────────────────
□ (필수) 이용약관 동의        [보기]
□ (필수) 개인정보 처리방침 동의  [보기]
□ (필수) 자동결제 동의        [보기]
```

**결제 버튼 비활성화 조건:** `!allAgreed || loading`

---

### 5. 결제 금액 요약 / 영수증 미리보기

**구현 위치:** `subscribe/page.tsx` — 약관 동의 위 (또는 모바일에서는 하단 고정 영역)

**UI:**
```
┌─────────────────────────┐
│ 결제 금액 요약           │
├─────────────────────────┤
│ 프리미엄 플랜 (연간)      │
│ 정가          119,880원  │
│ 쿠폰 할인      -3,000원  │
│ ─────────────────────── │
│ 최종 결제 금액 116,880원  │
│ 다음 결제일   2027-03-24 │
└─────────────────────────┘
```

**계산 로직:**
```ts
const discountedAmount = amount - couponDiscount;
const nextBillingDate = isYearly
  ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
```

---

## 구현 순서 (권장)

1. **약관 동의** (4번) — 독립적, 빠르게 완료 가능
2. **결제 금액 요약** (5번) — `amount` 계산 이미 되어 있어 UI만 추가
3. **결제 주기 토글** (1번) — subscribe 페이지 내 토글 추가
4. **쿠폰 코드** (2번) — API 엔드포인트 신규 개발 필요
5. **카드 입력 안내 문구** (3번) — 텍스트 변경만

---

## 영향받는 파일

| 파일 | 변경 내용 |
|------|----------|
| `app/(main)/subscribe/page.tsx` | 주기 토글, 쿠폰 입력, 약관 체크, 금액 요약 추가 |
| `app/api/coupon/validate/route.ts` | 신규 생성 (쿠폰 검증 API) |
| `app/api/portone/billing-key/route.ts` | 쿠폰 코드 처리 로직 추가 |
| `lib/plans.ts` | 필요시 할인 계산 유틸 추가 |
