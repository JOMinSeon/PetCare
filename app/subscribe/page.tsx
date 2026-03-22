'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';

declare global {
  interface Window {
    AUTHNICE?: {
      requestPay: (params: {
        clientId: string;
        method: string;
        orderId: string;
        amount: number;
        goodsName: string;
        returnUrl: string;
        fnError?: (result: { resultMsg?: string }) => void;
      }) => void;
    };
  }
}

const PLANS = [
  {
    id: 'plus',
    label: 'Plus',
    price: '₩4,900/월',
    amount: 4900,
    features: ['반려동물 3마리', 'AI 상담 무제한', '영양 분석 차트', '캘린더 알림'],
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '₩9,900/월',
    amount: 9900,
    features: ['반려동물 무제한', '수의사 Q&A 우선 답변', '건강 리포트 PDF', '모든 기능'],
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [selected, setSelected] = useState('plus');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // NicePay JS SDK 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pay.nicepay.co.kr/v1/js/';
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // 로그인 확인 및 현재 플랜 조회
  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('user_id', user.id)
        .single();

      if (data?.subscription_plan) setCurrentPlan(data.subscription_plan);
    };
    init();
  }, [router]);

  const handleSubscribe = () => {
    if (!userId) return;
    setError('');
    setLoading(true);

    if (!window.AUTHNICE) {
      setError('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      setLoading(false);
      return;
    }

    const plan = PLANS.find((p) => p.id === selected)!;
    const orderId = `${plan.id}-${userId.replace(/-/g, '')}-${Date.now()}`;
    const returnUrl = `${window.location.origin}/api/nicepay/auth?userId=${userId}&planId=${plan.id}`;

    window.AUTHNICE.requestPay({
      clientId: process.env.NEXT_PUBLIC_NICEPAY_CLIENT_ID!,
      method: 'card',
      orderId,
      amount: plan.amount,
      goodsName: `펫헬스 ${plan.label} 구독`,
      returnUrl,
      fnError: (result) => {
        setError(result.resultMsg || '결제 중 오류가 발생했습니다.');
        setLoading(false);
      },
    });
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            구독 플랜 선택
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            언제든지 취소 가능 · 매월 자동 갱신
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className="rounded-2xl border p-5 text-left space-y-3 transition-all hover:shadow-md"
                style={{
                  background: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface)',
                  borderColor: isSelected ? 'var(--color-primary-500)' : 'var(--color-border)',
                  borderWidth: isSelected ? '2px' : '1px',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {plan.label}
                  </span>
                  {isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
                      현재 플랜
                    </span>
                  )}
                  {isSelected && !isActive && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: 'var(--color-primary-500)' }}>
                      <Check size={12} color="#fff" />
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--color-primary-600)' }}>
                  {plan.price}
                </p>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}>
                      <Check size={13} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading || currentPlan === selected}
          className="w-full rounded-xl py-3.5 font-bold text-white transition-all disabled:opacity-50"
          style={{ background: 'var(--color-primary-500)' }}
        >
          {loading
            ? '처리 중...'
            : currentPlan === selected
            ? '현재 이용 중인 플랜'
            : `${PLANS.find((p) => p.id === selected)?.label} 구독 시작하기`}
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          구독 취소는 설정 페이지에서 언제든 가능합니다
        </p>
      </div>
    </div>
  );
}
