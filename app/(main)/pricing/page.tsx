import { Sparkles } from 'lucide-react';
import { getServerDb } from '@/lib/supabase-server';
import { type BillingCycle } from '@/lib/plans';
import { ComparisonTable } from '@/components/pricing/ComparisonTable';
import { TrustBar } from '@/components/pricing/TrustBar';
import PricingClient from './PricingClient';

export default async function PricingPage() {
  let currentPlanId: string | undefined;
  let currentCycle: BillingCycle | undefined;

  try {
    const supabase = await getServerDb();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_plan, billing_cycle')
        .eq('user_id', user.id)
        .single();
      if (data?.subscription_plan) currentPlanId = data.subscription_plan;
      if (data?.billing_cycle) currentCycle = data.billing_cycle as BillingCycle;
    }
  } catch {
    // 비로그인 상태 — 무시
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-5 py-12 space-y-12">

        {/* Hero */}
        <div className="text-center space-y-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-500)' }}
          >
            <Sparkles size={12} />
            반려동물 건강 케어
          </span>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            우리 아이에게 딱 맞는 플랜
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            언제든 변경하거나 취소할 수 있습니다
          </p>
        </div>

        {/* 인터랙티브: 토글 + 카드 */}
        <PricingClient currentPlanId={currentPlanId} currentCycle={currentCycle} />

        {/* Comparison table */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>
            플랜 상세 비교
          </h2>
          <ComparisonTable />
        </section>

        {/* Trust bar */}
        <TrustBar />

        <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          VAT 포함 · 자동 갱신 · KG이니시스 안전 결제
        </p>
      </div>
    </div>
  );
}
