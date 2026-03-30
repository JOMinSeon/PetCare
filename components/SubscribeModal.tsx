'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';
import * as PortOne from '@portone/browser-sdk/v2';
import { getBrowserDb } from '@/lib/supabase-browser';
import { PLAN_MAP, formatPrice, type PlanId } from '@/lib/plans';

interface Props {
  planId: PlanId;
  onClose: () => void;
}

interface Agreements {
  terms: boolean;
  privacy: boolean;
  autoPay: boolean;
}

export default function SubscribeModal({ planId, onClose }: Props) {
  const router = useRouter();
  const plan = PLAN_MAP[planId] ?? PLAN_MAP['premium'];

  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initDone, setInitDone] = useState(false);

  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
    autoPay: false,
  });
  const allAgreed = Object.values(agreements).every(Boolean);

  const nextBillingDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  })();

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.replace('/auth/login');
        return;
      }
      const user = session.user;
      setUserId(user.id);
      setUserEmail(user.email ?? '');
      setInitDone(true);
    };
    init();
  }, [router]);

  const toggleAll = (checked: boolean) => {
    setAgreements({ terms: checked, privacy: checked, autoPay: checked });
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (!phone) { setError('휴대폰 번호를 입력해 주세요.'); return; }
    if (!allAgreed) { setError('필수 약관에 모두 동의해 주세요.'); return; }

    setError('');
    setLoading(true);

    try {
      const supabase = getBrowserDb();
      await supabase.from('profiles').upsert(
        { user_id: userId, phone },
        { onConflict: 'user_id' }
      );

      const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      const issueResponse = await PortOne.requestIssueBillingKey({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        billingKeyMethod: 'CARD',
        issueId: `issue-${userId.replace(/-/g, '')}-${Date.now()}`,
        issueName: `${plan.label} 플랜 구독`,
        customer: {
          customerId: userId.replace(/-/g, ''),
          ...(isValidEmail(userEmail) && { email: userEmail }),
          phoneNumber: phone,
        },
      });

      if (issueResponse?.code) {
        if (issueResponse.code === 'PORTONE_USER_CANCELED') {
          setLoading(false);
          return;
        }
        setError(issueResponse.message || '카드 등록에 실패했습니다.');
        setLoading(false);
        return;
      }

      const billingKey = issueResponse?.billingKey;
      if (!billingKey) {
        setError('카드 등록에 실패했습니다. 다시 시도해 주세요.');
        setLoading(false);
        return;
      }

      const storeRes = await fetch('/api/portone/billing-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingKey, planId: plan.id }),
      });

      if (!storeRes.ok) {
        const { error: msg } = await storeRes.json();
        setError(msg || '카드 정보 저장에 실패했습니다.');
        setLoading(false);
        return;
      }

      const subRes = await fetch('/api/portone/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingKey, planId: plan.id }),
      });

      const result = await subRes.json();

      if (!subRes.ok) {
        setError(result.error || '구독 신청에 실패했습니다.');
        setLoading(false);
        return;
      }

      onClose();
      router.push('/settings?payment=success');
    } catch (e) {
      console.error('Subscription error:', e);
      setError('결제 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>구독 결제</h2>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>KG이니시스 안전 결제</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full transition-opacity hover:opacity-70"
            style={{ background: 'var(--color-bg)' }}
          >
            <X size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {!initDone ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 rounded-full animate-spin" style={{ border: '2px solid var(--color-primary-500)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="px-6 py-6 space-y-5">
            <div
              className="rounded-2xl border-2 p-4 space-y-2"
              style={{ background: 'var(--color-primary-50)', borderColor: 'var(--color-primary-500)' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{plan.label}</span>
                <span className="text-lg font-bold" style={{ color: 'var(--color-primary-600)' }}>{formatPrice(plan.monthlyPrice)}/월</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>이메일</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', cursor: 'default' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  휴대폰 번호 <span style={{ color: '#dc2626' }}>* 결제에 필요합니다</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: !phone ? '#fca5a5' : 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            <div
              className="rounded-xl border p-4 flex items-start gap-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <ShieldCheck size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                버튼을 누르면 <strong style={{ color: 'var(--color-text-primary)' }}>KG이니시스 보안 결제창</strong>이 열립니다.
                카드 정보는 KG이니시스에서만 처리되며 저희 서버에 저장되지 않습니다.
              </p>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="px-4 pb-4 space-y-1.5 text-sm border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between pt-3" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{plan.label} (월간)</span>
                  <span>{formatPrice(plan.monthlyPrice)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <span>최종 결제 금액</span>
                  <span style={{ color: 'var(--color-primary-600)' }}>{formatPrice(plan.monthlyPrice)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>다음 결제일</span>
                  <span>{nextBillingDate}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={allAgreed} onChange={(e) => toggleAll(e.target.checked)} className="sr-only" />
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
                  style={{ background: allAgreed ? 'var(--color-primary-500)' : 'transparent', borderColor: allAgreed ? 'var(--color-primary-500)' : 'var(--color-border)' }}>
                  {allAgreed && <Check size={12} color="#fff" />}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>전체 동의</span>
              </label>
              <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />
              {([
                { key: 'terms', label: '이용약관 동의' },
                { key: 'privacy', label: '개인정보 처리방침 동의' },
                { key: 'autoPay', label: '자동결제 동의' },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreements[key]} onChange={(e) => setAgreements((prev) => ({ ...prev, [key]: e.target.checked }))} className="sr-only" />
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
                    style={{ background: agreements[key] ? 'var(--color-primary-500)' : 'transparent', borderColor: agreements[key] ? 'var(--color-primary-500)' : 'var(--color-border)' }}>
                    {agreements[key] && <Check size={12} color="#fff" />}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#dc2626' }}>(필수) </span>{label}
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 pb-2">
              <button
                onClick={handleSubmit}
                disabled={loading || !allAgreed || !phone}
                className="w-full rounded-xl py-4 font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--color-primary-500)' }}
              >
                <CreditCard size={18} />
                {loading ? '처리 중...' : 'KG이니시스 결제창에서 카드 등록'}
              </button>
              <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                카드 정보는 KG이니시스 보안 창에서 안전하게 입력합니다 · 언제든 취소 가능
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
