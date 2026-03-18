'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserDb } from '@/lib/supabase-browser';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { HeartPulse, Calendar, Stethoscope } from 'lucide-react';

const features = [
  { icon: HeartPulse, label: 'AI 기반 건강 분석으로 조기 발견' },
  { icon: Calendar, label: '24/7 실시간 건강 모니터링' },
  { icon: Stethoscope, label: '전문 수의사 온라인 상담' },
];

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
      // 에러 원문 노출 방지 (이메일 열거 공격 차단)
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    } else {
      router.push('/pets');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Marketing Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-indigo-600 p-12 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 -z-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 50%)',
          }}
        />
        <Link href="/" className="relative text-2xl font-bold tracking-tight">
          펫헬스
        </Link>
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              반려동물의 건강을<br />지키세요
            </h2>
            <p className="mt-4 text-indigo-200 text-lg">
              AI 기반 건강 분석과 실시간 모니터링으로 당신의 소중한 반려동물을 더 오래 함께하세요.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-indigo-100">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative border-t border-indigo-500 pt-8">
          <p className="text-indigo-100 italic">
            &ldquo;AI 건강 분석 덕분에 조기에 심장 문제를 발견했어요. 정말 감사합니다!&rdquo;
          </p>
          <p className="mt-2 text-sm text-indigo-300">— 김지은, 골든 리트리버 맥스 보호자</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">펫헬스</Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">다시 오신 것을 환영합니다</h1>
            <p className="mt-1 text-sm text-gray-500">계정에 로그인하세요.</p>
          </div>

          <GoogleAuthButton mode="login" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">또는 이메일로 로그인</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
