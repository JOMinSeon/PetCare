'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';
import { PLANS, formatPrice, type BillingCycle } from '@/lib/plans';

const PLAN_ORDER = ['free', 'premium', 'clinic'];

export default function PlansPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [currentCycle, setCurrentCycle] = useState<BillingCycle>('monthly');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError?.code === 'refresh_token_not_found') { await supabase.auth.signOut(); router.replace('/auth/login'); return; }
      if (!user) { router.replace('/auth/login'); return; }
      const { data } = await supabase
        .from('profiles')
        .select('subscription_plan, billing_cycle')
        .eq('user_id', user.id)
        .single();
      if (data?.subscription_plan) setCurrentPlan(data.subscription_plan);
      const cycle: BillingCycle = data?.billing_cycle === 'yearly' ? 'yearly' : 'monthly';
      setCurrentCycle(cycle);
      setBillingCycle(cycle);
      setLoading(false);
    };
    init();
  }, [router]);

  const isYearly = billingCycle === 'yearly';

  if (loading) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b flex items-center gap-3"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center h-9 w-9 rounded-xl transition-opacity hover:opacity-70"
          style={{ background: 'var(--color-bg)' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>구독 플랜</h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>언제든 변경 · 취소 가능</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {/* Intro */}
        <div className="text-center space-y-1.5 pb-2">
          <div className="flex justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
            >
              <Sparkles size={12} />
              정기 구독
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            반려동물에게 딱 맞는 플랜을 선택하세요
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ color: isYearly ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
          >
            월간
          </span>
          <button
            onClick={() => setBillingCycle(isYearly ? 'monthly' : 'yearly')}
            className="relative inline-flex h-7 w-12 items-center overflow-hidden rounded-full transition-colors"
            style={{ background: isYearly ? 'var(--color-primary-500)' : 'var(--color-border)' }}
            aria-label="결제 주기 전환"
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: isYearly ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
          <span
            className="text-sm font-medium"
            style={{ color: isYearly ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
          >
            연간
          </span>
          {isYearly && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ background: 'var(--color-accent-400)', color: '#fff' }}
            >
              2개월 무료
            </span>
          )}
        </div>

        {/* Plan cards */}
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id && currentCycle === billingCycle;
          const isClinic = plan.id === 'clinic';
          const isPremium = plan.id === 'premium';
          const isFree = plan.id === 'free';

          const displayPrice = isYearly ? plan.monthlyEquivalent : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className="rounded-2xl border p-5 space-y-4 transition-all"
              style={{
                background: isCurrent ? 'var(--color-primary-50)' : 'var(--color-surface)',
                borderColor: isCurrent ? 'var(--color-primary-500)' : isClinic ? 'var(--color-accent-400)' : 'var(--color-border)',
                borderWidth: isCurrent ? '2px' : '1px',
              }}
            >
              {/* Plan header */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                      {plan.label}
                    </span>
                    {plan.badge && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={
                          isClinic
                            ? { background: 'var(--color-accent-400)', color: '#fff' }
                            : { background: 'var(--color-primary-500)', color: '#fff' }
                        }
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{plan.description}</p>
                </div>
                {isCurrent && (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ background: 'var(--color-primary-500)' }}
                  >
                    <Check size={14} color="#fff" />
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: isClinic ? 'var(--color-accent-500)' : isPremium ? 'var(--color-primary-600)' : 'var(--color-text-primary)',
                    }}
                  >
                    {formatPrice(displayPrice)}
                  </span>
                  {!isFree && (
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>/월</span>
                  )}
                  {isYearly && !isFree && (
                    <span className="ml-1 text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
                      {formatPrice(plan.monthlyPrice)}
                    </span>
                  )}
                </div>
                {isYearly && !isFree && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    연 {formatPrice(plan.yearlyPrice)} 일괄 청구
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <Check size={14} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div
                  className="rounded-xl py-2.5 text-sm font-medium text-center"
                  style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}
                >
                  현재 플랜
                </div>
              ) : isFree ? (
                <button
                  onClick={() => router.push('/subscription')}
                  className="w-full rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    background: 'var(--color-bg)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  구독 관리에서 해지
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/subscribe?planId=${plan.id}&cycle=${billingCycle}`)}
                  className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: isClinic ? 'var(--color-accent-500)' : 'var(--color-primary-500)' }}
                >
                  {PLAN_ORDER.indexOf(currentPlan) > PLAN_ORDER.indexOf(plan.id) ? '다운그레이드' : '업그레이드'}
                </button>
              )}
            </div>
          );
        })}

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>
          VAT 포함 · 자동 갱신 · KG이니시스 안전 결제
        </p>
      </div>
    </div>
  );
}
