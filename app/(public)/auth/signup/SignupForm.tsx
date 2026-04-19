'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserDb } from '@/lib/supabase-browser';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { CheckCircle } from 'lucide-react';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = getBrowserDb();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    } else if (data.session) {
      router.push('/pets');
      router.refresh();
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="lg:hidden">
          <Link href="/" className="text-xl font-bold" style={{ color: 'var(--color-primary-500)' }}>펫헬스</Link>
        </div>
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--color-primary-50)' }}>
            <CheckCircle className="h-8 w-8" style={{ color: 'var(--color-primary-500)' }} />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>회원가입 완료</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>로 인증 메일을 보냈습니다.
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>이메일을 확인하고 링크를 클릭한 후 로그인해 주세요.</p>
        </div>
        <Link
          href="/auth/login"
          className="btn-primary block w-full py-2.5 text-center"
        >
          로그인 페이지로
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="lg:hidden text-center">
        <Link href="/" className="text-xl font-bold" style={{ color: 'var(--color-primary-500)' }}>펫헬스</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>계정 만들기</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>무료로 시작하세요. 신용카드 불필요.</p>
      </div>

      <GoogleAuthButton mode="signup" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-sm" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>또는 이메일로 가입</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>이메일</label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>비밀번호</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            placeholder="8자 이상"
            autocomplete="new-password"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>비밀번호 확인</label>
          <input
            id="signup-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            aria-required="true"
            placeholder="비밀번호를 다시 입력하세요"
            autocomplete="new-password"
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
          {loading ? '처리 중...' : '무료로 회원가입'}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        이미 계정이 있으신가요?{' '}
        <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary-500)' }}>
          로그인
        </Link>
      </p>

      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        가입하면{' '}
        <Link href="/terms" className="underline" style={{ color: 'var(--color-text-secondary)' }}>이용약관</Link>
        {' '}및{' '}
        <Link href="/privacy" className="underline" style={{ color: 'var(--color-text-secondary)' }}>개인정보처리방침</Link>
        에 동의합니다.
      </p>
    </div>
  );
}
