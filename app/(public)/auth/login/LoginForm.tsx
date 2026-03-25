'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getBrowserDb } from '@/lib/supabase-browser';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { createGuestUser } from '@/app/actions/guest';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    const supabase = getBrowserDb();

    // 서버 액션으로 이메일 확인 없이 영구 게스트 계정 생성 후 signInWithPassword로 로그인
    const { email: guestEmail, password: guestPassword, error: createError } = await createGuestUser();

    if (createError) {
      setError('비회원 로그인에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: guestEmail, password: guestPassword });

    if (error) {
      setError('비회원 로그인에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    window.location.href = '/pets';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = getBrowserDb();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    } else {
      window.location.href = '/pets';
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="lg:hidden text-center">
        <Link href="/" className="text-xl font-bold" style={{ color: 'var(--color-primary-500)' }}>펫헬스</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>다시 오신 것을 환영합니다</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>계정에 로그인하세요.</p>
      </div>

      <GoogleAuthButton mode="login" />

      {/* 비회원 로그인 버튼 */}
      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={loading}
        className="w-full rounded-lg border-2 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'transparent' }}
      >
        {loading ? '로그인 중...' : '비회원으로 시작하기'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-sm" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>또는 이메일로 로그인</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>이메일</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            placeholder="you@example.com"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>비밀번호</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            placeholder="••••••••"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--color-primary-50)', color: 'var(--color-danger)' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        계정이 없으신가요?{' '}
        <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: 'var(--color-primary-500)' }}>
          회원가입
        </Link>
      </p>
    </div>
  );
}
