'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle, CreditCard, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';
import { PLAN_MAP, getPlanAmount, getOrderName, formatPrice, type BillingCycle, type PlanId } from '@/lib/plans';
import { BillingToggle } from '@/components/pricing/BillingToggle';

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdParam = (searchParams.get('planId') ?? 'premium') as PlanId;
  const cycleParam = (searchParams.get('cycle') ?? 'monthly') as BillingCycle;
  const changeCard = searchParams.get('changeCard') === 'true';

  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasPhone, setHasPhone] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 결제 주기 (subscribe 페이지 내에서도 변경 가능)
  const [cycle, setCycle] = useState<BillingCycle>(cycleParam);

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

  // 카드 정보 직접 입력
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [birthOrBusiness, setBirthOrBusiness] = useState('');
  const [passwordTwoDigits, setPasswordTwoDigits] = useState('');

  const expiryMonth = expiry.replace(/\D/g, '').slice(0, 2);
  const expiryYear = expiry.replace(/\D/g, '').slice(2, 4);

  const plan = PLAN_MAP[planIdParam] ?? PLAN_MAP['premium'];
  const isYearly = cycle === 'yearly';
  const amount = getPlanAmount(planIdParam, cycle);
  const orderName = getOrderName(planIdParam, cycle);
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

  // 주기 변경 시 쿠폰 초기화
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
        body: JSON.stringify({ code: couponCode.trim(), planId: planIdParam, billingCycle: cycle }),
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

  const handleSubscribe = async () => {
    if (!userId) return;
    if (!phone) { setError('휴대폰 번호를 입력해 주세요.'); return; }
    if (!changeCard && !allAgreed) { setError('필수 약관에 모두 동의해 주세요.'); return; }

    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 15) { setError('올바른 카드번호를 입력해 주세요.'); return; }
    if (expiryMonth.length !== 2 || expiryYear.length !== 2) { setError('유효기간을 MM/YY 형식으로 입력해 주세요.'); return; }
    if (birthOrBusiness.length < 6) { setError('생년월일(6자리) 또는 사업자번호(10자리)를 입력해 주세요.'); return; }
    if (passwordTwoDigits.length !== 2) { setError('카드 비밀번호 앞 2자리를 입력해 주세요.'); return; }

    setError('');
    setLoading(true);

    try {
      if (!hasPhone) {
        const supabase = getBrowserDb();
        await supabase.from('profiles').upsert({ user_id: userId, phone });
      }

      const res = await fetch('/api/portone/issue-billing-key-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: rawCard,
          expiryMonth,
          expiryYear,
          birthOrBusiness,
          passwordTwoDigits,
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

      router.push(changeCard ? '/subscription?card=changed' : '/settings?payment=success');
    } catch {
      setError('결제 중 오류가 발생했습니다.');
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

        {/* 1. 결제 주기 토글 */}
        {!changeCard && (
          <section>
            <BillingToggle value={cycle} onChange={handleCycleChange} />
            {isYearly && yearlySavings > 0 && (
              <p className="text-center text-xs mt-2" style={{ color: 'var(--color-primary-600)' }}>
                연간 결제 시 {formatPrice(yearlySavings)} 절약
              </p>
            )}
          </section>
        )}

        {/* 선택 플랜 요약 카드 */}
        <section className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>선택한 플랜</p>
          <div
            className="rounded-2xl border-2 p-5 space-y-3"
            style={{ background: 'var(--color-primary-50)', borderColor: 'var(--color-primary-500)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  {plan.label}
                </span>
                {isYearly && (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: 'var(--color-accent-400)', color: '#fff' }}
                  >
                    연간 · 2개월 무료
                  </span>
                )}
              </div>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: 'var(--color-primary-500)' }}
              >
                <Check size={14} color="#fff" />
              </span>
            </div>

            {isYearly ? (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
                    {formatPrice(plan.monthlyEquivalent)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>/월</span>
                  <span className="ml-1 text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
                    {formatPrice(plan.monthlyPrice)}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  오늘 {formatPrice(amount)} 청구 (연간 일괄)
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-600)' }}>
                {formatPrice(amount)}/월
              </p>
            )}

            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
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

        {/* 카드 정보 직접 입력 */}
        <section className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>카드 정보</p>
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* 카드번호 */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                카드번호
              </label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setCardNumber(digits.replace(/(\d{4})(?=\d)/g, '$1 '));
                  }}
                  placeholder="0000 0000 0000 0000"
                  className="w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)] tracking-widest"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* 유효기간 + 비밀번호 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  유효기간
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setExpiry(digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits);
                  }}
                  placeholder="MM/YY"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  비밀번호 앞 2자리
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={passwordTwoDigits}
                  onChange={(e) => setPasswordTwoDigits(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="••"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* 생년월일 / 사업자번호 */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                생년월일 6자리 <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(법인카드는 사업자번호 10자리)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={birthOrBusiness}
                onChange={(e) => setBirthOrBusiness(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="901231"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>
        </section>

        {/* 2. 쿠폰/프로모션 코드 */}
        {!changeCard && (
          <section className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>쿠폰/프로모션 코드</p>
            <div
              className="rounded-2xl border p-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponStatus !== 'idle') {
                        setCouponStatus('idle');
                        setCouponMessage('');
                        setCouponDiscount(0);
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCouponApply()}
                    placeholder="쿠폰 코드 입력"
                    className="w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
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
                <p
                  className="mt-2 text-xs"
                  style={{ color: couponStatus === 'valid' ? 'var(--color-primary-600)' : '#dc2626' }}
                >
                  {couponStatus === 'valid' ? '✓ ' : '✗ '}{couponMessage}
                </p>
              )}
            </div>
          </section>
        )}

        {/* 5. 결제 금액 요약 */}
        {!changeCard && (
          <section
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4"
              onClick={() => setSummaryOpen((v) => !v)}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                결제 금액 요약
              </span>
              {summaryOpen
                ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} />
                : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
              }
            </button>
            {summaryOpen && (
              <div className="px-5 pb-4 space-y-2 text-sm border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between pt-3" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{plan.label} 플랜 ({isYearly ? '연간' : '월간'})</span>
                  <span>{formatPrice(amount)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between" style={{ color: 'var(--color-primary-600)' }}>
                    <span>쿠폰 할인</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-bold pt-2 border-t"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <span>최종 결제 금액</span>
                  <span style={{ color: 'var(--color-primary-600)' }}>{formatPrice(discountedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>다음 결제일</span>
                  <span>{nextBillingDate}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 결제 안내 */}
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs"
          style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
        >
          <CreditCard size={14} style={{ flexShrink: 0 }} />
          <span>
            {isYearly ? '연간 자동 갱신' : '매월 자동 갱신'} · 언제든 취소 가능 · KG이니시스 안전 결제
          </span>
        </div>

        {/* 4. 약관 동의 */}
        {!changeCard && (
          <section
            className="rounded-2xl border p-5 space-y-3"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* 전체 동의 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={(e) => toggleAll(e.target.checked)}
                className="sr-only"
              />
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
                style={{
                  background: allAgreed ? 'var(--color-primary-500)' : 'transparent',
                  borderColor: allAgreed ? 'var(--color-primary-500)' : 'var(--color-border)',
                }}
              >
                {allAgreed && <Check size={12} color="#fff" />}
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                전체 동의
              </span>
            </label>

            <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

            {/* 개별 약관 */}
            {([
              { key: 'terms', label: '이용약관 동의' },
              { key: 'privacy', label: '개인정보 처리방침 동의' },
              { key: 'autoPay', label: '자동결제 동의' },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements[key]}
                  onChange={(e) => setAgreements((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only"
                />
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
                  style={{
                    background: agreements[key] ? 'var(--color-primary-500)' : 'transparent',
                    borderColor: agreements[key] ? 'var(--color-primary-500)' : 'var(--color-border)',
                  }}
                >
                  {agreements[key] && <Check size={12} color="#fff" />}
                </span>
                <span className="flex-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: '#dc2626' }}>(필수) </span>{label}
                </span>
              </label>
            ))}
          </section>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* 3. 결제 버튼 */}
        <div className="space-y-2">
          <button
            onClick={handleSubscribe}
            disabled={loading || (!changeCard && !allAgreed)}
            className="w-full rounded-xl py-4 font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--color-primary-500)' }}
          >
            <CreditCard size={18} />
            {loading ? '처리 중...' : changeCard ? '새 카드 등록하기' : '카드 등록 및 결제하기'}
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            카드 정보는 KG이니시스 보안 창에서 안전하게 입력합니다
          </p>
        </div>

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
