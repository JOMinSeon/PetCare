import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerDb } from '@/lib/supabase-server';
import { PawPrint, HeartPulse, Calendar, Users, Sparkles, ChevronRight } from 'lucide-react';

const FEATURES = [
  {
    icon: HeartPulse,
    color: 'var(--color-primary-500)',
    bg: 'var(--color-primary-50)',
    title: '건강 기록 & 체중 추적',
    desc: '체중 변화를 차트로 한눈에 확인하고, 적정 칼로리(MER)를 자동 계산해드려요.',
  },
  {
    icon: Sparkles,
    color: 'var(--color-accent-500)',
    bg: '#fffbeb',
    title: 'AI 사료 분석 & 상담',
    desc: '사료 사진을 찍으면 반려동물에게 맞는지 AI가 즉시 분석해드려요.',
  },
  {
    icon: Calendar,
    color: 'var(--color-info)',
    bg: '#eff6ff',
    title: '예방접종 & 일정 캘린더',
    desc: '접종, 구충제, 미용, 병원 일정을 한 곳에서 관리하고 알림을 받으세요.',
  },
  {
    icon: Users,
    color: 'var(--color-rose)',
    bg: 'var(--color-rose-light)',
    title: '보호자 커뮤니티',
    desc: '다른 보호자들의 경험을 공유하고, 수의사 Q&A로 전문 답변을 받아보세요.',
  },
];

export default async function Home() {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (user) redirect('/pets');

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 py-20 text-center"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-50) 0%, #eff6ff 50%, var(--color-rose-light) 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: 'var(--color-primary-400)' }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-rose)' }}
        />

        <div className="relative max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium glass-card">
            <span>✨</span>
            <span style={{ color: 'var(--color-primary-600)' }}>AI 기반 반려동물 건강 관리</span>
          </div>

          <div className="flex justify-center mb-4">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-3xl shadow-lg"
              style={{ background: 'var(--color-primary-500)' }}
            >
              <PawPrint size={48} color="#fff" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: 'var(--color-text-primary)' }}>
            우리 아이 건강,<br />
            <span style={{ color: 'var(--color-primary-500)' }}>펫헬스</span>가 함께해요
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            체중 관리부터 AI 사료 분석, 예방접종 일정까지<br className="hidden sm:block" />
            반려동물의 모든 건강 정보를 한 곳에서.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold shadow-md transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: 'var(--color-primary-500)', color: '#fff' }}
            >
              무료로 시작하기
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/landing"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all hover:opacity-80 glass-card"
              style={{ color: 'var(--color-text-primary)' }}
            >
              자세히 보기
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all hover:opacity-80 glass-card"
              style={{ color: 'var(--color-text-primary)' }}
            >
              로그인
            </Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            신용카드 불필요 · 무료 플랜으로 시작
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            반려동물에게 필요한 모든 것
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            복잡한 건강 관리를 쉽고 즐겁게
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border p-6 space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: bg }}
              >
                <Icon size={24} style={{ color }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16 text-center"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)' }}
      >
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-3xl">🐾</p>
          <h2 className="text-2xl font-bold text-white">지금 바로 시작해보세요</h2>
          <p className="text-white/80">우리 아이의 첫 번째 건강 기록을 남겨보세요!</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105"
            style={{ color: 'var(--color-primary-600)' }}
          >
            첫 기록 남기러 가기
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        © 2025 펫헬스 · AI가 함께하는 반려동물 건강 관리
      </footer>
    </main>
  );
}
