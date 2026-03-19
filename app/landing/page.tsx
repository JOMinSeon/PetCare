'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse, Stethoscope, Calendar, CheckCircle,
  Menu, X, ArrowRight, Sparkles, Shield, Zap,
  PawPrint, Star,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: '#fff', color: '#1a2e1a' }}>

      {/* ── Navigation ── */}
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(209,250,229,0.8)',
        }}
      >
        <nav className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: '#2D6A4F' }}>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
            >
              <PawPrint size={16} />
            </div>
            펫헬스
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden rounded-xl p-2 transition-colors"
            style={{ color: '#4a7c59' }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="메뉴 열기"
          >
            <Menu size={22} />
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {['기능', '사용방법', '요금'].map((item) => (
              <a
                key={item}
                href={`#${item === '기능' ? 'features' : item === '사용방법' ? 'how-it-works' : 'pricing'}`}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:bg-[#f0fdf4]"
                style={{ color: '#4a7c59' }}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold transition-colors"
              style={{ color: '#2D6A4F' }}
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                boxShadow: '0 4px 14px rgba(45,106,79,0.4)',
              }}
            >
              무료 시작하기 <ArrowRight size={14} />
            </Link>
          </div>
        </nav>

      </header>

      {/* Mobile menu — outside <header> to avoid backdropFilter containing-block issue */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 px-6 py-6 overflow-y-auto"
            style={{ background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg" style={{ color: '#2D6A4F' }}>펫헬스</span>
              <button
                type="button"
                className="rounded-xl p-2"
                style={{ color: '#4a7c59' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-2 mb-8">
              {[
                { label: '기능', href: '#features' },
                { label: '사용방법', href: '#how-it-works' },
                { label: '요금', href: '#pricing' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold transition-all hover:opacity-80"
                  style={{
                    color: '#2D6A4F',
                    background: '#f0fdf4',
                    border: '1.5px solid #d1fae5',
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-center text-sm font-semibold"
                style={{ border: '1.5px solid #d1fae5', color: '#2D6A4F' }}
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="relative isolate pt-28 pb-20 px-6 lg:px-8 overflow-hidden bg-hero-gradient">
        {/* Decorative blobs */}
        <div
          className="absolute -top-40 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #52B788, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F4A261, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-1/2 w-[600px] h-40 -translate-x-1/2 opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #2D6A4F, transparent)' }}
          aria-hidden="true"
        />

        <div className="mx-auto max-w-3xl text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold animate-fade-in"
            style={{
              background: '#f0fdf4',
              color: '#2D6A4F',
              border: '1px solid #d1fae5',
            }}
          >
            <Sparkles size={14} />
            AI 기반 반려동물 건강 관리 서비스
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up"
            style={{ color: '#1a2e1a', lineHeight: 1.1 }}
          >
            반려동물의
            <br />
            <span className="gradient-text">건강한 삶</span>을
            <br />
            지켜드려요
          </h1>

          <p className="text-lg sm:text-xl font-medium mb-10 max-w-xl mx-auto animate-slide-up delay-100"
            style={{ color: '#4a7c59', lineHeight: 1.7 }}
          >
            AI 건강 분석과 실시간 모니터링으로<br className="hidden sm:block" />
            소중한 반려동물과 더 오래, 더 건강하게 함께하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition-all hover:opacity-90 w-full sm:w-auto justify-center ripple"
              style={{
                background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                boxShadow: '0 8px 28px rgba(45,106,79,0.45)',
              }}
            >
              지금 무료로 시작하기 <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all w-full sm:w-auto justify-center"
              style={{
                color: '#2D6A4F',
                border: '2px solid #d1fae5',
                background: '#f0fdf4',
              }}
            >
              사용방법 알아보기
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12 animate-fade-in delay-300">
            <div className="text-center">
              <p className="font-display text-2xl font-bold" style={{ color: '#2D6A4F' }}>10,000+</p>
              <p className="text-xs font-medium" style={{ color: '#86a98c' }}>활성 사용자</p>
            </div>
            <div className="w-px h-8" style={{ background: '#d1fae5' }} />
            <div className="text-center">
              <p className="font-display text-2xl font-bold" style={{ color: '#2D6A4F' }}>50,000+</p>
              <p className="text-xs font-medium" style={{ color: '#86a98c' }}>건강 기록</p>
            </div>
            <div className="w-px h-8" style={{ background: '#d1fae5' }} />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#E9C46A" color="#E9C46A" />
              ))}
              <span className="ml-1 font-display font-bold text-sm" style={{ color: '#2D6A4F' }}>4.9</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 sm:py-32" style={{ background: '#f8fdf9' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="section-badge mb-4">주요 기능</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1a2e1a' }}>
              반려동물을 위한<br />
              <span className="gradient-text">완벽한 건강 관리</span>
            </h2>
            <p className="text-base font-medium" style={{ color: '#4a7c59' }}>
              AI 기술로 더 정확하고, 더 쉽고, 더 체계적인 건강 관리를 경험하세요
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: HeartPulse,
                title: 'AI 건강 분석',
                desc: '인공지능이 매일의 건강 데이터를 분석해 조기 이상 징후를 감지하고 맞춤형 케어 조언을 제공합니다.',
                gradient: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                iconBg: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                badge: '인기',
              },
              {
                icon: Zap,
                title: '실시간 모니터링',
                desc: '체중, 칼로리, 활동량을 실시간으로 추적하고 목표 달성 현황을 직관적인 차트로 확인하세요.',
                gradient: 'linear-gradient(135deg, #fff8e1, #fef9c3)',
                iconBg: 'linear-gradient(135deg, #b45309, #d97706)',
                badge: null,
              },
              {
                icon: Stethoscope,
                title: 'AI 수의사 상담',
                desc: '24시간 AI 수의사와 언제든 채팅하고, 증상에 대한 전문적인 조언을 즉시 받을 수 있습니다.',
                gradient: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                iconBg: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                badge: null,
              },
              {
                icon: Calendar,
                title: '스마트 일정 관리',
                desc: '예방접종, 정기검진 일정을 자동으로 관리하고 미리 알림을 받아 중요한 케어를 놓치지 마세요.',
                gradient: 'linear-gradient(135deg, #fdf4ff, #fae8ff)',
                iconBg: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                badge: null,
              },
              {
                icon: Shield,
                title: '건강 기록 보관',
                desc: '모든 건강 기록을 안전하게 저장하고, 병원 방문 시 체계적인 데이터를 바로 공유할 수 있습니다.',
                gradient: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
                iconBg: 'linear-gradient(135deg, #be123c, #f43f5e)',
                badge: null,
              },
              {
                icon: Sparkles,
                title: '사료 성분 분석',
                desc: '사료 라벨을 사진으로 찍거나 성분을 입력하면 AI가 영양 균형과 적합도를 즉시 분석해드립니다.',
                gradient: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                iconBg: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                badge: 'NEW',
              },
            ].map(({ icon: Icon, title, desc, gradient, iconBg, badge }) => (
              <div
                key={title}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: gradient,
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                {badge && (
                  <span
                    className="absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
                  >
                    {badge}
                  </span>
                )}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl mb-4"
                  style={{ background: iconBg }}
                >
                  <Icon size={20} color="#fff" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#1a2e1a' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#4a7c59' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="section-badge mb-4">사용방법</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1a2e1a' }}>
              3분이면 시작할 수 있어요
            </h2>
            <p className="text-base font-medium" style={{ color: '#4a7c59' }}>
              복잡한 설정 없이 바로 반려동물 건강 관리를 시작하세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: '반려동물 등록',
                desc: '이름, 나이, 종류, 품종 등 기본 정보를 입력하면 즉시 맞춤 케어가 시작됩니다.',
                emoji: '🐾',
              },
              {
                step: '02',
                title: '건강 기록 시작',
                desc: '매일 체중과 컨디션을 기록하면 AI가 추이를 분석하고 인사이트를 제공합니다.',
                emoji: '📊',
              },
              {
                step: '03',
                title: 'AI 분석 수신',
                desc: '맞춤형 건강 리포트와 케어 조언을 받고 이상 징후를 조기에 파악합니다.',
                emoji: '🤖',
              },
              {
                step: '04',
                title: '건강하게 함께',
                desc: '체계적인 데이터로 병원 상담을 더 효과적으로, 반려동물과의 시간을 더 길게.',
                emoji: '💚',
              },
            ].map(({ step, title, desc, emoji }, i) => (
              <div key={step} className="relative">
                {/* Connector line */}
                {i < 3 && (
                  <div
                    className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-0.5"
                    style={{ background: 'linear-gradient(90deg, #d1fae5, #f0fdf4)' }}
                  />
                )}
                <div
                  className="rounded-2xl p-6 text-center h-full"
                  style={{
                    background: '#fff',
                    border: '1px solid #d1fae5',
                    boxShadow: '0 2px 12px rgba(45,106,79,0.06)',
                  }}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-4 text-2xl"
                    style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
                  >
                    {emoji}
                  </div>
                  <div
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold mb-3"
                    style={{ background: '#f0fdf4', color: '#2D6A4F' }}
                  >
                    STEP {step}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#1a2e1a' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#4a7c59' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 sm:py-32" style={{ background: '#f8fdf9' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="section-badge mb-4">사용자 후기</div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1a2e1a' }}>
              <span className="gradient-text">10,000명</span> 이상이 신뢰합니다
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: '김지은',
                pet: '골든 리트리버 맥스',
                text: 'AI 건강 분석 덕분에 조기에 심장 문제를 발견했어요. 정말 감사합니다! 이제 매일 기록하는 습관이 생겼어요.',
                emoji: '🐕',
              },
              {
                name: '이준호',
                pet: '고양이 나비',
                text: 'AI 수의사 상담이 너무 편리해요. 밤에도 빠르게 답변 받을 수 있어서 불안할 때 큰 도움이 됩니다.',
                emoji: '🐈',
              },
              {
                name: '박소연',
                pet: '포메라니안 코코',
                text: '건강 기록이 체계적이라 병원 방문 시 매우 유용해요. 수의사 선생님도 좋다고 하셨어요.',
                emoji: '🐕',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  background: '#fff',
                  border: '1px solid #d1fae5',
                  boxShadow: '0 2px 12px rgba(45,106,79,0.06)',
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} fill="#E9C46A" color="#E9C46A" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: '#4a7c59' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #d1fae5' }}>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
                  >
                    {t.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#1a2e1a' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#86a98c' }}>{t.pet} 보호자</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="section-badge mb-4">요금</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1a2e1a' }}>
              합리적인 가격으로
              <br />
              <span className="gradient-text">최고의 케어를</span>
            </h2>
            <p className="text-base font-medium" style={{ color: '#4a7c59' }}>
              모든 요금제 14일 무료 체험 가능
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pro Plan — featured */}
            <div
              className="rounded-3xl p-8 flex flex-col relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1B5E3B 0%, #2D6A4F 50%, #40916C 100%)',
                boxShadow: '0 16px 50px rgba(45,106,79,0.5)',
              }}
            >
              {/* Decorative */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #74C69D, transparent)' }}
              />
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">전문가 플랜</h3>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                >
                  🔥 인기
                </span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                반려동물 3마리까지
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display text-5xl font-bold text-white">9,900</span>
                <span className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>원/월</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  '완전한 AI 건강 분석',
                  'AI 수의사 무제한 상담',
                  '월간 건강 리포트',
                  '예방접종 일정 관리',
                  'AI 사료 성분 분석',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <CheckCircle size={16} style={{ color: '#74C69D', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block rounded-full py-3.5 text-center text-sm font-bold transition-all hover:opacity-90 ripple"
                style={{ background: '#fff', color: '#2D6A4F' }}
              >
                14일 무료로 시작하기
              </Link>
            </div>

            {/* Premium Plan */}
            <div
              className="rounded-3xl p-8 flex flex-col"
              style={{
                background: '#fff',
                border: '2px solid #d1fae5',
                boxShadow: '0 4px 20px rgba(45,106,79,0.08)',
              }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1a2e1a' }}>프리미엄 플랜</h3>
              <p className="text-sm mb-6" style={{ color: '#86a98c' }}>반려동물 무제한</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display text-5xl font-bold" style={{ color: '#1a2e1a' }}>29,900</span>
                <span className="text-base font-medium" style={{ color: '#86a98c' }}>원/월</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  '전문가 플랜 모든 기능 포함',
                  '무제한 반려동물 등록',
                  '우선 고객 지원 (24시간)',
                  '전담 수의사 연결',
                  '고급 건강 예측 분석',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#4a7c59' }}>
                    <CheckCircle size={16} style={{ color: '#2D6A4F', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block rounded-full py-3.5 text-center text-sm font-bold transition-all ripple"
                style={{
                  background: '#f0fdf4',
                  color: '#2D6A4F',
                  border: '2px solid #d1fae5',
                }}
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        className="py-24 sm:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B5E3B 0%, #2D6A4F 60%, #40916C 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, #74C69D 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F4A261 0%, transparent 50%)',
          }}
        />
        <div className="mx-auto max-w-2xl text-center px-6 relative">
          <p className="text-4xl mb-4">🐾</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
            오늘부터 시작하세요
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.75)' }}>
            반려동물과의 건강한 시간, 지금 시작하면<br className="hidden sm:block" />
            더 오래, 더 행복하게 함께할 수 있어요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold transition-all hover:opacity-90 w-full sm:w-auto justify-center ripple"
              style={{ background: '#fff', color: '#2D6A4F' }}
            >
              무료로 회원가입 <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="text-sm font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              더 알아보기 →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0D1117' }}>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)' }}
                >
                  <PawPrint size={16} color="#fff" />
                </div>
                <span className="font-bold text-lg text-white">펫헬스</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#4a7c59' }}>
                AI 기반 반려동물 건강 관리 서비스
              </p>
            </div>
            {[
              {
                title: '제품',
                links: [
                  { label: '기능', href: '#features' },
                  { label: '요금', href: '#pricing' },
                  { label: '사용방법', href: '#how-it-works' },
                ],
              },
              {
                title: '지원',
                links: [
                  { label: '문의하기', href: 'mailto:help@pethealth.com' },
                  { label: 'FAQ', href: '#how-it-works' },
                  { label: '가이드', href: '#how-it-works' },
                ],
              },
              {
                title: '법적',
                links: [
                  { label: '이용약관', href: '/terms' },
                  { label: '개인정보보호', href: '/privacy' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-sm font-semibold text-white mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: '#4a7c59' }}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="pt-8 text-center text-sm"
            style={{ borderTop: '1px solid #1E3A2A', color: '#4a7c59' }}
          >
            <p>&copy; 2026 펫헬스. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
