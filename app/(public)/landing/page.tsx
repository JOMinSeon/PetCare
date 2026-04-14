import Link from 'next/link';
import {
  HeartPulse, Stethoscope, Calendar,
  ArrowRight, Sparkles, Shield, Zap,
  PawPrint,
} from 'lucide-react';
import MobileMenu from './MobileMenu';
import { TestimonialCard } from '@/components/TestimonialCard';
import { PetGallery } from '@/components/PetGallery';
import { ContactCTA } from '@/components/ContactCTA';
import { ServiceDetails } from '@/components/ServiceDetails';
import { StatsSection } from '@/components/StatsSection';

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>

      {/* ── Navigation ── */}
      <header className="fixed inset-x-0 top-0 z-50 glass-nav">
        <nav className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: 'var(--color-secondary-500)' }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-400))' }}
            >
              <PawPrint size={16} />
            </div>
            펫헬스
          </Link>

          {/* Mobile hamburger + drawer */}
          <MobileMenu />

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {['기능', '사용방법'].map((item) => (
              <a
                key={item}
                href={`#${item === '기능' ? 'features' : 'how-it-works'}`}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:bg-[var(--color-surface-2)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold transition-colors"
              style={{ color: 'var(--color-secondary-500)' }}
            >
              로그인
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative isolate pt-28 pb-20 px-6 lg:px-8 overflow-hidden bg-hero-gradient">
        {/* Decorative blobs */}
        <div
          className="absolute -top-40 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-secondary-400), transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-accent-400), transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-1/2 w-[600px] h-40 -translate-x-1/2 opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, var(--color-secondary-500), transparent)' }}
          aria-hidden="true"
        />

        <div className="mx-auto max-w-3xl text-center relative">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold animate-fade-in"
            style={{
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-500)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Sparkles size={14} />
            AI 기반 반려동물 건강 관리 서비스
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.1 }}
          >
            반려동물의
            <br />
            <span style={{ color: 'var(--color-secondary-500)' }}>건강한 삶</span>을
            <br />
            지켜드려요
          </h1>

          <p
            className="text-lg sm:text-xl font-medium mb-10 max-w-xl mx-auto animate-slide-up delay-100"
            style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}
          >
            AI 건강 분석과 실시간 모니터링으로<br className="hidden sm:block" />
            소중한 반려동물과 더 오래, 더 건강하게 함께하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition-all hover:opacity-90 w-full sm:w-auto justify-center ripple"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                boxShadow: 'var(--shadow-btn-lg)',
              }}
            >
              지금 무료로 시작하기 <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all w-full sm:w-auto justify-center"
              style={{
                color: 'var(--color-text-secondary)',
                border: '2px solid var(--color-border)',
                background: 'var(--color-surface-2)',
              }}
            >
              사용방법 알아보기
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <StatsSection />

      {/* ── Features Section ── */}
      <section id="features" className="py-24 sm:py-32" style={{ background: 'var(--color-surface-2)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="section-badge mb-4">주요 기능</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              반려동물을 위한<br />
              <span style={{ color: 'var(--color-secondary-500)' }}>완벽한 건강 관리</span>
            </h2>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              AI 기술로 더 정확하고, 더 쉽고, 더 체계적인 건강 관리를 경험하세요
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: HeartPulse,
                title: 'AI 건강 분석',
                desc: '인공지능이 매일의 건강 데이터를 분석해 조기 이상 징후를 감지하고 맞춤형 케어 조언을 제공합니다.',
                cardBg: 'var(--color-primary-50)',
                iconBg: 'linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-400))',
                badge: '인기',
              },
              {
                icon: Zap,
                title: '실시간 모니터링',
                desc: '체중, 칼로리, 활동량을 실시간으로 추적하고 목표 달성 현황을 직관적인 차트로 확인하세요.',
                cardBg: 'var(--color-golden-light)',
                iconBg: 'linear-gradient(135deg, var(--color-accent-500), var(--color-accent-400))',
                badge: null,
              },
              {
                icon: Stethoscope,
                title: 'AI 수의사 상담',
                desc: '24시간 AI 수의사와 언제든 채팅하고, 증상에 대한 전문적인 조언을 즉시 받을 수 있습니다.',
                cardBg: 'var(--color-surface)',
                iconBg: 'var(--color-info)',
                badge: null,
              },
              {
                icon: Calendar,
                title: '스마트 일정 관리',
                desc: '예방접종, 정기검진 일정을 자동으로 관리하고 미리 알림을 받아 중요한 케어를 놓치지 마세요.',
                cardBg: 'var(--color-surface)',
                iconBg: 'var(--color-text-secondary)',
                badge: null,
              },
              {
                icon: Shield,
                title: '건강 기록 보관',
                desc: '모든 건강 기록을 안전하게 저장하고, 병원 방문 시 체계적인 데이터를 바로 공유할 수 있습니다.',
                cardBg: 'var(--color-surface-2)',
                iconBg: 'var(--color-danger)',
                badge: null,
              },
              {
                icon: Sparkles,
                title: '사료 성분 분석',
                desc: '사료 라벨을 사진으로 찍거나 성분을 입력하면 AI가 영양 균형과 적합도를 즉시 분석해드립니다.',
                cardBg: 'var(--color-primary-50)',
                iconBg: 'linear-gradient(135deg, var(--color-secondary-400), var(--color-secondary-500))',
                badge: 'NEW',
              },
            ].map(({ icon: Icon, title, desc, cardBg, iconBg, badge }) => (
              <div
                key={title}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: cardBg,
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {badge && (
                  <span
                    className="absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: 'var(--color-primary-500)' }}
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
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Details ── */}
      <ServiceDetails />

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 sm:py-32" style={{ background: 'var(--color-bg)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="section-badge mb-4">사용방법</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              3분이면 시작할 수 있어요
            </h2>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              복잡한 설정 없이 바로 반려동물 건강 관리를 시작하세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: '반려동물 등록', desc: '이름, 나이, 종류, 품종 등 기본 정보를 입력하면 즉시 맞춤 케어가 시작됩니다.', emoji: '🐾' },
              { step: '02', title: '건강 기록 시작', desc: '매일 체중과 컨디션을 기록하면 AI가 추이를 분석하고 인사이트를 제공합니다.', emoji: '📊' },
              { step: '03', title: 'AI 분석 수신', desc: '맞춤형 건강 리포트와 케어 조언을 받고 이상 징후를 조기에 파악합니다.', emoji: '🤖' },
              { step: '04', title: '건강하게 함께', desc: '체계적인 데이터로 병원 상담을 더 효과적으로, 반려동물과의 시간을 더 길게.', emoji: '💚' },
            ].map(({ step, title, desc, emoji }, i) => (
              <div key={step} className="relative">
                {/* Connector line */}
                {i < 3 && (
                  <div
                    className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-0.5"
                    style={{ background: 'var(--color-border)' }}
                  />
                )}
                <div
                  className="rounded-2xl p-6 text-center h-full"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-4 text-2xl"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {emoji}
                  </div>
                  <div
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold mb-3"
                    style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-500)' }}
                  >
                    STEP {step}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grand Open Benefits ── */}
      <section className="py-24 sm:py-32 relative overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-secondary-400), transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-accent-400), transparent)' }}
          aria-hidden="true"
        />

        <div className="mx-auto max-w-4xl px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-bold"
              style={{
                background: 'var(--color-golden-light)',
                color: 'var(--color-accent-500)',
                border: '1.5px solid var(--color-golden)',
              }}
            >
              🎉 Grand Open 특별 혜택
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              지금 가입하시는 분께만<br />
              <span style={{ color: 'var(--color-secondary-500)' }}>특별한 혜택</span>을 드려요!
            </h2>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              놓치면 후회할 수 있으니 꼭 확인해 보세요 😊
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="flex flex-col gap-5">
            {[
              {
                emoji: '📅',
                title: '14일 무료 체험',
                desc: '카드 등록 없이 모든 기능을 14일간 100% 무료로 사용해보세요',
                cardBg: 'var(--color-surface)',
                border: 'var(--color-border)',
                accent: 'var(--color-secondary-500)',
              },
              {
                emoji: '🍖',
                title: '사료 성분 분석 무료 체험',
                desc: '신규 기능인 AI 사료 성분 분석도 체험 기간 내 무료로 이용 가능해요',
                cardBg: 'var(--color-golden-light)',
                border: 'var(--color-golden)',
                accent: 'var(--color-accent-500)',
              },
              {
                emoji: '💌',
                title: '오픈 기념 첫 달 요금 할인',
                desc: '체험 후 유료 전환 시 첫 달 특별 할인 혜택이 자동 적용돼요',
                cardBg: 'var(--color-primary-50)',
                border: 'var(--color-border)',
                accent: 'var(--color-primary-600)',
              },
            ].map(({ emoji, title, desc, cardBg, border, accent }) => (
              <div
                key={title}
                className="rounded-2xl p-6 flex items-start gap-4 w-full"
                style={{
                  background: cardBg,
                  border: `1.5px solid ${border}`,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl flex-shrink-0"
                  style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}
                >
                  {emoji}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1.5" style={{ color: accent }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-bold text-white transition-all hover:opacity-90 ripple"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                boxShadow: 'var(--shadow-btn-lg)',
              }}
            >
              지금 바로 혜택 받기 <ArrowRight size={16} />
            </Link>
            <p className="mt-3 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              카드 등록 없이 14일 무료 · 언제든지 취소 가능
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="py-24 sm:py-32" style={{ background: 'var(--color-surface-2)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-badge mb-4">이용 후기</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              반려동물 부모들이 말해요
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              실제 이용자분들의 후기를 만나보세요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="김지은"
              role="강아지 엄마"
              content="반려동물 건강 기록 관리하듯 관리할 수 있어서 좋아요. 무엇보다 수의사 상담이 언제든 가능한 게 큰 장점이에요."
              rating={5}
            />
            <TestimonialCard
              name="이민수"
              role="고양이 아빠"
              content="급할 때 맨날 전화 상담 가능해서 안심해요. 사료 분석 기능도 정말 유용하고, 특히 알림이 꼼꼼한 점이 만족스러워요."
              rating={5}
            />
            <TestimonialCard
              name="박서연"
              role="멀티펫 키우미"
              content="여러 마리 관리하는데 하나씩 기록하기 편해요. 진료 예약도 한큐에 되고, 무엇보다UI가 깔끔해서 눈이 편안해요."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* ── Pet Gallery Section ── */}
      <PetGallery />

      {/* ── Contact CTA Section ── */}
      <section className="py-16 sm:py-20" style={{ background: 'var(--color-bg)' }}>
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        className="py-24 sm:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-secondary-600) 0%, var(--color-secondary-500) 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, var(--color-secondary-400) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--color-accent-400) 0%, transparent 50%)',
          }}
          aria-hidden="true"
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
              style={{ background: 'var(--color-surface)', color: 'var(--color-secondary-500)' }}
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
      {/* Footer is intentionally always dark, independent of theme */}
      <footer style={{ background: 'var(--color-footer-bg)' }}>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-400))' }}
                >
                  <PawPrint size={16} color="#fff" />
                </div>
                <span className="font-bold text-lg text-white">펫헬스</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-secondary-400)' }}>
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
                  { label: '환불 정책', href: '/refund' },
                  { label: '사업자 정보', href: '/business' },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-sm font-semibold text-white mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      {href.startsWith('/') ? (
                        <Link
                          href={href}
                          className="text-sm transition-colors hover:text-white"
                          style={{ color: 'var(--color-secondary-400)' }}
                        >
                          {label}
                        </Link>
                      ) : (
                        <a
                          href={href}
                          className="text-sm transition-colors hover:text-white"
                          style={{ color: 'var(--color-secondary-400)' }}
                        >
                          {label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="pt-8 text-sm"
            style={{ borderTop: '1px solid var(--color-footer-border)', color: 'var(--color-secondary-400)' }}
          >
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs" style={{ color: 'var(--color-secondary-500)' }}>
              <span>상호명: 코어넥스트 | 대표자: 조민성</span>
              <span>사업장 소재지: 경기도 시흥시 마유로423번길 20-7</span>
              <span>사업자등록번호: 297-66-00726 | 통신판매업신고: 신청 중</span>
              <span>이메일: help@petcare.pe.kr</span>
              <span>고객센터(유선): 0507-1305-7196</span>
            </div>
            <p className="text-center">&copy; 2026 펫헬스. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
