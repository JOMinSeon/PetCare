'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';
import { getUserPets, getHealthLogs, saveHealthLogFromTracking } from '@/app/actions/health';
import { Scale, Flame, TrendingUp, TrendingDown, Minus, Plus, ChevronDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Pet {
  id: string;
  name: string;
  species: string;
  age?: number;
  weight?: number;
}

interface HealthLog {
  id: string;
  pet_id: string;
  weight: number;
  rer: number;
  mer: number;
  recorded_at: string;
}

const MER_MULTIPLIER: Record<string, number> = {
  dog: 1.6,
  cat: 1.2,
};

function calcRer(weight: number) {
  return 70 * Math.pow(weight, 0.75);
}
function calcMer(weight: number, species: string) {
  return calcRer(weight) * (MER_MULTIPLIER[species] ?? 1.6);
}

function WeightTrendBadge({ logs }: { logs: HealthLog[] }) {
  if (logs.length < 2) return null;
  const diff = logs[logs.length - 1].weight - logs[logs.length - 2].weight;
  if (diff > 0)
    return (
      <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: 'var(--color-rose)' }}>
        <TrendingUp size={13} />
        +{diff.toFixed(1)}kg
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: 'var(--color-info)' }}>
        <TrendingDown size={13} />
        {diff.toFixed(1)}kg
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
      <Minus size={13} />
      변화없음
    </span>
  );
}

export default function TrackingPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchLogs = useCallback(async (petId: string) => {
    const data = await getHealthLogs(petId);
    setLogs(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }

      const petList = await getUserPets();
      setPets(petList);
      if (petList.length > 0) {
        setSelectedPetId(petList[0].id);
        await fetchLogs(petList[0].id);
      }
      setLoading(false);
    };
    init();
  }, [router, fetchLogs]);

  const handlePetChange = async (petId: string) => {
    setSelectedPetId(petId);
    setLogs([]);
    await fetchLogs(petId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !weight) return;
    setSaving(true);

    await saveHealthLogFromTracking(selectedPetId, parseFloat(weight), date);

    setWeight('');
    await fetchLogs(selectedPetId);
    setSaving(false);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>불러오는 중...</p>
    </div>
  );

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const latest = logs[logs.length - 1];
  const chartData = logs.map((log) => ({
    date: new Date(log.recorded_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    체중: log.weight,
    RER: Math.round(log.rer),
    MER: Math.round(log.mer),
  }));
  const axisStyle = { fontSize: 11, fill: 'var(--color-text-muted)' } as const;

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>체중 & 칼로리 추적</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            체중 변화와 권장 칼로리를 한눈에 확인하세요
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* Pet selector */}
        {pets.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed p-10 text-center space-y-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-4xl">🐾</p>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>등록된 반려동물이 없어요</p>
            <button
              onClick={() => router.push('/pets/new')}
              className="rounded-xl px-5 py-2 text-sm font-medium text-white"
              style={{ background: 'var(--color-primary-500)' }}
            >
              반려동물 등록하기
            </button>
          </div>
        ) : (
          <>
            {/* Pet tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => handlePetChange(pet.id)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    background: selectedPetId === pet.id ? 'var(--color-primary-500)' : 'var(--color-surface)',
                    color: selectedPetId === pet.id ? '#fff' : 'var(--color-text-secondary)',
                    border: `1px solid ${selectedPetId === pet.id ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                  }}
                >
                  {pet.species === 'dog' ? '🐶' : '🐱'}
                  {pet.name}
                </button>
              ))}
            </div>

            {/* Summary cards */}
            {latest ? (
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-2xl border p-4 space-y-2"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <Scale size={18} style={{ color: 'var(--color-primary-500)' }} />
                    <WeightTrendBadge logs={logs} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>현재 체중</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {latest.weight}<span className="text-sm font-normal ml-0.5">kg</span>
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-4 space-y-2"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <Flame size={18} style={{ color: 'var(--color-accent-500)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>RER (기초)</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {Math.round(latest.rer)}<span className="text-xs font-normal ml-0.5">kcal</span>
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-4 space-y-2"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <Flame size={18} style={{ color: 'var(--color-rose)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>MER (유지)</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {Math.round(latest.mer)}<span className="text-xs font-normal ml-0.5">kcal</span>
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl border-2 border-dashed p-8 text-center space-y-2"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <p className="text-3xl">📋</p>
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedPet?.name}의 기록이 없어요
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  아래 폼에서 첫 번째 체중을 기록해보세요!
                </p>
              </div>
            )}

            {/* Log form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border p-5 space-y-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Plus size={18} style={{ color: 'var(--color-primary-500)' }} />
                체중 기록 추가
              </h2>

              {/* Pet selector (dropdown for form context) */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  반려동물
                </label>
                <div className="relative">
                  <select
                    value={selectedPetId ?? ''}
                    onChange={(e) => handlePetChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border px-4 py-2.5 text-sm outline-none pr-9"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    측정일
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    체중 (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="예: 4.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Preview */}
              {weight && parseFloat(weight) > 0 && selectedPet && (
                <div
                  className="rounded-xl p-3 flex items-center justify-between text-sm"
                  style={{ background: 'var(--color-primary-50)' }}
                >
                  <span style={{ color: 'var(--color-text-secondary)' }}>예상 권장 칼로리</span>
                  <span className="font-semibold" style={{ color: 'var(--color-primary-600)' }}>
                    RER {Math.round(calcRer(parseFloat(weight)))} / MER {Math.round(calcMer(parseFloat(weight), selectedPet.species))} kcal
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={!weight || saving}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-80"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {saving ? '저장 중...' : '기록 저장'}
              </button>
            </form>

            {/* Charts */}
            {logs.length > 1 && (
              <div
                className="rounded-2xl border p-5 space-y-6"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedPet?.name} 추세 차트
                </h2>

                {/* Weight chart */}
                <div>
                  <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>체중 변화 (kg)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" tick={axisStyle} />
                      <YAxis tick={axisStyle} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="체중"
                        stroke="var(--color-primary-500)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: 'var(--color-primary-500)' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Calorie chart */}
                <div>
                  <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>권장 칼로리 (kcal)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" tick={axisStyle} />
                      <YAxis tick={axisStyle} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="RER" stroke="var(--color-primary-500)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="MER" stroke="var(--color-accent-500)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* History */}
            {logs.length > 0 && (
              <div
                className="rounded-2xl border"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4"
                >
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    기록 내역 ({logs.length}개)
                  </h2>
                  <ChevronDown
                    size={18}
                    className="transition-transform"
                    style={{
                      color: 'var(--color-text-muted)',
                      transform: showHistory ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </button>

                {showHistory && (
                  <div className="px-5 pb-4">
                    <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                      {[...logs].reverse().map((log, i) => {
                        const prev = logs[logs.length - 1 - i - 1];
                        const diff = prev ? log.weight - prev.weight : null;
                        return (
                          <div
                            key={log.id}
                            className="flex items-center gap-4 py-3 border-b last:border-0 text-sm"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            <span className="w-24 flex-shrink-0 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {new Date(log.recorded_at).toLocaleDateString('ko-KR')}
                            </span>
                            <span className="font-bold w-16" style={{ color: 'var(--color-text-primary)' }}>
                              {log.weight} kg
                            </span>
                            {diff !== null && (
                              <span
                                className="text-xs font-medium w-14"
                                style={{
                                  color: diff > 0 ? 'var(--color-rose)' : diff < 0 ? 'var(--color-info)' : 'var(--color-text-muted)',
                                }}
                              >
                                {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} kg
                              </span>
                            )}
                            <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
                              RER {Math.round(log.rer)} / MER {Math.round(log.mer)} kcal
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
