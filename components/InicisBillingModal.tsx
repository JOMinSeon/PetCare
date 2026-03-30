'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { X, Check, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';
import { PLAN_MAP, formatPrice, type PlanId } from '@/lib/plans';
import { getMKey, getMid } from '@/lib/inicis';

declare global {
  interface Window {
    INIpay?: {
      Initialize: (params: { returnUrl: string }) => void;
      Payment: (params: Record<string, string>) => void;
    };
  }
}

interface Props {
  planId: PlanId;
  onClose: () => void;
}

interface Agreements {
  terms: boolean;
  privacy: boolean;
  autoPay: boolean;
}

export default function InicisBillingModal({ planId, onClose }: Props) {
  const router = useRouter();
  const plan = PLAN_MAP[planId] ?? PLAN_MAP['premium'];

  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initDone, setInitDone] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
    autoPay: false,
  });

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (profile?.name) setUserName(profile.name);
      setInitDone(true);
    };
    init();
  }, [router]);

  const toggleAll = (checked: boolean) => {
    setAgreements({ terms: checked, privacy: checked, autoPay: checked });
  };

  const openInicisPayment = useCallback(async () => {
    if (!userId || !userName || !userEmail || !phone) {
      setError('모든 필수 정보를 입력해 주세요.');
      return;
    }
    if (!Object.values(agreements).every(Boolean)) {
      setError('필수 약관에 모두 동의해 주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const supabase = getBrowserDb();
      await supabase.from('profiles').upsert(
        { user_id: userId, name: userName, phone },
        { onConflict: 'user_id' }
      );

      const orderId = `inicis_bill_${userId.replace(/-/g, '')}_${Date.now()}`;
      const returnUrl = `${window.location.origin}/api/inicis/billkey`;

      const signatureRes = await fetch('/api/inicis/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: plan.monthlyPrice,
          userId,
          returnUrl,
          buyerName: userName,
          buyerEmail: userEmail,
          buyerTel: phone,
          goodsName: `${plan.label} 플랜 구독`,
        }),
      });

      if (!signatureRes.ok) {
        const { error: msg } = await signatureRes.json();
        throw new Error(msg || '서명 생성에 실패했습니다.');
      }

      const { signature, timestamp, goodsName, oid } = await signatureRes.json();

      const paymentParams = {
        gopaymethod: 'BILL',
        acceptmethod: 'cardkey',
        mid: getMid(),
        oid,
        price: plan.monthlyPrice.toString(),
        goodsname: goodsName,
        returnUrl,
        timestamp,
        mKey: getMKey(),
        buyername: userName,
        buyeremail: userEmail,
        buyertel: phone,
        signature,
      };

      if (window.INIpay) {
        window.INIpay.Initialize({ returnUrl });
        window.INIpay.Payment(paymentParams);
      } else {
        throw new Error('이니시스 결제창을 초기화할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (e) {
      console.error('Inicis payment error:', e);
      setError(e instanceof Error ? e.message : '결제 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [userId, userName, userEmail, phone, agreements, plan]);

  const allAgreed = Object.values(agreements).every(Boolean);
  const isFormValid = userName && userEmail && phone && allAgreed;

  return (
    <>
      <Script
        src="https://pay.inicis.com/inicis/js/inicis_billing.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
        onError={() => console.error('Failed to load Inicis billing script')}
      />

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
                {[
                  { label: '이름', value: userName, onChange: setUserName, placeholder: '홍길동', type: 'text', required: true },
                  { label: '이메일', value: userEmail, onChange: setUserEmail, placeholder: 'example@email.com', type: 'email', required: true },
                  { label: '휴대폰 번호', value: phone, onChange: setPhone, placeholder: '01012345678', type: 'tel', required: true },
                ].map(({ label, value, onChange, placeholder, type, required }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      {label} <span style={{ color: '#dc2626' }}>* 결제에 필요합니다</span>
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: required && !value ? '#fca5a5' : 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                ))}
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
                {(['terms', 'privacy', 'autoPay'] as const).map((key) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreements[key]} onChange={(e) => setAgreements((prev) => ({ ...prev, [key]: e.target.checked }))} className="sr-only" />
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
                      style={{ background: agreements[key] ? 'var(--color-primary-500)' : 'transparent', borderColor: agreements[key] ? 'var(--color-primary-500)' : 'var(--color-border)' }}>
                      {agreements[key] && <Check size={12} color="#fff" />}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: '#dc2626' }}>(필수) </span>
                      {key === 'terms' ? '이용약관 동의' : key === 'privacy' ? '개인정보 처리방침 동의' : '자동결제 동의'}
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
                  onClick={openInicisPayment}
                  disabled={loading || !isFormValid || !scriptLoaded}
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
    </>
  );
}