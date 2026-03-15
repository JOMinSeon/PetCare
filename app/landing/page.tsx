'use client';
import { useState } from 'react';
import Link from 'next/link';
import { HeartPulse, Stethoscope, Calendar, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white">
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
            <a href="#features" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">기능</a>
            <a href="#how-it-works" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">사용방법</a>
            <a href="#pricing" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">요금</a>
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link href="/auth/login" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">
              로그인 <span aria-hidden="true">&rarr;</span>
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
                    <a href="#features" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">기능</a>
                    <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">사용방법</a>
                    <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">요금</a>
                  </div>
                  <div className="py-6">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50">로그인</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section — Simple Centered */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
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

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          {/* Badge */}
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              AI 기반 반려동물 건강 관리 서비스 출시.{' '}
              <a href="#features" className="font-semibold text-indigo-600">
                <span className="absolute inset-0" aria-hidden="true" />
                자세히 보기 <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>

          {/* Centered heading & CTA */}
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
              반려동물의 건강을 지키세요
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              AI 기반 건강 분석과 실시간 모니터링으로 당신의 소중한 반려동물을 더 오래 함께하세요.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/signup"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                지금 시작하기
              </Link>
              <a href="#how-it-works" className="text-sm font-semibold text-gray-900 hover:text-indigo-600">
                사용방법 알아보기 <span aria-hidden="true">→</span>
              </a>
            </div>
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

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-600">주요 기능</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              반려동물을 위한 완벽한 기능들
            </p>
            <p className="mt-6 text-lg text-gray-600">
              반려동물의 건강을 위해 준비한 AI 기반 건강 관리 서비스
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <HeartPulse className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  AI 건강 분석
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base text-gray-600">
                  <p className="flex-auto">인공지능 기술로 반려동물의 건강 상태를 정확하게 분석하고 예방합니다.</p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  실시간 모니터링
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base text-gray-600">
                  <p className="flex-auto">24/7 실시간으로 반려동물의 건강 상태를 모니터링하고 알림을 받습니다.</p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <Stethoscope className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  수의사 상담
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base text-gray-600">
                  <p className="flex-auto">전문가 수의사와 언제든 상담하고 건강 조언을 받을 수 있습니다.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-600">사용방법</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              어떻게 작동합니다
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {[
                { step: '01', title: '반려동물 등록', desc: '반려동물의 정보를 간단하게 등록하세요. 나이, 종류, 특이사항 등을 입력합니다.' },
                { step: '02', title: '건강 기록 시작', desc: '일일 건강 상태, 식사, 활동량 등을 기록하면 AI가 분석합니다.' },
                { step: '03', title: 'AI 분석 및 조언', desc: '인공지능이 건강 데이터를 분석하여 맞춤형 건강 조언을 제공합니다.' },
                { step: '04', title: '전문가 상담', desc: '필요시 전문 수의사와 직접 상담하고 처방을 받을 수 있습니다.' },
              ].map((item) => (
                <div key={item.step} className="relative pl-16">
                  <dt className="text-base font-semibold text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <span className="text-sm font-bold text-white">{item.step}</span>
                    </div>
                    {item.title}
                  </dt>
                  <dd className="mt-2 text-base text-gray-600">{item.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-600">사용자 후기</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              10,000명 이상이 신뢰합니다
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              { name: '김지은', pet: '골든 리트리버 맥스', text: 'AI 건강 분석 덕분에 조기에 심장 문제를 발견했어요. 정말 감사합니다!' },
              { name: '이준호', pet: '고양이 나비', text: '수의사 상담 서비스가 너무 편리해요. 밤에도 빠르게 답변 받을 수 있어서 좋아요.' },
              { name: '박소연', pet: '포메라니안 코코', text: '건강 기록 관리가 체계적이라 병원 방문 시 매우 유용하게 활용하고 있어요.' },
            ].map((t, i) => (
              <div key={i} className="flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <span key={s} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-base text-gray-700">"{t.text}"</p>
                </div>
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.pet} 보호자</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold text-indigo-600">요금</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              합리적인 가격
            </p>
            <p className="mt-6 text-lg text-gray-600">모든 반려동물을 위한 요금제</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2 gap-x-8">
            {/* Pro Plan */}
            <div className="rounded-3xl p-8 ring-2 ring-indigo-600 bg-gray-900 flex flex-col">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold text-white">전문가</h3>
                <span className="rounded-full bg-indigo-500 px-2.5 py-1 text-xs font-semibold text-white">인기</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">3마리 반려동물까지</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-semibold text-white">9,900원</span>
                <span className="text-sm text-gray-400">/월</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-gray-300 flex-1">
                {['완전한 건강 분석', 'AI 기반 예측', '월간 상담 1회', '주간 건강 리포트'].map((f) => (
                  <li key={f} className="flex gap-x-3">
                    <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 block rounded-md bg-indigo-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                지금 시작하기
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="rounded-3xl p-8 ring-1 ring-gray-200 flex flex-col">
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold text-gray-900">프리미엄</h3>
              </div>
              <p className="mt-4 text-sm text-gray-500">반려동물 무제한</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-semibold text-gray-900">29,900원</span>
                <span className="text-sm text-gray-500">/월</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-gray-600 flex-1">
                {['무제한 반려동물 등록', '무제한 수의사 상담', '우선 고객 지원', '전문가 플랜 모든 기능 포함'].map((f) => (
                  <li key={f} className="flex gap-x-3">
                    <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="mt-8 block rounded-md bg-white px-3.5 py-2.5 text-center text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600">
        <div className="px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              지금 시작하세요
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-indigo-200">
              당신의 반려동물의 건강 여정을 오늘부터 시작하세요
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/signup"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                무료로 회원가입
              </Link>
              <a href="#features" className="text-sm font-semibold text-white hover:text-indigo-200">
                더 알아보기 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <p className="text-lg font-semibold text-white">펫헬스</p>
              <p className="mt-2 text-sm text-gray-400">반려동물의 건강을 지키는 AI 기반 서비스</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">제품</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">기능</a></li>
                <li><a href="#pricing" className="hover:text-white">요금</a></li>
                <li><a href="#how-it-works" className="hover:text-white">블로그</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">지원</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><a href="mailto:help@pethealth.com" className="hover:text-white">문의하기</a></li>
                <li><a href="#how-it-works" className="hover:text-white">FAQ</a></li>
                <li><a href="#how-it-works" className="hover:text-white">가이드</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">법적</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white">개인정보보호</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 펫헬스. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
