'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';
import { PLAN_MAP, formatPrice, type PlanId } from '@/lib/plans';

function getNextBillingDate(startedAt: string): string {
  const date = new Date(startedAt);
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [planStartedAt, setPlanStartedAt] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setMessage({ type: 'success', text: '결제가 완료되었습니다!' });
    } else if (payment === 'failed') {
      const reason = searchParams.get('reason');
      setMessage({ type: 'error', text: `결제에 실패했습니다: ${reason || '알 수 없는 오류'}` });
    }
  }, [searchParams]);

  useEffect(() => {
    const getSubscription = async () => {
      const supabase = getBrowserDb();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('subscription_plan, plan_started_at, next_billing_date')
        .eq('id', user.id)
        .single();

      if (data) {
        setCurrentPlan((data.subscription_plan as PlanId) || 'free');
        setPlanStartedAt(data.plan_started_at || null);
        setNextBillingDate(data.next_billing_date || null);
      }
      setLoading(false);
    };

    getSubscription();
  }, [router]);

  const handleChangePlan = () => {
    router.push('/pricing');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('정말로 구독을 취소하시겠습니까?')) return;

    setCancelling(true);
    try {
      const res = await fetch('/api/lemonsqueezy/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '구독 취소에 실패했습니다.');
      }

      setMessage({ type: 'success', text: '구독이 취소되었습니다.' });
      setCurrentPlan('free');
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '구독 취소에 실패했습니다.' });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const plan = PLAN_MAP[currentPlan];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">구독 관리</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">현재 플랜</h2>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">{plan.label}</p>
              <p className="text-gray-600">{formatPrice(plan.monthlyPrice)}/월</p>
            </div>
            {currentPlan !== 'free' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                활성
              </span>
            )}
          </div>

          {currentPlan !== 'free' && planStartedAt && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-gray-600">
                구독 시작일: {new Date(planStartedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {nextBillingDate && (
                <p className="text-gray-600 mt-2">
                  다음 결제일: {getNextBillingDate(planStartedAt)}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {currentPlan === 'free' ? (
              <button
                onClick={handleChangePlan}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                플랜 Upgrade하기
              </button>
            ) : (
              <>
                <button
                  onClick={handleChangePlan}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  플랜 변경
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {cancelling ? '취소 중...' : '구독 취소'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">구독 안내</h3>
          <ul className="text-blue-700 text-sm space-y-2">
            <li>구독은 언제든지 취소할 수 있습니다.</li>
            <li>구독 취소 시, 이미 결제된 금액은 환불되지 않으며, 남은 기간까지는 서비스를 계속 이용하실 수 있습니다.</li>
            <li>플랜 변경은 즉시 적용됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}