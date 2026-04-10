'use client';
import { useState, useEffect, Suspense } from 'react';
import { Bell, User, Shield, ChevronRight, Check, LogOut, X, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
      className="relative h-6 w-11 overflow-hidden rounded-full transition-colors duration-200"
      style={{ background: checked ? 'var(--color-primary-500)' : 'var(--color-border)' }}
    >
      <span
        className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();
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
  const [savedProfile, setSavedProfile] = useState(false);

  const [showPwModal, setShowPwModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive');

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
        setSubscriptionPlan(data.subscription_plan ?? 'free');
        setSubscriptionStatus(data.subscription_status ?? 'inactive');
      } else {
        setNickname(user.email?.split('@')[0] ?? '보호자');
      }

      setAuthChecked(true);
    };
    init();
  }, [router]);

  const upsertProfile = async (patch: Record<string, unknown>) => {
    const supabase = getBrowserDb();
    await supabase.from('profiles').upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
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

  const getPlanLabel = (planId: string) => {
    const labels: Record<string, string> = {
      free: '무료',
      premium: '프리미엄',
      clinic: '병원용',
    };
    return labels[planId] || planId;
  };

  const getPlanPrice = (planId: string) => {
    const prices: Record<string, string> = {
      free: '무료',
      premium: '₩30,000/월',
      clinic: '₩99,000/월',
    };
    return prices[planId] || '';
  };

  if (!authChecked) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      <div
        className="px-6 py-5 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>설정</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>계정 관리 및 설정</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>구독 관리</h2>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{getPlanLabel(subscriptionPlan)}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{getPlanPrice(subscriptionPlan)}</p>
              </div>
              {subscriptionStatus === 'active' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  활성
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  무료
                </span>
              )}
            </div>
            <button
              onClick={() => router.push('/subscription')}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-all"
              style={{ background: 'var(--color-primary-500)' }}
            >
              {subscriptionPlan === 'free' ? '플랜 Upgrade' : '구독 관리'}
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <User size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>보호자 정보</h2>
          </div>
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                style={{ background: 'var(--color-primary-50)' }}
              >
                😊
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
                  전화번호
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
                  저장되었습니다
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>알림 설정</h2>
          </div>
          <div
            className="rounded-2xl border divide-y divide-[var(--color-border)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {([
              { key: 'vaccination' as const, label: '예방접종 & 건강 일정',     desc: 'D-7, D-3, D-1 일정 알림' },
              { key: 'weight'      as const, label: '체중 기록 리마인더',        desc: '매주 월요일 오전 9시' },
              { key: 'community'   as const, label: '커뮤니티 알림',        desc: '좋아요, 댓글 알림' },
              { key: 'marketing'   as const, label: '헬스팁 & 프로모션',    desc: '이벤트 정보 안내' },
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

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={15} style={{ color: 'var(--color-text-muted)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>계정</h2>
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
          펫케어 v1.0.0 · claude-sonnet-4-6 기반 AI
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