'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLANS, formatPrice, type PlanId, type BillingCycle } from '@/lib/plans';

const CYCLE_OPTIONS: { value: BillingCycle; label: string; discount?: string }[] = [
  { value: 'monthly', label: '월간' },
  { value: 'yearly', label: '연간', discount: '2개월 무료' },
];

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === 'free') {
      router.push('/subscription?action=free');
      return;
    }

    setError(null);
    setLoadingPlanId(planId);

    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '체크아웃 생성에 실패했습니다.');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            요금제 선택
          </h1>
          <p className="text-xl text-gray-600">
            반려동물을 위한 최고의 플랜을 선택하세요
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {CYCLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setBillingCycle(option.value)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
                {option.discount && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {option.discount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.badge ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  {plan.badge}
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.label}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(billingCycle === 'yearly' ? plan.yearlyPrice / 12 : plan.monthlyPrice)}
                  </span>
                  <span className="text-gray-600">/월</span>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-gray-500 mt-1">
                      연간 결제 시 {formatPrice(plan.yearlyPrice)}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlanId !== null}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.id === 'free'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPlanId === plan.id ? '처리 중...' : plan.id === 'free' ? '무료로 시작하기' : '구독하기'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-12">
          모든 플랜은 언제든지 취소할 수 있습니다. 결제 오류가 발생하면 고객센터로 연락주세요.
        </p>
      </div>
    </div>
  );
}