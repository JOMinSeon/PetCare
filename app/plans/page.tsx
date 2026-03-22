'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';

const PLANS = [
  {
    id: 'free',
    label: '무료',
    price: '₩0',
    period: '/월',
    description: '기본 반려동물 관리',
    features: ['반려동물 1마리', 'AI 상담 10회/월', '기본 건강 기록', '커뮤니티 이용'],
  },
  {
    id: 'plus',
    label: 'Plus',
    price: '₩4,900',
    period: '/월',
    description: '활발한 반려동물 보호자용',
    badge: '인기',
    features: ['반려동물 3마리', 'AI 상담 무제한', '영양 분석 차트', '캘린더 알림'],
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '₩9,900',
    period: '/월',
    description: '최고의 반려동물 케어',
    badge: '최고급',
    features: ['반려동물 무제한', '수의사 Q&A 우선 답변', '건강 리포트 PDF', '모든 기능'],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }
      const { data } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('user_id', user.id)
        .single();
      if (data?.subscription_plan) setCurrentPlan(data.subscription_plan);
      setLoading(false);
    };
    init();
  }, [router]);

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
              월 정기 구독
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            반려동물에게 딱 맞는 플랜을 선택하세요
          </p>
        </div>

        {/* Plan cards */}
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPremium = plan.id === 'premium';
          const isPlus = plan.id === 'plus';
          const isFree = plan.id === 'free';

          return (
            <div
              key={plan.id}
              className="rounded-2xl border p-5 space-y-4 transition-all"
              style={{
                background: isCurrent ? 'var(--color-primary-50)' : 'var(--color-surface)',
                borderColor: isCurrent ? 'var(--color-primary-500)' : isPremium ? '#f59e0b40' : 'var(--color-border)',
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
                          isPremium
                            ? { background: '#fef3c7', color: '#d97706' }
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
              <div>
                <span
                  className="text-3xl font-bold"
                  style={{
                    color: isPremium ? '#d97706' : isPlus ? 'var(--color-primary-600)' : 'var(--color-text-primary)',
                  }}
                >
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{plan.period}</span>
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
                  onClick={() => router.push(`/subscribe?planId=${plan.id}`)}
                  className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: isPremium ? '#f59e0b' : 'var(--color-primary-500)' }}
                >
                  {currentPlan === 'premium' && plan.id === 'plus' ? '다운그레이드' : '업그레이드'}
                </button>
              )}
            </div>
          );
        })}

        <p className="text-center text-xs pb-2" style={{ color: 'var(--color-text-muted)' }}>
          VAT 포함 · 매월 자동 갱신 · KG이니시스 안전 결제
        </p>
      </div>
    </div>
  );
}
