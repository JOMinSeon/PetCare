'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserDb } from '@/lib/supabase-browser';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = getBrowserDb();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/pets');
      router.refresh();
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 shadow-sm space-y-6"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>로그인</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>펫헬스에 오신 걸 환영해요 🐾</p>
        </div>

        <GoogleAuthButton mode="login" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span
              className="px-2 text-sm"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
            >
              또는
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-primary-500)]"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{ background: 'var(--color-primary-500)' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          계정이 없으신가요?{' '}
          <Link
            href="/auth/signup"
            className="font-medium hover:underline"
            style={{ color: 'var(--color-primary-500)' }}
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
