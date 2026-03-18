import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Calendar, AlertCircle, Sparkles, Activity } from 'lucide-react';
import { getServerDb } from '@/lib/supabase-server';
import { PetCard } from '@/components/PetCard';
import { PetTypeOnboarding } from '@/components/PetTypeOnboarding';

export default async function PetsPage() {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: pets } = await db
    .from('pets')
    .select('*, health_logs(weight, mer, recorded_at)')
    .order('created_at', { ascending: false });

  const userName = user.email?.split('@')[0] ?? '보호자';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? '좋은 아침이에요' :
    hour < 18 ? '안녕하세요' : '좋은 저녁이에요';

  const petCount = pets?.length ?? 0;

  const todayISO = new Date().toISOString().split('T')[0];
  const { count: upcomingCount } = await db
    .from('schedule_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('done', false)
    .gte('date', todayISO);

  const today = new Date().toDateString();
  const petsWithoutLog = pets?.filter((pet) => {
    const logs = pet.health_logs ?? [];
    return !logs.some((l: { recorded_at: string }) => new Date(l.recorded_at).toDateString() === today);
  }) ?? [];

  const recordedToday = petCount - petsWithoutLog.length;

  return (
    <main className="pb-28 md:pb-8" style={{ background: 'var(--color-bg)' }}>

      {/* ── Mobile App Bar ── */}
      <div
        className="flex items-center justify-between px-5 py-4 md:hidden"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{greeting}</p>
          <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            {userName}님의 반려동물 🐾
          </p>
        </div>
        <Link
          href="/pets/new"
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all hover:scale-105 ripple"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))',
            color: '#fff',
          }}
          aria-label="반려동물 추가"
        >
          <Plus size={20} />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-5 pt-6 space-y-6">

        {/* ── Desktop Header ── */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {greeting}, {userName}님 👋
            </p>
            <h1 className="text-2xl font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
              반려동물 건강 현황
            </h1>
          </div>
          <Link
            href="/pets/new"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ripple"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(45,106,79,0.35)',
            }}
          >
            <Plus size={16} />
            반려동물 추가
          </Link>
        </div>

        {petCount > 0 ? (
          <>
            {/* ── Bento Summary Row ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: '🐾',
                  value: petCount,
                  unit: '마리',
                  label: '관리 중인 아이',
                  bg: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))',
                  color: 'var(--color-primary-500)',
                },
                {
                  icon: '✅',
                  value: recordedToday,
                  unit: '마리',
                  label: '오늘 기록 완료',
                  bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  color: '#10b981',
                },
                {
                  icon: '📅',
                  value: upcomingCount ?? 0,
                  unit: '건',
                  label: '예정 일정',
                  bg: 'linear-gradient(135deg, var(--color-golden-light), #fef9c3)',
                  color: '#b45309',
                },
              ].map(({ icon, value, unit, label, bg, color }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 text-center animate-fade-in"
                  style={{
                    background: bg,
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <p className="text-2xl mb-1">{icon}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-2xl font-bold" style={{ color }}>
                      {value}
                    </span>
                    <span className="text-xs font-medium" style={{ color }}>{unit}</span>
                  </div>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Today's Alert Banner ── */}
            {petsWithoutLog.length > 0 && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3 animate-slide-up"
                style={{
                  background: 'linear-gradient(135deg, var(--color-golden-light), #fef3c7)',
                  border: '1px solid #fde68a',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: '#fef3c7' }}
                >
                  <AlertCircle size={20} style={{ color: '#d97706' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#92400e' }}>
                    오늘 체중 기록이 없어요
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                    {petsWithoutLog.map((p: { name: string }) => p.name).join(', ')}
                    {petsWithoutLog.length === 1 ? '의 기록을 남겨보세요!' : ' 등의 기록을 남겨보세요!'}
                  </p>
                </div>
                <Link
                  href={`/pets/${petsWithoutLog[0]?.id ?? ''}`}
                  className="rounded-full px-4 py-1.5 text-xs font-bold flex-shrink-0 ripple"
                  style={{ background: '#d97706', color: '#fff' }}
                >
                  기록하기
                </Link>
              </div>
            )}

            {/* ── Mobile: Horizontal Scroll ── */}
            <div className="md:hidden -mx-5 px-5">
              <div className="pet-card-row flex gap-4 overflow-x-auto pb-2">
                {pets!.map((pet, i) => (
                  <div key={pet.id} className="w-[82vw] flex-shrink-0" style={{ animationDelay: `${i * 0.1}s` }}>
                    <PetCard pet={pet} />
                  </div>
                ))}
                <Link
                  href="/pets/new"
                  className="flex w-28 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm transition-all hover:border-[var(--color-secondary-400)] hover:bg-[var(--color-primary-50)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  <Plus size={22} />
                  <span className="text-xs font-medium">추가</span>
                </Link>
              </div>
            </div>

            {/* ── Desktop: Bento Grid Layout ── */}
            <div className="hidden md:grid gap-5" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              {pets!.map((pet, i) => (
                <div key={pet.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <PetCard pet={pet} />
                </div>
              ))}
            </div>

            {/* ── Health Summary Card ── */}
            <div
              className="rounded-2xl p-5 animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-600) 100%)',
                boxShadow: '0 8px 30px rgba(45,106,79,0.35)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={18} color="#fff" />
                  <span className="font-bold text-white text-sm">오늘의 건강 요약</span>
                </div>
                <Sparkles size={16} color="rgba(255,255,255,0.6)" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { value: `${petCount}마리`, label: '관리 중' },
                  { value: `${recordedToday}마리`, label: '기록 완료' },
                  { value: `${upcomingCount ?? 0}건`, label: '예정 일정' },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <p className="font-display font-bold text-white text-lg leading-none">{value}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/calendar"
                className="flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold w-full ripple transition-all"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                <Calendar size={14} />
                캘린더에서 일정 확인하기
              </Link>
            </div>
          </>
        ) : (
          <PetTypeOnboarding />
        )}
      </div>
    </main>
  );
}
