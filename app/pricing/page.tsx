'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';
import { PLANS, type BillingCycle } from '@/lib/plans';
import { BillingToggle } from '@/components/pricing/BillingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { ComparisonTable } from '@/components/pricing/ComparisonTable';
import { TrustBar } from '@/components/pricing/TrustBar';

export default function PricingPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [currentPlanId, setCurrentPlanId] = useState<string | undefined>();
  const [currentCycle, setCurrentCycle] = useState<BillingCycle | undefined>();

  // 로그인 상태면 현재 플랜 로드 (실패해도 페이지는 동작)
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getBrowserDb();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('profiles')
          .select('subscription_plan, billing_cycle')
          .eq('user_id', user.id)
          .single();
        if (data?.subscription_plan) setCurrentPlanId(data.subscription_plan);
        if (data?.billing_cycle) setCurrentCycle(data.billing_cycle as BillingCycle);
      } catch {
        // 비로그인 상태 — 무시
      }
    };
    load();
  }, []);

  const handleSelect = (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/login');
      return;
    }
    router.push(`/subscribe?planId=${planId}&cycle=${cycle}`);
  };

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

        {/* Billing toggle */}
        <BillingToggle value={cycle} onChange={setCycle} />

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              currentPlanId={currentPlanId}
              currentCycle={currentCycle}
              onSelect={handleSelect}
            />
          ))}
        </div>

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
