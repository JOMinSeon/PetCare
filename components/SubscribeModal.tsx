'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, AlertCircle, CreditCard, Tag, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import * as PortOne from '@portone/browser-sdk/v2';
import { getBrowserDb } from '@/lib/supabase-browser';
import {
  PLAN_MAP, getPlanAmount, getOrderName, formatPrice,
  type BillingCycle, type PlanId,
} from '@/lib/plans';
import { BillingToggle } from '@/components/pricing/BillingToggle';

interface Props {
  planId: PlanId;
  initialCycle?: BillingCycle;
  changeCard?: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ planId, initialCycle = 'monthly', changeCard = false, onClose }: Props) {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasPhone, setHasPhone] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initDone, setInitDone] = useState(false);

  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);

  // 쿠폰
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid' | 'loading'>('idle');
  const [couponMessage, setCouponMessage] = useState('');

  // 약관 동의
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, autoPay: false });
  const allAgreed = Object.values(agreements).every(Boolean);

  // 금액 요약 펼치기
  const [summaryOpen, setSummaryOpen] = useState(true);

  const plan = PLAN_MAP[planId] ?? PLAN_MAP['premium'];
  const isYearly = cycle === 'yearly';
  const amount = getPlanAmount(planId, cycle);
  const discountedAmount = Math.max(0, amount - couponDiscount);
  const yearlySavings = plan.monthlyPrice * 12 - plan.yearlyPrice;

  const nextBillingDate = (() => {
    const d = new Date();
    if (isYearly) d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  })();

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError?.code === 'refresh_token_not_found') { await supabase.auth.signOut(); router.replace('/auth/login'); return; }
      if (!user) { router.replace('/auth/login'); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? '');

      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', user.id)
        .single();

      if (data?.phone) {
        setPhone(data.phone);
        setHasPhone(true);
      } else {
        setHasPhone(false);
      }
      setInitDone(true);
    };
    init();
  }, [router]);

  const handleCycleChange = (newCycle: BillingCycle) => {
    setCycle(newCycle);
    if (couponStatus === 'valid') {
      setCouponDiscount(0);
      setCouponStatus('idle');
      setCouponMessage('');
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus('loading');
    setCouponMessage('');
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), planId, billingCycle: cycle }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setCouponStatus('invalid');
        setCouponMessage(data.error || '유효하지 않은 쿠폰 코드입니다.');
        setCouponDiscount(0);
      } else {
        setCouponStatus('valid');
        setCouponDiscount(data.discount);
        setCouponMessage(`"${couponCode.trim()}" 적용됨 — ${formatPrice(data.discount)} 할인`);
      }
    } catch {
      setCouponStatus('invalid');
      setCouponMessage('쿠폰 확인 중 오류가 발생했습니다.');
    }
  };

  const toggleAll = (checked: boolean) => {
    setAgreements({ terms: checked, privacy: checked, autoPay: checked });
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (!phone) { setError('휴대폰 번호를 입력해 주세요.'); return; }
    if (!changeCard && !allAgreed) { setError('필수 약관에 모두 동의해 주세요.'); return; }

    setError('');
    setLoading(true);

    try {
      if (!hasPhone) {
        const supabase = getBrowserDb();
        await supabase.from('profiles').upsert({ user_id: userId, phone });
      }

      // KG이니시스 결제창으로 빌링키 발급
      const issueResponse = await PortOne.requestIssueBillingKey({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        billingKeyMethod: 'CARD',
        issueId: `issue-${userId.replace(/-/g, '')}-${Date.now()}`,
        issueName: changeCard ? '카드 변경' : `${plan.label} 구독 카드 등록`,
        customer: {
          customerId: userId.replace(/-/g, ''),
          email: userEmail,
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

      // 서버에서 결제 처리
      const res = await fetch('/api/portone/subscribe-with-billing-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingKey,
          planId: plan.id,
          billingCycle: cycle,
          couponCode: couponStatus === 'valid' ? couponCode.trim() : undefined,
          changeCard,
        }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg || '결제 처리 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      onClose();
      router.push(changeCard ? '/subscription?card=changed' : '/settings?payment=success');
    } catch {
      setError('결제 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    /* 배경 오버레이 */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* 모달 헤더 */}
        <div
          className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {changeCard ? '카드 변경' : '구독 결제'}
            </h2>
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
            <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="px-6 py-6 space-y-5">

            {/* 결제 주기 토글 */}
            {!changeCard && (
              <div>
                <BillingToggle value={cycle} onChange={handleCycleChange} />
                {isYearly && yearlySavings > 0 && (
                  <p className="text-center text-xs mt-2" style={{ color: 'var(--color-primary-600)' }}>
                    연간 결제 시 {formatPrice(yearlySavings)} 절약
                  </p>
                )}
              </div>
            )}

            {/* 플랜 요약 */}
            <div
              className="rounded-2xl border-2 p-4 space-y-2"
              style={{ background: 'var(--color-primary-50)', borderColor: 'var(--color-primary-500)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{plan.label}</span>
                  {isYearly && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'var(--color-accent-400)', color: '#fff' }}>
                      연간 · 2개월 무료
                    </span>
                  )}
                </div>
                {isYearly ? (
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-lg font-bold" style={{ color: 'var(--color-primary-600)' }}>{formatPrice(plan.monthlyEquivalent)}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/월</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>오늘 {formatPrice(amount)} 청구</p>
                  </div>
                ) : (
                  <span className="text-lg font-bold" style={{ color: 'var(--color-primary-600)' }}>{formatPrice(amount)}/월</span>
                )}
              </div>
            </div>

            {/* 고객 정보 */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>이메일</label>
                <input
                  value={userEmail}
                  readOnly
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', cursor: 'default' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  휴대폰 번호
                  {!hasPhone && <span className="ml-1 font-normal" style={{ color: '#dc2626' }}>* 결제에 필요합니다</span>}
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

            {/* 결제창 안내 */}
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

            {/* 쿠폰 */}
            {!changeCard && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>쿠폰/프로모션 코드</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        if (couponStatus !== 'idle') { setCouponStatus('idle'); setCouponMessage(''); setCouponDiscount(0); }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleCouponApply()}
                      placeholder="쿠폰 코드 입력"
                      className="w-full rounded-xl border pl-8 pr-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: couponStatus === 'invalid' ? '#fca5a5' : couponStatus === 'valid' ? 'var(--color-primary-500)' : 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleCouponApply}
                    disabled={!couponCode.trim() || couponStatus === 'loading'}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
                    style={{ background: 'var(--color-primary-500)', color: '#fff' }}
                  >
                    {couponStatus === 'loading' ? '확인 중' : '적용'}
                  </button>
                </div>
                {couponMessage && (
                  <p className="mt-1.5 text-xs" style={{ color: couponStatus === 'valid' ? 'var(--color-primary-600)' : '#dc2626' }}>
                    {couponStatus === 'valid' ? '✓ ' : '✗ '}{couponMessage}
                  </p>
                )}
              </div>
            )}

            {/* 결제 금액 요약 */}
            {!changeCard && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => setSummaryOpen((v) => !v)}
                >
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>결제 금액 요약</span>
                  {summaryOpen ? <ChevronUp size={15} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--color-text-muted)' }} />}
                </button>
                {summaryOpen && (
                  <div className="px-4 pb-4 space-y-1.5 text-sm border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex justify-between pt-3" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>{plan.label} ({isYearly ? '연간' : '월간'})</span>
                      <span>{formatPrice(amount)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between" style={{ color: 'var(--color-primary-600)' }}>
                        <span>쿠폰 할인</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
                      <span>최종 결제 금액</span>
                      <span style={{ color: 'var(--color-primary-600)' }}>{formatPrice(discountedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span>다음 결제일</span>
                      <span>{nextBillingDate}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 약관 동의 */}
            {!changeCard && (
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
            )}

            {/* 에러 */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* 결제 버튼 */}
            <div className="space-y-2 pb-2">
              <button
                onClick={handleSubmit}
                disabled={loading || (!changeCard && !allAgreed)}
                className="w-full rounded-xl py-4 font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--color-primary-500)' }}
              >
                <CreditCard size={18} />
                {loading ? '처리 중...' : changeCard ? 'KG이니시스 결제창에서 카드 변경' : 'KG이니시스 결제창에서 결제'}
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
