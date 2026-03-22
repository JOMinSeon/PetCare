'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle, CreditCard } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';
import * as PortOne from '@portone/browser-sdk/v2';

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

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId') ?? 'plus';
  const changeCard = searchParams.get('changeCard') === 'true';

  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasPhone, setHasPhone] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const plan = PLANS.find((p) => p.id === planIdParam) ?? PLANS[0];

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email ?? '');

      const { data } = await supabase
        .from('profiles')
        .select('phone, subscription_plan')
        .eq('user_id', user.id)
        .single();

      if (data?.phone) {
        setPhone(data.phone);
        setHasPhone(true);
      } else {
        setHasPhone(false);
      }
    };
    init();
  }, [router]);

  const handleSubscribe = async () => {
    if (!userId) return;
    if (!phone) {
      setError('휴대폰 번호를 입력해 주세요.');
      return;
    }
    setError('');
    setLoading(true);

    const issueId = `issue${plan.id}${userId.replace(/-/g, '')}${Date.now()}`;

    try {
      // phone이 없었던 경우 결제 전에 저장
      if (!hasPhone) {
        const supabase = getBrowserDb();
        await supabase.from('profiles').upsert({ user_id: userId, phone });
      }

      const response = await PortOne.requestIssueBillingKey({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        billingKeyMethod: 'CARD',
        issueId,
        issueName: `펫헬스 ${plan.label} 구독`,
        customer: {
          customerId: userId.replace(/-/g, ''),
          email: userEmail,
          phoneNumber: phone,
        },
      });

      if (!response || 'code' in response) {
        const errResp = response as { message?: string } | null;
        setError(errResp?.message || '결제 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      const billingKey = (response as { billingKey: string }).billingKey;

      if (changeCard) {
        // 카드 변경: 새 빌링키 저장만 (결제 없음)
        const res = await fetch('/api/portone/change-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billingKey }),
        });
        if (!res.ok) {
          const { error: msg } = await res.json();
          setError(msg || '카드 변경 중 오류가 발생했습니다.');
          setLoading(false);
          return;
        }
        router.push('/subscription?card=changed');
      } else {
        // 신규 구독: 첫 결제 포함
        const res = await fetch('/api/portone/billing-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billingKey, planId: plan.id }),
        });
        if (!res.ok) {
          const { error: msg } = await res.json();
          setError(msg || '구독 처리 중 오류가 발생했습니다.');
          setLoading(false);
          return;
        }
        router.push('/settings?payment=success');
      }
    } catch (err) {
      const portOneErr = err as { message?: string; pgMessage?: string };
      const detail = portOneErr?.message || portOneErr?.pgMessage || '';
      setError(detail ? `결제 오류: ${detail}` : '결제 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  if (!userId) return null;

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
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {changeCard ? '카드 변경' : '구독 결제'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>KG이니시스 안전 결제</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* 선택 플랜 요약 카드 */}
        <section className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>선택한 플랜</p>
          <div
            className="rounded-2xl border-2 p-5 space-y-3"
            style={{
              background: 'var(--color-primary-50)',
              borderColor: 'var(--color-primary-500)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                {plan.label}
              </span>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: 'var(--color-primary-500)' }}
              >
                <Check size={14} color="#fff" />
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
              {plan.price}
            </p>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  <Check size={13} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 고객 정보 */}
        <section className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>고객 정보</p>
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                이메일
              </label>
              <input
                value={userEmail}
                readOnly
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-muted)',
                  cursor: 'default',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                휴대폰 번호
                {!hasPhone && (
                  <span className="ml-1.5 font-normal" style={{ color: '#dc2626' }}>
                    * 결제에 필요합니다
                  </span>
                )}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: !hasPhone && !phone ? '#fca5a5' : 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  boxShadow: !hasPhone && !phone ? '0 0 0 3px rgba(252,165,165,0.2)' : undefined,
                }}
              />
            </div>
          </div>
        </section>

        {/* 결제 안내 */}
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs"
          style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
        >
          <CreditCard size={14} style={{ flexShrink: 0 }} />
          <span>매월 자동 갱신 · 언제든 취소 가능 · KG이니시스 안전 결제</span>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* 결제 버튼 */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full rounded-xl py-4 font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'var(--color-primary-500)' }}
        >
          <CreditCard size={18} />
          {loading ? '처리 중...' : changeCard ? 'KG이니시스 새 카드 등록' : 'KG이니시스 카드 등록 및 결제'}
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          구독 취소는 설정 페이지에서 언제든 가능합니다
        </p>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={null}>
      <SubscribeContent />
    </Suspense>
  );
}
