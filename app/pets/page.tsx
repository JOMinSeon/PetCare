import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Calendar, Syringe, AlertCircle } from 'lucide-react';
import { getServerDb } from '@/lib/supabase-server';
import { PetCard } from '@/components/PetCard';

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

  // Quick stat: pets missing today's log
  const today = new Date().toDateString();
  const petsWithoutLog = pets?.filter((pet) => {
    const logs = pet.health_logs ?? [];
    return !logs.some((l: { recorded_at: string }) => new Date(l.recorded_at).toDateString() === today);
  }) ?? [];

  return (
    <main className="pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* App Bar — Mobile */}
      <div
        className="flex items-center justify-between px-6 py-4 md:hidden"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{greeting}</p>
          <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{userName}님 🐾</p>
        </div>
        <Link
          href="/pets/new"
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all hover:scale-105"
          style={{ background: 'var(--color-primary-500)', color: '#fff' }}
          aria-label="반려동물 추가"
        >
          <Plus size={20} />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-8">
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {greeting}, {userName}님
            </p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              내 반려동물
            </h1>
          </div>
          <Link
            href="/pets/new"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 shadow-sm"
            style={{ background: 'var(--color-primary-500)', color: '#fff' }}
          >
            <Plus size={16} />
            반려동물 추가
          </Link>
        </div>

        {petCount > 0 ? (
          <>
            {/* 오늘의 할 일 */}
            {petsWithoutLog.length > 0 && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1px solid #fde68a',
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: '#fef3c7' }}
                >
                  <AlertCircle size={20} style={{ color: 'var(--color-accent-500)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
                    오늘 체중 기록이 없어요
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                    {petsWithoutLog.map((p: { name: string }) => p.name).join(', ')}
                    {petsWithoutLog.length === 1 ? '의 기록을 남겨보세요!' : ' 등의 기록을 남겨보세요!'}
                  </p>
                </div>
                <Link
                  href={`/pets/${petsWithoutLog[0]?.id ?? ''}`}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold flex-shrink-0"
                  style={{ background: 'var(--color-accent-500)', color: '#fff' }}
                >
                  기록하기
                </Link>
              </div>
            )}

            {/* Mobile: horizontal scroll */}
            <div className="md:hidden -mx-6 px-6">
              <div className="pet-card-row flex gap-4 overflow-x-auto pb-2">
                {pets!.map((pet) => (
                  <div key={pet.id} className="w-[85vw] flex-shrink-0">
                    <PetCard pet={pet} />
                  </div>
                ))}
                <Link
                  href="/pets/new"
                  className="flex w-32 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm transition-all hover:border-[var(--color-primary-400)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  <Plus size={24} />
                  <span>추가</span>
                </Link>
              </div>
            </div>

            {/* Desktop: grid */}
            <div className="hidden md:grid gap-4 grid-cols-2 lg:grid-cols-3">
              {pets!.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>

            {/* 오늘의 건강 요약 — glassmorphism */}
            <div
              className="rounded-2xl border p-5 space-y-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                오늘의 건강 요약
              </h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: '관리 중인 아이', value: `${petCount}마리`, icon: '🐾' },
                  { label: '오늘 기록 완료', value: `${petCount - petsWithoutLog.length}마리`, icon: '✅' },
                  { label: '예정 일정', value: '2건', icon: '📅' },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3"
                    style={{ background: 'var(--color-bg)' }}
                  >
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/calendar"
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-80 w-full"
                style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
              >
                <Calendar size={15} />
                캘린더에서 일정 확인하기
              </Link>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="space-y-8">
            <div
              className="rounded-2xl border-2 border-dashed p-14 text-center space-y-5"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="space-y-1">
                <p className="text-6xl">🐾</p>
                <p className="text-2xl">🐕 🐈</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  아직 등록된 아이가 없어요
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  첫 번째 반려동물을 등록하고<br />
                  AI와 함께 건강을 관리해보세요!
                </p>
              </div>
              <Link
                href="/pets/new"
                className="inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-semibold shadow-md transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'var(--color-primary-500)', color: '#fff' }}
              >
                <Plus size={16} />
                첫 번째 반려동물 등록하기
              </Link>
            </div>

            {/* Feature hints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '📊', title: '체중 & 칼로리 추적', desc: '자동으로 MER을 계산해드려요' },
                { icon: '🤖', title: 'AI 사료 분석',       desc: '사진 한 장으로 즉시 분석' },
                { icon: Syringe, title: '예방접종 일정 알림', desc: 'D-day를 절대 놓치지 마세요' },
                { icon: '👥', title: '보호자 커뮤니티',    desc: '경험을 나누고 조언을 받아요' },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border p-4 flex items-center gap-3"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 text-xl"
                    style={{ background: 'var(--color-primary-50)' }}
                  >
                    {typeof icon === 'string' ? icon : <Syringe size={18} style={{ color: 'var(--color-primary-500)' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
