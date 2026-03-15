'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserDb } from '@/lib/supabase-browser';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { CheckCircle, HeartPulse, Calendar, Stethoscope } from 'lucide-react';

const features = [
  { icon: HeartPulse, label: 'AI 기반 건강 분석으로 조기 발견' },
  { icon: Calendar, label: '24/7 실시간 건강 모니터링' },
  { icon: Stethoscope, label: '전문 수의사 온라인 상담' },
];

export default function SignupPage() {
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
      // 에러 원문 노출 방지 (이메일 열거 공격 차단)
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
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left panel */}
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

        {/* Right panel — email sent */}
        <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
          <div className="w-full max-w-sm space-y-6 text-center">
            <div className="lg:hidden">
              <Link href="/" className="text-xl font-bold text-indigo-600">펫헬스</Link>
            </div>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">회원가입 완료</h1>
              <p className="mt-2 text-sm text-gray-600">
                <strong className="text-gray-900">{email}</strong>로 인증 메일을 보냈습니다.
              </p>
              <p className="mt-1 text-sm text-gray-500">이메일을 확인하고 링크를 클릭한 후 로그인해 주세요.</p>
            </div>
            <Link
              href="/auth/login"
              className="block w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white text-center hover:bg-indigo-500 transition-colors"
            >
              로그인 페이지로
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Right: Signup Form */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">펫헬스</Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">계정 만들기</h1>
            <p className="mt-1 text-sm text-gray-500">무료로 시작하세요. 신용카드 불필요.</p>
          </div>

          <GoogleAuthButton mode="signup" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">또는 이메일로 가입</span>
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
                placeholder="8자 이상"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="비밀번호를 다시 입력하세요"
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
              {loading ? '처리 중...' : '무료로 회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              로그인
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400">
            가입하면{' '}
            <Link href="/terms" className="underline hover:text-gray-600">이용약관</Link>
            {' '}및{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">개인정보처리방침</Link>
            에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
