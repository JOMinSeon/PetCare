import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft, Pencil } from 'lucide-react';
import { getServerDb } from '@/lib/supabase-server';
import { GeminiAdvicePanel } from '@/components/GeminiAdvicePanel';
import { HealthChart } from '@/components/HealthChart';
import { FoodAnalyzer } from '@/components/FoodAnalyzer';
import { PetDetailTabs } from '@/components/PetDetailTabs';
import { VaccinationStepper } from '@/components/VaccinationStepper';
import { HealthDonut } from '@/components/HealthDonut';
import { saveHealthLog } from '@/app/actions/health';

export default async function PetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id }  = await params;
  const { tab } = await searchParams;
  const activeTab = tab ?? 'health';

  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: pet } = await db
    .from('pets')
    .select('*, health_logs(*)')
    .eq('id', id)
    .single();

  if (!pet) {
    return <div className="p-8">반려동물을 찾을 수 없습니다.</div>;
  }

  const sortedLogs = (pet.health_logs ?? []).sort(
    (a: { recorded_at: string }, b: { recorded_at: string }) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const latest = sortedLogs[sortedLogs.length - 1];

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <Link
          href="/pets"
          className="flex items-center gap-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ChevronLeft size={18} />
          뒤로
        </Link>
        <h1 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
          {pet.name}의 건강 대시보드
        </h1>
        <Link
          href={`/pets/${id}/edit`}
          className="flex items-center gap-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Pencil size={14} />
          수정
        </Link>
      </div>

      {/* Tab navigation */}
      <PetDetailTabs activeTab={activeTab} petId={id} />

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* ── Tab: 건강기록 ── */}
        {activeTab === 'health' && (
          <>
            {/* 핵심 수치 카드 */}
            {latest ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '현재 체중', value: `${latest.weight} kg`, emoji: '⚖️' },
                  { label: 'RER / MER', value: `${Math.round(latest.rer)} / ${Math.round(latest.mer)} kcal`, emoji: '🔥' },
                ].map(({ label, value, emoji }) => (
                  <div
                    key={label}
                    className="rounded-2xl border p-4 space-y-2"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-lg">{emoji}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                    <p className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State for no logs */
              <div
                className="rounded-2xl border-2 border-dashed p-10 text-center space-y-3"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <p className="text-4xl">📋</p>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  아직 기록이 없어요
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  첫 번째 체중을 기록해 AI 분석을 받아보세요!
                </p>
              </div>
            )}

            {/* 활동량 & 음수량 Donut Charts */}
            <HealthDonut />

            {/* 건강 기록 추가 */}
            <form
              action={saveHealthLog}
              className="rounded-2xl border p-5 space-y-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                오늘의 건강 기록 추가
              </h2>
              <input type="hidden" name="petId" value={id} />
              <div className="flex gap-2">
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  placeholder="체중 (kg)"
                  required
                  className="flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-80"
                  style={{ background: 'var(--color-primary-500)' }}
                >
                  저장
                </button>
              </div>
            </form>

            {/* 예방접종 Status Stepper */}
            <div
              className="rounded-2xl border p-5 space-y-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                예방접종 & 진료 현황
              </h2>
              <VaccinationStepper species={pet.species} />
            </div>

            {/* 차트 */}
            {sortedLogs.length > 0 && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  건강 기록 차트
                </h2>
                <HealthChart data={sortedLogs} />
              </div>
            )}

            {/* 최근 기록 */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                최근 건강 기록
              </h2>
              {sortedLogs.length > 0 ? (
                <ul className="space-y-2">
                  {sortedLogs
                    .slice(-5)
                    .reverse()
                    .map((log: { id: string; weight: number; rer: number; mer: number; recorded_at: string }) => (
                      <li
                        key={log.id}
                        className="flex gap-4 text-sm py-2 border-b last:border-0 items-center"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                      >
                        <span className="w-24 flex-shrink-0 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(log.recorded_at).toLocaleDateString('ko-KR')}
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {log.weight}kg
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          RER {log.rer.toFixed(0)} / MER {log.mer.toFixed(0)} kcal
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  기록이 없어요. 첫 번째 기록을 남겨보세요!
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Tab: 사료분석 ── */}
        {activeTab === 'food' && (
          <FoodAnalyzer petInfo={{ species: pet.species, age: pet.age, weight: pet.weight }} />
        )}

        {/* ── Tab: AI상담 ── */}
        {activeTab === 'chat' && (
          <GeminiAdvicePanel petId={id} />
        )}
      </div>
    </div>
  );
}
