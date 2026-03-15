'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse, Stethoscope, Calendar, ArrowRight, CheckCircle,
  Menu, X, Sparkles, Bell, Activity, Star, ShieldCheck,
} from 'lucide-react';

/* ─── Data ────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: HeartPulse,
    label: 'AI 건강 분석',
    desc: '인공지능이 반려동물의 건강 데이터를 실시간으로 분석해 이상 징후를 조기에 발견합니다.',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    icon: Calendar,
    label: '스마트 일정 관리',
    desc: '예방접종, 구충제, 미용 일정을 자동으로 추적하고 놓치지 않도록 알림을 받습니다.',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  {
    icon: Stethoscope,
    label: '수의사 상담',
    desc: '24/7 전문 수의사와 바로 연결되어 건강 조언과 처방전을 받을 수 있습니다.',
    color: '#9333ea',
    bg: '#f3e8ff',
  },
  {
    icon: Sparkles,
    label: 'AI 사료 분석',
    desc: '사료 성분을 AI가 분석해 내 반려동물에게 최적인 영양 섭취를 도와줍니다.',
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    icon: Bell,
    label: '실시간 알림',
    desc: '건강 이상 징후, 일정 미리 알림, 수의사 답변을 즉시 푸시 알림으로 받습니다.',
    color: '#dc2626',
    bg: '#fee2e2',
  },
  {
    icon: Activity,
    label: '건강 리포트',
    desc: '주간·월간 건강 트렌드를 차트로 확인하고, 병원 방문 시 공유할 수 있습니다.',
    color: '#0891b2',
    bg: '#cffafe',
  },
];

const STATS = [
  { value: '10,000+', label: '반려동물 보호자' },
  { value: '99.5%', label: 'AI 진단 정확도' },
  { value: '24/7', label: '전문가 지원' },
  { value: '50+', label: '전문 수의사' },
];

const STEPS = [
  { n: '01', title: '반려동물 등록', desc: '이름, 종, 나이, 특이사항을 간단히 입력하면 완료입니다.' },
  { n: '02', title: '건강 기록 시작', desc: '일일 체중, 식사, 활동량을 기록하면 AI가 분석을 시작합니다.' },
  { n: '03', title: 'AI 분석 & 조언', desc: '인공지능이 건강 패턴을 분석해 맞춤형 조언을 제공합니다.' },
  { n: '04', title: '전문가 상담', desc: '이상 징후 발견 시 전문 수의사와 즉시 연결됩니다.' },
];

const TESTIMONIALS = [
  {
    quote: '"AI 건강 분석 덕분에 맥스의 심장 문제를 조기에 발견할 수 있었어요. 지금은 건강하게 뛰어놀고 있습니다!"',
    name: '김지은',
    role: '골든 리트리버 맥스 보호자',
    bg: '#3a6b4f',
    accent: '#a3e635',
  },
  {
    quote: '"밤새 걱정했던 증상을 수의사 선생님이 30분 만에 답변해주셨어요. 정말 든든합니다."',
    name: '이준호',
    role: '고양이 나비 보호자',
    bg: '#1d4ed8',
    accent: '#fbbf24',
  },
  {
    quote: '"건강 기록이 체계적으로 관리되니 병원 갈 때마다 수의사 선생님이 칭찬해주세요."',
    name: '박소연',
    role: '포메라니안 코코 보호자',
    bg: '#7c3aed',
    accent: '#34d399',
  },
];

const PLANS = [
  {
    name: '기본',
    price: '무료',
    sub: '한 마리 반려동물',
    highlight: false,
    features: ['기본 건강 기록', '주간 리포트', '예방접종 알림 1개'],
    cta: '지금 시작하기',
  },
  {
    name: '전문가',
    price: '9,900원',
    period: '/월',
    sub: '최대 3마리',
    highlight: true,
    badge: '인기',
    features: ['AI 건강 분석', '무제한 알림', '월간 상담 1회', '건강 트렌드 리포트'],
    cta: '지금 시작',
  },
  {
    name: '프리미엄',
    price: '29,900원',
    period: '/월',
    sub: '무제한 반려동물',
    highlight: false,
    features: ['모든 전문가 기능', '무제한 수의사 상담', 'AI 사료 분석', '우선 고객 지원'],
    cta: '시작하기',
  },
];

/* ─── Component ───────────────────────────────────────── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#ebebeb] text-black">

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#ebebeb] border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono font-black text-xl tracking-tight focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#ebebeb] rounded"
          >
            펫헬스
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-black transition-colors">기능</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-black transition-colors">사용방법</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-black transition-colors">요금</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-black transition-colors px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              무료 시작
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-black hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/10 bg-[#ebebeb] px-4 py-4 flex flex-col gap-1">
            {[
              { href: '#features', label: '기능' },
              { href: '#how-it-works', label: '사용방법' },
              { href: '#pricing', label: '요금' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm text-gray-700 hover:bg-black/5 rounded-lg transition-colors"
              >
                {label}
              </a>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-sm text-gray-700 hover:bg-black/5 rounded-lg transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 px-3 py-3 text-sm font-semibold text-center bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Headline + CTAs */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 border border-pink-200 px-3 py-1 rounded-full text-sm font-medium mb-8">
              🐾 반려동물 헬스케어
            </div>

            <h1 className="font-mono font-black text-6xl sm:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-6">
              펫헬스 for<br />반려동물<br />보호자
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-md">
              AI 기반 건강 분석과 실시간 모니터링으로 당신의 소중한 반려동물을 더 오래, 더 건강하게 지키세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#ebebeb]"
              >
                지금 시작하기 <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-400 text-gray-700 rounded-xl font-semibold hover:bg-black/5 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                기능 살펴보기
              </a>
            </div>

            <p className="mt-5 text-xs text-gray-400">신용카드 불필요 · 무료 플랜으로 즉시 시작</p>
          </div>

          {/* Right: Testimonial card + decorative blobs */}
          <div className="relative mt-8 lg:mt-0">
            {/* Blue blob — decorative */}
            <div
              className="absolute -top-10 -right-6 w-36 h-36 rounded-full opacity-70 pointer-events-none"
              style={{ background: '#93c5fd' }}
            />

            {/* Main green testimonial card */}
            <div
              className="relative rounded-2xl p-8 sm:p-10 z-10"
              style={{ background: '#3a6b4f' }}
            >
              <div className="text-white/50 text-3xl mb-4">"</div>
              <p className="font-mono text-white text-xl sm:text-2xl leading-relaxed font-medium mb-8">
                AI 덕분에 맥스의 심장 문제를 조기에 발견할 수 있었어요. 이제 건강하게 뛰어놀고 있습니다.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.pravatar.cc/40?u=kimjieun"
                    alt="김지은"
                    width={40}
                    height={40}
                    loading="lazy"
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">김지은</p>
                    <p className="text-white/50 text-sm">골든 리트리버 맥스 보호자</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-300 text-yellow-300" />
                  ))}
                </div>
              </div>
            </div>

            {/* Yellow arrow pointing down (like Dust) */}
            <div className="flex justify-center mt-0">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '22px solid transparent',
                  borderRight: '22px solid transparent',
                  borderTop: '26px solid #3a6b4f',
                }}
              />
            </div>

            {/* Amber blob — bottom right */}
            <div
              className="absolute -bottom-8 -right-4 w-24 h-24 rounded-full opacity-50 pointer-events-none"
              style={{ background: '#fde68a' }}
            />
          </div>
        </div>
      </section>

      {/* ── Big centered statement ────────────────────────── */}
      <section className="bg-white border-y border-black/10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-mono font-black text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
            우리 아이의 건강,<br />AI로 지킵니다
          </h2>
          <p className="mt-6 text-gray-500 text-lg max-w-xl mx-auto">
            복잡한 건강 관리를 쉽고 즐겁게. 반려동물의 모든 건강 정보를 한 곳에서.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-black/10">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-10 px-6 text-center">
                <div className="font-mono font-black text-4xl mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-3">기능</p>
            <h2 className="font-mono font-black text-4xl sm:text-5xl leading-tight">
              반려동물에게<br />필요한 모든 것
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl p-7 bg-white border border-black/10 hover:border-black/20 transition-colors group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="font-mono font-bold text-lg mb-2">{label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="bg-white border-y border-black/10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-3">사용방법</p>
            <h2 className="font-mono font-black text-4xl sm:text-5xl leading-tight">
              4단계로<br />시작하세요
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col">
                <span className="font-mono font-black text-5xl text-black/10 mb-4">{n}</span>
                <h3 className="font-mono font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-3">사용자 후기</p>
            <h2 className="font-mono font-black text-4xl sm:text-5xl leading-tight">
              10,000명이<br />신뢰합니다
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, bg, accent }) => (
              <div
                key={name}
                className="rounded-2xl p-8 flex flex-col justify-between"
                style={{ background: bg }}
              >
                <p className="font-mono text-white text-lg leading-relaxed mb-8">{quote}</p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/20">
                  <img
                    src={`https://i.pravatar.cc/40?u=${name}`}
                    alt={name}
                    width={40}
                    height={40}
                    loading="lazy"
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-sm" style={{ color: `${accent}` }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="bg-white border-y border-black/10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-3">요금제</p>
            <h2 className="font-mono font-black text-4xl sm:text-5xl leading-tight">
              합리적인<br />가격
            </h2>
            <p className="mt-4 text-gray-500">모든 플랜에 14일 무료 체험 포함</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, period, sub, highlight, badge, features, cta }) => (
              <div
                key={name}
                className={`relative rounded-2xl p-8 border flex flex-col ${
                  highlight
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-black/10 hover:border-black/30 transition-colors'
                }`}
              >
                {badge && (
                  <span className="absolute top-4 right-4 text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-black font-bold">
                    {badge}
                  </span>
                )}
                <div className="mb-6">
                  <h3 className={`font-mono font-bold text-lg mb-1 ${highlight ? 'text-white' : 'text-black'}`}>{name}</h3>
                  <p className={`text-sm ${highlight ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>
                </div>
                <div className="flex items-end gap-1 mb-8">
                  <span className={`font-mono font-black text-5xl ${highlight ? 'text-white' : 'text-black'}`}>{price}</span>
                  {period && <span className={`text-sm mb-2 ${highlight ? 'text-white/50' : 'text-gray-400'}`}>{period}</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle
                        size={16}
                        className={`flex-shrink-0 mt-0.5 ${highlight ? 'text-emerald-400' : 'text-gray-400'}`}
                      />
                      <span className={`text-sm ${highlight ? 'text-white/80' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block py-3 px-4 rounded-xl text-sm font-semibold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    highlight
                      ? 'bg-white text-black hover:bg-gray-100 focus:ring-white focus:ring-offset-black'
                      : 'border border-black text-black hover:bg-black hover:text-white focus:ring-black focus:ring-offset-white'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Big colorful CTA card */}
          <div
            className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
            style={{ background: '#3a6b4f' }}
          >
            {/* Decorative blob */}
            <div
              className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-30 pointer-events-none"
              style={{ background: '#a3e635' }}
            />
            <div
              className="absolute -bottom-10 -left-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
              style={{ background: '#86efac' }}
            />

            <div className="relative">
              <p className="text-5xl mb-5">🐾</p>
              <h2 className="font-mono font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
                오늘부터 시작하세요
              </h2>
              <p className="text-white/60 text-lg mb-10">
                반려동물의 첫 번째 건강 기록을 지금 바로 남겨보세요. 무료입니다.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold text-base hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#3a6b4f]"
              >
                무료로 회원가입 <ArrowRight size={18} />
              </Link>
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                {['신용카드 불필요', '14일 무료 체험', '언제든 취소'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-white/50">
                    <ShieldCheck size={14} className="text-green-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-black/10 px-6 pb-12 pt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="font-mono font-black text-xl mb-3">펫헬스</div>
              <p className="text-sm text-gray-500 leading-relaxed">
                반려동물의 건강을 지키는<br />AI 기반 헬스케어 서비스
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
                  { label: '이용약관', href: '#' },
                  { label: '개인정보보호', href: '#' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-mono font-bold text-xs uppercase tracking-widest mb-4 text-gray-400">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-sm text-gray-500 hover:text-black transition-colors">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-black/10 pt-6 text-center text-xs text-gray-400">
            © 2026 펫헬스. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
