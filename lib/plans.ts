export type PlanId = 'free' | 'premium' | 'clinic';
export type BillingCycle = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  label: string;
  monthlyPrice: number;          // 월 기준 금액 (원)
  yearlyPrice: number;           // 연간 일괄 청구 금액 (원) — 10개월치
  monthlyEquivalent: number;     // 연간 선택 시 월 환산 금액
  description: string;
  badge?: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    label: '무료',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyEquivalent: 0,
    description: '기본 반려동물 관리',
    features: [
      '반려동물 1마리',
      'AI 건강 상담 5회/월',
      '기본 건강 기록',
      '예방접종 알림',
      '커뮤니티 이용',
    ],
  },
  {
    id: 'premium',
    label: '프리미엄',
    monthlyPrice: 14900,
    yearlyPrice: 149000,           // 14,900 × 10 (2개월 무료)
    monthlyEquivalent: 12400,      // 149,000 / 12 ≈ 12,400
    description: '활발한 반려동물 보호자용',
    badge: '추천',
    features: [
      '반려동물 3마리',
      'AI 상담 무제한',
      '상세 건강 기록 + 차트',
      '수의사 원격 상담 3회/월',
      '증상 사진 AI 분석',
      '건강 리포트 PDF 월 1회',
      '체중/식이 관리',
      '채팅 지원',
    ],
  },
  {
    id: 'clinic',
    label: '병원용',
    monthlyPrice: 49000,
    yearlyPrice: 490000,           // 49,000 × 10 (2개월 무료)
    monthlyEquivalent: 40800,      // 490,000 / 12 ≈ 40,800
    description: '동물병원 · 전문 케어',
    badge: '전문가',
    features: [
      '반려동물 무제한',
      'AI 상담 무제한',
      'EMR 연동',
      '수의사 원격 상담 무제한',
      '건강 리포트 PDF 무제한',
      '병원 연동 API',
      '다중 사용자 무제한',
      'CSV/API 데이터 내보내기',
      '전담 매니저',
    ],
  },
];

export const PLAN_MAP = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<PlanId, Plan>;

/** 결제 금액 반환 */
export function getPlanAmount(planId: PlanId, cycle: BillingCycle): number {
  const plan = PLAN_MAP[planId];
  return cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
}

/** 주문명 반환 */
export function getOrderName(planId: PlanId, cycle: BillingCycle): string {
  const plan = PLAN_MAP[planId];
  return cycle === 'yearly' ? `${plan.label} 플랜 (연간)` : `${plan.label} 플랜`;
}

export const PLAN_LABELS: Record<PlanId, string> = {
  free: '무료',
  premium: '프리미엄',
  clinic: '병원용',
};

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '월간',
  yearly: '연간',
};

/** 가격 표시 문자열 */
export function formatPrice(amount: number): string {
  if (amount === 0) return '₩0';
  return `₩${amount.toLocaleString('ko-KR')}`;
}
