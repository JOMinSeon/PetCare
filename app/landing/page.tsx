'use client';
import { useState } from 'react';
import Link from 'next/link';
import { HeartPulse, Stethoscope, Calendar, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
            펫헬스
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">기능</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">사용방법</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">요금</a>
            <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">로그인</Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-slate-900 py-2">기능</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-slate-900 py-2">사용방법</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-600 hover:text-slate-900 py-2">요금</a>
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-blue-600 hover:text-blue-700 font-medium py-2">로그인</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                반려동물의 건강을 <span className="text-blue-600">지키세요</span>
              </h1>
              <p className="text-xl text-slate-700 mb-8">
                AI 기반 건강 분석과 실시간 모니터링으로 당신의 소중한 반려동물을 더 오래 함께하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  지금 시작하기 <ArrowRight size={20} />
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 border-2 border-slate-300 text-slate-900 rounded-lg font-semibold hover:border-slate-400 transition-colors inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  무료 체험
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/7468980/pexels-photo-7468980.jpeg"
                alt="Caring veterinarian with happy dog by Mikhail Nilov on Pexels"
                width={600}
                height={400}
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">주요 기능</h2>
            <p className="text-xl text-slate-600">반려동물의 건강을 위해 준비한 완벽한 기능들</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-gradient-to-br from-blue-50 to-slate-50">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <HeartPulse size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI 건강 분석</h3>
              <p className="text-slate-600">인공지능 기술으로 반려동물의 건강 상태를 정확하게 분석하고 예방합니다.</p>
            </div>

            <div className="p-8 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-gradient-to-br from-emerald-50 to-slate-50">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">실시간 모니터링</h3>
              <p className="text-slate-600">24/7 실시간으로 반려동물의 건강 상태를 모니터링하고 알림을 받습니다.</p>
            </div>

            <div className="p-8 rounded-xl border border-slate-200 hover:border-amber-300 transition-colors bg-gradient-to-br from-amber-50 to-slate-50">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">수의사 상담</h3>
              <p className="text-slate-600">전문가 수의사와 언제든 상담하고 건강 조언을 받을 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-16 text-center">어떻게 작동합니다</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">1</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">반려동물 등록</h3>
                <p className="text-slate-600">반려동물의 정보를 간단하게 등록하세요. 나이, 종류, 특이사항 등을 입력합니다.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">2</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">건강 기록 시작</h3>
                <p className="text-slate-600">일일 건강 상태, 식사, 활동량 등을 기록하면 AI가 분석합니다.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">3</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">AI 분석 및 조언</h3>
                <p className="text-slate-600">인공지능이 건강 데이터를 분석하여 맞춤형 건강 조언을 제공합니다.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">4</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">전문가 상담</h3>
                <p className="text-slate-600">필요시 전문 수의사와 직접 상담하고 처방을 받을 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">사용자 후기</h2>
            <p className="text-xl text-slate-600">10,000명 이상의 반려동물 보호자가 신뢰합니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: '김지은',
                pet: '골든 리트리버 맥스',
                text: 'AI 건강 분석 덕분에 조기에 심장 문제를 발견했어요. 정말 감사합니다!',
              },
              {
                name: '이준호',
                pet: '고양이 나비',
                text: '수의사 상담 서비스가 너무 편리해요. 밤에도 빠르게 답변 받을 수 있어서 좋아요.',
              },
              {
                name: '박소연',
                pet: '포메라니안 코코',
                text: '건강 기록 관리가 체계적이라 병원 방문 시 매우 유용하게 활용하고 있어요.',
              },
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.pet} 보호자</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1763718598528-21e3f75b2836?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxMHx8R3JvdXAlMjBvZiUyMGhlYWx0aHklMjBwZXRzJTIwcGxheWluZyUyMHRvZ2V0aGVyJTIwb3V0ZG9vcnMlMjBjb2xvcmZ1bHxlbnwwfDB8fHwxNzczNTc4MDA2fDA&ixlib=rb-4.1.0&q=85"
                alt="Two dogs sitting on stone steps in a park by Alvan Nee on Unsplash"
                width={500}
                height={400}
                loading="lazy"
                className="w-full rounded-xl shadow-xl"
              />
            </div>
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-8">건강한 반려동물, 행복한 가족</h2>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <CheckCircle size={24} className="flex-shrink-0 mt-1" />
                  <p className="text-lg">99.5% 정확도의 AI 건강 진단</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle size={24} className="flex-shrink-0 mt-1" />
                  <p className="text-lg">10,000+ 반려동물 사용자의 신뢰</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle size={24} className="flex-shrink-0 mt-1" />
                  <p className="text-lg">24/7 전문 수의사 상담 서비스</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle size={24} className="flex-shrink-0 mt-1" />
                  <p className="text-lg">완벽한 건강 기록 및 백업</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">합리적인 가격</h2>
            <p className="text-xl text-slate-600">모든 반려동물을 위한 요금제</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl">
            {/* Pro Plan — Emphasized Left Tier */}
            <div className="flex flex-col p-10 bg-slate-900">
              <div className="mb-2">
                <span className="inline-block bg-blue-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  인기
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mt-4 mb-2">전문가</h3>
              <p className="text-slate-400 mb-8">3마리 반려동물까지</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">9,900원</span>
                <span className="text-slate-400 text-lg ml-1">/월</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">완전한 건강 분석</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">AI 기반 예측</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">월간 상담 1회</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">주간 건강 리포트</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full block py-3.5 px-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                지금 시작하기
              </Link>
              <p className="text-slate-500 text-sm text-center mt-4">첫 1개월 무료 체험</p>
            </div>

            {/* Premium Plan — Right Tier */}
            <div className="flex flex-col p-10 bg-slate-50 border-t border-slate-200 lg:border-t-0 lg:border-l">
              <div className="mb-2 h-7" />
              <h3 className="text-3xl font-bold text-slate-900 mt-4 mb-2">프리미엄</h3>
              <p className="text-slate-500 mb-8">반려동물 무제한</p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-slate-900">29,900원</span>
                <span className="text-slate-500 text-lg ml-1">/월</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">무제한 반려동물 등록</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">무제한 수의사 상담</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">우선 고객 지원</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">전문가 플랜 모든 기능 포함</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full block py-3.5 px-4 border-2 border-slate-300 hover:border-slate-400 text-slate-900 rounded-xl font-bold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                시작하기
              </Link>
              <p className="text-slate-400 text-sm text-center mt-4">
                무료로 시작하려면{" "}
                <Link href="/auth/signup" className="underline hover:text-slate-600">
                  기본 플랜
                </Link>
                을 선택하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-500 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">지금 시작하세요</h2>
          <p className="text-xl text-emerald-50 mb-8">당신의 반려동물의 건강 여정을 오늘부터 시작하세요</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
          >
            무료로 회원가입 <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">펫헬스</h3>
              <p className="text-slate-400">반려동물의 건강을 지키는 AI 기반 서비스</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">제품</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">기능</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">요금</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">블로그</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">지원</h4>
              <ul className="space-y-2">
                <li><a href="mailto:help@pethealth.com" className="hover:text-white transition-colors">문의하기</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">가이드</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">법적</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보보호</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 mt-8 text-center text-slate-400">
            <p>&copy; 2026 펫헬스. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
