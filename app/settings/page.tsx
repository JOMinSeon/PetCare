'use client';
import { useState, useEffect, Suspense } from 'react';
import { Bell, CreditCard, User, Shield, ChevronRight, Check, LogOut, X, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className="relative h-6 w-11 rounded-full transition-colors duration-200"
      style={{ background: checked ? 'var(--color-primary-500)' : 'var(--color-border)' }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

const PLAN_OPTIONS = [
  { id: 'free',    label: '무료', price: '₩0/월',      features: ['반려동물 1마리', 'AI 상담 10회/월', '기본 건강 기록'] },
  { id: 'plus',    label: 'Plus', price: '₩4,900/월',  features: ['반려동물 3마리', 'AI 상담 무제한', '영양 분석 차트', '캘린더 알림'] },
  { id: 'premium', label: 'Premium', price: '₩9,900/월', features: ['반려동물 무제한', '수의사 Q&A 우선 답변', '건강 리포트 PDF', '모든 기능'] },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [nickname, setNickname] = useState('보호자');
  const [phone, setPhone] = useState('');
  const [notifications, setNotifications] = useState({
    vaccination: true,
    weight: true,
    community: false,
    marketing: false,
  });
  const [currentPlan, setCurrentPlan] = useState('free');
  const [planStartedAt, setPlanStartedAt] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState(0);
  const [savedProfile, setSavedProfile] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 비밀번호 변경
  const [showPwModal, setShowPwModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 결제 결과 처리 (리다이렉트 후)
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setPaymentMsg({ type: 'success', text: '결제가 완료되었습니다. 플랜이 업그레이드되었어요!' });
      router.replace('/settings');
    } else if (payment === 'failed') {
      setPaymentMsg({ type: 'error', text: '결제에 실패했습니다. 다시 시도해 주세요.' });
      router.replace('/settings');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error?.code === 'refresh_token_not_found') {
        await supabase.auth.signOut();
        router.replace('/auth/login');
        return;
      }
      if (!user) { router.replace('/auth/login'); return; }

      setUserId(user.id);
      setUserEmail(user.email ?? '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setNickname(data.nickname ?? user.email?.split('@')[0] ?? '보호자');
        setPhone(data.phone ?? '');
        setNotifications({
          vaccination: data.notif_vaccination,
          weight: data.notif_weight,
          community: data.notif_community,
          marketing: data.notif_marketing,
        });
        setCurrentPlan(data.subscription_plan ?? 'free');
        setPlanStartedAt(data.plan_started_at ?? null);
        const currentMonth = new Date().toISOString().slice(0, 7);
        setAiUsage(data.ai_usage_reset_month === currentMonth ? (data.ai_monthly_usage ?? 0) : 0);
      } else {
        setNickname(user.email?.split('@')[0] ?? '보호자');
      }

      setAuthChecked(true);
    };
    init();
  }, [router]);

  const upsertProfile = async (patch: Record<string, unknown>) => {
    const supabase = getBrowserDb();
    await supabase.from('profiles').upsert({ user_id: userId, ...patch });
  };

  const saveProfile = async () => {
    await upsertProfile({ nickname, phone });
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newNotifs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifs);
    await upsertProfile({
      notif_vaccination: newNotifs.vaccination,
      notif_weight: newNotifs.weight,
      notif_community: newNotifs.community,
      notif_marketing: newNotifs.marketing,
    });
  };

  const getNextBillingDate = (startedAt: string | null): string => {
    if (!startedAt) return '';
    const start = new Date(startedAt);
    const now = new Date();
    const next = new Date(start);
    next.setMonth(next.getMonth() + 1);
    while (next <= now) next.setMonth(next.getMonth() + 1);
    return next.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: '비밀번호는 6자 이상이어야 합니다.' });
      return;
    }
    setPwSaving(true);
    setPwMessage(null);
    const supabase = getBrowserDb();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwMessage({ type: 'error', text: '변경 실패: ' + error.message });
    } else {
      setPwMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setNewPassword('');
      setTimeout(() => { setShowPwModal(false); setPwMessage(null); }, 1500);
    }
    setPwSaving(false);
  };

  const handleLogout = async () => {
    const supabase = getBrowserDb();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!authChecked) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>설정</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>계정 및 앱 환경설정</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* 결제 결과 메시지 */}
        {paymentMsg && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
            style={{
              background: paymentMsg.type === 'success' ? 'var(--color-primary-50)' : '#fef2f2',
              color: paymentMsg.type === 'success' ? 'var(--color-primary-600)' : '#dc2626',
              border: `1px solid ${paymentMsg.type === 'success' ? 'var(--color-primary-200)' : '#fecaca'}`,
            }}
          >
            {paymentMsg.type === 'error' && <AlertCircle size={16} style={{ flexShrink: 0 }} />}
            {paymentMsg.type === 'success' && <Check size={16} style={{ flexShrink: 0 }} />}
            <span className="flex-1">{paymentMsg.text}</span>
            <button onClick={() => setPaymentMsg(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Profile */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <User size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>보호자 정보</h2>
          </div>
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                style={{ background: 'var(--color-primary-50)' }}
              >
                🧑
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{nickname}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{userEmail}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>닉네임</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  휴대폰 번호 <span style={{ color: 'var(--color-primary-500)' }}>*</span>
                  <span className="ml-1 font-normal" style={{ color: 'var(--color-text-muted)' }}>(유료 구독 필수)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            <button
              onClick={saveProfile}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-medium transition-all"
              style={{
                background: savedProfile ? 'var(--color-primary-50)' : 'var(--color-primary-500)',
                color: savedProfile ? 'var(--color-primary-600)' : '#fff',
              }}
            >
              {savedProfile ? (
                <>
                  <Check size={16} />
                  저장되었어요!
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>알림 설정</h2>
          </div>
          <div
            className="rounded-2xl border divide-y divide-[var(--color-border)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {([
              { key: 'vaccination' as const, label: '예방접종 & 건강 일정',     desc: 'D-7, D-3, D-1 사전 알림' },
              { key: 'weight'      as const, label: '체중 기록 리마인더',        desc: '매주 월요일 오전 9시' },
              { key: 'community'   as const, label: '커뮤니티 댓글 알림',        desc: '내 글에 댓글이 달릴 때' },
              { key: 'marketing'   as const, label: '펫헬스 소식 & 프로모션',    desc: '이벤트 및 신기능 안내' },
            ] as { key: keyof typeof notifications; label: string; desc: string }[]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
                <Toggle
                  checked={notifications[key]}
                  onChange={() => toggleNotification(key)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Subscription */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>구독 & 결제</h2>
          </div>
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {PLAN_OPTIONS.find((p) => p.id === currentPlan)?.label ?? '무료'} 플랜
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {currentPlan === 'free'
                    ? `이번 달 AI 상담 ${aiUsage} / 10회`
                    : planStartedAt
                    ? `다음 결제일: ${getNextBillingDate(planStartedAt)}`
                    : ''}
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: currentPlan !== 'free' ? 'var(--color-primary-50)' : 'var(--color-bg)',
                  color: currentPlan !== 'free' ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                  border: `1px solid ${currentPlan !== 'free' ? 'var(--color-primary-200)' : 'var(--color-border)'}`,
                }}
              >
                {currentPlan !== 'free' ? '구독 중' : '무료'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/plans')}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--color-primary-500)', color: '#fff' }}
              >
                플랜 보기
              </button>
              <button
                onClick={() => router.push('/subscription')}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                구독 관리
              </button>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>계정</h2>
          </div>
          <div
            className="rounded-2xl border divide-y"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {[
              { label: '비밀번호 변경', action: () => { setShowPwModal(true); setPwMessage(null); setNewPassword(''); } },
              { label: '개인정보 처리방침', action: () => {} },
              { label: '이용약관', action: () => {} },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex w-full items-center justify-between px-5 py-4 text-sm transition-colors hover:opacity-70"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {label}
                <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            ))}
          </div>
        </section>

      </div>

      {/* 비밀번호 변경 모달 */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPwModal(false)} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>비밀번호 변경</h3>
              <button onClick={() => setShowPwModal(false)}>
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') changePassword(); }}
                placeholder="6자 이상 입력"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            {pwMessage && (
              <p className="text-xs text-center" style={{ color: pwMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
                {pwMessage.text}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPwModal(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
              >
                취소
              </button>
              <button
                onClick={changePassword}
                disabled={!newPassword || pwSaving}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {pwSaving ? '변경 중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 pb-6">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl border py-4 text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-danger)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut size={16} />
            로그아웃
          </span>
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          펫헬스 v1.0.0 · claude-sonnet-4-6 기반 AI
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
