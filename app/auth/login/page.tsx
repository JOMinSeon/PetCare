'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { getBrowserDb } from '@/lib/supabase-browser';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="bg-white min-h-screen">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 text-xl font-bold text-indigo-600">
              펫헬스
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex lg:gap-x-12">
            <Link href="/#features" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">기능</Link>
            <Link href="/#how-it-works" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">사용방법</Link>
            <Link href="/#pricing" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">요금</Link>
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link href="/auth/signup" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">
              회원가입 <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>

        {/* Mobile menu dialog */}
        {mobileMenuOpen && (
          <div className="lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 z-50" />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5 text-xl font-bold text-indigo-600">
                  펫헬스
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="메뉴 닫기"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">기능</Link>
                    <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">사용방법</Link>
                    <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">요금</Link>
                  </div>
                  <div className="py-6">
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50">회원가입</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content with gradient background */}
      <div className="relative isolate px-6 pt-14 lg:px-8 min-h-screen flex items-center justify-center">
        {/* Background gradient blobs */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a78bfa] to-[#818cf8] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
          />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm py-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
              로그인
            </h1>
            <p className="mt-3 text-base text-gray-500">
              펫헬스에 오신 것을 환영합니다
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 space-y-6">
            <GoogleAuthButton mode="login" />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">또는</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
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

        {/* Bottom gradient blob */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#a78bfa] to-[#818cf8] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
          />
        </div>
      </div>
    </div>
  );
}
