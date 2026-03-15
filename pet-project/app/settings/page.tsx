'use client';
import { useState, useEffect } from 'react';
import { Bell, CreditCard, User, Shield, ChevronRight, Check, LogOut } from 'lucide-react';
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

export default function SettingsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [notifications, setNotifications] = useState({
    vaccination: true,
    weight: true,
    community: false,
    marketing: false,
  });
  const [currentPlan, setCurrentPlan] = useState('free');
  const [profile, setProfile] = useState({ name: '보호자', email: 'user@example.com' });
  const [savedProfile, setSavedProfile] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace('/auth/login');
      else setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const supabase = getBrowserDb();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const saveProfile = () => {
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
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
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{profile.name}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{profile.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>닉네임</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
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
            className="rounded-2xl border divide-y"
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
                  onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLAN_OPTIONS.map((plan) => {
              const active = currentPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => setCurrentPlan(plan.id)}
                  className="rounded-2xl border p-4 text-left space-y-3 transition-all hover:shadow-md"
                  style={{
                    background: active ? 'var(--color-primary-50)' : 'var(--color-surface)',
                    borderColor: active ? 'var(--color-primary-500)' : 'var(--color-border)',
                    borderWidth: active ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {plan.label}
                    </span>
                    {active && (
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: 'var(--color-primary-500)' }}
                      >
                        <Check size={12} color="#fff" />
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-lg" style={{ color: active ? 'var(--color-primary-600)' : 'var(--color-text-primary)' }}>
                    {plan.price}
                  </p>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <Check size={11} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          {currentPlan !== 'free' && (
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              현재 플랜: <strong>{PLAN_OPTIONS.find((p) => p.id === currentPlan)?.label}</strong> · 다음 결제일: 2026년 4월 15일
            </p>
          )}
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
              { label: '비밀번호 변경', action: () => {} },
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
