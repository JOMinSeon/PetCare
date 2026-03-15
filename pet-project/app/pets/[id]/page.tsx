import { getDb } from '@/lib/supabase';
import { GeminiAdvicePanel } from '@/components/GeminiAdvicePanel';
import { saveHealthLog } from '@/app/actions/health';

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next.js 15+: await 필수

  const { data: pet } = await getDb()
    .from('pets')
    .select('*, health_logs(*)')
    .eq('id', id)
    .single();

  if (!pet) {
    return <div className="p-8">반려동물을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">{pet.name}의 건강 대시보드</h1>

      {/* 건강 기록 입력 폼 */}
      <form action={saveHealthLog} className="rounded-2xl border p-4 space-y-3">
        <h2 className="text-lg font-semibold">건강 기록 저장</h2>
        <input type="hidden" name="petId" value={id} />
        <div className="flex gap-2">
          <input
            name="weight"
            type="number"
            step="0.1"
            placeholder="체중 (kg)"
            required
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white"
          >
            저장
          </button>
        </div>
      </form>

      {/* 최근 건강 기록 */}
      <div className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">최근 건강 기록</h2>
        {pet.health_logs?.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {pet.health_logs.slice(-5).map((log: { id: string; weight: number; rer: number; mer: number; recorded_at: string }) => (
              <li key={log.id} className="flex gap-4 text-gray-600">
                <span>{new Date(log.recorded_at).toLocaleDateString('ko-KR')}</span>
                <span>체중 {log.weight}kg</span>
                <span>RER {log.rer.toFixed(0)} kcal</span>
                <span>MER {log.mer.toFixed(0)} kcal</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">기록이 없습니다.</p>
        )}
      </div>

      {/* AI 상담 패널 */}
      <GeminiAdvicePanel petId={id} />
    </div>
  );
}
