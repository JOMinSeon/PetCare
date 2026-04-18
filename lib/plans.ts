export type PlanId = 'free' | 'premium' | 'clinic';
export type BillingCycle = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  label: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyEquivalent: number;
  description: string;
  badge?: string;
  features: string[];
  lemonsqueezyVariantId?: string;
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
      'AI 건강 상담 30회/월',
      '기본 건강 기록',
      '예방접종 알림',
      '커뮤니티 무료',
    ],
  },
  {
    id: 'premium',
    label: '프리미엄',
    monthlyPrice: 30000,
    yearlyPrice: 300000,
    monthlyEquivalent: 25000,
    description: '발전된 반려동물 보호용',
    badge: '추천',
    features: [
      '반려동물 3마리',
      'AI 상담 무제한',
      '세세 건강 기록 + 차트',
      '수의사 원격 상담 3회/월',
      '증상 진찰 AI 분석',
      '건강 리포트 PDF 월 1회',
      '체중/식이 관리',
      '채팅 지원',
    ],
    lemonsqueezyVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID,
  },
  {
    id: 'clinic',
    label: '병원용',
    monthlyPrice: 99000,
    yearlyPrice: 990000,
    monthlyEquivalent: 82500,
    description: '동물병원 · 전문 케어',
    badge: '전문가',
    features: [
      '반려동물 무제한',
      'AI 상담 무제한',
      'EMR 연동',
      '수의사 원격 상담 무제한',
      '건강 리포트 PDF 무제한',
      '병원 연동 API',
      '증상 분석 무제한',
      'CSV/API 데이터 내보내기',
      '담당 매니저',
    ],
    lemonsqueezyVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_CLINIC_VARIANT_ID,
  },
];

export const PLAN_MAP = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<PlanId, Plan>;

export function getPlanAmount(planId: PlanId, cycle: BillingCycle): number {
  const plan = PLAN_MAP[planId];
  return cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
}

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

export function formatPrice(amount: number): string {
  if (amount === 0) return '무료';
  return `₩${amount.toLocaleString('ko-KR')}`;
}